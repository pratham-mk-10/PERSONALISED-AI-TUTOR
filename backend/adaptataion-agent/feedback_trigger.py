import json
import os

from openai import OpenAI


def _get_client():
	api_key = os.getenv("OPENAI_API_KEY", "").strip()
	if not api_key:
		return None
	return OpenAI(api_key=api_key)


def generate_reasoning(misconception_tag, topic):
	client = _get_client()

	if not client:
		return {
			"reason": "LLM is not configured. Set OPENAI_API_KEY to enable explanations.",
			"focus_area": "N/A",
		}

	prompt = f"""
A student made a mistake in {topic}.

Misconception: {misconception_tag}

Explain the mistake clearly in one sentence.
Also suggest which part of the diagram should be highlighted.

Output JSON only with keys: reason, focus_area.
""".strip()

	try:
		response = client.chat.completions.create(
			model="gpt-4o-mini",
			messages=[{"role": "user", "content": prompt}],
			temperature=0.3,
		)
	except Exception as exc:
		return {
			"reason": f"LLM call failed: {exc}",
			"focus_area": "N/A",
		}

	raw = (response.choices[0].message.content or "").strip()

	try:
		parsed = json.loads(raw)
		reason = str(parsed.get("reason", "")).strip() or "Reason unavailable"
		focus_area = str(parsed.get("focus_area", "N/A")).strip() or "N/A"
		return {"reason": reason, "focus_area": focus_area}
	except json.JSONDecodeError:
		return {
			"reason": "Model returned non-JSON output.",
			"focus_area": "N/A",
		}

