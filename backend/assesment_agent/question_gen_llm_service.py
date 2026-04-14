import json
import requests
import os
from pathlib import Path
import re
from dotenv import load_dotenv

BACKEND_ROOT = Path(__file__).resolve().parent.parent
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

API_URL = "https://api.mistral.ai/v1/chat/completions"

def _get_api_key():
    # Reload env each request to pick up updates without relying on import-time values.
    _load_env_files()
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


def _extract_question_count(prompt: str) -> int | None:
    match = re.search(r"Return up to\s*(\d+)\s*questions", prompt, flags=re.IGNORECASE)
    if match:
        try:
            return max(2, min(int(match.group(1)), 8))
        except ValueError:
            return None
    return None


def _extract_difficulty(prompt: str) -> str:
    match = re.search(r"Difficulty level:\s*(easy|medium|hard)", prompt, flags=re.IGNORECASE)
    if match:
        return match.group(1).strip().lower()
    return "easy"


def _decide_dynamic_count(topic: str, difficulty: str) -> int:
    topic = (topic or "").lower()
    difficulty = (difficulty or "easy").lower()

    if "first law of reflection" in topic or "second law of reflection" in topic:
        base = 3
    elif "plane mirror" in topic:
        base = 4
    elif "refraction" in topic:
        base = 6
    else:
        base = 5

    if difficulty == "hard":
        base += 1
    elif difficulty == "easy":
        base -= 1

    return max(2, min(base, 8))


def _fallback_response(prompt):
    topic = _extract_topic(prompt)
    requested_count = _extract_question_count(prompt)
    difficulty = _extract_difficulty(prompt)
    target_count = requested_count or _decide_dynamic_count(topic, difficulty)

    if "first law of reflection" in topic:
        question_pool = [
            {
                "question_text": "According to the first law of reflection, angle of incidence is equal to:",
                "options": ["Angle of refraction", "Angle of reflection", "Angle of emergence", "Angle of deviation"],
                "correct": 1,
                "type": "mcq",
            },
            {
                "question_text": "If the angle of incidence is 35 degrees, the angle of reflection is:",
                "options": ["25 degrees", "35 degrees", "45 degrees", "70 degrees"],
                "correct": 1,
                "type": "mcq",
            },
            {
                "question_text": "A ray strikes a mirror with incidence angle 50 degrees. Which reflection angle is correct?",
                "options": ["40 degrees", "50 degrees", "60 degrees", "100 degrees"],
                "correct": 1,
                "type": "mcq",
            },
            {
                "question_text": "If angle of incidence increases from 20 degrees to 45 degrees, the reflected angle becomes:",
                "options": ["20 degrees", "25 degrees", "45 degrees", "65 degrees"],
                "correct": 2,
                "type": "mcq",
            },
        ]
    elif "second law of reflection" in topic:
        question_pool = [
            {
                "question_text": "In reflection, the incident ray, reflected ray, and normal at the point of incidence lie in:",
                "options": ["Different planes", "The same plane", "A curved plane only", "No fixed plane"],
                "correct": 1,
                "type": "mcq",
            },
            {
                "question_text": "Which statement best represents the second law of reflection?",
                "options": [
                    "Angle of incidence equals angle of reflection",
                    "Incident and reflected rays are always parallel",
                    "Incident ray, normal, and reflected ray are coplanar",
                    "Reflected ray always passes through focus"
                ],
                "correct": 2,
                "type": "mcq",
            },
            {
                "question_text": "If a drawn normal is not in the same plane as the rays, which law is violated?",
                "options": ["Snell's law", "Second law of reflection", "Mirror formula", "Power of lens relation"],
                "correct": 1,
                "type": "mcq",
            },
            {
                "question_text": "The second law mainly describes:",
                "options": ["Equality of angles", "Coplanarity of rays and normal", "Image size", "Refraction direction"],
                "correct": 1,
                "type": "mcq",
            },
        ]
    elif "refraction" in topic:
        question_pool = [
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
            {
                "question_text": "A medium with higher refractive index is usually:",
                "options": ["Optically rarer", "Optically denser", "Always transparent", "Always colorless"],
                "correct": 1,
                "type": "mcq",
            },
            {
                "question_text": "Snell's law relates:",
                "options": ["Focal length and power", "Sine of angles and refractive indices", "Image distance and object distance", "Speed and wavelength only in vacuum"],
                "correct": 1,
                "type": "mcq",
            },
            {
                "question_text": "When light enters a rarer medium from denser medium, it bends:",
                "options": ["Towards the normal", "Away from the normal", "Along the normal always", "Without changing speed"],
                "correct": 1,
                "type": "mcq",
            },
        ]
    elif "plane mirror" in topic:
        question_pool = [
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
            {
                "question_text": "The size of image in a plane mirror is:",
                "options": ["Larger than object", "Smaller than object", "Equal to object", "Zero"],
                "correct": 2,
                "type": "mcq",
            },
            {
                "question_text": "If an object moves 1 m towards a plane mirror, the image moves:",
                "options": ["0.5 m towards mirror", "1 m towards mirror", "2 m towards mirror", "No movement"],
                "correct": 1,
                "type": "mcq",
            },
        ]
    else:
        question_pool = [
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
            {
                "question_text": "Which instrument commonly uses reflection to form clear images?",
                "options": ["Periscope", "Thermometer", "Barometer", "Voltmeter"],
                "correct": 0,
                "type": "mcq",
            },
        ]

    questions = question_pool[:target_count]
    return json.dumps(questions)


def generate_text(prompt):
    api_key = _get_api_key()

    if not api_key:
        raise RuntimeError("Mistral API key is missing. Add it to backend/.env or backend/env")

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
        "temperature": 0.4,
        "max_tokens": 800
    }

    try:
        response = requests.post(API_URL, headers=headers, json=data, timeout=60)
        response.raise_for_status()
        result = response.json()
        return result["choices"][0]["message"]["content"]
    except requests.Timeout as exc:
        raise RuntimeError("Mistral request timed out") from exc
    except requests.HTTPError as exc:
        status_code = exc.response.status_code if exc.response is not None else "unknown"
        raise RuntimeError(f"Mistral API returned HTTP {status_code}") from exc
    except Exception as exc:
        raise RuntimeError("Mistral request failed") from exc