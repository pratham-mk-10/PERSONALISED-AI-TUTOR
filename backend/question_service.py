import random

from database.queries import fetch_questions


def get_question(topic=None):
	questions = fetch_questions(topic=topic, limit=20)
	if not questions:
		questions = fetch_questions(limit=20)
	if not questions:
		return None
	return random.choice(questions)

__all__ = ["get_question"]
