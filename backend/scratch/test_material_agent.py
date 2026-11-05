import io
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_dir))

from material_agent import DocumentParser, MaterialTutorAgent, SessionMaterialCache
from material_agent.adapter import BaseLLMAdapter


class MockLLMAdapter(BaseLLMAdapter):
    """Mock adapter for fast offline testing."""

    def generate(self, system_instruction: str, user_prompt: str, history=None) -> str:
        assert "Concave mirror" in user_prompt or "Light" in user_prompt
        return "Based on Page 1 of your notes: A concave mirror converges parallel rays to the principal focus F."


def test_parser_and_cache():
    print("1. Testing DocumentParser...")
    sample_text = b"NCERT Physics Class 10 Chapter 10 Light.\nConcave mirror focal length f = R/2."
    text, pages = DocumentParser.parse("sample_notes.txt", sample_text, "text/plain")
    assert "Concave mirror" in text
    assert pages == 1
    print("   ✓ DocumentParser parsed text successfully.")

    print("2. Testing SessionMaterialCache...")
    cache = SessionMaterialCache()
    rec = cache.store_material(
        session_id="test_student_1",
        material_id="mat_001",
        filename="notes.txt",
        file_type="text/plain",
        text_content=text,
        page_count=1,
    )
    assert rec.material_id == "mat_001"
    fetched = cache.get_material("mat_001")
    assert fetched is not None
    assert fetched.filename == "notes.txt"
    session_list = cache.get_session_materials("test_student_1")
    assert len(session_list) == 1
    print("   ✓ SessionMaterialCache stored and retrieved record.")

    print("3. Testing MaterialTutorAgent with MockAdapter...")
    agent = MaterialTutorAgent(cache=cache, adapter=MockLLMAdapter())
    resp = agent.answer_query(
        session_id="test_student_1",
        student_query="Where does the concave mirror focus rays?",
        material_ids=["mat_001"],
    )
    assert "concave mirror converges" in resp["reply"].lower()
    assert "notes.txt" in resp["materials_referenced"]
    print("   ✓ MaterialTutorAgent generated contextual answer.")

    print("4. Testing deletion...")
    del_ok = cache.delete_material("test_student_1", "mat_001")
    assert del_ok is True
    assert len(cache.get_session_materials("test_student_1")) == 0
    print("   ✓ Deletion working cleanly.")

    print("5. Testing strict boundary when no materials are uploaded...")
    empty_resp = agent.answer_query(
        session_id="test_student_empty",
        student_query="Tell me about quantum physics",
    )
    assert "please add the necessary materials" in empty_resp["reply"].lower()
    print("   ✓ Correctly guarded with zero token cost.")

    print("\nALL BACKEND UNIT TESTS PASSED!")


if __name__ == "__main__":
    test_parser_and_cache()

