-- Angel Digital 11+ — Migration 218
-- Programme Completion Increment 016 (production defect correction):
-- mock_get_question() never returned passageTitle/passageText, so
-- Reading Comprehension Mock 1's first genuine production sitting
-- reached its questions with no passage to read.
--
-- ============================================================
-- ROOT CAUSE, confirmed against the live, current function definition
-- ============================================================
-- mock_get_question() (migration 070, redefined by 106/115/122) returns
-- a hand-picked, explicit allow-list of exactly 11 keys: questionId,
-- subject, skill, question, marks, contentDifficulty, questionGroupId,
-- groupOrder, subpartLabel, stimulus, sharedStem. No passageTitle, no
-- passageText -- because every one of those three prior redefinitions
-- (grouping, structured stimulus, shared stem) was authored entirely
-- against Mathematics content, which never has a passage. It does NOT
-- fetch a separate passage record and does NOT need to: every Reading
-- question's own prompt JSONB already carries its passage inline
-- (confirmed directly this session against the real content -- e.g.
-- mock-eng-boathouse-q01's prompt has "passageTitle":"The Boat in the
-- Boathouse","passageText":"Two summers ago..." -- this project's own
-- established convention, "each Practice question carries its own
-- passage text inline in its prompt JSON," applies identically to Mock
-- content since it is the exact same table/column). The data was never
-- missing from the database -- only omitted from what the server
-- chooses to return to the client.
--
-- ============================================================
-- THE FIX, mirroring this function's own three prior corrections exactly
-- ============================================================
-- Adds passageTitle/passageText to the same explicit allow-list, read
-- straight from ali_question_bank.prompt exactly like every other key --
-- null for every Mathematics row (which has never set these keys), byte-
-- identical behaviour for every existing Mathematics question. Nothing
-- else about this function changes: same signature, same security
-- boundary (attempt ownership, in_progress status, not-expired, manifest
-- membership all re-checked exactly as before), same grants.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query. This is the one migration
-- required before the existing first Reading attempt (or any future one)
-- can render its passages -- see this increment's own report for the
-- read-only check on whether the existing attempt is still safely
-- resumable.

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
  -- few fields." Two new keys (this migration's own correction):
  -- passageTitle/passageText, read straight from ali_question_bank.
  -- prompt, null on every row that has never set them (every
  -- Mathematics row, exactly as before this migration) -- exactly the
  -- same "additive, null when absent" discipline sharedStem (migration
  -- 122) and stimulus (migration 115) already established.
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
    'sharedStem', v_row.prompt->'sharedStem',
    'passageTitle', v_row.prompt->'passageTitle',
    'passageText', v_row.prompt->'passageText'
  );
end;
$$;

-- Grants restated explicitly, matching every prior redefinition of this
-- function -- authenticated only, anon never granted.
revoke all on function public.mock_get_question(uuid, text) from public;
grant execute on function public.mock_get_question(uuid, text) to authenticated;
revoke execute on function public.mock_get_question(uuid, text) from anon;

commit;

-- Read-only verification (run before and after applying):
-- select mock_get_question(
--   '<a real, your-own, in_progress attempt id>'::uuid,
--   'mock-eng-boathouse-q01'
-- );
-- -- expect the result to include non-null "passageTitle" and
-- -- "passageText" keys for this question, and unchanged behaviour
-- -- (all null passage fields) for any Mathematics question id.
