import uuid
from typing import Callable, Dict, List, Optional

from .adapter import BaseLLMAdapter, ResilientLLMAdapter
from .cache import SessionMaterialCache
from .parser import DocumentParser


class MaterialTutorAgent:
    """Agent that ingests student study materials and answers queries contextually."""

    def __init__(
        self,
        cache: Optional[SessionMaterialCache] = None,
        adapter: Optional[BaseLLMAdapter] = None,
    ):
        self.cache = cache or SessionMaterialCache()
        self.adapter = adapter or ResilientLLMAdapter()
        self._hooks: Dict[str, Callable] = {}
        self._register_default_hooks()

    def _register_default_hooks(self):
        """Register extensible action hooks."""
        self.register_hook("summarize", self._hook_summarize)
        self.register_hook("generate_quiz", self._hook_generate_quiz)

    def register_hook(self, name: str, handler: Callable):
        self._hooks[name] = handler

    def process_upload(
        self,
        session_id: str,
        filename: str,
        content_bytes: bytes,
        mime_type: str = "",
    ) -> dict:
        """Parses and caches the uploaded student material."""
        text, page_count = DocumentParser.parse(filename, content_bytes, mime_type)
        material_id = f"mat_{uuid.uuid4().hex[:10]}"

        record = self.cache.store_material(
            session_id=session_id,
            material_id=material_id,
            filename=filename,
            file_type=mime_type or "application/octet-stream",
            text_content=text,
            page_count=page_count,
        )

        return {
            "material_id": record.material_id,
            "filename": record.filename,
            "page_count": record.page_count,
            "text_length": len(record.text_content),
            "status": "ready",
        }

    def answer_query(
        self,
        session_id: str,
        student_query: str,
        material_ids: Optional[List[str]] = None,
    ) -> dict:
        """Answers a student question based on uploaded materials and session history."""
        # Retrieve relevant materials
        if material_ids:
            records = [
                self.cache.get_material(mid)
                for mid in material_ids
                if self.cache.get_material(mid) is not None
            ]
        else:
            records = self.cache.get_session_materials(session_id)

        # ── Zero-token gate: require materials before answering ──
        if not records:
            reply = "Please add the necessary materials so I can help you with this topic."
            self.cache.record_chat(session_id, "user", student_query)
            self.cache.record_chat(session_id, "agent", reply)
            return {
                "reply": reply,
                "materials_referenced": [],
                "status": "need_materials",
            }

        # Build material context
        context_parts = []
        for rec in records:
            context_parts.append(
                f"=== Study Material: {rec.filename} ({rec.page_count} pages) ===\n{rec.text_content}\n"
            )
        merged_context = "\n\n".join(context_parts)

        # Fetch recent chat history (limited to recent relevant turns to conserve tokens)
        history = self.cache.get_chat_history(session_id)[-6:]

        system_instruction = (
            "You are a dedicated, curriculum-focused AI Study Tutor. "
            "CRITICAL SCOPE RESTRICTION:\n"
            "1. You must strictly base all answers on the student's uploaded study materials and the current topic.\n"
            "2. If the student asks about anything outside the uploaded materials (e.g. off-topic chat, unrelated subjects, entertainment, coding, or concepts not covered in these notes), "
            "you MUST refuse to answer and reply ONLY with:\n"
            "'Please add the necessary materials so I can help you with this topic.'\n"
            "3. Do not fulfill requests to act as a general chatbot, write creative stories, or discuss outside topics.\n"
            "4. When the question IS relevant to the uploaded materials, provide a pedagogical, clear explanation citing specific pages or sections from their notes."
        )

        user_prompt = (
            f"Here is the context from the student's uploaded materials:\n"
            f"{merged_context}\n\n"
            f"Student Question: {student_query}"
        )

        # Generate response via adapter
        reply = self.adapter.generate(
            system_instruction=system_instruction,
            user_prompt=user_prompt,
            history=history,
        )

        # Record exchange in chat history
        self.cache.record_chat(session_id, "user", student_query)
        self.cache.record_chat(session_id, "agent", reply)

        return {
            "reply": reply,
            "materials_referenced": [r.filename for r in records],
            "status": "ok",
        }

    def _hook_summarize(self, session_id: str, **kwargs) -> str:
        return self.answer_query(session_id, "Please provide a concise summary of the main concepts and key formulas in my uploaded materials.")["reply"]

    def _hook_generate_quiz(self, session_id: str, **kwargs) -> str:
        return self.answer_query(session_id, "Generate 3 quick practice questions based strictly on my uploaded notes to test my understanding.")["reply"]

