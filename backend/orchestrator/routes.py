from collections import Counter
import importlib.util
from pathlib import Path
from typing import Any

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
    )
    from database.connection import get_connection
    from database.misconception_catalog import (
        coerce_misconception_tag,
        get_allowed_misconception_tags,
        get_misconception_metadata,
        topic_key_for,
    )
    from assesment_agent.evaluator import Evaluator
    from assesment_agent.question_gen import SYLLABUS_SCOPE, generate_questions
except ImportError:
    from backend.database.models import (
        get_student as get_student_record,
        get_student_profile,
        log_student_behavior,
        set_student_current_topic,
        update_student_level,
        update_student_topic_resolution,
    )
    from backend.database.connection import get_connection
    from backend.database.misconception_catalog import (
        coerce_misconception_tag,
        get_allowed_misconception_tags,
        get_misconception_metadata,
        topic_key_for,
    )
    from backend.assesment_agent.evaluator import Evaluator
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
    return module.ContentAgent


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
ContentAgent = _load_content_agent_class()
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

    try:
        questions = generate_questions(
            topic=payload.topic or "Laws of Reflection",
            difficulty=payload.difficulty or "easy",
            syllabus_scope=payload.syllabus_scope or SYLLABUS_SCOPE,
            question_count=payload.question_count,
            tutor_context=payload.tutor_context,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc

    return {"questions": questions}


@router.post("/submit-answers")
def submit_answers(data: SubmitAnswersRequest):
    student_id = data.student_id or "guest"
    topic = data.topic or "reflection_refraction"
    topic_key = topic_key_for(topic)
    use_laws_reflection_llm = topic_key == "laws_of_reflection"

    tags: list[str] = []
    wrong_entries: list[dict[str, Any]] = []
    total = 0
    correct = 0
    db_sync_warning = None

    for ans in data.answers:
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
        else:
            misconception_map = ans.get("misconception_map") or ans.get("misconception_tags") or {}
            tag = (
                misconception_map.get(selected)
                or misconception_map.get(str(selected_raw))
                or ans.get("misconception_tag")
                or "general_concept_gap"
            )

            question_text = str(ans.get("question_text") or "").strip()
            if callable(_classify_misconception_tag) and str(tag).strip() in {
                "",
                "no_concept",
                "general_concept_gap",
            }:
                auto_tag = _classify_misconception_tag(
                    topic or "Laws of Reflection",
                    question_text,
                    selected,
                    correct_ans,
                    allowed_tags=_allowed_misconceptions_for_topic(topic),
                )
                if isinstance(auto_tag, str) and auto_tag.strip():
                    tag = auto_tag.strip()

            tag = coerce_misconception_tag(tag, topic)
            tags.append(tag)
            wrong_entries.append(
                {
                    "question_id": ans.get("question_id"),
                    "question_text": question_text,
                    "tag": tag,
                }
            )

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
    if use_laws_reflection_llm:
        for entry in wrong_entries:
            tag = entry["tag"]
            if tag in explanations_by_tag:
                continue
            try:
                explanation_data = content_agent.generate(
                    subtopic=topic,
                    misconception_tag=tag,
                    attempt=2,
                    question_text=entry.get("question_text") or None,
                    student_answer=None,
                    correct_answer=None,
                )
                explanations_by_tag[tag] = explanation_data.get("explanation") or _get_misconception_explanation(tag) or "Review this concept carefully."
            except Exception:
                explanations_by_tag[tag] = _get_misconception_explanation(tag) or "Review this concept carefully."

    explanation = None
    visual_payload = None
    if main_misconception != "none":
        try:
            if use_laws_reflection_llm:
                explanation = explanations_by_tag.get(main_misconception)
                if not explanation:
                    explanation_data = content_agent.generate(
                        subtopic=topic,
                        misconception_tag=main_misconception,
                        attempt=2,
                    )
                    explanation = explanation_data.get("explanation")
                    visual_payload = explanation_data
            else:
                explanation_data = content_agent.generate(
                    subtopic=topic,
                    misconception_tag=main_misconception,
                    attempt=2,
                )
                explanation = explanation_data.get("explanation")
                visual_payload = explanation_data
        except Exception:
            explanation = _get_misconception_explanation(main_misconception)

    if visual_payload is None and main_misconception != "none":
        try:
            visual_payload = content_agent.generate(
                subtopic=topic,
                misconception_tag=main_misconception,
                attempt=2,
            )
        except Exception:
            visual_payload = {}

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
        reason_text = explanations_by_tag.get(tag) if use_laws_reflection_llm else _get_misconception_explanation(tag)
        if not reason_text:
            reason_text = _get_misconception_explanation(tag)

        reason_text = reason_text or "Review this concept carefully."
        question_feedback.append(
            {
                "question_id": ans.get("question_id"),
                "question_text": ans.get("question_text"),
                "reason": " ".join(str(reason_text or "").split()),
                "focus_area": tag,
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


@router.get("/student/{student_id}")
def get_student_route(student_id: str):
    try:
        profile = get_student_profile(student_id)
        return profile or {"student": None, "behavior": []}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/misconception-reason")
def misconception_reason(req: MisconceptionReasonRequest):
    if req.misconception_tag == "none":
        return {
            "reason": "Great work. Keep practicing to strengthen your understanding.",
            "focus_area": "N/A",
        }

    explanation = _get_misconception_explanation(req.misconception_tag)
    if explanation:
        return {
            "reason": _trim_feedback(explanation),
            "focus_area": req.misconception_tag,
        }

    reasoning = generate_reasoning(req.misconception_tag, req.topic)
    return {
        "reason": _trim_feedback(reasoning.get("reason", "Review the concept carefully.")),
        "focus_area": reasoning.get("focus_area", req.misconception_tag),
    }
