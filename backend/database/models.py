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
		ADD COLUMN IF NOT EXISTS unresolved_topics JSONB NOT NULL DEFAULT '[]'::jsonb
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
		SELECT student_id, misconceptions, attempts, level, current_topic, completed_topics, unresolved_topics
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
		}

	student = {
		"student_id": student_id,
		"misconceptions": {},
		"attempts": 0,
		"level": "beginner",
		"current_topic": None,
		"completed_topics": [],
		"unresolved_topics": [],
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
			unresolved_topics
		)
		VALUES (%s, %s, %s, %s, %s, %s, %s)
		ON CONFLICT (student_id)
		DO UPDATE SET
			misconceptions = EXCLUDED.misconceptions,
			attempts = EXCLUDED.attempts,
			level = EXCLUDED.level,
			current_topic = EXCLUDED.current_topic,
			completed_topics = EXCLUDED.completed_topics,
			unresolved_topics = EXCLUDED.unresolved_topics
		""",
		(
			student["student_id"],
			Json(student["misconceptions"]),
			student["attempts"],
			student["level"],
			student.get("current_topic"),
			Json(student.get("completed_topics", [])),
			Json(student.get("unresolved_topics", [])),
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

