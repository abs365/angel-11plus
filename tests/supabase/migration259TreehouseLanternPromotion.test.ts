import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Educational Depth Phase 1, Wave 2 — Migration 259 (Treehouse Lantern
 * practice-eligibility promotion). Structural tests against the
 * migration's own raw SQL text, matching this codebase's established
 * convention (tests/supabase/increment020Migrations.test.ts's own tests
 * for migration 224, the closest real precedent this migration mirrors):
 * string/regex assertions against the file, never a live database.
 * Migration 259 itself remains NOT APPLIED as of this test.
 */

const PATH = "supabase/migrations/259_writing_picture_narrative_treehouselantern_promotion.sql";

function executableOf(path: string): string {
  return fs
    .readFileSync(path, "utf8")
    .split("\n")
    .filter((l) => !l.trimStart().startsWith("--"))
    .join("\n");
}

const m259 = executableOf(PATH);
const raw = fs.readFileSync(PATH, "utf8");

test("259 is wrapped in a single begin/commit transaction", () => {
  assert.match(m259, /^\s*begin;/m);
  assert.match(m259, /^\s*commit;/m);
});

test("259 targets exactly the one Treehouse Lantern id/family, never the rejected Riverboat id/family", () => {
  assert.match(m259, /'eng-practice-writing-picturenarrative-treehouselantern-01'/);
  assert.match(m259, /'eng-practice-writing-wc01b-treehouselantern'/);
  assert.ok(!m259.includes("eng-practice-writing-picturenarrative-riverboat-01"), "must never reference the rejected Riverboat row's id");
  assert.ok(!m259.includes("eng-practice-writing-wc01b-riverboat"), "must never reference the rejected Riverboat family_id");
});

test("259 refuses (fail-closed) when the family does not have exactly 1 row", () => {
  assert.match(m259, /v_total_family_count\s*<>\s*1/);
  assert.match(m259, /raise exception[^;]*expected exactly 1 row/i);
});

test("259 refuses when the target row doesn't match the exact expected shape (family_id/subject/skill/provenance/eligibility_status/active)", () => {
  assert.match(m259, /subject\s*=\s*'writing'/);
  assert.match(m259, /skill\s*=\s*'QT-WC-01b'/);
  assert.match(m259, /provenance\s*=\s*'angel_original'/);
  assert.match(m259, /eligibility_status\s*=\s*'authentic_assessment_candidate'/);
  assert.match(m259, /v_pending_count\s*<>\s*1/);
});

test("259 refuses on any Mock exposure, checked against the real canonical ali_mock_exposed_question_ids signal, before AND after the write", () => {
  const occurrences = [...m259.matchAll(/ali_mock_exposed_question_ids/g)];
  assert.ok(occurrences.length >= 2, "must check Mock exposure both pre-write and post-write");
  assert.match(m259, /v_mock_exposed_count\s*<>\s*0/);
});

test("259 refuses on any pre-existing mock_eligible row, before AND after the write", () => {
  const occurrences = [...m259.matchAll(/mock_eligible/g)];
  assert.ok(occurrences.length >= 2);
});

test("259 refuses without a genuinely closed, real (non-UNASSIGNED) reviewer decision under the exact writing-prompt independent-review type -- never inferred merely from the pending placeholder's own existence", () => {
  assert.match(m259, /reviewer\s*<>\s*'UNASSIGNED'/);
  assert.match(m259, /review_type\s*=\s*'mock_writing_prompt_independent_review'/);
  assert.match(m259, /decision\s*=\s*'approved'/);
  assert.match(m259, /v_closed_review_count\s*<\s*1/);
  assert.match(m259, /never sufficient/i);
});

test("259 accepts approved_with_amendment only alongside a genuine, separate amendment_verification row -- not the same row re-checked", () => {
  assert.match(m259, /approved_with_amendment/);
  assert.match(m259, /review_type\s*=\s*'amendment_verification'/);
});

test("259 only ever sets eligibility_status -- no other column, and only 'practice_eligible' as the target value", () => {
  const setStatements = [...m259.matchAll(/set\s+([a-z_]+)\s*=/gi)].map((m) => m[1].toLowerCase());
  assert.deepEqual(new Set(setStatements), new Set(["eligibility_status"]));
  const setValues = [...m259.matchAll(/set\s+eligibility_status\s*=\s*'([a-z_]+)'/g)].map((m) => m[1]);
  assert.deepEqual(new Set(setValues), new Set(["practice_eligible"]));
});

test("259 never writes to ali_family_review -- review history is read-only from this migration's own perspective", () => {
  assert.ok(!/insert into public\.ali_family_review|update public\.ali_family_review|delete from public\.ali_family_review/i.test(m259));
});

test("259 never touches ali_passage_bank or any Mock form/table by name", () => {
  assert.ok(!/ali_passage_bank/.test(m259));
  assert.ok(!/ali_mock_form/.test(m259));
});

test("259 post-write re-verifies: practice_eligible, zero mock_eligible, zero Mock-exposed, family still exactly 1 row", () => {
  assert.match(m259, /v_post_mock_eligible_count\s*<>\s*0/);
  assert.match(m259, /v_post_mock_exposed_count\s*<>\s*0/);
  assert.match(m259, /v_post_family_count\s*<>\s*1/);
  assert.match(m259, /not v_post_promoted/);
});

test("259 is idempotent: an already-promoted state is a safe no-op, not an error", () => {
  assert.match(m259, /v_already_promoted_count\s*=\s*1/);
  assert.match(m259, /already applied/i);
});

test("259 discloses NOT APPLIED, pending Founder application", () => {
  assert.match(raw, /NOT APPLIED/);
});
