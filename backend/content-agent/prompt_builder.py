import json
from pathlib import Path

try:
    from database.misconception_catalog import topic_key_for
except ImportError:
    from backend.database.misconception_catalog import topic_key_for

ROOT = Path(__file__).resolve().parents[2]
FILE = ROOT / "shared" / "misconception_tags.json"


def load_data():
    with open(FILE, "r", encoding="utf-8") as f:
        return json.load(f)


DATA = load_data()


def get_misconception(tag):
    return DATA.get(tag)


def get_misconception_payload(tag):
    return DATA.get(tag) or DATA.get("general_concept_gap") or {}


def _build_laws_reflection_prompt(subtopic, misconception_tag, attempt, question_text=None, student_answer=None, correct_answer=None):
    m = get_misconception_payload(misconception_tag)
    title = m.get("title", "Reflection misconception")
    explanation = m.get("explanation", "")
    focus_area = m.get("focus_area", "")

    tag_prompts = {
        "first_law_reflection_angle": "The student is confusing the first law of reflection. Explain that angle of incidence equals angle of reflection and both are measured from the normal, not the mirror surface.",
        "angle_from_surface": "The student is measuring the angle from the mirror surface. Explain clearly that both angles are always measured from the normal drawn perpendicular to the mirror.",
        "reflection_not_equal": "The student thinks the two angles are not equal. Explain that the first law of reflection says i = r exactly, and show why the equality holds.",
        "normal_orientation_wrong": "The student has drawn or understood the normal incorrectly. Explain that the normal is an imaginary line perpendicular to the mirror surface at the point of incidence.",
        "plane_not_same": "The student is missing the second law of reflection. Explain that the incident ray, reflected ray, and the normal all lie in the same plane.",
        "second_law_reflection_plane": "The student is missing the second law of reflection. Explain that the incident ray, reflected ray, and the normal all lie in the same plane.",
        "general_concept_gap": "The student has a broader gap in the core reflection ideas. Rebuild the concept from the relevant NCERT definition and diagram.",
    }

    core_instruction = tag_prompts.get(misconception_tag, tag_prompts["general_concept_gap"])
    context_lines = [
        f"Topic: {subtopic}",
        f"Misconception tag: {misconception_tag}",
        f"Misconception title: {title}",
        f"Core misconception description: {explanation}",
        f"Focus area: {focus_area}",
    ]

    if question_text:
        context_lines.append(f"Question: {question_text}")
    if student_answer is not None:
        context_lines.append(f"Student answer: {student_answer}")
    if correct_answer is not None:
        context_lines.append(f"Correct answer: {correct_answer}")

    pace_instruction = (
        "Give a concise explanation in 2-3 short paragraphs, then end with one quick reminder sentence."
        if attempt == 2
        else "Explain step by step in simple NCERT language, then end with one quick reminder sentence."
    )

    return f"""
You are an NCERT Class 10 physics teacher.

This is a Laws of Reflection quiz only.
Explain the student's understanding gap for the exact misconception below.

{core_instruction}

Use the following context:
{chr(10).join(context_lines)}

Rules:
- Do not classify the misconception again.
- Do not introduce unrelated topics.
- Keep the explanation aligned to the tag and the student's wrong idea.
- Use clean, simple language.
- Do not mention SVG or animations.
- {pace_instruction}
""".strip()


def build_explanation_prompt(subtopic, misconception_tag, attempt, question_text=None, student_answer=None, correct_answer=None):

    if topic_key_for(subtopic) == "laws_of_reflection":
        return _build_laws_reflection_prompt(
            subtopic,
            misconception_tag,
            attempt,
            question_text=question_text,
            student_answer=student_answer,
            correct_answer=correct_answer,
        )

    m = get_misconception(misconception_tag)

    if not m:
        return "Explain the reflection concept clearly in simple NCERT language."

    base = f"""
Topic: {subtopic}
Misconception tag: {misconception_tag}

Student mistake:
{m.get("explanation", "")}

Focus:
{m.get("focus_area", "")}
"""

    if question_text:
        base += f"\nQuestion:\n{question_text}\n"
    if student_answer is not None:
        base += f"\nStudent answer: {student_answer}\n"
    if correct_answer is not None:
        base += f"\nCorrect answer: {correct_answer}\n"

    if attempt == 2:
        strategy = """
Explain briefly what the mistake is and what is correct.
"""
    else:
        strategy = """
Explain step-by-step like a teacher with simple reasoning.
"""

    return base + strategy
