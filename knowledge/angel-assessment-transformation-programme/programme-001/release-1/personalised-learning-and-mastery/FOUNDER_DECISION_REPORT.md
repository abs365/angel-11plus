# Founder Decision Report — Personalised Learning and Mastery Maintenance

**Programme:** Angel Assessment Transformation Execution Programme — Release 1
**Prepared:** 2026-08-11
**Status:** Investigation and design complete. Nothing implemented. Answers below are direct, per instruction.

---

### A. Can existing Angel architecture support this model?

**Yes, substantially.** The codebase already runs a real, evidence-rigorous engine (`computeEducationalState()`, `orchestrateRecommendations()`, `generateExplanation()`, durable mastery, wellbeing veto) that does most of what DIAGNOSE → RECOMMEND → TEACH → PRACTISE → ASSESS → REVIEW → MAINTAIN already requires. The one governing-outcome stage this architecture does not yet support is CHOOSE/CONFIRM FOCUS — nothing today lets a human choice enter the pipeline.

### B. What can be reused?

Evidence computation, recommendation ranking, explainability, durable mastery/maintenance-review, wellbeing veto, question selection/cooldown, and the real Founder-Validation-proven evidence-recording chain. See `EXISTING_PLATFORM_CAPABILITY_REUSE_ASSESSMENT.md` for the full, file-cited table.

### C. What requires strengthening?

The Mock Attempt Ledger (currently localStorage-only despite its name), the revision planner (currently a pure evidence-only slice with no override capability), and Continuous Writing content depth (`QT-WC-01b` has zero real content).

### D. What genuinely does not exist?

A choice-injection point into the recommendation/selection pipeline; a "current focus" state with provenance; an escalation/rebalancing decision layer; a stagnation-detection signal; and — separately — an Assessment Brain Question Type mapping for WC-02 (a content-model gap, not an engineering one).

### E. Is Continuous Writing evidence sufficient for implementation?

**Partially, and the split matters.** The *task* (2-prompt structure, timing, dual-genre pattern, double-marking and moderation) is STABLE-PATTERN evidenced across all 3 held years — sufficient to build authentic teaching and practice content now. The *marking/scoring* layer is not — the only rubric is undated, has a blank Grammar criterion for 3 of 4 bands, and never states how it maps onto the numeric mark totals. Building a CSSE-equivalent score today would mean inventing what the evidence doesn't provide. See `CONTINUOUS_WRITING_EVIDENCE_REVIEW_V1.md`.

### F. What must remain blocked?

WC-02 (no Question Type exists for it — a frozen-architecture question, not this increment's to resolve), any new Continuous Writing scoring model, mass content authoring, production Mock changes, and GL/CEM/ISEB work. See `IMPLEMENTATION_DEPENDENCY_AND_GATE_REPORT.md` §2.

### G. How will Angel recommend a priority while preserving family choice?

The existing `orchestrateRecommendations()` output remains the "Angel Recommended Focus" (Mode A) unchanged. Family choice (Mode B) is a new, separate input that — when present — takes precedence in what gets shown, while the recommendation continues to compute and surface in the background as the material for the recommendation-vs-choice conversation (§G/§H below), never silently overriding, never silently suppressed.

### H. How can a parent deliberately choose Continuous Writing even when Angel recommends something else?

Because the choice-injection point (§D) sits *alongside*, not *inside*, the evidence-ranking logic — a family selection populates the same `weakSkills` mechanism the evidence engine already uses, with `family-selected` provenance recorded explicitly so it is never mistaken for or presented as an Angel diagnosis.

### I. How will Angel focus heavily on that choice without allowing secure skills to decay?

The durable-mastery maintenance-review mechanism (14-day evidence-gated review cycle) runs continuously and independently of whatever is currently focused. The design rule established in `ASSESSMENT_TO_LEARNING_CLOSED_LOOP_DESIGN.md` §5 is explicit: a focus may **deweight** review-due candidates, it must never **exclude** them entirely.

### J. How will conflicting system recommendation and family choice be handled?

An escalation check, designed as a sibling addition to the existing Tier-0 wellbeing-veto mechanism (same call site, same authority level), surfaces the conflict rather than resolving it silently. The family is offered a bounded set of explicit choices (keep / add / switch / return to balanced) and Angel does not act until they decide. See `FAMILY_CHOICE_AND_RECOMMENDED_FOCUS_MODEL_V1.md` §4.

### K. Should Angel support one or multiple simultaneous focus areas?

**Recommended: one primary plus up to two secondary areas, everything else on maintenance** — a design recommendation grounded in how the existing reserved-slot/priority-weighting mechanisms already behave (they degrade in meaning if spread across too many simultaneous priorities), not asserted as evidence-backed fact. Explicitly flagged as the first thing to validate against real learner data, not adopted as final. See Family Choice Model §3.

### L. What is the smallest sensible implementation increment?

Build the choice-injection point and provenance state only, for a single competency, in a controlled non-production surface — mirroring this Release's own Founder Validation Assessment pattern (isolated, evidence-provable, Founder-only). Full detail and rationale in `IMPLEMENTATION_DEPENDENCY_AND_GATE_REPORT.md` §4.

### M. Does anything require changing a frozen Foundation document?

**One case only: Assessment Brain V1 needs a Question Type mapping for WC-02 before that competency can have any content or assessment.** No other frozen document (Learning Engine V1, Educational Intelligence Engine V1) requires modification — every mechanism this investigation relies on already operates within their current, documented scope.

### N. Does this alter the current CSSE Assessment Transformation sequence?

**No.** This is a parallel, separately-gated design thread. Release 1's content-authoring work continues unaffected and does not need to wait for this thread, and this thread's smallest increment (§L) does not need to wait for Release 1 to finish.

---

## Recommendation

Proceed to Founder review of all nine deliverables. If approved for further work, the smallest sensible next step is the single-competency, controlled-surface choice-injection pilot described in §L — not a broader personalisation build, and not Continuous Writing content authoring, both of which remain appropriately gated behind evidence and Founder decisions this report has surfaced but not made.

Stopping here, as instructed.
