# Project Upgradation: 20-Day Plan to an "Adaptive AI Tutor"

## What You Have vs. What "Adaptive AI Tutor" Actually Means

Right now your system is:
- Detect misconception → show visual → generate targeted quiz
- That's it. One reactive step. Not a loop.

A real adaptive tutor does:
- Detect misconception → change teaching strategy based on who the student is and how many times they've struggled → remember that across sessions → visibly prove to the student that it knows them

The difference is a loop that closes, memory that persists, and personalization that's visible to the student — not just happening invisibly in the backend.

---
## Everything Realistically Buildable in 20 Days

### Tier 1 — Makes It Actually Adaptive (Non-negotiable)

**1. Real 3-Attempt Loop with Strategy Escalation**
The core missing piece. Right now attempt tracking doesn't exist end-to-end.
- Attempt 1 wrong → visual correction only, no LLM (let them think)
- Attempt 2 wrong (same tag) → LLM explanation using their specific wrong answer as context
- Attempt 3 wrong (same tag) → completely different analogy + "Let's revisit the lesson" redirect button back to the animation
- Backend: `adaptation_agent.py` gets real logic, attempt count stored in DB per (student, topic, tag)
- Frontend: "Round 2 - Targeted Practice" visible label, escalating UI feedback

**2. Cross-Session Misconception Memory**
When a student returns, the system uses their history — not just what happened this session.
- DB already stores misconceptions JSON per student. Need to actually use it.
- On quiz load: fetch student profile, pre-seed tutor context with their top 2 persistent misconceptions
- Quiz generator gets: "This student has gotten angle_from_surface wrong 4 times across 3 sessions. Prioritize this."
- "Welcome back [name]. Last time you struggled with [X]. Let's see if that's improved." shown on session start.

**3. Learning Profile Panel in Dashboard**
Makes the adaptation visible. Students and interviewers both respond to this.
- Per-topic: accuracy trend, attempts count, resolved/unresolved badge
- "Your persistent weak spots" section — top 3 misconception tags with human-readable names
- "Topics mastered" vs "Topics needing work" split
- This is what makes a student feel the system actually knows them

---
### Tier 2 — Makes It Feel Genuinely Personalised (High Impact)

**4. Persona Engine (Lite but Real)**
This is your most differentiating planned feature. The key is doing it honestly.

Onboarding flow (shown once after first login, 3 questions):
- Background: Urban / Small Town / Rural
- Confidence in physics: Low / Medium / High
- What you relate to: Daily life examples / Sports & games / Technology

What changes based on persona:
- `prompt_builder.py` gets a persona parameter — generates different analogies
  - Rural/low-confidence: "Think of how a torch shines on a wall..." everyday analogies
  - Urban/high-confidence: technical language, proper physics terms
  - Sports persona: cricket ball bouncing, light like a bowling trajectory
- The LLM response actually reads differently — this is what interviewers will ask you to demo

The constraint: don't build this as a dropdown that changes nothing. The prompt templates need to actually produce meaningfully different explanations for the same misconception. That's 2-3 days of prompt engineering work.

**5. Explanation Quality Upgrade for Attempt 2 & 3**
Right now `prompt_builder.py` exists but the prompts are generic. With attempt number AND persona AND the student's specific wrong answer, you have everything for a genuinely targeted explanation.
- Attempt 2 prompt: "Student answered [wrong option text]. They believe [misconception]. Using [persona] analogies, correct this specific belief."
- Attempt 3 prompt: "Previous two explanations didn't work. Try a completely different angle. Use a concrete real-world scenario."
- This is what makes the LLM output actually feel personalized vs. generic.

---
### Tier 3 — Makes It Complete (Curriculum Coverage)

**6. Refraction Lesson Content**
Right now refraction-intro jumps straight to quiz. No lesson exists.
- Tell stage: text explanation of Snell's law
- Show stage: Pratham builds refraction SVG animation (bending ray at boundary, dense/rare medium, Snell's law visual)
- Try stage: interactive slider (change angle, see refraction change)
- Then quiz
- This makes the curriculum feel complete end-to-end

**7. Bridge Checkpoint: Reflection → Refraction Gate**
Currently `bridge_controller.py` is 8 lines and does nothing.
- After Laws of Reflection quiz: if accuracy < 60%, student sees "Master Reflection first before moving to Refraction" with specific weak spots listed
- Simple condition check — not complex logic, just routing with reasoning shown to student
- Makes the adaptive tutoring feel structured and intentional

**8. Explanation Cache Activation**
Already built in `llm_service.py` — `use_cache` param exists but is never set to True.
- Change two lines in `content_agent.generate()` to pass `use_cache=True`
- Now explanations for repeated (tag, attempt, subtopic) combos load instantly from DB
- Reduces latency on second+ attempts and saves API quota

---
### Tier 4 — Demo Readiness (Makes It Shippable)

**9. Student Testing (Real Data)**
Without this, everything else is theoretical.
- Get 5 students (classmates, juniors) to use it over 2-3 days
- Watch 2 of them live — note every moment of confusion
- Target outcome: "3/5 students improved score on same topic on second attempt." That's a result.
- This data becomes your strongest interview answer to "Does it actually work?"

**10. Demo Path Polish**
- Loading states everywhere (quiz generation takes 10-15 seconds — the spinner should feel intentional, not broken)
- Error states (what happens if Gemini fails? Show something useful, not a blank screen)
- The "happy path" from login → lesson → quiz → misconception detected → retry → improved score should work perfectly in 3 minutes
- Record a 2-minute screen recording of this exact path

---
## 20-Day Week-by-Week Plan

### Week 1 (Days 1–5): The Adaptive Loop
| Day | What Gets Built |
|-----|-----------------|
| 1–2 | `adaptation_agent.py` with real 3-attempt logic, attempt count in DB, `routes.py` calls it |
| 3   | Frontend: attempt counter state, "Round 2" UI, escalating visual feedback |
| 4   | Attempt 3 → "Revisit lesson" redirect back to animation stage |
| 5   | Cross-session memory: fetch student profile on quiz load, tutor context uses their history |

### Week 2 (Days 6–10): Personalization
| Day | What Gets Built |
|-----|-----------------|
| 6   | Session greeting: "Welcome back [name], you last struggled with [X]" |
| 7   | Learning profile panel in Dashboard (weak spots, resolved topics, accuracy trend) |
| 8–9 | Persona Engine: onboarding flow (3 questions), stored in DB + sessionStore |
| 10  | `prompt_builder.py` updated: persona + attempt + student's wrong answer all fed into prompt |

### Week 3 (Days 11–15): Content Completion
| Day | What Gets Built |
|-----|-----------------|
| 11–12| Refraction SVG animation (Pratham) + Tell/Show/Try lesson stages wired in `App.jsx` |
| 13  | Bridge checkpoint: reflection mastery gate before refraction unlocks |
| 14  | Explanation prompt templates polished for all 3 attempts × 3 personas |
| 15  | Explanation cache activated, DB schema verified end-to-end |

### Week 4 (Days 16–20): Testing & Polish
| Day | What Gets Built |
|-----|-----------------|
| 16–17| Real student testing — 5 students, watch 2 live |
| 18  | Fix everything that broke during testing |
| 19  | Loading states, error states, demo path polished |
| 20  | 2-minute demo recording, interview talking points written |

---
## The Interview Story at Day 20

"A Class 10 student opens the app. We ask them 3 questions — their background, confidence level, and what they relate to. From that point, every explanation they receive uses analogies tailored to them specifically.

They start Laws of Reflection. They watch an animation, then take a quiz. They answer wrong — the system detects they believe the angle is measured from the mirror surface, not the normal. It shows them a visual correction with red (their belief) and green (correct physics) rays.

They take a targeted remedial quiz. They get it wrong again — second attempt. Now the system generates a completely different explanation using their specific wrong answer and their persona. For a rural student who relates to daily life, it explains using a torch on a wall. For a sports-oriented student, it uses a cricket ball bouncing off a bat.

If they fail a third time, the system says 'Let's revisit this' and redirects them back to the animation — the loop closes.

When they come back the next day, the system remembers. It says 'You struggled with angle measurement last time. Let's test that specifically.' Their dashboard shows which misconceptions are resolved and which are still open.

Before they move to Refraction, the system checks: did they master Reflection? If not, it tells them exactly what to fix first.

We built a deterministic physics engine because we tried LLM for SVG generation — it failed. Gemini couldn't keep rays hitting focal points correctly. So we rejected LLM where it was weak and used it only for what it's good at: generating text explanations that vary by persona and attempt."
