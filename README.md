# 🔬 Personalised AI Tutor
> An Agentic AI-powered adaptive learning system for Class 10 NCERT — Light: Reflection & Refraction

---

## 📌 Project Overview

A 3-agent AI system that detects **why** a student fails — not just **that** they fail — and responds with targeted interactive visual explanations that change meaningfully on each attempt.

**Instead of:** "Wrong answer. Try again."

**Our system does:** Detects the exact misconception → shows a red/green visual correction → regenerates a completely different explanation + interactive diagram.
## 🎤 AI Voice Integration

We use pre-generated AI narration (via ElevenLabs) 
to synchronize audio explanations with SVG animations.

This ensures:
- smooth playback (no latency)
- precise timing with visuals
- better learning experience

---

## 🧠 3-Agent Architecture

| Agent | Role |
|-------|------|
| **Assessment Agent** | Selects questions, scores answers, classifies student level, detects misconception tag |
| **Content Generation Agent** | Picks explanation strategy, selects SVG template, calls LLM for text |
| **Adaptation Agent** | Decides what happens after every quiz — regenerate, refine, bridge, or exit |
| **Orchestrator** | Coordinates all 3 agents, manages StudentSession state |

---

## ✨ Key Features

- 🎯 **Misconception Detection** — identifies exactly which concept the student misunderstands
- 🎮 **Interactive SVG Diagrams** — angle slider, draggable ray, lens/object position control
- 🔴🟢 **Visual Mistake Feedback** — wrong answer triggers instant red/green diagram overlay
- 🔁 **Smart Regeneration** — 3 attempts, each with completely different explanation + visual
- 📊 **Progress Dashboard** — mastery tracking, misconception log, completion status
- 🌉 **Difficulty Bridge** — connecting checkpoint between Reflection and Refraction

---

## 👥 Team & Ownership

| Name | Primary Responsibility | Folder |
|------|----------------------|--------|
| **Pratham** | SVG Engine + Content Agent | `svg-engine/` + `backend/content-agent/` |
| **Rajat** | Frontend + Orchestrator | `frontend/` + `backend/orchestrator/` |
| **Rachan** | Assessment Agent + Question Bank | `backend/assessment-agent/` |
| **Pavan** | Adaptation Agent | `backend/adaptation-agent/` |

---

## 📐 Architectural Decisions & Engineering Philosophy

To build a production-grade educational tool, we had to make critical engineering decisions regarding where to use AI and where to use deterministic code.

### 1. The "Hybrid" SVG Architecture vs. Zero-Shot Generation
Initially, we attempted to use the Gemini LLM to dynamically generate raw SVG React components at runtime based on student errors. 

**The Problem:** We discovered that while LLMs excel at semantic logic (understanding *why* a student is wrong), they fundamentally lack reliable spatial reasoning. Zero-shot generation resulted in "spherical aberration" (rays missing the focal point by a few pixels), overlapping text boxes, and mathematically incorrect mirror curves.

**The Hybrid Solution:** We abandoned raw LLM code generation and built a **Deterministic Physics Engine** in React. 
- **Frontend (The Engine):** We hand-coded mathematically perfect, strictly-timed SVG animations using exact algebraic paraxial intersection math and Bezier curves. This guarantees 100% physical accuracy for every lesson.
- **Backend (The Cognitive Layer):** The LLM is restricted to its core strength. When a student makes a mistake, the LLM outputs a strict JSON object containing a pedagogical explanation and the exact `(x1, y1)` coordinates of the student's error. The frontend engine then cleanly overlays this data on top of the perfect baseline.

*Why Interviewers Should Care:* This demonstrates an understanding of the **limitations of Generative AI** and the ability to design system architectures that mitigate those weaknesses using traditional, robust engineering patterns.

---

## 🗂️ Folder Structure

```
PERSONALISED-AI-TUTOR/
│
├── frontend/                          # 🎨 RAJAT
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Layout.jsx
│   │   │   │   └── Slider.jsx
│   │   │   ├── content/
│   │   │   │   ├── ContentPage.jsx
│   │   │   │   └── SVGRenderer.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── MasteryCard.jsx
│   │   │   │   └── MisconceptionLog.jsx
│   │   │   └── quiz/
│   │   │       ├── QuizCard.jsx
│   │   │       └── QuizPage.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── Session.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── state/
│   │   │   └── sessionStore.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── svg-engine/                        # 🔥 PRATHAM
│   ├── reflection/
│   │   ├── AngleSlider.jsx
│   │   ├── DraggableRay.jsx
│   │   ├── ReflectionAnimation.jsx
│   │   ├── ReflectionFeedback.jsx
│   │   └── ReflectionStepByStep.jsx
│   ├── refraction/
│   │   ├── LensAnalogy.jsx
│   │   ├── LensObjectDrag.jsx
│   │   ├── LensStepByStep.jsx
│   │   ├── RefractionAnimation.jsx
│   │   └── RefractionFeedback.jsx
│   ├── shared/
│   │   ├── FeedbackOverlay.jsx
│   │   ├── PhysicsEngine.js
│   │   └── SVGUtils.js
│   └── index.js
│
├── backend/
│   ├── assessment-agent/              # 📚 RACHAN
│   │   ├── question_bank/
│   │   │   ├── reflection_questions.json
│   │   │   └── refraction_questions.json
│   │   ├── evaluator.py
│   │   ├── level_classifier.py
│   │   ├── misconception_detector.py
│   │   ├── question_selector.py
│   │   └── tags.json
│   │
│   ├── content-agent/                 # 🔥 PRATHAM
│   │   ├── prompts/
│   │   │   ├── attempt1_prompt.txt
│   │   │   ├── attempt2_prompt.txt
│   │   │   └── attempt3_prompt.txt
│   │   ├── content_agent.py
│   │   ├── llm_service.py
│   │   ├── strategy_selector.py
│   │   ├── svg_template_picker.py
│   │   └── svg_validator.py
│   │
│   ├── adaptation-agent/              # ⚡ PAVAN
│   │   ├── adaptation_agent.py
│   │   ├── bridge_controller.py
│   │   ├── decision_engine.py
│   │   ├── feedback_trigger.py
│   │   └── misconception_refiner.py
│   │
│   ├── orchestrator/                  # 🔗 RAJAT
│   │   ├── flow_controller.py
│   │   ├── routes.py
│   │   ├── server.py
│   │   └── session_manager.py
│   │
│   ├── database/
│   │   ├── connection.py
│   │   ├── models.py
│   │   ├── queries.py
│   │   └── seed_db.py
│   │
│   └── requirements.txt
│
├── shared/                            # 🔗 ALL 4 — no solo edits
│   ├── api_contracts.md
│   ├── constants.py
│   └── misconception_tags.json
│
├── docs/
│   ├── FINAL_Architecture.docx
│   └── SVG_Animation_Strategy.docx
│
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚙️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | React (Vite) | Component-based, clean SVG embedding |
| Backend | FastAPI (Python) | Lightweight, async, clean REST |
| Database | PostgreSQL | Tag-based queries, simple and reliable |
| LLM | OpenAI gpt-4o-mini | Text explanations + SVG annotation |
| SVG Engine | Pre-built JS/SVG templates | Reliable, interactive, fallback-safe |
| Interactivity | Vanilla JS (SVG events) | Slider, drag, lens — no extra library |

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- Python 3.11+
- PostgreSQL 15+
- Git

---

### 1. Clone the Repo

```bash
git clone https://github.com/YOUR_USERNAME/PERSONALISED-AI-TUTOR.git
cd PERSONALISED-AI-TUTOR
```

---

### 2. Environment Variables

```bash
cp .env.example .env
```

Fill in your `.env`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/physics_tutor
OPENAI_API_KEY=sk-your-key-here
ENV=development
```

> ⚠️ Never commit your `.env` file — it is already in `.gitignore`

---

### 3. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Create database
createdb physics_tutor

# Create tables
python database/models.py

# Seed question bank
python database/seed_db.py

# Start backend
uvicorn orchestrator.server:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

---

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 🌿 Git Workflow

### Branch Naming

```
main                  → stable only, no direct pushes ever
dev                   → integration branch, merge here first
feature/svg-engine    → Pratham
feature/frontend      → Rajat
feature/assessment    → Rachan
feature/adaptation    → Pavan
fix/bug-name          → bug fixes
```

### Daily Workflow

```bash
# 1. Always pull latest dev before starting
git checkout dev
git pull origin dev

# 2. Switch to your feature branch
git checkout feature/your-branch

# 3. Work, then commit
git add .
git commit -m "feat: your message here"

# 4. Push
git push origin feature/your-branch

# 5. Open Pull Request into dev on GitHub
#    Get at least 1 teammate to review before merging
```

### Commit Message Format

```
feat:      new feature added
fix:       bug fixed
refactor:  code restructured, no behaviour change
docs:      documentation updated
chore:     setup, config, dependencies
```

### Merging Rules

- ❌ Never push directly to `main` or `dev`
- ✅ Always PR into `dev` first
- ✅ At least 1 teammate reviews before merge
- ✅ Only merge `dev → main` when fully tested end-to-end

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| users | Student accounts |
| quiz_attempts | Every quiz, score, attempt number, misconception tag |
| misconceptions | Detected + refined misconception per student |
| progress | Mastered topics, current topic, bridge status |
| questions | Full question bank with misconception tags |
| content_cache | Cached LLM explanations + SVG per tag + attempt |
| adaptation_log | Every Agent 3 decision logged with reason |

---

## 🔌 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/session/start` | Create session, get diagnostic quiz |
| POST | `/quiz/submit` | Submit answers, get level + misconception tag |
| POST | `/content/get` | Get explanation + SVG for given attempt |
| POST | `/adapt/decide` | Get next action after quiz result |
| GET | `/feedback/visual` | Get red/green SVG overlay |
| GET | `/progress/:userId` | Get mastery + misconception log |
| GET | `/checkpoint/:userId` | Get bridge quiz (Reflection → Refraction) |
| POST | `/eval/descriptive` | [OPTIONAL] LLM evaluates free-text answer |

---

## 🧠 Misconception Tags Reference

| Tag | Meaning |
|-----|---------|
| `angle_from_surface` | Measures angle from mirror, not normal |
| `normal_orientation` | Draws normal parallel to mirror |
| `reflection_not_equal` | Thinks reflected angle differs from incident |
| `refraction_direction` | Bends ray wrong side entering dense medium |
| `sign_convention_error` | Uses positive u for object on left of lens |
| `image_side_wrong` | Places image on wrong side of lens |

---

## ⚠️ Common Issues & Fixes

**PostgreSQL connection refused**
```bash
sudo service postgresql start    # Linux
brew services start postgresql   # Mac
```

**OpenAI API error**
```
Check .env — OPENAI_API_KEY must have no extra spaces or quotes
```

**Frontend cannot reach backend**
```
Ensure backend is running on port 8000
Check CORS is enabled in server.py for localhost:5173
```

**SVG not rendering**
```
Check browser console for errors
Sanitize SVG with DOMPurify before dangerouslySetInnerHTML
```

---

## 🤝 Contribution Rules

- ❌ Never edit inside someone else's folder — raise a PR and discuss
- ❌ Never commit `.env`, `venv/`, or `node_modules/`
- ✅ Any change to `shared/` needs all 4 teammates to agree first
- ✅ Test your feature locally before opening a PR
- ✅ Write clear PR descriptions — what you built and how to test it

---

## 📞 Who to Contact for What

| Issue | Contact |
|-------|---------|
| SVG diagram bugs, animation issues | Pratham |
| Frontend UI bugs, routing issues | Rajat |
| Question bank, scoring, level classification | Rachan |
| Adaptation flow, agent decisions | Pavan |
| API endpoints, orchestration bugs | Rajat |

---

*Capstone Project 2025-26 — PES University*
*Class 10 NCERT Physics — Light: Reflection & Refraction*
