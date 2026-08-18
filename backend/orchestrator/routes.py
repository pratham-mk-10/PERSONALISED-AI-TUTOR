from collections import Counter
import importlib.util
from pathlib import Path
from typing import Any
from concurrent.futures import ThreadPoolExecutor, as_completed

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response, StreamingResponse
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
        increment_topic_attempt,
        reset_topic_attempt,
        create_user,
        get_user_by_username,
        get_student_topic_progress,
    )
    from database.queries import fetch_descriptive_questions_by_topic
    from database.connection import get_connection
    from database.misconception_catalog import (
        coerce_misconception_tag,
        get_allowed_misconception_tags,
        get_misconception_metadata,
        get_topic_status_map,
        summarize_persistent_weaknesses,
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
        increment_topic_attempt,
        reset_topic_attempt,
        create_user,
        get_user_by_username,
        get_student_topic_progress,
    )
    from backend.database.queries import fetch_descriptive_questions_by_topic
    from backend.database.connection import get_connection
    from backend.database.misconception_catalog import (
        coerce_misconception_tag,
        get_allowed_misconception_tags,
        get_misconception_metadata,
        get_topic_status_map,
        summarize_persistent_weaknesses,
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


def _load_adaptation_agent():
    backend_root = Path(__file__).resolve().parents[1]
    return _load_module(
        "adaptation_agent_module",
        backend_root / "adaptataion-agent" / "adaptation_agent.py",
    )


_adaptation_module = _load_adaptation_agent()
adapt_after_submission = _adaptation_module.adapt_after_submission


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

import bcrypt

class AuthRequest(BaseModel):
    username: str
    password: str



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
    # Optional tag -> trip-count map. When present, question_count is split
    # proportionally across tags (more questions on whichever misconception
    # the student tripped on most) instead of treating every tag equally.
    misconception_weights: dict[str, int] | None = None
    wrong_question_texts: list[str] | None = None
    question_count: int | None = 5
    difficulty: str | None = "easy"


class SubmitAnswersRequest(BaseModel):
    student_id: str | None = None
    topic: str | None = None
    answers: list[dict[str, Any]]
    attempt_number: int | None = 1


class EvaluationRequest(BaseModel):
    student_id: str
    topic: str
    selected_option: str
    correct_option: str
    misconception_map: dict[str, str]


class MisconceptionReasonRequest(BaseModel):
    misconception_tag: str
    topic: str = "reflection_refraction"
    question_text: str | None = None
    student_answer: str | None = None
    correct_answer: str | None = None


class NumericAnswerLogRequest(BaseModel):
    student_id: str
    topic: str = "Mirror Formula and Magnification"
    misconception_tag: str | None = None
    attempt_number: int = 1
    question_text: str | None = None
    student_answer: str | None = None
    correct_answer: str | None = None


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


@router.post("/api/auth/register")
def register_user(data: AuthRequest):
    if not data.username or not data.password:
        raise HTTPException(status_code=400, detail="Username and password required")
    
    existing = get_user_by_username(data.username)
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    hashed = bcrypt.hashpw(data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    try:
        student_id = create_user(data.username, hashed)
        return {"student_id": student_id, "username": data.username}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/auth/login")
def login_user(data: AuthRequest):
    user = get_user_by_username(data.username)
    if not user or not bcrypt.checkpw(data.password.encode('utf-8'), user["password_hash"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    
    return {"student_id": user["student_id"], "username": user["username"]}


@router.get("/api/topics/progress")
def get_topics_progress(student_id: str):
    if not student_id:
        raise HTTPException(status_code=400, detail="Student ID required")
    progress = get_student_topic_progress(student_id)
    return {"progress": progress}





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


def _allocate_question_counts(tags: list[str], weights: dict[str, int], total: int) -> dict[str, int]:
    """Split `total` questions across `tags` proportional to `weights`.

    Tags missing from `weights` default to weight 1, so passing no weights
    at all degrades to a roughly-even split (the prior, unweighted behavior).

    If `total >= len(tags)`: every tag gets at least 1 question, and the
    counts always sum to exactly `total` (largest-remainder rounding).

    If `total < len(tags)` (more distinct misconceptions than questions to
    hand out -- reachable from startMisconceptionQuiz, which can pass more
    unique wrong-answer tags than its capped question_count): only the
    `total` highest-weighted tags get a question (1 each); the rest are
    simply absent from the returned dict rather than forced below 1. Callers
    should treat a missing key as "no dedicated question count," not 0-but-still-a-target.
    """
    if not tags or total <= 0:
        return {}

    tag_weights = [max(weights.get(t, 1), 1) for t in tags]

    if total < len(tags):
        ranked = sorted(range(len(tags)), key=lambda i: tag_weights[i], reverse=True)
        return {tags[i]: 1 for i in ranked[:total]}

    weight_sum = sum(tag_weights)
    raw_shares = [total * w / weight_sum for w in tag_weights]
    counts = [max(1, int(share)) for share in raw_shares]

    remainder = total - sum(counts)
    if remainder > 0:
        # Give the leftover questions to the tags with the largest fractional
        # share first (largest-remainder method), so the biggest misconceptions
        # get the rounding benefit rather than an arbitrary tag.
        order = sorted(range(len(tags)), key=lambda i: raw_shares[i] - int(raw_shares[i]), reverse=True)
        for i in order[:remainder]:
            counts[i] += 1

    return {tags[i]: counts[i] for i in range(len(tags))}


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

    # Coerce weight keys the same way tags are coerced, so raw tags from the
    # client line up with `unique_tags`. Aggregate if two raw tags coerce to
    # the same allowed tag. Non-positive/invalid weights are dropped.
    weights_by_tag: dict[str, int] = {}
    for raw_tag, raw_weight in (payload.misconception_weights or {}).items():
        coerced = coerce_misconception_tag(raw_tag, topic)
        if coerced not in unique_tags:
            continue
        try:
            weight = int(raw_weight)
        except (TypeError, ValueError):
            continue
        if weight > 0:
            weights_by_tag[coerced] = weights_by_tag.get(coerced, 0) + weight

    allocation = _allocate_question_counts(unique_tags, weights_by_tag, requested_count)

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
        if tag in allocation:
            line += f" | Target roughly {allocation[tag]} of the {requested_count} questions on this specific misconception"
        elif weights_by_tag:
            # More distinct misconceptions than questions to hand out -- this
            # tag lost the allocation to higher-weighted ones. Still mention
            # it as lower-priority context rather than pretending it has a
            # dedicated slot.
            line += " | Lower priority than the others above; include only if a question naturally fits"
        focus_lines.append(line)

    tutor_context = "Generate ONLY remedial questions that target these misconceptions:\n"
    tutor_context += "\n".join(focus_lines)
    if weights_by_tag:
        tutor_context += (
            "\nThe target counts above reflect how often the student actually tripped on each "
            "misconception in past attempts — follow them as closely as possible rather than "
            "splitting evenly across all misconceptions."
        )
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
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {
        "questions": questions,
        "target_misconceptions": unique_tags,
        "question_allocation": allocation if weights_by_tag else None,
        "mode": "remedial-misconception-quiz",
    }


@router.post("/submit-answers")
def submit_answers(data: SubmitAnswersRequest):
    student_id = data.student_id or "guest"
    topic = data.topic or "reflection_refraction"
    topic_key = topic_key_for(topic)
    # Enable personalized LLM feedback for all core physics topics
    use_llm_feedback = topic_key in {"laws_of_reflection", "reflection_of_light", "spherical_mirrors", "refraction"}

    tags: list[str] = []
    wrong_entries: list[dict[str, Any]] = []
    total = 0
    correct = 0
    db_sync_warning = None
    refined_tags: dict[int, str] = {}

    # Pass 1 (fast, synchronous): work out correctness and collect the wrong
    # answers whose tag is generic and needs an LLM classification call.
    provisional_wrong: dict[int, dict[str, Any]] = {}
    pending_classification: dict[int, dict[str, str]] = {}

    for idx, ans in enumerate(data.answers):
        selected_raw = ans.get("selected")
        correct_raw = ans.get("correct")
        if selected_raw is None or correct_raw is None:
            continue

        selected = str(selected_raw)
        correct_ans = str(correct_raw)
        is_correct = selected == correct_ans

        total += 1
        if is_correct:
            correct += 1
            continue

        misconception_map = ans.get("misconception_map") or ans.get("misconception_tags") or {}
        tag = (
            misconception_map.get(selected)
            or misconception_map.get(str(selected_raw))
            or ans.get("misconception_tag")
            or "general_concept_gap"
        )
        question_text = str(ans.get("question_text") or "").strip()

        provisional_wrong[idx] = {
            "question_id": ans.get("question_id"),
            "question_text": question_text,
            "tag": tag,
            "selected": selected_raw,
            "correct": correct_raw,
            "options": ans.get("options"),
        }

        if callable(_classify_misconception_tag) and str(tag).strip() in {
            "",
            "no_concept",
            "general_concept_gap",
        }:
            selected_text = selected
            correct_text = correct_ans
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
            pending_classification[idx] = {
                "question_text": question_text,
                "selected_text": selected_text,
                "correct_text": correct_text,
            }

    # Pass 2 (parallel): resolve generic tags via LLM classification all at
    # once instead of one sequential network round-trip per wrong answer.
    if pending_classification:
        allowed_tags_for_topic = _allowed_misconceptions_for_topic(topic)

        def _classify(idx, ctx):
            try:
                auto_tag = _classify_misconception_tag(
                    topic or "Laws of Reflection",
                    ctx["question_text"],
                    ctx["selected_text"],
                    ctx["correct_text"],
                    allowed_tags=allowed_tags_for_topic,
                )
                return idx, auto_tag
            except Exception:
                return idx, None

        with ThreadPoolExecutor(max_workers=5) as executor:
            futures = [
                executor.submit(_classify, idx, ctx) for idx, ctx in pending_classification.items()
            ]
            for future in as_completed(futures):
                idx, auto_tag = future.result()
                if isinstance(auto_tag, str) and auto_tag.strip():
                    provisional_wrong[idx]["tag"] = auto_tag.strip()

    # Pass 3 (fast, synchronous): finalize tags and log behavior in original order.
    for idx, ans in enumerate(data.answers):
        selected_raw = ans.get("selected")
        correct_raw = ans.get("correct")
        if selected_raw is None or correct_raw is None:
            continue

        selected = str(selected_raw)
        correct_ans = str(correct_raw)
        is_correct = selected == correct_ans

        tag = None
        if not is_correct:
            entry = provisional_wrong[idx]
            tag = coerce_misconception_tag(entry["tag"], topic)
            entry["tag"] = tag
            refined_tags[idx] = tag
            tags.append(tag)
            wrong_entries.append(entry)

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

    # Increment server-side attempt count; get verified attempt number
    server_attempt = data.attempt_number or 1
    try:
        if data.attempt_number == 1:
            reset_topic_attempt(student_id, topic_key)
        server_attempt = increment_topic_attempt(student_id, topic_key)
    except Exception:
        server_attempt = data.attempt_number or 1

    exclude_ids = []
    for a in data.answers:
        qid = a.get("question_id")
        if qid is not None and str(qid).isdigit():
            exclude_ids.append(int(qid))

    # Get adaptation strategy
    adaptation = adapt_after_submission(
        main_misconception=main_misconception,
        topic=topic,
        attempt_number=server_attempt,
        exclude_ids=exclude_ids,
        limit=5,
    )
    follow_up_strategy = adaptation.get("strategy", "visual_only")
    should_redirect_to_lesson = adaptation.get("should_redirect_to_lesson", False)

    explanations_by_idx: dict[int, str] = {}
    if use_llm_feedback:
        def _fetch_explanation(entry, q_idx):
            tag = entry["tag"]
            try:
                sel_opt = entry.get("selected")
                corr_opt = entry.get("correct")
                opts = entry.get("options")
                sel_text = None
                corr_text = None
                if opts and isinstance(opts, list):
                    try:
                        sel_idx = int(sel_opt)
                        corr_idx = int(corr_opt)
                        if 0 <= sel_idx < len(opts):
                            sel_text = str(opts[sel_idx])
                        if 0 <= corr_idx < len(opts):
                            corr_text = str(opts[corr_idx])
                    except (ValueError, TypeError):
                        pass

                explanation_data = content_agent.generate(
                    subtopic=topic,
                    misconception_tag=tag,
                    attempt=server_attempt,
                    question_text=entry.get("question_text") or None,
                    student_answer=sel_text or (str(sel_opt) if sel_opt is not None else None),
                    correct_answer=corr_text or (str(corr_opt) if corr_opt is not None else None),
                )
                return q_idx, tag, explanation_data.get("explanation") or _get_misconception_explanation(tag) or "Review this concept carefully."
            except Exception:
                return q_idx, tag, _get_misconception_explanation(tag) or "Review this concept carefully."
        
        with ThreadPoolExecutor(max_workers=5) as executor:
            future_to_idx = {
                executor.submit(_fetch_explanation, entry, idx): idx
                for idx, entry in enumerate(wrong_entries)
            }
            for future in as_completed(future_to_idx):
                idx = future_to_idx[future]
                try:
                    res_idx, res_tag, exp = future.result(timeout=30)
                    explanations_by_idx[res_idx] = exp
                except Exception:
                    # fallback
                    tag = wrong_entries[idx]["tag"]
                    explanations_by_idx[idx] = _get_misconception_explanation(tag) or "Review this concept carefully."

    explanation = None
    visual_payload = None
    if main_misconception != "none":
        # Find the first explanation matching the main misconception
        for idx, entry in enumerate(wrong_entries):
            if entry["tag"] == main_misconception and idx in explanations_by_idx:
                explanation = explanations_by_idx[idx]
                break
                
        if not explanation:
            if use_llm_feedback:
                try:
                    explanation_data = content_agent.generate(
                        subtopic=topic,
                        misconception_tag=main_misconception,
                        attempt=server_attempt,
                    )
                    explanation = explanation_data.get("explanation")
                except Exception:
                    pass
        if not explanation:
            explanation = _get_misconception_explanation(main_misconception)
        visual_payload = {
            "svg_component": pick_svg_template(topic, main_misconception),
            "svg_variant": pick_svg_variant(main_misconception),
        }

    level = "beginner"
    acc = correct / total if total else 0
    if acc > 0.7:
        level = "advanced"
    elif acc > 0.4:
        level = "intermediate"

    try:
        set_student_current_topic(student_id, topic)
        update_student_level(student_id, level)
        update_student_topic_resolution(student_id, topic, main_misconception)
    except Exception as exc:
        db_sync_warning = str(exc)

    # Keep submit fast; front-end already has dedicated question-generation calls.
    follow_up = []

    question_feedback = []
    wrong_entry_idx = 0
    for idx, ans in enumerate(data.answers):
        selected = ans.get("selected")
        correct_ans = ans.get("correct")
        if str(selected) == str(correct_ans):
            continue

        tag = refined_tags.get(idx) or coerce_misconception_tag(
            (ans.get("misconception_map") or ans.get("misconception_tags") or {}).get(selected)
            or (ans.get("misconception_map") or ans.get("misconception_tags") or {}).get(str(selected))
            or ans.get("misconception_tag")
            or "general_concept_gap",
            topic,
        )
        
        reason_text = explanations_by_idx.get(wrong_entry_idx) if use_llm_feedback else _get_misconception_explanation(tag)
        wrong_entry_idx += 1
        
        if not reason_text:
            reason_text = _get_misconception_explanation(tag)

        reason_text = reason_text or "Review this concept carefully."
        question_feedback.append(
            {
                "question_id": ans.get("question_id"),
                "question_text": ans.get("question_text"),
                "reason": " ".join(str(reason_text or "").split()),
                "focus_area": tag,
                "svg_component": pick_svg_template(topic, tag),
                "svg_variant": pick_svg_variant(tag),
            }
        )

    return {
        "main_misconception": main_misconception,
        "level": level,
        "reason": _trim_feedback(explanation or "Review the concept carefully."),
        "focus_area": "N/A" if main_misconception == "none" else main_misconception,
        "misconception_explanation": _trim_feedback(explanation or "Review the concept carefully."),
        "svg_component": (visual_payload or {}).get("svg_component"),
        "svg_variant": (visual_payload or {}).get("svg_variant"),
        "question_feedback": question_feedback,
        "db_sync_warning": db_sync_warning,
        "questions": follow_up,
        "follow_up_strategy": follow_up_strategy,
        "should_redirect_to_lesson": should_redirect_to_lesson,
        "attempt_number": server_attempt,
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


@router.get("/student/{student_id}/memory")
def get_student_memory_route(student_id: str):
    """Cross-session misconception memory: every unresolved topic ranked by
    weakness (most struggled first), for a single "you tripped in these
    topics" dashboard entry + a weighted retest quiz per topic. Also returns
    a green/yellow/red status map covering every topic the student has
    attempted (including completed ones), so the Dashboard can color every
    topic card from this one fetch instead of a second round-trip."""
    try:
        student = get_student_record(student_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    misconceptions = student.get("misconceptions")
    completed_topics = student.get("completed_topics")
    unresolved_topics = student.get("unresolved_topics")

    status_map = get_topic_status_map(misconceptions, completed_topics, unresolved_topics)
    weaknesses = summarize_persistent_weaknesses(misconceptions, unresolved_topics)

    if not weaknesses:
        return {"has_memory": False, "topics": [], "status_map": status_map}

    topics = []
    for w in weaknesses:
        topic_title = w["topic_title"]
        weak_tag_title = w["weak_tag_title"]
        if weak_tag_title:
            message = f"Last time you struggled with {weak_tag_title} in {topic_title}."
        else:
            message = f"You didn't fully clear {topic_title} last time."
        topics.append(
            {
                "topic_title": topic_title,
                "weak_tag": w["weak_tag"],
                "weak_tag_title": weak_tag_title,
                "tag_breakdown": w["tag_breakdown"],
                "severity": w["severity"],
                "message": message,
            }
        )

    return {"has_memory": True, "topics": topics, "status_map": status_map}


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


from fastapi.responses import Response

@router.post("/submit-numeric-answer")
def submit_numeric_answer(req: NumericAnswerLogRequest):
    """Logs a single numeric-Try-stage attempt (Mirror Formula) and, once a
    student has tripped the same tag more than once, fetches an attempt-paced
    explanation via the same ContentAgent pipeline /submit-answers uses for
    MCQ. Correctness itself is already determined client-side (deterministic
    physics via MirrorPhysicsEngine.js) -- this endpoint only logs + explains.
    """
    tag = coerce_misconception_tag(req.misconception_tag, req.topic) if req.misconception_tag else None

    try:
        log_student_behavior(
            student_id=req.student_id,
            topic=req.topic,
            selected_option=req.student_answer or "numeric_response",
            correct_option=req.correct_answer or "n/a",
            is_correct=tag is None,
            misconception_tag=tag,
        )
    except Exception:
        pass

    explanation = None
    if tag and req.attempt_number >= 2:
        try:
            explanation_data = content_agent.generate(
                subtopic=req.topic,
                misconception_tag=tag,
                attempt=req.attempt_number,
                question_text=req.question_text,
                student_answer=req.student_answer,
                correct_answer=req.correct_answer,
            )
            explanation = explanation_data.get("explanation")
        except Exception:
            explanation = None
    if tag and not explanation:
        explanation = _get_misconception_explanation(tag)

    try:
        update_student_topic_resolution(req.student_id, req.topic, tag or "none")
    except Exception:
        pass

    return {"explanation": explanation, "misconception_tag": tag}

@router.get("/api/tts")
async def text_to_speech(text: str, voice: str = "en-IN-PrabhatNeural"):
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    
    try:
        import edge_tts
        import re
    except ImportError:
        raise HTTPException(status_code=500, detail="edge-tts package is not installed. Please run 'pip install edge-tts'.")

    # Fix TTS mispronouncing "angles" as "angels"
    tts_text = re.sub(r'\bangles\b', 'an-gles', text, flags=re.IGNORECASE)

    try:
        communicate = edge_tts.Communicate(tts_text, voice)
        
        audio_data = bytearray()
        print("Starting stream...")
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data.extend(chunk["data"])
        print("Finished stream, total bytes:", len(audio_data))

        return Response(content=bytes(audio_data), media_type="audio/mpeg")
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

