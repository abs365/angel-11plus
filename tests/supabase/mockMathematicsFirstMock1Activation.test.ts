import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics First Mock 1 — Activation (Decision 219). Structural tests
 * against migration 150's own SQL text -- the ONLY authorised change is
 * `active: false -> true` on the already-frozen `first-mock-mathematics-v1`
 * row inserted by migration 147.
 */

const sql = fs.readFileSync("supabase/migrations/150_mock_mathematics_first_mock_1_activation.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const migration147Sql = fs.readFileSync("supabase/migrations/147_mock_mathematics_first_mock_1_inactive_freeze.sql", "utf8");

test("targets exactly first-mock-mathematics-v1, no other form id", () => {
  assert.match(executable, /v_form_id constant text := 'first-mock-mathematics-v1';/);
  assert.equal((executable.match(/'first-mock-mathematics-v1'/g) || []).length >= 1, true);
});

test("expected question_manifest literal is byte-for-byte identical to migration 147's own inserted literal", () => {
  const m150 = executable.match(/v_expected_question_manifest constant jsonb := '(\[.*?\])';/)!;
  const m147 = migration147Sql.match(/v_question_manifest constant jsonb := '(\[.*?\])';/)!;
  assert.equal(m150[1], m147[1]);
});

test("expected composition_provenance literal is byte-for-byte identical to migration 147's own inserted literal", () => {
  const m150 = executable.match(/v_expected_composition_provenance constant jsonb := '(\{.*?\})';/)!;
  const m147 = migration147Sql.match(/v_composition_provenance constant jsonb := '(\{.*?\})';/)!;
  assert.equal(m150[1], m147[1]);
});

test("row-existence guard: refuses if first-mock-mathematics-v1 does not exist", () => {
  assert.match(executable, /if not found then/);
  assert.match(executable, /migration 147 must be applied first/);
});

test("literal-match guards present for subject, specification_version, attempt_type, question_manifest, composition_provenance", () => {
  assert.match(executable, /v_row\.subject is distinct from 'mathematics'/);
  assert.match(executable, /v_row\.specification_version is distinct from 1/);
  assert.match(executable, /v_row\.attempt_type is distinct from 'full_mock'/);
  assert.match(executable, /v_row\.question_manifest is distinct from v_expected_question_manifest/);
  assert.match(executable, /v_row\.composition_provenance is distinct from v_expected_composition_provenance/);
});

test("composition_provenance-derived counts (21/56/56) independently re-verified, not merely trusted", () => {
  assert.match(executable, /v_numbered_count := \(v_row\.composition_provenance->>'numberedQuestionCount'\)::int/);
  assert.match(executable, /v_total_marks := \(v_row\.composition_provenance->>'totalMarks'\)::int/);
  assert.match(executable, /v_raw_row_count := \(v_row\.composition_provenance->>'rawRowCount'\)::int/);
  assert.match(executable, /v_numbered_count <> 21 or v_total_marks <> 56 or v_raw_row_count <> 56/);
});

test("Founder-directed substitution proofs re-checked against manifest ids: Perimeter Area absent, Sum/Difference absent, Running Club present-and-complete", () => {
  assert.match(executable, /v_perimeterarea_present <> 0/);
  assert.match(executable, /v_sumdiff_present <> 0/);
  assert.match(executable, /v_runningclub_present <> 2/);
});

test("live eligibility precondition requires mock_eligible/active/maths for all 56 manifest questions at activation time, not assumed from the freeze", () => {
  const block = executable.match(/select count\(\*\) into v_eligible_count[\s\S]*?end if;/)![0];
  assert.match(block, /eligibility_status = 'mock_eligible'/);
  assert.match(block, /active = true/);
  assert.match(block, /subject = 'maths'/);
  assert.match(block, /v_eligible_count <> 56/);
  assert.match(block, /since the migration 147 freeze/);
});

test("live grouped-family completeness precondition is generic over question_group_id, never a hardcoded family name", () => {
  const block = executable.match(/select count\(\*\) into v_group_completeness_bad[\s\S]*?end if;/)![0];
  assert.match(block, /g\.included <> g\.total/);
  assert.ok(!/'mock-mr\d+-\w+'/.test(block), "must never reference a specific family id literal");
});

test("three-state activation: pristine (active=false) updates to active=true", () => {
  const block = executable.match(/if v_row\.active = false then[\s\S]*?elsif v_row\.active = true then/)![0];
  assert.match(block, /update public\.ali_mock_form/);
  assert.match(block, /set active = true/);
  assert.match(block, /where id = v_form_id/);
});

test("three-state activation: already-applied (active=true) is a safe no-op, no UPDATE issued", () => {
  const block = executable.match(/elsif v_row\.active = true then[\s\S]*?else/)![0];
  assert.ok(!/\bupdate\b/i.test(block), "already-applied branch must never issue an UPDATE");
  assert.match(block, /already applied, no-op/);
});

test("mixed/unexpected active state falls through to an explicit RAISE EXCEPTION", () => {
  const block = executable.match(/else\s*\n\s*raise exception 'Migration 150 refused: % active column[\s\S]*?end \$\$;/)![0];
  assert.match(block, /raise exception/);
});

test("the UPDATE statement sets active only -- no other column is ever assigned", () => {
  const updateMatch = executable.match(/update public\.ali_mock_form\s+set ([\s\S]*?)\s+where id = v_form_id;/)!;
  const setClause = updateMatch[1].trim();
  assert.equal(setClause, "active = true", `expected the UPDATE to set only active=true, found: "${setClause}"`);
});

test("question_manifest and composition_provenance are only ever compared (read), never assigned in an UPDATE", () => {
  assert.ok(!/set[\s\S]{0,80}question_manifest\s*=/.test(executable));
  assert.ok(!/set[\s\S]{0,80}composition_provenance\s*=/.test(executable));
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

test("touches only public.ali_mock_form via UPDATE; no other table is ever written", () => {
  const updateTargets = [...executable.matchAll(/update\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(updateTargets), new Set(["ali_mock_form"]));
  assert.ok(!/insert into\s+public\./i.test(executable), "must never INSERT -- migration 147 already owns row creation");
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

test("not applied disclosure present, documents dependency on migrations 147/148/149", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /after migrations 147, 148,\s*\n-- and 149/);
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

test("STRUCTURAL: target id array reconstructed from this migration alone matches 56 ids, no duplicates, matches migration 147 exactly", () => {
  const match150 = executable.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/)![1];
  const ids150 = [...match150.matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.equal(ids150.length, 56);
  assert.equal(new Set(ids150).size, 56);

  const executable147 = migration147Sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");
  const match147 = executable147.match(/v_target_ids constant text\[\] := array\[([\s\S]*?)\];/)![1];
  const ids147 = [...match147.matchAll(/'([\w-]+)'/g)].map((m) => m[1]);
  assert.deepEqual(ids150, ids147, "migration 150's target id array must match migration 147's exactly, same order");
});

test("does not change specification_version, attempt_type, or subject values anywhere via assignment", () => {
  assert.ok(!/set[\s\S]{0,80}specification_version\s*=/.test(executable));
  assert.ok(!/set[\s\S]{0,80}attempt_type\s*=/.test(executable));
  assert.ok(!/set[\s\S]{0,80}subject\s*=/.test(executable));
});
