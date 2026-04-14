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


def build_prompt(topic, difficulty="easy", question_count=None, syllabus_scope=None, tutor_context=None):
    topic = topic.strip() if isinstance(topic, str) else "Laws of Reflection"
    difficulty = difficulty.strip().lower() if isinstance(difficulty, str) else "easy"
    requested_count = None
    if isinstance(question_count, (int, float, str)) and str(question_count).isdigit():
        requested_count = max(2, min(int(question_count), 10))
    syllabus_scope = (syllabus_scope or SYLLABUS_SCOPE).strip()
    tutor_context = (tutor_context or "").strip()

    if requested_count is None:
        count_rule = "Decide the number of questions yourself based on topic breadth and difficulty. Return only high-quality unique questions, usually between 2 and 10."
    else:
        count_rule = f"Return up to {requested_count} questions. If the topic has limited high-quality question variety, return fewer questions instead of forcing low-quality/off-topic ones."

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
- {count_rule}
- Do not return paraphrased duplicates.

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


def _normalize_text(value):
  text = re.sub(r"[^a-z0-9\s]", " ", str(value or "").lower())
  return " ".join(text.split())


def _token_signature(value):
  stop_words = {
    "the", "a", "an", "of", "to", "in", "on", "at", "for", "with",
    "is", "are", "was", "were", "be", "by", "from", "and", "or", "if",
    "which", "what", "when", "where", "why", "how", "does", "do", "did",
    "can", "could", "will", "would", "should", "into", "through", "about",
  }
  tokens = [tok for tok in _normalize_text(value).split() if tok and tok not in stop_words]
  return set(tokens)


def _is_similar_question(text_a, text_b, threshold=0.72):
  sig_a = _token_signature(text_a)
  sig_b = _token_signature(text_b)
  if not sig_a or not sig_b:
    return False
  overlap = len(sig_a & sig_b)
  union = len(sig_a | sig_b)
  score = overlap / union if union else 0.0
  return score >= threshold


def _dedupe_questions(questions):
  unique = []
  seen_normalized = set()

  for q in questions:
    text = str(q.get("question_text") or "").strip()
    if not text:
      continue

    normalized = _normalize_text(text)
    if normalized in seen_normalized:
      continue

    is_near_duplicate = any(
      _is_similar_question(text, existing.get("question_text", ""))
      for existing in unique
    )
    if is_near_duplicate:
      continue

    q["question_text"] = text
    unique.append(q)
    seen_normalized.add(normalized)

  return unique


def generate_questions(topic, difficulty="easy", syllabus_scope=None, question_count=None, tutor_context=None):
  prompt = build_prompt(
    topic,
    difficulty,
    question_count=question_count,
    syllabus_scope=syllabus_scope,
    tutor_context=tutor_context,
  )

  try:
    raw_output = generate_text(prompt)
  except Exception:
    raw_output = ""

  try:
    # Extract JSON safely
    start = raw_output.find("[")
    end = raw_output.rfind("]") + 1
    if start < 0 or end <= start:
      raise RuntimeError("LLM output did not contain a valid JSON array")

    json_str = raw_output[start:end]
    questions = json.loads(json_str)
    if not isinstance(questions, list):
      raise RuntimeError("LLM output JSON is not a question array")

    for q in questions:
      text = str(q.get("question_text", "")).strip()
      # Remove common numbering prefixes like "1.", "Q1:", or "(2)".
      text = re.sub(r"^\s*(?:q\s*)?\(?\d+\)?[\.:\-\)]\s*", "", text, flags=re.IGNORECASE)
      q["question_text"] = text

    unique_questions = _dedupe_questions(questions)
    if not unique_questions:
      raise RuntimeError("LLM returned no valid unique questions")

    if isinstance(question_count, (int, float, str)) and str(question_count).isdigit():
      max_count = max(2, min(int(question_count), 10))
      return unique_questions[:max_count]

    # Safety cap only; count selection is otherwise left to the model.
    return unique_questions[:10]

  except RuntimeError:
    raise
  except Exception as e:
    print("Parsing error:", e)
    print(raw_output)
<<<<<<< Updated upstream
    raise RuntimeError("Failed to parse LLM question response") from e
=======
    fallback_questions = _fallback_questions(prompt)
    if fallback_questions:
      deduped = _dedupe_questions(fallback_questions)[:10]

      default_tag = _default_misconception_tag(topic)
      for q in deduped:
        options = q.get("options") or []
        correct_idx = q.get("correct")
        if not isinstance(options, list) or not options:
          continue
        if not isinstance(correct_idx, int) or correct_idx < 0 or correct_idx >= len(options):
          continue

        if not isinstance(q.get("misconception_map"), dict):
          mis_map = {}
          for idx in range(len(options)):
            if idx == correct_idx:
              continue
            mis_map[str(idx)] = default_tag
          q["misconception_map"] = mis_map

        if not q.get("topic"):
          q["topic"] = topic

      return deduped

    raise RuntimeError("Failed to parse LLM question response") from e
>>>>>>> Stashed changes
