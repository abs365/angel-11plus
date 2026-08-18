-- Angel Digital 11+ — Migration 072
-- Programme Increment 008E — Secure Mock Experience Integration and
-- Reporting Foundation.
--
-- Purely additive. Does NOT modify, redefine, or replace any of the 5
-- SECURITY DEFINER functions from migration 070 (mock_create_attempt,
-- mock_start_attempt, mock_get_question, mock_submit_answer,
-- mock_submit_attempt), any policy from 070/071, or any column of
-- ali_mock_form / ali_mock_attempt / ali_mock_attempt_answer. This is a
-- deliberate constraint, not an oversight: 008E's own directive requires
-- "do not weaken, bypass, duplicate or redesign the proven 008D security
-- architecture." Everything here is a new table, a new trigger on
-- ali_mock_attempt (fires only on the pre-existing status column, adds a
-- row elsewhere, never mutates ali_mock_attempt itself), or a new
-- function with its own new name.
--
-- WHAT THIS SOLVES
--
-- Problem 1 — no learner-facing discovery path exists. Migration 071
-- dropped ali_mock_form_select_all entirely (Decision 90/91, correctly —
-- question_manifest is sealed structure). But that means, as of 071, a
-- client has no way to learn which form_id to pass to
-- mock_create_attempt() at all — not even "is a Mock currently
-- available." mock_get_active_form() below closes that gap with the same
-- hand-picked-projection discipline mock_get_question() already
-- established: it returns only { form_id, attempt_type } for the most
-- recent active form matching the requested attempt_type — never
-- question_manifest, never any question content. Knowing a form's own id
-- is not sealed information (the client must already possess it to call
-- mock_create_attempt); the manifest inside it is what stays sealed, and
-- this function never touches that column at all.
--
-- Problem 1b — once an attempt exists, the client still has no RPC that
-- returns its own assigned_question_ids in order. RLS already permits an
-- authenticated learner to read this column directly (ali_mock_attempt's
-- own read-your-own policy, migration 070, is a full-row policy with no
-- column restriction) -- assigned_question_ids is a frozen ID array on
-- an attempt the learner already owns, not the sealed form manifest
-- (Layer 2 protects the FORM's question_manifest before an attempt
-- exists; a learner's own already-assigned question order is a
-- different, already-permitted read). mock_get_attempt_manifest() below
-- is added anyway, rather than having the client call
-- `.from("ali_mock_attempt")` directly, purely to preserve this
-- codebase's own documented convention (lib/mockAttempt/client.ts's own
-- header comment: "every read/write goes through supabase.rpc(), never
-- a direct .from() query") -- one consistent access pattern for every
-- Mock interaction, not a new security boundary.
--
-- Problem 2 — no server-controlled flag state exists for a genuine Part 5
-- (008V) review/flag screen. ali_mock_attempt_flag + mock_set_flag()
-- below extend the exact same pattern mock_submit_answer() already uses
-- (ownership, in_progress, not expired, question-in-manifest), so a
-- flag is exactly as server-authoritative and exactly as recoverable
-- across a refresh as an answer already is.
--
-- Problem 3 — 008D's own migration 070 comment already named this gap
-- directly: "No scoring happens here -- 008E's own delayed-report
-- pipeline owns scoring/diagnostic analysis, deliberately not built in
-- 008D." 008E's directive itself repeats the same boundary: "The system
-- must not assume that submission and full diagnostic feedback are
-- necessarily the same event." ali_mock_attempt_report below is the
-- reserved shape for that future pipeline's output (scoring_state,
-- analysis_state, report_release_state, and nullable JSON/text columns
-- for every field 008E's own directive names: overall performance,
-- subject breakdown, question-level outcome, competency evidence,
-- strengths, weaknesses, timing evidence, Practice-vs-Mock comparison,
-- parent explanation). No scoring or analysis logic is implemented here
-- — every data column stays null, every state column stays at its
-- 'not_started'/'pending' default, until a dedicated future increment
-- builds the actual pipeline. This migration establishes the
-- ARCHITECTURE 008E's directive asks for, not the computation.
--
-- A lightweight AFTER UPDATE trigger on ali_mock_attempt creates the
-- report row (all defaults, no data) the moment status transitions to
-- 'submitted' — proving structurally that submission and report
-- availability are two different events, without touching
-- mock_submit_attempt() itself.
--
-- CONTENT BOUNDARY: this migration seeds no real Mock content, creates
-- no form, and does not change any ali_question_bank.eligibility_status.
-- Mock Eligible remains 0 after this migration exactly as before it.
--
-- Idempotent: every CREATE uses IF NOT EXISTS / OR REPLACE / DROP...IF
-- EXISTS, matching this repository's own established convention.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 069-071
-- have already been applied (confirmed, Decisions 87/89/91).

begin;

-- === Table: ali_mock_attempt_flag ==================================

create table if not exists public.ali_mock_attempt_flag (
  attempt_id uuid not null references public.ali_mock_attempt(id),
  question_id text not null,
  flagged_at timestamptz not null default now(),
  primary key (attempt_id, question_id)
);

alter table public.ali_mock_attempt_flag enable row level security;

drop policy if exists ali_mock_attempt_flag_select_own on public.ali_mock_attempt_flag;
create policy ali_mock_attempt_flag_select_own on public.ali_mock_attempt_flag for select to authenticated
  using (attempt_id in (
    select id from public.ali_mock_attempt
    where profile_id in (select id from public.profiles where auth_user_id = auth.uid())
  ));
-- No insert/update/delete policy for anon/authenticated -- all mutation
-- happens exclusively through mock_set_flag() below, matching migration
-- 070's own established discipline for ali_mock_attempt_answer.

-- === Table: ali_mock_attempt_report ================================

create table if not exists public.ali_mock_attempt_report (
  attempt_id uuid primary key references public.ali_mock_attempt(id),
  scoring_state text not null default 'not_started' check (scoring_state in ('not_started', 'scoring', 'scored', 'failed')),
  analysis_state text not null default 'not_started' check (analysis_state in ('not_started', 'analysing', 'complete', 'failed')),
  report_release_state text not null default 'pending' check (report_release_state in ('pending', 'released')),
  -- Every column below is the reserved shape for 008E's own required
  -- result data contract (directive Part 7). All remain null until a
  -- future scoring/analysis increment populates them -- this migration
  -- invents no readiness percentage, no score, no empirical claim.
  overall jsonb,
  subject_breakdown jsonb,
  question_outcomes jsonb,
  competency_evidence jsonb,
  strengths jsonb,
  weaknesses jsonb,
  timing_evidence jsonb,
  practice_comparison jsonb,
  parent_explanation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ali_mock_attempt_report enable row level security;

-- Sealed until released -- deliberately stronger than "read your own":
-- the WHOLE row is invisible to the owning learner until
-- report_release_state = 'released', so an in-progress scoring/analysis
-- pipeline can never be read mid-computation regardless of what the
-- client asks for. The learner-facing "your report is being prepared"
-- state is derived instead from ali_mock_attempt.status = 'submitted'
-- (already readable via migration 070's own ali_mock_attempt_select_own
-- policy) -- no relaxation of this table's own RLS is needed to support
-- that UI state.
drop policy if exists ali_mock_attempt_report_select_released on public.ali_mock_attempt_report;
create policy ali_mock_attempt_report_select_released on public.ali_mock_attempt_report for select to authenticated
  using (
    report_release_state = 'released'
    and attempt_id in (
      select id from public.ali_mock_attempt
      where profile_id in (select id from public.profiles where auth_user_id = auth.uid())
    )
  );
-- No insert/update/delete policy for anon/authenticated -- every row is
-- created by the trigger below (SECURITY DEFINER context) and would be
-- mutated only by a future scoring/analysis pipeline's own SECURITY
-- DEFINER function(s), not built in this increment.

-- === Trigger: report-row initialisation on submission ===============
--
-- Fires only on the pre-existing ali_mock_attempt.status column, and
-- only on the transition INTO 'submitted' (never re-fires on a second
-- update to an already-submitted row, via the IS DISTINCT FROM guard).
-- Inserts a bare report row (all defaults) -- proves structurally that
-- "submitted" and "report available" are different events, without ever
-- touching mock_submit_attempt() itself.
create or replace function public.mock_attempt_report_init()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'submitted' and (old.status is distinct from 'submitted') then
    insert into public.ali_mock_attempt_report (attempt_id)
    values (new.id)
    on conflict (attempt_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists mock_attempt_report_init_trigger on public.ali_mock_attempt;
create trigger mock_attempt_report_init_trigger
  after update on public.ali_mock_attempt
  for each row execute function public.mock_attempt_report_init();

-- === Function: mock_get_active_form ==================================
--
-- The learner-discovery gap named above. Hand-picked projection, same
-- discipline as mock_get_question(): returns only form_id and
-- attempt_type, never question_manifest. Returns zero rows if no active
-- form matches -- the client must treat that as "no Mock currently
-- available," never as an error to route around.
create or replace function public.mock_get_active_form(p_attempt_type text)
returns table (form_id text, attempt_type text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select f.id, f.attempt_type
    from public.ali_mock_form f
    where f.active = true
      and f.attempt_type = p_attempt_type
    order by f.created_at desc
    limit 1;
end;
$$;

-- === Function: mock_get_attempt_manifest =============================
--
-- Returns the caller's own attempt's assigned_question_ids, in order --
-- IDs only, never any question content. See Problem 1b above for why
-- this exists despite RLS already permitting the equivalent direct read.
create or replace function public.mock_get_attempt_manifest(p_attempt_id uuid)
returns text[]
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_ids text[];
begin
  select id into v_profile_id from public.profiles where auth_user_id = auth.uid();

  select assigned_question_ids into v_ids
    from public.ali_mock_attempt
    where id = p_attempt_id and profile_id = v_profile_id;
  if not found then
    raise exception 'Attempt % not found for caller', p_attempt_id;
  end if;

  return v_ids;
end;
$$;

-- === Function: mock_set_flag =========================================
--
-- Exactly mock_submit_answer()'s own four guard checks (ownership,
-- in_progress, not expired, question-in-manifest), reused verbatim in
-- structure so a flag is exactly as server-authoritative as an answer.
create or replace function public.mock_set_flag(p_attempt_id uuid, p_question_id text, p_flagged boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_attempt public.ali_mock_attempt;
begin
  select id into v_profile_id from public.profiles where auth_user_id = auth.uid();

  select * into v_attempt from public.ali_mock_attempt
    where id = p_attempt_id and profile_id = v_profile_id;
  if not found then
    raise exception 'Attempt % not found for caller', p_attempt_id;
  end if;
  if v_attempt.status <> 'in_progress' then
    raise exception 'Attempt % is not in progress (status=%)', p_attempt_id, v_attempt.status;
  end if;
  if v_attempt.expires_at is not null and now() > v_attempt.expires_at then
    raise exception 'Attempt % has expired', p_attempt_id;
  end if;
  if not (p_question_id = any(v_attempt.assigned_question_ids)) then
    raise exception 'Question % is not part of attempt %''s assigned manifest', p_question_id, p_attempt_id;
  end if;

  if p_flagged then
    insert into public.ali_mock_attempt_flag (attempt_id, question_id)
    values (p_attempt_id, p_question_id)
    on conflict (attempt_id, question_id) do nothing;
  else
    delete from public.ali_mock_attempt_flag
      where attempt_id = p_attempt_id and question_id = p_question_id;
  end if;
end;
$$;

-- Execute grants: authenticated only, never anon -- same rule migration
-- 071 already applies to every Mock RPC (a real, even if anonymous,
-- Supabase Auth session is always required).
revoke all on function public.mock_get_active_form(text) from public;
grant execute on function public.mock_get_active_form(text) to authenticated;
revoke all on function public.mock_get_attempt_manifest(uuid) from public;
grant execute on function public.mock_get_attempt_manifest(uuid) to authenticated;
revoke all on function public.mock_set_flag(uuid, text, boolean) from public;
grant execute on function public.mock_set_flag(uuid, text, boolean) to authenticated;

commit;
