import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Programme Completion Increment 011 — Writing Learner Surface
 * Consolidation. Replaces writingPageReadinessGate.test.ts, which tested
 * app/writing/page.tsx's own bespoke readiness-gate implementation --
 * that implementation no longer exists on this route. `/writing` is now
 * a redirect into the canonical Practice engine
 * (`/learning-intelligence/practice/continuous-writing`), which already
 * has its own readiness/no-content-available handling
 * (generatePersonalisedSession's `noContentAvailable` path) -- this file
 * only proves the redirect itself, not the destination's own behaviour.
 */

const WRITING_PAGE = readFileSync("app/writing/page.tsx", "utf8");

test("app/writing/page.tsx is a bare server-component redirect, matching app/page.tsx's own established convention", () => {
  assert.match(WRITING_PAGE, /import \{ redirect \} from "next\/navigation";/);
  assert.match(WRITING_PAGE, /redirect\("\/learning-intelligence\/practice\/continuous-writing"\);/);
});

test("the route no longer independently re-implements content fetching, the checklist, or evidence recording", () => {
  assert.ok(!WRITING_PAGE.includes("fetchEligibleWritingPrompts"), "must not re-fetch content independently of the canonical engine");
  assert.ok(!WRITING_PAGE.includes("isWritingPracticeReady"), "must not re-implement its own readiness gate");
  assert.ok(!WRITING_PAGE.includes("recordLegacyPracticeEvidence"), "must not write evidence through a second path");
  assert.ok(!WRITING_PAGE.includes("/api/writing-feedback"), "must not call the feedback API directly -- the canonical engine's WritingActivity already does");
  assert.ok(!WRITING_PAGE.includes("\"use client\""), "a bare redirect needs no client component");
});

test("the redirect target is the real, existing continuous-writing practice area id, not an invented route", () => {
  const practiceContent = readFileSync("lib/learningEngine/practiceContent.ts", "utf8");
  assert.match(practiceContent, /id:\s*"continuous-writing"/);
});

test("no new Writing engine was introduced: the file is short and contains no new fetch/state/effect logic", () => {
  assert.ok(!/useState|useEffect|fetch\(/.test(WRITING_PAGE), "a redirect page must contain no data-fetching or component state of its own");
});
