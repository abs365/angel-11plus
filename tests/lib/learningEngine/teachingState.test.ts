import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveTeachingState, isTeachingAssistancePermitted } from "@/lib/learningEngine/teachingState";
import type { TeachingStateContext } from "@/lib/learningEngine/teachingState";

/**
 * Educational Supply & Progression Integration Gate, Section 25 --
 * "teaching state progression is deterministic" and "mock mode disables
 * teaching assistance."
 */

function ctx(overrides: Partial<TeachingStateContext> = {}): TeachingStateContext {
  return {
    educationalState: "exploring",
    hasFullLessonAvailable: false,
    isFirstEncounterEver: true,
    lastAttemptSupportTier: null,
    maintenanceReviewDue: false,
    ...overrides,
  };
}

test("deriveTeachingState is a pure, deterministic function -- identical context always yields identical state", () => {
  const context = ctx({ educationalState: "practising" });
  const results = new Set(Array.from({ length: 20 }, () => deriveTeachingState(context)));
  assert.equal(results.size, 1, "20 calls with an identical context must produce exactly one distinct state");
});

test("a brand-new competency with a real lesson available starts at explicit_teaching, not straight into practice", () => {
  assert.equal(
    deriveTeachingState(ctx({ educationalState: "exploring", isFirstEncounterEver: true, hasFullLessonAvailable: true })),
    "explicit_teaching"
  );
});

test("a brand-new competency with NO lesson built falls back to worked_example, never silently to independent practice", () => {
  assert.equal(
    deriveTeachingState(ctx({ educationalState: "exploring", isFirstEncounterEver: true, hasFullLessonAvailable: false })),
    "worked_example"
  );
});

test("a supported (heavily-assisted) prior attempt at the exploring/building stage routes to guided_practice, not worked_example again", () => {
  assert.equal(
    deriveTeachingState(ctx({ educationalState: "building-knowledge", isFirstEncounterEver: false, lastAttemptSupportTier: "supported" })),
    "guided_practice"
  );
});

test("progression is forward, tracking educationalState: practising -> scaffolded, reinforcing -> independent", () => {
  assert.equal(deriveTeachingState(ctx({ educationalState: "practising", isFirstEncounterEver: false })), "scaffolded_practice");
  assert.equal(deriveTeachingState(ctx({ educationalState: "reinforcing", isFirstEncounterEver: false })), "independent_practice");
});

test("mastered/durably-mastered evidence routes to transfer -- independent success is not rewarded with more of the same practice", () => {
  assert.equal(deriveTeachingState(ctx({ educationalState: "mastered", isFirstEncounterEver: false })), "transfer");
  assert.equal(deriveTeachingState(ctx({ educationalState: "durably-mastered", isFirstEncounterEver: false })), "transfer");
});

test("a real regression (rebuilding) forces a return to teaching, regardless of how much prior independent success existed", () => {
  assert.equal(
    deriveTeachingState(ctx({ educationalState: "rebuilding", isFirstEncounterEver: false, hasFullLessonAvailable: true })),
    "explicit_teaching"
  );
  assert.equal(
    deriveTeachingState(ctx({ educationalState: "rebuilding", isFirstEncounterEver: false, hasFullLessonAvailable: false })),
    "guided_practice",
    "without a built lesson, rebuilding still cannot silently fall through to independent practice"
  );
});

test("a maintenance review being due on mastered evidence takes priority over the plain 'transfer' routing", () => {
  assert.equal(
    deriveTeachingState(ctx({ educationalState: "mastered", isFirstEncounterEver: false, maintenanceReviewDue: true })),
    "maintenance_retrieval"
  );
});

test("maintenance review due has no effect on a competency that is not yet mastered -- it cannot fire prematurely", () => {
  assert.equal(
    deriveTeachingState(ctx({ educationalState: "practising", isFirstEncounterEver: false, maintenanceReviewDue: true })),
    "scaffolded_practice"
  );
});

test("'reviewing' state without a due maintenance check routes to mastery_check, not independent_practice or transfer", () => {
  assert.equal(deriveTeachingState(ctx({ educationalState: "reviewing", isFirstEncounterEver: false })), "mastery_check");
});

test("mock_attempt mode disables teaching assistance; practice and placement modes permit it", () => {
  assert.equal(isTeachingAssistancePermitted("mock_attempt"), false);
  assert.equal(isTeachingAssistancePermitted("practice"), true);
  assert.equal(isTeachingAssistancePermitted("placement"), true);
});
