-- Angel Digital 11+ — Migration 013
-- Capability 3, Wave 2 — Practice Experience: illustrative content mapping
--
-- WHAT THIS IS: 18 rows referencing Angel's own real, already-live content
-- (data/lessons.ts, data/maths.ts, data/writing.ts — the exact same text
-- shown today on /english, /maths, /writing), tagged against Assessment
-- Brain V1's frozen Question Type IDs (docs/intelligence/
-- ASSESSMENT_BRAIN_V1.md §9) so Learning Engine V1's evidence model has
-- something real to compute against for Wave 2.
--
-- WHAT THIS IS NOT: a production hand-tagging pass. Per this project's
-- own standing rule ("do not automate metadata generation" —
-- QUESTION_AUTHORING_STANDARD.md, applied identically to VR/Maths/English's
-- still-outstanding hand-tagging passes), the Question Type assigned to
-- each question below is this work package's own reasoned judgement, not a
-- subject-matter reviewer's sign-off. Every mapping is disclosed, with its
-- reasoning, in CAP3_WAVE2_ACCEPTANCE_PACK.md Section 3 — treat that
-- document as the audit trail for every `skill` value below, not this
-- comment. `learning_unit_id` for Reading Comprehension reuses the source
-- lesson's own id so sibling questions from one passage resolve to one
-- Learning Unit (ALI_DECISION_LOG.md Decision 36); Maths/Writing are atomic
-- (learning_unit_id = id).
--
-- HONEST COVERAGE GAPS (not force-fitted — see Acceptance Pack §3 for why):
--   - RC-04 (Sequential Ordering) has zero real content: no existing
--     Reading Comprehension question asks for chronological/sequential
--     reordering.
--   - QT-WC-01b (Picture-Stimulus Narrative) has zero real content: none
--     of Angel's 4 existing writing prompts use a picture stimulus — they
--     are text-only narrative/descriptive/persuasive prompts. Tagging one
--     of them QT-WC-01b would misrepresent a non-picture prompt as
--     picture-based, so it was not done.
--   - MR-06 / QT-MR-14 (Precision Under Exact-Match) has zero dedicated
--     content: Assessment Brain itself labels this Question Type
--     "cross-cutting" (§4) rather than a standalone item format, so no
--     single existing question is a clean, non-arbitrary fit.
--   - WC-02 has zero mapped Question Types at all in Assessment Brain's
--     own 27-type catalogue (Capability 3 Wave 1 Finding 2) — structurally
--     unfillable by content authoring, carried forward unchanged.
--
-- Depends on migrations 001 (subject_type already has english/maths/
-- writing), 005 (ali_question_bank, content_difficulty enum), 007
-- (learning_unit_id column). No new enum values needed.
-- Run this in: Supabase Dashboard > SQL Editor > New query

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, mastery_threshold, learning_unit_id)
values

-- ── Reading Comprehension (QT-RC-*) ─────────────────────────────────────
('eng-001-q2', 'english', 'QT-RC-03', array['csse'], 'medium', 'short-answer', 80,
 $json${
   "id": "eng-001-q2",
   "question": "What does the word 'frantic' tell us about the lighthouse keeper's state of mind as he wrote his journal?",
   "skill": "vocabulary",
   "marks": 2,
   "hint": "What does frantic mean? What does it suggest about feelings?",
   "modelAnswer": "'Frantic' suggests the keeper was increasingly panicked, desperate and out of control. The word implies that his fear was growing over time — moving beyond calm worry into something far more urgent and uncontrolled.",
   "passageTitle": "The Lighthouse Mystery",
   "passageText": "The wind whipped across the harbour as Mira pressed herself against the cold stone wall of the lighthouse. Three weeks had passed since the keeper had vanished, and still no explanation had emerged. The light continued to sweep the dark water in its steady, mechanical arc, indifferent to the mystery it illuminated.\n\nShe had found the notebook wedged behind a loose brick on the second landing — its pages dense with cramped handwriting, each entry growing more frantic than the last. The final entry simply read: \"It knows I'm here.\"\n\nAbove her, the great lens hummed and revolved. Somewhere below, the sea answered with its patient, ancient rhythm. Mira turned the notebook over in her hands. Whatever had happened here, the lighthouse held its secrets close."
 }$json$,
 'Word-meaning-in-context question — Assessment Brain QT-RC-03, competency RC-03.', 2, 'eng-001'),

('eng-001-q3', 'english', 'QT-RC-10', array['csse'], 'medium', 'short-answer', 90,
 $json${
   "id": "eng-001-q3",
   "question": "\"The sea answered with its patient, ancient rhythm.\" What effect does this image create? What technique has the writer used?",
   "skill": "inference",
   "marks": 3,
   "hint": "Look at the personification — the sea 'answering'. What contrast does this create with the human drama?",
   "modelAnswer": "The writer uses personification by giving the sea a human quality — the ability to 'answer', as if it is in conversation with the lighthouse. The words 'patient' and 'ancient' suggest that the sea has witnessed events like this before and is unmoved by them. This creates a sense of insignificance — the human mystery is small against the enormous, indifferent power of nature.",
   "passageTitle": "The Lighthouse Mystery",
   "passageText": "The wind whipped across the harbour as Mira pressed herself against the cold stone wall of the lighthouse. Three weeks had passed since the keeper had vanished, and still no explanation had emerged. The light continued to sweep the dark water in its steady, mechanical arc, indifferent to the mystery it illuminated.\n\nShe had found the notebook wedged behind a loose brick on the second landing — its pages dense with cramped handwriting, each entry growing more frantic than the last. The final entry simply read: \"It knows I'm here.\"\n\nAbove her, the great lens hummed and revolved. Somewhere below, the sea answered with its patient, ancient rhythm. Mira turned the notebook over in her hands. Whatever had happened here, the lighthouse held its secrets close."
 }$json$,
 'Effect-of-language interpretation — Assessment Brain QT-RC-10, competency RC-02.', 2, 'eng-001'),

('eng-002-q1', 'english', 'QT-RC-05', array['csse'], 'medium', 'short-answer', 120,
 $json${
   "id": "eng-002-q1",
   "question": "What impression do you get of Leo's character from this passage? Use at least two pieces of evidence.",
   "skill": "character",
   "marks": 4,
   "hint": "Look at what he collects, what he says, and how the narrator describes him.",
   "modelAnswer": "Leo comes across as thoughtful, observant and unusual. The fact that he collects 'silences' rather than physical objects shows he is sensitive to emotions and atmosphere — he notices things others overlook. His response to Priya — 'Everything worth understanding is strange' — shows he is confident and philosophical for his age, suggesting intelligence and self-assurance despite being different.",
   "passageTitle": "The Boy Who Collected Silence",
   "passageText": "Everyone in Ashford knew that Leo collected things. Bottle caps, pressed leaves, stamps from countries he'd never visited. But what nobody knew — because he had never told anyone — was that his most prized collection could not be kept in boxes or catalogued on shelves.\n\nLeo collected silences.\n\nNot the absence of sound, exactly. There was the silence after a question nobody wanted to answer. The silence in the kitchen after his parents argued. The silence of a library on the first morning of the summer holidays, when it smelled of old paper and possibility. He kept these the way other people kept photographs: carefully, in order, for safekeeping.\n\n\"You're strange,\" his classmate Priya had once told him, though she meant it almost kindly.\n\n\"Everything worth understanding is strange,\" Leo replied, which she thought was probably true."
 }$json$,
 'Requires citing evidence and explaining significance — Assessment Brain QT-RC-05, competency RC-02.', 2, 'eng-002'),

('eng-002-q3', 'english', 'QT-RC-05', array['csse'], 'medium', 'short-answer', 60,
 $json${
   "id": "eng-002-q3",
   "question": "\"He kept these the way other people kept photographs: carefully, in order, for safekeeping.\" What does this simile tell us about Leo?",
   "skill": "evidence",
   "marks": 2,
   "modelAnswer": "The simile comparing his silences to photographs suggests Leo values his emotional memories as much as others value physical mementos. Photographs are kept to preserve moments — by comparing his silences to them, the writer shows that Leo's emotional experiences are real and precious to him, even if invisible to others.",
   "passageTitle": "The Boy Who Collected Silence",
   "passageText": "Everyone in Ashford knew that Leo collected things. Bottle caps, pressed leaves, stamps from countries he'd never visited. But what nobody knew — because he had never told anyone — was that his most prized collection could not be kept in boxes or catalogued on shelves.\n\nLeo collected silences.\n\nNot the absence of sound, exactly. There was the silence after a question nobody wanted to answer. The silence in the kitchen after his parents argued. The silence of a library on the first morning of the summer holidays, when it smelled of old paper and possibility. He kept these the way other people kept photographs: carefully, in order, for safekeeping.\n\n\"You're strange,\" his classmate Priya had once told him, though she meant it almost kindly.\n\n\"Everything worth understanding is strange,\" Leo replied, which she thought was probably true."
 }$json$,
 'A quotation is given and explained — Assessment Brain QT-RC-05, competency RC-02.', 2, 'eng-002'),

('eng-003-q3', 'english', 'QT-RC-08', array['csse'], 'hard', 'short-answer', 90,
 $json${
   "id": "eng-003-q3",
   "question": "How does Thomas try to reassure his mother throughout the letter? Find three specific examples.",
   "skill": "evidence",
   "marks": 3,
   "modelAnswer": "1. He says 'I do not say this to worry you' — directly acknowledging her concern and trying to pre-empt it. 2. He tells her to 'tell Father I am well' — giving a clear, simple reassurance. 3. He ends with the image of shared stars — 'I take comfort in knowing we share them' — creating a sense of connection across the distance to ease loneliness on both sides.",
   "passageTitle": "Letters from the Trenches",
   "passageText": "My dear mother,\n\nI am writing this in what passes for a quiet hour, though I use the word 'quiet' loosely. The guns are never entirely still, and one learns, in time, to hear them as a kind of weather — threatening but distant, like a storm that may or may not arrive.\n\nWe have been here three weeks now and I confess I no longer recognise the young man who left Coventry in September. I do not say this to worry you. I have found here a kind of resolve I did not know I possessed. The men beside me are extraordinary — ordinary men made extraordinary by circumstance.\n\nTell Father I am well. Tell him also that I have been thinking much about the workshop, and that when this business is finished, I intend to return to it with a greater appreciation for the smell of sawdust and the sound of wood being worked than I ever had before.\n\nThe stars here are remarkable, mother. I suspect they are the same stars you see above Coventry, but they look different from here — older and further away. I take comfort in knowing we share them.\n\nYour loving son,\nThomas"
 }$json$,
 'Explicit "find three examples" instruction — Assessment Brain QT-RC-08, competency RC-01.', 3, 'eng-003'),

-- ── Mathematics (QT-MR-*) ────────────────────────────────────────────────
('mth-002', 'maths', 'QT-MR-01', array['csse'], 'hard', 'short-answer', 60,
 $json${"id":"mth-002","question":"What is the value of 4³ + √144?","answer":"76","skill":"arithmetic","difficulty":"year5-advanced","marks":2,"workingSteps":["4³ = 4 × 4 × 4 = 64","√144 = 12","64 + 12 = 76"]}$json$,
 'Direct arithmetic computation — Assessment Brain QT-MR-01, competency MR-01.', 3, 'mth-002'),

('mth-004', 'maths', 'QT-MR-01', array['csse'], 'hard', 'short-answer', 60,
 $json${"id":"mth-004","question":"What is 3/8 + 5/6? Give your answer as a mixed number in its simplest form.","answer":"1 5/24","skill":"fractions","difficulty":"year5-advanced","marks":2,"workingSteps":["LCM of 8 and 6 = 24","3/8 = 9/24","5/6 = 20/24","9/24 + 20/24 = 29/24","29/24 = 1 5/24"]}$json$,
 'Direct arithmetic computation (fractions fold into Assessment Brain''s Arithmetic Calculation domain, no dedicated fractions Question Type) — QT-MR-01, competency MR-01.', 3, 'mth-004'),

('mth-008', 'maths', 'QT-MR-01', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mth-008","question":"Calculate: 2.4 × 0.35","answer":"0.84","skill":"arithmetic","difficulty":"year5-core","marks":1,"workingSteps":["2.4 has 1 decimal place, 0.35 has 2 decimal places → answer has 3 dp","Multiply as integers: 24 × 35 = 840","Divide by 1000 → 0.840 = 0.84"]}$json$,
 'Direct arithmetic computation — Assessment Brain QT-MR-01, competency MR-01.', 2, 'mth-008'),

('qa-008', 'maths', 'QT-MR-01', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"qa-008","question":"√225 = ?","answer":"15","skill":"arithmetic","difficulty":"year5-core","marks":1}$json$,
 'Direct arithmetic computation — Assessment Brain QT-MR-01, competency MR-01.', 2, 'qa-008'),

('mth-006', 'maths', 'QT-MR-05', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mth-006","question":"The nth term of a sequence is 4n - 3. What is the 12th term? What is the first term greater than 100?","answer":"45; 26th term (101)","skill":"pattern","difficulty":"year5-advanced","marks":3,"workingSteps":["12th term: 4(12) - 3 = 48 - 3 = 45","For first term > 100: 4n - 3 > 100","4n > 103, n > 25.75","So n = 26: 4(26) - 3 = 104 - 3 = 101","The 26th term is 101 — the first term greater than 100"]}$json$,
 'Sequence/function-rule application — Assessment Brain QT-MR-05, competency MR-02. Compound answer ("45; 26th term (101)") — practice UI must reuse the app''s existing semicolon-split checker (app/maths/page.tsx), not a new one.', 3, 'mth-006'),

('mth-003', 'maths', 'QT-MR-07', array['csse'], 'medium', 'short-answer', 90,
 $json${"id":"mth-003","question":"A rectangle has a perimeter of 48 cm. Its length is three times its width. What is the area of the rectangle?","answer":"108","skill":"reasoning","difficulty":"year5-core","marks":3,"workingSteps":["Let width = w, then length = 3w","Perimeter: 2(w + 3w) = 48","2 × 4w = 48, so 8w = 48, w = 6 cm","Length = 18 cm","Area = 6 × 18 = 108 cm²"]}$json$,
 'Multi-topic question (algebraic setup + geometric area); dominant tested construct is the perimeter/area relationship, so tagged QT-MR-07, competency MR-03, per this project''s existing "one primary competency by dominant skill" convention (ALI Decision 34) — a judgement call, disclosed in the Acceptance Pack.', 2, 'mth-003'),

('mth-009', 'maths', 'QT-MR-07', array['csse'], 'challenge', 'short-answer', 90,
 $json${"id":"mth-009","question":"A cylinder has a radius of 5 cm and a height of 12 cm. What is its volume? (Use π = 3.14)","answer":"942 cm³","skill":"reasoning","difficulty":"year6-exam","marks":3,"workingSteps":["V = π × r² × h","V = 3.14 × 5² × 12","V = 3.14 × 25 × 12","V = 3.14 × 300","V = 942 cm³"]}$json$,
 'Geometric reasoning via formula application — Assessment Brain QT-MR-07, competency MR-03.', 3, 'mth-009'),

('mth-010', 'maths', 'QT-MR-04', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mth-010","question":"What percentage of 340 is 85?","answer":"25%","skill":"arithmetic","difficulty":"year5-core","marks":2,"workingSteps":["85 ÷ 340 × 100","= 0.25 × 100","= 25%"]}$json$,
 'Direct percentage calculation — Assessment Brain QT-MR-04, competency MR-04.', 2, 'mth-010'),

('mth-007b', 'maths', 'QT-MR-04', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mth-007b","question":"In a class, the ratio of boys to girls is 3:4. There are 28 girls. How many students are there altogether?","answer":"49","skill":"reasoning","difficulty":"year5-core","marks":2,"workingSteps":["4 parts = 28 girls, so 1 part = 7","Boys = 3 × 7 = 21","Total = 21 + 28 = 49"]}$json$,
 'Ratio is a form of proportional-change reasoning — Assessment Brain QT-MR-04, competency MR-04.', 2, 'mth-007b'),

('mth-005', 'maths', 'QT-MR-13', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mth-005","question":"A shopkeeper bought 40 books for £3.50 each and sold them for £5.20 each. How much profit did he make in total?","answer":"£68","skill":"word-problem","difficulty":"year5-core","marks":2,"workingSteps":["Profit per book = £5.20 - £3.50 = £1.70","Total profit = 40 × £1.70 = £68"]}$json$,
 'Per-unit-value scaled by quantity — closest fit is Assessment Brain QT-MR-13 (Best-Value/Combinatorial Word Problem), competency MR-04.', 2, 'mth-005'),

('mth-001', 'maths', 'QT-MR-10', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mth-001","question":"A train travels at 60 miles per hour. How long does it take to travel 225 miles? Give your answer in hours and minutes.","answer":"3 hours 45 minutes","skill":"word-problem","difficulty":"year5-core","marks":2,"workingSteps":["225 ÷ 60 = 3.75 hours","0.75 hours × 60 = 45 minutes","Answer: 3 hours 45 minutes"]}$json$,
 'Elapsed-time word problem — Assessment Brain QT-MR-10, competency MR-04.', 2, 'mth-001'),

('qa-010', 'maths', 'QT-MR-11', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"qa-010","question":"LCM of 6 and 9 = ?","answer":"18","skill":"pattern","difficulty":"year5-core","marks":1}$json$,
 'Number-property reasoning — Assessment Brain QT-MR-11, competency MR-05.', 2, 'qa-010'),

-- ── Continuous Writing (QT-WC-01a only — see header for QT-WC-01b gap) ──
('wrt-003', 'writing', 'QT-WC-01a', array['csse'], 'hard', 'open-response', 1500,
 $json${
   "id": "wrt-003",
   "title": "Should Schools Ban Smartphones?",
   "prompt": "Write a persuasive speech to be delivered to your school's headteacher, arguing either FOR or AGAINST a total ban on smartphones in school.\n\nYour speech must be confident, well-reasoned, and persuasive. Use at least three strong arguments.",
   "type": "persuasive",
   "difficulty": "year5-advanced",
   "timeMinutes": 25,
   "checklist": [
     "Open with a strong, attention-grabbing statement or rhetorical question",
     "State your position clearly in the first paragraph",
     "Use three separate, distinct arguments (one per paragraph)",
     "Support each argument with evidence, example, or logic",
     "Use rhetorical techniques: rule of three, rhetorical question, repetition, direct address",
     "Acknowledge the opposing view and refute it (this shows confidence)",
     "Conclude with a powerful, memorable final sentence",
     "Formal register throughout — no slang, no contractions",
     "Check paragraphing and punctuation carefully"
   ]
 }$json$,
 'Discursive/persuasive argument prompt — closest real match to Assessment Brain QT-WC-01a (Reflective/Discursive Prompt), competency WC-01.', 3, 'wrt-003')

on conflict (id) do nothing;
