# Angel 11+ — CSSE Completion Programme, Phase C — English Teaching Completion and Learner Experience Assurance

**Prepared:** 2026-08-17. Founder authorisation: PROCEED, on the explicit condition that Mock, Continuous Writing, Phase E, GL/CEM/ISEB/Independent work, and mass content authoring are all out of scope.
**Scope:** the 9 named CSSE English Reading/Comprehension families and the existing English teaching mechanisms (MODEL, Guided Practice, wrong-answer remediation, exam strategy). Does not touch Mathematics, Continuous Writing, Mock, or the underlying question content itself.
**Status:** audit complete; one bounded, evidence-based correction implemented and live (Educational Increment 007O); Founder educational review of that correction prepared, not yet performed (Part 13, Educational Increment 007P).

---

## Part 1 — Production baseline, re-queried fresh

Live production, re-queried via the same anon-key REST path every prior increment in this project has used, 2026-08-17: **TOTAL 264, Practice Eligible 247, Mathematics PE 141, English PE 106, Provisional 17, Mock Eligible 0.** Byte-identical to the baseline this directive itself stated. No discrepancy found; nothing else in this phase changes these counts (confirmed again after Part 3/13's own changes, §15 below).

**English estate, recomputed:**

| Metric | Count |
|---|---|
| Named English families | 9 |
| Legacy ungrouped English rows | 13 (all Practice Eligible, `family_id: null`, 0% `addresses_misconception` populated) |
| Named-family Practice Eligible questions | 93 |
| `wave1-fam-tick-justify` | 11 authored, reviewed-shaped rows, **0 Practice Eligible** (still `provisional`) |
| Total English PE (93 named + 13 legacy) | 106 ✓ matches baseline |
| Distinct passages (`learning_unit_id`) across all English rows (PE + provisional) | **19** |

---

## Part 2 — Fresh code-level trace of the complete English learner pathway

Traced directly: `lib/learningEngine/guidedPractice.ts`, `englishExamStrategies.ts`, `englishErrorClassification.ts`, `englishAnswerValidation.ts`, `app/learning-intelligence/practice/[area]/page.tsx`'s `ReadingActivity`, `lib/learningEngine/sessionGenerator.ts`, `lib/ali/exposureIntelligence.ts`, `lib/ali/selection.ts`. A capability is only counted here if the learner can actually receive it through the real Practice pathway — stored content that is never rendered does not count (this is exactly what Part 3 below is about).

**Full per-family capability matrix** (validation tier queried live per-row, 100% consistent within each family):

| Family | Tier | MODEL | Guided | Remediation (before this phase) | Exam strategy |
|---|---|---|---|---|---|
| `wave1-fam-direct-retrieval` (14 PE) | TIER2_ACCEPTED_SET | **None** | INSTRUCTIONAL ONLY | **NONE** | Present |
| `wave1-fam-synonym-battery` (11 PE) | TIER2_ACCEPTED_SET | **None** | INSTRUCTIONAL ONLY | Automatic `VOCABULARY_CONTEXT_ERROR` | Present |
| `wave1-fam-vocab-explain` (17 PE) | TIER2_ACCEPTED_SET | Present | INSTRUCTIONAL ONLY | Automatic `VOCABULARY_CONTEXT_ERROR` | Present |
| `wave1-fam-tick-justify` (0 PE, blocked) | TIER3 | **None** | INSTRUCTIONAL ONLY | **NONE** | Present |
| `wave1-fam-quote-explain` (13 PE) | TIER3_QUOTATION_PLUS_EXPLANATION (self-assessed) | Present | **REAL** (`staged-quotation`) | Self-reflection checklist | Present |
| `wave1-fam-two-character` (6 PE) | TIER3 (self-assessed) | Present | INSTRUCTIONAL ONLY | Self-reflection checklist | Present |
| `wave1-fam-sequencing` (15 PE) | TIER4_ORDERED_LIST | Present | **REAL** (`sequence-anchor`) | Automatic `EVIDENCE_NOT_LOCATED`/`SEQUENCE_ERROR` | Present |
| `wave1-fam-emotion-cause` (11 PE) | TIER5_NAMED_COMPONENT (self-assessed) | **None** | INSTRUCTIONAL ONLY | Self-reflection checklist | Present |
| `wave2-fam-multiselect` (6 PE) | TIER6_MULTI_SELECT | Present | **REAL** (`selection-count-check`) | Dedicated worded over-/under-selection message | Present |

**Every named family has an exam-strategy hint** (`ENGLISH_FAMILY_EXAM_STRATEGY`, 9/9) — structurally broader coverage than Mathematics ever had. **MODEL exists for only 5 of 9** (`ENGLISH_FAMILY_WORKED_EXAMPLE`): missing for `direct-retrieval`, `synonym-battery`, `tick-justify`, `emotion-cause`.

**No duplicate, dead, or contradictory teaching mechanism was found.** One historical near-miss (`wave1-fam-emotion-cause` was originally routed to the `staged-quotation` scaffold despite carrying no `quotationRequired` data, which would have shown "Angel couldn't find the exact words" regardless of the answer) was already caught and fixed in Educational Increment 007H, before any human review — re-confirmed still correct this phase (Part 6).

---

## Part 3 — The known remediation gap, re-verified and closed

**Independently re-confirmed before touching anything:** `addresses_misconception` is 100% populated for every named, Practice Eligible English question (human-reviewed content, Controlled Review Batches 1-4) but `ReadingActivity` never accepted or rendered it anywhere — only `MathsActivity` did. `wave1-fam-direct-retrieval` (14 PE, the largest named family) had **zero** wrong-answer remediation of any kind as a direct result.

**Fix implemented and deployed (Educational Increment 007O, commit `7b69638`):** `ReadingActivity` now renders `addresses_misconception`, gated identically to `MathsActivity`'s own equivalent block (`submitted && !lastCorrect`), additive to the existing structural categories, never replacing them. Framed as a general common-mistake note ("A common mistake with this kind of question:") — never a diagnosis of the specific learner's own reasoning, which Angel structurally cannot know for either an auto-scored or self-assessed short answer. For the 3 self-assessed families this only becomes reachable once the learner has judged their own answer "Not quite" (traced precisely: `lastCorrect` only resolves via `submitSelfAssessment`'s `recordAndAdvance` call).

Does not touch answer validation, mastery, session generation, or Mathematics. 6 new regression tests (source-text assertions on the real page component — no `jsdom`/React Testing Library exists in this project, so this mirrors the established pattern `tests/lib/learningEngine/writingMasterySafety.test.ts` already uses for this same file).

**Live-verified in production** (Part 12 below) across all three structurally distinct paths: an auto-verified tier (`sequencing`), the previously-zero-remediation family (`direct-retrieval`), and a self-assessed tier (`two-character`) — all three confirmed working exactly as designed, no answer leakage, no raw IDs, no engine terminology.

---

## Part 4 — The English teaching contract (not a copy of Mathematics)

**MODEL → GUIDED PRACTICE → INDEPENDENT PRACTICE → WRONG-ANSWER REMEDIATION → RETRIEVAL/TRANSFER → MASTERY EVIDENCE** — same six-stage shape as Mathematics' contract, but English's own architecture already implements each stage differently per family, correctly, because the underlying skills genuinely differ:

- **Direct retrieval / vocabulary-in-context / synonym recognition** (`direct-retrieval`, `vocab-explain`, `synonym-battery`) — a single located fact or word-in-context judgement; Guided support is a locate-and-reread instruction, not a checked scaffold, because there is nothing structurally checkable before submission (the located fact IS the answer).
- **Inference / quotation-evidence / explanation-using-evidence** (`quote-explain`) — genuinely two-part (find the exact words, then explain what they show); this is the one family with a REAL, checked Guided mechanic (`staged-quotation`) because the quotation half is independently verifiable before the explanation half is attempted.
- **Sequencing** (`sequencing`) — ordered multi-part; REAL Guided mechanic (`sequence-anchor`) gives the first item as a genuine starting anchor, matching the real CSSE mark scheme's own partial-credit, position-sensitive marking.
- **Character comparison / emotion-and-cause** (`two-character`, `emotion-cause`) — two-part contrastive or causal reasoning; self-assessed tiers (Angel cannot verify a free-text causal explanation), Guided support is instructional, remediation is a self-reflection checklist offered after the learner's own self-judgement.
- **Multi-select** (`multiselect`) — the one family with a REAL, live-checked Guided mechanic tied directly to a real CSSE cover-page marking rule (over-selection loses all marks), and the only family with dedicated, specifically-worded remediation.
- **Tick/justify** (`tick-justify`) — still evidenced (2021 paper, tick-box format), but its 11 authored rows remain blocked in `provisional`; this phase does not activate it (an activation/governance action, not a teaching-architecture one, and explicitly out of this phase's authorised scope).

**Genuinely different Guided mechanics were already correctly NOT collapsed into one generic hint system** — 3 of 9 families have a REAL, checked scaffold, each doing a structurally different thing (quotation verification, sequence anchoring, selection counting); the other 6 get an honest, family-specific written instruction, not a fabricated check the content model can't support.

---

## Part 5 — MODEL quality audit

Of the 5 families with a MODEL (`ENGLISH_FAMILY_WORKED_EXAMPLE`), every one: uses a SAFE, separate teaching scenario (never the live question's own passage or wording — confirmed by direct comparison of every worked-example scenario against the live passage titles/text); is concise and age-appropriate (Year 5/6 register, 3-5 short sentences); shows explicit reasoning (a "weaker answer" contrast and "what improves it" line, not just a restated rule); uses no internal technical language, no CSSE-authenticity overclaim, no copied examination wording. **No answer-leakage risk found** — none of the 5 worked examples share any passage, character name, or specific fact with any live question in their own family.

**4 of 9 named families have no MODEL at all: `direct-retrieval`, `synonym-battery`, `tick-justify`, `emotion-cause`.** This is a genuine, disclosed gap, not hidden — `direct-retrieval` (14 PE, no MODEL) is the most significant instance, since it is also the largest named family. Authoring new MODEL content is content-authoring work, explicitly out of this phase's bounded scope (Part 6 of the governing directive: no mass authoring) — recorded here as a finding for a future phase, not actioned.

Automated collision protection: not currently mechanised for English the way `scripts/007l-model-verification.mjs` mechanises it for Mathematics (English's worked examples use invented scenarios/names, not numeric answers that could literally collide) — manual comparison this session found no leakage; a future phase could add a scripted check (e.g. no shared proper noun between a worked example and any live question in its family) if English MODEL authoring expands.

---

## Part 6 — Guided Practice audit

| Family | Classification |
|---|---|
| `wave2-fam-multiselect` | **REAL** — live-checked selection count, warns before over-submission |
| `wave1-fam-sequencing` | **REAL** — sequence anchor, re-tested live this phase (Part 12), confirmed working |
| `wave1-fam-quote-explain` | **REAL** — live quotation-presence check |
| `wave1-fam-direct-retrieval`, `synonym-battery`, `vocab-explain`, `tick-justify`, `two-character`, `emotion-cause` | **INSTRUCTIONAL ONLY** — a written, family-specific tip, honestly not called "checked" |

**No family is MISSING or UNSAFE.** The one historically near-unsafe case (`emotion-cause`'s original misrouting to `staged-quotation`, which would have falsely reported "couldn't find the exact words" regardless of the answer) was corrected in Educational Increment 007H — re-verified this phase, both by re-reading the current routing table (`emotion-cause` now correctly maps to `locate-instruction`) and by the standing `guidedPractice.test.ts` suite (still passing, 9/9).

**Re-tested this phase, live in production:** the 007G sequencing-anchor correction (confirmed working via a live walkthrough, Part 12) and the 007H `emotion-cause` correction (confirmed via code re-read and standing test suite). Multi-select's live selection-count warning and quotation/evidence staged-check were not independently re-walked live this session (time-bounded, per this project's "avoid rabbit holes" discipline) but rest on their own standing, passing regression suites (`englishAnswerValidation.test.ts`, `englishErrorClassification.test.ts`, both 25+/25+ passing, unregressed by this phase's changes) — disclosed as resting on regression-test evidence, not fresh live observation, for those two specifically.

---

## Part 7 — Wrong-answer remediation (built this phase)

See Part 3. `addresses_misconception` now renders for every submitted-and-incorrect attempt, in addition to (never replacing) each family's existing structural classification. Tested both correct and incorrect submissions live (Part 12) — the block genuinely never appears on a correct answer or before submission, in any of the three structurally distinct scoring paths.

---

## Part 8 — Passage and transfer audit

**Recomputed live, not carried forward:** 106 Practice Eligible + 11 provisional English rows draw on exactly **19 distinct passages**. Per-family sibling/passage counts:

| Family | Siblings | Distinct passages |
|---|---|---|
| `wave1-fam-vocab-explain` | 17 | 15 |
| `wave1-fam-sequencing` | 15 | 13 |
| `wave1-fam-direct-retrieval` | 14 | 14 |
| `wave1-fam-quote-explain` | 13 | 12 |
| `wave1-fam-synonym-battery` | 11 | 11 |
| `wave1-fam-emotion-cause` | 11 | 11 |
| `wave1-fam-tick-justify` (blocked) | 11 | 11 |
| `wave2-fam-multiselect` | 6 | 6 |
| `wave1-fam-two-character` | 6 | 5 |

**Critical, previously-unquantified finding: 15 of the 19 passages are shared across multiple families, typically 6-7 different families per passage** (e.g. `wave1-eng-kitemaker` is drawn on by 7 of the 9 named families). A learner who reads a passage for a `direct-retrieval` question has a real chance of meeting that exact same passage again shortly afterward testing `sequencing`, `vocab-explain`, or another skill entirely. This is a genuine, evidenced anti-memorisation risk, distinct from and more precise than the baseline report's earlier general "narrow passage source" framing — quantified here for the first time.

**Classification (SUFFICIENT / LIMITED / UNSAFE), per family:**

- **Sibling/question diversity:** `vocab-explain`, `sequencing`, `direct-retrieval`, `quote-explain` — reasonable (11-17 siblings). `synonym-battery`, `emotion-cause` — moderate (11). `multiselect`, `two-character` — **LIMITED**, thin (only 6 siblings each; already disclosed in the CSSE Completion Programme's own coverage matrix).
- **Passage-level cross-family exposure:** **LIMITED for all 9 named families uniformly** — no family is exempt from the 15-of-19-shared-passages finding above.

No family is classified UNSAFE outright (every family still has genuine per-question variation in wording/specific facts asked, even when the underlying passage repeats), but the passage-sharing finding is real and should inform any future passage-supply expansion (a Phase E/content-expansion concern, not fixed here per this phase's explicit boundary against mass-authoring passages).

---

## Part 9 — Difficulty audit

Recomputed live: every named family's `content_difficulty` values are drawn only from `{medium, hard}` — **`easy` does not appear anywhere in the named English estate**, and no family has 3+ genuine tiers. `wave1-fam-two-character` is 100% `medium` (zero variation). No `content_difficulty` value was changed. This mirrors the Mathematics finding exactly (Decision 62's own Phase B document): raw values exist, but no designed EASY/STANDARD/HARD/STRETCH progression ladder exists anywhere in the English estate either. Building that ladder is explicitly Phase E's work, not this phase's.

---

## Part 10 — Exam-technique maturity

All 9 named families have a plain-language exam-strategy hint (`getExamStrategyHint`), covering: reading the actual instruction, locating evidence efficiently, distinguishing inference from invention (`quote-explain`'s "what does this show" framing), managing multi-part answers (`two-character`'s "two mini-answers" framing), checking selection counts (`multiselect`), using quotations precisely (`quote-explain`, `synonym-battery`), and returning to the passage rather than guessing (`direct-retrieval`, `vocab-explain`).

**Directly-evidenced vs. Angel-authored-strategy is explicitly distinguished for only 1 of 9 families** (`wave2-fam-multiselect`, via `FAMILY_MARKING_BASIS`, citing the real 2023 CSSE cover-page instruction). The other 8 families' exam-strategy hints are sound, defensible teaching advice but do not carry an equivalent explicit evidence citation anywhere in the codebase distinguishing "this is a documented CSSE marking rule" from "this is Angel's own pedagogical judgement." Not a defect (no strategy hint makes a false CSSE claim), but a genuine gap in evidentiary labelling, disclosed here rather than silently left implicit.

---

## Part 11 — Anti-memorisation assurance

Two genuinely real, distinct mechanisms exist, traced directly in code:

1. **Cross-session, question-level cooldown** (`lib/ali/selection.ts`, `COOLDOWN_QUESTIONS` by `content_difficulty`, tracking `lastPresentedAtSequence`) — a real, difficulty-scaled threshold before any individual question can resurface, subject-agnostic, unmodified by this phase.
2. **Within-session family/passage grouping diversity** (`lib/ali/exposureIntelligence.ts`'s `groupingKeyOf`) — but critically, `groupingKeyOf(q) = q.familyId ?? q.learningUnitId`: it falls back to the passage id **only when `familyId` is absent**. Every named English family has a real `familyId`, so the grouping key actually used for every named family is the family, never the passage — meaning **no passage-level exposure tracking exists for any named family, in either the within-session diversity mechanism or the cross-session cooldown** (cooldown is keyed by question id, not by passage).

**Combined with Part 8's finding (15 of 19 passages shared across ~6-7 families each), this is a real, structurally-confirmed anti-memorisation gap:** a learner could see a different question, from a different family, on a passage they already read very recently, with neither existing mechanism preventing or even detecting it. This is not solved by the existing question-level cooldown or family-level diversity, and is reported here as genuinely unaddressed evidence, not glossed over — fixing it would mean changing `groupingKeyOf`'s own fallback logic or adding a second, passage-level exposure dimension, which touches shared, subject-agnostic selection code (`lib/ali/exposureIntelligence.ts`, `sessionGenerator.ts`) used by Mathematics and every other pathway too. That is out of this phase's explicit boundary ("do not alter Mathematics teaching architecture"; a controlled, bounded increment) and is recorded here as a finding for Founder/Product leadership to prioritise, not fixed unilaterally.

**Repeat-resilience across multiple sessions specifically** (not just within one 8-question session) rests on the question-level cooldown holding as designed — no defect found in it this phase, but no fresh multi-session live observation was performed either (would require a multi-day live account walkthrough, out of this session's bounded scope); the honest state is "structurally sound at the question level, unaddressed at the passage level," not "solved."

---

## Part 12 — Live learner experience verification (production, not unit tests only)

Walked the real `/learning-intelligence/practice/reading-comprehension` pathway on live production (`https://angel-11plus.vercel.app`, post-deployment of commit `7b69638`), a real session, 3 questions directly observed:

1. **`wave1-fam-sequencing`** (auto-verified tier) — submitted a deliberately wrong answer. Correctly showed "The right things are there, but not in the right order," then the new remediation block ("A common mistake with this kind of question: Placing the power cut, which happens much later, among the early preparation steps"), then the model answer, in that order. No leakage before submission.
2. **`wave1-fam-direct-retrieval`** (the family with previously zero remediation) — submitted a deliberately wrong answer. New remediation block rendered correctly for the first time ever for this family: "Confusing this early detail with the near-collision with the dog walker, which happens later." Confirms the highest-priority gap is genuinely closed, live.
3. **`wave1-fam-two-character`** (self-assessed tier) — submitted a weak answer, then explicitly clicked "Not quite." The remediation block only appeared after that click, never before, confirming the self-assessed-tier gating traced in code actually holds live, not just in theory.

Across all three: child-readable language throughout; no raw family IDs, `family_id`, `validationTier`, or other internal terminology visible anywhere; no contradictory instructions; no misleading scoring (each result was clearly framed as "not quite," never a false "correct"); no answer leakage (the remediation text never appeared pre-submission, and never revealed the exact correct wording, only a description of the error pattern); reasonably concise text; sensible progression via the "Next" control. **No broad visual/product-experience redesign was performed or needed to confirm this** — any separate visual/product findings belong to the dedicated Product Experience workstream, not recorded here since none were found that rise to that level.

---

## Part 13 — Human review gate

**Technical completion is not educational approval — the same precedent Phase B established (Decisions 62-63) applies here.** Educational Increment 007P built a dedicated **"English Teaching Review"** section inside the existing authenticated `/admin-beta/review` architecture (no parallel system), covering the 8 learner-reachable named families materially affected by 007O's change (`wave1-fam-tick-justify` excluded: 0 Practice Eligible, not learner-reachable, per this phase's own Part 2 instruction). Reuses the existing 18-criterion `REVIEW_CRITERIA`/`ReviewSubmission` shape unchanged — migration 047's own docstring already states these were designed broad enough for English's needs — via a new, additive `review_type = 'english_teaching_review'` (migration 060), structurally distinct from `content_review` so an earlier Batch 1/2 approval (which predates 007O's change for several of these 8 families) can never be read as covering it.

Each family's review pack shows: educational name; skill/competency and Question Type; evidence basis (`FAMILY_EDUCATIONAL_CONTEXT`); MODEL (or its honest absence); Guided mechanism, correctly classified REAL vs. INSTRUCTIONAL ONLY; Independent-practice expectation; wrong-answer remediation, including — new this phase — the real `addresses_misconception` text shown exactly as a learner now sees it, not a description; exam strategy; transfer/passage-diversity note (Part 8's findings, per family); and any known gap, disclosed. No decision is preselected. Append-only, exactly like every prior review batch.

**Migration 060 has NOT yet been applied to production** (confirmed no error on an anon-key `select`, but per this project's own established discipline this is inconclusive either way for a write-path constraint — the honest state is "not yet confirmed applied," matching every prior migration's own standing pattern of requiring Founder application via Supabase Dashboard SQL Editor before this section will accept a submission). **This phase does not pretend the review system is operational until that is done.**

---

## Part 14 — Governance

Recorded as Decision 64 in `ALI_DECISION_LOG.md`. Preserves, unmodified: Decision 48's RLS evidence discipline (re-applied and re-confirmed this phase for `ali_family_review`); Decision 55's answer-validation safety (bank-wide Mathematics regression re-run clean, unaffected — this phase touches no Mathematics code); Decisions 57/62/63's Mathematics teaching governance (untouched); the Mock Content Firewall (Decision 59, untouched, `mock_eligible` still 0); the Writing mastery quarantine (Decision 60, untouched); the current Applied Reasoning classification (Decision 58, untouched, not referenced by this phase's scope). No historical evidence was rewritten.

---

## Part 15 — Verification

Full automated suite: **344/344** (329 at Phase B's close, +6 new for Educational Increment 007O, +9 new for Educational Increment 007P's review interface). English-specific suites (`englishAnswerValidation.test.ts`, `englishErrorClassification.test.ts`, `guidedPractice.test.ts`, `guidedSequencingCorrection.test.ts`) all unregressed. Bank-wide Mathematics answer-validation regression: 168/168, unaffected (this phase touches no Mathematics code, re-run anyway per this project's own standing discipline). Mastery/support regression: unaffected (`lib/ali/mastery.ts` untouched). TypeScript clean. Copy Quality Guard: 0 violations after correcting 9 em-dash instances caught on first run (the same "the guard catches what manual review misses" pattern every prior increment has demonstrated). Production build succeeds. Production counts re-queried after both commits: **TOTAL 264, PE 247, Maths PE 141, English PE 106, Provisional 17, Mock Eligible 0** — unchanged throughout.
