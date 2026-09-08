import type { StructuralBlueprint, EducationalFamily } from "./types";

/**
 * Educational Increment 003, Wave 1 -- mr04-time-reverse.
 *
 * Real, existing production content (4 practice-eligible rows, read live
 * before designing these blueprints, see supabase/migrations/078_mr04_
 * content_depth_foundation.sql) is exclusively ONE reasoning shape:
 * "finish time minus total stage durations = start time," always
 * difficulty=hard, always transfer_class=FAR_TRANSFER, no easier entry
 * point and no teaching content. These blueprints keep that genuine
 * shape as ONE blueprint (BP_TIME_REVERSE_MULTISTAGE_DIRECT) and add
 * five further, genuinely distinct demands: a scaffolded Foundation-tier
 * single-duration entry point, a different unknown (a missing STAGE
 * duration, not the start time), a disclosed misconception-diagnosis
 * blueprint for the exact real, already-tagged production misconception,
 * a genuinely harder Far-Transfer representation shift (reversing across
 * a midnight wraparound), and a comparison blueprint.
 *
 * All times are stored as minutes-since-midnight integers internally and
 * formatted as zero-padded 24hr "HH:MM" -- avoids floating-point drift
 * and matches the real production rows' own display convention.
 */

const MINUTES_PER_DAY = 1440;

function formatTime(totalMinutes: number): string {
  const m = ((totalMinutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;
  const hours = Math.floor(m / 60);
  const mins = m % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

// ─── BP1: Foundation -- single-duration reversal ────────────────────────

type SingleStageParams = { finishMin: number; durationMin: number };
export const BP_TIME_REVERSE_SCAFFOLDED_SINGLE_STAGE: StructuralBlueprint<SingleStageParams> = {
  blueprintId: "mr04-bp-time-reverse-scaffolded-single-stage",
  familyId: "mr04-time-reverse",
  competencyId: "MR-04",
  questionTypeId: "QT-MR-10",
  mathematicalObjective: "Reverse ONE known duration from a finish time to find the start time -- a genuine Foundation-tier entry point into reverse elapsed-time reasoning via a single stage (reduced complexity, not smaller numbers).",
  parameterRanges: { finishMin: { min: 370, max: 1380 }, durationMin: { min: 10, max: 180 } },
  constraints: (p) => p.finishMin - p.durationMin >= 0,
  invalidCombinationDescription: "Combinations where the duration exceeds the finish time (implying a start before midnight) are excluded from this Foundation-tier blueprint -- same-day only.",
  difficultyControls: (p) => (p.durationMin <= 60 ? "easy" : "medium"),
  difficultyDimensions: ["duration_magnitude"],
  sampleParams: (random) => {
    const startMin = 360 + Math.floor(random() * 841);
    const durationMin = 10 + Math.floor(random() * 171);
    return { finishMin: startMin + durationMin, durationMin };
  },
  renderQuestionText: (p) => `A cookery class finishes at ${formatTime(p.finishMin)}. It lasted ${p.durationMin} minutes. What time did the class start?`,
  deriveCorrectAnswer: (p) => formatTime(p.finishMin - p.durationMin),
  deriveWorkedSteps: (p) => ["Subtract the duration from the finish time", `${formatTime(p.finishMin)} − ${p.durationMin} minutes = ${formatTime(p.finishMin - p.durationMin)}`],
  stageSuitability: ["FOUNDATION", "DEVELOPMENT"],
  similarityControls: "finishMin/durationMin resampled independently every candidate; same-day only.",
  reasoningRoute: () => "reverse_reasoning",
  contextTag: () => "reverse_single_duration",
  unknownPosition: () => "start_time",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["explicit_teaching", "worked_example", "guided_practice"],
};

// ─── BP2: existing production structure, formalized ─────────────────────

type MultiStageParams = { finishMin: number; stage1: number; stage2: number; stage3: number };
export const BP_TIME_REVERSE_MULTISTAGE_DIRECT: StructuralBlueprint<MultiStageParams> = {
  blueprintId: "mr04-bp-time-reverse-multistage-direct",
  familyId: "mr04-time-reverse",
  competencyId: "MR-04",
  questionTypeId: "QT-MR-10",
  mathematicalObjective: "Reverse THREE sequential stage durations from a finish time to find the start time -- the real, already-live production structure, formalised as one blueprint among several rather than the family's only shape.",
  parameterRanges: { finishMin: { min: 400, max: 1400 }, stage1: { min: 10, max: 100 }, stage2: { min: 5, max: 60 }, stage3: { min: 10, max: 100 } },
  constraints: (p) => p.finishMin - (p.stage1 + p.stage2 + p.stage3) >= 0,
  invalidCombinationDescription: "Combinations where the combined duration exceeds the finish time (implying a start before midnight) are excluded -- same-day only.",
  difficultyControls: (p) => {
    const total = p.stage1 + p.stage2 + p.stage3;
    return total <= 90 ? "medium" : total <= 150 ? "hard" : "challenge";
  },
  difficultyDimensions: ["duration_magnitude", "stage_count"],
  sampleParams: (random) => {
    const stage1 = 10 + Math.floor(random() * 91);
    const stage2 = 5 + Math.floor(random() * 56);
    const stage3 = 10 + Math.floor(random() * 91);
    const startMin = 300 + Math.floor(random() * 700);
    return { finishMin: startMin + stage1 + stage2 + stage3, stage1, stage2, stage3 };
  },
  renderQuestionText: (p) => `A workshop finishes at ${formatTime(p.finishMin)}. It consisted of a ${p.stage1} minute session, a ${p.stage2} minute break, and a ${p.stage3} minute session, in that order. What time did the workshop start?`,
  deriveCorrectAnswer: (p) => formatTime(p.finishMin - (p.stage1 + p.stage2 + p.stage3)),
  deriveWorkedSteps: (p) => {
    const total = p.stage1 + p.stage2 + p.stage3;
    return [`Total time from start to finish: ${p.stage1} + ${p.stage2} + ${p.stage3} = ${total} minutes`, `Subtract this from the finish time: ${formatTime(p.finishMin)} − ${total} minutes = ${formatTime(p.finishMin - total)}`];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "finishMin/stage1/stage2/stage3 resampled independently every candidate; same-day only.",
  reasoningRoute: () => "reverse_reasoning",
  contextTag: () => "reverse_multistage_duration",
  unknownPosition: () => "start_time",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "independent_practice", "mastery_check"],
};

// ─── BP3: genuinely different unknown -- the missing stage duration ────

type MissingStageParams = { startMin: number; finishMin: number; stage1: number; stage2: number };
export const BP_TIME_REVERSE_FIND_MISSING_STAGE: StructuralBlueprint<MissingStageParams> = {
  blueprintId: "mr04-bp-time-reverse-find-missing-stage",
  familyId: "mr04-time-reverse",
  competencyId: "MR-04",
  questionTypeId: "QT-MR-10",
  mathematicalObjective: "Given the start time, finish time, and all but one stage duration, find the missing stage's duration -- a genuinely different unknown (a duration, not a clock time) from either reverse-to-start-time blueprint.",
  parameterRanges: { startMin: { min: 300, max: 1000 }, finishMin: { min: 400, max: 1400 }, stage1: { min: 10, max: 90 }, stage2: { min: 5, max: 60 } },
  constraints: (p) => p.finishMin > p.startMin && p.finishMin - p.startMin - p.stage1 - p.stage2 >= 10,
  invalidCombinationDescription: "The missing stage's duration must resolve to at least 10 minutes -- a degenerate near-zero missing stage is excluded as pedagogically uninformative.",
  difficultyControls: () => "hard",
  difficultyDimensions: ["duration_magnitude"],
  sampleParams: (random) => {
    const startMin = 300 + Math.floor(random() * 700);
    const stage1 = 10 + Math.floor(random() * 81);
    const stage2 = 5 + Math.floor(random() * 56);
    const stage3 = 10 + Math.floor(random() * 91);
    return { startMin, finishMin: startMin + stage1 + stage2 + stage3, stage1, stage2 };
  },
  renderQuestionText: (p) => `A workshop starts at ${formatTime(p.startMin)} and finishes at ${formatTime(p.finishMin)}. It consists of a ${p.stage1} minute session, a ${p.stage2} minute break, and a further session, in that order. How many minutes long was the further session?`,
  deriveCorrectAnswer: (p) => String(p.finishMin - p.startMin - p.stage1 - p.stage2),
  deriveWorkedSteps: (p) => {
    const total = p.finishMin - p.startMin;
    const missing = total - p.stage1 - p.stage2;
    return [`Total time from start to finish: ${formatTime(p.finishMin)} − ${formatTime(p.startMin)} = ${total} minutes`, `Known stages: ${p.stage1} + ${p.stage2} = ${p.stage1 + p.stage2} minutes`, `Missing stage: ${total} − ${p.stage1 + p.stage2} = ${missing} minutes`];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "startMin/stage1/stage2 resampled independently; finishMin constructed forward from a hidden third stage duration.",
  reasoningRoute: () => "reverse_reasoning",
  contextTag: () => "reverse_find_missing_stage",
  unknownPosition: () => "missing_stage_duration",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["scaffolded_practice", "mastery_check"],
};

// ─── BP4: error identification, targeting the real, already-tagged ─────
// production misconception ────────────────────────────────────────────

type ErrorParams = { finishMin: number; stage1: number; stage2: number };
export const BP_TIME_REVERSE_ERROR_IDENTIFICATION: StructuralBlueprint<ErrorParams> = {
  blueprintId: "mr04-bp-time-reverse-error-identification",
  familyId: "mr04-time-reverse",
  competencyId: "MR-04",
  questionTypeId: "QT-MR-10",
  mathematicalObjective: "Identify and correct the single documented error already tagged on every real mr04-time-reverse production row -- subtracting the total elapsed time incorrectly or adding instead of subtracting.",
  parameterRanges: { finishMin: { min: 400, max: 1400 }, stage1: { min: 10, max: 90 }, stage2: { min: 5, max: 60 } },
  constraints: (p) => p.finishMin - (p.stage1 + p.stage2) >= 0,
  invalidCombinationDescription: "Combinations where the combined duration exceeds the finish time are excluded -- same-day only.",
  difficultyControls: () => "hard",
  difficultyDimensions: ["duration_magnitude"],
  sampleParams: (random) => {
    const stage1 = 10 + Math.floor(random() * 81);
    const stage2 = 5 + Math.floor(random() * 56);
    const startMin = 300 + Math.floor(random() * 700);
    return { finishMin: startMin + stage1 + stage2, stage1, stage2 };
  },
  renderQuestionText: (p) => {
    const total = p.stage1 + p.stage2;
    const wrongStart = p.finishMin + total;
    return `A rehearsal finishes at ${formatTime(p.finishMin)}. It consisted of a ${p.stage1} minute session and a ${p.stage2} minute break, in that order. A student calculates the start time by ADDING the total duration (${total} minutes) to the finish time, giving ${formatTime(wrongStart)}. This is incorrect. What was the correct start time?`;
  },
  deriveCorrectAnswer: (p) => formatTime(p.finishMin - (p.stage1 + p.stage2)),
  deriveWorkedSteps: (p) => {
    const total = p.stage1 + p.stage2;
    return ["To find an earlier (start) time from a later (finish) time, the elapsed duration must be SUBTRACTED, never added", `${formatTime(p.finishMin)} − ${total} minutes = ${formatTime(p.finishMin - total)}`];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "finishMin/stage1/stage2 resampled independently; same-day only.",
  reasoningRoute: () => "error_identification",
  contextTag: () => "reverse_multistage_duration",
  unknownPosition: () => "start_time",
  representationType: () => "prose",
  misconceptionTargeted: "subtracting-the-total-elapsed-time-incorrectly-or-adding-instead-of-subtracting",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["explicit_teaching", "scaffolded_practice"],
};

// ─── BP5: Far-Transfer -- representation shift, midnight wraparound ────

type CrossMidnightParams = { finishMin: number; durationMin: number };
export const BP_TIME_REVERSE_CROSS_MIDNIGHT: StructuralBlueprint<CrossMidnightParams> = {
  blueprintId: "mr04-bp-time-reverse-cross-midnight",
  familyId: "mr04-time-reverse",
  competencyId: "MR-04",
  questionTypeId: "QT-MR-10",
  mathematicalObjective: "Reverse a duration that crosses back over midnight into the previous day -- a genuine representation-shift difficulty driver (24hr wraparound), distinct from every same-day blueprint in this family.",
  parameterRanges: { finishMin: { min: 0, max: 299 }, durationMin: { min: 120, max: 600 } },
  constraints: (p) => p.finishMin - p.durationMin < 0,
  invalidCombinationDescription: "Only combinations that genuinely cross back over midnight (finish minus duration is negative) are accepted -- this blueprint exists specifically to exercise wraparound, not same-day subtraction.",
  difficultyControls: () => "challenge",
  difficultyDimensions: ["duration_magnitude", "midnight_wraparound"],
  sampleParams: (random) => {
    const finishMin = Math.floor(random() * 240);
    const durationMin = finishMin + 121 + Math.floor(random() * 400);
    return { finishMin, durationMin: Math.min(durationMin, 600) };
  },
  renderQuestionText: (p) => {
    const hours = Math.floor(p.durationMin / 60);
    const mins = p.durationMin % 60;
    const durationText = mins === 0 ? `${hours} hour${hours === 1 ? "" : "s"}` : `${hours} hour${hours === 1 ? "" : "s"} ${mins} minute${mins === 1 ? "" : "s"}`;
    return `A night shift finishes at ${formatTime(p.finishMin)}. It lasted ${durationText}. What time did the shift start (the previous day)?`;
  },
  deriveCorrectAnswer: (p) => formatTime(p.finishMin - p.durationMin),
  deriveWorkedSteps: (p) => {
    const start = ((p.finishMin - p.durationMin) % MINUTES_PER_DAY + MINUTES_PER_DAY) % MINUTES_PER_DAY;
    return [`Subtracting ${p.durationMin} minutes from ${formatTime(p.finishMin)} crosses back over midnight`, `${formatTime(p.finishMin)} − ${p.durationMin} minutes = ${formatTime(start)} (the previous day)`];
  },
  stageSuitability: ["FINAL_READINESS"],
  similarityControls: "finishMin/durationMin resampled independently every candidate, constrained to force a genuine midnight crossing.",
  reasoningRoute: () => "reverse_reasoning",
  contextTag: () => "reverse_duration_crossing_midnight",
  unknownPosition: () => "start_time_crossing_midnight",
  representationType: () => "24hr_clock_with_midnight_wraparound",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["transfer", "independent_practice"],
};

// ─── BP6: comparison -- two independent reverse schedules ──────────────

type CompareParams = { finishMin1: number; total1: number; finishMin2: number; total2: number };
export const BP_TIME_REVERSE_COMPARE_TWO_SCHEDULES: StructuralBlueprint<CompareParams> = {
  blueprintId: "mr04-bp-time-reverse-compare-two-schedules",
  familyId: "mr04-time-reverse",
  competencyId: "MR-04",
  questionTypeId: "QT-MR-10",
  mathematicalObjective: "Reverse TWO separate finish-time-and-duration schedules and compare their start times -- a genuinely different demand from reversing one schedule alone.",
  parameterRanges: { finishMin1: { min: 400, max: 1400 }, total1: { min: 30, max: 240 }, finishMin2: { min: 400, max: 1400 }, total2: { min: 30, max: 240 } },
  constraints: (p) => {
    if (p.finishMin1 - p.total1 < 0 || p.finishMin2 - p.total2 < 0) return false;
    return Math.abs(p.finishMin1 - p.total1 - (p.finishMin2 - p.total2)) >= 5;
  },
  invalidCombinationDescription: "Both schedules must stay same-day, and the two resulting start times must not tie within 5 minutes -- a genuine comparison requires a real, non-tied difference.",
  difficultyControls: () => "hard",
  difficultyDimensions: ["duration_magnitude", "result_closeness"],
  sampleParams: (random) => {
    const total1 = 30 + Math.floor(random() * 211);
    const start1 = 300 + Math.floor(random() * 700);
    const total2 = 30 + Math.floor(random() * 211);
    const start2 = 300 + Math.floor(random() * 700);
    return { finishMin1: start1 + total1, total1, finishMin2: start2 + total2, total2 };
  },
  renderQuestionText: (p) => `Event A finishes at ${formatTime(p.finishMin1)}, lasting ${p.total1} minutes in total. Event B finishes at ${formatTime(p.finishMin2)}, lasting ${p.total2} minutes in total. Which event started earlier -- A or B?`,
  deriveCorrectAnswer: (p) => {
    const start1 = p.finishMin1 - p.total1;
    const start2 = p.finishMin2 - p.total2;
    return start1 < start2 ? "A" : "B";
  },
  deriveWorkedSteps: (p) => {
    const start1 = p.finishMin1 - p.total1;
    const start2 = p.finishMin2 - p.total2;
    return [`Event A started at ${formatTime(start1)}`, `Event B started at ${formatTime(start2)}`, start1 < start2 ? "A started earlier" : "B started earlier"];
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "All four schedule parameters resampled independently across the two events; ties within 5 minutes rejected.",
  reasoningRoute: () => "comparison",
  contextTag: () => "reverse_compare_two_schedules",
  unknownPosition: () => "comparative_start_time",
  representationType: () => "prose",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["transfer", "independent_practice"],
};

export const MR04_TIME_REVERSE_FAMILY: EducationalFamily = {
  familyId: "mr04-time-reverse",
  subject: "maths",
  blueprints: [
    BP_TIME_REVERSE_SCAFFOLDED_SINGLE_STAGE,
    BP_TIME_REVERSE_MULTISTAGE_DIRECT,
    BP_TIME_REVERSE_FIND_MISSING_STAGE,
    BP_TIME_REVERSE_ERROR_IDENTIFICATION,
    BP_TIME_REVERSE_CROSS_MIDNIGHT,
    BP_TIME_REVERSE_COMPARE_TWO_SCHEDULES,
  ] as EducationalFamily["blueprints"],
};
