# Release 1 — Founder Decision Pack

**Programme:** Angel Assessment Transformation Execution Programme — Release 1 (Question Bank and Assessment Authenticity)
**Status:** Decisions recorded 2026-08-10 (Gates 1/2/4/5 Approved, Gate 3 Deferred) — see the "Recorded 2026-08-10" note under the gates table below for the exact instruction this was transcribed from. Originally left blank per this repository's standing rule never to infer a Founder decision; recorded only once given explicitly, never inferred.
**Prepared:** 2026-08-05
**Purpose:** the compact, decision-oriented summary of `RELEASE_1_IMPLEMENTATION_BLUEPRINT.md`, `RELEASE_1_GAP_ANALYSIS.md`, and `RELEASE_1_VALIDATION_STRATEGY.md` — read this first; consult the other 3 for full detail.

---

## What Requires Transformation

**Content:** 15 of 27 official CSSE Question Types have zero content in Angel's question pool today; a further 3 have only a single, self-disclosed approximate-fit item. Of the current 18 items, 6 carry a disclosed forced fit or scoring-format weakness, and **none — zero of 18 — has ever been reviewed by a qualified educational reviewer.**

**Timing:** the current mock/timed-practice session runs all three subjects under one undivided ~46-minute countdown. The real CSSE exam is two separate papers — English (70 min, internally sectioned) and Mathematics (60 min) — and Angel's current model does not reflect this.

## Why

This is the direct, evidenced cause of the Founder Field Evidence that triggered the whole Assessment Excellence Programme (a capable child completing the mock in under 5 minutes at 100%), confirmed independently by Phase 4's direct code inspection and now analysed in full detail in `RELEASE_1_GAP_ANALYSIS.md`. A further, newly-surfaced finding: even where content exists, most covered competencies have evidence in only one Question-Type format, which structurally caps a learner's achievable Evidence Tier at ET-2 under Learning Engine V1's own model — a second, independent reason the current pool cannot support genuine readiness assessment, beyond the raw coverage-count gap already known.

## How Transformation Will Occur (Strategy, Not Execution)

- **Sequencing:** author toward Assessment Brain V1's own best-evidenced, currently-unaddressed gaps first (6 HIGH/EMC-4 Question Types with zero content today), not toward whatever existing Angel content happens to fit — the opposite of how the current 18-item pool was built.
- **Discipline:** a formal "no forced fit" rule — no future item may be tagged to a Question Type on a "closest available match" basis, the practice responsible for 6 of the current pool's 18 items being flagged weak.
- **Difficulty:** calibrated against the 17 real CSSE exam papers already held (KA-001, 2021-2023 Entry), not an invented scale — resolving, as a named pre-step, the current pool's own internal inconsistency (two different, unmapped difficulty vocabularies coexisting in the same table).
- **Timing:** replace the single combined countdown with a paper-and-section-budgeted model matching Assessment Brain V1 §2 exactly.

Full detail: `RELEASE_1_IMPLEMENTATION_BLUEPRINT.md` §9-§12.

## How Authenticity Will Be Validated

A 7-part validation strategy (`RELEASE_1_VALIDATION_STRATEGY.md`): Educational (content-fit, by a reviewer who did not author the item), Technical (schema/scoring/regression), Trust and Explainability (no forced-fit item presented as equivalent to a clean one), Wellbeing Protection (no anxiety-inducing framing in the new timed structure), Founder Validation (5 named gates below, tracked individually), Pilot Validation (small-scale real-user test before wider release), Production Validation (ongoing, via the existing Assessment Coverage panel). No stage may be self-certified by whoever authored the content.

## How Platform Capability Will Be Preserved

Every reused capability is named explicitly in `RELEASE_1_IMPLEMENTATION_BLUEPRINT.md` §5: the `ali_question_bank` schema and tagging convention, the Assessment Coverage panel, the one-pool-many-surfaces routing architecture, `buildAdaptivePaper()`'s entire selection logic, the evidence pipeline, the Mock Attempt Ledger, the exam-mode rendering shell, and the existing grading functions. None is redesigned — the strategy fills and re-times what already exists; it does not propose new engines, new persistence, or new architecture anywhere.

---

## The 5 Founder Validation Gates — Decisions Required

Per `RELEASE_1_IMPLEMENTATION_BLUEPRINT.md` §15. Each is independent — approving one does not imply approval of another.

**Recorded 2026-08-10, per explicit Founder Gate Clarification instruction.** Release-level approval of the overall Release 1 mandate does **not** constitute blanket approval of all five gates below — each was decided individually, and the deferred gate is not overridden by the release-level "Founder Approved" status. This instruction was explicit: *"Do not interpret 'Release 1 Founder Approved' as permission to override a deferred individual gate."*

### Gate 1 — Authoring Sequence
Approve the 4-tier priority order (§9 of the Blueprint): close the 6 HIGH/EMC-4 unattempted gaps first, then remaining unattempted gaps, then remediate the 6 existing weak items, then the 3 structurally-hard gaps last.
**Founder Decision:** ✅ **Approved** (2026-08-10)

### Gate 2 — "No Forced Fit" Policy
Approve the binding rule that no future item may be tagged on a "closest match" basis, and decide whether the 6 existing weak items are remediated, retired, or left flagged as-is in the interim.
**Founder Decision:** ✅ **Approved** (2026-08-10)

### Gate 3 — Applied Reasoning (AR-01) Content Authoring
Explicitly separate from Gates 1-2 — AR-01 authoring remains gated on AEP4-C04's resolution (acquisition of a 2024+ English exam paper, not yet held). Approving general Release 1 work does **not** imply approval to author AR-01 content ahead of that.
**Founder Decision:** ⏸ **Deferred** (2026-08-10). **Explicit constraint, not a default status:** do not author, remap, infer, remove, redesign, or otherwise change Applied Reasoning / AR-01 content based on an unresolved evidence question. Release 0 already established that the CSSE Information Guides (2025 and 2026 Entry editions) cannot resolve whether Applied Reasoning still exists as an English-paper component post-September-2024 — see `RELEASE_0_EXECUTION_REPORT.md` Item 1. An authentic 2024+ CSSE English exam paper is still required before this gate can be revisited. AR-01 remains outside authorised Release 1 implementation until that evidence is acquired and this specific gate is separately approved.

### Gate 4 — Difficulty Calibration Source
Approve the 17 held KA-001 exam papers as the reference standard for future difficulty calibration, and approve resolving the current two-vocabulary inconsistency as a pre-step.
**Founder Decision:** ✅ **Approved** (2026-08-10)

### Gate 5 — Timing Strategy
Approve the paper-and-section-budgeted timing model as the design target, before any engineering work begins on it (a further, later gate per the Roadmap's Wave 1→2 sequencing governs the engineering work itself).
**Founder Decision:** ✅ **Approved** (2026-08-10)

**Net effect on Release 1 execution scope:** work is authorised only under Gates 1, 2, 4, and 5. Gate 3 (AR-01) is excluded from this execution phase in its entirety — no increment derived from this Decision Pack may touch Applied Reasoning content, tagging, or evidence-gap resolution.

---

## What This Pack Does Not Do

This pack does not author content, does not estimate how many questions any tier requires, does not change any timing code, and does not itself authorise any engineering work. Per the governing instruction, no educational implementation is authorised during this phase — approval of some or all of the 5 gates above would authorise a **future, separately-scoped execution phase**, not immediate content authoring under this document.
