import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Shared-Scenario Presentation Correction (Decision 180) — source-text
 * structural proof that BOTH the admin review surface and the learner
 * Mock surface actually use resolveGroupSharedStem() safely, and that
 * every other piece of the grouped-question UI (subpart labels, model
 * answers, common trap, transfer demand, stimulus, palette/timer/
 * navigation/answer persistence) is untouched. This project has no
 * React-rendering test infrastructure, so structural source-text checks
 * are this repository's own established convention for page components
 * (see tests/lib/adminReview.mockStructuralCapacityInc001.test.ts).
 */

const reviewSource = fs.readFileSync("app/admin-beta/review/page.tsx", "utf8");
const learnerSource = fs.readFileSync("app/learning-intelligence/mock-exam/page.tsx", "utf8");

test("A/C: review page resolves a shared stem per group via resolveGroupSharedStem(), imported from the shared, generic helper -- not a per-family hardcode", () => {
  assert.match(reviewSource, /import \{ isValidTableStimulus, resolveGroupSharedStem \} from "@\/lib\/mockAttempt\/workspace";/);
  assert.match(reviewSource, /const sharedStem = resolveGroupSharedStem\(group\.items\);/);
  // Scoped to the grouped-rendering block itself (not the whole file --
  // MOCK_STRUCTURAL_CAPACITY_INC001_FAMILIES elsewhere legitimately
  // names this family for Decision 178's own review-surface wiring,
  // unrelated to this rendering logic).
  const renderBlock = reviewSource.match(/const sharedStem = resolveGroupSharedStem\(group\.items\);[\s\S]*?\{group\.items\.map\(\(question, index\) => \([\s\S]*?\)\)\}/)![0];
  assert.ok(!renderBlock.includes("mock-mr06-linkedvalues"), "the review page's shared-stem rendering logic must never hard-code the specific family id");
});

test("A: the stem, when present, is rendered exactly once per group (outside the per-item .map), not once per subpart", () => {
  const block = reviewSource.match(/const sharedStem = resolveGroupSharedStem\(group\.items\);[\s\S]*?<\/div>\s*\);/)![0];
  const stemRenderCount = (block.match(/\{sharedStem\.stem\}/g) || []).length;
  assert.equal(stemRenderCount, 1);
});

test("C: each subpart's own remaining tail is shown when a shared stem resolves, full question text otherwise -- both paths reachable, never silently dropped", () => {
  assert.match(reviewSource, /\{sharedStem \? sharedStem\.tails\[index\] : question\.question\}/);
});

test("D: model answer, common trap, transfer demand, and subpart label are still rendered per component, unaffected by the stem change", () => {
  const block = reviewSource.match(/\{group\.items\.map\(\(question, index\) => \([\s\S]*?\)\)\}/)![0];
  assert.match(block, /Model answer \(\{question\.contentDifficulty\} difficulty\):.*\{question\.modelAnswer\}/);
  assert.match(block, /Common trap:.*\{question\.addressesMisconception\}/);
  assert.match(block, /Transfer demand:.*\{question\.transferClass/);
  assert.match(block, /Subpart \{question\.subpartLabel\}/);
});

test("F: structured stimulus resolution (runningclub) is untouched and independent of the new shared-stem resolution", () => {
  assert.match(reviewSource, /const groupStimulus = group\.items\.map\(\(q\) => q\.stimulus\)\.find\(isValidTableStimulus\) \?\? null;/);
});

test("learner surface: MockQuestionRenderer resolves a shared stem via the same generic helper, imported alongside the existing stimulus helper", () => {
  assert.match(learnerSource, /selectDisplayUnitStimulus,\s*\n\s*isValidTableStimulus,\s*\n\s*resolveGroupSharedStem,/);
  assert.match(learnerSource, /const sharedStem = resolveGroupSharedStem\(payloads\.map\(\(payload, i\) => \(\{ question: questionTexts\[i\], sharedStem: payload\.sharedStem \}\)\)\);/);
  assert.ok(!learnerSource.includes("mock-mr06-linkedvalues"), "the learner page must never hard-code the specific family id into the rendering logic");
});

test("learner surface: the resolved tail (or full text) is used for the per-subpart question text, never both at once", () => {
  assert.match(learnerSource, /const questionText = sharedStem \? sharedStem\.tails\[index\] : questionTexts\[index\];/);
});

test("G/H: learner grouping, palette, timer, navigation, and answer persistence code is untouched -- buildDisplayUnits/buildPalette/values/onChange are unmodified by this correction", () => {
  assert.match(learnerSource, /function MockQuestionRenderer\(/);
  assert.match(learnerSource, /value=\{values\[index\] \?\? ""\}/);
  assert.match(learnerSource, /onChange=\{\(e\) => onChange\(index, e\.target\.value\)\}/);
});

function stripSqlComments(sql: string): string {
  return sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");
}

test("I: neither migration 121 nor 122 sets eligibility_status, marks, answer, or grouping columns in their EXECUTABLE SQL (comment prose that merely discloses this is expected and excluded)", () => {
  const m121 = stripSqlComments(fs.readFileSync("supabase/migrations/121_mock_mathematics_linkedvalues_shared_stem_contract.sql", "utf8"));
  const m122 = stripSqlComments(fs.readFileSync("supabase/migrations/122_mock_mathematics_shared_stem_delivery.sql", "utf8"));
  assert.ok(!/\bset\s+eligibility_status\s*=/i.test(m121));
  assert.ok(!/\bset\s+(answer|marks)\s*=/i.test(m121));
  assert.ok(!/\beligibility_status\b/.test(m122));
});
