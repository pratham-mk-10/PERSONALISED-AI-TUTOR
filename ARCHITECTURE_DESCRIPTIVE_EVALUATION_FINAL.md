# Descriptive Answer Evaluation Engine — Implementation Blueprint
## NegGuard v5.0 | Adaptive AI Physics Tutor | PI Labs Capstone 2026

> **Purpose:** This document is the single source of truth for implementing the Descriptive Answer Evaluation Engine. It covers exact file structure, database schema, implementation order, all code contracts, the complete CoT prompt, API shape, and frontend integration. Build in the exact order specified — each phase depends on the previous one.

---

## Table of Contents

1. [Tech Stack & Prerequisites](#1-tech-stack--prerequisites)
2. [Project Structure](#2-project-structure)
3. [Environment Configuration](#3-environment-configuration)
4. [Database Schema](#4-database-schema)
5. [Phase 1 — Pydantic Models (The Contract)](#5-phase-1--pydantic-models-the-contract)
6. [Phase 2 — Smart Gate (Stage 1)](#6-phase-2--smart-gate-stage-1)
7. [Phase 3 — CoT LLM Engine (Stage 2)](#7-phase-3--cot-llm-engine-stage-2)
8. [Phase 4 — Reliability Layer (Stage 3)](#8-phase-4--reliability-layer-stage-3)
9. [Phase 5 — FastAPI Endpoint](#9-phase-5--fastapi-endpoint)
10. [Phase 6 — Benchmark Runner](#10-phase-6--benchmark-runner)
11. [Phase 7 — React Frontend Integration](#11-phase-7--react-frontend-integration)
12. [Implementation Order & Milestones](#12-implementation-order--milestones)
13. [Testing Checklist](#13-testing-checklist)
14. [Known Risks & Mitigations](#14-known-risks--mitigations)

---

## 1. Tech Stack & Prerequisites

### Backend
| Dependency | Version | Purpose |
|---|---|---|
| Python | 3.11+ | Base language |
| FastAPI | 0.111+ | API framework |
| Pydantic | v2 (2.7+) | Schema validation — critical, NOT v1 |
| google-generativeai | 0.7+ | Gemini 3.5 Flash API client |
| mistralai | 1.0+ | Mistral-Small fallback client |
| psycopg2-binary | 2.9+ | PostgreSQL driver |
| SQLAlchemy | 2.0+ | ORM for DB interactions |
| sentence-transformers | 2.7+ | BERT baseline (benchmark only) |
| python-dotenv | 1.0+ | Environment variable management |
| uvicorn | 0.29+ | ASGI server |

### Frontend (existing React app — additions only)
| Dependency | Purpose |
|---|---|
| axios | API calls to evaluation endpoint |
| react-markdown | Render feedback text with formatting |

### Install command
```bash
pip install fastapi pydantic[email] "google-generativeai>=0.7" mistralai \
    psycopg2-binary sqlalchemy python-dotenv uvicorn sentence-transformers \
    torch --index-url https://download.pytorch.org/whl/cpu
```

> **Note on torch:** Use CPU-only build. You don't need GPU for inference — you're only using sentence-transformers for the benchmark, not production.

---

## 2. Project Structure

```
PERSONALISED-AI-TUTOR/
│
├── backend/
│   ├── .env                               ← API keys — never commit
│   ├── requirements.txt                   ← Python dependencies
│   ├── question_engine.py                 ← Standalone question engine (root level)
│   ├── test_gemini.py                     ← Gemini API connectivity test
│   ├── test_mistral.py                    ← Mistral API connectivity test
│   │
│   ├── orchestrator/                      ← FastAPI app entry point + routing hub
│   │   ├── server.py                      ← FastAPI app instance (replaces main.py)
│   │   ├── routes.py                      ← All API routes (add /evaluate here)
│   │   ├── flow_controller.py             ← Controls session/quiz flow logic
│   │   └── session_manager.py             ← Manages student session state
│   │
│   ├── assesment_agent/                   ← [NOTE: intentional spelling] Evaluation lives here
│   │   ├── __init__.py
│   │   ├── descriptive_evaluator.py       ← [EXISTING] CoT LLM Engine (Phase 3)
│   │   ├── evaluator.py                   ← MCQ evaluator (existing, do not touch)
│   │   ├── level_classifier.py            ← Classifies student level
│   │   ├── misconception_detector.py      ← Misconception detection helper
│   │   ├── question_engine.py             ← Question engine for assessment
│   │   ├── question_gen.py                ← Question generation logic
│   │   ├── question_gen_llm_service.py    ← LLM service for question gen
│   │   ├── question_selector.py           ← Selects next question adaptively
│   │   ├── tags.json                      ← Misconception tag definitions
│   │   └── question_bank/                 ← Question bank files
│   │
│   │   ← NEW FILES TO ADD (Evaluation Engine):
│   │   ├── models.py                      ← [NEW] Pydantic schemas (Phase 1)
│   │   ├── gate.py                        ← [NEW] Smart Gate Stage 1 (Phase 2)
│   │   ├── prompt_builder.py              ← [NEW] Builds the CoT prompt (Phase 3)
│   │   ├── llm_engine.py                  ← [NEW] Gemini + Mistral calls (Phase 3)
│   │   ├── reliability.py                 ← [NEW] Pydantic validation + retry (Phase 4)
│   │   └── scoring.py                     ← [NEW] Severity caps + display score (Phase 4)
│   │
│   ├── content-agent/                     ← Content delivery and SVG generation
│   │   ├── content_agent.py
│   │   ├── llm_service.py
│   │   ├── prompt_builder.py
│   │   ├── strategy_selector.py
│   │   ├── super_prompt_svg.py
│   │   ├── svg_template_picker.py
│   │   ├── svg_validator.py
│   │   ├── template_quiz_scope.py
│   │   └── prompts/                       ← Prompt templates folder
│   │
│   ├── adaptataion-agent/                 ← [NOTE: intentional spelling] Feedback & adaptation
│   │   ├── adaptation_agent.py
│   │   ├── bridge_controller.py
│   │   ├── decision_engine.py
│   │   ├── feedback_trigger.py
│   │   └── misconception_refiner.py
│   │
│   ├── database/                          ← Database layer (SQLAlchemy)
│   │   ├── connection.py                  ← SQLAlchemy engine + session factory
│   │   ├── models.py                      ← ORM table definitions
│   │   ├── misconception_catalog.py       ← Misconception catalog logic
│   │   ├── queries.py                     ← DB query helpers
│   │   └── seed_db.py                     ← Seeds DB with questions + taxonomy
│   │
│   │   ← NOTE: seed_data/ JSONs (taxonomy.json, questions.json) go inside database/
│   │   ← seed_db.py reads from hardcoded data or inline dicts, not a seed_data/ folder
│   │
│   └── scratch/                           ← Dev scripts & one-off tests (not production)
│       ├── dynamic_svg_tester.py
│       ├── test_descriptive_pipeline.py
│       └── svg_outputs/                   ← SVG output files from tester
│
├── frontend/
│   └── src/
│       ├── App.jsx                        ← Main app router + curriculum flow
│       ├── main.jsx                       ← React entry point
│       ├── Sandbox.jsx                    ← Animation/component testing sandbox
│       │
│       ├── components/
│       │   ├── quiz/                      ← Quiz-related components
│       │   │   ├── QuizPage.jsx           ← Main quiz page (MCQ + Descriptive)
│       │   │   ├── QuizCard.jsx           ← Individual question card
│       │   │   ├── QuizVisualCorrection.jsx ← Visual misconception correction UI
│       │   │   ├── DynamicMirrorFeedback.jsx ← [EXISTING] Red/Green SVG Try stage
│       │   │   └── EvaluationResult.jsx   ← [NEW] Displays score + feedback + tag
│       │   │
│       │   ├── content/                   ← Content/lesson components
│       │   │   ├── ContentPage.jsx
│       │   │   └── SVGRenderer.jsx
│       │   │
│       │   ├── common/                    ← Reusable UI components
│       │   │   ├── Button.jsx
│       │   │   ├── Layout.jsx
│       │   │   └── Slider.jsx
│       │   │
│       │   └── dashboard/                 ← Dashboard components (folder exists, TBD)
│       │
│       ├── pages/                         ← Top-level page components
│       │   ├── Home.jsx
│       │   ├── Session.jsx
│       │   ├── AnimationTestPage.jsx
│       │   └── TestSVG.jsx
│       │
│       ├── services/
│       │   └── api.js                     ← Axios API call wrappers
│       │
│       ├── state/
│       │   └── sessionStore.js            ← Global session state (Zustand/Context)
│       │
│       ├── svg-engine/                    ← Physics SVG engine (ray tracing etc.)
│       └── sandbox-tests/                 ← Sandbox test case files
│
├── ARCHITECTURE_DESCRIPTIVE_EVALUATION.md      ← Concept whitepaper (v5.0 theory)
├── ARCHITECTURE_DESCRIPTIVE_EVALUATION_FINAL.md ← THIS FILE — implementation blueprint
├── ARCHITECTURE_DYNAMIC_SVG.md
├── Architecture_Evolution_Summary.md
├── COMPLETE_ARCHITECTURE_FINAL.md
├── README.md
├── .env.example                           ← Commit this, never commit .env
└── package-lock.json
```

---

## 3. Environment Configuration

### `.env.example` (commit this)
```bash
# Gemini
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Mistral (fallback)
MISTRAL_API_KEY=your_mistral_api_key_here
MISTRAL_MODEL=mistral-small-latest

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/adaptive_tutor

# Pipeline config
MAX_RETRY_ATTEMPTS=1
ENABLE_MISTRAL_FALLBACK=true
MIN_WORD_COUNT=4

# Environment
ENVIRONMENT=development
```

### `backend/config.py`
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    gemini_api_key: str
    gemini_model: str = "gemini-2.5-flash"
    mistral_api_key: str
    mistral_model: str = "mistral-small-latest"
    database_url: str
    max_retry_attempts: int = 1
    enable_mistral_fallback: bool = True
    min_word_count: int = 4
    environment: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()
```

---

## 4. Database Schema

### Tables Overview
```
questions          → stores each physics question + rubric + required_keywords
taxonomy           → 30 misconception tags + severity level
evaluations        → every successful evaluation result
flagged_evaluations → failed evaluations requiring manual review
students           → basic student records (links to evaluations)
```

### SQL: Create all tables
```sql
-- Run this once on your PostgreSQL instance

CREATE TABLE IF NOT EXISTS questions (
    id              SERIAL PRIMARY KEY,
    question_text   TEXT NOT NULL,
    chapter         VARCHAR(100) NOT NULL DEFAULT 'Light',
    rubric_points   JSONB NOT NULL,
    -- Array of correct answer components, e.g.:
    -- ["Convex mirrors diverge light", "Image is virtual", "Image is erect", "Image is diminished"]
    required_keywords TEXT[] NOT NULL,
    -- Simple string array for Smart Gate, e.g.: ["mirror","image","virtual","convex","diverge"]
    model_answer    TEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS taxonomy (
    id              SERIAL PRIMARY KEY,
    tag             VARCHAR(100) NOT NULL UNIQUE,
    description     TEXT NOT NULL,
    severity        VARCHAR(10) NOT NULL CHECK (severity IN ('HIGH','MEDIUM','LOW')),
    max_score_pct   NUMERIC(4,2) NOT NULL,
    -- HIGH=0.25, MEDIUM=0.55, LOW=0.85
    example_error   TEXT,
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS evaluations (
    id                  SERIAL PRIMARY KEY,
    student_id          VARCHAR(20) NOT NULL,
    -- USN e.g. PES1UG23CS447
    question_id         INTEGER REFERENCES questions(id),
    student_answer      TEXT NOT NULL,
    reasoning_trace     JSONB,
    contradicted_span   TEXT,
    misconception_tag   VARCHAR(100) REFERENCES taxonomy(tag),
    conceptual_score    NUMERIC(4,1) NOT NULL,
    completeness_score  NUMERIC(4,1) NOT NULL,
    display_score       NUMERIC(4,2) NOT NULL,
    -- (conceptual * 0.6) + (completeness * 0.4)
    constructive_text   TEXT NOT NULL,
    terminology_nudge   TEXT,
    llm_model_used      VARCHAR(50) NOT NULL,
    -- 'gemini-2.5-flash' or 'mistral-small-latest'
    latency_ms          INTEGER,
    created_at          TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS flagged_evaluations (
    id              SERIAL PRIMARY KEY,
    student_id      VARCHAR(20) NOT NULL,
    question_id     INTEGER REFERENCES questions(id),
    student_answer  TEXT NOT NULL,
    raw_llm_output  TEXT,
    -- Whatever the LLM returned before parse failure
    failure_reason  VARCHAR(255) NOT NULL,
    -- e.g. 'JSON_PARSE_ERROR', 'SCHEMA_VALIDATION_ERROR', 'RETRY_EXHAUSTED'
    retry_count     INTEGER DEFAULT 0,
    resolved        BOOLEAN DEFAULT FALSE,
    resolved_by     VARCHAR(100),
    created_at      TIMESTAMP DEFAULT NOW()
);

-- Index for fast student history lookup
CREATE INDEX idx_evaluations_student ON evaluations(student_id);
CREATE INDEX idx_evaluations_misconception ON evaluations(misconception_tag);
CREATE INDEX idx_flagged_resolved ON flagged_evaluations(resolved);
```

### Seed: `database/seed_data/taxonomy.json`
```json
[
  {"tag": "CONVEX_REAL_IMAGE",       "description": "Student claims convex mirror forms a real image",                       "severity": "HIGH",   "max_score_pct": 0.25},
  {"tag": "CONVEX_INVERTED",         "description": "Student claims convex mirror forms an inverted image",                  "severity": "LOW",    "max_score_pct": 0.85},
  {"tag": "CONCAVE_ALWAYS_REAL",     "description": "Student claims concave mirror always forms real image regardless of object position", "severity": "MEDIUM", "max_score_pct": 0.55},
  {"tag": "VIRTUAL_ON_SCREEN",       "description": "Student claims virtual images can be projected on a screen",            "severity": "HIGH",   "max_score_pct": 0.25},
  {"tag": "FOCAL_LENGTH_NEGATIVE",   "description": "Student assigns negative focal length to convex mirror",                "severity": "MEDIUM", "max_score_pct": 0.55},
  {"tag": "CONCAVE_ALWAYS_VIRTUAL",  "description": "Student claims concave mirror always forms virtual image",              "severity": "MEDIUM", "max_score_pct": 0.55},
  {"tag": "PLANE_REAL_IMAGE",        "description": "Student claims plane mirror can form real image",                       "severity": "HIGH",   "max_score_pct": 0.25},
  {"tag": "REFRACTION_REFLECTION_CONFUSED", "description": "Student confuses refraction with reflection",                   "severity": "HIGH",   "max_score_pct": 0.25},
  {"tag": "LENS_MIRROR_CONFUSED",    "description": "Student applies lens rules to mirror or vice versa",                   "severity": "MEDIUM", "max_score_pct": 0.55},
  {"tag": "FOCAL_POINT_ON_MIRROR",   "description": "Student claims focal point is on mirror surface",                      "severity": "LOW",    "max_score_pct": 0.85},
  {"tag": "MAGNIFICATION_ALWAYS_POSITIVE", "description": "Student claims magnification is always positive",                "severity": "LOW",    "max_score_pct": 0.85},
  {"tag": "OBJECT_BEYOND_CENTRE",    "description": "Student incorrectly states image position for object beyond C",         "severity": "LOW",    "max_score_pct": 0.85},
  {"tag": "OBJECT_AT_FOCUS",         "description": "Student claims image forms at infinity for object at F of concave",    "severity": "MEDIUM", "max_score_pct": 0.55},
  {"tag": "IMAGE_SAME_SIDE_VIRTUAL", "description": "Student claims virtual images form on same side as incoming light",    "severity": "MEDIUM", "max_score_pct": 0.55},
  {"tag": "MIRROR_FORMULA_INVERTED", "description": "Student inverts the mirror formula (1/f = 1/u + 1/v)",                "severity": "MEDIUM", "max_score_pct": 0.55},
  {"tag": "SPEED_OF_LIGHT_MEDIUM",   "description": "Student claims light speeds up in denser medium",                      "severity": "HIGH",   "max_score_pct": 0.25},
  {"tag": "TOTAL_INTERNAL_LESS_DENSE","description": "Student claims TIR occurs in less dense medium",                      "severity": "HIGH",   "max_score_pct": 0.25},
  {"tag": "CRITICAL_ANGLE_CONFUSION","description": "Student confuses critical angle with angle of refraction",             "severity": "MEDIUM", "max_score_pct": 0.55},
  {"tag": "DISPERSION_SINGLE_COLOUR","description": "Student claims only one colour disperses in a prism",                  "severity": "LOW",    "max_score_pct": 0.85},
  {"tag": "SCATTERING_ALL_EQUAL",    "description": "Student claims all colours scatter equally in atmosphere",             "severity": "MEDIUM", "max_score_pct": 0.55},
  {"tag": "LENS_FOCAL_BOTH_SIDES",   "description": "Student claims convex lens has focal points on only one side",         "severity": "LOW",    "max_score_pct": 0.85},
  {"tag": "POWER_UNIT_WRONG",        "description": "Student states power of lens in wrong unit",                           "severity": "LOW",    "max_score_pct": 0.85},
  {"tag": "CONCAVE_LENS_REAL_IMAGE", "description": "Student claims concave lens can form a real image",                   "severity": "HIGH",   "max_score_pct": 0.25},
  {"tag": "CONVEX_LENS_ALWAYS_MAGNIFIED", "description": "Student claims convex lens always magnifies",                    "severity": "MEDIUM", "max_score_pct": 0.55},
  {"tag": "EYE_DEFECT_LENS_WRONG",   "description": "Student prescribes wrong lens type for myopia or hypermetropia",      "severity": "HIGH",   "max_score_pct": 0.25},
  {"tag": "APERTURE_BRIGHTNESS_WRONG","description": "Student incorrectly explains relationship between aperture and brightness","severity":"LOW","max_score_pct": 0.85},
  {"tag": "RAINBOW_REFLECTION_ONLY", "description": "Student claims rainbow is due to reflection only, not dispersion",    "severity": "MEDIUM", "max_score_pct": 0.55},
  {"tag": "HUMAN_EYE_INVERTED_IGNORED","description":"Student unaware that brain corrects the inverted retinal image",     "severity": "LOW",    "max_score_pct": 0.85},
  {"tag": "ACCOMMODATION_PERMANENT", "description": "Student claims eye accommodation is permanent, not dynamic",          "severity": "LOW",    "max_score_pct": 0.85},
  {"tag": "NOVEL_UNTAGGED_ERROR",    "description": "Clear physics violation that does not match any known taxonomy tag",   "severity": "MEDIUM", "max_score_pct": 0.55}
]
```

---

## 5. Phase 1 — Pydantic Models (The Contract)

> Build this first. Every other module imports from here. Getting this right means the entire pipeline has a single enforced contract.

### `backend/evaluation/models.py`
```python
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from enum import Enum


class SeverityLevel(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class GateResult(BaseModel):
    """Output of Stage 1 Smart Gate"""
    passed: bool
    rejection_reason: Optional[str] = None
    # "TOO_SHORT" | "NO_KEYWORD_OVERLAP" | None


class FeedbackPayload(BaseModel):
    constructive_text: str
    terminology_nudge: Optional[str] = None


class ScorePayload(BaseModel):
    conceptual: float = Field(ge=0, le=10)
    completeness: float = Field(ge=0, le=10)

    @field_validator("conceptual", "completeness")
    @classmethod
    def round_to_half(cls, v: float) -> float:
        """Scores should be in 0.5 increments"""
        return round(v * 2) / 2


class LLMOutput(BaseModel):
    """
    Strict schema for the JSON the LLM must produce.
    If the LLM output cannot be parsed into this, it goes to flagged_evaluations.
    """
    reasoning_trace: list[str] = Field(min_length=3)
    # Minimum 3 reasoning steps enforced
    contradicted_span: Optional[str] = None
    # Exact quote of the student's physics violation, or null
    misconception_tag: Optional[str] = None
    # Must match a taxonomy tag OR be None
    scores: ScorePayload
    feedback: FeedbackPayload

    @field_validator("misconception_tag")
    @classmethod
    def validate_tag(cls, v: Optional[str]) -> Optional[str]:
        """
        Validate tag is in taxonomy or null.
        Full taxonomy list is injected at runtime from DB.
        This validator checks format only.
        """
        if v is not None and not v.isupper():
            raise ValueError(f"misconception_tag must be uppercase: {v}")
        return v


class EvaluationRequest(BaseModel):
    """Incoming request from frontend"""
    student_id: str = Field(min_length=5, max_length=20)
    question_id: int = Field(gt=0)
    student_answer: str = Field(min_length=1, max_length=2000)


class EvaluationResponse(BaseModel):
    """Final response sent back to frontend"""
    success: bool
    display_score: Optional[float] = None
    # (conceptual * 0.6) + (completeness * 0.4), rounded to 1dp
    conceptual_score: Optional[float] = None
    completeness_score: Optional[float] = None
    misconception_tag: Optional[str] = None
    misconception_severity: Optional[SeverityLevel] = None
    feedback: Optional[str] = None
    terminology_nudge: Optional[str] = None
    reasoning_trace: Optional[list[str]] = None
    flagged: bool = False
    # True if sent to manual review queue
    error_message: Optional[str] = None
    # Only populated when success=False and not flagged
```

---

## 6. Phase 2 — Smart Gate (Stage 1)

> Zero API cost. Zero latency. Filters garbage before it ever reaches Gemini.

### `backend/evaluation/gate.py`
```python
from backend.evaluation.models import GateResult
from backend.config import settings


def run_smart_gate(
    student_answer: str,
    required_keywords: list[str]
) -> GateResult:
    """
    Stage 1: Two-check gate.

    Check 1 — Word Count:
        Reject if answer has fewer than MIN_WORD_COUNT words.
        Catches single-word spam and empty submissions.

    Check 2 — Keyword Overlap:
        Reject if answer shares zero words with required_keywords.
        Catches "I don't know" and completely off-topic answers.
        Uses case-insensitive set intersection — no NLP dependencies.

    Args:
        student_answer:    Raw text from the student
        required_keywords: List of domain keywords for this question, from DB
                          e.g. ["mirror", "image", "virtual", "convex", "diverge"]

    Returns:
        GateResult with passed=True (proceed to Stage 2)
        or passed=False with rejection_reason
    """
    # ── Check 1: Word count ────────────────────────────────────────────────
    words = student_answer.strip().split()

    if len(words) < settings.min_word_count:
        return GateResult(
            passed=False,
            rejection_reason="TOO_SHORT"
        )

    # ── Check 2: Keyword overlap ───────────────────────────────────────────
    # Normalise both to lowercase for case-insensitive comparison
    answer_tokens = {word.lower().strip(".,?!;:") for word in words}
    keyword_set   = {kw.lower() for kw in required_keywords}

    overlap = answer_tokens.intersection(keyword_set)

    if len(overlap) == 0:
        return GateResult(
            passed=False,
            rejection_reason="NO_KEYWORD_OVERLAP"
        )

    # ── Passes both checks ────────────────────────────────────────────────
    return GateResult(passed=True)
```

---

## 7. Phase 3 — CoT LLM Engine (Stage 2)

### 7a. Prompt Builder

> The prompt is the most critical component. Build it once, version it like code.

### `backend/evaluation/prompt_builder.py`
```python
import json
from typing import TypedDict


class QuestionContext(TypedDict):
    question_text: str
    rubric_points: list[str]
    model_answer: str


class FewShotAnchor(TypedDict):
    answer: str
    conceptual: int
    completeness: int
    tag: str | None
    reasoning: str


# ── SYSTEM PROMPT ─────────────────────────────────────────────────────────
# This is fixed for all evaluations. Injected once per API call.

SYSTEM_PROMPT = """You are an expert CBSE Class 10 Physics teacher and examiner with 20+ years of experience grading student answers.

Your job is to evaluate a student's short descriptive answer to a physics question.

CRITICAL RULES:
1. You MUST reason step by step — write your full reasoning BEFORE producing any score
2. You MUST output exactly ONE valid JSON object — nothing before it, nothing after it
3. Do NOT add markdown backticks, ```json, or any text outside the JSON object
4. Your output must be parseable by Python json.loads() with zero modification

WHAT YOU ARE EVALUATING:
- Conceptual correctness: Does the student understand the underlying physics? (0-10)
- Completeness: Does the answer cover all required rubric points? (0-10)
- Misconception detection: Has the student stated a physically incorrect claim?

SCORING PHILOSOPHY:
- Never deduct points for poor vocabulary or missing technical terms
- If a student says "the mirror spreads light" instead of "diverges" — full marks for that concept
- Only penalise conceptual physics violations, not terminology gaps
- Terminology gaps get a terminology_nudge only — never affect the score

SEVERITY CAPS (apply to BOTH conceptual and completeness scores if tag is not null):
- HIGH severity misconceptions: maximum allowed score = 2.5 / 10
  Tags: CONVEX_REAL_IMAGE, VIRTUAL_ON_SCREEN, PLANE_REAL_IMAGE, REFRACTION_REFLECTION_CONFUSED,
        SPEED_OF_LIGHT_MEDIUM, TOTAL_INTERNAL_LESS_DENSE, CONCAVE_LENS_REAL_IMAGE, EYE_DEFECT_LENS_WRONG
- MEDIUM severity misconceptions: maximum allowed score = 5.5 / 10
  Tags: CONCAVE_ALWAYS_REAL, FOCAL_LENGTH_NEGATIVE, CONCAVE_ALWAYS_VIRTUAL, LENS_MIRROR_CONFUSED,
        OBJECT_AT_FOCUS, IMAGE_SAME_SIDE_VIRTUAL, MIRROR_FORMULA_INVERTED, CRITICAL_ANGLE_CONFUSION,
        SCATTERING_ALL_EQUAL, CONVEX_LENS_ALWAYS_MAGNIFIED, RAINBOW_REFLECTION_ONLY, NOVEL_UNTAGGED_ERROR
- LOW severity misconceptions: maximum allowed score = 8.5 / 10
  Tags: CONVEX_INVERTED, FOCAL_POINT_ON_MIRROR, MAGNIFICATION_ALWAYS_POSITIVE, OBJECT_BEYOND_CENTRE,
        LENS_FOCAL_BOTH_SIDES, POWER_UNIT_WRONG, APERTURE_BRIGHTNESS_WRONG, DISPERSION_SINGLE_COLOUR,
        HUMAN_EYE_INVERTED_IGNORED, ACCOMMODATION_PERMANENT

NOVEL_UNTAGGED_ERROR: If the student has a clear physics violation that does NOT match any taxonomy tag,
use NOVEL_UNTAGGED_ERROR. Never force-fit a wrong tag just to avoid using NOVEL_UNTAGGED_ERROR.

NULL TAG: If there is no physics violation at all, set misconception_tag to null.

REQUIRED JSON OUTPUT FORMAT:
{
  "reasoning_trace": [
    "Step 1 — Physics Entailment: <check if student's claims are physically correct>",
    "Step 2 — Negation/Qualifier Check: <check for ALWAYS/NEVER/ONLY/CANNOT flips>",
    "Step 3 — Taxonomy Match: <which tag matches, or why null>",
    "Step 4 — Contradiction Span: <exact quote of the violation, or null>",
    "Step 5 — Scoring: <raw scores before cap, then cap applied if needed>",
    "Step 6 — Feedback: <plan the constructive feedback and any terminology nudge>"
  ],
  "contradicted_span": "<exact quoted phrase from student answer that is wrong, or null>",
  "misconception_tag": "<TAG or null>",
  "scores": {
    "conceptual": <number 0-10>,
    "completeness": <number 0-10>
  },
  "feedback": {
    "constructive_text": "<encouraging, constructive explanation — never use the word 'wrong'>",
    "terminology_nudge": "<gentle note if student used non-standard terms, or null>"
  }
}"""


def build_user_prompt(
    question_ctx: QuestionContext,
    student_answer: str,
    anchors: list[FewShotAnchor]
) -> str:
    """
    Builds the per-request user prompt.
    Combines: question, rubric, few-shot anchors, student answer.
    """

    # Format rubric points
    rubric_str = "\n".join(
        f"{i+1}. {point}"
        for i, point in enumerate(question_ctx["rubric_points"])
    )

    # Format few-shot anchors
    anchors_str = ""
    for i, anchor in enumerate(anchors, 1):
        tag_str = anchor["tag"] if anchor["tag"] else "null — no misconception"
        anchors_str += f"""
ANCHOR {i} (Grading reference):
Student Answer: "{anchor['answer']}"
Expected Output:
  conceptual: {anchor['conceptual']}, completeness: {anchor['completeness']}
  misconception_tag: {tag_str}
  Reasoning: {anchor['reasoning']}
---"""

    return f"""[QUESTION]
{question_ctx['question_text']}

[RUBRIC — A complete answer must address all of these]
{rubric_str}

[MODEL ANSWER — for your reference only, do not penalise different but correct phrasing]
{question_ctx['model_answer']}

[FEW-SHOT ANCHOR EXAMPLES — use these to calibrate your scoring]
{anchors_str}

[STUDENT ANSWER TO EVALUATE NOW]
"{student_answer}"

Now reason step by step through all 6 steps, then produce your JSON output."""
```

---

### 7b. LLM Engine

### `backend/evaluation/llm_engine.py`
```python
import json
import time
import logging
from typing import Optional

import google.generativeai as genai
from mistralai import Mistral

from backend.config import settings
from backend.evaluation.models import LLMOutput
from backend.evaluation.prompt_builder import SYSTEM_PROMPT, build_user_prompt, QuestionContext, FewShotAnchor

logger = logging.getLogger(__name__)

# ── Configure clients ──────────────────────────────────────────────────────
genai.configure(api_key=settings.gemini_api_key)
mistral_client = Mistral(api_key=settings.mistral_api_key)

# ── Gemini generation config ───────────────────────────────────────────────
# thinking_budget=0 is CRITICAL — disables Gemini 2.5 thinking mode.
# Without this, Gemini emits internal reasoning tokens before the JSON,
# breaking json.loads() every time.
GEMINI_GENERATION_CONFIG = genai.types.GenerationConfig(
    temperature=0.0,
    response_mime_type="application/json",
    # Native JSON mode — enforces valid JSON output at API level
    thinking_config=genai.types.ThinkingConfig(
        thinking_budget=0
    )
)


def call_gemini(
    question_ctx: QuestionContext,
    student_answer: str,
    anchors: list[FewShotAnchor]
) -> tuple[Optional[dict], int, str]:
    """
    Makes a single call to Gemini 3.5 Flash.

    Returns:
        (parsed_dict, latency_ms, model_name)
        parsed_dict is None if the call fails or JSON is invalid
    """
    user_prompt = build_user_prompt(question_ctx, student_answer, anchors)

    model = genai.GenerativeModel(
        model_name=settings.gemini_model,
        system_instruction=SYSTEM_PROMPT,
        generation_config=GEMINI_GENERATION_CONFIG
    )

    start = time.time()
    try:
        response = model.generate_content(user_prompt)
        latency_ms = int((time.time() - start) * 1000)

        raw_text = response.text.strip()
        parsed = json.loads(raw_text)
        return parsed, latency_ms, settings.gemini_model

    except json.JSONDecodeError as e:
        logger.error(f"Gemini JSON parse error: {e}")
        return None, int((time.time() - start) * 1000), settings.gemini_model
    except Exception as e:
        logger.error(f"Gemini API error: {e}")
        return None, int((time.time() - start) * 1000), settings.gemini_model


def call_mistral(
    question_ctx: QuestionContext,
    student_answer: str,
    anchors: list[FewShotAnchor]
) -> tuple[Optional[dict], int, str]:
    """
    Fallback: Makes a single call to Mistral-Small.
    Same prompt structure, same expected JSON output.
    """
    user_prompt = build_user_prompt(question_ctx, student_answer, anchors)
    full_prompt = f"{SYSTEM_PROMPT}\n\n{user_prompt}"

    start = time.time()
    try:
        response = mistral_client.chat.complete(
            model=settings.mistral_model,
            messages=[{"role": "user", "content": full_prompt}],
            temperature=0.0,
            response_format={"type": "json_object"}
        )
        latency_ms = int((time.time() - start) * 1000)

        raw_text = response.choices[0].message.content.strip()
        parsed = json.loads(raw_text)
        return parsed, latency_ms, settings.mistral_model

    except Exception as e:
        logger.error(f"Mistral API error: {e}")
        return None, int((time.time() - start) * 1000), settings.mistral_model


def run_llm_engine(
    question_ctx: QuestionContext,
    student_answer: str,
    anchors: list[FewShotAnchor]
) -> tuple[Optional[dict], int, str]:
    """
    Orchestrates Gemini primary → Mistral fallback.

    Returns:
        (raw_parsed_dict, latency_ms, model_used)
        raw_parsed_dict is None if BOTH models fail
    """
    # Try Gemini first
    result, latency, model = call_gemini(question_ctx, student_answer, anchors)

    if result is not None:
        logger.info(f"Gemini succeeded in {latency}ms")
        return result, latency, model

    # Gemini failed — try Mistral if enabled
    if settings.enable_mistral_fallback:
        logger.warning("Gemini failed — attempting Mistral-Small fallback")
        result, latency, model = call_mistral(question_ctx, student_answer, anchors)

        if result is not None:
            logger.info(f"Mistral fallback succeeded in {latency}ms")
            return result, latency, model

    logger.error("Both Gemini and Mistral failed to return valid JSON")
    return None, latency, model
```

---

## 8. Phase 4 — Reliability Layer (Stage 3)

### `backend/evaluation/scoring.py`
```python
from backend.evaluation.models import SeverityLevel

# Severity cap mapping — source of truth
SEVERITY_MAP: dict[str, SeverityLevel] = {
    # HIGH
    "CONVEX_REAL_IMAGE":            SeverityLevel.HIGH,
    "VIRTUAL_ON_SCREEN":            SeverityLevel.HIGH,
    "PLANE_REAL_IMAGE":             SeverityLevel.HIGH,
    "REFRACTION_REFLECTION_CONFUSED": SeverityLevel.HIGH,
    "SPEED_OF_LIGHT_MEDIUM":        SeverityLevel.HIGH,
    "TOTAL_INTERNAL_LESS_DENSE":    SeverityLevel.HIGH,
    "CONCAVE_LENS_REAL_IMAGE":      SeverityLevel.HIGH,
    "EYE_DEFECT_LENS_WRONG":        SeverityLevel.HIGH,
    # MEDIUM
    "CONCAVE_ALWAYS_REAL":          SeverityLevel.MEDIUM,
    "FOCAL_LENGTH_NEGATIVE":        SeverityLevel.MEDIUM,
    "CONCAVE_ALWAYS_VIRTUAL":       SeverityLevel.MEDIUM,
    "LENS_MIRROR_CONFUSED":         SeverityLevel.MEDIUM,
    "OBJECT_AT_FOCUS":              SeverityLevel.MEDIUM,
    "IMAGE_SAME_SIDE_VIRTUAL":      SeverityLevel.MEDIUM,
    "MIRROR_FORMULA_INVERTED":      SeverityLevel.MEDIUM,
    "CRITICAL_ANGLE_CONFUSION":     SeverityLevel.MEDIUM,
    "SCATTERING_ALL_EQUAL":         SeverityLevel.MEDIUM,
    "CONVEX_LENS_ALWAYS_MAGNIFIED": SeverityLevel.MEDIUM,
    "RAINBOW_REFLECTION_ONLY":      SeverityLevel.MEDIUM,
    "NOVEL_UNTAGGED_ERROR":         SeverityLevel.MEDIUM,
    # LOW
    "CONVEX_INVERTED":              SeverityLevel.LOW,
    "FOCAL_POINT_ON_MIRROR":        SeverityLevel.LOW,
    "MAGNIFICATION_ALWAYS_POSITIVE": SeverityLevel.LOW,
    "OBJECT_BEYOND_CENTRE":         SeverityLevel.LOW,
    "LENS_FOCAL_BOTH_SIDES":        SeverityLevel.LOW,
    "POWER_UNIT_WRONG":             SeverityLevel.LOW,
    "APERTURE_BRIGHTNESS_WRONG":    SeverityLevel.LOW,
    "DISPERSION_SINGLE_COLOUR":     SeverityLevel.LOW,
    "HUMAN_EYE_INVERTED_IGNORED":   SeverityLevel.LOW,
    "ACCOMMODATION_PERMANENT":      SeverityLevel.LOW,
}

CAP_VALUES = {
    SeverityLevel.HIGH:   2.5,
    SeverityLevel.MEDIUM: 5.5,
    SeverityLevel.LOW:    8.5,
}


def apply_severity_cap(
    conceptual: float,
    completeness: float,
    misconception_tag: str | None
) -> tuple[float, float, SeverityLevel | None]:
    """
    Applies severity cap to scores if a misconception is detected.

    Returns:
        (capped_conceptual, capped_completeness, severity_level)
    """
    if misconception_tag is None:
        return conceptual, completeness, None

    severity = SEVERITY_MAP.get(misconception_tag)
    if severity is None:
        # Unknown tag — treat as MEDIUM by default
        severity = SeverityLevel.MEDIUM

    cap = CAP_VALUES[severity]
    return min(conceptual, cap), min(completeness, cap), severity


def compute_display_score(conceptual: float, completeness: float) -> float:
    """
    Weighted display score per CBSE norms.
    Conceptual understanding weighted higher than completeness.

    Formula: (conceptual × 0.6) + (completeness × 0.4)
    Result rounded to 1 decimal place.
    """
    raw = (conceptual * 0.6) + (completeness * 0.4)
    return round(raw, 1)
```

---

### `backend/evaluation/reliability.py`
```python
import logging
from pydantic import ValidationError

from backend.evaluation.models import LLMOutput, GateResult, EvaluationResponse, SeverityLevel
from backend.evaluation.llm_engine import run_llm_engine
from backend.evaluation.scoring import apply_severity_cap, compute_display_score, SEVERITY_MAP
from backend.evaluation.prompt_builder import QuestionContext, FewShotAnchor
from backend.config import settings
from backend.database.connection import get_session
from backend.database import models as db_models

logger = logging.getLogger(__name__)


def run_reliability_layer(
    raw_output: dict | None,
    student_id: str,
    question_id: int,
    student_answer: str,
    question_ctx: QuestionContext,
    anchors: list[FewShotAnchor],
    latency_ms: int,
    model_used: str,
    retry_count: int = 0
) -> EvaluationResponse:
    """
    Stage 3: Validate → Cap → Save → Return.

    If raw_output is None or fails Pydantic validation:
        - If retry_count < MAX_RETRY_ATTEMPTS: retry LLM call
        - If retry exhausted: log to flagged_evaluations, return flagged response

    Args:
        raw_output:    Parsed dict from LLM (or None if LLM call failed)
        retry_count:   Current retry attempt number (0 = first validation)
    """

    # ── Step 1: Validate against Pydantic schema ───────────────────────────
    if raw_output is None:
        return _handle_failure(
            student_id, question_id, student_answer,
            None, "LLM_RETURNED_NONE",
            retry_count, question_ctx, anchors
        )

    try:
        validated: LLMOutput = LLMOutput.model_validate(raw_output)

    except ValidationError as e:
        logger.warning(f"Pydantic validation failed: {e}")
        return _handle_failure(
            student_id, question_id, student_answer,
            str(raw_output), "SCHEMA_VALIDATION_ERROR",
            retry_count, question_ctx, anchors
        )

    # ── Step 2: Validate misconception_tag is in taxonomy ─────────────────
    tag = validated.misconception_tag
    if tag is not None and tag not in SEVERITY_MAP and tag != "NOVEL_UNTAGGED_ERROR":
        logger.warning(f"Unknown tag '{tag}' — treating as NOVEL_UNTAGGED_ERROR")
        # Don't fail — gracefully reassign to avoid unnecessary flagging
        tag = "NOVEL_UNTAGGED_ERROR"

    # ── Step 3: Apply severity cap ─────────────────────────────────────────
    raw_conceptual    = validated.scores.conceptual
    raw_completeness  = validated.scores.completeness

    capped_conceptual, capped_completeness, severity = apply_severity_cap(
        raw_conceptual, raw_completeness, tag
    )

    # ── Step 4: Compute weighted display score ─────────────────────────────
    display_score = compute_display_score(capped_conceptual, capped_completeness)

    # ── Step 5: Persist to evaluations table ──────────────────────────────
    _save_evaluation(
        student_id, question_id, student_answer, validated,
        tag, capped_conceptual, capped_completeness,
        display_score, model_used, latency_ms
    )

    # ── Step 6: Build and return response ─────────────────────────────────
    return EvaluationResponse(
        success=True,
        display_score=display_score,
        conceptual_score=capped_conceptual,
        completeness_score=capped_completeness,
        misconception_tag=tag,
        misconception_severity=severity,
        feedback=validated.feedback.constructive_text,
        terminology_nudge=validated.feedback.terminology_nudge,
        reasoning_trace=validated.reasoning_trace,
        flagged=False
    )


def _handle_failure(
    student_id, question_id, student_answer,
    raw_llm_output, failure_reason,
    retry_count, question_ctx, anchors
) -> EvaluationResponse:
    """
    Retry once, then flag to DB if retry also fails.
    """
    if retry_count < settings.max_retry_attempts:
        logger.info(f"Retrying LLM call (attempt {retry_count + 1})")
        new_raw, new_latency, new_model = run_llm_engine(
            question_ctx, student_answer, anchors
        )
        return run_reliability_layer(
            new_raw, student_id, question_id, student_answer,
            question_ctx, anchors, new_latency, new_model,
            retry_count=retry_count + 1
        )

    # Retry exhausted — flag it
    logger.error(f"Flagging evaluation after {retry_count} retries: {failure_reason}")
    _save_flagged(student_id, question_id, student_answer, raw_llm_output, failure_reason, retry_count)

    return EvaluationResponse(
        success=False,
        flagged=True,
        error_message="We had trouble evaluating this answer. It has been securely forwarded to your instructor for manual grading."
    )


def _save_evaluation(
    student_id, question_id, student_answer, validated: LLMOutput,
    tag, conceptual, completeness, display_score, model_used, latency_ms
):
    """Persist successful evaluation to DB"""
    with get_session() as session:
        record = db_models.Evaluation(
            student_id=student_id,
            question_id=question_id,
            student_answer=student_answer,
            reasoning_trace=validated.reasoning_trace,
            contradicted_span=validated.contradicted_span,
            misconception_tag=tag,
            conceptual_score=conceptual,
            completeness_score=completeness,
            display_score=display_score,
            constructive_text=validated.feedback.constructive_text,
            terminology_nudge=validated.feedback.terminology_nudge,
            llm_model_used=model_used,
            latency_ms=latency_ms
        )
        session.add(record)
        session.commit()


def _save_flagged(student_id, question_id, student_answer, raw_llm_output, failure_reason, retry_count):
    """Persist failed evaluation to flagged_evaluations table"""
    with get_session() as session:
        record = db_models.FlaggedEvaluation(
            student_id=student_id,
            question_id=question_id,
            student_answer=student_answer,
            raw_llm_output=str(raw_llm_output) if raw_llm_output else None,
            failure_reason=failure_reason,
            retry_count=retry_count
        )
        session.add(record)
        session.commit()
```

---

## 9. Phase 5 — FastAPI Endpoint

### `backend/evaluation/router.py`
```python
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from backend.evaluation.models import EvaluationRequest, EvaluationResponse, GateResult
from backend.evaluation.gate import run_smart_gate
from backend.evaluation.llm_engine import run_llm_engine
from backend.evaluation.reliability import run_reliability_layer
from backend.database.connection import get_session
from backend.database import models as db_models

router = APIRouter(prefix="/evaluate", tags=["Evaluation"])


def get_question_context(question_id: int, session: Session):
    """Fetch question + anchors from DB"""
    q = session.query(db_models.Question).filter_by(id=question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail=f"Question {question_id} not found")
    return q


# Hardcoded few-shot anchors (v1.0 — later pull from DB per question)
DEFAULT_ANCHORS = [
    {
        "answer": "Convex mirrors spread out light and always make a small upright image that appears to be behind the mirror and cannot be shown on a screen.",
        "conceptual": 9,
        "completeness": 8,
        "tag": None,
        "reasoning": "Correct physics. 'Spread out' accepted as synonym for 'diverge'. No terminology deduction. No misconception."
    },
    {
        "answer": "The convex mirror forms a virtual image that is smaller.",
        "conceptual": 6,
        "completeness": 4,
        "tag": None,
        "reasoning": "Partially correct — got virtual and diminished, missed erect and divergence of light. No misconception tag."
    },
    {
        "answer": "Convex mirrors converge light and form a real image in front of the mirror.",
        "conceptual": 1,
        "completeness": 1,
        "tag": "CONVEX_REAL_IMAGE",
        "reasoning": "Fatal physics violation. CONVEX_REAL_IMAGE. HIGH severity cap = 2.5 max. Scores already at 1."
    }
]


@router.post("/", response_model=EvaluationResponse)
def evaluate_answer(
    request: EvaluationRequest,
    session: Session = Depends(get_session)
):
    """
    Main evaluation endpoint.

    Flow:
        1. Fetch question from DB
        2. Run Smart Gate (Stage 1)
        3. If gate passes → run LLM Engine (Stage 2)
        4. Run Reliability Layer (Stage 3) → validate, cap, save
        5. Return EvaluationResponse
    """
    # ── Fetch question ─────────────────────────────────────────────────────
    question = get_question_context(request.question_id, session)

    # ── Stage 1: Smart Gate ────────────────────────────────────────────────
    gate_result: GateResult = run_smart_gate(
        student_answer=request.student_answer,
        required_keywords=question.required_keywords
    )

    if not gate_result.passed:
        # Return immediately — no LLM call
        messages = {
            "TOO_SHORT": "Your answer is too short. Please write at least one complete sentence.",
            "NO_KEYWORD_OVERLAP": "Your answer doesn't seem to be about this physics topic. Please re-read the question and try again."
        }
        return EvaluationResponse(
            success=False,
            flagged=False,
            error_message=messages.get(gate_result.rejection_reason, "Please provide a more detailed answer.")
        )

    # ── Build question context ─────────────────────────────────────────────
    question_ctx = {
        "question_text": question.question_text,
        "rubric_points": question.rubric_points,
        "model_answer": question.model_answer
    }

    # ── Stage 2: LLM Engine ────────────────────────────────────────────────
    raw_output, latency_ms, model_used = run_llm_engine(
        question_ctx=question_ctx,
        student_answer=request.student_answer,
        anchors=DEFAULT_ANCHORS
    )

    # ── Stage 3: Reliability Layer ─────────────────────────────────────────
    return run_reliability_layer(
        raw_output=raw_output,
        student_id=request.student_id,
        question_id=request.question_id,
        student_answer=request.student_answer,
        question_ctx=question_ctx,
        anchors=DEFAULT_ANCHORS,
        latency_ms=latency_ms,
        model_used=model_used
    )
```

### Register router in `backend/main.py`
```python
from fastapi import FastAPI
from backend.evaluation.router import router as evaluation_router

app = FastAPI(title="Adaptive AI Physics Tutor API")

app.include_router(evaluation_router)

# Health check
@app.get("/health")
def health():
    return {"status": "ok"}
```

---

## 10. Phase 6 — Benchmark Runner

### `backend/benchmark/run_pipeline.py`
```python
"""
Passes all 30 adversarial answers through the v5.0 pipeline.
Records scores, tags, latency per answer.
Compare against human_grades.json.
"""
import json
import time
from pathlib import Path

from backend.evaluation.gate import run_smart_gate
from backend.evaluation.llm_engine import run_llm_engine
from backend.evaluation.scoring import apply_severity_cap, compute_display_score

ANSWERS_FILE     = Path(__file__).parent / "answers.json"
HUMAN_GRADES     = Path(__file__).parent / "human_grades.json"
RESULTS_FILE     = Path(__file__).parent / "pipeline_results.json"

# Load question context for benchmark (hardcoded for light chapter question)
BENCHMARK_QUESTION = {
    "question_text": "What type of image does a convex mirror always form?",
    "rubric_points": [
        "Convex mirrors always diverge light rays",
        "The image formed is always virtual",
        "The image formed is always erect (upright)",
        "The image formed is always diminished (smaller than object)"
    ],
    "model_answer": "A convex mirror always forms a virtual, erect, and diminished image behind the mirror, because it diverges light rays."
}

BENCHMARK_ANCHORS = [
    {"answer": "Convex mirrors spread out light and always make a small upright image behind the mirror, not on a screen.", "conceptual": 9, "completeness": 8, "tag": None, "reasoning": "Correct physics. Terminology acceptable."},
    {"answer": "The convex mirror forms a virtual image that is smaller.", "conceptual": 6, "completeness": 4, "tag": None, "reasoning": "Partially correct."},
    {"answer": "Convex mirrors converge light and form a real image in front.", "conceptual": 1, "completeness": 1, "tag": "CONVEX_REAL_IMAGE", "reasoning": "Fatal violation. HIGH severity."},
]


def run_benchmark():
    with open(ANSWERS_FILE) as f:
        answers = json.load(f)

    results = []

    for i, item in enumerate(answers):
        print(f"Processing answer {i+1}/30: {item['id']}")

        # Smart Gate
        gate = run_smart_gate(item["answer"], ["mirror","image","virtual","convex","diverge","real","erect","diminished"])
        if not gate.passed:
            results.append({
                "id": item["id"],
                "answer": item["answer"],
                "gate_rejected": True,
                "rejection_reason": gate.rejection_reason,
                "pipeline_score": None
            })
            continue

        # LLM Engine
        raw, latency, model = run_llm_engine(BENCHMARK_QUESTION, item["answer"], BENCHMARK_ANCHORS)

        if raw is None:
            results.append({"id": item["id"], "answer": item["answer"], "llm_failed": True})
            continue

        # Scores
        tag = raw.get("scores") and raw.get("misconception_tag")
        try:
            conceptual   = raw["scores"]["conceptual"]
            completeness = raw["scores"]["completeness"]
            tag          = raw.get("misconception_tag")
            capped_c, capped_k, severity = apply_severity_cap(conceptual, completeness, tag)
            display = compute_display_score(capped_c, capped_k)
        except (KeyError, TypeError):
            results.append({"id": item["id"], "answer": item["answer"], "parse_failed": True})
            continue

        results.append({
            "id":                item["id"],
            "answer":            item["answer"],
            "pipeline_score":    display,
            "conceptual":        capped_c,
            "completeness":      capped_k,
            "misconception_tag": tag,
            "latency_ms":        latency,
            "model":             model
        })

    with open(RESULTS_FILE, "w") as f:
        json.dump(results, f, indent=2)

    print(f"\nDone. Results saved to {RESULTS_FILE}")


if __name__ == "__main__":
    run_benchmark()
```

### `backend/benchmark/compute_agreement.py`
```python
"""
Computes Inter-Rater Agreement (±1 pt) and Cohen's Kappa
between pipeline scores and human expert grades.
Run AFTER run_pipeline.py and run_bert_baseline.py both complete.
"""
import json
from pathlib import Path
from sklearn.metrics import cohen_kappa_score

HUMAN_FILE    = Path(__file__).parent / "human_grades.json"
PIPELINE_FILE = Path(__file__).parent / "pipeline_results.json"
BERT_FILE     = Path(__file__).parent / "bert_results.json"


def within_tolerance(score_a: float, score_b: float, tolerance: float = 1.0) -> bool:
    return abs(score_a - score_b) <= tolerance


def compute_agreement(system_name: str, system_scores: list[float], human_scores: list[float]):
    assert len(system_scores) == len(human_scores), "Score lists must be same length"

    n = len(human_scores)
    agreements = sum(
        1 for s, h in zip(system_scores, human_scores)
        if within_tolerance(s, h)
    )

    agreement_rate = agreements / n

    # Round to nearest integer for Cohen's Kappa (requires discrete labels)
    system_rounded = [round(s) for s in system_scores]
    human_rounded  = [round(h) for h in human_scores]

    kappa = cohen_kappa_score(human_rounded, system_rounded)

    print(f"\n{'='*50}")
    print(f"System: {system_name}")
    print(f"{'='*50}")
    print(f"  N answers:          {n}")
    print(f"  Agreement (±1 pt):  {agreements}/{n} = {agreement_rate:.1%}")
    print(f"  Cohen's Kappa:      {kappa:.3f}")
    print(f"  Interpretation:     {'Good' if kappa > 0.6 else 'Moderate' if kappa > 0.4 else 'Fair'}")
    return {"agreement_rate": agreement_rate, "cohen_kappa": kappa}


def main():
    with open(HUMAN_FILE) as f:
        human_data = json.load(f)
    with open(PIPELINE_FILE) as f:
        pipeline_data = json.load(f)
    with open(BERT_FILE) as f:
        bert_data = json.load(f)

    # Align by ID
    ids = [item["id"] for item in human_data]
    human_scores   = {item["id"]: item["score"] for item in human_data}
    pipeline_scores = {item["id"]: item["pipeline_score"] for item in pipeline_data if item.get("pipeline_score") is not None}
    bert_scores     = {item["id"]: item["bert_score"] for item in bert_data}

    common_ids = [i for i in ids if i in pipeline_scores and i in bert_scores]
    print(f"Evaluating on {len(common_ids)} complete answers")

    h = [human_scores[i] for i in common_ids]
    p = [pipeline_scores[i] for i in common_ids]
    b = [bert_scores[i] for i in common_ids]

    pipeline_result = compute_agreement("CoT Pipeline v5.0", p, h)
    bert_result     = compute_agreement("BERT Cosine Similarity", b, h)

    improvement = pipeline_result["agreement_rate"] - bert_result["agreement_rate"]
    print(f"\n{'='*50}")
    print(f"Pipeline improvement over BERT: +{improvement:.1%}")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
```

---

## 11. Phase 7 — React Frontend Integration

### `frontend/src/components/EvaluationResult.jsx`
```jsx
import React from 'react';

// Severity colour mapping
const SEVERITY_COLORS = {
  HIGH:   { bg: '#FEE2E2', border: '#DC2626', text: '#DC2626' },
  MEDIUM: { bg: '#FEF3C7', border: '#D97706', text: '#D97706' },
  LOW:    { bg: '#DCFCE7', border: '#16A34A', text: '#16A34A' },
};

export default function EvaluationResult({ result }) {
  if (!result) return null;

  // Flagged — manual review
  if (result.flagged) {
    return (
      <div style={{ background: '#FEF3C7', border: '1px solid #D97706', borderRadius: 8, padding: 16 }}>
        <p style={{ color: '#92400E', fontWeight: 600 }}>⚠ Evaluation Notice</p>
        <p style={{ color: '#78350F' }}>{result.error_message}</p>
      </div>
    );
  }

  // Gate rejected
  if (!result.success && !result.flagged) {
    return (
      <div style={{ background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: 8, padding: 16 }}>
        <p style={{ color: '#475569' }}>ℹ {result.error_message}</p>
      </div>
    );
  }

  const sevColors = result.misconception_severity
    ? SEVERITY_COLORS[result.misconception_severity]
    : null;

  return (
    <div style={{ fontFamily: 'Calibri, sans-serif', maxWidth: 720 }}>

      {/* Score display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: '#0891B2' }}>
            {result.display_score}
          </div>
          <div style={{ color: '#64748B', fontSize: 14 }}>out of 10</div>
        </div>
        <div>
          <div style={{ color: '#475569', fontSize: 13 }}>
            Conceptual: <strong>{result.conceptual_score}/10</strong>
          </div>
          <div style={{ color: '#475569', fontSize: 13 }}>
            Completeness: <strong>{result.completeness_score}/10</strong>
          </div>
          <div style={{ color: '#94A3B8', fontSize: 11, marginTop: 4 }}>
            Score = (Conceptual × 0.6) + (Completeness × 0.4)
          </div>
        </div>
      </div>

      {/* Misconception badge */}
      {result.misconception_tag && sevColors && (
        <div style={{
          background: sevColors.bg,
          border: `1px solid ${sevColors.border}`,
          borderRadius: 8,
          padding: '10px 16px',
          marginBottom: 16
        }}>
          <span style={{ color: sevColors.text, fontWeight: 600, fontSize: 13 }}>
            ⚠ Misconception Detected: {result.misconception_tag}
          </span>
          <span style={{ color: sevColors.text, fontSize: 12, marginLeft: 8 }}>
            ({result.misconception_severity} severity)
          </span>
        </div>
      )}

      {/* Feedback */}
      <div style={{
        background: '#F8FAFC', border: '1px solid #E2E8F0',
        borderRadius: 8, padding: 16, marginBottom: 12
      }}>
        <p style={{ color: '#1E293B', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          {result.feedback}
        </p>
      </div>

      {/* Terminology nudge */}
      {result.terminology_nudge && (
        <div style={{
          background: '#CFFAFE', border: '1px solid #0891B2',
          borderRadius: 8, padding: '10px 16px', marginBottom: 12
        }}>
          <p style={{ color: '#0E7490', fontSize: 13, margin: 0 }}>
            💡 <strong>Terminology tip:</strong> {result.terminology_nudge}
          </p>
        </div>
      )}

      {/* Reasoning trace (collapsible for teacher view) */}
      {result.reasoning_trace && (
        <details style={{ marginTop: 8 }}>
          <summary style={{ color: '#64748B', fontSize: 13, cursor: 'pointer' }}>
            View reasoning trace
          </summary>
          <ol style={{ color: '#475569', fontSize: 12, lineHeight: 1.7, marginTop: 8 }}>
            {result.reasoning_trace.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </details>
      )}

    </div>
  );
}
```

### API call from parent component
```jsx
// In your question/answer component
import axios from 'axios';

const submitAnswer = async (studentId, questionId, answer) => {
  try {
    const response = await axios.post('/evaluate/', {
      student_id:     studentId,
      question_id:    questionId,
      student_answer: answer
    });
    setEvaluationResult(response.data);
  } catch (error) {
    console.error('Evaluation failed:', error);
  }
};
```

---

## 12. Implementation Order & Milestones

Build in this exact order — each phase is independently testable before moving to the next.

```
WEEK 3 — P2 + P3
─────────────────────────────────────────────────────────
Day 1:  Database setup — run SQL schema, seed taxonomy.json
Day 2:  config.py + models.py (Phase 1) — test Pydantic validation in isolation
Day 3:  gate.py (Phase 2) — unit test with 10 sample answers
Day 4:  database/connection.py + ORM models
Day 5:  Integration test: DB + gate working end-to-end

WEEK 4 — P1
─────────────────────────────────────────────────────────
Day 1:  Get Gemini API key working — test raw API call in a scratch file FIRST
        → Verify thinking mode is disabled, JSON mode is on
Day 2:  prompt_builder.py — print prompt to console, verify it looks right
Day 3:  llm_engine.py — test single Gemini call, check raw JSON output
Day 4:  Test with 5-10 answers manually — spot check reasoning traces
Day 5:  Add Mistral fallback — test by temporarily breaking Gemini key

WEEK 4 (cont.) — P2
─────────────────────────────────────────────────────────
Day 6:  scoring.py — unit test all 30 tags, verify cap math
Day 7:  reliability.py — test with intentionally bad LLM output to verify retry
Day 8:  router.py (Phase 5) — test full endpoint with curl/Postman
Day 9:  main.py integration — run full server locally

WEEK 5 — P4 (Benchmark)
─────────────────────────────────────────────────────────
Day 1-2: Construct 30 answers (6 categories × 5 answers)
         Categories: correct, semantic negation, hedged, vocab-poor correct,
                    partially correct, self-contradictory
Day 3:   Get human expert grades (Dr Deepak Raj D.M)
Day 4:   run_bert_baseline.py — BERT cosine scores
Day 5:   run_pipeline.py — pipeline scores
Day 6:   compute_agreement.py — final A/B result

WEEK 6 — Full Team
─────────────────────────────────────────────────────────
Day 1-2: React EvaluationResult.jsx integration
Day 3:   End-to-end latency testing (measure Stage 1, 2, 3 separately)
Day 4:   Edge case testing (very long answers, non-English words, LaTeX notation)
Day 5-6: Final report + results section of research paper
```

---

## 13. Testing Checklist

### Unit Tests (test each module in isolation before integration)
- [ ] Smart Gate rejects answer with 3 words
- [ ] Smart Gate rejects "I don't know this topic at all" (no overlap)
- [ ] Smart Gate passes "The convex mirror forms a virtual image"
- [ ] Pydantic rejects JSON with missing `reasoning_trace`
- [ ] Pydantic rejects score of 11 (out of range)
- [ ] Severity cap: CONVEX_REAL_IMAGE + score 8 → returns 2.5
- [ ] Severity cap: null tag + score 8 → returns 8 unchanged
- [ ] Display score: (7 × 0.6) + (6 × 0.4) = 4.2 + 2.4 = 6.6 ✓

### Integration Tests (run after full pipeline assembled)
- [ ] Submit semantically negated answer → pipeline detects CONVEX_REAL_IMAGE
- [ ] Submit vocabulary-poor correct answer → gets high score + terminology_nudge
- [ ] Submit 3-word answer → gate rejects before Gemini is called
- [ ] Force Gemini failure (wrong key) → Mistral takes over
- [ ] Force both failures → answer logged in flagged_evaluations
- [ ] Check flagged_evaluations table has record after forced failure
- [ ] Verify latency < 5000ms for standard answer on good connection

### Benchmark Validation Targets
- [ ] Pipeline agreement rate > 75% against human grades
- [ ] Pipeline agreement rate > BERT agreement rate
- [ ] Cohen's Kappa > 0.6 (good agreement threshold)
- [ ] All 8 HIGH-severity answers correctly identified as HIGH
- [ ] NOVEL_UNTAGGED_ERROR used for at least 1 answer (proves fallback works)

---

## 14. Known Risks & Mitigations

| Risk | Probability | Exact Mitigation |
|---|---|---|
| Gemini thinking mode emits tokens before JSON | High if not disabled | Set `thinking_budget=0` in GenerationConfig on Day 1 — verify with raw API call before building anything else |
| Pydantic v1 installed instead of v2 | Medium | `pip show pydantic` → must show Version: 2.x.x. All models use `model_validate()` not `.parse_obj()` |
| Gemini `response_mime_type` not supported on your SDK version | Low | Fallback: strip code fences manually with `raw.replace('```json','').replace('```','').strip()` before `json.loads()` |
| Few-shot anchors push token count over Gemini context limit | Very Low | Each anchor ≈ 100 tokens × 3 = ~300 extra tokens. Gemini 2.5 Flash context = 1M tokens. Not a concern. |
| Benchmark human grader unavailable before deadline | Low | Dr Deepak Raj D.M is your mentor — grade together in one session, 30 answers takes ~45 minutes |
| Cohen's Kappa below 0.6 | Medium | Expected if pipeline score and human score differ by more than 1 consistently. Run on 10 answers first to calibrate few-shot anchors before full benchmark run |
| `sentence-transformers` slow install on Windows | Medium | Install on WSL2 or Linux VM. Add `--index-url https://download.pytorch.org/whl/cpu` for CPU-only torch |

---

*Document version: 1.0 | Date: June 2026*
*Project: NegGuard — Descriptive Answer Evaluation Engine v5.0*
*PI Labs Capstone | PES University | CSE (AI & ML)*
*Team: Pratham M K · Pavan Gowda N · Rachan Mahalinga Devadiga*
*Mentor: Dr Deepak Raj D.M*
