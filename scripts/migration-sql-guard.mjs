#!/usr/bin/env node
/**
 * Migration SQL Guard — scans every file in supabase/migrations/*.sql
 * for two distinct, independently-tested defect classes:
 *
 *   1. Unbalanced single-quote string literals or $tag$ dollar-quoted
 *      blocks (Decision 179, migration 119's own PostgreSQL 42601
 *      failure). See scripts/lib/migrationSqlBalance.mjs.
 *   2. RAISE statements whose format string's unescaped `%` placeholder
 *      count does not match its supplied trailing parameter count
 *      (Decision 187, migration 127's own PostgreSQL 42601 "too few
 *      parameters specified for RAISE" failure). See
 *      scripts/lib/raiseFormatCheck.mjs.
 *
 * Neither check is a real PostgreSQL parser -- this remains a quote-
 * balance and RAISE-arithmetic check only, not semantic SQL validity
 * in general (a missing comma, a misspelled keyword, a malformed IF, a
 * type mismatch would all pass this guard and only be caught by
 * Supabase itself). No psql/Docker/Postgres-compatible engine is
 * available in this repository's environment.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { checkMigrationSqlBalance } from "./lib/migrationSqlBalance.mjs";
import { findRaiseFormatMismatches } from "./lib/raiseFormatCheck.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const MIGRATIONS_DIR = join(ROOT, "supabase", "migrations");

function main() {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const balanceFailures = [];
  const raiseFailures = [];
  for (const file of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");

    const balance = checkMigrationSqlBalance(sql);
    if (!balance.balanced) {
      balanceFailures.push({ file, ...balance });
    }

    const mismatches = findRaiseFormatMismatches(sql);
    if (mismatches.length > 0) {
      raiseFailures.push({ file, mismatches });
    }
  }

  if (balanceFailures.length === 0 && raiseFailures.length === 0) {
    console.log(`Migration SQL Guard: PASS — ${files.length} migration files, all quote-balanced, all RAISE statements arithmetic-correct.`);
    process.exit(0);
  }

  let failureCount = 0;

  if (balanceFailures.length > 0) {
    failureCount += balanceFailures.length;
    console.error(`Migration SQL Guard: FAIL — ${balanceFailures.length} migration file(s) with unbalanced quoting.\n`);
    for (const f of balanceFailures) {
      console.error(
        `  ${f.file}: still inside a ${f.stillInString ? "single-quoted string" : "dollar-quoted block"} at end of file`
      );
    }
    console.error(
      "\nAn unbalanced file means a single-quote string literal or $tag$ dollar-quoted block never " +
        "closes cleanly by end of file -- the exact defect class that broke migration 119 in production " +
        "(one unescaped apostrophe closed a string mid-sentence). Check every apostrophe in the file's " +
        "explanation/disclosure/misconception text is doubled ('') per standard PostgreSQL escaping.\n"
    );
  }

  if (raiseFailures.length > 0) {
    failureCount += raiseFailures.reduce((n, f) => n + f.mismatches.length, 0);
    console.error(`Migration SQL Guard: FAIL — ${raiseFailures.length} migration file(s) with a RAISE format-string/parameter mismatch.\n`);
    for (const f of raiseFailures) {
      for (const mm of f.mismatches) {
        console.error(
          `  ${f.file}: RAISE ${mm.level ?? ""} format string has ${mm.placeholderCount} unescaped % placeholder(s) but ${mm.paramCount} parameter(s) were supplied`
        );
        console.error(`    format: '${mm.format.slice(0, 120)}${mm.format.length > 120 ? "..." : ""}'`);
      }
    }
    console.error(
      "\nEvery unescaped % inside a RAISE format string is a PL/pgSQL substitution placeholder, even when " +
        "it is semantically a literal percent sign in the message's own prose -- write %% to emit a literal " +
        "percent sign. This is the exact defect class that broke migration 127 in production (a literal " +
        "'20%' inside a RAISE NOTICE message, unescaped, with no parameter supplied)."
    );
  }

  process.exitCode = 1;
  console.error(`\n${failureCount} total issue(s) found.`);
}

main();
