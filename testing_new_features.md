# Testing New Features — This Session's Build

Manual QA checklist for everything shipped in this session: the standalone **Numerical Problems** topic (6 subtopics), the **Mirror Formula** relocation, and the earlier **Batch 1-4** content additions (Mirror Identification Activity, Plane Mirror Applications Animation, extended Spherical Mirror Uses Animation).

---

## 0. Setup

```bash
# Terminal 1
cd backend && uvicorn orchestrator.server:app --reload --port 8000

# Terminal 2
cd frontend && npm run dev
```

**Use a fresh student name to get a clean slate.** Login is just a name typed into the entry screen (`NameEntry`) — there's no separate signup, and that name *is* the student ID everything is logged under. To test misconception counts/severity from zero, log in with a name you haven't used before (e.g. `test-numericals-1`). To test accumulation across visits, reuse the same name.

---

## 1. Numericals topic — per-subtopic smoke test

Path for all 6: **Dashboard → "5. Numerical Problems" folder → subtopic → Tell card → Challenge stage.**

Run this sequence on **each** of the 6 subtopics (Find v, Find Height/Magnification, Find f, Find u, Mirror Identification, Combined):

1. **Answer correctly first try** → should advance to the next problem cleanly, no visual, no console errors.
2. **Answer wrong on purpose** → should move into the breakdown phase and ask for the specific intermediate values (entered u/f for Find v, entered v/m for Find m, entered u/v for Find f, entered f/v for Find u, etc.).
3. **Enter breakdown values that flip a sign** (e.g. enter u or v with the wrong sign vs. what the word problem implies) → should produce a **Case A** diagnosis: a misconception tag, an explanation sentence, and a red+green mirror visual side by side (green = correct image, red = what your wrong numbers imply).
4. **Enter breakdown values with correct signs but still get the fast-path number wrong** → **Case C**: no tag, no visual, just an "check your arithmetic" style message.
5. **Find v and Combined only** — after answering v correctly, a bonus erect/inverted check appears. Answer it wrong on purpose → **Case B** (`magnification_sign_error`): visual should show the *correct* v but a flipped h′.
6. **Mirror Identification only** — fast path is 3 buttons (Concave/Convex/Plane), not a number field. Test all three. Specifically land on a plane-mirror problem and confirm **no** red/green visual renders — plane-mirror mistakes are explained in text only (a plane mirror can't go through `MirrorPhysicsEngine.calculateImage`).
7. **Divide-by-zero guard (regression check for a bug found this session)** — on Find f or Find u, use the "at C" problem (concave, f=10, u=20 → correct u=-20, v=-20) and deliberately flip only *one* sign in the breakdown so the reconstruction formula's denominator hits zero (`u+v=0` for Find f, `v-f=0` for Find u). Expect a specific "your values imply an infinite focal length/object distance — not a real mirror" message, **not** a crash, blank screen, or `NaN`/`Infinity` rendered anywhere.

---

## 2. Cross-subtopic retest tracking (yes, deliberately failing is the right way to test this)

1. Log in fresh.
2. Pick **one** numerical subtopic and trigger the **same** misconception tag on 3 separate problems in a row (e.g. always flip u's sign in the breakdown for Find v).
3. Return to the Dashboard — that subtopic's status dot should be **red** (severity threshold: total count ≥ 3 = red, 1–2 = yellow, per `RED_SEVERITY_THRESHOLD`/`YELLOW_SEVERITY_THRESHOLD` in `backend/database/misconception_catalog.py`). A sibling subtopic you haven't touched (e.g. Find f) should stay uncolored/green — this per-subtopic granularity is new this session; previously all numerics shared one "Mirror Formula" bucket.
4. Use the **Retest** action from the weak-topics list → should relaunch that subtopic with `retestBias.tagBreakdown` reflecting the tag you tripped.
5. Trigger a tag only 1–2 times on a different subtopic → confirm **yellow**, not red.
6. Answer correctly enough to resolve a topic → its dot should flip to **green** (completed always wins over misconception count).

---

## 3. LLM explanation escalation

- **1st** wrong attempt on a tag → local/static explanation only, no LLM call.
- **2nd+** wrong attempt on the **same tag, same subtopic** → `content_agent.generate()` fires (watch the backend terminal for the Gemini/Mistral call, or just confirm the explanation text is longer/more specific than the static one).
- Confirm the fallback chain never breaks the UI: if you can, temporarily unset `GEMINI_API_KEY` and repeat a 2nd-attempt case — you should still get *some* explanation (Mistral, then DB cache), never a blank or broken feedback panel.

---

## 4. Mirror Formula regression (confirm relocation didn't break the old topic)

- Dashboard → **Mirror Formula and Magnification** → should now be Tell → Show → Quiz only (`mfSignTell → mfSignShow → mfTell → mfShow → mfTest`), 5 stages, **no** numeric Try stage.
- On the `mfShow` stage, click "Try It" → should go straight to the MCQ quiz (`mfTest`), not any numeric challenge.
- Confirm "Mirror Formula and Magnification" still tracks its own misconception bucket independently of all 6 numerical subtopics (trip a tag here, confirm it doesn't bleed into e.g. Find v's count or vice versa).

---

## 5. Batch 1-4 content additions

- **Mirror Identification Activity** — Spherical Mirror Basics flow, stage `smIdentify` (right before `smQuiz`). Guess concave/convex/plane on all 3 panels, confirm reveal-after-guess, confirm the by-touch/spoon-analogy explainer only appears after all 3 panels are guessed, not before.
- **Plane Mirror Applications Animation** — Plane Mirror flow, stage `pmAppShow` (right before `pmTest`). Step through all 6 audio steps; scenes should render in order: Ambulance → Symmetric Letters → Multi-Mirror → Kaleidoscope → Periscope, no blank frames or stuck steps. On the Multi-Mirror scene, check both angle presets if selectable — 90° should show exactly 3 images, 60° should show exactly 5 (verified by script; worth an eyeball pass).
- **Spherical Mirror Uses Animation** — stage `smUsesShow` (right before `smQuiz`). Confirm all **8** audio steps now play (was 5) and the 3 new scenes (ENT mirror, Telescope, Wide-field convex) each render distinctly, not overlapping or reusing an earlier scene.
- **Text additions** — skim `tell1`, `smRulesTell` (should say "4 rules", not the old stale "3 rules"), `smFormationTell`, `smTell`, `mfTell`, `mfSignTell` cards for the added paragraphs. Proofreading only, no functional risk.

---

## 6. Automated checks (fast, run these too)

```bash
cd frontend
npm run build       # must be clean
npm run test:unit   # expect exactly ONE known pre-existing failure: NormalOrientationWrongFeedback in App.test.jsx — anything else new is a real regression
```

Keep the browser console open through all manual testing above — zero red errors is the bar; warnings are fine unless they're about a missing `key` prop or an actual thrown error.

---

## Known limitations — not bugs, don't report these

- **Find u's visual** only shows the wrong resulting *image*, not a wrong object marker on the axis — the wrong object-position mistake is explained in text only (`DynamicMirrorFeedback` can't draw a second object).
- **Mirror Identification's plane-mirror problems** never show a red/green visual — intentional, since a plane mirror can't go through `calculateImage`.
- `content_remaining_plan.md`'s numerical-type rows are stale (still reflect pre-restructuring status) — doc gap only, no behavior impact.
