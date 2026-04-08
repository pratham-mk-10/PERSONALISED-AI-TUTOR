import json
import os
from pathlib import Path
from urllib import error, request

FALLBACK_MODELS = [
	"mistral-small-latest",
	"open-mistral-nemo",
	"open-mistral-7b",
]

MISTRAL_API_URL = os.getenv("MISTRAL_API_URL", "https://api.mistral.ai/v1/chat/completions")
USE_LLM = os.getenv("USE_LLM", "false").lower() in {"1", "true", "yes"}


_TAG_FILE = Path(__file__).resolve().parents[1] / "assesment_agent" / "tags.json"


def _load_tag_library():
	try:
		with open(_TAG_FILE, "r", encoding="utf-8") as f:
			data = json.load(f)
			return data if isinstance(data, dict) else {}
	except (FileNotFoundError, json.JSONDecodeError, OSError):
		return {}


TAG_LIBRARY = _load_tag_library()


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


def _tag_based_feedback(misconception_tag, topic):
	"""Return canned reasoning for a specific misconception tag, if available.

	This acts as a lightweight "misconception agent" that works even without
	any LLM or external API keys.
	"""
	key = str(misconception_tag or "").strip().lower()
	if not key:
		return None

	entry = TAG_LIBRARY.get(key)
	if not isinstance(entry, dict):
		return None

	reason = str(entry.get("reason", "")).strip()
	focus_area = str(entry.get("focus_area", entry.get("focus", "N/A"))).strip() or "N/A"
	if not reason:
		return None

	return {"reason": reason, "focus_area": focus_area}


def generate_reasoning(misconception_tag, topic, question_text=None, student_answer=None, correct_answer=None):
	"""Generate feedback for a misconception.

	Order of preference:
	1. Tag-specific canned feedback from assesment_agent/tags.json
	2. Simple rule-based feedback using topic when LLM is disabled or no API key
	3. Mistral LLM call when USE_LLM=true and API key is set
	"""
	# 1) Tag-based, deterministic feedback (no network required)
	tag_payload = _tag_based_feedback(misconception_tag, topic)
	if tag_payload:
		return tag_payload

	# 2) Lightweight rule-based feedback when LLM is disabled or not configured
	api_key = _get_api_key()
	topic_lower = str(topic or "").lower()
	if not USE_LLM or not api_key:
		if "refract" in topic_lower or "lens" in topic_lower:
			reason = (
				"The answers suggest confusion about how light bends when it changes "
				"medium (refraction). Focus on how speed changes at the boundary and "
				"how we measure the angle from the normal."
			)
			focus_area = "Highlight incident and refracted rays with the normal at the interface."
		elif "reflect" in topic_lower or "mirror" in topic_lower:
			reason = (
				"The answers indicate a misunderstanding of the laws of reflection, "
				"especially that the angle of incidence equals the angle of reflection "
				"and both are measured from the normal, not the mirror surface."
			)
			focus_area = "Highlight the normal line and mark equal angles i and r."
		else:
			reason = (
				"The responses show a gap in the core idea for this topic. "
				"Revisit the main definition and walk through one worked example step by step."
			)
			focus_area = "Highlight the key diagram or formula that summarises the concept."

		return {"reason": reason, "focus_area": focus_area}

	# 3) LLM-based feedback path when explicitly enabled
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

