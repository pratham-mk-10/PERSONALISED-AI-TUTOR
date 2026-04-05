from importlib.util import module_from_spec, spec_from_file_location
import json
from pathlib import Path
import re

base_dir = Path(__file__).resolve().parent
llm_spec = spec_from_file_location("assesment_agent.question_gen_llm_service", base_dir / "question_gen_llm_service.py")
llm_module = module_from_spec(llm_spec)
llm_spec.loader.exec_module(llm_module)
generate_text = llm_module.generate_text

SYLLABUS_SCOPE = """
NCERT Class 10 Science Chapter 9: Light - Reflection and Refraction only.

Allowed scope:
- Laws of reflection
- Plane mirror image characteristics
- Spherical mirrors: concave and convex mirrors
- Pole, centre of curvature, principal axis, principal focus, focal length, aperture
- Mirror formula and magnification
- Uses of concave and convex mirrors
- Refraction of light, refractive index, optical density, Snell's law
- Refraction through a rectangular glass slab
- Spherical lenses: convex and concave lenses
- Optical centre, principal foci, lens formula, magnification, power of a lens

Do not go outside this chapter or introduce topics from other physics chapters.
""".strip()


def build_prompt(topic, difficulty="easy", syllabus_scope=None, question_count=5, tutor_context=None):
    topic = topic.strip() if isinstance(topic, str) else "Laws of Reflection"
    difficulty = difficulty.strip().lower() if isinstance(difficulty, str) else "easy"
    question_count = int(question_count) if isinstance(question_count, (int, float, str)) and str(question_count).isdigit() else 5
    question_count = max(2, min(question_count, 8))
    syllabus_scope = (syllabus_scope or SYLLABUS_SCOPE).strip()
    tutor_context = (tutor_context or "").strip()
    return f"""
Generate HIGHLY ACCURATE MCQs for the video topic: {topic}.

Rules:
- Follow this syllabus exactly:
{syllabus_scope}
- Questions must stay on the video topic and stay strictly within the syllabus scope.
- Difficulty level: {difficulty}.
- Tutor context (for personalization): {tutor_context or "No prior learner profile available."}
- No conceptual errors.
- Use only Class 10 NCERT physics level language.
- Include common student misconceptions only when they are directly relevant to this topic.
- 4 options only.
- One correct answer.
- Return up to {question_count} questions.
- If the topic has limited high-quality question variety, return fewer questions instead of forcing low-quality/off-topic ones.

Return STRICT JSON ONLY:

[
  {{
    "question_text": "...",
    "options": ["A","B","C","D"],
    "correct": 0,
    "type": "mcq"
  }}
]
"""


def generate_questions(topic, difficulty="easy", syllabus_scope=None, question_count=5, tutor_context=None):
    prompt = build_prompt(topic, difficulty, syllabus_scope, question_count, tutor_context)

    raw_output = generate_text(prompt)

    try:
        # 🔥 Extract JSON safely
        start = raw_output.find("[")
        end = raw_output.rfind("]") + 1

        json_str = raw_output[start:end]

        questions = json.loads(json_str)

        for q in questions:
          text = str(q.get("question_text", "")).strip()
          # Remove common numbering prefixes like "1.", "Q1:", or "(2)".
          text = re.sub(r"^\s*(?:q\s*)?\(?\d+\)?[\.:\-\)]\s*", "", text, flags=re.IGNORECASE)
          q["question_text"] = text

        return questions

    except Exception as e:
        print("Parsing error:", e)
        print(raw_output)
        return []