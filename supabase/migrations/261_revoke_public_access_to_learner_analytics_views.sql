-- Angel 11+ — Migration 261
-- Controlled-beta access-control fix: the four derived learner analytics views were readable with the PUBLIC
-- anon key.
--
-- FINDING (production, 2026-09-21): public.profile_summary, public.recent_activity, public.lesson_analytics and
-- public.subject_analytics (all created by migration 003) returned every learner's derived data -- profile ids,
-- device ids, auth user ids, XP, streaks, activity dates, per-lesson subjects and scores -- to any caller holding
-- the public anon key, with no session at all.
--
-- ROOT CAUSE: views run with their OWNER's rights by default, so the row-level security on the underlying tables
-- (profiles, user_stats, lesson_progress) was bypassed, and Supabase's default privileges had granted SELECT on
-- the views to anon and authenticated.
--
-- CORRECTION (two independent layers, both narrowing; nothing here widens any permission):
--   1. Remove every client-role privilege on the four views. Nothing in the application reads them (verified: the
--      only reference in the repository is migration 003), so no legitimate reader loses access. The table
--      owner and service_role are not touched, so the Supabase dashboard / SQL editor and any service-side
--      reporting keep working.
--   2. Make each view run with the CALLER's rights (security_invoker). Should a client privilege ever be granted
--      again, whether deliberately or by a default-privilege accident, the underlying-table RLS then applies to
--      the caller, so one learner's data can never be read through a view by another account.
--
-- Scope: only these four views. No table, policy, function, learner evidence, or earlier migration is changed.
-- Migration 260 is untouched. Safe to re-run (revoke and alter view ... set are idempotent).
--
-- Rollback (only if ever needed; it would re-expose the data): grant select on the four views to anon,
-- authenticated; alter view <name> reset (security_invoker);
--
-- Run in: Supabase Dashboard > SQL Editor > New query (same process as migrations 250-260).

revoke all on public.profile_summary, public.recent_activity, public.lesson_analytics, public.subject_analytics from public, anon, authenticated;

alter view public.profile_summary   set (security_invoker = true);
alter view public.recent_activity   set (security_invoker = true);
alter view public.lesson_analytics  set (security_invoker = true);
alter view public.subject_analytics set (security_invoker = true);
