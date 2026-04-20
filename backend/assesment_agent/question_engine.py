from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path
import re
from typing import Any, Dict, List

base_dir = Path(__file__).resolve().parent
question_gen_spec = spec_from_file_location("assesment_agent.question_gen", base_dir / "question_gen.py")
question_gen_module = module_from_spec(question_gen_spec)
question_gen_spec.loader.exec_module(question_gen_module)
llm_generate_questions = question_gen_module.generate_questions
default_syllabus_scope = question_gen_module.SYLLABUS_SCOPE
syllabus_scope = default_syllabus_scope


def _is_valid_mcq(item: Dict[str, Any]) -> bool:
    if not isinstance(item, dict):
        return False

    if item.get("type") != "mcq":
        return False

    question_text = item.get("question_text")
    if not isinstance(question_text, str) or not question_text.strip():
        return False

    options = item.get("options")
    if not isinstance(options, list) or len(options) != 4:
        return False
    if not all(isinstance(option, str) and option.strip() for option in options):
        return False

    correct = item.get("correct")
    if not isinstance(correct, int) or not 0 <= correct < len(options):
        return False

    return True


def _topic_keywords(topic: str) -> list[str]:
    t = (topic or "").strip().lower()
    if "first law of reflection" in t or "second law of reflection" in t or "laws of reflection" in t:
        return [
            "law of reflection",
            "angle of incidence",
            "angle of reflection",
            "i = r",
            "same plane",
            "coplanar",
            "incident ray",
            "reflected ray",
            "normal",
        ]
    if "spherical mirror" in t or "concave" in t or "convex" in t:
        return [
            "spherical mirror",
            "concave",
            "convex",
            "pole",
            "centre of curvature",
            "center of curvature",
            "principal axis",
            "principal focus",
            "focal length",
            "aperture",
            "mirror formula",
            "magnification",
        ]
    if "plane mirror" in t:
        return ["plane mirror", "lateral", "virtual", "erect", "image"]
    if "refraction" in t:
        return ["refraction", "refractive index", "snell", "optical density", "glass slab", "normal"]

    return [w for w in re.split(r"[^a-z0-9]+", t) if len(w) > 3]


def _is_topic_aligned(item: Dict[str, Any], topic: str) -> bool:
    question_text = str(item.get("question_text", "")).lower()
    options_text = " ".join(str(opt).lower() for opt in item.get("options", []))
    corpus = f"{question_text} {options_text}"

    keywords = _topic_keywords(topic)
    if not keywords:
        return True

    # Keep laws-of-reflection quizzes narrowly focused and block common drift terms.
    if "first law of reflection" in (topic or "").lower() or "laws of reflection" in (topic or "").lower():
        blocked_terms = [
            "image formation",
            "concave",
            "convex",
            "magnification",
            "mirror formula",
            "focal length",
            "refraction",
            "lens",
            "same plane",
        ]
        if any(term in corpus for term in blocked_terms):
            return False

    if "spherical mirror" in (topic or "").lower() or "concave" in (topic or "").lower() or "convex" in (topic or "").lower():
        blocked_terms = ["refraction", "snell", "lens", "same plane"]
        if any(term in corpus for term in blocked_terms):
            return False

    return any(keyword in corpus for keyword in keywords)


def generate_questions(
    topic: str,
    difficulty: str = "easy",
    syllabus_scope: str | None = None,
    question_count: int = 5,
    tutor_context: str | None = None,
) -> List[Dict[str, Any]]:
    """Generate validated MCQs for a given topic and difficulty."""
    topic = topic.strip() if isinstance(topic, str) else ""
    difficulty = difficulty.strip().lower() if isinstance(difficulty, str) else "easy"
    question_count = question_count if isinstance(question_count, int) else 5
    question_count = max(2, min(question_count, 8))

    if not topic:
        topic = "Laws of Reflection"
    if difficulty not in {"easy", "medium", "hard"}:
        difficulty = "easy"

    questions = llm_generate_questions(
        topic,
        difficulty,
        syllabus_scope or default_syllabus_scope,
        question_count,
        tutor_context,
    )
    if not isinstance(questions, list):
        questions = []

    validated_questions = [q for q in questions if _is_valid_mcq(q) and _is_topic_aligned(q, topic)]
    validated_questions = validated_questions[:question_count]

    # Keep a simple fallback if the raw model output does not validate correctly.
    if not validated_questions:
        return []

    return validated_questions
