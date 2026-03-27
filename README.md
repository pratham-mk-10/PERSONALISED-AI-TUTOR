# 🔬 Adaptive Physics Tutor
> An Agentic AI-powered adaptive learning system for Class 10 NCERT Light chapter (Reflection & Refraction)

---

## 📌 Project Overview

This system detects **why** a student fails — not just **that** they fail — and responds with targeted interactive visual explanations that change meaningfully on each attempt.

**3-Agent Architecture:**
- **Assessment Agent** — Selects questions, evaluates answers, classifies student level, detects misconceptions
- **Content Generation Agent** — Picks explanation strategy, selects SVG template, calls LLM for text
- **Adaptation Agent** — Decides what happens after every quiz: regenerate, refine, bridge, or exit

**Key Features:**
- Interactive SVG diagrams (angle slider, draggable ray, lens/object control)
- Red/Green visual mistake feedback on wrong answers
- Misconception-targeted content regeneration (max 3 attempts)
- Progress dashboard with mastery tracking
- NCERT gap-aware content for Reflection & Refraction

---

## 👥 Team

| Name | Role |
|------|------|
| Pratham | Assessment Agent + Question Bank |
| Rajat | Content Gen Agent + SVG Engine |
| Pavan | Adaptation Agent + Orchestrator |
| Rachan | Frontend (React) + Dashboard |

---

## 🗂️ Repo Structure

```
adaptive-physics-tutor/
│
├── frontend/                  # React app
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── QuizPage.jsx
│       │   ├── ContentPage.jsx
│       │   ├── Dashboard.jsx
│       │   └── svg/           # All SVG animation components
│       ├── App.jsx
│       └── main.jsx
│
├── backend/                   # FastAPI app
│   ├── agents/
│   │   ├── assessment_agent.py
│   │   ├── content_agent.py
│   │   └── adaptation_agent.py
│   ├── orchestrator.py        # Coordinates all 3 agents
│   ├── main.py                # FastAPI entry point + all routes
│   ├── database.py            # PostgreSQL connection + queries
│   ├── models.py              # Pydantic models / DB schemas
│   ├── llm_service.py         # OpenAI API wrapper
│   └── svg_validator.py       # Validates LLM SVG annotation output
│
├── svg-templates/             # Pre-built interactive SVG/JS files
│   ├── reflection_standard_slider.js
│   ├── reflection_analogy_drag.js
│   ├── reflection_stepbystep_static.js
│   ├── lens_object_drag.js
│   ├── lens_analogy_static.js
│   ├── lens_stepbystep_static.js
│   └── feedback_redgreen_overlay.js
│
├── question-bank/             # Seed data
│   ├── reflection_questions.json
│   └── refraction_questions.json
│
├── docs/                      # Architecture + scope documents
│   ├── FINAL_Architecture.docx
│   ├── SVG_Animation_Strategy.docx
│   └── diagrams/
│
├── scripts/                   # Utility scripts
│   └── seed_db.py             # Seeds question bank into PostgreSQL
│
├── .env.example               # Environment variable template
├── .gitignore
├── README.md
└── docker-compose.yml         # (optional) local dev setup
```

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React (Vite) |
| Backend | FastAPI (Python 3.11+) |
| Database | PostgreSQL |
| LLM | OpenAI gpt-4o-mini |
| SVG Engine | Pre-built JS/SVG templates |
| Interactivity | Vanilla JS (SVG events) |
| Cache | In-memory Python dict |

---

## 🚀 Getting Started

### Prerequisites

Make sure you have these installed:
- Node.js v18+
- Python 3.11+
- PostgreSQL 15+
- Git

---

### 1. Clone the Repo

```bash
git clone https://github.com/YOUR_ORG/adaptive-physics-tutor.git
cd adaptive-physics-tutor
```

---

### 2. Set Up Environment Variables

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
# Database
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/physics_tutor

# OpenAI
OPENAI_API_KEY=sk-your-key-here

# App
ENV=development
```

> ⚠️ **Never commit your `.env` file. It is already in `.gitignore`.**

---

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# On Mac/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create the database (make sure PostgreSQL is running)
createdb physics_tutor

# Run migrations / create tables
python database.py

# Seed question bank
python ../scripts/seed_db.py

# Start backend server
uvicorn main:app --reload --port 8000
```

Backend will be running at: `http://localhost:8000`

API docs available at: `http://localhost:8000/docs`

---

### 4. Frontend Setup

```bash
# Open a new terminal tab
cd frontend

# Install dependencies
npm install

# Start frontend dev server
npm run dev
```

Frontend will be running at: `http://localhost:5173`

---

### 5. Verify Setup

Open your browser and go to `http://localhost:5173`

You should see the topic selection screen. If backend is connected correctly, the quiz will load.

---

## 🌿 Git Workflow

### Branch Naming

```
main              → stable, demo-ready code only
dev               → integration branch (merge here first)
feature/agent-1   → Assessment Agent work
feature/agent-2   → Content Gen Agent work
feature/agent-3   → Adaptation Agent work
feature/frontend  → React + Dashboard work
feature/svg       → SVG templates and animations
fix/bug-name      → bug fixes
```

### Daily Workflow

```bash
# 1. Always pull latest dev before starting work
git checkout dev
git pull origin dev

# 2. Create or switch to your feature branch
git checkout -b feature/your-feature-name
# or if branch already exists:
git checkout feature/your-feature-name

# 3. Do your work, then stage and commit
git add .
git commit -m "feat: add misconception detection logic to assessment agent"

# 4. Push your branch
git push origin feature/your-feature-name

# 5. Open a Pull Request into dev on GitHub
# Get at least 1 teammate to review before merging
```

### Commit Message Format

```
feat: add new feature
fix: fix a bug
refactor: restructure code (no behaviour change)
docs: update documentation
test: add or fix tests
chore: setup, config, dependencies
```

Examples:
```
feat: implement angle slider SVG component
fix: correct reflected ray calculation at 0 degrees
refactor: split orchestrator into separate route handlers
docs: update README setup instructions
```

### Merging to Main

Only merge `dev → main` when:
- Feature is fully working end-to-end
- At least 2 teammates have tested it
- No console errors on frontend
- All API endpoints returning correct responses

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| users | Student accounts |
| quiz_attempts | Every quiz taken, score, attempt number |
| misconceptions | Detected misconception per student per topic |
| progress | Mastered topics, current topic, bridge status |
| questions | Full question bank with misconception tags |
| content_cache | Cached LLM explanations + SVG per tag + attempt |
| adaptation_log | Every Agent 3 decision with reason |

To reset and reseed the database during development:

```bash
cd backend
python database.py --reset
python ../scripts/seed_db.py
```

---

## 🔌 API Endpoints

| Method | Endpoint | Agent | Purpose |
|--------|----------|-------|---------|
| POST | `/session/start` | Agent 1 | Start session, get diagnostic quiz |
| POST | `/quiz/submit` | Agent 1 | Submit answers, get level + misconception |
| POST | `/content/get` | Agent 2 | Get explanation + SVG for attempt |
| POST | `/adapt/decide` | Agent 3 | Get next action after quiz result |
| GET | `/feedback/visual` | — | Get red/green SVG overlay |
| GET | `/progress/:userId` | — | Get student progress and mastery |
| GET | `/checkpoint/:userId` | — | Get bridge checkpoint quiz |
| POST | `/eval/descriptive` | Optional | LLM evaluates free-text answer |

Full interactive API docs: `http://localhost:8000/docs`

---

## 🧠 Misconception Tags Reference

| Tag | Meaning |
|-----|---------|
| `angle_from_surface` | Student measures angle from mirror, not normal |
| `normal_orientation` | Student draws normal parallel to mirror |
| `reflection_not_equal` | Student thinks reflected angle differs from incident |
| `refraction_direction` | Student bends ray away from normal entering dense medium |
| `sign_convention_error` | Student uses positive u for object on left of lens |
| `image_side_wrong` | Student places image on wrong side of lens |

---

## 🤝 Contribution Guidelines

- **Never push directly to `main` or `dev`** — always use feature branches + PRs
- **Never commit `.env`** — use `.env.example` to share variable names only
- **Never commit `venv/` or `node_modules/`** — they are in `.gitignore`
- **Test your feature locally** before opening a PR
- **Write clear PR descriptions** — what did you build, how to test it
- **Review teammates' PRs** — don't just approve without reading

---

## 📁 .env.example

```env
# PostgreSQL
DATABASE_URL=postgresql://postgres:password@localhost:5432/physics_tutor

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Environment
ENV=development
```

---

## 📋 requirements.txt  (Backend)

```
fastapi
uvicorn
psycopg2-binary
sqlalchemy
openai
pydantic
python-dotenv
```

Install with:
```bash
pip install -r requirements.txt
```

---

## 📦 package.json scripts  (Frontend)

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

---

## ⚠️ Common Issues & Fixes

**PostgreSQL connection refused**
```bash
# Make sure PostgreSQL is running
sudo service postgresql start   # Linux
brew services start postgresql  # Mac
```

**OpenAI API key error**
```
Check your .env file — make sure OPENAI_API_KEY is set correctly with no spaces
```

**Frontend cannot reach backend**
```
Make sure backend is running on port 8000
Check that CORS is enabled in main.py for localhost:5173
```

**SVG not rendering on frontend**
```
Check browser console for sanitization errors
Make sure dangerouslySetInnerHTML is used with DOMPurify sanitization
```

---

## 📞 Quick Contacts

| Who | Owns | Reach for |
|-----|------|-----------|
| Pratham | Assessment Agent | Question bank issues, scoring bugs |
| Rajat | SVG + Content Agent | Diagram issues, LLM prompt issues |
| Pavan | Adaptation + Orchestrator | Flow bugs, agent coordination issues |
| Rachan | Frontend + Dashboard | UI bugs, routing issues |

---

*Last updated: March 2025 — Capstone Project, PES University*
