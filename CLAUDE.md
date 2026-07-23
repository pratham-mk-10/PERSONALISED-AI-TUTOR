# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend
```bash
cd frontend
npm install
npm run dev          # dev server on http://localhost:5173
npm run build        # production build
npm run test:unit    # run Vitest unit tests (jsdom environment)
```

Press backtick (`` ` ``) in the running app to toggle the Sandbox dev environment for testing individual SVG components in isolation.

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn orchestrator.server:app --reload --port 8000
```

Backend runs at `http://localhost:8000`. FastAPI auto-docs at `/docs`.

### Database
Set `DATABASE_URL` in a `.env` at repo root or `backend/.env`. The connection module accepts both `postgres://` and `postgresql://` URL schemes and handles SSL via `DB_SSLMODE`. Tables are created on first use via `ensure_*_table()` calls — there are no migration scripts.

```env
DATABASE_URL=postgresql://user:pass@host:port/dbname
GEMINI_API_KEY=...
MISTRAL_API_KEY=...
```

Production DB is hosted on Railway. For local dev, create a `question_bank` database in PostgreSQL.

---

## Architecture

### The Core Design Decision

LLM SVG generation was attempted and rejected — Gemini produced rays that missed focal points and mirror curves that were mathematically wrong. The result is a **hybrid architecture**:

- **Frontend physics engine** handles all spatial/visual rendering with exact math (deterministic, 100% accurate)
- **LLM** handles only semantic tasks: generating text explanations, inferring misconception tags from wrong answers, evaluating descriptive answers

This is the project's main differentiator and the most important thing to understand before touching any code.

---

### Frontend: Physics Engine Layer

All physics math lives in two files that everything else imports from:

- `frontend/src/svg-engine/shared/PhysicsEngine.jsx` — pure math functions: `mirrorFormula(u, f)`, `snellsLaw(n1, n2, angle)`, `lensFormula(u, f)`, `magnification(v, u)`, `describeArc()`, `lerp()`, `polarToCartesian()`, `clamp()`
- `frontend/src/svg-engine/reflection/spherical-mirrors/MirrorPhysicsEngine.js` — class with `calculateImage(mirrorType, focalLength, objectDistance, objectHeight)` and `getLogicalCoordinates()`. Applies strict Cartesian sign convention: object always left (u negative), concave f negative, convex f positive.

SVG primitives that wrap the math into JSX are in `frontend/src/svg-engine/shared/SVGUtils.jsx` — exports `Ray`, `Label`, `PrincipalAxis`, `ObjectArrow`, `ImageArrow`, `ConcaveMirrorArc`, `DataBox`, `MirrorFormula`, etc.

Animation components use `AnimationPlayer` or `AudioAnimationPlayer` (both in `svg-engine/shared/`) which control a `progress` value (0→1) and pass it to child render functions. Audio steps are arrays of `{ progress: number, text: string }`.

The Bézier mirror curve formula used in lessons:
```js
x(t) = (1-t)² * x0 + 2t(1-t) * xc + t² * x1
```
Hatch marks are generated parametrically along this curve in `generateHatchPath()` inside each lesson component.

---

### Frontend: Quiz + Visual Feedback Pipeline

When a student answers wrong, the flow is:

1. `QuizPage.jsx` submits to `/submit-answers` → receives `{ main_misconception, svg_component, svg_variant, question_feedback[] }`
2. `QuizVisualCorrection.jsx` receives the misconception tag and calls `resolveDynamicFeedbackProps(tag)` — this function maps each of the 12+ spherical mirror misconception tags to a specific `flawedModel` object `{ v, hPrime, isVirtual }` representing the exact wrong mental model
3. `DynamicMirrorFeedback.jsx` renders both: the correct physics (green rays, correct image) and the flawed model (red rays, wrong image position) side by side on the same SVG canvas

`DynamicMirrorFeedback` handles 6 ray path cases internally: parallel-to-focus, focus-to-parallel, center-of-curvature, virtual extension (behind mirror), convex diverging, and the special case where `uDistance <= focalLength` (switches from focus ray to center-of-curvature ray). The component uses the midpoint arrowhead trick — each ray is split into two `<line>` elements with `markerEnd` on the first half to place the arrowhead at the midpoint.

---

### Frontend: Curriculum Flow

`App.jsx` controls all stage progression via a `stages` string array:
```
pmTell → pmShow → smTell → smShow → smQuiz →
smRulesTell → smRulesShow → smFormationTell → smFormationShow →
tell1 → show1 → try1 → tell2 → show2 → try2 → test
```

The active `caseId` for `ImageFormationLesson` is stored in `activeCaseId` state. Valid case IDs are defined in `MirrorPhysicsEngine.js`'s `getMirrorCaseData()` function (e.g. `"concave-beyond-c"`, `"concave-at-c"`, `"concave-between-f-p"`).

Zustand store at `frontend/src/state/sessionStore.js` holds: current topic ID, selected topics, progress per topic. State persists to localStorage.

---

### Backend: Import Pattern

The backend uses a consistent try/except import pattern throughout because modules are run both from the `backend/` directory and from the repo root:

```python
try:
    from database.models import get_student
except ImportError:
    from backend.database.models import get_student
```

The content agent and adaptation agent use `importlib.util` for dynamic loading from hyphenated directory names (`content-agent/`, `adaptataion-agent/`) that Python can't import directly.

---

### Backend: Request Flow for `/submit-answers`

This is the main endpoint — it does the most work:

1. Evaluates each answer, extracts misconception tag from `misconception_map[selected_index]`
2. If tag is generic (`general_concept_gap`), calls `classify_misconception_tag()` via Gemini to infer a specific tag semantically
3. Coerces tag to allowed values for that topic via `coerce_misconception_tag(tag, topic)` from the misconception catalog
4. `Counter(tags).most_common(1)` → `main_misconception`
5. If topic is `laws_of_reflection`, `spherical_mirrors`, or `refraction`: calls `ContentAgent.generate()` in parallel threads (ThreadPoolExecutor, max 5 workers) for each unique wrong tag
6. `ContentAgent.generate()` → calls `ContentAgentLLMService.get_explanation()` (Gemini → Mistral fallback → DB cache) + `pick_svg_template(topic, tag)` + `pick_svg_variant(tag)`
7. Logs behavior, updates student level and topic resolution in DB
8. Returns `{ main_misconception, level, reason, svg_component, svg_variant, question_feedback[] }`

---

### Backend: LLM Fallback Chain

`ContentAgentLLMService` (in `backend/content-agent/llm_service.py`):
- Primary: Gemini 3.5-Flash with JSON output mode, temperature 0.3–0.4
- Fallback: Mistral-Small, same prompt
- Final fallback: `explanation_cache` table in PostgreSQL, then `misconception_catalog` metadata

`feedback_trigger.py` in the adaptation agent follows the same pattern for generating misconception reasoning.

---

### Backend: Misconception System

`backend/database/misconception_catalog.py` is the source of truth for all 30+ misconception tags. Key functions:
- `topic_key_for(topic_string)` — maps free-text topic to a canonical key (`laws_of_reflection`, `spherical_mirrors`, `refraction`, `plane_mirror`)
- `get_allowed_misconception_tags(topic)` — returns valid tags for a topic
- `coerce_misconception_tag(tag, topic)` — validates and normalizes a tag; falls back to `general_concept_gap`
- `get_misconception_metadata(tag)` — returns `{ title, explanation, focus_area }` for DB-fallback explanations

The tag-to-topic mapping is the `TAG_TO_TOPIC_KEY` dict at the top of `misconception_catalog.py`.

---

### What Is Not Yet Built

The following exist **only in architecture docs**, not in code:
- **3-attempt system** — `adaptation_agent.py` is a 15-line stub that only returns `"targeted"` or `"mixed"` questions. No attempt counting, no strategy escalation per attempt, no graceful exit.
- **Persona/Empathy Engine** — planned in `task.md`: onboarding (background: urban/rural, confidence, interest) → different LLM analogies per persona. Not built.
- **Session state machine** — the 12-state machine in `COMPLETE_ARCHITECTURE_FINAL.md` does not exist in code.
- **Bridge checkpoint** — Reflection → Refraction gate. `bridge_controller.py` is an 8-line stub.
- **DynamicMirrorFeedback in main lesson flow** — `task.md` Part 3: wiring this component into `App.jsx` as a "Try It Yourself" stage after `smFormationShow` is incomplete.

## Workflow: Plan Before Building

Do not make any code changes until you have 95% confidence in what needs to be built. 
Ask follow-up questions until you reach that confidence — do not guess or assume.

Before any non-trivial task (new feature, wiring a stub into the main flow, touching 
the physics engine or misconception catalog):
1. Enter Plan Mode (`/plan` or Shift+Tab twice) and map out the approach first.
2. Cross-check the plan against the "What Is Not Yet Built" section above — if the 
   plan assumes something exists that's actually a stub (e.g. adaptation_agent.py, 
   bridge_controller.py), flag that explicitly before proceeding.
3. Only exit Plan Mode and write code once the plan is approved.

Skip Plan Mode only for trivial, single-file, easily-reversible edits.