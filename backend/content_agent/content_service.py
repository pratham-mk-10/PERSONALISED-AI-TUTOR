from .svg_selector import select_svg
from .llm_service import generate_explanation


def generate_content(data: dict) -> dict:
    """Core content engine for misconception-driven reflection content.

    Expected payload structure (from assessment agent):
        {
            "subtopic": "laws_of_reflection",
            "misconception_tag": "angle_from_surface",
            "attempt": 2,
        }
    """

    subtopic = data.get("subtopic", "laws_of_reflection")
    misconception = data["misconception_tag"]
    attempt = int(data.get("attempt", 1))

    # 1. Pick SVG (mapping is controlled, never AI-driven)
    svg_component = select_svg(subtopic)

    # 2. Explanation logic: first attempt is a fixed concept recap,
    # subsequent attempts use the LLM for targeted feedback.
    if attempt == 1:
        explanation = (
            "Angle of incidence equals angle of reflection. Both angles are "
            "always measured from the NORMAL to the surface, not from the mirror "
            "surface itself."
        )
    else:
        explanation = generate_explanation(misconception)

    return {
        "svg_component": svg_component,
        "misconception_tag": misconception,
        "attempt": attempt,
        "explanation_text": explanation,
    }
