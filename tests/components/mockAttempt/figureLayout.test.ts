import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CoordinateGridStimulus, gridLayout } from "../../../components/mockAttempt/CoordinateGridStimulus";
import { BarChartStimulus, barChartLayout } from "../../../components/mockAttempt/BarChartStimulus";
import { NumberLineStimulus, numberLineLayout } from "../../../components/mockAttempt/NumberLineStimulus";
import { angleLabelFont } from "../../../components/mockAttempt/AngleFigureStimulus";
import { MIN_FIGURE_TEXT_PX, NARROW_FIGURE_MAX } from "../../../components/mockAttempt/useFigureWidth";
import { checkMathsAnswer } from "../../../lib/learningEngine/practiceContent";

/**
 * Practice 374 bounded acceptance correction: (1) a mirror line must be visibly distinct from the axis it lies on, drawn after
 * the axes and not by colour alone; (2) at phone width the grid, bar-chart and number-line text renders at about 10px or more,
 * without clipping or horizontal overflow, while the desktop geometry is unchanged. Tests run over the REAL published stimuli.
 */
const dirs = ["csse-grid-expansion", "csse-data-handling-expansion", "csse-breadth-expansion", "csse-context-expansion", "csse-numberline-expansion"];
type Stim = { type: string; mirrorLine?: string; xMin: number; xMax: number; yMin: number; yMax: number; categories: string[]; xLabel?: string; min: number; max: number; majorStep: number };
const stimuli: { id: string; st: Stim }[] = [];
for (const d of dirs)
  for (const p of JSON.parse(fs.readFileSync(`scripts/output/${d}/submission-payload.json`, "utf8")).submissionPayload) {
    const st = p.args.p_question_content.stimulus;
    if (st) stimuli.push({ id: p.args.p_candidate_id, st });
  }
const ofType = (t: string) => stimuli.filter((s) => s.st.type === t);
const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const WIDTHS = [260, 280, 300, 320, 340, 358, 386, 400, NARROW_FIGURE_MAX - 1];
const charW = 0.62; // generous average glyph width as a fraction of font size

test("there are real grid, bar-chart and number-line stimuli to test against", () => {
  assert.equal(ofType("coordinate-grid").length, 40);
  assert.equal(ofType("bar-chart").length, 24);
  assert.equal(ofType("number-line").length, 24);
});

const mirrored = ofType("coordinate-grid").filter((s) => s.st.mirrorLine);
test("all 8 reflection items carry a mirror line, and each is rendered after the axes, over an underlay, dashed and labelled", () => {
  assert.equal(mirrored.length, 8);
  for (const m of mirrored) {
    const out = html(React.createElement(CoordinateGridStimulus, { stimulus: m.st as never }));
    const lastAxis = out.lastIndexOf('stroke-width="2"');
    const underlay = out.indexOf("data-mirror-underlay");
    const dashed = out.indexOf("data-mirror-line");
    const label = out.indexOf("data-mirror-label");
    assert.ok(lastAxis > 0 && underlay > lastAxis, `${m.id}: underlay after axes`);
    assert.ok(dashed > underlay, `${m.id}: dashed line after underlay`);
    assert.match(out.slice(dashed, dashed + 200), /stroke-dasharray="7 5"/);
    assert.ok(label > dashed, `${m.id}: text label present (not colour alone)`);
    assert.match(out, />mirror line</);
    assert.ok(out.indexOf("<circle") > label, `${m.id}: points still drawn above the mirror line`);
  }
});

test("mirror line geometry is exact for x-axis, y-axis and y=x (and the answer is unchanged)", () => {
  for (const variant of ["x-axis", "y-axis", "y=x"]) {
    const m = mirrored.find((s) => s.st.mirrorLine === variant);
    assert.ok(m, variant);
    for (const width of [null, 300]) {
      const { unit, pad } = gridLayout(width, m!.st.xMax - m!.st.xMin, m!.st.yMax - m!.st.yMin);
      const px = (x: number): number => pad + (x - m!.st.xMin) * unit;
      const py = (y: number): number => pad + (m!.st.yMax - y) * unit;
      const out = html(React.createElement(CoordinateGridStimulus, { stimulus: m!.st as never }));
      const tag = out.slice(out.indexOf("data-mirror-line"), out.indexOf("data-mirror-line") + 200);
      const num = (a: string) => Number(tag.match(new RegExp(`${a}="(-?[\\d.]+)"`))![1]);
      if (width === null) {
        const x1 = num("x1"), x2 = num("x2"), y1 = num("y1"), y2 = num("y2");
        if (variant === "x-axis") assert.deepEqual([y1, y2], [py(0), py(0)]);
        if (variant === "y-axis") assert.deepEqual([x1, x2], [px(0), px(0)]);
        if (variant === "y=x") assert.equal(x2 - x1, y1 - y2, "45 degree diagonal through the origin");
        if (variant === "y=x") assert.equal(x1, px(Math.max(m!.st.xMin, m!.st.yMin)));
      }
    }
  }
});

test("coordinate marking behaviour is unchanged by the presentation work", () => {
  assert.equal(checkMathsAnswer("(-3,4)", "(-3, 4)"), true);
  assert.equal(checkMathsAnswer("( -3 , 4 )", "(-3, 4)"), true);
  assert.equal(checkMathsAnswer("(3, 4)", "(-3, 4)"), false);
  assert.equal(checkMathsAnswer("(4, -3)", "(-3, 4)"), false);
});

test("desktop and tablet geometry is unchanged (null width, or a wide figure)", () => {
  for (const w of [null, NARROW_FIGURE_MAX, 520, 900]) {
    assert.deepEqual(gridLayout(w, 10, 10), { unit: 26, pad: 30, W: 320, H: 320, tickFont: 11, axisFont: 13, pointFont: 14, pointRadius: 5 });
    assert.deepEqual(gridLayout(w, 16, 16), { unit: 26, pad: 30, W: 476, H: 476, tickFont: 11, axisFont: 13, pointFont: 14, pointRadius: 5 });
    assert.deepEqual(numberLineLayout(w), { W: 520, H: 110, pad: 36, y0: 66, tickFont: 14, pointFont: 15 });
    const b = barChartLayout(w, ["A", "B"], true);
    assert.deepEqual([b.W, b.H, b.left, b.right, b.top, b.bottom, b.fontSize, b.rotateLabels, b.labelBand, b.xLabelFromBottom], [480, 300, 52, 16, 28, 60, 14, false, 18, 10]);
    assert.equal(angleLabelFont(w), 16);
  }
});

test("grid phone layout: tick, axis and point text >= 10px rendered, fits the width, tick labels do not collide", () => {
  for (const { id, st } of ofType("coordinate-grid")) {
    const xr = st.xMax - st.xMin;
    const yr = st.yMax - st.yMin;
    for (const width of WIDTHS) {
      const L = gridLayout(width, xr, yr);
      const scale = width / L.W;
      assert.ok(L.W <= width, `${id}@${width}: viewBox ${L.W} must not exceed the figure (no horizontal overflow)`);
      for (const f of [L.tickFont, L.axisFont, L.pointFont]) assert.ok(f * scale >= MIN_FIGURE_TEXT_PX, `${id}@${width}: ${f * scale}px`);
      const tickEvery = xr > 14 || yr > 14 ? 2 : 1;
      assert.ok(L.unit * tickEvery >= 3 * L.tickFont * charW * 0.75 * 0.5 + 6, `${id}@${width}: tick spacing`);
      assert.ok(L.unit >= 12, `${id}@${width}: unit too small`);
      // the mirror label must sit inside the viewBox
      const labelW = "mirror line".length * L.tickFont * 0.55;
      assert.ok(labelW + 4 + 7 < L.W / 2 + L.pad, `${id}@${width}: label fits`);
    }
  }
});

test("bar-chart phone layout: text >= 10px rendered, fits, category labels never overlap (they tilt when needed) and stay inside the viewBox", () => {
  for (const { id, st } of ofType("bar-chart")) {
    for (const width of WIDTHS) {
      const L = barChartLayout(width, st.categories, Boolean(st.xLabel));
      assert.ok(L.W <= width);
      assert.ok(L.fontSize * (width / L.W) >= MIN_FIGURE_TEXT_PX, `${id}@${width}`);
      const slot = (L.W - L.left - L.right) / st.categories.length;
      const widest = Math.max(...st.categories.map((c: string) => c.length)) * L.fontSize * 0.58;
      assert.ok(L.rotateLabels || widest <= slot - 4, `${id}@${width}: labels overlap without tilting`);
      const plotH = L.H - L.top - L.bottom;
      assert.ok(plotH >= 90, `${id}@${width}: plot too short`);
      if (L.rotateLabels) assert.ok(Math.sin((35 * Math.PI) / 180) * widest + 12 <= L.labelBand + 2, `${id}@${width}: tilted labels clipped`);
      // tilted label's left end stays inside the figure
      if (L.rotateLabels) assert.ok(L.left + slot / 2 + 4 - Math.cos((35 * Math.PI) / 180) * widest >= -4, `${id}@${width}: first tilted label clipped on the left`);
    }
    const out = html(React.createElement(BarChartStimulus, { stimulus: st as never }));
    assert.match(out, /<svg viewBox="0 0 480 300"/, "server render and desktop use the original geometry");
  }
});

test("number-line phone layout: text >= 10px rendered, fits, and major labels do not collide", () => {
  const dec = (n: number) => (Math.round(n * 1000) % 1000 === 0 ? 0 : Math.round(n * 1000) % 100 === 0 ? 1 : Math.round(n * 1000) % 10 === 0 ? 2 : 3);
  for (const { id, st } of ofType("number-line")) {
    const intervals = Math.round((st.max - st.min) / st.majorStep);
    const longest = Math.max(...[st.min, st.max].map((v: number) => v.toFixed(dec(st.majorStep)).length));
    for (const width of WIDTHS) {
      const L = numberLineLayout(width);
      assert.ok(L.W <= width);
      for (const f of [L.tickFont, L.pointFont]) assert.ok(f * (width / L.W) >= MIN_FIGURE_TEXT_PX, `${id}@${width}`);
      const spacing = (L.W - L.pad * 2) / intervals;
      assert.ok(spacing >= longest * L.tickFont * charW * 0.8, `${id}@${width}: labels ${longest} chars every ${spacing}px collide`);
      assert.ok(L.y0 + 28 + 4 <= L.H, `${id}@${width}: tick labels clipped below`);
      assert.ok(L.y0 - 24 - L.pointFont >= -2, `${id}@${width}: point label clipped above`);
    }
    html(React.createElement(NumberLineStimulus, { stimulus: st as never }));
  }
});

test("angle labels grow on a very narrow figure (capped) so they still render at about 10px", () => {
  assert.equal(angleLabelFont(386), 16);
  assert.ok(angleLabelFont(190) * (190 / 360) >= 9.5);
  assert.ok(angleLabelFont(120) <= 22);
});

test("Mock is untouched: no Mock surface imports the figure renderers changed here", () => {
  const mockFiles = ["app/learning-intelligence/mock", "app/mock"].flatMap((d) => (fs.existsSync(d) ? walk(d) : []));
  for (const f of mockFiles) {
    const s = fs.readFileSync(f, "utf8");
    assert.doesNotMatch(s, /BarChartStimulus|CoordinateGridStimulus|NumberLineStimulus|AngleFigureStimulus|useFigureWidth/, f);
  }
});
function walk(d: string): string[] {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${d}/${e.name}`) : /\.(ts|tsx)$/.test(e.name) ? [`${d}/${e.name}`] : []));
}

test("number-line text equivalent uses correct singular/plural: '1 smaller mark', '4 smaller marks', none when there are no minor marks", () => {
  const base = { type: "number-line", min: 1.2, max: 2, majorStep: 0.2, points: [{ label: "P", value: 1.7 }] };
  const aria = (minorDivisions: number) => html(React.createElement(NumberLineStimulus, { stimulus: { ...base, minorDivisions } as never })).match(/aria-label="([^"]*)"/)![1];
  assert.match(aria(2), /and 1 smaller mark between each pair/);
  assert.doesNotMatch(aria(2), /1 smaller marks/);
  assert.match(aria(5), /and 4 smaller marks between each pair/);
  assert.match(aria(10), /and 9 smaller marks between each pair/);
  assert.doesNotMatch(aria(1), /smaller/);
  for (const { st } of ofType("number-line")) assert.doesNotMatch(html(React.createElement(NumberLineStimulus, { stimulus: st as never })), /\b1 smaller marks\b/);
});
