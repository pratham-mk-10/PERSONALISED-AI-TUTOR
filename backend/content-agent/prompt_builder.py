import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
FILE = ROOT / "shared" / "misconception_tags.json"


def load_data():
    with open(FILE, "r", encoding="utf-8") as f:
        return json.load(f)


DATA = load_data()


def get_misconception(tag):
    return DATA.get(tag)


def build_explanation_prompt(subtopic, misconception_tag, attempt):

    m = get_misconception(misconception_tag)

    if not m:
        return "Explain reflection clearly."

    base = f"""
Topic: {subtopic}

Student mistake:
{m.get("explanation", "")}

Focus:
{m.get("focus_area", "")}
"""

    if attempt == 2:
        strategy = """
Explain briefly what the mistake is and what is correct.
"""
    else:
        strategy = """
Explain step-by-step like a teacher with simple reasoning.
"""

    return base + strategy
