import { test } from "node:test";
import assert from "node:assert/strict";
import {
  competencyLabel,
  scoreSummarySentence,
  strengthSentence,
  priorSentence,
  OFFICIAL_SCORE_DISCLAIMER,
  ANALYSIS_PENDING_NOTE,
} from "@/lib/mockAttempt/reportCopy";
import { COMPETENCIES } from "@/lib/learningEngine/assessmentBrainMap";
import type { MockOverallResult, MockStrengthOrPriorityEntry } from "@/lib/mockAttempt/types";

/**
 * Programme Increment 008F, Part 7 — proves the report language rules
 * directly: plain facts and hedged interpretation only, never an
 * unsupported certainty claim ("you are X% ready", a predicted score, a
 * guaranteed outcome), and never a raw competency ID shown as-is.
 */

test("competencyLabel returns the real, existing plain-language name, never the raw ID, for a real competency", () => {
  const [id, meta] = Object.entries(COMPETENCIES)[0];
  assert.equal(competencyLabel(id), meta.name);
  assert.notEqual(competencyLabel(id), id);
});

test("competencyLabel falls back to the id itself for an unrecognised id, rather than throwing", () => {
  assert.equal(competencyLabel("NOT-A-REAL-ID"), "NOT-A-REAL-ID");
});

test("scoreSummarySentence states raw marks and percentage plainly when a percentage exists", () => {
  const overall: MockOverallResult = {
    rawMarksAchieved: 7,
    rawMarksAvailable: 10,
    percentage: 70,
    answeredCount: 10,
    unansweredCount: 0,
    correctCount: 7,
    incorrectCount: 3,
    requiresManualMarkingCount: 0,
  };
  const sentence = scoreSummarySentence(overall);
  assert.equal(sentence, "You scored 7 out of 10 marks (70%).");
});

test("scoreSummarySentence never states a percentage when one couldn't be fairly computed (manual marking pending)", () => {
  const overall: MockOverallResult = {
    rawMarksAchieved: 5,
    rawMarksAvailable: 10,
    percentage: null,
    answeredCount: 8,
    unansweredCount: 2,
    correctCount: 5,
    incorrectCount: 1,
    requiresManualMarkingCount: 2,
  };
  const sentence = scoreSummarySentence(overall);
  assert.ok(!sentence.includes("%"));
  assert.ok(sentence.includes("8"));
});

test("scoreSummarySentence never contains an unsupported certainty claim (readiness percentage, predicted score, guaranteed outcome)", () => {
  const overall: MockOverallResult = {
    rawMarksAchieved: 7, rawMarksAvailable: 10, percentage: 70,
    answeredCount: 10, unansweredCount: 0, correctCount: 7, incorrectCount: 3, requiresManualMarkingCount: 0,
  };
  const sentence = scoreSummarySentence(overall);
  for (const forbidden of ["ready", "guarantee", "will score", "pass", "admission"]) {
    assert.ok(!sentence.toLowerCase().includes(forbidden), `must not contain "${forbidden}"`);
  }
});

test("the official-score disclaimer is present, explicit, and never overwritten by a caller -- it's an exported constant, not a template a caller could omit", () => {
  assert.match(OFFICIAL_SCORE_DISCLAIMER, /not an official CSSE standardised score/i);
});

test("strengthSentence lists real competency labels, never raw IDs, and returns null for no strengths (never a false claim)", () => {
  const entries: MockStrengthOrPriorityEntry[] = [{ competencyId: Object.keys(COMPETENCIES)[0], questionCount: 2, correctCount: 2 }];
  const sentence = strengthSentence(entries);
  assert.ok(sentence);
  assert.ok(!sentence!.includes(entries[0].competencyId) || COMPETENCIES[entries[0].competencyId as keyof typeof COMPETENCIES].name.includes(entries[0].competencyId));
  assert.equal(strengthSentence([]), null);
});

test("priorSentence returns null for no priorities (never invents a weakness to fill space)", () => {
  assert.equal(priorSentence([]), null);
});

test("priorSentence never uses frightening or judgemental language", () => {
  const entries: MockStrengthOrPriorityEntry[] = [{ competencyId: Object.keys(COMPETENCIES)[0], questionCount: 2, correctCount: 0 }];
  const sentence = priorSentence(entries)!;
  for (const forbidden of ["fail", "weak", "bad", "poor", "behind"]) {
    assert.ok(!sentence.toLowerCase().includes(forbidden), `must not contain "${forbidden}"`);
  }
});

test("ANALYSIS_PENDING_NOTE is honest -- does not claim analysis is complete", () => {
  assert.ok(!/complete|finished|ready now/i.test(ANALYSIS_PENDING_NOTE));
});
