from demo_api.database import get_student_row, upsert_student_row


def get_student(student_id):
    student = get_student_row(student_id)

    if student:
        return student

    student = {
        "student_id": student_id,
        "misconceptions": {},
        "attempts": 0,
        "level": "beginner",
    }
    upsert_student_row(student)
    return student


def update_student(student_id, misconception_tag):
    student = get_student(student_id)
    student["attempts"] += 1

    if misconception_tag:
        student["misconceptions"][misconception_tag] = (
            student["misconceptions"].get(misconception_tag, 0) + 1
        )

    upsert_student_row(student)
    return student


def update_student_level(student_id, level):
    student = get_student(student_id)
    student["level"] = level
    upsert_student_row(student)
    return student
