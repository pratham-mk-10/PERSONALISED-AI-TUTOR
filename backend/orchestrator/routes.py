from fastapi import APIRouter
from database.queries import fetch_questions

router = APIRouter()

@router.post("/get-questions")
def get_questions():
    questions = fetch_questions()
    return {"questions": questions}
@router.post("/submit-answers")
def submit_answers(data: dict):
    return {
        "main_misconception": "none",
        "questions": []  # or call fetch_questions() again if you want loop
    }