from database.connection import get_connection


SAMPLE_QUESTIONS = [
	{
		"question_text": "If the angle of incidence is 35 degrees, what is the angle of reflection?",
		"correct_index": 1,
		"topic": "reflection",
		"difficulty": "easy",
		"options": ["25 degrees", "35 degrees", "45 degrees", "70 degrees"],
		"misconceptions": {
			0: "wrong-normal-reference",
			2: "angle-addition-confusion",
			3: "incidence-plus-reflection",
		},
	},
	{
		"question_text": "A ray strikes a plane mirror at normal incidence. Which statement is true?",
		"correct_index": 2,
		"topic": "reflection",
		"difficulty": "medium",
		"options": [
			"It reflects at 90 degrees",
			"It is refracted into the mirror",
			"It retraces its path",
			"It is absorbed completely",
		],
		"misconceptions": {
			0: "normal-incidence-misread",
			1: "reflection-refraction-mixup",
			3: "mirror-absorption-myth",
		},
	},
	{
		"question_text": "When light enters glass from air, it bends towards the normal because:",
		"correct_index": 0,
		"topic": "refraction",
		"difficulty": "easy",
		"options": [
			"Its speed decreases in glass",
			"Its frequency increases",
			"Its wavelength always increases",
			"The glass emits extra light",
		],
		"misconceptions": {
			1: "frequency-change-myth",
			2: "wavelength-direction-mixup",
			3: "material-emission-misconception",
		},
	},
	{
		"question_text": "A convex lens forms a real image when the object is placed:",
		"correct_index": 3,
		"topic": "refraction",
		"difficulty": "medium",
		"options": [
			"Between lens and focus",
			"At optical center only",
			"At infinity only",
			"Beyond the focal length",
		],
		"misconceptions": {
			0: "real-vs-virtual-confusion",
			1: "optical-center-myth",
			2: "infinity-only-myth",
		},
	},
]


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


def upsert_question(cur, q):
	cur.execute(
		"""
		INSERT INTO questions (question_text, correct_index, topic, difficulty)
		VALUES (%s, %s, %s, %s)
		ON CONFLICT (question_text)
		DO UPDATE SET
			correct_index = EXCLUDED.correct_index,
			topic = EXCLUDED.topic,
			difficulty = EXCLUDED.difficulty
		RETURNING id
		""",
		(q["question_text"], q["correct_index"], q["topic"], q["difficulty"]),
	)
	return cur.fetchone()[0]


def upsert_options(cur, question_id, options):
	for index, option_text in enumerate(options):
		cur.execute(
			"""
			INSERT INTO options (question_id, option_index, option_text)
			VALUES (%s, %s, %s)
			ON CONFLICT (question_id, option_index)
			DO UPDATE SET option_text = EXCLUDED.option_text
			""",
			(question_id, index, option_text),
		)


def upsert_misconceptions(cur, question_id, misconceptions):
	for option_index, tag in misconceptions.items():
		cur.execute(
			"""
			INSERT INTO misconception_tags (tag, description)
			VALUES (%s, %s)
			ON CONFLICT (tag)
			DO UPDATE SET description = EXCLUDED.description
			RETURNING id
			""",
			(tag, f"Auto-seeded misconception tag: {tag}"),
		)
		tag_id = cur.fetchone()[0]

		cur.execute(
			"""
			INSERT INTO question_misconceptions (question_id, misconception_tag_id, option_index)
			VALUES (%s, %s, %s)
			ON CONFLICT (question_id, misconception_tag_id, option_index)
			DO NOTHING
			""",
			(question_id, tag_id, option_index),
		)


def seed():
	conn = get_connection()
	cur = conn.cursor()

	ensure_schema(cur)

	for q in SAMPLE_QUESTIONS:
		question_id = upsert_question(cur, q)
		upsert_options(cur, question_id, q["options"])
		upsert_misconceptions(cur, question_id, q["misconceptions"])

	conn.commit()
	conn.close()
	print("Database schema and sample questions are ready.")


if __name__ == "__main__":
	seed()

