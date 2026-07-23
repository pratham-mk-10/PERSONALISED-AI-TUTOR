<div align="center">
  
# 🔬 Personalised AI Tutor
### Agentic AI-Powered Adaptive Learning System for Physics

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18.0+-61DAFB.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791.svg)](https://www.postgresql.org/)
[![AI Models](https://img.shields.io/badge/AI-Gemini%20%7C%20Mistral-FF9900.svg)]()

*A multi-agent system that detects **why** a student fails—not just that they fail—and responds with dynamic, deterministic physics animations and targeted pedagogical corrections.*

</div>

---

## 📌 Project Overview
Most "AI Tutors" are simple text-based wrappers around LLMs that say "Wrong answer. Try again." 

**Our system is different.** We built a 3-agent Orchestrator pipeline that:
1. **Evaluates descriptive answers** using Chain-of-Thought (CoT) reasoning.
2. **Detects the exact cognitive misconception** (e.g., *student measures angle from the mirror surface instead of the normal*).
3. **Serves a mathematically perfect, interactive SVG visual correction** that dynamically overlays the student's exact error against the true laws of physics.

---

## 👥 The Team

This capstone project was built as a highly collaborative effort. Every aspect of the production-grade architecture—from the deterministic physics engine and frontend UI to the multi-agent LLM pipelines and assessment schemas—was developed jointly by our core engineering team:

- **Pratham**
- **Rajat**
- **Rachan**
- **Pavan**

---

## 🧠 The Engineering Philosophy: Hybrid AI

To build a production-grade educational tool, critical engineering decisions were made regarding where to use AI and where to use deterministic code.

### The Problem: Generative AI Spatial Hallucinations
Initially, we attempted to use the Gemini LLM to dynamically generate raw SVG React components at runtime based on student errors. **We discovered that while LLMs excel at semantic logic (understanding *why* a student is wrong), they fundamentally lack reliable spatial reasoning.** Zero-shot generation resulted in "spherical aberration" (rays missing the focal point by a few pixels), overlapping text boxes, and mathematically incorrect mirror curves.

### The Solution: A Hybrid Deterministic Pipeline
We abandoned raw LLM code generation and built a **Deterministic Physics Engine** in React. 
- **Frontend (The Engine):** We hand-coded mathematically perfect, strictly-timed SVG animations using exact algebraic paraxial intersection math and Bezier curves. This guarantees 100% physical accuracy for every lesson.
- **Backend (The Cognitive Layer):** The LLM is restricted to its core strength. When a student makes a mistake, the LLM outputs a strict JSON object containing a pedagogical explanation and the exact `(x1, y1)` coordinates of the student's error. The frontend engine then cleanly overlays this data on top of the perfect baseline.

*Why this matters:* This demonstrates a deep understanding of the limitations of Generative AI and the architectural maturity to mitigate those weaknesses using robust traditional engineering patterns.

---

## 🎤 AI Voice Integration

We use pre-generated AI narration (via ElevenLabs) to synchronize audio explanations with SVG animations.
This ensures:
- Smooth playback (zero latency)
- Precise timing with visual ray tracing
- An engaging, highly accessible learning experience

---

## 🧩 3-Agent Architecture

| Agent | Role |
|-------|------|
| **Assessment Agent** | Selects questions, scores answers via CoT, classifies student level, detects misconception tags. Wraps LLM in strict Pydantic JSON schemas. |
| **Content Generation Agent** | Maps the detected misconception tag to an explanation strategy, selects the correct SVG template, and calls the LLM for pedagogical text. |
| **Adaptation Agent** | Decides the flow state after every quiz — regenerate, refine, bridge to a new topic, or exit the loop. |
| **Orchestrator** | Coordinates all 3 agents in real-time, manages the `StudentSession` state, and handles API boundaries. |

---

## ✨ Key Features

- 🎯 **Misconception Detection** — identifies exactly which concept the student misunderstands
- 🎮 **Interactive SVG Diagrams** — angle slider, draggable ray, lens/object position control
- 🔴🟢 **Visual Mistake Feedback** — wrong answer triggers instant red/green diagram overlay
- 🔁 **Smart Regeneration** — 3 attempts, each with completely different explanation + visual
- 📊 **Progress Dashboard** — mastery tracking, misconception log, completion status
- 🌉 **Difficulty Bridge** — connecting checkpoint between Reflection and Refraction

---

## ⚙️ Tech Stack & Metrics

### The Stack
| Layer | Technology | Purpose |
|-------|-----------|-----|
| **Backend** | Python (FastAPI), Uvicorn | High-performance, async REST API |
| **AI / ML** | Gemini 3.5 Flash, Mistral-Small | CoT reasoning and fallback generation |
| **Database** | PostgreSQL, SQLAlchemy | Tag-based queries, robust session state management |
| **Frontend** | React (Vite), Zustand | Component-based UI, complex SVG manipulation |
| **Validation** | Pydantic v2 | Strict schema enforcement for LLM JSON outputs |

### Benchmark Targets Achieved
- **Evaluation Pipeline Reliability:** Pipeline agreement rate > 75% against human grades, surpassing standard BERT baseline models.
- **Inter-rater Reliability:** Cohen's Kappa > 0.6 between the CoT evaluator and human expert grading.
- **Cost/Latency Mitigation:** Built a two-step NLP "Smart Gate" that instantly drops 100% of non-answers (< 4 words) or 0% keyword overlap, completely eliminating LLM API costs and latency for spam submissions.

---

## 🗂️ Folder Structure

```
PERSONALISED-AI-TUTOR/
│
├── frontend/                          # 🎨 React/Vite UI
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── state/
│   │   └── App.jsx
│   └── package.json
│
├── svg-engine/                        # 🔥 Deterministic Physics Engine
│   ├── reflection/                    # (AngleSlider, DraggableRay, etc)
│   ├── refraction/                    # (LensAnalogy, LensObjectDrag, etc)
│   └── shared/                        # (PhysicsEngine.js, SVGUtils.js)
│
├── backend/                           # ⚙️ Python FastAPI
│   ├── assessment-agent/              # Question Bank, Evaluator, Misconception Detector
│   ├── content-agent/                 # LLM Service, Prompts, SVG Template Picker
│   ├── adaptation-agent/              # Decision Engine, Bridge Controller
│   ├── orchestrator/                  # Routes, Session Manager, Flow Controller
│   └── database/                      # Models, Queries, Seed DB scripts
│
├── shared/                            # 🔗 API Contracts & Cross-Agent constants
│   ├── api_contracts.md
│   ├── constants.py
│   └── misconception_tags.json
│
├── docs/                              # 📚 Architecture blueprints
│   └── SVG_Animation_Strategy.docx
│
├── .env.example
├── .gitignore
└── README.md
```

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `users` | Student accounts |
| `quiz_attempts` | Every quiz, score, attempt number, misconception tag |
| `misconceptions` | Detected + refined misconception per student |
| `progress` | Mastered topics, current topic, bridge status |
| `questions` | Full question bank with misconception tags |
| `content_cache` | Cached LLM explanations + SVG per tag + attempt |
| `adaptation_log` | Every Agent 3 decision logged with reason |

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

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- Python 3.11+
- PostgreSQL 15+
- Git

### 1. Clone the Repo
```bash
git clone https://github.com/pratham-mk-10/PERSONALISED-AI-TUTOR.git
cd PERSONALISED-AI-TUTOR
```

### 2. Environment Variables
```bash
cp .env.example .env
```
Fill in your `.env`:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/question_bank
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows
pip install -r requirements.txt

# Create database and tables
createdb question_bank
python database/models.py
python database/seed_db.py

# Start backend
python run_backend.py
```

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🌿 Git Workflow

We use a strict branch integration strategy:
- `main` → stable only, no direct pushes ever
- `dev` → integration branch, merge here first
- `feature/*` → isolated sub-system development
- `fix/*` → bug fixes

- ❌ Never push directly to `main` or `dev`
- ✅ Always PR into `dev` first with peer review
- ✅ Only merge `dev → main` when fully tested end-to-end

---

## ⚠️ Common Issues & Fixes

**PostgreSQL connection refused**
Ensure the PostgreSQL service is running and `DATABASE_URL` in `.env` is correct.

**OpenAI / Gemini API error**
Check `.env` — API keys must have no extra spaces or quotes.

**Frontend cannot reach backend (CORS error)**
Ensure backend is running on port 8000.

**SVG not rendering**
Check browser console for errors. Sanitize SVG with DOMPurify before `dangerouslySetInnerHTML`.
