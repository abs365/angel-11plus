# Parent and Learner Personalisation Experience Blueprint

**Programme:** Angel Assessment Transformation Execution Programme — Release 1
**Prepared:** 2026-08-11
**Status:** Design only. No UI copy is authorised by this document — illustrative wording only, per instruction.

---

## 1. Parent Experience — What Must Be Understandable (§13)

| Requirement | Real data source it would draw from |
|---|---|
| Current preparation mode | New "current focus" state (Family Choice Model §2) |
| Angel's recommended priority | `orchestrateRecommendations()` output — already real |
| Why Angel recommends it | `generateExplanation(..., "parent")` — already real, already audience-aware |
| Current parent/learner-selected focus | Same new state, `family-selected` provenance |
| Specific weaknesses within that focus | `computeEducationalState()` applied within the chosen subject's competency set (Family Choice Model §5) |
| What Angel is teaching / practising | Excellence Model stage the learner is currently in (Teaching vs. Practice, kept visibly distinct per instruction) |
| What secure areas are being maintained | `evaluateDurableMastery()` + review-due list — already real |
| Whether the focus area is improving | Dimension-level delta across attempts (Excellence Model §3, Reassessment stage) |
| Whether another area now needs attention | Escalation check (Closed-Loop Design §4) |
| What happens next | The four-choice decision point (Family Choice Model §4) |

**"Avoid engine terminology"** — every row above already has a real `generateExplanation()`-style parent-facing translation precedent to build from; this is a continuation of an existing discipline (the module explicitly documents itself as generating no new reasoning, only translating already-computed facts), not a new writing task invented from nothing.

## 2. Learner Experience — Actions, Not a Dashboard (§14)

Five illustrative action categories (wording not authorised, structure is):

1. **Today's focus** — one clear statement of what the current session is about, sourced from the current-focus state, not a raw competency code.
2. **Focused learning** — the Teaching stage, when active.
3. **Targeted practice** — the Practice stage.
4. **Mastery maintenance** — the low-frequency review-due sessions, framed as "keeping X sharp," not "you might be forgetting X" (matching the wellbeing-aware, non-coercive tone the existing `explainability.ts` learner-text already uses — e.g. `"mastered"` → "You've got this one down — nice work!").
5. **Progress check** — the Reassessment stage, framed around the dimension-level delta, not a bare score.

## 3. The Choose/Confirm Focus Moment — Design, Not Copy

This is the one genuinely new interaction in the whole loop. Design requirements, not wording:

- Must show the Angel-recommended option AND allow deliberate deviation in the same moment — never force a choice screen that only offers the recommendation.
- Must make the consequence of each choice understandable before confirming (§12: "make consequences understandable without coercion") — e.g. what happens to maintenance of other areas, stated plainly, not buried.
- Must be revisitable — changing or ending a focus must be at least as easy as starting one (§12: "families must be able to change or end a selected focus").

## 4. Protections Against the Failure Modes Named in §12

| Failure mode | Design response |
|---|---|
| Endless remediation | Stagnation trigger (Blueprint §3.3) surfaces a "this isn't working, try something different" moment rather than looping silently |
| Repetitive failure | Already covered by the existing wellbeing veto's compounding-failure condition (§8 of Reuse Assessment) — reused, not rebuilt |
| Excessive workload | Session-size caps already exist (`sessionSize` per practice area, `PLAN_ITEM_CAP` on the revision planner) — the choice-injection point must respect these existing caps, not bypass them |
| False weakness/mastery classification | Already mitigated by `validateCompetencyMastery()`'s confidence-gate — reused |
| Over-practice | Cooldown mechanism (`COOLDOWN_QUESTIONS`) already prevents question repetition; a focus increases *priority*, not an unbounded repeat loop |
| Focus becoming permanent by accident | Provenance model (Family Choice Model §2) + the revisit requirement above — a focus never expires implicitly, but is always visibly changeable |
| Repeated nagging after an informed choice | The "already asked and decided" marker flagged as required in Family Choice Model §4 |
| Secure skills abandoned | Maintenance-review mechanism runs continuously and cannot be fully excluded (Closed-Loop Design §5) |

## 5. Explicit Non-Authorisation

No screen, no exact copy, no visual design is specified or approved by this document — it defines what must be *true* of the experience, leaving *how it looks* to a later, separately-scoped UX phase.
