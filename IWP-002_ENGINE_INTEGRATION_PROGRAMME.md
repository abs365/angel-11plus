# IWP-002: Engine Integration Programme

**Document ID:** IWP-002
**Programme:** Angel Excellence Programme — Implementation Planning (Document 2)
**Status:** DRAFT — awaiting Founder review and approval
**Project:** Angel 11+
**Owner:** ELBOLD
**Last Updated:** 2026-07-18
**Governs:** the transition from `IWP-001`'s verified-but-unwired component library (`IWP-001_IMPLEMENTATION_COMPLETION_REPORT.md` §8) into a real, operational engine.

**Purpose:** Make the engine `IWP-001` built and verified — Confidence Processing, Mastery Validation, Durable Mastery, Educational State, Recommendation Orchestration, Explainability, Audit/Operational Events — actually operate against real data, in the real application. **This programme does not expand educational scope.** No new competency, no new pedagogical principle, no new learner-facing feature concept is introduced here — everything in this plan makes an already-approved capability real, or disposes of an already-produced proposal.

**Governing principle (Programme Decision APD-033, Engine Before Experience):** every wave in this plan is ordered so the engine is stabilised before any deferred learner-facing experience is built on top of it. The two deferred, already-designed learner-facing items (GAP-002, GAP-003) are deliberately sequenced last, not first, for exactly this reason.

---

## 1. Work Package Catalogue

| ID | Work package | Category | Objective (per APD-033's 7) |
|---|---|---|---|
| WP-16 | Persistence Layer — migrations for Durable Mastery, Educational Audit, Operational Event tables, matching the existing TypeScript types (`types/ali/durableMastery.ts`, `types/ali/audit.ts`, `types/ali/operationalEvent.ts`) exactly — no new design | Schema | 1. Persistence |
| WP-17 | Confidence & Mastery Runtime Integration — real data-fetch layer feeding WP-05/WP-06's pure functions from real `ali_student_question_history`/`ali_question_bank` rows, aggregated per competency | Engine runtime | 2. Runtime integration |
| WP-18 | Durable Mastery & Educational State Runtime Integration — wires WP-07/WP-08 using WP-17's real aggregated data; implements the Maintenance Review scheduling trigger | Engine runtime | 2. Runtime integration |
| WP-19 | Recommendation Orchestration Runtime Integration — wires WP-09/WP-10 into the real Daily Mission generation path | Engine runtime | 2. Runtime integration |
| WP-20 | Knowledge Graph Data Authoring — the real, queryable `CompetencyRelationship` data (`AIW-001` §2), replacing AEP-002 §10's narrative tables | Content authoring (human-owned) | 3. Knowledge Graph integration |
| WP-21 | Wellbeing Signal Design & Implementation — the genuinely new design surface AEP-005 §13 left unspecified beyond "never a score" | Design + engine | 4. Wellbeing model |
| WP-22 | Pending Content Review & Disposition — human review of WP-02's 120-question tagging and WP-15's 6 Probability questions; import whatever is approved | Content review (human-owned) | 5. Educational content approval |
| WP-23 | Production Migration — apply migration 009 and WP-16's new migrations to the live Supabase database | Operational (Founder-executed) | 6. Production migration |
| WP-24 | Mock Exam Bank Realignment (GAP-002) | Content + engine (learner-facing) | 7. Previously designed deferred capabilities |
| WP-25 | Baseline Assessment Build (GAP-003) | Learner-facing feature | 7. Previously designed deferred capabilities |

---

## 2. Dependency Graph

**Critical path:** WP-16 → WP-17 → WP-18 → WP-19. WP-19 additionally depends on **WP-21** (see §4's explicit safety gate — this is not a scheduling convenience, it is a deliberate dependency).

**Independent tracks:** WP-20 (content authoring) and WP-21 (design + implementation) run independently of the WP-16→18 critical path and of each other. WP-22 (content review) is fully independent of everything else. WP-23 depends on WP-16 being locally verified (and on migration 009 from `IWP-001`, already file-ready).

**Deliberately last:** WP-24 and WP-25 depend on nothing in this programme technically, but are sequenced last per APD-033 — they are the "significant learner-facing experiences" the principle explicitly says should wait for the engine to stabilise first.

---

## 3. Delivery Waves

- **Wave F — Persistence Foundation:** WP-16 alone. Nothing in Wave G begins until this is verified.
- **Wave G — Engine Runtime Core:** WP-17, WP-18.
- **Wave H — Safety & Graph (parallel, independent of Wave G):** WP-20, WP-21.
- **Wave I — Orchestration Integration:** WP-19. Gated on **both** Wave G and Wave H's WP-21 — see §4.
- **Parallel, fully independent of all waves above:** WP-22 (content review), WP-23 (production migration, once WP-16 is locally verified).
- **Wave J — Deferred Learner-Facing (last, per Engine Before Experience):** WP-24, WP-25.

---

## 4. Technical Risk Assessment

- **The Wellbeing gate risk, named explicitly, not left implicit:** WP-09's Tier 0 (`EAW-004` §5) is the architecture's non-negotiable safety ceiling. If WP-19 (Recommendation Orchestration Runtime Integration) were sequenced before WP-21 (Wellbeing), it would necessarily ship with a placeholder Tier 0 predicate (e.g. "never veto") — live, real recommendations flowing to real families with no actual wellbeing protection behind the mechanism that exists specifically to provide it. This programme's dependency graph makes WP-19 depend on WP-21 for exactly this reason. **If schedule pressure ever suggests decoupling this dependency, that decision must return to a formal programme decision (per the standing freeze discipline), not be made silently by an implementer.**
- **Schema-cache staleness** — restated from every prior migration in this project's history (`ALI_OPERATIONAL_VALIDATION.md` Phase 5B.8); WP-16 and WP-23 must both include an explicit reload-and-verify step.
- **Aggregation performance at real data volume** — WP-17's per-competency aggregation (summing across potentially many questions per competency) has only been tested against synthetic data so far; should be checked against realistic volume before Wave G exits.
- **Sandbox network limitation, unchanged** — WP-23 remains Founder-executed via the Supabase Dashboard SQL Editor, the same standing limitation documented since this project's earliest ALI migrations.

---

## 5. Educational Risk Assessment

- **Knowledge Graph authoring (WP-20) is a human-judgment content task**, in the same category as WP-02's tagging and WP-15's question authoring — relationship edges require real pedagogical judgement about which competencies genuinely share a mechanism, not a mechanical derivation. Recommend the same PROPOSED — PENDING HUMAN REVIEW pattern used for WP-02/WP-15, not a unilateral authoring pass.
- **Content approval (WP-22) cannot be self-approved** — WP-02 and WP-15's proposals were authored by the same process now being asked to review them. This work package's role is to prepare a clean import path and surface the proposals for a genuine, independent Founder decision, not to approve its own prior output.
- **Wellbeing signal design (WP-21) is the single highest-stakes design decision in this entire programme** — it is the concrete mechanism behind AEP-001's Educational Safety Principle (§2.10, constitutional). Recommend this be treated as its own Founder Decision Point before implementation begins, not folded silently into general engineering work.

---

## 6. Testing Strategy

Continues this project's established, real (not merely typed) verification precedent unchanged: `npx tsx` scenario scripts for every new pure-function boundary, `tsc --noEmit` and `npm run build` for every change, and — new for this programme, since it introduces real I/O for the first time across most of these components — a genuine round-trip check (write via the new migration, read back via the real Supabase client, confirm the value matches) wherever this sandbox's network access allows it; where it doesn't, the same honest "cannot verify live, flagged not glossed over" discipline this project has used since Slice 1's Supabase-unreachable validation.

---

## 7. Verification Gates

- **Wave F exit gate:** WP-16's three new tables confirmed created, RLS posture explicitly decided (not defaulted) for each, schema-cache reload confirmed.
- **Wave G exit gate:** WP-17/WP-18 produce identical Confidence/Mastery/Durable/State results from real data as the existing pure functions produce from equivalent synthetic data — a direct regression check between the two.
- **Wave H exit gate (WP-21 specifically):** the Wellbeing signal's design is reviewed against AEP-001 §2.9/§2.10 and AEP-005 §13 before any implementation of it ships — this is the one gate in this whole programme that should not be treated as a routine technical check.
- **Wave I exit gate:** the adversarial-style verification WP-04 already proved for pathway leakage is repeated for wellbeing — a synthetic scenario deliberately constructed to maximise pressure toward a vetoed recommendation, confirming Tier 0 genuinely holds against real orchestration output, not only against the pure function in isolation.

---

## 8. Release Strategy

Unchanged from `IWP-001` §8: every component ships internally computed first, surfaced later. WP-17/18/19 should be verifiable against real (or realistically seeded) data before any of their output reaches a real recommendation surface a family sees. WP-24/WP-25, as genuine learner-facing releases, should follow this project's existing structural-isolation precedent (new routes, not modifications to existing ones, mirroring how the four adaptive routes originally shipped) rather than modifying a live route in place.

---

## 9. Success Metrics

Consistent with `IWP-001` §9's rejection of volume-based vanity metrics:

- **Zero wellbeing-veto bypass incidents** in production, once WP-19/WP-21 ship — the direct analogue of WP-04's "zero cross-pathway leakage" metric, and arguably the single most important number this programme should ever report.
- **Proportion of Confidence/Mastery/Durable Mastery conclusions computed from real vs. synthetic data** — the concrete measure of "is the engine actually operating," not just "does the engine exist."
- **Time from real evidence to a durable-mastery-eligible Maintenance Review actually firing** — the first genuine end-to-end proof this architecture's central promise (evidence-based, revisable, not permanent) works outside a test script.

---

## 10. Implementation Governance

All standing discipline from `IWP-001` continues unchanged: the freeze (defect correction, new evidence, or a formal programme decision required for any change to frozen architecture), per-wave readiness checks, and the Architectural Self-Consistency Review at the start of every work package. One addition specific to this programme: **WP-21's Wellbeing design must not begin implementation until its design has been explicitly reviewed and approved as its own step** — the one place in this entire plan where "engineering-ready" and "approved" are deliberately not the same gate.

---

No production code, migration, or implementation is created by this document. It is delivered for Founder review and approval before any IWP-002 work package begins.
