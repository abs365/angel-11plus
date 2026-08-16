import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { applyAttemptOutcome } from "../../../lib/ali/mastery";
import type { MasteryState } from "../../../types/ali/history";

/**
 * CSSE Completion Programme, Phase A, Decision 60 — Continuous Writing
 * Mastery Safety.
 *
 * AUTHORITATIVE SAFETY RULE: an assessment value that is not validated/
 * calibrated against an approved educational standard must NOT determine
 * durable mastery or CSSE readiness. Writing's overallScore (AI-generated,
 * `app/api/writing-feedback/route.ts`'s own system prompt discloses it "is
 * not calibrated against any exam board's mark scheme") is exactly such a
 * value. This suite proves the quarantine: it can still be recorded as
 * attempt/engagement evidence, but can never independently establish
 * "mastered" or advance distinctCorrectSessions.
 */

function freshHistory(): {
  timesSeen: number;
  timesCorrect: number;
  distinctCorrectSessions: number;
  lastCorrectSessionId: string | null;
  lastAttemptCorrect: boolean | null;
  secondLastAttemptCorrect: boolean | null;
  masteryState: MasteryState;
} {
  return {
    timesSeen: 0,
    timesCorrect: 0,
    distinctCorrectSessions: 0,
    lastCorrectSessionId: null,
    lastAttemptCorrect: null,
    secondLastAttemptCorrect: null,
    masteryState: "learning",
  };
}

test("an uncalibrated 'correct' Writing score (supportTier: supported) can never reach masteryThreshold", () => {
  let history = freshHistory();
  const masteryThreshold = 3;
  // Simulate 3 separate "correct per overallScore" sessions -- the exact
  // number that would trigger "mastered" for an independent attempt.
  for (let i = 0; i < 3; i++) {
    history = applyAttemptOutcome(history, true, `session-${i}`, masteryThreshold, "supported");
  }
  assert.notEqual(history.masteryState, "mastered", "3 supported-correct AI-scored attempts must never alone produce mastered");
  assert.equal(history.distinctCorrectSessions, 0, "supported attempts must never advance distinctCorrectSessions");
});

test("an uncalibrated 'correct' Writing score still records real attempt/engagement evidence (formative signal preserved)", () => {
  const history = applyAttemptOutcome(freshHistory(), true, "session-1", 3, "supported");
  assert.equal(history.timesSeen, 1, "a genuine attempt must still be recorded");
  assert.equal(history.timesCorrect, 1, "the AI-scored outcome is still recorded as formative signal");
  assert.equal(history.lastAttemptCorrect, true);
});

test("contrast: the same score pattern WOULD have produced mastered under the old default (independent) -- proving this is a real fix, not a no-op", () => {
  let history = freshHistory();
  const masteryThreshold = 3;
  for (let i = 0; i < 3; i++) {
    history = applyAttemptOutcome(history, true, `session-${i}`, masteryThreshold, "independent");
  }
  assert.equal(history.masteryState, "mastered", "sanity check: independent tier is genuinely different from supported -- confirms the pre-fix code path really was unsafe");
});

test("a supported-correct Writing attempt never demotes or promotes an already-established mastery state", () => {
  const alreadyMastered = { ...freshHistory(), masteryState: "mastered" as const, distinctCorrectSessions: 3, lastCorrectSessionId: "s0", lastAttemptCorrect: true };
  const after = applyAttemptOutcome(alreadyMastered, true, "session-new", 3, "supported");
  assert.equal(after.masteryState, "mastered", "supported evidence must leave an existing mastered state untouched, not revoke it either");
});

test("app/writing/page.tsx passes supportTier: 'supported' for its AI-scored evidence call", () => {
  const src = readFileSync("app/writing/page.tsx", "utf8");
  const call = src.match(/recordLegacyPracticeEvidence\(\{[\s\S]*?\}\)/);
  assert.ok(call, "recordLegacyPracticeEvidence call must exist in app/writing/page.tsx");
  assert.match(call![0], /supportTier:\s*"supported"/, "the Writing evidence call must explicitly quarantine its uncalibrated score");
});

test("app/learning-intelligence/practice/[area]/page.tsx passes 'supported' for its Writing recordAndAdvance call", () => {
  const src = readFileSync("app/learning-intelligence/practice/[area]/page.tsx", "utf8");
  assert.match(
    src,
    /recordAndAdvance\(feedback\.overallScore >= WRITING_CORRECTNESS_THRESHOLD, "writing", "supported"\)/,
    "the Practice pathway's Writing evidence call must explicitly quarantine its uncalibrated score"
  );
});

test("the other 3 legacy callers (Maths/English/Vocabulary) never pass supportTier -- unaffected by this fix, still default to 'independent'", () => {
  for (const file of ["app/maths/page.tsx", "app/vocabulary/page.tsx", "app/english/[id]/page.tsx"]) {
    const src = readFileSync(file, "utf8");
    const call = src.match(/recordLegacyPracticeEvidence\(\{[\s\S]*?\}\)/);
    assert.ok(call, `recordLegacyPracticeEvidence call must exist in ${file}`);
    assert.doesNotMatch(
      call![0],
      /supportTier:/,
      `${file}'s deterministic (non-AI) scoring must keep relying on the safe "independent" default, not be changed by this Writing-specific fix`
    );
  }
});
