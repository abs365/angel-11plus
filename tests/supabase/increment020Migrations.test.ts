import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Programme Increment 020 — structural tests against this increment's own
 * migrations' raw SQL text, matching this codebase's established
 * convention (tests/supabase/englishSupportedVerificationProvenanceReconciliation.test.ts):
 * string/regex assertions against the file, never a live database.
 * Migrations 222/223 are Founder-confirmed applied and live-verified;
 * 221/224 remain NOT APPLIED/HOLD. These tests check the migration
 * FILES' own real text regardless of application status.
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

test("222 discloses its own real, current application status (Founder-authorised, now applied -- not still a plain NOT-APPLIED draft)", () => {
  const raw = fs.readFileSync("supabase/migrations/222_mathematics_mr03_compound_shape_wave1.sql", "utf8");
  assert.match(raw, /Founder-authorised for manual production application/i);
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

// ─── Migration 224 — practice-eligible promotion (NOT APPLIED) ────────────

const m224 = executableOf("supabase/migrations/224_mathematics_mr03_compound_shape_wave1_practice_eligible_promotion.sql");

test("224 is wrapped in a single begin/commit transaction", () => {
  assert.match(m224, /^\s*begin;/m);
  assert.match(m224, /^\s*commit;/m);
});

test("224 targets exactly the 8 authorised ids, no more no less", () => {
  for (let i = 1; i <= 8; i++) {
    assert.match(m224, new RegExp(`'mr03-compound-0${i}'`));
  }
  assert.ok(!/'mr03-compound-09'/.test(m224));
});

test("224 refuses (fail-closed) when the family does not have exactly 8 rows -- an unexpected/missing row check", () => {
  assert.match(m224, /v_total_family_count\s*<>\s*8/);
  assert.match(m224, /raise exception[^;]*expected exactly 8 rows/i);
});

test("224 refuses when the 8 target rows don't all match the exact expected shape (subject/skill/family_id/provenance/eligibility_status/active)", () => {
  assert.match(m224, /v_pending_count\s*<>\s*8/);
  assert.match(m224, /subject\s*=\s*'maths'/);
  assert.match(m224, /skill\s*=\s*'QT-MR-07'/);
  assert.match(m224, /provenance\s*=\s*'angel_original'/);
  assert.match(m224, /eligibility_status\s*=\s*'provisional'/);
});

test("224 refuses on any Mock exposure, checked against the real canonical ali_mock_exposed_question_ids signal, before AND after the write", () => {
  const occurrences = [...m224.matchAll(/ali_mock_exposed_question_ids/g)];
  assert.ok(occurrences.length >= 2, "must check Mock exposure both pre-write and post-write");
  assert.match(m224, /v_mock_exposed_count\s*<>\s*0/);
});

test("224 refuses on any pre-existing mock_eligible row, before AND after the write", () => {
  const occurrences = [...m224.matchAll(/mock_eligible/g)];
  assert.ok(occurrences.length >= 2);
});

test("224 refuses without a genuinely closed, real (non-UNASSIGNED) Founder review decision -- never inferred merely from the pending row's own existence", () => {
  assert.match(m224, /reviewer\s*<>\s*'UNASSIGNED'/);
  assert.match(m224, /decision\s*=\s*'approved'/);
  assert.match(m224, /v_closed_review_count\s*<\s*1/);
  assert.match(m224, /never sufficient/i);
});

test("224 refuses without a genuine, separate amendment_verification row when the decision is approved_with_amendment -- not the same row re-checked", () => {
  assert.match(m224, /approved_with_amendment/);
  assert.match(m224, /review_type\s*=\s*'amendment_verification'/);
});

test("224 refuses if mr03-compound-06's amendment has regressed -- checked before AND after the write", () => {
  const answerChecks = [...m224.matchAll(/answer'\s*=\s*'12m'|=\s*'12m'/g)];
  assert.ok(answerChecks.length >= 2, "must re-check the answer both pre-write and post-write");
  assert.match(m224, /notToScale/);
  assert.match(m224, /FAR_TRANSFER/);
  assert.match(m224, /v_q06_ok/);
});

test("224 only ever sets eligibility_status -- no other column, and only 'practice_eligible' as the target value", () => {
  const setStatements = [...m224.matchAll(/set\s+([a-z_]+)\s*=/gi)].map((m) => m[1].toLowerCase());
  assert.deepEqual(new Set(setStatements), new Set(["eligibility_status"]));
  const setValues = [...m224.matchAll(/set\s+eligibility_status\s*=\s*'([a-z_]+)'/g)].map((m) => m[1]);
  assert.deepEqual(new Set(setValues), new Set(["practice_eligible"]));
});

test("224 never writes to ali_family_review -- review history is read-only from this migration's own perspective", () => {
  assert.ok(!/insert into public\.ali_family_review|update public\.ali_family_review|delete from public\.ali_family_review/i.test(m224));
});

test("224 never touches ali_passage_bank, Mock forms, or Reading content", () => {
  assert.ok(!/ali_passage_bank/.test(m224));
  assert.ok(!/ali_mock_form/.test(m224));
});

test("224 post-write re-verifies: exactly 8 practice_eligible, zero provisional, zero mock_eligible, zero Mock-exposed, family still exactly 8 rows", () => {
  assert.match(m224, /v_post_promoted_count\s*<>\s*8/);
  assert.match(m224, /v_post_provisional_count\s*<>\s*0/);
  assert.match(m224, /v_post_mock_eligible_count\s*<>\s*0/);
  assert.match(m224, /v_post_mock_exposed_count\s*<>\s*0/);
  assert.match(m224, /v_post_family_count\s*<>\s*8/);
});

test("224 is idempotent: an already-fully-promoted state is a safe no-op, not an error", () => {
  assert.match(m224, /v_already_promoted_count\s*=\s*8/);
  assert.match(m224, /already applied/i);
});

test("224 discloses NOT APPLIED", () => {
  assert.match(fs.readFileSync("supabase/migrations/224_mathematics_mr03_compound_shape_wave1_practice_eligible_promotion.sql", "utf8"), /NOT APPLIED/);
});
