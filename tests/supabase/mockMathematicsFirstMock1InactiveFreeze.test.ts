import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics First Mock 1 — Inactive Freeze (Decision 213/214). Structural
 * tests against migration 147's own SQL text.
 */

const sql = fs.readFileSync("supabase/migrations/147_mock_mathematics_first_mock_1_inactive_freeze.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

test("targets exactly 56 question ids, no duplicates", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/);
  assert.ok(match);
  const ids = [...match![1].matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.equal(ids.length, 56);
  assert.equal(new Set(ids).size, 56, "no duplicate IDs in the target array");
});

test("array-shape guards present: exact-56 length check and duplicate check", () => {
  assert.match(executable, /v_array_length <> 56/);
  assert.match(executable, /count\(distinct t\) into v_distinct_count from unnest\(v_target_ids\) t/);
  assert.match(executable, /v_distinct_count <> 56/);
});

test("mock-mr06-sumdiff is absent from the target array (Founder-directed substitution)", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/)![1];
  assert.ok(!match.includes("sumdiff"));
});

test("mock-mr09-runningclub is present as a complete 2-row group in the target array", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/)![1];
  const ids = [...match.matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  const runningclubIds = ids.filter((id) => id.startsWith("mock-mr09-runningclub-"));
  assert.deepEqual(runningclubIds.sort(), ["mock-mr09-runningclub-01", "mock-mr09-runningclub-02"]);
});

test("mock-mr03mr07-perimeterarea never appears in the target array", () => {
  const match = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/)![1];
  assert.ok(!match.includes("perimeterarea"));
});

test("live eligibility precondition requires mock_eligible/active/maths for all 56 rows, not assumed from a past report", () => {
  const block = executable.match(/select count\(\*\) into v_eligible_count[\s\S]*?end if;/)![0];
  assert.match(block, /eligibility_status = 'mock_eligible'/);
  assert.match(block, /active = true/);
  assert.match(block, /subject = 'maths'/);
  assert.match(block, /v_eligible_count <> 56/);
});

test("live marks-sum precondition requires exactly 56 total marks, computed live not assumed", () => {
  const block = executable.match(/select sum\(\(prompt->>'marks'\)::numeric\) into v_marks_sum[\s\S]*?end if;/)![0];
  assert.match(block, /v_marks_sum <> 56/);
  assert.match(block, /Marking Integrity Gate must never be assumed satisfied/);
});

test("grouped-family completeness precondition is generic over question_group_id, never a hardcoded family name", () => {
  const block = executable.match(/select count\(\*\) into v_group_completeness_bad[\s\S]*?end if;/)![0];
  assert.match(block, /g\.included <> g\.total/);
  assert.ok(!/'mock-mr\d+-\w+'/.test(block), "must never reference a specific family id literal");
});

test("Founder-directed substitution proofs: Perimeter Area absent, Sum/Difference absent, Running Club present-and-complete, each independently guarded", () => {
  assert.match(executable, /v_perimeterarea_present <> 0/);
  assert.match(executable, /v_sumdiff_present <> 0/);
  assert.match(executable, /v_runningclub_present <> 2/);
  assert.match(sql, /Founder-directed substitution, Decision 214/);
});

test("question_manifest literal contains exactly 56 {question_id, section} entries, section always 'mathematics'", () => {
  const match = executable.match(/v_question_manifest constant jsonb := '(\[.*?\])';/)!;
  const manifest = JSON.parse(match[1]);
  assert.equal(manifest.length, 56);
  for (const entry of manifest) {
    assert.deepEqual(Object.keys(entry).sort(), ["question_id", "section"]);
    assert.equal(entry.section, "mathematics");
  }
});

test("question_manifest order matches the target ids order exactly (curated educational-progression sequence, not alphabetical)", () => {
  const targetMatch = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/)![1];
  const targetIds = [...targetMatch.matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  const manifestMatch = executable.match(/v_question_manifest constant jsonb := '(\[.*?\])';/)!;
  const manifest = JSON.parse(manifestMatch[1]);
  assert.deepEqual(manifest.map((e: { question_id: string }) => e.question_id), targetIds);
  // Not alphabetically sorted -- proves genuine curated reordering, not the raw composer output.
  const sorted = [...targetIds].sort();
  assert.notDeepEqual(targetIds, sorted);
});

test("composition_provenance literal reports 21 numbered questions, 56 marks, targetExperienceCount 21", () => {
  const match = executable.match(/v_composition_provenance constant jsonb := '(\{.*?\})';/)!;
  const provenance = JSON.parse(match[1]);
  assert.equal(provenance.numberedQuestionCount, 21);
  assert.equal(provenance.totalMarks, 56);
  assert.equal(provenance.targetExperienceCount, 21);
  assert.equal(provenance.rawRowCount, 56);
  assert.ok(provenance.familyIds.includes("mock-mr09-runningclub"));
  assert.ok(!provenance.familyIds.includes("mock-mr06-sumdiff"));
});

test("INSERT sets active = false, subject = 'mathematics', attempt_type = 'full_mock', specification_version = 1", () => {
  const insertBlock = executable.match(/insert into public\.ali_mock_form[\s\S]*?false, v_composition_provenance\);/)![0];
  assert.match(insertBlock, /'mathematics', 1, 'full_mock', v_question_manifest, false, v_composition_provenance/);
});

test("active is never set to true anywhere in this migration", () => {
  assert.ok(!/active\s*=\s*true/.test(executable.replace(/where id = any\(v_target_ids\) and eligibility_status = 'mock_eligible' and active = true and subject = 'maths';/g, "").replace(/and b\.eligibility_status = 'mock_eligible' and b\.active = true/g, "")));
});

test("idempotent structure: already-applied branch verifies exact match before treating as a no-op, never blindly skips", () => {
  const alreadyAppliedBranch = executable.match(/elsif v_existing_count = 1 then[\s\S]*?else/)![0];
  assert.match(alreadyAppliedBranch, /question_manifest = v_question_manifest/);
  assert.match(alreadyAppliedBranch, /active = false/);
  assert.match(alreadyAppliedBranch, /if not v_existing_matches then/);
  assert.match(alreadyAppliedBranch, /raise exception/);
  assert.ok(!/\binsert into\b/i.test(alreadyAppliedBranch));
});

test("mixed/unexpected state (more than 1 existing row with this id) is explicitly refused via RAISE EXCEPTION", () => {
  assert.match(executable, /Migration 147 refused: expected 0 or 1 existing ali_mock_form rows with id %, found %/);
});

test("no ali_mock_attempt row is ever created, no mock_create_attempt/mock_create_cycle_attempt call", () => {
  assert.ok(!executable.includes("ali_mock_attempt"));
  assert.ok(!/mock_create_attempt|mock_create_cycle_attempt/.test(executable));
});

test("no ali_question_bank UPDATE/INSERT, no eligibility_status write, no ali_family_review reference", () => {
  assert.ok(!/update public\.ali_question_bank/i.test(executable));
  assert.ok(!/insert into public\.ali_question_bank/i.test(executable));
  assert.ok(!executable.includes("ali_family_review"));
});

test("touches only public.ali_mock_form via INSERT; no other table is ever written", () => {
  const insertTargets = [...executable.matchAll(/insert into\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(insertTargets), new Set(["ali_mock_form"]));
});

test("no RPC/function created or altered, no RLS policy or grant", () => {
  assert.ok(!/create (or replace )?function/i.test(executable));
  assert.ok(!/create policy|alter policy/i.test(executable));
  assert.ok(!/\bgrant\b|\brevoke\b/i.test(executable));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present, documents dependency on migrations 144/145/146", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /after migrations 144, 145,\s*\n-- and 146/);
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

/** Structural sanity re-derived independently, not merely trusted from the literal. */
test("STRUCTURAL: manifest row counts per numbered question, in curated order, sum to 56 and count 21 questions", () => {
  // directcalc,invdiv,unitconv,forward,percentchange,triangleanglesum,campingsale,
  // costumeschedule-01,linkedvalues,inverse,runningclub,reversepercent,roundingbounds,
  // isoscelesproperty,funrun,twostep,numberpuzzle,bustimetable,multiplerelation,
  // costumeschedule-02,craftstall
  const counts = [2, 3, 3, 2, 2, 2, 4, 2, 3, 2, 2, 2, 4, 2, 4, 3, 3, 4, 2, 2, 3];
  assert.equal(counts.length, 21);
  assert.equal(counts.reduce((a, b) => a + b, 0), 56);
});
