-- Angel Digital 11+ — Migration 014
-- Capability 3, Wave 4 — Platform Recovery
--
-- ROOT CAUSE, confirmed by live testing 2026-07-20 (same method as PR-001 /
-- migration 012): anonymous POST to /rest/v1/user_stats and
-- /rest/v1/lesson_progress both return the identical RLS violation already
-- found on `profiles` — `42501 "new row violates row-level security
-- policy"`. No migration in this repo ever added an INSERT policy for
-- either table (migration 001 created both with RLS disabled by design;
-- nothing since has touched their RLS state) — exactly the same
-- undocumented, out-of-band drift PR-001 found and corrected on `profiles`.
--
-- CORRECTION — same minimum-safe shape as migration 012, for consistency
-- and for the same reasons (Section 3 of that migration's own comment
-- applies identically here: a device-scoped check would require a
-- session-variable pass-through this codebase does not implement, and
-- both tables' data — XP/streak counters, per-lesson scores — carries the
-- same low sensitivity as `profiles`, already effectively unrestricted on
-- the SELECT/UPDATE side wherever RLS allows any access at all today).
--
-- Also documented in project history: a separate, earlier investigation
-- (docs/operations/PROFILES_RLS_INVESTIGATION.md /
-- RESTORE_PRODUCTION_VALIDATION.md, 2026-07-03) reached the same root
-- cause for `profiles` alone and recommended disabling RLS outright
-- instead of adding policies; that fix was applied, validated working,
-- and has since silently reverted (confirmed by this Wave's own fresh
-- test). This migration takes the same approach as migration 012 (add
-- explicit policies, leave RLS enabled) rather than disabling RLS again,
-- since a disable-only fix has already been shown to not persist —
-- flagged as a Founder decision in CAP4_LAUNCH_ACCEPTANCE_PACK.md, not
-- resolved unilaterally here.
--
-- Run this in: Supabase Dashboard > SQL Editor > New query

alter table public.user_stats enable row level security;

drop policy if exists user_stats_allow_anonymous_insert on public.user_stats;
create policy user_stats_allow_anonymous_insert
  on public.user_stats
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists user_stats_allow_anonymous_update on public.user_stats;
create policy user_stats_allow_anonymous_update
  on public.user_stats
  for update
  to anon, authenticated
  using (true)
  with check (true);

alter table public.lesson_progress enable row level security;

drop policy if exists lesson_progress_allow_anonymous_insert on public.lesson_progress;
create policy lesson_progress_allow_anonymous_insert
  on public.lesson_progress
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists lesson_progress_allow_anonymous_update on public.lesson_progress;
create policy lesson_progress_allow_anonymous_update
  on public.lesson_progress
  for update
  to anon, authenticated
  using (true)
  with check (true);
