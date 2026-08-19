import { test } from "node:test";
import assert from "node:assert/strict";
import { humanizeSessionId } from "../../../lib/learningEngine/sessionLabel";

/**
 * Completion Assurance Programme, Completion C, Part 9 (A, B, C) —
 * humanizeSessionId() is the single boundary that converts an internal
 * UserProgress.completedLessons id into parent-facing copy. These tests
 * cover the actual root cause the external review found ("practice-
 * mathematics" leaking raw), its English/Writing siblings, the other real
 * internal ids this session independently found leaking through the same
 * mechanism, and a generic safety net for any future unknown id.
 */

test("A — a Mathematics Practice session (practice-mathematics, the exact id the external review found leaking) displays a human label, never the raw id", () => {
  const label = humanizeSessionId("practice-mathematics");
  assert.equal(label, "Mathematics Practice");
  assert.notEqual(label, "practice-mathematics");
});

test("B — the equivalent English Practice session displays appropriate English wording, not a raw id", () => {
  const label = humanizeSessionId("practice-reading-comprehension");
  assert.equal(label, "Reading Comprehension Practice");
  assert.notEqual(label, "practice-reading-comprehension");
});

test("B (continued) — the Writing Practice session also resolves to a human label", () => {
  assert.equal(humanizeSessionId("practice-continuous-writing"), "Continuous Writing Practice");
});

test("C — other real internal ids found leaking through the same lessonNames[id] ?? id mechanism now resolve to human labels", () => {
  const cases: [string, string][] = [
    ["eng-adaptive", "English Session"],
    ["vocab-adaptive", "Vocabulary Session"],
    ["verbal-reasoning", "Verbal Reasoning Session"],
    ["csse-founder-validation-assessment", "CSSE Assessment Session"],
  ];
  for (const [id, expected] of cases) {
    const label = humanizeSessionId(id);
    assert.equal(label, expected);
    assert.notEqual(label, id, `"${id}" must not render as its own raw id`);
  }
});

test("C (continued) — an unrecognised future id is never displayed as a raw hyphenated slug: the safety-net fallback title-cases it instead", () => {
  const label = humanizeSessionId("future-legacy-lesson-007");
  assert.equal(label, "Future Legacy Lesson 007");
  assert.ok(!label.includes("-"), "the fallback must never leave raw hyphens in learner-facing text");
});

test("existing curated English lesson titles are unaffected", () => {
  assert.equal(humanizeSessionId("eng-001"), "The Lighthouse Mystery");
  assert.equal(humanizeSessionId("writing-wrt-002"), "Writing Prompt 2");
  assert.equal(humanizeSessionId("mock-test"), "Full Mock Test");
});
