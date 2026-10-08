import type { StructuralBlueprint, EducationalFamily } from "./types";
import type { MockBarChartStimulus, MockTableStimulus } from "@/lib/mockAttempt/types";

/**
 * CSSE Completion, mathematical representation extension -- data handling that REQUIRES a table or a chart.
 *
 * Live baseline: QT-MR-09 (data handling) has 6 practice items in one family (`mr01-data-table`), all prose. A child
 * cannot practise reading a table or a bar chart from prose. These blueprints attach a governed structured stimulus
 * (a table, or a bar chart) to each question; the question text refers to "the table"/"the bar chart" and never
 * restates the data, so the representation is necessary to answer, not decoration.
 *
 * Reuse, not a new system: the stimulus shapes are the existing `MockTableStimulus` and the new `MockBarChartStimulus`
 * (same discriminated union, same validators, same shared renderers). Practice shows them through
 * `components/mockAttempt/StructuredStimulus.tsx`.
 *
 * Every answer is derived from the SAME values that build the stimulus (never from the question text), and the tests
 * re-derive it from the stimulus object itself with an independent method.
 */

/**
 * Every title, caption, header, unit and question phrase for a situation lives here, together, so the stimulus and the
 * question are written as one unit and can be audited as one unit (see the semantic audit test). `about` completes
 * "The table/bar chart shows ___"; `caption` and `chartTitle` are noun phrases describing exactly what the numbers are.
 */
const CONTEXTS = [
  {
    tag: "data_library_loans", unit: "books", groups: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    groupHead: "Day", valueHead: "Books borrowed", yLabel: "Books borrowed",
    about: "the number of books borrowed from a school library each day",
    caption: "Books borrowed each day", weekCaption: "Books borrowed each day in Week 1 and Week 2", chartTitle: "Books borrowed each day",
    combine: (a: string, b: string) => `How many books were borrowed on ${a} and ${b} together?`,
    more: (a: string, b: string) => `How many more books were borrowed on ${a} than on ${b}?`,
    meanQ: "What is the mean number of books borrowed per day?",
    weekQ: "The table shows the number of books borrowed on four days in each of two weeks. How many more books were borrowed in Week 2 than in Week 1 altogether?",
  },
  {
    tag: "data_sports_choice", unit: "pupils", groups: ["Football", "Swimming", "Tennis", "Cricket", "Gymnastics"],
    groupHead: "Sport", valueHead: "Pupils", yLabel: "Number of pupils",
    about: "the number of pupils attending each sport at a club",
    caption: "Pupils attending each sport", weekCaption: "Pupils attending each sport in Week 1 and Week 2", chartTitle: "Pupils attending each sport",
    combine: (a: string, b: string) => `How many pupils attended ${a} and ${b} altogether?`,
    more: (a: string, b: string) => `How many more pupils attended ${a} than ${b}?`,
    meanQ: "What is the mean number of pupils attending per sport?",
    weekQ: "The table shows the number of pupils attending four sports at a club in each of two weeks. How many more pupils attended in Week 2 than in Week 1 altogether?",
  },
  {
    tag: "data_fruit_stall", unit: "kilograms", groups: ["Apples", "Pears", "Plums", "Cherries", "Grapes"],
    groupHead: "Fruit", valueHead: "Kilograms sold", yLabel: "Kilograms sold",
    about: "the kilograms of each fruit sold at a market stall",
    caption: "Kilograms of each fruit sold", weekCaption: "Kilograms of each fruit sold in Week 1 and Week 2", chartTitle: "Kilograms of each fruit sold",
    combine: (a: string, b: string) => `How many kilograms of ${a} and ${b} were sold altogether?`,
    more: (a: string, b: string) => `How many more kilograms of ${a} than ${b} were sold?`,
    meanQ: "What is the mean number of kilograms sold per fruit?",
    weekQ: "The table shows the kilograms of four fruits sold at a market stall in each of two weeks. How many more kilograms were sold in Week 2 than in Week 1 altogether?",
  },
];

function tableStimulus(headers: string[], rows: (string | number)[][], caption: string): MockTableStimulus {
  return { type: "table", caption, headers, rows: rows.map((r) => r.map(String)) };
}

// ---------------------------------------------------------------------------
// A. Table: read two rows and combine
// ---------------------------------------------------------------------------
type TableCombineParams = { v1: number; v2: number; v3: number; v4: number; v5: number; i: number; j: number; ctx: number };
const tcVals = (p: TableCombineParams) => [p.v1, p.v2, p.v3, p.v4, p.v5];
export const BP_TABLE_READ_AND_COMBINE: StructuralBlueprint<TableCombineParams> = {
  blueprintId: "mr01-bp-table-read-and-combine",
  familyId: "mr01-data-table",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-09",
  mathematicalObjective: "Find the right two rows in a table and add their values, ignoring the other rows.",
  parameterRanges: { v1: { min: 12, max: 95 }, v2: { min: 12, max: 95 }, v3: { min: 12, max: 95 }, v4: { min: 12, max: 95 }, v5: { min: 12, max: 95 }, i: { min: 0, max: 4 }, j: { min: 0, max: 4 }, ctx: { min: 0, max: 2 } },
  constraints: (p) => p.i !== p.j && new Set(tcVals(p)).size === 5,
  invalidCombinationDescription: "The two chosen rows differ and all five table values are different (so the rows cannot be confused).",
  difficultyControls: (p) => (tcVals(p)[p.i] + tcVals(p)[p.j] < 100 ? "easy" : "medium"),
  difficultyDimensions: ["sum_magnitude", "selective_reading"],
  sampleParams: (random) => {
    for (;;) {
      const v = Array.from({ length: 5 }, () => 12 + Math.floor(random() * 84));
      if (new Set(v).size !== 5) continue;
      const i = Math.floor(random() * 5);
      let j = Math.floor(random() * 5);
      if (j === i) j = (j + 1) % 5;
      return { v1: v[0], v2: v[1], v3: v[2], v4: v[3], v5: v[4], i, j, ctx: Math.floor(random() * 3) };
    }
  },
  renderQuestionText: (p) => `The table shows ${CONTEXTS[p.ctx].about}. ${CONTEXTS[p.ctx].combine(CONTEXTS[p.ctx].groups[p.i], CONTEXTS[p.ctx].groups[p.j])}`,
  deriveCorrectAnswer: (p) => String(tcVals(p)[p.i] + tcVals(p)[p.j]),
  deriveWorkedSteps: (p) => {
    const c = CONTEXTS[p.ctx];
    const v = tcVals(p);
    return [`Read the two rows needed: ${c.groups[p.i]} = ${v[p.i]} and ${c.groups[p.j]} = ${v[p.j]}.`, `Add them: ${v[p.i]} + ${v[p.j]} = ${v[p.i] + v[p.j]}.`];
  },
  deriveStimulus: (p) => {
    const c = CONTEXTS[p.ctx];
    return tableStimulus([c.groupHead, c.valueHead], tcVals(p).map((v, k) => [c.groups[k], v]), c.caption);
  },
  stageSuitability: ["FOUNDATION", "DEVELOPMENT"],
  similarityControls: "five distinct values and the two rows resampled independently; situation rotated by ctx.",
  reasoningRoute: () => "interpretation",
  contextTag: (p) => CONTEXTS[p.ctx].tag,
  unknownPosition: () => "combined_table_rows",
  representationType: () => "table",
  misconceptionTargeted: "adding every value in the table, or the wrong two rows, instead of only the rows the question names",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice"],
};

// ---------------------------------------------------------------------------
// B. Two-column table: compare column totals
// ---------------------------------------------------------------------------
type TwoColParams = { a1: number; a2: number; a3: number; a4: number; b1: number; b2: number; b3: number; b4: number; ctx: number };
const aVals = (p: TwoColParams) => [p.a1, p.a2, p.a3, p.a4];
const bVals = (p: TwoColParams) => [p.b1, p.b2, p.b3, p.b4];
const sum = (xs: number[]) => xs.reduce((s, x) => s + x, 0);
export const BP_TABLE_COMPARE_COLUMN_TOTALS: StructuralBlueprint<TwoColParams> = {
  blueprintId: "mr01-bp-table-compare-column-totals",
  familyId: "mr01-data-table",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-09",
  mathematicalObjective: "Total two columns of a table and find how much greater one total is -- a multi-step read across the whole table.",
  parameterRanges: { a1: { min: 10, max: 60 }, a2: { min: 10, max: 60 }, a3: { min: 10, max: 60 }, a4: { min: 10, max: 60 }, b1: { min: 10, max: 60 }, b2: { min: 10, max: 60 }, b3: { min: 10, max: 60 }, b4: { min: 10, max: 60 }, ctx: { min: 0, max: 2 } },
  constraints: (p) => sum(bVals(p)) - sum(aVals(p)) >= 5 && sum(bVals(p)) - sum(aVals(p)) <= 60 && p.a1 !== p.b1 && p.a2 !== p.b2 && p.a3 !== p.b3 && p.a4 !== p.b4,
  invalidCombinationDescription: "Week 2's total is between 5 and 60 greater than Week 1's, and no row has the same value in both weeks (so a row cannot be skipped by looking for ties).",
  difficultyControls: (p) => (sum(bVals(p)) - sum(aVals(p)) <= 20 ? "medium" : "hard"),
  difficultyDimensions: ["two_column_totals", "difference_of_totals"],
  sampleParams: (random) => {
    for (;;) {
      const a = Array.from({ length: 4 }, () => 10 + Math.floor(random() * 51));
      const b = Array.from({ length: 4 }, () => 10 + Math.floor(random() * 51));
      const d = sum(b) - sum(a);
      if (d < 5 || d > 60) continue;
      if (a.some((x, k) => x === b[k])) continue;
      return { a1: a[0], a2: a[1], a3: a[2], a4: a[3], b1: b[0], b2: b[1], b3: b[2], b4: b[3], ctx: Math.floor(random() * 3) };
    }
  },
  renderQuestionText: (p) => CONTEXTS[p.ctx].weekQ,
  deriveCorrectAnswer: (p) => String(sum(bVals(p)) - sum(aVals(p))),
  deriveWorkedSteps: (p) => [
    `Week 1 total: ${aVals(p).join(" + ")} = ${sum(aVals(p))}.`,
    `Week 2 total: ${bVals(p).join(" + ")} = ${sum(bVals(p))}.`,
    `Difference: ${sum(bVals(p))} − ${sum(aVals(p))} = ${sum(bVals(p)) - sum(aVals(p))}.`,
  ],
  deriveStimulus: (p) => {
    const c = CONTEXTS[p.ctx];
    return tableStimulus([c.groupHead, "Week 1", "Week 2"], aVals(p).map((v, k) => [c.groups[k], v, bVals(p)[k]]), c.weekCaption);
  },
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "eight values resampled with a constrained total difference; situation rotated by ctx.",
  reasoningRoute: () => "multi_step_application",
  contextTag: (p) => CONTEXTS[p.ctx].tag + "_two_weeks",
  unknownPosition: () => "difference_of_column_totals",
  representationType: () => "table",
  misconceptionTargeted: "comparing only one row (or one pair of rows) instead of totalling each whole column before subtracting",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["guided_practice", "independent_practice", "transfer"],
};

// ---------------------------------------------------------------------------
// Bar-chart helpers
// ---------------------------------------------------------------------------
const SCALE_STEPS = [2, 4, 5, 10, 20];
const granularity = (step: number) => (step >= 4 && step % 2 === 0 ? step / 2 : step);

function chartStimulus(ctx: number, values: number[], step: number): MockBarChartStimulus {
  const c = CONTEXTS[ctx];
  const maxV = Math.max(...values);
  const axisMax = Math.ceil((maxV + 1) / step) * step;
  return { type: "bar-chart", title: c.chartTitle, yLabel: c.yLabel, categories: c.groups, values, scaleStep: step, axisMax };
}

// ---------------------------------------------------------------------------
// C. Bar chart: read two bars and find the difference (scale reading)
// ---------------------------------------------------------------------------
type ChartDiffParams = { v1: number; v2: number; v3: number; v4: number; v5: number; i: number; j: number; s: number; ctx: number };
const cdVals = (p: ChartDiffParams) => [p.v1, p.v2, p.v3, p.v4, p.v5];
export const BP_BAR_CHART_READ_DIFFERENCE: StructuralBlueprint<ChartDiffParams> = {
  blueprintId: "mr01-bp-bar-chart-read-difference",
  familyId: "mr01-data-table",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-09",
  mathematicalObjective: "Read two bar heights from a scale (including bars that end between gridlines) and find how many more one is than the other.",
  parameterRanges: { v1: { min: 2, max: 200 }, v2: { min: 2, max: 200 }, v3: { min: 2, max: 200 }, v4: { min: 2, max: 200 }, v5: { min: 2, max: 200 }, i: { min: 0, max: 4 }, j: { min: 0, max: 4 }, s: { min: 0, max: 4 }, ctx: { min: 0, max: 2 } },
  constraints: (p) => {
    const step = SCALE_STEPS[p.s];
    const g = granularity(step);
    const v = cdVals(p);
    return p.i !== p.j && v[p.i] > v[p.j] && v.every((x) => x % g === 0 && x >= g) && new Set(v).size === 5 && Math.max(...v) <= step * 10;
  },
  invalidCombinationDescription: "Every bar is a whole multiple of the scale's reading unit (halfway between gridlines at most), all bars differ, the first named bar is taller than the second, and the axis stays within ten gridlines.",
  difficultyControls: (p) => {
    const step = SCALE_STEPS[p.s];
    return granularity(step) === step ? "medium" : "hard";
  },
  difficultyDimensions: ["scale_reading", "between_gridline_values"],
  sampleParams: (random) => {
    for (;;) {
      const s = Math.floor(random() * 5);
      const step = SCALE_STEPS[s];
      const g = granularity(step);
      const maxUnits = Math.floor((step * 10) / g);
      const v = Array.from({ length: 5 }, () => g * (1 + Math.floor(random() * maxUnits)));
      if (new Set(v).size !== 5) continue;
      const i = Math.floor(random() * 5);
      let j = Math.floor(random() * 5);
      if (j === i) j = (j + 1) % 5;
      if (v[i] <= v[j]) continue;
      return { v1: v[0], v2: v[1], v3: v[2], v4: v[3], v5: v[4], i, j, s, ctx: Math.floor(random() * 3) };
    }
  },
  renderQuestionText: (p) => `The bar chart shows ${CONTEXTS[p.ctx].about}. ${CONTEXTS[p.ctx].more(CONTEXTS[p.ctx].groups[p.i], CONTEXTS[p.ctx].groups[p.j])} Read the values carefully from the scale.`,
  deriveCorrectAnswer: (p) => String(cdVals(p)[p.i] - cdVals(p)[p.j]),
  deriveWorkedSteps: (p) => {
    const c = CONTEXTS[p.ctx];
    const v = cdVals(p);
    return [
      `Check the scale first: the gridlines go up in steps of ${SCALE_STEPS[p.s]}.`,
      `${c.groups[p.i]} = ${v[p.i]} and ${c.groups[p.j]} = ${v[p.j]}.`,
      `Difference: ${v[p.i]} − ${v[p.j]} = ${v[p.i] - v[p.j]}.`,
    ];
  },
  deriveStimulus: (p) => chartStimulus(p.ctx, cdVals(p), SCALE_STEPS[p.s]),
  stageSuitability: ["DEVELOPMENT", "EXAM_PREPARATION"],
  similarityControls: "five distinct bar values, the two named bars and the scale resampled independently; situation rotated by ctx.",
  reasoningRoute: () => "interpretation",
  contextTag: (p) => CONTEXTS[p.ctx].tag + "_bar_chart",
  unknownPosition: () => "difference_between_bars",
  representationType: () => "bar_chart",
  misconceptionTargeted: "reading the vertical scale as going up in ones, or reading a bar that ends between gridlines as the lower gridline",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["worked_example", "guided_practice", "independent_practice", "transfer"],
};

// ---------------------------------------------------------------------------
// D. Bar chart: mean of all bars
// ---------------------------------------------------------------------------
type ChartMeanParams = { v1: number; v2: number; v3: number; v4: number; v5: number; s: number; ctx: number };
const cmVals = (p: ChartMeanParams) => [p.v1, p.v2, p.v3, p.v4, p.v5];
export const BP_BAR_CHART_MEAN: StructuralBlueprint<ChartMeanParams> = {
  blueprintId: "mr01-bp-bar-chart-mean",
  familyId: "mr01-data-table",
  competencyId: "MR-01",
  questionTypeId: "QT-MR-09",
  mathematicalObjective: "Read all five bars from a scale, total them and divide by the number of bars to find the mean -- averages applied to a chart, not a list.",
  parameterRanges: { v1: { min: 2, max: 200 }, v2: { min: 2, max: 200 }, v3: { min: 2, max: 200 }, v4: { min: 2, max: 200 }, v5: { min: 2, max: 200 }, s: { min: 0, max: 4 }, ctx: { min: 0, max: 2 } },
  constraints: (p) => {
    const step = SCALE_STEPS[p.s];
    const g = granularity(step);
    const v = cmVals(p);
    return v.every((x) => x % g === 0 && x >= g) && Math.max(...v) <= step * 10 && sum(v) % 5 === 0 && new Set(v).size >= 4;
  },
  invalidCombinationDescription: "Every bar is a whole multiple of the reading unit, the axis stays within ten gridlines, the five bars total a multiple of 5 (so the mean is a whole number) and at least four bars differ.",
  difficultyControls: () => "hard",
  difficultyDimensions: ["read_five_values", "total_then_divide"],
  sampleParams: (random) => {
    for (;;) {
      const s = Math.floor(random() * 5);
      const step = SCALE_STEPS[s];
      const g = granularity(step);
      const maxUnits = Math.floor((step * 10) / g);
      const v = Array.from({ length: 5 }, () => g * (1 + Math.floor(random() * maxUnits)));
      if (sum(v) % 5 !== 0 || new Set(v).size < 4) continue;
      return { v1: v[0], v2: v[1], v3: v[2], v4: v[3], v5: v[4], s, ctx: Math.floor(random() * 3) };
    }
  },
  renderQuestionText: (p) => `The bar chart shows ${CONTEXTS[p.ctx].about}. ${CONTEXTS[p.ctx].meanQ} Read the values carefully from the scale.`,
  deriveCorrectAnswer: (p) => String(sum(cmVals(p)) / 5),
  deriveWorkedSteps: (p) => [
    `Check the scale first: the gridlines go up in steps of ${SCALE_STEPS[p.s]}.`,
    `Read all five bars: ${cmVals(p).join(", ")}. Their total is ${sum(cmVals(p))}.`,
    `Mean = ${sum(cmVals(p))} ÷ 5 = ${sum(cmVals(p)) / 5}.`,
  ],
  deriveStimulus: (p) => chartStimulus(p.ctx, cmVals(p), SCALE_STEPS[p.s]),
  stageSuitability: ["EXAM_PREPARATION", "FINAL_READINESS"],
  similarityControls: "five bar values and the scale resampled with a divisible total; situation rotated by ctx.",
  reasoningRoute: () => "multi_step_application",
  contextTag: (p) => CONTEXTS[p.ctx].tag + "_bar_chart_mean",
  unknownPosition: () => "mean_of_bars",
  representationType: () => "bar_chart",
  misconceptionTargeted: "dividing the total by the largest bar, or by the scale step, instead of by the number of bars",
  provenance: "angel_original",
  mockEligible: false,
  teachingUses: ["transfer", "guided_practice", "mastery_check"],
};

export const MR01_DATA_HANDLING_EXPANSION: EducationalFamily = {
  familyId: "mr01-data-table",
  subject: "maths",
  blueprints: [BP_TABLE_READ_AND_COMBINE, BP_TABLE_COMPARE_COLUMN_TOTALS, BP_BAR_CHART_READ_DIFFERENCE, BP_BAR_CHART_MEAN] as EducationalFamily["blueprints"],
};
