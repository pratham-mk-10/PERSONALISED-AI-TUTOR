import time
from dataclasses import dataclass, field
from threading import Lock
from typing import Dict, List, Optional


@dataclass
class MaterialRecord:
    material_id: str
    session_id: str
    filename: str
    file_type: str
    text_content: str
    page_count: int = 1
    raw_bytes: Optional[bytes] = None
    created_at: float = field(default_factory=time.time)
    last_accessed_at: float = field(default_factory=time.time)


class SessionMaterialCache:
    """Thread-safe, in-memory cache for uploaded materials and session history."""

    def __init__(self, default_ttl_seconds: int = 7200):
        self._materials: Dict[str, MaterialRecord] = {}
        # session_id -> list of material_ids
        self._session_index: Dict[str, List[str]] = {}
        # session_id -> list of {"role": "user"|"agent", "text": "..."}
        self._chat_history: Dict[str, List[dict]] = {}
        self._lock = Lock()
        self.default_ttl = default_ttl_seconds

    def store_material(
        self,
        session_id: str,
        material_id: str,
        filename: str,
        file_type: str,
        text_content: str,
        page_count: int = 1,
        raw_bytes: Optional[bytes] = None,
    ) -> MaterialRecord:
        with self._lock:
            self._cleanup_expired_locked()
            rec = MaterialRecord(
                material_id=material_id,
                session_id=session_id,
                filename=filename,
                file_type=file_type,
                text_content=text_content,
                page_count=page_count,
                raw_bytes=raw_bytes,
            )
            self._materials[material_id] = rec
            if session_id not in self._session_index:
                self._session_index[session_id] = []
            if material_id not in self._session_index[session_id]:
                self._session_index[session_id].append(material_id)
            return rec

    def get_material(self, material_id: str) -> Optional[MaterialRecord]:
        with self._lock:
            rec = self._materials.get(material_id)
            if rec:
                rec.last_accessed_at = time.time()
            return rec

    def get_session_materials(self, session_id: str) -> List[MaterialRecord]:
        with self._lock:
            self._cleanup_expired_locked()
            mids = self._session_index.get(session_id, [])
            now = time.time()
            results = []
            for mid in mids:
                rec = self._materials.get(mid)
                if rec:
                    rec.last_accessed_at = now
                    results.append(rec)
            return results

    def delete_material(self, session_id: str, material_id: str) -> bool:
        with self._lock:
            existed = False
            if material_id in self._materials:
                del self._materials[material_id]
                existed = True
            if session_id in self._session_index:
                self._session_index[session_id] = [
                    mid for mid in self._session_index[session_id] if mid != material_id
                ]
            return existed

    def record_chat(self, session_id: str, role: str, text: str):
        with self._lock:
            if session_id not in self._chat_history:
                self._chat_history[session_id] = []
            self._chat_history[session_id].append(
                {"role": role, "text": text, "ts": time.time()}
            )
            # Keep max 50 recent messages per session
            if len(self._chat_history[session_id]) > 50:
                self._chat_history[session_id] = self._chat_history[session_id][-50:]

    def get_chat_history(self, session_id: str) -> List[dict]:
        with self._lock:
            return list(self._chat_history.get(session_id, []))

    def _cleanup_expired_locked(self):
        now = time.time()
        expired_mids = [
            mid
            for mid, rec in self._materials.items()
            if (now - rec.last_accessed_at) > self.default_ttl
        ]
        for mid in expired_mids:
            rec = self._materials.pop(mid, None)
            if rec and rec.session_id in self._session_index:
                self._session_index[rec.session_id] = [
                    m for m in self._session_index[rec.session_id] if m != mid
                ]

