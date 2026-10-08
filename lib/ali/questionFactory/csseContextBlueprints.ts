import type { StructuralBlueprint, EducationalFamily } from "./types";

/**
 * CSSE Completion, Priority 3 -- structural and contextual depth for three Maths families whose existing
 * blueprints are all in ONE context ("bare arithmetic", "number theory", "linear sequence") and ONE
 * representation (prose).
 *
 * Live baseline (2026-10-08): the generated items of mr01-whole-number-computation, mr02-nth-term and
 * mr05-factors-primes each carry a single contextTag. The existing blueprints are real, distinct DEMANDS
 * (count / is-prime / HCF / error identification ...) but they are all asked as bare computation. Exam-style
 * Maths asks the same skills inside a situation, where the child must first decide what to compute and then
 * interpret the number (round up to whole boxes, "next time together", "first week to reach a target").
 *
 * These blueprints add that, and each one is a structurally different demand, not a renumbered clone:
 *   - number theory in a situation (equal groups -> HCF, repeating events -> LCM, boundary condition, spotting
 *     the one prime among disguised composites);
 *   - sequences in a situation, including a first-to-exceed question and a "whole weeks" target that needs
 *     rounding up;
 *   - arithmetic that needs interpretation (boxes needed -> round up; change from a note).
 * The situation wording also varies inside a blueprint (a context index parameter), so the same structure is
 * met in more than one context.
 *
 * Governance: these are ADDITIVE blueprints for existing, live families (`familyId` unchanged); they do not
 * touch ali_question_bank. Output goes through the existing candidate-store route (submit -> human educational
 * review -> publish), applied by the Founder. Every answer is derived by a deterministic function and is
 * independently re-derived in tests/lib/ali/questionFactory/csseContextBlueprints.test.ts by brute force.
 */

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}
function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}
function smallestFactor(n: number): number {
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return i;
  return n;
}

// ---------------------------------------------------------------------------
// mr05-factors-primes (QT-MR-11, MR-05)
// ---------------------------------------------------------------------------

type EqualGroupsParams = { a: number; b: number; ctx: number };
const EQUAL_GROUPS_WORDING = [
  (p: EqualGroupsParams) => `A teacher has ${p.a} red counters and ${p.b} blue counters. She makes identical groups, each with the same number of red counters and the same number of blue counters, and uses every counter. What is the greatest number of groups she can make?`,
  (p: EqualGroupsParams) => `A class has ${p.a} boys and ${p.b} girls. The teacher splits everyone into identical teams, each with the same number of boys and the same number of girls, with nobody left out. What is the greatest number of teams she can make?`,
  (p: EqualGroupsParams) => `A shop has ${p.a} apples and ${p.b} oranges. They are packed into identical baskets, each with the same number of apples and the same number of oranges, with no fruit left over. What is the greatest number of baskets that can be filled?`,
];
const EQUAL_GROUPS_CONTEXT = ["equal_groups_counters", "equal_groups_class_teams", "equal_groups_fruit_baskets"];
export const BP_HCF_EQUAL_GROUPS: StructuralBlueprint<EqualGroupsParams> = {
  blueprintId: "mr05-bp-hcf-equal-groups",
  familyId: "mr05-factors-primes",
  competencyId: "MR-05",
  questionTypeId: "QT-MR-11",
  mathematicalObjective: "Recognise that sharing two quantities into identical groups with nothing left over asks for their highest common factor, and find it.",
  parameterRanges: { a: { min: 6, max: 120 }, b: { min: 6, max: 120 }, ctx: { min: 0, max: 2 } },
  constraints: (p) => p.a !== p.b && gcd(p.a, p.b) >= 3 && gcd(p.a, p.b) < Math.min(p.a, p.b),
  invalidCombinationDescription: "The two amounts differ, share a common factor of at least 3, and neither divides the other (so the answer is a genuine common factor, not simply the smaller number, and not the trivial 2).",
  // Difficulty comes from the size of the amounts the child must factorise, plus the situation to be translated.
  difficultyControls: (p) => (Math.max(p.a, p.b) <= 60 ? "easy" : Math.max(p.a, p.b) <= 100 ? "medium" : "hard"),
  difficultyDimensions: ["context_translation", "amount_magnitude"],
  // Sampled as g x m and g x n with m, n coprime, so the highest common factor is exactly g (3..12) -- never an accidental 1 or 2.
  sampleParams: (random) => {
    for (;;) {
      const g = 3 + Math.floor(random() * 10);
      const m = 2 + Math.floor(random() * 8);
      const n = 2 + Math.floor(random() * 8);
      if (m !== n && gcd(m, n) === 1) return { a: g * m, b: g * n, ctx: Math.floor(random() * 3) };
    }
  },
  renderQuestionText: (p) => EQUAL_GROUPS_WORDING[p.ctx](p),
  deriveCorrectAnswer: (p) => String(gcd(p.a, p.b)),
  deriveWorkedSteps: (p) => [
    `Every group has the same amount of each kind with none left over, so the number of groups must divide both ${p.a} and ${p.b} exactly.`,
    `The greatest number that divides both is the highest common factor: HCF(${p.a}, ${p.b}) = ${gcd(p.a, p.b)}.`,
  ],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "a/b resampled independently; the situation wording is rotated by ctx.",
  reasoningRoute: () => "interpretation",
  contextTag: (p) => EQUAL_GROUPS_CONTEXT[p.ctx],
  unknownPosition: () => "greatest_group_count",
  representationType: () => "prose",
  misconceptionTargeted: "using the smaller number, or the lowest common multiple, when the situation asks for the highest common factor",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["transfer", "guided_practice", "independent_practice"],
};

type RepeatingEventsParams = { a: number; b: number; ctx: number };
const REPEATING_WORDING = [
  (p: RepeatingEventsParams) => `Two buses leave the station together. One bus leaves every ${p.a} minutes and the other every ${p.b} minutes. After how many minutes will they next leave together?`,
  (p: RepeatingEventsParams) => `Two lights start flashing at the same moment. One flashes every ${p.a} seconds and the other every ${p.b} seconds. After how many seconds will they next flash together?`,
  (p: RepeatingEventsParams) => `Asha visits the library every ${p.a} days and Ben visits every ${p.b} days. They are both there today. After how many days will they next both be there?`,
];
const REPEATING_CONTEXT = ["repeating_events_buses", "repeating_events_lights", "repeating_events_library"];
export const BP_LCM_REPEATING_EVENTS: StructuralBlueprint<RepeatingEventsParams> = {
  blueprintId: "mr05-bp-lcm-repeating-events",
  familyId: "mr05-factors-primes",
  competencyId: "MR-05",
  questionTypeId: "QT-MR-11",
  mathematicalObjective: "Recognise that two repeating events coinciding again asks for the lowest common multiple, and find it.",
  parameterRanges: { a: { min: 3, max: 20 }, b: { min: 3, max: 20 }, ctx: { min: 0, max: 2 } },
  constraints: (p) => p.a !== p.b && p.a % p.b !== 0 && p.b % p.a !== 0 && lcm(p.a, p.b) <= 240,
  invalidCombinationDescription: "The two intervals differ and neither divides the other, so the answer is a genuine common multiple larger than both; the answer stays within a manageable size.",
  difficultyControls: (p) => (lcm(p.a, p.b) <= 40 ? "easy" : lcm(p.a, p.b) <= 120 ? "medium" : "hard"),
  difficultyDimensions: ["context_translation", "lcm_magnitude"],
  sampleParams: (random) => ({ a: 3 + Math.floor(random() * 18), b: 3 + Math.floor(random() * 18), ctx: Math.floor(random() * 3) }),
  renderQuestionText: (p) => REPEATING_WORDING[p.ctx](p),
  deriveCorrectAnswer: (p) => String(lcm(p.a, p.b)),
  deriveWorkedSteps: (p) => [
    `They coincide again at a time that is a multiple of both ${p.a} and ${p.b}; the first such time is the lowest common multiple.`,
    `HCF(${p.a}, ${p.b}) = ${gcd(p.a, p.b)}, so LCM = (${p.a} × ${p.b}) ÷ ${gcd(p.a, p.b)} = ${lcm(p.a, p.b)}.`,
  ],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "a/b resampled independently; the situation wording is rotated by ctx.",
  reasoningRoute: () => "interpretation",
  contextTag: (p) => REPEATING_CONTEXT[p.ctx],
  unknownPosition: () => "next_common_time",
  representationType: () => "prose",
  misconceptionTargeted: "multiplying the two intervals, or finding a common factor, instead of the lowest common multiple",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["transfer", "guided_practice", "independent_practice"],
};

type MultipleAboveParams = { a: number; b: number; k: number };
export const BP_SMALLEST_COMMON_MULTIPLE_ABOVE: StructuralBlueprint<MultipleAboveParams> = {
  blueprintId: "mr05-bp-smallest-common-multiple-above",
  familyId: "mr05-factors-primes",
  competencyId: "MR-05",
  questionTypeId: "QT-MR-11",
  mathematicalObjective: "Find the smallest number above a stated boundary that is a multiple of two given numbers -- the common multiple and the boundary condition must both be used.",
  parameterRanges: { a: { min: 2, max: 12 }, b: { min: 2, max: 12 }, k: { min: 20, max: 200 } },
  constraints: (p) => p.a !== p.b && p.a % p.b !== 0 && p.b % p.a !== 0 && lcm(p.a, p.b) <= 60 && p.k >= lcm(p.a, p.b),
  invalidCombinationDescription: "The numbers differ, neither divides the other, the LCM is at most 60 and the boundary is at least the LCM (so the boundary actually changes the answer).",
  difficultyControls: (p) => (lcm(p.a, p.b) <= 20 ? "medium" : "hard"),
  difficultyDimensions: ["lcm_magnitude", "boundary_condition"],
  sampleParams: (random) => ({ a: 2 + Math.floor(random() * 11), b: 2 + Math.floor(random() * 11), k: 20 + Math.floor(random() * 181) }),
  renderQuestionText: (p) => `What is the smallest number greater than ${p.k} that is a multiple of both ${p.a} and ${p.b}?`,
  deriveCorrectAnswer: (p) => String((Math.floor(p.k / lcm(p.a, p.b)) + 1) * lcm(p.a, p.b)),
  deriveWorkedSteps: (p) => {
    const l = lcm(p.a, p.b);
    return [
      `A multiple of both ${p.a} and ${p.b} is a multiple of their lowest common multiple, ${l}.`,
      `The multiples of ${l} go up in steps of ${l}; find the first one that is greater than ${p.k}: ${(Math.floor(p.k / l) + 1) * l}.`,
    ];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "a/b/k resampled independently every candidate.",
  reasoningRoute: () => "multi_step_application",
  contextTag: () => "common_multiple_with_boundary",
  unknownPosition: () => "smallest_multiple_above_boundary",
  representationType: () => "prose",
  misconceptionTargeted: "stopping at the lowest common multiple and ignoring the boundary condition",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "independent_practice", "transfer"],
};

// A fixed, reviewable pool: primes that are not tiny, and composites that LOOK prime (smallest factor varies).
const PRIME_POOL = [53, 59, 61, 67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113];
const DISGUISED_COMPOSITE_POOL = [51, 57, 63, 69, 77, 87, 91, 93, 111, 119, 121, 123, 133, 143, 147, 169, 187, 209];
type IdentifyPrimeParams = { p: number; c1: number; c2: number; c3: number; pos: number };
export const BP_IDENTIFY_THE_PRIME: StructuralBlueprint<IdentifyPrimeParams> = {
  blueprintId: "mr05-bp-identify-the-prime",
  familyId: "mr05-factors-primes",
  competencyId: "MR-05",
  questionTypeId: "QT-MR-11",
  mathematicalObjective: "Pick out the one prime number from a list of four where the other three are composite numbers that look prime -- requires testing each number, not recognising a pattern.",
  parameterRanges: {
    p: { min: 0, max: PRIME_POOL.length - 1 },
    c1: { min: 0, max: DISGUISED_COMPOSITE_POOL.length - 1 },
    c2: { min: 0, max: DISGUISED_COMPOSITE_POOL.length - 1 },
    c3: { min: 0, max: DISGUISED_COMPOSITE_POOL.length - 1 },
    pos: { min: 0, max: 3 },
  },
  constraints: (q) => new Set([q.c1, q.c2, q.c3]).size === 3,
  invalidCombinationDescription: "The three composite numbers are three different entries of the disguised-composite pool.",
  difficultyControls: (q) => {
    const hard = [q.c1, q.c2, q.c3].filter((i) => smallestFactor(DISGUISED_COMPOSITE_POOL[i]) >= 7).length;
    return hard >= 2 ? "hard" : "medium";
  },
  difficultyDimensions: ["composite_disguise"],
  sampleParams: (random) => ({
    p: Math.floor(random() * PRIME_POOL.length),
    c1: Math.floor(random() * DISGUISED_COMPOSITE_POOL.length),
    c2: Math.floor(random() * DISGUISED_COMPOSITE_POOL.length),
    c3: Math.floor(random() * DISGUISED_COMPOSITE_POOL.length),
    pos: Math.floor(random() * 4),
  }),
  renderQuestionText: (q) => {
    const composites = [DISGUISED_COMPOSITE_POOL[q.c1], DISGUISED_COMPOSITE_POOL[q.c2], DISGUISED_COMPOSITE_POOL[q.c3]];
    const list = composites.slice();
    list.splice(q.pos, 0, PRIME_POOL[q.p]);
    return `Exactly one of these four numbers is prime: ${list.join(", ")}. Which one?`;
  },
  deriveCorrectAnswer: (q) => String(PRIME_POOL[q.p]),
  deriveWorkedSteps: (q) => {
    const composites = [DISGUISED_COMPOSITE_POOL[q.c1], DISGUISED_COMPOSITE_POOL[q.c2], DISGUISED_COMPOSITE_POOL[q.c3]];
    return [
      ...composites.map((c) => `${c} = ${smallestFactor(c)} × ${c / smallestFactor(c)}, so ${c} is not prime.`),
      `${PRIME_POOL[q.p]} has no factor other than 1 and itself, so it is the prime number.`,
    ];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "prime and the three composites drawn independently from reviewed pools; position of the prime varies.",
  reasoningRoute: () => "comparison",
  contextTag: () => "classify_from_list",
  unknownPosition: () => "identify_the_prime",
  representationType: () => "prose",
  misconceptionTargeted: "assuming an odd number that is not in a times table is prime (for example 51, 57, 91)",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "independent_practice", "mastery_check"],
};

export const MR05_CONTEXT_EXPANSION: EducationalFamily = {
  familyId: "mr05-factors-primes",
  subject: "maths",
  blueprints: [BP_HCF_EQUAL_GROUPS, BP_LCM_REPEATING_EVENTS, BP_SMALLEST_COMMON_MULTIPLE_ABOVE, BP_IDENTIFY_THE_PRIME] as EducationalFamily["blueprints"],
};

// ---------------------------------------------------------------------------
// mr02-nth-term (QT-MR-05, MR-02)
// ---------------------------------------------------------------------------

type PatternParams = { a: number; d: number; n: number; ctx: number };
const PATTERN_WORDING = [
  (p: PatternParams) => `Pattern 1 in a matchstick design uses ${p.a} matchsticks. Each new pattern uses ${p.d} more matchsticks than the one before. How many matchsticks does pattern ${p.n} use?`,
  (p: PatternParams) => `The first path is made from ${p.a} tiles. Each longer path uses ${p.d} more tiles than the last. How many tiles are in path number ${p.n}?`,
  (p: PatternParams) => `Row 1 of a hall has ${p.a} chairs. Each row behind it has ${p.d} more chairs than the row in front. How many chairs are in row ${p.n}?`,
];
const PATTERN_CONTEXT = ["pattern_matchsticks", "pattern_tile_paths", "pattern_chair_rows"];
export const BP_PATTERN_IN_CONTEXT: StructuralBlueprint<PatternParams> = {
  blueprintId: "mr02-bp-pattern-in-context",
  familyId: "mr02-nth-term",
  competencyId: "MR-02",
  questionTypeId: "QT-MR-05",
  mathematicalObjective: "Use the 'first term plus (n - 1) steps' rule on a growing physical pattern, recognising that the first pattern has no extra steps added.",
  parameterRanges: { a: { min: 3, max: 15 }, d: { min: 2, max: 7 }, n: { min: 8, max: 40 }, ctx: { min: 0, max: 2 } },
  constraints: () => true,
  invalidCombinationDescription: "None -- every combination gives a whole-number answer.",
  difficultyControls: (p) => (p.n <= 15 ? "medium" : "hard"),
  difficultyDimensions: ["context_translation", "position_magnitude"],
  sampleParams: (random) => ({ a: 3 + Math.floor(random() * 13), d: 2 + Math.floor(random() * 6), n: 8 + Math.floor(random() * 33), ctx: Math.floor(random() * 3) }),
  renderQuestionText: (p) => PATTERN_WORDING[p.ctx](p),
  deriveCorrectAnswer: (p) => String(p.a + (p.n - 1) * p.d),
  deriveWorkedSteps: (p) => [
    `Pattern 1 already has ${p.a}. To reach pattern ${p.n}, ${p.n - 1} lots of ${p.d} are added.`,
    `${p.a} + ${p.n - 1} × ${p.d} = ${p.a + (p.n - 1) * p.d}.`,
  ],
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "a/d/n resampled independently; situation wording rotated by ctx.",
  reasoningRoute: () => "interpretation",
  contextTag: (p) => PATTERN_CONTEXT[p.ctx],
  unknownPosition: () => "pattern_value",
  representationType: () => "prose",
  misconceptionTargeted: "adding n lots of the step instead of n - 1, forgetting that the first pattern is already counted",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
};

type FirstExceedParams = { a: number; d: number; t: number };
export const BP_FIRST_TERM_EXCEEDING: StructuralBlueprint<FirstExceedParams> = {
  blueprintId: "mr02-bp-first-term-exceeding",
  familyId: "mr02-nth-term",
  competencyId: "MR-02",
  questionTypeId: "QT-MR-05",
  mathematicalObjective: "Find the first term of an increasing sequence that is greater than a target -- a threshold question, not a 'find term n' or 'is it in the sequence' question.",
  parameterRanges: { a: { min: 2, max: 20 }, d: { min: 3, max: 9 }, t: { min: 40, max: 200 } },
  constraints: (p) => p.t >= p.a + 3 * p.d && (p.t - p.a) % p.d !== 0,
  invalidCombinationDescription: "The target is at least three steps beyond the first term and is not itself a term of the sequence (so the 'greater than' boundary is not ambiguous).",
  difficultyControls: (p) => ((p.t - p.a) / p.d <= 12 ? "medium" : "hard"),
  difficultyDimensions: ["threshold_distance"],
  sampleParams: (random) => ({ a: 2 + Math.floor(random() * 19), d: 3 + Math.floor(random() * 7), t: 40 + Math.floor(random() * 161) }),
  renderQuestionText: (p) => `A sequence starts at ${p.a} and goes up by ${p.d} each time: ${p.a}, ${p.a + p.d}, ${p.a + 2 * p.d}, ... What is the first term in the sequence that is greater than ${p.t}?`,
  deriveCorrectAnswer: (p) => String(p.a + (Math.floor((p.t - p.a) / p.d) + 1) * p.d),
  deriveWorkedSteps: (p) => {
    const steps = Math.floor((p.t - p.a) / p.d) + 1;
    return [
      `From ${p.a}, count how many steps of ${p.d} are needed to pass ${p.t}: (${p.t} − ${p.a}) ÷ ${p.d} = ${(p.t - p.a) / p.d}, so ${steps} steps are needed.`,
      `${p.a} + ${steps} × ${p.d} = ${p.a + steps * p.d}.`,
    ];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "a/d/t resampled independently every candidate.",
  reasoningRoute: () => "multi_step_application",
  contextTag: () => "linear_sequence_threshold",
  unknownPosition: () => "first_term_above_target",
  representationType: () => "prose",
  misconceptionTargeted: "returning the last term below the target, or the target itself, instead of the first term above it",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "independent_practice", "transfer"],
};

type TargetWeeksParams = { s: number; w: number; t: number; ctx: number };
const TARGET_WORDING = [
  (p: TargetWeeksParams) => `Mia has £${p.s} saved. She adds £${p.w} every week. After how many whole weeks will she first have at least £${p.t}?`,
  (p: TargetWeeksParams) => `A book has ${p.t} pages. Sam has read ${p.s} pages and reads ${p.w} more pages each day. After how many whole days will he first have read at least ${p.t} pages?`,
  (p: TargetWeeksParams) => `A plant is ${p.s} cm tall and grows ${p.w} cm every week. After how many whole weeks will it first be at least ${p.t} cm tall?`,
];
const TARGET_CONTEXT = ["target_savings", "target_reading", "target_plant_growth"];
export const BP_WHOLE_PERIODS_TO_TARGET: StructuralBlueprint<TargetWeeksParams> = {
  blueprintId: "mr02-bp-whole-periods-to-target",
  familyId: "mr02-nth-term",
  competencyId: "MR-02",
  questionTypeId: "QT-MR-05",
  mathematicalObjective: "Use a repeated-addition rule to find how many whole periods are needed to reach a target, where the division does not come out exactly and the answer must be rounded UP.",
  parameterRanges: { s: { min: 5, max: 40 }, w: { min: 3, max: 12 }, t: { min: 60, max: 200 }, ctx: { min: 0, max: 2 } },
  constraints: (p) => p.t - p.s >= 3 * p.w && (p.t - p.s) % p.w !== 0,
  invalidCombinationDescription: "The target is at least three periods away and the amount still needed is not an exact multiple of the weekly step, so rounding up matters.",
  difficultyControls: (p) => (Math.ceil((p.t - p.s) / p.w) <= 8 ? "medium" : "hard"),
  difficultyDimensions: ["context_translation", "rounding_up_interpretation"],
  sampleParams: (random) => ({ s: 5 + Math.floor(random() * 36), w: 3 + Math.floor(random() * 10), t: 60 + Math.floor(random() * 141), ctx: Math.floor(random() * 3) }),
  renderQuestionText: (p) => TARGET_WORDING[p.ctx](p),
  deriveCorrectAnswer: (p) => String(Math.ceil((p.t - p.s) / p.w)),
  deriveWorkedSteps: (p) => [
    `Amount still needed: ${p.t} − ${p.s} = ${p.t - p.s}.`,
    `${p.t - p.s} ÷ ${p.w} = ${((p.t - p.s) / p.w).toFixed(2)}, which is not a whole number, so round UP to ${Math.ceil((p.t - p.s) / p.w)} (after only ${Math.floor((p.t - p.s) / p.w)} whole periods the target has not yet been reached).`,
  ],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "s/w/t resampled independently; situation wording rotated by ctx.",
  reasoningRoute: () => "interpretation",
  contextTag: (p) => TARGET_CONTEXT[p.ctx],
  unknownPosition: () => "whole_periods_to_target",
  representationType: () => "prose",
  misconceptionTargeted: "rounding the division down (or to the nearest whole number), so the target has not actually been reached",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["transfer", "guided_practice", "independent_practice"],
};

export const MR02_CONTEXT_EXPANSION: EducationalFamily = {
  familyId: "mr02-nth-term",
  subject: "maths",
  blueprints: [BP_PATTERN_IN_CONTEXT, BP_FIRST_TERM_EXCEEDING, BP_WHOLE_PERIODS_TO_TARGET] as EducationalFamily["blueprints"],
};

// ---------------------------------------------------------------------------
// mr01-whole-number-computation (QT-MR-01, MR-01)
// ---------------------------------------------------------------------------

type BoxesParams = { total: number; per: number; ctx: number };
const BOXES_WORDING = [
  (p: BoxesParams) => `A bakery has ${p.total} biscuits to pack. Each box holds ${p.per} biscuits. How many boxes are needed to pack all of the biscuits?`,
  (p: BoxesParams) => `A school trip has ${p.total} people. Each minibus carries ${p.per} people. How many minibuses are needed so that everyone has a seat?`,
  (p: BoxesParams) => `A farm collects ${p.total} eggs. Each tray holds ${p.per} eggs. How many trays are needed to hold all of the eggs?`,
];
const BOXES_CONTEXT = ["containers_biscuits", "containers_minibuses", "containers_egg_trays"];
export const BP_CONTAINERS_NEEDED: StructuralBlueprint<BoxesParams> = {
  blueprintId: "mr01-bp-containers-needed",
  familyId: "mr01-whole-number-computation",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-01",
  mathematicalObjective: "Divide and then interpret the remainder in context: a part-filled container is still needed, so the answer is the quotient plus one.",
  parameterRanges: { total: { min: 40, max: 400 }, per: { min: 6, max: 24 }, ctx: { min: 0, max: 2 } },
  constraints: (p) => p.total % p.per !== 0 && Math.floor(p.total / p.per) >= 3,
  invalidCombinationDescription: "The total is not an exact multiple of the container size (so a remainder must be interpreted) and at least three full containers are needed.",
  difficultyControls: (p) => (p.per <= 12 ? "medium" : "hard"),
  difficultyDimensions: ["context_translation", "remainder_interpretation"],
  sampleParams: (random) => ({ total: 40 + Math.floor(random() * 361), per: 6 + Math.floor(random() * 19), ctx: Math.floor(random() * 3) }),
  renderQuestionText: (p) => BOXES_WORDING[p.ctx](p),
  deriveCorrectAnswer: (p) => String(Math.floor(p.total / p.per) + 1),
  deriveWorkedSteps: (p) => [
    `${p.total} ÷ ${p.per} = ${Math.floor(p.total / p.per)} remainder ${p.total % p.per}.`,
    `${Math.floor(p.total / p.per)} full containers hold ${Math.floor(p.total / p.per) * p.per}; the ${p.total % p.per} left over still need one more container, so ${Math.floor(p.total / p.per) + 1} are needed.`,
  ],
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "total/per resampled independently; situation wording rotated by ctx.",
  reasoningRoute: () => "interpretation",
  contextTag: (p) => BOXES_CONTEXT[p.ctx],
  unknownPosition: () => "containers_needed",
  representationType: () => "prose",
  misconceptionTargeted: "giving the whole-number quotient and ignoring the remainder, so some items have no container",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
};

type ChangeParams = { q: number; price: number; note: number; ctx: number };
const CHANGE_BUYERS: [string, string][] = [
  ["Sam", "notebooks"],
  ["Priya", "packs of stickers"],
  ["Leo", "model kits"],
  ["Aisha", "rulers"],
];
const CHANGE_CONTEXT = ["shopping_notebooks", "shopping_stickers", "shopping_model_kits", "shopping_rulers"];
export const BP_CHANGE_FROM_NOTE: StructuralBlueprint<ChangeParams> = {
  blueprintId: "mr01-bp-change-from-note",
  familyId: "mr01-whole-number-computation",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-01",
  mathematicalObjective: "Multiply to find a total cost, then subtract it from the amount paid -- two operations whose order is set by the situation.",
  parameterRanges: { q: { min: 3, max: 15 }, price: { min: 2, max: 15 }, note: { min: 20, max: 50 }, ctx: { min: 0, max: 3 } },
  constraints: (p) => (p.note === 20 || p.note === 50) && p.q * p.price < p.note && p.q * p.price >= p.note * 0.4,
  invalidCombinationDescription: "Paid with a £20 or £50 note; the total is less than the note (so there is change) and at least 40% of it (so the change is not trivially large).",
  difficultyControls: (p) => (p.q * p.price <= 30 ? "medium" : "hard"),
  difficultyDimensions: ["two_step_order"],
  sampleParams: (random) => ({ q: 3 + Math.floor(random() * 13), price: 2 + Math.floor(random() * 14), note: random() < 0.5 ? 20 : 50, ctx: Math.floor(random() * 4) }),
  renderQuestionText: (p) => `${CHANGE_BUYERS[p.ctx][0]} buys ${p.q} ${CHANGE_BUYERS[p.ctx][1]} that cost £${p.price} each. They pay with a £${p.note} note. How many pounds change do they get?`,
  deriveCorrectAnswer: (p) => String(p.note - p.q * p.price),
  deriveWorkedSteps: (p) => [
    `Total cost: ${p.q} × £${p.price} = £${p.q * p.price}.`,
    `Change: £${p.note} − £${p.q * p.price} = £${p.note - p.q * p.price}.`,
  ],
  stageSuitability: ["FOUNDATION", "DEVELOPMENT"],
  similarityControls: "q/price/note resampled independently; the buyer and item are rotated by ctx.",
  reasoningRoute: () => "multi_step_application",
  contextTag: (p) => CHANGE_CONTEXT[p.ctx],
  unknownPosition: () => "change_received",
  representationType: () => "prose",
  misconceptionTargeted: "subtracting the price of one item from the note instead of the total cost",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
};

type SpendThenShareParams = { total: number; spend: number; k: number; ctx: number };
const SPEND_SHARE_WORDING = [
  (p: SpendThenShareParams) => `A school fair raises £${p.total}. £${p.spend} is spent on prizes and the rest is shared equally between ${p.k} classes. How many pounds does each class receive?`,
  (p: SpendThenShareParams) => `A club has £${p.total} in its fund. It pays £${p.spend} for a hall hire and shares the money left equally among ${p.k} teams. How many pounds does each team get?`,
  (p: SpendThenShareParams) => `Some friends collect £${p.total} for a present. They spend £${p.spend} on the present and share what is left equally between ${p.k} charities. How many pounds does each charity receive?`,
];
const SPEND_SHARE_CONTEXT = ["spend_then_share_fair", "spend_then_share_club", "spend_then_share_friends"];
export const BP_SPEND_THEN_SHARE: StructuralBlueprint<SpendThenShareParams> = {
  blueprintId: "mr01-bp-spend-then-share",
  familyId: "mr01-whole-number-computation",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-01",
  mathematicalObjective: "Subtract an amount that is spent, then divide what remains equally -- the order (subtract, then divide) is set by the situation and the shared amount is the one asked for.",
  parameterRanges: { total: { min: 100, max: 600 }, spend: { min: 20, max: 200 }, k: { min: 3, max: 9 }, ctx: { min: 0, max: 2 } },
  constraints: (p) => p.total - p.spend >= p.k * 5 && (p.total - p.spend) % p.k === 0,
  invalidCombinationDescription: "What is left after spending divides exactly between the groups and gives each group at least £5.",
  difficultyControls: (p) => ((p.total - p.spend) / p.k <= 40 ? "medium" : "hard"),
  difficultyDimensions: ["two_step_order", "context_translation"],
  sampleParams: (random) => ({ total: 100 + Math.floor(random() * 501), spend: 20 + Math.floor(random() * 181), k: 3 + Math.floor(random() * 7), ctx: Math.floor(random() * 3) }),
  renderQuestionText: (p) => SPEND_SHARE_WORDING[p.ctx](p),
  deriveCorrectAnswer: (p) => String((p.total - p.spend) / p.k),
  deriveWorkedSteps: (p) => [
    `Money left after spending: £${p.total} − £${p.spend} = £${p.total - p.spend}.`,
    `Share equally: £${p.total - p.spend} ÷ ${p.k} = £${(p.total - p.spend) / p.k}.`,
  ],
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "total/spend/k resampled independently; situation wording rotated by ctx.",
  reasoningRoute: () => "multi_step_application",
  contextTag: (p) => SPEND_SHARE_CONTEXT[p.ctx],
  unknownPosition: () => "share_after_spending",
  representationType: () => "prose",
  misconceptionTargeted: "dividing the whole amount by the number of groups and forgetting to take away what was spent first",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "independent_practice", "transfer"],
};

export const MR01_CONTEXT_EXPANSION: EducationalFamily = {
  familyId: "mr01-whole-number-computation",
  subject: "maths",
  blueprints: [BP_CONTAINERS_NEEDED, BP_CHANGE_FROM_NOTE, BP_SPEND_THEN_SHARE] as EducationalFamily["blueprints"],
};

export const CSSE_CONTEXT_EXPANSION_FAMILIES: EducationalFamily[] = [MR05_CONTEXT_EXPANSION, MR02_CONTEXT_EXPANSION, MR01_CONTEXT_EXPANSION];
