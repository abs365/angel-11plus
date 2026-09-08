import type { StructuralBlueprint, EducationalFamily } from "./types";
import { applyCoordinateTransform, formatCoordinatePoint, midpoint } from "./independentValidation";

/**
 * Controlled Scale Increment 002 — Bounded Maths Continuation,
 * mr03-coordinate.
 *
 * Real, existing production content (3 practice-eligible rows, read live
 * before designing these blueprints) already spans THREE genuinely
 * different demands -- reflect in the x-axis, reflect in the y-axis, and
 * translate -- these blueprints formalise all three as distinct
 * StructuralBlueprints and add four further genuinely distinct
 * coordinate-geometry demands, all inside MR-03/QT-MR-08. Every
 * blueprint's `independentAnswerCheck` recomputes via
 * `applyCoordinateTransform`/`midpoint` (independentValidation.ts) --
 * generic, transform-agnostic functions, never a blueprint's own inline
 * sign-flip/addition -- from the start.
 */

type ReflectXParams = { x: number; y: number };
export const BP_REFLECT_X_AXIS: StructuralBlueprint<ReflectXParams> = {
  blueprintId: "mr03-bp-reflect-x-axis",
  familyId: "mr03-coordinate",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-08",
  mathematicalObjective: "Reflect a point in the x-axis -- the y-coordinate negates, the x-coordinate is unchanged.",
  parameterRanges: { x: { min: -10, max: 10 }, y: { min: -10, max: 10 } },
  constraints: (p) => p.y !== 0,
  invalidCombinationDescription: "y=0 is excluded -- a point already on the x-axis reflects to itself, a degenerate, uninformative case.",
  // Increment 002 Revision, Section 6 -- replaces the prior magnitude
  // proxy (bigger numbers != harder reasoning for a reflection). The
  // real reasoning-demand dimensions here: x=0 puts the point ON the
  // OTHER axis (the one NOT being reflected across), a documented
  // confusion between "a point on an axis" and "the axis of
  // reflection"; y<0 means the correct answer requires negating an
  // already-negative value (double-negative reasoning), a genuine,
  // well-documented arithmetic error source independent of magnitude.
  difficultyControls: (p) => (p.x === 0 ? "hard" : p.y < 0 ? "medium" : "easy"),
  difficultyDimensions: ["point_lies_on_other_axis", "sign_of_reflected_coordinate"],
  sampleParams: (random) => ({ x: -10 + Math.floor(random() * 21), y: -10 + Math.floor(random() * 21) }),
  renderQuestionText: (p) => `Point A is at (${p.x}, ${p.y}). It is reflected in the x-axis. What are the new coordinates?`,
  deriveCorrectAnswer: (p) => formatCoordinatePoint(applyCoordinateTransform({ x: p.x, y: p.y }, { kind: "reflect_x_axis" })),
  deriveWorkedSteps: (p) => ["Reflecting in the x-axis keeps x the same and negates y", `(${p.x}, ${p.y}) → (${p.x}, ${-p.y})`],
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "x/y resampled independently; y=0 excluded by constraints.",
  reasoningRoute: () => "direct_computation",
  contextTag: () => "coordinate_geometry",
  unknownPosition: () => "reflected_point",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
  independentAnswerCheck: (p, claimedAnswer) => {
    const recomputed = applyCoordinateTransform({ x: p.x, y: p.y }, { kind: "reflect_x_axis" });
    return { matches: formatCoordinatePoint(recomputed) === claimedAnswer, recomputedAnswer: formatCoordinatePoint(recomputed), method: "generic_transform_function" };
  },
};

type ReflectYParams = { x: number; y: number };
export const BP_REFLECT_Y_AXIS: StructuralBlueprint<ReflectYParams> = {
  blueprintId: "mr03-bp-reflect-y-axis",
  familyId: "mr03-coordinate",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-08",
  mathematicalObjective: "Reflect a point in the y-axis -- the x-coordinate negates, the y-coordinate is unchanged. A different sign-flip target from BP_REFLECT_X_AXIS, not a cosmetic relabelling.",
  parameterRanges: { x: { min: -10, max: 10 }, y: { min: -10, max: 10 } },
  constraints: (p) => p.x !== 0,
  invalidCombinationDescription: "x=0 is excluded -- a point already on the y-axis reflects to itself, a degenerate, uninformative case.",
  // Increment 002 Revision, Section 6 -- mirror of BP_REFLECT_X_AXIS's
  // fix. y=0 puts the point on the OTHER axis (the x-axis, not the axis
  // being reflected across); x<0 means negating an already-negative
  // value (double-negative reasoning).
  difficultyControls: (p) => (p.y === 0 ? "hard" : p.x < 0 ? "medium" : "easy"),
  difficultyDimensions: ["point_lies_on_other_axis", "sign_of_reflected_coordinate"],
  sampleParams: (random) => ({ x: -10 + Math.floor(random() * 21), y: -10 + Math.floor(random() * 21) }),
  renderQuestionText: (p) => `Point B is at (${p.x}, ${p.y}). It is reflected in the y-axis. What are the new coordinates?`,
  deriveCorrectAnswer: (p) => formatCoordinatePoint(applyCoordinateTransform({ x: p.x, y: p.y }, { kind: "reflect_y_axis" })),
  deriveWorkedSteps: (p) => ["Reflecting in the y-axis keeps y the same and negates x", `(${p.x}, ${p.y}) → (${-p.x}, ${p.y})`],
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "x/y resampled independently; x=0 excluded by constraints.",
  reasoningRoute: () => "direct_computation",
  contextTag: () => "coordinate_geometry",
  unknownPosition: () => "reflected_point",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
  independentAnswerCheck: (p, claimedAnswer) => {
    const recomputed = applyCoordinateTransform({ x: p.x, y: p.y }, { kind: "reflect_y_axis" });
    return { matches: formatCoordinatePoint(recomputed) === claimedAnswer, recomputedAnswer: formatCoordinatePoint(recomputed), method: "generic_transform_function" };
  },
};

type ReflectLineParams = { x: number; y: number };
export const BP_REFLECT_LINE_Y_EQUALS_X: StructuralBlueprint<ReflectLineParams> = {
  blueprintId: "mr03-bp-reflect-line-y-equals-x",
  familyId: "mr03-coordinate",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-08",
  mathematicalObjective: "Reflect a point in the line y=x -- the coordinates SWAP, a genuinely different rule from negating a single coordinate (BP_REFLECT_X_AXIS/BP_REFLECT_Y_AXIS's own sign-flip rule).",
  parameterRanges: { x: { min: -10, max: 10 }, y: { min: -10, max: 10 } },
  constraints: (p) => p.x !== p.y,
  invalidCombinationDescription: "x=y is excluded -- a point already on the line y=x reflects to itself, a degenerate, uninformative case.",
  // Increment 002 Revision, Section 6 -- the swap rule's genuine
  // reasoning demand comes from how many of the two coordinates are
  // negative, not their size: swapping two positives is direct
  // placement; a negative in either slot requires carrying the sign
  // across the swap, and two negatives compounds that twice.
  difficultyControls: (p) => {
    const negativeCount = (p.x < 0 ? 1 : 0) + (p.y < 0 ? 1 : 0);
    return negativeCount === 0 ? "easy" : negativeCount === 1 ? "medium" : "hard";
  },
  difficultyDimensions: ["count_of_negative_coordinates"],
  sampleParams: (random) => ({ x: -10 + Math.floor(random() * 21), y: -10 + Math.floor(random() * 21) }),
  renderQuestionText: (p) => `Point C is at (${p.x}, ${p.y}). It is reflected in the line y = x. What are the new coordinates?`,
  deriveCorrectAnswer: (p) => formatCoordinatePoint(applyCoordinateTransform({ x: p.x, y: p.y }, { kind: "reflect_line_y_equals_x" })),
  deriveWorkedSteps: (p) => ["Reflecting in the line y = x swaps the x- and y-coordinates", `(${p.x}, ${p.y}) → (${p.y}, ${p.x})`],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "x/y resampled independently; x=y excluded by constraints.",
  reasoningRoute: () => "direct_computation",
  contextTag: () => "coordinate_geometry",
  unknownPosition: () => "reflected_point",
  representationType: () => "prose",
  misconceptionTargeted: "negating a coordinate (the axis-reflection rule) instead of swapping them when reflecting in the line y=x",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["scaffolded_practice", "mastery_check"],
  independentAnswerCheck: (p, claimedAnswer) => {
    const recomputed = applyCoordinateTransform({ x: p.x, y: p.y }, { kind: "reflect_line_y_equals_x" });
    return { matches: formatCoordinatePoint(recomputed) === claimedAnswer, recomputedAnswer: formatCoordinatePoint(recomputed), method: "generic_transform_function" };
  },
};

type TranslateParams = { x: number; y: number; dx: number; dy: number };
export const BP_TRANSLATE: StructuralBlueprint<TranslateParams> = {
  blueprintId: "mr03-bp-translate",
  familyId: "mr03-coordinate",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-08",
  mathematicalObjective: "Translate a point by a given horizontal and vertical shift -- an additive operation on BOTH coordinates, genuinely different from any single-coordinate reflection rule.",
  parameterRanges: { x: { min: -10, max: 10 }, y: { min: -10, max: 10 }, dx: { min: -8, max: 8 }, dy: { min: -8, max: 8 } },
  constraints: (p) => p.dx !== 0 || p.dy !== 0,
  invalidCombinationDescription: "A zero-vector translation (dx=0 and dy=0) is excluded -- no genuine movement to test.",
  // Increment 002 Revision, Section 6 -- the genuine reasoning demand in
  // a translation is whether a coordinate CROSSES ZERO (changes sign),
  // e.g. 3 + (-5) = -2 requires understanding the shift passes through
  // the origin, unlike 3 + 5 = 8 or -3 + (-5) = -8, which stay
  // same-signed throughout -- a real, well-documented arithmetic error
  // source, independent of how large dx/dy happen to be.
  difficultyControls: (p) => {
    const newX = p.x + p.dx;
    const newY = p.y + p.dy;
    const xCrossesSign = p.x !== 0 && newX !== 0 && (p.x >= 0) !== (newX >= 0);
    const yCrossesSign = p.y !== 0 && newY !== 0 && (p.y >= 0) !== (newY >= 0);
    const crossCount = (xCrossesSign ? 1 : 0) + (yCrossesSign ? 1 : 0);
    return crossCount === 0 ? "easy" : crossCount === 1 ? "medium" : "hard";
  },
  difficultyDimensions: ["sign_crossing_count"],
  sampleParams: (random) => ({
    x: -10 + Math.floor(random() * 21), y: -10 + Math.floor(random() * 21),
    dx: -8 + Math.floor(random() * 17), dy: -8 + Math.floor(random() * 17),
  }),
  renderQuestionText: (p) => {
    // Increment 002 Revision, Section 5 -- only render a clause for an
    // axis that actually moves; the prior version always rendered both
    // clauses, producing "0 units right"-style phrasing whenever dx or
    // dy was 0. constraints (dx !== 0 || dy !== 0) guarantee at least
    // one clause is always present.
    const parts: string[] = [];
    if (p.dx > 0) parts.push(`${p.dx} units right`);
    else if (p.dx < 0) parts.push(`${Math.abs(p.dx)} units left`);
    if (p.dy > 0) parts.push(`${p.dy} units up`);
    else if (p.dy < 0) parts.push(`${Math.abs(p.dy)} units down`);
    const movementText = parts.join(" and ");
    return `Point C is at (${p.x}, ${p.y}). It is translated ${movementText}. What are the new coordinates?`;
  },
  deriveCorrectAnswer: (p) => formatCoordinatePoint(applyCoordinateTransform({ x: p.x, y: p.y }, { kind: "translate", dx: p.dx, dy: p.dy })),
  deriveWorkedSteps: (p) => [`New x: ${p.x} + (${p.dx}) = ${p.x + p.dx}`, `New y: ${p.y} + (${p.dy}) = ${p.y + p.dy}`],
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "x/y/dx/dy resampled independently; the zero-vector case excluded by constraints.",
  reasoningRoute: () => "direct_computation",
  contextTag: () => "coordinate_geometry",
  unknownPosition: () => "translated_point",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
  independentAnswerCheck: (p, claimedAnswer) => {
    const recomputed = applyCoordinateTransform({ x: p.x, y: p.y }, { kind: "translate", dx: p.dx, dy: p.dy });
    return { matches: formatCoordinatePoint(recomputed) === claimedAnswer, recomputedAnswer: formatCoordinatePoint(recomputed), method: "generic_transform_function" };
  },
};

type ReverseTranslateParams = { resultX: number; resultY: number; dx: number; dy: number };
export const BP_REVERSE_TRANSLATION: StructuralBlueprint<ReverseTranslateParams> = {
  blueprintId: "mr03-bp-reverse-translation",
  familyId: "mr03-coordinate",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-08",
  mathematicalObjective: "Given the point AFTER a translation and the translation vector, find the ORIGINAL point -- the reverse direction of BP_TRANSLATE, requiring subtraction rather than addition.",
  parameterRanges: { resultX: { min: -10, max: 10 }, resultY: { min: -10, max: 10 }, dx: { min: -8, max: 8 }, dy: { min: -8, max: 8 } },
  constraints: (p) => p.dx !== 0 || p.dy !== 0,
  invalidCombinationDescription: "A zero-vector translation is excluded -- no genuine movement to reverse.",
  // Increment 002 Revision, Section 6 -- mirror of BP_TRANSLATE's fix,
  // computed on the reverse (subtraction) direction: does recovering the
  // ORIGINAL coordinate require crossing zero relative to the given
  // result coordinate.
  difficultyControls: (p) => {
    const origX = p.resultX - p.dx;
    const origY = p.resultY - p.dy;
    const xCrossesSign = origX !== 0 && p.resultX !== 0 && (origX >= 0) !== (p.resultX >= 0);
    const yCrossesSign = origY !== 0 && p.resultY !== 0 && (origY >= 0) !== (p.resultY >= 0);
    const crossCount = (xCrossesSign ? 1 : 0) + (yCrossesSign ? 1 : 0);
    return crossCount === 0 ? "easy" : crossCount === 1 ? "medium" : "hard";
  },
  difficultyDimensions: ["sign_crossing_count"],
  sampleParams: (random) => ({
    resultX: -10 + Math.floor(random() * 21), resultY: -10 + Math.floor(random() * 21),
    dx: -8 + Math.floor(random() * 17), dy: -8 + Math.floor(random() * 17),
  }),
  renderQuestionText: (p) => {
    // Increment 002 Revision, Section 5 -- same zero-clause fix as
    // BP_TRANSLATE.
    const parts: string[] = [];
    if (p.dx > 0) parts.push(`${p.dx} units right`);
    else if (p.dx < 0) parts.push(`${Math.abs(p.dx)} units left`);
    if (p.dy > 0) parts.push(`${p.dy} units up`);
    else if (p.dy < 0) parts.push(`${Math.abs(p.dy)} units down`);
    const movementText = parts.join(" and ");
    return `Point D was translated ${movementText} to end up at (${p.resultX}, ${p.resultY}). What were its original coordinates?`;
  },
  deriveCorrectAnswer: (p) => formatCoordinatePoint({ x: p.resultX - p.dx, y: p.resultY - p.dy }),
  deriveWorkedSteps: (p) => [`Original x: ${p.resultX} − (${p.dx}) = ${p.resultX - p.dx}`, `Original y: ${p.resultY} − (${p.dy}) = ${p.resultY - p.dy}`],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "resultX/resultY/dx/dy resampled independently; the zero-vector case excluded by constraints.",
  reasoningRoute: () => "reverse_reasoning",
  contextTag: () => "coordinate_geometry",
  unknownPosition: () => "original_point",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "transfer"],
  independentAnswerCheck: (p, claimedAnswer) => {
    // Independent route: apply the FORWARD translation to the candidate's
    // claimed original point and verify it lands back on the stated
    // result -- checking the relationship holds, rather than repeating
    // the blueprint's own subtraction.
    const match = claimedAnswer.match(/\(([-\d]+),\s*([-\d]+)\)/);
    if (!match) return { matches: false, recomputedAnswer: "UNPARSEABLE", method: "forward_transform_verification" };
    const claimedOriginal = { x: Number(match[1]), y: Number(match[2]) };
    const forward = applyCoordinateTransform(claimedOriginal, { kind: "translate", dx: p.dx, dy: p.dy });
    const matches = forward.x === p.resultX && forward.y === p.resultY;
    return { matches, recomputedAnswer: formatCoordinatePoint(claimedOriginal), method: "forward_transform_verification" };
  },
};

type MidpointParams = { x1: number; y1: number; x2: number; y2: number };
export const BP_FIND_MIDPOINT: StructuralBlueprint<MidpointParams> = {
  blueprintId: "mr03-bp-find-midpoint",
  familyId: "mr03-coordinate",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-08",
  mathematicalObjective: "Find the midpoint of two given points -- an averaging operation across two whole points, genuinely different from any single-point reflection/translation.",
  parameterRanges: { x1: { min: -10, max: 10 }, y1: { min: -10, max: 10 }, x2: { min: -10, max: 10 }, y2: { min: -10, max: 10 } },
  constraints: (p) => (p.x1 + p.x2) % 2 === 0 && (p.y1 + p.y2) % 2 === 0 && (p.x1 !== p.x2 || p.y1 !== p.y2),
  invalidCombinationDescription: "Only combinations producing a whole-number midpoint are accepted; the two points must genuinely differ.",
  difficultyControls: (p) => {
    const distance = Math.abs(p.x1 - p.x2) + Math.abs(p.y1 - p.y2);
    return distance <= 10 ? "easy" : distance <= 20 ? "medium" : "hard";
  },
  difficultyDimensions: ["point_separation"],
  sampleParams: (random) => ({
    x1: -10 + Math.floor(random() * 21), y1: -10 + Math.floor(random() * 21),
    x2: -10 + Math.floor(random() * 21), y2: -10 + Math.floor(random() * 21),
  }),
  renderQuestionText: (p) => `What is the midpoint of the line joining (${p.x1}, ${p.y1}) and (${p.x2}, ${p.y2})?`,
  deriveCorrectAnswer: (p) => formatCoordinatePoint(midpoint({ x: p.x1, y: p.y1 }, { x: p.x2, y: p.y2 })),
  deriveWorkedSteps: (p) => [`Midpoint x: (${p.x1} + ${p.x2}) ÷ 2 = ${(p.x1 + p.x2) / 2}`, `Midpoint y: (${p.y1} + ${p.y2}) ÷ 2 = ${(p.y1 + p.y2) / 2}`],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "x1/y1/x2/y2 resampled independently every candidate.",
  reasoningRoute: () => "multi_step_application",
  contextTag: () => "coordinate_geometry",
  unknownPosition: () => "midpoint",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "independent_practice"],
  independentAnswerCheck: (p, claimedAnswer) => {
    const recomputed = midpoint({ x: p.x1, y: p.y1 }, { x: p.x2, y: p.y2 });
    return { matches: formatCoordinatePoint(recomputed) === claimedAnswer, recomputedAnswer: formatCoordinatePoint(recomputed), method: "generic_midpoint_function" };
  },
};

type CoordErrorParams = { x: number; y: number };
export const BP_COORD_ERROR_IDENTIFICATION: StructuralBlueprint<CoordErrorParams> = {
  blueprintId: "mr03-bp-coord-error-identification",
  familyId: "mr03-coordinate",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-08",
  mathematicalObjective: "Identify and correct a specific, well-documented reflection error -- negating the WRONG coordinate (the one that should stay fixed) -- distinct from a generic arithmetic slip.",
  parameterRanges: { x: { min: -10, max: 10 }, y: { min: -10, max: 10 } },
  constraints: (p) => p.x !== 0 && p.y !== 0,
  invalidCombinationDescription: "x=0 or y=0 is excluded -- the wrong-coordinate error must produce a genuinely different (not accidentally-matching) point.",
  // Increment 002 Revision, Section 6 -- this blueprint's own
  // constraints already exclude x=0/y=0, so BP_REFLECT_X_AXIS's
  // "on the other axis" edge case can never fire here; the real
  // reasoning-demand dimension specific to spotting THIS error is
  // whether |x| equals |y|. When they're equal, the (wrongly) negated-x
  // point and the correctly negated-y point share the same pair of
  // magnitudes just arranged/signed differently, making the student's
  // wrong answer look far more plausible and harder to confidently
  // rule out than when the magnitudes differ.
  difficultyControls: (p) => {
    if (Math.abs(p.x) === Math.abs(p.y)) return "hard";
    return p.y < 0 ? "medium" : "easy";
  },
  difficultyDimensions: ["equal_coordinate_magnitude", "sign_of_correct_coordinate"],
  sampleParams: (random) => ({ x: -10 + Math.floor(random() * 21), y: -10 + Math.floor(random() * 21) }),
  renderQuestionText: (p) => `Point A is at (${p.x}, ${p.y}). It is reflected in the x-axis. A student says the new coordinates are (${-p.x}, ${p.y}), negating x instead of y. This is incorrect. What are the correct coordinates?`,
  deriveCorrectAnswer: (p) => formatCoordinatePoint(applyCoordinateTransform({ x: p.x, y: p.y }, { kind: "reflect_x_axis" })),
  deriveWorkedSteps: (p) => ["Reflecting in the x-axis keeps x the same and negates y (not the other way round)", `(${p.x}, ${p.y}) → (${p.x}, ${-p.y})`],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "x/y resampled independently; x=0/y=0 excluded by constraints.",
  reasoningRoute: () => "error_identification",
  contextTag: () => "coordinate_geometry",
  unknownPosition: () => "corrected_reflected_point",
  representationType: () => "prose",
  misconceptionTargeted: "negating the coordinate that should stay fixed, instead of the one that should be negated, when reflecting in an axis",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["explicit_teaching", "scaffolded_practice"],
  independentAnswerCheck: (p, claimedAnswer) => {
    const recomputed = applyCoordinateTransform({ x: p.x, y: p.y }, { kind: "reflect_x_axis" });
    return { matches: formatCoordinatePoint(recomputed) === claimedAnswer, recomputedAnswer: formatCoordinatePoint(recomputed), method: "generic_transform_function" };
  },
};

export const MR03_COORDINATE_FAMILY: EducationalFamily = {
  familyId: "mr03-coordinate",
  subject: "maths",
  blueprints: [
    BP_REFLECT_X_AXIS,
    BP_REFLECT_Y_AXIS,
    BP_REFLECT_LINE_Y_EQUALS_X,
    BP_TRANSLATE,
    BP_REVERSE_TRANSLATION,
    BP_FIND_MIDPOINT,
    BP_COORD_ERROR_IDENTIFICATION,
  ] as EducationalFamily["blueprints"],
};
