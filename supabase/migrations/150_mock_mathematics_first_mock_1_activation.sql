-- Angel Digital 11+ — Migration 150
-- Mathematics First Mock 1 — Activation (Decision 219, Founder-authorised).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Migration 147 (Decision 213/214, Founder-confirmed applied) inserted
-- the curated, 21-question/56-mark `first-mock-mathematics-v1` row with
-- `active = false` -- reviewed and approved, but deliberately not
-- exposed to any learner. Decision 218's Final Combined Production
-- Release Gate found no unresolved P0/P1 defect and returned verdict A
-- ("READY FOR FOUNDER-AUTHORISED ACTIVATION"). The Founder has now
-- explicitly authorised activation. This migration's ONLY change is
-- `active: false -> true` on that single, already-frozen row. It does
-- not touch `question_manifest`, `composition_provenance`, `subject`,
-- `specification_version`, `attempt_type`, or any `ali_question_bank`
-- row.
--
-- ============================================================
-- LIVE PRECONDITIONS (never assumed from Decision 147/218's own past
-- report -- every structural claim is re-verified against the actual
-- row and the actual question bank at apply time)
-- ============================================================
-- The `first-mock-mathematics-v1` row must exist. Its `subject`,
-- `specification_version`, `attempt_type`, `question_manifest`, and
-- `composition_provenance` must match the exact literal values migration
-- 147 itself inserted, byte-for-byte -- this migration refuses to
-- activate a form whose approved content has drifted since the freeze
-- for any reason. `composition_provenance` must independently report
-- `numberedQuestionCount = 21`, `totalMarks = 56`, `rawRowCount = 56`.
-- The Founder-directed substitution proofs are re-checked against the
-- manifest's own ids: `mock-mr03mr07-perimeterarea` absent,
-- `mock-mr06-sumdiff` absent, `mock-mr09-runningclub` present as a
-- complete 2-row group. Every one of the 56 manifest question ids must,
-- LIVE, still be `eligibility_status = 'mock_eligible'`, `active =
-- true`, `subject = 'maths'` in `ali_question_bank` -- a question could
-- in principle have been withdrawn or altered in the time between the
-- migration 147 freeze and this activation, and this migration does not
-- assume otherwise. Every grouped question family referenced is
-- re-verified fully represented (no partial group), generic over
-- `question_group_id`, mirroring migration 145's and 147's own identical
-- logic.
--
-- ============================================================
-- FAIL-CLOSED / IDEMPOTENT / THREE-STATE STRUCTURE
-- ============================================================
-- PRISTINE (`first-mock-mathematics-v1` exists, `active = false`, every
-- precondition above holds) -> UPDATE `active` to `true`. ALREADY
-- APPLIED (`active = true` already, every precondition above still
-- holds) -> safe no-op, no write. ANY OTHER STATE (row missing, any
-- literal drift, any live eligibility/grouping/contamination precondition
-- fails) -> `RAISE EXCEPTION`, nothing written -- this migration never
-- silently repairs a discrepancy and never activates a form that does
-- not exactly match what was reviewed and approved.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not change the 21-question composition or the 56-mark total.
-- Does not rewrite any question, answer, or scoring logic. Does not
-- alter `question_manifest` or `composition_provenance` in any way --
-- both are read and compared, never written. Does not alter resume
-- capability (migration 149) or timer behaviour (`mock_start_attempt()`,
-- migration 070). Does not create an `ali_mock_attempt` row or call
-- `mock_create_attempt()`/`mock_create_cycle_attempt()`. Does not change
-- any `ali_question_bank` row's `eligibility_status`, content, marks, or
-- grouping. Does not promote `mock-mr03mr07-perimeterarea`. Does not
-- author Increment 007, Mock 2, or any English Mock work. Does not touch
-- `ali_family_review`, any RPC, RLS policy, or grant.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 147, 148,
-- and 149 (all Founder-confirmed applied and verified) have already been
-- applied.

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
  v_expected_question_manifest constant jsonb := '[{"question_id":"mock-mr01-directcalc-01","section":"mathematics"},{"question_id":"mock-mr01-directcalc-02","section":"mathematics"},{"question_id":"mock-mr02-invdiv-01","section":"mathematics"},{"question_id":"mock-mr02-invdiv-02","section":"mathematics"},{"question_id":"mock-mr02-invdiv-03","section":"mathematics"},{"question_id":"mock-mr03-unitconv-01","section":"mathematics"},{"question_id":"mock-mr03-unitconv-02","section":"mathematics"},{"question_id":"mock-mr03-unitconv-03","section":"mathematics"},{"question_id":"mock-mr05-forward-01","section":"mathematics"},{"question_id":"mock-mr05-forward-02","section":"mathematics"},{"question_id":"mock-mr04-percentchange-01","section":"mathematics"},{"question_id":"mock-mr04-percentchange-02","section":"mathematics"},{"question_id":"mock-mr07-triangleanglesum-01","section":"mathematics"},{"question_id":"mock-mr07-triangleanglesum-02","section":"mathematics"},{"question_id":"mock-mr04-campingsale-01","section":"mathematics"},{"question_id":"mock-mr04-campingsale-02","section":"mathematics"},{"question_id":"mock-mr04-campingsale-03","section":"mathematics"},{"question_id":"mock-mr04-campingsale-04","section":"mathematics"},{"question_id":"mock-mr01mr10-costumeschedule-01a","section":"mathematics"},{"question_id":"mock-mr01mr10-costumeschedule-01b","section":"mathematics"},{"question_id":"mock-mr06-linkedvalues-01","section":"mathematics"},{"question_id":"mock-mr06-linkedvalues-02","section":"mathematics"},{"question_id":"mock-mr06-linkedvalues-03","section":"mathematics"},{"question_id":"mock-mr05-inverse-01","section":"mathematics"},{"question_id":"mock-mr05-inverse-02","section":"mathematics"},{"question_id":"mock-mr09-runningclub-01","section":"mathematics"},{"question_id":"mock-mr09-runningclub-02","section":"mathematics"},{"question_id":"mock-mr04-reversepercent-01","section":"mathematics"},{"question_id":"mock-mr04-reversepercent-02","section":"mathematics"},{"question_id":"mock-mr11-roundingbounds-01","section":"mathematics"},{"question_id":"mock-mr11-roundingbounds-02","section":"mathematics"},{"question_id":"mock-mr11-roundingbounds-03","section":"mathematics"},{"question_id":"mock-mr11-roundingbounds-04","section":"mathematics"},{"question_id":"mock-mr07-isoscelesproperty-01","section":"mathematics"},{"question_id":"mock-mr07-isoscelesproperty-02","section":"mathematics"},{"question_id":"mock-mr09-funrun-01","section":"mathematics"},{"question_id":"mock-mr09-funrun-02","section":"mathematics"},{"question_id":"mock-mr09-funrun-03","section":"mathematics"},{"question_id":"mock-mr09-funrun-04","section":"mathematics"},{"question_id":"mock-mr02-twostep-01","section":"mathematics"},{"question_id":"mock-mr02-twostep-02","section":"mathematics"},{"question_id":"mock-mr02-twostep-03","section":"mathematics"},{"question_id":"mock-mr06-numberpuzzle-01","section":"mathematics"},{"question_id":"mock-mr06-numberpuzzle-02","section":"mathematics"},{"question_id":"mock-mr06-numberpuzzle-03","section":"mathematics"},{"question_id":"mock-mr10-bustimetable-01","section":"mathematics"},{"question_id":"mock-mr10-bustimetable-02","section":"mathematics"},{"question_id":"mock-mr10-bustimetable-03","section":"mathematics"},{"question_id":"mock-mr10-bustimetable-04","section":"mathematics"},{"question_id":"mock-mr06-multiplerelation-01","section":"mathematics"},{"question_id":"mock-mr06-multiplerelation-02","section":"mathematics"},{"question_id":"mock-mr01mr10-costumeschedule-02a","section":"mathematics"},{"question_id":"mock-mr01mr10-costumeschedule-02b","section":"mathematics"},{"question_id":"mock-mr13-craftstall-01","section":"mathematics"},{"question_id":"mock-mr13-craftstall-02","section":"mathematics"},{"question_id":"mock-mr13-craftstall-03","section":"mathematics"}]';
  v_expected_composition_provenance constant jsonb := '{"source":"mathematics_first_mock_candidate","generatorVersion":"mockComposition-v1","composedAt":"2026-08-27T14:19:14.297Z","targetExperienceCount":21,"numberedQuestionCount":21,"totalMarks":56,"rawRowCount":56,"difficultyDistribution":{"easy":8,"medium":22,"hard":26,"challenge":0},"skillDistribution":{"QT-MR-01":3,"QT-MR-10":3,"QT-MR-02":2,"QT-MR-03":1,"QT-MR-04":3,"QT-MR-05":2,"QT-MR-06":3,"QT-MR-07":2,"QT-MR-09":2,"QT-MR-11":1,"QT-MR-13":1},"familyIds":["mock-mr01-directcalc","mock-mr01mr10-costumeschedule","mock-mr02-invdiv","mock-mr02-twostep","mock-mr03-unitconv","mock-mr04-campingsale","mock-mr04-percentchange","mock-mr04-reversepercent","mock-mr05-forward","mock-mr05-inverse","mock-mr06-linkedvalues","mock-mr06-multiplerelation","mock-mr06-numberpuzzle","mock-mr07-isoscelesproperty","mock-mr07-triangleanglesum","mock-mr09-funrun","mock-mr09-runningclub","mock-mr10-bustimetable","mock-mr11-roundingbounds","mock-mr13-craftstall"]}';
  v_row public.ali_mock_form%rowtype;
  v_numbered_count int;
  v_total_marks int;
  v_raw_row_count int;
  v_perimeterarea_present int;
  v_sumdiff_present int;
  v_runningclub_present int;
  v_eligible_count int;
  v_group_completeness_bad int;
begin
  -- === Row existence ===
  select * into v_row from public.ali_mock_form where id = v_form_id;
  if not found then
    raise exception 'Migration 150 refused: % does not exist -- migration 147 must be applied first.', v_form_id;
  end if;

  -- === Literal-match structural preconditions (byte-for-byte, never assumed) ===
  if v_row.subject is distinct from 'mathematics' then
    raise exception 'Migration 150 refused: expected subject=mathematics, found %.', v_row.subject;
  end if;
  if v_row.specification_version is distinct from 1 then
    raise exception 'Migration 150 refused: expected specification_version=1, found %.', v_row.specification_version;
  end if;
  if v_row.attempt_type is distinct from 'full_mock' then
    raise exception 'Migration 150 refused: expected attempt_type=full_mock, found %.', v_row.attempt_type;
  end if;
  if v_row.question_manifest is distinct from v_expected_question_manifest then
    raise exception 'Migration 150 refused: question_manifest has drifted from the Decision 214 frozen form since migration 147 -- refusing to activate content that does not exactly match what was reviewed and approved.';
  end if;
  if v_row.composition_provenance is distinct from v_expected_composition_provenance then
    raise exception 'Migration 150 refused: composition_provenance has drifted from the Decision 214 frozen form since migration 147 -- refusing to activate.';
  end if;

  -- === Provenance-derived counts, independently re-verified, never merely trusted ===
  v_numbered_count := (v_row.composition_provenance->>'numberedQuestionCount')::int;
  v_total_marks := (v_row.composition_provenance->>'totalMarks')::int;
  v_raw_row_count := (v_row.composition_provenance->>'rawRowCount')::int;
  if v_numbered_count <> 21 or v_total_marks <> 56 or v_raw_row_count <> 56 then
    raise exception 'Migration 150 refused: composition_provenance reports numberedQuestionCount=%, totalMarks=%, rawRowCount=% (expected 21/56/56).', v_numbered_count, v_total_marks, v_raw_row_count;
  end if;

  -- === Founder-directed substitution proofs, re-checked against the manifest's own ids ===
  select count(*) into v_perimeterarea_present from unnest(v_target_ids) t where t like 'mock-mr03mr07-perimeterarea%';
  if v_perimeterarea_present <> 0 then
    raise exception 'Migration 150 refused: mock-mr03mr07-perimeterarea must never appear in the First Mock manifest (found % rows).', v_perimeterarea_present;
  end if;

  select count(*) into v_sumdiff_present from unnest(v_target_ids) t where t like 'mock-mr06-sumdiff%';
  if v_sumdiff_present <> 0 then
    raise exception 'Migration 150 refused: mock-mr06-sumdiff must be absent (Founder-directed substitution, Decision 214) -- found % rows.', v_sumdiff_present;
  end if;

  select count(*) into v_runningclub_present from unnest(v_target_ids) t where t like 'mock-mr09-runningclub%';
  if v_runningclub_present <> 2 then
    raise exception 'Migration 150 refused: mock-mr09-runningclub must be present as a complete 2-row group (Founder-directed substitution, Decision 214) -- found % rows.', v_runningclub_present;
  end if;

  -- === LIVE re-verification: every manifest question must still be mock_eligible/active/maths ===
  select count(*) into v_eligible_count
    from public.ali_question_bank
    where id = any(v_target_ids) and eligibility_status = 'mock_eligible' and active = true and subject = 'maths';
  if v_eligible_count <> 56 then
    raise exception 'Migration 150 refused: expected all 56 manifest questions to still be mock_eligible/active/maths at activation time, found %. A question may have been withdrawn or altered since the migration 147 freeze -- activation refused, re-verify production state before retry.', v_eligible_count;
  end if;

  -- === LIVE grouped-family completeness, generic over question_group_id (mirrors migration 147) ===
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
    raise exception 'Migration 150 refused: % grouped-question famil(y/ies) are only partially represented at activation time.', v_group_completeness_bad;
  end if;

  -- === Three-state activation: every precondition above already holds by this point ===
  if v_row.active = false then
    update public.ali_mock_form
      set active = true
      where id = v_form_id;

    raise notice 'Migration 150: % activated (active: false -> true). question_manifest and composition_provenance unchanged, byte-for-byte. No attempt created.', v_form_id;

  elsif v_row.active = true then
    raise notice 'Migration 150: % already active=true and every structural precondition still holds -- already applied, no-op.', v_form_id;

  else
    raise exception 'Migration 150 refused: % active column in an unexpected state -- manual investigation required.', v_form_id;
  end if;
end $$;

commit;
