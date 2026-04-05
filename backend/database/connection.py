import os
from pathlib import Path

import psycopg2
from dotenv import load_dotenv

# Load env files explicitly so config works whether server is started from
# repository root or from backend/.
BASE_DIR = Path(__file__).resolve().parents[1]
ROOT_DIR = BASE_DIR.parent
load_dotenv(ROOT_DIR / ".env")
load_dotenv(BASE_DIR / ".env")

CFG_DB_HOST = "localhost"
CFG_DB_PORT = 5432
CFG_DB_NAME = "question_bank"
CFG_DB_USER = "postgres"
CFG_DB_PASSWORD = None


def get_connection():
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        # Accept both postgres:// and postgresql:// URL schemes.
        normalized_url = database_url.replace("postgres://", "postgresql://", 1)
        sslmode = os.getenv("DB_SSLMODE")
        if sslmode:
            return psycopg2.connect(normalized_url, sslmode=sslmode)
        return psycopg2.connect(normalized_url)

    db_password = os.getenv("DB_PASSWORD", CFG_DB_PASSWORD)
    if not db_password or db_password in {"your_password", "change_me", "CHANGE_ME"}:
        raise RuntimeError(
            "Set DATABASE_URL or configure DB_HOST/DB_NAME/DB_USER/DB_PASSWORD in environment variables or local .env file."
        )

    return psycopg2.connect(
        host=os.getenv("DB_HOST", CFG_DB_HOST),
        database=os.getenv("DB_NAME", CFG_DB_NAME),
        user=os.getenv("DB_USER", CFG_DB_USER),
        password=db_password,
        port=int(os.getenv("DB_PORT", str(CFG_DB_PORT))),
    )