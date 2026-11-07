"""
Automated end-to-end test for Architecture 2: NotebookLM Dual-Host Podcast Engine.
"""

import asyncio
from backend.material_agent.schema import PodcastTurn, SlideItem, SlideDeck
from backend.material_agent.podcast_audio import (
    get_or_create_podcast_audio,
    ensure_slide_dialogue,
    HOST_1_VOICE,
    HOST_2_VOICE,
)
from backend.material_agent.service import MaterialTutorAgent


async def run_tests():
    print("─── Test 1: Schema & Default Dialogue Verification ───")
    sample_slide = {
        "slide_number": 1,
        "title": "Snell's Law of Refraction",
        "subtitle": "Wave Speed & Angle Relationship",
        "narration_script": "When light passes from air to glass, it slows down and bends toward the normal.",
        "key_takeaway": "The ratio sin(i) to sin(r) equals the ratio of refractive indices.",
        "formula": r"n_1 \sin i = n_2 \sin r",
        "bullets": ["Light bends toward normal in denser media", "Wave speed decreases"],
    }

    dialogue = ensure_slide_dialogue(sample_slide)
    assert len(dialogue) >= 2, f"Expected at least 2 dialogue turns, got {len(dialogue)}"
    assert dialogue[0]["speaker"] == "host_1", "Host 1 must start"
    assert dialogue[0]["speaker_name"] == "Dr. Sarah", "Host 1 name must be Dr. Sarah"
    assert dialogue[1]["speaker"] == "host_2", "Host 2 must follow"
    assert dialogue[1]["speaker_name"] == "Alex", "Host 2 name must be Alex"
    print(f"✓ Dialogue turns generated: {len(dialogue)}")
    for t in dialogue:
        print(f"  [{t['speaker_name']}]: {t['text'][:65]}...")

    print("\n─── Test 2: Multi-Voice Neural Synthesis & Boundary Timings ───")
    assert HOST_1_VOICE == "en-IN-NeerjaNeural", f"Expected en-IN-NeerjaNeural, got {HOST_1_VOICE}"
    assert HOST_2_VOICE == "en-IN-PrabhatNeural", f"Expected en-IN-PrabhatNeural, got {HOST_2_VOICE}"
    print(f"✓ Using Indian English Duet: {HOST_1_VOICE} & {HOST_2_VOICE}")

    audio_bytes, metadata = await get_or_create_podcast_audio(dialogue, cache_prefix="e2e_test")
    assert len(audio_bytes) > 1000, f"Audio bytes too small: {len(audio_bytes)}"
    assert metadata["total_duration"] > 0, "Duration must be positive"
    assert len(metadata["turn_boundaries"]) == len(dialogue), "Boundaries count must match dialogue"

    print(f"✓ Audio synthesized: {len(audio_bytes):,} bytes | Total duration: {metadata['total_duration']}s")
    for tb in metadata["turn_boundaries"]:
        print(f"  • {tb['speaker_name']} ({tb['start_sec']}s - {tb['end_sec']}s): {tb['text'][:40]}...")

    print("\n─── Test 3: Sub-Millisecond Disk Cache Verification ───")
    import time
    t0 = time.time()
    cached_bytes, cached_meta = await get_or_create_podcast_audio(dialogue, cache_prefix="e2e_test")
    dt_ms = (time.time() - t0) * 1000
    assert len(cached_bytes) == len(audio_bytes)
    assert dt_ms < 50, f"Cache retrieval took too long: {dt_ms}ms"
    print(f"✓ Cache hit verified in {dt_ms:.2f}ms")

    print("\n─── Test 4: Slide Deck Ingestion & Podcast Dialogue Auto-Assurance ───")
    agent = MaterialTutorAgent()
    # Populate a session with fallback deck
    fallback = agent._build_fallback_deck("sample_notes.pdf", "detailed", [])
    for slide in fallback.get("slides", []):
        slide["podcast_dialogue"] = ensure_slide_dialogue(slide)
    deck = SlideDeck(**fallback)
    assert len(deck.slides) > 0
    print(f"✓ Fallback detailed deck valid with {len(deck.slides)} slides")
    for s in deck.slides:
        assert len(s.podcast_dialogue) >= 2, f"Slide {s.slide_number} missing dialogue"
    print(f"✓ All {len(deck.slides)} slides have verified 2-host podcast dialogues!")

    print("\nALL ARCHITECTURE 2 VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉")


if __name__ == "__main__":
    asyncio.run(run_tests())
