from fastapi import APIRouter
from .session_manager import SessionManager
from .flow_controller import FlowController

router = APIRouter()

session_manager = SessionManager()
flow_controller = FlowController(session_manager=session_manager)


@router.post("/session/start")
async def start_session(payload: dict):
    return flow_controller.start_session(payload)


@router.post("/session/next")
async def next_step(payload: dict):
    return flow_controller.next_step(payload)
