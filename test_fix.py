import sys
sys.path.append("backend")

from orchestrator.routes import generate_visual_fix, GenerateVisualFixRequest

req = GenerateVisualFixRequest(
    topic="reflection_refraction",
    misconception_tag="snell_law_confusion",
    question_text="A light ray passes from water to air...",
    student_answer="70°",
    correct_answer="60°"
)

result = generate_visual_fix(req)
print("Result:")
print(result)
