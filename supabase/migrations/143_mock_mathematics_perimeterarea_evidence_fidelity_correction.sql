-- Angel Digital 11+ — Migration 143
-- Mathematics: Perimeter Area Evidence-Fidelity Documentation Correction
-- (Decision 208/209).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Decision 208's own primary-source audit (re-opening the real 2023
-- paper and mark scheme directly via pdftotext, not Decision prose)
-- confirmed a real, but strictly DOCUMENTATION-ONLY, evidence-fidelity
-- defect in mock-mr03mr07-perimeterarea's two QT-MR-03 rows
-- (mock-mr03mr07-perimeterarea-01a, mock-mr03mr07-perimeterarea-02a):
-- their stored `explanation` column (migration 109, Decision 163)
-- claims the family represents "the same structural relationship" as
-- 2023 Q14, "independently confirmed against the real 2023 mark
-- scheme's own 2-subpart, 1-mark-each structure" -- a claim that
-- overstates the grounding. The real 2023 Q14 requires rounding-bounds
-- derivation (a length rounded to the nearest 10cm, a width rounded to
-- the nearest cm, requiring the smallest possible perimeter/area);
-- Angel's own authored content uses exact unit conversion followed by
-- ordinary perimeter/area arithmetic on exact dimensions -- no rounding
-- or bounds reasoning of any kind. Decision 208's own verdict: B --
-- DOCUMENTATION-ONLY EVIDENCE-FIDELITY DEFECT CONFIRMED. This migration
-- implements Decision 208's own designed-but-not-built remediation: the
-- smallest possible correction, touching only the two affected
-- `explanation` values.
--
-- ============================================================
-- SCOPE: THE `explanation` COLUMN ON EXACTLY TWO ROWS, NOTHING ELSE
-- ============================================================
-- mock-mr03mr07-perimeterarea-01a and mock-mr03mr07-perimeterarea-02a
-- are the ONLY rows this migration ever targets. Only the `explanation`
-- column (a top-level column, distinct from the `prompt` jsonb) is
-- changed -- proven, not merely asserted, by a full pre-write snapshot
-- of the complete `prompt` jsonb compared byte-for-byte against the
-- live value after the write, plus explicit pre- and post-write
-- structural re-verification of every other column named in Decision
-- 209's own hard boundary (eligibility_status, active, question, answer,
-- marks, content_difficulty, marking_mode, family_id, skill,
-- question_group_id, group_order, subpart_label). The two other rows of
-- this family (mock-mr03mr07-perimeterarea-01b, -02b) and every other
-- family in this repository are never referenced by this migration's
-- own executable SQL.
--
-- ============================================================
-- OLD vs NEW EVIDENCE MEANING
-- ============================================================
-- OLD (both rows, migration 109's own original text): presents the
-- family as directly evidenced by 2023 Q14's own "2-subpart, 1-mark-each
-- structure," without distinguishing which part of that claim is
-- genuinely source-grounded from which part was authored independently
-- -- the exact gap the SOURCE-CONTAINS/AUTHORED-EXTRAPOLATION discipline
-- (introduced after Decision 200) exists to close.
--
-- NEW (both rows): explicitly separates SOURCE-CONTAINS (2023 Q14 pairs
-- a measurement step with a geometric perimeter/area step, but its
-- measurement step is rounding-bounds derivation) from ANGEL-IMPLEMENTS
-- (exact unit conversion followed by ordinary perimeter arithmetic on
-- exact, non-rounded dimensions -- no rounding or bounds reasoning) and
-- names the RELATIONSHIP explicitly as PARTIAL/TRANSFORMED GROUNDING --
-- the two-step compound structure is genuinely evidenced (by 2023 Q14
-- and by Decision 163's own independently-proven three-year
-- compound-question norm), but the specific rounding-bounds reasoning is
-- not implemented and is not claimed.
--
-- ============================================================
-- LEARNER-FACING CONTENT UNCHANGED; CERTIFICATION UNCHANGED
-- ============================================================
-- `question`, `answer`, `workingSteps`, `sharedStem`, `marks`, and every
-- other `prompt` key are byte-for-byte unchanged (proven below). Per
-- Decision 208's own certification-consequence finding, mathematical/
-- content validity was already sound and is untouched by this
-- migration; `eligibility_status` remains `independently_validated`,
-- never touched, never re-derived, never requiring a fresh Founder
-- review (Decision 208's own Part 8 rule: fresh review is required only
-- for verdict C content changes, not verdict B documentation
-- corrections). This migration does not insert, update, or delete any
-- `ali_family_review` row, does not touch `ali_mock_form`, does not
-- change `mock_eligible`, does not touch any RPC, RLS policy, or grant,
-- and does not author any new question.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not modify migration 109 (historical, immutable). Does not
-- rewrite any prior Decision. Does not touch
-- mock-mr03mr07-perimeterarea-01b or -02b, or any other family. Does not
-- change eligibility_status, active, question, answer, marks,
-- content_difficulty, marking_mode, family_id, skill, question_group_id,
-- group_order, or subpart_label on any row. Does not touch
-- ali_family_review, ali_mock_form, mock_eligible, any RPC, RLS policy,
-- or grant. Does not start Increment 007.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

do $$
declare
  v_old_explanation_01a constant text := 'Mathematics First Mock Minimum, Compound Content Batch 001 (Decision 163). Grouped numbered-question instance 1, subpart (a) — QT-MR-03 (Unit Conversion / Measurement Calculation), competency MR-01, family mock-mr03mr07-perimeterarea. Forms one displayed numbered question together with subpart (b) below (question_group_id mock-mr03mr07-perimeterarea-01), representing the same structural relationship the CSSE_QUESTION_INTELLIGENCE_FRAMEWORK''s own Section 6 records at CSSE-006 Q14 ("combines QT-MR-03 (rounding/measurement) with QT-MR-07 (geometric perimeter/area)"), independently confirmed against the real 2023 mark scheme''s own 2-subpart, 1-mark-each structure. Original Angel scenario, not a paraphrase of the source question. Answer independently recomputed: 250cm = 2.5m, perimeter = 2×(3.6+2.5) = 12.2m.';
  v_new_explanation_01a constant text := 'Mathematics First Mock Minimum, Compound Content Batch 001 (Decision 163). Grouped numbered-question instance 1, subpart (a) — QT-MR-03 (Unit Conversion / Measurement Calculation), competency MR-01, family mock-mr03mr07-perimeterarea. Forms one displayed numbered question together with subpart (b) below (question_group_id mock-mr03mr07-perimeterarea-01). Evidence-fidelity corrected (Decision 208/209): SOURCE-CONTAINS -- the real 2023 Q14 pairs a measurement step with a geometric perimeter/area step, but its measurement step is rounding-bounds derivation (a length and width each given only as a rounded figure, requiring the smallest possible perimeter/area consistent with that rounding). ANGEL-IMPLEMENTS -- exact unit conversion (250cm to 2.5m) followed by ordinary perimeter arithmetic on the converted exact dimensions, with no rounding or bounds reasoning required or implied. RELATIONSHIP: PARTIAL/TRANSFORMED GROUNDING -- the two-step measurement-then-geometry compound structure is genuinely evidenced by 2023 Q14 and by Decision 163''s own independently-proven three-year compound-question norm; the specific rounding-bounds reasoning is not implemented here and is not claimed. Original Angel scenario, not a paraphrase of the source question. Answer independently recomputed: 250cm = 2.5m, perimeter = 2×(3.6+2.5) = 12.2m.';
  v_old_explanation_02a constant text := 'Mathematics First Mock Minimum, Compound Content Batch 001 (Decision 163). Grouped numbered-question instance 2, subpart (a) — QT-MR-03, family mock-mr03mr07-perimeterarea, variant 2 — a genuinely different unit pair (mm/cm rather than instance 1''s cm/m) and real-world context (window pane, not a garden bed), not a relabelled copy. Answer independently recomputed: 450mm = 45cm, perimeter = 2×(90+45) = 270cm.';
  v_new_explanation_02a constant text := 'Mathematics First Mock Minimum, Compound Content Batch 001 (Decision 163). Grouped numbered-question instance 2, subpart (a) — QT-MR-03, family mock-mr03mr07-perimeterarea, variant 2 — a genuinely different unit pair (mm/cm rather than instance 1''s cm/m) and real-world context (window pane, not a garden bed), not a relabelled copy. Evidence-fidelity corrected (Decision 208/209): SOURCE-CONTAINS -- the real 2023 Q14 pairs a measurement step with a geometric perimeter/area step, but its measurement step is rounding-bounds derivation. ANGEL-IMPLEMENTS -- exact unit conversion (450mm to 45cm) followed by ordinary perimeter arithmetic on the converted exact dimensions, with no rounding or bounds reasoning required or implied. RELATIONSHIP: PARTIAL/TRANSFORMED GROUNDING -- the two-step measurement-then-geometry compound structure is genuinely evidenced by 2023 Q14 and by Decision 163''s own independently-proven three-year compound-question norm; the specific rounding-bounds reasoning is not implemented here and is not claimed. Answer independently recomputed: 450mm = 45cm, perimeter = 2×(90+45) = 270cm.';
  v_target_ids constant text[] := array['mock-mr03mr07-perimeterarea-01a', 'mock-mr03mr07-perimeterarea-02a'];
  v_pending_old_count int;
  v_already_corrected_count int;
  v_precondition_count int;
  v_post_write_count int;
  v_post_write_prompt_preserved_count int;
  v_post_write_structural_count int;
begin
  -- Live structural preconditions, checked regardless of branch, so any
  -- drift in any other field is caught before this migration ever writes
  -- anything.
  select count(*) into v_precondition_count
    from public.ali_question_bank b
    join (values
      ('mock-mr03mr07-perimeterarea-01a', 'mock-mr03mr07-perimeterarea-01', '12.2'),
      ('mock-mr03mr07-perimeterarea-02a', 'mock-mr03mr07-perimeterarea-02', '270')
    ) as expected(id, expected_group_id, expected_answer)
      on b.id = expected.id
    where b.family_id = 'mock-mr03mr07-perimeterarea'
      and b.subject = 'maths'
      and b.skill = 'QT-MR-03'
      and b.active = true
      and b.eligibility_status = 'independently_validated'
      and b.marking_mode = 'deterministic'
      and b.content_difficulty::text = 'hard'
      and b.question_group_id = expected.expected_group_id
      and b.group_order = 1
      and b.subpart_label = '(a)'
      and (b.prompt->>'answer') = expected.expected_answer
      and (b.prompt->>'marks')::numeric = 1;
  if v_precondition_count <> 2 then
    raise exception 'Migration 143 refused: expected exactly 2 rows matching the family/subject/skill/active/eligibility/marking_mode/difficulty/grouping/answer/marks preconditions (found %). Re-verify production state before proceeding.', v_precondition_count;
  end if;

  select count(*) into v_pending_old_count
    from public.ali_question_bank
    where id = any(v_target_ids)
      and ((id = 'mock-mr03mr07-perimeterarea-01a' and explanation = v_old_explanation_01a)
        or (id = 'mock-mr03mr07-perimeterarea-02a' and explanation = v_old_explanation_02a));

  select count(*) into v_already_corrected_count
    from public.ali_question_bank
    where id = any(v_target_ids)
      and ((id = 'mock-mr03mr07-perimeterarea-01a' and explanation = v_new_explanation_01a)
        or (id = 'mock-mr03mr07-perimeterarea-02a' and explanation = v_new_explanation_02a));

  if v_pending_old_count = 2 then
    create temporary table tmp_perimeterarea_evidence_correction_snapshot (id text primary key, prompt_snapshot jsonb not null) on commit drop;
    insert into tmp_perimeterarea_evidence_correction_snapshot (id, prompt_snapshot)
      select id, prompt from public.ali_question_bank where id = any(v_target_ids);

    update public.ali_question_bank
    set explanation = v_new_explanation_01a
    where id = 'mock-mr03mr07-perimeterarea-01a' and explanation = v_old_explanation_01a;

    update public.ali_question_bank
    set explanation = v_new_explanation_02a
    where id = 'mock-mr03mr07-perimeterarea-02a' and explanation = v_old_explanation_02a;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids)
        and ((id = 'mock-mr03mr07-perimeterarea-01a' and explanation = v_new_explanation_01a)
          or (id = 'mock-mr03mr07-perimeterarea-02a' and explanation = v_new_explanation_02a));
    if v_post_write_count <> 2 then
      raise exception 'Migration 143 post-write verification failed: expected 2 rows now carrying the corrected explanation text, found %. Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_prompt_preserved_count
      from public.ali_question_bank b
      join tmp_perimeterarea_evidence_correction_snapshot s on b.id = s.id
      where b.prompt = s.prompt_snapshot;
    if v_post_write_prompt_preserved_count <> 2 then
      raise exception 'Migration 143 post-write preservation check failed: % of 2 rows have their entire prompt jsonb byte-for-byte unchanged (expected 2 -- question, answer, workingSteps, marks, and every other prompt key must be untouched). Rolling back.', v_post_write_prompt_preserved_count;
    end if;

    select count(*) into v_post_write_structural_count
      from public.ali_question_bank b
      join (values
        ('mock-mr03mr07-perimeterarea-01a', 'mock-mr03mr07-perimeterarea-01'),
        ('mock-mr03mr07-perimeterarea-02a', 'mock-mr03mr07-perimeterarea-02')
      ) as expected(id, expected_group_id)
        on b.id = expected.id
      where b.family_id = 'mock-mr03mr07-perimeterarea'
        and b.active = true
        and b.eligibility_status = 'independently_validated'
        and b.marking_mode = 'deterministic'
        and b.content_difficulty::text = 'hard'
        and b.question_group_id = expected.expected_group_id
        and b.group_order = 1
        and b.subpart_label = '(a)';
    if v_post_write_structural_count <> 2 then
      raise exception 'Migration 143 post-write structural verification failed: family_id/active/eligibility_status/marking_mode/content_difficulty/grouping drifted unexpectedly. Rolling back.';
    end if;

    raise notice 'Migration 143: corrected the explanation text on mock-mr03mr07-perimeterarea-01a and -02a to accurately distinguish SOURCE-CONTAINS from ANGEL-IMPLEMENTS and state the RELATIONSHIP as PARTIAL/TRANSFORMED GROUNDING, per Decision 208''s audit. question, answer, marks, sharedStem, and every other prompt key proven byte-for-byte unchanged. eligibility_status remains independently_validated, unchanged. No other row touched.';

  elsif v_already_corrected_count = 2 then
    raise notice 'Migration 143: both target rows already carry the corrected explanation text -- already applied. No changes made.';

  else
    raise exception
      'Migration 143 refused: expected both target rows to carry the exact pre-correction explanation text (found %) or both to already carry the exact post-correction explanation text (found %). Re-verify production state before proceeding.',
      v_pending_old_count, v_already_corrected_count;
  end if;
end $$;

commit;
