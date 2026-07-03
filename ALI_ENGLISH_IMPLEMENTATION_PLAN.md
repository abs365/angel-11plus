# ALI English Intelligence — Implementation Plan

**Phase:** ALI 2.1 — English Intelligence, Steps 3–4 (adaptive-behaviour review + implementation plan). **Planning only. No production code, no migrations run, no tables created.** Companion to `ENGLISH_COMPETENCY_FRAMEWORK.md` (Steps 1–2 — taxonomy and the scope decision limiting this phase to Reading Comprehension only, not Vocabulary or Writing).

---

## 1. Competency taxonomy (summary — full detail in `ENGLISH_COMPETENCY_FRAMEWORK.md`)

10 competencies: 2 populated today (`english.inference`, `english.vocabulary-in-context`), 5 defined-but-unauthored (`english.retrieval`, `english.authors-purpose`, `english.sequencing`, `english.summarising`, `english.prediction`), 3 blocked on a new question format (`english.grammar`, `english.punctuation`, `english.spelling`). One primary competency per question, tagged by dominant reasoning step — same rule as Decision 34.

---

## 2. Metadata strategy

### 2.1 What already fits without change

`ali_question_bank` (migration 005) needs **zero new columns** for English:

- `subject` — `public.subject_type` already includes `'english'` from migration 001. Zero enum change, same as Mathematics needing none for `'maths'`.
- `question_type` — this column is `text not null default 'multiple-choice'`, **a plain string, not a Postgres enum** (unlike `content_difficulty`, which is a real enum type). English questions can use a new value, e.g. `'open-response'`, by simply writing that string at import time — no `ALTER TYPE` at all. This is a smaller migration footprint than even Mathematics achieved (Maths needed zero *new* enum values but the column type itself is already flexible; English is the first subject to actually exercise that flexibility).
- `prompt` (jsonb) — deliberately schema-flexible per the original architecture (`ADAPTIVE_ASSESSMENT_ENGINE_ARCHITECTURE.md` §0.5: "prompt as jsonb since shape varies by subject"). English's shape differs more than Maths's did from VR's, but the column itself needs no change:
  ```
  {
    passageId: string,       // groups questions sharing one passage — see §3.2
    passageText: string,
    questionText: string,
    marks: number             // 2-4 in real content, replaces VR/Maths's implicit 1-mark-per-question assumption
  }
  ```
  Illustrative shape only — not a schema migration, since `prompt` is already jsonb and accepts any shape.
- `explanation` (`text not null`) — maps directly to the existing `modelAnswer` field already present on every real question in `data/lessons.ts`. No new concept needed.
- `skill` — populated from the 10 codes in `ENGLISH_COMPETENCY_FRAMEWORK.md` §3, exactly like `vr.*`/`maths.*` codes today.
- `content_difficulty` / `estimated_time_seconds` — required-before-import, same convention as VR/Maths (`QUESTION_AUTHORING_STANDARD.md` §1). Real lessons have an `estimatedMinutes` at the *lesson* level, not per-question — per-question `estimated_time_seconds` will need to be estimated for each of the 10 real questions during hand-tagging (human task, not automated, same "do not automate metadata generation" principle as VR/Maths).

### 2.2 What genuinely needs a documented convention (not a schema change)

- **Correctness mapping.** VR/Maths questions have one objectively right answer; English comprehension questions are free-text, scored 0/partial/full marks by a keyword-overlap heuristic (`scoreAnswer()` in `app/english/[id]/page.tsx`) against `modelAnswer`. ALI's history/mastery fields (`times_correct`, `last_attempt_correct`, `mastery_state`) are binary. **Proposed convention: an attempt counts as "correct" for ALI purposes only if it earns full marks** (`earnedMarks === maxMarks` for that question) under whatever scoring function is in use at attempt time. This is the simplest, most defensible starting rule — no partial-credit-aware schema needs inventing now — but it is explicitly a **first-pass calibration, not a validated threshold** (same epistemic status as `ALI_LEARNING_MODEL.md` §3.1's illustrative dimension weights): if real usage shows "full marks only" is too strict (mastery never achieved) or too lenient (the keyword heuristic over-awards full marks too easily), the threshold is the first place to revisit, not the schema.

---

## 3. Adaptive-behaviour review

Instruction was to confirm existing ALI logic supports English without redesign, and only propose changes where a genuine gap exists. Two genuine gaps found; both are additive rules layered on top of the existing architecture, not changes to `lib/ali/{questionBank,history,mastery,selection,weakness,config}.ts`, `lib/adaptiveMockBuilder.ts`, Daily Missions, or Parent Insights — all of which already read `subject`/`aliCompetencySignal` generically and required zero changes for Mathematics (`ALI_VERSION.md` §Current capabilities). That proof point is expected to hold for English too, for the parts of the pipeline this section doesn't call out.

### 3.1 Gap 1 — binary correctness vs. partial-credit scoring (see §2.2)

Not a selection or schema problem — a write-back mapping problem. Whatever function eventually writes to `ali_student_question_history` for an English attempt needs to apply the full-marks-only rule at the point of writing `last_attempt_correct`/`times_correct`, exactly the same call shape as VR/Maths's existing `applyAttemptOutcome()`. No new function signature, no new table.

### 3.2 Gap 2 — passage-bundling (the substantive one)

VR and Maths questions are fully atomic and interchangeable: any question can be swapped for any other of similar difficulty/skill without breaking anything, because each question is self-contained. **English comprehension questions are not** — `eng-001-q1` through `eng-001-q4` all depend on having read the same passage. Sampling individual questions across different passages into one mock section, the way `buildAdaptiveSection()` currently weights and samples VR/Maths questions freely by `skill`/`content_difficulty`, would be pedagogically broken: a student could be shown `eng-002-q1` and `eng-003-q2` in the same section without ever being shown either passage.

**Proposed resolution:** selection for English must operate at **passage granularity first, question granularity second** — pick one passage (by the existing weighting/cooldown logic, treating the passage as the schedulable unit competing against other passages), then present every question belonging to that passage together, in order. Per-question mastery, history, and cooldown tracking continue at the individual-question level exactly as today (each question still gets its own `ali_student_question_history` row) — only the *selection* step gains a grouping rule. This is structurally the same shape as the existing guaranteed-minimum-slot mechanism for weak-competency remediation (Decision 17): an additional rule sitting alongside the existing weighted sample, not a rewrite of it.

**Consequence for anti-repetition:** with only 3 real passages (10 questions) today, passage-level cooldown will exhaust the entire pool after 2–3 mocks in real use. This is a **content-volume limitation, not a code problem** — the same honest caveat already carried for VR (52 hand-tagged questions pending) and Maths (20 real questions, synthetic fixture in the meantime). More passages are a prerequisite for meaningful adaptive rotation in English specifically, more so than for VR/Maths, because the schedulable unit is the passage, not the individual question.

### 3.3 Grading-quality caveat (documented, not proposed to be fixed this phase)

`scoreAnswer()`'s keyword-overlap heuristic is approximate — it can both under- and over-credit an answer relative to genuine understanding. English's mastery signal will inherit whatever noise exists in that heuristic, and will be less trustworthy than VR/Maths's exact-match grading until/unless comprehension grading improves. Worth noting for future context (not proposed for this phase): `app/api/writing-feedback/route.ts` already uses LLM-based grading for Writing, producing a considered `overallScore` — a structurally better-evidenced grading approach than Comprehension's keyword heuristic, even though Writing's free-response *format* is further from ALI's atomic-question model (`ENGLISH_COMPETENCY_FRAMEWORK.md` §5). If comprehension grading confidence ever becomes a blocker, that pattern is the closest existing precedent to reach for — but doing so is out of scope here and not proposed as part of Phase 2.1.

### 3.4 What does not change

`lib/ali/mastery.ts`'s evidence-based, revocable, session-based mastery model applies to English exactly as written — a "distinct correct session" is still a distinct correct session regardless of subject. `lib/ali/weakness.ts`'s competency-level weak-detection is already keyed by `skill` string, so `english.inference` is just another value it never needs to know about specially. Daily Missions and Parent Insights need no changes, per the same generic-by-subject-key proof already established by Mathematics.

---

## 4. Validation approach

Same technique as every prior ALI phase (Slice 1, 1.1, 1.3, 1.4, 2.0) — a throwaway `npx tsx` script driving the real pure functions end-to-end, deleted before commit, since no test framework exists in this repo. For English specifically, the script should additionally verify the two new rules from §3, which prior phases' scripts didn't need to check:

1. Passage-grouping: a generated mock section for English never mixes questions from two different passages, across many simulated runs.
2. Correctness-mapping: a synthetic attempt scoring exactly `maxMarks` registers as correct in the simulated history; anything less does not, including a still-substantial partial-credit score (e.g. 3/4 marks) — this is the one behavioural check unique to English's grading shape, worth a dedicated assertion rather than assuming it falls out of existing logic.
3. Existing checks carried over unchanged: no question repeats inappropriately (bounded by real content volume, §3.2), weak-competency override still fires correctly, mastery is revocable, and — the standing multi-subject coexistence check since Mathematics — a student with VR + Maths + English signals simultaneously shows zero cross-subject signal leakage in any direction.

Browser-verification (same as every prior phase): `/english` and `/english/[id]` render identically to pre-ALI baseline for the existing static lessons; any new adaptive English route (if built) shows a graceful error state, not a crash, when Supabase is unreachable (this sandbox's standing network limitation, unchanged since Slice 1).

---

## 5. Migration strategy

**No new migration file is structurally required.** Both facts that would normally force one are already satisfied:

1. `subject_type` already contains `'english'` (migration 001) — no `ALTER TYPE` needed (unlike VR, which needed migration 004 for the 4 reasoning subjects).
2. `question_type` is a plain text column, not an enum — a new value (`'open-response'` or equivalent) needs no schema change at all, only a different string at import time.

**What is actually required before any real English content reaches `ali_question_bank`:**

- The real hand-tagging pass on the 10 existing questions (competency code from `ENGLISH_COMPETENCY_FRAMEWORK.md` §3, `content_difficulty`, `estimated_time_seconds`, `marks` inside `prompt`) — a human task, same "do not automate metadata generation" precedent as the pending 52 VR / 20 Maths passes. All three hand-tagging passes are still outstanding as of this phase.
- Migrations 004–006 (VR/Maths era) are **still unapplied to production** — this remains unchanged and is not this phase's blocker to resolve; noted here only so it isn't lost when English's own (structurally simpler) migration story is being reasoned about.
- A synthetic fixture (same pattern as `data/ali/vrSyntheticFixture.ts`) is the sensible way to unblock code/validation work in parallel with the real hand-tagging pass, exactly as done for both prior subjects.

---

## 6. Why this demonstrates "minimal new infrastructure" (the stated success criterion)

**Not needed:** a new Supabase migration, a new enum value, any change to `lib/ali/{questionBank,history,mastery,selection,weakness,config}.ts` or `lib/adaptiveMockBuilder.ts`, any change to Daily Missions or Parent Insights, a new `ali_`-prefixed table.

**Genuinely new, both additive:** (1) a documented correctness-mapping convention (full-marks-only, a rule not a schema change) for translating partial-credit scores into ALI's binary correctness fields, and (2) a passage-grouping rule in the selection step, so English's non-atomic question structure is respected without changing how VR/Maths selection works. Both sit alongside existing logic the same way Decision 17's guaranteed-minimum-slot mechanism does — proven additive-extension shape, not a new one.

**Also required, but not code:** one content-authoring/hand-tagging pass on the 10 real questions, and — longer-term, flagged honestly rather than promised — more real passages, since passage-level (not question-level) cooldown means English's adaptive rotation is more sensitive to content volume than VR/Maths's was.

---

## Explicitly out of scope for this document

No code, migrations, or schema are created here. No decision here is approved for implementation. If approved, the recommended first build slice mirrors VR/Maths precedent: implement the two additive rules (§3.1, §3.2) plus a synthetic fixture first, real hand-tagging as a parallel human-owned task, before any production route is built.
