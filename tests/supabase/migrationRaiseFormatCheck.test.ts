import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { findRaiseStatements, findRaiseFormatMismatches } from "../../scripts/lib/raiseFormatCheck.mjs";

/**
 * RAISE Format-String / Parameter-Count Guard (Decision 187). Migration
 * 127 was rejected by production PostgreSQL with "ERROR: 42601: too few
 * parameters specified for RAISE" because one RAISE NOTICE embedded the
 * literal phrase "20%" twice, unescaped, in its own format string --
 * every unescaped `%` inside a RAISE format string is a PL/pgSQL
 * substitution placeholder, regardless of whether it is semantically a
 * percent sign in the message's own prose. This proves the guard
 * detects the exact reconstructed original defect, accepts the
 * corrected equivalent, and confirms every RAISE statement across all
 * current migration files is arithmetic-correct.
 */

test("detects the EXACT original migration 127 defect: a RAISE NOTICE with two unescaped '%' (from '20%' appearing twice) and zero supplied parameters", () => {
  const broken = [
    "begin;",
    "do $$",
    "begin",
    "  raise notice 'Migration 127: corrected mock-mr10-bustimetable-04''s question wording from an ambiguous \"speed up...by 20%\" phrasing to an unambiguous \"reduce...journey time by 20%\" phrasing.';",
    "end $$;",
    "commit;",
  ].join("\n");
  const mismatches = findRaiseFormatMismatches(broken);
  assert.equal(mismatches.length, 1, "the reconstructed original defect must be detected");
  assert.equal(mismatches[0].placeholderCount, 2);
  assert.equal(mismatches[0].paramCount, 0);
});

test("accepts the corrected equivalent: the same literal percent signs escaped as '%%'", () => {
  const fixed = [
    "begin;",
    "do $$",
    "begin",
    "  raise notice 'Migration 127: corrected mock-mr10-bustimetable-04''s question wording from an ambiguous \"speed up...by 20%%\" phrasing to an unambiguous \"reduce...journey time by 20%%\" phrasing.';",
    "end $$;",
    "commit;",
  ].join("\n");
  assert.deepEqual(findRaiseFormatMismatches(fixed), []);
});

test("correctly counts a genuine placeholder alongside an escaped literal percent sign in the same format string", () => {
  const sql = "do $$ begin raise exception 'discount is 20%%, found %', 5; end $$;"; // one escaped literal (%%), one real placeholder (%), one supplied param
  assert.deepEqual(findRaiseFormatMismatches(sql), []);
});

test("flags a genuine under-supply (real placeholder with no parameter) distinctly from an over-escaped literal", () => {
  const underSupplied = "do $$ begin raise exception 'found % rows'; end $$;";
  const mismatches = findRaiseFormatMismatches(underSupplied);
  assert.equal(mismatches.length, 1);
  assert.equal(mismatches[0].placeholderCount, 1);
  assert.equal(mismatches[0].paramCount, 0);
});

test("flags a genuine over-supply (parameter with no matching placeholder) too", () => {
  const overSupplied = "do $$ begin raise notice 'all good'; end $$;"; // 0 placeholders
  assert.deepEqual(findRaiseFormatMismatches(overSupplied), []);
  const overSuppliedWithParam = "do $$ begin raise notice 'all good', 5; end $$;"; // 0 placeholders, 1 param
  const mismatches = findRaiseFormatMismatches(overSuppliedWithParam);
  assert.equal(mismatches.length, 1);
  assert.equal(mismatches[0].placeholderCount, 0);
  assert.equal(mismatches[0].paramCount, 1);
});

test("correctly handles a parameter expression containing nested parens and commas (e.g. count(*)) without miscounting parameters", () => {
  const sql = "do $$ begin raise exception 'found % of % rows', count(*), (select 1, 2 limit 1); end $$;";
  const stmts = findRaiseStatements(sql);
  assert.equal(stmts.length, 1);
  assert.equal(stmts[0].placeholderCount, 2);
  assert.equal(stmts[0].paramCount, 2, "the nested-paren/comma parameter expressions must not be split into extra parameters");
});

test("ignores quotes and % characters inside -- comments (comments are stripped first, matching this repository's own established convention)", () => {
  const sql = [
    "-- this comment has a literal % with no escaping and would break RAISE if it were real code",
    "do $$ begin raise notice 'all good'; end $$;",
  ].join("\n");
  assert.deepEqual(findRaiseFormatMismatches(sql), []);
});

test("migration 127 (corrected) has zero RAISE format-string/parameter mismatches", () => {
  const sql = fs.readFileSync("supabase/migrations/127_mock_mathematics_bustimetable_subpart_d_wording_correction.sql", "utf8");
  assert.deepEqual(findRaiseFormatMismatches(sql), []);
  // Sanity: this file does contain multiple RAISE statements, so an
  // empty mismatch list here is a real pass, not a parser no-op.
  assert.ok(findRaiseStatements(sql).length >= 8);
});

test("migration 128 has no RAISE statements at all (a plain INSERT migration) -- confirmed, not assumed", () => {
  const sql = fs.readFileSync("supabase/migrations/128_mock_mathematics_bustimetable_correction_pending_review.sql", "utf8");
  assert.deepEqual(findRaiseStatements(sql), []);
  assert.deepEqual(findRaiseFormatMismatches(sql), []);
});

test("EVERY migration file currently in the repository has zero RAISE format-string/parameter mismatches -- the guard is applied repository-wide, not scoped to one file", () => {
  const dir = "supabase/migrations";
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql"));
  assert.ok(files.length > 100, "sanity check: expected a substantial existing migration set");
  const failures: string[] = [];
  let totalRaiseStatements = 0;
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    totalRaiseStatements += findRaiseStatements(sql).length;
    const mismatches = findRaiseFormatMismatches(sql);
    if (mismatches.length > 0) failures.push(file);
  }
  assert.deepEqual(failures, [], `migration file(s) with a RAISE format/parameter mismatch: ${failures.join(", ")}`);
  assert.ok(totalRaiseStatements > 100, "sanity check: expected a substantial number of real RAISE statements scanned");
});

test("npm run migration-sql-guard now also runs the RAISE format check, alongside the existing quote-balance check", () => {
  const scriptSource = fs.readFileSync("scripts/migration-sql-guard.mjs", "utf8");
  assert.match(scriptSource, /findRaiseFormatMismatches/);
  assert.match(scriptSource, /checkMigrationSqlBalance/);
});
