-- Angel Digital 11+ — Migration 254
-- CSSE Two-Paper Mock P1 Repair, recovery-path defect — the third and
-- final defect proven in this repair arc, found via new bounded
-- observability (migration none required for that -- app-code only,
-- previous commit) added to /api/mock-writing-assessment/route.ts:
-- production logs showed mock_get_pending_writing_question_ids()
-- correctly returning 2 pending ids ("pending_count:2") immediately
-- followed by "assessed_count:0" with NO "assess" stage log at all for
-- either question -- proving the route's own for-loop over writingRows
-- never executed even once, i.e. writingRows was empty.
--
-- ============================================================
-- ROOT CAUSE (proven by direct source + policy inspection this session)
-- ============================================================
-- app/api/mock-writing-assessment/route.ts reads question content via a
-- PLAIN, RLS-scoped client call: `callerClient.from("ali_question_bank")
-- .select("id, subject, prompt").in("id", pendingIds)`. The live
-- ali_question_bank_select_all RLS policy (migration 100) is:
--   using (eligibility_status = 'practice_eligible' or is_current_user_admin())
-- Both Writing questions (mock-writing-mindchange-01, eng-q2-picture
-- narrative-oldshed) carry eligibility_status = 'mock_eligible', NOT
-- 'practice_eligible' -- migration 100's own, deliberate Mock/Practice
-- content-isolation boundary. For an ordinary (non-admin) learner
-- session, this RLS policy silently returns zero rows for both
-- questions -- not an error, just empty data -- so `writingRows` ends up
-- `[]` and the assessment loop never runs, exactly matching the observed
-- production log evidence.
--
-- The Reading scoring pipeline never hit this because it reads
-- ali_question_bank from INSIDE its own SECURITY DEFINER functions
-- (mock_claim_reading_scoring_work(), migration 219/251), which execute
-- with the function owner's privileges and therefore bypass this RLS
-- policy entirely, by design, the same way every other privileged Mock
-- read in this codebase already does. mock-writing-assessment's own
-- content read was the one place that pattern was never applied --
-- unreachable until this session, since this is the first English
-- full_mock attempt with a genuinely pending Writing item to ever exist.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES
-- ============================================================
-- Adds ONE new, narrow, read-only SECURITY DEFINER function,
-- mock_get_writing_question_content(p_attempt_id), that internally calls
-- the EXISTING mock_get_pending_writing_question_ids() (migration 253,
-- not reimplemented) to derive the caller's own pending Writing question
-- ids, then returns exactly (id, prompt) for those ids where subject =
-- 'writing' -- bypassing ali_question_bank's RLS the same way every
-- other Mock content-delivery function in this codebase already does
-- (mock_get_question(), migration 070), never by relaxing the policy
-- itself.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch ali_question_bank_select_all or any other RLS policy --
-- the Mock/Practice content-isolation boundary migration 100 established
-- remains exactly as strict as it is today for every other caller and
-- every other read path. Does not touch mock_get_pending_writing_
-- question_ids() (migration 253, called, never modified), mock_persist_
-- writing_assessment(), mock_check_and_complete_scoring(), or any Reading/
-- Mathematics function. Does not create a second recovery architecture --
-- this is one additive lookup the existing route now calls instead of a
-- plain table read that RLS was always going to block for this content.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migration 253 (this
-- same repair arc) has already been applied.

begin;

create or replace function public.mock_get_writing_question_content(p_attempt_id uuid)
returns table (question_id text, prompt jsonb)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pending_ids text[];
begin
  v_pending_ids := public.mock_get_pending_writing_question_ids(p_attempt_id);

  return query
    select b.id, b.prompt
    from public.ali_question_bank b
    where b.id = any(v_pending_ids) and b.subject = 'writing';
end;
$$;

revoke all on function public.mock_get_writing_question_content(uuid) from public;
grant execute on function public.mock_get_writing_question_content(uuid) to authenticated;
revoke execute on function public.mock_get_writing_question_content(uuid) from anon;

commit;

-- Read-only verification (run before and after applying):
--
-- select pg_get_functiondef('public.mock_get_writing_question_content(uuid)'::regprocedure);
--
-- Expected AFTER applying: the function exists, is SECURITY DEFINER, and
-- its body calls "public.mock_get_pending_writing_question_ids(p_attempt_id)"
-- (never reimplementing that ownership/pending logic) and filters on
-- "subject = 'writing'".
