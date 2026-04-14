from database.connection import get_connection


def ensure_schema(cur):
	cur.execute(
		"""
		CREATE TABLE IF NOT EXISTS questions (
			id SERIAL PRIMARY KEY,
			question_text TEXT NOT NULL UNIQUE,
			correct_index INTEGER NOT NULL,
			topic TEXT,
			difficulty TEXT
		);
		"""
	)

	cur.execute(
		"""
		CREATE TABLE IF NOT EXISTS topic_misconceptions (
			id SERIAL PRIMARY KEY,
			topic_key TEXT NOT NULL,
			tag TEXT NOT NULL UNIQUE,
			title TEXT NOT NULL,
			explanation TEXT NOT NULL,
			focus_area TEXT NOT NULL,
			sort_order INTEGER NOT NULL DEFAULT 0
		);
		"""
	)

	cur.execute(
		"""
		CREATE TABLE IF NOT EXISTS options (
			id SERIAL PRIMARY KEY,
			question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
			option_index INTEGER NOT NULL,
			option_text TEXT NOT NULL,
			UNIQUE (question_id, option_index)
		);
		"""
	)

	cur.execute(
		"""
		CREATE TABLE IF NOT EXISTS misconception_tags (
			id SERIAL PRIMARY KEY,
			tag TEXT NOT NULL UNIQUE,
			description TEXT
		);
		"""
	)

	cur.execute(
		"""
		CREATE TABLE IF NOT EXISTS question_misconceptions (
			question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
			misconception_tag_id INTEGER NOT NULL REFERENCES misconception_tags(id) ON DELETE CASCADE,
			option_index INTEGER,
			UNIQUE (question_id, misconception_tag_id, option_index)
		);
		"""
	)


def seed():
	conn = get_connection()
	cur = conn.cursor()

	ensure_schema(cur)

	conn.commit()
	conn.close()
	print("Database schema is ready.")


if __name__ == "__main__":
	seed()

