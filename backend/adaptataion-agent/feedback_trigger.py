import json
import os
from pathlib import Path
from urllib import error, request
from dotenv import load_dotenv

from database.misconception_catalog import format_misconceptions_for_prompt

API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent"
BACKEND_ROOT = Path(__file__).resolve().parents[1]
_ENV_CANDIDATES = [
	BACKEND_ROOT / ".env",
	BACKEND_ROOT / "env",
	BACKEND_ROOT.parent / ".env",
]


def _load_env_files():
	for env_path in _ENV_CANDIDATES:
		if env_path.exists():
			load_dotenv(dotenv_path=env_path, override=False)


_load_env_files()


def _get_api_key():
	_load_env_files()
	return os.getenv("GEMINI_API_KEY", "").strip()


def _friendly_error_message(exc):
	text = str(exc or "").lower()
	if "429" in text or "quota" in text or "rate" in text:
		return "LLM quota exceeded. Please wait and retry, or disable USE_LLM to use built-in feedback."
	if "api key" in text or "credential" in text or "permission" in text or "unauth" in text or "401" in text:
		return "LLM authentication failed. Check GEMINI_API_KEY and model access."
	return "LLM is temporarily unavailable. Using built-in feedback instead."


def _post_chat_completion(api_key, system_instruction, user_prompt, temperature=0.3):
	url = f"{API_URL}?key={api_key}"
	payload = {
		"contents": [
			{
				"role": "user",
				"parts": [{"text": user_prompt}]
			}
		],
		"generationConfig": {
			"temperature": temperature,
			"maxOutputTokens": 600,
			"responseMimeType": "application/json"
		}
	}
	if system_instruction:
		payload["systemInstruction"] = {
			"parts": [{"text": system_instruction}]
		}
	
	body = json.dumps(payload).encode("utf-8")
	req = request.Request(
		url,
		data=body,
		headers={
			"Content-Type": "application/json"
		},
		method="POST",
	)

	try:
		with request.urlopen(req, timeout=20) as resp:
			res = json.loads(resp.read().decode("utf-8"))
			try:
				return res["candidates"][0]["content"]["parts"][0]["text"]
			except (KeyError, IndexError):
				return ""
	except Exception as e:
		mistral_key = os.getenv("MISTRAL_API_KEY", "").strip()
		if not mistral_key:
			return ""
		
		mistral_url = "https://api.mistral.ai/v1/chat/completions"
		mistral_payload = {
			"model": "mistral-small-latest",
			"messages": [
				{"role": "system", "content": system_instruction},
				{"role": "user", "content": user_prompt}
			],
			"temperature": temperature,
			"max_tokens": 600,
			"response_format": {"type": "json_object"}
		}
		m_req = request.Request(
			mistral_url,
			data=json.dumps(mistral_payload).encode("utf-8"),
			headers={
				"Authorization": f"Bearer {mistral_key}",
				"Content-Type": "application/json"
			},
			method="POST",
		)
		try:
			with request.urlopen(m_req, timeout=20) as m_resp:
				m_res = json.loads(m_resp.read().decode("utf-8"))
				return m_res["choices"][0]["message"]["content"]
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
	api_key = _get_api_key()

	if not api_key:
		return {
			"reason": "LLM is not configured. Set GEMINI_API_KEY to enable explanations.",
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

Explain why the student's answer is incorrect and what the correct concept is. Keep explanation clear and concise in 2-3 sentences. Do not use raw markdown bolding in explanation.
Also suggest which part of the diagram should be highlighted for learning.

Output JSON only with keys: reason, focus_area.
""".strip()

	try:
		raw = _post_chat_completion(
			api_key,
			"You are a teaching assistant. Return JSON only with keys reason and focus_area.",
			prompt,
			temperature=0.3
		)
		parsed = _extract_json(raw)
		if not parsed:
			return {
				"reason": "Model returned non-JSON output.",
				"focus_area": "N/A",
			}
		reason = str(parsed.get("reason", "")).strip() or "Reason unavailable"
		focus_area = str(parsed.get("focus_area", "N/A")).strip() or "N/A"
		return {"reason": reason, "focus_area": focus_area}
	except Exception as exc:
		return {
			"reason": _friendly_error_message(exc),
			"focus_area": "N/A",
		}


def classify_misconception_tag(topic, question_text, student_answer, correct_answer, allowed_tags=None):
	"""Use the LLM to choose the best misconception tag.

	This is a lightweight "misconception model" implemented via prompt
	engineering. It returns one of a small, fixed set of tags so that
	Python code can make decisions (e.g., which video to show) without a
	separate ML classifier.
	"""
	api_key = _get_api_key()
	if not api_key:
		return None

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
		raw = _post_chat_completion(
			api_key,
			"You are a teaching assistant. Return JSON only with key 'tag'.",
			prompt,
			temperature=0.1
		)
		parsed = _extract_json(raw) or {}
		tag = str(parsed.get("tag", "")).strip()
		if tag not in allowed_tags:
			return None
		return tag
	except Exception:
		return None


def classify_misconception_tags_batch(topic, items, allowed_tags=None):
	"""Use the LLM to classify multiple misconceptions in a single batch to avoid rate limits."""
	api_key = _get_api_key()
	if not api_key or not items:
		return {}

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

	context = ""
	for i, item in enumerate(items):
		context += f"\nItem {i}:\nQuestion: {item['question_text']}\nStudent's answer: {item['student_answer']}\nCorrect answer: {item['correct_answer']}\n"

	prompt = f"""
You are an expert NCERT Class 10 physics teacher.

Your task is to classify the student's main misconception for several questions.

Use ONLY the allowed tags for this topic:
{allowed_block}

If no specific tag fits, use general_concept_gap.

{context}

Return STRICT JSON ONLY, mapping each Item index to its chosen tag. Example:
{{"0": "<tag_for_item_0>", "1": "<tag_for_item_1>"}}
""".strip()

	try:
		raw = _post_chat_completion(
			api_key,
			"You are a teaching assistant. Return JSON only.",
			prompt,
			temperature=0.1
		)
		parsed = _extract_json(raw) or {}
		
		results = {}
		for i, _ in enumerate(items):
			tag = str(parsed.get(str(i), "")).strip()
			if tag and (not allowed_tags or tag in allowed_tags):
				results[i] = tag
		return results
	except Exception:
		return {}

