#!/usr/bin/env node
/**
 * Minimum duplicate-protection layer (Educational Increment 003,
 * ANGEL_CONTENT_SCALE_GATE_V1.md §10). Validates the MR-06 pilot content
 * in supabase/migrations/030_mr06_precision_pilot_and_content_lifecycle_fields.sql
 * before it is applied, and can be re-run at any time as a regression
 * check if more items are added to these two families later.
 *
 * Checks, per the directive's minimum bar:
 *   A. exact duplicate content (identical question text)
 *   B. duplicate family identity (two rows claiming the same id within a family)
 *   C. obviously equivalent variants within the family (identical answer,
 *      which would mean two "different" variants aren't actually testing
 *      anything distinct)
 *
 * Deliberately does NOT attempt semantic near-duplicate detection (e.g.
 * "these two questions are conceptually the same with different framing")
 * — that would require NLP/embedding infrastructure this pilot's scope
 * does not justify building. Recorded as later work, not built here.
 *
 * Not part of npm run lint (unlike copy-quality-guard.mjs) — this
 * validates specific authored SQL content, not every source file, and has
 * nothing to check once no new migration is pending. Run manually before
 * authoring new family content: `node scripts/mr06-family-validation.mjs`.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationPath = path.join(
  __dirname,
  "..",
  "supabase",
  "migrations",
  "030_mr06_precision_pilot_and_content_lifecycle_fields.sql"
);
const sql = readFileSync(migrationPath, "utf8");

// Split into one chunk per VALUES row (each row starts with "('precision-").
const chunks = sql.split(/(?=\('precision-)/).filter((c) => c.startsWith("('precision-"));
const rows = [];
for (const chunk of chunks) {
  const idMatch = chunk.match(/^\('([a-z0-9-]+)'/);
  const familyMatch = chunk.match(/'(precision-\w+)', 'angel_original'/);
  const jsonMatch = chunk.match(/\$json\$([^]*?)\$json\$/);
  if (!idMatch || !familyMatch || !jsonMatch) {
    console.error(`FAIL: could not parse a row chunk starting "${chunk.slice(0, 40)}..."`);
    process.exit(1);
  }
  const id = idMatch[1];
  const familyId = familyMatch[1];
  let prompt;
  try {
    prompt = JSON.parse(jsonMatch[1]);
  } catch (e) {
    console.error(`FAIL: could not parse prompt JSON for "${id}": ${e.message}`);
    process.exit(1);
  }
  rows.push({ id, familyId, question: prompt.question, answer: prompt.answer });
}

if (rows.length === 0) {
  console.error("FAIL: no MR-06 rows extracted from the migration — validator regex may be stale.");
  process.exit(1);
}

let failed = false;

// A. Exact duplicate content (identical question text, anywhere in the file).
const byQuestion = new Map();
for (const r of rows) {
  if (byQuestion.has(r.question)) {
    console.error(`FAIL: duplicate question text between "${byQuestion.get(r.question)}" and "${r.id}"`);
    failed = true;
  }
  byQuestion.set(r.question, r.id);
}

// B. Duplicate family identity (two rows claiming the same id).
const seenIds = new Set();
for (const r of rows) {
  if (seenIds.has(r.id)) {
    console.error(`FAIL: duplicate id "${r.id}"`);
    failed = true;
  }
  seenIds.add(r.id);
}

// C. Obviously equivalent variants within the same family (identical answer
// would mean two variants aren't actually testing anything distinct).
const byFamily = new Map();
for (const r of rows) {
  if (!byFamily.has(r.familyId)) byFamily.set(r.familyId, []);
  byFamily.get(r.familyId).push(r);
}
for (const [familyId, members] of byFamily) {
  const answers = new Set();
  for (const m of members) {
    if (answers.has(m.answer)) {
      console.error(`FAIL: family "${familyId}" has two variants ("${m.id}") sharing the same answer "${m.answer}" — not a genuinely distinct variant.`);
      failed = true;
    }
    answers.add(m.answer);
  }
  if (members.length < 2) {
    console.error(`FAIL: family "${familyId}" has only ${members.length} member(s) — not enough to call it a family with real variation.`);
    failed = true;
  }
}

if (failed) {
  console.error(`\nMR-06 family validation: FAIL`);
  process.exit(1);
}

console.log(`MR-06 family validation: PASS`);
console.log(`  ${rows.length} items across ${byFamily.size} families`);
for (const [familyId, members] of byFamily) {
  console.log(`  - ${familyId}: ${members.length} variants (${members.map((m) => m.id).join(", ")})`);
}
