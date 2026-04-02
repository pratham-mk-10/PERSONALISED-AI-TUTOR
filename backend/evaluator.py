from module_loader import load_module

_mod = load_module("assessment_evaluator", "assesment_agent/evaluator.py")
Evaluator = _mod.Evaluator

__all__ = ["Evaluator"]
