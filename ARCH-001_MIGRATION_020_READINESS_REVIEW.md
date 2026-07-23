# ARCH-001 — Migration 020 Readiness Review & Revised Proposal

**Status: review only. No SQL applied. Migration 020 as originally drafted is withdrawn and superseded by the revised version in Section 5.**

Brought forward per Founder instruction, ahead of the original Gate 8 sequencing, after Gate 4's pre-deploy checks surfaced that all 7 of migration 020's target tables (plus `ali_question_bank` and `ali_mastery_defaults`) already have RLS **enabled** with **zero policies** — a pre-existing condition, confirmed live (see the Gate 3/4 findings in `ARCH-001_ED-001_IDENTITY_CORRECTION_IMPLEMENTATION.md`), independent of anything committed today.

---

## 1. Method

For every table migration 020 could plausibly touch, four things were established from primary sources — not assumed:

1. **Live row counts** (production, `Role: postgres`, bypasses RLS) — establishes whether "existing learner continuity" is a real constraint or moot.
2. **Every application call site** (`grep` across the full repo for `.from("<table>")`), read directly, to determine actual read/write shape, ownership column, and whether any admin/service-role path exists.
3. **Current live policies** (`pg_policies`, full `qual`/`with_check` text, not just names) — to check for pre-existing patterns that a new migration must explicitly replace, not just add alongside.
4. Cross-checked against `app/api/*` for any `service_role`/server-side path. **None exists anywhere in this codebase** — every read/write to every table in this review goes through the ordinary browser client (`anon` or `authenticated` role). There is no admin/service-role carve-out to design for.

## 2. Live row counts (2026-07-23, production)

| Table | Rows | Continuity risk |
|---|---|---|
| `user_stats` | 5 | Real — has live data via existing (flawed, see §3) policies |
| `lesson_progress` | 22 | Real — same |
| `ali_student_adaptive_state` | 0 | **None** — table has never successfully accepted a write |
| `ali_student_question_history` | 0 | **None** |
| `ali_durable_mastery` | 0 | **None** |
| `ali_educational_audit` | 0 | **None** |
| `ali_operational_events` | 0 | **None** |
| `ali_operational_event_aggregates` | 0 | **None** |
| `ali_question_bank` | 29 | N/A — content, not learner data |
| `ali_mastery_defaults` | 4 | N/A — content, not learner data |

**This is the single biggest simplification**: 5 of the 7 original migration 020 tables have zero rows. There is no existing learner data to preserve or migrate for them — the only design question is what the policy should be going forward, not how to avoid breaking something that already works.

## 3. Existing policy defect found on `user_stats` / `lesson_progress` (not previously disclosed)

Both tables already have live, working policies — but reading their actual `qual`/`with_check` text (not just their names) shows:

```
lesson_progress_allow_anonymous_insert  INSERT  {anon,authenticated}  WITH CHECK (true)
lesson_progress_allow_anonymous_update  UPDATE  {anon,authenticated}  USING (true) WITH CHECK (true)
user_stats_allow_anonymous_insert       INSERT  {anon,authenticated}  WITH CHECK (true)
user_stats_allow_anonymous_update       UPDATE  {anon,authenticated}  USING (true) WITH CHECK (true)
```

`true` with no ownership condition — **any** `anon` or `authenticated` caller can insert or overwrite **any** row in either table today, regardless of whose `profile_id` it is. This is the exact same class of defect ED-001/migration 019 fixed for `profiles` (permissive, unconditional policies providing no real ownership boundary), just never previously caught for these two tables.

**Critical catch for this revision**: my original migration 020 draft added new `_select_own`/`_insert_own`/`_update_own` policies for these two tables but never dropped the old `_allow_anonymous_*` ones. Postgres OR's all applicable permissive policies together — leaving the old `WITH CHECK (true)` policy in place would have meant **the new ownership policies changed nothing**: any caller could still write any row via the untouched old policy alone. The revised migration (§5) explicitly drops both old policies before adding the new ones.

## 4. Per-table analysis

| Table | Reads/writes in app | Owner column | Live-wired? | Required policies |
|---|---|---|---|---|
| `user_stats` | `lib/supabaseProgress.ts` (upsert on lesson completion / full sync) | `profile_id` | Yes | SELECT/INSERT/UPDATE, own row only — **replace**, not add to, existing policies |
| `lesson_progress` | `lib/supabaseProgress.ts`, `lib/migrateProgress.ts` (insert only) | `profile_id` | Yes | SELECT/INSERT, own row only — **replace** existing policies (no UPDATE call site found — omit) |
| `ali_student_adaptive_state` | `lib/ali/history.ts` (select/insert/update, keyed by `profile_id`) | `profile_id` (PK) | Yes | SELECT/INSERT/UPDATE, own row only |
| `ali_student_question_history` | `lib/ali/history.ts`, `lib/ali/persistence/{recommendationRuntime,educationalStateRuntime,competencyEvidence}.ts`, `lib/learningEngine/{evidence,activity}.ts` (select/insert/upsert/update, all keyed by `profile_id`) | `profile_id` | Yes | SELECT/INSERT/UPDATE, own row only |
| `ali_durable_mastery` | `lib/ali/persistence/durableMasteryStore.ts` (select/upsert, keyed by `profile_id`) | `profile_id` | Yes | SELECT/INSERT/UPDATE, own row only |
| `ali_educational_audit` | `lib/ali/persistence/auditStore.ts` (insert, select, and an update limited to `superseded_by`/`supersede_reason` — the append-only supersede pattern), keyed by `learner_id` | `learner_id` | Yes | SELECT/INSERT/UPDATE, own row only (update scope is already app-enforced to 2 columns; RLS only needs row ownership, not column scoping) |
| `ali_operational_events` | `lib/ali/persistence/operationalEventStore.ts`: `insertOperationalEvent()` (per-learner insert), `fetchAllOperationalEvents()` (reads **all rows, unscoped**), `applyRetentionPartition()` (deletes **all rows below a timestamp, unscoped**) | `learner_id` on insert; the other two functions are not row-scoped at all | **No** — none of these 3 functions has any caller anywhere in the app (`grep` for each function name returns only this file and a design doc) | **None, this migration.** See §4a. |
| `ali_operational_event_aggregates` | Only touched by `applyRetentionPartition()` (upsert) — same dormant module, no learner_id column at all (cross-learner summary data by design) | none | **No** | **None, this migration.** |
| `ali_question_bank` | `lib/ali/questionBank.ts` (`fetchQuestionBank`), `lib/ali/config.ts`-adjacent reads, `app/admin-beta/page.tsx` (incidental content check) — all read-only, no learner scoping (it's content) | none (content table) | Yes — read by every `/mocks/adaptive/*` page and `/learning-intelligence/mock-exam` | SELECT only, no ownership — see §4b for role scope |
| `ali_mastery_defaults` | `lib/ali/config.ts` (`fetchMasteryDefaults`, has a documented hardcoded fallback if the read fails) | none (content table) | Yes, with graceful degradation already in place | SELECT only, no ownership |

### 4a. `ali_operational_events` / `ali_operational_event_aggregates` — recommend excluding from this migration entirely

This is a genuine, non-obvious finding: the only three functions that touch these two tables (`insertOperationalEvent`, `fetchAllOperationalEvents`, `applyRetentionPartition`, all in `lib/ali/persistence/operationalEventStore.ts`) are **dormant** — built (WP-17/IWP-002) but never called from any page or route. `fetchAllOperationalEvents` reads every row for every learner with no scoping at all, and `applyRetentionPartition` deletes across all learners by timestamp — neither fits a per-learner `authenticated` ownership policy at all; if this module is ever activated, it needs its own access-model decision (most plausibly a scheduled job under `service_role`, not per-user RLS), which is out of scope for "give every learner access to their own row."

**Recommendation**: leave RLS enabled with no policies on both tables (current state, unchanged) until this module has a live caller and its own access-model review. Do not add speculative policies for code that isn't wired in — consistent with not designing for hypothetical requirements.

### 4b. `ali_question_bank` / `ali_mastery_defaults` — recommend `anon, authenticated` SELECT, not `authenticated`-only

Both are pure content/reference tables — no personal data, no per-row ownership concept. Two reasons to allow `anon` as well as `authenticated`:
- No privacy or security cost — this is exam-prep question content, not learner data.
- Removes a race-condition risk: `AuthProvider`'s bootstrap (`ensureLearnerSession()`) and a page's own content fetch (e.g. `fetchQuestionBank()` on mount) are not sequenced against each other. If a page's fetch runs before the anonymous sign-in resolves, an `authenticated`-only policy would silently return zero content for that render (the exact failure mode already found in Gate 4's investigation). `anon, authenticated` avoids this entirely, with no downside given the content is non-sensitive.

## 5. Revised migration proposal

Key differences from the original `supabase/migrations/020_evidence_tables_authenticated_ownership.sql`:
1. Explicitly **drops** `user_stats`/`lesson_progress`'s old `_allow_anonymous_insert/update` policies before creating the new ownership-scoped ones (§3's fix).
2. Drops the UPDATE policy claim for `lesson_progress` — no code path updates it, only inserts (`INSERT` only, matching actual usage; omitting unused policy surface is not a functional gap since nothing calls it).
3. **Excludes** `ali_operational_events` / `ali_operational_event_aggregates` entirely (§4a) — no policy added, no RLS state change, left exactly as-is pending a real access-model decision if that module is ever activated.
4. **Adds** `ali_question_bank` / `ali_mastery_defaults` SELECT policies, scoped to `anon, authenticated` (§4b) — these were never in the original migration 020's scope at all, but are part of the same underlying defect (0 policies, confirmed broken for real anon reads) and are pure content, safe to open broadly.

```sql
-- Angel Digital 11+ — Migration 020 (REVISED)
-- ARCH-001 evidence/content table RLS correction — supersedes the
-- original 020 draft (see ARCH-001_MIGRATION_020_READINESS_REVIEW.md
-- for the full per-table analysis this revision is based on).
--
-- Confirmed via live production queries before this was written:
--   - 5 of 7 originally-targeted tables have 0 rows — no continuity risk.
--   - user_stats / lesson_progress already have LIVE policies, but they
--     are unconditional (WITH CHECK (true)) — this migration replaces
--     them, it does not merely add alongside them (Postgres OR's
--     permissive policies together; adding without dropping would leave
--     the old unconditional policy fully in force).
--   - ali_operational_events / ali_operational_event_aggregates are
--     excluded entirely — their only 3 call sites are dormant (no live
--     caller anywhere in the app), and 2 of the 3 are inherently
--     cross-learner operations that don't fit a per-row ownership policy.
--   - ali_question_bank / ali_mastery_defaults are added to this
--     migration's scope (not in the original draft) since they were
--     found to share the identical 0-policy defect and are pure content.
--
-- Run this in: Supabase Dashboard > SQL Editor > New query

-- ============================================================
-- user_stats — replace the existing unconditional policies
-- ============================================================
drop policy if exists user_stats_allow_anonymous_insert on public.user_stats;
drop policy if exists user_stats_allow_anonymous_update on public.user_stats;

drop policy if exists user_stats_select_own on public.user_stats;
create policy user_stats_select_own on public.user_stats for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()));

drop policy if exists user_stats_insert_own on public.user_stats;
create policy user_stats_insert_own on public.user_stats for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()));

drop policy if exists user_stats_update_own on public.user_stats;
create policy user_stats_update_own on public.user_stats for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()));

-- ============================================================
-- lesson_progress — replace the existing unconditional policies
-- Only INSERT is used anywhere in the app (lib/supabaseProgress.ts,
-- lib/migrateProgress.ts) — no UPDATE policy added since nothing calls it.
-- ============================================================
drop policy if exists lesson_progress_allow_anonymous_insert on public.lesson_progress;
drop policy if exists lesson_progress_allow_anonymous_update on public.lesson_progress;

drop policy if exists lesson_progress_select_own on public.lesson_progress;
create policy lesson_progress_select_own on public.lesson_progress for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()));

drop policy if exists lesson_progress_insert_own on public.lesson_progress;
create policy lesson_progress_insert_own on public.lesson_progress for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()));

-- ============================================================
-- ali_student_adaptive_state (profile_id, primary key) — 0 rows today
-- ============================================================
alter table public.ali_student_adaptive_state enable row level security; -- already enabled; no-op, kept for explicitness

drop policy if exists ali_student_adaptive_state_select_own on public.ali_student_adaptive_state;
create policy ali_student_adaptive_state_select_own on public.ali_student_adaptive_state for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()));
drop policy if exists ali_student_adaptive_state_insert_own on public.ali_student_adaptive_state;
create policy ali_student_adaptive_state_insert_own on public.ali_student_adaptive_state for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()));
drop policy if exists ali_student_adaptive_state_update_own on public.ali_student_adaptive_state;
create policy ali_student_adaptive_state_update_own on public.ali_student_adaptive_state for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()));

-- ============================================================
-- ali_student_question_history (profile_id) — 0 rows today
-- ============================================================
alter table public.ali_student_question_history enable row level security;

drop policy if exists ali_student_question_history_select_own on public.ali_student_question_history;
create policy ali_student_question_history_select_own on public.ali_student_question_history for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()));
drop policy if exists ali_student_question_history_insert_own on public.ali_student_question_history;
create policy ali_student_question_history_insert_own on public.ali_student_question_history for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()));
drop policy if exists ali_student_question_history_update_own on public.ali_student_question_history;
create policy ali_student_question_history_update_own on public.ali_student_question_history for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()));

-- ============================================================
-- ali_durable_mastery (profile_id) — 0 rows today
-- ============================================================
alter table public.ali_durable_mastery enable row level security;

drop policy if exists ali_durable_mastery_select_own on public.ali_durable_mastery;
create policy ali_durable_mastery_select_own on public.ali_durable_mastery for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()));
drop policy if exists ali_durable_mastery_insert_own on public.ali_durable_mastery;
create policy ali_durable_mastery_insert_own on public.ali_durable_mastery for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()));
drop policy if exists ali_durable_mastery_update_own on public.ali_durable_mastery;
create policy ali_durable_mastery_update_own on public.ali_durable_mastery for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()));

-- ============================================================
-- ali_educational_audit (learner_id) — 0 rows today. Append-only by
-- convention (APD-029) — the app only ever updates superseded_by /
-- supersede_reason on an existing row (lib/ali/audit.ts); RLS only needs
-- to enforce row ownership, not column scoping.
-- ============================================================
alter table public.ali_educational_audit enable row level security;

drop policy if exists ali_educational_audit_select_own on public.ali_educational_audit;
create policy ali_educational_audit_select_own on public.ali_educational_audit for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = learner_id and p.auth_user_id = auth.uid()));
drop policy if exists ali_educational_audit_insert_own on public.ali_educational_audit;
create policy ali_educational_audit_insert_own on public.ali_educational_audit for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = learner_id and p.auth_user_id = auth.uid()));
drop policy if exists ali_educational_audit_update_own on public.ali_educational_audit;
create policy ali_educational_audit_update_own on public.ali_educational_audit for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = learner_id and p.auth_user_id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = learner_id and p.auth_user_id = auth.uid()));

-- ============================================================
-- ali_question_bank / ali_mastery_defaults — pure content, no ownership.
-- anon + authenticated SELECT (see §4b for why anon is included).
-- No INSERT/UPDATE policy — these are migration-seeded content tables;
-- the app never writes to them.
-- ============================================================
drop policy if exists ali_question_bank_select_all on public.ali_question_bank;
create policy ali_question_bank_select_all on public.ali_question_bank for select to anon, authenticated
  using (true);

drop policy if exists ali_mastery_defaults_select_all on public.ali_mastery_defaults;
create policy ali_mastery_defaults_select_all on public.ali_mastery_defaults for select to anon, authenticated
  using (true);

-- ============================================================
-- Deliberately NOT included in this migration:
--   - ali_operational_events / ali_operational_event_aggregates (§4a) —
--     RLS remains enabled with zero policies, i.e. fully locked down,
--     exactly its current state. No behaviour change for these two.
-- ============================================================

-- No DELETE policy on any table above — nothing in the (live-wired) app
-- ever deletes these rows client-side.

-- ============================================================
-- LIVE TEST CASES to run after applying (mirrors Gate 5/6's method:
-- direct signInAnonymously() + rpc/from() calls against production,
-- never through real family data):
--
-- 1. Fresh authenticated identity, own profile_id:
--      insert into ali_student_question_history ... -> succeeds (200)
--      select same row back -> succeeds, 1 row
-- 2. A second, different authenticated identity:
--      select the first identity's row -> 0 rows (not an error)
--      update the first identity's row -> 0 rows affected
-- 3. Bare anon (no session):
--      insert into ali_student_question_history -> 42501 (unchanged
--      from today, still no anon path — this migration doesn't touch
--      anon on the 5 evidence tables, only on the 2 content tables)
-- 4. anon (no session) SELECT on ali_question_bank -> 200, real rows
--    (this is the fix for the /mocks/adaptive/* empty-pool defect)
-- 5. Re-run the exact fresh-identity flow from Gate 5/6 end-to-end
--    (sign in -> ensureProfile -> complete one practice question) and
--    confirm the full evidence chain (Student Question History ->
--    Educational Audit -> Readiness History) now writes successfully,
--    where it previously failed with 42501.
-- ============================================================

-- ============================================================
-- ROLLBACK (manual only)
-- ============================================================
-- -- user_stats / lesson_progress: restore original permissive policies
-- drop policy if exists user_stats_select_own on public.user_stats;
-- drop policy if exists user_stats_insert_own on public.user_stats;
-- drop policy if exists user_stats_update_own on public.user_stats;
-- create policy user_stats_allow_anonymous_insert on public.user_stats for insert to anon, authenticated with check (true);
-- create policy user_stats_allow_anonymous_update on public.user_stats for update to anon, authenticated using (true) with check (true);
--
-- drop policy if exists lesson_progress_select_own on public.lesson_progress;
-- drop policy if exists lesson_progress_insert_own on public.lesson_progress;
-- create policy lesson_progress_allow_anonymous_insert on public.lesson_progress for insert to anon, authenticated with check (true);
-- create policy lesson_progress_allow_anonymous_update on public.lesson_progress for update to anon, authenticated using (true) with check (true);
--
-- -- The 5 ali_* evidence-table policies + the 2 content-table policies:
-- -- dropping them returns those tables to "RLS enabled, zero policies"
-- -- (today's exact state) — safe, since all 5 evidence tables have 0 rows.
-- drop policy if exists ali_student_adaptive_state_select_own on public.ali_student_adaptive_state;
-- drop policy if exists ali_student_adaptive_state_insert_own on public.ali_student_adaptive_state;
-- drop policy if exists ali_student_adaptive_state_update_own on public.ali_student_adaptive_state;
-- drop policy if exists ali_student_question_history_select_own on public.ali_student_question_history;
-- drop policy if exists ali_student_question_history_insert_own on public.ali_student_question_history;
-- drop policy if exists ali_student_question_history_update_own on public.ali_student_question_history;
-- drop policy if exists ali_durable_mastery_select_own on public.ali_durable_mastery;
-- drop policy if exists ali_durable_mastery_insert_own on public.ali_durable_mastery;
-- drop policy if exists ali_durable_mastery_update_own on public.ali_durable_mastery;
-- drop policy if exists ali_educational_audit_select_own on public.ali_educational_audit;
-- drop policy if exists ali_educational_audit_insert_own on public.ali_educational_audit;
-- drop policy if exists ali_educational_audit_update_own on public.ali_educational_audit;
-- drop policy if exists ali_question_bank_select_all on public.ali_question_bank;
-- drop policy if exists ali_mastery_defaults_select_all on public.ali_mastery_defaults;
```

## 6. Policy matrix summary

| Table | anon SELECT | authenticated SELECT (own) | authenticated INSERT (own) | authenticated UPDATE (own) | Change from original 020 draft |
|---|---|---|---|---|---|
| `user_stats` | — | ✅ | ✅ | ✅ | Now **replaces** (drops) the old unconditional policies |
| `lesson_progress` | — | ✅ | ✅ | — (unused) | Now **replaces** old policies; UPDATE dropped (no caller) |
| `ali_student_adaptive_state` | — | ✅ | ✅ | ✅ | Unchanged from original draft |
| `ali_student_question_history` | — | ✅ | ✅ | ✅ | Unchanged |
| `ali_durable_mastery` | — | ✅ | ✅ | ✅ | Unchanged |
| `ali_educational_audit` | — | ✅ | ✅ | ✅ | Unchanged |
| `ali_operational_events` | — | — | — | — | **Removed from scope** (§4a) |
| `ali_operational_event_aggregates` | — | — | — | — | **Removed from scope** (§4a) |
| `ali_question_bank` | ✅ | ✅ | — | — | **New** — not in original draft |
| `ali_mastery_defaults` | ✅ | ✅ | — | — | **New** — not in original draft |

## 7. Recommendation

Apply the revised migration in §5 — but this is a proposal for approval, not an application. Per standing instruction, no SQL from this document is to be run until explicitly approved. Once approved, applying it and then re-running Gate 5/6-style live verification (§5's "LIVE TEST CASES") against the real evidence-writing chain is what should gate Gate 7, consistent with the instruction that Gate 7 not be described as failed while this defect remains open and unaddressed.
