import { test } from "node:test";
import assert from "node:assert/strict";
import type { BankQuestion } from "@/types/ali/questionBank";
import { validateManifest } from "@/lib/ali/mockComposition";
import { renderFounderReviewReport } from "@/lib/ali/mockCompositionReport";

function makeQuestion(overrides: Partial<BankQuestion> & { id: string }): BankQuestion {
  return {
    subject: "maths",
    skill: "QT-MR-01",
    pathway: ["csse"],
    contentDifficulty: "medium",
    questionType: "short-answer",
    estimatedTimeSeconds: 90,
    prompt: { id: overrides.id, question: `Question text for ${overrides.id}`, answer: "42", marks: 1, skill: "arithmetic" } as unknown as BankQuestion["prompt"],
    explanation: "explanation",
    confidenceWeight: 1,
    revisionPriority: 3,
    masteryThreshold: 1,
    usageCount: 0,
    avgSuccessRate: null,
    learningUnitId: overrides.id,
    familyId: overrides.id,
    provenance: "angel_original",
    eligibilityStatus: "mock_eligible",
    active: true,
    ...overrides,
  };
}

const STEM = "A shop sells widgets.";

const GROUPED = [
  makeQuestion({
    id: "grp-1",
    familyId: "widget-family",
    questionGroupId: "grp",
    groupOrder: 1,
    subpartLabel: "(a)",
    contentDifficulty: "easy",
    prompt: { id: "grp-1", question: `${STEM} How many widgets in a box of 4 boxes of 10?`, answer: "40", marks: 1, skill: "arithmetic", sharedStem: STEM } as unknown as BankQuestion["prompt"],
  }),
  makeQuestion({
    id: "grp-2",
    familyId: "widget-family",
    questionGroupId: "grp",
    groupOrder: 2,
    subpartLabel: "(b)",
    contentDifficulty: "hard",
    prompt: {
      id: "grp-2",
      question: `${STEM} If 15% are defective, how many are not?`,
      answer: "34",
      marks: 2,
      skill: "arithmetic",
      sharedStem: STEM,
      stimulus: { type: "table", caption: "Widget stock", headers: ["Box", "Count"], rows: [["1", "10"], ["2", "10"]] },
    } as unknown as BankQuestion["prompt"],
  }),
];

const STANDALONE = makeQuestion({ id: "standalone-1", prompt: { id: "standalone-1", question: "What is 2+2?", answer: "4", marks: 1, skill: "arithmetic" } as unknown as BankQuestion["prompt"] });

const POOL: BankQuestion[] = [...GROUPED, STANDALONE];

test("renderFounderReviewReport: a valid candidate renders VALID, correct totals, and every numbered question in order", () => {
  const ids = [...GROUPED.map((q) => q.id), STANDALONE.id];
  const report = validateManifest(ids, POOL, "maths", "csse");
  const text = renderFounderReviewReport(ids, POOL, report, { title: "Candidate A", targetExperienceCount: 20 });
  assert.match(text, /Validation: VALID/);
  assert.match(text, /Total marks: 4/);
  assert.match(text, /Numbered-question count: 2/);
  assert.match(text, /1\. \[grp\]/);
  assert.match(text, /2\. \[standalone-1\]/);
});

test("renderFounderReviewReport: renders the grouped family's shared stem once, and each subpart's own remaining tail (not the full repeated question text)", () => {
  const ids = GROUPED.map((q) => q.id);
  const report = validateManifest(ids, POOL, "maths", "csse");
  const text = renderFounderReviewReport(ids, POOL, report, { title: "Candidate", targetExperienceCount: 1 });
  assert.match(text, /Shared stem: A shop sells widgets\./);
  assert.match(text, /\(a\) How many widgets in a box of 4 boxes of 10\?/);
  assert.match(text, /\(b\) If 15% are defective, how many are not\?/);
  assert.ok(!text.includes("A shop sells widgets. A shop sells widgets."), "the shared stem must not be repeated per subpart");
});

test("renderFounderReviewReport: renders the group's stimulus table", () => {
  const ids = GROUPED.map((q) => q.id);
  const report = validateManifest(ids, POOL, "maths", "csse");
  const text = renderFounderReviewReport(ids, POOL, report, { title: "Candidate", targetExperienceCount: 1 });
  assert.match(text, /Stimulus:/);
  assert.match(text, /Widget stock/);
  assert.match(text, /Box \| Count/);
});

test("renderFounderReviewReport: an invalid candidate renders INVALID with every failure listed", () => {
  const ids = [GROUPED[0].id]; // partial group
  const report = validateManifest(ids, POOL, "maths", "csse");
  const text = renderFounderReviewReport(ids, POOL, report, { title: "Bad Candidate", targetExperienceCount: 1 });
  assert.match(text, /Validation: INVALID/);
  assert.match(text, /partial_grouped_family/);
});

test("renderFounderReviewReport: difficulty and skill distributions appear in the report text", () => {
  const ids = [...GROUPED.map((q) => q.id), STANDALONE.id];
  const report = validateManifest(ids, POOL, "maths", "csse");
  const text = renderFounderReviewReport(ids, POOL, report, { title: "Candidate", targetExperienceCount: 20 });
  assert.match(text, /Difficulty distribution: easy=1 medium=1 hard=1 challenge=0/);
  assert.match(text, /Skill\/archetype distribution: QT-MR-01=2/);
});

test("renderFounderReviewReport: shows marks and difficulty per numbered question, not just totals", () => {
  const ids = [...GROUPED.map((q) => q.id), STANDALONE.id];
  const report = validateManifest(ids, POOL, "maths", "csse");
  const text = renderFounderReviewReport(ids, POOL, report, { title: "Candidate", targetExperienceCount: 20 });
  assert.match(text, /marks=3 difficulty=easy\/hard/);
  assert.match(text, /marks=1 difficulty=medium/);
});
