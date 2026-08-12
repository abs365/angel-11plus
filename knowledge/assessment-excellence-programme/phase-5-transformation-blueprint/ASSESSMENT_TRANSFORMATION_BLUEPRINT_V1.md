# Assessment Transformation Blueprint V1

**Programme:** Angel 11+ Assessment Excellence Programme — Phase 5 (Assessment Transformation Blueprint)
**Status:** DESIGN ONLY. No code, database, content, or architecture has been changed in producing this document. This is the governing document for a future Assessment Transformation Programme — it does not itself begin that programme.
**Prepared:** 2026-08-05

**A note on what this Blueprint converts.** Phase 4's `ASSESSMENT_EXCELLENCE_DECISION_REGISTER.md` contains 21 Review Board recommendations (AEP4-D01–D21), each with a **Founder Decision** field that was deliberately left blank, per the standing rule never to infer a Founder decision on the Founder's behalf. This Blueprint converts those recommendations into a structured transformation design — it treats the Review Board's provisional classifications (retain/strengthen/hide-pending-rebuild/gather-more-evidence) as its working design basis, exactly as Phase 5's mission instructs. It does not assert that any individual Decision Register line item has been formally approved; that record-of-approval remains the Decision Register's own field, to be completed separately. Nothing in this Blueprint authorises implementation of any item — per the programme covenant, Founder approval of each specific decision precedes any architectural change, and this document does not substitute for that approval.

---

## 1. Transformation Vision

Angel becomes an authentic, evidence-based CSSE preparation platform — one the Founder would confidently trust to prepare his own child for a competitive grammar or selective school entrance examination — built **on top of**, not instead of, the enterprise-grade Educational Intelligence infrastructure already designed and largely implemented across Assessment Brain V1, Learning Engine V1, and Educational Intelligence Engine V1.

The transformation this Blueprint designs is narrower and more precise than "rebuild the assessment system." Phase 4 found a well-evidenced, internally consistent competency model and a sound, honestly-designed evidence pipeline sitting on top of a genuinely thin, illustrative content pool (18 question rows across 12 of 27 official Question Types) delivered through a mock-exam timing model that does not reproduce CSSE's real paper-and-section structure. The vision is not to replace what works — it is to fill what is thin and correct what is structurally misaligned, while leaving the well-evidenced architecture untouched.

## 2. Transformation Objectives

1. **Close the content-depth gap.** Move from 12-of-27 Question Types with any content (mostly 1 item each) to genuine, exam-representative depth across all 27, sequenced by Assessment Brain V1's own evidence-maturity ratings (AEP4-D19).
2. **Restore authentic assessment structure.** Rebuild the mock's timing and paper-separation model to reflect CSSE's real two-paper, internally-sectioned English structure (AEP4-D17).
3. **Strengthen admissions-fact framing.** Add real per-school context to the CSSE 303 floor so it cannot be misread as representative (AEP4-D07).
4. **Populate per-school admissions evidence where the evidence genuinely supports it,** gated by resolution of the 2 live PAN conflicts and by strengthening the Knowledge Engine's governance model for admissions-specific volatility first (AEP4-D08, AEP4-D15, conflicts AEP4-C01/C02).
5. **Resolve the evidence gaps that currently block confident decisions** — Applied Reasoning currency, CSSE consortium scope — before any content or claim is built on an assumption in either direction (AEP4-D05, AEP4-D16).
6. **Preserve every enterprise platform capability already built**, measured explicitly against the Foundation-to-Preserve list in Section 10, throughout every workstream in Section 6.

## 3. Educational Design Principles

This Blueprint adopts, unchanged, every principle already governing the frozen architecture — it invents none of its own competing philosophy:

- **Evidence First, Competency Before Score, Confidence Is Never Binary, Traceability, Explainability, Absence of Evidence Is Not Evidence of Absence, No Invented Constructs** (Learning Engine V1 §2, restated as binding on this transformation).
- **The Educational Safety Principle** — no decision this transformation enables may increase a learner's anxiety in service of a short-term score or coverage gain, with greater force as exam proximity increases (Educational Intelligence Engine V1 §3).
- **Do not retain a weak assessment merely because it has already been engineered** (Phase 4 Quality Rule 10) — restated here as a permanent design principle, not a one-time review finding.
- **Platform capability and content readiness are not the same thing** (Phase 4 Quality Rule 8) — this Blueprint's single most load-bearing distinction, applied throughout Sections 4, 5, and the Special Review.
- **Never fabricate missing evidence.** Where a workstream depends on an unresolved conflict or an unread document, this Blueprint names the dependency rather than assuming an answer (see Section 7).
- **Preserve before rebuild.** Every workstream in Section 6 states explicitly what of the existing platform it reuses before it states what it changes.

## 4. Current Capability Assessment

Reorganising the Phase 4 Decision Register (AEP4-D01–D21) into the 5 required buckets. Where a bucket is empty, that is reported honestly — Phase 4 did not find grounds to recommend outright replacement or retirement of anything.

### Preserve
- Core two-paper/one-day/50-50-weighted/303-floor test architecture (AEP4-D01)
- Mathematics competency domains MR-01–06 (AEP4-D02)
- English Comprehension competencies RC-01–04 (AEP4-D03, RC-03/04's thinness inherited and disclosed, not newly created)
- Writing competency WC-01 (AEP4-D04's aligned half)
- Standardisation methodology disclosure (AEP4-D06)
- `consortium_threshold_fact` as a code constant (AEP4-D10)
- The entire non-predictive Admissions Readiness design — exclusion of offer prediction, peer comparison, school-choice guidance (AEP4-D12, AEP4-D13)
- Absence of competitiveness/demand-trend framing (AEP4-D14)
- Every item on the Foundation-to-Preserve list in Section 10, in full

### Strengthen
- CSSE 303 floor framing — add real per-school range context, preserving "beside, never blended" (AEP4-D07)
- `KNOWLEDGE_GOVERNANCE.md` — admissions-specific evidence-year tag, re-verification cadence, conflicting-sources state (AEP4-D15)
- WC-02's rubric-vs-marks gap — via Assessment Brain V1's own Correction Log process, not a silent edit (AEP4-D04's partially-aligned half)
- Applied Reasoning currency confirmation — read the already-acquired 2025/2026 Information Guides (AEP4-D05), pending evidence closure before this moves to Preserve or a content decision
- Missing `recordReadinessSnapshot()` call on the Mock Exam — a defect correction, low complexity (AEP4-D21)

### Replace
**None.** No capability reviewed in Phase 4 was classified for outright replacement. This is a genuine finding, not an omission: where content was found thin (the mock's question pool), the correct classification was Hide Pending Rebuild against a preserved architecture, not Replace — the selection logic, evidence pipeline, and timing engine are sound and are being rebuilt around, not discarded.

### Hide Pending Rebuild
- The current Standard/Adaptive Mock's presentation as a representative "CSSE mock exam" — specifically the **content pool and timing model**, not the underlying adaptive-selection or evidence-pipeline architecture (AEP4-D18, detailed in the Special Review below)

### Retire
**None.** No capability reviewed in Phase 4 was recommended for retirement. Two schema tables remain intentionally unpopulated (`school`, `school_admission_threshold`) but "not yet built" is not the same finding as "should be retired" — both remain live candidates for future population under the conditions in Section 6's Admissions Intelligence workstream.

## 5. Assessment Transformation Architecture

For each assessment surface: current state (platform vs. content, per the Special Review's discipline), target state, and what is preserved unchanged.

| Surface | Current Platform State | Current Content State | Target State | Preserved Unchanged |
|---|---|---|---|---|
| **Practice** | Sound — routes through the same 13-competency evidence pipeline as every other surface | Thin — same 18-row pool as the mock | Same platform, full 27-Question-Type content depth | `processEvidenceForCompetency()`, `recordPresentation()`/`recordOutcome()`, Evidence Tier model |
| **Timed Practice** | Timer mechanism exists and is enforced (confirmed by direct code inspection) | Same thin pool | Same platform, real content, timing calibrated per Question Type against Assessment Brain V1's own evidence | Timer enforcement logic |
| **Diagnostic Assessment** | Diagnostic Intelligence categories (Strengths/Development Areas/Emerging/Low Confidence) are real, evidence-derived, no scoring formula (Learning Engine V1 §4) | Same thin pool limits how much of the model can actually be exercised | Same platform, real content unlocks genuine diagnostic breadth | Diagnostic Intelligence category logic, `diagnostics.ts` |
| **Standard Mock** | Adaptive selection absent by design (fetches "every tagged item") — a legitimate design for a genuine full-sample mock, undermined by pool size | 18 rows, no cap — content is the entire pool | Full 27-Question-Type pool, genuine full-sample sitting, real two-paper timing (Section "Special Review") | Fetch-everything-tagged design pattern itself, once the pool is real |
| **Adaptive Mock** | `buildAdaptivePaper()`, diagnostic-weighted selection, cooldown/non-repeat logic, coverage-gate honesty pattern — all real, specified, sound (`ADAPTIVE_MOCK_INTELLIGENCE_SPECIFICATION_V1.md`) | As few as 10 questions from the same 18-row pool | Same selection logic, operating over real content depth | The entire selection algorithm design (§4 of the Adaptive Mock spec) |
| **Writing Assessment** | LLM-scored `overallScore` threshold (70), real evidence-pipeline integration | WC-02's rubric-vs-marks gap limits how confidently any score can be interpreted; only 1 writing prompt exists | Real content depth across both writing prompt types (QT-WC-01a and the currently-absent QT-WC-01b); grading model reviewed once WC-02's evidence gap is addressed | The evidence-pipeline integration, the LLM-scoring mechanism as a starting point pending review |
| **Admissions Readiness** | Non-predictive design, 303 floor shown correctly isolated, `school`/`school_admission_threshold` correctly left unpopulated to date | N/A (no per-school content exists) | 303 floor strengthened with per-school context; `school` table populated where evidence and governance allow (5 of 7 schools, pending 2 conflicts) | The entire non-predictive design boundary — no prediction, no peer comparison, no school-choice guidance, unchanged |
| **Parent Experience** | `CssePathwayParentContent.tsx`, Weekly Report, Revision Planner, Readiness Timeline — all real, evidence-sourced, no fabricated content found | No school-specific content exists anywhere | Extended, not replaced, with a new per-school section once AEP4-D08 is resolved, following the same honest-gating pattern already used site-wide | Every existing parent-facing component and its evidence-sourcing discipline |

## 6. Transformation Workstreams

Each workstream states what platform capability it reuses before what it changes, per Section 3's "Preserve before rebuild" principle.

### 6.1 Assessment Authenticity
**Problem:** mock timing does not reflect CSSE's real paper-and-section structure (AEP4-D17). **Reuses:** the existing exam-mode rendering shell, the existing timer-enforcement mechanism, the existing per-question `estimated_time_seconds` field. **Changes:** the session model — separate English/Maths papers, English internally sectioned per Assessment Brain V1 §2's three-section structure. **Depends on:** 6.2/6.3 (content depth) landing in step, not before or after in isolation — a correctly-timed paper with 18 questions is not more authentic than an incorrectly-timed one.

### 6.2 Question Bank Excellence
**Problem:** only 12 of 27 official Question Types have any content; most have exactly 1 item (AEP4-D19). **Reuses:** the entire tagging/`skill`-field convention, the existing `ali_question_bank` schema, the existing Assessment Coverage panel that already honestly reports this gap. **Changes:** volume and breadth of authored content, sequenced by Assessment Brain V1's own EMC ratings (do not over-invest in EMC-1/EMC-2 competencies relative to EMC-4 ones without separate justification). **Depends on:** resolution of AEP4-C04 (Applied Reasoning currency) before authoring AR-01 content at volume — authoring at scale for a competency whose currency is unconfirmed would compound, not close, that gap.

### 6.3 Content Expansion
**Problem:** the same 18-row pool feeds Practice, Timed Practice, Diagnostic Assessment, and both Mock modes — there is no surface where a learner is not, eventually, re-seeing the same small set. **Reuses:** the existing content-routing architecture (one pool feeding every surface is itself a sound design, not a defect). **Changes:** depth, not architecture. **Depends on:** 6.2 directly — this is 6.2's downstream consumer, not a separate content-authoring effort.

### 6.4 Mock Excellence
**Problem:** the current mock is not fit to represent an authentic competitive CSSE mock (AEP4-D18) — the Founder Field Evidence, independently corroborated. **Reuses:** `buildAdaptivePaper()`, the Mock Attempt Ledger, the coverage-gate honesty pattern already specified. **Changes:** un-hides the mock once 6.1 and 6.2/6.3 have landed together — this workstream is a gate, not a build. **Depends on:** 6.1, 6.2, 6.3 all reaching a jointly-acceptable state; the missing `recordReadinessSnapshot()` call (AEP4-D21) should be fixed alongside this workstream, not as a separate detour.

### 6.5 Writing Excellence
**Problem:** WC-02's unresolved rubric-vs-marks gap limits confident writing assessment; only one writing prompt type has content. **Reuses:** the existing LLM-scoring integration and evidence-pipeline wiring as a starting point. **Changes:** pending a formal Assessment Brain V1 Correction Log review of WC-02 (this workstream does not perform that review itself — it is gated by it), then content depth across both prompt types, then a review of whether the current grading model still fits. **Depends on:** the Correction Log process (outside this Blueprint's authority — Assessment Brain V1 is FROZEN and amends only through its own governance).

### 6.6 Admissions Intelligence
**Problem:** the design's own stated precondition for populating `school` ("real per-school data acquisition") has been met for 5 of 7 schools; `school_admission_threshold` remains genuinely harder (score-scale non-comparability, AEP4-D09). **Reuses:** the entire existing non-predictive design boundary, the existing `school`/`school_admission_threshold`/`consortium_threshold_fact` proposed schema shape. **Changes:** populates `school` with PAN, a geography-type-discriminated priority-area definition (so CRGS's true no-geography status is not misrepresented as a zero-mile radius), and oversubscription structure, each row cited to its `AEP2-###` source; encodes the WHSG conflict as a recorded disagreement, never a silently-chosen value, until resolved. **Depends on:** 6.9 (Knowledge Governance strengthening, AEP4-D15) landing first, per that decision's own acceptance-evidence requirement; resolution of AEP4-C01 for WHSG specifically (the other 6 schools are not blocked by it).

### 6.7 Recommendation Excellence
**Problem:** the Review recommendation category is confirmed unblocked (`ali_durable_mastery`/`ali_educational_audit` already live) but unimplemented; the Speed dimension remains proposed, not built. **Reuses:** the entire Educational State model (Educational Intelligence Engine V1 §7), the existing persistence tables. **Changes:** implements selection/scheduling logic for Review; optionally builds the Speed pace-band dimension from already-real `estimated_time_seconds` data. **Depends on:** nothing blocking — can proceed independently, lower priority than 6.1–6.4 per the Priority Model.

### 6.8 Parent Guidance
**Problem:** no per-school content exists anywhere in parent-facing surfaces, and the 303 floor's current framing risks misreading. **Reuses:** the entire existing `CssePathwayParentContent.tsx` structure, the honest-gating `InfoCard` pattern already used site-wide. **Changes:** adds the 303-floor context (6.1's sibling, low complexity, can proceed early) and, once 6.6 lands, a new per-school section. **Depends on:** 6.6 for the per-school section specifically; independent for the 303-floor context work.

### 6.9 Educational Validation
**Problem:** no workstream above should ship without confirming it actually matches Assessment Brain V1/Learning Engine V1/Educational Intelligence Engine V1's own definitions, and without closing the governance gap AEP4-D15 identified. **Reuses:** the existing 6-dimension verification framework already specified (Educational Intelligence Engine V1 §12: technical correctness, educational correctness, explainability, trust, wellbeing protection, regression). **Changes:** applies that framework formally to every other workstream's output; separately, strengthens `KNOWLEDGE_GOVERNANCE.md` for admissions-data volatility (evidence-year tag, re-verification cadence, conflicting-sources state) ahead of 6.6. **Depends on:** nothing — this workstream should be sequenced first among the design-and-governance items, since 6.6 explicitly depends on it.

### 6.10 Commercial Readiness
**Problem:** several of the conditions a genuinely commercial-ready platform needs (an authentic mock, resolved conflicts, real admissions content where safe) are not yet met. **Reuses:** everything above. **Changes:** nothing on its own — this workstream is a readiness gate over the outputs of 6.1–6.9, detailed in Section 12. **Depends on:** 6.1, 6.4, 6.9 as the minimum bar; 6.6/6.8 as a strong commercial differentiator, not a hard gate.

## 7. Dependency Map

```
6.9 Educational Validation (governance strengthening, evidence-gap closure)
   │
   ├──> 6.6 Admissions Intelligence (schema population)
   │        │
   │        └──> 6.8 Parent Guidance (per-school section)
   │
   ├──> 6.2 Question Bank Excellence
   │        │
   │        └──> 6.3 Content Expansion
   │                 │
   │                 ├──> 6.1 Assessment Authenticity (timing rebuild)
   │                 │        │
   │                 │        └──> 6.4 Mock Excellence (un-hide gate)
   │                 │
   │                 └──> 6.5 Writing Excellence (content depth, after
   │                          its own Correction Log gate)
   │
   └──> (independent) 6.7 Recommendation Excellence
   └──> (independent) 6.8's 303-floor context work (does not need 6.6)

6.10 Commercial Readiness sits over all of the above as a gate, not a workstream with its own build output.
```

**Explicit cross-cutting dependency, not shown above:** resolution of the specific evidence gaps named in Phase 4's Conflict Register (AEP4-C01 WHSG PAN, AEP4-C04 Applied Reasoning currency, AEP4-C05 consortium scope) gates the specific sub-parts of 6.6 and 6.2 that touch them, without blocking the rest of either workstream.

## 8. Transformation Roadmap

Grouped into controlled releases by dependency shape and risk tier, per the Priority Model (child preparation safety first). **No implementation sequencing, dates, or effort estimates are given — this is a release-grouping, not a schedule.**

**Release Group 1 — Foundation and Quick Wins.** Lowest complexity, no cross-workstream dependency, highest trust/safety value per unit of effort: strengthen the 303-floor framing (6.8's independent part); strengthen `KNOWLEDGE_GOVERNANCE.md` for admissions data (6.9); fix the missing `recordReadinessSnapshot()` call; close the Applied Reasoning currency evidence gap (read 2 already-held documents); decide CSSE consortium scope. Stop presenting the current mock as authentic, pending the rest of this roadmap (an immediate, low-complexity gating action, not a rebuild).

**Release Group 2 — Assessment Authenticity and Content.** The core, highest-complexity work: Question Bank Excellence and Content Expansion (6.2/6.3), sequenced by EMC rating; Assessment Authenticity's timing rebuild (6.1), built in step with content depth, not ahead of it.

**Release Group 3 — Mock and Writing Excellence.** Un-hide the mock once Release Group 2 lands (6.4); resolve WC-02's Correction Log review and build out writing content depth (6.5).

**Release Group 4 — Admissions Intelligence and Parent Guidance.** Populate the `school` table for the 6 unconflicted schools; resolve the WHSG conflict and populate the 7th; build the per-school parent-facing section (6.6, 6.8's dependent part).

**Release Group 5 — Recommendation Excellence and Commercial Readiness Review.** Lower-urgency Learning Graph enhancements (6.7); a formal Commercial Readiness review (6.10) against Section 12's criteria before any broader commercial claim is made.

## 9. Educational Risk Assessment

Applying the same 6-dimension model Phase 4 established, to the transformation itself:

| Dimension | Risk of Proceeding As Designed | Risk of Not Transforming |
|---|---|---|
| Child preparation safety | Low, provided the mock stays hidden-pending-rebuild until Release Group 2/3 genuinely close the content gap — the greatest risk is un-hiding early | **Critical** — the status quo is the exact finding that triggered this programme |
| Parent misunderstanding | Low if the 303-floor and per-school work follow the existing "beside, never blended" discipline throughout | High — the 303 floor's current bare framing and the mock's current false-confidence risk both persist |
| Educational validity | Low, provided Section 11's validation framework is applied to every workstream before release, not only at the end | High — WC-02's gap and the content-depth gap both compound the longer they're deferred |
| Admissions guidance | Medium — populating `school` before conflicts are resolved (6.6 jumping ahead of 6.9) would risk encoding a wrong or silently-chosen figure | High — the evidence sits acquired and unused today |
| Commercial trust | Low if Release Group 1's "stop presenting the mock as authentic" action is taken promptly | **Critical** — every day the current mock is presented as representative compounds the exact failure mode Phase 4 found |
| Implementation risk | Medium — this is genuine content-authoring and structural work, not a patch; underestimating it risks a rushed, still-thin re-release | Low (nothing changes) but this is not a mitigant, since the status quo itself carries the highest risk in every other dimension |

## 10. Architecture Preservation Review

**Platform capabilities to preserve, verified against real code/docs, not assumed:**

- Assessment Brain V1, Learning Engine V1, Educational Intelligence Engine V1 — all three FROZEN, none touched by any workstream above; any future correction requires each document's own numbered Correction Log process (Section 6.5's gate on WC-02 is the one live example)
- Knowledge Engine (`knowledge/csse/`, `KNOWLEDGE_GOVERNANCE.md`) — strengthened (6.9), not replaced
- Competency Engine (`assessmentBrainMap.ts`, the 13-competency/27-Question-Type model) — unchanged; content is added to fill it, the model itself is not redesigned
- Learning Graph (Evidence Signal × Evidence Tier, Educational State, Diagnostic Intelligence) — unchanged
- Mistake Intelligence Engine (Development Areas category; `common_mistake` remains proposed-not-approved) — unchanged, not advanced or regressed by this Blueprint
- Evidence Pipeline (`recordPresentation`, `recordOutcome`, `processEvidenceForCompetency`) — unchanged, reused by every workstream above
- Adaptive Selection Architecture (`buildAdaptivePaper()`, the diagnostic-weighted selection rules already specified) — unchanged; it becomes usable at real depth once 6.2/6.3 land, not redesigned to become usable
- Mock Attempt Ledger (`mockProgress.ts`, `MockResult`, `completeMockAttempt`) — unchanged
- Educational Audit (`ali_educational_audit`) — unchanged; 6.4 fixes a call-site gap, not the audit mechanism itself
- Readiness Model (per-component distribution, never a single score) — unchanged
- Recommendation Platform architecture (`getRecommendations()`, `generateExplanation()`, the 5 recommendation categories) — unchanged; 6.7 implements an already-specified category, does not redesign the model
- Parent Guidance architecture (`CssePathwayParentContent.tsx`, the 3-audience Explainability model) — unchanged; 6.8 extends it
- GL, CEM, and ISEB pathway architecture (`lib/adaptiveMockBuilder.ts`, `lib/ali/selection.ts`, `app/mocks/adaptive/gl/page.tsx`) — **entirely out of scope for this Blueprint.** No workstream above touches these files. This is an explicit, standing constraint, not an oversight — CSSE and GL/CEM/ISEB are deliberately unreconciled architectures per `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §4, and this transformation programme does not change that boundary.

**Assessment capabilities requiring redesign:** exactly two, both content/structure, neither architecture — the mock's timing/session model (6.1) and the underlying content pool feeding every surface (6.2/6.3). No engine, pipeline, or persistence layer requires redesign.

## 11. Validation Framework

- **Educational validation:** every newly-authored content item reviewed against Assessment Brain V1's own Measurement Purpose definition for its Question Type, by a qualified educational reviewer — not code-tagging alone. WC-02 content specifically gated on its Correction Log review landing first.
- **Technical validation:** the existing 6-dimension framework (Educational Intelligence Engine V1 §12) applied formally to every workstream's output before release — technical correctness, educational correctness, explainability, trust, wellbeing protection, regression.
- **Founder validation:** each workstream's specific implementation dependency, as named in the Decision Register, requires its own Founder sign-off before work begins — this Blueprint does not pre-authorise any of Section 6's changes.
- **Pilot validation:** before any un-hidden mock or newly-populated per-school content reaches general release, a small-scale real-user (or Founder-family) test pass, consistent with the same rigor the Founder's own field evidence already demonstrated the value of.
- **Production validation:** post-release monitoring for regression against every "Preserve" item in Section 4 — no existing Readiness, Recommendation, or Mock Exam calculation may silently change as a side effect of any workstream above.

## 12. Commercial Readiness Impact

What must exist before Angel becomes commercially ready, per the Priority Model (commercial value ranks 7th of 8 — genuinely dependent on the tiers above it, not a parallel track):

- **Hard gates (must exist):** an authentic mock (Release Groups 1–3 complete — the mock un-hidden only once genuinely representative); the 2 live PAN conflicts resolved or explicitly, safely disclosed rather than silently resolved; `KNOWLEDGE_GOVERNANCE.md` strengthened for admissions data before any per-school fact is shown to a parent.
- **Strong differentiators, not hard gates:** real per-school admissions content (Release Group 4) — valuable, evidenced, but Angel can be commercially defensible without it if the hard gates above are met first; the Review recommendation category and Speed dimension (Release Group 5) — genuine enhancements, not blockers.
- **What this Blueprint does not determine:** timing, resourcing, or a go-to-market decision — those are commercial/business decisions outside this Blueprint's educational-design scope, consistent with `ADMISSIONS_INTELLIGENCE_V1_DESIGN.md`'s own repeated distinction between educational-design authority and business decisions.

---

## Special Review — The Current Mock: Platform vs. Content

Per the governing instruction's explicit requirement, this section separates what is sound from what requires transformation, precisely, rather than describing the entire mock as weak.

**Platform assessment — found sound, preserved unchanged:**
- **Adaptive selection** — `buildAdaptivePaper()`'s diagnostic-weighted selection rules, cooldown/non-repeat logic, and subject-floor guarantees are real, specified, and correctly designed; they are simply operating over too small a pool to demonstrate their own value.
- **Evidence pipeline** — `recordPresentation()`, `recordOutcome()`, `processEvidenceForCompetency()` fire correctly and consistently for every mock sitting today.
- **Educational Intelligence** — the underlying competency model, Evidence Tier, and Educational State logic are unaffected by content thinness; they correctly report "not yet evidenced" where evidence is genuinely absent, exactly as designed.
- **Mock Attempt Ledger** — `MockResult`/`completeMockAttempt` persistence is real, async-ready, and correctly wired.
- **Parent reporting** — the existing 303-floor disclaimer and "beside, never blended" placement are correctly implemented; the only weakness found is the framing content itself (AEP4-D07), not the reporting mechanism.
- **Readiness** — the per-component, non-numeric distribution model is sound; its only defect is the missing `recordReadinessSnapshot()` call on this one page (AEP4-D21), a one-line gap, not a model flaw.
- **Recommendations** — `getRecommendations()`/`generateExplanation()` are unaffected by mock content depth; they correctly reflect whatever evidence exists.

**Content assessment — found not fit for purpose, requiring transformation:**
- **Question coverage** — 12 of 27 official Question Types have any content; 15 have none.
- **Question authenticity** — the seed migration's own header discloses this is illustrative content, "not a production hand-tagging pass."
- **Difficulty** — cannot be meaningfully assessed at this depth; most Question Types have exactly 1 item, too few to characterise a difficulty range.
- **Timing** — a single undivided ~46-minute countdown across all three subjects, not CSSE's real two-paper/sectioned structure.
- **Competency coverage** — thin and uneven, mirroring the Question Type gap directly.
- **Writing realism** — only one of two real prompt types (QT-WC-01a) has content; QT-WC-01b (picture-stimulus) has none.
- **Assessment realism overall** — the combination of thin content and non-authentic timing is precisely what allowed the Founder Field Evidence (a capable child finishing in under 5 minutes at 100%) to occur, and would recur for any similarly capable child today.

**The transformation this Blueprint designs (Sections 6.1–6.4) rebuilds exactly the second list, over exactly the same architecture as the first.**

---

*This Blueprint is the governing document for a future Assessment Transformation Programme. It creates no implementation tasks, estimates no engineering effort, and redesigns no frozen architecture. Per the programme covenant: evidence before implementation, research before engineering, Founder approval before architectural change, educational excellence before commercial launch — all of which remain ahead of this document, not behind it.*
