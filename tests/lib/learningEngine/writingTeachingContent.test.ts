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

test("Educational Depth Phase 1 Wave 2: exactly two task families are implemented (picture-narrative added, its image-asset blocker resolved)", () => {
  assert.deepEqual(Object.keys(WRITING_FAMILY_TEACHING_CONTENT), ["writing-reflective-discursive", "writing-picture-narrative"]);
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

// === Programme Completion Increment 006, item 2: proof of the composed
// path, not merely the mapping function in isolation. This is exactly
// what WritingActivity computes (app/learning-intelligence/practice/
// [area]/page.tsx: `getWritingTeachingContent(getWritingTaskFamilyForPromptType(prompt.type))`)
// for a real stored prompt's `type` field. Before this increment's fix,
// every one of these returned `undefined` for every real prompt in the
// bank -- the worked-example/planning-scaffold panel could never render.

test("Increment 006 proof: a real 'narrative'-typed prompt (e.g. eng-inc003-writing-imaginedplace-01, eng-pc003-writing-difficulttask, eng-pc005-writing-somethingnew) now receives the actual writing-reflective-discursive scaffold via the real composed call, not undefined", () => {
  const family = getWritingTaskFamilyForPromptType("narrative");
  const content = getWritingTeachingContent(family);
  assert.notEqual(content, undefined);
  assert.equal(content!.model.whatToNotice.length > 0, true);
  assert.equal(content!.planningScaffold.length >= 3, true);
});

test("Increment 006 proof: a real 'descriptive'-typed prompt (e.g. mock-writing-mindchange-01, eng-inc003-writing-favouriteplace-01, eng-pc003-writing-meaningfulplace) now receives the actual scaffold via the real composed call, not undefined", () => {
  const family = getWritingTaskFamilyForPromptType("descriptive");
  const content = getWritingTeachingContent(family);
  assert.notEqual(content, undefined);
  assert.equal(content!.model.whatToNotice.length > 0, true);
  assert.equal(content!.planningScaffold.length >= 3, true);
});

test("Increment 006 proof: the one 'persuasive'-typed prompt (wrt-003, provisional forced fit) still correctly receives no scaffold via the real composed call -- the fix widens coverage to real evidenced types, it does not remove the persuasive exclusion", () => {
  const family = getWritingTaskFamilyForPromptType("persuasive");
  const content = getWritingTeachingContent(family);
  assert.equal(content, undefined);
});

// === Educational Depth Phase 1, Wave 2 — picture-narrative teaching content.

test("getWritingTaskFamilyForPromptType maps 'picture-narrative' to its OWN family, not the reflective/discursive one -- the two genres need genuinely different scaffolds", () => {
  assert.equal(getWritingTaskFamilyForPromptType("picture-narrative"), "writing-picture-narrative");
  assert.notEqual(getWritingTaskFamilyForPromptType("picture-narrative"), getWritingTaskFamilyForPromptType("narrative"));
});

test("regression: adding 'picture-narrative' does not change what 'narrative' or 'descriptive' resolve to -- every real live QT-WC-01a row must keep receiving the same teaching content as before this Wave", () => {
  assert.equal(getWritingTaskFamilyForPromptType("narrative"), "writing-reflective-discursive");
  assert.equal(getWritingTaskFamilyForPromptType("descriptive"), "writing-reflective-discursive");
});

test("picture-narrative's planning scaffold is genuinely different from reflective-discursive's, not the same 4 questions relabelled", () => {
  const picture = getWritingTeachingContent("writing-picture-narrative")!;
  const reflective = getWritingTeachingContent("writing-reflective-discursive")!;
  const pictureQuestions = new Set(picture.planningScaffold.map((q) => q.question));
  const reflectiveQuestions = new Set(reflective.planningScaffold.map((q) => q.question));
  for (const q of pictureQuestions) assert.equal(reflectiveQuestions.has(q), false, `picture-narrative scaffold question must not be copied verbatim from reflective-discursive: "${q}"`);
});

test("the picture-narrative MODEL's worked topic and opening do not collide with the real Practice prompt it will sit alongside (migration 255's riverboat prompt) -- the model must teach the METHOD, never rehearse the live task's own answer", () => {
  const content = getWritingTeachingContent("writing-picture-narrative")!;
  const livePracticePrompt = "Write a story based on the picture below.";
  const liveAltText = "A small wooden rowing boat rests on a misty riverbank at dawn. Its oars lie across the bench seats, and a rope trails loosely into the still water. A bicycle leans against a nearby willow tree, and pale morning light glows through drifting mist over the river.";
  assert.equal(looksLikeTemplateOrCopied(content.model.workedOpening, liveAltText), false);
  assert.equal(looksLikeTemplateOrCopied(content.model.topic, liveAltText), false);
  assert.equal(looksLikeTemplateOrCopied(content.model.workedOpening, livePracticePrompt), false);
});

test("the picture-narrative MODEL does not collide with Mock's own Q2 picture (the old shed, migration 246) either -- Mock content must never leak into, or be rehearsed by, Practice's teaching", () => {
  const content = getWritingTeachingContent("writing-picture-narrative")!;
  const mockAltText = "An old, weathered wooden shed stands at the edge of an overgrown garden in the late afternoon. Its door is slightly open, long grass and a climbing plant have grown up around its base, and a large tree stands beside it under a warm, softening sky.";
  assert.equal(looksLikeTemplateOrCopied(content.model.workedOpening, mockAltText), false);
  assert.equal(looksLikeTemplateOrCopied(content.model.topic, mockAltText), false);
});
