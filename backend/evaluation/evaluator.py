class Evaluator:
    """Evaluates learner responses and maps them to misconceptions."""

    def evaluate(self, response: str) -> dict:
        # TODO: hook in LLM / rule-based evaluation
        return {"score": 0.0, "misconceptions": []}
