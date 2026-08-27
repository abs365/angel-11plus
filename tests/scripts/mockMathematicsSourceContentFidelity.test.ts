import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics First Mock — Source Content Fidelity Guard (Decision 215).
 *
 * WHY THIS TEST EXISTS: `scripts/mock-mathematics-source-content.json`
 * (the extraction cache backing `scripts/lib/mockMathematicsPool.mjs`,
 * Decision 212/213/214) was found this session to hold STALE content for
 * `mock-mr10-bustimetable-04` -- it had been extracted from migration 125
 * (the row's ORIGINAL authoring migration) without accounting for
 * migration 127's later, Founder-approved wording correction (Decision
 * 185-188), which IS confirmed applied to production. The live database
 * has carried the corrected wording since Decision 188; only this
 * repository's own local extraction cache, and the Founder-inspection
 * artifacts generated from it, were wrong. This test locks the fix in and
 * prevents the same class of drift recurring silently for this row.
 */

const SOURCE_CONTENT = JSON.parse(fs.readFileSync("scripts/mock-mathematics-source-content.json", "utf8"));
const MIGRATION_127 = fs.readFileSync("supabase/migrations/127_mock_mathematics_bustimetable_subpart_d_wording_correction.sql", "utf8");

test("mock-mr10-bustimetable-04's cached question text is byte-identical to migration 127's own v_new_question -- the real, Founder-approved, production-applied wording (Decision 185-188), not migration 125's original, superseded text", () => {
  const match = MIGRATION_127.match(/v_new_question constant text := '([^']*(?:''[^']*)*)';/);
  assert.ok(match, "migration 127's own v_new_question literal must be found");
  const expectedQuestion = match![1].replace(/''/g, "'");
  assert.equal(SOURCE_CONTENT["mock-mr10-bustimetable-04"].question, expectedQuestion);
});

test("the cached wording describes journey TIME being reduced by 20%, using the words 'reduce' and 'journey time' explicitly", () => {
  const question = SOURCE_CONTENT["mock-mr10-bustimetable-04"].question;
  assert.match(question, /reduce the afternoon Hillview-to-Milltown journey time by 20%/);
});

test("the cached wording no longer contains the ambiguous 'speed up ... leg by 20%' phrasing (migration 125's original, superseded text)", () => {
  const question = SOURCE_CONTENT["mock-mr10-bustimetable-04"].question;
  assert.ok(!/speed up/i.test(question), "must never contain the ambiguous 'speed up' phrasing");
  assert.ok(!question.includes("leg by 20%"), "must never contain the superseded 'leg by 20%' phrasing");
});

test("the wording cannot reasonably be read as 'increase speed by 20%' -- it never uses the word 'speed' at all", () => {
  const question = SOURCE_CONTENT["mock-mr10-bustimetable-04"].question;
  assert.ok(!/\bspeed\b/i.test(question), "the word 'speed' must not appear anywhere in the corrected wording, removing the ambiguous reading entirely");
});

test("MATH: 35-minute journey time reduced by 20% gives 28 minutes, via two independent methods, matching the stored answer", () => {
  const journeyTime = 35;
  const reduction = journeyTime * 0.2;
  assert.equal(journeyTime - reduction, 28);
  assert.equal(journeyTime * 0.8, 28);
  assert.equal(SOURCE_CONTENT["mock-mr10-bustimetable-04"].answer, "28");
});

test("MATH: the rejected 'increase speed by 20%' misreading gives a genuinely different value (~29.17), confirming the wording ambiguity was real before correction and is now closed", () => {
  const speedIncreaseResult = 35 / 1.2;
  assert.ok(Math.abs(speedIncreaseResult - 29.1667) < 0.001);
  assert.notEqual(Math.round(speedIncreaseResult), 28);
});

test("sharedStem, answer, and stimulus are unaffected by the wording fix -- only the question tail changed", () => {
  const entry = SOURCE_CONTENT["mock-mr10-bustimetable-04"];
  assert.equal(entry.sharedStem, "A bus company runs a route from Hillview to Oakford, stopping at Milltown and Riverside. The timetable below shows the morning and afternoon journey times.");
  assert.equal(entry.answer, "28");
  assert.ok(entry.question.startsWith(entry.sharedStem), "corrected question must still start with the exact sharedStem, preserving shared-stem rendering");
});

test("no other Bus Timetable subpart's cached content was touched by this fix", () => {
  assert.equal(SOURCE_CONTENT["mock-mr10-bustimetable-01"].question, "A bus company runs a route from Hillview to Oakford, stopping at Milltown and Riverside. The timetable below shows the morning and afternoon journey times. How many minutes does the morning bus take to travel from Hillview to Oakford?");
  assert.equal(SOURCE_CONTENT["mock-mr10-bustimetable-01"].answer, "95");
  assert.equal(SOURCE_CONTENT["mock-mr10-bustimetable-02"].answer, "7");
  assert.equal(SOURCE_CONTENT["mock-mr10-bustimetable-03"].answer, "370");
});
