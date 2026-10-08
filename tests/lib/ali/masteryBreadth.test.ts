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

test("a competency with only one family can still be validated (cannot demand structure that does not exist)", () => {
  const r = validateCompetencyMastery({ competencyCode: "X", questions: [q("a", "only", 2), q("b", "only", 0)] });
  assert.equal(r.validated, true);
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
