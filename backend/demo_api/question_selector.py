import random

from demo_api.database import list_questions
from demo_api.models import get_student


def select_question(student_id, topic):
    student = get_student(student_id)
    level = student.get("level", "beginner")

    if level == "beginner":
        difficulties = ["easy", "easy", "medium"]
    elif level == "intermediate":
        difficulties = ["easy", "medium", "medium"]
    elif level == "advanced":
        difficulties = ["medium", "hard", "hard"]
    else:
        difficulties = ["easy"]

    chosen_difficulty = random.choice(difficulties)
    questions = list_questions(topic=topic, difficulty=chosen_difficulty)

    if not questions:
        questions = list_questions(topic=topic)

    if not questions:
        questions = list_questions()

    if not questions:
        return None

    return random.choice(questions)
