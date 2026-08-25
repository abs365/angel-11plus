#!/usr/bin/env node
/**
 * Migration SQL Guard — scans every file in supabase/migrations/*.sql and
 * fails if any file's single-quote string literals or $tag$ dollar-quoted
 * blocks are left unbalanced at end of file. See
 * scripts/lib/migrationSqlBalance.mjs for the full rationale, the exact
 * defect this catches (Decision 179, migration 119's own PostgreSQL
 * 42601 failure), and the disclosed residual limitation (this is a
 * quote-balance check, not a real PostgreSQL parser -- no psql/Docker/
 * Postgres-compatible engine is available in this repository's
 * environment).
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { checkMigrationSqlBalance } from "./lib/migrationSqlBalance.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIGRATIONS_DIR = join(ROOT, "supabase", "migrations");

function main() {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const failures = [];
  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
    const result = checkMigrationSqlBalance(sql);
    if (!result.balanced) {
      failures.push({ file, ...result });
    }
  }

  if (failures.length === 0) {
    console.log(`Migration SQL Guard: PASS — ${files.length} migration files, all quote-balanced.`);
    process.exit(0);
  }

  console.error(`Migration SQL Guard: FAIL — ${failures.length} migration file(s) with unbalanced quoting.\n`);
  for (const f of failures) {
    console.error(
      `  ${f.file}: still inside a ${f.stillInString ? "single-quoted string" : "dollar-quoted block"} at end of file`
    );
  }
  console.error(
    "\nAn unbalanced file means a single-quote string literal or $tag$ dollar-quoted block never " +
      "closes cleanly by end of file -- the exact defect class that broke migration 119 in production " +
      "(one unescaped apostrophe closed a string mid-sentence). Check every apostrophe in the file's " +
      "explanation/disclosure/misconception text is doubled ('') per standard PostgreSQL escaping."
  );
  process.exit(1);
}

main();
