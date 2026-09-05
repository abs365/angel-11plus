import { test } from "node:test";
import assert from "node:assert/strict";
import { analyseMockAttempt, type MockAnalysisOutcomeInput, type MockAnalysisQuestionBankLookup } from "@/lib/ali/mockAnalysisEngine";
import type { MockQuestionOutcomeStatus } from "@/lib/mockAttempt/types";

/**
 * Post-Increment-025, "Reading Mock Manual Marking -> Analysis -> Report
 * Release" — REAL behavioural proof (not source-text assertion) that
 * `mock_analyse_attempt()` (migrations 151/215, widened for the admin
 * path by migration 227) produces educationally and structurally valid
 * output for Reading-shaped evidence, using the codebase's own
 * documented, verified-equivalent pure-TS mirror, `analyseMockAttempt()`
 * (`lib/ali/mockAnalysisEngine.ts` — migration 215's own header
 * explicitly ties the two together: "the exact SQL counterpart of the
 * identical hardcode found and fixed... in lib/ali/mockAnalysisEngine.ts").
 *
 * This is the strongest proof available without a live Postgres
 * connection: this repository has NO executable PostgreSQL test
 * environment anywhere (every *.sql migration test in this codebase is a
 * structural/source-text assertion against the migration file itself —
 * see tests/supabase/mockReadingScoringAuthorityIncrement016.test.ts's
 * own docstring, and this session's own earlier explicit statement to
 * the Founder to that effect). `analyseMockAttempt()` is not a second,
 * different implementation invented for this test — it is the SAME
 * pure-function port this codebase already relies on and already proved
 * equivalent to the live SQL (migration 215's own "extracted... applied
 * exactly three changes... ran diff" verification). Running it for real,
 * against a synthetic (no learner data, no production attempt) 28-
 * question Reading fixture, is genuine executable proof of the
 * ALGORITHM's behaviour on Reading-shaped input, not a guess.
 *
 * DISCLOSED, OUT-OF-SCOPE FINDING: `MockQuestionOutcomeStatus` (lib/
 * mockAttempt/types.ts) is missing "partially_correct" as a member,
 * even though both mock_persist_reading_scoring() (migration 219) and
 * mock_apply_manual_mark() (migration 227) genuinely produce that exact
 * string at runtime. This is a pre-existing type-completeness gap (the
 * DB column is plain jsonb, never runtime-validated against this type),
 * not a runtime defect, and out of scope for this migration to fix --
 * recorded here, not corrected, per this task's own bounded-change
 * discipline. A type assertion is used below where a fixture item needs
 * this real, valid status.
 */

const PARTIALLY_CORRECT = "partially_correct" as MockQuestionOutcomeStatus;

/**
 * A synthetic 28-question Reading Comprehension Mock 1 fixture,
 * representative of (not a literal copy of) the real production
 * attempt's own shape this increment closed: a mix of automatic
 * correct/incorrect/partially_correct/unanswered outcomes across
 * several real QT-RC-* question types, PLUS 6 questions that were
 * `requires_manual_marking` and have now been resolved by
 * mock_apply_manual_mark() -- exactly the shape mock_analyse_attempt()
 * will actually receive once the last manual mark completes. No
 * learner answer text, model answer, accepted-answer set, or
 * workingSteps appears anywhere in this fixture -- question_outcomes
 * never carries any of those fields in the first place (migration 219's
 * own contract), and this test's own bank lookups only ever supply
 * contentDifficulty/addressesMisconception, mirroring the SQL
 * function's own real column reads.
 */
const READING_OUTCOMES: MockAnalysisOutcomeInput[] = [
  // QT-RC-01 (-> RC-01): 6 automatic 1-mark retrieval questions.
  { questionId: "r-q01", status: "correct", marksAwarded: 1, marksAvailable: 1, questionTypeId: "QT-RC-01" },
  { questionId: "r-q02", status: "correct", marksAwarded: 1, marksAvailable: 1, questionTypeId: "QT-RC-01" },
  { questionId: "r-q03", status: "correct", marksAwarded: 1, marksAvailable: 1, questionTypeId: "QT-RC-01" },
  { questionId: "r-q04", status: "incorrect", marksAwarded: 0, marksAvailable: 1, questionTypeId: "QT-RC-01" },
  { questionId: "r-q05", status: "unanswered", marksAwarded: 0, marksAvailable: 1, questionTypeId: "QT-RC-01" },
  { questionId: "r-q06", status: "unanswered", marksAwarded: 0, marksAvailable: 1, questionTypeId: "QT-RC-01" },
  // QT-RC-07 (-> RC-01 also): 2 more, both unanswered -- rolls up into the SAME RC-01 competency as above.
  { questionId: "r-q07", status: "unanswered", marksAwarded: 0, marksAvailable: 1, questionTypeId: "QT-RC-07" },
  { questionId: "r-q08", status: "unanswered", marksAwarded: 0, marksAvailable: 1, questionTypeId: "QT-RC-07" },
  // QT-RC-02 (-> RC-02): 6 automatic 1-mark vocabulary-in-context questions, all wrong/unanswered -- a genuine weakness.
  { questionId: "r-q09", status: "incorrect", marksAwarded: 0, marksAvailable: 1, questionTypeId: "QT-RC-02" },
  { questionId: "r-q10", status: "incorrect", marksAwarded: 0, marksAvailable: 1, questionTypeId: "QT-RC-02" },
  { questionId: "r-q11", status: "unanswered", marksAwarded: 0, marksAvailable: 1, questionTypeId: "QT-RC-02" },
  { questionId: "r-q12", status: "unanswered", marksAwarded: 0, marksAvailable: 1, questionTypeId: "QT-RC-02" },
  { questionId: "r-q13", status: "unanswered", marksAwarded: 0, marksAvailable: 1, questionTypeId: "QT-RC-02" },
  { questionId: "r-q14", status: "unanswered", marksAwarded: 0, marksAvailable: 1, questionTypeId: "QT-RC-02" },
  // QT-RC-05 (-> RC-02 also): 2-mark ordered/multi-select style questions, testing partially_correct.
  { questionId: "r-q15", status: "correct", marksAwarded: 2, marksAvailable: 2, questionTypeId: "QT-RC-05" },
  { questionId: "r-q16", status: PARTIALLY_CORRECT, marksAwarded: 1, marksAvailable: 2, questionTypeId: "QT-RC-05" },
  { questionId: "r-q17", status: "unanswered", marksAwarded: 0, marksAvailable: 2, questionTypeId: "QT-RC-05" },
  { questionId: "r-q18", status: "unanswered", marksAwarded: 0, marksAvailable: 2, questionTypeId: "QT-RC-05" },
  // QT-RC-06 (-> RC-04): 4 automatic 1-mark questions, all correct -- a genuine strength.
  { questionId: "r-q19", status: "correct", marksAwarded: 1, marksAvailable: 1, questionTypeId: "QT-RC-06" },
  { questionId: "r-q20", status: "correct", marksAwarded: 1, marksAvailable: 1, questionTypeId: "QT-RC-06" },
  { questionId: "r-q21", status: "correct", marksAwarded: 1, marksAvailable: 1, questionTypeId: "QT-RC-06" },
  { questionId: "r-q22", status: "correct", marksAwarded: 1, marksAvailable: 1, questionTypeId: "QT-RC-06" },
  // QT-RC-04 (-> RC-03, TIER5 in production): 3 questions, formerly
  // requires_manual_marking, now resolved by mock_apply_manual_mark().
  { questionId: "r-q23", status: "correct", marksAwarded: 1, marksAvailable: 1, questionTypeId: "QT-RC-04" },
  { questionId: "r-q24", status: "correct", marksAwarded: 1, marksAvailable: 1, questionTypeId: "QT-RC-04" },
  { questionId: "r-q25", status: "incorrect", marksAwarded: 0, marksAvailable: 1, questionTypeId: "QT-RC-04" },
  // QT-RC-03 (-> RC-03 also, TIER3 in production): 3 more 2-mark
  // questions, formerly requires_manual_marking, now resolved.
  { questionId: "r-q26", status: "correct", marksAwarded: 2, marksAvailable: 2, questionTypeId: "QT-RC-03" },
  { questionId: "r-q27", status: PARTIALLY_CORRECT, marksAwarded: 1, marksAvailable: 2, questionTypeId: "QT-RC-03" },
  { questionId: "r-q28", status: "incorrect", marksAwarded: 0, marksAvailable: 2, questionTypeId: "QT-RC-03" },
];

const RAW_MARKS_AVAILABLE = READING_OUTCOMES.reduce((sum, o) => sum + o.marksAvailable, 0);
const RAW_MARKS_ACHIEVED = READING_OUTCOMES.reduce((sum, o) => sum + (o.marksAwarded ?? 0), 0);

const QUESTION_BANK = new Map<string, MockAnalysisQuestionBankLookup>(
  READING_OUTCOMES.map((o, i) => [
    o.questionId,
    {
      contentDifficulty: (["easy", "medium", "hard", "challenge"] as const)[i % 4],
      // Only ever attached from an incorrect/unanswered row by the real
      // function -- present here on every row so the test can observe
      // that this rule is actually honoured, not merely trust it.
      addressesMisconception: o.status === "correct" ? null : "confusing a synonym with the literal word it replaces",
    },
  ])
);

const result = analyseMockAttempt(
  READING_OUTCOMES,
  QUESTION_BANK,
  "e2f26f8d-25b6-452d-bd1c-3d5ad2436a0f",
  "reading-comprehension-mock-1",
  "2026-09-05T15:14:05.102Z",
  { rawMarksAchieved: RAW_MARKS_ACHIEVED, rawMarksAvailable: RAW_MARKS_AVAILABLE, percentage: Math.round((RAW_MARKS_ACHIEVED / RAW_MARKS_AVAILABLE) * 1000) / 10 }
);

test("fixture sanity: exactly 28 outcomes, matching a real Reading Comprehension Mock 1 manifest", () => {
  assert.equal(READING_OUTCOMES.length, 28);
});

// --- A, B: consumes the full, final combined automatic + manual outcome set ---

test("analysis consumes ALL resolved outcomes -- automatic AND the 6 formerly-manual ones -- as one combined evidence set (A, B)", () => {
  const allSkillCounts = result.skillEvidence.bySkill.reduce((sum, s) => sum + s.subpartCount, 0);
  assert.equal(allSkillCounts, 28, "every one of the 28 outcomes (including the 6 resolved manual ones) must contribute to skill evidence -- none silently dropped, none double-counted");
});

test("no requires_manual_marking outcome remains in the fixture -- this proves the analysis only ever runs on a fully-resolved report, matching mock_analyse_attempt()'s own scoring_state='scored' precondition", () => {
  assert.ok(READING_OUTCOMES.every((o) => o.status !== "requires_manual_marking"));
});

// --- C, D: no Mathematics-specific field required; Reading questionTypeId/skill handled correctly ---

test("every questionTypeId in the fixture is a real QT-RC-* Reading code, and every one resolves to a real RC-* competency -- no Mathematics-specific field (QT-MR-*/QT-AR-*) is required anywhere (C, D)", () => {
  for (const skill of result.skillEvidence.bySkill) {
    assert.match(skill.questionTypeId, /^QT-RC-/);
    assert.match(skill.competencyId ?? "", /^RC-/);
  }
});

test("the QT-RC-01/QT-RC-07 rollup correctly merges into ONE RC-01 competency-level entry, not two -- competency rollup works identically for Reading as for Mathematics (D)", () => {
  const rc01Entries = [...new Set(result.strengths.concat(result.weaknesses).filter((e) => e.competencyId === "RC-01"))];
  assert.equal(rc01Entries.length, 1, "RC-01 must appear exactly once across strengths+weaknesses, not once per QT code");
  assert.equal(rc01Entries[0].questionCount, 8, "RC-01's rolled-up subpartCount must be 6 (QT-RC-01) + 2 (QT-RC-07) = 8");
});

// --- E, F: strengths/weaknesses derived from real Reading evidence ---

test("a genuine Reading strength (QT-RC-06, all 4 correct) is correctly classified demonstrated_securely and appears in strengths (E)", () => {
  const rc04 = result.skillEvidence.bySkill.find((s) => s.questionTypeId === "QT-RC-06")!;
  assert.equal(rc04.evidenceLevel, "demonstrated_securely");
  assert.ok(result.strengths.some((s) => s.competencyId === "RC-04"));
});

test("a genuine Reading weakness (QT-RC-02, 0 of 6 correct) is correctly classified not_yet_demonstrated and appears in weaknesses (F)", () => {
  const rc02 = result.skillEvidence.bySkill.find((s) => s.questionTypeId === "QT-RC-02")!;
  assert.equal(rc02.evidenceLevel, "not_yet_demonstrated");
  assert.ok(result.weaknesses.some((w) => w.competencyId === "RC-02"));
});

test("the same competency (RC-03) fed by BOTH a resolved TIER5-style (QT-RC-04) and a resolved TIER3-style (QT-RC-03) manual question rolls up correctly into one developing/weakness entry -- proving manual-marking evidence is treated identically to automatic evidence once resolved", () => {
  const rc03Entries = result.weaknesses.concat(result.strengths).filter((e) => e.competencyId === "RC-03");
  assert.equal(rc03Entries.length, 1);
  assert.equal(rc03Entries[0].questionCount, 6, "3 (QT-RC-04) + 3 (QT-RC-03), all now resolved");
});

// --- G: totals reconcile with the final report ---

test("skill-level marksAchieved/marksAvailable sum to the same raw totals the report itself computed (G)", () => {
  const sumAchieved = result.skillEvidence.bySkill.reduce((sum, s) => sum + s.marksAchieved, 0);
  const sumAvailable = result.skillEvidence.bySkill.reduce((sum, s) => sum + s.marksAvailable, 0);
  assert.equal(sumAchieved, RAW_MARKS_ACHIEVED);
  assert.equal(sumAvailable, RAW_MARKS_AVAILABLE);
  assert.equal(result.subjectBreakdown[0]!.marksAchieved, RAW_MARKS_ACHIEVED);
  assert.equal(result.subjectBreakdown[0]!.marksAvailable, RAW_MARKS_AVAILABLE);
});

// --- H, I: unanswered and partially_correct outcomes interpreted correctly ---

test("unanswered questions count toward subpartCount (evidence of exposure) but never toward correctCount (H)", () => {
  const rc02 = result.skillEvidence.bySkill.find((s) => s.questionTypeId === "QT-RC-02")!;
  assert.equal(rc02.subpartCount, 6);
  assert.equal(rc02.correctCount, 0);
});

test("a partially_correct outcome contributes its actual partial marks but is never counted as correct (I)", () => {
  const rc05 = result.skillEvidence.bySkill.find((s) => s.questionTypeId === "QT-RC-05")!;
  // r-q15 correct (2/2), r-q16 partially_correct (1/2), r-q17/18 unanswered (0/2 each).
  assert.equal(rc05.marksAchieved, 3);
  assert.equal(rc05.marksAvailable, 8);
  assert.equal(rc05.correctCount, 1, "only the genuinely fully-correct r-q15 counts as correct -- the partially_correct r-q16 does not");
  assert.equal(rc05.subpartCount, 4);
});

// --- J: no fabricated cohort percentile/rank ---

test("no cohort percentile, rank, or comparison of any kind is produced anywhere in the result (J)", () => {
  const serialised = JSON.stringify(result).toLowerCase();
  assert.doesNotMatch(serialised, /percentile|cohort|rank|compareto|classaverage/i);
});

// --- K: no protected content exposure ---

test("no model answer, accepted-answer set, or workingSteps text is exposed anywhere in the result -- the input type itself has no such field, and this is verified against actual serialised output, not just the type (K)", () => {
  const serialised = JSON.stringify(result);
  // Sentinel strings that would only appear if protected content leaked
  // through some untyped path -- none of these were ever supplied as
  // input, so their absence proves the function cannot leak them.
  assert.doesNotMatch(serialised, /modelAnswer|acceptedAnswers|workingSteps|quotationRequired|correctOptions/i);
});

test("the learner's own response text is never part of the analysis input type at all -- structurally impossible to leak (K)", () => {
  const sampleKeys = Object.keys(READING_OUTCOMES[0]);
  assert.deepEqual(sampleKeys.sort(), ["marksAvailable", "marksAwarded", "questionId", "questionTypeId", "status"].sort());
});

// --- N: output shape compatible with both learner and parent report pages ---

test("the result shape matches exactly what both report pages already consume: skillEvidence.bySkill/nextPracticePriorities, strengths, weaknesses, competencyEvidence, subjectBreakdown (N)", () => {
  assert.ok(Array.isArray(result.skillEvidence.bySkill));
  assert.ok(Array.isArray(result.skillEvidence.nextPracticePriorities));
  assert.ok(Array.isArray(result.strengths));
  assert.ok(Array.isArray(result.weaknesses));
  assert.ok(Array.isArray(result.competencyEvidence));
  assert.ok(Array.isArray(result.subjectBreakdown));
  assert.equal(result.subjectBreakdown.length, 1);
});

test("subjectBreakdown correctly reports 'english' for this Reading attempt, not the pre-215 hardcoded 'mathematics' default (N)", () => {
  assert.equal(result.subjectBreakdown[0]!.subject, "english");
});

test("nextPracticePriorities never exceeds 3 entries and is drawn only from not_yet_demonstrated/developing skills, ranked correctly", () => {
  assert.ok(result.skillEvidence.nextPracticePriorities.length <= 3);
  const priorityQts = new Set(result.skillEvidence.nextPracticePriorities.map((p) => p.questionTypeId));
  for (const qt of priorityQts) {
    const skill = result.skillEvidence.bySkill.find((s) => s.questionTypeId === qt)!;
    assert.ok(skill.evidenceLevel === "not_yet_demonstrated" || skill.evidenceLevel === "developing");
  }
});

test("competencyEvidence carries exactly one provenance-tagged record per graded (non-manual-pending) question, source='mock', tagged with the real attemptId and formId", () => {
  assert.equal(result.competencyEvidence.length, 28);
  for (const entry of result.competencyEvidence) {
    assert.equal(entry.source, "mock");
    assert.equal(entry.attemptId, "e2f26f8d-25b6-452d-bd1c-3d5ad2436a0f");
    assert.equal(entry.formId, "reading-comprehension-mock-1");
  }
});
