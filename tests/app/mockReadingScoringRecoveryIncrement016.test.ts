import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Founder invocation-reliability repair (Programme Completion Increment
 * 016) — Part C (mock-report page recovery) and the submission/scoring
 * separation Part A requires. Source-text assertions: this repository has
 * no React-rendering test infrastructure (see lib/mockAttempt/workspace.
 * ts's own header, and tests/lib/mockAttempt/workspace.test.ts's real
 * pure-function coverage of the extractable logic this same repair
 * added) — everything genuinely extractable already has real behavioural
 * tests elsewhere; what remains here is wiring inside React components,
 * proven the same way this repository already proves that class of
 * contract.
 */

const REPORT_PAGE = readFileSync("app/learning-intelligence/mock-report/[attemptId]/page.tsx", "utf8");
const MOCK_EXAM = readFileSync("app/learning-intelligence/mock-exam/page.tsx", "utf8");

test("the report page only attempts recovery once per page load -- guarded by a ref, not a render-triggered condition", () => {
  assert.match(REPORT_PAGE, /const recoveryAttemptedRef = useRef\(false\)/);
  assert.match(REPORT_PAGE, /if \(!recoveryAttemptedRef\.current\) \{\s*\n\s*recoveryAttemptedRef\.current = true;/);
});

test("recovery eligibility is decided by the real, tested isReadingScoringRecoveryEligible() -- never a duplicated inline condition", () => {
  assert.match(REPORT_PAGE, /import \{ isReadingScoringRecoveryEligible \} from "@\/lib\/mockAttempt\/workspace";/);
  assert.match(REPORT_PAGE, /isReadingScoringRecoveryEligible\(summary\.data\)/);
});

test("recovery reads attempt ownership/lifecycle via the owner-scoped getMockAttemptSummary(), never a privileged or service_role read", () => {
  assert.match(REPORT_PAGE, /import \{ getMockAttemptReport, getMockAttemptSummary \} from "@\/lib\/mockAttempt\/client";/);
  assert.doesNotMatch(REPORT_PAGE, /service_role/i);
});

test("recovery reuses the SAME requestReadingScoring() the mock-exam page uses -- no second/duplicate scoring request implementation", () => {
  assert.match(REPORT_PAGE, /import \{ requestReadingScoring, logReadingScoringRequestOutcome \} from "@\/lib\/mockAttempt\/readingScoringRequest";/);
  assert.match(MOCK_EXAM, /import \{ requestReadingScoring, logReadingScoringRequestOutcome \} from "@\/lib\/mockAttempt\/readingScoringRequest";/);
});

test("recovery never blocks or delays the report UI -- fired with void ...then(...), not awaited, and phase is already set before it runs", () => {
  assert.match(REPORT_PAGE, /void requestReadingScoring\(supabase, params\.attemptId\)\.then\(logReadingScoringRequestOutcome\);/);
  const setPhaseIndex = REPORT_PAGE.indexOf('setPhase("not-available");');
  const recoveryIndex = REPORT_PAGE.indexOf("recoveryAttemptedRef.current) {");
  assert.ok(setPhaseIndex > -1 && recoveryIndex > -1 && setPhaseIndex < recoveryIndex, "setPhase(\"not-available\") must run before the recovery attempt, not depend on its outcome");
});

/**
 * Part A's own explicit requirement: "A scoring-service failure must NOT
 * cause the learner to resubmit the Mock or lose the submitted attempt."
 * Proven structurally at both call sites: mock_submit_attempt() (the real
 * assessment-submission commit) is awaited and checked for its OWN error
 * BEFORE the scoring request is ever fired, and the scoring request's own
 * outcome is never fed back into errorMessage/phase.
 */
test("ASSESSMENT SUBMISSION SUCCESS is decided entirely before, and independently of, the scoring request -- Founder Part A separation", () => {
  const submitIndex = MOCK_EXAM.indexOf("const result = await submitMockAttempt(supabase, attemptId);");
  const scoringIndex = MOCK_EXAM.indexOf('if (attemptType === "timed_section") {\n      void requestReadingScoring(supabase, attemptId)');
  assert.ok(submitIndex > -1 && scoringIndex > -1 && submitIndex < scoringIndex);
  // The scoring request's own outcome is only ever consumed by
  // logReadingScoringRequestOutcome (console-only) -- never assigned to
  // errorMessage or fed into setPhase.
  assert.doesNotMatch(MOCK_EXAM, /requestReadingScoring\([^)]*\)\.then\(\s*\(?outcome\)?\s*=>\s*\{?\s*set(ErrorMessage|Phase)/);
});

test("Mathematics (full_mock) submissions never reach requestReadingScoring at either call site -- unchanged by this repair", () => {
  // Both real occurrences (submit + finalize_expired) are already proven
  // to be gated by `attemptType === "timed_section"` in
  // tests/lib/server/mockScoringAuthorityIncrement016.test.ts's own count
  // of that exact guarded literal. This test only adds the negative
  // proof: no `full_mock` guard exists anywhere near the call.
  assert.doesNotMatch(MOCK_EXAM, /attemptType === "full_mock"\) \{\s*\n\s*void requestReadingScoring/);
});
