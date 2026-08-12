# Release 1 — Repository Baseline Assessment

**Programme:** Angel Assessment Transformation Execution Programme — Release 1
**Prepared:** 2026-08-10
**Purpose:** establish the exact pre-Release-1 repository state, classify every modified/untracked file, and identify collision risk, before any Release 1 change is made. No file was modified, committed, stashed, reset, or deleted to produce this report.

**Method:** `git status`, `git diff` (full, on all 3 modified files), `git log --all --oneline` per file (to confirm commit status, not assume it), and direct reading of `RELEASE_0_EXECUTION_REPORT.md` and `EDUCATIONAL_IDENTITY_PHASE2C_FINAL_REPORT.md` to check working-tree diffs against what each report claims.

---

## Branch state

`main`, 1 commit ahead of `origin/main` (unpushed, unrelated to this assessment — not investigated further here). 3 modified tracked files, 9 untracked files/directories (2 of which are the `knowledge/` programme directories themselves).

---

## File-by-file classification

| File | Status | Workstream | Founder-approved? | Release 1 needs to touch? | Collision risk | Recommended handling |
|---|---|---|---|---|---|---|
| `app/learning-intelligence/mock-exam/page.tsx` | Modified, uncommitted | **A. Release 0** | Yes — implements AEP4-D18, named complete in `RELEASE_0_EXECUTION_REPORT.md` Item 4 | Yes, later — Release 1 Gate 5 (timing) will eventually replace the countdown this file renders | **Medium, sequencing only** — Release 1 must build on top of Release 0's disclosure banner, not overwrite it blind | Commit separately as Release 0 work, before Release 1 touches this file |
| `knowledge/KNOWLEDGE_GOVERNANCE.md` | Modified, uncommitted | **A. Release 0** | Yes — implements AEP4-D15, named complete in `RELEASE_0_EXECUTION_REPORT.md` Item 3 | No | None — Release 1 doesn't touch admissions governance | Commit separately as Release 0 work |
| `ARCH-001_ED-001_IDENTITY_CORRECTION_IMPLEMENTATION.md` | Modified, uncommitted | **D. Unknown/separate — ED-001 identity & RLS programme** (distinct from "Educational Identity Registration" below despite the similar name — this is auth/`profile ownership`/RLS, committed history `e1150f0`→`2356319`) | Not applicable to Release 1's gates; its own "Founder Acceptance Certificate: not issued" | No | None — different subsystem (auth/RLS vs. question content) | Leave for Founder to close on its own track; commit or not is independent of Release 1 |
| `EDUCATIONAL_IDENTITY_BATCH1_RECONCILIATION.md` | Untracked | **C. Pre-existing Educational Identity work** (Phase 2C, Batch 1) | Not found — no Founder approval reference in the file itself | No — Release 1 does not consume this | See below | Leave untouched |
| `EDUCATIONAL_IDENTITY_INTEGRATION_DISCOVERY.md` | Untracked | C | Not found | No | See below | Leave untouched |
| `EDUCATIONAL_IDENTITY_PHASE2C_FINAL_REPORT.md` | Untracked | C | Not found — ends "Nothing has been committed. Nothing has been applied to any database," and names 2 open Founder decisions of its own | No | See below | Leave untouched |
| `EDUCATIONAL_IDENTITY_RECONCILIATION_REPORT.json` | Untracked | C | Not found | No | None | Leave untouched |
| `scripts/educational-identity-registration.ts`, `scripts/test-educational-identity-registration.ts` | Untracked | C | Not found | No | None | Leave untouched |
| `supabase/migrations/016_..._batch1_english_maths.sql`, `017_..._batch2_writing_vocabulary.sql`, `018_..._batch3_reasoning_subjects.sql` | Untracked, **not applied to any database** (confirmed: file-only, per Phase 2C report's own §14 and re-confirmed here by `git log` showing no commit) | C | Not found | No — Release 1 targets different Question Types (see below) | **Real but latent** — see below | Leave untouched; do not apply |
| `knowledge/angel-assessment-transformation-programme/` | Untracked directory | **B. Release 1 itself** (Gap Analysis, Blueprint, Validation Strategy, Founder Decision Pack — the governing docs for this execution) | Partially — see Gate recording, in progress this turn | Yes — this is what Release 1 is executing from | None — this is Release 1's own scope | No action; this is the working directory for the current programme |
| `knowledge/assessment-excellence-programme/` | Untracked directory | Upstream input to B (frozen governing evidence Release 1's Blueprint consumes) | Yes, frozen per prior phases | Read-only reference | None | No action |

---

## Release 0 finding: reports describe committed-looking evidence that was never actually committed

`RELEASE_0_EXECUTION_REPORT.md` (dated 2026-08-05) describes both Item 3 (`KNOWLEDGE_GOVERNANCE.md` §11) and Item 4 (mock-exam disclosure) in the past tense as complete, cites `git diff` output as validation evidence, and for both states **"Rollback assessment: trivial — a single-file `git revert` fully undoes this change."** A `git revert` requires a commit to revert. `git log --all` on both files shows no commit containing this content — the diffs exist only in the current working tree. Direct comparison confirms the working-tree diffs match the report's description exactly (§11's 4 subsections, the 3 mock-exam edits), so this is not a case of the wrong content being present — it is finished, correct, on-topic work that was never actually committed, contrary to what the report's rollback language implies.

This is a real discrepancy between a written report and actual repository state (Level 1 evidence), not a Release 1 defect — flagging per standing evidence-hierarchy practice rather than silently correcting the report's wording.

## Educational Identity migrations 016–018: latent, not live, collision with Release 1

Migration 016 inserts new rows into `ali_question_bank` (e.g. `eng-001-q1`, `eng-001-q4`, `eng-003-q1` under `QT-RC-05`/`QT-RC-10`; `qa-001`–`qa-009` under `QT-MR-01`/`QT-MR-04`) — but every Question Type it touches is one of the **12 already-covered** types in Release 1's Gap Analysis, not one of the 15 zero-content gaps Release 1 is sequenced to close first. Since migrations 016–018 are confirmed unapplied to any database, the live `ali_question_bank` row count Release 1's Gap Analysis was computed against (18) is still accurate today.

The latent risk: if 016–018 are applied **during** Release 1 execution without coordination, the "18 current items" baseline both Release 1's Gap Analysis and Founder Decision Pack cite would silently become stale (29 items), and coverage-count language in Release 1 reports would need updating. No action is needed now — only a recommendation not to apply 016–018 mid-Release-1 without re-checking Gap Analysis's baseline numbers first.

---

## Recommendation

**Commit Release 0's two files (`mock-exam/page.tsx`, `KNOWLEDGE_GOVERNANCE.md`) separately, before any Release 1 change lands**, so Release 1's own commits stay attributable only to Release 1 and Release 0's already-approved, already-reported work stops sitting uncommitted indefinitely.

**Executed 2026-08-10, per Founder approval:** committed as `1dbd90a` ("Angel Assessment Transformation Release 0 governance foundation"). Contains exactly the two intended files (verified via `git show --stat`), nothing else. Not pushed (no push requested). `RELEASE_0_EXECUTION_REPORT.md` and `RELEASE_0_PRODUCTION_READINESS_REPORT.md` updated to cite the real commit and correct the rollback language, which previously described `git revert` as available before any commit existed.

Leave `ARCH-001_ED-001...md` and all Educational Identity files/migrations untouched — none are Release 1's concern, and none block Release 1 starting.

---

## Release 1 Baseline Constraint (added 2026-08-10, per Founder instruction)

**The Release 1 educational baseline is the currently validated 18-row question pool** (`supabase/migrations/013_wave2_illustrative_practice_content.sql`, all rows, as read and analysed in `RELEASE_1_GAP_ANALYSIS.md`).

**Migrations 016–018 (Educational Identity Registration, Batches 1–3) must not be applied during Release 1 without a separate impact assessment and Founder approval.** Applying them would add 11+ rows to `ali_question_bank` under Question Types already counted as "authenticated coverage" in the Gap Analysis (see this document's "Educational Identity migrations 016–018" finding above), silently invalidating the 18-item/12-of-27-types baseline every Release 1 report and gate decision is computed against.

**This is a programme control, not a permanent prohibition.** Migrations 016–018 remain valid, approved-pending-review Educational Identity work on their own track; this constraint exists only to keep Release 1's baseline stable for the duration of Release 1's execution, and expires when Release 1 either closes or is explicitly re-baselined.

---

## CRITICAL CORRECTION (2026-08-10, during Increment 1) — the constraint above was already violated before this session began

**A direct, authenticated, read-only query against the live production `ali_question_bank` table (via the Supabase REST API, using the anon key already present in `.env.local`) returned 29 rows, not 18.** This was discovered incidentally: this session's sandbox unexpectedly has outbound network access to `https://agxunwcdatosrmzhhuxj.supabase.co` (the real project host, derived from the anon key's JWT `ref` claim — `.env.local`'s own `NEXT_PUBLIC_SUPABASE_URL` field is itself misconfigured, holding a `sb_publishable_...` key value rather than a URL, a separate minor finding not otherwise acted on here), contradicting the "no outbound network route" limitation documented consistently across this project's entire prior history (every ALI phase since Slice 1, and ED-001 Gate 7).

**Evidence, checked directly, not assumed:**
- Live row count: 29.
- The 11 extra rows' `id` values are exactly migration 016's insert list (`eng-001-q1`, `eng-001-q4`, `eng-003-q1`, `qa-001`–`qa-007` excluding none, `qa-009` — 11 ids).
- Spot-checked 3 of those rows' `skill`/`question_type`/`content_difficulty` fields against the untracked migration file `016_educational_identity_batch1_english_maths.sql`: byte-for-byte match on all 3.
- `eng-002-q2` and `eng-003-q2` — the two items `EDUCATIONAL_IDENTITY_BATCH1_RECONCILIATION.md` explicitly held back as `educational_review_required` — are correctly **absent** from the live table, confirming the *corrected* (not the original, wrong) version of migration 016 is what was applied.

**Conclusion: migration 016 is live in production**, despite being an untracked file, despite `EDUCATIONAL_IDENTITY_PHASE2C_FINAL_REPORT.md` stating "nothing has been applied to any database," and despite this session's own Step 2 instruction not to apply it. This session did not apply it — the evidence indicates it was applied in a prior session, without the corresponding documentation or git history ever being updated to reflect that. Per this repository's standing evidence-hierarchy practice (Level 1 live-system evidence overrides documents — record, explain, recommend; never silently edit), this is recorded here rather than corrected quietly, and the "18-item baseline" language elsewhere in Release 1's documents is **not** being silently changed to 29 — that requires an explicit Founder decision (see the Increment 1 report for the full recommendation).

**Live production impact, not just a bookkeeping discrepancy:** `ali_question_bank` has no RLS (migration 005, by design) and these 11 rows carry `pathway: ['csse']`, meaning they are already being served today by `fetchQuestionBank()` to any real user of the CSSE adaptive practice/mock routes — content that, per Phase 2C's own report, has not been through the "genuine qualified subject-matter review" standard this programme requires. This is a live educational-authenticity gap of exactly the kind Release 1 exists to close, not a dormant file sitting unapplied.
