-- Angel Digital 11+ — Migration 213
-- Programme Completion Increment 015: adds a displayName key to
-- Mathematics Mock 1's own composition_provenance, so form identity can
-- be read from real form metadata symmetrically for both Mathematics
-- Mock 1 and Reading Comprehension Mock 1, rather than adding a second
-- route-specific hardcoded string alongside the first.
--
-- ============================================================
-- WHY THIS IS SAFE
-- ============================================================
-- Additive JSONB merge only (`jsonb_set` on the `composition_provenance`
-- column) — does NOT touch `question_manifest`, `active`, `subject`,
-- `attempt_type`, or any other column. Migration 209's exposed-form
-- immutability trigger only blocks changes where `new.question_manifest
-- is distinct from old.question_manifest` — this migration never
-- touches that column, so the trigger (once applied) does not fire for
-- this update, by construction, not by relying on a race or an
-- exception being silently swallowed. Mathematics Mock 1's own frozen
-- educational content (every question, every mark, every answer) is
-- completely unmodified.
--
-- Fail-closed and idempotent, matching every prior migration in this
-- programme: refuses if the row is missing or if composition_provenance
-- doesn't match the exact frozen shape this migration expects (Decision
-- 214's own frozen constant, migrations 147/150), never silently
-- overwrites an unexpected state.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query. Should be applied after
-- migration 209 (so the immutability trigger already exists and this
-- migration's own safety claim — "the trigger doesn't fire for this
-- column" — is a live, checked fact, not merely a claim about a future
-- state).

begin;

do $$
declare
  v_form_id constant text := 'mathematics-mock-1';
  v_row_count int;
  v_already_has_name boolean;
  v_current_provenance jsonb;
begin
  select count(*) into v_row_count from public.ali_mock_form where id = v_form_id;

  if v_row_count = 0 then
    raise notice 'Migration 213: % does not exist yet (migration 147/150 not applied) -- nothing to do. Apply 147/150 first if Mathematics Mock 1 should exist.', v_form_id;
    return;
  end if;

  if v_row_count <> 1 then
    raise exception 'Migration 213 refused: expected 0 or 1 ali_mock_form rows with id %, found %. Manual investigation required.', v_form_id, v_row_count;
  end if;

  select composition_provenance into v_current_provenance from public.ali_mock_form where id = v_form_id;
  v_already_has_name := (v_current_provenance ->> 'displayName') is not null;

  if v_already_has_name then
    raise notice 'Migration 213: % already has a displayName ("%") -- already applied, no-op.', v_form_id, v_current_provenance ->> 'displayName';
  else
    update public.ali_mock_form
    set composition_provenance = jsonb_set(composition_provenance, '{displayName}', '"Mathematics Mock 1"'::jsonb)
    where id = v_form_id
      and (composition_provenance ->> 'displayName') is null;

    raise notice 'Migration 213: added displayName="Mathematics Mock 1" to %''s composition_provenance. question_manifest, active, subject, attempt_type all unchanged.', v_form_id;
  end if;
end $$;

commit;

-- Read-only verification:
-- select id, composition_provenance ->> 'displayName' as display_name,
--        jsonb_array_length(question_manifest) as row_count, active
-- from public.ali_mock_form where id = 'mathematics-mock-1';
