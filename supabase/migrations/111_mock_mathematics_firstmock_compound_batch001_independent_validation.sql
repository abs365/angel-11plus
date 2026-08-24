-- Angel Digital 11+ — Migration 111
-- Mathematics First Mock Minimum — Compound Content Foundation, Batch 001
-- Independent Validation Promotion (Decision 165).
--
-- Promotes exactly the 4 questions in the 1 approved Batch 001 family
-- (mock-mr03mr07-perimeterarea) from eligibility_status
-- 'authentic_assessment_candidate' to 'independently_validated' —
-- RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md's own next transition,
-- mirroring migration 090 (Decision 143), migration 094 (Decision 149),
-- and migration 101 (Decision 158) exactly, per the Founder's own
-- authenticated review of ali_family_review (RLS-opaque to every
-- script/anon-key path in this repository by design, migrations
-- 034/054, so this migration records the Founder-supplied decision as
-- its input, not a re-derivation).
--
-- Founder-supplied evidence: the family carries a genuine ali_family_
-- review row with review_type = 'mock_maths_independent_review',
-- review_target_type = 'question_family', decision = 'approved',
-- obtained through the "Mathematics First Mock Minimum: Compound
-- Content Batch 001 Review" surface (Decision 163's own
-- MockFirstMockCompoundBatch001Section, reusing the same
-- submitMockMathsIndependentReview() write path every prior Mathematics
-- Mock batch has used, via the sevenX prop with the correct
-- MOCK-FIRSTMOCK-COMPOUND-BATCH001 notes marker — confirmed from source,
-- this session, not merely trusted from the UI display). "1 of 1
-- families reviewed (approved)" as displayed on the production review
-- page is therefore trusted as accurately reflecting the underlying
-- row, not merely a UI report.
--
-- Selected by exact question ID, never by family_id alone: matches
-- migration 090/094/101's own established discipline — no future
-- sibling added later to this family could ever be silently swept into
-- this promotion.
--
-- INDEPENDENT-VALIDATION BOUNDARY, not mock-eligibility: this migration
-- moves these 4 rows to 'independently_validated' ONLY. It does NOT set
-- eligibility_status = 'mock_eligible' anywhere, does NOT insert or
-- modify any ali_mock_form row, does NOT touch ali_family_review in any
-- way, and is entirely separate from Decision 164's own structural-
-- normalisation question (that decision's own proposed grouping-
-- metadata map, if later authorised, is a distinct migration touching a
-- disjoint set of rows — none of which are these 4).
--
-- CONTENT IMMUTABILITY: no prompt, answer, explanation, marks, skill,
-- family_id, provenance, content_version, question_group_id, group_order,
-- subpart_label, marking_mode, or active state is changed. Only
-- eligibility_status moves, matching migration 090/094/101/119's own
-- explicit discipline.
--
-- Fails safely, following migration 090/094/101's own established
-- assertion-and-refuse pattern: if the live count of matching rows is
-- not exactly 4 authentic_assessment_candidate rows across these exact
-- IDs, and is not already exactly 4 independently_validated rows across
-- the same IDs (the safe already-applied no-op case), this migration
-- refuses to guess and raises an exception naming the actual counts
-- observed, touching nothing.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 109/110
-- (Decision 163, applied) have already been applied.

begin;

do $$
declare
  v_pending_count int;
  v_already_validated_count int;
  v_target_ids constant text[] := array[
    'mock-mr03mr07-perimeterarea-01a', 'mock-mr03mr07-perimeterarea-01b',
    'mock-mr03mr07-perimeterarea-02a', 'mock-mr03mr07-perimeterarea-02b'
  ];
  v_target_families constant text[] := array[
    'mock-mr03mr07-perimeterarea'
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

  if v_pending_count = 4 then
    -- Exactly the expected pre-promotion state. Apply.

    update public.ali_question_bank
    set eligibility_status = 'independently_validated'
    where id = any(v_target_ids)
      and eligibility_status = 'authentic_assessment_candidate';

    raise notice 'Migration 111: promoted 4 Mathematics First Mock Minimum Compound Batch 001 questions (1 family) from authentic_assessment_candidate to independently_validated.';

  elsif v_already_validated_count = 4 then
    -- Already applied -- safe no-op, not an error.
    raise notice 'Migration 111: all 4 target questions are already independently_validated -- already applied. No changes made.';

  else
    -- Production no longer matches the expected pre-promotion state (4
    -- eligible rows) and is not in the clean post-application state (4
    -- already independently_validated). Refuse to guess -- something
    -- changed since this migration was generated. No rows are touched.
    raise exception
      'Migration 111 refused: expected 4 authentic_assessment_candidate rows across the 1 named family (found %), or 4 already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

commit;
