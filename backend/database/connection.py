import os

import psycopg2

try:
    from demo_api.config import (
        DB_HOST as CFG_DB_HOST,
        DB_NAME as CFG_DB_NAME,
        DB_PASSWORD as CFG_DB_PASSWORD,
        DB_PORT as CFG_DB_PORT,
        DB_USER as CFG_DB_USER,
    )
except Exception:
    CFG_DB_HOST = "localhost"
    CFG_DB_PORT = 5432
    CFG_DB_NAME = "question_bank"
    CFG_DB_USER = "postgres"
    CFG_DB_PASSWORD = "your_password"


def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", CFG_DB_HOST),
        database=os.getenv("DB_NAME", CFG_DB_NAME),
        user=os.getenv("DB_USER", CFG_DB_USER),
        password=os.getenv("DB_PASSWORD", CFG_DB_PASSWORD),
        port=int(os.getenv("DB_PORT", str(CFG_DB_PORT))),
    )