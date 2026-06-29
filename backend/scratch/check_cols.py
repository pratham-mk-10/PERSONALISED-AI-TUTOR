try:
    from database.connection import get_connection
except ImportError:
    from backend.database.connection import get_connection

conn = get_connection()
cur = conn.cursor()
cur.execute("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'descriptive_questions'")
print(cur.fetchall())
conn.close()
