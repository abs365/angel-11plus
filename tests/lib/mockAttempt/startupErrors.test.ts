import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { friendlyMockStartError, isPinRecoverableMockStartError } from "@/lib/mockAttempt/startupErrors";

/**
 * Increment 3 Closure Correction, Section 1 (Founder production evidence:
 * Mock Centre -> Mathematics Mock 1 -> "I'm ready to begin" -> "We couldn't
 * continue this assessment" / "angel_learner_pin_required"). Two distinct
 * requirements: (B) never expose an internal RPC/database error identifier
 * in learner-facing UI; (A) a genuine, human-readable recovery path for the
 * one identified, reproduced cause.
 */

test("friendlyMockStartError never returns the raw angel_learner_pin_required identifier, or any other internal exception code, verbatim", () => {
  const translated = friendlyMockStartError("angel_learner_pin_required");
  assert.doesNotMatch(translated, /angel_/);
  assert.equal(translated, "Your learner session needs to be verified again before starting this Mock.");
});

test("friendlyMockStartError translates every other known internal code and falls back to a plain, generic message for anything unrecognised", () => {
  assert.doesNotMatch(friendlyMockStartError("angel_learner_not_owned"), /angel_/);
  assert.doesNotMatch(friendlyMockStartError("angel_learner_required"), /angel_/);
  assert.doesNotMatch(friendlyMockStartError("angel_not_authenticated"), /angel_/);
  const unknown = friendlyMockStartError("permission denied for table ali_mock_attempt");
  assert.doesNotMatch(unknown, /table|permission denied|ali_/i);
  assert.equal(unknown, "Sorry, something went wrong starting this Mock. Please try again.");
});

test("friendlyMockStartError leaves this flow's own already-plain, non-internal messages unchanged", () => {
  assert.equal(friendlyMockStartError("Not connected."), "Not connected.");
  assert.equal(friendlyMockStartError("Could not establish a learner profile."), "Could not establish a learner profile.");
});

test("isPinRecoverableMockStartError identifies exactly the PIN-required case, and only that case", () => {
  assert.equal(isPinRecoverableMockStartError("angel_learner_pin_required"), true);
  assert.equal(isPinRecoverableMockStartError("angel_learner_not_owned"), false);
  assert.equal(isPinRecoverableMockStartError("Not connected."), false);
});

// --- Wiring: both real Mock-start surfaces route their raw error through this translation ---

const MOCK_EXAM_PAGE = readFileSync("app/learning-intelligence/mock-exam/page.tsx", "utf8");
const SITTING_PAGE = readFileSync("app/learning-intelligence/mock-exam/sitting/page.tsx", "utf8");

test("the Mock-exam page never renders the raw errorMessage state directly -- it always renders friendlyMockStartError(errorMessage)", () => {
  assert.doesNotMatch(MOCK_EXAM_PAGE, />\{errorMessage\}</, "raw errorMessage must never be interpolated directly into learner-facing JSX");
  assert.match(MOCK_EXAM_PAGE, /\{friendlyMockStartError\(errorMessage\)\}/);
});

test("the two-paper sitting page never renders the raw errorMessage state directly either", () => {
  assert.doesNotMatch(SITTING_PAGE, />\{errorMessage\}</);
  assert.match(SITTING_PAGE, /\{friendlyMockStartError\(errorMessage\)\}/);
});

test("the Mock-exam page offers a genuine PIN re-entry recovery action (LearnerPinModal, mode=verify) specifically for the PIN-recoverable case, never a dead end", () => {
  assert.match(MOCK_EXAM_PAGE, /isPinRecoverableMockStartError\(errorMessage\)/);
  assert.match(MOCK_EXAM_PAGE, /<LearnerPinModal\s*\n\s*mode="verify"/);
  assert.match(MOCK_EXAM_PAGE, /Re-enter your PIN/);
});

test("on a successful PIN re-verification, the Mock-exam page stores the fresh session token and retries the begin action -- it never silently drops the recovery on the floor", () => {
  assert.match(MOCK_EXAM_PAGE, /onSuccess=\{\(token\) => \{/);
  assert.match(MOCK_EXAM_PAGE, /enterLearnerMode\(user\.id, token\)/);
  assert.match(MOCK_EXAM_PAGE, /void handleBegin\(\);/);
});

test("the PIN recovery path never bypasses or weakens verification -- it always goes through the real, unmodified verify_learner_pin() RPC via the shared LearnerPinModal, never a client-side shortcut", () => {
  const modalSrc = readFileSync("components/parent/LearnerPinModal.tsx", "utf8");
  assert.match(modalSrc, /verifyLearnerPin/);
  assert.doesNotMatch(MOCK_EXAM_PAGE, /skipPinCheck|bypassPin|noPinRequired/i);
});
