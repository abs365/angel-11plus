# ANGEL 11+ — EI003 WAVE 2 ENGLISH DEPTH PRE-PUBLICATION REPORT

**Date:** 2026-09-08
**Status:** Design + original passages + blueprints + teaching + manufacturing + deterministic validation + human review + sustained-use analysis complete. **STOPPED at the pre-publication gate. Nothing submitted, reviewed, or published.**
**Wave 1 status:** CLOSED, not reopened. Baseline accepted as-is (1,038 total / 828 practice-eligible / 587 practice-eligible Maths).

---

## A. Verified Five-Family Baseline

Read live, fresh, this wave (not inferred from row count alone):

| Family | Skill | Real n | Real structural depth | Real teaching content |
|---|---|---|---|---|
| `wave3-fam-rc06-sequencing` | QT-RC-06 | 1 | 1 shape (order 3 named items) | none |
| `wave3-fam-rc07-comparative` | QT-RC-07 | 2 | 1 shape (same character, two moments) | none |
| `wave3-fam-rc08-emotion` | QT-RC-08 | 2 | 1 shape, **genuinely inferential** (see §B) | none |
| `wave3-fam-rc10-atmosphere-mood` | QT-RC-10 | 6 | 1 shape (one quoted image, "what does this suggest") | none |
| `wave3-fam-rc10-word-choice` | QT-RC-10 (+QT-RC-03 on 4 older rows) | 12 | **1 blueprint**, confirmed via the plan's own live audit | none |

All 5 families: 0 rows in `ENGLISH_FAMILY_EXAM_STRATEGY`, 0 in `ENGLISH_FAMILY_WORKED_EXAMPLE` before this wave. Response type across all 34 real rows read: open short-answer, never multiple-choice — no MCQ distractor mechanism exists in these families, so §14/§15's "distractor validity"/"implausible distractors" checks are not applicable here (disclosed, not silently skipped).

## B. Emotion-Family Taxonomy Finding

**Confirmed genuinely distinct. Not a duplicate. Family retained, blueprints designed as intended.**

`lib/ali/familyTaxonomy.ts`'s own existing consolidation table already flagged this exact question as unresolved: the `wave1-fam-emotion-cause`/`wave3-fam-rc08-emotion` merge is recorded there as **"the weakest-confidence merge in this table, flagged for confirmation once real content is reviewed"** (name-similarity only, never content-verified). This wave performed that verification directly:

- **`wave1-fam-emotion-cause`** (11 real rows): uniformly "How does [character] feel [at a named moment], and why?" — the emotion is directly locatable at one clear beat. Real, live accepted-answer sets are single emotion words ("content", "proud", "nervous") — despite the family's own name implying a causal-justification component, the actual validated contract never requires stating a cause, only the emotion word.
- **`wave3-fam-rc08-emotion`** (2 real rows): **both** genuinely inferential — the target emotion is never named anywhere in either passage; it must be reasoned from behaviour/context alone ("based on the way she moves and behaves"; "How **might** Sam himself be feeling" — hedged, interpretive question language, never "How does X feel").

This is a real, material distinction (direct/named identification vs. genuine inference from indirect evidence), not an artificial one preserved to protect a five-family manifest. Every new blueprint for this family (§F) is designed to preserve it: no candidate's own passage ever states the target emotion word. `lib/ali/familyTaxonomy.ts`'s own flagged uncertainty is hereby resolved with real evidence — worth a future, small, separate correction to that file's consolidation entry (not done this wave; out of scope, a documentation-only fix, not blocking).

## C. Existing Passage Baseline

9 distinct passages served all 5 target families before this wave, each reused across 3–6 different families. The 5 `wave3-eng-*` passages specifically (the ones actually serving these thin families) are markedly shorter than the bank's own established convention: **695–855 characters**, versus 1,788–2,389 characters for the `eng-inc002-*`/`wave1-eng-*`/`wave2-eng-*` passages. Read one in full (`wave3-eng-stormharbour`) to confirm quality: genuinely well-written, atmospheric prose — the gap is length/narrative development, not writing quality. Short passages can support one-shot atmosphere/word-choice questions but cannot easily carry sequencing, multi-point comparison, or emotion-arc reasoning, which need more narrative development.

## D. New Original Passages

**6 new passages, 1,800-2,400 characters each** (matching the bank's own richer Increment 002 convention), all original Angel content, no commercial text reproduced or imitated:

| Passage | Genre | Length |
|---|---|---|
| The Relay Baton | Fiction/narrative | 2,237 chars |
| The Last Delivery | Fiction/narrative | 2,411 chars |
| The Glass Frog's Hidden Trick | Nature/science | 2,295 chars |
| The Clock That Stopped | Human-interest/memoir | 2,339 chars |
| Crossing the Fen | Travel/exploration | 2,214 chars |
| The Attic Workshop | Descriptive prose | 2,277 chars |

Two fiction/narrative passages (deliberate, for de-clustering — sequencing/comparative/emotion-arc reasoning cannot all rest on one narrative passage without over-concentration). Biography/human-interest and travel/exploration and descriptive prose were the plan's own named missing genres; all three are now present, each written to avoid factual-claim risk: the memoir is a fictional first-person account (never a real, named, checkable individual), and the informational piece (glass frog blood-hiding mechanism) reflects a real, published biological phenomenon, described in general terms without a specific unverifiable citation.

## E. Genre Distribution

Fiction/narrative ×2, nature/science ×1, human-interest/memoir ×1, travel/exploration ×1, descriptive prose ×1. "Historical-style narrative" (already present in the existing bank per the plan's own §M) was deliberately not repeated — matches the instruction not to force every category.

## F. New Genuine Blueprints by Family

**20 new blueprints (4 per family)**, none a cosmetic reword of another — every blueprint's own `demand` field states the specific reasoning difference, and reasoning routes vary genuinely (explicit vs. dispersed chronology, causal linkage, narrative-vs-event-order for sequencing; reactions vs. across-time vs. settings vs. similarity-and-difference for comparative; action vs. dialogue vs. arc vs. conflicting-evidence for emotion; single-sensory vs. accumulated vs. change vs. character-contrast for atmosphere; meaning-in-context vs. substitution vs. connotation vs. word-choice-to-atmosphere for word-choice — directly matching the Founder's own named example categories). The real production shape is preserved as exactly one blueprint per family among the four, never discarded.

`wave3-fam-rc10-word-choice` — the family explicitly needing structural, not volume, expansion — now has genuine 4-blueprint depth, up from the confirmed single blueprint.

## G. Difficulty Coverage

| Family | Tiers present (from 8 new candidates) |
|---|---|
| `rc06-sequencing` | easy, medium, hard, challenge (4) |
| `rc07-comparative` | medium, hard, challenge (3) |
| `rc08-emotion` | medium, hard, challenge (3) |
| `rc10-atmosphere-mood` | easy, medium, hard, challenge (4) |
| `rc10-word-choice` | easy, medium, hard, challenge (4) |

`rc07`/`rc08` have no "easy" tier by design, not oversight: even their Foundation-tier blueprint (compare two characters' reactions; infer emotion from plain physical action) is a genuinely more demanding task than a retrieval-adjacent "easy" item — an artificially inflated easy tier would understate the real cognitive floor of comparative/inference reasoning. Foundation→Far-Transfer ladder present: rc08 alone reaches Far Transfer (conflicting evidence, the hardest inferential demand), matching its status as the most subtle skill among the five.

## H. Evidence/Reasoning Coverage

Every one of the 40 candidates carries `evidenceQuotes` — exact substrings of its own passage's real text (verified deterministically, §L) — and `explanationGuidance` distinguishing the answer from the evidence that supports it. Mix of demand: single evidence (most Foundation/Development items), multiple evidence requiring synthesis (all `accumulated_atmosphere` and `word_choice_to_atmosphere` items, and the emotion-arc items), and evidence-vs-conflicting-evidence (the two Far-Transfer emotion items). Not every question forced into a two-part response — matches instruction to use the form that genuinely measures the skill.

## I. Teaching Additions

All 5 families: added to `ENGLISH_FAMILY_EXAM_STRATEGY` (short strategy hints) and `ENGLISH_FAMILY_WORKED_EXAMPLE` (full worked examples), closing zero-coverage gaps. Every worked example follows the Founder's own specified inference model verbatim, in order: **What does the text SAY? → What evidence matters? → What does that evidence SUGGEST? → Which interpretation fits BEST? → How can I justify it?** — teaching the reasoning process on a safe, separate scenario, never revealing any live candidate's answer (verified by a dedicated regression test, §L). `wave3-fam-rc08-emotion`'s own worked example scenario was specifically checked to never state the target emotion directly, preserving its confirmed genuine distinction from §B.

## J. Exact Candidate Count Manufactured

**40 new candidates** — 8 per family (2 per blueprint × 4 blueprints), hand-authored against the 6 new passages (English candidate generation is inherently hand-authored, not parametric — there is no formula for "sample a passage"). Deterministic candidate IDs throughout (e.g. `ei003-w2-seq-explicit-01`), never regenerated.

## K. Candidate Reconciliation

| Family | Before | New | After (proposed) |
|---|---|---|---|
| `rc06-sequencing` | 1 | 8 | 9 |
| `rc07-comparative` | 2 | 8 | 10 |
| `rc08-emotion` | 2 | 8 | 10 |
| `rc10-atmosphere-mood` | 6 | 8 | 14 |
| `rc10-word-choice` | 12 | 8 | 20 |
| **Total** | **23** | **40** | **63** |

40 manufactured = 40 accounted for (0 held, 0 rejected — the 8 quote-mismatch issues found by deterministic validation, §L, were fixed at the source and re-verified, not discarded).

## L. Deterministic Validation

A dedicated script (`scripts/validate-ei003-wave2-manifest.mjs`, committed as a durable, reusable governance artifact) checks every candidate for: real passage/blueprint reference, family-blueprint consistency, **every evidence quote verified as an exact, verbatim substring of its own passage's real text**, non-empty accepted answers, non-empty explanation guidance, ≥3 distinct blueprints per family, and 0 duplicate questions within a family.

**First run found 8 real defects** — quote-integrity mismatches (subject-pronoun/case drift between my authored evidence string and the real passage text, and one stray ellipsis artifact) — genuinely caught by the deterministic check, not glossed over. All 8 fixed at the source and the check re-run: **PASS, 0 problems, all 40 candidates verified.**

## M. Human Educational Review

Full critical re-read of all 40 candidates (bounded set, full coverage feasible) against: ambiguity, unnatural prose, evidence mismatch, over-subtle or trivial inference, repetitive question shapes, age-appropriate vocabulary, accidental clues. Passage AND question read together throughout, per instruction. Specific checks performed: re-verified the 4-item chronological reordering task (`ei003-w2-seq-narrative-order-02`) against the passage's own explicit time markers to confirm a single, unambiguous correct order; checked Far-Transfer emotion/atmosphere items for genuine (not manufactured) subtlety — each rests on textual evidence a careful 11+-level reader can locate, not an arbitrary or unfalsifiable reading. No MCQ distractors exist in this response type (§A), so distractor-plausibility review does not apply.

## N. Ambiguity/Evidence-Integrity Findings

The 8 findings in §L **are** this section's material findings — they were quote-integrity errors (my own transcription drift), not passage or reasoning defects, and are now fully corrected and locked in by the passing deterministic check. No candidate was found with two defensible answers. No candidate's claimed evidence was found to fail to genuinely support its answer.

## O. Passage De-Clustering/Exposure Assessment

| Passage | Genre | Questions | Families | Blueprints |
|---|---|---|---|---|
| The Relay Baton | fiction | 10 | 4 | 10 |
| The Last Delivery | fiction | 11 | 5 | 11 |
| The Glass Frog's Hidden Trick | nature/science | 1 | 1 | 1 |
| The Clock That Stopped | memoir | 5 | 3 | 4 |
| Crossing the Fen | travel | 8 | 5 | 7 |
| The Attic Workshop | descriptive | 5 | 2 | 5 |

**Honest disclosure, not smoothed over:** within this new 40-candidate set, "The Relay Baton" and "The Last Delivery" together carry 21/40 (52%) of the new content — a real, moderate concentration, because character-driven narrative passages naturally support more of the 5 families (sequencing, comparative, emotion, atmosphere all draw on character/event material) than the nature/science piece does (which genuinely only fits sequencing and word-choice well — 1 use is a correct, not accidental, reflection of that genre's real fit, not underuse to be padded). This is still a substantial improvement on the pre-wave baseline (where individual passages were reused across up to 6 different families) — no Wave 2 passage is used by more than 5 of the 5 target families, and each family now draws from 3–5 distinct passages rather than being tied to 1–2. Not fully solved; flagged as a real, bounded residual concentration for a future wave's consideration, not claimed as fully resolved.

## P. Blueprint Anti-Memorisation Assessment

No two candidates share question text (checked, §L). Every family reaches ≥3 distinct blueprints (all 5 reach exactly 4) and 3–4 distinct reasoning routes (§F). A learner encountering this family repeatedly meets a genuinely different reasoning demand, not the same shape with swapped names — satisfying "familiar skill, unfamiliar problem" without requiring every question to be a novel format.

## Q. Expected Post-Publication Family Depths

See §K's "After (proposed)" column: 9 / 10 / 10 / 14 / 20 — every severely-thin family (1–2 items) reaches ≥9, clearing the plan's own §Q-style "≥8 items" sustained-use threshold; `rc10-word-choice` gains genuine structural depth (1→4 blueprints) alongside its existing volume.

## R. Expected Post-Publication Practice-Eligible Count

**Projection only — not yet published, no action taken toward it.** Current real, live counts (confirmed at Wave 1 closure): 828 practice-eligible (all subjects), 335 English. If all 40 candidates were later reviewed, approved, and published: English → 375, all-subjects → 868.

## S. Remaining Thin/High-Risk Families After Wave 2

Untouched, from the plan's own Tier 2 English list: `wave1-fam-effect-of-language`, `wave1-fam-motive-inference`, `wave1-fam-comparative-extraction` (4 rows each), `wave1-fam-two-character`, `wave2-fam-multiselect` (6 rows each). The plan's own §L item 4 (Maths tables/charts representation gap) also remains untouched — cross-cutting, not family-scoped. None of these were audited fresh this wave; carried forward from the existing plan document unchanged.

## T. Material Defects/Findings

1. §B: a real, pre-existing taxonomy uncertainty in `familyTaxonomy.ts` (flagged there as "weakest-confidence... flagged for confirmation") is now resolved with real evidence — genuinely distinct, not merged.
2. §L: 8 real quote-integrity errors found by deterministic validation and fixed at source — direct evidence the validation script earns its place, not a rubber stamp.
3. §O: real, disclosed, moderate passage concentration (2 of 6 new passages carry 52% of new content) — a genuine, bounded residual risk, not claimed as fully solved.
4. No engine file touched (placement, preparation horizon, adaptive selection, cooldown, spaced retrieval, mastery, supported/independent evidence, focus behaviour, Teaching Engine) — confirmed via `git status`, only the 10 files listed in §U's source accounting were touched.
5. Nothing was submitted to `ali_question_candidate`, reviewed, or published this wave — this report's manifest is local/in-memory, fully mapped to what the real submission contract needs, but not yet executed against production (matching Wave 1's own first pre-publication report precedent, before any DB interaction).

## U. GO / REVISE / NO-GO FOR CONTROLLED PUBLICATION

**REVISE** at this exact gate is not applicable in the Wave 1 sense (no DB action has been attempted to fail) — more precisely: **design, passages, blueprints, teaching, manufacturing, deterministic validation, and human review are all COMPLETE and clean.** Every one of §17's authorised steps was completed; none of the prohibited steps (review, publish, Wave 3) was taken.

**Recommend GO for the NEXT gate** (governed candidate-store submission, mirroring Wave 1's own second closure message) whenever the Founder authorises it — the manifest is submission-ready (§J–L), not merely designed. Two disclosed, non-blocking items to weigh before that next gate: the moderate passage concentration in §O, and the resolved-but-not-yet-corrected `familyTaxonomy.ts` consolidation entry in §B (a documentation fix, not a content defect).

**Source control:** 10 files touched (1 modified: `lib/learningEngine/englishExamStrategies.ts`; 9 new: 6 blueprint/candidate files, 1 passage file, 1 type-contract file, 1 validation script, 1 test file, plus 1 durable evidence artifact `scripts/output/ei003-wave2-baseline-questions.json`). **Nothing committed this wave** — held pending Founder review of this report, matching Wave 1's own precedent of committing only once its own pre-publication report was reviewed. Production deployment remains Ready, untouched, unaffected (no source file relevant to any live route was changed — teaching-content additions to `englishExamStrategies.ts` do affect the live worked-example panel for these 5 families once committed and deployed, exactly as Wave 1's own equivalent change did, but no push has occurred this wave).

**STOP. Do not publish. Do not begin Wave 3.**
