-- Angel Digital 11+ — Migration 212
-- Programme Completion Increment 014: READING COMPREHENSION MOCK 1 —
-- inactive freeze. Mirrors migration 147's own two-step precedent
-- (freeze inactive first, activate only via a later, separate, explicit
-- migration) exactly.
--
-- ============================================================
-- WHAT THIS IS, AND IS NOT
-- ============================================================
-- Form id: reading-comprehension-mock-1. Display name (not a DB column
-- -- ali_mock_form has none; see Increment 014's own report, Section
-- "learner/parent naming verification," for why this matters):
-- "Reading Comprehension Mock 1." NEVER "English Mock 1," "Full English
-- Mock," or "Full CSSE Mock" -- an explicit, standing Founder
-- instruction, not a style preference.
--
-- attempt_type = 'timed_section', not 'full_mock'. Deliberate, disclosed
-- ANGEL IMPLEMENTATION DECISION: app/learning-intelligence/mock-exam/
-- page.tsx hardcodes ATTEMPT_TYPE = "full_mock" and queries
-- mock_get_active_form('full_mock') (migration 072), which returns only
-- the single most-recently-created active row for that type (`order by
-- created_at desc limit 1`) -- confirmed this session by reading that
-- function directly. Using 'full_mock' for this form would risk a real,
-- silent collision with Mathematics Mock 1 the moment both were ever
-- active simultaneously. 'timed_section' avoids that collision entirely
-- (confirmed: no application code anywhere queries for 'timed_section'
-- today) and is also the more honest label -- this is a bounded,
-- single-component timed assessment, not a full-subject-paper replica.
--
-- subject = 'english'. Matches the check constraint (migration 085:
-- subject in ('mathematics','english')) and migration 147's own
-- demonstrated practice of setting a real subject for a genuinely
-- subject-pure form. Confirmed safe: subject only becomes relevant to
-- mock_create_cycle_attempt()'s combined-cycle pairing architecture,
-- which this migration does not invoke, does not touch, and this
-- increment does not authorise using -- setting it accurately tags the
-- form without triggering any cycle behaviour.
--
-- active = false. NOT exposed to any learner. Activation is a separate,
-- later, explicit Founder-gated migration -- not performed here, not
-- authorised by this increment ("Nothing is authorised for learner
-- release yet").
--
-- ============================================================
-- CONTENT: exactly 28 questions, 3 passages, 65 marks
-- ============================================================
-- How Bees Find Their Way Home (8Q/20m) -> The Boat in the Boathouse
-- (13Q/30m) -> The Understudy (7Q/15m), in that order (Section 4 of the
-- Increment 013/014 reports: easiest reading_complexity first, then the
-- two moderate-high passages). Explicit exclusions verified below via
-- guard checks, not merely asserted: no Loose Connection, no Sail and
-- Steam (Founder-preserved for a future assessment, migration 210 keeps
-- them mock_eligible but unallocated), no Writing content of any kind
-- (mock-writing-screentime-01 stays separately protected, migration
-- 211), no Applied Reasoning content of any kind (never existed in this
-- codebase's Mock-track estate to begin with, per Decision 58).
--
-- ============================================================
-- SAFETY PATTERN
-- ============================================================
-- Mirrors migration 147 exactly: builds the manifest as a constant,
-- computes composition_provenance, runs explicit guard checks (forbidden
-- content absent, row/mark counts correct), then an idempotent insert
-- (0 existing rows -> insert; 1 existing matching row -> no-op; anything
-- else -> refuse and require manual investigation, never silently
-- overwritten).
--
-- This migration depends on migrations 206, 208, 209 having already been
-- applied (their triggers/views must exist before this form can be
-- safely protected against future mutation) and on migration 210 (the
-- content this form references must already be mock_eligible before a
-- learner could ever be served it -- though this migration itself does
-- not check eligibility_status, since ali_mock_form has historically
-- never had a foreign key to ali_question_bank, per migration 070's own
-- documented design: "a real Mock is authored as provisional first...
-- referenced by a form only once eligibility_status = 'mock_eligible';
-- that eligibility check happens at attempt-creation time in
-- mock_create_attempt(), not via a schema constraint"). This migration
-- does NOT activate the form and does NOT require migration 210 to have
-- been applied first for the freeze itself to succeed -- but the form
-- must not be activated until 210 has been applied, or attempt creation
-- would fail (or, worse, silently serve unreviewed content, if the
-- eligibility check were ever weakened) -- flagged here for the Founder
-- executing the sequence, not enforced by this migration's own DO block.
--
-- NOT APPLIED, NOT ACTIVATED. Generated for Founder review and manual
-- application via Supabase Dashboard > SQL Editor > New query, after
-- migrations 206, 208, 209, and 210 (in that order).

begin;

do $$
declare
  v_form_id constant text := 'reading-comprehension-mock-1';
  v_existing_count int;
  v_existing_matches boolean;

  v_question_manifest constant jsonb := '[{"question_id":"eng-inc001-bee-q01","section":"reading_comprehension"},{"question_id":"eng-inc001-bee-q02","section":"reading_comprehension"},{"question_id":"eng-inc001-bee-q03","section":"reading_comprehension"},{"question_id":"eng-inc001-bee-q04","section":"reading_comprehension"},{"question_id":"eng-inc001-bee-q05","section":"reading_comprehension"},{"question_id":"eng-inc001-bee-q06","section":"reading_comprehension"},{"question_id":"eng-inc001-bee-q07","section":"reading_comprehension"},{"question_id":"eng-inc001-bee-q08","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q01","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q02","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q03","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q04","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q05","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q06","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q07","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q08","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q09","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q10","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q11","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q12a","section":"reading_comprehension"},{"question_id":"mock-eng-boathouse-q12b","section":"reading_comprehension"},{"question_id":"eng-inc001-understudy-q01","section":"reading_comprehension"},{"question_id":"eng-inc001-understudy-q02","section":"reading_comprehension"},{"question_id":"eng-inc001-understudy-q03","section":"reading_comprehension"},{"question_id":"eng-inc001-understudy-q04","section":"reading_comprehension"},{"question_id":"eng-inc001-understudy-q05","section":"reading_comprehension"},{"question_id":"eng-inc001-understudy-q06","section":"reading_comprehension"},{"question_id":"eng-inc001-understudy-q07","section":"reading_comprehension"}]'::jsonb;

  v_composition_provenance constant jsonb := '{"source":"reading_comprehension_mock1_curated","generatorVersion":"manual-curation-v1","composedAt":"2026-09-03T00:00:00.000Z","displayName":"Reading Comprehension Mock 1","rawRowCount":28,"numberedExperienceCount":27,"totalMarks":65,"passageOrder":["eng-inc001-bee-navigation","mock-eng-boathouse","eng-inc001-understudy"],"passageMarks":{"eng-inc001-bee-navigation":20,"mock-eng-boathouse":30,"eng-inc001-understudy":15},"difficultyDistribution":{"easy":5,"medium":21,"hard":2,"challenge":0},"skillDistribution":{"evidence":14,"inference":6,"vocabulary":6,"structure":2},"timingDecision":"ANGEL_IMPLEMENTATION_DECISION: 45 minutes + 10 minutes reading time, not a CSSE-evidenced figure","reservedNotIncluded":["eng-inc002-roboticsfinal","eng-inc002-sailandsteam","mock-writing-screentime-01"]}'::jsonb;

  v_row_count int;
  v_total_marks int;

  v_forbidden_loose_connection int;
  v_forbidden_sail_and_steam int;
  v_forbidden_writing int;
  v_forbidden_applied_reasoning int;
begin
  -- === Structural checks ===
  select jsonb_array_length(v_question_manifest) into v_row_count;
  if v_row_count <> 28 then
    raise exception 'Migration 212 refused: expected exactly 28 rows in the manifest, found %.', v_row_count;
  end if;

  -- === Forbidden-content guard checks (Founder's explicit exclusions) ===
  select count(*) into v_forbidden_loose_connection
  from jsonb_array_elements(v_question_manifest) as elem
  where elem ->> 'question_id' like 'eng-inc002-roboticsfinal%';
  if v_forbidden_loose_connection <> 0 then
    raise exception 'Migration 212 refused: The Loose Connection must never appear in Reading Comprehension Mock 1''s manifest (found % rows) -- Founder-preserved for a future assessment.', v_forbidden_loose_connection;
  end if;

  select count(*) into v_forbidden_sail_and_steam
  from jsonb_array_elements(v_question_manifest) as elem
  where elem ->> 'question_id' like 'eng-inc002-sailandsteam%';
  if v_forbidden_sail_and_steam <> 0 then
    raise exception 'Migration 212 refused: Crossing the Atlantic: Sail and Steam must never appear in Reading Comprehension Mock 1''s manifest (found % rows) -- Founder-preserved for a future assessment.', v_forbidden_sail_and_steam;
  end if;

  select count(*) into v_forbidden_writing
  from jsonb_array_elements(v_question_manifest) as elem
  where elem ->> 'question_id' like '%writing%' or elem ->> 'question_id' like 'mock-writing%';
  if v_forbidden_writing <> 0 then
    raise exception 'Migration 212 refused: no Continuous Writing content may appear in Reading Comprehension Mock 1''s manifest (found % rows) -- Writing stays separately protected (migration 211).', v_forbidden_writing;
  end if;

  select count(*) into v_forbidden_applied_reasoning
  from jsonb_array_elements(v_question_manifest) as elem
  where elem ->> 'question_id' like '%applied%reasoning%' or elem ->> 'question_id' like '%-ar%';
  if v_forbidden_applied_reasoning <> 0 then
    raise exception 'Migration 212 refused: no Applied Reasoning content may appear anywhere in this form (found % rows) -- removed from the current CSSE pathway, Decision 58.', v_forbidden_applied_reasoning;
  end if;

  -- === Marks total, computed live from ali_question_bank, not trusted from the constant alone ===
  select coalesce(sum((q.prompt ->> 'marks')::int), -1) into v_total_marks
  from public.ali_question_bank as q
  where q.id in (select elem ->> 'question_id' from jsonb_array_elements(v_question_manifest) as elem);

  if v_total_marks <> 65 then
    raise exception 'Migration 212 refused: live-computed marks total is % (expected 65) -- either a question row is missing or its marks value has drifted since this migration was authored. Re-verify before proceeding.', v_total_marks;
  end if;

  -- === Idempotent insert (mirrors migration 147 exactly) ===
  select count(*) into v_existing_count from public.ali_mock_form where id = v_form_id;

  if v_existing_count = 0 then
    insert into public.ali_mock_form (id, subject, specification_version, attempt_type, question_manifest, active, composition_provenance)
    values (v_form_id, 'english', 1, 'timed_section', v_question_manifest, false, v_composition_provenance);

    raise notice 'Migration 212: inserted % (28 rows / 27 numbered experiences, 65 marks, 3 passages: Bees -> Boathouse -> Understudy), active=false. Not exposed to any learner.', v_form_id;

  elsif v_existing_count = 1 then
    select
      (question_manifest = v_question_manifest)
      and (active = false)
      and (subject = 'english')
      and (specification_version = 1)
      and (attempt_type = 'timed_section')
      into v_existing_matches
    from public.ali_mock_form where id = v_form_id;

    if not v_existing_matches then
      raise exception 'Migration 212 refused: a row % already exists but does not match the expected curated manifest/active/subject/specification_version/attempt_type -- manual investigation required, never silently overwritten.', v_form_id;
    end if;

    raise notice 'Migration 212: % already exists with the expected manifest and active=false -- already applied, no-op.', v_form_id;

  else
    raise exception 'Migration 212 refused: expected 0 or 1 existing ali_mock_form rows with id %, found %. Manual investigation required.', v_form_id, v_existing_count;
  end if;
end $$;

commit;

-- Read-only verification (run before and after applying):
-- select id, subject, attempt_type, active, jsonb_array_length(question_manifest) as row_count,
--        composition_provenance
-- from public.ali_mock_form where id = 'reading-comprehension-mock-1';
