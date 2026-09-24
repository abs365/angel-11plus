-- 265_mock_get_active_form_full_mock_subject_required.sql
--
-- MOCK SUBJECT-ROUTING P0 CORRECTION -- server-side half.
--
-- LIVE ROOT-CAUSE EVIDENCE (read-only Supabase MCP, project
-- agxunwcdatosrmzhhuxj, 2026-09-24):
--   - Attempt 9ae70cee-3cde-47da-96e0-c0eecfcddda3 was created FRESH from
--     english-full-mock-v1 by the pre-start page
--     (/learning-intelligence/mock-exam) while it was titled
--     "Mathematics Mock 1". API logs show the Mock Centre resolving
--     first-mock-mathematics-v1 correctly, then the pre-start page
--     resolving english-full-mock-v1.
--   - The live mock_get_active_form() body (migration 245's version):
--       where active and attempt_type = p_attempt_type
--         and (p_subject is null or subject = p_subject)
--       order by created_at desc limit 1
--     so ('full_mock', NULL) silently returns the NEWEST full_mock --
--     english-full-mock-v1 (created 2026-09-09) over
--     first-mock-mathematics-v1 (created 2026-08-27). The page ran with
--     no subject; the function did exactly what it says.
--   - No form, manifest, question or attempt data is corrupt.
--
-- THE INVARIANT THIS MIGRATION ADDS: two subject-pure forms share
-- attempt_type = 'full_mock', so a full_mock request that does not name
-- its subject has no single correct answer. It now returns NO ROW (the
-- same clean "no form" shape every caller already handles as
-- "unavailable") instead of guessing. A full_mock can only ever be
-- resolved for the exact subject asked for, so a subject-less caller can
-- never cross subjects. timed_section / diagnostic_mock behaviour is
-- unchanged (one form each; p_subject stays optional for them).
--
-- ALSO (superseding migration 264, which was generated but NEVER applied
-- to production -- confirmed live: the function still returns
-- (form_id, attempt_type, display_name) only): the return shape gains the
-- resolved row's own `subject`, so the deployed client-side
-- subjectMismatch() guard receives a real value instead of always-null.
-- This migration is self-contained; migration 264 must NOT be applied
-- separately (harmless if it were -- this drop/create supersedes it).
--
-- GRANTS: the live ACL is preserved exactly as found
-- ({postgres, anon, authenticated, service_role} = EXECUTE). DROP FUNCTION
-- discards the ACL, so it is re-stated explicitly rather than left to
-- default privileges. anon's EXECUTE is pre-existing live state (migration
-- 073 revoked it on the old one-argument signature; later re-creations
-- re-acquired it) and /mocks is a public route that calls this function
-- for signed-out visitors, so tightening it is a separate decision, not
-- part of this correction.
--
-- Does not touch any form, manifest, question, attempt, cycle, scoring,
-- timing, RLS policy, PIN/learner-identity function, or migrations
-- 260-263.
--
-- APPLICATION: Supabase Dashboard > SQL Editor > New query, as one
-- execution, per this repository's Founder-applied-migration convention.

begin;

drop function if exists public.mock_get_active_form(text, text);

create function public.mock_get_active_form(p_attempt_type text, p_subject text default null)
returns table (form_id text, attempt_type text, subject text, display_name text)
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Fail closed: a full_mock is never "any subject".
  if p_attempt_type = 'full_mock' and p_subject is null then
    return;
  end if;

  return query
    select f.id, f.attempt_type, f.subject, f.composition_provenance ->> 'displayName'
    from public.ali_mock_form f
    where f.active = true
      and f.attempt_type = p_attempt_type
      and (p_subject is null or f.subject = p_subject)
    order by f.created_at desc
    limit 1;
end;
$$;

revoke all on function public.mock_get_active_form(text, text) from public;
grant execute on function public.mock_get_active_form(text, text) to anon, authenticated, service_role;

commit;

-- ============================================================
-- POST-APPLICATION VERIFICATION (read-only; expected results)
-- ============================================================
-- select * from public.mock_get_active_form('full_mock', 'mathematics');
--   -> first-mock-mathematics-v1 | full_mock | mathematics | Mathematics Mock 1
-- select * from public.mock_get_active_form('full_mock', 'english');
--   -> english-full-mock-v1 | full_mock | english | (null)
-- select * from public.mock_get_active_form('full_mock', null);
--   -> 0 rows
-- select * from public.mock_get_active_form('full_mock');
--   -> 0 rows
-- select * from public.mock_get_active_form('timed_section', null);
--   -> reading-comprehension-mock-1 | timed_section | english | Reading Comprehension Mock 1
--
-- ============================================================
-- CALLER COMPATIBILITY
-- ============================================================
-- Every client caller that requests full_mock now names its subject:
-- app/mocks/page.tsx ("mathematics", "english"), mock-exam/page.tsx (the
-- URL subject, and it refuses to call at all without one), mock-exam/
-- sitting/page.tsx ("english", "mathematics"), lib/learningEngine/
-- mockReadiness.ts ("mathematics"), components/parent/
-- CssePathwayParentContent.tsx ("mathematics", corrected in the same
-- commit). PostgREST callers reading a subset of columns are unaffected
-- by the added `subject` column. No SQL function calls this function.
--
-- ============================================================
-- ROLLBACK
-- ============================================================
-- Re-apply migration 245's own mock_get_active_form(text, text) body
-- (three-column return, no full_mock guard) with the same grant block as
-- above. The client-side fail-closed gate in mock-exam/page.tsx is
-- independent of this function and stays correct either way.
