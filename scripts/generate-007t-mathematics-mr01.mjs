// ============================================================
// Educational Increment 007T, Parts 3-4 — first QT-MR-01 authoring batch.
// 20 questions across the 4 family contracts frozen in Part 3 of
// ANGEL_007T_CONTROLLED_CONTENT_EXPANSION_FOUNDATION_V1.md: whole-number,
// decimal, fraction, and multistep/order-of-operations direct arithmetic.
// A proof batch (5 per family), not the final ~32-40 sibling depth Part 10
// projects — deliberately bounded, per this increment's own scope.
//
// Every answer below is independently recomputed at generation time (see
// verify() below), not merely asserted. Structural variation is
// deliberate: within each family, siblings differ in operation,
// magnitude/digit-count, or (for fractions) denominator relationship —
// never a template with only the numbers swapped.
// ============================================================

export const mathsQuestions = [
  // --- mr01-whole-number-computation (5) ---
  {
    id: "mr01-wholenum-01", family_id: "mr01-whole-number-computation", skill: "QT-MR-01",
    difficulty: "easy", question: "6 × 47 = ?", answer: "282",
    workingSteps: ["6 × 40 = 240", "6 × 7 = 42", "240 + 42 = 282"],
    misconception: "multiplication-table-recall-gap", marks: 1, estSeconds: 45,
  },
  {
    id: "mr01-wholenum-02", family_id: "mr01-whole-number-computation", skill: "QT-MR-01",
    difficulty: "medium", question: "134 × 26 = ?", answer: "3484",
    workingSteps: ["134 × 20 = 2680", "134 × 6 = 804", "2680 + 804 = 3484"],
    misconception: "partial-product-omitted-in-long-multiplication", marks: 2, estSeconds: 75,
  },
  {
    id: "mr01-wholenum-03", family_id: "mr01-whole-number-computation", skill: "QT-MR-01",
    difficulty: "medium", question: "What is the remainder when 391 is divided by 7?", answer: "6",
    workingSteps: ["7 × 55 = 385", "391 − 385 = 6", "so 391 ÷ 7 = 55 remainder 6"],
    misconception: "remainder-omitted-or-quotient-given-instead", marks: 1, estSeconds: 60,
  },
  {
    id: "mr01-wholenum-04", family_id: "mr01-whole-number-computation", skill: "QT-MR-01",
    difficulty: "hard", question: "2916 ÷ 36 = ?", answer: "81",
    workingSteps: ["36 × 80 = 2880", "2916 − 2880 = 36", "36 ÷ 36 = 1, so 80 + 1 = 81"],
    misconception: "long-division-estimate-error-with-2-digit-divisor", marks: 2, estSeconds: 90,
  },
  {
    id: "mr01-wholenum-05", family_id: "mr01-whole-number-computation", skill: "QT-MR-01",
    difficulty: "hard", question: "10000 − 4256 = ?", answer: "5744",
    workingSteps: ["Borrow chain across four zeros: 10000 = 9999 + 1", "9999 − 4256 = 5743", "5743 + 1 = 5744"],
    misconception: "borrow-across-multiple-zeros-error", marks: 2, estSeconds: 90,
  },
  // --- mr01-decimal-computation (5) ---
  {
    id: "mr01-decimal-01", family_id: "mr01-decimal-computation", skill: "QT-MR-01",
    difficulty: "easy", question: "3.45 + 2.18 = ?", answer: "5.63",
    workingSteps: ["Align decimal points", "3.45 + 2.18 = 5.63"],
    misconception: "decimal-point-misalignment-on-addition", marks: 1, estSeconds: 45,
  },
  {
    id: "mr01-decimal-02", family_id: "mr01-decimal-computation", skill: "QT-MR-01",
    difficulty: "easy", question: "7.6 − 2.4 = ?", answer: "5.2",
    workingSteps: ["Align decimal points", "7.6 − 2.4 = 5.2"],
    misconception: "decimal-point-misalignment-on-subtraction", marks: 1, estSeconds: 45,
  },
  {
    id: "mr01-decimal-03", family_id: "mr01-decimal-computation", skill: "QT-MR-01",
    difficulty: "medium", question: "4.7 + 3.28 = ?", answer: "7.98",
    workingSteps: ["Rewrite 4.7 as 4.70 to match decimal places", "4.70 + 3.28 = 7.98"],
    misconception: "differing-decimal-place-count-not-padded-with-zero", marks: 1, estSeconds: 60,
  },
  {
    id: "mr01-decimal-04", family_id: "mr01-decimal-computation", skill: "QT-MR-01",
    difficulty: "medium", question: "15.6 ÷ 4 = ?", answer: "3.9",
    workingSteps: ["15.6 ÷ 4: 15 ÷ 4 = 3 remainder 3", "3.6 ÷ 4 = 0.9", "3 + 0.9 = 3.9"],
    misconception: "decimal-point-dropped-when-dividing-by-whole-number", marks: 1, estSeconds: 60,
  },
  {
    id: "mr01-decimal-05", family_id: "mr01-decimal-computation", skill: "QT-MR-01",
    difficulty: "hard", question: "6 ÷ 0.25 = ?", answer: "24",
    workingSteps: ["Dividing by 0.25 is the same as multiplying by 4", "6 × 4 = 24"],
    misconception: "assumes-dividing-always-produces-a-smaller-result", marks: 2, estSeconds: 90,
  },
  // --- mr01-fraction-computation (5) ---
  {
    id: "mr01-fraction-01", family_id: "mr01-fraction-computation", skill: "QT-MR-01",
    difficulty: "easy", question: "2/9 + 4/9 = ? Give your answer in its simplest form.", answer: "2/3",
    workingSteps: ["Like denominators: 2/9 + 4/9 = 6/9", "Simplify: 6/9 = 2/3"],
    misconception: "final-fraction-not-simplified", marks: 1, estSeconds: 45,
  },
  {
    id: "mr01-fraction-02", family_id: "mr01-fraction-computation", skill: "QT-MR-01",
    difficulty: "easy", question: "1/3 × 2/5 = ?", answer: "2/15",
    workingSteps: ["Multiply numerators: 1 × 2 = 2", "Multiply denominators: 3 × 5 = 15", "2/15"],
    misconception: "cross-multiplication-used-instead-of-straight-multiplication", marks: 1, estSeconds: 45,
  },
  {
    id: "mr01-fraction-03", family_id: "mr01-fraction-computation", skill: "QT-MR-01",
    difficulty: "medium", question: "1/4 + 1/6 = ? Give your answer in its simplest form.", answer: "5/12",
    workingSteps: ["LCM of 4 and 6 is 12", "1/4 = 3/12, 1/6 = 2/12", "3/12 + 2/12 = 5/12"],
    misconception: "denominators-added-directly-without-common-denominator", marks: 2, estSeconds: 75,
  },
  {
    id: "mr01-fraction-04", family_id: "mr01-fraction-computation", skill: "QT-MR-01",
    difficulty: "medium", question: "3/5 ÷ 2/3 = ? Give your answer in its simplest form.", answer: "9/10",
    workingSteps: ["Dividing by a fraction: multiply by its reciprocal", "3/5 ÷ 2/3 = 3/5 × 3/2", "= 9/10"],
    misconception: "reciprocal-not-taken-before-multiplying", marks: 2, estSeconds: 75,
  },
  {
    id: "mr01-fraction-05", family_id: "mr01-fraction-computation", skill: "QT-MR-01",
    difficulty: "hard", question: "2 1/4 − 1 5/6 = ? Give your answer in its simplest form.", answer: "5/12",
    workingSteps: ["Convert to improper fractions: 2 1/4 = 9/4, 1 5/6 = 11/6", "LCM of 4 and 6 is 12: 9/4 = 27/12, 11/6 = 22/12", "27/12 − 22/12 = 5/12"],
    misconception: "mixed-number-not-converted-before-subtracting-with-unlike-denominators", marks: 2, estSeconds: 90,
  },
  // --- mr01-multistep-order-of-operations (5) ---
  {
    id: "mr01-multistep-01", family_id: "mr01-multistep-order-of-operations", skill: "QT-MR-01",
    difficulty: "easy", question: "(8 + 4) × 3 = ?", answer: "36",
    workingSteps: ["Brackets first: 8 + 4 = 12", "12 × 3 = 36"],
    misconception: "brackets-ignored-operations-done-left-to-right", marks: 1, estSeconds: 45,
  },
  {
    id: "mr01-multistep-02", family_id: "mr01-multistep-order-of-operations", skill: "QT-MR-01",
    difficulty: "easy", question: "20 − (3 × 4) = ?", answer: "8",
    workingSteps: ["Brackets first: 3 × 4 = 12", "20 − 12 = 8"],
    misconception: "brackets-ignored-operations-done-left-to-right", marks: 1, estSeconds: 45,
  },
  {
    id: "mr01-multistep-03", family_id: "mr01-multistep-order-of-operations", skill: "QT-MR-01",
    difficulty: "medium", question: "6 + 4 × 5 = ?", answer: "26",
    workingSteps: ["Multiplication before addition: 4 × 5 = 20", "6 + 20 = 26"],
    misconception: "left-to-right-evaluation-ignoring-precedence", marks: 1, estSeconds: 60,
  },
  {
    id: "mr01-multistep-04", family_id: "mr01-multistep-order-of-operations", skill: "QT-MR-01",
    difficulty: "medium", question: "18 − 2 × 3 + 5 = ?", answer: "17",
    workingSteps: ["Multiplication first: 2 × 3 = 6", "18 − 6 + 5", "12 + 5 = 17"],
    misconception: "left-to-right-evaluation-ignoring-precedence", marks: 2, estSeconds: 75,
  },
  {
    id: "mr01-multistep-05", family_id: "mr01-multistep-order-of-operations", skill: "QT-MR-01",
    difficulty: "hard", question: "(5.5 + 2.5) × 4 − 10 = ?", answer: "22",
    workingSteps: ["Brackets first: 5.5 + 2.5 = 8", "8 × 4 = 32", "32 − 10 = 22"],
    misconception: "brackets-and-precedence-both-required-decimal-adds-load", marks: 2, estSeconds: 90,
  },
];

const FAMILY_IDS = new Set([
  "mr01-whole-number-computation",
  "mr01-decimal-computation",
  "mr01-fraction-computation",
  "mr01-multistep-order-of-operations",
]);

/** Independent first-principles recomputation, keyed by question id — deliberately
 * hand-derived per-item (not a generic expression evaluator), so a transcription
 * error in the authored `answer` can't also be baked into the checker. */
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function fracStr(n, d) { const g = gcd(Math.abs(n), Math.abs(d)); return `${n / g}/${d / g}`; }

const RECOMPUTE = {
  "mr01-wholenum-01": () => 6 * 47,
  "mr01-wholenum-02": () => 134 * 26,
  "mr01-wholenum-03": () => 391 % 7,
  "mr01-wholenum-04": () => 2916 / 36,
  "mr01-wholenum-05": () => 10000 - 4256,
  "mr01-decimal-01": () => +(3.45 + 2.18).toFixed(2),
  "mr01-decimal-02": () => +(7.6 - 2.4).toFixed(2),
  "mr01-decimal-03": () => +(4.7 + 3.28).toFixed(2),
  "mr01-decimal-04": () => +(15.6 / 4).toFixed(2),
  "mr01-decimal-05": () => 6 / 0.25,
  "mr01-fraction-01": () => fracStr(2 + 4, 9),
  "mr01-fraction-02": () => fracStr(1 * 2, 3 * 5),
  "mr01-fraction-03": () => fracStr(3 + 2, 12),
  "mr01-fraction-04": () => fracStr(3 * 3, 5 * 2),
  "mr01-fraction-05": () => fracStr(27 - 22, 12),
  "mr01-multistep-01": () => (8 + 4) * 3,
  "mr01-multistep-02": () => 20 - 3 * 4,
  "mr01-multistep-03": () => 6 + 4 * 5,
  "mr01-multistep-04": () => 18 - 2 * 3 + 5,
  "mr01-multistep-05": () => (5.5 + 2.5) * 4 - 10,
};

export function verify() {
  const problems = [];
  const seenIds = new Set();
  for (const q of mathsQuestions) {
    if (seenIds.has(q.id)) problems.push(`DUPLICATE ID: ${q.id}`);
    seenIds.add(q.id);
    if (!FAMILY_IDS.has(q.family_id)) problems.push(`UNKNOWN FAMILY: ${q.id} -> ${q.family_id}`);
    if (!["easy", "medium", "hard"].includes(q.difficulty)) problems.push(`INVALID DIFFICULTY: ${q.id}`);
    const recompute = RECOMPUTE[q.id];
    if (!recompute) { problems.push(`NO RECOMPUTATION DEFINED: ${q.id}`); continue; }
    const computed = String(recompute());
    if (computed !== q.answer) problems.push(`ANSWER MISMATCH: ${q.id} authored="${q.answer}" recomputed="${computed}"`);
  }
  return problems;
}

const problems = verify();
if (problems.length > 0) {
  console.error(`007T Mathematics batch: FAIL (${problems.length} problems)`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`007T Mathematics batch: PASS, ${mathsQuestions.length} questions, 0 answer/structure failures`);
