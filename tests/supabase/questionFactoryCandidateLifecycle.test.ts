import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Question Factory Wave 2, Sections 3-5 — Candidate Persistence, Human
 * Review, and Publication Gate. Structural/logic assertions against
 * migration 230's own SQL text, matching this repository's own
 * established convention for a NOT APPLIED migration.
 */

const MIGRATION = readFileSync("supabase/migrations/230_question_factory_candidate_lifecycle.sql", "utf8");

const EXECUTABLE = MIGRATION.split("\n")
  .filter((l) => !l.trimStart().startsWith("--"))
  .join("\n");

function extractFunctionBody(source: string, name: string): string {
  const match = source.match(new RegExp(`create or replace function public\\.${name}\\([\\s\\S]*?\\n\\$\\$;`));
  if (!match) throw new Error(`function ${name} not found`);
  return match[0];
}

test("wrapped in a single begin/commit transaction", () => {
  assert.match(EXECUTABLE, /^\s*begin;/m);
  assert.match(EXECUTABLE, /commit;\s*$/m);
});

test("not-applied disclosure present in the raw file header", () => {
  assert.match(MIGRATION, /NOT APPLIED\. Generated for Founder review/);
});

test("creates ali_question_candidate as an ADDITIVE table -- no destructive statement against any existing table", () => {
  assert.match(EXECUTABLE, /create table if not exists public\.ali_question_candidate/);
  assert.doesNotMatch(EXECUTABLE, /alter table public\.ali_question_bank/i);
  assert.doesNotMatch(EXECUTABLE, /drop table/i);
});

test("carries every field the Founder's brief required (candidate id, family id, spec/version, subject, competency, skill, pathway, preparation-stage, difficulty, question content, answer, worked explanation, distractors, validation results x2, timestamp, provenance, review status/reviewer/timestamp/reason, publication status, published question id)", () => {
  const createBlock = EXECUTABLE.match(/create table if not exists public\.ali_question_candidate \(([\s\S]*?)\n\);/)?.[1] ?? "";
  for (const column of [
    "candidate_id",
    "family_id",
    "generation_spec_id",
    "generation_spec_version",
    "subject",
    "competency_id",
    "skill",
    "question_type",
    "pathway",
    "preparation_stage",
    "difficulty",
    "question_content",
    "claimed_answer",
    "worked_explanation",
    "distractors",
    "mathematical_validation",
    "similarity_validation",
    "generated_at",
    "provenance",
    "review_status",
    "reviewer_id",
    "review_timestamp",
    "rejection_reason",
    "publication_status",
    "published_question_id",
  ]) {
    assert.ok(createBlock.includes(column), `expected column "${column}" in ali_question_candidate`);
  }
});

test("three table-level CHECK constraints structurally enforce the lifecycle -- not merely RPC discipline", () => {
  assert.match(EXECUTABLE, /ali_question_candidate_publication_consistency/);
  assert.match(EXECUTABLE, /ali_question_candidate_publish_requires_approval/);
  assert.match(EXECUTABLE, /ali_question_candidate_rejection_requires_reason/);
});

test("the publish-requires-approval constraint makes it structurally impossible for a pending or rejected candidate to ever be marked published, even via a direct (admin) update bypassing the RPC", () => {
  const constraint = EXECUTABLE.match(/check \(\s*publication_status = 'unpublished' or review_status = 'approved'\s*\)/);
  assert.ok(constraint, "expected the publish-requires-approval CHECK constraint");
});

test("the rejection-requires-reason constraint makes it structurally impossible to reject or return a candidate without a reason, even via a direct update", () => {
  const constraint = EXECUTABLE.match(/check \(review_status not in \('rejected', 'needs_correction'\) or rejection_reason is not null\)/);
  assert.ok(constraint, "expected the rejection-requires-reason CHECK constraint");
});

test("RLS is enabled with an admin-only SELECT policy -- no anon or authenticated write policy of any kind", () => {
  assert.match(EXECUTABLE, /alter table public\.ali_question_candidate enable row level security;/);
  assert.match(EXECUTABLE, /create policy ali_question_candidate_admin_select[\s\S]*?for select[\s\S]*?using \(public\.is_current_user_admin\(\)\);/);
  assert.doesNotMatch(EXECUTABLE, /for insert|for update|for delete/i);
});

test("submit_question_candidate is admin-gated and is the only INSERT statement targeting ali_question_candidate", () => {
  const fn = extractFunctionBody(EXECUTABLE, "submit_question_candidate");
  assert.match(fn, /if not public\.is_current_user_admin\(\) then\s*\n\s*raise exception 'Only an admin may submit/);
  const insertCount = (EXECUTABLE.match(/insert into public\.ali_question_candidate/g) ?? []).length;
  assert.equal(insertCount, 1, "exactly one INSERT path into ali_question_candidate should exist");
});

test("review_question_candidate is admin-gated, restricts the decision to exactly three values, and fails closed when a reason is missing for rejection/correction", () => {
  const fn = extractFunctionBody(EXECUTABLE, "review_question_candidate");
  assert.match(fn, /if not public\.is_current_user_admin\(\) then/);
  assert.match(fn, /if p_decision not in \('approved', 'rejected', 'needs_correction'\) then/);
  assert.match(fn, /if p_decision in \('rejected', 'needs_correction'\) and \(p_rejection_reason is null or trim\(p_rejection_reason\) = ''\) then/);
  assert.match(fn, /raise exception 'A reason is required when rejecting or requesting correction/);
});

test("review_question_candidate derives the reviewer from auth.uid() -- never trusts a caller-supplied reviewer id -- and this is the only place reviewer_id is ever set", () => {
  const fn = extractFunctionBody(EXECUTABLE, "review_question_candidate");
  assert.match(fn, /select id into v_reviewer_id from public\.profiles where auth_user_id = auth\.uid\(\);/);
  assert.doesNotMatch(EXECUTABLE, /p_reviewer_id|p_reviewer/);
});

test("review_question_candidate operates on exactly one candidate id per call -- no bulk-approve path exists anywhere in this migration", () => {
  const fn = extractFunctionBody(EXECUTABLE, "review_question_candidate");
  assert.equal((fn.match(/update public\.ali_question_candidate/g) ?? []).length, 1, "exactly one UPDATE statement");
  assert.match(fn, /where candidate_id = p_candidate_id;/, "the update must be scoped to exactly one candidate id, never an unscoped or 1=1-style bulk update");
  assert.doesNotMatch(fn, /where\s+1\s*=\s*1/);
});

test("publish_question_candidate is admin-gated, requires review_status = 'approved', and refuses to re-publish an already-published candidate", () => {
  const fn = extractFunctionBody(EXECUTABLE, "publish_question_candidate");
  assert.match(fn, /if not public\.is_current_user_admin\(\) then/);
  assert.match(fn, /if v_candidate\.review_status <> 'approved' then/);
  assert.match(fn, /if v_candidate\.publication_status = 'published' then/);
});

test("publish_question_candidate is the ONLY insert path into ali_question_bank across this migration, and it always writes eligibility_status = 'practice_eligible', active = true, never mock_eligible or a review-track status", () => {
  const insertCount = (EXECUTABLE.match(/insert into public\.ali_question_bank/g) ?? []).length;
  assert.equal(insertCount, 1, "exactly one INSERT path into ali_question_bank should exist in this migration");
  const fn = extractFunctionBody(EXECUTABLE, "publish_question_candidate");
  assert.match(fn, /'practice_eligible', true/);
  assert.doesNotMatch(fn, /mock_eligible/);
});

test("publish_question_candidate derives mastery_threshold from the real, existing ali_mastery_defaults table -- never a fabricated constant", () => {
  const fn = extractFunctionBody(EXECUTABLE, "publish_question_candidate");
  assert.match(fn, /select default_threshold from public\.ali_mastery_defaults where content_difficulty = v_candidate\.difficulty/);
});

test("all three RPCs are granted to authenticated only -- no anon grant anywhere in this migration", () => {
  const grants = [...EXECUTABLE.matchAll(/grant execute on function public\.(\w+)\([^)]*\) to (\w+);/g)];
  assert.ok(grants.length >= 3, "expected at least 3 grant execute statements");
  for (const [, , role] of grants) {
    assert.equal(role, "authenticated");
  }
});

test("no grant or privilege escalation beyond the three named functions -- no GRANT UPDATE/INSERT on ali_question_bank itself", () => {
  assert.doesNotMatch(EXECUTABLE, /grant (update|insert|delete) on public\.ali_question_bank/i);
});

test("does not touch, redefine, or reference any Mock scoring/release/manual-marking function from prior increments", () => {
  assert.doesNotMatch(EXECUTABLE, /mock_release_report|mock_apply_manual_mark|mock_analyse_attempt|mock_score_attempt|mock_persist_reading_scoring/);
});
