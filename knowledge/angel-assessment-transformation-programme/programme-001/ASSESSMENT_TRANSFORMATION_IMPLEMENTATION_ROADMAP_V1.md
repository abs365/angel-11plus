# Assessment Transformation Implementation Roadmap V1

**Programme:** Angel Assessment Transformation Programme — Programme 001, Phase 2 (Implementation Roadmap)
**Status:** DESIGN ONLY. No engineering work is authorised by this document. No code, content, database, or architecture has been changed in producing it.
**Prepared:** 2026-08-05

**What this document consumes.** This roadmap converts `ASSESSMENT_TRANSFORMATION_IMPLEMENTATION_BLUEPRINT_V1.md`'s 9 Implementation Domains into implementation waves — controlled releases, not engineering tasks. Every dependency, hard gate, and reused-capability statement already established in that Blueprint (and, beneath it, the frozen Assessment Excellence Programme outputs) is respected here, not re-derived. No time or engineering-effort estimate appears anywhere below, per this phase's explicit instruction.

**Founder Decision status, unchanged.** Every field in the underlying Decision Register (AEP4-D01–D21) and Conflict Register (AEP4-C01–C08) remains blank. This roadmap sequences what could be built, contingent on Founder approval at each wave boundary named below — it does not itself grant that approval.

---

## Priority Model Governing This Sequence

1. Child educational value
2. Assessment authenticity
3. Educational validity
4. Parent confidence
5. Platform reuse
6. Commercial readiness
7. Engineering convenience

This order determines wave sequencing throughout — most visibly, it is why the content-and-timing work (Wave 1) precedes the mock un-hide (Wave 2), which precedes any commercial posture review (Wave 5), and why engineering convenience never determines what ships first.

---

## Wave Sequence Overview

```
Wave 0 — Governance & Evidence Foundation
   │
   ├──> Wave 1 — Question Bank & Assessment Authenticity Foundation
   │        │
   │        └──> Wave 2 — Mock Transformation
   │
   ├──> Wave 4 — Admissions Intelligence Activation
   │        │
   │        └──> (Wave 4's Parent Experience component)
   │
   └──> Wave 3 — Writing Assessment Excellence
            (parallel-capable with Waves 1/2/4 — gated by an external,
             Assessment-Brain-V1-owned process, not by this programme's
             own sequencing)

Wave 5 — Commercial Readiness Review sits over Waves 0, 2, and 4 as a
gate, not a build; it may begin only once those three have exited.

Wave 6 — Recommendation Enhancements (optional, differentiator-only)
sits outside the critical path entirely.
```

---

## Wave 0 — Governance and Evidence Foundation

**Purpose:** No later wave should be built on an unresolved evidence gap or a governance model not yet fit for admissions-data volatility. This wave exists to close exactly those two things first, plus take one immediate, low-complexity protective action.

**Why this wave exists:** Phase 4 found 3 evidence gaps that actively block specific downstream decisions (Applied Reasoning currency, CSSE consortium scope, and — via the governance gap — safe admissions-schema population), and found the current mock is not fit to represent an authentic CSSE assessment. The second finding needs no further evidence to act on; the first three need closing before Waves 1, 4, and parts of 6 can proceed safely. Sequencing this first is the direct application of Priority Model tier 1 (child educational value) — every day the current mock is presented as authentic, and every day an admissions fact could be populated without volatility-aware governance, is a day of unmanaged risk this wave removes cheaply.

**Educational Outcomes:** Applied Reasoning currency confirmed or refuted by reading the already-acquired 2025/2026 CSSE Information Guides; CSSE consortium scope (7 vs. 10 schools) decided by the Founder; `KNOWLEDGE_GOVERNANCE.md` strengthened with an admissions-specific evidence-year tag, re-verification cadence, and conflicting-sources state; the current Standard/Adaptive Mock stops being presented to a parent as a representative CSSE mock exam, pending Waves 1–2.

**Capabilities Preserved:** All of them — this wave touches no engine, no schema, no content pool. It is evidence-reading and governance-document work only.

**Capabilities Strengthened:** Knowledge Engine (governance model).

**Dependencies:** None. This is the first wave.

**Validation Requirements:** The governance-strengthening output reviewed against Educational Intelligence Engine V1 §12's 6-dimension framework before being treated as authoritative for Wave 4.

**Risks:** Low if actioned promptly. The dominant risk is *not* doing this wave first — every subsequent wave's own risk profile is worse without it (Wave 1 risks compounding an unconfirmed Applied Reasoning assumption; Wave 4 risks populating admissions data under a governance model Phase 4 already found insufficient for this specific volatility pattern).

**Exit Criteria:** Applied Reasoning currency resolved (confirmed present, confirmed absent, or explicitly still open with a stated reason); consortium scope decision recorded; strengthened governance standard published; mock relabelling/gating live.

**Founder Approval Point:** **Yes — required before Wave 1 or Wave 4 begins.** This wave's consortium-scope decision in particular cannot be inferred; it is named in the Blueprint as a Founder decision this programme does not make on its own.

---

## Wave 1 — Question Bank and Assessment Authenticity Foundation

**Purpose:** Build the real content depth and the real timing structure every downstream assessment surface depends on. This is the direct remedy to the finding that triggered the entire programme.

**Why this wave exists:** Phase 4 determined, and this programme's Blueprint confirmed, that the current 18-question, 12-of-27-Question-Type content pool combined with a single undivided ~46-minute timer is why a capable child completed the mock in under 5 minutes at 100%. Content and timing are addressed together in one wave, not sequentially, because a correctly-timed session over a still-thin content pool would not be meaningfully more authentic — Priority Model tier 2 (assessment authenticity) requires both together.

**Educational Outcomes:** Genuine, exam-representative content depth across all 27 official Question Types (or an honestly disclosed partial state for any not yet reached), sequenced by Assessment Brain V1's own EMC ratings; a rebuilt session-timing model reflecting CSSE's real two-paper, internally-sectioned structure; Practice, Timed Practice, and Diagnostic Assessment all inherit the same expanded, audited pool.

**Capabilities Preserved:** The one-pool-feeds-every-surface content-routing architecture; the existing timer-enforcement mechanism; the exam-mode rendering shell; the `ali_question_bank` schema and `QT-*` tagging convention.

**Capabilities Strengthened:** Content breadth and depth; session-timing model.

**Dependencies:** Wave 0's Applied Reasoning currency resolution, specifically before AR-01 content is authored at volume.

**Validation Requirements:** Every authored item reviewed against its Question Type's Measurement Purpose by a qualified educational reviewer; the rebuilt timing model reviewed directly against Assessment Brain V1 §2; duplicate/near-duplicate detection against the existing pool; EMC-sequenced authoring order confirmed.

**Risks:** The largest, highest-complexity wave in this roadmap. The dominant risk is under-scoping — re-packaging the same thin content under a more authentic-looking timer without genuinely closing the depth gap, which would repeat the original failure in a more convincing wrapper. This risk is mitigated by making Wave 2 (the mock un-hide) a hard, evidence-checked gate rather than an automatic next step.

**Exit Criteria:** All 27 Question Types have genuine, audited depth or an explicitly disclosed partial state; the timing model is signed off against Assessment Brain V1 §2; every consuming surface confirmed to draw on the expanded pool exclusively.

**Founder Approval Point:** **Yes — required before this wave begins, and its exit criteria re-confirmed by Founder review before Wave 2 opens.**

---

## Wave 2 — Mock Transformation

**Purpose:** Restore the Standard and Adaptive Mock to genuine, representative status, now that Wave 1 has closed the content and timing gap that made the current mock unfit.

**Why this wave exists:** This is the direct reversal of Phase 4's Hide Pending Rebuild determination (AEP4-D18) — but only once the two things that determination was contingent on (content, timing) are actually in place, not merely underway. Sequencing this as its own wave, after Wave 1 fully exits rather than concurrently with it, is a deliberate application of Priority Model tier 1: the risk of un-hiding too early is a repeat of the exact failure mode this whole programme exists to fix.

**Educational Outcomes:** A mock exam a parent can trust as representative of real CSSE conditions; the previously-undisclosed missing `recordReadinessSnapshot()` call fixed, so every mock sitting again contributes to the Readiness Model as designed.

**Capabilities Preserved:** `buildAdaptivePaper()`'s diagnostic-weighted selection, cooldown/non-repeat logic, subject-floor guarantees; the Mock Attempt Ledger; the coverage-gate honesty pattern already specified.

**Capabilities Strengthened:** Mock presentation and gating; Readiness Model completeness (via the defect fix).

**Dependencies:** **Hard gate on Wave 1's exit criteria being met**, not a target date.

**Validation Requirements:** A pilot validation pass (small-scale real-user or Founder-family test) before general release; full re-confirmation of `ADAPTIVE_MOCK_INTELLIGENCE_SPECIFICATION_V1.md` §10's acceptance criteria, run against real content for the first time; the coverage-gate minimum set explicitly, not left implicit.

**Risks:** Commercial or engineering pressure to ship as soon as "some" content exists, rather than waiting for Wave 1's full exit criteria — this is the single most important risk in the entire roadmap to guard against, precisely because it is the one already demonstrated to have occurred once.

**Exit Criteria:** Pilot validation passed; `recordReadinessSnapshot()` confirmed firing in a live test profile; coverage-gate minimum enforced with correct honesty messaging wherever it applies.

**Founder Approval Point:** **Yes — this wave reverses a specific Review Board determination and must not proceed on an assumed continuation from Wave 1's approval.**

---

## Wave 3 — Writing Assessment Excellence

**Purpose:** Address WC-02's unresolved rubric-vs-marks gap through Assessment Brain V1's own governance process, then expand Continuous Writing content to genuinely cover both real prompt types.

**Why this wave exists, and why it runs in parallel rather than in sequence:** WC-02's gap is the weakest-evidenced competency in the entire frozen model, and improving it materially strengthens educational validity (Priority Model tier 3) — but resolving it requires a Correction Log review that is Assessment Brain V1's own process, external to this programme's sequencing authority. This wave is placed outside the Wave 0→1→2 critical path deliberately, so that a slow external review does not stall content and timing work that has no dependency on it.

**Educational Outcomes:** WC-02's evidentiary gap addressed via the Correction Log process, or explicitly and permanently disclosed as a known limitation if not yet resolved; genuine content depth for both QT-WC-01a (already represented) and QT-WC-01b (picture-stimulus, currently absent); a documented, calibration-checked confidence level for the existing LLM-based grading model.

**Capabilities Preserved:** The existing LLM-scoring integration and its evidence-pipeline wiring, retained as the starting point, not presumed adequate in advance.

**Capabilities Strengthened:** Writing competency evidence base (via the external Correction Log outcome); writing content depth; grading-model confidence disclosure.

**Dependencies:** **Hard, external gate:** the Assessment Brain V1 Correction Log review of WC-02, which this programme can request but not perform, since that document is FROZEN and amends only through its own numbered process.

**Validation Requirements:** Post-Correction-Log, every authored item reviewed against the (possibly revised) Measurement Purpose; a grading-model calibration check against independently human-scored samples.

**Risks:** Could stall indefinitely if the Correction Log review is deprioritised elsewhere in the organisation — mitigated by this wave's explicit non-blocking placement relative to Waves 1/2/4, so a stall here does not stall those.

**Exit Criteria:** Correction Log outcome incorporated, or an explicit, permanent disclosure recorded if it has not concluded; both prompt types have genuine content depth; grading-model calibration documented.

**Founder Approval Point:** **Yes, and separately from Waves 1/2** — because it touches a FROZEN document's own governance process, this wave's Founder approval point includes authorising the Correction Log request itself, not only the downstream content work.

---

## Wave 4 — Admissions Intelligence Activation

**Purpose:** Populate real, evidence-cited per-school admissions data now that Wave 0's governance strengthening makes doing so safe, and strengthen the CSSE 303-floor's framing so it cannot be misread as representative.

**Why this wave exists:** Angel's own `ADMISSIONS_INTELLIGENCE_V1_DESIGN.md` named a precondition for populating its per-school schema — "real per-school data acquisition" — and the Assessment Excellence Programme met it for 6 of 7 schools. Leaving that evidence acquired but unused is itself a parent-confidence gap (Priority Model tier 4): a real, answerable question currently goes unanswered by the platform. This wave is sequenced after Wave 0 specifically because Phase 4 found the existing governance model insufficient for admissions-data's demonstrated year-to-year volatility — populating first and strengthening governance after would invert the correct order.

**Educational Outcomes:** PAN, a geography-type-discriminated priority-area definition, and oversubscription structure available for 6 of the 7 named schools, each row cited to its source; the 303 floor shown with honest per-school 2023-entry range context (303–366); a new, clearly-labelled per-school parent-facing section.

**Capabilities Preserved:** The entire non-predictive Admissions Readiness design boundary — no offer prediction, no peer comparison, no school-choice guidance; the already-proposed schema shape; the existing sourced-constant pattern already used correctly for the 303 fact.

**Capabilities Strengthened:** Admissions Intelligence Engine (schema populated for 6 schools); Parent Guidance (new section, extended not replaced).

**Dependencies:** **Hard gate on Wave 0's governance strengthening.** Westcliff High School for Girls' row specifically depends on resolving its live PAN conflict (192 per the school vs. 184 per Southend Council) — the other 6 schools are not blocked by this and may proceed independently of it. `school_admission_threshold` (score cutoffs) is explicitly **out of scope for this wave** — the score-scale non-comparability problem remains unresolved and is not a sequencing delay but a distinct, currently-unscheduled problem.

**Validation Requirements:** Source citation for every populated row; CRGS's genuine absence of any geographic priority-area criterion represented correctly, never as a null/zero-mile radius; a Wellbeing Protection review (Educational Intelligence Engine V1 §3) before any score-cutoff-adjacent content ships; parent-facing copy reviewed against Learning Engine V1 §8's suitable/not-suitable list, and against the Founder acceptance test already specified in `ADMISSIONS_INTELLIGENCE_V1_DESIGN.md` §12.

**Risks:** Parent misunderstanding if the Wellbeing Protection review is skipped or rushed; risk of the WHSG conflict being silently resolved rather than disclosed if this wave is executed under time pressure — explicitly prohibited by the evidence-hierarchy standard this entire programme rests on.

**Exit Criteria:** 6 schools populated with full source citation; WHSG's row either deferred or included with both disputed figures and their provenance shown; 303-floor copy passes Trust and Wellbeing Protection review; per-school parent section passes the Founder acceptance test.

**Founder Approval Point:** **Yes.**

---

## Wave 5 — Commercial Readiness Review

**Purpose:** Confirm, by direct evidence rather than by inference from engineering completion, that the hard gates a genuinely commercial-ready Angel requires are actually met.

**Why this wave exists:** Completing Waves 0–4 is not, on its own, proof of commercial readiness — Priority Model tier 6 places commercial readiness below child educational value, assessment authenticity, educational validity, and parent confidence precisely so that engineering completion is never mistaken for readiness. This wave exists to make that check explicit and separate, not to build anything new.

**Educational Outcomes:** None new — this is a verification wave, not a content or capability wave.

**Capabilities Preserved:** Everything — this wave changes nothing, it reviews.

**Capabilities Strengthened:** None directly.

**Dependencies:** Waves 0, 2, and 4 all exited. Wave 3 is a strong differentiator for this review but, per its own external-gate risk, is not treated as a hard dependency of Wave 5 — its absence should be disclosed, not silently ignored, if Wave 5 proceeds without it.

**Validation Requirements:** A formal Commercial Readiness review applying the hard-gate/differentiator split already established (an authentic mock and resolved admissions conflicts are hard gates; richer per-school content and Learning Graph enhancements are differentiators, not blockers).

**Risks:** False confidence, if this review is skipped, rushed, or treated as a formality rather than a genuine, evidence-based check — this is the risk the wave exists specifically to prevent.

**Exit Criteria:** All named hard gates confirmed met by direct evidence; differentiators tracked separately with their own status; timing, resourcing, and go-to-market sequencing explicitly left as business decisions outside this wave's educational-design scope.

**Founder Approval Point:** **Yes — the final gate before any commercial posture change.**

---

## Wave 6 — Recommendation Enhancements *(optional, differentiator-only, outside the critical path)*

**Purpose:** Implement the already-unblocked Review recommendation category (`ali_durable_mastery`/`ali_educational_audit` already live) and the proposed Speed pace-band dimension.

**Why this wave exists, and why it is last:** Both items are genuine, evidenced, previously-identified opportunities — not defects. Priority Model tier 7 (engineering convenience) explicitly never promotes convenience above tiers 1–6, and neither item was found to carry any child-safety, authenticity, validity, or trust risk if deferred. This wave has no dependency relationship to Waves 0–5 and may proceed at any point without affecting their sequencing, but is listed last to reflect its genuinely lower priority, not a technical constraint.

**Educational Outcomes:** Prior Demonstrated evidence kept current over time via the Review category; an optional pacing dimension added to recommendations.

**Capabilities Preserved:** The entire Educational State model and existing persistence tables, unchanged.

**Capabilities Strengthened:** Recommendation Platform architecture (a previously-specified, unbuilt category implemented).

**Dependencies:** None blocking.

**Validation Requirements:** Standard Educational Intelligence Engine V1 §12 review, same as every other wave.

**Risks:** Low — the primary risk is scope-creep, i.e. this wave being pulled forward ahead of Waves 1–2 because it is comparatively easy, which the Priority Model explicitly forbids.

**Exit Criteria:** Review category selection/scheduling logic implemented and validated; Speed dimension built and validated, if pursued.

**Founder Approval Point:** **Yes, but not time-sensitive relative to Waves 0–5.**

---

## Consolidated Founder Approval Points

| Wave | Approval Required Before | Nature of the Decision |
|---|---|---|
| 0 | Wave 0 begins | Governance strengthening; **explicit consortium-scope decision** — cannot be inferred |
| 1 | Wave 1 begins, and again at its exit before Wave 2 opens | Content/timing rebuild investment |
| 2 | Wave 2 begins | **Reverses a specific Review Board determination (AEP4-D18)** — must not proceed on an assumed continuation |
| 3 | Wave 3 begins | Authorising a Correction Log request against a FROZEN document |
| 4 | Wave 4 begins | Admissions-schema population; accepts the WHSG dual-disclosure approach or defers that school |
| 5 | Wave 5 begins | Final gate before any commercial posture change |
| 6 | Wave 6 begins | Lowest-priority, non-time-sensitive |

**No wave in this roadmap is self-authorising.** Completing one wave's exit criteria is a precondition for the next wave's Founder approval request, never a substitute for it.

---

*This roadmap creates no implementation tasks, estimates no engineering effort or timeline, and authorises no work. It sequences the 9 Implementation Domains from `ASSESSMENT_TRANSFORMATION_IMPLEMENTATION_BLUEPRINT_V1.md` into 7 waves (6 substantive, 1 optional), each gated by explicit Founder approval, in the order the governing Priority Model requires.*
