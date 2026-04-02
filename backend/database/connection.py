import os

import psycopg2

try:
    from config import (
        DB_HOST as CFG_DB_HOST,
        DB_NAME as CFG_DB_NAME,
        DB_PASSWORD as CFG_DB_PASSWORD,
        DB_PORT as CFG_DB_PORT,
        DB_USER as CFG_DB_USER,
    )
except ImportError:
    CFG_DB_HOST = "localhost"
    CFG_DB_PORT = 5432
    CFG_DB_NAME = "question_bank"
    CFG_DB_USER = "postgres"
    CFG_DB_PASSWORD = None


def get_connection():
    db_password = os.getenv("DB_PASSWORD", CFG_DB_PASSWORD)
    if not db_password or db_password in {"your_password", "change_me", "CHANGE_ME"}:
        raise RuntimeError(
            "DB_PASSWORD is required. Set it in environment variables or local .env file."
        )

    return psycopg2.connect(
        host=os.getenv("DB_HOST", CFG_DB_HOST),
        database=os.getenv("DB_NAME", CFG_DB_NAME),
        user=os.getenv("DB_USER", CFG_DB_USER),
        password=db_password,
        port=int(os.getenv("DB_PORT", str(CFG_DB_PORT))),
    )