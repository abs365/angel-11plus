-- Angel Digital 11+ — Migration 101
-- Mock Programme Increment 006 — Mathematics Batch 003 Independent
-- Validation Promotion (Decision 158, Phase A).
--
-- Promotes exactly the 10 questions across the 4 approved Mock
-- Mathematics Batch 003 families from eligibility_status
-- 'authentic_assessment_candidate' to 'independently_validated' —
-- RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md's own next transition,
-- mirroring migration 090 (Batch 001, Decision 143) and migration 094
-- (Batch 002, Decision 149) exactly, per the Founder's own authenticated
-- review of ali_family_review (RLS-opaque to every script/anon-key path
-- in this repository by design, migrations 034/054, so this migration
-- records the Founder-supplied decision as its input, not a
-- re-derivation).
--
-- Founder-supplied evidence: all 4 Batch 003 families (mock-mr01-
-- directcalc, mock-mr08-rotation, mock-mr12-reversemean, mock-mr01mr10-
-- costumeschedule) carry a genuine ali_family_review row with review_type
-- = 'mock_maths_independent_review', review_target_type =
-- 'question_family', decision = 'approved', obtained through the "Mock
-- Mathematics Batch 003 Review" surface (Decision 151's own
-- MockMrBatch003Section, reusing the same submitMockMathsIndependentReview()
-- write path every prior Mathematics Mock batch has used). This batch's
-- own submission path passes the sevenX prop with the correct
-- MOCK-INC004-BATCH003 notes marker (confirmed from source, unlike the
-- English passage's own submission path, Decision 157) — its status-
-- derivation mechanism was never affected by that defect, so "4 of 4
-- families reviewed (approved)" as displayed on the production review
-- page is trusted as accurately reflecting the underlying rows, not
-- merely a UI report.
--
-- Selected by exact question ID, never by family_id alone: matches
-- migration 090/094's own established discipline — no future sibling
-- added later to any of these 4 families could ever be silently swept
-- into this promotion.
--
-- INDEPENDENT-VALIDATION BOUNDARY, not mock-eligibility: this migration
-- moves these 10 rows to 'independently_validated' ONLY. It does NOT set
-- eligibility_status = 'mock_eligible' anywhere, does NOT insert or
-- modify any ali_mock_form row, and does NOT touch ali_family_review in
-- any way.
--
-- CONTENT IMMUTABILITY: no prompt, answer, explanation, marks, skill,
-- family_id, provenance, content_version, question_group_id, group_order,
-- subpart_label, marking_mode, or active state is changed. Only
-- eligibility_status moves, matching migration 090/094/119's own explicit
-- discipline.
--
-- Fails safely, following migration 090/094's own established
-- assertion-and-refuse pattern: if the live count of matching rows is
-- not exactly 10 authentic_assessment_candidate rows across these exact
-- IDs, and is not already exactly 10 independently_validated rows across
-- the same IDs (the safe already-applied no-op case), this migration
-- refuses to guess and raises an exception naming the actual counts
-- observed, touching nothing.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 095/096
-- (Decision 151, applied) have already been applied.

begin;

do $$
declare
  v_pending_count int;
  v_already_validated_count int;
  v_target_ids constant text[] := array[
    'mock-mr01-directcalc-01', 'mock-mr01-directcalc-02',
    'mock-mr08-rotation-01', 'mock-mr08-rotation-02',
    'mock-mr12-reversemean-01', 'mock-mr12-reversemean-02',
    'mock-mr01mr10-costumeschedule-01a', 'mock-mr01mr10-costumeschedule-01b',
    'mock-mr01mr10-costumeschedule-02a', 'mock-mr01mr10-costumeschedule-02b'
  ];
  v_target_families constant text[] := array[
    'mock-mr01-directcalc', 'mock-mr08-rotation',
    'mock-mr12-reversemean', 'mock-mr01mr10-costumeschedule'
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

  if v_pending_count = 10 then
    -- Exactly the expected pre-promotion state. Apply.

    update public.ali_question_bank
    set eligibility_status = 'independently_validated'
    where id = any(v_target_ids)
      and eligibility_status = 'authentic_assessment_candidate';

    raise notice 'Migration 101: promoted 10 Mock Mathematics Batch 003 questions across 4 families from authentic_assessment_candidate to independently_validated.';

  elsif v_already_validated_count = 10 then
    -- Already applied -- safe no-op, not an error.
    raise notice 'Migration 101: all 10 target questions are already independently_validated -- already applied. No changes made.';

  else
    -- Production no longer matches the expected pre-promotion state (10
    -- eligible rows) and is not in the clean post-application state (10
    -- already independently_validated). Refuse to guess -- something
    -- changed since this migration was generated. No rows are touched.
    raise exception
      'Migration 101 refused: expected 10 authentic_assessment_candidate rows across the 4 named families (found %), or 10 already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

commit;
