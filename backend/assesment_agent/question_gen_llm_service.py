import json
import requests
import os
from pathlib import Path
import re
from dotenv import load_dotenv

BACKEND_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(dotenv_path=BACKEND_ROOT / ".env")

API_URL = "https://api.mistral.ai/v1/chat/completions"

def _get_api_key():
    # Reload env each request to pick up updates without relying on import-time values.
    load_dotenv(dotenv_path=BACKEND_ROOT / ".env", override=False)
    return (
        os.getenv("MISTRAL_API_KEY")
        or os.getenv("MISTRAL_API_TOKEN")
        or os.getenv("MISTRAL_KEY")
    )


def _extract_topic(prompt: str) -> str:
    match = re.search(r"video topic:\s*(.+?)\\.", prompt, flags=re.IGNORECASE | re.DOTALL)
    if match:
        return match.group(1).strip().lower()
    return "laws of reflection"


def _fallback_response(prompt):
    topic = _extract_topic(prompt)

    if "refraction" in topic:
        questions = [
            {
                "question_text": "When light goes from air into glass, it usually bends towards which direction?",
                "options": ["Away from the normal", "Towards the normal", "Parallel to the surface", "No bending occurs"],
                "correct": 1,
                "type": "mcq",
            },
            {
                "question_text": "The refractive index of a medium mainly depends on:",
                "options": ["Its mass only", "Speed of light in that medium", "Its color only", "Its shape"],
                "correct": 1,
                "type": "mcq",
            },
            {
                "question_text": "In a rectangular glass slab, the emergent ray is generally:",
                "options": ["Perpendicular to incident ray", "Parallel to incident ray", "Always along normal", "Random in direction"],
                "correct": 1,
                "type": "mcq",
            },
        ]
    elif "plane mirror" in topic:
        questions = [
            {
                "question_text": "An image formed by a plane mirror is:",
                "options": ["Real and inverted", "Virtual and erect", "Real and diminished", "Virtual and inverted"],
                "correct": 1,
                "type": "mcq",
            },
            {
                "question_text": "The image distance in a plane mirror is:",
                "options": ["Half the object distance", "Equal to object distance", "Twice the object distance", "Zero"],
                "correct": 1,
                "type": "mcq",
            },
            {
                "question_text": "Which feature is associated with plane mirror images?",
                "options": ["Lateral inversion", "Dispersion", "Refraction only", "Convergence of rays"],
                "correct": 0,
                "type": "mcq",
            },
        ]
    else:
        questions = [
            {
                "question_text": "According to the first law of reflection, angle of incidence is equal to:",
                "options": ["Angle of refraction", "Angle of reflection", "Angle of emergence", "Angle of deviation"],
                "correct": 1,
                "type": "mcq",
            },
            {
                "question_text": "In reflection, the incident ray, reflected ray, and the normal at the point of incidence lie in:",
                "options": ["Different planes", "The same plane", "A curved path", "Opposite media"],
                "correct": 1,
                "type": "mcq",
            },
            {
                "question_text": "If the angle of incidence is 35 degrees, the angle of reflection is:",
                "options": ["25 degrees", "35 degrees", "45 degrees", "70 degrees"],
                "correct": 1,
                "type": "mcq",
            },
        ]

    return json.dumps(questions)


def generate_text(prompt):
    api_key = _get_api_key()

    if not api_key:
        return _fallback_response(prompt)

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "mistral-large-latest",  # 🔥 BEST available from Mistral API
        "messages": [
            {"role": "system", "content": "You are a physics teacher."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 800
    }

    try:
        response = requests.post(API_URL, headers=headers, json=data, timeout=30)
        response.raise_for_status()
        result = response.json()
        return result["choices"][0]["message"]["content"]
    except Exception:
        return _fallback_response(prompt)