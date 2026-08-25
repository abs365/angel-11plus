-- Angel Digital 11+ — Migration 115
-- Structured Assessment Stimulus — mock_get_question() Delivery
-- (Decision 170, Founder-directed prerequisite to migrations 113/114).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Decision 169's own Pre-Production Quality Gate found the newline-
-- separated pseudo-table used to present mock-mr09-runningclub's shared
-- dataset does not meet a genuine production tabular-presentation
-- standard on either the learner surface (no semantic table markup
-- anywhere in this codebase, confirmed by direct search) or the admin
-- review surface (the grouped-review question text does not even
-- preserve newlines, confirmed by direct reading of app/admin-beta/
-- review/page.tsx). The Founder directed a small, generic prerequisite
-- rather than accepting that presentation as final. This migration is
-- the DATA-DELIVERY half of that prerequisite (mirroring migration
-- 106's own precedent exactly: migration 106 closed the equivalent
-- delivery gap for grouping metadata; the client-side half — lib/
-- mockAttempt/types.ts's MockStimulus type, lib/mockAttempt/workspace.
-- ts's isValidTableStimulus()/selectDisplayUnitStimulus(), components/
-- mockAttempt/DataTableStimulus.tsx, and both the learner and admin
-- review surfaces — is committed in the SAME Decision, NOT part of this
-- SQL file).
--
-- ============================================================
-- WHAT THIS MIGRATION DOES
-- ============================================================
-- mock_get_question(uuid, text) (migration 070, extended by migration
-- 106): CREATE OR REPLACE, full body reproduced (required — Postgres
-- cannot patch a function body), every existing line byte-identical
-- except one new key added to the function's own explicit
-- jsonb_build_object() allow-list: 'stimulus', read directly from
-- ali_question_bank.prompt->'stimulus'. NOT a new table column — prompt
-- is already jsonb (migration 005); every row that has never set this
-- key (every row before this migration, and every row since with no
-- shared dataset) returns SQL NULL for it, exactly as absent. No
-- ALTER TABLE, no new constraint, no backfill.
--
-- Ownership/in_progress/expiry/manifest-membership checks are
-- byte-identical to migration 106's own body. mock_get_attempt_grouping
-- (uuid) is DELIBERATELY NOT touched — it returns grouping identity
-- only, never question content (migration 106's own established
-- discipline), and a shared stimulus is content, delivered through
-- mock_get_question() like `question`/`marks` already are, fetched once
-- per navigated-to question exactly as those fields are today. Neither
-- function needs to change its own de-duplication behaviour — the
-- client renders one shared stimulus per DISPLAY UNIT via
-- selectDisplayUnitStimulus() (lib/mockAttempt/workspace.ts), never a
-- server-side or database-side concern.
--
-- ============================================================
-- SECURITY / PRIVILEGE AUDIT (explicit, per the Founder's own repeated
-- directive that this defect class has occurred before in this project
-- — migrations 071/073/086's own anon-EXECUTE omissions)
-- ============================================================
-- This is the SAME function (name, argument types, return type) as
-- migration 106 left it — Postgres preserves existing GRANT/REVOKE
-- state across a CREATE OR REPLACE when the signature is unchanged, so
-- no privilege actually changes here. The revoke/grant pair below is
-- RESTATED explicitly anyway, matching migration 106's own precedent
-- ("Grants unchanged... re-stated here only for clarity, not because it
-- needs re-applying") and the Founder's own explicit instruction not to
-- assume a bare `revoke ... from public` is sufficient: `revoke all ...
-- from public` is issued first, then `grant execute ... to
-- authenticated` — anon is never granted EXECUTE at any point, verified
-- by a dedicated structural test (no `grant` statement targeting `anon`
-- appears anywhere in this file).
--
-- The new field exposes only the dataset the question is genuinely
-- about (headers/rows of already-authored, non-secret prompt content),
-- never `answer`/`acceptedAnswers`/`workingSteps`/`explanation`/
-- `modelAnswer`/`addressesMisconception`/`reviewMetadata`/`provenance`
-- (PROTECTED_MOCK_FIELDS, lib/mockAttempt/types.ts) — the function's
-- own allow-list remains hand-picked and explicit, one field longer,
-- never `select *`. Ownership/attempt-status/manifest-membership checks
-- are unchanged, so "only the authorised attempt's own assigned
-- questions" remains true of the new field exactly as of every existing
-- one. Practice is unreachable by this migration (it never queries
-- mock_get_question at all — a distinct, unrelated function/table
-- path). Mock eligibility isolation is unaffected — this migration
-- never reads or writes eligibility_status.
--
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not add or alter any table, column, index, or constraint. Does
-- not touch mock_get_attempt_grouping, mock_score_attempt,
-- mock_attempt_report_init, mock_release_report, mock_submit_answer,
-- mock_submit_attempt, mock_create_attempt, mock_start_attempt,
-- mock_set_flag, or any other Mock cycle function. Does not change
-- eligibility_status, grouping metadata, or any row's content. Does not
-- create, modify, or activate any ali_mock_form row. Does not touch
-- English or Writing content, Practice, or any RLS policy.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migration 106 (the
-- function this migration re-replaces) has already been applied. Must
-- be applied together with (or before) migrations 113/114 for
-- mock-mr09-runningclub's stimulus to actually be deliverable — without
-- this migration, mock_get_question() would simply omit `stimulus` from
-- its response (the old allow-list), which the client-side redaction
-- check (lib/mockAttempt/redaction.ts) treats as "no stimulus" (fails
-- safe to the plain-text question only, never crashes).

begin;

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

  -- Hand-picked, explicit allow-list -- still never "select * minus a
  -- few fields." One new key (this migration's own correction):
  -- stimulus, read straight from ali_question_bank.prompt, null on
  -- every row that has never set it exactly as absent.
  return jsonb_build_object(
    'questionId', v_row.id,
    'subject', v_row.subject,
    'skill', v_row.skill,
    'question', v_row.prompt->'question',
    'marks', v_row.prompt->'marks',
    'contentDifficulty', v_row.content_difficulty,
    'questionGroupId', v_row.question_group_id,
    'groupOrder', v_row.group_order,
    'subpartLabel', v_row.subpart_label,
    'stimulus', v_row.prompt->'stimulus'
  );
end;
$$;

-- Grants restated explicitly, per the Founder's own directive not to
-- assume this is unnecessary -- authenticated only, anon never granted.
revoke all on function public.mock_get_question(uuid, text) from public;
grant execute on function public.mock_get_question(uuid, text) to authenticated;

commit;
