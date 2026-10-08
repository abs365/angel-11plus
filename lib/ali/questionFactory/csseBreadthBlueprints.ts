import type { StructuralBlueprint, EducationalFamily } from "./types";
import type { MockTableStimulus } from "@/lib/mockAttempt/types";

/**
 * CSSE Completion, content expansion toward the 1,200 milestone, aimed at the thinnest Maths competencies in the
 * completion matrix rather than at the biggest families:
 *
 *   QT-MR-14 precision (12 practice items, no transfer-tagged, no Mock)   -> 2 blueprints (rounding decimals, rounding in context)
 *   QT-MR-02 missing operand (4 items, one tier)                          -> 2 blueprints (reverse a two-step process; consecutive numbers from a sum)
 *   QT-MR-03 measurement (5 items, one tier)                              -> 2 blueprints (compare across units; convert then divide)
 *   QT-MR-10 time (34 items, prose only)                                  -> 2 blueprints using a timetable TABLE (journey time; wait for the next service)
 *   QT-MR-05 sequences/rules                                              -> 2 blueprints using an input-output TABLE (find the rule; run it backwards)
 *   QT-MR-12 averages (63 items, lists only)                              -> 2 blueprints using a TABLE (mean; missing value from a stated mean)
 *
 * Every family gets at least TWO structurally different blueprints: the diversity gate rates a single-blueprint batch CRITICAL, so no
 * family is fed from one structure.
 *
 * Seven of the twelve reuse the table stimulus (the representation is necessary: the data is never in the question text).
 * Every answer is derived by deterministic integer arithmetic and re-derived in the tests by an independent method.
 * Additive blueprints for live families; nothing here touches the bank, Mock, or publication.
 */

function table(headers: string[], rows: (string | number)[][], caption: string): MockTableStimulus {
  return { type: "table", caption, headers, rows: rows.map((r) => r.map(String)) };
}
const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);
const pad2 = (n: number) => String(n).padStart(2, "0");
const clock = (mins: number) => `${pad2(Math.floor(mins / 60))}:${pad2(mins % 60)}`;

// ---------------------------------------------------------------------------
// 1. Think of a number (two-step reverse) -- family mr01-missing-operand
// ---------------------------------------------------------------------------
type ThinkParams = { n: number; m: number; a: number; op: number; ctx: number };
const thinkResult = (p: ThinkParams) => (p.op === 0 ? p.n * p.m + p.a : p.n * p.m - p.a);
const THINK_WORDING = [
  (p: ThinkParams) => `I think of a number. I multiply it by ${p.m} and then ${p.op === 0 ? "add" : "subtract"} ${p.a}. My answer is ${thinkResult(p)}. What number did I think of?`,
  (p: ThinkParams) => `Priya picks a number, multiplies it by ${p.m}, then ${p.op === 0 ? "adds" : "takes away"} ${p.a}. She gets ${thinkResult(p)}. What was her number?`,
  (p: ThinkParams) => `A number machine multiplies the input by ${p.m} and then ${p.op === 0 ? "adds" : "subtracts"} ${p.a}. The output is ${thinkResult(p)}. What was the input?`,
];
const THINK_CONTEXT = ["think_of_a_number", "think_of_a_number_named", "number_machine"];
export const BP_THINK_OF_A_NUMBER: StructuralBlueprint<ThinkParams> = {
  blueprintId: "mr01-bp-think-of-a-number-two-step",
  familyId: "mr01-missing-operand",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-02",
  mathematicalObjective: "Undo a two-step process: reverse the LAST operation first, then the first.",
  parameterRanges: { n: { min: 3, max: 30 }, m: { min: 2, max: 9 }, a: { min: 3, max: 40 }, op: { min: 0, max: 1 }, ctx: { min: 0, max: 2 } },
  constraints: (p) => thinkResult(p) > 0 && (p.op === 0 || p.n * p.m > p.a + 5),
  invalidCombinationDescription: "The result is a positive whole number; with subtraction the product comfortably exceeds the amount taken away.",
  difficultyControls: (p) => (p.op === 1 && p.m >= 7 ? "hard" : "medium"),
  difficultyDimensions: ["operation_order_reversal"],
  sampleParams: (random) => ({ n: 3 + Math.floor(random() * 28), m: 2 + Math.floor(random() * 8), a: 3 + Math.floor(random() * 38), op: Math.floor(random() * 2), ctx: Math.floor(random() * 3) }),
  renderQuestionText: (p) => THINK_WORDING[p.ctx](p),
  deriveCorrectAnswer: (p) => String(p.n),
  deriveWorkedSteps: (p) => [
    `Work backwards. The last step was to ${p.op === 0 ? "add" : "subtract"} ${p.a}, so ${p.op === 0 ? "subtract" : "add"} ${p.a} first: ${thinkResult(p)} ${p.op === 0 ? "−" : "+"} ${p.a} = ${p.n * p.m}.`,
    `The first step was to multiply by ${p.m}, so divide: ${p.n * p.m} ÷ ${p.m} = ${p.n}.`,
  ],
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "n/m/a/op resampled independently; wording rotated by ctx.",
  reasoningRoute: () => "reverse_reasoning",
  contextTag: (p) => THINK_CONTEXT[p.ctx],
  unknownPosition: () => "starting_number",
  representationType: () => "prose",
  misconceptionTargeted: "dividing by the multiplier before removing the added (or subtracted) amount, undoing the steps in the order they were done",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice", "transfer"],
};

// ---------------------------------------------------------------------------
// 2. Round to decimal places (integer arithmetic; carry cases included) -- family precision-dec
// ---------------------------------------------------------------------------
type RoundDpParams = { t: number; dp: number; ctx: number };
function fmtDecimal(scaled: number, places: number): string {
  const s = String(scaled).padStart(places + 1, "0");
  return places === 0 ? s : `${s.slice(0, s.length - places)}.${s.slice(s.length - places)}`;
}
const roundDp = (p: RoundDpParams) => (p.dp === 2 ? Math.floor((p.t + 5) / 10) : Math.floor((p.t + 50) / 100));
const cutDigit = (p: RoundDpParams) => (p.dp === 2 ? p.t % 10 : Math.floor((p.t % 100) / 10));
const ROUND_DP_WORDING = [
  (p: RoundDpParams) => `Round ${fmtDecimal(p.t, 3)} to ${p.dp} decimal place${p.dp === 1 ? "" : "s"}.`,
  (p: RoundDpParams) => `A piece of wood is ${fmtDecimal(p.t, 3)} metres long. Write its length to ${p.dp} decimal place${p.dp === 1 ? "" : "s"}.`,
  (p: RoundDpParams) => `A runner's time is ${fmtDecimal(p.t, 3)} seconds. Give the time to ${p.dp} decimal place${p.dp === 1 ? "" : "s"}.`,
];
const ROUND_DP_CONTEXT = ["round_decimal_bare", "round_decimal_length", "round_decimal_time"];
export const BP_ROUND_DECIMAL_PLACES: StructuralBlueprint<RoundDpParams> = {
  blueprintId: "mr06-bp-round-decimal-places",
  familyId: "precision-dec",
  competencyId: "MR-06",
  questionTypeId: "QT-MR-14",
  mathematicalObjective: "Round a three-decimal-place number to 1 or 2 decimal places, including the cases that carry (…96 to …1) and exact halves.",
  parameterRanges: { t: { min: 1100, max: 49999 }, dp: { min: 1, max: 2 }, ctx: { min: 0, max: 2 } },
  constraints: (p) => cutDigit(p) !== 0 && p.t % 10 !== 0,
  invalidCombinationDescription: "The digit after the rounding position is not zero (so rounding actually changes the number) and the number really has three decimal places.",
  difficultyControls: (p) => {
    const d = cutDigit(p);
    return d === 5 || d === 9 ? "hard" : d >= 6 ? "medium" : "easy";
  },
  difficultyDimensions: ["rounding_digit_edge_cases"],
  sampleParams: (random) => {
    for (;;) {
      const t = 1100 + Math.floor(random() * 48900);
      const dp = 1 + Math.floor(random() * 2);
      // bias towards the instructive cases: a 5 after the cut (dp 2) and a carry through a 9 (dp 1)
      const bias = random();
      let tt = t;
      if (bias < 0.25 && dp === 2) tt = t - (t % 10) + 5;
      if (bias < 0.25 && dp === 1) tt = t - (t % 100) + 90 + (1 + Math.floor(random() * 9));
      if (tt % 10 === 0) continue;
      const p = { t: tt, dp, ctx: Math.floor(random() * 3) };
      if (cutDigit(p) !== 0) return p;
    }
  },
  renderQuestionText: (p) => ROUND_DP_WORDING[p.ctx](p),
  deriveCorrectAnswer: (p) => fmtDecimal(roundDp(p), p.dp),
  deriveWorkedSteps: (p) => {
    const d = cutDigit(p);
    return [
      `Look at the digit after the ${p.dp === 1 ? "first" : "second"} decimal place: it is ${d}.`,
      d >= 5 ? `${d} is 5 or more, so round the last kept digit UP (carry if it is a 9).` : `${d} is less than 5, so keep the last digit as it is.`,
      `${fmtDecimal(p.t, 3)} to ${p.dp} decimal place${p.dp === 1 ? "" : "s"} = ${fmtDecimal(roundDp(p), p.dp)}.`,
    ];
  },
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "t/dp resampled independently with a bias toward 5 and carry cases; wording rotated by ctx.",
  reasoningRoute: () => "direct_computation",
  contextTag: (p) => ROUND_DP_CONTEXT[p.ctx],
  unknownPosition: () => "rounded_value",
  representationType: () => "prose",
  misconceptionTargeted: "cutting the digits off (truncating) instead of rounding, or forgetting to carry when the kept digit is a 9",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice", "mastery_check"],
};

// ---------------------------------------------------------------------------
// 3. Round to the nearest 10 / 100 / 1000 in context -- family precision-dec
// ---------------------------------------------------------------------------
type RoundNearestParams = { n: number; u: number; ctx: number };
const UNITS = [10, 100, 1000];
const roundNearest = (p: RoundNearestParams) => Math.floor((p.n + UNITS[p.u] / 2) / UNITS[p.u]) * UNITS[p.u];
const withCommas = (n: number) => String(n).replace(/(\d)(?=(\d{3})+$)/g, "$1,");
const NEAREST_WORDING = [
  (p: RoundNearestParams) => `A football stadium had ${withCommas(p.n)} people at a match. Round this to the nearest ${UNITS[p.u]}.`,
  (p: RoundNearestParams) => `A town has ${withCommas(p.n)} people living in it. A newspaper rounds this to the nearest ${UNITS[p.u]}. What does it print?`,
  (p: RoundNearestParams) => `A school library has ${withCommas(p.n)} books. Estimate the number by rounding to the nearest ${UNITS[p.u]}.`,
];
const NEAREST_CONTEXT = ["round_nearest_stadium", "round_nearest_town", "round_nearest_library"];
export const BP_ROUND_NEAREST_IN_CONTEXT: StructuralBlueprint<RoundNearestParams> = {
  blueprintId: "mr06-bp-round-nearest-in-context",
  familyId: "precision-dec",
  competencyId: "MR-06",
  questionTypeId: "QT-MR-14",
  mathematicalObjective: "Round a large whole number to the nearest 10, 100 or 1,000, including exact midpoints (which round up) and carries across a place.",
  parameterRanges: { n: { min: 1000, max: 99999 }, u: { min: 0, max: 2 }, ctx: { min: 0, max: 2 } },
  constraints: (p) => p.n % UNITS[p.u] !== 0,
  invalidCombinationDescription: "The number is not already a multiple of the rounding unit.",
  difficultyControls: (p) => {
    const r = p.n % UNITS[p.u];
    return r === UNITS[p.u] / 2 || r >= UNITS[p.u] - UNITS[p.u] / 10 ? "hard" : p.u === 0 ? "easy" : "medium";
  },
  difficultyDimensions: ["midpoint_and_carry_cases", "rounding_unit"],
  sampleParams: (random) => {
    for (;;) {
      const u = Math.floor(random() * 3);
      let n = 1000 + Math.floor(random() * 98999);
      if (random() < 0.25) n = n - (n % UNITS[u]) + UNITS[u] / 2; // exact midpoint
      if (n % UNITS[u] !== 0) return { n, u, ctx: Math.floor(random() * 3) };
    }
  },
  renderQuestionText: (p) => NEAREST_WORDING[p.ctx](p),
  deriveCorrectAnswer: (p) => String(roundNearest(p)),
  deriveWorkedSteps: (p) => {
    const unit = UNITS[p.u];
    const r = p.n % unit;
    return [
      `Look at the part below ${unit}: ${r}. Half of ${unit} is ${unit / 2}.`,
      r >= unit / 2 ? `${r} is ${unit / 2} or more, so round UP to ${roundNearest(p)}.` : `${r} is less than ${unit / 2}, so round DOWN to ${roundNearest(p)}.`,
    ];
  },
  stageSuitability: ["FOUNDATION", "DEVELOPMENT"],
  similarityControls: "n/u resampled independently with a bias toward exact midpoints; wording rotated by ctx.",
  reasoningRoute: () => "interpretation",
  contextTag: (p) => NEAREST_CONTEXT[p.ctx],
  unknownPosition: () => "rounded_whole_number",
  representationType: () => "prose",
  misconceptionTargeted: "rounding an exact midpoint down, or rounding down whenever the next digit is not 'big enough' without checking against half the unit",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
};

// ---------------------------------------------------------------------------
// 4. Compare quantities in different units -- family mr01-measurement-conversion
// ---------------------------------------------------------------------------
type UnitCompareParams = { big: number; small: number; kind: number; ctx: number };
const KINDS = [
  { bigUnit: "metres", smallUnit: "centimetres", per: 100, thing: ["rope", "ribbon", "pipe"] },
  { bigUnit: "kilograms", smallUnit: "grams", per: 1000, thing: ["bag of flour", "box of apples", "parcel"] },
  { bigUnit: "litres", smallUnit: "millilitres", per: 1000, thing: ["bottle of juice", "jug of water", "tank of paint"] },
];
// `big` is in tenths of the big unit (e.g. 24 = 2.4 m); one tenth = per/10 small units.
const bigInSmall = (p: UnitCompareParams) => (p.big * KINDS[p.kind].per) / 10;
export const BP_COMPARE_IN_DIFFERENT_UNITS: StructuralBlueprint<UnitCompareParams> = {
  blueprintId: "mr01-bp-compare-different-units",
  familyId: "mr01-measurement-conversion",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-03",
  mathematicalObjective: "Convert so two quantities are in the same unit, then find the difference -- the conversion is necessary before any comparison.",
  parameterRanges: { big: { min: 12, max: 48 }, small: { min: 50, max: 4500 }, kind: { min: 0, max: 2 }, ctx: { min: 0, max: 2 } },
  constraints: (p) => {
    const big = bigInSmall(p);
    return big - p.small >= 10 && big - p.small <= big / 2 && p.small % 5 === 0 && p.small >= big / 4;
  },
  invalidCombinationDescription: "The converted larger quantity exceeds the smaller one by a sensible amount (at least 10 small units, at most half), and the small quantity is a multiple of 5 and not tiny.",
  difficultyControls: (p) => (KINDS[p.kind].per === 100 ? "medium" : "hard"),
  difficultyDimensions: ["conversion_factor", "convert_before_compare"],
  sampleParams: (random) => {
    for (;;) {
      const kind = Math.floor(random() * 3);
      const big = 12 + Math.floor(random() * 37);
      const bs = (big * KINDS[kind].per) / 10;
      const small = 5 * Math.round((bs * (0.5 + random() * 0.45)) / 5);
      const p = { big, small, kind, ctx: Math.floor(random() * 3) };
      if (small >= 50 && small <= 4500 && bigInSmall(p) - small >= 10 && bigInSmall(p) - small <= bigInSmall(p) / 2 && small % 5 === 0 && small >= bigInSmall(p) / 4) return p;
    }
  },
  renderQuestionText: (p) => {
    const k = KINDS[p.kind];
    const t = k.thing[p.ctx];
    const ask = [
      `How many ${k.smallUnit} longer is the first ${t} than the second?`,
      `How many ${k.smallUnit} heavier is the first ${t} than the second?`,
      `How many ${k.smallUnit} more is in the first ${t} than in the second?`,
    ][p.kind];
    return `One ${t} is ${(p.big / 10).toFixed(1)} ${k.bigUnit}. Another ${t} is ${p.small} ${k.smallUnit}. ${ask}`;
  },
  deriveCorrectAnswer: (p) => String(bigInSmall(p) - p.small),
  deriveWorkedSteps: (p) => {
    const k = KINDS[p.kind];
    return [
      `Change ${(p.big / 10).toFixed(1)} ${k.bigUnit} into ${k.smallUnit}: ${(p.big / 10).toFixed(1)} × ${k.per} = ${bigInSmall(p)} ${k.smallUnit}.`,
      `Now both are in ${k.smallUnit}: ${bigInSmall(p)} − ${p.small} = ${bigInSmall(p) - p.small}.`,
    ];
  },
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "big/small/kind resampled independently with a constrained gap; item rotated by ctx.",
  reasoningRoute: () => "multi_step_application",
  contextTag: (p) => ["units_length", "units_mass", "units_capacity"][p.kind],
  unknownPosition: () => "difference_after_conversion",
  representationType: () => "prose",
  misconceptionTargeted: "subtracting the two numbers as they are written, without converting to the same unit first",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice", "transfer"],
};

// ---------------------------------------------------------------------------
// 5. Timetable journey (TABLE) -- family mr04-elapsed-time
// ---------------------------------------------------------------------------
type TimetableParams = { t0: number; g1: number; g2: number; g3: number; i: number; j: number; ctx: number };
const TT_CONTEXTS = [
  { tag: "timetable_bus", caption: "Bus timetable: time at each stop", stops: ["Market Square", "Library", "School", "Park"], col: "Time", vehicle: "bus" },
  { tag: "timetable_train", caption: "Train timetable: time at each stop", stops: ["Harbour", "Central", "Riverside", "Hilltop"], col: "Time", vehicle: "train" },
  { tag: "timetable_coach", caption: "Coach timetable: time at each stop", stops: ["Depot", "Museum", "Castle", "Beach"], col: "Time", vehicle: "coach" },
];
const ttTimes = (p: TimetableParams) => [p.t0, p.t0 + p.g1, p.t0 + p.g1 + p.g2, p.t0 + p.g1 + p.g2 + p.g3];
export const BP_TIMETABLE_JOURNEY: StructuralBlueprint<TimetableParams> = {
  blueprintId: "mr04-bp-timetable-journey-time",
  familyId: "mr04-elapsed-time",
  competencyId: "MR-04",
  questionTypeId: "QT-MR-10",
  mathematicalObjective: "Read two times from a timetable and find the journey time in minutes, including journeys that cross an hour boundary.",
  parameterRanges: { t0: { min: 360, max: 1080 }, g1: { min: 12, max: 55 }, g2: { min: 12, max: 55 }, g3: { min: 12, max: 55 }, i: { min: 0, max: 2 }, j: { min: 1, max: 3 }, ctx: { min: 0, max: 2 } },
  constraints: (p) => p.j > p.i && p.t0 % 5 === 0 && ttTimes(p).every((t) => t < 1440),
  invalidCombinationDescription: "The later stop is after the earlier one, the first departure is on a five-minute mark and every time falls on the same day.",
  difficultyControls: (p) => {
    const t = ttTimes(p);
    const crosses = Math.floor(t[p.i] / 60) !== Math.floor(t[p.j] / 60) && t[p.j] % 60 < t[p.i] % 60;
    return crosses ? "hard" : "medium";
  },
  difficultyDimensions: ["crossing_the_hour", "stops_between"],
  sampleParams: (random) => {
    for (;;) {
      const t0 = 5 * (72 + Math.floor(random() * 145));
      const g = [12, 12, 12].map(() => 12 + Math.floor(random() * 44));
      const i = Math.floor(random() * 3);
      const j = i + 1 + Math.floor(random() * (3 - i));
      const p = { t0, g1: g[0], g2: g[1], g3: g[2], i, j, ctx: Math.floor(random() * 3) };
      if (ttTimes(p).every((t) => t < 1440)) return p;
    }
  },
  renderQuestionText: (p) => {
    const c = TT_CONTEXTS[p.ctx];
    return `The timetable shows the time a ${c.vehicle} is at each stop. How many minutes does the journey from ${c.stops[p.i]} to ${c.stops[p.j]} take?`;
  },
  deriveCorrectAnswer: (p) => String(ttTimes(p)[p.j] - ttTimes(p)[p.i]),
  deriveWorkedSteps: (p) => {
    const c = TT_CONTEXTS[p.ctx];
    const t = ttTimes(p);
    return [
      `Read the two times: ${c.stops[p.i]} at ${clock(t[p.i])} and ${c.stops[p.j]} at ${clock(t[p.j])}.`,
      `From ${clock(t[p.i])} to ${clock(t[p.j])} is ${t[p.j] - t[p.i]} minutes (count on to the next hour, then add the rest).`,
    ];
  },
  deriveStimulus: (p) => {
    const c = TT_CONTEXTS[p.ctx];
    return table(["Stop", c.col], ttTimes(p).map((t, k) => [c.stops[k], clock(t)]), c.caption);
  },
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "start time, three gaps and the two stops resampled independently; route rotated by ctx.",
  reasoningRoute: () => "interpretation",
  contextTag: (p) => TT_CONTEXTS[p.ctx].tag,
  unknownPosition: () => "journey_minutes",
  representationType: () => "table",
  misconceptionTargeted: "subtracting the minutes digits only, or treating the times as decimals, when the journey crosses the hour",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
};

// ---------------------------------------------------------------------------
// 6. Input-output table: find the rule, then apply it -- family mr02-sequence-rule
// ---------------------------------------------------------------------------
type FunctionTableParams = { a: number; b: number; big: number; ctx: number };
const FT_CONTEXTS = [
  { tag: "function_table_machine", caption: "Number machine", inHead: "Input", outHead: "Output", ask: (n: number) => `What is the output when the input is ${n}?` },
  { tag: "function_table_pattern", caption: "Pattern of counters", inHead: "Pattern number", outHead: "Counters", ask: (n: number) => `How many counters are in pattern number ${n}?` },
  { tag: "function_table_savings", caption: "Saving plan", inHead: "Week", outHead: "Total saved (£)", ask: (n: number) => `What is the total saved (£) in week ${n}?` },
];
export const BP_FUNCTION_TABLE_RULE: StructuralBlueprint<FunctionTableParams> = {
  blueprintId: "mr02-bp-function-table-rule",
  familyId: "mr02-sequence-rule",
  competencyId: "MR-02",
  questionTypeId: "QT-MR-05",
  mathematicalObjective: "Work out the rule 'multiply by a then add b' from the first rows of an input-output table, then use it on an input far beyond the table.",
  parameterRanges: { a: { min: 2, max: 9 }, b: { min: 1, max: 9 }, big: { min: 12, max: 30 }, ctx: { min: 0, max: 2 } },
  constraints: (p) => p.a !== p.b,
  invalidCombinationDescription: "The multiplier and the added amount differ (so the rule cannot be mistaken for 'add the same amount').",
  difficultyControls: (p) => (p.a >= 6 ? "hard" : "medium"),
  difficultyDimensions: ["rule_with_two_operations", "extrapolation_distance"],
  sampleParams: (random) => ({ a: 2 + Math.floor(random() * 8), b: 1 + Math.floor(random() * 9), big: 12 + Math.floor(random() * 19), ctx: Math.floor(random() * 3) }),
  renderQuestionText: (p) => `The table shows how the numbers are linked. ${FT_CONTEXTS[p.ctx].ask(p.big)}`,
  deriveCorrectAnswer: (p) => String(p.a * p.big + p.b),
  deriveWorkedSteps: (p) => [
    `Look at how the second column changes: it goes up by ${p.a} each time, so the rule starts with × ${p.a}.`,
    `Check the first row: ${p.a} × 1 = ${p.a}, and the table shows ${p.a + p.b}, so the rule also adds ${p.b}.`,
    `Rule: × ${p.a} then + ${p.b}. For ${p.big}: ${p.a} × ${p.big} + ${p.b} = ${p.a * p.big + p.b}.`,
  ],
  deriveStimulus: (p) => {
    const c = FT_CONTEXTS[p.ctx];
    return table([c.inHead, c.outHead], [1, 2, 3, 4].map((n) => [n, p.a * n + p.b]), c.caption);
  },
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "a/b/target input resampled independently; table caption and headings rotated by ctx.",
  reasoningRoute: () => "multi_step_application",
  contextTag: (p) => FT_CONTEXTS[p.ctx].tag,
  unknownPosition: () => "output_for_distant_input",
  representationType: () => "table",
  misconceptionTargeted: "using only the 'adds a each time' pattern (a counting-on rule) and multiplying the input by the step without the starting offset",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "independent_practice", "transfer", "mastery_check"],
};

// ---------------------------------------------------------------------------
// 7. Mean from a table -- family mr01-average-mean
// ---------------------------------------------------------------------------
type TableMeanParams = { v1: number; v2: number; v3: number; v4: number; v5: number; ctx: number };
const tmVals = (p: TableMeanParams) => [p.v1, p.v2, p.v3, p.v4, p.v5];
const TM_CONTEXTS = [
  { tag: "mean_table_rainfall", caption: "Rainfall each day", heads: ["Day", "Rainfall (mm)"], rows: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], q: "What is the mean rainfall per day, in millimetres?" },
  { tag: "mean_table_scores", caption: "Spelling test scores", heads: ["Pupil", "Score"], rows: ["Asha", "Ben", "Chloe", "Dev", "Ella"], q: "What is the mean score?" },
  { tag: "mean_table_distance", caption: "Distance cycled each day", heads: ["Day", "Distance (km)"], rows: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"], q: "What is the mean distance cycled per day, in kilometres?" },
];
export const BP_MEAN_FROM_TABLE: StructuralBlueprint<TableMeanParams> = {
  blueprintId: "mr01-bp-mean-from-table",
  familyId: "mr01-average-mean",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-12",
  mathematicalObjective: "Read five values from a table, total them and divide by five to find the mean (a whole number).",
  parameterRanges: { v1: { min: 4, max: 60 }, v2: { min: 4, max: 60 }, v3: { min: 4, max: 60 }, v4: { min: 4, max: 60 }, v5: { min: 4, max: 60 }, ctx: { min: 0, max: 2 } },
  constraints: (p) => sum(tmVals(p)) % 5 === 0 && new Set(tmVals(p)).size >= 4,
  invalidCombinationDescription: "The five values total a multiple of 5 (so the mean is a whole number) and at least four of them differ.",
  difficultyControls: (p) => (Math.max(...tmVals(p)) - Math.min(...tmVals(p)) <= 20 ? "medium" : "hard"),
  difficultyDimensions: ["spread_of_values"],
  sampleParams: (random) => {
    for (;;) {
      const v = Array.from({ length: 5 }, () => 4 + Math.floor(random() * 57));
      if (sum(v) % 5 === 0 && new Set(v).size >= 4) return { v1: v[0], v2: v[1], v3: v[2], v4: v[3], v5: v[4], ctx: Math.floor(random() * 3) };
    }
  },
  renderQuestionText: (p) => `The table shows ${TM_CONTEXTS[p.ctx].caption.toLowerCase()}. ${TM_CONTEXTS[p.ctx].q}`,
  deriveCorrectAnswer: (p) => String(sum(tmVals(p)) / 5),
  deriveWorkedSteps: (p) => [`Total of the five values: ${tmVals(p).join(" + ")} = ${sum(tmVals(p))}.`, `Mean = ${sum(tmVals(p))} ÷ 5 = ${sum(tmVals(p)) / 5}.`],
  deriveStimulus: (p) => {
    const c = TM_CONTEXTS[p.ctx];
    return table(c.heads, tmVals(p).map((v, k) => [c.rows[k], v]), c.caption);
  },
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "five values resampled with a divisible total; caption and names rotated by ctx.",
  reasoningRoute: () => "interpretation",
  contextTag: (p) => TM_CONTEXTS[p.ctx].tag,
  unknownPosition: () => "mean_of_table_values",
  representationType: () => "table",
  misconceptionTargeted: "dividing the total by the largest value, or by the number of columns in the table instead of the number of values",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
};

// ---------------------------------------------------------------------------
// 8. Consecutive numbers from their sum -- family mr01-missing-operand (second structure)
// ---------------------------------------------------------------------------
type ConsecutiveParams = { mid: number; c: number; w: number; ctx: number };
const consCount = (p: ConsecutiveParams) => (p.c === 0 ? 3 : 5);
const consSum = (p: ConsecutiveParams) => consCount(p) * p.mid;
const CONS_WORDS = ["three", "five"];
const CONS_WORDING = [
  (p: ConsecutiveParams) => `The sum of ${CONS_WORDS[p.c]} consecutive whole numbers is ${consSum(p)}. What is the ${p.w === 0 ? "smallest" : "largest"} of the numbers?`,
  (p: ConsecutiveParams) => `${CONS_WORDS[p.c][0].toUpperCase() + CONS_WORDS[p.c].slice(1)} houses next to each other on one side of a road have consecutive numbers. The house numbers add up to ${consSum(p)}. What is the ${p.w === 0 ? "lowest" : "highest"} house number?`,
  (p: ConsecutiveParams) => `${CONS_WORDS[p.c][0].toUpperCase() + CONS_WORDS[p.c].slice(1)} consecutive page numbers in a book add up to ${consSum(p)}. What is the ${p.w === 0 ? "first" : "last"} of these pages?`,
];
const CONS_CONTEXT = ["consecutive_numbers", "consecutive_house_numbers", "consecutive_pages"];
export const BP_CONSECUTIVE_FROM_SUM: StructuralBlueprint<ConsecutiveParams> = {
  blueprintId: "mr01-bp-consecutive-numbers-from-sum",
  familyId: "mr01-missing-operand",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-02",
  mathematicalObjective: "Use the symmetry of consecutive numbers (their mean is the middle number) to find an end number from the total.",
  parameterRanges: { mid: { min: 6, max: 90 }, c: { min: 0, max: 1 }, w: { min: 0, max: 1 }, ctx: { min: 0, max: 2 } },
  constraints: (p) => p.mid - (consCount(p) - 1) / 2 >= 1,
  invalidCombinationDescription: "The smallest of the consecutive numbers is at least 1.",
  difficultyControls: (p) => (p.c === 1 ? "hard" : "medium"),
  difficultyDimensions: ["count_of_numbers"],
  sampleParams: (random) => ({ mid: 6 + Math.floor(random() * 85), c: Math.floor(random() * 2), w: Math.floor(random() * 2), ctx: Math.floor(random() * 3) }),
  renderQuestionText: (p) => CONS_WORDING[p.ctx](p),
  deriveCorrectAnswer: (p) => String(p.w === 0 ? p.mid - (consCount(p) - 1) / 2 : p.mid + (consCount(p) - 1) / 2),
  deriveWorkedSteps: (p) => [
    `The middle number is the mean: ${consSum(p)} ÷ ${consCount(p)} = ${p.mid}.`,
    `The numbers are ${Array.from({ length: consCount(p) }, (_, k) => p.mid - (consCount(p) - 1) / 2 + k).join(", ")}, so the ${p.w === 0 ? "smallest" : "largest"} is ${p.w === 0 ? p.mid - (consCount(p) - 1) / 2 : p.mid + (consCount(p) - 1) / 2}.`,
  ],
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "middle number, count and which end is asked resampled independently; wording rotated by ctx.",
  reasoningRoute: () => "reverse_reasoning",
  contextTag: (p) => CONS_CONTEXT[p.ctx],
  unknownPosition: (p) => (p.w === 0 ? "smallest_consecutive" : "largest_consecutive"),
  representationType: () => "prose",
  misconceptionTargeted: "giving the total divided by the count (the middle number) as the smallest or largest, forgetting to move to the end of the run",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "independent_practice", "transfer"],
};

// ---------------------------------------------------------------------------
// 9. Convert, then divide into portions -- family mr01-measurement-conversion (second structure)
// ---------------------------------------------------------------------------
type ConvertDivideParams = { big: number; p: number; kind: number; ctx: number };
const cdTotal = (q: ConvertDivideParams) => (q.big * KINDS[q.kind].per) / 10;
const CD_PORTIONS = [
  (q: ConvertDivideParams, t: string) => `A ${t} is ${(q.big / 10).toFixed(1)} metres long. It is cut into pieces that are each ${q.p} centimetres long. How many pieces can be cut?`,
  (q: ConvertDivideParams, t: string) => `A ${t} holds ${(q.big / 10).toFixed(1)} kilograms. It is shared into portions of ${q.p} grams each. How many portions are there?`,
  (q: ConvertDivideParams, t: string) => `A ${t} holds ${(q.big / 10).toFixed(1)} litres. Each cup holds ${q.p} millilitres. How many cups can be filled?`,
];
export const BP_CONVERT_THEN_DIVIDE: StructuralBlueprint<ConvertDivideParams> = {
  blueprintId: "mr01-bp-convert-then-divide",
  familyId: "mr01-measurement-conversion",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-03",
  mathematicalObjective: "Convert the large quantity into the small unit, then divide by the portion size to count how many portions.",
  parameterRanges: { big: { min: 12, max: 48 }, p: { min: 5, max: 400 }, kind: { min: 0, max: 2 }, ctx: { min: 0, max: 2 } },
  constraints: (q) => {
    const total = cdTotal(q);
    return q.p % 5 === 0 && total % q.p === 0 && total / q.p >= 4 && total / q.p <= 40;
  },
  invalidCombinationDescription: "The portion size divides the converted total exactly and gives between 4 and 40 portions.",
  difficultyControls: (q) => (KINDS[q.kind].per === 100 ? "medium" : "hard"),
  difficultyDimensions: ["conversion_factor", "convert_before_divide"],
  sampleParams: (random) => {
    for (;;) {
      const kind = Math.floor(random() * 3);
      const big = 12 + Math.floor(random() * 37);
      const q = { big, p: 5 * (1 + Math.floor(random() * 80)), kind, ctx: Math.floor(random() * 3) };
      const total = cdTotal(q);
      if (total % q.p === 0 && total / q.p >= 4 && total / q.p <= 40) return q;
    }
  },
  renderQuestionText: (q) => CD_PORTIONS[q.kind](q, KINDS[q.kind].thing[q.ctx]),
  deriveCorrectAnswer: (q) => String(cdTotal(q) / q.p),
  deriveWorkedSteps: (q) => [
    `Change ${(q.big / 10).toFixed(1)} ${KINDS[q.kind].bigUnit} into ${KINDS[q.kind].smallUnit}: ${(q.big / 10).toFixed(1)} × ${KINDS[q.kind].per} = ${cdTotal(q)} ${KINDS[q.kind].smallUnit}.`,
    `Divide by the portion size: ${cdTotal(q)} ÷ ${q.p} = ${cdTotal(q) / q.p}.`,
  ],
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "big/portion/kind resampled independently with an exact-division constraint; item rotated by ctx.",
  reasoningRoute: () => "multi_step_application",
  contextTag: (q) => ["portions_length", "portions_mass", "portions_capacity"][q.kind],
  unknownPosition: () => "number_of_portions",
  representationType: () => "prose",
  misconceptionTargeted: "dividing the numbers as written (2.4 by 30) without converting, or converting the portion instead of the whole and slipping on the factor",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
};

// ---------------------------------------------------------------------------
// 10. Timetable: waiting time for the next service (TABLE) -- family mr04-elapsed-time (second structure)
// ---------------------------------------------------------------------------
type TimetableWaitParams = { t0: number; g1: number; g2: number; g3: number; g4: number; k: number; off: number; ctx: number };
const twTimes = (p: TimetableWaitParams) => {
  const t = [p.t0];
  for (const g of [p.g1, p.g2, p.g3, p.g4]) t.push(t[t.length - 1] + g);
  return t;
};
const TW_CONTEXTS = [
  { tag: "timetable_wait_bus", caption: "Buses from Market Square", noun: "bus", where: "bus stop" },
  { tag: "timetable_wait_train", caption: "Trains from Central Station", noun: "train", where: "station" },
  { tag: "timetable_wait_ferry", caption: "Ferries from the Harbour", noun: "ferry", where: "harbour" },
];
export const BP_TIMETABLE_WAIT: StructuralBlueprint<TimetableWaitParams> = {
  blueprintId: "mr04-bp-timetable-wait-for-next",
  familyId: "mr04-elapsed-time",
  competencyId: "MR-04",
  questionTypeId: "QT-MR-10",
  mathematicalObjective: "Find the first departure AFTER a stated arrival time in a list of departures, then work out the wait in minutes.",
  parameterRanges: { t0: { min: 360, max: 1080 }, g1: { min: 15, max: 55 }, g2: { min: 15, max: 55 }, g3: { min: 15, max: 55 }, g4: { min: 15, max: 55 }, k: { min: 0, max: 3 }, off: { min: 2, max: 53 }, ctx: { min: 0, max: 2 } },
  constraints: (p) => {
    const gaps = [p.g1, p.g2, p.g3, p.g4];
    return p.t0 % 5 === 0 && p.off >= 2 && p.off <= gaps[p.k] - 2 && twTimes(p).every((t) => t < 1440);
  },
  invalidCombinationDescription: "The arrival falls strictly between two departures (at least 2 minutes after one and 2 before the next) and every time is on the same day.",
  difficultyControls: (p) => {
    const t = twTimes(p);
    const arrive = t[p.k] + p.off;
    return Math.floor(arrive / 60) !== Math.floor(t[p.k + 1] / 60) ? "hard" : "medium";
  },
  difficultyDimensions: ["next_departure_after_arrival", "crossing_the_hour"],
  sampleParams: (random) => {
    for (;;) {
      const gaps = Array.from({ length: 4 }, () => 15 + Math.floor(random() * 41));
      const k = Math.floor(random() * 4);
      const off = 2 + Math.floor(random() * (gaps[k] - 3));
      const p = { t0: 5 * (72 + Math.floor(random() * 145)), g1: gaps[0], g2: gaps[1], g3: gaps[2], g4: gaps[3], k, off, ctx: Math.floor(random() * 3) };
      if (off <= gaps[k] - 2 && twTimes(p).every((t) => t < 1440)) return p;
    }
  },
  renderQuestionText: (p) => {
    const c = TW_CONTEXTS[p.ctx];
    const arrive = twTimes(p)[p.k] + p.off;
    return `The timetable shows when each ${c.noun} leaves. Sam gets to the ${c.where} at ${clock(arrive)}. How many minutes must he wait for the next ${c.noun}?`;
  },
  deriveCorrectAnswer: (p) => String(twTimes(p)[p.k + 1] - (twTimes(p)[p.k] + p.off)),
  deriveWorkedSteps: (p) => {
    const t = twTimes(p);
    const arrive = t[p.k] + p.off;
    return [
      `Sam arrives at ${clock(arrive)}. Look for the first ${TW_CONTEXTS[p.ctx].noun} AFTER that time: ${clock(t[p.k + 1])}.`,
      `Wait = ${clock(t[p.k + 1])} − ${clock(arrive)} = ${t[p.k + 1] - arrive} minutes.`,
    ];
  },
  deriveStimulus: (p) => {
    const c = TW_CONTEXTS[p.ctx];
    return table(["Service", "Leaves at"], twTimes(p).map((t, k) => [`${c.noun[0].toUpperCase() + c.noun.slice(1)} ${k + 1}`, clock(t)]), c.caption);
  },
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "start time, four gaps, the gap Sam arrives in and his offset resampled independently; service rotated by ctx.",
  reasoningRoute: () => "interpretation",
  contextTag: (p) => TW_CONTEXTS[p.ctx].tag,
  unknownPosition: () => "wait_minutes",
  representationType: () => "table",
  misconceptionTargeted: "using the departure BEFORE the arrival time, or the nearest departure, instead of the next one after arriving",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "independent_practice", "transfer"],
};

// ---------------------------------------------------------------------------
// 11. Function table in reverse: which input gives this output (TABLE) -- family mr02-sequence-rule (second structure)
// ---------------------------------------------------------------------------
type FunctionReverseParams = { a: number; b: number; target: number; ctx: number };
export const BP_FUNCTION_TABLE_REVERSE: StructuralBlueprint<FunctionReverseParams> = {
  blueprintId: "mr02-bp-function-table-reverse",
  familyId: "mr02-sequence-rule",
  competencyId: "MR-02",
  questionTypeId: "QT-MR-05",
  mathematicalObjective: "Work out the rule from a table, then run it backwards: given an output far beyond the table, find the input.",
  parameterRanges: { a: { min: 2, max: 9 }, b: { min: 1, max: 9 }, target: { min: 12, max: 30 }, ctx: { min: 0, max: 2 } },
  constraints: (p) => p.a !== p.b,
  invalidCombinationDescription: "The multiplier and the added amount differ; the chosen output always comes from a whole-number input.",
  difficultyControls: (p) => (p.a >= 6 ? "hard" : "medium"),
  difficultyDimensions: ["rule_reversal", "extrapolation_distance"],
  sampleParams: (random) => ({ a: 2 + Math.floor(random() * 8), b: 1 + Math.floor(random() * 9), target: 12 + Math.floor(random() * 19), ctx: Math.floor(random() * 3) }),
  renderQuestionText: (p) => {
    const out = p.a * p.target + p.b;
    return `The table shows how the numbers are linked. ${[`The output is ${out}. What was the input?`, `A pattern has ${out} counters. What is its pattern number?`, `The total saved is £${out}. In which week is that?`][p.ctx]}`;
  },
  deriveCorrectAnswer: (p) => String(p.target),
  deriveWorkedSteps: (p) => [
    `From the table the rule is × ${p.a} then + ${p.b} (the second column goes up by ${p.a}, and the first row is ${p.a} + ${p.b}).`,
    `Work backwards from ${p.a * p.target + p.b}: first subtract ${p.b} to get ${p.a * p.target}, then divide by ${p.a} to get ${p.target}.`,
  ],
  deriveStimulus: (p) => {
    const c = FT_CONTEXTS[p.ctx];
    return table([c.inHead, c.outHead], [1, 2, 3, 4].map((n) => [n, p.a * n + p.b]), c.caption);
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "a/b/target resampled independently; table caption and wording rotated by ctx.",
  reasoningRoute: () => "reverse_reasoning",
  contextTag: (p) => FT_CONTEXTS[p.ctx].tag + "_reverse",
  unknownPosition: () => "input_for_given_output",
  representationType: () => "table",
  misconceptionTargeted: "dividing the output by the multiplier without first removing the added amount (undoing the steps in the wrong order)",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["transfer", "guided_practice", "mastery_check"],
};

// ---------------------------------------------------------------------------
// 12. Mean with a missing value (TABLE) -- family mr01-average-mean (second structure)
// ---------------------------------------------------------------------------
type MeanMissingParams = { v1: number; v2: number; v3: number; v4: number; mean: number; ctx: number };
const mmKnown = (p: MeanMissingParams) => [p.v1, p.v2, p.v3, p.v4];
const mmMissing = (p: MeanMissingParams) => 5 * p.mean - sum(mmKnown(p));
export const BP_MEAN_MISSING_VALUE_TABLE: StructuralBlueprint<MeanMissingParams> = {
  blueprintId: "mr01-bp-mean-missing-value-table",
  familyId: "mr01-average-mean",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-12",
  mathematicalObjective: "Use a stated mean to find a missing value in a table: total needed = mean × 5, minus the values already known.",
  parameterRanges: { v1: { min: 4, max: 60 }, v2: { min: 4, max: 60 }, v3: { min: 4, max: 60 }, v4: { min: 4, max: 60 }, mean: { min: 8, max: 50 }, ctx: { min: 0, max: 2 } },
  constraints: (p) => mmMissing(p) >= 4 && mmMissing(p) <= 80 && new Set([...mmKnown(p), mmMissing(p)]).size >= 4,
  invalidCombinationDescription: "The missing value is a plausible whole number between 4 and 80 and at least four of the five values differ.",
  difficultyControls: () => "hard",
  difficultyDimensions: ["reverse_mean", "table_reading"],
  sampleParams: (random) => {
    for (;;) {
      const v = Array.from({ length: 4 }, () => 4 + Math.floor(random() * 57));
      const mean = 8 + Math.floor(random() * 43);
      const p = { v1: v[0], v2: v[1], v3: v[2], v4: v[3], mean, ctx: Math.floor(random() * 3) };
      if (mmMissing(p) >= 4 && mmMissing(p) <= 80 && new Set([...v, mmMissing(p)]).size >= 4) return p;
    }
  },
  renderQuestionText: (p) => {
    const c = TM_CONTEXTS[p.ctx];
    return `The table shows ${c.caption.toLowerCase()}, but the last value is missing. The mean of all five values is ${p.mean}. What is the missing value?`;
  },
  deriveCorrectAnswer: (p) => String(mmMissing(p)),
  deriveWorkedSteps: (p) => [
    `Total for five values = mean × 5 = ${p.mean} × 5 = ${5 * p.mean}.`,
    `Known four add to ${sum(mmKnown(p))}, so the missing value is ${5 * p.mean} − ${sum(mmKnown(p))} = ${mmMissing(p)}.`,
  ],
  deriveStimulus: (p) => {
    const c = TM_CONTEXTS[p.ctx];
    return table(c.heads, [...mmKnown(p).map((v, k) => [c.rows[k], v] as (string | number)[]), [c.rows[4], "?"]], c.caption);
  },
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "four values and the mean resampled so the missing value is plausible; caption rotated by ctx.",
  reasoningRoute: () => "reverse_reasoning",
  contextTag: (p) => TM_CONTEXTS[p.ctx].tag + "_missing",
  unknownPosition: () => "missing_table_value",
  representationType: () => "table",
  misconceptionTargeted: "treating the stated mean as the missing value, or subtracting the known values from the mean instead of from the total",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["transfer", "guided_practice", "mastery_check"],
};

export const CSSE_BREADTH_EXPANSION_FAMILIES: EducationalFamily[] = [
  { familyId: "mr01-missing-operand", subject: "maths", blueprints: [BP_THINK_OF_A_NUMBER, BP_CONSECUTIVE_FROM_SUM] as EducationalFamily["blueprints"] },
  { familyId: "precision-dec", subject: "maths", blueprints: [BP_ROUND_DECIMAL_PLACES, BP_ROUND_NEAREST_IN_CONTEXT] as EducationalFamily["blueprints"] },
  { familyId: "mr01-measurement-conversion", subject: "maths", blueprints: [BP_COMPARE_IN_DIFFERENT_UNITS, BP_CONVERT_THEN_DIVIDE] as EducationalFamily["blueprints"] },
  { familyId: "mr04-elapsed-time", subject: "maths", blueprints: [BP_TIMETABLE_JOURNEY, BP_TIMETABLE_WAIT] as EducationalFamily["blueprints"] },
  { familyId: "mr02-sequence-rule", subject: "maths", blueprints: [BP_FUNCTION_TABLE_RULE, BP_FUNCTION_TABLE_REVERSE] as EducationalFamily["blueprints"] },
  { familyId: "mr01-average-mean", subject: "maths", blueprints: [BP_MEAN_FROM_TABLE, BP_MEAN_MISSING_VALUE_TABLE] as EducationalFamily["blueprints"] },
];
