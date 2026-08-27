import { test } from "node:test";
import assert from "node:assert/strict";
import { analyseMockAttempt, classifySkillEvidence, questionTypeCompetency, type MockAnalysisOutcomeInput, type MockAnalysisQuestionBankLookup } from "@/lib/ali/mockAnalysisEngine";
import { QUESTION_TYPE_PRIMARY_COMPETENCY } from "@/lib/learningEngine/assessmentBrainMap";

/**
 * Decision 223 — Mathematics Mock 1 Deterministic Mock Analysis Engine.
 * Pure-function tests against `lib/ali/mockAnalysisEngine.ts`, the exact
 * byte-for-byte TS mirror of `mock_analyse_attempt()` (migration 151).
 * No database access -- see that migration's own header for the full
 * evidence-contract rationale this file verifies in code.
 */

function outcome(id: string, status: MockAnalysisOutcomeInput["status"], marksAwarded: number | null, marksAvailable: number, qt: string | null): MockAnalysisOutcomeInput {
  return { questionId: id, status, marksAwarded, marksAvailable, questionTypeId: qt };
}

function bank(entries: Record<string, MockAnalysisQuestionBankLookup>): Map<string, MockAnalysisQuestionBankLookup> {
  return new Map(Object.entries(entries));
}

test("classifySkillEvidence: fewer than 2 observed subparts is always insufficient_evidence, regardless of correctness", () => {
  assert.equal(classifySkillEvidence(0, 0), "insufficient_evidence");
  assert.equal(classifySkillEvidence(1, 0), "insufficient_evidence");
  assert.equal(classifySkillEvidence(1, 1), "insufficient_evidence", "a single correct answer alone must never become a strength");
});

test("classifySkillEvidence: 2+ subparts, all correct -> demonstrated_securely", () => {
  assert.equal(classifySkillEvidence(2, 2), "demonstrated_securely");
  assert.equal(classifySkillEvidence(4, 4), "demonstrated_securely");
});

test("classifySkillEvidence: 2+ subparts, none correct -> not_yet_demonstrated", () => {
  assert.equal(classifySkillEvidence(2, 0), "not_yet_demonstrated");
});

test("classifySkillEvidence: 2+ subparts, mixed -> developing", () => {
  assert.equal(classifySkillEvidence(3, 1), "developing");
  assert.equal(classifySkillEvidence(3, 2), "developing");
});

test("questionTypeCompetency matches QUESTION_TYPE_PRIMARY_COMPETENCY exactly for every real question type id -- no silent drift from the single source of truth", () => {
  for (const [qt, competencyId] of Object.entries(QUESTION_TYPE_PRIMARY_COMPETENCY)) {
    assert.equal(questionTypeCompetency(qt), competencyId, `mismatch for ${qt}`);
  }
});

test("questionTypeCompetency returns null for an unrecognised question type id, never guesses", () => {
  assert.equal(questionTypeCompetency("QT-NOT-REAL"), null);
});

test("ALL-CORRECT attempt: every skill demonstrated_securely (with 2+ observations), no development areas, no next-practice priorities", () => {
  const outcomes = [
    outcome("q1", "correct", 1, 1, "QT-MR-04"),
    outcome("q2", "correct", 1, 1, "QT-MR-04"),
    outcome("q3", "correct", 2, 2, "QT-MR-05"),
    outcome("q4", "correct", 2, 2, "QT-MR-05"),
  ];
  const result = analyseMockAttempt(outcomes, bank({}), "attempt-1", "form-1", "2026-01-01T00:00:00Z", { rawMarksAchieved: 6, rawMarksAvailable: 6, percentage: 100 });
  assert.equal(result.weaknesses.length, 0);
  assert.equal(result.skillEvidence.nextPracticePriorities.length, 0);
  assert.ok(result.strengths.some((s) => s.competencyId === "MR-04"));
  assert.ok(result.strengths.some((s) => s.competencyId === "MR-02")); // QT-MR-05 -> MR-02
  for (const s of result.skillEvidence.bySkill) assert.equal(s.evidenceLevel, "demonstrated_securely");
});

test("ALL-WRONG attempt: every skill not_yet_demonstrated (with 2+ observations), no strengths, priorities populated", () => {
  const outcomes = [
    outcome("q1", "incorrect", 0, 1, "QT-MR-04"),
    outcome("q2", "incorrect", 0, 1, "QT-MR-04"),
    outcome("q3", "unanswered", 0, 2, "QT-MR-05"),
    outcome("q4", "unanswered", 0, 2, "QT-MR-05"),
  ];
  const result = analyseMockAttempt(outcomes, bank({}), "attempt-2", "form-1", "2026-01-01T00:00:00Z", { rawMarksAchieved: 0, rawMarksAvailable: 6, percentage: 0 });
  assert.equal(result.strengths.length, 0);
  assert.ok(result.weaknesses.length > 0);
  for (const s of result.skillEvidence.bySkill) assert.equal(s.evidenceLevel, "not_yet_demonstrated");
  assert.ok(result.skillEvidence.nextPracticePriorities.length > 0);
});

test("REAL-STYLE LOW-SCORE case (representative of the Founder-confirmed 6/56 live result, NOT the literal real per-question data, which was never disclosed to this session): honest, non-shaming output", () => {
  // A representative reconstruction across the real Mock 1 skill
  // distribution, 6 of 21 marks correct here (not the real 56-mark
  // denominator or the literal real per-question data, neither of which
  // was disclosed to this session) -- disclosed as representative,
  // matching this arc's own established simulation discipline (Decision
  // 216/218's own scenario-based simulations).
  const outcomes: MockAnalysisOutcomeInput[] = [
    outcome("directcalc-1", "correct", 1, 1, "QT-MR-01"),
    outcome("directcalc-2", "incorrect", 0, 1, "QT-MR-01"),
    outcome("invdiv-1", "incorrect", 0, 1, "QT-MR-02"),
    outcome("invdiv-2", "incorrect", 0, 1, "QT-MR-02"),
    outcome("invdiv-3", "incorrect", 0, 1, "QT-MR-02"),
    outcome("unitconv-1", "unanswered", 0, 1, "QT-MR-03"),
    outcome("forward-1", "correct", 1, 1, "QT-MR-05"),
    outcome("forward-2", "incorrect", 0, 1, "QT-MR-05"),
    outcome("campingsale-1", "correct", 1, 1, "QT-MR-04"),
    outcome("campingsale-2", "incorrect", 0, 1, "QT-MR-04"),
    outcome("campingsale-3", "incorrect", 0, 1, "QT-MR-04"),
    outcome("bustimetable-1", "correct", 1, 1, "QT-MR-10"),
    outcome("bustimetable-2", "incorrect", 0, 1, "QT-MR-10"),
    outcome("bustimetable-3", "incorrect", 0, 1, "QT-MR-10"),
    outcome("triangleanglesum-1", "incorrect", 0, 1, "QT-MR-07"),
    outcome("triangleanglesum-2", "incorrect", 0, 1, "QT-MR-07"),
    outcome("roundingbounds-1", "unanswered", 0, 1, "QT-MR-11"),
    outcome("craftstall-1", "correct", 1, 1, "QT-MR-13"),
    outcome("craftstall-2", "incorrect", 0, 1, "QT-MR-13"),
    outcome("craftstall-3", "correct", 1, 1, "QT-MR-13"),
    outcome("craftstall-4", "incorrect", 0, 1, "QT-MR-13"),
  ];

  const result = analyseMockAttempt(
    outcomes,
    bank({
      "invdiv-1": { contentDifficulty: "medium", addressesMisconception: "Inverting the operation -- dividing instead of multiplying when working backwards from a total." },
    }),
    "attempt-real-style", "first-mock-mathematics-v1", "2026-08-27T09:00:00Z",
    { rawMarksAchieved: 6, rawMarksAvailable: outcomes.reduce((n, o) => n + o.marksAvailable, 0), percentage: null }
  );

  // Never shaming/diagnostic language leaks through structural output --
  // covered further by reportCopy's own dedicated tests; here we assert
  // the STRUCTURE stays evidence-bounded.
  assert.ok(result.strengths.length <= 2, "a 6/56 result should not manufacture many strengths");
  assert.ok(result.weaknesses.length > 0);
  assert.ok(result.skillEvidence.nextPracticePriorities.length <= 3, "next-practice priorities must be bounded");
  // The one misconception note supplied is attached only to its own skill, never broadcast to every skill.
  const invdivEntry = result.skillEvidence.bySkill.find((s) => s.questionTypeId === "QT-MR-02")!;
  assert.equal(invdivEntry.misconceptionNotes.length, 1);
  const directcalcEntry = result.skillEvidence.bySkill.find((s) => s.questionTypeId === "QT-MR-01")!;
  assert.equal(directcalcEntry.misconceptionNotes.length, 0);
});

test("MIXED-PERFORMANCE attempt: correctly separates demonstrated_securely, developing, and not_yet_demonstrated across different skills", () => {
  const outcomes = [
    outcome("a1", "correct", 1, 1, "QT-MR-01"),
    outcome("a2", "correct", 1, 1, "QT-MR-01"), // QT-MR-01 all correct -> demonstrated_securely
    outcome("b1", "correct", 1, 1, "QT-MR-04"),
    outcome("b2", "incorrect", 0, 1, "QT-MR-04"), // QT-MR-04 mixed -> developing
    outcome("c1", "incorrect", 0, 1, "QT-MR-11"),
    outcome("c2", "unanswered", 0, 1, "QT-MR-11"), // QT-MR-11 all wrong -> not_yet_demonstrated
  ];
  const result = analyseMockAttempt(outcomes, bank({}), "attempt-3", "form-1", "2026-01-01T00:00:00Z", { rawMarksAchieved: 2, rawMarksAvailable: 6, percentage: 33.3 });
  const byQt = new Map(result.skillEvidence.bySkill.map((s) => [s.questionTypeId, s.evidenceLevel]));
  assert.equal(byQt.get("QT-MR-01"), "demonstrated_securely");
  assert.equal(byQt.get("QT-MR-04"), "developing");
  assert.equal(byQt.get("QT-MR-11"), "not_yet_demonstrated");
});

test("ONE-QUESTION skill evidence never overclaims: a single correct or incorrect question produces insufficient_evidence, appears in neither strengths nor weaknesses", () => {
  const outcomes = [outcome("solo-1", "correct", 1, 1, "QT-MR-13")];
  const result = analyseMockAttempt(outcomes, bank({}), "attempt-4", "form-1", "2026-01-01T00:00:00Z", { rawMarksAchieved: 1, rawMarksAvailable: 1, percentage: 100 });
  assert.equal(result.skillEvidence.bySkill[0].evidenceLevel, "insufficient_evidence");
  assert.equal(result.strengths.length, 0);
  assert.equal(result.weaknesses.length, 0);
});

test("MISCONCEPTION SAFETY: notes are attached only from incorrect/unanswered rows, never from a correct one, and never claim the learner made the mistake (data-level check; language-level check lives in reportCopy tests)", () => {
  const outcomes = [
    outcome("q1", "correct", 1, 1, "QT-MR-04"),
    outcome("q2", "incorrect", 0, 1, "QT-MR-04"),
  ];
  const result = analyseMockAttempt(
    outcomes,
    bank({
      q1: { contentDifficulty: "easy", addressesMisconception: "Should never appear -- q1 was correct." },
      q2: { contentDifficulty: "easy", addressesMisconception: "Subtracting a fixed amount instead of a percentage." },
    }),
    "attempt-5", "form-1", "2026-01-01T00:00:00Z", null
  );
  const entry = result.skillEvidence.bySkill.find((s) => s.questionTypeId === "QT-MR-04")!;
  assert.deepEqual(entry.misconceptionNotes, ["Subtracting a fixed amount instead of a percentage."]);
});

test("misconceptionNotes is capped at 2 per skill, even with many incorrect rows carrying distinct notes", () => {
  const outcomes = [1, 2, 3, 4].map((i) => outcome(`q${i}`, "incorrect", 0, 1, "QT-MR-04"));
  const b = bank(Object.fromEntries(outcomes.map((o, i) => [o.questionId, { contentDifficulty: "easy" as const, addressesMisconception: `note-${i}` }])));
  const result = analyseMockAttempt(outcomes, b, "attempt-6", "form-1", "2026-01-01T00:00:00Z", null);
  assert.equal(result.skillEvidence.bySkill[0].misconceptionNotes.length, 2);
});

test("COMPETENCY ROLLUP: several question types sharing one competency never produce duplicate strengths/weaknesses entries -- one entry per competency, aggregated", () => {
  // QT-MR-01, QT-MR-02, QT-MR-03, QT-MR-09 all map to MR-01.
  const outcomes = [
    outcome("a1", "correct", 1, 1, "QT-MR-01"),
    outcome("a2", "correct", 1, 1, "QT-MR-01"),
    outcome("b1", "correct", 1, 1, "QT-MR-02"),
    outcome("b2", "correct", 1, 1, "QT-MR-02"),
  ];
  const result = analyseMockAttempt(outcomes, bank({}), "attempt-7", "form-1", "2026-01-01T00:00:00Z", { rawMarksAchieved: 4, rawMarksAvailable: 4, percentage: 100 });
  const mr01Entries = result.strengths.filter((s) => s.competencyId === "MR-01");
  assert.equal(mr01Entries.length, 1, "MR-01 must appear exactly once, not once per question type");
  assert.equal(mr01Entries[0].questionCount, 4);
  assert.equal(mr01Entries[0].correctCount, 4);
});

test("next-practice priorities: not_yet_demonstrated ranked before developing, then by marks lost descending, then questionTypeId ascending, capped at 3", () => {
  const outcomes = [
    // QT-MR-01: developing, 1 mark lost of 2
    outcome("a1", "correct", 1, 1, "QT-MR-01"), outcome("a2", "incorrect", 0, 1, "QT-MR-01"),
    // QT-MR-04: not_yet_demonstrated, 3 marks lost
    outcome("b1", "incorrect", 0, 1, "QT-MR-04"), outcome("b2", "incorrect", 0, 1, "QT-MR-04"), outcome("b3", "incorrect", 0, 1, "QT-MR-04"),
    // QT-MR-05: not_yet_demonstrated, 2 marks lost
    outcome("c1", "incorrect", 0, 1, "QT-MR-05"), outcome("c2", "incorrect", 0, 1, "QT-MR-05"),
    // QT-MR-11: not_yet_demonstrated, 2 marks lost (tie with QT-MR-05, broken by id)
    outcome("d1", "incorrect", 0, 1, "QT-MR-11"), outcome("d2", "incorrect", 0, 1, "QT-MR-11"),
  ];
  const result = analyseMockAttempt(outcomes, bank({}), "attempt-8", "form-1", "2026-01-01T00:00:00Z", null);
  const ids = result.skillEvidence.nextPracticePriorities.map((p) => p.questionTypeId);
  assert.equal(ids.length, 3, "capped at 3");
  assert.deepEqual(ids, ["QT-MR-04", "QT-MR-05", "QT-MR-11"], "not_yet_demonstrated first (by marks lost desc, tie broken by id), developing (QT-MR-01) excluded by the cap");
});

test("REQUIRES_MANUAL_MARKING and no-questionTypeId rows contribute no skill evidence, never guessed", () => {
  const outcomes = [
    outcome("q1", "requires_manual_marking", null, 1, "QT-EN-01"),
    outcome("q2", "correct", 1, 1, null),
  ];
  const result = analyseMockAttempt(outcomes, bank({}), "attempt-9", "form-1", "2026-01-01T00:00:00Z", null);
  assert.equal(result.skillEvidence.bySkill.length, 0);
  assert.equal(result.competencyEvidence.length, 0);
});

test("competency_evidence: one provenance-tagged record per graded question, source='mock', correct boolean matches status, never includes response text or a stored answer", () => {
  const outcomes = [outcome("q1", "correct", 1, 1, "QT-MR-04"), outcome("q2", "incorrect", 0, 1, "QT-MR-04")];
  const result = analyseMockAttempt(outcomes, bank({}), "attempt-10", "form-xyz", "2026-01-01T12:00:00Z", null);
  assert.equal(result.competencyEvidence.length, 2);
  for (const e of result.competencyEvidence) {
    assert.equal(e.source, "mock");
    assert.equal(e.attemptId, "attempt-10");
    assert.equal(e.formId, "form-xyz");
    assert.ok(!("response" in e));
    assert.ok(!("answer" in e));
  }
  assert.equal(result.competencyEvidence.find((e) => e.questionTypeId === "QT-MR-04" && e.correct === true) !== undefined, true);
});

test("subject_breakdown reflects the real, dynamically-passed overall result, never a hardcoded value -- proven with two different scores", () => {
  const outcomes = [outcome("q1", "correct", 1, 1, "QT-MR-04")];
  const low = analyseMockAttempt(outcomes, bank({}), "a", "f", "t", { rawMarksAchieved: 6, rawMarksAvailable: 56, percentage: 10.7 });
  const high = analyseMockAttempt(outcomes, bank({}), "a", "f", "t", { rawMarksAchieved: 50, rawMarksAvailable: 56, percentage: 89.3 });
  assert.deepEqual(low.subjectBreakdown, [{ subject: "mathematics", marksAchieved: 6, marksAvailable: 56, percentage: 10.7 }]);
  assert.deepEqual(high.subjectBreakdown, [{ subject: "mathematics", marksAchieved: 50, marksAvailable: 56, percentage: 89.3 }]);
  assert.notDeepEqual(low.subjectBreakdown, high.subjectBreakdown);
});

test("subject_breakdown is empty, never fabricated, when overall is null", () => {
  const result = analyseMockAttempt([], bank({}), "a", "f", "t", null);
  assert.deepEqual(result.subjectBreakdown, []);
});

test("PURE FUNCTION DETERMINISM: identical input always produces identical output (idempotency at the function level -- the same guarantee mock_analyse_attempt()'s own analysis_version check provides at the database level)", () => {
  const outcomes = [outcome("q1", "correct", 1, 1, "QT-MR-04"), outcome("q2", "incorrect", 0, 1, "QT-MR-11"), outcome("q3", "unanswered", 0, 1, "QT-MR-11")];
  const b = bank({ q2: { contentDifficulty: "hard", addressesMisconception: "note" } });
  const overall = { rawMarksAchieved: 1, rawMarksAvailable: 3, percentage: 33.3 };
  const first = analyseMockAttempt(outcomes, b, "attempt-x", "form-x", "2026-01-01T00:00:00Z", overall);
  const second = analyseMockAttempt(outcomes, b, "attempt-x", "form-x", "2026-01-01T00:00:00Z", overall);
  assert.deepEqual(first, second);
});
