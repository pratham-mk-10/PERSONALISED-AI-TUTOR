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
    "regular_vs_diffused_confusion": "Clarify that regular (specular) reflection happens on smooth surfaces where parallel rays stay parallel, while diffused reflection happens on rough surfaces where rays scatter -- but every individual ray still obeys the law of reflection at its own point of incidence.",
    "mirror_formula_sign_error": "Explain that every value (u, f, and once found, v) must be given its correct sign under the Cartesian sign convention BEFORE substituting into 1/v + 1/u = 1/f -- substituting an unsigned magnitude gives a wrong answer even with the right formula.",
    "magnification_sign_error": "Explain how to read the sign of m = -v/u: positive m means virtual and erect, negative m means real and inverted, and clarify the correctly-signed v and u that should have been used.",
}


TAG_ANALOGY_HINTS = {
    "angle_from_surface": "A ball bounced off a flat wall: the angle that matters is measured from the imaginary line sticking straight OUT of the wall (the normal), never from the wall's flat surface itself.",
    "reflection_not_equal": "Kicking a ball at a wall dead-on-symmetric: whatever angle it hits the wall at, it leaves at the exact same angle on the other side of the perpendicular line — never a different one.",
    "normal_orientation_wrong": "A flagpole standing straight up out of flat ground: the flagpole (normal) is always perpendicular to the ground (mirror), no matter where you stand.",
    "plane_not_same": "Three points on one flat sheet of paper: the incoming path, the outgoing path, and the perpendicular line all sit on that same single flat sheet — none of them pokes out of it.",
    "concave_convex_confusion": "A shiny spoon: look at the inside (scooped, curves toward you) versus the outside (bulging, curves away from you) of the same spoon.",
    "focus_definition_wrong": "Sunlight through a concave shaving mirror actually gathers to a single hot point in front of it; a convex mirror spreads sunlight apart, so that hot point only exists if you trace the spread-out rays backward, behind the mirror.",
    "focus_convex_confusion": "Standing behind a convex security mirror in a shop: the bright 'meeting point' of the spread-out rays only appears to be behind the mirror's surface, not in the room in front of it.",
    "image_real_confusion": "A picture on a screen versus your reflection in a bathroom mirror: only the screen picture can be caught on paper; the mirror version only exists where your eye traces the rays back to.",
    "lateral_inversion_confusion": "Raise your right hand in front of a mirror: the reflection raises what looks like its left hand — nothing flips upside down, only left and right swap.",
    "convex_real_image_myth": "A shop security mirror image: no matter how close or far you stand, you can never catch that image on a piece of paper — it always stays a same-side, shrunk, upright view.",
    "rearview_reason_wrong": "A car's side mirror is curved outward like the back of a spoon specifically so a wider slice of the road behind squeezes into one small mirror, at the cost of making cars look smaller/farther than they are.",
    "sign_convention_confusion": "Standing at the mirror looking toward the object: everything measured in the direction you're facing (away from the mirror, where the object sits) is negative; only measurements taken from mirror going the other way count positive.",
    "regular_vs_diffused_confusion": "A flat calm pond gives one clear reflection (regular); the same water rippled by wind breaks that same reflection into scattered flashes of light in every direction (diffused) -- each ripple still bounces light off at the correct angle, it just isn't flat anymore.",
    "mirror_formula_sign_error": "Like a bank statement where withdrawals must be entered as negative numbers before you total the account -- plugging in a raw distance without its correct negative or positive sign into the formula gives a wrong final balance even though the arithmetic itself was done correctly.",
    "magnification_sign_error": "A magnification's sign is like a thumbs up or thumbs down verdict card revealed at the very end: positive flips the card to 'virtual, erect', negative flips it to 'real, inverted' -- read that card only after correctly signing v and u.",
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

    if attempt == 2:
        pace_instruction = (
            "Give a direct, targeted explanation in 2–3 paragraphs. "
            "Focus on WHY the student's specific wrong belief is incorrect. "
            "Use their exact wrong answer as a starting point."
        )
    elif attempt >= 3:
        analogy_hint = TAG_ANALOGY_HINTS.get(misconception_tag)
        if analogy_hint:
            analogy_rule = (
                f"Use exactly this real-world analogy, adapted in your own words: {analogy_hint} "
                "Do not invent a different analogy."
            )
        else:
            analogy_rule = (
                "Pick ONE simple, everyday physical object or action (something the student can "
                "physically see or touch) as the analogy. Before writing the explanation, silently "
                "check that every part of the analogy maps 1:1 onto a physics quantity in this "
                "misconception (e.g. the object's straight edge = normal, the bounce angle = angle "
                "of reflection). If any part of the analogy does not map cleanly, discard it and "
                "pick a simpler one instead."
            )
        pace_instruction = (
            "The student has struggled with this concept multiple times. "
            f"{analogy_rule} "
            "Do not introduce any new physics concept, device, or phenomenon (e.g. refraction, "
            "sound, echoes, lenses) that is not already part of this misconception — that would "
            "confuse rather than clarify. Avoid physics jargon. Be encouraging and extremely simple. "
            "End with one concrete memorable sentence they can recall during a test."
        )
    else:
        pace_instruction = (
            "Explain step by step like an encouraging teacher. "
            "Build from what they already know."
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
