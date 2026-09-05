import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Question Factory Wave 1, Phase 2 — Cross-Subject Question Family Model.
 * Structural/logic assertions against migration 228's own SQL text,
 * matching this repository's own established convention for a NOT APPLIED
 * migration (no live Postgres in this test runner -- see
 * tests/supabase/mockReadingManualMarkingAndReleaseGovernance.test.ts's own
 * docstring for why this is the real guarantee available here).
 */

const MIGRATION = readFileSync("supabase/migrations/228_cross_subject_question_family_model.sql", "utf8");

const EXECUTABLE = MIGRATION.split("\n")
  .filter((l) => !l.trimStart().startsWith("--"))
  .join("\n");

test("wrapped in a single begin/commit transaction", () => {
  assert.match(EXECUTABLE, /^\s*begin;/m);
  assert.match(EXECUTABLE, /commit;\s*$/m);
});

test("not-applied disclosure present in the raw file header", () => {
  assert.match(MIGRATION, /NOT APPLIED\. Generated for Founder review/);
});

test("creates ali_question_family as an ADDITIVE table -- no ALTER, DROP, or destructive statement against any existing table", () => {
  assert.match(EXECUTABLE, /create table if not exists public\.ali_question_family/);
  assert.doesNotMatch(EXECUTABLE, /alter table public\.ali_question_bank/i);
  assert.doesNotMatch(EXECUTABLE, /drop table/i);
  assert.doesNotMatch(EXECUTABLE, /delete from/i);
});

test("no foreign key is added against ali_question_bank.family_id -- soft reference only, per the migration's own documented reasoning", () => {
  assert.doesNotMatch(EXECUTABLE, /references public\.ali_question_bank/i);
  assert.doesNotMatch(EXECUTABLE, /foreign key/i);
});

test("carries all ten Founder-required fields (family id, subject, competency, skill, question type, pathway, preparation stage, difficulty range, reasoning structure, misconceptions tested, permitted variation, generation strategy, validation strategy, review status, production eligibility)", () => {
  const createBlock = EXECUTABLE.match(/create table if not exists public\.ali_question_family \(([\s\S]*?)\n\);/)?.[1] ?? "";
  for (const column of [
    "family_id",
    "subject",
    "competency_ids",
    "skills",
    "question_types",
    "pathways",
    "preparation_stage",
    "difficulty_range",
    "reasoning_structure",
    "misconceptions_tested",
    "permitted_variation",
    "generation_strategy",
    "validation_strategy",
    "review_status",
    "production_eligible",
  ]) {
    assert.ok(createBlock.includes(column), `expected column "${column}" in ali_question_family`);
  }
});

test("no column is given a fabricated non-null default beyond an empty array/false -- preparation_stage, reasoning_structure, permitted_variation, validation_strategy, review_status all remain nullable (no 'not null' beside them)", () => {
  const createBlock = EXECUTABLE.match(/create table if not exists public\.ali_question_family \(([\s\S]*?)\n\);/)?.[1] ?? "";
  for (const nullableColumn of ["preparation_stage", "reasoning_structure", "permitted_variation", "validation_strategy", "review_status"]) {
    const line = createBlock.split("\n").find((l) => l.trim().startsWith(nullableColumn));
    assert.ok(line, `expected a column definition line for ${nullableColumn}`);
    assert.doesNotMatch(line!, /not null/i, `${nullableColumn} must remain nullable -- fabricating a default would violate the "no invented metadata" discipline`);
  }
});

test("generation_strategy defaults to hand_authored and is constrained to the three real, disclosed values", () => {
  assert.match(EXECUTABLE, /generation_strategy text not null default 'hand_authored'/);
  assert.match(EXECUTABLE, /check \(generation_strategy in \('hand_authored', 'parametric_generated', 'unclassified'\)\)/);
});

test("RLS is enabled with an admin-only SELECT policy -- no anon or plain authenticated-write policy", () => {
  assert.match(EXECUTABLE, /alter table public\.ali_question_family enable row level security;/);
  assert.match(EXECUTABLE, /create policy ali_question_family_admin_select[\s\S]*?for select[\s\S]*?using \(is_current_user_admin\(\)\);/);
  assert.doesNotMatch(EXECUTABLE, /for insert|for update|for delete/i);
});

test("backfill reads only from ali_question_bank -- no other table is queried or written", () => {
  const insertBlock = EXECUTABLE.match(/insert into public\.ali_question_family[\s\S]*?on conflict \(family_id\) do nothing;/)?.[0] ?? "";
  assert.ok(insertBlock.length > 0, "expected the backfill INSERT statement");
  assert.match(insertBlock, /from public\.ali_question_bank/);
  assert.doesNotMatch(insertBlock, /from public\.(?!ali_question_bank)\w+/);
});

test("backfill only ever includes rows with a non-null family_id -- never fabricates a family for an unfamilied row", () => {
  const insertBlock = EXECUTABLE.match(/insert into public\.ali_question_family[\s\S]*?on conflict \(family_id\) do nothing;/)?.[0] ?? "";
  assert.match(insertBlock, /where family_id is not null/);
});

test("backfill is idempotent -- on conflict (family_id) do nothing, safe to re-run", () => {
  assert.match(EXECUTABLE, /on conflict \(family_id\) do nothing;/);
});

test("Wave 2 Migration Safety Gate fix: pathway (a real text[] column, not jsonb) is explicitly cast via to_jsonb() before being written into the jsonb pathways column -- a type mismatch here would have failed the entire migration at apply time", () => {
  assert.match(EXECUTABLE, /coalesce\(to_jsonb\(\(array_agg\(distinct pathway\)\)\[1\]\), '\[\]'::jsonb\) as pathways/);
  assert.doesNotMatch(EXECUTABLE, /coalesce\(\(array_agg\(distinct pathway\)\)\[1\], '\[\]'::jsonb\)/, "the uncast, type-mismatched original form must not reappear");
});

test("correction history for the pathway type-cast fix is disclosed in the raw file header", () => {
  assert.match(MIGRATION, /CORRECTION HISTORY/);
  assert.match(MIGRATION, /type bug in\s*\n-- the backfill/);
});

test("generation_strategy is backfilled as hand_authored for every real row -- consistent with the repo-wide confirmed fact that no procedural generation mechanism has ever existed", () => {
  const insertBlock = EXECUTABLE.match(/insert into public\.ali_question_family[\s\S]*?on conflict \(family_id\) do nothing;/)?.[0] ?? "";
  assert.match(insertBlock, /'hand_authored' as generation_strategy/);
});

test("fails closed with a RAISE EXCEPTION on a backfill row-count mismatch, never silently proceeds", () => {
  assert.match(EXECUTABLE, /raise exception 'Migration 228 backfill mismatch/);
});

test("multi-subject family_id collisions are surfaced via RAISE NOTICE, not silently dropped or fatally blocked", () => {
  assert.match(EXECUTABLE, /raise notice 'Migration 228: % family_id value\(s\) span more than one subject/);
});

test("no grant or privilege escalation is introduced -- no GRANT/REVOKE statement anywhere", () => {
  assert.doesNotMatch(EXECUTABLE, /\bgrant\b|\brevoke\b/i);
});

test("does not touch, redefine, or reference any Mock scoring/release/manual-marking function from prior increments", () => {
  assert.doesNotMatch(EXECUTABLE, /mock_release_report|mock_apply_manual_mark|mock_analyse_attempt|mock_score_attempt|mock_persist_reading_scoring/);
});
