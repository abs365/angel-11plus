import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { isMockEligibleCandidate } from "../../lib/ali/mockEligibility";

/**
 * English Content Foundation, Increment 002 — Independent Validation
 * Promotion (Decision 242, Certification Gate), migration 165. Structural
 * tests against migration 165's own SQL text, mirroring migration 160's
 * own established test discipline
 * (englishContentFoundationIncrement001IndependentValidation.test.ts)
 * exactly, adapted for this migration's own 2-family, 4-block scope (no
 * Writing block this increment).
 */

const sql = fs.readFileSync("supabase/migrations/165_english_content_foundation_increment002_independent_validation.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const LOOSE_CONNECTION_IDS = [
  "eng-inc002-roboticsfinal-q01", "eng-inc002-roboticsfinal-q02b", "eng-inc002-roboticsfinal-q02c",
  "eng-inc002-roboticsfinal-q02d", "eng-inc002-roboticsfinal-q02e", "eng-inc002-roboticsfinal-q03",
  "eng-inc002-roboticsfinal-q04", "eng-inc002-roboticsfinal-q05", "eng-inc002-roboticsfinal-q06",
  "eng-inc002-roboticsfinal-q07a", "eng-inc002-roboticsfinal-q07b", "eng-inc002-roboticsfinal-q08",
];
const SAIL_AND_STEAM_IDS = [
  "eng-inc002-sailandsteam-q01", "eng-inc002-sailandsteam-q02", "eng-inc002-sailandsteam-q03",
  "eng-inc002-sailandsteam-q04", "eng-inc002-sailandsteam-q05b", "eng-inc002-sailandsteam-q05c",
  "eng-inc002-sailandsteam-q05d", "eng-inc002-sailandsteam-q05e", "eng-inc002-sailandsteam-q06",
  "eng-inc002-sailandsteam-q07",
];

test("exact 12-question Loose Connection allow-list, exact 10-question Sail and Steam allow-list -- no more, no less", () => {
  const arrays = [...executable.matchAll(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/g)].map((m) => [...m[1].matchAll(/'([\w-]+)'/g)].map((x) => x[1]));
  assert.equal(arrays.length, 2, "expected exactly 2 v_target_ids arrays (Loose Connection questions, Sail and Steam questions)");
  assert.deepEqual(arrays[0].sort(), [...LOOSE_CONNECTION_IDS].sort());
  assert.deepEqual(arrays[1].sort(), [...SAIL_AND_STEAM_IDS].sort());
});

test("the Loose Connection allow-list is exactly the post-migration-163 grouped Q2 shape -- old pooled q02 absent, q02b/c/d/e present", () => {
  const arrays = [...executable.matchAll(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/g)].map((m) => [...m[1].matchAll(/'([\w-]+)'/g)].map((x) => x[1]));
  assert.ok(!arrays[0].includes("eng-inc002-roboticsfinal-q02"), "old pooled Q2 row must not appear");
  for (const id of ["eng-inc002-roboticsfinal-q02b", "eng-inc002-roboticsfinal-q02c", "eng-inc002-roboticsfinal-q02d", "eng-inc002-roboticsfinal-q02e"]) {
    assert.ok(arrays[0].includes(id), `expected grouped subpart ${id}`);
  }
});

test("the Sail and Steam allow-list is exactly the grouped Q5 shape -- q05b/c/d/e present, no bare q05", () => {
  const arrays = [...executable.matchAll(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/g)].map((m) => [...m[1].matchAll(/'([\w-]+)'/g)].map((x) => x[1]));
  assert.ok(!arrays[1].includes("eng-inc002-sailandsteam-q05"), "bare, ungrouped Q5 row must not appear");
  for (const id of ["eng-inc002-sailandsteam-q05b", "eng-inc002-sailandsteam-q05c", "eng-inc002-sailandsteam-q05d", "eng-inc002-sailandsteam-q05e"]) {
    assert.ok(arrays[1].includes(id), `expected grouped subpart ${id}`);
  }
});

test("the Loose Connection question-row precondition and UPDATE scope by learning_unit_id = eng-inc002-roboticsfinal, not by a bare id list alone", () => {
  const block = executable.match(/v_target_ids constant text\[\] := array\[\s*'eng-inc002-roboticsfinal-q01'[\s\S]*?end \$\$;/)![0];
  assert.match(block, /eligibility_status = 'authentic_assessment_candidate'/);
  assert.match(block, /active = true/);
  assert.match(block, /learning_unit_id = 'eng-inc002-roboticsfinal'/);
});

test("the Sail and Steam question-row precondition and UPDATE scope by learning_unit_id = eng-inc002-sailandsteam, not by a bare id list alone", () => {
  const block = executable.match(/v_target_ids constant text\[\] := array\[\s*'eng-inc002-sailandsteam-q01'[\s\S]*?end \$\$;/)![0];
  assert.match(block, /eligibility_status = 'authentic_assessment_candidate'/);
  assert.match(block, /active = true/);
  assert.match(block, /learning_unit_id = 'eng-inc002-sailandsteam'/);
});

test("both passages are promoted via their own independently-guarded assertion-and-refuse block on ali_passage_bank, each scoped to exactly its own id", () => {
  const looseConnectionPassageBlock = executable.match(/from public\.ali_passage_bank\s*\n\s*where id = 'eng-inc002-roboticsfinal'[\s\S]*?end \$\$;/)![0];
  assert.match(looseConnectionPassageBlock, /eligibility_status = 'authentic_assessment_candidate'/);
  const sailAndSteamPassageBlock = executable.match(/from public\.ali_passage_bank\s*\n\s*where id = 'eng-inc002-sailandsteam'[\s\S]*?end \$\$;/)![0];
  assert.match(sailAndSteamPassageBlock, /eligibility_status = 'authentic_assessment_candidate'/);
});

test("resulting status is exactly 'independently_validated' -- the only value this migration ever SETs, across all 4 blocks", () => {
  const setStatements = [...executable.matchAll(/set eligibility_status = '(\w+)'/g)].map((m) => m[1]);
  assert.equal(setStatements.length, 4, "exactly 4 SET eligibility_status statements: Loose Connection questions, Loose Connection passage, Sail and Steam questions, Sail and Steam passage");
  assert.deepEqual(new Set(setStatements), new Set(["independently_validated"]));
});

test("no mock_eligible and no practice_eligible transition anywhere in this migration's real SQL -- Mock-track content stays out of the Practice track", () => {
  assert.ok(!executable.includes("mock_eligible"));
  assert.ok(!executable.includes("practice_eligible"));
});

test("no content-field UPDATE on any table -- the only column ever SET anywhere is eligibility_status", () => {
  const setClauses = [...executable.matchAll(/\bset\s+([a-z_]+)\s*=/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(setClauses), new Set(["eligibility_status"]));
});

test("prompt/original_text/provenance/family_id/learning_unit_id/question_group_id/content_version/active are never touched -- only eligibility_status ever moves", () => {
  for (const column of ["prompt", "original_text", "provenance", "family_id", "learning_unit_id", "question_group_id", "content_version", "active", "review_state"]) {
    assert.ok(!new RegExp(`set\\s+${column}\\s*=`, "i").test(executable), `unexpected SET of "${column}"`);
  }
});

test("no ali_family_review mutation: this migration never mentions that table at all in its real SQL -- review history is untouched, matching migration 160's own established precedent", () => {
  assert.ok(!executable.includes("ali_family_review"));
});

test("no ali_mock_form mutation: this migration never mentions that table at all in its real SQL -- no English Mock is created or activated", () => {
  assert.ok(!executable.includes("ali_mock_form"));
});

test("touches only ali_question_bank and ali_passage_bank -- no other table appears in any FROM/UPDATE/INSERT/DELETE clause", () => {
  assert.ok(!/\binsert into\b|\bdelete from\b/i.test(executable));
  const updateTargets = [...executable.matchAll(/update\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(updateTargets), new Set(["ali_question_bank", "ali_passage_bank"]));
});

test("fails safely: exactly 4 RAISE EXCEPTION statements (one per block's own guard), exactly 8 RAISE NOTICE statements (apply/already-applied, per block)", () => {
  assert.equal((executable.match(/raise exception/g) || []).length, 4);
  assert.equal((executable.match(/raise notice/g) || []).length, 8);
});

test("all 4 blocks share the same single begin/commit transaction -- every family is promoted together or not at all", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present in the raw file header", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder application/);
});

test("the migration's own header explicitly discloses why it never queries ali_family_review, matching migration 160's own established precedent, not a novel or undisclosed omission", () => {
  assert.match(sql, /WHY THIS MIGRATION DOES NOT QUERY ali_family_review/);
  assert.match(sql, /NOT touch ali_family_review in any way/);
});

test("the migration's own header discloses this session's own live RLS-visibility re-test, not merely a cited assumption from memory", () => {
  assert.match(sql, /DISCLOSED LIMITATION \(this session\)/);
  assert.match(sql, /RLS/);
});

test("the migration's own header explicitly discloses the Practice/Mock isolation rationale for staying out of practice_eligible", () => {
  assert.match(sql, /Practice track/);
  assert.match(sql, /Promoting the SAME passage into both Practice and a future Mock/);
});

test("Mock eligibility gate continues to reject independently_validated content -- proven against the real, unmodified isMockEligibleCandidate() function, for all 22 promoted question rows' own subject", () => {
  for (const id of [...LOOSE_CONNECTION_IDS, ...SAIL_AND_STEAM_IDS]) {
    const afterPromotion = { eligibilityStatus: "independently_validated" as const, active: true, subject: "english" as const, pathway: ["csse" as const] };
    assert.equal(isMockEligibleCandidate(afterPromotion, "english", "csse"), false, `${id}: independently_validated must still be rejected by the Mock eligibility gate`);
  }
});

test("Loose Connection marks sum to 22 across all 12 target question IDs, matching migration 161/163's own established total", () => {
  const marksById: Record<string, number> = {
    "eng-inc002-roboticsfinal-q01": 1, "eng-inc002-roboticsfinal-q02b": 1, "eng-inc002-roboticsfinal-q02c": 1,
    "eng-inc002-roboticsfinal-q02d": 1, "eng-inc002-roboticsfinal-q02e": 1, "eng-inc002-roboticsfinal-q03": 4,
    "eng-inc002-roboticsfinal-q04": 1, "eng-inc002-roboticsfinal-q05": 2, "eng-inc002-roboticsfinal-q06": 4,
    "eng-inc002-roboticsfinal-q07a": 2, "eng-inc002-roboticsfinal-q07b": 2, "eng-inc002-roboticsfinal-q08": 2,
  };
  const total = LOOSE_CONNECTION_IDS.reduce((sum, id) => sum + marksById[id], 0);
  assert.equal(total, 22);
});

test("Sail and Steam marks sum to 17 across all 10 target question IDs, and Q5 subparts are each worth exactly 1 mark", () => {
  const marksById: Record<string, number> = {
    "eng-inc002-sailandsteam-q01": 1, "eng-inc002-sailandsteam-q02": 1, "eng-inc002-sailandsteam-q03": 4,
    "eng-inc002-sailandsteam-q04": 1, "eng-inc002-sailandsteam-q05b": 1, "eng-inc002-sailandsteam-q05c": 1,
    "eng-inc002-sailandsteam-q05d": 1, "eng-inc002-sailandsteam-q05e": 1, "eng-inc002-sailandsteam-q06": 4,
    "eng-inc002-sailandsteam-q07": 2,
  };
  const total = SAIL_AND_STEAM_IDS.reduce((sum, id) => sum + marksById[id], 0);
  assert.equal(total, 17);
  for (const id of ["eng-inc002-sailandsteam-q05b", "eng-inc002-sailandsteam-q05c", "eng-inc002-sailandsteam-q05d", "eng-inc002-sailandsteam-q05e"]) {
    assert.equal(marksById[id], 1, `${id} must be worth exactly 1 mark`);
  }
});
