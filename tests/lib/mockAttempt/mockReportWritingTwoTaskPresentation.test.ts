import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * CSSE Two-Paper Mock, final learner acceptance — the exact, evidence-
 * confirmed defect: two genuinely independent, correctly-persisted
 * ali_writing_assessment records (Q1 complete, Q2 review_required) were
 * both already fetched (lib/mockAttempt/client.ts's getMockWritingAssessments,
 * a plain unbounded .select().eq(), unchanged) and both already rendered
 * in their own bordered <div> -- proven directly against the live
 * production report (network response showed 2 rows; rendered page text
 * showed a review_required message immediately followed by a DIFFERENT
 * assessment's own dimension levels) -- but NEITHER block ever carried a
 * task label or a "complete" status badge, so the two blocks read as one
 * garbled section with no way to tell them apart. This is a presentation-
 * only fix: a task label (from the real, persisted taskType, never the
 * internal question_id) and a status badge on every block, plus a stable
 * Q1-then-Q2 render order. No data re-fetch, no re-generation, no
 * combined score. This project has no jsdom/React Testing Library, so
 * this mirrors the established convention for this exact file: structural
 * source-text assertions against the real source.
 */

const SOURCE = fs.readFileSync("app/learning-intelligence/mock-report/[attemptId]/page.tsx", "utf8");

function extractFunctionBody(name: string): string {
  const match = SOURCE.match(new RegExp(`function ${name}\\([\\s\\S]*?\\n\\}`));
  if (!match) throw new Error(`function ${name} not found`);
  return match[0];
}

const section = extractFunctionBody("WritingAssessmentSection");

test("1/2: every assessment in the array is retrieved and rendered -- .map() over the full array, never a single-item shortcut", () => {
  assert.match(section, /orderedAssessments\.map\(\(assessment\) => \(/);
  assert.doesNotMatch(section, /assessments\[0\]/);
  assert.doesNotMatch(section, /\.find\(/);
});

test("3: each block's key and label are derived from the real, persisted identity -- questionId for the key, taskType for the label, never a shared/static id", () => {
  assert.match(section, /key=\{assessment\.questionId\}/);
  assert.match(section, /\{WRITING_TASK_LABEL\[assessment\.taskType\] \?\? assessment\.taskType\}/);
});

test("task labels are learner-friendly ('Writing Task 1'/'Writing Task 2'), never the raw internal question_id", () => {
  assert.match(SOURCE, /const WRITING_TASK_LABEL: Record<MockWritingAssessment\["taskType"\], string> = \{\s*\n\s*Q1: "Writing Task 1",\s*\n\s*Q2: "Writing Task 2",\s*\n\s*\};/);
  assert.doesNotMatch(section, /mock-writing-mindchange-01/);
  assert.doesNotMatch(section, /eng-q2-picturenarrative-oldshed/);
});

test("4/5/7: each block's status badge is computed independently from THAT assessment's own assessmentStatus -- no shared/hoisted status variable that could leak one task's state into the other", () => {
  const badgeBranches = section.match(/assessment\.assessmentStatus === "review_required" \? \(/g) ?? [];
  assert.equal(badgeBranches.length, 2, "expected the ternary to be evaluated independently twice: once for the badge, once for the body");
  assert.match(section, /<StatusIndicator tone="success" label="Assessment complete" \/>/);
  assert.match(section, /<StatusIndicator tone="warning" label="Review required" \/>/);
});

test("6: the five dimensions rendered for a complete assessment come from THAT SAME assessment object, scoped inside its own block -- never a variable shared across iterations", () => {
  assert.match(section, /\(assessment\.humanReviewDimensions \?\? assessment\.dimensions\)\.map\(\(d\) => \(/);
});

test("a review_required block never renders the dimension-levels body -- the two branches remain mutually exclusive per assessment", () => {
  const reviewBranch = section.split('assessment.assessmentStatus === "review_required" ? (')[2];
  assert.ok(reviewBranch);
  const trueBranch = reviewBranch.split(") : (")[0];
  assert.doesNotMatch(trueBranch, /humanReviewDimensions/);
});

test("8/9: rendering is safe for any array length (0, 1, or 2+) -- a plain .map() with no assumption of exactly two items, and the parent only renders this section when length > 0", () => {
  assert.match(SOURCE, /\{writingAssessments\.length > 0 && <WritingAssessmentSection assessments=\{writingAssessments\} \/>\}/);
  // .map() over an empty or single-item array is inherently safe; no length-based branching inside the component itself.
  assert.doesNotMatch(section, /assessments\.length === 2/);
  assert.doesNotMatch(section, /assessments\.length < 2/);
});

test("10: no combined/averaged Writing score is ever computed -- no summing or averaging of overallIndicator/dimensions across assessments", () => {
  assert.doesNotMatch(section, /overallIndicator/);
  assert.doesNotMatch(section, /reduce\(/);
  assert.doesNotMatch(section, /average/i);
});

test("render order is stable (Q1 before Q2) regardless of database/fetch order", () => {
  assert.match(section, /const orderedAssessments = \[\.\.\.assessments\]\.sort\(\(a, b\) => a\.taskType\.localeCompare\(b\.taskType\)\);/);
});

test("no assessment content is invented -- reviewRequiredReasons and dimension levels are read directly from the persisted assessment object, never hardcoded", () => {
  assert.match(section, /assessment\.reviewRequiredReasons/);
  assert.match(section, /WRITING_DIMENSION_LABEL\[d\.dimension\]/);
  assert.match(section, /label=\{d\.level\}/);
});

test("this fix does not touch data retrieval, persistence, or any scoring/analysis/release logic -- WritingAssessmentSection itself never references any write RPC", () => {
  assert.doesNotMatch(section, /mock_persist_writing_assessment/);
  assert.doesNotMatch(section, /mock_apply_manual_mark/);
  assert.doesNotMatch(section, /mock_release_report/);
  assert.doesNotMatch(section, /\.rpc\(/);
});
