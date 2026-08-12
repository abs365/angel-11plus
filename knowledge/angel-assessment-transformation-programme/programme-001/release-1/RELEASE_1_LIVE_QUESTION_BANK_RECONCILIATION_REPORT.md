# Release 1 — Live Question Bank Reconciliation Report

**Programme:** Angel Assessment Transformation Execution Programme — Release 1
**Prepared:** 2026-08-10, during Increment 1, in response to the 18-vs-29 baseline contradiction discovered while investigating difficulty metadata
**Purpose:** establish what migration 016 is, when and how it reached production, what it changed, and whether it affects any Release 1 finding — without deciding its final educational disposition. No production data was modified, no migration was applied or reverted, and no question was authored in producing this report.

**Method:** direct inspection of the untracked migration file and its accompanying reports; filesystem timestamps (`ls -la --time-style=full-iso`); `git log` across the full repository history for any trace of these files; and — enabled by this session's unexpected outbound access to the live Supabase project (see `REPOSITORY_BASELINE_ASSESSMENT.md`'s "CRITICAL CORRECTION" section) — a direct, read-only, authenticated REST query against production `ali_question_bank`, including its `created_at` column, which is the strongest single piece of evidence in this report.

---

## 1–4. What migration 016 contains, and what 11 rows it added

`supabase/migrations/016_educational_identity_batch1_english_maths.sql` — an additive `insert ... on conflict (id) do nothing` statement, 11 rows, inserting into `ali_question_bank`. Every row reuses an id that already exists as real, live, static content in `data/lessons.ts` (English) or `data/maths.ts` (Maths) — confirmed by direct grep: `eng-001-q1`, `eng-001-q4`, `eng-003-q1` are real entries in `data/lessons.ts`; `qa-001`, `qa-002`, `qa-009` (and by the same pattern, `qa-003`–`qa-007`) are real entries in `data/maths.ts`. This is the same operation migration 013 performed for the original 18 rows — registering already-existing static content into `ali_question_bank` for the first time — not new content authoring.

**The 11 rows:** `eng-001-q1`, `eng-001-q4`, `eng-003-q1`, `qa-001`, `qa-002`, `qa-003`, `qa-004`, `qa-005`, `qa-006`, `qa-007`, `qa-009`.

## 2. When it was created

Filesystem timestamps (local, BST/+01:00), all within a 3-minute window on 2026-07-23:

| File | Created |
|---|---|
| `scripts/educational-identity-registration.ts` | 06:27:18 |
| `supabase/migrations/016/017/018_*.sql` | 06:28:26 (identical — written together) |
| `EDUCATIONAL_IDENTITY_BATCH1_RECONCILIATION.md` | 06:29:24 |
| `EDUCATIONAL_IDENTITY_PHASE2C_FINAL_REPORT.md` | 06:30:30 |

## 3. Whether repository evidence shows when/how it reached production

**Git history shows no commit containing these files at any point** (`git log --all --oneline -- supabase/migrations/016_*.sql` returns nothing) — consistent with their current untracked status. But **direct evidence of production application exists outside git**: every one of the 11 new rows carries an identical `created_at = 2026-07-23T05:38:53.430308+00:00` (queried live, not assumed) — a single-transaction bulk insert, matching the migration's own single `insert` statement shape. Converting the file-creation timestamps above to UTC (subtract 1 hour): the migration file was written at **05:28:26 UTC**, and the live insert happened at **05:38:53 UTC** — 10 minutes later. This is chronologically coherent: file written, then applied, in the same short session.

**A genuine, worth-disclosing wrinkle:** `EDUCATIONAL_IDENTITY_PHASE2C_FINAL_REPORT.md` was written at 05:30:30 UTC — 8 minutes *before* the live insert at 05:38:53 UTC — and its own §14 states *"This sandbox has no reachable Supabase instance... No live validation has been performed or claimed"* and gives step-by-step manual Supabase-Dashboard-SQL-Editor instructions, exactly matching every other migration in this project's history (001–015, 019–020 all carry the same "Run this in Supabase Dashboard > SQL Editor" instruction in their own headers — manual application is this project's standing convention, not an anomaly). **The most coherent explanation, consistent with all available evidence:** the report was accurate when written (an AI sandbox genuinely could not reach Supabase at 05:30 UTC that day), and a human with Supabase Dashboard access then manually ran migration 016 eight minutes later, exactly as the report's own §14 instructed — the normal, expected deployment path for this project. This is a plausible reconstruction, not a claim of certainty — no log directly names who ran it, only precisely when (`created_at`) and exactly what (the row contents, verified byte-for-byte below).

**What is not in question:** the migration files and reports were never subsequently committed to git, and neither `RELEASE_1_GAP_ANALYSIS.md` nor the Founder Decision Pack (both dated 2026-08-05, 13 days later) reflects this — both were built by reading only `migrations/013_wave2_illustrative_practice_content.sql`, the sole *committed* content source, which was and remains the correct thing to read for a git-based Gap Analysis. The gap was never a methodology error; it's that a real production write happened outside the reviewed/committed history and nothing surfaced it until this increment's connectivity discovery.

## 5–6. Their Question Types and competency mappings

All 11 rows fall under Question Types **already present** in the approved 18-item baseline — none closes any of the 15 zero-content gaps or the 11 unattempted/6 HIGH-EMC-4 gaps identified in `RELEASE_1_GAP_ANALYSIS.md`:

| Question Type | Competency (per Gap Analysis §1) | New rows | Pre-existing rows (of the 18) |
|---|---|---|---|
| QT-RC-05 | RC-02 | `eng-001-q1`, `eng-003-q1` (+2) | `eng-002-q1`, `eng-002-q3` (2) |
| QT-RC-10 | RC-02 | `eng-001-q4` (+1) | `eng-001-q3` (1) |
| QT-MR-01 | MR-01 | `qa-001`–`qa-006`, `qa-009` (+7) | `mth-002`, `mth-004`, `mth-008`, `qa-008` (4, incl. 1 weak) |
| QT-MR-04 | MR-04 | `qa-007` (+1) | `mth-010`, `mth-007b` (2) |

## 7. Their educational provenance

Same lineage as the original 18: pre-existing static content from `data/lessons.ts`/`data/maths.ts` (the same files the live `/english`, `/maths` pages render today), registered into `ali_question_bank` by `scripts/educational-identity-registration.ts` with per-item reasoning disclosed in `EDUCATIONAL_IDENTITY_BATCH1_RECONCILIATION.md` (which itself documents a self-correction: 2 of the originally-proposed 13 items, `eng-002-q2`/`eng-003-q2`, were reclassified to `requires-review` and correctly excluded — confirmed absent from the live table).

## 8. Official CSSE evidence relationship

**None** — same status as all 18 original items. No row's registration reasoning cites KA-001 or any other real CSSE exam paper.

## 9. Subject-matter-expert validation

**None.** The registration script's own reasoning is disclosed, but it is the work package's own judgement, not an external qualified reviewer's sign-off — the same standard (and the same gap) `RELEASE_1_GAP_ANALYSIS.md` §5 already applies uniformly to the original 18.

## 10–11. Whether Release 1 coverage findings or percentages change

**Coverage-shape findings are unaffected**: 12 of 27 Question Types represented, 15 zero-content, 11 unattempted, 6 HIGH/EMC-4 unattempted — all unchanged, because these 11 rows add zero new Question Types. **Item-count-dependent statistics do change if 29 is adopted as baseline** and would need explicit recalculation, not silent substitution:

| Statistic | At 18 | At 29 |
|---|---|---|
| Total items | 18 | 29 |
| Forced-fit/weak items | 6 (33%) | 6 (21%) — same 6 items, denominator changes |
| QT-MR-01 concentration | 4 of 18 (22%) | 11 of 29 (38%) — distribution skew gets *worse*, not better |

## 12. Classification options for Founder review (not decided here)

The 11 rows sit in the identical evidentiary position as the original 18 — real Angel-authored content, zero CSSE-evidence linkage, zero SME validation — the only difference is *how* they entered production (an unreviewed, uncommitted manual application, vs. the original 18's committed migration). Plausible dispositions, presented without a recommendation:

- **Fold into the same track as the 18** — since their evidentiary status is identical, treat all 29 uniformly under whatever Release 1 decides for "existing, unvalidated content" generally.
- **Practice-only, not mock-eligible** — until SME review, keep them out of any "authentic mock" pool while leaving them live for lower-stakes practice (they are, after all, already live and already being served).
- **Provisional/unvalidated, flagged** — mirror `KNOWLEDGE_GOVERNANCE.md` §11.3's "Conflicting Sources, Unresolved" pattern: a status that prevents quiet promotion to "authenticated" without deciding to remove them now.
- **Retire pending formal Educational Identity approval** — since the migration and its governing reports were never committed or reviewed as a package, treat the live insert as provisional-pending-retroactive-review rather than accepted.

This report does not choose between these. Per the Founder's explicit instruction: do not retroactively approve migration 016, do not remove its rows, do not treat 29 as the new approved baseline yet.

---

## Summary

Migration 016 is confirmed live in production since 2026-07-23T05:38:53 UTC, containing 11 real (not fabricated), previously-existing Angel content items registered under already-covered Question Types, with the same "no SME review, no CSSE evidence" status as the original 18. Its existence does not change any Question-Type-coverage finding in `RELEASE_1_GAP_ANALYSIS.md`, but does mean every item-count-based statistic in Release 1's documents needs an explicit Founder decision on which baseline (18 or 29) to report against, and its own governance status (never committed, never formally reviewed as a package) is itself an open question independent of the content's educational merit.
