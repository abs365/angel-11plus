import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Programme Increment 008F — structural tests against migration 075's
 * own SQL text. Migration 074 was already applied to production before
 * these corrections were identified (Decision 99); 075 is the forward-
 * only corrective delta, tested independently of 074's own (still
 * accurate, unchanged) test file.
 */

const sql = fs.readFileSync("supabase/migrations/075_mock_scoring_trust_boundary_correction.sql", "utf8");
const executable = sql.split("\n").filter((l) => !l.trimStart().startsWith("--")).join("\n");

const EXISTING_RPCS = [
  "mock_create_attempt",
  "mock_start_attempt",
  "mock_get_question",
  "mock_submit_answer",
  "mock_submit_attempt",
  "mock_get_active_form",
  "mock_get_attempt_manifest",
  "mock_set_flag",
];

test("does not redefine any of the 8 proven Mock RPCs, and does not mention them at all", () => {
  for (const fn of EXISTING_RPCS) {
    assert.ok(!new RegExp(`create or replace function public\\.${fn}\\(`).test(executable), `must never redefine ${fn}`);
    assert.ok(!executable.includes(fn), `must not mention ${fn} at all`);
  }
});

test("redefines exactly two functions -- mock_score_attempt and mock_attempt_report_init -- and does not touch mock_release_report at all", () => {
  const redefinitions = [...executable.matchAll(/create or replace function public\.(\w+)\(/g)].map((m) => m[1]);
  assert.deepEqual(new Set(redefinitions), new Set(["mock_score_attempt", "mock_attempt_report_init"]));
  assert.ok(!executable.includes("mock_release_report"), "mock_release_report needs no correction and must not be touched");
});

test("does not create or drop any table, policy, or trigger -- mock_attempt_report_init_trigger (migration 072) is reused via CREATE OR REPLACE FUNCTION, no trigger DDL", () => {
  assert.ok(!/create table|drop table|create policy|drop policy|create trigger|drop trigger/i.test(executable));
});

test("does not add or alter any table column -- marking_version/released_at already exist from migration 074", () => {
  assert.ok(!/alter table/i.test(executable));
});

test("does not touch ali_student_question_history, ali_durable_mastery, or ali_educational_audit", () => {
  for (const table of ["ali_student_question_history", "ali_durable_mastery", "ali_educational_audit"]) {
    assert.ok(!executable.includes(table));
  }
});

test("does not touch ali_question_bank.eligibility_status or create real Mock content", () => {
  assert.ok(!/set\s+eligibility_status/i.test(executable));
  assert.ok(!/insert into public\.ali_mock_form|insert into public\.ali_question_bank/i.test(executable));
});

test("no top-level data mutation outside a function body -- every INSERT/UPDATE/DELETE in this file exists only inside a CREATE OR REPLACE FUNCTION definition", () => {
  const withoutFunctionBodies = executable.replace(/create or replace function[\s\S]*?\n\$\$;/g, "");
  assert.ok(!/insert into|update public\.|delete from/i.test(withoutFunctionBodies), "no DML statement may exist outside a function body -- this migration mutates no existing row directly");
});

test("CORRECTION 1: mock_attempt_report_init automatically invokes mock_score_attempt inside its own exception-safe block", () => {
  const body = executable.match(/create or replace function public\.mock_attempt_report_init\(\)[\s\S]*?\n\$\$;/)![0];
  assert.match(body, /security definer/);
  assert.match(body, /new\.status = 'submitted' and \(old\.status is distinct from 'submitted'\)/);
  assert.match(body, /perform public\.mock_score_attempt\(new\.id\);/);
  const nestedBlock = body.match(/begin\s*\n\s*perform public\.mock_score_attempt\(new\.id\);\s*\n\s*exception when others then[\s\S]*?end;/);
  assert.ok(nestedBlock, "expected a nested begin/exception/end block around the scoring call");
  assert.match(nestedBlock![0], /scoring_state = 'failed'/);
});

test("CORRECTION 1: mock_score_attempt's EXECUTE is revoked from authenticated -- the actual privilege correction -- and never (re-)granted to any role", () => {
  assert.match(executable, /revoke execute on function public\.mock_score_attempt\(uuid\) from authenticated;/);
  assert.ok(!/grant execute on function public\.mock_score_attempt/.test(executable), "must never (re-)grant mock_score_attempt to any role in this migration");
});

test("no execute grant to anon anywhere in this migration (none needed -- 074 already revoked it)", () => {
  assert.ok(!/to anon;/.test(executable));
});

test("CORRECTION 2: scoring_state is 'scored' only when nothing requires manual marking, otherwise the existing 'scoring' state -- no new enum value, no constraint change", () => {
  const body = executable.match(/create or replace function public\.mock_score_attempt\([\s\S]*?\n\$\$;/)![0];
  assert.match(body, /set scoring_state = case when v_manual_count > 0 then 'scoring' else 'scored' end,/);
});

test("CORRECTION 3: a response row with a null, missing, or whitespace-only value is treated as unanswered, never incorrect or manual", () => {
  const body = executable.match(/create or replace function public\.mock_score_attempt\([\s\S]*?\n\$\$;/)![0];
  assert.match(body, /if v_response is null or v_response_value is null or trim\(v_response_value\) = '' then/);
  const branch = body.match(/if v_response is null or v_response_value is null or trim\(v_response_value\) = '' then[\s\S]*?end if;/)![0];
  assert.match(branch, /v_status := 'unanswered';/);
});

test("mock_score_attempt in 075 is otherwise unchanged from 074's own design -- same signature, same ownership/submitted-only guards, same idempotency check, same 0.0001 tolerance, same conservative auto-marking scope, same questionTypeId inclusion", () => {
  const body = executable.match(/create or replace function public\.mock_score_attempt\([\s\S]*?\n\$\$;/)![0];
  const signature = executable.match(/create or replace function public\.mock_score_attempt\(([^)]*)\)/)![1];
  assert.equal(signature.trim(), "p_attempt_id uuid");
  assert.match(body, /security definer/);
  assert.match(body, /profile_id = v_profile_id/);
  assert.match(body, /status <> 'submitted'/);
  assert.match(body, /scoring_state = 'scored'\s*\n\s*and marking_version = v_current_marking_version/);
  assert.match(body, /abs\(v_numeric_response - v_numeric_answer\) < 0\.0001/);
  assert.match(body, /v_bank_row\.subject = 'writing' or v_stored_answer is null or v_stored_answer like '%;%'/);
  assert.match(body, /'questionTypeId', v_bank_row\.skill/);
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});
