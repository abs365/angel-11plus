import { test } from "node:test";
import assert from "node:assert/strict";
import {
  WRITING_FAMILY_TEACHING_CONTENT, getWritingTeachingContent, getWritingTaskFamilyForPromptType,
} from "../../../lib/learningEngine/writingTeachingContent";
import { looksLikeTemplateOrCopied } from "../../../lib/learningEngine/writingRubric";

/**
 * CSSE Completion Programme, Phase D — mirrors the discipline
 * lib/learningEngine/mathsTeachingContent.ts's own test suite already
 * established for Mathematics (Educational Increment 007L/007M): the
 * MODEL must never leak or overlap the live prompt it could plausibly
 * sit alongside, and every family must have real, non-empty content.
 */

test("exactly one task family is implemented this phase (picture-narrative deferred, needs an image asset)", () => {
  assert.deepEqual(Object.keys(WRITING_FAMILY_TEACHING_CONTENT), ["writing-reflective-discursive"]);
});

test("getWritingTeachingContent returns undefined for an unimplemented family and for no family", () => {
  assert.equal(getWritingTeachingContent(undefined), undefined);
  assert.equal(getWritingTeachingContent(null), undefined);
});

test("every implemented family has real, non-empty MODEL and planning content", () => {
  for (const [family, content] of Object.entries(WRITING_FAMILY_TEACHING_CONTENT)) {
    assert.ok(content.model.whatToNotice.length > 0, `${family} MODEL whatToNotice must be non-empty`);
    assert.ok(content.model.approach.length > 0, `${family} MODEL approach must be non-empty`);
    assert.ok(content.model.topic.length > 0, `${family} MODEL topic must be non-empty`);
    assert.ok(content.model.workedOpening.length > 0, `${family} MODEL workedOpening must be non-empty`);
    assert.ok(content.model.reasoning.length > 0, `${family} MODEL reasoning must be non-empty`);
    assert.ok(content.planningScaffold.length >= 3, `${family} planning scaffold should have at least 3 structuring questions`);
    assert.ok(content.commonMisconception.length > 0, `${family} commonMisconception must be non-empty`);
  }
});

test("the MODEL worked opening does not collide with the one real live Writing row's own prompt (wrt-003, a persuasive-speech topic about smartphones in school)", () => {
  const content = getWritingTeachingContent("writing-reflective-discursive")!;
  const liveWrt003Prompt = "Write a persuasive speech to be delivered to your school's headteacher, arguing either FOR or AGAINST a total ban on smartphones in school. Your speech must be confident, well-reasoned, and persuasive. Use at least three strong arguments.";
  assert.equal(looksLikeTemplateOrCopied(content.model.workedOpening, liveWrt003Prompt), false);
  assert.equal(looksLikeTemplateOrCopied(content.model.topic, liveWrt003Prompt), false);
});

test("Programme Completion Increment 005 correction: getWritingTaskFamilyForPromptType maps the REAL WritingPrompt.type values (narrative, descriptive) to the implemented family -- 'reflective'/'discursive' are not valid WritingPrompt.type values and no stored prompt can ever carry them", () => {
  assert.equal(getWritingTaskFamilyForPromptType("narrative"), "writing-reflective-discursive");
  assert.equal(getWritingTaskFamilyForPromptType("descriptive"), "writing-reflective-discursive");
});

test("getWritingTaskFamilyForPromptType correctly returns undefined for 'persuasive' -- the one provisional, forced-fit Writing row's real type (wrt-003), not a confirmed CSSE-evidenced genre, so no CSSE-aligned teaching content is falsely attached to it", () => {
  assert.equal(getWritingTaskFamilyForPromptType("persuasive"), undefined);
});

test("getWritingTaskFamilyForPromptType returns undefined for an arbitrary/unrecognised type string, never a false-positive match", () => {
  assert.equal(getWritingTaskFamilyForPromptType("something-unrecognised"), undefined);
});

test("getWritingTaskFamilyForPromptType handles missing/empty input safely", () => {
  assert.equal(getWritingTaskFamilyForPromptType(undefined), undefined);
  assert.equal(getWritingTaskFamilyForPromptType(null), undefined);
  assert.equal(getWritingTaskFamilyForPromptType(""), undefined);
});
