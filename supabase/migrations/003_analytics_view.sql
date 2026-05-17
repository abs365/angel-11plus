-- Angel Digital 11+ — Migration 003
-- Analytics aggregation views built on top of lesson_progress.
-- These views are read-only and safe to create at any point.
-- Run in: Supabase Dashboard > SQL Editor > New query

-- ============================================================
-- subject_analytics
-- Per-profile, per-subject aggregate: avg score, sessions, best score.
-- ============================================================
create or replace view public.subject_analytics as
select
  lp.profile_id,
  lp.subject,
  count(*)                                    as total_sessions,
  round(avg(lp.score)::numeric, 1)           as avg_score,
  max(lp.score)                               as best_score,
  sum(lp.xp_gained)                           as total_xp,
  max(lp.completed_at)                        as last_attempt
from public.lesson_progress lp
group by lp.profile_id, lp.subject;

-- ============================================================
-- lesson_analytics
-- Per-profile, per-lesson: best score and attempt count.
-- ============================================================
create or replace view public.lesson_analytics as
select
  lp.profile_id,
  lp.lesson_id,
  lp.subject,
  count(*)                                    as attempts,
  max(lp.score)                               as best_score,
  round(avg(lp.score)::numeric, 1)           as avg_score,
  max(lp.completed_at)                        as last_attempt
from public.lesson_progress lp
group by lp.profile_id, lp.lesson_id, lp.subject;

-- ============================================================
-- recent_activity
-- Last 10 completed sessions per profile, ordered by time.
-- ============================================================
create or replace view public.recent_activity as
select
  lp.profile_id,
  lp.lesson_id,
  lp.subject,
  lp.score,
  lp.xp_gained,
  lp.completed_at
from public.lesson_progress lp
order by lp.completed_at desc;

-- ============================================================
-- profile_summary
-- Joined snapshot: profile info + aggregate stats.
-- ============================================================
create or replace view public.profile_summary as
select
  p.id             as profile_id,
  p.device_id,
  p.name,
  p.auth_user_id,
  p.created_at,
  us.total_xp,
  us.streak,
  us.last_activity,
  coalesce(
    (select count(*) from public.lesson_progress lp where lp.profile_id = p.id),
    0
  )                as total_sessions
from public.profiles p
left join public.user_stats us on us.profile_id = p.id;
