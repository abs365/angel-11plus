import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { deriveMockCycleSittingState } from "@/lib/mockAttempt/cycleState";
import { isVoidedMockAttempt, isReadingScoringRecoveryEligible, isWritingAssessmentRecoveryEligible } from "@/lib/mockAttempt/workspace";
import type { MockCycleAttemptRow } from "@/lib/mockAttempt/client";

/**
 * Invalid Mock Attempt Governance (migration 266) -- client half. A voided
 * attempt must never count as a paper, a result, a result "being prepared",
 * history, readiness, or a reason to request scoring; and no learner- or
 * parent-facing surface may ever name the void or its reason.
 */

function read(file: string): string {
  return readFileSync(file, "utf8").replace(/\r\n/g, "\n");
}

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...sourceFiles(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

const row = (subject: "mathematics" | "english", status: MockCycleAttemptRow["status"], id = `${subject}-${status}`): MockCycleAttemptRow => ({
  attemptId: id,
  subject,
  status,
  submittedAt: status === "submitted" ? "2026-09-24T00:00:00Z" : null,
});

test("sitting state: a voided paper reads as not started, never in progress or submitted", () => {
  const state = deriveMockCycleSittingState("c1", [row("english", "voided")]);
  assert.equal(state.english.paperState, "not_started");
  assert.equal(state.english.attemptId, null);
});

test("sitting state: a voided paper never completes a sitting, even beside a submitted other paper", () => {
  const state = deriveMockCycleSittingState("c1", [row("mathematics", "submitted"), row("english", "voided")]);
  assert.equal(state.mathematics.paperState, "submitted");
  assert.equal(state.english.paperState, "not_started");
  assert.equal(state.sittingComplete, false);
});

test("sitting state: once a legitimate replacement exists beside the voided original, the replacement is the paper", () => {
  const state = deriveMockCycleSittingState("c1", [row("english", "voided", "old"), row("english", "in_progress", "new")]);
  assert.equal(state.english.paperState, "in_progress");
  assert.equal(state.english.attemptId, "new");
});

test("existing behaviour unchanged for genuine attempts", () => {
  const state = deriveMockCycleSittingState("c1", [row("mathematics", "submitted"), row("english", "submitted")]);
  assert.equal(state.sittingComplete, true);
  assert.equal(deriveMockCycleSittingState("c1", [row("english", "in_progress")]).english.paperState, "in_progress");
});

test("isVoidedMockAttempt: only the voided status", () => {
  assert.equal(isVoidedMockAttempt({ status: "voided" }), true);
  for (const s of ["assigned", "ready", "in_progress", "submitted", "expired"] as const) assert.equal(isVoidedMockAttempt({ status: s }), false);
  assert.equal(isVoidedMockAttempt(null), false);
});

test("a voided attempt never triggers Reading or Writing scoring recovery", () => {
  assert.equal(isReadingScoringRecoveryEligible({ status: "voided", attemptType: "timed_section", formId: "reading-comprehension-mock-1" }), false);
  assert.equal(isWritingAssessmentRecoveryEligible({ status: "voided", attemptType: "full_mock", formId: "english-full-mock-v1" }), false);
});

test("cycle attempts query excludes voided rows at the source; history and readiness count submitted only", () => {
  const client = read("lib/mockAttempt/client.ts");
  const cycle = client.slice(client.indexOf("export async function getMockCycleAttempts("));
  assert.match(cycle.slice(0, cycle.indexOf("return { data: rows")), /\.eq\("cycle_id", cycleId\)[\s\S]*?\.neq\("status", "voided"\);/);
  const submitted = client.slice(client.indexOf("export async function getSubmittedMockAttempts("));
  assert.match(submitted.slice(0, 600), /\.eq\("status", "submitted"\)/, "history + readiness count (fetchRealCsseMockAttemptCount) read submitted only");
});

for (const [label, file] of [
  ["learner", "app/learning-intelligence/mock-report/[attemptId]/page.tsx"],
  ["parent", "app/learning-intelligence/parent/mock-report/[attemptId]/page.tsx"],
] as const) {
  test(`${label} report page: a voided attempt gets a neutral "no report" state, never "being prepared"`, () => {
    const src = read(file);
    assert.match(src, /type Phase = "loading" \| "not-available" \| "no-report" \| "ready" \| "error";/);
    assert.match(src, /isVoidedMockAttempt\(summary\.data\)/);
    const screen = src.slice(src.indexOf('{phase === "no-report" && ('), src.indexOf('{phase === "not-available" && ('));
    assert.match(screen, /There&apos;s no report for this Mock/);
    assert.doesNotMatch(screen, /void|defect|invalid|acceptance|correction|platform|error/i);
  });
}

test("learner report page decides 'no report' BEFORE any scoring recovery request can fire", () => {
  const src = read("app/learning-intelligence/mock-report/[attemptId]/page.tsx");
  const gate = src.indexOf('if (!summary.error && isVoidedMockAttempt(summary.data)) { setPhase("no-report"); return; }');
  assert.ok(gate > 0);
  assert.ok(gate < src.indexOf("void requestReadingScoring("));
  assert.ok(gate < src.indexOf('setPhase("not-available");'));
});

test("no learner- or parent-facing source reads or renders any void audit field or reason code", () => {
  const offenders: string[] = [];
  for (const root of ["app", "components"]) {
    for (const file of sourceFiles(root)) {
      if (/[\\/]admin-beta[\\/]/.test(file)) continue;
      if (/void_reason_code|void_note|voided_by_|status_before_void|platform_defect|acceptance_test|admin_correction/.test(read(file))) offenders.push(file);
    }
  }
  assert.deepEqual(offenders, []);
});
