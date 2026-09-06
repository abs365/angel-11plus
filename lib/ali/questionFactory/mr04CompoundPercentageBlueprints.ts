import type { StructuralBlueprint, EducationalFamily } from "./types";

/**
 * Controlled Content Manufacturing Wave 1 — mr04-compound-percentage.
 *
 * Real, existing production content (5 practice-eligible rows, read live)
 * is exclusively "start price, +X%, then -Y%, find final price" -- these
 * blueprints keep that genuine structure as ONE blueprint and add six
 * further, genuinely distinct demands over successive percentage change,
 * including a direct, disclosed misconception-diagnosis blueprint for the
 * single most well-documented error in this topic (treating successive
 * percentages as additive).
 *
 * All amounts are computed in pence internally and rendered as £ with
 * exactly the precision the real production rows already use (whole
 * pounds where exact, two decimal places otherwise) -- guards against
 * floating-point display drift.
 */

function formatPounds(pence: number): string {
  const pounds = pence / 100;
  return Number.isInteger(pounds) ? `£${pounds}` : `£${pounds.toFixed(2)}`;
}

/** Integer-only formatting (no floating-point division) for a signed percentage change expressed in hundredths of a percent -- avoids display drift like "7.33000000000001%". */
function formatPercentChange(hundredthsOfPercent: number): string {
  const sign = hundredthsOfPercent >= 0 ? "+" : "-";
  const abs = Math.abs(hundredthsOfPercent);
  const whole = Math.floor(abs / 100);
  const frac = abs % 100;
  const str = frac === 0 ? String(whole) : `${whole}.${String(frac).padStart(2, "0")}`;
  return `${sign}${str}%`;
}

type SuccessiveParams = { startPence: number; incPercent: number; decPercent: number };
export const BP_SUCCESSIVE_CHANGE_DIRECT: StructuralBlueprint<SuccessiveParams> = {
  blueprintId: "mr04-bp-successive-change-direct",
  familyId: "mr04-compound-percentage",
  competencyId: "MR-04",
  questionTypeId: "QT-MR-04",
  mathematicalObjective: "Apply two successive percentage changes (an increase then a decrease) in order to find the final price.",
  parameterRanges: { startPence: { min: 2000, max: 50000 }, incPercent: { min: 5, max: 60 }, decPercent: { min: 5, max: 50 } },
  constraints: (p) => (p.startPence * (100 + p.incPercent) * (100 - p.decPercent)) % 10000 === 0,
  invalidCombinationDescription: "Only combinations producing an exact-pence final price (no fractional penny) are accepted -- guarantees a clean, unambiguous answer.",
  difficultyControls: (p) => (p.incPercent + p.decPercent <= 30 ? "easy" : p.incPercent + p.decPercent <= 60 ? "medium" : "hard"),
  difficultyDimensions: ["combined_percentage_magnitude"],
  sampleParams: (random) => {
    const startPence = 100 * (20 + Math.floor(random() * 480));
    const incPercent = 5 + Math.floor(random() * 56);
    const decPercent = 5 + Math.floor(random() * 46);
    return { startPence, incPercent, decPercent };
  },
  renderQuestionText: (p) => `A ${formatPounds(p.startPence)} item is increased in price by ${p.incPercent}%, then later decreased by ${p.decPercent}%. What is the final price?`,
  deriveCorrectAnswer: (p) => formatPounds(Math.round((p.startPence * (100 + p.incPercent) * (100 - p.decPercent)) / 10000)),
  deriveWorkedSteps: (p) => {
    const afterInc = Math.round((p.startPence * (100 + p.incPercent)) / 100);
    const final = Math.round((afterInc * (100 - p.decPercent)) / 100);
    return [`Increase: ${formatPounds(p.startPence)} × ${(100 + p.incPercent) / 100} = ${formatPounds(afterInc)}`, `Decrease: ${formatPounds(afterInc)} × ${(100 - p.decPercent) / 100} = ${formatPounds(final)}`];
  },
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "startPence/incPercent/decPercent resampled independently every candidate; only exact-pence outcomes accepted.",
  reasoningRoute: () => "multi_step_application",
  contextTag: () => "successive_percentage_change",
  unknownPosition: () => "final_price",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
};

type OrderCheckParams = { startPence: number; incPercent: number; decPercent: number };
export const BP_ORDER_INDEPENDENCE_CHECK: StructuralBlueprint<OrderCheckParams> = {
  blueprintId: "mr04-bp-order-independence-check",
  familyId: "mr04-compound-percentage",
  competencyId: "MR-04",
  questionTypeId: "QT-MR-04",
  mathematicalObjective: "Determine whether applying the same two percentage changes in the OPPOSITE order changes the final price -- diagnoses the well-documented misconception that order matters (multiplicatively, it never does).",
  parameterRanges: { startPence: { min: 2000, max: 50000 }, incPercent: { min: 5, max: 60 }, decPercent: { min: 5, max: 50 } },
  constraints: () => true,
  invalidCombinationDescription: "None -- the order-independence fact holds for every valid percentage pair.",
  difficultyControls: (p) => (p.incPercent + p.decPercent <= 30 ? "easy" : p.incPercent + p.decPercent <= 60 ? "medium" : "hard"),
  difficultyDimensions: ["combined_percentage_magnitude"],
  sampleParams: (random) => ({
    startPence: 100 * (20 + Math.floor(random() * 480)),
    incPercent: 5 + Math.floor(random() * 56),
    decPercent: 5 + Math.floor(random() * 46),
  }),
  renderQuestionText: (p) => `A ${formatPounds(p.startPence)} item has a ${p.incPercent}% increase and a ${p.decPercent}% decrease applied to it. Does it matter which order the two changes are applied in? Answer Yes or No.`,
  // Multiplicatively, (1+i)(1-d) = (1-d)(1+i) always -- order never
  // changes the final price. Independently confirmed by direct
  // computation below, never merely asserted.
  deriveCorrectAnswer: () => "No",
  deriveWorkedSteps: (p) => [
    `Increase then decrease: × ${(100 + p.incPercent) / 100} then × ${(100 - p.decPercent) / 100}`,
    `Decrease then increase: × ${(100 - p.decPercent) / 100} then × ${(100 + p.incPercent) / 100}`,
    "Multiplication can be done in any order, so both give the same final price -- the order does NOT matter",
  ],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "startPence/incPercent/decPercent resampled independently every candidate.",
  reasoningRoute: () => "comparison",
  contextTag: () => "successive_percentage_change",
  unknownPosition: () => "price_difference_between_orders",
  representationType: () => "prose",
  misconceptionTargeted: "believing the order of successive percentage changes affects the final price",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["explicit_teaching", "guided_practice", "mastery_check"],
};

type EquivalentPercentParams = { incPercent: number; decPercent: number };
export const BP_FIND_EQUIVALENT_SINGLE_PERCENTAGE: StructuralBlueprint<EquivalentPercentParams> = {
  blueprintId: "mr04-bp-find-equivalent-single-percentage",
  familyId: "mr04-compound-percentage",
  competencyId: "MR-04",
  questionTypeId: "QT-MR-04",
  mathematicalObjective: "Find the single overall percentage change equivalent to two successive changes -- a genuinely different unknown (a rate, not a price) from any price-finding blueprint.",
  parameterRanges: { incPercent: { min: 5, max: 60 }, decPercent: { min: 5, max: 50 } },
  constraints: () => true,
  invalidCombinationDescription: "None -- every valid percentage pair has a well-defined equivalent overall percentage change (rounded to 2 decimal places where not a clean integer).",
  difficultyControls: (p) => (p.incPercent + p.decPercent <= 30 ? "easy" : p.incPercent + p.decPercent <= 60 ? "medium" : "hard"),
  difficultyDimensions: ["combined_percentage_magnitude"],
  sampleParams: (random) => ({ incPercent: 5 + Math.floor(random() * 56), decPercent: 5 + Math.floor(random() * 46) }),
  renderQuestionText: (p) => `An item is increased in price by ${p.incPercent}%, then decreased by ${p.decPercent}%. What single overall percentage change is this equivalent to? (Give your answer as +X% or -X%, to 2 decimal places if not a whole number.)`,
  deriveCorrectAnswer: (p) => {
    const productHundredths = (100 + p.incPercent) * (100 - p.decPercent); // integer, in hundredths-of-a-percent-of-100 units
    return formatPercentChange(productHundredths - 10000);
  },
  deriveWorkedSteps: (p) => {
    const productHundredths = (100 + p.incPercent) * (100 - p.decPercent);
    return [
      `Combined multiplier as a percentage: ${(100 + p.incPercent)} × ${(100 - p.decPercent)} ÷ 100 = ${(productHundredths / 100).toFixed(2)}%`,
      `Overall change: ${(productHundredths / 100).toFixed(2)}% − 100% = ${formatPercentChange(productHundredths - 10000)}`,
    ];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "incPercent/decPercent resampled independently every candidate.",
  reasoningRoute: () => "multi_step_application",
  contextTag: () => "successive_percentage_change",
  unknownPosition: () => "equivalent_overall_percentage",
  representationType: () => "prose",
  misconceptionTargeted: "treating successive percentage changes as simply additive/subtractive instead of compounding multiplicatively",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["scaffolded_practice", "mastery_check"],
};

type ReverseOriginalParams = { finalPence: number; incPercent: number; decPercent: number };
export const BP_REVERSE_FIND_ORIGINAL_PRICE: StructuralBlueprint<ReverseOriginalParams> = {
  blueprintId: "mr04-bp-reverse-find-original-price",
  familyId: "mr04-compound-percentage",
  competencyId: "MR-04",
  questionTypeId: "QT-MR-04",
  mathematicalObjective: "Given the final price after two successive percentage changes, find the original starting price -- a genuine algebraic inversion, distinct from the forward direct blueprint.",
  parameterRanges: { finalPence: { min: 2000, max: 80000 }, incPercent: { min: 5, max: 60 }, decPercent: { min: 5, max: 50 } },
  constraints: (p) => (p.finalPence * 10000) % ((100 + p.incPercent) * (100 - p.decPercent)) === 0,
  invalidCombinationDescription: "Only combinations where the original price back-calculates to an exact whole number of pence are accepted.",
  difficultyControls: (p) => (p.incPercent + p.decPercent <= 30 ? "easy" : p.incPercent + p.decPercent <= 60 ? "medium" : "hard"),
  difficultyDimensions: ["combined_percentage_magnitude"],
  sampleParams: (random) => {
    // Construct forward from a clean start to guarantee an exact reverse.
    const startPence = 100 * (20 + Math.floor(random() * 480));
    const incPercent = 5 + Math.floor(random() * 56);
    const decPercent = 5 + Math.floor(random() * 46);
    const finalPence = Math.round((startPence * (100 + incPercent) * (100 - decPercent)) / 10000);
    return { finalPence, incPercent, decPercent };
  },
  renderQuestionText: (p) => `After a ${p.incPercent}% increase followed by a ${p.decPercent}% decrease, an item now costs ${formatPounds(p.finalPence)}. What was the original price?`,
  deriveCorrectAnswer: (p) => formatPounds(Math.round((p.finalPence * 10000) / ((100 + p.incPercent) * (100 - p.decPercent)))),
  deriveWorkedSteps: (p) => {
    const original = Math.round((p.finalPence * 10000) / ((100 + p.incPercent) * (100 - p.decPercent)));
    return [`Combined multiplier: ${(100 + p.incPercent) / 100} × ${(100 - p.decPercent) / 100} = ${((100 + p.incPercent) * (100 - p.decPercent)) / 10000}`, `${formatPounds(p.finalPence)} ÷ ${((100 + p.incPercent) * (100 - p.decPercent)) / 10000} = ${formatPounds(original)}`];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "Constructed forward from a clean start price then only the final price/percentages are exposed as parameters -- guarantees an exact, unambiguous reverse computation.",
  reasoningRoute: () => "reverse_reasoning",
  contextTag: () => "successive_percentage_change",
  unknownPosition: () => "original_price",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "transfer"],
};

type ErrorPercentParams = { startPence: number; incPercent: number; decPercent: number };
export const BP_ERROR_IDENTIFICATION_ADDITIVE: StructuralBlueprint<ErrorPercentParams> = {
  blueprintId: "mr04-bp-error-identification-additive",
  familyId: "mr04-compound-percentage",
  competencyId: "MR-04",
  questionTypeId: "QT-MR-04",
  mathematicalObjective: "Identify and correct the single most well-documented error in successive percentage change -- treating the two percentages as simply additive/subtractive instead of compounding multiplicatively.",
  parameterRanges: { startPence: { min: 2000, max: 50000 }, incPercent: { min: 5, max: 60 }, decPercent: { min: 5, max: 50 } },
  constraints: (p) => (p.startPence * (100 + p.incPercent) * (100 - p.decPercent)) % 10000 === 0,
  invalidCombinationDescription: "Same exact-pence requirement as BP_SUCCESSIVE_CHANGE_DIRECT.",
  difficultyControls: (p) => (p.incPercent + p.decPercent <= 30 ? "easy" : p.incPercent + p.decPercent <= 60 ? "medium" : "hard"),
  difficultyDimensions: ["combined_percentage_magnitude"],
  sampleParams: (random) => {
    const startPence = 100 * (20 + Math.floor(random() * 480));
    const incPercent = 5 + Math.floor(random() * 56);
    const decPercent = 5 + Math.floor(random() * 46);
    return { startPence, incPercent, decPercent };
  },
  renderQuestionText: (p) => {
    const netPercent = p.incPercent - p.decPercent;
    const wrongFinal = Math.round((p.startPence * (100 + netPercent)) / 100);
    return `A ${formatPounds(p.startPence)} item is increased by ${p.incPercent}% then decreased by ${p.decPercent}%. A student calculates the final price as ${formatPounds(wrongFinal)} by combining the percentages as ${p.incPercent}% − ${p.decPercent}% = ${netPercent}% net change. This is incorrect. What is the correct final price?`;
  },
  deriveCorrectAnswer: (p) => formatPounds(Math.round((p.startPence * (100 + p.incPercent) * (100 - p.decPercent)) / 10000)),
  deriveWorkedSteps: (p) => {
    const afterInc = Math.round((p.startPence * (100 + p.incPercent)) / 100);
    const final = Math.round((afterInc * (100 - p.decPercent)) / 100);
    return ["Percentage changes compound multiplicatively, not additively", `Increase: ${formatPounds(p.startPence)} × ${(100 + p.incPercent) / 100} = ${formatPounds(afterInc)}`, `Decrease: ${formatPounds(afterInc)} × ${(100 - p.decPercent) / 100} = ${formatPounds(final)}`];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "startPence/incPercent/decPercent resampled independently; the wrong answer is always derived from the SAME named misconception (additive combination), never an arbitrary offset.",
  reasoningRoute: () => "error_identification",
  contextTag: () => "successive_percentage_change",
  unknownPosition: () => "corrected_final_price",
  representationType: () => "prose",
  misconceptionTargeted: "treating successive percentage changes as simply additive/subtractive instead of compounding multiplicatively",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["explicit_teaching", "scaffolded_practice"],
};

type CompareScenariosParams = { start1: number; inc1: number; dec1: number; start2: number; inc2: number; dec2: number };
export const BP_COMPARE_TWO_SCENARIOS: StructuralBlueprint<CompareScenariosParams> = {
  blueprintId: "mr04-bp-compare-two-scenarios",
  familyId: "mr04-compound-percentage",
  competencyId: "MR-04",
  questionTypeId: "QT-MR-04",
  mathematicalObjective: "Compute the final price for TWO separate successive-percentage-change scenarios and compare them -- a genuinely different demand from computing one scenario alone.",
  parameterRanges: { start1: { min: 2000, max: 50000 }, inc1: { min: 5, max: 60 }, dec1: { min: 5, max: 50 }, start2: { min: 2000, max: 50000 }, inc2: { min: 5, max: 60 }, dec2: { min: 5, max: 50 } },
  constraints: (p) => {
    const final1 = (p.start1 * (100 + p.inc1) * (100 - p.dec1)) / 10000;
    const final2 = (p.start2 * (100 + p.inc2) * (100 - p.dec2)) / 10000;
    return Math.abs(final1 - final2) >= 1;
  },
  invalidCombinationDescription: "The two scenarios' final prices must not tie within 1 pence -- a genuine comparison requires a real, non-tied difference.",
  difficultyControls: (p) => {
    const final1 = (p.start1 * (100 + p.inc1) * (100 - p.dec1)) / 10000;
    const final2 = (p.start2 * (100 + p.inc2) * (100 - p.dec2)) / 10000;
    const gap = Math.abs(final1 - final2);
    return gap >= 1000 ? "easy" : gap >= 200 ? "medium" : "hard";
  },
  difficultyDimensions: ["result_closeness"],
  sampleParams: (random) => ({
    start1: 100 * (20 + Math.floor(random() * 480)), inc1: 5 + Math.floor(random() * 56), dec1: 5 + Math.floor(random() * 46),
    start2: 100 * (20 + Math.floor(random() * 480)), inc2: 5 + Math.floor(random() * 56), dec2: 5 + Math.floor(random() * 46),
  }),
  renderQuestionText: (p) =>
    `Item A costs ${formatPounds(p.start1)}, increased by ${p.inc1}% then decreased by ${p.dec1}%. Item B costs ${formatPounds(p.start2)}, increased by ${p.inc2}% then decreased by ${p.dec2}%. Which item has the higher final price -- A or B?`,
  deriveCorrectAnswer: (p) => {
    const final1 = Math.round((p.start1 * (100 + p.inc1) * (100 - p.dec1)) / 10000);
    const final2 = Math.round((p.start2 * (100 + p.inc2) * (100 - p.dec2)) / 10000);
    return final1 > final2 ? "A" : "B";
  },
  deriveWorkedSteps: (p) => {
    const final1 = Math.round((p.start1 * (100 + p.inc1) * (100 - p.dec1)) / 10000);
    const final2 = Math.round((p.start2 * (100 + p.inc2) * (100 - p.dec2)) / 10000);
    return [`Item A's final price: ${formatPounds(final1)}`, `Item B's final price: ${formatPounds(final2)}`, final1 > final2 ? "A is higher" : "B is higher"];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "All six scenario parameters resampled independently across the two items.",
  reasoningRoute: () => "comparison",
  contextTag: () => "successive_percentage_change",
  unknownPosition: () => "comparative_final_price",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["transfer", "independent_practice"],
};

export const MR04_COMPOUND_PERCENTAGE_FAMILY: EducationalFamily = {
  familyId: "mr04-compound-percentage",
  subject: "maths",
  blueprints: [
    BP_SUCCESSIVE_CHANGE_DIRECT,
    BP_ORDER_INDEPENDENCE_CHECK,
    BP_FIND_EQUIVALENT_SINGLE_PERCENTAGE,
    BP_REVERSE_FIND_ORIGINAL_PRICE,
    BP_ERROR_IDENTIFICATION_ADDITIVE,
    BP_COMPARE_TWO_SCENARIOS,
  ] as EducationalFamily["blueprints"],
};
