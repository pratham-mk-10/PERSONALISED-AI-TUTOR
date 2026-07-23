# Tech Stack Interview Prep — Personalised AI Tutor

Verified directly against code on 2026-07-15. Every claim below traces to a file path.
**Do not quote the root `README.md`** — it's an aspirational doc written before the build
started (says OpenAI gpt-4o-mini, ElevenLabs voice, a `session/start` + `quiz/submit` API,
tables like `users`/`quiz_attempts`/`content_cache`). None of that is what's actually in
the code. If an interviewer skims your repo and asks about something from the README,
say "that was the original plan doc, we pivoted during the build" and point to what's below.

---

## 1. One-line pitch

An adaptive Class 10 NCERT physics tutor (Light: Reflection & Refraction) that detects the
**exact misconception** behind a wrong answer — not just that the answer was wrong — and
responds with a deterministic, physically-correct visual correction plus an LLM-generated
explanation that changes strategy across 3 attempts.

## 2. The one architectural decision to lead with

**We tried LLM-generated SVG and rejected it.** Early on we asked Gemini to directly emit
ray-diagram SVG/coordinates. It failed at spatial reasoning — rays that don't converge at
the focal point, mirror curves that are algebraically wrong, overlapping labels. LLMs are
good at semantics, bad at geometry.

**Fix:** split responsibilities strictly.
- **Frontend physics engine** (hand-written React + exact algebra) does 100% of spatial/visual
  rendering — mirror formula, Snell's law, Bézier mirror curves, ray paths. Deterministic, always
  correct, zero LLM involvement.
- **LLM** is restricted to text-only semantic tasks: explanation generation, misconception
  classification from free-text, descriptive-answer grading.

This is the single most defensible engineering decision in the project — it shows you
understood a generative model's failure mode and designed around it instead of prompting harder.

---

## 3. Component-by-component breakdown

### 3.1 Frontend

| Choice | What | Why | Alternatives considered / rejected |
|---|---|---|---|
| Framework | React 18.3 | Component tree maps naturally onto SVG scene graphs (each ray/label/arc is a component); team already knew it | Vue/Svelte — not rejected explicitly, just never on the table given team's existing React experience |
| Build tool | Vite 5 | Instant HMR while iterating on animation timing (critical — you're eyeballing physics against a `progress` slider), zero-config ESM | CRA — slower HMR, effectively deprecated |
| State | Zustand 5 | Single global store (`sessionStore.js`) for user session, current topic, per-topic progress, `retestBias`. No providers/reducers boilerplate; persists to `localStorage` manually via a thin wrapper | Redux — too much ceremony for a store this small; Context API alone — re-render cost across the deeply nested SVG tree |
| Data fetching | Native `fetch` wrapped in `frontend/src/services/api.js`, **no axios/react-query** | Every backend call is a simple POST/GET with JSON — no need for interceptors or a cache layer given how few endpoints exist (13) | axios was in the original architecture doc, never actually added — deliberate simplification, not an oversight |
| SVG rendering | Raw JSX `<svg>` / `<path>` / `<line>` elements, no charting/animation library | Full control over exact coordinate math per frame; a library would fight the "must be pixel/physics accurate" requirement | react-spring / framer-motion — considered for tweening but rejected because our animations are driven by a physics `progress` value (0→1), not spring physics; d3 — overkill, we don't need its DOM-binding/scale machinery, just coordinate math |
| Testing | Vitest + @testing-library/react, jsdom env | Vite-native, zero extra config vs Jest | Jest — would need separate Babel/ts-jest config Vite doesn't need |
| TTS/audio for lessons | Backend-generated MP3 via `/api/tts` (see 3.7), played client-side | Needed synced narration for Tell/Show lesson stages | Client-side Web Speech API — rejected: voice quality/consistency across browsers is bad; ElevenLabs — too expensive/complex for a capstone budget |

**Frontend architecture specifics:**
- `frontend/src/svg-engine/shared/PhysicsEngine.jsx` — pure math: `mirrorFormula(u,f)`, `snellsLaw()`,
  `lensFormula()`, `magnification()`, `describeArc()`, `lerp()`, `polarToCartesian()`, `clamp()`.
  Every animation imports from here — single source of truth for the physics.
- `frontend/src/svg-engine/reflection/spherical-mirrors/MirrorPhysicsEngine.js` — a class,
  `calculateImage(mirrorType, focalLength, objectDistance, objectHeight)` +
  `getLogicalCoordinates()`. Enforces a strict Cartesian sign convention (object always left,
  concave f negative, convex f positive) — this is the kind of detail an examiner-style
  interviewer will probe ("how do you know your convex mirror math isn't just convex-looking").
- Mirror curves are literal quadratic Bézier: `x(t) = (1-t)²x0 + 2t(1-t)xc + t²x1`, and hatch
  marks are generated parametrically along that same curve — not just decoration, they're computed
  from the same math as the mirror surface so they can't visually desync from it.
- `AnimationPlayer` / `AudioAnimationPlayer` (`svg-engine/shared/`) drive everything off a single
  `progress` value passed down to render functions — this is what makes scrubbing/replay possible
  for free, since state is a pure function of `progress`, not accumulated animation state.
- Curriculum flow is a flat stage-string array in `App.jsx` (`pmTell → pmShow → smTell → ... → test`),
  not a formal state machine (a 12-state machine exists **only in the architecture doc**, not in code
  — don't claim it's implemented).

### 3.2 Backend

| Choice | What | Why | Alternatives |
|---|---|---|---|
| Framework | FastAPI | Async-native, automatic OpenAPI docs at `/docs` for free (useful when 4 people are integrating against the same API), Pydantic-native request/response validation | Flask — no built-in validation/async without extra libs; Django — far too heavy for a stateless API with no admin/ORM need |
| Server | Uvicorn | Standard ASGI server for FastAPI | — |
| Validation | Pydantic v2 | Used to validate every LLM JSON response before trusting it (see `DescriptiveEvaluation` schema in `descriptive_evaluator.py`) — this is a reliability mechanism, not just request parsing | — |
| HTTP to LLMs | Raw `urllib.request` (content-agent) / `requests` (question-gen) — **no OpenAI/Google SDK** | Deliberate minimal-dependency choice; the API surface used (one POST, JSON in/out) doesn't justify a full SDK | google-generativeai SDK — considered unnecessary overhead for 2 endpoints |
| Import pattern | try/except dual-path imports (`from database.models import X` / `from backend.database.models import X`) everywhere | Backend is run both from repo root and from `backend/` depending on dev vs deploy context — this is a real (if inelegant) fix for that, not an accident | — |
| Hyphenated dirs (`content-agent/`, `adaptataion-agent/`) | Loaded via `importlib.util.spec_from_file_location` instead of normal `import` | Python identifiers can't contain hyphens, so these directories can't be imported as packages normally; renaming them was apparently never done | Rename dirs to underscores — the actual "correct" fix, hasn't been applied. Be ready to admit this is a wart if asked. |
| CORS | `allow_origins=["*"]` | Fine for a capstone demo; **not production-safe** — say this proactively if asked about security | — |

**Full REST surface** (`backend/orchestrator/routes.py`, 13 endpoints — this is the real list, not README's fictional one):

| Method | Path | Purpose |
|---|---|---|
| POST | `/get-questions` | Fetch questions from the static DB question bank |
| POST | `/generate-questions` | LLM-generate MCQs on the fly for a topic (question-gen agent) |
| POST | `/generate-misconception-quiz` | Weighted retest quiz targeting a student's known-weak misconception tags |
| POST | `/submit-answers` | **The main endpoint** — evaluate answers, infer misconception, trigger content generation, log behavior (see 3.5 below) |
| POST | `/evaluate` | Lower-level MCQ evaluation |
| GET | `/descriptive-questions/{topic}` | Fetch descriptive (free-text) questions for a topic |
| POST | `/eval/descriptive` | 3-stage descriptive-answer grading pipeline |
| GET | `/student/{student_id}` | Student profile |
| GET | `/student/{student_id}/memory` | Cross-session weakness summary — powers the "Welcome back, you struggled with X" dashboard banner |
| GET | `/debug/allowed-misconceptions` | Debug helper |
| POST | `/misconception-reason` | On-demand LLM explanation for a specific misconception tag |
| POST | `/submit-numeric-answer` | Logs numeric-input question attempts |
| GET | `/api/tts` | Streams MP3 audio via edge-tts for a text string |

### 3.3 Database

| Choice | What | Why | Alternatives |
|---|---|---|---|
| Engine | PostgreSQL | Relational fit for the actual data shape: questions ↔ options ↔ misconception tags is a proper many-to-many, needs joins and foreign keys | MongoDB — no natural need for schema flexibility here, and misconception tagging is inherently relational; SQLite — fine for local dev but no path to a real hosted deployment |
| Hosting | Railway (managed Postgres) | Free/cheap tier, zero ops for a 4-person student team, `DATABASE_URL` env-var integration is trivial | Supabase — comparable option, Railway was just the team's pick; self-hosted — no time budget for a capstone |
| Driver | `psycopg2-binary`, raw SQL (no ORM) | Team judged the query surface small/stable enough that SQLAlchemy's abstraction wasn't worth the learning curve under a deadline | SQLAlchemy — deliberately skipped |
| Migrations | **None** — tables are created idempotently via `ensure_*_table()` / `CREATE TABLE IF NOT EXISTS` calls run at import/seed time | No migration framework (Alembic etc.) needed at this schema stability/team size; be upfront that this wouldn't scale to a real multi-environment production setup | Alembic — the "correct" answer if asked "how would you do this in production" |
| Connection | `backend/database/connection.py` — accepts both `postgres://` and `postgresql://` URL schemes, SSL via `DB_SSLMODE` env var, falls back to discrete `DB_HOST/DB_NAME/DB_USER/DB_PASSWORD` vars for local dev | Railway hands you a `postgres://` URL; psycopg2 only accepts `postgresql://` — this one-line normalization is a real gotcha worth mentioning if asked about deployment friction | — |

**Actual tables in code** (two separate schema-creation paths — worth knowing both exist):
- From `backend/database/seed_db.py` (`ensure_schema()`): `questions`, `options`,
  `misconception_tags`, `question_misconceptions`, `topic_misconceptions`
- From `backend/database/models.py`: `student_progress`, `student_behavior_events`,
  `descriptive_questions`, `flagged_evaluations`, plus an `explanation_cache` table referenced
  by `content-agent/llm_service.py` (subtopic + tag + attempt → cached explanation text)

No auth layer — `student_id` is an unauthenticated client-supplied string. No vector store,
no queue/message broker. If asked "why no auth" — honest answer: out of scope for a capstone
proving the adaptive-tutoring concept, not a technical limitation.

### 3.4 LLM layer — the fallback chain (used identically in 3 places)

Every LLM call in this codebase follows the same pattern:

```
Gemini 2.5-Flash (primary)
   ↓ on any exception (timeout, rate limit, malformed response)
Mistral-Small (fallback, same prompt reformatted for Mistral's API shape)
   ↓ on any exception
DB cache / static fallback question pool / canned text (final fallback — never a raw 500 to the user)
```

- **Gemini 2.5-Flash**: called via raw REST — `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=...`. Chosen for: fast enough for interactive quiz-generation latency, generous free tier, native `responseMimeType: application/json` mode so we don't have to regex-strip markdown fences half the time (we still defensively strip them — Gemini doesn't always honor the mode).
- **Mistral-Small**: called via `POST https://api.mistral.ai/v1/chat/completions`. Chosen as the fallback specifically because it's a **different provider** — if Gemini has an outage or you hit a per-key rate limit, a same-provider fallback (e.g. Gemini Flash → Gemini Pro) doesn't help; a different vendor does.
- Both calls use `temperature=0.3–0.4` for explanation/question generation (some creative variance
  desired) and `temperature=0.0` for descriptive-answer grading (deterministic, reproducible scoring).
- **Why no SDK**: the entire integration is "POST JSON, get JSON back." A full SDK (google-generativeai, mistralai) buys nothing here and adds a dependency + version-pinning surface for 2 call sites. This was a deliberate lightweight choice — be ready to defend it, not apologize for it, if an interviewer pushes on "why didn't you use the official SDK."
- **Where each is used:**
  - `backend/content-agent/llm_service.py` — misconception explanations
  - `backend/assesment_agent/question_gen_llm_service.py` — MCQ generation
  - `backend/assesment_agent/descriptive_evaluator.py` — descriptive-answer grading

### 3.5 Assessment Agent (MCQ + descriptive evaluation)

- **MCQ generation** (`question_gen.py` + `question_gen_llm_service.py`): prompt is built with
  a hard-coded `SYLLABUS_SCOPE` string (NCERT Ch. 9 Light only) plus the full allowed-misconception
  list for the topic, and explicitly instructs the LLM to make sure every wrong option maps to a
  real misconception tag so no distractor is "wasted." Post-generation, the code does real work
  the LLM can't be trusted to do reliably itself:
  - Dedup near-duplicate questions via **Jaccard similarity on stop-word-filtered token sets**
    (`_is_similar_question`, threshold 0.72) — catches paraphrases, not just exact string matches.
  - Rejects questions with **semantically-equivalent answer options** (e.g. "angle of reflection"
    vs "angle between the reflected ray and normal" counted as the same answer under different
    wording) via a hand-built equivalence-key function.
  - Enforces taught/untaught concept scoping for lesson-embedded quizzes — will actively drop a
    question if it touches a concept the video hasn't covered yet, with hard-coded phrase
    blocklists for known "bleeding" concepts (e.g. blocks `"1/v"`, `"m ="` phrases if magnification
    hasn't been taught).
  - Shuffles options and remaps the misconception_map indices to match (so option order isn't
    LLM-biased toward "correct answer is always C").
  - Sanitizes every returned misconception tag against the allowed set for that topic via
    `coerce_misconception_tag` — an LLM hallucinating a tag name silently falls back to
    `general_concept_gap` rather than corrupting downstream logic.
  - If the LLM call/parse fails outright, falls back to a **hand-written static question pool**
    per topic (`_fallback_response`) — the quiz never just breaks.

- **Descriptive evaluation** (`descriptive_evaluator.py`) — this is the project's own reliability-engineered
  grading pipeline (not to be confused with "NegGuard," a separate repo with similar naming):
  1. **Smart Gate** (no LLM call): rejects answers under 4 words, or answers with zero keyword
     overlap with the required rubric keywords. Cheap, fast, filters junk before spending an LLM call.
  2. **Chain-of-Thought LLM engine**: `temperature=0`, JSON mode, explicit system-prompt instructions
     to solve two named failure modes:
     - **"Lexical gap" problem** — don't penalize a student for saying "light smashes together"
       instead of "rays converge"; grade the physics, not the vocabulary.
     - **"Negation problem"** — polar words (`always`/`never`/`equal`/`opposite`) get explicit
       scrutiny so a sentence that inverts the correct physics doesn't score well just because it's
       lexically close to a correct answer.
     - 3 hand-written few-shot anchors (exemplary / partial / inverted-negation) are included in
       every prompt to calibrate scoring.
     - Weighted rubric: understanding 70%, completeness 25%, keyword usage 5% — deliberately weights
       *understanding* over vocabulary, matching the lexical-gap fix above.
  3. **Reliability layer**: up to 2 retries on parse/validation failure; every response is validated
     against a Pydantic schema (`DescriptiveEvaluation`) before being trusted; if both attempts fail,
     the raw response + error is written to a `flagged_evaluations` table for human review instead of
     silently returning garbage or a 500 to the student.

### 3.6 Content / Personalized-Explanation Agent (Pratham's component)

`backend/content-agent/content_agent.py` orchestrates: pick explanation strategy → call LLM for
text → pick an SVG template + variant to render. Two picking functions worth knowing cold since
they're pure logic, not LLM calls — deterministic and demoable:
- `pick_svg_template(topic, tag)` — maps a misconception tag (or, failing that, topic keywords)
  to one of a fixed set of animation component names.
- `pick_svg_variant(tag)` — normalizes/validates the tag against known tag sets per lesson area
  (reflection, plane mirror, spherical mirror basics/rules/image-formation), defaulting to
  `general_concept_gap` if unrecognized.

Attempt-aware explanation strategy (`get_explanation()`):
- **Attempt 1**: no LLM call at all — returns a canned "Try again and observe the diagram carefully."
  This is a deliberate cost/latency optimization: don't burn an LLM call before the student has even
  seen a visual correction.
- **Attempt 2+**: builds a full prompt (`prompt_builder.py`) grounded in the student's actual wrong
  answer/question text, calls the Gemini→Mistral chain, validates length > 40 chars, falls back to a
  templated string built from the misconception tag name if validation fails.
- Optional DB cache layer keyed on `(subtopic, misconception_tag, attempt)` exists in the service but
  is not yet wired end-to-end from `content_agent.generate()` — accurate answer if asked "is caching
  live": the mechanism exists, the plumbing to actually use it by default is incomplete.

### 3.7 TTS

`GET /api/tts?text=...&voice=en-US-ChristopherNeural` streams MP3 via **edge-tts** (an
unofficial Python wrapper around Microsoft Edge's browser TTS service — free, no API key). Used
to pre-narrate Tell/Show lesson stages, synced against the same `progress` value driving the
visual animation via timestamped audio-step arrays (`{ progress, text }[]`).

### 3.8 Adaptation Agent — the 3-attempt loop

`backend/adaptataion-agent/adaptation_agent.py` — `adapt_after_submission()` branches purely on
`attempt_number` and whether a misconception was detected:
- No misconception → `positive_reinforcement`, regular next-round questions.
- Attempt 1 → `visual_only` strategy, no LLM call (matches 3.6's attempt-1 shortcut).
- Attempt 2 → `llm_explanation` strategy, targeted questions fetched by misconception tag
  (`fetch_by_misconception`, falls back to generic topic questions if none tagged).
- Attempt 3+ → `simplify_and_redirect`, `should_redirect_to_lesson: True` — signals the frontend
  to bail the student out of the quiz loop back into the lesson.

Server-side attempt counting (`increment_topic_attempt`/`reset_topic_attempt` in `models.py`) —
deliberately not trusted to the client, so a student can't reset their own attempt count by
refreshing.

Two sibling files, `decision_engine.py` and `misconception_refiner.py`, are dead code — 4-5 lines
each, superseded by `adaptation_agent.py`, nothing imports them. `bridge_controller.py` (the
planned Reflection→Refraction gate) is also dead — 6 lines, unwired. Know these are stubs; don't
claim the bridge checkpoint is built if asked.

### 3.9 Misconception system (the backbone connecting every agent)

`backend/database/misconception_catalog.py` + `shared/misconception_tags.json` (**35 tags**,
runtime source of truth — not "27" or "30+", verify with `json.load` if you need to re-check):
25 spherical-mirror tags, 5 plane-mirror, 4 laws-of-reflection, 1 generic fallback.

Key functions every agent calls through:
- `topic_key_for(topic_string)` — free-text topic → canonical key
- `get_allowed_misconception_tags(topic)` — valid tag set for a topic (used to sanitize LLM output)
- `coerce_misconception_tag(tag, topic)` — validates/normalizes, falls back to `general_concept_gap`
- `summarize_persistent_weaknesses()` — powers cross-session memory (3.10)

### 3.10 Cross-session memory (a strong, under-sold talking point)

`GET /student/{id}/memory` → `summarize_persistent_weaknesses()` ranks a student's unresolved
misconceptions by weighted frequency across **all past sessions**, flags the worst as
`severity: high`. Dashboard shows "Welcome back, you struggled with X — Retest now." Clicking it
sets `retestBias` in the Zustand store, which **changes the next quiz-generation prompt itself**
— `severity: high` asks the LLM for 3-of-5 questions on that specific misconception,
`severity: normal` asks for 1-2. This is a closed personalization loop that persists and adapts
*across* sessions, not just within one — worth leading with if asked "what's the most technically
interesting thing you built."

### 3.11 Concurrency

`/submit-answers` (`routes.py`) is a 3-pass structure:
1. Sync fast pass — evaluate all answers, extract misconception tags.
2. `ThreadPoolExecutor(max_workers=5)` — parallel pass batching every unique generic-tag LLM
   classification concurrently, so 5 different wrong answers don't serialize 5 sequential LLM
   round-trips.
3. Sync finalize pass — pick `main_misconception` via `Counter.most_common(1)`, log behavior,
   update student level/topic resolution, return response.

This is explicit latency engineering, not accidental — worth mentioning if asked about
performance under a multi-question submission.

---

## 4. What is genuinely NOT built (say this proactively, don't get caught)

| Feature | Status |
|---|---|
| Persona/Empathy Engine (background/confidence/interest → different LLM analogies) | Not built. `NameEntry.jsx` only captures a name. The single most differentiating *planned* feature that isn't real yet. |
| Refraction Tell/Show lesson | Not built — quiz-only, no lesson stages. |
| Bridge checkpoint (Reflection→Refraction gate) | Dead 6-line stub, unwired. |
| Explanation cache (end-to-end) | Mechanism exists in `llm_service.py`, not exposed/used by `content_agent.generate()`. |
| `decision_engine.py` / `misconception_refiner.py` | Dead code, superseded. |
| Automated backend tests | None — `backend/scratch/test_*.py` are manual print scripts, not pytest/CI. |
| Frontend tests | 1 Vitest file, 2 cases, tests only one feedback component. |
| Real student outcome data | Zero — no learning-gain numbers exist anywhere. Don't cite a number you haven't measured. |
| Auth | None — `student_id` is an unauthenticated client string. |

---

## 5. Likely interview questions and where to point

- **"Walk me through what happens when a student answers wrong."** → 3.11 concurrency flow +
  3.8 adaptation agent branching + 3.6 content agent explanation generation, in that order.
- **"Why not just have the LLM generate the SVG/diagram directly?"** → Section 2, verbatim.
- **"How do you handle LLM unreliability?"** → 3.4 fallback chain + 3.5's Pydantic validation /
  retry / flagged-evaluations pattern. This is your strongest "production thinking" answer.
- **"Why Postgres, not Mongo?"** → 3.3 — relational shape (questions/options/misconceptions is
  real many-to-many), not just "what we knew."
- **"What would you change for production?"** → auth (currently none), migrations (currently
  `CREATE TABLE IF NOT EXISTS`, would move to Alembic), CORS `*` → allowlist, rename hyphenated
  dirs so `importlib.util` hacks aren't needed, wire the explanation cache end-to-end.
- **"What's the most interesting technical problem you personally solved?"** (your component) →
  the Bézier mirror-curve math + strict Cartesian sign convention in `MirrorPhysicsEngine.js`, or
  the `progress`-driven animation architecture that makes scrubbing free. Have the exact formula
  memorized (section 3.1).
