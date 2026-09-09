import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * Migration 249 — structural verification of the raw SQL, matching this
 * repository's own established discipline for a NOT-APPLIED migration.
 * Guarded, fail-closed activation of english-full-mock-v1 — mirrors
 * migration 217's own "live re-verification, not just a flag flip"
 * discipline for Reading Comprehension Mock 1's own activation.
 */

const MIGRATION_PATH = path.join(__dirname, "../../supabase/migrations/249_csse_english_full_paper_activation.sql");
const SQL = fs.readFileSync(MIGRATION_PATH, "utf8");

test("migration discloses NOT APPLIED, matching this repository's own convention for a Founder-applied migration", () => {
  assert.match(SQL, /NOT APPLIED\. Generated for Founder review and manual application/);
});

test("makes no schema, function, or RLS change -- pure activation", () => {
  assert.doesNotMatch(SQL, /create (or replace )?function/i);
  assert.doesNotMatch(SQL, /alter table/i);
  assert.doesNotMatch(SQL, /create policy|drop policy/i);
  assert.doesNotMatch(SQL, /create table/i);
});

test("the only UPDATE anywhere in the migration targets ali_mock_form.active for english-full-mock-v1 alone", () => {
  const updates = SQL.match(/^\s*update public\.\w+/gim) ?? [];
  assert.equal(updates.length, 1, "expected exactly one UPDATE statement in the whole file");
  assert.match(SQL, /update public\.ali_mock_form set active = true where id = 'english-full-mock-v1';/);
});

test("never writes to ali_question_bank, reading-comprehension-mock-1, or first-mock-mathematics-v1", () => {
  assert.doesNotMatch(SQL, /update public\.ali_question_bank/);
  assert.doesNotMatch(SQL, /update public\.ali_mock_form set .*where id = 'reading-comprehension-mock-1'/);
  assert.doesNotMatch(SQL, /update public\.ali_mock_form set .*where id = 'first-mock-mathematics-v1'/);
});

test("activation is guarded by GET DIAGNOSTICS row_count and refuses unless exactly 1 row is affected", () => {
  const activationBlock = SQL.match(/-- ── Activation:[\s\S]*?end \$\$;/);
  assert.ok(activationBlock);
  assert.match(activationBlock![0], /get diagnostics v_row_count = row_count;/);
  assert.match(activationBlock![0], /if v_row_count <> 1 then/);
});

test("six distinct named precondition guards exist, each with its own RAISE EXCEPTION", () => {
  const preconditionReasons = [
    /expected exactly 1 english-full-mock-v1 row/,
    /expected 24 manifest entries with no duplicates/,
    /overlap reading-comprehension-mock-1/,
    /comprehension component totals % marks, expected exactly 39/,
    /eng-q2-picturenarrative-oldshed has no imageAssetUrl/,
    /ali_writing_assessment table does not exist/,
  ];
  for (const re of preconditionReasons) {
    assert.match(SQL, re, `missing precondition guard matching ${re}`);
  }
});

test("verifies the exact 39-mark total and the exact 22 target reading question ids, not a different figure", () => {
  const marksBlock = SQL.match(/-- ── Precondition 4:[\s\S]*?end \$\$;/);
  assert.ok(marksBlock);
  assert.match(marksBlock![0], /if v_marks_total <> 39 then/);
  const idMatches = marksBlock![0].match(/'eng-inc002-(?:sailandsteam|roboticsfinal)-q[0-9a-z]*'/g) ?? [];
  assert.equal(new Set(idMatches).size, 22);
});

test("postcondition block re-verifies active=true, manifest unchanged (24 entries), and both sibling forms untouched, all before commit", () => {
  const postBlock = SQL.match(/-- ── Postconditions:[\s\S]*?end \$\$;/);
  assert.ok(postBlock);
  const body = postBlock![0];
  assert.match(body, /if v_new_row\.active is distinct from true then/);
  assert.match(body, /if v_manifest_count <> 24 then/);
  assert.match(body, /reading-comprehension-mock-1[\s\S]*?jsonb_array_length\(v_reading_row\.question_manifest\) <> 28/);
  assert.match(body, /first-mock-mathematics-v1[\s\S]*?jsonb_array_length\(v_maths_row\.question_manifest\) <> 56/);
  // Postconditions must run BEFORE commit -- confirmed by position in the file.
  const commitIndex = SQL.indexOf("\ncommit;");
  const postBlockIndex = SQL.indexOf(postBlock![0]);
  assert.ok(postBlockIndex < commitIndex, "postconditions must appear before commit");
});

test("does not bypass, disable, or redefine migration 208's trigger -- only discusses it in prose", () => {
  assert.doesNotMatch(SQL, /drop trigger|alter trigger|create (or replace )?trigger/i);
});

test("has exactly one transaction block, so any precondition/postcondition failure rolls back the whole migration including activation", () => {
  const beginCount = (SQL.match(/^begin;$/gm) ?? []).length;
  const commitCount = (SQL.match(/^commit;$/gm) ?? []).length;
  assert.equal(beginCount, 1);
  assert.equal(commitCount, 1);
});

test("rollback instructions are provided and simply reverse the one effect (active=false)", () => {
  assert.match(SQL, /update public\.ali_mock_form set active = false where id = 'english-full-mock-v1';/);
});
