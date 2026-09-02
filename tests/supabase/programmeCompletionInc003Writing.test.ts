import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Programme Completion Increment 003 — migration 196's two new Continuous
 * Writing candidate prompts (narrative + pure-descriptive shapes, closing
 * the gap Increment 002 found). Structural/source-text assertions, matching
 * this repository's own established convention for content this small
 * (mirrors migration 152/191's own test file structure).
 */

const MIGRATION_196 = readFileSync("supabase/migrations/196_programme_completion_inc003_writing_content.sql", "utf8");
const MIGRATION_197 = readFileSync("supabase/migrations/197_programme_completion_inc003_writing_pending_review.sql", "utf8");

function extractPrompts(sql: string): Record<string, any> {
  const re = /\$json\$([\s\S]*?)\$json\$/g;
  const prompts: Record<string, any> = {};
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql))) {
    const obj = JSON.parse(m[1]);
    prompts[obj.id] = obj;
  }
  return prompts;
}

const PROMPTS = extractPrompts(MIGRATION_196);

test("migration 196 registers exactly 2 new Writing prompts, both QT-WC-01a", () => {
  const ids = Object.keys(PROMPTS);
  assert.equal(ids.length, 2);
  for (const id of ids) assert.match(MIGRATION_196, new RegExp(`\\('${id}', 'writing', 'QT-WC-01a'`));
});

test("every prompt's checklist begins with the genuine CSSE-evidenced 'Write at least six sentences' instruction", () => {
  for (const id of Object.keys(PROMPTS)) {
    assert.equal(PROMPTS[id].checklist[0], "Write at least six sentences", `${id} must carry the evidenced minimum as its first checklist item`);
  }
});

test("the two prompts are genuinely different response shapes: one narrative, one descriptive -- not the same shape with nouns swapped", () => {
  const types = Object.values(PROMPTS).map((p: any) => p.type);
  assert.deepEqual(types.sort(), ["descriptive", "narrative"]);
});

test("no QT-WC-01b (picture-stimulus) is attempted -- the disclosed, unfilled image-pipeline gap is not silently worked around", () => {
  // "QT-WC-01b" legitimately appears inside each row's own `explanation`
  // column, disclosing the gap (matching migration 098's own convention)
  // -- what must never happen is a row actually TYPED as QT-WC-01b, or a
  // prompt JSON that references an image field.
  assert.ok(!/\('[\w-]+', 'writing', 'QT-WC-01b'/.test(MIGRATION_196), "no row's own question_type/skill may be QT-WC-01b");
  for (const p of Object.values(PROMPTS) as any[]) {
    assert.ok(!("image" in p) && !("imageUrl" in p) && !("stimulusImage" in p), "no prompt JSON may reference an image field that doesn't exist in the pipeline");
  }
});

test("eligibility_status is 'authentic_assessment_candidate' for both new rows, never directly live", () => {
  const sqlBody = MIGRATION_196.slice(MIGRATION_196.lastIndexOf("\nbegin;"));
  const occurrences = (sqlBody.match(/'authentic_assessment_candidate'/g) ?? []).length;
  assert.equal(occurrences, 2);
  assert.ok(!sqlBody.includes("'practice_eligible'"));
});

test("migration 197 registers both prompts for pending independent review, keyed on each row's own family_id", () => {
  for (const id of Object.keys(PROMPTS)) {
    const familyId = MIGRATION_196.match(new RegExp(`\\('${id}'[\\s\\S]*?'(mock-writing-wc01a-[a-z]+)'`))?.[1];
    assert.ok(familyId, `expected to find ${id}'s own family_id in migration 196`);
    assert.match(MIGRATION_197, new RegExp(`'${familyId}'`), `expected migration 197 to register a review row for ${familyId}`);
  }
  assert.match(MIGRATION_197, /'mock_writing_prompt_independent_review'/g);
});

test("migration 196 is insert-only against ali_question_bank; migration 197 is insert-only against ali_family_review", () => {
  assert.ok(!/update public\./.test(MIGRATION_196));
  assert.ok(!/update public\./.test(MIGRATION_197));
  assert.ok(!MIGRATION_196.includes("ali_mock_form"));
});
