# 📝 System API Contracts & Architecture Agreement

**Rule #1 of this Project:** You can write whatever code you want inside your assigned folder, AS LONG AS you accept the defined inputs and return the defined outputs below. 

If your code breaks this contract, your code is broken. Do not change this file without full team agreement.

---

## 1. Assessment Agent -> Content Agent (The Handoff)

When a student gets a question wrong, the Assessment Agent must output a strict JSON object to tell the Content Agent what happened. 

**Format Required:**
```json
{
  "student_id": "12345",
  "topic": "refraction",
  "misconception_tag": "snell_law_confusion",
  "attempt_number": 2,
  "failed_question_id": "q_ref_004"
}
```
*Note: It does not matter if the Assessment Agent uses an LLM, manual IF statements, or a neural net to generate this. It MUST output this exact JSON format.*

---

## 2. Content Agent -> Frontend React Engine (The Animation Data)

The Content Agent (LLM) takes the misconception tag and generates the parameters for the Frontend to draw the regenerative animation.

**Format Required:**
```json
{
  "misconception_type": "snell_law_confusion",
  "explanation_text": "You bent the ray away from the normal, but water is denser than air, so it should bend TOWARD the normal.",
  "animation_parameters": {
    "frame_count": 45,
    "visualization_mode": "overlay",
    "student_incorrect_angle": 55,
    "physics_correct_angle": 32
  }
}
```
*Note: The frontend will use the animation_parameters to feed into the React Physics Engine. The frontend is not allowed to calculate physics; it only renders what this JSON tells it to render.*

---

## 3. Frontend React Engine (The Visualizer)

The React Frontend must accept the JSON above and render the SVG animation. 

**Rules for Frontend:**
1. Do not hardcode animations. 
2. Use the animation_parameters to draw the red (incorrect) and green (correct) rays.
3. Sync the explanation_text with the AI Voice TTS.