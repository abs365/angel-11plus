-- Angel Digital 11+ — Migration 158
-- English Content Foundation Increment 001, Decision 235, Section 3 —
-- "Somewhere New" Founder Amendment Clarification (additive linked
-- evidence; the original independent-review decision is NEVER touched).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- The live, independently-reviewed `ali_family_review` row for
-- `mock-writing-wc01a-newplace` (review_type =
-- 'mock_writing_prompt_independent_review', reviewer 'Ayobami Lawal',
-- decision 'approved_with_amendment') carries notes that state only
-- "Founder review with caution." -- non-blank, so it satisfied every
-- rule that existed before migration 157, but it does not state what
-- the amendment actually is. Post-Decision-234, the Founder reopened and
-- re-examined the actual learner-facing prompt and supplied the missing
-- amendment directly (Decision 235's own directive): the prompt/
-- checklist required a real personal experience and forced a "feelings
-- changed" formula, both narrower than the task's real assessment target
-- (writing quality, not autobiographical truth or one fixed emotional
-- arc).
--
-- ============================================================
-- WHY ADDITIVE, NOT AN UPDATE
-- ============================================================
-- Section 3's own explicit instruction: "the existing ali_family_review
-- record MUST NOT be overwritten. This Founder clarification is
-- supplementary review evidence." Reuses the EXISTING mechanism
-- (`ali_family_review`, the established review/evidence table) rather
-- than a new table, per this task's own "reuse an existing mechanism...
-- do not add a new table merely for this one case unless genuinely
-- necessary" instruction -- a second, clearly-labelled row
-- (review_type = 'founder_amendment_clarification', migration 157) is
-- sufficient. This is SAFE against every consumer that reads this table:
-- `deriveBatchReviewStatus` (lib/adminReview.ts) filters by EXACT
-- `review_type` equality, so a row carrying a distinct, dedicated
-- review_type value can never be picked up by
-- `fetchMockEnglishInc001WritingReviewStatus` (which filters on
-- 'mock_writing_prompt_independent_review' only) and so can never
-- silently replace or be confused with the original decision that
-- function surfaces to the review UI. The resulting audit trail is:
-- original reviewer (Ayobami Lawal) -> original decision
-- (approved_with_amendment) -> original timestamp (this row's own,
-- untouched, created_at) -> this Founder clarification (its own,
-- later, created_at) -> Decision 235's remediation (migration 159) ->
-- amendment verification (review_type = 'amendment_verification',
-- Section 11, submitted later via the review surface).
--
-- ============================================================
-- SAFETY
-- ============================================================
-- Fail-closed: refuses unless the ORIGINAL row is found in exactly the
-- expected state (family_id, review_type, reviewer, decision, and notes
-- containing the exact known substring "Founder review with caution.")
-- -- if production does not match this precisely, this migration does
-- nothing and raises an exception rather than guessing or inserting
-- against a different row. Idempotent: if a 'founder_amendment_
-- clarification' row already exists for this family_id, this migration
-- is a verified no-op. Never touches the original row's own `decision`,
-- `notes`, `reviewer`, or any other column -- confirmed by a post-write
-- check that the original row's own notes are still exactly what they
-- were before this migration ran. Does not change eligibility_status
-- anywhere. Creates no Mock content.
--
-- NOT APPLIED. Requires migration 157 already applied (the new
-- review_type value this row uses). Generated for Founder application
-- via Supabase Dashboard > SQL Editor > New query.

begin;

do $$
declare
  v_original_count int;
  v_original_notes text;
  v_clarification_count int;
begin
  select count(*) into v_clarification_count
  from public.ali_family_review
  where family_id = 'mock-writing-wc01a-newplace'
    and review_type = 'founder_amendment_clarification';

  if v_clarification_count > 0 then
    raise notice 'Migration 158: a founder_amendment_clarification row for mock-writing-wc01a-newplace already exists -- already applied. No changes made.';
    return;
  end if;

  select count(*) into v_original_count
  from public.ali_family_review
  where family_id = 'mock-writing-wc01a-newplace'
    and review_type = 'mock_writing_prompt_independent_review'
    and review_target_type = 'writing_prompt'
    and reviewer = 'Ayobami Lawal'
    and decision = 'approved_with_amendment'
    and notes like '%Founder review with caution.%';

  if v_original_count != 1 then
    raise exception
      'Migration 158 refused: expected exactly 1 original mock_writing_prompt_independent_review row for mock-writing-wc01a-newplace (reviewer Ayobami Lawal, decision approved_with_amendment, notes containing "Founder review with caution."), found %. Re-verify production state before proceeding -- this migration will not guess which row to link against.',
      v_original_count;
  end if;

  select notes into v_original_notes
  from public.ali_family_review
  where family_id = 'mock-writing-wc01a-newplace'
    and review_type = 'mock_writing_prompt_independent_review';

  insert into public.ali_family_review
    (review_target_type, family_id, reviewer, decision, review_type, notes)
  values (
    'writing_prompt',
    'mock-writing-wc01a-newplace',
    'FOUNDER',
    'approved_with_amendment',
    'founder_amendment_clarification',
    'ORIGINAL REVIEW: reviewer Ayobami Lawal, decision approved_with_amendment, notes: "Founder review with caution." (recorded no explicit amendment).' || E'\n\n' ||
    'FOUNDER CLARIFICATION (post-Decision-234, supplied directly by the Founder after reopening and re-examining the actual learner-facing prompt): "Preserve the strong place-arrival and reflective-writing concept, but remove the unnecessary requirement that the place must be a real personal experience. Learners should be able to draw on a real experience or construct a plausible imagined situation, because the task assesses writing quality rather than autobiographical truth. Also soften the requirement that feelings must necessarily ''change'' over time. The task should encourage development of thoughts, impressions or feelings without forcing every response into the same emotional-change pattern. Retain specific detail, sensory description, coherent sequencing and reflective development. No deterministic model answer is required; assessment remains qualitative."' || E'\n\n' ||
    'REMEDIATION: implemented in migration 159 (Decision 235) -- see ali_question_bank.mock-writing-newplace-01 prompt.prompt / prompt.checklist / addresses_misconception.' || E'\n\n' ||
    'This row is additive, supplementary evidence only. It does not overwrite, and must never be read as overwriting, the original review row above, which remains exactly as Ayobami Lawal recorded it.'
  );

  -- Post-write proof the original row is genuinely untouched.
  perform 1 from public.ali_family_review
    where family_id = 'mock-writing-wc01a-newplace'
      and review_type = 'mock_writing_prompt_independent_review'
      and notes = v_original_notes;
  if not found then
    raise exception 'Migration 158: post-write check failed -- the original review row''s notes changed unexpectedly. This should be structurally impossible (this migration never issues an UPDATE against that row); refusing to proceed silently.';
  end if;

  raise notice 'Migration 158: inserted 1 founder_amendment_clarification row for mock-writing-wc01a-newplace. Original review row confirmed untouched.';
end $$;

commit;

-- Read-only verification (run before and after applying):
--
-- select review_type, reviewer, decision, created_at, notes
-- from public.ali_family_review
-- where family_id = 'mock-writing-wc01a-newplace'
-- order by created_at;
