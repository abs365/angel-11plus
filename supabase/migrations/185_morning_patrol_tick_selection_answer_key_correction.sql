-- Angel Digital 11+ — Migration 185
-- Reading Comprehension Assessment Integrity Correction, Part 3:
-- 'w2-morningpatrol-08' answer-key defect.
--
-- ============================================================
-- ROOT CAUSE (Gate 4/5 live production walkthrough, confirmed by direct
-- passage re-reading, not assumed)
-- ============================================================
-- This TIER6_MULTI_SELECT question ("Tick 4 boxes that accurately
-- describe things Priya did in the passage") lists 8 statements (A-H) and
-- declares exactly 4 correct: correctOptions ["B","D","F","H"],
-- requiredSelectionCount 4. Live testing found this key is wrong: option
-- G ("She skipped her usual duck count") is ALSO directly, unambiguously
-- supported by the passage's own text -- "She moved on to the pond next,
-- skipping her usual duck count in her hurry" -- making FIVE of the eight
-- statements (B, D, F, G, H) genuinely true, not four. Under an
-- exact-match, no-partial-credit tick format, this is structurally
-- unanswerable with full accuracy: a learner who correctly identifies all
-- five true statements is forced to arbitrarily omit one, and is then
-- marked wrong by the auto-grader for a selection that is factually
-- correct.
--
-- Per the Framework's own CSSE-013/2021 Q11 evidence basis for this
-- question type, the real exam's own tick-box items are constructed so
-- that exactly N statements are true among the options -- never N+1. The
-- defect here is in the OPTION SET, not the passage, the four already-
-- correct answers (B/D/F/H), or the four already-correct false
-- distractors (A/C/E).
--
-- ============================================================
-- FIX
-- ============================================================
-- Option G's text is replaced with a new, genuinely false distractor of
-- the same style and difficulty as this question's other direct-
-- contradiction distractor (E): "She found the rose beds disturbed" is
-- directly and explicitly contradicted by the passage's own words, "The
-- rose beds were untouched." This restores exactly four true statements
-- (B/D/F/H) among eight options, matching both the stored correctOptions
-- and the "Tick 4" instruction -- one defensible answer contract, not a
-- relabelling of which letter is called correct.
--
-- The passage text, modelAnswer, correctOptions, requiredSelectionCount,
-- validationTier, marks, and every other option (A/B/C/D/E/F/H) are
-- completely unchanged. addresses_misconception is extended (not
-- replaced) to name the new distractor's own failure mode alongside the
-- two that were already documented.
--
-- Live, active content (family wave2-fam-multiselect, unrelated to the
-- separately-excluded wave1-fam-tick-justify family -- confirmed by
-- direct reading of this row's own family_id, not assumed from the
-- similar-sounding name) -- this is a live production correctness fix.
--
-- Fail-closed and idempotent: the WHERE clause requires the CURRENT
-- `question` text and `addresses_misconception` to exactly equal their
-- documented pre-fix values.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

update public.ali_question_bank
set
  prompt = jsonb_set(
    prompt,
    '{question}',
    to_jsonb(
      'Tick 4 boxes that accurately describe things Priya did in the passage. A. She checked the greenhouse first, as usual. B. She found the gate already open. C. She counted the ducks as usual. D. She went straight to the rose beds. E. She woke the boy immediately. F. She found a tent at the old oak. G. She found the rose beds disturbed. H. She returned to the greenhouse before dealing with the boy.'::text
    )
  ),
  addresses_misconception = 'Selecting A or C, which describe her USUAL routine rather than what actually happened this disrupted Tuesday; selecting E, which the passage explicitly says she did not do; or selecting G, since the passage states the rose beds were untouched.'
where id = 'w2-morningpatrol-08'
  and prompt->>'question' = 'Tick 4 boxes that accurately describe things Priya did in the passage. A. She checked the greenhouse first, as usual. B. She found the gate already open. C. She counted the ducks as usual. D. She went straight to the rose beds. E. She woke the boy immediately. F. She found a tent at the old oak. G. She skipped her usual duck count. H. She returned to the greenhouse before dealing with the boy.'
  and addresses_misconception = 'Selecting A or C, which describe her USUAL routine rather than what actually happened this disrupted Tuesday; or selecting E, which the passage explicitly says she did not do.';

commit;
