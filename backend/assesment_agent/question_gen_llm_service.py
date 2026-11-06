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
            load_dotenv(dotenv_path=env_path, override=True)


_load_env_files()

API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

def _get_api_key():
    # Reload env each request to pick up updates without relying on import-time values.
    _load_env_files()
    return os.getenv("GEMINI_API_KEY", "").strip()


def _extract_topic(prompt: str) -> str:
    match = re.search(r"video topic:\s*(.+?)\.", prompt, flags=re.IGNORECASE | re.DOTALL)
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

    if "laws of reflection" in topic:
        base = 5
    elif "spherical mirror" in topic or "concave" in topic or "convex" in topic:
        base = 6
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

    if "laws of reflection" in topic or "first law of reflection" in topic or "second law of reflection" in topic:
        question_pool = [
            {
                "question_text": "According to the laws of reflection, the angle of incidence is equal to:",
                "options": ["Angle of refraction", "Angle of reflection", "Angle of emergence", "Angle of deviation"],
                "correct": 1,
                "type": "mcq",
            },
            {
                "question_text": "The incident ray, reflected ray, and the normal at the point of incidence lie in:",
                "options": ["Different planes", "The same plane", "A curved plane only", "No fixed plane"],
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
                "question_text": "Which statement best describes reflection of light from a plane mirror?",
                "options": [
                    "The reflected ray bends towards the surface",
                    "Angle of incidence equals angle of reflection",
                    "Light always turns into the mirror",
                    "The normal and reflected ray are never related",
                ],
                "correct": 1,
                "type": "mcq",
            },
            {
                "question_text": "A correct ray diagram for reflection should show the incident ray, reflected ray, and normal:",
                "options": [
                    "In the same plane",
                    "On separate sheets",
                    "Without a normal line",
                    "With the reflected ray always parallel to the mirror",
                ],
                "correct": 0,
                "type": "mcq",
            },
        ]
    elif "spherical mirror" in topic or "concave" in topic or "convex" in topic:
        question_pool = [
            {
                "question_text": "A spherical mirror that bulges outward is called:",
                "options": ["Concave mirror", "Convex mirror", "Plane mirror", "Parabolic mirror"],
                "correct": 1,
                "type": "mcq",
            },
            {
                "question_text": "The point at the middle of a spherical mirror is called the:",
                "options": ["Focus", "Pole", "Centre of curvature", "Aperture"],
                "correct": 1,
                "type": "mcq",
            },
            {
                "question_text": "The centre of curvature of a spherical mirror lies on the:",
                "options": ["Mirror surface", "Principal axis", "Normal only", "Reflected ray"],
                "correct": 1,
                "type": "mcq",
            },
            {
                "question_text": "For a spherical mirror, the relation between radius of curvature and focal length is:",
                "options": ["R = f", "R = 2f", "R = 3f", "R = f/2"],
                "correct": 1,
                "type": "mcq",
            },
            {
                "question_text": "A concave mirror can form a real image when the object is:",
                "options": ["Always behind the mirror", "Beyond the focus", "Only at the pole", "Always at the centre of curvature"],
                "correct": 1,
                "type": "mcq",
            },
            {
                "question_text": "Convex mirrors are commonly used as rear-view mirrors because they:",
                "options": ["Form a magnified real image", "Give a wide field of view", "Always make objects inverted", "Focus light to a single point"],
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
                "question_text": "According to the laws of reflection, the angle of incidence is equal to:",
                "options": ["Angle of refraction", "Angle of reflection", "Angle of emergence", "Angle of deviation"],
                "correct": 1,
                "type": "mcq",
            },
            {
                "question_text": "The incident ray, reflected ray, and the normal at the point of incidence lie in:",
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
                "question_text": "Which statement is true for reflection from a plane mirror?",
                "options": ["Only the first law applies", "Only the second law applies", "Both reflection laws apply together", "No normal is needed"],
                "correct": 2,
                "type": "mcq",
            },
            {
                "question_text": "A correct ray diagram for reflection should show the incident ray, reflected ray, and normal:",
                "options": ["In the same plane", "On separate sheets", "Without a normal line", "With the reflected ray always parallel to the mirror"],
                "correct": 0,
                "type": "mcq",
            },
        ]

    questions = question_pool[:target_count]
    return json.dumps(questions)


def generate_text(prompt):
    """Generate question text via the centralised llm_gateway (Gemini + Mistral fallback)."""
    import sys as _sys
    from pathlib import Path as _Path
    _backend_root = str(_Path(__file__).resolve().parents[1])
    if _backend_root not in _sys.path:
        _sys.path.insert(0, _backend_root)
    from llm_gateway import call_llm

    system_instruction = (
        "You are an expert physics teacher. "
        "You must output perfectly formatted JSON. Do not include markdown blocks."
    )
    try:
        content = call_llm(
            system_instruction=system_instruction,
            user_prompt=prompt,
            temperature=0.4,
            max_tokens=8192,
            json_mode=True,
        )
        # Wrap bare JSON arrays in {"questions": [...]} for downstream parsing
        content_stripped = content.strip()
        if content_stripped.startswith("[") and content_stripped.endswith("]"):
            content = f'{{"questions": {content}}}'
        return content
    except Exception as exc:
        print(f"generate_text: LLM gateway failed ({exc}), using fallback.")
        return _fallback_response(prompt)