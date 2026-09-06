import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

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

test("Founder-raised safety gate (Supabase SQL Editor pre-flight warning): RLS is enabled on ali_question_family strictly BEFORE any row is ever inserted into it (the backfill INSERT), and strictly before commit -- the table is never, at any point within this transaction, in a state where a row exists without RLS protection", () => {
  const createTableIndex = EXECUTABLE.indexOf("create table if not exists public.ali_question_family");
  const enableRlsIndex = EXECUTABLE.indexOf("alter table public.ali_question_family enable row level security;");
  const createPolicyIndex = EXECUTABLE.indexOf("create policy ali_question_family_admin_select");
  const backfillInsertIndex = EXECUTABLE.indexOf("insert into public.ali_question_family");
  const commitIndex = EXECUTABLE.lastIndexOf("commit;");

  assert.ok(createTableIndex > -1 && enableRlsIndex > -1 && createPolicyIndex > -1 && backfillInsertIndex > -1 && commitIndex > -1);
  assert.ok(
    createTableIndex < enableRlsIndex &&
    enableRlsIndex < createPolicyIndex &&
    createPolicyIndex < backfillInsertIndex &&
    backfillInsertIndex < commitIndex,
    "expected strict order: CREATE TABLE -> ENABLE RLS -> CREATE POLICY -> backfill INSERT -> COMMIT"
  );
});

test("the only DROP statement in this entire migration is 'drop policy if exists' against the brand-new ali_question_family table's own policy (idempotent re-run safety) -- it cannot possibly target a pre-existing object with real data, since the table itself is created earlier in this SAME migration/transaction", () => {
  const dropStatements = [...EXECUTABLE.matchAll(/drop \w+[^;]*;/gi)];
  assert.equal(dropStatements.length, 1, "expected exactly one DROP statement in this migration");
  assert.match(dropStatements[0][0], /drop policy if exists ali_question_family_admin_select on public\.ali_question_family;/);
  // The dropped object's own table must be created earlier in this same file -- proving this DROP can never affect pre-existing production data.
  const createTableIndex = EXECUTABLE.indexOf("create table if not exists public.ali_question_family");
  const dropIndex = EXECUTABLE.indexOf(dropStatements[0][0]);
  assert.ok(createTableIndex > -1 && createTableIndex < dropIndex);
});

test("no ALTER TABLE statement anywhere in this migration targets any pre-existing table (ali_question_bank, profiles, or any other) -- the only ALTER TABLE in the whole file is enabling RLS on the brand-new table this same migration creates", () => {
  const alterStatements = [...EXECUTABLE.matchAll(/alter table (\S+)/gi)];
  assert.equal(alterStatements.length, 1, "expected exactly one ALTER TABLE statement in this migration");
  assert.equal(alterStatements[0][1], "public.ali_question_family");
});

test("no UPDATE, DELETE, or TRUNCATE statement exists anywhere in this migration -- it cannot alter or remove any existing row in any table", () => {
  assert.doesNotMatch(EXECUTABLE, /\bupdate\s+public\./i);
  assert.doesNotMatch(EXECUTABLE, /\bdelete\s+from\b/i);
  assert.doesNotMatch(EXECUTABLE, /\btruncate\b/i);
});

function findFilesReferencing(dir: string, needle: string, skipFileName: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".next" || entry === ".git") continue;
      findFilesReferencing(full, needle, skipFileName, out);
    } else if (/\.(ts|tsx|sql|mjs|js)$/.test(entry) && entry !== skipFileName) {
      const content = readFileSync(full, "utf8");
      if (content.includes(needle)) out.push(full);
    }
  }
  return out;
}

test("ali_question_family is referenced only by known, reviewed follow-on work (the Wave 2 pathway-defect repair migration 231, its own read-only production-verification script, and the pure-function pathway-aggregation oracle) -- no OTHER, unreviewed application route or function has taken a dependency on this table", () => {
  const matches = [
    ...findFilesReferencing("supabase/migrations", "ali_question_family", "228_cross_subject_question_family_model.sql"),
    ...findFilesReferencing("lib", "ali_question_family", "228_cross_subject_question_family_model.sql"),
    ...findFilesReferencing("app", "ali_question_family", "228_cross_subject_question_family_model.sql"),
    ...findFilesReferencing("scripts", "ali_question_family", "228_cross_subject_question_family_model.sql"),
  ]
    // Normalise to forward slashes so this assertion is stable across
    // Windows (backslash) and POSIX (forward slash) path separators.
    .map((p) => p.replace(/\\/g, "/"));
  const knownLegitimateReferences = [
    "supabase/migrations/231_ali_question_family_pathway_backfill_repair.sql",
    // Educational Foundation Completion increment, reviewed: migration
    // 232 repairs the PROVEN row_count/skills/question_types/pathways
    // staleness root cause (migration 228's own `on conflict do nothing`
    // backfill never refreshes on later ali_question_bank changes) and
    // adds a trigger to keep this table live going forward. Read-only
    // against ali_question_bank, writes only to ali_question_family,
    // no RLS/grant change -- same review discipline as 231 above.
    "supabase/migrations/232_ali_question_family_live_sync.sql",
    "scripts/verify-question-factory-production.mjs",
    "lib/ali/pathwayAggregation.ts",
    // Documentation-only mention (naming the real table this module's
    // taxonomy concepts apply to) -- familyTaxonomy.ts issues no query
    // against ali_question_family itself; its classifier takes plain
    // caller-supplied fields as input.
    "lib/ali/familyTaxonomy.ts",
  ];
  for (const match of matches) {
    assert.ok(
      knownLegitimateReferences.some((known) => match.endsWith(known)),
      `unexpected new reference to ali_question_family: ${match} -- if this is legitimate follow-on work, add it to knownLegitimateReferences with the same review this test's own docstring implies`
    );
  }
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
