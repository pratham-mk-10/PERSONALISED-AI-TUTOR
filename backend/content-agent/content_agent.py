import importlib.util
from pathlib import Path


def _load_local_module(module_name: str, file_name: str):
    base_dir = Path(__file__).resolve().parent
    file_path = base_dir / file_name
    spec = importlib.util.spec_from_file_location(module_name, file_path)
    if spec is None or spec.loader is None:
        raise ImportError(f"Unable to load module from {file_path}")

    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_llm_service = _load_local_module("content_agent_llm_service", "llm_service.py")
_svg_template_picker = _load_local_module("content_agent_svg_template_picker", "svg_template_picker.py")
_template_quiz_scope = _load_local_module("content_agent_template_quiz_scope", "template_quiz_scope.py")

ContentAgentLLMService = _llm_service.ContentAgentLLMService
pick_svg_template = _svg_template_picker.pick_svg_template
pick_svg_variant = _svg_template_picker.pick_svg_variant
get_template_quiz_scope = _template_quiz_scope.get_template_quiz_scope

_physics_validator = _load_local_module("content_agent_physics_validator", "physics_validator.py")
validate_and_fix = _physics_validator.validate_and_fix


class ContentAgent:

    def __init__(self, db_connection_factory=None):
        self.llm = ContentAgentLLMService(db_connection_factory)

    def generate(self, subtopic, misconception_tag, attempt, question_text=None, student_answer=None, correct_answer=None):
        dynamic_tags = {
            "ray_passes_through_center_of_curvature", 
            "ray_misses_focal_point", 
            "lens_optical_center_confusion",
            "lens_parallel_ray_wrong",
            "concave_lens_converge_myth",
            "concave_lens_parallel_ray_wrong",
            "tir_critical_angle_confusion",
            "mirror_formula_wrong",
            "lens_formula_wrong",
            "convex_real_image_myth",
            "convex_size_confusion",
            "real_virtual_confusion",
            "image_position_confusion",
            "image_size_confusion",
            "inverted_erect_confusion",
            "focus_infinity_confusion",
            "beyond_c_confusion",
            "parallel_ray_rule_wrong",
            "focus_ray_rule_wrong",
            "center_ray_rule_wrong",
            "sign_convention_confusion"
        }

        
        svg_component = pick_svg_template(subtopic, misconception_tag)
        animation_parameters = None
        explanation = ""

        if attempt == 1:
            explanation = "Try again and observe the diagram carefully."
        elif misconception_tag in dynamic_tags:
            try:
                # Call the LLM to generate both text explanation and math coordinates
                result = self.llm.get_dynamic_feedback(
                    subtopic=subtopic,
                    misconception_tag=misconception_tag,
                    question_text=question_text,
                    student_answer=student_answer
                )
                explanation = result.get("explanation", "Review this concept carefully.")
                raw_parameters = result.get("animation_parameters")
            except Exception:
                explanation = "Review this concept carefully."
                raw_parameters = None
            
            # Tier 3: Intercept and validate LLM output (or procedural fallback)
            animation_parameters = validate_and_fix(raw_parameters, misconception_tag)
            
            svg_component = "DynamicSVGRenderer"
        else:
            # Fallback to standard text-only explanation
            explanation = self.llm.get_explanation(
                subtopic=subtopic,
                misconception_tag=misconception_tag,
                attempt=attempt,
                question_text=question_text,
                student_answer=student_answer,
                correct_answer=correct_answer,
            )

        return {
            "svg_component": svg_component,
            "svg_variant": pick_svg_variant(misconception_tag),
            "explanation": explanation,
            "animation_parameters": animation_parameters,
        }
