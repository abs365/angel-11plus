import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Educational Foundation Completion increment -- structural proof for
 * migration 232 (ali_question_family live sync), reconciled to the
 * hardened, Founder-applied production definition (Migration 232
 * Production Reconciliation increment). No live Postgres connection in
 * this test suite's own convention -- source-text assertions against
 * the migration's own SQL, matching every other migration test in this
 * repository. This migration is ALREADY APPLIED -- these tests prove
 * what the repository FILE says, as the accurate historical record and
 * regression guard, not a pending-application check.
 */

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*--.*$/gm, "");
}

const MIGRATION_PATH = join("supabase", "migrations", "232_ali_question_family_live_sync.sql");
const RAW = readFileSync(MIGRATION_PATH, "utf8");
const EXECUTABLE = stripComments(RAW);

test("migration 232 exists and is wrapped in a single begin/commit transaction", () => {
  assert.match(EXECUTABLE, /\bbegin;/);
  assert.match(EXECUTABLE, /\bcommit;/);
  assert.equal((EXECUTABLE.match(/\bbegin;/g) ?? []).length, 1);
  assert.equal((EXECUTABLE.match(/\bcommit;/g) ?? []).length, 1);
});

test("touches only ali_question_family and its own new trigger/functions -- no write to ali_question_bank or any other table", () => {
  assert.doesNotMatch(EXECUTABLE, /update\s+public\.ali_question_bank/i);
  assert.doesNotMatch(EXECUTABLE, /insert\s+into\s+public\.ali_question_bank/i);
  assert.doesNotMatch(EXECUTABLE, /delete\s+from\s+public\.ali_question_bank/i);
  assert.match(EXECUTABLE, /insert into public\.ali_question_family/i);
  assert.match(EXECUTABLE, /update public\.ali_question_family/i);
});

test("does not create, drop, or alter any RLS policy -- ali_question_family's existing admin-only SELECT policy is untouched (REVOKE is not a GRANT)", () => {
  assert.doesNotMatch(EXECUTABLE, /create policy/i);
  assert.doesNotMatch(EXECUTABLE, /drop policy/i);
  assert.doesNotMatch(EXECUTABLE, /\bgrant\b/i);
  assert.doesNotMatch(EXECUTABLE, /row level security/i);
});

test("both functions are SECURITY DEFINER with a safe, explicit search_path", () => {
  const functionBlocks = EXECUTABLE.match(/create or replace function[\s\S]*?\$\$;/g) ?? [];
  assert.equal(functionBlocks.length, 2, "expected exactly ali_sync_question_family and the trigger function");
  for (const block of functionBlocks) {
    assert.match(block, /security definer/i);
    assert.match(block, /set search_path = public/i);
  }
});

test("both functions are explicitly revoked from public, anon, and authenticated (hardening A)", () => {
  const revokeStatements = EXECUTABLE.match(/revoke all on function [^;]+;/gi) ?? [];
  assert.equal(revokeStatements.length, 2, "expected one REVOKE per new function");
  for (const stmt of revokeStatements) {
    assert.match(stmt, /from public, anon, authenticated/i);
  }
  assert.ok(revokeStatements.some((s) => /ali_sync_question_family/i.test(s)));
  assert.ok(revokeStatements.some((s) => /ali_question_bank_family_sync_trigger/i.test(s)));
});

test("a zero-member family is NORMALISED (row_count=0, production_eligible=false, derived fields cleared), never deleted (hardening B)", () => {
  assert.doesNotMatch(EXECUTABLE, /delete\s+from\s+public\.ali_question_family/i);
  const updateBlock = EXECUTABLE.match(/update public\.ali_question_family\s+set([\s\S]*?)where family_id = p_family_id;/)?.[1] ?? "";
  assert.match(updateBlock, /row_count\s*=\s*0/);
  assert.match(updateBlock, /production_eligible\s*=\s*false/);
  assert.match(updateBlock, /skills\s*=\s*'\{\}'/);
  assert.match(updateBlock, /question_types\s*=\s*'\{\}'/);
  assert.match(updateBlock, /pathways\s*=\s*'\[\]'::jsonb/);
  assert.match(updateBlock, /difficulty_range\s*=\s*'\{\}'/);
});

test("the one-time corrective pass ALSO walks every existing zero-member ali_question_family record via a LEFT JOIN (hardening C)", () => {
  const leftJoins = EXECUTABLE.match(/left join public\.ali_question_bank b on b\.family_id = f\.family_id/gi) ?? [];
  assert.ok(leftJoins.length >= 1, "expected at least one LEFT JOIN identifying zero-member family records for the corrective pass/verification");
});

test("fail-closed verification uses LEFT JOIN/COALESCE so a genuinely zero-member family is checked too, and separately verifies no zero-member family remains production_eligible (hardening D)", () => {
  assert.match(EXECUTABLE, /left join \(\s*select family_id, count\(\*\) as live_row_count/i);
  assert.match(EXECUTABLE, /coalesce\(live\.live_row_count, 0\)/i);
  assert.match(EXECUTABLE, /raise exception 'Migration 232: % zero-member family record\(s\) still show production_eligible=true/);
});

test("ali_sync_question_family fails closed on a cross-subject family_id rather than arbitrarily choosing one (hardening E)", () => {
  assert.match(EXECUTABLE, /count\(distinct subject\) into v_distinct_subject_count/i);
  assert.match(EXECUTABLE, /if v_distinct_subject_count > 1 then/i);
  assert.match(EXECUTABLE, /raise exception 'ali_sync_question_family: family_id % spans % distinct subjects/);
});

test("migration 231 is recorded as already Founder-applied and production-verified, not pending (hardening F)", () => {
  const normalised = RAW.replace(/\r?\n--\s*/g, " ").replace(/\s+/g, " ");
  assert.match(normalised, /Migration 231 \(pathway backfill repair\) has ALREADY been Founder- applied and production-verified/);
});

test("exactly one trigger is created, firing after insert or update or delete on ali_question_bank", () => {
  assert.match(EXECUTABLE, /create trigger ali_question_bank_family_sync/i);
  assert.match(EXECUTABLE, /after insert or update or delete on public\.ali_question_bank/i);
  assert.match(EXECUTABLE, /drop trigger if exists ali_question_bank_family_sync/i);
});

test("discloses ALREADY APPLIED TO PRODUCTION, not NOT APPLIED, and explicitly states no migration 233 exists or is needed", () => {
  assert.match(RAW, /ALREADY APPLIED TO PRODUCTION/);
  assert.doesNotMatch(RAW, /\bNOT APPLIED\b/);
  assert.match(RAW, /no migration 233 exists/);
});

test("carries an honest CORRECTION HISTORY section recording the disproven Writing two-rows-one-family hypothesis and its real, simpler cause (one unfamilied row)", () => {
  assert.match(RAW, /CORRECTION HISTORY/);
  assert.match(RAW, /disproven/i);
  assert.match(RAW, /ONE UNFAMILIED WRITING ROW/);
  assert.match(RAW, /writing_rows_without_family=1/);
});

test("root-cause explanation still names the real, proven, separately-valid mechanism (on conflict do nothing)", () => {
  assert.match(RAW, /on conflict \(family_id\) do nothing/);
});
