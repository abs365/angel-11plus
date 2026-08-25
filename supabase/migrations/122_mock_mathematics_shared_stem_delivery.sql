-- Angel Digital 11+ — Migration 122
-- Shared-Scenario Presentation Correction — mock_get_question() Delivery
-- of prompt.sharedStem (Decision 180).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Migration 121 adds an explicit `prompt.sharedStem` content-contract
-- key to mock-mr06-linkedvalues's 3 rows (and, in future, to any other
-- genuine shared-scenario family that adopts the same contract). Mirrors
-- migration 115's own precedent exactly for `stimulus`: mock_get_question
-- ()'s own return shape is a hand-picked, explicit allow-list, never
-- `select *`, so a new prompt key is invisible to the learner surface
-- until this function is explicitly extended to include it. Without this
-- migration, migration 121's own database write would have zero effect
-- on what a learner ever sees -- the field would exist in the database
-- but never reach lib/mockAttempt/workspace.ts's own
-- resolveGroupSharedStem() on the client, which the Founder's own
-- instruction explicitly required verified, not assumed ("do not assume
-- the problem is review-only").
--
-- ============================================================
-- WHAT THIS MIGRATION DOES
-- ============================================================
-- mock_get_question(uuid, text) (migration 070, extended by 106, then
-- 115): CREATE OR REPLACE, full body reproduced (required -- Postgres
-- cannot patch a function body), every existing line byte-identical
-- except one new key added to the function's own explicit
-- jsonb_build_object() allow-list: 'sharedStem', read directly from
-- ali_question_bank.prompt->'sharedStem'. NOT a new table column --
-- prompt is already jsonb; every row that has never set this key
-- (every row before migration 121, and every row since with no genuine
-- shared stem) returns SQL NULL for it, exactly as absent. No ALTER
-- TABLE, no new constraint, no backfill.
--
-- ============================================================
-- SECURITY / PRIVILEGE AUDIT (explicit, per the Founder's own repeated
-- directive that this defect class has occurred before -- migrations
-- 071/073/086's own anon-EXECUTE omissions)
-- ============================================================
-- Same function (name, argument types, return type) as migration 115
-- left it -- Postgres preserves existing GRANT/REVOKE state across a
-- CREATE OR REPLACE when the signature is unchanged, so no privilege
-- actually changes here. The revoke/grant pair is RESTATED explicitly
-- anyway, matching migration 106/115's own precedent: `revoke all ...
-- from public` issued first, then `grant execute ... to authenticated`
-- -- anon is never granted EXECUTE at any point, verified by a dedicated
-- structural test (no `grant` statement targeting `anon` appears
-- anywhere in this file).
--
-- The new field exposes only the already-authored, non-secret shared
-- scenario prose the question's own subparts already individually
-- restate in full -- it discloses NOTHING the learner could not already
-- read inside every subpart's own `question` field today. Never
-- `answer`/`acceptedAnswers`/`workingSteps`/`explanation`/`modelAnswer`/
-- `addressesMisconception`/`reviewMetadata`/`provenance`
-- (PROTECTED_MOCK_FIELDS, lib/mockAttempt/types.ts) -- the function's
-- own allow-list remains hand-picked and explicit, one field longer,
-- never `select *`. Ownership/attempt-status/manifest-membership checks
-- are unchanged, so "only the authorised attempt's own assigned
-- questions" remains true of the new field exactly as of every existing
-- one. Practice is unreachable by this migration. Mock eligibility
-- isolation is unaffected -- this migration never reads or writes
-- eligibility_status.
--
-- ============================================================
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
-- Supabase Dashboard > SQL Editor > New query, after migration 115 (the
-- function this migration re-replaces) and migration 121 (which writes
-- the sharedStem key this function reads) have already been applied.
-- Applying this migration before 121 is safe (every row simply returns
-- SQL NULL for sharedStem, exactly as absent) but delivers nothing new
-- until 121 is also applied.

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
  -- sharedStem, read straight from ali_question_bank.prompt, null on
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
    'stimulus', v_row.prompt->'stimulus',
    'sharedStem', v_row.prompt->'sharedStem'
  );
end;
$$;

-- Grants restated explicitly, per the Founder's own directive not to
-- assume this is unnecessary -- authenticated only, anon never granted.
revoke all on function public.mock_get_question(uuid, text) from public;
grant execute on function public.mock_get_question(uuid, text) to authenticated;

commit;
