import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent / "backend"))

import importlib.util
spec = importlib.util.spec_from_file_location("physics_validator", str(Path(__file__).resolve().parent / "backend/content-agent/physics_validator.py"))
physics_validator_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(physics_validator_module)
validate_and_fix = physics_validator_module.validate_and_fix

def run_tests():
    print("==================================================")
    print("TEST: LENS OPTICAL CENTER")
    fake_llm_optical = {
        "student_incorrect_trajectory": [],
        "physics_correct_trajectory": [
            {"x": 200, "y": 100}, # Incident ray from top left
            {"x": 400, "y": 200}, # Hits optical center
            {"x": 600, "y": 250}  # WRONG: LLM hallucinates bending
        ]
    }
    
    fixed_optical = validate_and_fix(fake_llm_optical, "lens_optical_center_confusion")
    print("AFTER VALIDATION:")
    print(fixed_optical["physics_correct_trajectory"])
    
    print("\n==================================================")
    print("TEST: LENS PARALLEL RAY")
    fake_llm_parallel = {
        "student_incorrect_trajectory": [],
        "physics_correct_trajectory": [
            {"x": 200, "y": 100}, # Incident ray parallel
            {"x": 400, "y": 100}, # Hits lens
            {"x": 600, "y": 100}  # WRONG: LLM hallucinates going straight
        ]
    }
    
    fixed_parallel = validate_and_fix(fake_llm_parallel, "lens_parallel_ray_wrong")
    print("AFTER VALIDATION:")
    print(fixed_parallel["physics_correct_trajectory"])

if __name__ == "__main__":
    run_tests()
