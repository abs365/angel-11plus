import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Programme Completion Increment 016 — Authoritative Reading Comprehension
 * Scoring. Structural tests against migration 219's real, live SQL source
 * text — the same convention every migration test in this repository
 * already uses (no live database in CI; every guarantee here is proven by
 * reading the actual, real function bodies, not by mocking Postgres
 * behaviour). NOT APPLIED / NOT PRODUCTION VERIFIED — same disclosed
 * limitation as every migration-content test in this codebase.
 */

const migration = readFileSync("supabase/migrations/219_mock_reading_scoring_authority.sql", "utf8");

test("migration 219 is wrapped in a single begin/commit transaction", () => {
  assert.match(migration, /^begin;/m);
  assert.match(migration, /^commit;/m);
});

test("migration 219 discloses NOT APPLIED and contains no EXECUTABLE role/password statement -- only illustrative, placeholder-only guidance inside comments", () => {
  assert.match(migration, /NOT APPLIED/);
  const executableLines = migration
    .split("\n")
    .filter((line) => !line.trim().startsWith("--") && line.trim().length > 0);
  const executableSql = executableLines.join("\n");
  assert.doesNotMatch(executableSql, /create role/i, "no CREATE ROLE statement of any kind may exist outside a comment");
  assert.doesNotMatch(executableSql, /alter role/i, "no ALTER ROLE statement of any kind may exist outside a comment");
  assert.doesNotMatch(executableSql, /password/i, "the word 'password' must never appear outside a comment");
  // The one illustrative mention (inside a comment) must be a placeholder,
  // not something that looks like a real generated secret.
  assert.match(migration, /<a password\n--\s*you generate yourself, never shared with or typed to Claude>/);
});

// --- Grants: the whole security model in one place -------------------------

test("both new functions revoke execute from public, anon, and authenticated -- structurally unreachable from any browser/supabase-js session regardless of JWT", () => {
  for (const fn of ["mock_claim_reading_scoring_work(uuid)", "mock_persist_reading_scoring(uuid, jsonb)"]) {
    assert.match(migration, new RegExp(`revoke all on function public\\.${fn.replace(/[()]/g, "\\$&")} from public;`));
    assert.match(migration, new RegExp(`revoke execute on function public\\.${fn.replace(/[()]/g, "\\$&")} from anon;`));
    assert.match(migration, new RegExp(`revoke execute on function public\\.${fn.replace(/[()]/g, "\\$&")} from authenticated;`));
  }
});

test("both new functions are granted execute ONLY to mock_scoring_writer, never to any other role", () => {
  assert.match(migration, /grant execute on function public\.mock_claim_reading_scoring_work\(uuid\) to mock_scoring_writer;/);
  assert.match(migration, /grant execute on function public\.mock_persist_reading_scoring\(uuid, jsonb\) to mock_scoring_writer;/);
  const grantLines = migration.match(/^\s*grant execute.*$/gm) ?? [];
  for (const line of grantLines) {
    assert.match(line, /to mock_scoring_writer;/, `every grant execute line must target only mock_scoring_writer, found: ${line}`);
  }
});

test("neither function has a fixed safe search_path missing, and both are SECURITY DEFINER", () => {
  const bodies = migration.split(/create or replace function/).slice(1);
  assert.equal(bodies.length, 2, "expected exactly two function definitions");
  for (const body of bodies) {
    assert.match(body, /security definer/);
    assert.match(body, /set search_path = public/);
  }
});

// --- mock_claim_reading_scoring_work -----------------------------------

test("the claim function never mutates anything -- no insert/update/delete statement anywhere in its own body", () => {
  const claimBody = migration.split("create or replace function public.mock_claim_reading_scoring_work")[1].split("create or replace function public.mock_persist_reading_scoring")[0];
  assert.doesNotMatch(claimBody, /\binsert into\b/i);
  assert.doesNotMatch(claimBody, /\bupdate\b\s+public\./i);
  assert.doesNotMatch(claimBody, /\bdelete from\b/i);
});

test("the claim function rejects non-submitted, non-Reading, or already-scored attempts with a safe {eligible:false} result, never an exception", () => {
  const claimBody = migration.split("create or replace function public.mock_claim_reading_scoring_work")[1].split("create or replace function public.mock_persist_reading_scoring")[0];
  assert.match(claimBody, /v_attempt\.status <> 'submitted'/);
  assert.match(claimBody, /v_attempt\.attempt_type <> 'timed_section' or v_attempt\.form_id <> 'reading-comprehension-mock-1'/);
  assert.match(claimBody, /v_report\.scoring_state = 'scored'/);
  assert.doesNotMatch(claimBody, /raise exception/, "the claim function must fail safely (a negative result), never raise -- it is a discovery function, not a mutation");
});

// --- mock_persist_reading_scoring: every hardened invariant --------------

function persistBody(): string {
  return migration.split("create or replace function public.mock_persist_reading_scoring")[1].split("revoke all on function public.mock_persist_reading_scoring")[0];
}

test("unsubmitted attempt is rejected", () => {
  assert.match(persistBody(), /if v_attempt\.status <> 'submitted' then\s*\n\s*raise exception/);
});

test("wrong form / Mathematics attempts are rejected -- attempt_type and form_id both checked", () => {
  assert.match(persistBody(), /v_attempt\.attempt_type <> 'timed_section' or v_attempt\.form_id <> 'reading-comprehension-mock-1'/);
});

test("an unknown/out-of-manifest question id is rejected", () => {
  assert.match(persistBody(), /not \(v_question_id = any\(v_attempt\.assigned_question_ids\)\)/);
});

test("the exact outcome count is required -- missing or extra question outcomes are rejected", () => {
  assert.match(persistBody(), /jsonb_array_length\(p_outcomes\) <> coalesce\(array_length\(v_attempt\.assigned_question_ids, 1\), 0\)/);
});

test("a duplicate outcome for the same question is rejected", () => {
  assert.match(persistBody(), /v_question_id = any\(v_seen_ids\)/);
  assert.match(persistBody(), /raise exception 'Duplicate outcome supplied for question/);
});

test("marksAwarded is independently bounded to the canonical [0, marks] ceiling -- never trusted from the caller", () => {
  assert.match(persistBody(), /v_marks_awarded > v_canonical_marks or v_marks_awarded < 0/);
  assert.match(persistBody(), /v_canonical_marks := coalesce\(\(v_bank_row\.prompt->>'marks'\)::numeric, 1\)/, "canonical marks are read from the real question bank, never from the caller");
});

test("a question with no genuine stored response is forced to 'unanswered', regardless of what the caller claims", () => {
  const body = persistBody();
  assert.match(body, /v_has_response := v_response is not null and coalesce\(trim\(v_response->>'value'\), ''\) <> ''/);
  assert.match(body, /elsif not v_has_response then[\s\S]*?v_status := 'unanswered';[\s\S]*?v_marks_awarded := 0;/);
});

test("TIER3/TIER5 are hard-enforced to requires_manual_marking regardless of caller input -- the one invariant that closes 'remove requires_manual_marking' without reimplementing the English engine", () => {
  const body = persistBody();
  assert.match(body, /\(v_bank_row\.prompt->>'validationTier'\) in \('TIER3_QUOTATION_PLUS_EXPLANATION', 'TIER5_NAMED_COMPONENT_PLUS_EXPLANATION'\)/);
  assert.match(body, /v_status := 'requires_manual_marking';\s*\n\s*v_marks_awarded := null;/);
});

test("status is DERIVED from the bounded marks value, never accepted as a separate caller-supplied claim -- p_outcomes carries no status field at all", () => {
  const body = persistBody();
  assert.doesNotMatch(body, /v_outcome->>'status'/, "the function must never read a status field from the caller");
  assert.match(body, /if v_marks_awarded = v_canonical_marks then\s*\n\s*v_status := 'correct';/);
  assert.match(body, /elsif v_marks_awarded = 0 then\s*\n\s*v_status := 'incorrect';/);
  assert.match(body, /else\s*\n\s*v_status := 'partially_correct';/);
});

test("repeated scoring at the current marking_version is idempotent -- a genuine no-op, mirroring mock_score_attempt()'s own established convention", () => {
  assert.match(persistBody(), /scoring_state = 'scored' and marking_version = v_current_marking_version/);
  assert.match(persistBody(), /return jsonb_build_object\('status', 'already_scored'\);/);
});

test("the function never assigns report_release_state -- report release stays exclusively behind mock_release_report()'s own separate admin gate", () => {
  assert.doesNotMatch(persistBody(), /report_release_state\s*[=:]/, "no assignment to report_release_state anywhere in this function's own executable body");
});

test("the function never assigns analysis_state -- analysis stays exclusively behind the existing, unmodified trigger", () => {
  assert.doesNotMatch(persistBody(), /analysis_state\s*[=:]/, "no assignment to analysis_state anywhere in this function's own executable body");
});

test("the function performs no direct table grant statement anywhere in this migration -- EXECUTE on these two functions is the role's only privilege", () => {
  assert.doesNotMatch(migration, /grant\s+(select|insert|update|delete|all)\s+on\s+table/i);
  assert.doesNotMatch(migration, /grant\s+(select|insert|update|delete|all)\s+on\s+public\./i);
});

test("the role-existence guard fails safely (a RAISE NOTICE, not a silent no-op and not an exception) if mock_scoring_writer does not yet exist when this migration is applied", () => {
  assert.match(migration, /if exists \(select 1 from pg_roles where rolname = 'mock_scoring_writer'\) then/);
  assert.match(migration, /raise notice 'mock_scoring_writer role does not exist yet/);
});
