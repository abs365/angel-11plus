import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Decision 223 — Mathematics Mock 1 Deterministic Mock Analysis Engine.
 * Structural/source-text tests against the report page's own rendering
 * of the new analysis sections. No jsdom/React Testing Library exists in
 * this project's test setup, matching the established convention
 * (mockAvailabilityPresentation.test.ts).
 */

const PAGE = fs.readFileSync("app/learning-intelligence/mock-report/[attemptId]/page.tsx", "utf8");

test("the analysis sections render ONLY when analysisState === 'complete' AND skillEvidence is present -- never for 'not_started'/'analysing'/'failed'", () => {
  assert.match(PAGE, /report\.analysisState === "complete" && report\.skillEvidence \?/);
});

test("the pending branch is preserved -- when analysis is not complete, the exact pre-existing ANALYSIS_PENDING_NOTE card still renders, byte-identical to before this decision (no regression to the currently-live real report, which has analysisState='not_started')", () => {
  const elseBranch = PAGE.match(/\) : \(\s*<InfoCard>\s*<p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">\{ANALYSIS_PENDING_NOTE\}<\/p>\s*<\/InfoCard>\s*\)\}/);
  assert.ok(elseBranch, "expected the exact pre-existing single-InfoCard ANALYSIS_PENDING_NOTE fallback to still exist");
});

test("Skill performance section renders only when bySkill has entries, uses skillPerformanceSentence for every row", () => {
  assert.match(PAGE, /report\.skillEvidence\.bySkill\.length > 0 &&/);
  assert.match(PAGE, /report\.skillEvidence\.bySkill\.map\(\(entry\) => \(/);
  assert.match(PAGE, /skillPerformanceSentence\(entry\)/);
});

test("What went well section: strengths.length > 0 uses the existing, unmodified strengthSentence(); empty case renders NO_STRENGTHS_YET_NOTE, never ANALYSIS_PENDING_NOTE (which would now be dishonest once analysis has genuinely completed)", () => {
  const wentWellBlock = PAGE.match(/\{report\.strengths && report\.strengths\.length > 0 \? \([\s\S]*?NO_STRENGTHS_YET_NOTE[\s\S]*?\)\}/);
  assert.ok(wentWellBlock);
  assert.match(wentWellBlock![0], /strengthSentence\(report\.strengths\)/);
  assert.match(wentWellBlock![0], /NO_STRENGTHS_YET_NOTE/);
});

test("What to work on section: gated on at least one not_yet_demonstrated/developing skill, uses developmentAreaSentence per entry, empty case renders NO_DEVELOPMENT_AREAS_NOTE", () => {
  assert.match(PAGE, /e\.evidenceLevel === "not_yet_demonstrated" \|\| e\.evidenceLevel === "developing"/);
  assert.match(PAGE, /developmentAreaSentence\(entry\)/);
  assert.match(PAGE, /NO_DEVELOPMENT_AREAS_NOTE/);
});

test("Next practice section renders only when nextPracticeSentence returns non-null -- never a padded/empty card", () => {
  assert.match(PAGE, /\{nextPracticeSentence\(report\.skillEvidence\.nextPracticePriorities\) && \(/);
});

test("SECURITY / QUESTION REVIEW BOUNDARY: the report page never renders question_outcomes, a stored answer, workingSteps, or per-question correct/incorrect detail -- full answer review is not built here (Decision 222 Part 8's own named prerequisite)", () => {
  assert.ok(!PAGE.includes("questionOutcomes"));
  assert.ok(!/workingSteps/i.test(PAGE));
  assert.ok(!/storedAnswer|correctAnswer/i.test(PAGE));
});

test("no internal QT-MR-XX style code is ever interpolated directly into learner-facing copy -- every render site uses a copy function or the entry's own competencyId, never entry.questionTypeId as display text", () => {
  // The only permitted appearance of questionTypeId in JSX is as a React
  // `key` prop (not rendered text) -- confirmed by checking it never
  // appears as `{...questionTypeId}` inside a text node.
  assert.ok(!/>\{entry\.questionTypeId\}</.test(PAGE));
  assert.match(PAGE, /key=\{entry\.questionTypeId\}/, "questionTypeId is expected only as a list key, never as displayed text");
});

test("does not fabricate strengths/weaknesses beyond what report.strengths/report.skillEvidence already contain -- no hardcoded competency label or mark count literal anywhere on this page", () => {
  assert.ok(!/Number and Calculation|Percentages|Geometry/.test(PAGE), "no hardcoded competency name -- every label must come from real data via competencyLabel()");
});

test("this decision does not add full-answer question review, a retirement mechanism, or a Parent Dashboard/Learning Report change to this file", () => {
  assert.ok(!/retired_from_mock|question_retirement/.test(PAGE));
});
