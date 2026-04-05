import random

from database.models import get_student
from database.queries import fetch_by_misconception, fetch_questions


def _pick_difficulty(level):
    if level == "beginner":
        return random.choice(["easy", "easy", "medium"])
    if level == "intermediate":
        return random.choice(["easy", "medium", "medium"])
    if level == "advanced":
        return random.choice(["medium", "hard", "hard"])
    return "easy"


def select_question(student_id, topic):
    student = get_student(student_id)
    level = student.get("level", "beginner")

    chosen_difficulty = _pick_difficulty(level)
    questions = fetch_questions(topic=topic, difficulty=chosen_difficulty, limit=10)

    if not questions:
        questions = fetch_questions(topic=topic, limit=10)

    if not questions:
        return None

    return random.choice(questions)


def get_initial_questions(topic=None, limit=5, exclude_ids=None):
    return fetch_questions(topic=topic, limit=limit, exclude_ids=exclude_ids)


def get_targeted_questions(tag, topic=None, limit=5, exclude_ids=None):
    questions = fetch_by_misconception(
        tag,
        topic=topic,
        limit=limit,
        exclude_ids=exclude_ids,
    )

    return questions