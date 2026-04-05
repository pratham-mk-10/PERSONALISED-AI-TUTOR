from module_loader import load_module

_mod = load_module("assesment_agent.question_engine", "assesment_agent/question_engine.py")
generate_questions = _mod.generate_questions
SYLLABUS_SCOPE = _mod.syllabus_scope

__all__ = ["generate_questions", "SYLLABUS_SCOPE"]
