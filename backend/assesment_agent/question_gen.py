import json
import re
from assesment_agent.question_gen_llm_service import generate_text


def build_prompt(topic, difficulty="easy"):
    return f"""
Generate 5 HIGHLY ACCURATE MCQs on {topic}.

Rules:
- Class 10 NCERT physics
- No conceptual errors
- Include misconceptions
- 4 options only
- One correct answer

Return STRICT JSON ONLY:

[
  {{
    "question_text": "...",
    "options": ["A","B","C","D"],
    "correct": 0,
    "type": "mcq"
  }}
]
"""


def generate_questions(topic, difficulty="easy"):
    prompt = build_prompt(topic, difficulty)

    raw_output = generate_text(prompt)

    try:
        # 🔥 Extract JSON safely
        start = raw_output.find("[")
        end = raw_output.rfind("]") + 1

        json_str = raw_output[start:end]

        questions = json.loads(json_str)

        for q in questions:
          text = str(q.get("question_text", "")).strip()
          # Remove common numbering prefixes like "1.", "Q1:", or "(2)".
          text = re.sub(r"^\s*(?:q\s*)?\(?\d+\)?[\.:\-\)]\s*", "", text, flags=re.IGNORECASE)
          q["question_text"] = text

        return questions

    except Exception as e:
        print("Parsing error:", e)
        print(raw_output)
        return []