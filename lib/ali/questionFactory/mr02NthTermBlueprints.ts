import type { StructuralBlueprint, EducationalFamily } from "./types";

/**
 * Controlled Content Manufacturing Wave 1 — mr02-nth-term.
 *
 * Real, existing production content (5 practice-eligible rows, read live)
 * is exclusively "sequence begins a, a+d, a+2d, ...; find the Nth term"
 * -- a single direct-computation structure. These blueprints keep that
 * genuine structure as ONE blueprint and add six further, genuinely
 * distinct reasoning demands over the SAME underlying nth-term relationship
 * (a + (n-1)d), never changing the competency (MR-02/QT-MR-05) merely to
 * inflate the count.
 */

function seq3(a: number, d: number): string {
  return `${a}, ${a + d}, ${a + 2 * d}`;
}

type DirectParams = { a: number; d: number; n: number };
export const BP_NTH_TERM_DIRECT: StructuralBlueprint<DirectParams> = {
  blueprintId: "mr02-bp-nth-term-direct",
  familyId: "mr02-nth-term",
  competencyId: "MR-02",
  questionTypeId: "QT-MR-05",
  mathematicalObjective: "Identify the common difference of a linear sequence from its first terms and apply the nth-term rule a + (n-1)d to find a specified term.",
  parameterRanges: { a: { min: 1, max: 100 }, d: { min: -10, max: 10 }, n: { min: 5, max: 30 } },
  constraints: (p) => p.d !== 0 && p.a + (p.n - 1) * p.d >= -500 && p.a + (p.n - 1) * p.d <= 2000,
  invalidCombinationDescription: "d=0 excluded (not a genuine sequence); the resulting nth term must stay within a plausible magnitude.",
  difficultyControls: (p) => (p.n <= 10 ? "easy" : p.n <= 20 ? "medium" : "hard"),
  difficultyDimensions: ["term_number_magnitude"],
  sampleParams: (random) => ({
    a: 1 + Math.floor(random() * 100),
    d: (() => { const m = 1 + Math.floor(random() * 10); return random() < 0.5 ? m : -m; })(),
    n: 5 + Math.floor(random() * 26),
  }),
  renderQuestionText: (p) => `A sequence begins ${seq3(p.a, p.d)}, ... and continues with the same pattern. What is the ${p.n}th term?`,
  deriveCorrectAnswer: (p) => String(p.a + (p.n - 1) * p.d),
  deriveWorkedSteps: (p) => [
    `Find the common difference between terms: ${p.d}`,
    "The nth term is the first term plus (n − 1) lots of the difference",
    `${p.a} + (${p.n} − 1) × ${p.d} = ${p.a + (p.n - 1) * p.d}`,
  ],
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "a/d/n resampled independently every candidate.",
  reasoningRoute: () => "multi_step_application",
  contextTag: () => "linear_sequence",
  unknownPosition: () => "nth_term_value",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
};

type FindDiffParams = { a: number; termN: number; n: number };
export const BP_FIND_COMMON_DIFFERENCE: StructuralBlueprint<FindDiffParams> = {
  blueprintId: "mr02-bp-find-common-difference",
  familyId: "mr02-nth-term",
  competencyId: "MR-02",
  questionTypeId: "QT-MR-05",
  mathematicalObjective: "Given the first term and a later term's value and position, work backwards to find the common difference -- an algebraic rearrangement of the same nth-term relationship.",
  parameterRanges: { a: { min: 1, max: 50 }, termN: { min: -300, max: 500 }, n: { min: 4, max: 20 } },
  constraints: (p) => (p.termN - p.a) % (p.n - 1) === 0 && (p.termN - p.a) / (p.n - 1) !== 0,
  invalidCombinationDescription: "The value/position pair must yield a clean integer common difference; a difference of exactly 0 is excluded (not a genuine sequence).",
  difficultyControls: (p) => (p.n <= 8 ? "easy" : p.n <= 15 ? "medium" : "hard"),
  difficultyDimensions: ["term_number_magnitude"],
  sampleParams: (random) => {
    const a = 1 + Math.floor(random() * 50);
    const n = 4 + Math.floor(random() * 17);
    const d = (() => { const m = 1 + Math.floor(random() * 12); return random() < 0.5 ? m : -m; })();
    return { a, n, termN: a + (n - 1) * d };
  },
  renderQuestionText: (p) => `A sequence has first term ${p.a}. Its ${p.n}th term is ${p.termN}. What is the common difference?`,
  deriveCorrectAnswer: (p) => String((p.termN - p.a) / (p.n - 1)),
  deriveWorkedSteps: (p) => [
    `${p.termN} − ${p.a} = ${p.termN - p.a} (the total change across ${p.n - 1} steps)`,
    `${p.termN - p.a} ÷ ${p.n - 1} = ${(p.termN - p.a) / (p.n - 1)}`,
  ],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "a/n resampled independently; termN is derived from a valid (a, d, n) triple, never independently sampled, guaranteeing a clean integer answer.",
  reasoningRoute: () => "reverse_reasoning",
  contextTag: () => "linear_sequence",
  unknownPosition: () => "common_difference",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "transfer"],
};

type FindFirstTermParams = { d: number; termN: number; n: number };
export const BP_FIND_FIRST_TERM: StructuralBlueprint<FindFirstTermParams> = {
  blueprintId: "mr02-bp-find-first-term",
  familyId: "mr02-nth-term",
  competencyId: "MR-02",
  questionTypeId: "QT-MR-05",
  mathematicalObjective: "Given the common difference and a later term's value and position, work backwards to find the first term -- a different algebraic rearrangement from BP_FIND_COMMON_DIFFERENCE.",
  parameterRanges: { d: { min: -10, max: 10 }, termN: { min: -500, max: 500 }, n: { min: 4, max: 20 } },
  constraints: (p) => p.d !== 0,
  invalidCombinationDescription: "d=0 excluded (not a genuine sequence).",
  difficultyControls: (p) => (p.n <= 8 ? "easy" : p.n <= 15 ? "medium" : "hard"),
  difficultyDimensions: ["term_number_magnitude"],
  sampleParams: (random) => ({
    d: (() => { const m = 1 + Math.floor(random() * 10); return random() < 0.5 ? m : -m; })(),
    n: 4 + Math.floor(random() * 17),
    termN: -100 + Math.floor(random() * 601),
  }),
  renderQuestionText: (p) => `A sequence has common difference ${p.d}. Its ${p.n}th term is ${p.termN}. What is the first term?`,
  deriveCorrectAnswer: (p) => String(p.termN - (p.n - 1) * p.d),
  deriveWorkedSteps: (p) => [
    `(${p.n} − 1) × ${p.d} = ${(p.n - 1) * p.d}`,
    `${p.termN} − ${(p.n - 1) * p.d} = ${p.termN - (p.n - 1) * p.d}`,
  ],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "d/n/termN resampled independently every candidate.",
  reasoningRoute: () => "reverse_reasoning",
  contextTag: () => "linear_sequence",
  unknownPosition: () => "first_term",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "transfer"],
};

type FindTermPositionParams = { a: number; d: number; targetValue: number };
export const BP_FIND_TERM_POSITION: StructuralBlueprint<FindTermPositionParams> = {
  blueprintId: "mr02-bp-find-term-position",
  familyId: "mr02-nth-term",
  competencyId: "MR-02",
  questionTypeId: "QT-MR-05",
  mathematicalObjective: "Given a sequence and a target value known to be a member, find which term number it occupies -- solving the nth-term relationship for n, a third distinct unknown position.",
  parameterRanges: { a: { min: 1, max: 50 }, d: { min: 1, max: 10 }, targetValue: { min: 10, max: 1000 } },
  constraints: (p) => p.targetValue > p.a && (p.targetValue - p.a) % p.d === 0,
  invalidCombinationDescription: "targetValue must be strictly greater than the first term and reachable by a clean integer number of steps -- guarantees the target genuinely IS a term of the sequence.",
  difficultyControls: (p) => {
    const n = (p.targetValue - p.a) / p.d + 1;
    return n <= 10 ? "easy" : n <= 20 ? "medium" : "hard";
  },
  difficultyDimensions: ["term_number_magnitude"],
  sampleParams: (random) => {
    const a = 1 + Math.floor(random() * 50);
    const d = 1 + Math.floor(random() * 10);
    const n = 3 + Math.floor(random() * 25);
    return { a, d, targetValue: a + (n - 1) * d };
  },
  renderQuestionText: (p) => `A sequence begins ${seq3(p.a, p.d)}, ... and continues with the same pattern. Which term of the sequence has the value ${p.targetValue}?`,
  deriveCorrectAnswer: (p) => String((p.targetValue - p.a) / p.d + 1),
  deriveWorkedSteps: (p) => [
    `${p.targetValue} − ${p.a} = ${p.targetValue - p.a} (the total change from the first term)`,
    `${p.targetValue - p.a} ÷ ${p.d} = ${(p.targetValue - p.a) / p.d} steps`,
    `${(p.targetValue - p.a) / p.d} + 1 = ${(p.targetValue - p.a) / p.d + 1}`,
  ],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "a/d resampled independently; targetValue derived from a genuine (a,d,n) triple, never independently sampled.",
  reasoningRoute: () => "reverse_reasoning",
  contextTag: () => "linear_sequence",
  unknownPosition: () => "term_position",
  representationType: () => "prose",
  misconceptionTargeted: "forgetting to add 1 after dividing the total change by the common difference (an off-by-one error)",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["scaffolded_practice", "mastery_check"],
};

type VerifyMembershipParams = { a: number; d: number; candidateValue: number; offset: number };
export const BP_VERIFY_MEMBERSHIP: StructuralBlueprint<VerifyMembershipParams> = {
  blueprintId: "mr02-bp-verify-membership",
  familyId: "mr02-nth-term",
  competencyId: "MR-02",
  questionTypeId: "QT-MR-05",
  mathematicalObjective: "Determine whether a given value ever appears in a sequence -- a verification/checking demand distinct from computing a specific term.",
  parameterRanges: { a: { min: 1, max: 50 }, d: { min: 2, max: 10 }, candidateValue: { min: 1, max: 500 }, offset: { min: 0, max: 1 } },
  constraints: () => true,
  invalidCombinationDescription: "None -- both a genuine member and a genuine non-member are valid, deliberately testable candidates.",
  difficultyControls: (p) => (p.candidateValue <= 100 ? "easy" : p.candidateValue <= 300 ? "medium" : "hard"),
  difficultyDimensions: ["candidate_value_magnitude"],
  sampleParams: (random) => {
    const a = 1 + Math.floor(random() * 50);
    const d = 2 + Math.floor(random() * 9);
    const n = 2 + Math.floor(random() * 20);
    const isMember = random() < 0.5;
    const candidateValue = isMember ? a + (n - 1) * d : a + (n - 1) * d + 1; // +1 guarantees a genuine non-member (never divisible by d from a, since offset by exactly 1)
    return { a, d, candidateValue, offset: isMember ? 0 : 1 };
  },
  renderQuestionText: (p) => `A sequence begins ${seq3(p.a, p.d)}, ... and continues with the same pattern. Is ${p.candidateValue} a term of this sequence? Answer Yes or No.`,
  deriveCorrectAnswer: (p) => ((p.candidateValue - p.a) >= 0 && (p.candidateValue - p.a) % p.d === 0 ? "Yes" : "No"),
  deriveWorkedSteps: (p) => {
    const diff = p.candidateValue - p.a;
    const isMember = diff >= 0 && diff % p.d === 0;
    return [
      `${p.candidateValue} − ${p.a} = ${diff}`,
      isMember ? `${diff} ÷ ${p.d} = ${diff / p.d}, a whole number, so ${p.candidateValue} IS a term` : `${diff} does not divide exactly by ${p.d}, so ${p.candidateValue} is NOT a term`,
    ];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "a/d resampled independently; candidateValue is deliberately constructed to be a genuine member or a genuine near-miss non-member, never an arbitrary random number.",
  reasoningRoute: () => "comparison",
  contextTag: () => "linear_sequence",
  unknownPosition: () => "membership_verdict",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["independent_practice", "mastery_check"],
};

type CompareParams = { a1: number; d1: number; a2: number; d2: number; n: number };
export const BP_COMPARE_TWO_SEQUENCES: StructuralBlueprint<CompareParams> = {
  blueprintId: "mr02-bp-compare-two-sequences",
  familyId: "mr02-nth-term",
  competencyId: "MR-02",
  questionTypeId: "QT-MR-05",
  mathematicalObjective: "Compute the same specified term for TWO separate sequences and compare them -- a genuinely different demand from finding one sequence's term.",
  parameterRanges: { a1: { min: 1, max: 50 }, d1: { min: 1, max: 10 }, a2: { min: 1, max: 50 }, d2: { min: 1, max: 10 }, n: { min: 5, max: 15 } },
  constraints: (p) => p.a1 + (p.n - 1) * p.d1 !== p.a2 + (p.n - 1) * p.d2,
  invalidCombinationDescription: "The two sequences' specified terms are excluded from being exactly equal -- a genuine comparison requires a real, non-tied difference.",
  difficultyControls: (p) => {
    const gap = Math.abs((p.a1 + (p.n - 1) * p.d1) - (p.a2 + (p.n - 1) * p.d2));
    return gap >= 20 ? "easy" : gap >= 5 ? "medium" : "hard";
  },
  difficultyDimensions: ["result_closeness"],
  sampleParams: (random) => ({
    a1: 1 + Math.floor(random() * 50), d1: 1 + Math.floor(random() * 10),
    a2: 1 + Math.floor(random() * 50), d2: 1 + Math.floor(random() * 10),
    n: 5 + Math.floor(random() * 11),
  }),
  renderQuestionText: (p) => `Sequence A begins ${seq3(p.a1, p.d1)}, ... . Sequence B begins ${seq3(p.a2, p.d2)}, ... . Which sequence has the larger ${p.n}th term -- A or B?`,
  deriveCorrectAnswer: (p) => {
    const termA = p.a1 + (p.n - 1) * p.d1;
    const termB = p.a2 + (p.n - 1) * p.d2;
    return termA > termB ? "A" : "B";
  },
  deriveWorkedSteps: (p) => {
    const termA = p.a1 + (p.n - 1) * p.d1;
    const termB = p.a2 + (p.n - 1) * p.d2;
    return [`Sequence A's ${p.n}th term: ${p.a1} + (${p.n} − 1) × ${p.d1} = ${termA}`, `Sequence B's ${p.n}th term: ${p.a2} + (${p.n} − 1) × ${p.d2} = ${termB}`, termA > termB ? "A is larger" : "B is larger"];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "All four sequence parameters resampled independently; ties excluded by constraints.",
  reasoningRoute: () => "comparison",
  contextTag: () => "linear_sequence",
  unknownPosition: () => "comparative_term",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["transfer", "independent_practice"],
};

type ErrorSeqParams = { a: number; d: number; n: number };
export const BP_ERROR_IDENTIFICATION_SEQUENCE: StructuralBlueprint<ErrorSeqParams> = {
  blueprintId: "mr02-bp-error-identification",
  familyId: "mr02-nth-term",
  competencyId: "MR-02",
  questionTypeId: "QT-MR-05",
  mathematicalObjective: "Diagnose a specific, well-documented misconception in nth-term calculation -- using n instead of (n-1) lots of the common difference -- distinct from a generic arithmetic slip.",
  parameterRanges: { a: { min: 1, max: 50 }, d: { min: 2, max: 10 }, n: { min: 5, max: 20 } },
  constraints: (p) => p.d !== 0,
  invalidCombinationDescription: "d=0 excluded.",
  difficultyControls: (p) => (p.n <= 10 ? "easy" : p.n <= 16 ? "medium" : "hard"),
  difficultyDimensions: ["term_number_magnitude"],
  sampleParams: (random) => ({ a: 1 + Math.floor(random() * 50), d: 2 + Math.floor(random() * 9), n: 5 + Math.floor(random() * 16) }),
  renderQuestionText: (p) => {
    const wrongAnswer = p.a + p.n * p.d; // the classic off-by-one: uses n instead of (n-1)
    return `A sequence begins ${seq3(p.a, p.d)}, ... and continues with the same pattern. A student says the ${p.n}th term is ${wrongAnswer}, using the rule "first term + n × difference". This is incorrect. What is the correct ${p.n}th term?`;
  },
  deriveCorrectAnswer: (p) => String(p.a + (p.n - 1) * p.d),
  deriveWorkedSteps: (p) => [
    "The correct rule is first term + (n − 1) × difference, not n × difference",
    `${p.a} + (${p.n} − 1) × ${p.d} = ${p.a + (p.n - 1) * p.d}`,
  ],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "a/d/n resampled independently; the wrong answer is always derived from the SAME named misconception (n instead of n-1), never an arbitrary offset.",
  reasoningRoute: () => "error_identification",
  contextTag: () => "linear_sequence",
  unknownPosition: () => "corrected_nth_term",
  representationType: () => "prose",
  misconceptionTargeted: "using n instead of (n-1) lots of the common difference in the nth-term rule (an off-by-one error)",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["explicit_teaching", "scaffolded_practice"],
};

export const MR02_NTH_TERM_FAMILY: EducationalFamily = {
  familyId: "mr02-nth-term",
  subject: "maths",
  blueprints: [
    BP_NTH_TERM_DIRECT,
    BP_FIND_COMMON_DIFFERENCE,
    BP_FIND_FIRST_TERM,
    BP_FIND_TERM_POSITION,
    BP_VERIFY_MEMBERSHIP,
    BP_COMPARE_TWO_SEQUENCES,
    BP_ERROR_IDENTIFICATION_SEQUENCE,
  ] as EducationalFamily["blueprints"],
};
