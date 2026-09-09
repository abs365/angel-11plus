import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * CSSE Two-Paper Mock, final production acceptance — the bounded admin
 * Mock Report Release surface (app/admin-beta/mock-report-release/
 * page.tsx). Adds no new RPC/RLS/backend logic — drives the existing,
 * unmodified releaseMockReport() wrapper around mock_release_report()
 * (migration 227). This project has no jsdom/React Testing Library, so
 * this mirrors the established convention for a page component:
 * structural source-text assertions against the real source.
 */

const SOURCE = fs.readFileSync("app/admin-beta/mock-report-release/page.tsx", "utf8");

test("admin surface fails closed: checking/not-signed-in/not-admin all render before any release UI, only 'admin' reaches it", () => {
  assert.match(SOURCE, /type AccessState = "checking" \| "not-signed-in" \| "not-admin" \| "admin";/);
  assert.match(SOURCE, /if \(access === "not-signed-in"\) return <AdminSignIn \/>;/);
  assert.match(SOURCE, /if \(access === "not-admin"\) return <NotAuthorized/);
  assert.match(SOURCE, /checkIsAdmin\(\)\.then\(\(isAdmin\) => setAccess\(isAdmin \? "admin" : "not-admin"\)\)/);
});

test("release action uses the existing releaseMockReport() wrapper -- no direct rpc() or table write anywhere in this file", () => {
  assert.match(SOURCE, /import \{ releaseMockReport \} from "@\/lib\/mockAttempt\/client";/);
  assert.match(SOURCE, /const result = await releaseMockReport\(supabase, trimmedId\);/);
  assert.doesNotMatch(SOURCE, /\.rpc\(/);
  assert.doesNotMatch(SOURCE, /\.from\(["']ali_mock_attempt/);
});

test("the trimmed, validated attempt id is what gets sent -- not the raw input", () => {
  assert.match(SOURCE, /const trimmedId = attemptId\.trim\(\);/);
  assert.match(SOURCE, /const isValidId = UUID_PATTERN\.test\(trimmedId\);/);
  assert.match(SOURCE, /releaseMockReport\(supabase, trimmedId\)/);
});

test("release requires an explicit confirmation step before the RPC is ever called", () => {
  assert.match(SOURCE, /function handleRequestRelease\(\)[\s\S]*?setStatus\("confirming"\);/);
  assert.match(SOURCE, /function handleConfirmRelease\(\)/);
  // The confirming branch must render a distinct "Confirm release" action, not auto-fire.
  assert.match(SOURCE, /status === "confirming"/);
  assert.match(SOURCE, /onClick=\{handleConfirmRelease\}/);
});

test("duplicate submission is prevented: handleConfirmRelease itself re-checks status, and the input/buttons disable while releasing", () => {
  const fnMatch = SOURCE.match(/async function handleConfirmRelease\(\)[\s\S]*?\n  \}/);
  assert.ok(fnMatch, "handleConfirmRelease not found");
  assert.match(fnMatch![0], /if \(!isValidId \|\| status === "releasing"\) return;/);
  assert.match(SOURCE, /disabled=\{status === "releasing" \|\| status === "confirming"\}/);
});

test("success is set only after a response with no error -- never optimistically before the call resolves", () => {
  const fnMatch = SOURCE.match(/async function handleConfirmRelease\(\)[\s\S]*?\n  \}/);
  const body = fnMatch![0];
  const errorBranchIndex = body.indexOf("if (result.error)");
  const successIndex = body.indexOf('setStatus("success")');
  assert.ok(errorBranchIndex !== -1 && successIndex !== -1 && errorBranchIndex < successIndex, "error must be checked before success is set");
  assert.match(body, /if \(result\.error\) \{[\s\S]*?return;\s*\}/);
});

test("a governed failure surfaces the RPC's own exact error message, never a replaced/invented one", () => {
  assert.match(SOURCE, /setErrorMessage\(result\.error\);/);
  assert.match(SOURCE, /\{errorMessage\}/);
});

test("this UI never mutates report state locally -- no setReport/setReleased boolean flipped except from a real RPC response, and the success panel discloses it cannot re-verify the row", () => {
  assert.doesNotMatch(SOURCE, /report_release_state\s*[:=]/);
  assert.match(SOURCE, /This page cannot independently re-verify the row afterward/);
});

test("no bulk release capability exists -- exactly one attempt id field, one release path", () => {
  const idInputMatches = SOURCE.match(/type="text"/g) ?? [];
  assert.equal(idInputMatches.length, 1, "expected exactly one attempt-id text input");
});
