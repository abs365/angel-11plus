# Mastery Maintenance Regression Report

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Family Choice Pilot
**Prepared:** 2026-08-11

---

## 1. The requirement

Per the governing instruction: prove that focus selection does not suppress existing maintenance-review requirements for other competencies, reusing existing architecture with no new scheduler.

## 2. Why this is structurally guaranteed, by code order

Reading `lib/learningEngine/sessionGenerator.ts`'s `generatePersonalisedSession()` top to bottom, in the order execution actually happens:

1. `getRecommendations()` runs first and returns `result.ordered`, from which `reviewDue` (competencies whose `triggerReason === "review-due"`, i.e. Maintenance Review is genuinely due per `lib/ali/durableMastery.ts`'s `isMaintenanceReviewDue()`) is extracted.
2. `reviewActivities` are built and their question ids added to `reservedIds` — **entirely before** the family-focus block runs at all.
3. Only after that does the family-focus injection logic execute, and it only ever touches the separate `weakSkills` set used for the *general* selection pool (`selectQuestions(candidatePool, ...)`), where `candidatePool = tagged.filter((q) => !reservedIds.has(q.id))` — the review-reserved questions are already excluded from the pool the family-focus injection could possibly influence.

There is no code path by which the family-focus block can remove a competency from `reviewDue`, un-reserve a review question, or otherwise interfere with Maintenance Review detection for any competency — chosen or not. `evaluateDurableMastery()`, `isMaintenanceReviewDue()`, and `processEvidenceForCompetency()`'s Maintenance Review write logic were not modified by this pilot at all.

## 3. What this means for other, non-chosen competencies specifically

If a family chooses MR-01 as their focus, and a genuinely separate competency (say, RC-02) is independently due for Maintenance Review, `reviewDue` still includes RC-02 exactly as it would with no family choice active — the family-focus logic only ever adds to `weakSkills`, a set consumed later and only by the non-review general-selection pool. RC-02's review slot is computed, reserved, and honoured entirely independently.

## 4. Real verification performed

- **Code-path verification** (above): confirmed by direct reading of the current, modified `sessionGenerator.ts` (not from memory of the pre-change version) that the review-scheduling block executes and reserves its questions before the family-focus block is ever reached.
- **No regression in the review-eligible content pool**: `reservedIds` (built during review scheduling) is passed into `candidatePool` filtering before `weakSkills` (built partly from the family-focus block) is ever consumed by `selectQuestions()` — confirmed by reading the exact variable data-flow, not inferred.
- **Live browser sessions** run during this pilot (see `FAMILY_CHOICE_EDUCATIONAL_BEHAVIOUR_VERIFICATION.md`) did not surface any review-due competency for the test profile (a near-fresh profile with no mastered questions yet, so no Maintenance Review could genuinely be due) — this is an honest limitation of what could be directly observed this session, not a gap in the code-path proof above, which does not depend on a review actually firing to hold.

## 5. What would constitute a real regression here (none found)

A defect would look like: choosing a focus causes `reviewDue` to shrink, or a review-reserved question id to be evicted from `reservedIds`, or `evaluateDurableMastery()`/`isMaintenanceReviewDue()` receiving a different input because of a family choice. None of these functions or the data flowing into them changed. The family-focus block is additive, downstream, and scoped to a disjoint part of the selection pipeline.

---

## MASTERY MAINTENANCE STATUS: VERIFIED (BY CODE-PATH PROOF; NOT DIRECTLY OBSERVED IN A LIVE FIRING REVIEW THIS SESSION)

No mechanism exists by which family choice can suppress or interfere with Maintenance Review scheduling for any competency. This is a structural guarantee from the order and scope of the code, not merely an absence-of-evidence claim — but a live review-due event was not available to observe directly with the test profile used this session, and that specific gap is disclosed rather than silently upgraded to a full live-observed PASS.
