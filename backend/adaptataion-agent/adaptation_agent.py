try:
	from database.queries import fetch_questions
except ImportError:
	from backend.database.queries import fetch_questions


def adapt_after_submission(main_misconception, topic=None, exclude_ids=None, limit=5):
	if main_misconception and main_misconception != "none":
		return {
			"mode": "targeted",
			"questions": fetch_questions(topic=topic, limit=limit, exclude_ids=exclude_ids),
		}

	return {
		"mode": "mixed",
		"questions": fetch_questions(topic=topic, limit=limit, exclude_ids=exclude_ids),
	}

