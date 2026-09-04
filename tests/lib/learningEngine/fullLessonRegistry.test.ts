import { test } from "node:test";
import assert from "node:assert/strict";
import { FULL_LESSON_ROUTE, hasFullLessonAvailable } from "@/lib/learningEngine/fullLessonRegistry";

/**
 * Increment 020 "Preparation Decision Follow-up" -- the single canonical
 * lesson registry, extracted from app/dashboard/page.tsx's own inline set
 * so a future new lesson requires updating exactly one file, not every
 * caller of buildPreparationDecision independently.
 */

test("the 4 real lessons that exist today are registered, and only those 4", () => {
  assert.deepEqual(Object.keys(FULL_LESSON_ROUTE).sort(), ["MR-01", "MR-03", "MR-04", "RC-01"]);
});

test("hasFullLessonAvailable is true for every registered competency and false for every other real competency", () => {
  assert.equal(hasFullLessonAvailable("MR-01"), true);
  assert.equal(hasFullLessonAvailable("MR-03"), true);
  assert.equal(hasFullLessonAvailable("MR-04"), true);
  assert.equal(hasFullLessonAvailable("RC-01"), true);
  assert.equal(hasFullLessonAvailable("MR-02"), false);
  assert.equal(hasFullLessonAvailable("MR-05"), false);
  assert.equal(hasFullLessonAvailable("MR-06"), false);
  assert.equal(hasFullLessonAvailable("RC-02"), false);
  assert.equal(hasFullLessonAvailable("WC-01"), false);
});

test("every registered Mathematics route is a real app route path under /learning-intelligence/learn/mathematics/", () => {
  for (const [competencyId, route] of Object.entries(FULL_LESSON_ROUTE)) {
    if (competencyId.startsWith("MR-")) assert.match(route!, /^\/learning-intelligence\/learn\/mathematics\//);
  }
});

test("Programme Increment 022 -- RC-01's route is a real app route path under /learning-intelligence/learn/english/", () => {
  assert.match(FULL_LESSON_ROUTE["RC-01"]!, /^\/learning-intelligence\/learn\/english\//);
});
