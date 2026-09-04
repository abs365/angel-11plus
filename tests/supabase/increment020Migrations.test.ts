import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Programme Increment 020 — structural tests against the three new
 * migrations' own raw SQL text, matching this codebase's established
 * convention (tests/supabase/englishSupportedVerificationProvenanceReconciliation.test.ts):
 * string/regex assertions against the file, never a live database. None
 * of these three migrations has been applied.
 */

function executableOf(path: string): string {
  return fs
    .readFileSync(path, "utf8")
    .split("\n")
    .filter((l) => !l.trimStart().startsWith("--"))
    .join("\n");
}

// ─── Migration 221 — English passage practice-eligibility reconciliation ──

const m221 = executableOf("supabase/migrations/221_english_passage_practice_eligibility_reconciliation.sql");

test("221 is wrapped in a single begin/commit transaction", () => {
  assert.match(m221, /^\s*begin;/m);
  assert.match(m221, /^\s*commit;/m);
});

test("221 only ever promotes to practice_eligible -- never sets or references mock_eligible as a target value", () => {
  assert.match(m221, /set eligibility_status = 'practice_eligible'/);
  // The only "mock_eligible" appearances must be read-side guards excluding it, not a write target.
  const setStatements = [...m221.matchAll(/set\s+eligibility_status\s*=\s*'([a-z_]+)'/g)].map((m) => m[1]);
  assert.deepEqual(new Set(setStatements), new Set(["practice_eligible"]));
});

test("221 never touches ali_question_bank, ali_family_review, or any Mock table -- passage-only, read-and-write on ali_passage_bank alone", () => {
  assert.ok(!/update\s+public\.ali_question_bank/i.test(m221));
  assert.ok(!/insert\s+into\s+public\.ali_family_review/i.test(m221));
  assert.ok(!/update\s+public\.ali_mock_/i.test(m221));
});

test("221 excludes every Mock-exposed passage via the real ali_mock_exposed_passage_ids view, and refuses if one is somehow touched", () => {
  assert.match(m221, /ali_mock_exposed_passage_ids/);
  assert.match(m221, /raise exception/i);
});

test("221 discloses NOT APPLIED", () => {
  assert.match(fs.readFileSync("supabase/migrations/221_english_passage_practice_eligibility_reconciliation.sql", "utf8"), /NOT APPLIED/);
});

// ─── Migration 222 — mr03-compound-area-perimeter content ─────────────────

const m222 = executableOf("supabase/migrations/222_mathematics_mr03_compound_shape_wave1.sql");

test("222 is wrapped in a single begin/commit transaction", () => {
  assert.match(m222, /^\s*begin;/m);
  assert.match(m222, /^\s*commit;/m);
});

test("222 inserts exactly 8 rows, all idempotent via on conflict (id) do nothing, all into ali_question_bank only", () => {
  const inserts = [...m222.matchAll(/insert into public\.ali_question_bank/g)];
  assert.equal(inserts.length, 8);
  const conflictGuards = [...m222.matchAll(/on conflict \(id\) do nothing/g)];
  assert.equal(conflictGuards.length, 8);
  assert.ok(!/insert into public\.(?!ali_question_bank)/i.test(m222), "this migration must only ever insert into ali_question_bank");
});

test("222 never sets eligibility_status to anything but 'provisional' -- new content is never self-approved", () => {
  const statuses = [...m222.matchAll(/'provisional', 1, true/g)];
  assert.equal(statuses.length, 8);
  assert.ok(!/'practice_eligible'|'mock_eligible'/.test(m222));
});

test("222 never touches the protected mock-mr03mr07-perimeterarea family or any mock- prefixed id", () => {
  assert.ok(!m222.includes("mock-mr03mr07-perimeterarea"));
  assert.ok(!/'mock-/.test(m222), "this migration's own ids must all be Practice-track (mr03-compound-*), never a mock- prefixed id");
});

test("222 tags exactly one row FAR_TRANSFER (the unseen-transfer item) and none mock_eligible", () => {
  const farTransfer = [...m222.matchAll(/'FAR_TRANSFER'/g)];
  assert.equal(farTransfer.length, 1);
});

test("222 provenance is angel_original for every row", () => {
  const provenance = [...m222.matchAll(/'angel_original'/g)];
  assert.equal(provenance.length, 8);
});

test("222 discloses NOT APPLIED", () => {
  assert.match(fs.readFileSync("supabase/migrations/222_mathematics_mr03_compound_shape_wave1.sql", "utf8"), /NOT APPLIED/);
});

// ─── Migration 223 — pending-review registration ──────────────────────────

const m223 = executableOf("supabase/migrations/223_mathematics_mr03_compound_shape_wave1_pending_review.sql");

test("223 registers exactly one pending-review target for mr03-compound-area-perimeter, reviewer UNASSIGNED", () => {
  assert.match(m223, /'mr03-compound-area-perimeter'/);
  assert.match(m223, /'UNASSIGNED'/);
  assert.match(m223, /pending_independent_review/);
});

test("223 never touches ali_question_bank -- registration only", () => {
  assert.ok(!/ali_question_bank/.test(m223));
});

test("223 is idempotent via a 'where not exists' guard", () => {
  assert.match(m223, /where not exists/i);
});
