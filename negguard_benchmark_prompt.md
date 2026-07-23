I need to build and run a benchmark comparison for NegGuard, my descriptive-answer
evaluation engine, over the next 2 days. Read this whole prompt before writing any
code — the reasoning behind each step matters as much as the step itself, because
this benchmark needs to be scientifically defensible if an interviewer or reviewer
questions it later.

## CONTEXT — What NegGuard is

NegGuard is a 3-stage pipeline that grades a student's free-text physics answer
(CBSE Class 10, Light chapter) against a rubric:

1. **Smart Gate (Stage 1)** — zero-cost keyword/word-count filter that rejects
   garbage answers (too short, no topic overlap) before any LLM call.
2. **CoT LLM Engine (Stage 2)** — Gemini 2.5 Flash (Mistral-Small fallback) does
   structured chain-of-thought reasoning: checks physics entailment, checks for
   negation/qualifier flips (ALWAYS/NEVER/ONLY), matches against a 30-tag
   misconception taxonomy, produces conceptual + completeness scores (0-10 each).
3. **Reliability Layer (Stage 3)** — Pydantic v2 validates the LLM's JSON output;
   applies severity-based score caps (HIGH misconception caps score at 2.5/10,
   MEDIUM at 5.5/10, LOW at 8.5/10); computes final display score as
   (conceptual × 0.6) + (completeness × 0.4); persists to DB or flags for
   manual review if validation fails twice.

The full architecture doc is already in this repo/context — read it directly from
the codebase rather than relying on my description above, in case anything has
drifted.

## WHAT I AM TRYING TO PROVE — and what I am NOT trying to prove

I am NOT trying to prove NegGuard beats any published, peer-reviewed model (IEEE,
ACL, or otherwise). That comparison would be scientifically invalid here because
I cannot reproduce their exact dataset, rubric, grading scale, or test conditions
— any such claim would collapse under a single follow-up question and I don't
want it anywhere near my resume or my paper.

What I AM trying to prove is narrower and fully within reach: does my specific
design choice — structured CoT reasoning + explicit misconception taxonomy +
severity-based capping — produce evaluation scores that agree with human expert
grading MORE than a naive, non-reasoning baseline does?

The baseline (BERT/sentence-transformer cosine similarity) is deliberately dumb.
It does NOT understand physics, negation, or misconceptions — it just measures
surface-level semantic similarity between the student's answer and the model
answer. It exists purely as a floor to measure against, not a rival system. If
NegGuard beats it, that's evidence the CoT + taxonomy design is doing real work,
not just cargo-culting an LLM call. This is a legitimate ablation-style validation,
commonly used in ML research to isolate the value of a specific architectural
component — that is exactly the framing I want documented in results and in any
summary you give me.

## WHAT TO BUILD AND RUN, IN ORDER

### Step 1 — Curate the test set (help me do this, don't invent data)
I have 40-60 hand-labeled physics answers already in the repo (find them — check
scratch/, benchmark/, or wherever qualitative testing artifacts live). Select 30
answers that span these 6 categories, roughly 5 each:
  1. Correct answer, good vocabulary
  2. Correct answer, poor/non-standard vocabulary (should score high anyway —
     tests that we don't penalise terminology gaps)
  3. Semantic negation / physics misconception present (e.g. "convex mirror
     forms a real image")
  4. Hedged/uncertain answer ("I think it might diverge...")
  5. Partially correct (covers some rubric points, misses others)
  6. Self-contradictory (states two conflicting claims in the same answer)

If fewer than 30 suitable answers exist in what I've already labeled, tell me
exactly how many exist and in which categories I'm short — do not fabricate
answers to fill the gap. I will write any missing ones myself.

Save this curated set as `backend/benchmark/answers.json` with fields:
`id`, `answer`, `category`.

### Step 2 — Human ground truth (I will do this manually, not you)
Once Step 1's file exists, stop and tell me it's ready for human grading. I will
personally sit with my mentor (Dr. Deepak Raj D.M) and score all 30 answers
0-10 manually. I'll save this myself as `backend/benchmark/human_grades.json`
with fields `id`, `score`. Do not proceed to Step 4/5 until I confirm this file
exists — check for it, don't assume it.

### Step 3 — Run NegGuard's own pipeline on the 30 answers
Use the existing `backend/benchmark/run_pipeline.py` if it already exists in the
repo (check first — the architecture doc references this file). If it doesn't
exist yet, write it following the same pattern: for each answer, run
Smart Gate → LLM Engine → severity cap → display score, and save results to
`backend/benchmark/pipeline_results.json` with fields `id`, `pipeline_score`,
`conceptual`, `completeness`, `misconception_tag`, `latency_ms`, `model`.

Use the actual question context and few-shot anchors already defined in the
codebase (in the evaluation router / prompt_builder) — don't invent a new
question or anchors, reuse what's already been calibrated.

### Step 4 — Run the BERT baseline
Write `backend/benchmark/run_bert_baseline.py`:
- Use `sentence-transformers` (a small pretrained model like `all-MiniLM-L6-v2`
  is fine — no fine-tuning, no training, just off-the-shelf embeddings)
- For each of the 30 answers: embed the student answer and embed the model
  answer (the same model_answer used by NegGuard for that question), compute
  cosine similarity between the two vectors
- Convert similarity (0-1) to a 0-10 score scale (multiply by 10) so it's
  comparable to human grades and pipeline scores
- Save to `backend/benchmark/bert_results.json` with fields `id`, `bert_score`

Keep this genuinely simple — this is intentionally the "dumb baseline," not a
second sophisticated system. Do not add any reasoning, prompting, or physics
logic to it. If you find yourself wanting to make it smarter, stop — that
defeats the purpose of a baseline.

### Step 5 — Compute agreement metrics
Use `backend/benchmark/compute_agreement.py` if it exists (check first — the
architecture doc describes this file). If not, write it to:
- Load human_grades.json, pipeline_results.json, bert_results.json
- Align all three by `id` — only include answers present in ALL three files
- For each system (NegGuard pipeline, BERT baseline) vs human grades, compute:
  a. Agreement rate within ±1 point tolerance
  b. Cohen's Kappa (round scores to nearest integer first, use
     `sklearn.metrics.cohen_kappa_score`)
- Print a clear comparison table: system name, N answers, agreement rate,
  Cohen's Kappa, and the improvement of NegGuard over BERT in percentage points
- Save the full comparison to `backend/benchmark/final_comparison.json`

## WHAT I NEED FROM YOU AT THE END

A short summary with:
- Exact numbers (do not round up or make anything sound better than what the
  data shows — if NegGuard's Kappa is only marginally better than BERT's, or
  even worse on some subset, tell me exactly that, with the real numbers)
- Which of the 6 answer categories NegGuard handled well vs poorly, if visible
  from the per-answer breakdown
- File paths for every script and every result file you produced, so I can
  verify them myself
- One honest sentence I could say out loud in an interview if asked "how did
  you validate this system" — grounded only in what the numbers actually show

Do not proceed past Step 2 until I've confirmed the human_grades.json file
exists — this is the one step you cannot do for me, and running the rest without
it would make the whole comparison meaningless.
