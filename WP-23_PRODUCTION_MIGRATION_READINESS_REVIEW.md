# WP-23: Production Migration and Operational Readiness Review

**Status:** Review complete. **No SQL executed. No production database changed.** Per this work package's explicit authorisation: stop for independent assurance before any production execution.
**Category:** Operational (Founder-executed) — this document reviews and prepares; it does not act.
**Governing decision:** APD-053 (Deployment Authority Separation) — this review corresponds to stage 1 (Educational Review, already complete via WP-16/17/18/19/20/21/21A/22's own reviews) feeding into stages 3-4 (Production Authorisation, Deployment Approval), neither of which this document grants.

---

## 1. The central finding: the real gap is larger than any single work package's own caveat suggested

Every WP-16 through WP-22 report in this program correctly flagged its *own* migration (010, 011) as unapplied to production. None of them checked whether migrations further back in the sequence were applied — and the project's own existing documents disagree with each other on that point:

- **`ALI_PRODUCTION_ACTIVATION_CHECKLIST.md`** states directly: "migrations 004–007 have never been applied to production."
- **`docs/operations/ALI_OPERATIONAL_VALIDATION.md`** (Phase 5B.8, dated after the checklist above) discusses `ali_question_bank` (created by migration 005) in the context of a live schema-cache error, without ever running a direct confirming query that the table exists and is reachable — the document interprets the error as "the table exists, PostgREST's cache is just stale," but does not prove that reading, and migration 005 not having run at all would produce the same PostgREST error message.
- **Migration 007's own header comment** states, as of its own authoring: "no production rows yet, per migrations 004-006's still-unapplied status" — a second, independent, in-repo confirmation that 004-006 were unapplied at that point in the project's history.
- **No document anywhere confirms migrations 008, 009, 010, or 011 have ever been applied.** No activation checklist exists for any of them.

**This sandbox cannot resolve this** — there is no outbound network route to the live Supabase project, the same standing limitation restated at every migration in this project's history. This review's most important output is therefore not a checklist to execute, but the exact diagnostic query set below, which must be run first, before any decision about executing new SQL is made.

### 1.1 Run this first — a single, read-only diagnostic (§8) establishes real current state

Rather than guess, or assume the checklist's "never applied" claim still holds 004-011, §8 below is a single consolidated, read-only query block that tells you exactly which of migrations 001-011's objects already exist in production, in one Dashboard execution, before touching anything else.

### 1.2 A separate, more urgent risk this review surfaced in passing

Migration 008's own description states it *replaces* "the hardcoded client-side PIN in `app/admin-beta`" with real Supabase-Auth-gated admin access. If the deployed application code already assumes migration 008's schema (the `is_admin` column, `is_current_user_admin()`, the 5 beta-submission tables and their RLS policies) — which is likely, since this is the only version of that code in the repository — **and migration 008 has in fact never been applied**, then `/admin-beta` and the beta-family/feedback/bug-report/testimonial submission forms could be broken in production right now, independent of anything in this Engine Integration Programme. This is outside IWP-002's scope to fix, but is flagged here because §8's diagnostic will answer it directly, and it is a materially more urgent finding than any of WP-16 through WP-22's own migrations if true.

---

## 2. Migration sequence review (001-011)

| # | File | Creates/changes | Depends on | Applied to production? |
|---|---|---|---|---|
| 001 | `001_initial_schema.sql` | `profiles`, `user_stats`, `lesson_progress` | — | **Confirmed live** — direct read/write evidence, `ALI_OPERATIONAL_VALIDATION.md` |
| 002 | `002_add_auth_user_id.sql` | `profiles.auth_user_id` | 001 | Confirmed live — real read/write evidence citing `auth_user_id`-based linking (`ALI_OPERATIONAL_VALIDATION.md` §9) |
| 003 | `003_analytics_view.sql` | 4 read-only views | 001 | Not directly evidenced in this review, but low-risk (views, no state) |
| 004 | `004_ali_subject_enum.sql` | 4 new `subject_type` enum values | 001 | **Disputed** — checklist says never applied; not independently confirmed here |
| 005 | `005_ali_question_bank.sql` | `ali_question_bank`, `ali_mastery_defaults` | 004 | **Disputed** — see §1 |
| 006 | `006_ali_student_state.sql` | `ali_student_adaptive_state`, `ali_student_question_history` | 005 | **Disputed** — see §1 |
| 007 | `007_ali_learning_unit.sql` | `ali_question_bank.learning_unit_id` | 005 | **Disputed** — see §1 |
| 008 | `008_admin_and_beta_submissions.sql` | `profiles.is_admin`, `is_current_user_admin()`, 5 beta-submission tables + RLS policies | 002 | **Unknown — see §1.2, potentially urgent** |
| 009 | `009_ali_question_metadata_extension.sql` | `ali_question_bank.addresses_misconception`, `.transfer_links` | 005 | Unknown |
| 010 | `010_ali_persistence_layer.sql` | `ali_durable_mastery`, `ali_educational_audit`, `ali_operational_events`, `ali_operational_event_aggregates` + 3 new enums | 001, 005 | **Confirmed not applied** — new this programme (WP-16), never executed |
| 011 | `011_ali_wellbeing_conclusion_type.sql` | `'wellbeing-veto'` added to `conclusion_type` | 010 | **Confirmed not applied** — new this programme (WP-21A), never executed |

---

## 3. Deployment dependency review

- **Strict linear dependency, 001 → 011** — no migration in this sequence is independent of an earlier one; each depends on at least the table or enum immediately before it.
- **Two hard transaction-isolation points, already correctly documented in each file's own header, reconfirmed here:** migration 004's four `ALTER TYPE ... ADD VALUE` statements and migration 011's one must each run in their own transaction, separate from any statement using the new value — Postgres's own limitation, not a project convention. Every migration file in this project already runs as its own separate SQL Editor execution by convention, which naturally satisfies this; the risk is only introduced if someone pastes multiple migration files together into one query window.
- **No circular or out-of-order dependency found.** Running 004 through 011 in strict numeric order (skipping any confirmed-already-applied ones per §8's diagnostic) is safe.

---

## 4. Rollback strategy verification

`ALI_PRODUCTION_ACTIVATION_CHECKLIST.md` §4 already covers 004-007 correctly (idempotent additive-only pattern throughout; migration 004's `ADD VALUE` is the one non-reversible operation in that range). Extending the same review to 008-011:

- **008**: fully reversible except the RLS policies and `is_admin` column technically *can* be dropped (`drop policy`, `alter table drop column`), but doing so after real admin/beta-submission data exists would be a data-loss decision, not a routine reversal — same posture the existing checklist already takes for `ali_question_bank` post-seeding.
- **009**: trivially reversible (`alter table ali_question_bank drop column if exists addresses_misconception, drop column if exists transfer_links`) — both columns are nullable, no backfill, no dependent object.
- **010**: tables are trivially reversible (`drop table if exists`, in reverse dependency order: `ali_operational_event_aggregates`, `ali_operational_events`, `ali_educational_audit`, `ali_durable_mastery`) — but **the three new enums created by this migration (`evidence_confidence_tier`, `conclusion_type`, `supersede_reason`) cannot have values removed**, the same Postgres limitation as migration 004. Since migration 010 creates these types fresh (not extending pre-existing ones), a full rollback of 010 could actually `drop type` cleanly, provided nothing yet depends on it — which is only true before 011 has run.
- **011**: **not reversible** at all once run — Postgres cannot remove `'wellbeing-veto'` from `conclusion_type`. Same practical implication as migration 004's own checklist note: do not run 011 unless you intend to keep it. Given the type is otherwise still new (010 must run first, same session), the pragmatic rollback path if ever needed before any real row uses `'wellbeing-veto'` is the more invasive `create type ... rename` + migrate + drop sequence the existing checklist already describes for 004, not a one-line undo.

---

## 5. Production acceptance criteria (008-011), extending the existing checklist's pattern

```sql
-- 008
select column_name from information_schema.columns
where table_name = 'profiles' and column_name = 'is_admin'; -- expect 1 row

select proname from pg_proc where proname = 'is_current_user_admin'; -- expect 1 row

select table_name from information_schema.tables
where table_schema = 'public' and table_name in
  ('feedback_submissions','bug_reports','feature_requests','beta_family_applications','testimonials');
-- expect all 5

select relrowsecurity from pg_class where relname in
  ('feedback_submissions','bug_reports','feature_requests','beta_family_applications','testimonials');
-- expect true for all 5 (the one RLS-enabled set in this whole schema)

-- 009
select column_name from information_schema.columns
where table_name = 'ali_question_bank' and column_name in ('addresses_misconception','transfer_links');
-- expect both, both nullable

-- 010
select typname from pg_type where typname in
  ('evidence_confidence_tier','conclusion_type','supersede_reason'); -- expect all 3

select table_name from information_schema.tables where table_schema = 'public' and table_name in
  ('ali_durable_mastery','ali_educational_audit','ali_operational_events','ali_operational_event_aggregates');
-- expect all 4, all with relrowsecurity = false (explicit disabled decision, WP-16)

-- 011
select enumlabel from pg_enum where enumtypid = 'public.conclusion_type'::regtype order by enumsortorder;
-- expect: mastery, durable-mastery, recommendation, readiness-dimension, wellbeing-veto (5 values)
```

---

## 6. Operational verification plan — a real structural difference from 004-007's

`ALI_PRODUCTION_ACTIVATION_CHECKLIST.md` §3 could confirm 004-007's tables were correctly created **and immediately confirm they were correctly empty** — there was no runtime code anywhere calling them yet. That is not quite true for 010/011: `lib/ali/persistence/durableMasteryStore.ts`, `auditStore.ts`, `operationalEventStore.ts`, `wellbeingAudit.ts`, and `recommendationRuntime.ts` (WP-17/18/19/21A) are real, tested runtime functions — but **none of them is called from any live route or page** (confirmed at each work package's own commit: WP-19's report states "not yet wired into any learner-facing surface"). So immediately after migration, `ali_durable_mastery`/`ali_educational_audit`/`ali_operational_events` will correctly be empty for the same reason 004-007's tables were — but this can only be *operationally* verified (a real write actually succeeding against production) once a future work package wires this runtime into a real page, which per §7 has not happened and is not authorised by this review.

**Recommended operational verification for this batch, achievable today:** confirm schema only (§5's queries), plus the standing PostgREST schema-cache reload step this project's history repeatedly needs (`ALI_OPERATIONAL_VALIDATION.md` §10's observation) — do not attempt to verify a real write/read round-trip for 010/011's tables as part of this migration's acceptance, since no code path exists yet to legitimately produce one.

---

## 7. Learner-facing release gate review

Confirmed, by re-checking every relevant work package's own stated status, that **running migrations 008-011 changes nothing about any learner's or parent's experience today**:

- WP-19's recommendation runtime is not called by `buildDailyMission` or any route.
- WP-20's proposed Knowledge Graph edges are not in `lib/ali/recommendations.ts`'s live array.
- WP-22's 112 approved questions are not imported (`WP-22_PROPOSED_IMPORT.sql` not executed, and executing it is explicitly a separate, still-outstanding decision per APD-052/§0 of this review).
- WP-21A's real wellbeing evaluator is not called by anything reachable from a real page.

This migration batch is schema-readiness only. No release gate is being crossed by applying it.

---

## 8. Diagnostic to run first — establishes real current state before anything else

```sql
-- Which ALI-related tables actually exist right now
select table_name from information_schema.tables
where table_schema = 'public' and (table_name like 'ali_%' or table_name in
  ('feedback_submissions','bug_reports','feature_requests','beta_family_applications','testimonials'))
order by table_name;

-- Which ALI-related types actually exist right now
select typname from pg_type where typname in
  ('content_difficulty','evidence_confidence_tier','conclusion_type','supersede_reason');

-- subject_type's actual current values
select enumlabel from pg_enum where enumtypid = 'public.subject_type'::regtype order by enumsortorder;

-- profiles.is_admin / admin function presence
select column_name from information_schema.columns where table_name = 'profiles' and column_name = 'is_admin';
select proname from pg_proc where proname = 'is_current_user_admin';
```

Compare the result against §2's table above before deciding which migrations (if any) still need to run, and in what order.

---

## 9. APD-036 Operational Readiness Gate — confirmed satisfied

APD-036 required WP-16 to complete verification and programme review before any other work package commenced. Confirmed: WP-16 was reviewed and approved (commit history, this programme's own record) before WP-17 began, and every subsequent work package followed the same gate discipline through WP-22. This review finds no violation of APD-036 anywhere in the sequence reviewed.

---

## 10. Deployment Authority Separation (APD-053) — where this review sits

This document completes **stage 1 (Educational Review)** of APD-053's six stages, for the migration/deployment dimension specifically (the educational content dimension was already completed by WP-22). It does **not** grant stage 3 (Production Authorisation) or stage 4 (Deployment Approval) — those remain distinct, future Founder decisions, to be made only after §1.1/§8's diagnostic has established real current state.

---

**No SQL was executed in producing this review. No production database was changed.**
