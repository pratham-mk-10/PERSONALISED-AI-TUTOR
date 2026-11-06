"""
llm_gateway.py — Centralised LLM Gateway for the entire backend.

Features:
- Live terminal logging for all AI API calls (model, status, latency, errors)
- Automatic Gemini candidate probing with in-process model caching
- Seamless Mistral fallback if all Gemini candidates fail
- Safe error decoding showing exact provider failure messages in the console
"""

from __future__ import annotations

import json
import logging
import os
import sys
import threading
import time
from pathlib import Path
from typing import List, Optional
from urllib import error as urllib_error, request as urllib_request

from dotenv import load_dotenv

# ---------------------------------------------------------------------------
# Boot: load .env files (root wins, then backend/.env as a fallback)
# ---------------------------------------------------------------------------
_BACKEND_ROOT = Path(__file__).resolve().parent
_ENV_PATHS = [
    _BACKEND_ROOT / ".env",
    _BACKEND_ROOT.parent / ".env",
]

for _p in reversed(_ENV_PATHS):          # load in reverse so root .env wins
    if _p.exists():
        load_dotenv(dotenv_path=_p, override=True)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
_GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models"
_MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions"

# Ordered preference list — tested top-to-bottom; working model is cached
_GEMINI_CANDIDATES: List[str] = [
    "gemini-2.5-flash",
    "gemini-3.5-flash",
    "gemini-3.8-flash",
    "gemini-flash-latest",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
]

_DEFAULT_TIMEOUT = 35  # seconds (headroom for large multi-page PDF summaries)

log = logging.getLogger(__name__)


def _log_terminal(msg: str) -> None:
    """Always prints to stderr immediately so terminal/PowerShell displays it in real time."""
    print(f"[AI-Gateway] {msg}", file=sys.stderr, flush=True)


def _parse_http_error(exc: urllib_error.HTTPError) -> str:
    """Extract clean error message from Gemini or Mistral HTTP response."""
    try:
        raw = exc.read().decode("utf-8", errors="replace")
        data = json.loads(raw)
        if isinstance(data, dict):
            if "error" in data and isinstance(data["error"], dict):
                return data["error"].get("message", raw)
            return data.get("message") or data.get("detail") or raw
        return raw
    except Exception:
        return str(exc)


# ---------------------------------------------------------------------------
# In-process cache for the proven working model (thread-safe)
# ---------------------------------------------------------------------------
_cache_lock = threading.Lock()
_ACTIVE_GEMINI_MODEL: Optional[str] = None


def _get_active_model() -> Optional[str]:
    with _cache_lock:
        return _ACTIVE_GEMINI_MODEL


def _set_active_model(model: Optional[str]) -> None:
    with _cache_lock:
        global _ACTIVE_GEMINI_MODEL
        _ACTIVE_GEMINI_MODEL = model


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _load_keys() -> tuple[str, str]:
    """Return (gemini_key, mistral_key) freshly read from env."""
    for _p in reversed(_ENV_PATHS):
        if _p.exists():
            load_dotenv(dotenv_path=_p, override=True)
    return (
        os.getenv("GEMINI_API_KEY", "").strip(),
        os.getenv("MISTRAL_API_KEY", "").strip(),
    )


def _gemini_url(model: str, api_key: str) -> str:
    return f"{_GEMINI_BASE}/{model}:generateContent?key={api_key}"


def _gemini_payload(
    system_instruction: str,
    user_prompt: str,
    history: Optional[List[dict]],
    temperature: float,
    max_tokens: int,
    json_mode: bool,
) -> bytes:
    contents = []
    if history:
        for item in history[-10:]:
            role = "user" if item.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": item.get("text", "")}]})
    contents.append({"role": "user", "parts": [{"text": user_prompt}]})

    gen_cfg: dict = {"temperature": temperature, "maxOutputTokens": max_tokens}
    if json_mode:
        gen_cfg["responseMimeType"] = "application/json"

    body: dict = {"contents": contents, "generationConfig": gen_cfg}
    if system_instruction:
        body["systemInstruction"] = {"parts": [{"text": system_instruction}]}

    return json.dumps(body).encode("utf-8")


def _extract_gemini_text(response_bytes: bytes) -> str:
    data = json.loads(response_bytes.decode("utf-8"))
    return data["candidates"][0]["content"]["parts"][0]["text"].strip()


def _try_gemini(model: str, api_key: str, body: bytes, timeout: int) -> str:
    """Attempt one Gemini model with timing and clean error parsing."""
    url = _gemini_url(model, api_key)
    req = urllib_request.Request(
        url, data=body, headers={"Content-Type": "application/json"}, method="POST"
    )
    with urllib_request.urlopen(req, timeout=timeout) as resp:
        return _extract_gemini_text(resp.read())


def _try_mistral(
    mistral_key: str,
    system_instruction: str,
    user_prompt: str,
    history: Optional[List[dict]],
    temperature: float,
    max_tokens: int,
    json_mode: bool,
    timeout: int,
) -> str:
    messages = []
    if system_instruction:
        messages.append({"role": "system", "content": system_instruction})
    if history:
        for item in history[-10:]:
            role = "user" if item.get("role") == "user" else "assistant"
            messages.append({"role": role, "content": item.get("text", "")})
    messages.append({"role": "user", "content": user_prompt})

    payload: dict = {
        "model": "mistral-small-latest",
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if json_mode:
        payload["response_format"] = {"type": "json_object"}

    body = json.dumps(payload).encode("utf-8")
    req = urllib_request.Request(
        _MISTRAL_URL,
        data=body,
        headers={
            "Authorization": f"Bearer {mistral_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urllib_request.urlopen(req, timeout=timeout) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        return data["choices"][0]["message"]["content"].strip()


# ---------------------------------------------------------------------------
# Public API — the single function every agent imports
# ---------------------------------------------------------------------------
def call_llm(
    *,
    system_instruction: str = "",
    user_prompt: str,
    history: Optional[List[dict]] = None,
    temperature: float = 0.4,
    max_tokens: int = 4096,
    json_mode: bool = False,
    timeout: int = _DEFAULT_TIMEOUT,
) -> str:
    """
    Call Gemini (with automatic candidate fallback) → Mistral fallback.
    Outputs clear live progress and error diagnostics to terminal stderr.
    """
    gemini_key, mistral_key = _load_keys()

    if not gemini_key and not mistral_key:
        _log_terminal("❌ ERROR: Neither GEMINI_API_KEY nor MISTRAL_API_KEY was found in .env!")
        raise RuntimeError("Missing API keys in .env")

    body = _gemini_payload(
        system_instruction, user_prompt, history, temperature, max_tokens, json_mode
    )

    # ── 1. Try cached working model first (happy path) ────────────────────
    cached = _get_active_model()
    if gemini_key and cached:
        _log_terminal(f"🚀 Calling cached Gemini model '{cached}'...")
        t0 = time.time()
        try:
            result = _try_gemini(cached, gemini_key, body, timeout)
            elapsed = round(time.time() - t0, 2)
            _log_terminal(f"✅ Gemini model '{cached}' succeeded in {elapsed}s")
            return result
        except urllib_error.HTTPError as e:
            err_msg = _parse_http_error(e)
            _log_terminal(f"❌ Cached model '{cached}' failed (HTTP {e.code}): {err_msg}")
            if e.code in (404, 410):
                _set_active_model(None)
            elif e.code == 429:
                _log_terminal("⚠️ Gemini quota / rate-limited (HTTP 429) — switching to Mistral")
                gemini_key = ""  # skip remaining Gemini candidates
            else:
                _set_active_model(None)
        except Exception as exc:
            _log_terminal(f"⚠️ Cached model '{cached}' network error ({type(exc).__name__}): {exc}")
            _set_active_model(None)

    # ── 2. Waterfall over candidate models ────────────────────────────────
    if gemini_key:
        for model in _GEMINI_CANDIDATES:
            if model == cached:
                continue  # already tried above
            _log_terminal(f"🔍 Probing Gemini model '{model}'...")
            t0 = time.time()
            try:
                result = _try_gemini(model, gemini_key, body, timeout)
                elapsed = round(time.time() - t0, 2)
                _set_active_model(model)
                _log_terminal(f"✅ Gemini model '{model}' locked in & succeeded in {elapsed}s")
                return result
            except urllib_error.HTTPError as e:
                err_msg = _parse_http_error(e)
                _log_terminal(f"❌ Gemini model '{model}' failed (HTTP {e.code}): {err_msg}")
                if e.code == 429:
                    _log_terminal(f"⚠️ Gemini rate-limited on '{model}' — skipping to Mistral")
                    break
            except Exception as exc:
                _log_terminal(f"⚠️ Gemini model '{model}' failed ({type(exc).__name__}): {exc}")

    # ── 3. Mistral fallback ───────────────────────────────────────────────
    if mistral_key:
        _log_terminal("🔄 All Gemini candidates failed. Attempting Mistral fallback (mistral-small-latest)...")
        t0 = time.time()
        try:
            result = _try_mistral(
                mistral_key, system_instruction, user_prompt,
                history, temperature, max_tokens, json_mode, timeout,
            )
            elapsed = round(time.time() - t0, 2)
            _log_terminal(f"✅ Mistral fallback succeeded in {elapsed}s")
            return result
        except urllib_error.HTTPError as e:
            err_msg = _parse_http_error(e)
            _log_terminal(f"❌ Mistral API failed (HTTP {e.code}): {err_msg}")
        except Exception as exc:
            _log_terminal(f"❌ Mistral API failed ({type(exc).__name__}): {exc}")
    else:
        _log_terminal("⚠️ MISTRAL_API_KEY is not configured in .env (cannot attempt fallback)")

    _log_terminal("💥 FATAL: All AI providers failed. Check your API keys and quotas.")
    raise RuntimeError(
        "llm_gateway: No LLM provider succeeded. "
        "Check GEMINI_API_KEY / MISTRAL_API_KEY in your .env."
    )
