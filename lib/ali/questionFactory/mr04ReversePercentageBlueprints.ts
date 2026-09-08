import type { StructuralBlueprint, EducationalFamily } from "./types";

/**
 * Educational Increment 003, Wave 1 -- mr04-reverse-percentage.
 *
 * Real, existing production content (4 practice-eligible rows, read live
 * before designing these blueprints, see supabase/migrations/078_mr04_
 * content_depth_foundation.sql) is exclusively ONE reasoning shape:
 * "the final value is X% of the original -- divide to undo it," always
 * difficulty=hard, always transfer_class=FAR_TRANSFER, no easier entry
 * point and no teaching content. These blueprints keep that genuine
 * shape as ONE blueprint (BP_REVERSE_DIRECT_UNSCAFFOLDED) and add five
 * further, genuinely distinct demands: a scaffolded Foundation-tier
 * entry point (reduced scaffolding is the difficulty driver, not smaller
 * numbers), a different unknown (the rate itself, not the original
 * value), a disclosed misconception-diagnosis blueprint for the exact
 * real, already-tagged production misconception, a comparison blueprint,
 * and a Far-Transfer multi-step blueprint combining a percentage
 * reversal with a flat (non-percentage) deduction -- a genuinely
 * different operation-combination demand, not just a bigger percentage.
 *
 * All amounts are computed in pence internally and rendered as £ with
 * exactly the precision the real production rows already use -- guards
 * against floating-point display drift, same convention as
 * mr04CompoundPercentageBlueprints.ts.
 */

function formatPounds(pence: number): string {
  const pounds = pence / 100;
  return Number.isInteger(pounds) ? `£${pounds}` : `£${pounds.toFixed(2)}`;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * CONSTRUCTIVE (never rejection-sampled) whole-pound reversal pair.
 * Rejection sampling ("pick startPence/percent freely, keep only if the
 * result happens to land on a whole pound") was tried first and found,
 * by direct human review of its own output, to routinely produce
 * unrealistic prices like "£617.01" -- not a rare edge case, but the
 * ordinary result, because whole-pound-after-a-percentage-change is a
 * genuinely rare coincidence for an unconstrained (startPence, percent)
 * pair. This constructs the pair the other way round: given percent and
 * direction, the multiplier d=(100±percent) has some gcd g with 100;
 * choosing startPence as any multiple of 100·(100/g) makes
 * startPence·d/100 divisible by 100 BY CONSTRUCTION, not by chance --
 * every candidate is a genuine whole-pound price on both sides, matching
 * the real production convention (every real reverse-percentage row:
 * £96, £680, £540, £720, £720, all whole pounds).
 */
function buildWholePoundReversalPair(random: () => number, percent: number, directionFlag: number): { startPence: number; finalPence: number } {
  const d = directionFlag === 0 ? 100 + percent : 100 - percent;
  const g = gcd(d, 100);
  const step = 100 / g; // startPence, in whole pounds, must be a multiple of this
  const maxMultiplier = Math.max(1, Math.floor(800 / step));
  const multiplier = 1 + Math.floor(random() * maxMultiplier);
  const startPounds = step * multiplier;
  const startPence = startPounds * 100;
  const finalPence = startPounds * d; // always an exact multiple of 100 -- see docstring above
  return { startPence, finalPence };
}

// ─── BP1: Foundation -- scaffolded single reversal ──────────────────────

type ScaffoldedParams = { finalPence: number; percent: number; directionFlag: number };
export const BP_REVERSE_SCAFFOLDED_SINGLE_CHANGE: StructuralBlueprint<ScaffoldedParams> = {
  blueprintId: "mr04-bp-reverse-scaffolded-single-change",
  familyId: "mr04-reverse-percentage",
  competencyId: "MR-04",
  questionTypeId: "QT-MR-04",
  mathematicalObjective: "Reverse a single percentage change to find the original value, with the 'new value represents (100±percent)% of the original' relationship stated explicitly -- a genuine Foundation-tier entry point into reverse-percentage reasoning via reduced scaffolding, not smaller numbers.",
  parameterRanges: { finalPence: { min: 2000, max: 80000 }, percent: { min: 5, max: 60 }, directionFlag: { min: 0, max: 1 } },
  constraints: (p) =>
    p.finalPence % 100 === 0 && (p.directionFlag === 0 ? (p.finalPence * 100) % (100 + p.percent) === 0 : p.percent < 100 && (p.finalPence * 100) % (100 - p.percent) === 0),
  invalidCombinationDescription: "Only combinations producing an exact-pence original value AND a whole-pound final price are accepted -- matches the real production convention (every real reverse-percentage row states a clean whole-pound price, e.g. £96, £680), and guarantees a clean, unambiguous answer.",
  difficultyControls: (p) => (p.percent <= 15 ? "easy" : "medium"),
  difficultyDimensions: ["percentage_magnitude"],
  sampleParams: (random) => {
    const percent = 5 + Math.floor(random() * 56);
    const directionFlag = random() < 0.5 ? 0 : 1;
    const { finalPence } = buildWholePoundReversalPair(random, percent, directionFlag);
    return { finalPence, percent, directionFlag };
  },
  renderQuestionText: (p) =>
    p.directionFlag === 0
      ? `A shop increases every price by ${p.percent}%. After the increase, a book costs ${formatPounds(p.finalPence)}. This new price represents ${100 + p.percent}% of the original price. What was the original price?`
      : `A company decreases every salary by ${p.percent}%. After the decrease, an employee earns ${formatPounds(p.finalPence)} per month. This new amount represents ${100 - p.percent}% of the original amount. What was the original amount?`,
  deriveCorrectAnswer: (p) => (p.directionFlag === 0 ? formatPounds((p.finalPence * 100) / (100 + p.percent)) : formatPounds((p.finalPence * 100) / (100 - p.percent))),
  deriveWorkedSteps: (p) => {
    const multiplierPercent = p.directionFlag === 0 ? 100 + p.percent : 100 - p.percent;
    const original = p.directionFlag === 0 ? (p.finalPence * 100) / (100 + p.percent) : (p.finalPence * 100) / (100 - p.percent);
    return [`The new amount, ${formatPounds(p.finalPence)}, represents ${multiplierPercent}% of the original`, `${formatPounds(p.finalPence)} ÷ ${(multiplierPercent / 100).toFixed(2)} = ${formatPounds(original)}`];
  },
  stageSuitability: ["FOUNDATION", "DEVELOPMENT"],
  similarityControls: "finalPence/percent/directionFlag resampled independently every candidate; only exact-pence outcomes accepted.",
  reasoningRoute: () => "reverse_reasoning",
  contextTag: (p) => (p.directionFlag === 0 ? "reverse_percentage_increase" : "reverse_percentage_decrease"),
  unknownPosition: () => "original_value",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["explicit_teaching", "worked_example", "guided_practice"],
};

// ─── BP2: existing production structure, formalized, unscaffolded ──────

type DirectParams = { finalPence: number; percent: number; directionFlag: number };
export const BP_REVERSE_DIRECT_UNSCAFFOLDED: StructuralBlueprint<DirectParams> = {
  blueprintId: "mr04-bp-reverse-direct-unscaffolded",
  familyId: "mr04-reverse-percentage",
  competencyId: "MR-04",
  questionTypeId: "QT-MR-04",
  mathematicalObjective: "Reverse a single percentage change to find the original value, with no relationship stated -- the real, already-live production structure, formalised as one blueprint among several rather than the family's only shape.",
  parameterRanges: { finalPence: { min: 2000, max: 80000 }, percent: { min: 5, max: 60 }, directionFlag: { min: 0, max: 1 } },
  constraints: (p) =>
    p.finalPence % 100 === 0 && (p.directionFlag === 0 ? (p.finalPence * 100) % (100 + p.percent) === 0 : p.percent < 100 && (p.finalPence * 100) % (100 - p.percent) === 0),
  invalidCombinationDescription: "Same exact-pence-plus-whole-pound requirement as BP_REVERSE_SCAFFOLDED_SINGLE_CHANGE.",
  difficultyControls: (p) => (p.percent <= 15 ? "medium" : p.percent <= 40 ? "hard" : "challenge"),
  difficultyDimensions: ["percentage_magnitude"],
  sampleParams: (random) => {
    const percent = 5 + Math.floor(random() * 56);
    const directionFlag = random() < 0.5 ? 0 : 1;
    const { finalPence } = buildWholePoundReversalPair(random, percent, directionFlag);
    return { finalPence, percent, directionFlag };
  },
  renderQuestionText: (p) =>
    p.directionFlag === 0
      ? `A shop increases every price by ${p.percent}%. After the increase, a jacket costs ${formatPounds(p.finalPence)}. What was the price before the increase?`
      : `A charity's donations decreased by ${p.percent}% this year compared to last year. This year they received ${formatPounds(p.finalPence)}. How much did they receive last year?`,
  deriveCorrectAnswer: (p) => (p.directionFlag === 0 ? formatPounds((p.finalPence * 100) / (100 + p.percent)) : formatPounds((p.finalPence * 100) / (100 - p.percent))),
  deriveWorkedSteps: (p) => {
    const multiplierPercent = p.directionFlag === 0 ? 100 + p.percent : 100 - p.percent;
    const original = p.directionFlag === 0 ? (p.finalPence * 100) / (100 + p.percent) : (p.finalPence * 100) / (100 - p.percent);
    return [`${formatPounds(p.finalPence)} represents ${multiplierPercent}% of the original (100% ${p.directionFlag === 0 ? "+" : "−"} ${p.percent}%)`, `${formatPounds(p.finalPence)} ÷ ${(multiplierPercent / 100).toFixed(2)} = ${formatPounds(original)}`];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "finalPence/percent/directionFlag resampled independently every candidate; only exact-pence outcomes accepted.",
  reasoningRoute: () => "reverse_reasoning",
  contextTag: (p) => (p.directionFlag === 0 ? "reverse_percentage_increase" : "reverse_percentage_decrease"),
  unknownPosition: () => "original_value",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "independent_practice", "mastery_check"],
};

// ─── BP3: genuinely different unknown -- find the rate, not the value ──

type FindRateParams = { startPence: number; finalPence: number };
export const BP_REVERSE_FIND_RATE: StructuralBlueprint<FindRateParams> = {
  blueprintId: "mr04-bp-reverse-find-rate",
  familyId: "mr04-reverse-percentage",
  competencyId: "MR-04",
  questionTypeId: "QT-MR-04",
  mathematicalObjective: "Given both the original and final values, find the percentage change that was applied -- a genuinely different unknown (a rate, not a value) from either reverse-to-value blueprint.",
  parameterRanges: { startPence: { min: 2000, max: 80000 }, finalPence: { min: 2000, max: 160000 } },
  constraints: (p) => {
    if (p.finalPence % 100 !== 0) return false;
    const diff = Math.abs(p.finalPence - p.startPence);
    if (diff === 0 || (diff * 100) % p.startPence !== 0) return false;
    const pct = (diff * 100) / p.startPence;
    return pct >= 5 && pct <= 60;
  },
  invalidCombinationDescription: "Only (startPence, finalPence) pairs where the percentage change recomputes to an exact whole-percent value between 5% and 60%, AND both prices are whole pounds (matching the real production convention), are accepted.",
  difficultyControls: (p) => {
    const pct = (Math.abs(p.finalPence - p.startPence) * 100) / p.startPence;
    return pct <= 15 ? "medium" : pct <= 40 ? "hard" : "challenge";
  },
  difficultyDimensions: ["percentage_magnitude"],
  sampleParams: (random) => {
    const percent = 5 + Math.floor(random() * 56);
    const directionFlag = random() < 0.5 ? 0 : 1;
    return buildWholePoundReversalPair(random, percent, directionFlag);
  },
  renderQuestionText: (p) => `An item's price changed from ${formatPounds(p.startPence)} to ${formatPounds(p.finalPence)}. What percentage ${p.finalPence > p.startPence ? "increase" : "decrease"} does this represent?`,
  deriveCorrectAnswer: (p) => {
    const diff = Math.abs(p.finalPence - p.startPence);
    const pct = (diff * 100) / p.startPence;
    return `${pct}% ${p.finalPence > p.startPence ? "increase" : "decrease"}`;
  },
  deriveWorkedSteps: (p) => {
    const diff = Math.abs(p.finalPence - p.startPence);
    const pct = (diff * 100) / p.startPence;
    return [`Change in price: ${formatPounds(p.finalPence)} vs ${formatPounds(p.startPence)} -- difference ${formatPounds(diff)}`, `Percentage change: ${formatPounds(diff)} ÷ ${formatPounds(p.startPence)} × 100 = ${pct}%`];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "startPence/finalPence resampled independently every candidate via a hidden exact percent+direction construction; only whole-percent outcomes accepted.",
  reasoningRoute: () => "reverse_reasoning",
  contextTag: () => "find_percentage_rate_from_values",
  unknownPosition: () => "percentage_rate",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["scaffolded_practice", "mastery_check"],
};

// ─── BP4: error identification, targeting the real, already-tagged ─────
// production misconception ────────────────────────────────────────────

type ErrorParams = { finalPence: number; percent: number; directionFlag: number };
export const BP_REVERSE_ERROR_IDENTIFICATION: StructuralBlueprint<ErrorParams> = {
  blueprintId: "mr04-bp-reverse-error-identification",
  familyId: "mr04-reverse-percentage",
  competencyId: "MR-04",
  questionTypeId: "QT-MR-04",
  mathematicalObjective: "Identify and correct the single documented error already tagged on every real mr04-reverse-percentage production row -- applying the percentage directly to the new value (adding/subtracting) instead of dividing to undo it.",
  parameterRanges: { finalPence: { min: 2000, max: 80000 }, percent: { min: 5, max: 60 }, directionFlag: { min: 0, max: 1 } },
  constraints: (p) =>
    p.finalPence % 100 === 0 && (p.directionFlag === 0 ? (p.finalPence * 100) % (100 + p.percent) === 0 : p.percent < 100 && (p.finalPence * 100) % (100 - p.percent) === 0),
  invalidCombinationDescription: "Same exact-pence-plus-whole-pound requirement as the family's other single-reversal blueprints.",
  difficultyControls: () => "hard",
  difficultyDimensions: ["percentage_magnitude"],
  sampleParams: (random) => {
    const percent = 5 + Math.floor(random() * 56);
    const directionFlag = random() < 0.5 ? 0 : 1;
    const { finalPence } = buildWholePoundReversalPair(random, percent, directionFlag);
    return { finalPence, percent, directionFlag };
  },
  renderQuestionText: (p) => {
    const wrongAdjust = Math.round((p.finalPence * p.percent) / 100);
    const wrongOriginal = p.directionFlag === 0 ? p.finalPence - wrongAdjust : p.finalPence + wrongAdjust;
    return p.directionFlag === 0
      ? `A shop increases every price by ${p.percent}%. After the increase, a jacket costs ${formatPounds(p.finalPence)}. A student calculates the original price by finding ${p.percent}% of ${formatPounds(p.finalPence)} (= ${formatPounds(wrongAdjust)}) and subtracting it, giving ${formatPounds(wrongOriginal)}. This is incorrect. What is the correct original price?`
      : `A company decreases every salary by ${p.percent}%. After the decrease, an employee earns ${formatPounds(p.finalPence)}. A student calculates the original salary by finding ${p.percent}% of ${formatPounds(p.finalPence)} (= ${formatPounds(wrongAdjust)}) and adding it, giving ${formatPounds(wrongOriginal)}. This is incorrect. What is the correct original salary?`;
  },
  deriveCorrectAnswer: (p) => (p.directionFlag === 0 ? formatPounds((p.finalPence * 100) / (100 + p.percent)) : formatPounds((p.finalPence * 100) / (100 - p.percent))),
  deriveWorkedSteps: (p) => {
    const multiplierPercent = p.directionFlag === 0 ? 100 + p.percent : 100 - p.percent;
    const original = p.directionFlag === 0 ? (p.finalPence * 100) / (100 + p.percent) : (p.finalPence * 100) / (100 - p.percent);
    return ["The percentage applies to the ORIGINAL price, not the new price -- it cannot be found by taking a percentage of the new value", `${formatPounds(p.finalPence)} represents ${multiplierPercent}% of the original`, `${formatPounds(p.finalPence)} ÷ ${(multiplierPercent / 100).toFixed(2)} = ${formatPounds(original)}`];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "finalPence/percent/directionFlag resampled independently; the wrong answer is always derived from the SAME named misconception, never an arbitrary offset.",
  reasoningRoute: () => "error_identification",
  contextTag: (p) => (p.directionFlag === 0 ? "reverse_percentage_increase" : "reverse_percentage_decrease"),
  unknownPosition: () => "original_value",
  representationType: () => "prose",
  misconceptionTargeted: "applying-the-percentage-to-the-new-value-instead-of-dividing-to-undo-it",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["explicit_teaching", "scaffolded_practice"],
};

// ─── BP5: comparison -- two independent reverse scenarios ──────────────

type CompareParams = { finalPence1: number; percent1: number; directionFlag1: number; finalPence2: number; percent2: number; directionFlag2: number };
export const BP_REVERSE_COMPARE_TWO_SCENARIOS: StructuralBlueprint<CompareParams> = {
  blueprintId: "mr04-bp-reverse-compare-two-scenarios",
  familyId: "mr04-reverse-percentage",
  competencyId: "MR-04",
  questionTypeId: "QT-MR-04",
  mathematicalObjective: "Reverse TWO separate percentage-change scenarios and compare the original values -- a genuinely different demand from reversing one scenario alone.",
  parameterRanges: {
    finalPence1: { min: 2000, max: 80000 }, percent1: { min: 5, max: 60 }, directionFlag1: { min: 0, max: 1 },
    finalPence2: { min: 2000, max: 80000 }, percent2: { min: 5, max: 60 }, directionFlag2: { min: 0, max: 1 },
  },
  constraints: (p) => {
    if (p.finalPence1 % 100 !== 0 || p.finalPence2 % 100 !== 0) return false;
    const validA = p.directionFlag1 === 0 ? (p.finalPence1 * 100) % (100 + p.percent1) === 0 : p.percent1 < 100 && (p.finalPence1 * 100) % (100 - p.percent1) === 0;
    const validB = p.directionFlag2 === 0 ? (p.finalPence2 * 100) % (100 + p.percent2) === 0 : p.percent2 < 100 && (p.finalPence2 * 100) % (100 - p.percent2) === 0;
    if (!validA || !validB) return false;
    const original1 = p.directionFlag1 === 0 ? (p.finalPence1 * 100) / (100 + p.percent1) : (p.finalPence1 * 100) / (100 - p.percent1);
    const original2 = p.directionFlag2 === 0 ? (p.finalPence2 * 100) / (100 + p.percent2) : (p.finalPence2 * 100) / (100 - p.percent2);
    return Math.abs(original1 - original2) >= 100;
  },
  invalidCombinationDescription: "Both scenarios must state a whole-pound final price and independently produce an exact-pence original value, and the two original values must not tie within £1 -- a genuine comparison requires a real, non-tied difference.",
  difficultyControls: () => "hard",
  difficultyDimensions: ["percentage_magnitude", "result_closeness"],
  sampleParams: (random) => {
    const makeScenario = () => {
      const percent = 5 + Math.floor(random() * 56);
      const directionFlag = random() < 0.5 ? 0 : 1;
      const { finalPence } = buildWholePoundReversalPair(random, percent, directionFlag);
      return { finalPence, percent, directionFlag };
    };
    const a = makeScenario();
    const b = makeScenario();
    return { finalPence1: a.finalPence, percent1: a.percent, directionFlag1: a.directionFlag, finalPence2: b.finalPence, percent2: b.percent, directionFlag2: b.directionFlag };
  },
  renderQuestionText: (p) =>
    `Item A: after a ${p.percent1}% ${p.directionFlag1 === 0 ? "increase" : "decrease"}, it now costs ${formatPounds(p.finalPence1)}. Item B: after a ${p.percent2}% ${p.directionFlag2 === 0 ? "increase" : "decrease"}, it now costs ${formatPounds(p.finalPence2)}. Which item had the higher ORIGINAL price -- A or B?`,
  deriveCorrectAnswer: (p) => {
    const original1 = Math.round(p.directionFlag1 === 0 ? (p.finalPence1 * 100) / (100 + p.percent1) : (p.finalPence1 * 100) / (100 - p.percent1));
    const original2 = Math.round(p.directionFlag2 === 0 ? (p.finalPence2 * 100) / (100 + p.percent2) : (p.finalPence2 * 100) / (100 - p.percent2));
    return original1 > original2 ? "A" : "B";
  },
  deriveWorkedSteps: (p) => {
    const original1 = Math.round(p.directionFlag1 === 0 ? (p.finalPence1 * 100) / (100 + p.percent1) : (p.finalPence1 * 100) / (100 - p.percent1));
    const original2 = Math.round(p.directionFlag2 === 0 ? (p.finalPence2 * 100) / (100 + p.percent2) : (p.finalPence2 * 100) / (100 - p.percent2));
    return [`Item A's original price: ${formatPounds(original1)}`, `Item B's original price: ${formatPounds(original2)}`, original1 > original2 ? "A is higher" : "B is higher"];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "All six scenario parameters resampled independently across the two items; ties within £1 rejected.",
  reasoningRoute: () => "comparison",
  contextTag: () => "reverse_percentage_compare_scenarios",
  unknownPosition: () => "comparative_original_price",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["transfer", "independent_practice"],
};

// ─── BP6: Far-Transfer -- mixed percentage + flat-deduction reversal ───

type MultiStepParams = { paidPence: number; loyaltyFlatPence: number; discountPercent: number };
export const BP_REVERSE_MULTI_STEP_MIXED_OPERATIONS: StructuralBlueprint<MultiStepParams> = {
  blueprintId: "mr04-bp-reverse-multi-step-mixed-operations",
  familyId: "mr04-reverse-percentage",
  competencyId: "MR-04",
  questionTypeId: "QT-MR-04",
  mathematicalObjective: "Reverse a percentage discount AND a separate flat (non-percentage) deduction, applied in a known order, to find the true original price -- a genuinely different, harder demand than reversing a single percentage: the reversal steps must be undone in the OPPOSITE order to how they were applied, and combine two different operation types.",
  parameterRanges: { paidPence: { min: 500, max: 100000 }, loyaltyFlatPence: { min: 100, max: 2000 }, discountPercent: { min: 5, max: 45 } },
  constraints: (p) => p.paidPence > 0 && p.paidPence % 100 === 0 && ((p.paidPence + p.loyaltyFlatPence) * 100) % (100 - p.discountPercent) === 0,
  invalidCombinationDescription: "Only combinations where the amount actually paid is a whole pound figure (matching the real production convention) AND reversing the flat deduction then the percentage discount produces an exact-pence original price are accepted.",
  difficultyControls: () => "challenge",
  difficultyDimensions: ["operation_count", "combined_operation_types"],
  sampleParams: (random) => {
    // Constructive, like BP1-5's buildWholePoundReversalPair -- originalPounds
    // is chosen as a multiple of 100/gcd(100-discountPercent, 100) so
    // afterDiscount lands on a whole pound BY CONSTRUCTION, never by chance.
    const discountPercent = 5 + Math.floor(random() * 41);
    const d = 100 - discountPercent;
    const g = gcd(d, 100);
    const step = 100 / g;
    const maxMultiplier = Math.max(1, Math.floor(500 / step));
    const multiplier = 1 + Math.floor(random() * maxMultiplier);
    const originalPounds = step * multiplier;
    const afterDiscountPence = originalPounds * d;
    const maxLoyaltyPounds = Math.min(20, Math.max(1, Math.floor(afterDiscountPence / 100) - 1));
    const loyaltyFlatPence = 100 * (1 + Math.floor(random() * maxLoyaltyPounds));
    const paidPence = afterDiscountPence - loyaltyFlatPence;
    return { paidPence, loyaltyFlatPence, discountPercent };
  },
  renderQuestionText: (p) => `A shop applies a ${p.discountPercent}% discount to an item, then takes off a further flat ${formatPounds(p.loyaltyFlatPence)} for loyalty members. A loyalty member pays ${formatPounds(p.paidPence)}. What was the original price before any discount?`,
  deriveCorrectAnswer: (p) => formatPounds(((p.paidPence + p.loyaltyFlatPence) * 100) / (100 - p.discountPercent)),
  deriveWorkedSteps: (p) => {
    const preFlat = p.paidPence + p.loyaltyFlatPence;
    const original = (preFlat * 100) / (100 - p.discountPercent);
    return [
      `Add back the flat loyalty deduction (undo the LAST step first): ${formatPounds(p.paidPence)} + ${formatPounds(p.loyaltyFlatPence)} = ${formatPounds(preFlat)}`,
      `This is ${100 - p.discountPercent}% of the original price (after the ${p.discountPercent}% discount, before the flat deduction)`,
      `${formatPounds(preFlat)} ÷ ${((100 - p.discountPercent) / 100).toFixed(2)} = ${formatPounds(original)}`,
    ];
  },
  stageSuitability: ["FINAL_READINESS"],
  similarityControls: "paidPence/loyaltyFlatPence/discountPercent constructed forward from a hidden clean original price every candidate; only exact-pence outcomes accepted.",
  reasoningRoute: () => "multi_step_application",
  contextTag: () => "reverse_combined_percentage_and_flat_deduction",
  unknownPosition: () => "original_price_before_combined_operations",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["transfer", "independent_practice"],
};

export const MR04_REVERSE_PERCENTAGE_FAMILY: EducationalFamily = {
  familyId: "mr04-reverse-percentage",
  subject: "maths",
  blueprints: [
    BP_REVERSE_SCAFFOLDED_SINGLE_CHANGE,
    BP_REVERSE_DIRECT_UNSCAFFOLDED,
    BP_REVERSE_FIND_RATE,
    BP_REVERSE_ERROR_IDENTIFICATION,
    BP_REVERSE_COMPARE_TWO_SCENARIOS,
    BP_REVERSE_MULTI_STEP_MIXED_OPERATIONS,
  ] as EducationalFamily["blueprints"],
};
