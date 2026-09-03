-- Angel Digital 11+ — Migration 198
-- Angel Programme Completion, Increment 005 (Founder directive) — two new
-- Continuous Writing candidate prompts, closing the disclosed SUBJECT-FOCUS
-- and TENSE/STRUCTURE gaps the Increment 005 inventory reconciliation
-- found, not merely two more topics on the existing shapes.
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Increment 005's reconciliation of the complete real Writing inventory
-- (all 11 rows ever authored across migrations 013/098/153/167/169/196)
-- found a genuine, quantified duplication pattern the Founder's own
-- instruction explicitly warned against: 6 of 11 rows are structurally
-- "recount a single real personal event, chronologically" (mindchange,
-- kindness, mistakelearned, newplace, difficulttask -- all literally
-- opening "Write about a time..."), 3 are "form/state an opinion on a
-- societal question" (cookopinion, screentime, pocketmoney), 3 are
-- "describe a place and explain why it matters" (favouriteplace,
-- meaningfulplace, and wrt-003's persuasive-speech register is a fourth,
-- distinct but quality-flagged shape). Every single row, without
-- exception, is RETROSPECTIVE (about something that has already
-- happened or already exists) and EVENT/PLACE-centred. Zero rows centre
-- a PERSON as the subject; zero rows ask the learner to genuinely
-- project forward rather than recount backward.
--
-- Both new prompts stay within QT-WC-01a (Reflective/Discursive Response
-- Prompt) -- the ONE CSSE-evidenced Writing question type (Confidence
-- HIGH, EMC-3, per CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md, migration
-- 098's own evidence basis, reused unchanged here: format position always
-- Question 1, structural demand reflective/discursive, no stimulus image,
-- consistent 3/3 known real years). QT-WC-01b (picture-stimulus
-- narrative) is deliberately NOT attempted -- no image-asset pipeline
-- exists anywhere in this codebase (re-confirmed this session).
--   1. "Someone Who Has Made a Difference to You" -- a person-centred
--      reflective prompt (portrait + one specific illustrative anecdote +
--      justification), genuinely distinct from every existing row: it is
--      the first prompt in the whole inventory whose subject is a PERSON
--      rather than an event, a place, or a societal question.
--   2. "Something You Would Like to Learn" -- a forward-looking,
--      imaginative-projection prompt (what it is and why it interests
--      you, then one specific imagined future moment of doing it),
--      genuinely distinct from every existing row: it is the first prompt
--      in the whole inventory that is prospective rather than
--      retrospective. Structurally closest to "An Invented Place"
--      (migration 167) -- both require imagining one specific moment
--      rather than reporting a real past event -- but that prompt invents
--      an external fictional place, while this one imagines the
--      learner's own real, plausible future, a genuinely different
--      imaginative demand.
--
-- ============================================================
-- ASSESSMENT INSTRUCTION vs. ANGEL COACHING GUIDANCE
-- ============================================================
-- Per this session's own re-confirmation of prior increments' finding:
-- "Write at least six sentences" is genuine CSSE-evidenced assessment
-- instruction (writingRubric.ts's own MINIMUM_SENTENCE_COUNT, sourced
-- from CONTINUOUS_WRITING_EVIDENCE_REVIEW_V1.md §1, found across 3/3
-- real past-paper years) -- retained, unchanged, as the first checklist
-- item on both new prompts, with the spelling/punctuation proofreading
-- check retained as the final item. Every OTHER checklist item is
-- explicitly Angel's own coaching scaffolding, never worded as if it
-- were an authentic CSSE exam instruction. Both new prompts are also
-- immediately registered in lib/writing/supportLevelPolicy.ts's
-- WRITING_CHECKLIST_ITEM_SUPPORT_LEVELS table (this session's own code
-- change, see the Increment 005 report) -- this migration does not ship
-- ahead of that classification the way migration 196's two rows
-- previously did.
--
-- eligibility_status = 'authentic_assessment_candidate' on both rows --
-- NOT 'practice_eligible'. See migration 199 for the pending-independent-
-- review placeholder record. No existing row is read, referenced, or
-- modified. No mock_eligible or Mathematics Mock 1 row is touched.
--
-- Idempotent: the INSERT uses "on conflict (id) do nothing".
--
-- NOT APPLIED. Generated for independent-reviewer and Founder inspection
-- via Supabase Dashboard > SQL Editor > New query.

begin;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('eng-pc005-writing-personinfluence', 'writing', 'QT-WC-01a', array['csse'], 'hard', 'open-response', 1500,
 $json${"id":"eng-pc005-writing-personinfluence","title":"Someone Who Has Made a Difference to You","prompt":"Think of a person who has genuinely made a difference to you -- it could be a family member, a teacher, a friend, or someone else entirely. Write about who they are, what they are like, and describe one specific moment or example that shows the difference they have made. Explain why it has mattered to you.","type":"descriptive","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Describe the person with specific, real detail -- not just a list of qualities like 'kind' or 'funny' with nothing to show them","Include one specific moment or example that actually shows the difference they have made, not only a general statement that they have","Explain clearly why this has mattered to you personally","Organise your writing into clear paragraphs","Check your spelling and punctuation before you finish"]}$json$,
 'Programme Completion Increment 005 (Founder directive). QT-WC-01a (Reflective/Discursive Response Prompt), competency WC-01, family mock-writing-wc01a-personinfluence. Evidence: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md, Confidence HIGH, EMC-3 (format position and reflective/discursive demand consistent 3/3 years; topic content itself genuinely unpredictable, per the Framework''s own limitation note) -- the same evidence basis every prior QT-WC-01a row already relies on; no new archetype invented, no QT-WC-01b (picture-stimulus) attempted. Prompt shape: person-centred portrait plus one illustrative anecdote plus justification -- the first row in the whole 11-prompt inventory whose subject is a person rather than an event, a place, or a societal opinion question.', 3, 'eng-pc005-writing-personinfluence',
 'mock-writing-wc01a-personinfluence', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Listing generic qualities about the person (''kind'', ''funny'', ''helpful'') with no specific moment or example to show them, or describing an event involving the person without ever explaining why it mattered personally -- leaving the prompt''s required combination of portrait, evidence, and justification only partly answered.',
 'MIXED_TRANSFER'),

('eng-pc005-writing-somethingnew', 'writing', 'QT-WC-01a', array['csse'], 'hard', 'open-response', 1500,
 $json${"id":"eng-pc005-writing-somethingnew","title":"Something You Would Like to Learn","prompt":"Think of something you would genuinely like to learn how to do -- it doesn't have to be connected to school, and you don't have to be good at it already. Write about what it is and why it interests you, then imagine what it might actually be like once you could do it -- picture one specific moment where you are doing it.","type":"narrative","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Explain clearly what you would like to learn and why it genuinely interests you, not just that it 'sounds fun'","Imagine one specific, particular moment of actually doing it -- what you would see, hear, or notice -- not a vague general statement like 'I'd be really good at it'","Keep your imagined moment realistic and believable, not an impossible or exaggerated version of yourself","Organise your writing so the order makes sense: what it is and why first, then the imagined moment","Check your spelling and punctuation before you finish"]}$json$,
 'Programme Completion Increment 005 (Founder directive). QT-WC-01a (Reflective/Discursive Response Prompt), competency WC-01, family mock-writing-wc01a-somethingnew. Evidence: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md, Confidence HIGH, EMC-3 (as above) -- the same evidence basis every prior QT-WC-01a row already relies on; no new archetype invented, no QT-WC-01b (picture-stimulus) attempted. Prompt shape: forward-looking imaginative projection of the learner''s own real, plausible future -- the first row in the whole 11-prompt inventory that is prospective rather than retrospective. Structurally closest to eng-inc003-writing-imaginedplace-01 (migration 167, both require imagining one specific moment rather than reporting a real past event) but genuinely distinct: that prompt invents an external fictional place, this one imagines the learner''s own real future.', 3, 'eng-pc005-writing-somethingnew',
 'mock-writing-wc01a-somethingnew', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Naming the skill and stopping there without ever imagining a specific moment of actually doing it, or describing an implausible/exaggerated version of success rather than a believable, particular moment -- leaving the prompt''s required imaginative-projection element unaddressed.',
 'FAR_TRANSFER')
on conflict (id) do nothing;

commit;
