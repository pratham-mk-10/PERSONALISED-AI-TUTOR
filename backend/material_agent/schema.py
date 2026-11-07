from typing import List, Optional
from pydantic import BaseModel, Field


class VisualWidget(BaseModel):
    widget_type: str = Field(
        default="concept_card",
        description="Type of visual: 'svg_physics', 'formula_card', 'comparison_table', or 'concept_card'",
    )
    component_key: Optional[str] = Field(
        default=None,
        description=(
            "Key mapping to deterministic SVG simulation if applicable: "
            "'first_law_reflection', 'second_law_reflection', 'plane_mirror_basics', "
            "'real_vs_virtual', 'spherical_mirror_formation', 'mirror_formula', "
            "'sign_convention', 'glass_slab', 'snells_law', 'lens_formula', 'spherical_lenses', or None"
        ),
    )
    caption: Optional[str] = Field(
        default=None,
        description="Pedagogical caption describing the visual demonstration",
    )


class SlideItem(BaseModel):
    slide_number: int = Field(..., description="1-indexed sequence number of the slide")
    title: str = Field(..., description="Slide title")
    subtitle: Optional[str] = Field(default=None, description="Optional brief subtitle")
    layout_type: str = Field(
        default="concept_breakdown",
        description="Layout template: 'concept_breakdown', 'formula_spotlight', 'comparison', 'summary_checklist', or 'physics_visual'",
    )
    accent_badge: str = Field(
        default="Core Concept",
        description="Short badge or category pill e.g. 'Law of Reflection', 'Key Formula', 'Misconception Trap'",
    )
    bullets: List[str] = Field(
        default_factory=list,
        description="Key bullet points (concise, high-impact statements)",
    )
    formula: Optional[str] = Field(
        default=None,
        description="Mathematical equation or law formula in text/LaTeX notation if relevant",
    )
    key_takeaway: str = Field(
        ...,
        description="Memorable one-sentence summary takeaway for this slide",
    )
    visual_widget: Optional[VisualWidget] = Field(
        default=None,
        description="Optional physics simulation or visual widget embedded in this slide",
    )
    narration_script: str = Field(
        ...,
        description="Conversational, natural speech narration script for this slide (ready for ElevenLabs voiceover)",
    )
    estimated_duration_sec: int = Field(
        default=25,
        description="Estimated speech duration in seconds for this slide",
    )


class SlideDeck(BaseModel):
    deck_title: str = Field(..., description="Title of the presentation")
    mode: str = Field(default="quick", description="'quick' or 'detailed'")
    source_filename: str = Field(default="uploaded_notes", description="Originating document name")
    total_slides: int = Field(..., description="Total number of slides generated")
    estimated_read_time: str = Field(default="3 min", description="Estimated read or presentation time")
    slides: List[SlideItem] = Field(default_factory=list, description="Array of generated slides")
    created_at: float = Field(default=0.0, description="Epoch timestamp of generation")

