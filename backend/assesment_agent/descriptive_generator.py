import json
import os
import sys
from pathlib import Path

# Add backend and content-agent to path to import llm_service
BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(BACKEND_ROOT / "content-agent"))

try:
    from database.connection import get_connection
except ImportError:
    from backend.database.connection import get_connection

from llm_service import _post_chat_completion, _get_api_key

class DescriptiveGenerator:
    def __init__(self):
        self.api_key = _get_api_key()

    def generate_descriptive_questions(self, topic: str, count: int = 3) -> list:
        # Generate descriptive questions using LLM
        system_instruction = """You are an expert Class 10 Physics teacher grading and generating test materials for Class 10 NCERT Chapter 9: Light - Reflection and Refraction.
Your task is to generate high-quality descriptive/explanation-based questions.
Each question must test deep conceptual understanding and ask the student to explain a physical phenomenon, law, or ray diagram rule in their own words.

Output your questions strictly as a JSON object with the following structure. Do not output any markdown code blocks, just raw JSON.
{
  "questions": [
    {
      "question_text": "Detailed descriptive question text...",
      "rubric_items": [
        "Key point 1 that should be included in the answer.",
        "Key point 2 that should be included in the answer."
      ],
      "required_keywords": ["keyword1", "keyword2", "keyword3"]
    }
  ]
}"""

        prompt = f"""
Topic: {topic}
Syllabus Scope: NCERT Class 10 Chapter 9 Light (Reflection/Refraction).
Generate exactly {count} distinct descriptive questions for the topic "{topic}".
Provide a clear grading rubric of 2-4 points and a list of 5-10 required keywords/phrases for each question.
Make sure the questions are varied, conceptual, and encourage the student to explain "why" or "how" something happens.
"""
        try:
            response_text = _post_chat_completion(self.api_key, system_instruction, prompt)
        except Exception as e:
            print(f"LLM request failed in DescriptiveGenerator: {e}")
            return []

        cleaned = response_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        try:
            parsed = json.loads(cleaned)
            if isinstance(parsed, list):
                return parsed
            elif isinstance(parsed, dict):
                return parsed.get("questions", [])
            return []
        except json.JSONDecodeError:
            try:
                start = cleaned.find("[")
                end = cleaned.rfind("]") + 1
                if start >= 0 and end > start:
                    parsed = json.loads(cleaned[start:end])
                    if isinstance(parsed, list):
                        return parsed
            except Exception:
                pass
            print("Failed to decode JSON from LLM in DescriptiveGenerator:")
            print(response_text)
            return []

    def save_questions_to_db(self, topic: str, questions: list) -> list:
        if not questions:
            return []

        conn = get_connection()
        cur = conn.cursor()
        saved_questions = []

        for q in questions:
            q_text = q.get("question_text")
            rubric = q.get("rubric_items")
            keywords = q.get("required_keywords")

            if not q_text or not rubric or not keywords:
                continue

            try:
                cur.execute(
                    """
                    INSERT INTO descriptive_questions (topic, question_text, rubric_items, required_keywords)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (question_text) DO UPDATE SET
                        topic = EXCLUDED.topic,
                        rubric_items = EXCLUDED.rubric_items,
                        required_keywords = EXCLUDED.required_keywords
                    RETURNING id, topic, question_text, rubric_items, required_keywords;
                    """,
                    (topic, q_text, json.dumps(rubric), keywords)
                )
                row = cur.fetchone()
                if row:
                    saved_questions.append({
                        "id": row[0],
                        "topic": row[1],
                        "question_text": row[2],
                        "rubric_items": row[3],
                        "required_keywords": row[4]
                    })
            except Exception as e:
                print(f"Error saving generated descriptive question: {e}")
                conn.rollback()

        conn.commit()
        conn.close()
        return saved_questions
