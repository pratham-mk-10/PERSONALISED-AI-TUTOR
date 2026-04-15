from importlib.util import module_from_spec, spec_from_file_location
import json
import random
from pathlib import Path
import re

from database.misconception_catalog import (
  coerce_misconception_tag,
  format_misconceptions_for_prompt,
  get_allowed_misconception_tags,
  topic_key_for,
)


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


def _default_misconception_tag(topic: str) -> str:
  """Choose a coarse misconception tag based on the quiz topic.

  This keeps tagging simple and robust: all wrong options in a question
  map to the same topic-level misconception tag so downstream
  reasoning and reporting stay stable even if the LLM format changes.
  """
  topic_key = topic_key_for(topic)

  if topic_key == "laws_of_reflection":
    return "angle_from_surface"
  if topic_key == "plane_mirror":
    return "image_real_confusion"
  if topic_key == "spherical_mirrors":
    return "image_position_confusion"
  if topic_key == "refraction":
    return "refraction_bending_normal"

  return "general_concept_gap"


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

    misconception_block = format_misconceptions_for_prompt(topic)

    return f"""
Generate HIGHLY ACCURATE MCQs for the video topic: {topic}.

Rules:
- Follow this syllabus exactly:
{syllabus_scope}
- Questions must stay on the video topic and stay strictly within the syllabus scope.
- Difficulty level: {difficulty}.
- Tutor context (for personalization): {tutor_context or "No prior learner profile available."}
- Allowed misconception tags for this topic:
{misconception_block}
- No conceptual errors.
- Use only Class 10 NCERT physics level language.
- Include common student misconceptions only when they are directly relevant to this topic.
- 4 options only.
- One correct answer.
- Wrong options must be conceptually distinct from the correct answer.
- Never include a distractor that restates the correct answer in different words.
- For reflection questions, do not treat "angle of reflection" and "angle between the reflected ray and the normal" as separate answers.
- {count_rule}
- Do not return paraphrased duplicates.

Return STRICT JSON ONLY:

[
  {{
    "question_text": "...",
    "options": ["A","B","C","D"],
    "correct": 0,
    "type": "mcq",
    "misconception_map": {{
      "1": "angle_from_surface"
    }}
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


def _shuffle_question_options(question):
  options = question.get("options") or []
  correct_idx = question.get("correct")
  if not isinstance(options, list) or len(options) < 2:
    return question
  if not isinstance(correct_idx, int) or correct_idx < 0 or correct_idx >= len(options):
    return question

  indexed_options = list(enumerate(options))
  random.shuffle(indexed_options)

  shuffled_options = [option_text for _, option_text in indexed_options]
  new_correct_idx = next(
    idx for idx, (original_idx, _) in enumerate(indexed_options)
    if original_idx == correct_idx
  )

  question["options"] = shuffled_options
  question["correct"] = new_correct_idx

  misconception_map = question.get("misconception_map")
  if isinstance(misconception_map, dict):
    remapped = {}
    for new_idx, (original_idx, _) in enumerate(indexed_options):
      if new_idx == new_correct_idx:
        continue

      tag = misconception_map.get(str(original_idx))
      if tag is None:
        tag = misconception_map.get(original_idx)
      if tag is not None:
        remapped[str(new_idx)] = tag

    if remapped:
      question["misconception_map"] = remapped

  return question


def _option_equivalence_key(option_text, topic):
  text = _normalize_text(option_text)
  topic_key = topic_key_for(topic)

  if topic_key == "laws_of_reflection":
    if "angle of reflection" in text or ("reflected ray" in text and "normal" in text):
      return "angle_of_reflection"
    if "angle of incidence" in text or ("incident ray" in text and "normal" in text):
      return "angle_of_incidence"
    if "same plane" in text or "coplanar" in text:
      return "coplanar_law"

  return text


def _has_equivalent_answer_choices(question, topic):
  options = question.get("options") or []
  if not isinstance(options, list) or len(options) < 2:
    return False

  seen = {}
  for option in options:
    key = _option_equivalence_key(option, topic)
    if key in seen and seen[key] != option:
      return True
    seen[key] = option

  return False


def _extract_complete_json_objects(raw_text):
  """Extract full top-level JSON objects from a possibly truncated array payload."""
  if not isinstance(raw_text, str):
    return []

  start = raw_text.find("[")
  if start < 0:
    return []

  objects = []
  obj_start = None
  depth = 0
  in_string = False
  escaped = False

  for idx in range(start, len(raw_text)):
    ch = raw_text[idx]

    if in_string:
      if escaped:
        escaped = False
      elif ch == "\\":
        escaped = True
      elif ch == '"':
        in_string = False
      continue

    if ch == '"':
      in_string = True
      continue

    if ch == "{":
      if depth == 0:
        obj_start = idx
      depth += 1
      continue

    if ch == "}" and depth > 0:
      depth -= 1
      if depth == 0 and obj_start is not None:
        candidate = raw_text[obj_start : idx + 1]
        try:
          parsed = json.loads(candidate)
          if isinstance(parsed, dict):
            objects.append(parsed)
        except json.JSONDecodeError:
          pass
        obj_start = None

  return objects


def _parse_llm_questions(raw_output):
  """Parse LLM output into a question list, tolerating fenced and truncated JSON."""
  text = str(raw_output or "").strip()
  if not text:
    return []

  # Remove optional markdown code fences before parsing.
  text = re.sub(r"^```(?:json)?\s*", "", text, flags=re.IGNORECASE)
  text = re.sub(r"\s*```$", "", text)

  start = text.find("[")
  end = text.rfind("]") + 1

  if start >= 0 and end > start:
    try:
      parsed = json.loads(text[start:end])
      if isinstance(parsed, list):
        return parsed
    except json.JSONDecodeError:
      pass

  recovered = _extract_complete_json_objects(text)
  return recovered if recovered else []


def _fallback_questions(prompt):
  """Use deterministic local fallback questions when remote output cannot be parsed."""
  fallback_fn = getattr(llm_module, "_fallback_response", None)
  if not callable(fallback_fn):
    return []

  try:
    fallback_raw = fallback_fn(prompt)
    parsed = json.loads(fallback_raw)
    return parsed if isinstance(parsed, list) else []
  except Exception:
    return []


def generate_questions(topic, difficulty="easy", syllabus_scope=None, question_count=None, tutor_context=None):
  prompt = build_prompt(
    topic,
    difficulty,
    question_count=question_count,
    syllabus_scope=syllabus_scope,
    tutor_context=tutor_context,
  )

  raw_output = generate_text(prompt)

  try:
    questions = _parse_llm_questions(raw_output)
    if not questions:
      questions = _fallback_questions(prompt)

    if not isinstance(questions, list) or not questions:
      raise RuntimeError("LLM output could not be parsed into questions")

    for q in questions:
      text = str(q.get("question_text", "")).strip()
      # Remove common numbering prefixes like "1.", "Q1:", or "(2)".
      text = re.sub(r"^\s*(?:q\s*)?\(?\d+\)?[\.:\-\)]\s*", "", text, flags=re.IGNORECASE)
      q["question_text"] = text

    unique_questions = _dedupe_questions(questions)
    if not unique_questions:
      raise RuntimeError("LLM returned no valid unique questions")

    allowed_tags = set(get_allowed_misconception_tags(topic))

    # Attach a simple, robust misconception map if missing so that
    # evaluation can always infer a misconception tag from any wrong
    # option.
    default_tag = _default_misconception_tag(topic)
    validated_questions = []
    for q in unique_questions:
      options = q.get("options") or []
      correct_idx = q.get("correct")
      if not isinstance(options, list) or not options:
        continue
      if not isinstance(correct_idx, int) or correct_idx < 0 or correct_idx >= len(options):
        continue
      if _has_equivalent_answer_choices(q, topic):
        continue

      if not isinstance(q.get("misconception_map"), dict):
        mis_map = {}
        for idx in range(len(options)):
          if idx == correct_idx:
            continue
          mis_map[str(idx)] = coerce_misconception_tag(default_tag, topic)
        q["misconception_map"] = mis_map
      else:
        sanitized_map = {}
        for key, value in q["misconception_map"].items():
          coerced = coerce_misconception_tag(value, topic)
          if coerced in allowed_tags or coerced == "general_concept_gap":
            sanitized_map[str(key)] = coerced
        if sanitized_map:
          q["misconception_map"] = sanitized_map
        else:
          mis_map = {}
          for idx in range(len(options)):
            if idx == correct_idx:
              continue
            mis_map[str(idx)] = coerce_misconception_tag(default_tag, topic)
          q["misconception_map"] = mis_map

      # Ensure topic is present so downstream consumers don't need to
      # guess.
      if not q.get("topic"):
        q["topic"] = topic

      _shuffle_question_options(q)
      validated_questions.append(q)

    if isinstance(question_count, (int, float, str)) and str(question_count).isdigit():
      max_count = max(2, min(int(question_count), 10))
      return validated_questions[:max_count]

    # Safety cap only; count selection is otherwise left to the model.
    return validated_questions[:10]

  except RuntimeError:
    raise
  except Exception as e:
    print("Parsing error:", e)
    print(raw_output)
    fallback_questions = _fallback_questions(prompt)
    if fallback_questions:
      deduped = _dedupe_questions(fallback_questions)[:10]

      default_tag = _default_misconception_tag(topic)
      validated_fallback_questions = []
      for q in deduped:
        options = q.get("options") or []
        correct_idx = q.get("correct")
        if not isinstance(options, list) or not options:
          continue
        if not isinstance(correct_idx, int) or correct_idx < 0 or correct_idx >= len(options):
          continue
        if _has_equivalent_answer_choices(q, topic):
          continue

        if not isinstance(q.get("misconception_map"), dict):
          mis_map = {}
          for idx in range(len(options)):
            if idx == correct_idx:
              continue
            mis_map[str(idx)] = coerce_misconception_tag(default_tag, topic)
          q["misconception_map"] = mis_map
        else:
          sanitized_map = {}
          for key, value in q["misconception_map"].items():
            coerced = coerce_misconception_tag(value, topic)
            if coerced in allowed_tags or coerced == "general_concept_gap":
              sanitized_map[str(key)] = coerced
          if sanitized_map:
            q["misconception_map"] = sanitized_map
          else:
            mis_map = {}
            for idx in range(len(options)):
              if idx == correct_idx:
                continue
              mis_map[str(idx)] = coerce_misconception_tag(default_tag, topic)
            q["misconception_map"] = mis_map

        if not q.get("topic"):
          q["topic"] = topic

        _shuffle_question_options(q)
        validated_fallback_questions.append(q)

      return validated_fallback_questions

    raise RuntimeError("Failed to parse LLM question response") from e