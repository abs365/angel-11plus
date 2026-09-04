import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Programme Completion Increment 016 — Defect B correction. Structural
 * tests against migration 220's own SQL text, matching this repository's
 * own established convention (no live database in CI; every guarantee
 * here is proven by reading the actual, real function body, not by
 * mocking Postgres behaviour). NOT APPLIED / NOT PRODUCTION VERIFIED --
 * same disclosed limitation as every migration-content test in this
 * codebase.
 */

const sql = fs.readFileSync("supabase/migrations/220_reading_mock_legacy_scorer_exclusion.sql", "utf8");
const executable = sql.split("\n").filter((l) => !l.trimStart().startsWith("--")).join("\n");

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("redefines exactly one function -- mock_attempt_report_init -- and touches nothing else", () => {
  const redefinitions = [...executable.matchAll(/create or replace function public\.(\w+)\(/g)].map((m) => m[1]);
  assert.deepEqual(redefinitions, ["mock_attempt_report_init"]);
});

test("does not create or drop any table, policy, or trigger -- mock_attempt_report_init_trigger (migration 072) is reused via CREATE OR REPLACE FUNCTION, no trigger DDL", () => {
  assert.ok(!/create table|drop table|create policy|drop policy|create trigger|drop trigger/i.test(executable));
});

test("does not add or alter any table column, and grants nothing new", () => {
  assert.ok(!/alter table/i.test(executable));
  assert.ok(!/^\s*grant\b/im.test(executable), "must not grant anything -- this migration only redefines a function body");
});

test("no top-level data mutation outside the function body -- no INSERT/UPDATE/DELETE against any existing row", () => {
  const withoutFunctionBody = executable.replace(/create or replace function[\s\S]*?\n\$\$;/g, "");
  assert.ok(!/insert into|update public\.|delete from/i.test(withoutFunctionBody));
});

test("does not touch mock_score_attempt, mock_claim_reading_scoring_work, mock_persist_reading_scoring, or mock_scoring_writer at all", () => {
  for (const name of [
    "create or replace function public.mock_score_attempt",
    "mock_claim_reading_scoring_work",
    "mock_persist_reading_scoring",
    "mock_scoring_writer",
  ]) {
    assert.ok(!executable.includes(name), `must not mention/touch ${name}`);
  }
});

function functionBody(): string {
  return executable.match(/create or replace function public\.mock_attempt_report_init\(\)[\s\S]*?\n\$\$;/)![0];
}

test("A. Reading exclusion: the exact protected form is excluded from the legacy scoring call", () => {
  const body = functionBody();
  assert.match(body, /if new\.attempt_type = 'timed_section' and new\.form_id = 'reading-comprehension-mock-1' then/);
  const guarded = body.match(/if new\.attempt_type = 'timed_section' and new\.form_id = 'reading-comprehension-mock-1' then([\s\S]*?)else/)![1];
  assert.doesNotMatch(guarded, /perform public\.mock_score_attempt/, "the Reading branch must never call the legacy scorer");
});

test("B. Mathematics preservation: every other attempt still calls mock_score_attempt inside the same exception-safe block, unchanged from migration 075", () => {
  const body = functionBody();
  const elseBranch = body.match(/else\s*\n\s*begin\s*\n\s*perform public\.mock_score_attempt\(new\.id\);\s*\n\s*exception when others then([\s\S]*?)end;\s*\n\s*end if;/);
  assert.ok(elseBranch, "expected the unguarded else branch to retain the exact migration-075 nested begin/exception/end block");
  assert.match(elseBranch![1], /scoring_state = 'failed'/);
});

test("C. The report-row insert on the submitted transition is unchanged -- still fires for every attempt, before the Reading/legacy branch", () => {
  const body = functionBody();
  assert.match(body, /new\.status = 'submitted' and \(old\.status is distinct from 'submitted'\)/);
  const insertIndex = body.indexOf("insert into public.ali_mock_attempt_report");
  const branchIndex = body.indexOf("if new.attempt_type = 'timed_section'");
  assert.ok(insertIndex > -1 && branchIndex > insertIndex, "the report row must still be inserted for every submitted attempt, before the new Reading/legacy branch");
});

test("does not describe Reading as generally or permanently handled for any future form -- only the one named, already-activated form_id appears", () => {
  const body = functionBody();
  const formMentions = [...body.matchAll(/form_id = '([^']+)'/g)].map((m) => m[1]);
  assert.deepEqual(formMentions, ["reading-comprehension-mock-1"]);
});

test("E. no privilege expansion -- migration 220 creates no new table grant, no service_role dependency, no expanded mock_scoring_writer authority", () => {
  assert.ok(!/service_role/i.test(executable));
  assert.ok(!/grant\s+(select|insert|update|delete|all)\s+on\s+table/i.test(executable));
  assert.ok(!/mock_scoring_writer/.test(executable));
});

test("security definer and safe search_path are preserved on the redefined function", () => {
  const body = functionBody();
  assert.match(body, /security definer/);
  assert.match(body, /set search_path = public/);
});

test("discloses NOT APPLIED, matching this repository's own convention for a Founder-applied migration", () => {
  assert.match(sql, /NOT APPLIED/);
});
