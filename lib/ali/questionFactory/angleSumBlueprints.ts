import type { StructuralBlueprint, EducationalFamily } from "./types";

/**
 * Question Factory Scale Architecture — mr03-angle-sum Proof Family.
 *
 * Seven genuinely distinct structural blueprints, EVERY one strictly
 * within the same competency (MR-03/QT-MR-07: "the interior angles of a
 * triangle sum to 180°") -- per the Founder's own explicit instruction,
 * no blueprint here changes the competency merely to inflate the count.
 * Each blueprint below is distinguished by a genuinely different
 * reasoning route, unknown position, and/or misconception target -- not
 * by cosmetic wording or a different "story" wrapped around the same
 * computation.
 *
 * One deliberate, disclosed limitation, found while designing this
 * library rather than glossed over: a naive "reverse reasoning" variant
 * (e.g. "the third angle is 84° and one other is 43° -- find the
 * remaining angle") was considered and REJECTED as its own blueprint,
 * because the operation `180 - a - b` is symmetric across all three
 * angles -- relabelling which angle is "the unknown" does not create a
 * mathematically distinct computation for this specific fact. Forcing it
 * in anyway would have been exactly the "force structures... to increase
 * diversity" the Founder's own instruction forbids. This is recorded
 * here, not hidden, per the calibration standard's own discipline.
 */

function formatAngleList(values: number[]): string {
  return values.map((v) => `${v}°`).join(", ");
}

// ─── Blueprint 1: Direct third angle (the original Wave 1 structure), ──
// ─── now demonstrating genuine REPRESENTATION variation within one ─────
// ─── blueprint (prose vs a simple table) — Task 7's own required proof ─

type DirectThirdAngleParams = { angleA: number; angleB: number; format: number };

export const BP_THIRD_ANGLE_DIRECT: StructuralBlueprint<DirectThirdAngleParams> = {
  blueprintId: "mr03-bp-third-angle-direct",
  familyId: "mr03-angle-sum",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-07",
  mathematicalObjective: "Apply the fact that a triangle's interior angles sum to 180° to find a missing angle given the other two.",
  parameterRanges: { angleA: { min: 10, max: 160 }, angleB: { min: 10, max: 160 }, format: { min: 0, max: 1 } },
  constraints: (p) => p.angleA + p.angleB < 175 && 180 - p.angleA - p.angleB >= 5,
  invalidCombinationDescription: "Angle pairs summing to 175°+ are excluded -- the resulting unknown angle (5° or less) is not pedagogically useful at this stage.",
  difficultyControls: (p) => {
    const sum = p.angleA + p.angleB;
    return sum <= 90 ? "easy" : sum <= 140 ? "medium" : "hard";
  },
  difficultyDimensions: ["sum_magnitude"],
  sampleParams: (random) => ({
    angleA: 10 + Math.floor(random() * 151),
    angleB: 10 + Math.floor(random() * 151),
    format: Math.floor(random() * 2),
  }),
  renderQuestionText: (p) =>
    p.format === 0
      ? `A triangle has angles of ${p.angleA}°, ${p.angleB}° and one unknown angle. What is the size of the unknown angle?`
      : `The table below shows two known angles of a triangle.\nAngle 1: ${p.angleA}°\nAngle 2: ${p.angleB}°\nAngle 3: unknown\nWhat is the size of the unknown angle?`,
  deriveCorrectAnswer: (p) => String(180 - p.angleA - p.angleB),
  deriveWorkedSteps: (p) => [
    "The angles in a triangle always add up to 180°",
    `${p.angleA} + ${p.angleB} = ${p.angleA + p.angleB}`,
    `180 - ${p.angleA + p.angleB} = ${180 - p.angleA - p.angleB}`,
  ],
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "angleA/angleB resampled independently; format (0/1) chosen independently -- exact-duplicate rejection compares rendered text, so the same angle pair in a different format is NOT silently treated as identical to an existing row.",
  reasoningRoute: () => "direct_computation",
  contextTag: () => "triangle_geometry",
  unknownPosition: () => "third_angle",
  representationType: (p) => (p.format === 0 ? "prose" : "table"),
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice", "timed_practice"],
};

// ─── Blueprint 2: Ratio split -- one given angle, other two in ratio ────

type RatioSplitParams = { knownAngle: number; ratioA: number; ratioB: number };

export const BP_RATIO_SPLIT: StructuralBlueprint<RatioSplitParams> = {
  blueprintId: "mr03-bp-ratio-split",
  familyId: "mr03-angle-sum",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-07",
  mathematicalObjective: "Combine the triangle angle-sum fact with dividing a remaining quantity in a given ratio -- a genuinely different computational structure from direct subtraction.",
  parameterRanges: { knownAngle: { min: 10, max: 120 }, ratioA: { min: 1, max: 5 }, ratioB: { min: 1, max: 5 } },
  constraints: (p) => {
    const remaining = 180 - p.knownAngle;
    const parts = p.ratioA + p.ratioB;
    if (remaining <= 0 || parts <= 0 || remaining % parts !== 0) return false;
    const part1 = (remaining / parts) * p.ratioA;
    const part2 = remaining - part1;
    return part1 >= 5 && part2 >= 5 && p.ratioA !== p.ratioB; // ratioA===ratioB would make this identical in structure to the isosceles blueprint (BP7)
  },
  invalidCombinationDescription: "Excludes combinations where the remaining angle sum does not divide evenly by the ratio's total parts (no clean integer answer), where either resulting angle would be under 5°, or where the ratio is 1:1 (that specific case is the isosceles blueprint's own territory, not this one's).",
  difficultyControls: (p) => (p.ratioA + p.ratioB <= 4 ? "easy" : p.ratioA + p.ratioB <= 7 ? "medium" : "hard"),
  difficultyDimensions: ["ratio_total_parts", "multi_step_count"],
  sampleParams: (random) => ({
    knownAngle: 10 + Math.floor(random() * 111),
    ratioA: 1 + Math.floor(random() * 5),
    ratioB: 1 + Math.floor(random() * 5),
  }),
  renderQuestionText: (p) => `In a triangle, one angle is ${p.knownAngle}°. The other two angles are in the ratio ${p.ratioA}:${p.ratioB}. What are the sizes of the two unknown angles?`,
  deriveCorrectAnswer: (p) => {
    const remaining = 180 - p.knownAngle;
    const parts = p.ratioA + p.ratioB;
    const part1 = (remaining / parts) * p.ratioA;
    const part2 = remaining - part1;
    return `${part1}° and ${part2}°`;
  },
  deriveWorkedSteps: (p) => {
    const remaining = 180 - p.knownAngle;
    const parts = p.ratioA + p.ratioB;
    const part1 = (remaining / parts) * p.ratioA;
    const part2 = remaining - part1;
    return [
      "The angles in a triangle always add up to 180°",
      `180 - ${p.knownAngle} = ${remaining} (the sum of the other two angles)`,
      `Split ${remaining} in the ratio ${p.ratioA}:${p.ratioB} -- total parts = ${parts}, one part = ${remaining / parts}°`,
      `First angle = ${p.ratioA} × ${remaining / parts} = ${part1}°; second angle = ${p.ratioB} × ${remaining / parts} = ${part2}°`,
    ];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "knownAngle/ratioA/ratioB resampled independently; the ratioA===ratioB case is excluded by constraints (that is BP_ISOSCELES_RELATIONSHIP's own territory), preventing the same underlying question from existing in two blueprints.",
  reasoningRoute: () => "multi_step_application",
  contextTag: () => "triangle_geometry",
  unknownPosition: () => "two_unknown_angles_via_ratio",
  representationType: () => "prose",
  misconceptionTargeted: "treating the ratio parts as the final angles directly, without multiplying by the value of one part",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["scaffolded_practice", "independent_practice", "transfer"],
};

// ─── Blueprint 3: Verify whether three given angles form a valid triangle ─

type VerifyTriangleParams = { angleA: number; angleB: number; angleC: number };

export const BP_VERIFY_TRIANGLE: StructuralBlueprint<VerifyTriangleParams> = {
  blueprintId: "mr03-bp-verify-triangle",
  familyId: "mr03-angle-sum",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-07",
  mathematicalObjective: "Check three GIVEN angles against the 180° total, rather than solving for a missing one -- a verification/checking reasoning demand distinct from direct subtraction.",
  parameterRanges: { angleA: { min: 10, max: 160 }, angleB: { min: 10, max: 160 }, angleC: { min: 10, max: 160 } },
  constraints: (p) => {
    const discrepancy = Math.abs(180 - (p.angleA + p.angleB + p.angleC));
    return discrepancy <= 40; // a plausible near-miss (genuinely tests checking skill) or exactly valid -- never an absurdly, obviously-wrong triple
  },
  invalidCombinationDescription: "Triples whose sum is more than 40° away from 180° are excluded -- an obviously, wildly invalid triangle tests nothing beyond 'is this a huge number', not genuine checking skill.",
  difficultyControls: (p) => {
    const discrepancy = Math.abs(180 - (p.angleA + p.angleB + p.angleC));
    return discrepancy === 0 ? "medium" : discrepancy <= 15 ? "hard" : "easy"; // an exact-180 case still requires summing three numbers (medium); a near-miss requires the same sum PLUS confident comparison against a close threshold (hardest); a wildly-off (but still <=40) case is comparatively easy to spot
  },
  difficultyDimensions: ["number_of_values_summed", "discrepancy_closeness_to_180"],
  sampleParams: (random) => ({
    angleA: 10 + Math.floor(random() * 151),
    angleB: 10 + Math.floor(random() * 151),
    angleC: 10 + Math.floor(random() * 151),
  }),
  renderQuestionText: (p) => `A triangle is said to have angles of ${formatAngleList([p.angleA, p.angleB, p.angleC])}. By how many degrees, if any, do these three angles fail to add up to 180°? (Answer 0 if they could genuinely be the angles of a real triangle.)`,
  deriveCorrectAnswer: (p) => String(Math.abs(180 - (p.angleA + p.angleB + p.angleC))),
  deriveWorkedSteps: (p) => [
    `${p.angleA} + ${p.angleB} + ${p.angleC} = ${p.angleA + p.angleB + p.angleC}`,
    "A real triangle's three angles must add up to exactly 180°",
    `${p.angleA + p.angleB + p.angleC} is ${Math.abs(180 - (p.angleA + p.angleB + p.angleC))}° away from 180°`,
  ],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "All three angles resampled independently; the near-miss constraint keeps every candidate a genuine checking task rather than a trivially-obvious pass/fail.",
  reasoningRoute: () => "comparison",
  contextTag: () => "triangle_geometry",
  unknownPosition: () => "validity_discrepancy",
  representationType: () => "prose",
  misconceptionTargeted: "assuming any three stated angles automatically form a valid triangle without checking the total",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["independent_practice", "transfer", "mastery_check"],
};

// ─── Blueprint 4: Identify an arbitrary arithmetic error in a worked solution ─

type ErrorCorrectionParams = { angleA: number; angleB: number; wrongOffset: number };

export const BP_ERROR_CORRECTION: StructuralBlueprint<ErrorCorrectionParams> = {
  blueprintId: "mr03-bp-error-correction",
  familyId: "mr03-angle-sum",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-07",
  mathematicalObjective: "Identify and correct an arbitrary arithmetic error in someone else's worked solution to a direct third-angle problem -- an error-identification reasoning demand distinct from solving from scratch.",
  parameterRanges: { angleA: { min: 10, max: 160 }, angleB: { min: 10, max: 160 }, wrongOffset: { min: -10, max: 10 } },
  constraints: (p) => p.angleA + p.angleB < 175 && 180 - p.angleA - p.angleB >= 10 && p.wrongOffset !== 0 && 180 - p.angleA - p.angleB + p.wrongOffset > 0,
  invalidCombinationDescription: "wrongOffset of exactly 0 is excluded (there would be no error to identify); the resulting 'wrong' angle must still be a positive number to be a plausible, gradeable student answer.",
  difficultyControls: (p) => {
    const sum = p.angleA + p.angleB;
    return sum <= 90 ? "easy" : sum <= 140 ? "medium" : "hard";
  },
  difficultyDimensions: ["sum_magnitude", "error_magnitude"],
  sampleParams: (random) => ({
    angleA: 10 + Math.floor(random() * 151),
    angleB: 10 + Math.floor(random() * 151),
    wrongOffset: (() => {
      const magnitude = 3 + Math.floor(random() * 8); // 3..10
      return random() < 0.5 ? magnitude : -magnitude;
    })(),
  }),
  renderQuestionText: (p) => {
    const wrongAnswer = 180 - p.angleA - p.angleB + p.wrongOffset;
    return `A triangle has angles of ${p.angleA}°, ${p.angleB}° and one unknown angle. A student says the unknown angle is ${wrongAnswer}°. This is incorrect. What is the correct size of the unknown angle?`;
  },
  deriveCorrectAnswer: (p) => String(180 - p.angleA - p.angleB),
  deriveWorkedSteps: (p) => [
    "The angles in a triangle always add up to 180°",
    `${p.angleA} + ${p.angleB} = ${p.angleA + p.angleB}`,
    `The correct unknown angle is 180 - ${p.angleA + p.angleB} = ${180 - p.angleA - p.angleB}°`,
  ],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "angleA/angleB/wrongOffset resampled independently; wrongOffset !== 0 is enforced by constraints, and its magnitude/sign are drawn independently of the correct answer so the 'wrong' figure is never trivially close to correct by chance alone.",
  reasoningRoute: () => "error_identification",
  contextTag: () => "triangle_geometry",
  unknownPosition: () => "corrected_third_angle",
  representationType: () => "prose",
  misconceptionTargeted: "a generic arithmetic slip in the final subtraction step (not a specific named conceptual misconception -- see BP_MISCONCEPTION_360_CONFUSION for that distinct case)",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["scaffolded_practice", "mastery_check"],
};

// ─── Blueprint 5: Diagnose the specific, named "360° confusion" misconception ─

type Misconception360Params = { angleA: number; angleB: number };

export const BP_MISCONCEPTION_360_CONFUSION: StructuralBlueprint<Misconception360Params> = {
  blueprintId: "mr03-bp-misconception-360-confusion",
  familyId: "mr03-angle-sum",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-07",
  mathematicalObjective: "Diagnose a specific, well-documented KS2/11+ misconception -- confusing a triangle's angle sum (180°) with a quadrilateral's (360°) -- distinct from a generic arithmetic slip.",
  parameterRanges: { angleA: { min: 10, max: 160 }, angleB: { min: 10, max: 160 } },
  constraints: (p) => p.angleA + p.angleB < 175 && 180 - p.angleA - p.angleB >= 5,
  invalidCombinationDescription: "Same bound as the direct blueprint -- the resulting correct angle must still be a genuine, non-degenerate positive angle.",
  difficultyControls: (p) => {
    const sum = p.angleA + p.angleB;
    return sum <= 90 ? "easy" : sum <= 140 ? "medium" : "hard";
  },
  difficultyDimensions: ["sum_magnitude"],
  sampleParams: (random) => ({
    angleA: 10 + Math.floor(random() * 151),
    angleB: 10 + Math.floor(random() * 151),
  }),
  renderQuestionText: (p) => {
    const wrongAnswer = 360 - p.angleA - p.angleB;
    return `A triangle has angles of ${p.angleA}°, ${p.angleB}° and one unknown angle. A student calculates the unknown angle as ${wrongAnswer}°, because they used 360° as the total of the angles. What is the correct size of the unknown angle?`;
  },
  deriveCorrectAnswer: (p) => String(180 - p.angleA - p.angleB),
  deriveWorkedSteps: (p) => [
    "A TRIANGLE's angles add up to 180°, not 360° (360° is the angle total for a quadrilateral, a four-sided shape)",
    `${p.angleA} + ${p.angleB} = ${p.angleA + p.angleB}`,
    `The correct unknown angle is 180 - ${p.angleA + p.angleB} = ${180 - p.angleA - p.angleB}°`,
  ],
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "angleA/angleB resampled independently; the 360°-confusion framing is a fixed, disclosed structural feature of this blueprint, not a per-candidate variable -- every candidate in this blueprint targets the same named misconception, by design.",
  reasoningRoute: () => "error_identification",
  contextTag: () => "triangle_geometry",
  unknownPosition: () => "corrected_third_angle",
  representationType: () => "prose",
  misconceptionTargeted: "confusing the triangle angle-sum (180°) with the quadrilateral angle-sum (360°)",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["explicit_teaching", "scaffolded_practice"],
};

// ─── Blueprint 6: Compare the third angle of two different triangles ────

type CompareTrianglesParams = { a1: number; b1: number; a2: number; b2: number };

export const BP_COMPARE_TRIANGLES: StructuralBlueprint<CompareTrianglesParams> = {
  blueprintId: "mr03-bp-compare-triangles",
  familyId: "mr03-angle-sum",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-07",
  mathematicalObjective: "Compute the missing angle for TWO separate triangles and compare them -- a genuinely different demand from finding one triangle's missing angle, since it also probes whether a learner assumes larger given angles mean a larger (rather than smaller) third angle.",
  parameterRanges: { a1: { min: 10, max: 160 }, b1: { min: 10, max: 160 }, a2: { min: 10, max: 160 }, b2: { min: 10, max: 160 } },
  constraints: (p) => p.a1 + p.b1 < 175 && 180 - p.a1 - p.b1 >= 5 && p.a2 + p.b2 < 175 && 180 - p.a2 - p.b2 >= 5,
  invalidCombinationDescription: "Both triangles must independently satisfy the same non-degenerate bound as the direct blueprint.",
  difficultyControls: (p) => {
    const third1 = 180 - p.a1 - p.b1;
    const third2 = 180 - p.a2 - p.b2;
    const gap = Math.abs(third1 - third2);
    return gap >= 20 ? "easy" : gap >= 5 ? "medium" : "hard"; // the closer the two results, the harder the comparison
  },
  difficultyDimensions: ["number_of_computations_required", "result_closeness"],
  sampleParams: (random) => ({
    a1: 10 + Math.floor(random() * 151),
    b1: 10 + Math.floor(random() * 151),
    a2: 10 + Math.floor(random() * 151),
    b2: 10 + Math.floor(random() * 151),
  }),
  renderQuestionText: (p) => `Triangle A has angles of ${p.a1}° and ${p.b1}°. Triangle B has angles of ${p.a2}° and ${p.b2}°. Which triangle has the larger unknown (third) angle -- Triangle A, Triangle B, or are they equal?`,
  deriveCorrectAnswer: (p) => {
    const third1 = 180 - p.a1 - p.b1;
    const third2 = 180 - p.a2 - p.b2;
    if (third1 === third2) return "Equal";
    return third1 > third2 ? "Triangle A" : "Triangle B";
  },
  deriveWorkedSteps: (p) => {
    const third1 = 180 - p.a1 - p.b1;
    const third2 = 180 - p.a2 - p.b2;
    return [
      `Triangle A's unknown angle: 180 - ${p.a1} - ${p.b1} = ${third1}°`,
      `Triangle B's unknown angle: 180 - ${p.a2} - ${p.b2} = ${third2}°`,
      third1 === third2 ? "Both unknown angles are equal" : `${third1 > third2 ? "Triangle A" : "Triangle B"}'s unknown angle is larger`,
    ];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "All four angles resampled independently across the two triangles; a batch's own exact-duplicate check compares the full rendered question text, so two candidates would need an identical four-angle combination to collide.",
  reasoningRoute: () => "comparison",
  contextTag: () => "triangle_geometry",
  unknownPosition: () => "comparative_third_angle",
  representationType: () => "prose",
  misconceptionTargeted: "assuming a triangle with larger given angles automatically has a larger third angle (the reverse is generally true)",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["transfer", "independent_practice"],
};

// ─── Blueprint 7: Isosceles relationship (two equal angles) ─────────────

type IsoscelesRelationshipParams = { equalAngle: number };

export const BP_ISOSCELES_RELATIONSHIP: StructuralBlueprint<IsoscelesRelationshipParams> = {
  blueprintId: "mr03-bp-isosceles-relationship",
  familyId: "mr03-angle-sum",
  competencyId: "MR-03",
  questionTypeId: "QT-MR-07",
  mathematicalObjective: "Apply the triangle angle-sum fact where two angles are stated to be EQUAL to each other (an isosceles triangle) -- requires doubling before subtracting, a genuinely different computational structure from subtracting two independently-given angles.",
  parameterRanges: { equalAngle: { min: 10, max: 85 } },
  constraints: (p) => 180 - 2 * p.equalAngle >= 5 && 180 - 2 * p.equalAngle < 160,
  invalidCombinationDescription: "equalAngle must leave a genuine, non-degenerate positive third angle (>= 5°) that is also not itself implausibly close to the two equal angles' own range.",
  difficultyControls: (p) => (p.equalAngle <= 30 ? "easy" : p.equalAngle <= 60 ? "medium" : "hard"),
  difficultyDimensions: ["equal_angle_magnitude", "requires_doubling_step"],
  sampleParams: (random) => ({ equalAngle: 10 + Math.floor(random() * 76) }),
  renderQuestionText: (p) => `An isosceles triangle has two equal angles of ${p.equalAngle}° each. What is the size of the third angle?`,
  deriveCorrectAnswer: (p) => String(180 - 2 * p.equalAngle),
  deriveWorkedSteps: (p) => [
    `Two angles are equal: ${p.equalAngle}° + ${p.equalAngle}° = ${2 * p.equalAngle}°`,
    "The angles in a triangle always add up to 180°",
    `180 - ${2 * p.equalAngle} = ${180 - 2 * p.equalAngle}`,
  ],
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "equalAngle is the only parameter, resampled independently per candidate -- a genuinely single-parameter blueprint, disclosed as such rather than padded with an unused second parameter.",
  reasoningRoute: () => "multi_step_application",
  contextTag: () => "isosceles_triangle_geometry",
  unknownPosition: () => "third_angle_isosceles",
  representationType: () => "prose",
  misconceptionTargeted: "forgetting to double the equal angle before subtracting from 180° (subtracting only one instance)",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "independent_practice", "maintenance_retrieval"],
};

export const MR03_ANGLE_SUM_FAMILY: EducationalFamily = {
  familyId: "mr03-angle-sum",
  subject: "maths",
  blueprints: [
    BP_THIRD_ANGLE_DIRECT,
    BP_RATIO_SPLIT,
    BP_VERIFY_TRIANGLE,
    BP_ERROR_CORRECTION,
    BP_MISCONCEPTION_360_CONFUSION,
    BP_COMPARE_TRIANGLES,
    BP_ISOSCELES_RELATIONSHIP,
  ] as EducationalFamily["blueprints"],
};
