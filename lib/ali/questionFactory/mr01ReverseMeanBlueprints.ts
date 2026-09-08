import type { StructuralBlueprint, EducationalFamily } from "./types";

/**
 * Educational Increment 003, Wave 1 -- mr01-reverse-mean.
 *
 * Real, existing production content (4 practice-eligible rows, read live
 * before designing these blueprints, see supabase/migrations/081_inc006_
 * structural_depth.sql) is exclusively ONE reasoning shape: "total =
 * mean × count -- subtract the known values to find the missing one,"
 * always difficulty=hard, always transfer_class=FAR_TRANSFER, no easier
 * entry point and no teaching content. These blueprints keep that
 * genuine shape as ONE blueprint (BP_REVERSE_MEAN_DIRECT) and add five
 * further, genuinely distinct demands: a scaffolded Foundation-tier
 * entry point, a different unknown entirely (a NEW value that shifts an
 * existing mean when added -- a two-total reasoning structure, not a
 * static missing-value search), a disclosed misconception-diagnosis
 * blueprint for the exact real, already-tagged production misconception,
 * a comparison blueprint, and a Far-Transfer combined-groups blueprint
 * (finding one group's mean from a combined mean).
 */

// ─── BP1: Foundation -- scaffolded, 3 values, 2 known ───────────────────

type ScaffoldedParams = { mean: number; known1: number; known2: number };
export const BP_REVERSE_MEAN_SCAFFOLDED: StructuralBlueprint<ScaffoldedParams> = {
  blueprintId: "mr01-bp-reverse-mean-scaffolded",
  familyId: "mr01-reverse-mean",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-12",
  mathematicalObjective: "Find a missing value given the mean of 3 values and the other 2, with the 'total = mean × count' relationship stated explicitly -- a genuine Foundation-tier entry point via reduced scaffolding and a smaller value count, not merely smaller numbers.",
  parameterRanges: { mean: { min: 10, max: 50 }, known1: { min: 1, max: 80 }, known2: { min: 1, max: 80 } },
  constraints: (p) => {
    const missing = p.mean * 3 - p.known1 - p.known2;
    return missing >= 1 && missing <= 100;
  },
  invalidCombinationDescription: "Combinations where the missing value resolves outside 1..100 are excluded -- keeps every answer a realistic, positive score.",
  difficultyControls: () => "medium",
  difficultyDimensions: ["count_of_known_values"],
  sampleParams: (random) => {
    const mean = 10 + Math.floor(random() * 41);
    const known1 = Math.max(1, mean + Math.floor(random() * 21) - 10);
    const known2 = Math.max(1, mean + Math.floor(random() * 21) - 10);
    return { mean, known1, known2 };
  },
  renderQuestionText: (p) => `Three friends' mean score was ${p.mean}. Two of the scores were ${p.known1} and ${p.known2}. Remember: total = mean × count. What was the third score?`,
  deriveCorrectAnswer: (p) => String(p.mean * 3 - p.known1 - p.known2),
  deriveWorkedSteps: (p) => {
    const total = p.mean * 3;
    const knownSum = p.known1 + p.known2;
    return [`Total for all three scores: ${p.mean} × 3 = ${total}`, `Known scores add up to: ${p.known1} + ${p.known2} = ${knownSum}`, `Third score: ${total} − ${knownSum} = ${total - knownSum}`];
  },
  stageSuitability: ["FOUNDATION", "DEVELOPMENT"],
  similarityControls: "mean/known1/known2 resampled independently every candidate; missing value bounded to 1..100.",
  reasoningRoute: () => "reverse_reasoning",
  contextTag: () => "reverse_mean_scaffolded",
  unknownPosition: () => "missing_value",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["explicit_teaching", "worked_example", "guided_practice"],
};

// ─── BP2: existing production structure, formalized ─────────────────────

type DirectParams = { mean: number; known1: number; known2: number; known3: number; known4: number };
export const BP_REVERSE_MEAN_DIRECT: StructuralBlueprint<DirectParams> = {
  blueprintId: "mr01-bp-reverse-mean-direct",
  familyId: "mr01-reverse-mean",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-12",
  mathematicalObjective: "Find a missing value given the mean of 5 values and the other 4, with no relationship stated -- the real, already-live production structure, formalised as one blueprint among several rather than the family's only shape.",
  parameterRanges: { mean: { min: 10, max: 50 }, known1: { min: 1, max: 80 }, known2: { min: 1, max: 80 }, known3: { min: 1, max: 80 }, known4: { min: 1, max: 80 } },
  constraints: (p) => {
    const missing = p.mean * 5 - p.known1 - p.known2 - p.known3 - p.known4;
    return missing >= 1 && missing <= 150;
  },
  invalidCombinationDescription: "Combinations where the missing value resolves outside 1..150 are excluded -- keeps every answer a realistic, positive score.",
  difficultyControls: () => "hard",
  difficultyDimensions: ["count_of_known_values"],
  sampleParams: (random) => {
    const mean = 10 + Math.floor(random() * 41);
    const jitter = () => Math.max(1, mean + Math.floor(random() * 21) - 10);
    return { mean, known1: jitter(), known2: jitter(), known3: jitter(), known4: jitter() };
  },
  renderQuestionText: (p) => `A player's mean score across five games was ${p.mean}. Four of the scores were ${p.known1}, ${p.known2}, ${p.known3}, ${p.known4}. What was the fifth score?`,
  deriveCorrectAnswer: (p) => String(p.mean * 5 - p.known1 - p.known2 - p.known3 - p.known4),
  deriveWorkedSteps: (p) => {
    const total = p.mean * 5;
    const knownSum = p.known1 + p.known2 + p.known3 + p.known4;
    return [`Total for all five games: ${p.mean} × 5 = ${total}`, `The four known scores add up to: ${p.known1} + ${p.known2} + ${p.known3} + ${p.known4} = ${knownSum}`, `The fifth score: ${total} − ${knownSum} = ${total - knownSum}`];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "mean/known1..4 resampled independently every candidate; missing value bounded to 1..150.",
  reasoningRoute: () => "reverse_reasoning",
  contextTag: () => "reverse_mean_direct",
  unknownPosition: () => "missing_value",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "independent_practice", "mastery_check"],
};

// ─── BP3: genuinely different structure -- a new value shifts the mean ──

type NewValueParams = { oldMean: number; oldCount: number; newMean: number };
export const BP_REVERSE_MEAN_NEW_VALUE_CHANGES_MEAN: StructuralBlueprint<NewValueParams> = {
  blueprintId: "mr01-bp-reverse-mean-new-value-changes-mean",
  familyId: "mr01-reverse-mean",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-12",
  mathematicalObjective: "Given the mean of a set of values, and the NEW mean after one more value is added, find the value that was added -- a genuinely different structure from a static missing-value search: it requires computing and differencing TWO totals (before and after), not subtracting known values from one fixed total.",
  parameterRanges: { oldMean: { min: 10, max: 50 }, oldCount: { min: 3, max: 6 }, newMean: { min: 1, max: 60 } },
  constraints: (p) => {
    if (p.newMean === p.oldMean) return false;
    const oldTotal = p.oldMean * p.oldCount;
    const newTotal = p.newMean * (p.oldCount + 1);
    const addedValue = newTotal - oldTotal;
    return addedValue >= 1 && addedValue <= 200;
  },
  invalidCombinationDescription: "The added value must resolve to a realistic positive amount (1..200), and the new mean must genuinely differ from the old mean -- otherwise the 'a value was added' framing is uninformative.",
  difficultyControls: () => "hard",
  difficultyDimensions: ["count_change", "mean_shift_magnitude"],
  sampleParams: (random) => {
    const oldCount = 3 + Math.floor(random() * 4);
    const oldMean = 10 + Math.floor(random() * 41);
    const shift = 1 + Math.floor(random() * 15);
    const newMean = random() < 0.5 ? oldMean + shift : Math.max(1, oldMean - shift);
    return { oldMean, oldCount, newMean };
  },
  renderQuestionText: (p) => `The mean of ${p.oldCount} numbers is ${p.oldMean}. When one more number is added, the mean of all ${p.oldCount + 1} numbers becomes ${p.newMean}. What is the value of the number that was added?`,
  deriveCorrectAnswer: (p) => String(p.newMean * (p.oldCount + 1) - p.oldMean * p.oldCount),
  deriveWorkedSteps: (p) => {
    const oldTotal = p.oldMean * p.oldCount;
    const newTotal = p.newMean * (p.oldCount + 1);
    return [`Total of the original ${p.oldCount} numbers: ${p.oldMean} × ${p.oldCount} = ${oldTotal}`, `Total of all ${p.oldCount + 1} numbers: ${p.newMean} × ${p.oldCount + 1} = ${newTotal}`, `The added number: ${newTotal} − ${oldTotal} = ${newTotal - oldTotal}`];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "oldMean/oldCount/newMean resampled independently every candidate; degenerate (unchanged-mean) combinations excluded.",
  reasoningRoute: () => "multi_step_application",
  contextTag: () => "reverse_mean_new_value_added",
  unknownPosition: () => "added_value_that_changes_mean",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["scaffolded_practice", "transfer"],
};

// ─── BP4: error identification, targeting the real, already-tagged ─────
// production misconception ────────────────────────────────────────────

type ErrorParams = { mean: number; known1: number; known2: number; known3: number; known4: number };
export const BP_REVERSE_MEAN_ERROR_IDENTIFICATION: StructuralBlueprint<ErrorParams> = {
  blueprintId: "mr01-bp-reverse-mean-error-identification",
  familyId: "mr01-reverse-mean",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-12",
  mathematicalObjective: "Identify and correct the single documented error already tagged on every real mr01-reverse-mean production row -- treating the mean itself as the total, instead of multiplying by the count first.",
  parameterRanges: { mean: { min: 10, max: 50 }, known1: { min: 1, max: 80 }, known2: { min: 1, max: 80 }, known3: { min: 1, max: 80 }, known4: { min: 1, max: 80 } },
  constraints: (p) => {
    const missing = p.mean * 5 - p.known1 - p.known2 - p.known3 - p.known4;
    return missing >= 1 && missing <= 150;
  },
  invalidCombinationDescription: "Same missing-value bound as BP_REVERSE_MEAN_DIRECT.",
  difficultyControls: () => "hard",
  difficultyDimensions: ["count_of_known_values"],
  sampleParams: (random) => {
    const mean = 10 + Math.floor(random() * 41);
    const jitter = () => Math.max(1, mean + Math.floor(random() * 21) - 10);
    return { mean, known1: jitter(), known2: jitter(), known3: jitter(), known4: jitter() };
  },
  renderQuestionText: (p) => {
    const knownSum = p.known1 + p.known2 + p.known3 + p.known4;
    const wrongAnswer = p.mean - knownSum;
    return `A player's mean score across five games was ${p.mean}. Four of the scores were ${p.known1}, ${p.known2}, ${p.known3}, ${p.known4}. A student calculates the fifth score as ${p.mean} − (${p.known1} + ${p.known2} + ${p.known3} + ${p.known4}) = ${wrongAnswer}, treating the mean itself as the total. This is incorrect. What is the correct fifth score?`;
  },
  deriveCorrectAnswer: (p) => String(p.mean * 5 - p.known1 - p.known2 - p.known3 - p.known4),
  deriveWorkedSteps: (p) => {
    const total = p.mean * 5;
    const knownSum = p.known1 + p.known2 + p.known3 + p.known4;
    return ["The mean is NOT the total -- the total must be found first by multiplying the mean by the count", `Total for all five games: ${p.mean} × 5 = ${total}`, `The fifth score: ${total} − ${knownSum} = ${total - knownSum}`];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "mean/known1..4 resampled independently every candidate; the wrong answer is always derived from the SAME named misconception, never an arbitrary offset.",
  reasoningRoute: () => "error_identification",
  contextTag: () => "reverse_mean_direct",
  unknownPosition: () => "missing_value",
  representationType: () => "prose",
  misconceptionTargeted: "treating-the-mean-as-the-total-instead-of-multiplying-by-the-count-first",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["explicit_teaching", "scaffolded_practice"],
};

// ─── BP5: comparison -- two independent reverse-mean scenarios ─────────

type CompareParams = { mean1: number; k1a: number; k1b: number; mean2: number; k2a: number; k2b: number };
export const BP_REVERSE_MEAN_COMPARE_TWO_GROUPS: StructuralBlueprint<CompareParams> = {
  blueprintId: "mr01-bp-reverse-mean-compare-two-groups",
  familyId: "mr01-reverse-mean",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-12",
  mathematicalObjective: "Find the missing value for TWO separate groups (each mean of 3, 2 known) and compare them -- a genuinely different demand from finding one missing value alone.",
  parameterRanges: { mean1: { min: 10, max: 50 }, k1a: { min: 1, max: 80 }, k1b: { min: 1, max: 80 }, mean2: { min: 10, max: 50 }, k2a: { min: 1, max: 80 }, k2b: { min: 1, max: 80 } },
  constraints: (p) => {
    const missing1 = p.mean1 * 3 - p.k1a - p.k1b;
    const missing2 = p.mean2 * 3 - p.k2a - p.k2b;
    if (missing1 < 1 || missing1 > 100 || missing2 < 1 || missing2 > 100) return false;
    return Math.abs(missing1 - missing2) >= 3;
  },
  invalidCombinationDescription: "Both groups' missing values must be realistic (1..100), and must not tie within 3 -- a genuine comparison requires a real, non-tied difference.",
  difficultyControls: () => "hard",
  difficultyDimensions: ["count_of_known_values", "result_closeness"],
  sampleParams: (random) => {
    const makeGroup = () => {
      const mean = 10 + Math.floor(random() * 41);
      const jitter = () => Math.max(1, mean + Math.floor(random() * 21) - 10);
      return { mean, a: jitter(), b: jitter() };
    };
    const g1 = makeGroup();
    const g2 = makeGroup();
    return { mean1: g1.mean, k1a: g1.a, k1b: g1.b, mean2: g2.mean, k2a: g2.a, k2b: g2.b };
  },
  renderQuestionText: (p) =>
    `Group A: three scores have a mean of ${p.mean1}. Two of them are ${p.k1a} and ${p.k1b}. Group B: three scores have a mean of ${p.mean2}. Two of them are ${p.k2a} and ${p.k2b}. Which group's missing score is higher -- A or B?`,
  deriveCorrectAnswer: (p) => {
    const missing1 = p.mean1 * 3 - p.k1a - p.k1b;
    const missing2 = p.mean2 * 3 - p.k2a - p.k2b;
    return missing1 > missing2 ? "A" : "B";
  },
  deriveWorkedSteps: (p) => {
    const missing1 = p.mean1 * 3 - p.k1a - p.k1b;
    const missing2 = p.mean2 * 3 - p.k2a - p.k2b;
    return [`Group A's missing score: ${p.mean1} × 3 − (${p.k1a} + ${p.k1b}) = ${missing1}`, `Group B's missing score: ${p.mean2} × 3 − (${p.k2a} + ${p.k2b}) = ${missing2}`, missing1 > missing2 ? "A is higher" : "B is higher"];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "All six group parameters resampled independently across the two groups; ties within 3 rejected.",
  reasoningRoute: () => "comparison",
  contextTag: () => "reverse_mean_compare_groups",
  unknownPosition: () => "comparative_missing_value",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["transfer", "independent_practice"],
};

// ─── BP6: Far-Transfer -- combined-groups mean reversal ────────────────

type CombinedGroupsParams = { countA: number; meanA: number; countB: number; combinedMean: number };
export const BP_REVERSE_MEAN_COMBINED_GROUPS: StructuralBlueprint<CombinedGroupsParams> = {
  blueprintId: "mr01-bp-reverse-mean-combined-groups",
  familyId: "mr01-reverse-mean",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-12",
  mathematicalObjective: "Given one group's count and mean, another group's count, and the COMBINED mean of both groups together, find the second group's mean -- a genuinely harder, Far-Transfer demand requiring two separate totals (one given directly, one derived from the combined total) rather than one total split among known/unknown individual values.",
  parameterRanges: { countA: { min: 3, max: 8 }, meanA: { min: 10, max: 50 }, countB: { min: 3, max: 8 }, combinedMean: { min: 5, max: 55 } },
  constraints: (p) => {
    if (p.combinedMean === p.meanA) return false;
    const totalA = p.countA * p.meanA;
    const combinedCount = p.countA + p.countB;
    const combinedTotal = p.combinedMean * combinedCount;
    const totalB = combinedTotal - totalA;
    if (totalB <= 0 || totalB % p.countB !== 0) return false;
    const meanB = totalB / p.countB;
    return meanB >= 1 && meanB <= 100 && meanB !== p.meanA;
  },
  invalidCombinationDescription: "Group B's derived mean must be a whole, realistic positive number (1..100) genuinely different from Group A's mean -- otherwise the combined-mean framing collapses to a trivial or fractional case.",
  difficultyControls: () => "challenge",
  difficultyDimensions: ["group_count", "combined_total_derivation"],
  sampleParams: (random) => {
    const countA = 3 + Math.floor(random() * 6);
    const countB = 3 + Math.floor(random() * 6);
    const meanA = 10 + Math.floor(random() * 41);
    const meanBTarget = Math.max(1, meanA + Math.floor(random() * 31) - 15);
    const totalA = countA * meanA;
    const totalB = countB * meanBTarget;
    const combinedCount = countA + countB;
    const combinedMean = Math.round((totalA + totalB) / combinedCount);
    return { countA, meanA, countB, combinedMean };
  },
  renderQuestionText: (p) => `Group A has ${p.countA} numbers with a mean of ${p.meanA}. Group B has ${p.countB} numbers. When combined, all ${p.countA + p.countB} numbers have a mean of ${p.combinedMean}. What is the mean of Group B?`,
  deriveCorrectAnswer: (p) => {
    const totalA = p.countA * p.meanA;
    const combinedTotal = p.combinedMean * (p.countA + p.countB);
    const totalB = combinedTotal - totalA;
    return String(totalB / p.countB);
  },
  deriveWorkedSteps: (p) => {
    const totalA = p.countA * p.meanA;
    const combinedCount = p.countA + p.countB;
    const combinedTotal = p.combinedMean * combinedCount;
    const totalB = combinedTotal - totalA;
    const meanB = totalB / p.countB;
    return [
      `Group A's total: ${p.meanA} × ${p.countA} = ${totalA}`,
      `Combined total for all ${combinedCount} numbers: ${p.combinedMean} × ${combinedCount} = ${combinedTotal}`,
      `Group B's total: ${combinedTotal} − ${totalA} = ${totalB}`,
      `Group B's mean: ${totalB} ÷ ${p.countB} = ${meanB}`,
    ];
  },
  stageSuitability: ["FINAL_READINESS"],
  similarityControls: "countA/meanA/countB constructed to guarantee a whole-number combinedMean and Group B mean every candidate.",
  reasoningRoute: () => "multi_step_application",
  contextTag: () => "reverse_mean_combined_groups",
  unknownPosition: () => "group_mean_from_combined_mean",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["transfer", "independent_practice"],
};

export const MR01_REVERSE_MEAN_FAMILY: EducationalFamily = {
  familyId: "mr01-reverse-mean",
  subject: "maths",
  blueprints: [
    BP_REVERSE_MEAN_SCAFFOLDED,
    BP_REVERSE_MEAN_DIRECT,
    BP_REVERSE_MEAN_NEW_VALUE_CHANGES_MEAN,
    BP_REVERSE_MEAN_ERROR_IDENTIFICATION,
    BP_REVERSE_MEAN_COMPARE_TWO_GROUPS,
    BP_REVERSE_MEAN_COMBINED_GROUPS,
  ] as EducationalFamily["blueprints"],
};
