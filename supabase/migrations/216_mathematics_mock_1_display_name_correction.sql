-- Angel Digital 11+ — Migration 216
-- Programme Completion Increment 016: corrects migration 213's wrong form
-- id. Does not edit 213 in place -- already applied (as a harmless no-op)
-- and already reported as final; corrected additively, per this
-- programme's own record/explain/recommend discipline.
--
-- ============================================================
-- ROOT CAUSE
-- ============================================================
-- Migration 213 targeted `id = 'mathematics-mock-1'`. The real,
-- authoritative form id -- confirmed directly against the original
-- source this session, migrations 147 (`first_mock_1_inactive_freeze`,
-- line 85) and 150 (`first_mock_1_activation`, line 80), both of which
-- declare `v_form_id constant text := 'first-mock-mathematics-v1'` --
-- has always been `first-mock-mathematics-v1`. Migration 213's own
-- fail-safe guard (`if v_row_count = 0 then raise notice ...; return;`)
-- meant it found zero matching rows and exited cleanly as a no-op --
-- Founder-confirmed live: the real form is intact, active=true, 56
-- questions, 56 marks, `displayName` still null. No corruption occurred;
-- the correction simply never reached the real row.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES, AND ONLY THIS
-- ============================================================
-- Identical additive `jsonb_set` merge to migration 213's own, retargeted
-- to the real id, with four extra defensive guards migration 213 did not
-- have (added specifically because a wrong-id mistake already happened
-- once): the target row must have exactly 56 questions in its manifest,
-- a live-computed marks total of exactly 56 (summed from the actual
-- referenced ali_question_bank rows, not merely trusted), subject=
-- 'mathematics', and attempt_type='full_mock' -- matching the Founder's
-- own live-queried evidence -- or this migration refuses outright rather
-- than touching an unexpected row. Sets ONLY composition_provenance.
-- displayName. Does not touch id, active, question_manifest, marks,
-- specification_version, or attempt_type.
--
-- Migration 209's exposed-form immutability trigger (once applied) does
-- not fire for this update: it only blocks changes where `new.question_
-- manifest is distinct from old.question_manifest`, and this migration
-- never touches that column.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

do $$
declare
  v_form_id constant text := 'first-mock-mathematics-v1';
  v_row_count int;
  v_already_has_name boolean;
  v_current_provenance jsonb;
  v_active boolean;
  v_subject text;
  v_attempt_type text;
  v_question_count int;
  v_live_marks_total int;
begin
  select count(*) into v_row_count from public.ali_mock_form where id = v_form_id;

  if v_row_count = 0 then
    raise exception 'Migration 216 refused: expected form % (the real, live Mathematics Mock 1 form per migrations 147/150) to exist, but it was not found. Do not assume a different id -- manual investigation required.', v_form_id;
  end if;

  if v_row_count <> 1 then
    raise exception 'Migration 216 refused: expected exactly 1 ali_mock_form row with id %, found %. Manual investigation required.', v_form_id, v_row_count;
  end if;

  select composition_provenance, active, subject, attempt_type, jsonb_array_length(question_manifest)
    into v_current_provenance, v_active, v_subject, v_attempt_type, v_question_count
    from public.ali_mock_form where id = v_form_id;

  -- Defensive guards, added because of exactly this class of mistake:
  -- refuse to touch anything that doesn't match the Founder's own
  -- live-confirmed shape, rather than trust the id alone.
  if v_question_count <> 56 then
    raise exception 'Migration 216 refused: % has % questions in its manifest, expected exactly 56 -- does not match the known, frozen Mathematics Mock 1 shape. Refusing to touch it.', v_form_id, v_question_count;
  end if;
  if v_subject <> 'mathematics' then
    raise exception 'Migration 216 refused: % has subject=%, expected mathematics. Refusing to touch it.', v_form_id, v_subject;
  end if;
  if v_attempt_type <> 'full_mock' then
    raise exception 'Migration 216 refused: % has attempt_type=%, expected full_mock. Refusing to touch it.', v_form_id, v_attempt_type;
  end if;

  -- Live-computed marks total, summed from the real ali_question_bank
  -- rows the manifest actually references -- not merely trusted from a
  -- constant, matching migration 212's own established discipline.
  select coalesce(sum((q.prompt ->> 'marks')::int), -1) into v_live_marks_total
  from public.ali_mock_form f
  join lateral jsonb_array_elements(f.question_manifest) elem on true
  join public.ali_question_bank q on q.id = elem ->> 'question_id'
  where f.id = v_form_id;

  if v_live_marks_total <> 56 then
    raise exception 'Migration 216 refused: % has a live-computed marks total of % (expected 56) -- does not match the known, frozen Mathematics Mock 1 shape. Refusing to touch it.', v_form_id, v_live_marks_total;
  end if;

  v_already_has_name := (v_current_provenance ->> 'displayName') is not null;

  if v_already_has_name then
    raise notice 'Migration 216: % already has a displayName ("%") -- already applied, no-op.', v_form_id, v_current_provenance ->> 'displayName';
  else
    update public.ali_mock_form
    set composition_provenance = jsonb_set(composition_provenance, '{displayName}', '"Mathematics Mock 1"'::jsonb)
    where id = v_form_id
      and (composition_provenance ->> 'displayName') is null;

    raise notice 'Migration 216: added displayName="Mathematics Mock 1" to %''s composition_provenance. question_manifest (56 questions), active (%), subject, attempt_type all unchanged.', v_form_id, v_active;
  end if;
end $$;

commit;

-- Read-only verification:
-- select id, composition_provenance ->> 'displayName' as display_name,
--        active, jsonb_array_length(question_manifest) as question_count
-- from public.ali_mock_form where id = 'first-mock-mathematics-v1';
