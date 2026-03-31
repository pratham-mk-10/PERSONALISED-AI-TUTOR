from module_loader import load_module

_mod = load_module("assessment_evaluator", "assesment-agent/evaluator.py")
Evaluator = _mod.Evaluator

__all__ = ["Evaluator"]
