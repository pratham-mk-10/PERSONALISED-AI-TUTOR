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
    print("TEST: CONCAVE LENS DIVERGENCE")
    fake_llm = {
        "student_incorrect_trajectory": [],
        "physics_correct_trajectory": [
            {"x": 200, "y": 100}, # Incident ray parallel
            {"x": 400, "y": 100}, # Hits lens
            {"x": 600, "y": 100}  # WRONG: LLM hallucinated it going straight
        ]
    }
    fixed = validate_and_fix(fake_llm, "concave_lens_parallel_ray_wrong")
    print("AFTER VALIDATION:")
    print(fixed["physics_correct_trajectory"])
    
    print("\n==================================================")
    print("TEST: GLASS SLAB LATERAL SHIFT")
    fake_llm_slab = {
        "student_incorrect_trajectory": [],
        "physics_correct_trajectory": [
            {"x": 200, "y": 100}, # Incident point
            {"x": 300, "y": 200}, # Hits slab top
            {"x": 350, "y": 300}, # Hits slab bottom (refracted)
            {"x": 500, "y": 350}  # WRONG: Emergent ray bends at wrong angle
        ]
    }
    fixed_slab = validate_and_fix(fake_llm_slab, "glass_slab_lateral_shift_wrong")
    print("AFTER VALIDATION:")
    print(fixed_slab["physics_correct_trajectory"])

    print("\n==================================================")
    print("TEST: TIR CRITICAL ANGLE")
    fake_llm_tir = {
        "student_incorrect_trajectory": [],
        "physics_correct_trajectory": [
            {"x": 300, "y": 300}, # Under water
            {"x": 400, "y": 200}, # Hits surface (interface)
            {"x": 600, "y": 150}  # WRONG: Refracts out instead of TIR
        ]
    }
    fixed_tir = validate_and_fix(fake_llm_tir, "tir_critical_angle_confusion")
    print("AFTER VALIDATION:")
    print(fixed_tir["physics_correct_trajectory"])

    print("\n==================================================")
    print("TEST: LENS FORMULA")
    # 1/v = 1/f + 1/u
    # u = -300, f = 100
    # 1/v = 1/100 - 1/300 = 3/300 - 1/300 = 2/300. v = +150
    # Image should be at X = 400 + 150 = 550.
    fake_llm_lens_form = {
        "student_incorrect_trajectory": [],
        "physics_correct_trajectory": [
            {"x": 100, "y": 150}, # Object at X=100 (u=-300)
            {"x": 400, "y": 150}, # Hits lens
            {"x": 500, "y": 200}  # WRONG: Intersects at X=500
        ]
    }
    fixed_lens_form = validate_and_fix(fake_llm_lens_form, "lens_formula_wrong")
    print("AFTER VALIDATION:")
    print(fixed_lens_form["physics_correct_trajectory"])

if __name__ == "__main__":
    run_tests()
