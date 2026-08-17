import { test } from "node:test";
import assert from "node:assert/strict";
import { stagePrinciple } from "@/lib/learningEngine/preparationStage";
import type { PreparationStage } from "@/lib/learningEngine/preparationStage";

/**
 * Educational Increment 007W, Part 5 — proves the preparation stage carries
 * real, distinct operational meaning: every stage has its own principle,
 * none are duplicates, and none leak engine/internal terminology.
 */

const ALL_STAGES: PreparationStage[] = [
  "insufficient_evidence",
  "foundation",
  "teaching",
  "developing",
  "transfer",
  "exam_preparation",
  "final_preparation",
];

const BANNED_TERMS = [
  "confidence tier",
  "educational state",
  "evidence confidence",
  "competency",
  "aliSignal",
  "engine",
  "mastery threshold",
  "algorithm",
];

test("every preparation stage has a distinct, non-empty principle", () => {
  const principles = ALL_STAGES.map(stagePrinciple);
  assert.equal(principles.length, new Set(principles).size, "no two stages should share the same learner-facing message");
  for (const p of principles) {
    assert.ok(p.length > 0);
  }
});

test("no stage principle leaks engine/internal terminology", () => {
  for (const stage of ALL_STAGES) {
    const text = stagePrinciple(stage).toLowerCase();
    for (const term of BANNED_TERMS) {
      assert.ok(!text.includes(term), `"${stage}" principle should not mention "${term}"`);
    }
  }
});

test("a struggling learner (teaching) is told about re-teaching, not just told to keep practising", () => {
  assert.match(stagePrinciple("teaching"), /re-teach|specific skill/);
});

test("final_preparation and exam_preparation are distinct in emphasis", () => {
  assert.notEqual(stagePrinciple("exam_preparation"), stagePrinciple("final_preparation"));
});
