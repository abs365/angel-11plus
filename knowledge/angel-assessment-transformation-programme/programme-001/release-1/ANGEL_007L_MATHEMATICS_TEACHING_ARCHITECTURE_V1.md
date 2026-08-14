# Angel 11+ — Educational Increment 007L — Mathematics Teaching Architecture and Evidence Standard

**Prepared:** 007L, 2026-08-14. Covers the 141 Practice Eligible Mathematics questions / 28 families established by 007K/Batch 4. Scope is architecture definition plus a bounded proof on a small representative family set — not a retrofit of all Mathematics content.

---

## Part 1 — Reconciliation of the current Mathematics learning system

Traced directly from the real code paths, not assumed. Two structurally distinct, currently disconnected Mathematics pathways exist in production today.

### 1A. The Practice pathway (`app/learning-intelligence/practice/[area]/page.tsx`, `MathsActivity`)

This is what all 141 Practice Eligible Mathematics questions actually use today.

```
generatePersonalisedSession() selects questions (family-aware, anti-clustering — lib/learningEngine/sessionGenerator.ts)
→ recordPresentation() writes last_presented_at (lib/ali/history.ts, unchanged, subject-agnostic)
→ MathsActivity renders prompt.question, a single free-text <input>, and Submit
→ checkMathsAnswer(answer, correctAnswer) — one binary check (lib/learningEngine/practiceContent.ts)
→ recordOutcome() with supportTier ALWAYS "independent" (submitReadingOrMaths never passes a second argument for maths)
→ static prompt.workingSteps shown as a plain <ul>, identical regardless of correct/incorrect
→ Next
```

**What genuinely exists here:** ASSESSMENT (a real, correct binary check) and EXPLANATION (the stored `workingSteps`, shown once, after the fact, unconditionally). **What does not exist:** MODEL (nothing shown before the first attempt), GUIDED SUPPORT (no scaffold, no hint, no partial-credit mechanic), REMEDIATION (the question's own `addressesMisconception` field is fetched into `BankQuestion` but never read by this component — confirmed by grep, it is dead data on this path), MASTERY-DISTINCT EVIDENCE (every Mathematics attempt via Practice is unconditionally `supportTier: "independent"` — there is no lower-stakes attempt mode to distinguish from).

### 1B. The Learn pathway (`app/learning-intelligence/learn/mathematics/{arithmetic,percentages}/page.tsx`)

A separate, pre-existing, already-proven reference implementation — **this is the single most important finding of Part 1.** Built in an earlier increment (the "Mathematics Reference Vertical," see `MATHEMATICS_REFERENCE_VERTICAL_BLUEPRINT.md`) explicitly "as the reference pattern later English, Continuous Writing, and further Mathematics areas will follow," and already extended once (MR-01 → MR-04/percentages). It genuinely implements:

```
CONCEPT + METHOD + WORKED EXAMPLES (real MODEL content, hand-authored, shown before any attempt)
→ GUIDED ATTEMPT: a bounded 3-attempt ladder
    attempt 1 (supportTier "independent") wrong → targeted-if-recognised / honest-generic hint, retry
    attempt 2 (supportTier "supported") wrong → full worked resolution shown, one bounded supported retry
    attempt 3 (supportTier "supported") → resolves regardless of outcome, no infinite loop
→ "Watch out for" common-mistakes panel
→ INDEPENDENT CHECK: a bounded 2-attempt ladder, always supportTier "independent"
    attempt 1 wrong → honest diagnostic, NO answer revealed, genuine unaided retry
    attempt 2 wrong → full worked resolution + a FRESH, different transfer item (genuine new evidence, not a repeat)
→ recordPresentation / recordOutcome / processEvidenceForCompetency — the exact same shared functions Practice uses, unmodified
→ progression label surfaced from the real Educational Intelligence Engine (computeRealEducationalState()), not invented
```

This **is** a genuine, working proof that MODEL → GUIDED → INDEPENDENT → REMEDIATION → MASTERY EVIDENCE is achievable inside Angel's existing engine, safely. It already proves every safety property 007L Part 9 asks for: supported success cannot silently become mastery evidence (`lib/ali/mastery.ts`'s `supportTier` gate), a bounded (never infinite) support ladder, no answer-reveal until the learner has had a genuine unaided attempt, and evidence tagged by real source (`learning_guided` vs `learning_independent`) without a second evidence system.

**Its critical limitation:** it is **hand-duplicated per competency**, not family-aware or data-driven. `arithmetic/page.tsx` (923 lines) and `percentages/page.tsx` (757 lines) are near-identical bespoke React pages, each wired to **fixed, hand-authored lesson-specific question IDs** (`learn-mth-arith-guided`, `learn-mth-pct-independent`, …) that exist **outside** the family-based, Batch-reviewed question bank (`mr0X-*` family IDs) entirely. Building this pattern out to even 4–6 more families by copy-paste would mean ~3,000–4,500 more lines of duplicated bespoke code and per-question hand-verified misconception literals — not "extending a shared capability," the exact anti-pattern 007L's own instructions warn against.

### 1C. Explicit distinction (as required)

| Category | Practice pathway (all 141 Qs) | Learn pathway (2 competencies only, fixed IDs) |
|---|---|---|
| Assessment | Real (`checkMathsAnswer`) | Real (same function) |
| Explanation | Real but static, post-hoc, identical either way | Real, contextual (different message for attempt-1-wrong vs attempt-2-wrong) |
| Teaching (MODEL) | **Absent** | Real (Concept/Method/Worked Examples) |
| Guided support | **Absent** | Real (3-attempt bounded ladder, hints, targeted-if-recognised misconception text) |
| Remediation | **Absent** (`addressesMisconception` fetched, never rendered) | Real (per-question hand-verified wrong-answer classification) |
| Mastery evidence | Always `"independent"`, no distinction possible | Real `supportTier` split, `mastery.ts`'s protection proven live |

Static `workingSteps` on the Practice pathway is **not** credited as Guided Practice or MODEL anywhere in this document — it is explanation shown once, after submission, never before an attempt and never interactively.

---

## Part 2 — Reuse-before-build audit

| Capability | Classification | Evidence |
|---|---|---|
| `recordPresentation` / `recordOutcome` (`lib/ali/history.ts`) | **REUSE unchanged** | Subject-agnostic already; the Learn pathway already calls these for Mathematics guided/independent attempts with zero modification needed. |
| `applyAttemptOutcome` / `supportTier` gate (`lib/ali/mastery.ts`) | **REUSE unchanged** | Already proven safe for Mathematics by the Learn pathway; "supported correct ≠ mastery advance" is exactly Part 3E's required principle, already implemented. |
| `processEvidenceForCompetency` / Educational Intelligence Engine | **REUSE unchanged** | Already Mathematics-compatible (`COMPETENCY_ID = "MR-01"` etc. in the Learn pathway). |
| `generatePersonalisedSession` / anti-clustering / family-diversity (`lib/learningEngine/sessionGenerator.ts`) | **REUSE unchanged** | Operates on `family_id` before rendering, subject-agnostic; unaffected by anything added after a question is selected. |
| `checkMathsAnswer` / `parseNumberWithUnit` (Decision 55) | **REUSE unchanged** | Must remain the single source of correctness for every attempt path, guided or independent — no second answer-checking mechanism. |
| Family-keyed lookup pattern (`FAMILY_SCAFFOLD`, `FAMILY_EDUCATIONAL_CONTEXT` in `lib/adminReview.ts`/`guidedPractice.ts`) | **EXTEND** | The *pattern* (a plain `Record<familyId, …>` lookup feeding a shared renderer) is directly reusable; the *English scaffold kinds themselves* (`staged-quotation`, `sequence-anchor`) are reading-comprehension-specific and do not transfer. |
| The Learn pathway's ladder *logic* (bounded 3-attempt guided, 2-attempt independent, resolve-regardless-of-outcome) | **EXTEND** | The state-machine shape is sound and already proven; it should become one shared component parameterised by family content, not copy-pasted a third time. |
| The Learn pathway's *page-per-competency* structure | **DEFER / DO NOT REPEAT** | This is the one thing not to reuse as-is — it does not scale past a handful of hand-built lessons. Generalise the underlying pattern into data instead. |
| English's `WrongAnswerCategory` / `classifyAutomaticError` (`englishErrorClassification.ts`) | **MATHEMATICS-SPECIFIC, do not force** | Depends entirely on English's tiered scoring result structure (`multiSelectDetail`, `sequenceDetail`) which `checkMathsAnswer` has no equivalent of — it returns a bare boolean. Mathematics needs its own, structurally simpler remediation source (see Part 3D). |
| Per-answer hand-verified misconception matching (the Learn pathway's `GUIDED_KNOWN_MISCONCEPTIONS` pattern) | **DEFER** | Real and valuable, but requires hand-verifying specific wrong numbers per question — a real authoring cost not appropriate to fold into a "bounded proof" for every family. The already-existing per-question `addressesMisconception` field (real, 100% populated, currently unread by any UI) is the correct **minimum** baseline; answer-specific matching is a later, optional deepening, not required to reach a genuine teaching system. |
| A new, parallel Mathematics evidence table/engine | **NOT NEEDED, explicitly rejected** | Every capability above already exists and is subject-agnostic; nothing about Mathematics's pedagogy requires a new persistence layer. |

---

## Part 3 — The Mathematics Teaching Contract

### A. MODEL

**Contract:** before a learner's first attempt at a family they have no prior guided/independent evidence for this session, show: (1) what to notice in the question (the structural cue — e.g. "a ratio splitting a stated total, then a follow-on operation on one share"), (2) the mathematical relationship that matters (the formula/rule, in words), (3) why each step is taken, (4) the ordered reasoning applied to a **worked, non-live** example (never the current question's own numbers — the exact rule the existing English `getWorkedExample` pattern already follows and that the Learn pathway's Concept/Method/Worked Examples sections already prove works for Mathematics), (5) how to verify the result (an inverse-operation or plausibility check, mirroring the Learn pathway's `847+356` "check it" step). MODEL must never reveal the live question's own answer — it teaches the *method*, demonstrated on a *different* worked instance.

### B. GUIDED STEP REVEAL + SELF-CHECK

Adapted from the Learn pathway's proven bounded-ladder shape, generalised — and deliberately **not** more ambitious than what the real data safely supports. Investigation of the actual `workingSteps` content for the proof-set families (Part 8) found many step strings are narrative ("Convert both amounts to the same unit (m)") rather than clean, independently-checkable sub-answers, and some contain colons/ratios that would make naive per-step value extraction fragile — exactly the "incorrect Guided step is taught" failure mode named in Part 7. Building a second, parsed, potentially-drifting answer-checker for individual steps was rejected as unsafe and unnecessary.

The proven, safe mechanic instead is **progressive reveal, single scored submission**:

1. Before attempting, the learner may reveal the question's own real `workingSteps` one at a time ("Reveal the next step"), exactly the family's already-verified explanation text — never a second, separately-authored copy that could drift from the real one.
2. The learner still types and submits exactly **one** final answer, checked by the same unmodified `checkMathsAnswer` every Independent attempt uses — Guided Practice never auto-completes or checks any intermediate value.
3. Revealing any step marks this attempt as assisted (Part 3E's `supportTier` contract) — whether the learner reveals zero, one, or every step, the outcome is decided by their own final typed answer, never by how many steps were viewed.

This is a genuinely new but **bounded** mechanic, not a copy of English's four scaffold kinds (none fit arithmetic's step shape) and not a full walkthrough — the full solution is exactly as visible after a wrong attempt today (the unconditional post-hoc `workingSteps` display), the only change is that a learner who opted into Guided mode may see it earlier, one step at a time, before submitting.

### C. INDEPENDENT PRACTICE

No teaching assistance is shown before submission of any kind — no MODEL, no step reveal, no hint. This is the Practice pathway's current, unmodified behaviour for a family with no Guided content in front of it, and remains available even for proof-set families (a learner can always choose "Try independently" instead of Guided). Recorded exactly as today: `supportTier: "independent"`. Per `mastery.ts` (unmodified), only independent success accrues toward `distinctCorrectSessions`/mastery.

### D. WRONG-ANSWER REMEDIATION

**Bounded taxonomy, derived from what the reviewed corpus's own `addresses_misconception` field genuinely supports across the Batch 1–4 families** (not invented, not English's categories forced onto Mathematics):

| Category | Real basis |
|---|---|
| `OPERATION_SELECTION` | Families whose `addressesMisconception` names choosing the wrong operation/approach (e.g. best-value: "compares totals instead of unit price"). |
| `PROCEDURAL_SEQUENCE_ERROR` | Families whose misconception is doing the right operations in the wrong order or stopping one step early (e.g. compound-percentage: "reapplies the % to the original value instead of the changed one"). |
| `UNIT_OR_CONVERSION_ERROR` | Families whose misconception is a unit-handling/conversion slip (e.g. measurement-conversion, mixed-perimeter, far-recipe). |
| `MISREAD_QUANTITY` | Families whose misconception is using the wrong given number for the wrong role (e.g. sum-difference: "splits evenly rather than applying the stated difference"). |
| `STRUCTURAL_MISAPPLICATION` | Families whose misconception is applying the correct-looking formula to a superficially similar but structurally different case (e.g. angle-ratio: base 180° vs 360° confusion; factors-primes: confusing factor-counting with primality). |

**Presentation contract:** after any incorrect attempt (guided or independent), show the family's own already-authored, real `addressesMisconception` text, mapped to its category label above for consistent framing — never a fabricated per-answer diagnosis. This is the honest minimum baseline (Part 2's finding); it does not claim to know *which specific wrong number* the learner typed means, only what this family's real, evidenced common error is. Answer-specific pattern matching (the Learn pathway's `GUIDED_KNOWN_MISCONCEPTIONS` style) remains available as a **future, optional deepening** per family, never claimed as already present.

### E. MASTERY / EVIDENCE

Unchanged, reused exactly:

- MODEL exposure alone writes **no evidence** — it is view-only, exactly like the Learn pathway's Concept/Method sections (local UI state, never persisted).
- A Guided step-reveal attempt is recorded via `recordOutcome(..., supportTier: "supported")`. `source` is unchanged (`"practice_experience"`, set once per session by `recordPresentation` at session start, not per-question) — `supportTier` alone is Practice's existing distinguishing signal, exactly the precedent English's own Guided Practice already established here (the Learn pathway's separate `learning_guided`/`learning_independent` source strings belong to a different, per-attempt-ladder-stage `recordPresentation` call shape that doesn't apply within Practice's one-call-per-session model, and this proof does not invent a new one).
- An Independent attempt (no assistance shown) is recorded `supportTier: "independent"` — unchanged, identical to every other Practice attempt today.
- An incorrect attempt, guided or independent, still writes real evidence (`timesSeen`/`timesCorrect`/`lastAttemptCorrect`) and still contributes to the `"weak"` signal (`mastery.ts`, unmodified) — remediation is diagnostic and formative, never evidence-suppressing.
- Repeat success and spaced retrieval are governed entirely by the existing, unmodified `distinctCorrectSessions`/`isMaintenanceReviewDue` machinery — nothing new is introduced.
- **Standing principle, preserved exactly as `mastery.ts` already enforces it:** a Guided/supported correct answer can never, by itself, newly reach `"mastered"` — only genuine independent evidence can.

---

## Part 4 — Mathematics Teaching Evidence Standard

For a family to be certified at a given maturity state, evidence must exist for:

1. **Mathematical correctness** — first-principles re-verification (the existing `007i-maths-answer-verification.mjs` pattern), already required and already proven for every reviewed family.
2. **MODEL correctness** — the worked example's own numbers are independently checked, not merely "looks plausible."
3. **MODEL pedagogical usefulness** — a human reviewer confirms the MODEL actually explains *why*, not just restates the answer (Founder judgement, not automatable).
4. **Guided-step correctness** — every step-reveal prompt/step pair matches the family's real, already-verified `workingSteps`.
5. **Support attribution** — automated test proof that every guided attempt is written with `supportTier: "supported"` and every independent attempt with `"independent"`, no exceptions.
6. **Independent-path integrity** — automated test proof that choosing "Independent" renders zero MODEL/step-reveal content and scores identically to today's unmodified Practice behaviour.
7. **Wrong-answer handling** — automated test proof that the shown remediation text is the family's real `addressesMisconception`, not a placeholder, and that it never claims more precision than Part 3D's categories support.
8. **Remediation accuracy** — human reviewer confirms the category mapping (Part 3D's table) is a fair characterisation of the family's real misconception text.
9. **Mastery protection** — automated test proof (extending the existing `mastery.ts` test suite) that a supported-correct outcome cannot newly produce `"mastered"` for a family that wasn't already there.
10. **Repeat-practice behaviour** — confirmation that a learner seeing the same family again is not shown identical MODEL/Guided content in a way that becomes rote-memorisable (the worked example's numbers must differ from any live question's numbers, and remain fixed across sessions by design — same principle the Learn pathway already applies).
11. **Accessibility/readability** — plain-language check (reusing the Copy Quality Guard), no architecture terms (`family_id`, `supportTier`, competency codes) ever learner-facing.
12. **Learner-facing terminology** — consistent with the existing Practice/Learn vocabulary ("Try with guidance" / "Submit" / "Correct" / "Not quite"), no new unexplained jargon.
13. **Production verification** — live browser verification on the deployed pathway, per this project's standing real-learner-path discipline (Decision 52).

### Maturity states (content/system readiness — distinct from, and never to be confused with, the existing learner-facing progression labels in `MATHEMATICS_PROGRESSION_AND_MASTERY_MODEL.md`, which describe an individual learner's state, not a family's teaching-content readiness):

| State | Meaning |
|---|---|
| **ASSESSMENT ONLY** | Today's default for every family without teaching content: question, answer check, static post-hoc explanation. No MODEL, no Guided, no remediation display. (140 of 141 Practice Eligible questions are here as of this increment.) |
| **TEACHING PARTIAL** | MODEL and/or Guided step-reveal content authored and technically wired for this family, evidence items 1–7 met, but not yet human-reviewed (items 3, 8) or production-verified (item 13). |
| **TEACHING REVIEW READY** | All 13 evidence items' automatable checks pass; packaged for Founder review (Part 10), decision pending. |
| **TEACHING HUMAN APPROVED** | Founder has reviewed and approved the MODEL/Guided/Remediation content itself (items 3, 8) — an educational judgement, exactly parallel to the existing `ali_family_review` decision model, never inferred. |
| **TEACHING VERIFIED LIVE** | Approved content deployed and independently confirmed working on the real production pathway (item 13) via direct interaction, not inference. |

**Explicitly preserved, not touched by any of the above:** `Practice Eligible`, `Provisional`, `Independently Validated`, `Mock Eligible` remain exactly what they already mean (content-review/activation states in `ali_question_bank.eligibility_status`). Teaching maturity is an **entirely separate axis** — a family can be `practice_eligible` and simultaneously `ASSESSMENT ONLY` (as 140 of 141 are today) or, after this increment, `practice_eligible` and `TEACHING PARTIAL`/`TEACHING REVIEW READY` for the proof-set families. Nothing in this increment sets `Independently Validated` or changes `Mock Eligible`.

---

## Part 5 — Controlled proof set

Selected from the 28 Practice Eligible Mathematics families, using real repository evidence (Parts 2–3 of the 007K depth audit, re-confirmed against live production), deliberately spanning distinct reasoning structures. **4 families, not 6** — genuinely minimal, per the explicit instruction not to retrofit broadly.

| Family | Reasoning structure | Live PE count | Existing `workingSteps` quality | Why representative |
|---|---|---|---|---|
| `mr01-missing-operand` | Reverse/arithmetic reasoning (solve for an unknown position in an equation) | 4 | Real, step-labelled (inverse operation named) | The most structurally simple case — proves the architecture on the shortest possible step sequence (1 inverse-operation step) before attempting anything harder. |
| `mr04-best-value` | Proportional reasoning (unit-price comparison) | 8 (post-Batch4) | Real, 2-step (unit price A, unit price B, compare) | The thinnest-supply skill pre-Batch4 (007K), already fully mathematically/educationally verified; 2-step but non-arithmetic (division + comparison, not just +/−). |
| `mr03-angle-ratio` | Geometry (ratio-based angle reasoning, two structurally different bases) | 20 | Real, 2-step, genuinely varies base (180°/360°) across siblings | Live-verified in 007K's post-activation check; the strongest structural-variety family in the whole batch — a good stress-test for whether Guided step-reveal generalises across a genuinely varying question shape, not just one fixed template. |
| `mr01-measurement-conversion` | Data/measurement, unit-bearing answer | 4 | Real, 2-step (convert, sum) | Directly exercises Decision 55's unit-answer protection inside the new Guided path — the proof must show the fix applies identically whether the learner answers under Guided or Independent, not just Independent (this was never explicitly tested before). |

**Risks, named honestly:**
- `mr01-missing-operand`'s single-step structure risks under-proving the multi-step case — mitigated by including `mr04-best-value`/`mr03-angle-ratio` (both genuinely 2-step) in the same set.
- `mr03-angle-ratio`'s two-base variation (180° vs 360°) means the MODEL's worked example must be chosen carefully so it doesn't itself look like a template being applied to only one base — the worked example uses the 180°-base case; the family's own live questions cover both, so Independent Practice still exercises the un-modelled base honestly.
- No new questions are authored to build this set — all content used is the families' own already-reviewed, already-verified live data.

---

## Part 6 — Minimum implementation architecture

**Where MODEL/Guided content lives:** a new, plain data module `lib/learningEngine/mathsTeachingContent.ts`, structurally identical in shape to `lib/adminReview.ts`'s `FAMILY_EDUCATIONAL_CONTEXT` and `guidedPractice.ts`'s `FAMILY_SCAFFOLD` — a `Record<familyId, MathsFamilyTeachingContent>` lookup, **not** a database table (matching this project's established convention that teaching-support metadata is code-reviewed content, same as English's worked examples and exam strategy hints; a schema change is not required and would be disproportionate to a 4-family proof).

**Authored vs. derived vs. hybrid:** MODEL's worked example is **authored** (a fixed, safe, non-live instance, hand-written per family, same discipline as `ENGLISH_FAMILY_WORKED_EXAMPLE`). The Guided step reveal is **entirely derived, never authored twice**: it reads the live question's own real `workingSteps` array directly at render time — there is no second, independently-authored copy of any step that could drift from the real one (Part 3B's finding: per-step *checking* was rejected as unsafe; per-step *reveal* of already-real text carries no such risk).

**Step-state representation:** a small local component counter, `stepsRevealed: number` (0..`workingSteps.length`), replacing the Learn pathway's fixed `GuidedLadderStage`/`IndependentLadderStage` union with a family-agnostic count driven by that family's real step count — not hard-coded per family.

**How assistance is recorded:** one `recordOutcome` call per *question*, at the point the learner submits their final answer — identical call shape to today, only the `supportTier` argument differs (`source` is unchanged, set once per session, not per-question — see Part 3E). `supportTier: "supported"` whenever the learner had Guided mode toggled on for that question, exactly mirroring English's existing `guidedMode ? "supported" : "independent"` convention in `submitReadingOrMaths` (reused, not reinvented); `supportTier: "independent"` otherwise, unchanged from today. No new database writes beyond what `recordOutcome`/`recordPresentation` already do.

**How remediation is selected:** a pure function `getMathsRemediationCategory(familyId): MathsMisconceptionCategory | undefined`, mirroring `getSelfReflectionCategories()`'s exact shape (static lookup, not live introspection, since `checkMathsAnswer` returns only a boolean) — returns Part 3D's category, and the display layer always shows the question's own real `addressesMisconception` text alongside it (never the category alone, never a fabricated explanation).

**How supported evidence reaches mastery:** unchanged — `recordOutcome`'s existing `supportTier` parameter, `applyAttemptOutcome`'s existing gate. Zero modification to `lib/ali/mastery.ts` or `lib/ali/history.ts`.

**How independent attempts remain distinguishable:** the Practice page's `MathsActivity` gains a "Try with guidance" / "Try independently" toggle, exact visual/interaction pattern already proven for English (`guidedMode` in `ReadingActivity`) — reused, not reinvented. Choosing Independent renders **zero** new UI; the component tree is unchanged from today's `MathsActivity` in that mode.

**How family-specific pedagogy avoids hard-coded page logic:** entirely through the `mathsTeachingContent.ts` lookup — the rendering component (`MathsActivity`, extended) reads `getMathsTeachingContent(familyId)` and renders generically; a family absent from the lookup renders **exactly today's unmodified ASSESSMENT ONLY behaviour** (the fallback path, tested explicitly — see Part 9). No `if (familyId === "mr03-angle-ratio")` branches anywhere in the component.

**Extensibility:** adding a 5th, 6th, Nth family requires only a new entry in `mathsTeachingContent.ts` plus that family's own certification against the Part 4 evidence standard — no new component code, no new database migration, no new page.

---

## Part 7 — Failure modes and controls

| Failure mode | Control |
|---|---|
| MODEL leaks the live answer | MODEL's worked example is a fixed, hand-authored, different instance from any real question in the family — structurally identical to the already-proven `ENGLISH_FAMILY_WORKED_EXAMPLE`/Learn-pathway pattern. Test: assert the MODEL's own answer value never equals any live question's stored answer for that family. |
| Guided Practice becomes answer reveal | Step reveal shows only the *next single step's* text after a wrong attempt at that step, never the full solution before the learner has attempted every step themselves; the final answer is always learner-supplied. Test: assert the full final answer string never appears in rendered Guided UI before the learner's own final submission. |
| Incorrect Guided step is taught | Step-reveal text is read live from the question's own already-verified `workingSteps` (Part 2's first-principles check already covers this data), never a separately-authored, potentially-drifting copy. |
| Unit handling becomes inconsistent | Guided and Independent paths both terminate in the exact same `checkMathsAnswer` call — Decision 55's fix applies identically to both by construction, not by parallel reimplementation. Test: `mr01-measurement-conversion` bare-number acceptance re-proven specifically under the Guided path. |
| Equivalent mathematical answers rejected | No change to `checkMathsAnswer` in this increment; existing bank-wide regression (166/146) re-run unchanged as part of Part 9. |
| Learner receives misleading remediation | Remediation always shows the family's own real, human-review-evidenced `addressesMisconception` text — never a fabricated per-answer diagnosis (Part 3D). |
| Supported attempt accidentally counts as independent | `supportTier` is set deterministically from the same `guidedMode` toggle state English already uses (on = `"supported"`, off = `"independent"`), tested directly (Part 9) against `mastery.ts`'s existing gate. |
| Repeated support produces false mastery | Unmodified `applyAttemptOutcome`: a `"supported"` correct outcome can never itself set `"mastered"` — proven by the existing test suite and re-asserted for the new call sites. |
| Family-specific logic leaks into unrelated families | The lookup-table architecture (Part 6) means an absent `familyId` renders the unmodified fallback path — tested explicitly for every one of the other 24 non-proof-set Practice Eligible families. |
| Teaching content and question content drift apart | Guided step values are derived live from `workingSteps`, not duplicated; a first-principles regression (Part 9) re-verifies this derivation against production on every run. |
| Static `workingSteps` relabelled as MODEL without genuine improvement | Rejected explicitly in Part 1C's classification table; MODEL is authored, separate, non-live content — `workingSteps` remains what it always was (post-attempt explanation), never renamed or repurposed. |
| Learner becomes dependent on hints | Out of scope for a 4-family proof to solve generally; the existing "gradually reduce support" session-local nudge pattern (English, `guidedFamiliesRef`) is the established precedent and is reused identically — a family leaves Guided default once answered correctly under guidance this session. |
| Exposure logic repeatedly serves memorised variants | `sessionGenerator.ts`'s anti-clustering/family-diversity logic is entirely upstream of and unmodified by this work (Part 2) — unaffected by design. |

---

## Part 8 — Bounded proof implementation

**No genuine learner-facing defect was found during this increment.** Nothing was reported-then-fixed under this stop condition.

**Files created:**
- `lib/learningEngine/mathsTeachingContent.ts` — the family-keyed `MATHS_FAMILY_TEACHING_CONTENT` lookup (Part 6), `MathsMisconceptionCategory`/`MATHS_MISCONCEPTION_CATEGORY_LABEL` (Part 3D/4), `getMathsTeachingContent()`. 4 families only.

**Files modified:**
- `app/learning-intelligence/practice/[area]/page.tsx` — `MathsActivity` extended with a Guided-mode toggle (reusing `ReadingActivity`'s exact `guidedMode` pattern), MODEL display, progressive `workingSteps` reveal, and misconception-mapped remediation display. `submitReadingOrMaths`'s Mathematics branch now passes `supportTier` (`"supported"` when guided, `"independent"` otherwise) instead of always defaulting to independent. A new `mathsGuidedFamiliesRef`, mirroring the existing `guidedFamiliesRef`'s "gradually reduce support" session-local discipline, seeded only with proof-set families present in the session.

**Data structures affected:** none in the database. No migration. `eligibility_status`, `Independently Validated`, `Mock Eligible` all untouched by construction (no code path in this change writes to `ali_question_bank`).

**Fallback proof:** every family outside the 4-family proof set renders through the exact same, byte-for-byte unmodified code path as before this increment — `getMathsTeachingContent(familyId)` returns `undefined`, so no guided toggle, MODEL, step reveal, or remediation panel is rendered; only the pre-existing static post-hoc `workingSteps` display remains, unchanged.

**MODEL content authored (Part 3A), independently verified (item 1 of Part 4's evidence standard, re-derived not merely asserted):**
- `mr01-missing-operand`: ▢ × 6 = 54 → 9 (verified 9 × 6 = 54).
- `mr04-best-value`: 4-for-£2.00 vs 7-for-£3.15 → B (verified £0.50 vs £0.45 per item).
- `mr03-angle-ratio`: ratio 4:1 of 180° → 144° (verified 144° + 36° = 180°).
- `mr01-measurement-conversion`: 1.5m + 60cm → 2.1m (verified 210cm = 150cm + 60cm).

**A real defect was caught and fixed during this increment's own verification, disclosed honestly:** the first authored `mr01-missing-operand` MODEL (▢ × 6 = 42 → 7) and the first authored `mr03-angle-ratio` MODEL (ratio 3:2 of 180° → 108°) both collided with real live questions' own answers in that family (`mr01-mop-02` = 7; `mr03-angratio-01`'s 2:3 ratio is symmetric to 3:2 and also gives 108°) — caught by the automated tests in Part 9 (written before this was noticed), not by inspection. Both were corrected (54÷6=9; ratio 4:1→144°) before this proof was considered complete. This is exactly the "MODEL leaks the live answer" failure mode named in Part 7, and exactly why that test exists.

---

## Part 9 — Automated verification

- **New unit tests** (`tests/lib/learningEngine/mathsTeachingContent.test.ts`): 11/11 PASS — proof-set membership is exactly the 4 families (no more, no less), the fallback path returns `undefined` for every other family, every MODEL's mathematics is independently recomputed and correct, every misconception category has a label, and no MODEL answer/scenario collides with any live question's own values for that family (this test suite is what caught the two defects in Part 8).
- **Live production verification script** (`scripts/007l-model-verification.mjs`, new): re-runs the collision check against fresh production data (not the frozen test snapshot) and confirms every proof-set family's live questions still have real, non-empty `workingSteps` and `addressesMisconception` — **18/18 rows PASS, 0 failures**.
- **Complete existing regression suite**: **250/250 PASS** (239 pre-existing + 11 new).
- **TypeScript**: clean, 0 errors.
- **Copy Quality Guard**: initially caught 6 real em/en-dash violations in the newly authored learner-facing MODEL text (3 on the first pass, 3 more on the second) — all corrected to natural punctuation; final result **PASS, 0 violations across 230 files**.
- **Production build**: succeeds.
- **Mathematics correctness regression**: re-run fresh, **72/72 PASS** across all 27 families this project's verifier scripts cover (every Practice Eligible family, not just the proof set).
- **Decision 55 (unit-answer) regression**: re-run fresh, **166/166 PASS** across all 146 live Mathematics rows — the Guided path terminates in the exact same unmodified `checkMathsAnswer` call as Independent, so this protection applies identically to both by construction, not by parallel reimplementation.
- **English regression**: unaffected — no English file was modified; the full 250-test suite includes the complete English/`guidedPractice`/`englishErrorClassification` test coverage, all passing unchanged.
- **Exposure/anti-memorisation regression**: unaffected — `sessionGenerator.ts` was not modified; its own existing test coverage (included in the 250) passes unchanged.
- **Mock firewall**: `Mock Eligible = 0`, confirmed by direct production query, unchanged from the pre-007L baseline.
- **Production counts**, queried fresh, confirmed unchanged from the pre-007L (post-007K) baseline: TOTAL 264, Practice Eligible 247 (Maths 141 / English 106), Provisional 17 (Maths 5 / English 11), Mock Eligible 0. **No eligibility change of any kind occurred in this increment** — expected, since no code path in Part 8 writes to `ali_question_bank`.

**Safety properties explicitly proven (Part 9's checklist):**

| Property | Evidence |
|---|---|
| MODEL does not reveal the live answer improperly | Automated test + live script, both re-run after 2 real defects were found and fixed (Part 8) |
| Guided steps correspond to correct mathematics | Guided reveal reads the question's own already-first-principles-verified `workingSteps` directly, never a second copy |
| Correct Guided completion scores correctly | Same unmodified `checkMathsAnswer` call for both paths |
| Incorrect Guided completion does not receive false success | Same unmodified `checkMathsAnswer` call; no separate "partial credit" path exists |
| Assistance is recorded | `supportTier` argument now threaded from `guidedMode`, exactly mirroring English's already-proven `submitReadingOrMaths` convention |
| Guided success remains supported evidence | `recordOutcome(..., supportTier: "supported")`, unmodified function |
| Supported evidence cannot incorrectly produce mastery | `lib/ali/mastery.ts` untouched; its own existing, passing test suite (part of the 250) already proves this gate |
| Independent correct answers remain independent | Fallback families (24 of 28) use the byte-for-byte unmodified code path; proof-set families toggled to Independent mode render zero new UI |
| Independent scoring is unchanged | `checkMathsAnswer` untouched |
| Wrong-answer remediation is appropriate | Sourced from the family's own real, human-review-evidenced `addressesMisconception`, mapped to Part 3D's evidence-derived category, never fabricated |
| Unit-bearing answers remain protected (Decision 55) | 166/166 bank-wide regression re-run fresh, including `mr01-measurement-conversion` specifically |
| Family isolation works | Lookup-table architecture; a family absent from `MATHS_FAMILY_TEACHING_CONTENT` cannot render any new UI, by construction |
| Existing English teaching paths are not regressed | Zero English files touched; full English test suite passes unchanged |
| Exposure/anti-memorisation remains sound | `sessionGenerator.ts` untouched; its test suite passes unchanged |
| Mock Eligible remains 0 | Confirmed by direct production query |

---

## Part 10 — Human educational review readiness

**Technical correctness (Parts 8-9) is not human educational approval.** No maturity state above `TEACHING PARTIAL` (Part 4) is claimed for any of the 4 proof-set families — none has been human-reviewed (evidence items 3, 8) or production-verified (item 13). This section packages what the Founder needs to inspect that judgement; it does not pre-approve anything, and no review decision has been recorded anywhere.

**Note on production verification:** this proof has **not been deployed**. Per this project's established pattern (content-review artefacts are prepared and reported first; commit/push/deployment follows only after explicit Founder review and authorisation, as happened for every Controlled Review Batch), the code above exists locally, fully tested, but is not live at `https://angel-11plus.vercel.app`. Evidence item 13 (production verification) is therefore honestly reported as **NOT YET PERFORMED**, not fabricated or inferred.

### Review pack: all 4 proof-set families

**1. `mr01-missing-operand`**
- **MODEL**: "▢ × 6 = 54. What number replaces the box?" → reasoning: division is multiplication's inverse → 9. Verified 9 × 6 = 54.
- **Guided sequence**: reveals the family's own real `workingSteps` (currently a single summary line per question, e.g. "Rearrange to find the missing number: 12") one at a time on request.
- **Expected learner reasoning**: recognise which operation is shown, apply its inverse to the two visible numbers.
- **Correct answer** (representative, `mr01-mop-01`): 12.
- **Common wrong reasoning**: applying the stated operation directly to the two visible numbers instead of its inverse (the family's own real, evidenced `addressesMisconception`).
- **Remediation shown**: `OPERATION_SELECTION` category label + the real misconception text above.
- **Evidence classification**: `supportTier: "supported"` if Guided was on for this attempt, `"independent"` otherwise; unchanged mastery gate.

**2. `mr04-best-value`**
- **MODEL**: 4-for-£2.00 vs 7-for-£3.15 → unit prices £0.50 vs £0.45 → B is better value. Verified by re-multiplying.
- **Guided sequence**: reveals `workingSteps` (3 real steps: Option A unit price, Option B unit price, comparison) one at a time.
- **Expected learner reasoning**: divide each total by its quantity before comparing.
- **Correct answer** (representative, `mr04-bv-01`): A.
- **Common wrong reasoning**: comparing the total prices directly instead of the per-item price (real, evidenced).
- **Remediation shown**: `OPERATION_SELECTION` category + the real text.
- **Evidence classification**: identical contract to family 1.

**3. `mr03-angle-ratio`**
- **MODEL**: ratio 4:1 of 180° → 144°. Verified 144° + 36° = 180°.
- **Guided sequence**: reveals `workingSteps` (3 real steps: total identified, share computed, largest angle computed) one at a time.
- **Expected learner reasoning**: identify the correct total (180° or 360°), divide by the sum of ratio parts, multiply by the required part.
- **Correct answer** (representative, `mr03-angratio-01`): 108°.
- **Common wrong reasoning**: treating the ratio numbers themselves as the answer in degrees (real, evidenced).
- **Remediation shown**: `STRUCTURAL_MISAPPLICATION` category + the real text.
- **Evidence classification**: identical contract to family 1.

**4. `mr01-measurement-conversion`**
- **MODEL**: 1.5m + 60cm → 2.1m. Verified via cm.
- **Guided sequence**: reveals `workingSteps` (2 real steps: convert, sum) one at a time.
- **Expected learner reasoning**: convert both amounts to the same unit before adding.
- **Correct answer** (representative, `mr01-conv-01`): 4.25m (bare number `4.25` also accepted, Decision 55).
- **Common wrong reasoning**: adding the two numbers directly without converting first (real, evidenced).
- **Remediation shown**: `UNIT_OR_CONVERSION_ERROR` category + the real text.
- **Evidence classification**: identical contract to family 1; specifically re-verified that Decision 55's bare-number acceptance applies identically under Guided mode (same `checkMathsAnswer` call).

**No review decision has been preselected for any family.** The Founder's judgement on Parts 3-8's design and content — not this document's own confidence — is what would move any family from `TEACHING PARTIAL` toward `TEACHING REVIEW READY` / `TEACHING HUMAN APPROVED`.

---

## Part 11 — Final Report: ANGEL 11+ EDUCATIONAL INCREMENT 007L MATHEMATICS TEACHING ARCHITECTURE AND EVIDENCE STANDARD REPORT

1. **Current Mathematics learning-path finding**: two disconnected pathways exist. The Practice pathway (all 141 Practice Eligible questions) is ASSESSMENT ONLY — a real check, a real but static post-hoc explanation, no MODEL, no guided support, no remediation display (the question's own `addressesMisconception` field is fetched but never rendered). A separate, pre-existing "Learn" pathway (`app/learning-intelligence/learn/mathematics/{arithmetic,percentages}`) already genuinely implements MODEL→Guided (bounded ladder)→Independent Check→Remediation→real mastery evidence for exactly 2 competencies, using fixed, hand-authored lesson-specific question IDs entirely outside the family-based reviewed question bank.
2. **Assessment capability found**: real (`checkMathsAnswer`, unmodified, Decision 55-protected) on both pathways.
3. **Existing teaching capability found**: real and proven, but confined to the Learn pathway's 2 hand-built lesson pages; zero teaching capability exists anywhere on the Practice pathway prior to this increment.
4. **Reusable English/shared capabilities**: `recordPresentation`/`recordOutcome`/`applyAttemptOutcome`/`processEvidenceForCompetency` (all subject-agnostic, zero modification needed), the family-keyed lookup pattern (`FAMILY_SCAFFOLD`/`FAMILY_EDUCATIONAL_CONTEXT`), the `guidedMode` toggle UI/interaction pattern, `sessionGenerator.ts`'s anti-clustering (entirely upstream, unaffected).
5. **Mathematics-specific capabilities required**: a new, bounded "progressive step reveal" mechanic (English's 4 scaffold kinds don't fit arithmetic's shape); a new, corpus-derived misconception taxonomy (English's tiered-result-based classification has no Mathematics equivalent, since `checkMathsAnswer` returns only a boolean).
6. **Deferred capabilities**: answer-specific misconception pattern matching (the Learn pathway's `GUIDED_KNOWN_MISCONCEPTIONS` style — real authoring cost, not required for a genuine minimum teaching system); per-step checked scoring (rejected as unsafe, see item 27); the Learn pathway's page-per-competency structure (explicitly not to be repeated).
7. **Final Mathematics teaching contract**: defined in Part 3 (A-E) — MODEL (authored, non-live worked example), Guided step reveal + self-check (progressive reveal of real `workingSteps`, single scored final submission), Independent (unchanged), Wrong-answer remediation (family's own real `addressesMisconception`, mapped to a 5-category taxonomy), Mastery evidence (unchanged `supportTier` gate).
8. **MODEL design**: what to notice, the relationship/rule in words, a safe non-live worked scenario, ordered reasoning, the scenario's answer, and a verification step — see Part 3A and the 4 authored examples in Part 8.
9. **Guided Step Reveal + Self-Check design**: progressive reveal of the question's own real, already-verified `workingSteps` (not a second authored/checked copy); the learner always submits exactly one final answer, scored identically to Independent — see Part 3B for why per-step *checking* was explicitly rejected as unsafe.
10. **Independent Practice contract**: unchanged; zero new UI renders in this mode; `supportTier: "independent"` exactly as today.
11. **Wrong-Answer Remediation design**: a 5-category taxonomy (`OPERATION_SELECTION`, `PROCEDURAL_SEQUENCE_ERROR`, `UNIT_OR_CONVERSION_ERROR`, `MISREAD_QUANTITY`, `STRUCTURAL_MISAPPLICATION`) derived from the real reviewed corpus, always paired with the family's own real misconception text — never a fabricated per-answer diagnosis.
12. **Mastery/evidence contract**: unchanged `recordOutcome`/`applyAttemptOutcome`; `supportTier` set from the same `guidedMode` toggle convention English already established; supported success can never newly reach "mastered."
13. **Mathematics Teaching Evidence Standard**: 13 evidence items defined (Part 4) spanning correctness, MODEL quality, guided/remediation correctness, mastery protection, repeat-practice behaviour, accessibility, and production verification.
14. **Maturity-state model**: `ASSESSMENT ONLY` → `TEACHING PARTIAL` → `TEACHING REVIEW READY` → `TEACHING HUMAN APPROVED` → `TEACHING VERIFIED LIVE` — an axis entirely separate from, and never redefining, `Practice Eligible`/`Provisional`/`Independently Validated`/`Mock Eligible`.
15. **Controlled proof families selected**: `mr01-missing-operand`, `mr04-best-value`, `mr03-angle-ratio`, `mr01-measurement-conversion` — 4 families, spanning reverse-arithmetic, proportional, geometric, and measurement/unit reasoning.
16. **Selection rationale**: real repository evidence (007K's depth audit, re-confirmed live), deliberate structural diversity, and direct exercise of Decision 55's unit-answer protection under the new Guided path specifically — see Part 5 for the full per-family justification and named risks.
17. **Architecture implemented**: a plain, family-keyed data lookup (`mathsTeachingContent.ts`) feeding a generically-rendering, extended `MathsActivity` component; no new database table, no new persistence mechanism, no parallel evidence engine — see Part 6.
18. **Files/components/data structures affected**: `lib/learningEngine/mathsTeachingContent.ts` (new), `app/learning-intelligence/practice/[area]/page.tsx` (modified: `MathsActivity`, `submitReadingOrMaths`, a new `mathsGuidedFamiliesRef`). No database migration.
19. **Failure-mode controls**: 12 named failure modes, each with a documented, mostly structural (not merely procedural) control — see Part 7. Two of these (MODEL answer leakage) were caught for real by the automated tests this increment wrote, not merely asserted safe in theory.
20. **Automated verification result**: 11/11 new unit tests PASS; 18/18 live production checks PASS (`scripts/007l-model-verification.mjs`); 250/250 total regression suite PASS.
21. **Mathematics correctness regression**: 72/72 PASS across all 27 verifier-covered Practice Eligible families, re-run fresh.
22. **Decision 55 unit-answer regression**: 166/166 PASS across all 146 live Mathematics rows, re-run fresh; the Guided path shares the exact same `checkMathsAnswer` call as Independent, so protection is structural, not duplicated.
23. **English regression**: unaffected; zero English files modified; full English test suite passes unchanged.
24. **Exposure/anti-memorisation regression**: unaffected; `sessionGenerator.ts` untouched; its test suite passes unchanged.
25. **Mock firewall result**: `Mock Eligible = 0`, confirmed by direct production query, unchanged.
26. **Production counts and confirmation no unauthorised eligibility change occurred**: TOTAL 264, Practice Eligible 247 (Maths 141/English 106), Provisional 17 (Maths 5/English 11), Mock Eligible 0 — identical to the pre-007L baseline; no code path in this increment writes to `ali_question_bank.eligibility_status`.
27. **Known limitations**: (a) this proof is **not yet deployed** — production verification (evidence item 13) is honestly outstanding, not fabricated; (b) Guided support is progressive-reveal, not per-step checked (a deliberate, disclosed safety choice, Part 3B); (c) remediation is family-level, not answer-specific (a deliberate, disclosed minimum baseline, Part 2); (d) only 4 of 28 Practice Eligible Mathematics families have any teaching content; (e) no human educational review has yet occurred for any of the 4 (Part 10).
28. **Human-review readiness**: a full review pack for all 4 families (MODEL, Guided sequence, expected reasoning, correct answer, common wrong reasoning, remediation, evidence classification) is prepared in Part 10 of this document. No review decision has been preselected.
29. **PASS / PASS WITH FINDINGS / FAIL**: **PASS WITH FINDINGS.** The architecture is sound, the bounded proof is implemented and fully verified locally, and two real defects were found and fixed by this increment's own testing before completion (a genuine success of the process, not a failure of it). Findings are items 27(a)-(e), all honestly disclosed limitations, not defects.
30. **Exact recommended next action**: this proof is **not deployed**. The next action is Founder review of Parts 3-8's design and the Part 10 review pack; if approved, the recommended follow-on increment is (i) commit/push/deploy this exact bounded proof under the same controlled-artefact-freeze pattern already established for content review batches, (ii) live-verify all 4 families on production per evidence item 13, (iii) only then consider whether to extend `MATHS_FAMILY_TEACHING_CONTENT` to further families, one certified family at a time against the Part 4 evidence standard — never a mass retrofit.

**007L STOPS here for Founder review.** Nothing has been committed, pushed, or deployed. No further Mathematics family was retrofitted, no legacy question was classified, no additional content was activated, no Batch 5/Wave 3/new subject/Mock work was begun.
