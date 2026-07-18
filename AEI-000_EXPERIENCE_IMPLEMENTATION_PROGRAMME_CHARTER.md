# AEI-000: Angel Experience Implementation Programme Charter

**Document ID:** AEI-000
**Role:** Chief Programme Architect
**Status:** Governing charter. Formally closes the Experience Transformation Programme (AXT) and establishes the Angel Experience Implementation Programme (AEI) as the executing programme for Angel Version 2.0.
**Effective on issuance of this charter, per its own commissioning:** `AXT-001_ANGEL_PLATFORM_INVENTORY.md`, `AXT-002_ANGEL_EXPERIENCE_BLUEPRINT.md`, `AXT-003_ANGEL_DESIGN_SYSTEM_V2.md`, and `AXT-004_ANGEL_EXPERIENCE_MIGRATION_STRATEGY.md` are **CLOSED** — their planning purpose is fulfilled; they remain permanently binding reference documents for AEI, not superseded or reopened.
**Inherits from:** `AEP-001`–`005` (Educational Constitution / Learning Science Constitution), `AIW-001`/`EAW-002`–`005` (Educational Architecture), the Competency Intelligence Platform (`lib/ali/*`), `docs/strategy/ANGEL_EXPERIENCE_MANIFESTO.md` and companions (Experience Constitution), and all four AXT documents above. Nothing in this charter revises any of them; where this charter restates a rule from one of them, the source document remains the authority if any drift is ever found.

---

## 1. Programme Purpose

Deliver Angel Version 2.0 exactly as `AXT-004`'s migration strategy defines it: connect the Competency Intelligence Platform's real, already-verified reasoning to the surfaces learners and parents actually use, consolidate the duplications `AXT-001` found, retire what `AXT-001` found genuinely orphaned, and bring every remaining Tier-1-only surface up to the Design System V2.0 standard — all without expanding educational scope, without redesigning the engine, and without inventing new pedagogy. AEI exists to make three already-approved documents (Blueprint, Design System, Migration Strategy) real, not to reinterpret them.

---

## 2. Programme Scope

**In scope:** everything `AXT-004`'s six Release Waves define (§9, below) — presentation-layer connection, consolidation, retirement, and redesign work across learner, parent, and administrator experiences.

**Explicitly out of scope, restating `APD-033` (Engine Before Experience) for this programme by name:**
- No change to `lib/ali/*`'s educational reasoning, thresholds, or algorithms.
- No new competency, pedagogical principle, or content taxonomy.
- No new educational content authoring (WP-22-style content review/disposition remains its own, separate, human-owned track).
- No database schema change originating from this programme — per `AXT-004` §14, any apparent need for one is a scope violation requiring a separate engine work package, not an AEI wave.

---

## 3. Success Definition

**Identical to `AXT-004` §15/§16, not reinvented:** AEI succeeds when the Experience Success Measures (five-beat completion, Invisible Intelligence compliance, anxiety-safe proxy, consolidation trend, time-to-first-action, parent-comprehension proxy) are met, and the Definition of Completion for Version 2.0 is independently verified, item by item — not scheduled, not "mostly done."

---

## 4. Programme Principles

1. **AXT Principle 001** — every learner interaction must contribute to learning, confidence, or motivation.
2. **AXT Principle 002** — Reuse Before Rebuild.
3. **Engine Before Experience (`APD-033`)** — remains true for the entire duration of AEI, not only during IWP-002.
4. **Educational Continuity, Evidence Before Presentation, One Experience Per Subject, Consolidate-never-duplicate** — `AXT-004` §2's four Transformation Principles, binding on every wave without exception.
5. **Independent Educational Approval (`APD-035`)** — any content or educational-facing decision AEI's work surfaces (e.g., what a redesigned Progress page implies about how mastery should be shown) still cannot be self-approved by whoever implements it.

---

## 5. Governance Model

**Continues, unmodified, the exact governance pattern this whole enterprise programme has used since AEP-001:** the Founder issues Programme Decisions (`APD-NNN`); the implementer executes, verifies, and reports; the Founder reviews and explicitly approves before the next step begins. AEI introduces one corrective addition, directly in response to a finding this programme made about itself:

**Every Programme Decision issued during AEI must be recorded into a consolidated, committed register in the same work session it is issued — not reconstructed later.** `ACR-001_CONSTITUTIONAL_READINESS_REVIEW.md` found that 11 of the 23 Programme Decisions issued across the entire IWP-002 wave (APD-033 through APD-055) were never transcribed into any durable document. AEI does not repeat this: each AEI wave's implementation report (§8) must append any new APD it received to a running `AEI_PROGRAMME_DECISIONS_REGISTER.md`, in the same commit as the work it governs.

---

## 6. Engineering Principles

Continues this programme's established engineering discipline, unmodified, applied to the experience layer:
- A throwaway verification script per change, run to completion, deleted before commit (the standing convention since WP-05).
- `tsc --noEmit` and `npm run build` clean before every commit.
- Every commit message states what changed, why, what was verified, and what judgement calls were made — the same standard this whole programme's commit history already holds itself to.
- **Additive-only, presentation-layer-only changes** — no AEI commit modifies `lib/ali/*`'s reasoning; a commit that appears to need to is out of scope (§2) and must be raised as a Programme Decision before proceeding, not quietly done.
- Reuse-first: before any new component is written, the implementer must confirm against `AXT-003` §9's Component Catalogue that nothing existing can be extended instead.

---

## 7. Educational Verification Model

Every AEI wave's work must pass `AXT-004` §9's Educational Verification Gates, in order, before it is presented for Founder review (§8) — these are a precondition to review, not a substitute for it:
1. Evidence Dominance / Explainability Purity held.
2. AEP-001 §4's prohibitions not violated.
3. Invisible Intelligence compliance, grep-verified (zero ALI vocabulary in any new/changed learner or parent-facing string).
4. The three-audience Explainability boundary held, with no fourth audience invented.
5. The full existing technical-verification discipline (§6) passed.

---

## 8. Founder Review Model

**Continues this programme's proven reporting cadence exactly**, extended across the experience track: each AEI wave produces the same eight-part implementation report already established for every WP in this programme (implementation summary, files changed, tests added, verification evidence, educational fidelity evidence, regression evidence, risks encountered, commit hash), plus a ninth part specific to AEI — **any new Programme Decision received during the wave, appended to the register per §5.** The Founder reviews and issues an explicit "APPROVED, Commit: [hash]" (or a correction) before the next wave begins, exactly as every prior work package in this programme has required.

---

## 9. Implementation Waves (AEI-001 to AEI-006)

Direct 1:1 mapping from `AXT-004` §6's Release Waves — full entry/exit gate detail lives there and is not duplicated here; this section is the formal naming and authorization record.

| AEI Wave | Corresponds to (`AXT-004` §6) | Focus |
|---|---|---|
| **AEI-001** | Wave X1 — Consistency Foundation | Extend `ReasoningSession`'s pattern toward the four static subjects; close the keyboard/focus-ring and unified error-state gaps `AXT-003` named. |
| **AEI-002** | Wave X2 — Legacy Retirement | Execute `AXT-004` §4's retirement table (`/mock-test`, the feedback-form consolidation). |
| **AEI-003** | Wave X3 — Competency Connection | Wire WP-19/WP-21A's real engine output into Parent Hub and Progress via `computeParentReport()`'s existing fields. |
| **AEI-004** | Wave X4 — Assessment Consolidation | Merge the mock-exam family, per pathway, per `AXT-004` §4's phased rule. |
| **AEI-005** | Wave X5 — Deep Redesign | Bring English, Maths, Vocabulary, Writing, the four Reasoning subjects, Progress, and Parent Hub to full Design System V2.0 treatment. |
| **AEI-006** | Wave X6 — Voice Expansion | Extend `PassagePlayer`'s real speech mechanism to Vocabulary and the Reasoning subjects. |

**Authorisation discipline, unchanged from every prior programme in this enterprise:** this charter authorises the wave *sequence*; it does not authorise AEI-002 through AEI-006 to begin work. Each wave requires its own explicit Founder authorisation when its turn arrives, exactly as WP-16 through WP-23 each required separately, even though IWP-002 named all of them up front.

---

## 10. Acceptance Gates

Each wave's Acceptance Gate is the conjunction of:
1. `AXT-004` §6's named exit gate for that wave.
2. §7's Educational Verification Model, passed in full.
3. §11's Release Governance rules, satisfied.
4. Explicit Founder sign-off (§8) — no wave is self-certified.

No wave may begin until the prior wave's Acceptance Gate has been passed, except where `AXT-004` §6 explicitly notes two waves may run in parallel (X1/X2, per no dependency existing between them).

---

## 11. Release Governance

Binding on every AEI release, restating `AXT-004` §7/§8 as this programme's release rules:
- No new feature-flag library or service — content/data-presence gating only, per the proven synthetic-fixture-fallback pattern.
- Every existing URL keeps working or receives a permanent redirect (`AXT-004` §4's retirement table is the only exception set, and every exception redirects).
- No breaking change to `UserProgress`'s shape without an additive migration path.
- No parent-facing computed metric's meaning changes without being classified as a Defect or Refinement per `APD-024`/`026`'s existing process, extended to experience-facing values.

---

## 12. Risk Management

**`AXT-004` §13's Risk Register is adopted as AEI's starting register and must be maintained as a living document, not a one-time list** — the same lesson `ACR-001` drew from the Programme Decisions gap applies equally here: a risk register only protects the programme if it is kept current in real time. Every AEI wave's implementation report (§8) must state whether any new risk was found during that wave and, if so, add it to the register in the same commit. The two risks `AXT-004` flagged as blocking Wave X3/AEI-003 specifically (git custody, unresolved production-migration state) remain open blockers on that wave's entry gate until independently confirmed closed.

---

## 13. Quality Assurance

- The full technical-verification discipline (§6) on every commit.
- **A standing, repeatable constitutional-compliance check** — the grep-based Invisible Intelligence audit (§7 item 3) and the subject-identity-table/component-catalogue consistency check (`AXT-003` §24) — run before every wave's Acceptance Gate, not only at programme completion.
- Route-count and bundle-size tracked wave-over-wave (`AXT-004` §12); a consolidation wave (AEI-002, AEI-004) must show a measurable route-count reduction, not a flat count, as objective evidence consolidation actually happened.

---

## 14. Completion Criteria

**Identical to `AXT-004` §16, adopted directly as AEI's own completion criteria:** every UPGRADE item at full Design System V2.0 treatment, every MERGE item consolidated to one experience, every RETIRE item gone or redirected, the Competency Intelligence Platform genuinely connected (not merely ready) to Parent Hub and Progress, a final zero-exception Invisible Intelligence and three-audience audit across the whole product, `ACR-001`'s five outstanding items confirmed closed, and every Founder Acceptance Gate across all six waves passed on the record.

---

## 15. Handover to Production

Once AEI-006's Acceptance Gate passes:
1. **A final, independent readiness review is conducted**, in the same spirit as `WP-23`'s production-migration review — confirming every §14 criterion holds, not assuming it from individual wave reports alone.
2. **Version 2.0 becomes the new production baseline** — from this point, ongoing maintenance of these surfaces follows this project's normal engineering practice, not AEI's heavier per-wave gate structure; the gate structure was proportionate to a six-wave transformation, not intended as a permanent operating overhead.
3. **This charter, all four AXT documents, and the AEI Programme Decisions Register remain permanent historical record** — none are deleted or superseded by the handover; they document how Version 2.0 came to be, for exactly the same reason `DESIGN_SYSTEM.md` was kept after `ANGEL_DESIGN_LANGUAGE.md` superseded it.
4. **Any future experience work beyond Version 2.0's scope is a new programme**, requiring its own charter — this document's authority ends at §14's criteria being met, not before and not beyond.

---

No screen was redesigned, no implementation code was written, and no engineering task was created to produce this charter. It governs all implementation work leading to Angel Version 2.0, from AEI-001 through handover.
