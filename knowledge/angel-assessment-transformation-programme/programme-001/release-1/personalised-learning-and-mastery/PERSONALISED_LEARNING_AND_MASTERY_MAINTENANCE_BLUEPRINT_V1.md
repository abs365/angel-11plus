# Personalised Learning and Mastery Maintenance Blueprint V1

**Programme:** Angel Assessment Transformation Execution Programme — Release 1
**Prepared:** 2026-08-11
**Status:** Design only. This is the top-level blueprint the other 8 deliverables sit under.

---

## 1. The Governing Loop

```
DIAGNOSE → RECOMMEND → CHOOSE/CONFIRM FOCUS → TEACH → PRACTISE →
ASSESS → REVIEW → MAINTAIN MASTERY → REBALANCE
```

Mapped directly onto real, already-existing mechanisms (`EXISTING_PLATFORM_CAPABILITY_REUSE_ASSESSMENT.md`):

| Stage | Real mechanism | Status |
|---|---|---|
| DIAGNOSE | `computeEducationalState()`, `getEducationalIntelligence()` | REUSE |
| RECOMMEND | `orchestrateRecommendations()` + `generateExplanation()` | REUSE |
| CHOOSE/CONFIRM FOCUS | *new* — the one genuinely missing link | See `FAMILY_CHOICE_AND_RECOMMENDED_FOCUS_MODEL_V1.md` |
| TEACH | Existing content delivery, competency-scoped (`generatePersonalisedSession()`) | REUSE, content depth varies by subject (Release 1's own Gap Analysis) |
| PRACTISE | `selectQuestions()` / `selectLearningUnit()` | REUSE |
| ASSESS | Mock/practice submission + `recordOutcome()` | REUSE |
| REVIEW | `processEvidenceForCompetency()`, `explainability.ts` | REUSE |
| MAINTAIN MASTERY | `evaluateDurableMastery()`, `isMaintenanceReviewDue()` | REUSE |
| REBALANCE | *new* — deciding when a maintained/secure area needs to re-enter active focus | Extends the escalation mechanism in the Family Choice Model |

**Central finding: 7 of 9 loop stages already exist as real, evidence-grounded mechanisms.** The work this Blueprint frames is narrower than "build a personalisation engine" — it is "add a choice-injection point and a rebalancing decision layer on top of an engine that already works."

## 2. Focus Without Forgetting (§7)

**Principle:** a selected focus increases *effort allocation* toward one area; it does not zero out attention to others. Mechanically, this maps onto two already-real levers working together:

1. **Within the focused area:** `weakSkills` override with its reserved-slot mechanism (Decision 17) gets the chosen competency, not just evidence-derived weak ones — more session time flows there.
2. **Outside the focused area:** the durable-mastery maintenance-review cycle (14-day gate, `isMaintenanceReviewDue()`) continues running regardless of what's focused — a secure competency due for review still surfaces a `"review-due"` trigger through the existing recommendation pipeline, at low frequency, not zero frequency.

**No fixed percentage is proposed**, per the governing instruction's explicit prohibition. The balance between focus-area session share and maintenance session share is a parameter to be tuned against real learner outcome data once any implementation exists — not invented here.

## 3. Rebalancing Triggers

Three conditions that should prompt Angel to surface a rebalancing conversation (not silently act):

1. **Escalation** — a non-focus competency's evidence crosses into urgent territory (see Family Choice Model §4).
2. **Focus achieved** — the chosen focus's evidenced state reaches `durably-mastered`/`mastered` in `computeEducationalState()`'s terms — a natural "what next?" moment, not an automatic re-focus.
3. **Stagnation** — repeated targeted teaching + practice cycles on the same dimension without evidenced improvement — this is a genuine new signal not currently computed anywhere; would need a new, small piece of evidence-tracking (compare `EducationalState` across sessions within one focus), flagged as MISSING, not fabricated as already existing.

## 4. Relationship to the Continuous Writing Excellence Model

Continuous Writing is the first subject this Blueprint's TEACH/PRACTISE/ASSESS distinction is applied to in full depth (companion document), precisely because it is the subject where evidence proved thinnest at the assessment layer — making it the right test case for "how far can Angel go on real evidence before it must flag a gap," not because Continuous Writing is architecturally special.

## 5. What Remains Genuinely New Work (Not Reuse)

1. Choice-injection into the recommendation/selection pipeline (small, precise — one new parameter path, not a new subsystem).
2. A "current focus" state with provenance (one new small table/state, one-row-per-profile shape, mirroring existing conventions).
3. An escalation/rebalancing decision layer sitting on top of the existing wellbeing-veto Tier-0 mechanism.
4. A real, server-side Mock Attempt Ledger (today localStorage-only) — needed for any of this to be reliable across devices, flagged as a pre-existing gap this work would inherit, not created by it.
5. A stagnation-detection signal (§3.3) — genuinely new, small.

None of these require a second architecture. All five sit as additions to the existing four-system evidence stack, per the Reuse Assessment's own governing finding.
