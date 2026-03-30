from collections import Counter
from database.connection import get_connection

def detect_misconception(answers):
    conn = get_connection()
    cur = conn.cursor()

    wrong_tags = []

    for ans in answers:
        if ans["selected"] != ans["correct"]:

            cur.execute("""
                SELECT mt.tag
                FROM question_misconceptions qm
                JOIN misconception_tags mt
                ON qm.misconception_tag_id = mt.id
                WHERE qm.question_id = %s
            """, (ans["question_id"],))

            tags = cur.fetchall()
            wrong_tags.extend([t[0] for t in tags])

    conn.close()

    if not wrong_tags:
        return None

    return Counter(wrong_tags).most_common(1)[0][0]