-- Angel Digital 11+ — Diagnostic for the Profile A / Profile B contamination
-- observed this session (Gate 3 blocker). READ-ONLY: every statement is a
-- SELECT, nothing is inserted, updated, or deleted. Run via Supabase
-- Dashboard > SQL Editor > New query.
--
-- The device_id below is the exact value this session observed in the
-- contaminated browser's localStorage throughout both the Profile A and
-- Profile B portions of this session.

with target as (
  select '92d2df56-e33a-4787-ac9b-1f33c52ddae3'::text as device_id
)

-- 1. How many profiles rows exist for this device_id? If exactly one, that
-- is direct proof Profile A's own original profile row was reassigned
-- in place (not that a second, separate row was created for Profile B).
select
  p.id as profile_id,
  p.device_id,
  p.auth_user_id,
  p.name,
  p.created_at as profile_created_at,
  u.email as current_owner_email,
  u.created_at as current_owner_account_created_at,
  u.is_anonymous as current_owner_is_anonymous,
  (select count(*) from public.lesson_progress lp where lp.profile_id = p.id) as lesson_progress_rows,
  (select count(*) from public.ali_student_question_history h where h.profile_id = p.id) as question_history_rows,
  (select coalesce(us.total_xp, 0) from public.user_stats us where us.profile_id = p.id) as total_xp,
  (select count(*) from public.ali_durable_mastery m where m.profile_id = p.id) as durable_mastery_rows,
  (select min(completed_at) from public.lesson_progress lp where lp.profile_id = p.id) as earliest_evidence_at,
  (select max(completed_at) from public.lesson_progress lp where lp.profile_id = p.id) as latest_evidence_at
from public.profiles p
left join auth.users u on u.id = p.auth_user_id
join target t on p.device_id = t.device_id;

-- 2. Evidence written specifically during the Profile B Mathematics
-- session identified in the transcript (8 questions, arithmetic/algebra/
-- geometry/number-properties competencies, within the last few hours of
-- whenever you run this). Cross-reference completed_at against the
-- session's own known timing to see exactly which rows are newly-written
-- vs pre-existing.
select lp.id, lp.profile_id, lp.lesson_id, lp.subject, lp.score, lp.completed_at
from public.lesson_progress lp
join public.profiles p on p.id = lp.profile_id
join target t on p.device_id = t.device_id
order by lp.completed_at desc
limit 20;

-- 3. Sanity check: does more than one profiles row currently have
-- auth_user_id pointing at the SAME auth.users row as the device_id
-- profile above? (Should never happen — auth_user_id is UNIQUE per
-- migration 002 — this just makes that constraint's live state visible
-- rather than assumed.)
select p.id, p.device_id, p.auth_user_id, p.created_at
from public.profiles p
where p.auth_user_id = (
  select auth_user_id from public.profiles pp
  join target t on pp.device_id = t.device_id
);
