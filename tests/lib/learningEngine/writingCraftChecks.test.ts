import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { WRITING_CRAFT_CHECKS } from "@/lib/learningEngine/writingTeachingContent";
import { WRITING_DIMENSIONS } from "@/lib/learningEngine/writingRubric";

test("the craft checks cover every skill the Writing programme names, mapped onto the existing five dimensions only", () => {
  const skills = WRITING_CRAFT_CHECKS.map((c) => c.skill);
  for (const required of ["Interpreting the task", "Ideas", "Structure", "Vocabulary", "Sentence construction", "Grammar", "Punctuation", "Spelling", "Revising"]) {
    assert.ok(skills.includes(required), `missing ${required}`);
  }
  for (const c of WRITING_CRAFT_CHECKS) assert.ok((WRITING_DIMENSIONS as string[]).includes(c.dimension), `${c.skill} uses an unknown dimension`);
  for (const d of WRITING_DIMENSIONS) assert.ok(WRITING_CRAFT_CHECKS.some((c) => c.dimension === d), `dimension ${d} has no craft check`);
});

test("craft checks are plain, child-readable instructions: no scores, mastery or AI claims", () => {
  for (const c of WRITING_CRAFT_CHECKS) {
    assert.ok(c.check.length > 30 && c.check.length < 220, c.skill);
    assert.doesNotMatch(c.check, /\b(score|scores|marked|mastery|AI|CSSE|band)\b/i, c.skill);
  }
});

test("they are shown with the worked model before submitting, and no post-feedback revision loop is claimed in the UI", () => {
  const page = fs.readFileSync("app/learning-intelligence/practice/[area]/page.tsx", "utf8");
  assert.match(page, /WRITING_CRAFT_CHECKS\.map\(\(c\) => /);
  assert.match(page, /Check your writing before you finish:/);
  const src = fs.readFileSync("lib/learningEngine/writingTeachingContent.ts", "utf8");
  assert.match(src, /Not claimed: a post-feedback revision loop/);
});
