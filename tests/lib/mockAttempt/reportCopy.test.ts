import { test } from "node:test";
import assert from "node:assert/strict";
import {
  competencyLabel,
  scoreSummarySentence,
  strengthSentence,
  priorSentence,
  skillEvidenceLevelLabel,
  skillPerformanceSentence,
  developmentAreaSentence,
  nextPracticeSentence,
  OFFICIAL_SCORE_DISCLAIMER,
  ANALYSIS_PENDING_NOTE,
  NO_STRENGTHS_YET_NOTE,
  NO_DEVELOPMENT_AREAS_NOTE,
} from "@/lib/mockAttempt/reportCopy";
import { COMPETENCIES } from "@/lib/learningEngine/assessmentBrainMap";
import type { MockNextPracticePriority, MockOverallResult, MockSkillEvidenceEntry, MockStrengthOrPriorityEntry } from "@/lib/mockAttempt/types";

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

/**
 * Decision 223 (Mathematics Mock 1 Deterministic Mock Analysis Engine) —
 * the new Section 3-7 report copy. Same language-safety discipline as
 * every function above: no "cannot"/"doesn't understand"/"is weak at"
 * from one sitting, no unsupported certainty, no raw internal codes.
 */

function skillEntry(overrides: Partial<MockSkillEvidenceEntry> = {}): MockSkillEvidenceEntry {
  return {
    questionTypeId: "QT-MR-04",
    competencyId: "MR-04",
    marksAchieved: 0,
    marksAvailable: 0,
    percentage: null,
    subpartCount: 0,
    correctCount: 0,
    evidenceLevel: "insufficient_evidence",
    difficultyDistribution: { easy: 0, medium: 0, hard: 0, challenge: 0 },
    misconceptionNotes: [],
    ...overrides,
  };
}

test("skillEvidenceLevelLabel: insufficient_evidence is never phrased as a negative judgement of the child", () => {
  const label = skillEvidenceLevelLabel("insufficient_evidence");
  for (const forbidden of ["fail", "weak", "bad", "poor", "behind", "cannot", "can't"]) {
    assert.ok(!label.toLowerCase().includes(forbidden));
  }
});

test("skillEvidenceLevelLabel covers all four levels with distinct, honest labels", () => {
  const labels = new Set([
    skillEvidenceLevelLabel("demonstrated_securely"),
    skillEvidenceLevelLabel("developing"),
    skillEvidenceLevelLabel("not_yet_demonstrated"),
    skillEvidenceLevelLabel("insufficient_evidence"),
  ]);
  assert.equal(labels.size, 4);
});

test("skillPerformanceSentence: demonstrated_securely states marks achieved/available plainly, uses the real competency label, never a raw QT code", () => {
  const sentence = skillPerformanceSentence(skillEntry({ evidenceLevel: "demonstrated_securely", marksAchieved: 4, marksAvailable: 4, subpartCount: 2, correctCount: 2 }));
  assert.match(sentence, /4 out of 4 marks/);
  assert.ok(!sentence.includes("QT-MR-04"));
  assert.ok(sentence.includes(competencyLabel("MR-04")));
});

test("skillPerformanceSentence: insufficient_evidence never states a percentage or an achieved/available ratio -- states the plain mark count only", () => {
  const sentence = skillPerformanceSentence(skillEntry({ evidenceLevel: "insufficient_evidence", marksAvailable: 1, subpartCount: 1, correctCount: 1 }));
  assert.ok(!sentence.includes("%"));
  assert.ok(!/\d out of \d marks/.test(sentence));
  assert.match(sentence, /1 mark available/);
});

test("skillPerformanceSentence pluralises marksAvailable correctly for insufficient_evidence", () => {
  const one = skillPerformanceSentence(skillEntry({ evidenceLevel: "insufficient_evidence", marksAvailable: 1, subpartCount: 1 }));
  const two = skillPerformanceSentence(skillEntry({ evidenceLevel: "insufficient_evidence", marksAvailable: 2, subpartCount: 1 }));
  assert.match(one, /1 mark available/);
  assert.match(two, /2 marks available/);
});

test("NO_STRENGTHS_YET_NOTE is honest and never implies the work itself was judged, only the evidence available", () => {
  for (const forbidden of ["fail", "weak", "bad", "poor", "behind"]) {
    assert.ok(!NO_STRENGTHS_YET_NOTE.toLowerCase().includes(forbidden));
  }
});

test("developmentAreaSentence: not_yet_demonstrated uses 'not yet demonstrated securely', never 'cannot'/'doesn't understand'/'is weak at'", () => {
  const sentence = developmentAreaSentence(skillEntry({ evidenceLevel: "not_yet_demonstrated" }));
  assert.match(sentence, /Not yet demonstrated securely/);
  for (const forbidden of ["cannot", "can't", "doesn't understand", "is weak at", "fail"]) {
    assert.ok(!sentence.toLowerCase().includes(forbidden.toLowerCase()));
  }
});

test("developmentAreaSentence: developing uses 'needs more practice with... still developing', never a certainty of inability", () => {
  const sentence = developmentAreaSentence(skillEntry({ evidenceLevel: "developing" }));
  assert.match(sentence, /Needs more practice with/);
  assert.match(sentence, /still developing/);
});

test("developmentAreaSentence: SAFE misconception framing -- 'this question type often involves', never 'you made the mistake of'", () => {
  const sentence = developmentAreaSentence(skillEntry({ evidenceLevel: "not_yet_demonstrated", misconceptionNotes: ["Subtracting a fixed amount instead of a percentage."] }));
  assert.match(sentence, /This question type often involves:/);
  assert.ok(!/you made|you did|your mistake/i.test(sentence));
});

test("developmentAreaSentence: with no misconception note, the sentence still reads cleanly, nothing invented", () => {
  const sentence = developmentAreaSentence(skillEntry({ evidenceLevel: "developing", misconceptionNotes: [] }));
  assert.ok(!sentence.includes("often involves"));
});

test("NO_DEVELOPMENT_AREAS_NOTE is a plain, honest statement, never overclaiming readiness", () => {
  for (const forbidden of ["ready", "guarantee", "pass", "admission"]) {
    assert.ok(!NO_DEVELOPMENT_AREAS_NOTE.toLowerCase().includes(forbidden));
  }
});

test("nextPracticeSentence returns null for an empty priority list, never a padded filler sentence", () => {
  assert.equal(nextPracticeSentence([]), null);
});

test("nextPracticeSentence deduplicates by competency label -- several question types sharing one competency must never repeat the same label in one sentence", () => {
  const priorities: MockNextPracticePriority[] = [
    { questionTypeId: "QT-MR-01", competencyId: "MR-01" },
    { questionTypeId: "QT-MR-02", competencyId: "MR-01" },
    { questionTypeId: "QT-MR-04", competencyId: "MR-04" },
  ];
  const sentence = nextPracticeSentence(priorities)!;
  const label = competencyLabel("MR-01");
  const occurrences = sentence.split(label).length - 1;
  assert.equal(occurrences, 1, `expected "${label}" to appear exactly once, got: "${sentence}"`);
});

test("nextPracticeSentence falls back to the raw questionTypeId only when no competencyId is available, never throws", () => {
  const sentence = nextPracticeSentence([{ questionTypeId: "QT-UNKNOWN", competencyId: null }]);
  assert.match(sentence!, /QT-UNKNOWN/);
});
