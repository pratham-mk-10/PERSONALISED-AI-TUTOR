import json
import os
import sys
from pathlib import Path

# ── Add backend root to sys.path so llm_gateway is importable ──────────────
_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from llm_gateway import call_llm  # centralised LLM gateway

try:
    from database.misconception_catalog import format_misconceptions_for_prompt
except ImportError:
    from backend.database.misconception_catalog import format_misconceptions_for_prompt


# ── Kept for external callers that check this flag ──────────────────────────
API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"


def _friendly_error_message(exc):
	text = str(exc or "").lower()
	if "429" in text or "quota" in text or "rate" in text:
		return "LLM quota exceeded. Please wait and retry, or disable USE_LLM to use built-in feedback."
	if "api key" in text or "credential" in text or "permission" in text or "unauth" in text or "401" in text:
		return "LLM authentication failed. Check GEMINI_API_KEY and model access."
	return "LLM is temporarily unavailable. Using built-in feedback instead."


def _post_chat_completion(api_key, system_instruction, user_prompt, temperature=0.3):
	"""Thin shim → delegates entirely to the centralised gateway."""
	try:
		return call_llm(
			system_instruction=system_instruction,
			user_prompt=user_prompt,
			temperature=temperature,
			max_tokens=600,
			json_mode=True,
		)
	except Exception:
		return ""


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

Explain why the student's answer is incorrect and what the correct concept is. Keep explanation clear and concise in 2-3 sentences. Do not use raw markdown bolding in explanation.
Also suggest which part of the diagram should be highlighted for learning.

Output JSON only with keys: reason, focus_area.
""".strip()

	try:
		raw = call_llm(
			system_instruction="You are a teaching assistant. Return JSON only with keys reason and focus_area.",
			user_prompt=prompt,
			temperature=0.3,
			max_tokens=600,
			json_mode=True,
		)
		parsed = _extract_json(raw)
		if not parsed:
			return {"reason": "Model returned non-JSON output.", "focus_area": "N/A"}
		reason = str(parsed.get("reason", "")).strip() or "Reason unavailable"
		focus_area = str(parsed.get("focus_area", "N/A")).strip() or "N/A"
		return {"reason": reason, "focus_area": focus_area}
	except Exception as exc:
		return {"reason": _friendly_error_message(exc), "focus_area": "N/A"}


def classify_misconception_tag(topic, question_text, student_answer, correct_answer, allowed_tags=None):
	"""Use the LLM to choose the best misconception tag.

	This is a lightweight "misconception model" implemented via prompt
	engineering. It returns one of a small, fixed set of tags so that
	Python code can make decisions (e.g., which video to show) without a
	separate ML classifier.
	"""
	allowed_tags = [str(tag).strip() for tag in (allowed_tags or []) if str(tag).strip()]
	allowed_block = format_misconceptions_for_prompt(topic)
	if allowed_tags:
		allowed_block_lines = []
		for line in allowed_block.splitlines():
			cleaned = line.lstrip("- ").strip()
			tag = cleaned.split(":", 1)[0].strip()
			if tag in allowed_tags:
				allowed_block_lines.append(line)
		if allowed_block_lines:
			allowed_block = "\n".join(allowed_block_lines)
		else:
			allowed_block = "\n".join(f"- {tag}" for tag in allowed_tags)

	context = f"Topic: {topic}\nQuestion: {question_text}\nStudent's answer: {student_answer}\nCorrect answer: {correct_answer}"

	prompt = f"""
You are an expert NCERT Class 10 physics teacher.

Your task is to classify the student's main misconception for a question on reflection.

Use ONLY the allowed tags for this topic:
{allowed_block}

If no specific tag fits, use general_concept_gap.

{context}

Pick the SINGLE best tag from the list above.

Return STRICT JSON ONLY:
{{"tag": "<chosen_tag>"}}
""".strip()

	try:
		raw = call_llm(
			system_instruction="You are a teaching assistant. Return JSON only with key 'tag'.",
			user_prompt=prompt,
			temperature=0.1,
			max_tokens=200,
			json_mode=True,
		)
		parsed = _extract_json(raw) or {}
		tag = str(parsed.get("tag", "")).strip()
		if tag not in allowed_tags:
			return None
		return tag
	except Exception:
		return None
