-- Angel Digital 11+ — Migration 085
-- Mock Governance Architecture Increment 001 — Fortnightly Mock Cycle and
-- Parent-Control Model (Decision 135).
--
-- Builds ONLY the minimum persistent architecture required to make the
-- Founder's reconciled Mock governance model (Decision 49, 2026-08-13;
-- Decision 133, Decision 134, both 2026-08-20) enforceable later.
-- mock_eligible remains 0 throughout — this migration creates no form, no
-- question, no active content, and changes no eligibility_status. It does
-- NOT make Mock available.
--
-- REUSES the proven 070/072/074/075 architecture (SECURITY DEFINER
-- functions as the server boundary, read-your-own RLS with no direct
-- write policy, hand-picked jsonb projections) rather than building a
-- parallel system. No table, policy, or function from 070/072/074/075 is
-- dropped or rewritten wholesale — see the one narrow, disclosed exception
-- below.
--
-- FOUNDER RULINGS THIS MIGRATION IMPLEMENTS (Decision 135):
--   1. The ~14-day cadence gates ONE Full Mock CYCLE (Mathematics paper +
--      English paper together), never two independent per-subject clocks.
--   2. A parent-authorised additional cycle bypasses the cadence but must
--      be persistently distinguishable from a normal scheduled cycle, and
--      the learner cannot self-unlock it.
--   3. An eventual extra charge on the parent-authorised path is an
--      approved commercial PRINCIPLE only — no price, no payment
--      infrastructure, no entitlement/subscription logic is implemented
--      here. This migration's job is narrower: don't make that later work
--      impossible. See "COMMERCIAL FORWARD-COMPATIBILITY" below for
--      exactly how.
--
-- === MOCK CYCLE MODEL =================================================
--
-- ali_mock_cycle (new table): one row per Full Mock sitting. Two Mock
-- attempts (one Mathematics, one English — both attempt_type = 'full_mock')
-- may link to the same cycle via a new nullable ali_mock_attempt.cycle_id
-- column. Attempts remain one row per subject paper, independently
-- started/timed/submitted/scored/reported exactly as migrations 070-075
-- already built — this migration does not merge them, does not touch
-- mock_start_attempt/mock_get_question/mock_submit_answer/
-- mock_submit_attempt/mock_score_attempt/mock_release_report, and does not
-- require both papers to be attempted in one sitting. A cycle is "open"
-- (mock_cycle_is_open()) until BOTH a mathematics and an english attempt
-- under it reach status = 'submitted'.
--
-- ali_mock_form gains a nullable `subject` column ('mathematics' |
-- 'english'). NULL means "combined/legacy form" (today's only kind, per
-- Decision 133's own finding that a genuine two-paper split has never been
-- authored) — such a form remains fully usable via the existing, untouched
-- mock_create_attempt(text, text) for timed_section/diagnostic_mock
-- purposes, but can never join a cycle (enforced below). A non-null
-- subject marks a genuinely subject-pure paper, the prerequisite Decision
-- 133 named for the Founder's two-paper requirement — authoring such forms
-- is real Mock content work, explicitly NOT done by this migration.
--
-- === INITIATION SOURCE (Founder ruling 2) =============================
--
-- ali_mock_cycle.initiated_by ('scheduled' | 'parent_override') is the
-- persistent, auditable distinction Decision 49 itself required ("a
-- parent-triggered Mock must be distinguishable in the data model...not
-- silently merged"). Two separate creation functions, not one function
-- with a caller-supplied flag: mock_start_new_cycle() always writes
-- 'scheduled' and enforces the interval; mock_authorise_extra_cycle()
-- always writes 'parent_override' and skips it. A client cannot cause
-- 'parent_override' to be written by calling the normal path with a
-- different argument, because there is no argument — the function called
-- IS the source of truth.
--
-- DISCLOSED LIMITATION, not solved here: this codebase has exactly one
-- Supabase Auth identity per family (profiles.auth_user_id, migration
-- 002) — confirmed by direct reading of app/learning-intelligence/
-- parent/page.tsx ("Permanent Principle: user journeys are shared") and
-- of is_current_user_admin() (migration 008, a per-project Founder/admin
-- flag, not a per-family parent role). There is no second factor or
-- separate parent login anywhere in this schema. mock_authorise_extra_
-- cycle() is therefore gated the same way every Mock RPC is gated —
-- `authenticated` only, ownership derived from auth.uid() — and its real
-- protection against a child self-authorising is that it is wired into no
-- child-facing route at all, only a future Parent-Dashboard-only control
-- (not built in this increment, per the directive's own instruction). A
-- technically sophisticated learner who inspects network calls could
-- still invoke it directly via supabase.rpc(), exactly as they could any
-- other RPC in this app. This is a genuine residual risk, structurally
-- identical in kind to the household/sibling-exposure risk 008A §11
-- already accepts as disclosed-not-solved — not a new category of
-- shortcut taken for this increment specifically. Closing it fully needs
-- a real parent PIN or separate parent authentication: named here as
-- necessary future work, not built now, per the directive's own explicit
-- instruction not to broaden this increment into UI/auth work.
--
-- === COMMERCIAL FORWARD-COMPATIBILITY (Founder ruling 3) ==============
--
-- No price, entitlement, subscription, or payment table is created. What
-- this migration does do, to avoid making that later work impossible: (a)
-- initiated_by = 'parent_override' already exists as the exact row a
-- future payment/entitlement gate would key off; (b) mock_authorise_
-- extra_cycle() is one single, narrow function — a future increment can
-- add a payment/entitlement check inside this same function body (or
-- immediately before its call) without touching mock_start_new_cycle(),
-- the cadence logic, or anything subject/report-related; (c) no schema
-- decision here assumes the charge is per-cycle vs per-family-period vs
-- anything else — that pricing-model choice is left entirely open,
-- exactly as instructed.
--
-- === CADENCE (Founder ruling 1) ========================================
--
-- Anchor: the most recent 'scheduled' cycle's own created_at — never a
-- paper's own started_at/submitted_at, and never a 'parent_override'
-- cycle. Rationale (asked for explicitly, recorded here): (i) a single
-- creation-time anchor per cycle is the one canonical, ungameable
-- timestamp — anchoring on completion would let a learner leave one paper
-- permanently unfinished to keep re-deriving eligibility, or would let an
-- abandoned cycle block a new one forever with no event to ever start the
-- clock; (ii) the separate, mandatory "no currently open cycle" check
-- (mock_cycle_is_open(), enforced before either creation function inserts
-- a row) is what actually stops a learner gaming the system by leaving
-- one paper incomplete — not the interval math — so the interval itself
-- can stay simple and creation-time-based without being exploitable in
-- combination; (iii) 'parent_override' cycles deliberately never move
-- this anchor, so an authorised extra sitting cannot perversely delay the
-- family's own normal fortnightly rhythm — it is purely additive on top
-- of it, matching the Founder's own framing ("if another Mock is required
-- before the next normal cycle").
--
-- === ANTI-MEMORISATION (Founder requirement 6, governance only) =======
--
-- No form-generation system, exposure table, or content is built here —
-- explicitly out of scope for this increment. What this migration
-- confirms by direct inspection, recorded for the future Mock-authoring/
-- form-generation increment this unblocks: "form previously attempted by
-- this learner" and "every question ID this learner has ever been
-- assigned in a Mock" are BOTH already fully reconstructable today from
-- existing, unmodified columns (ali_mock_attempt.profile_id + form_id,
-- and assigned_question_ids per attempt, migration 070) — no new table is
-- a prerequisite for the cadence/cycle work this migration builds. Real
-- passage-exposure tracking (008A §19: "already real and functioning for
-- Practice English — reused, not rebuilt") is not yet wired to Mock
-- specifically, and remains named, future, content-adjacent work, not a
-- cycle/cadence prerequisite. Full requirement restated in Decision 135
-- for governance: any future Mock form-generation work must account for
-- prior question exposure, passage exposure, form exposure, competency/
-- skill coverage, difficulty balance, subject balance, form retirement/
-- cooldown, and reproducibility/auditability, using only reviewed,
-- independently-authorised content — reshuffling, question-order changes,
-- or numeric substitution alone do not satisfy this requirement.
--
-- === THE ONE NARROW EXCEPTION TO "NOTHING PROVEN IS REWRITTEN" ========
--
-- mock_create_attempt(text, text) (migration 070) is redefined — CREATE OR
-- REPLACE, same two-argument signature, same grants, every existing line
-- unchanged — to add exactly one new guard clause rejecting
-- p_attempt_type = 'full_mock' with a message pointing at the new
-- mock_create_cycle_attempt() below. This is the one real security
-- requirement this increment must close (Part 7: "ordinary learners must
-- not be able to fabricate a parent-authorised cycle through direct
-- client calls") — without this guard, a full_mock attempt could still be
-- created uncycled, with no cadence check at all, via the old path.
-- timed_section and diagnostic_mock behaviour through this same function
-- is completely unchanged — confirmed against its own only two real
-- callers in this repository (app/learning-intelligence/mock-exam/
-- page.tsx uses attempt_type "full_mock" today and is therefore, as
-- expected, not yet wired to the new cycle-aware path — named as future
-- bounded UI work, not done here; app/learning-intelligence/
-- mock-attempt-preview/page.tsx uses "diagnostic_mock" against a fixture
-- form and is entirely unaffected by this guard).
--
-- Everything else new in this migration is a new table, new nullable
-- columns, or a new function under a new name — additive, matching this
-- repository's own established convention.
--
-- Idempotent: every CREATE uses IF NOT EXISTS / OR REPLACE, matching this
-- repository's own established convention.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 069-084
-- have already been applied (confirmed, Decisions 87/91/96/100/107/108/
-- 120/124/132).

begin;

-- === Table: ali_mock_cycle ============================================

create table if not exists public.ali_mock_cycle (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id),
  initiated_by text not null check (initiated_by in ('scheduled', 'parent_override')) default 'scheduled',
  created_at timestamptz not null default now()
);

alter table public.ali_mock_cycle enable row level security;

drop policy if exists ali_mock_cycle_select_own on public.ali_mock_cycle;
create policy ali_mock_cycle_select_own on public.ali_mock_cycle for select to authenticated
  using (profile_id in (select id from public.profiles where auth_user_id = auth.uid()));
-- No insert/update/delete policy for anon/authenticated -- all mutation
-- happens exclusively through mock_start_new_cycle()/mock_authorise_
-- extra_cycle() below, matching every existing Mock table's own
-- established discipline (migration 070).

-- === Column additions: subject / cycle membership ======================

alter table public.ali_mock_form
  add column if not exists subject text check (subject in ('mathematics', 'english'));
comment on column public.ali_mock_form.subject is
  'NULL = combined/legacy form (every form that exists today). Non-null marks a genuinely subject-pure Mathematics or English paper -- required before a form can join a Mock cycle via mock_create_cycle_attempt(). Authoring subject-pure forms is separate future content work, not performed by this migration.';

alter table public.ali_mock_attempt
  add column if not exists cycle_id uuid references public.ali_mock_cycle(id);
alter table public.ali_mock_attempt
  add column if not exists subject text check (subject in ('mathematics', 'english'));
comment on column public.ali_mock_attempt.cycle_id is
  'NULL for every attempt created via the original mock_create_attempt(text,text) (timed_section/diagnostic_mock, or any pre-cycle-model attempt). Set only by mock_create_cycle_attempt(), which also copies subject from the attempt''s own form -- denormalised for cheap cycle-completion queries, never independently editable.';

-- Database-enforced, not just app-enforced (matching this codebase's own
-- established discipline, e.g. migration 008's is_admin column lockdown):
-- at most one attempt per subject per cycle. Partial index -- does not
-- constrain the many existing/future cycle_id IS NULL attempts at all.
create unique index if not exists ali_mock_attempt_cycle_subject_unique
  on public.ali_mock_attempt (cycle_id, subject)
  where cycle_id is not null;

-- === Function: mock_cycle_is_open (internal helper, never granted) ====
--
-- A cycle is open until both a mathematics and an english attempt under
-- it have reached status = 'submitted'. Not exposed to anon/authenticated
-- at all -- called only from within this migration's own other SECURITY
-- DEFINER functions, which run with their owning role's own implicit
-- privilege over its own objects, the same mechanism migration 075's
-- mock_attempt_report_init() already relies on to call the execute-
-- revoked mock_score_attempt() internally (Decision 96's own proven
-- precedent, reused unchanged, not invented here).
create or replace function public.mock_cycle_is_open(p_cycle_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_maths_submitted boolean;
  v_english_submitted boolean;
begin
  select exists (
    select 1 from public.ali_mock_attempt
    where cycle_id = p_cycle_id and subject = 'mathematics' and status = 'submitted'
  ) into v_maths_submitted;
  select exists (
    select 1 from public.ali_mock_attempt
    where cycle_id = p_cycle_id and subject = 'english' and status = 'submitted'
  ) into v_english_submitted;
  return not (v_maths_submitted and v_english_submitted);
end;
$$;
revoke all on function public.mock_cycle_is_open(uuid) from public;

-- === Function: mock_start_new_cycle ===================================
--
-- Creates a normal 'scheduled' cycle. Enforces both anti-gaming
-- conditions named above: no currently open cycle (of either source), and
-- (for 'scheduled' only) at least ~14 days since this profile's own most
-- recent 'scheduled' cycle. A learner's very first cycle is always
-- immediately eligible (no prior 'scheduled' row exists).
create or replace function public.mock_start_new_cycle()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_last_scheduled_at timestamptz;
  v_open_cycle_id uuid;
  v_cycle_id uuid;
  v_interval constant interval := interval '14 days';
begin
  select id into v_profile_id from public.profiles where auth_user_id = auth.uid();
  if v_profile_id is null then
    raise exception 'No profile found for the calling user';
  end if;

  select c.id into v_open_cycle_id
    from public.ali_mock_cycle c
    where c.profile_id = v_profile_id
      and public.mock_cycle_is_open(c.id)
    order by c.created_at desc
    limit 1;
  if v_open_cycle_id is not null then
    raise exception 'Mock cycle % is still open -- complete both papers (or let it lapse) before starting a new one', v_open_cycle_id;
  end if;

  select max(created_at) into v_last_scheduled_at
    from public.ali_mock_cycle
    where profile_id = v_profile_id and initiated_by = 'scheduled';

  if v_last_scheduled_at is not null and now() - v_last_scheduled_at < v_interval then
    raise exception 'The next normal Mock cycle is not yet available -- % remaining', (v_last_scheduled_at + v_interval - now());
  end if;

  insert into public.ali_mock_cycle (profile_id, initiated_by)
  values (v_profile_id, 'scheduled')
  returning id into v_cycle_id;

  return v_cycle_id;
end;
$$;
revoke all on function public.mock_start_new_cycle() from public;
grant execute on function public.mock_start_new_cycle() to authenticated;

-- === Function: mock_authorise_extra_cycle =============================
--
-- Creates a 'parent_override' cycle. Enforces the no-open-cycle guard
-- only -- the interval check is deliberately absent, which IS the bypass
-- Decision 49/135 authorise. See the disclosed limitation above: this
-- function cannot itself distinguish a parent's own tap from a child's --
-- its real protection today is that no child-facing route calls it.
create or replace function public.mock_authorise_extra_cycle()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_open_cycle_id uuid;
  v_cycle_id uuid;
begin
  select id into v_profile_id from public.profiles where auth_user_id = auth.uid();
  if v_profile_id is null then
    raise exception 'No profile found for the calling user';
  end if;

  select c.id into v_open_cycle_id
    from public.ali_mock_cycle c
    where c.profile_id = v_profile_id
      and public.mock_cycle_is_open(c.id)
    order by c.created_at desc
    limit 1;
  if v_open_cycle_id is not null then
    raise exception 'Mock cycle % is still open -- complete both papers (or let it lapse) before authorising another', v_open_cycle_id;
  end if;

  insert into public.ali_mock_cycle (profile_id, initiated_by)
  values (v_profile_id, 'parent_override')
  returning id into v_cycle_id;

  return v_cycle_id;
end;
$$;
revoke all on function public.mock_authorise_extra_cycle() from public;
grant execute on function public.mock_authorise_extra_cycle() to authenticated;

-- === Function: mock_create_cycle_attempt ==============================
--
-- The cycle-aware sibling of mock_create_attempt(), scoped exclusively to
-- attempt_type = 'full_mock' subject-pure papers. Requires: caller owns
-- the cycle; the cycle is still open; the form is active and subject-pure
-- (subject is not null); no attempt for that subject already exists in
-- this cycle (belt-and-braces with the partial unique index above).
create or replace function public.mock_create_cycle_attempt(p_form_id text, p_cycle_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_cycle public.ali_mock_cycle;
  v_form public.ali_mock_form;
  v_question_ids text[];
  v_attempt_id uuid;
begin
  select id into v_profile_id from public.profiles where auth_user_id = auth.uid();
  if v_profile_id is null then
    raise exception 'No profile found for the calling user';
  end if;

  select * into v_cycle from public.ali_mock_cycle
    where id = p_cycle_id and profile_id = v_profile_id;
  if not found then
    raise exception 'Cycle % not found for caller', p_cycle_id;
  end if;
  if not public.mock_cycle_is_open(p_cycle_id) then
    raise exception 'Cycle % is already complete -- both papers already submitted', p_cycle_id;
  end if;

  select * into v_form from public.ali_mock_form where id = p_form_id and active = true;
  if not found then
    raise exception 'Form % not found or inactive', p_form_id;
  end if;
  if v_form.subject is null then
    raise exception 'Form % is not a subject-pure Mathematics/English paper -- a combined/legacy form cannot join a Mock cycle', p_form_id;
  end if;

  if exists (
    select 1 from public.ali_mock_attempt
    where cycle_id = p_cycle_id and subject = v_form.subject
  ) then
    raise exception 'Cycle % already has a % attempt -- one attempt per subject per cycle', p_cycle_id, v_form.subject;
  end if;

  select array(select jsonb_array_elements(question_manifest)->>'question_id')
    into v_question_ids
    from public.ali_mock_form
    where id = p_form_id;

  insert into public.ali_mock_attempt (profile_id, form_id, attempt_type, status, assigned_question_ids, cycle_id, subject)
  values (v_profile_id, p_form_id, 'full_mock', 'assigned', v_question_ids, p_cycle_id, v_form.subject)
  returning id into v_attempt_id;

  return v_attempt_id;
end;
$$;
revoke all on function public.mock_create_cycle_attempt(text, uuid) from public;
grant execute on function public.mock_create_cycle_attempt(text, uuid) to authenticated;

-- === mock_create_attempt (070): one new guard clause, nothing else =====
--
-- Full body reproduced (CREATE OR REPLACE requires it), identical to
-- migration 070's original except for the single new IF block marked
-- below. Signature, grants, and every other line are unchanged --
-- timed_section/diagnostic_mock callers are unaffected.
create or replace function public.mock_create_attempt(p_form_id text, p_attempt_type text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_question_ids text[];
  v_attempt_id uuid;
begin
  -- NEW (migration 085): full_mock attempts must go through the
  -- cycle-aware path so the cadence/parent-control model cannot be
  -- bypassed by calling this older, uncycled function directly.
  if p_attempt_type = 'full_mock' then
    raise exception 'full_mock attempts must be created via mock_create_cycle_attempt(form_id, cycle_id) as part of a Mock cycle -- see migration 085';
  end if;

  select id into v_profile_id from public.profiles where auth_user_id = auth.uid();
  if v_profile_id is null then
    raise exception 'No profile found for the calling user';
  end if;

  select array(select jsonb_array_elements(question_manifest)->>'question_id')
    into v_question_ids
    from public.ali_mock_form
    where id = p_form_id and active = true;
  if v_question_ids is null then
    raise exception 'Form % not found or inactive', p_form_id;
  end if;

  insert into public.ali_mock_attempt (profile_id, form_id, attempt_type, status, assigned_question_ids)
  values (v_profile_id, p_form_id, p_attempt_type, 'assigned', v_question_ids)
  returning id into v_attempt_id;

  return v_attempt_id;
end;
$$;
-- Grants unchanged from migration 070 (authenticated only, never anon) --
-- re-stated here only for clarity, not because it needs re-applying.
revoke all on function public.mock_create_attempt(text, text) from public;
grant execute on function public.mock_create_attempt(text, text) to authenticated;

commit;
