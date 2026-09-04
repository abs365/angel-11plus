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

-- === notgotoplan-01 — STANDARD (medium). Distinct from mistakelearned-01
-- (a self-caused ERROR, reflected on afterward): this centres on an
-- unexpected EXTERNAL disruption the writer had to respond to in the
-- moment, requiring narration of an adaptive response, not a mistake
-- confession. Distinct from newplace-01's sustained arrival arc: this is
-- one bounded incident, not an extended developing impression. ===
('eng-inc004-writing-notgotoplan-01', 'writing', 'QT-WC-01a', array['csse'], 'medium', 'open-response', 1500,
 $json${"id":"eng-inc004-writing-notgotoplan-01","title":"Something That Didn't Go to Plan","prompt":"Write about a time when something you were doing, or trying to do, didn't go the way you expected -- it could be a school project, a game, a family occasion, a journey, or anything else. Explain what happened, what you did when things changed, and how it turned out.","type":"descriptive","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Describe a specific, genuine situation, not a vague 'sometimes plans go wrong'","Explain clearly what changed or went differently from what you expected","Describe what you actually did in response, not only how you felt about it","Organise your writing into clear paragraphs","Check paragraphing, spelling and punctuation carefully"]}$json$,
 'Programme Increment 023, Continuous Writing Sustainable Capacity Wave 1 (Writing Capacity Contract). QT-WC-01a (Reflective/Discursive Response Prompt), competency WC-01, family eng-inc004-writing-wc01a-notgotoplan. Prompt shape: externally-caused-disruption-plus-adaptive-response narrative -- genuinely distinct from mistakelearned-01''s self-caused-error structure and newplace-01''s sustained arrival arc. Moderate planning (one specific disruption + one specific adaptation) and moderate structure (setup -> disruption -> response -> outcome), matching the STANDARD tier of the Writing Capacity Contract.', 3, 'eng-inc004-writing-notgotoplan-01',
 'eng-inc004-writing-wc01a-notgotoplan', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Describing only what went wrong and how it felt, without ever explaining what the writer actually did in response -- leaving the adaptive half of the task unaddressed.',
 'NEAR_TRANSFER'),

-- === advice-01 — DEMANDING (hard). A third, structurally distinct route
-- to the DEMANDING tier alongside imaginedplace-01 (invention +
-- consistency) and pocketmoney-01 (given-perspective-weighing): this
-- requires synthesis across MULTIPLE past experiences into general,
-- transferable insight, with genuine audience-awareness (writing FOR an
-- imagined younger reader) -- the highest real planning/structural
-- demand of any Writing prompt in the pool. ===
('eng-inc004-writing-advice-01', 'writing', 'QT-WC-01a', array['csse'], 'hard', 'open-response', 1500,
 $json${"id":"eng-inc004-writing-advice-01","title":"Advice for Someone Younger","prompt":"Imagine talking to someone a few years younger than you who is about to join your school or your class. Write the advice you would genuinely give them, based on things you have actually experienced. Explain why each piece of advice matters, using something real that happened to you.","type":"descriptive","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Give at least two separate pieces of advice, not only one","For each piece of advice, refer to something real that actually happened to you, not a generic saying","Explain clearly why each piece of advice matters, not only what it is","Write in a genuine, encouraging voice, as if speaking to a real younger person, not as a formal list with no explanation","Organise your writing into clear paragraphs","Check your spelling and punctuation before you finish"]}$json$,
 'Programme Increment 023, Continuous Writing Sustainable Capacity Wave 1 (Writing Capacity Contract). QT-WC-01a (Reflective/Discursive Response Prompt), competency WC-01, family eng-inc004-writing-wc01a-advice. Prompt shape: synthesis-across-multiple-experiences-for-an-implied-audience -- genuinely distinct from every existing prompt, all of which centre on a SINGLE topic, event or comparison; this requires selecting and connecting several past experiences into general, transferable insight while maintaining audience-awareness, matching the DEMANDING tier alongside imaginedplace-01 and pocketmoney-01 via a third, structurally distinct route to that same challenge level.', 3, 'eng-inc004-writing-advice-01',
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
