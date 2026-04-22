from pathlib import Path
import json

try:
	from database.connection import get_connection
except ImportError:
	from backend.database.connection import get_connection


ROOT = Path(__file__).resolve().parents[2]
SHARED_TAGS_FILE = ROOT / "shared" / "misconception_tags.json"


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


def _load_shared_misconceptions():
	try:
		with open(SHARED_TAGS_FILE, "r", encoding="utf-8") as f:
			data = json.load(f)
			return data if isinstance(data, dict) else {}
	except Exception:
		return {}


def seed_misconceptions(cur):
	items = _load_shared_misconceptions()
	for tag, item in items.items():
		if not isinstance(item, dict):
			continue

		topic_key = str(item.get("topic_key") or "").strip() or "general"
		title = str(item.get("title") or tag).strip() or tag
		explanation = str(item.get("explanation") or "").strip()
		focus_area = str(item.get("focus_area") or "").strip()
		sort_order = int(item.get("sort_order") or 0)

		cur.execute(
			"""
			INSERT INTO topic_misconceptions (
				topic_key,
				tag,
				title,
				explanation,
				focus_area,
				sort_order
			)
			VALUES (%s, %s, %s, %s, %s, %s)
			ON CONFLICT (tag)
			DO UPDATE SET
				topic_key = EXCLUDED.topic_key,
				title = EXCLUDED.title,
				explanation = EXCLUDED.explanation,
				focus_area = EXCLUDED.focus_area,
				sort_order = EXCLUDED.sort_order
			""",
			(topic_key, tag, title, explanation, focus_area, sort_order),
		)

		cur.execute(
			"""
			INSERT INTO misconception_tags (tag, description)
			VALUES (%s, %s)
			ON CONFLICT (tag)
			DO UPDATE SET
				description = EXCLUDED.description
			""",
			(tag, explanation or title),
		)


def seed():
	conn = get_connection()
	cur = conn.cursor()

	ensure_schema(cur)
	seed_misconceptions(cur)

	conn.commit()
	conn.close()
	print("Database schema is ready.")


if __name__ == "__main__":
	seed()

