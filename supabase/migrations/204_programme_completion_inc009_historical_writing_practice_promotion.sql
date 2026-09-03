-- Angel Digital 11+ — Migration 204
-- Programme Completion Increment 009 — Historical Writing Rows, Practice
-- Eligibility Promotion (mock-writing-newplace-01, mock-writing-
-- mistakelearned-01 ONLY).
--
-- ============================================================
-- WHY THIS IS ITS OWN MIGRATION, NOT PART OF 203
-- ============================================================
-- This is a structurally different, and previously never-attempted,
-- transition: independently_validated -> practice_eligible directly.
-- Every prior promotion to practice_eligible in this codebase's history
-- (migrations 033, 181, 203) started from 'provisional' or
-- 'authentic_assessment_candidate' -- never from 'independently_validated'.
-- lib/ali/questionBank.ts's own Decision 152 docstring treats
-- independently_validated as architecturally "reserved, protected
-- assessment content specifically because it has NOT been exposed to any
-- learner yet" -- i.e. this transition crosses a boundary that codebase
-- comment exists specifically to protect, and does so ONLY because the
-- Founder has now explicitly authorised it for these exact 2 rows, having
-- weighed that boundary against the fact no live Mock Writing renderer
-- exists (Programme Completion Increment 007/008/009 provenance
-- investigation: migration 153's own header explicitly frames these 3
-- rows' original authoring purpose as Practice depth for "sustained
-- multi-month use," not Mock reservation -- unlike migration 098's own
-- explicit "Mock Programme Increment 006" framing for mindchange/
-- kindness/cookopinion, which the Founder deliberately did NOT authorise
-- for this transition and which remain Protected Reserve).
--
-- ============================================================
-- SCOPE: EXACTLY 2 IDS
-- ============================================================
-- mock-writing-newplace-01 ("Somewhere New") and
-- mock-writing-mistakelearned-01 ("A Mistake You Learned From") ONLY.
-- Deliberately excludes mock-writing-screentime-01 (same 153-batch
-- provenance, but Founder destination: REVISE -- carries an unresolved
-- near-duplicate-checklist defect against mock-writing-cookopinion-01,
-- not authorised for Practice in its current form) and all three
-- migration-098 rows (mock-writing-mindchange-01, mock-writing-kindness-01,
-- mock-writing-cookopinion-01 -- Founder destination: PROTECTED RESERVE,
-- explicit Mock-origin provenance, not authorised for this transition).
--
-- ============================================================
-- SAFETY
-- ============================================================
-- Content-immutable: only eligibility_status is ever SET. No new review
-- decision is written by this migration -- both rows' own historical
-- approved/approved_with_amendment(+verified) decisions already exist,
-- made years before this increment (migrations 103/158/159/160's own
-- established record), and are not re-litigated or duplicated here. Fails
-- safely: refuses unless the live count of matching 'independently_validated'
-- rows across the exact 2 ids is exactly 2, or already exactly 2
-- 'practice_eligible' (idempotent no-op).
--
-- NOT APPLIED. Founder must apply via Supabase Dashboard SQL Editor.

begin;

do $$
declare
  v_pending_count int;
  v_already_promoted_count int;
  v_target_ids constant text[] := array[
    'mock-writing-newplace-01', 'mock-writing-mistakelearned-01'
  ];
begin
  select count(*) into v_pending_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'independently_validated'
    and active = true
    and subject = 'writing';

  select count(*) into v_already_promoted_count
  from public.ali_question_bank
  where id = any(v_target_ids) and eligibility_status = 'practice_eligible';

  if v_pending_count = 2 then
    update public.ali_question_bank
    set eligibility_status = 'practice_eligible'
    where id = any(v_target_ids)
      and eligibility_status = 'independently_validated';

    raise notice 'Migration 204: promoted 2 historical Continuous Writing prompts from independently_validated to practice_eligible, per explicit Founder authorisation (Programme Completion Increment 009).';

  elsif v_already_promoted_count = 2 then
    raise notice 'Migration 204: both target prompts are already practice_eligible -- already applied. No changes made.';

  else
    raise exception
      'Migration 204 refused: expected 2 independently_validated writing rows across the 2 named IDs (found %), or 2 already practice_eligible (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_promoted_count;
  end if;
end $$;

commit;
