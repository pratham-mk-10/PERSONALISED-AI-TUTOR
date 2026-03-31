from database.connection import get_connection

def fetch_questions():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT id, question_text, options, correct
        FROM mcq_questions
        WHERE topic = 'Laws of Reflection'
        ORDER BY RANDOM()
        LIMIT 10;
    """)

    rows = cur.fetchall()
    conn.close()

    questions = []

    for r in rows:
        # 🔥 FIX: convert PostgreSQL array string → Python list
        options = r[2]

        if isinstance(options, str):
            options = options.strip("{}").split(",")

        questions.append({
            "id": r[0],
            "question_text": r[1],
            "options": options,
            "correct": r[3]
        })

    return questions

def fetch_by_misconception(tag):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT q.id, q.question_text, q.correct_index,
               ARRAY_AGG(o.option_text ORDER BY o.option_index)
        FROM questions q
        JOIN options o ON q.id = o.question_id
        JOIN question_misconceptions qm ON q.id = qm.question_id
        JOIN misconception_tags mt ON mt.id = qm.misconception_tag_id
        WHERE mt.tag = %s
        GROUP BY q.id
        ORDER BY RANDOM()
        LIMIT 10;
    """, (tag,))

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