import type { StructuralBlueprint, EducationalFamily } from "./types";

/**
 * Controlled Content Manufacturing Wave 1 — mr01-whole-number-computation.
 *
 * Real, existing production content for this family (13 practice-eligible
 * rows, read live via anon key before designing these blueprints) already
 * spans addition, subtraction (with/without borrowing), multiplication,
 * and division-with-remainder -- these blueprints formalise that REAL
 * variety as genuine StructuralBlueprints, plus add two genuinely new
 * reasoning routes (reverse/missing-operand, error-identification) not
 * present in the hand-authored rows, matching the Founder's own "unfamiliar
 * problems" instruction rather than merely reformatting what already exists.
 *
 * Every blueprint stays inside MR-01/QT-MR-01 -- none changes the
 * competency merely to inflate the blueprint count.
 */

type AddParams = { a: number; b: number };
export const BP_ADDITION_DIRECT: StructuralBlueprint<AddParams> = {
  blueprintId: "mr01-bp-addition-direct",
  familyId: "mr01-whole-number-computation",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-01",
  mathematicalObjective: "Add two multi-digit whole numbers accurately, including carrying across columns.",
  parameterRanges: { a: { min: 100, max: 9999 }, b: { min: 100, max: 9999 } },
  constraints: (p) => p.a + p.b <= 20000,
  invalidCombinationDescription: "Sums above 20000 excluded -- keeps the result within a plausible KS2/11+ magnitude.",
  difficultyControls: (p) => {
    const sum = p.a + p.b;
    return sum <= 2000 ? "easy" : sum <= 8000 ? "medium" : "hard";
  },
  difficultyDimensions: ["result_magnitude"],
  sampleParams: (random) => ({ a: 100 + Math.floor(random() * 9900), b: 100 + Math.floor(random() * 9900) }),
  renderQuestionText: (p) => `${p.a} + ${p.b} = ?`,
  deriveCorrectAnswer: (p) => String(p.a + p.b),
  deriveWorkedSteps: (p) => [`${p.a} + ${p.b} = ${p.a + p.b}`],
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "a/b resampled independently every candidate.",
  reasoningRoute: () => "direct_computation",
  contextTag: () => "bare_arithmetic",
  unknownPosition: () => "sum",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
};

type SubParams = { a: number; b: number };
export const BP_SUBTRACTION_DIRECT: StructuralBlueprint<SubParams> = {
  blueprintId: "mr01-bp-subtraction-direct",
  familyId: "mr01-whole-number-computation",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-01",
  mathematicalObjective: "Subtract two multi-digit whole numbers accurately, including borrowing across zero columns.",
  parameterRanges: { a: { min: 1000, max: 10000 }, b: { min: 100, max: 9999 } },
  constraints: (p) => p.a > p.b && p.a - p.b >= 10,
  invalidCombinationDescription: "b must be strictly smaller than a (a real subtraction, never negative), and the result must be at least 10 to stay non-trivial.",
  difficultyControls: (p) => {
    const diff = p.a - p.b;
    return diff <= 500 ? "hard" : diff <= 3000 ? "medium" : "easy";
    // A small resulting difference between two large numbers requires
    // more borrow-chain steps to resolve, not fewer -- a genuinely
    // real complexity driver, the inverse of BP_ADDITION_DIRECT's own.
  },
  difficultyDimensions: ["borrow_chain_length_proxy"],
  sampleParams: (random) => ({ a: 1000 + Math.floor(random() * 9000), b: 100 + Math.floor(random() * 9899) }),
  renderQuestionText: (p) => `${p.a} - ${p.b} = ?`,
  deriveCorrectAnswer: (p) => String(p.a - p.b),
  deriveWorkedSteps: (p) => [`${p.a} - ${p.b} = ${p.a - p.b}`],
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "a/b resampled independently every candidate.",
  reasoningRoute: () => "direct_computation",
  contextTag: () => "bare_arithmetic",
  unknownPosition: () => "difference",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
};

type MulParams = { a: number; b: number };
export const BP_MULTIPLICATION_DIRECT: StructuralBlueprint<MulParams> = {
  blueprintId: "mr01-bp-multiplication-direct",
  familyId: "mr01-whole-number-computation",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-01",
  mathematicalObjective: "Multiply a two-digit number by a one- or two-digit number.",
  parameterRanges: { a: { min: 10, max: 99 }, b: { min: 2, max: 99 } },
  constraints: () => true,
  invalidCombinationDescription: "No combinations excluded -- every two-digit-by-(one/two)-digit product is a valid instance.",
  difficultyControls: (p) => (p.b <= 9 ? "easy" : p.b <= 30 ? "medium" : "hard"),
  difficultyDimensions: ["multiplier_magnitude"],
  sampleParams: (random) => ({ a: 10 + Math.floor(random() * 90), b: 2 + Math.floor(random() * 98) }),
  renderQuestionText: (p) => `${p.a} × ${p.b} = ?`,
  deriveCorrectAnswer: (p) => String(p.a * p.b),
  deriveWorkedSteps: (p) => [`${p.a} × ${p.b} = ${p.a * p.b}`],
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "a/b resampled independently every candidate.",
  reasoningRoute: () => "direct_computation",
  contextTag: () => "bare_arithmetic",
  unknownPosition: () => "product",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
};

type DivRemParams = { dividend: number; divisor: number };
export const BP_DIVISION_WITH_REMAINDER: StructuralBlueprint<DivRemParams> = {
  blueprintId: "mr01-bp-division-with-remainder",
  familyId: "mr01-whole-number-computation",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-01",
  mathematicalObjective: "Divide a whole number by another and express the leftover amount as a remainder -- a genuinely different answer-shape demand from exact division.",
  parameterRanges: { dividend: { min: 50, max: 999 }, divisor: { min: 3, max: 12 } },
  constraints: (p) => p.dividend % p.divisor !== 0,
  invalidCombinationDescription: "Exact divisions (remainder 0) are excluded -- that is BP_DIVISION_EXACT's own territory, not this blueprint's.",
  difficultyControls: (p) => (p.dividend <= 200 ? "easy" : p.dividend <= 600 ? "medium" : "hard"),
  difficultyDimensions: ["dividend_magnitude"],
  sampleParams: (random) => ({ dividend: 50 + Math.floor(random() * 950), divisor: 3 + Math.floor(random() * 10) }),
  renderQuestionText: (p) => `What is the remainder when ${p.dividend} is divided by ${p.divisor}?`,
  deriveCorrectAnswer: (p) => String(p.dividend % p.divisor),
  deriveWorkedSteps: (p) => {
    const quotient = Math.floor(p.dividend / p.divisor);
    return [`${p.divisor} × ${quotient} = ${p.divisor * quotient}`, `${p.dividend} − ${p.divisor * quotient} = ${p.dividend % p.divisor}`, `so ${p.dividend} ÷ ${p.divisor} = ${quotient} remainder ${p.dividend % p.divisor}`];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "dividend/divisor resampled independently; the exact-division case is structurally excluded by constraints.",
  reasoningRoute: () => "multi_step_application",
  contextTag: () => "bare_arithmetic",
  unknownPosition: () => "remainder",
  representationType: () => "prose",
  misconceptionTargeted: "stating the quotient instead of the remainder as the final answer",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["scaffolded_practice", "mastery_check"],
};

type DivExactParams = { quotient: number; divisor: number };
export const BP_DIVISION_EXACT: StructuralBlueprint<DivExactParams> = {
  blueprintId: "mr01-bp-division-exact",
  familyId: "mr01-whole-number-computation",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-01",
  mathematicalObjective: "Divide a whole number exactly by another, with no remainder.",
  parameterRanges: { quotient: { min: 5, max: 200 }, divisor: { min: 3, max: 15 } },
  constraints: () => true,
  invalidCombinationDescription: "None -- dividend is always constructed as quotient×divisor, guaranteeing an exact division by design.",
  difficultyControls: (p) => (p.quotient * p.divisor <= 200 ? "easy" : p.quotient * p.divisor <= 800 ? "medium" : "hard"),
  difficultyDimensions: ["dividend_magnitude"],
  sampleParams: (random) => ({ quotient: 5 + Math.floor(random() * 196), divisor: 3 + Math.floor(random() * 13) }),
  renderQuestionText: (p) => `${p.quotient * p.divisor} ÷ ${p.divisor} = ?`,
  deriveCorrectAnswer: (p) => String(p.quotient),
  deriveWorkedSteps: (p) => [`${p.quotient * p.divisor} ÷ ${p.divisor} = ${p.quotient}`],
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "quotient/divisor resampled independently; dividend is derived, never independently sampled, guaranteeing exactness.",
  reasoningRoute: () => "direct_computation",
  contextTag: () => "bare_arithmetic",
  unknownPosition: () => "quotient",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "independent_practice"],
};

type MissingAddendParams = { known: number; total: number };
export const BP_MISSING_ADDEND: StructuralBlueprint<MissingAddendParams> = {
  blueprintId: "mr01-bp-missing-addend",
  familyId: "mr01-whole-number-computation",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-01",
  mathematicalObjective: "Solve for an unknown addend given the total -- the inverse of direct addition, requiring subtraction to isolate the unknown.",
  parameterRanges: { known: { min: 10, max: 5000 }, total: { min: 20, max: 10000 } },
  constraints: (p) => p.total > p.known && p.total - p.known >= 5,
  invalidCombinationDescription: "total must exceed known by at least 5 -- a non-trivial, genuine unknown.",
  difficultyControls: (p) => (p.total <= 500 ? "easy" : p.total <= 3000 ? "medium" : "hard"),
  difficultyDimensions: ["total_magnitude"],
  sampleParams: (random) => ({ known: 10 + Math.floor(random() * 4990), total: 20 + Math.floor(random() * 9980) }),
  renderQuestionText: (p) => `${p.known} + ? = ${p.total}. What is the missing number?`,
  deriveCorrectAnswer: (p) => String(p.total - p.known),
  deriveWorkedSteps: (p) => [`${p.total} − ${p.known} = ${p.total - p.known}`],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "known/total resampled independently.",
  reasoningRoute: () => "reverse_reasoning",
  contextTag: () => "bare_arithmetic",
  unknownPosition: () => "missing_addend",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "transfer"],
};

type MissingFactorParams = { known: number; product: number };
export const BP_MISSING_FACTOR: StructuralBlueprint<MissingFactorParams> = {
  blueprintId: "mr01-bp-missing-factor",
  familyId: "mr01-whole-number-computation",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-01",
  mathematicalObjective: "Solve for an unknown factor given a product -- the inverse of direct multiplication, requiring division to isolate the unknown.",
  parameterRanges: { known: { min: 2, max: 20 }, product: { min: 10, max: 2000 } },
  constraints: (p) => p.product % p.known === 0 && p.product / p.known >= 2 && p.product / p.known !== p.known,
  invalidCombinationDescription: "product must divide exactly by known (a clean integer missing factor); the resulting factor must genuinely differ from the known one to avoid a degenerate square case.",
  difficultyControls: (p) => (p.product <= 100 ? "easy" : p.product <= 600 ? "medium" : "hard"),
  difficultyDimensions: ["product_magnitude"],
  sampleParams: (random) => ({ known: 2 + Math.floor(random() * 19), product: 10 + Math.floor(random() * 1991) }),
  renderQuestionText: (p) => `${p.known} × ? = ${p.product}. What is the missing number?`,
  deriveCorrectAnswer: (p) => String(p.product / p.known),
  deriveWorkedSteps: (p) => [`${p.product} ÷ ${p.known} = ${p.product / p.known}`],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "known/product resampled independently; product filtered to only genuinely divisible values.",
  reasoningRoute: () => "reverse_reasoning",
  contextTag: () => "bare_arithmetic",
  unknownPosition: () => "missing_factor",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "transfer"],
};

type ErrorParams = { a: number; b: number; wrongOffset: number };
export const BP_ERROR_IDENTIFICATION: StructuralBlueprint<ErrorParams> = {
  blueprintId: "mr01-bp-error-identification",
  familyId: "mr01-whole-number-computation",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-01",
  mathematicalObjective: "Identify and correct an arbitrary arithmetic error in someone else's addition -- an error-identification demand distinct from solving from scratch.",
  parameterRanges: { a: { min: 100, max: 5000 }, b: { min: 100, max: 5000 }, wrongOffset: { min: -20, max: 20 } },
  constraints: (p) => p.wrongOffset !== 0 && p.a + p.b + p.wrongOffset > 0,
  invalidCombinationDescription: "wrongOffset of exactly 0 is excluded (no error to identify); the resulting 'wrong' total must still be a positive, plausible number.",
  difficultyControls: (p) => (p.a + p.b <= 2000 ? "easy" : p.a + p.b <= 6000 ? "medium" : "hard"),
  difficultyDimensions: ["result_magnitude", "error_magnitude"],
  sampleParams: (random) => ({
    a: 100 + Math.floor(random() * 4900),
    b: 100 + Math.floor(random() * 4900),
    wrongOffset: (() => {
      const magnitude = 3 + Math.floor(random() * 18);
      return random() < 0.5 ? magnitude : -magnitude;
    })(),
  }),
  renderQuestionText: (p) => {
    const wrongAnswer = p.a + p.b + p.wrongOffset;
    return `A student calculates ${p.a} + ${p.b} and gets ${wrongAnswer}. This is incorrect. What is the correct total?`;
  },
  deriveCorrectAnswer: (p) => String(p.a + p.b),
  deriveWorkedSteps: (p) => [`${p.a} + ${p.b} = ${p.a + p.b}`],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "a/b/wrongOffset resampled independently every candidate; wrongOffset !== 0 enforced by constraints.",
  reasoningRoute: () => "error_identification",
  contextTag: () => "bare_arithmetic",
  unknownPosition: () => "corrected_total",
  representationType: () => "prose",
  misconceptionTargeted: "a generic arithmetic slip in the final addition step",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["scaffolded_practice", "mastery_check"],
};

type MultiStepParams = { a: number; b: number; c: number };
export const BP_MULTISTEP_ADD_THEN_MULTIPLY: StructuralBlueprint<MultiStepParams> = {
  blueprintId: "mr01-bp-multistep-add-then-multiply",
  familyId: "mr01-whole-number-computation",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-01",
  mathematicalObjective: "Combine two operations in a fixed order (add, then multiply) -- a genuinely higher information-load, multi-step demand distinct from any single-operation blueprint.",
  parameterRanges: { a: { min: 10, max: 200 }, b: { min: 10, max: 200 }, c: { min: 2, max: 12 } },
  constraints: (p) => (p.a + p.b) * p.c <= 10000,
  invalidCombinationDescription: "Final results above 10000 excluded -- keeps the multi-step result within a plausible magnitude.",
  difficultyControls: (p) => {
    const result = (p.a + p.b) * p.c;
    return result <= 500 ? "easy" : result <= 3000 ? "medium" : "hard";
  },
  difficultyDimensions: ["step_count", "result_magnitude"],
  sampleParams: (random) => ({ a: 10 + Math.floor(random() * 190), b: 10 + Math.floor(random() * 190), c: 2 + Math.floor(random() * 11) }),
  renderQuestionText: (p) => `Work out (${p.a} + ${p.b}) × ${p.c}.`,
  deriveCorrectAnswer: (p) => String((p.a + p.b) * p.c),
  deriveWorkedSteps: (p) => [`${p.a} + ${p.b} = ${p.a + p.b}`, `${p.a + p.b} × ${p.c} = ${(p.a + p.b) * p.c}`],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "a/b/c resampled independently every candidate.",
  reasoningRoute: () => "multi_step_application",
  contextTag: () => "bare_arithmetic",
  unknownPosition: () => "final_result",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["independent_practice", "transfer"],
};

export const MR01_WHOLE_NUMBER_FAMILY: EducationalFamily = {
  familyId: "mr01-whole-number-computation",
  subject: "maths",
  blueprints: [
    BP_ADDITION_DIRECT,
    BP_SUBTRACTION_DIRECT,
    BP_MULTIPLICATION_DIRECT,
    BP_DIVISION_WITH_REMAINDER,
    BP_DIVISION_EXACT,
    BP_MISSING_ADDEND,
    BP_MISSING_FACTOR,
    BP_ERROR_IDENTIFICATION,
    BP_MULTISTEP_ADD_THEN_MULTIPLY,
  ] as EducationalFamily["blueprints"],
};
