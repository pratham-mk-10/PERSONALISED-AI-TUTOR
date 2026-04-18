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

ContentAgentLLMService = _llm_service.ContentAgentLLMService
pick_svg_template = _svg_template_picker.pick_svg_template


class ContentAgent:

    def __init__(self, db_connection_factory=None):
        self.llm = ContentAgentLLMService(db_connection_factory)

    def generate(self, subtopic, misconception_tag, attempt, question_text=None, student_answer=None, correct_answer=None):
        explanation = self.llm.get_explanation(
            subtopic=subtopic,
            misconception_tag=misconception_tag,
            attempt=attempt,
            question_text=question_text,
            student_answer=student_answer,
            correct_answer=correct_answer,
        )

        return {
            "svg_component": pick_svg_template(subtopic),
            "explanation": explanation
        }
