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

TAG_PROMPT_HINTS = {
    "image_real_confusion": "Correct the idea that a plane mirror image is real. Explain why the image is virtual and cannot be formed on a screen.",
    "size_mismatch": "Correct the misconception that plane mirror image size changes. Explain that image size equals object size.",
    "distance_confusion": "Correct the misconception about object-image distance in plane mirrors. Explain that image distance behind mirror equals object distance in front.",
    "lateral_inversion_confusion": "Correct the misconception that plane mirror makes image upside down. Explain lateral inversion as left-right reversal.",
    "concave_convex_confusion": "Clarify concave vs convex mirror shape and behavior using simple definitions.",
    "pole_confusion": "Explain the pole as the midpoint of mirror surface, not the center of curvature.",
    "center_of_curvature_confusion": "Explain center of curvature location and relation with radius of curvature.",
    "principal_axis_confusion": "Explain principal axis as the line through pole and center of curvature.",
    "focus_definition_wrong": "Explain principal focus using parallel rays and reflected rays.",
    "focus_convex_confusion": "Explain why convex mirror focus is virtual and lies behind the mirror.",
    "radius_focal_relation_wrong": "Explain the relation R = 2f and how it is used in ray diagrams.",
    "parallel_ray_rule_wrong": "Correct the ray rule: in concave mirrors, a ray parallel to axis reflects through focus.",
    "focus_ray_rule_wrong": "Correct the ray rule: a ray through focus reflects parallel to principal axis.",
    "center_ray_rule_wrong": "Correct the ray rule: a ray through center of curvature retraces its path.",
    "random_reflection": "Explain that reflected rays must follow reflection laws and cannot be drawn randomly.",
    "image_position_confusion": "Explain image position based on object location relative to C, F and P.",
    "real_virtual_confusion": "Differentiate real and virtual images in mirrors with orientation clues.",
    "image_size_confusion": "Explain that image size in spherical mirrors depends on object position.",
    "inverted_erect_confusion": "Explain when image is inverted vs erect for concave and convex mirrors.",
    "focus_infinity_confusion": "Explain special case: object at focus gives image at infinity.",
    "beyond_c_confusion": "Explain object beyond C forms image between C and F for concave mirrors.",
    "convex_real_image_myth": "Correct the myth that convex mirror forms real image. Explain it is always virtual.",
    "convex_size_confusion": "Explain convex mirror image is always diminished and virtual.",
    "rearview_reason_wrong": "Explain rear-view use of convex mirror due to wider field of view and erect diminished image.",
    "sign_convention_confusion": "Explain mirror sign convention briefly and clearly.",
    "left_right_sign_error": "Clarify left-side object distance sign convention for mirrors in NCERT context.",
}


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
        "angle_from_surface": "The student is measuring the angle from the mirror surface. Explain clearly that both angles are always measured from the normal drawn perpendicular to the mirror.",
        "reflection_not_equal": "The student thinks the two angles are not equal. Explain that the first law of reflection says i = r exactly, and show why the equality holds.",
        "normal_orientation_wrong": "The student has drawn or understood the normal incorrectly. Explain that the normal is an imaginary line perpendicular to the mirror surface at the point of incidence.",
        "plane_not_same": "The student is missing the second law of reflection. Explain that the incident ray, reflected ray, and the normal all lie in the same plane.",
        "first_law_reflection_angle": "The student is confusing the first law of reflection. Explain that angle of incidence equals angle of reflection and both are measured from the normal, not the mirror surface.",
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
Use the tag as the source of truth. Do not rename it or swap it for a broader concept.

{core_instruction}

Use the following context:
{chr(10).join(context_lines)}

Rules:
- Do not classify the misconception again.
- Do not introduce unrelated topics.
- Keep the explanation aligned to the tag and the student's wrong idea.
- Use clean, simple language.
- Mention the correct law explicitly when relevant (for example, i = r or normal is perpendicular to the mirror).
- Do not mention SVG or animations.
- {pace_instruction}
""".strip()


def build_explanation_prompt(subtopic, misconception_tag, attempt, question_text=None, student_answer=None, correct_answer=None):

    if topic_key_for(subtopic) in {"laws_of_reflection", "reflection_of_light"}:
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

    tag_hint = TAG_PROMPT_HINTS.get(misconception_tag, "Explain this misconception directly and correct the exact student mistake.")

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

    return base + f"\nInstruction for this tag:\n{tag_hint}\n" + strategy
