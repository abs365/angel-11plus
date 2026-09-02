import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Programme Completion Increment 003 — migration 195, the smallest content
 * correction for w2-pianorecital-07's disclosed-but-never-fixed defect
 * (migration 187: option F says "only two words" but the passage's own
 * quoted teacher line, "the middle section", is three words). Proves the
 * old/new question strings byte-match the real source rows this migration
 * reads from, and that nothing else changes.
 */

const MIGRATION_195 = readFileSync("supabase/migrations/195_pianorecital07_option_f_wordcount_correction.sql", "utf8");
const MIGRATION_051 = readFileSync("supabase/migrations/051_english_wave2_completion_content.sql", "utf8");

function extractRealQuestion(): string {
  const jsonMatch = MIGRATION_051.match(/'w2-pianorecital-07'[\s\S]*?\$json\$([\s\S]*?)\$json\$/);
  assert.ok(jsonMatch, "expected to find w2-pianorecital-07's own JSON in migration 051");
  return JSON.parse(jsonMatch![1]).question;
}

function extractSqlLiteral(varName: string): string {
  const re = new RegExp(`${varName} constant text := '([\\s\\S]*?)';\\n`);
  const m = MIGRATION_195.match(re);
  assert.ok(m, `expected to find ${varName} in migration 195`);
  return m![1].replace(/''/g, "'");
}

test("migration 195's v_old_question is byte-identical to the real, currently-stored question text (migration 051)", () => {
  assert.equal(extractSqlLiteral("v_old_question"), extractRealQuestion());
});

test("migration 195's v_new_question differs from v_old_question by exactly the one word: 'two' -> 'three'", () => {
  const oldText = extractSqlLiteral("v_old_question");
  const newText = extractSqlLiteral("v_new_question");
  assert.ok(oldText.includes("only two words"));
  assert.ok(newText.includes("only three words"));
  assert.equal(newText.replace("only three words", "only two words"), oldText, "every other character must be identical");
});

test("migration 195 never touches correctOptions, modelAnswer, passageText, or any other row/table", () => {
  assert.ok(!MIGRATION_195.includes("set prompt = jsonb_set(prompt, '{correctOptions}'"));
  assert.ok(!MIGRATION_195.includes("set prompt = jsonb_set(prompt, '{modelAnswer}'"));
  assert.ok(!MIGRATION_195.includes("set prompt = jsonb_set(prompt, '{passageText}'"));
  assert.ok(!/update public\.(?!ali_question_bank)/.test(MIGRATION_195), "must only ever UPDATE ali_question_bank");
  const updateCount = (MIGRATION_195.match(/update public\.ali_question_bank/g) ?? []).length;
  assert.equal(updateCount, 1, "exactly one UPDATE statement");
});

test("migration 195 guards on the exact correctOptions value before writing, refusing if scoring has drifted", () => {
  assert.match(MIGRATION_195, /v_correct_options is distinct from '\["A","C","F","H"\]'::jsonb/);
});

test("migration 195 is fail-closed idempotent: pristine -> update, already-applied -> no-op, anything else -> exception", () => {
  assert.match(MIGRATION_195, /v_current_question = v_old_question then/);
  assert.match(MIGRATION_195, /v_current_question = v_new_question then/);
  assert.match(MIGRATION_195, /raise exception 'Migration 195 refused: % question text matches neither/);
});
