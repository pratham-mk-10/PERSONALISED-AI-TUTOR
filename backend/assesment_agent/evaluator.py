import importlib.util
import os
from pathlib import Path

try:
	from database.models import log_student_behavior, update_student, update_student_level
	from database.misconception_catalog import coerce_misconception_tag, get_allowed_misconception_tags
except ImportError:
	from backend.database.models import log_student_behavior, update_student, update_student_level
	from backend.database.misconception_catalog import coerce_misconception_tag, get_allowed_misconception_tags


def _load_adaptation_feedback_module():
	backend_root = Path(__file__).resolve().parents[1]
	file_path = backend_root / "adaptataion-agent" / "feedback_trigger.py"
	spec = importlib.util.spec_from_file_location("adaptation_feedback_trigger", file_path)
	if spec is None or spec.loader is None:
		raise ImportError(f"Unable to load module from {file_path}")

	module = importlib.util.module_from_spec(spec)
	spec.loader.exec_module(module)
	return module


USE_LLM = os.getenv("USE_LLM", "false").lower() in {"1", "true", "yes"}
_adaptation_feedback = _load_adaptation_feedback_module()
generate_reasoning = _adaptation_feedback.generate_reasoning
classify_misconception_tag = getattr(_adaptation_feedback, "classify_misconception_tag", None)


def classify_level(student):
	attempts = student.get("attempts", 0)
	total_mis = sum((student.get("misconceptions") or {}).values())

	accuracy = 1 - (total_mis / attempts if attempts else 0)

	if accuracy < 0.4:
		return "beginner"
	if accuracy < 0.7:
		return "intermediate"
	return "advanced"


class Evaluator:
	def evaluate(
		self,
		student_id,
		selected_option,
		correct_option,
		misconception_map,
		topic,
		question_text=None,
	):
		is_correct = str(selected_option) == str(correct_option)
		allowed_tags = get_allowed_misconception_tags(topic)

		if is_correct:
			misconception_tag = None
		else:
			misconception_tag = misconception_map.get(selected_option) or misconception_map.get(
				str(selected_option), "no_concept"
			)
			misconception_tag = coerce_misconception_tag(misconception_tag, topic)
			# If no specific tag is provided, optionally let the LLM
			# infer a finer-grained misconception label.
			if USE_LLM and callable(classify_misconception_tag) and (
				misconception_tag is None
				or str(misconception_tag).strip() in {"", "no_concept", "general_concept_gap"}
			):
				auto_tag = classify_misconception_tag(
					topic or "Laws of Reflection",
					question_text or "",
					selected_option,
					correct_option,
					allowed_tags=allowed_tags,
				)
				if isinstance(auto_tag, str) and auto_tag.strip():
					misconception_tag = coerce_misconception_tag(auto_tag.strip(), topic)

		student = update_student(student_id, misconception_tag)
		level = classify_level(student)
		student = update_student_level(student_id, level)

		log_student_behavior(
			student_id=student_id,
			topic=topic,
			selected_option=selected_option,
			correct_option=correct_option,
			is_correct=is_correct,
			misconception_tag=misconception_tag,
		)

		response = {
			"is_correct": is_correct,
			"misconception_tag": misconception_tag,
			"attempt": student["attempts"],
			"level": level,
		}

		if USE_LLM and not is_correct:
			response.update(
				generate_reasoning(
					misconception_tag, 
					topic,
					question_text=question_text,
					student_answer=selected_option,
					correct_answer=correct_option,
				)
			)

		return response

