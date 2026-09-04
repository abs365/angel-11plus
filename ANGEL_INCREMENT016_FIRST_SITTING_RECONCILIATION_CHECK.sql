-- Angel Digital 11+ — Increment 016, post-submission reconciliation
-- READ-ONLY. Two SELECTs, nothing else. No INSERT/UPDATE/DELETE/UPSERT/
-- DDL, no RPC call of any kind (not even a read-only one) -- both queries
-- read directly from tables/catalog, so nothing executes as your
-- session's identity through any SECURITY DEFINER path. Run both in
-- Supabase Dashboard > SQL Editor.
--
-- Selects only aggregate/state columns -- never question_outcomes (which
-- would show per-question status), never any answer, model answer, or
-- protected content.

-- ============================================================
-- QUERY 1 — which attempt was submitted, and its full lifecycle +
-- pipeline state (Sections 1 and 2 of the Founder's directive)
-- ============================================================
select
  a.id as attempt_id,
  a.profile_id,
  a.form_id,
  a.attempt_type,
  a.status as attempt_status,
  a.started_at,
  a.expires_at,
  a.submitted_at,
  r.scoring_state,
  r.analysis_state,
  r.report_release_state,
  r.marking_version,
  r.analysis_version,
  r.analysed_at,
  r.released_at,
  r.overall,               -- rawMarksAchieved/rawMarksAvailable/percentage/counts only, no per-question detail
  r.subject_breakdown       -- should read 'english' once analysis_state = 'complete', per migration 215
from public.ali_mock_attempt a
left join public.ali_mock_attempt_report r on r.attempt_id = a.id
where a.form_id = 'reading-comprehension-mock-1'
order by a.created_at desc
limit 5;

-- ============================================================
-- QUERY 2 — confirms migration 215 (subject_breakdown english/mathematics
-- correction) is genuinely the LIVE function definition, not merely
-- committed/pushed. Pure catalog introspection, touches no data.
-- ============================================================
select
  (pg_get_functiondef('public.mock_analyse_attempt(uuid)'::regprocedure) like '%v_is_english_attempt%') as migration_215_is_live;
