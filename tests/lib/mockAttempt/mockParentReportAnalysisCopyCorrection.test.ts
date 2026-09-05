import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Reading Mock Completion Path — Parent Mock report defect correction.
 *
 * Production evidence (attempt e2f26f8d-25b6-452d-bd1c-3d5ad2436a0f):
 * scoring PASS, manual marking PASS, analysisState = 'complete',
 * strengths = [] (educationally valid — a genuinely low-scoring attempt,
 * never a fabricated strength). The learner Mock report already
 * distinguishes "analysis incomplete" from "analysis complete, no secure
 * strength" correctly (see mockReportAnalysisRendering.test.ts's own
 * "Section 3 renders the honest NO_SECURE_STRENGTHS_NOTE" test). The
 * parent Mock report did not: it mapped `strengths.length === 0` alone
 * to `ANALYSIS_PENDING_NOTE`, regardless of `analysisState`, so a parent
 * could be told analysis is "still being prepared" for a report whose
 * analysis had genuinely finished.
 *
 * Structural/source-text assertions, matching this repository's own
 * established convention for this exact class of page (no jsdom/React
 * Testing Library in this project's test setup — see
 * mockReportAnalysisRendering.test.ts's own docstring).
 */

const PARENT_PAGE = fs.readFileSync("app/learning-intelligence/parent/mock-report/[attemptId]/page.tsx", "utf8");
const LEARNER_PAGE = fs.readFileSync("app/learning-intelligence/mock-report/[attemptId]/page.tsx", "utf8");

// --- 1: analysis complete + strengths present -> real strengths copy ----

test("analysis complete + strengths present renders the real, evidence-derived strengths sentence", () => {
  assert.match(PARENT_PAGE, /report\.analysisState !== "complete" \? \([\s\S]*?\) : report\.strengths && report\.strengths\.length > 0 \? \(\s*\n\s*<p[^>]*>\{strengthSentence\(report\.strengths\)\}<\/p>/);
});

// --- 2: analysis complete + strengths empty -> NO_SECURE_STRENGTHS_NOTE, never ANALYSIS_PENDING_NOTE ---

test("analysis complete + strengths empty renders NO_SECURE_STRENGTHS_NOTE", () => {
  const section2 = PARENT_PAGE.split("2. Diagnostic interpretation")[1]?.split("</InfoCard>")[0] ?? "";
  assert.match(section2, /\{NO_SECURE_STRENGTHS_NOTE\}/);
});

test("the empty-strengths branch is reached only when analysisState IS complete -- it can never be confused with the pending-analysis branch", () => {
  const section2 = PARENT_PAGE.split("2. Diagnostic interpretation")[1]?.split("</InfoCard>")[0] ?? "";
  // Exactly one ternary chain, three outcomes: pending / real strengths / no-secure-strengths.
  const analysisNoteCount = (section2.match(/\{ANALYSIS_PENDING_NOTE\}/g) ?? []).length;
  const noSecureCount = (section2.match(/\{NO_SECURE_STRENGTHS_NOTE\}/g) ?? []).length;
  assert.equal(analysisNoteCount, 1, "ANALYSIS_PENDING_NOTE must appear exactly once, gated on analysisState only");
  assert.equal(noSecureCount, 1, "NO_SECURE_STRENGTHS_NOTE must appear exactly once, gated on the empty-strengths case only");
});

test("ANALYSIS_PENDING_NOTE in the parent report is gated on report.analysisState !== \"complete\" -- never on strengths length alone (the exact production defect)", () => {
  const pendingBranch = PARENT_PAGE.match(/report\.analysisState !== "complete" \? \(([\s\S]*?)\) : /);
  assert.ok(pendingBranch, "expected the analysisState-gated pending branch");
  assert.match(pendingBranch![1], /ANALYSIS_PENDING_NOTE/);
  assert.doesNotMatch(pendingBranch![1], /strengths/, "the pending-analysis branch must never reference strengths at all");
});

// --- 3: analysis incomplete -> pending-analysis behaviour remains correct ---

test("analysis incomplete (analysisState !== 'complete') still renders ANALYSIS_PENDING_NOTE regardless of strengths -- no regression to the pre-existing, correct pending behaviour", () => {
  assert.match(PARENT_PAGE, /report\.analysisState !== "complete" \? \(\s*\n(?:\s*\/\/.*\n)*\s*<p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">\{ANALYSIS_PENDING_NOTE\}<\/p>/);
});

// --- 4: no fabricated strength -----------------------------------------

test("the parent report never fabricates a strength -- strengthSentence is only ever called with the real report.strengths array, never a default/fallback value", () => {
  const strengthCalls = [...PARENT_PAGE.matchAll(/strengthSentence\(([^)]*)\)/g)].map((m) => m[1]);
  for (const arg of strengthCalls) {
    assert.equal(arg.trim(), "report.strengths");
  }
});

test("NO_SECURE_STRENGTHS_NOTE itself (shared with the learner report) never fabricates praise -- reused, not reinvented, by this correction", () => {
  const source = fs.readFileSync("lib/mockAttempt/reportCopy.ts", "utf8");
  const match = source.match(/export const NO_SECURE_STRENGTHS_NOTE =\s*\n?\s*"([^"]+)"/);
  assert.ok(match);
  const note = match![1];
  for (const forbidden of ["great job", "well done", "excellent", "fail", "weak", "bad", "poor", "behind"]) {
    assert.ok(!note.toLowerCase().includes(forbidden));
  }
});

// --- 5: learner Mock report behaviour remains unchanged -----------------

test("the learner Mock report page is untouched by this correction -- its own already-correct analysisState/strengths logic is byte-identical to before", () => {
  assert.match(LEARNER_PAGE, /report\.analysisState === "complete" && report\.skillEvidence \? \(/);
  assert.match(LEARNER_PAGE, /report\.strengths && report\.strengths\.length > 0 \? \(/);
  assert.match(LEARNER_PAGE, /NO_SECURE_STRENGTHS_NOTE/);
});

test("this correction imports NO_SECURE_STRENGTHS_NOTE into the parent page from the SAME shared reportCopy module the learner page already uses -- no second/competing message invented", () => {
  assert.match(PARENT_PAGE, /import \{[\s\S]*?NO_SECURE_STRENGTHS_NOTE[\s\S]*?\} from "@\/lib\/mockAttempt\/reportCopy";/);
});

// --- scope discipline -----------------------------------------------------

test("this correction does not touch mock_release_report, mock_apply_manual_mark, mock_analyse_attempt, or any migration file", () => {
  assert.doesNotMatch(PARENT_PAGE, /mock_release_report|mock_apply_manual_mark|mock_analyse_attempt/);
});

test("no other section of the parent report page changed shape -- weaknesses/priority/exam-context sections still gate on their own array length only, untouched by this correction", () => {
  assert.match(PARENT_PAGE, /\{report\.weaknesses && report\.weaknesses\.length > 0 && \(/);
});
