# Assessment-to-Learning Closed-Loop Design

**Programme:** Angel Assessment Transformation Execution Programme — Release 1
**Prepared:** 2026-08-11
**Status:** Design only.

---

## 1. Purpose

Show exactly how an assessment event (a Founder Validation Assessment sitting, a real Mock, or a practice session) connects through to a personalised learning response — tracing the real function calls involved, not an abstract diagram.

## 2. The Real Chain Today (Assessment → Evidence)

Already proven live this Release (Founder Validation Assessment activation, direct DB verification):

```
Learner answers a question
  → recordOutcome() writes ali_student_question_history (times_seen, times_correct, mastery_state)
  → processEvidenceForCompetency() writes ali_durable_mastery / ali_educational_audit
  → computeEducationalState() re-derives the competency's 8-state label on next read
```

**This chain is REUSE — it does not need to change** for personalisation to work; personalisation consumes its output, it does not alter how evidence is recorded.

## 3. The Chain This Release Adds (Evidence → Choice → Learning)

```
computeEducationalState() [existing] × 13 competencies
  → orchestrateRecommendations() [existing] → ranked candidates + wellbeing veto
  → *** CHOICE INJECTION POINT (new) *** — family selection, if any, merges into weakSkills
  → generatePersonalisedSession() [existing, extended to accept the merged set]
  → selectQuestions()/selectLearningUnit() [existing, unmodified — already accepts weakSkills]
  → learner practises/is taught/is assessed [Excellence Model stage sequence]
  → recordOutcome() [existing] → loop closes back to step 1
```

**Only one link in this entire chain is new: the choice-injection point.** Every other link already exists and already works, per the Reuse Assessment.

## 4. Where Rebalancing Fits

```
Every recommendation cycle:
  orchestrateRecommendations() → Tier 0 wellbeing veto [existing]
                                → *** ESCALATION CHECK (new) ***, same tier, same call site
```

Designed as a sibling addition to the existing Tier 0 veto, not a separate pass — the veto mechanism already runs on every call and already has the authority to change what's surfaced; escalation reuses that authority rather than introducing a second decision point competing with it.

## 5. Where Mastery Maintenance Fits

```
Every competency, every read:
  daysSinceLastMasteredEvidence [existing, already computed]
  → isMaintenanceReviewDue() [existing]
  → "review-due" trigger → recommendation candidate at low priority weight [existing pattern]
```

This already runs continuously and independently of whatever is currently "focused" — no change needed for it to keep running alongside a chosen focus; the only design requirement is that the choice-injection point (§3) must not suppress or exclude review-due candidates entirely, only reduce their relative weight while a focus is active. **This exclusion-vs-deweighting distinction is the one precise engineering rule a future implementation must respect** — get it wrong and "focus" silently becomes "forgetting," which is exactly what the governing instruction prohibits.

## 6. Diagram — Full Loop With New Elements Marked

```
 [Assessment Event]
        |
        v
 recordOutcome() ---------------------------> ali_student_question_history
        |                                              |
        v                                              v
 processEvidenceForCompetency()  <----- computeEducationalState() [per competency]
        |
        v
 orchestrateRecommendations()
   Tier 0: wellbeing veto [existing] + escalation check [NEW, same tier]
   Tier 1: direct-evidence ranking [existing]
        |
        v
 *** CHOICE INJECTION [NEW] *** <---- family/learner selection, with provenance [NEW]
        |
        v
 generatePersonalisedSession() -> selectQuestions()/selectLearningUnit() [existing]
        |
        v
 [Teaching / Practice / Assessment, per Excellence Model stage split]
        |
        +---> loop back to recordOutcome()

 (in parallel, continuously, unaffected by focus state:)
 isMaintenanceReviewDue() -> low-weight "review-due" candidates -> never fully excluded
```

## 7. Explicit Boundary

This design does not specify database schema, does not specify API routes, and does not specify UI components — those are implementation-phase artefacts, gated separately (`IMPLEMENTATION_DEPENDENCY_AND_GATE_REPORT.md`). This document's job is to prove the loop is mechanically coherent using real, named functions — not to build it.
