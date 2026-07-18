-- WP-22 Proposed Import — Non-Verbal / Spatial / Mathematical Reasoning
-- Generated from WP-02_PROPOSED_METADATA.md's per-competency disposition
-- tables, cross-checked against real content in data/non-verbal-reasoning,
-- data/spatial-reasoning, data/numerical-reasoning.
--
-- STATUS: Educational disposition RECORDED (WP-22_CONTENT_DISPOSITION.md §0)
-- — the 112 rows below are approved for production authorisation. SQL
-- EXECUTION IS NOT YET AUTHORISED (Programme Decision APD-052, Import
-- Authorisation Separation): an import-ready artefact is not itself
-- authority to execute an import. DO NOT RUN AGAINST PRODUCTION until
-- recorded production authorisation and deployment verification both occur.
--
-- 112 of 120 tagged questions included. 8 excluded pending resolution of a
-- genuine competency-mapping or difficulty-tier ambiguity (WP-02's own
-- "Ambiguous Questions Requiring Human Judgement" section):
--   nvr-009, nvr-030, nvr-036, nvr-011, sr-009, sr-029, nr-011, nr-021
--
-- confidence_weight is left at the schema default (1.00) for every row —
-- WP-02 did not propose a per-question confidence_weight, so none is
-- invented here. This means none of these 112 questions will be treated as
-- "guessable format" by WP-05's Confidence Model until a future,
-- deliberate content-authoring pass assigns real values — flagged as an
-- open item, not resolved by this generation step.


-- nvr.pattern-completion (11 rows)
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-001',
  'non-verbal-reasoning',
  'nvr.pattern-completion',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  18,
  $q${"id":"nvr-001","question":"In a 3×3 grid, each row must contain ●, ▲ and ■ exactly once.\nRow 1: ● ▲ ■\nRow 2: ▲ ■ ●\nRow 3: ■ ? ▲\nWhat symbol fills the ? position?","answer":"●","alternatives":["circle","filled circle"],"explanation":"Row 3 already contains ■ and ▲. Since each row must have all three symbols exactly once, the missing symbol is ●.","category":"Pattern Grids","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$Row 3 already contains ■ and ▲. Since each row must have all three symbols exactly once, the missing symbol is ●.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-013',
  'non-verbal-reasoning',
  'nvr.pattern-completion',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  18,
  $q${"id":"nvr-013","question":"In a 3×3 grid, each column must also contain ●, ▲ and ■ exactly once.\nColumn 3: ■ (row 1), ● (row 2), ? (row 3).\nWhat symbol fills the ? position?","answer":"▲","alternatives":["triangle","filled triangle"],"explanation":"Column 3 already contains ■ and ●. Since each column must have all three symbols exactly once, the missing symbol is ▲.","category":"Pattern Grids","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$Column 3 already contains ■ and ●. Since each column must have all three symbols exactly once, the missing symbol is ▲.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-024',
  'non-verbal-reasoning',
  'nvr.pattern-completion',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  30,
  $q${"id":"nvr-024","question":"In a grid pattern:\nRow 1: ○ ○ ●\nRow 2: ○ ● ●\nRow 3: ● ● ?\nEach row has one more ● than the last. What is the missing symbol?","answer":"●","alternatives":["filled circle"],"explanation":"Row 1 has 1 filled circle, Row 2 has 2, Row 3 must have 3. The missing symbol is ●.","category":"Pattern Grids","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$Row 1 has 1 filled circle, Row 2 has 2, Row 3 must have 3. The missing symbol is ●.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-012',
  'non-verbal-reasoning',
  'nvr.pattern-completion',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  30,
  $q${"id":"nvr-012","question":"In a pattern, the right-column shape always has one more side than the left-column shape.\nLeft: triangle (3 sides) → Right: square (4 sides).\nLeft: square (4 sides) → Right: ? shape.\nHow many sides does the right-column shape have?","answer":"5","alternatives":["five","pentagon"],"explanation":"The rule is right shape = left shape + 1 side. A square has 4 sides, so the right-column shape has 4 + 1 = 5 sides (a pentagon).","category":"Pattern Rules","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$The rule is right shape = left shape + 1 side. A square has 4 sides, so the right-column shape has 4 + 1 = 5 sides (a pentagon).$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-020',
  'non-verbal-reasoning',
  'nvr.pattern-completion',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  32,
  $q${"id":"nvr-020","question":"A number pattern grid has the rule: cell value = row number × column number.\nRow 2, Column 4 = 2 × 4 = 8. What is the value at Row 3, Column 3?","answer":"9","explanation":"Row 3, Column 3: 3 × 3 = 9.","category":"Pattern Rules","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$Row 3, Column 3: 3 × 3 = 9.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-023',
  'non-verbal-reasoning',
  'nvr.pattern-completion',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'hard',
  'multiple-choice',
  55,
  $q${"id":"nvr-023","question":"Find the next term: 2, 5, 10, 17, 26, ?\n(The differences between terms are 3, 5, 7, 9… — consecutive odd numbers.)","answer":"37","explanation":"The differences between terms increase by 2 each time: +3, +5, +7, +9, +11. So 26 + 11 = 37.","category":"Pattern Rules","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$The differences between terms increase by 2 each time: +3, +5, +7, +9, +11. So 26 + 11 = 37.$e$,
  null,
  1.00,
  3
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-025',
  'non-verbal-reasoning',
  'nvr.pattern-completion',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  35,
  $q${"id":"nvr-025","question":"A sequence starts at 4 and adds 2 each time: 4, 6, 8, 10, 12, 14. What is the 10th term in this sequence?","answer":"22","explanation":"The nth term = 2n + 2. For n=10: 2(10) + 2 = 22. Or counting: 4, 6, 8, 10, 12, 14, 16, 18, 20, 22.","category":"Pattern Rules","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$The nth term = 2n + 2. For n=10: 2(10) + 2 = 22. Or counting: 4, 6, 8, 10, 12, 14, 16, 18, 20, 22.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-008',
  'non-verbal-reasoning',
  'nvr.pattern-completion',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  20,
  $q${"id":"nvr-008","question":"A pattern sequence adds 2 shapes each time: 2 shapes, 4 shapes, 6 shapes, 8 shapes. How many shapes come next?","answer":"10","explanation":"Each group increases by 2. After 8, the next term is 8 + 2 = 10.","category":"Pattern Sequences","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$Each group increases by 2. After 8, the next term is 8 + 2 = 10.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-016',
  'non-verbal-reasoning',
  'nvr.pattern-completion',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  30,
  $q${"id":"nvr-016","question":"In a growing pattern, Row 1 has 1 dot, Row 2 has 3 dots, Row 3 has 5 dots. Following this pattern, how many dots does Row 5 have?","answer":"9","explanation":"The pattern increases by 2 each time (odd numbers: 1, 3, 5, 7, 9). Row 4 has 7 dots, so Row 5 has 9 dots.","category":"Pattern Sequences","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$The pattern increases by 2 each time (odd numbers: 1, 3, 5, 7, 9). Row 4 has 7 dots, so Row 5 has 9 dots.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-021',
  'non-verbal-reasoning',
  'nvr.pattern-completion',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  30,
  $q${"id":"nvr-021","question":"A sequence doubles each time: 3, 6, 12, 24, ?. What comes next?","answer":"48","explanation":"Each term is multiplied by 2: 3×2=6, 6×2=12, 12×2=24, 24×2=48.","category":"Pattern Sequences","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$Each term is multiplied by 2: 3×2=6, 6×2=12, 12×2=24, 24×2=48.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-022',
  'non-verbal-reasoning',
  'nvr.pattern-completion',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  22,
  $q${"id":"nvr-022","question":"A number sequence adds 5 each time: 7, 12, 17, 22, ?. What comes next?","answer":"27","explanation":"Each term increases by 5: 7+5=12, 12+5=17, 17+5=22, 22+5=27.","category":"Pattern Sequences","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$Each term increases by 5: 7+5=12, 12+5=17, 17+5=22, 22+5=27.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;


-- nvr.symbol-codes (8 rows)
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-007',
  'non-verbal-reasoning',
  'nvr.symbol-codes',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  20,
  $q${"id":"nvr-007","question":"In a number-shape code: ● = 3 and ▲ = 5. What is the value of ● + ▲ + ●?","answer":"11","explanation":"● + ▲ + ● = 3 + 5 + 3 = 11.","category":"Symbol Codes","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$● + ▲ + ● = 3 + 5 + 3 = 11.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-017',
  'non-verbal-reasoning',
  'nvr.symbol-codes',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  40,
  $q${"id":"nvr-017","question":"In a symbol code: ★=10 and ☆=4. What is the value of ★ + ☆ + ☆ − ★?","answer":"8","explanation":"★ + ☆ + ☆ − ★ = 10 + 4 + 4 − 10 = 8.","category":"Symbol Codes","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$★ + ☆ + ☆ − ★ = 10 + 4 + 4 − 10 = 8.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-018',
  'non-verbal-reasoning',
  'nvr.symbol-codes',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  40,
  $q${"id":"nvr-018","question":"In a shape code: ▲=6, ○=4, ■=2. What is the value of ▲ × ○ ÷ ■?","answer":"12","explanation":"▲ × ○ ÷ ■ = 6 × 4 ÷ 2 = 24 ÷ 2 = 12.","category":"Symbol Codes","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$▲ × ○ ÷ ■ = 6 × 4 ÷ 2 = 24 ÷ 2 = 12.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-019',
  'non-verbal-reasoning',
  'nvr.symbol-codes',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  20,
  $q${"id":"nvr-019","question":"In a shape code: ▲=5, □=3, ○=7. What is ▲ + □ + ○?","answer":"15","explanation":"▲ + □ + ○ = 5 + 3 + 7 = 15.","category":"Symbol Codes","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$▲ + □ + ○ = 5 + 3 + 7 = 15.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-002',
  'non-verbal-reasoning',
  'nvr.symbol-codes',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  15,
  $q${"id":"nvr-002","question":"What comes next in the alternating sequence: ● ○ ● ○ ● ?","answer":"○","alternatives":["empty circle","hollow circle","unfilled circle"],"explanation":"The sequence alternates between filled (●) and empty (○) circles. After ●, the next must be ○.","category":"Symbol Sequences","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$The sequence alternates between filled (●) and empty (○) circles. After ●, the next must be ○.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-014',
  'non-verbal-reasoning',
  'nvr.symbol-codes',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  20,
  $q${"id":"nvr-014","question":"What comes next in the pattern: ● ● ○ ● ● ○ ● ● ?","answer":"○","alternatives":["empty circle","hollow circle"],"explanation":"The pattern repeats every 3 symbols: ● ● ○. After ● ●, the next must be ○.","category":"Symbol Sequences","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$The pattern repeats every 3 symbols: ● ● ○. After ● ●, the next must be ○.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-015',
  'non-verbal-reasoning',
  'nvr.symbol-codes',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  15,
  $q${"id":"nvr-015","question":"In a pattern sequence: △ □ △ □ △ ___. What shape comes next?","answer":"□","alternatives":["square","■"],"explanation":"The sequence alternates between △ and □. After △, the next shape is □.","category":"Symbol Sequences","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$The sequence alternates between △ and □. After △, the next shape is □.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-026',
  'non-verbal-reasoning',
  'nvr.symbol-codes',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'hard',
  'multiple-choice',
  50,
  $q${"id":"nvr-026","question":"In a 3-column grid, every row must add up to 12.\nRow 1: 3 + 4 + 5 = 12 ✓\nRow 2: 6 + 2 + 4 = 12 ✓\nRow 3: 5 + 3 + ? = 12\nWhat is the missing number?","answer":"4","explanation":"Row 3: 5 + 3 + ? = 12. So ? = 12 − 5 − 3 = 4.","category":"Number Grids","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$Row 3: 5 + 3 + ? = 12. So ? = 12 − 5 − 3 = 4.$e$,
  null,
  1.00,
  3
)
on conflict (id) do nothing;


-- nvr.rotation (5 rows)
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-003',
  'non-verbal-reasoning',
  'nvr.rotation',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  15,
  $q${"id":"nvr-003","question":"An arrow points East. It is rotated 90° clockwise. Which direction does it now point?","answer":"South","alternatives":["south"],"explanation":"A 90° clockwise rotation turns: North→East, East→South, South→West, West→North. East rotated 90° clockwise points South.","hint":"Imagine turning a compass 90° to the right.","category":"Rotation","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$A 90° clockwise rotation turns: North→East, East→South, South→West, West→North. East rotated 90° clockwise points South.$e$,
  $h$Imagine turning a compass 90° to the right.$h$,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-027',
  'non-verbal-reasoning',
  'nvr.rotation',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  15,
  $q${"id":"nvr-027","question":"An arrow points North. After a single 90° anticlockwise rotation, which direction does it point?","answer":"West","alternatives":["west"],"explanation":"90° anticlockwise from North goes to West. Anticlockwise rotation order: N → W → S → E → N.","category":"Rotation","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$90° anticlockwise from North goes to West. Anticlockwise rotation order: N → W → S → E → N.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-028',
  'non-verbal-reasoning',
  'nvr.rotation',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  30,
  $q${"id":"nvr-028","question":"An arrow points South-West. After a 180° rotation, which direction does it point?","answer":"North-East","alternatives":["northeast","north-east","NE"],"explanation":"A 180° rotation (half turn) sends South-West to exactly the opposite direction, which is North-East.","category":"Rotation","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$A 180° rotation (half turn) sends South-West to exactly the opposite direction, which is North-East.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-039',
  'non-verbal-reasoning',
  'nvr.rotation',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'hard',
  'multiple-choice',
  40,
  $q${"id":"nvr-039","question":"A shape is rotated 90° clockwise, then 90° anticlockwise. What is the net rotation?","answer":"0","alternatives":["0°","zero","no rotation","none"],"explanation":"Rotating 90° clockwise and then 90° anticlockwise returns the shape to its original position — the net rotation is 0°.","category":"Rotation","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$Rotating 90° clockwise and then 90° anticlockwise returns the shape to its original position — the net rotation is 0°.$e$,
  null,
  1.00,
  3
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-040',
  'non-verbal-reasoning',
  'nvr.rotation',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'hard',
  'multiple-choice',
  45,
  $q${"id":"nvr-040","question":"An arrow pointing East is rotated 270° clockwise. Which direction does it now point?","answer":"North","alternatives":["north"],"explanation":"270° clockwise equals 90° anticlockwise. East rotated 90° anticlockwise → North (anticlockwise order: E → N → W → S → E).","category":"Rotation","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$270° clockwise equals 90° anticlockwise. East rotated 90° anticlockwise → North (anticlockwise order: E → N → W → S → E).$e$,
  null,
  1.00,
  3
)
on conflict (id) do nothing;


-- nvr.reflection-symmetry (7 rows)
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-004',
  'non-verbal-reasoning',
  'nvr.reflection-symmetry',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  18,
  $q${"id":"nvr-004","question":"The letter b is reflected in a vertical mirror. What letter does the result most resemble?","answer":"d","explanation":"Reflecting b in a vertical mirror flips it left-to-right, producing the letter d.","category":"Reflection","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$Reflecting b in a vertical mirror flips it left-to-right, producing the letter d.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-029',
  'non-verbal-reasoning',
  'nvr.reflection-symmetry',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  30,
  $q${"id":"nvr-029","question":"The letter d reflected in a horizontal mirror (flipped upside-down) most resembles which letter: b, p or q?","answer":"p","explanation":"When lowercase d is flipped upside-down (reflected in a horizontal axis), the curve stays on the left but the stroke points downward, giving the shape of p.","category":"Reflection","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$When lowercase d is flipped upside-down (reflected in a horizontal axis), the curve stays on the left but the stroke points downward, giving the shape of p.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-035',
  'non-verbal-reasoning',
  'nvr.reflection-symmetry',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  18,
  $q${"id":"nvr-035","question":"A triangle pointing right (▷) is reflected in a vertical mirror. Which direction does the triangle now point?","answer":"left","alternatives":["◁","to the left"],"explanation":"Reflection in a vertical mirror flips the shape left-to-right. A triangle pointing right becomes a triangle pointing left.","category":"Reflection","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$Reflection in a vertical mirror flips the shape left-to-right. A triangle pointing right becomes a triangle pointing left.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-031',
  'non-verbal-reasoning',
  'nvr.reflection-symmetry',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  15,
  $q${"id":"nvr-031","question":"How many lines of symmetry does a square have?","answer":"4","explanation":"A square has 4 lines of symmetry: 2 through opposite midpoints of sides (horizontal and vertical), and 2 through opposite corners (diagonal).","category":"Symmetry","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$A square has 4 lines of symmetry: 2 through opposite midpoints of sides (horizontal and vertical), and 2 through opposite corners (diagonal).$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-032',
  'non-verbal-reasoning',
  'nvr.reflection-symmetry',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  15,
  $q${"id":"nvr-032","question":"How many lines of symmetry does an equilateral triangle have?","answer":"3","explanation":"An equilateral triangle has 3 lines of symmetry, each running from a vertex to the midpoint of the opposite side.","category":"Symmetry","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$An equilateral triangle has 3 lines of symmetry, each running from a vertex to the midpoint of the opposite side.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-033',
  'non-verbal-reasoning',
  'nvr.reflection-symmetry',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  25,
  $q${"id":"nvr-033","question":"A regular hexagon has 6 lines of symmetry. How many lines of symmetry does a regular octagon have?","answer":"8","explanation":"For any regular polygon, the number of lines of symmetry equals the number of sides. A regular octagon has 8 sides, so it has 8 lines of symmetry.","category":"Symmetry","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$For any regular polygon, the number of lines of symmetry equals the number of sides. A regular octagon has 8 sides, so it has 8 lines of symmetry.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-037',
  'non-verbal-reasoning',
  'nvr.reflection-symmetry',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'hard',
  'multiple-choice',
  40,
  $q${"id":"nvr-037","question":"Which capital letter has ZERO lines of symmetry: A, F, T or M?","answer":"F","explanation":"A has 1 vertical line of symmetry. T has 1 vertical line. M has 1 vertical line. F has no lines of symmetry — it looks different when reflected in any direction.","category":"Symmetry","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$A has 1 vertical line of symmetry. T has 1 vertical line. M has 1 vertical line. F has no lines of symmetry — it looks different when reflected in any direction.$e$,
  null,
  1.00,
  3
)
on conflict (id) do nothing;


-- nvr.shape-properties (4 rows)
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-006',
  'non-verbal-reasoning',
  'nvr.shape-properties',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  20,
  $q${"id":"nvr-006","question":"Which shape is the odd one out: square, rectangle, rhombus, triangle, parallelogram?","answer":"triangle","explanation":"A square, rectangle, rhombus and parallelogram all have 4 sides (they are quadrilaterals). A triangle has only 3 sides — it is the odd one out.","category":"Shape Properties","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$A square, rectangle, rhombus and parallelogram all have 4 sides (they are quadrilaterals). A triangle has only 3 sides — it is the odd one out.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-010',
  'non-verbal-reasoning',
  'nvr.shape-properties',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  18,
  $q${"id":"nvr-010","question":"How many more sides does an octagon have than a pentagon?","answer":"3","explanation":"An octagon has 8 sides. A pentagon has 5 sides. 8 − 5 = 3 more sides.","category":"Shape Properties","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$An octagon has 8 sides. A pentagon has 5 sides. 8 − 5 = 3 more sides.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-034',
  'non-verbal-reasoning',
  'nvr.shape-properties',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  20,
  $q${"id":"nvr-034","question":"A shape has 4 equal sides, 4 right angles and 4 lines of symmetry. What is this shape called?","answer":"square","explanation":"A shape with 4 equal sides, 4 right angles and 4 lines of symmetry is a square. A rectangle has 4 right angles but not 4 equal sides.","category":"Shape Properties","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$A shape with 4 equal sides, 4 right angles and 4 lines of symmetry is a square. A rectangle has 4 right angles but not 4 equal sides.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-038',
  'non-verbal-reasoning',
  'nvr.shape-properties',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'hard',
  'multiple-choice',
  35,
  $q${"id":"nvr-038","question":"A non-rectangular parallelogram (where no angles are 90°) has how many lines of symmetry?","answer":"0","alternatives":["zero","none"],"explanation":"A parallelogram with no right angles has no lines of symmetry. Its sides are parallel but the shape is slanted, so any mirror reflection changes its appearance.","category":"Shape Properties","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$A parallelogram with no right angles has no lines of symmetry. Its sides are parallel but the shape is slanted, so any mirror reflection changes its appearance.$e$,
  null,
  1.00,
  3
)
on conflict (id) do nothing;


-- nvr.3d-shapes (1 rows)
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nvr-005',
  'non-verbal-reasoning',
  'nvr.3d-shapes',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  35,
  $q${"id":"nvr-005","question":"A cross-shaped net (a plus sign made of 6 squares) is folded into a 3D shape. How many faces does this shape have?","answer":"6","explanation":"A cross-shaped net with 6 squares folds into a cube. A cube has exactly 6 faces.","category":"Nets and 3D Shapes","skill":"non-verbal-reasoning","marks":1}$q$::jsonb,
  $e$A cross-shaped net with 6 squares folds into a cube. A cube has exactly 6 faces.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;


-- sr.paper-folding (8 rows)
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-001',
  'spatial-reasoning',
  'sr.paper-folding',
  ARRAY['gl', 'iseb']::text[],
  'easy',
  'multiple-choice',
  20,
  $q${"id":"sr-001","question":"A square piece of paper is folded in half, then folded in half again. How many layers of paper are there after both folds?","answer":"4","explanation":"First fold: 1 layer becomes 2 layers. Second fold: 2 layers become 4 layers. Each fold doubles the number of layers.","category":"Paper Folding","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$First fold: 1 layer becomes 2 layers. Second fold: 2 layers become 4 layers. Each fold doubles the number of layers.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-002',
  'spatial-reasoning',
  'sr.paper-folding',
  ARRAY['gl', 'iseb']::text[],
  'easy',
  'multiple-choice',
  20,
  $q${"id":"sr-002","question":"A square piece of paper is folded in half along the vertical centre line. A hole is punched through the folded paper. When unfolded, how many holes are there?","answer":"2","explanation":"When folded, the paper has 2 layers. Punching one hole goes through both layers. Unfolding reveals 2 holes — one on each half of the paper.","category":"Paper Folding","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$When folded, the paper has 2 layers. Punching one hole goes through both layers. Unfolding reveals 2 holes — one on each half of the paper.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-003',
  'spatial-reasoning',
  'sr.paper-folding',
  ARRAY['gl', 'iseb']::text[],
  'medium',
  'multiple-choice',
  30,
  $q${"id":"sr-003","question":"A piece of paper is folded 3 times. How many layers of paper are there?","answer":"8","explanation":"Each fold doubles the layers: 1 → 2 → 4 → 8. Three folds gives 2³ = 8 layers.","hint":"Each fold doubles the number of layers.","category":"Paper Folding","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$Each fold doubles the layers: 1 → 2 → 4 → 8. Three folds gives 2³ = 8 layers.$e$,
  $h$Each fold doubles the number of layers.$h$,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-013',
  'spatial-reasoning',
  'sr.paper-folding',
  ARRAY['gl', 'iseb']::text[],
  'easy',
  'multiple-choice',
  20,
  $q${"id":"sr-013","question":"A rectangular sheet of paper is folded in half once. How many layers of paper are there?","answer":"2","explanation":"One fold doubles the layers: 1 layer becomes 2 layers.","category":"Paper Folding","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$One fold doubles the layers: 1 layer becomes 2 layers.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-014',
  'spatial-reasoning',
  'sr.paper-folding',
  ARRAY['gl', 'iseb']::text[],
  'medium',
  'multiple-choice',
  32,
  $q${"id":"sr-014","question":"A square sheet is folded in half, then folded in half again (perpendicular to the first fold). A hole is punched through all layers. When unfolded, how many holes appear?","answer":"4","explanation":"Two folds give 4 layers. Punching one hole through all 4 layers creates 4 holes when unfolded.","category":"Paper Folding","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$Two folds give 4 layers. Punching one hole through all 4 layers creates 4 holes when unfolded.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-015',
  'spatial-reasoning',
  'sr.paper-folding',
  ARRAY['gl', 'iseb']::text[],
  'hard',
  'multiple-choice',
  45,
  $q${"id":"sr-015","question":"A strip of paper with 5 equal sections is folded accordion-style so all sections stack on top of each other. How many layers are there?","answer":"5","explanation":"Folding 5 sections so they all stack gives 5 layers — each section becomes one layer.","category":"Paper Folding","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$Folding 5 sections so they all stack gives 5 layers — each section becomes one layer.$e$,
  null,
  1.00,
  3
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-019',
  'spatial-reasoning',
  'sr.paper-folding',
  ARRAY['gl', 'iseb']::text[],
  'hard',
  'multiple-choice',
  45,
  $q${"id":"sr-019","question":"A piece of paper is folded exactly 4 times. How many layers of paper are there?","answer":"16","explanation":"Each fold doubles the layers: 1 → 2 → 4 → 8 → 16. Four folds gives 2⁴ = 16 layers.","category":"Paper Folding","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$Each fold doubles the layers: 1 → 2 → 4 → 8 → 16. Four folds gives 2⁴ = 16 layers.$e$,
  null,
  1.00,
  3
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-020',
  'spatial-reasoning',
  'sr.paper-folding',
  ARRAY['gl', 'iseb']::text[],
  'medium',
  'multiple-choice',
  32,
  $q${"id":"sr-020","question":"A rectangular sheet is folded in half widthwise, then in half again lengthwise. A single hole is punched through all layers. How many holes appear when fully unfolded?","answer":"4","explanation":"Two folds create 4 layers. Punching one hole through all 4 layers reveals 4 holes when unfolded.","category":"Paper Folding","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$Two folds create 4 layers. Punching one hole through all 4 layers reveals 4 holes when unfolded.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;


-- sr.compass-grid-navigation (11 rows)
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-004',
  'spatial-reasoning',
  'sr.compass-grid-navigation',
  ARRAY['gl', 'iseb']::text[],
  'easy',
  'multiple-choice',
  18,
  $q${"id":"sr-004","question":"You face South. You turn 90° anticlockwise. Which direction do you now face?","answer":"East","alternatives":["east"],"explanation":"Facing South, a 90° anticlockwise (counter-clockwise) turn takes you to face East. Think: anticlockwise from South goes towards the left on a compass map.","hint":"Draw a compass and rotate anticlockwise from South.","category":"Compass Directions","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$Facing South, a 90° anticlockwise (counter-clockwise) turn takes you to face East. Think: anticlockwise from South goes towards the left on a compass map.$e$,
  $h$Draw a compass and rotate anticlockwise from South.$h$,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-012',
  'spatial-reasoning',
  'sr.compass-grid-navigation',
  ARRAY['gl', 'iseb']::text[],
  'medium',
  'multiple-choice',
  30,
  $q${"id":"sr-012","question":"You face East. You make three 90° clockwise quarter-turns. Which direction do you now face?","answer":"North","alternatives":["north"],"explanation":"Each 90° clockwise turn: East → South → West → North. Three turns from East lands on North.","category":"Compass Directions","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$Each 90° clockwise turn: East → South → West → North. Three turns from East lands on North.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-023',
  'spatial-reasoning',
  'sr.compass-grid-navigation',
  ARRAY['gl', 'iseb']::text[],
  'easy',
  'multiple-choice',
  18,
  $q${"id":"sr-023","question":"You face North and make a half turn (180°). Which direction do you now face?","answer":"South","alternatives":["south"],"explanation":"A 180° turn reverses your direction completely. Facing North and turning 180° means you now face South.","category":"Compass Directions","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$A 180° turn reverses your direction completely. Facing North and turning 180° means you now face South.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-025',
  'spatial-reasoning',
  'sr.compass-grid-navigation',
  ARRAY['gl', 'iseb']::text[],
  'easy',
  'multiple-choice',
  15,
  $q${"id":"sr-025","question":"On a compass, going clockwise from North, how many degrees is the angle to reach East?","answer":"90","alternatives":["90°","90 degrees"],"explanation":"Moving clockwise from North: North (0°) → East (90°). The angle is exactly 90°.","category":"Compass Directions","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$Moving clockwise from North: North (0°) → East (90°). The angle is exactly 90°.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-027',
  'spatial-reasoning',
  'sr.compass-grid-navigation',
  ARRAY['gl', 'iseb']::text[],
  'medium',
  'multiple-choice',
  30,
  $q${"id":"sr-027","question":"You face South-West. After a 90° clockwise turn, which direction do you face?","answer":"North-West","alternatives":["northwest","north-west","NW"],"explanation":"A 90° clockwise rotation moves you a quarter turn to the right. From South-West (225°), adding 90° clockwise gives 315°, which is North-West.","category":"Compass Directions","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$A 90° clockwise rotation moves you a quarter turn to the right. From South-West (225°), adding 90° clockwise gives 315°, which is North-West.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-030',
  'spatial-reasoning',
  'sr.compass-grid-navigation',
  ARRAY['gl', 'iseb']::text[],
  'easy',
  'multiple-choice',
  20,
  $q${"id":"sr-030","question":"You face East. The sun rises in the East. Is the rising sun in front of you, behind you, to your left or to your right?","answer":"in front","alternatives":["in front of you","ahead","straight ahead"],"explanation":"If you face East and the sun rises in the East, the rising sun is directly in front of you.","category":"Compass Directions","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$If you face East and the sun rises in the East, the rising sun is directly in front of you.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-031',
  'spatial-reasoning',
  'sr.compass-grid-navigation',
  ARRAY['gl', 'iseb']::text[],
  'easy',
  'multiple-choice',
  18,
  $q${"id":"sr-031","question":"On a map with North pointing upwards, a school is directly to the right of a library. In which compass direction is the school from the library?","answer":"East","alternatives":["east"],"explanation":"On a standard map with North at the top, 'to the right' corresponds to East. So the school is East of the library.","category":"Compass Directions","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$On a standard map with North at the top, 'to the right' corresponds to East. So the school is East of the library.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-010',
  'spatial-reasoning',
  'sr.compass-grid-navigation',
  ARRAY['gl', 'iseb']::text[],
  'medium',
  'multiple-choice',
  35,
  $q${"id":"sr-010","question":"Starting at a point, you move 3 squares right and 2 squares up. Then you move 1 square left and 4 squares down. How many squares below your starting point are you?","answer":"2","explanation":"Vertical movement: 2 squares up, then 4 squares down = net 2 squares down from start. (Up 2, Down 4: 2 − 4 = −2, meaning 2 below.)","hint":"Work out the vertical and horizontal movements separately.","category":"Grid Navigation","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$Vertical movement: 2 squares up, then 4 squares down = net 2 squares down from start. (Up 2, Down 4: 2 − 4 = −2, meaning 2 below.)$e$,
  $h$Work out the vertical and horizontal movements separately.$h$,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-024',
  'spatial-reasoning',
  'sr.compass-grid-navigation',
  ARRAY['gl', 'iseb']::text[],
  'hard',
  'multiple-choice',
  40,
  $q${"id":"sr-024","question":"Starting at home, you walk 3 steps East and 4 steps North to reach the park. If you walked directly back to home in a straight line, what is the shortest distance in steps? (Use: 3² + 4² = 5²)","answer":"5","alternatives":["5 steps"],"explanation":"This forms a right-angled triangle with legs 3 and 4. The hypotenuse (direct route) = √(3² + 4²) = √25 = 5 steps.","category":"Grid Navigation","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$This forms a right-angled triangle with legs 3 and 4. The hypotenuse (direct route) = √(3² + 4²) = √25 = 5 steps.$e$,
  null,
  1.00,
  3
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-026',
  'spatial-reasoning',
  'sr.compass-grid-navigation',
  ARRAY['gl', 'iseb']::text[],
  'medium',
  'multiple-choice',
  32,
  $q${"id":"sr-026","question":"An ant walks 5 steps North, then 3 steps East, then 5 steps South. How many steps East of its starting point is it?","answer":"3","explanation":"Vertical: 5N − 5S = net 0. Horizontal: 3E. The ant ends up 3 steps East of its starting point.","category":"Grid Navigation","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$Vertical: 5N − 5S = net 0. Horizontal: 3E. The ant ends up 3 steps East of its starting point.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-028',
  'spatial-reasoning',
  'sr.compass-grid-navigation',
  ARRAY['gl', 'iseb']::text[],
  'hard',
  'multiple-choice',
  45,
  $q${"id":"sr-028","question":"You start at A. You move 4 steps East and 3 steps North to reach B. Then 2 steps West and 5 steps South to reach C. How many steps South of A is C?","answer":"2","explanation":"Vertical movement: 3 steps North then 5 steps South = net 2 steps South. C is 2 steps South of A.","hint":"Track vertical (N/S) and horizontal (E/W) movements separately.","category":"Grid Navigation","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$Vertical movement: 3 steps North then 5 steps South = net 2 steps South. C is 2 steps South of A.$e$,
  $h$Track vertical (N/S) and horizontal (E/W) movements separately.$h$,
  1.00,
  3
)
on conflict (id) do nothing;


-- sr.3d-visualisation (10 rows)
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-007',
  'spatial-reasoning',
  'sr.3d-visualisation',
  ARRAY['gl', 'iseb']::text[],
  'hard',
  'multiple-choice',
  60,
  $q${"id":"sr-007","question":"A 2×2×2 cube (made of 8 smaller cubes) has all its outer faces painted red. How many of the 8 small cubes have exactly 3 red faces?","answer":"8","explanation":"In a 2×2×2 cube, every small cube sits in a corner position. Each corner cube has exactly 3 outer faces painted. There are 8 corners, so all 8 small cubes have exactly 3 red faces.","category":"3D Visualisation","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$In a 2×2×2 cube, every small cube sits in a corner position. Each corner cube has exactly 3 outer faces painted. There are 8 corners, so all 8 small cubes have exactly 3 red faces.$e$,
  null,
  1.00,
  3
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-008',
  'spatial-reasoning',
  'sr.3d-visualisation',
  ARRAY['gl', 'iseb']::text[],
  'easy',
  'multiple-choice',
  20,
  $q${"id":"sr-008","question":"How many flat faces does a triangular prism have?","answer":"5","explanation":"A triangular prism has 2 triangular faces (the two ends) and 3 rectangular faces (the three sides) = 5 faces in total.","category":"3D Shapes","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$A triangular prism has 2 triangular faces (the two ends) and 3 rectangular faces (the three sides) = 5 faces in total.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-016',
  'spatial-reasoning',
  'sr.3d-visualisation',
  ARRAY['gl', 'iseb']::text[],
  'easy',
  'multiple-choice',
  18,
  $q${"id":"sr-016","question":"A cube net has exactly how many squares?","answer":"6","explanation":"A cube has 6 faces, so its net consists of exactly 6 squares arranged so that folding them produces a closed cube.","category":"Nets and 3D Shapes","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$A cube has 6 faces, so its net consists of exactly 6 squares arranged so that folding them produces a closed cube.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-017',
  'spatial-reasoning',
  'sr.3d-visualisation',
  ARRAY['gl', 'iseb']::text[],
  'medium',
  'multiple-choice',
  30,
  $q${"id":"sr-017","question":"A triangular-based pyramid (tetrahedron) has how many faces?","answer":"4","explanation":"A tetrahedron has 4 triangular faces: 1 base triangle and 3 slanting triangular faces.","category":"3D Shapes","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$A tetrahedron has 4 triangular faces: 1 base triangle and 3 slanting triangular faces.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-018',
  'spatial-reasoning',
  'sr.3d-visualisation',
  ARRAY['gl', 'iseb']::text[],
  'hard',
  'multiple-choice',
  55,
  $q${"id":"sr-018","question":"A square-based pyramid has 5 faces and 5 vertices. Using Euler's formula (Faces + Vertices − Edges = 2), how many edges does it have?","answer":"8","explanation":"F + V − E = 2 → 5 + 5 − E = 2 → E = 8. A square-based pyramid has 4 base edges and 4 slanting edges = 8 edges total.","category":"3D Shapes","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$F + V − E = 2 → 5 + 5 − E = 2 → E = 8. A square-based pyramid has 4 base edges and 4 slanting edges = 8 edges total.$e$,
  null,
  1.00,
  3
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-021',
  'spatial-reasoning',
  'sr.3d-visualisation',
  ARRAY['gl', 'iseb']::text[],
  'easy',
  'multiple-choice',
  22,
  $q${"id":"sr-021","question":"A triangular prism has how many vertices (corners)?","answer":"6","explanation":"A triangular prism has 2 triangular ends, each with 3 corners. Total vertices = 3 + 3 = 6.","category":"3D Shapes","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$A triangular prism has 2 triangular ends, each with 3 corners. Total vertices = 3 + 3 = 6.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-022',
  'spatial-reasoning',
  'sr.3d-visualisation',
  ARRAY['gl', 'iseb']::text[],
  'easy',
  'multiple-choice',
  18,
  $q${"id":"sr-022","question":"How many faces does a cuboid (rectangular box) have in total?","answer":"6","explanation":"A cuboid has 6 rectangular faces: top, bottom, front, back, left side and right side.","category":"3D Shapes","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$A cuboid has 6 rectangular faces: top, bottom, front, back, left side and right side.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-035',
  'spatial-reasoning',
  'sr.3d-visualisation',
  ARRAY['gl', 'iseb']::text[],
  'medium',
  'multiple-choice',
  30,
  $q${"id":"sr-035","question":"A cone has 1 flat circular face and 1 curved surface. How many edges does a cone have?","answer":"1","explanation":"A cone has exactly 1 edge — the circular boundary where the flat base meets the curved surface.","category":"3D Shapes","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$A cone has exactly 1 edge — the circular boundary where the flat base meets the curved surface.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-036',
  'spatial-reasoning',
  'sr.3d-visualisation',
  ARRAY['gl', 'iseb']::text[],
  'easy',
  'multiple-choice',
  18,
  $q${"id":"sr-036","question":"How many vertices (corners) does a rectangular prism (cuboid) have?","answer":"8","explanation":"A cuboid has 8 vertices — one at each corner of the box shape.","category":"3D Shapes","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$A cuboid has 8 vertices — one at each corner of the box shape.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-039',
  'spatial-reasoning',
  'sr.3d-visualisation',
  ARRAY['gl', 'iseb']::text[],
  'medium',
  'multiple-choice',
  28,
  $q${"id":"sr-039","question":"How many edges does a sphere have?","answer":"0","alternatives":["zero","none"],"explanation":"A sphere has a smooth curved surface with no flat faces, no edges and no vertices — it has 0 edges.","category":"3D Shapes","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$A sphere has a smooth curved surface with no flat faces, no edges and no vertices — it has 0 edges.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;


-- sr.rotation (0 rows)

-- sr.shape-properties-symmetry (8 rows)
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-005',
  'spatial-reasoning',
  'sr.shape-properties-symmetry',
  ARRAY['gl', 'iseb']::text[],
  'easy',
  'multiple-choice',
  20,
  $q${"id":"sr-005","question":"Which capital letter looks the same when reflected in a vertical mirror: A, B, C, D?","answer":"A","explanation":"The letter A has a vertical line of symmetry — it looks identical when flipped left-to-right. B, C and D do not have vertical symmetry.","category":"Symmetry","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$The letter A has a vertical line of symmetry — it looks identical when flipped left-to-right. B, C and D do not have vertical symmetry.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-006',
  'spatial-reasoning',
  'sr.shape-properties-symmetry',
  ARRAY['gl', 'iseb']::text[],
  'easy',
  'multiple-choice',
  18,
  $q${"id":"sr-006","question":"How many lines of symmetry does a regular hexagon have?","answer":"6","explanation":"A regular hexagon has 6 lines of symmetry: 3 lines connecting opposite vertices (corners), and 3 lines connecting midpoints of opposite edges.","category":"Symmetry","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$A regular hexagon has 6 lines of symmetry: 3 lines connecting opposite vertices (corners), and 3 lines connecting midpoints of opposite edges.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-011',
  'spatial-reasoning',
  'sr.shape-properties-symmetry',
  ARRAY['gl', 'iseb']::text[],
  'medium',
  'multiple-choice',
  32,
  $q${"id":"sr-011","question":"A shape has exactly 2 lines of symmetry and 4 equal sides but no right angles. What is the name of this shape?","answer":"rhombus","explanation":"A rhombus has 4 equal sides (like a square), but its angles are not 90°. It has exactly 2 lines of symmetry — through opposite corners.","category":"Shape Properties","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$A rhombus has 4 equal sides (like a square), but its angles are not 90°. It has exactly 2 lines of symmetry — through opposite corners.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-032',
  'spatial-reasoning',
  'sr.shape-properties-symmetry',
  ARRAY['gl', 'iseb']::text[],
  'easy',
  'multiple-choice',
  18,
  $q${"id":"sr-032","question":"A regular octagon has how many lines of symmetry?","answer":"8","explanation":"A regular octagon has 8 sides and 8 lines of symmetry — one line through each pair of opposite vertices and one through each pair of opposite edge midpoints.","category":"Symmetry","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$A regular octagon has 8 sides and 8 lines of symmetry — one line through each pair of opposite vertices and one through each pair of opposite edge midpoints.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-033',
  'spatial-reasoning',
  'sr.shape-properties-symmetry',
  ARRAY['gl', 'iseb']::text[],
  'medium',
  'multiple-choice',
  30,
  $q${"id":"sr-033","question":"Which capital letter has exactly 2 lines of symmetry: A, H, T or Z?","answer":"H","explanation":"H has a vertical line of symmetry and a horizontal line of symmetry — exactly 2. A and T each have only 1 (vertical). Z has 0 lines of symmetry.","category":"Symmetry","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$H has a vertical line of symmetry and a horizontal line of symmetry — exactly 2. A and T each have only 1 (vertical). Z has 0 lines of symmetry.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-034',
  'spatial-reasoning',
  'sr.shape-properties-symmetry',
  ARRAY['gl', 'iseb']::text[],
  'medium',
  'multiple-choice',
  28,
  $q${"id":"sr-034","question":"A rectangle that is not a square has how many lines of symmetry?","answer":"2","explanation":"A non-square rectangle has 2 lines of symmetry: one horizontal (through the midpoints of the longer sides) and one vertical (through the midpoints of the shorter sides).","category":"Symmetry","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$A non-square rectangle has 2 lines of symmetry: one horizontal (through the midpoints of the longer sides) and one vertical (through the midpoints of the shorter sides).$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-037',
  'spatial-reasoning',
  'sr.shape-properties-symmetry',
  ARRAY['gl', 'iseb']::text[],
  'easy',
  'multiple-choice',
  18,
  $q${"id":"sr-037","question":"The interior angles of any triangle always sum to how many degrees?","answer":"180","alternatives":["180°","180 degrees"],"explanation":"This is a fundamental rule of geometry: the three interior angles of any triangle, regardless of its shape, always add up to 180°.","category":"Shape Properties","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$This is a fundamental rule of geometry: the three interior angles of any triangle, regardless of its shape, always add up to 180°.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'sr-038',
  'spatial-reasoning',
  'sr.shape-properties-symmetry',
  ARRAY['gl', 'iseb']::text[],
  'medium',
  'multiple-choice',
  35,
  $q${"id":"sr-038","question":"Each interior angle of a regular pentagon measures how many degrees? (Total interior angles of a pentagon = 540°)","answer":"108","alternatives":["108°","108 degrees"],"explanation":"A regular pentagon has 5 equal interior angles. Total = 540°. Each angle = 540° ÷ 5 = 108°.","category":"Shape Properties","skill":"spatial-reasoning","marks":1}$q$::jsonb,
  $e$A regular pentagon has 5 equal interior angles. Total = 540°. Each angle = 540° ÷ 5 = 108°.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;


-- numreason.sequences-analogies (11 rows)
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-001',
  'numerical-reasoning',
  'numreason.sequences-analogies',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  20,
  $q${"id":"nr-001","question":"What number comes next in the sequence: 2, 4, 8, 16, 32, ?","answer":"64","explanation":"Each number is doubled: 2×2=4, 4×2=8, 8×2=16, 16×2=32, 32×2=64. The rule is ×2.","category":"Number Sequences","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$Each number is doubled: 2×2=4, 4×2=8, 8×2=16, 16×2=32, 32×2=64. The rule is ×2.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-002',
  'numerical-reasoning',
  'numreason.sequences-analogies',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  20,
  $q${"id":"nr-002","question":"Find the missing number in the sequence: 3, 6, ?, 12, 15","answer":"9","explanation":"The sequence increases by 3 each time: 3, 6, 9, 12, 15. The missing number is 9.","category":"Number Sequences","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$The sequence increases by 3 each time: 3, 6, 9, 12, 15. The missing number is 9.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-007',
  'numerical-reasoning',
  'numreason.sequences-analogies',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  28,
  $q${"id":"nr-007","question":"What comes next: 81, 27, 9, 3, ?","answer":"1","explanation":"Each number is divided by 3: 81÷3=27, 27÷3=9, 9÷3=3, 3÷3=1. The rule is ÷3.","category":"Number Sequences","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$Each number is divided by 3: 81÷3=27, 27÷3=9, 9÷3=3, 3÷3=1. The rule is ÷3.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-013',
  'numerical-reasoning',
  'numreason.sequences-analogies',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'hard',
  'multiple-choice',
  45,
  $q${"id":"nr-013","question":"What comes next in the Fibonacci sequence: 1, 1, 2, 3, 5, 8, ?","answer":"13","explanation":"In the Fibonacci sequence, each term is the sum of the two before it: 5+8=13. The next term is 13.","category":"Number Sequences","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$In the Fibonacci sequence, each term is the sum of the two before it: 5+8=13. The next term is 13.$e$,
  null,
  1.00,
  3
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-014',
  'numerical-reasoning',
  'numreason.sequences-analogies',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  20,
  $q${"id":"nr-014","question":"What comes next: 50, 45, 40, 35, ?","answer":"30","explanation":"Each term decreases by 5: 50−5=45, 45−5=40, 40−5=35, 35−5=30.","category":"Number Sequences","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$Each term decreases by 5: 50−5=45, 45−5=40, 40−5=35, 35−5=30.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-015',
  'numerical-reasoning',
  'numreason.sequences-analogies',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  30,
  $q${"id":"nr-015","question":"What comes next: 3, 6, 12, 24, ?","answer":"48","explanation":"Each term is doubled: 3×2=6, 6×2=12, 12×2=24, 24×2=48. The rule is ×2.","category":"Number Sequences","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$Each term is doubled: 3×2=6, 6×2=12, 12×2=24, 24×2=48. The rule is ×2.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-016',
  'numerical-reasoning',
  'numreason.sequences-analogies',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  30,
  $q${"id":"nr-016","question":"Find the missing number: 2, ?, 8, 16, 32","answer":"4","explanation":"The sequence doubles each time: 2, 4, 8, 16, 32. The missing number is 4.","category":"Number Sequences","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$The sequence doubles each time: 2, 4, 8, 16, 32. The missing number is 4.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-017',
  'numerical-reasoning',
  'numreason.sequences-analogies',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  30,
  $q${"id":"nr-017","question":"What comes next in the square number sequence: 1, 4, 9, 16, 25, ?","answer":"36","explanation":"The sequence is 1², 2², 3², 4², 5², 6². The next term is 6² = 36.","category":"Number Sequences","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$The sequence is 1², 2², 3², 4², 5², 6². The next term is 6² = 36.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-018',
  'numerical-reasoning',
  'numreason.sequences-analogies',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  20,
  $q${"id":"nr-018","question":"What is the missing number: 10, 20, ?, 40, 50","answer":"30","explanation":"The sequence increases by 10 each time: 10, 20, 30, 40, 50. The missing number is 30.","category":"Number Sequences","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$The sequence increases by 10 each time: 10, 20, 30, 40, 50. The missing number is 30.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-003',
  'numerical-reasoning',
  'numreason.sequences-analogies',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  30,
  $q${"id":"nr-003","question":"6 is to 36 as 7 is to ?","answer":"49","explanation":"6 squared = 6 × 6 = 36. Following the same rule, 7 squared = 7 × 7 = 49.","hint":"What operation turns 6 into 36?","category":"Number Analogies","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$6 squared = 6 × 6 = 36. Following the same rule, 7 squared = 7 × 7 = 49.$e$,
  $h$What operation turns 6 into 36?$h$,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-009',
  'numerical-reasoning',
  'numreason.sequences-analogies',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  18,
  $q${"id":"nr-009","question":"What is the missing number: □ × 6 = 54?","answer":"9","explanation":"54 ÷ 6 = 9. Check: 9 × 6 = 54 ✓","category":"Missing Numbers","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$54 ÷ 6 = 9. Check: 9 × 6 = 54 ✓$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;


-- numreason.function-machines (4 rows)
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-008',
  'numerical-reasoning',
  'numreason.function-machines',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  28,
  $q${"id":"nr-008","question":"A function machine multiplies the input by 3, then subtracts 2. What is the output when the input is 7?","answer":"19","explanation":"Step 1: 7 × 3 = 21. Step 2: 21 − 2 = 19. The output is 19.","category":"Function Machines","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$Step 1: 7 × 3 = 21. Step 2: 21 − 2 = 19. The output is 19.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-019',
  'numerical-reasoning',
  'numreason.function-machines',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  28,
  $q${"id":"nr-019","question":"A function machine: input × 4, then + 3. What is the output when the input is 5?","answer":"23","explanation":"Step 1: 5 × 4 = 20. Step 2: 20 + 3 = 23. The output is 23.","category":"Function Machines","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$Step 1: 5 × 4 = 20. Step 2: 20 + 3 = 23. The output is 23.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-020',
  'numerical-reasoning',
  'numreason.function-machines',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'hard',
  'multiple-choice',
  55,
  $q${"id":"nr-020","question":"A function machine doubles the input and then subtracts 1. The output is 11. What was the input?","answer":"6","explanation":"Working backwards: 11 + 1 = 12. Then 12 ÷ 2 = 6. Check: 6 × 2 − 1 = 11 ✓","hint":"Reverse the operations to work backwards from the output.","category":"Function Machines","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$Working backwards: 11 + 1 = 12. Then 12 ÷ 2 = 6. Check: 6 × 2 − 1 = 11 ✓$e$,
  $h$Reverse the operations to work backwards from the output.$h$,
  1.00,
  3
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-022',
  'numerical-reasoning',
  'numreason.function-machines',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  28,
  $q${"id":"nr-022","question":"A two-step function machine: +3, then ×2. The input is 7. What is the output?","answer":"20","explanation":"Step 1: 7 + 3 = 10. Step 2: 10 × 2 = 20. The output is 20.","category":"Function Machines","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$Step 1: 7 + 3 = 10. Step 2: 10 × 2 = 20. The output is 20.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;


-- numreason.data-statistics (10 rows)
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-004',
  'numerical-reasoning',
  'numreason.data-statistics',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  20,
  $q${"id":"nr-004","question":"In a class, 12 pupils chose football, 8 chose tennis and 5 chose swimming. How many more chose football than swimming?","answer":"7","explanation":"Football: 12 pupils. Swimming: 5 pupils. Difference: 12 − 5 = 7 more pupils chose football.","category":"Data Interpretation","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$Football: 12 pupils. Swimming: 5 pupils. Difference: 12 − 5 = 7 more pupils chose football.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-010',
  'numerical-reasoning',
  'numreason.data-statistics',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  32,
  $q${"id":"nr-010","question":"The mean of 4 numbers is 8. Three of the numbers are 6, 9 and 7. What is the fourth number?","answer":"10","explanation":"Mean = 8, so total = 4 × 8 = 32. Sum of known numbers = 6 + 9 + 7 = 22. Fourth number = 32 − 22 = 10.","hint":"Find the total first (mean × count), then subtract the known numbers.","category":"Mean and Average","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$Mean = 8, so total = 4 × 8 = 32. Sum of known numbers = 6 + 9 + 7 = 22. Fourth number = 32 − 22 = 10.$e$,
  $h$Find the total first (mean × count), then subtract the known numbers.$h$,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-034',
  'numerical-reasoning',
  'numreason.data-statistics',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  25,
  $q${"id":"nr-034","question":"The temperatures over 5 days were: 12°, 15°, 11°, 13°, 14°. What is the mean temperature?","answer":"13","alternatives":["13°"],"explanation":"Sum = 12+15+11+13+14 = 65. Mean = 65 ÷ 5 = 13°.","category":"Mean and Average","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$Sum = 12+15+11+13+14 = 65. Mean = 65 ÷ 5 = 13°.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-035',
  'numerical-reasoning',
  'numreason.data-statistics',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  28,
  $q${"id":"nr-035","question":"In a class of 30 children, the mean number of books read per child is 6. What is the total number of books the class has read?","answer":"180","explanation":"Total = mean × count = 6 × 30 = 180 books.","category":"Mean and Average","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$Total = mean × count = 6 × 30 = 180 books.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-036',
  'numerical-reasoning',
  'numreason.data-statistics',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  30,
  $q${"id":"nr-036","question":"Find the median of these numbers: 3, 7, 2, 9, 5. (Arrange them in order first.)","answer":"5","explanation":"In order: 2, 3, 5, 7, 9. The median is the middle value = 5.","hint":"Sort the numbers from smallest to largest first.","category":"Mean and Average","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$In order: 2, 3, 5, 7, 9. The median is the middle value = 5.$e$,
  $h$Sort the numbers from smallest to largest first.$h$,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-037',
  'numerical-reasoning',
  'numreason.data-statistics',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  20,
  $q${"id":"nr-037","question":"A pie chart shows 3 equal sectors. What is the angle of each sector in degrees?","answer":"120","alternatives":["120°"],"explanation":"A full circle = 360°. Three equal sectors means each angle = 360 ÷ 3 = 120°.","category":"Data Interpretation","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$A full circle = 360°. Three equal sectors means each angle = 360 ÷ 3 = 120°.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-038',
  'numerical-reasoning',
  'numreason.data-statistics',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'hard',
  'multiple-choice',
  40,
  $q${"id":"nr-038","question":"In a school survey, School A has 40 pupils and School B has 60 pupils. What fraction of the total pupils are from School A? Give your answer in its simplest form.","answer":"2/5","alternatives":["2 / 5","40%","0.4"],"explanation":"Total = 40+60 = 100. Fraction from A = 40/100 = 2/5.","category":"Data Interpretation","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$Total = 40+60 = 100. Fraction from A = 40/100 = 2/5.$e$,
  null,
  1.00,
  3
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-039',
  'numerical-reasoning',
  'numreason.data-statistics',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  25,
  $q${"id":"nr-039","question":"Find the range of this data set: 3, 8, 1, 15, 7, 10.","answer":"14","explanation":"Range = largest − smallest = 15 − 1 = 14.","category":"Data Interpretation","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$Range = largest − smallest = 15 − 1 = 14.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-040',
  'numerical-reasoning',
  'numreason.data-statistics',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  22,
  $q${"id":"nr-040","question":"Six students' test scores are: 72, 65, 80, 72, 91, 60. What is the mode (the most frequently occurring score)?","answer":"72","explanation":"The mode is the value that appears most often. 72 appears twice; all other scores appear once. The mode is 72.","category":"Data Interpretation","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$The mode is the value that appears most often. 72 appears twice; all other scores appear once. The mode is 72.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-041',
  'numerical-reasoning',
  'numreason.data-statistics',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  22,
  $q${"id":"nr-041","question":"Three friends collect 24, 31 and 20 stickers. What is the mean number of stickers per friend?","answer":"25","explanation":"Total = 24+31+20 = 75. Mean = 75 ÷ 3 = 25 stickers.","category":"Mean and Average","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$Total = 24+31+20 = 75. Mean = 75 ÷ 3 = 25 stickers.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;


-- numreason.money-measures (5 rows)
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-012',
  'numerical-reasoning',
  'numreason.money-measures',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  35,
  $q${"id":"nr-012","question":"A book costs £4.50 and a magazine costs £1.20. What is the total cost of 2 books and 3 magazines?","answer":"12.60","alternatives":["£12.60","£ 12.60"],"explanation":"2 books = 2 × £4.50 = £9.00. 3 magazines = 3 × £1.20 = £3.60. Total = £9.00 + £3.60 = £12.60.","hint":"Calculate each item type separately, then add.","category":"Money and Measures","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$2 books = 2 × £4.50 = £9.00. 3 magazines = 3 × £1.20 = £3.60. Total = £9.00 + £3.60 = £12.60.$e$,
  $h$Calculate each item type separately, then add.$h$,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-030',
  'numerical-reasoning',
  'numreason.money-measures',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  25,
  $q${"id":"nr-030","question":"Tickets cost £8 each. Tom buys 3 tickets and pays with a £30 note. How much change does he receive?","answer":"6","alternatives":["£6","£6.00"],"explanation":"3 tickets = 3 × £8 = £24. Change = £30 − £24 = £6.","category":"Money and Measures","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$3 tickets = 3 × £8 = £24. Change = £30 − £24 = £6.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-031',
  'numerical-reasoning',
  'numreason.money-measures',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  35,
  $q${"id":"nr-031","question":"A shop sells 5 pencils for £1.50. How much do 8 pencils cost?","answer":"2.40","alternatives":["£2.40"],"explanation":"1 pencil = £1.50 ÷ 5 = 30p. 8 pencils = 8 × 30p = 240p = £2.40.","category":"Money and Measures","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$1 pencil = £1.50 ÷ 5 = 30p. 8 pencils = 8 × 30p = 240p = £2.40.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-032',
  'numerical-reasoning',
  'numreason.money-measures',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  35,
  $q${"id":"nr-032","question":"A taxi charges £3.00 plus £1.50 per mile. What is the total cost of a 4-mile journey?","answer":"9","alternatives":["£9","£9.00","9.00"],"explanation":"Fixed charge = £3. Mileage = 4 × £1.50 = £6. Total = £3 + £6 = £9.","category":"Money and Measures","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$Fixed charge = £3. Mileage = 4 × £1.50 = £6. Total = £3 + £6 = £9.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-033',
  'numerical-reasoning',
  'numreason.money-measures',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'hard',
  'multiple-choice',
  55,
  $q${"id":"nr-033","question":"A map uses a scale of 1:25,000. Two villages are 8cm apart on the map. What is the real distance between them in kilometres?","answer":"2","alternatives":["2km","2 km","2 kilometres"],"explanation":"Real distance = 8 × 25,000 cm = 200,000 cm = 2,000 m = 2 km.","category":"Money and Measures","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$Real distance = 8 × 25,000 cm = 200,000 cm = 2,000 m = 2 km.$e$,
  null,
  1.00,
  3
)
on conflict (id) do nothing;


-- numreason.percentages (5 rows)
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-005',
  'numerical-reasoning',
  'numreason.percentages',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  18,
  $q${"id":"nr-005","question":"In a survey of 40 children, 25% said their favourite colour is blue. How many children is that?","answer":"10","explanation":"25% of 40 = 40 ÷ 4 = 10 children.","hint":"25% is the same as one quarter.","category":"Percentages","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$25% of 40 = 40 ÷ 4 = 10 children.$e$,
  $h$25% is the same as one quarter.$h$,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-023',
  'numerical-reasoning',
  'numreason.percentages',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  20,
  $q${"id":"nr-023","question":"What is 30% of 60?","answer":"18","explanation":"30% of 60 = (30 × 60) ÷ 100 = 1800 ÷ 100 = 18.","hint":"10% of 60 = 6. So 30% = 3 × 6 = 18.","category":"Percentages","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$30% of 60 = (30 × 60) ÷ 100 = 1800 ÷ 100 = 18.$e$,
  $h$10% of 60 = 6. So 30% = 3 × 6 = 18.$h$,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-024',
  'numerical-reasoning',
  'numreason.percentages',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  32,
  $q${"id":"nr-024","question":"A shirt originally costs £20 and is reduced by 15%. What is the sale price?","answer":"17","alternatives":["£17","£17.00","17.00"],"explanation":"15% of £20 = £3. Sale price = £20 − £3 = £17.","hint":"10% of £20 = £2, so 5% = £1. 15% = £2 + £1 = £3 off.","category":"Percentages","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$15% of £20 = £3. Sale price = £20 − £3 = £17.$e$,
  $h$10% of £20 = £2, so 5% = £1. 15% = £2 + £1 = £3 off.$h$,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-025',
  'numerical-reasoning',
  'numreason.percentages',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  15,
  $q${"id":"nr-025","question":"65 out of 100 children passed a maths test. What percentage passed?","answer":"65","alternatives":["65%"],"explanation":"65 out of 100 = 65%. When the total is 100, the fraction directly gives the percentage.","category":"Percentages","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$65 out of 100 = 65%. When the total is 100, the fraction directly gives the percentage.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-026',
  'numerical-reasoning',
  'numreason.percentages',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  28,
  $q${"id":"nr-026","question":"A jar contains 200 sweets. 40% are red. How many red sweets are there?","answer":"80","explanation":"40% of 200 = (40 × 200) ÷ 100 = 80 red sweets.","hint":"10% of 200 = 20. So 40% = 4 × 20 = 80.","category":"Percentages","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$40% of 200 = (40 × 200) ÷ 100 = 80 red sweets.$e$,
  $h$10% of 200 = 20. So 40% = 4 × 20 = 80.$h$,
  1.00,
  2
)
on conflict (id) do nothing;


-- numreason.ratio-proportion (4 rows)
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-006',
  'numerical-reasoning',
  'numreason.ratio-proportion',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  25,
  $q${"id":"nr-006","question":"The ratio of red to blue beads in a jar is 3:5. There are 24 red beads. How many blue beads are there?","answer":"40","explanation":"If red = 3 parts = 24 beads, then 1 part = 8 beads. Blue = 5 parts = 5 × 8 = 40 beads.","hint":"Find the value of 1 part first.","category":"Ratio and Proportion","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$If red = 3 parts = 24 beads, then 1 part = 8 beads. Blue = 5 parts = 5 × 8 = 40 beads.$e$,
  $h$Find the value of 1 part first.$h$,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-027',
  'numerical-reasoning',
  'numreason.ratio-proportion',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'easy',
  'multiple-choice',
  22,
  $q${"id":"nr-027","question":"A recipe uses flour and sugar in the ratio 4:1. If you use 20g of flour, how much sugar do you need?","answer":"5","alternatives":["5g","5 g"],"explanation":"Ratio 4:1 means for every 4g of flour there is 1g of sugar. 20g ÷ 4 = 5g of sugar.","category":"Ratio and Proportion","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$Ratio 4:1 means for every 4g of flour there is 1g of sugar. 20g ÷ 4 = 5g of sugar.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-028',
  'numerical-reasoning',
  'numreason.ratio-proportion',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  32,
  $q${"id":"nr-028","question":"A class has boys and girls in the ratio 3:2. There are 30 children in total. How many are boys?","answer":"18","explanation":"Total parts = 3+2 = 5. One part = 30 ÷ 5 = 6. Boys = 3 × 6 = 18.","hint":"Find the value of 1 part first.","category":"Ratio and Proportion","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$Total parts = 3+2 = 5. One part = 30 ÷ 5 = 6. Boys = 3 × 6 = 18.$e$,
  $h$Find the value of 1 part first.$h$,
  1.00,
  2
)
on conflict (id) do nothing;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, mastery_threshold)
values (
  'nr-029',
  'numerical-reasoning',
  'numreason.ratio-proportion',
  ARRAY['gl', 'cem', 'iseb']::text[],
  'medium',
  'multiple-choice',
  30,
  $q${"id":"nr-029","question":"Share £45 between two friends in the ratio 2:1. How much does the first friend receive?","answer":"30","alternatives":["£30","£30.00"],"explanation":"Total parts = 2+1 = 3. One part = £45 ÷ 3 = £15. First friend gets 2 × £15 = £30.","category":"Ratio and Proportion","skill":"numerical-reasoning","marks":1}$q$::jsonb,
  $e$Total parts = 2+1 = 3. One part = £45 ÷ 3 = £15. First friend gets 2 × £15 = £30.$e$,
  null,
  1.00,
  2
)
on conflict (id) do nothing;

