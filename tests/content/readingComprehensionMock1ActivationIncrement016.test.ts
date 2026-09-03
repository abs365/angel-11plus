import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Programme Completion Increment 016 — Reading Comprehension Mock 1
 * activation (migration 217). CODE/SQL VERIFIED, NOT PRODUCTION
 * VERIFIED (same disclosed limitation as every migration-content test in
 * this repository — no live database connection this session).
 */

const migration212 = fs.readFileSync("supabase/migrations/212_reading_comprehension_mock_1_freeze.sql", "utf8");
const migration217 = fs.readFileSync("supabase/migrations/217_reading_comprehension_mock_1_activation.sql", "utf8");

function stripComments(sql: string): string {
  return sql.split("\n").filter((l) => !l.trimStart().startsWith("--")).join("\n");
}

function extractJsonConstant(sql: string, varName: string, open: "[" | "{"): string {
  const close = open === "[" ? "]" : "}";
  const re = new RegExp(`${varName} constant jsonb := '(\\${open}.*?\\${close})'::jsonb;`);
  const m = sql.match(re);
  assert.ok(m, `${varName} constant not found`);
  return m![1];
}

test("migration 217's embedded manifest constant is byte-identical to migration 212's frozen manifest -- not re-derived, not re-typed", () => {
  const m212 = extractJsonConstant(migration212, "v_question_manifest", "[");
  const m217 = extractJsonConstant(migration217, "v_expected_question_manifest", "[");
  assert.equal(m217, m212);
  const parsed = JSON.parse(m217);
  assert.equal(parsed.length, 28);
  assert.equal(new Set(parsed.map((p: { question_id: string }) => p.question_id)).size, 28);
});

test("migration 217's embedded composition_provenance constant is byte-identical to migration 212's, including displayName", () => {
  const m212 = extractJsonConstant(migration212, "v_composition_provenance", "{");
  const m217 = extractJsonConstant(migration217, "v_expected_composition_provenance", "{");
  assert.equal(m217, m212);
  assert.match(m217, /"displayName":"Reading Comprehension Mock 1"/);
  assert.match(m217, /"totalMarks":65/);
});

test("migration 217's only SET clause anywhere is active = true -- no other column is ever assigned", () => {
  const executable = stripComments(migration217);
  const setClauses = executable.match(/\bset\s+[a-z_]+\s*=/gi) ?? [];
  assert.equal(setClauses.length, 1, `expected exactly one SET clause, found: ${JSON.stringify(setClauses)}`);
  assert.match(setClauses[0], /set\s+active\s*=/i);
});

test("migration 217 never sets question_manifest, composition_provenance, subject, attempt_type, or specification_version", () => {
  const executable = stripComments(migration217);
  assert.doesNotMatch(executable, /set\s+question_manifest\s*=/i);
  assert.doesNotMatch(executable, /set\s+composition_provenance\s*=/i);
  assert.doesNotMatch(executable, /set\s+subject\s*=/i);
  assert.doesNotMatch(executable, /set\s+attempt_type\s*=/i);
  assert.doesNotMatch(executable, /set\s+specification_version\s*=/i);
});

test("migration 217 refuses (RAISE EXCEPTION) on manifest drift, provenance drift, wrong subject, wrong attempt_type, and wrong specification_version -- fail-closed before any mutation", () => {
  assert.match(migration217, /if v_row\.question_manifest is distinct from v_expected_question_manifest then\s*\n\s*raise exception/);
  assert.match(migration217, /if v_row\.composition_provenance is distinct from v_expected_composition_provenance then\s*\n\s*raise exception/);
  assert.match(migration217, /if v_row\.subject is distinct from 'english' then\s*\n\s*raise exception/);
  assert.match(migration217, /if v_row\.attempt_type is distinct from 'timed_section' then\s*\n\s*raise exception/);
  assert.match(migration217, /if v_row\.specification_version is distinct from 1 then\s*\n\s*raise exception/);
});

test("migration 217 live-re-verifies eligibility at activation time (mirrors migration 150's identical discipline for Mathematics Mock 1), not just a frozen-constant comparison", () => {
  assert.match(migration217, /eligibility_status = 'mock_eligible' and active = true and subject = 'english'/);
  assert.match(migration217, /v_live_eligible_count <> 28/);
});

test("migration 217 independently re-computes the marks total from live question rows rather than trusting composition_provenance alone", () => {
  assert.match(migration217, /sum\(\(q\.prompt ->> 'marks'\)::int\)/);
  assert.match(migration217, /v_live_marks_total <> 65/);
});

test("migration 217 targets only reading-comprehension-mock-1 -- never Mathematics, never any reserve passage, never Writing", () => {
  const executable = stripComments(migration217);
  assert.doesNotMatch(executable, /first-mock-mathematics-v1|mathematics-mock-1|'mock-mr\d/);

  // Reserve/Writing ids DO legitimately appear once each, inside the
  // copied-verbatim composition_provenance.reservedNotIncluded array --
  // that's the correct, intentional disclosure that they're excluded.
  // What must never happen is any of them appearing as a manifest entry
  // (i.e. as a "question_id" value) or as an activation/update target.
  const manifest = extractJsonConstant(migration217, "v_expected_question_manifest", "[");
  const manifestIds: string[] = JSON.parse(manifest).map((m: { question_id: string }) => m.question_id);
  assert.equal(manifestIds.filter((id) => id.startsWith("eng-inc002-roboticsfinal")).length, 0);
  assert.equal(manifestIds.filter((id) => id.startsWith("eng-inc002-sailandsteam")).length, 0);
  assert.equal(manifestIds.filter((id) => id.includes("writing")).length, 0);

  const provenance = extractJsonConstant(migration217, "v_expected_composition_provenance", "{");
  const reservedNotIncluded: string[] = JSON.parse(provenance).reservedNotIncluded;
  assert.deepEqual(reservedNotIncluded, ["eng-inc002-roboticsfinal", "eng-inc002-sailandsteam", "mock-writing-screentime-01"]);
});

test("migration 217 is idempotent: already-active with matching preconditions is a no-op, not a re-activation error", () => {
  assert.match(migration217, /elsif v_row\.active = true then/);
  assert.match(migration217, /already active=true and every structural precondition still holds/);
});

test("migration 217 is explicitly marked NOT APPLIED", () => {
  assert.match(migration217, /NOT APPLIED/);
});
