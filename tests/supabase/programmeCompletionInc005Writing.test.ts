import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Programme Completion Increment 005 — migration 198's two new Continuous
 * Writing candidate prompts (person-focused reflective + forward-looking
 * imaginative-projection shapes, closing the subject-focus/tense gaps the
 * Increment 005 inventory reconciliation found). Structural/source-text
 * assertions, mirroring migration 196/197's own test file exactly
 * (tests/supabase/programmeCompletionInc003Writing.test.ts).
 */

const MIGRATION_198 = readFileSync("supabase/migrations/198_programme_completion_inc005_writing_content.sql", "utf8");
const MIGRATION_199 = readFileSync("supabase/migrations/199_programme_completion_inc005_writing_pending_review.sql", "utf8");

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

const PROMPTS = extractPrompts(MIGRATION_198);

test("migration 198 registers exactly 2 new Writing prompts, both QT-WC-01a", () => {
  const ids = Object.keys(PROMPTS);
  assert.equal(ids.length, 2);
  for (const id of ids) assert.match(MIGRATION_198, new RegExp(`\\('${id}', 'writing', 'QT-WC-01a'`));
});

test("every prompt's checklist begins with the genuine CSSE-evidenced 'Write at least six sentences' instruction and ends with a proofreading check", () => {
  for (const id of Object.keys(PROMPTS)) {
    assert.equal(PROMPTS[id].checklist[0], "Write at least six sentences", `${id} must carry the evidenced minimum as its first checklist item`);
    assert.match(PROMPTS[id].checklist.at(-1), /spelling and punctuation/i, `${id} must end with a proofreading check`);
  }
});

test("the two prompts are genuinely different response shapes: one descriptive (person portrait), one narrative (imaginative projection) -- not the same shape with nouns swapped", () => {
  const types = Object.values(PROMPTS).map((p: any) => p.type);
  assert.deepEqual(types.sort(), ["descriptive", "narrative"]);
});

test("neither prompt is another instance of the over-represented 'Write about a time...' event-recount template already dominating the inventory", () => {
  for (const p of Object.values(PROMPTS) as any[]) {
    assert.ok(!/^write about a time/i.test(p.prompt.trim()), `${p.id} must not reuse the 'Write about a time...' opener`);
  }
});

test("the person-focused prompt is the first in the inventory whose subject is a person, not an event or a place", () => {
  const person = PROMPTS["eng-pc005-writing-personinfluence"];
  assert.ok(person, "expected eng-pc005-writing-personinfluence to be present");
  assert.match(person.prompt, /person who has genuinely made a difference/i);
});

test("the forward-looking prompt is genuinely prospective (imagines a future moment), not another retrospective recount", () => {
  const future = PROMPTS["eng-pc005-writing-somethingnew"];
  assert.ok(future, "expected eng-pc005-writing-somethingnew to be present");
  assert.match(future.prompt, /imagine what it might actually be like/i);
});

test("no QT-WC-01b (picture-stimulus) is attempted -- the disclosed, unfilled image-pipeline gap is not silently worked around", () => {
  assert.ok(!/\('[\w-]+', 'writing', 'QT-WC-01b'/.test(MIGRATION_198), "no row's own question_type/skill may be QT-WC-01b");
  for (const p of Object.values(PROMPTS) as any[]) {
    assert.ok(!("image" in p) && !("imageUrl" in p) && !("stimulusImage" in p), "no prompt JSON may reference an image field that doesn't exist in the pipeline");
  }
});

test("eligibility_status is 'authentic_assessment_candidate' for both new rows, never directly live", () => {
  const sqlBody = MIGRATION_198.slice(MIGRATION_198.lastIndexOf("\nbegin;"));
  const occurrences = (sqlBody.match(/'authentic_assessment_candidate'/g) ?? []).length;
  assert.equal(occurrences, 2);
  assert.ok(!sqlBody.includes("'practice_eligible'"));
});

test("migration 199 registers both prompts for pending independent review, keyed on each row's own family_id", () => {
  for (const id of Object.keys(PROMPTS)) {
    const familyId = MIGRATION_198.match(new RegExp(`\\('${id}'[\\s\\S]*?'(mock-writing-wc01a-[a-z]+)'`))?.[1];
    assert.ok(familyId, `expected to find ${id}'s own family_id in migration 198`);
    assert.match(MIGRATION_199, new RegExp(`'${familyId}'`), `expected migration 199 to register a review row for ${familyId}`);
  }
  assert.match(MIGRATION_199, /'mock_writing_prompt_independent_review'/g);
});

test("migration 198 is insert-only against ali_question_bank; migration 199 is insert-only against ali_family_review", () => {
  assert.ok(!/update public\./.test(MIGRATION_198));
  assert.ok(!/update public\./.test(MIGRATION_199));
  assert.ok(!MIGRATION_198.includes("ali_mock_form"));
});

test("neither new id collides with any of the 11 previously-authored Writing ids", () => {
  const priorIds = [
    "wrt-003",
    "mock-writing-mindchange-01", "mock-writing-kindness-01", "mock-writing-cookopinion-01",
    "mock-writing-newplace-01", "mock-writing-mistakelearned-01", "mock-writing-screentime-01",
    "eng-inc003-writing-imaginedplace-01", "eng-inc003-writing-favouriteplace-01", "eng-inc003-writing-pocketmoney-01",
    "eng-pc003-writing-difficulttask", "eng-pc003-writing-meaningfulplace",
  ];
  for (const id of Object.keys(PROMPTS)) assert.ok(!priorIds.includes(id), `${id} must be genuinely new`);
});
