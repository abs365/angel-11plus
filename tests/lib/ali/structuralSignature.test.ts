import { test } from "node:test";
import assert from "node:assert/strict";
import { structuralSignature, bankQuestionSignature, findCrossFamilyCollisions } from "@/lib/ali/structuralSignature";
import type { BankQuestion } from "@/types/ali/questionBank";

/**
 * Question Factory Wave 1, Phase 1 — `lib/ali/structuralSignature.ts` had
 * zero test coverage before this file. Real behavioural tests over the
 * pure functions, proving the module's own documented scope: a
 * deterministic, non-semantic structural fingerprint, used to flag
 * cross-family collisions for human review, never same-family collisions
 * (which are expected).
 */

test("structuralSignature classifies answer form correctly across the documented categories", () => {
  assert.equal(structuralSignature({ skill: "QT-MR-01", answer: "42" }), "QT-MR-01|numeric|steps=0");
  assert.equal(structuralSignature({ skill: "QT-MR-02", answer: "true" }), "QT-MR-02|boolean|steps=0");
  assert.equal(structuralSignature({ skill: "QT-MR-03", answer: "3/4" }), "QT-MR-03|fraction|steps=0");
  assert.equal(structuralSignature({ skill: "QT-MR-04", answer: "45°" }), "QT-MR-04|degree|steps=0");
  assert.equal(structuralSignature({ skill: "QT-MR-05", answer: "x=1, y=2" }), "QT-MR-05|compound|steps=0");
  assert.equal(structuralSignature({ skill: "QT-RC-01", answer: "the sky" }), "QT-RC-01|text|steps=0");
});

test("structuralSignature counts working steps when supplied, 0 when absent", () => {
  assert.equal(structuralSignature({ skill: "QT-MR-01", answer: "42", workingSteps: ["a", "b", "c"] }), "QT-MR-01|numeric|steps=3");
  assert.equal(structuralSignature({ skill: "QT-MR-01", answer: "42" }), "QT-MR-01|numeric|steps=0");
});

function mathsBankQuestion(id: string, familyId: string, skill: string, answer: string): BankQuestion {
  return {
    id,
    subject: "maths",
    skill,
    pathway: ["csse"],
    contentDifficulty: "medium",
    questionType: "short-answer",
    estimatedTimeSeconds: 60,
    prompt: { answer } as unknown as BankQuestion["prompt"],
    explanation: "",
    confidenceWeight: 1,
    revisionPriority: 3,
    masteryThreshold: 2,
    usageCount: 0,
    avgSuccessRate: null,
    learningUnitId: id,
    familyId,
    eligibilityStatus: "practice_eligible",
    active: true,
  } as BankQuestion;
}

test("bankQuestionSignature reads the real BankQuestion prompt shape correctly", () => {
  const q = mathsBankQuestion("q1", "fam-a", "QT-MR-01", "42");
  assert.equal(bankQuestionSignature(q), "QT-MR-01|numeric|steps=0");
});

test("findCrossFamilyCollisions flags a signature shared across two DIFFERENT families, never a same-family group", () => {
  const rows = [
    mathsBankQuestion("q1", "fam-a", "QT-MR-01", "42"),
    mathsBankQuestion("q2", "fam-a", "QT-MR-01", "17"), // same family, same signature -- expected, never flagged
    mathsBankQuestion("q3", "fam-b", "QT-MR-01", "88"), // different family, same signature -- the real risk this module exists to catch
  ];
  const collisions = findCrossFamilyCollisions(rows);
  assert.equal(collisions.size, 1);
  const [families] = [...collisions.values()];
  assert.deepEqual([...families].sort(), ["fam-a", "fam-b"]);
});

test("findCrossFamilyCollisions reports nothing when every signature maps to exactly one family", () => {
  const rows = [
    mathsBankQuestion("q1", "fam-a", "QT-MR-01", "42"),
    mathsBankQuestion("q2", "fam-b", "QT-MR-02", "true"),
  ];
  assert.equal(findCrossFamilyCollisions(rows).size, 0);
});

test("a row with no family_id is treated as its own singleton family (never silently merged with another unfamilied row)", () => {
  const rows = [
    mathsBankQuestion("q1", "fam-a", "QT-MR-01", "42"),
    { ...mathsBankQuestion("q2", "fam-a", "QT-MR-01", "17"), familyId: undefined },
    { ...mathsBankQuestion("q3", "fam-a", "QT-MR-01", "99"), familyId: undefined },
  ];
  const collisions = findCrossFamilyCollisions(rows);
  assert.equal(collisions.size, 1);
  const [families] = [...collisions.values()];
  assert.ok(families.has("fam-a"));
  assert.ok(families.has("unfamilied:q2") || families.has("unfamilied:q3"));
});
