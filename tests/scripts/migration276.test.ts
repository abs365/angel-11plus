import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

// Migration 276 (Great Stink passage line endings) is a one-row, fully guarded normalisation. These pin its safety properties.
const m = fs.readFileSync("supabase/migrations/276_great_stink_passage_line_endings_TEMPLATE_NOT_APPLIED.sql", "utf8");
const rb = fs.readFileSync("scripts/output/founder-execution/276-ROLLBACK-restore-crlf.sql", "utf8");
const code = (s: string) => s.split("\n").filter((l) => !l.trim().startsWith("--")).join("\n");

test("no carriage return and no multi-line string literal in the files (a paste cannot alter them)", () => {
  assert.ok(!m.includes("\r") && !rb.includes("\r"));
  for (const f of [m, rb]) for (const line of code(f).split("\n")) assert.equal((line.match(/'/g) ?? []).length % 2, 0, `a string literal spans lines: ${line}`);
});
test("exactly one UPDATE, scoped to eng-fb-greatstink, changing only original_text; no delete, no DDL, no other table", () => {
  const c = code(m);
  assert.equal((c.match(/\bupdate\b/gi) ?? []).length, 1);
  assert.match(c, /update public\.ali_passage_bank\s+set original_text = v_after\s+where id = 'eng-fb-greatstink'/);
  assert.doesNotMatch(c, /\b(delete|truncate|insert|create|alter|drop|grant|revoke)\b/i);
  assert.equal((c.match(/\bset\b/gi) ?? []).length, 1);
});
test("guards: one row, exact BEFORE state, exact canonical AFTER state, one row changed", () => {
  for (const x of ["3010", "8d9571b5fd8f5c4bb7ca57c5a2801f29", "ea793ad48685208cc0a1ecd65722283c", "3000", "<> 1", "chr(13)", "chr(10)"]) assert.ok(m.includes(x), x);
  assert.match(m, /replace\(v_before, chr\(13\), ''\)/);
});
test("rollback is the exact inverse and equally guarded", () => {
  assert.match(rb, /replace\(v_before, chr\(10\), chr\(13\) \|\| chr\(10\)\)/);
  assert.ok(rb.includes("ea793ad48685208cc0a1ecd65722283c") && rb.includes("8d9571b5fd8f5c4bb7ca57c5a2801f29"));
});
