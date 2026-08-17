-- Angel Digital 11+ — Migration 070
-- Programme Increment 008D — Mock Attempt Engine + Secure Payload
-- Delivery + Exam Experience Foundation.
--
-- Builds the first real governed Mock attempt pathway. Mock Eligible
-- remains 0 throughout — this migration creates the ATTEMPT/ANSWER
-- infrastructure and the security boundary around it, not any real Mock
-- content.
--
-- ARCHITECTURE DECISION, disclosed: this codebase has no
-- SUPABASE_SERVICE_ROLE_KEY configured anywhere (confirmed by direct
-- search of .env.local and every server/client code path before writing
-- this migration) — a real, previously-undiscovered constraint. Rather
-- than introduce a new secret and a new Next.js API-route layer around
-- it (008C's own "architecture C" framing, evaluated and set aside for
-- this specific field-level-redaction problem), this migration uses
-- PostgreSQL SECURITY DEFINER functions as the server boundary instead.
-- A SECURITY DEFINER function executes with the DEFINING role's
-- privileges (this migration's own applying role, effectively the
-- project owner), independent of the calling user's RLS grants, while
-- still receiving the calling user's real auth.uid() via auth.uid() --
-- so it can perform genuine, real authorization checks (ownership,
-- attempt status, question membership, expiry) entirely inside the
-- database, and construct a hand-picked, redacted JSON return value that
-- never includes the source row's answer/workingSteps/misconception
-- fields. The client calls these functions via the EXISTING anon key +
-- the learner's real Supabase Auth JWT (lib/learnerIdentity.ts's own
-- ensureLearnerSession(), already real and RLS-verifiable — never a
-- client-supplied device_id) through supabase.rpc(), never a direct
-- table SELECT against ali_question_bank for Mock content. This
-- satisfies "do not let the browser query ali_question_bank directly for
-- Mock content" and "do not rely on UI hiding" without requiring any new
-- secret this deployment does not have.
--
-- Tables created: ali_mock_form (a versioned, ordered question
-- manifest -- empty in production; forms are modelled only as test
-- fixtures per this increment's own explicit instruction not to build
-- real Form A/B/C content yet), ali_mock_attempt (one row per governed
-- attempt), ali_mock_attempt_answer (one row per answered question
-- within an attempt).
--
-- RLS: authenticated learners may SELECT only their own attempts/answers
-- (via profiles.auth_user_id = auth.uid()) -- and have NO direct
-- INSERT/UPDATE/DELETE policy on either table at all. Every state
-- transition (create, start, answer, submit) happens exclusively through
-- the SECURITY DEFINER functions below, which perform their own
-- authorization checks before touching a row -- "attempt state is
-- server-controlled" is enforced structurally, not by convention.
--
-- Does NOT: populate any ali_mock_form row; change any
-- ali_question_bank.eligibility_status; touch the migration 069 policy;
-- expose a service-role credential anywhere.
--
-- Idempotent: every CREATE uses IF NOT EXISTS / OR REPLACE / DROP...IF
-- EXISTS, matching this repository's own established convention.
--
-- NOT APPLIED by this increment. Generated for Founder review and manual
-- application via Supabase Dashboard > SQL Editor > New query, after
-- migration 069 has already been applied and verified (confirmed,
-- Decision 87).

begin;

-- === Tables ===================================================

create table if not exists public.ali_mock_form (
  id text primary key,
  specification_version integer not null default 1,
  attempt_type text not null check (attempt_type in ('full_mock', 'timed_section', 'diagnostic_mock')),
  -- Ordered manifest: [{ "question_id": "...", "section": "..." }, ...].
  -- No foreign key to ali_question_bank -- a form may reference a
  -- question that does not exist yet (a real Mock is authored as
  -- provisional first, exactly like every other content batch in this
  -- programme, then reviewed, then referenced by a form only once
  -- eligibility_status = 'mock_eligible'; that eligibility check happens
  -- at attempt-creation time in mock_create_attempt() below, not via a
  -- schema constraint).
  question_manifest jsonb not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.ali_mock_attempt (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id),
  form_id text not null references public.ali_mock_form(id),
  attempt_type text not null check (attempt_type in ('full_mock', 'timed_section', 'diagnostic_mock')),
  status text not null default 'assigned' check (status in ('assigned', 'ready', 'in_progress', 'submitted', 'expired')),
  assigned_question_ids text[] not null,
  current_section text,
  started_at timestamptz,
  submitted_at timestamptz,
  -- Server-authoritative time boundary (Part 10: "timer authority must
  -- not rely solely on client JavaScript") -- set by mock_start_attempt()
  -- at the moment an attempt genuinely starts, never client-supplied.
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.ali_mock_attempt_answer (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.ali_mock_attempt(id),
  question_id text not null,
  response jsonb not null,
  answered_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

alter table public.ali_mock_form enable row level security;
alter table public.ali_mock_attempt enable row level security;
alter table public.ali_mock_attempt_answer enable row level security;

-- === RLS: read-your-own only; no direct write policy for anon/authenticated ===

drop policy if exists ali_mock_form_select_all on public.ali_mock_form;
create policy ali_mock_form_select_all on public.ali_mock_form for select to anon, authenticated
  using (true);
-- Forms carry no question content themselves (only IDs) -- the manifest
-- alone does not leak sealed content, and a learner needs to be able to
-- see which form/section structure their own attempt belongs to. The
-- QUESTIONS referenced by question_manifest remain protected by
-- migration 069's own row-level gate regardless.

-- Form authoring (create/update) is a Founder/admin action, matching the
-- same is_current_user_admin() pattern every other governed-content write
-- path in this codebase already uses (e.g. ali_family_review's own INSERT
-- policy). This is also what makes scripts/verify-mock-attempt-engine.mjs
-- possible: the Founder, as an authenticated admin, can insert one
-- clearly-labelled TEST fixture form (referencing real practice_eligible
-- question ids as stand-ins, never real Mock content) to exercise this
-- migration's own live verification script -- see that script's own
-- header for the exact SQL.
drop policy if exists ali_mock_form_admin_write on public.ali_mock_form;
create policy ali_mock_form_admin_write on public.ali_mock_form for all to authenticated
  using (public.is_current_user_admin())
  with check (public.is_current_user_admin());

drop policy if exists ali_mock_attempt_select_own on public.ali_mock_attempt;
create policy ali_mock_attempt_select_own on public.ali_mock_attempt for select to authenticated
  using (profile_id in (select id from public.profiles where auth_user_id = auth.uid()));

drop policy if exists ali_mock_attempt_answer_select_own on public.ali_mock_attempt_answer;
create policy ali_mock_attempt_answer_select_own on public.ali_mock_attempt_answer for select to authenticated
  using (attempt_id in (
    select id from public.ali_mock_attempt
    where profile_id in (select id from public.profiles where auth_user_id = auth.uid())
  ));

-- No INSERT/UPDATE/DELETE policy on ali_mock_attempt or
-- ali_mock_attempt_answer for anon/authenticated at all -- with RLS
-- enabled and no matching policy, Postgres denies those operations to
-- every role by default (the same pattern migration 054's own comment
-- documents for ali_passage_bank). All mutation happens exclusively
-- through the SECURITY DEFINER functions below.

-- === Server-mediated functions =====================================

-- Creates a new attempt for the calling learner against a given form.
-- Real authorization: requires a real profile owned by the caller
-- (auth.uid()); the form's own question_manifest becomes
-- assigned_question_ids at creation time, frozen for this attempt's
-- lifetime even if the form is later edited.
--
-- Disclosed design decision: this function does NOT require every
-- manifest question to already carry eligibility_status = 'mock_eligible'.
-- The core security property this migration proves -- that a learner can
-- retrieve only their own attempt's own manifest questions, redacted, via
-- mock_get_question() -- holds regardless of the referenced questions'
-- eligibility_status, because the manifest itself (not eligibility_status)
-- is the authorization boundary at read time. Enforcing mock_eligible
-- here would be legitimate additional defense-in-depth once real Mock
-- content exists, but would also make this migration's own fixture-based
-- proof (Part 17 of this increment's own directive, explicitly
-- authorising practice_eligible questions as manifest stand-ins for
-- testing) impossible while Mock Eligible remains 0. Recorded as a named
-- residual hardening item for a future increment, not overlooked.
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

-- Transitions ASSIGNED -> IN_PROGRESS, sets the server-authoritative
-- started_at/expires_at. Only the attempt's own owner may start it, and
-- only from the assigned state (never restarts an already-started or
-- already-submitted attempt).
create or replace function public.mock_start_attempt(p_attempt_id uuid, p_duration_minutes integer default 60)
returns table (status text, started_at timestamptz, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
begin
  select id into v_profile_id from public.profiles where auth_user_id = auth.uid();

  update public.ali_mock_attempt a
  set status = 'in_progress', started_at = now(), expires_at = now() + make_interval(mins => p_duration_minutes)
  where a.id = p_attempt_id
    and a.profile_id = v_profile_id
    and a.status = 'assigned';

  if not found then
    raise exception 'Attempt % cannot be started (not owned by caller, or not in assigned state)', p_attempt_id;
  end if;

  return query select a.status, a.started_at, a.expires_at from public.ali_mock_attempt a where a.id = p_attempt_id;
end;
$$;

-- The field-level redaction boundary itself. Returns ONLY safe display
-- fields -- never answer, accepted answers, workingSteps,
-- addresses_misconception, or any review/provenance metadata. Requires:
-- caller owns the attempt; attempt is in_progress; not expired; the
-- requested question_id is genuinely in this attempt's own
-- assigned_question_ids (never an arbitrary id, never another attempt's
-- or another form's question).
create or replace function public.mock_get_question(p_attempt_id uuid, p_question_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_attempt public.ali_mock_attempt;
  v_row public.ali_question_bank;
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

  select * into v_row from public.ali_question_bank where id = p_question_id;
  if not found then
    raise exception 'Question % not found', p_question_id;
  end if;

  -- Hand-picked, explicit allow-list -- never "select * minus a few
  -- fields," so a future column addition to ali_question_bank cannot
  -- silently leak through this function.
  return jsonb_build_object(
    'questionId', v_row.id,
    'subject', v_row.subject,
    'skill', v_row.skill,
    'question', v_row.prompt->'question',
    'marks', v_row.prompt->'marks',
    'contentDifficulty', v_row.content_difficulty
  );
end;
$$;

-- Records a response without ever revealing correctness. Idempotent per
-- (attempt, question) via the unique constraint -- a resubmission
-- overwrites the prior response for the same question, matching "answer
-- changing" as a legitimate, expected learner action before submission.
create or replace function public.mock_submit_answer(p_attempt_id uuid, p_question_id text, p_response jsonb)
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
  if p_response is null or jsonb_typeof(p_response) <> 'object' then
    raise exception 'Response must be a JSON object';
  end if;

  insert into public.ali_mock_attempt_answer (attempt_id, question_id, response)
  values (p_attempt_id, p_question_id, p_response)
  on conflict (attempt_id, question_id) do update set response = excluded.response, answered_at = now();
end;
$$;

-- Locks the attempt. No scoring happens here -- 008E's own delayed-report
-- pipeline owns scoring/diagnostic analysis, deliberately not built in
-- 008D. After this call, mock_get_question/mock_submit_answer both
-- refuse to operate on this attempt (status <> 'in_progress').
create or replace function public.mock_submit_attempt(p_attempt_id uuid)
returns table (status text, submitted_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
begin
  select id into v_profile_id from public.profiles where auth_user_id = auth.uid();

  update public.ali_mock_attempt a
  set status = 'submitted', submitted_at = now()
  where a.id = p_attempt_id
    and a.profile_id = v_profile_id
    and a.status = 'in_progress';

  if not found then
    raise exception 'Attempt % cannot be submitted (not owned by caller, or not in progress)', p_attempt_id;
  end if;

  return query select a.status, a.submitted_at from public.ali_mock_attempt a where a.id = p_attempt_id;
end;
$$;

-- Execute grants: authenticated only, never anon (an attempt always
-- requires a real profile, which requires a real -- even if anonymous --
-- Supabase Auth session per lib/learnerIdentity.ts).
revoke all on function public.mock_create_attempt(text, text) from public;
grant execute on function public.mock_create_attempt(text, text) to authenticated;
revoke all on function public.mock_start_attempt(uuid, integer) from public;
grant execute on function public.mock_start_attempt(uuid, integer) to authenticated;
revoke all on function public.mock_get_question(uuid, text) from public;
grant execute on function public.mock_get_question(uuid, text) to authenticated;
revoke all on function public.mock_submit_answer(uuid, text, jsonb) from public;
grant execute on function public.mock_submit_answer(uuid, text, jsonb) to authenticated;
revoke all on function public.mock_submit_attempt(uuid) from public;
grant execute on function public.mock_submit_attempt(uuid) to authenticated;

commit;
