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
    "general_concept_gap": "Directly address the question text, explaining why the student's selected answer is incorrect and why the correct answer is right in the context of the NCERT Class 10 syllabus. Do not give a generic definition of mirrors.",
    "concave_convex_confusion": "Clarify concave vs convex mirror shape and behavior (inward vs outward) using simple NCERT definitions.",
    "pole_confusion": "Explain the pole as the geometric center of the mirror surface, not the center of curvature.",
    "center_of_curvature_confusion": "Explain center of curvature as the center of the original sphere and its relation with radius of curvature.",
    "principal_axis_confusion": "Explain principal axis as the imaginary straight line passing through pole and center of curvature.",
    "focus_definition_wrong": "Explain principal focus using parallel rays and how they actually meet (concave) or appear to meet (convex).",
    "focus_convex_confusion": "Explain why convex mirror focus is virtual and lies behind the mirror.",
    "radius_focal_relation_wrong": "Explain the relation R = 2f and how to calculate focal length from radius of curvature.",
    "parallel_ray_rule_wrong": "Correct the ray rule: in concave mirrors, a ray parallel to principal axis reflects through principal focus.",
    "focus_ray_rule_wrong": "Correct the ray rule: a ray through principal focus reflects parallel to principal axis.",
    "center_ray_rule_wrong": "Correct the ray rule: a ray through center of curvature retraces its path back after reflection.",
    "angle_from_surface": "The student is measuring the angle from the mirror surface. Explain clearly that both angles are always measured from the normal drawn perpendicular to the mirror.",
    "reflection_not_equal": "The student thinks the two angles are not equal. Explain that the first law of reflection says i = r exactly.",
    "normal_orientation_wrong": "The student has drawn the normal incorrectly. Explain that the normal is an imaginary line perpendicular to the mirror surface at the point of incidence.",
    "plane_not_same": "The student is missing the second law of reflection. Explain that the incident ray, reflected ray, and the normal all lie in the same plane.",
    "image_real_confusion": "Correct the idea that a plane mirror image is real. Explain why the image is virtual and cannot be formed on a screen.",
    "size_mismatch": "Correct the misconception that plane mirror image size changes. Explain that image size equals object size.",
    "distance_confusion": "Correct the misconception about object-image distance in plane mirrors. Explain that image distance behind mirror equals object distance in front.",
    "lateral_inversion_confusion": "Correct the misconception that plane mirror makes image upside down. Explain lateral inversion as left-right reversal.",
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
    "lens_optical_center_confusion": "Explain that a light ray passing through the optical center of a spherical lens does not suffer any deviation.",
    "lens_parallel_ray_wrong": "Explain that a ray parallel to the principal axis passes through the principal focus on the other side of a convex lens.",
    "concave_lens_converge_myth": "Explain that a concave lens diverges light rays away from the principal axis, rather than converging them.",
    "concave_lens_parallel_ray_wrong": "Explain that a parallel ray hitting a concave lens diverges in such a way that it appears to come from the principal focus on the same side of the lens.",
    "glass_slab_lateral_shift_wrong": "Explain that when light emerges from a rectangular glass slab, the emergent ray is parallel to the incident ray but laterally shifted.",
    "tir_critical_angle_confusion": "Explain that when light travels from a denser to rarer medium and the angle of incidence exceeds the critical angle, it totally internally reflects back into the denser medium.",
    "mirror_formula_wrong": "Explain the correct mirror formula (1/v + 1/u = 1/f) and the importance of using the Cartesian sign convention correctly.",
    "lens_formula_wrong": "Explain the correct lens formula (1/v - 1/u = 1/f) and the importance of using the Cartesian sign convention correctly."
}


def get_misconception(tag):
    return DATA.get(tag)


def get_misconception_payload(tag):
    return DATA.get(tag) or DATA.get("general_concept_gap") or {}


def build_explanation_prompt(subtopic, misconception_tag, attempt, question_text=None, student_answer=None, correct_answer=None):
    m = get_misconception_payload(misconception_tag)
    title = m.get("title", "Physics concept")
    explanation = m.get("explanation", "")
    focus_area = m.get("focus_area", "")

    tag_instruction = TAG_PROMPT_HINTS.get(
        misconception_tag, 
        TAG_PROMPT_HINTS.get("general_concept_gap")
    )

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
        else "Explain step by step like an encouraging teacher in simple NCERT language, then end with one quick reminder sentence."
    )

    return f"""
You are an NCERT Class 10 physics teacher.

Your task is to explain the student's understanding gap for the exact misconception below.
Use the tag and description as the source of truth.

Instruction for this misconception:
{tag_instruction}

Use the following context:
{chr(10).join(context_lines)}

Rules:
- Do not classify the misconception again.
- Do not introduce unrelated topics.
- Keep the explanation aligned to the tag and the student's wrong idea.
- Keep the explanation highly targeted: focus ONLY on the specific medium/device asked in the question (e.g. if the question is about concave mirrors, do not explain convex mirrors unless explicitly necessary for comparison). Avoid generic context dumping.
- Do NOT use markdown bold/italic formatting syntax (like `**` or `*`) in your response text. Output plain, clean text only.
- Use clean, simple language suitable for a Class 10 student.
- Mention the correct physics principle or law explicitly.
- Do not mention SVG, interactive elements, or animations.
- {pace_instruction}
""".strip()

def build_dynamic_feedback_prompt(subtopic, misconception_tag, question_text=None, student_answer=None):
    return f"""
You are an NCERT Class 10 physics engine.

Your task is to generate both a text explanation and mathematical rendering coordinates (animation_parameters) for the student's misconception.

Context:
Topic: {subtopic}
Misconception tag: {misconception_tag}
Question: {question_text or "N/A"}
Student answer: {student_answer or "N/A"}

SVG Coordinate System Rules:
- The canvas ViewBox is 800x400.
- Origin (0,0) is top-left.
- For Mirrors: Principal axis is Y=200. Pole is X=400. Focus is X=300 (Concave). Center is X=200. Incident rays usually start from X=0.
- For Refraction: Interface is usually at Y=200. Normal is X=400.

You must output a STRICT JSON object (no markdown, no backticks, just raw JSON).
Schema:
{{
  "explanation": "Text explaining why the student is wrong and what the correct physics is.",
  "animation_parameters": {{
    "student_incorrect_trajectory": [
      {{"x": 0, "y": 100}},
      {{"x": 400, "y": 100}},
      {{"x": 200, "y": 200}} // example wrong point
    ],
    "physics_correct_trajectory": [
      {{"x": 0, "y": 100}},
      {{"x": 400, "y": 100}},
      {{"x": 300, "y": 200}} // example correct point
    ]
  }}
}}

Based on the misconception tag, generate the appropriate coordinates demonstrating the student's mistake versus the correct path.
"""
