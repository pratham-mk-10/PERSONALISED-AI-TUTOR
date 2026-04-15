import random

try:
    from database.connection import get_connection
except ImportError:
    from backend.database.connection import get_connection

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


def _has_table(table_name):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        """
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = %s
        LIMIT 1
        """,
        (table_name,),
    )
    found = cur.fetchone() is not None
    conn.close()
    return found


def _shuffle_options(option_rows, correct_idx):
    options = [{"index": o[0], "text": o[1]} for o in option_rows]
    random.shuffle(options)
    new_correct = next(
        i for i, opt in enumerate(options) if opt["index"] == correct_idx
    )
    return [opt["text"] for opt in options], new_correct


def fetch_questions(topic=None, difficulty=None, limit=10, exclude_ids=None):
    conn = get_connection()
    cur = conn.cursor()

    has_questions_table = _has_table("questions")

    if has_questions_table:
        has_topic = _has_column("questions", "topic")
        has_difficulty = _has_column("questions", "difficulty")

        # If a topic is requested but the table cannot filter by topic,
        # defer to topic-aware fallback tables below.
        if topic and not has_topic:
            has_questions_table = False

    if has_questions_table:

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

        topic_select = "MAX(q.topic)" if has_topic else "NULL"
        difficulty_select = "MAX(q.difficulty)" if has_difficulty else "NULL"

        cur.execute(
            f"""
            SELECT q.id, q.question_text, q.correct_index,
                   ARRAY_AGG(o.option_text ORDER BY o.option_index),
                   {topic_select} AS topic,
                   {difficulty_select} AS difficulty
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
        conn.close()

        return [
            {
                "id": r[0],
                "question_text": r[1],
                "correct": r[2],
                "options": r[3],
                "topic": r[4],
                "difficulty": r[5],
                "type": "mcq",
            }
            for r in rows
        ]

    has_mcq_table = _has_table("mcq_bank_questions") and _has_table("mcq_bank_options")
    if not has_mcq_table:
        conn.close()
        return []

    params = []
    filters = []
    if topic:
        filters.append("topic = %s")
        params.append(topic)
    if exclude_ids:
        filters.append("NOT (id = ANY(%s))")
        params.append(exclude_ids)
    where_sql = f"WHERE {' AND '.join(filters)}" if filters else ""
    params.append(limit)

    cur.execute(
        f"""
        SELECT id, question_text, correct_option_index, topic
        FROM mcq_bank_questions
        {where_sql}
        ORDER BY RANDOM()
        LIMIT %s;
        """,
        tuple(params),
    )

    question_rows = cur.fetchall()
    final_questions = []
    for qid, text, correct_idx, row_topic in question_rows:
        cur.execute(
            """
            SELECT option_index, option_text
            FROM mcq_bank_options
            WHERE question_id = %s
            """,
            (qid,),
        )
        options_data = cur.fetchall()
        option_texts, new_correct = _shuffle_options(options_data, correct_idx)

        final_questions.append(
            {
                "id": qid,
                "question_text": text,
                "options": option_texts,
                "correct": new_correct,
                "topic": row_topic,
                "difficulty": None,
                "type": "mcq",
            }
        )

    conn.close()
    return final_questions


def fetch_by_misconception(tag, topic=None, limit=10, exclude_ids=None):
    conn = get_connection()
    cur = conn.cursor()

    cols = _fetch_columns("questions")
    has_topic = "topic" in cols
    has_difficulty = "difficulty" in cols

    topic_select = "MAX(q.topic)" if has_topic else "NULL"
    difficulty_select = "MAX(q.difficulty)" if has_difficulty else "NULL"

    extra_where = ""
    params = [tag]
    if topic and has_topic:
        extra_where += " AND q.topic = %s"
        params.append(topic)
    if exclude_ids:
        extra_where += " AND NOT (q.id = ANY(%s))"
        params.append(exclude_ids)
    params.append(limit)

    cur.execute(f"""
        SELECT q.id, q.question_text, q.correct_index,
               ARRAY_AGG(o.option_text ORDER BY o.option_index),
               {topic_select} AS topic,
               {difficulty_select} AS difficulty
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
            "options": r[3],
            "topic": r[4],
            "difficulty": r[5],
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
