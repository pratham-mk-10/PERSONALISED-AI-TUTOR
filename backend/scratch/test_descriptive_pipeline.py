import json
import sys
from pathlib import Path

# Add backend to path to import evaluator
BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.append(str(BACKEND_ROOT))

from assesment_agent.descriptive_evaluator import DescriptiveEvaluator

def run_tests():
    evaluator = DescriptiveEvaluator()

    question = "Why does a concave mirror form a real image but a convex mirror forms a virtual one?"
    rubric = [
        "Concave mirrors physically converge light rays to a point in front of the mirror.",
        "Real images are formed when rays actually intersect.",
        "Convex mirrors diverge light rays.",
        "Virtual images are formed when rays only appear to intersect behind the mirror."
    ]
    misconceptions = ["concave_convex_confusion", "center_of_curvature_confusion"]
    keywords = ["concave", "convex", "real", "virtual", "converge", "diverge", "mirror", "ray"]

    print("==================================================")
    print("TEST 1: Short Answer (Gate length failure)")
    print("==================================================")
    ans1 = "No idea."
    res1 = evaluator.evaluate_answer("test_student", 1, question, ans1, rubric, misconceptions, keywords)
    print("Student Answer:", ans1)
    print("Result:", json.dumps(res1, indent=2))
    assert res1["scores"]["conceptual"] == 0
    assert "too short" in res1["feedback"]
    print("TEST 1 PASSED.\n")

    print("==================================================")
    print("TEST 2: Meaningless Answer (Gate keyword failure)")
    print("==================================================")
    ans2 = "The weather is nice and the sky is blue today."
    res2 = evaluator.evaluate_answer("test_student", 1, question, ans2, rubric, misconceptions, keywords)
    print("Student Answer:", ans2)
    print("Result:", json.dumps(res2, indent=2))
    assert res2["scores"]["conceptual"] == 0
    assert "does not contain" in res2["feedback"]
    print("TEST 2 PASSED.\n")

    print("==================================================")
    print("TEST 3: Conceptually Incorrect (Triggers LLM & Tagging)")
    print("==================================================")
    # This answer has a center of curvature misconception
    ans3 = "Concave mirrors cave in so the light rays reflect and meet at the center of curvature. Convex mirrors reflect light outwards so they form virtual images behind the mirror."
    res3 = evaluator.evaluate_answer("test_student", 1, question, ans3, rubric, misconceptions, keywords)
    print("Student Answer:", ans3)
    print("Result:", json.dumps(res3, indent=2))
    assert res3["scores"]["conceptual"] > 0
    assert res3["misconception_tag"] == "center_of_curvature_confusion"
    print("TEST 3 PASSED.\n")

    print("==================================================")
    print("TEST 4: Fully Correct (Triggers LLM & High Score)")
    print("==================================================")
    ans4 = "A concave mirror curves inwards and makes light rays meet at a point in front of it when they are parallel. Since the rays actually cross, it creates a real image. A convex mirror curves outwards and spreads light rays apart, so they only look like they are coming from a point behind it, making it virtual."
    res4 = evaluator.evaluate_answer("test_student", 1, question, ans4, rubric, misconceptions, keywords)
    print("Student Answer:", ans4)
    print("Result:", json.dumps(res4, indent=2))
    assert res4["scores"]["conceptual"] >= 8
    assert res4["misconception_tag"] is None
    print("TEST 4 PASSED.\n")

    print("ALL TESTS RUN COMPLETED.")

if __name__ == "__main__":
    run_tests()
