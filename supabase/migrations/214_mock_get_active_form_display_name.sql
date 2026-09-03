-- Angel Digital 11+ — Migration 214
-- Programme Completion Increment 015: extends mock_get_active_form()'s
-- return shape to include display_name, sourced from the real form's
-- own composition_provenance -- the reusable mechanism that lets both
-- Mathematics Mock 1 and Reading Comprehension Mock 1 (and any future
-- Mock form) present their true identity to the client, instead of a
-- route-specific hardcoded string per form.
--
-- ============================================================
-- WHY THIS IS THE RIGHT, MINIMAL MECHANISM
-- ============================================================
-- ali_mock_form has no display-name column (confirmed this session by
-- reading its real column list: id, subject, specification_version,
-- attempt_type, question_manifest, active, composition_provenance,
-- created_at) -- and "Mathematics Mock 1" is hardcoded literal text in
-- two frontend files (app/mocks/page.tsx, app/learning-intelligence/
-- mock-exam/page.tsx), not derived from any form metadata (Increment
-- 014's own finding). Rather than add a new dedicated column (a
-- speculative schema change for a single string this codebase already
-- has a place for) or add more route-specific hardcoded strings (the
-- exact anti-pattern the Founder's instruction names), this migration
-- reads displayName out of composition_provenance -- a field that
-- already exists on every form, that migration 212 already populates
-- for Reading Comprehension Mock 1, and that migration 213 populates for
-- Mathematics Mock 1. No new column, no new table, no new subsystem.
--
-- ============================================================
-- WHY DROP + CREATE, NOT CREATE OR REPLACE
-- ============================================================
-- Postgres refuses `CREATE OR REPLACE FUNCTION` when the return type
-- changes (RETURNS TABLE (form_id text, attempt_type text) -> RETURNS
-- TABLE (form_id text, attempt_type text, display_name text) is a
-- genuine signature change, not a body-only correction like migration
-- 209's use of CREATE OR REPLACE on a same-signature trigger function).
-- No prior migration in this repository has ever changed a function's
-- return signature, so there is no established DROP-then-CREATE
-- precedent to match here -- this migration establishes one, following
-- this project's own general discipline (explicit, commented, fail-
-- described) as closely as the situation allows.
--
-- ============================================================
-- BACKWARD COMPATIBILITY
-- ============================================================
-- Existing callers that only read `.form_id`/`.attempt_type` from the
-- RPC result (this codebase's own getActiveMockForm() wrapper, before
-- this increment's own lib/mockAttempt/client.ts update) are unaffected
-- by an added third column — TypeScript client code only reads the
-- fields it names. The one real behavioural change: display_name is
-- `null` for a form whose composition_provenance has no displayName key
-- (i.e., before migrations 212/213 are applied to that form) -- callers
-- must treat null as "use a safe fallback," never as an error. This
-- migration itself does not touch question_manifest/active/subject on
-- any form, and does not require migrations 209/212/213 to already be
-- applied for this migration itself to succeed (though display_name
-- will simply read null until they are).
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

drop function if exists public.mock_get_active_form(text);

create function public.mock_get_active_form(p_attempt_type text)
returns table (form_id text, attempt_type text, display_name text)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
    select f.id, f.attempt_type, f.composition_provenance ->> 'displayName'
    from public.ali_mock_form f
    where f.active = true
      and f.attempt_type = p_attempt_type
    order by f.created_at desc
    limit 1;
end;
$$;

-- Same grant posture as the original definition (migration 072):
-- authenticated only, never anon, never public.
revoke all on function public.mock_get_active_form(text) from public;
grant execute on function public.mock_get_active_form(text) to authenticated;
revoke execute on function public.mock_get_active_form(text) from anon;

commit;

-- Read-only verification:
-- select * from public.mock_get_active_form('full_mock');
-- select * from public.mock_get_active_form('timed_section');
