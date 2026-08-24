-- Angel Digital 11+ — Migration 106
-- Mathematics First Mock Form-Assembly Gate — Grouped-Question Learner
-- Rendering Compatibility (Decision 161).
--
-- ROOT FINDING, confirmed by direct source reading before writing a
-- single line (this increment's own mandatory Section 7 trace): the real
-- learner-facing Mock workspace (app/learning-intelligence/mock-exam/
-- page.tsx, via mock_get_question() migration 070 and
-- mock_get_attempt_manifest() migration 072) has NO grouping awareness
-- at any layer. mock_get_question()'s own explicit, hand-picked
-- allow-list does not include question_group_id/group_order/
-- subpart_label at all -- the server never tells the client a question
-- is part of a group. mock_get_attempt_manifest() returns a flat
-- text[] of raw IDs with no structure. The learner page therefore
-- renders each of mock-mr01mr10-costumeschedule's 4 promoted subpart
-- rows as 4 separate, disconnected, flatly-numbered questions ("Question
-- 5 of N" / "Question 6 of N" / ...), never as "Question 5 (a) ... (b)
-- ..." -- the coherent, single-numbered-question structure the content
-- was actually authored and reviewed as (migration 095's own header,
-- Decision 155's admin-review grouping fix). Decision 155's fix reaches
-- ONLY the admin review surface (lib/adminReview.ts's own
-- groupQuestionsForReview(), never imported by the learner page) -- it
-- was never a claim about learner rendering, and this migration does
-- not assume otherwise.
--
-- This is a genuine, confirmed learner-experience defect, not a
-- cosmetic one: an authentic CSSE paper presents a compound scenario as
-- one numbered question with lettered subparts, and a learner sitting a
-- Mock containing this family today would see it misrepresented as two
-- unrelated extra questions with an inflated, incorrect total count.
--
-- WHAT THIS MIGRATION DOES: closes the DATA-DELIVERY half of that gap
-- (the two additive, read-only changes below) so the client-side half
-- (a bounded change to lib/mockAttempt/*, components/mockAttempt/*, and
-- app/learning-intelligence/mock-exam/page.tsx, committed in this same
-- Decision, NOT part of this SQL file) has real grouping metadata to
-- render from, rather than guessing from ID-string patterns -- migration
-- 104's own header already rejected id-string pattern-matching as "not
-- a defensible foundation for a real learner's result," and this
-- migration holds the client-rendering fix to the same standard.
--
-- 1. mock_get_question(uuid, text) (migration 070): CREATE OR REPLACE,
--    full body reproduced (required -- Postgres cannot patch a function
--    body), every existing line unchanged except three new keys added to
--    the function's own explicit jsonb_build_object() allow-list:
--    questionGroupId, groupOrder, subpartLabel. All three are read
--    directly from ali_question_bank (the same columns migration 093
--    added and migration 104 already proved safe to expose -- migration
--    104 added them to the POST-SUBMISSION scoring outcome; this
--    migration adds the identical three fields to the PRE-SUBMISSION
--    question payload, for the same reason: neither is in
--    PROTECTED_MOCK_FIELDS (lib/mockAttempt/types.ts) or
--    ali_family_review/provenance data -- a question's own grouping
--    identity is structural metadata about the paper, not part of its
--    answer). Ownership/in_progress/expiry/manifest-membership checks
--    are byte-identical to migration 070's own body.
--
-- 2. mock_get_attempt_grouping(uuid) (NEW function): returns a jsonb
--    array of {questionId, questionGroupId, groupOrder, subpartLabel}
--    for every id in the caller's own attempt's assigned_question_ids --
--    IDs and grouping identity only, never question content, mirroring
--    mock_get_attempt_manifest()'s own "IDs only" discipline (migration
--    072) exactly, extended by exactly the same three non-protected
--    fields as change 1 above. Exists because the learner workspace must
--    know the FULL grouping structure of every assigned question up
--    front (to compute correct "Question N of Total" counts and palette
--    entries before the learner has visited every question), which a
--    per-question call alone cannot provide. Same ownership check as
--    mock_get_attempt_manifest(), no status/expiry check -- also
--    matching mock_get_attempt_manifest()'s own precedent exactly (a
--    metadata listing, not an answer-affecting action).
--
-- SCOPE: Mathematics-only in effect (the only subject with any grouped
-- mock_eligible content today, confirmed by direct migration search),
-- though both changes are written generically -- exactly matching
-- migration 104's own "Mathematics-only scope, generically-written code"
-- framing. Neither change alters English/Writing content, scoring,
-- eligibility, or any table structure.
--
-- WHAT THIS MIGRATION DOES NOT DO: does not add or alter any table,
-- column, policy, or trigger; does not touch mock_score_attempt,
-- mock_attempt_report_init, mock_submit_answer, mock_submit_attempt,
-- mock_create_attempt, mock_start_attempt, mock_set_flag, or any Mock
-- cycle function (migration 085) -- that is a separate, disclosed
-- learner-attempt-creation gap, addressed separately (migration 107,
-- same Decision); does not change eligibility_status or ali_mock_form;
-- does not assemble or activate any Mock form; does not implement
-- English or Writing grouped rendering (no such content exists); does
-- not weaken the existing field-level redaction boundary -- the
-- allow-list remains hand-picked and explicit, just three fields longer.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 070-072
-- (the proven Mock attempt/lifecycle engine) and 093/095 (the grouping
-- columns and their first real data) have already been applied.

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
  -- few fields." Three new keys (this migration's own correction):
  -- questionGroupId/groupOrder/subpartLabel, read straight from
  -- ali_question_bank, null on every standalone row exactly as
  -- migration 093 left them.
  return jsonb_build_object(
    'questionId', v_row.id,
    'subject', v_row.subject,
    'skill', v_row.skill,
    'question', v_row.prompt->'question',
    'marks', v_row.prompt->'marks',
    'contentDifficulty', v_row.content_difficulty,
    'questionGroupId', v_row.question_group_id,
    'groupOrder', v_row.group_order,
    'subpartLabel', v_row.subpart_label
  );
end;
$$;

-- Grants unchanged from migration 071 (authenticated only, never anon) --
-- re-stated here only for clarity, not because it needs re-applying.
revoke all on function public.mock_get_question(uuid, text) from public;
grant execute on function public.mock_get_question(uuid, text) to authenticated;

-- Returns the caller's own attempt's grouping structure, IDs and
-- grouping identity only -- never question content. See this
-- migration's own header, item 2, for why this exists as a separate,
-- new, additive function rather than a change to
-- mock_get_attempt_manifest()'s own return type (which Postgres cannot
-- do via CREATE OR REPLACE without a DROP -- a strictly larger, riskier
-- change this migration deliberately avoids).
create or replace function public.mock_get_attempt_grouping(p_attempt_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_ids text[];
  v_result jsonb;
begin
  select id into v_profile_id from public.profiles where auth_user_id = auth.uid();

  select assigned_question_ids into v_ids
    from public.ali_mock_attempt
    where id = p_attempt_id and profile_id = v_profile_id;
  if not found then
    raise exception 'Attempt % not found for caller', p_attempt_id;
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'questionId', b.id,
        'questionGroupId', b.question_group_id,
        'groupOrder', b.group_order,
        'subpartLabel', b.subpart_label
      )
      order by array_position(v_ids, b.id)
    ),
    '[]'::jsonb
  )
  into v_result
  from public.ali_question_bank b
  where b.id = any(v_ids);

  return v_result;
end;
$$;
revoke all on function public.mock_get_attempt_grouping(uuid) from public;
grant execute on function public.mock_get_attempt_grouping(uuid) to authenticated;

commit;
