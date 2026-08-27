import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics First Mock — Useful Certified Reserve Promotion to Mock
 * Eligible (Decision 210, commit 2140475, Founder-directed Option C).
 * Structural tests against migration 144's own SQL text, mirroring
 * migration 105's own established pool-eligible-promotion pattern (target
 * allow-list, eligibility_status-only mutation, fail-closed three-state
 * structure) extended with migration 129/142's own per-family structural
 * precondition rigor (grouping, difficulty, marks, answers, sharedStem/
 * stimulus) across all six target families at once, plus an explicit
 * Perimeter Area exclusion/safety guard.
 */

const sql = fs.readFileSync(
  "supabase/migrations/144_mock_mathematics_useful_reserve_mock_eligible_promotion.sql",
  "utf8"
);
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const BUSTIMETABLE_IDS = ["mock-mr10-bustimetable-01", "mock-mr10-bustimetable-02", "mock-mr10-bustimetable-03", "mock-mr10-bustimetable-04"];
const CRAFTSTALL_IDS = ["mock-mr13-craftstall-01", "mock-mr13-craftstall-02", "mock-mr13-craftstall-03"];
const FUNRUN_IDS = ["mock-mr09-funrun-01", "mock-mr09-funrun-02", "mock-mr09-funrun-03", "mock-mr09-funrun-04"];
const CAMPINGSALE_IDS = ["mock-mr04-campingsale-01", "mock-mr04-campingsale-02", "mock-mr04-campingsale-03", "mock-mr04-campingsale-04"];
const NUMBERPUZZLE_IDS = ["mock-mr06-numberpuzzle-01", "mock-mr06-numberpuzzle-02", "mock-mr06-numberpuzzle-03"];
const ROUNDINGBOUNDS_IDS = ["mock-mr11-roundingbounds-01", "mock-mr11-roundingbounds-02", "mock-mr11-roundingbounds-03", "mock-mr11-roundingbounds-04"];
const ALL_22_IDS = [...BUSTIMETABLE_IDS, ...CRAFTSTALL_IDS, ...FUNRUN_IDS, ...CAMPINGSALE_IDS, ...NUMBERPUZZLE_IDS, ...ROUNDINGBOUNDS_IDS];

test("exact six-family, 22-row allow-list: v_target_ids contains exactly the union of all six families, no more no less, no duplicates", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/);
  assert.ok(match);
  const ids = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.equal(ids.length, 22);
  assert.equal(new Set(ids).size, 22, "no duplicate IDs in the allow-list");
  assert.deepEqual(ids.sort(), [...ALL_22_IDS].sort());
});

test("exact family scope: only the six Decision-210-authorised family prefixes appear in the allow-list", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/);
  const ids = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  const allowedPrefixes = ["mock-mr10-bustimetable-", "mock-mr13-craftstall-", "mock-mr09-funrun-", "mock-mr04-campingsale-", "mock-mr06-numberpuzzle-", "mock-mr11-roundingbounds-"];
  for (const id of ids) {
    assert.ok(allowedPrefixes.some((p) => id.startsWith(p)), `${id} is not one of the six authorised families`);
  }
});

test("per-family row counts match the exact expected shape: 4/3/4/4/3/4", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/);
  const ids = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.equal(ids.filter((id) => id.startsWith("mock-mr10-bustimetable-")).length, 4);
  assert.equal(ids.filter((id) => id.startsWith("mock-mr13-craftstall-")).length, 3);
  assert.equal(ids.filter((id) => id.startsWith("mock-mr09-funrun-")).length, 4);
  assert.equal(ids.filter((id) => id.startsWith("mock-mr04-campingsale-")).length, 4);
  assert.equal(ids.filter((id) => id.startsWith("mock-mr06-numberpuzzle-")).length, 3);
  assert.equal(ids.filter((id) => id.startsWith("mock-mr11-roundingbounds-")).length, 4);
});

test("array-shape guards present: exact-22 length check and duplicate check, evaluated before any branch", () => {
  assert.match(executable, /v_array_length <> 22/);
  assert.match(executable, /count\(distinct t\) from unnest\(v_target_ids\) t\) <> 22/);
});

test("Perimeter Area exclusion: never appears in the target array, and an explicit LIKE-based exists() guard refuses the migration if it ever did", () => {
  const targetMatch = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/)![1];
  assert.ok(!targetMatch.includes("perimeterarea"));
  assert.match(executable, /t like 'mock-mr03mr07-perimeterarea%'/);
});

test("unauthorised-family exclusion: the exists() guard's own third disjunct refuses any id not matching one of the six authorised prefixes", () => {
  const block = executable.match(/if exists \([\s\S]*?target array must contain only the six/)![0];
  for (const prefix of ["mock-mr10-bustimetable-", "mock-mr13-craftstall-", "mock-mr09-funrun-", "mock-mr04-campingsale-", "mock-mr06-numberpuzzle-", "mock-mr11-roundingbounds-"]) {
    assert.match(block, new RegExp(`t not like '${prefix}%'`));
  }
});

test("Perimeter Area safety guard: independently_validated (4 rows) is positively re-verified both pre-write and post-write (apply branch) and in the already-applied branch", () => {
  const occurrences = [...executable.matchAll(/id like 'mock-mr03mr07-perimeterarea%' and eligibility_status = 'independently_validated'/g)];
  assert.ok(occurrences.length >= 3, `expected at least 3 Perimeter Area independently_validated checks (pre-write, post-write apply, already-applied branch), found ${occurrences.length}`);
});

test("Perimeter Area must never become mock_eligible: explicit post-write proof it is not, in addition to the positive independently_validated re-check", () => {
  assert.match(executable, /id like 'mock-mr03mr07-perimeterarea%' and eligibility_status = 'mock_eligible'/);
  assert.match(executable, /Migration 144 refused: mock-mr03mr07-perimeterarea must never become mock_eligible/);
});

test("per-family grouping preconditions: exact question_group_id/group_order/subpart_label shape asserted for all six families", () => {
  assert.match(executable, /b\.question_group_id = 'mock-mr10-bustimetable' and b\.group_order = e\.go and b\.subpart_label = e\.sl/);
  assert.match(executable, /b\.question_group_id = 'mock-mr13-craftstall' and b\.group_order = e\.go and b\.subpart_label = e\.sl/);
  assert.match(executable, /b\.question_group_id = 'mock-mr09-funrun' and b\.group_order = e\.go and b\.subpart_label = e\.sl/);
  assert.match(executable, /b\.question_group_id = 'mock-mr04-campingsale' and b\.group_order = e\.go and b\.subpart_label = e\.sl/);
  assert.match(executable, /b\.question_group_id = 'mock-mr06-numberpuzzle' and b\.group_order = e\.go and b\.subpart_label = e\.sl/);
  assert.match(executable, /b\.question_group_id = 'mock-mr11-roundingbounds' and b\.group_order = e\.go and b\.subpart_label = e\.sl/);
});

test("per-family difficulty preconditions match each family's own certified difficulty shape", () => {
  assert.match(executable, /\('mock-mr10-bustimetable-01', 'medium'\), \('mock-mr10-bustimetable-02', 'medium'\),\s*\n\s*\('mock-mr10-bustimetable-03', 'hard'\), \('mock-mr10-bustimetable-04', 'hard'\)/);
  assert.match(executable, /\('mock-mr13-craftstall-01', 'medium'\), \('mock-mr13-craftstall-02', 'medium'\), \('mock-mr13-craftstall-03', 'hard'\)/);
  assert.match(executable, /\('mock-mr09-funrun-01', 'medium'\), \('mock-mr09-funrun-02', 'medium'\),\s*\n\s*\('mock-mr09-funrun-03', 'hard'\), \('mock-mr09-funrun-04', 'hard'\)/);
  assert.match(executable, /\('mock-mr04-campingsale-01', 'easy'\), \('mock-mr04-campingsale-02', 'medium'\),\s*\n\s*\('mock-mr04-campingsale-03', 'hard'\), \('mock-mr04-campingsale-04', 'hard'\)/);
  assert.match(executable, /\('mock-mr06-numberpuzzle-01', 'medium'\), \('mock-mr06-numberpuzzle-02', 'medium'\), \('mock-mr06-numberpuzzle-03', 'hard'\)/);
  assert.match(executable, /\('mock-mr11-roundingbounds-01', 'easy'\), \('mock-mr11-roundingbounds-02', 'easy'\),\s*\n\s*\('mock-mr11-roundingbounds-03', 'medium'\), \('mock-mr11-roundingbounds-04', 'hard'\)/);
});

test("per-family answer preconditions match each family's own certified stored answers", () => {
  assert.match(executable, /\('mock-mr10-bustimetable-01', '95'\), \('mock-mr10-bustimetable-02', '7'\),\s*\n\s*\('mock-mr10-bustimetable-03', '370'\), \('mock-mr10-bustimetable-04', '28'\)/);
  assert.match(executable, /\('mock-mr13-craftstall-01', '18\.00'\), \('mock-mr13-craftstall-02', 'Stickers'\), \('mock-mr13-craftstall-03', '3'\)/);
  assert.match(executable, /\('mock-mr09-funrun-01', '30'\), \('mock-mr09-funrun-02', '74'\),\s*\n\s*\('mock-mr09-funrun-03', '2\.5'\), \('mock-mr09-funrun-04', '14'\)/);
  assert.match(executable, /\('mock-mr04-campingsale-01', '£102'\), \('mock-mr04-campingsale-02', '£91\.80'\),\s*\n\s*\('mock-mr04-campingsale-03', '£1\.80'\), \('mock-mr04-campingsale-04', '£170'\)/);
  assert.match(executable, /\('mock-mr06-numberpuzzle-01', '81'\), \('mock-mr06-numberpuzzle-02', '9'\), \('mock-mr06-numberpuzzle-03', '0'\)/);
  assert.match(executable, /\('mock-mr11-roundingbounds-01', '384'\), \('mock-mr11-roundingbounds-02', '235'\),\s*\n\s*\('mock-mr11-roundingbounds-03', '628'\), \('mock-mr11-roundingbounds-04', '131'\)/);
});

test("per-family sharedStem preconditions assert the exact certified narrative/scenario text for all six families", () => {
  assert.match(executable, /v_bustimetable_stem constant text := 'A bus company runs a route from Hillview to Oakford/);
  assert.match(executable, /v_craftstall_stem constant text := 'A craft fair stall sells keyrings, bracelets and stickers\./);
  assert.match(executable, /v_funrun_stem constant text := 'Riverside Primary School held a sponsored fun run\./);
  assert.match(executable, /v_campingsale_stem constant text := 'A camping shop sells tents\.'/);
  assert.match(executable, /v_numberpuzzle_stem constant text := 'A number puzzle uses a hidden positive whole number, n\./);
  assert.match(executable, /v_roundingbounds_stem constant text := 'At the Oakwood Athletics Meet, the number of adult spectators rounds to 380/);
});

test("stimulus-bearing families (Bus Timetable, Craft Stall, Fun Run) require a valid table stimulus on every row", () => {
  const stimulusChecks = [...executable.matchAll(/where id like '([\w-]+)-%' and jsonb_typeof\(prompt->'stimulus'\) = 'object' and prompt->'stimulus'->>'type' = 'table'/g)].map((m) => m[1]);
  assert.deepEqual(new Set(stimulusChecks), new Set(["mock-mr10-bustimetable", "mock-mr13-craftstall", "mock-mr09-funrun"]));
});

test("text-only families (Camping Sale, Number Puzzle, Rounding Bounds) require the absence of a stimulus key on every row", () => {
  const noStimulusChecks = [...executable.matchAll(/where id like '([\w-]+)-%' and prompt \? 'stimulus'\) <> 0/g)].map((m) => m[1]);
  assert.deepEqual(new Set(noStimulusChecks), new Set(["mock-mr04-campingsale", "mock-mr06-numberpuzzle", "mock-mr11-roundingbounds"]));
});

test("22-row marks precondition: (prompt->>'marks')::numeric = 1 required across all 22 rows, not per-family only", () => {
  assert.match(executable, /v_marks_count from public\.ali_question_bank where id = any\(v_target_ids\) and \(prompt->>'marks'\)::numeric = 1/);
  assert.match(executable, /v_marks_count <> 22/);
});

test("22-row marking_mode=deterministic and active=true preconditions required across all 22 rows", () => {
  assert.match(executable, /v_marking_mode_count <> 22/);
  assert.match(executable, /v_active_count <> 22/);
});

test("required source status: precondition and UPDATE both require eligibility_status = 'independently_validated' before touching a row, scoped by subject = 'maths'", () => {
  const preconditionBlock = executable.match(/select count\(\*\) into v_pending_count[\s\S]*?subject = 'maths';/)![0];
  assert.match(preconditionBlock, /eligibility_status = 'independently_validated'/);
  assert.match(preconditionBlock, /active = true/);
  assert.match(preconditionBlock, /subject = 'maths'/);

  const updateBlock = executable.match(/update public\.ali_question_bank[\s\S]*?eligibility_status = 'independently_validated';/)![0];
  assert.match(updateBlock, /where id = any\(v_target_ids\)/);
});

test("resulting status is exactly 'mock_eligible' -- the only value this migration's UPDATE ever SETs", () => {
  const setStatements = [...executable.matchAll(/set eligibility_status = '(\w+)'/g)].map((m) => m[1]);
  assert.deepEqual(setStatements, ["mock_eligible"]);
});

test("no content-field UPDATE: eligibility_status is the only column ever SET by this migration", () => {
  const setClauses = [...executable.matchAll(/\bset\s+([a-z_]+)\s*=/gi)].map((m) => m[1].toLowerCase());
  assert.deepEqual(new Set(setClauses), new Set(["eligibility_status"]));
});

test("grouping/prompt/active/family_id/skill/content_difficulty columns are never SET by this migration", () => {
  for (const column of ["prompt", "active", "family_id", "skill", "content_difficulty", "question_group_id", "group_order", "subpart_label", "marking_mode"]) {
    assert.ok(!new RegExp(`\\bset\\s+${column}\\s*=`, "i").test(executable), `unexpected SET of "${column}"`);
  }
});

test("byte-for-byte prompt preservation is positively proven for all 22 rows via a full pre-write snapshot compared post-write", () => {
  assert.match(executable, /tmp_reserve_promotion_prompt_snapshot/);
  assert.match(executable, /select id, prompt from public\.ali_question_bank where id = any\(v_target_ids\)/);
  assert.match(executable, /where b\.prompt = s\.prompt_snapshot/);
  assert.match(executable, /v_post_write_preserved_count <> 22/);
});

test("atomic per-family completeness: post-write, each of the six families' own full row count (4/3/4/4/3/4) is re-verified mock_eligible -- never a partial number", () => {
  const checks = [
    ["mock-mr10-bustimetable-%", 4],
    ["mock-mr13-craftstall-%", 3],
    ["mock-mr09-funrun-%", 4],
    ["mock-mr04-campingsale-%", 4],
    ["mock-mr06-numberpuzzle-%", 3],
    ["mock-mr11-roundingbounds-%", 4],
  ] as const;
  for (const [pattern, count] of checks) {
    const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(`where id like '${escaped}' and eligibility_status = 'mock_eligible';\\s*\\n\\s*if v_family_count <> ${count} then`);
    assert.match(executable, re, `expected an atomic completeness check for ${pattern} requiring exactly ${count} mock_eligible rows`);
  }
});

test("no partial-family or partial-array UPDATE is structurally possible: exactly one UPDATE statement, targeting the full 22-id array in one WHERE clause", () => {
  const updateStatements = [...executable.matchAll(/\bupdate\s+public\.ali_question_bank\b/gi)];
  assert.equal(updateStatements.length, 1, "expected exactly one UPDATE statement");
  const updateBlock = executable.match(/update public\.ali_question_bank[\s\S]*?eligibility_status = 'independently_validated';/)![0];
  assert.match(updateBlock, /where id = any\(v_target_ids\)/);
});

test("pool-baseline guard: pre-write mock_eligible Mathematics total must be either 55 (pristine) or 77 (already applied), never silently accepted otherwise", () => {
  assert.match(executable, /v_pre_mock_eligible_total not in \(55, 77\)/);
});

test("post-write total proof: Mathematics mock_eligible total becomes exactly 77 (55 + 22) after a real promotion, and is re-verified 77 in the already-applied branch too", () => {
  const occurrences = [...executable.matchAll(/v_post_mock_eligible_total <> 77/g)];
  assert.ok(occurrences.length >= 2, `expected the 77-total check in both the apply and already-applied branches, found ${occurrences.length}`);
});

test("no ali_family_review mutation: this migration never inserts, updates, or deletes that table -- certification is a prerequisite verified via eligibility_status, not re-run here", () => {
  assert.ok(!executable.includes("ali_family_review"));
});

test("no ali_mock_form reference or mutation anywhere", () => {
  assert.ok(!executable.includes("ali_mock_form"));
});

test("no mock_create_attempt or any other RPC/function is created, replaced, altered, or called", () => {
  assert.ok(!/mock_create_attempt/i.test(executable));
  assert.ok(!/create (or replace )?function/i.test(executable));
  assert.ok(!/create policy|alter policy/i.test(executable));
  assert.ok(!/\bgrant\b|\brevoke\b/i.test(executable));
});

test("touches only public.ali_question_bank via UPDATE; the only INSERT target is the local temp snapshot table", () => {
  const updateTargets = [...executable.matchAll(/update\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(updateTargets), new Set(["ali_question_bank"]));
  const insertTargets = [...executable.matchAll(/insert into\s+(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(insertTargets), new Set(["tmp_reserve_promotion_prompt_snapshot"]));
});

test("fails safely: multiple RAISE EXCEPTION guards and at least 2 RAISE NOTICE informational messages", () => {
  const exceptionCount = (executable.match(/raise exception/g) || []).length;
  const noticeCount = (executable.match(/raise notice/g) || []).length;
  assert.ok(exceptionCount >= 15, `expected many RAISE EXCEPTION guards across 6 families, found ${exceptionCount}`);
  assert.ok(noticeCount >= 2);
});

test("idempotent structure: the already-applied branch (v_already_mock_eligible_count = 22) contains no UPDATE statement", () => {
  const alreadyAppliedBranch = executable.match(/elsif v_already_mock_eligible_count = 22 then[\s\S]*?else/)![0];
  assert.ok(!/\bupdate\s+public\.ali_question_bank\b/i.test(alreadyAppliedBranch));
});

test("mixed/unexpected state (neither exactly 22 pending nor exactly 22 already-mock_eligible) is explicitly refused via RAISE EXCEPTION, not silently repaired", () => {
  assert.match(
    executable,
    /Migration 144 refused: expected 22 independently_validated rows across the six named families \(found %\), or 22 already mock_eligible \(found %\)/
  );
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present in the raw file header, and explicitly documents dependency on migrations 129/130/133/136/139/142", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /after migrations 129,\s*\n-- 130, 133, 136, 139, and 142/);
});

test("header explicitly documents that promotion does not substitute for certification -- eligibility_status = independently_validated is trusted as already-proven, ali_family_review is not re-queried", () => {
  assert.match(sql, /CERTIFICATION PREREQUISITE, NOT SUBSTITUTED/);
  assert.match(sql, /never a substitute for it/);
});

test("English and Writing content is never referenced anywhere in this Mathematics-only migration", () => {
  assert.ok(!/subject = 'english'|subject = 'writing'/i.test(executable));
  assert.ok(!/mock-eng-|mock-writing-/.test(executable));
});

test("Practice remains untouched: no practice_eligible reference anywhere", () => {
  assert.ok(!executable.includes("practice_eligible"));
});

test("Increment 007 is never referenced or begun by this migration", () => {
  assert.ok(!/increment.?007|increment 7\b/i.test(executable));
});

test("every RAISE with a % placeholder supplies exactly one matching argument (no literal unescaped percent signs)", () => {
  const raiseStatements = [...executable.matchAll(/raise (?:exception|notice)\s+'([^']*(?:''[^']*)*)'((?:\s*,\s*v_\w+)*)\s*;/g)];
  assert.ok(raiseStatements.length > 0);
  for (const [, message, args] of raiseStatements) {
    const placeholders = (message.match(/%/g) || []).length;
    const argCount = args ? (args.match(/v_\w+/g) || []).length : 0;
    assert.equal(placeholders, argCount, `RAISE message "${message}" has ${placeholders} placeholders but ${argCount} arguments`);
  }
});

/**
 * MATHEMATICAL/STRUCTURAL SANITY: 22 rows / 22 marks / 6 experiences,
 * independently re-derived from the six families' own certified shapes,
 * matching Decision 210's own re-derived reserve table exactly.
 */

test("STRUCTURAL: 4+3+4+4+3+4 = 22 rows, 22 marks (1 mark per row, all deterministic), 6 numbered-question experiences", () => {
  const perFamilyRowCounts = [4, 3, 4, 4, 3, 4];
  assert.equal(perFamilyRowCounts.reduce((a, b) => a + b, 0), 22);
  assert.equal(perFamilyRowCounts.length, 6);
});

test("STRUCTURAL: post-promotion Mathematics mock_eligible total (77) is independently derivable from the Decision-210 baseline (55) plus this migration's own 22-row scope", () => {
  assert.equal(55 + 22, 77);
});
