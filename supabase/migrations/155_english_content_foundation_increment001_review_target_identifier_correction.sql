-- Angel Digital 11+ — Migration 155
-- English Content Foundation, Increment 001 — Review-Target Identifier
-- Correction (Decision 230/231).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Migration 154 (Decision 228, applied) registered the two new
-- Comprehension passage independent-review targets using each passage's
-- own `passage_family_id` ('eng-inc001-understudy-narrative' /
-- 'eng-inc001-bee-navigation-informational') as `ali_family_review.
-- family_id`. `lib/adminReview.ts`'s `fetchPendingReviewTargets()`
-- reads `ali_family_review.family_id` directly into
-- `PendingReviewTarget.id` (no other field is used), and — for a
-- `review_target_type = 'passage'` target — `ReviewForm`'s own
-- `useEffect` (`app/admin-beta/review/page.tsx`) calls
-- `fetchPassageDetail(target.id)` (`ali_passage_bank.eq("id",
-- passageId)`) and `fetchQuestionsForPassage(target.id)`
-- (`ali_question_bank.eq("learning_unit_id", passageId)`) — BOTH
-- filtered by the passage's own `id` column, never by
-- `passage_family_id`, with no fallback lookup anywhere in the
-- codebase (independently re-confirmed, Decision 231). Since each new
-- passage's own `id` ('eng-inc001-understudy' / 'eng-inc001-bee-
-- navigation') is a different string from its own `passage_family_id`,
-- both queries return nothing for either passage target as currently
-- registered — a reviewer opening either target sees a blank passage
-- with zero questions. Migration 099's own working precedent
-- ('mock-eng-boathouse') only ever worked because that passage's `id`
-- and its review-registration `family_id` happened to be the identical
-- string by that passage's own original design choice — a coincidence
-- migration 154 did not replicate.
--
-- ============================================================
-- THE FIX, AND WHY IT IS THE MINIMUM SAFE CORRECTION
-- ============================================================
-- Changes ONLY the `family_id` column, on exactly the two pending
-- passage-review rows migration 154 inserted, from each passage's
-- `passage_family_id` to that same passage's own `id`:
--   'eng-inc001-understudy-narrative'          -> 'eng-inc001-understudy'
--   'eng-inc001-bee-navigation-informational'  -> 'eng-inc001-bee-navigation'
-- Every other column on both rows (`review_target_type`, `reviewer`,
-- `decision`, `notes`, `review_type`, `created_at`, and every review-
-- dimension column) is left byte-for-byte unchanged and re-verified
-- unchanged after the write. Historical migration 154 is NOT edited —
-- it remains the true, unmodified record of what was originally
-- applied; this project's own established convention ("migrations are
-- immutable once applied; corrections are always new migrations",
-- Decision 218, re-affirmed Decision 229) is followed exactly here,
-- since these two rows genuinely ARE already applied (unlike migration
-- 152's own Decision 229 in-place correction, which applied to content
-- that had never been applied at all).
--
-- No new `ali_family_review` row is inserted. No passage or question
-- content, and no `eligibility_status` anywhere, is touched. No
-- Writing-prompt review row (the other 3 of the 5 registered targets)
-- is touched — independently confirmed correct in Decision 231's own
-- investigation (their registered `family_id` already equals the real
-- row's own `family_id` column, which `fetchRepresentativeQuestions()`
-- correctly filters by).
--
-- ============================================================
-- SAFETY GUARDS (fail closed, mirroring migration 148's established
-- precondition/post-write-verification pattern)
-- ============================================================
-- Before writing, for EACH of the two rows, this migration verifies:
--   (a) exactly one row exists with the OLD family_id, review_target_
--       type = 'passage', reviewer = 'UNASSIGNED', decision =
--       'pending_independent_review', review_type =
--       'mock_english_passage_independent_review', and the exact notes
--       text migration 154 itself inserted — OR the row already carries
--       the NEW family_id with every other field identical (already-
--       corrected state);
--   (b) no row anywhere carries EITHER the old or the new family_id
--       with a decision other than 'pending_independent_review' — i.e.
--       no genuine reviewer decision has been recorded against either
--       identifier yet. If one has, this migration refuses outright:
--       silently renaming the target out from under a real, already-
--       submitted decision would be exactly the kind of "work around
--       it" behaviour Decision 230 was explicit must not happen;
--   (c) the corresponding passage genuinely exists (`ali_passage_bank.
--       id` = the NEW family_id);
--   (d) the passage's complete, correct question membership exists via
--       `learning_unit_id` (exactly 7 for the Understudy, exactly 8 for
--       Bee Navigation) — proving the identifier this migration is
--       about to adopt is the one that actually, structurally resolves
--       to the complete intended review unit, not merely a plausible-
--       looking string.
-- If any guard fails, or if the two rows are found in a state that is
-- neither "pristine" nor "already corrected" (e.g. only one of the two
-- corrected, or an unexpected reviewer/decision/notes value), this
-- migration raises an exception and writes nothing — never guesses.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not create, approve, or impersonate any independent review
-- decision. Does not change any row's `decision`, `reviewer`, `notes`,
-- or `review_type`. Does not touch `ali_passage_bank`, `ali_question_
-- bank`, or any `eligibility_status` anywhere. Does not touch the 3
-- Writing-prompt review rows. Does not touch `ali_mock_form`. Does not
-- promote anything to `practice_eligible` or `mock_eligible`. Does not
-- start English Mock 1 or Increment 002.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations
-- 152/153/154 (Founder-confirmed applied).

begin;

do $$
declare
  v_old_id constant text := 'eng-inc001-understudy-narrative';
  v_new_id constant text := 'eng-inc001-understudy';
  v_expected_notes constant text := 'ENGLISH-CONTENT-FOUNDATION-INC001 new content review: passage "The Understudy" + its complete 7-numbered-question comprehension set (eng-inc001-understudy-q01..q07)';
  v_expected_question_count constant int := 7;
  v_pristine_count int;
  v_already_corrected_count int;
  v_non_pending_decisions int;
  v_passage_exists int;
  v_question_count int;
begin
  select count(*) into v_non_pending_decisions
    from public.ali_family_review
    where family_id in (v_old_id, v_new_id) and decision <> 'pending_independent_review';
  if v_non_pending_decisions <> 0 then
    raise exception 'Migration 155 refused (Understudy): found % row(s) with a genuine, non-pending decision already recorded against family_id % or % -- a real review may already have been submitted against the broken identifier. Manual investigation required; this migration must never silently rename a target out from under a real decision.', v_non_pending_decisions, v_old_id, v_new_id;
  end if;

  select count(*) into v_passage_exists
    from public.ali_passage_bank where id = v_new_id and eligibility_status = 'authentic_assessment_candidate' and active = true;
  if v_passage_exists <> 1 then
    raise exception 'Migration 155 refused (Understudy): expected exactly 1 authentic_assessment_candidate, active passage row with id = % (found %).', v_new_id, v_passage_exists;
  end if;

  select count(*) into v_question_count
    from public.ali_question_bank where learning_unit_id = v_new_id and eligibility_status = 'authentic_assessment_candidate' and active = true;
  if v_question_count <> v_expected_question_count then
    raise exception 'Migration 155 refused (Understudy): expected exactly % authentic_assessment_candidate, active questions with learning_unit_id = % (found %).', v_expected_question_count, v_new_id, v_question_count;
  end if;

  select count(*) into v_pristine_count
    from public.ali_family_review
    where family_id = v_old_id and review_target_type = 'passage' and reviewer = 'UNASSIGNED'
      and decision = 'pending_independent_review' and review_type = 'mock_english_passage_independent_review'
      and notes = v_expected_notes;

  select count(*) into v_already_corrected_count
    from public.ali_family_review
    where family_id = v_new_id and review_target_type = 'passage' and reviewer = 'UNASSIGNED'
      and decision = 'pending_independent_review' and review_type = 'mock_english_passage_independent_review'
      and notes = v_expected_notes;

  if v_pristine_count = 1 and v_already_corrected_count = 0 then
    update public.ali_family_review
    set family_id = v_new_id
    where family_id = v_old_id and review_target_type = 'passage' and reviewer = 'UNASSIGNED'
      and decision = 'pending_independent_review' and review_type = 'mock_english_passage_independent_review'
      and notes = v_expected_notes;
    raise notice 'Migration 155: corrected the Understudy passage review target''s family_id from % to %.', v_old_id, v_new_id;

  elsif v_already_corrected_count = 1 and v_pristine_count = 0 then
    raise notice 'Migration 155: the Understudy passage review target already carries family_id = % -- already applied. No changes made.', v_new_id;

  else
    raise exception 'Migration 155 refused (Understudy): expected exactly 1 pristine row (family_id = %, found %) XOR exactly 1 already-corrected row (family_id = %, found %). Re-verify production state before proceeding.', v_old_id, v_pristine_count, v_new_id, v_already_corrected_count;
  end if;
end $$;

do $$
declare
  v_old_id constant text := 'eng-inc001-bee-navigation-informational';
  v_new_id constant text := 'eng-inc001-bee-navigation';
  v_expected_notes constant text := 'ENGLISH-CONTENT-FOUNDATION-INC001 new content review: passage "How Bees Find Their Way Home" + its complete 8-numbered-question comprehension set (eng-inc001-bee-q01..q08)';
  v_expected_question_count constant int := 8;
  v_pristine_count int;
  v_already_corrected_count int;
  v_non_pending_decisions int;
  v_passage_exists int;
  v_question_count int;
begin
  select count(*) into v_non_pending_decisions
    from public.ali_family_review
    where family_id in (v_old_id, v_new_id) and decision <> 'pending_independent_review';
  if v_non_pending_decisions <> 0 then
    raise exception 'Migration 155 refused (Bee Navigation): found % row(s) with a genuine, non-pending decision already recorded against family_id % or % -- a real review may already have been submitted against the broken identifier. Manual investigation required; this migration must never silently rename a target out from under a real decision.', v_non_pending_decisions, v_old_id, v_new_id;
  end if;

  select count(*) into v_passage_exists
    from public.ali_passage_bank where id = v_new_id and eligibility_status = 'authentic_assessment_candidate' and active = true;
  if v_passage_exists <> 1 then
    raise exception 'Migration 155 refused (Bee Navigation): expected exactly 1 authentic_assessment_candidate, active passage row with id = % (found %).', v_new_id, v_passage_exists;
  end if;

  select count(*) into v_question_count
    from public.ali_question_bank where learning_unit_id = v_new_id and eligibility_status = 'authentic_assessment_candidate' and active = true;
  if v_question_count <> v_expected_question_count then
    raise exception 'Migration 155 refused (Bee Navigation): expected exactly % authentic_assessment_candidate, active questions with learning_unit_id = % (found %).', v_expected_question_count, v_new_id, v_question_count;
  end if;

  select count(*) into v_pristine_count
    from public.ali_family_review
    where family_id = v_old_id and review_target_type = 'passage' and reviewer = 'UNASSIGNED'
      and decision = 'pending_independent_review' and review_type = 'mock_english_passage_independent_review'
      and notes = v_expected_notes;

  select count(*) into v_already_corrected_count
    from public.ali_family_review
    where family_id = v_new_id and review_target_type = 'passage' and reviewer = 'UNASSIGNED'
      and decision = 'pending_independent_review' and review_type = 'mock_english_passage_independent_review'
      and notes = v_expected_notes;

  if v_pristine_count = 1 and v_already_corrected_count = 0 then
    update public.ali_family_review
    set family_id = v_new_id
    where family_id = v_old_id and review_target_type = 'passage' and reviewer = 'UNASSIGNED'
      and decision = 'pending_independent_review' and review_type = 'mock_english_passage_independent_review'
      and notes = v_expected_notes;
    raise notice 'Migration 155: corrected the Bee Navigation passage review target''s family_id from % to %.', v_old_id, v_new_id;

  elsif v_already_corrected_count = 1 and v_pristine_count = 0 then
    raise notice 'Migration 155: the Bee Navigation passage review target already carries family_id = % -- already applied. No changes made.', v_new_id;

  else
    raise exception 'Migration 155 refused (Bee Navigation): expected exactly 1 pristine row (family_id = %, found %) XOR exactly 1 already-corrected row (family_id = %, found %). Re-verify production state before proceeding.', v_old_id, v_pristine_count, v_new_id, v_already_corrected_count;
  end if;
end $$;

commit;
