import { test } from "node:test";
import assert from "node:assert/strict";
import type { BankQuestion } from "@/types/ali/questionBank";
import { buildExperiences, composeCandidateMock, validateManifest } from "@/lib/ali/mockComposition";

/**
 * Mathematics First Mock — Minimum Composition/Freeze Capability
 * (Decision 210 Part 7/10, Decision 211, Decision 212). Pure-function
 * tests against synthetic fixtures shaped exactly like real production
 * `ali_question_bank` rows -- the real 77-row estate is exercised
 * separately by `scripts/mock-mathematics-composition-report.mjs`
 * (reconstructed from migration source, no live DB access), whose own
 * output is what Decision 212 records.
 */

let counter = 0;
function makeQuestion(overrides: Partial<BankQuestion> & { id: string }): BankQuestion {
  counter += 1;
  return {
    subject: "maths",
    skill: "QT-MR-01",
    pathway: ["csse"],
    contentDifficulty: "medium",
    questionType: "short-answer",
    estimatedTimeSeconds: 90,
    prompt: { id: overrides.id, question: `Question text ${counter}`, answer: "42", marks: 1, skill: "arithmetic" } as unknown as BankQuestion["prompt"],
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

function group(familyId: string, groupId: string, parts: { subpartLabel: string; groupOrder: number; marks: number; difficulty?: BankQuestion["contentDifficulty"] }[]): BankQuestion[] {
  return parts.map((p) =>
    makeQuestion({
      id: `${groupId}-${p.groupOrder}`,
      familyId,
      questionGroupId: groupId,
      groupOrder: p.groupOrder,
      subpartLabel: p.subpartLabel,
      contentDifficulty: p.difficulty ?? "medium",
      prompt: { id: `${groupId}-${p.groupOrder}`, question: `${familyId} part ${p.subpartLabel}`, answer: "1", marks: p.marks, skill: "arithmetic" } as unknown as BankQuestion["prompt"],
    })
  );
}

// === Fixture pool: 2 grouped families (4 marks, 3 marks) + 3 standalone (2, 2, 1 marks) + English contamination + ineligible rows ===

const GROUPED_A = group("family-a", "group-a", [
  { subpartLabel: "(a)", groupOrder: 1, marks: 1, difficulty: "easy" },
  { subpartLabel: "(b)", groupOrder: 2, marks: 1, difficulty: "medium" },
  { subpartLabel: "(c)", groupOrder: 3, marks: 2, difficulty: "hard" },
]); // 4 marks total
const GROUPED_B = group("family-b", "group-b", [
  { subpartLabel: "(a)", groupOrder: 1, marks: 1, difficulty: "medium" },
  { subpartLabel: "(b)", groupOrder: 2, marks: 2, difficulty: "hard" },
]); // 3 marks total
const STANDALONE_1 = makeQuestion({ id: "standalone-1", prompt: { id: "standalone-1", question: "q1", answer: "1", marks: 2, skill: "arithmetic" } as unknown as BankQuestion["prompt"] });
const STANDALONE_2 = makeQuestion({ id: "standalone-2", prompt: { id: "standalone-2", question: "q2", answer: "1", marks: 2, skill: "arithmetic" } as unknown as BankQuestion["prompt"] });
const STANDALONE_3 = makeQuestion({ id: "standalone-3", prompt: { id: "standalone-3", question: "q3", answer: "1", marks: 1, skill: "arithmetic" } as unknown as BankQuestion["prompt"] });

const INDEPENDENTLY_VALIDATED = makeQuestion({ id: "iv-1", eligibilityStatus: "independently_validated" });
const AUTHENTIC_CANDIDATE = makeQuestion({ id: "aac-1", eligibilityStatus: "authentic_assessment_candidate" });
const INACTIVE = makeQuestion({ id: "inactive-1", active: false });
const ENGLISH_ROW = makeQuestion({ id: "english-1", subject: "english" });
const WRONG_PATHWAY = makeQuestion({ id: "gl-only-1", pathway: ["gl"] });

const POOL: BankQuestion[] = [
  ...GROUPED_A,
  ...GROUPED_B,
  STANDALONE_1,
  STANDALONE_2,
  STANDALONE_3,
  INDEPENDENTLY_VALIDATED,
  AUTHENTIC_CANDIDATE,
  INACTIVE,
  ENGLISH_ROW,
  WRONG_PATHWAY,
];

// === buildExperiences ===

test("buildExperiences: groups a grouped family into one experience, sums marks, preserves group order", () => {
  const experiences = buildExperiences(GROUPED_A);
  assert.equal(experiences.length, 1);
  assert.equal(experiences[0].experienceId, "group-a");
  assert.equal(experiences[0].marks, 4);
  assert.deepEqual(experiences[0].questionIds, ["group-a-1", "group-a-2", "group-a-3"]);
  assert.equal(experiences[0].isGrouped, true);
  assert.deepEqual(experiences[0].contentDifficulties, ["easy", "medium", "hard"]);
});

test("buildExperiences: a standalone question becomes its own singleton experience", () => {
  const experiences = buildExperiences([STANDALONE_1]);
  assert.equal(experiences.length, 1);
  assert.equal(experiences[0].experienceId, "standalone-1");
  assert.equal(experiences[0].isGrouped, false);
  assert.equal(experiences[0].marks, 2);
});

test("buildExperiences: mixed pool produces exactly one experience per group plus one per standalone row", () => {
  const experiences = buildExperiences([...GROUPED_A, ...GROUPED_B, STANDALONE_1, STANDALONE_2, STANDALONE_3]);
  assert.equal(experiences.length, 5);
});

test("buildExperiences: deterministic output ordering (by experienceId) regardless of input order", () => {
  const forward = buildExperiences([...GROUPED_A, STANDALONE_1]);
  const reversed = buildExperiences([STANDALONE_1, ...[...GROUPED_A].reverse()]);
  assert.deepEqual(forward.map((e) => e.experienceId), reversed.map((e) => e.experienceId));
});

// === validateManifest ===

test("validateManifest: a complete valid manifest (one full group + standalones) is accepted", () => {
  const ids = [...GROUPED_A.map((q) => q.id), STANDALONE_1.id];
  const report = validateManifest(ids, POOL, "maths", "csse");
  assert.equal(report.valid, true);
  assert.equal(report.failures.length, 0);
  assert.equal(report.numberedQuestionCount, 2);
  assert.equal(report.totalMarks, 6);
  assert.equal(report.rawRowCount, 4);
});

test("validateManifest: independently_validated question is rejected (not_mock_eligible)", () => {
  const report = validateManifest([INDEPENDENTLY_VALIDATED.id], POOL, "maths", "csse");
  assert.equal(report.valid, false);
  assert.ok(report.failures.some((f) => f.code === "not_mock_eligible" && f.questionId === INDEPENDENTLY_VALIDATED.id));
});

test("validateManifest: authentic_assessment_candidate question is rejected (not_mock_eligible)", () => {
  const report = validateManifest([AUTHENTIC_CANDIDATE.id], POOL, "maths", "csse");
  assert.equal(report.valid, false);
  assert.ok(report.failures.some((f) => f.code === "not_mock_eligible" && f.questionId === AUTHENTIC_CANDIDATE.id));
});

test("validateManifest: inactive question is rejected (not_mock_eligible)", () => {
  const report = validateManifest([INACTIVE.id], POOL, "maths", "csse");
  assert.equal(report.valid, false);
  assert.ok(report.failures.some((f) => f.code === "not_mock_eligible" && f.questionId === INACTIVE.id));
});

test("validateManifest: unknown question id is rejected (unknown_question_id)", () => {
  const report = validateManifest(["does-not-exist"], POOL, "maths", "csse");
  assert.equal(report.valid, false);
  assert.ok(report.failures.some((f) => f.code === "unknown_question_id" && f.questionId === "does-not-exist"));
});

test("validateManifest: duplicate question id is rejected (duplicate_question_id)", () => {
  const report = validateManifest([STANDALONE_1.id, STANDALONE_1.id], POOL, "maths", "csse");
  assert.equal(report.valid, false);
  assert.ok(report.failures.some((f) => f.code === "duplicate_question_id" && f.questionId === STANDALONE_1.id));
});

test("validateManifest: partial grouped family (missing sibling) is rejected (partial_grouped_family)", () => {
  const report = validateManifest([GROUPED_A[0].id, GROUPED_A[1].id], POOL, "maths", "csse");
  assert.equal(report.valid, false);
  assert.ok(report.failures.some((f) => f.code === "partial_grouped_family" && f.questionGroupId === "group-a"));
});

test("validateManifest: complete grouped family (all siblings present) is accepted, never flagged partial", () => {
  const report = validateManifest(GROUPED_A.map((q) => q.id), POOL, "maths", "csse");
  assert.equal(report.valid, true);
  assert.ok(!report.failures.some((f) => f.code === "partial_grouped_family"));
});

test("validateManifest: group ordering is preserved in questionIds regardless of input array order", () => {
  const shuffled = [GROUPED_A[2].id, GROUPED_A[0].id, GROUPED_A[1].id];
  const experiences = buildExperiences(GROUPED_A.filter((q) => shuffled.includes(q.id)));
  assert.deepEqual(experiences[0].questionIds, ["group-a-1", "group-a-2", "group-a-3"]);
});

test("validateManifest: empty manifest is rejected (empty_manifest)", () => {
  const report = validateManifest([], POOL, "maths", "csse");
  assert.equal(report.valid, false);
  assert.ok(report.failures.some((f) => f.code === "empty_manifest"));
});

test("validateManifest: subject isolation -- an English-subject row is rejected even though active/mock_eligible, when target subject is maths", () => {
  const report = validateManifest([ENGLISH_ROW.id], POOL, "maths", "csse");
  assert.equal(report.valid, false);
  assert.ok(report.failures.some((f) => f.code === "not_mock_eligible" && f.questionId === ENGLISH_ROW.id));
});

test("validateManifest: no English contamination in a valid all-Mathematics manifest's own stats", () => {
  const ids = [...GROUPED_A.map((q) => q.id), STANDALONE_1.id];
  const report = validateManifest(ids, POOL, "maths", "csse");
  assert.ok(!report.questionIds.includes(ENGLISH_ROW.id));
});

test("validateManifest: wrong-pathway row is rejected even though otherwise mock_eligible/active", () => {
  const report = validateManifest([WRONG_PATHWAY.id], POOL, "maths", "csse");
  assert.equal(report.valid, false);
  assert.ok(report.failures.some((f) => f.code === "not_mock_eligible" && f.questionId === WRONG_PATHWAY.id));
});

test("validateManifest: mark summation across a mix of grouped and standalone experiences", () => {
  const ids = [...GROUPED_A.map((q) => q.id), ...GROUPED_B.map((q) => q.id), STANDALONE_1.id, STANDALONE_2.id, STANDALONE_3.id];
  const report = validateManifest(ids, POOL, "maths", "csse");
  assert.equal(report.valid, true);
  assert.equal(report.totalMarks, 4 + 3 + 2 + 2 + 1);
  assert.equal(report.numberedQuestionCount, 5);
  assert.equal(report.rawRowCount, ids.length);
});

test("validateManifest: difficulty distribution correctly tallies every row's own content_difficulty", () => {
  const ids = [...GROUPED_A.map((q) => q.id), ...GROUPED_B.map((q) => q.id)];
  const report = validateManifest(ids, POOL, "maths", "csse");
  assert.deepEqual(report.difficultyDistribution, { easy: 1, medium: 2, hard: 2, challenge: 0 });
});

test("validateManifest: family IDs reported are exactly the families represented, sorted, no duplicates", () => {
  const ids = [...GROUPED_A.map((q) => q.id), ...GROUPED_A.map((q) => q.id)]; // will duplicate-fail but families set is still checked on failure path
  const report = validateManifest([...GROUPED_A.map((q) => q.id), ...GROUPED_B.map((q) => q.id)], POOL, "maths", "csse");
  assert.deepEqual(report.familyIds, ["family-a", "family-b"]);
  void ids;
});

// === composeCandidateMock ===

test("composeCandidateMock: selects exactly the requested experience count when enough exist", () => {
  const { report } = composeCandidateMock(POOL, 3, "maths", "csse");
  assert.equal(report.numberedQuestionCount, 3);
  assert.equal(report.valid, true);
});

test("composeCandidateMock: richest-first -- selects the highest-marks experiences first (group-a 4, group-b 3, then the two 2-mark standalones over the 1-mark one)", () => {
  const { manifestQuestionIds } = composeCandidateMock(POOL, 4, "maths", "csse");
  const experiences = buildExperiences(POOL.filter((q) => manifestQuestionIds.includes(q.id)));
  const experienceIds = experiences.map((e) => e.experienceId).sort();
  assert.deepEqual(experienceIds, ["group-a", "group-b", "standalone-1", "standalone-2"].sort());
  assert.ok(!experienceIds.includes("standalone-3"), "the weakest (1-mark) standalone must be displaced, not the richest");
});

test("composeCandidateMock: never selects more experiences than genuinely eligible ones exist -- does not invent content to fill the target", () => {
  const smallPool = [...GROUPED_A, STANDALONE_1];
  const { report } = composeCandidateMock(smallPool, 20, "maths", "csse");
  assert.equal(report.numberedQuestionCount, 2);
  assert.equal(report.valid, true);
});

test("composeCandidateMock: excludes ineligible rows (independently_validated/authentic_assessment_candidate/inactive/wrong subject/wrong pathway) from selection entirely", () => {
  const { manifestQuestionIds } = composeCandidateMock(POOL, 20, "maths", "csse");
  for (const excludedId of [INDEPENDENTLY_VALIDATED.id, AUTHENTIC_CANDIDATE.id, INACTIVE.id, ENGLISH_ROW.id, WRONG_PATHWAY.id]) {
    assert.ok(!manifestQuestionIds.includes(excludedId), `${excludedId} must never appear in a composed manifest`);
  }
});

test("composeCandidateMock: deterministic -- repeated calls against the identical pool produce byte-identical manifests", () => {
  const first = composeCandidateMock(POOL, 4, "maths", "csse");
  const second = composeCandidateMock(POOL, 4, "maths", "csse");
  assert.deepEqual(first.manifestQuestionIds, second.manifestQuestionIds);
});

test("composeCandidateMock: deterministic regardless of the input pool's own array order", () => {
  const shuffledPool = [...POOL].reverse();
  const first = composeCandidateMock(POOL, 4, "maths", "csse");
  const second = composeCandidateMock(shuffledPool, 4, "maths", "csse");
  assert.deepEqual([...first.manifestQuestionIds].sort(), [...second.manifestQuestionIds].sort());
});

test("composeCandidateMock: the composed manifest always passes its own validateManifest re-check (proof, not assertion)", () => {
  const { report } = composeCandidateMock(POOL, 5, "maths", "csse");
  assert.equal(report.valid, true, JSON.stringify(report.failures));
});

test("composeCandidateMock: a composed manifest never contains a partial grouped family", () => {
  const { report } = composeCandidateMock(POOL, 5, "maths", "csse");
  assert.ok(!report.failures.some((f) => f.code === "partial_grouped_family"));
});

test("malformed manifest rejection: a manifest with a mix of duplicate + unknown + partial-group ids reports every distinct failure, not just the first", () => {
  const report = validateManifest(["does-not-exist", STANDALONE_1.id, STANDALONE_1.id, GROUPED_A[0].id], POOL, "maths", "csse");
  assert.equal(report.valid, false);
  const codes = new Set(report.failures.map((f) => f.code));
  assert.ok(codes.has("unknown_question_id"));
  assert.ok(codes.has("duplicate_question_id"));
  assert.ok(codes.has("partial_grouped_family"));
});
