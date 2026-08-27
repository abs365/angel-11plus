-- Angel Digital 11+ — Migration 147
-- Mathematics First Mock 1 — Inactive Freeze (Decision 213/214, Founder-
-- approved curated composition, NOT activated).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Decision 213 inspected Decision 212's real, code-composed 21-question/
-- 56-mark Mathematics First Mock candidate and recommended approval.
-- Decision 214 is the Founder's own bounded curation of that candidate:
--   1. ARCHETYPE-BALANCE SUBSTITUTION: `mock-mr06-sumdiff` (2 marks)
--      removed, `mock-mr09-runningclub` (2 marks) added -- an explicit,
--      one-for-one manifest curation (Decision 213 §11's own recommended
--      mechanism), never a re-run of `composeCandidateMock()` with
--      different parameters. Total marks (56) and question count (21)
--      are unchanged by construction (both experiences are exactly 2
--      marks).
--   2. EDUCATIONAL-PROGRESSION REORDERING: the SAME 21 experiences
--      (post-substitution) reordered into a defensible learner-facing
--      sequence, designed from each experience's own real
--      `content_difficulty` values (never inferred from family id) --
--      see `scripts/mock-mathematics-first-mock-curation.mjs` for the
--      full design rationale and self-checking derivation. Every
--      question's own wording, subparts, marks, and shared stem are
--      unchanged; only the SEQUENCE changes.
-- Both refinements were validated this session via the real, unmodified
-- `validateManifest()` (`lib/ali/mockComposition.ts`, Decision 212,
-- untouched by this migration or by Decision 214's own curation script) --
-- VALID, 21 numbered questions, 56 marks, no partial grouped family, no
-- duplicate id, Perimeter Area absent, Sum/Difference absent, Running
-- Club present and complete.
--
-- This migration inserts the resulting `ali_mock_form` row with
-- `active = false`. It does NOT activate the Mock, create an attempt, or
-- expose any content to a learner -- `mock_create_attempt()`/
-- `mock_create_cycle_attempt()` (migration 145) both require
-- `active = true` before an attempt can reference this form; that remains
-- a separate, later, distinct Founder-authorised step.
--
-- ============================================================
-- LIVE PRECONDITIONS (not assumed from Decision 210-214's own baseline)
-- ============================================================
-- Every one of the 56 target ids must, at apply time, genuinely be
-- `eligibility_status = 'mock_eligible'`, `active = true`, `subject =
-- 'maths'` -- re-verified live below, exactly as every certification/
-- promotion migration in this arc has required, never assumed merely
-- because Decision 211/migration 144 reported this true in the past.
-- Every grouped family referenced is verified fully represented (no
-- partial group), generic over `question_group_id`, mirroring migration
-- 145's own `mock_validate_manifest_eligibility()` logic. `mock-mr06-
-- sumdiff` is verified absent; `mock-mr09-runningclub` is verified
-- present as a complete 2-row group; `mock-mr03mr07-perimeterarea` is
-- verified absent. Total marks summed live must equal 56.
--
-- ============================================================
-- FAIL-CLOSED / IDEMPOTENT STRUCTURE
-- ============================================================
-- PRISTINE (no row with id 'first-mock-mathematics-v1' exists) -> insert
-- it, with `active = false`. ALREADY APPLIED (a row with that id already
-- exists AND its `question_manifest`/`active`/`subject` match this
-- migration's own expected values exactly) -> safe no-op. MIXED/
-- UNEXPECTED (a row exists but differs in any way, or more than one row
-- somehow exists) -> `RAISE EXCEPTION`, nothing written -- this migration
-- never overwrites an existing `ali_mock_form` row under any
-- circumstance.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not set `active = true` anywhere. Does not create an
-- `ali_mock_attempt` row. Does not call `mock_create_attempt()` or
-- `mock_create_cycle_attempt()`. Does not change any `ali_question_bank`
-- row's `eligibility_status`, content, marks, or grouping. Does not
-- promote `mock-mr03mr07-perimeterarea`. Does not author Increment 007.
-- Does not touch `ali_family_review`, any RPC, RLS policy, or grant.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 144, 145,
-- and 146 (all Founder-confirmed applied) have already been applied.

begin;

do $$
declare
  v_form_id constant text := 'first-mock-mathematics-v1';
  v_target_ids constant text[] := array[
    'mock-mr01-directcalc-01',
    'mock-mr01-directcalc-02',
    'mock-mr02-invdiv-01',
    'mock-mr02-invdiv-02',
    'mock-mr02-invdiv-03',
    'mock-mr03-unitconv-01',
    'mock-mr03-unitconv-02',
    'mock-mr03-unitconv-03',
    'mock-mr05-forward-01',
    'mock-mr05-forward-02',
    'mock-mr04-percentchange-01',
    'mock-mr04-percentchange-02',
    'mock-mr07-triangleanglesum-01',
    'mock-mr07-triangleanglesum-02',
    'mock-mr04-campingsale-01',
    'mock-mr04-campingsale-02',
    'mock-mr04-campingsale-03',
    'mock-mr04-campingsale-04',
    'mock-mr01mr10-costumeschedule-01a',
    'mock-mr01mr10-costumeschedule-01b',
    'mock-mr06-linkedvalues-01',
    'mock-mr06-linkedvalues-02',
    'mock-mr06-linkedvalues-03',
    'mock-mr05-inverse-01',
    'mock-mr05-inverse-02',
    'mock-mr09-runningclub-01',
    'mock-mr09-runningclub-02',
    'mock-mr04-reversepercent-01',
    'mock-mr04-reversepercent-02',
    'mock-mr11-roundingbounds-01',
    'mock-mr11-roundingbounds-02',
    'mock-mr11-roundingbounds-03',
    'mock-mr11-roundingbounds-04',
    'mock-mr07-isoscelesproperty-01',
    'mock-mr07-isoscelesproperty-02',
    'mock-mr09-funrun-01',
    'mock-mr09-funrun-02',
    'mock-mr09-funrun-03',
    'mock-mr09-funrun-04',
    'mock-mr02-twostep-01',
    'mock-mr02-twostep-02',
    'mock-mr02-twostep-03',
    'mock-mr06-numberpuzzle-01',
    'mock-mr06-numberpuzzle-02',
    'mock-mr06-numberpuzzle-03',
    'mock-mr10-bustimetable-01',
    'mock-mr10-bustimetable-02',
    'mock-mr10-bustimetable-03',
    'mock-mr10-bustimetable-04',
    'mock-mr06-multiplerelation-01',
    'mock-mr06-multiplerelation-02',
    'mock-mr01mr10-costumeschedule-02a',
    'mock-mr01mr10-costumeschedule-02b',
    'mock-mr13-craftstall-01',
    'mock-mr13-craftstall-02',
    'mock-mr13-craftstall-03'
  ];
  v_question_manifest constant jsonb := '[{"question_id":"mock-mr01-directcalc-01","section":"mathematics"},{"question_id":"mock-mr01-directcalc-02","section":"mathematics"},{"question_id":"mock-mr02-invdiv-01","section":"mathematics"},{"question_id":"mock-mr02-invdiv-02","section":"mathematics"},{"question_id":"mock-mr02-invdiv-03","section":"mathematics"},{"question_id":"mock-mr03-unitconv-01","section":"mathematics"},{"question_id":"mock-mr03-unitconv-02","section":"mathematics"},{"question_id":"mock-mr03-unitconv-03","section":"mathematics"},{"question_id":"mock-mr05-forward-01","section":"mathematics"},{"question_id":"mock-mr05-forward-02","section":"mathematics"},{"question_id":"mock-mr04-percentchange-01","section":"mathematics"},{"question_id":"mock-mr04-percentchange-02","section":"mathematics"},{"question_id":"mock-mr07-triangleanglesum-01","section":"mathematics"},{"question_id":"mock-mr07-triangleanglesum-02","section":"mathematics"},{"question_id":"mock-mr04-campingsale-01","section":"mathematics"},{"question_id":"mock-mr04-campingsale-02","section":"mathematics"},{"question_id":"mock-mr04-campingsale-03","section":"mathematics"},{"question_id":"mock-mr04-campingsale-04","section":"mathematics"},{"question_id":"mock-mr01mr10-costumeschedule-01a","section":"mathematics"},{"question_id":"mock-mr01mr10-costumeschedule-01b","section":"mathematics"},{"question_id":"mock-mr06-linkedvalues-01","section":"mathematics"},{"question_id":"mock-mr06-linkedvalues-02","section":"mathematics"},{"question_id":"mock-mr06-linkedvalues-03","section":"mathematics"},{"question_id":"mock-mr05-inverse-01","section":"mathematics"},{"question_id":"mock-mr05-inverse-02","section":"mathematics"},{"question_id":"mock-mr09-runningclub-01","section":"mathematics"},{"question_id":"mock-mr09-runningclub-02","section":"mathematics"},{"question_id":"mock-mr04-reversepercent-01","section":"mathematics"},{"question_id":"mock-mr04-reversepercent-02","section":"mathematics"},{"question_id":"mock-mr11-roundingbounds-01","section":"mathematics"},{"question_id":"mock-mr11-roundingbounds-02","section":"mathematics"},{"question_id":"mock-mr11-roundingbounds-03","section":"mathematics"},{"question_id":"mock-mr11-roundingbounds-04","section":"mathematics"},{"question_id":"mock-mr07-isoscelesproperty-01","section":"mathematics"},{"question_id":"mock-mr07-isoscelesproperty-02","section":"mathematics"},{"question_id":"mock-mr09-funrun-01","section":"mathematics"},{"question_id":"mock-mr09-funrun-02","section":"mathematics"},{"question_id":"mock-mr09-funrun-03","section":"mathematics"},{"question_id":"mock-mr09-funrun-04","section":"mathematics"},{"question_id":"mock-mr02-twostep-01","section":"mathematics"},{"question_id":"mock-mr02-twostep-02","section":"mathematics"},{"question_id":"mock-mr02-twostep-03","section":"mathematics"},{"question_id":"mock-mr06-numberpuzzle-01","section":"mathematics"},{"question_id":"mock-mr06-numberpuzzle-02","section":"mathematics"},{"question_id":"mock-mr06-numberpuzzle-03","section":"mathematics"},{"question_id":"mock-mr10-bustimetable-01","section":"mathematics"},{"question_id":"mock-mr10-bustimetable-02","section":"mathematics"},{"question_id":"mock-mr10-bustimetable-03","section":"mathematics"},{"question_id":"mock-mr10-bustimetable-04","section":"mathematics"},{"question_id":"mock-mr06-multiplerelation-01","section":"mathematics"},{"question_id":"mock-mr06-multiplerelation-02","section":"mathematics"},{"question_id":"mock-mr01mr10-costumeschedule-02a","section":"mathematics"},{"question_id":"mock-mr01mr10-costumeschedule-02b","section":"mathematics"},{"question_id":"mock-mr13-craftstall-01","section":"mathematics"},{"question_id":"mock-mr13-craftstall-02","section":"mathematics"},{"question_id":"mock-mr13-craftstall-03","section":"mathematics"}]';
  v_composition_provenance constant jsonb := '{"source":"mathematics_first_mock_candidate","generatorVersion":"mockComposition-v1","composedAt":"2026-08-27T14:19:14.297Z","targetExperienceCount":21,"numberedQuestionCount":21,"totalMarks":56,"rawRowCount":56,"difficultyDistribution":{"easy":8,"medium":22,"hard":26,"challenge":0},"skillDistribution":{"QT-MR-01":3,"QT-MR-10":3,"QT-MR-02":2,"QT-MR-03":1,"QT-MR-04":3,"QT-MR-05":2,"QT-MR-06":3,"QT-MR-07":2,"QT-MR-09":2,"QT-MR-11":1,"QT-MR-13":1},"familyIds":["mock-mr01-directcalc","mock-mr01mr10-costumeschedule","mock-mr02-invdiv","mock-mr02-twostep","mock-mr03-unitconv","mock-mr04-campingsale","mock-mr04-percentchange","mock-mr04-reversepercent","mock-mr05-forward","mock-mr05-inverse","mock-mr06-linkedvalues","mock-mr06-multiplerelation","mock-mr06-numberpuzzle","mock-mr07-isoscelesproperty","mock-mr07-triangleanglesum","mock-mr09-funrun","mock-mr09-runningclub","mock-mr10-bustimetable","mock-mr11-roundingbounds","mock-mr13-craftstall"]}';
  v_array_length int;
  v_distinct_count int;
  v_eligible_count int;
  v_marks_sum numeric;
  v_group_completeness_bad int;
  v_perimeterarea_present int;
  v_sumdiff_present int;
  v_runningclub_present int;
  v_existing_count int;
  v_existing_matches boolean;
begin
  -- === Array shape guards ===
  v_array_length := array_length(v_target_ids, 1);
  if v_array_length <> 56 then
    raise exception 'Migration 147 refused: expected exactly 56 target IDs, found %.', v_array_length;
  end if;
  select count(distinct t) into v_distinct_count from unnest(v_target_ids) t;
  if v_distinct_count <> 56 then
    raise exception 'Migration 147 refused: target ID array contains a duplicate (found % distinct of 56).', v_distinct_count;
  end if;

  -- === Live eligibility precondition: every target id must genuinely be
  -- mock_eligible/active/maths at apply time, not assumed from Decision
  -- 211's own past report ===
  select count(*) into v_eligible_count
    from public.ali_question_bank
    where id = any(v_target_ids) and eligibility_status = 'mock_eligible' and active = true and subject = 'maths';
  if v_eligible_count <> 56 then
    raise exception 'Migration 147 refused: expected all 56 target rows to be mock_eligible/active/maths, found %. Re-verify production state before proceeding.', v_eligible_count;
  end if;

  -- === Marks sum, live, never assumed ===
  select sum((prompt->>'marks')::numeric) into v_marks_sum from public.ali_question_bank where id = any(v_target_ids);
  if v_marks_sum <> 56 then
    raise exception 'Migration 147 refused: expected the 56 target rows to sum to exactly 56 marks, found %. Marking Integrity Gate must never be assumed satisfied.', v_marks_sum;
  end if;

  -- === Grouped-family completeness, generic over question_group_id
  -- (mirrors migration 145's own mock_validate_manifest_eligibility()) ===
  select count(*) into v_group_completeness_bad
  from (
    select b.question_group_id,
           count(*) filter (where b.id = any(v_target_ids)) as included,
           count(*) as total
    from public.ali_question_bank b
    where b.question_group_id in (
      select distinct q.question_group_id from public.ali_question_bank q
      where q.id = any(v_target_ids) and q.question_group_id is not null
    )
    and b.eligibility_status = 'mock_eligible' and b.active = true
    group by b.question_group_id
  ) g
  where g.included <> g.total;
  if v_group_completeness_bad <> 0 then
    raise exception 'Migration 147 refused: % grouped-question famil(y/ies) are only partially represented in the target manifest.', v_group_completeness_bad;
  end if;

  -- === Founder-directed substitution proof (Decision 214) ===
  select count(*) into v_perimeterarea_present from unnest(v_target_ids) t where t like 'mock-mr03mr07-perimeterarea%';
  if v_perimeterarea_present <> 0 then
    raise exception 'Migration 147 refused: mock-mr03mr07-perimeterarea must never appear in the First Mock manifest (found % rows).', v_perimeterarea_present;
  end if;

  select count(*) into v_sumdiff_present from unnest(v_target_ids) t where t like 'mock-mr06-sumdiff%';
  if v_sumdiff_present <> 0 then
    raise exception 'Migration 147 refused: mock-mr06-sumdiff must be absent (Founder-directed substitution, Decision 214) -- found % rows.', v_sumdiff_present;
  end if;

  select count(*) into v_runningclub_present from unnest(v_target_ids) t where t like 'mock-mr09-runningclub%';
  if v_runningclub_present <> 2 then
    raise exception 'Migration 147 refused: mock-mr09-runningclub must be present as a complete 2-row group (Founder-directed substitution, Decision 214) -- found % rows.', v_runningclub_present;
  end if;

  -- === Idempotent insert ===
  select count(*) into v_existing_count from public.ali_mock_form where id = v_form_id;

  if v_existing_count = 0 then
    insert into public.ali_mock_form (id, subject, specification_version, attempt_type, question_manifest, active, composition_provenance)
    values (v_form_id, 'mathematics', 1, 'full_mock', v_question_manifest, false, v_composition_provenance);

    raise notice 'Migration 147: inserted % (21 numbered questions, 56 marks, curated order, Founder-approved substitution applied), active=false. Not exposed to any learner.', v_form_id;

  elsif v_existing_count = 1 then
    select
      (question_manifest = v_question_manifest)
      and (active = false)
      and (subject = 'mathematics')
      and (specification_version = 1)
      and (attempt_type = 'full_mock')
      into v_existing_matches
    from public.ali_mock_form where id = v_form_id;

    if not v_existing_matches then
      raise exception 'Migration 147 refused: a row % already exists but does not match the expected curated manifest/active/subject/specification_version/attempt_type -- manual investigation required, never silently overwritten.', v_form_id;
    end if;

    raise notice 'Migration 147: % already exists with the expected manifest and active=false -- already applied, no-op.', v_form_id;

  else
    raise exception 'Migration 147 refused: expected 0 or 1 existing ali_mock_form rows with id %, found %. Manual investigation required.', v_form_id, v_existing_count;
  end if;
end $$;

commit;
