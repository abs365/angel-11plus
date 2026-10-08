import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  BP_GRID_READ_POINT, BP_GRID_REFLECT_IN_MIRROR_LINE, BP_GRID_TRANSLATE_POINT, BP_GRID_FOURTH_VERTEX, BP_GRID_SEGMENT_MIDPOINT, MR03_GRID_EXPANSION,
} from "@/lib/ali/questionFactory/csseCoordinateGridBlueprints";
import { generateBlueprintCandidate, runFamilyBatch, validateBlueprintCandidate } from "@/lib/ali/questionFactory/candidateGeneration";
import { checkPerBlueprintDifficultyReachability } from "@/lib/ali/questionFactory/diversityGates";
import { isValidCoordinateGridStimulus } from "@/lib/mockAttempt/workspace";
import { CoordinateGridStimulus } from "@/components/mockAttempt/CoordinateGridStimulus";
import { StructuredStimulus } from "@/components/mockAttempt/StructuredStimulus";
import { checkMathsAnswer } from "@/lib/learningEngine/practiceContent";
import { mapMathsCandidateToStoreRow } from "@/lib/ali/questionFactory/mathsCandidateStoreMapping";
import type { StructuralBlueprint } from "@/lib/ali/questionFactory/types";
import type { MockCoordinateGridStimulus } from "@/lib/mockAttempt/types";

/**
 * Coordinate-grid blueprints. Every answer is re-derived from the STIMULUS OBJECT (what is drawn), by a route that is
 * written separately here (direct formulas, vectors, diagonal bisection), never by the blueprint's own function.
 */
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
const N = 300;
function candidates<T extends Record<string, number>>(bp: StructuralBlueprint<T>, seed = 41) {
  const rnd = seeded(seed);
  return Array.from({ length: N }, () => generateBlueprintCandidate(bp, rnd));
}
const fmt = (x: number, y: number) => `(${x === 0 ? 0 : x}, ${y === 0 ? 0 : y})`;
const grid = (c: { stimulus?: unknown }) => c.stimulus as MockCoordinateGridStimulus;
const pt = (g: MockCoordinateGridStimulus, label: string) => g.points.find((p) => p.label === label)!;

test("read a point: the named point's coordinates, read from the drawn grid", () => {
  const seen = new Set<string>();
  for (const c of candidates(BP_GRID_READ_POINT)) {
    const g = grid(c);
    assert.ok(isValidCoordinateGridStimulus(g));
    const label = c.question.match(/coordinates of point ([ABC])/)![1];
    const p = pt(g, label);
    assert.equal(c.claimedAnswer, fmt(p.x, p.y), c.question);
    assert.notEqual(c.claimedAnswer, fmt(p.y, p.x), "swapped coordinates must differ from the answer");
    assert.equal(checkMathsAnswer(fmt(p.y, p.x), c.claimedAnswer), false);
    seen.add(`${Math.sign(p.x)},${Math.sign(p.y)}`);
  }
  assert.ok(seen.size >= 6, `target positions cover axes and quadrants: ${seen.size}`);
});

test("reflect: image computed by explicit formulas for the mirror line actually drawn", () => {
  const lines = new Set<string>();
  for (const c of candidates(BP_GRID_REFLECT_IN_MIRROR_LINE)) {
    const g = grid(c);
    assert.ok(isValidCoordinateGridStimulus(g));
    const p = pt(g, "P");
    const image = g.mirrorLine === "x-axis" ? fmt(p.x, -p.y) : g.mirrorLine === "y-axis" ? fmt(-p.x, p.y) : fmt(p.y, p.x);
    assert.equal(c.claimedAnswer, image, `${g.mirrorLine} ${c.question}`);
    lines.add(g.mirrorLine!);
    // the three tempting wrong answers are all different from the right one
    for (const wrong of [fmt(-p.x, -p.y), fmt(p.x, p.y), g.mirrorLine === "y=x" ? fmt(-p.y, -p.x) : fmt(p.y, p.x)]) assert.notEqual(wrong, c.claimedAnswer);
  }
  assert.equal(lines.size, 3, "all three mirror lines appear");
});

test("translate: the movement parsed from the text, applied to the drawn point", () => {
  for (const c of candidates(BP_GRID_TRANSLATE_POINT)) {
    const g = grid(c);
    const p = pt(g, "P");
    const m = c.question.match(/translated (\d+) units? (right|left) and (\d+) units? (up|down)/)!;
    const dx = Number(m[1]) * (m[2] === "right" ? 1 : -1);
    const dy = Number(m[3]) * (m[4] === "up" ? 1 : -1);
    assert.equal(c.claimedAnswer, fmt(p.x + dx, p.y + dy), c.question);
    assert.ok(Math.abs(p.x + dx) <= g.xMax && Math.abs(p.y + dy) <= g.yMax, "the new position is on the grid");
  }
});

test("fourth vertex: the drawn corners and the answer form a genuine rectangle/parallelogram (diagonals bisect; rectangle has right angles)", () => {
  let rect = 0;
  let para = 0;
  for (const c of candidates(BP_GRID_FOURTH_VERTEX)) {
    const g = grid(c);
    assert.ok(isValidCoordinateGridStimulus(g));
    const [a, b, cc] = ["A", "B", "C"].map((l) => pt(g, l));
    const d = c.claimedAnswer.match(/\((-?\d+), (-?\d+)\)/)!.slice(1).map(Number);
    assert.equal(a.x + cc.x, b.x + d[0]);
    assert.equal(a.y + cc.y, b.y + d[1]);
    // opposite sides equal and parallel
    assert.deepEqual([d[0] - a.x, d[1] - a.y], [cc.x - b.x, cc.y - b.y]);
    const isRect = /a rectangle/.test(c.question);
    const dot = (b.x - a.x) * (cc.x - b.x) + (b.y - a.y) * (cc.y - b.y);
    if (isRect) { assert.ok(dot === 0, "rectangle needs a right angle at B"); rect++; } else { assert.notEqual(dot, 0, "a parallelogram question must not secretly be a rectangle"); para++; }
    assert.ok(Math.abs(d[0]) <= g.xMax && Math.abs(d[1]) <= g.yMax);
  }
  assert.ok(rect > 40 && para > 40, `both shapes appear: ${rect}/${para}`);
});

test("midpoint of a segment: halfway in each direction, from the drawn ends", () => {
  for (const c of candidates(BP_GRID_SEGMENT_MIDPOINT)) {
    const g = grid(c);
    const a = pt(g, "A");
    const b = pt(g, "B");
    assert.equal(c.claimedAnswer, fmt((a.x + b.x) / 2, (a.y + b.y) / 2), c.question);
    assert.deepEqual(g.segments, [{ from: "A", to: "B" }]);
  }
});

test("the grid is NECESSARY: no coordinate pair is written in any question text", () => {
  for (const bp of MR03_GRID_EXPANSION.blueprints as StructuralBlueprint<Record<string, number>>[]) {
    for (const c of candidates(bp, 77)) assert.doesNotMatch(c.question, /\(\s*-?\d+\s*,\s*-?\d+\s*\)/, `${bp.blueprintId}: ${c.question}`);
  }
});

test("every candidate is independently verified by a different route, and tampering with the answer is caught", () => {
  for (const bp of MR03_GRID_EXPANSION.blueprints as StructuralBlueprint<Record<string, number>>[]) {
    const rnd = seeded(5);
    for (let i = 0; i < 60; i++) {
      const c = generateBlueprintCandidate(bp, rnd);
      const v = validateBlueprintCandidate(c, bp, []);
      assert.equal(v.independentlyVerified, true, bp.blueprintId);
      assert.ok(v.mathematicallyValid, bp.blueprintId);
      const tampered = { ...c, claimedAnswer: "(99, 99)" };
      const tv = validateBlueprintCandidate(tampered, bp, []);
      assert.ok(tv.reasons.includes("answer_mismatch"), `${bp.blueprintId} must reject a wrong answer`);
      assert.equal(tv.independentlyVerified, false);
    }
  }
});

test("validator fails closed on malformed grids", () => {
  const ok: MockCoordinateGridStimulus = { type: "coordinate-grid", xMin: -5, xMax: 5, yMin: -5, yMax: 5, points: [{ label: "P", x: 1, y: 2 }] };
  assert.ok(isValidCoordinateGridStimulus(ok));
  assert.ok(!isValidCoordinateGridStimulus({ ...ok, xMin: 0 }), "origin must be inside");
  assert.ok(!isValidCoordinateGridStimulus({ ...ok, points: [{ label: "P", x: 9, y: 0 }] }), "point off the grid");
  assert.ok(!isValidCoordinateGridStimulus({ ...ok, points: [{ label: "P", x: 1, y: 2 }, { label: "P", x: 2, y: 2 }] }), "duplicate label");
  assert.ok(!isValidCoordinateGridStimulus({ ...ok, segments: [{ from: "P", to: "Z" }] }), "segment to unknown label");
  assert.ok(!isValidCoordinateGridStimulus({ ...ok, mirrorLine: "y=2x" }));
  assert.ok(!isValidCoordinateGridStimulus({ ...ok, xMin: -20, xMax: 20 }), "too wide to read");
  assert.ok(!isValidCoordinateGridStimulus({ ...ok, points: [{ label: "P", x: 1.5, y: 2 }] }));
});

test("renderer: one dot per point, labelled axes, dashed mirror line, and a text equivalent that does NOT reveal coordinates", () => {
  const g: MockCoordinateGridStimulus = { type: "coordinate-grid", title: "Coordinate grid", xMin: -6, xMax: 6, yMin: -6, yMax: 6, points: [{ label: "P", x: 3, y: -4 }], mirrorLine: "y=x" };
  const html = renderToStaticMarkup(React.createElement(CoordinateGridStimulus, { stimulus: g }));
  assert.equal((html.match(/<circle /g) ?? []).length, 1);
  assert.match(html, /stroke-dasharray="7 5"/);
  assert.match(html, /role="img" aria-label="Coordinate grid, x from -6 to 6 and y from -6 to 6\. Plotted points: P\./);
  const aria = html.match(/aria-label="[^"]*"/)![0];
  assert.ok(!aria.includes("3, -4") && !aria.includes("(3") && !aria.includes("-4"), "the text equivalent must not reveal the answer");
  assert.ok(!html.includes("url(#"), "no gradients");
  for (const t of [-6, -3, 3, 6]) assert.ok(html.includes(`>${t}</text>`), `tick ${t}`);
  assert.match(renderToStaticMarkup(React.createElement(StructuredStimulus, { stimulus: g })), /<svg/);
});

test("the grid stimulus survives the governed route into question_content, and Mock is untouched", () => {
  const c = generateBlueprintCandidate(BP_GRID_FOURTH_VERTEX, seeded(3));
  const v = validateBlueprintCandidate(c, BP_GRID_FOURTH_VERTEX, []);
  const args = mapMathsCandidateToStoreRow("csse-grid-test-01", c, BP_GRID_FOURTH_VERTEX as StructuralBlueprint<Record<string, number>>, v);
  assert.deepEqual((args.p_question_content as { stimulus: unknown }).stimulus, c.stimulus);
  assert.equal((args.p_mathematical_validation as { independentlyVerified: boolean }).independentlyVerified, true);
  assert.doesNotMatch(fs.readFileSync("app/learning-intelligence/mock-exam/page.tsx", "utf8"), /CoordinateGridStimulus|StructuredStimulus/);
});

test("family batch validation, difficulty tiers and diversity", () => {
  const { metrics } = runFamilyBatch(MR03_GRID_EXPANSION, [], 150, seeded(9));
  assert.ok(metrics.approved / metrics.rawGenerated > 0.9, `${metrics.approved}/${metrics.rawGenerated} ${JSON.stringify(metrics.rejectedByReason)}`);
  assert.equal(metrics.distinctBlueprintsUsed, 5);
  for (const bp of MR03_GRID_EXPANSION.blueprints as StructuralBlueprint<Record<string, number>>[]) {
    const [r] = checkPerBlueprintDifficultyReachability(candidates(bp), 2);
    assert.ok(r.meetsMinimum, `${bp.blueprintId} ${JSON.stringify(r.tierCounts)}`);
  }
});
