-- Angel Digital 11+ — Migration 118
-- Mathematics Marking Integrity Gate — Remediation Phase 2
-- (mock-mr08-rotation closure, Decision 174, Founder-approved).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Decision 174's own primary-source audit found no evidence for
-- mock-mr08-rotation-01/-02's own 2-mark deterministic single-response
-- coordinate-pair answers: the closest real analogue (2022 Q18, a
-- rotation transformation) shows one combined coordinate-pair answer
-- per subpart, no per-coordinate split, no partial-credit annotation —
-- matching the governing "1 mark for each correct answer" default. A
-- different real analogue (2021 Q8, co-linear points) explicitly
-- credits individual coordinates separately, but for a structurally
-- different, multi-point construct that does not transfer to a single
-- rotated point. Angel's own current scoring contract independently
-- confirms the same conclusion: mock_score_attempt() (migration 104)
-- evaluates a non-numeric answer like "(5, -3)" via a single
-- lower(trim(...)) = lower(trim(...)) string comparison — one
-- indivisible response, not two independently observable facts.
-- Decision 174's own selected model is Option A: marks-only correction,
-- no answer-contract or structural change. This migration is that
-- correction, completing the Mathematics Marking Integrity Gate's own
-- remediation (Phase 1, migration 117, applied; Phase 2, this file) in
-- full, subject only to Founder application and verification.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES
-- ============================================================
-- Corrects `prompt.marks` from 2 to 1 on exactly mock-mr08-rotation-01
-- and mock-mr08-rotation-02 — the only two Mathematics rows, in either
-- mock_eligible or independently_validated, with marks > 1 remaining
-- after migration 117's own Phase 1 correction (Founder-confirmed
-- production evidence: mock_eligible = 48 rows / 50 marks,
-- independently_validated = 8 rows / 8 marks, before this migration).
--
-- `marks` is NOT a top-level ali_question_bank column — it is a key
-- inside the `prompt` jsonb column, read by mock_score_attempt()
-- (migration 104) and mock_get_question() (migration 115) alike as
-- `prompt->>'marks'`/`prompt->'marks'`. This migration therefore uses
-- the identical `jsonb_set(prompt, '{marks}', '1'::jsonb)` approach
-- migration 117 already proved, replacing ONLY the `marks` key.
--
-- ============================================================
-- POSITIVE PRESERVATION PROOF (migration 117's own established
-- pattern, applied here a second time)
-- ============================================================
-- Before the UPDATE, this migration snapshots each target row's own
-- `prompt - 'marks'` (the jsonb "delete key" operator) into a local
-- temporary table. After the UPDATE, it re-reads the same expression
-- from the live table and asserts jsonb structural equality against
-- the snapshot for both rows, in addition to asserting the new `marks`
-- value is exactly 1. If either check fails, the migration raises an
-- exception and the whole transaction rolls back. This proves — not
-- merely asserts — that question text, answer, explanation, stimulus
-- (mock-mr08-rotation has none, but the check is generic and would
-- catch one appearing), skill, and every other prompt field are
-- byte-for-byte unchanged. family_id, content_difficulty,
-- question_group_id, group_order, subpart_label, marking_mode,
-- eligibility_status, and active are separately verified as live
-- preconditions (never touched, and drift-guarded before any write).
--
-- ============================================================
-- GROUPING METADATA — VERIFIED, NOT ASSUMED
-- ============================================================
-- Both rows are already correctly grouped (migration 095, Decision
-- 165's own original authoring, unchanged since): question_group_id =
-- 'mock-mr08-rotation' on both, group_order 1/2, subpart_label
-- '(a)'/'(b)'. This migration verifies each row's own live grouping
-- metadata matches this exact expected shape as a precondition (a
-- drift guard) and never writes to any of these four columns.
--
-- ============================================================
-- ELIGIBILITY IS NEVER TOUCHED
-- ============================================================
-- Both rows are 'mock_eligible' (migration 105) and remain so. This
-- migration's own UPDATE column list contains eligibility_status
-- nowhere; the precondition below verifies both rows are still exactly
-- 'mock_eligible' before any write (a drift guard, not a relaxation).
--
-- ============================================================
-- GOVERNANCE — UNCHANGED FROM DECISION 174'S OWN CONCLUSION
-- ============================================================
-- This is a marks-metadata correction only, not an educational-content
-- or answer-contract change (Decision 174's own selected Option A).
-- ali_family_review's own schema (migration 034, re-verified twice
-- already this arc) contains no marks-value criterion. This migration
-- does not insert, update, or otherwise touch ali_family_review in any
-- way — no new review row is created, and no existing review evidence
-- is removed or superseded. mock-mr08-rotation's own existing
-- mock_eligible provenance remains fully valid and unquestioned.
--
-- ============================================================
-- FIRST MOCK CAPACITY — NOT ADDRESSED, NOT INFLATED ELSEWHERE
-- ============================================================
-- After this migration's own intended effect: mock_eligible = 48 rows,
-- 24 numbered experiences (unchanged — a marks-only edit inside prompt
-- touches no row or grouping column), 48 total marks (50 - 1 - 1).
-- This is the required closure condition for the Mathematics Marking
-- Integrity remediation: zero remaining Mathematics deterministic rows
-- with marks > 1 in either mock_eligible or independently_validated.
-- Against the authentic ~20-21-experience/~60-mark target (confirmed
-- identically across all three primary-source years this session), a
-- minimum 12-mark structural deficit remains — NOT solved by this
-- migration, and NOT compensated for by raising any other row's own
-- mark value, verified by this file containing exactly one `jsonb_set`
-- call, scoped to exactly these two rows.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not change eligibility_status anywhere. Does not change
-- question, answer, workingSteps, stimulus, skill, family_id,
-- provenance, content_version, active, addresses_misconception,
-- transfer_class, question_group_id, group_order, subpart_label, or
-- marking_mode on either row. Does not touch ali_family_review,
-- ali_mock_form, or ali_mock_attempt. Does not touch any other row in
-- ali_question_bank. Does not implement partial-credit scoring, split
-- the coordinate answer into separate components, or alter
-- mock_score_attempt() in any way. Does not touch Practice, English,
-- or Writing. Does not assemble any Mock form or activate Mock Centre.
-- Does not author any new content.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migration 117
-- (Mathematics Marking Integrity Gate, Phase 1) has already been
-- applied.

begin;

do $$
declare
  v_total_count int;
  v_active_count int;
  v_subject_count int;
  v_family_match_count int;
  v_eligibility_match_count int;
  v_marking_mode_ok_count int;
  v_grouping_match_count int;
  v_pending_marks2_count int;
  v_already_marks1_count int;
  v_post_write_count int;
  v_post_write_preserved_count int;
begin
  -- The exact, 2-row target map -- id, expected group_order, expected
  -- subpart_label. family_id, question_group_id, eligibility_status,
  -- and marking_mode are the same fixed literal for both rows, checked
  -- directly below rather than via a third map column.
  create temporary table tmp_rotation_marks_correction_map (
    id text primary key,
    expected_group_order smallint not null,
    expected_subpart_label text not null
  ) on commit drop;

  insert into tmp_rotation_marks_correction_map (id, expected_group_order, expected_subpart_label)
  values
    ('mock-mr08-rotation-01', 1, '(a)'),
    ('mock-mr08-rotation-02', 2, '(b)');

  if (select count(*) from tmp_rotation_marks_correction_map) <> 2 then
    raise exception 'Migration 118 refused: approved map does not contain exactly 2 rows (found %). Aborting before any check runs.',
      (select count(*) from tmp_rotation_marks_correction_map);
  end if;

  -- Precondition 1: exactly 2 matching rows exist.
  select count(*) into v_total_count
  from public.ali_question_bank b
  join tmp_rotation_marks_correction_map m on m.id = b.id;

  if v_total_count <> 2 then
    raise exception 'Migration 118 refused: expected 2 matching ali_question_bank rows, found %. No row touched.', v_total_count;
  end if;

  -- Preconditions 2-3: active / subject.
  select count(*) into v_active_count
  from public.ali_question_bank b join tmp_rotation_marks_correction_map m on m.id = b.id
  where b.active = true;
  select count(*) into v_subject_count
  from public.ali_question_bank b join tmp_rotation_marks_correction_map m on m.id = b.id
  where b.subject = 'maths';

  if v_active_count <> 2 or v_subject_count <> 2 then
    raise exception 'Migration 118 refused: preconditions failed -- active=% subject=maths=% (both must be 2). No row touched.',
      v_active_count, v_subject_count;
  end if;

  -- Precondition 4: family_id is exactly mock-mr08-rotation for both rows.
  select count(*) into v_family_match_count
  from public.ali_question_bank b join tmp_rotation_marks_correction_map m on m.id = b.id
  where b.family_id = 'mock-mr08-rotation';

  if v_family_match_count <> 2 then
    raise exception 'Migration 118 refused: % of 2 rows have family_id = mock-mr08-rotation (expected 2) -- production has drifted since Decision 174''s own evidence. No row touched.',
      v_family_match_count;
  end if;

  -- Precondition 5: eligibility_status is exactly mock_eligible for both
  -- rows (a drift guard -- this migration never changes eligibility).
  select count(*) into v_eligibility_match_count
  from public.ali_question_bank b join tmp_rotation_marks_correction_map m on m.id = b.id
  where b.eligibility_status = 'mock_eligible';

  if v_eligibility_match_count <> 2 then
    raise exception 'Migration 118 refused: % of 2 rows have eligibility_status = mock_eligible (expected 2). No row touched.',
      v_eligibility_match_count;
  end if;

  -- Precondition 6: marking_mode is exactly 'deterministic' for both rows.
  select count(*) into v_marking_mode_ok_count
  from public.ali_question_bank b join tmp_rotation_marks_correction_map m on m.id = b.id
  where b.marking_mode = 'deterministic';

  if v_marking_mode_ok_count <> 2 then
    raise exception 'Migration 118 refused: % of 2 rows have marking_mode = deterministic (expected 2). No row touched.',
      v_marking_mode_ok_count;
  end if;

  -- Precondition 7: grouping metadata matches the existing approved
  -- structure exactly -- question_group_id = family_id (mock-mr08-
  -- rotation), group_order and subpart_label match the map.
  select count(*) into v_grouping_match_count
  from public.ali_question_bank b join tmp_rotation_marks_correction_map m on m.id = b.id
  where b.question_group_id = 'mock-mr08-rotation'
    and b.group_order = m.expected_group_order
    and b.subpart_label = m.expected_subpart_label;

  if v_grouping_match_count <> 2 then
    raise exception 'Migration 118 refused: % of 2 rows have the expected grouping metadata (expected 2) -- production grouping has drifted since Decision 174''s own evidence. No row touched.',
      v_grouping_match_count;
  end if;

  -- Precondition 8: determine pre- vs post-state on marks specifically.
  select count(*) into v_pending_marks2_count
  from public.ali_question_bank b join tmp_rotation_marks_correction_map m on m.id = b.id
  where (b.prompt->>'marks')::numeric = 2;

  select count(*) into v_already_marks1_count
  from public.ali_question_bank b join tmp_rotation_marks_correction_map m on m.id = b.id
  where (b.prompt->>'marks')::numeric = 1;

  if v_pending_marks2_count = 2 then
    -- Genuine pre-correction state: snapshot every other prompt field
    -- before writing, so the write can be positively proven safe
    -- afterwards, not merely trusted.
    create temporary table tmp_rotation_pre_snapshot (
      id text primary key,
      prompt_without_marks jsonb not null
    ) on commit drop;

    insert into tmp_rotation_pre_snapshot (id, prompt_without_marks)
    select b.id, b.prompt - 'marks'
    from public.ali_question_bank b join tmp_rotation_marks_correction_map m on m.id = b.id;

    update public.ali_question_bank b
    set prompt = jsonb_set(b.prompt, '{marks}', '1'::jsonb)
    from tmp_rotation_marks_correction_map m
    where b.id = m.id;

    -- Post-write proof: both rows now read marks = 1 AND both rows have
    -- every other prompt field byte-for-byte identical to the pre-write
    -- snapshot (jsonb structural equality, not a heuristic diff).
    select count(*) into v_post_write_count
    from public.ali_question_bank b join tmp_rotation_marks_correction_map m on m.id = b.id
    where (b.prompt->>'marks')::numeric = 1;

    select count(*) into v_post_write_preserved_count
    from public.ali_question_bank b
    join tmp_rotation_pre_snapshot s on s.id = b.id
    where (b.prompt - 'marks') = s.prompt_without_marks;

    if v_post_write_count <> 2 then
      raise exception 'Migration 118: post-write verification failed -- % of 2 rows now read marks = 1 (expected 2). Transaction will roll back.', v_post_write_count;
    end if;

    if v_post_write_preserved_count <> 2 then
      raise exception 'Migration 118: post-write preservation check failed -- % of 2 rows have every prompt field except marks unchanged (expected 2). Transaction will roll back.', v_post_write_preserved_count;
    end if;

    -- Post-write proof: eligibility_status, active, and grouping
    -- metadata remain exactly as verified in the preconditions above.
    if (select count(*) from public.ali_question_bank b join tmp_rotation_marks_correction_map m on m.id = b.id
        where b.eligibility_status = 'mock_eligible' and b.active = true
          and b.question_group_id = 'mock-mr08-rotation' and b.marking_mode = 'deterministic') <> 2 then
      raise exception 'Migration 118: post-write structural verification failed -- eligibility_status/active/grouping/marking_mode drifted unexpectedly. Transaction will roll back.';
    end if;

    raise notice 'Migration 118: corrected marks from 2 to 1 on 2 rows (mock-mr08-rotation-01, mock-mr08-rotation-02) -- Mathematics Marking Integrity Gate Phase 2. Zero eligibility, content, answer, or grouping change. Mathematics mock_eligible pool now 48 rows / 24 numbered experiences / 48 marks.';

  elsif v_already_marks1_count = 2 then
    -- Already applied, exactly matching the approved post-state: clean no-op.
    raise notice 'Migration 118: both target rows already read marks = 1 -- already applied. No changes made.';

  else
    raise exception 'Migration 118 refused: marks state is neither the expected pre-correction state (found % of 2 at marks=2) nor the exact approved post-state (found % of 2 at marks=1) -- a mixed or unexpected state exists. Re-verify production state before proceeding; no row touched.',
      v_pending_marks2_count, v_already_marks1_count;
  end if;
end $$;

commit;
