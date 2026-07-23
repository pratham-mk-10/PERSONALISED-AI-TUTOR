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

## 👥 Core Team & Engineering Ownership

This capstone project was built as a highly collaborative effort, with each team member owning critical pieces of the underlying architecture. 

| Team Member | Engineering Ownership | Core Contributions |
| :--- | :--- | :--- |
| **Pratham** | **Physics Engine & Content Generation** | Architected the deterministic React SVG Physics Engine using algebraic paraxial math to bypass LLM spatial hallucinations. Engineered the CoT Content Agent pipeline mapping LLM schemas to dynamic visual templates. |
| **Rajat** | **Orchestration & Frontend Systems** | Built the React (Vite) UI, state routing, Refraction module, and the FastAPI Orchestrator layer that manages the async flows between all three AI agents. |
| **Rachan** | **Assessment & Cognitive Tagging** | Curated the specialized Physics Question Bank and built the Assessment Agent, utilizing Pydantic schemas to enforce strict JSON evaluation and extract granular misconception tags. |
| **Pavan** | **Adaptation & State Management** | Engineered the Adaptation Agent logic and decision loop, managing the 3-attempt cycle and dynamically determining when to refine, regenerate, or exit a learning session. |

---

## 🧠 The Engineering Philosophy: Hybrid AI

To build a production-grade educational tool, critical engineering decisions were made regarding where to use AI and where to use deterministic code.

### The Problem: Generative AI Spatial Hallucinations
Initially, we attempted to use the Gemini LLM to dynamically generate raw SVG React components at runtime based on student errors. **We discovered that while LLMs excel at semantic logic, they fundamentally lack reliable spatial reasoning.** Zero-shot generation resulted in "spherical aberration" (rays missing the focal point), overlapping text, and mathematically incorrect curves.

### The Solution: A Hybrid Deterministic Pipeline
We abandoned raw LLM code generation and built a **Deterministic Physics Engine** in React. 
- **Frontend (The Engine):** Hand-coded, mathematically perfect SVG animations guarantee 100% physical accuracy.
- **Backend (The Cognitive Layer):** The LLM is restricted to its core strength: evaluating student text. When a mistake is made, the LLM outputs a strict JSON object containing the pedagogical explanation and the exact `(x1, y1)` coordinates of the student's error. The frontend engine cleanly overlays this data on top of the perfect baseline.

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
- **Cost/Latency Mitigation:** Built an NLP "Smart Gate" that instantly drops 100% of non-answers, saving significant LLM API costs.

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18+
- Python 3.11+
- PostgreSQL 15+

### 1. Environment Variables
Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/question_bank
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Run Backend
```bash
cd backend
pip install -r requirements.txt
python run_backend.py
```
*(Backend runs at `http://localhost:8000`)*

### 3. Run Frontend
```bash
cd frontend
npm install
npm run dev
```
*(Frontend runs at `http://localhost:5173`)*

---

*Class 10 NCERT Physics — Light: Reflection & Refraction*  
*PES University Capstone Project*
