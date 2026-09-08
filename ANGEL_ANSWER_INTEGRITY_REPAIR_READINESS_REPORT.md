# ANGEL 11+ — ANSWER-INTEGRITY REPAIR READINESS REPORT

**Date:** 2026-09-07
**Scope:** Repair of the two defects described in `ANGEL_PUBLISHED_ANSWER_INTEGRITY_INCIDENT_REPORT.md`, plus one additional defect found while building this repair's own regression tests (disclosed fully below). No production write has been made. Nothing has been applied.

---

## A. Exact Repair Mechanism

Three code fixes + two migrations:

1. **`lib/ali/questionFactory/englishSynonymFamily.ts`** — corrected `validationTier` on all 5 Synonym Selection blueprints from `TIER1_EXACT_MATCH` to `TIER6_MULTI_SELECT`.
2. **`lib/ali/questionFactory/candidateStoreMapping.ts`** — corrected `mapEnglishCandidateToStoreRow` so `correctOptions` is derived as `[options[correctOptionIndex]]` (just the genuinely correct option), not the full options list.
3. **`supabase/migrations/237_publish_question_candidate_answer_persistence_correction.sql`** — corrects the forward publication contract: merges `ali_question_candidate.claimed_answer` into `prompt.answer` for Maths candidates, fail-closed if absent. **Not yet applied.**
4. **`supabase/migrations/238_published_answer_integrity_data_repair.sql`** — bounded, fail-closed, precondition-gated data repair for the 333 already-published rows, using only already-genuine source data. **Not yet applied.**

## B. Exact Affected Counts

| Bucket | Count |
|---|---|
| Maths rows repaired (missing `prompt.answer`) | 313 |
| English rows repaired (`wave1-fam-synonym-battery`) | 20 |
| **Total** | **333** |
| Other newly-published English rows (untouched) | 72 |
| Canary rows (untouched) | 5 |
| **Total published rows in scope** | **405** |

## C. Proof: All 313 Maths Source `claimed_answer` Values Exist and Are Genuine

Two independent lines of evidence:

1. **Schema guarantee:** `ali_question_candidate.claimed_answer` is `text not null`, enforced since migration 230 — cannot be null for any row that exists in the table at all.
2. **Direct inspection of the exact submitted RPC payloads** (`scripts/output/controlled-scale-submission-args.json` + `scripts/output/canary-5-submission-payload.json` — the literal arguments this session submitted for all 405 candidates, not a live-DB sample): **313/313 Maths candidates have a non-null, non-empty `p_claimed_answer` string.** 0 exceptions.

Migration 238's own preflight independently re-proves this against the live database at execution time — if it ever reads differently from 313, it aborts before touching anything.

## D. Proof: All 20 English Rows Have Valid Multi-Select Evidence

Same source-payload inspection, applied to every `wave1-fam-synonym-battery` candidate:

- 20/20 have `correctOptions` present, `requiredSelectionCount` present, and a `distractors.correctOptionIndex` that is a valid, in-range index into `distractors.options`.
- 20/20 have `claimed_answer` genuinely equal to the option at that index.

**A second, independent defect was found only by running the real marking dispatcher against this data while writing this repair's own regression tests** (`tests/supabase/answerIntegrityRepairEndToEnd.test.ts`) — not by inspecting shape alone: **all 20 rows' published `correctOptions` field contains the full 4-option list (every option, right and wrong), not just the correct one.** Left uncorrected alongside the `validationTier` fix alone, this would have made `checkMultiSelect()` mark **every possible learner answer as correct** — a silent weakening of marking, the exact outcome you explicitly prohibited. This is now fixed at the source (`candidateStoreMapping.ts`) and folded into migration 238's single English repair statement, deriving the correct single-option value from each row's own genuine `distractors.correctOptionIndex` — never invented, never guessed.

I am disclosing this because it changes the shape of the English repair from what was originally scoped (a one-key `validationTier` fix) to a two-key fix (`validationTier` + `correctOptions`), both applied together, both derived from already-genuine candidate data.

## E. Proof: 72 Clean Rows Are Excluded

Structural, not incidental: migration 238's English predicate requires `family_id = 'wave1-fam-synonym-battery'` — the 72 other English rows from this activation belong to different families (`wave1-fam-direct-retrieval`, `wave1-fam-sequencing`, `wave1-fam-vocab-explain`, `wave1-fam-quote-explain`, `wave3-fam-rc10-word-choice`) and cannot match this predicate under any circumstance. No filter needed beyond the predicate's own scope.

## F. Proof: Historical/Pre-Existing Content Is Excluded

- All 351 pre-existing Practice rows are excluded by the `id like 'qf-%'` predicate (only Question-Factory-published rows carry this prefix) — confirmed baseline: 202/202 pre-existing Maths rows already have `prompt.answer` (would not match Maths repair's `prompt->>'answer' is null` predicate anyway).
- The 30 historical calibration candidates were never published (`publication_status` never reached `'published'`) — they have no corresponding `ali_question_bank` row at all, so the join to `published_question_id` structurally cannot match them.
- The 5 canary rows are English, non-synonym-battery — excluded by the same family-id predicate as the 72 clean rows.

## G. Proof: Mock and Writing Are Excluded

Both migrations' predicates require `subject in ('maths', 'english')` implicitly (Maths repair requires `subject = 'maths'`; English repair requires `subject = 'english' and family_id = 'wave1-fam-synonym-battery'`) — Writing rows (`subject = 'writing'`) cannot match either. Mock content is identified by `eligibility_status`/id convention, not by anything these predicates touch; no `mock-*`-prefixed id can ever match `id like 'qf-%'`.

## H. Targeted Regression Tests

New/updated test files, all passing:

| File | Tests | Result |
|---|---|---|
| `tests/supabase/migration237PublishAnswerPersistenceCorrection.test.ts` (new) | 16 | ✅ all pass |
| `tests/supabase/migration238PublishedAnswerIntegrityDataRepair.test.ts` (new) | 16 | ✅ all pass |
| `tests/supabase/answerIntegrityRepairEndToEnd.test.ts` (new) | 9 | ✅ all pass |
| `tests/lib/ali/questionFactory/candidateStoreMapping.test.ts` (+2 tests) | — | ✅ all pass |
| `tests/lib/ali/questionFactory/englishFactory.test.ts` (+1 test) | — | ✅ all pass |

Every item from Section 6 of your instruction is covered, using the **real production marking functions** (`checkMathsAnswer`, `scoreEnglishComprehensionAnswer`, `checkMultiSelect`), not re-implementations:
- ✅ mr02-substitution: expected 40, learner enters 40 → correct; feedback never renders `"Correct answer: undefined"` again.
- ✅ wrong Maths answer remains incorrect.
- ✅ published Maths prompt contains the canonical answer.
- ✅ a Maths candidate with no genuine `claimed_answer` fails publication (fail-closed guard).
- ✅ diagram-bearing Maths marking (`mr03-compound-area-perimeter`) — diagram content unchanged, marking works.
- ✅ coordinate Maths marking (`mr03-coordinate`) — marking works.
- ✅ existing (pre-237) Maths behaviour proven unchanged via a byte-for-byte diff test against migration 235's own function body.
- ✅ synonym multi-select correct selection passes, for eng-syn-01 and for **all 20** candidates.
- ✅ incomplete/wrong synonym selection fails — every wrong option for every one of the 20 candidates individually tested, plus empty and over-selected inputs.
- ✅ other English families (TIER1/TIER2/TIER4) proven unchanged.
- ✅ the 72 clean rows are excluded by construction (Section E) — not independently re-tested per-row since nothing touches them, by predicate design.

## I. Full Test Suite / Typecheck / Security Result

- **Full suite:** `npm test` → **4379/4379 pass, 0 failures.**
- **Typecheck:** `npx tsc --noEmit` → **clean, 0 errors.**
- **Security review (focused manual review, not the whole-repo `/security-review` skill — this repository has no clean git boundary isolating this session's changes from a large body of pre-existing uncommitted work, so a branch-wide diff review would not scope correctly):**
  - Migration 237: touches exactly one existing `security definer` function via `create or replace`; no grant/revoke change; the new fail-closed guard can only ever *reject* a call that previously succeeded, never permit a new one; the new merge uses `jsonb_build_object` (no string concatenation, no injection surface) against already-admin-only-writable candidate data the function already trusted for every other field it publishes.
  - Migration 238: no new function, no new grant; applied directly by the Founder's own admin database session via Supabase Dashboard (the same trust channel as every prior migration in this arc); every value written is read from already-genuine, already-stored candidate data; fail-closed exact-count preconditions prevent any scope beyond the named 333 rows.
  - `candidateStoreMapping.ts`/`englishSynonymFamily.ts`: pure, offline, build-time mapping/data code with no runtime I/O and no change in trust boundary — not a live API surface.
  - No new user input path, no new auth path, no privilege change, no secret handling anywhere in this repair. **No findings.**

## J. Migration Filenames and Exact Expected Production Effect

- **`supabase/migrations/237_publish_question_candidate_answer_persistence_correction.sql`** — redefines `publish_question_candidate(text)` only. **Zero rows updated on application** (it only changes behaviour for *future* publish calls). Any future Maths candidate published after this migration will have `prompt.answer` populated from its own `claimed_answer`; any future Maths candidate with no genuine answer will be refused publication rather than silently published broken.
- **`supabase/migrations/238_published_answer_integrity_data_repair.sql`** — updates `ali_question_bank` only. **Expected exact effect: 313 rows gain `prompt.answer`; 20 rows have `prompt.validationTier` corrected to `TIER6_MULTI_SELECT` and `prompt.correctOptions` corrected to a single-element array holding the genuinely correct option. Exactly 333 rows touched, 0 more, 0 fewer** — the migration aborts entirely (rolls back, changes nothing) if its own preflight or post-update counts ever differ from 313/20/333.

---

# READY TO APPLY

Both migrations are ready for your review and manual application via Supabase Dashboard > SQL Editor, in order: **237 first, then 238.** All code fixes are committed to the working tree (not yet to git, per no request to commit), all regression tests pass, the full suite and typecheck are clean, and the repair's scope has been independently verified twice — once against the original incident's known blast radius, and a second time after this repair's own testing surfaced the additional `correctOptions` defect, which is now included in the same bounded fix rather than left for a future incident.

Nothing has been applied. No containment has been executed. Awaiting your decision to run 237 and 238.

---

# POST-APPLICATION STATUS ADDENDUM (dated 2026-09-08)

The "READY TO APPLY" / "Nothing has been applied" text above reflects this report's own state at the moment it was written (2026-09-07) and is left unmodified as the historical record. It is now stale: **migrations 237 and 238 have since been applied to production**, at some point between this report being written and 2026-09-08.

This was independently re-verified on 2026-09-08, in a fresh session with no transcript of the application itself, via direct read-only production queries (anon key, no service-role key, no writes — same governance posture as every prior step in this arc):

- All 313 `qf-%`-prefixed Maths rows: 0 with `prompt.answer` still null; total confirmed 313. 8/8 spot-checked rows have `answer` present.
- All 20 `qf-eng-syn-01`…`qf-eng-syn-20` rows: 20/20 `validationTier = TIER6_MULTI_SELECT`, 20/20 `correctOptions` arrays contain exactly the one genuine correct option (not the full option list).
- The 11 other rows sharing `family_id = 'wave1-fam-synonym-battery'` (`w1-*`/`w2-*` IDs) are confirmed pre-existing, unrelated content on the legitimate `TIER2_ACCEPTED_SET` tier — never in scope, structurally excluded by migration 238's own `qf-eng-syn-*` scope, not a residual defect.

**Status: ANSWER-INTEGRITY INCIDENT — CLOSED.** Migrations 237/238 verified applied and correct for all 333 in-scope rows, independently re-confirmed on 2026-09-08 rather than taken on trust from the prior session's own claim.
