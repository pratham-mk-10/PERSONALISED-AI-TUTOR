# 🚀 Phase 2: Dynamic Regenerative Animations — Master PRD & Architecture

## 1. Project Vision (1 page)
**Goal:** Transition the Personalised AI Tutor from using static SVG templates to **dynamically generated, physics-constrained animations**. 
Instead of loading pre-drawn components, the system will parametrically generate frames based on the student's exact misconception, validate them through a deterministic physics engine, and render them in real-time. This guarantees mathematical correctness while providing infinite pedagogical adaptability (red/green corrections, side-by-side overlays, step-by-step scrubbing).

## 2. Product Requirements Document (PRD) & User Stories
* **Story 1:** As a student who makes a mistake, I want to see my exact incorrect mental model (in red) drawn alongside the correct model (in green) so I understand *why* I was wrong.
* **Story 2:** As a student on my 3rd failed attempt, I want an interactive slider to scrub through the animation frame-by-frame.
* **Story 3:** As the Physics Engine, I must validate every generated frame against constraints (e.g., Snell's Law) and reject/correct any frame that violates real-world physics.

## 3. System Architecture
**The Regenerative Pipeline:**
1. **Student Action** → Fails a quiz attempt.
2. **Assessment Agent** → Outputs `misconception_tag` (e.g., `ray_misses_focal_point`).
3. **Content Generation Agent** → Formats prompt for parametric generation.
4. **Parametric Animation Generator (New)** → Converts the tag into math parameters (`frame_count`, `student_angle`, `correct_angle`).
5. **Physics Correction Engine (New)** → Validates the trajectory using bezier math and Paraxial approximations.
6. **SVG Keyframe Renderer** → Loops through the validated trajectories and draws the SVG paths dynamically.

## 4. API Specification (The Contract)
**Endpoint:** `Content Agent → Frontend Renderer`
```json
{
  "misconception_type": "ray_passes_through_center_of_curvature",
  "explanation_text": "You drew the ray through the center (C). Parallel rays must pass through the focus (F).",
  "animation_parameters": {
    "frame_count": 60,
    "visualization_mode": "overlay",
    "student_incorrect_trajectory": [{ "x": 0, "y": 10 }, { "x": 50, "y": 50 }],
    "physics_correct_trajectory": [{ "x": 0, "y": 10 }, { "x": 50, "y": 25 }]
  }
}
```

## 5. Component & Folder Structure (New Additions)
```text
frontend/src/svg-engine/
├── dynamic/
│   ├── ParametricGenerator.js      # Translates misconception to parameters
│   ├── PhysicsValidator.js         # Enforces hard physics constraints
│   ├── DynamicSVGRenderer.jsx      # Maps trajectories to <path> elements
│   └── InteractiveScrubber.jsx     # UI for step-by-step playback
```

## 6. Development Roadmap
### Tier 1: Quick Wins (Weeks 1-2)
- [ ] Build `ParametricGenerator.js` to map 3 basic misconceptions to math parameters.
- [ ] Build `DynamicSVGRenderer.jsx` to draw a simple red→green interpolating line.
- [ ] Connect the existing Orchestrator API to feed dynamic JSON instead of static IDs.

### Tier 2: Medium Complexity (Weeks 3-5)
- [ ] Implement `PhysicsValidator.js` to enforce Snell's Law and Mirror Formula constraints.
- [ ] Add the `InteractiveScrubber.jsx` for attempt #3.

### Tier 3: Production (Weeks 6-8)
- [ ] Multi-misconception animations (showing 2+ mistakes at once).
- [ ] Real-time parameter adjustment mode for students.

## 7. Security & Testing Plan
- **Security:** The Physics Engine acts as a sanitizer. It will explicitly reject any LLM hallucination that asks it to draw SVG elements outside the bounding box or inject malicious scripts.
- **Testing:** Unit tests for `PhysicsValidator.js` ensuring that `computePhysicsValue()` never deviates from `target` by more than `tolerance = 0.01`.

## 8. Prompt Library Update
**New System Prompt for Content Agent:**
*"You are the Parametric Animation Controller. You will receive a misconception tag. Do NOT write SVG code. Instead, return the exact starting and ending coordinates for the student's incorrect ray, and the correct theoretical ray, mapped to a 800x600 viewBox."*
