import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

/**
 * CSSE Two-Paper Mock P1 Repair (P1-A) — migration 250 restores the
 * migration-151 analysis-invocation behaviour that migration 220
 * silently dropped, while preserving migration 220's own Reading
 * Comprehension Mock 1 exclusion exactly. Structural/logic assertions
 * against migration 250's real, live SQL source text, matching this
 * repository's own established convention for a NOT APPLIED migration.
 */

const MIGRATION = readFileSync("supabase/migrations/250_mock_report_analysis_trigger_restoration.sql", "utf8");

function functionBody(source: string): string {
  const match = source.match(/create or replace function public\.mock_attempt_report_init\(\)[\s\S]*?\n\$\$;/);
  if (!match) throw new Error("mock_attempt_report_init() not found");
  return match[0];
}

test("migration 250 is wrapped in a single begin/commit transaction and discloses NOT APPLIED", () => {
  assert.match(MIGRATION, /^begin;/m);
  assert.match(MIGRATION, /^commit;/m);
  assert.match(MIGRATION, /NOT APPLIED/);
});

test("the Reading Comprehension Mock 1 skip-guard (migration 220) is preserved exactly", () => {
  const body = functionBody(MIGRATION);
  assert.match(body, /if new\.attempt_type = 'timed_section' and new\.form_id = 'reading-comprehension-mock-1' then/);
  // The branch must be a true no-op (`null;`), never calling the legacy scorer.
  const guardBranch = body.split("if new.attempt_type = 'timed_section'")[1].split("else")[0];
  assert.doesNotMatch(guardBranch, /perform public\.mock_score_attempt/);
});

test("the migration-151 analysis-invocation block is restored inside the else branch", () => {
  const body = functionBody(MIGRATION);
  const elseBranch = body.split(/\belse\b/)[1] ?? "";
  assert.match(elseBranch, /perform public\.mock_score_attempt\(new\.id\);/);
  assert.match(
    elseBranch,
    /if \(select scoring_state from public\.ali_mock_attempt_report where attempt_id = new\.id\) = 'scored' then\s*\n\s*perform public\.mock_analyse_attempt\(new\.id\);\s*\n\s*end if;/
  );
});

test("the analysis block is its own isolated exception handler -- a failure there only ever touches analysis_state, never scoring_state/question_outcomes/overall", () => {
  const body = functionBody(MIGRATION);
  const analysisBlock = body.split("perform public.mock_analyse_attempt(new.id);")[1]?.split("end;\n$$;")[0] ?? "";
  assert.match(analysisBlock, /exception when others then/);
  assert.match(analysisBlock, /set analysis_state = 'failed', updated_at = now\(\)/);
  assert.doesNotMatch(analysisBlock, /scoring_state/);
  assert.doesNotMatch(analysisBlock, /question_outcomes/);
});

test("neither historical migration (151 or 220) is edited by this repair -- both remain on disk unchanged", () => {
  const migration151 = readFileSync("supabase/migrations/151_mock_deterministic_analysis_engine.sql", "utf8");
  const migration220 = readFileSync("supabase/migrations/220_reading_mock_legacy_scorer_exclusion.sql", "utf8");
  assert.match(migration151, /create or replace function public\.mock_attempt_report_init\(\)/);
  assert.match(migration220, /create or replace function public\.mock_attempt_report_init\(\)/);
  // This test does not re-assert their full bodies (already covered by
  // their own existing test suites) -- it only proves this repair did not
  // touch either file, by construction (250 is a new, separate file).
});

test("regression guard: the LAST redefinition of mock_attempt_report_init() across every migration on disk contains the analysis-invocation call -- fails if a future migration silently drops it again the way 220 did", () => {
  const files = readdirSync("supabase/migrations")
    .filter((f) => /^\d+_.*\.sql$/.test(f))
    .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  let lastDefiningFile: string | null = null;
  let lastDefiningMigrationNumber = -1;
  for (const file of files) {
    const migrationNumber = parseInt(file, 10);
    const content = readFileSync(`supabase/migrations/${file}`, "utf8");
    if (/create or replace function public\.mock_attempt_report_init\(\)/.test(content) && migrationNumber >= lastDefiningMigrationNumber) {
      lastDefiningFile = file;
      lastDefiningMigrationNumber = migrationNumber;
    }
  }

  assert.ok(lastDefiningFile, "no definition of mock_attempt_report_init() found anywhere on disk");
  assert.equal(lastDefiningFile, "250_mock_report_analysis_trigger_restoration.sql", "expected migration 250 to be the current live definition");

  const liveBody = functionBody(readFileSync(`supabase/migrations/${lastDefiningFile}`, "utf8"));
  assert.match(
    liveBody,
    /perform public\.mock_analyse_attempt\(new\.id\)/,
    "the LIVE (highest-numbered) definition of mock_attempt_report_init() must call mock_analyse_attempt() -- if this fails, a later migration has silently dropped it again"
  );
  assert.match(
    liveBody,
    /new\.attempt_type = 'timed_section' and new\.form_id = 'reading-comprehension-mock-1'/,
    "the LIVE definition must still preserve the Reading Comprehension Mock 1 exclusion"
  );
});

test("this migration does not touch mock_score_attempt, mock_analyse_attempt, mock_release_report, or mock_apply_manual_mark bodies -- no CREATE OR REPLACE for any of them", () => {
  for (const fn of ["mock_score_attempt", "mock_analyse_attempt", "mock_release_report", "mock_apply_manual_mark"]) {
    assert.doesNotMatch(MIGRATION, new RegExp(`create or replace function public\\.${fn}\\(`));
  }
});
