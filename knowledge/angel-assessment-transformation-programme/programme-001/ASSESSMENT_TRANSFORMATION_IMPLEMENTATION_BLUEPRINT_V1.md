# Assessment Transformation Implementation Blueprint V1

**Programme:** Angel Assessment Transformation Programme — Programme 001 (a separate, standalone implementation-planning programme — not a continuation of the Assessment Excellence Programme)
**Status:** DESIGN ONLY. No engineering work is authorised by this document. No code, content, database, or architecture has been changed in producing it.
**Prepared:** 2026-08-05

**On the frozen foundation this document consumes, not repeats.** Per this programme's explicit instruction, the following are treated as frozen governing inputs and are not re-derived, re-researched, or second-guessed here: the Assessment Excellence Research Blueprint, the Source Register and Evidence Register (101 sources, AEP2-001–101), the Phase 3 Evidence Synthesis (6 findings), the Phase 4 Review Board (`ASSESSMENT_EXCELLENCE_DECISION_REGISTER.md`, 21 entries AEP4-D01–D21, and `ASSESSMENT_EXCELLENCE_CONFLICT_REGISTER.md`, 8 entries AEP4-C01–C08), and `ASSESSMENT_TRANSFORMATION_BLUEPRINT_V1.md` (Phase 5). Every claim below cites back to one of these rather than re-establishing it.

**On Founder Decision status, carried forward unchanged.** Every Founder Decision field in the Decision and Conflict Registers remains blank. This document does not treat any individual AEP4-D### or AEP4-C### item as approved. Per this programme's own Implementation Rules: *no implementation begins until this implementation blueprint receives Founder approval* — and that approval, once given, still does not retroactively fill the underlying Decision Register's own fields; those remain a separate record.

---

## Preservation Commitment

Platform capability is preserved unless future Founder approval states otherwise. The following 12 capabilities, named explicitly in this programme's governing instruction, are protected inputs to every domain below — none is redesigned, replaced, or touched by any implementation strategy in this document:

Assessment Brain V1 · Learning Engine V1 · Educational Intelligence Engine V1 · Knowledge Engine · Competency Engine · Learning Graph · Mistake Intelligence Engine · Adaptive Selection · Evidence Pipeline · Mock Attempt Ledger · Parent Guidance · Recommendation architecture

**Also carried forward, binding, from Phase 5's Architecture Preservation Review** even though not separately re-listed in this programme's instruction: the Readiness Model (per-component distribution, never a single score), and the explicit, standing exclusion of GL, CEM, and ISEB pathway architecture (`lib/adaptiveMockBuilder.ts`, `lib/ali/selection.ts`, `app/mocks/adaptive/gl/page.tsx`) from every domain below. CSSE and GL/CEM/ISEB remain deliberately unreconciled architectures per `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §4; nothing in this Programme changes that boundary.

**Educational transformation must reuse enterprise capability wherever possible** — each of the 9 domains below states explicitly what it reuses before what it changes, per the same "preserve before rebuild" discipline Phase 5 established.

---

## 1. Question Bank Transformation

- **Educational Objective:** Close the Question Type coverage gap Phase 4 found (12 of 27 official Question Types have any content, most exactly 1 item, 15 have zero) with genuine, exam-representative depth, sequenced by Assessment Brain V1's own EMC ratings — not uniformly, and not by convenience.
- **Existing Capability Reused:** `ali_question_bank` schema; the `skill` field's `QT-*` tagging convention; `fetchQuestionBank()`; the Assessment Coverage panel (`EvidenceProfile.tsx`) that already honestly reports this exact gap; the one-pool-feeds-every-surface content-routing architecture (Practice, Timed Practice, Diagnostic Assessment, both Mock modes) — a sound design that requires filling, not redesigning.
- **Implementation Dependencies:** Resolution of AEP4-C04 (Applied Reasoning currency, AEP2-065/066 already acquired, unread) before authoring AR-01 content at volume — authoring against an unconfirmed competency would compound, not close, that gap. Educational Validation (Domain 8) reviewer capacity for every authored item. Assessment Brain V1's Measurement Purpose definitions as the per-Question-Type authoring brief.
- **Validation Requirements:** Every authored item reviewed against its Question Type's Measurement Purpose by a qualified educational reviewer, not code-tagging alone. Duplicate/near-duplicate detection against the existing 18-row pool. Authoring sequenced and checked against EMC rating (do not over-invest in EMC-1/EMC-2 competencies — RC-03, RC-04, MR-05, WC-02, AR-01's concrete mechanic — relative to EMC-4 ones without separate justification, AEP4-D19 Conditions).
- **Production Readiness Criteria:** Genuine, non-trivial depth (not merely "≥1 item exists") across all 27 Question Types, or an explicitly disclosed, honestly-communicated partial state for any type not yet reached. A documented content audit exists. Zero untagged or mistagged items — the existing `skill.startsWith("QT-")` gate remains the authoritative filter, unchanged.

## 2. Assessment Authenticity

- **Educational Objective:** Rebuild the mock/timed-practice session model to reflect CSSE's real two-paper, internally-sectioned structure (English: 70 minutes, 3 timed sections; Mathematics: separate 60-minute paper — `ASSESSMENT_BRAIN_V1.md` §2, Observation 2), replacing the current single undivided ~46-minute countdown across all three subjects.
- **Existing Capability Reused:** The existing exam-mode rendering shell (`ExamEnglish`/`ExamMaths`/`ExamWriting` components); the real, already-enforced timer mechanism; each question's own `estimated_time_seconds` field, which the new session-timing model composes differently, not replaces.
- **Implementation Dependencies:** Must land in step with Domain 1 (Question Bank Transformation) — a structurally correct paper-and-section timing model applied to an 18-question pool would not be more authentic, only differently unauthentic. Domain 8 (Educational Validation) sign-off on the timing model against Assessment Brain V1 §2 before release.
- **Validation Requirements:** Human review of the rebuilt timing model directly against Assessment Brain V1 §2's confirmed structure — not an automated check alone. Regression confirmation that GL/CEM/ISEB pathway timing (a separate, untouched system) is unaffected.
- **Production Readiness Criteria:** A mock/timed-practice session presents English and Mathematics as separate timed papers; English is internally sectioned (Comprehension / Applied Reasoning / Continuous Writing) per the confirmed structure; sign-off recorded against Assessment Brain V1 §2 before any release.

## 3. Mock Transformation

- **Educational Objective:** Restore the Standard and Adaptive Mock to genuine, representative status — currently withheld per Phase 4's explicit determination (AEP4-D18) that the mock is not fit to represent an authentic competitive CSSE mock, a finding that independently corroborated the Founder Field Evidence (a capable child completing the mock in under 5 minutes at 100%).
- **Existing Capability Reused:** `buildAdaptivePaper()` and its diagnostic-weighted selection rules, cooldown/non-repeat logic, and subject-floor guarantees — all real, specified, and sound (`ADAPTIVE_MOCK_INTELLIGENCE_SPECIFICATION_V1.md` §4); the coverage-gate honesty pattern already specified (§6.1); the Mock Attempt Ledger (`completeMockAttempt`/`MockResult`, `lib/mockProgress.ts`) unchanged.
- **Implementation Dependencies:** **Hard gate, not a target date:** Domain 1 (Question Bank Transformation) and Domain 2 (Assessment Authenticity) must both reach production readiness first — this domain does not build content or timing, it un-gates a mock that already has both. The missing `recordReadinessSnapshot()` call (a confirmed, already-specified one-line gap — `ADAPTIVE_MOCK_INTELLIGENCE_SPECIFICATION_V1.md` §5) should be fixed alongside this domain's work, not deferred as a separate detour.
- **Validation Requirements:** A Pilot Validation pass (small-scale real-user or Founder-family test) before general release. Full re-confirmation of the acceptance criteria already specified in `ADAPTIVE_MOCK_INTELLIGENCE_SPECIFICATION_V1.md` §10, run against real (not fixture) content for the first time. The coverage-gate minimum (an open decision, §6.1 of that specification) set explicitly, not left implicit.
- **Production Readiness Criteria:** Domains 1 and 2 both at production readiness. `recordReadinessSnapshot()` confirmed firing in a live test profile. Coverage-gate minimum enforced and its honesty banner ("not yet your full personalised set," matching the pattern already used elsewhere in the app) shown correctly wherever it applies. Pilot validation signed off before general release.

## 4. Writing Assessment Excellence

- **Educational Objective:** Address WC-02's unresolved rubric-vs-numeric-marks gap (Assessment Brain V1 Observation 10, narrowed but not resolved by Observation 13) via that document's own governance process; expand content to both real Continuous Writing prompt types (QT-WC-01a, already represented; QT-WC-01b, picture-stimulus, currently absent entirely).
- **Existing Capability Reused:** The existing LLM-scoring integration (`/api/writing-feedback`, `overallScore`, `WRITING_CORRECTNESS_THRESHOLD = 70`) and its evidence-pipeline wiring, retained as the starting point pending review, not presumed adequate or inadequate in advance.
- **Implementation Dependencies:** **Hard gate:** a formal Assessment Brain V1 Correction Log review of WC-02 must land first — this is outside this Blueprint's own authority, since Assessment Brain V1 is FROZEN and amends only through its own numbered Correction Log process, not a routine content-team edit. Content and grading-model work in this domain should not proceed at volume ahead of that review.
- **Validation Requirements:** Post-Correction-Log, every authored writing item reviewed against the (possibly revised) WC-02 Measurement Purpose. A grading-model calibration check — automated `overallScore` outputs compared against samples independently scored by a qualified human reviewer — before the current grading approach is confirmed adequate or flagged for revision.
- **Production Readiness Criteria:** WC-02's evidentiary gap is either resolved through the Correction Log process or explicitly, permanently disclosed as a known limitation in any writing-assessment output. Both prompt types (QT-WC-01a, QT-WC-01b) have genuine content depth. The grading model's calibration result and confidence limits are documented, not assumed.

## 5. Educational Content Expansion

- **Educational Objective:** Ensure Practice, Timed Practice, and Diagnostic Assessment all draw on the same expanded, audited content pool Domain 1 produces — not a separately-authored or separately-validated track.
- **Existing Capability Reused:** The entire existing content-routing architecture — one pool, many consuming surfaces — confirmed by direct inspection to already be the current design, and confirmed sound; this domain does not introduce a new routing model.
- **Implementation Dependencies:** Directly and entirely downstream of Domain 1. This domain has no independent content-authoring workstream of its own.
- **Validation Requirements:** Identical to Domain 1's — this domain introduces no additional validation surface, it consumes the same audited pool under the same review standard.
- **Production Readiness Criteria:** Every consuming surface (Practice, Timed Practice, Diagnostic Assessment) confirmed to draw on the Domain-1-expanded pool exclusively, with no separate, unaudited content path emerging as a side effect of this expansion.

## 6. Admissions Intelligence Activation

- **Educational Objective:** Populate the `school` table (PAN, a geography-type-discriminated priority-area definition, oversubscription-category structure) for the 7 named schools where evidence and governance allow; strengthen the CSSE 303-floor's parent-facing framing with real per-school 2023-entry range context (303–366), preserving "beside, never blended, never a prediction" throughout.
- **Existing Capability Reused:** The entire non-predictive Admissions Readiness design boundary (`ADMISSIONS_INTELLIGENCE_V1_DESIGN.md`) — no offer prediction, no peer comparison, no school-choice guidance, unchanged; the already-proposed `school`/`school_admission_threshold`/`consortium_threshold_fact` schema shape; the existing `admissionsContext.ts` sourced-constant pattern as the template for how the 303 fact is already correctly handled.
- **Implementation Dependencies:** **Hard gate:** `KNOWLEDGE_GOVERNANCE.md` must be strengthened for admissions-data volatility first — a mandatory "evidence year" tag, an annual re-verification cadence, and a formal "conflicting sources, unresolved" Review Status state (AEP4-D15's own named acceptance-evidence requirement) — before any row is populated. AEP4-C01 (WHSG's 2026 PAN — 192 per the school vs. 184 per Southend Council, both Level 1, no hierarchy tiebreaker) must be resolved before that specific school's row is populated; the other 6 schools are not blocked by it. `school_admission_threshold` (score cutoffs) remains explicitly out of scope for this domain until the score-scale non-comparability problem (AEP4-D09) is separately resolved or permanently disclosed — this is not a sequencing delay, it is a distinct, harder, currently-unscheduled problem.
- **Validation Requirements:** Every populated row cites its specific `AEP2-###` source. CRGS's genuine absence of any geographic priority-area criterion is represented as such — never as a null or zero-mile radius, which would misrepresent it. A Wellbeing Protection review (Educational Intelligence Engine V1 §3, Principle 8) before any score-cutoff-adjacent content ships, given admissions framing's proximity to exam-outcome anxiety.
- **Production Readiness Criteria:** Governance strengthening (the hard gate above) complete and confirmed before any population begins. `school` populated for the 6 unconflicted schools with full source citation; WHSG's row either includes both disputed figures with provenance or is deferred until AEP4-C01 resolves. `school_admission_threshold` remains unpopulated — its production readiness is out of this domain's scope entirely pending a separate resolution. 303-floor copy passes Trust and Wellbeing Protection review per `ADMISSIONS_INTELLIGENCE_V1_DESIGN.md` §12.

## 7. Parent Experience Enhancement

- **Educational Objective:** Extend existing parent-facing surfaces with the strengthened 303-floor context (independent of Domain 6, can proceed on its own) and, once Domain 6 reaches production readiness, a new per-school admissions section.
- **Existing Capability Reused:** The full existing structure of `CssePathwayParentContent.tsx`; the honest-gating `InfoCard` pattern already used site-wide ("Available for the CSSE pathway only" and equivalent); the 3-audience Explainability model (Educational Intelligence Engine V1 §9) governing how the same underlying conclusion is rendered differently for learner, parent, and audit contexts.
- **Implementation Dependencies:** The per-school section is entirely dependent on Domain 6's production readiness. The 303-floor context enhancement has no dependency on Domain 6 and may proceed independently and earlier.
- **Validation Requirements:** All new or changed parent-facing copy reviewed against `LEARNING_ENGINE_V1.md` §8's suitable/not-suitable list. The Founder acceptance test already specified in `ADMISSIONS_INTELLIGENCE_V1_DESIGN.md` §12 re-applied: a parent reading the enhanced page can correctly state, in their own words, that Angel has not told them whether their child will get in.
- **Production Readiness Criteria:** Copy review sign-off recorded for every new surface. No prediction, peer-comparison, or school-choice-guidance element introduced anywhere, confirmed by direct review, not assumed from design intent alone.

## 8. Educational Validation

- **Educational Objective:** Apply the existing 6-dimension verification framework (technical correctness, educational correctness, explainability, trust, wellbeing protection, regression — Educational Intelligence Engine V1 §12) formally to the output of every other domain above before any of it reaches production; close the two evidence gaps (Applied Reasoning currency, CSSE consortium scope) that several domains' full completion depends on.
- **Existing Capability Reused:** The 6-dimension framework itself, entirely unchanged — this domain does not invent a new validation model, it operationalises the one that already exists.
- **Implementation Dependencies:** None blocking — this domain should be sequenced first among governance-and-evidence work, since Domain 6 explicitly depends on its governance-strengthening output, and Domains 1/4 depend on its evidence-gap-closure output (Applied Reasoning currency, WC-02's Correction Log).
- **Validation Requirements:** *This domain's validation requirements are its own deliverable* — a documented pass/fail record against all 6 dimensions for every other domain's output, before that domain's own production readiness criteria can be considered met.
- **Production Readiness Criteria:** Each of Domains 1–7 and 9 has a documented, dated pass against all 6 dimensions. No domain above self-certifies its own release without this independent check.

## 9. Commercial Readiness

- **Educational Objective:** Confirm the hard gates a genuinely commercial-ready Angel requires — an authentic mock, resolved admissions conflicts, strengthened governance — are actually met, rather than assumed met because the surrounding engineering work is complete.
- **Existing Capability Reused:** Everything above; this domain builds no new capability of its own.
- **Implementation Dependencies:** Domain 3 (Mock Transformation) and Domain 6 (Admissions Intelligence Activation)'s hard gates, and Domain 8 (Educational Validation), at minimum, before this domain's own review can proceed meaningfully.
- **Validation Requirements:** A formal Commercial Readiness review applying the hard-gate/differentiator split already established in Phase 5 §12 — an authentic mock and resolved conflicts are hard gates; real per-school content and Learning Graph enhancements (e.g. the Review recommendation category, carried forward from Phase 5's Recommendation Excellence workstream — see note below) are differentiators, not blockers.
- **Production Readiness Criteria:** All named hard gates confirmed met by direct evidence, not by inference from engineering completion. Differentiators tracked separately with their own status, not conflated with the hard-gate list. Timing, resourcing, and go-to-market sequencing remain explicit business decisions outside this domain's educational-design scope.

---

## Note — Item Carried Forward, Not Renumbered

Phase 5's Blueprint named 10 workstreams; this programme's instruction names 9 Implementation Domains. The one item not given its own numbered domain here — **Recommendation Excellence** (implementing the already-unblocked Review recommendation category; building the proposed Speed pace-band dimension) — is carried forward as real, evidenced, and still valid work, referenced under Domain 9's differentiator list above, rather than silently dropped. It remains lower-priority per the Priority Model (child preparation safety and assessment authenticity rank above recommendation enhancements) and has no dependency blocking any of the 9 numbered domains.

---

## Governing Rules Restated

- **Platform capability is preserved unless future Founder approval states otherwise** — every domain above states its reused capability first, its change second, and no domain proposes touching any item on the Preservation Commitment list.
- **Educational transformation reuses enterprise capability wherever possible** — confirmed domain-by-domain above; no domain proposes a new engine, a new persistence model, or a new architecture where an existing one already serves the purpose.
- **No implementation begins until this implementation blueprint receives Founder approval.** This document authorises nothing on its own.

---

*This is a design document. It creates no implementation tasks, writes no code, redesigns no architecture, rewrites no questions, and modifies no production system. It converts Phase 5's Transformation Blueprint into 9 domain-level implementation strategies, each with its educational objective, reused capability, dependencies, validation requirements, and production readiness criteria — ready for Founder review, not for engineering.*
