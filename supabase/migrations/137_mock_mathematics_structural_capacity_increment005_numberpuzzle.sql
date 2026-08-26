-- Angel Digital 11+ — Migration 137
-- Mathematics Structural Capacity, Authoring Increment 005 — Interdependent
-- Algebraic-System Classification-A Family, Variant 2 (Decision 198/199,
-- REMEDIATED per Decision 200/201).
--
-- ============================================================
-- REMEDIATION NOTICE (Decision 200/201) — READ FIRST
-- ============================================================
-- This migration was NEVER applied to production. Its original authored
-- form (Decision 199) contained a fourth row, mock-mr06-numberpuzzle-04,
-- requiring the learner to form and solve a quadratic equation by
-- factorisation (n^2-9n-70=0) and reject a negative root. Decision 200's
-- educational evidence audit independently re-opened the real 2023 Q18
-- source and mark scheme directly and found this fourth part had NO
-- source support whatsoever: the real source has exactly THREE parts,
-- and no quadratic, no multiple roots, and no root-rejection of any kind
-- appears anywhere in it. Decision 200 verdict: (a)/(b)/(c) KEEP,
-- (d) REMOVE.
--
-- Per this session's own directive, before simply deleting (d), the
-- other four evidenced occurrences of this archetype (2023 Q8, 2022 Q6,
-- 2021 Q7, 2021 Q20) were independently re-opened this session (via
-- pdftotext against the real official papers) to check whether ANY of
-- them evidences a genuine, age-appropriate fourth reasoning demand that
-- could support a replacement (d) without quadratics or unsupported
-- formal technique. Findings, quoted directly from the real papers:
--   - 2023 Q8: three shape-symbol simultaneous equations (values sum to
--     14, 10, 29), "Find the values of" three requested shape values —
--     THREE parts, no reverse/quadratic demand, forward-solve only.
--   - 2022 Q6: "B = 2A and 2C = A. If A+B+C=7 find: (i) A (ii) C" — TWO
--     parts, a stated numeric total, forward-solve only.
--   - 2021 Q7: "A is double B and B is three times C and A+B+C=50 find:
--     (a) C (b) A" — TWO parts, a stated numeric total, forward-solve
--     only.
--   - 2021 Q20 (mock-mr06-linkedvalues' own source): three simultaneous
--     price equations, "(a) cake (b) coffee (c) sandwich" — THREE parts,
--     a stated total per equation, forward elimination only.
-- Across all five evidenced occurrences of this archetype, the maximum
-- number of subparts is THREE, and not one of the five ever requires
-- reverse reasoning, forming a new equation from a stated relationship
-- between two derived quantities, or solving anything non-linear. There
-- is therefore NO primary-source evidence anywhere in the evidenced set
-- supporting a genuine, source-aligned fourth part for this family, under
-- any operation. STRUCTURE CHOSEN: THREE-PART FAMILY (Decision 201's own
-- section 3 choice A). Four marks were never a requirement; educational
-- authenticity outranks composition-ceiling optimisation, and no fourth
-- row is authored here or anywhere in this migration.
--
-- SOURCE-CONTAINS vs AUTHORED-EXTRAPOLATION (Decision 200/201's minimal
-- traceability improvement, applied retroactively to this migration):
-- every reasoning-demand claim below is tagged as one of:
--   SOURCE-CONTAINS: <exact quoted source text the claim is drawn from>
--   AUTHORED-EXTRAPOLATION: <a structural/stylistic choice this session
--     made that goes beyond, but does not contradict, the source>
-- A bare structural resemblance must never again be reported as though
-- the source itself contained a reasoning step it did not (this is
-- exactly the failure Decision 200 caught in the original (d)).
--
-- ============================================================
-- PRIMARY-SOURCE EVIDENCE LOCK (re-read directly this session via
-- pdftotext against the real official papers and mark scheme, not
-- Decision prose)
-- ============================================================
-- SOURCE-CONTAINS: 2023 Q18 (knowledge/csse/official-papers/Maths-Paper-
-- 2023-Entry-for-publication.pdf), verbatim: "This question is about four
-- positive numbers A, B, C and D... A = B+3, C = 3B, D = B^2. Find the
-- value of: (i) 3A-C (ii) C/(A-3) (iii) AB-C-D." Mark scheme
-- (knowledge/csse/mark-schemes/Maths-Marking-Scheme-2023-Entry.pdf)
-- confirms answers 9, 3, 0 -- independently hand-recomputed this session
-- and matching exactly: 3(B+3)-3B=9, 3B/B=3, (B+3)B-3B-B^2=0.
-- SOURCE-CONTAINS: this is a STRUCTURALLY DIFFERENT shape from 2021
-- Q20/mock-mr06-linkedvalues: no numeric total is ever stated in 2023
-- Q18; the four quantities are defined ONLY in terms of one unstated base
-- variable (B), and every requested value is a DERIVED EXPRESSION that
-- algebraically simplifies to a value independent of B (B cancels out),
-- rather than a linear equation solved for a concrete numeric value of B
-- itself.
-- AUTHORED-EXTRAPOLATION: reusing this cancellation STRUCTURE (not the
-- source's own letters, numbers, or exact combinations) for an original
-- Angel scenario. Evidence sufficiency verdict for THIS THREE-PART
-- structure: SUFFICIENT for a genuine Classification-A family distinct
-- from mock-mr06-linkedvalues.
--
-- ============================================================
-- FAMILY AUTHORED: mock-mr06-numberpuzzle (QT-MR-06, reused -- the SAME
-- existing Question Type mock-mr06-linkedvalues/mock-mr06-multiplerelation/
-- mock-mr06-sumdiff already use, not a new one; 3 rows, 1 numbered-
-- question experience, 3 marks, TEXT-ONLY abstract number-puzzle
-- presentation + explicit sharedStem -- no table/stimulus, matching the
-- real primary-source instance's own abstract, non-narrative framing
-- ("four positive numbers A, B, C and D"), a deliberately different
-- PRESENTATION style from mock-mr06-linkedvalues' concrete marble-
-- collector narrative and mock-mr04-campingsale's tent-shop narrative)
-- ============================================================
-- AUTHORED-EXTRAPOLATION: a hidden positive whole number n, with three
-- derived values P = n+9, Q = 9xn, R = nxn -- not a reproduction of the
-- real paper's own A/B/C/D letters, "3"/"B^2" numbers, or exact
-- combinations (3A-C, C/(A-3), AB-C-D). Every letter, number, and
-- combination is Angel-original; only the underlying algebraic-
-- cancellation STRUCTURE (evidenced above) is reused, matching the
-- established convention that structural inspiration, not wording, is
-- what may be reused (see migration 119's own equivalent disclosure for
-- mock-mr06-linkedvalues).
--
-- sharedStem used (the established explicit-sharedStem contract,
-- migrations 121/122/131/134): "A number puzzle uses a hidden positive
-- whole number, n. Three other values are defined by these rules: P = n
-- + 9, Q = 9 x n, and R = n x n." -- verified this session, before
-- writing this file, that this declared stem is an exact, literal prefix
-- of every one of the 3 rows' own `question` text and that every
-- resulting tail is non-empty, the same rule resolveGroupSharedStem()
-- enforces at render time (lib/mockAttempt/workspace.ts).
--
-- ============================================================
-- STRUCTURAL DISTINCTION FROM mock-mr06-linkedvalues (audited before
-- authoring, per Decision 199's own directive Part 3, re-confirmed
-- unaffected by this remediation)
-- ============================================================
-- SOURCE-CONTAINS: mock-mr06-linkedvalues' reasoning graph (2021 Q20): a
-- stated NUMERIC TOTAL constraint closes the system, so the base unknown
-- must be SOLVED from one linear equation, then forward-substituted.
-- SOURCE-CONTAINS: mock-mr06-numberpuzzle's reasoning graph (2023 Q18):
-- NO numeric total is ever stated -- n's value is never given and never
-- needs to be found at all; each of (a)-(c) is a SYMBOLIC SUBSTITUTION-
-- AND-SIMPLIFICATION exercise in which the unstated n algebraically
-- CANCELS OUT, yielding a value true for every positive n (independently
-- re-verified this session by substituting two different concrete values
-- of n, n=4 and n=10, into all three expressions and confirming both give
-- the same constants 81/9/0 -- see below). No subpart of
-- mock-mr06-numberpuzzle requires a learner familiar with
-- mock-mr06-linkedvalues to recognise or reuse its own solving sequence:
-- the two families' governing equations (linear-system-with-stated-total
-- versus variable-elimination-by-substitution) are fundamentally
-- different classroom techniques.
--
-- ============================================================
-- OTHER EXISTING-NEIGHBOUR AUDIT (repository-wide overlap search
-- performed before authoring, re-confirmed unaffected by this
-- remediation)
-- ============================================================
-- mock-mr06-multiplerelation / mock-mr06-sumdiff (migration 091):
-- standalone, UNGROUPED 2-unknown single-subpart-pair systems (one
-- relation + one sum), never a grouped Classification-A multi-subpart
-- family, never an algebraic-cancellation structure. No scenario, number,
-- or answer overlap.
-- mock-mr09-funrun / mock-mr10-bustimetable / mock-mr13-craftstall: all
-- genuine Classification-A, but each keyed to a structured TABLE
-- stimulus (data-handling / timetable / price-list), not an abstract
-- algebraic-symbol puzzle -- no reasoning-skill overlap.
-- mock-mr04-campingsale: genuine Classification-A text-only narrative,
-- but percentage/ratio reasoning (QT-MR-04), not algebra (QT-MR-06) -- no
-- reasoning-skill overlap.
-- Repository-wide search for "hidden number"/"number puzzle"/"n + 9"/
-- "9 x n"/"9n"/"numberpuzzle" confirms zero prior use anywhere in this
-- repository.
--
-- ============================================================
-- REASONING-DIVERSITY PROOF (three genuinely different demands, not
-- three repetitions of one operation)
-- ============================================================
-- (a) a linear-combination substitution-and-simplification (multiply P
--     by a constant, subtract Q, expand and collect like terms so the
--     n-terms cancel) (medium).
-- (b) a DIVISION-based substitution: recognising that (P - 9) is
--     algebraically identical to n before dividing Q by it -- a
--     materially different operation from (a) (division, and an implicit
--     rearrangement step before the division can even be performed)
--     (medium).
-- (c) forming and expanding a PRODUCT of two expressions (P x n).
--     containing an n^2 term, then combining with Q and R so that BOTH
--     the n^2 term and the n term cancel to leave exactly zero -- the
--     deepest simplification of the three subparts, and the only one
--     requiring expansion of a bracket multiplied by a variable rather
--     than by a fixed constant (hard).
--
-- ============================================================
-- ANSWERS INDEPENDENTLY VERIFIED VIA TWO METHODS before this file was
-- written (symbolic derivation, and numeric substitution at two
-- different concrete values of n)
-- ============================================================
--   (a) 9P - Q. Method 1 (symbolic): 9(n+9) - 9n = 9n + 81 - 9n = 81.
--       Method 2 (numeric check, n=4): P=13, Q=36; 9x13-36=117-36=81.
--       Method 2 (numeric check, n=10): P=19, Q=90; 9x19-90=171-90=81.
--       Both concrete checks agree with the symbolic result: 81.
--   (b) Q / (P - 9). Method 1 (symbolic): 9n / ((n+9)-9) = 9n/n = 9.
--       Method 2 (numeric, n=4): 36/(13-9)=36/4=9. Method 2 (numeric,
--       n=10): 90/(19-9)=90/10=9. Both agree: 9.
--   (c) (P x n) - Q - R. Method 1 (symbolic): (n+9)n - 9n - nxn
--       = n^2+9n-9n-n^2 = 0. Method 2 (numeric, n=4): (13x4)-36-16
--       = 52-36-16=0. Method 2 (numeric, n=10): (19x10)-90-100
--       = 190-90-100=0. Both agree: 0.
--
-- Every answer stored as a bare integer string, keeping every answer
-- deterministically, unambiguously exact-match scorable under the
-- current marking architecture, matching the established convention from
-- migrations 119/125/131/134.
--
-- ============================================================
-- SUBPART INDEPENDENCE PROOF (no subpart's marking depends on a
-- learner's own answer to a previous subpart)
-- ============================================================
-- (a) is fully self-contained: P and Q's defining rules are both
-- restated in its own text via the shared stem; no numeric value of n is
-- needed at all, so no dependency on any other subpart's working.
-- (b) likewise self-contained: only P and Q's rules are needed; no
-- dependency on (a)'s own answer (81) or working.
-- (c) self-contained: P, Q and R's rules are all restated in the shared
-- stem; no dependency on (a) or (b)'s own answers.
--
-- ============================================================
-- DIFFICULTY, MARKING, MARKS CONTRACT
-- ============================================================
-- (a) medium -- one linear substitution-and-simplification step.
-- (b) medium -- a division-based substitution, a materially different
-- operation from (a), not a harder or easier restatement of it.
-- (c) hard -- expanding a product of two expressions (one containing the
-- variable being multiplied by the variable itself), the deepest
-- algebraic simplification of the three subparts.
-- Disclosed honestly: this migration does not add any further easy-tier
-- row (Decision 195/196's own disclosed difficulty-tier imbalance was
-- already partly addressed by mock-mr04-campingsale's own easy-tier
-- subpart (a), migration 134) -- every difficulty label above reflects
-- the genuine reasoning burden actually required, not estate-statistic
-- padding.
-- 1 mark per subpart, 3 rows, 3 marks total (reduced from the original
-- 4 rows/4 marks per Decision 200/201's remediation -- four marks were
-- never a structural requirement). No row's marks value exceeds 1. No
-- partial-credit mechanism invoked or implied. marking_mode is
-- 'deterministic' throughout -- every answer is a single exact-match
-- integer string.
--
-- ============================================================
-- ANTI-MEMORISATION -- FUTURE VARIANT DIMENSIONS (not authored here)
-- ============================================================
-- At least two independent dimensions along which future instances of
-- this archetype could vary without repeating this exact family: (1) the
-- shared numeric constant linking the additive offset and multiplicative
-- factor (this instance uses 9 for both, matching the real primary-
-- source instance's own use of a single shared constant -- 3 -- for both
-- roles; a future variant could use two DIFFERENT numbers for the offset
-- and multiplier instead, which would change subpart (c)'s own
-- cancellation behaviour and require a genuinely different combination
-- to reach a constant result); (2) the specific linear/division/product
-- combinations asked for in (a)-(c) (this instance's three combinations
-- are one evidenced selection; other constant-yielding combinations of
-- the same three quantities exist and could form a distinct future
-- instance).
--
-- ============================================================
-- DIAGRAM/GEOMETRY BOUNDARY PRESERVED
-- ============================================================
-- This family is text-only abstract-algebra content; it requires, uses,
-- and implies no diagram, chart, or geometry rendering capability of any
-- kind. The absence of diagram/geometry-rendering capability remains a
-- disclosed, unresolved structural gap (Decision 189/191/195/198), not
-- something this migration claims to have closed or worked around.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch any existing row, family, or migration (088-136). Does
-- not alter any of the 55 existing mock_eligible rows or any of the 19
-- existing independently_validated reserve rows (including
-- mock-mr06-linkedvalues itself, which remains completely untouched).
-- Does not set eligibility_status to anything other than
-- 'authentic_assessment_candidate'. Does not create or touch any
-- ali_family_review row (migration 138 handles the pending-review
-- placeholder separately). Does not create, modify, or activate any
-- ali_mock_form row. Does not touch English or Writing content. Does not
-- author a second family. Does not build or imply any diagram/geometry
-- rendering capability. Does not reproduce any CSSE past-paper question
-- wording, image, or exact numeric scenario. Does NOT author any
-- quadratic-equation, multiple-root, or root-rejection reasoning demand
-- (Decision 200/201's remediation).
--
-- FAIL-CLOSED / DUPLICATE-ID PROTECTION: the insert uses
-- `on conflict (id) do nothing`, matching every prior content migration
-- in this repository exactly -- if any of these 3 IDs already exist
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
('mock-mr06-numberpuzzle-01', 'maths', 'QT-MR-06', array['csse'], 'medium', 'short-answer', 100,
 $json${"id":"mock-mr06-numberpuzzle-01","marks":1,"skill":"algebra","answer":"81","question":"A number puzzle uses a hidden positive whole number, n. Three other values are defined by these rules: P = n + 9, Q = 9 x n, and R = n x n. What is the value of 9P − Q?","workingSteps":["9P = 9 x (n + 9) = 9n + 81","9P − Q = (9n + 81) − 9n","The n terms cancel, leaving 81"],"sharedStem":"A number puzzle uses a hidden positive whole number, n. Three other values are defined by these rules: P = n + 9, Q = 9 x n, and R = n x n."}$json$,
 'Mathematics Structural Capacity, Authoring Increment 005 (Decision 198/199, REMEDIATED per Decision 200/201). Subpart (a) — QT-MR-06 (Multiple-Relation/algebraic reasoning), family mock-mr06-numberpuzzle. A genuinely different reasoning graph from mock-mr06-linkedvalues: no numeric total is stated, and n never needs to be found for this subpart — a linear-combination substitution that algebraically cancels the unstated variable. SOURCE-CONTAINS: evidenced by 2023 Q18 (independently re-verified this session against the real paper and mark scheme: A=B+3, C=3B, 3A−C=9). Answer independently recomputed via two methods (symbolic simplification, and numeric substitution at n=4 and n=10): 81.', 2, 'mock-mr06-numberpuzzle-01',
 'mock-mr06-numberpuzzle', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Treating P and Q as independent unrelated unknowns and attempting to guess numeric values for them, instead of substituting the stated rules in terms of n and simplifying algebraically.',
 'FAR_TRANSFER', 'mock-mr06-numberpuzzle', 1, '(a)', 'deterministic'),

('mock-mr06-numberpuzzle-02', 'maths', 'QT-MR-06', array['csse'], 'medium', 'short-answer', 100,
 $json${"id":"mock-mr06-numberpuzzle-02","marks":1,"skill":"algebra","answer":"9","question":"A number puzzle uses a hidden positive whole number, n. Three other values are defined by these rules: P = n + 9, Q = 9 x n, and R = n x n. What is the value of Q ÷ (P − 9)?","workingSteps":["P − 9 = (n + 9) − 9 = n","Q ÷ (P − 9) = (9 x n) ÷ n","The n terms cancel, leaving 9"],"sharedStem":"A number puzzle uses a hidden positive whole number, n. Three other values are defined by these rules: P = n + 9, Q = 9 x n, and R = n x n."}$json$,
 'Mathematics Structural Capacity, Authoring Increment 005 (Decision 198/199, REMEDIATED per Decision 200/201). Subpart (b) — QT-MR-06, family mock-mr06-numberpuzzle. Reuses the SAME shared rules as subpart (a) but requires a materially different operation: recognising that (P − 9) is algebraically identical to n BEFORE dividing, rather than a linear combination — a genuinely different reasoning demand from (a), not a relabelling of it. SOURCE-CONTAINS: evidenced by 2023 Q18(ii) (independently re-verified: C ÷ (A−3) = 3). Answer independently recomputed via two methods (symbolic simplification, and numeric substitution at n=4 and n=10): 9.', 2, 'mock-mr06-numberpuzzle-02',
 'mock-mr06-numberpuzzle', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Dividing Q by P directly (ignoring the "− 9" term) instead of first simplifying P − 9 to n.',
 'FAR_TRANSFER', 'mock-mr06-numberpuzzle', 2, '(b)', 'deterministic'),

('mock-mr06-numberpuzzle-03', 'maths', 'QT-MR-06', array['csse'], 'hard', 'short-answer', 130,
 $json${"id":"mock-mr06-numberpuzzle-03","marks":1,"skill":"algebra","answer":"0","question":"A number puzzle uses a hidden positive whole number, n. Three other values are defined by these rules: P = n + 9, Q = 9 x n, and R = n x n. What is the value of (P × n) − Q − R?","workingSteps":["P x n = (n + 9) x n = n x n + 9n","(P x n) − Q − R = (n x n + 9n) − 9n − (n x n)","Both the n x n term and the 9n term cancel, leaving 0"],"sharedStem":"A number puzzle uses a hidden positive whole number, n. Three other values are defined by these rules: P = n + 9, Q = 9 x n, and R = n x n."}$json$,
 'Mathematics Structural Capacity, Authoring Increment 005 (Decision 198/199, REMEDIATED per Decision 200/201). Subpart (c) — QT-MR-06, family mock-mr06-numberpuzzle. Restates the same three rules as (a)/(b), independent of the learner''s own working there. The deepest reasoning demand of the three subparts: requires expanding a PRODUCT (P multiplied by n itself, producing an n x n term) then combining with Q and R so that both the squared term and the linear term cancel — a materially bigger algebraic manipulation than (a)/(b). SOURCE-CONTAINS: evidenced by 2023 Q18(iii) (independently re-verified: AB−C−D=0). Answer independently recomputed via two methods (symbolic expansion, and numeric substitution at n=4 and n=10): 0. This is the final subpart of this family: the original fourth subpart (requiring a quadratic-equation reverse-reasoning demand with no primary-source support) was removed per Decision 200/201''s educational evidence audit — see this migration''s own header for the full remediation record.',
 2, 'mock-mr06-numberpuzzle-03',
 'mock-mr06-numberpuzzle', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Multiplying P by n but forgetting to expand the bracket fully (e.g. treating P x n as n x n + 9 instead of n x n + 9n), or subtracting only one of Q/R instead of both.',
 'FAR_TRANSFER', 'mock-mr06-numberpuzzle', 3, '(c)', 'deterministic')
on conflict (id) do nothing;

commit;
