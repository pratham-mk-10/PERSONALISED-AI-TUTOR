# NCERT "Light — Reflection" Coverage Gap Analysis

Scope: the Reflection half of NCERT Class 10 Science Ch. 9/10 ("Light – Reflection and Refraction") — Laws of Reflection, Plane Mirrors, Spherical Mirrors, image formation, mirror formula. Refraction/lenses are out of scope for this file.

Method: read `frontend/src/App.jsx` (the actual stage wiring) against `backend/content-agent/template_quiz_scope.py` (the app's own self-declared "taught_concepts" per lesson) and the misconception catalog (`shared/misconception_tags.json`), then verified the declared scope against what the lesson components actually render. Findings below are ordered by how much they affect a real NCERT exam/interview answer, not by file order.

---

## 1. Plane Mirror — image characteristics are claimed taught but NOT actually in the lesson

`template_quiz_scope.py:50-57` declares `PlaneMirrorBasicsAnimation`'s `taught_concepts` as:
- "image in a plane mirror is virtual and erect"
- "image size equals object size in a plane mirror"
- "image distance equals object distance from the mirror"
- "lateral inversion in plane mirror"

I grepped `PlaneMirrorBasicsAnimation.jsx` for `virtual|erect|lateral|same size|equal distance` — **zero matches**. The actual Tell text in `App.jsx:186-198` only covers ray-diagram vocabulary (mirror, point of incidence, incident ray, reflected ray, normal, angle of incidence/reflection). The specific plane-mirror image-characteristics content — which is one of the most commonly tested NCERT concepts for this chapter — is not present anywhere in the lesson, despite the scope file claiming it's taught (which then tells the quiz generator it's safe to ask about).

**Fix scope:** either add this content to `PlaneMirrorBasicsAnimation` (a short animation showing virtual/erect/same-size/equidistant/laterally-inverted), or correct `template_quiz_scope.py` so quiz questions aren't generated assuming it was taught.

## 2. Plane Mirror has no misconception tags at all — wrong answers can't be diagnosed

`shared/misconception_tags.json` (the actual runtime catalog, 27 tags) has **zero tags with `topic_key: "plane_mirror"`** — all 27 are `laws_of_reflection` or `spherical_mirrors`. Yet `backend/content-agent/prompt_builder.py` has hint entries for `image_real_confusion`, `size_mismatch`, `distance_confusion`, `lateral_inversion_confusion` (`prompt_builder.py:37-40`, `:64`) — these tags are referenced in the *hint* dictionaries but don't exist in the actual catalog `coerce_misconception_tag()` validates against. Practically: any wrong answer on a Plane Mirror question gets silently coerced to generic `general_concept_gap` (`misconception_catalog.py:294-300`), so the whole misconception-detection/visual-feedback engine — the app's core differentiator — doesn't work for this topic at all. Combined with #1, Plane Mirror is the weakest-covered topic in the curriculum.

**Fix scope:** add plane-mirror tags to `shared/misconception_tags.json` (the hint text already exists in `prompt_builder.py`, so this is mostly copying data into the right file, not writing new content) and register them in `TAG_TO_TOPIC_KEY` (`misconception_catalog.py:9-41`).

## 3. Plane Mirror has no Try stage and no Test/quiz stage of its own

In `App.jsx`, `pmShow`'s `onContinue` (`App.jsx:209-214`) goes straight to `selectTopic("laws-reflection"); setStage("tell1")` — there is no interactive Try step and no dedicated quiz for Plane Mirror before it funnels into the next topic. Compare to Laws of Reflection, which has a real Try stage per law (`FirstLawPlaneInteractive`, `SecondLawPlaneInteractive`, `App.jsx:375-386`, `:430-441`). Given #1 and #2, a student could finish "Plane Mirror Basics" on the dashboard having never been tested on it at all.

## 4. "Principal axis" and "aperture" are never explicitly taught, despite one having a detectable misconception

Grepped the entire `frontend/src/svg-engine/reflection/spherical-mirrors/` tree for `aperture|principal axis` (case-insensitive) — **zero matches in any file**, including `SphericalMirrorDetailedAnimation.jsx` and `RayTracingRulesLesson.jsx`. The Tell text for spherical mirrors (`App.jsx:223-226`) only names "pole (P), focus (F), centre of curvature (C), and relation R = 2f" — principal axis and aperture (both explicit NCERT vocabulary) are absent from lesson text.

This is inconsistent: `principal_axis_confusion` exists as a real, reachable misconception tag (`misconception_tags.json:61-66`) that the quiz can tag a student with — meaning a student can be told they have a "principal axis" misconception for a term the lesson never actually defined.

## 5. Uses of concave/convex mirrors — content exists but is orphaned, not wired into the curriculum

`template_quiz_scope.py:66-73` declares `SphericalMirrorBasicsWatch`'s taught concepts include "basic everyday uses of concave and convex mirrors," and a component named `SphericalMirrorBasicsWatch.jsx` does exist with rearview-mirror/shaving-mirror-type content (matched in the grep for `rear-view|shaving|headlight|...`). **But `SphericalMirrorBasicsWatch` is never imported in `App.jsx`** — the actual spherical-mirror Tell/Show stage uses `SphericalMirrorDetailedAnimation` instead (`App.jsx:8, 236-237`). Same story for `Sphericalmirrorimageformationwatch.jsx` (note the different casing from the real `ImageFormationLesson.jsx` that's actually used) — it also has real-world-uses content and is also never imported anywhere in `App.jsx`.

Practical implication: "uses of mirrors" — a standard NCERT exam topic (concave: shaving mirrors, dentist mirrors, torches/headlights/solar furnaces; convex: rear-view/side mirrors for wider field of view) — is not reachable by a student going through the normal curriculum flow, even though you already built lesson content for it. This is recoverable, not a from-scratch build: check whether `SphericalMirrorBasicsWatch.jsx` and `Sphericalmirrorimageformationwatch.jsx` are current/good, and either wire one into the stage flow (e.g. as a segment inside `smTell`/`smShow`) or fold its content into `SphericalMirrorDetailedAnimation`.

## 6. Sign convention (New Cartesian Sign Convention) — not taught anywhere

`SphericalMirrorBasicsWatch`'s own scope declaration explicitly lists "sign convention" under `untaught_concepts` (`template_quiz_scope.py:76-77`), and no other lesson component covers it. It exists only as a misconception tag (`sign_convention_confusion`, `misconception_tags.json:163-168`) that would only ever get invoked from mirror-formula numericals — which don't exist yet (#7). Not taught, not currently testable in a meaningful way.

## 7. Mirror Formula, Magnification, and Numericals — explicit stub, 0% built

`App.jsx:450-464` — the `mirrorFormulaComingSoon` stage renders literally: *"This numerical and formula section is currently under development... Coming Soon!"* with a button back to the dashboard. This is the single largest confirmed gap: no mirror formula (`1/v + 1/u = 1/f`), no magnification formula (`m = h'/h = -v/u`), no sign-convention application, no numerical problem-solving — a substantial, exam-heavy fraction of the NCERT chapter (it's usually 25-30% of exam weight for this chapter) has zero content, not even a Tell stage.

---

## Summary table

| NCERT subtopic | Status | Evidence |
|---|---|---|
| Laws of Reflection (i=r, coplanarity) | ✅ Fully built — Tell/Show/Try ×2 | `App.jsx:334-441` |
| Spherical mirror types (concave/convex), P/C/F, R=2f | ✅ Built, terminology mostly complete | `App.jsx:219-232` |
| Principal axis, aperture (named terms) | ❌ Never explicitly taught in any lesson | grep across `spherical-mirrors/` — 0 matches |
| Ray tracing rules (3 rules) | ✅ Fully built | `RayTracingRulesLesson.jsx`, `App.jsx:246-270` |
| Image formation table (8 object-position cases) | ✅ Fully built, matches NCERT table exactly | `App.jsx:286-325` |
| Plane mirror — ray-diagram terms | ✅ Built | `App.jsx:181-204` |
| Plane mirror — image characteristics (virtual/erect/same size/equidistant/lateral inversion) | ❌ Claimed taught, actually absent from lesson | `PlaneMirrorBasicsAnimation.jsx` (0 matches for the terms) |
| Plane mirror — Try/Test stage | ❌ None — flows straight into next topic | `App.jsx:209-214` |
| Plane mirror — misconception detection | ❌ Zero tags in runtime catalog, falls back to generic | `shared/misconception_tags.json` |
| Uses of concave/convex mirrors | ⚠️ Built but orphaned, not wired into student-facing flow | `SphericalMirrorBasicsWatch.jsx`, `Sphericalmirrorimageformationwatch.jsx` not imported in `App.jsx` |
| Sign convention | ❌ Not taught anywhere | explicit `untaught_concepts` entry, no lesson exists |
| Mirror formula, magnification, numericals | ❌ 0% built, explicit "Coming Soon" stub | `App.jsx:450-464` |

## Recommended priority if you close these before a demo/interview

1. **Plane mirror image characteristics (#1)** — cheapest fix with the highest exam-relevance, and it's currently actively misleading (scope file says it's taught when it isn't).
2. **Wire the orphaned "uses of mirrors" content in (#5)** — you already built this, it's a wiring task not new content.
3. **Plane mirror misconception tags (#2)** — the hint text already exists in `prompt_builder.py`, just needs to be added to the catalog + `TAG_TO_TOPIC_KEY`.
4. **Mirror formula & magnification (#7)** — the biggest lift by far (new lesson + numericals), but also the biggest single hole in NCERT coverage. Treat as its own multi-day task, not a quick fix.
5. Principal axis/aperture vocabulary (#4) and sign convention (#6) are small additions that could ride along with whichever of the above you tackle first.
