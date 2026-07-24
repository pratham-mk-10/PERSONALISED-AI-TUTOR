try:
    from database.queries import fetch_by_misconception, fetch_questions
    from database.misconception_catalog import coerce_misconception_tag
except ImportError:
    from backend.database.queries import fetch_by_misconception, fetch_questions
    from backend.database.misconception_catalog import coerce_misconception_tag

def adapt_after_submission(
    main_misconception: str,
    topic: str | None = None,
    attempt_number: int = 1,
    exclude_ids: list | None = None,
    limit: int = 5,
) -> dict:
    """
    Returns adaptation strategy based on misconception + attempt number.

    Returns dict with:
      - mode: "regular" | "targeted"
      - strategy: "visual_only" | "llm_explanation" | "simplify_and_redirect"
      - should_redirect_to_lesson: bool  (True at attempt 3+)
      - questions: list  (targeted questions for the next round)
    """
    no_misconception = not main_misconception or main_misconception == "none"

    if no_misconception:
        return {
            "mode": "mixed",
            "strategy": "positive_reinforcement",
            "should_redirect_to_lesson": False,
            "questions": fetch_questions(topic=topic, limit=limit, exclude_ids=exclude_ids),
        }

    if attempt_number >= 3:
        # Attempt 3+: still give targeted questions but flag for lesson redirect
        questions = _fetch_targeted(main_misconception, topic, exclude_ids, limit)
        return {
            "mode": "targeted",
            "strategy": "simplify_and_redirect",
            "should_redirect_to_lesson": True,
            "questions": questions,
        }

    if attempt_number == 2:
        questions = _fetch_targeted(main_misconception, topic, exclude_ids, limit)
        return {
            "mode": "targeted",
            "strategy": "llm_explanation",
            "should_redirect_to_lesson": False,
            "questions": questions,
        }

    # Attempt 1: visual only, regular questions
    return {
        "mode": "regular",
        "strategy": "visual_only",
        "should_redirect_to_lesson": False,
        "questions": fetch_questions(topic=topic, limit=limit, exclude_ids=exclude_ids),
    }


def _fetch_targeted(tag, topic, exclude_ids, limit):
    """Try misconception-tagged questions first; fall back to topic questions."""
    try:
        questions = fetch_by_misconception(tag=tag, topic=topic, limit=limit, exclude_ids=exclude_ids)
        if questions:
            return questions
    except Exception:
        pass
    return fetch_questions(topic=topic, limit=limit, exclude_ids=exclude_ids)

