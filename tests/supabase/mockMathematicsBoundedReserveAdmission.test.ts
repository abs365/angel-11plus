import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * First Mathematics Mock — Bounded Reserve Admission (Decision 183/184).
 * Structural tests against migration 124's own SQL text, mirroring
 * migration 105's own established mock_eligible-promotion pattern,
 * extended with migration 123/124's own content-shape and (Decision
 * 182-corrected) live review-evidence preconditions.
 */

const sql = fs.readFileSync("supabase/migrations/124_mock_mathematics_bounded_reserve_admission.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const TARGET_IDS = [
  "mock-mr10-fairprep-01", "mock-mr10-fairprep-02",
  "mock-mr09-runningclub-01", "mock-mr09-runningclub-02",
  "mock-mr06-linkedvalues-01", "mock-mr06-linkedvalues-02", "mock-mr06-linkedvalues-03",
];
const EXCLUDED_IDS = [
  "mock-mr03mr07-perimeterarea-01a", "mock-mr03mr07-perimeterarea-01b",
  "mock-mr03mr07-perimeterarea-02a", "mock-mr03mr07-perimeterarea-02b",
];

test("targets exactly the 7 rows across the 3 authorised families, no more no less", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/);
  assert.ok(match);
  const ids = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.deepEqual(ids.sort(), [...TARGET_IDS].sort());
});

test("exactly 3 families are named as the precondition family_id allow-list", () => {
  assert.match(executable, /family_id in \('mock-mr10-fairprep', 'mock-mr09-runningclub', 'mock-mr06-linkedvalues'\)/);
});

test("mock-mr03mr07-perimeterarea is structurally absent from the target array and explicitly refused if it ever appears there", () => {
  const targetMatch = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/)![1];
  for (const excludedId of EXCLUDED_IDS) {
    assert.ok(!targetMatch.includes(excludedId), `${excludedId} must never appear in v_target_ids`);
  }
  assert.match(executable, /if exists \(select 1 from unnest\(v_excluded_ids\) e where e = any\(v_target_ids\)\) then/);
  assert.match(sql, /mock-mr03mr07-perimeterarea must never appear in the target admission array/);
});

test("v_excluded_ids constant array contains exactly perimeterarea's 4 real rows", () => {
  const match = executable.match(/v_excluded_ids constant text\[\] := array\[([\s\S]*?)\];/);
  assert.ok(match);
  const ids = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.deepEqual(ids.sort(), [...EXCLUDED_IDS].sort());
});

test("reserve-preservation guard: perimeterarea's 4 rows must be independently_validated BEFORE any write, checked pre-write and re-checked post-write in both branches", () => {
  const preWrite = executable.match(/select count\(\*\) into v_excluded_still_validated_count[\s\S]*?end if;/)![0];
  assert.match(preWrite, /id = any\(v_excluded_ids\) and eligibility_status = 'independently_validated'/);
  assert.match(preWrite, /v_excluded_still_validated_count <> 4/);

  const postWriteApply = executable.match(/if v_pending_count = 7 then[\s\S]*?elsif/)![0];
  assert.match(postWriteApply, /post-write reserve-preservation check failed/);

  const postWriteNoop = executable.match(/elsif v_already_mock_eligible_count = 7 then[\s\S]*?else/)![0];
  assert.match(postWriteNoop, /id = any\(v_excluded_ids\) and eligibility_status = 'independently_validated'/);
});

test("marks precondition: all 7 rows must read marks=1 from prompt->>'marks'", () => {
  assert.match(executable, /\(prompt->>'marks'\)::numeric = 1/);
  assert.match(sql, /Marking Integrity Gate must never be assumed satisfied/);
});

test("grouping shape preconditions present for all 3 families via explicit VALUES joins", () => {
  assert.match(executable, /join \(values \('mock-mr10-fairprep-01', 1, '\(a\)'\), \('mock-mr10-fairprep-02', 2, '\(b\)'\)\)/);
  assert.match(executable, /join \(values \('mock-mr09-runningclub-01', 1, '\(a\)'\), \('mock-mr09-runningclub-02', 2, '\(b\)'\)\)/);
  assert.match(executable, /join \(values \('mock-mr06-linkedvalues-01', 1, '\(a\)'\), \('mock-mr06-linkedvalues-02', 2, '\(b\)'\), \('mock-mr06-linkedvalues-03', 3, '\(c\)'\)\)/);
});

test("runningclub structured table stimulus precondition present -- required on runningclub only, never asserted on fairprep or linkedvalues", () => {
  const block = executable.match(/select count\(\*\) into v_runningclub_stimulus_count[\s\S]*?end if;/)![0];
  assert.match(block, /id in \('mock-mr09-runningclub-01', 'mock-mr09-runningclub-02'\)/);
  assert.match(block, /jsonb_typeof\(prompt->'stimulus'\) = 'object'/);
  assert.match(block, /prompt->'stimulus'->>'type' = 'table'/);
});

test("linkedvalues sharedStem precondition present -- exact expected value, required on linkedvalues only", () => {
  const block = executable.match(/select count\(\*\) into v_linkedvalues_sharedstem_count[\s\S]*?end if;/)![0];
  assert.match(block, /id in \('mock-mr06-linkedvalues-01', 'mock-mr06-linkedvalues-02', 'mock-mr06-linkedvalues-03'\)/);
  assert.match(block, /\(prompt->>'sharedStem'\) = v_linkedvalues_stem/);
});

test("no irrelevant metadata (stimulus, sharedStem) is asserted as a precondition on fairprep", () => {
  const stimulusBlock = executable.match(/select count\(\*\) into v_runningclub_stimulus_count[\s\S]*?end if;/)![0];
  const sharedStemBlock = executable.match(/select count\(\*\) into v_linkedvalues_sharedstem_count[\s\S]*?end if;/)![0];
  assert.ok(!stimulusBlock.includes("fairprep"));
  assert.ok(!sharedStemBlock.includes("fairprep"));
});

test("Decision 182 lesson applied directly: every review-evidence marker predicate is UNANCHORED (leading %), never anchored to the start of notes", () => {
  const reviewBlock = executable.match(/select count\(\*\) into v_fairprep_approved_count[\s\S]*?v_linkedvalues_approved_count < 1 then[\s\S]*?end if;/)![0];
  assert.ok(!/notes like 'MOCK-/.test(reviewBlock), "must never use an anchored (no leading %) marker pattern");
  assert.match(reviewBlock, /notes like '%MOCK-SHARED-SCENARIO-COMPLETION-BATCH%'/);
  assert.match(reviewBlock, /notes like '%MOCK-STRUCTURAL-CAPACITY-INC001%'/);
});

test("review-evidence predicates accept ANY count >= 1, never require exactly 1 -- multiple legitimate approvals must never invalidate certification", () => {
  const approvedCountChecks = [...executable.matchAll(/v_(fairprep|runningclub|linkedvalues)_approved_count < 1/g)];
  assert.equal(approvedCountChecks.length, 3);
  assert.ok(!/v_\w+_approved_count (<>|=) 1\b/.test(executable), "must never require an exact count of 1 approval");
});

test("review-evidence predicates check family_id, decision=approved, review_type, and reviewer for all 3 families", () => {
  for (const family of ["mock-mr10-fairprep", "mock-mr09-runningclub", "mock-mr06-linkedvalues"]) {
    assert.match(executable, new RegExp(`family_id = '${family}'`));
  }
  const decisionMatches = [...executable.matchAll(/decision = 'approved'/g)];
  assert.equal(decisionMatches.length, 3);
  const reviewerMatches = [...executable.matchAll(/reviewer = 'Ayobami Lawal'/g)];
  assert.equal(reviewerMatches.length, 3);
});

test("no ali_family_review mutation anywhere: only SELECT (via count) ever touches that table", () => {
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
  for (const column of ["prompt", "active", "family_id", "skill", "content_difficulty", "question_group_id", "group_order", "subpart_label", "marking_mode"]) {
    assert.ok(!new RegExp(`\\bset\\s+${column}\\s*=`, "i").test(executable), `unexpected SET of "${column}"`);
  }
});

test("byte-for-byte prompt preservation is positively proven for all 7 rows via a full pre-write snapshot compared post-write", () => {
  assert.match(executable, /tmp_bounded_admission_prompt_snapshot/);
  assert.match(executable, /select id, prompt from public\.ali_question_bank where id = any\(v_target_ids\)/);
  assert.match(executable, /where b\.prompt = s\.prompt_snapshot/);
  assert.match(executable, /post-write preservation check failed/);
});

test("resulting eligibility_status is exactly mock_eligible, set only via the guarded UPDATE", () => {
  assert.match(executable, /set eligibility_status = 'mock_eligible'/);
});

test("idempotent structure: the already-applied branch (v_already_mock_eligible_count = 7) contains no UPDATE statement", () => {
  const alreadyAppliedBranch = executable.match(/elsif v_already_mock_eligible_count = 7 then[\s\S]*?else/)![0];
  assert.ok(!/\bupdate\s+public\.ali_question_bank\b/i.test(alreadyAppliedBranch));
});

test("mixed/unexpected state is explicitly refused via RAISE EXCEPTION, not silently repaired", () => {
  assert.match(executable, /Migration 124 refused: expected 7 independently_validated rows across the 3 named families \(found %\), or 7 already mock_eligible \(found %\)/);
});

test("touches only public.ali_question_bank via UPDATE; only local temp tables are ever INSERTed into", () => {
  const updateTargets = [...executable.matchAll(/update\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(updateTargets), new Set(["ali_question_bank"]));
  const insertTargets = [...executable.matchAll(/insert into\s+(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(insertTargets), new Set(["tmp_bounded_admission_prompt_snapshot"]));
});

test("no ali_mock_form, RPC, RLS policy, or grant is ever touched", () => {
  assert.ok(!executable.includes("ali_mock_form"));
  assert.ok(!/create (or replace )?function/i.test(executable));
  assert.ok(!/create policy|alter policy/i.test(executable));
  assert.ok(!/\bgrant\b|\brevoke\b/i.test(executable));
});

test("no Practice/practice_eligible mutation or reference anywhere", () => {
  assert.ok(!executable.includes("practice_eligible"));
});

test("no English or Writing content is referenced", () => {
  assert.ok(!/mock-eng-|mock-writing-/.test(executable));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present, documents dependency on migrations 116 and 123", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /migrations 116/);
  assert.match(sql, /123 \(linkedvalues/);
});
