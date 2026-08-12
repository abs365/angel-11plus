# Content Reconciliation Register V1

**Prepared:** 2026-08-12, Angel 11+ Completion Programme, Continuation Directive 002.
**Purpose:** resolve which of the previously-uncommitted programme-001 / assessment-excellence-programme artefacts are canonical, which are supporting evidence, and which are superseded, so the Content Scale Gate has one trustworthy base to stand on rather than a pile of undated documents.

All artefacts below were found UNTRACKED in git (never committed) as of this directive, despite most of them justifying code and content already live in production. This is a commit-hygiene gap, not an abandoned-work gap — see status notes per artefact.

## Top-level programme documents

| Artefact | Purpose | Date | Status | Notes |
|---|---|---|---|---|
| `ASSESSMENT_TRANSFORMATION_IMPLEMENTATION_BLUEPRINT_V1.md` | 9 Implementation Domains, design only | ~2026-08-05 | CANONICAL | Design doc; no code claims to verify against |
| `ASSESSMENT_TRANSFORMATION_IMPLEMENTATION_ROADMAP_V1.md` | 7-wave roadmap, Founder-gated | ~2026-08-05 | CANONICAL | Describes sequencing; several waves since executed (see Release 1 committed increments) |
| `PROGRAMME_001_PROGRESS_CHECKPOINT.md` | Programme status log | 2026-08-05 | SUPERSEDED (stale) | Last entry predates 6+ days of subsequent work (Founder Validation Assessment through Lesson 002). Kept as historical record, not as current status. |

## release-0/

| Artefact | Status | Notes |
|---|---|---|
| Release 0 governance/disclosure work | CANONICAL, ALREADY SHIPPED | Delivered as commit `1dbd90a`. The documents describe already-live code (mock-exam disclosure banner, `KNOWLEDGE_GOVERNANCE.md` §11). |

## release-1/ — evidentiary base (this directive's primary concern)

| Artefact | Status | Relationship to canonical architecture |
|---|---|---|
| `RELEASE_1_CSSE_AUTHENTIC_QUESTION_SPECIFICATION.md` | CANONICAL | Directly verified by this directive (§3/§4 below). Builds on `docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md` (AEP-004, already canonical) without re-deriving it — this is the correct relationship, not a duplicate. |
| `RELEASE_1_MULTI_YEAR_QUESTION_PATTERN_ANALYSIS.md` | CANONICAL | Citation-backed against the 17 Accepted assets; no competing document covers this. |
| `CSSE_FULL_MOCK_STRUCTURE_DECISION_V1.md` | CANONICAL | Resolves a real prior gap (2022 combined marks); target-structure table is the only one of its kind in the repo. |
| `RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md` | CANONICAL | Directly verified by this directive (§5 below). Explicitly self-declares "design only, no schema change" — verified true against live schema. |
| `RELEASE_1_GAP_ANALYSIS.md` | CANONICAL WITH AMENDMENT | Coverage figures (18/27, 9/27 etc.) are accurate as of 2026-08-05/before migration 021/029; superseded numerically by this directive's `CONTENT_INVENTORY_V1.md`, but its *method* and *findings about coverage tracking convenience rather than evidence priority* remain valid and are carried forward. |
| `RELEASE_1_EXISTING_CONTENT_AUTHENTICITY_REVIEW_PLAN.md` | CANONICAL, NOT YET EXECUTED | Describes a real Founder Stop Condition (the 29/46-item retrospective review has explicitly not been performed) — this is a scope boundary, not an abandoned task. Still the plan of record for that future review. |
| `RELEASE_1_VALIDATION_STRATEGY.md` | CANONICAL | "No stage may be self-certified by whoever authored the content" — this rule is load-bearing for the Content Scale Gate (§10) and is adopted directly. |
| `RELEASE_1_IMPLEMENTATION_BLUEPRINT.md` | CANONICAL | Contains the Assessment Authenticity Principle the Specification cites; no conflict found. |
| `RELEASE_1_FOUNDER_DECISION_PACK.md` | CANONICAL, PARTIALLY DECIDED | Gates 1/2/4/5 approved 2026-08-10; Gate 3 (AR-01 authoring) explicitly deferred pending a post-2024 CSSE English paper — still deferred, no such paper found in the repo as of this directive (see §6 of the main report). |
| `RELEASE_1_LIVE_QUESTION_BANK_RECONCILIATION_REPORT.md` | SUPERSEDED (numerically), METHOD CANONICAL | Its reported count (29) was correct at the time it was written. Superseded by this directive's live re-query (46). The QT-MR-01 concentration finding it raised is independently reconfirmed below (§ Content Inventory) and remains live. |
| `REPOSITORY_BASELINE_ASSESSMENT.md` | SUPERSEDED (numerically), METHOD CANONICAL | Same relationship as above; its migration-016-already-applied discovery is independently reconfirmed (§6 of main report) via timestamp/ID cross-check, not merely re-trusted. |
| `RELEASE_1_AUTHORING_PIPELINE_PILOT_REPORT.md` | SUPPORTING EVIDENCE | Describes the QT-RC-01 pilot; superseded as *pilot method* by the Founder Validation Assessment approach, but the item and its record remain valid programme history, not deleted. |
| `competitive-excellence-benchmark/` (dir) | SUPPORTING EVIDENCE | Directional ~150-250 Independently Validated item floor proposal; informs but does not itself set this directive's Content Sufficiency thresholds (see `CONTENT_SUFFICIENCY_STANDARD_V1.md`). |
| `increment-2a-qt-rc-01-pilot/` (dir) | ARCHIVE CANDIDATE | Full worked pipeline example on one item, superseded per above. Retained as a template; not part of the active evidence chain going forward. |
| `personalised-learning-and-mastery/` (dir) | SUPPORTING EVIDENCE | Relevant to adaptive-selection work (Phase H of the wider directive), not directly consumed by this Content Scale Gate. |

## knowledge/assessment-excellence-programme/ (the predecessor research programme)

| Artefact | Status | Notes |
|---|---|---|
| Phase 2 (101 sources, `AEP2-001`-`101`) | CANONICAL, FROZEN | Consumed by programme-001 without re-derivation, per programme-001's own stated convention. Not re-verified line-by-line by this directive — out of scope; no contradiction found with anything re-verified here. |
| Phase 3 (evidence synthesis, 6 findings docs) | CANONICAL, FROZEN | As above. |
| Phase 4 (`ASSESSMENT_EXCELLENCE_DECISION_REGISTER.md`, `..._CONFLICT_REGISTER.md`) | CANONICAL, FROZEN | 21 decisions (Founder Decision fields intentionally blank — not a defect, a deliberate real-signature placeholder per this programme's own standing convention, see `feedback_never_infer_founder_decisions`-equivalent discipline already used elsewhere in Angel 11+). 8 unresolved conflicts recorded, not silently resolved. |
| Phase 5 (`ASSESSMENT_TRANSFORMATION_BLUEPRINT_V1.md`) | CANONICAL | Converts the 21 decisions into 10 workstreams; direct ancestor of programme-001. |

## EDUCATIONAL_IDENTITY_* thread (question/content identity — distinct from ARCH-001/ED-001 learner identity)

| Artefact | Status | Notes |
|---|---|---|
| `EDUCATIONAL_IDENTITY_INTEGRATION_DISCOVERY.md` | CANONICAL | Correctly concludes the identity primary key already existed (`ali_question_bank.id`); the gap was coverage, not a missing mechanism. |
| `EDUCATIONAL_IDENTITY_PHASE2C_FINAL_REPORT.md` | CANONICAL | Scanned all 218 real content items in `data/*.ts`; 18 already-registered, 11 newly registered (migration 016, confirmed live below), 189 `requires-review` with individually cited reasons. |
| `EDUCATIONAL_IDENTITY_BATCH1_RECONCILIATION.md` | CANONICAL | Self-correction (2 of 13 proposed items walked back to `requires-review`) — a positive rigor signal, kept as-is. |
| `EDUCATIONAL_IDENTITY_RECONCILIATION_REPORT.json` | SUPPORTING EVIDENCE | Machine-readable form of the above; kept alongside its narrative counterpart. |
| `scripts/educational-identity-registration.ts` | CANONICAL | Real, working tooling — produced migrations 016-018. |
| `scripts/test-educational-identity-registration.ts` | CANONICAL | 47/47 assertions including adversarial cases; genuine test coverage, not a stub. |
| `supabase/migrations/016_educational_identity_batch1_english_maths.sql` | CANONICAL, APPLIED | Confirmed live via direct DB timestamp/ID cross-check (§6 of main report). |
| `supabase/migrations/017_...batch2_writing_vocabulary.sql` | CANONICAL, INTENTIONAL NO-OP | Verified by direct read: `select 1;`, honestly documented as "nothing safe to register this batch." Not blocked, not pending — complete as a no-op. |
| `supabase/migrations/018_...batch3_reasoning_subjects.sql` | CANONICAL, INTENTIONAL NO-OP | Same as 017, for VR/NVR/Spatial/Numerical Reasoning (none of which CSSE tests — correctly out of scope for this pathway). |

## ARCH-001_ED-001_IDENTITY_CORRECTION_IMPLEMENTATION.md (tracked, locally modified)

**Status: CANONICAL, operationally unrelated to the content-identity thread above.** This is learner/auth identity (Gate 7, migration 020, live per the local diff), not question-content identity. No reconciliation conflict with anything else in this register. Recommend committing the local diff and closing out the outstanding Phase 3.1 Founder Acceptance Certificate as a separate, independent action — not blocking the Content Scale Gate.

## Unresolved contradictions

1. **Row-count drift (18/29/40/46)** — not a contradiction. Resolved in the main report §6/§10/§11: each number was the correct live count at its own point in time as migrations 016 and 021 (and later 023/025/029) landed. No data-integrity issue.
2. **No other factual contradiction found** between any two CANONICAL-status artefacts in this register during this directive's verification pass. Where a document's own numbers are now stale (the two SUPERSEDED-numerically rows above), the artefact says so implicitly by its own dated snapshot nature, not by asserting something false about the present.
