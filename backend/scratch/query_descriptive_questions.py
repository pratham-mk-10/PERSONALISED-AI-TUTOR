import sys
from pathlib import Path

# Add backend to sys.path
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.append(str(BACKEND_ROOT))

try:
    from database.connection import get_connection
except ImportError:
    from backend.database.connection import get_connection

def query_questions():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT id, topic, question_text, required_keywords 
        FROM descriptive_questions
        ORDER BY topic, id;
        """
    )
    rows = cur.fetchall()
    conn.close()

    print(f"Total descriptive questions found: {len(rows)}\n")
    for r in rows:
        print(f"ID: {r[0]}")
        print(f"Topic: {r[1]}")
        print(f"Question: {r[2]}")
        print(f"Keywords: {r[3]}")
        print("-" * 50)

if __name__ == "__main__":
    query_questions()
