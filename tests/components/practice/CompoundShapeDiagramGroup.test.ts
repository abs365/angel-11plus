import { test } from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CompoundShapeDiagram, CompoundShapeDiagramGroup } from "@/components/practice/CompoundShapeDiagram";
import { checkMathsAnswer } from "@/lib/learningEngine/practiceContent";
import type { CompoundRectilinearDiagram } from "@/types/index";

/**
 * Post-Activation Diagram Rendering Repair — targeted regression tests for
 * the exact incident: `app/learning-intelligence/practice/[area]/page.tsx`
 * rendered `prompt.diagram` (singular) only, so any published row using
 * `prompt.diagrams` (plural, comparison-style questions) silently showed no
 * diagram at all to the learner. `CompoundShapeDiagramGroup` is the single
 * place that decision is now made — tested here directly via
 * `renderToStaticMarkup`, without needing to render the whole Practice page
 * (which has extensive router/Supabase/session dependencies out of scope
 * for this bounded repair).
 */

const SHAPE_A: CompoundRectilinearDiagram = {
  type: "compound_rectilinear",
  vertices: [
    { x: 0, y: 0 },
    { x: 17, y: 0 },
    { x: 17, y: 11 },
    { x: 2, y: 11 },
    { x: 2, y: 12 },
    { x: 0, y: 12 },
  ],
  edgeLabels: [
    { label: "17 m", edgeIndex: 0 },
    { label: "15 m", edgeIndex: 2 },
    { label: "1 m", edgeIndex: 3 },
    { label: "12 m", edgeIndex: 5 },
  ],
};

// Exact production shape for qf-factory-candidate-mr03-compound-area-perimeter-4cc10e69601110c1's
// second entry -- the regression fixture for the exact affected row.
const SHAPE_B: CompoundRectilinearDiagram = {
  type: "compound_rectilinear",
  vertices: [
    { x: 0, y: 0 },
    { x: 15, y: 0 },
    { x: 15, y: 6 },
    { x: 14, y: 6 },
    { x: 14, y: 9 },
    { x: 0, y: 9 },
  ],
  edgeLabels: [
    { label: "15 m", edgeIndex: 0 },
    { label: "1 m", edgeIndex: 2 },
    { label: "3 m", edgeIndex: 3 },
    { label: "9 m", edgeIndex: 5 },
  ],
};

test("A. existing singular `diagram` continues to render exactly as before (no regression)", () => {
  const html = renderToStaticMarkup(React.createElement(CompoundShapeDiagramGroup, { diagram: SHAPE_A }));
  assert.match(html, /<svg/);
  assert.match(html, /17 m/);
  assert.match(html, /15 m/);
  assert.match(html, /1 m/);
  assert.match(html, /12 m/);
  // Exactly one diagram, not wrapped in the plural grid layout.
  assert.equal((html.match(/<svg/g) ?? []).length, 1);
});

test("B. `diagrams` with exactly one member renders that member", () => {
  const html = renderToStaticMarkup(React.createElement(CompoundShapeDiagramGroup, { diagrams: [SHAPE_A] }));
  assert.equal((html.match(/<svg/g) ?? []).length, 1);
  assert.match(html, /17 m/);
  assert.match(html, /Diagram 1 of 1/);
});

test("C. `diagrams` with multiple members renders every member, in canonical order", () => {
  const html = renderToStaticMarkup(React.createElement(CompoundShapeDiagramGroup, { diagrams: [SHAPE_A, SHAPE_B] }));
  assert.equal((html.match(/<svg/g) ?? []).length, 2);
  const indexA = html.indexOf("17 m");
  const indexB = html.indexOf("15 m", html.indexOf("Diagram 2 of 2"));
  assert.ok(indexA !== -1 && indexA < html.indexOf("Diagram 2 of 2"), "Shape A's own edge labels must appear before the second diagram's caption");
  assert.ok(indexB !== -1, "Shape B's edge labels must be present after its own caption");
  assert.match(html, /Diagram 1 of 2/);
  assert.match(html, /Diagram 2 of 2/);
});

test("D. labels and dimensions required for solving survive rendering, for every entry", () => {
  const html = renderToStaticMarkup(React.createElement(CompoundShapeDiagramGroup, { diagrams: [SHAPE_A, SHAPE_B] }));
  for (const label of ["17 m", "15 m", "1 m", "12 m", "3 m", "9 m"]) {
    assert.match(html, new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `expected label "${label}" to survive rendering`);
  }
});

test("E. exact affected production shape (qf-...-4cc10e69601110c1) is covered by a regression fixture", () => {
  // SHAPE_A/SHAPE_B above are the exact `diagrams[0]`/`diagrams[1]` vertex and
  // edgeLabel data read directly from production for this exact row.
  const html = renderToStaticMarkup(React.createElement(CompoundShapeDiagramGroup, { diagrams: [SHAPE_A, SHAPE_B] }));
  assert.equal((html.match(/<svg/g) ?? []).length, 2);
});

test("F. unrelated case -- neither `diagram` nor `diagrams` set -- renders nothing (text-only questions unchanged)", () => {
  const html = renderToStaticMarkup(React.createElement(CompoundShapeDiagramGroup, {}));
  assert.equal(html, "");
});

test("F2. an empty `diagrams` array renders nothing, not an empty grid", () => {
  const html = renderToStaticMarkup(React.createElement(CompoundShapeDiagramGroup, { diagrams: [] }));
  assert.equal(html, "");
});

test("`diagram` (singular) takes precedence if a row somehow set both (defensive, should never happen in real data)", () => {
  const html = renderToStaticMarkup(React.createElement(CompoundShapeDiagramGroup, { diagram: SHAPE_A, diagrams: [SHAPE_B] }));
  assert.equal((html.match(/<svg/g) ?? []).length, 1);
  assert.match(html, /17 m/);
  assert.doesNotMatch(html, /Diagram 1 of/);
});

test("H. responsive layout markup does not hide the diagrams (grid classes present, no `hidden`/`display:none`)", () => {
  const html = renderToStaticMarkup(React.createElement(CompoundShapeDiagramGroup, { diagrams: [SHAPE_A, SHAPE_B] }));
  assert.match(html, /grid-cols-1/);
  assert.match(html, /sm:grid-cols-2/);
  assert.doesNotMatch(html, /display:\s*none/);
  assert.doesNotMatch(html, /\bhidden\b/);
});

test("G. answer submission/marking behaviour is unchanged -- checkMathsAnswer is entirely independent of diagram/diagrams (exact affected-row answer contract, 'A')", () => {
  assert.equal(checkMathsAnswer("A", "A"), true);
  assert.equal(checkMathsAnswer("B", "A"), false);
});

test("underlying CompoundShapeDiagram component itself is unchanged for a direct single-diagram render", () => {
  const html = renderToStaticMarkup(React.createElement(CompoundShapeDiagram, { diagram: SHAPE_A }));
  assert.match(html, /role="img"/);
  assert.match(html, /17 m/);
});
