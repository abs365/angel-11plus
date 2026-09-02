-- Angel Digital 11+ — Migration 188
-- Identity / Evidence Isolation — DEFENCE-IN-DEPTH correction (Gate 3,
-- this session).
--
-- ============================================================
-- CLASSIFICATION (Founder-reviewed) -- read this before the rationale
-- below
-- ============================================================
-- This migration is DEFENCE IN DEPTH, not a root-cause fix for any
-- specific observed incident. The Profile A/B session that originally
-- prompted this investigation was traced, with database confirmation, to
-- a browser/session-state issue (the browser never actually switched
-- Supabase identity away from a single long-lived anonymous session) --
-- not to claim_legacy_profile() reassigning a profile across two
-- distinct authenticated accounts. That theory was formally withdrawn.
-- No production evidence exists of a profile ever having been
-- successfully claimed away from one authenticated learner by another.
--
-- This migration is still worth applying on its own architectural
-- merits, described below: the underlying WHERE clause weakness it
-- closes is real, independent of whether it has yet been observed to
-- fire in production. It intentionally defers automatic recovery of
-- evidence-bearing anonymous history in favour of learner-identity
-- safety, rather than risking one learner ever inheriting another's
-- educational record. It is not, and must not be presented as, permanent
-- completion of anonymous-to-authenticated continuity -- see the
-- companion note in ALI_DECISION_LOG.md / the Gate 3 Founder Handoff for
-- the deferred "secure anonymous-to-authenticated continuity" follow-up.
--
-- ============================================================
-- RATIONALE (the architectural weakness this closes, independent of any
-- one incident)
-- ============================================================
-- Migration 019 introduced claim_legacy_profile(p_device_id) so a learner
-- who used the app anonymously before signing up could keep their XP/
-- scores/evidence when they later create a real account on the SAME
-- device. Its WHERE clause (`auth_user_id is null`) already, correctly,
-- refuses to touch a profile some OTHER authenticated learner already
-- owns -- that half of the security model was sound and is unchanged.
--
-- The gap: `auth_user_id is null` treats "not yet linked to a real auth
-- identity" as equivalent to "safe for anyone on this device to inherit."
-- Those are not the same thing. A profile can sit unclaimed for a long
-- time while still accumulating substantial real evidence under a
-- long-lived anonymous session, or under a device genuinely reused across
-- different people where the first profile was never linked to a
-- distinct real identity at all. The function has no way to distinguish
-- "this unclaimed profile is genuinely mine from five minutes ago,
-- nothing has happened yet" from "this unclaimed profile belongs to a
-- completely different person's substantial prior activity, and I only
-- share their device_id." Every evidence table (user_stats,
-- lesson_progress, ali_student_adaptive_state, ali_student_question_
-- history, ali_durable_mastery, ali_educational_audit -- migration 020)
-- is correctly RLS-scoped to `profiles.auth_user_id = auth.uid()`, so if
-- a profile were ever wrongly claimed, every one of those policies would
-- faithfully -- and wrongly -- treat the new owner as entitled to the
-- old owner's entire history. The RLS layer itself is not the gap; it
-- would simply enforce whatever ownership fact claim_legacy_profile hands
-- it, which is why the correction belongs at that one decision point.
--
-- ============================================================
-- FIX
-- ============================================================
-- claim_legacy_profile keeps its exact existing security boundary
-- (unowned rows only, auth.uid() read from the caller's own verified JWT,
-- never touches an already-owned row) and adds exactly one more
-- condition: the profile being claimed must be genuinely EMPTY -- zero
-- rows in every evidence-bearing table. This is deliberately not a time-
-- or count-based heuristic (an arbitrary cutoff like "created in the last
-- hour" would still let a device that raced through 50 questions in 10
-- minutes be inherited by someone else, and would still block a
-- legitimate slow anonymous browse-then-signup) -- it is the literal
-- statement of the required invariant: nothing may be inherited that
-- carries any real educational history.
--
-- A device reused across two genuinely different people/accounts now
-- always falls through to creating each person their own new profile
-- (ensureProfile()'s existing `if (existing) return; ... insert new row`
-- fallback already handles claimedId === null correctly -- no application
-- code change needed). The one narrow, genuinely safe case the function
-- was built for -- "I've done nothing yet, formalise my account" --
-- still works exactly as before, since a genuinely untouched profile
-- trivially satisfies every new NOT EXISTS check.
--
-- Fail-closed: every added condition is a NOT EXISTS guard, so a claim
-- can only become MORE restrictive than before, never less. No existing
-- claim behaviour for a genuinely empty profile changes. No RLS policy on
-- any table is touched or weakened.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

create or replace function public.claim_legacy_profile(p_device_id text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_profile_id uuid;
begin
  if v_uid is null then
    return null;
  end if;

  update public.profiles
  set auth_user_id = v_uid
  where device_id = p_device_id
    and auth_user_id is null
    -- Every evidence-bearing table this profile could own must be
    -- genuinely empty -- see migration 020 for the full list of tables
    -- this profile_id/learner_id is a foreign key into.
    and not exists (
      select 1 from public.user_stats us
      where us.profile_id = profiles.id and us.total_xp > 0
    )
    and not exists (
      select 1 from public.lesson_progress lp
      where lp.profile_id = profiles.id
    )
    and not exists (
      select 1 from public.ali_student_adaptive_state s
      where s.profile_id = profiles.id and s.questions_presented_count > 0
    )
    and not exists (
      select 1 from public.ali_student_question_history h
      where h.profile_id = profiles.id
    )
    and not exists (
      select 1 from public.ali_durable_mastery m
      where m.profile_id = profiles.id
    )
    and not exists (
      select 1 from public.ali_educational_audit a
      where a.learner_id = profiles.id
    )
  returning id into v_profile_id;

  return v_profile_id;
end;
$$;

-- Permissions unchanged from migration 019 -- restated here only so this
-- file is a complete, self-contained definition of the function, not
-- because anything about the grant itself needs to change.
revoke execute on function public.claim_legacy_profile(text) from public;
grant execute on function public.claim_legacy_profile(text) to authenticated;

commit;

-- ============================================================
-- ROLLBACK (manual only, not executed automatically). Restores exactly
-- migration 019's original function body -- the pre-evidence-check
-- behaviour, not migration 012's older device-only model.
-- ============================================================
-- create or replace function public.claim_legacy_profile(p_device_id text)
-- returns uuid
-- language plpgsql
-- security definer
-- set search_path = public
-- as $$
-- declare
--   v_uid uuid := auth.uid();
--   v_profile_id uuid;
-- begin
--   if v_uid is null then
--     return null;
--   end if;
--   update public.profiles
--   set auth_user_id = v_uid
--   where device_id = p_device_id
--     and auth_user_id is null
--   returning id into v_profile_id;
--   return v_profile_id;
-- end;
-- $$;
