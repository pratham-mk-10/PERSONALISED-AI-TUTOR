from database.connection import get_connection

def _has_column(table_name, column_name):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = %s AND column_name = %s
        LIMIT 1
        """,
        (table_name, column_name),
    )
    found = cur.fetchone() is not None
    conn.close()
    return found


def fetch_questions(topic=None, difficulty=None, limit=10, exclude_ids=None):
    conn = get_connection()
    cur = conn.cursor()

    has_topic = _has_column("questions", "topic")
    has_difficulty = _has_column("questions", "difficulty")

    where = []
    params = []

    if topic and has_topic:
        where.append("q.topic = %s")
        params.append(topic)
    if difficulty and has_difficulty:
        where.append("q.difficulty = %s")
        params.append(difficulty)
    if exclude_ids:
        where.append("NOT (q.id = ANY(%s))")
        params.append(exclude_ids)

    where_sql = f"WHERE {' AND '.join(where)}" if where else ""
    params.append(limit)

    cur.execute(
        f"""
        SELECT q.id, q.question_text, q.correct_index,
               ARRAY_AGG(o.option_text ORDER BY o.option_index)
        FROM questions q
        JOIN options o ON q.id = o.question_id
        {where_sql}
        GROUP BY q.id
        ORDER BY RANDOM()
        LIMIT %s;
    """,
        tuple(params),
    )

    rows = cur.fetchall()

    questions = []
    for r in rows:
        questions.append({
            "id": r[0],
            "question_text": r[1],
            "correct": r[2],
            "options": r[3]
        })

    conn.close()
    return questions


def fetch_by_misconception(tag, limit=10, exclude_ids=None):
    conn = get_connection()
    cur = conn.cursor()

    extra_where = ""
    params = [tag]
    if exclude_ids:
        extra_where = " AND NOT (q.id = ANY(%s))"
        params.append(exclude_ids)
    params.append(limit)

    cur.execute(f"""
        SELECT q.id, q.question_text, q.correct_index,
               ARRAY_AGG(o.option_text ORDER BY o.option_index)
        FROM questions q
        JOIN options o ON q.id = o.question_id
        JOIN question_misconceptions qm ON q.id = qm.question_id
        JOIN misconception_tags mt ON mt.id = qm.misconception_tag_id
        WHERE mt.tag = %s{extra_where}
        GROUP BY q.id
        ORDER BY RANDOM()
        LIMIT %s;
    """, tuple(params))

    rows = cur.fetchall()

    conn.close()

    return [
        {
            "id": r[0],
            "question_text": r[1],
            "correct": r[2],
            "options": r[3]
        } for r in rows
    ]


def fetch_misconception_for_answer(question_id, selected_option):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT mt.tag
        FROM question_misconceptions qm
        JOIN misconception_tags mt ON mt.id = qm.misconception_tag_id
        WHERE qm.question_id = %s
          AND (qm.option_index = %s OR qm.option_index IS NULL)
        ORDER BY CASE WHEN qm.option_index IS NULL THEN 1 ELSE 0 END
        LIMIT 1;
        """,
        (question_id, selected_option),
    )

    row = cur.fetchone()
    conn.close()

    return row[0] if row else None