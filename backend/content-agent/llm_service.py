import os
from datetime import datetime
from typing import Optional
import importlib.util
from pathlib import Path

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


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

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY")) if OpenAI is not None else None


class ContentAgentLLMService:

    def __init__(self, db_connection_factory=None):
        self.db_connection_factory = db_connection_factory
        self.model = "gpt-4o-mini"

    def get_explanation(self, subtopic: str, misconception_tag: str, attempt: int) -> str:

        if attempt == 1:
            return "Try again and observe the diagram carefully."

        cached = self._get_from_cache(subtopic, misconception_tag, attempt)
        if cached:
            return cached

        prompt = build_explanation_prompt(subtopic, misconception_tag, attempt)

        explanation = self._call_llm(prompt)

        if not self._validate(explanation):
            explanation = self._fallback(misconception_tag)

        self._save_to_cache(subtopic, misconception_tag, attempt, explanation)

        return explanation

    def _call_llm(self, prompt: str) -> str:
        if client is None:
            return ""
        try:
            response = client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a clear physics teacher for a Class 10 student."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                max_tokens=200
            )

            return response.choices[0].message.content.strip()

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
