-- Angel Digital 11+ — Increment 016, controlled production scoring
-- verification. READ-ONLY. One SELECT, nothing else -- no data mutation,
-- no RPC call of any kind. Run in Supabase Dashboard > SQL Editor.
--
-- question_outcomes only ever contains {questionId, status, marksAwarded,
-- marksAvailable, questionTypeId} -- migration 219's own persistence
-- function never writes answer/expected-answer content into it -- safe to
-- view in full.

select
  a.id as attempt_id,
  a.form_id,
  a.attempt_type,
  a.status as attempt_status,
  a.submitted_at,
  r.scoring_state,
  r.marking_version,
  r.analysis_state,
  r.report_release_state,
  r.overall,
  r.question_outcomes
from public.ali_mock_attempt a
join public.ali_mock_attempt_report r on r.attempt_id = a.id
where a.form_id = 'reading-comprehension-mock-1'
order by a.created_at desc
limit 1;
