from module_loader import load_module

_mod = load_module("assessment_question_selector", "assesment_agent/question_selector.py")
select_question = _mod.select_question

__all__ = ["select_question"]
