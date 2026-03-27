class SessionManager:
    """Manages session state for learners.

    This is a lightweight placeholder; integrate with DB/cache later.
    """

    def __init__(self):
        self._sessions = {}

    def create_session(self, learner_id: str, metadata: dict | None = None) -> dict:
        session_id = f"sess_{len(self._sessions) + 1}"
        self._sessions[session_id] = {"learner_id": learner_id, "metadata": metadata or {}, "state": {}}
        return {"session_id": session_id}

    def get_session(self, session_id: str) -> dict | None:
        return self._sessions.get(session_id)

    def update_session_state(self, session_id: str, state: dict) -> None:
        if session_id in self._sessions:
            self._sessions[session_id]["state"] = state
