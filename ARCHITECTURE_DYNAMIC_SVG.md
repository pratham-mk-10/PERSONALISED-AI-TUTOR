# Architectural Whitepaper: Dynamic Personalized Visual Feedback (SVG Pipeline)

## 1. Core Objective
The ultimate goal of the Personalised AI Tutor is to provide **Dynamic Visual Remediation**. When a student makes a conceptual error, the system must generate a real-time, personalized Red/Green visual overlay demonstrating exactly *why* their specific thought process was flawed, overlaid against the correct physics.

---

## 2. Phase 1: Direct LLM SVG Generation (The Failure)
**What we tried:** 
Our initial approach relied on "Super Prompting." We passed physics rules to the LLM (Gemini/Mistral) and instructed it to generate raw `<svg>` React components containing the correct and incorrect ray paths.

**Why it failed:**
- **Spatial Hallucination:** LLMs are autoregressive language models; they predict the next token based on text patterns. They have zero innate spatial awareness or coordinate logic. 
- **Physics Violations:** The LLM would confidently output `<line x1="100" y1="200" x2="500" y2="400">`, but mathematically, this line would miss the focal point or violate the laws of reflection. 
- **The Verdict:** Relying on probabilistic text models to perform deterministic 2D geometry is fundamentally flawed. It resulted in broken UI, unclosed paths, and scientifically inaccurate diagrams.

---

## 3. Phase 2: Fine-Tuning an LLM (Plan B - Abandoned)
**What we considered:** 
If base models couldn't draw SVGs, the next logical step in standard AI development is fine-tuning. We considered fine-tuning a model on a massive dataset of 10,000+ perfectly mathematically calculated ray-tracing SVGs.

**Why it would inevitably fail:**
1. **Probabilistic vs. Deterministic:** Even a highly fine-tuned model is still probabilistic. If a fine-tuned model is 99% accurate, it might draw a ray that passes *2 pixels away* from the exact focal point. In physics, being off by 2 pixels means the diagram is conceptually wrong. Physics requires 100% deterministic precision.
2. **Infinite Permutations:** Students can make infinite types of errors at infinite coordinate positions. A dataset cannot cover every continuous sub-pixel coordinate error a student might make.
3. **The Verdict:** Fine-tuning attempts to brute-force a language model into being a calculator. It is a massive waste of compute for a subpar result.

---

## 4. Phase 3: Parameterized Deterministic Rendering (The Final Architecture)
To solve this, we architected a system that strictly decouples **Semantic Logic** from **Spatial Rendering**.

### The Hybrid Architecture:
Instead of forcing the AI to draw, we leverage the AI strictly for what it excels at: semantic interpretation. We push all spatial rendering to a custom-built, mathematically flawless React Physics Engine (`MirrorPhysicsEngine.js`).

**The Data Flow:**
1. **Interactive State Capture:** The student interacts with the UI (e.g., they click the "Centre of Curvature" to draw their reflected ray instead of the "Focus"). The frontend captures this exact spatial state (`studentRayEnd = {x: 350, y: 250}`).
2. **Semantic Extraction:** If text feedback is required, the LLM is only given the conceptual parameters, never the raw coordinates. The LLM evaluates the concept and returns structured JSON:
   ```json
   {
     "misconception_tag": "PARALLEL_RAY_THROUGH_C",
     "feedback": "Parallel rays always reflect through the Focus, not the Centre of Curvature!"
   }
   ```
3. **Deterministic Rendering:** The frontend receives the student's exact interaction state. It then uses strict mathematical formulas (Bezier curves, intersection math) to render the UI:
   - **Correct Physics (Green):** Calculated purely by `MirrorPhysicsEngine.js`.
   - **Student Mistake (Red Dashed):** Rendered explicitly using the exact coordinates the student clicked.

### Why This is Industry-Grade:
By treating the LLM as a **Semantic Router** rather than a **Rendering Engine**, we eliminate 100% of spatial hallucinations. The visual output is mathematically perfect, runs instantly on the client's machine with zero API latency for the drawing, and is infinitely scalable to any possible student mistake.
