# IWP-001: Implementation Work Package Strategy

**Document ID:** IWP-001
**Programme:** Angel Excellence Programme — Implementation Planning (Document 1)
**Status:** DRAFT — awaiting Founder review and approval
**Project:** Angel 11+
**Owner:** ELBOLD
**Last Updated:** 2026-07-18
**Governs:** the transition from Angel Foundation Version 1.0 (frozen APD-015: `AEP-001`–`005`, `ARR-001`, `AIW-001`, `EAW-002`–`005`, `ERR-001`, `EAW-ERR-HOTFIX-001`) into sequenced implementation.

**Purpose:** Translate 12 documents of approved architecture into a sequenced, dependency-aware implementation programme — what gets built, in what order, against what risks, verified how, released how, and measured by what. **No production code is written here.** This document is a plan, not an implementation.

**Standing constraint carried into every section below:** per `EAW-005` §9's Release Readiness Criteria, any deviation discovered during implementation from the frozen Version 1.0 architecture returns to a formal programme decision — this plan sequences work, it does not pre-authorise silent architectural change.

---

## 1. Work Package Catalogue

| ID | Work package | Category | Source |
|---|---|---|---|
| WP-01 | Extend `QUESTION_AUTHORING_STANDARD.md` with NVR/Spatial/Mathematical Reasoning taxonomy sections (mirroring existing §3/§11) | Content standard | AEP-002 §2.3–2.5, ERR-001-clear |
| WP-02 | Hand-tag 119 real NVR/Spatial/Mathematical Reasoning questions against WP-01's taxonomy | Content authoring | AEP-002 §2.3–2.5 |
| WP-03 | Question metadata schema extension — `addresses_misconception`, `transfer_links`, `pathway` value-set extension (6 pathways) | Schema | AEP-003 §4/§7/§8, `AIW-001` §4/§11 |
| WP-04 | **Pathway Eligibility Filter (Stage 0)** — structural exclusion of out-of-pathway domains before candidate generation | Engine component | `EAW-002` §4 (post-hotfix), resolves AEP-002 Real Gap #5 |
| WP-05 | Confidence Processing — derived Evidence Confidence tier computation | Engine component | AEP-005 §6, `EAW-002` §6 |
| WP-06 | Mastery Validation gate — threshold + Confidence-tier combined check | Engine component | AEP-005 §9, `EAW-003` §6 |
| WP-07 | Durable Mastery Processing + Maintenance Review scheduling | Engine component | AEP-004 §9, AEP-005 §10, `EAW-002` §8 |
| WP-08 | Educational State Coordination (8-state internal model) | Engine component | `EAW-004` §3 |
| WP-09 | Recommendation Orchestration + Prioritisation (Tiers 0–3), including `target_exam_date` capture | Engine + minimal UI | `EAW-004` §2.1/§4/§5 (post-hotfix) |
| WP-10 | Explainability Model — three-audience tiering (Learner/Parent/Engineering-Audit) | Engine + copy | `EAW-002` §5, `EAW-003` §8 |
| WP-11 | Educational Audit Integration + Operational Events (with retention strategy) | Cross-cutting infrastructure | `EAW-002` §9, `EAW-003` §10 (post-hotfix) |
| WP-12 | Parent Reporting extensions — `durablyMastered`, `recommendationExplanation`, `wellbeingSignal` | UI + copy | `AIW-001` §9, AEP-004 §12, AEP-005 §12 |
| WP-13 | Baseline Assessment — confirm real absence, then design if genuinely missing | Investigation + possible build | AEP-004 §4 (flagged, not code-verified) |
| WP-14 | Per-pathway mock exam format variants (CEM sub-sections, ISEB within-session adaptivity) | Large content/engine effort | AEP-002 Real Gap #6, largest single item in the whole programme |
| WP-15 | Probability content authoring | Content authoring | `CURRICULUM_GAP_REGISTER.md` GAP-001 |

---

## 2. Dependency Graph

**Critical path:** WP-03 → WP-04 → WP-05 → WP-06 → WP-07 → WP-08 → WP-09 → WP-10 → WP-12.

**Parallel, independent tracks:** WP-01 → WP-02 (content track); WP-13 (investigation, no dependency); WP-14 (large, independent, deliberately deferred — see §3); WP-15 (content, independent). WP-11 is cross-cutting — implemented incrementally alongside WP-05 through WP-09, not as a single discrete step, since every one of those components needs to write to it as it ships.

**The single most important dependency in this graph:** WP-09 (Recommendation Orchestration) must not begin until WP-04 (Pathway Eligibility Filter) is built and verified — this is the direct, concrete carry-forward of the exact condition `ERR-001`/APD-013 attached to Recommendation Engine implementation, now expressed as a work-package dependency rather than a standing caveat.

---

## 3. Delivery Waves

Grouped to respect §2's dependency graph and `EAW-005` §4's "one component at a time" implementation principle:

- **Wave A — Foundation:** WP-03, WP-04, WP-13. Nothing downstream begins until WP-04 is verified.
- **Wave B — Evidence Core:** WP-05, WP-06.
- **Wave C — Durability:** WP-07, WP-08.
- **Wave D — Recommendation:** WP-09, WP-10. Gated on Wave A's WP-04 per §2.
- **Wave E — Reporting & Audit:** WP-11 (ongoing since Wave B), WP-12.
- **Parallel content track (runs throughout, independent of Waves A–E):** WP-01 → WP-02, WP-15.
- **Deferred, recommended as its own future programme, not part of this sequence:** WP-14 — per `ARR-001` §11's own recommendation, its scope (per-board mock format variants) is large enough to warrant separate programme treatment rather than folding into this implementation wave.

---

## 4. Technical Risk Assessment

- **Schema-cache staleness after DDL changes** — a real, documented precedent in this project (`ALI_OPERATIONAL_VALIDATION.md`, Phase 5B.8); every migration in WP-03/WP-07/WP-11 must include an explicit reload-and-verify step (`AIW-001` §11, `EAW-005` §5).
- **Knowledge Graph traversal performance at 63-competency scale** — flagged by `EAW-002` §10; WP-09's supplementary-candidate computation must be bounded or cached, verified under realistic load before Wave D exits.
- **Real-time/batch boundary discipline** — WP-05/WP-06 (Mastery/Confidence) must stay on the synchronous session path; WP-07/WP-08/WP-11 must stay off it. A regression here would violate a constraint every engineering document in this wave has held consistently.
- **Operational Event volume growth** — mitigated by the retention strategy defined in the hotfix (`EAW-003` §10), but WP-11 should confirm the rollup mechanism actually executes on schedule once real usage begins, not just that it is designed correctly.

---

## 5. Educational Risk Assessment

- **Invisible Intelligence leakage** — the single highest-named risk across this entire programme (`ARR-001` §9). WP-10 (Explainability, three-audience tiering) is the component most exposed to this risk; its Learner- and Parent-tier outputs must be reviewed specifically for mechanism leakage before release, not assumed correct because the Engineering-Audit tier is complete.
- **Overclaiming (Trust dimension)** — WP-12's parent-facing copy must be checked against Evidence Confidence tiers at implementation time, not only at design time, per `EAW-005` §3 item 4's language-audit method.
- **Wellbeing ceiling bypass under exam-proximity pressure** — WP-09's Tier 3 reweighting is the component most exposed; `EAW-005` §3 item 5's adversarial scenario testing is not optional for this work package specifically.
- **CSSE-domain leakage** — WP-04's entire purpose is closing this risk; its verification must include an explicit, direct check that a CSSE-pathway learner never receives a Verbal/Non-Verbal/Spatial Reasoning recommendation, not an inference from passing unit tests.
- **Premature calibration** — mitigated by the hotfix's ownership assignments (`EAW-005` §4.1); WP-06/WP-07/WP-09 should ship with the interim placeholder values stated explicitly as provisional, not presented as calibrated findings.

---

## 6. Testing Strategy

Every work package is verified using this project's own established, real (not merely typed) verification precedent — restated from `EAW-005` §3, not redesigned: functional pure-logic scripts (the project's proven `npx tsx`, run-and-discard technique) for WP-03 through WP-11's internal logic; scenario-based persona simulation (proven in this project's own Phase 1.1 validation) for Educational correctness across WP-05 through WP-09; direct browser verification for anything touching a real surface (WP-09's `target_exam_date` capture, WP-12's parent-facing fields); and, per the hotfix's Engineering Action 3, an explicit **existing-ALI-regression check** before any wave is considered complete — confirming the weak-skill override, current mastery mechanism, Daily Mission, and Parent Insights remain genuinely unchanged.

---

## 7. Verification Gates

Each Delivery Wave (§3) must clear the relevant subset of `EAW-005` §3's six verification dimensions and every touched component's Educational Contract (`EAW-005` §2) before the next wave begins:

- **Wave A exit gate:** WP-04 verified via a direct, explicit CSSE-domain-leakage check (§5) — this is the gate `ERR-001`/APD-013 required, now concrete.
- **Wave B exit gate:** WP-05/WP-06 pass Technical and Educational correctness; existing mastery mechanism confirmed unregressed.
- **Wave C exit gate:** WP-07/WP-08 confirmed off the real-time path (Technical); Durable Mastery's three-condition standard (AEP-005 §10) confirmed correctly implemented (Educational correctness).
- **Wave D exit gate:** Wellbeing-ceiling adversarial testing (§5) passes; Explainability's three-tier separation confirmed with no leakage.
- **Wave E exit gate:** Parent-facing language audit (Trust dimension) passes; Operational Event retention confirmed executing.

No wave proceeds on a partial pass — consistent with `EAW-005` §3's "not five of six" (now six of six) standard.

---

## 8. Release Strategy

**No big-bang release.** Following this project's own proven precedent (Learning Gain and the Learning Profile Model were both built "computed, real, internal-only" before ever being surfaced, and ALI's own adaptive routes shipped as structurally isolated additions rather than behind a feature flag, per Decision 19's "isolation is structural, not a kill-switch" pattern): every new engine component (WP-05 through WP-11) should ship **internally computed first, surfaced later** — Confidence tiers and Educational State computed and audit-logged before any recommendation or parent-report surface reads them; Durable Mastery computed before `durablyMastered` appears in any Parent Report. This lets each Wave's correctness be verified against real, live evidence before it has any user-facing consequence at all, the same technique this project has already used twice successfully.

---

## 9. Success Metrics

Consistent with `ANGEL_MOMENTUM_FRAMEWORK.md`'s own explicit rejection of volume-based vanity metrics ("sessions completed" named there as the least informative measure available): this programme's success metrics are evidence- and trust-based, not activity-based —

- **Zero CSSE-pathway (or any pathway) domain-leakage incidents** — WP-04's direct, binary success criterion.
- **Proportion of surfaced recommendations passing all six verification dimensions** in ongoing production sampling, not only at release.
- **Durable Mastery adoption rate** once WP-07 ships — the proportion of `mastered` competencies that go on to become `durable`, a genuine long-term-learning signal distinct from raw completion counts.
- **Voluntary-return rate and recommendation follow-through rate** — reusing `ANGEL_MOMENTUM_FRAMEWORK.md`'s own already-established preferred metrics rather than inventing new ones for this programme.
- **Parent-reported comprehension of "why this recommendation"** (qualitative, tied to `ANGEL_EXPERIENCE_MANIFESTO.md`'s own standing test) — the direct measure of whether WP-10's Explainability work actually achieves what it was built for.

---

## 10. Implementation Governance

The freeze discipline already established (APD-007/APD-012: changes require a defect correction, new educational evidence, or a formal programme decision) governs the entire implementation phase, not only the architecture that precedes it. A short readiness check — mirroring the `ARR-001`/`ERR-001` review pattern already proven twice in this programme — should occur at the exit of each Delivery Wave (§3/§7), not only once at the very end, so a defect discovered mid-implementation is caught and corrected with the same rigour this programme has applied to its own architecture, rather than accumulating silently until a single large review at the end.

---

No production code is created by this document. It is delivered for Founder review and approval before implementation of any work package begins.
