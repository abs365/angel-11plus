import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MR03_ANGLE_FIGURE_EXPANSION } from "@/lib/ali/questionFactory/csseAngleFigureBlueprints";
import { generateBlueprintCandidate, runFamilyBatch, validateBlueprintCandidate } from "@/lib/ali/questionFactory/candidateGeneration";
import { checkPerBlueprintDifficultyReachability } from "@/lib/ali/questionFactory/diversityGates";
import { isValidAngleFigureStimulus } from "@/lib/mockAttempt/workspace";
import { AngleFigureStimulus } from "@/components/mockAttempt/AngleFigureStimulus";
import { StructuredStimulus } from "@/components/mockAttempt/StructuredStimulus";
import { checkMathsAnswer } from "@/lib/learningEngine/practiceContent";
import { mapMathsCandidateToStoreRow } from "@/lib/ali/questionFactory/mathsCandidateStoreMapping";
import type { StructuralBlueprint } from "@/lib/ali/questionFactory/types";
import type { MockAngleFigureStimulus } from "@/lib/mockAttempt/types";

/** Answers are re-derived from the STIMULUS OBJECT (what is drawn), written separately here. */
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type BP = StructuralBlueprint<Record<string, number>>;
const bps = MR03_ANGLE_FIGURE_EXPANSION.blueprints as BP[];
const byId = (id: string) => bps.find((b) => b.blueprintId === id)!;
const N = 300;
const cands = (bp: BP, seed = 21) => {
  const r = seeded(seed);
  return Array.from({ length: N }, () => generateBlueprintCandidate(bp, r));
};
const st = (c: { stimulus?: unknown }) => c.stimulus as MockAngleFigureStimulus;

test("four blueprints, all in the live angle family, no angle value in any question text", () => {
  assert.equal(bps.length, 4);
  for (const bp of bps) {
    assert.equal(bp.familyId, "mr03-angle-sum");
    for (const c of cands(bp, 7)) assert.doesNotMatch(c.question, /\d/, `${bp.blueprintId}: ${c.question}`);
  }
});

test("the answer makes the DRAWN angles total correctly (triangle/straight line 180, around a point 360), every candidate", () => {
  for (const bp of bps) {
    for (const c of cands(bp)) {
      const s = st(c);
      assert.ok(isValidAngleFigureStimulus(s), bp.blueprintId);
      const total = s.figure === "around-point" ? 360 : 180;
      const answer = Number(c.claimedAnswer);
      // drawn sizes: the unknown(s) are drawn at their true size, so the label sum with the answer substituted equals the total
      let sum = 0;
      for (const a of s.angles) sum += /^[a-z]$/.test(a.shown) ? answer : Number(a.shown.replace("°", ""));
      assert.equal(sum, total, `${bp.blueprintId} ${JSON.stringify(s)} -> ${c.claimedAnswer}`);
      // and the drawn size of each unknown equals the answer
      for (const a of s.angles) if (/^[a-z]$/.test(a.shown)) assert.equal(a.size, answer);
      assert.equal(checkMathsAnswer(c.claimedAnswer, c.claimedAnswer), true);
    }
  }
});

test("each figure kind appears and uses the right fact", () => {
  assert.ok(cands(byId("mr03-bp-fig-triangle-find-x")).every((c) => st(c).figure === "triangle" && st(c).angles.length === 3));
  assert.ok(cands(byId("mr03-bp-fig-straight-line-find-x")).every((c) => st(c).figure === "straight-line"));
  const pt = cands(byId("mr03-bp-fig-around-point-find-x"));
  assert.ok(pt.every((c) => st(c).figure === "around-point"));
  assert.ok(pt.some((c) => Number(c.claimedAnswer) > 180), "a reflex unknown occurs");
  const iso = cands(byId("mr03-bp-fig-isosceles-find-base"));
  assert.ok(iso.every((c) => st(c).angles.filter((a) => a.shown === "x").length === 2 && /two angles marked x are equal/.test(c.question)));
  // the tempting wrong answers are all different from the right one
  for (const c of iso) {
    const apex = st(c).angles.find((a) => a.shown !== "x")!.size;
    assert.notEqual(String(180 - apex), c.claimedAnswer, "forgetting to halve must give a different number");
  }
});

test("independently verified through the figure, and a wrong answer is rejected", () => {
  for (const bp of bps) {
    const r = seeded(5);
    for (let i = 0; i < 60; i++) {
      const c = generateBlueprintCandidate(bp, r);
      const v = validateBlueprintCandidate(c, bp, []);
      assert.equal(v.independentlyVerified, true, bp.blueprintId);
      assert.ok(v.mathematicallyValid);
      const tv = validateBlueprintCandidate({ ...c, claimedAnswer: String(Number(c.claimedAnswer) + 10) }, bp, []);
      assert.ok(tv.reasons.includes("answer_mismatch"), bp.blueprintId);
    }
  }
});

test("validator fails closed", () => {
  const ok: MockAngleFigureStimulus = { type: "angle-figure", figure: "triangle", angles: [{ size: 50, shown: "50°" }, { size: 60, shown: "60°" }, { size: 70, shown: "x" }] };
  assert.ok(isValidAngleFigureStimulus(ok));
  assert.ok(!isValidAngleFigureStimulus({ ...ok, angles: [{ size: 50, shown: "50°" }, { size: 60, shown: "60°" }, { size: 80, shown: "x" }] }), "sum must be 180");
  assert.ok(!isValidAngleFigureStimulus({ ...ok, angles: [{ size: 50, shown: "55°" }, { size: 60, shown: "60°" }, { size: 70, shown: "x" }] }), "label must match drawn size");
  assert.ok(!isValidAngleFigureStimulus({ ...ok, angles: [{ size: 50, shown: "50°" }, { size: 60, shown: "60°" }, { size: 70, shown: "70°" }] }), "needs an unknown");
  assert.ok(!isValidAngleFigureStimulus({ ...ok, figure: "hexagon" }));
  assert.ok(!isValidAngleFigureStimulus({ ...ok, angles: [{ size: 90, shown: "90°" }, { size: 90, shown: "x" }], figure: "triangle" }), "triangle needs three");
  assert.ok(isValidAngleFigureStimulus({ type: "angle-figure", figure: "around-point", angles: [{ size: 100, shown: "100°" }, { size: 120, shown: "120°" }, { size: 140, shown: "x" }] }));
  assert.ok(!isValidAngleFigureStimulus({ type: "angle-figure", figure: "straight-line", angles: [{ size: 100, shown: "100°" }, { size: 70, shown: "x" }] }));
});

test("renderer: labels drawn, accuracy caveat shown, text equivalent never reveals the unknown size", () => {
  for (const figureKind of ["triangle", "straight-line", "around-point"] as const) {
    const bp = byId(figureKind === "triangle" ? "mr03-bp-fig-triangle-find-x" : figureKind === "straight-line" ? "mr03-bp-fig-straight-line-find-x" : "mr03-bp-fig-around-point-find-x");
    const c = generateBlueprintCandidate(bp, seeded(3));
    const html = renderToStaticMarkup(React.createElement(AngleFigureStimulus, { stimulus: st(c) }));
    assert.match(html, /Diagram not drawn accurately/);
    assert.ok(html.includes(">x</text>"));
    const aria = html.match(/aria-label="([^"]*)"/)![1];
    assert.ok(!aria.includes(c.claimedAnswer + "°") || st(c).angles.some((a) => a.shown === `${c.claimedAnswer}°`), "answer not in text equivalent");
    assert.ok(!html.includes("url(#"), "no gradients");
    assert.match(renderToStaticMarkup(React.createElement(StructuredStimulus, { stimulus: st(c) })), /<svg/);
  }
});

test("the figure survives the governed route and the batch is healthy and diverse", () => {
  const bp = byId("mr03-bp-fig-around-point-find-x");
  const c = generateBlueprintCandidate(bp, seeded(3));
  const v = validateBlueprintCandidate(c, bp, []);
  const args = mapMathsCandidateToStoreRow("csse-angle-test-01", c, bp, v);
  assert.deepEqual((args.p_question_content as { stimulus: unknown }).stimulus, c.stimulus);
  const { metrics } = runFamilyBatch(MR03_ANGLE_FIGURE_EXPANSION, [], 120, seeded(9));
  assert.ok(metrics.approved / metrics.rawGenerated > 0.9, JSON.stringify(metrics.rejectedByReason));
  assert.equal(metrics.distinctBlueprintsUsed, 4);
  for (const b of bps) {
    const [r] = checkPerBlueprintDifficultyReachability(cands(b), 2);
    assert.ok(r.meetsMinimum || b.blueprintId.includes("isosceles"), `${b.blueprintId} ${JSON.stringify(r.tierCounts)}`);
  }
});
