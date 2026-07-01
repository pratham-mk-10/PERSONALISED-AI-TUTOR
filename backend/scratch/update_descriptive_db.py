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

def update_descriptive_questions():
    # Make sure descriptive tables exist
    ensure_descriptive_tables()

    conn = get_connection()
    cur = conn.cursor()

    # Define exact questions from the textbook pages dataset:
    # 1. Topic: laws_of_reflection
    # 2. Topic: plane_mirror
    # 3. Topic: spherical_mirror_basics (corresponds to spherical-mirror-basics in frontend)
    # 4. Topic: spherical_mirror_rules (corresponds to spherical-mirror-rules in frontend)
    # 5. Topic: spherical_mirror_image_formation (corresponds to spherical-mirror-image-formation in frontend)
    # 6. Topic: refraction (corresponds to refraction-intro in frontend)

    questions_dataset = [
        # Laws of reflection
        (
            "laws_of_reflection",
            "State the two laws of reflection of light.",
            json.dumps([
                "The angle of incidence is equal to the angle of reflection (i = r).",
                "The incident ray, the normal to the mirror at the point of incidence, and the reflected ray all lie in the same plane."
            ]),
            ["incidence", "reflection", "equal", "incident", "normal", "plane", "mirror"]
        ),
        (
            "laws_of_reflection",
            "When a ray of light strikes a plane mirror normally (perpendicularly), it retraces its path back along the same line. Using the laws of reflection, explain why this occurs and state the angle values.",
            json.dumps([
                "The normal line is perpendicular to the surface at the point of incidence.",
                "Normal incidence means the light strikes at an angle of incidence of 0 degrees relative to the normal.",
                "Since the angle of incidence is 0 degrees, the angle of reflection must also be 0 degrees (i = r = 0).",
                "Therefore, the reflected ray travels back along the same path."
            ]),
            ["normally", "perpendicularly", "retraces", "incidence", "reflection", "zero", "0", "normal", "laws"]
        ),
        (
            "laws_of_reflection",
            "A student claims that diffuse reflection off a rough surface (like paper) violates the laws of reflection because light scatters in all directions. Critically analyze this statement.",
            json.dumps([
                "The laws of reflection are never violated, even on rough surfaces.",
                "Diffuse reflection occurs because the surface is uneven, meaning the normal line points in different directions at each point of incidence.",
                "At each individual point, the angle of incidence still equals the angle of reflection (i = r).",
                "The scattering of light in multiple directions is purely due to surface irregularities, not a failure of the reflection laws."
            ]),
            ["diffuse", "reflection", "rough", "uneven", "scatters", "normal", "violates", "irregularities", "specular"]
        ),
        
        # Plane mirror
        (
            "plane_mirror",
            "What are the characteristics of the image formed by a plane mirror?",
            json.dumps([
                "The image formed by a plane mirror is always virtual and erect.",
                "The size of the image is equal to that of the object.",
                "The image is formed as far behind the mirror as the object is in front of it.",
                "The image is laterally inverted (left appears right, right appears left)."
            ]),
            ["virtual", "erect", "equal", "size", "laterally", "inverted", "behind", "mirror", "object"]
        ),

        # Spherical mirror basics
        (
            "spherical_mirror_basics",
            "Define the terms Center of Curvature, Radius of Curvature, Pole, Principal Axis, and Principal Focus of a spherical mirror.",
            json.dumps([
                "Pole (P): The geometric center of the reflecting surface of a spherical mirror.",
                "Center of Curvature (C): The center of the hollow sphere of which the reflecting surface of the mirror forms a part.",
                "Radius of Curvature (R): The radius of the hollow sphere of which the mirror is a part.",
                "Principal Axis: The straight line passing through the pole and the center of curvature.",
                "Principal Focus (F): The point on the principal axis where parallel rays converge (concave) or appear to diverge from (convex) after reflection."
            ]),
            ["center", "radius", "curvature", "pole", "axis", "focus", "spherical", "mirror", "converge", "diverge"]
        ),
        (
            "spherical_mirror_basics",
            "What is the relationship between the radius of curvature (R) and focal length (f) of a spherical mirror? If a spherical mirror has a radius of curvature of 20 cm, calculate its focal length.",
            json.dumps([
                "For spherical mirrors of small aperture, the radius of curvature is twice the focal length: R = 2f.",
                "This implies that the principal focus lies midway between the pole and the center of curvature (f = R/2).",
                "Given R = 20 cm, the focal length f = R/2 = 20 / 2 = 10 cm."
            ]),
            ["radius", "curvature", "focal", "length", "r = 2f", "f = r/2", "20", "10", "cm"]
        ),

        # Spherical mirror rules
        (
            "spherical_mirror_rules",
            "Describe the path of a light ray passing through or directed towards the Center of Curvature of a spherical mirror after reflection. Justify this path using the normal and laws of reflection.",
            json.dumps([
                "A ray passing through the center of curvature of a concave mirror (or directed towards it for convex) is reflected back along the same path.",
                "This happens because the incident ray falls on the mirror surface normally (perpendicularly) along the radius.",
                "Since the line joining C to the point of incidence is the normal, the angle of incidence is 0 degrees.",
                "According to the laws of reflection, the angle of reflection is also 0 degrees, causing the ray to retrace its path."
            ]),
            ["center", "curvature", "reflected", "back", "same", "path", "normal", "perpendicular", "retraces", "0"]
        ),
        (
            "spherical_mirror_rules",
            "Explain how a ray parallel to the principal axis behaves after reflection from (a) a concave mirror and (b) a convex mirror.",
            json.dumps([
                "For a concave mirror, a ray parallel to the principal axis passes through the principal focus (F) in front of the mirror after reflection.",
                "For a convex mirror, a ray parallel to the principal axis appears to diverge from the principal focus (F) located behind the mirror after reflection."
            ]),
            ["parallel", "axis", "reflection", "concave", "convex", "focus", "converge", "diverge", "behind"]
        ),

        # Spherical mirror image formation
        (
            "spherical_mirror_image_formation",
            "Why does a concave mirror form a real, inverted image when the object is placed beyond its focus, but forms a virtual, erect image when the object is placed between the pole and the focus?",
            json.dumps([
                "When the object is placed beyond the focus (F), the reflected light rays physically intersect in front of the mirror, forming a real and inverted image.",
                "When the object is placed between the pole (P) and focus (F), the reflected rays diverge. When projected backward behind the mirror, they appear to meet, forming a virtual and erect image."
            ]),
            ["concave", "focus", "pole", "converge", "diverge", "real", "virtual", "erect", "inverted", "behind"]
        ),
        (
            "spherical_mirror_image_formation",
            "Discuss the positions, sizes, and nature of images formed by a convex mirror. Why do we prefer using a convex mirror as a rear-view mirror in vehicles?",
            json.dumps([
                "A convex mirror always forms a virtual, erect, and diminished image behind the mirror, regardless of the object's position.",
                "We prefer it as a rear-view mirror because it always gives an erect image and has a much wider field of view since it is curved outwards, enabling the driver to see a larger area of traffic."
            ]),
            ["convex", "rear-view", "vehicles", "virtual", "erect", "diminished", "field of view", "curved", "outwards"]
        ),

        # Refraction
        (
            "refraction",
            "What is refraction of light? Explain the rules of bending of light when a ray travels (a) from an optically rarer to a denser medium, and (b) from an optically denser to a rarer medium.",
            json.dumps([
                "Refraction is the change in the direction/propagation of light when it travels obliquely from one transparent medium to another due to changes in speed.",
                "When travelling from a rarer to a denser medium (e.g., air to glass), light slows down and bends towards the normal.",
                "When travelling from a denser to a rarer medium (e.g., glass to air), light speeds up and bends away from the normal."
            ]),
            ["refraction", "rarer", "denser", "normal", "bend", "towards", "away", "speed", "light", "slows", "speeds"]
        ),
        (
            "refraction",
            "State the two laws of refraction of light. Which law is specifically known as Snell's law of refraction?",
            json.dumps([
                "First Law: The incident ray, the refracted ray, and the normal to the interface of two transparent media at the point of incidence, all lie in the same plane.",
                "Second Law (Snell's Law): The ratio of the sine of the angle of incidence (sin i) to the sine of the angle of refraction (sin r) is constant for a given color of light and pair of media (sin i / sin r = constant)."
            ]),
            ["refraction", "incident", "refracted", "normal", "same plane", "ratio", "sine", "sin", "constant", "snell"]
        ),
        (
            "refraction",
            "Explain what is meant by the refractive index of a medium. What is the difference between relative refractive index and absolute refractive index?",
            json.dumps([
                "The refractive index is a measure of the bending of light, linked to the relative speed of light in different media.",
                "Relative Refractive Index: The ratio of the speed of light in medium 1 to the speed of light in medium 2 (n21 = v1 / v2).",
                "Absolute Refractive Index: The refractive index of a medium when medium 1 is vacuum or air (n = c / v, where c is the speed of light in vacuum)."
            ]),
            ["refractive", "index", "speed", "vacuum", "air", "ratio", "relative", "absolute", "bending"]
        ),
        (
            "refraction",
            "The refractive index of diamond is 2.42. What is the physical meaning of this statement in terms of the speed of light?",
            json.dumps([
                "The absolute refractive index of a medium is defined as n = c/v, where c is the speed of light in vacuum and v is the speed of light in the medium.",
                "A refractive index of 2.42 means that the speed of light in diamond is 1/2.42 times (or about 41%) the speed of light in vacuum.",
                "It represents the ratio of the speed of light in vacuum to the speed of light in diamond (c/v = 2.42)."
            ]),
            ["diamond", "2.42", "speed", "vacuum", "ratio", "medium", "light", "absolute", "refractive"]
        )
    ]

    # Delete existing descriptive questions first to ensure clean seed
    print("Clearing old descriptive questions...")
    cur.execute("TRUNCATE TABLE descriptive_questions RESTART IDENTITY CASCADE;")

    print(f"Seeding {len(questions_dataset)} descriptive questions matching the textbook pages dataset...")
    for topic, question, rubric, keywords in questions_dataset:
        cur.execute(
            """
            INSERT INTO descriptive_questions (topic, question_text, rubric_items, required_keywords)
            VALUES (%s, %s, %s, %s);
            """,
            (topic, question, rubric, keywords)
        )
    
    conn.commit()
    conn.close()
    print("Database descriptive questions successfully updated!")

if __name__ == "__main__":
    update_descriptive_questions()
