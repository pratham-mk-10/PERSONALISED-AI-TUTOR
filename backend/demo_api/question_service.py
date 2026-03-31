import random

from demo_api.database import list_questions


def get_question(topic=None):
    questions = list_questions(topic=topic)

    if not questions:
        questions = list_questions()

    if not questions:
        return None

    return random.choice(questions)
