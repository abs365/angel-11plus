-- Angel Digital 11+ — Migration 149
-- Mathematics Mock 1 — Attempt Resume Lookup (Decision 216's own P1
-- finding, Founder-directed bounded remediation).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Decision 216 found a genuine P1 release blocker: a learner's answers
-- are safely persisted server-side, but after a full browser refresh or
-- tab loss, `app/learning-intelligence/mock-exam/page.tsx` has no way to
-- discover its own already-existing, still-open attempt -- its own
-- `handleBegin()` always attempts to create a BRAND NEW attempt, which
-- the server correctly rejects (`ali_mock_attempt_cycle_subject_unique`,
-- "one attempt per subject per cycle") once one already exists,
-- stranding the learner mid-sitting.
--
-- This migration adds exactly one new, narrowly-scoped, read-only
-- lookup function -- the "narrowly scoped RPC" pattern this codebase
-- already establishes for the identical class of problem
-- (`mock_get_open_cycle()`, migration 107, "the sanctioned way a caller
-- discovers an existing open cycle BEFORE deciding whether to start a
-- new one, rather than triggering [an] exception just to find out").
-- `mock_get_resumable_attempt()` is the same idea one level down: the
-- sanctioned way a caller discovers its own existing, still-open
-- ATTEMPT for a specific form before deciding whether to create a new
-- one.
--
-- ============================================================
-- THE RESUMABLE-ATTEMPT CONTRACT (derived from the real schema, not
-- invented)
-- ============================================================
-- `ali_mock_attempt.status` (migration 070) is a `text` column with a
-- CHECK constraint permitting five literals: 'assigned', 'ready',
-- 'in_progress', 'submitted', 'expired'. Direct inspection of every
-- function that ever writes this column (migrations 070/085/104, the
-- only ones that do) finds only THREE of these five literals are ever
-- actually produced by any real code path today:
--   - 'assigned'    -- set by mock_create_attempt()/mock_create_cycle_
--                       attempt() at creation, before the timer starts.
--   - 'in_progress' -- set by mock_start_attempt(), the ONLY function
--                       that ever sets started_at/expires_at, gated by
--                       `where status = 'assigned'` (so it structurally
--                       cannot be called a second time on the same
--                       attempt -- re-starting, and therefore resetting
--                       the timer, is already impossible today).
--   - 'submitted'   -- set by mock_submit_attempt(), gated by
--                       `where status = 'in_progress'`.
-- 'ready' and 'expired' are schema-permitted but structurally dead --
-- no function anywhere ever writes either value. This migration's own
-- resumable-attempt definition is built from the three LIVE states
-- only, never invented terminology: an attempt is resumable exactly
-- when its own `status` is 'assigned' or 'in_progress' (not yet
-- finished) -- never 'submitted' (already finished; resuming it for
-- further editing would corrupt an already-locked result, see migration
-- 074's own scoring-trigger architecture).
--
-- ============================================================
-- SECURITY MODEL
-- ============================================================
-- `mock_get_resumable_attempt(p_form_id text)` takes ONLY a form id --
-- no learner-identity parameter of any kind exists in its signature, so
-- there is structurally no argument through which a caller could ever
-- supply another learner's identity as an authority. The caller's own
-- `profile_id` is derived exclusively from `auth.uid()` inside the
-- function body (the same pattern every other Mock function in this
-- repository already uses), and the query is unconditionally scoped
-- `where a.profile_id = v_profile_id` -- a caller can only ever see
-- their own attempts, enforced inside the SECURITY DEFINER function
-- body itself (defence in depth beyond RLS, matching migration 070's
-- own established discipline). An unknown/malformed `p_form_id` simply
-- matches zero rows -- a safe empty result, never an exception, since a
-- non-existent form is not a caller error. This function NEVER inserts,
-- updates, or deletes anything -- a pure, read-only lookup -- so a
-- failed or empty lookup can never itself create an attempt; the
-- decision to create one remains entirely with the EXISTING,
-- unmodified `mock_create_attempt()`/`mock_create_cycle_attempt()`
-- (migration 145's own eligibility enforcement is untouched by this
-- migration).
--
-- ============================================================
-- RACE SAFETY -- an existing constraint, not a new one
-- ============================================================
-- This migration adds no new locking of its own. `ali_mock_attempt_
-- cycle_subject_unique` (migration 085, a real partial unique index on
-- `(cycle_id, subject) where cycle_id is not null`) already makes
-- concurrent "no resumable attempt found, so create one" races safe at
-- the database level: if two concurrent calls both observe no
-- resumable attempt and both attempt `mock_create_cycle_attempt()`, the
-- second INSERT fails the unique constraint atomically, regardless of
-- what either caller's own client-side check believed. This migration
-- relies on that existing boundary rather than duplicating it.
--
-- ============================================================
-- TIMER INTEGRITY -- unchanged, already sound
-- ============================================================
-- `expires_at` is set exactly once, by `mock_start_attempt()`, gated by
-- `status = 'assigned'` -- already structurally impossible to reset or
-- extend by calling it again (Section above). `mock_get_question()` and
-- `mock_submit_answer()` (migrations 070/072) already independently
-- re-check `now() > expires_at` against the DATABASE's own clock on
-- every read/write, regardless of what any client believes -- a
-- learner cannot gain extra answering time by refreshing, resuming
-- repeatedly, or manipulating their own device's clock, because the
-- comparison never trusts client-supplied time. This migration adds one
-- read-only convenience: the returned row includes `expires_at` itself
-- and a computed `is_expired` boolean (`now() > expires_at`), so a
-- resuming client can route immediately to "finalise/submit" rather
-- than attempting to continue answering an attempt the server would
-- reject anyway -- a UX convenience, not a new security boundary; the
-- real boundary remains inside `mock_get_question()`/`mock_submit_
-- answer()`, unchanged.
--
-- ============================================================
-- INACTIVE-FORM RESUME POLICY (Section 9 of the governing directive) --
-- extends an EXISTING, already-documented policy, does not invent one
-- ============================================================
-- Migration 070's own header already establishes, explicitly: "the
-- form's own question_manifest becomes assigned_question_ids at
-- creation time, frozen for this attempt's lifetime EVEN IF THE FORM IS
-- LATER EDITED." Consistent with that same, already-documented
-- precedent, `mock_get_question()` and `mock_submit_answer()` never
-- re-check `ali_mock_form.active` for an attempt already in progress --
-- only attempt CREATION checks it. This migration's own lookup function
-- follows the identical, already-established precedent: it does NOT
-- filter on `ali_mock_form.active` at all. If an administrator
-- deactivates a Mock form while a learner has a genuinely in-progress
-- attempt against it, that learner can still discover and resume their
-- own attempt, and can still answer/submit it (subject to the
-- unchanged, pre-existing expiry check) -- exactly as they already
-- could before this migration existed, since deactivation was already
-- proven not to affect an in-progress attempt's own question/answer
-- RPCs. This is not a new policy decision; it is the same one this
-- codebase already made and documented in migration 070, applied
-- consistently to the new lookup surface.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not change `mock_create_attempt()`, `mock_create_cycle_attempt()`,
-- `mock_start_attempt()`, `mock_get_question()`, `mock_submit_answer()`,
-- `mock_submit_attempt()`, `mock_score_attempt()`, or any other existing
-- function. Does not weaken migration 145's eligibility enforcement.
-- Does not change `ali_mock_form`, `ali_question_bank`, or any content.
-- Does not create an attempt, does not activate any Mock, does not
-- create any RLS policy (the existing `ali_mock_attempt`/`ali_mock_
-- attempt_answer` SELECT-own policies, migration 070, already permit
-- everything this function's own body reads).
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migration 085
-- (Founder-confirmed applied) has already been applied. Independent of
-- migrations 147/148 -- neither reads nor writes anything this
-- migration touches.

begin;

create or replace function public.mock_get_resumable_attempt(p_form_id text)
returns table (
  attempt_id uuid,
  status text,
  started_at timestamptz,
  expires_at timestamptz,
  is_expired boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
begin
  select id into v_profile_id from public.profiles where auth_user_id = auth.uid();
  if v_profile_id is null then
    raise exception 'No profile found for the calling user';
  end if;

  return query
    select
      a.id,
      a.status,
      a.started_at,
      a.expires_at,
      (a.expires_at is not null and now() > a.expires_at) as is_expired
    from public.ali_mock_attempt a
    where a.profile_id = v_profile_id
      and a.form_id = p_form_id
      and a.status in ('assigned', 'in_progress')
    order by a.created_at desc
    limit 1;
end;
$$;

revoke all on function public.mock_get_resumable_attempt(text) from public;
grant execute on function public.mock_get_resumable_attempt(text) to authenticated;

commit;
