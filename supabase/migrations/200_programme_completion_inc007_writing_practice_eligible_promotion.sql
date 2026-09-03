-- Angel Digital 11+ — Migration 200
-- Programme Completion Increment 007 — Continuous Writing Practice
-- Eligibility Promotion, Part A (the 5 clean candidate-track rows only).
--
-- ============================================================
-- WHAT THIS MIGRATION IS, AND WHAT IT IS NOT
-- ============================================================
-- Unlike migration 181's own precedent (the last row of evidence this
-- codebase has for a 'authentic_assessment_candidate' -> 'practice_eligible'
-- promotion), which was written AFTER the Founder's real, cross-checked
-- `/admin-beta/review` decisions already existed, THIS migration is
-- PREPARED IN ADVANCE of that evidence, to save the Founder a round-trip
-- once the Increment 007 independent-review batch is actually completed.
-- It is NOT a record of a decision that has happened; it is a ready-to-run
-- artefact for a decision that has not yet happened.
--
-- DO NOT APPLY THIS MIGRATION until, for every one of the 5 ids below, the
-- Founder has genuinely completed independent review via the live
-- `/admin-beta/review` interface (review_type =
-- 'mock_writing_prompt_independent_review') and recorded a real decision
-- of 'approved' or 'approved_with_amendment' (with any named amendment
-- resolved) — cross-checked directly against the persisted
-- `ali_family_review` rows themselves, not accepted from a UI summary
-- alone, exactly matching migration 181's own evidentiary discipline.
--
-- ============================================================
-- SCOPE: EXACTLY 5 ROWS
-- ============================================================
-- Programme Completion Increment 007's own review found these 5 rows
-- (of the 7-row outstanding batch) recommended for Practice destination
-- (not Reserve, Revise, or Retire) — see
-- ANGEL_ENGLISH_CONTENT_FOUNDATION_INCREMENT_007_WRITING_INDEPENDENT_REVIEW_V1.md
-- for the full reasoning. `eng-pc003-writing-difficulttask` and
-- `eng-pc003-writing-meaningfulplace` are deliberately NOT included here
-- despite being content-sound — Increment 007 recommends Protected
-- Reserve for both, to reduce the "Write about a time..." event-recount
-- pattern's dominance and the place-description shape's duplication
-- footprint in the live Practice pool, not because either failed review.
--
-- eng-inc003-writing-pocketmoney-01 REQUIRES migration 173 (the checklist
-- correction) to have been applied together with migration 169 — this
-- migration's own precondition checks the POST-173 checklist shape
-- indirectly by requiring eligibility_status = 'authentic_assessment_candidate'
-- AND active = true for the exact id set; it does NOT independently
-- re-verify checklist content (that is 173's own, already-applied
-- responsibility by the time this migration could safely run).
--
-- Skips the independently_validated/mock_eligible Mock-governance track
-- entirely for these 5 rows, promoting directly from
-- 'authentic_assessment_candidate' to 'practice_eligible' — matching
-- migration 181's own precedent (provisional -> practice_eligible,
-- Mock-track skipped entirely), not the two-step
-- independently_validated-first pattern migration 103/160 used for the
-- OLDER 6 Writing rows. Those 6 older rows (mindchange, kindness,
-- cookopinion, newplace, mistakelearned, screentime) are DELIBERATELY
-- OUT OF SCOPE for this migration — per lib/ali/questionBank.ts's own
-- Decision 152 docstring, an independently_validated row is architecturally
-- "reserved, protected assessment content specifically because it has NOT
-- been exposed to any learner yet," and promoting any of them to Practice
-- crosses that boundary. Increment 007's report flags this explicitly as
-- an open question requiring its own, separate Founder decision — this
-- migration does not resolve it, and touches none of those 6 ids.
--
-- ============================================================
-- SAFETY
-- ============================================================
-- Content-immutable: only eligibility_status is ever SET. No prompt,
-- checklist, family_id, provenance, content_version, or active column is
-- touched. No ali_family_review row is written, updated, or deleted — the
-- review decisions this migration depends on must already exist there,
-- written by the Founder through the real review surface, not by this
-- migration. No ali_mock_form row is touched. No AI-scoring identifier
-- (writing-feedback/route, WRITING_CORRECTNESS_THRESHOLD, supportTier) is
-- referenced. Fails safely: refuses (RAISE EXCEPTION, naming the actual
-- counts observed) unless the live count of matching
-- 'authentic_assessment_candidate' rows across the exact 5 ids is exactly
-- 5, or already exactly 5 'practice_eligible' rows across the same ids
-- (safe idempotent no-op). Wrapped in a single begin/commit transaction.
--
-- NOT APPLIED. Must not be applied until the Increment 007 independent
-- review batch is genuinely completed by the Founder for these exact 5
-- ids, and the Founder has reviewed and accepted this exact promotion set
-- (see the Increment 007 report's Practice/Reserve recommendation).

begin;

do $$
declare
  v_pending_count int;
  v_already_promoted_count int;
  v_target_ids constant text[] := array[
    'eng-inc003-writing-imaginedplace-01',
    'eng-inc003-writing-favouriteplace-01',
    'eng-inc003-writing-pocketmoney-01',
    'eng-pc005-writing-personinfluence',
    'eng-pc005-writing-somethingnew'
  ];
begin
  select count(*) into v_pending_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'authentic_assessment_candidate'
    and active = true
    and subject = 'writing';

  select count(*) into v_already_promoted_count
  from public.ali_question_bank
  where id = any(v_target_ids) and eligibility_status = 'practice_eligible';

  if v_pending_count = 5 then
    update public.ali_question_bank
    set eligibility_status = 'practice_eligible'
    where id = any(v_target_ids)
      and eligibility_status = 'authentic_assessment_candidate';

    raise notice 'Migration 200: promoted 5 Continuous Writing prompts from authentic_assessment_candidate to practice_eligible.';

  elsif v_already_promoted_count = 5 then
    raise notice 'Migration 200: all 5 target prompts are already practice_eligible -- already applied. No changes made.';

  else
    raise exception
      'Migration 200 refused: expected 5 authentic_assessment_candidate writing rows across the 5 named IDs (found %), or 5 already practice_eligible (found %). Re-verify production state, and confirm all 5 have a real Founder-recorded approved/approved_with_amendment decision in ali_family_review before re-running.',
      v_pending_count, v_already_promoted_count;
  end if;
end $$;

commit;
