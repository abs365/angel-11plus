import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { isMockEligibleCandidate } from "../../lib/ali/mockEligibility";

/**
 * English Content Foundation, Increment 001 — Independent Validation
 * Promotion (Decision 236, Post-Amendment-Verification Certification
 * Gate), migration 160. Structural tests against migration 160's own SQL
 * text, mirroring migration 102/103's own established test discipline
 * (mockEnglishComprehensionBatch001IndependentValidation.test.ts /
 * mockWritingBatch001IndependentValidation.test.ts) exactly, extended for
 * this migration's own 3-family, 5-block scope (2 passage families x
 * [questions block + passage block] + 1 combined Writing block).
 */

const sql = fs.readFileSync("supabase/migrations/160_english_content_foundation_increment001_independent_validation.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const UNDERSTUDY_IDS = ["eng-inc001-understudy-q01", "eng-inc001-understudy-q02", "eng-inc001-understudy-q03", "eng-inc001-understudy-q04", "eng-inc001-understudy-q05", "eng-inc001-understudy-q06", "eng-inc001-understudy-q07"];
const BEE_IDS = ["eng-inc001-bee-q01", "eng-inc001-bee-q02", "eng-inc001-bee-q03", "eng-inc001-bee-q04", "eng-inc001-bee-q05", "eng-inc001-bee-q06", "eng-inc001-bee-q07", "eng-inc001-bee-q08"];
const WRITING_IDS = ["mock-writing-newplace-01", "mock-writing-mistakelearned-01", "mock-writing-screentime-01"];

test("exact 7-question Understudy allow-list, exact 8-question Bee allow-list, exact 3-row Writing allow-list -- no more, no less", () => {
  const arrays = [...executable.matchAll(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/g)].map((m) => [...m[1].matchAll(/'([\w-]+)'/g)].map((x) => x[1]));
  assert.equal(arrays.length, 3, "expected exactly 3 v_target_ids arrays (Understudy questions, Bee questions, Writing prompts)");
  assert.deepEqual(arrays[0].sort(), [...UNDERSTUDY_IDS].sort());
  assert.deepEqual(arrays[1].sort(), [...BEE_IDS].sort());
  assert.deepEqual(arrays[2].sort(), [...WRITING_IDS].sort());
});

test("the Understudy question-row precondition and UPDATE scope by learning_unit_id = eng-inc001-understudy, not by a bare id list alone", () => {
  const block = executable.match(/v_target_ids constant text\[\] := array\[\s*'eng-inc001-understudy-q01'[\s\S]*?end \$\$;/)![0];
  assert.match(block, /eligibility_status = 'authentic_assessment_candidate'/);
  assert.match(block, /active = true/);
  assert.match(block, /learning_unit_id = 'eng-inc001-understudy'/);
});

test("the Bee question-row precondition and UPDATE scope by learning_unit_id = eng-inc001-bee-navigation, not by a bare id list alone", () => {
  const block = executable.match(/v_target_ids constant text\[\] := array\[\s*'eng-inc001-bee-q01'[\s\S]*?end \$\$;/)![0];
  assert.match(block, /eligibility_status = 'authentic_assessment_candidate'/);
  assert.match(block, /active = true/);
  assert.match(block, /learning_unit_id = 'eng-inc001-bee-navigation'/);
});

test("both passages are promoted via their own independently-guarded assertion-and-refuse block on ali_passage_bank, each scoped to exactly its own id", () => {
  const understudyPassageBlock = executable.match(/from public\.ali_passage_bank\s*\n\s*where id = 'eng-inc001-understudy'[\s\S]*?end \$\$;/)![0];
  assert.match(understudyPassageBlock, /eligibility_status = 'authentic_assessment_candidate'/);
  const beePassageBlock = executable.match(/from public\.ali_passage_bank\s*\n\s*where id = 'eng-inc001-bee-navigation'[\s\S]*?end \$\$;/)![0];
  assert.match(beePassageBlock, /eligibility_status = 'authentic_assessment_candidate'/);
});

test("the Writing precondition and UPDATE scope by subject = 'writing', matching migration 103's own established shape", () => {
  const block = executable.match(/v_target_ids constant text\[\] := array\[\s*'mock-writing-newplace-01'[\s\S]*?end \$\$;/)![0];
  assert.match(block, /subject = 'writing'/);
  assert.match(block, /eligibility_status = 'authentic_assessment_candidate'/);
  assert.match(block, /active = true/);
});

test("resulting status is exactly 'independently_validated' -- the only value this migration ever SETs, across all 5 blocks", () => {
  const setStatements = [...executable.matchAll(/set eligibility_status = '(\w+)'/g)].map((m) => m[1]);
  assert.equal(setStatements.length, 5, "exactly 5 SET eligibility_status statements: Understudy questions, Understudy passage, Bee questions, Bee passage, Writing");
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

test("prompt/checklist/passage-text/provenance/family_id/content_version/active are never touched -- only eligibility_status ever moves", () => {
  for (const column of ["prompt", "checklist", "original_text", "provenance", "family_id", "content_version", "active", "review_state"]) {
    assert.ok(!new RegExp(`set\\s+${column}\\s*=`, "i").test(executable), `unexpected SET of "${column}"`);
  }
});

test("no ali_family_review mutation: this migration never mentions that table at all in its real SQL -- review history is untouched, matching migration 102/103's own established precedent", () => {
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

test("fails safely: exactly 5 RAISE EXCEPTION statements (one per block's own guard), exactly 10 RAISE NOTICE statements (apply/already-applied, per block)", () => {
  assert.equal((executable.match(/raise exception/g) || []).length, 5);
  assert.equal((executable.match(/raise notice/g) || []).length, 10);
});

test("all 5 blocks share the same single begin/commit transaction -- every family is promoted together or not at all", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present in the raw file header", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder application/);
});

test("the migration's own header explicitly discloses why it never queries ali_family_review, matching migration 102/103's own established precedent, not a novel or undisclosed omission", () => {
  assert.match(sql, /WHY THIS MIGRATION DOES NOT QUERY ali_family_review/);
  assert.match(sql, /NOT touch ali_family_review in any way/);
});

test("the migration's own header explicitly discloses the Practice/Mock isolation rationale for staying out of practice_eligible", () => {
  assert.match(sql, /Practice track/);
  assert.match(sql, /Promoting the SAME passage or prompt/);
});

test("Mock eligibility gate continues to reject independently_validated content -- proven against the real, unmodified isMockEligibleCandidate() function, for all 18 promoted rows' own subjects", () => {
  for (const id of [...UNDERSTUDY_IDS, ...BEE_IDS]) {
    const afterPromotion = { eligibilityStatus: "independently_validated" as const, active: true, subject: "english" as const, pathway: ["csse" as const] };
    assert.equal(isMockEligibleCandidate(afterPromotion, "english", "csse"), false, `${id}: independently_validated must still be rejected by the Mock eligibility gate`);
  }
  for (const id of WRITING_IDS) {
    const afterPromotion = { eligibilityStatus: "independently_validated" as const, active: true, subject: "writing" as const, pathway: ["csse" as const] };
    assert.equal(isMockEligibleCandidate(afterPromotion, "writing", "csse"), false, `${id}: independently_validated must still be rejected by the Mock eligibility gate`);
  }
});
