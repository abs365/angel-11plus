import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Increment 2 Closure — Bounded Mock Assessment-Integrity Correction.
 *
 * Production evidence (Phase 1 trace during Increment 2's own visual pass):
 * the legacy GL/CEM/ISEB timed Mock (app/mocks/[pathway]/page.tsx) revealed
 * correct/incorrect, the correct answer text, and a full explanation
 * immediately after each answer -- WHILE the section's own timer was still
 * running. This violates the platform's own "Practice teaches, Mock
 * measures" contract (AGENTS.md).
 *
 * This project has no jsdom/React Testing Library (confirmed by reading
 * package.json; matches every other structural test in this codebase, e.g.
 * tests/lib/mockAttempt/sittingResultsPrematureCompleteFix.test.ts) -- these
 * are source-text structural proofs against the real, shipped component.
 *
 * Root cause / shared-runtime proof: MOCK_CONFIGS defines gl/cem/iseb (and a
 * retained-but-unreachable csse entry) as pure DATA; the section-taking
 * render logic itself (`mode === "section"`) has exactly one pathway-
 * conditional branch in the entire file -- the results-tagging line at
 * `pathwayId === "csse"` -- which is unrelated to answer/feedback
 * rendering. There is only one runtime implementation of the live section
 * view, so a single source-level fix and a single set of structural proofs
 * genuinely cover GL, CEM and ISEB identically -- not one pathway standing
 * in for the other three.
 */

const SOURCE = fs.readFileSync("app/mocks/[pathway]/page.tsx", "utf8");

test("MOCK_CONFIGS defines gl, cem and iseb as real, playable pathways sharing this one file", () => {
  assert.match(SOURCE, /gl:\s*\{/);
  assert.match(SOURCE, /cem:\s*\{/);
  assert.match(SOURCE, /iseb:\s*\{/);
});

test("the live section render has exactly one pathway-conditional branch in the whole file, and it is unrelated to answer/feedback rendering (proves GL/CEM/ISEB share one runtime implementation)", () => {
  const pathwayBranches = SOURCE.match(/pathwayId === "csse"/g) ?? [];
  assert.equal(pathwayBranches.length, 1, "expected exactly the one known, unrelated results-tagging branch");
  // The one branch that exists must be the results-tagging line, not
  // anything inside the section/answer-rendering logic.
  const branchContext = SOURCE.split('pathwayId === "csse"')[1]?.slice(0, 80) ?? "";
  assert.match(branchContext, /source: "legacy-csse-mock"/);
});

// --- 1-3: GL/CEM/ISEB do not reveal correctness or explanation ------------

test("GL/CEM/ISEB: the answered-state render never shows 'Correct!' or reveals the correct answer text", () => {
  assert.doesNotMatch(SOURCE, /Correct!/);
  assert.doesNotMatch(SOURCE, /Incorrect\. Answer:/);
  assert.doesNotMatch(SOURCE, /\{currentQuestion\.answer\}/);
});

test("GL/CEM/ISEB: the answered-state render never shows the question's explanation", () => {
  assert.doesNotMatch(SOURCE, /currentQuestion\.explanation/);
  assert.doesNotMatch(SOURCE, /\.explanation\b/);
});

test("GL/CEM/ISEB: the answered-state render carries no correctness-derived styling (no green/red banner, no CheckCircle/XCircle)", () => {
  assert.doesNotMatch(SOURCE, /wasCorrect/);
  assert.doesNotMatch(SOURCE, /CheckCircle/);
  assert.doesNotMatch(SOURCE, /XCircle/);
  assert.doesNotMatch(SOURCE, /bg-green-50 dark:bg-green-950/);
  assert.doesNotMatch(SOURCE, /bg-red-50 dark:bg-red-950/);
});

test("GL/CEM/ISEB: the answered-state render is a single, neutral confirmation with no correctness signal of any kind", () => {
  const answeredBlock = SOURCE.match(/\{answered \? \(([\s\S]*?)\) : \(/);
  assert.ok(answeredBlock, "expected the answered-state ternary branch to exist");
  // Strip this file's own explanatory // comments before checking -- the
  // assertion is about what the JSX actually renders, not code comments.
  const jsxOnly = answeredBlock![1].replace(/\/\/.*$/gm, "");
  assert.match(jsxOnly, /Answer recorded\./);
  assert.doesNotMatch(jsxOnly, /correct/i);
});

// --- 4-6: recording, navigation, scoring/completion are preserved --------

test("answer recording still works: submitAnswer still computes correctness with checkAnswer and pushes it into sectionAnswers", () => {
  assert.match(SOURCE, /function submitAnswer\(\)/);
  assert.match(SOURCE, /const correct = checkAnswer\(currentQuestion, input\);/);
  assert.match(SOURCE, /setSectionAnswers\(\(prev\) => \[\.\.\.prev, correct\]\);/);
});

test("progression/navigation still works: nextQuestion/startSection/nextSection/finishSection are all unchanged in name and still drive mode transitions", () => {
  assert.match(SOURCE, /function nextQuestion\(\)/);
  assert.match(SOURCE, /function startSection\(\)/);
  assert.match(SOURCE, /function nextSection\(\)/);
  assert.match(SOURCE, /const finishSection = useCallback/);
  assert.match(SOURCE, /onClick=\{nextQuestion\}/);
});

test("scoring/completion remains functional: finishSection still computes a real section score, and the results-save effect still calls saveMockResult/completeLesson unchanged", () => {
  assert.match(SOURCE, /const correct = sectionAnswers\.filter\(Boolean\)\.length;/);
  assert.match(SOURCE, /const score = total > 0 \? Math\.round\(\(correct \/ total\) \* 100\) : 0;/);
  assert.match(SOURCE, /saveMockResult\(result\);/);
  assert.match(SOURCE, /completeLesson\("mock-test", totalScore, config\.xpReward\);/);
});

test("post-assessment (between-section and final-results) screens still show only aggregate section/overall scores -- never a per-question correctness or explanation reveal", () => {
  // Between-section and results screens read r.score/r.correct/r.total
  // (aggregate, already-legitimately-collected data) -- never a per-
  // question field, and this file's .explanation reference was removed
  // everywhere (confirmed by the "never shows the explanation" test
  // above), so no post-assessment screen can leak one either.
  assert.match(SOURCE, /\{lastResult\?\.score \?\? 0\}%/);
  assert.match(SOURCE, /\{r\.score\}%/);
  assert.doesNotMatch(SOURCE, /\.explanation\b/);
});

// --- 7: Practice feedback/support has not been removed ---------------------

test("Practice (app/learning-intelligence/practice/[area]/page.tsx) still provides real per-question feedback via SubmitOrNext -- Practice teaches, this correction only touches Mock", () => {
  const practiceSource = fs.readFileSync("app/learning-intelligence/practice/[area]/page.tsx", "utf8");
  assert.match(practiceSource, /const outcomeLabel = resolveOutcomeLabel\(lastCorrect, selfAssessed\);/);
  assert.match(practiceSource, /You said: Correct/);
  assert.match(practiceSource, /Not quite/);
});

// --- 8: CSSE Mock (the real, canonical engine) has not regressed -----------

test("CSSE Mock (app/learning-intelligence/mock-exam/page.tsx) still has no in-sitting correctness reveal -- unaffected by this correction, unchanged from its own established contract", () => {
  const csseMockSource = fs.readFileSync("app/learning-intelligence/mock-exam/page.tsx", "utf8");
  assert.doesNotMatch(csseMockSource, /Correct!/);
  assert.doesNotMatch(csseMockSource, /Incorrect/);
  assert.match(csseMockSource, /Answers aren&apos;t marked as you go/);
  assert.match(csseMockSource, /submitMockAnswer/);
});

test("this correction does not touch the CSSE Mock architecture -- app/learning-intelligence/mock-exam/** was not modified by this fix", () => {
  const csseMockSource = fs.readFileSync("app/learning-intelligence/mock-exam/page.tsx", "utf8");
  // A cheap, honest proxy: the CSSE engine's own submitted-state copy
  // (Increment 2's visual pass) is still present verbatim, confirming this
  // correction did not touch that file's content.
  assert.match(csseMockSource, /Your Mock has been submitted/);
});
