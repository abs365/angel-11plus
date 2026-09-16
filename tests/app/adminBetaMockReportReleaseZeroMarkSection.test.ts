import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * CSSE Two-Paper Mock P1 Repair, English Full Mock assessment completion —
 * the second named-recovery section on the bounded admin Mock Report
 * Release surface (app/admin-beta/mock-report-release/page.tsx). Same
 * discipline as tests/app/adminBetaMockReportRelease.test.ts's own
 * Mathematics-backfill coverage: this adds no new RPC/RLS/backend logic —
 * drives the existing, unmodified mock_apply_manual_mark() (migration
 * 227/252) via applyManualMark() (lib/mockAttempt/manualMarkRequest.ts).
 * Structural source-text assertions, matching this project's own
 * established convention for a page component (no jsdom/RTL).
 */

const SOURCE = fs.readFileSync("app/admin-beta/mock-report-release/page.tsx", "utf8");

test("the attempt id and all 5 question ids are fixed literals in this file, never a caller-editable field", () => {
  assert.match(SOURCE, /const ENGLISH_ACCEPTANCE_ATTEMPT_ID = "d15dd181-4a4e-4a02-bd71-32a3a4cf2a91";/);
  const ids = [
    "eng-inc002-roboticsfinal-q03",
    "eng-inc002-roboticsfinal-q05",
    "eng-inc002-roboticsfinal-q08",
    "eng-inc002-sailandsteam-q03",
    "eng-inc002-sailandsteam-q07",
  ];
  for (const id of ids) {
    assert.match(SOURCE, new RegExp(`id: "${id}"`), `expected ${id} to be a fixed literal in UNANSWERED_READING_ZERO_MARK_QUESTIONS`);
  }
});

test("the zero-mark action uses the existing applyManualMark() wrapper -- no direct rpc() or table write anywhere in this file", () => {
  assert.match(SOURCE, /import \{ applyManualMark \} from "@\/lib\/mockAttempt\/manualMarkRequest";/);
  assert.match(SOURCE, /const outcome = await applyManualMark\(supabase, ENGLISH_ACCEPTANCE_ATTEMPT_ID, q\.id, 0\);/);
  assert.doesNotMatch(SOURCE, /\.rpc\(/);
  assert.doesNotMatch(SOURCE, /\.from\(["']ali_mock_attempt/);
});

test("marksAwarded is hardcoded to 0 -- this action can structurally never award a positive mark", () => {
  assert.match(SOURCE, /applyManualMark\(supabase, ENGLISH_ACCEPTANCE_ATTEMPT_ID, q\.id, 0\)/);
  assert.doesNotMatch(SOURCE, /marksAwarded:\s*[1-9]/);
});

test("the zero-mark action requires an explicit confirmation step before any request is ever made", () => {
  assert.match(SOURCE, /function handleRequestZeroMark\(\)[\s\S]*?setZeroMarkStatus\("confirming"\);/);
  assert.match(SOURCE, /function handleConfirmZeroMark\(\)/);
  assert.match(SOURCE, /zeroMarkStatus === "confirming"/);
  assert.match(SOURCE, /onClick=\{handleConfirmZeroMark\}/);
});

test("duplicate submission is prevented: handleConfirmZeroMark re-checks status before running", () => {
  const fn = SOURCE.match(/async function handleConfirmZeroMark\(\) \{([\s\S]*?)\n  \}/);
  assert.ok(fn, "expected handleConfirmZeroMark function body");
  assert.match(fn![1], /if \(zeroMarkStatus === "running"\) return;/);
});

test("questions are processed sequentially, one at a time, never in parallel (no Promise.all over the question list)", () => {
  const fn = SOURCE.match(/async function handleConfirmZeroMark\(\) \{([\s\S]*?)\n  \}/);
  assert.match(fn![1], /for \(const q of UNANSWERED_READING_ZERO_MARK_QUESTIONS\) \{/);
  assert.doesNotMatch(fn![1], /Promise\.all/);
});

test("an already-resolved item (409 mark_rejected) is surfaced as informational, not an alarming failure", () => {
  assert.match(SOURCE, /outcome\.status === 409 && outcome\.reason === "mark_rejected"/);
  assert.match(SOURCE, /"already_resolved"/);
});

test("per-item results render individually -- success, already-resolved, and error are visually distinct", () => {
  assert.match(SOURCE, /result\?\.state === "success"/);
  assert.match(SOURCE, /result\?\.state === "already_resolved"/);
  assert.match(SOURCE, /result\?\.state === "error"/);
});

test("this section never touches Writing content or the writing-assessment persistence path", () => {
  assert.doesNotMatch(SOURCE, /mock_persist_writing_assessment/);
  assert.doesNotMatch(SOURCE, /mock-writing-assessment/);
});
