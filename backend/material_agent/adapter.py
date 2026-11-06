"""
material_agent/adapter.py — LLM adapters for the Material Tutor Agent.

All actual model selection and fallback logic is centralised in
``backend/llm_gateway.py``.  The adapter classes here are kept as a thin
compatibility layer so that existing callers (MaterialTutorAgent, unit tests)
continue to work without changes to their import paths.

Assumptions
-----------
- ``llm_gateway.call_llm`` handles Gemini model waterfall + Mistral fallback.
- ``ResilientLLMAdapter`` is the default adapter used by ``MaterialTutorAgent``.
- ``GeminiFlashAdapter`` and ``MistralAdapter`` are retained for unit-test
  injection and future per-adapter configuration, but delegate to the gateway.
"""

import abc
import sys
from pathlib import Path
from typing import List, Optional

# ── Add backend root to sys.path so llm_gateway is importable ────────────────
_BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from llm_gateway import call_llm  # centralised LLM gateway


class BaseLLMAdapter(abc.ABC):
    """Abstract adapter defining the contract for LLM providers."""

    @abc.abstractmethod
    def generate(
        self,
        system_instruction: str,
        user_prompt: str,
        history: Optional[List[dict]] = None,
    ) -> str:
        """Generates a text completion given the instruction, user prompt, and conversation history."""
        pass


class GeminiFlashAdapter(BaseLLMAdapter):
    """Adapter for Google Gemini 2.5 Flash — delegates to llm_gateway."""

    def generate(
        self,
        system_instruction: str,
        user_prompt: str,
        history: Optional[List[dict]] = None,
    ) -> str:
        return call_llm(
            system_instruction=system_instruction,
            user_prompt=user_prompt,
            history=history,
            temperature=0.4,
            max_tokens=4096,
        )


class MistralAdapter(BaseLLMAdapter):
    """Mistral fallback adapter — delegates to llm_gateway (which handles Mistral internally)."""

    def generate(
        self,
        system_instruction: str,
        user_prompt: str,
        history: Optional[List[dict]] = None,
    ) -> str:
        # The gateway already includes Mistral as the final fallback.
        # Calling call_llm here will use Mistral if Gemini is unavailable.
        return call_llm(
            system_instruction=system_instruction,
            user_prompt=user_prompt,
            history=history,
            temperature=0.4,
            max_tokens=4096,
        )


class ResilientLLMAdapter(BaseLLMAdapter):
    """Composite adapter that delegates entirely to the centralised llm_gateway.

    The gateway handles:
    - Gemini model waterfall (gemini-2.5-flash → gemini-2.0-flash → ...)
    - In-process model caching (no waterfall penalty after first success)
    - Mistral fallback when all Gemini models fail

    This class exists as a named compatibility shim so that MaterialTutorAgent
    can continue to instantiate ``ResilientLLMAdapter()`` without changes.
    """

    def generate(
        self,
        system_instruction: str,
        user_prompt: str,
        history: Optional[List[dict]] = None,
    ) -> str:
        try:
            return call_llm(
                system_instruction=system_instruction,
                user_prompt=user_prompt,
                history=history,
                temperature=0.4,
                max_tokens=4096,
            )
        except RuntimeError as exc:
            # Gateway exhausted all providers — return a user-facing message
            # so the chat does not crash with a 500.
            print(f"[ResilientLLMAdapter] All LLM providers failed: {exc}")
            return (
                "I'm having trouble reaching the AI service right now. "
                "Please check your GEMINI_API_KEY and MISTRAL_API_KEY in the .env file, "
                "then try again."
            )
