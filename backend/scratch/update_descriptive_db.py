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
    ensure_descriptive_tables()

    conn = get_connection()
    cur = conn.cursor()

    # Compile the full set of descriptive questions sourced from the NCERT textbook PDF
    # (in-text questions, exercise questions, and custom additions to ensure >= 3 questions per topic)
    questions_dataset = [
        # --- TOPIC: laws_of_reflection ---
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

        # --- TOPIC: plane_mirror ---
        (
            "plane_mirror",
            "What are the characteristics of the image formed by a plane mirror?",
            json.dumps([
                "The image formed by a plane mirror is always virtual and erect.",
                "The size of the image is equal to that of the object.",
                "The image is formed as far behind the mirror as the object is in front of it.",
                "The image is laterally inverted (left-right reversed)."
            ]),
            ["virtual", "erect", "equal", "size", "laterally", "inverted", "behind", "mirror", "object"]
        ),
        (
            "plane_mirror",
            "The magnification produced by a plane mirror is +1. What does this mean? (NCERT Exercise Q13)",
            json.dumps([
                "Magnification m = +1 means the image is of the same size as the object.",
                "The positive (+) sign indicates that the image is virtual and erect.",
                "The absolute value of 1 shows that image height equals object height (h' = h)."
            ]),
            ["magnification", "plane", "mirror", "plus one", "+1", "same size", "virtual", "erect"]
        ),
        (
            "plane_mirror",
            "A student stands 2 meters in front of a plane mirror. If the student moves 0.5 meters towards the mirror, what is the new distance between the student and their image? Explain your answer using the properties of plane mirrors.",
            json.dumps([
                "Initially, the student is 2 m from the mirror, meaning the image is 2 m behind the mirror.",
                "After moving 0.5 m closer, the new object distance (u) is 2 - 0.5 = 1.5 meters.",
                "Since object distance equals image distance in a plane mirror, the image is also 1.5 meters behind the mirror.",
                "The total distance between the student and their image is u + v = 1.5 + 1.5 = 3.0 meters."
            ]),
            ["distance", "plane mirror", "moves", "closer", "image distance", "object distance", "1.5", "3.0", "meters"]
        ),

        # --- TOPIC: spherical_mirror_basics ---
        (
            "spherical_mirror_basics",
            "Define the principal focus of a concave mirror. (NCERT In-text Page 142 Q1)",
            json.dumps([
                "Light rays parallel to the principal axis of a concave mirror meet or converge at a single point on the principal axis after reflection.",
                "This convergence point is defined as the principal focus (F) of the concave mirror."
            ]),
            ["principal", "focus", "concave", "mirror", "parallel", "converge", "axis"]
        ),
        (
            "spherical_mirror_basics",
            "The radius of curvature of a spherical mirror is 20 cm. What is its focal length? (NCERT In-text Page 142 Q2)",
            json.dumps([
                "For spherical mirrors of small aperture, focal length (f) is half the radius of curvature (R), i.e., f = R / 2.",
                "Given R = 20 cm, the focal length f = 20 / 2 = 10 cm."
            ]),
            ["radius", "curvature", "focal", "length", "f = r/2", "20", "10", "cm"]
        ),
        (
            "spherical_mirror_basics",
            "Find the focal length of a convex mirror whose radius of curvature is 32 cm. (NCERT In-text Page 145 Q1)",
            json.dumps([
                "The focal length (f) of a convex mirror is half of its radius of curvature (R), i.e., f = R / 2.",
                "Given R = 32 cm, the focal length f = 32 / 2 = 16 cm.",
                "By sign convention, the focal length of a convex mirror is positive (+16 cm)."
            ]),
            ["focal", "length", "convex", "mirror", "radius", "curvature", "32", "16", "cm"]
        ),

        # --- TOPIC: spherical_mirror_rules ---
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
        (
            "spherical_mirror_rules",
            "Explain the path of a ray of light passing through the principal focus of a concave mirror, or directed towards the principal focus of a convex mirror, after reflection. Justify your answer.",
            json.dumps([
                "A ray of light passing through the principal focus of a concave mirror (or directed towards the focus of a convex mirror) emerges parallel to the principal axis after reflection.",
                "This is the converse of the rule for a parallel ray, following the principle of reversibility of light paths."
            ]),
            ["ray", "focus", "concave", "convex", "parallel", "principal", "axis", "reflection", "emerges"]
        ),

        # --- TOPIC: spherical_mirror_image_formation ---
        (
            "spherical_mirror_image_formation",
            "Name a mirror that can give an erect and enlarged image of an object. Describe the position of the object for this image to form. (NCERT In-text Page 142 Q3)",
            json.dumps([
                "A concave mirror can form an erect and enlarged image of an object.",
                "This virtual, erect, and magnified image is formed only when the object is placed close to the mirror, specifically between its Pole (P) and Principal Focus (F)."
            ]),
            ["erect", "enlarged", "concave", "mirror", "pole", "focus", "between"]
        ),
        (
            "spherical_mirror_image_formation",
            "Why do we prefer a convex mirror as a rear-view mirror in vehicles? (NCERT In-text Page 142 Q4)",
            json.dumps([
                "Convex mirrors always give an erect, though diminished, image.",
                "They have a wider field of view as they are curved outwards, allowing the driver to see a much larger area of traffic behind them than is possible with a plane mirror."
            ]),
            ["convex", "rear-view", "mirror", "vehicles", "erect", "diminished", "field of view", "outwards"]
        ),
        (
            "spherical_mirror_image_formation",
            "A concave mirror produces three times magnified (enlarged) real image of an object placed at 10 cm in front of it. Where is the image located? (NCERT In-text Page 145 Q2)",
            json.dumps([
                "Given object distance u = -10 cm.",
                "Since the image is real and magnified 3 times, magnification m = -3.",
                "Using magnification formula m = -v/u, we get -3 = -v/(-10), which simplifies to v = -30 cm.",
                "The image is located at a distance of 30 cm in front of the mirror (on the same side as the object)."
            ]),
            ["concave", "mirror", "magnified", "real", "10", "u = -10", "m = -3", "v = -30", "30", "cm"]
        ),
        (
            "spherical_mirror_image_formation",
            "We wish to obtain an erect image of an object, using a concave mirror of focal length 15 cm. What should be the range of distance of the object from the mirror? What is the nature of the image? Is the image larger or smaller than the object? (NCERT Exercise Q7)",
            json.dumps([
                "To obtain an erect image using a concave mirror, the object must be placed between the Pole and Focus (F).",
                "Given focal length f = 15 cm, the range of object distance should be from 0 cm to 15 cm (i.e. u < 15 cm).",
                "The nature of the image is virtual and erect.",
                "The image is larger (magnified) than the object."
            ]),
            ["erect", "concave", "15", "focal", "range", "0 to 15", "virtual", "larger", "magnified"]
        ),
        (
            "spherical_mirror_image_formation",
            "Name the type of mirror used in the following situations and support your answer with reason: (a) Headlights of a car, (b) Side/rear-view mirror of a vehicle, (c) Solar furnace. (NCERT Exercise Q8)",
            json.dumps([
                "(a) Headlights of a car: Concave mirror is used because if a light source is placed at its focus, it reflects the light rays parallelly to produce a powerful beam of light.",
                "(b) Side/rear-view mirror: Convex mirror is used because it always forms a virtual, erect, and diminished image, offering a wider field of view.",
                "(c) Solar furnace: Large concave mirror is used because it converges parallel rays of sunlight to focus at a point, producing extreme heat."
            ]),
            ["headlights", "rear-view", "solar", "furnace", "concave", "convex", "parallel", "converge", "diverge"]
        ),
        (
            "spherical_mirror_image_formation",
            "An object is placed at a distance of 10 cm from a convex mirror of focal length 15 cm. Find the position and nature of the image. (NCERT Exercise Q12)",
            json.dumps([
                "Given object distance u = -10 cm and focal length f = +15 cm (convex mirror).",
                "Using the mirror formula 1/v + 1/u = 1/f, we get 1/v = 1/15 - 1/(-10) = 1/15 + 1/10 = 5/30 = 1/6.",
                "Therefore, image distance v = +6 cm.",
                "The positive sign shows that the image is formed behind the mirror at 6 cm, and its nature is virtual and erect."
            ]),
            ["convex", "10", "15", "mirror formula", "v = 6", "6", "virtual", "erect", "behind"]
        ),
        (
            "spherical_mirror_image_formation",
            "An object 5.0 cm in length is placed at a distance of 20 cm in front of a convex mirror of radius of curvature 30 cm. Find the position of the image, its nature and size. (NCERT Exercise Q14)",
            json.dumps([
                "Given height h = 5 cm, object distance u = -20 cm, and radius of curvature R = 30 cm (f = R/2 = +15 cm).",
                "Using mirror formula: 1/v = 1/15 - 1/(-20) = 1/15 + 1/20 = 7/60, which gives v = 60/7 = +8.57 cm behind the mirror.",
                "Using magnification m = -v/u = h'/h: h' = h * (-v/u) = 5 * (-60/7) / (-20) = 15/7 = +2.14 cm.",
                "The image is virtual, erect, diminished (2.14 cm), and formed behind the mirror at 8.57 cm."
            ]),
            ["convex", "radius", "30", "focal", "15", "20", "position", "v = 8.57", "size", "h' = 2.14", "virtual", "erect"]
        ),
        (
            "spherical_mirror_image_formation",
            "An object of size 7.0 cm is placed at 27 cm in front of a concave mirror of focal length 18 cm. At what distance from the mirror should a screen be placed, so that a sharp focussed image can be obtained? Find the size and the nature of the image. (NCERT Exercise Q15)",
            json.dumps([
                "Given height h = 7 cm, object distance u = -27 cm, and focal length f = -18 cm (concave mirror).",
                "Using mirror formula: 1/v = 1/(-18) - 1/(-27) = -1/18 + 1/27 = -1/54, which gives image distance v = -54 cm.",
                "Thus, the screen should be placed at 54 cm in front of the mirror.",
                "Height h' = h * (-v/u) = 7 * (-(-54)/(-27)) = 7 * (-2) = -14 cm.",
                "The image is real, inverted, magnified (-14 cm), and formed on the screen at 54 cm."
            ]),
            ["concave", "27", "18", "screen", "v = -54", "size", "h' = -14", "real", "inverted", "magnified"]
        ),

        # --- TOPIC: refraction ---
        (
            "refraction",
            "A ray of light travelling in air enters obliquely into water. Does the light ray bend towards the normal or away from the normal? Why? (NCERT In-text Page 150 Q1)",
            json.dumps([
                "The light ray bends towards the normal.",
                "This occurs because water is optically denser than air.",
                "As light enters a denser medium from a rarer one, its speed decreases, causing the ray to bend towards the normal line."
            ]),
            ["obliquely", "water", "air", "towards", "normal", "denser", "rarer", "speed", "decreases"]
        ),
        (
            "refraction",
            "Light enters from air to glass having refractive index 1.50. What is the speed of light in the glass? The speed of light in vacuum is 3 * 10^8 m/s. (NCERT In-text Page 150 Q2)",
            json.dumps([
                "The absolute refractive index of glass (n) is defined as n = c / v, where c is speed in vacuum and v is speed in glass.",
                "Given n = 1.50 and c = 3 * 10^8 m/s, we get v = c / n = (3 * 10^8) / 1.50 = 2 * 10^8 m/s.",
                "Therefore, the speed of light in glass is 2 * 10^8 m/s."
            ]),
            ["glass", "refractive", "1.50", "speed", "vacuum", "3", "10^8", "v = 2", "2 * 10^8"]
        ),
        (
            "refraction",
            "Find out the medium having highest optical density and the medium with lowest optical density from the textbook values. (NCERT In-text Page 150 Q3)",
            json.dumps([
                "Optical density is directly proportional to the absolute refractive index.",
                "Based on the textbook data (Table 9.3), Diamond has the highest refractive index (2.42), meaning it has the highest optical density.",
                "Air has the lowest refractive index (1.0003), meaning it has the lowest optical density."
            ]),
            ["medium", "highest", "optical", "density", "lowest", "diamond", "2.42", "air", "1.0003"]
        ),
        (
            "refraction",
            "You are given kerosene, turpentine and water. In which of these does the light travel fastest? Use the textbook refractive index values. (NCERT In-text Page 150 Q4)",
            json.dumps([
                "The speed of light in a medium is inversely proportional to its refractive index (v = c / n).",
                "The refractive indexes are: Water = 1.33, Kerosene = 1.44, Turpentine = 1.47.",
                "Since water has the lowest refractive index, light travels fastest in water."
            ]),
            ["keresone", "turpentine", "water", "fastest", "refractive", "1.33", "1.44", "1.47"]
        ),
        (
            "refraction",
            "The refractive index of diamond is 2.42. What is the meaning of this statement? (NCERT In-text Page 150 Q5)",
            json.dumps([
                "The absolute refractive index of a medium is defined as n = c/v, where c is the speed of light in vacuum and v is the speed of light in the medium.",
                "A refractive index of 2.42 means that the speed of light in diamond is 1/2.42 times (or about 41%) the speed of light in vacuum.",
                "It represents the ratio of the speed of light in vacuum to the speed of light in diamond (c/v = 2.42)."
            ]),
            ["diamond", "2.42", "speed", "vacuum", "ratio", "medium", "light", "absolute", "refractive"]
        ),
        (
            "refraction",
            "Define 1 dioptre of power of a lens. (NCERT In-text Page 158 Q1)",
            json.dumps([
                "The power of a lens is the reciprocal of its focal length in meters: P = 1 / f (in meters).",
                "1 dioptre (1 D) is defined as the power of a lens whose focal length is exactly 1 meter (1 D = 1 m^-1)."
            ]),
            ["dioptre", "power", "lens", "focal", "length", "1 meter", "1m", "reciprocal"]
        ),
        (
            "refraction",
            "Find the power of a concave lens of focal length 2 m. (NCERT In-text Page 158 Q3)",
            json.dumps([
                "By sign convention, the focal length of a concave lens is negative: f = -2 m.",
                "Power P = 1 / f (in meters) = 1 / (-2) = -0.5 D.",
                "Therefore, the power of the concave lens is -0.5 dioptres."
            ]),
            ["power", "concave", "focal", "2 m", "P = 1/f", "-2", "-0.5", "dioptre", "D"]
        ),
        (
            "refraction",
            "One-half of a convex lens is covered with a black paper. Will this lens produce a complete image of the object? Explain your observations. (NCERT Exercise Q9)",
            json.dumps([
                "Yes, the lens will still produce a complete image of the object.",
                "Light rays from every point of the object can still pass through the uncovered half of the lens to form a complete image.",
                "However, since the total amount of light entering the lens is halved, the brightness/intensity of the image will be reduced."
            ]),
            ["convex", "covered", "black", "paper", "complete", "image", "brightness", "intensity", "halved"]
        ),
        (
            "refraction",
            "Find the focal length of a lens of power -2.0 D. What type of lens is this? (NCERT Exercise Q16)",
            json.dumps([
                "Power P = 1 / f, which means focal length f = 1 / P.",
                "Given P = -2.0 D, f = 1 / (-2.0) = -0.5 meters (or -50 cm).",
                "Since the focal length (and power) is negative, this is a concave (diverging) lens."
            ]),
            ["focal", "length", "power", "-2.0", "f = -0.5", "-50", "meters", "concave", "diverging"]
        ),
        (
            "refraction",
            "A doctor has prescribed a corrective lens of power +1.5 D. Find the focal length of the lens. Is the prescribed lens diverging or converging? (NCERT Exercise Q17)",
            json.dumps([
                "Focal length f = 1 / P.",
                "Given P = +1.5 D, f = 1 / 1.5 = +0.67 meters (or +66.7 cm).",
                "Since the focal length (and power) is positive, this is a convex (converging) lens."
            ]),
            ["doctor", "power", "+1.5", "f = 0.67", "+66.7", "convex", "converging"]
        )
    ]

    # Clean seed descriptive_questions
    print("Clearing old descriptive questions...")
    cur.execute("TRUNCATE TABLE descriptive_questions RESTART IDENTITY CASCADE;")

    import re
    for topic, question, rubric, keywords in questions_dataset:
        cleaned_question = re.sub(r'\s*\(\s*NCERT[^)]*\)', '', question).strip()
        cur.execute(
            """
            INSERT INTO descriptive_questions (topic, question_text, rubric_items, required_keywords)
            VALUES (%s, %s, %s, %s);
            """,
            (topic, cleaned_question, rubric, keywords)
        )
    
    conn.commit()
    conn.close()
    print("Database descriptive questions successfully updated with in-text, exercise, and topic-balanced questions!")

if __name__ == "__main__":
    update_descriptive_questions()
