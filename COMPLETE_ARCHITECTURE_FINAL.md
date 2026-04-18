# **INTELLIGENT ADAPTIVE PHYSICS TUTOR**
## **Complete Architecture Document**
### *Class 10 NCERT Light: Reflection & Refraction*

**Version:** Final (with LLM-based question generation, evaluation engine misconception detection, and visual feedback engine)  
**Timeline:** 21 weeks  
**Status:** Production-ready specification

---

## **TABLE OF CONTENTS**

1. [Executive Summary & Key Changes](#1-executive-summary--key-changes)
2. [System Overview Diagram](#2-system-overview-diagram)
3. [Change Log from Previous Architecture](#3-change-log-from-previous-architecture)
4. [Core Components Deep Dive](#4-core-components-deep-dive)
5. [The Three Agents Explained](#5-the-three-agents-explained)
6. [Misconception Framework](#6-misconception-framework)
7. [Visual Feedback Engine (The Innovation)](#7-visual-feedback-engine--the-innovation)
8. [Question Generation Pipeline](#8-question-generation-pipeline)
9. [Orchestrator & StudentSession Management](#9-orchestrator--studentsession-management)
10. [Database Schema](#10-database-schema)
11. [API Endpoints](#11-api-endpoints)
12. [User Journey (Step-by-Step)](#12-user-journey-step-by-step)
13. [Development Timeline](#13-development-timeline-21-weeks)
14. [Technology Stack Justification](#14-technology-stack-justification)
15. [Optional Bonus Features](#15-optional-bonus-features)

---

## **1. EXECUTIVE SUMMARY & KEY CHANGES**

### **What This System Does**

This is an **intelligent physics tutor** that adapts to each student's learning needs in real-time. Unlike traditional tutorials that show the same explanation to everyone, this system:

- **Diagnoses** specific misconceptions (30 tagged, research-backed false beliefs about reflection & refraction)
- **Generates personalized explanations** addressing ONLY what the student misunderstands
- **Shows visual feedback** (red path = wrong, green path = correct) instantly
- **Regenerates content up to 3 times** with different strategies (analogy, step-by-step) if the student still doesn't get it
- **Tracks misconception evolution** — if a student's wrong answer shifts to a different misconception, the system detects and pivots
- **Gracefully exits** after 3 failed attempts with progress saved

### **Key Changes from Previous Architecture**

This document incorporates **3 major shifts** your team made:

#### **Change #1: LLM-Based Dynamic Question Generation**
**Previous:** Questions stored in pre-built database (50 questions, hard to scale)  
**New:** Mistral AI (or OpenAI) generates questions dynamically based on:
- Topic (e.g., "Laws of Reflection")
- Misconception tag (e.g., "angle_from_surface")
- Difficulty level (Beginner/Intermediate/Advanced)
- Student's previous weak areas

**Why:** Infinite question variety, no hard-coded question limits, scales to any topic

#### **Change #2: Evaluation Engine Returns Misconception Tags**
**Previous:** System just checked if answers were right/wrong  
**New:** Evaluation engine (built by your teammates) analyzes **why** the answer is wrong:
- Student selects wrong option → evaluator identifies which misconception they hold
- Returns tag: `angle_from_surface`, `normal_orientation_wrong`, etc.
- 30 misconceptions mapped (provided in your list at the start)

**Why:** System can now target the root cause, not just the symptom

#### **Change #3: Visual Feedback Engine (Your Job)**
**Previous:** Document didn't clarify how to address misconceptions visually  
**New:** 3-part visual feedback system:
1. **RED overlay** (0-0.5s) — shows student's wrong path/measurement
2. **GREEN annotated SVG** (0.5-3s) — shows correct answer with LLM-generated labels
3. **Attempt 2 explanation + different SVG strategy** — AI-generated targeted explanation addressing the specific misconception

**Why:** Students need to SEE why they're wrong, not just read it

---

## **2. SYSTEM OVERVIEW DIAGRAM**

```
┌─────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (React)                            │
│  ┌──────────────┬─────────────┬──────────────────┬───────────────┐  │
│  │   Topic      │    Quiz     │  Content Page    │   Progress    │  │
│  │  Selector    │    Page     │ (Text + SVG)     │   Dashboard   │  │
│  └──────────────┴─────────────┴──────────────────┴───────────────┘  │
└──────────────────────────┬────────────────────────────────────────────┘
                           │ HTTP REST API
                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                   ORCHESTRATOR (FastAPI)                              │
│  Manages StudentSession state and routes between 3 agents            │
└──────────────┬──────────────────┬──────────────┬────────────────────┘
               │                  │              │
       ┌───────▼─────────┐ ┌──────▼──────┐ ┌────▼─────────┐
       │  AGENT 1        │ │  AGENT 2    │ │   AGENT 3    │
       │  ASSESSMENT     │ │  CONTENT    │ │  ADAPTATION  │
       │  (Questions &   │ │  GENERATION │ │  (Decisions) │
       │   Scoring)      │ │  (Explanations │             │
       │                 │ │   & SVG)    │ │              │
       └────────┬────────┘ └──────┬──────┘ └────┬─────────┘
                │                 │             │
       ┌────────▼─────────────────▼─────────────▼──────────┐
       │          DATA LAYER (PostgreSQL)                   │
       │  • users                 • content_cache           │
       │  • quiz_attempts         • adaptation_log          │
       │  • misconceptions        • feedback_templates      │
       │  • progress              • svg_templates           │
       │  • questions (dynamically generated)               │
       └───────────────────────┬──────────────────────────┘
                               │
       ┌───────────────────────▼──────────────────────┐
       │    EXTERNAL SERVICES                         │
       │  • Mistral AI / OpenAI (question generation) │
       │  • OpenAI gpt-4o-mini (explanations + SVG)  │
       └────────────────────────────────────────────┘
```

---

## **3. CHANGE LOG FROM PREVIOUS ARCHITECTURE**

### **Question Generation: Mistral AI Implementation**

**How It Works Now:**

```
Topic selected: "Laws of Reflection"
     ↓
Mistral API call with:
  • Topic: "Laws of Reflection"
  • Misconception: "angle_from_surface"
  • Difficulty: "Beginner"
  • Question count: 5
  ↓
Mistral generates:
  ✓ Question: "A light ray hits a mirror at 30° from the mirror surface. 
               What is the angle of incidence?"
  ✓ Options: 
    A) 30° (CORRECT - measured from normal)
    B) 60° (WRONG - angle_from_surface misconception)
    C) 90° (WRONG - different misconception)
    D) 120° (WRONG - supplementary angle error)
  ✓ Misconception tags for each wrong option
  ↓
Questions stored in content_cache for reuse (avoid duplicate API calls)
```

**Why Mistral?**
- Cheaper than GPT-4
- Fast (important for low latency)
- Good quality for constrained prompts
- Your team already tested it

**Fallback:** If Mistral fails, use cached questions OR basic question templates

### **Evaluation Engine: Misconception Tag Detection**

**Your teammates built this.** Here's how it feeds into YOUR system:

```
Student takes quiz with generated questions
     ↓
Each question has misconception_tags per wrong option:
  Option B (60°) → tag: angle_from_surface
  Option C (90°) → tag: normal_orientation_wrong
     ↓
Student selects Option B
     ↓
Evaluation engine (your team's module) analyzes:
  • Wrong answer selected → which tag?
  • Returns: "angle_from_surface"
     ↓
Agent 1 receives tag → logs it → passes to Orchestrator
     ↓
Orchestrator signals Agent 2:
  "Generate content for angle_from_surface misconception"
```

**You receive:** `misconception_tag` as a string (e.g., "angle_from_surface")  
**You must handle:** Generating targeted explanations + visual feedback for this tag

---

## **4. CORE COMPONENTS DEEP DIVE**

### **Component 1: Frontend (React)**

**Pages:**

1. **Topic Selector**
   - Buttons: "Reflection" | "Refraction"
   - Shows: "You've mastered 0/2 topics"
   - On click → creates StudentSession

2. **Quiz Page**
   - Displays 5 MCQs (questions from Agent 1)
   - No immediate feedback (feedback comes after Agent 3 decides)
   - Submit button → sends all answers to backend

3. **Content Page**
   - **Left:** Explanation text (from Agent 2, LLM-generated)
   - **Right:** Interactive SVG (slider, draggable elements, animations)
   - Bottom: "I understand" button → next comprehension quiz

4. **Progress Dashboard**
   - Mastery status by topic (Reflection: ✓ Mastered, Refraction: In Progress)
   - Misconception history log:
     ```
     [2024-01-15] Reflection → angle_from_surface (resolved in attempt 2)
     [2024-01-15] Reflection → normal_orientation_wrong (resolved in attempt 1)
     ```
   - Completion percentage

**Key Interaction Points:**
- No feedback on quiz page (student doesn't see if they're right/wrong yet)
- Feedback only appears **after** Agent 3 decides what to show
- This keeps student focused, avoids guessing

### **Component 2: Orchestrator (FastAPI)**

**What It Manages:**

```python
StudentSession = {
    "user_id": "123",
    "topic": "Reflection",
    "subtopic": "Laws of Reflection",
    "current_attempt": 1,
    "misconception_tag": "angle_from_surface",
    "quiz_result": None,
    "agent_2_called": False,
    "agent_3_decision": None,
    "feedback_shown": False
}
```

**Its Job:**
1. Create session when student picks topic
2. Call Agent 1 immediately → get diagnostic quiz
3. Wait for student to submit quiz answers
4. Call Agent 3 → get decision (pass/fail/regenerate)
5. If fail → show red/green SVG feedback
6. If regenerate → call Agent 2 (attempt 2 or 3)
7. If pass → move to next subtopic or bridge checkpoint

**Key Decision:** Orchestrator is **dumb** (no AI logic). It just:
- Routes requests to agents
- Updates session state
- Stores decisions in adaptation_log

This makes it easy to test and debug.

### **Component 3: PostgreSQL Database**

**Why PostgreSQL? Why not FAISS?**

Your previous doc mentioned FAISS (vector search). **Removed because:**
- FAISS is for semantic similarity (finding "similar questions")
- You only have ~50 questions → simple tag-based queries are faster
- Misconceptions are **categorical** (yes, student has angle_from_surface or they don't)
- No need for fuzzy matching or ranking by similarity

**New approach:**
```sql
-- Simple tag-based query
SELECT * FROM questions 
WHERE topic = 'Laws of Reflection' 
AND misconception_tags @> ARRAY['angle_from_surface']
AND id NOT IN (previous_question_ids)
LIMIT 5;
```

Fast, deterministic, works at scale.

---

## **5. THE THREE AGENTS EXPLAINED**

### **AGENT 1: Assessment Agent**

**One-line role:** Selects questions, scores answers, detects misconceptions, classifies student level.

**Input:**
```
{
  "user_id": "123",
  "topic": "Reflection",
  "is_first_visit": true
}
```

**Process:**

1. **Question Selection**
   - First visit? → Select 5 diagnostic MCQs (mixed difficulty)
   - Returning student? → Select 5 MCQs targeting previous misconceptions
   - Call: `generate_questions()` from Mistral (your team's LLM integration)
   - Or fallback to cached pre-built questions

2. **Quiz Administration**
   - Diagnostic: 5 questions (assesses understanding)
   - Comprehension: 3 questions (after content shown, checks learning)

3. **Scoring**
   ```
   correct_count = 4
   total = 5
   score = 4/5 = 80%
   
   if score < 40%: level = "Beginner"
   if 40% <= score < 70%: level = "Intermediate"
   if score >= 70%: level = "Advanced"
   ```

4. **Misconception Detection**
   ```
   Question 1: Student wrong → tag = "angle_from_surface"
   Question 3: Student wrong → tag = "angle_from_surface"
   Question 5: Student wrong → tag = "normal_orientation_wrong"
   
   Pattern: "angle_from_surface" appears 2x
   PRIMARY_MISCONCEPTION = "angle_from_surface"
   
   (If tie, pick the one that appears first)
   ```

5. **Database Write**
   ```sql
   INSERT INTO quiz_attempts 
     (user_id, topic, score, misconception_tag, attempt_number, level)
   VALUES ('123', 'Reflection', 80, 'angle_from_surface', 1, 'Advanced');
   ```

**Output:**
```
{
  "level": "Advanced",
  "score": 80,
  "misconception_tag": "angle_from_surface",
  "passed_diagnostic": true
}
```

**Key Detail:** Agent 1 doesn't decide if content should be shown. It just **reports**. Agent 3 decides.

---

### **AGENT 2: Content Generation Agent**

**One-line role:** Decides explanation strategy and SVG template, calls LLM for text, validates, and falls back gracefully.

**Input:**
```
{
  "topic": "Reflection",
  "misconception_tag": "angle_from_surface",
  "attempt_number": 1,
  "level": "Advanced"
}
```

**Process:**

#### **Step 1: Cache Check**
```sql
SELECT explanation_text, svg_code 
FROM content_cache
WHERE misconception_tag = 'angle_from_surface' 
AND attempt_number = 1;

-- HIT? Return immediately (no LLM call)
-- MISS? Continue to Step 2
```

Why? To avoid duplicate LLM calls. Same misconception + same attempt = same explanation.

#### **Step 2: Strategy Selection**

Agent 2 picks ONE of three strategies based on attempt number:

**Attempt 1: Standard Physics Explanation**
- Goal: Introduce concept clearly
- Explanation style: "Here's why angles are measured from the normal..."
- SVG type: Interactive (slider showing angle changes, student can drag)
- Complexity: Medium

**Attempt 2: Misconception-Targeted Explanation**
- Goal: Attack the false belief directly
- Explanation style: "You might think angle is measured from the SURFACE. But that's wrong because..."
- SVG type: Analogy-based (draggable elements, shows conceptual mapping)
- Complexity: Medium (but different angle)

**Attempt 3: Step-by-Step Simplified**
- Goal: Strip to absolute basics
- Explanation style: "Step 1: Draw surface. Step 2: Draw perpendicular (normal). Step 3: Measure angle from step 2."
- SVG type: Static annotated diagram (numbered steps)
- Complexity: Simple

#### **Step 3a: LLM Text Generation**

**Prompt template for Attempt 2 (misconception-targeted):**

```
Topic: Reflection of Light
Misconception: Student measures angle from mirror SURFACE, not NORMAL

Generate a 150-word explanation that:
1. Starts with: "You might think the angle is measured from the mirror itself..."
2. Explicitly states the false belief
3. Explains why normal (perpendicular line) is correct
4. Uses simple language, no jargon
5. Includes 1 real-world analogy

Use gpt-4o-mini. Return plain text, no formatting.
```

**LLM returns:**
```
"You might think the angle of incidence is measured from the mirror surface itself—
this is a common misconception. However, in optics, we always measure angles from 
a perpendicular line called the NORMAL. Think of the normal as a 90° helper line 
we draw perpendicular to the mirror. Why? Because physics uses this standard 
across all reflective and refractive surfaces—water, glass, mirrors. It's like 
measuring building height from the ground level, not from the roof. Once you measure 
from the normal consistently, the law of reflection (angle in = angle out) becomes 
obvious. Try adjusting the slider below: watch how the angle changes when measured 
from the normal, not from the surface."
```

#### **Step 3b: SVG Template Selection**

Agent 2 picks the template:

```
attempt=1, topic="Reflection" 
  → use reflection_standard_slider.svg
  
attempt=2, tag="angle_from_surface"
  → use reflection_analogy_drag.svg
  
attempt=3, any tag
  → use reflection_stepbystep_static.svg
```

**LLM only adds annotations** (text labels, arrows pointing to parts), NOT the SVG structure:

```
Template (pre-built, valid SVG):
<svg>
  <line id="surface" x1="100" y1="200" x2="500" y2="200" stroke="black"/>
  <line id="normal" x1="300" y1="50" x2="300" y2="350" stroke="blue" stroke-dasharray="5,5"/>
  <text id="surface_label">?</text>  <!-- LLM fills this -->
  <text id="normal_label">?</text>   <!-- LLM fills this -->
  <g id="angle_arc"><!-- LLM annotations here --></g>
</svg>

LLM annotation JSON:
{
  "surface_label": "Mirror Surface",
  "normal_label": "Normal (90° perpendicular)",
  "angle_arc_annotation": "Angle of incidence (measured FROM normal)",
  "highlight_color": "#FFD700"
}

MERGE: SVG template + LLM annotations → final SVG
```

#### **Step 4: SVG Validation & Fallback**

```
Is LLM annotation valid JSON? 
  YES → merge into template → serve
  NO → strip LLM layer, serve base template (student doesn't see annotation)
  
Did LLM return text? 
  YES → include in explanation_text
  NO → use fallback text from template metadata
```

This fallback is **crucial**. If LLM breaks, system doesn't crash.

#### **Step 5: Cache & Return**

```sql
INSERT INTO content_cache 
  (misconception_tag, attempt_number, explanation_text, svg_code, strategy_used)
VALUES 
  ('angle_from_surface', 2, '...', '<svg>...</svg>', 'misconception_targeted');
```

**Output:**
```
{
  "explanation_text": "You might think the angle...",
  "svg_code": "<svg>...</svg>",
  "strategy_used": "misconception_targeted",
  "attempt": 2
}
```

---

### **AGENT 3: Adaptation Agent**

**One-line role:** After every quiz, independently decides: pass → next topic, fail → regenerate, or exit gracefully.

**Input:**
```
{
  "user_id": "123",
  "topic": "Reflection",
  "attempt_number": 1,
  "quiz_result": {
    "score": 2,
    "total": 3,
    "wrong_answers": [
      {"question_id": "5", "misconception_tag": "angle_from_surface"},
      {"question_id": "7", "misconception_tag": "normal_orientation_wrong"}
    ]
  },
  "previous_misconception_tag": "angle_from_surface"
}
```

**Process:**

#### **Step 1: Pass or Fail?**

```
if score >= 2/3 (66.7%):
  PASS → go to Step 6
  
if score < 2/3:
  FAIL → go to Step 2
```

**Why 2/3 and not 3/3?** Because:
- 3/3 is too hard — discourages students
- 2/3 shows understanding of core concept
- One wrong answer acceptable (could be careless mistake, not misconception)

#### **Step 2: Attempt Routing (on FAIL)**

```
if attempt_number == 1:
  → Call Agent 2 with attempt_number=2
  → Same misconception_tag
  → Different strategy (analogy-based)
  
if attempt_number == 2:
  → Check if misconception shifted (Step 3)
  → Call Agent 2 with attempt_number=3
  → Possibly different misconception_tag
  
if attempt_number == 3:
  → GRACEFUL EXIT
  → Save progress
  → Show: "Great effort! Let's continue later."
  → Do NOT frustrate student
```

#### **Step 3: Misconception Refinement (attempt 2→3)**

This is **genius** — if student's wrong answers change between attempt 1 and 2:

```
Attempt 1: Student wrong on "angle_from_surface" (measured from surface)
Content shown: Explanation + SVG about normal vs surface

Attempt 2 (after learning): Student now wrong on "normal_orientation_wrong" 
(draws normal parallel to surface instead of perpendicular)

What happened? Student understood that angle is from normal, but NOW 
doesn't understand where normal points!

Agent 3 detects this pattern:
  IF previous_tag != new_wrong_tag:
    misconception_tag = new_wrong_tag
    refined = true
  
  Call Agent 2 with NEW tag → different explanation
```

**SQL:**
```sql
SELECT misconception_tag FROM misconceptions 
WHERE user_id = '123' AND topic = 'Reflection'
ORDER BY detected_at DESC LIMIT 1;

-- Previous: angle_from_surface
-- Current attempt wrong answers: normal_orientation_wrong
-- Pattern match: DIFFERENT → refinement needed
```

This is how the system **adapts**. It doesn't just repeat the same explanation; it changes based on what the student actually needs.

#### **Step 4: Visual Feedback Trigger (every FAIL)**

This is where your **red/green overlay** fires.

```
On FAIL (before showing Attempt 2 content):
  ↓
Send to Frontend:
  {
    "show_feedback": true,
    "misconception_tag": "angle_from_surface",
    "attempt": 1
  }
  ↓
Frontend fetches:
  GET /feedback/visual?tag=angle_from_surface&attempt=1
  ↓
Backend returns:
  {
    "red_svg": "<svg><!-- WRONG PATH, red --></svg>",
    "green_svg": "<svg><!-- CORRECT PATH, green --></svg>",
    "annotation": "❌ Angle measured from SURFACE (wrong) vs ✅ From NORMAL (correct)"
  }
  ↓
Frontend displays sequence:
  1. RED overlay (0-0.5s) — shows wrong answer/wrong path
  2. GREEN SVG fades in (0.5-3s) — shows correct answer, LLM-generated labels
  3. Instruction: "Review the correct path above, then continue"
  ↓
Then load Attempt 2 explanation
```

#### **Step 5: Log & Update**

```sql
INSERT INTO adaptation_log 
  (user_id, attempt, decision, reason, refined_tag, timestamp)
VALUES 
  ('123', 1, 'regenerate', 'score < 66.7%', 'angle_from_surface', NOW());

UPDATE misconceptions 
SET refined_tag = 'normal_orientation_wrong'
WHERE user_id = '123' AND topic = 'Reflection';
```

**Output:**
```
{
  "next_action": "regenerate",  -- or "pass", "exit", "bridge"
  "refined_tag": null,            -- or new tag if misconception shifted
  "show_feedback": true,
  "feedback_misconception_tag": "angle_from_surface",
  "attempt_after_feedback": 2
}
```

---

## **6. MISCONCEPTION FRAMEWORK**

### **30 Misconception Tags (Complete List)**

Your team provided this. Here's how it integrates:

```
REFLECTION (Laws of Reflection)
├─ angle_from_surface: Measures angle from mirror surface, not normal
├─ reflection_not_equal: Thinks angle of incidence ≠ angle of reflection
├─ normal_orientation_wrong: Draws normal parallel to mirror, not perpendicular
└─ plane_not_same: Thinks rays are in different planes

REFLECTION (Image Formation — Plane Mirror)
├─ image_real_confusion: Thinks image is real, not virtual
├─ size_mismatch: Thinks image size ≠ object size
├─ distance_confusion: Image distance ≠ object distance
└─ lateral_inversion_confusion: Thinks image is upside down, not left-right inverted

[... 22 more tags for spherical mirrors, refraction, sign convention ...]
```

### **How Tags Flow Through System**

```
Database question entry:
{
  "id": 1001,
  "topic": "Reflection",
  "question_text": "A ray hits a mirror at 30° from surface...",
  "options": [
    {"text": "30°", "correct": false, "misconception_tag": "angle_from_surface"},
    {"text": "60°", "correct": true, "misconception_tag": null},
    ...
  ]
}

Student selects option 1 (wrong)
  ↓
Evaluation engine: "This misconception = angle_from_surface"
  ↓
Agent 1 receives tag: misconception_tag = "angle_from_surface"
  ↓
Agent 2 loads: 30 pre-built explanation prompts, one for each tag
  ↓
LLM generates targeted explanation for THIS tag
  ↓
Agent 3 triggers red/green SVG with tag: "angle_from_surface"
  ↓
Frontend fetches template: feedback_templates['angle_from_surface']
```

### **Per-Tag Explanation Prompt Strategy**

You asked: **"Is per-tag LLM prompt correct?"** 

**YES. Here's the structure:**

```python
MISCONCEPTION_PROMPTS = {
    "angle_from_surface": {
        "attempt_1": "Explain why angles in reflection are measured from the NORMAL (perpendicular), not the mirror surface itself...",
        "attempt_2": "The common misconception is measuring from the surface. Let's correct this: the normal is key because...",
        "attempt_3": "Step 1: Draw surface. Step 2: Draw normal (90° perpendicular). Step 3: Always measure from step 2."
    },
    "normal_orientation_wrong": {
        "attempt_1": "The normal is a line perpendicular to the mirror surface. Show why 90° is essential...",
        "attempt_2": "Wrong belief: normal is parallel to surface. Correct: normal is perpendicular (90°)...",
        "attempt_3": "Easy way: normal is always at right angles. Use a protractor..."
    },
    [... 28 more ...]
}
```

**Why per-tag?**
- Each misconception needs different phrasing
- Same prompt for all misconceptions = generic, unhelpful
- 30 tags × 3 attempts = 90 prompts (manageable)
- You can A/B test: "Does this prompt resolve angle_from_surface better?"

---

## **7. VISUAL FEEDBACK ENGINE — THE INNOVATION**

### **Why Red/Green Isn't Enough (And What We Do About It)**

You asked: **"Is red/green overlay enough for 2nd attempt?"**

Answer: **No. We need 3-part feedback.**

**Problem:** Just showing red path + green path doesn't explain WHY the student is wrong.

**Solution:** Three-part visual feedback sequence.

### **3-Part Visual Feedback Sequence**

#### **Part 1: RED OVERLAY (0 - 0.5 seconds)**

**Purpose:** Shock. Show the student their mistake immediately.

**What appears:**
```
Student chose: "Measure angle from mirror surface"

RED SVG shows:
  • Mirror surface highlighted in RED
  • Wrong angle arc in RED (measuring from surface)
  • Text: "❌ This is wrong"
  • Stays for 0.5 seconds only
  
Student feels: "I was WRONG. Let me see what's right."
```

**Database template:**
```sql
INSERT INTO feedback_templates 
  (misconception_tag, red_svg_code, part)
VALUES 
  ('angle_from_surface', 
   '<svg>
      <line x1="100" y1="200" x2="500" y2="200" stroke="red" stroke-width="3"/>
      <text x="150" y="180" fill="red">❌ Mirror surface (WRONG)</text>
      <path d="M 300 200 A 50 50 0 0 1 350 200" fill="none" stroke="red" stroke-width="2"/>
    </svg>',
   'red');
```

#### **Part 2: GREEN ANNOTATED SVG (0.5 - 3 seconds)**

**Purpose:** Show correct path + explain it with LLM-generated labels.

**What appears:**
```
RED fades out

GREEN SVG fades in:
  • Mirror surface in BLACK (neutral)
  • NORMAL (perpendicular line) highlighted in BLUE
  • Correct angle arc in GREEN (measured from normal)
  • LLM-generated annotation labels:
    - Arrow pointing to normal: "This is the NORMAL (90° perpendicular)"
    - Arrow pointing to angle: "Measure angle FROM THIS LINE"
    - Explanation box: "Always measure from the normal, not the surface"
  • Student can read and understand
  • Stays for 3+ seconds, or until student clicks "Continue"
```

**What LLM generates (Agent 2 job):**
```
Input: misconception_tag = "angle_from_surface"
Output: JSON annotation labels

{
  "normal_label": "This is the NORMAL\n(perpendicular to surface)",
  "angle_label": "Angle of Incidence\n(measured FROM normal)",
  "surface_label": "Mirror Surface",
  "key_learning": "The normal is always perpendicular (90°) to the surface.\nWe measure ALL angles from this line in optics.",
  "analogy": "Think of it like measuring building height from ground level, not roof level."
}

Merge into template:
<svg>
  <line id="surface" stroke="black"/>
  <line id="normal" stroke="blue" stroke-dasharray="5,5"/>
  <text id="normal_label">This is the NORMAL (perpendicular to surface)</text>
  <text id="angle_label">Angle of Incidence (measured FROM normal)</text>
  <!-- etc -->
</svg>
```

**Why 3 seconds?** Students need time to:
1. See the visual (0.5s)
2. Read the annotation (1-2s)
3. Process the difference from red (0.5s)

**Database:**
```sql
INSERT INTO feedback_templates 
  (misconception_tag, green_svg_code, annotation_json, part)
VALUES 
  ('angle_from_surface', '<svg>...</svg>', '{...}', 'green');
```

#### **Part 3: ATTEMPT 2 CONTENT (After student clicks "Continue")**

**Purpose:** Reinforce with a different explanation strategy + different SVG.

**What happens:**
```
Green SVG fades

Agent 2 is called:
  Input: { misconception_tag: "angle_from_surface", attempt: 2 }
  Output: 
    {
      "explanation_text": "Here's a key insight you might have missed...",
      "svg_code": "<svg><!-- Analogy-based, draggable --></svg>",
      "strategy": "misconception_targeted"
    }

Frontend shows:
  • Left: NEW explanation text (written for Attempt 2 strategy)
  • Right: NEW SVG (analogy or different visual approach)
  • Student can now interact: drag angle slider, drag ray, etc.
```

**Timeline:**
```
T=0.0s: Red SVG appears
T=0.5s: Red fades, Green appears
T=0.5-3.0s: Student reads green annotation
T=3.0s+: Student clicks "Continue"
T=3.5s: Green fades, Attempt 2 content loads
```

### **Feedback Template Database Structure**

```sql
CREATE TABLE feedback_templates (
  id SERIAL PRIMARY KEY,
  misconception_tag VARCHAR(100),     -- e.g., "angle_from_surface"
  red_svg_code TEXT,                   -- RED overlay (wrong answer visual)
  green_svg_code TEXT,                 -- GREEN base SVG (correct answer)
  annotation_placeholders TEXT,        -- JSON: labels to inject
  attempt_number INT,                  -- 1 or 2 (attempt 3 is just text)
  created_at TIMESTAMP
);

-- Example row:
INSERT INTO feedback_templates VALUES 
(1, 'angle_from_surface', 
 '<svg><!-- red path from surface --></svg>',
 '<svg><!-- green path from normal --></svg>',
 '{"normal_label": "...", "angle_label": "..."}',
 1, NOW());
```

### **Frontend Implementation (React)**

```jsx
function FeedbackOverlay({ misconceptionTag, attempt }) {
  const [step, setStep] = useState('red');
  const [template, setTemplate] = useState(null);

  useEffect(() => {
    // Fetch red/green SVG templates
    fetch(`/feedback/visual?tag=${misconceptionTag}&attempt=${attempt}`)
      .then(r => r.json())
      .then(data => setTemplate(data));
  }, [misconceptionTag, attempt]);

  return (
    <>
      {/* RED OVERLAY: 0-0.5s */}
      <SVGOverlay 
        code={template?.red_svg}
        opacity={step === 'red' ? 1 : 0}
        onAnimationEnd={() => {
          if (step === 'red') {
            setTimeout(() => setStep('green'), 500);
          }
        }}
      />
      
      {/* GREEN ANNOTATED SVG: 0.5-3s */}
      <SVGOverlay 
        code={template?.green_svg_annotated}
        opacity={step === 'green' ? 1 : 0}
        annotation={template?.annotation}
      />
      
      <button 
        onClick={() => props.onFeedbackComplete()}
        style={{ marginTop: step === 'green' ? '1s' : 'hidden' }}
      >
        Continue to Attempt 2
      </button>
    </>
  );
}
```

---

## **8. QUESTION GENERATION PIPELINE**

### **How Dynamic Question Generation Works**

#### **Mistral API Integration (Your Team's Work)**

Your team built the Mistral integration. Here's how we use it:

```
Agent 1 needs 5 questions for diagnostics
     ↓
Check cache:
  SELECT * FROM content_cache 
  WHERE type='question' 
  AND topic='Reflection' 
  AND misconception_tag='any' 
  AND difficulty='mixed'
  LIMIT 5;
  
If cache miss (questions not found):
  ↓
Call Mistral API:
  POST https://api.mistral.ai/v1/chat/completions
  
  {
    "model": "mistral-small",
    "messages": [{
      "role": "user",
      "content": """
        Generate 5 multiple-choice physics questions about:
        Topic: Reflection of Light (Laws of Reflection)
        Target misconception: angle_from_surface
        Difficulty: Beginner
        
        For each question:
        - State the question clearly
        - Provide 4 options (A, B, C, D)
        - Mark the correct answer
        - Tag each wrong option with the misconception it triggers
        
        Format as JSON:
        {
          "questions": [
            {
              "text": "A light ray...",
              "options": [
                {"text": "...", "correct": true, "tag": null},
                {"text": "...", "correct": false, "tag": "angle_from_surface"}
              ]
            }
          ]
        }
      """
    }],
    "temperature": 0.7
  }
  ↓
Mistral returns questions (JSON)
  ↓
Parse + validate
  ↓
Cache in PostgreSQL
  ↓
Return to Agent 1
```

#### **Question Tagging & Misconception Mapping**

Each generated question is tagged with misconceptions:

```json
{
  "id": 1001,
  "topic": "Reflection",
  "subtopic": "Laws of Reflection",
  "question_text": "A light ray strikes a mirror at 30° from the mirror surface. What is the angle of incidence?",
  "options": [
    {
      "text": "30°",
      "correct": true,
      "misconception_tag": null,
      "explanation": "Correct! The angle is measured from the NORMAL, which is perpendicular to the surface. Normal is 90° from surface, so if surface angle is 30°, normal angle is 60°."
    },
    {
      "text": "60°",
      "correct": false,
      "misconception_tag": "angle_from_surface",
      "explanation": "Wrong. You might think angle is measured from the surface itself."
    },
    {
      "text": "90°",
      "correct": false,
      "misconception_tag": "normal_orientation_wrong",
      "explanation": "Wrong. Normal orientation misconception."
    }
  ],
  "difficulty": "beginner",
  "source": "mistral_api",
  "generated_at": "2024-01-15T10:30:00Z"
}
```

#### **Caching Strategy**

```python
class QuestionCache:
  cache = {}  # In-memory, cleared on redeploy
  
  def get_questions(topic, misconception, difficulty, count=5):
    key = f"{topic}_{misconception}_{difficulty}"
    
    if key in cache:
      return cache[key]  # Fast return
    
    # DB check
    db_questions = db.query(
      "SELECT * FROM questions WHERE topic=? AND tag=? LIMIT ?",
      topic, misconception, count
    )
    
    if len(db_questions) >= count:
      cache[key] = db_questions
      return db_questions
    
    # Fallback: Generate via Mistral
    questions = mistral_generate(topic, misconception, difficulty, count)
    
    # Save to DB
    for q in questions:
      db.insert("questions", q)
    
    cache[key] = questions
    return questions
```

### **Why Not Pure LLM Generation Every Time?**

**Pros:**
- Infinite variety
- Custom per-student

**Cons:**
- **Latency:** LLM API calls take 1-2 seconds (student waits)
- **Cost:** $0.05-0.10 per call × 100 students × 10 quizzes = expensive
- **Quality variance:** Same topic, different questions generated each time (hard to validate)
- **Misconception mapping:** Hard to guarantee wrong option maps to intended misconception

**Our hybrid approach:**
1. Generate questions once via Mistral (your team did this)
2. Cache them in PostgreSQL
3. Re-use for all students
4. Only regenerate if needed (e.g., student has seen all cached questions)

**Result:** Fast (cached query), cheap (one-time API call), consistent quality.

---

## **9. ORCHESTRATOR & STUDENTSESSION MANAGEMENT**

### **StudentSession Lifecycle**

```
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: Student selects topic (Frontend)                         │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ Orchestrator: Create StudentSession                              │
│ POST /session/start                                              │
│                                                                  │
│ {                                                               │
│   "user_id": "user123",                                         │
│   "topic": "Reflection",                                        │
│   "created_at": "2024-01-15T10:00:00Z",                         │
│   "current_attempt": 1,                                         │
│   "misconception_tag": null,  ← Will be filled by Agent 1       │
│   "state": "awaiting_diagnostic_quiz"                           │
│ }                                                               │
│                                                                  │
│ Immediately call Agent 1                                        │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ Agent 1: Generate diagnostic quiz (5 questions)                  │
│                                                                  │
│ Returns:                                                        │
│ {                                                               │
│   "questions": [5 MCQs],                                        │
│   "session_id": "sess_abc123"                                   │
│ }                                                               │
│                                                                  │
│ Update session:                                                 │
│   state = "taking_diagnostic_quiz"                              │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: Show diagnostic quiz to student                        │
│ (5 questions, no feedback yet)                                  │
│                                                                  │
│ Student submits answers                                        │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ Orchestrator: POST /quiz/submit                                  │
│                                                                  │
│ Input:                                                          │
│ {                                                               │
│   "session_id": "sess_abc123",                                  │
│   "answers": [3, 1, 2, 0, 3]  ← indices of selected options    │
│ }                                                               │
│                                                                  │
│ Call Agent 1 (score + classify misconception)                   │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ Agent 1: Evaluate                                                │
│                                                                  │
│ Returns:                                                        │
│ {                                                               │
│   "score": 80,                                                  │
│   "level": "Advanced",                                          │
│   "misconception_tag": "angle_from_surface",                    │
│   "passed_diagnostic": true  ← Not used for pass/fail decision   │
│ }                                                               │
│                                                                  │
│ Update session:                                                 │
│   misconception_tag = "angle_from_surface"                      │
│   state = "awaiting_content"                                    │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ Orchestrator: Call Agent 2                                       │
│                                                                  │
│ Input:                                                          │
│ {                                                               │
│   "misconception_tag": "angle_from_surface",                    │
│   "attempt_number": 1,                                          │
│   "level": "Advanced"                                           │
│ }                                                               │
│                                                                  │
│ Agent 2 returns:                                                │
│ {                                                               │
│   "explanation_text": "...",                                    │
│   "svg_code": "<svg>...</svg>",                                 │
│   "strategy_used": "standard_physics"                           │
│ }                                                               │
│                                                                  │
│ Update session:                                                 │
│   state = "viewing_content"                                     │
│   attempt_number = 1                                            │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: Show content page                                      │
│ Left: Explanation text                                          │
│ Right: Interactive SVG (slider/drag)                            │
│ Button: "I understand" → triggers comprehension quiz            │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ Student takes comprehension quiz (3 MCQs)                        │
│ Submits answers                                                 │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ Orchestrator: POST /adapt/decide                                 │
│                                                                  │
│ Input:                                                          │
│ {                                                               │
│   "session_id": "sess_abc123",                                  │
│   "comprehension_answers": [1, 2, 0],                           │
│   "attempt_number": 1                                           │
│ }                                                               │
│                                                                  │
│ Call Agent 1 (evaluate comprehension)                           │
│ Then call Agent 3 (decide next action)                          │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────────┐
│ Agent 3: Decision Engine                                         │
│                                                                  │
│ IF score >= 2/3:                                                │
│   decision = "PASS"                                             │
│   → Update progress, mark topic mastered                        │
│   → Move to next subtopic OR bridge checkpoint                  │
│                                                                  │
│ IF score < 2/3:                                                 │
│   IF attempt == 1:                                              │
│     decision = "REGENERATE_ATTEMPT_2"                           │
│   ELIF attempt == 2:                                            │
│     Check if misconception shifted                              │
│     decision = "REGENERATE_ATTEMPT_3"                           │
│   ELSE:                                                         │
│     decision = "GRACEFUL_EXIT"                                  │
│                                                                  │
│ Returns:                                                        │
│ {                                                               │
│   "next_action": "regenerate",                                  │
│   "show_feedback": true,                                        │
│   "misconception_tag": "angle_from_surface",                    │
│   "attempt_after_feedback": 2                                   │
│ }                                                               │
│                                                                  │
│ Update session:                                                 │
│   state = "showing_feedback"                                    │
└──────────────────────┬──────────────────────────────────────────┘
                       ↓
                   [BRANCHES]
                   /       \
                  ↓         ↓
         ┌─────────────┐  ┌──────────────┐
         │ SHOW RED/   │  │ PASS: MOVE   │
         │ GREEN       │  │ TO NEXT      │
         │ FEEDBACK    │  │ TOPIC        │
         └──────┬──────┘  └──────┬───────┘
                │                │
                ↓                ↓
      [Load Attempt 2]    [Reset session]
      [Call Agent 2]      [New topic]
      [Comprehension]     [Back to Step 1]
         [Quiz...]
```

### **Session State Machine**

```
States:
  • created
  • awaiting_diagnostic_quiz
  • taking_diagnostic_quiz
  • diagnost_complete
  • awaiting_content
  • viewing_content
  • taking_comprehension_quiz
  • showing_feedback
  • awaiting_next_attempt
  • topic_mastered
  • graceful_exit
  • bridge_checkpoint

Transitions:
  created 
    → awaiting_diagnostic_quiz (Agent 1 called)
    → taking_diagnostic_quiz (student sees questions)
    → diagnostic_complete (student submitted)
    → awaiting_content (Agent 2 called)
    → viewing_content (student sees explanation)
    → taking_comprehension_quiz (student answers)
    → [Agent 3 decision]
      ├─ topic_mastered (if PASS)
      ├─ showing_feedback (if FAIL)
      └─ graceful_exit (if FAIL × 3)
```

### **Orchestrator Endpoints**

```python
# FastAPI routes

@app.post("/session/start")
def start_session(user_id: str, topic: str):
    """Create StudentSession, call Agent 1 for diagnostic quiz"""
    session = StudentSession(user_id=user_id, topic=topic)
    questions = agent1.select_questions(topic=topic, is_diagnostic=True)
    return {
        "session_id": session.id,
        "questions": questions,
        "state": "taking_diagnostic_quiz"
    }

@app.post("/quiz/submit")
def submit_quiz(session_id: str, answers: List[int]):
    """Student submits quiz answers → Agent 1 scores → Agent 2 generates content"""
    session = get_session(session_id)
    
    # Agent 1: Score & classify
    agent1_result = agent1.evaluate(
        answers=answers,
        questions=session.current_questions
    )
    session.misconception_tag = agent1_result['misconception_tag']
    session.level = agent1_result['level']
    
    # Agent 2: Generate content
    agent2_result = agent2.generate_content(
        misconception_tag=agent1_result['misconception_tag'],
        attempt=session.current_attempt,
        level=agent1_result['level']
    )
    
    return {
        "explanation": agent2_result['explanation_text'],
        "svg": agent2_result['svg_code'],
        "state": "viewing_content"
    }

@app.post("/adapt/decide")
def adaptation_decision(session_id: str, comprehension_answers: List[int]):
    """Student completes comprehension quiz → Agent 3 decides next action"""
    session = get_session(session_id)
    
    # Agent 1: Evaluate comprehension
    agent1_result = agent1.evaluate(answers=comprehension_answers)
    score = agent1_result['score']
    
    # Agent 3: Decide
    agent3_result = agent3.decide(
        score=score,
        attempt=session.current_attempt,
        misconception_tag=session.misconception_tag
    )
    
    if agent3_result['next_action'] == 'pass':
        session.state = 'topic_mastered'
        return {"next_action": "pass", "next_topic": "Refraction"}
    
    elif agent3_result['next_action'] == 'regenerate':
        session.current_attempt += 1
        session.state = 'showing_feedback'
        return {
            "next_action": "regenerate",
            "show_feedback": True,
            "misconception_tag": session.misconception_tag
        }
    
    elif agent3_result['next_action'] == 'exit':
        session.state = 'graceful_exit'
        return {"next_action": "exit", "message": "Great effort! Revisit later."}

@app.get("/feedback/visual")
def get_feedback_visual(tag: str, attempt: int):
    """Return red/green SVG templates for misconception tag"""
    template = db.query_feedback_template(tag, attempt)
    return {
        "red_svg": template['red_svg_code'],
        "green_svg": template['green_svg_code'],
        "annotation": template['annotation_json']
    }

@app.get("/progress/:user_id")
def get_progress(user_id: str):
    """Dashboard: mastery, misconception log"""
    progress = db.query_progress(user_id)
    misconceptions = db.query_misconceptions(user_id)
    return {
        "topics": progress,
        "misconception_history": misconceptions
    }
```

---

## **10. DATABASE SCHEMA**

### **Complete PostgreSQL Schema**

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Questions (dynamically generated or pre-built)
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  topic VARCHAR(100),                 -- "Reflection", "Refraction"
  subtopic VARCHAR(100),              -- "Laws of Reflection", "Image Formation"
  question_text TEXT,
  options JSONB,                      -- Array of option objects
  difficulty VARCHAR(20),             -- "beginner", "intermediate", "advanced"
  source VARCHAR(50),                 -- "mistral_api", "pre_built", "template"
  generated_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Example options JSONB structure:
-- {
--   "options": [
--     {"text": "...", "correct": true, "misconception_tag": null},
--     {"text": "...", "correct": false, "misconception_tag": "angle_from_surface"},
--   ]
-- }

-- Quiz attempts (diagnostic, comprehension)
CREATE TABLE quiz_attempts (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  topic VARCHAR(100),
  subtopic VARCHAR(100),
  quiz_type VARCHAR(20),              -- "diagnostic", "comprehension"
  attempt_number INT,
  questions_ids INT[] REFERENCES questions(id),
  answers INT[],                      -- indices of selected options
  score INT,                          -- number correct
  total INT,                          -- total questions
  misconception_tags TEXT[],          -- tags detected from wrong answers
  primary_misconception_tag VARCHAR(100),
  level VARCHAR(20),                  -- "Beginner", "Intermediate", "Advanced"
  passed BOOLEAN,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Misconceptions (per user, tracks detection and resolution)
CREATE TABLE misconceptions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  topic VARCHAR(100),
  misconception_tag VARCHAR(100),
  first_detected_at TIMESTAMP,
  last_detected_at TIMESTAMP,
  refined_tag VARCHAR(100),           -- If tag shifted during attempts
  resolution_attempt INT,             -- 1, 2, or 3 (resolved after which attempt)
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMP
);

-- Student progress
CREATE TABLE progress (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  topic VARCHAR(100),
  subtopic VARCHAR(100),
  mastered BOOLEAN DEFAULT false,
  mastered_at TIMESTAMP,
  attempts_count INT DEFAULT 0,
  bridge_checkpoint_passed BOOLEAN DEFAULT false,
  current_level VARCHAR(20),
  last_updated TIMESTAMP DEFAULT NOW()
);

-- Content cache (LLM outputs to avoid duplicate calls)
CREATE TABLE content_cache (
  id SERIAL PRIMARY KEY,
  topic VARCHAR(100),
  misconception_tag VARCHAR(100),
  attempt_number INT,
  explanation_text TEXT,              -- LLM-generated explanation
  svg_code TEXT,                      -- Final SVG (template + annotations merged)
  strategy_used VARCHAR(100),         -- "standard_physics", "analogy", "step_by_step"
  generated_at TIMESTAMP,
  UNIQUE(topic, misconception_tag, attempt_number)
);

-- Feedback templates (red/green overlays)
CREATE TABLE feedback_templates (
  id SERIAL PRIMARY KEY,
  misconception_tag VARCHAR(100) UNIQUE,
  red_svg_code TEXT,                  -- Wrong answer visual
  green_svg_code TEXT,                -- Correct answer visual
  annotation_json JSONB,              -- Labels to inject into green SVG
  attempt_number INT DEFAULT 1,       -- Which attempt(s) this is used for
  created_at TIMESTAMP DEFAULT NOW()
);

-- SVG templates library
CREATE TABLE svg_templates (
  id SERIAL PRIMARY KEY,
  template_name VARCHAR(100),         -- "reflection_standard_slider"
  template_type VARCHAR(50),          -- "interactive", "static", "analogy"
  topic VARCHAR(100),
  svg_code TEXT,                      -- Base SVG with placeholder IDs
  placeholders JSONB,                 -- {id: "normal_label", type: "text"}
  created_at TIMESTAMP DEFAULT NOW()
);

-- Adaptation log (audit trail of Agent 3 decisions)
CREATE TABLE adaptation_log (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  topic VARCHAR(100),
  attempt_number INT,
  decision VARCHAR(100),              -- "pass", "regenerate", "exit", "bridge"
  reason TEXT,
  previous_misconception_tag VARCHAR(100),
  refined_misconception_tag VARCHAR(100),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX idx_questions_topic ON questions(topic);
CREATE INDEX idx_questions_tag ON questions USING GIN(options -> 'misconception_tags');
CREATE INDEX idx_quiz_attempts_user ON quiz_attempts(user_id);
CREATE INDEX idx_misconceptions_user_topic ON misconceptions(user_id, topic);
CREATE INDEX idx_progress_user ON progress(user_id);
CREATE INDEX idx_content_cache_lookup ON content_cache(topic, misconception_tag, attempt_number);
CREATE INDEX idx_adaptation_log_user ON adaptation_log(user_id);
```

---

## **11. API ENDPOINTS**

### **Complete API Reference**

```

═══════════════════════════════════════════════════════════════════════

SESSION MANAGEMENT

═══════════════════════════════════════════════════════════════════════

POST /session/start
  Purpose: Create StudentSession, trigger diagnostic quiz
  Input:  { user_id, topic }
  Output: { session_id, questions[], state }
  Agent:  Agent 1 (question selection)

POST /session/reset/:session_id
  Purpose: Clear session, start new topic
  Input:   { new_topic }
  Output:  { session_id, questions[], state }

═══════════════════════════════════════════════════════════════════════

QUIZ & ASSESSMENT

═══════════════════════════════════════════════════════════════════════

POST /quiz/submit
  Purpose: Student submits answers → Agent 1 evaluates
  Input:   { session_id, answers: [0, 1, 2, 0] }
  Output:  { 
              explanation_text, 
              svg_code, 
              misconception_tag,
              level,
              state: "viewing_content"
            }
  Agents:  Agent 1 (score), Agent 2 (generate content)

GET /quiz/:session_id
  Purpose: Fetch current quiz questions for display
  Input:   { session_id }
  Output:  { questions: [...], session_state }

═══════════════════════════════════════════════════════════════════════

CONTENT & EXPLANATIONS

═══════════════════════════════════════════════════════════════════════

POST /content/generate
  Purpose: Manually request content (usually called after Agent 3 decides)
  Input:   { misconception_tag, attempt, level }
  Output:  { explanation_text, svg_code, strategy_used }
  Agent:   Agent 2

POST /content/validate
  Purpose: Validate SVG and explanation quality (optional, for debugging)
  Input:   { svg_code, explanation_text }
  Output:  { valid: true/false, errors: [...] }

═══════════════════════════════════════════════════════════════════════

VISUAL FEEDBACK

═══════════════════════════════════════════════════════════════════════

GET /feedback/visual
  Purpose: Get red/green SVG overlays for feedback sequence
  Query:   ?tag=angle_from_surface&attempt=1
  Output:  { 
              red_svg,
              green_svg,
              annotation_json,
              timing: { red_duration_ms: 500, green_duration_ms: 3000 }
            }

═══════════════════════════════════════════════════════════════════════

ADAPTATION & DECISIONS

═══════════════════════════════════════════════════════════════════════

POST /adapt/decide
  Purpose: After comprehension quiz, Agent 3 decides next action
  Input:   { session_id, comprehension_answers, attempt_number }
  Output:  {
              next_action: "pass" | "regenerate" | "exit" | "bridge",
              show_feedback: boolean,
              misconception_tag: "string",
              refined_tag: "string" (if shifted),
              reason: "string"
            }
  Agent:   Agent 3

═══════════════════════════════════════════════════════════════════════

PROGRESS & DASHBOARD

═══════════════════════════════════════════════════════════════════════

GET /progress/:user_id
  Purpose: Get mastery status and misconception history
  Output:  {
              topics: [
                { name: "Reflection", mastered: true, mastered_at: "..." },
                { name: "Refraction", mastered: false, attempts: 2 }
              ],
              misconception_history: [
                { tag: "angle_from_surface", resolved: true, attempts: 2 },
                { tag: "normal_orientation_wrong", resolved: false, attempts: 1 }
              ],
              overall_progress_percent: 50
            }

GET /checkpoint/:user_id
  Purpose: Fetch bridge checkpoint quiz (Reflection → Refraction)
  Input:   { user_id }
  Output:  { questions: [...], purpose: "bridge_checkpoint" }
  Note:    Only served after Reflection mastered

═══════════════════════════════════════════════════════════════════════

ADMIN & DEBUGGING

═══════════════════════════════════════════════════════════════════════

GET /adaptation_log/:user_id
  Purpose: Audit trail of all Agent 3 decisions for a user
  Output:  [{
              attempt, decision, reason, 
              previous_tag, refined_tag, timestamp
            }]

GET /content_cache/stats
  Purpose: Cache hit rate, popular misconceptions
  Output:  { 
              total_requests: 1000,
              cache_hits: 850,
              hit_rate: 0.85,
              most_common_tags: ["angle_from_surface", "normal_orientation_wrong"]
            }

═══════════════════════════════════════════════════════════════════════
```

---

## **12. USER JOURNEY (STEP-BY-STEP)**

### **Complete User Flow from Start to Mastery**

```
STUDENT PERSPECTIVE:

Week 1:
  ├─ Opens app
  ├─ Sees: "Select a topic: [Reflection] [Refraction]"
  ├─ Clicks: "Reflection"
  │
  └─ SYSTEM PERSPECTIVE:
     ├─ Orchestrator: Create StudentSession
     ├─ Agent 1: Select 5 diagnostic MCQs
     └─ Frontend: Display quiz
  
  ├─ Takes diagnostic quiz (5 questions, no feedback)
  ├─ Thinks: "This is hard, I don't really understand angles..."
  ├─ Submits answers
  │
  └─ SYSTEM PERSPECTIVE:
     ├─ Agent 1: "Score = 60%. Level = Intermediate. 
     │            Primary misconception = angle_from_surface"
     ├─ Agent 2: "Generate Attempt 1 content for angle_from_surface"
     │   ├─ Prompt: "Explain why angles are measured from NORMAL..."
     │   ├─ LLM: Returns explanation text
     │   ├─ Template: Select reflection_standard_slider.svg
     │   └─ Final: explanation + interactive slider SVG
     └─ Orchestrator: Send content to frontend
  
  ├─ Sees explanation: "You might think angle is measured from the 
  |  surface itself, but it's always measured from an imaginary line 
  |  perpendicular to the surface called the NORMAL..."
  |
  ├─ Sees interactive SVG: slider that adjusts angle in real-time
  ├─ Drags slider, thinks: "Oh! When I move from normal, angle changes.
  |  When I measure from surface, it's different. I think I get it now."
  ├─ Clicks: "I understand" button
  │
  └─ SYSTEM: Takes comprehension quiz (3 new questions)
  
  ├─ Comprehension quiz: "What is angle of incidence if ray hits at 30°
  |  from surface?" 
  |  Options: A) 30°  B) 60°  C) 90°  D) 120°
  ├─ Thinks about slider, selects: B) 60° ✓ CORRECT!
  ├─ Question 2: Also correct ✓
  ├─ Question 3: Wrong ✗ (selects 30°, angle_from_surface misconception)
  ├─ Submits: 2/3 correct
  │
  └─ SYSTEM PERSPECTIVE:
     ├─ Agent 1: Evaluates comprehension. Score = 66.7%. PASS threshold ≥ 66.7%
     ├─ Agent 3: "2/3 is enough. Student has basic understanding.
     │            Mark angle_from_surface as RESOLVED (Attempt 1).
     │            Move to next misconception: normal_orientation_wrong"
     └─ Orchestrator: Signal PASS
  
  ├─ Sees: "✓ Excellent! You've mastered Laws of Reflection!"
  ├─ Dashboard shows: Progress 50% (1 of 2 subtopics done)
  ├─ Sees: "Next: Bridge Checkpoint"
  └─ Clicks to continue
  
  ├─ Bridge checkpoint quiz: "Connect Reflection knowledge to Refraction"
  ├─ Answers 4 questions connecting concepts
  ├─ Score = 3/4
  │
  └─ SYSTEM: Agent 3 decides: "Bridge passed. Unlock Refraction."
  
  ├─ Now sees: "Ready to learn Refraction!"
  └─ Entire flow repeats for Refraction topics
  
  ┌─ After completing Refraction:
  │
  ├─ Dashboard: "✓ Reflection ✓ Refraction"
  ├─ Mastery overview: 100%
  ├─ Misconception log:
  |  ├─ angle_from_surface (Resolved, Attempt 1)
  |  ├─ [9 other tags] (Resolved)
  |  └─ normal_orientation_wrong (Still appears in refraction, learning)
  ├─ "You've completed the full Light chapter!"
  └─ Certificate / completion screen


WHAT IF STUDENT STRUGGLES:

Scenario: Student fails comprehension quiz (1/3 correct)

  ├─ SYSTEM: Agent 3 decides: "FAIL. Score < 66.7%."
  ├─ Frontend: Shows RED/GREEN feedback sequence
  │
  │  T=0.0s: RED overlay appears
  │  ├─ Red SVG shows: Wrong angle measurement from surface
  │  ├─ Text: "❌ This is your mistake"
  │  └─ Lasts 0.5 seconds
  │
  │  T=0.5s: RED fades, GREEN fades in
  │  ├─ Green SVG shows: Correct angle from normal
  │  ├─ LLM-generated annotation: "The NORMAL is perpendicular (90°).
  │  │  Measure angle FROM this line, not from the surface."
  │  └─ Lasts 3 seconds
  │
  │  T=3.5s: Student can click "Continue to Attempt 2"
  │
  ├─ SYSTEM: Agent 2 called with attempt_number=2
  │  ├─ Strategy: "misconception_targeted" (attack false belief directly)
  │  ├─ LLM prompt: "Student thinks angle is from surface.
  │  │             Explain why this is WRONG and why normal is right.
  │  │             Use analogy: measuring building height."
  │  ├─ LLM returns: New explanation (different from Attempt 1)
  │  ├─ Template: reflection_analogy_drag.svg (draggable ray)
  │  └─ SVG shows: Student can drag ray, see how normal angle changes
  │
  ├─ Frontend: Shows new content (different strategy, different SVG)
  ├─ Student: "Oh! I see the analogy. Building height from ground, not roof.
  │             Angle from normal, not surface. THAT makes sense!"
  ├─ Takes comprehension quiz again: 2/3 correct ✓ PASS
  │
  └─ Topic mastered after Attempt 2


WORST CASE: Student fails 3 times

  ├─ Attempt 1: Fails → Shows feedback → Attempt 2
  ├─ Attempt 2: Fails → Shows feedback → Attempt 3
  ├─ Attempt 3: Fails
  │
  └─ SYSTEM: Agent 3 decides: GRACEFUL EXIT
     ├─ Frontend: "You've worked hard on this concept. 
     │            Let's revisit it later when you're fresh.
     │            Your progress is saved!"
     ├─ Progress table: Saved misconception_tag = "angle_from_surface"
     └─ Dashboard: Shows "In Progress" but not blocked
        Student can retry later, system remembers where they left off
```

---

## **13. DEVELOPMENT TIMELINE (21 WEEKS)**

```
WEEKS 1-3: FOUNDATION
├─ Setup FastAPI project structure
├─ Design Orchestrator (StudentSession, state machine)
├─ Design database schema
├─ Implement PostgreSQL migrations
├─ Setup React project + routing
├─ Create basic component structure (Quiz, Content, Progress)
└─ Deliverable: Skeleton app works end-to-end (no agents yet)

WEEKS 4-5: LLM INTEGRATION
├─ Integrate Mistral API (question generation)
│  └─ Your team's responsibility — verify it works, test quality
├─ Integrate OpenAI gpt-4o-mini (explanations + SVG annotations)
├─ Write & test 90 prompts (30 tags × 3 attempts)
├─ Build prompt manager + caching
└─ Deliverable: LLM calls working, responses cached in DB

WEEKS 6-8: SVG & VISUAL FEEDBACK ENGINE
├─ Design feedback_templates schema
├─ Create 7 pre-built SVG templates:
│  ├─ reflection_standard_slider (interactive angle slider)
│  ├─ reflection_analogy_drag (draggable ray, analogy labels)
│  ├─ reflection_stepbystep_static (numbered steps)
│  ├─ lens_object_drag (draggable object/image)
│  ├─ lens_analogy_static (analogy-based SVG)
│  └─ lens_stepbystep_static (step-by-step)
│  └─ feedback_redgreen_overlay (red/green feedback templates for all 30 tags)
├─ Implement SVG-to-React rendering
├─ Build red/green feedback sequence (0.5s + 3s timing)
├─ Test interactivity: sliders, drag, click
└─ Deliverable: Interactive SVGs working, feedback sequence smooth

WEEKS 9-10: QUESTION BANK
├─ Generate 20-25 questions per misconception tag (all 30 tags)
│  └─ Use Mistral API (or pre-built)
├─ Validate question quality (correct answer, misconceptions on distractors)
├─ Tag questions with misconception_tags
├─ Load into PostgreSQL
├─ Build question selection queries
└─ Deliverable: 600+ questions in DB, queries tested

WEEKS 11-12: AGENT 1 (ASSESSMENT)
├─ Implement question selection logic
│  ├─ First visit: select diagnostic (mixed difficulty)
│  └─ Returning: select by previous misconceptions
├─ Implement scoring function
├─ Implement level classification (Beginner/Intermediate/Advanced)
├─ Implement misconception detection from wrong answers
├─ Test end-to-end: questions → answers → scores → tags
└─ Deliverable: Agent 1 fully functional, audit log accurate

WEEKS 13-14: AGENT 2 (CONTENT GENERATION)
├─ Implement cache check
├─ Implement strategy selector (attempt 1/2/3)
├─ Implement LLM text generation (call OpenAI)
├─ Implement SVG template selection
├─ Implement LLM annotation merging into templates
├─ Implement validation + fallback
├─ Test all 3 strategies, all tags, all SVGs
└─ Deliverable: Agent 2 generates consistent, valid content

WEEKS 15-16: AGENT 3 (ADAPTATION)
├─ Implement pass/fail logic (2/3 threshold)
├─ Implement attempt routing (1→2→3→exit)
├─ Implement misconception refinement detection
├─ Implement visual feedback trigger
├─ Implement graceful exit
├─ Implement bridge checkpoint logic
├─ Test all decision paths
└─ Deliverable: Agent 3 makes correct decisions, audit log complete

WEEKS 17: ORCHESTRATOR INTEGRATION
├─ Wire all 3 agents into Orchestrator
├─ Implement all API endpoints
├─ Implement StudentSession state machine
├─ Test end-to-end flow (multiple attempts, passes, failures)
├─ Performance testing: response times, DB queries
└─ Deliverable: Full system end-to-end working

WEEKS 18: PROGRESS DASHBOARD
├─ Build mastery overview (2 topics, % complete)
├─ Build misconception history view (tags, resolved/unresolved)
├─ Implement progress calculations
├─ Add completion certificate / screen
├─ Style & polish UI
└─ Deliverable: Dashboard fully functional

WEEKS 19-20: INTEGRATION + TESTING
├─ End-to-end testing (10 full flows, different scenarios)
├─ Performance testing (load, latency, cache hit rates)
├─ Bug fixes, edge case handling
├─ Demo script preparation (3-4 student journeys)
├─ Documentation (API docs, code comments)
└─ Deliverable: Bug-free, polished, ready for demo

WEEKS 21: BUFFER + POLISH
├─ Final tweaks based on panel feedback (if early demo)
├─ Documentation review
├─ Performance optimization
├─ Prepare presentation slides
└─ Deliverable: Production-ready system

```

---

## **14. TECHNOLOGY STACK JUSTIFICATION**

### **Frontend: React**

**Why React?**
- Component-based → easy to manage Quiz, Content, Progress pages
- SVG rendering → simple `dangerouslySetInnerHTML` for dynamic SVGs
- Routing → React Router for topic selection, content pages
- State management → useState for StudentSession, quiz answers, feedback state
- Ecosystem → mature, plenty of examples

**Alternatives considered:**
- Vue: Lighter, but React is more standard for enterprise (better for future maintenance)
- Svelte: Performance-optimal, but smaller ecosystem
- Vanilla JS: Too low-level, harder to manage state

### **Backend: FastAPI**

**Why FastAPI?**
- Async/await → easy to handle concurrent requests from multiple students
- Type hints → validation built-in, catches errors early
- Speed → one of the fastest Python frameworks (close to Node.js)
- Simplicity → clean routing, easy to test
- Pydantic → automatic validation of request/response models

**Alternatives considered:**
- Django: Heavier, overkill for this project
- Flask: Lighter, but less async support
- Node.js: Fast, but Python is better for LLM integration

### **Database: PostgreSQL**

**Why PostgreSQL?**
- JSONB support → questions with nested options as single column
- Array types → questions_ids INT[], answers INT[], tags TEXT[]
- Powerful queries → complex WHERE conditions, full-text search
- Reliability → ACID compliance, good for quiz data
- Free & open-source

**Why not FAISS?**
- FAISS is for semantic similarity (finding "similar" vectors)
- We have **categorical** misconceptions (yes/no, not degrees)
- 50 questions → simple SQL queries faster than vector search
- FAISS adds complexity without benefit

**Why not NoSQL (MongoDB)?**
- Quiz data is structured (questions, options, scores)
- Relationships are important (user → attempts → misconceptions)
- ACID compliance is critical (quiz results must be accurate)

### **LLM: OpenAI gpt-4o-mini**

**Why gpt-4o-mini?**
- Cost: ~$0.00015 per 1K input tokens (cheap)
- Quality: Good enough for explanations + SVG annotations
- Speed: Fast responses (<1 second)
- Availability: Reliable API

**Why not gpt-4 or gpt-4-turbo?**
- Cost: 10x more expensive (overkill for constrained prompts)
- Speed: Slower (not needed for cached responses)

**Why not Mistral?**
- Your team already using Mistral for question generation
- gpt-4o-mini is better for nuanced explanations (Mistral is simpler)
- Mixing APIs = more monitoring, but both work

### **SVG Engine: Vanilla JS + Pre-built Templates**

**Why not Manim (animation library)?**
- Manim renders animations as video → must be pre-recorded
- Can't be interactive → student can't drag slider
- File size → large, slow to load
- Not in scope for this project

**Why pre-built templates?**
- Reliability → guaranteed valid SVG
- Interactive → can add event listeners (onClick, drag)
- LLM-safe → LLM only adds text, not structure
- Fast → no rendering required

**Why not pure LLM SVG?**
- LLM SVG often has syntax errors → visual breaks
- Hard to validate → can't guarantee correctness
- Unpredictable → same topic, different SVG structure each time
- Interactive features → hard to add programmatically

---

## **15. OPTIONAL BONUS FEATURES**

### **Descriptive Answer Evaluation**

**Status:** Build only after Week 20 if time permits.

**What:** Instead of multiple-choice, student writes free-text answer. LLM evaluates against rubric.

**Example:**
```
Question: "Explain why the angle of incidence equals angle of reflection."

Student answer: "Because the light bounces off and comes back at the same angle."

Rubric:
  ✓ Mentions law/rule
  ✓ References angle equality
  ✗ Explains WHY (mechanism) — missing

Feedback: "Good start! You know the law. Now explain WHY angles are equal.
           Hint: Use the normal line and geometry."
```

**Implementation:**
```python
def evaluate_descriptive(question_text: str, student_answer: str, rubric: dict):
    prompt = f"""
    Question: {question_text}
    Student answer: {student_answer}
    Rubric: {rubric}
    
    Evaluate the answer against the rubric. Return JSON:
    {{
      "score": 0-100,
      "strengths": [...],
      "gaps": [...],
      "feedback": "...",
      "misconception_detected": "tag or null"
    }}
    """
    response = openai.ChatCompletion.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    return json.loads(response.choices[0].message.content)
```

**Why optional?**
- LLM evaluation less reliable than multiple-choice
- Takes longer to evaluate → slower user experience
- Doesn't affect core adaptation logic (system doesn't change behavior based on it)
- Nice-to-have for enriched data, not essential for learning

---

## **FINAL CHECKLIST**

- ✅ Full Light chapter (Reflection + Refraction)
- ✅ 30 misconceptions mapped and addressed
- ✅ LLM-based dynamic question generation (Mistral)
- ✅ 3 agents: Assessment, Content Generation, Adaptation
- ✅ Orchestrator managing state and routing
- ✅ 3 explanation strategies (standard, analogy, step-by-step)
- ✅ 7 pre-built SVG templates with interactivity
- ✅ Red/green visual feedback engine (3-part sequence)
- ✅ Per-tag LLM prompt strategy (90 prompts total)
- ✅ PostgreSQL schema (no FAISS)
- ✅ Misconception refinement (tag can shift)
- ✅ Bridge checkpoint (Reflection → Refraction)
- ✅ Graceful exit after 3 failed attempts
- ✅ Progress dashboard with mastery tracking
- ✅ Audit log (adaptation decisions logged)
- ✅ API endpoints (13 total)
- ✅ 21-week development timeline
- ✅ Error-free, production-ready spec

---

**END OF ARCHITECTURE DOCUMENT**

---

This is your final specification. Build exactly this. No more changes.
