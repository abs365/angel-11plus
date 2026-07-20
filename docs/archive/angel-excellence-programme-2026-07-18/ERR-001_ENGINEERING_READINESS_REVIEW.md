# ERR-001: Engineering Readiness Review

**Document ID:** ERR-001
**Programme:** Angel Excellence Programme — independent review of the Engineering Architecture Wave
**Status:** DRAFT — awaiting programme review
**Project:** Angel 11+
**Owner:** ELBOLD
**Last Updated:** 2026-07-18
**Reviews:** `AIW-001_EDUCATIONAL_DATA_MODEL.md`, `EAW-002_LEARNING_INTELLIGENCE_ENGINE_ARCHITECTURE.md`, `EAW-003_ASSESSMENT_ENGINE_ARCHITECTURE.md`, `EAW-004_RECOMMENDATION_ENGINE_ARCHITECTURE.md`, `EAW-005_IMPLEMENTATION_READINESS_ARCHITECTURE.md` (all approved), checked against the frozen Version 1.0 Educational Architecture (`AEP-001`–`005`, `ARR-001`).

**Method, stated honestly per the explicit instruction not to assume correctness:** this review re-read the engineering documents directly and ran targeted searches across the whole document set for specific claims made in the engineering architecture, rather than accepting them on the strength of having been previously approved. Two genuine defects were found this way — both real, both verified by direct search, not inferred. Findings are labelled **Verified** (confirmed by direct search/read this session), **Observation** (a real property worth naming, not a defect), or **Recommendation** (this review's own judgement).

---

## 1. Architectural Inconsistencies

**DEFECT-1 (real, verified):** `EAW-004` §2 states the "Target exam date / proximity to it" recommendation input is "implied by Pathway Selection (AEP-004 §3)." **This is factually incorrect.** A direct search of `AEP-004_LEARNING_JOURNEY_FRAMEWORK.md` §3 confirms Pathway Selection captures *which exam board* a learner is preparing for (CSSE/GL/CEM/ISEB/Independent/Custom) — it never captures, and was never designed to capture, a specific target *date*. Different schools and regions sitting the same board's exam do so on different dates, and even a single board's own fixed annual date (e.g. CSSE's published 2026 date) is a calendar fact, not learner-submitted data Pathway Selection collects. **The consequence is real, not cosmetic:** `EAW-004`'s entire Tier 3 (Examination-readiness reweighting, §4–§5 of that document) depends on an exam-proximity value that has no defined data source anywhere in the frozen architecture. This is not implementable as specified.

**A second, related inconsistency (moderate):** `EAW-004` §3's "Reinforcing" Educational State is partly defined by confidence "not yet stable" — language that risks being read as depending on `LEARNING_PROFILE_MODEL.md`'s **Learning Consistency** dimension, which that document explicitly and correctly types as `null` (no per-attempt timestamp data exists to compute real variance/stability). "Reinforcing" is very likely still definable purely from existing session/threshold-progress signals (attempts made vs. threshold not yet met) without needing the null Consistency dimension — but this was not stated explicitly when the state was defined, and an implementer reaching for "stability" data could reasonably reach for the wrong, non-existent field.

---

## 2. Hidden Coupling

**DEFECT-1, restated as a coupling problem:** Recommendation Orchestration's Tier 3 is silently coupled to a data source that does not exist — this is the clearest case of hidden coupling in the wave: a dependency was assumed, cited to a document that does not actually provide it, and the citation was never checked before this review.

**A second real coupling gap, verified by direct search:** the string "pathway" **does not appear anywhere in `EAW-002_LEARNING_INTELLIGENCE_ENGINE_ARCHITECTURE.md`** — confirmed by direct search of the file. This means the Recommendation Pipeline (`EAW-002` §4, five stages) never explicitly states where, or whether, pathway/domain-eligibility filtering (the mechanism AEP-004 §3 specifies to close AEP-002's most consequential named gap — a CSSE learner never seeing Verbal/Non-Verbal Reasoning recommendations) is actually applied. `EAW-004` §2 lists "Pathway (gates domain eligibility)" as a recommendation input, but neither `EAW-002` §4 nor `EAW-004` §5's Tier 0–3 ordering names a pathway-gating step anywhere in the sequence. The dependency exists in intent, and is implicitly assumed by both documents, but is coupled nowhere explicit enough for an implementer to build against.

---

## 3. Engineering Ambiguity

Both items from §1–2 are, from an implementer's perspective, ambiguity as much as inconsistency: **where exactly does pathway-gating run relative to Tier 0 (Wellbeing)?** Before candidate generation (excluding out-of-pathway domains from ever being considered) is the only sensible answer given AEP-004 §3's framing ("never recommended," not "de-prioritised") — but the current documents never say so explicitly, leaving room for an implementation that applies it as a later-stage filter instead, which would be a materially weaker guarantee.

**A second ambiguity, lower severity:** Educational State Coordination (`EAW-004` §3) never specifies its own computation cadence — computed once per session, recomputed on every candidate-generation call, or cached with an invalidation rule. `AIW-001`/`EAW-002`'s general "derived, computed-on-read-or-cached" principle presumably applies, but this was never restated for this specific new component, unlike Confidence Processing and Durable Mastery, which both got an explicit real-time-vs-batch classification (`EAW-002` §10).

---

## 4. Performance Risks

No new defect found beyond §3's cadence ambiguity for Educational State Coordination. The broader real-time/batch split (`EAW-002` §10, `EAW-004` §9) is internally consistent across all four engineering documents — **Verified**, checked by direct comparison, no contradiction found. The 63-competency Knowledge Graph traversal-caching concern `EAW-002` §10 itself already flagged remains open exactly as that document stated (an implementation task, not a design gap) — no new finding here, restated for completeness.

---

## 5. Security Risks

No new defect found in the security sections themselves — `EAW-002`/`003`/`004` §11 are internally consistent and each explicitly, honestly scopes out formal legal/regulatory compliance review (**Verified**, this is stated the same way in all three, not silently varying). **One new risk this review surfaces, downstream of DEFECT-1:** once a real target-exam-date data source is defined to fix Tier 3, it must be re-checked against the no-new-PII discipline every other entity in this wave was held to (`AIW-001` §7–§10, `EAW-002` §11) — a specific date is a more granular, potentially more sensitive data point than a board-name selection, and none of the existing security sections evaluated it, because none of them had reason to believe it required a real, undefined data source until this review checked.

---

## 6. Educational Fidelity Risks

**This is the most important finding in the whole review, and it is a direct, almost ironic confirmation of `EAW-005` §8's own words.** `EAW-005` §8 (Educational Fidelity Validation) states: *"a build that technically implements Confidence Processing correctly but silently allows a CSSE-pathway learner to receive Verbal Reasoning recommendations has failed Educational Fidelity Validation."* This review's §2 finding shows the architecture that precedes EAW-005 never actually specifies where the guard against exactly this failure mode lives. `EAW-005` correctly named the risk to check for at implementation time — but the engineering architecture it was reviewing already contained the gap that would let this exact failure occur, unnoticed until this independent review traced the citation chain.

---

## 7. Explainability Risks

No new defect found. One observation: the "what evidence would change this" counterfactual (`EAW-002` §5) is well-specified for recommendations that are actually delivered, but its applicability to a Tier-0-vetoed or pathway-filtered-out candidate was never addressed anywhere. This is very likely a non-issue, since only surfaced recommendations require full Explainability output (`EAW-002` §4 stage 5 runs only on survivors) — **Observation**, not a defect, but worth a one-line confirmation in any future amendment addressing §2's gap.

---

## 8. Operational Risks

**A real, verified gap:** a direct search across every document in this wave for "retention" and "volume" returns zero matches. Operational Events (`EAW-003` §10) are explicitly designed to be high-frequency (emitted for every Automatic-tier decision resulting in an observable action) — yet no document anywhere addresses how long these are retained, whether they require aggregation or rollup over time, or what governs their growth. This is a genuine operational gap, not a design flaw in the event shape itself, and should be addressed before implementation reaches production scale.

---

## 9. Migration Risks

No new defect found. `AIW-001` §11's sequencing (bank population → Durable Mastery/Audit tables → Recommendation Evidence structures) and `EAW-005` §5's restatement of it are internally consistent, and the schema-cache-reload requirement (grounded in this project's own real Phase 5B.8 incident) is carried through correctly and repeatedly — **Verified**, checked directly against both documents.

---

## 10. Testing Gaps

**A real gap, verified by direct read of `EAW-005` §3:** the five-dimension Verification Strategy is entirely forward-looking — it verifies that *new* code satisfies its Educational Contract, but never explicitly requires confirming that Angel's existing, already-shipped behaviour (the weak-skill override, the current mastery mechanism, Daily Mission, Parent Insights) remains unregressed by this wave's implementation. This is a notable omission specifically because it breaks with this project's own consistent, real precedent — every prior ALI implementation phase in this project's history included an explicit "existing X confirmed unchanged" verification step, and `EAW-005` §3, despite citing this project's own established verification techniques elsewhere, does not carry that specific discipline forward into its own strategy.

---

## 11. Implementation Risks

**Aggregated finding — "calibration debt":** several load-bearing numeric parameters have now been deferred across the *entire* wave without any document ever assigning an owner or a resolution mechanism for them:
- The Maintenance Review interval (deferred in `AEP-004` §9.2, deferred again in `EAW-002` §8 — the same open parameter, twice, with no resolution in between)
- Confidence tier boundary definitions (AEP-005 §6 describes each tier qualitatively; no document anywhere states the actual attempt-count/time-gap/consistency thresholds that separate them numerically)
- The examination-readiness reweighting curve (`EAW-004` §4–§5's "as exam proximity increases" has no defined starting point, curve shape, or magnitude)

Each of these was a reasonable thing to defer *at the time it was first raised* — calibration is legitimately downstream of architecture. But `EAW-005`, whose entire purpose is preparing the wave for implementation, never names who resolves these or when, which risks the programme reaching "implementation-ready" status while several genuinely load-bearing numbers remain completely unspecified and un-owned.

---

## 12. Overall Readiness

The Engineering Architecture Wave is coherent in its majority, correctly preserves the frozen Educational Architecture everywhere this review checked except the two defects above, and its component/contract structure (`EAW-002`–`005`) is sound. It is **not**, however, uniformly ready for implementation to begin across every component — specifically, the Recommendation Engine (`EAW-004`) has a real, unresolved dependency gap (DEFECT-1) and an unspecified guard against its own most consequential failure mode (§2/§6's finding), while the Assessment Engine (`EAW-003`) and the general Learning Intelligence Engine's non-recommendation components (Confidence/Mastery/Durable Mastery Processing, `EAW-002` §6–§8) were not found to share these specific defects.

---

## Findings, Defects, Risks, Opportunities

**Defects (require correction before affected implementation begins):**
1. `EAW-004` §2's exam-proximity data source citation is factually wrong; Tier 3 has no defined data source.
2. Pathway/domain-eligibility gating is never explicitly sequenced into either the Recommendation Pipeline (`EAW-002` §4) or Recommendation Prioritisation (`EAW-004` §5) — the single most consequential gap in the review, since it is exactly the failure mode `EAW-005` §8 itself warned about.

**Risks (should be resolved, do not necessarily block all implementation):**
- Operational Event retention/volume is entirely unaddressed (§8).
- Calibration debt across three parameters has no named owner or resolution process (§11).
- `EAW-005` §3's Verification Strategy omits an explicit existing-behaviour regression check (§10).
- "Reinforcing" state's definition risks confusion with the explicitly-null Learning Consistency dimension (§1).
- Educational State Coordination's computation cadence is unspecified (§3).
- Target exam date, once a real source is defined, needs its own privacy check (§5).

**Opportunities:**
- Both defects are narrowly scoped and cheaply correctable — this is good news specific to this review's timing, since neither requires touching the frozen Educational Architecture itself, only adding an explicit sequencing/data-source clarification to the engineering documents.
- The fact that `EAW-005` §8 independently predicted the exact failure mode DEFECT-2 leaves open is itself a demonstration that the wave's own verification thinking is sound — the gap is in engineering specification, not in the programme's judgement about what matters.

**Recommended corrections (defect correction only, not redesign, consistent with APD-012's instruction):**
- Amend `EAW-004` §2 to remove the incorrect citation and either (a) propose a minimal, explicitly-new data capture point for target exam date, tied to a genuine future Founder decision on where it is collected, or (b) descope Tier 3 to a qualitative "approaching/not approaching" signal derivable from the academic calendar and pathway alone, if a precise date is judged unnecessary — either is a defect correction, not a redesign, and either resolves DEFECT-1.
- Amend `EAW-002` §4 and/or `EAW-004` §5 to add an explicit pathway/domain-eligibility filter stage, applied before candidate generation (Tier -1, ahead of Tier 0), closing DEFECT-2.

---

## Go / Conditional Go / No-Go Recommendation

**Conditional Go — narrower and more specific than `ARR-001`'s conditional approval, because this review found two real, verified defects rather than a single wording issue.**

- The Assessment Engine (`EAW-003`) and the Learning Intelligence Engine's core evidence/mastery/durability components (`EAW-002` §6–§9) are not implicated by either defect and may proceed to implementation planning once `EAW-005`'s general Release Readiness Criteria are otherwise met.
- **The Recommendation Engine (`EAW-004`) should not begin implementation until DEFECT-1 and DEFECT-2 are corrected** via the recommended amendments above — both are narrow, defect-level corrections consistent with APD-012's "do not redesign architecture unless a genuine defect is identified" instruction, not a reason to reopen the wave broadly.
- The risks in §8/§10/§11 (operational retention, regression testing, calibration ownership) should be addressed before any component reaches production release, but do not block starting implementation work now.

---

Awaiting programme review.
