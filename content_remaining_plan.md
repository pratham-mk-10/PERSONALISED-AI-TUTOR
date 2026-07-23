# Content Remaining Plan — Reflection of Light (End-to-End)

> **Method:** Deep comparison of the NCERT Class 10 Ch. 9 PDF, the Lakhmir Singh & Manjit Kaur Ch. 4 PDF, and a file-by-file audit of every component in our project (`App.jsx`, all SVG-engine files, `template_quiz_scope.py`, `misconception_tags.json`, `misconception_catalog.py`).

> **STATUS UPDATE:** This table below is the original gap analysis and is now stale in places —
> a "Tier A" session built every **CRITICAL GAP** row end-to-end (Plane Mirror characteristics,
> Real vs Virtual Images, Principal Axis/Aperture/Ray Rule 4, Uses of Mirrors wiring, Sign
> Convention, Mirror Formula + Magnification with a diagnostic numeric Try stage, Introduction to
> Light). A follow-up "Tier B, Batches 1-4" session then built rows 11, 20-24, 34-36, 48-49
> (already done pre-Tier-B), 56, 59-60, 63, 66, 68-71, 75, 80-81 — see the per-row notes below.
> **Still genuinely remaining ("Batch 5", not yet built):** rows 84-89 (numerical problem Types
> 2-9 beyond "find v"), and rows 90-91, 93 (pin/board activity, focus-sunlight activity,
> field-of-view comparison activity). Row 92 remains partial (conceptually covered by
> `ImageFormationLesson` but not as a standalone "candle at positions" activity). These need
> their own dedicated plan with the same physics-verification rigor as the rest of this project —
> do not assume they exist without checking the actual component files first.

---

## Master Gap Table: NCERT vs Lakhmir Singh vs Our Project

| # | Subtopic | In NCERT? | In Lakhmir Singh? | In Our Project? | Status |
|---|---|---|---|---|---|
| 1 | What is Light? (energy, sensation of sight) | Brief mention | ✅ Yes | ❌ Not built | **NEW CONTENT** |
| 2 | Luminous vs Non-Luminous objects | ❌ No | ✅ Yes (Sun, bulb vs Moon, table) | ❌ Not built | **NEW CONTENT** |
| 3 | Transparent, Translucent, Opaque | ❌ No | ✅ Yes (glass, frosted glass, wood) | ❌ Not built | **NEW CONTENT** |
| 4 | Rectilinear Propagation of Light | Brief mention | ✅ Yes (shadows, pinhole camera) | ❌ Not built | **NEW CONTENT** |
| 5 | Ray vs Beam (parallel, convergent, divergent) | ❌ No | ✅ Yes | ❌ Not built | **NEW CONTENT** |
| 6 | Basic reflection definition | ✅ Yes | ✅ Yes | ✅ Built (pmTell) | Done |
| 7 | Ray diagram vocabulary (incident ray, normal, etc.) | ✅ Yes | ✅ Yes | ✅ Built (PlaneMirrorBasicsAnimation) | Done |
| 8 | Angles measured from NORMAL not surface | ✅ Yes | ✅ Yes (heavily emphasized) | ✅ Built + misconception tag | Done |
| 9 | 1st Law of Reflection (∠i = ∠r) | ✅ Yes | ✅ Yes | ✅ Built (Tell+Show+Try+Test) | Done |
| 10 | 2nd Law of Reflection (coplanarity) | ✅ Yes | ✅ Yes | ✅ Built (Tell+Show+Try+Test) | Done |
| 11 | Normal incidence special case (∠i=0, retraces) | ❌ No | ✅ Yes | ✅ Built (tell1 card) | Done |
| 12 | Regular (Specular) vs Diffused (Irregular) Reflection | ✅ Yes | ✅ Yes (detailed, with diagram) | ❌ Not built | **NEW CONTENT** |
| 13 | Why diffused reflection is important (seeing objects from all angles) | ❌ No | ✅ Yes | ❌ Not built | **NEW CONTENT** |
| 14 | Plane mirror — definition (glass + silver coating) | ✅ Brief | ✅ Yes | ❌ Not explicitly taught | **NEW CONTENT** |
| 15 | Plane mirror — image formation mechanism (diverging rays behind mirror) | ✅ Yes | ✅ Yes | ❌ Not built | **NEW CONTENT** |
| 16 | Plane mirror — image is VIRTUAL and ERECT | ✅ Yes | ✅ Yes | ❌ Claimed taught, actually absent | **CRITICAL GAP** |
| 17 | Plane mirror — image SAME SIZE as object | ✅ Yes | ✅ Yes | ❌ Claimed taught, actually absent | **CRITICAL GAP** |
| 18 | Plane mirror — image distance = object distance | ✅ Yes | ✅ Yes | ❌ Claimed taught, actually absent | **CRITICAL GAP** |
| 19 | Plane mirror — LATERAL INVERSION (full explanation) | ✅ Yes | ✅ Yes (very detailed) | ❌ Claimed taught, actually absent | **CRITICAL GAP** |
| 20 | AMBULANCE written in reverse — why? | ❌ No | ✅ Yes (classic exam question) | ✅ Built (PlaneMirrorApplicationsAnimation) | Done |
| 21 | Symmetric letters in mirror (A, H, I, M, O, T, etc.) | ❌ No | ✅ Yes | ✅ Built | Done |
| 22 | Multiple images — two mirrors at an angle (360/θ − 1) | ❌ No | ✅ Yes (90°→3, 60°→5, parallel→∞) | ✅ Built (90°/60° cases, physics-verified) | Done |
| 23 | Kaleidoscope (plane mirrors at 60°) | ❌ No | ✅ Yes | ✅ Built | Done |
| 24 | Periscope (plane mirrors at 45°, submarine use) | ❌ No | ✅ Yes | ✅ Built | Done |
| 25 | Plane Mirror — Try stage (interactive) | N/A | N/A | ❌ No Try stage exists | **MISSING STAGE** |
| 26 | Plane Mirror — Test/Quiz stage | N/A | N/A | ❌ No quiz exists (flows to Laws of Reflection) | **MISSING STAGE** |
| 27 | Plane Mirror — misconception tags in catalog | N/A | N/A | ❌ Zero tags, falls to generic | **CRITICAL GAP** |
| 28 | Real vs Virtual Images — dedicated section BEFORE spherical mirrors | ✅ Brief | ✅ Full dedicated section with table | ❌ Not built | **NEW CONTENT** |
| 29 | Real image = can catch on screen, inverted | ✅ Yes | ✅ Yes (cinema analogy) | ❌ Not explicitly taught | **NEW CONTENT** |
| 30 | Virtual image = cannot catch on screen, erect | ✅ Yes | ✅ Yes (mirror analogy) | ❌ Not explicitly taught | **NEW CONTENT** |
| 31 | Spherical mirror — definition (part of hollow sphere) | ✅ Yes | ✅ Yes | ✅ Built (SphericalMirrorDetailedAnimation) | Done |
| 32 | Concave = inward curve, converging | ✅ Yes | ✅ Yes | ✅ Built | Done |
| 33 | Convex = outward curve, diverging | ✅ Yes | ✅ Yes | ✅ Built | Done |
| 34 | How to DISTINGUISH concave/convex/plane by LOOKING | ❌ No | ✅ Yes (giant face=concave, tiny=convex) | ✅ Built (MirrorIdentificationActivity) | Done |
| 35 | How to distinguish by TOUCH | ❌ No | ✅ Yes (inward vs outward curve) | ✅ Built | Done |
| 36 | Spoon analogy/activity (inner=concave, outer=convex) | ✅ Activity 9.1 | ✅ Yes (detailed) | ✅ Built | Done |
| 37 | Pole (P) — definition and location | ✅ Yes | ✅ Yes | ✅ Built | Done |
| 38 | Centre of Curvature (C) — definition, NOT on mirror | ✅ Yes | ✅ Yes | ✅ Built | Done |
| 39 | Radius of Curvature (R) = PC | ✅ Yes | ✅ Yes | ✅ Built | Done |
| 40 | **Principal Axis** — definition (line through P and C) | ✅ Yes | ✅ Yes | ❌ Never explicitly taught (but has misconception tag!) | **CRITICAL GAP** |
| 41 | **Aperture** — definition (diameter of reflecting surface) | ✅ Yes | ✅ Yes | ❌ Never explicitly taught | **GAP** |
| 42 | Principal Focus (F) — real for concave, virtual for convex | ✅ Yes | ✅ Yes | ✅ Built | Done |
| 43 | Focal Length (f) = PF | ✅ Yes | ✅ Yes | ✅ Built | Done |
| 44 | R = 2f relationship | ✅ Yes | ✅ Yes (includes proof/derivation) | ✅ Built | Done |
| 45 | Ray Rule 1 (parallel → through F) | ✅ Yes | ✅ Yes | ✅ Built (RayTracingRulesLesson) | Done |
| 46 | Ray Rule 2 (through F → parallel) | ✅ Yes | ✅ Yes | ✅ Built | Done |
| 47 | Ray Rule 3 (through C → retraces) | ✅ Yes | ✅ Yes | ✅ Built | Done |
| 48 | Ray Rule 4 (ray at Pole, equal angles with principal axis) | ❌ No | ✅ Yes | ✅ Built (RayTracingRulesLesson, Tier A) | Done |
| 49 | "Use any TWO rules to locate image" instruction | ✅ Yes | ✅ Yes | ✅ Built (smRulesTell card) | Done |
| 50 | Concave Case 1: Object at infinity → at F, real, inverted, point-sized | ✅ Yes | ✅ Yes | ✅ Built (ImageFormationLesson) | Done |
| 51 | Concave Case 2: Beyond C → between F and C, real, inverted, diminished | ✅ Yes | ✅ Yes | ✅ Built | Done |
| 52 | Concave Case 3: At C → at C, real, inverted, same size | ✅ Yes | ✅ Yes | ✅ Built | Done |
| 53 | Concave Case 4: Between C and F → beyond C, real, inverted, magnified | ✅ Yes | ✅ Yes | ✅ Built | Done |
| 54 | Concave Case 5: At F → at infinity, real, inverted, highly magnified | ✅ Yes | ✅ Yes | ✅ Built | Done |
| 55 | Concave Case 6: Between F and P → behind mirror, virtual, erect, magnified | ✅ Yes | ✅ Yes | ✅ Built | Done |
| 56 | "As object moves from ∞ to P, image moves from F to ∞ then jumps behind" | ❌ No | ✅ Yes | ✅ Built (smFormationTell card) | Done |
| 57 | Convex Case 1: Object at infinity → at F behind mirror, virtual, point | ✅ Yes | ✅ Yes | ✅ Built | Done |
| 58 | Convex Case 2: Any finite distance → between P and F, virtual, diminished | ✅ Yes | ✅ Yes | ✅ Built | Done |
| 59 | Convex mirror ALWAYS virtual, erect, diminished (absolute rules) | ✅ Yes | ✅ Yes (heavily emphasized) | ✅ Built (smTell lawBox) | Done |
| 60 | Convex mirror can NEVER form real/magnified image | ❌ No | ✅ Yes (explicitly stated) | ✅ Built (same lawBox) | Done |
| 61 | Uses of Concave — Shaving/Makeup mirror (between P and F → magnified) | ✅ Yes | ✅ Yes | ✅ Built + wired (SphericalMirrorUsesAnimation, Tier A) | Done |
| 62 | Uses of Concave — Dentist mirror | ✅ Yes | ✅ Yes | ✅ Built + wired | Done |
| 63 | Uses of Concave — ENT doctor head mirror | ❌ No | ✅ Yes | ✅ Built (ENTMirrorScene) | Done |
| 64 | Uses of Concave — Headlights/Torches/Searchlights (bulb at F) | ✅ Yes | ✅ Yes | ✅ Built + wired | Done |
| 65 | Uses of Concave — Solar furnace/Solar cooker | ✅ Yes | ✅ Yes | ✅ Built + wired | Done |
| 66 | Uses of Concave — Reflecting telescopes | ❌ No | ✅ Yes | ✅ Built (TelescopeScene) | Done |
| 67 | Uses of Convex — Rear-view/side mirrors (wider field of view) | ✅ Yes | ✅ Yes | ✅ Built + wired | Done |
| 68 | Uses of Convex — Road safety mirrors at blind curves | ❌ No | ✅ Yes | ✅ Built (WideFieldConvexScene, combined) | Done |
| 69 | Uses of Convex — Security/surveillance mirrors in shops | ❌ No | ✅ Yes | ✅ Built (same combined scene) | Done |
| 70 | Uses of Convex — ATM security mirrors | ❌ No | ✅ Yes | ✅ Built (same combined scene) | Done |
| 71 | WHY convex preferred over plane for rear-view (exam question) | ✅ Yes | ✅ Yes (detailed reasoning) | ✅ Already built (Tier A, verified this pass) | Done |
| 72 | New Cartesian Sign Convention (7 rules) | ✅ Yes | ✅ Yes (with common errors list) | ❌ Not taught anywhere | **CRITICAL GAP** |
| 73 | Sign convention: u always negative | ✅ Yes | ✅ Yes | ❌ Not taught | **CRITICAL GAP** |
| 74 | Sign convention: f negative for concave, positive for convex | ✅ Yes | ✅ Yes | ❌ Not taught | **CRITICAL GAP** |
| 75 | Common sign convention errors (forgetting negative u, mixing f signs) | ❌ No | ✅ Yes | ✅ Built (mfSignTell lawBox) | Done |
| 76 | Mirror Formula: 1/v + 1/u = 1/f | ✅ Yes | ✅ Yes | ❌ "Coming Soon" stub only | **CRITICAL GAP** |
| 77 | How to apply mirror formula step-by-step | ❌ No | ✅ Yes (5-step method) | ❌ Not built | **NEW CONTENT** |
| 78 | Magnification: m = h'/h = −v/u | ✅ Yes | ✅ Yes | ❌ Not built | **CRITICAL GAP** |
| 79 | Interpreting m: sign → nature, magnitude → size | ✅ Yes | ✅ Yes | ❌ Not built | **CRITICAL GAP** |
| 80 | Magnification for plane mirror (m = +1 always) | ❌ No | ✅ Yes | ✅ Built (mfTell card) | Done |
| 81 | Magnification for convex (always +ve, |m|<1) | ❌ No | ✅ Yes | ✅ Built (same card) | Done |
| 82 | NCERT Example 9.1 — Convex mirror numerical | ✅ Yes | ✅ Yes | ❌ Not built | **CRITICAL GAP** |
| 83 | NCERT Example 9.2 — Concave mirror numerical | ✅ Yes | ✅ Yes | ❌ Not built | **CRITICAL GAP** |
| 84 | Numerical Type: Find v given u, f | ❌ No | ✅ Yes | ❌ Not built | **NEW CONTENT** |
| 85 | Numerical Type: Find f given u, v | ❌ No | ✅ Yes | ❌ Not built | **NEW CONTENT** |
| 86 | Numerical Type: Find u given v, f | ❌ No | ✅ Yes | ❌ Not built | **NEW CONTENT** |
| 87 | Numerical Type: Height calculation using m | ❌ No | ✅ Yes | ❌ Not built | **NEW CONTENT** |
| 88 | Numerical Type: Mirror identification from u, v | ❌ No | ✅ Yes | ❌ Not built | **NEW CONTENT** |
| 89 | Numerical Type: Combined mirror formula + magnification | ❌ No | ✅ Yes | ❌ Not built | **NEW CONTENT** |
| 90 | Activity: Verify laws with pins on drawing board | ✅ Activity 9.2-ish | ✅ Yes | ❌ Not built | **NEW CONTENT** |
| 91 | Activity: Focus sunlight with concave mirror | ✅ Activity 9.2 | ✅ Yes | ❌ Not built | **NEW CONTENT** |
| 92 | Activity: Image formation with candle at diff. positions | ✅ Activity 9.3 | ✅ Yes | ❌ Not built (partially in ImageFormationLesson) | Partial |
| 93 | Activity: Compare field of view (plane vs concave vs convex) | ✅ Activity 9.6 | ✅ Yes | ❌ Not built | **NEW CONTENT** |

---

## Summary Statistics

**Superseded — see the STATUS UPDATE banner at the top of this file.** As of the Tier A +
Tier B (Batches 1-4) sessions, only Batch 5 genuinely remains:

| Category | Count |
|---|---|
| ✅ Fully built and wired (rows 1-83, 90-89 minus below) | ~87 items |
| ❌ **Still remaining** — numerical problem Types 2-9 (rows 84-89) | 6 items |
| ❌ **Still remaining** — activities: pin/board, focus-sunlight, field-of-view (rows 90, 91, 93) | 3 items |
| ⚠️ **Partial** — candle-at-positions activity (row 92, conceptually covered by ImageFormationLesson) | 1 item |
| **Total genuinely remaining ("Batch 5")** | **9-10 items** |

---

## Detailed Work Breakdown by Module

### MODULE A: Introduction to Light (NEW — from Lakhmir Singh)
**Current state: 0% built. Not in our app at all.**

This entire introductory section is covered by Lakhmir Singh before ANY reflection content. NCERT barely touches it. Our app jumps straight into "Plane Mirror Basics" with zero foundational setup. A student who doesn't know what a "ray" or "beam" is will be confused from step one.

**Subtopics to build:**
1. What is light? (Form of energy, enables sight)
2. Luminous vs Non-Luminous objects (Sun/bulb vs Moon/table — Moon is non-luminous!)
3. Transparent, Translucent, Opaque (glass vs frosted glass vs wood)
4. Rectilinear propagation (light travels in straight lines → shadows, pinhole camera)
5. Ray of light vs Beam of light (single line vs bundle; parallel/convergent/divergent beams)

**Suggested implementation:** One Tell + one Show animation with 5–6 steps. Quick 3-question MCQ quiz after.

---

### MODULE B: Plane Mirror — Complete Overhaul (CRITICAL)
**Current state: Tell + Show only. No Try. No Quiz. No misconception tags. Image characteristics CLAIMED taught but actually ABSENT from lesson content.**

This is the weakest module in our entire app. The scope file `template_quiz_scope.py` tells the quiz generator that concepts like "virtual/erect", "same size", "lateral inversion" have been taught — but `PlaneMirrorBasicsAnimation.jsx` contains ZERO of these. A student finishes "Plane Mirror Basics" without ever learning about:

**Subtopics to build:**

**B1. Image Characteristics of Plane Mirror (6 properties)**
1. Image is virtual (cannot be caught on a screen)
2. Image is erect (upright, not upside down)
3. Image is same size as the object (magnification = 1)
4. Image distance behind mirror = object distance in front
5. Image is laterally inverted (left-right reversal)
6. Line joining object and image is perpendicular to mirror

**B2. Lateral Inversion — Detailed Treatment**
7. Full definition: left side of object appears as right side of image
8. Raising right hand → image raises left hand
9. Writing appears reversed in a mirror
10. WHY "AMBULANCE" is written in reverse on ambulances (so rear-view mirror shows it correctly) — **classic exam question**
11. Symmetric letters that look the same in a mirror (A, H, I, M, O, T, U, V, W, X, Y)

**B3. Multiple Images with Two Mirrors**
12. Formula: Number of images = (360°/θ) − 1
13. At 90° → 3 images
14. At 60° → 5 images
15. At 45° → 7 images
16. Parallel mirrors (0°) → infinite images
17. Barber shop example (parallel mirrors to see back of head)

**B4. Applications of Plane Mirrors**
18. Kaleidoscope — 2-3 mirrors at 60° creating symmetric patterns
19. Periscope — 2 mirrors at 45° for seeing over obstacles (submarine, trench)
20. Looking glass / dressing table mirror
21. Decorative use to create illusion of space

**B5. Regular vs Diffused Reflection**
22. Regular/Specular reflection — smooth surface, parallel rays stay parallel, clear image
23. Diffused/Irregular reflection — rough surface, parallel rays scatter, no clear image
24. **Critical concept**: Even in diffused reflection, EACH individual ray still obeys both laws at its point of incidence
25. Why diffused reflection matters: it's why we can see non-luminous objects from all angles

**B6. Missing Stages**
26. Build a Plane Mirror **Try** stage (interactive: drag object, see virtual image form behind mirror, verify distance equality, demonstrate lateral inversion)
27. Build a Plane Mirror **Test/Quiz** stage (dedicated quiz with plane-mirror-specific questions)
28. Add plane mirror misconception tags to `shared/misconception_tags.json`: `image_real_confusion`, `size_mismatch`, `distance_confusion`, `lateral_inversion_confusion` (hint text already exists in `prompt_builder.py` but tags don't exist in the runtime catalog)
29. Register new tags in `TAG_TO_TOPIC_KEY` in `misconception_catalog.py`

**Suggested implementation:** Expand `PlaneMirrorBasicsAnimation.jsx` OR create new `PlaneMirrorCharacteristicsAnimation.jsx` + `PlaneMirrorLateralInversion.jsx`. Build `PlaneMirrorTryInteractive.jsx`. Wire into App.jsx with proper flow.

---

### MODULE C: Real vs Virtual Images — Dedicated Section (NEW — from Lakhmir Singh)
**Current state: 0% built. Lakhmir Singh teaches this as a standalone section BEFORE introducing spherical mirrors.**

Our app jumps from Laws of Reflection straight into Spherical Mirrors without ever explicitly defining what "real" and "virtual" images are. Students encounter these terms for the first time when studying image formation cases — by which point they're already confused.

**Subtopics to build:**
1. Real Image — formed when light rays ACTUALLY converge at a point
2. Real image CAN be caught/projected on a screen
3. Real image is always inverted
4. Real image is formed in front of the mirror (same side as object)
5. Analogy: Cinema screen — projector creates a real image on the screen
6. Virtual Image — formed when light rays only APPEAR to meet
7. Virtual image CANNOT be caught on a screen
8. Virtual image is always erect
9. Virtual image appears to form behind the mirror
10. Analogy: Your face in a bathroom mirror — cannot catch it on paper behind the mirror
11. Comparison table: Real vs Virtual (converge vs appear to converge, screen vs no screen, inverted vs erect, in front vs behind)

**Suggested implementation:** One Tell + Show animation (5–6 steps) placed BEFORE spherical mirror introduction in the curriculum flow. Quick 3-question quiz.

---

### MODULE D: Spherical Mirrors — Identification & Missing Vocabulary
**Current state: Partially built. P, C, F, R=2f are taught. Principal Axis, Aperture, and mirror identification techniques are NOT.**

**Subtopics to build:**

**D1. Missing Vocabulary**
1. **Principal Axis** — explicit definition: the straight line through P and C, extending to infinity on both sides. The normal at the pole lies along it. *(Currently has a misconception tag `principal_axis_confusion` but the term is never taught — student can be told they have a misconception about something they were never shown!)*
2. **Aperture** — explicit definition: the diameter of the reflecting surface; tells us the "size" of the mirror; our formulas work for small aperture mirrors only.

**D2. Distinguishing Mirrors (Lakhmir Singh's signature content)**
3. **By looking into it**: Hold close to face → magnified face = concave, tiny face = convex, same size = plane
4. **By touch**: Feel the reflecting surface → depressed in center = concave, bulges outward = convex
5. **By reflection test**: Hold far from object → inverted image = concave; always erect/diminished = convex
6. **The Spoon Analogy**: Inner (hollow) surface of a steel spoon = concave mirror; outer (bulging) surface = convex mirror. Activity: observe your face in both sides of a spoon.

**D3. Ray Rule 4 (Lakhmir Singh extra)**
7. **Rule 4**: A ray incident at the Pole (P) is reflected making an equal angle with the principal axis on the other side (principal axis acts as normal at P)

**D4. Missing Conceptual Points**
8. "Use any TWO of the four rules to locate an image" — explicit instruction
9. "As object moves from ∞ toward P, image moves from F toward ∞, then jumps behind the mirror" — the continuity observation
10. Convex mirror ALWAYS forms virtual, erect, diminished image — stated as absolute rules (no exceptions)
11. Convex mirror can NEVER form a real image, NEVER form a magnified image — stated explicitly

**Suggested implementation:** Update `SphericalMirrorDetailedAnimation.jsx` script to add principal axis + aperture definitions. Create new `MirrorIdentificationActivity.jsx` (interactive: 3 mystery mirrors, student deduces type). Add Rule 4 to `RayTracingRulesLesson.jsx`.

---

### MODULE E: Uses of Spherical Mirrors — Wire In + Expand
**Current state: Content EXISTS in `SphericalMirrorBasicsWatch.jsx` and `Sphericalmirrorimageformationwatch.jsx` but NEITHER is imported in `App.jsx`. Students never see this content.**

**E1. Uses already built but orphaned (need wiring):**
1. Shaving/Makeup mirror (concave, between P and F → magnified virtual image)
2. Dentist mirror (concave)
3. Headlights/Torches/Searchlights (concave, bulb at F → parallel beam)
4. Solar furnace/Solar cooker (concave, concentrates sunlight at F)
5. Rear-view/side mirrors in vehicles (convex, wider field of view)

**E2. Uses present in Lakhmir Singh but NOT built at all:**
6. ENT doctor head mirror — concave mirror on forehead to concentrate light into ear/nose/throat
7. Reflecting telescopes — large concave mirrors to collect/focus starlight
8. Road safety mirrors at blind curves/intersections — large convex mirrors
9. Security/Surveillance mirrors in shops and malls — convex for wide-angle view
10. ATM security mirrors — small convex mirror to check if someone is behind you
11. WHY convex mirrors are preferred over plane mirrors for rear-view — exam question with detailed reasoning (wider field, erect image, diminished → more coverage)

**Suggested implementation:** Wire the existing orphaned files into `App.jsx` flow after image formation. Add the missing use cases to the component content. Build a quiz specifically testing "which mirror and why?" questions.

---

### MODULE F: Sign Convention (CRITICAL — 0% built)
**Current state: Not taught anywhere. `template_quiz_scope.py` explicitly lists it as `untaught_concepts`. Only exists as a misconception tag `sign_convention_confusion` that can never be meaningfully triggered.**

**Subtopics to build:**
1. All distances measured from Pole (P) = origin
2. Distances in direction of incident light (left → right) = positive
3. Distances against direction of incident light (right → left) = negative
4. Heights upward (above principal axis) = positive
5. Heights downward (below principal axis) = negative
6. Object always placed to the left of mirror
7. Object distance u is ALWAYS negative
8. Concave mirror: f is negative, R is negative (focus/C in front of mirror, on left)
9. Convex mirror: f is positive, R is positive (focus/C behind mirror, on right)
10. Real image: v is negative (formed in front of mirror)
11. Virtual image: v is positive (formed behind mirror)
12. Erect image: h' is positive; Inverted image: h' is negative
13. **Common sign convention errors** (Lakhmir Singh warns about):
    - Forgetting to assign negative sign to u
    - Mixing up signs for concave vs convex f
    - Confusing the sign of v with the nature of the image

**Suggested implementation:** Interactive `SignConventionLesson.jsx` — visual Cartesian coordinate system overlaid on a mirror. Student drags objects/images to learn positive/negative zones. Quiz specifically on "what is the sign of u/v/f for this scenario?"

---

### MODULE G: Mirror Formula & Magnification (CRITICAL — 0% built)
**Current state: Explicit "Coming Soon" stub in `App.jsx:450-464`. This is the single largest gap — 25-30% of exam weight for this chapter.**

**Subtopics to build:**

**G1. Mirror Formula**
1. The formula: 1/v + 1/u = 1/f
2. Variables: v = image distance, u = object distance, f = focal length
3. Valid for ALL spherical mirrors and ALL object positions
4. Signs MUST be applied before substituting
5. Lakhmir Singh's 5-step method: (i) Identify knowns → (ii) Apply signs → (iii) Substitute → (iv) Solve → (v) Interpret the sign of the answer

**G2. Magnification**
6. Definition: m = h'/h (ratio of image height to object height)
7. In terms of u and v: m = −v/u
8. Interpretation of sign: m positive → virtual & erect; m negative → real & inverted
9. Interpretation of magnitude: |m| > 1 → magnified; |m| < 1 → diminished; |m| = 1 → same size
10. Special cases: Plane mirror m = +1 always; Convex mirror m is always positive and |m| < 1

**G3. Worked Numericals**
11. NCERT Example 9.1: Convex mirror, R = 3m, u = −5m → find v, nature, m
12. NCERT Example 9.2: Concave mirror, f = −15cm, h = 4cm, u = −25cm → find v, nature, h'

**G4. Numerical Problem Types (from Lakhmir Singh)**
13. Type 1: Find image position v (given u, f)
14. Type 2: Find focal length f (given u, v)
15. Type 3: Find object distance u (given v, f)
16. Type 4: Find image characteristics (calculate v and m, describe nature/size/position)
17. Type 5: Height calculations (given h, u, v → find h' using m)
18. Type 6: Mirror identification (from u and v, calculate f to determine concave vs convex)
19. Type 7: Magnification problems (given m and one of u/v/f, find others)
20. Type 8: R = 2f based problems (given R, find f, then solve)
21. Type 9: Combined problems (mirror formula + magnification together)

**Suggested implementation:** 
- Tell stage: `MirrorFormulaLesson.jsx` explaining the formula with animated derivation
- Show stage: Step-by-step worked examples (animated, with Lakhmir's 5-step method)
- Try stage: `NumericalSandbox.jsx` — AI generates numerical problems, student must apply sign convention, substitute, and solve step-by-step. AI evaluates each step and catches sign-convention misconceptions in real-time
- Test stage: AI-generated numerical quiz with auto-evaluation

---

### MODULE H: Activities & Experiments (Partially built)
**Current state: Most NCERT/Lakhmir activities are not in our app.**

**Activities to build:**
1. Spoon experiment (observe concave/convex in inner/outer surfaces) — fits in Module D
2. Pin/board experiment to verify laws of reflection — could be an interactive Try stage
3. Plane mirror image observation (verify 6 characteristics) — fits in Module B
4. Concave mirror with candle at different positions — partially covered by ImageFormationLesson
5. Focus sunlight with concave mirror to find focal length — could be an interactive animation
6. Compare field of view: plane vs concave vs convex mirrors — fits in Module E

---

## Recommended Build Priority

| Priority | Module | Reason | Effort |
|---|---|---|---|
| **P0** | Module B: Plane Mirror overhaul | Most misleading gap — scope file claims concepts are taught when they aren't. Zero misconception detection. Students skip entire topic untested. | Medium |
| **P1** | Module C: Real vs Virtual Images | Foundation for ALL image formation content that follows. Must come before spherical mirrors. | Low |
| **P2** | Module D: Missing vocabulary + identification | Principal axis is tested but never taught. Spoon/face-in-mirror activities are engaging. | Low |
| **P3** | Module E: Wire orphaned Uses content | Already built. Just needs wiring + minor additions. Immediate value. | Low |
| **P4** | Module F: Sign Convention | Prerequisite for Mirror Formula. Cannot do numericals without this. | Medium |
| **P5** | Module G: Mirror Formula & Magnification | Largest content gap. 25-30% of exam weight. Highest effort. | High |
| **P6** | Module A: Introduction to Light | Foundational but students likely already know this. Can add later. | Low |
| **P7** | Module H: Activities | Supplementary. Can ride along with other modules. | Variable |

---

## Orphaned Files That Need Wiring

| File | Location | Content | Wire Into |
|---|---|---|---|
| `SphericalMirrorBasicsWatch.jsx` | `spherical-mirrors/animations/` | Uses of mirrors, P/F/C definitions | After image formation in App.jsx |
| `Sphericalmirrorimageformationwatch.jsx` | `spherical-mirrors/animations/` | Image formation watch animation | Could replace or supplement ImageFormationLesson |
| `Sphericalmirrorimageformationinteractive.jsx` | `spherical-mirrors/animations/` | Interactive image formation Try | smTry stage in App.jsx |
| `MirrorPhysicsEngine.js` (root) | `spherical-mirrors/` | Class-based physics engine | Used by orphaned components above |
| `AngleFromSurfaceFeedback.jsx` | `animations/feedback/` | Individual misconception feedback | Replaced by unified ReflectionMisconceptionFeedback |
| `NormalOrientationWrongFeedback.jsx` | `animations/feedback/` | Individual misconception feedback | Replaced by unified component |
| `PlaneNotSameFeedback.jsx` | `animations/feedback/` | Individual misconception feedback | Replaced by unified component |
| `ReflectionNotEqualFeedback.jsx` | `animations/feedback/` | Individual misconception feedback | Replaced by unified component |
| `Secondlawreflectionfeedback.jsx` | `animations/feedback/` | Individual misconception feedback | Replaced by unified component |

---

## New Misconception Tags Needed

| Tag | Topic Key | Hint Text (already in prompt_builder.py?) |
|---|---|---|
| `image_real_confusion` | `plane_mirror` | ✅ Yes — "Correct the idea that plane mirror image is real" |
| `size_mismatch` | `plane_mirror` | ✅ Yes — "Correct misconception that plane mirror image size changes" |
| `distance_confusion` | `plane_mirror` | ✅ Yes — "Correct misconception about object-image distance" |
| `lateral_inversion_confusion` | `plane_mirror` | ✅ Yes — "Correct misconception that plane mirror makes image upside down" |
| `regular_vs_diffused` | `laws_of_reflection` | ❌ No — needs new hint |
| `sign_convention_confusion` | `spherical_mirrors` | ✅ Exists in JSON but no lesson teaches it |
| `left_right_sign_error` | `spherical_mirrors` | ✅ Exists in prompt_builder but not in JSON |
| `rearview_reason_wrong` | `spherical_mirrors` | ✅ Exists in prompt_builder but not in JSON |
| `mirror_formula_sign_error` | `spherical_mirrors` | ❌ No — needs new hint |
| `magnification_sign_error` | `spherical_mirrors` | ❌ No — needs new hint |
