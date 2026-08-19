import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveTriggerReason } from "@/lib/ali/persistence/recommendationRuntime";

/**
 * Stage 2 Educational Integrity Correction, Part 10 (Recommendation
 * Integrity) — proves that "insufficient evidence" (educationalState
 * "exploring") and "evidenced-but-not-yet-solid" (every other
 * non-mastered state) already produce genuinely different recommendation
 * triggers, and were never merged. Combined with
 * tests/lib/ali/educationalState.test.ts's proof that a self-assessed-only
 * "hu" attempt can no longer reach "building-knowledge", this closes the
 * loop end-to-end: a self-assessed-only attempt now correctly triggers
 * "never-attempted" (or nothing, since Insufficient Evidence recommendation
 * copy is a separate concern from this trigger), never
 * "weak-competency-remediation" — which is the trigger that produces
 * copy like "needs more practice before it's solid."
 */

test("exploring (insufficient evidence, including the corrected 'hu' case) triggers never-attempted, not weak-competency-remediation", () => {
  assert.equal(deriveTriggerReason("exploring"), "never-attempted");
});

test("states implying real independently-verified-but-unmastered evidence trigger weak-competency-remediation", () => {
  for (const state of ["building-knowledge", "practising", "reinforcing", "rebuilding"] as const) {
    assert.equal(deriveTriggerReason(state), "weak-competency-remediation");
  }
});

test("mastered/durably-mastered never trigger a remediation recommendation", () => {
  assert.equal(deriveTriggerReason("mastered"), null);
  assert.equal(deriveTriggerReason("durably-mastered"), null);
});

test("reviewing correctly triggers its own distinct reason, not weak-competency-remediation", () => {
  assert.equal(deriveTriggerReason("reviewing"), "review-due");
});
