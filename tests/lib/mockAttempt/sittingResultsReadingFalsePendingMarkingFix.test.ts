import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * CSSE Two-Paper Mock, final learner acceptance correction — Defect 1.
 * Real Founder acceptance evidence: the combined sitting result showed
 * "Reading Comprehension: 2 / 41 marks (some items awaiting marking)"
 * even though Reading itself had no outstanding marking (all 22 items
 * resolved: 17 deterministic + 5 legitimately marked 0 for no learner
 * response). Root cause: this caveat was driven by report.overall.
 * percentage !== null, which mock_persist_reading_scoring() (migration
 * 251) sets to null whenever ANY entry in question_outcomes is still
 * 'requires_manual_marking' -- and English's own two Writing questions
 * remain at that status PERMANENTLY by design (their real qualitative
 * assessment lives entirely in ali_writing_assessment, never in
 * question_outcomes), even once genuinely, correctly assessed. So this
 * caveat could never turn off for english-full-mock-v1, regardless of
 * Reading's own real state.
 *
 * Fix: derive Reading's own outstanding-marking state directly from
 * question_outcomes, explicitly excluding the attempt's own known Writing
 * question ids (from the already-fetched `writing` array) -- the same
 * evidence-based exclusion migration 251's own mock_check_and_complete_
 * scoring() already applies for the identical reason. rawMarksAchieved/
 * rawMarksAvailable/percentage themselves are completely unchanged.
 *
 * This project has no jsdom/React Testing Library, so this mirrors the
 * established convention for this exact file: structural source-text
 * assertions against the real source.
 */

const SOURCE = fs.readFileSync("app/learning-intelligence/mock-exam/sitting/results/page.tsx", "utf8");

function extractFunctionBody(name: string): string {
  const match = SOURCE.match(new RegExp(`function ${name}\\([\\s\\S]*?\\n\\}`));
  if (!match) throw new Error(`function ${name} not found`);
  return match[0];
}

const englishSection = extractFunctionBody("EnglishSection");
const mathsSection = extractFunctionBody("MathematicsSection");

test("1: readingHasOutstandingMarking is derived from question_outcomes, excluding the attempt's own known Writing question ids -- not from report.overall.percentage", () => {
  assert.match(
    englishSection,
    /const writingQuestionIds = new Set\(writing\.map\(\(w\) => w\.questionId\)\);/
  );
  assert.match(
    englishSection,
    /const readingHasOutstandingMarking = \(report\.questionOutcomes \?\? \[\]\)\.some\(\s*\n\s*\(o\) => o\.status === "requires_manual_marking" && !writingQuestionIds\.has\(o\.questionId\)\s*\n\s*\);/
  );
});

test("a completed Reading result (no non-Writing item still requires_manual_marking) does not display the awaiting-marking caveat, even though report.overall.percentage is null", () => {
  assert.match(
    englishSection,
    /\{readingHasOutstandingMarking \? " \(some items awaiting marking\)" : report\.overall\.percentage !== null \? ` \(\$\{report\.overall\.percentage\}%\)` : ""\}/
  );
});

test("2: a Writing REVIEW_REQUIRED assessment can coexist with a completed Reading result -- the caveat's own condition never inspects writing assessment status directly, only question_outcomes minus known Writing ids", () => {
  assert.doesNotMatch(englishSection, /writing\[0\]\.assessmentStatus/);
  assert.doesNotMatch(englishSection, /writing\.some\(\(w\) => w\.assessmentStatus/);
});

test("4: rawMarksAchieved/rawMarksAvailable are read exactly as persisted, never recomputed or adjusted by this fix", () => {
  assert.match(englishSection, /\{report\.overall\.rawMarksAchieved\} \/ \{report\.overall\.rawMarksAvailable\} marks/);
});

test("5: no combined English/Mathematics score is introduced -- English and Mathematics remain two separate InfoCard sections, each with their own independent overall figure", () => {
  assert.doesNotMatch(SOURCE, /rawMarksAchieved.*\+.*rawMarksAchieved/);
  assert.match(mathsSection, /Mathematics<\/p>/);
  assert.match(englishSection, /English<\/p>/);
});

test("the Mathematics section's own caveat logic is completely untouched -- this fix is scoped to English/Reading only", () => {
  assert.match(mathsSection, /report\.overall\.percentage !== null \? ` \(\$\{report\.overall\.percentage\}%\)` : " \(some items awaiting marking\)"/);
  assert.doesNotMatch(mathsSection, /readingHasOutstandingMarking/);
});

test("this fix does not touch any scoring/analysis/release RPC -- EnglishSection remains presentation-only", () => {
  assert.doesNotMatch(englishSection, /\.rpc\(/);
  assert.doesNotMatch(englishSection, /mock_persist_reading_scoring|mock_apply_manual_mark|mock_analyse_attempt|mock_release_report/);
});
