import json
import importlib.util
import os
from datetime import datetime
from pathlib import Path
from typing import Optional
from urllib import error, request

from dotenv import load_dotenv


def _load_prompt_builder():
    base_dir = Path(__file__).resolve().parent
    file_path = base_dir / "prompt_builder.py"
    spec = importlib.util.spec_from_file_location("content_agent_prompt_builder", file_path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Unable to load module from {file_path}")

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


build_explanation_prompt = _load_prompt_builder().build_explanation_prompt
build_dynamic_feedback_prompt = _load_prompt_builder().build_dynamic_feedback_prompt

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


def _post_chat_completion(api_key, system_instruction, user_prompt):
    url = f"{API_URL}?key={api_key}"
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": user_prompt}]
            }
        ],
        "generationConfig": {
            "temperature": 0.4,
            "maxOutputTokens": 4096
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
        with request.urlopen(req, timeout=15) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            try:
                return res["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError):
                return ""
    except Exception as e:
        # Fallback to mistral
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
            "temperature": 0.4,
            "max_tokens": 4096
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
            with request.urlopen(m_req, timeout=15) as m_resp:
                m_res = json.loads(m_resp.read().decode("utf-8"))
                return m_res["choices"][0]["message"]["content"]
        except Exception:
            return ""


class ContentAgentLLMService:

    def __init__(self, db_connection_factory=None):
        self.db_connection_factory = db_connection_factory
        self.model = "gemini-1.5-flash"

    def get_explanation(
        self,
        subtopic: str,
        misconception_tag: str,
        attempt: int = 1,
        question_text: Optional[str] = None,
        student_answer: Optional[str] = None,
        correct_answer: Optional[str] = None,
        use_cache: bool = False
    ) -> str:

        if attempt == 1:
            return "Try again and observe the diagram carefully."

        if use_cache:
            cached = self._get_from_cache(subtopic, misconception_tag, attempt)
            if cached:
                return cached

        prompt = build_explanation_prompt(
            subtopic,
            misconception_tag,
            attempt,
            question_text=question_text,
            student_answer=student_answer,
            correct_answer=correct_answer,
        )

        explanation = self._call_llm(prompt)

        if not self._validate(explanation):
            explanation = self._fallback(misconception_tag)

        if use_cache:
            self._save_to_cache(subtopic, misconception_tag, attempt, explanation)

        return explanation

    def get_dynamic_feedback(
        self,
        subtopic: str,
        misconception_tag: str,
        question_text: Optional[str] = None,
        student_answer: Optional[str] = None
    ) -> dict:
        prompt = build_dynamic_feedback_prompt(
            subtopic,
            misconception_tag,
            question_text=question_text,
            student_answer=student_answer
        )
        
        response = self._call_llm(prompt)
        
        # Clean up markdown code blocks if the LLM added them
        if response.startswith("```json"):
            response = response[7:]
        if response.startswith("```"):
            response = response[3:]
        if response.endswith("```"):
            response = response[:-3]
            
        try:
            return json.loads(response.strip())
        except json.JSONDecodeError:
            # Fallback if parsing fails
            return {}

    def _call_llm(self, prompt: str) -> str:
        _load_env_files()
        use_llm = os.getenv("USE_LLM", "false").lower() in {"1", "true", "yes"}
        if not use_llm:
            return ""

        api_key = _get_api_key()
        if not api_key:
            return ""
        try:
            system_instruction = "You are a clear NCERT physics teacher for a Class 10 student. Return a direct teaching explanation only."
            return _post_chat_completion(api_key, system_instruction, prompt)
        except Exception:
            return ""

    def _validate(self, text: str) -> bool:
        return bool(text) and len(text) > 40

    def _fallback(self, misconception_tag: str) -> str:
        return f"Focus on correcting this idea: {misconception_tag.replace('_', ' ')}"

    def _get_from_cache(self, subtopic: str, misconception_tag: str, attempt: int) -> Optional[str]:
        try:
            query = """
            SELECT explanation_text FROM explanation_cache
            WHERE subtopic=%s AND misconception_tag=%s AND attempt=%s
            LIMIT 1
            """
            if self.db_connection_factory is None:
                return None

            conn = self.db_connection_factory()
            try:
                cur = conn.cursor()
                cur.execute(query, (subtopic, misconception_tag, attempt))
                row = cur.fetchone()
                return row[0] if row else None
            finally:
                conn.close()
        except Exception:
            return None

    def _save_to_cache(self, subtopic: str, misconception_tag: str, attempt: int, explanation: str):
        try:
            if self.db_connection_factory is None:
                return

            query = """
            INSERT INTO explanation_cache (subtopic, misconception_tag, attempt, explanation_text, created_at)
            VALUES (%s, %s, %s, %s, %s)
            """
            conn = self.db_connection_factory()
            try:
                cur = conn.cursor()
                cur.execute(query, (
                    subtopic,
                    misconception_tag,
                    attempt,
                    explanation,
                    datetime.now()
                ))
                conn.commit()
            finally:
                conn.close()
        except Exception:
            pass
