import { test } from "node:test";
import assert from "node:assert/strict";
import { deriveExamDateProvenance, isValidSchoolYear, isPlausibleExamDate } from "@/lib/progress";

/**
 * Programme Increment 008B (Exam Intelligence + Preparation Clock Product
 * Integration), Part 5/24 — exam-date provenance and school-year pure
 * cores, directly testable without a localStorage/window shim, matching
 * this file's own established isPlausibleExamDate pattern.
 */

test("no target exam date produces an honest 'unknown' state, never a guessed provenance", () => {
  assert.equal(deriveExamDateProvenance({ targetExamDate: undefined, targetExamDateProvenance: undefined }), "unknown");
});

test("a date that predates this field's introduction (no provenance stored) is 'unknown', not silently upgraded", () => {
  assert.equal(deriveExamDateProvenance({ targetExamDate: "2026-09-19", targetExamDateProvenance: undefined }), "unknown");
});

test("a parent-supplied date is labelled parent_supplied, never official", () => {
  assert.equal(deriveExamDateProvenance({ targetExamDate: "2026-09-19", targetExamDateProvenance: "parent_supplied" }), "parent_supplied");
  assert.notEqual(deriveExamDateProvenance({ targetExamDate: "2026-09-19", targetExamDateProvenance: "parent_supplied" }), "official");
});

test("an official provenance is preserved when genuinely set (future evidence source, not fabricated here)", () => {
  assert.equal(deriveExamDateProvenance({ targetExamDate: "2026-09-19", targetExamDateProvenance: "official" }), "official");
});

test("isValidSchoolYear accepts exactly Year 4/5/6 and rejects everything else", () => {
  assert.ok(isValidSchoolYear("Year 4"));
  assert.ok(isValidSchoolYear("Year 5"));
  assert.ok(isValidSchoolYear("Year 6"));
  assert.ok(!isValidSchoolYear("Year 3"));
  assert.ok(!isValidSchoolYear("Year 7"));
  assert.ok(!isValidSchoolYear(""));
  assert.ok(!isValidSchoolYear("year 4")); // case-sensitive, matches SchoolYear's exact literal type
});

test("isPlausibleExamDate rejects a date more than ~24 months out (fabricated-precision guard, unchanged behaviour)", () => {
  const now = new Date("2026-08-17");
  assert.ok(!isPlausibleExamDate("2029-01-01", now));
  assert.ok(isPlausibleExamDate("2026-09-19", now));
});
