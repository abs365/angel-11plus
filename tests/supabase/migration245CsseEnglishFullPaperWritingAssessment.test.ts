import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * Migration 245 — structural verification of the raw SQL, matching this
 * repository's own established discipline for a NOT-APPLIED migration
 * (e.g. tests/supabase/migration237PublishAnswerPersistenceCorrection.test.ts):
 * assert against the actual migration text, not a live database this
 * test suite has no connection to.
 */

const MIGRATION_PATH = path.join(__dirname, "../../supabase/migrations/245_csse_english_full_paper_writing_assessment.sql");
const SQL = fs.readFileSync(MIGRATION_PATH, "utf8");

test("migration discloses NOT APPLIED, matching this repository's own convention for a Founder-applied migration", () => {
  assert.match(SQL, /NOT APPLIED\. Generated for Founder review and manual application/);
});

test("ali_writing_assessment table exists with RLS enabled and no direct write grant to anon/authenticated", () => {
  assert.match(SQL, /create table if not exists public\.ali_writing_assessment/);
  assert.match(SQL, /alter table public\.ali_writing_assessment enable row level security/);
  assert.match(SQL, /revoke all on table public\.ali_writing_assessment from public, anon, authenticated/);
  assert.match(SQL, /grant select on table public\.ali_writing_assessment to authenticated/);
});

test("ali_writing_assessment has a unique (attempt_id, question_id) constraint -- the idempotency key", () => {
  assert.match(SQL, /unique \(attempt_id, question_id\)/);
});

test("ali_writing_assessment preserves the original response_text as NOT NULL and human_review_* columns are separate, nullable, additive-only", () => {
  assert.match(SQL, /response_text\s+text not null/);
  assert.match(SQL, /human_review_dimensions\s+jsonb/);
  assert.match(SQL, /human_reviewed_at\s+timestamptz/);
});

test("mock_persist_writing_assessment is owner-or-admin gated (not admin-only), matching mock_claim_evidence_ingestion's established pattern", () => {
  assert.match(SQL, /create or replace function public\.mock_persist_writing_assessment/);
  assert.match(SQL, /not \(v_attempt\.profile_id = v_profile_id or public\.is_current_user_admin\(\)\)/);
});

test("mock_persist_writing_assessment reads the original response server-side from ali_mock_attempt_answer, never accepting it as a parameter", () => {
  const fnMatch = SQL.match(/create or replace function public\.mock_persist_writing_assessment[\s\S]*?\$\$;/);
  assert.ok(fnMatch, "mock_persist_writing_assessment function body not found");
  const body = fnMatch![0];
  assert.doesNotMatch(body, /p_response_text/, "must not accept response text as a parameter");
  assert.match(body, /select response ->> 'value' into v_response_text\s*\n\s*from public\.ali_mock_attempt_answer/);
});

test("mock_persist_writing_assessment only accepts questions genuinely awaiting assessment (requires_manual_marking) and subject='writing'", () => {
  const fnMatch = SQL.match(/create or replace function public\.mock_persist_writing_assessment[\s\S]*?\$\$;/);
  const body = fnMatch![0];
  assert.match(body, /v_bank_row\.subject <> 'writing'/);
  assert.match(body, /v_outcome_status <> 'requires_manual_marking'/);
});

test("mock_persist_writing_assessment is idempotent via on conflict do nothing, and reports whether it actually inserted", () => {
  const fnMatch = SQL.match(/create or replace function public\.mock_persist_writing_assessment[\s\S]*?\$\$;/);
  const body = fnMatch![0];
  assert.match(body, /on conflict \(attempt_id, question_id\) do nothing/);
  assert.match(body, /get diagnostics v_row_count = row_count/);
  assert.match(body, /return v_row_count > 0/);
});

test("mock_review_writing_assessment is admin-only, matching mock_apply_manual_mark's established gating exactly", () => {
  const fnMatch = SQL.match(/create or replace function public\.mock_review_writing_assessment[\s\S]*?\$\$;/);
  assert.ok(fnMatch, "mock_review_writing_assessment function body not found");
  const body = fnMatch![0];
  assert.match(body, /if not public\.is_current_user_admin\(\) then/);
  assert.match(body, /raise exception 'Only an admin may review a Writing assessment'/);
});

test("mock_review_writing_assessment never touches dimensions/response_text/assessment_status -- additive-only", () => {
  const fnMatch = SQL.match(/create or replace function public\.mock_review_writing_assessment[\s\S]*?\$\$;/);
  const body = fnMatch![0];
  const setClause = body.match(/set[\s\S]*?where attempt_id/)![0];
  assert.doesNotMatch(setClause, /\bdimensions\s*=/);
  assert.doesNotMatch(setClause, /response_text\s*=/);
  assert.doesNotMatch(setClause, /assessment_status\s*=/);
  assert.match(setClause, /human_review_dimensions = p_human_review_dimensions/);
});

test("ali_mock_form gains reading_phase_minutes/default_duration_minutes as additive, nullable columns", () => {
  assert.match(SQL, /add column if not exists reading_phase_minutes integer/);
  assert.match(SQL, /add column if not exists default_duration_minutes integer/);
});

test("mock_start_attempt lets a form's own default_duration_minutes override the caller-supplied duration, server-authoritative", () => {
  const fnMatch = SQL.match(/create or replace function public\.mock_start_attempt[\s\S]*?\$\$;/);
  assert.ok(fnMatch, "mock_start_attempt function body not found");
  const body = fnMatch![0];
  assert.match(body, /v_effective_duration := coalesce\(v_form_duration, p_duration_minutes\)/);
});

test("mock_submit_answer refuses an answer during a form's own reading phase, and is a no-op for every existing form (reading_phase_minutes null)", () => {
  const fnMatch = SQL.match(/create or replace function public\.mock_submit_answer[\s\S]*?\$\$;/);
  assert.ok(fnMatch, "mock_submit_answer function body not found");
  const body = fnMatch![0];
  assert.match(body, /v_reading_phase_minutes is not null/);
  assert.match(body, /still in its reading phase/);
});

test("mock_submit_answer's reading-phase guard runs after the existing expiry check and before the existing manifest-membership check -- inserted, not reordering existing logic", () => {
  const fnMatch = SQL.match(/create or replace function public\.mock_submit_answer[\s\S]*?\$\$;/);
  const body = fnMatch![0];
  const expiryIdx = body.indexOf("Attempt % has expired");
  const readingIdx = body.indexOf("reading phase");
  const manifestIdx = body.indexOf("is not part of attempt %''s assigned manifest");
  assert.ok(expiryIdx > -1 && readingIdx > -1 && manifestIdx > -1);
  assert.ok(expiryIdx < readingIdx, "reading-phase guard must come after the expiry check");
  assert.ok(readingIdx < manifestIdx, "reading-phase guard must come before the manifest-membership check");
});

test("mock_get_active_form is widened with a defaulted p_subject parameter -- existing 1-arg callers unaffected", () => {
  assert.match(SQL, /create function public\.mock_get_active_form\(p_attempt_type text, p_subject text default null\)/);
  assert.match(SQL, /and \(p_subject is null or f\.subject = p_subject\)/);
});

test("exactly one Writing row is promoted to mock_eligible, guarded by its prior independently_validated state (idempotent to re-run)", () => {
  const updateMatch = SQL.match(/update public\.ali_question_bank[\s\S]*?where id = 'mock-writing-mindchange-01'[\s\S]*?;/);
  assert.ok(updateMatch, "the promotion UPDATE was not found");
  assert.match(updateMatch![0], /eligibility_status = 'mock_eligible'/);
  assert.match(updateMatch![0], /marking_mode = 'criterion_rubric'/);
  assert.match(updateMatch![0], /and eligibility_status = 'independently_validated'/);
});

test("the new English full_mock form reuses the Reading Comprehension Mock 1 manifest via subquery, never hand-transcribed, and is inserted inactive", () => {
  const insertMatch = SQL.match(/insert into public\.ali_mock_form[\s\S]*?where not exists[\s\S]*?;/);
  assert.ok(insertMatch, "the new form INSERT was not found");
  const body = insertMatch![0];
  assert.match(body, /select question_manifest from public\.ali_mock_form where id = 'reading-comprehension-mock-1'/);
  assert.match(body, /'full_mock'/);
  assert.match(body, /'english'/);
  assert.match(body, /where not exists \(select 1 from public\.ali_mock_form where id = 'english-full-mock-v1'\)/);
  // active = false is the last positional value in the select list before the WHERE — verify it's present and not `true`.
  assert.match(body, /,\s*false\s*\nwhere not exists/);
});

test("Q2 is deliberately absent from the new form's manifest -- only the single Q1 item is appended", () => {
  const insertMatch = SQL.match(/insert into public\.ali_mock_form[\s\S]*?where not exists[\s\S]*?;/);
  const body = insertMatch![0];
  const appendedItems = body.match(/jsonb_build_array\(([\s\S]*?)\)/);
  assert.ok(appendedItems);
  assert.equal((appendedItems![1].match(/question_id/g) ?? []).length, 1, "exactly one item should be appended to the existing manifest");
  assert.match(body, /mock-writing-mindchange-01/);
});

test("does not touch mock_score_attempt, mock_release_report, mock_analyse_attempt, or mock_apply_manual_mark at all", () => {
  assert.doesNotMatch(SQL, /create or replace function public\.mock_score_attempt/);
  assert.doesNotMatch(SQL, /create or replace function public\.mock_release_report/);
  assert.doesNotMatch(SQL, /create or replace function public\.mock_analyse_attempt/);
  assert.doesNotMatch(SQL, /create or replace function public\.mock_apply_manual_mark/);
});

test("wrapped in transactions, not one giant uncommitted block", () => {
  assert.equal((SQL.match(/^begin;/gm) ?? []).length, 2, "expected 2 begin/commit blocks (schema+functions, then content)");
  assert.equal((SQL.match(/^commit;/gm) ?? []).length, 2);
});
