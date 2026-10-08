import type { StructuralBlueprint, EducationalFamily } from "./types";
import type { MockCoordinateGridStimulus } from "@/lib/mockAttempt/types";
import { applyCoordinateTransform, formatCoordinatePoint, midpoint, parseCoordinatePoint, type CoordinatePoint } from "./independentValidation";

/**
 * CSSE Completion, representation priority 1: the coordinate grid, for QT-MR-08 (MR-03 coordinates).
 *
 * Live baseline: QT-MR-08 has 42 practice items, all prose ("Point A is at (2, 5). It is reflected ..."), so the child never
 * sees a plane. Here the position, the mirror line and the shape are drawn, and the question text does NOT restate the
 * coordinates, so the grid is necessary to answer, not decoration. Five structurally different demands:
 *   read a position; reflect in a drawn mirror line; translate a drawn point; complete a drawn parallelogram/rectangle;
 *   find the midpoint of a drawn segment.
 * Every blueprint declares an `independentAnswerCheck` that recomputes through a DIFFERENT route (generic transform
 * functions, or the diagonal-bisection property for shapes), not through its own formula. Answers use the canonical
 * "(x, y)" form (marking tolerates spacing).
 *
 * Additive blueprints for the live `mr03-coordinate` family; nothing here touches the bank, Mock, or publication.
 */

type Pt = CoordinatePoint;
const EXTENTS = [5, 6, 8];
const inside = (p: Pt, e: number) => Math.abs(p.x) <= e && Math.abs(p.y) <= e;
const same = (a: Pt, b: Pt) => a.x === b.x && a.y === b.y;

function grid(e: number, points: { label: string; x: number; y: number }[], extra: Partial<MockCoordinateGridStimulus> = {}): MockCoordinateGridStimulus {
  return { type: "coordinate-grid", title: "Coordinate grid", xMin: -e, xMax: e, yMin: -e, yMax: e, points, ...extra };
}
const rint = (random: () => number, lo: number, hi: number) => lo + Math.floor(random() * (hi - lo + 1));

// ---------------------------------------------------------------------------
// 1. Read a position off the grid
// ---------------------------------------------------------------------------
type ReadParams = { x1: number; y1: number; x2: number; y2: number; x3: number; y3: number; k: number; e: number };
const readPts = (p: ReadParams): Pt[] => [{ x: p.x1, y: p.y1 }, { x: p.x2, y: p.y2 }, { x: p.x3, y: p.y3 }];
const LABELS3 = ["A", "B", "C"];
const quadrantOf = (q: Pt) => `${Math.sign(q.x)},${Math.sign(q.y)}`;
export const BP_GRID_READ_POINT: StructuralBlueprint<ReadParams> = {
  blueprintId: "mr03-bp-grid-read-point",
  familyId: "mr03-coordinate",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-08",
  mathematicalObjective: "Read the coordinates of a plotted point, including negative coordinates, x first then y.",
  parameterRanges: { x1: { min: -8, max: 8 }, y1: { min: -8, max: 8 }, x2: { min: -8, max: 8 }, y2: { min: -8, max: 8 }, x3: { min: -8, max: 8 }, y3: { min: -8, max: 8 }, k: { min: 0, max: 2 }, e: { min: 5, max: 8 } },
  constraints: (p) => {
    const pts = readPts(p);
    const distinct = new Set(pts.map((q) => `${q.x},${q.y}`)).size === 3;
    const swapSafe = !pts.some((q) => q.x === q.y); // a point with x equal to y would hide an x/y swap
    return distinct && swapSafe && pts.every((q) => inside(q, p.e)) && EXTENTS.includes(p.e) && new Set(pts.map(quadrantOf)).size >= 2;
  },
  invalidCombinationDescription: "Three different points inside the grid, none with x equal to y (so a swapped answer is always detectable), spread over at least two quadrants.",
  difficultyControls: (p) => {
    const t = readPts(p)[p.k];
    const negatives = Number(t.x < 0) + Number(t.y < 0);
    return t.x === 0 || t.y === 0 ? "hard" : negatives === 2 ? "hard" : negatives === 1 ? "medium" : "easy";
  },
  difficultyDimensions: ["negative_coordinates", "point_on_an_axis"],
  sampleParams: (random) => {
    const e = EXTENTS[Math.floor(random() * 3)];
    return { x1: rint(random, -e, e), y1: rint(random, -e, e), x2: rint(random, -e, e), y2: rint(random, -e, e), x3: rint(random, -e, e), y3: rint(random, -e, e), k: Math.floor(random() * 3), e };
  },
  renderQuestionText: (p) => `The grid shows three points, A, B and C. What are the coordinates of point ${LABELS3[p.k]}? Give your answer in the form (x, y).`,
  deriveCorrectAnswer: (p) => formatCoordinatePoint(readPts(p)[p.k]),
  deriveWorkedSteps: (p) => {
    const t = readPts(p)[p.k];
    return [`Start at the origin. Move along the x-axis first: ${t.x === 0 ? "0 (stay on the y-axis)" : `${Math.abs(t.x)} ${t.x > 0 ? "right" : "left"}`}.`, `Then move ${t.y === 0 ? "0 (stay on the x-axis)" : `${Math.abs(t.y)} ${t.y > 0 ? "up" : "down"}`}. The point is ${formatCoordinatePoint(t)}.`];
  },
  deriveStimulus: (p) => grid(p.e, readPts(p).map((q, i) => ({ label: LABELS3[i], x: q.x, y: q.y }))),
  independentAnswerCheck: (p, claimed) => {
    const read = applyCoordinateTransform(readPts(p)[p.k], { kind: "translate", dx: 0, dy: 0 });
    return { matches: formatCoordinatePoint(read) === claimed, recomputedAnswer: formatCoordinatePoint(read), method: "generic_transform_identity_readback" };
  },
  stageSuitability: ["FOUNDATION", "DEVELOPMENT"],
  similarityControls: "three distinct points, the target and the grid size resampled independently.",
  reasoningRoute: () => "interpretation",
  contextTag: () => "grid_read_point",
  unknownPosition: () => "coordinates_of_plotted_point",
  representationType: () => "coordinate_grid",
  misconceptionTargeted: "writing the y-coordinate first, or dropping the sign of a coordinate on the negative side of an axis",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
};

// ---------------------------------------------------------------------------
// 2. Reflect in a drawn mirror line
// ---------------------------------------------------------------------------
type ReflectParams = { x: number; y: number; l: number; e: number };
const MIRRORS = ["x-axis", "y-axis", "y=x"] as const;
const REFLECT_KINDS = ["reflect_x_axis", "reflect_y_axis", "reflect_line_y_equals_x"] as const;
const reflectOf = (p: ReflectParams): Pt => applyCoordinateTransform({ x: p.x, y: p.y }, { kind: REFLECT_KINDS[p.l] });
export const BP_GRID_REFLECT_IN_MIRROR_LINE: StructuralBlueprint<ReflectParams> = {
  blueprintId: "mr03-bp-grid-reflect-in-mirror-line",
  familyId: "mr03-coordinate",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-08",
  mathematicalObjective: "Reflect a plotted point in a mirror line that is drawn on the grid (an axis or the line y = x) and read off the image.",
  parameterRanges: { x: { min: -8, max: 8 }, y: { min: -8, max: 8 }, l: { min: 0, max: 2 }, e: { min: 5, max: 8 } },
  constraints: (p) => {
    const onLine = p.l === 0 ? p.y === 0 : p.l === 1 ? p.x === 0 : p.x === p.y;
    const img = reflectOf(p);
    return EXTENTS.includes(p.e) && !onLine && inside({ x: p.x, y: p.y }, p.e) && inside(img, p.e) && p.x !== 0 && p.y !== 0 && Math.abs(p.x) !== Math.abs(p.y);
  },
  invalidCombinationDescription: "The point is not on the mirror line, not on an axis, |x| differs from |y| (so reflections in the axes and in y = x give four distinct points), and both the point and its image fit on the grid.",
  difficultyControls: (p) => (p.l === 2 ? "hard" : p.x < 0 && p.y < 0 ? "hard" : p.x < 0 || p.y < 0 ? "medium" : "easy"),
  difficultyDimensions: ["mirror_line_type", "negative_coordinates"],
  sampleParams: (random) => ({ x: rint(random, -8, 8), y: rint(random, -8, 8), l: Math.floor(random() * 3), e: EXTENTS[Math.floor(random() * 3)] }),
  renderQuestionText: () => "The grid shows a point P and a dashed mirror line. Reflect P in the mirror line. What are the coordinates of the new position of P? Give your answer in the form (x, y).",
  deriveCorrectAnswer: (p) => formatCoordinatePoint(reflectOf(p)),
  deriveWorkedSteps: (p) => {
    const rule = p.l === 0 ? "In the x-axis the x-coordinate stays and the y-coordinate changes sign." : p.l === 1 ? "In the y-axis the y-coordinate stays and the x-coordinate changes sign." : "In the line y = x the two coordinates swap places.";
    return [`P is at ${formatCoordinatePoint({ x: p.x, y: p.y })} and the mirror line is the ${p.l === 2 ? "line y = x" : MIRRORS[p.l]}.`, `${rule} The image is ${formatCoordinatePoint(reflectOf(p))}.`];
  },
  deriveStimulus: (p) => grid(p.e, [{ label: "P", x: p.x, y: p.y }], { mirrorLine: MIRRORS[p.l] }),
  independentAnswerCheck: (p, claimed) => {
    const r = applyCoordinateTransform({ x: p.x, y: p.y }, { kind: REFLECT_KINDS[p.l] });
    return { matches: formatCoordinatePoint(r) === claimed, recomputedAnswer: formatCoordinatePoint(r), method: "generic_transform_function" };
  },
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "the point, the mirror line and the grid size resampled independently.",
  reasoningRoute: () => "interpretation",
  contextTag: (p) => ["grid_reflect_x_axis", "grid_reflect_y_axis", "grid_reflect_y_equals_x"][p.l],
  unknownPosition: () => "image_coordinates",
  representationType: () => "coordinate_grid",
  misconceptionTargeted: "negating the coordinate that should stay fixed, or negating both coordinates (a rotation) when reflecting in y = x",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "independent_practice", "transfer"],
};

// ---------------------------------------------------------------------------
// 3. Translate a drawn point
// ---------------------------------------------------------------------------
type TranslateParams = { x: number; y: number; dx: number; dy: number; e: number };
export const BP_GRID_TRANSLATE_POINT: StructuralBlueprint<TranslateParams> = {
  blueprintId: "mr03-bp-grid-translate-point",
  familyId: "mr03-coordinate",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-08",
  mathematicalObjective: "Read a plotted point, apply a described translation (right/left, up/down) and give the new coordinates; the move may cross an axis.",
  parameterRanges: { x: { min: -8, max: 8 }, y: { min: -8, max: 8 }, dx: { min: -7, max: 7 }, dy: { min: -7, max: 7 }, e: { min: 5, max: 8 } },
  constraints: (p) => {
    const to = { x: p.x + p.dx, y: p.y + p.dy };
    return EXTENTS.includes(p.e) && inside({ x: p.x, y: p.y }, p.e) && inside(to, p.e) && p.dx !== 0 && p.dy !== 0 && p.x !== p.y;
  },
  invalidCombinationDescription: "Both movements are non-zero, the start and the finish are on the grid, and the start has x different from y.",
  difficultyControls: (p) => {
    const crosses = Math.sign(p.x) !== Math.sign(p.x + p.dx) || Math.sign(p.y) !== Math.sign(p.y + p.dy);
    return crosses && (p.dx < 0 || p.dy < 0) ? "hard" : crosses ? "medium" : "easy";
  },
  difficultyDimensions: ["crossing_an_axis", "negative_movement"],
  sampleParams: (random) => ({ x: rint(random, -8, 8), y: rint(random, -8, 8), dx: rint(random, -7, 7), dy: rint(random, -7, 7), e: EXTENTS[Math.floor(random() * 3)] }),
  renderQuestionText: (p) => `Point P is translated ${Math.abs(p.dx)} unit${Math.abs(p.dx) === 1 ? "" : "s"} ${p.dx > 0 ? "right" : "left"} and ${Math.abs(p.dy)} unit${Math.abs(p.dy) === 1 ? "" : "s"} ${p.dy > 0 ? "up" : "down"}. What are the coordinates of its new position? Give your answer in the form (x, y).`,
  deriveCorrectAnswer: (p) => formatCoordinatePoint({ x: p.x + p.dx, y: p.y + p.dy }),
  deriveWorkedSteps: (p) => [
    `P is at ${formatCoordinatePoint({ x: p.x, y: p.y })}. Moving ${p.dx > 0 ? "right" : "left"} changes x by ${p.dx > 0 ? "+" : "−"}${Math.abs(p.dx)}; moving ${p.dy > 0 ? "up" : "down"} changes y by ${p.dy > 0 ? "+" : "−"}${Math.abs(p.dy)}.`,
    `New position: (${p.x} ${p.dx > 0 ? "+" : "−"} ${Math.abs(p.dx)}, ${p.y} ${p.dy > 0 ? "+" : "−"} ${Math.abs(p.dy)}) = ${formatCoordinatePoint({ x: p.x + p.dx, y: p.y + p.dy })}.`,
  ],
  deriveStimulus: (p) => grid(p.e, [{ label: "P", x: p.x, y: p.y }]),
  independentAnswerCheck: (p, claimed) => {
    const r = applyCoordinateTransform({ x: p.x, y: p.y }, { kind: "translate", dx: p.dx, dy: p.dy });
    return { matches: formatCoordinatePoint(r) === claimed, recomputedAnswer: formatCoordinatePoint(r), method: "generic_transform_function" };
  },
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "start point, both movements and the grid size resampled independently.",
  reasoningRoute: () => "multi_step_application",
  contextTag: () => "grid_translate_point",
  unknownPosition: () => "new_coordinates",
  representationType: () => "coordinate_grid",
  misconceptionTargeted: "moving the wrong way for a left or down movement, or applying the horizontal movement to y and the vertical to x",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
};

// ---------------------------------------------------------------------------
// 4. Complete a drawn rectangle / parallelogram
// ---------------------------------------------------------------------------
type FourthParams = { ax: number; ay: number; bx: number; by: number; cx: number; cy: number; kind: number; e: number };
const abc = (p: FourthParams): [Pt, Pt, Pt] => [{ x: p.ax, y: p.ay }, { x: p.bx, y: p.by }, { x: p.cx, y: p.cy }];
const fourth = (p: FourthParams): Pt => {
  const [a, b, c] = abc(p);
  return { x: a.x + c.x - b.x, y: a.y + c.y - b.y };
};
const cross = (a: Pt, b: Pt, c: Pt) => (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x);
export const BP_GRID_FOURTH_VERTEX: StructuralBlueprint<FourthParams> = {
  blueprintId: "mr03-bp-grid-fourth-vertex",
  familyId: "mr03-coordinate",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-08",
  mathematicalObjective: "Given three drawn vertices of a rectangle or parallelogram (in order), find the fourth vertex using the shape's properties.",
  parameterRanges: { ax: { min: -8, max: 8 }, ay: { min: -8, max: 8 }, bx: { min: -8, max: 8 }, by: { min: -8, max: 8 }, cx: { min: -8, max: 8 }, cy: { min: -8, max: 8 }, kind: { min: 0, max: 1 }, e: { min: 5, max: 8 } },
  constraints: (p) => {
    const [a, b, c] = abc(p);
    const d = fourth(p);
    if (!EXTENTS.includes(p.e) || ![a, b, c, d].every((q) => inside(q, p.e))) return false;
    if (cross(a, b, c) === 0) return false; // collinear: no shape
    if (p.kind === 0) return a.y === b.y && b.x === c.x && a.x !== b.x && b.y !== c.y; // axis-aligned rectangle
    return a.y !== b.y && b.x !== c.x && a.x !== b.x && b.y !== c.y && !same(d, a) && Math.abs(cross(a, b, c)) >= 4; // slanted parallelogram
  },
  invalidCombinationDescription: "The four vertices all fit on the grid and are not collinear; kind 0 is an axis-aligned rectangle, kind 1 a slanted parallelogram with no axis-aligned side and a visible area.",
  difficultyControls: (p) => (p.kind === 0 ? (fourth(p).x < 0 || fourth(p).y < 0 ? "medium" : "easy") : fourth(p).x < 0 && fourth(p).y < 0 ? "hard" : "medium"),
  difficultyDimensions: ["shape_type", "negative_coordinates"],
  sampleParams: (random) => {
    for (;;) {
      const e = EXTENTS[Math.floor(random() * 3)];
      const kind = Math.floor(random() * 2);
      let a: Pt, b: Pt, c: Pt;
      if (kind === 0) {
        const x1 = rint(random, -e, e);
        const x2 = rint(random, -e, e);
        const y1 = rint(random, -e, e);
        const y2 = rint(random, -e, e);
        a = { x: x1, y: y1 }; b = { x: x2, y: y1 }; c = { x: x2, y: y2 };
      } else {
        a = { x: rint(random, -e, e), y: rint(random, -e, e) };
        b = { x: rint(random, -e, e), y: rint(random, -e, e) };
        c = { x: rint(random, -e, e), y: rint(random, -e, e) };
      }
      const p = { ax: a.x, ay: a.y, bx: b.x, by: b.y, cx: c.x, cy: c.y, kind, e };
      if (BP_GRID_FOURTH_VERTEX.constraints(p)) return p;
    }
  },
  renderQuestionText: (p) => `A, B and C are three corners of ${p.kind === 0 ? "a rectangle" : "a parallelogram"} ABCD, in that order. What are the coordinates of corner D? Give your answer in the form (x, y).`,
  deriveCorrectAnswer: (p) => formatCoordinatePoint(fourth(p)),
  deriveWorkedSteps: (p) => {
    const [a, b, c] = abc(p);
    return [
      `In ${p.kind === 0 ? "a rectangle" : "a parallelogram"} the side AD is the same movement as BC. Going from B to C is ${c.x - b.x >= 0 ? "+" : "−"}${Math.abs(c.x - b.x)} across and ${c.y - b.y >= 0 ? "+" : "−"}${Math.abs(c.y - b.y)} up/down.`,
      `Apply the same movement to A ${formatCoordinatePoint(a)}: D = ${formatCoordinatePoint(fourth(p))}.`,
    ];
  },
  deriveStimulus: (p) => {
    const [a, b, c] = abc(p);
    return grid(p.e, [{ label: "A", ...a }, { label: "B", ...b }, { label: "C", ...c }], { segments: [{ from: "A", to: "B" }, { from: "B", to: "C" }] });
  },
  // Independent route: the diagonals of a parallelogram (and so a rectangle) bisect each other, so midpoint(AC) must equal midpoint(BD).
  independentAnswerCheck: (p, claimed) => {
    const d = parseCoordinatePoint(claimed);
    const [a, b, c] = abc(p);
    const ok = d !== null && same(midpoint(a, c), midpoint(b, d));
    return { matches: ok, recomputedAnswer: formatCoordinatePoint(fourth(p)), method: "diagonals_bisect_each_other" };
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "three vertices resampled with shape-specific constraints; shape kind and grid size resampled independently.",
  reasoningRoute: () => "multi_step_application",
  contextTag: (p) => (p.kind === 0 ? "grid_complete_rectangle" : "grid_complete_parallelogram"),
  unknownPosition: () => "fourth_vertex",
  representationType: () => "coordinate_grid",
  misconceptionTargeted: "copying the x of one corner and the y of another without checking the shape (correct only for an axis-aligned rectangle), or adding instead of subtracting the opposite corner",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "independent_practice", "transfer", "mastery_check"],
};

// ---------------------------------------------------------------------------
// 5. Midpoint of a drawn segment
// ---------------------------------------------------------------------------
type MidParams = { ax: number; ay: number; bx: number; by: number; e: number };
export const BP_GRID_SEGMENT_MIDPOINT: StructuralBlueprint<MidParams> = {
  blueprintId: "mr03-bp-grid-midpoint-of-segment",
  familyId: "mr03-coordinate",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-08",
  mathematicalObjective: "Read the two ends of a drawn line segment and find the coordinates of its midpoint.",
  parameterRanges: { ax: { min: -8, max: 8 }, ay: { min: -8, max: 8 }, bx: { min: -8, max: 8 }, by: { min: -8, max: 8 }, e: { min: 5, max: 8 } },
  constraints: (p) => EXTENTS.includes(p.e) && inside({ x: p.ax, y: p.ay }, p.e) && inside({ x: p.bx, y: p.by }, p.e) && (p.ax + p.bx) % 2 === 0 && (p.ay + p.by) % 2 === 0 && p.ax !== p.bx && p.ay !== p.by,
  invalidCombinationDescription: "Both ends are on the grid, the midpoint is a whole-number point, and the segment is neither horizontal nor vertical (so both coordinates need working out).",
  difficultyControls: (p) => (p.ax < 0 || p.bx < 0 || p.ay < 0 || p.by < 0 ? ((p.ax + p.bx) / 2 < 0 || (p.ay + p.by) / 2 < 0 ? "hard" : "medium") : "easy"),
  difficultyDimensions: ["negative_coordinates"],
  sampleParams: (random) => ({ ax: rint(random, -8, 8), ay: rint(random, -8, 8), bx: rint(random, -8, 8), by: rint(random, -8, 8), e: EXTENTS[Math.floor(random() * 3)] }),
  renderQuestionText: () => "A and B are the ends of the line segment on the grid. What are the coordinates of the midpoint of AB? Give your answer in the form (x, y).",
  deriveCorrectAnswer: (p) => formatCoordinatePoint(midpoint({ x: p.ax, y: p.ay }, { x: p.bx, y: p.by })),
  deriveWorkedSteps: (p) => [
    `A is ${formatCoordinatePoint({ x: p.ax, y: p.ay })} and B is ${formatCoordinatePoint({ x: p.bx, y: p.by })}.`,
    `The midpoint is halfway in each direction: x = (${p.ax} + ${p.bx}) ÷ 2 = ${(p.ax + p.bx) / 2}, y = (${p.ay} + ${p.by}) ÷ 2 = ${(p.ay + p.by) / 2}.`,
  ],
  deriveStimulus: (p) => grid(p.e, [{ label: "A", x: p.ax, y: p.ay }, { label: "B", x: p.bx, y: p.by }], { segments: [{ from: "A", to: "B" }] }),
  // Independent route: the midpoint is equidistant (in each coordinate) from both ends.
  independentAnswerCheck: (p, claimed) => {
    const m = parseCoordinatePoint(claimed);
    const ok = m !== null && m.x - p.ax === p.bx - m.x && m.y - p.ay === p.by - m.y;
    return { matches: ok, recomputedAnswer: formatCoordinatePoint(midpoint({ x: p.ax, y: p.ay }, { x: p.bx, y: p.by })), method: "equal_steps_to_each_end" };
  },
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "both ends and the grid size resampled with a whole-number-midpoint constraint.",
  reasoningRoute: () => "multi_step_application",
  contextTag: () => "grid_segment_midpoint",
  unknownPosition: () => "midpoint_coordinates",
  representationType: () => "coordinate_grid",
  misconceptionTargeted: "averaging only one coordinate, or giving the length of the segment instead of its midpoint",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "independent_practice", "transfer"],
};

export const MR03_GRID_EXPANSION: EducationalFamily = {
  familyId: "mr03-coordinate",
  subject: "maths",
  blueprints: [BP_GRID_READ_POINT, BP_GRID_REFLECT_IN_MIRROR_LINE, BP_GRID_TRANSLATE_POINT, BP_GRID_FOURTH_VERTEX, BP_GRID_SEGMENT_MIDPOINT] as EducationalFamily["blueprints"],
};
