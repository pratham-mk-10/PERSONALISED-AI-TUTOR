import json
import re
import time
import uuid
from typing import Callable, Dict, List, Optional

from .adapter import BaseLLMAdapter, ResilientLLMAdapter
from .cache import SessionMaterialCache
from .parser import DocumentParser
from .schema import SlideDeck, SlideItem, VisualWidget


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
        self.register_hook("generate_slides", self._hook_generate_slides)

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

    def _hook_generate_slides(self, session_id: str, mode: str = "quick", **kwargs) -> dict:
        return self.generate_slide_deck(session_id, mode=mode)

    def generate_slide_deck(
        self,
        session_id: str,
        mode: str = "quick",
        material_ids: Optional[List[str]] = None,
    ) -> dict:
        """
        Generates a structured, pedagogical NotebookLM-style Slide Show Deck
        from student-uploaded materials, with physics simulation associations
        and narration scripts prepped for audio voiceover.
        """
        # Retrieve relevant materials
        if material_ids:
            records = [
                self.cache.get_material(mid)
                for mid in material_ids
                if self.cache.get_material(mid) is not None
            ]
        else:
            records = self.cache.get_session_materials(session_id)

        # Zero-token gate: require materials before generating slide deck
        if not records:
            return {
                "error": "Please add the necessary materials so I can create a slide show for you.",
                "status": "need_materials",
            }

        # Build material context
        context_parts = []
        for rec in records:
            context_parts.append(
                f"=== Study Material: {rec.filename} ({rec.page_count} pages) ===\n{rec.text_content}\n"
            )
        merged_context = "\n\n".join(context_parts)
        primary_filename = records[0].filename if records else "uploaded_notes"

        mode_clean = "detailed" if str(mode).lower() == "detailed" else "quick"

        if mode_clean == "quick":
            mode_instruction = (
                "MODE: QUICK OVERVIEW DECK.\n"
                "- Create a high-impact, conceptual synthesis covering the fundamental laws, core definitions, and primary equations.\n"
                "- The goal is fast, effective revision without filler.\n"
                "- CRITICAL RULE FOR QUICK MODE: DO NOT attach or check for SVG physics simulations or animated video components. "
                "Set 'visual_widget': null or use simple 'formula_card'/'concept_card' text elements only. No video, no animation components, and no interactive simulation widgets.\n"
                "- Choose the exact number of slides needed to clearly cover the core concepts (typically 4 to 6 slides)."
            )
        else:
            mode_instruction = (
                "MODE: DETAILED BREAKDOWN DECK.\n"
                "- CRITICAL FULL COVERAGE REQUIREMENT: You MUST scan the ENTIRE uploaded material from start to finish. "
                "Identify all distinct major sections/chapters (e.g. Reflection, Spherical Mirrors, Refraction, Lenses). "
                "Allocate slides proportionally across EVERY section (e.g. 2 to 3 slides per major section) so the entire document is thoroughly covered from beginning to end without skipping any topic or stopping after the first section.\n"
                "- Deliver an exhaustive, step-by-step breakdown across as many slides as necessary (typically 8 to 14+ slides).\n"
                "- Include specific ray tracing cases, sign conventions, calculation tips, and common misconception traps.\n"
                "- In this DETAILED mode, attach matching SVG physics simulations ('first_law_reflection', 'spherical_mirror_formation', 'glass_slab', 'snells_law', 'lens_formula') to relevant slides."
            )

        system_instruction = (
            "You are an expert Physics Curriculum Presentation Designer specializing in creating NotebookLM-style interactive slide decks.\n\n"
            f"{mode_instruction}\n\n"
            "CRITICAL SCHEMA & CONTENT INSTRUCTIONS:\n"
            "1. You must output ONLY a valid JSON object matching this schema with NO markdown wrapping, comments, or extra text.\n"
            "{\n"
            '  "deck_title": "Descriptive Deck Title",\n'
            f'  "mode": "{mode_clean}",\n'
            f'  "source_filename": "{primary_filename}",\n'
            '  "total_slides": 0,\n'
            '  "estimated_read_time": "X min",\n'
            '  "slides": [\n'
            '    {\n'
            '      "slide_number": 1,\n'
            '      "title": "Clear Slide Title",\n'
            '      "subtitle": "Optional Brief Subtitle",\n'
            '      "layout_type": "concept_breakdown" | "formula_spotlight" | "comparison" | "summary_checklist" | "physics_visual",\n'
            '      "accent_badge": "Category Badge (e.g. Core Law, Definition, Ray Rule)",\n'
            '      "bullets": ["Bullet 1", "Bullet 2", "Bullet 3"],\n'
            '      "formula": "LaTeX/text formula or null",\n'
            '      "key_takeaway": "Single high-impact takeaway sentence.",\n'
            '      "visual_widget": {\n'
            '        "widget_type": "svg_physics" | "formula_card" | "comparison_table" | "concept_card",\n'
            '        "component_key": "first_law_reflection" | "second_law_reflection" | "plane_mirror_basics" | "real_vs_virtual" | "spherical_mirror_formation" | "mirror_formula" | "sign_convention" | "glass_slab" | "snells_law" | "lens_formula" | "spherical_lenses" | null,\n'
            '        "caption": "Short caption explaining the visual demonstration"\n'
            '      },\n'
            '      "narration_script": "Conversational, natural 2-4 sentence voice script explaining this slide to a student.",\n'
            '      "estimated_duration_sec": 25,\n'
            '      "podcast_dialogue": [\n'
            '        {"speaker": "host_1", "speaker_name": "Dr. Sarah", "text": "Conversational introduction explaining the slide concept."},\n'
            '        {"speaker": "host_2", "speaker_name": "Alex", "text": "Inquisitive student question clarifying an intuitive doubt or formula."},\n'
            '        {"speaker": "host_1", "speaker_name": "Dr. Sarah", "text": "Crisp pedagogical takeaway and intuition."}\n'
            '      ]\n'
            '    }\n'
            '  ]\n'
            "}\n\n"
            "PHYSICS ENGINE COMPONENT MAPPING:\n"
            "Whenever a slide discusses any of the following topics, set 'component_key' to the corresponding key:\n"
            "- 'first_law_reflection': First Law of Reflection (angle of incidence = angle of reflection)\n"
            "- 'second_law_reflection': Second Law of Reflection (incident ray, normal, and reflected ray in same plane)\n"
            "- 'plane_mirror_basics': Plane mirror reflection, virtual image characteristics\n"
            "- 'real_vs_virtual': Differences between real and virtual images\n"
            "- 'spherical_mirror_formation': Concave/convex mirror ray tracing (object at C, F, infinity, etc.)\n"
            "- 'mirror_formula': Mirror formula 1/f = 1/v + 1/u and linear magnification\n"
            "- 'sign_convention': Cartesian sign convention for mirrors/lenses\n"
            "- 'glass_slab': Refraction through a rectangular glass slab, lateral shift\n"
            "- 'snells_law': Snell's Law of Refraction (sin i / sin r = constant)\n"
            "- 'spherical_lenses': Convex and concave lenses (converging vs diverging)\n"
            "- 'lens_formula': Lens formula 1/f = 1/v - 1/u and magnification\n"
            "If the concept does not match these, set component_key to null and set widget_type to 'formula_card', 'concept_card', or 'comparison_table'.\n\n"
            "NOTEBOOKLM 2-HOST PODCAST REQUIREMENT:\n"
            "Every slide MUST provide 'podcast_dialogue' with 2 to 3 natural conversational turns between 'Dr. Sarah' (lead instructor, 'host_1') and 'Alex' (curious student co-host, 'host_2'). Make the conversation warm, lively, and pedagogically crisp.\n\n"
            "VOICE READINESS REQUIREMENT:\n"
            "Every slide MUST provide a clear, engaging 'narration_script' that directly narrates the slide's visual content.\n"
        )

        user_prompt = (
            f"Here is the student's study material context:\n"
            f"{merged_context}\n\n"
            f"Create the {mode_clean.upper()} Slide Deck JSON now according to the instructions."
        )

        raw_response = self.adapter.generate(
            system_instruction=system_instruction,
            user_prompt=user_prompt,
            history=None,
        )

        deck_data = self._clean_and_parse_json(raw_response)

        # Fallback if parsing failed
        if not deck_data or "slides" not in deck_data or not deck_data["slides"]:
            deck_data = self._build_fallback_deck(primary_filename, mode_clean, records)

        # Ensure correct total count, timestamps, and podcast dialogues
        deck_data["total_slides"] = len(deck_data.get("slides", []))
        deck_data["source_filename"] = primary_filename
        deck_data["mode"] = mode_clean
        deck_data["created_at"] = time.time()

        # Guarantee rich 2-host podcast dialogue on every slide
        try:
            from backend.material_agent.podcast_audio import ensure_slide_dialogue
            for slide in deck_data.get("slides", []):
                slide["podcast_dialogue"] = ensure_slide_dialogue(slide)
        except Exception as p_err:
            print(f"[MaterialTutorAgent] Podcast dialogue assurance note: {p_err}")

        # Validate with Pydantic
        try:
            validated_deck = SlideDeck(**deck_data)
            output = validated_deck.model_dump()
        except Exception as exc:
            print(f"[MaterialTutorAgent] SlideDeck Pydantic validation error: {exc}")
            output = deck_data

        # Store in cache by session_id and mode
        self.cache.store_slide_deck(session_id, output, mode=mode_clean)
        return output

    @staticmethod
    def _clean_and_parse_json(raw_text: str) -> Optional[dict]:
        """Strips markdown code fences and parses JSON safely."""
        cleaned = raw_text.strip()
        # Remove ```json ... ``` wrapper if present
        if cleaned.startswith("```"):
            cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
            cleaned = re.sub(r"\s*```$", "", cleaned)
            cleaned = cleaned.strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError:
            # Try finding the outermost JSON object
            match = re.search(r"\{.*\}", cleaned, re.DOTALL)
            if match:
                try:
                    return json.loads(match.group(0))
                except json.JSONDecodeError:
                    pass
        return None

    @staticmethod
    def _build_fallback_deck(filename: str, mode: str, records: list) -> dict:
        """Constructs a clean baseline slide deck if LLM JSON was malformed or timed out."""
        sample_title = f"Study Notes: {filename.replace('_', ' ').replace('.txt', '').replace('.pdf', '').title()}"

        if mode == "quick":
            return {
                "deck_title": f"{sample_title} (Quick Overview)",
                "mode": "quick",
                "source_filename": filename,
                "total_slides": 3,
                "estimated_read_time": "2 min",
                "slides": [
                    {
                        "slide_number": 1,
                        "title": "Core Definitions & Principles",
                        "subtitle": f"High-yield summary from {filename}",
                        "layout_type": "concept_breakdown",
                        "accent_badge": "Key Concept",
                        "bullets": [
                            "Core laws of light propagation and boundary interactions.",
                            "Angles must always be measured relative to the perpendicular normal.",
                            "Standard Cartesian sign conventions apply across all optical calculations.",
                        ],
                        "formula": None,
                        "key_takeaway": "Foundational definitions govern all ray behavior in optics.",
                        "visual_widget": {
                            "widget_type": "concept_card",
                            "component_key": None,
                            "caption": "Foundational optics definitions",
                        },
                        "narration_script": "This quick overview highlights the governing principles and definitions from your study notes. Focus on how rays interact at boundaries.",
                        "estimated_duration_sec": 20,
                    },
                    {
                        "slide_number": 2,
                        "title": "Governing Mathematical Laws",
                        "subtitle": "Essential equations to memorize",
                        "layout_type": "formula_spotlight",
                        "accent_badge": "Formulas",
                        "bullets": [
                            "Law of Reflection: Angle of incidence equals angle of reflection (∠i = ∠r).",
                            "Snell's Law: n₁ sin(i) = n₂ sin(r) across media boundaries.",
                            "Mirror and lens formulas correlate object distance, image distance, and focal length.",
                        ],
                        "formula": r"\angle i = \angle r \quad \text{and} \quad n_1 \sin i = n_2 \sin r",
                        "key_takeaway": "Angles and refractive indices determine light trajectory.",
                        "visual_widget": {
                            "widget_type": "formula_card",
                            "component_key": None,
                            "caption": "Summary of primary mathematical laws",
                        },
                        "narration_script": "Here are the two core equations you need for problems: the law of reflection and Snell's law of refraction.",
                        "estimated_duration_sec": 25,
                    },
                    {
                        "slide_number": 3,
                        "title": "Rapid Revision Checklist",
                        "subtitle": "Final takeaways for exams",
                        "layout_type": "summary_checklist",
                        "accent_badge": "Review",
                        "bullets": [
                            "Real images are inverted and form on the actual ray convergence side.",
                            "Virtual images are erect and form where rays appear to diverge.",
                            "Denser medium slows light down, bending it toward the normal.",
                        ],
                        "formula": None,
                        "key_takeaway": "Check optical medium density and ray convergence for every problem.",
                        "visual_widget": {
                            "widget_type": "concept_card",
                            "component_key": None,
                            "caption": "Summary checklist",
                        },
                        "narration_script": "Before tackling practice questions, ensure you are comfortable classifying images as real versus virtual.",
                        "estimated_duration_sec": 20,
                    },
                ],
            }

        # Detailed breakdown fallback covering multiple topics across the syllabus
        return {
            "deck_title": f"{sample_title} (Comprehensive Breakdown)",
            "mode": "detailed",
            "source_filename": filename,
            "total_slides": 5,
            "estimated_read_time": "5 min",
            "slides": [
                {
                    "slide_number": 1,
                    "title": "Topic 1: Laws of Reflection",
                    "subtitle": "Planar Geometry & Normal Line",
                    "layout_type": "physics_visual",
                    "accent_badge": "Reflection Law",
                    "bullets": [
                        "Angle of incidence (i) strictly equals angle of reflection (r).",
                        "Incident ray, reflected ray, and the normal at the point of incidence all lie in the same plane.",
                        "Both angles must be measured from the normal, not the reflecting surface.",
                    ],
                    "formula": r"\angle i = \angle r",
                    "key_takeaway": "Reflection is completely symmetrical with respect to the perpendicular normal.",
                    "visual_widget": {
                        "widget_type": "svg_physics",
                        "component_key": "first_law_reflection",
                        "caption": "Interactive simulation demonstrating angle of incidence equaling angle of reflection.",
                    },
                    "narration_script": "We begin with the First Law of Reflection. Notice how the normal line divides the incident and reflected rays into two strictly identical angles.",
                    "estimated_duration_sec": 25,
                },
                {
                    "slide_number": 2,
                    "title": "Topic 2: Spherical Mirrors & Ray Tracing",
                    "subtitle": "Concave vs Convex Focus",
                    "layout_type": "physics_visual",
                    "accent_badge": "Spherical Mirrors",
                    "bullets": [
                        "Rays parallel to the principal axis converge at principal focus F for concave mirrors.",
                        "Focal length is exactly half of the radius of curvature: f = R / 2.",
                        "Rays passing through the center of curvature reflect back along the same path.",
                    ],
                    "formula": r"f = \frac{R}{2}",
                    "key_takeaway": "Concave mirrors converge parallel rays; convex mirrors diverge them.",
                    "visual_widget": {
                        "widget_type": "svg_physics",
                        "component_key": "spherical_mirror_formation",
                        "caption": "Ray tracing diagram showing parallel rays converging at focus F.",
                    },
                    "narration_script": "Next, examine spherical mirrors. Incoming rays parallel to the principal axis reflect directly through the focal point F.",
                    "estimated_duration_sec": 28,
                },
                {
                    "slide_number": 3,
                    "title": "Topic 3: The Mirror Formula & Magnification",
                    "subtitle": "Quantitative Image Position Calculation",
                    "layout_type": "formula_spotlight",
                    "accent_badge": "Mirror Formula",
                    "bullets": [
                        "1/f = 1/v + 1/u correlates focal length, image distance, and object distance.",
                        "Linear magnification m = -v/u = h'/h.",
                        "Negative m denotes a real, inverted image; positive m denotes a virtual, erect image.",
                    ],
                    "formula": r"\frac{1}{f} = \frac{1}{v} + \frac{1}{u}, \quad m = -\frac{v}{u}",
                    "key_takeaway": "Always insert Cartesian sign conventions into the formula before solving for unknowns.",
                    "visual_widget": {
                        "widget_type": "svg_physics",
                        "component_key": "mirror_formula",
                        "caption": "Mirror formula calculation guide.",
                    },
                    "narration_script": "The mirror formula allows you to calculate the precise distance of an image. Remember that object distance u is always negative in Cartesian convention.",
                    "estimated_duration_sec": 30,
                },
                {
                    "slide_number": 4,
                    "title": "Topic 4: Refraction & Glass Slab",
                    "subtitle": "Change in Wave Speed and Lateral Displacement",
                    "layout_type": "physics_visual",
                    "accent_badge": "Refraction",
                    "bullets": [
                        "Light bends toward the normal when traveling from a rarer to denser medium.",
                        "In a rectangular glass slab, the emergent ray is parallel to the incident ray but laterally displaced.",
                        "Lateral displacement increases with slab thickness and angle of incidence.",
                    ],
                    "formula": r"n_{21} = \frac{v_1}{v_2} = \frac{\sin i}{\sin r}",
                    "key_takeaway": "Refraction is caused by change in speed of light between media.",
                    "visual_widget": {
                        "widget_type": "svg_physics",
                        "component_key": "glass_slab",
                        "caption": "Refraction through glass slab showing lateral shift between incident and emergent rays.",
                    },
                    "narration_script": "Moving to refraction, notice how the ray bends toward the normal as it enters the dense glass slab, and bends away as it exits into air, creating lateral displacement.",
                    "estimated_duration_sec": 30,
                },
                {
                    "slide_number": 5,
                    "title": "Topic 5: Snell's Law & Spherical Lenses",
                    "subtitle": "Refractive Index & Lens Formula",
                    "layout_type": "physics_visual",
                    "accent_badge": "Lenses & Snell",
                    "bullets": [
                        "Snell's Law: The ratio of sin(i) to sin(r) is constant for a given pair of media.",
                        "Lens Formula: 1/f = 1/v - 1/u (note the minus sign contrasting mirror formula).",
                        "Lens magnification m = +v/u = h'/h.",
                    ],
                    "formula": r"n_1 \sin i = n_2 \sin r, \quad \frac{1}{f} = \frac{1}{v} - \frac{1}{u}",
                    "key_takeaway": "Snell's law governs refraction; lenses form images by refraction at two spherical surfaces.",
                    "visual_widget": {
                        "widget_type": "svg_physics",
                        "component_key": "snells_law",
                        "caption": "Snell's law refraction ray trace.",
                    },
                    "narration_script": "Finally, Snell's law provides the mathematical relationship for refraction, which directly underpins how convex and concave lenses focus light.",
                    "estimated_duration_sec": 32,
                },
            ],
        }

