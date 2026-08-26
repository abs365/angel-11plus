-- Angel Digital 11+ — Migration 140
-- Mathematics Structural Capacity, Authoring Increment 006 — Rounding-
-- Bounds Reasoning Classification-A Family (Decision 205/206).
--
-- ============================================================
-- AUTHORITY AND EVIDENCE GATE (Decision 206)
-- ============================================================
-- Decision 204 exhausted the two archetype candidates Decision 203 had
-- ranked first (best-value/unit-price: HIGH overlap with mock-mr13-
-- craftstall via the shared 2021 Entry Q6 source; work-backwards/
-- reverse-arithmetic: moderate-to-high overlap/insufficient evidence).
-- Decision 205 then re-audited all 62 numbered questions across the 3
-- available primary-source Mathematics papers (180 marks) and identified
-- rounding-bounds reasoning (2022 Q9, 2023 Q14) as the strongest
-- currently-unrepresented recurring existing-capability archetype. This
-- migration is the result of independently re-opening BOTH of those exact
-- sources directly (via pdftotext against the real official papers and
-- mark schemes, not Decision prose) before authoring anything.
--
-- SOURCE-CONTAINS vs AUTHORED-EXTRAPOLATION (Decision 200/201's
-- traceability discipline, applied here from the start):
--
-- SOURCE-CONTAINS: 2022 Q9 (knowledge/csse/official-papers/Maths-Paper-
-- 2022-Entry-for-Publication.pdf), verbatim: "X and Y are whole numbers.
-- X rounded to the nearest 10 gives 350. Y rounded to the nearest 10
-- gives 320. (a) What is the largest possible value of X? (b) What is
-- the smallest possible value of Y? (c) What is the largest possible
-- value of X+Y? (d) What is the smallest possible value of X-Y?" Mark
-- scheme (knowledge/csse/mark-schemes/Maths-2022-Entry-Mark-Scheme.pdf)
-- confirms answers 354, 315, 678, 21 — independently hand-recomputed
-- this session and matching exactly: largest X in [345,354] is 354;
-- smallest Y in [315,324] is 315; largest X+largest Y = 354+324=678;
-- smallest X-largest Y = 345-324=21. This is a genuine, real, evidenced
-- FOUR-subpart, FOUR-mark family in the primary source (1 mark per
-- subpart, per the mark scheme's own "1 mark for each correct answer"
-- rule) — unlike Decision 199/200's fabricated fourth part, this
-- structure is directly and completely SOURCE-CONTAINS, not extrapolated.
--
-- SOURCE-CONTAINS: 2023 Q14 (knowledge/csse/official-papers/Maths-Paper-
-- 2023-Entry-for-publication.pdf), verbatim: "In the rectangle below, the
-- length is 20cm rounded to the nearest 10cm and the width is 5cm rounded
-- to the nearest cm. (a) Find the smallest possible value for the
-- perimeter of the rectangle. (b) Find the smallest possible value for
-- the area of the rectangle." Mark scheme (knowledge/csse/mark-schemes/
-- Maths-Marking-Scheme-2023-Entry.pdf) confirms answers 39cm and 67.5cm²
-- — independently hand-recomputed this session: smallest length
-- consistent with rounding to 20 (nearest 10) is 15cm; smallest width
-- consistent with rounding to 5 (nearest whole cm) is 4.5cm; smallest
-- perimeter = 2x(15+4.5) = 39cm; smallest area = 15x4.5 = 67.5cm². Both
-- match the mark scheme exactly.
--
-- RECURRENCE VERDICT (Decision 206 Phase 4): A — STRONG RECURRING
-- ARCHETYPE. Both sources share the identical underlying reasoning: given
-- one or more quantities described only by their rounded value (rounded
-- to the nearest 10, or nearest whole unit), derive the true extremal
-- bound(s) of the unrounded quantity/quantities, then combine those
-- bounds via a stated arithmetic or geometric operation (sum, difference,
-- perimeter, area) to answer a further extremal question. 2022 Q9 applies
-- this to two independent whole numbers combined by addition/subtraction;
-- 2023 Q14 applies the SAME bound-derivation skill to two rectangle
-- dimensions combined by perimeter/area — a different combinatorial
-- context, same core reasoning skill. This migration reuses 2022 Q9's
-- richer four-subpart pure-arithmetic structure (AUTHORED-EXTRAPOLATION:
-- an original two-quantity spectator-count scenario, not a paraphrase of
-- either source, and not the geometric/perimeter context already used by
-- mock-mr03mr07-perimeterarea).
--
-- CURRICULUM CROSS-CHECK (Decision 206 Phase 5, PRIMARY-SOURCE ASSESSMENT
-- EVIDENCE distinguished from CURRICULUM EVIDENCE): rounding any whole
-- number to a required degree of accuracy, and reasoning about the range
-- of values consistent with a given rounded figure, is core England Year
-- 6 (KS2) National Curriculum content (Number — Rounding), and this exact
-- "greatest/least possible value given a rounded figure" reasoning format
-- is a well-established KS2 SATs-style question type. No formal interval
-- notation, no error-bound terminology, and no secondary-school technique
-- is introduced anywhere in this family — every question uses the same
-- plain "largest possible" / "smallest possible" phrasing the real source
-- itself uses. Both evidence tiers agree; curriculum evidence is
-- consistent with, and does not need to override, primary-source
-- evidence here.
--
-- ============================================================
-- ESTATE OVERLAP AUDIT (Decision 206 Phase 6) — LOW OVERLAP, proceeding
-- ============================================================
-- Repository-wide search for "largest possible"/"smallest possible"/
-- "greatest possible"/"least possible" across every existing migration
-- returns ZERO prior matches anywhere in this repository — this exact
-- reasoning demand has never been assessed before.
-- mock-mr03mr07-perimeterarea (migration 109) is cited internally against
-- "CSSE-006 Q14 (rounding/measurement + geometric perimeter/area)" (the
-- same 2023 Q14 re-opened above), but its ACTUAL authored content
-- (independently re-read this session) is a plain unit-conversion-then-
-- perimeter/area calculation on EXACT given dimensions (e.g. "250cm =
-- 2.5m; perimeter = 2x(3.6+2.5)") — it contains no bounds/rounding-range
-- reasoning of any kind, despite its citation's shorthand. This is a
-- citation-fidelity gap in that existing family's own header, disclosed
-- here for the Founder's awareness but out of this migration's scope to
-- correct (Decision 206 was not authorised to modify migration 109).
-- Its actual reasoning content therefore does not overlap with this new
-- family's genuine bounds-derivation demand.
-- mock-mr11-truefalsejudgement / mock-mr11-propertysearch (migrations
-- 091/094, same QT-MR-11): the judgement family evaluates a stated
-- general number-property CLAIM (true/false); the property-search family
-- generates and tests CANDIDATE numbers against a prime/square/range
-- constraint. Neither involves a rounding-derived bound of any kind, and
-- neither is a grouped multi-subpart shared-scenario Classification-A
-- family (both are single-question or 2-question standalone items, not
-- one coherent numbered experience). mr05-search-03/04/05 (migration 066,
-- Practice-only, not Mock content) are likewise standalone single-clause
-- searches (smallest square/largest factor/smallest multiple), not a
-- multi-quantity rounding-bounds-then-combine structure.
-- OVERLAP CLASSIFICATION: LOW. No existing Angel content, Mock or
-- Practice, tests deriving an extremal bound from a stated rounded value.
--
-- ============================================================
-- AUTHORING GATE (Decision 206 Phase 7) — ALL SEVEN CONDITIONS MET
-- ============================================================
-- 1. Primary-source structure authentic: SOURCE-CONTAINS above (2022 Q9
--    verbatim, independently re-verified against the real mark scheme).
-- 2. Materially underrepresented: LOW overlap audit above; zero prior
--    Angel content of this reasoning type.
-- 3. Existing renderer supports it: text-only, explicit sharedStem, no
--    stimulus/table/diagram of any kind required.
-- 4. Age appropriate: Year 6/KS2 curriculum cross-check above.
-- 5. Coherent Classification-A numbered experience: one shared scenario
--    (two independently-rounded spectator counts), four subparts that
--    each draw on the shared rounding facts, one question_group_id.
-- 6. Genuine structural capacity, not scenario variety: this is a wholly
--    new reasoning skill (rounding-bounds derivation) absent from every
--    existing family, not a renamed existing archetype.
-- 7. Every reasoning demand traces to source evidence: see per-subpart
--    SOURCE-CONTAINS tags on each row's own explanation below.
--
-- ============================================================
-- FAMILY AUTHORED: mock-mr11-roundingbounds (QT-MR-11, reused — the SAME
-- existing Question Type mock-mr11-truefalsejudgement/mock-mr11-
-- propertysearch already use, not a new one. QT-MR-11's own documented
-- definition (docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md)
-- is "Number-Property Reasoning (Judgement and Property-Satisfying
-- Search)" — deriving the extremal whole number consistent with a stated
-- rounding property is a property-satisfying-search task (the property
-- being "rounds to N to the nearest 10", not primes/squares as the
-- existing property-search instance uses). Disclosed honestly as an
-- extension of QT-MR-11's search sub-format to a new property predicate,
-- matching this framework's own established convention of documenting an
-- imperfect-but-closest-fit mapping rather than inventing a new Question
-- Type for convenience (see the framework's own QT-MR-03/QT-MR-09 to MR-01
-- mapping precedent). 4 rows, 1 numbered-question experience, 4 marks,
-- TEXT-ONLY narrative presentation with explicit sharedStem — no
-- stimulus/table.
-- ============================================================
-- AUTHORED-EXTRAPOLATION: an original "Oakwood Athletics Meet" scenario
-- with two independently-rounded spectator counts (adults round to 380,
-- children round to 240, both to the nearest 10) — not a reproduction of
-- either source's own letters (X/Y), numbers (350/320, or 20cm/5cm), or
-- scenario (no rectangle, no geometry). Only the underlying bound-
-- derivation-then-combine STRUCTURE from 2022 Q9 is reused.
--
-- sharedStem used (the established explicit-sharedStem contract,
-- migrations 121/122/131/134/137): "At the Oakwood Athletics Meet, the
-- number of adult spectators rounds to 380 to the nearest 10. The number
-- of child spectators rounds to 240 to the nearest 10." — verified this
-- session, before writing this file, that this declared stem is an
-- exact, literal prefix of every one of the 4 rows' own `question` text,
-- with a non-empty tail in every case, the same rule resolveGroupSharedStem()
-- enforces at render time (lib/mockAttempt/workspace.ts).
--
-- ============================================================
-- REASONING PROGRESSION (four genuinely different demands, not four
-- repetitions of one operation; mirrors 2022 Q9's own implicit gradient)
-- ============================================================
-- (a) easy — direct upper-bound extraction for a single rounded quantity.
-- (b) easy — direct lower-bound extraction for a single rounded quantity
--     (the same core skill as (a) applied in the opposite direction, not
--     a harder or easier restatement of it — genuinely equal demand,
--     matching the real source's own equal 1-mark weighting of (a)/(b)).
-- (c) medium — requires deriving BOTH quantities' upper bounds and then
--     combining them by addition; a compound step, not a bare bound
--     lookup.
-- (d) hard — requires recognising that MINIMISING a difference requires
--     the minuend at its SMALLEST bound and the subtrahend at its
--     LARGEST bound (a directionally trickier inference than (c)'s more
--     intuitive "maximise both to maximise the sum"), mirroring 2022 Q9's
--     own (d) as its hardest subpart.
-- Disclosed honestly: this migration adds a genuine TWO-row easy-tier
-- contribution (Decision 205's own finding that only 1 easy row existed
-- across the entire useful reserve) — but only because the real source
-- supports two genuinely equal-demand easy subparts, not manufactured to
-- repair estate statistics.
--
-- ============================================================
-- MATHEMATICAL VERIFICATION (every answer derived by two independent
-- methods before this file was written; bounds convention matches the
-- real source's own round-half-up convention, confirmed by 2022 Q9's own
-- answer 354 for "rounds to 350", i.e. 345 rounds UP to 350, not down)
-- ============================================================
--   (a) Adults round to 380 (nearest 10) => true value in [375,384].
--       Method 1 (boundary rule): N-5 to N+4 for N=380 => 375 to 384.
--       Method 2 (direct check): 384 rounds to 380 (nearest ten below
--       385); 385 would round to 390. Largest = 384.
--   (b) Children round to 240 (nearest 10) => true value in [235,244].
--       Method 1: N-5 to N+4 for N=240 => 235 to 244.
--       Method 2: 235 rounds to 240 (nearest ten above 230); 234 would
--       round to 230. Smallest = 235.
--   (c) Largest X+Y = largest adults + largest children = 384 + 244.
--       Method 1 (direct sum): 384+244=628.
--       Method 2 (bound-adjustment): 380+240=620, plus the two upper
--       adjustments (+4 and +4) = 620+8=628. Both agree: 628.
--   (d) Smallest X-Y = smallest adults - largest children = 375 - 244.
--       Method 1 (direct difference): 375-244=131.
--       Method 2 (bound-adjustment): 380-240=140, minus the adults'
--       downward adjustment (-5) minus the children's upward adjustment
--       (-4) = 140-9=131. Both agree: 131.
-- Every answer is a single, unambiguous whole number under the round-
-- half-up convention (matching the real source's own single-answer mark
-- scheme, not a range or multiple-valid-answer format) — "largest
-- possible"/"smallest possible" each has exactly one correct value, not
-- several, so a deterministic exact-match answer remains valid.
--
-- ============================================================
-- SUBPART INDEPENDENCE PROOF (no subpart's marking depends on a learner's
-- own answer to a previous subpart — each is freshly derivable from the
-- shared rounding facts restated in the sharedStem)
-- ============================================================
-- (a) self-contained: only the adults' rounding fact is needed.
-- (b) self-contained: only the children's rounding fact is needed; no
--     dependency on (a)'s own answer.
-- (c) self-contained: both rounding facts are restated via the shared
--     stem; does not require or reuse (a)/(b)'s own stored answers,
--     though a learner MAY reuse the same bound-derivation working.
-- (d) self-contained: both rounding facts are restated via the shared
--     stem; independent of (a)/(b)/(c)'s own answers.
--
-- ============================================================
-- NEAREST-NEIGHBOUR AUDIT / ANTI-MEMORISATION
-- ============================================================
-- Closest existing family: mock-mr03mr07-perimeterarea (shares a loose
-- citation to the same 2023 Q14 source, but NOT its actual reasoning
-- content — see estate overlap audit above). Genuinely new reasoning:
-- rounding-consistent bound derivation, entirely absent elsewhere in
-- Angel. Not a reskin of any existing family — no existing Angel content
-- requires reasoning about the RANGE of true values consistent with a
-- stated rounded figure.
-- FUTURE VARIANT DIMENSIONS (not authored here): (1) rounding to the
-- nearest 100/1000 instead of nearest 10, changing the bound width from
-- 10 to 100/1000 values; (2) three independently-rounded quantities
-- instead of two, changing the combination step's complexity; (3) a
-- different combining operation (e.g. a rounded quantity multiplied by an
-- exact given quantity) drawing on the same core bound-derivation skill.
--
-- ============================================================
-- DIAGRAM/GEOMETRY BOUNDARY PRESERVED
-- ============================================================
-- This family is text-only narrative content; it requires, uses, and
-- implies no diagram, chart, table, or geometry rendering capability of
-- any kind. The absence of diagram/geometry-rendering capability remains
-- a disclosed, unresolved structural gap (Decision 189/191/195/198/205),
-- not something this migration claims to have closed or worked around.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch any existing row, family, or migration (088-139). Does
-- not alter any of the 55 existing mock_eligible rows or any of the 22
-- existing independently_validated reserve rows. Does not set
-- eligibility_status to anything other than 'authentic_assessment_candidate'.
-- Does not create or touch any ali_family_review row (migration 141
-- handles the pending-review placeholder separately). Does not create,
-- modify, or activate any ali_mock_form row. Does not touch English or
-- Writing content. Does not author a second family. Does not build or
-- imply any diagram/geometry rendering capability. Does not reproduce any
-- CSSE past-paper question wording, image, or exact numeric scenario.
--
-- FAIL-CLOSED / DUPLICATE-ID PROTECTION: the insert uses
-- `on conflict (id) do nothing`, matching every prior content migration
-- in this repository exactly — if any of these 4 IDs already exist
-- (drift, re-run, or a naming collision with unrelated content), no row
-- is silently overwritten; the migration becomes a safe no-op for that
-- row rather than corrupting existing state.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class, question_group_id, group_order, subpart_label, marking_mode)
values
('mock-mr11-roundingbounds-01', 'maths', 'QT-MR-11', array['csse'], 'easy', 'short-answer', 50,
 $json${"id":"mock-mr11-roundingbounds-01","marks":1,"skill":"number-properties","answer":"384","question":"At the Oakwood Athletics Meet, the number of adult spectators rounds to 380 to the nearest 10. The number of child spectators rounds to 240 to the nearest 10. What is the largest possible number of adult spectators?","workingSteps":["Whole numbers from 375 to 384 all round to 380 to the nearest 10 (385 would round up to 390 instead)","The largest such whole number is 384"],"sharedStem":"At the Oakwood Athletics Meet, the number of adult spectators rounds to 380 to the nearest 10. The number of child spectators rounds to 240 to the nearest 10."}$json$,
 'Mathematics Structural Capacity, Authoring Increment 006 (Decision 205/206). Subpart (a) — QT-MR-11 (Number-Property Reasoning, property-satisfying-search sub-format), family mock-mr11-roundingbounds. SOURCE-CONTAINS: evidenced by 2022 Q9(a) (independently re-verified this session against the real paper and mark scheme: "X rounded to the nearest 10 gives 350... largest possible value of X" = 354). Direct upper-bound extraction for a single rounded quantity. Answer independently recomputed via two methods (boundary rule, direct check): 384.', 2, 'mock-mr11-roundingbounds-01',
 'mock-mr11-roundingbounds', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Using 375 (the lower bound) instead of 384 (the upper bound), or assuming the consistent range is narrower than 10 values wide.',
 'FAR_TRANSFER', 'mock-mr11-roundingbounds', 1, '(a)', 'deterministic'),

('mock-mr11-roundingbounds-02', 'maths', 'QT-MR-11', array['csse'], 'easy', 'short-answer', 50,
 $json${"id":"mock-mr11-roundingbounds-02","marks":1,"skill":"number-properties","answer":"235","question":"At the Oakwood Athletics Meet, the number of adult spectators rounds to 380 to the nearest 10. The number of child spectators rounds to 240 to the nearest 10. What is the smallest possible number of child spectators?","workingSteps":["Whole numbers from 235 to 244 all round to 240 to the nearest 10 (234 would round down to 230 instead)","The smallest such whole number is 235"],"sharedStem":"At the Oakwood Athletics Meet, the number of adult spectators rounds to 380 to the nearest 10. The number of child spectators rounds to 240 to the nearest 10."}$json$,
 'Mathematics Structural Capacity, Authoring Increment 006 (Decision 205/206). Subpart (b) — QT-MR-11, family mock-mr11-roundingbounds. Reuses the SAME shared rounding facts as subpart (a) but requires the opposite-direction bound (smallest, not largest) for the OTHER quantity — a genuinely equal-but-distinct demand from (a), not a relabelling of it. SOURCE-CONTAINS: evidenced by 2022 Q9(b) (independently re-verified: "smallest possible value of Y" = 315, given Y rounds to 320). Answer independently recomputed via two methods (boundary rule, direct check): 235.', 2, 'mock-mr11-roundingbounds-02',
 'mock-mr11-roundingbounds', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Using 244 (the upper bound) instead of 235 (the lower bound), or rounding 234 up to 240 by mistake.',
 'FAR_TRANSFER', 'mock-mr11-roundingbounds', 2, '(b)', 'deterministic'),

('mock-mr11-roundingbounds-03', 'maths', 'QT-MR-11', array['csse'], 'medium', 'short-answer', 80,
 $json${"id":"mock-mr11-roundingbounds-03","marks":1,"skill":"number-properties","answer":"628","question":"At the Oakwood Athletics Meet, the number of adult spectators rounds to 380 to the nearest 10. The number of child spectators rounds to 240 to the nearest 10. What is the largest possible total number of spectators, adults and children added together?","workingSteps":["The largest possible number of adults is 384","The largest possible number of children is 244","384 + 244 = 628"],"sharedStem":"At the Oakwood Athletics Meet, the number of adult spectators rounds to 380 to the nearest 10. The number of child spectators rounds to 240 to the nearest 10."}$json$,
 'Mathematics Structural Capacity, Authoring Increment 006 (Decision 205/206). Subpart (c) — QT-MR-11, family mock-mr11-roundingbounds. Restates both shared rounding facts, independent of the learner''s own working in (a)/(b). Requires deriving BOTH quantities'' upper bounds and combining them by addition — a compound step beyond a bare bound lookup. SOURCE-CONTAINS: evidenced by 2022 Q9(c) (independently re-verified: "largest possible value of X+Y" = 678, using largest X and largest Y). Answer independently recomputed via two methods (direct sum, bound-adjustment): 628.', 2, 'mock-mr11-roundingbounds-03',
 'mock-mr11-roundingbounds', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Using the smallest possible adults together with the largest possible children (or vice versa), instead of the largest of BOTH quantities, when trying to maximise a sum.',
 'FAR_TRANSFER', 'mock-mr11-roundingbounds', 3, '(c)', 'deterministic'),

('mock-mr11-roundingbounds-04', 'maths', 'QT-MR-11', array['csse'], 'hard', 'short-answer', 110,
 $json${"id":"mock-mr11-roundingbounds-04","marks":1,"skill":"number-properties","answer":"131","question":"At the Oakwood Athletics Meet, the number of adult spectators rounds to 380 to the nearest 10. The number of child spectators rounds to 240 to the nearest 10. What is the smallest possible value of the number of adult spectators minus the number of child spectators?","workingSteps":["The smallest possible number of adults is 375","The largest possible number of children is 244","375 - 244 = 131"],"sharedStem":"At the Oakwood Athletics Meet, the number of adult spectators rounds to 380 to the nearest 10. The number of child spectators rounds to 240 to the nearest 10."}$json$,
 'Mathematics Structural Capacity, Authoring Increment 006 (Decision 205/206). Subpart (d) — QT-MR-11, family mock-mr11-roundingbounds. Restates both shared rounding facts, independent of the learner''s own working in (a)-(c). The deepest reasoning demand of the four subparts: minimising a DIFFERENCE requires the minuend at its smallest bound and the subtrahend at its largest bound simultaneously — a directionally trickier inference than (c)''s more intuitive "maximise both to maximise the sum". SOURCE-CONTAINS: evidenced by 2022 Q9(d) (independently re-verified: "smallest possible value of X-Y" = 21, using smallest X and largest Y). Answer independently recomputed via two methods (direct difference, bound-adjustment): 131. This is the final subpart of this family: four marks reflects the real source''s own genuinely evidenced four-subpart structure (unlike Decision 199/200''s fabricated fourth part), not a manufactured target.', 2, 'mock-mr11-roundingbounds-04',
 'mock-mr11-roundingbounds', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Using the largest possible adults and the smallest possible children (the wrong combination for minimising a difference), or computing children minus adults instead of adults minus children.',
 'FAR_TRANSFER', 'mock-mr11-roundingbounds', 4, '(d)', 'deterministic')
on conflict (id) do nothing;

commit;
