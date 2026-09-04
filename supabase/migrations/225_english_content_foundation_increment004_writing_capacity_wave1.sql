-- Angel Digital 11+ — Migration 225
-- English Content Foundation, Increment 004 — Continuous Writing
-- Sustainable Capacity Wave 1 (Programme Increment 023).
--
-- Adds 3 new WC-01 (QT-WC-01a, Reflective/Discursive Response Prompt)
-- Continuous Writing prompts, derived from the Writing Capacity Contract
-- established this increment (see INCREMENT023_WRITING_CAPACITY_FOUNDER_REVIEW.md):
-- Continuous Writing's real, evidenced problem is not merely "7 prompts"
-- but zero difficulty range (all 7 existing rows are stored 'hard') and a
-- content pool small enough that even a moderately regular learner
-- exhausts it within weeks. This wave adds genuine ACCESSIBLE and
-- STANDARD difficulty tiers for the first time, plus one further
-- DEMANDING-tier prompt using a structurally distinct challenge shape
-- from the three existing 'hard' prompts.
--
-- Each prompt's own header cell below states, on real evidence, what
-- makes it a genuinely different writing EXPERIENCE from all 7 existing
-- practice-eligible prompts — never a surface topic swap.
--
-- Eligibility follows the exact real precedent this repo already
-- established for Writing content (migrations 153, 169): new prompts
-- enter at 'authentic_assessment_candidate', never directly at
-- 'practice_eligible' — Founder + independent review (migration 226,
-- prepared separately) must occur first, exactly as migration 169's own
-- 2 rows required before migration 172/203 promoted them. NOT skipped
-- merely because Writing's inventory is small.
--
-- Zero existing rows are touched. Zero eligibility changes. Zero Mock
-- content/composition touched — subject/pathway/skill exactly mirror
-- migration 153/169's own real values (subject 'writing', pathway
-- ['csse'], skill 'QT-WC-01a'), and no ali_mock_form row is created or
-- referenced anywhere below.
--
-- Founder Decision Record (additive): Founder educational review APPROVED
-- WITH AMENDMENT. Candidate 1 (skillproud-01) APPROVED unchanged.
-- Candidates 2 (notgotoplan-01) and 3 (advice-01) APPROVED WITH AMENDMENT
-- -- both amended below, per-row rationale in each row's own comment/
-- explanation column. Amendment verification: AWAITING FOUNDER.
--
-- NOT APPLIED. Founder must apply via Supabase Dashboard > SQL Editor,
-- after independent Founder educational review of this increment's own
-- review pack. Migration 226 (pending independent review registration)
-- should be applied together with, or immediately after, this one —
-- matching migration 169+172's own established pairing.

begin;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values

-- === skillproud-01 — ACCESSIBLE (easy). Fills the total absence of any
-- genuinely lower-planning-demand entry point: no time-arc (unlike
-- newplace/mistakelearned), no invention (unlike imaginedplace), no
-- perspective-weighing (unlike pocketmoney), no imagined future moment
-- (unlike somethingnew) — a stable, present-tense self-description with
-- the lowest real planning/structural demand in the pool. ===
('eng-inc004-writing-skillproud-01', 'writing', 'QT-WC-01a', array['csse'], 'easy', 'open-response', 1500,
 $json${"id":"eng-inc004-writing-skillproud-01","title":"A Skill You're Proud Of","prompt":"Write about something you have learned to do well, however big or small it feels -- it could be a sport, a hobby, a household skill, or something else entirely. Describe how you learned it and what it feels like to be able to do it now.","type":"descriptive","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Name a specific skill, not a vague claim like 'I'm good at lots of things'","Describe at least one specific moment or method that shows how you actually learned it","Explain clearly what it feels like to be able to do it now","Organise your writing into clear paragraphs","Check your spelling and punctuation before you finish"]}$json$,
 'Programme Increment 023, Continuous Writing Sustainable Capacity Wave 1 (Writing Capacity Contract). QT-WC-01a (Reflective/Discursive Response Prompt), competency WC-01, family eng-inc004-writing-wc01a-skillproud. Prompt shape: steady-state personal-capability description -- no time-arc, no invention, no perspective-weighing -- deliberately the lowest real planning/structural demand of any prompt in the pool, filling the ACCESSIBLE-tier gap (all 7 existing rows are stored hard; none offer a genuinely lower-demand entry point). Genuinely distinct from every existing prompt on real cognitive/structural grounds, not merely a different topic.', 3, 'eng-inc004-writing-skillproud-01',
 'eng-inc004-writing-wc01a-skillproud', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Listing several skills in general terms (''I''m good at football, drawing and maths'') instead of choosing one specific skill and describing it in real detail.',
 'ROUTINE'),

-- === notgotoplan-01 — STANDARD (medium). Founder Amendment (Increment 023
-- educational review): the original wording did not sufficiently prevent
-- overlap with mistakelearned-01 -- a self-caused mistake could equally
-- satisfy "didn't go the way you expected." Amended to require an
-- externally-caused change ("outside your control"), explicitly not the
-- writer's own doing, and to drop any "what did you learn"/"what would
-- you do differently" framing -- this tests adaptation in the moment,
-- never retrospective self-judgement (mistakelearned-01's own territory).
-- A safeguarding line is added, matching mistakelearned-01's own
-- established tone, phrased positively per the Founder's own preference. ===
('eng-inc004-writing-notgotoplan-01', 'writing', 'QT-WC-01a', array['csse'], 'medium', 'open-response', 1500,
 $json${"id":"eng-inc004-writing-notgotoplan-01","title":"Something That Didn't Go to Plan","prompt":"Write about a time when your plans changed because of something outside your control -- perhaps the weather, a cancellation, something going missing, or an activity turning out differently from what you expected. Explain what changed, what you did when it happened, and what happened afterwards.","type":"descriptive","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Describe a specific, genuine situation where something changed unexpectedly, not because of something you did","Explain clearly what changed, and what caused it","Describe what you actually did when it happened, not only how you felt about it","Choose something you feel comfortable writing about -- it doesn't need to be private, upsetting or serious","Organise your writing into clear paragraphs","Check paragraphing, spelling and punctuation carefully"]}$json$,
 'Programme Increment 023, Continuous Writing Sustainable Capacity Wave 1 (Writing Capacity Contract). QT-WC-01a (Reflective/Discursive Response Prompt), competency WC-01, family eng-inc004-writing-wc01a-notgotoplan. Prompt shape: externally-caused-disruption-plus-adaptive-response narrative. Founder Amendment (Increment 023 educational review): re-worded to require the cause be explicitly "outside your control" and "not because of something you did", structurally excluding a self-caused mistake as the qualifying event -- genuinely distinct from mistakelearned-01''s self-caused-error structure (not merely intended to be, per the original wording''s own real weakness, found and disclosed) and from newplace-01''s sustained arrival arc. Moderate planning (one specific disruption + one specific adaptation) and moderate structure (setup -> disruption -> response -> outcome), matching the STANDARD tier of the Writing Capacity Contract. No "lesson learned"/"what would you do differently" element is required -- this tests adaptation, never retrospective self-judgement.', 3, 'eng-inc004-writing-notgotoplan-01',
 'eng-inc004-writing-wc01a-notgotoplan', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Choosing a self-caused mistake as the "thing that changed" rather than a genuinely external, unchosen disruption -- collapsing this task back into a mistake-and-lesson narrative rather than an adaptation narrative.',
 'NEAR_TRANSFER'),

-- === advice-01 — DEMANDING (hard). A third, structurally distinct route
-- to the DEMANDING tier alongside imaginedplace-01 (invention +
-- consistency) and pocketmoney-01 (given-perspective-weighing): this
-- requires synthesis across MULTIPLE past experiences into general,
-- transferable insight, with genuine audience-awareness (writing FOR an
-- imagined younger reader) -- the highest real planning/structural
-- demand of any Writing prompt in the pool. Founder Amendment (Increment
-- 023 educational review): "ordinary, everyday" added to the prompt
-- itself, plus a safeguarding checklist line matching mistakelearned-01's
-- own established tone -- the demanding synthesis/audience/explanation
-- requirements are all preserved unchanged; only the scope of what
-- counts as valid experience is bounded. ===
('eng-inc004-writing-advice-01', 'writing', 'QT-WC-01a', array['csse'], 'hard', 'open-response', 1500,
 $json${"id":"eng-inc004-writing-advice-01","title":"Advice for Someone Younger","prompt":"Imagine talking to someone a few years younger than you who is about to join your school or your class. Write the advice you would genuinely give them, based on ordinary, everyday things you have actually experienced. Explain why each piece of advice matters, using something real that happened to you.","type":"descriptive","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Give at least two separate pieces of advice, not only one","For each piece of advice, refer to something real that actually happened to you, not a generic saying","Explain clearly why each piece of advice matters, not only what it is","Choose ordinary, everyday experiences -- you don't need to write about anything private, upsetting or serious","Write in a genuine, encouraging voice, as if speaking to a real younger person, not as a formal list with no explanation","Organise your writing into clear paragraphs","Check your spelling and punctuation before you finish"]}$json$,
 'Programme Increment 023, Continuous Writing Sustainable Capacity Wave 1 (Writing Capacity Contract). QT-WC-01a (Reflective/Discursive Response Prompt), competency WC-01, family eng-inc004-writing-wc01a-advice. Prompt shape: synthesis-across-multiple-experiences-for-an-implied-audience -- genuinely distinct from every existing prompt, all of which centre on a SINGLE topic, event or comparison; this requires selecting and connecting several past experiences into general, transferable insight while maintaining audience-awareness, matching the DEMANDING tier alongside imaginedplace-01 and pocketmoney-01 via a third, structurally distinct route to that same challenge level. Founder Amendment (Increment 023 educational review): "ordinary, everyday" bounds the scope of valid experience without reducing the synthesis, audience-awareness, or explanation demand this tier depends on -- the requirement for 2+ pieces of advice, real grounding, and stated reasons ("why it matters") is unchanged, and no formal-letter convention is introduced.', 3, 'eng-inc004-writing-advice-01',
 'eng-inc004-writing-wc01a-advice', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Giving generic, saying-like advice (''always try your best'', ''be kind to others'') with no real personal experience behind it, rather than grounding each piece of advice in something specific that actually happened.',
 'FAR_TRANSFER');

commit;

-- Read-only verification (run after applying):
--
-- select id, content_difficulty, eligibility_status, family_id, transfer_class
-- from public.ali_question_bank
-- where id in ('eng-inc004-writing-skillproud-01', 'eng-inc004-writing-notgotoplan-01', 'eng-inc004-writing-advice-01')
-- order by id;
--
-- Expected: 3 rows, eligibility_status = 'authentic_assessment_candidate'
-- for all three, content_difficulty = easy/medium/hard respectively, each
-- with its own distinct family_id.
