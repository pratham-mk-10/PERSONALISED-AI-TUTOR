def ensure_session_exists(session_manager, session_id: str):
    session = session_manager.get_session(session_id)
    if not session:
        raise ValueError("Session not found")
    return session
