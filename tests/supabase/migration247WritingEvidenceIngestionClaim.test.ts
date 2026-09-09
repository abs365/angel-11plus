import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * Migration 247 — structural verification of the raw SQL, matching this
 * repository's own established discipline for a NOT-APPLIED migration.
 */

const MIGRATION_PATH = path.join(__dirname, "../../supabase/migrations/247_writing_evidence_ingestion_claim.sql");
const SQL = fs.readFileSync(MIGRATION_PATH, "utf8");

test("migration discloses NOT APPLIED, matching this repository's own convention for a Founder-applied migration", () => {
  assert.match(SQL, /NOT APPLIED\. Generated for Founder review and manual application/);
});

test("adds one additive, nullable column to ali_writing_assessment, independent of migration 244's own attempt-level claim column", () => {
  assert.match(SQL, /alter table public\.ali_writing_assessment\s*\n\s*add column if not exists ei_evidence_ingested_at timestamptz;/);
  assert.match(SQL, /deliberately independent of migration 244''s own attempt-level ei_evidence_ingested_at/);
});

test("mock_claim_writing_evidence_ingestion is owner-or-admin gated, matching mock_persist_writing_assessment's established pattern", () => {
  const fnMatch = SQL.match(/create or replace function public\.mock_claim_writing_evidence_ingestion[\s\S]*?\$\$;/);
  assert.ok(fnMatch, "mock_claim_writing_evidence_ingestion function body not found");
  const body = fnMatch![0];
  assert.match(body, /a\.profile_id = v_profile_id or public\.is_current_user_admin\(\)/);
});

test("claim is atomic and idempotent -- UPDATE guarded by ei_evidence_ingested_at is null, reports whether it actually claimed", () => {
  const fnMatch = SQL.match(/create or replace function public\.mock_claim_writing_evidence_ingestion[\s\S]*?\$\$;/);
  const body = fnMatch![0];
  assert.match(body, /and ei_evidence_ingested_at is null/);
  assert.match(body, /get diagnostics v_row_count = row_count/);
  assert.match(body, /return v_row_count > 0/);
});

test("claim function is scoped at (attempt_id, question_id) granularity, not attempt-only", () => {
  const fnMatch = SQL.match(/create or replace function public\.mock_claim_writing_evidence_ingestion[\s\S]*?\$\$;/);
  const body = fnMatch![0];
  assert.match(body, /where attempt_id = p_attempt_id\s*\n\s*and question_id = p_question_id\s*\n\s*and ei_evidence_ingested_at is null/);
});

test("grants execute to authenticated only, never anon", () => {
  assert.match(SQL, /grant execute on function public\.mock_claim_writing_evidence_ingestion\(uuid, text\) to authenticated;/);
  assert.match(SQL, /revoke execute on function public\.mock_claim_writing_evidence_ingestion\(uuid, text\) from anon;/);
});

test("makes no change to mock_score_attempt, mock_analyse_attempt, mock_release_report, or mock_apply_manual_mark", () => {
  for (const fn of ["mock_score_attempt", "mock_analyse_attempt", "mock_release_report", "mock_apply_manual_mark"]) {
    assert.doesNotMatch(SQL, new RegExp(`function public\\.${fn}`));
  }
});

test("has exactly one transaction block", () => {
  const beginCount = (SQL.match(/^begin;$/gm) ?? []).length;
  const commitCount = (SQL.match(/^commit;$/gm) ?? []).length;
  assert.equal(beginCount, 1);
  assert.equal(commitCount, 1);
});
