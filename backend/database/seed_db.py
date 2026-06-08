try:
	from database.connection import get_connection
except ImportError:
	from backend.database.connection import get_connection


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
	# Cleanup duplicates before adding constraint
	cur.execute(
		"""
		DELETE FROM topic_misconceptions a USING topic_misconceptions b
		WHERE a.id > b.id AND a.tag = b.tag;
		"""
	)

	# Ensure the unique constraint exists if the table was created without it before
	cur.execute(
		"""
		SELECT 1 FROM information_schema.table_constraints 
		WHERE table_name='topic_misconceptions' AND constraint_name='topic_misconceptions_tag_key';
		"""
	)
	if not cur.fetchone():
		cur.execute("ALTER TABLE topic_misconceptions ADD CONSTRAINT topic_misconceptions_tag_key UNIQUE (tag);")

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


def seed_data(cur):
	# Basic Misconceptions for Spherical Mirrors
	spherical_misconceptions = [
		("spherical_mirrors", "concave_convex_confusion", "Concave vs Convex Identification", "The student mixes up the reflecting surfaces of concave and convex mirrors.", "surface orientation"),
		("spherical_mirrors", "pole_confusion", "Pole Location", "The student thinks the pole is at the center of curvature rather than the mirror surface.", "mirror geometry"),
		("spherical_mirrors", "center_of_curvature_confusion", "Center of Curvature Position", "Confusion about where C lies relative to the mirror and its radius.", "radius of curvature"),
		("spherical_mirrors", "radius_focal_relation_wrong", "R and f Relation Error", "Incorrectly using R = f or other wrong ratios instead of R = 2f.", "focal length relation"),
		("spherical_mirrors", "focus_definition_wrong", "Principal Focus Definition", "Incorrectly believing rays don't meet at a specific point or confusion about the focus.", "principal focus"),
		("spherical_mirrors", "principal_axis_confusion", "Principal Axis Orientation", "Believing the principal axis is just any line, not the one specifically passing through pole and center of curvature.", "axis geometry"),
		("spherical_mirrors", "image_position_confusion", "Image Position Rules", "Not knowing where the image forms when an object is placed at different positions.", "image formation"),
		("general", "general_concept_gap", "General Concept Gap", "A generic lack of understanding of the core concepts being taught.", "general review"),
	]

	# Basic Misconceptions for Laws of Reflection
	reflection_misconceptions = [
		("laws_of_reflection", "angle_from_surface", "Angle from Surface", "Measuring the angle of incidence/reflection from the mirror surface instead of the normal.", "angle measurement"),
		("laws_of_reflection", "reflection_not_equal", "Angle Inequality", "Thinking that the angle of incidence is not equal to the angle of reflection.", "first law"),
		("laws_of_reflection", "normal_orientation_wrong", "Normal Orientation", "Mistakenly drawing the normal not perpendicular to the surface.", "geometry"),
	]

	for topic, tag, title, expl, focus in (spherical_misconceptions + reflection_misconceptions):
		cur.execute(
			"""
			INSERT INTO topic_misconceptions (topic_key, tag, title, explanation, focus_area)
			VALUES (%s, %s, %s, %s, %s)
			ON CONFLICT (tag) DO UPDATE SET 
			title=EXCLUDED.title, 
			explanation=EXCLUDED.explanation, 
			focus_area=EXCLUDED.focus_area;
			""",
			(topic, tag, title, expl, focus)
		)


def seed():
	conn = get_connection()
	cur = conn.cursor()

	ensure_schema(cur)
	seed_data(cur)

	conn.commit()
	conn.close()
	print("Database schema and data are ready.")


if __name__ == "__main__":
	seed()

