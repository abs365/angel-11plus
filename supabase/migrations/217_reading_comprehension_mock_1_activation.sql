-- Angel Digital 11+ — Migration 217
-- Programme Completion Increment 016: READING COMPREHENSION MOCK 1 —
-- activation. Mirrors migration 150's own freeze->activate precedent
-- (Mathematics Mock 1) exactly, including its live re-verification
-- discipline, not merely its structural shape.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES, AND ONLY THIS
-- ============================================================
-- The only intended mutation, anywhere: `active: false -> true` for the
-- single row `id = 'reading-comprehension-mock-1'`. Every other column
-- on that row (question_manifest, composition_provenance, subject,
-- attempt_type, specification_version) is compared byte-for-byte against
-- migration 212's own frozen constants below -- copied verbatim from
-- that file, not re-derived or re-typed -- and this migration refuses
-- outright (RAISE EXCEPTION, no UPDATE) if any of them have drifted.
-- Nothing else in the database is touched: no other form, no Reading
-- content row, no reserve passage, no Writing row, no Mathematics row,
-- no attempt, no report.
--
-- ============================================================
-- LIVE RE-VERIFICATION, NOT JUST A FROZEN-CONSTANT COMPARISON
-- ============================================================
-- Migration 150's own established discipline: a byte-for-byte match
-- against the frozen manifest proves nothing has been EDITED, but not
-- that the underlying content is still genuinely eligible right now --
-- so this migration also live-queries ali_question_bank at activation
-- time and refuses unless all 28 manifest questions are still
-- eligibility_status='mock_eligible', active=true, and subject='english'
-- (mirroring migration 150's identical "may have been withdrawn or
-- altered since the freeze" concern), and independently re-computes the
-- 65-mark total from those same live rows rather than trusting the
-- frozen composition_provenance figure alone.
--
-- ============================================================
-- WHY THIS IS SAFE
-- ============================================================
-- Migration 209's exposed-form immutability trigger does not fire here:
-- it only blocks changes where `new.question_manifest is distinct from
-- old.question_manifest`, and this migration's only SET clause is
-- `active = true` -- question_manifest is read for comparison, never
-- written. Migration 208's reuse-block trigger does not fire either: it
-- only blocks a manifest that overlaps a DIFFERENT form's manifest, and
-- this UPDATE does not change the manifest at all. Reserve passages
-- (Loose Connection, Sail and Steam) and the Writing prompt
-- (mock-writing-screentime-01) are absent from the frozen manifest
-- constant this migration compares against -- if either were ever
-- somehow present, the byte-for-byte manifest check below would already
-- refuse before reaching the update.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

do $$
declare
  v_form_id constant text := 'reading-comprehension-mock-1';
  v_row public.ali_mock_form;
  v_row_count int;

  -- Copied verbatim from migration 212 -- not re-derived, not re-typed.
  v_expected_question_manifest constant jsonb := '[{"question_id":"eng-inc001-bee-q01","section":"reading_comprehension"},{"question_id":"eng-inc001-bee-q02","section":"reading_comprehension"},{"question_id":"eng-inc001-bee-q03","section":"reading_comprehension"},{"question_id":"eng-inc001-bee-q04","section":"reading_comprehension"},{"question_id":"eng-inc001-bee-q05","section":"reading_comprehension"},{"question_id":"eng-inc001-bee-q06","section":"reading_comprehension"},{"question_id":"eng-inc001-bee-q07","section":"reading_comprehension"},{"question_id":"eng-inc001-bee-q08","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q01","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q02","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q03","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q04","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q05","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q06","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q07","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q08","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q09","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q10","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q11","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q12a","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q12b","section":"reading_comprehension"},{"question_id":"eng-inc001-understudy-q01","section":"reading_comprehension"},{"question_id":"eng-inc001-understudy-q02","section":"reading_comprehension"},{"question_id":"eng-inc001-understudy-q03","section":"reading_comprehension"},{"question_id":"eng-inc001-understudy-q04","section":"reading_comprehension"},{"question_id":"eng-inc001-understudy-q05","section":"reading_comprehension"},{"question_id":"eng-inc001-understudy-q06","section":"reading_comprehension"},{"question_id":"eng-inc001-understudy-q07","section":"reading_comprehension"}]'::jsonb;

  v_expected_composition_provenance constant jsonb := '{"source":"reading_comprehension_mock1_curated","generatorVersion":"manual-curation-v1","composedAt":"2026-09-03T00:00:00.000Z","displayName":"Reading Comprehension Mock 1","rawRowCount":28,"numberedExperienceCount":27,"totalMarks":65,"passageOrder":["eng-inc001-bee-navigation","mock-eng-boathouse","eng-inc001-understudy"],"passageMarks":{"eng-inc001-bee-navigation":20,"mock-eng-boathouse":30,"eng-inc001-understudy":15},"difficultyDistribution":{"easy":5,"medium":21,"hard":2,"challenge":0},"skillDistribution":{"evidence":14,"inference":6,"vocabulary":6,"structure":2},"timingDecision":"ANGEL_IMPLEMENTATION_DECISION: 45 minutes + 10 minutes reading time, not a CSSE-evidenced figure","reservedNotIncluded":["eng-inc002-roboticsfinal","eng-inc002-sailandsteam","mock-writing-screentime-01"]}'::jsonb;

  v_target_ids constant text[] := array(
    select elem ->> 'question_id' from jsonb_array_elements(v_expected_question_manifest) as elem
  );

  v_live_eligible_count int;
  v_live_marks_total int;
begin
  select count(*) into v_row_count from public.ali_mock_form where id = v_form_id;
  if v_row_count = 0 then
    raise exception 'Migration 217 refused: form % not found. Manual investigation required -- do not proceed on an assumed row.', v_form_id;
  end if;
  if v_row_count <> 1 then
    raise exception 'Migration 217 refused: expected exactly 1 ali_mock_form row with id %, found %. Manual investigation required.', v_form_id, v_row_count;
  end if;

  select * into v_row from public.ali_mock_form where id = v_form_id;

  if v_row.subject is distinct from 'english' then
    raise exception 'Migration 217 refused: expected subject=english, found %.', v_row.subject;
  end if;
  if v_row.attempt_type is distinct from 'timed_section' then
    raise exception 'Migration 217 refused: expected attempt_type=timed_section, found %.', v_row.attempt_type;
  end if;
  if v_row.specification_version is distinct from 1 then
    raise exception 'Migration 217 refused: expected specification_version=1, found %.', v_row.specification_version;
  end if;
  if v_row.question_manifest is distinct from v_expected_question_manifest then
    raise exception 'Migration 217 refused: question_manifest has drifted from the migration 212 frozen form -- refusing to activate content that does not exactly match what was reviewed and approved.';
  end if;
  if v_row.composition_provenance is distinct from v_expected_composition_provenance then
    raise exception 'Migration 217 refused: composition_provenance (including displayName) has drifted from the migration 212 frozen form -- refusing to activate.';
  end if;

  -- === LIVE re-verification: every manifest question must still be
  -- mock_eligible/active/english at activation time, not merely at
  -- freeze time (migration 150's own identical discipline) ===
  select count(*) into v_live_eligible_count
    from public.ali_question_bank
    where id = any(v_target_ids) and eligibility_status = 'mock_eligible' and active = true and subject = 'english';
  if v_live_eligible_count <> 28 then
    raise exception 'Migration 217 refused: expected all 28 manifest questions to still be mock_eligible/active/english at activation time, found %. A question may have been withdrawn or altered since the migration 212 freeze -- activation refused, re-verify production state before retry.', v_live_eligible_count;
  end if;

  -- === LIVE marks total, independently re-computed, never merely trusted ===
  select coalesce(sum((q.prompt ->> 'marks')::int), -1) into v_live_marks_total
    from public.ali_question_bank q
    where q.id = any(v_target_ids);
  if v_live_marks_total <> 65 then
    raise exception 'Migration 217 refused: live-computed marks total is % (expected 65) -- refusing to activate.', v_live_marks_total;
  end if;

  -- === Three-state activation: every precondition above already holds ===
  if v_row.active = false then
    update public.ali_mock_form
      set active = true
      where id = v_form_id;

    raise notice 'Migration 217: % activated (active: false -> true). question_manifest and composition_provenance unchanged, byte-for-byte. No attempt created.', v_form_id;

  elsif v_row.active = true then
    raise notice 'Migration 217: % already active=true and every structural precondition still holds -- already applied, no-op.', v_form_id;

  else
    raise exception 'Migration 217 refused: % has an unexpected active value (neither true nor false) -- manual investigation required.', v_form_id;
  end if;
end $$;

commit;

-- Read-only verification (run before and after applying):
-- select id, active, subject, attempt_type,
--        composition_provenance ->> 'displayName' as display_name,
--        jsonb_array_length(question_manifest) as question_count
-- from public.ali_mock_form where id = 'reading-comprehension-mock-1';
