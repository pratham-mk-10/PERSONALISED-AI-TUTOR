import sys
from pathlib import Path

# Add backend to path so we can import
sys.path.append(str(Path(__file__).resolve().parent / "backend"))

import importlib.util

spec = importlib.util.spec_from_file_location("physics_validator", str(Path(__file__).resolve().parent / "backend/content-agent/physics_validator.py"))
physics_validator_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(physics_validator_module)
validate_and_fix = physics_validator_module.validate_and_fix

def run_tests():
    # Simulate LLM generating a completely wrong physics_correct_trajectory (e.g. passing through Y=250 instead of focus Y=200)
    fake_llm_output = {
        "student_incorrect_trajectory": [
            {"x": 0, "y": 100},
            {"x": 400, "y": 100},
            {"x": 200, "y": 200}
        ],
        "physics_correct_trajectory": [
            {"x": 0, "y": 100},
            {"x": 400, "y": 100},
            {"x": 250, "y": 250} # THIS IS WRONG for a concave mirror (should be 300, 200)
        ]
    }
    
    print("BEFORE VALIDATION:")
    print(fake_llm_output["physics_correct_trajectory"])
    
    fixed = validate_and_fix(fake_llm_output, "ray_passes_through_center_of_curvature")
    
    print("AFTER VALIDATION:")
    print(fixed["physics_correct_trajectory"])

if __name__ == "__main__":
    run_tests()
