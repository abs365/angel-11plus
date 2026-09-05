# Angel 11+ — Question Factory Wave 2: Migration Safety Gate

**Prepared:** 2026-09-05. Covers Section 1 of the Wave 2 brief in full for migrations 228, 229, and 230. All three remain **NOT APPLIED** — this document is the safety review the Founder asked for before any application decision, not an application record.

---

## Migration 228 — Cross-Subject Question Family Model

| Dimension | Finding |
|---|---|
| Exact schema/security change | One new table (`ali_question_family`), one admin-only RLS SELECT policy, one read-only backfill INSERT. Zero change to any existing table, column, policy, or function. |
| Reason required | Formalises the family concept both subjects already have (`family_id`) into a queryable, persisted record — currently only recoverable at read time by application code. |
| Current production dependency | None. No live code reads this table yet (disclosed honestly in the migration's own header — schema-first, per the Founder's own Phase 2 instruction). |
| RLS implications | Admin-only SELECT, no anon/authenticated policy of any kind. Strictly additive to the RLS surface — no existing policy touched. |
| Backwards compatibility | Full. `ali_question_bank.family_id` is read-only in this migration, never altered. |
| Idempotency | `CREATE TABLE IF NOT EXISTS` + `INSERT ... ON CONFLICT (family_id) DO NOTHING` — safe to re-run. |
| Failure mode | **A real bug was found and fixed during this Wave 2 review**: the original backfill assigned a `text[]` value (`ali_question_bank.pathway`, confirmed via migration 005's own original schema, never altered since) into a `jsonb` column without a cast — this would have raised a type-mismatch error and aborted the whole transaction the moment the Founder tried to apply it. Fixed via an explicit `to_jsonb()` cast; documented in the migration's own new CORRECTION HISTORY section, matching this repository's established convention for correcting an unapplied migration in place. Beyond that, the migration's own internal `RAISE EXCEPTION` sanity check (backfill row count must exactly match the source distinct-family-id count) fails the whole transaction atomically on any other mismatch — never a silent partial apply. |
| Recovery/rollback | `DROP TABLE public.ali_question_family;` — trivial, affects nothing else, since no other table references it and no application code reads it yet. |
| Can existing learner data be affected? | No. Read-only against `ali_question_bank`; writes only to the new table. |
| Can existing attempts/reports be affected? | No relationship to any Mock/attempt table exists in this migration. |
| **Verdict** | **PASSES, after the pathway type-cast correction.** Safe to apply. |

## Migration 229 — Question Bank Telemetry Write-Path Restoration (CORRECTED)

| Dimension | Finding |
|---|---|
| Exact schema/security change | **Corrected this wave.** The original Wave 1 design (a raw `GRANT UPDATE (usage_count, avg_success_rate)` to `authenticated` plus an RLS policy) is replaced with a single, narrow `SECURITY DEFINER` function, `record_question_bank_telemetry(question_id, is_correct)`, granted `EXECUTE` to `authenticated` only. **No grant and no RLS policy change is made to `ali_question_bank` itself.** |
| Reason required | `lib/ali/history.ts`'s `recordOutcome()` — a real, live, 23-call-site write path — has been silently blocked since migration 084 enabled RLS on `ali_question_bank` with a SELECT-only policy that never anticipated this table's one legitimate write. |
| Current production dependency | High: `usage_count`/`avg_success_rate` feed nothing today (0/null on all 351 practice-eligible rows), and Question Factory Stage 12 (Performance Calibration) and Wave 2 Section 8 (capacity evidence) both depend on this data eventually existing. |
| RLS implications — **this is the dimension the original design failed** | The original raw-GRANT design gated only *which rows* a client could touch (via RLS), never *what value* it wrote — any authenticated client could have called the PostgREST API directly, bypassed `recordOutcome()`'s own logic entirely, and written an arbitrary `usage_count`/`avg_success_rate` value to any non-`mock_eligible` row. **This was rejected by this safety gate as "the arbitrary outcome write" the Wave 2 brief explicitly named as the risk to close, not merely permit narrowly.** The corrected design closes this completely: no raw grant exists at all, so RLS on the table itself is unchanged from migration 084 in every respect; the only path is the new function, which accepts a boolean, never a number, and computes the new value itself, atomically, from the row's own pre-update snapshot. |
| Backwards compatibility | Full — `ali_question_bank`'s own grants/policies are untouched. `lib/ali/history.ts`'s `recordOutcome()` already calls the corrected RPC (`supabase.rpc("record_question_bank_telemetry", ...)`), replacing the old client-side fetch-then-update; a failure (e.g. calling this before the migration is applied) is handled identically to today's silent failure — `console.warn`, never a thrown error, so deploying the code change ahead of the migration is safe and self-activates once the migration lands. |
| Idempotency | The function itself is `CREATE OR REPLACE`, safe to re-run. Each individual call increments by exactly 1 — not idempotent in the sense of "calling it twice has the same effect," but that is the correct behaviour for a genuine outcome-count increment, identical in spirit to the original (also non-idempotent) design and to `recordOutcome()`'s own history-table writes elsewhere in the same function. |
| Failure mode | Fails closed throughout: no matching profile → exception; no matching `ali_student_question_history` row for the exact question → exception (this is also the anti-arbitrary-write legitimacy check — see below); the `eligibility_status` predicate blocks any write against `mock_eligible` content for non-admins; a zero-row UPDATE match (non-existent/inactive/sealed question id) → exception via `if not found`, never a silent no-op. |
| Recovery/rollback | `DROP FUNCTION public.record_question_bank_telemetry(text, boolean);` — trivial, zero other dependents. |
| Can existing learner data be affected? | No per-learner data is touched at all — this function writes only to `ali_question_bank` (shared content, not learner-owned) and reads (never writes) `ali_student_question_history`. |
| Can existing attempts/reports be affected? | No — this migration has no relationship to any Mock/attempt/report table or function (verified structurally: `mock_release_report`, `mock_apply_manual_mark`, `mock_analyse_attempt`, `mock_score_attempt`, `mock_persist_reading_scoring` are all absent from this migration's text). |
| **Legitimacy check, per the Founder's exact wording** ("permit the minimum legitimate authenticated/server-authorised recordOutcome() operation while preserving... isolation and preventing arbitrary outcome writes") | The function requires a genuine, pre-existing `ali_student_question_history` row for `(the caller's own profile, this exact question)` before it will touch anything — i.e. the caller must have actually been presented this question by `recordPresentation()` first, exactly matching the real application call order. A caller cannot claim telemetry for a question id it never encountered. This is the closest available proxy to true per-action authorisation without introducing a new event-log table this migration does not otherwise need. |
| **Verdict** | **The original Wave 1 design FAILED this gate and has been corrected. The corrected design PASSES.** Safe to apply. |

## Migration 230 — Question Factory Candidate Persistence, Review, Publication

| Dimension | Finding |
|---|---|
| Exact schema/security change | One new table (`ali_question_candidate`), admin-only RLS SELECT, three `SECURITY DEFINER` functions (`submit_question_candidate`, `review_question_candidate`, `publish_question_candidate`), each `GRANT EXECUTE`d to `authenticated` (all three internally re-check `is_current_user_admin()` — the `authenticated` grant is the same "any authenticated caller may attempt the call, the function itself is the real gate" pattern this schema already uses throughout, e.g. `mock_submit_answer`). |
| Reason required | Wave 1 proved generation/validation in memory only; Wave 2 requires a real, auditable GENERATED → REVIEWED → APPROVED → PUBLISHED lifecycle. |
| Current production dependency | None yet — this is new capability, not a fix to an existing broken path. |
| RLS implications | Admin-only SELECT on the new table; zero change to `ali_question_bank`'s own RLS (the one write into it, via `publish_question_candidate()`, goes through a `SECURITY DEFINER` function needing no new table-level grant, identical in shape to every other privileged Mock write in this schema). |
| Backwards compatibility | Full — no existing table, policy, or function is altered. |
| Idempotency | `submit`: not idempotent by design (each call creates one new candidate; `candidate_id` primary key rejects a genuine duplicate). `review`: naturally idempotent in effect (re-approving an already-approved candidate re-writes the same status). `publish`: explicitly non-idempotent and fails closed — re-publishing an already-published candidate raises an exception naming the existing `published_question_id`, never a silent no-op or a second bank row. |
| Failure mode | Three table-level `CHECK` constraints make the core safety properties true even against a hypothetical future direct (admin) table write, not merely RPC discipline: a candidate cannot be `published` unless `review_status = 'approved'`; a candidate cannot be `rejected`/`needs_correction` without a `rejection_reason`; `publication_status`/`published_question_id` must always agree. Every RPC also fails closed on a missing profile, wrong review state, or missing candidate. |
| Recovery/rollback | Drop the three functions and the table, in that order — no other object depends on any of them. Any already-published bank rows (via `publish_question_candidate`) would remain in `ali_question_bank` as ordinary `practice_eligible` rows (identical to a hand-authored row) and would need a separate, explicit content decision to retire, exactly like any other Practice content — this migration does not special-case its own rollback path for already-published content, since by that point the content is indistinguishable from any other practice_eligible row, which is the intended, disclosed design. |
| Can existing learner data be affected? | No — `reviewer_id` is the only learner/profile-linked field, and it is set only for the admin performing a review, from `auth.uid()`, never caller-supplied. |
| Can existing attempts/reports be affected? | No — zero references to any Mock/attempt/report table or function anywhere in this migration (verified structurally). |
| **Verdict** | **PASSES.** Safe to apply. |

## Consolidated Recommendation

Apply in numeric order (228 → 229 → 230) via the Founder's own established process (Supabase Dashboard → SQL Editor, one migration at a time, verifying the schema after each — this document invents no new deployment mechanism, per instruction). All three now pass this safety gate; two genuine defects were found and corrected during the review itself (228's pathway type-cast bug, 229's arbitrary-write vulnerability) — this is exactly the outcome a safety gate exists to produce, not a formality.

## Post-Application Verification Procedure (for the Founder to run)

```sql
-- 1. Confirm all three objects exist
select count(*) from public.ali_question_family;             -- should be > 0 immediately (backfilled)
select count(*) from public.ali_question_candidate;           -- 0 until a real submission
select proname from pg_proc where proname in (
  'record_question_bank_telemetry', 'submit_question_candidate',
  'review_question_candidate', 'publish_question_candidate'
);                                                              -- should return all 4

-- 2. Legitimate telemetry write succeeds (run as an authenticated learner
--    who has genuinely answered a real practice_eligible question recently)
select record_question_bank_telemetry('<a question id you genuinely just answered>', true);
select usage_count, avg_success_rate from public.ali_question_bank where id = '<that same id>';
-- usage_count should have incremented by exactly 1

-- 3. Illegitimate write fails (a question id this session never answered)
select record_question_bank_telemetry('<a real question id you have never attempted>', true);
-- expect: "No history row exists for caller and question ... -- cannot record telemetry
-- for a question never presented to this learner"

-- 4. Cross-user isolation: no test needed beyond the above -- the function
--    can never resolve a v_profile_id other than the calling session's own,
--    since it is derived solely from auth.uid(), never a parameter.

-- 5. Malformed write fails: call with a non-existent question id
select record_question_bank_telemetry('does-not-exist', true);
-- expect: "No practice_eligible question does-not-exist found to record
-- telemetry against (it may not exist, be inactive, or be sealed Mock
-- content)" -- the function's final UPDATE...WHERE clause is checked with
-- `if not found then raise exception`, so a zero-row match is never a
-- silent no-op, closing the one edge case this design would otherwise
-- have left unobserved.
```
