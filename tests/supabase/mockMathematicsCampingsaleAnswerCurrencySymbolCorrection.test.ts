import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics Mock 1 Release QA — Camping Sale Answer Currency-Symbol
 * Correction (Decision 216). Structural + semantic tests against
 * migration 148's own SQL text, mirroring migration 127's own
 * established single-field-correction pattern.
 */

const sql = fs.readFileSync("supabase/migrations/148_mock_mathematics_campingsale_answer_currency_symbol_correction.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

/** Byte-for-byte port of mock_score_attempt()'s own marking branch (migration 104). */
function scoreOne(storedAnswer: string, responseValue: string): "correct" | "incorrect" | "unanswered" {
  if (!responseValue || responseValue.trim() === "") return "unanswered";
  const pr = Number(responseValue);
  const pa = Number(storedAnswer);
  const numOk = !Number.isNaN(pr) && responseValue.trim() !== "" && !Number.isNaN(pa) && storedAnswer.trim() !== "";
  if (numOk) return Math.abs(pr - pa) < 0.0001 ? "correct" : "incorrect";
  return responseValue.trim().toLowerCase() === storedAnswer.trim().toLowerCase() ? "correct" : "incorrect";
}

test("SEMANTIC: the defect is real -- the old £-prefixed stored answer rejects a mathematically correct bare-numeric response", () => {
  assert.equal(scoreOne("£102", "102"), "incorrect");
  assert.equal(scoreOne("£91.80", "91.80"), "incorrect");
  assert.equal(scoreOne("£1.80", "1.80"), "incorrect");
  assert.equal(scoreOne("£170", "170"), "incorrect");
});

test("SEMANTIC: the old £-prefixed answer is brittle even for a learner who DOES include the symbol -- '£102.00' fails against stored '£102'", () => {
  assert.equal(scoreOne("£102", "£102.00"), "incorrect");
});

test("SEMANTIC: the corrected bare-numeric answer accepts the exact value and reasonable numeric formatting variation", () => {
  assert.equal(scoreOne("102", "102"), "correct");
  assert.equal(scoreOne("102", "102.00"), "correct");
  assert.equal(scoreOne("102", "102.0"), "correct");
  assert.equal(scoreOne("102", " 102 "), "correct");
  assert.equal(scoreOne("91.80", "91.8"), "correct");
  assert.equal(scoreOne("1.80", "1.8"), "correct");
  assert.equal(scoreOne("170", "170.00"), "correct");
});

test("SEMANTIC: this matches the convention already used by every other currency answer in the frozen Mock (no £ symbol stored anywhere else)", () => {
  assert.equal(scoreOne("18.00", "18"), "correct"); // mock-mr13-craftstall-01
  assert.equal(scoreOne("12.00", "12"), "correct"); // mock-mr01mr10-costumeschedule-01b
  assert.equal(scoreOne("7.35", "7.35"), "correct"); // mock-mr01mr10-costumeschedule-02b
});

test("targets exactly the 4 mock-mr04-campingsale rows, in order", () => {
  assert.match(executable, /v_target_ids constant text\[\] := array\[\s*\n\s*'mock-mr04-campingsale-01', 'mock-mr04-campingsale-02', 'mock-mr04-campingsale-03', 'mock-mr04-campingsale-04'\s*\n\s*\];/);
});

test("old answers are exactly £102/£91.80/£1.80/£170, new answers are exactly 102/91.80/1.80/170, in the same order", () => {
  assert.match(executable, /v_old_answers constant text\[\] := array\['£102', '£91\.80', '£1\.80', '£170'\];/);
  assert.match(executable, /v_new_answers constant text\[\] := array\['102', '91\.80', '1\.80', '170'\];/);
});

test("live eligibility precondition requires mock_eligible on all 4 rows -- this migration must never run against non-mock_eligible content", () => {
  assert.match(executable, /eligibility_status = 'mock_eligible'/);
  assert.match(executable, /v_eligibility_count <> 4/);
  assert.match(sql, /must never run against non-mock_eligible content/);
});

test("only the answer key inside prompt is ever SET via jsonb_set -- no top-level column, and no other prompt key, is ever SET", () => {
  assert.match(executable, /set prompt = jsonb_set\(b\.prompt, '\{answer\}', to_jsonb\(e\.new_answer\)\)/);
  assert.ok(!/\bset\s+(active|eligibility_status|content_difficulty|family_id|question_group_id|group_order|subpart_label|marking_mode|skill|subject)\s*=/i.test(executable), "no top-level column may ever be SET");
});

test("byte-for-byte preservation of every OTHER prompt key is positively proven via a full pre-write snapshot (prompt - 'answer') compared post-write", () => {
  assert.match(executable, /tmp_campingsale_answer_snapshot/);
  assert.match(executable, /select id, prompt - 'answer' from public\.ali_question_bank where id = any\(v_target_ids\)/);
  assert.match(executable, /where \(b\.prompt - 'answer'\) = s\.prompt_without_answer/);
});

test("eligibility_status is re-verified mock_eligible post-write in both the apply and already-applied branches", () => {
  const occurrences = [...executable.matchAll(/eligibility_status <> 'mock_eligible'/g)];
  assert.ok(occurrences.length >= 2, `expected the post-write mock_eligible re-check in both branches, found ${occurrences.length}`);
});

test("does not touch ali_mock_form -- migration 147 requires no change since it stores no answer text", () => {
  assert.ok(!executable.includes("ali_mock_form"));
  assert.match(sql, /requires NO change to migration[\s\S]*?147/);
});

test("does not touch mock_score_attempt or any other function -- the marking engine itself is unmodified", () => {
  assert.ok(!/create (or replace )?function/i.test(executable));
  assert.ok(!executable.includes("mock_score_attempt"));
});

test("idempotent structure: the already-corrected branch (v_already_corrected_count = 4) contains no UPDATE statement", () => {
  const alreadyAppliedBranch = executable.match(/elsif v_already_corrected_count = 4 then[\s\S]*?else/)![0];
  assert.ok(!/\bupdate\s+public\.ali_question_bank\b/i.test(alreadyAppliedBranch));
});

test("mixed/unexpected state is explicitly refused via RAISE EXCEPTION, not silently repaired", () => {
  assert.match(
    executable,
    /Migration 148 refused: expected 4 rows carrying the original £-prefixed answers \(found %\), or 4 already carrying the corrected bare-numeric answers \(found %\)/
  );
});

test("touches only public.ali_question_bank via UPDATE; the only INSERT target is the local temp snapshot table", () => {
  const updateTargets = [...executable.matchAll(/update\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(updateTargets), new Set(["ali_question_bank"]));
  const insertTargets = [...executable.matchAll(/insert into\s+(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(insertTargets), new Set(["tmp_campingsale_answer_snapshot"]));
});

test("no RLS policy or grant is created or altered", () => {
  assert.ok(!/create policy|alter policy/i.test(executable));
  assert.ok(!/\bgrant\b|\brevoke\b/i.test(executable));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present, documents independence from migration 147", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /Independent of\s*\n-- migration 147/);
});

test("every RAISE with a % placeholder supplies exactly one matching argument", () => {
  const raiseStatements = [...executable.matchAll(/raise (?:exception|notice)\s+'([^']*(?:''[^']*)*)'((?:\s*,\s*v_\w+)*)\s*;/g)];
  assert.ok(raiseStatements.length > 0);
  for (const [, message, args] of raiseStatements) {
    const placeholders = (message.match(/%/g) || []).length;
    const argCount = args ? (args.match(/v_\w+/g) || []).length : 0;
    assert.equal(placeholders, argCount, `RAISE message "${message}" has ${placeholders} placeholders but ${argCount} arguments`);
  }
});

test("MATH: underlying values unchanged -- 15% off £120=102, 10% off 102=91.80, discount-vs-single difference=1.80, reverse-20%-from-136=170", () => {
  assert.equal(Math.round(120 * 0.85 * 100) / 100, 102);
  assert.equal(Math.round(102 * 0.9 * 100) / 100, 91.8);
  const single25 = 120 * 0.75;
  assert.equal(Math.round((91.8 - single25) * 100) / 100, 1.8);
  assert.equal(Math.round((136 / 0.8) * 100) / 100, 170);
});
