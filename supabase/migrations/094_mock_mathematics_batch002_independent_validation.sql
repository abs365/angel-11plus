-- Angel Digital 11+ — Migration 094
-- Mock Programme Increment 004, Batch 002 — Independent Validation
-- Promotion (Decision 149).
--
-- Promotes exactly the 20 questions across the 10 approved Mock
-- Mathematics Batch 002 families from eligibility_status
-- 'authentic_assessment_candidate' to 'independently_validated' —
-- RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md's (2026-08-10) own next
-- transition, mirroring migration 090's own precedent for Batch 001
-- exactly (Decision 143), per the Founder's own authenticated review of
-- ali_family_review (that table remains RLS-opaque to every script/
-- anon-key path in this repository by design, migrations 034/054, so
-- this migration records the Founder-supplied decision as its input,
-- not a re-derivation, exactly as migrations 080/083/090/119/123 already
-- established for the analogous transition).
--
-- Founder-supplied evidence: all 10 Batch 002 families
-- (mock-mr04-percentchange, mock-mr04-reversepercent, mock-mr06-sumdiff,
-- mock-mr06-multiplerelation, mock-mr07-triangleanglesum,
-- mock-mr07-isoscelesproperty, mock-mr10-forwardschedule,
-- mock-mr10-reverseschedule, mock-mr11-truefalsejudgement,
-- mock-mr11-propertysearch) carry a genuine ali_family_review row with
-- review_type = 'mock_maths_independent_review', review_target_type =
-- 'question_family', decision = 'approved' — obtained through the
-- "Mock Mathematics Batch 002 Review" surface (migration 145's own
-- MockMrBatch002Section, reusing Decision 142's corrected
-- submitMockMathsIndependentReview() write path, not the generic
-- content_review path). Per-family reviewer identity/date detail was not
-- itemised to this session (unlike Batch 001's own disclosed
-- mock-mr09-data correction, Decision 143) — accepted at the same
-- Level 1, Founder-supplied evidentiary standard regardless, since this
-- repository has no independent means to query ali_family_review at all
-- (RLS-opaque to anon key, confirmed again this session). The original
-- UNASSIGNED / pending_independent_review placeholder rows (migration
-- 092) remain historical audit evidence and are NOT modified, deleted,
-- or touched by this migration.
--
-- Repository-level evidence independently confirmed this session (direct
-- reading of migration 091's own SQL text, not assumed): exactly 20
-- rows exist across these 10 family_id values, all eligibility_status =
-- 'authentic_assessment_candidate', content_version = 1, active = true,
-- subject = 'maths'. Live production state (whether this repository
-- evidence still matches production at application time) could not be
-- independently re-queried from this execution environment (no
-- Supabase credentials/live access here) — the migration's own
-- assertion-and-refuse guard below is exactly what protects against
-- that gap, refusing to guess if live production has since diverged
-- from either the expected pre-promotion or the clean already-applied
-- state.
--
-- Selected by exact question ID, never by family_id alone: matches
-- migration 090's own established discipline — no future sibling added
-- later to any of these 10 families could ever be silently swept into
-- this promotion.
--
-- INDEPENDENT-VALIDATION BOUNDARY, not mock-eligibility: this migration
-- moves these 20 rows to 'independently_validated' ONLY. It does NOT set
-- eligibility_status = 'mock_eligible' anywhere, does NOT insert or
-- modify any ali_mock_form row, and does NOT touch ali_family_review in
-- any way. Per RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md §3's own
-- transition table, Independently Validated -> Mock Eligible
-- additionally requires the still-unbuilt pool-level review gate
-- (Decision 138) — explicitly NOT this migration's purpose.
--
-- CONTENT IMMUTABILITY, explicit per this task's own directive: no
-- prompt, answer, working step, misconception, content_difficulty,
-- skill, family_id, provenance, or content_version is changed. This
-- also explicitly includes migration 093's own 4 grouping columns
-- (question_group_id, group_order, subpart_label, marking_mode, now
-- live in production per Decision 148's own Founder-confirmed
-- application) — Batch 002 was authored before those columns existed
-- and remains valid, unchanged, standalone content; this migration does
-- not populate, infer, or retrofit any of them. Only eligibility_status
-- moves, matching migration 090/119's own explicit discipline.
--
-- Fails safely, following migration 090's own established
-- assertion-and-refuse pattern: if the live count of matching rows is
-- not exactly 20 authentic_assessment_candidate rows across these exact
-- IDs, and is not already exactly 20 independently_validated rows
-- across the same IDs (the safe already-applied no-op case), this
-- migration refuses to guess and raises an exception naming the actual
-- counts observed, touching nothing.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 091/092
-- (Decision 145) and migration 093 (Decision 148, Founder-confirmed
-- applied) have already been applied.

begin;

do $$
declare
  v_pending_count int;
  v_already_validated_count int;
  v_target_ids constant text[] := array[
    'mock-mr04-percentchange-01', 'mock-mr04-percentchange-02',
    'mock-mr04-reversepercent-01', 'mock-mr04-reversepercent-02',
    'mock-mr06-sumdiff-01', 'mock-mr06-sumdiff-02',
    'mock-mr06-multiplerelation-01', 'mock-mr06-multiplerelation-02',
    'mock-mr07-triangleanglesum-01', 'mock-mr07-triangleanglesum-02',
    'mock-mr07-isoscelesproperty-01', 'mock-mr07-isoscelesproperty-02',
    'mock-mr10-forwardschedule-01', 'mock-mr10-forwardschedule-02',
    'mock-mr10-reverseschedule-01', 'mock-mr10-reverseschedule-02',
    'mock-mr11-truefalsejudgement-01', 'mock-mr11-truefalsejudgement-02',
    'mock-mr11-propertysearch-01', 'mock-mr11-propertysearch-02'
  ];
  v_target_families constant text[] := array[
    'mock-mr04-percentchange', 'mock-mr04-reversepercent',
    'mock-mr06-sumdiff', 'mock-mr06-multiplerelation',
    'mock-mr07-triangleanglesum', 'mock-mr07-isoscelesproperty',
    'mock-mr10-forwardschedule', 'mock-mr10-reverseschedule',
    'mock-mr11-truefalsejudgement', 'mock-mr11-propertysearch'
  ];
begin
  select count(*) into v_pending_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'authentic_assessment_candidate'
    and active = true
    and family_id = any(v_target_families);

  select count(*) into v_already_validated_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'independently_validated';

  if v_pending_count = 20 then
    -- Exactly the expected pre-promotion state. Apply.

    update public.ali_question_bank
    set eligibility_status = 'independently_validated'
    where id = any(v_target_ids)
      and eligibility_status = 'authentic_assessment_candidate';

    raise notice 'Migration 094: promoted 20 Mock Mathematics Batch 002 questions across 10 families from authentic_assessment_candidate to independently_validated.';

  elsif v_already_validated_count = 20 then
    -- Already applied -- safe no-op, not an error.
    raise notice 'Migration 094: all 20 target questions are already independently_validated -- already applied. No changes made.';

  else
    -- Production no longer matches the expected pre-promotion state (20
    -- eligible rows) and is not in the clean post-application state (20
    -- already independently_validated). Refuse to guess -- something
    -- changed since this migration was generated. No rows are touched.
    raise exception
      'Migration 094 refused: expected 20 authentic_assessment_candidate rows across the 10 named families (found %), or 20 already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

commit;
