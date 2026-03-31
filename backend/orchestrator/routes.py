from fastapi import APIRouter
from database.queries import fetch_questions

router = APIRouter()

@router.post("/get-questions")
def get_questions():
    questions = fetch_questions()
    return {"questions": questions}
@router.post("/submit")
def submit(data: dict):
    answers = data.get("answers", [])

    results = []

    for item in answers:
        q = item["question"]
        user_ans = item["answer"]

        correct = user_ans == q["options"][q["correct"]]

        results.append({
            "question_id": q["id"],
            "correct": correct,
            "feedback": None if correct else "Revise concept"
        })

    return {"results": results}