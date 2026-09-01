-- Angel Digital 11+ — Migration 179
-- English Wave 3 Reading Remediation — Breaking the QT-RC-10 Monoculture
-- (Founder Completion and Readiness Programme, Reading Integrity
-- Reconciliation, 2026-09-01).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- The Reading Passage Educational Quality Assessment (this session)
-- confirmed: all 14 existing Wave 3 questions (migration 063) are
-- QT-RC-10 (Effect-of-Language/Word-Choice) — a real, evidenced,
-- previously-unclaimed Question Type (correctly identified as a genuine
-- gap when authored), but its exclusive use across all 5 passages means
-- 100% of every Wave 3 passage exposure tests the SAME single skill.
-- The individual questions are NOT shallow (independently confirmed —
-- genuine interpretive demand throughout), but the passage-level
-- EVIDENCE-PER-EXPOSURE economics are poor: a learner reading multiple
-- Wave 3 passages gets repeated near-identical reasoning experiences.
--
-- ADDITIVE, NOT REPLACEMENT. All 14 existing rows are UNTOUCHED — no
-- row is edited, deactivated, or removed; their own individually-good
-- quality is not in question. This migration ADDS exactly 2 new
-- companion questions of DIFFERENT reasoning types to each of the 5
-- passages (10 new rows total), deliberately NOT introducing a new
-- fixed template (each passage's own 2 additions are chosen from what
-- its own short text specifically supports, not identical across all 5
-- — see per-passage rationale below). Passages are short (118-158
-- words) — 2 additions each is a deliberately bounded amount, not
-- maximised, per the Founder's own instruction not to over-question a
-- brief text merely to add volume.
--
-- Three new types, none present anywhere in Wave 3's existing content:
-- QT-RC-01 (Direct Retrieval, one per passage — a genuinely different,
-- more literal demand than RC-10's inferential focus), QT-RC-08
-- (Emotion-and-Cause, in 2 passages), QT-RC-07 (Comparative Attribute
-- Extraction, in 2 passages), QT-RC-06 (Sequencing, in 1 passage).
--
-- ============================================================
-- PER-PASSAGE RATIONALE
-- ============================================================
-- The Empty Classroom: RC-01 (what is unusual about the whiteboard — a
-- plain literal detail, contrasting with the existing questions' focus
-- on inference) + RC-08 (Maya's feeling as she first notices the room is
-- different, evidenced by her cautious movements — a fresh angle from
-- the existing questions, which focus on the closing moment, not her
-- initial reaction).
--
-- The Baker's Apprentice: RC-01 (what Mr Fenwick does instead of giving
-- instructions) + RC-07 (comparing Mr Fenwick's effortless sack-carrying
-- against Priya's visible struggle with the same task) — a natural fit,
-- since the passage's own central content IS a two-character contrast,
-- previously only tested via word-choice interpretation, never a direct
-- comparison.
--
-- Letter to Grandad: RC-01 (which day Grandad usually collected Tom from
-- school — a simple, directly retrievable fact) + RC-06 (ordering the
-- three things Tom mentions in his letter — testing the letter's own
-- explicit paragraph structure, a demand type entirely absent from the
-- existing atmosphere/word-choice questions).
--
-- The Storm at the Harbour: RC-01 (what Mrs Okafor does that shows
-- people sense the storm coming — a concrete, literal detail) + RC-08
-- (how Sam himself might be feeling, watching his father — the existing
-- questions all focus on the father's own feelings; this asks about
-- Sam's, a genuinely different vantage point within the same passage).
--
-- The New Trainers: RC-01 (what Connor does when he sees the trainers)
-- + RC-07 (comparing Jayden's behaviour at the start of the day against
-- the end — the passage's own explicit before/after structure,
-- previously tested only via isolated word-choice questions, never as a
-- direct comparison of the full arc).
--
-- ============================================================
-- ANSWER-VALIDATION MECHANISM
-- ============================================================
-- RC-01/07/08 questions use `TIER2_ACCEPTED_SET` (matching this
-- project's own established, reviewed, already-live convention). The
-- one RC-06 question (Letter to Grandad) uses `TIER4_ORDERED_LIST`
-- (matching migration 044's own `w1-kitemaker-06` precedent). No new
-- validation mechanism is introduced. No question in this migration uses
-- the tick-justify self-assessment pattern.
--
-- Every fact and quotation used below was independently re-verified
-- this session against the passage text stored in migration 063 before
-- this file was written.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch, edit, deactivate, or reference any of migration 063's
-- existing 14 rows or 5 passage rows, or any Mathematics content in that
-- same migration. Does not touch Wave 1 or Wave 2 content. Does not set
-- eligibility_status to anything other than 'provisional' (matching this
-- wave's own established convention). Does not create or touch any
-- ali_family_review row (a separate consolidated pending-review migration
-- follows). Does not activate anything.
--
-- FAIL-CLOSED / DUPLICATE-ID PROTECTION: `on conflict (id) do nothing`.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values

-- THE EMPTY CLASSROOM
('w3-rc01-emptyclassroom-01', 'english', 'QT-RC-01', array['csse'], 'easy', 'short-answer', 70,
 $json${"id":"w3-rc01-emptyclassroom-01","marks":1,"skill":"evidence","question":"What is unusual about the whiteboard when Maya arrives at the classroom?","modelAnswer":"It had been wiped completely clean, when it was normally smudged with yesterday's lesson.","passageTitle":"The Empty Classroom","passageText":"Maya was always the first to arrive. She liked the ten minutes before anyone else came, when the classroom belonged only to her. This morning, though, something felt different. The chairs sat exactly as they had been left the day before, stacked with unusual care. The whiteboard, normally smudged with yesterday's lesson, had been wiped completely clean. Even the window, which never quite closed properly, was shut tight, and the room held a stillness that made her steps sound too loud.\n\nShe set her bag down slowly, as though placing it too quickly might disturb something she couldn't name. On the teacher's desk, a single envelope lay face-down, her name written across it in handwriting she almost recognised. Maya stood very still for a moment, listening to nothing at all, before she reached out and turned it over.","acceptedAnswers":["it had been wiped completely clean","it was unusually clean, not smudged as normal","someone had cleaned it when it was usually left dirty"],"validationTier":"TIER2_ACCEPTED_SET"}$json$,
 'English Wave 3 Reading Remediation. QT-RC-01 (Direct Retrieval), competency RC-01. Question family: wave3-fam-rc01-retrieval. New demand type for Wave 3, breaking the existing QT-RC-10-only monoculture.', 2, 'wave3-eng-emptyclassroom',
 'wave3-fam-rc01-retrieval', 'angel_original', 'provisional', 1, true, 'Confusing this detail with the chairs (also unusually tidy) or the window, rather than the specific whiteboard detail asked for.',
 'ROUTINE'),

('w3-rc08-emptyclassroom-01', 'english', 'QT-RC-08', array['csse'], 'medium', 'short-answer', 90,
 $json${"id":"w3-rc08-emptyclassroom-01","marks":1,"skill":"atmosphere","question":"How does Maya feel as she first notices the classroom is different, based on the way she moves and behaves?","modelAnswer":"She feels cautious and uneasy -- she sets her bag down slowly, \"as though placing it too quickly might disturb something she couldn't name,\" and stands very still, suggesting careful, wary behaviour rather than her usual comfort in the empty room.","passageTitle":"The Empty Classroom","passageText":"Maya was always the first to arrive. She liked the ten minutes before anyone else came, when the classroom belonged only to her. This morning, though, something felt different. The chairs sat exactly as they had been left the day before, stacked with unusual care. The whiteboard, normally smudged with yesterday's lesson, had been wiped completely clean. Even the window, which never quite closed properly, was shut tight, and the room held a stillness that made her steps sound too loud.\n\nShe set her bag down slowly, as though placing it too quickly might disturb something she couldn't name. On the teacher's desk, a single envelope lay face-down, her name written across it in handwriting she almost recognised. Maya stood very still for a moment, listening to nothing at all, before she reached out and turned it over.","acceptedAnswers":["cautious and uneasy, moving carefully","wary or on edge, unlike her usual comfort in the room","nervous, sensing something unusual without knowing what"],"validationTier":"TIER2_ACCEPTED_SET"}$json$,
 'English Wave 3 Reading Remediation. QT-RC-08 (Emotion-and-Cause), competency RC-02. Question family: wave3-fam-rc08-emotion. Asks about Maya''s INITIAL reaction, a different moment from the existing questions'' focus on the closing line.', 2, 'wave3-eng-emptyclassroom',
 'wave3-fam-rc08-emotion', 'angel_original', 'provisional', 1, true, 'Describing Maya''s usual comfort in the empty classroom (true on other mornings) rather than her changed, wary behaviour on THIS particular morning.',
 'FAR_TRANSFER'),

-- THE BAKER'S APPRENTICE
('w3-rc01-bakersapprentice-01', 'english', 'QT-RC-01', array['csse'], 'easy', 'short-answer', 70,
 $json${"id":"w3-rc01-bakersapprentice-01","marks":1,"skill":"evidence","question":"What does Mr Fenwick do when Priya arrives for her first morning as his apprentice, instead of giving her an apron and a list of instructions?","modelAnswer":"He simply points to a mountain of flour sacks stacked against the wall and says nothing at all.","passageTitle":"The Baker's Apprentice","passageText":"Old Mr Fenwick had run the bakery on Corn Street for forty years, and everyone in the village said his bread was the best for miles. When Priya arrived for her first morning as his apprentice, she expected him to hand her an apron and a list of instructions. Instead, he simply pointed to a mountain of flour sacks stacked against the wall and said nothing at all.\n\nPriya waited, unsure whether this was a test or simply how he worked. After a long moment, Mr Fenwick picked up a single sack, hoisted it onto his shoulder without any visible effort, and carried it through to the ovens as though it weighed nothing more than a folded newspaper. Priya hurried to lift a sack of her own. It did not move nearly so easily. By the time she had dragged it halfway across the floor, Mr Fenwick was already three sacks ahead of her, whistling quietly to himself.","acceptedAnswers":["he points to the flour sacks and says nothing","silently points at the sacks of flour","gestures at the flour without explaining or speaking"],"validationTier":"TIER2_ACCEPTED_SET"}$json$,
 'English Wave 3 Reading Remediation. QT-RC-01, competency RC-01. Question family: wave3-fam-rc01-retrieval.', 2, 'wave3-eng-bakersapprentice',
 'wave3-fam-rc01-retrieval', 'angel_original', 'provisional', 1, true, 'Describing what Priya expected instead of what Mr Fenwick actually did.',
 'ROUTINE'),

('w3-rc07-bakersapprentice-01', 'english', 'QT-RC-07', array['csse'], 'medium', 'short-answer', 100,
 $json${"id":"w3-rc07-bakersapprentice-01","marks":1,"skill":"comparison","question":"Compare how easily Mr Fenwick carries a flour sack with how Priya manages hers. What is the difference?","modelAnswer":"Mr Fenwick lifts and carries his sack effortlessly, \"without any visible effort,\" as though it weighed almost nothing. Priya's sack does not move nearly so easily -- she has to drag hers and falls three sacks behind him.","passageTitle":"The Baker's Apprentice","passageText":"Old Mr Fenwick had run the bakery on Corn Street for forty years, and everyone in the village said his bread was the best for miles. When Priya arrived for her first morning as his apprentice, she expected him to hand her an apron and a list of instructions. Instead, he simply pointed to a mountain of flour sacks stacked against the wall and said nothing at all.\n\nPriya waited, unsure whether this was a test or simply how he worked. After a long moment, Mr Fenwick picked up a single sack, hoisted it onto his shoulder without any visible effort, and carried it through to the ovens as though it weighed nothing more than a folded newspaper. Priya hurried to lift a sack of her own. It did not move nearly so easily. By the time she had dragged it halfway across the floor, Mr Fenwick was already three sacks ahead of her, whistling quietly to himself.","acceptedAnswers":["he carries his easily/effortlessly, she struggles and has to drag hers","his experience makes it look easy, her lack of experience makes it hard","he is far ahead of her because the task is effortless for him but not for her"],"validationTier":"TIER2_ACCEPTED_SET"}$json$,
 'English Wave 3 Reading Remediation. QT-RC-07 (Multi-Entity Comparative Attribute Extraction), competency RC-01. Question family: wave3-fam-rc07-comparative. Drawing directly on the passage''s own central two-character contrast.', 2, 'wave3-eng-bakersapprentice',
 'wave3-fam-rc07-comparative', 'angel_original', 'provisional', 1, true, 'Describing only Mr Fenwick''s ease or only Priya''s struggle, without explicitly contrasting the two.',
 'FAR_TRANSFER'),

-- LETTER TO GRANDAD
('w3-rc01-lettertograndad-01', 'english', 'QT-RC-01', array['csse'], 'easy', 'short-answer', 70,
 $json${"id":"w3-rc01-lettertograndad-01","marks":1,"skill":"evidence","question":"According to the letter, which day did Grandad usually pick Tom up from school?","modelAnswer":"Thursdays.","passageTitle":"Letter to Grandad","passageText":"Dear Grandad,\n\nI know you always say a letter should start with the weather, so I'll tell you it has rained every single day this week, which feels like exactly the sort of thing you'd find funny rather than annoying.\n\nSchool has been strange without you picking me up on Thursdays. Mr Ahmed asked where my \"chauffeur\" had gone, and I didn't really know what to say, so I just told him you were resting. I went past the allotment yesterday and your runner beans have grown right over the top of the fence, tangled and a bit wild, like they don't know you're not coming to tie them back. I didn't touch them. I thought you'd want to do that yourself when you're better.\n\nMum says I shouldn't worry so much, but I've started checking my phone every time it buzzes, just in case it's news. Write back soon, even if it's short.\n\nLove,\nTom","acceptedAnswers":["Thursdays","Thursday"],"validationTier":"TIER2_ACCEPTED_SET"}$json$,
 'English Wave 3 Reading Remediation. QT-RC-01, competency RC-01. Question family: wave3-fam-rc01-retrieval.', 2, 'wave3-eng-lettertograndad',
 'wave3-fam-rc01-retrieval', 'angel_original', 'provisional', 1, true, 'Confusing this with a different detail from the letter (e.g. the allotment visit, which happened "yesterday", not on a stated weekday).',
 'ROUTINE'),

('w3-rc06-lettertograndad-01', 'english', 'QT-RC-06', array['csse'], 'medium', 'short-answer', 100,
 $json${"id":"w3-rc06-lettertograndad-01","marks":1,"skill":"structure","question":"Put these three things Tom mentions in the order he writes about them in the letter: (a) checking his phone for news (b) the runner beans in the allotment (c) being picked up on Thursdays.","modelAnswer":"1. Being picked up on Thursdays (c). 2. The runner beans in the allotment (b). 3. Checking his phone for news (a).","passageTitle":"Letter to Grandad","passageText":"Dear Grandad,\n\nI know you always say a letter should start with the weather, so I'll tell you it has rained every single day this week, which feels like exactly the sort of thing you'd find funny rather than annoying.\n\nSchool has been strange without you picking me up on Thursdays. Mr Ahmed asked where my \"chauffeur\" had gone, and I didn't really know what to say, so I just told him you were resting. I went past the allotment yesterday and your runner beans have grown right over the top of the fence, tangled and a bit wild, like they don't know you're not coming to tie them back. I didn't touch them. I thought you'd want to do that yourself when you're better.\n\nMum says I shouldn't worry so much, but I've started checking my phone every time it buzzes, just in case it's news. Write back soon, even if it's short.\n\nLove,\nTom","orderedAnswer":["being picked up on Thursdays","the runner beans in the allotment","checking his phone for news"],"validationTier":"TIER4_ORDERED_LIST"}$json$,
 'English Wave 3 Reading Remediation. QT-RC-06 (Sequential Ordering of Textual Information), competency RC-04. Question family: wave3-fam-rc06-sequencing. New demand type for Wave 3, testing the letter''s own explicit paragraph structure.', 2, 'wave3-eng-lettertograndad',
 'wave3-fam-rc06-sequencing', 'angel_original', 'provisional', 1, true, 'Ordering by perceived importance or emotional weight rather than the actual order the letter presents them in.',
 'NEAR_TRANSFER'),

-- THE STORM AT THE HARBOUR
('w3-rc01-stormharbour-01', 'english', 'QT-RC-01', array['csse'], 'easy', 'short-answer', 70,
 $json${"id":"w3-rc01-stormharbour-01","marks":1,"skill":"evidence","question":"What does Mrs Okafor do at the harbour café that shows people sense the storm is coming?","modelAnswer":"She pulls the shutters closed on the harbour café, two hours earlier than she normally would.","passageTitle":"The Storm at the Harbour","passageText":"By four o'clock, the fishing boats that were still out had become small dark shapes against a sky the colour of old bruises. Sam stood on the harbour wall with his father, who hadn't said very much in the last twenty minutes. Every few seconds, his father checked his watch, then looked back out at the water, then checked his watch again, as though the numbers might change if he looked hard enough.\n\nThe wind had picked up enough to make the loose rigging on the moored boats clang against their masts in a rhythm that didn't quite match anything. Down on the quay, Mrs Okafor was pulling the shutters closed on the harbour café two hours before she normally would. Nobody had said the word \"storm\" out loud yet, but everybody on the harbour wall seemed to be moving a little faster than usual, and nobody was smiling.","acceptedAnswers":["closing the café shutters early","pulling the shutters closed two hours early","shutting the café earlier than usual"],"validationTier":"TIER2_ACCEPTED_SET"}$json$,
 'English Wave 3 Reading Remediation. QT-RC-01, competency RC-01. Question family: wave3-fam-rc01-retrieval.', 2, 'wave3-eng-stormharbour',
 'wave3-fam-rc01-retrieval', 'angel_original', 'provisional', 1, true, 'Describing Sam''s father''s behaviour (watch-checking) instead of the specific Mrs Okafor detail asked for.',
 'ROUTINE'),

('w3-rc08-stormharbour-01', 'english', 'QT-RC-08', array['csse'], 'medium', 'short-answer', 90,
 $json${"id":"w3-rc08-stormharbour-01","marks":1,"skill":"atmosphere","question":"How might Sam himself be feeling as he watches his father repeatedly check his watch and look out at the water?","modelAnswer":"Sam is likely feeling worried or anxious too, picking up on his father's tension even though Sam's own feelings are never directly stated -- the tense, unsmiling atmosphere around them suggests he shares the general unease.","passageTitle":"The Storm at the Harbour","passageText":"By four o'clock, the fishing boats that were still out had become small dark shapes against a sky the colour of old bruises. Sam stood on the harbour wall with his father, who hadn't said very much in the last twenty minutes. Every few seconds, his father checked his watch, then looked back out at the water, then checked his watch again, as though the numbers might change if he looked hard enough.\n\nThe wind had picked up enough to make the loose rigging on the moored boats clang against their masts in a rhythm that didn't quite match anything. Down on the quay, Mrs Okafor was pulling the shutters closed on the harbour café two hours before she normally would. Nobody had said the word \"storm\" out loud yet, but everybody on the harbour wall seemed to be moving a little faster than usual, and nobody was smiling.","acceptedAnswers":["worried or anxious, picking up on his father's tension","uneasy, affected by the tense atmosphere around him","nervous, even though it isn't stated directly"],"validationTier":"TIER2_ACCEPTED_SET"}$json$,
 'English Wave 3 Reading Remediation. QT-RC-08, competency RC-02. Question family: wave3-fam-rc08-emotion. Asks about SAM''s feelings specifically -- the existing questions all address his father''s, a genuinely different vantage point.', 2, 'wave3-eng-stormharbour',
 'wave3-fam-rc08-emotion', 'angel_original', 'provisional', 1, true, 'Describing only the father''s feelings (already covered by other questions) rather than reasoning about Sam''s own likely emotional state, which the question specifically asks for.',
 'FAR_TRANSFER'),

-- THE NEW TRAINERS
('w3-rc01-newtrainers-01', 'english', 'QT-RC-01', array['csse'], 'easy', 'short-answer', 70,
 $json${"id":"w3-rc01-newtrainers-01","marks":1,"skill":"evidence","question":"What does Connor do when he sees Jayden's new trainers at lunch?","modelAnswer":"He glances down at Jayden's feet for exactly one second, then carries on eating his sandwich without saying a word.","passageTitle":"The New Trainers","passageText":"Jayden had saved for eleven weeks to buy the trainers, counting out coins from his paper-round money every Sunday evening. When he finally wore them to school, he spent the whole morning walking very deliberately past groups of people, taking the longest possible route between lessons.\n\nNobody said anything about them at break time. At lunch, Connor glanced down at Jayden's feet for exactly one second, then carried on eating his sandwich without a word. Jayden told himself it didn't matter what Connor thought. By the end of the day, though, the trainers were tucked at the very back of his locker, and Jayden walked home in his old, scuffed pair instead, taking the shortest route he knew.","acceptedAnswers":["glances at them briefly then keeps eating without comment","looks for one second and says nothing","notices them but doesn't react or say anything"],"validationTier":"TIER2_ACCEPTED_SET"}$json$,
 'English Wave 3 Reading Remediation. QT-RC-01, competency RC-01. Question family: wave3-fam-rc01-retrieval.', 2, 'wave3-eng-newtrainers',
 'wave3-fam-rc01-retrieval', 'angel_original', 'provisional', 1, true, 'Confusing Connor''s reaction with the general lack of comment "at break time" (a different moment) rather than the specific lunch detail asked for.',
 'ROUTINE'),

('w3-rc07-newtrainers-01', 'english', 'QT-RC-07', array['csse'], 'medium', 'short-answer', 100,
 $json${"id":"w3-rc07-newtrainers-01","marks":1,"skill":"comparison","question":"Compare how Jayden behaves at the start of the school day with how he behaves by the end of the day. What has changed?","modelAnswer":"At the start, Jayden deliberately walks past groups of people, taking the longest route, wanting to be seen in his new trainers. By the end, he hides the trainers at the back of his locker and takes the shortest route home in his old pair, actively avoiding attention -- a complete reversal.","passageTitle":"The New Trainers","passageText":"Jayden had saved for eleven weeks to buy the trainers, counting out coins from his paper-round money every Sunday evening. When he finally wore them to school, he spent the whole morning walking very deliberately past groups of people, taking the longest possible route between lessons.\n\nNobody said anything about them at break time. At lunch, Connor glanced down at Jayden's feet for exactly one second, then carried on eating his sandwich without a word. Jayden told himself it didn't matter what Connor thought. By the end of the day, though, the trainers were tucked at the very back of his locker, and Jayden walked home in his old, scuffed pair instead, taking the shortest route he knew.","acceptedAnswers":["goes from wanting to be seen to wanting to hide/avoid attention","started proud and eager to show off, ended embarrassed and avoiding notice","the longest route to be seen becomes the shortest route to avoid being seen"],"validationTier":"TIER2_ACCEPTED_SET"}$json$,
 'English Wave 3 Reading Remediation. QT-RC-07, competency RC-01. Question family: wave3-fam-rc07-comparative. Drawing on the passage''s own explicit before/after structure.', 2, 'wave3-eng-newtrainers',
 'wave3-fam-rc07-comparative', 'angel_original', 'provisional', 1, true, 'Describing only the start or only the end of the day without identifying the CHANGE between the two, which the question requires.',
 'FAR_TRANSFER')

on conflict (id) do nothing;

commit;
