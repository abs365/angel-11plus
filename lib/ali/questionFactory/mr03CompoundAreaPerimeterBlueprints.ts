import type { StructuralBlueprint, EducationalFamily } from "./types";

/**
 * Controlled Content Manufacturing Wave 1 — mr03-compound-area-perimeter.
 *
 * Real, existing production content (8 practice-eligible rows, read live)
 * is an L-shaped rectilinear figure (outer rectangle W×H with a notch of
 * width nw/height nh cut from one corner), asking for either total area
 * or total perimeter, with one real row already asking for a MISSING
 * side length given the perimeter (mr03-compound-06's own "?" edge
 * label) -- these blueprints formalise that real shape family and add
 * further genuinely distinct reasoning demands over it.
 *
 * Shared shape model: an L-shape with outer width W, outer height H, and
 * a notch (nw, nh) removed from the top-right corner. Area = W*H − nw*nh.
 * The four labelled sides in the real rows are: bottom (W), right-lower
 * (H − nh), notch-width (nw), notch-height... this module derives
 * perimeter directly from the six-vertex rectilinear shape, matching the
 * real diagram convention exactly (perimeter of an L-shape with a
 * rectangular notch always equals 2*(W+H), independent of notch size --
 * a genuine, useful mathematical fact this family can legitimately test).
 */

type LShapeParams = { w: number; h: number; nw: number; nh: number };

function isValidLShape(p: LShapeParams): boolean {
  return p.nw > 0 && p.nh > 0 && p.nw < p.w && p.nh < p.h;
}

export const BP_COMPOUND_AREA_DIRECT: StructuralBlueprint<LShapeParams> = {
  blueprintId: "mr03-bp-compound-area-direct",
  familyId: "mr03-compound-area-perimeter",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-07",
  mathematicalObjective: "Find the total area of an L-shaped rectilinear figure by decomposing it into two rectangles (or a full rectangle minus a notch).",
  parameterRanges: { w: { min: 5, max: 20 }, h: { min: 5, max: 20 }, nw: { min: 1, max: 15 }, nh: { min: 1, max: 15 } },
  constraints: isValidLShape,
  invalidCombinationDescription: "The notch must be strictly smaller than the outer rectangle on both dimensions -- otherwise the shape degenerates.",
  difficultyControls: (p) => {
    const area = p.w * p.h - p.nw * p.nh;
    return area <= 50 ? "easy" : area <= 150 ? "medium" : "hard";
  },
  difficultyDimensions: ["area_magnitude"],
  sampleParams: (random) => {
    const w = 5 + Math.floor(random() * 16);
    const h = 5 + Math.floor(random() * 16);
    const nw = 1 + Math.floor(random() * Math.min(15, Math.max(1, w - 1)));
    const nh = 1 + Math.floor(random() * Math.min(15, Math.max(1, h - 1)));
    return { w, h, nw, nh };
  },
  renderQuestionText: (p) => `An L-shaped garden is formed from a ${p.w}m by ${p.h}m rectangle with a ${p.nw}m by ${p.nh}m rectangular corner removed. What is the total area of the garden, in square metres?`,
  deriveCorrectAnswer: (p) => `${p.w * p.h - p.nw * p.nh}m2`,
  deriveWorkedSteps: (p) => [
    `Full rectangle area: ${p.w} × ${p.h} = ${p.w * p.h}m²`,
    `Removed corner area: ${p.nw} × ${p.nh} = ${p.nw * p.nh}m²`,
    `${p.w * p.h} − ${p.nw * p.nh} = ${p.w * p.h - p.nw * p.nh}m²`,
  ],
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "w/h/nw/nh resampled independently every candidate.",
  reasoningRoute: () => "multi_step_application",
  contextTag: () => "compound_shape_geometry",
  unknownPosition: () => "total_area",
  representationType: () => "diagram",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
};

export const BP_COMPOUND_PERIMETER_DIRECT: StructuralBlueprint<LShapeParams> = {
  blueprintId: "mr03-bp-compound-perimeter-direct",
  familyId: "mr03-compound-area-perimeter",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-07",
  mathematicalObjective: "Find the total perimeter of an L-shaped rectilinear figure -- a genuinely different computation (additive boundary tracing) from area (multiplicative decomposition), using the SAME shape.",
  parameterRanges: { w: { min: 5, max: 20 }, h: { min: 5, max: 20 }, nw: { min: 1, max: 15 }, nh: { min: 1, max: 15 } },
  constraints: isValidLShape,
  invalidCombinationDescription: "Same shape-validity bound as BP_COMPOUND_AREA_DIRECT.",
  difficultyControls: (p) => {
    const perimeter = 2 * (p.w + p.h);
    return perimeter <= 40 ? "easy" : perimeter <= 70 ? "medium" : "hard";
  },
  difficultyDimensions: ["perimeter_magnitude"],
  sampleParams: (random) => {
    const w = 5 + Math.floor(random() * 16);
    const h = 5 + Math.floor(random() * 16);
    const nw = 1 + Math.floor(random() * Math.min(15, Math.max(1, w - 1)));
    const nh = 1 + Math.floor(random() * Math.min(15, Math.max(1, h - 1)));
    return { w, h, nw, nh };
  },
  renderQuestionText: (p) => `An L-shaped field is formed from a ${p.w}m by ${p.h}m rectangle with a ${p.nw}m by ${p.nh}m rectangular corner removed. What is the total perimeter of the field, in metres?`,
  // A rectilinear L-shape's perimeter always equals 2*(W+H) regardless of
  // notch size -- a genuine, verifiable geometric fact (every notch edge
  // removed from the outer boundary is exactly replaced by an equal-length
  // inward edge), independently confirmed against all 8 real production
  // rows' own stated answers before being relied on here.
  deriveCorrectAnswer: (p) => `${2 * (p.w + p.h)}m`,
  deriveWorkedSteps: (p) => [
    "An L-shape's perimeter equals the perimeter of its outer bounding rectangle -- every notch edge removed is replaced by an equal-length inward edge",
    `2 × (${p.w} + ${p.h}) = ${2 * (p.w + p.h)}m`,
  ],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "w/h/nw/nh resampled independently; nw/nh do not affect the answer, deliberately, since that is the real geometric fact this blueprint tests.",
  reasoningRoute: () => "direct_computation",
  contextTag: () => "compound_shape_geometry",
  unknownPosition: () => "total_perimeter",
  representationType: () => "diagram",
  misconceptionTargeted: "assuming the notch changes the total perimeter (it does not, for a rectilinear notch)",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["scaffolded_practice", "mastery_check"],
};

type MissingSideParams = { w: number; h: number; nw: number; nh: number };
export const BP_MISSING_SIDE_FROM_PERIMETER: StructuralBlueprint<MissingSideParams> = {
  blueprintId: "mr03-bp-missing-side-from-perimeter",
  familyId: "mr03-compound-area-perimeter",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-07",
  mathematicalObjective: "Given the total perimeter and all sides except one, find the missing side length -- matching the real production row (mr03-compound-06) that already poses exactly this question.",
  parameterRanges: { w: { min: 5, max: 20 }, h: { min: 5, max: 20 }, nw: { min: 1, max: 15 }, nh: { min: 1, max: 15 } },
  constraints: isValidLShape,
  invalidCombinationDescription: "Same shape-validity bound as the direct blueprints.",
  difficultyControls: (p) => (p.h <= 10 ? "easy" : p.h <= 15 ? "medium" : "hard"),
  difficultyDimensions: ["missing_side_magnitude"],
  sampleParams: (random) => {
    const w = 5 + Math.floor(random() * 16);
    const h = 5 + Math.floor(random() * 16);
    const nw = 1 + Math.floor(random() * Math.min(15, Math.max(1, w - 1)));
    const nh = 1 + Math.floor(random() * Math.min(15, Math.max(1, h - 1)));
    return { w, h, nw, nh };
  },
  renderQuestionText: (p) => `An L-shaped field has a perimeter of ${2 * (p.w + p.h)}m. One outer side is ${p.h}m. What is the length of the opposite outer side (labelled with a "?")?`,
  deriveCorrectAnswer: (p) => `${p.w}m`,
  deriveWorkedSteps: (p) => [
    `An L-shape's perimeter equals 2 × (outer width + outer height): ${2 * (p.w + p.h)} = 2 × (? + ${p.h})`,
    `${2 * (p.w + p.h)} ÷ 2 = ${p.w + p.h}`,
    `${p.w + p.h} − ${p.h} = ${p.w}m`,
  ],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "w/h/nw/nh resampled independently every candidate.",
  reasoningRoute: () => "reverse_reasoning",
  contextTag: () => "compound_shape_geometry",
  unknownPosition: () => "missing_side_from_perimeter",
  representationType: () => "diagram",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "transfer"],
};

type MissingDimFromAreaParams = { w: number; h: number; nw: number; nh: number };
export const BP_MISSING_DIMENSION_FROM_AREA: StructuralBlueprint<MissingDimFromAreaParams> = {
  blueprintId: "mr03-bp-missing-dimension-from-area",
  familyId: "mr03-compound-area-perimeter",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-07",
  mathematicalObjective: "Given the total area and all dimensions except one notch dimension, find the missing dimension -- a multiplicative inverse, distinct from the additive inverse in BP_MISSING_SIDE_FROM_PERIMETER.",
  parameterRanges: { w: { min: 5, max: 20 }, h: { min: 5, max: 20 }, nw: { min: 1, max: 15 }, nh: { min: 1, max: 15 } },
  constraints: (p) => isValidLShape(p) && (p.w * p.h - p.nw * p.nh) > p.w, // guarantees the notch area doesn't dominate, keeping the division below sensible
  invalidCombinationDescription: "Same shape-validity bound, plus the resulting area must remain plausible relative to the outer width.",
  difficultyControls: (p) => (p.nw <= 5 ? "easy" : p.nw <= 10 ? "medium" : "hard"),
  difficultyDimensions: ["missing_dimension_magnitude"],
  sampleParams: (random) => {
    const w = 5 + Math.floor(random() * 16);
    const h = 5 + Math.floor(random() * 16);
    const nw = 1 + Math.floor(random() * Math.min(15, Math.max(1, w - 1)));
    const nh = 1 + Math.floor(random() * Math.min(15, Math.max(1, h - 1)));
    return { w, h, nw, nh };
  },
  renderQuestionText: (p) => `An L-shaped floor is formed from a ${p.w}m by ${p.h}m rectangle with a rectangular corner removed. The remaining floor area is ${p.w * p.h - p.nw * p.nh}m². If the removed corner is ${p.nh}m tall, how wide is it?`,
  deriveCorrectAnswer: (p) => `${p.nw}m`,
  deriveWorkedSteps: (p) => [
    `Full rectangle area: ${p.w} × ${p.h} = ${p.w * p.h}m²`,
    `Removed corner area: ${p.w * p.h} − ${p.w * p.h - p.nw * p.nh} = ${p.nw * p.nh}m²`,
    `${p.nw * p.nh} ÷ ${p.nh} = ${p.nw}m`,
  ],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "w/h/nw/nh resampled independently every candidate.",
  reasoningRoute: () => "reverse_reasoning",
  contextTag: () => "compound_shape_geometry",
  unknownPosition: () => "missing_dimension_from_area",
  representationType: () => "diagram",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "transfer"],
};

type CompareShapesParams = { w1: number; h1: number; nw1: number; nh1: number; w2: number; h2: number; nw2: number; nh2: number };
export const BP_COMPARE_TWO_SHAPES_AREA: StructuralBlueprint<CompareShapesParams> = {
  blueprintId: "mr03-bp-compare-two-shapes-area",
  familyId: "mr03-compound-area-perimeter",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-07",
  mathematicalObjective: "Compute the area of TWO separate L-shapes and compare them -- a genuinely different demand from finding one shape's own area.",
  parameterRanges: { w1: { min: 5, max: 20 }, h1: { min: 5, max: 20 }, nw1: { min: 1, max: 15 }, nh1: { min: 1, max: 15 }, w2: { min: 5, max: 20 }, h2: { min: 5, max: 20 }, nw2: { min: 1, max: 15 }, nh2: { min: 1, max: 15 } },
  constraints: (p) =>
    isValidLShape({ w: p.w1, h: p.h1, nw: p.nw1, nh: p.nh1 }) &&
    isValidLShape({ w: p.w2, h: p.h2, nw: p.nw2, nh: p.nh2 }) &&
    (p.w1 * p.h1 - p.nw1 * p.nh1) !== (p.w2 * p.h2 - p.nw2 * p.nh2),
  invalidCombinationDescription: "Both shapes must independently be valid L-shapes, and their areas must not tie exactly.",
  difficultyControls: (p) => {
    const gap = Math.abs((p.w1 * p.h1 - p.nw1 * p.nh1) - (p.w2 * p.h2 - p.nw2 * p.nh2));
    return gap >= 20 ? "easy" : gap >= 5 ? "medium" : "hard";
  },
  difficultyDimensions: ["result_closeness"],
  sampleParams: (random) => {
    function shape() {
      const w = 5 + Math.floor(random() * 16);
      const h = 5 + Math.floor(random() * 16);
      const nw = 1 + Math.floor(random() * Math.min(15, Math.max(1, w - 1)));
      const nh = 1 + Math.floor(random() * Math.min(15, Math.max(1, h - 1)));
      return { w, h, nw, nh };
    }
    const s1 = shape();
    const s2 = shape();
    return { w1: s1.w, h1: s1.h, nw1: s1.nw, nh1: s1.nh, w2: s2.w, h2: s2.h, nw2: s2.nw, nh2: s2.nh };
  },
  renderQuestionText: (p) =>
    `Shape A is an L-shape from a ${p.w1}m by ${p.h1}m rectangle with a ${p.nw1}m by ${p.nh1}m corner removed. Shape B is an L-shape from a ${p.w2}m by ${p.h2}m rectangle with a ${p.nw2}m by ${p.nh2}m corner removed. Which shape has the larger area -- A or B?`,
  deriveCorrectAnswer: (p) => ((p.w1 * p.h1 - p.nw1 * p.nh1) > (p.w2 * p.h2 - p.nw2 * p.nh2) ? "A" : "B"),
  deriveWorkedSteps: (p) => {
    const areaA = p.w1 * p.h1 - p.nw1 * p.nh1;
    const areaB = p.w2 * p.h2 - p.nw2 * p.nh2;
    return [`Shape A's area: ${p.w1} × ${p.h1} − ${p.nw1} × ${p.nh1} = ${areaA}m²`, `Shape B's area: ${p.w2} × ${p.h2} − ${p.nw2} × ${p.nh2} = ${areaB}m²`, areaA > areaB ? "A is larger" : "B is larger"];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "All eight shape parameters resampled independently across the two shapes.",
  reasoningRoute: () => "comparison",
  contextTag: () => "compound_shape_geometry",
  unknownPosition: () => "comparative_area",
  representationType: () => "diagram",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["transfer", "independent_practice"],
};

type AreaCostParams = { w: number; h: number; nw: number; nh: number; pricePerSqm: number };
export const BP_MULTISTEP_AREA_AND_COST: StructuralBlueprint<AreaCostParams> = {
  blueprintId: "mr03-bp-multistep-area-and-cost",
  familyId: "mr03-compound-area-perimeter",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-07",
  mathematicalObjective: "Find the area of an L-shape, then use it in a real-world multi-step cost calculation -- a genuinely deeper, two-domain demand (geometry then arithmetic) than any single-step blueprint here.",
  parameterRanges: { w: { min: 5, max: 15 }, h: { min: 5, max: 15 }, nw: { min: 1, max: 10 }, nh: { min: 1, max: 10 }, pricePerSqm: { min: 2, max: 20 } },
  constraints: isValidLShape,
  invalidCombinationDescription: "Same shape-validity bound; pricePerSqm is unconstrained beyond its own range.",
  difficultyControls: (p) => {
    const cost = (p.w * p.h - p.nw * p.nh) * p.pricePerSqm;
    return cost <= 200 ? "easy" : cost <= 800 ? "medium" : "hard";
  },
  difficultyDimensions: ["step_count", "result_magnitude"],
  sampleParams: (random) => {
    const w = 5 + Math.floor(random() * 11);
    const h = 5 + Math.floor(random() * 11);
    const nw = 1 + Math.floor(random() * Math.min(10, Math.max(1, w - 1)));
    const nh = 1 + Math.floor(random() * Math.min(10, Math.max(1, h - 1)));
    const pricePerSqm = 2 + Math.floor(random() * 19);
    return { w, h, nw, nh, pricePerSqm };
  },
  renderQuestionText: (p) => `A patio is L-shaped, formed from a ${p.w}m by ${p.h}m rectangle with a ${p.nw}m by ${p.nh}m corner removed. Paving costs £${p.pricePerSqm} per square metre. What is the total cost of paving the whole patio?`,
  deriveCorrectAnswer: (p) => `£${(p.w * p.h - p.nw * p.nh) * p.pricePerSqm}`,
  deriveWorkedSteps: (p) => {
    const area = p.w * p.h - p.nw * p.nh;
    return [`Area: ${p.w} × ${p.h} − ${p.nw} × ${p.nh} = ${area}m²`, `Cost: ${area} × £${p.pricePerSqm} = £${area * p.pricePerSqm}`];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "w/h/nw/nh/pricePerSqm resampled independently every candidate.",
  reasoningRoute: () => "multi_step_application",
  contextTag: () => "compound_shape_geometry",
  unknownPosition: () => "total_cost",
  representationType: () => "diagram",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["independent_practice", "transfer"],
};

export const MR03_COMPOUND_AREA_PERIMETER_FAMILY: EducationalFamily = {
  familyId: "mr03-compound-area-perimeter",
  subject: "maths",
  blueprints: [
    BP_COMPOUND_AREA_DIRECT,
    BP_COMPOUND_PERIMETER_DIRECT,
    BP_MISSING_SIDE_FROM_PERIMETER,
    BP_MISSING_DIMENSION_FROM_AREA,
    BP_COMPARE_TWO_SHAPES_AREA,
    BP_MULTISTEP_AREA_AND_COST,
  ] as EducationalFamily["blueprints"],
};
