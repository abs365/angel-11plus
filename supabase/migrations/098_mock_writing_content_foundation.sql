-- Angel Digital 11+ — Migration 098
-- Mock Programme Increment 006, English Mock Content Foundation, Batch 001
-- (Track B) — Continuous Writing Content Foundation.
--
-- Adds 3 new, genuinely-authored Continuous Writing candidate prompts to
-- public.ali_question_bank (subject = 'writing'), begun in the SAME
-- increment as migration 097's Comprehension content, per the explicit
-- directive not to leave Writing until after a large Comprehension bank
-- exists (Decision 138 Part 6's own finding: Writing carried essentially
-- zero content -- 1 row total, 0 practice_eligible -- before this batch).
--
-- QUESTION TYPE: QT-WC-01a (Reflective/Discursive Response Prompt) only.
-- Evidence: docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md §5,
-- Confidence HIGH, EMC-3 (format position -- always Question 1 -- and
-- structural demand -- reflective/discursive, no stimulus image --
-- consistent 3/3 years; capped below EMC-4 because topic content itself
-- is genuinely unpredictable, per the Framework's own limitation note).
--
-- GENUINE EVIDENCE GAP, DISCLOSED RATHER THAN FILLED: QT-WC-01b
-- (Picture-Stimulus Narrative Prompt, always Question 2, "Write a story
-- based on the picture below," HIGH/EMC-4) is NOT authored by this
-- migration. `types/index.ts`'s own WritingPrompt interface has no image
-- field, and no image-asset pipeline exists anywhere in this codebase for
-- Writing content (confirmed by direct search this session) -- authoring
-- a prompt that CLAIMS to be picture-stimulus without an actual attached
-- image would misrepresent the evidenced format rather than fill the gap
-- honestly. This is a genuine, disclosed shortfall for a future,
-- separately-scoped increment (an image-asset mechanism is infrastructure
-- work, not content authoring), not something this migration works around
-- by inventing a text-only substitute.
--
-- GENUINE STRUCTURAL DIVERSITY, NOT SUPERFICIAL TOPIC SUBSTITUTION: the
-- three prompts below deliberately use three different underlying prompt
-- SHAPES the Framework's own evidence base actually shows recurring, not
-- three copies of one shape with a different noun swapped in --
-- (1) a personal-change narrative ("a time you changed your mind" --
-- before/turning-point/after structure); (2) a personal-experience
-- narrative centred on a single relationship/emotion (kindness given or
-- received); (3) a direct opinion-question format, mirroring CSSE-009's
-- own real 2022 prompt shape ("Do you think that food can change a
-- person's mood?") almost structurally exactly, with a different genuine
-- topic. A learner who has written to one of these three could not simply
-- reuse the same response structure for either of the other two.
--
-- AI-SCORING BOUNDARY, UNTOUCHED: `app/api/writing-feedback/route.ts`,
-- `WRITING_CORRECTNESS_THRESHOLD`, and the `supportTier: "supported"`
-- mastery-quarantine gate (Decisions 47/60/61/106) are not read, imported,
-- referenced, or modified anywhere in this migration or its sibling test
-- file -- confirmed by a dedicated grep this session finding zero matches
-- for any of those identifiers outside their own existing files. No new
-- prompt here is wired to, exempted from, or given special treatment by
-- that AI-scoring/quarantine boundary; it inherits the existing, unedited
-- discipline automatically, the same way every other 'writing' subject row
-- already does.
--
-- eligibility_status = 'authentic_assessment_candidate' on every row --
-- NOT 'independently_validated', NOT 'mock_eligible'. See migration 099
-- for the pending-review placeholder record (review_target_type =
-- 'writing_prompt', review_type = 'mock_writing_prompt_independent_review'
-- -- one row per prompt, per migration 087's own "a Continuous Writing
-- prompt's own id, its own distinct reviewable unit" design). No review
-- approval of any kind is granted by this migration.
--
-- No hidden model answer: `checklist` entries describe structural/
-- technique expectations only (matching wrt-003's own established
-- convention, migration 013), never a pre-written sample response a
-- learner could copy.
--
-- Practice isolation: no existing ali_question_bank row (including the
-- one existing 'writing' subject row, wrt-003, migration 013) is read,
-- referenced, or modified by this migration. Every id below is new.
--
-- Idempotent: the INSERT uses "on conflict (id) do nothing".
--
-- NOT APPLIED. Generated for independent-reviewer and Founder inspection
-- via Supabase Dashboard > SQL Editor > New query, after migration 097
-- has already been applied (no ordering dependency between them beyond
-- both following migration 094).

begin;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values

('mock-writing-mindchange-01', 'writing', 'QT-WC-01a', array['csse'], 'hard', 'open-response', 1500,
 $json${"id":"mock-writing-mindchange-01","title":"A Time You Changed Your Mind","prompt":"Write about a time when you changed your mind about something -- it could be an opinion, a person, a place, or an activity. Explain what you originally thought, what happened to change your thinking, and how you feel about it now.","type":"descriptive","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Clearly state what you originally thought or believed, near the start","Describe a specific moment, event, or piece of evidence that changed your thinking -- not just a vague 'then I changed my mind'","Explain HOW your thinking changed, not only THAT it changed","End with a clear statement of how you think or feel about it now","Use your own genuine voice -- first person, personal reflection","Check paragraphing, spelling, and punctuation carefully"]}$json$,
 'Mock Programme Increment 006, English Batch 001 (Track B). QT-WC-01a (Reflective/Discursive Response Prompt), competency WC-01, family mock-writing-wc01a-mindchange. Evidence: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md Confidence HIGH, EMC-3 (format position and reflective/discursive demand consistent 3/3 years; topic content itself genuinely unpredictable, per the Framework''s own limitation). Prompt shape: personal-change narrative (before/turning-point/after), genuinely distinct from the other two prompts in this batch.', 3, 'mock-writing-mindchange-01',
 'mock-writing-wc01a-mindchange', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Producing a vague, generic reflection ("I used to think X, now I think Y") with no specific moment, event, or piece of evidence that actually caused the change -- the marker cannot credit reflection that is asserted rather than substantiated.',
 'FAR_TRANSFER'),

('mock-writing-kindness-01', 'writing', 'QT-WC-01a', array['csse'], 'hard', 'open-response', 1500,
 $json${"id":"mock-writing-kindness-01","title":"An Act of Kindness","prompt":"Write about a time when someone did something kind for you, or a time when you did something kind for someone else. Explain what happened and why it mattered to you.","type":"descriptive","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Describe the specific situation clearly -- who was involved, and what actually happened","Explain what made the act feel kind, rather than simply asserting that it was","Explain why it mattered to you personally, not only what happened","Use precise, well-chosen vocabulary rather than repeating the word 'kind' throughout","Organise your writing into clear paragraphs","Check spelling and punctuation carefully"]}$json$,
 'Mock Programme Increment 006, English Batch 001 (Track B). QT-WC-01a, competency WC-01, family mock-writing-wc01a-kindness. Evidence: Confidence HIGH, EMC-3 (as above). Prompt shape: single-relationship/emotion personal-experience narrative, genuinely distinct in structure from the other two prompts in this batch (no before/after turning-point structure, no direct opinion-question framing).', 3, 'mock-writing-kindness-01',
 'mock-writing-wc01a-kindness', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Describing the event only from the outside (what happened) without ever explaining why it mattered personally, leaving the required reflective/emotional dimension of the prompt unaddressed.',
 'FAR_TRANSFER'),

('mock-writing-cookopinion-01', 'writing', 'QT-WC-01a', array['csse'], 'hard', 'open-response', 1500,
 $json${"id":"mock-writing-cookopinion-01","title":"Should Everybody Learn to Cook?","prompt":"Do you think everybody should learn to cook, even if they don't enjoy it? Write about your own opinion, using your own experience or things you have noticed to support what you think.","type":"descriptive","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","State your own opinion clearly, near the start","Support your opinion with your own experience or something you have genuinely noticed, not a generic list of reasons","Consider, briefly, why someone might disagree with you","Keep a consistent personal voice throughout, since this is your own opinion, not a formal debate speech","Organise your writing into clear paragraphs","Check spelling and punctuation carefully"]}$json$,
 'Mock Programme Increment 006, English Batch 001 (Track B). QT-WC-01a, competency WC-01, family mock-writing-wc01a-cookopinion. Evidence: Confidence HIGH, EMC-3 (as above). Prompt shape: direct opinion-question format, mirroring CSSE-009''s own real 2022 prompt shape ("Do you think that food can change a person''s mood?") closely, with a genuinely different topic -- not a persuasive-speech reframing like the existing wrt-003 row (migration 013), which this migration does not modify.', 3, 'mock-writing-cookopinion-01',
 'mock-writing-wc01a-cookopinion', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Treating the prompt as a formal persuasive-speech task (rhetorical devices, addressing an audience directly) rather than the reflective, first-person opinion piece QT-WC-01a''s own evidence actually shows -- that register belongs to a different, already-existing prompt (wrt-003), not this one.',
 'FAR_TRANSFER')
on conflict (id) do nothing;

commit;
