import { test } from "node:test";
import assert from "node:assert/strict";
import { resolvePreparationClockFor } from "@/lib/learningEngine/preparationClock";
import { isPlausibleExamDate } from "@/lib/progress";

/**
 * Educational Increment 007V, Part 6 — the Preparation Clock never
 * fabricates a date, and its horizon bands are computed correctly from
 * whatever real date the parent has configured (or honestly reports
 * unavailable when none exists). Tests the pure core directly
 * (`resolvePreparationClockFor`), not the localStorage-reading wrapper —
 * lib/progress.ts's own getProgress()/saveProgress() silently no-op
 * outside a browser (`typeof window === "undefined"`), so exercising the
 * wrapper in Node would not prove anything real.
 */

test("no target exam date configured -> everything null/unavailable, never fabricated", () => {
  const clock = resolvePreparationClockFor(undefined, new Date("2026-08-17"));
  assert.equal(clock.targetExamDate, null);
  assert.equal(clock.daysRemaining, null);
  assert.equal(clock.weeksRemaining, null);
  assert.equal(clock.horizonBand, "unavailable");
});

test("a target date far in the future yields long_horizon", () => {
  const clock = resolvePreparationClockFor("2028-09-19", new Date("2026-08-17"));
  assert.equal(clock.horizonBand, "long_horizon");
  assert.ok(clock.daysRemaining! > 365);
});

test("a target date within 3 weeks yields final_preparation", () => {
  const clock = resolvePreparationClockFor("2026-09-05", new Date("2026-08-17"));
  assert.equal(clock.horizonBand, "final_preparation");
  assert.ok(clock.daysRemaining! <= 21);
});

test("a target date about 2 months out yields exam_condition", () => {
  const clock = resolvePreparationClockFor("2026-10-16", new Date("2026-08-17"));
  assert.equal(clock.horizonBand, "exam_condition");
});

test("a past target date is treated as unavailable, never a negative-day guess", () => {
  const clock = resolvePreparationClockFor("2025-01-01", new Date("2026-08-17"));
  assert.equal(clock.horizonBand, "unavailable");
});

test("the real target exam date is never invented -- it is always exactly what was passed in", () => {
  const clock = resolvePreparationClockFor("2026-09-19", new Date("2026-08-17"));
  assert.equal(clock.targetExamDate, "2026-09-19");
});

test("isPlausibleExamDate (existing, reused unchanged) still rejects a past date -- confirms the real validation path this module's caller relies on", () => {
  assert.equal(isPlausibleExamDate("2020-01-01", new Date("2026-08-17")), false);
});
