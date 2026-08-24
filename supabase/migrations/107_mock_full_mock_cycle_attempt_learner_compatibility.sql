-- Angel Digital 11+ — Migration 107
-- Mathematics First Mock Form-Assembly Gate — Full-Mock Cycle-Attempt
-- Learner Compatibility (Decision 161).
--
-- ROOT FINDING, confirmed by direct source reading (this increment's own
-- mandatory Section 7 trace, continued): the ONLY learner-facing route to
-- a Full Mock (app/mocks/page.tsx's own "Start mock" button, linking to
-- app/learning-intelligence/mock-exam/page.tsx) creates its attempt by
-- calling createMockAttempt(supabase, formId, "full_mock")
-- (lib/mockAttempt/client.ts), which invokes mock_create_attempt(text,
-- text) (migration 070). Migration 085 (Decision 135) added an
-- unconditional guard to that exact function: `if p_attempt_type =
-- 'full_mock' then raise exception ...`. Migration 085's own header
-- already disclosed this precisely ("app/learning-intelligence/
-- mock-exam/page.tsx uses attempt_type 'full_mock' today and is
-- therefore, as expected, not yet wired to the new cycle-aware path --
-- named as future bounded UI work, not done here") -- this is not a
-- newly-introduced regression, it is that exact, previously-named,
-- previously-deferred gap, now squarely inside this increment's own
-- explicit scope ("LEARNER ATTEMPT COMPATIBILITY").
--
-- CONSEQUENCE, confirmed, not inferred: today, even with an active
-- subject-pure Mathematics ali_mock_form row, a real learner clicking
-- "I'm ready to begin" would receive mock_create_attempt's own raised
-- exception and land on the page's generic error state. The attempt
-- cannot be CREATED at all -- a strictly earlier failure than anything
-- rendering-related (migration 106, same Decision). No first Mathematics
-- Mock can be "safely attempted by a learner" (this increment's own
-- stated goal) until this is corrected.
--
-- THE CORRECT PATH ALREADY EXISTS, unused: mock_create_cycle_attempt
-- (p_form_id text, p_cycle_id uuid) (migration 085) is the proven,
-- cadence-respecting, subject-pure-only replacement -- it requires an
-- already-open cycle, created via mock_start_new_cycle() (normal,
-- ~14-day-gated) or mock_authorise_extra_cycle() (parent-authorised,
-- ungated). Neither creation function is called anywhere in app/ today
-- (confirmed by direct search) -- the learner page has zero cycle
-- awareness. THE ONE GAP: no function lets a caller discover whether it
-- ALREADY has an open cycle before deciding whether to start a new one --
-- mock_cycle_is_open(uuid) exists but is deliberately never granted to
-- authenticated (migration 085's own explicit "internal helper, never
-- granted" boundary, correctly protecting the cycle-open computation from
-- being re-implemented or spoofed client-side). Without it, a client
-- calling mock_start_new_cycle() a second time while a cycle is already
-- open would simply receive that function's own "still open" exception,
-- with no sanctioned way to retrieve the ALREADY-open cycle's id to
-- proceed with it instead.
--
-- WHAT THIS MIGRATION DOES: adds exactly ONE new, read-only,
-- narrowly-scoped function --
--
--   mock_get_open_cycle() returns uuid
--
-- -- returns the caller's own most recent open cycle's id, or NULL if
-- none (mirroring mock_get_active_form()'s own "null is not an error"
-- discipline, migration 072). Reuses mock_cycle_is_open() internally,
-- completely unchanged -- this migration does not alter cadence,
-- open/closed computation, or any cycle-mutation function
-- (mock_start_new_cycle, mock_authorise_extra_cycle,
-- mock_create_cycle_attempt) in any way. It exposes a READ of an
-- existing, proven computation, nothing more -- exactly the same shape
-- of change as mock_get_attempt_manifest() (migration 072) exposing a
-- read of assigned_question_ids that RLS already permitted directly but
-- no client-usable function yet surfaced.
--
-- With this function, the learner page's own corrected flow (the
-- bounded client-side change, same Decision, not part of this SQL file)
-- becomes: check for an open cycle; if none, start a new one (surfacing
-- mock_start_new_cycle()'s own honest cadence-not-yet-elapsed exception
-- as a real, informative unavailable state -- never silently bypassed,
-- never worked around); create the attempt via
-- mock_create_cycle_attempt(form_id, cycle_id) using whichever cycle id
-- resulted. This is a routing correction to the EXISTING, already-
-- approved cadence-respecting architecture -- it does not create a new
-- attempt route, does not change the ~14-day cadence, does not touch
-- mock_authorise_extra_cycle() or any parent-only control, and does not
-- widen who may call any existing function.
--
-- FORM-READINESS PRECONDITION, disclosed, not solved here: per migration
-- 085's own schema (ali_mock_form.subject, nullable, non-null required
-- to join a cycle), the first Mathematics Mock form itself must be
-- authored with subject = 'mathematics' for mock_create_cycle_attempt()
-- to accept it -- form creation is explicitly out of scope for this
-- migration and this increment's own Section 12 ("Form creation/review
-- third," a separate, later, Founder-controlled step).
--
-- WHAT THIS MIGRATION DOES NOT DO: does not add or alter any table,
-- column, policy, or trigger; does not create or modify any Mock cycle,
-- attempt, form, or question row; does not change the ~14-day cadence
-- interval or the parent-override bypass; does not grant
-- mock_cycle_is_open() to authenticated (it remains internal, called
-- only from within other SECURITY DEFINER functions' own implicit
-- privilege, matching migration 085's own established mechanism); does
-- not touch mock_get_question, mock_get_attempt_grouping, or any other
-- function from migration 106 (same Decision, separate concern); does
-- not activate Mock Centre, bypass readiness, or make any content
-- learner-available.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migration 085 (the
-- Mock cycle governance architecture) has already been applied.

begin;

-- Returns the caller's own current open cycle id, or NULL if none.
-- Reuses mock_cycle_is_open(uuid) (migration 085, internal, unchanged) --
-- the identical query mock_start_new_cycle() and mock_authorise_extra_
-- cycle() already run themselves before deciding whether to raise their
-- own "still open" exception, now exposed as a direct read so a caller
-- can discover the answer WITHOUT first triggering that exception.
create or replace function public.mock_get_open_cycle()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_open_cycle_id uuid;
begin
  select id into v_profile_id from public.profiles where auth_user_id = auth.uid();
  if v_profile_id is null then
    return null;
  end if;

  select c.id into v_open_cycle_id
    from public.ali_mock_cycle c
    where c.profile_id = v_profile_id
      and public.mock_cycle_is_open(c.id)
    order by c.created_at desc
    limit 1;

  return v_open_cycle_id;
end;
$$;
revoke all on function public.mock_get_open_cycle() from public;
grant execute on function public.mock_get_open_cycle() to authenticated;

commit;
