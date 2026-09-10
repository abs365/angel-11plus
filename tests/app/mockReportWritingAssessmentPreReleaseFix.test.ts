import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * CSSE Two-Paper Mock P1 Repair (P1-B) — a real, traced deadlock: Writing
 * assessment (requestMockWritingAssessment) previously fired only INSIDE
 * the reportReleaseState === "released" branch, but release requires
 * scoring_state='scored', which (after migration 251) requires Writing
 * assessment to have already run. This page must request Writing
 * assessment recovery from the SAME "not yet released" branch the
 * existing Reading-scoring recovery request already uses, gated by the
 * new isWritingAssessmentRecoveryEligible() (english-full-mock-v1 only).
 * Structural source-text assertions, matching this repository's own
 * established convention for this file.
 */

const SOURCE = fs.readFileSync("app/learning-intelligence/mock-report/[attemptId]/page.tsx", "utf8");

function recoveryBlock(): string {
  const start = SOURCE.indexOf("if (!recoveryAttemptedRef.current) {");
  const end = SOURCE.indexOf("void load();");
  if (start === -1 || end === -1 || end <= start) throw new Error("recovery block not found");
  return SOURCE.slice(start, end);
}

test("isWritingAssessmentRecoveryEligible is imported alongside the existing isReadingScoringRecoveryEligible", () => {
  assert.match(SOURCE, /import \{ isReadingScoringRecoveryEligible, isWritingAssessmentRecoveryEligible \} from "@\/lib\/mockAttempt\/workspace";/);
});

test("a writing-assessment recovery request now fires from the pre-release recovery branch, not only after release", () => {
  const block = recoveryBlock();
  assert.match(block, /isReadingScoringRecoveryEligible\(summary\.data\)/, "the pre-existing reading-recovery call must still be present");
  assert.match(block, /isWritingAssessmentRecoveryEligible\(summary\.data\)/, "the new writing-assessment-recovery call must be present in the same branch");
  assert.match(block, /void requestMockWritingAssessment\(supabase, params\.attemptId\)\.then\(logWritingAssessmentRequestOutcome\);/);
});

test("the pre-release writing-assessment call is gated by isWritingAssessmentRecoveryEligible, not fired unconditionally", () => {
  const block = recoveryBlock();
  assert.match(
    block,
    /if \(!cancelled && !summary\.error && isWritingAssessmentRecoveryEligible\(summary\.data\)\) \{\s*\n\s*void requestMockWritingAssessment/
  );
});

test("the original post-release writing-assessment call (fire-and-forget once the report is released) is still present, unchanged -- this is an addition, not a replacement", () => {
  const releasedBranch = SOURCE.split('result.data.reportReleaseState === "released"')[1]?.split("setPhase(\"not-available\");")[0] ?? "";
  assert.match(releasedBranch, /void requestMockWritingAssessment\(supabase, params\.attemptId\)\.then\(\(outcome\) => \{/);
});

test("recovery is still bounded to once per page load via the existing recoveryAttemptedRef guard -- no new, separate ref introduced", () => {
  const refDeclarations = SOURCE.match(/const \w+Ref = useRef/g) ?? [];
  assert.equal(refDeclarations.length, 1, "expected exactly one recovery-bounding ref, reused for both reading and writing recovery");
});
