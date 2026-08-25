-- Angel Digital 11+ — Migration 117
-- Mathematics Marking Integrity Gate — Remediation Phase 1
-- (Decision 172, Founder-approved metadata-only correction).
--
-- ============================================================
-- SCOPE CORRECTION, DISCLOSED (Part 1 of the Founder's own directive)
-- ============================================================
-- Decision 172's own prose stated "21 of 22 rows... MARKS CORRECTION."
-- Independently re-deriving the exact set directly from the real
-- migration source this session (not from that summary count) finds
-- this was an arithmetic error: mock-mr08-rotation contributes TWO
-- excluded rows (mock-mr08-rotation-01 AND -02), not one. The correct
-- MARKS CORRECTION population is therefore 20 rows, not 21 (22 total
-- marks=2 rows, minus rotation's own 2, = 20). This migration targets
-- exactly those 20 rows — verified by direct script re-derivation
-- against supabase/migrations/088/091/095/113's own real JSON text,
-- reproduced below, not carried forward from the prior decision's own
-- miscount.
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Decision 172's own primary-source audit (all three real CSSE
-- Mathematics mark schemes, 2021/2022/2023, read directly) found no
-- confirmed real-paper example of a single final answer legitimately
-- worth 2+ marks all-or-nothing — every multi-mark subpart found is
-- either the universal 1-mark default, an explicit partial-credit rule
-- (2023 Q7, not implemented by Angel's own scoring function), or a
-- genuinely multi-valued answer (2023 Q20b, Q8). This migration applies
-- the resulting metadata-only correction (marks 2 -> 1) to the 20 rows
-- Decision 172 classified MARKS CORRECTION, and to NONE of the rows
-- classified STRUCTURAL REMODEL (mock-mr08-rotation's own 2 rows,
-- explicitly excluded and untouched — see below).
--
-- ============================================================
-- CONTENT STORAGE CONTRACT (Part 2 of the Founder's own directive)
-- ============================================================
-- `marks` is NOT a top-level ali_question_bank column — it is a key
-- inside the `prompt` jsonb column (migration 005), read by every
-- scoring/rendering function as `prompt->>'marks'`/`prompt->'marks'`
-- (confirmed directly this session against migration 104's own
-- mock_score_attempt() and migration 115's own mock_get_question()).
-- This migration therefore uses `jsonb_set(prompt, '{marks}',
-- '1'::jsonb)`, which — by Postgres's own well-defined jsonb_set
-- semantics — replaces ONLY the `marks` key and leaves every other key
-- (id, skill, answer, question, workingSteps, stimulus where present)
-- byte-for-byte unchanged. This is verified structurally, not merely
-- asserted: before the UPDATE, this migration snapshots each target
-- row's own `prompt - 'marks'` (the jsonb "delete key" operator) into a
-- local temporary table; after the UPDATE, it re-reads the same
-- expression from the live table and asserts equality against the
-- snapshot for all 20 rows, in addition to asserting the new `marks`
-- value is exactly 1. If either check fails, the migration raises an
-- exception and the whole transaction rolls back — no partial or
-- silently-incorrect write is possible.
--
-- ============================================================
-- ELIGIBILITY IS NEVER TOUCHED
-- ============================================================
-- The 20 target rows span two different, unchanged eligibility states:
-- 18 are 'mock_eligible' (already-certified content, migration 105/112),
-- 2 are 'independently_validated' (mock-mr10-fairprep-02, mock-mr09-
-- runningclub-02, migration 116, Decision 171). Neither status is read
-- as a precondition value to be relaxed, nor written anywhere in this
-- file — the precondition below verifies each row's OWN expected
-- eligibility_status is still exactly what it was when Decision 172's
-- audit was performed (a drift guard), and the UPDATE statement's own
-- column list contains eligibility_status nowhere. mock_eligible rows
-- remain mock_eligible; mock-mr10-fairprep and mock-mr09-runningclub
-- remain independently_validated; no independently_validated row
-- becomes mock_eligible; no mock_eligible row is demoted.
--
-- ============================================================
-- GOVERNANCE — RE-VERIFIED, NOT MERELY RESTATED (Part 4 of the
-- Founder's own directive)
-- ============================================================
-- Decision 172's own conclusion that this correction does not require
-- content re-review is re-checked directly against migration 034's own
-- real ali_family_review schema this session: its 10 review-criteria
-- columns (educational_validity, competency_validity, wording_quality,
-- age_appropriate, ambiguity_free, difficulty_appropriate,
-- misconception_quality, explanation_quality,
-- variation_boundaries_sound, authenticity_confirmed) contain no field
-- naming marks, mark allocation, or assessment weight — confirmed a
-- second time, not merely asserted. This migration therefore does NOT
-- insert, update, or otherwise touch ali_family_review in any way — no
-- new review row is created, matching the Founder's own explicit
-- instruction not to create one unless repository evidence contradicted
-- Decision 172 (it does not). Every affected row's own existing
-- independent-validation/mock-eligibility provenance remains fully
-- valid and unquestioned by this migration; `mock_eligible` was never
-- equivalent to certifying the specific numeric mark value, and this
-- correction repairs that metadata before any learner Mock exists,
-- not after.
--
-- ============================================================
-- MOCK-MR08-ROTATION — EXPLICITLY EXCLUDED, NOT SOLVED HERE
-- ============================================================
-- mock-mr08-rotation-01 and -02 (coordinate-pair answers, e.g.
-- "(5, -3)") are Decision 172's own STRUCTURAL REMODEL classification,
-- not MARKS CORRECTION — a genuinely different remedy (whether to
-- represent x/y as separate independently-credited subparts, another
-- structured-answer contract, or a primary-source-justified alternative
-- treatment) requiring its own future, separate decision. Neither
-- rotation row appears anywhere in this migration's own target list,
-- verified by a dedicated test. This migration does not touch, read as
-- a precondition, or otherwise reference either rotation row.
--
-- ============================================================
-- FIRST MOCK CAPACITY — NOT RESTORED BY THIS MIGRATION
-- ============================================================
-- This migration reduces the mock_eligible pool's own total marks (68
-- -> 50, unchanged raw-row and numbered-experience counts — see this
-- migration's own header arithmetic below) and does NOT attempt to
-- restore marks density by raising any other row's own mark value.
-- Decision 172's own finding stands, unweakened: the corrected pool
-- does not currently support an authentic First Mathematics Mock: real
-- capacity requires additional genuinely credit-bearing content
-- (further authentic subparts, evidence-backed compound questions), not
-- artificial mark weighting. Not addressed by this migration.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch mock-mr08-rotation. Does not change eligibility_status
-- anywhere. Does not change answer, question, workingSteps, stimulus,
-- skill, family_id, provenance, content_version, active,
-- addresses_misconception, transfer_class, question_group_id,
-- group_order, subpart_label, or marking_mode on any row. Does not
-- touch ali_family_review, ali_mock_form, ali_mock_attempt, Practice
-- content, English, or Writing. Does not implement partial-credit
-- scoring or alter mock_score_attempt() in any way. Does not assemble
-- any Mock form or activate Mock Centre. Does not author any new
-- content.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 105
-- (mock_eligible promotion), 112 (grouping normalisation), and 116
-- (Shared-Scenario Completion Batch independent validation) have
-- already been applied.

begin;

do $$
declare
  v_total_count int;
  v_active_count int;
  v_subject_count int;
  v_family_match_count int;
  v_eligibility_match_count int;
  v_marking_mode_ok_count int;
  v_pending_marks2_count int;
  v_already_marks1_count int;
  v_post_write_count int;
  v_post_write_preserved_count int;
begin
  -- Build the exact, corrected 20-row target map (NOT the Decision
  -- 172 prose's own miscounted 21) -- id, expected family_id, expected
  -- eligibility_status, all independently re-derived this session.
  create temporary table tmp_marks_correction_map (
    id text primary key,
    expected_family_id text not null,
    expected_eligibility_status text not null
  ) on commit drop;

  insert into tmp_marks_correction_map (id, expected_family_id, expected_eligibility_status)
  values
    ('mock-mr02-twostep-01', 'mock-mr02-twostep', 'mock_eligible'),
    ('mock-mr02-twostep-02', 'mock-mr02-twostep', 'mock_eligible'),
    ('mock-mr02-twostep-03', 'mock-mr02-twostep', 'mock_eligible'),
    ('mock-mr05-inverse-01', 'mock-mr05-inverse', 'mock_eligible'),
    ('mock-mr05-inverse-02', 'mock-mr05-inverse', 'mock_eligible'),
    ('mock-mr04-reversepercent-01', 'mock-mr04-reversepercent', 'mock_eligible'),
    ('mock-mr04-reversepercent-02', 'mock-mr04-reversepercent', 'mock_eligible'),
    ('mock-mr06-multiplerelation-01', 'mock-mr06-multiplerelation', 'mock_eligible'),
    ('mock-mr06-multiplerelation-02', 'mock-mr06-multiplerelation', 'mock_eligible'),
    ('mock-mr07-isoscelesproperty-01', 'mock-mr07-isoscelesproperty', 'mock_eligible'),
    ('mock-mr07-isoscelesproperty-02', 'mock-mr07-isoscelesproperty', 'mock_eligible'),
    ('mock-mr10-reverseschedule-01', 'mock-mr10-reverseschedule', 'mock_eligible'),
    ('mock-mr10-reverseschedule-02', 'mock-mr10-reverseschedule', 'mock_eligible'),
    ('mock-mr11-propertysearch-01', 'mock-mr11-propertysearch', 'mock_eligible'),
    ('mock-mr11-propertysearch-02', 'mock-mr11-propertysearch', 'mock_eligible'),
    ('mock-mr12-reversemean-01', 'mock-mr12-reversemean', 'mock_eligible'),
    ('mock-mr12-reversemean-02', 'mock-mr12-reversemean', 'mock_eligible'),
    ('mock-mr09-data-03', 'mock-mr09-data', 'mock_eligible'),
    ('mock-mr10-fairprep-02', 'mock-mr10-fairprep', 'independently_validated'),
    ('mock-mr09-runningclub-02', 'mock-mr09-runningclub', 'independently_validated');

  if (select count(*) from tmp_marks_correction_map) <> 20 then
    raise exception 'Migration 117 refused: approved map does not contain exactly 20 rows (found %). Aborting before any check runs.',
      (select count(*) from tmp_marks_correction_map);
  end if;

  -- Structural exclusion proof: mock-mr08-rotation must never appear in
  -- the target map, by construction.
  if exists (select 1 from tmp_marks_correction_map where id like 'mock-mr08-rotation%') then
    raise exception 'Migration 117 refused: mock-mr08-rotation must never appear in the MARKS CORRECTION target map -- it is Decision 172''s own STRUCTURAL REMODEL exclusion.';
  end if;

  -- Precondition 1: exactly 20 matching rows exist.
  select count(*) into v_total_count
  from public.ali_question_bank b
  join tmp_marks_correction_map m on m.id = b.id;

  if v_total_count <> 20 then
    raise exception 'Migration 117 refused: expected 20 matching ali_question_bank rows, found %. No row touched.', v_total_count;
  end if;

  -- Preconditions 2-3: active / subject.
  select count(*) into v_active_count
  from public.ali_question_bank b join tmp_marks_correction_map m on m.id = b.id
  where b.active = true;
  select count(*) into v_subject_count
  from public.ali_question_bank b join tmp_marks_correction_map m on m.id = b.id
  where b.subject = 'maths';

  if v_active_count <> 20 or v_subject_count <> 20 then
    raise exception 'Migration 117 refused: preconditions failed -- active=% subject=maths=% (both must be 20). No row touched.',
      v_active_count, v_subject_count;
  end if;

  -- Precondition 4: family_id matches the approved map exactly.
  select count(*) into v_family_match_count
  from public.ali_question_bank b join tmp_marks_correction_map m on m.id = b.id
  where b.family_id = m.expected_family_id;

  if v_family_match_count <> 20 then
    raise exception 'Migration 117 refused: % of 20 rows have a family_id matching the approved map (expected 20) -- production has drifted since Decision 172''s own evidence. No row touched.',
      v_family_match_count;
  end if;

  -- Precondition 5: eligibility_status matches the approved map exactly
  -- (a drift guard -- this migration never changes eligibility, but it
  -- must refuse if a row's eligibility has moved since Decision 172).
  select count(*) into v_eligibility_match_count
  from public.ali_question_bank b join tmp_marks_correction_map m on m.id = b.id
  where b.eligibility_status = m.expected_eligibility_status;

  if v_eligibility_match_count <> 20 then
    raise exception 'Migration 117 refused: % of 20 rows have eligibility_status matching the approved map (expected 20). No row touched.',
      v_eligibility_match_count;
  end if;

  -- Precondition 6: marking_mode is NULL (mock-mr09-data-03's own
  -- pre-093 state, unchanged by migration 112's deliberate exclusion of
  -- mock-mr09-data) or 'deterministic' (every other target row) --
  -- matching migration 105's own established NULL-or-deterministic
  -- pool-gate convention exactly.
  select count(*) into v_marking_mode_ok_count
  from public.ali_question_bank b join tmp_marks_correction_map m on m.id = b.id
  where b.marking_mode is null or b.marking_mode = 'deterministic';

  if v_marking_mode_ok_count <> 20 then
    raise exception 'Migration 117 refused: % of 20 rows have marking_mode NULL or deterministic (expected 20). No row touched.',
      v_marking_mode_ok_count;
  end if;

  -- Precondition 7: determine pre- vs post-state on marks specifically.
  select count(*) into v_pending_marks2_count
  from public.ali_question_bank b join tmp_marks_correction_map m on m.id = b.id
  where (b.prompt->>'marks')::numeric = 2;

  select count(*) into v_already_marks1_count
  from public.ali_question_bank b join tmp_marks_correction_map m on m.id = b.id
  where (b.prompt->>'marks')::numeric = 1;

  if v_pending_marks2_count = 20 then
    -- Genuine pre-correction state: snapshot every other prompt field
    -- before writing, so the write can be positively proven safe
    -- afterwards, not merely trusted.
    create temporary table tmp_pre_snapshot (
      id text primary key,
      prompt_without_marks jsonb not null
    ) on commit drop;

    insert into tmp_pre_snapshot (id, prompt_without_marks)
    select b.id, b.prompt - 'marks'
    from public.ali_question_bank b join tmp_marks_correction_map m on m.id = b.id;

    update public.ali_question_bank b
    set prompt = jsonb_set(b.prompt, '{marks}', '1'::jsonb)
    from tmp_marks_correction_map m
    where b.id = m.id;

    -- Post-write proof: exactly 20 rows now read marks = 1 AND exactly
    -- 20 rows have every other prompt field byte-for-byte identical to
    -- the pre-write snapshot (jsonb equality, not a heuristic diff).
    select count(*) into v_post_write_count
    from public.ali_question_bank b join tmp_marks_correction_map m on m.id = b.id
    where (b.prompt->>'marks')::numeric = 1;

    select count(*) into v_post_write_preserved_count
    from public.ali_question_bank b
    join tmp_pre_snapshot s on s.id = b.id
    where (b.prompt - 'marks') = s.prompt_without_marks;

    if v_post_write_count <> 20 then
      raise exception 'Migration 117: post-write verification failed -- % of 20 rows now read marks = 1 (expected 20). Transaction will roll back.', v_post_write_count;
    end if;

    if v_post_write_preserved_count <> 20 then
      raise exception 'Migration 117: post-write preservation check failed -- % of 20 rows have every prompt field except marks unchanged (expected 20). Transaction will roll back.', v_post_write_preserved_count;
    end if;

    raise notice 'Migration 117: corrected marks from 2 to 1 on 20 rows (Decision 172''s own re-derived MARKS CORRECTION set, 11 families). mock-mr08-rotation untouched. No eligibility_status changed. Every other prompt field verified byte-for-byte unchanged.';

  elsif v_already_marks1_count = 20 then
    -- Already applied, exactly matching the approved post-state: clean no-op.
    raise notice 'Migration 117: all 20 target rows already read marks = 1 -- already applied. No changes made.';

  else
    raise exception 'Migration 117 refused: marks state is neither the expected pre-correction state (found % of 20 at marks=2) nor the exact approved post-state (found % of 20 at marks=1) -- a mixed or unexpected state exists. Re-verify production state before proceeding; no row touched.',
      v_pending_marks2_count, v_already_marks1_count;
  end if;
end $$;

commit;
