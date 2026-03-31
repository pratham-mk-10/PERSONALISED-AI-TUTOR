from collections import Counter
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel

from database.queries import (
    fetch_by_misconception,
    fetch_misconception_for_answer,
    fetch_questions,
)
from demo_api.llm_helper import generate_reasoning
from demo_api.database import get_student_profile
from demo_api.evaluator import Evaluator
from demo_api.question_selector import select_question

router = APIRouter()
evaluator = Evaluator()


class GetQuestionsRequest(BaseModel):
    student_id: str | None = None
    topic: str | None = None
    asked_question_ids: list[int] | None = None
    limit: int | None = 5


class SubmitAnswersRequest(BaseModel):
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

@router.post("/get-questions")
def get_questions(data: GetQuestionsRequest | None = None):
    limit = 5
    asked_ids = []

    if data and data.limit:
        limit = max(1, min(data.limit, 10))
    if data and data.asked_question_ids:
        asked_ids = data.asked_question_ids

    if data and data.student_id and data.topic:
        question = select_question(data.student_id, data.topic)
        return {"questions": [question] if question else []}

    questions = fetch_questions(limit=limit, exclude_ids=asked_ids)
    if not questions and asked_ids:
        questions = fetch_questions(limit=limit)
    return {"questions": questions}


@router.post("/submit-answers")
def submit_answers(data: SubmitAnswersRequest):
    tags = []
    attempted_question_ids = []
    for ans in data.answers:
        selected_raw = ans.get("selected")
        correct_raw = ans.get("correct")

        if selected_raw is None or correct_raw is None:
            continue

        selected = str(selected_raw)
        correct = str(correct_raw)

        if selected == correct:
            continue

        misconception_map = (
            ans.get("misconception_map")
            or ans.get("misconception_tags")
            or {}
        )

        guessed = (
            misconception_map.get(selected)
            or misconception_map.get(selected_raw)
            or ans.get("misconception_tag")
        )

        if not guessed and ans.get("question_id") is not None:
            try:
                guessed = fetch_misconception_for_answer(
                    int(ans["question_id"]), int(selected_raw)
                )
            except (TypeError, ValueError):
                guessed = None

        if ans.get("question_id") is not None:
            try:
                attempted_question_ids.append(int(ans["question_id"]))
            except (TypeError, ValueError):
                pass

        if guessed:
            tags.append(guessed)

    main_misconception = Counter(tags).most_common(1)[0][0] if tags else "none"

    follow_up = []
    if main_misconception != "none":
        try:
            follow_up = fetch_by_misconception(
                main_misconception, limit=5, exclude_ids=attempted_question_ids
            )
        except Exception:
            follow_up = fetch_questions(limit=5, exclude_ids=attempted_question_ids)

    if not follow_up:
        follow_up = fetch_questions(limit=5, exclude_ids=attempted_question_ids)

    if len(follow_up) < 5:
        already = attempted_question_ids + [q["id"] for q in follow_up]
        top_up = fetch_questions(limit=5 - len(follow_up), exclude_ids=already)
        follow_up.extend(top_up)

    return {
        "main_misconception": main_misconception,
        "questions": follow_up,
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
    question = select_question(student_id, topic)
    return question or {}


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
def get_student(student_id: str):
    profile = get_student_profile(student_id)
    return profile or {"student": None, "behavior": []}