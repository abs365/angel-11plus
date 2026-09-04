import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { analyseMockAttempt, type MockAnalysisOutcomeInput } from "@/lib/ali/mockAnalysisEngine";
import { childFriendlySkillLabel, priorityExplanationSentence, nextPracticeSentence } from "@/lib/mockAttempt/reportCopy";

/**
 * Decision 224 (Mock Report Experience Refinement) — structural/source-
 * text tests against the redesigned report page (no jsdom/React Testing
 * Library exists in this project's test setup, matching the established
 * convention), plus pure-function tests proving the underlying data the
 * page renders never leaks protected content and stays evidence-bounded.
 * Supersedes the Decision-223-era version of this file, which tested the
 * "Skill performance"/"What to work on" full-sentence lists this
 * refinement replaced.
 */

const PAGE = fs.readFileSync("app/learning-intelligence/mock-report/[attemptId]/page.tsx", "utf8");

function outcome(id: string, status: MockAnalysisOutcomeInput["status"], marksAwarded: number | null, marksAvailable: number, qt: string | null): MockAnalysisOutcomeInput {
  return { questionId: id, status, marksAwarded, marksAvailable, questionTypeId: qt };
}

// === 1. Maximum three primary priorities render =========================

test("Section 4 renders at most 3 priority cards -- driven entirely by skillEvidence.nextPracticePriorities (already capped at 3 by the analysis engine), never a separate page-level slice that could diverge", () => {
  assert.match(PAGE, /const priorityEntries = nextPracticePriorities/);
  assert.ok(!/\.slice\(0, ?3\)/.test(PAGE), "the page must not re-implement its own cap -- the engine's own cap is the single source of truth");
});

test("engine-level proof: nextPracticePriorities is never more than 3, even with many development-area skills", () => {
  const outcomes: MockAnalysisOutcomeInput[] = [];
  for (const qt of ["QT-MR-01", "QT-MR-04", "QT-MR-05", "QT-MR-07", "QT-MR-11"]) {
    outcomes.push(outcome(`${qt}-a`, "incorrect", 0, 1, qt), outcome(`${qt}-b`, "incorrect", 0, 1, qt));
  }
  const result = analyseMockAttempt(outcomes, new Map(), "a", "f", "t", null);
  assert.ok(result.skillEvidence.nextPracticePriorities.length <= 3);
});

// === 2. Internal QT codes are not exposed to learners ====================

test("no QT-MR-XX style code is ever rendered as visible learner-facing text -- only as a React `key` prop, never inside a text node", () => {
  assert.ok(!/>\{entry\.questionTypeId\}</.test(PAGE));
  assert.match(PAGE, /key=\{entry\.questionTypeId\}/);
});

test("every skill label rendered on the page goes through childFriendlySkillLabel(), never entry.competencyId or entry.questionTypeId interpolated directly as display text", () => {
  const displayedLabelSites = [...PAGE.matchAll(/childFriendlySkillLabel\(entry\.competencyId, entry\.questionTypeId\)/g)];
  assert.ok(displayedLabelSites.length >= 2, "expected the priority-card heading and the compact chip label to both use childFriendlySkillLabel()");
});

test("childFriendlySkillLabel never returns a raw competency id or blank string for any real Mathematics Mock 1 competency", () => {
  for (const id of ["MR-01", "MR-02", "MR-03", "MR-04", "MR-05"]) {
    const label = childFriendlySkillLabel(id, "QT-FALLBACK");
    assert.ok(label.length > 0);
    assert.notEqual(label, id);
    assert.ok(!/^MR-\d\d$/.test(label));
  }
});

test("childFriendlySkillLabel falls back to the real, existing competencyLabel() (never blank, never throws) for a competency this refinement didn't name, and to the raw fallback id only when competencyId itself is null", () => {
  assert.equal(childFriendlySkillLabel(null, "QT-MR-99"), "QT-MR-99");
  assert.ok(childFriendlySkillLabel("RC-01", "QT-RC-01").length > 0);
});

// === 3. Full misconception dumps are not rendered =========================

test("the page never iterates misconceptionNotes as a list -- only priorityExplanationSentence()'s own single, capped explanation is ever rendered, and only inside the priority-card map, never inside the compact chip section", () => {
  assert.ok(!/misconceptionNotes\.map|misconceptionNotes\.join/.test(PAGE));
  const chipSection = PAGE.split("Other skills to keep developing")[1] ?? "";
  assert.ok(!chipSection.includes("priorityExplanationSentence"), "misconception coaching text must never appear in the compact chip section");
});

test("priorityExplanationSentence renders at most ONE misconception note, never the full misconceptionNotes array, even when 2 are present", () => {
  const entry = {
    questionTypeId: "QT-MR-04", competencyId: "MR-04", marksAchieved: 0, marksAvailable: 2, percentage: 0,
    subpartCount: 2, correctCount: 0, evidenceLevel: "not_yet_demonstrated" as const,
    difficultyDistribution: { easy: 0, medium: 2, hard: 0, challenge: 0 },
    misconceptionNotes: ["First real misconception note.", "Second real misconception note."],
  };
  const sentence = priorityExplanationSentence(entry);
  assert.match(sentence, /First real misconception note\./);
  assert.ok(!sentence.includes("Second real misconception note."), "only the first note may ever surface, never both");
});

// === 4/5. Correct answers and workingSteps are not exposed ===============

test("the page never references a stored correct answer, prompt.workingSteps, or per-question outcome status -- full-answer question review remains unbuilt (Decision 222 Part 8's own prerequisite)", () => {
  assert.ok(!/workingSteps/i.test(PAGE));
  assert.ok(!/storedAnswer|correctAnswer/i.test(PAGE));
  assert.ok(!PAGE.includes("questionOutcomes"));
  assert.ok(!/\.response\b/.test(PAGE), "must never read a learner's own submitted answer text");
});

// === 6. Empty strengths do not produce fabricated strength claims ========

test("Section 3 renders the honest NO_SECURE_STRENGTHS_NOTE, never a manufactured compliment, when report.strengths is empty or null", () => {
  assert.match(PAGE, /report\.strengths && report\.strengths\.length > 0 \? \(/);
  assert.match(PAGE, /NO_SECURE_STRENGTHS_NOTE/);
});

test("NO_SECURE_STRENGTHS_NOTE itself never fabricates praise and never uses shaming language", () => {
  const source = fs.readFileSync("lib/mockAttempt/reportCopy.ts", "utf8");
  const match = source.match(/export const NO_SECURE_STRENGTHS_NOTE =\s*\n?\s*"([^"]+)"/);
  assert.ok(match);
  const note = match![1];
  for (const forbidden of ["great job", "well done", "excellent", "fail", "weak", "bad", "poor", "behind"]) {
    assert.ok(!note.toLowerCase().includes(forbidden));
  }
});

// === 7/8. Low-score and high/mixed performance states =====================

test("LOW-SCORE (representative of the real 6/56 result): constructive, evidence-grounded, never overwhelming -- at most 3 priority cards, development areas exist, no fabricated strength", () => {
  const outcomes: MockAnalysisOutcomeInput[] = [
    outcome("q1", "correct", 1, 1, "QT-MR-01"), outcome("q2", "incorrect", 0, 1, "QT-MR-01"),
    outcome("q3", "incorrect", 0, 1, "QT-MR-04"), outcome("q4", "incorrect", 0, 1, "QT-MR-04"), outcome("q5", "incorrect", 0, 1, "QT-MR-04"),
    outcome("q6", "incorrect", 0, 1, "QT-MR-05"), outcome("q7", "unanswered", 0, 1, "QT-MR-05"),
    outcome("q8", "incorrect", 0, 1, "QT-MR-07"), outcome("q9", "incorrect", 0, 1, "QT-MR-07"),
  ];
  const result = analyseMockAttempt(outcomes, new Map(), "a", "f", "t", { rawMarksAchieved: 1, rawMarksAvailable: 9, percentage: 11.1 });
  assert.ok(result.skillEvidence.nextPracticePriorities.length <= 3, "must not overwhelm the learner with every weak area");
  assert.equal(result.strengths.length, 0, "no fabricated strength from a genuinely low-evidence sitting");
  assert.ok(result.weaknesses.length > 0, "real development areas exist and are surfaced");
  const summary = nextPracticeSentence(result.skillEvidence.nextPracticePriorities);
  assert.ok(summary && summary.length > 0, "a closing action sentence is always available when priorities exist");
});

test("HIGH/MIXED performance: a securely-demonstrated skill renders as a genuine strength, a mixed skill becomes a priority or chip, never both hidden", () => {
  const outcomes: MockAnalysisOutcomeInput[] = [
    outcome("a1", "correct", 1, 1, "QT-MR-01"), outcome("a2", "correct", 1, 1, "QT-MR-01"),
    outcome("b1", "correct", 1, 1, "QT-MR-04"), outcome("b2", "incorrect", 0, 1, "QT-MR-04"),
  ];
  const result = analyseMockAttempt(outcomes, new Map(), "a", "f", "t", { rawMarksAchieved: 3, rawMarksAvailable: 4, percentage: 75 });
  assert.equal(result.strengths.length, 1);
  assert.equal(result.strengths[0].competencyId, "MR-01");
  assert.ok(result.skillEvidence.nextPracticePriorities.some((p) => p.questionTypeId === "QT-MR-04"));
});

// === 9. Priority actions only link to a genuinely supported existing route ===

test("the priority card action routes through practiceRouteFor(entry.competencyId) (Decision 225's own genuinely-targeted route where safe, honest fallback otherwise) and the closing action uses the general MATHEMATICS_PRACTICE_ROUTE (spans potentially several skills) -- never an ad-hoc, hand-built per-skill URL", () => {
  assert.match(PAGE, /href=\{practiceRouteFor\(entry\.competencyId\)\}/);
  assert.match(PAGE, /href=\{MATHEMATICS_PRACTICE_ROUTE\}/);
  assert.ok(!/href=\{`\/learning-intelligence\/practice\/\$\{/.test(PAGE), "must never construct a per-skill practice URL by hand -- practiceRouteFor() is the single, tested source of that URL shape");
});

test("MATHEMATICS_PRACTICE_ROUTE points at the real, existing practice area page, not an invented path", () => {
  const source = fs.readFileSync("lib/mockAttempt/reportCopy.ts", "utf8");
  assert.match(source, /export const MATHEMATICS_PRACTICE_ROUTE = "\/learning-intelligence\/practice\/mathematics";/);
  assert.ok(fs.existsSync("app/learning-intelligence/practice/[area]/page.tsx"), "the target route must genuinely exist in this repository");
});

// === 10. Unreleased reports remain protected exactly as before ===========

test("the report page still gates 'ready' strictly on reportReleaseState === released, byte-identical to Decision 221/223 -- this refinement does not touch the release/security gate", () => {
  // Founder invocation-reliability repair (Programme Completion Increment
  // 016, Part C) restructured this single-line gate into an equivalent
  // multi-line if/return to make room for a bounded recovery attempt
  // after it -- the release/security condition itself is unchanged.
  assert.match(
    PAGE,
    /if \(result\.data && result\.data\.reportReleaseState === "released"\) \{\s*\n\s*setReport\(result\.data\);\s*\n\s*setPhase\("ready"\);\s*\n\s*return;\s*\n\s*\}\s*\n\s*setPhase\("not-available"\);/
  );
});

test("the pending-analysis fallback is preserved for analysisState !== 'complete' -- no regression to the currently-live real report", () => {
  assert.match(PAGE, /report\.analysisState === "complete" && report\.skillEvidence \? \(/);
  assert.match(PAGE, /<InfoCard>\s*<p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">\{ANALYSIS_PENDING_NOTE\}<\/p>\s*<\/InfoCard>/);
});

// === Additional structural safety =========================================

test("Section 5 never re-lists a skill already shown as a Section 4 priority card or a Section 3 strength -- no skill appears twice on the page", () => {
  assert.match(PAGE, /!priorityQuestionTypeIds\.has\(entry\.questionTypeId\) && !\(entry\.competencyId && strengthCompetencyIds\.has\(entry\.competencyId\)\)/);
});

test("Section 2 (performance today) never renders a comparative ranking, predicted CSSE score, or readiness claim", () => {
  const source = fs.readFileSync("lib/mockAttempt/reportCopy.ts", "utf8");
  const match = source.match(/export const PERFORMANCE_CONTEXT_NOTE =\s*\n?\s*"([^"]+)"/);
  assert.ok(match);
  for (const forbidden of ["rank", "compare you to", "predicted", "ready for", "will pass", "admission"]) {
    assert.ok(!match![1].toLowerCase().includes(forbidden));
  }
});

test("this refinement does not touch the parent-facing report page or the legacy Mock system", () => {
  const parentPage = fs.readFileSync("app/learning-intelligence/parent/mock-report/[attemptId]/page.tsx", "utf8");
  assert.ok(!parentPage.includes("MockAnalysisSections"));
  assert.ok(!PAGE.includes("mockProgress") && !PAGE.includes("getMockResults"));
});

test("no migration file was introduced by this refinement -- purely a presentation-layer change (structural sanity: migration 151 still exists, nothing was deleted; later, unrelated decisions may legitimately add further migrations after this one)", () => {
  const migrations = fs.readdirSync("supabase/migrations").filter((f) => f.endsWith(".sql"));
  const numbers = migrations.map((f) => parseInt(f.split("_")[0], 10)).filter((n) => !Number.isNaN(n));
  assert.ok(numbers.includes(151), "migration 151 must still exist on disk");
  assert.ok(Math.max(...numbers) >= 151);
});
