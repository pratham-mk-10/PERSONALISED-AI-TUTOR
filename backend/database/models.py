try:
	from database.connection import get_connection
except ImportError:
	from backend.database.connection import get_connection
from psycopg2.extras import Json


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
	cur.execute(
		"""
		ALTER TABLE student_progress
		ADD COLUMN IF NOT EXISTS current_topic TEXT,
		ADD COLUMN IF NOT EXISTS completed_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
		ADD COLUMN IF NOT EXISTS unresolved_topics JSONB NOT NULL DEFAULT '[]'::jsonb,
		ADD COLUMN IF NOT EXISTS topic_attempts JSONB NOT NULL DEFAULT '{}'::jsonb
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


def get_student(student_id):
	ensure_student_table()
	conn = get_connection()
	cur = conn.cursor()
	cur.execute(
		"""
		SELECT student_id, misconceptions, attempts, level, current_topic, completed_topics, unresolved_topics, topic_attempts
		FROM student_progress
		WHERE student_id = %s
		""",
		(student_id,),
	)
	row = cur.fetchone()
	conn.close()

	if row:
		return {
			"student_id": row[0],
			"misconceptions": row[1] or {},
			"attempts": row[2],
			"level": row[3],
			"current_topic": row[4],
			"completed_topics": row[5] or [],
			"unresolved_topics": row[6] or [],
			"topic_attempts": row[7] or {},
		}

	student = {
		"student_id": student_id,
		"misconceptions": {},
		"attempts": 0,
		"level": "beginner",
		"current_topic": None,
		"completed_topics": [],
		"unresolved_topics": [],
		"topic_attempts": {},
	}
	upsert_student(student)
	return student


def upsert_student(student):
	ensure_student_table()
	conn = get_connection()
	cur = conn.cursor()
	cur.execute(
		"""
		INSERT INTO student_progress (
			student_id,
			misconceptions,
			attempts,
			level,
			current_topic,
			completed_topics,
			unresolved_topics,
			topic_attempts
		)
		VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
		ON CONFLICT (student_id)
		DO UPDATE SET
			misconceptions = EXCLUDED.misconceptions,
			attempts = EXCLUDED.attempts,
			level = EXCLUDED.level,
			current_topic = EXCLUDED.current_topic,
			completed_topics = EXCLUDED.completed_topics,
			unresolved_topics = EXCLUDED.unresolved_topics,
			topic_attempts = EXCLUDED.topic_attempts
		""",
		(
			student["student_id"],
			Json(student["misconceptions"]),
			student["attempts"],
			student["level"],
			student.get("current_topic"),
			Json(student.get("completed_topics", [])),
			Json(student.get("unresolved_topics", [])),
			Json(student.get("topic_attempts", {})),
		),
	)
	conn.commit()
	conn.close()


def update_student(student_id, misconception_tag):
	student = get_student(student_id)
	student["attempts"] += 1

	if misconception_tag:
		student["misconceptions"][misconception_tag] = (
			student["misconceptions"].get(misconception_tag, 0) + 1
		)

	upsert_student(student)
	return student


def update_student_level(student_id, level):
	student = get_student(student_id)
	student["level"] = level
	upsert_student(student)
	return student


def set_student_current_topic(student_id, topic):
	student = get_student(student_id)
	student["current_topic"] = topic
	upsert_student(student)
	return student


def update_student_topic_resolution(student_id, topic, main_misconception):
	if not topic:
		return get_student(student_id)

	student = get_student(student_id)
	completed = set(student.get("completed_topics", []))
	unresolved = set(student.get("unresolved_topics", []))

	if main_misconception and main_misconception != "none":
		unresolved.add(topic)
		completed.discard(topic)
	else:
		completed.add(topic)
		unresolved.discard(topic)

	student["completed_topics"] = sorted(completed)
	student["unresolved_topics"] = sorted(unresolved)
	student["current_topic"] = topic
	upsert_student(student)
	return student


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


def get_student_profile(student_id, limit=25):
	student = get_student(student_id)

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

	behavior = [
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

	return {"student": student, "behavior": behavior}


def ensure_descriptive_tables():
	conn = get_connection()
	cur = conn.cursor()
	cur.execute(
		"""
		CREATE TABLE IF NOT EXISTS descriptive_questions (
			id SERIAL PRIMARY KEY,
			topic TEXT NOT NULL,
			question_text TEXT NOT NULL UNIQUE,
			rubric_items JSONB NOT NULL DEFAULT '[]'::jsonb,
			required_keywords TEXT[] NOT NULL DEFAULT '{}'::text[]
		);
		"""
	)
	cur.execute(
		"""
		CREATE TABLE IF NOT EXISTS flagged_evaluations (
			id SERIAL PRIMARY KEY,
			student_id TEXT NOT NULL,
			question_id INTEGER NOT NULL REFERENCES descriptive_questions(id) ON DELETE CASCADE,
			student_answer TEXT NOT NULL,
			raw_response TEXT,
			error_message TEXT,
			created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
		);
		"""
	)
	conn.commit()
	conn.close()


def get_descriptive_question(question_id):
	ensure_descriptive_tables()
	conn = get_connection()
	cur = conn.cursor()
	cur.execute(
		"""
		SELECT id, topic, question_text, rubric_items, required_keywords
		FROM descriptive_questions
		WHERE id = %s
		""",
		(question_id,),
	)
	row = cur.fetchone()
	conn.close()

	if row:
		return {
			"id": row[0],
			"topic": row[1],
			"question_text": row[2],
			"rubric_items": row[3],
			"required_keywords": row[4],
		}
	return None


def log_flagged_evaluation(student_id, question_id, student_answer, raw_response, error_message):
	ensure_descriptive_tables()
	conn = get_connection()
	cur = conn.cursor()
	cur.execute(
		"""
		INSERT INTO flagged_evaluations (student_id, question_id, student_answer, raw_response, error_message)
		VALUES (%s, %s, %s, %s, %s)
		""",
		(student_id, question_id, student_answer, raw_response, error_message),
	)
	conn.commit()
	conn.close()


def increment_topic_attempt(student_id: str, topic_key: str) -> int:
	"""Increments attempt count for (student, topic). Returns the new count."""
	student = get_student(student_id)
	attempts = dict(student.get("topic_attempts") or {})
	new_count = attempts.get(topic_key, 0) + 1
	attempts[topic_key] = new_count
	student["topic_attempts"] = attempts
	upsert_student(student)
	return new_count


def reset_topic_attempt(student_id: str, topic_key: str):
	"""Resets attempt count for a topic (called when student revisits lesson)."""
	student = get_student(student_id)
	attempts = dict(student.get("topic_attempts") or {})
	attempts[topic_key] = 0
	student["topic_attempts"] = attempts
	upsert_student(student)
