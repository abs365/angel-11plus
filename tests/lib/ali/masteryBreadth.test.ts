import { test } from "node:test";
import assert from "node:assert/strict";
import { validateCompetencyMastery, MIN_DISTINCT_STRUCTURES } from "@/lib/ali/masteryValidation";
import type { QuestionEvidenceInput } from "@/types/ali/confidence";

/**
 * CSSE Completion, Workstream 6: "Mastery must not be achievable merely by remembering the same question."
 * Competency mastery is validated only when the mastery threshold is met in at least
 * MIN_DISTINCT_STRUCTURES different question families (or every family that exists, if fewer).
 */
const q = (id: string, family: string | null, sessions: number, extra: Partial<QuestionEvidenceInput> = {}): QuestionEvidenceInput => ({
  questionId: id, timesSeen: sessions, distinctCorrectSessions: sessions, masteryThreshold: 2, confidenceWeight: 1, familyId: family, ...extra,
});

test("one question mastered many times is NOT validated mastery when other families exist", () => {
  const r = validateCompetencyMastery({ competencyCode: "MR-01", questions: [q("a", "f1", 6), q("b", "f2", 0), q("c", "f3", 0)] });
  assert.equal(r.thresholdMet, false);
  assert.equal(r.validated, false);
});

test("two questions from the SAME family do not count as varied structure", () => {
  const r = validateCompetencyMastery({ competencyCode: "MR-01", questions: [q("a", "f1", 2), q("b", "f1", 2), q("c", "f2", 0)] });
  assert.equal(r.validated, false);
});

test("threshold met in two different families validates", () => {
  const r = validateCompetencyMastery({ competencyCode: "MR-01", questions: [q("a", "f1", 2), q("b", "f2", 2), q("c", "f3", 0)] });
  assert.equal(MIN_DISTINCT_STRUCTURES, 2);
  assert.equal(r.thresholdMet, true);
  assert.equal(r.validated, true);
});

test("a single-family pool needs two DISTINCT skeletons: the same stem with new numbers counts once", () => {
  const sk = (id: string, key: string, sessions: number) => q(id, "only", sessions, { skeletonKey: key });
  const sameSkeleton = validateCompetencyMastery({ competencyCode: "X", questions: [sk("a", "cost of # then #", 2), sk("b", "cost of # then #", 2)] });
  assert.equal(sameSkeleton.validated, false);
  assert.equal(sameSkeleton.grade, "developing");
  const differentSkeletons = validateCompetencyMastery({ competencyCode: "X", questions: [sk("a", "cost of # then #", 2), sk("b", "reverse the percentage #", 2)] });
  assert.equal(differentSkeletons.validated, true);
});

test("a pool that can never offer two structures stays DEVELOPING, never validated (provisional, not durable)", () => {
  const r = validateCompetencyMastery({ competencyCode: "X", questions: [q("a", "only", 5, { skeletonKey: "s" })] });
  assert.equal(r.validated, false);
  assert.equal(r.grade, "developing");
});

test("grade distinguishes none / developing / validated and exposes the breadth used", () => {
  assert.equal(validateCompetencyMastery({ competencyCode: "X", questions: [q("a", "f1", 0), q("b", "f2", 0)] }).grade, "none");
  const dev = validateCompetencyMastery({ competencyCode: "X", questions: [q("a", "f1", 3), q("b", "f2", 0)] });
  assert.equal(dev.grade, "developing");
  assert.deepEqual(dev.breadth, { familiesMet: 1, skeletonsMet: 1, familiesInPool: 2, familiesRequired: 2 });
  assert.equal(validateCompetencyMastery({ competencyCode: "X", questions: [q("a", "f1", 2), q("b", "f2", 2)] }).grade, "validated");
});

test("supported-correct answers never reach the breadth check: a question only counts once its independent sessions meet the threshold", () => {
  // distinctCorrectSessions is independent-only by construction (lib/ali/mastery.ts applyAttemptOutcome).
  const r = validateCompetencyMastery({ competencyCode: "X", questions: [q("a", "f1", 1), q("b", "f2", 1)] });
  assert.equal(r.validated, false);
});

test("questions without a family count as their own structure", () => {
  const r = validateCompetencyMastery({ competencyCode: "X", questions: [q("a", null, 2), q("b", null, 2)] });
  assert.equal(r.validated, true);
});

test("guessable-format evidence is still capped regardless of breadth (existing rule preserved)", () => {
  const r = validateCompetencyMastery({
    competencyCode: "X",
    questions: [q("a", "f1", 2, { confidenceWeight: 0.5 }), q("b", "f2", 2, { confidenceWeight: 0.5 })],
  });
  assert.equal(r.validated, false);
});
