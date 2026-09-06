import { test } from "node:test";
import assert from "node:assert/strict";
import { selectRemediationAction } from "@/lib/learningEngine/remediationPolicy";
import type { RemediationContext } from "@/lib/learningEngine/remediationPolicy";

/**
 * Educational Foundation Completion Standard, Section 9 -- proves the
 * remediation policy is deterministic and, above all, that it does NOT
 * default to "re-serve the same skeleton with new numbers" the moment a
 * learner fails once.
 */

function ctx(overrides: Partial<RemediationContext> = {}): RemediationContext {
  return {
    consecutiveFailuresOnSameSkeleton: 0,
    hasFullLessonAvailable: false,
    hasMisconceptionTargetedBlueprintAvailable: false,
    hasPrerequisiteCompetencyWithWeakEvidence: false,
    hasAlternativeRepresentationAvailable: false,
    hasMultipleBlueprintsInFamily: false,
    ...overrides,
  };
}

test("a single failure with no other evidence never immediately escalates to re_teaching -- guided_practice is the honest default", () => {
  assert.equal(selectRemediationAction(ctx({ consecutiveFailuresOnSameSkeleton: 1 })), "guided_practice");
});

test("repeated failure on the SAME skeleton (>=2 in a row) escalates to re_teaching when a lesson exists, worked_example otherwise -- the core anti-recycling behaviour", () => {
  assert.equal(selectRemediationAction(ctx({ consecutiveFailuresOnSameSkeleton: 2, hasFullLessonAvailable: true })), "re_teaching");
  assert.equal(selectRemediationAction(ctx({ consecutiveFailuresOnSameSkeleton: 3, hasFullLessonAvailable: false })), "worked_example");
});

test("a real, evidenced prerequisite gap is preferred over guessing at a misconception within the current competency", () => {
  const result = selectRemediationAction(ctx({ consecutiveFailuresOnSameSkeleton: 1, hasPrerequisiteCompetencyWithWeakEvidence: true, hasMisconceptionTargetedBlueprintAvailable: true }));
  assert.equal(result, "prerequisite_competency");
});

test("a named misconception-targeted blueprint is chosen over a generic representation change or blueprint swap", () => {
  const result = selectRemediationAction(ctx({ consecutiveFailuresOnSameSkeleton: 1, hasMisconceptionTargetedBlueprintAvailable: true, hasAlternativeRepresentationAvailable: true, hasMultipleBlueprintsInFamily: true }));
  assert.equal(result, "misconception_targeted_blueprint");
});

test("a genuinely different representation is preferred over merely swapping to another blueprint in the same family", () => {
  const result = selectRemediationAction(ctx({ consecutiveFailuresOnSameSkeleton: 1, hasAlternativeRepresentationAvailable: true, hasMultipleBlueprintsInFamily: true }));
  assert.equal(result, "different_representation_or_context");
});

test("with zero richer signal and zero tracked failures, the policy still returns a real, distinct action -- never silently 'do nothing'", () => {
  const result = selectRemediationAction(ctx());
  assert.equal(result, "delayed_retrieval");
});

test("deterministic: identical context always yields identical action", () => {
  const context = ctx({ consecutiveFailuresOnSameSkeleton: 2, hasMultipleBlueprintsInFamily: true });
  const results = new Set(Array.from({ length: 10 }, () => selectRemediationAction(context)));
  assert.equal(results.size, 1);
});
