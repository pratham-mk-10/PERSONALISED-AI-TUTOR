from module_loader import load_module

_mod = load_module("adaptation_feedback_trigger", "adaptataion-agent/feedback_trigger.py")
generate_reasoning = _mod.generate_reasoning

__all__ = ["generate_reasoning"]
