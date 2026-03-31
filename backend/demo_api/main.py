from fastapi import APIRouter, FastAPI, HTTPException
from pydantic import BaseModel

from demo_api.evaluator import Evaluator
from demo_api.question_selector import select_question


router = APIRouter()
evaluator = Evaluator()


class EvaluationRequest(BaseModel):
    student_id: str
    topic: str
    selected_option: str
    correct_option: str
    misconception_map: dict


@router.get("/question/{student_id}/{topic}")
def get_question(student_id: str, topic: str):
    question = select_question(student_id, topic)
    if not question:
        raise HTTPException(status_code=404, detail="No questions found")
    return question


@router.post("/evaluate")
def evaluate(req: EvaluationRequest):
    return evaluator.evaluate(
        student_id=req.student_id,
        selected_option=req.selected_option,
        correct_option=req.correct_option,
        misconception_map=req.misconception_map,
        topic=req.topic,
    )


app = FastAPI()
app.include_router(router)
