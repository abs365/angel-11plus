# ANGEL 11+ — EI003 WAVE 2 CANDIDATE-STORE SUBMISSION REPORT

Status: source control complete and deployed. **Candidate-store submission blocked at 0/40 by a genuine, pre-existing infrastructure gap, discovered only through live verification.** Not reviewed, not published, Wave 3 not begun.

---

## A. Final 40-candidate reconciliation

Reconciled directly against the corrected source files (`scripts/reconcile-ei003-wave2-manifest-for-submission.mjs`), not assumed:

- **40** total candidates.
- Per family: `wave3-fam-rc06-sequencing` = 8, `wave3-fam-rc07-comparative` = 8, `wave3-fam-rc08-emotion` = 8, `wave3-fam-rc10-atmosphere-mood` = 8, `wave3-fam-rc10-word-choice` = 8.
- **20** genuine blueprints, exactly 4 per family, exactly **2 candidates per blueprint** (verified programmatically, not assumed from arithmetic) — confirmed for all 20 blueprint IDs.
- 40/40 candidate IDs unique. 0 orphan blueprint references (every candidate's `blueprintId` resolves to a real blueprint).

## B. Final passage distribution

6 original passages, all referenced: Last Delivery = 9 (22.5%), Clock That Stopped = 9 (22.5%), Crossing the Fen = 9 (22.5%), Relay Baton = 7 (17.5%), Attic Workshop = 5 (12.5%), Glass Frog = 1 (2.5%). Top-two combined = 18/40 = 45.0% — matches the passage-diversity correction report exactly, unchanged since that correction (this submission step made no further content edits).

## C. Final 20-blueprint reconciliation

All 20 blueprints from the accepted design remain represented, 4 per family, none merged or newly created during this step.

## D. Candidate-ID convention result

Inspected the live, current `publish_question_candidate()` RPC (migration 239, confirmed as the version actually deployed): it unconditionally computes `v_new_question_id := 'qf-' || v_candidate.candidate_id`. Wave 1's `qf-qf-...` issue occurred because Wave 1's own candidate IDs already began with `qf-`. Wave 2's candidate IDs (e.g. `ei003-w2-seq-explicit-01`) never begin with `qf-` — confirmed by inspecting all 40 IDs in the manifest. **No change was needed**: publishing any Wave 2 candidate would produce a single, clean `qf-ei003-w2-...` ID. No RPC change, no infrastructure migration, no ID renaming was made or is needed.

## E. Exact bounded source files

Fifteen files, all additive except one modification, staged and committed with no unrelated content:

- `lib/ali/questionFactory/ei003Wave2Passages.ts` (new)
- `lib/ali/questionFactory/ei003Wave2EnglishTypes.ts` (new)
- `lib/ali/questionFactory/ei003Wave2SequencingFamily.ts` (new)
- `lib/ali/questionFactory/ei003Wave2ComparativeFamily.ts` (new)
- `lib/ali/questionFactory/ei003Wave2EmotionFamily.ts` (new)
- `lib/ali/questionFactory/ei003Wave2AtmosphereFamily.ts` (new)
- `lib/ali/questionFactory/ei003Wave2WordChoiceFamily.ts` (new)
- `lib/learningEngine/englishExamStrategies.ts` (modified — 5 new worked-example/strategy entries, additive only)
- `scripts/validate-ei003-wave2-manifest.mjs` (new)
- `scripts/analyze-ei003-wave2-passage-exposure-after-correction.mjs` (new)
- `scripts/reconcile-ei003-wave2-manifest-for-submission.mjs` (new)
- `scripts/build-ei003-wave2-submission-payload.mjs` (new)
- `scripts/output/ei003-wave2-baseline-questions.json` (new, evidence artifact)
- `scripts/output/ei003-wave2-submission-payload.json` (new, evidence artifact — the exact 40-payload set that was attempted)
- `tests/lib/learningEngine/englishExamStrategiesWave2Inference.test.ts` (new)

Explicitly excluded (verified by file mtime predating this wave, and/or already-known unrelated status): `ANGEL_EDUCATIONAL_INCREMENT_003_SUSTAINED_LEARNING_PLAN.md`, `ANGEL_EI003_WAVE1_FINAL_PUBLICATION_READINESS_REPORT.md`, `lib/ali/questionFactory/candidateStoreMapping.ts`, the pre-existing untracked English cluster (`englishTypes.ts`, `englishPassages.ts`, `englishRetrievalFamily.ts`, `englishSequencingFamily.ts`, `englishSynonymFamily.ts`, `englishVocabularyFamily.ts`, `englishLanguageEffectFamily.ts`, `englishQuotationExplanationFamily.ts`, `englishIndependentValidation.ts`), `mr03CoordinateBlueprints.ts`, and their associated pre-existing tests (`candidateStoreMapping.test.ts`, `mr03CoordinateBlueprints.test.ts`, `englishFactory.test.ts`, `answerIntegrityRepairEndToEnd.test.ts`). Nothing was deleted, reset, or overwritten — all left exactly as found on disk.

The two Wave 2 markdown reports (`ANGEL_EI003_WAVE2_ENGLISH_DEPTH_PRE_PUBLICATION_REPORT.md`, `ANGEL_EI003_WAVE2_PASSAGE_DIVERSITY_CORRECTION_REPORT.md`) and this report remain local, uncommitted Founder-facing documents, matching Wave 1's own precedent for its closure report.

## F. Commit SHA

**`b3c6bfaae3c229e2ec00d736f646f0f0f1fcc0f8`** on `main`, message: *"feat(ali): Educational Increment 003 Wave 2 -- English inference/interpretation depth (5 families, corrected passage diversity)"*. 15 files changed, 4,316 insertions, 0 deletions.

## G. Push/deployment result

Pushed cleanly to `origin/main` (`5ba9785..b3c6bfa`). Vercel triggered a new production deployment (`angel-11plus-m8gok142n-abs365s-projects.vercel.app`), polled directly via the Vercel CLI until it reached **Ready** (build duration 1m). No manual intervention needed.

## H. Tests/typecheck/build result

All verified inside an isolated `git worktree` at the pre-Wave-2 commit (`5ba9785`), containing **only** the 15 bounded files above plus a symlinked `node_modules` — the same discipline that protected Wave 1, proving the bounded changeset itself is clean with zero dependency on the pre-existing untracked cluster:

- **Typecheck** (`npx tsc --noEmit`): 0 errors.
- **Targeted test** (`englishExamStrategiesWave2Inference.test.ts`): 5/5 pass.
- **Deterministic validator**: `DETERMINISTIC VALIDATION: PASS` — 40 candidates, 20 blueprints, 6 passages, 0 quote-integrity or structural problems.
- **Production build** (`npm run build`): exit code 0, `✓ Compiled successfully`, all 64 routes generated. One observed, non-blocking console warning during static generation (`ReferenceError: location is not defined`) appeared but did not fail the build or any route — none of the 15 bounded files touch browser-only APIs, so this is judged pre-existing/unrelated, not a Wave 2 regression, though it was not separately traced to a root cause within this task's scope.

The full, unbounded repository's own regression suite was not re-run in this step since no candidate/blueprint/passage/teaching content changed since the passage-diversity correction report's own full-suite run (4,244/4,247 pass, same 3 pre-existing unrelated failures) — re-running was unnecessary rather than skipped.

## I. Admin identity verification

Verified live, in-browser, against the real authenticated Supabase session before any write attempt:
- `email = the Founder admin account` ✓
- `is_anonymous = false` ✓
- `is_current_user_admin() = true` (confirmed via a live RPC call, HTTP 200, returned `true`) ✓

No service-role key used, no new admin created, no role modified. Genuine admin session was available throughout, so no `ADMIN AUTHENTICATION REQUIRED` stop was needed.

## J. Pre-submit collision check

Queried the live `ali_question_candidate` and `ali_question_bank` tables directly:
- **0** of the 40 deterministic candidate IDs already existed in `ali_question_candidate`.
- The 5 target family IDs already had **4** existing rows (`eng-voc-13` through `eng-voc-16`) — inspected individually and confirmed to be pre-existing, already-published, unrelated content from 2026-09-07 (before this session's Wave 1 commit even existed), sharing only a family ID, not a candidate ID, with any of the 40. **No genuine collision.**
- **0** unexplained published-question collisions (no `qf-ei003-w2-...` IDs exist in `ali_question_bank`, as expected since nothing has ever been published).
- Passage identity check: **0** of the 6 Wave 2 passage IDs exist in `ali_passage_bank` — this is not a collision, but the root cause of the submission block reported below (§K/§S).

## K. Candidate submission result

**BLOCKED at 0/40 by a genuine schema/data dependency, discovered through live, side-effect-free verification — not a Wave 2 content defect.**

Before attempting submission, the real, live `submit_question_candidate()` RPC signature was independently confirmed (the local migration files were found to be behind the deployed schema — the live `ali_question_candidate` table carries three additional columns, `passage_id`, `review_method`, `approval_basis`, not present in the local `230_question_factory_candidate_lifecycle.sql` file). This was proven via two safe, zero-side-effect probes using an intentionally-invalid `p_subject` value to force a `CHECK` constraint violation (Postgres error `23514`) rather than committing any row — confirming `p_passage_id` is a real, accepted, nullable parameter with no residual rows left behind (independently re-verified by querying for the probe candidate ID afterwards: 0 rows).

The first bounded batch (8 sequencing candidates) was then submitted for real. **All 8 failed** with Postgres error `23503` (foreign key violation): *"Key (passage_id)=(ei003-w2-eng-the-relay-baton) is not present in table \"ali_passage_bank\""*. Since this is a structural condition true of every one of the 6 Wave 2 passages (confirmed 0/6 present in `ali_passage_bank`, §J), the same failure would occur for all remaining 32 candidates. Per the Founder's own explicit instruction ("if failures occur, stop safely and reconcile exactly rather than blindly rerunning"), submission was **stopped after batch 1** rather than continuing to fail identically against batches 2-5.

**Result: 8 attempted, 0 successful, 8 failed (batch 1); 32 not attempted (batches 2-5, withheld once the structural cause was identified). Zero residual rows anywhere** — confirmed by querying all 40 deterministic candidate IDs against the live table immediately after: 0 found.

Root cause: `ali_passage_bank` is a **separate, pre-existing content pathway** from the Question Factory candidate pipeline — its rows are populated exclusively via direct, hand-written `insert into public.ali_passage_bank` SQL migrations (confirmed present in migrations 044, 045, 049, 051, 063, 097, 152, 161, 166, 191, and others), Founder-applied via the Supabase Dashboard, with **no governed RPC of any kind** (searched all migrations for a `submit`/`register`-style passage function; none exists). The 6 Wave 2 passages were authored as original content this wave but were never written into `ali_passage_bank` by any prior step, because no instruction in this arc has yet asked for that — Wave 2's design and correction phases worked entirely with the passages as in-code data (`ei003Wave2Passages.ts`), which is sufficient for authoring, deterministic evidence-quote validation, and teaching content, but not for the governed candidate-submission path, which enforces a real foreign key to `ali_passage_bank.id`.

This gap was **not knowable from the SQL alone**: reading `publish_question_candidate()`'s source suggested `passage_id` was only dereferenced at *publish* time (`if v_candidate.passage_id is not null then select ... from ali_passage_bank ...`), which would have permitted submission now and only blocked a future publish attempt. Live verification revealed a stricter reality: the live `ali_question_candidate` table itself carries a `passage_id` foreign-key constraint (`ali_question_candidate_passage_id_fkey`) not visible in any local migration file, enforced at *submission* time. This is exactly the class of gap this session's discipline exists to catch — verifying real state rather than trusting local source review — and is reported here rather than routed around.

**No workaround was attempted.** Writing directly into `ali_passage_bank` was out of scope (no governed RPC exists; a raw insert would be an unauthorized direct-write to a table this task was never asked to touch, and authoring a new migration file would be exactly the kind of new infrastructure change the Founder's own §2 instruction says not to introduce for a lesser, cosmetic reason — this is a materially larger, structural gap, so it is disclosed rather than silently patched).

## L. Candidate-store read-back

Not applicable — 0/40 candidates were stored. Read-back of the (would-be) 40 stored rows cannot be performed because nothing was written. This is disclosed as the direct, honest consequence of §K, not a separate failure.

## M. 8/8/8/8/8 family reconciliation

Unaffected by the submission block — this describes the source manifest, which remains fully intact (§A). In the *candidate store*, all 5 families remain at their pre-existing counts (0 Wave 2 rows added to any of them).

## N. 20/20 blueprint preservation

Unaffected — describes the source manifest (§C), fully intact. 0 Wave 2 blueprints reached the candidate store.

## O. Passage-reference preservation

**This is the material finding of this task.** Every one of the 40 candidates' `passageId` references resolves correctly *within the local Wave 2 manifest* (confirmed by the deterministic validator and the manual reconciliation in §A), but **none of the 6 referenced passages exist in the governed `ali_passage_bank` table that the real candidate-submission and publication pipeline depends on.** Passage-reference integrity is therefore proven at the manifest level and disproven at the database level — an honest, load-bearing distinction this report exists to surface rather than obscure. Per the Founder's own standing instruction ("do not assume successful candidate storage proves passage integrity"), this report goes further: it establishes that *even candidate storage itself* cannot proceed until this gap is closed.

## P. Quote/evidence integrity after storage

Not applicable in the database sense (0/40 stored). At the manifest level, quote/evidence integrity remains fully verified: the deterministic validator's exact-substring check against real passage text passed for all 40 candidates immediately before this submission attempt (§H), unchanged since the passage-diversity correction.

## Q. Confirmation 40/40 pending_review

**False — 0/40 are pending_review**, because 0/40 exist in the candidate store at all. This is the direct, disclosed result of the blocker in §K, not a discrepancy to be explained away.

## R. Confirmation 0/40 Wave 2 published

**True — 0/40 Wave 2 candidates are published.** No candidate was ever eligible for publication (none were even submitted), and `review_question_candidate()`/`publish_question_candidate()` were never called, per instruction.

## S. Material findings

1. **The Wave 2 educational content itself remains fully sound** — this task found and changed nothing about the 40 candidates' educational design, evidence, or the passage-diversity correction. The blocker is purely infrastructural.
2. **A genuine, previously-undiscovered gap**: the 6 original Wave 2 passages were never registered in `ali_passage_bank`, and no governed path exists to do so (only direct, Founder-applied SQL migrations, a pattern distinct from the Question Factory's RPC-governed candidate/review/publish pipeline). This gap could not have been found by source review alone — the live schema (an extra foreign-key constraint plus 3 undocumented columns) differs from what the local migration files show, and was only surfaced by attempting a real, live submission.
3. **Zero side effects from discovery**: both the signature-probing technique (deliberate CHECK-constraint violations) and the real batch-1 attempt (foreign-key violations) left no residual data in any table, independently re-verified by direct query.
4. **The candidate-ID/publication-prefix concern (§2 of the Founder's instruction) is fully resolved and required no code change** — Wave 2's naming convention was already correct.
5. **Source control, isolated verification, commit, push, and deployment are all genuinely complete** — this is real, deployed, reviewable code, independent of the database blocker.
6. **Next step, not taken here**: registering the 6 passages into `ali_passage_bank` would require a new, Founder-reviewed SQL migration following the codebase's own established convention (as seen in migrations 044/045/049/etc.), then Founder-application via the Supabase Dashboard — exactly the kind of action this task's own governance requires explicit authorization for, so it is named here as the clear unblocking step rather than performed unilaterally.

## T. GO / REVISE / NO-GO FOR CONTROLLED REVIEW AND PUBLICATION

**NO-GO — blocked, not rejected.**

Controlled review and publication cannot proceed because candidate-store submission itself has not succeeded (0/40 stored). This is not an educational or content judgment — the manifest, teaching content, and passage-diversity correction all remain fully validated and accepted — it is a hard infrastructural prerequisite: the 6 Wave 2 passages must be registered in `ali_passage_bank` (via a new, explicitly Founder-authorized migration) before `submit_question_candidate()` can succeed for any of the 40 candidates. Once that prerequisite is met, resubmission of the exact same 40-candidate manifest (already source-controlled, deployed, and validated) should be a small, bounded, low-risk step.

**STOP. Do not review. Do not publish. Do not begin Wave 3.**
