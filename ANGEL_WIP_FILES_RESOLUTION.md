# ANGEL 11+: RESOLUTION OF THE SEPTEMBER UNTRACKED FILES (2026-10-08)

Every file that sat untracked in the working tree since mid-September has been compared with current main and classified. Nothing unexplained remains untracked.

## Why they were untracked
An earlier commit that included part of this Question Factory cluster left committed `main` unbuildable, so the cluster was `git rm --cached` and left on disk (see the header of `mathsCandidateStoreMapping.ts`). Committed main stayed healthy (clean-checkout verified), but the working tree failed `tsc` and two test files for weeks.

## Root cause of the two failing tests (single, small)
`mr03CoordinateBlueprints.ts` imported `./independentValidation`, a Maths module that **never existed in git history**, and relied on types that were never committed (`independentAnswerCheck`, `ValidationResult.independentlyVerified`, `diagram`/`diagrams` on a candidate). Everything else in the cluster compiled and passed on its own.

## Classification

| Item | Class | Evidence | Action |
|---|---|---|---|
| `englishTypes`, `englishPassages`, `englishRetrievalFamily`, `englishQuotationExplanationFamily`, `englishSequencingFamily`, `englishVocabularyFamily`, `englishSynonymFamily`, `englishLanguageEffectFamily`, `englishIndependentValidation` (+ `englishFactory.test`) | **READY, now integrated** | Self-contained (no tracked file imports them); compile; tests pass. They are the **source of the live Wave-1 English content**: the blueprint ids in production (`eng-ret-bp-direct-fact` etc.) and the passages (lighthouse, recycled paper, kite festival, penguin) match this code. Leaving the generator of 164 live questions out of version control was a provenance risk. | Committed with tests |
| `candidateStoreMapping.ts` (+ `candidateStoreMapping.test`) | **READY after a bounded fix, now integrated** | Duplicated the Maths mapping now held in tracked `mathsCandidateStoreMapping.ts` (the single source of truth), and carried the English mapping used for the Migration 233 English submission. `tests/supabase/answerIntegrityRepairEndToEnd.test.ts` depends on it. | Maths side removed and re-exported from `mathsCandidateStoreMapping.ts`; English mapping kept. The Maths mapping now also carries `independentlyVerified` and `diagram(s)` when present. Two tests updated to that single semantics |
| `mr03CoordinateBlueprints.ts` (+ test) | **ACTIVE WIP, completed and integrated** | 7 coordinate blueprints (reflect x/y/y=x, translate, reverse translation, midpoint, error identification) with independent answer checks; unpublished (live `mr03-coordinate` items carry no blueprint id, so they came from an earlier generator). Directly useful for the coordinate-grid work. | Added the missing `independentValidation.ts` and the three type extensions; tests pass. Not submitted or published |
| `tests/supabase/answerIntegrityRepairEndToEnd.test.ts` | **READY, integrated** | Regression for the closed Published Answer Integrity incident; 9 tests pass. | Committed |
| `scripts/build-ei003-wave3-submission-payload.mjs`, `verify-ei003-wave3-production-marking-contract.mjs`, `verify-ei003-wave3-stored-marking-contract-roundtrip.mjs`, `dump-wave2-*.mjs`, `verify-migration-243-final-four-question-closure.mjs`, `verify-wave2-treehouselantern-learner-routing.mjs`, `dry-run-mock-244-evidence-derivation.mjs` and 6 matching JSON outputs | **READY (evidence of closed work), integrated** | Same kind as the tracked Wave 2 scripts and outputs; read only the public key; no secrets. | Committed |
| 26 `ANGEL_*.md` reports (EI-003 waves 1-3, migrations 245/247/248, mock acceptance reports, and others) | **READY (documentation), integrated** | The state document tells a fresh session to read "the matching report by name", so they belong in git. Four contained the Founder's admin email address; redacted to "the Founder admin account". No secrets found by scan. | Committed |
| `scripts/_ap.cjs`, `scripts/_copy.cjs` | **SUPERSEDED** | One-off scripts that rewrote source files; their changes are already in the tracked sources, and re-running them would fail or double-patch. | Archived on branch `archive/sep2026-scratch-patch-scripts`; removed from main |
| `scripts/output/mock-attempt-5a556dfb-question-outcomes.json` | **DATA, not source** | Per-question outcomes of one real Mock attempt (learner evidence). Regenerable from the database. | Not committed; excluded locally through `.git/info/exclude` |

## After this
- The working tree has **no untracked source files**; `npm test` has **0 failures** with the cluster present; `tsc` is clean.
- Committed HEAD is verified by `scripts/verify-clean-checkout.mjs` after the integration commit.
- Discipline kept: explicit-path staging, `git diff --cached --stat` before each commit.
