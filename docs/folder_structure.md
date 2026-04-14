# Folder Structure

Project root: `PERSONALISED-AI-TUTOR`

```text
PERSONALISED-AI-TUTOR/
|-- .env.example
|-- .gitignore
|-- README.md
|-- package-lock.json
|-- backend/
|   |-- .env
|   |-- package-lock.json
|   |-- question_engine.py
|   |-- requirements.txt
|   |-- adaptataion-agent/
|   |   |-- adaptation_agent.py
|   |   |-- bridge_controller.py
|   |   |-- decision_engine.py
|   |   |-- feedback_trigger.py
|   |   `-- misconception_refiner.py
|   |-- assesment_agent/
|   |   |-- __init__.py
|   |   |-- evaluator.py
|   |   |-- level_classifier.py
|   |   |-- misconception_detector.py
|   |   |-- question_engine.py
|   |   |-- question_gen.py
|   |   |-- question_gen_llm_service.py
|   |   |-- question_selector.py
|   |   |-- tags.json
|   |   `-- question_bank/
|   |       |-- reflection_questions.py
|   |       `-- refraction_questions.py
|   |-- content-agent/
|   |   |-- content_agent.py
|   |   |-- llm_service.py
|   |   |-- strategy_selector.py
|   |   |-- svg_template_picker.py
|   |   |-- svg_validator.py
|   |   `-- prompts/
|   |       |-- attempt1_prompt.txt
|   |       |-- attempt2_prompt.txt
|   |       `-- attempt3_prompt.txt
|   |-- database/
|   |   |-- connection.py
|   |   |-- models.py
|   |   |-- queries.py
|   |   `-- seed_db.py
|   `-- orchestrator/
|       |-- flow_controller.py
|       |-- routes.py
|       |-- server.py
|       `-- session_manager.py
|-- docs/
|   |-- FINAL_Architecture.docx
|   |-- README.md
|   |-- SVG_Animation_Strategy.docx
|   |-- folder_structure.md
|   |-- github-flow-simple.md
|   `-- jesc109.pdf
|-- frontend/
|   |-- index.html
|   |-- package-lock.json
|   |-- package.json
|   |-- public/
|   |   `-- audio/
|   |       |-- AngleOfIncidence.wav
|   |       |-- AngleOfReflection.wav
|   |       |-- incident.mp3
|   |       |-- incident.wav
|   |       |-- law.mp3
|   |       |-- law.wav
|   |       |-- mirror.mp3
|   |       |-- mirror.wav
|   |       |-- normal.mp3
|   |       |-- normal.wav
|   |       |-- reflected.mp3
|   |       `-- reflected.wav
|   `-- src/
|       |-- App.jsx
|       |-- main.jsx
|       |-- components/
|       |   |-- common/
|       |   |   |-- Button.jsx
|       |   |   |-- Layout.jsx
|       |   |   `-- Slider.jsx
|       |   |-- content/
|       |   |   |-- ContentPage.jsx
|       |   |   `-- SVGRenderer.jsx
|       |   |-- dashboard/
|       |   |   |-- Dashboard.jsx
|       |   |   |-- MasteryCard.jsx
|       |   |   `-- MisconceptionLog.jsx
|       |   `-- quiz/
|       |       |-- QuizCard.jsx
|       |       `-- QuizPage.jsx
|       |-- pages/
|       |   |-- Home.jsx
|       |   `-- Session.jsx
|       |-- services/
|       |   `-- api.js
|       |-- state/
|       |   `-- sessionStore.js
|       `-- svg-engine/
|           |-- index.js
|           |-- reflection/
|           |   |-- animations/
|           |   |   |-- FirstLawOfReflectionAnimation.jsx
|           |   |   |-- SecondLawOfReflectionAnimation.jsx
|           |   |   `-- feedback/
|           |   |       `-- Secondlawreflectionfeedback.jsx
|           |   `-- interactive/
|           |       |-- FirstLawPlaneInteractive.jsx
|           |       `-- SecondLawPlaneInteractive.jsx
|           |-- refraction/
|           |   |-- LensAnalogy.jsx
|           |   |-- LensObjectDrag.jsx
|           |   |-- LensStepByStep.jsx
|           |   |-- RefractionAnimation.jsx
|           |   `-- RefractionFeedback.jsx
|           `-- shared/
|               |-- AnimationPlayer.jsx
|               |-- FeedbackOverlay.jsx
|               |-- PhysicsEngine.jsx
|               `-- SVGUtils.jsx
`-- shared/
	|-- api_contracts.md
	|-- constants.py
	`-- misconception_tags.json
```

## Notes

- This structure reflects the current workspace layout.
- Generated from the folder scan on 2026-04-14.
- Common generated folders like `node_modules`, `.venv`, and `__pycache__` are intentionally omitted from the tree above.