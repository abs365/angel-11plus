import type { StructuralBlueprint, EducationalFamily } from "./types";

/**
 * Controlled Content Manufacturing Wave 1 — mr05-factors-primes.
 *
 * Real, existing production content (5 practice-eligible rows, read live)
 * already spans two genuinely different demands -- "count the factors of
 * N" and "is N prime? True/False" -- these blueprints formalise both and
 * add five further, genuinely distinct number-theory demands, all inside
 * MR-05/QT-MR-11.
 */

function countFactors(n: number): number {
  let count = 0;
  for (let i = 1; i <= n; i++) if (n % i === 0) count++;
  return count;
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}

function countDistinctPrimeFactors(n: number): number {
  let count = 0;
  let remaining = n;
  for (let i = 2; i * i <= remaining; i++) {
    if (remaining % i === 0) {
      count++;
      while (remaining % i === 0) remaining /= i;
    }
  }
  if (remaining > 1) count++;
  return count;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

type CountFactorsParams = { n: number };
export const BP_COUNT_FACTORS: StructuralBlueprint<CountFactorsParams> = {
  blueprintId: "mr05-bp-count-factors",
  familyId: "mr05-factors-primes",
  competencyId: "MR-05",
  questionTypeId: "QT-MR-11",
  mathematicalObjective: "Count the total number of whole-number factors of a given number.",
  parameterRanges: { n: { min: 4, max: 100 } },
  constraints: () => true,
  invalidCombinationDescription: "None -- every whole number in range has a well-defined factor count.",
  difficultyControls: (p) => {
    const count = countFactors(p.n);
    return count <= 4 ? "easy" : count <= 8 ? "medium" : "hard";
  },
  difficultyDimensions: ["factor_count"],
  sampleParams: (random) => ({ n: 4 + Math.floor(random() * 97) }),
  renderQuestionText: (p) => `How many factors does ${p.n} have?`,
  deriveCorrectAnswer: (p) => String(countFactors(p.n)),
  deriveWorkedSteps: (p) => {
    const factors: number[] = [];
    for (let i = 1; i <= p.n; i++) if (p.n % i === 0) factors.push(i);
    return [`List every number that divides exactly into ${p.n}: ${factors.join(", ")}`, `Count them: ${factors.length}`];
  },
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "n resampled independently every candidate.",
  reasoningRoute: () => "direct_computation",
  contextTag: () => "number_theory",
  unknownPosition: () => "factor_count",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
};

type IsPrimeParams = { n: number };
export const BP_IS_PRIME: StructuralBlueprint<IsPrimeParams> = {
  blueprintId: "mr05-bp-is-prime",
  familyId: "mr05-factors-primes",
  competencyId: "MR-05",
  questionTypeId: "QT-MR-11",
  mathematicalObjective: "Determine whether a given number is prime -- a classification/verification demand distinct from counting factors.",
  parameterRanges: { n: { min: 2, max: 100 } },
  constraints: () => true,
  invalidCombinationDescription: "None -- every number in range has a well-defined primality.",
  difficultyControls: (p) => (p.n <= 20 ? "easy" : p.n <= 60 ? "medium" : "hard"),
  difficultyDimensions: ["value_magnitude"],
  sampleParams: (random) => ({ n: 2 + Math.floor(random() * 99) }),
  renderQuestionText: (p) => `Is ${p.n} a prime number? Answer True or False.`,
  deriveCorrectAnswer: (p) => (isPrime(p.n) ? "True" : "False"),
  deriveWorkedSteps: (p) => {
    if (isPrime(p.n)) return ["Check every number from 2 up to the square root of " + p.n, `None divide exactly into ${p.n}, so it is prime`];
    let divisor = 2;
    while (p.n % divisor !== 0) divisor++;
    return [`${p.n} can be divided exactly by ${divisor}`, "A number with a factor other than 1 and itself is not prime"];
  },
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "n resampled independently every candidate.",
  reasoningRoute: () => "comparison",
  contextTag: () => "number_theory",
  unknownPosition: () => "primality_verdict",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["independent_practice", "mastery_check"],
};

type IsFactorParams = { candidate: number; target: number };
export const BP_IS_FACTOR: StructuralBlueprint<IsFactorParams> = {
  blueprintId: "mr05-bp-is-factor",
  familyId: "mr05-factors-primes",
  competencyId: "MR-05",
  questionTypeId: "QT-MR-11",
  mathematicalObjective: "Determine whether one given number is a factor of another -- a relational verification demand distinct from listing all of one number's own factors.",
  parameterRanges: { candidate: { min: 2, max: 20 }, target: { min: 10, max: 200 } },
  constraints: () => true,
  invalidCombinationDescription: "None -- both a genuine factor pair and a genuine non-factor pair are valid, deliberately testable candidates.",
  difficultyControls: (p) => (p.target <= 50 ? "easy" : p.target <= 120 ? "medium" : "hard"),
  difficultyDimensions: ["target_magnitude"],
  sampleParams: (random) => ({ candidate: 2 + Math.floor(random() * 19), target: 10 + Math.floor(random() * 191) }),
  renderQuestionText: (p) => `Is ${p.candidate} a factor of ${p.target}? Answer Yes or No.`,
  deriveCorrectAnswer: (p) => (p.target % p.candidate === 0 ? "Yes" : "No"),
  deriveWorkedSteps: (p) => {
    const isFactor = p.target % p.candidate === 0;
    return isFactor
      ? [`${p.target} ÷ ${p.candidate} = ${p.target / p.candidate}, a whole number, so ${p.candidate} IS a factor of ${p.target}`]
      : [`${p.target} ÷ ${p.candidate} = ${(p.target / p.candidate).toFixed(2)}, not a whole number, so ${p.candidate} is NOT a factor of ${p.target}`];
  },
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "candidate/target resampled independently every candidate.",
  reasoningRoute: () => "comparison",
  contextTag: () => "number_theory",
  unknownPosition: () => "factor_verdict",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "independent_practice"],
};

type HcfParams = { a: number; b: number };
export const BP_HIGHEST_COMMON_FACTOR: StructuralBlueprint<HcfParams> = {
  blueprintId: "mr05-bp-highest-common-factor",
  familyId: "mr05-factors-primes",
  competencyId: "MR-05",
  questionTypeId: "QT-MR-11",
  mathematicalObjective: "Find the highest common factor of two numbers -- requires comparing factor sets across TWO numbers, a genuinely more complex demand than single-number factor counting.",
  parameterRanges: { a: { min: 4, max: 100 }, b: { min: 4, max: 100 } },
  constraints: (p) => p.a !== p.b && gcd(p.a, p.b) > 1,
  invalidCombinationDescription: "a must not equal b (a degenerate case); the pair must share a genuine common factor greater than 1 (coprime pairs are excluded -- their HCF of 1 is trivial and uninformative).",
  difficultyControls: (p) => {
    const hcf = gcd(p.a, p.b);
    return hcf >= 10 ? "easy" : hcf >= 4 ? "medium" : "hard";
  },
  difficultyDimensions: ["hcf_findability"],
  sampleParams: (random) => ({ a: 4 + Math.floor(random() * 97), b: 4 + Math.floor(random() * 97) }),
  renderQuestionText: (p) => `What is the highest common factor of ${p.a} and ${p.b}?`,
  deriveCorrectAnswer: (p) => String(gcd(p.a, p.b)),
  deriveWorkedSteps: (p) => [`Find the largest number that divides exactly into both ${p.a} and ${p.b}`, `HCF(${p.a}, ${p.b}) = ${gcd(p.a, p.b)}`],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "a/b resampled independently every candidate.",
  reasoningRoute: () => "multi_step_application",
  contextTag: () => "number_theory",
  unknownPosition: () => "hcf_value",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "transfer"],
};

type LcmParams = { a: number; b: number };
export const BP_LOWEST_COMMON_MULTIPLE: StructuralBlueprint<LcmParams> = {
  blueprintId: "mr05-bp-lowest-common-multiple",
  familyId: "mr05-factors-primes",
  competencyId: "MR-05",
  questionTypeId: "QT-MR-11",
  mathematicalObjective: "Find the lowest common multiple of two numbers -- the complementary operation to HCF, a distinct computation (multiplicative combination, not factor-set intersection).",
  parameterRanges: { a: { min: 2, max: 20 }, b: { min: 2, max: 20 } },
  constraints: (p) => p.a !== p.b && (p.a * p.b) / gcd(p.a, p.b) <= 500,
  invalidCombinationDescription: "a must not equal b; the resulting LCM must stay within a plausible magnitude.",
  difficultyControls: (p) => {
    const lcm = (p.a * p.b) / gcd(p.a, p.b);
    return lcm <= 40 ? "easy" : lcm <= 150 ? "medium" : "hard";
  },
  difficultyDimensions: ["lcm_magnitude"],
  sampleParams: (random) => ({ a: 2 + Math.floor(random() * 19), b: 2 + Math.floor(random() * 19) }),
  renderQuestionText: (p) => `What is the lowest common multiple of ${p.a} and ${p.b}?`,
  deriveCorrectAnswer: (p) => String((p.a * p.b) / gcd(p.a, p.b)),
  deriveWorkedSteps: (p) => [`HCF(${p.a}, ${p.b}) = ${gcd(p.a, p.b)}`, `LCM = (${p.a} × ${p.b}) ÷ ${gcd(p.a, p.b)} = ${(p.a * p.b) / gcd(p.a, p.b)}`],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "a/b resampled independently every candidate.",
  reasoningRoute: () => "multi_step_application",
  contextTag: () => "number_theory",
  unknownPosition: () => "lcm_value",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "transfer"],
};

type PrimeFactorCountParams = { n: number };
export const BP_COUNT_DISTINCT_PRIME_FACTORS: StructuralBlueprint<PrimeFactorCountParams> = {
  blueprintId: "mr05-bp-count-distinct-prime-factors",
  familyId: "mr05-factors-primes",
  competencyId: "MR-05",
  questionTypeId: "QT-MR-11",
  mathematicalObjective: "Count the number of DISTINCT prime factors of a number -- a different counting target from total factor count (e.g. 12 has 6 factors but only 2 distinct prime factors).",
  parameterRanges: { n: { min: 4, max: 200 } },
  constraints: (p) => countDistinctPrimeFactors(p.n) >= 1,
  invalidCombinationDescription: "None beyond the range itself -- every number >= 2 has at least one prime factor.",
  difficultyControls: (p) => {
    const count = countDistinctPrimeFactors(p.n);
    return count <= 1 ? "easy" : count === 2 ? "medium" : "hard";
  },
  difficultyDimensions: ["distinct_prime_factor_count"],
  sampleParams: (random) => ({ n: 4 + Math.floor(random() * 197) }),
  renderQuestionText: (p) => `How many DIFFERENT prime numbers divide exactly into ${p.n}?`,
  deriveCorrectAnswer: (p) => String(countDistinctPrimeFactors(p.n)),
  deriveWorkedSteps: (p) => {
    const primes: number[] = [];
    let remaining = p.n;
    for (let i = 2; i * i <= remaining; i++) {
      if (remaining % i === 0) {
        primes.push(i);
        while (remaining % i === 0) remaining /= i;
      }
    }
    if (remaining > 1) primes.push(remaining);
    return [`Break ${p.n} down into its prime factors: ${primes.join(" × ")}${primes.length > 1 ? " (with repeats removed)" : ""}`, `Distinct primes: ${primes.join(", ")} -- count: ${primes.length}`];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "n resampled independently every candidate.",
  reasoningRoute: () => "multi_step_application",
  contextTag: () => "number_theory",
  unknownPosition: () => "distinct_prime_factor_count",
  representationType: () => "prose",
  misconceptionTargeted: "confusing total factor count with distinct prime factor count",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["scaffolded_practice", "mastery_check"],
};

type ErrorFactorParams = { n: number; wrongOffset: number };
export const BP_ERROR_IDENTIFICATION_FACTORS: StructuralBlueprint<ErrorFactorParams> = {
  blueprintId: "mr05-bp-error-identification",
  familyId: "mr05-factors-primes",
  competencyId: "MR-05",
  questionTypeId: "QT-MR-11",
  mathematicalObjective: "Identify and correct an arbitrary error in someone else's factor count -- an error-identification demand distinct from counting from scratch.",
  parameterRanges: { n: { min: 6, max: 100 }, wrongOffset: { min: -2, max: 2 } },
  constraints: (p) => p.wrongOffset !== 0 && countFactors(p.n) + p.wrongOffset > 0,
  invalidCombinationDescription: "wrongOffset of exactly 0 is excluded (no error to identify); the resulting 'wrong' count must still be a positive, plausible number.",
  difficultyControls: (p) => {
    const count = countFactors(p.n);
    return count <= 4 ? "easy" : count <= 8 ? "medium" : "hard";
  },
  difficultyDimensions: ["factor_count"],
  sampleParams: (random) => ({
    n: 6 + Math.floor(random() * 95),
    wrongOffset: (() => { const m = 1 + Math.floor(random() * 2); return random() < 0.5 ? m : -m; })(),
  }),
  renderQuestionText: (p) => {
    const wrongCount = countFactors(p.n) + p.wrongOffset;
    return `A student says ${p.n} has ${wrongCount} factors. This is incorrect. How many factors does ${p.n} actually have?`;
  },
  deriveCorrectAnswer: (p) => String(countFactors(p.n)),
  deriveWorkedSteps: (p) => {
    const factors: number[] = [];
    for (let i = 1; i <= p.n; i++) if (p.n % i === 0) factors.push(i);
    return [`List every number that divides exactly into ${p.n}: ${factors.join(", ")}`, `Count them: ${factors.length}`];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "n/wrongOffset resampled independently every candidate.",
  reasoningRoute: () => "error_identification",
  contextTag: () => "number_theory",
  unknownPosition: () => "corrected_factor_count",
  representationType: () => "prose",
  misconceptionTargeted: "miscounting factors by missing one or double-counting a repeated divisor",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["explicit_teaching", "scaffolded_practice"],
};

export const MR05_FACTORS_PRIMES_FAMILY: EducationalFamily = {
  familyId: "mr05-factors-primes",
  subject: "maths",
  blueprints: [
    BP_COUNT_FACTORS,
    BP_IS_PRIME,
    BP_IS_FACTOR,
    BP_HIGHEST_COMMON_FACTOR,
    BP_LOWEST_COMMON_MULTIPLE,
    BP_COUNT_DISTINCT_PRIME_FACTORS,
    BP_ERROR_IDENTIFICATION_FACTORS,
  ] as EducationalFamily["blueprints"],
};
