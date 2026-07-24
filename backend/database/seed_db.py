import sys
from pathlib import Path
import json

# Add backend and repo root to path to ensure robust imports
BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.append(str(BACKEND_ROOT))
if str(BACKEND_ROOT.parent) not in sys.path:
    sys.path.append(str(BACKEND_ROOT.parent))

try:
	from database.connection import get_connection
	from database.models import ensure_descriptive_tables
except ImportError:
	from backend.database.connection import get_connection
	from backend.database.models import ensure_descriptive_tables




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

	for topic, tag, title, expl, focus in (spherical_misconceptions + reflection_misconceptions + [
		("refraction", "refraction_bending_normal", "Bending Direction Error", "Student thinks light bends away from normal when entering denser medium.", "refraction direction"),
		("refraction", "snell_law_confusion", "Snell Law Confusion", "Incorrect relationship between angles and refractive indices.", "Snell law"),
		("refraction", "glass_slab_parallel_confusion", "Glass Slab Parallel Ray Error", "Thinks emergent ray is not parallel to incident ray in glass slab.", "glass slab"),
		("refraction", "lateral_displacement_confusion", "Lateral Displacement Error", "Confuses lateral displacement with change in ray direction.", "lateral displacement"),
		("refraction", "convex_concave_lens_confusion", "Convex vs Concave Lens", "Mixes up converging and diverging lens types.", "lens types"),
		("refraction", "lens_focus_confusion", "Lens Focus Error", "Incorrect location or meaning of principal focus for lenses.", "lens focus"),
		("refraction", "lens_image_nature_confusion", "Lens Image Nature Error", "Wrong real/virtual or erect/inverted prediction for lens images.", "lens images"),
		("refraction", "lens_formula_sign_error", "Lens Formula Sign Error", "Uses wrong sign convention in lens formula.", "sign convention"),
		("refraction", "lens_power_confusion", "Lens Power Confusion", "Incorrect dioptre calculation or unit.", "lens power"),
	]):
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

	# Seed descriptive questions
	descriptive_questions = [
		(
			"laws_of_reflection",
			"State the two laws of reflection of light.",
			json.dumps([
				"The angle of incidence is equal to the angle of reflection (i = r).",
				"The incident ray, the normal to the mirror at the point of incidence, and the reflected ray all lie in the same plane."
			]),
			["incidence", "reflection", "equal", "ray", "normal", "plane", "mirror"]
		),
		(
			"plane_mirror",
			"What are the characteristics of the image formed by a plane mirror?",
			json.dumps([
				"The image is virtual and erect.",
				"The size of the image is equal to that of the object.",
				"The image is laterally inverted.",
				"The image is formed as far behind the mirror as the object is in front of it."
			]),
			["virtual", "erect", "equal", "size", "laterally", "inverted", "behind", "mirror", "object"]
		),
		(
			"spherical_mirrors",
			"Why does a concave mirror form a real, inverted image when the object is placed beyond its focus, but forms a virtual, erect image when the object is placed between the pole and the focus?",
			json.dumps([
				"Beyond the focus, reflected rays physically converge and intersect in front of the mirror (forming a real, inverted image).",
				"Between the pole and focus, reflected rays diverge and only appear to intersect behind the mirror when produced backwards (forming a virtual, erect image)."
			]),
			["concave", "focus", "pole", "converge", "diverge", "real", "virtual", "erect", "inverted", "intersect"]
		),
		(
			"refraction",
			"Explain why a ray of light bends towards the normal when it enters a glass slab from air, and bends away from the normal when it exits the glass slab back into the air.",
			json.dumps([
				"Air is optically rarer and glass is optically denser.",
				"Light travels slower in a denser medium (glass), causing the ray to bend towards the normal.",
				"Light travels faster in a rarer medium (air), causing the ray to bend away from the normal."
			]),
			["refraction", "glass", "air", "denser", "rarer", "slower", "faster", "normal", "bend", "speed"]
		),
		(
			"spherical_mirrors",
			"What is the relation between the radius of curvature and focal length of a spherical mirror? If a spherical mirror has a radius of curvature of 30 cm, what is its focal length?",
			json.dumps([
				"The radius of curvature is twice the focal length (R = 2f or f = R/2).",
				"Given R = 30 cm, the focal length f is 30/2 = 15 cm."
			]),
			["radius", "curvature", "focal", "length", "twice", "f = r/2", "r = 2f", "15", "15cm", "cm"]
		),
		(
			"refraction",
			"State Snell's law of refraction and define what is meant by the refractive index of a medium.",
			json.dumps([
				"The ratio of the sine of the angle of incidence to the sine of the angle of refraction is constant for a given pair of media.",
				"This constant is called the refractive index of the second medium with respect to the first (sin i / sin r = constant)."
			]),
			["sine", "sin", "incidence", "refraction", "constant", "ratio", "refractive", "index"]
		)
	]

	for topic, question, rubric, keywords in descriptive_questions:
		cur.execute(
			"""
			INSERT INTO descriptive_questions (topic, question_text, rubric_items, required_keywords)
			VALUES (%s, %s, %s, %s)
			ON CONFLICT (question_text) DO UPDATE SET
			topic = EXCLUDED.topic,
			rubric_items = EXCLUDED.rubric_items,
			required_keywords = EXCLUDED.required_keywords;
			""",
			(topic, question, rubric, keywords)
		)


def seed():
	conn = get_connection()
	cur = conn.cursor()

	ensure_schema(cur)
	ensure_descriptive_tables()
	seed_data(cur)

	conn.commit()
	conn.close()
	print("Database schema and data are ready.")



if __name__ == "__main__":
	seed()

