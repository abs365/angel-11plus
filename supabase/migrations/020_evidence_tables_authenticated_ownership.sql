-- Angel Digital 11+ — Migration 020 (REVISED, APPLIED 2026-07-23)
-- ARCH-001 evidence/content table RLS correction.
--
-- SUPERSEDES the original migration 020 draft, which was withdrawn before
-- ever being applied — see ARCH-001_MIGRATION_020_READINESS_REVIEW.md for
-- the full per-table analysis this revision is based on. Do not restore
-- or reuse the original draft.
--
-- Confirmed via live production queries before this was applied:
--   - 5 of 7 originally-targeted tables had 0 rows — no continuity risk.
--   - user_stats / lesson_progress already had LIVE policies, but they
--     were unconditional (WITH CHECK (true)) — this migration replaces
--     them, it does not merely add alongside them (Postgres OR's
--     permissive policies together; adding without dropping would leave
--     the old unconditional policy fully in force — a real defect caught
--     in the original draft before it was ever applied).
--   - ali_operational_events / ali_operational_event_aggregates are
--     excluded entirely — their only 3 call sites (lib/ali/persistence/
--     operationalEventStore.ts) are dormant (no live caller anywhere in
--     the app), and 2 of the 3 are inherently cross-learner operations
--     that don't fit a per-row ownership policy. RLS remains enabled with
--     zero policies for both, unchanged from their prior state.
--   - ali_question_bank / ali_mastery_defaults are included in this
--     migration's scope (not in the original draft) since they were
--     found to share the identical 0-policy defect and are pure content.
--
-- Applied 2026-07-23 via Supabase Dashboard > SQL Editor, wrapped in a
-- single transaction. Post-execution live verification (fresh
-- authenticated learner writes; cross-identity denial on read/insert/
-- update; anon + authenticated content-table reads; anon/authenticated
-- write denial on content tables; row-count integrity) all passed — see
-- ARCH-001_ED-001_IDENTITY_CORRECTION_IMPLEMENTATION.md's Gate log.

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
-- ali_student_adaptive_state (profile_id, primary key) — 0 rows at time of application
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
-- ali_student_question_history (profile_id) — 0 rows at time of application
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
-- ali_durable_mastery (profile_id) — 0 rows at time of application
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
-- ali_educational_audit (learner_id — different column name, same
-- pattern) — 0 rows at time of application. Append-only by convention
-- (APD-029) — the app only ever updates superseded_by / supersede_reason
-- on an existing row (lib/ali/audit.ts); RLS only needs to enforce row
-- ownership, not column scoping.
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
-- anon + authenticated SELECT only. No INSERT/UPDATE/DELETE policy for
-- any browser role — these are migration-seeded content tables; the app
-- never writes to them from the browser.
-- ============================================================
drop policy if exists ali_question_bank_select_all on public.ali_question_bank;
create policy ali_question_bank_select_all on public.ali_question_bank for select to anon, authenticated
  using (true);

drop policy if exists ali_mastery_defaults_select_all on public.ali_mastery_defaults;
create policy ali_mastery_defaults_select_all on public.ali_mastery_defaults for select to anon, authenticated
  using (true);

-- ============================================================
-- Deliberately NOT included in this migration:
--   - ali_operational_events / ali_operational_event_aggregates — RLS
--     remains enabled with zero policies (their state before and after
--     this migration is identical). No live caller exists for either
--     table today; if lib/ali/persistence/operationalEventStore.ts is
--     ever wired into a live page, its access model needs its own,
--     separate review — it is not a per-learner ownership pattern.
-- ============================================================

-- No DELETE policy on any table above — nothing in the live-wired app
-- ever deletes these rows client-side.

-- ============================================================
-- ROLLBACK (manual only — not executed automatically)
-- ============================================================
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
