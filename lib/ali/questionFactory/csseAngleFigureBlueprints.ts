import type { StructuralBlueprint, EducationalFamily } from "./types";
import type { MockAngleFigureStimulus } from "@/lib/mockAttempt/types";

/**
 * CSSE Completion, representation priority 2: angle figures, for QT-MR-07 (MR-03 geometry, angle facts).
 *
 * Live baseline: the 27 angle-sum, 5 angle-ratio and 3 classify items are all prose ("A triangle has angles of 40, 70 and
 * one unknown"), so the child never sees a figure. Real angle questions are a figure. Here the figure is drawn (triangle,
 * angles on a straight line, angles around a point) and the question text carries NO angle values, so the figure is
 * necessary. Five structurally different demands: the three standard angle facts, plus the two isosceles routes (two equal
 * unknowns; a double-then-subtract).
 *
 * Every blueprint's independentAnswerCheck is the SAME generic route and is not the blueprint's own formula: read the
 * labels back out of the STIMULUS, substitute the claimed value for every unknown letter, and require the angles to total
 * 180 (triangle, straight line) or 360 (around a point). Additive to the live `mr03-angle-sum` family; nothing here
 * touches the bank, Mock, or publication.
 */

const D = "°";
const rint = (random: () => number, lo: number, hi: number) => lo + Math.floor(random() * (hi - lo + 1));
const TOTAL = { triangle: 180, "straight-line": 180, "around-point": 360 } as const;

function figure(kind: MockAngleFigureStimulus["figure"], sizes: number[], unknownAt: number[], letter = "x"): MockAngleFigureStimulus {
  return { type: "angle-figure", figure: kind, angles: sizes.map((size, i) => ({ size, shown: unknownAt.includes(i) ? letter : `${size}${D}` })) };
}

function totalCheck(stim: MockAngleFigureStimulus, claimed: string) {
  const value = Number(claimed);
  let sum = 0;
  for (const a of stim.angles) {
    const m = a.shown.match(/^(\d+)°$/);
    sum += m ? Number(m[1]) : value;
  }
  return { matches: Number.isFinite(value) && sum === TOTAL[stim.figure], recomputedAnswer: String(TOTAL[stim.figure]), method: "labels_read_back_from_figure_total" };
}

const STAGES: StructuralBlueprint<Record<string, number>>["stageSuitability"] = ["FOUNDATION", "DEVELOPMENT", "EXAM_PREPARATION"];

// 1. Triangle, find x ---------------------------------------------------------
type TriParams = { a: number; b: number; k: number };
const triSizes = (p: TriParams) => {
  const x = 180 - p.a - p.b;
  const s = [p.a, p.b];
  s.splice(p.k, 0, x);
  return { sizes: s, x };
};
export const BP_FIG_TRIANGLE_FIND_X: StructuralBlueprint<TriParams> = {
  blueprintId: "mr03-bp-fig-triangle-find-x",
  familyId: "mr03-angle-sum",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-07",
  mathematicalObjective: "Read two angles from a drawn triangle and use the angle sum of 180 degrees to find the third (labelled x).",
  parameterRanges: { a: { min: 15, max: 120 }, b: { min: 15, max: 120 }, k: { min: 0, max: 2 } },
  constraints: (p) => p.a + p.b <= 160 && 180 - p.a - p.b >= 15 && new Set([p.a, p.b, 180 - p.a - p.b]).size === 3,
  invalidCombinationDescription: "The third angle is at least 15 degrees, and the three angles are all different so the figure is a scalene triangle with a clearly readable x.",
  difficultyControls: (p) => (p.a + p.b <= 90 ? "easy" : p.a + p.b <= 135 ? "medium" : "hard"),
  difficultyDimensions: ["sum_magnitude"],
  sampleParams: (random) => ({ a: rint(random, 15, 120), b: rint(random, 15, 120), k: rint(random, 0, 2) }),
  renderQuestionText: () => "The diagram shows a triangle. Work out the size of angle x. Give your answer in degrees.",
  deriveCorrectAnswer: (p) => String(180 - p.a - p.b),
  deriveWorkedSteps: (p) => ["The angles in a triangle add up to 180" + D, `${p.a} + ${p.b} = ${p.a + p.b}`, `x = 180 - ${p.a + p.b} = ${180 - p.a - p.b}`],
  deriveStimulus: (p) => {
    const { sizes } = triSizes(p);
    return figure("triangle", sizes, [p.k]);
  },
  independentAnswerCheck: (p, claimed) => totalCheck(BP_FIG_TRIANGLE_FIND_X.deriveStimulus!(p) as MockAngleFigureStimulus, claimed),
  stageSuitability: STAGES,
  similarityControls: "two angles and the position of x resampled independently.",
  reasoningRoute: () => "interpretation",
  contextTag: () => "fig_triangle",
  unknownPosition: (p) => `x_at_vertex_${p.k}`,
  representationType: () => "angle_figure",
  misconceptionTargeted: "adding the two angles and stopping, or subtracting from 360 or 90 instead of 180",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
};

// 2. Angles on a straight line ----------------------------------------------
type LineParams = { n: number; a1: number; a2: number; a3: number; k: number };
const lineKnown = (p: LineParams) => [p.a1, p.a2, p.a3].slice(0, p.n - 1);
export const BP_FIG_STRAIGHT_LINE_FIND_X: StructuralBlueprint<LineParams> = {
  blueprintId: "mr03-bp-fig-straight-line-find-x",
  familyId: "mr03-angle-sum",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-07",
  mathematicalObjective: "Use the fact that angles on a straight line add up to 180 degrees, with one to three angles shown, to find x.",
  parameterRanges: { n: { min: 2, max: 4 }, a1: { min: 15, max: 150 }, a2: { min: 15, max: 150 }, a3: { min: 15, max: 150 }, k: { min: 0, max: 3 } },
  constraints: (p) => {
    const known = lineKnown(p);
    const x = 180 - known.reduce((s, v) => s + v, 0);
    return p.n >= 2 && p.n <= 4 && p.k < p.n && x >= 15 && known.every((v) => v >= 15) && new Set([...known, x]).size === p.n;
  },
  invalidCombinationDescription: "Every angle, including x, is at least 15 degrees and all are different, so every angle is readable and no label is ambiguous.",
  difficultyControls: (p) => (p.n === 2 ? "easy" : p.n === 3 ? "medium" : "hard"),
  difficultyDimensions: ["number_of_angles_shown"],
  sampleParams: (random) => ({ n: rint(random, 2, 4), a1: rint(random, 15, 150), a2: rint(random, 15, 150), a3: rint(random, 15, 150), k: rint(random, 0, 3) }),
  renderQuestionText: () => "The diagram shows angles on a straight line. Work out the size of angle x. Give your answer in degrees.",
  deriveCorrectAnswer: (p) => String(180 - lineKnown(p).reduce((s, v) => s + v, 0)),
  deriveWorkedSteps: (p) => {
    const known = lineKnown(p);
    const sum = known.reduce((s, v) => s + v, 0);
    return ["Angles on a straight line add up to 180" + D, `${known.join(" + ")} = ${sum}`, `x = 180 - ${sum} = ${180 - sum}`];
  },
  deriveStimulus: (p) => {
    const known = lineKnown(p);
    const x = 180 - known.reduce((s, v) => s + v, 0);
    const sizes = [...known];
    sizes.splice(p.k, 0, x);
    return figure("straight-line", sizes, [p.k]);
  },
  independentAnswerCheck: (p, claimed) => totalCheck(BP_FIG_STRAIGHT_LINE_FIND_X.deriveStimulus!(p) as MockAngleFigureStimulus, claimed),
  stageSuitability: STAGES,
  similarityControls: "number of angles, their sizes and the position of x resampled independently.",
  reasoningRoute: () => "interpretation",
  contextTag: (p) => `fig_straight_line_${p.n}_angles`,
  unknownPosition: (p) => `x_at_position_${p.k}`,
  representationType: () => "angle_figure",
  misconceptionTargeted: "using 360 (or 90) for angles on a straight line, or leaving out one of the shown angles",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
};

// 3. Angles around a point ---------------------------------------------------
type PointParams = { n: number; a1: number; a2: number; a3: number; a4: number; k: number };
const pointKnown = (p: PointParams) => [p.a1, p.a2, p.a3, p.a4].slice(0, p.n - 1);
export const BP_FIG_AROUND_POINT_FIND_X: StructuralBlueprint<PointParams> = {
  blueprintId: "mr03-bp-fig-around-point-find-x",
  familyId: "mr03-angle-sum",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-07",
  mathematicalObjective: "Use the fact that angles around a point add up to 360 degrees, with two to four angles shown, to find x (which may be a reflex angle).",
  parameterRanges: { n: { min: 3, max: 5 }, a1: { min: 25, max: 160 }, a2: { min: 25, max: 160 }, a3: { min: 25, max: 160 }, a4: { min: 25, max: 160 }, k: { min: 0, max: 4 } },
  constraints: (p) => {
    const known = pointKnown(p);
    const x = 360 - known.reduce((s, v) => s + v, 0);
    return p.n >= 3 && p.n <= 5 && p.k < p.n && x >= 25 && x <= 250 && known.every((v) => v >= 25 && v <= 160) && new Set([...known, x]).size === p.n;
  },
  invalidCombinationDescription: "Every angle is at least 25 degrees (so labels fit), all are different, and x may be up to 250 degrees (a reflex angle is allowed).",
  difficultyControls: (p) => {
    const x = 360 - pointKnown(p).reduce((s, v) => s + v, 0);
    return x > 180 ? "hard" : p.n === 3 ? "easy" : "medium";
  },
  difficultyDimensions: ["number_of_angles_shown", "reflex_unknown"],
  sampleParams: (random) => ({ n: rint(random, 3, 5), a1: rint(random, 25, 160), a2: rint(random, 25, 160), a3: rint(random, 25, 160), a4: rint(random, 25, 160), k: rint(random, 0, 4) }),
  renderQuestionText: () => "The diagram shows angles around a point. Work out the size of angle x. Give your answer in degrees.",
  deriveCorrectAnswer: (p) => String(360 - pointKnown(p).reduce((s, v) => s + v, 0)),
  deriveWorkedSteps: (p) => {
    const known = pointKnown(p);
    const sum = known.reduce((s, v) => s + v, 0);
    return ["Angles around a point add up to 360" + D, `${known.join(" + ")} = ${sum}`, `x = 360 - ${sum} = ${360 - sum}`];
  },
  deriveStimulus: (p) => {
    const known = pointKnown(p);
    const x = 360 - known.reduce((s, v) => s + v, 0);
    const sizes = [...known];
    sizes.splice(p.k, 0, x);
    return figure("around-point", sizes, [p.k]);
  },
  independentAnswerCheck: (p, claimed) => totalCheck(BP_FIG_AROUND_POINT_FIND_X.deriveStimulus!(p) as MockAngleFigureStimulus, claimed),
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "number of angles, their sizes and the position of x resampled independently.",
  reasoningRoute: () => "interpretation",
  contextTag: (p) => `fig_around_point_${p.n}_angles`,
  unknownPosition: (p) => `x_at_position_${p.k}`,
  representationType: () => "angle_figure",
  misconceptionTargeted: "using 180 instead of 360 for angles around a point",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "independent_practice", "transfer"],
};

// 4. Isosceles: apex shown, two equal base angles x ----------------------------
type IsoBaseParams = { apex: number; k: number };
export const BP_FIG_ISOSCELES_FIND_BASE: StructuralBlueprint<IsoBaseParams> = {
  blueprintId: "mr03-bp-fig-isosceles-find-base",
  familyId: "mr03-angle-sum",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-07",
  mathematicalObjective: "In an isosceles triangle drawn with the angle between the equal sides shown and the two equal angles both marked x, find x.",
  parameterRanges: { apex: { min: 20, max: 140 }, k: { min: 0, max: 2 } },
  constraints: (p) => p.apex % 2 === 0 && p.apex >= 20 && p.apex <= 140 && p.apex !== 60 && p.k >= 0 && p.k <= 2,
  invalidCombinationDescription: "The apex angle is even (so x is a whole number), between 20 and 140, and not 60 (which would make the triangle equilateral).",
  difficultyControls: (p) => (p.apex <= 80 ? "medium" : "hard"),
  difficultyDimensions: ["two_equal_unknowns"],
  sampleParams: (random) => ({ apex: 2 * rint(random, 10, 70), k: rint(random, 0, 2) }),
  renderQuestionText: () => "The diagram shows a triangle. The two angles marked x are equal. Work out the size of angle x. Give your answer in degrees.",
  deriveCorrectAnswer: (p) => String((180 - p.apex) / 2),
  deriveWorkedSteps: (p) => ["The angles in a triangle add up to 180" + D, `The two angles x are equal, so 2x = 180 - ${p.apex} = ${180 - p.apex}`, `x = ${180 - p.apex} / 2 = ${(180 - p.apex) / 2}`],
  deriveStimulus: (p) => {
    const x = (180 - p.apex) / 2;
    const sizes = [x, x];
    sizes.splice(p.k, 0, p.apex);
    return figure("triangle", sizes, [0, 1, 2].filter((i) => i !== p.k));
  },
  independentAnswerCheck: (p, claimed) => totalCheck(BP_FIG_ISOSCELES_FIND_BASE.deriveStimulus!(p) as MockAngleFigureStimulus, claimed),
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "the shown angle and the vertex it sits at resampled independently.",
  reasoningRoute: () => "multi_step_application",
  contextTag: () => "fig_isosceles_base",
  unknownPosition: () => "two_equal_base_angles",
  representationType: () => "angle_figure",
  misconceptionTargeted: "subtracting from 180 and forgetting to halve (giving 2x), or treating the shown angle as one of the equal pair",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "independent_practice", "transfer"],
};

export const MR03_ANGLE_FIGURE_EXPANSION: EducationalFamily = {
  familyId: "mr03-angle-sum",
  subject: "maths",
  blueprints: [BP_FIG_TRIANGLE_FIND_X, BP_FIG_STRAIGHT_LINE_FIND_X, BP_FIG_AROUND_POINT_FIND_X, BP_FIG_ISOSCELES_FIND_BASE] as EducationalFamily["blueprints"],
};
