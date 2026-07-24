from collections import Counter
import importlib.util
from pathlib import Path
from typing import Any
from concurrent.futures import ThreadPoolExecutor, as_completed

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

try:
    from database.models import (
        get_student as get_student_record,
        get_student_profile,
        log_student_behavior,
        set_student_current_topic,
        update_student_level,
        update_student_topic_resolution,
        get_descriptive_question,
    )
    from database.queries import fetch_descriptive_questions_by_topic
    from database.connection import get_connection
    from database.misconception_catalog import (
        coerce_misconception_tag,
        get_allowed_misconception_tags,
        get_misconception_metadata,
        topic_key_for,
    )
    from assesment_agent.evaluator import Evaluator
    from assesment_agent.descriptive_evaluator import DescriptiveEvaluator
    from assesment_agent.question_gen import SYLLABUS_SCOPE, generate_questions
except ImportError:
    from backend.database.models import (
        get_student as get_student_record,
        get_student_profile,
        log_student_behavior,
        set_student_current_topic,
        update_student_level,
        update_student_topic_resolution,
        get_descriptive_question,
    )
    from backend.database.queries import fetch_descriptive_questions_by_topic
    from backend.database.connection import get_connection
    from backend.database.misconception_catalog import (
        coerce_misconception_tag,
        get_allowed_misconception_tags,
        get_misconception_metadata,
        topic_key_for,
    )
    from backend.assesment_agent.evaluator import Evaluator
    from backend.assesment_agent.descriptive_evaluator import DescriptiveEvaluator
    from backend.assesment_agent.question_gen import SYLLABUS_SCOPE, generate_questions



def _load_module(module_name: str, file_path: Path):
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Unable to load module from {file_path}")

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def _load_adaptation_feedback_module():
    backend_root = Path(__file__).resolve().parents[1]
    return _load_module(
        "adaptation_feedback_trigger",
        backend_root / "adaptataion-agent" / "feedback_trigger.py",
    )


def _load_content_agent_class():
    backend_root = Path(__file__).resolve().parents[1]
    module = _load_module(
        "content_agent_module",
        backend_root / "content-agent" / "content_agent.py",
    )
    return module


_adaptation_feedback = _load_adaptation_feedback_module()
generate_reasoning = _adaptation_feedback.generate_reasoning
_classify_misconception_tag = getattr(_adaptation_feedback, "classify_misconception_tag", None)


def _get_misconception_explanation(tag: str | None) -> str | None:
    if not tag:
        return None

    meta = get_misconception_metadata(tag) or get_misconception_metadata("general_concept_gap")
    text = meta.get("explanation") if isinstance(meta, dict) else None

    if isinstance(text, str) and text.strip():
        cleaned = " ".join(text.split())
        if cleaned:
            return cleaned

    readable = str(tag).strip().replace("_", " ")
    return f"This attempt suggests a misconception related to: {readable}. Review this idea once more and connect it to the formal law of reflection."


def _allowed_misconceptions_for_topic(topic: str | None) -> list[str]:
    return get_allowed_misconception_tags(topic)


router = APIRouter()
evaluator = Evaluator()
descriptive_evaluator = DescriptiveEvaluator()

_content_agent_module = _load_content_agent_class()
ContentAgent = _content_agent_module.ContentAgent
get_template_quiz_scope = getattr(_content_agent_module, "get_template_quiz_scope", lambda _template: {"taught_concepts": [], "untaught_concepts": []})
pick_svg_template = getattr(_content_agent_module, "pick_svg_template", lambda _topic, _tag=None: None)
pick_svg_variant = getattr(_content_agent_module, "pick_svg_variant", lambda _tag=None: None)
content_agent = ContentAgent(get_connection)


class GetQuestionsRequest(BaseModel):
    student_id: str | None = None
    topic: str | None = None
    asked_question_ids: list[int | None] | None = None
    limit: int | None = 5


class GenerateQuestionsRequest(BaseModel):
    topic: str | None = None
    difficulty: str | None = "easy"
    syllabus_scope: str | None = None
    question_count: int | None = None
    tutor_context: str | None = None
    video_template: str | None = None
    taught_concepts: list[str] | None = None
    untaught_concepts: list[str] | None = None
    lesson_content: str | None = None


class GenerateMisconceptionQuizRequest(BaseModel):
    student_id: str | None = None
    topic: str | None = None
    misconception_tags: list[str] | None = None
    wrong_question_texts: list[str] | None = None
    question_count: int | None = 5
    difficulty: str | None = "easy"


class SubmitAnswersRequest(BaseModel):
    student_id: str | None = None
    topic: str | None = None
    answers: list[dict[str, Any]]


class EvaluationRequest(BaseModel):
    student_id: str
    topic: str
    selected_option: str
    correct_option: str
    misconception_map: dict[str, str]


class MisconceptionReasonRequest(BaseModel):
    misconception_tag: str
    topic: str = "reflection_refraction"


def _difficulty_from_level(level: str | None) -> str:
    level = str(level or "beginner").lower()
    if level == "advanced":
        return "hard"
    if level == "intermediate":
        return "medium"
    return "easy"


def _trim_feedback(text: str, max_len: int = 520) -> str:
    cleaned = " ".join(str(text or "").split())
    if len(cleaned) <= max_len:
        return cleaned
    return cleaned[: max_len - 3].rstrip() + "..."


@router.post("/get-questions")
def get_questions(data: GetQuestionsRequest | None = None):
    topic = data.topic if data else "reflection_refraction"
    difficulty = "easy"

    if data and data.student_id:
        try:
            student = get_student_record(data.student_id)
            difficulty = _difficulty_from_level(student.get("level"))
        except Exception:
            difficulty = "easy"

    questions = generate_questions(topic, difficulty)
    return {"questions": questions[:5]}


@router.post("/generate-questions")
def generate_questions_route(data: GenerateQuestionsRequest | None = None):
    payload = data or GenerateQuestionsRequest()
    taught_concepts = payload.taught_concepts
    untaught_concepts = payload.untaught_concepts

    if payload.video_template and (not taught_concepts or not untaught_concepts):
        scope_profile = get_template_quiz_scope(payload.video_template) or {}
        if not taught_concepts:
            taught_concepts = scope_profile.get("taught_concepts") or []
        if not untaught_concepts:
            untaught_concepts = scope_profile.get("untaught_concepts") or []

    try:
        questions = generate_questions(
            topic=payload.topic or "Laws of Reflection",
            difficulty=payload.difficulty or "easy",
            syllabus_scope=payload.syllabus_scope or SYLLABUS_SCOPE,
            question_count=payload.question_count,
            tutor_context=payload.tutor_context,
            taught_concepts=taught_concepts,
            untaught_concepts=untaught_concepts,
            lesson_content=payload.lesson_content,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {"questions": questions}


def _retag_questions_for_misconceptions(questions: list[dict[str, Any]], misconception_tags: list[str], topic: str | None) -> list[dict[str, Any]]:
    if not misconception_tags:
        return questions

    normalized_tags = [coerce_misconception_tag(tag, topic) for tag in misconception_tags if str(tag or "").strip()]
    if not normalized_tags:
        return questions

    for q in questions:
        options = q.get("options") or []
        correct_idx = q.get("correct")
        if not isinstance(options, list) or not isinstance(correct_idx, int):
            continue

        updated_map: dict[str, str] = {}
        tag_idx = 0
        for idx in range(len(options)):
            if idx == correct_idx:
                continue
            updated_map[str(idx)] = normalized_tags[tag_idx % len(normalized_tags)]
            tag_idx += 1

        if updated_map:
            q["misconception_map"] = updated_map

    return questions


@router.post("/generate-misconception-quiz")
def generate_misconception_quiz_route(data: GenerateMisconceptionQuizRequest | None = None):
    payload = data or GenerateMisconceptionQuizRequest()
    topic = payload.topic or "Laws of Reflection"
    requested_count = payload.question_count if isinstance(payload.question_count, int) else 5
    requested_count = max(2, min(requested_count, 10))

    misconception_tags = [
        coerce_misconception_tag(tag, topic)
        for tag in (payload.misconception_tags or [])
        if str(tag or "").strip()
    ]

    if not misconception_tags:
        raise HTTPException(status_code=400, detail="No misconception tags provided for remedial quiz generation")

    unique_tags = []
    seen = set()
    for tag in misconception_tags:
        if tag in seen:
            continue
        seen.add(tag)
        unique_tags.append(tag)

    wrong_texts = [str(item).strip() for item in (payload.wrong_question_texts or []) if str(item).strip()]
    focus_lines = []
    for tag in unique_tags:
        meta = get_misconception_metadata(tag) or {}
        title = str(meta.get("title") or tag).strip()
        explanation = str(meta.get("explanation") or "").strip()
        focus_area = str(meta.get("focus_area") or "").strip()
        line = f"- {tag}: {title}"
        if explanation:
            line += f" | {explanation}"
        if focus_area:
            line += f" | Focus: {focus_area}"
        focus_lines.append(line)

    tutor_context = "Generate ONLY remedial questions that target these misconceptions:\n"
    tutor_context += "\n".join(focus_lines)
    if wrong_texts:
        tutor_context += "\nUse these previously incorrect question themes for context:\n"
        tutor_context += "\n".join(f"- {text}" for text in wrong_texts[:8])
    tutor_context += "\nDo not ask unrelated concepts outside these misconception targets."

    try:
        questions = generate_questions(
            topic=topic,
            difficulty=payload.difficulty or "easy",
            syllabus_scope=SYLLABUS_SCOPE,
            question_count=requested_count,
            tutor_context=tutor_context,
            taught_concepts=None,
            untaught_concepts=None,
        )
        questions = _retag_questions_for_misconceptions(questions, unique_tags, topic)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {
        "questions": questions,
        "target_misconceptions": unique_tags,
        "mode": "remedial-misconception-quiz",
    }




@router.post("/submit-answers")
def submit_answers(data: SubmitAnswersRequest):
    student_id = data.student_id or "guest"
    topic = data.topic or "reflection_refraction"
    topic_key = topic_key_for(topic)
    # Enable personalized LLM feedback for all core physics topics
    use_llm_feedback = topic_key in {"laws_of_reflection", "spherical_mirrors", "refraction"}

    tags: list[str] = []
    wrong_entries: list[dict[str, Any]] = []
    total = 0
    correct = 0
    db_sync_warning = None

    classification_tasks = {} # i -> args
    parsed_answers = []

    for i, ans in enumerate(data.answers):
        selected_raw = ans.get("selected")
        correct_raw = ans.get("correct")
        if selected_raw is None or correct_raw is None:
            continue

        selected = str(selected_raw)
        correct_ans = str(correct_raw)
        is_correct = selected == correct_ans

        tag = "general_concept_gap"
        question_text = str(ans.get("question_text") or "").strip()
        selected_text = selected
        correct_text = correct_ans

        if not is_correct:
            misconception_map = ans.get("misconception_map") or ans.get("misconception_tags") or {}
            tag = (
                misconception_map.get(selected)
                or misconception_map.get(str(selected_raw))
                or ans.get("misconception_tag")
                or "general_concept_gap"
            )

            if callable(_classify_misconception_tag) and str(tag).strip() in {
                "",
                "no_concept",
                "general_concept_gap",
            }:
                options = ans.get("options")
                if options and isinstance(options, list):
                    try:
                        sel_idx = int(selected_raw)
                        corr_idx = int(correct_raw)
                        if 0 <= sel_idx < len(options):
                            selected_text = str(options[sel_idx])
                        if 0 <= corr_idx < len(options):
                            correct_text = str(options[corr_idx])
                    except (ValueError, TypeError):
                        pass

                classification_tasks[i] = {
                    "question_text": question_text,
                    "student_answer": selected_text,
                    "correct_answer": correct_text
                }

        parsed_answers.append({
            "idx": i,
            "ans": ans,
            "selected_raw": selected_raw,
            "correct_raw": correct_raw,
            "selected": selected,
            "correct_ans": correct_ans,
            "is_correct": is_correct,
            "tag": tag,
            "question_text": question_text
        })

    # Run LLM classification in a single batch call to avoid rate limits (HTTP 429)
    classified_results = {}
    if classification_tasks:
        classify_misconception_tags_batch = getattr(_adaptation_feedback, "classify_misconception_tags_batch", None)
                
        if classify_misconception_tags_batch:
            items_list = []
            idx_map = {}
            for idx, item in classification_tasks.items():
                idx_map[len(items_list)] = idx
                items_list.append(item)
            
            batch_results = classify_misconception_tags_batch(
                topic or "Laws of Reflection",
                items_list,
                _allowed_misconceptions_for_topic(topic)
            )
            for list_idx, tag in batch_results.items():
                if int(list_idx) in idx_map:
                    real_idx = idx_map[int(list_idx)]
                    classified_results[real_idx] = tag

    for item in parsed_answers:
        idx = item["idx"]
        ans = item["ans"]
        selected = item["selected"]
        correct_ans = item["correct_ans"]
        is_correct = item["is_correct"]
        tag = item["tag"]

        total += 1
        if is_correct:
            correct += 1
        else:
            if idx in classified_results:
                tag = classified_results[idx]

            tag = coerce_misconception_tag(tag, topic)
            tags.append(tag)
            wrong_entries.append(
                {
                    "question_id": ans.get("question_id"),
                    "question_text": item["question_text"],
                    "tag": tag,
                    "selected": item["selected_raw"],
                    "correct": item["correct_raw"],
                    "options": ans.get("options"),
                }
            )

        if not db_sync_warning:
            try:
                log_student_behavior(
                    student_id=student_id,
                    topic=topic,
                    selected_option=selected,
                    correct_option=correct_ans,
                    is_correct=is_correct,
                    misconception_tag=None if is_correct else tag,
                )
            except Exception as exc:
                db_sync_warning = str(exc)

    main_misconception = Counter(tags).most_common(1)[0][0] if tags else "none"

    explanations_by_tag: dict[str, str] = {}
    visuals_by_tag: dict[str, dict] = {}
    
    explanation = None
    visual_payload = None
    
    if main_misconception != "none":
        explanation = _get_misconception_explanation(main_misconception)
        
        if not visual_payload:
            visual_payload = {}
            
        visual_payload["svg_component"] = pick_svg_template(topic, main_misconception)
        visual_payload["svg_variant"] = pick_svg_variant(main_misconception)

    level = "beginner"
    acc = correct / total if total else 0
    if acc > 0.7:
        level = "advanced"
    elif acc > 0.4:
        level = "intermediate"

    if not db_sync_warning:
        try:
            set_student_current_topic(student_id, topic)
            update_student_level(student_id, level)
            update_student_topic_resolution(student_id, topic, main_misconception)
        except Exception as exc:
            db_sync_warning = str(exc)

    # Keep submit fast; front-end already has dedicated question-generation calls.
    follow_up = []

    question_feedback = []
    for ans in data.answers:
        selected = ans.get("selected")
        correct_ans = ans.get("correct")
        if str(selected) == str(correct_ans):
            continue

        mapping = ans.get("misconception_map") or ans.get("misconception_tags") or {}
        tag = (
            mapping.get(selected)
            or mapping.get(str(selected))
            or ans.get("misconception_tag")
            or "general_concept_gap"
        )
        tag = coerce_misconception_tag(tag, topic)
        reason_text = explanations_by_tag.get(tag) if use_llm_feedback else _get_misconception_explanation(tag)
        if not reason_text:
            reason_text = _get_misconception_explanation(tag)

        reason_text = reason_text or "Review this concept carefully."
        tag_visuals = visuals_by_tag.get(tag) or {}
        
        question_feedback.append(
            {
                "question_id": ans.get("question_id"),
                "question_text": ans.get("question_text"),
                "reason": " ".join(str(reason_text or "").split()),
                "focus_area": tag,
                "svg_component": tag_visuals.get("svg_component") or pick_svg_template(topic, tag),
                "svg_variant": tag_visuals.get("svg_variant") or pick_svg_variant(tag),
                "animation_parameters": tag_visuals.get("animation_parameters"),
            }
        )

    return {
        "main_misconception": main_misconception,
        "level": level,
        "reason": _trim_feedback(explanation or "Review the concept carefully."),
        "focus_area": "N/A" if main_misconception == "none" else main_misconception,
        "misconception_explanation": _get_misconception_explanation(main_misconception),
        "svg_component": (visual_payload or {}).get("svg_component"),
        "svg_variant": (visual_payload or {}).get("svg_variant"),
        "animation_parameters": (visual_payload or {}).get("animation_parameters"),
        "question_feedback": question_feedback,
        "db_sync_warning": db_sync_warning,
        "questions": follow_up,
    }


@router.post("/evaluate")
def evaluate_answer(req: EvaluationRequest):
    return evaluator.evaluate(
        student_id=req.student_id,
        selected_option=req.selected_option,
        correct_option=req.correct_option,
        misconception_map=req.misconception_map,
        topic=req.topic,
    )


class DescriptiveEvaluationRequest(BaseModel):
    student_id: str
    question_id: int
    student_answer: str


@router.get("/descriptive-questions/{topic}")
def get_descriptive_questions_route(topic: str):
    """Retrieve descriptive questions by topic."""
    questions = fetch_descriptive_questions_by_topic(topic)
    return {"questions": questions}


@router.post("/eval/descriptive")
def evaluate_descriptive_answer_route(req: DescriptiveEvaluationRequest):
    """Evaluate a descriptive text answer using the v5.0 Unified LLM pipeline."""
    # 1. Fetch descriptive question details
    question = get_descriptive_question(req.question_id)
    if not question:
        raise HTTPException(status_code=404, detail="Descriptive question not found")

    # 2. Get allowed misconception tags for the topic
    allowed_tags = get_allowed_misconception_tags(question["topic"])

    # 3. Call descriptive evaluator
    result = descriptive_evaluator.evaluate_answer(
        student_id=req.student_id,
        question_id=req.question_id,
        question=question["question_text"],
        student_answer=req.student_answer,
        rubric_items=question["rubric_items"],
        known_misconceptions=allowed_tags,
        required_keywords=question["required_keywords"]
    )

    # 4. Extract scores and calculate weighted final score (70% Understanding, 25% Completeness, 5% Keywords)
    scores = result.get("scores", {})
    understanding = scores.get("understanding", 0)
    completeness = scores.get("completeness", 0)
    keywords = scores.get("keywords", 0)
    
    weighted_score = (understanding * 0.70) + (completeness * 0.25) + (keywords * 0.05)

    # 5. Log behavior event
    tag = result.get("misconception_tag")
    is_correct = understanding >= 8

    
    try:
        log_student_behavior(
            student_id=req.student_id,
            topic=question["topic"],
            selected_option="descriptive_response",
            correct_option="n/a",
            is_correct=is_correct,
            misconception_tag=tag
        )
        
        # 6. Update student level
        level = "beginner"
        if weighted_score >= 8.0:
            level = "advanced"
        elif weighted_score >= 5.0:
            level = "intermediate"
            
        update_student_level(req.student_id, level)
        set_student_current_topic(req.student_id, question["topic"])
        update_student_topic_resolution(req.student_id, question["topic"], tag)
    except Exception as exc:
        print(f"Failed to update student profile / log behavior: {exc}")

    return {
        "evaluation": result,
        "weighted_score": weighted_score,
        "is_correct": is_correct
    }



@router.get("/student/{student_id}")
def get_student_route(student_id: str):
    try:
        profile = get_student_profile(student_id)
        return profile or {"student": None, "behavior": []}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/debug/allowed-misconceptions")
def debug_allowed_misconceptions(topic: str | None = "Laws of Reflection"):
    """Sanity endpoint: inspect allowed misconception tags for a topic input."""
    resolved_topic = topic or "Laws of Reflection"
    tags = get_allowed_misconception_tags(resolved_topic)
    return {
        "input_topic": topic,
        "resolved_topic": resolved_topic,
        "topic_key": topic_key_for(resolved_topic),
        "allowed_misconception_tags": tags,
        "count": len(tags),
    }


@router.post("/misconception-reason")
def misconception_reason(req: MisconceptionReasonRequest):
    if req.misconception_tag == "none":
        return {
            "reason": "Great work. Keep practicing to strengthen your understanding.",
            "focus_area": "N/A",
        }

    reasoning = generate_reasoning(req.misconception_tag, req.topic)
    
    # If the LLM failed (e.g. quota exceeded), use the DB fallback
    if "quota exceeded" in reasoning.get("reason", "").lower() or "unauth" in reasoning.get("reason", "").lower() or "unavailable" in reasoning.get("reason", "").lower():
        explanation = _get_misconception_explanation(req.misconception_tag)
        if explanation:
            return {
                "reason": _trim_feedback(explanation),
                "focus_area": req.misconception_tag,
            }

    return {
        "reason": _trim_feedback(reasoning.get("reason", "Review the concept carefully.")),
        "focus_area": reasoning.get("focus_area", req.misconception_tag),
    }


class GenerateVisualFixRequest(BaseModel):
    topic: str
    misconception_tag: str
    question_text: str | None = None
    student_answer: str | None = None
    correct_answer: str | None = None

@router.post("/generate-visual-fix")
def generate_visual_fix(req: GenerateVisualFixRequest):
    try:
        explanation_data = content_agent.generate(
            subtopic=req.topic,
            misconception_tag=req.misconception_tag,
            attempt=2,
            question_text=req.question_text,
            student_answer=req.student_answer,
            correct_answer=req.correct_answer,
        )
        return {
            "explanation": explanation_data.get("explanation") or _get_misconception_explanation(req.misconception_tag),
            "animation_parameters": explanation_data.get("animation_parameters"),
            "svg_component": explanation_data.get("svg_component"),
            "svg_variant": explanation_data.get("svg_variant")
        }
    except Exception as e:
        return {
            "explanation": _get_misconception_explanation(req.misconception_tag),
            "animation_parameters": None,
            "svg_component": pick_svg_template(req.topic, req.misconception_tag),
            "svg_variant": pick_svg_variant(req.misconception_tag)
        }



from fastapi.responses import Response

@router.get("/api/tts")
async def text_to_speech(text: str, voice: str = "en-IN-PrabhatNeural"):
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    try:
        import edge_tts
    except ImportError:
        raise HTTPException(status_code=500, detail="edge-tts package is not installed. Please run 'pip install edge-tts'.")

    try:
        communicate = edge_tts.Communicate(text, voice)
        
        audio_data = bytearray()
        print("Starting stream...")
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data.extend(chunk["data"])
        print("Finished stream, total bytes:", len(audio_data))

        return Response(content=bytes(audio_data), media_type="audio/mpeg")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

