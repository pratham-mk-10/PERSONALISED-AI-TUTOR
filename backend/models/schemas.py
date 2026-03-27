from pydantic import BaseModel
from typing import Any


class SessionStartRequest(BaseModel):
    learner_id: str | None = None
    metadata: dict[str, Any] | None = None


class SessionStepRequest(BaseModel):
    session_id: str
    response: str
