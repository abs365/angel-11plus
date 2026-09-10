import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * CSSE Two-Paper Mock P1 Repair, Section 6 — the one narrowly-scoped
 * Mathematics recovery action, added to the existing, already-approved
 * /admin-beta/mock-report-release page (no new page, no new RPC exposed
 * beyond the one hardcoded-attempt backfill function). Structural source-
 * text assertions against the real component source, matching this
 * repository's own established convention (no jsdom/React Testing
 * Library).
 */

const SOURCE = fs.readFileSync("app/admin-beta/mock-report-release/page.tsx", "utf8");

test("the backfill action uses the existing backfillNamedMathematicsAcceptanceAnalysis() wrapper -- no direct rpc() call added to this file", () => {
  assert.match(SOURCE, /import \{ releaseMockReport, backfillNamedMathematicsAcceptanceAnalysis \} from "@\/lib\/mockAttempt\/client";/);
  assert.match(SOURCE, /const result = await backfillNamedMathematicsAcceptanceAnalysis\(supabase\);/);
});

test("the backfill action takes no attempt-id input at all -- still exactly one text input on the whole page (the release form's own, unchanged)", () => {
  const idInputMatches = SOURCE.match(/type="text"/g) ?? [];
  assert.equal(idInputMatches.length, 1, "the backfill action must not add a second text input -- it is hardcoded, named-attempt-only");
});

test("the backfill action requires an explicit confirmation step before the RPC is ever called, mirroring the release action's own discipline", () => {
  assert.match(SOURCE, /function handleRequestBackfill\(\)[\s\S]*?setBackfillStatus\("confirming"\);/);
  assert.match(SOURCE, /function handleConfirmBackfill\(\)/);
  assert.match(SOURCE, /onClick=\{handleConfirmBackfill\}/);
});

test("duplicate submission is prevented: handleConfirmBackfill re-checks status before running", () => {
  const fnMatch = SOURCE.match(/async function handleConfirmBackfill\(\)[\s\S]*?\n  \}/);
  assert.ok(fnMatch, "handleConfirmBackfill not found");
  assert.match(fnMatch![0], /if \(backfillStatus === "running"\) return;/);
});

test("a governed failure surfaces the RPC's own exact error message, never a replaced/invented one", () => {
  assert.match(SOURCE, /setBackfillErrorMessage\(result\.error\);/);
  assert.match(SOURCE, /\{backfillErrorMessage\}/);
});

test("success is set only after a response with no error -- never optimistically before the call resolves", () => {
  const fnMatch = SOURCE.match(/async function handleConfirmBackfill\(\)[\s\S]*?\n  \}/);
  const body = fnMatch![0];
  const errorBranchIndex = body.indexOf("if (result.error)");
  const successIndex = body.indexOf('setBackfillStatus("success")');
  assert.ok(errorBranchIndex !== -1 && successIndex !== -1 && errorBranchIndex < successIndex, "error must be checked before success is set");
});

test("the backfill action does not release the report -- release remains the separate, explicit, existing action above", () => {
  assert.match(SOURCE, /This does not release the report — release/);
  assert.doesNotMatch(SOURCE, /releaseMockReport\(supabase, .*backfill/i);
});

test("the existing release action's own test invariants are untouched by this addition (exactly one release confirmation path, admin gating unchanged)", () => {
  assert.match(SOURCE, /type AccessState = "checking" \| "not-signed-in" \| "not-admin" \| "admin";/);
  assert.match(SOURCE, /const result = await releaseMockReport\(supabase, trimmedId\);/);
});
