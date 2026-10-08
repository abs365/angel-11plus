# ANGEL 11+ — EI003 WAVE 1 CONTROLLED PUBLICATION CLOSURE

**Date:** 2026-09-08
**Commit:** `5ba9785` (unchanged; no new commit required — no source defect found)
**Status:** **WAVE 1: CLOSED.**

---

## A. Reviewed

72/72 approved via `review_question_candidate()`, real RPC calls (not direct writes), 0 rejected, 0 failures. Read-back confirmed `review_status='approved'` on all 72, with a real `reviewer_id`/`review_timestamp` on every row (derived server-side from `auth.uid()`, never caller-supplied).

## B. Published

72/72 published via `publish_question_candidate()`, 6 bounded batches of 12, 0 failures at every batch boundary (accounting held: published + approved-not-yet-published + failed = 72 throughout). One disclosed, non-blocking cosmetic finding: published question IDs read `qf-qf-ei003-...` (double prefix) — the manufacturing convention already used `qf-` as this wave's own candidate-ID prefix, and `publish_question_candidate()`'s own SQL independently prepends its own `'qf-' ||`. Every ID remains unique, valid, and collision-free; no functional, marking, or provenance defect results. Not corrected mid-publication (would have meant inventing a new ID scheme for some but not all of the 72, or halting an otherwise-clean run for a cosmetic issue) — flagged here for awareness, not hidden.

## C. Production Reconciliation

72 authorised candidates = 72 published rows, verified directly: every one of the 72 `ali_question_candidate` rows now has `publication_status='published'` and a real `published_question_id`; every one of those 72 IDs is found in `ali_question_bank`. 3/3 families present (24/24/24). 18/18 blueprint IDs present in the published `prompt.blueprintId`, exactly 4 per blueprint.

## D. Final Production Inventory

Queried fresh (never old-count + 72 arithmetic):

| Metric | Count |
|---|---|
| Total `ali_question_bank` rows | 1,038 |
| — Maths | 686 |
| — English | 335 |
| — Writing | 17 |
| Practice-eligible (all subjects) | 828 |
| Practice-eligible Maths | 587 |
| Mock-reserved (`authentic_assessment_candidate`) | 58 |
| `independently_validated` | 8 |
| `provisional` | 17 |
| These 3 families, practice-eligible | 84 |

Increase attributable to EI003: Practice-eligible Maths 515→587 (**+72**), these 3 families 12→84 (**+72**), all-subjects 756→828 (**+72**) — matches exactly, no unexplained drift.

## E. Blueprint Reconciliation

18/18 blueprint IDs present in the published rows, 4 published questions per blueprint, confirmed directly from `ali_question_bank.prompt.blueprintId` (not re-derived from the candidate table) — blueprint ancestry survived the complete real path: manufacture → submit → review → publish.

## F. Mock Isolation

0 Mock leakage. Every published row: `eligibility_status='practice_eligible'`, `active=true`. 0 occurrences of `mock_eligible` anywhere in the 72 published rows.

## G. Real Learner Questions Tested

**18 of 72** published questions sampled — one per blueprint (18/18 blueprints covered), spanning all 3 families, all 4 difficulty tiers (easy/medium/hard/challenge), and both representation types (`prose`, `24hr_clock_with_midnight_wraparound`). Fetched via a **genuine anon-key (non-admin) read** — confirming RLS correctly exposes these newly-published rows to a real learner session, not merely to the admin account. Exact IDs tested (blueprint-representative sample; family prefix indicates coverage):
`qf-qf-ei003-mr01-bp-reverse-mean-{combined-groups,direct,compare-two-groups,error-identification,scaffolded,new-value-changes-mean}-01/03`, `qf-qf-ei003-mr04-bp-reverse-{multi-step-mixed-operations,error-identification,compare-two-scenarios,scaffolded-single-change,find-rate,direct-unscaffolded}-01`, `qf-qf-ei003-mr04-bp-time-reverse-{cross-midnight,error-identification,compare-two-schedules,find-missing-stage,scaffolded-single-stage,multistage-direct}-01/03`.

Marking used the **real, unmodified, live** `checkMathsAnswer()` (`lib/learningEngine/practiceContent.ts`) against the **real, freshly-fetched, post-publication** `prompt.answer` — the exact contract the real Practice page uses (`isCorrect = checkMathsAnswer(answer, String(q.answer))`).

## H. Correct-Answer Result

**18/18 correct.** Every sampled question's own real answer, submitted as-is, was marked `true`.

## I. Incorrect-Answer Result

**18/18 correct.** A deliberately wrong answer (a clearly-wrong money/number value, the opposite A/B letter, or a nonsense string, chosen per answer format) was marked `false` for every sampled question — 0 false positives.

## J. Explanation Integrity

18/18 sampled rows carry a non-empty `explanation` (the real worked steps, merged from `worked_explanation` at publish time). No undefined answers, no contradictory feedback, no publication-contract loss found in the sample.

## K. Structural-Diversity Result

Inspected actual published question **text** (not blueprint labels) across all 18 sampled blueprints. Genuine differences confirmed, quoted directly from production:
- **Unknown position varies**: the original value (`"...What was the original price before any discount?"`), the rate itself (`"What percentage increase does this represent?"`), a missing stage duration (`"...How many minutes long was the further session?"`), an added value (`"What is the value of the number that was added?"`), a group mean (`"What is the mean of Group B?"`), a comparative outcome (`"...Which group's missing score is higher -- A or B?"`).
- **Reasoning shape varies**: single-step reversal vs. genuinely two-stage (percentage discount *and* a separate flat deduction, undone in a specific order) vs. representation-shift (crossing back over midnight) vs. critique-and-correct (a shown wrong method the learner must reject, not merely compute).
- No supposedly-different blueprint was found to be cosmetic-only (same skeleton, changed numbers) — each sampled question's own wording, structure, and cognitive demand differs genuinely from its family's other blueprints.

## L. Anti-Memorisation Result

Confirmed at the family level (not merely per-blueprint): each family now presents 6 genuinely different problem shapes rather than one shape repeated with new numbers — satisfying "familiar exam, familiar skills, unfamiliar problems" without requiring every question to be a novel format. (Full deterministic anti-memorisation evidence — 0 exact duplicates, 0 parameter-signature duplicates, LOW blueprint-aware memorisation risk — was already established in the prior gate and is not re-derived here, per instruction.)

## M. Deployment Status

Commit `5ba9785` unchanged. Production deployment (`dpl_D9JSyATK6YsbSDjubaGB3HFh1bc6`) confirmed **Ready**, unchanged since the prior gate. No source defect was found during this closure, so — per explicit instruction — **no additional commit was made** for the database publication itself.

## N. Material Defects, if Any

**None that block closure.** One disclosed, non-blocking cosmetic finding (§B: double `qf-qf-` prefix on published IDs) — functionally inert, does not affect marking, provenance, family/blueprint attribution, or collision-safety. No engine file was touched (placement precedence, preparation horizon, adaptive selection, cooldown, spaced retrieval, mastery, supported/independent evidence, focus behaviour, Teaching Engine — all confirmed untouched this closure).

## O. FINAL WAVE 1 STATUS

**ANGEL EI003 WAVE 1: CLOSED.**

72/72 reviewed · 72/72 published · 72/72 production-reconciled · 18/18 blueprints preserved · 24/24/24 family distribution · 0 Mock leakage · correct-answer smoke tests pass (18/18) · incorrect-answer smoke tests pass (18/18) · explanations coherent · learner-visible structural diversity genuine · no material educational defect.

---

# WAVE 2 FOUNDER DECISION

Per the existing `ANGEL_EDUCATIONAL_INCREMENT_003_SUSTAINED_LEARNING_PLAN.md`, §L's own Tier 1 ranking, priority #2 (`wave1-fam-direct-retrieval` teaching content) is **also already closed** by Wave 1 (the 5-step worked example shipped in the same commit) — disclosed here rather than silently treated as still-open. That leaves §L Tier 1 priority #3 — the English inference/interpretation family group — as the next real priority. Reporting the 5 most severe families within that named group, using the real per-family counts from the plan's own audit (§B of that document), no new querying performed:

| # | Family | Subject | Current depth | Structural depth | Why it matters | Risk |
|---|---|---|---|---|---|---|
| 1 | `wave3-fam-rc06-sequencing` | English | **1 item** | thin (no real pool at all) | Sequencing/ordering-of-evidence is a named 11+ comprehension skill; at 1 item this family cannot function as a real practice pool under any selection weighting | **Most severe** — effectively unusable |
| 2 | `wave3-fam-rc07-comparative` | English | 2 items | thin | Comparative-attribute extraction (11+ papers weight cross-text/cross-character comparison heavily); 2 items guarantees near-immediate exact repetition for any learner who needs it | Extreme |
| 3 | `wave3-fam-rc08-emotion` | English | 2 items | thin | Emotion/motive inference — a core interpretation (not retrieval) skill; distinct and much thinner than the older, larger `wave1-fam-emotion-cause` (11 items) | Extreme |
| 4 | `wave3-fam-rc10-atmosphere-mood` | English | 6 items | thin | Atmosphere/mood is a genuinely different inference demand from plot/character comparison; 11+-relevant, currently one of the thinnest interpretation families | High |
| 5 | `wave3-fam-rc10-word-choice` | English | 12 items | **1 distinct blueprint** | Effect-of-language/word-choice is heavily examined; row count looks adequate but **zero structural diversity** means every one of the 12 is the same underlying template — the exact "changed numbers, same skeleton" risk this whole programme exists to close | High (different failure mode: volume without depth) |

Recommended priority order: **1 → 2/3 (tied, both extreme) → 4 → 5** — the near-zero-count families come first (no usable pool at all beats a large-but-shallow one), then the volume-without-diversity case (`rc10-word-choice`) last, since it is at least minimally usable today while the others are not.

Per §L item 4, a cross-cutting **Maths representation gap** (near-zero non-prose content outside the diagram/coordinate families) remains a secondary, non-family-scoped candidate for a future wave, noted but not counted among the 5 above since it isn't a single family.

**Not manufactured. Not designed. Not implemented. No infrastructure audit performed.** This is a priority list only, drawn from the plan's own existing evidence, for Founder decision.

**Wave 2 has not begun and will not begin without explicit Founder approval.**
