-- Angel Digital 11+ -- Migration 268 (PREPARED, NOT APPLIED)
-- CSSE Completion, Priority 4 -- Continuous Writing expansion: candidate registration.
--
-- WHAT THIS DOES
--   Registers 7 new Writing prompts (4 reflective/discursive QT-WC-01a, 3 picture-led QT-WC-01b) in ali_question_bank as
--   'authentic_assessment_candidate' -- NOT learner-reachable, NOT Practice, NOT Mock -- exactly as migrations 257/258
--   registered the Treehouse Lantern before the Founder approved it, and inserts one 'pending_independent_review'
--   ali_family_review row per family so each appears on /admin-beta/review.
--   The three picture prompts reference original SVG illustrations already committed under
--   public/practice-assets/writing-picture-narrative/.
--
-- WHAT THIS DOES NOT DO
--   Promotes nothing. No eligibility_status is changed on any existing row. No Mock row is touched. No reviewer or
--   decision is fabricated. Idempotent: every insert is guarded (on conflict do nothing / where not exists).
--
-- PREREQUISITES: the deploy containing the SVG files must be live before the Founder reviews the pictures.
-- NEXT STEP: Founder reviews at /admin-beta/review, then applies migration 269 (template) for the approved ids only.

begin;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
 ('eng-csse-writing-proudofother-01', 'writing', 'QT-WC-01a', array['csse'], 'hard', 'open-response', 1500,
  $json${"id":"eng-csse-writing-proudofother-01","title":"Proud of Someone Else","prompt":"Write about a time when you felt really proud of someone else -- a friend, a brother or sister, a classmate, or a family member. Explain what they did, why it mattered, and how you felt as you watched or heard about it.","type":"descriptive","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Choose one real moment and say clearly who it was about early on","Include at least one specific detail of what happened -- what was said, done or seen","Explain WHY you felt proud, not only that you did","Organise your writing into clear paragraphs","Check your spelling and punctuation before you finish"]}$json$,
  'CSSE Completion Priority 4, reflective/discursive candidate. QT-WC-01a, WC-01. Topic distinct from every live Practice/Mock/reserve Writing topic. Awaiting Founder educational review before any promotion.',
  3, 'eng-csse-writing-proudofother-01',
  'eng-csse-writing-wc01a-proudofother', 'angel_original', 'authentic_assessment_candidate', 1, true,
  'Writing a general or invented account of the topic instead of the writer''s own real experience or genuine view -- the marker credits a clear personal answer with a specific example and a reason, not a list of general statements.',
  'FAR_TRANSFER'),
 ('eng-csse-writing-onefriendmany-01', 'writing', 'QT-WC-01a', array['csse'], 'hard', 'open-response', 1500,
  $json${"id":"eng-csse-writing-onefriendmany-01","title":"One Close Friend or Many Friends?","prompt":"Some people say it is better to have one really close friend. Others say it is better to have lots of friends. What do you think, and why? Use your own experience or things you have noticed to support your view.","type":"descriptive","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Say clearly which view you hold, or explain honestly if you think both have a place","Give at least one real example from your own life or from people you know","Give a reason for your view, and think about why someone might disagree","Organise your writing into clear paragraphs","Check your spelling and punctuation before you finish"]}$json$,
  'CSSE Completion Priority 4, discursive candidate (two views, own opinion plus experience). QT-WC-01a, WC-01. Distinct topic. Awaiting Founder educational review before any promotion.',
  3, 'eng-csse-writing-onefriendmany-01',
  'eng-csse-writing-wc01a-onefriendmany', 'angel_original', 'authentic_assessment_candidate', 1, true,
  'Writing a general or invented account of the topic instead of the writer''s own real experience or genuine view -- the marker credits a clear personal answer with a specific example and a reason, not a list of general statements.',
  'MIXED_TRANSFER'),
 ('eng-csse-writing-tradition-01', 'writing', 'QT-WC-01a', array['csse'], 'hard', 'open-response', 1500,
  $json${"id":"eng-csse-writing-tradition-01","title":"A Tradition That Matters","prompt":"Write about a tradition -- something your family, your friends or your community does regularly, such as a celebration, a weekly habit or a special meal. Describe what happens, and explain why it matters to you.","type":"descriptive","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Describe one specific tradition you actually know, not a general type of celebration","Include at least one concrete detail -- something you see, hear, taste or do","Explain WHY it matters to you, not only what happens","Organise your writing into clear paragraphs","Check your spelling and punctuation before you finish"]}$json$,
  'CSSE Completion Priority 4, reflective/descriptive candidate. QT-WC-01a, WC-01. Distinct topic; deliberately inclusive of any family or community tradition. Awaiting Founder educational review.',
  3, 'eng-csse-writing-tradition-01',
  'eng-csse-writing-wc01a-tradition', 'angel_original', 'authentic_assessment_candidate', 1, true,
  'Writing a general or invented account of the topic instead of the writer''s own real experience or genuine view -- the marker credits a clear personal answer with a specific example and a reason, not a list of general statements.',
  'NEAR_TRANSFER'),
 ('eng-csse-writing-wintakepart-01', 'writing', 'QT-WC-01a', array['csse'], 'hard', 'open-response', 1500,
  $json${"id":"eng-csse-writing-wintakepart-01","title":"Is It Better to Win or to Take Part?","prompt":"People often say, \"It is not the winning that matters, it is the taking part.\" Do you agree? Write about your own opinion, using your own experience or things you have noticed to support what you think.","type":"descriptive","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Say clearly whether you agree, disagree, or agree in some situations only","Use at least one real example -- a game, a race, a competition or something you have seen","Give a reason for your view and consider one point against it","Organise your writing into clear paragraphs","Check your spelling and punctuation before you finish"]}$json$,
  'CSSE Completion Priority 4, discursive candidate. QT-WC-01a, WC-01. Distinct topic. Awaiting Founder educational review.',
  3, 'eng-csse-writing-wintakepart-01',
  'eng-csse-writing-wc01a-wintakepart', 'angel_original', 'authentic_assessment_candidate', 1, true,
  'Writing a general or invented account of the topic instead of the writer''s own real experience or genuine view -- the marker credits a clear personal answer with a specific example and a reason, not a list of general statements.',
  'MIXED_TRANSFER'),
 ('eng-csse-writing-picturenarrative-stationclock-01', 'writing', 'QT-WC-01b', array['csse'], 'hard', 'open-response', 1500,
  $json${"id":"eng-csse-writing-picturenarrative-stationclock-01","title":"The Station Clock","prompt":"Write a story based on the picture below.","type":"picture-narrative","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Ground your story in real details you can see in the picture -- for example the clock, the suitcase and its tag, the scarf, the ticket, or the figure at the edge of the platform -- rather than an idea that has nothing to do with them","Choose ONE clear direction for your story early on, and make it clear whose story this is","Build in a real turning point or discovery, not just a description of what the picture shows","Choose vocabulary carefully and vary your sentence lengths and openings","Organise your writing into clear paragraphs","Check your spelling and punctuation before you finish"],"stimulus":{"type":"image","altText":"A small railway platform in the late afternoon. A large station clock on the wall has stopped at ten past five, although a lamp beside it is already lit. A brown suitcase stands alone in the middle of the platform with a paper luggage tag half torn off and hanging by a thread. A red scarf is snagged on the iron fence beside a bench, and a folded ticket with a time circled in red lies on the bench. Far along the platform a figure in a long grey coat stands at the very edge, back turned, looking down the empty track where the rear lights of a train are shrinking into the distance.","imageAssetUrl":"/practice-assets/writing-picture-narrative/stationclock-v1.svg"}}$json$,
  'CSSE Completion Priority 4, picture-narrative candidate. QT-WC-01b, WC-01. Original vector illustration (stationclock-v1.svg). Five story footholds; distinct setting from Treehouse Lantern, old shed and the rejected riverboat. Awaiting Founder visual and educational review (the Riverboat precedent applies: reject if there is ''nothing to write with the picture'').',
  3, 'eng-csse-writing-picturenarrative-stationclock-01',
  'eng-csse-writing-wc01b-stationclock', 'angel_original', 'authentic_assessment_candidate', 1, true,
  'Describing the picture itself (a static scene description) rather than writing a story that uses it as a starting point -- the marker cannot credit narrative writing that never actually narrates a sequence of events.',
  'FAR_TRANSFER'),
 ('eng-csse-writing-picturenarrative-lastbus-01', 'writing', 'QT-WC-01b', array['csse'], 'hard', 'open-response', 1500,
  $json${"id":"eng-csse-writing-picturenarrative-lastbus-01","title":"The Last Bus","prompt":"Write a story based on the picture below.","type":"picture-narrative","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Ground your story in real details you can see in the picture -- for example the parcel, the mitten and note, the footprints, the bus, or the lit window -- rather than an idea that has nothing to do with them","Choose ONE clear direction for your story early on, and make it clear whose story this is","Build in a real turning point or discovery, not just a description of what the picture shows","Choose vocabulary carefully and vary your sentence lengths and openings","Organise your writing into clear paragraphs","Check your spelling and punctuation before you finish"],"stimulus":{"type":"image","altText":"A bus shelter beside a quiet road on a snowy evening. Snow is still falling. Inside the shelter a parcel wrapped in brown paper and tied with string sits on the bench, its label smudged so the address cannot be read. A child's red mitten is pinned to the noticeboard with a drawing pin, next to a sheet of paper covered in hurried writing. Two sets of footprints mark the snow: a small set leading into the shelter and not out again, and a larger set leading away down the road. In the distance a bus is approaching with its headlights on, but the sign above its windscreen is blank. In a house across the road, one upstairs window is lit and a small figure stands in it, one hand raised against the glass.","imageAssetUrl":"/practice-assets/writing-picture-narrative/snowbusshelter-v1.svg"}}$json$,
  'CSSE Completion Priority 4, picture-narrative candidate. QT-WC-01b, WC-01. Original vector illustration (snowbusshelter-v1.svg). Five story footholds; winter-dusk road setting. Awaiting Founder visual and educational review.',
  3, 'eng-csse-writing-picturenarrative-lastbus-01',
  'eng-csse-writing-wc01b-lastbus', 'angel_original', 'authentic_assessment_candidate', 1, true,
  'Describing the picture itself (a static scene description) rather than writing a story that uses it as a starting point -- the marker cannot credit narrative writing that never actually narrates a sequence of events.',
  'FAR_TRANSFER'),
 ('eng-csse-writing-picturenarrative-afterclosing-01', 'writing', 'QT-WC-01b', array['csse'], 'hard', 'open-response', 1500,
  $json${"id":"eng-csse-writing-picturenarrative-afterclosing-01","title":"After Closing Time","prompt":"Write a story based on the picture below.","type":"picture-narrative","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Ground your story in real details you can see in the picture -- for example the open window, the muddy footprints, the key in the book, the ladder, or the torch -- rather than an idea that has nothing to do with them","Choose ONE clear direction for your story early on, and make it clear whose story this is","Build in a real turning point or discovery, not just a description of what the picture shows","Choose vocabulary carefully and vary your sentence lengths and openings","Organise your writing into clear paragraphs","Check your spelling and punctuation before you finish"],"stimulus":{"type":"image","altText":"The inside of a small school library at night, long after closing. One green reading lamp is still switched on over a table. On the table an old book lies open with a small brass key resting in the middle of the page. A tall wooden ladder leans against the shelves, and one book high up sticks out further than all the rest. The window beside the shelves is open a little and the curtain is blowing into the room, with the moon outside. A trail of muddy footprints leads from the window across the floor to the table, and a torch lies on its side under the table, still shining a thin beam along the floor. The wall clock shows nearly midnight.","imageAssetUrl":"/practice-assets/writing-picture-narrative/libraryafterclosing-v1.svg"}}$json$,
  'CSSE Completion Priority 4, picture-narrative candidate. QT-WC-01b, WC-01. Original vector illustration (libraryafterclosing-v1.svg). Five story footholds; indoor night setting. Awaiting Founder visual and educational review.',
  3, 'eng-csse-writing-picturenarrative-afterclosing-01',
  'eng-csse-writing-wc01b-afterclosing', 'angel_original', 'authentic_assessment_candidate', 1, true,
  'Describing the picture itself (a static scene description) rather than writing a story that uses it as a starting point -- the marker cannot credit narrative writing that never actually narrates a sequence of events.',
  'FAR_TRANSFER')
on conflict (id) do nothing;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'eng-csse-writing-wc01a-proudofother', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'CSSE-COMPLETION-PRIORITY-4 Writing expansion candidate "Proud of Someone Else" (QT-WC-01a). Awaiting independent educational review before any promotion to Practice. Reflective/discursive: judge topic suitability for a Year 5-6 learner and that it asks for the writer''s own experience or view.',
  'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-csse-writing-wc01a-proudofother' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'eng-csse-writing-wc01a-onefriendmany', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'CSSE-COMPLETION-PRIORITY-4 Writing expansion candidate "One Close Friend or Many Friends?" (QT-WC-01a). Awaiting independent educational review before any promotion to Practice. Reflective/discursive: judge topic suitability for a Year 5-6 learner and that it asks for the writer''s own experience or view.',
  'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-csse-writing-wc01a-onefriendmany' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'eng-csse-writing-wc01a-tradition', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'CSSE-COMPLETION-PRIORITY-4 Writing expansion candidate "A Tradition That Matters" (QT-WC-01a). Awaiting independent educational review before any promotion to Practice. Reflective/discursive: judge topic suitability for a Year 5-6 learner and that it asks for the writer''s own experience or view.',
  'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-csse-writing-wc01a-tradition' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'eng-csse-writing-wc01a-wintakepart', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'CSSE-COMPLETION-PRIORITY-4 Writing expansion candidate "Is It Better to Win or to Take Part?" (QT-WC-01a). Awaiting independent educational review before any promotion to Practice. Reflective/discursive: judge topic suitability for a Year 5-6 learner and that it asks for the writer''s own experience or view.',
  'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-csse-writing-wc01a-wintakepart' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'eng-csse-writing-wc01b-stationclock', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'CSSE-COMPLETION-PRIORITY-4 Writing expansion candidate "The Station Clock" (QT-WC-01b). Awaiting independent educational review before any promotion to Practice. Picture-led: judge whether the picture offers enough story to write (Riverboat precedent) and approve the illustration itself.',
  'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-csse-writing-wc01b-stationclock' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'eng-csse-writing-wc01b-lastbus', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'CSSE-COMPLETION-PRIORITY-4 Writing expansion candidate "The Last Bus" (QT-WC-01b). Awaiting independent educational review before any promotion to Practice. Picture-led: judge whether the picture offers enough story to write (Riverboat precedent) and approve the illustration itself.',
  'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-csse-writing-wc01b-lastbus' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'eng-csse-writing-wc01b-afterclosing', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'CSSE-COMPLETION-PRIORITY-4 Writing expansion candidate "After Closing Time" (QT-WC-01b). Awaiting independent educational review before any promotion to Practice. Picture-led: judge whether the picture offers enough story to write (Riverboat precedent) and approve the illustration itself.',
  'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-csse-writing-wc01b-afterclosing' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
);

commit;
