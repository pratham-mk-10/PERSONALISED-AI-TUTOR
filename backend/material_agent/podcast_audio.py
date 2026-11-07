"""
podcast_audio.py — NotebookLM-Style Dual-Host Podcast Audio Synthesis Engine.

Provides multi-voice neural synthesis and turn-boundary synchronization for the
AI Slide Show system using Microsoft Edge Neural Voices.

Voices (Curated Indian English Default Duo):
  - Host 1 (Dr. Sarah - Lead Instructor): en-IN-NeerjaNeural (authoritative, clear, pedagogical)
  - Host 2 (Alex - Inquisitive Student Co-Host): en-IN-PrabhatNeural (warm, curious, dynamic)
"""

import asyncio
import hashlib
import json
import os
import re
from typing import Any, Dict, List, Optional, Tuple

# Pre-configured default Indian English duo (no UI settings needed)
HOST_1_VOICE = "en-IN-NeerjaNeural"   # Dr. Sarah
HOST_2_VOICE = "en-IN-PrabhatNeural"  # Alex

CACHE_DIR = os.path.join(os.path.dirname(__file__), "..", "cache", "podcast")
os.makedirs(CACHE_DIR, exist_ok=True)


def _clean_phonetics(text: str) -> str:
    """Fix common mathematical and physics pronunciation quirks in neural TTS."""
    t = text
    t = re.sub(r"\bangles\b", "an-gles", t, flags=re.IGNORECASE)
    t = re.sub(r"\bsin\b", "sine", t, flags=re.IGNORECASE)
    t = re.sub(r"\bcos\b", "cosine", t, flags=re.IGNORECASE)
    t = re.sub(r"\btan\b", "tangent", t, flags=re.IGNORECASE)
    t = re.sub(r"\b(\d+)\s*\^\s*2\b", r"\1 squared", t)
    t = re.sub(r"\b(\d+)\s*\^\s*3\b", r"\1 cubed", t)
    t = re.sub(r"\\frac\{([^}]+)\}\{([^}]+)\}", r"\1 divided by \2", t)
    return t


def ensure_slide_dialogue(slide: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Ensures that a slide has a rich 2-host conversational dialogue.
    If the slide has pre-computed `podcast_dialogue`, returns it.
    Otherwise, synthesizes a dynamic 2-host dialogue from its narration_script,
    title, bullets, and key_takeaway.
    """
    raw_dialogue = slide.get("podcast_dialogue")
    if raw_dialogue and isinstance(raw_dialogue, list) and len(raw_dialogue) >= 2:
        return [
            t.model_dump() if hasattr(t, "model_dump") else (t if isinstance(t, dict) else dict(t))
            for t in raw_dialogue
        ]

    title = slide.get("title", "this concept")
    narration = slide.get("narration_script", "")
    takeaway = slide.get("key_takeaway", "")
    formula = slide.get("formula", "")
    bullets = slide.get("bullets", [])

    turn_1_text = (
        f"Welcome to {title}. {narration}"
        if narration
        else f"In this slide on {title}, we examine the fundamental physics principles."
    )

    if formula:
        turn_2_text = (
            f"Dr. Sarah, looking at the formula {formula}, what's the key thing students usually trip over here?"
        )
    elif bullets and len(bullets) > 0:
        first_bullet = bullets[0]
        turn_2_text = (
            f"Dr. Sarah, what's the intuition behind this: {first_bullet}?"
        )
    else:
        turn_2_text = (
            f"So Dr. Sarah, what should students focus on most when reviewing {title}?"
        )

    turn_3_text = (
        f"Great question, Alex. The big takeaway is: {takeaway}"
        if takeaway
        else f"The main thing to remember is to stay disciplined with your definitions and sign conventions."
    )

    return [
        {
            "speaker": "host_1",
            "speaker_name": "Dr. Sarah",
            "text": turn_1_text,
        },
        {
            "speaker": "host_2",
            "speaker_name": "Alex",
            "text": turn_2_text,
        },
        {
            "speaker": "host_1",
            "speaker_name": "Dr. Sarah",
            "text": turn_3_text,
        },
    ]


async def _synthesize_single_turn(
    text: str, voice: str
) -> Tuple[bytes, float]:
    """
    Synthesize speech for a single dialogue turn using edge_tts.
    Returns (audio_bytes, duration_in_seconds).
    """
    import edge_tts

    tts_text = _clean_phonetics(text)
    communicate = edge_tts.Communicate(tts_text, voice)
    audio_data = bytearray()
    max_duration = 0.0

    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            audio_data.extend(chunk["data"])
        elif chunk["type"] == "SentenceBoundary":
            end_sec = (chunk["offset"] + chunk["duration"]) / 10_000_000
            if end_sec > max_duration:
                max_duration = end_sec

    # Fallback duration estimation if sentence boundary wasn't emitted
    if max_duration <= 0.1:
        word_count = len(text.split())
        max_duration = max(1.5, word_count / 2.6)

    return bytes(audio_data), max_duration


async def get_or_create_podcast_audio(
    dialogue: List[Dict[str, Any]],
    cache_prefix: str = "slide",
) -> Tuple[bytes, Dict[str, Any]]:
    """
    Generates or retrieves cached dual-host podcast audio for the given dialogue turns.
    Returns (audio_bytes, metadata_dict) where metadata_dict contains:
      - total_duration: float
      - turn_boundaries: list of { speaker, speaker_name, text, start_sec, end_sec }
    """
    # Build cache key from dialogue text and voices
    cache_payload = {
        "host_1": HOST_1_VOICE,
        "host_2": HOST_2_VOICE,
        "dialogue": dialogue,
    }
    hash_str = hashlib.sha256(
        json.dumps(cache_payload, sort_keys=True).encode("utf-8")
    ).hexdigest()[:24]

    mp3_path = os.path.join(CACHE_DIR, f"{cache_prefix}_{hash_str}.mp3")
    meta_path = os.path.join(CACHE_DIR, f"{cache_prefix}_{hash_str}.json")

    # Return cached artifacts if present
    if os.path.exists(mp3_path) and os.path.exists(meta_path):
        try:
            with open(mp3_path, "rb") as f:
                audio_bytes = f.read()
            with open(meta_path, "r", encoding="utf-8") as f:
                metadata = json.load(f)
            return audio_bytes, metadata
        except Exception:
            # If reading cache fails, proceed to regenerate
            pass

    # Synthesize each turn sequentially
    combined_audio = bytearray()
    turn_boundaries = []
    current_time = 0.0

    for turn in dialogue:
        speaker = turn.get("speaker", "host_1")
        speaker_name = turn.get("speaker_name", "Dr. Sarah" if speaker == "host_1" else "Alex")
        text = turn.get("text", "")
        if not text.strip():
            continue

        voice = HOST_1_VOICE if speaker == "host_1" else HOST_2_VOICE
        turn_bytes, turn_duration = await _synthesize_single_turn(text, voice)

        combined_audio.extend(turn_bytes)

        turn_boundaries.append({
            "speaker": speaker,
            "speaker_name": speaker_name,
            "text": text,
            "start_sec": round(current_time, 2),
            "end_sec": round(current_time + turn_duration, 2),
            "duration_sec": round(turn_duration, 2),
        })

        current_time += turn_duration

    metadata = {
        "total_duration": round(current_time, 2),
        "turn_boundaries": turn_boundaries,
        "host_1_voice": HOST_1_VOICE,
        "host_2_voice": HOST_2_VOICE,
        "host_1_name": "Dr. Sarah",
        "host_2_name": "Alex",
        "turns_count": len(turn_boundaries),
    }

    # Save to disk cache asynchronously / safely
    try:
        with open(mp3_path, "wb") as f:
            f.write(combined_audio)
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)
    except Exception as e:
        print(f"[PodcastAudio] Warning: failed to write cache files: {e}")

    return bytes(combined_audio), metadata

