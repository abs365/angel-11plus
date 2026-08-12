# Release 1 Implementation Blueprint — Question Bank and Assessment Authenticity

**Programme:** Angel Assessment Transformation Execution Programme — Release 1
**Status:** DESIGN ONLY. No educational content was rewritten, created, or estimated in producing this document. No code, Assessment Brain, or Educational Intelligence file was changed.
**Prepared:** 2026-08-05
**Consumes, does not repeat:** the full Assessment Excellence Programme (Phases 1-5), `ASSESSMENT_TRANSFORMATION_BLUEPRINT_V1.md`, `ASSESSMENT_TRANSFORMATION_IMPLEMENTATION_BLUEPRINT_V1.md`, `ASSESSMENT_TRANSFORMATION_IMPLEMENTATION_ROADMAP_V1.md`, the Release 0 reports, and the Decision/Conflict Registers (as updated by Release 0). This document's own detailed content-pool analysis lives in the companion `RELEASE_1_GAP_ANALYSIS.md` and is cross-referenced, not repeated, below.

---

## 1. Mission

Design exactly how Question Bank Transformation and Assessment Authenticity (Domains 1 and 2 of `ASSESSMENT_TRANSFORMATION_IMPLEMENTATION_BLUEPRINT_V1.md`; Wave 1 of the Roadmap) will be executed, without yet changing any educational content, rewriting any question, or touching Assessment Brain V1 or Educational Intelligence Engine V1. This document becomes the governing implementation reference for whichever future, separately-authorised work package actually authors content and rebuilds session timing.

## 1.1 Permanent Assessment Authenticity Principle

**Added 2026-08-10, per explicit Founder Educational Authenticity Clarification — governs Release 1 and all subsequent CSSE assessment work, not just this document's original scope.**

> Angel assessment content must be traceably informed by authentic examination evidence. Original Angel questions should reproduce the underlying skills, reasoning demands, structural characteristics and examination behaviours evidenced by the real assessment without copying protected examination content.

**Explicit correction to this Blueprint's own §11, recorded here rather than silently rewritten below:** past CSSE examination papers (KA-001) are not merely a source for assigning Easy/Medium/Hard difficulty labels. Their primary purpose is to establish what CSSE assesses, how it assesses it, what reasoning children must perform, how questions are structured, how challenge progresses through a paper, and what examination behaviours a child must practise — difficulty calibration is one downstream component of that, not the objective itself. Any future authoring work under this Blueprint must be evaluated against this fuller similarity standard (Question Type, assessed skill, competency, reasoning process, step count, wording, information density, distractor design, response format, complexity, reading burden, cognitive demand, section context, marks/working expectations, time pressure, progression of challenge) — not difficulty-tier matching alone.

**Role boundary, stated explicitly per the same Founder instruction:** existing code, existing database fields, and existing Angel-authored questions do not determine assessment design. The approved evidence programme and Founder educational objective do. Where implementation conflicts with authentic educational evidence, that conflict is reported, not silently resolved by adapting the requirement to fit existing software.

## 2. Educational Objectives

1. Close the Question Type coverage gap identified in `RELEASE_1_GAP_ANALYSIS.md` (15 of 27 Question Types have zero content; a further 3 have only a self-disclosed, approximate-fit item) with genuine, non-forced, exam-representative depth.
2. Restore CSSE's real timing structure — English as a single 70-minute sitting internally sectioned per Assessment Brain V1 §2, Mathematics as a separate 60-minute paper — replacing the current single, undivided ~46-minute combined countdown.
3. Do both without introducing a single forced-fit item of the kind already found in 6 of the current pool's 18 items (`RELEASE_1_GAP_ANALYSIS.md` §4) — authenticity is the explicit standard, not merely "any content."
4. Leave every enterprise platform capability this content and timing model sits on top of — Adaptive Selection, the Evidence Pipeline, the Mock Attempt Ledger, the Competency Engine, the Learning Graph — untouched and fully reusable once real content exists to exercise them.

## 3. Scope

- Design (not build) an authoring **sequencing and prioritisation strategy** across all 27 Question Types, informed directly by Assessment Brain V1's own EMC/Confidence ratings (§9) and by the Gap Analysis's finding that current coverage tracked convenience, not evidentiary priority.
- Design a **"no forced fit" authoring discipline**, formalising the judgement the original migration already exercised informally and inconsistently (12 of 18 items clean, 6 forced or approximate).
- Design a **difficulty calibration strategy**, addressing the current pool's two-coexisting-vocabularies inconsistency (`content_difficulty` enum vs. an internal `"difficulty"` JSON field using a different scale — see §11).
- Design a **timing authenticity strategy** — the session/paper model, not the specific engineering implementation.
- Name **writing-assessment dependencies** this Release's strategy touches but does not resolve (the WC-02 Correction Log, owned by Assessment Brain V1's own governance).
- Define the **educational validation strategy** every future authored item (and, retroactively, every existing item) must pass.
- Define **Founder validation gates** — specific points where authoring or timing work may not proceed without an explicit Founder decision.

## 4. Out of Scope

- No question is rewritten, authored, or created by this document or this phase.
- No content volume ("how many questions per Question Type") is estimated — that is an authoring-execution decision for a future, separately-authorised phase.
- No change to Assessment Brain V1, Learning Engine V1, or Educational Intelligence Engine V1 — all three remain FROZEN.
- No change to production code, the mock-exam page's actual session logic, or any migration — this is a design document only, unlike Release 0, which did include narrowly-scoped real changes.
- Writing Assessment Excellence's own scope (the WC-02 rubric-vs-marks gap, the grading-model review) is a separate Roadmap wave (Wave 3) — this Release names the dependency (§13) but does not perform that work.
- Admissions Intelligence Activation, Parent Experience Enhancement, and Commercial Readiness (separate Domains/Waves) are not addressed here.

## 5. Existing Capabilities Reused

Per Programme 001's Preservation Commitment, every item below is reused unchanged, not redesigned:

- `ali_question_bank` schema and the `skill` field's `QT-*` tagging convention (`lib/ali/questionBank.ts`, `fetchQuestionBank()`).
- The Assessment Coverage panel (`EvidenceProfile.tsx`) that already honestly reports per-Question-Type content status.
- The one-pool-feeds-every-surface content-routing architecture (Practice, Timed Practice, Diagnostic Assessment, Standard Mock, Adaptive Mock all draw from the same tagged content).
- `buildAdaptivePaper()` and its diagnostic-weighted selection, cooldown/non-repeat, and subject-floor logic (`lib/learningEngine/adaptiveMockPaperBuilder.ts`) — unaffected by content depth changes; it will simply have more real content to select from.
- The evidence pipeline (`recordPresentation`, `recordOutcome`, `processEvidenceForCompetency`, `recordReadinessSnapshot`) and the Mock Attempt Ledger (`lib/mockProgress.ts`).
- The existing exam-mode rendering shell (`ExamEnglish`/`ExamMaths`/`ExamWriting`) and the real, already-enforced timer mechanism — the timing *strategy* changes how the budget is computed and divided, not the underlying enforcement mechanism.
- The existing `checkMathsAnswer`/`scoreEnglishAnswer`/LLM writing-grading functions (`lib/learningEngine/practiceContent.ts`) as the starting point for any content authored under this strategy.

## 6. Current Question-Bank Assessment

Full detail in `RELEASE_1_GAP_ANALYSIS.md`. Headline findings restated here for context, not repeated in depth: 18 total items across 12 of 27 Question Types; 12 of the 18 items are cleanly tagged, 6 carry a self-disclosed forced-fit or format weakness; 15 Question Types have zero content, of which 11 have no stated reason and 6 of those 11 are rated HIGH/EMC-4 by Assessment Brain V1 — i.e., among the exam model's best-evidenced components; zero items of any kind have been through subject-matter reviewer sign-off.

## 7. Authenticity Requirements

Derived directly from Assessment Brain V1 §2 (the only source of truth for what "authentic" means here — this Release does not invent a new definition):

- **Structural:** English as one 70-minute sitting (60 min + 10 min reading), internally divided into 3 separately-timed sections (Comprehension 30 min, Applied Reasoning 10 min, Continuous Writing 20 min); Mathematics as a separate 60-minute, 60-mark paper.
- **Content breadth:** genuine representation across all 27 Question Types the model defines, not merely "at least one item" — a Question Type with exactly 1 item cannot support a learner reaching Learning Engine V1's ET-3/ET-4 tiers for its competency (§10 below).
- **Marking convention:** Mathematics marking in the real exam is exact-match only, no partial/method credit (Assessment Brain V1 §2) — any future content or grading-model work should be checked against this, not assumed.
- **Difficulty range:** calibrated against real exam evidence (the 17 held CSSE papers, 2021-2023 Entry, under KA-001), not an internally-invented scale — see §11.
- **Writing realism:** both real Continuous Writing prompt sub-formats represented (QT-WC-01a Reflective/Discursive, QT-WC-01b Picture-Stimulus Narrative) — currently only the former exists, and only as an approximate fit.

## 8. Official Evidence Dependencies

- Assessment Brain V1 §2, §3, §9 (structure, competencies, Question Type Cross Reference Matrix) — the single governing source for every authenticity requirement above. FROZEN; consulted, not amended, by this Release.
- The 17 KA-001 assets (`knowledge/csse/assets/`) — the primary-source basis for difficulty calibration (§11).
- **AEP4-C04 (Applied Reasoning currency)** — a hard dependency specifically for QT-AR-01 authoring. Per Release 0's narrowed finding, this remains open and requires a document type not yet held (a 2024+ English exam paper). AR-01 content should not be authored at volume ahead of this resolving.
- **The Assessment Brain V1 Correction Log process for WC-02** — a dependency for any future writing-*quality*-assessment conclusion, not for QT-WC-01b content-breadth authoring specifically (WC-02 has no mapped Question Type at all; QT-WC-01b maps to WC-01). See §13.
- `KNOWLEDGE_GOVERNANCE.md` §11 (Release 0's addition) — not directly applicable to exam-content evidence (it is scoped to admissions data), but its "no forced fit / disclose don't force" spirit is the same discipline this Release's authoring strategy formalises for content.

## 9. Question Taxonomy Strategy

**Principle: sequence by Assessment Brain V1's own evidentiary confidence, not by which existing Angel content happens to fit.** Concretely:

1. **Tier 1 (highest priority):** the 6 unattempted, no-stated-reason gaps rated HIGH/EMC-4 (`RELEASE_1_GAP_ANALYSIS.md` §2) — QT-RC-01, QT-RC-02, QT-MR-03, QT-MR-06, QT-MR-09, QT-MR-12. These are simultaneously the best-evidenced and entirely-unaddressed part of the model.
2. **Tier 2:** the remaining unattempted MEDIUM/LOW-confidence gaps (QT-RC-04, QT-RC-07, QT-RC-09, QT-MR-02, QT-MR-08) and QT-AR-01 (gated separately by §8's Applied Reasoning dependency).
3. **Tier 3:** remediation of the 6 already-flagged weak items (§4 of the Gap Analysis) — replacing forced fits with genuine, non-forced content for the same Question Type, not simply adding volume beside the weak item.
4. **Tier 4 (lowest priority, structurally hard):** QT-RC-06, QT-WC-01b, QT-MR-14 — each requires either a genuinely new content format (picture-stimulus writing) or accepting that a "cross-cutting" Question Type (QT-MR-14) may never have a clean standalone item, per Assessment Brain V1's own characterisation.
5. **"No forced fit" rule, formalised:** no future item may be tagged to a Question Type on the strength of "closest available match" alone. If no genuine fit exists, the correct action is to author new content specifically for that Question Type, or to record the gap as still open — exactly the discipline the original migration applied inconsistently (6 of 18 items) and this strategy makes universal.

## 10. Competency Coverage Strategy

A finding not previously stated anywhere in this programme: **most currently-covered competencies have content in only one mapped Question Type format.** Per Learning Engine V1 §3.3, a competency's Evidence Tier is capped at ET-2 ("Emerging... confined to a single mapped Question Type/format") until a learner has demonstrated a consistent pattern across *more than one* mapped format — ET-3/ET-4 structurally require multi-format evidence. Concretely: RC-02 currently has content only via QT-RC-05 and QT-RC-10 (2 formats, actually reasonable); RC-01 only via QT-RC-08 (1 format — QT-RC-01, QT-RC-02, QT-RC-07, QT-RC-09 all missing); MR-04 only via QT-MR-04, QT-MR-10, QT-MR-13 (3 formats — actually the best-covered competency in the whole pool); MR-01 only via QT-MR-01 (1 format, despite MR-01 mapping to 4 different Question Types per Assessment Brain V1's own matrix — QT-MR-01, QT-MR-02, QT-MR-03, QT-MR-09, QT-MR-12 all map to MR-01, and only QT-MR-01 currently has content).

**Strategy: authoring priority should be evaluated at the competency level, not only the Question-Type level.** A competency with 4-5 mapped Question Types and content in only 1 (MR-01 is the clearest case) is a structurally worse position than the raw "12 of 27 types covered" headline suggests, because no learner can currently reach a well-evidenced status for MR-01 regardless of how many MR-01-mapped items they attempt, since they're all the same format.

## 11. Difficulty Calibration Strategy

**A real inconsistency found in the current pool, not previously documented:** two different difficulty vocabularies coexist in the same table. The `content_difficulty` enum column uses `medium`/`hard`/`challenge` (English and some Maths rows); several Maths rows' internal JSON also carries a separate `"difficulty"` field using `year5-core`/`year5-advanced`/`year6-exam`. These are not obviously mapped to each other, and neither is calibrated against real exam evidence — both appear to be internally-invented scales.

**Strategy:** any future content-authoring work should calibrate difficulty directly against the 17 held CSSE papers (KA-001, 2021-2023 Entry) — using each paper's own position/mark-value/mark-scheme-implied difficulty as the reference, not an invented label. Resolving the two-vocabulary inconsistency itself (which scale, if either, becomes canonical) is named here as a required pre-step, not solved by this document.

## 12. Timing Authenticity Strategy

Replace the current single, undivided countdown (sum of every selected question's `estimated_time_seconds` across all three subjects) with a **paper-and-section-budgeted model**: a Mathematics paper budgeted at a fixed 60 minutes, and an English paper budgeted at a fixed 70 minutes (60 + 10 reading) with 3 internal section budgets (Comprehension 30, Applied Reasoning 10, Continuous Writing 20) — matching Assessment Brain V1 §2 exactly. The existing per-question `estimated_time_seconds` field is reused as an input to *validate* that a section's selected content roughly fits its real-world budget, not discarded — but the top-level timer logic changes from "sum everything, one countdown" to "budget per paper/section, enforce each." This is a strategy-level description; the specific state-machine/engineering design is explicitly deferred to the future execution phase this Blueprint governs, per §4's Out of Scope.

## 13. Writing Assessment Dependencies

- **QT-WC-01b (Picture-Stimulus Narrative) content authoring** can proceed under this Release's "no forced fit" strategy independently — it is a WC-01 competency concern (breadth of format), not a WC-02 concern, and does not require the Correction Log to resolve first.
- **Any conclusion about writing-quality *assessment* (grading model adequacy, WC-02's rubric-vs-marks gap)** remains hard-gated on the Assessment Brain V1 Correction Log process for WC-02 — outside this Release's authority, per the Roadmap's Wave 3 placement. This Release's content-authoring strategy for Continuous Writing should proceed on the WC-01/QT-WC-01a/QT-WC-01b track without waiting for that Correction Log, but must not draw or imply any conclusion about WC-02 in doing so.

## 14. Educational Validation Strategy

Full detail in the companion `RELEASE_1_VALIDATION_STRATEGY.md`. Summary: every item — newly authored under this strategy **and** all 18 items already in the pool, none of which has ever been reviewed (`RELEASE_1_GAP_ANALYSIS.md` §5) — must pass a qualified educational reviewer's check against its Question Type's Measurement Purpose (Assessment Brain V1 §9/§4 source docs) before being counted as "authenticated." Self-certification by whoever authors an item is explicitly insufficient, matching the standard the original migration's own header already set but never had the capacity to complete.

## 15. Founder Validation Gates

Named decision points, each requiring explicit Founder approval before the named work proceeds — none is pre-approved by this Blueprint:

1. **Approval of the authoring sequence** (§9's 4-tier priority) before any content authoring begins.
2. **Approval of the "no forced fit" policy** as a binding rule for all future authoring, including whether the 6 existing weak items are remediated, retired, or left flagged.
3. **Approval to author AR-01/QT-AR-01 content specifically** — gated separately, contingent on AEP4-C04's resolution (an actual 2024+ exam paper), not assumed to follow automatically from general Release 1 approval.
4. **Approval of the difficulty-calibration source** (the 17 KA-001 papers as the reference standard) before it is adopted.
5. **Approval of the timing-strategy's paper/section-budget model** before any engineering design work begins on it (distinct from, and prior to, the actual timing-engine implementation, which is a further, later gate per the Roadmap's Wave 1→2 sequencing).

## 16. Production Readiness Criteria

**For this Blueprint itself** (not for shipped content, which remains a future phase's gate): this document is production-ready as a governing reference when the Founder confirms all 5 gates in §15 are understood and the sequencing in §9-§12 is accepted as the design basis for the next, separately-authorised execution phase. It does not itself certify any content or timing change ready for release — that remains gated by the Educational Validation Strategy (§14/companion document) and the Roadmap's own Wave 1 exit criteria, neither of which this document can satisfy on its own since no content has yet been authored.

---

*This Blueprint creates no implementation tasks, authors no content, and authorises no engineering work. It is the governing design reference for whichever future, separately-Founder-approved phase actually performs Question Bank Transformation and Assessment Authenticity.*
