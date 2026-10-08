import type { StructuralBlueprint, EducationalFamily } from "./types";
import type { MockNumberLineStimulus } from "@/lib/mockAttempt/types";

/**
 * CSSE Completion, representation priority 3: the number line, justified by two real, thin, prose-only competencies:
 *   QT-MR-03 measurement / scale reading (5 live items, one tier, no visual)
 *   QT-MR-14 precision / rounding        (12 live items, no transfer-tagged)
 * A scale is how a child meets both in a real paper: read a pointer between marks; round a value that sits on a line.
 * Three structurally different demands, none of which has a number in the text, so the line is necessary:
 *   read the value an arrow points to (including between labelled marks and in negative ranges);
 *   read two arrows and find how much greater one is;
 *   read an arrow, then round it to the nearest labelled mark (power of ten), exact halves excluded.
 *
 * All arithmetic is integer thousandths (0.1 = 100), so decimal scales are exact. Every blueprint declares an
 * `independentAnswerCheck` that reads the value(s) back OUT OF THE STIMULUS and uses a different route from the blueprint's own
 * formula (tick counting; subtraction in thousandths; nearest-of-two-candidates distance comparison).
 * Additive: nothing here touches the bank, Mock, or publication.
 */

const MAJOR_U = [100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000]; // 0.1 .. 100, in thousandths
const NICE_MINOR_U = new Set([10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000]);
const rint = (random: () => number, lo: number, hi: number) => lo + Math.floor(random() * (hi - lo + 1));
const fromU = (u: number) => String(u / 1000);
const mod = (a: number, m: number) => ((a % m) + m) % m;

type Line = { s: number; start: number; n: number; d: number };
const majorU = (p: Line) => MAJOR_U[p.s];
const minorU = (p: Line) => majorU(p) / p.d;
const minU = (p: Line) => p.start * majorU(p);
const lineOk = (p: Line) => p.s >= 0 && p.s < MAJOR_U.length && p.n >= 3 && p.n <= 8 && [2, 5, 10].includes(p.d) && Number.isInteger(minorU(p)) && NICE_MINOR_U.has(minorU(p));
const stim = (p: Line, points: { label: string; u: number }[]): MockNumberLineStimulus => ({
  type: "number-line",
  min: minU(p) / 1000,
  max: (minU(p) + p.n * majorU(p)) / 1000,
  majorStep: majorU(p) / 1000,
  minorDivisions: p.d,
  points: points.map((q) => ({ label: q.label, value: q.u / 1000 })),
});
const sampleLine = (random: () => number): Line => ({ s: rint(random, 0, 9), start: rint(random, -4, 6), n: rint(random, 3, 8), d: [2, 5, 10][rint(random, 0, 2)] });
const STAGES: StructuralBlueprint<Record<string, number>>["stageSuitability"] = ["FOUNDATION", "DEVELOPMENT", "EXAM_PREPARATION"];

/** Reads the point value (in thousandths) back out of a stimulus by counting minor ticks from the left end. */
function readByTickCount(st: MockNumberLineStimulus, label: string): number {
  const p = st.points.find((q) => q.label === label)!;
  const minorStepU = Math.round((st.majorStep * 1000) / st.minorDivisions);
  const ticks = Math.round((Math.round(p.value * 1000) - Math.round(st.min * 1000)) / minorStepU);
  return Math.round(st.min * 1000) + ticks * minorStepU;
}

// 1. Read the value an arrow points to --------------------------------------
type ReadP = Line & { off: number };
const readU = (p: ReadP) => minU(p) + p.off * minorU(p);
export const BP_NL_READ_VALUE: StructuralBlueprint<ReadP> = {
  blueprintId: "mr01-bp-numberline-read-value",
  familyId: "mr01-scale-reading",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-03",
  mathematicalObjective: "Read the value an arrow points to on a scale where only the major marks are labelled, working out the size of each small step (including decimal scales and negative ranges).",
  parameterRanges: { s: { min: 0, max: 9 }, start: { min: -4, max: 6 }, n: { min: 3, max: 8 }, d: { min: 2, max: 10 }, off: { min: 1, max: 79 } },
  constraints: (p) => lineOk(p) && p.off >= 1 && p.off <= p.n * p.d - 1,
  invalidCombinationDescription: "The scale is drawable (3-8 labelled intervals, 2, 5 or 10 small steps each, a simple small-step size) and the arrow is strictly inside the line.",
  difficultyControls: (p) => (p.off % p.d === 0 ? "easy" : p.d === 2 && p.start >= 0 ? "medium" : p.start < 0 ? "hard" : p.d === 2 ? "medium" : "hard"),
  difficultyDimensions: ["small_steps_between_marks", "negative_range", "decimal_scale"],
  sampleParams: (random) => {
    const l = sampleLine(random);
    return { ...l, off: rint(random, 1, Math.max(1, l.n * l.d - 1)) };
  },
  renderQuestionText: () => "What number does the arrow marked P point to?",
  deriveCorrectAnswer: (p) => fromU(readU(p)),
  deriveWorkedSteps: (p) => [
    `The labelled marks are ${fromU(majorU(p))} apart and there are ${p.d} equal steps between them, so each small step is ${fromU(minorU(p))}.`,
    `Start at ${fromU(minU(p))} and count ${p.off} small step${p.off === 1 ? "" : "s"} to the arrow: ${fromU(minU(p))} + ${p.off} × ${fromU(minorU(p))} = ${fromU(readU(p))}.`,
  ],
  deriveStimulus: (p) => stim(p, [{ label: "P", u: readU(p) }]),
  independentAnswerCheck: (p, claimed) => {
    const st = BP_NL_READ_VALUE.deriveStimulus!(p) as MockNumberLineStimulus;
    const u = readByTickCount(st, "P");
    return { matches: Math.round(Number(claimed) * 1000) === u, recomputedAnswer: fromU(u), method: "ticks_counted_from_the_stimulus" };
  },
  stageSuitability: STAGES,
  similarityControls: "the scale, the range, the number of small steps and the arrow position are resampled independently.",
  reasoningRoute: () => "interpretation",
  contextTag: (p) => `numberline_read_${p.d}_steps`,
  unknownPosition: () => "value_at_arrow",
  representationType: () => "number_line",
  misconceptionTargeted: "reading each small step as one whole unit, or as the same size as the labelled gap",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
};

// 2. Difference between two arrows --------------------------------------------
type DiffP = Line & { offA: number; offB: number };
const aU = (p: DiffP) => minU(p) + p.offA * minorU(p);
const bU = (p: DiffP) => minU(p) + p.offB * minorU(p);
export const BP_NL_DIFFERENCE: StructuralBlueprint<DiffP> = {
  blueprintId: "mr01-bp-numberline-difference",
  familyId: "mr01-scale-reading",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-03",
  mathematicalObjective: "Read two arrows on the same scale and find how much greater the right-hand one is (a difference of two read values, possibly across zero).",
  parameterRanges: { s: { min: 0, max: 9 }, start: { min: -4, max: 6 }, n: { min: 3, max: 8 }, d: { min: 2, max: 10 }, offA: { min: 1, max: 79 }, offB: { min: 2, max: 79 } },
  constraints: (p) => lineOk(p) && p.offA >= 1 && p.offB <= p.n * p.d - 1 && p.offB - p.offA >= 2 && p.offA % p.d !== 0 && p.offB % p.d !== 0,
  invalidCombinationDescription: "Both arrows are strictly inside the line, B is at least two small steps right of A, and neither sits exactly on a labelled mark (so both must be read between marks).",
  difficultyControls: (p) => {
    const crossesZero = aU(p) < 0 && bU(p) > 0;
    return crossesZero ? "hard" : p.d === 2 ? "medium" : "hard";
  },
  difficultyDimensions: ["two_values_read", "crossing_zero"],
  sampleParams: (random) => {
    const l = sampleLine(random);
    const top = Math.max(3, l.n * l.d - 1);
    return { ...l, offA: rint(random, 1, top - 2), offB: rint(random, 3, top) };
  },
  renderQuestionText: () => "The arrows marked A and B point to two numbers. How much greater is B than A?",
  deriveCorrectAnswer: (p) => fromU(bU(p) - aU(p)),
  deriveWorkedSteps: (p) => [
    `Each small step is ${fromU(minorU(p))}. A is ${fromU(aU(p))} and B is ${fromU(bU(p))}.`,
    `B is ${p.offB - p.offA} small steps to the right of A: ${p.offB - p.offA} × ${fromU(minorU(p))} = ${fromU(bU(p) - aU(p))}.`,
  ],
  deriveStimulus: (p) => stim(p, [{ label: "A", u: aU(p) }, { label: "B", u: bU(p) }]),
  independentAnswerCheck: (p, claimed) => {
    const st = BP_NL_DIFFERENCE.deriveStimulus!(p) as MockNumberLineStimulus;
    const u = readByTickCount(st, "B") - readByTickCount(st, "A");
    return { matches: Math.round(Number(claimed) * 1000) === u, recomputedAnswer: fromU(u), method: "both_arrows_read_from_the_stimulus_then_subtracted" };
  },
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "scale, range, small-step count and both arrow positions resampled independently.",
  reasoningRoute: () => "multi_step_application",
  contextTag: () => "numberline_difference",
  unknownPosition: () => "difference_of_two_read_values",
  representationType: () => "number_line",
  misconceptionTargeted: "reading the right-hand number minus zero, or counting labelled marks instead of small steps",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "independent_practice", "transfer"],
};

// 3. Read an arrow, then round it to the nearest labelled mark --------------
type RoundP = Line & { off: number };
const POWERS = [0, 3, 6, 9]; // major steps 0.1, 1, 10, 100
const UNIT_WORD = ["tenth", "whole number", "10", "100"];
const roundedU = (p: RoundP) => {
  const m = majorU(p);
  const v = minU(p) + p.off * minorU(p);
  const lower = v - mod(v, m);
  return 2 * mod(v, m) > m ? lower + m : lower;
};
export const BP_NL_READ_THEN_ROUND: StructuralBlueprint<RoundP> = {
  blueprintId: "mr06-bp-numberline-read-then-round",
  familyId: "precision-dec",
  competencyId: "MR-06",
  questionTypeId: "QT-MR-14",
  mathematicalObjective: "Read a number from a scale and round it to the nearest labelled mark (nearest tenth, whole number, 10 or 100), with exact halves excluded.",
  parameterRanges: { s: { min: 0, max: 9 }, start: { min: -4, max: 6 }, n: { min: 3, max: 8 }, d: { min: 2, max: 10 }, off: { min: 1, max: 79 } },
  constraints: (p) => lineOk(p) && POWERS.includes(p.s) && p.off >= 1 && p.off <= p.n * p.d - 1 && p.off % p.d !== 0 && 2 * mod(minU(p) + p.off * minorU(p), majorU(p)) !== majorU(p),
  invalidCombinationDescription: "The scale's labelled gap is a power of ten, the arrow is strictly between two labelled marks, and it is not exactly halfway between them (no tie to break).",
  difficultyControls: (p) => {
    const gap = Math.abs(2 * mod(minU(p) + p.off * minorU(p), majorU(p)) - majorU(p));
    return gap <= minorU(p) ? "hard" : p.start < 0 ? "hard" : p.d === 2 ? "easy" : "medium";
  },
  difficultyDimensions: ["closeness_to_the_halfway_point", "negative_range"],
  sampleParams: (random) => {
    for (;;) {
      const l = { ...sampleLine(random), s: POWERS[rint(random, 0, 3)] };
      const p = { ...l, off: rint(random, 1, Math.max(1, l.n * l.d - 1)) };
      if (BP_NL_READ_THEN_ROUND.constraints(p)) return p;
    }
  },
  renderQuestionText: (p) => `The arrow marked P points to a number. Round this number to the nearest ${UNIT_WORD[POWERS.indexOf(p.s)]}.`,
  deriveCorrectAnswer: (p) => fromU(roundedU(p)),
  deriveWorkedSteps: (p) => {
    const v = minU(p) + p.off * minorU(p);
    return [
      `Each small step is ${fromU(minorU(p))}, so the arrow points to ${fromU(v)}.`,
      `${fromU(v)} is between ${fromU(v - mod(v, majorU(p)))} and ${fromU(v - mod(v, majorU(p)) + majorU(p))}. It is nearer to ${fromU(roundedU(p))}, so the answer is ${fromU(roundedU(p))}.`,
    ];
  },
  deriveStimulus: (p) => stim(p, [{ label: "P", u: minU(p) + p.off * minorU(p) }]),
  // Independent route: read P from the stimulus, then compare distances to the two neighbouring labelled marks.
  independentAnswerCheck: (p, claimed) => {
    const st = BP_NL_READ_THEN_ROUND.deriveStimulus!(p) as MockNumberLineStimulus;
    const v = readByTickCount(st, "P");
    const m = Math.round(st.majorStep * 1000);
    const below = Math.floor(v / m) * m;
    const above = below + m;
    const nearest = Math.abs(v - below) < Math.abs(above - v) ? below : above;
    return { matches: Math.round(Number(claimed) * 1000) === nearest, recomputedAnswer: fromU(nearest), method: "nearest_of_two_marks_by_distance" };
  },
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "scale, range, small-step count and arrow position resampled with a no-tie constraint.",
  reasoningRoute: () => "multi_step_application",
  contextTag: (p) => `numberline_round_${UNIT_WORD[POWERS.indexOf(p.s)].replace(" ", "_")}`,
  unknownPosition: () => "rounded_value",
  representationType: () => "number_line",
  misconceptionTargeted: "rounding by always taking the lower mark, or rounding to the nearest small step instead of the nearest labelled mark",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "independent_practice", "transfer"],
};

export const CSSE_NUMBER_LINE_FAMILIES: EducationalFamily[] = [
  { familyId: "mr01-scale-reading", subject: "maths", blueprints: [BP_NL_READ_VALUE, BP_NL_DIFFERENCE] as EducationalFamily["blueprints"] },
  { familyId: "precision-dec", subject: "maths", blueprints: [BP_NL_READ_THEN_ROUND] as EducationalFamily["blueprints"] },
];
