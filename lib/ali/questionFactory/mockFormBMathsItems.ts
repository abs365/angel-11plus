import type { MockAngleFigureStimulus, MockCoordinateGridStimulus, MockTableStimulus } from "@/lib/mockAttempt/types";

/**
 * CSSE Mathematics Form B: the 24 missing SEALED items (preparation only; nothing is applied, promoted, or activated).
 *
 * Each item is hand-authored, single-answer and deterministic (no multi-part answers). Each carries an `oracle()` that
 * recomputes the answer by a separately written route, and tested `wrongAnswers` (the tempting mistakes) that must not be
 * accepted. Items are Mock-only: ids and families are prefixed `mock-fb-`, entry status is `authentic_assessment_candidate`,
 * they are never `practice_eligible`, and none of their skeletons or numbers may match the Practice bank (checked against
 * production, recorded in ANGEL_CSSE_MATHS_FORM_B_COMPLETION.md). Visuals are deterministic and exact: a table stimulus
 * (existing Mock renderer) and three static SVG figures built from the same shared figure renderers or an exact L-shape
 * builder, served through the existing Mock image stimulus. Nothing changes Mock rendering code.
 *
 * Shape against the plan (56 items, Form B): 6 easy, 8 medium, 10 hard; QT-MR-01 x4, -02 x5, -03 x1, -04 x6, -05 x1,
 * -06 x1, -07 x2, -08 x1, -09 x1, -14 x2. Together with the 32 revalidated existing items this fills Form B's targets
 * including the three skills Form A lacks (MR-08 coordinates, MR-12 averages, MR-14 precision).
 */

export type FormBDifficulty = "easy" | "medium" | "hard";

export interface FormBFigure {
  /** Static asset file name under public/mock-assets/formb-maths/. */
  file: string;
  altText: string;
  caption?: string;
}

export interface FormBMathsItem {
  id: string;
  family: string;
  skill: string; // QT-MR-xx
  pskill: string; // the stored `skill` label used by existing items of the same QT
  difficulty: FormBDifficulty;
  question: string;
  answer: string;
  workingSteps: string[];
  misconception: string;
  oracle: () => string;
  /** Tempting wrong answers; each must be rejected by the real marker. */
  wrongAnswers: string[];
  figure?: FormBFigure;
  table?: MockTableStimulus;
  estimatedTimeSeconds: number;
  transferClass: "NEAR_TRANSFER" | "MIXED_TRANSFER" | "FAR_TRANSFER";
}

const secs = { easy: 45, medium: 75, hard: 100 } as const;
const tc = { easy: "NEAR_TRANSFER", medium: "MIXED_TRANSFER", hard: "FAR_TRANSFER" } as const;
function item(i: Omit<FormBMathsItem, "estimatedTimeSeconds" | "transferClass"> & { estimatedTimeSeconds?: number }): FormBMathsItem {
  return { ...i, estimatedTimeSeconds: i.estimatedTimeSeconds ?? secs[i.difficulty], transferClass: tc[i.difficulty] };
}

// ---- Figure specifications (the SVGs are rendered from these) -------------------------------------------------
export const FB_STRAIGHT_LINE: MockAngleFigureStimulus = {
  type: "angle-figure",
  figure: "straight-line",
  angles: [
    { size: 38, shown: "38°" },
    { size: 78, shown: "x" },
    { size: 64, shown: "64°" },
  ],
};
export const FB_REFLECTION: MockCoordinateGridStimulus = {
  type: "coordinate-grid",
  xMin: -8,
  xMax: 8,
  yMin: -8,
  yMax: 8,
  points: [{ label: "P", x: -4, y: 7 }],
  mirrorLine: "y=x",
};
/** An L-shaped garden: a W by H rectangle with an a by b corner removed (top right). All angles are right angles. */
export const FB_L_SHAPE = { W: 12, H: 9, a: 5, b: 3 } as const;

export function lShapeSvg(spec: { W: number; H: number; a: number; b: number } = FB_L_SHAPE): string {
  const { W, H, a, b } = spec;
  const k = 20; // px per metre
  const ox = 50;
  const oy = 30;
  const X = (m: number) => ox + m * k;
  const Y = (m: number) => oy + (H - m) * k; // metres up from the bottom
  const pts: [number, number][] = [[0, 0], [W, 0], [W, H - b], [W - a, H - b], [W - a, H], [0, H]];
  const path = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${X(x)} ${Y(y)}`).join(" ") + " Z";
  const t = (x: number, y: number, s: string, anchor = "middle") => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Arial, sans-serif" font-size="16" font-weight="600" fill="#1d2b44">${s}</text>`;
  // Labelled sides: bottom W, left H, top (W - a), right lower (H - b). The notch sides are NOT labelled: they are to be worked out.
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 260" width="360" height="260" role="img" aria-label="L-shaped garden with some side lengths marked">`,
    `<rect width="360" height="260" fill="#ffffff"/>`,
    `<path d="${path}" fill="#eaf0fb" stroke="#2457c5" stroke-width="3" stroke-linejoin="round"/>`,
    t(X(W / 2), Y(0) + 24, `${W} m`),
    t(X(0) - 12, Y(H / 2) + 5, `${H} m`, "end"),
    t(X((W - a) / 2), Y(H) - 8, `${W - a} m`),
    t(X(W) + 12, Y((H - b) / 2) + 5, `${H - b} m`, "start"),
    `</svg>`,
  ].join("");
}

// ---- Items -------------------------------------------------------------------------------------------------------
export const FORM_B_MATHS_ITEMS: FormBMathsItem[] = [
  // QT-MR-01 arithmetic: 2 easy, 2 hard
  item({ id: "mock-fb-mr01-arith-01", family: "mock-fb-mr01-arith", skill: "QT-MR-01", pskill: "arithmetic", difficulty: "easy",
    question: "A school library has 4,205 books. 1,768 of them are on loan. How many books are on the shelves?", answer: "2437",
    workingSteps: ["4,205 − 1,768 = 2,437"], misconception: "Subtracting the smaller digit from the larger in each column without exchanging.",
    oracle: () => String(4205 - 1768), wrongAnswers: ["3563", "2547", "5973"] }),
  item({ id: "mock-fb-mr01-arith-02", family: "mock-fb-mr01-arith", skill: "QT-MR-01", pskill: "arithmetic", difficulty: "easy",
    question: "A bakery packs 25 rolls in each tray. How many rolls are there in 36 trays?", answer: "900",
    workingSteps: ["36 × 25 = 900 (36 × 100 ÷ 4)"], misconception: "Forgetting to carry when multiplying by the tens digit.",
    oracle: () => String((36 * 100) / 4), wrongAnswers: ["180", "61", "720"] }),
  item({ id: "mock-fb-mr01-arith-03", family: "mock-fb-mr01-arith", skill: "QT-MR-01", pskill: "arithmetic", difficulty: "hard",
    question: "Work out the value of 8 + 6 × (23 − 17) ÷ 4 − 3.", answer: "14",
    workingSteps: ["Brackets first: 23 − 17 = 6", "Then multiply and divide from the left: 6 × 6 = 36, 36 ÷ 4 = 9", "Then add and subtract: 8 + 9 − 3 = 14"],
    misconception: "Working strictly left to right, or doing 8 + 6 before multiplying.",
    oracle: () => { const br = 23 - 17; const md = (6 * br) / 4; return String(8 + md - 3); }, wrongAnswers: ["10.5", "6", "27"] }),
  item({ id: "mock-fb-mr01-arith-04", family: "mock-fb-mr01-arith", skill: "QT-MR-01", pskill: "arithmetic", difficulty: "hard",
    question: "Work out 3.6 × 0.25 + 2.4 ÷ 0.8.", answer: "3.9",
    workingSteps: ["3.6 × 0.25 = 0.9 (a quarter of 3.6)", "2.4 ÷ 0.8 = 24 ÷ 8 = 3", "0.9 + 3 = 3.9"],
    misconception: "Misplacing the decimal point when multiplying by 0.25, or dividing 2.4 by 8 instead of 0.8.",
    oracle: () => String(Math.round((3600 * 0.25 / 1000 + 24 / 8) * 100) / 100), wrongAnswers: ["0.39", "3.3", "0.9"] }),

  // QT-MR-02 missing operand: 3 easy, 2 hard
  item({ id: "mock-fb-mr02-missing-01", family: "mock-fb-mr02-missing", skill: "QT-MR-02", pskill: "arithmetic", difficulty: "easy",
    question: "Find the missing number: 48 + ? = 113.", answer: "65", workingSteps: ["113 − 48 = 65"], misconception: "Adding 48 and 113 instead of using the inverse operation.",
    oracle: () => String(113 - 48), wrongAnswers: ["161", "75", "55"] }),
  item({ id: "mock-fb-mr02-missing-02", family: "mock-fb-mr02-missing", skill: "QT-MR-02", pskill: "arithmetic", difficulty: "easy",
    question: "Find the missing number: ? × 7 = 189.", answer: "27", workingSteps: ["189 ÷ 7 = 27"], misconception: "Multiplying 189 by 7.",
    oracle: () => { let n = 0; while (n * 7 !== 189) n++; return String(n); }, wrongAnswers: ["1323", "182", "28"] }),
  item({ id: "mock-fb-mr02-missing-03", family: "mock-fb-mr02-missing", skill: "QT-MR-02", pskill: "arithmetic", difficulty: "easy",
    question: "Maya thinks of a number and adds 17. The answer is 52. What number did Maya think of?", answer: "35", workingSteps: ["52 − 17 = 35"], misconception: "Adding 17 to 52.",
    oracle: () => String(52 - 17), wrongAnswers: ["69", "45", "34"] }),
  item({ id: "mock-fb-mr02-missing-04", family: "mock-fb-mr02-missing", skill: "QT-MR-02", pskill: "arithmetic", difficulty: "hard",
    question: "Raj thinks of a number. He multiplies it by 6, subtracts 14, and gets 100. What number did Raj think of?", answer: "19",
    workingSteps: ["Undo the subtraction: 100 + 14 = 114", "Undo the multiplication: 114 ÷ 6 = 19"], misconception: "Undoing the steps in the same order instead of reverse order, or subtracting 14 again.",
    oracle: () => { for (let n = 1; n < 1000; n++) if (n * 6 - 14 === 100) return String(n); return "none"; }, wrongAnswers: ["14.33", "11", "16"] }),
  item({ id: "mock-fb-mr02-missing-05", family: "mock-fb-mr02-missing", skill: "QT-MR-02", pskill: "arithmetic", difficulty: "hard",
    question: "A number is divided by 4. Then 7 is added. The result is then multiplied by 3 to give 51. What is the number?", answer: "40",
    workingSteps: ["Undo × 3: 51 ÷ 3 = 17", "Undo + 7: 17 − 7 = 10", "Undo ÷ 4: 10 × 4 = 40"], misconception: "Undoing the operations in the wrong order.",
    oracle: () => { for (let n = 0; n < 1000; n++) if ((n / 4 + 7) * 3 === 51) return String(n); return "none"; }, wrongAnswers: ["10", "17", "44"] }),

  // QT-MR-03 measurement: 1 medium
  item({ id: "mock-fb-mr03-measure-01", family: "mock-fb-mr03-measure", skill: "QT-MR-03", pskill: "measurement", difficulty: "medium",
    question: "A rope is 4.5 metres long. Tom cuts it into pieces that are each 90 centimetres long. How many pieces does he get?", answer: "5",
    workingSteps: ["4.5 m = 450 cm", "450 ÷ 90 = 5"], misconception: "Dividing 4.5 by 90 without converting to the same unit.",
    oracle: () => String(Math.floor((4.5 * 100) / 90)), wrongAnswers: ["0.05", "50", "4"] }),

  // QT-MR-04 percentages: 1 easy, 2 medium, 3 hard
  item({ id: "mock-fb-mr04-percent-01", family: "mock-fb-mr04-percent", skill: "QT-MR-04", pskill: "percentages", difficulty: "easy",
    question: "A coat costs £60. In a sale the price is reduced by 10%. What is the sale price in pounds?", answer: "54",
    workingSteps: ["10% of 60 = 6", "60 − 6 = 54"], misconception: "Giving the discount (6) instead of the new price.",
    oracle: () => String(60 - 60 / 10), wrongAnswers: ["6", "66", "50"] }),
  item({ id: "mock-fb-mr04-percent-02", family: "mock-fb-mr04-percent", skill: "QT-MR-04", pskill: "percentages", difficulty: "medium",
    question: "A school has 480 pupils. 35% of them walk to school. How many pupils do not walk to school?", answer: "312",
    workingSteps: ["35% of 480 = 168", "480 − 168 = 312"], misconception: "Giving the number who walk (168) instead of those who do not.",
    oracle: () => String(480 - (480 * 35) / 100), wrongAnswers: ["168", "445", "65"] }),
  item({ id: "mock-fb-mr04-percent-03", family: "mock-fb-mr04-percent", skill: "QT-MR-04", pskill: "percentages", difficulty: "medium",
    question: "A phone costs £240 before 20% VAT is added. Anil pays the full price including VAT in 4 equal monthly payments. How much is each payment in pounds?", answer: "72",
    workingSteps: ["20% of 240 = 48", "240 + 48 = 288", "288 ÷ 4 = 72"], misconception: "Dividing 240 by 4 and adding 20% of that, or forgetting to add the VAT.",
    oracle: () => String((240 * 1.2) / 4), wrongAnswers: ["60", "63", "48"] }),
  item({ id: "mock-fb-mr04-percent-04", family: "mock-fb-mr04-percent", skill: "QT-MR-04", pskill: "percentages", difficulty: "hard",
    question: "A jacket costs £80. In a sale the price is reduced by 15%. A week later the sale price is reduced by a further 10%. What is the final price in pounds?", answer: "61.2",
    workingSteps: ["After 15% off: 80 × 0.85 = 68", "After a further 10% off: 68 × 0.9 = 61.2"], misconception: "Adding the two percentages and taking 25% off the original price (60).",
    oracle: () => String(Math.round(80 * 0.85 * 0.9 * 100) / 100), wrongAnswers: ["60", "64", "58.2"] }),
  item({ id: "mock-fb-mr04-percent-05", family: "mock-fb-mr04-percent", skill: "QT-MR-04", pskill: "percentages", difficulty: "hard",
    question: "After a 25% increase, a bicycle costs £150. What was its price before the increase, in pounds?", answer: "120",
    workingSteps: ["150 is 125% of the original price", "150 ÷ 1.25 = 120"], misconception: "Taking 25% off £150 (giving 112.50).",
    oracle: () => { for (let p = 1; p < 1000; p++) if (p * 1.25 === 150) return String(p); return "none"; }, wrongAnswers: ["112.5", "125", "187.5"] }),
  item({ id: "mock-fb-mr04-percent-06", family: "mock-fb-mr04-percent", skill: "QT-MR-04", pskill: "percentages", difficulty: "hard",
    question: "There are 50 pupils in a club. 40% of them are boys. 15% of the boys and 20% of the girls wear glasses. How many pupils in the club wear glasses?", answer: "9",
    workingSteps: ["Boys: 40% of 50 = 20; girls: 50 − 20 = 30", "Boys with glasses: 15% of 20 = 3; girls with glasses: 20% of 30 = 6", "3 + 6 = 9"], misconception: "Applying one percentage to the whole club, or using 15% + 20% = 35% of 50.",
    oracle: () => { const boys = (50 * 40) / 100; const girls = 50 - boys; return String((boys * 15) / 100 + (girls * 20) / 100); }, wrongAnswers: ["17.5", "10", "6"] }),

  // QT-MR-05 sequences/rules: 1 medium
  item({ id: "mock-fb-mr05-sequence-01", family: "mock-fb-mr05-sequence", skill: "QT-MR-05", pskill: "algebra", difficulty: "medium",
    question: "A sequence starts 7, 12, 17, 22, and carries on in the same way. What is the 8th term?", answer: "42",
    workingSteps: ["The rule is add 5, so the nth term is 5n + 2", "8th term: 5 × 8 + 2 = 42"], misconception: "Multiplying the common difference by the term number (5 × 8 = 40) without the starting adjustment.",
    oracle: () => { let t = 7; for (let i = 1; i < 8; i++) t += 5; return String(t); }, wrongAnswers: ["40", "37", "47"] }),

  // QT-MR-06 algebraic reasoning: 1 medium
  item({ id: "mock-fb-mr06-digits-01", family: "mock-fb-mr06-digits", skill: "QT-MR-06", pskill: "algebra", difficulty: "medium",
    question: "Tia thinks of a two-digit number. Its digits add up to 11. When its digits are reversed, the number increases by 27. What was Tia's number?", answer: "47",
    workingSteps: ["Reversing changes the number by 9 × (difference of the digits), so the difference is 27 ÷ 9 = 3", "Digits add to 11 and differ by 3: they are 4 and 7", "Reversing must increase it, so the number is 47 (74 − 47 = 27)"], misconception: "Finding digits that add to 11 but not checking that the reversed number is 27 larger.",
    oracle: () => { for (let n = 10; n < 100; n++) { const a = Math.floor(n / 10); const b = n % 10; if (a + b === 11 && b * 10 + a - n === 27) return String(n); } return "none"; }, wrongAnswers: ["74", "38", "56"] }),

  // QT-MR-07 geometry with a figure: 1 medium (angles on a line), 1 hard (L-shape area)
  item({ id: "mock-fb-mr07-angles-01", family: "mock-fb-mr07-angles", skill: "QT-MR-07", pskill: "geometry", difficulty: "medium",
    question: "The diagram shows angles on a straight line. Work out the size of angle x, in degrees.", answer: "78",
    workingSteps: ["Angles on a straight line add up to 180°", "38 + 64 = 102", "x = 180 − 102 = 78"], misconception: "Using 360° instead of 180°, or measuring the drawing.",
    oracle: () => String(180 - FB_STRAIGHT_LINE.angles.filter((a) => a.shown !== "x").reduce((sum, a) => sum + a.size, 0)),
    wrongAnswers: ["258", "102", "52"],
    figure: { file: "mock-fb-mr07-angles-01.svg", altText: "A straight line with three angles marked above it. Two angles are labelled 38 degrees and 64 degrees. The middle angle, between them, is labelled x. The diagram is not drawn accurately.", caption: "Diagram not drawn accurately." } }),
  item({ id: "mock-fb-mr07-lshape-01", family: "mock-fb-mr07-lshape", skill: "QT-MR-07", pskill: "geometry", difficulty: "hard",
    question: "The diagram shows an L-shaped garden. All the angles are right angles. Work out the area of the garden, in square metres.", answer: "93",
    workingSteps: ["The full rectangle is 12 m by 9 m: 108 m²", "The missing corner is (12 − 7) m by (9 − 6) m = 5 m by 3 m = 15 m²", "108 − 15 = 93"], misconception: "Multiplying only the labelled lengths together, or forgetting to work out the sides of the missing corner.",
    oracle: () => { const { W, H, a, b } = FB_L_SHAPE; return String(W * H - a * b); }, wrongAnswers: ["108", "42", "78"],
    figure: { file: "mock-fb-mr07-lshape-01.svg", altText: "An L-shaped garden. The bottom side is 12 metres and the left side is 9 metres. The top edge, on the left, is 7 metres. The right-hand side, below the missing corner, is 6 metres. The sides of the missing corner are not labelled. All angles are right angles. The diagram is not drawn to scale.", caption: "Diagram not drawn to scale." } }),

  // QT-MR-08 coordinates: 1 medium (reflection in a drawn mirror line)
  item({ id: "mock-fb-mr08-reflect-01", family: "mock-fb-mr08-reflect", skill: "QT-MR-08", pskill: "geometry", difficulty: "medium",
    question: "Point P is reflected in the dashed mirror line. What are the coordinates of the image of P? Give your answer in the form (x, y).", answer: "(7, -4)",
    workingSteps: ["Read P from the grid: (−4, 7)", "Reflection in the line y = x swaps the coordinates", "Image: (7, −4)"], misconception: "Negating a coordinate as for a reflection in an axis, giving (4, 7) or (-7, 4).",
    oracle: () => { const p = FB_REFLECTION.points[0]; return `(${p.y}, ${p.x})`; }, wrongAnswers: ["(4, 7)", "(-4, -7)", "(-7, 4)"],
    figure: { file: "mock-fb-mr08-reflect-01.svg", altText: "A coordinate grid from -8 to 8 on both axes. A point P is plotted. A dashed mirror line runs along the line y = x.", caption: undefined } }),

  // QT-MR-09 data handling with a table: 1 hard
  item({ id: "mock-fb-mr09-table-01", family: "mock-fb-mr09-table", skill: "QT-MR-09", pskill: "data-handling", difficulty: "hard",
    question: "The table shows how many of each item a market stall sold on four days. A hat costs £6, a scarf costs £4 and a pair of gloves costs £5. How much money, in pounds, did the stall take altogether over the four days?", answer: "320",
    workingSteps: ["Hats: 5 + 8 + 3 + 6 = 22, and 22 × 6 = 132", "Scarves: 7 + 2 + 9 + 4 = 22, and 22 × 4 = 88", "Gloves: 4 + 6 + 3 + 7 = 20, and 20 × 5 = 100", "132 + 88 + 100 = 320"], misconception: "Adding all the counts and multiplying by one price, or reading the table by rows without applying each price to its own column.",
    oracle: () => { const hats = [5, 8, 3, 6]; const scarves = [7, 2, 9, 4]; const gloves = [4, 6, 3, 7]; const sum = (a: number[]) => a.reduce((s, v) => s + v, 0); return String(sum(hats) * 6 + sum(scarves) * 4 + sum(gloves) * 5); },
    wrongAnswers: ["64", "310", "330"],
    table: { type: "table", caption: "Items sold by the stall", headers: ["Day", "Hats", "Scarves", "Gloves"], rows: [["Monday", "5", "7", "4"], ["Tuesday", "8", "2", "6"], ["Wednesday", "3", "9", "3"], ["Thursday", "6", "4", "7"]] } }),

  // QT-MR-14 precision: 1 medium, 1 hard
  item({ id: "mock-fb-mr14-precision-01", family: "mock-fb-mr14-precision", skill: "QT-MR-14", pskill: "number", difficulty: "medium",
    question: "A whole number is rounded to the nearest 10 and the answer is 350. What is the smallest whole number it could have been?", answer: "345",
    workingSteps: ["Numbers from 345 up to 354 round to 350 (345 rounds up)", "The smallest is 345"], misconception: "Giving 340 or 349 (misplacing the rounding boundary).",
    oracle: () => { for (let n = 300; n < 400; n++) if (Math.round(n / 10) * 10 === 350) return String(n); return "none"; }, wrongAnswers: ["340", "349", "350"] }),
  item({ id: "mock-fb-mr14-precision-02", family: "mock-fb-mr14-precision", skill: "QT-MR-14", pskill: "number", difficulty: "hard",
    question: "A length is 6.4 metres, rounded to 1 decimal place. What is the greatest whole number of centimetres the length could be?", answer: "644",
    workingSteps: ["6.4 m is 640 cm. Rounding to 1 decimal place means within 5 cm either side", "The length is at least 635 cm and less than 645 cm", "The greatest whole number of centimetres is 644"], misconception: "Giving 645 (the boundary, which would round up to 6.5), or 649.",
    oracle: () => { let best = 0; for (let cm = 600; cm < 700; cm++) if (Math.floor((cm + 5) / 10) === 64) best = cm; return String(best); }, wrongAnswers: ["645", "649", "650"] }),
];

export const FORM_B_MATHS_TOP_UP_TARGETS = { total: 24, easy: 6, medium: 8, hard: 10 } as const;
export const FORM_B_QT_COUNTS: Record<string, number> = { "QT-MR-01": 4, "QT-MR-02": 5, "QT-MR-03": 1, "QT-MR-04": 6, "QT-MR-05": 1, "QT-MR-06": 1, "QT-MR-07": 2, "QT-MR-08": 1, "QT-MR-09": 1, "QT-MR-14": 2 };
