from config import USE_LLM
from database.models import log_student_behavior, update_student, update_student_level
from llm_helper import generate_reasoning


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

		if is_correct:
			misconception_tag = None
		else:
			misconception_tag = misconception_map.get(selected_option) or misconception_map.get(
				str(selected_option), "no_concept"
			)

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

