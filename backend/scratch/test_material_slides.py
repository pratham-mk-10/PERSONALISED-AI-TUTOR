import io
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_dir))

from material_agent import DocumentParser, MaterialTutorAgent, SessionMaterialCache
from material_agent.adapter import BaseLLMAdapter
from material_agent.schema import SlideDeck, SlideItem, VisualWidget
from fastapi.testclient import TestClient
from orchestrator.server import app


class MockSlideLLMAdapter(BaseLLMAdapter):
    """Mock adapter returning valid JSON conforming to SlideDeck schema."""

    def generate(self, system_instruction: str, user_prompt: str, history=None) -> str:
        return """{
            "deck_title": "Laws of Reflection and Spherical Mirrors",
            "mode": "quick",
            "source_filename": "optics_notes.txt",
            "total_slides": 2,
            "estimated_read_time": "2 min",
            "slides": [
                {
                    "slide_number": 1,
                    "title": "First Law of Reflection",
                    "subtitle": "Fundamental Angular Relationship",
                    "layout_type": "formula_spotlight",
                    "accent_badge": "Core Law",
                    "bullets": [
                        "The angle of incidence (i) is always equal to the angle of reflection (r).",
                        "Angles must strictly be measured between the ray and the normal line, not the mirror surface.",
                        "Holds true for all types of reflecting surfaces, including spherical mirrors."
                    ],
                    "formula": "\\\\angle i = \\\\angle r",
                    "key_takeaway": "Angle of incidence always equals angle of reflection relative to the normal.",
                    "visual_widget": {
                        "widget_type": "svg_physics",
                        "component_key": "first_law_reflection",
                        "caption": "Interactive ray reflection demonstrating angle i = angle r"
                    },
                    "narration_script": "The First Law of Reflection states that the angle of incidence equals the angle of reflection. Remember to measure both angles from the perpendicular normal line.",
                    "estimated_duration_sec": 20
                },
                {
                    "slide_number": 2,
                    "title": "Concave Mirror Focus",
                    "subtitle": "Convergence of Parallel Rays",
                    "layout_type": "physics_visual",
                    "accent_badge": "Ray Rule",
                    "bullets": [
                        "Rays parallel to principal axis converge at principal focus F.",
                        "Focal length f equals half the radius of curvature: f = R / 2.",
                        "Concave mirrors can produce both real and virtual images depending on object distance."
                    ],
                    "formula": "f = \\\\frac{R}{2}",
                    "key_takeaway": "Parallel incident rays pass through the principal focus after reflection.",
                    "visual_widget": {
                        "widget_type": "svg_physics",
                        "component_key": "spherical_mirror_formation",
                        "caption": "Concave mirror focusing incoming parallel rays onto focal point F"
                    },
                    "narration_script": "For a concave mirror, incoming rays parallel to the principal axis always reflect through the focal point F. The focal length is exactly half of the radius of curvature.",
                    "estimated_duration_sec": 25
                }
            ]
        }"""


def test_schema_and_agent_slides():
    print("--- 1. Testing SlideDeck Pydantic Models ---")
    widget = VisualWidget(
        widget_type="svg_physics",
        component_key="first_law_reflection",
        caption="Sample demonstration",
    )
    slide = SlideItem(
        slide_number=1,
        title="Test Slide",
        subtitle="Test Subtitle",
        layout_type="formula_spotlight",
        accent_badge="Test Law",
        bullets=["Point 1", "Point 2"],
        formula="i = r",
        key_takeaway="Angles are equal",
        visual_widget=widget,
        narration_script="Spoken script for test slide.",
        estimated_duration_sec=20,
    )
    deck = SlideDeck(
        deck_title="Test Deck",
        mode="quick",
        source_filename="test.txt",
        total_slides=1,
        estimated_read_time="1 min",
        slides=[slide],
    )
    dumped = deck.model_dump()
    assert dumped["deck_title"] == "Test Deck"
    assert dumped["slides"][0]["visual_widget"]["component_key"] == "first_law_reflection"
    print("   ✓ Pydantic schemas serialize and validate cleanly.")

    print("\n--- 2. Testing MaterialTutorAgent.generate_slide_deck with Mock Adapter ---")
    cache = SessionMaterialCache()
    sample_text = "Light reflection laws: angle i = angle r. Concave mirror focuses rays at F."
    cache.store_material(
        session_id="test_student_slides",
        material_id="mat_101",
        filename="optics_notes.txt",
        file_type="text/plain",
        text_content=sample_text,
        page_count=1,
    )

    agent = MaterialTutorAgent(cache=cache, adapter=MockSlideLLMAdapter())

    # Test generation
    res = agent.generate_slide_deck(session_id="test_student_slides", mode="quick")
    assert res["status"] != "need_materials" if "status" in res else True
    assert res["deck_title"] == "Laws of Reflection and Spherical Mirrors"
    assert len(res["slides"]) == 2
    assert res["slides"][0]["visual_widget"]["component_key"] == "first_law_reflection"
    assert res["slides"][0]["narration_script"] != ""

    cached_deck = cache.get_slide_deck("test_student_slides")
    assert cached_deck is not None
    assert cached_deck["deck_title"] == res["deck_title"]
    print("   ✓ MaterialTutorAgent generated and cached slide deck successfully.")

    # Test zero-token guard on empty session
    empty_res = agent.generate_slide_deck(session_id="empty_session", mode="quick")
    assert empty_res.get("status") == "need_materials"
    print("   ✓ Zero-token gate verified for empty session slide request.")


def test_routes_slides():
    print("\n--- 3. Testing FastAPI Endpoints for Slides ---")
    client = TestClient(app)

    # Upload material first
    upload_file = ("notes_sample.txt", io.BytesIO(b"Optics: Reflection laws. Angle of incidence equals angle of reflection."), "text/plain")
    upload_resp = client.post(
        "/api/material/upload",
        files={"file": upload_file},
        data={"session_id": "test_route_session"},
    )
    assert upload_resp.status_code == 200

    # Inject mock into app's material_tutor_agent for offline test speed
    from orchestrator.routes import material_tutor_agent
    material_tutor_agent.adapter = MockSlideLLMAdapter()

    # Call /api/material/slides/generate
    gen_resp = client.post(
        "/api/material/slides/generate",
        json={"session_id": "test_route_session", "mode": "quick"},
    )
    assert gen_resp.status_code == 200, f"Generate slides failed: {gen_resp.text}"
    deck_data = gen_resp.json()
    assert deck_data["deck_title"] == "Laws of Reflection and Spherical Mirrors"
    assert len(deck_data["slides"]) == 2
    print(f"   ✓ POST /api/material/slides/generate returned {len(deck_data['slides'])} slides.")

    # Call GET /api/material/{session_id}/slides
    get_resp = client.get("/api/material/test_route_session/slides")
    assert get_resp.status_code == 200
    assert get_resp.json()["deck_title"] == deck_data["deck_title"]
    print("   ✓ GET /api/material/{session_id}/slides returned cached deck.")

    print("\nALL BACKEND SLIDE TESTS PASSED!")


if __name__ == "__main__":
    test_schema_and_agent_slides()
    test_routes_slides()

