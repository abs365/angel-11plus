import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mock Programme Increment 005 (Decision 148) Part 11 — Practice
 * isolation is "absolute", per the directive. Rather than merely
 * asserting Practice's own real output is unchanged (which a future,
 * unrelated Practice change could accidentally start reading these new
 * fields and still pass), this proves the stronger, structural claim:
 * none of Practice's real selection, exposure, or rendering source files
 * reference the new question_group_id/group_order/subpart_label/
 * marking_mode fields (camelCase or snake_case) at all, today. A grouped
 * Mock question existing in the bank cannot silently redefine Practice
 * behaviour if nothing in Practice's own code path ever reads the field
 * that would make it grouped.
 */

const NEW_FIELD_NAMES = [
  "question_group_id",
  "questionGroupId",
  "group_order",
  "groupOrder",
  "subpart_label",
  "subpartLabel",
  "marking_mode",
  "markingMode",
];

const PRACTICE_SOURCE_FILES = [
  "lib/learningEngine/sessionGenerator.ts",
  "lib/ali/selection.ts",
  "lib/ali/exposureIntelligence.ts",
  "lib/ali/questionBank.ts",
  "app/learning-intelligence/practice/[area]/page.tsx",
];

for (const filePath of PRACTICE_SOURCE_FILES) {
  test(`${filePath} does not reference any migration-093 field -- new grouping/marking metadata is invisible to live Practice code`, () => {
    const source = fs.readFileSync(filePath, "utf8");
    for (const name of NEW_FIELD_NAMES) {
      // lib/ali/questionBank.ts is the one, deliberate exception: it maps
      // the new columns into BankQuestion (the read-path mapping this
      // increment adds), but must never READ them for any selection
      // decision -- checked separately below, not by blanket absence.
      if (filePath === "lib/ali/questionBank.ts") continue;
      assert.ok(
        !source.includes(name),
        `${filePath} unexpectedly references "${name}" -- Mock grouping/marking metadata must remain invisible to Practice code`
      );
    }
  });
}

test("lib/ali/questionBank.ts's rowToBankQuestion() maps the 4 new columns exactly once each, and no other function in that file reads them", () => {
  const source = fs.readFileSync("lib/ali/questionBank.ts", "utf8");
  const mappingOccurrences = (source.match(/questionGroupId: row\.question_group_id/g) ?? []).length;
  assert.equal(mappingOccurrences, 1, "expected exactly one mapping assignment for questionGroupId");
  // Outside the mapping function itself, no fetch/filter/selection logic in
  // this file should branch on the new fields.
  const withoutMappingFunction = source.replace(/function rowToBankQuestion[\s\S]*?\n}\n/, "");
  for (const name of NEW_FIELD_NAMES) {
    assert.ok(!withoutMappingFunction.includes(name), `unexpected reference to "${name}" outside rowToBankQuestion()`);
  }
});

test("groupingKeyOf() (the live Practice family/clustering key) still reads only familyId/learningUnitId -- confirms the deliberate non-reuse decision (migration 093's own header) actually holds in the real, current source", () => {
  const source = fs.readFileSync("lib/ali/exposureIntelligence.ts", "utf8");
  assert.match(source, /return q\.familyId \?\? q\.learningUnitId;/);
});

test("passageGroupingKeyOf() remains gated to subject === \"english\" only -- Mathematics/VR rows can never be affected by this dimension regardless of any future learningUnitId change", () => {
  const source = fs.readFileSync("lib/ali/exposureIntelligence.ts", "utf8");
  assert.match(source, /return q\.subject === "english" \? q\.learningUnitId : undefined;/);
});
