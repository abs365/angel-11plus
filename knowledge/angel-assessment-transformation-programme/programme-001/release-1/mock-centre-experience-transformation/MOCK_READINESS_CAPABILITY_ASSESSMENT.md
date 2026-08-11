# Mock Readiness Capability Assessment

**Programme:** Angel Assessment Transformation Execution Programme — Mock Centre Experience Transformation
**Prepared:** 2026-08-11
**Method:** Direct read of `lib/learningEngine/mockReadiness.ts` and its one real caller (`components/parent/CssePathwayParentContent.tsx`). No new educational logic is proposed here — this document maps what already exists to what the Founder's mandate requests, and states plainly what is not yet supported.

---

## What already exists, and is already approved

`assessMockReadiness()` (Sprint 5, WP5C) is a pure categorical dispatch over three real, already-computed facts:
- `hasAnyEvidence` — from `fetchLearnerIntelligenceProfile()`.
- `mockAttemptCount` — `getMockResults().length`.
- `topTriggerReason` — whether the real Recommendation Engine currently has a top candidate.

It performs no arithmetic, invents no percentage, and imposes no calendar rule. It produces exactly **three** verdicts:

| Verdict | Condition | Real meaning |
|---|---|---|
| `practice-first` | No evidence at all | Nothing yet to test |
| `practice-first` | Evidence exists, but a specific known weak area exists | A mock would be less valuable than closing the known gap first |
| `first-mock-valuable` | Evidence exists, zero mocks attempted | A first mock would add genuinely new evidence |
| `mock-valuable` | Evidence is broad, no specific weak area flagged | A mock would add real, broad evidence |

(`practice-first` covers two distinct real conditions with the same verdict and different explanation text — both already implemented.)

## Mapping to the Founder's proposed five-state model

| Founder's proposed state | Backed by real evidence today? | Mapping |
|---|---|---|
| BUILDING FOUNDATIONS | Yes — `!hasAnyEvidence` | Maps directly to `practice-first` (no evidence) |
| KEEP PRACTISING | Yes — evidence exists, `topTriggerReason !== null` | Maps directly to `practice-first` (known gap) |
| NEARLY READY | **No** | No existing signal distinguishes "close to ready" from "not ready" — `hasAnyEvidence` is boolean, not a coverage fraction, and no partial-breadth threshold has ever been approved as an educational rule |
| READY FOR A MOCK | Yes — `first-mock-valuable` or `mock-valuable` | Both map to this one label; the underlying `explanation` text (already real, already distinct) carries the difference between "your first mock" and "another mock" |
| MOCK DUE | **No** | Would require a calendar/time-since-last-mock rule, which `assessMockReadiness()`'s own docstring explicitly states it deliberately does not implement. This is a different concept from the Educational Intelligence Engine's existing Maintenance Review signal (`isMaintenanceReviewDue()`, `lib/ali/durableMastery.ts`), which governs re-testing a specific already-mastered *competency* after a gap, not overall mock cadence — conflating the two would be a new, uninstructed educational rule, not a reuse of an existing one |

## Decision: implement three states today, not five

Per the mandate's own instruction ("If the complete five-state model is not yet authorised or technically available, implement only what current evidence supports and document the remaining requirement"), the Mock Centre's readiness card implements exactly the three real, already-approved verdicts:

- **Building foundations** (`practice-first`, no evidence)
- **Keep practising** (`practice-first`, known gap)
- **Ready for a mock** (`first-mock-valuable` or `mock-valuable`)

"Nearly ready" and "Mock due" are not implemented. No formula was invented to manufacture them.

## What would be required to add the two remaining states, for a future, separate Founder decision

- **Nearly ready**: would need a genuine, approved definition of partial coverage — e.g. a real fraction of competencies with at least Moderate confidence tier, compared against a real threshold — which does not exist today and would itself be a new educational rule requiring its own review, not something this transformation may introduce unilaterally.
- **Mock due**: would need an explicit, approved decision on whether mock cadence should be time-based (calendar gap since last mock) or evidence-based (e.g. a real volume of new competency evidence accumulated since the last mock), and how it should interact with — not be conflated with — the existing, distinct Maintenance Review signal.

## Wellbeing

`assessMockReadiness()` does not read the wellbeing veto signal (`vetoedCompetencyCodes`) today, and no existing approved rule ties wellbeing pacing to mock-readiness verdicts specifically (it currently governs Practice session composition and Family Choice only). This transformation does not add one — doing so would be a new educational algorithm, outside this mandate's authorisation. Where the Mock Centre surfaces wellbeing information, it reads the same real, existing signal already used elsewhere (`recommendations.vetoedCompetencyCodes`), never a new computation.

## Status

**MOCK READINESS: EVIDENCE-SAFE.** Three real states surfaced, zero invented. Two states explicitly deferred with their real requirements documented, not silently implemented.
