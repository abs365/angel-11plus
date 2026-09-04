import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Programme Increment 021, Founder Amendment — "Teaching must mean
 * teaching." Structural proofs against the real page source, matching
 * this codebase's established convention (no @testing-library/React-
 * rendering infrastructure exists here). Complements
 * tests/lib/learningEngine/increment021PreparationHorizonPersonas.test.ts
 * (decision-level proofs) and tests/app/increment021PlacementAndPracticeWiring.test.ts
 * (the original Preparation Horizon wiring, unaffected by this amendment).
 */

const PRACTICE_PAGE = fs.readFileSync("app/learning-intelligence/practice/[area]/page.tsx", "utf8");
const ARITHMETIC_LESSON = fs.readFileSync("app/learning-intelligence/learn/mathematics/arithmetic/page.tsx", "utf8");
const PERCENTAGES_LESSON = fs.readFileSync("app/learning-intelligence/learn/mathematics/percentages/page.tsx", "utf8");
const COMPOUND_SHAPES_LESSON = fs.readFileSync("app/learning-intelligence/learn/mathematics/compound-shapes/page.tsx", "utf8");

// ─── 1/2/3. Real routing decision, using the existing lesson registry ──────

test("teaching_lesson + a real full lesson: the practice page routes to that real lesson via the existing FULL_LESSON_ROUTE registry, not a second lesson mechanism", () => {
  assert.match(PRACTICE_PAGE, /from "@\/lib\/learningEngine\/fullLessonRegistry"/);
  assert.match(PRACTICE_PAGE, /FULL_LESSON_ROUTE\[decision\.recommendedCompetencyId\]/);
  assert.match(PRACTICE_PAGE, /decision\.recommendedActivityType === "teaching_lesson" && lessonRoute/);
  assert.match(PRACTICE_PAGE, /router\.replace\(lessonRoute\)/);
});

test("teaching_lesson + NO real lesson available: falls through to ordinary (weight-biased) Practice, never a false teaching claim -- the redirect condition requires lessonRoute to be truthy", () => {
  // The condition is `decision.recommendedActivityType === "teaching_lesson" && lessonRoute && !skipTeachingLessonRedirect`
  // -- when lessonRoute is undefined (FULL_LESSON_ROUTE has no entry for
  // this competency), the whole condition is false and execution falls
  // through to the existing preparationContext/generatePersonalisedSession
  // path below, unchanged. No separate "pretend we taught you" branch exists.
  const routingBlock = PRACTICE_PAGE.slice(PRACTICE_PAGE.indexOf("const lessonRoute ="), PRACTICE_PAGE.indexOf("preparationContext = {"));
  assert.match(routingBlock, /lessonRoute && !skipTeachingLessonRedirect/);
  assert.ok(!/teaching_lesson.*claim|has taught|lesson completed automatically/i.test(routingBlock), "no fabricated teaching-occurred claim must exist in this fallback path");
});

test("guided_practice is never routed to a full lesson -- only teaching_lesson triggers the lesson redirect, preserving the Founder's own explicit distinction", () => {
  const routingBlock = PRACTICE_PAGE.slice(PRACTICE_PAGE.indexOf("const lessonRoute ="), PRACTICE_PAGE.indexOf("preparationContext = {"));
  assert.ok(!/guided_practice/.test(routingBlock), "guided_practice must not appear in the lesson-redirect condition at all");
  assert.match(routingBlock, /=== "teaching_lesson"/, "only the literal teaching_lesson activity type gates the lesson redirect");
});

// ─── 6/7. Loop safety ───────────────────────────────────────────────────────

test("lesson completion can proceed into Practice, and doing so cannot immediately bounce back to the same lesson -- every lesson's own 'ready to practise' links carry skipTeachingRedirect=1", () => {
  for (const [name, source] of [["arithmetic", ARITHMETIC_LESSON], ["percentages", PERCENTAGES_LESSON], ["compound-shapes", COMPOUND_SHAPES_LESSON]] as const) {
    const practiceLinks = [...source.matchAll(/href="\/learning-intelligence\/practice\/mathematics([^"]*)"/g)];
    assert.ok(practiceLinks.length > 0, `${name} lesson must link into Practice`);
    for (const link of practiceLinks) {
      assert.match(link[1], /skipTeachingRedirect=1/, `${name} lesson's own Practice link must carry skipTeachingRedirect=1 so returning from the lesson always reaches a real session`);
    }
  }
});

test("the practice page reads skipTeachingRedirect from its own search params and genuinely uses it to suppress the lesson redirect for one load", () => {
  assert.match(PRACTICE_PAGE, /skipTeachingRedirect\?:\s*string/);
  assert.match(PRACTICE_PAGE, /skipTeachingRedirect === "1"/);
});

test("no lesson page auto-redirects back into Practice on its own -- every lesson's own Practice link is a real, explicit <Link>, never a programmatic redirect the learner didn't choose", () => {
  for (const [name, source] of [["arithmetic", ARITHMETIC_LESSON], ["percentages", PERCENTAGES_LESSON], ["compound-shapes", COMPOUND_SHAPES_LESSON]] as const) {
    assert.ok(!/router\.(replace|push)\(.*practice\/mathematics/.test(source), `${name} lesson must never programmatically redirect into Practice -- only an explicit learner click (a real <Link>) may do so`);
  }
});

test("this amendment introduces no new persistent learner state or schema -- the loop-safety mechanism is a plain, one-time URL query flag only", () => {
  assert.ok(!/localStorage|sessionStorage/.test(PRACTICE_PAGE.slice(PRACTICE_PAGE.indexOf("skipTeachingLessonRedirect"), PRACTICE_PAGE.indexOf("skipTeachingLessonRedirect") + 2000)));
});

// ─── 10. Mock/SEALED firewall unaffected by this amendment ─────────────────

test("the teaching-lesson routing amendment never references Mock/SEALED content -- it only ever reads the decision contract's own already-governed fields and the existing lesson registry", () => {
  const routingBlock = PRACTICE_PAGE.slice(PRACTICE_PAGE.indexOf("const lessonRoute ="), PRACTICE_PAGE.indexOf("const session = await withTimeout"));
  assert.ok(!/mock_eligible|SEALED|ali_mock_exposed|ali_mock_form/i.test(routingBlock));
});
