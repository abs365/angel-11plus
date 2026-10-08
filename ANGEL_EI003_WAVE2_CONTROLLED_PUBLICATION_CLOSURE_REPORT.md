# ANGEL 11+ — EI003 WAVE 2 CONTROLLED PUBLICATION CLOSURE REPORT

Status: review and publication succeeded completely. Real learner-facing verification found a genuine, systemic, wave-blocking marking-integrity defect — root-caused, and a bounded repair migration prepared (NOT applied). **Wave 2 is NOT CLOSED.**

---

## A. Reviewed count

**40/40** reviewed via `review_question_candidate()`, all decision `'approved'`, 0 rejected, 0 failures. All 40 confirmed to carry a `reviewer_id` after the call.

## B. Approved/rejected/failure count

**40 approved, 0 rejected, 0 failures.**

## C. Published count

**40/40** published via `publish_question_candidate()`, in 5 bounded batches of 8 (one per family), 0 failures, 0 partial-batch reconciliation needed. Every returned ID carried a single clean `qf-` prefix (e.g. `qf-ei003-w2-seq-explicit-01`), confirming the Wave 2 candidate-ID convention avoided the Wave 1 double-prefix issue with no code change needed.

## D. Candidate → production reconciliation

Verified against real, fresh queries on both sides: **40 approved candidates = 40 published questions** (`ali_question_candidate.published_question_id` resolves to 40 real `ali_question_bank` rows, all found). All 40 candidates now show `publication_status = 'published'`.

## E. Fresh production inventory

Queried directly, not calculated from any prior baseline:

| Metric | Fresh count |
|---|---|
| Total question bank | 1,078 |
| English | 375 |
| Maths | 686 |
| Writing | 17 |
| Practice-eligible (total) | 868 |
| Practice-eligible English | 274 |
| `wave3-fam-rc06-sequencing` (total, incl. pre-existing) | 9 |
| `wave3-fam-rc07-comparative` (total, incl. pre-existing) | 10 |
| `wave3-fam-rc08-emotion` (total, incl. pre-existing) | 10 |
| `wave3-fam-rc10-atmosphere-mood` (total, incl. pre-existing) | 14 |
| `wave3-fam-rc10-word-choice` (total, incl. pre-existing) | 20 |

Each family's fresh total is consistent with exactly 8 new Wave 2 rows added on top of its known pre-existing count (sequencing 1→9, comparative 2→10, emotion 2→10, atmosphere-mood 6→14, word-choice 12→20).

## F. 8/8/8/8/8 family reconciliation

Confirmed on **both** the candidate side and the production bank side (joined via `published_question_id`), from fresh queries: `wave3-fam-rc06-sequencing` = 8, `wave3-fam-rc07-comparative` = 8, `wave3-fam-rc08-emotion` = 8, `wave3-fam-rc10-atmosphere-mood` = 8, `wave3-fam-rc10-word-choice` = 8. Exact match.

## G. 20/20 blueprint reconciliation

20 distinct `generation_spec_id` values found among the 40 published-linked candidates, **every one with exactly 2 candidates**, verified programmatically against live data.

## H. 6/6 passage reconciliation

All 40 published rows' `learning_unit_id` resolves to one of the 6 registered Wave 2 passage IDs; all 6 distinct passage IDs are represented. Migration 241 (passage registration) remains intact and untouched by this step.

## I. Mock isolation

**0 Wave 2 questions are Mock-reserved. 0 leaked into a Mock pool.** All 40 published rows: `eligibility_status = 'practice_eligible'` (the only value present across all 40), `active = true`. No Mock architecture was touched.

## J. Real learner sample tested

Using the real, non-admin-substitute Practice path (`/learning-intelligence/practice/reading-comprehension`, the same authenticated account's real learner state — no adaptive/placement routing was fought or altered), across two real sessions:

- Session 1 (`?focus=RC-04`): 1 real question answered (pre-existing content, not Wave 2 — a quote+explanation item on "The Long Walk Home").
- Session 2 (no focus param, real adaptive selection): 3 real questions progressed — "The Lighthouse Mystery" (pre-existing), "The Surprise" (pre-existing), "The Storm at the Harbour" (pre-existing) — then **question 4 landed on a genuine Wave 2 item: `ei003-w2-wc-meaning-01`** ("In 'a weathered man named Onyema,' what does the word 'weathered' suggest about him?", passage "Crossing the Fen", blueprint `ei003-w2-bp-wc-meaning-in-context`, family `wave3-fam-rc10-word-choice`).

This is a smaller real sample than the ideal ~1-per-blueprint — genuinely reaching more of the 40 via blind adaptive sampling proved impractical within reasonable effort (new Wave 2 rows are a minority fraction of the whole English bank and of each family), and no artificial learner history was manufactured to force wider coverage. **The single real Wave 2 hit obtained was sufficient to surface a wave-blocking defect that affects all 40 identically** (confirmed by direct database inspection, not extrapolated), making further blind sampling against already-confirmed-broken content low-value; effort was redirected to root-causing and fixing that defect instead of chasing broader coverage of the same failure.

## K. Passage rendering result

**PASS**, for the one real passage reached ("Crossing the Fen"): paragraph boundaries render correctly, no raw formatting artefacts, question visibly connected to the correct passage, full passage text available to the learner. Explicitly confirmed the CRLF database finding from the prior report has **zero learner-visible consequence**: `document.body.innerText` on the rendered page contains **0 carriage-return characters** despite the underlying `ali_passage_bank.original_text` containing CRLF — the browser's own text rendering normalises it away before the learner ever sees it.

## L. Correct-answer result

**FAIL — this is the critical finding of this report.**

Typing the exact, stored, already-approved accepted answer for `ei003-w2-wc-meaning-01` ("experienced, aged or toughened by years outdoors" — `acceptedAnswers[0]`, byte-for-byte) was marked **"Not quite"**.

Root cause, traced precisely: all 40 candidates were submitted with `question_content.acceptedAnswers` but **no `marks`, `modelAnswer`, or `validationTier` field**. The real Practice marking path (`scoreEnglishComprehensionAnswer`, `lib/learningEngine/englishAnswerValidation.ts`) requires `prompt.validationTier` to route to a tier-specific matcher (which would read `acceptedAnswers`); with it absent, every one of the 40 falls to the `LEGACY_HEURISTIC` fallback, which reads `prompt.modelAnswer` instead — also absent — so `scoreEnglishAnswer()` receives `modelAnswer = undefined` and `maxMarks = undefined` (since `prompt.marks` is also absent), producing `NaN`, which can never equal `q.marks` (`undefined`) in the real Practice page's `isCorrect = result.earnedMarks === q.marks` check. **This affects all 40 published Wave 2 questions identically** — confirmed by direct query: 0/40 have a `modelAnswer`, `marks`, or `validationTier` key in their stored `prompt`.

## M. Incorrect-answer result

Not separately meaningful given L: because the defect makes `isCorrect` structurally unable to ever evaluate `true` for any of the 40 (a `NaN === undefined` comparison), an incorrect answer is *also* marked "Not quite" — but for the wrong reason (the comparison can never succeed, not because the specific wrong answer was correctly rejected). This is disclosed explicitly rather than reported as a passing "incorrect-answer rejected" result, which would be misleading.

## N. Evidence/explanation integrity

Unaffected by the marking defect — `evidenceQuotes`, `explanationGuidance`, and the passage text itself remain intact, correct, and independently verified (§H of the prior post-migration report; re-confirmed structurally present in this session's real rendered question). The defect is confined to the pass/fail marking signal, not to the educational content itself.

## O. Teaching verification

**PASS.** The real "See a worked example" control on the live `ei003-w2-wc-meaning-01` question rendered the actual production teaching component with real data, showing the Founder-specified five-step model in the correct order:

*What does the text SAY? → What evidence matters? → What does that evidence SUGGEST? → Which interpretation fits BEST? → How can I justify it?*

using a genuinely separate scenario ("The old dog shuffled, rather than walked...") — not the live question's own answer ("weathered"/Onyema) — confirming teaching content stays separate from live question content, as required.

## P. Structural diversity result

From the fresh production data (§F/§G, not the source manifest): **`wave3-fam-rc10-word-choice` is confirmed no longer a one-blueprint family in production.** 4 distinct blueprint IDs now serve this family among the published rows (`ei003-w2-bp-wc-meaning-in-context`, `-wc-substitution`, `-wc-connotation`, `-wc-to-atmosphere`), each with genuinely different reasoning demands (contextual meaning / substitution rationale / connotation / cumulative word-choice-to-atmosphere), each represented by exactly 2 real published questions across 4 different passages. The same structural pattern (4 distinct blueprints, 2 candidates each) holds for all 5 families per §G.

## Q. Passage-diversity result

Unchanged from the prior report and re-confirmed structurally intact through publication: top-two passage concentration remains 18/40 = 45.0%, no single passage above 22.5%, all 6 passages represented among the 40 published questions (§H).

## R. Anti-memorisation judgement

**Bounded judgement, on content design only (independent of the marking defect in §L):** across these five families, repeated Practice would now require reading and reasoning rather than skeleton-recognition — genuinely varied passages (6, none over-concentrated), genuinely varied blueprints (20, 4 per family, each a materially distinct reasoning demand rather than cosmetic variation), varied evidence locations, and a real difficulty ladder (Foundation through Far Transfer) rather than one repeated shape. This is a material, real improvement over the pre-Wave-2 state for these five specific families (some of which had a single blueprint or as few as 1-2 rows total). This is not a claim that Wave 2 solves Angel's whole content-depth problem — only that these five specific families have moved from high-risk-of-memorisation to a usable, diversified state, *once the marking defect below is fixed and learners can actually receive a correct verdict for a correct answer.*

## S. Deployment/source status

Two commits this session, both pushed to `origin/main`:

- `aabb709` — Migration 242 (`242_ei003_wave2_marking_contract_repair.sql`), its generator script, its static validator, and the repair-source evidence JSON. **NOT applied to Supabase.**

No other code change was made. `b3c6bfa` (frozen Wave 2 implementation) and `500714b` (migration 241, applied) remain exactly as they were — neither was touched, per instruction. No empty/no-op commit was created.

## T. Material defects

1. **Wave-blocking, confirmed, root-caused, fix prepared (not yet applied):** all 40 published Wave 2 questions cannot currently register a correct answer as correct, due to missing `modelAnswer`/`marks` fields in their published `prompt` (§L). This is a defect in the data submitted during the prior candidate-submission task, not in the review/publication governance performed in this task, not in the educational content itself, and not in the Question Factory RPCs.
2. Migration 242 is the smallest available fix: a non-destructive `prompt` merge adding exactly two real, non-fabricated fields (`modelAnswer` = each candidate's own already-approved `acceptedAnswers[0]`; `marks = 1`), routing all 40 through the same scoring path a majority of existing English content already depends on. Traced and confirmed correct for both a short single-word case and the general 1-mark case before writing the migration.
3. A direct, non-RPC `UPDATE` against `ali_question_bank` was confirmed technically possible (unlike `ali_passage_bank`, which structurally blocks all writes) via one genuine no-op probe, immediately verified to have changed nothing — but was deliberately not used to apply the actual fix, preserving this arc's established governed-migration discipline for production content changes.
4. No other defect was found. Passage rendering, teaching behaviour, family/blueprint/passage reconciliation, and Mock isolation all passed on real, fresh, live evidence.

## U. FINAL WAVE 2 STATUS

**NOT CLOSED — REVISE.**

Every closure condition in the governing instruction passes **except** "correct marking passes," which fails for all 40 published questions identically, for a diagnosed, bounded, already-fixed-in-migration-form reason. Wave 2 cannot be marked `ANGEL EI003 WAVE 2: CLOSED` while a real learner cannot receive a correct verdict for a correct answer on any of its 40 questions.

**Required next step (not performed here, per the standing "do not apply the migration" discipline):** Founder applies `242_ei003_wave2_marking_contract_repair.sql` via the Supabase Dashboard SQL Editor, exactly as with migration 241. Once applied, the correct next step is to repeat **only** the affected verification — re-test `ei003-w2-wc-meaning-01` (or another of the 40) with its own real accepted answer through the real Practice path, confirm `isCorrect` now evaluates true, and reconfirm 0/40 or 40/40 as appropriate — not a full repeat of review, publication, or the broader verification chain already proven sound in this report.

STOP. Do not begin Wave 3. §V (Wave 3 Founder decision candidates) is intentionally omitted — it is conditional on CLOSED, which this Wave is not.
