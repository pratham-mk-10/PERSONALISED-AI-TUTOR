import random
from database.connection import get_connection

def fetch_questions():
    conn = get_connection()
    cur = conn.cursor()

    # 🔹 Get questions
    cur.execute("""
        SELECT id, question_text, correct_option_index
        FROM mcq_bank_questions
        WHERE topic = 'Laws of Reflection'
        ORDER BY RANDOM()
        LIMIT 10;
    """)

    questions_data = cur.fetchall()

    final_questions = []

    for q in questions_data:
        qid, text, correct_idx = q

        # 🔹 Get options for this question
        cur.execute("""
            SELECT option_index, option_text
            FROM mcq_bank_options
            WHERE question_id = %s
        """, (qid,))

        options_data = cur.fetchall()

        # Convert to list
        options = [{"index": o[0], "text": o[1]} for o in options_data]

        # 🔥 Shuffle options
        random.shuffle(options)

        # 🔥 Find new correct index
        new_correct = next(
            i for i, opt in enumerate(options) if opt["index"] == correct_idx
        )

        # Extract only text for frontend
        option_texts = [opt["text"] for opt in options]

        final_questions.append({
            "id": qid,
            "question_text": text,
            "options": option_texts,
            "correct": new_correct,
            "type": "mcq"
        })

    conn.close()
    return final_questions