-- Angel Digital 11+ — Migration 022
-- Family Choice Pilot — controlled implementation increment
-- (knowledge/angel-assessment-transformation-programme/programme-001/
-- release-1/family-choice-pilot/FAMILY_CHOICE_PILOT_IMPLEMENTATION_REPORT.md)
--
-- Persists the single provenance fact the pilot's choice-injection point
-- needs: which competency (if any) a family has actively chosen as their
-- focus, alongside — never replacing — Angel's own evidence-based
-- recommendation (computed live, never stored, by
-- lib/ali/persistence/recommendationRuntime.ts, unmodified).
--
-- One row per profile (pilot scope: exactly one active chosen focus at a
-- time — the "single-competency, controlled-surface" increment the
-- Founder approved, per IMPLEMENTATION_DEPENDENCY_AND_GATE_REPORT.md §4).
-- Re-selecting updates the existing row (upsert) rather than accumulating
-- history rows; `active`/`removed_at` preserve enough provenance for this
-- pilot's scope (source, selection time, active state) without a
-- parallel profile or full audit-log system, per the governing
-- instruction's "no parallel profile system" constraint.
--
-- Additive-only. Does not alter ali_question_bank, ali_student_question_
-- history, ali_durable_mastery, ali_educational_audit, or any existing
-- recommendation/wellbeing table.
-- Run this in: Supabase Dashboard > SQL Editor > New query

create table if not exists public.ali_family_focus_selection (
  profile_id       uuid not null references public.profiles(id) on delete cascade,
  competency_code  text not null,
  -- Fixed to 'family-selected' for this pilot (the only source this table
  -- ever writes) — a plain text column, not an enum, so a future increment
  -- (e.g. an Angel-suggested-then-confirmed provenance) can be added
  -- without a migration, matching ali_student_question_history.source's
  -- own established "plain, open-ended text by design" convention.
  source           text not null default 'family-selected',
  active           boolean not null default true,
  selected_at      timestamptz not null default now(),
  removed_at       timestamptz,
  updated_at       timestamptz not null default now(),
  constraint ali_family_focus_selection_pk primary key (profile_id)
);

create index if not exists ali_family_focus_selection_active_idx
  on public.ali_family_focus_selection (profile_id) where active;

-- ============================================================
-- ROW LEVEL SECURITY — authenticated-owner pattern, exactly matching
-- migration 020's ali_durable_mastery policy (the established convention
-- for every per-learner table created since that correction).
-- ============================================================
alter table public.ali_family_focus_selection enable row level security;

drop policy if exists ali_family_focus_selection_select_own on public.ali_family_focus_selection;
create policy ali_family_focus_selection_select_own on public.ali_family_focus_selection for select to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()));

drop policy if exists ali_family_focus_selection_insert_own on public.ali_family_focus_selection;
create policy ali_family_focus_selection_insert_own on public.ali_family_focus_selection for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()));

drop policy if exists ali_family_focus_selection_update_own on public.ali_family_focus_selection;
create policy ali_family_focus_selection_update_own on public.ali_family_focus_selection for update to authenticated
  using (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()))
  with check (exists (select 1 from public.profiles p where p.id = profile_id and p.auth_user_id = auth.uid()));

-- No DELETE policy — removal is modelled as active = false / removed_at
-- set (an update), never a row delete, so provenance is never lost.

drop trigger if exists ali_family_focus_selection_updated_at on public.ali_family_focus_selection;
create trigger ali_family_focus_selection_updated_at
  before update on public.ali_family_focus_selection
  for each row execute function public.set_updated_at();

-- ============================================================
-- ROLLBACK (manual only — not executed automatically)
-- ============================================================
-- drop trigger if exists ali_family_focus_selection_updated_at on public.ali_family_focus_selection;
-- drop policy if exists ali_family_focus_selection_select_own on public.ali_family_focus_selection;
-- drop policy if exists ali_family_focus_selection_insert_own on public.ali_family_focus_selection;
-- drop policy if exists ali_family_focus_selection_update_own on public.ali_family_focus_selection;
-- drop table if exists public.ali_family_focus_selection;
