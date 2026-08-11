# Founder Validation Assessment (CSSE) — Blueprint

**Programme:** Angel Assessment Transformation Execution Programme — Release 1
**Prepared:** 2026-08-10
**Status:** Implemented. Short and implementation-focused, per instruction.

---

## 1. What This Is

The first working, evidence-led slice of the transformed Angel CSSE experience — small enough to build and verify quickly, representative enough that the Founder can genuinely judge whether the new method is credible. Not the production Mock. Not a full paper. 11 original items: 5 English Reading Comprehension, 6 Mathematics.

## 2. Construction Order (assessment-level down, per instruction)

1. **Sections included:** English Reading Comprehension, Mathematics. Applied Reasoning excluded (Gate 3 remains deferred — no evidence gate silently resolved). Continuous Writing excluded — see §5.
2. **Question Type mixture, chosen for genuine variety and evidence-strength, not convenience:** English — QT-RC-01 (literal retrieval, EMC-4), QT-RC-02 (judgement+justification, EMC-4), QT-RC-05 (quotation+explanation, EMC-3), QT-RC-10 (effect-of-language, EMC-3), QT-RC-07 (comparative extraction, EMC-3). Mathematics — QT-MR-01 (arithmetic, EMC-4), QT-MR-03 (unit conversion, EMC-4), QT-MR-06 (algebra, EMC-4), QT-MR-07 (geometry, EMC-4), QT-MR-09 (data reading, EMC-4), QT-MR-12 (mean, EMC-4). All 11 types are individually specified in `RELEASE_1_CSSE_AUTHENTIC_QUESTION_SPECIFICATION.md` or directly grounded in AEP-004's evidence catalogue.
3. **Stimulus:** one original passage ("The Orchard," ~290 words, two named characters, narrative fiction) carries all 5 English items — matching the real CSSE convention that one passage anchors the whole Comprehension section (AEP-002 Obs. 2, Obs. 6).
4. **Progression:** English moves retrieval → judgement → evidence-linking → interpretation → comparison; Mathematics moves arithmetic → conversion → algebra → geometry → data → mean (forward-then-forward). Both orderings mirror the real papers' own easy-to-harder shape observed in `RELEASE_1_MULTI_YEAR_QUESTION_PATTERN_ANALYSIS.md` §1.
5. **Marks:** English 13 (1+3+3+2+4), Mathematics 8 (1+1+2+1+1+2). 21 total.
6. **Timing:** sum of each item's own `estimated_time_seconds` (455s English + 375s Mathematics ≈ 13.8 minutes). **Explicitly not a claim of real-paper time equivalence** — the real sections are 30 and 60 minutes respectively for far larger question counts; this is a proportionally scaled estimate for an 11-item slice, disclosed on the intro screen itself, not just in this document.
7. **Marking:** reuses the existing, already-proven `checkMathsAnswer`/`scoreEnglishAnswer` graders unchanged — no new scoring mechanism, satisfying the "no ambiguous marking rule" quality-floor requirement.
8. **Evidence collection:** every item wired through the real evidence pipeline (`recordPresentation`, `recordOutcome`, `processEvidenceForCompetency`, `recordReadinessSnapshot`) and the real Mock Attempt Ledger (`saveMockResult`) — the same functions the production Mock calls, unmodified.

## 3. Platform Reuse (§11)

Reused unchanged: `fetchQuestionBank`, the evidence pipeline functions above, `ensureProfile`, `completeLesson`/`recordSkillResult` (legacy bridge), `checkMathsAnswer`/`scoreEnglishAnswer`, `PageLayout`/`InfoCard` UI components. Not rebuilt: any of the above. New: one route (`app/learning-intelligence/founder-validation/csse/page.tsx`), one content migration (`021_founder_validation_csse_assessment.sql`), one evidence-metadata module (`data/founderValidation/csseFounderValidationEvidence.ts`) for the Founder Evidence View. No Assessment Brain, Learning Engine, or Educational Intelligence file touched.

## 4. Isolation From Production

The only mechanism keeping this content out of the real Mock is `pathway = ['csse-founder-validation']`, distinct from the real `'csse'` pathway `app/learning-intelligence/mock-exam/page.tsx` queries. See `REPOSITORY_IMPACT_ASSESSMENT.md` for the full analysis of why this holds.

## 5. Writing — Explicit Exclusion Rationale

Continuous Writing is not included in this slice. Two disclosed reasons: (a) `AEP-002` Observation 10/13 leaves the rubric-vs-numeric-marks relationship for Continuous Writing genuinely unresolved — building a credible marking rule for it would either fabricate a resolution or reuse the same unresolved gap uncritically; (b) Gate 1's own authoring priority sequences Writing outside the Tier-1 evidence-ready set. This is a "not yet appropriate" judgement, not a permanent exclusion, matching the instruction's own permissive framing in §5.

## 6. Difficulty and Timing Disclosure

Every item's `content_difficulty` is an educational judgement (per Increment 1's established discipline), not empirical CSSE calibration — no facility-rate data exists anywhere in this project. Timing is evidence-informed per-item estimation, not measured. Both disclosed explicitly on the assessment's own intro screen, not only in this document.
