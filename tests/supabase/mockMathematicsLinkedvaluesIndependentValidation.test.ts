import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics First Mock Structural Capacity, Authoring Increment 001 —
 * Independent Validation (Decision 181). Structural tests against
 * migration 123's own SQL text, mirroring migration 116's own
 * established independent-validation-promotion pattern, extended with
 * live review-evidence and content-shape preconditions per the
 * Founder's own explicit directive.
 */

const sql = fs.readFileSync("supabase/migrations/123_mock_mathematics_linkedvalues_independent_validation.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const TARGET_IDS = ["mock-mr06-linkedvalues-01", "mock-mr06-linkedvalues-02", "mock-mr06-linkedvalues-03"];

test("targets exactly the 3 mock-mr06-linkedvalues rows, no more no less", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/);
  assert.ok(match);
  const ids = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.deepEqual(ids.sort(), [...TARGET_IDS].sort());
});

test("exact family_id, subject, and skill are asserted as live preconditions", () => {
  assert.match(executable, /and family_id = 'mock-mr06-linkedvalues'/);
  assert.match(executable, /where id = any\(v_target_ids\) and subject = 'maths' and skill = 'QT-MR-06'/);
});

test("marks precondition: all 3 rows must read marks=1 from prompt->>'marks', refusing rather than assuming the Marking Integrity Gate is satisfied", () => {
  assert.match(executable, /\(prompt->>'marks'\)::numeric = 1/);
  assert.match(sql, /Marking Integrity Gate must never be assumed satisfied/);
});

test("sharedStem precondition: all 3 rows must carry the identical, exact expected stem value", () => {
  assert.match(executable, /v_expected_stem constant text := 'A collector has three bags of marbles/);
  assert.match(executable, /where id = any\(v_target_ids\) and \(prompt->>'sharedStem'\) = v_expected_stem/);
});

test("non-empty question-text precondition present", () => {
  assert.match(executable, /coalesce\(length\(prompt->>'question'\), 0\) > 0/);
});

test("grouping precondition: exact question_group_id/group_order/subpart_label shape (01=1/(a), 02=2/(b), 03=3/(c)) verified via an explicit VALUES join, not a broken multi-row aggregate", () => {
  assert.match(executable, /join \(values\s*\n\s*\('mock-mr06-linkedvalues-01', 1, '\(a\)'\),\s*\n\s*\('mock-mr06-linkedvalues-02', 2, '\(b\)'\),\s*\n\s*\('mock-mr06-linkedvalues-03', 3, '\(c\)'\)/);
  assert.match(executable, /v_grouping_count <> 3/);
});

test("marking_mode=deterministic precondition present for all 3 rows", () => {
  assert.match(executable, /where id = any\(v_target_ids\) and marking_mode = 'deterministic'/);
});

test("live review-evidence precondition: requires an approved ali_family_review row with the exact family, decision, review_type, reviewer, and MOCK-STRUCTURAL-CAPACITY-INC001 marker, never merely trusted from the header", () => {
  const block = executable.match(/select count\(\*\) into v_approved_review_count[\s\S]*?end if;/)![0];
  assert.match(block, /from public\.ali_family_review/);
  assert.match(block, /family_id = 'mock-mr06-linkedvalues'/);
  assert.match(block, /decision = 'approved'/);
  assert.match(block, /review_type = 'mock_maths_independent_review'/);
  assert.match(block, /reviewer = 'Ayobami Lawal'/);
  assert.match(block, /notes like 'MOCK-STRUCTURAL-CAPACITY-INC001%'/);
  assert.match(block, /v_approved_review_count < 1/);
});

test("no ali_family_review mutation anywhere: only SELECT (via count) ever touches that table, no INSERT/UPDATE/DELETE", () => {
  assert.ok(!/insert into public\.ali_family_review/i.test(executable));
  assert.ok(!/update public\.ali_family_review/i.test(executable));
  assert.ok(!/delete from public\.ali_family_review/i.test(executable));
  assert.match(executable, /from public\.ali_family_review/);
});

test("eligibility_status is the ONLY column this migration's UPDATE ever SETs", () => {
  const setColumns = [...executable.matchAll(/\bset\s+([a-z_]+)\s*=/gi)].map((m) => m[1].toLowerCase());
  assert.deepEqual(new Set(setColumns), new Set(["eligibility_status"]));
});

test("no prompt key, grouping column, active, family_id, skill, or content_difficulty is ever SET", () => {
  for (const column of ["prompt", "active", "family_id", "skill", "content_difficulty", "question_group_id", "group_order", "subpart_label", "marking_mode", "provenance", "content_version"]) {
    assert.ok(!new RegExp(`\\bset\\s+${column}\\s*=`, "i").test(executable), `unexpected SET of "${column}"`);
  }
});

test("byte-for-byte prompt preservation is positively proven: a full pre-write prompt snapshot is captured and compared against the post-write value for all 3 rows", () => {
  assert.match(executable, /tmp_linkedvalues_prompt_snapshot/);
  assert.match(executable, /select id, prompt from public\.ali_question_bank where id = any\(v_target_ids\)/);
  assert.match(executable, /where b\.prompt = s\.prompt_snapshot/);
  assert.match(executable, /post-write preservation check failed/);
});

test("mock_eligible is explicitly, positively proven absent after this migration -- both in the apply branch and the already-applied branch", () => {
  const occurrences = [...executable.matchAll(/eligibility_status = 'mock_eligible'/g)];
  assert.ok(occurrences.length >= 2, `expected mock_eligible absence to be checked in both branches, found ${occurrences.length} checks`);
  assert.match(executable, /mock_eligible must never be set by this migration/);
  assert.match(executable, /mock_eligible found set on % rows in the already-applied branch/);
});

test("resulting eligibility_status is exactly independently_validated, never mock_eligible, set only via the guarded UPDATE", () => {
  assert.match(executable, /set eligibility_status = 'independently_validated'/);
  assert.ok(!/set eligibility_status = 'mock_eligible'/.test(executable));
});

test("idempotent structure: the already-validated branch (v_already_validated_count = 3) contains no UPDATE statement", () => {
  const alreadyAppliedBranch = executable.match(/elsif v_already_validated_count = 3 then[\s\S]*?else/)![0];
  assert.ok(!/\bupdate\s+public\.ali_question_bank\b/i.test(alreadyAppliedBranch));
});

test("mixed/unexpected state (neither exactly 3 pending nor exactly 3 already-validated) is explicitly refused via RAISE EXCEPTION, not silently repaired", () => {
  assert.match(executable, /Migration 123 refused: expected 3 authentic_assessment_candidate rows for mock-mr06-linkedvalues \(found %\), or 3 already independently_validated \(found %\)/);
});

test("touches only public.ali_question_bank via UPDATE; the only real table read anywhere else is ali_family_review (SELECT only) and a local temp table", () => {
  const updateTargets = [...executable.matchAll(/update\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(updateTargets), new Set(["ali_question_bank"]));
  const insertTargets = [...executable.matchAll(/insert into\s+(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(insertTargets), new Set(["tmp_linkedvalues_prompt_snapshot"]));
});

test("no ali_mock_form mutation or reference anywhere", () => {
  assert.ok(!executable.includes("ali_mock_form"));
});

test("no RPC/function is created, replaced, or altered; no RLS policy or grant statement appears", () => {
  assert.ok(!/create (or replace )?function/i.test(executable));
  assert.ok(!/create policy|alter policy/i.test(executable));
  assert.ok(!/\bgrant\b|\brevoke\b/i.test(executable));
});

test("no other Mathematics family, English, or Writing content is referenced", () => {
  assert.ok(!/mock-eng-|mock-writing-/.test(executable));
  assert.ok(!/mock-mr0[1-5]-|mock-mr0[7-9]-|mock-mr1[0-3]-/.test(executable.replace(/mock-mr06-linkedvalues/g, "")));
});

test("fails safely: multiple RAISE EXCEPTION guards and at least 2 RAISE NOTICE informational messages", () => {
  const exceptionCount = (executable.match(/raise exception/g) || []).length;
  const noticeCount = (executable.match(/raise notice/g) || []).length;
  assert.ok(exceptionCount >= 10, `expected several RAISE EXCEPTION guards, found ${exceptionCount}`);
  assert.ok(noticeCount >= 2);
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present, documents dependency on migrations 119/120/121/122", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /migrations 119,\s*\n-- 120, 121, and 122/);
});
