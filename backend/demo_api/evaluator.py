from demo_api.config import USE_LLM
from demo_api.database import log_student_behavior
from demo_api.llm_helper import generate_reasoning
from demo_api.models import update_student, update_student_level


class Evaluator:
    def evaluate(
        self,
        student_id,
        selected_option,
        correct_option,
        misconception_map,
        topic,
    ):
        is_correct = selected_option == correct_option

        if is_correct:
            misconception_tag = None
        else:
            misconception_tag = misconception_map.get(selected_option, "no_concept")

        student = update_student(student_id, misconception_tag)
        level = self.update_level(student)
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
            response.update(generate_reasoning(misconception_tag, topic))

        return response

    def update_level(self, student):
        attempts = student["attempts"]
        total_mis = sum(student["misconceptions"].values())

        accuracy = 1 - (total_mis / attempts if attempts else 0)

        if accuracy < 0.4:
            return "beginner"
        if accuracy < 0.7:
            return "intermediate"
        return "advanced"
