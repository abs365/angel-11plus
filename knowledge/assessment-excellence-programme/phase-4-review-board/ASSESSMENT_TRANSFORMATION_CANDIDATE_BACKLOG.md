# Assessment Transformation Candidate Backlog

**Programme:** Angel 11+ Assessment Excellence Programme — Phase 4 (Assessment Excellence Review Board)
**Status:** PROVISIONAL ONLY. Nothing in this backlog is authorised, scheduled, or implemented. Every item requires an explicit Founder decision before any work begins — inclusion here is not approval.
**Prepared:** 2026-08-05
**Priority Model applied to sequencing:** (1) Child preparation safety, (2) Assessment authenticity, (3) Educational validity, (4) Parent trust and clarity, (5) Admissions accuracy, (6) Architectural integrity, (7) Commercial value, (8) Engineering convenience. Engineering investment already made does not determine sequence — several items below touch recently-built or heavily-engineered code precisely because the evidence, not the investment, decides.

---

## A. Assessment Authenticity

| ID | Item | Evidence Basis | Educational Objective | Affected Capability | Risk if Deferred | Complexity | Dependencies | Sequence | Founder Decision Required |
|---|---|---|---|---|---|---|---|---|---|
| CB-01 | Rebuild mock timing/paper-separation to reflect real CSSE structure (separate English/Maths papers; English internally sectioned per Assessment Brain V1 §2) | AEP4-D17; `ASSESSMENT_BRAIN_V1.md` §2; direct code inspection of `mock-exam/page.tsx` | Restore genuine exam-condition pacing practice | Assessment Engine | Critical — children currently practise under a structurally incorrect timing model | High | CB-03 (content depth) must land alongside, not before or after in isolation | 1 (highest — Priority Model tier 2) | Yes |
| CB-02 | Resolve Applied Reasoning currency for 2025-2027 cohorts (read the already-acquired 2025/2026 Information Guides' paper-structure sections) | AEP4-D05, AEP4-C04 | Confirm whether AR-01/QT-AR-01 content should continue, be deprioritised, or be flagged uncertain | Competency Engine, Assessment Engine | High — teaching or omitting a skill incorrectly both carry real cost | Low (2 documents already held, unread) | None | 0 (do first — cheapest, unblocks confidence in CB-01/CB-03 sequencing for Applied Reasoning specifically) | Yes |

## B. Content Excellence

| ID | Item | Evidence Basis | Educational Objective | Affected Capability | Risk if Deferred | Complexity | Dependencies | Sequence | Founder Decision Required |
|---|---|---|---|---|---|---|---|---|---|
| CB-03 | Author real content depth across all 27 official Question Types (15 currently have zero content; most of the 12 that have any hold exactly 1 item) | AEP4-D19; migration `013_wave2_illustrative_practice_content.sql`; `ADAPTIVE_MOCK_INTELLIGENCE_SPECIFICATION_V1.md` §4, §6 | Give the Competency Engine's model real content to actually assess against | Assessment Engine, Competency Engine | Critical — this is the root cause of the Founder Field Evidence (5-min, 100% mock) | Very High (genuine content-authoring programme, not a patch) | Educational review capacity; Assessment Brain V1's Measurement Purpose definitions per Question Type | 1 (parallel with CB-01, both required before CB-05 can be reversed) | Yes |
| CB-04 | Sequence content authoring by Assessment Brain V1's own EMC rating — do not over-invest in EMC-1/EMC-2 competencies (RC-03, RC-04, MR-05, WC-02, AR-01 concrete) relative to well-evidenced EMC-4 ones without separate justification | AEP4-D19 Conditions; `ASSESSMENT_BRAIN_V1.md` §7 | Avoid building confident-feeling content on the programme's own weakest evidence | Competency Engine | Medium — misallocated authoring effort | Low (a sequencing decision, not new work) | CB-03 | Concurrent with CB-03 | Yes |

## C. Mock Transformation

| ID | Item | Evidence Basis | Educational Objective | Affected Capability | Risk if Deferred | Complexity | Dependencies | Sequence | Founder Decision Required |
|---|---|---|---|---|---|---|---|---|---|
| CB-05 | Stop presenting the current Standard/Adaptive Mock as a representative "CSSE mock exam" until CB-01 and CB-03 land (interim relabelling as "practice," or gating, is itself an implementation decision requiring its own Founder authorisation — not assumed here) | AEP4-D18 — Founder Field Evidence, independently corroborated by direct code inspection | Prevent false confidence from a content-thin, structurally-non-representative assessment | Assessment Engine | Critical — this is the single highest-risk item in the entire register (child-preparation-safety tier 1) | Low to Medium (a presentation/gating decision, not a rebuild) | None — can proceed independently and immediately once authorised | 0 (candidate for fastest action, ahead of the slower CB-01/CB-03 rebuild) | Yes |
| CB-06 | Fix the missing `recordReadinessSnapshot()` call on the CSSE Mock Exam | AEP4-D21; `ADAPTIVE_MOCK_INTELLIGENCE_SPECIFICATION_V1.md` §5 | Restore Readiness-model completeness for learners whose only evidence source has been mocks | Assessment Engine, Learning Graph | Low-Medium — silent under-reporting, not visibly wrong | Very Low (one-line, already-specified fix) | None | Any time, low-risk, can ride with CB-01 | Yes (routine, but still Founder-gated per governance) |
| CB-07 | Resolve `ADAPTIVE_MOCK_INTELLIGENCE_SPECIFICATION_V1.md` §8's own open scoping decision (new route vs. mode-toggle vs. replacement for the fixed exam) and §6.1's coverage-gate minimum, before any adaptive-mock work resumes | `ADAPTIVE_MOCK_INTELLIGENCE_SPECIFICATION_V1.md` §8, §11 (a pre-existing open item, not created by this Review Board) | Give the already-specified Adaptive Mock Intelligence layer a clear integration point | Assessment Engine | Medium — blocks Sprint 2's own stated rollout plan | Low (a decision, not new engineering) | CB-03 (coverage-gate minimum is meaningless while coverage is this thin) | After CB-03 begins showing real progress | Yes |

## D. Writing Excellence

| ID | Item | Evidence Basis | Educational Objective | Affected Capability | Risk if Deferred | Complexity | Dependencies | Sequence | Founder Decision Required |
|---|---|---|---|---|---|---|---|---|---|
| CB-08 | Open a formal Correction Log review of WC-02's rubric-vs-marks gap (Assessment Brain V1 Observation 10, narrowed but not resolved by Observation 13) | AEP4-D04; `ASSESSMENT_BRAIN_V1.md` §3, §8 | Strengthen the weakest-evidenced competency in the entire model before building more writing content on top of it | Competency Engine (FROZEN — requires the document's own governance process, not a silent edit) | Medium — writing-quality assessment rests on genuinely thin evidence | Medium (requires re-engaging with 3 already-held CSSE assets, not new acquisition) | None | Can proceed independently of CB-01/03 | Yes — and must follow Assessment Brain V1's own Correction Log discipline specifically, not a routine edit |
| CB-09 | Review whether current writing auto-grading (LLM `overallScore` threshold + keyword-overlap heuristics) is adequate given WC-02's unresolved rubric gap | Mock investigation finding (this Review Board, direct code inspection: `practice/[area]` `WRITING_CORRECTNESS_THRESHOLD = 70`, `/api/writing-feedback`) | Ensure automated writing scores are not overclaiming precision the underlying competency model cannot support | Assessment Engine | Medium | Medium-High (grading-model review, possibly redesign) | CB-08 (the underlying rubric gap should inform, not follow, this review) | After CB-08 | Yes |

## E. Admissions Intelligence

| ID | Item | Evidence Basis | Educational Objective | Affected Capability | Risk if Deferred | Complexity | Dependencies | Sequence | Founder Decision Required |
|---|---|---|---|---|---|---|---|---|---|
| CB-10 | Strengthen the 303-floor parent-facing copy with real per-school 2023-entry range context (303-366), preserving "beside, never blended, never a prediction" | AEP4-D07 (Mandatory Topic A) | Prevent a parent from misreading 303 as representative of a typical cutoff | Admissions Intelligence Engine | High — active parent-misunderstanding risk today | Low (content/copy change, no new calculation) | None | Early — low complexity, high trust value | Yes |
| CB-11 | Populate the `school` table (PAN, priority-area type-discriminated definition, oversubscription structure) for all 7 named schools, citing every row to its `AEP2-###` source | AEP4-D08 (Mandatory Topic B) | Answer real, evidenced parent questions the design document itself named as its populate-trigger | Admissions Intelligence Engine, Parent Guidance Engine | High — the evidentiary precondition Angel's own design set has been met and sits unused | High (genuine data-modelling + parent-facing design work) | AEP4-C01/C02 resolution (CB-21) for WHSG/SHSG specifically; CB-19 (governance strengthening) recommended first | After CB-19 | Yes |
| CB-12 | Do not populate `school_admission_threshold` (score cutoffs) until the score-scale non-comparability problem is either resolved or explicitly, permanently disclosed | AEP4-D09 | Prevent a parent from reading a real historical cutoff beside their own child's non-comparable mock score as an implicit prediction | Admissions Intelligence Engine | High if built carelessly; Low if left exactly as-is | High (may be unsolvable without CSSE's own standardisation formula) | Wellbeing-protection review (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` Principle 8) | Not before CB-11 is validated in production | Yes |
| CB-13 | Decide CSSE consortium scope (7 vs. 10 schools) and, if the 3 additional schools are in scope, commission a Phase-2-style acquisition pass for them | AEP4-D16, AEP4-C05 (Mandatory Topic G) | Ensure any future "CSSE Consortium" claim is accurate | Knowledge Engine | Medium — only matters if Angel ever claims consortium-wide completeness | Low (a scope decision) to High (if acquisition is commissioned) | None for the decision itself | Early — cheap to decide now even if acquisition is deferred | Yes |

## F. Parent Guidance

| ID | Item | Evidence Basis | Educational Objective | Affected Capability | Risk if Deferred | Complexity | Dependencies | Sequence | Founder Decision Required |
|---|---|---|---|---|---|---|---|---|---|
| CB-14 | Design a per-school parent-facing content surface (contingent entirely on CB-11 landing first) | AEP4-D11 | Give parents real, cited, per-school information where none currently exists | Parent Guidance Engine | Medium | Medium-High | CB-11 | After CB-11 | Yes |
| CB-15 | Review all admissions-related parent copy (existing and any produced by CB-10/CB-14) against `LEARNING_ENGINE_V1.md` §8's suitable/not-suitable list and the Educational Safety Principle | AEP4-D07, AEP4-D11; `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §3 | Guarantee no admissions content ever drifts into prediction, peer comparison, or anxiety-inducing framing | Parent Guidance Engine, Admissions Intelligence Engine | High if skipped — this is the exact failure mode the whole Admissions Intelligence design exists to prevent | Low (a review process, not new content) | CB-10 and/or CB-14 must exist first to review | Concurrent with CB-10/CB-14, before either ships | Yes |

## G. Recommendation Quality

| ID | Item | Evidence Basis | Educational Objective | Affected Capability | Risk if Deferred | Complexity | Dependencies | Sequence | Founder Decision Required |
|---|---|---|---|---|---|---|---|---|---|
| CB-16 | Implement the Review recommendation category, now confirmed unblocked (`ali_durable_mastery`/`ali_educational_audit`, migration 010, already live) | `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §7 — "no longer structurally unbuildable — only unimplemented" | Keep prior Demonstrated evidence current over time, closing a gap Learning Engine V1 itself flagged as open | Learning Graph | Medium — a real, named, previously-blocked capability sitting unbuilt | Medium (persistence exists; selection/scheduling logic does not) | CB-03 (more content makes Review meaningfully testable, though not strictly required) | Independent, can proceed any time | Yes |
| CB-17 | Build the deferred "Speed" dimension (`LEARNING_ENGINE_V1.md` §8.1 / `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §8.1) as a qualitative pace band, groundable in already-real `estimated_time_seconds` data | `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §8.1 — "proposed, not built" | Give recommendations a pacing dimension without inventing new scoring | Learning Graph, Recommendation Model | Low — a proposed enhancement, not a defect | Medium | None blocking | Low priority — defer until CB-01/CB-03/CB-05 land | Yes |

## H. Evidence and Validation

| ID | Item | Evidence Basis | Educational Objective | Affected Capability | Risk if Deferred | Complexity | Dependencies | Sequence | Founder Decision Required |
|---|---|---|---|---|---|---|---|---|---|
| CB-18 | Strengthen `KNOWLEDGE_GOVERNANCE.md` for admissions-data volatility: mandatory "evidence year" tag, annual re-verification cadence, formal "conflicting sources, unresolved" Review Status state | AEP4-D15 | Prevent a populated admissions fact from silently going stale or presenting an unresolved conflict as settled | Knowledge Engine | High — directly gates safe population of AEP4-D08/CB-11 | Medium (an addition, not a redesign; scoped to admissions data only) | None | **Before CB-11**, per AEP4-D15's acceptance evidence requirement | Yes |
| CB-19 | Attempt extraction of the 4 unread Standardisation Reports and the unread candidate-volume report (AEP2-068, AEP2-074) via a rendering-capable (OCR/PDF-to-image) environment | AEP4-D06, AEP4-C07 | Close a disclosed evidence gap in the standardisation-methodology and candidate-volume evidence base | Knowledge Engine | Low — no pending decision currently depends on this | Low-Medium (an environment/tooling question, not new field research) | None | Low priority, opportunistic | Yes |
| CB-20 | Commission a targeted follow-up acquisition (direct enquiry to WHSG, Southend-on-Sea City Council, and/or SHSG) to resolve AEP4-C01 and AEP4-C02 before CB-11 populates those two schools' PAN | AEP4-C01, AEP4-C02 | Resolve 2 live Level-1-vs-Level-1 conflicts before they are encoded into a parent-facing schema | Knowledge Engine, Admissions Intelligence Engine | High for these 2 schools specifically; no impact on the other 5 | Low (a targeted enquiry, not a full re-acquisition) | None | Before CB-11 populates WHSG/SHSG rows specifically (other 5 schools may proceed independently) | Yes |

## I. Platform Preservation

| ID | Item | Evidence Basis | Educational Objective | Affected Capability | Risk if Deferred | Complexity | Dependencies | Sequence | Founder Decision Required |
|---|---|---|---|---|---|---|---|---|---|
| CB-21 | Explicit confirmation that `ASSESSMENT_BRAIN_V1.md`, `LEARNING_ENGINE_V1.md`, and `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` remain FROZEN and untouched by any item in this backlog, including CB-01/CB-03/CB-08 | All three documents' own Freeze Declarations | Protect the programme's most rigorously-evidenced infrastructure from being silently eroded by well-intentioned transformation work | Competency Engine, Learning Graph | Low if respected; Critical if violated | N/A (a governance confirmation, not engineering work) | None | Standing constraint on every other item in this backlog | Not a decision — a standing rule this backlog must not violate |
| CB-22 | Explicit confirmation that GL/CEM/ISEB pathway architecture (`lib/adaptiveMockBuilder.ts`, `lib/ali/selection.ts`, `app/mocks/adaptive/gl/page.tsx`) remains untouched by any CSSE-focused item above | `ADAPTIVE_MOCK_INTELLIGENCE_SPECIFICATION_V1.md` §2, §8 — explicit non-goals already documented | Prevent CSSE-specific transformation work from bleeding into architecturally-separate, deliberately-unreconciled pathway code | Assessment Engine (boundary preservation) | Low if respected; High (architectural integrity, Priority Model tier 6) if violated | N/A | None | Standing constraint | Not a decision — a standing rule |

---

## Sequencing Summary (Priority-Model-ordered, not backlog-ID-ordered)

1. **CB-05** (stop presenting the current mock as representative) and **CB-02** (Applied Reasoning currency check) — fastest, highest child-preparation-safety value, lowest complexity.
2. **CB-18** (governance strengthening) — before any admissions data is populated.
3. **CB-01 + CB-03** (mock timing rebuild + real content authoring) — the core, high-complexity assessment-authenticity work; must proceed together, not in isolation.
4. **CB-20** (resolve WHSG/SHSG conflicts) — before **CB-11** (populate `school` table) for those 2 schools specifically; the other 5 schools are not blocked.
5. **CB-10** (303-floor context) and **CB-13** (consortium scope decision) — cheap, can proceed any time, high trust/accuracy value.
6. **CB-06** (readiness-snapshot defect fix) — low-risk, can ride alongside CB-01.
7. **CB-08 → CB-09** (writing rubric correction, then grading review) — independent track.
8. **CB-11 → CB-14 → CB-15** (schema population → parent surface → safety review, in that order, never out of order).
9. **CB-16, CB-17, CB-19, CB-07, CB-12** — lower urgency, proceed opportunistically once the above are underway.
10. **CB-21, CB-22** — not scheduled work, standing constraints on everything above.

*This sequencing is a Review Board recommendation only. It is not a project plan, not a resourced schedule, and authorises nothing.*
