import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Programme Completion Increment 004 (Founder-authorised Writing Practice
 * foundation) — structural/source-text assertions against app/writing/page.tsx,
 * mirroring the established convention (tests/lib/mockAttempt/
 * mockAvailabilityPresentation.test.ts) for pages where a full rendered-DOM
 * test isn't part of this project's setup.
 */

const WRITING_PAGE = readFileSync("app/writing/page.tsx", "utf8");

test("the page never imports the static fixture -- real content only", () => {
  assert.ok(!WRITING_PAGE.includes(`from "@/data/writing"`), "must not import data/writing.ts's static prompts");
  assert.match(WRITING_PAGE, /fetchEligibleWritingPrompts/, "must source content via the real ali_question_bank query");
});

test("prompts state starts empty and promptsLoaded starts false -- never a false 'ready' flash", () => {
  assert.match(WRITING_PAGE, /useState<WritingPrompt\[\]>\(\[\]\)/);
  assert.match(WRITING_PAGE, /useState\(false\)/);
});

test("readiness is derived from the authoritative predicate, not a separate ad-hoc condition", () => {
  assert.match(WRITING_PAGE, /const ready = promptsLoaded && isWritingPracticeReady\(prompts\)/);
});

test("the page renders an honest not-ready/loading state and never the prompt list when !ready", () => {
  assert.match(WRITING_PAGE, /if \(!ready\) \{/);
  assert.match(WRITING_PAGE, /Writing Practice isn't ready yet/);
  assert.match(WRITING_PAGE, /Checking for available Writing Practice/);
});

test("the not-ready state offers a genuine fallback (Practice), not a dead end", () => {
  assert.match(WRITING_PAGE, /Go to Practice/);
  assert.match(WRITING_PAGE, /href="\/learning-intelligence\/practice"/);
});

test("the not-ready copy names no internal system and promises no date", () => {
  const notReadyBlockMatch = WRITING_PAGE.match(/Writing Practice isn't ready yet[\s\S]{0,600}/);
  assert.ok(notReadyBlockMatch);
  const block = notReadyBlockMatch![0];
  assert.ok(!/ali_question_bank|eligibility_status|practice_eligible/i.test(block), "no internal implementation terminology in learner-facing copy");
  assert.ok(!/\b(20\d\d|january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(block), "must never promise a specific date");
});

test("the evidence-recording call site is unchanged -- reuses the existing rubric/feedback/evidence pipeline, no new engine built", () => {
  assert.match(WRITING_PAGE, /fetch\("\/api\/writing-feedback"/, "must still call the existing Writing feedback API");
  assert.match(WRITING_PAGE, /recordLegacyPracticeEvidence\(/, "must still use the existing evidence pipeline");
  assert.match(WRITING_PAGE, /supportTier: "supported"/, "the mastery-quarantine discipline must remain unchanged");
});
