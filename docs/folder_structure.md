physics-ai-tutor/
│
├── frontend/                          # 🎨 RAJAT
│   ├── src/
│   │   ├── components/
│   │   │   ├── quiz/
│   │   │   │   ├── QuizPage.jsx
│   │   │   │   └── QuizCard.jsx
│   │   │   ├── content/
│   │   │   │   ├── ContentPage.jsx
│   │   │   │   └── SVGRenderer.jsx    # renders SVG from backend
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── MasteryCard.jsx
│   │   │   │   └── MisconceptionLog.jsx
│   │   │   └── common/
│   │   │       ├── Button.jsx
│   │   │       ├── Slider.jsx
│   │   │       └── Layout.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   └── Session.jsx
│   │   ├── services/
│   │   │   └── api.js                 # all backend API calls
│   │   ├── state/
│   │   │   └── sessionStore.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
│
├── svg-engine/                        # 🔥 PRATHAM (YOU)
│   ├── reflection/
│   │   ├── ReflectionAnimation.jsx    # stage 1 - animated intro
│   │   ├── AngleSlider.jsx            # stage 2 - interactive slider
│   │   ├── DraggableRay.jsx           # stage 2 - draggable ray
│   │   ├── ReflectionStepByStep.jsx   # attempt 3 - static annotated
│   │   └── ReflectionFeedback.jsx     # red/green mistake overlay
│   ├── refraction/
│   │   ├── RefractionAnimation.jsx
│   │   ├── LensObjectDrag.jsx         # draggable object on axis
│   │   ├── LensAnalogy.jsx            # attempt 2 analogy
│   │   ├── LensStepByStep.jsx         # attempt 3 guide
│   │   └── RefractionFeedback.jsx     # red/green mistake overlay
│   ├── shared/
│   │   ├── SVGUtils.js                # arc drawing, polar coords etc
│   │   ├── PhysicsEngine.js           # lens formula, reflection math
│   │   └── FeedbackOverlay.jsx        # reusable red/green component
│   └── index.js                       # exports all SVG components
│
│
├── backend/
│   │
│   ├── orchestrator/                  # 🔗 RAJAT
│   │   ├── server.py                  # FastAPI entry point
│   │   ├── routes.py                  # all API endpoints
│   │   ├── session_manager.py         # StudentSession state
│   │   └── flow_controller.py         # routes between agents
│   │
│   ├── assessment-agent/              # 📚 RACHAN
│   │   ├── question_selector.py       # picks questions by tag
│   │   ├── evaluator.py               # scores MCQ answers
│   │   ├── level_classifier.py        # Beginner/Inter/Advanced
│   │   ├── misconception_detector.py  # maps wrong ans → tag
│   │   ├── question_bank/
│   │   │   ├── reflection_questions.json
│   │   │   └── refraction_questions.json
│   │   └── tags.json                  # all 6 misconception tags
│   │
│   ├── content-agent/                 # 🧠 PRATHAM (YOU)
│   │   ├── content_agent.py           # main agent logic
│   │   ├── strategy_selector.py       # picks attempt strategy
│   │   ├── llm_service.py             # OpenAI API wrapper
│   │   ├── svg_template_picker.py     # picks correct SVG template
│   │   ├── svg_validator.py           # validates LLM annotation
│   │   └── prompts/
│   │       ├── attempt1_prompt.txt
│   │       ├── attempt2_prompt.txt
│   │       └── attempt3_prompt.txt
│   │
│   ├── adaptation-agent/              # ⚡ PAVAN
│   │   ├── adaptation_agent.py        # main agent logic
│   │   ├── decision_engine.py         # pass/fail/exit decisions
│   │   ├── misconception_refiner.py   # refines tag between attempts
│   │   ├── bridge_controller.py       # Reflection→Refraction bridge
│   │   └── feedback_trigger.py        # signals red/green to frontend
│   │
│   ├── database/                      # SHARED (everyone uses)
│   │   ├── connection.py              # PostgreSQL connection
│   │   ├── models.py                  # table schemas
│   │   ├── queries.py                 # all DB queries
│   │   └── seed_db.py                 # seeds question bank
│   │
│   └── requirements.txt
│
│
├── shared/                            # 🔗 CONTRACTS (everyone reads, no one edits alone)
│   ├── api_contracts.md               # exact request/response shapes for every endpoint
│   ├── misconception_tags.json        # single source of truth for all 6 tags
│   └── constants.py                   # shared constants (attempt limits, score thresholds)
│
│
├── docs/
│   ├── FINAL_Architecture.docx
│   ├── SVG_Animation_Strategy.docx
│   └── README.md
│
├── .env.example
├── .gitignore
└── README.md