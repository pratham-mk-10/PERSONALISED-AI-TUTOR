import os


DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "5432"))
DB_NAME = os.getenv("DB_NAME", "question_bank")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD")
if not DB_PASSWORD or DB_PASSWORD in {"your_password", "change_me", "CHANGE_ME"}:
    raise RuntimeError(
        "DB_PASSWORD must be set via environment variable or local untracked .env file."
    )
USE_LLM = os.getenv("USE_LLM", "false").lower() in {"1", "true", "yes"}


__all__ = ["DB_HOST", "DB_PORT", "DB_NAME", "DB_USER", "DB_PASSWORD", "USE_LLM"]
