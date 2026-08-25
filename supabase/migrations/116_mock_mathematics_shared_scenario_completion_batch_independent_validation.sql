-- Angel Digital 11+ — Migration 116
-- Mathematics First Mock Minimum — Shared-Scenario Completion Batch
-- Independent Validation Promotion (Decision 168/169/170/171).
--
-- Promotes exactly the 4 questions in the 2 approved families
-- (mock-mr10-fairprep, mock-mr09-runningclub) from eligibility_status
-- 'authentic_assessment_candidate' to 'independently_validated' —
-- RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md's own next transition,
-- mirroring migration 090 (Decision 143), migration 094 (Decision 149),
-- migration 101 (Decision 158), and migration 111 (Decision 165)
-- exactly, per the Founder's own authenticated review of
-- ali_family_review (RLS-opaque to every script/anon-key path in this
-- repository by design, migrations 034/054, so this migration records
-- the Founder-supplied decision as its input, not a re-derivation).
--
-- Founder-supplied production evidence: both families carry a genuine
-- ali_family_review row with review_type = 'mock_maths_independent_review',
-- review_target_type = 'question_family', decision = 'approved',
-- reviewer = Ayobami Lawal (the same real, independent
-- reviewer already established in this project's own precedent —
-- Decision 51, the 007D-007G pilot review arc), obtained through the
-- "Mathematics First Mock Minimum: Shared-Scenario Completion Batch
-- Review" surface (Decision 170's own MockSharedScenarioCompletion
-- BatchSection, reusing the same submitMockMathsIndependentReview()
-- write path every prior Mathematics Mock batch has used, via the
-- sevenX prop with the correct MOCK-SHARED-SCENARIO-COMPLETION-BATCH
-- notes marker — confirmed from source, not merely trusted from the UI
-- display). Approval recorded 2026-08-25. "2 of 2 families reviewed
-- (approved)" as displayed on the production review page is therefore
-- trusted as accurately reflecting the underlying rows, not merely a UI
-- report — the Founder's own separate direct read of the real
-- ali_family_review rows (reviewer, decision, review_type, notes,
-- review_date, created_at, all present and correct) is the actual
-- evidence this migration is built against.
--
-- Selected by exact question ID, never by family_id alone: matches
-- migration 090/094/101/111's own established discipline — no future
-- sibling added later to either family could ever be silently swept
-- into this promotion.
--
-- INDEPENDENT-VALIDATION BOUNDARY, not mock-eligibility: this migration
-- moves these 4 rows to 'independently_validated' ONLY. It does NOT set
-- eligibility_status = 'mock_eligible' anywhere, does NOT insert or
-- modify any ali_mock_form row, does NOT touch ali_family_review in any
-- way, and does NOT touch migration 112's own grouping normalisation or
-- any of the 48 already-mock_eligible rows.
--
-- MATHEMATICS MARKING INTEGRITY GATE — REMAINS OPEN, NOT RESOLVED OR
-- WAIVED BY THIS MIGRATION. This session's own marking-validity audit
-- found the 2-mark deterministic scoring question is real and, on the
-- exact population re-derived directly from the repository (not carried
-- forward from an earlier, inconsistent summary count), spans 22 rows
-- across 12 families in total: 20 rows across 10 families already
-- mock_eligible today (mock-mr02-twostep ×3, mock-mr05-inverse ×2,
-- mock-mr04-reversepercent ×2, mock-mr06-multiplerelation ×2,
-- mock-mr07-isoscelesproperty ×2, mock-mr10-reverseschedule ×2,
-- mock-mr11-propertysearch ×2, mock-mr08-rotation ×2,
-- mock-mr12-reversemean ×2, mock-mr09-data-03 ×1), plus exactly the 2
-- rows this migration promotes (mock-mr10-fairprep-02,
-- mock-mr09-runningclub-02) — not yet mock_eligible, and remaining so
-- after this migration. mock-mr03mr07-perimeterarea (Batch 001,
-- independently_validated, migration 111) was directly checked and
-- carries ZERO qualifying rows (all 4 of its own rows are 1 mark).
-- Neither mock-mr10-fairprep nor mock-mr09-runningclub may become
-- mock_eligible until this gate is resolved in its own, separate,
-- future decision — this migration does not attempt to resolve it, and
-- does not change any mark, answer, or scoring behaviour.
--
-- CONTENT IMMUTABILITY: no prompt, answer, marks, stimulus, family_id,
-- skill, content_difficulty, provenance, content_version,
-- question_group_id, group_order, subpart_label, marking_mode, or
-- active state is changed. Only eligibility_status moves, matching
-- migration 090/094/101/111's own explicit discipline.
--
-- Fails safely, following migration 090/094/101/111's own established
-- assertion-and-refuse pattern: if the live count of matching rows is
-- not exactly 4 authentic_assessment_candidate rows across these exact
-- IDs, and is not already exactly 4 independently_validated rows across
-- the same IDs (the safe already-applied no-op case), this migration
-- refuses to guess and raises an exception naming the actual counts
-- observed, touching nothing.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations
-- 113/114/115 (Decision 170) have already been applied.

begin;

do $$
declare
  v_pending_count int;
  v_already_validated_count int;
  v_target_ids constant text[] := array[
    'mock-mr10-fairprep-01', 'mock-mr10-fairprep-02',
    'mock-mr09-runningclub-01', 'mock-mr09-runningclub-02'
  ];
  v_target_families constant text[] := array[
    'mock-mr10-fairprep', 'mock-mr09-runningclub'
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

    raise notice 'Migration 116: promoted 4 Mathematics First Mock Minimum Shared-Scenario Completion Batch questions (2 families: mock-mr10-fairprep, mock-mr09-runningclub) from authentic_assessment_candidate to independently_validated. Neither family is mock_eligible. The Mathematics Marking Integrity Gate remains open.';

  elsif v_already_validated_count = 4 then
    -- Already applied -- safe no-op, not an error.
    raise notice 'Migration 116: all 4 target questions are already independently_validated -- already applied. No changes made.';

  else
    -- Production no longer matches the expected pre-promotion state (4
    -- eligible rows) and is not in the clean post-application state (4
    -- already independently_validated). Refuse to guess -- something
    -- changed since this migration was generated. No rows are touched.
    raise exception
      'Migration 116 refused: expected 4 authentic_assessment_candidate rows across the 2 named families (found %), or 4 already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

commit;
