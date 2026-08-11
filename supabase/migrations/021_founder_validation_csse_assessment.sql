-- Angel Digital 11+ — Migration 021
-- Angel Assessment Transformation Execution Programme, Release 1
-- Founder Validation Assessment (CSSE) — controlled, non-production content.
--
-- WHAT THIS IS: 11 original Angel items (5 English Reading Comprehension,
-- 6 Mathematics) authored specifically for the Founder Validation Assessment
-- per RELEASE_1_CSSE_AUTHENTIC_QUESTION_SPECIFICATION.md and grounded in the
-- multi-year CSSE evidence base (docs/intelligence/CSSE_QUESTION_
-- INTELLIGENCE_FRAMEWORK.md / CSSE_ASSESSMENT_INTELLIGENCE_FRAMEWORK.md).
-- Full per-item evidence provenance, originality declaration and difficulty
-- basis are recorded separately in
-- FOUNDER_VALIDATION_ASSESSMENT_CONTENT_REGISTER.md and mirrored in
-- data/founderValidation/csseFounderValidationEvidence.ts for the in-app
-- Founder Evidence View — this migration carries only the fields the
-- existing ali_question_bank schema already defines.
--
-- WHAT THIS IS NOT: production mock content. Every row below uses
-- pathway = ['csse-founder-validation'] — a pathway value distinct from
-- 'csse', deliberately, so the existing production CSSE Mock
-- (fetchQuestionBank(supabase, subject, 'csse'), app/learning-intelligence/
-- mock-exam/page.tsx) can never select these rows. Only the new, clearly-
-- labelled Founder Validation route
-- (app/learning-intelligence/founder-validation/csse/page.tsx) queries this
-- pathway. This is the only mechanism keeping this content out of
-- production — no other flag exists, so this pathway value must not be
-- changed without updating both call sites together.
--
-- Additive-only. Does not modify, retag, or delete any of the 29 existing
-- rows (18 from migration 013, 11 from migration 016 — see
-- RELEASE_1_LIVE_QUESTION_BANK_RECONCILIATION_REPORT.md). Depends on
-- migration 005 (ali_question_bank, content_difficulty enum). No new enum
-- value, no schema change, no new table.
--
-- Every id below is prefixed `fv-` (Founder Validation) so it can never
-- collide with any existing or future production id.
--
-- Run this in: Supabase Dashboard > SQL Editor > New query.
-- (ali_question_bank has no browser-writable RLS policy as of migration
-- 020 — this must be applied via the Dashboard, the same as every other
-- migration in this project; it cannot be applied from application code
-- or the anon key.)

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, mastery_threshold, learning_unit_id)
values

-- ── English Reading Comprehension (all 5 share one original passage) ────
('fv-eng-001-q1', 'english', 'QT-RC-01', array['csse-founder-validation'], 'easy', 'short-answer', 45,
 $json${
   "id": "fv-eng-001-q1",
   "question": "How many apples had Nadia counted in the east row that morning?",
   "skill": "retrieval",
   "marks": 1,
   "modelAnswer": "Forty-three.",
   "passageTitle": "The Orchard",
   "passageText": "Nadia stood at the top of the orchard, watching the storm roll in from the coast. Her cousin Ben was already halfway down the hill, jacket flapping, shouting something she couldn't hear over the wind. Their grandmother had told them to bring in the apples before the rain came, and Ben, typically, had turned it into a race.\n\nNadia moved more carefully, checking each tree as she passed. She had counted forty-three apples in the east row that morning, and she wasn't about to leave any behind. Ben, meanwhile, grabbed whatever he could reach and stuffed it into his basket without looking, more interested in beating the rain than filling it properly.\n\nBy the time the first heavy drops began to fall, Nadia's basket was neat and full. Ben's was half-empty, apples bruised where he'd dropped and caught them again. 'The sky's falling in,' he laughed, pointing at the clouds boiling grey above them, 'and you're still counting!'\n\nNadia didn't answer. She was thinking about what their grandmother always said: that the orchard rewarded patience, not speed. As the wind tore leaves from the branches and sent them spinning past her feet, she felt something she couldn't quite name — not fear exactly, but a kind of small, private thrill, as if the storm itself were testing whether she would rush.\n\nThey reached the kitchen door together, breathless, just as the rain turned the yard to mud behind them. Their grandmother looked at the two baskets — one careful and full, one scattered and half-empty — and said nothing at all. She didn't need to."
 }$json$,
 'Literal single-fact retrieval, explicitly stated in paragraph 2 — Assessment Brain QT-RC-01, competency RC-01. Evidence: CSSE-008 (2022 Entry) Q2-Q4/Q12.', 2, 'fv-eng-001'),

('fv-eng-001-q2', 'english', 'QT-RC-02', array['csse-founder-validation'], 'easy', 'short-answer', 90,
 $json${
   "id": "fv-eng-001-q2",
   "question": "Does the passage suggest that Ben approached picking apples carefully? Tick Yes or No, then give two reasons for your answer.",
   "skill": "judgement",
   "marks": 3,
   "modelAnswer": "No. He grabbed whatever he could reach without looking, and his basket ended up half-empty with bruised apples where he had dropped and caught them again.",
   "passageTitle": "The Orchard",
   "passageText": "Nadia stood at the top of the orchard, watching the storm roll in from the coast. Her cousin Ben was already halfway down the hill, jacket flapping, shouting something she couldn't hear over the wind. Their grandmother had told them to bring in the apples before the rain came, and Ben, typically, had turned it into a race.\n\nNadia moved more carefully, checking each tree as she passed. She had counted forty-three apples in the east row that morning, and she wasn't about to leave any behind. Ben, meanwhile, grabbed whatever he could reach and stuffed it into his basket without looking, more interested in beating the rain than filling it properly.\n\nBy the time the first heavy drops began to fall, Nadia's basket was neat and full. Ben's was half-empty, apples bruised where he'd dropped and caught them again. 'The sky's falling in,' he laughed, pointing at the clouds boiling grey above them, 'and you're still counting!'\n\nNadia didn't answer. She was thinking about what their grandmother always said: that the orchard rewarded patience, not speed. As the wind tore leaves from the branches and sent them spinning past her feet, she felt something she couldn't quite name — not fear exactly, but a kind of small, private thrill, as if the storm itself were testing whether she would rush.\n\nThey reached the kitchen door together, breathless, just as the rain turned the yard to mud behind them. Their grandmother looked at the two baskets — one careful and full, one scattered and half-empty — and said nothing at all. She didn't need to."
 }$json$,
 'Tick-box judgement plus two independently-textually-grounded reasons — Assessment Brain QT-RC-02, competency RC-02. Evidence: CSSE-008 Q1 (2022 Entry), CSSE-003 Q2 (2023 Entry).', 2, 'fv-eng-001'),

('fv-eng-001-q3', 'english', 'QT-RC-05', array['csse-founder-validation'], 'medium', 'short-answer', 110,
 $json${
   "id": "fv-eng-001-q3",
   "question": "Find a quotation that shows Ben was more concerned with the weather than with picking the apples carefully. Explain what the quotation shows.",
   "skill": "evidence",
   "marks": 3,
   "modelAnswer": "'The sky's falling in... and you're still counting!' This shows Ben saw racing the storm as the priority, and treated Nadia's carefulness as strange or amusing rather than sensible.",
   "passageTitle": "The Orchard",
   "passageText": "Nadia stood at the top of the orchard, watching the storm roll in from the coast. Her cousin Ben was already halfway down the hill, jacket flapping, shouting something she couldn't hear over the wind. Their grandmother had told them to bring in the apples before the rain came, and Ben, typically, had turned it into a race.\n\nNadia moved more carefully, checking each tree as she passed. She had counted forty-three apples in the east row that morning, and she wasn't about to leave any behind. Ben, meanwhile, grabbed whatever he could reach and stuffed it into his basket without looking, more interested in beating the rain than filling it properly.\n\nBy the time the first heavy drops began to fall, Nadia's basket was neat and full. Ben's was half-empty, apples bruised where he'd dropped and caught them again. 'The sky's falling in,' he laughed, pointing at the clouds boiling grey above them, 'and you're still counting!'\n\nNadia didn't answer. She was thinking about what their grandmother always said: that the orchard rewarded patience, not speed. As the wind tore leaves from the branches and sent them spinning past her feet, she felt something she couldn't quite name — not fear exactly, but a kind of small, private thrill, as if the storm itself were testing whether she would rush.\n\nThey reached the kitchen door together, breathless, just as the rain turned the yard to mud behind them. Their grandmother looked at the two baskets — one careful and full, one scattered and half-empty — and said nothing at all. She didn't need to."
 }$json$,
 'Quotation-and-explanation, labelled dual demand — Assessment Brain QT-RC-05, competency RC-02. Evidence: CSSE-003 Q6b/Q12 (2023 Entry), CSSE-008 Q7 (2022 Entry).', 2, 'fv-eng-001'),

('fv-eng-001-q4', 'english', 'QT-RC-10', array['csse-founder-validation'], 'medium', 'short-answer', 90,
 $json${
   "id": "fv-eng-001-q4",
   "question": "What does the phrase \"the storm itself were testing whether she would rush\" suggest about how Nadia experiences the weather?",
   "skill": "inference",
   "marks": 2,
   "modelAnswer": "It suggests Nadia treats the storm almost as a deliberate challenge to her patience rather than just bad weather — the personification shows her determination not to be rushed.",
   "passageTitle": "The Orchard",
   "passageText": "Nadia stood at the top of the orchard, watching the storm roll in from the coast. Her cousin Ben was already halfway down the hill, jacket flapping, shouting something she couldn't hear over the wind. Their grandmother had told them to bring in the apples before the rain came, and Ben, typically, had turned it into a race.\n\nNadia moved more carefully, checking each tree as she passed. She had counted forty-three apples in the east row that morning, and she wasn't about to leave any behind. Ben, meanwhile, grabbed whatever he could reach and stuffed it into his basket without looking, more interested in beating the rain than filling it properly.\n\nBy the time the first heavy drops began to fall, Nadia's basket was neat and full. Ben's was half-empty, apples bruised where he'd dropped and caught them again. 'The sky's falling in,' he laughed, pointing at the clouds boiling grey above them, 'and you're still counting!'\n\nNadia didn't answer. She was thinking about what their grandmother always said: that the orchard rewarded patience, not speed. As the wind tore leaves from the branches and sent them spinning past her feet, she felt something she couldn't quite name — not fear exactly, but a kind of small, private thrill, as if the storm itself were testing whether she would rush.\n\nThey reached the kitchen door together, breathless, just as the rain turned the yard to mud behind them. Their grandmother looked at the two baskets — one careful and full, one scattered and half-empty — and said nothing at all. She didn't need to."
 }$json$,
 'Effect-of-language interpretation of a personifying phrase — Assessment Brain QT-RC-10, competency RC-02. Evidence: CSSE-013 Q4/Q9 (2021 Entry), CSSE-008 Q8/Q9/Q11/Q14/Q16 (2022 Entry).', 2, 'fv-eng-001'),

('fv-eng-001-q5', 'english', 'QT-RC-07', array['csse-founder-validation'], 'medium', 'short-answer', 120,
 $json${
   "id": "fv-eng-001-q5",
   "question": "How did Nadia and Ben each approach picking the apples? Describe both, using evidence from the text.",
   "skill": "comparison",
   "marks": 4,
   "modelAnswer": "Nadia: careful and methodical — she checked each tree, counted the apples, and finished with a full, neat basket. Ben: careless and rushed — he grabbed apples without looking and finished with a half-empty basket of bruised fruit.",
   "passageTitle": "The Orchard",
   "passageText": "Nadia stood at the top of the orchard, watching the storm roll in from the coast. Her cousin Ben was already halfway down the hill, jacket flapping, shouting something she couldn't hear over the wind. Their grandmother had told them to bring in the apples before the rain came, and Ben, typically, had turned it into a race.\n\nNadia moved more carefully, checking each tree as she passed. She had counted forty-three apples in the east row that morning, and she wasn't about to leave any behind. Ben, meanwhile, grabbed whatever he could reach and stuffed it into his basket without looking, more interested in beating the rain than filling it properly.\n\nBy the time the first heavy drops began to fall, Nadia's basket was neat and full. Ben's was half-empty, apples bruised where he'd dropped and caught them again. 'The sky's falling in,' he laughed, pointing at the clouds boiling grey above them, 'and you're still counting!'\n\nNadia didn't answer. She was thinking about what their grandmother always said: that the orchard rewarded patience, not speed. As the wind tore leaves from the branches and sent them spinning past her feet, she felt something she couldn't quite name — not fear exactly, but a kind of small, private thrill, as if the storm itself were testing whether she would rush.\n\nThey reached the kitchen door together, breathless, just as the rain turned the yard to mud behind them. Their grandmother looked at the two baskets — one careful and full, one scattered and half-empty — and said nothing at all. She didn't need to."
 }$json$,
 'Multi-entity comparative extraction, parallel information about two named characters — Assessment Brain QT-RC-07, competency RC-01. Evidence: CSSE-003 Q8 (2023 Entry), CSSE-008 Q15 (2022 Entry).', 2, 'fv-eng-001'),

-- ── Mathematics (each atomic — learning_unit_id = id) ───────────────────
('fv-mth-001', 'maths', 'QT-MR-01', array['csse-founder-validation'], 'easy', 'short-answer', 45,
 $json${"id":"fv-mth-001","question":"Calculate: 5164 - 2879","answer":"2285","skill":"arithmetic","difficulty":"year5-core","marks":1,"workingSteps":["5164 - 2879 = 2285"]}$json$,
 'Direct arithmetic computation — Assessment Brain QT-MR-01, competency MR-01. Evidence: CSSE-006/011/016 Q1-Q3 (2021-2023 Entry, opening arithmetic questions).', 2, 'fv-mth-001'),

('fv-mth-002', 'maths', 'QT-MR-03', array['csse-founder-validation'], 'easy', 'short-answer', 45,
 $json${"id":"fv-mth-002","question":"How many millimetres are there in 4.7 metres?","answer":"4700","skill":"arithmetic","difficulty":"year5-core","marks":1,"workingSteps":["1m = 1000mm","4.7 x 1000 = 4700mm"]}$json$,
 'Unit conversion calculation — Assessment Brain QT-MR-03, competency MR-01. Evidence: CSSE-011 Q4a (2022 Entry), directly reused pattern ("how many millimetres in 3.12m").', 2, 'fv-mth-002'),

('fv-mth-003', 'maths', 'QT-MR-06', array['csse-founder-validation'], 'hard', 'short-answer', 90,
 $json${"id":"fv-mth-003","question":"X = 2Y and 2Z = Y. If X + Y + Z = 21, find Y.","answer":"6","skill":"reasoning","difficulty":"year5-advanced","marks":2,"workingSteps":["Y = 2Z, so X = 2Y = 4Z","Sum: 4Z + 2Z + Z = 21","7Z = 21, so Z = 3","Y = 2Z = 6"]}$json$,
 'Algebraic symbol/unknown-value problem-solving, small system requiring substitution across two relationships — Assessment Brain QT-MR-06, competency MR-02. Evidence: CSSE-011 Q6 (2022 Entry, "B=2A and 2C=A. If A+B+C=7, find A and C") — same structure, independently reworked with different letters/values.', 3, 'fv-mth-003'),

('fv-mth-004', 'maths', 'QT-MR-07', array['csse-founder-validation'], 'medium', 'short-answer', 60,
 $json${"id":"fv-mth-004","question":"An isosceles triangle has a base angle of 65 degrees. What is the size of the apex angle?","answer":"50","skill":"reasoning","difficulty":"year5-core","marks":1,"workingSteps":["Both base angles = 65 degrees","65 + 65 = 130","Apex = 180 - 130 = 50 degrees"]}$json$,
 'Geometric angle reasoning using the isosceles property and angle-sum-in-a-triangle — Assessment Brain QT-MR-07, competency MR-03. Evidence: CSSE-011 Q12 (2022 Entry, isosceles triangle, find an angle).', 2, 'fv-mth-004'),

('fv-mth-005', 'maths', 'QT-MR-09', array['csse-founder-validation'], 'easy', 'short-answer', 45,
 $json${"id":"fv-mth-005","question":"A cafe recorded cups of tea sold each day: Monday 18, Tuesday 22, Wednesday 15, Thursday 24, Friday 31. How many cups were sold in total from Monday to Friday?","answer":"110","skill":"arithmetic","difficulty":"year5-core","marks":1,"workingSteps":["18 + 22 + 15 + 24 + 31 = 110"]}$json$,
 'Data reading and extraction from a table, followed by a total calculation — Assessment Brain QT-MR-09, competency MR-01. Evidence: CSSE-011 Q15 (2022 Entry, museum visitor totals), CSSE-016 Q10 (2021 Entry, goals scored bar chart).', 2, 'fv-mth-005'),

('fv-mth-006', 'maths', 'QT-MR-12', array['csse-founder-validation'], 'medium', 'short-answer', 90,
 $json${"id":"fv-mth-006","question":"After 5 quiz rounds, Priya's average (mean) score is 14. (a) What is her total score from the 5 rounds? (b) In round 6 she scores 20. What is her new average?","answer":"70; new average 15","skill":"arithmetic","difficulty":"year5-core","marks":2,"workingSteps":["(a) Total = 14 x 5 = 70","(b) New total = 70 + 20 = 90","New average = 90 / 6 = 15"]}$json$,
 'Average (mean) calculation, forward reconstruction of a total then a further forward mean — Assessment Brain QT-MR-12, competency MR-01. Evidence: CSSE-011 Q11 (2022 Entry, "after 7 attempts her average is 13... 8th attempt scores 21, new average?") — same forward-then-forward structure, independently reworked. Practice UI reuses the app''s existing semicolon-split checker for the compound answer, matching the existing mth-006 precedent in migration 013.', 2, 'fv-mth-006')

on conflict (id) do nothing;
