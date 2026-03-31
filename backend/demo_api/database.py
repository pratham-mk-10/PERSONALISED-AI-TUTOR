from database.connection import get_connection


def _fetch_columns(table_name):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = %s
        """,
        (table_name,),
    )
    cols = {row[0] for row in cur.fetchall()}
    conn.close()
    return cols


def ensure_student_table():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS student_progress (
            student_id TEXT PRIMARY KEY,
            misconceptions JSONB NOT NULL DEFAULT '{}'::jsonb,
            attempts INTEGER NOT NULL DEFAULT 0,
            level TEXT NOT NULL DEFAULT 'beginner'
        );
        """
    )
    conn.commit()
    conn.close()


def ensure_behavior_table():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS student_behavior_events (
            id BIGSERIAL PRIMARY KEY,
            student_id TEXT NOT NULL,
            topic TEXT,
            selected_option TEXT,
            correct_option TEXT,
            is_correct BOOLEAN NOT NULL,
            misconception_tag TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        """
    )
    conn.commit()
    conn.close()


def get_student_row(student_id):
    ensure_student_table()
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT student_id, misconceptions, attempts, level
        FROM student_progress
        WHERE student_id = %s
        """,
        (student_id,),
    )
    row = cur.fetchone()
    conn.close()

    if not row:
        return None

    return {
        "student_id": row[0],
        "misconceptions": row[1] or {},
        "attempts": row[2],
        "level": row[3],
    }


def upsert_student_row(student):
    ensure_student_table()
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO student_progress (student_id, misconceptions, attempts, level)
        VALUES (%s, %s, %s, %s)
        ON CONFLICT (student_id)
        DO UPDATE SET
            misconceptions = EXCLUDED.misconceptions,
            attempts = EXCLUDED.attempts,
            level = EXCLUDED.level
        """,
        (
            student["student_id"],
            student["misconceptions"],
            student["attempts"],
            student["level"],
        ),
    )
    conn.commit()
    conn.close()


def log_student_behavior(
    student_id,
    topic,
    selected_option,
    correct_option,
    is_correct,
    misconception_tag,
):
    ensure_behavior_table()
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO student_behavior_events (
            student_id,
            topic,
            selected_option,
            correct_option,
            is_correct,
            misconception_tag
        )
        VALUES (%s, %s, %s, %s, %s, %s)
        """,
        (
            student_id,
            topic,
            selected_option,
            correct_option,
            is_correct,
            misconception_tag,
        ),
    )
    conn.commit()
    conn.close()


def get_recent_student_behavior(student_id, limit=25):
    ensure_behavior_table()
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT topic, selected_option, correct_option, is_correct, misconception_tag, created_at
        FROM student_behavior_events
        WHERE student_id = %s
        ORDER BY created_at DESC
        LIMIT %s
        """,
        (student_id, limit),
    )
    rows = cur.fetchall()
    conn.close()

    return [
        {
            "topic": row[0],
            "selected_option": row[1],
            "correct_option": row[2],
            "is_correct": row[3],
            "misconception_tag": row[4],
            "created_at": row[5].isoformat() if row[5] else None,
        }
        for row in rows
    ]


def get_student_profile(student_id):
    student = get_student_row(student_id)
    if not student:
        return None

    behavior = get_recent_student_behavior(student_id)
    return {"student": student, "behavior": behavior}


def list_questions(topic=None, difficulty=None):
    cols = _fetch_columns("questions")
    has_topic = "topic" in cols
    has_difficulty = "difficulty" in cols

    topic_select = "MAX(q.topic)" if has_topic else "NULL"
    difficulty_select = "MAX(q.difficulty)" if has_difficulty else "NULL"

    query = """
        SELECT q.id, q.question_text, q.correct_index,
               ARRAY_AGG(o.option_text ORDER BY o.option_index) AS options,
               {topic_select} AS topic,
               {difficulty_select} AS difficulty
        FROM questions q
        JOIN options o ON q.id = o.question_id
    """.format(topic_select=topic_select, difficulty_select=difficulty_select)
    clauses = []
    params = []

    if topic and has_topic:
        clauses.append("q.topic = %s")
        params.append(topic)

    if difficulty and has_difficulty:
        clauses.append("q.difficulty = %s")
        params.append(difficulty)

    if clauses:
        query += " WHERE " + " AND ".join(clauses)

    query += " GROUP BY q.id, q.question_text, q.correct_index"

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(query, tuple(params))
    rows = cur.fetchall()
    conn.close()

    return [
        {
            "id": row[0],
            "question_text": row[1],
            "correct": row[2],
            "options": row[3],
            "topic": row[4],
            "difficulty": row[5],
        }
        for row in rows
    ]
