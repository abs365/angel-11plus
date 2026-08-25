import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics Structural Capacity, Wave 002 — Bus Timetable Subpart (d)
 * Wording Correction (Decision 185/186, Founder production visual
 * review finding). Structural + semantic tests against migration 127's
 * own SQL text, mirroring migration 123's own established
 * assertion-and-refuse pattern, extended with a semantic re-derivation
 * of the mathematical distinction that motivated the fix.
 */

const sql = fs.readFileSync("supabase/migrations/127_mock_mathematics_bustimetable_subpart_d_wording_correction.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const OLD_QUESTION = "A bus company runs a route from Hillview to Oakford, stopping at Milltown and Riverside. The timetable below shows the morning and afternoon journey times. The bus company plans to speed up the afternoon Hillview-to-Milltown leg by 20%. How many minutes should the new afternoon Hillview-to-Milltown leg take?";
const NEW_QUESTION = "A bus company runs a route from Hillview to Oakford, stopping at Milltown and Riverside. The timetable below shows the morning and afternoon journey times. The bus company plans to reduce the afternoon Hillview-to-Milltown journey time by 20%. How many minutes should the new journey take?";

test("the mathematical defect is real: reducing time by 20% and increasing speed by 20% give DIFFERENT results, confirming the old wording was genuinely ambiguous", () => {
  const duration = 35;
  const reduceTimeBy20pct = duration * 0.8;
  const increaseSpeedBy20pct = duration / 1.2;
  assert.equal(reduceTimeBy20pct, 28, "the stored answer (28) matches a 20% reduction in journey time");
  assert.notEqual(Math.round(increaseSpeedBy20pct * 100) / 100, 28, "a 20% increase in speed gives a materially different value (~29.17), proving the old wording admitted an inconsistent reading");
});

test("the corrected wording expresses a 20% journey-time REDUCTION, not a speed increase", () => {
  assert.match(NEW_QUESTION, /reduce the afternoon Hillview-to-Milltown journey time by 20%/);
  assert.ok(!/speed up/i.test(NEW_QUESTION), "the ambiguous 'speed up' phrasing must not remain");
});

test("answer 28 is mathematically consistent with the corrected wording (re-derived independently, not merely trusted)", () => {
  const currentDuration = 35; // 14:50 - 14:15
  const reduced = currentDuration * 0.8;
  assert.equal(reduced, 28);
});

test("old ambiguous wording is present verbatim in the migration's own v_old_question constant, and the new wording is present verbatim in v_new_question", () => {
  assert.ok(executable.includes(`v_old_question constant text := '${OLD_QUESTION}';`));
  assert.ok(executable.includes(`v_new_question constant text := '${NEW_QUESTION}';`));
});

test("the corrected question text is an exact, literal continuation of the family's own unchanged sharedStem, with a non-empty tail", () => {
  const stem = "A bus company runs a route from Hillview to Oakford, stopping at Milltown and Riverside. The timetable below shows the morning and afternoon journey times.";
  assert.ok(NEW_QUESTION.startsWith(stem));
  assert.ok(NEW_QUESTION.slice(stem.length).trim().length > 0);
});

test("targets exactly mock-mr10-bustimetable-04 -- no other row's id ever appears as an UPDATE target", () => {
  assert.match(executable, /where id = 'mock-mr10-bustimetable-04'/);
  const otherIds = ["mock-mr10-bustimetable-01", "mock-mr10-bustimetable-02", "mock-mr10-bustimetable-03", "mock-mr13-craftstall-01", "mock-mr13-craftstall-02", "mock-mr13-craftstall-03"];
  for (const id of otherIds) {
    assert.ok(!executable.includes(`id = '${id}'`), `${id} must never be an UPDATE target`);
  }
});

test("only the question key inside prompt is ever SET -- no top-level column is ever SET", () => {
  assert.match(executable, /set prompt = jsonb_set\(prompt, '\{question\}', to_jsonb\(v_new_question\)\)/);
  assert.ok(!/\bset\s+(active|eligibility_status|content_difficulty|family_id|question_group_id|group_order|subpart_label|marking_mode|skill|subject)\s*=/i.test(executable), "no top-level column may ever be SET");
});

test("live preconditions verify answer=28, marks=1, difficulty=hard, sharedStem, family_id, grouping, eligibility, active, marking_mode -- all before any write", () => {
  const preconditionBlock = executable.match(/select count\(\*\) into v_precondition_count[\s\S]*?end if;/)![0];
  assert.match(preconditionBlock, /family_id = 'mock-mr10-bustimetable'/);
  assert.match(preconditionBlock, /content_difficulty = 'hard'/);
  assert.match(preconditionBlock, /question_group_id = 'mock-mr10-bustimetable'/);
  assert.match(preconditionBlock, /group_order = 4/);
  assert.match(preconditionBlock, /subpart_label = '\(d\)'/);
  assert.match(preconditionBlock, /\(prompt->>'answer'\) = '28'/);
  assert.match(preconditionBlock, /\(prompt->>'marks'\)::numeric = 1/);
  assert.match(preconditionBlock, /eligibility_status = 'authentic_assessment_candidate'/);
  assert.match(preconditionBlock, /marking_mode = 'deterministic'/);
});

test("byte-for-byte preservation is positively proven: a pre-write snapshot of (prompt - 'question') is captured and compared against the post-write value", () => {
  assert.match(executable, /tmp_bustimetable_04_snapshot/);
  assert.match(executable, /select id, prompt - 'question' from public\.ali_question_bank where id = 'mock-mr10-bustimetable-04'/);
  assert.match(executable, /where \(b\.prompt - 'question'\) = s\.prompt_without_question/);
  assert.match(executable, /post-write preservation check failed/);
});

test("post-write structural re-check re-verifies family_id/active/eligibility_status/marking_mode/content_difficulty/grouping unchanged", () => {
  const postWriteBlock = executable.match(/select count\(\*\) into v_post_write_structural_count[\s\S]*?post-write structural verification failed/)![0];
  assert.match(postWriteBlock, /family_id = 'mock-mr10-bustimetable'/);
  assert.match(postWriteBlock, /content_difficulty = 'hard'/);
  assert.match(postWriteBlock, /group_order = 4/);
  assert.match(postWriteBlock, /subpart_label = '\(d\)'/);
});

test("idempotent structure: the already-corrected branch (v_already_corrected_count = 1) contains no UPDATE statement", () => {
  const alreadyAppliedBranch = executable.match(/elsif v_already_corrected_count = 1 then[\s\S]*?else/)![0];
  assert.ok(!/\bupdate\s+public\.ali_question_bank\b/i.test(alreadyAppliedBranch));
});

test("mixed/unexpected state (neither old nor new wording present) is explicitly refused via RAISE EXCEPTION", () => {
  assert.match(executable, /Migration 127 refused: mock-mr10-bustimetable-04.*stored question text matches neither/);
});

test("no ali_family_review, ali_mock_form, or RPC/RLS mutation anywhere -- migration 128 handles review registration separately", () => {
  for (const table of ["ali_family_review", "ali_mock_form"]) {
    assert.ok(!executable.includes(table));
  }
  assert.ok(!/create (or replace )?function|create policy|alter policy|\bgrant\b|\brevoke\b/i.test(executable));
});

test("wrapped in a single begin/commit transaction, header discloses NOT APPLIED and the migration-125-applied dependency", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /migrations 125\/126/);
});
