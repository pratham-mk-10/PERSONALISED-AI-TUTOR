# Spherical Mirrors Ray Tracing & SVG Visual Pipeline Tasks

## Part 1: Spherical Mirror SVG Polish & Polish Pattern
- `[x]` Fix mirror polishing (hatch marks) on both lesson components (`RayTracingRulesLesson.jsx`, `ImageFormationLesson.jsx`)
  - **Details**: Replaced hardcoded curve paths with a robust parametric Bezier generator that spaces diagonal hatch marks along the back surface of the mirrors.
- `[x]` Align concave and convex arc shapes in lesson components
  - **Details**: Checked that concave mirror arcs wrap around the object from the right (reflecting side to the left), and convex mirror arcs bulge to the left (reflecting side to the left, center of curvature to the right).

## Part 2: Interactive SVG Try Stage & Feedback Engine
- `[x]` Refine and fix visual details in `DynamicMirrorFeedback.jsx`
  - **Details**: Redesigned actual physics rays to use only 2 clean rays (parallel-focus and focus-parallel/curvature) with midpoint arrowheads indicating the light propagation direction. Used a parametric Bezier helper to calculate exact ray intersections with the curved mirror surface, standardized object and image arrow dimensions, added a glow filter to the image, and resolved size categories dynamically.
- `[x]` Replace the generic static/non-dynamic visualizations in `QuizVisualCorrection.jsx` with `DynamicMirrorFeedback.jsx` for image formation misconceptions
  - **Details**: Integrated `DynamicMirrorFeedback.jsx` in `QuizVisualCorrection.jsx` for 12 different image formation and sign convention misconception tags, passing a customized `flawedModel` representing the student's exact predicted wrong answer overlayed in red alongside the green physics reality.

## Part 3: Curriculum Integration
- `[ ]` Integrate `DynamicMirrorFeedback.jsx` into the main lesson flow in `App.jsx`
  - **Details**: Add a dedicated "Try It Yourself" interactive explorer stage inside `App.jsx` right after the Image Formation animations (`smFormationShow`), allowing the user to slide the object and observe the physics reality before entering the quiz.

## Part 4: Student Persona & Empathy Engine
- `[ ]` Create a frontend Onboarding/Persona screen (Background, Confidence Level, Field of Interest).
  - **Details**: Implement a onboarding card or selection modal where the student selects their background (Urban, Rural/Village, Suburbs), self-reported confidence level (low confidence, moderate, highly confident), and area of interest (e.g., Sports, Space, Video Games, Cars, Farming).
- `[ ]` Pass the `persona_profile` JSON object to the backend Evaluator.
  - **Details**: Sync this state in the React session store and append it to the body payload of descriptive evaluation API requests.
- `[ ]` Update the Descriptive Evaluator Prompt to dynamically adjust pedagogical tone, complexity, and use interest-based analogies.
  - **Details**: Adjust prompt instructions so the AI adapts to low confidence with encouragement and village background using local, highly relatable analogies (e.g., solar cookers, farm tools), while keeping high-confidence urban students engaged with competitive/technical physics analogies (e.g., racing car side-mirrors).
