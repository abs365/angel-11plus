-- Angel Digital 11+ — Migration 112
-- Mathematics Mock Structural Normalisation — Grouping-Metadata
-- Application (Decision 166, approving Decision 165 Part 8's own
-- row-level map exactly, no reinterpretation, no expansion).
--
-- ============================================================
-- SCOPE — EXACTLY, NOT MORE
-- ============================================================
-- 19 existing mock_eligible Mathematics families, 41 rows, becoming 19
-- displayed numbered-question experiences, 60 marks. Every id, every
-- family_id, every group_order, every subpart_label below is taken
-- verbatim from Decision 165 Part 8 / Decision 166's approval — not
-- re-derived, not reinterpreted. The two Classification-B cross-family
-- candidates (mr04-percentchange<->mr04-reversepercent,
-- mr10-forwardschedule<->mr10-reverseschedule) are each promoted as TWO
-- SEPARATE single-family groups here, exactly as Decision 166 Part 2
-- requires — never combined into one cross-family group.
--
-- EXPLICITLY EXCLUDED, touched by no clause in this file: mock-mr09-data
-- (Classification D, still unresolved), mock-mr01mr10-costumeschedule
-- (already grouped by migration 095, untouched), mock-mr03mr07-
-- perimeterarea (Batch 001, independently_validated only, not yet
-- mock_eligible — migration 111, still not applied), all Practice
-- content, English, Writing.
--
-- ============================================================
-- WHAT THIS MIGRATION CHANGES
-- ============================================================
-- Exactly 4 columns, on exactly 41 named rows: question_group_id (set
-- to that row's own existing family_id — Decision 166 Part 6's own
-- instruction to use family_id itself, not an invented identifier,
-- applied literally: the UPDATE below reads family_id off the row being
-- updated rather than restating it as a separate literal, so there is
-- no risk of the written question_group_id ever drifting from the row's
-- own real family_id), group_order, subpart_label, marking_mode (set to
-- 'deterministic' on every row, matching migration 095's own
-- costumeschedule/perimeterarea precedent exactly, and matching what
-- Decision 165 Part 3 already confirmed of every one of these 41 rows:
-- single deterministic exact-match answers, no semicolon, no free text).
--
-- No other column is touched. id, subject, skill, prompt (question/
-- answer/marks/workingSteps), explanation, mastery_threshold,
-- learning_unit_id, family_id, provenance, eligibility_status,
-- content_version, active, addresses_misconception, transfer_class are
-- read only, in precondition checks, never written by this migration.
-- Every affected row's eligibility_status remains 'mock_eligible',
-- unchanged — this migration does not touch that column at all.
--
-- ============================================================
-- WHY NO APPLICATION-CODE CHANGE ACCOMPANIES THIS MIGRATION
-- ============================================================
-- Decision 161 (migrations 104/106/107) already built the complete,
-- GENERIC grouping pipeline this migration's 41 rows now populate real
-- data into — confirmed by direct source reading this session, not
-- assumed:
--   - mock_get_question() (migration 106) and mock_get_attempt_grouping()
--     (migration 106, new) both read question_group_id/group_order/
--     subpart_label straight off ali_question_bank for whatever ids are
--     actually assigned to an attempt — no hardcoded family list.
--   - mock_score_attempt() (migration 104) carries the same three
--     columns into every question_outcomes entry, read live per row,
--     and its marks-total loop already sums every assigned id's own
--     `marks` regardless of grouping (migration 104's own header: "no
--     marks-total bug to fix").
--   - lib/mockAttempt/workspace.ts's buildDisplayUnits()/buildPalette()/
--     unansweredUnitIndices() (tests: tests/lib/mockAttempt/
--     workspace.test.ts) collapse CONSECUTIVE same-questionGroupId ids
--     into one display unit purely from the grouping data supplied at
--     runtime — proven generic today with synthetic ("group-a"/
--     "group-b") and real (costumeschedule) fixtures alike, not
--     specific to any one family.
--   - app/learning-intelligence/mock-exam/page.tsx's own "Question N of
--     Total" (line ~434) reads units.length (display-unit count), and
--     its palette (line ~351) is built from the same units — never the
--     raw assigned_question_ids count.
--   - ali_mock_attempt_answer (migration 070) persists one row per raw
--     question_id (unique(attempt_id, question_id)) regardless of
--     grouping — answer persistence, and therefore exposure/history
--     recording of every underlying raw id, is untouched by this
--     migration.
--   - lib/ali/exposureIntelligence.ts's groupingKeyOf() (the live
--     Practice selection engine) reads family_id/learning_unit_id only —
--     confirmed by direct grep this session to contain zero reference to
--     question_group_id anywhere. Practice exposure/clustering is
--     structurally unreachable by this migration, exactly as migration
--     093's own original design rationale intended.
-- This migration is therefore data-only, mirroring migration 105's own
-- "pure data promotion, zero code change" precedent exactly — the
-- rendering/scoring/persistence code this data now flows through was
-- already written, tested, and applied in Decision 161, and is
-- unmodified by this file.
--
-- ============================================================
-- FAIL-CLOSED PRECONDITIONS (all checked live, before any UPDATE)
-- ============================================================
-- 1. Exactly 41 rows exist matching the named ids.
-- 2. All 41 are active = true.
-- 3. All 41 are subject = 'maths'.
-- 4. All 41 are eligibility_status = 'mock_eligible'.
-- 5. All 41 have family_id exactly matching the approved map (guards
--    against any production drift since Decision 165's own evidence
--    was gathered — not assumed still true).
-- 6. All 41 have marking_mode NULL or 'deterministic' already (matching
--    Decision 165 Part 3's own verified evidence — this migration
--    refuses if any row's live marking_mode contradicts that evidence).
-- 7. SUM of marks across the 41 ids = 60 exactly (guards against any
--    content drift since Decision 165 Part 6's own independent
--    summation).
-- 8. Grouping-column pre-state: either (a) ALL 41 have
--    question_group_id/group_order/subpart_label all NULL (the genuine
--    pre-normalisation state, migration 093's own untouched default —
--    the expected case, triggers the UPDATE), or (b) ALL 41 already
--    carry EXACTLY the approved post-state values (already applied —
--    clean no-op). Any other combination (partial application, or
--    values that do not match the approved map) is a mixed/unexpected
--    state and this migration refuses outright rather than guess or
--    partially repair it.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch mock-mr09-data, mock-mr01mr10-costumeschedule,
-- mock-mr03mr07-perimeterarea, migration 111 (Batch 001 promotion,
-- still not applied, still separate), any English or Writing row, any
-- Practice row, ali_family_review, ali_mock_form, ali_mock_attempt, any
-- RLS policy, any GRANT/REVOKE. Does not assemble any Mock form,
-- activate Mock Centre, or create any attempt. Does not correct the Q9
-- provenance discrepancy named in Decision 165 Part 2 — that remains
-- separate, disclosed, not-urgent documentation debt.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 093
-- (grouping columns), 104/106/107 (grouped scoring/rendering/attempt
-- pipeline), and 105 (the 48-row mock_eligible promotion this
-- migration's own precondition #4 depends on) have already been
-- applied.

begin;

do $$
declare
  v_total_count int;
  v_active_count int;
  v_subject_count int;
  v_eligible_count int;
  v_family_match_count int;
  v_marking_mode_ok_count int;
  v_marks_total numeric;
  v_null_state_count int;
  v_applied_state_count int;
begin
  -- Build a real, queryable temp table from the approved map (41 rows,
  -- a plain VALUES list -- deliberately not a text[][] unnest, which
  -- flattens ALL dimensions of a multidimensional Postgres array into
  -- scalars rather than row-vectors and would silently misparse this
  -- exact shape of data).
  create temporary table tmp_normalisation_map (
    id text primary key,
    expected_family_id text not null,
    expected_group_order smallint not null,
    expected_subpart_label text not null
  ) on commit drop;

  insert into tmp_normalisation_map (id, expected_family_id, expected_group_order, expected_subpart_label)
  values
    ('mock-mr02-invdiv-01', 'mock-mr02-invdiv', 1, '(a)'),
    ('mock-mr02-invdiv-02', 'mock-mr02-invdiv', 2, '(b)'),
    ('mock-mr02-invdiv-03', 'mock-mr02-invdiv', 3, '(c)'),
    ('mock-mr02-twostep-01', 'mock-mr02-twostep', 1, '(a)'),
    ('mock-mr02-twostep-02', 'mock-mr02-twostep', 2, '(b)'),
    ('mock-mr02-twostep-03', 'mock-mr02-twostep', 3, '(c)'),
    ('mock-mr03-unitconv-01', 'mock-mr03-unitconv', 1, '(a)'),
    ('mock-mr03-unitconv-02', 'mock-mr03-unitconv', 2, '(b)'),
    ('mock-mr03-unitconv-03', 'mock-mr03-unitconv', 3, '(c)'),
    ('mock-mr05-forward-01', 'mock-mr05-forward', 1, '(a)'),
    ('mock-mr05-forward-02', 'mock-mr05-forward', 2, '(b)'),
    ('mock-mr05-inverse-01', 'mock-mr05-inverse', 1, '(a)'),
    ('mock-mr05-inverse-02', 'mock-mr05-inverse', 2, '(b)'),
    ('mock-mr13-bestvalue-01', 'mock-mr13-bestvalue', 1, '(a)'),
    ('mock-mr13-bestvalue-02', 'mock-mr13-bestvalue', 2, '(b)'),
    ('mock-mr04-percentchange-01', 'mock-mr04-percentchange', 1, '(a)'),
    ('mock-mr04-percentchange-02', 'mock-mr04-percentchange', 2, '(b)'),
    ('mock-mr04-reversepercent-01', 'mock-mr04-reversepercent', 1, '(a)'),
    ('mock-mr04-reversepercent-02', 'mock-mr04-reversepercent', 2, '(b)'),
    ('mock-mr06-sumdiff-01', 'mock-mr06-sumdiff', 1, '(a)'),
    ('mock-mr06-sumdiff-02', 'mock-mr06-sumdiff', 2, '(b)'),
    ('mock-mr06-multiplerelation-01', 'mock-mr06-multiplerelation', 1, '(a)'),
    ('mock-mr06-multiplerelation-02', 'mock-mr06-multiplerelation', 2, '(b)'),
    ('mock-mr07-triangleanglesum-01', 'mock-mr07-triangleanglesum', 1, '(a)'),
    ('mock-mr07-triangleanglesum-02', 'mock-mr07-triangleanglesum', 2, '(b)'),
    ('mock-mr07-isoscelesproperty-01', 'mock-mr07-isoscelesproperty', 1, '(a)'),
    ('mock-mr07-isoscelesproperty-02', 'mock-mr07-isoscelesproperty', 2, '(b)'),
    ('mock-mr10-forwardschedule-01', 'mock-mr10-forwardschedule', 1, '(a)'),
    ('mock-mr10-forwardschedule-02', 'mock-mr10-forwardschedule', 2, '(b)'),
    ('mock-mr10-reverseschedule-01', 'mock-mr10-reverseschedule', 1, '(a)'),
    ('mock-mr10-reverseschedule-02', 'mock-mr10-reverseschedule', 2, '(b)'),
    ('mock-mr11-truefalsejudgement-01', 'mock-mr11-truefalsejudgement', 1, '(a)'),
    ('mock-mr11-truefalsejudgement-02', 'mock-mr11-truefalsejudgement', 2, '(b)'),
    ('mock-mr11-propertysearch-01', 'mock-mr11-propertysearch', 1, '(a)'),
    ('mock-mr11-propertysearch-02', 'mock-mr11-propertysearch', 2, '(b)'),
    ('mock-mr01-directcalc-01', 'mock-mr01-directcalc', 1, '(a)'),
    ('mock-mr01-directcalc-02', 'mock-mr01-directcalc', 2, '(b)'),
    ('mock-mr08-rotation-01', 'mock-mr08-rotation', 1, '(a)'),
    ('mock-mr08-rotation-02', 'mock-mr08-rotation', 2, '(b)'),
    ('mock-mr12-reversemean-01', 'mock-mr12-reversemean', 1, '(a)'),
    ('mock-mr12-reversemean-02', 'mock-mr12-reversemean', 2, '(b)');

  if (select count(*) from tmp_normalisation_map) <> 41 then
    raise exception 'Migration 112 refused: approved map does not contain exactly 41 rows (found %). Aborting before any check runs.',
      (select count(*) from tmp_normalisation_map);
  end if;

  -- Precondition 1: exactly 41 matching rows exist in ali_question_bank.
  select count(*) into v_total_count
  from public.ali_question_bank b
  join tmp_normalisation_map m on m.id = b.id;

  if v_total_count <> 41 then
    raise exception 'Migration 112 refused: expected 41 matching ali_question_bank rows for the approved map, found %. No row touched.', v_total_count;
  end if;

  -- Preconditions 2-4: active / subject / eligibility_status.
  select count(*) into v_active_count
  from public.ali_question_bank b join tmp_normalisation_map m on m.id = b.id
  where b.active = true;
  select count(*) into v_subject_count
  from public.ali_question_bank b join tmp_normalisation_map m on m.id = b.id
  where b.subject = 'maths';
  select count(*) into v_eligible_count
  from public.ali_question_bank b join tmp_normalisation_map m on m.id = b.id
  where b.eligibility_status = 'mock_eligible';

  if v_active_count <> 41 or v_subject_count <> 41 or v_eligible_count <> 41 then
    raise exception 'Migration 112 refused: preconditions failed -- active=% subject=maths=% mock_eligible=% (all must be 41). No row touched.',
      v_active_count, v_subject_count, v_eligible_count;
  end if;

  -- Precondition 5: family_id membership exactly matches the approved map.
  select count(*) into v_family_match_count
  from public.ali_question_bank b join tmp_normalisation_map m on m.id = b.id
  where b.family_id = m.expected_family_id;

  if v_family_match_count <> 41 then
    raise exception 'Migration 112 refused: % of 41 rows have a family_id matching the approved map (expected 41) -- production family_id has drifted from Decision 165''s own evidence. No row touched.',
      v_family_match_count;
  end if;

  -- Precondition 6: marking_mode is NULL or 'deterministic' on every row today.
  select count(*) into v_marking_mode_ok_count
  from public.ali_question_bank b join tmp_normalisation_map m on m.id = b.id
  where b.marking_mode is null or b.marking_mode = 'deterministic';

  if v_marking_mode_ok_count <> 41 then
    raise exception 'Migration 112 refused: % of 41 rows have marking_mode NULL or deterministic (expected 41) -- contradicts Decision 165 Part 3''s own evidence. No row touched.',
      v_marking_mode_ok_count;
  end if;

  -- Precondition 7: marks total is exactly 60.
  select sum((b.prompt->>'marks')::numeric) into v_marks_total
  from public.ali_question_bank b join tmp_normalisation_map m on m.id = b.id;

  if v_marks_total is distinct from 60 then
    raise exception 'Migration 112 refused: marks total across the 41 rows is % (expected exactly 60). No row touched.', v_marks_total;
  end if;

  -- Precondition 8: determine pre- vs post-state.
  select count(*) into v_null_state_count
  from public.ali_question_bank b join tmp_normalisation_map m on m.id = b.id
  where b.question_group_id is null and b.group_order is null and b.subpart_label is null;

  select count(*) into v_applied_state_count
  from public.ali_question_bank b join tmp_normalisation_map m on m.id = b.id
  where b.question_group_id = m.expected_family_id
    and b.group_order = m.expected_group_order
    and b.subpart_label = m.expected_subpart_label
    and b.marking_mode = 'deterministic';

  if v_null_state_count = 41 then
    -- Genuine pre-normalisation state: apply the approved map.
    update public.ali_question_bank b
    set question_group_id = b.family_id,
        group_order = m.expected_group_order,
        subpart_label = m.expected_subpart_label,
        marking_mode = 'deterministic'
    from tmp_normalisation_map m
    where b.id = m.id;

    -- Post-write proof: re-verify exactly 41 rows now match the approved
    -- post-state, content (marks) unchanged, family_id unchanged.
    select count(*) into v_applied_state_count
    from public.ali_question_bank b join tmp_normalisation_map m on m.id = b.id
    where b.question_group_id = m.expected_family_id
      and b.group_order = m.expected_group_order
      and b.subpart_label = m.expected_subpart_label
      and b.marking_mode = 'deterministic'
      and b.family_id = m.expected_family_id
      and b.eligibility_status = 'mock_eligible';

    if v_applied_state_count <> 41 then
      raise exception 'Migration 112: post-write verification failed -- % of 41 rows match the approved post-state (expected 41). Transaction will roll back.', v_applied_state_count;
    end if;

    select sum((b.prompt->>'marks')::numeric) into v_marks_total
    from public.ali_question_bank b join tmp_normalisation_map m on m.id = b.id;
    if v_marks_total is distinct from 60 then
      raise exception 'Migration 112: post-write marks total is % (expected 60, content must be unchanged). Transaction will roll back.', v_marks_total;
    end if;

    raise notice 'Migration 112: applied grouping metadata to 41 rows across 19 families (19 resulting numbered-question experiences, 60 marks). question_group_id/group_order/subpart_label/marking_mode set; all other columns unchanged.';

  elsif v_applied_state_count = 41 then
    -- Already applied, exactly matching the approved map: clean no-op.
    raise notice 'Migration 112: all 41 target rows already carry the exact approved grouping metadata -- already applied. No changes made.';

  else
    raise exception 'Migration 112 refused: grouping-column state is neither the expected pre-normalisation NULL state (found % of 41) nor the exact approved post-state (found % of 41) -- a mixed or unexpected state exists. Re-verify production state before proceeding; no row touched.',
      v_null_state_count, v_applied_state_count;
  end if;
end $$;

commit;
