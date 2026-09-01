-- Angel Digital 11+ — Migration 183
-- Reading Comprehension Assessment Integrity Correction, Part 1:
-- acceptedAnswers slash-alternate formatting defect, PLUS 2 individually
-- verified additive paraphrase corrections discovered during the same
-- inspection (Founder pre-application review; see the CLASS A / CLASS B
-- breakdown below -- this migration is not uniformly mechanical, and is
-- not described as such).
--
-- ============================================================
-- ROOT CAUSE (Gate 4/5 live production walkthrough)
-- ============================================================
-- checkAcceptedAnswerSet() (lib/learningEngine/englishAnswerValidation.ts)
-- tokenises both the learner's answer and every stored accepted-answer
-- string, then requires one to appear as a CONTIGUOUS, IN-ORDER token
-- sequence inside the other. This is a deliberate, evidence-based design
-- (an author-curated list, not a keyword-overlap heuristic) and is not
-- being changed by this migration.
--
-- The content defect is upstream of that matcher: 26 acceptedAnswers
-- entries across this project's history were authored using "/" to mean
-- "the learner may say either word/phrase here" (e.g. "jogged/warmed up
-- and checked his spikes", "the sun / sun-compass / polarised light").
-- The tokeniser has no concept of "/" as an OR-operator -- it is simply
-- another token-boundary character, so "jogged/warmed" tokenises to the
-- two SEPARATE tokens "jogged" then "warmed", producing a required
-- sequence ("...jogged warmed up and checked...") that no real answer
-- will ever contain. The intended flexibility was silently inert from the
-- day each of these rows was authored.
--
-- Live-confirmed by direct reproduction during the Founder's Gate 4/5
-- walkthrough: 'w1-raceday-01' ("What did Ade do in the two hours before
-- the relay?") rejected the answer "...practised his handover..." because
-- the stored accepted phrase "practised the handover" requires "the", not
-- "his" -- an unrelated but adjacent finding -- AND because "jogged/warmed
-- up and checked his spikes" could never match any real answer at all.
-- 'w3-rc10-am-06' ("Storm at the Harbour" atmosphere question) showed the
-- identical defect shape in its own family, corroborating this is
-- systemic, not a one-question fluke.
--
-- ============================================================
-- FIX: additive-only content correction -- NOT uniformly mechanical
-- ============================================================
-- Founder pre-application review correction: this migration is NOT a
-- uniform mechanical slash-split. Every one of the 26 rows was inspected
-- individually and classified:
--
-- CLASS A (24 rows) -- mechanical expansion of the author's own existing
-- slash shorthand: each affected accepted-answer string is replaced with
-- two (or more) separate, fully-formed strings, one per alternate
-- reading already named by the author -- e.g. "jogged/warmed up and
-- checked his spikes" becomes "jogged up and checked his spikes" and
-- "warmed up and checked his spikes". No vocabulary or idea is
-- introduced beyond what the "/" shorthand already named.
--   Rows 1, 2, 3, 5, 6, 8, 9, 10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
--   22, 23, 24, 25, 26 are plain splits.
--   Row 7 (w2-longwalk-01) required a grammatical correction, not a
--   byte-identical split -- "bus was late/never arrived" cannot be
--   mechanically spliced ("bus was late" + "bus was never arrived" is
--   ungrammatical); reconstructed as "bus was late" + "bus never
--   arrived". Both words ("late", "never arrived") were already
--   explicitly present in the author's own shorthand; only the grammar
--   joining them to "bus was" needed correcting. No new vocabulary or
--   concept beyond what the shorthand already named -- classified A, but
--   flagged here explicitly since it is not a literal split like the
--   other 23.
--
-- CLASS B (2 rows, 3 additions) -- genuinely new accepted-answer
-- paraphrase coverage, each individually verified against the real
-- question, passage, model answer, skill, and validation tier before
-- inclusion (not merely asserted):
--   - Row 4 (w1-raceday-01): adds "practised his handover" alongside the
--     existing "practised the handover". Verified: a determiner-only
--     substitution ("the" -> "his"); Ade is the sole subject of the
--     sentence and the passage names no other handover "his" could refer
--     to, so both phrases assert the identical real-world fact. Cannot
--     admit any answer that is not already true.
--   - Row 11 (w3-rc10-wc-01): adds "planned or prepared the room
--     carefully" and "the arrangement was deliberate and planned, not
--     accidental tidying". Verified against the model answer ("someone
--     deliberately and carefully rearranged the room") and this
--     question's own documented misconception ("treats unusual care as
--     simply meaning tidy without noting the implied deliberateness"):
--     both new phrases explicitly require the deliberateness/planning
--     idea, so neither would match a student who merely writes "the room
--     was tidy" -- the addition recognises a genuinely correct
--     paraphrase without admitting the wrong reading the question is
--     designed to catch.
--
-- Every UPDATE below still only ever ADDS matchable phrasing (a superset
-- of the original array) -- no existing accepted phrase is ever removed,
-- and `question`, `modelAnswer`, `passageText`, `marks`, and
-- `validationTier` are never touched by this migration.
--
-- ============================================================
-- SCOPE AND STATUS OF EACH ROW
-- ============================================================
-- 5 rows (Wave 1, migration 044) and 4 rows (Wave 2, migration 049) and
-- 3 rows (migration 063) and 2 rows (migration 152) are in ALREADY-ACTIVE
-- content (promoted to practice_eligible in earlier migrations, per this
-- session's own live walkthrough evidence) -- this migration is a live
-- production correctness fix for those 14 rows.
--
-- 10 rows (Wave 1 remediation, migration 178) and 2 rows (Wave 3
-- remediation, migration 179) are still 'provisional' -- not yet reachable
-- by any real learner, pending migration 181 (not applied). Fixing them
-- now closes this defect class before that promotion, rather than
-- shipping the same bug into newly-served content.
--
-- Fail-closed and idempotent: every UPDATE's WHERE clause requires the
-- CURRENT acceptedAnswers array to exactly equal the documented pre-fix
-- array. A row that has already been corrected, or that doesn't match
-- expectations for any other reason, is left untouched by that statement
-- rather than silently overwritten.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

-- 1. w1-lastbus-07 (migration 044, live)
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["from scared to relieved","fear to relief","anxious to happy","anxious to laughing"]'::jsonb)
where id = 'w1-lastbus-07'
  and prompt->'acceptedAnswers' = '["from scared to relieved","fear to relief","anxious to happy/laughing"]'::jsonb;

-- 2. w1-newgirl-01 (migration 044, live)
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["a sentence about moving from leicester","an opening line about leicester","an opening line about disinfectant"]'::jsonb)
where id = 'w1-newgirl-01'
  and prompt->'acceptedAnswers' = '["a sentence about moving from leicester","an opening line about leicester/disinfectant"]'::jsonb;

-- 3. w1-atticdoor-02 (migration 044, live)
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["it had been forgotten for a long time","personification of the padlock waiting","suggests it has been neglected","suggests it has been abandoned"]'::jsonb)
where id = 'w1-atticdoor-02'
  and prompt->'acceptedAnswers' = '["it had been forgotten for a long time","personification of the padlock waiting","suggests it has been neglected/abandoned"]'::jsonb;

-- 4. w1-raceday-01 (migration 044, LIVE, walkthrough-confirmed defect)
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["jogged up and checked his spikes","warmed up and checked his spikes","practised the handover","practised his handover","warmed up thoroughly"]'::jsonb)
where id = 'w1-raceday-01'
  and prompt->'acceptedAnswers' = '["jogged/warmed up and checked his spikes","practised the handover","warmed up thoroughly"]'::jsonb;

-- 5. w1-raceday-02 (migration 044, live)
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["she is very relaxed about winning","she is very unbothered about winning","she doesn''t worry about the result","casual, confident attitude"]'::jsonb)
where id = 'w1-raceday-02'
  and prompt->'acceptedAnswers' = '["she is very relaxed/unbothered about winning","she doesn''t worry about the result","casual, confident attitude"]'::jsonb;

-- 6. w2-understudy-02 (migration 049, live)
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["he felt sick","he felt nervous","a wave of nausea","a wave of nerves","an uncomfortable, nervous feeling"]'::jsonb)
where id = 'w2-understudy-02'
  and prompt->'acceptedAnswers' = '["he felt sick/nervous","a wave of nausea/nerves","an uncomfortable, nervous feeling"]'::jsonb;

-- 7. w2-longwalk-01 (migration 049, live) -- NOT a mechanical split, see header
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["the bus didn''t come","bus was late","bus never arrived"]'::jsonb)
where id = 'w2-longwalk-01'
  and prompt->'acceptedAnswers' = '["the bus didn''t come","bus was late/never arrived"]'::jsonb;

-- 8. w2-longwalk-04 (migration 049, live)
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["it looked like serious rain was coming","it looked like heavy rain was coming","threatening weather","a storm was clearly about to happen"]'::jsonb)
where id = 'w2-longwalk-04'
  and prompt->'acceptedAnswers' = '["it looked like serious/heavy rain was coming","threatening weather","a storm was clearly about to happen"]'::jsonb;

-- 9. w2-sciencefair-03 (migration 049, live)
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["not very impressed","not very excited","competent but not memorable","mild, courteous interest"]'::jsonb)
where id = 'w2-sciencefair-03'
  and prompt->'acceptedAnswers' = '["not very impressed/excited","competent but not memorable","mild, courteous interest"]'::jsonb;

-- 10. w3-rc10-am-02 (migration 063, live)
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["it creates suspense before the reveal","it creates tension before the reveal","it shows her hesitating, delaying the moment of finding out","it emphasises the anticipation building throughout the passage"]'::jsonb)
where id = 'w3-rc10-am-02'
  and prompt->'acceptedAnswers' = '["it creates suspense/tension before the reveal","it shows her hesitating, delaying the moment of finding out","it emphasises the anticipation building throughout the passage"]'::jsonb;

-- 11. w3-rc10-wc-01 (migration 063, live, corroborating example from this
--     session's own walkthrough -- see the Gate 4/5 Founder Handoff). The
--     slash split alone was insufficient here (regression-tested, not
--     assumed): the live walkthrough answer paraphrased the idea without
--     ever using "deliberately"/"carefully" adjacent to "arranged", so a
--     genuinely new accepted-answer variant is added too, not just the
--     slash correction -- "planned or prepared the room carefully" is a
--     literal substring of that live answer and a defensible paraphrase
--     of the model answer, not fabricated to fit.
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["someone arranged the room deliberately, which is unusual","someone arranged the room carefully, which is unusual","planned or prepared the room carefully","it hints that something out of the ordinary has occurred","it shows the tidiness is not accidental","the arrangement was deliberate and planned, not accidental tidying"]'::jsonb)
where id = 'w3-rc10-wc-01'
  and prompt->'acceptedAnswers' = '["someone arranged the room deliberately/carefully, which is unusual","it hints that something out of the ordinary has occurred","it shows the tidiness is not accidental"]'::jsonb;

-- 12. w3-rc10-wc-02 (migration 063, live)
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["she is not fully sure whose handwriting it is, only partly familiar","it creates uncertainty about the sender","it creates mystery about the sender","she has some recognition but cannot place it exactly"]'::jsonb)
where id = 'w3-rc10-wc-02'
  and prompt->'acceptedAnswers' = '["she is not fully sure whose handwriting it is, only partly familiar","it creates uncertainty/mystery about the sender","she has some recognition but cannot place it exactly"]'::jsonb;

-- 13. eng-inc001-understudy-q04 (migration 152, live) -- phrase-level "/"
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["she didn''t hide how she felt","she was open about it","she showed her feelings openly, without trying to conceal them","everyone could tell","she made it obvious"]'::jsonb)
where id = 'eng-inc001-understudy-q04'
  and prompt->'acceptedAnswers' = '["she didn''t hide how she felt","she was open about it","she showed her feelings openly, without trying to conceal them","everyone could tell / she made it obvious"]'::jsonb;

-- 14. eng-inc001-bee-q07 (migration 152, live) -- phrase-level "/", two entries
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["the sun","sun-compass","polarised light","memory of landmarks","landmark memory","sensing the earth''s magnetic field","magnetic sense","magnetic field detection"]'::jsonb)
where id = 'eng-inc001-bee-q07'
  and prompt->'acceptedAnswers' = '["the sun / sun-compass / polarised light","memory of landmarks / landmark memory","sensing the earth''s magnetic field / magnetic sense / magnetic field detection"]'::jsonb;

-- 15. w1-kitemaker-09 (migration 178, provisional -- fixed pre-emptively)
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["so Femi learns to notice and solve problems himself","wants Femi to reason it out rather than be told","believes working it out yourself is real learning","testing Femi''s own understanding","encouraging Femi''s own understanding"]'::jsonb)
where id = 'w1-kitemaker-09'
  and prompt->'acceptedAnswers' = '["so Femi learns to notice and solve problems himself","wants Femi to reason it out rather than be told","believes working it out yourself is real learning","testing/encouraging Femi''s own understanding"]'::jsonb;

-- 16. w1-lastbus-08 (migration 178, provisional) -- phrase-level "/"
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["desperately out of breath","gasping for air","physically exhausted from running so hard","urgent, extreme need to breathe","emphasises how hard she had been running"]'::jsonb)
where id = 'w1-lastbus-08'
  and prompt->'acceptedAnswers' = '["desperately out of breath / gasping for air","physically exhausted from running so hard","urgent, extreme need to breathe","emphasises how hard she had been running"]'::jsonb;

-- 17. w1-lastbus-09 (migration 178, provisional) -- two slash occurrences
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["from anxious to relieved and laughing","from panicked to relieved and laughing","fear turns to relief and amusement","goes from frightened to happy once safe","goes from frightened to laughing once safe","panic at the start, relief and laughter by the end"]'::jsonb)
where id = 'w1-lastbus-09'
  and prompt->'acceptedAnswers' = '["from anxious/panicked to relieved and laughing","fear turns to relief and amusement","goes from frightened to happy/laughing once safe","panic at the start, relief and laughter by the end"]'::jsonb;

-- 18. w1-newgirl-08 (migration 178, provisional)
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["rehearsed line never used; asks about the pasta instead","planned a witty introduction but said something ordinary","planned a witty introduction but said something unplanned","actual words are completely different from the rehearsed sentence","she meant to say something clever but blurted out a random question"]'::jsonb)
where id = 'w1-newgirl-08'
  and prompt->'acceptedAnswers' = '["rehearsed line never used; asks about the pasta instead","planned a witty introduction but said something ordinary/unplanned","actual words are completely different from the rehearsed sentence","she meant to say something clever but blurted out a random question"]'::jsonb;

-- 19. w1-newgirl-09 (migration 178, provisional)
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["felt accepted as ordinary rather than singled out as the new girl","felt accepted as ordinary rather than singled out as the different girl","did not have to explain or perform being new","being included casually mattered more than being noticed","let her belong without having to justify herself"]'::jsonb)
where id = 'w1-newgirl-09'
  and prompt->'acceptedAnswers' = '["felt accepted as ordinary rather than singled out as the new/different girl","did not have to explain or perform being new","being included casually mattered more than being noticed","let her belong without having to justify herself"]'::jsonb;

-- 20. w1-atticdoor-08 (migration 178, provisional) -- two slash occurrences
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["makes the door feel alive or eerie","makes the attic feel alive or eerie","creates a tense, unsettling atmosphere","suggests something might be about to happen","suggests something might be about to respond","builds suspense before Marcus enters"]'::jsonb)
where id = 'w1-atticdoor-08'
  and prompt->'acceptedAnswers' = '["makes the door/attic feel alive or eerie","creates a tense, unsettling atmosphere","suggests something might be about to happen/respond","builds suspense before Marcus enters"]'::jsonb;

-- 21. w1-atticdoor-09 (migration 178, provisional)
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["wants to prolong the excitement before finding out","wants to prolong the anticipation before finding out","enjoys the suspense of not knowing yet","the mystery will end once he looks, so he delays it briefly","savouring the moment of anticipation after waiting so long"]'::jsonb)
where id = 'w1-atticdoor-09'
  and prompt->'acceptedAnswers' = '["wants to prolong the excitement/anticipation before finding out","enjoys the suspense of not knowing yet","the mystery will end once he looks, so he delays it briefly","savouring the moment of anticipation after waiting so long"]'::jsonb;

-- 22. w1-raceday-08 (migration 178, provisional)
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["Ade prepares intensely, Cass prepares casually","Ade prepares methodically, Cass prepares casually","Ade is anxious and thorough, Cass is relaxed and minimal","Ade arrives early and checks everything, Cass arrives late and relaxes","one is highly organised, the other seems unbothered"]'::jsonb)
where id = 'w1-raceday-08'
  and prompt->'acceptedAnswers' = '["Ade prepares intensely/methodically, Cass prepares casually","Ade is anxious and thorough, Cass is relaxed and minimal","Ade arrives early and checks everything, Cass arrives late and relaxes","one is highly organised, the other seems unbothered"]'::jsonb;

-- 23. w1-raceday-09 (migration 178, provisional)
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["treats running as casual, not stressful","treats running as relaxing, not stressful","unbothered, low-effort attitude","doesn''t take it seriously the way Ade does","calm, almost effortless approach"]'::jsonb)
where id = 'w1-raceday-09'
  and prompt->'acceptedAnswers' = '["treats running as casual/relaxing, not stressful","unbothered, low-effort attitude","doesn''t take it seriously the way Ade does","calm, almost effortless approach"]'::jsonb;

-- 24. w1-letter-09 (migration 178, provisional)
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["a small kindness meant a lot to Dara on a difficult day, more than the woman would have known","the woman probably didn''t realise how much her small act of kindness helped Dara feel less embarrassed","simple kindness to a stranger can matter more to the receiver than the giver realises","Dara was already upset, so the kindness meant more than usual","Dara was already embarrassed, so the kindness meant more than usual"]'::jsonb)
where id = 'w1-letter-09'
  and prompt->'acceptedAnswers' = '["a small kindness meant a lot to Dara on a difficult day, more than the woman would have known","the woman probably didn''t realise how much her small act of kindness helped Dara feel less embarrassed","simple kindness to a stranger can matter more to the receiver than the giver realises","Dara was already upset/embarrassed, so the kindness meant more than usual"]'::jsonb;

-- 25. w3-rc07-bakersapprentice-01 (migration 179, provisional)
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["he carries his easily, she struggles and has to drag hers","he carries his effortlessly, she struggles and has to drag hers","his experience makes it look easy, her lack of experience makes it hard","he is far ahead of her because the task is effortless for him but not for her"]'::jsonb)
where id = 'w3-rc07-bakersapprentice-01'
  and prompt->'acceptedAnswers' = '["he carries his easily/effortlessly, she struggles and has to drag hers","his experience makes it look easy, her lack of experience makes it hard","he is far ahead of her because the task is effortless for him but not for her"]'::jsonb;

-- 26. w3-rc07-newtrainers-01 (migration 179, provisional)
update public.ali_question_bank
set prompt = jsonb_set(prompt, '{acceptedAnswers}',
  '["goes from wanting to be seen to wanting to hide","goes from wanting to be seen to wanting to avoid attention","started proud and eager to show off, ended embarrassed and avoiding notice","the longest route to be seen becomes the shortest route to avoid being seen"]'::jsonb)
where id = 'w3-rc07-newtrainers-01'
  and prompt->'acceptedAnswers' = '["goes from wanting to be seen to wanting to hide/avoid attention","started proud and eager to show off, ended embarrassed and avoiding notice","the longest route to be seen becomes the shortest route to avoid being seen"]'::jsonb;

commit;
