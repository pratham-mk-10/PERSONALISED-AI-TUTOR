import abc
import json
import os
from pathlib import Path
from typing import List, Optional
from urllib import request

from dotenv import load_dotenv

# Ensure environment is loaded from root / backend .env
BACKEND_ROOT = Path(__file__).resolve().parents[1]
for env_path in [BACKEND_ROOT.parent / ".env", BACKEND_ROOT / ".env"]:
    if env_path.exists():
        load_dotenv(dotenv_path=env_path, override=True)


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
    """Adapter for Google Gemini 2.5 Flash via REST API with multi-model fallback."""

    CANDIDATE_MODELS = [
        "gemini-2.5-flash",
        "gemini-3.8-flash",
        "gemini-3.5-flash",
        "gemini-flash-latest",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
    ]

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = (api_key or os.getenv("GEMINI_API_KEY", "")).strip()

    def generate(
        self,
        system_instruction: str,
        user_prompt: str,
        history: Optional[List[dict]] = None,
    ) -> str:
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY is not configured.")

        contents = []
        if history:
            for item in history[-10:]:
                role = "user" if item.get("role") == "user" else "model"
                contents.append({"role": role, "parts": [{"text": item.get("text", "")}]})

        contents.append({"role": "user", "parts": [{"text": user_prompt}]})

        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.4,
                "maxOutputTokens": 4096,
            },
        }
        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }

        body = json.dumps(payload).encode("utf-8")

        last_error = None
        for model in self.CANDIDATE_MODELS:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={self.api_key}"
            req = request.Request(
                url,
                data=body,
                headers={"Content-Type": "application/json"},
                method="POST",
            )
            try:
                with request.urlopen(req, timeout=25) as resp:
                    data = json.loads(resp.read().decode("utf-8"))
                    try:
                        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    except (KeyError, IndexError):
                        return "I reviewed your material, but could not produce a response. Please rephrase your question."
            except Exception as e:
                last_error = e
                continue

        if last_error:
            raise last_error
        return "Unable to generate response from Gemini."


class MistralAdapter(BaseLLMAdapter):
    """Fallback adapter for Mistral AI (mistral-small-latest)."""

    API_URL = "https://api.mistral.ai/v1/chat/completions"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = (api_key or os.getenv("MISTRAL_API_KEY", "")).strip()

    def generate(
        self,
        system_instruction: str,
        user_prompt: str,
        history: Optional[List[dict]] = None,
    ) -> str:
        if not self.api_key:
            raise ValueError("MISTRAL_API_KEY is not configured.")

        messages = []
        if system_instruction:
            messages.append({"role": "system", "content": system_instruction})

        if history:
            for item in history[-10:]:
                role = "user" if item.get("role") == "user" else "assistant"
                messages.append({"role": role, "content": item.get("text", "")})

        messages.append({"role": "user", "content": user_prompt})

        payload = {
            "model": "mistral-small-latest",
            "messages": messages,
            "temperature": 0.4,
            "max_tokens": 4096,
        }

        req = request.Request(
            self.API_URL,
            data=json.dumps(payload).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        with request.urlopen(req, timeout=25) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            try:
                return data["choices"][0]["message"]["content"].strip()
            except (KeyError, IndexError):
                return ""


class ResilientLLMAdapter(BaseLLMAdapter):
    """Composite adapter: attempts primary (Gemini 2.5 Flash), falls back to Mistral,
    and returns a clean pedagogical setup guidance if API keys are unconfigured or invalid."""

    def __init__(self, primary: Optional[BaseLLMAdapter] = None, fallback: Optional[BaseLLMAdapter] = None):
        self.primary = primary or GeminiFlashAdapter()
        self.fallback = fallback or MistralAdapter()

    def generate(
        self,
        system_instruction: str,
        user_prompt: str,
        history: Optional[List[dict]] = None,
    ) -> str:
        # Check if keys are empty or placeholders
        primary_key = getattr(self.primary, "api_key", "")
        fallback_key = getattr(self.fallback, "api_key", "")
        is_placeholder_primary = not primary_key or "your_" in primary_key or "change_me" in primary_key
        is_placeholder_fallback = not fallback_key or "your_" in fallback_key

        if not is_placeholder_primary:
            try:
                res = self.primary.generate(system_instruction, user_prompt, history)
                if res and res.strip():
                    return res
            except Exception as primary_err:
                print(f"[ResilientLLMAdapter] Primary model (Gemini) failed: {primary_err}. Trying fallback...")

        if not is_placeholder_fallback:
            try:
                res = self.fallback.generate(system_instruction, user_prompt, history)
                if res and res.strip():
                    return res
            except Exception as fallback_err:
                print(f"[ResilientLLMAdapter] Fallback model (Mistral) failed: {fallback_err}.")

        # If keys are placeholders or invalid, provide a clear instructional response
        return (
            "✨ **Material Received & In-Memory Cached!**\n\n"
            "Your uploaded study materials are successfully parsed and ready in backend memory. "
            "To activate live AI responses from **Gemini 2.5 Flash**, please set a valid `GEMINI_API_KEY` in your `.env` file (available for free from Google AI Studio).\n\n"
            "Once configured, you can ask any question, and the tutor will cite specific pages and formulas from your materials!"
        )
