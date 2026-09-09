-- Angel Digital 11+ — Migration 245
-- CSSE English Full Paper: Mock-grade Continuous Writing assessment,
-- two-phase (reading/working) timing, subject-aware active-form
-- discovery, and the first real English full_mock form.
--
-- ============================================================
-- WHY THIS EXISTS
-- ============================================================
-- ANGEL_CSSE_ENGLISH_PAPER_AUTHORITATIVE_CONTRACT_AND_GAP_REPORT.md
-- (2026-09-09) found English PARTIAL — MATERIAL WRITING GAP: Continuous
-- Writing is a real, compulsory, current CSSE component (official
-- 5-dimension rubric independently confirmed against csse.org.uk), but
-- Angel had no Mock-grade assessment path for it — no numeric/qualitative
-- mark of record, no review-required safety net, no attempt-lifecycle
-- wiring, and the live Reading Comprehension form could not join a Mock
-- cycle at all (attempt_type='timed_section', not 'full_mock'). This
-- migration closes exactly that gap, reusing existing infrastructure:
--
--   * ali_question_bank.marking_mode already had a 'criterion_rubric'
--     value reserved, since migration 093, explicitly documented as
--     "Continuous Writing... not yet scored by any live function" —
--     this migration is that function, not a new concept.
--   * mock_score_attempt() (migration 104) already routes
--     `subject = 'writing'` questions to `requires_manual_marking`
--     unconditionally — CONFIRMED by direct re-read of its live body —
--     so ZERO change is needed there. Writing questions already land in
--     exactly the right holding state; this migration only adds the
--     function that resolves it.
--   * mock_apply_manual_mark() (migration 227) is the direct structural
--     precedent this migration's own mock_persist_writing_assessment()
--     and mock_review_writing_assessment() are modelled on — same
--     ownership/status/idempotency discipline, applied to a qualitative
--     5-dimension result instead of a bare numeric mark.
--   * ali_mock_cycle / mock_create_cycle_attempt() (migration 085)
--     already require nothing more than `subject is not null` and
--     `attempt_type = 'full_mock'` on a form — the new English form this
--     migration inserts satisfies both, unmodified.
--
-- No new engine, no new mastery model, no new recommendation logic. The
-- AI rubric assessment itself (lib/learningEngine/writingRubric.ts, the
-- same 5-dimension engine already live for Practice) is NOT modified —
-- this migration only adds where its OUTPUT is durably persisted for a
-- Mock attempt, via a new table and two new functions.
--
-- ============================================================
-- WHY A NEW TABLE (ali_writing_assessment), NOT question_outcomes
-- ============================================================
-- The Founder's own explicit instruction (§3 of the governing brief):
-- "DO NOT INVENT" a combined Comprehension+Writing raw-mark total: no
-- official current CSSE source confirms the split. Folding a Writing
-- "mark" into question_outcomes' existing pooled
-- rawMarksAchieved/rawMarksAvailable would silently imply exactly the
-- fabricated weighting the brief forbids. ali_question_bank rows Angel
-- assigns "marksAvailable" to for Writing therefore remain purely
-- internal/Angel-scale, never pooled into overall.rawMarksAchieved —
-- Writing outcomes stay `requires_manual_marking` in question_outcomes
-- permanently (an honest state: no CSSE-legitimate numeric mark exists
-- for this component), and ali_writing_assessment is the sole
-- authoritative record of the qualitative result, reported separately.
--
-- ============================================================
-- WHY assessment_status IS DETERMINISTIC, NOT MODEL SELF-CONFIDENCE
-- ============================================================
-- Reuses lib/learningEngine/writingRubric.ts's own pre-flight gate
-- (runWritingPreflightChecks -> meetsMinimumLength / likelyOffTopic /
-- likelyTemplateOrCopied / per-dimension `confident`), already live,
-- already deterministic, already tested (Phase D, unmodified here). The
-- TypeScript orchestration layer (lib/mockAttempt/writingAssessment.ts,
-- a separate file, not SQL) computes assessment_status from these exact
-- signals before calling mock_persist_writing_assessment() — this
-- migration's own function accepts assessment_status/review_required_
-- reasons as already-computed, honest inputs, and validates their shape,
-- but does not invent the classification logic itself.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor, after migrations 070-244 (per this
-- arc's own standing record) have already been applied. The new English
-- full_mock form this migration inserts is created with active=false —
-- a second, separate, later admin action (a one-line UPDATE, not part of
-- this migration) is required to make it discoverable at all, per the
-- governing brief's own "stop before irreversible production
-- publication" instruction.

begin;

-- ============================================================
-- 1. ali_writing_assessment — the immutable-original, versioned record
-- ============================================================
create table if not exists public.ali_writing_assessment (
  id                        bigint generated always as identity primary key,
  attempt_id                uuid not null references public.ali_mock_attempt(id),
  question_id               text not null references public.ali_question_bank(id),
  task_type                 text not null check (task_type in ('Q1', 'Q2')),
  rubric_version             integer not null,
  assessment_version         integer not null,
  -- The learner's ORIGINAL submitted response, read server-side from
  -- ali_mock_attempt_answer at the moment mock_persist_writing_assessment()
  -- first runs for this (attempt, question) — never accepted as a
  -- caller-supplied parameter, so no later process can pass a different
  -- string and silently overwrite what the learner actually wrote.
  response_text              text not null,
  -- [{dimension, level, comment, confident}, ...] — the same shape
  -- lib/learningEngine/writingRubric.ts already produces, unmodified.
  dimensions                 jsonb not null,
  overall_indicator          numeric not null check (overall_indicator >= 0 and overall_indicator <= 100),
  assessment_status          text not null check (assessment_status in ('complete', 'review_required')),
  review_required_reasons    text[],
  automated_model            text not null,
  automated_assessed_at      timestamptz not null default now(),
  -- Human review is additive-only: these columns are null until a
  -- reviewer acts, and mock_review_writing_assessment() (below) never
  -- touches dimensions/response_text — the original automated read
  -- stays on the record permanently, alongside any review, never
  -- replaced by it.
  human_reviewer_profile_id  uuid references public.profiles(id),
  human_review_dimensions    jsonb,
  human_review_notes         text,
  human_reviewed_at          timestamptz,
  created_at                 timestamptz not null default now(),
  unique (attempt_id, question_id)
);

comment on table public.ali_writing_assessment is
  'Migration 245. One immutable-original, versioned Continuous Writing assessment record per (Mock attempt, Writing question). response_text/dimensions are the automated read, set once and never overwritten. human_review_* columns are additive-only, populated only by mock_review_writing_assessment(). Never pooled into ali_mock_attempt_report.overall (see this migration''s own header) — read separately by any report surface.';

create index if not exists ali_writing_assessment_attempt_idx
  on public.ali_writing_assessment (attempt_id);

alter table public.ali_writing_assessment enable row level security;

drop policy if exists ali_writing_assessment_select_own on public.ali_writing_assessment;
create policy ali_writing_assessment_select_own on public.ali_writing_assessment for select to authenticated
  using (
    public.is_current_user_admin()
    or attempt_id in (
      select id from public.ali_mock_attempt
      where profile_id in (select id from public.profiles where auth_user_id = auth.uid())
    )
  );

-- No insert/update/delete policy for anon/authenticated — every row is
-- written only via the two SECURITY DEFINER functions below, matching
-- ali_mock_manual_mark_audit's own established precedent (migration 227).
revoke all on table public.ali_writing_assessment from public, anon, authenticated;
grant select on table public.ali_writing_assessment to authenticated;

-- ============================================================
-- 2. mock_persist_writing_assessment() — the automated-result write path
-- ============================================================
-- Owner-or-admin gated (NOT admin-only): matches mock_claim_evidence_
-- ingestion()'s own established pattern (migration 244) — an automated,
-- per-learner process every real learner must be able to trigger for
-- their own attempt, not an admin-only action. Idempotent: a second call
-- for the same (attempt, question) is a safe no-op (returns false),
-- exactly like migration 244's own claim discipline.
create or replace function public.mock_persist_writing_assessment(
  p_attempt_id uuid,
  p_question_id text,
  p_task_type text,
  p_rubric_version integer,
  p_assessment_version integer,
  p_dimensions jsonb,
  p_overall_indicator numeric,
  p_assessment_status text,
  p_review_required_reasons text[],
  p_automated_model text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile_id     uuid;
  v_attempt        public.ali_mock_attempt;
  v_bank_row       public.ali_question_bank;
  v_report         public.ali_mock_attempt_report;
  v_outcomes       jsonb;
  v_idx            int;
  v_found          boolean := false;
  v_outcome_status text;
  v_response_text  text;
  v_row_count      int;
begin
  select id into v_profile_id from public.profiles where auth_user_id = auth.uid();
  if v_profile_id is null then
    raise exception 'No profile found for the current caller';
  end if;

  select * into v_attempt from public.ali_mock_attempt where id = p_attempt_id;
  if not found then
    raise exception 'Attempt % not found', p_attempt_id;
  end if;
  if not (v_attempt.profile_id = v_profile_id or public.is_current_user_admin()) then
    raise exception 'Attempt % does not belong to the current caller', p_attempt_id;
  end if;
  if v_attempt.status <> 'submitted' then
    raise exception 'Attempt % is not submitted (status=%) -- refusing to assess an in-progress or unstarted attempt', p_attempt_id, v_attempt.status;
  end if;

  select * into v_bank_row from public.ali_question_bank where id = p_question_id;
  if not found then
    raise exception 'Question % not found', p_question_id;
  end if;
  if v_bank_row.subject <> 'writing' then
    raise exception 'Question % is not a Writing question (subject=%)', p_question_id, v_bank_row.subject;
  end if;
  if not (p_question_id = any(v_attempt.assigned_question_ids)) then
    raise exception 'Question % is not part of attempt %''s assigned manifest', p_question_id, p_attempt_id;
  end if;

  if p_task_type not in ('Q1', 'Q2') then
    raise exception 'Invalid task_type % -- must be Q1 or Q2', p_task_type;
  end if;
  if p_assessment_status not in ('complete', 'review_required') then
    raise exception 'Invalid assessment_status %', p_assessment_status;
  end if;
  if p_assessment_status = 'review_required' and (p_review_required_reasons is null or array_length(p_review_required_reasons, 1) is null) then
    raise exception 'review_required assessment_status requires at least one reason';
  end if;

  select * into v_report from public.ali_mock_attempt_report where attempt_id = p_attempt_id for update;
  if not found then
    raise exception 'No report row exists for attempt %', p_attempt_id;
  end if;

  v_outcomes := coalesce(v_report.question_outcomes, '[]'::jsonb);
  for v_idx in 0 .. jsonb_array_length(v_outcomes) - 1 loop
    if (v_outcomes -> v_idx ->> 'questionId') = p_question_id then
      v_found := true;
      v_outcome_status := v_outcomes -> v_idx ->> 'status';
    end if;
  end loop;
  if not v_found then
    raise exception 'Question % is not part of attempt %''s persisted outcomes', p_question_id, p_attempt_id;
  end if;
  if v_outcome_status <> 'requires_manual_marking' then
    raise exception 'Question % is not awaiting assessment (status=%)', p_question_id, v_outcome_status;
  end if;

  -- The original response, read server-side — never a caller-supplied
  -- parameter — so this record can never diverge from what the learner
  -- actually submitted during the sealed attempt.
  select response ->> 'value' into v_response_text
    from public.ali_mock_attempt_answer
    where attempt_id = p_attempt_id and question_id = p_question_id;
  if v_response_text is null or trim(v_response_text) = '' then
    raise exception 'No submitted response found for question % in attempt %', p_question_id, p_attempt_id;
  end if;

  insert into public.ali_writing_assessment (
    attempt_id, question_id, task_type, rubric_version, assessment_version,
    response_text, dimensions, overall_indicator, assessment_status,
    review_required_reasons, automated_model
  ) values (
    p_attempt_id, p_question_id, p_task_type, p_rubric_version, p_assessment_version,
    v_response_text, p_dimensions, p_overall_indicator, p_assessment_status,
    p_review_required_reasons, p_automated_model
  )
  on conflict (attempt_id, question_id) do nothing;

  get diagnostics v_row_count = row_count;
  return v_row_count > 0;
end;
$$;

revoke all on function public.mock_persist_writing_assessment(uuid, text, text, integer, integer, jsonb, numeric, text, text[], text) from public;
grant execute on function public.mock_persist_writing_assessment(uuid, text, text, integer, integer, jsonb, numeric, text, text[], text) to authenticated;

-- ============================================================
-- 3. mock_review_writing_assessment() — the optional human-review path
-- ============================================================
-- Admin-only (the safety net, not the default path — matches
-- mock_apply_manual_mark()'s own gating exactly). Additive-only: never
-- touches dimensions/response_text/assessment_status, only records a
-- reviewer's own separate judgement alongside the untouched original.
create or replace function public.mock_review_writing_assessment(
  p_attempt_id uuid,
  p_question_id text,
  p_human_review_dimensions jsonb,
  p_human_review_notes text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_reviewer_profile_id uuid;
  v_row_count int;
begin
  if not public.is_current_user_admin() then
    raise exception 'Only an admin may review a Writing assessment';
  end if;

  select id into v_reviewer_profile_id from public.profiles where auth_user_id = auth.uid();
  if v_reviewer_profile_id is null then
    raise exception 'Reviewer profile could not be resolved for the current session';
  end if;

  if p_human_review_dimensions is null or jsonb_typeof(p_human_review_dimensions) <> 'array' then
    raise exception 'human_review_dimensions must be a JSON array';
  end if;

  update public.ali_writing_assessment
  set human_reviewer_profile_id = v_reviewer_profile_id,
      human_review_dimensions = p_human_review_dimensions,
      human_review_notes = p_human_review_notes,
      human_reviewed_at = now()
  where attempt_id = p_attempt_id and question_id = p_question_id;

  get diagnostics v_row_count = row_count;
  if v_row_count = 0 then
    raise exception 'No writing assessment found for attempt %, question %', p_attempt_id, p_question_id;
  end if;
end;
$$;

revoke all on function public.mock_review_writing_assessment(uuid, text, jsonb, text) from public;
grant execute on function public.mock_review_writing_assessment(uuid, text, jsonb, text) to authenticated;

-- ============================================================
-- 4. Two-phase (reading/working) timing — additive, opt-in per form
-- ============================================================
alter table public.ali_mock_form
  add column if not exists reading_phase_minutes integer,
  add column if not exists default_duration_minutes integer;

comment on column public.ali_mock_form.reading_phase_minutes is
  'Migration 245. NULL (every existing form''s current value) means no reading-phase restriction — unchanged behaviour. Non-null means mock_submit_answer() refuses any answer for this form''s attempts until this many minutes have elapsed since started_at — the CSSE-evidenced "10 minutes additional reading time" (csse.org.uk, independently confirmed), during which a real candidate may read but not yet answer.';

comment on column public.ali_mock_form.default_duration_minutes is
  'Migration 245. NULL (every existing form''s current value) means mock_start_attempt() uses its own caller-supplied p_duration_minutes exactly as before — unchanged behaviour. Non-null overrides any caller-supplied value with this server-authoritative figure, so an English full_mock attempt''s real 70-minute (10 reading + 60 working) duration can never depend on client-side trust.';

-- mock_start_attempt() — CREATE OR REPLACE, full existing body preserved,
-- one additive change: the form's own default_duration_minutes (when
-- set) overrides the caller-supplied duration, never the reverse.
create or replace function public.mock_start_attempt(p_attempt_id uuid, p_duration_minutes integer default 60)
returns table (status text, started_at timestamptz, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_form_duration integer;
  v_effective_duration integer;
begin
  select id into v_profile_id from public.profiles where auth_user_id = auth.uid();

  select f.default_duration_minutes into v_form_duration
    from public.ali_mock_attempt a
    join public.ali_mock_form f on f.id = a.form_id
    where a.id = p_attempt_id;
  v_effective_duration := coalesce(v_form_duration, p_duration_minutes);

  update public.ali_mock_attempt a
  set status = 'in_progress', started_at = now(), expires_at = now() + make_interval(mins => v_effective_duration)
  where a.id = p_attempt_id
    and a.profile_id = v_profile_id
    and a.status = 'assigned';

  if not found then
    raise exception 'Attempt % cannot be started (not owned by caller, or not in assigned state)', p_attempt_id;
  end if;

  return query select a.status, a.started_at, a.expires_at from public.ali_mock_attempt a where a.id = p_attempt_id;
end;
$$;

-- mock_submit_answer() — CREATE OR REPLACE, full existing body preserved,
-- one additive guard inserted after the existing expiry check: a form
-- with reading_phase_minutes set refuses any answer until that many
-- minutes have elapsed since started_at. Every existing form (reading_
-- phase_minutes = null) is completely unaffected — the new condition is
-- structurally unreachable for them.
create or replace function public.mock_submit_answer(p_attempt_id uuid, p_question_id text, p_response jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_attempt public.ali_mock_attempt;
  v_reading_phase_minutes integer;
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

  select f.reading_phase_minutes into v_reading_phase_minutes
    from public.ali_mock_form f where f.id = v_attempt.form_id;
  if v_reading_phase_minutes is not null
     and v_attempt.started_at is not null
     and now() < v_attempt.started_at + make_interval(mins => v_reading_phase_minutes) then
    raise exception 'Attempt % is still in its reading phase (first % minutes) -- answers cannot be submitted yet', p_attempt_id, v_reading_phase_minutes;
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

-- Signatures unchanged from migration 070 (mock_start_attempt(uuid, integer),
-- mock_submit_answer(uuid, text, jsonb)) — existing grants already apply,
-- not restated.

-- ============================================================
-- 5. mock_get_active_form() — subject-aware, backward compatible
-- ============================================================
-- Two full_mock forms (Mathematics, English) must be able to coexist
-- without either shadowing the other. The live function (migration 214)
-- filters only by attempt_type, ordered by created_at desc -- inserting
-- a second full_mock form without this fix would make whichever form is
-- newest silently hide the other from every caller, a real P1 defect
-- for the two-paper model this migration would otherwise introduce.
-- p_subject defaults to NULL, preserving every existing caller's exact
-- current behaviour (app/mocks/page.tsx's own two calls, unchanged,
-- continue to match any subject) -- this is additive, not a redesign of
-- Mathematics or its own discovery behaviour.
drop function if exists public.mock_get_active_form(text);

create function public.mock_get_active_form(p_attempt_type text, p_subject text default null)
returns table (form_id text, attempt_type text, display_name text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select f.id, f.attempt_type, f.composition_provenance ->> 'displayName'
    from public.ali_mock_form f
    where f.active = true
      and f.attempt_type = p_attempt_type
      and (p_subject is null or f.subject = p_subject)
    order by f.created_at desc
    limit 1;
end;
$$;

revoke all on function public.mock_get_active_form(text, text) from public;
grant execute on function public.mock_get_active_form(text, text) to authenticated;

commit;

-- ============================================================
-- 6. Content: promote one already-vetted Q1 row, insert the new
--    English full_mock form (INACTIVE — a deliberate, separate gate)
-- ============================================================
begin;

-- Promotes exactly ONE row (of the 4 already at independently_validated)
-- to mock_eligible — not "all four," per the governing brief's own
-- instruction not to promote merely to inflate inventory. Guarded by the
-- prior-state check so a re-run of this migration is a safe no-op.
update public.ali_question_bank
set eligibility_status = 'mock_eligible',
    marking_mode = 'criterion_rubric'
where id = 'mock-writing-mindchange-01'
  and eligibility_status = 'independently_validated';

-- The new English full_mock form: the existing, unmodified Reading
-- Comprehension Mock 1 manifest (copied via subquery, never hand-
-- transcribed, so it can never silently drift from the real live form)
-- plus the one newly-mock_eligible Q1 Writing item. Q2 is deliberately
-- absent — see this migration's own header and the accompanying report's
-- §E for why (no image-stimulus asset exists; inserting an incomplete
-- Q2 item would violate the brief's own "only promote content that
-- meets the full Mock standard").
--
-- active = false: this form is NOT discoverable via mock_get_active_form()
-- even once this migration is applied. A separate, later, explicit
-- one-line UPDATE (not part of this migration) is the actual "publish"
-- action, kept entirely in the Founder's own hands.
insert into public.ali_mock_form (id, specification_version, attempt_type, subject, question_manifest, reading_phase_minutes, default_duration_minutes, active)
select
  'english-full-mock-v1',
  1,
  'full_mock',
  'english',
  (select question_manifest from public.ali_mock_form where id = 'reading-comprehension-mock-1')
    || jsonb_build_array(jsonb_build_object('question_id', 'mock-writing-mindchange-01', 'section', 'continuous_writing_q1')),
  10,
  70,
  false
where not exists (select 1 from public.ali_mock_form where id = 'english-full-mock-v1');

commit;

-- ============================================================
-- MIGRATION SAFETY REVIEW
-- ============================================================
-- - One new table (ali_writing_assessment), RLS enabled, no write grant
--   to anon/authenticated — writable only via the two new SECURITY
--   DEFINER functions.
-- - Two new functions, ownership/admin-gated exactly like the established
--   mock_claim_evidence_ingestion() / mock_apply_manual_mark() precedents.
-- - Two additive, nullable columns on ali_mock_form — every existing
--   form (both null) is completely unaffected.
-- - mock_start_attempt() and mock_submit_answer(): CREATE OR REPLACE,
--   signatures unchanged, every existing code path preserved verbatim;
--   the only new behaviour is structurally unreachable for any form that
--   does not set the new columns (every form today).
-- - mock_get_active_form(): signature widened with a defaulted parameter
--   (existing 1-arg callers unaffected); the new filter is a no-op when
--   p_subject is omitted.
-- - One UPDATE (guarded, idempotent, touches exactly one pre-identified
--   row) and one guarded INSERT (idempotent, inserts exactly one row,
--   active=false).
-- - Cannot affect Mock scoring, marks, timing, or content for any
--   EXISTING form or attempt — every change here is either additive
--   (new table/columns/functions) or gated to rows/forms this migration
--   itself creates.
--
-- ============================================================
-- RLS REVIEW
-- ============================================================
-- One new RLS-enabled table (ali_writing_assessment), read-your-own-or-
-- admin, no direct write policy of any kind. No existing table's RLS
-- policy is altered.
--
-- ============================================================
-- SECURITY REVIEW
-- ============================================================
-- mock_persist_writing_assessment(): re-derives caller identity from
-- auth.uid(), re-validates attempt ownership, submitted status, question
-- subject/manifest membership, and outcome status itself — never trusts
-- any caller claim beyond the computed assessment values themselves.
-- Reads the original response server-side, never accepting it as a
-- parameter. mock_review_writing_assessment(): admin-only, matching
-- every comparable manual-marking-adjacent function in this codebase.
-- No new trust boundary crossed; no existing grant broadened.
--
-- ============================================================
-- BACKWARD COMPATIBILITY
-- ============================================================
-- Every existing Mock function's signature is either unchanged
-- (mock_start_attempt, mock_submit_answer) or widened with a defaulted
-- parameter (mock_get_active_form) — no existing caller requires any
-- change. The new English form is inserted inactive; no existing
-- discovery/attempt/scoring/report behaviour changes for Mathematics or
-- Reading Comprehension Mock 1 as a result of this migration.
--
-- ============================================================
-- ROLLBACK
-- ============================================================
-- `drop function if exists public.mock_review_writing_assessment(uuid, text, jsonb, text);`
-- `drop function if exists public.mock_persist_writing_assessment(uuid, text, text, integer, integer, jsonb, numeric, text, text[], text);`
-- `drop table if exists public.ali_writing_assessment;`
-- `delete from public.ali_mock_form where id = 'english-full-mock-v1';`
-- `update public.ali_question_bank set eligibility_status = 'independently_validated', marking_mode = null where id = 'mock-writing-mindchange-01';`
-- Restore migration 214's own mock_get_active_form(text) body and
-- migration 070's own mock_start_attempt/mock_submit_answer bodies
-- (both reproduced in full above) if the timing/discovery extensions
-- must also be reverted. Safe at any time — no other object depends on
-- any of these.
