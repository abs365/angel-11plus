import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { checkMigrationSqlBalance } from "../../scripts/lib/migrationSqlBalance.mjs";

/**
 * Migration SQL Literal-Balance Guard (Decision 179). Migration 119 was
 * rejected by production PostgreSQL with "ERROR: 42601: syntax error at
 * or near "s"" because one unescaped apostrophe ("the real archetype's
 * own pattern") closed a string literal mid-sentence. Every prior
 * migration test in this repository asserts against SUBSTRINGS of the
 * raw file text, which still matches even when the file's own quoting
 * is broken -- substring assertions cannot detect this defect class.
 * This test proves: (a) the guard actually detects the exact original
 * defect, reconstructed verbatim; (b) the corrected migration 119 now
 * passes; (c) EVERY migration file currently in the repository is
 * quote-balanced, not only 119/120 -- the guard is applied repository-
 * wide, per explicit instruction, not scoped to one file.
 */

test("the guard detects the EXACT original migration 119 defect: one unescaped apostrophe in 'archetype's' breaks balance", () => {
  const broken = [
    "begin;",
    "insert into public.ali_question_bank (id) values",
    "('x', $json${\"a\":1}$json$,",
    " 'matching the real archetype's own pattern of an increasingly demanding final subpart (e.g. 2023 Q18(iii)''s own multi-value combined expression).', 3, 'y')",
    "on conflict (id) do nothing;",
    "commit;",
  ].join("\n");
  const result = checkMigrationSqlBalance(broken);
  assert.equal(result.balanced, false, "the reconstructed original defect must be detected as unbalanced");
  assert.equal(result.stillInString, true);
});

test("the guard accepts the equivalent CORRECTED text: the same apostrophe properly doubled", () => {
  const fixed = [
    "begin;",
    "insert into public.ali_question_bank (id) values",
    "('x', $json${\"a\":1}$json$,",
    " 'matching the real archetype''s own pattern of an increasingly demanding final subpart (e.g. 2023 Q18(iii)''s own multi-value combined expression).', 3, 'y')",
    "on conflict (id) do nothing;",
    "commit;",
  ].join("\n");
  const result = checkMigrationSqlBalance(fixed);
  assert.equal(result.balanced, true, "correctly doubled apostrophes must be accepted as balanced");
  assert.equal(result.stillInString, false);
  assert.equal(result.stillInDollar, false);
});

test("the guard ignores quotes inside -- comments (comments are stripped before tokenizing, matching this repository's own established convention)", () => {
  const withCommentQuote = `
-- this comment has an unescaped apostrophe: it's fine, comments don't matter
begin;
insert into public.ali_question_bank (id) values ('x')
on conflict (id) do nothing;
commit;
`;
  const result = checkMigrationSqlBalance(withCommentQuote);
  assert.equal(result.balanced, true);
});

test("migration 119 (corrected) is now quote-balanced", () => {
  const sql = fs.readFileSync("supabase/migrations/119_mock_mathematics_structural_capacity_increment001_algebraic_system.sql", "utf8");
  const result = checkMigrationSqlBalance(sql);
  assert.equal(result.balanced, true, "migration 119 must be balanced after the Decision 179 correction");
  assert.equal(result.dollarBlockCount, 3, "expected exactly 3 $json$...$json$ blocks, one per row");
});

test("migration 120 is quote-balanced (audited, found already valid, left byte-unchanged)", () => {
  const sql = fs.readFileSync("supabase/migrations/120_mock_mathematics_structural_capacity_increment001_pending_review.sql", "utf8");
  const result = checkMigrationSqlBalance(sql);
  assert.equal(result.balanced, true);
});

test("EVERY migration file currently in the repository is quote-balanced -- the guard is applied repository-wide, not scoped to one file", () => {
  const dir = "supabase/migrations";
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql"));
  assert.ok(files.length > 100, "sanity check: expected a substantial existing migration set");
  const failures: string[] = [];
  for (const file of files) {
    const sql = fs.readFileSync(path.join(dir, file), "utf8");
    const result = checkMigrationSqlBalance(sql);
    if (!result.balanced) failures.push(file);
  }
  assert.deepEqual(failures, [], `unbalanced migration file(s) found: ${failures.join(", ")}`);
});

test("npm run migration-sql-guard is wired into npm run lint, alongside copy-guard", () => {
  const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
  assert.equal(pkg.scripts["migration-sql-guard"], "node scripts/migration-sql-guard.mjs");
  assert.match(pkg.scripts.lint, /npm run migration-sql-guard/);
});
