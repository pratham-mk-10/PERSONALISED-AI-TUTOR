import json
import os

import google.generativeai as genai


FALLBACK_MODELS = [
	"gemini-1.5-flash-latest",
	"gemini-1.5-flash",
	"gemini-2.0-flash",
	"gemini-2.0-flash-lite",
]


def _get_api_key():
	return (os.getenv("GEMINI_API_KEY", "").strip() or os.getenv("GOOGLE_API_KEY", "").strip())


def _candidate_models():
	configured = os.getenv("GEMINI_MODEL", "").strip()
	if configured:
		return [configured, *[m for m in FALLBACK_MODELS if m != configured]]
	return FALLBACK_MODELS


def _friendly_error_message(exc):
	text = str(exc or "").lower()
	if "429" in text or "quota" in text or "rate" in text:
		return "LLM quota exceeded. Please wait and retry, or disable USE_LLM to use built-in feedback."
	if "api key" in text or "credential" in text or "permission" in text or "unauth" in text:
		return "LLM authentication failed. Check GEMINI_API_KEY and model access."
	return "LLM is temporarily unavailable. Using built-in feedback instead."


def _get_client():
	api_key = _get_api_key()
	if not api_key:
		return None
	genai.configure(api_key=api_key)
	return genai


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


def generate_reasoning(misconception_tag, topic):
	client = _get_client()

	if not client:
		return {
			"reason": "LLM is not configured. Set GEMINI_API_KEY (or GOOGLE_API_KEY) to enable explanations.",
			"focus_area": "N/A",
		}

	prompt = f"""
A student made a mistake in {topic}.

Misconception: {misconception_tag}

Explain the mistake clearly in one sentence.
Also suggest which part of the diagram should be highlighted.

Output JSON only with keys: reason, focus_area.
""".strip()

	response = None
	last_exc = None
	for model_name in _candidate_models():
		try:
			model = client.GenerativeModel(model_name)
			response = model.generate_content(
				prompt,
				generation_config={"temperature": 0.3},
			)
			break
		except Exception as exc:
			last_exc = exc

	if response is None:
		return {
			"reason": _friendly_error_message(last_exc),
			"focus_area": "N/A",
		}

	raw = getattr(response, "text", "") or ""
	parsed = _extract_json(raw)
	if not parsed:
		return {
			"reason": "Model returned non-JSON output.",
			"focus_area": "N/A",
		}

	reason = str(parsed.get("reason", "")).strip() or "Reason unavailable"
	focus_area = str(parsed.get("focus_area", "N/A")).strip() or "N/A"
	return {"reason": reason, "focus_area": focus_area}

