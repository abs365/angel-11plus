-- Angel Digital 11+ — Increment 016 production defect fix
-- READ-ONLY resume-safety check for the FIRST genuine Reading
-- Comprehension Mock 1 attempt (the sitting stopped when the passage
-- failed to render).
--
-- This is a SELECT only. It writes nothing, changes nothing, and does
-- not consume any freshness. Run it in Supabase Dashboard > SQL Editor.
--
-- WHY THIS CHECK IS NEEDED
-- mock_start_attempt() sets `expires_at` exactly once, at start, using
-- the DURATION the client passed at that moment. The existing attempt's
-- expires_at was computed with the pre-fix value (45 minutes for
-- timed_section), not the corrected 55 -- that duration is baked into
-- the row forever; nothing in this fix (or anything else) recomputes
-- it retroactively, and nothing should. The app's own existing,
-- Founder-approved resume logic (Decision 217,
-- determineMockResumeAction() in lib/mockAttempt/workspace.ts) already
-- knows how to route correctly based on whatever this query finds:
--   - not expired  -> "resume_in_progress": the SAME attempt reopens,
--                      no answers/timestamps touched, and will now
--                      (post-fix) also show the missing passage.
--   - expired       -> "finalize_expired": the app will not let the
--                      learner keep answering as though time remains.
--                      This is the existing, correct, unmodified
--                      security boundary -- not something this fix
--                      changes or should change.

select
  a.id as attempt_id,
  a.status,
  a.started_at,
  a.expires_at,
  (a.expires_at is not null and now() > a.expires_at) as is_expired,
  now() - a.started_at as time_since_started,
  a.expires_at - now() as time_remaining,
  a.submitted_at
from public.ali_mock_attempt a
where a.form_id = 'reading-comprehension-mock-1'
order by a.created_at desc
limit 5;
