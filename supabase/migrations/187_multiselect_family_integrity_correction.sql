-- Angel Digital 11+ — Migration 187
-- Reading Comprehension Assessment Integrity Correction, Part 5:
-- multi-select family integrity check, wave2-fam-multiselect.
--
-- ============================================================
-- SCOPE OF THE CHECK (Founder-directed, targeted, not a broad audit)
-- ============================================================
-- Every live TIER6_MULTI_SELECT row in the codebase was located and its
-- displayed options independently re-derived from its own passage text,
-- searching specifically for the SAME structural defect Migration 185
-- corrected in Morning Patrol: requiredSelectionCount N, but more than N
-- of the displayed options are genuinely true against the passage.
--
-- 8 live/provisional TIER6_MULTI_SELECT rows exist today:
--   w2-morningpatrol-08 (049) -- ALREADY CORRECTED, migration 185.
--   w2-longwalk-02       (049) -- DEFECTIVE, corrected below.
--   w2-stormwarning-02   (049) -- DEFECTIVE, corrected below.
--   w2-surprise-02       (051) -- checked, exactly 4 true (A,B,D,F). Clean.
--   w2-twoletters-07     (051) -- checked, exactly 4 true (A,C,F,H). Clean.
--   w2-pianorecital-07   (051) -- checked, A/C/H clearly true; F ("only two
--     words") is a separate, different-shaped issue (the quoted "the middle
--     section" is three words, not two) -- NOT the N+1-true-statements
--     defect this migration targets, so NOT touched here. Disclosed in the
--     Founder Handoff as a distinct, smaller finding, not silently fixed.
--   eng-inc001-bee-q08   (152) -- checked, exactly 2 true (2,3). Clean.
--   mock-eng-boathouse-q10 (097, Mock-track) -- checked, exactly 4 true
--     (1,3,5,7). Clean.
--
-- All 3 rows from the ORIGINAL migration 049 wave2-fam-multiselect batch
-- had this defect; every row from the later migration 051 "completion"
-- batch and every row from migrations 152/097 does not -- the defect is
-- scoped precisely to migration 049's own original authoring pass, not
-- the family generally.
--
-- ============================================================
-- w2-longwalk-02 -- independently re-derived truth values
-- ============================================================
-- A. Walked down Kestrel Road first -- TRUE ("I set off down Kestrel
--    Road first, since it was the most direct route").
-- B. Waited at the bus stop the whole time -- FALSE (she walked; the bus
--    never came).
-- C. Sheltered at the park bus shelter -- TRUE ("I ducked under the bus
--    shelter there instead, the working one") -- the 5th true statement,
--    corrected below.
-- D. Bought a bike from the corner shop -- FALSE (she bought crisps; the
--    shopkeeper only asked if she'd consider a bike).
-- E. Cut through the alley behind the launderette -- TRUE (stated
--    directly).
-- F. Stopped at the corner shop for crisps -- TRUE (stated directly).
-- G. Took a taxi for part of the way -- FALSE (not mentioned at all).
-- H. Crossed the main road at the pelican crossing -- TRUE (stated
--    directly).
-- Five true (A, C, E, F, H) against requiredSelectionCount 4 and stored
-- correctOptions ["A","E","F","H"] -- the row's own modelAnswer already
-- disclosed this ambiguity rather than hiding it, which is how the
-- defect was caught, but disclosure is not a fix.
--
-- ============================================================
-- w2-stormwarning-02 -- independently re-derived truth values
-- ============================================================
-- A. Dad flattened the trampoline -- TRUE ("hauling the trampoline
--    flat").
-- B. Theo helped carry the bins -- FALSE (the narrator carried them;
--    Theo watched from the window).
-- C. Mum closed and checked the windows -- TRUE (stated directly).
-- D. The narrator secured the wheelie bins -- TRUE (stated directly).
-- E. The family lost power before dinner -- TRUE ("We lost power just
--    after six... We ate dinner by torchlight" -- dinner is eaten
--    without power, i.e. after the loss) -- the 5th true statement,
--    corrected below. (The row's own modelAnswer hedged this as "true
--    depending on the definition of 'before dinner'"; re-reading the
--    passage directly, "ate dinner by torchlight" only makes sense if
--    the power was already out, so this is not genuinely ambiguous --
--    it is simply true, and the hedge itself was evidence the row
--    needed correcting, not evidence the ambiguity was acceptable.)
-- F. Theo was frightened by the storm -- FALSE (explicitly the opposite:
--    "Theo shriek with delight", declared it "the best part so far").
-- G. Dad made a final trip to check the trampoline -- TRUE (stated
--    directly).
-- H. They ate dinner in a restaurant -- FALSE ("ate dinner by
--    torchlight" at home).
-- Five true (A, C, D, E, G) against requiredSelectionCount 4 and stored
-- correctOptions ["A","C","D","G"].
--
-- ============================================================
-- FIX (same principle as Migration 185): correct the content, not the
-- grader
-- ============================================================
-- checkMultiSelect (lib/learningEngine/englishAnswerValidation.ts) is
-- NOT changed -- weakening it to accept any valid subset would risk
-- accepting genuinely wrong answers elsewhere in the bank, which the
-- Founder explicitly ruled out. Each row's 5th true option is instead
-- replaced with a new, genuinely false, same-style distractor, so
-- exactly 4 of the 8 displayed options are true, matching both
-- requiredSelectionCount and the already-correct, unchanged
-- correctOptions array:
--   w2-longwalk-02 option C: "Sheltered at the park bus shelter" (true)
--     -> "Went straight past the park without stopping" (false -- she
--     explicitly did stop, to shelter from the rain).
--   w2-stormwarning-02 option E: "The family lost power before dinner"
--     (true) -> "Mum trusted the window to stay shut on its own" (false
--     -- she is shown "watching the window... as if she didn't quite
--     trust it to stay shut on its own", the opposite of the claim).
-- modelAnswer is updated to drop the hedging/disclosure language (no
-- longer needed once exactly 4 statements are true) and state the
-- single correct combination plainly, matching Morning Patrol's own
-- corrected modelAnswer style. addresses_misconception is extended
-- (not replaced) to name the new distractor's own failure mode.
--
-- passageText, correctOptions, requiredSelectionCount, validationTier,
-- marks, and every other option on both rows are completely unchanged.
--
-- Fail-closed and idempotent: each WHERE clause requires the CURRENT
-- `question`, `modelAnswer` (nested in prompt), and `addresses_misconception`
-- to exactly equal their documented pre-fix values.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

-- w2-longwalk-02
update public.ali_question_bank
set prompt = jsonb_set(
      jsonb_set(
        prompt,
        '{question}',
        to_jsonb('Tick 4 boxes that accurately describe things the narrator did on the way home. A. Walked down Kestrel Road first. B. Waited at the bus stop the whole time. C. Went straight past the park without stopping. D. Bought a bike from the corner shop. E. Cut through the alley behind the launderette. F. Stopped at the corner shop for crisps. G. Took a taxi for part of the way. H. Crossed the main road at the pelican crossing.'::text)
      ),
      '{modelAnswer}',
      to_jsonb('A, E, F, H: she walked down Kestrel Road first, cut through the alley behind the launderette, stopped at the corner shop for crisps, and crossed the main road at the pelican crossing.'::text)
    ),
    addresses_misconception = 'Selecting B, D or G, which the passage explicitly contradicts (the bus never came, no bike was bought, no taxi is mentioned), or C, since she did stop at the park to shelter from the rain.'
where id = 'w2-longwalk-02'
  and prompt->>'question' = 'Tick 4 boxes that accurately describe things the narrator did on the way home. A. Walked down Kestrel Road first. B. Waited at the bus stop the whole time. C. Sheltered at the park bus shelter. D. Bought a bike from the corner shop. E. Cut through the alley behind the launderette. F. Stopped at the corner shop for crisps. G. Took a taxi for part of the way. H. Crossed the main road at the pelican crossing.'
  and prompt->>'modelAnswer' = 'A, C, E, F, H are all things the narrator did, but exactly 4 must be ticked; A, E, F, H is one fully correct combination (Kestrel Road first, the alley, the corner shop, the pelican crossing).'
  and addresses_misconception = 'Selecting B, D or G, which the passage explicitly contradicts (the bus never came, no bike was bought, no taxi is mentioned).';

-- w2-stormwarning-02
update public.ali_question_bank
set prompt = jsonb_set(
      jsonb_set(
        prompt,
        '{question}',
        to_jsonb('Tick 4 boxes that accurately describe things that happened in the passage. A. Dad flattened the trampoline. B. Theo helped carry the bins. C. Mum closed and checked the windows. D. The narrator secured the wheelie bins. E. Mum trusted the window to stay shut on its own. F. Theo was frightened by the storm. G. Dad made a final trip to check the trampoline. H. They ate dinner in a restaurant.'::text)
      ),
      '{modelAnswer}',
      to_jsonb('A, C, D, G: Dad flattened the trampoline, Mum closed and checked the windows, the narrator secured the wheelie bins, and Dad made a final trip to check the trampoline.'::text)
    ),
    addresses_misconception = 'Selecting B or H, which the passage does not support (Theo gave commentary, not help with bins; dinner was eaten at home by torchlight), F, since Theo is shown to be excited rather than frightened, or E, since Mum is shown watching the window as though she did not trust it to stay shut.'
where id = 'w2-stormwarning-02'
  and prompt->>'question' = 'Tick 4 boxes that accurately describe things that happened in the passage. A. Dad flattened the trampoline. B. Theo helped carry the bins. C. Mum closed and checked the windows. D. The narrator secured the wheelie bins. E. The family lost power before dinner. F. Theo was frightened by the storm. G. Dad made a final trip to check the trampoline. H. They ate dinner in a restaurant.'
  and prompt->>'modelAnswer' = 'A, C, D, G are all directly stated; E is also true depending on the definition of ''before dinner'' but the clearest four are A, C, D, G.'
  and addresses_misconception = 'Selecting B or H, which the passage does not support (Theo gave commentary, not help with bins; dinner was eaten at home by torchlight), or F, since Theo is shown to be excited rather than frightened.';

commit;
