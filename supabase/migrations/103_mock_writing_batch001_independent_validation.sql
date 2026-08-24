-- Angel Digital 11+ — Migration 103
-- Mock Programme Increment 006 — Continuous Writing Batch 001
-- Independent Validation Promotion (Decision 158, Phase A).
--
-- Promotes exactly the 3 Continuous Writing candidate prompts from
-- eligibility_status 'authentic_assessment_candidate' to
-- 'independently_validated' — RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md's
-- own next transition, mirroring migration 090/094/101's own established
-- pattern exactly.
--
-- Founder-supplied evidence: all 3 prompts (mock-writing-mindchange-01,
-- mock-writing-kindness-01, mock-writing-cookopinion-01) show "reviewed
-- (approved)" on the production "Mock Continuous Writing Batch 001
-- Review" surface (3 of 3), each with review_target_type =
-- 'writing_prompt', review_type = 'mock_writing_prompt_independent_
-- review'. This batch's own submission path passes the sevenX prop with
-- the correct MOCK-INC006-ENGLISH-BATCH001 notes marker (confirmed from
-- source) — unlike the English passage's own submission path, this
-- status-derivation mechanism was never affected by the Decision 157
-- defect, so the displayed "3 of 3 reviewed (approved)" is trusted as
-- accurately reflecting the underlying rows, not merely a UI report.
--
-- INDEPENDENT-VALIDATION BOUNDARY, not mock-eligibility: this migration
-- moves these 3 rows to 'independently_validated' ONLY. It does NOT set
-- eligibility_status = 'mock_eligible' anywhere, does NOT insert or
-- modify any ali_mock_form row, and does NOT touch ali_family_review in
-- any way.
--
-- CONTENT IMMUTABILITY: no prompt text, checklist, marks, skill,
-- family_id, provenance, content_version, or active state is changed.
-- Only eligibility_status moves. AI Writing scoring
-- (app/api/writing-feedback/route.ts, WRITING_CORRECTNESS_THRESHOLD, the
-- supportTier "supported" quarantine gate) is not read, imported,
-- referenced, or modified — confirmed by direct search this session
-- finding zero matches outside their own existing files, matching
-- migration 098's own original discipline. Independent validation of a
-- Writing prompt's suitability as a Mock task is a wholly separate
-- question from AI-assisted scoring validity, and this migration does
-- not conflate them.
--
-- Fails safely, mirroring migration 090/094/101's own assertion-and-
-- refuse pattern: if the live count of matching rows is not exactly 3
-- authentic_assessment_candidate rows across these exact IDs, and is not
-- already exactly 3 independently_validated rows across the same IDs,
-- this migration refuses to guess and raises an exception naming the
-- actual counts observed, touching nothing.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migration 098
-- (Decision 151, applied) has already been applied. Independent of
-- migrations 101/102 — no ordering dependency between them beyond all
-- three following migrations 095-100.

begin;

do $$
declare
  v_pending_count int;
  v_already_validated_count int;
  v_target_ids constant text[] := array[
    'mock-writing-mindchange-01', 'mock-writing-kindness-01', 'mock-writing-cookopinion-01'
  ];
begin
  select count(*) into v_pending_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'authentic_assessment_candidate'
    and active = true
    and subject = 'writing';

  select count(*) into v_already_validated_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'independently_validated';

  if v_pending_count = 3 then
    update public.ali_question_bank
    set eligibility_status = 'independently_validated'
    where id = any(v_target_ids)
      and eligibility_status = 'authentic_assessment_candidate';

    raise notice 'Migration 103: promoted 3 Continuous Writing Batch 001 prompts from authentic_assessment_candidate to independently_validated.';

  elsif v_already_validated_count = 3 then
    raise notice 'Migration 103: all 3 target prompts are already independently_validated -- already applied. No changes made.';

  else
    raise exception
      'Migration 103 refused: expected 3 authentic_assessment_candidate writing rows across the 3 named IDs (found %), or 3 already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

commit;
