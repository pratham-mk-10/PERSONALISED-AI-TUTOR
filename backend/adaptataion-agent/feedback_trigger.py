import json
import os
from urllib import error, request

FALLBACK_MODELS = [
	"mistral-small-latest",
	"open-mistral-nemo",
	"open-mistral-7b",
]

MISTRAL_API_URL = os.getenv("MISTRAL_API_URL", "https://api.mistral.ai/v1/chat/completions")


def _get_api_key():
	return os.getenv("MISTRAL_API_KEY", "").strip()


def _candidate_models():
	configured = os.getenv("MISTRAL_MODEL", "").strip()
	if configured:
		return [configured, *[m for m in FALLBACK_MODELS if m != configured]]
	return FALLBACK_MODELS


def _friendly_error_message(exc):
	text = str(exc or "").lower()
	if "429" in text or "quota" in text or "rate" in text:
		return "LLM quota exceeded. Please wait and retry, or disable USE_LLM to use built-in feedback."
	if "api key" in text or "credential" in text or "permission" in text or "unauth" in text or "401" in text:
		return "LLM authentication failed. Check MISTRAL_API_KEY and model access."
	return "LLM is temporarily unavailable. Using built-in feedback instead."


def _post_chat_completion(api_key, payload):
	body = json.dumps(payload).encode("utf-8")
	req = request.Request(
		MISTRAL_API_URL,
		data=body,
		headers={
			"Authorization": f"Bearer {api_key}",
			"Content-Type": "application/json",
			"Accept": "application/json",
		},
		method="POST",
	)

	with request.urlopen(req, timeout=30) as resp:
		return json.loads(resp.read().decode("utf-8"))


def _extract_json(raw):
	text = (raw or "").strip()
	if not text:
		return None

	# Handle common code-fence wrappers returned by models.
	if text.startswith("```"):
		lines = text.splitlines()
		if lines:
			lines = lines[1:]
			if lines and lines[-1].strip() == "```":
				lines = lines[:-1]
		text = "\n".join(lines).strip()

	start = text.find("{")
	end = text.rfind("}")
	if start == -1 or end == -1 or end <= start:
		return None

	try:
		return json.loads(text[start : end + 1])
	except json.JSONDecodeError:
		return None


def generate_reasoning(misconception_tag, topic, question_text=None, student_answer=None, correct_answer=None):
	api_key = _get_api_key()

	if not api_key:
		return {
			"reason": "LLM is not configured. Set MISTRAL_API_KEY to enable explanations.",
			"focus_area": "N/A",
		}

	# Build context with available information
	context = f"Topic: {topic}\nMisconception: {misconception_tag}"
	
	if question_text:
		context += f"\n\nQuestion: {question_text}"
	if student_answer is not None:
		context += f"\n\nStudent's Answer: {student_answer}"
	if correct_answer is not None:
		context += f"\nCorrect Answer: {correct_answer}"

	prompt = f"""
A student made a mistake in {topic}.

{context}

Explain why the student's answer is incorrect and what the correct concept is. Keep explanation clear and concise in 2-3 sentences.
Also suggest which part of the diagram should be highlighted for learning.

Output JSON only with keys: reason, focus_area.
""".strip()

	response_payload = None
	last_exc = None
	for model_name in _candidate_models():
		try:
			response_payload = _post_chat_completion(
				api_key,
				{
					"model": model_name,
					"temperature": 0.3,
					"messages": [
						{
							"role": "system",
							"content": "You are a teaching assistant. Return JSON only with keys reason and focus_area.",
						},
						{"role": "user", "content": prompt},
					],
				},
			)
			break
		except (error.HTTPError, error.URLError, TimeoutError, ValueError) as exc:
			last_exc = exc

	if response_payload is None:
		return {
			"reason": _friendly_error_message(last_exc),
			"focus_area": "N/A",
		}

	choices = response_payload.get("choices") or []
	raw = ""
	if choices:
		raw = ((choices[0].get("message") or {}).get("content") or "").strip()
	if not raw:
		raw = json.dumps(response_payload)

	parsed = _extract_json(raw)
	if not parsed:
		return {
			"reason": "Model returned non-JSON output.",
			"focus_area": "N/A",
		}

	reason = str(parsed.get("reason", "")).strip() or "Reason unavailable"
	focus_area = str(parsed.get("focus_area", "N/A")).strip() or "N/A"
	return {"reason": reason, "focus_area": focus_area}


def classify_misconception_tag(topic, question_text, student_answer, correct_answer):
	"""Use the LLM to choose the best misconception tag.

	This is a lightweight "misconception model" implemented via prompt
	engineering. It returns one of a small, fixed set of tags so that
	Python code can make decisions (e.g., which video to show) without a
	separate ML classifier.
	"""
	api_key = _get_api_key()
	if not api_key:
		return None

	allowed_tags = [
		"angle_from_surface",
		"reflection_not_equal",
		"normal_orientation_wrong",
		"plane_not_same",
		"general_concept_gap",
	]

	context = f"Topic: {topic}\nQuestion: {question_text}\nStudent's answer: {student_answer}\nCorrect answer: {correct_answer}"

	prompt = f"""
You are an expert NCERT Class 10 physics teacher.

Your task is to classify the student's main misconception for a question on reflection.

Use ONLY one of these tags:
- angle_from_surface: Student measures angle from the mirror surface instead of from the normal.
- reflection_not_equal: Student thinks angle of incidence and angle of reflection are not equal (i ≠ r).
- normal_orientation_wrong: Student draws or imagines the normal incorrectly (for example, parallel to the mirror instead of perpendicular).
- plane_not_same: Student thinks the incident ray, reflected ray and normal do not lie in the same plane.
- general_concept_gap: Student answer is off-topic, a random guess, or mixes several misconceptions so that no single tag clearly fits.

{context}

Pick the SINGLE best tag from the list above.

Return STRICT JSON ONLY:
{{"tag": "<chosen_tag>"}}
""".strip()

	response_payload = None
	last_exc = None
	for model_name in _candidate_models():
		try:
			response_payload = _post_chat_completion(
				api_key,
				{
					"model": model_name,
					"temperature": 0.1,
					"messages": [
						{
							"role": "system",
							"content": "You are a teaching assistant. Return JSON only with key 'tag'.",
						},
						{"role": "user", "content": prompt},
					],
				},
			)
			break
		except (error.HTTPError, error.URLError, TimeoutError, ValueError) as exc:
			last_exc = exc

	if response_payload is None:
		return None

	choices = response_payload.get("choices") or []
	raw = ""
	if choices:
		raw = ((choices[0].get("message") or {}).get("content") or "").strip()
	if not raw:
		raw = json.dumps(response_payload)

	parsed = _extract_json(raw) or {}
	tag = str(parsed.get("tag", "")).strip()
	if tag not in allowed_tags:
		return None
	return tag

