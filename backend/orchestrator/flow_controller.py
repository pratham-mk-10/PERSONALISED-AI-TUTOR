from .session_manager import SessionManager


class FlowController:
    """Controls the high-level learning flow for a session."""

    def __init__(self, session_manager: SessionManager):
        self.session_manager = session_manager

    def start_session(self, payload: dict) -> dict:
        learner_id = payload.get("learner_id", "anonymous")
        session = self.session_manager.create_session(learner_id, metadata=payload.get("metadata"))
        # TODO: seed first question / reflection activity
        return {"message": "session_started", **session}

    def next_step(self, payload: dict) -> dict:
        # TODO: connect to evaluation + questions modules
        return {"message": "next_step_placeholder", "payload": payload}
