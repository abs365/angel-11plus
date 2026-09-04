-- Angel Digital 11+ — Migration 222
-- Programme Increment 020, Wave 1 — Mathematics MR-03 (Geometric and
-- Spatial Reasoning) Compound Rectilinear Shape family.
--
-- ============================================================
-- WHY MR-03 AND WHY THIS FAMILY
-- ============================================================
-- Increment 020 Part 1 competency selection (full evidence in this
-- increment's own commit message/report): MR-03 is one of only two
-- remaining Mathematics competencies rated HIGH importance / EMC-4 with
-- a "direct match, well-evidenced" CSSE mapping (CSSE_COMPETENCY_
-- TOPIC_MAPPING.md:48-49, the other being MR-02 Algebra) that still lacks
-- a full teaching sequence. MR-03 is chosen over MR-02 specifically for
-- its visual-teaching opportunity: this codebase's own Increment 017/018
-- audit found "zero diagrams, images, or charts anywhere in Mathematics
-- content" — MR-03 is the one competency where a diagram is not optional
-- for fairness (a compound shape cannot be fairly posed in text alone).
--
-- Within MR-03, real family-coverage evidence (5 existing Practice-track
-- families already carry authored teaching content in
-- lib/learningEngine/mathsTeachingContent.ts: mr03-angle-sum,
-- mr03-angle-ratio, mr03-classify, mr03-coordinate, mr03-mixed-perimeter)
-- confirms a genuine, specific, zero-coverage gap: no Practice-track
-- family anywhere covers a COMPOUND (multi-rectangle, rectilinear)
-- shape. `mr03-mixed-perimeter` covers only a single plain rectangle
-- (area + one side given, find perimeter). The ONLY existing compound-
-- shape content in this entire codebase is `mock-mr03mr07-perimeterarea`
-- — a PROTECTED, Mock-reserved family (migration 109/111, independently_
-- validated, Decision 226's own reserve). This migration's new family is
-- DELIBERATELY, VERIFIABLY SEPARATE from that protected family: entirely
-- new ids, new numbers, never mock_eligible, never touching
-- ali_mock_exposed_question_ids. The two must never be confused, merged,
-- or cross-promoted.
--
-- ============================================================
-- FAMILY: mr03-compound-area-perimeter (8 new rows, QT-MR-07)
-- ============================================================
-- A genuine difficulty progression (Part 9), never difficulty via larger
-- numbers alone:
--   FOUNDATION ACCESS (easy):   compound-01, compound-02, compound-08 —
--     area only, every needed dimension given directly, no inference.
--   STANDARD (medium):         compound-03, compound-04 — perimeter of
--     the SAME shape type, requiring the two "hidden" edges (not directly
--     labelled) to be inferred by subtraction/addition before summing.
--   SECURE (hard):              compound-05 — a REPRESENTATION variant
--     (notch cut from the opposite corner/orientation), area only, more
--     inference required.
--   TRANSFER (hard, FAR_TRANSFER): compound-06 — a REASONING variant:
--     given the shape's total perimeter and most dimensions, find ONE
--     missing side algebraically (2W + 20 = 44 -> W = 12) — genuinely
--     unseen reasoning direction, not a rehearsed forward calculation.
--     This is Part 1's own required "unseen transfer material," and
--     tagged transfer_class = FAR_TRANSFER so lib/ali/inventoryClass.ts
--     classifies it MEASUREMENT once promoted, never ordinary RENEWABLE.
--   HIGHER REASONING (challenge): compound-07 — a genuinely deeper
--     structural variant (3-rectangle "staircase" decomposition, not a
--     2-piece L-shape), the family's one challenge-tier item — a
--     disclosed, specific reasoning-depth justification, not a blind
--     difficulty-rebalancing exercise (Part 9's own explicit instruction).
--
-- Every answer, every edge length, and every area/perimeter figure below
-- was independently computed by hand from the stated vertex coordinates
-- before this file was written (shown in each row's own explanation
-- field) — the same "answer independently recomputed" discipline this
-- codebase's own migrations 066/081 already established, substituting a
-- verification script this session has no way to run against a live
-- database for direct-in-comment recomputation instead.
--
-- Misconception design (Part 8): the real, well-documented compound-
-- shape error this family targets is REPRESENTED, never fabricated —
-- forgetting that a compound shape's "hidden" (unlabelled) edges must
-- still be counted toward its perimeter, and confusing area with
-- perimeter. Both are genuine, realistic 11+ geometry mistakes, not
-- invented to populate a field.
--
-- Provenance: 100% angel_original (Part 14) — no CSSE/past-paper text or
-- specific numbers reproduced; only the general skill/format/difficulty
-- demand is informed by real CSSE evidence (per Part 14's own instruction
-- on what evidence may vs must not do).
--
-- Inventory class (Part 6): every row inserted as eligibility_status =
-- 'provisional' — NOT immediately practice-eligible, matching this
-- project's own standing review discipline (migrations 066/081 precedent)
-- and Part 15's own instruction that "generated candidate status must
-- never equal educational approval." See migration 223 for this family's
-- review-target registration. No row here is ever mock_eligible; none
-- consume the protected Mathematics Mock reserve (still 21 rows/21 marks,
-- per the Founder's own explicit correction this increment).
--
-- Idempotent: every INSERT uses "on conflict (id) do nothing".
--
-- ============================================================
-- FOUNDER EDUCATIONAL REVIEW HISTORY (additive, do not overwrite)
-- ============================================================
-- Family-level Founder decision: APPROVED WITH AMENDMENT.
--   mr03-compound-01/02/03/04/05/07/08 = APPROVED (unchanged since authoring).
--   mr03-compound-06 = APPROVED WITH AMENDMENT — the educational reasoning
--     was approved; the original diagram was NOT approved (its "unknown"
--     edge was drawn at its true, proportionally accurate solved length, a
--     visual-estimation leak). AMENDMENT IMPLEMENTED: see compound-06's
--     own INSERT below for the exact change. AMENDMENT EDUCATIONALLY
--     VERIFIED BY FOUNDER (diagram retained, deliberately not proportional,
--     visible not-drawn-to-scale notice present, mathematics unchanged,
--     regression protection present). Visual render verification (actual
--     on-screen rendering, mobile/tablet/desktop) remains its own separate
--     DEFERRED item, not resolved by the educational verification. See
--     MR03_COMPOUND_SHAPES_FOUNDER_REVIEW.md's own additive amendment
--     record for the full history.
--
-- Founder-authorised for manual production application via Supabase
-- Dashboard > SQL Editor. Execute this migration (222) FIRST, then
-- migration 223. This authorisation covers registering these 8 rows as
-- 'provisional' content ONLY -- it is NOT a Practice-release decision:
-- none of these rows becomes learner-reachable, none is promoted toward
-- practice_eligible/mock_eligible, and no Mock composition/reserve is
-- touched by applying this migration. A later, separate, explicit
-- Founder decision governs Practice promotion.

begin;

-- === compound-01 — FOUNDATION ACCESS, easy, area only (GUIDED lesson anchor) ===
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr03-compound-01', 'maths', 'QT-MR-07', array['csse'], 'easy', 'short-answer', 75,
 $json${"id":"mr03-compound-01","marks":1,"skill":"geometry","answer":"48m2","question":"A garden is shaped like the letter L, made of two rectangular sections. The lower section is 9m by 4m. The upper section is 4m by 3m. What is the total area of the garden?","workingSteps":["Split the shape into its two rectangles.","Lower section: 9m × 4m = 36m²","Upper section: 4m × 3m = 12m²","Total area: 36m² + 12m² = 48m²"],"diagram":{"type":"compound_rectilinear","vertices":[{"x":0,"y":0},{"x":9,"y":0},{"x":9,"y":4},{"x":4,"y":4},{"x":4,"y":7},{"x":0,"y":7}],"edgeLabels":[{"edgeIndex":0,"label":"9 m"},{"edgeIndex":1,"label":"4 m"},{"edgeIndex":3,"label":"3 m"},{"edgeIndex":4,"label":"4 m"}]}}$json$,
 'Programme Increment 020, Wave 1. Assessment Brain QT-MR-07, competency MR-03. Question family: mr03-compound-area-perimeter. Foundation-access compound-shape area: every dimension needed is given directly, no inference required -- the new skill here is splitting an unfamiliar (non-rectangular) shape into rectangles it already knows how to handle, reusing MR-01''s own area-of-a-rectangle skill. Independently recomputed: 9×4=36, 4×3=12, 36+12=48.',
 2, 'inc020-wave1-mr03-compound-area-perimeter',
 'mr03-compound-area-perimeter', 'angel_original', 'provisional', 1, true,
 'Adding all four given lengths together (9+4+4+3) instead of multiplying each rectangle''s own two sides and then adding the two areas.',
 'ROUTINE')
on conflict (id) do nothing;

-- === compound-02 — FOUNDATION ACCESS, easy, area only, parametric variant (ordinary independent practice) ===
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr03-compound-02', 'maths', 'QT-MR-07', array['csse'], 'easy', 'short-answer', 75,
 $json${"id":"mr03-compound-02","marks":1,"skill":"geometry","answer":"46m2","question":"A classroom floor plan is L-shaped, made of two rectangular sections. The main section is 8m by 5m. The smaller section is 3m by 2m. What is the total area of the floor?","workingSteps":["Split the shape into its two rectangles.","Main section: 8m × 5m = 40m²","Smaller section: 3m × 2m = 6m²","Total area: 40m² + 6m² = 46m²"],"diagram":{"type":"compound_rectilinear","vertices":[{"x":0,"y":0},{"x":8,"y":0},{"x":8,"y":5},{"x":3,"y":5},{"x":3,"y":7},{"x":0,"y":7}],"edgeLabels":[{"edgeIndex":0,"label":"8 m"},{"edgeIndex":1,"label":"5 m"},{"edgeIndex":3,"label":"2 m"},{"edgeIndex":4,"label":"3 m"}]}}$json$,
 'Programme Increment 020, Wave 1. Assessment Brain QT-MR-07, competency MR-03. Question family: mr03-compound-area-perimeter. Parametric variant of mr03-compound-01: identical structure, different real numbers and context, same foundation-access no-inference-required design. Independently recomputed: 8×5=40, 3×2=6, 40+6=46.',
 2, 'inc020-wave1-mr03-compound-area-perimeter',
 'mr03-compound-area-perimeter', 'angel_original', 'provisional', 1, true,
 'Adding all four given lengths together (8+5+3+2) instead of multiplying each rectangle''s own two sides and then adding the two areas.',
 'ROUTINE')
on conflict (id) do nothing;

-- === compound-03 — STANDARD, medium, perimeter requiring hidden-edge inference ===
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr03-compound-03', 'maths', 'QT-MR-07', array['csse'], 'medium', 'short-answer', 90,
 $json${"id":"mr03-compound-03","marks":2,"skill":"geometry","answer":"40m","question":"A school hall is L-shaped. Four of its sides measure 12m, 5m, 3m and 5m, as shown. What is the perimeter of the hall?","workingSteps":["An L-shape has 6 sides in total, but only 4 are labelled -- the other 2 must be worked out first.","The missing horizontal side = 12m − 5m = 7m (the two horizontal sides along the top and the step must add up to the bottom).","The missing vertical side = 5m + 3m = 8m (the two vertical sides on the right must add up to the full left side).","Add all 6 sides: 12 + 5 + 7 + 3 + 5 + 8 = 40m"],"diagram":{"type":"compound_rectilinear","vertices":[{"x":0,"y":0},{"x":12,"y":0},{"x":12,"y":5},{"x":5,"y":5},{"x":5,"y":8},{"x":0,"y":8}],"edgeLabels":[{"edgeIndex":0,"label":"12 m"},{"edgeIndex":1,"label":"5 m"},{"edgeIndex":3,"label":"3 m"},{"edgeIndex":4,"label":"5 m"}]}}$json$,
 'Programme Increment 020, Wave 1. Assessment Brain QT-MR-07, competency MR-03. Question family: mr03-compound-area-perimeter. Standard-tier: extends the same L-shape structure from perimeter-of-a-plain-rectangle (mr03-mixed-perimeter) to a compound shape, where two of the six real sides are not directly labelled and must be inferred from the other four before the perimeter can be summed. Independently recomputed: missing horizontal = 12−5=7, missing vertical = 5+3=8, total = 12+5+7+3+5+8=40.',
 2, 'inc020-wave1-mr03-compound-area-perimeter',
 'mr03-compound-area-perimeter', 'angel_original', 'provisional', 1, true,
 'Adding only the 4 labelled sides (12+5+3+5=25) and forgetting that a compound shape has hidden sides which still count toward the perimeter.',
 'NEAR_TRANSFER')
on conflict (id) do nothing;

-- === compound-04 — STANDARD, medium, perimeter, parametric variant (INDEPENDENT lesson anchor's family-depth sibling) ===
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr03-compound-04', 'maths', 'QT-MR-07', array['csse'], 'medium', 'short-answer', 90,
 $json${"id":"mr03-compound-04","marks":2,"skill":"geometry","answer":"48m","question":"A factory floor is L-shaped. Four of its sides measure 14m, 6m, 4m and 6m, as shown. What is the perimeter of the floor?","workingSteps":["An L-shape has 6 sides in total, but only 4 are labelled -- the other 2 must be worked out first.","The missing horizontal side = 14m − 6m = 8m.","The missing vertical side = 6m + 4m = 10m.","Add all 6 sides: 14 + 6 + 8 + 4 + 6 + 10 = 48m"],"diagram":{"type":"compound_rectilinear","vertices":[{"x":0,"y":0},{"x":14,"y":0},{"x":14,"y":6},{"x":6,"y":6},{"x":6,"y":10},{"x":0,"y":10}],"edgeLabels":[{"edgeIndex":0,"label":"14 m"},{"edgeIndex":1,"label":"6 m"},{"edgeIndex":3,"label":"4 m"},{"edgeIndex":4,"label":"6 m"}]}}$json$,
 'Programme Increment 020, Wave 1. Assessment Brain QT-MR-07, competency MR-03. Question family: mr03-compound-area-perimeter. Parametric variant of mr03-compound-03: identical structure and reasoning, different real numbers. Independently recomputed: missing horizontal = 14−6=8, missing vertical = 6+4=10, total = 14+6+8+4+6+10=48.',
 2, 'inc020-wave1-mr03-compound-area-perimeter',
 'mr03-compound-area-perimeter', 'angel_original', 'provisional', 1, true,
 'Adding only the 4 labelled sides (14+6+4+6=30) and forgetting that a compound shape has hidden sides which still count toward the perimeter.',
 'NEAR_TRANSFER')
on conflict (id) do nothing;

-- === compound-05 — SECURE, hard, area only, representation variant (opposite-corner notch orientation) ===
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr03-compound-05', 'maths', 'QT-MR-07', array['csse'], 'hard', 'short-answer', 100,
 $json${"id":"mr03-compound-05","marks":2,"skill":"geometry","answer":"79m2","question":"A field is shaped like the diagram shown, with a rectangular section missing from one corner. The full outer rectangle would measure 11m by 9m, but a 4m by 5m rectangle is missing from the bottom-left corner. What is the area of the field?","workingSteps":["Method: find the area of the full outer rectangle, then subtract the missing corner.","Full rectangle: 11m × 9m = 99m²","Missing corner: 4m × 5m = 20m²","Field area: 99m² − 20m² = 79m²","Check by splitting into two rectangles instead: (7m × 9m) + (4m × 4m) = 63m² + 16m² = 79m² ✓"],"diagram":{"type":"compound_rectilinear","vertices":[{"x":0,"y":9},{"x":11,"y":9},{"x":11,"y":0},{"x":4,"y":0},{"x":4,"y":5},{"x":0,"y":5}],"edgeLabels":[{"edgeIndex":0,"label":"11 m"},{"edgeIndex":1,"label":"9 m"},{"edgeIndex":2,"label":"7 m"},{"edgeIndex":3,"label":"5 m"},{"edgeIndex":4,"label":"4 m"}]}}$json$,
 'Programme Increment 020, Wave 1. Assessment Brain QT-MR-07, competency MR-03. Question family: mr03-compound-area-perimeter. Secure-tier REPRESENTATION variant: the notch is cut from the opposite (bottom-left) corner rather than the top-right corner every other row in this family uses, and this row deliberately teaches the outer-rectangle-minus-notch method rather than the split-into-two-rectangles method used elsewhere in the family -- a genuinely different but equally valid reasoning route, cross-verified against the split method in workingSteps. Independently recomputed both ways: 99−20=79, and 63+16=79.',
 2, 'inc020-wave1-mr03-compound-area-perimeter',
 'mr03-compound-area-perimeter', 'angel_original', 'provisional', 1, true,
 'Adding the missing corner''s area to the outer rectangle instead of subtracting it, or subtracting it from the wrong outer dimension.',
 'NEAR_TRANSFER')
on conflict (id) do nothing;

-- === compound-06 — TRANSFER, hard, reverse reasoning: given the perimeter, find a missing dimension ===
-- Founder Educational Review amendment (Increment 020 Wave 1 review): the
-- original diagram drew the unknown "?" edge at its true, proportionally
-- accurate solved length (12, exactly twice the rendered "6 m" edge),
-- which a visually sharp learner could estimate from directly -- a real
-- leak the Founder's own review caught, undermining this item's own
-- FAR_TRANSFER/reverse-reasoning intent. Every edge below is now a
-- deliberately schematic (not-proportionally-accurate) stand-in --
-- vertices (0,0)-(10,0)-(10,4)-(6,4)-(6,7)-(0,7), bearing no numeric
-- relationship to the real values 12/6/4/5/7/10 -- with `notToScale:true`
-- so the renderer shows a visible "Diagram not drawn to scale." notice.
-- The mathematics itself is UNCHANGED: perimeter 44m, upper section
-- 5m x 4m, lower height 6m, answer 12m, marks 2, FAR_TRANSFER, question
-- text and workingSteps all identical to the original, pre-amendment row.
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr03-compound-06', 'maths', 'QT-MR-07', array['csse'], 'hard', 'short-answer', 110,
 $json${"id":"mr03-compound-06","marks":2,"skill":"geometry","answer":"12m","question":"An L-shaped field has a perimeter of 44m. The narrower upper section measures 5m by 4m. The lower section is 6m tall, but its width is unknown, as shown. What is the width of the lower section?","workingSteps":["Let the unknown width be W. Going around all 6 sides: W + 6 + (W − 5) + 4 + 5 + (6 + 4) = perimeter.","This simplifies to: 2W + 20 = 44","So 2W = 24, and W = 12m","Check: sides are 12, 6, 7, 4, 5, 10 -- these add up to 44 ✓"],"diagram":{"type":"compound_rectilinear","notToScale":true,"vertices":[{"x":0,"y":0},{"x":10,"y":0},{"x":10,"y":4},{"x":6,"y":4},{"x":6,"y":7},{"x":0,"y":7}],"edgeLabels":[{"edgeIndex":0,"label":"?"},{"edgeIndex":1,"label":"6 m"},{"edgeIndex":3,"label":"4 m"},{"edgeIndex":4,"label":"5 m"}]}}$json$,
 'Programme Increment 020, Wave 1. Assessment Brain QT-MR-07, competency MR-03. Question family: mr03-compound-area-perimeter. Part 1''s required unseen-transfer item: reverses every other row''s forward direction (given sides, find perimeter) into a genuinely unfamiliar reasoning direction (given the perimeter, find a missing side), requiring simple algebraic reasoning over the same shape structure taught in mr03-compound-03/04, not a rehearsed forward calculation. Independently recomputed: perimeter = W + 6 + (W-5) + 4 + 5 + 10 = 2W + 20; 2W+20=44 -> W=12; verified sides 12,6,7,4,5,10 sum to 44. AMENDED post-Founder-review (Increment 020 Wave 1): diagram vertices are now schematic/not-to-scale (see this INSERT''s own header comment) -- the mathematical content (question text, workingSteps, answer, marks, transfer_class) is byte-for-byte unchanged from the pre-amendment row.',
 2, 'inc020-wave1-mr03-compound-area-perimeter',
 'mr03-compound-area-perimeter', 'angel_original', 'provisional', 1, true,
 'Treating the perimeter as if it were the area, or trying to find W by guessing rather than setting up the total-sides equation.',
 'FAR_TRANSFER')
on conflict (id) do nothing;

-- === compound-07 — HIGHER REASONING, challenge, 3-rectangle staircase decomposition ===
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr03-compound-07', 'maths', 'QT-MR-07', array['csse'], 'challenge', 'short-answer', 130,
 $json${"id":"mr03-compound-07","marks":3,"skill":"geometry","answer":"72m2","question":"A stepped patio is shown, made of three rectangular sections stacked like stairs. Six of its sides measure 12m, 3m, 4m, 3m, 4m and 3m, as shown. What is the total area of the patio?","workingSteps":["Split the shape into three horizontal strips.","Bottom strip: 12m × 3m = 36m²","Middle strip: 8m × 3m = 24m² (the middle strip''s width is 12m − 4m = 8m)","Top strip: 4m × 3m = 12m²","Total area: 36 + 24 + 12 = 72m²"],"diagram":{"type":"compound_rectilinear","vertices":[{"x":0,"y":0},{"x":12,"y":0},{"x":12,"y":3},{"x":8,"y":3},{"x":8,"y":6},{"x":4,"y":6},{"x":4,"y":9},{"x":0,"y":9}],"edgeLabels":[{"edgeIndex":0,"label":"12 m"},{"edgeIndex":1,"label":"3 m"},{"edgeIndex":2,"label":"4 m"},{"edgeIndex":3,"label":"3 m"},{"edgeIndex":4,"label":"4 m"},{"edgeIndex":5,"label":"3 m"}]}}$json$,
 'Programme Increment 020, Wave 1. Assessment Brain QT-MR-07, competency MR-03. Question family: mr03-compound-area-perimeter. The family''s one challenge-tier item -- a specific, disclosed reasoning-depth justification (a genuine 3-way decomposition, not a 2-piece L-shape) per Part 9''s explicit instruction against blind difficulty rebalancing, and a deliberate small counterweight to this codebase''s own confirmed 1-of-293 challenge-tier imbalance. Independently recomputed: bottom 12×3=36, middle (12−4)×3=8×3=24, top 4×3=12, total=72.',
 2, 'inc020-wave1-mr03-compound-area-perimeter',
 'mr03-compound-area-perimeter', 'angel_original', 'provisional', 1, true,
 'Treating the shape as a single rectangle (e.g. 12m × 9m) instead of splitting it into its three genuinely different-width strips.',
 'MIXED_TRANSFER')
on conflict (id) do nothing;

-- === compound-08 — RETRIEVAL anchor, easy, fresh area-only instance (also the lesson's own independent-retry item) ===
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('mr03-compound-08', 'maths', 'QT-MR-07', array['csse'], 'easy', 'short-answer', 75,
 $json${"id":"mr03-compound-08","marks":1,"skill":"geometry","answer":"24m2","question":"A small patio is L-shaped, made of two rectangular sections. The main section is 6m by 3m. The smaller section is 3m by 2m. What is the total area of the patio?","workingSteps":["Split the shape into its two rectangles.","Main section: 6m × 3m = 18m²","Smaller section: 3m × 2m = 6m²","Total area: 18m² + 6m² = 24m²"],"diagram":{"type":"compound_rectilinear","vertices":[{"x":0,"y":0},{"x":6,"y":0},{"x":6,"y":3},{"x":3,"y":3},{"x":3,"y":5},{"x":0,"y":5}],"edgeLabels":[{"edgeIndex":0,"label":"6 m"},{"edgeIndex":1,"label":"3 m"},{"edgeIndex":3,"label":"2 m"},{"edgeIndex":4,"label":"3 m"}]}}$json$,
 'Programme Increment 020, Wave 1. Assessment Brain QT-MR-07, competency MR-03. Question family: mr03-compound-area-perimeter. A third fresh foundation-tier instance (same structure as mr03-compound-01/02, deliberately smaller/simpler numbers), intended as this family''s spaced-retrieval anchor and this increment''s own new Learn lesson page''s "fresh opportunity" independent-retry item -- same dual role as learn-mth-pct-independent-retry (migration 029) for the existing percentages lesson. Independently recomputed: 6×3=18, 3×2=6, 18+6=24.',
 2, 'inc020-wave1-mr03-compound-area-perimeter',
 'mr03-compound-area-perimeter', 'angel_original', 'provisional', 1, true,
 'Adding all four given lengths together (6+3+3+2) instead of multiplying each rectangle''s own two sides and then adding the two areas.',
 'ROUTINE')
on conflict (id) do nothing;

commit;
