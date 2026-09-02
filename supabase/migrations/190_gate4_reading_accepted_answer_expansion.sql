-- Angel Digital 11+ — Migration 190
-- Gate 4 (Learner Journey Completion), Bounded Reading Scoring Correction.
--
-- ============================================================
-- ROOT CAUSE (Gate 4 live production Reading session, Profile B)
-- ============================================================
-- Two TIER2_ACCEPTED_SET questions rejected genuinely correct, well-formed
-- learner responses because checkAcceptedAnswerSet() (lib/learningEngine/
-- englishAnswerValidation.ts) requires an accepted phrase to appear as an
-- exact, contiguous, in-order token sequence -- this rule is unchanged by
-- this migration and is working exactly as designed (see that file's own
-- doc comment: "a curated list, not a generic keyword-overlap heuristic").
-- The defect is content-authoring, not code: each question's curated
-- accepted answers are short, rigidly-worded single clauses that do not
-- anticipate a natural, additive learner paraphrase.
--
-- 'w3-rc10-am-02' ("The Empty Classroom", family wave3-fam-rc10-atmosphere-
-- mood): learner answer "To build suspense and tension, showing how
-- nervous and alert Maya feels in the unnerving silence before she finds
-- out what is in the envelope" was rejected. It matches the question and
-- model answer ("It builds suspense by holding the reader in the moment of
-- anticipation, emphasising Maya's hesitation and the tension of not yet
-- knowing what the envelope contains") in substance -- suspense/tension,
-- Maya's heightened state, and the before-the-reveal structure are all
-- present -- but none of the CURRENT four accepted phrases (this row was
-- already corrected once, by migration 183's slash-alternate correction,
-- from three phrases including "it creates suspense/tension before the
-- reveal" to the four below) appear as a contiguous run inside it: the
-- learner's own "suspense and tension" does not match either the isolated
-- "suspense before the reveal" or "tension before the reveal" phrase
-- contiguously, since "and" sits between them.
--
-- 'w3-rc10-wc-07' ("The New Trainers", family wave3-fam-rc10-word-choice,
-- untouched by any migration since 063): learner answer "It suggests he
-- was proud of his new trainers and wanted people to notice and admire
-- them" was rejected despite being an extremely close paraphrase of the
-- model answer ("It suggests Jayden felt proud of his new trainers and
-- wanted other people to notice them") -- the single inserted word
-- "admire" breaks the contiguous match against the accepted phrase "he
-- wanted people to notice his new trainers".
--
-- ============================================================
-- BOUNDED SIBLING CHECK (per the governing instruction — inspected, not
-- audited or corrected further)
-- ============================================================
-- All 13 sibling rows across these two exact families (wave3-fam-rc10-
-- atmosphere-mood: am-01..am-06; wave3-fam-rc10-word-choice: wc-01..wc-07)
-- share the identical structural pattern: exactly three short, rigidly-
-- worded accepted answers each, with no tolerance for additive elaboration
-- or a different lead-in clause. This confirms the SAME omission pattern
-- is structurally present family-wide, not a one-off typo on these two
-- rows. It is disclosed here, not corrected here: only these two rows have
-- a PROVEN false negative from a real learner response; the other 11 have
-- not been tested and are not touched by this migration, per the governing
-- instruction not to broaden this into another audit.
--
-- ============================================================
-- FIX
-- ============================================================
-- One additional accepted answer is appended to each row's existing
-- acceptedAnswers array (am-02's current four items; wc-07's original
-- three) -- a close paraphrase of the actual rejected (and genuinely
-- correct) learner response, expanding the curated representation rather
-- than weakening the Tier 2 matching rule itself. Every existing accepted
-- answer, question, modelAnswer, and every other field is completely
-- unchanged.
--
-- Fail-closed and idempotent: each WHERE clause requires the CURRENT
-- `prompt->'acceptedAnswers'` and `prompt->>'question'` to exactly equal
-- their documented pre-fix values.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

update public.ali_question_bank
set
  prompt = jsonb_set(
    prompt,
    '{acceptedAnswers}',
    '["it creates suspense before the reveal","it creates tension before the reveal","it shows her hesitating, delaying the moment of finding out","it emphasises the anticipation building throughout the passage","build suspense and tension"]'::jsonb
  )
where id = 'w3-rc10-am-02'
  and prompt->'acceptedAnswers' = '["it creates suspense before the reveal","it creates tension before the reveal","it shows her hesitating, delaying the moment of finding out","it emphasises the anticipation building throughout the passage"]'::jsonb
  and prompt->>'question' = 'Why might the writer choose to end the passage with Maya "listening to nothing at all" just before she turns the envelope over?';

update public.ali_question_bank
set
  prompt = jsonb_set(
    prompt,
    '{acceptedAnswers}',
    '["he was proud and wanted to show them off","he wanted people to notice his new trainers","he felt excited and eager for attention","he was proud of his new trainers and wanted people to notice and admire them"]'::jsonb
  )
where id = 'w3-rc10-wc-07'
  and prompt->'acceptedAnswers' = '["he was proud and wanted to show them off","he wanted people to notice his new trainers","he felt excited and eager for attention"]'::jsonb
  and prompt->>'question' = 'Jayden "spent the whole morning walking very deliberately past groups of people, taking the longest possible route between lessons." What does this suggest about how Jayden felt about his new trainers?';

commit;
