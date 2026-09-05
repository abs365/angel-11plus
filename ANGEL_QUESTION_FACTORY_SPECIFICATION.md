# Angel 11+ — Question Factory Specification

**Prepared:** 2026-09-05, Phase 4/Section 9 of the Founder's content-inventory assignment. Specification only — no code, migration, or content change is made by this document.

This specifies the lifecycle a candidate question must pass through before it can ever reach a learner: **family → spec → candidate → automated validation → educational validation → duplicate check → difficulty calibration → marking validation → explanation validation → approval → bank → performance evidence → recalibration/retirement.** For each stage, this document states what exists today (citing the exact module), what is missing, and what must be built — deliberately reusing `ANGEL_EDUCATIONAL_CAPACITY_AUDIT.md` §16's own 17-stage audit rather than re-auditing from zero, and `ANGEL_QUESTION_SUPPLY_ARCHITECTURE.md`'s finding that most of the governance foundation already exists but is unwired.

**The one rule every stage below must uphold, per the Founder's explicit instruction: no question enters the trusted production pool solely because a generative process produced it.** Every stage that touches generated content (candidate generation onward) is a gate a generated item must pass, never a step that promotes it automatically.

---

## Stage 1 — Family

**Status: EXISTS (Mathematics), PARTIAL (English), DORMANT AT THE ROW LEVEL.**

A family is the unit of authoring and review, not an individual question. Mathematics already has this as a real column (`family_id`, migration 030, 74 live families). English has no column but does have a derivable equivalent (`lib/ali/englishFamilyModel.ts`'s (passage, reasoning-pattern) key) that has never been wired into anything. **Build item**: promote `englishFamilyModel.ts`'s derivation into an actual persisted classification (a computed column or a companion table), so English gets first-class family identity rather than a read-side inference nobody calls. **Reuse item**: `lib/ali/questionFamilyRegistry.ts`'s `QuestionFamilyRecord` shape is the correct target shape for both subjects — wire `buildFamilyRegistry()` into the admin review surface so a reviewer sees a family, not a flat list of rows.

## Stage 2 — Spec

**Status: PARTIAL.** A family's *conceptual objective, misconception target, and reasoning depth* are named fields in `QuestionFamilyRecord` but are honestly `"unclassified"` for every real family today — no upstream document captures them before authoring begins. **Build item**: a short, mandatory spec template (subject, competency, conceptual objective, misconception target, difficulty band, minimum sibling count) filled in *before* any candidate is authored, whether by a human or a generation process. This is a process/template change, not new software.

## Stage 3 — Candidate

**Status: MISSING** for anything other than a human directly writing a finished SQL row. Per `ANGEL_EDUCATIONAL_CAPACITY_AUDIT.md` §16: "authoring scripts produce hand-written SQL from hand-authored data, not generated candidates." A "candidate" as a distinct, not-yet-trusted intermediate object does not exist in this codebase at all — content is either not written yet, or already a finished bank row. **Build item**: introduce a genuine candidate stage — a row (or file) that is NOT `ali_question_bank` and carries no `eligibility_status` that could ever be read as trusted, holding a proposed item (human- or generation-authored) until it clears Stages 4-9. This is the single largest net-new structural change this specification recommends, and it is a prerequisite for every generation source in `ANGEL_QUESTION_SUPPLY_ARCHITECTURE.md` §3 (items 3, 4, 5) — none of them should ever write directly to `ali_question_bank`.

## Stage 4 — Automated (Deterministic) Validation

**Status: PARTIAL, real and good as far as it goes.** `scripts/007i-maths-answer-verification.mjs` and its successors already verify Mathematics arithmetic/answer correctness mechanically. `scripts/migration-sql-guard.mjs` and `scripts/copy-quality-guard.mjs` are real, CI-enforced (`npm run lint`), mechanical gates already applied to every migration, including content migrations. **Gap**: no automated check exists for English answer-contract validity (does a TIER3/TIER5 item's accepted-answer set actually match its own validation tier's contract?) or for a candidate's basic well-formedness before authoring (well-formed JSON prompt shape, non-empty stem, valid `question_type`). **Build item**: extend the existing guard-script pattern (same convention, not a new one) to run against the new Stage 3 candidate object before it can proceed.

## Stage 5 — Educational Validation

**Status: EXISTS, and per the capacity audit is a genuine strength — reuse unmodified.** `app/admin-beta/review/page.tsx` + `lib/adminReview.ts`'s per-family human review workflow (`REVIEW_CRITERIA`, `WRITING_REVIEW_CRITERIA`, `MATHS_TEACHING_REVIEW_CRITERIA`) already exists and already correctly keeps judgement-heavy criteria (natural language quality, age-appropriateness, ambiguity, distractor quality, reasoning depth, cultural/context appropriateness) as human-only, per the Founder's own explicit instruction that these must never be claimed as fully automatable. **The only change needed**: every Stage 3 candidate, regardless of source, must route through this exact surface — no new review UI, no bypass for generated content.

## Stage 6 — Duplicate/Similarity Check

**Status: EXISTS, DORMANT.** `lib/ali/structuralSignature.ts` (cross-family structural collisions) and `lib/ali/antiMemorisationChecks.ts` (`findDuplicateIds`, `findExactDuplicateStems`, `findNearIdenticalStems`) already implement exactly the mechanical checks the Founder's own instruction accepts as automatable — deliberately narrow, deliberately not claiming semantic/paraphrase detection. **Build item is wiring, not invention**: run `runContentPoolChecks()` and `findCrossFamilyCollisions()` against the full live bank plus every new Stage 3 candidate before Stage 5 review, and surface any hit directly in the review UI rather than as a separate, easily-skipped report. This single change directly answers the Founder's own instruction: "changing names or numbers alone must not automatically count as a new educational question family" — `findNearIdenticalStems()`'s numeric-normalisation already catches exactly this pattern today, it is simply never invoked.

## Stage 7 — Difficulty Calibration

**Status: MISSING** as a genuine calibration loop; **EXISTS** as a static field. `content_difficulty` is set once at authoring time and never revised. `usage_count`/`avg_success_rate` exist as columns but, per the capacity audit §16, "nothing reads them back into any decision." **Build item**: this is Stage 12 (Performance Evidence) feeding back into Stage 7 — see below. Until that loop exists, difficulty remains an author's initial estimate, disclosed as such, never re-validated against real learner outcomes.

## Stage 8 — Marking Validation

**Status: EXISTS for Mathematics (deterministic, arithmetic-verified) and for deterministic English tiers (TIER1/2/4/6); PARTIAL for judgement-tier English (TIER3/5), which already correctly routes to human manual marking** (this session's own Increment 025 work: migration 227's `mock_apply_manual_mark`). No gap identified beyond what Increment 025 already closed for Mock content specifically — Practice-content marking validation for judgement tiers has not been separately audited this session and is flagged, not assumed clean.

## Stage 9 — Explanation Validation

**Status: MISSING.** No automated or systematic check exists anywhere that a question's stored `explanation` is actually correct, complete, or matches its own `answer`/`workingSteps`. This sits inside the existing human educational review surface today (Stage 5) but has no dedicated checklist item calling it out specifically — a real, low-cost addition to `REVIEW_CRITERIA` rather than a new mechanism.

## Stage 10 — Approval

**Status: EXISTS.** The `eligibility_status` enum and its promotion migrations (e.g. this session's own family-review-driven promotions) already implement a real, auditable approval step, moving a row from a review-track status to `practice_eligible`/`mock_eligible`. No change recommended — this is exactly the "release" concept `lib/ali/contentPipeline.ts` already names as EXISTS.

## Stage 11 — Bank

**Status: EXISTS.** `ali_question_bank` itself, with the OPEN/RENEWABLE/MEASUREMENT/SEALED classification (`lib/ali/inventoryClass.ts`) as the correct read-side model for what a banked item's protection level is — again dormant (Section 2 of the supply architecture document), not missing. **Build item is wiring**: have the Practice/Mock exposure firewall's own existing exposure facts (`ali_mock_exposed_question_ids`/`ali_mock_exposed_passage_ids`, migrations 208/209) feed `classifyInventoryClass()`'s `everExposedToMock` input in a real, scheduled or on-write path, rather than the function existing only for a caller that never comes.

## Stage 12 — Performance Evidence

**Status: MISSING**, and named as such independently by both this document and `ANGEL_EDUCATIONAL_CAPACITY_AUDIT.md` §16. `usage_count`/`avg_success_rate` are real columns collecting real data (confirmed present in the live schema this session's own read-only probe returned) that nothing reads back into any decision — not difficulty calibration, not selection weighting, not review prioritisation. **Build item**: a genuinely new, bounded feedback loop — see `ANGEL_QUESTION_SUPPLY_ARCHITECTURE.md` §4 item 7 and the sequencing note there (build this once there is enough content history to calibrate against, not before).

## Stage 13 — Recalibration/Retirement

**Status: PARTIAL.** The Practice/Mock firewall is retirement-*adjacent* (it blocks reuse of Mock-exposed content back into Practice, a real, test-proven, well-engineered mechanism per the capacity audit §6) but there is no general quality-triggered retirement workflow — a question found to be ambiguous, miscalibrated, or superseded has no defined path out of `practice_eligible` other than a manual, ad-hoc migration. **Build item**: a `retired` eligibility transition with the same review-and-apply discipline as promotion, triggered by Stage 12 evidence once it exists (e.g. sustained near-zero or near-100% `avg_success_rate`, which is itself evidence a question is either broken or non-discriminating) or by a direct educational-review finding.

---

## Summary Table

| Stage | Status |
|---|---|
| 1. Family | EXISTS (Maths) / PARTIAL, dormant (English) |
| 2. Spec | PARTIAL |
| 3. Candidate | **MISSING — build first** |
| 4. Automated validation | PARTIAL, extend existing guard pattern |
| 5. Educational validation | EXISTS — reuse unmodified |
| 6. Duplicate check | EXISTS, dormant — **wire, don't build** |
| 7. Difficulty calibration | Static only — depends on Stage 12 |
| 8. Marking validation | EXISTS / PARTIAL |
| 9. Explanation validation | MISSING — add to existing review checklist |
| 10. Approval | EXISTS |
| 11. Bank | EXISTS, classification dormant — **wire, don't build** |
| 12. Performance evidence | **MISSING — genuinely new, build last** |
| 13. Recalibration/retirement | PARTIAL |

**Reading this table honestly**: of the 13 stages, only Stage 3 (Candidate) and Stage 12 (Performance Evidence) require building something that does not exist in any form today. Four stages (1 English, 6, 11, and partially 7) require wiring code that already exists and is already well-reasoned in its own comments. This is a materially cheaper and lower-risk starting position than a green-field Question Factory build, and the priority order in `ANGEL_CONTENT_READINESS_GAP_REGISTER.md` reflects that directly.
