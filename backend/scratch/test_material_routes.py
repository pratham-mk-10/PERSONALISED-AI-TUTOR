import io
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from orchestrator.server import app

client = TestClient(app)


def test_routes():
    print("1. Testing root...")
    res = client.get("/")
    assert res.status_code == 200

    print("2. Testing /api/material/upload...")
    sample_pdf_content = b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\nxref\n0 1\n0000000000 65535 f \ntrailer\n<< /Size 1 >>\nstartxref\n9\n%%EOF"
    upload_file = ("optics_notes.txt", io.BytesIO(b"NCERT Chapter 10 Light Notes. Laws of Reflection: i = r. Incident ray, normal, and reflected ray lie in same plane."), "text/plain")
    
    resp = client.post(
        "/api/material/upload",
        files={"file": upload_file},
        data={"session_id": "test_session_42"},
    )
    assert resp.status_code == 200, f"Upload failed: {resp.text}"
    data = resp.json()
    assert data["status"] == "ready"
    assert "mat_" in data["material_id"]
    material_id = data["material_id"]
    print(f"   ✓ Upload successful: material_id={material_id}")

    print("3. Testing /api/material/{session_id}/list...")
    list_resp = client.get("/api/material/test_session_42/list")
    assert list_resp.status_code == 200
    list_data = list_resp.json()
    assert len(list_data["materials"]) == 1
    assert list_data["materials"][0]["filename"] == "optics_notes.txt"
    print(f"   ✓ Material listing confirmed: {list_data['materials'][0]['filename']}")

    print("4. Testing /api/material/chat endpoint...")
    chat_resp = client.post(
        "/api/material/chat",
        json={
            "session_id": "test_session_42",
            "message": "What is the relation between angle i and angle r according to my notes?",
            "material_ids": [material_id],
        },
    )
    assert chat_resp.status_code == 200, f"Chat failed: {chat_resp.text}"
    chat_data = chat_resp.json()
    assert "reply" in chat_data
    assert len(chat_data["reply"]) > 0
    print(f"   ✓ Chat response received ({len(chat_data['reply'])} chars):")
    print("     " + chat_data["reply"][:140] + "...")

    print("5. Testing /api/material/{session_id}/{material_id} deletion...")
    del_resp = client.delete(f"/api/material/test_session_42/{material_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["deleted"] is True
    print("   ✓ Deletion successful.")

    print("\nALL ROUTE INTEGRATION TESTS PASSED!")


if __name__ == "__main__":
    test_routes()

