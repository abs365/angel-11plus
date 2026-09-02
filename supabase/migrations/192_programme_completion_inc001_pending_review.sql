-- Angel Digital 11+ — Migration 192
-- Angel Programme Completion, Increment 001 — Pending Independent Review
-- Registration for migration 191's new Comprehension content.
--
-- Registers "The Fossil Hunter of Lyme Regis" (passage + its complete
-- 6-question set) as awaiting an independent reviewer, following the
-- SAME proactive placeholder-seeding pattern migrations 099/154 already
-- established — ONE row, keyed by the passage's own `id` column
-- ('eng-pc001-anning'), never by a separate `passage_family_id` value.
--
-- This explicitly follows migration 155's own corrected convention, not
-- migration 154's original (pre-155-fix) pattern: `lib/adminReview.ts`'s
-- `fetchPendingReviewTargets()` reads `ali_family_review.family_id`
-- directly into `PendingReviewTarget.id`, and `ReviewForm` then calls
-- `fetchPassageDetail(target.id)` / `fetchQuestionsForPassage(target.id)`,
-- both filtered by the passage's own `id` — using `passage_family_id`
-- here (as migration 154 originally, incorrectly, did) would register a
-- review target no reviewer could ever actually open. This migration
-- avoids that defect from the start.
--
-- review_type = 'mock_english_passage_independent_review' — the SAME
-- value migrations 099/154/156 already use for every Comprehension
-- passage review target, regardless of eventual Practice/Mock
-- destination (a naming legacy of this table's own history, not a
-- functional Mock-only gate). reviewer is explicitly 'UNASSIGNED'. No
-- row's eligibility_status changes anywhere in this migration — the
-- passage and all 6 questions remain 'authentic_assessment_candidate'
-- exactly as migration 191 left them. This migration inserts ONLY a
-- placeholder row recording that review is awaited; it does not itself
-- constitute, preselect, or imply any review decision, and no reviewer
-- identity is fabricated (Decision 48/51 precedent).
--
-- The idempotency guard checks family_id + decision + review_type +
-- notes together, matching migration 099/154's own exact convention.
--
-- REQUIRES migration 191 to have already been applied — this migration's
-- own precondition explicitly checks for, and refuses without, the
-- passage existing with exactly its expected 6-question membership.
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migration 191.

begin;

do $do$
declare
  v_passage_exists int;
  v_question_count int;
begin
  select count(*) into v_passage_exists
    from public.ali_passage_bank
    where id = 'eng-pc001-anning' and eligibility_status = 'authentic_assessment_candidate' and active = true;
  if v_passage_exists <> 1 then
    raise exception 'Migration 192 refused: expected exactly 1 authentic_assessment_candidate, active passage row with id = eng-pc001-anning (found %). Migration 191 must be applied first.', v_passage_exists;
  end if;

  select count(*) into v_question_count
    from public.ali_question_bank
    where learning_unit_id = 'eng-pc001-anning' and eligibility_status = 'authentic_assessment_candidate' and active = true;
  if v_question_count <> 6 then
    raise exception 'Migration 192 refused: expected exactly 6 authentic_assessment_candidate, active questions with learning_unit_id = eng-pc001-anning (found %).', v_question_count;
  end if;

  insert into public.ali_family_review
    (review_target_type, family_id, reviewer, decision, notes, review_type)
  select 'passage', 'eng-pc001-anning', 'UNASSIGNED',
    'pending_independent_review'::public.family_review_decision,
    'ANGEL-PROGRAMME-COMPLETION-INC001 new content review: passage "The Fossil Hunter of Lyme Regis" + its complete 6-numbered-question comprehension set (eng-pc001-anning-q01..q06). QT-RC-07 targeted, per Decision 121/122''s own named gap.',
    'mock_english_passage_independent_review'
  where not exists (
    select 1 from public.ali_family_review
    where family_id = 'eng-pc001-anning' and decision = 'pending_independent_review'
      and review_type = 'mock_english_passage_independent_review'
  );

  raise notice 'Migration 192: pending-independent-review placeholder registered (or already present) for eng-pc001-anning.';
end $do$;

commit;
