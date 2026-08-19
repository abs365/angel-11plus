import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Stage 2 Educational Integrity Correction, Decision 107 — structural
 * tests against migration 077's own SQL text, matching the established
 * convention (tests/supabase/mockScoringTrustBoundaryCorrection.test.ts):
 * string/regex assertions against the raw migration file, never a live
 * database. This migration is drafted for Founder review and has not
 * been applied.
 */

const sql = fs.readFileSync(
  "supabase/migrations/077_english_supported_verification_provenance_reconciliation.sql",
  "utf8"
);
const executable = sql
  .split("\n")
  .filter((l) => !l.trimStart().startsWith("--"))
  .join("\n");

test("wrapped in a single begin/commit transaction", () => {
  assert.match(executable, /^\s*begin;/m);
  assert.match(executable, /^\s*commit;/m);
});

test("only touches ali_student_question_history and reads ali_question_bank -- no other table mentioned", () => {
  assert.ok(executable.includes("ali_student_question_history"));
  assert.ok(executable.includes("ali_question_bank"));
  const OTHER_TABLES = [
    "ali_durable_mastery",
    "ali_educational_audit",
    "ali_passage_bank",
    "ali_family_review",
    "profiles",
    "user_stats",
    "lesson_progress",
    "ali_mock_attempt",
  ];
  for (const t of OTHER_TABLES) {
    assert.ok(!executable.includes(t), `must not mention ${t}`);
  }
});

test("creates no table, column, policy, or trigger -- the only DDL-adjacent statements are the guarded UPDATEs", () => {
  assert.ok(!/create\s+table/i.test(executable));
  assert.ok(!/alter\s+table/i.test(executable));
  assert.ok(!/create\s+policy|drop\s+policy/i.test(executable));
  assert.ok(!/create\s+trigger|drop\s+trigger/i.test(executable));
});

test("exactly two UPDATE statements, one setting verified=true and one setting verified=false", () => {
  const trueUpdates = [...executable.matchAll(/set last_attempt_verified = true/g)];
  const falseUpdates = [...executable.matchAll(/set last_attempt_verified = false/g)];
  assert.equal(trueUpdates.length, 1, "exactly one UPDATE ... SET ... = true");
  assert.equal(falseUpdates.length, 1, "exactly one UPDATE ... SET ... = false");
});

test("every predicate touching a row requires subject='english', source='practice_experience', support_tier='supported', AND last_attempt_verified IS NULL", () => {
  // Each UPDATE's own WHERE clause must carry all four predicates -- this
  // is what keeps the other 431 historical rows (Mathematics, Mock,
  // founder_validation_assessment, legacy_english_practice, English
  // independent-tier) untouched.
  const updateBlocks = executable.split(/update public\.ali_student_question_history/gi).slice(1);
  assert.equal(updateBlocks.length, 2, "exactly two UPDATE statements to check");
  for (const block of updateBlocks) {
    const clause = block.split(";")[0];
    assert.ok(clause.includes("q.subject = 'english'"), "must require subject='english'");
    assert.ok(clause.includes("h.source = 'practice_experience'"), "must require source='practice_experience'");
    assert.ok(clause.includes("h.last_attempt_support_tier = 'supported'"), "must require support_tier='supported'");
    assert.ok(clause.includes("h.last_attempt_verified is null"), "must require last_attempt_verified IS NULL");
  }
});

test("the true-branch predicate targets exactly TIER2/TIER4/TIER6, the false-branch targets exactly TIER3/TIER5 -- no overlap, no other tier", () => {
  const trueBlock = executable.split(/set last_attempt_verified = true/)[1].split(";")[0];
  const falseBlock = executable.split(/set last_attempt_verified = false/)[1].split(";")[0];

  assert.ok(trueBlock.includes("TIER2_ACCEPTED_SET"));
  assert.ok(trueBlock.includes("TIER4_ORDERED_LIST"));
  assert.ok(trueBlock.includes("TIER6_MULTI_SELECT"));
  assert.ok(!trueBlock.includes("TIER3_QUOTATION_PLUS_EXPLANATION"));
  assert.ok(!trueBlock.includes("TIER5_NAMED_COMPONENT_PLUS_EXPLANATION"));

  assert.ok(falseBlock.includes("TIER3_QUOTATION_PLUS_EXPLANATION"));
  assert.ok(falseBlock.includes("TIER5_NAMED_COMPONENT_PLUS_EXPLANATION"));
  assert.ok(!falseBlock.includes("TIER2_ACCEPTED_SET"));
  assert.ok(!falseBlock.includes("TIER4_ORDERED_LIST"));
  assert.ok(!falseBlock.includes("TIER6_MULTI_SELECT"));
});

test("no column other than last_attempt_verified is ever assigned by either UPDATE", () => {
  const updateBlocks = executable.split(/update public\.ali_student_question_history/gi).slice(1);
  for (const block of updateBlocks) {
    const setClause = block.split(/from public\.ali_question_bank/i)[0];
    // Only one `set` keyword, and it must be exactly last_attempt_verified.
    const setMatches = [...setClause.matchAll(/\bset\b/gi)];
    assert.equal(setMatches.length, 1, "exactly one SET clause per UPDATE");
    assert.ok(!/last_attempt_correct|times_seen|times_correct|last_attempt_first_answer|last_attempt_final_answer|last_attempt_support_tier\s*=/.test(setClause),
      "must never assign any correctness, attempt-count, answer-text, or support-tier column");
  }
});

test("no learner answer text (first_answer/final_answer) or profile identifier is read or selected anywhere in the migration", () => {
  assert.ok(!executable.includes("last_attempt_first_answer"));
  assert.ok(!executable.includes("last_attempt_final_answer"));
  assert.ok(!executable.includes("profile_id"));
});

test("guarded by a pre-application row-count check requiring exactly 19 auto-verified and 8 self-assessed pending rows before mutating anything", () => {
  assert.ok(executable.includes("v_auto_verified_pending"));
  assert.ok(executable.includes("v_self_assessed_pending"));
  assert.ok(/if\s+v_auto_verified_pending\s*=\s*19\s+and\s+v_self_assessed_pending\s*=\s*8\s+then/i.test(executable));
});

test("idempotence: an already-applied (0/0) state is explicitly treated as a safe no-op, not an error", () => {
  assert.ok(/elsif\s+v_auto_verified_pending\s*=\s*0\s+and\s+v_self_assessed_pending\s*=\s*0\s+then/i.test(executable));
  const noopBranch = executable.split(/elsif\s+v_auto_verified_pending\s*=\s*0/i)[1].split(/else/i)[0];
  assert.ok(!/update\s+public\.ali_student_question_history/i.test(noopBranch), "the no-op branch must contain no UPDATE statement");
  assert.ok(/raise notice/i.test(noopBranch), "the no-op branch must log, not silently do nothing");
});

test("any other observed row count refuses to proceed via RAISE EXCEPTION, never guesses", () => {
  assert.ok(/raise exception/i.test(executable));
  const elseBranch = executable.split(/\belse\b/i).pop()!.split("end $$;")[0];
  assert.ok(/raise exception/i.test(elseBranch), "the fallback branch must raise, not silently continue");
  assert.ok(!/update\s+public\.ali_student_question_history/i.test(elseBranch), "the refusal branch must contain no UPDATE statement");
});

test("mentions the frozen downstream-safety finding: durable mastery and audit tables require no repair", () => {
  // Documentation-level check against the RAW file (comments included) --
  // proves the migration's own comment block records the Decision 107
  // finding it depends on, not merely asserted in this session's report
  // and then dropped from the artefact itself. This is deliberately the
  // one test in this file that reads `sql`, not `executable`.
  assert.ok(sql.includes("ali_durable_mastery"));
  assert.ok(sql.includes("ali_educational_audit"));
  assert.ok(sql.toLowerCase().includes("no repair"));
});
