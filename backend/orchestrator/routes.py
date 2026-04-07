from collections import Counter
import importlib.util
from pathlib import Path
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from database.models import (
    get_student as get_student_record,
    get_student_profile,
    log_student_behavior,
    set_student_current_topic,
    update_student,
    update_student_level,
    update_student_topic_resolution,
)
from assesment_agent.evaluator import Evaluator
from assesment_agent.question_gen import SYLLABUS_SCOPE, generate_questions


def _load_adaptation_feedback_module():
    backend_root = Path(__file__).resolve().parents[1]
    file_path = backend_root / "adaptataion-agent" / "feedback_trigger.py"
    spec = importlib.util.spec_from_file_location("adaptation_feedback_trigger", file_path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Unable to load module from {file_path}")

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_adaptation_feedback = _load_adaptation_feedback_module()
generate_reasoning = _adaptation_feedback.generate_reasoning

router = APIRouter()
evaluator = Evaluator()


class GetQuestionsRequest(BaseModel):
    student_id: str | None = None
    topic: str | None = None
    asked_question_ids: list[int | None] | None = None
    limit: int | None = 5


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


def _difficulty_weight(value: Any) -> float:
    level = str(value or "").strip().lower()
    if level == "hard":
        return 2.0
    if level == "medium":
        return 1.5
    return 1.0


def _difficulty_from_level(level: str | None) -> str:
    normalized = str(level or "beginner").strip().lower()
    if normalized == "advanced":
        return "hard"
    if normalized == "intermediate":
        return "medium"
    return "easy"


def _trim_feedback(text: str, max_len: int = 220) -> str:
    cleaned = " ".join(str(text or "").split())
    if len(cleaned) <= max_len:
        return cleaned
    return cleaned[: max_len - 3].rstrip() + "..."

@router.post("/get-questions")
def get_questions(data: GetQuestionsRequest | None = None):
    limit = 5
    asked_ids = []
    topic = None
    student_level = "beginner"

    if data and data.limit:
        limit = max(1, min(data.limit, 10))
    if data and data.asked_question_ids:
        asked_ids = [qid for qid in data.asked_question_ids if isinstance(qid, int)]
    if data and data.topic:
        topic = data.topic
    if not topic and data and data.student_id:
        student = get_student_record(data.student_id)
        topic = student.get("current_topic")
        student_level = student.get("level", "beginner")
    if data and data.student_id and topic:
        set_student_current_topic(data.student_id, topic)

    if data and data.student_id and student_level == "beginner":
        student_level = get_student_record(data.student_id).get("level", "beginner")

    difficulty = _difficulty_from_level(student_level)
    questions = generate_questions(topic or "reflection_refraction", difficulty)

    # Filter already-asked ids if generated questions include ids.
    if asked_ids:
        asked_ids_set = set(asked_ids)
        questions = [q for q in questions if q.get("id") not in asked_ids_set]

    questions = questions[:limit]
    return {"questions": questions}


@router.post("/submit")
def submit(data: dict):
    answers = data.get("answers", [])
    results = []

    for item in answers:
        q = item.get("question", {})
        user_ans = item.get("answer")
        options = q.get("options", [])
        correct_idx = q.get("correct")

        correct_option = None
        if isinstance(correct_idx, int) and 0 <= correct_idx < len(options):
            correct_option = options[correct_idx]

        is_correct = user_ans == correct_option if correct_option is not None else False

        results.append(
            {
                "question_id": q.get("id"),
                "correct": is_correct,
                "feedback": None if is_correct else "Revise concept",
            }
        )

    return {"results": results}


@router.post("/submit-answers")
def submit_answers(data: SubmitAnswersRequest):
    student_id = data.student_id or "guest-student"
    tags = []
    attempted_question_ids = []
    topic = data.topic
    total_weight = 0.0
    correct_weight = 0.0
    incorrect_count = 0
    misconception_context = {}  # Store context for main misconception
    wrong_question_context = []
    per_question_feedback = []
    db_sync_error = None
    
    for ans in data.answers:
        selected_raw = ans.get("selected")
        correct_raw = ans.get("correct")

        if selected_raw is None or correct_raw is None:
            continue

        selected = str(selected_raw)
        correct = str(correct_raw)
        is_correct = selected == correct
        weight = _difficulty_weight(ans.get("difficulty"))
        total_weight += weight
        if is_correct:
            correct_weight += weight
        else:
            incorrect_count += 1

        misconception_map = (
            ans.get("misconception_map")
            or ans.get("misconception_tags")
            or {}
        )

        guessed = None
        if not is_correct:
            guessed = (
                misconception_map.get(selected)
                or misconception_map.get(selected_raw)
                or ans.get("misconception_tag")
            )
            if not guessed:
                guessed = "general_concept_gap"

        if ans.get("question_id") is not None:
            try:
                attempted_question_ids.append(int(ans["question_id"]))
            except (TypeError, ValueError):
                pass

        if not topic and ans.get("topic"):
            topic = str(ans.get("topic"))

        question_text = str(ans.get("question_text") or "").strip()

        if not is_correct:
            item_feedback = generate_reasoning(
                guessed or "general_concept_gap",
                topic or "reflection_refraction",
                question_text=question_text,
                student_answer=selected,
                correct_answer=correct,
            )
            wrong_question_context.append(
                {
                    "question_text": question_text,
                    "student_answer": selected,
                    "correct_answer": correct,
                }
            )
            per_question_feedback.append(
                {
                    "question_id": ans.get("question_id"),
                    "question_text": question_text,
                    "reason": _trim_feedback(item_feedback.get("reason", "Let's revisit this concept."), 220),
                    "focus_area": _trim_feedback(item_feedback.get("focus_area", "N/A"), 120),
                }
            )

        try:
            update_student(student_id, guessed)
            log_student_behavior(
                student_id=student_id,
                topic=topic,
                selected_option=selected,
                correct_option=correct,
                is_correct=is_correct,
                misconception_tag=guessed,
            )
        except Exception as exc:
            # Keep quiz flow usable even if DB is temporarily unreachable.
            db_sync_error = str(exc)

        if guessed:
            tags.append(guessed)
            # Store question context for this misconception
            misconception_context[guessed] = {
                "question_text": ans.get("question_text"),
                "student_answer": selected,
                "correct_answer": correct,
            }

    main_misconception = Counter(tags).most_common(1)[0][0] if tags else "none"
    if main_misconception == "none" and incorrect_count > 0:
        main_misconception = "general_concept_gap"

    weighted_accuracy = correct_weight / total_weight if total_weight else 0
    student = {
        "level": "beginner",
        "attempts": 0,
    }
    accuracy = weighted_accuracy
    if accuracy < 0.4:
        level = "beginner"
    elif accuracy < 0.7:
        level = "intermediate"
    else:
        level = "advanced"

    try:
        student = update_student_level(student_id, level)
        update_student_topic_resolution(student_id, topic, main_misconception)
    except Exception as exc:
        db_sync_error = str(exc)
        student["level"] = level

    reason_payload = {
        "reason": "Great work. Keep practicing to strengthen your understanding.",
        "focus_area": "N/A",
    }
    if main_misconception != "none":
        # Build an aggregate context so overall feedback reflects all wrong questions.
        summary_lines = []
        for idx, item in enumerate(wrong_question_context[:5], start=1):
            summary_lines.append(
                f"{idx}) Q: {item.get('question_text') or 'N/A'} | Student: {item.get('student_answer')} | Correct: {item.get('correct_answer')}"
            )
        context_text = "\n".join(summary_lines)

        reason_payload = generate_reasoning(
            main_misconception, 
            topic or "reflection_refraction",
            question_text=context_text,
            student_answer=f"{incorrect_count} incorrect out of {len(data.answers)}",
            correct_answer="Review all incorrect questions and associated concepts",
        )

    reason_payload = {
        "reason": _trim_feedback(reason_payload.get("reason", "Let's review this concept from a different angle."), 220),
        "focus_area": _trim_feedback(reason_payload.get("focus_area", "N/A"), 120),
    }

    next_difficulty = _difficulty_from_level(student.get("level"))
    follow_up = generate_questions(topic or "reflection_refraction", next_difficulty)[:5]

    return {
        "main_misconception": main_misconception,
        "level": student.get("level"),
        "attempt": student.get("attempts"),
        "reason": reason_payload.get("reason", "Let's review this concept from a different angle."),
        "focus_area": reason_payload.get("focus_area", "N/A"),
        "question_feedback": per_question_feedback,
        "questions": follow_up,
        "db_sync_warning": _trim_feedback(db_sync_error, 180) if db_sync_error else None,
    }


@router.post("/misconception-reason")
def misconception_reason(req: MisconceptionReasonRequest):
    reason = generate_reasoning(req.misconception_tag, req.topic)
    return {
        "reason": reason.get("reason", "Let's review this concept from a different angle."),
        "focus_area": reason.get("focus_area", "N/A"),
    }


@router.get("/question/{student_id}/{topic}")
def get_adaptive_question(student_id: str, topic: str):
    student = get_student_record(student_id)
    difficulty = _difficulty_from_level(student.get("level"))
    questions = generate_questions(topic, difficulty)
    return (questions[0] if questions else {})


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
    profile = get_student_profile(student_id)
    return profile or {"student": None, "behavior": []}


@router.post("/generate-questions")
def generate(data: dict):
    topic = data.get("topic", "Laws of Reflection")
    difficulty = data.get("difficulty", "easy")
    syllabus_scope = data.get("syllabus_scope") or SYLLABUS_SCOPE
    question_count = data.get("question_count")
    tutor_context = data.get("tutor_context")

    try:
        questions = generate_questions(
            topic,
            difficulty,
            syllabus_scope=syllabus_scope,
            question_count=question_count,
            tutor_context=tutor_context,
        )
    except RuntimeError as exc:
        raise HTTPException(status_code=504, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Question generation failed") from exc

    return {"questions": questions}