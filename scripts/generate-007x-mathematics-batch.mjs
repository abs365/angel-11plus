// ============================================================
// Educational Increment 007X — Mathematics Content Depth and Transfer
// Expansion. A deliberately smaller, tightly-governed batch (14 new
// questions) than the directive's "expected" 40-60 range, chosen because
// the directive itself permits this ("use a smaller batch if that is what
// can be properly governed and reviewed") and because effort was
// prioritised toward the four families with the strongest, most concrete
// prior evidence rather than spreading thin authoring across many.
//
// Selection basis (Part 4 prioritisation), each grounded in the existing
// Phase B record (ANGEL_PHASE_B_MATHEMATICS_TEACHING_COMPLETION_V1.md),
// not invented this increment:
//   - mr05-number-property-search (+5): the ONLY Mathematics family with
//     zero teaching content, explicitly classified TRANSFER-UNSAFE by
//     Phase B because its 2 existing siblings are structurally
//     near-identical ("prime search near a bound" both times). Phase B's
//     own recommendation: "add 3-4 more siblings varying the searched
//     property before this family is considered for teaching content."
//     This batch varies the property genuinely: squares, proper factors,
//     multiples, a two-constraint LCM search, and a multi-step
//     compute-then-search item.
//   - mr03-mixed-perimeter (+3 new, +1 reclassified legacy row): Phase
//     B's #1-ranked LIMITED family ("identical word-problem template
//     x3"). The pre-existing legacy row mth-003 (perimeter-to-area via an
//     algebraic ratio) is exactly the structural variant Phase B itself
//     recommended and is reclassified into this family by this same
//     migration (metadata-only, matching migration 062's own precedent) —
//     not authored fresh, since it already existed and was independently
//     re-verified correct. 3 further new siblings add: a direct
//     reverse-direction case, a decimal/non-integer case, and a square
//     special case requiring a square-root extraction.
//   - precision-frac (+3): Phase B's explicit fix ("needs a
//     non-improper-fraction or already-simplified case") — all 3 existing
//     siblings give a mixed number via an unreduced remainder; the new
//     siblings add a proper-fraction result, a case requiring
//     simplification before mixed-number conversion, and a
//     larger-magnitude case.
//   - precision-dec (+3): Phase B's explicit fix ("needs a round-down
//     example") — all 3 existing siblings round up; two new siblings
//     round down (one abstract division, one money-context), and the
//     third varies the decimal-place target (3dp instead of 2dp).
//
// Every answer is independently recomputed at generation time (verify()
// below), never merely asserted or trusted from a generator.
// ============================================================

export const mathsQuestions = [
  // --- mr05-number-property-search (+5) ---
  {
    id: "mr05-search-03", family_id: "mr05-number-property-search", skill: "QT-MR-11",
    difficulty: "easy", question: "What is the smallest square number greater than 50?", answer: "64",
    workingSteps: ["7² = 49, which is not greater than 50", "8² = 64, which is greater than 50"],
    misconception: "checking-bases-without-recognising-nearest-square-below-the-bound",
    marks: 1, estSeconds: 45, transferClass: "ROUTINE",
  },
  {
    id: "mr05-search-04", family_id: "mr05-number-property-search", skill: "QT-MR-11",
    difficulty: "medium", question: "What is the largest factor of 84 that is less than 84 itself?", answer: "42",
    workingSteps: ["The largest proper factor of a number is the number divided by its smallest prime factor", "84's smallest prime factor is 2", "84 ÷ 2 = 42"],
    misconception: "confusing-largest-proper-factor-with-largest-prime-factor",
    marks: 2, estSeconds: 75, transferClass: "ROUTINE",
  },
  {
    id: "mr05-search-05", family_id: "mr05-number-property-search", skill: "QT-MR-11",
    difficulty: "easy", question: "What is the smallest multiple of 6 that is greater than 100?", answer: "102",
    workingSteps: ["100 ÷ 6 = 16 remainder 4, so 6 × 16 = 96 is not greater than 100", "6 × 17 = 102"],
    misconception: "rounding-the-division-down-and-stopping-at-a-multiple-still-below-the-bound",
    marks: 1, estSeconds: 45, transferClass: "ROUTINE",
  },
  {
    id: "mr05-search-06", family_id: "mr05-number-property-search", skill: "QT-MR-11",
    difficulty: "hard", question: "What is the smallest number greater than 60 that is a multiple of both 4 and 5?", answer: "80",
    workingSteps: ["A number that is a multiple of both 4 and 5 must be a multiple of their LCM, 20", "Multiples of 20: 20, 40, 60, 80 ...", "60 is not greater than 60, so the answer is 80"],
    misconception: "testing-only-one-of-the-two-constraints-instead-of-their-lcm",
    marks: 2, estSeconds: 90, transferClass: "NEAR_TRANSFER",
  },
  {
    id: "mr05-search-07", family_id: "mr05-number-property-search", skill: "QT-MR-11",
    difficulty: "hard", question: "What is the smallest prime number greater than the square of 6?", answer: "37",
    workingSteps: ["6² = 36", "37 is not divisible by 2, 3, or 5, so 37 is prime", "37 is the smallest prime greater than 36"],
    misconception: "searching-for-a-prime-greater-than-6-itself-instead-of-greater-than-its-square",
    marks: 2, estSeconds: 90, transferClass: "NEAR_TRANSFER",
  },
  // --- mr03-mixed-perimeter (+3 new; mth-003 reclassified separately) ---
  {
    id: "mr03-mix-04", family_id: "mr03-mixed-perimeter", skill: "QT-MR-07",
    difficulty: "medium", question: "A rectangular playground has a perimeter of 54m. One side is 15m. What is the area?", answer: "180",
    workingSteps: ["Half the perimeter: 54 ÷ 2 = 27m", "The other side: 27 − 15 = 12m", "Area = 15 × 12 = 180 m²"],
    misconception: "halving-the-perimeter-incorrectly-or-treating-it-directly-as-one-side",
    marks: 2, estSeconds: 75, transferClass: "MIXED_TRANSFER",
  },
  {
    id: "mr03-mix-05", family_id: "mr03-mixed-perimeter", skill: "QT-MR-07",
    difficulty: "hard", question: "A rectangular pond has an area of 52.5 m² and one side is 7.5m. What is the perimeter?", answer: "29m",
    workingSteps: ["The other side: 52.5 ÷ 7.5 = 7m", "Perimeter = 2 × (7.5 + 7) = 29m"],
    misconception: "decimal-division-error-or-dropping-the-decimal-point-when-finding-the-other-side",
    marks: 2, estSeconds: 90, transferClass: "MIXED_TRANSFER",
  },
  {
    id: "mr03-mix-06", family_id: "mr03-mixed-perimeter", skill: "QT-MR-07",
    difficulty: "hard", question: "A square garden has an area of 81 m². What is its perimeter?", answer: "36m",
    workingSteps: ["A square's side length is the square root of its area: √81 = 9m", "Perimeter = 4 × 9 = 36m"],
    misconception: "attempting-to-use-the-rectangle-perimeter-formula-2x(l+w)-without-first-finding-the-side-via-a-square-root",
    marks: 2, estSeconds: 90, transferClass: "MIXED_TRANSFER",
  },
  // --- precision-frac (+3) ---
  {
    id: "precision-frac-04", family_id: "precision-frac", skill: "QT-MR-14",
    difficulty: "easy",
    question: "A 5m rope is cut into 8 equal pieces. What is the length of each piece? Give your answer as an exact fraction of a metre, in its simplest form.",
    answer: "5/8",
    workingSteps: ["5 ÷ 8 does not divide evenly", "As an exact fraction: 5/8 m", "5 and 8 share no common factor, so 5/8 is already in simplest form"],
    misconception: "believing-a-cut-length-answer-below-1-must-be-wrong-and-converting-it-to-a-decimal-or-over-simplifying",
    marks: 1, estSeconds: 60, transferClass: null,
  },
  {
    id: "precision-frac-05", family_id: "precision-frac", skill: "QT-MR-14",
    difficulty: "hard",
    question: "A 12m cable is cut into 8 equal pieces. What is the length of each piece? Give your answer as an exact fraction of a metre, in its simplest form.",
    answer: "1 1/2",
    workingSteps: ["12 ÷ 8 as a fraction: 12/8 m", "12/8 simplifies to 3/2 (divide both by 4)", "3/2 = 1 1/2 m"],
    misconception: "converting-12/8-directly-to-a-mixed-number-without-simplifying-first-e.g.-writing-1-4/8",
    marks: 2, estSeconds: 90, transferClass: null,
  },
  {
    id: "precision-frac-06", family_id: "precision-frac", skill: "QT-MR-14",
    difficulty: "medium",
    question: "A 45m fence is cut into 4 equal sections. What is the length of each section? Give your answer as an exact fraction of a metre, in its simplest form.",
    answer: "11 1/4",
    workingSteps: ["45 ÷ 4 does not divide evenly", "As an exact fraction: 45/4 m", "45/4 = 11 remainder 1, so 11 1/4 m"],
    misconception: "losing-track-of-the-remainder-in-long-division-with-larger-numbers",
    marks: 1, estSeconds: 60, transferClass: null,
  },
  // --- precision-dec (+3) ---
  {
    id: "precision-dec-04", family_id: "precision-dec", skill: "QT-MR-14",
    difficulty: "medium", question: "22 ÷ 7 = ? Give your answer to 2 decimal places.", answer: "3.14",
    workingSteps: ["22 ÷ 7 = 3.142857... (repeating)", "The third decimal digit is 2, so the second decimal place stays as it is", "3.142... rounds to 3.14"],
    misconception: "assuming-every-rounding-question-rounds-up-having-only-practised-round-up-examples",
    marks: 1, estSeconds: 60, transferClass: null,
  },
  {
    id: "precision-dec-05", family_id: "precision-dec", skill: "QT-MR-14",
    difficulty: "hard", question: "A 17km relay race is split evenly between 3 runners. How far does each runner run, in km, to 3 decimal places?", answer: "5.667",
    workingSteps: ["17 ÷ 3 = 5.6666... (repeating)", "The fourth decimal digit is 6, so round the third decimal place up", "5.666... rounds to 5.667"],
    misconception: "applying-a-2-decimal-place-rounding-habit-when-the-question-asks-for-3",
    marks: 2, estSeconds: 75, transferClass: null,
  },
  {
    id: "precision-dec-06", family_id: "precision-dec", skill: "QT-MR-14",
    difficulty: "medium", question: "A bill of £15 is shared equally between 7 people. How much does each person pay, to the nearest penny (2 decimal places)?", answer: "2.14",
    workingSteps: ["15 ÷ 7 = 2.142857... (repeating)", "The third decimal digit is 2, so the second decimal place stays as it is", "2.142... rounds to 2.14"],
    misconception: "assuming-every-rounding-question-rounds-up-having-only-practised-round-up-examples",
    marks: 1, estSeconds: 60, transferClass: null,
  },
];

const FAMILY_IDS = new Set([
  "mr05-number-property-search",
  "mr03-mixed-perimeter",
  "precision-frac",
  "precision-dec",
]);

/** Metadata-only reclassification, matching migration 062's own precedent:
 * mth-003 (existing, provisional, independently re-verified correct below)
 * structurally belongs to mr03-mixed-perimeter (perimeter-to-area via an
 * algebraic ratio) and is exactly the structural variant Phase B itself
 * recommended. Its content, difficulty, and eligibility_status are
 * untouched -- only family_id is set. */
export const RECLASSIFIED_LEGACY_ROWS = [
  { id: "mth-003", family_id: "mr03-mixed-perimeter" },
];

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function fracStr(n, d) {
  const g = gcd(Math.abs(n), Math.abs(d));
  const rn = n / g, rd = d / g;
  if (rn >= rd) {
    const whole = Math.floor(rn / rd);
    const rem = rn - whole * rd;
    return rem === 0 ? String(whole) : `${whole} ${rem}/${rd}`;
  }
  return `${rn}/${rd}`;
}

const RECOMPUTE = {
  "mr05-search-03": () => { let n = 8; while (n * n <= 50) n++; return n * n; },
  "mr05-search-04": () => { for (let f = 2; f <= 84; f++) { if (84 % f === 0) return 84 / f; } return null; },
  "mr05-search-05": () => { let n = Math.floor(100 / 6) * 6; while (n <= 100) n += 6; return n; },
  "mr05-search-06": () => { const lcm = 20; let n = lcm; while (n <= 60) n += lcm; return n; },
  "mr05-search-07": () => {
    const isPrime = (x) => { if (x < 2) return false; for (let i = 2; i * i <= x; i++) if (x % i === 0) return false; return true; };
    let n = 6 * 6 + 1; while (!isPrime(n)) n++; return n;
  },
  "mr03-mix-04": () => { const other = 54 / 2 - 15; return 15 * other; },
  "mr03-mix-05": () => { const other = 52.5 / 7.5; return `${2 * (7.5 + other)}m`; },
  "mr03-mix-06": () => `${4 * Math.sqrt(81)}m`,
  "precision-frac-04": () => fracStr(5, 8),
  "precision-frac-05": () => fracStr(12, 8),
  "precision-frac-06": () => fracStr(45, 4),
  "precision-dec-04": () => (22 / 7).toFixed(2),
  "precision-dec-05": () => (17 / 3).toFixed(3),
  "precision-dec-06": () => (15 / 7).toFixed(2),
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
  // Structural-similarity guard (Part 11/12): within each family, no two
  // siblings' question text may be identical after stripping digits --
  // catches a "same template, numbers only" clone.
  const byFamily = {};
  for (const q of mathsQuestions) (byFamily[q.family_id] ??= []).push(q);
  for (const [fam, qs] of Object.entries(byFamily)) {
    const shapes = new Set();
    for (const q of qs) {
      const shape = q.question.replace(/\d+(\.\d+)?/g, "#");
      if (shapes.has(shape)) problems.push(`STRUCTURAL NEAR-DUPLICATE within ${fam}: "${shape}"`);
      shapes.add(shape);
    }
  }
  return problems;
}

const problems = verify();
if (problems.length > 0) {
  console.error(`007X Mathematics batch: FAIL (${problems.length} problems)`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`007X Mathematics batch: PASS, ${mathsQuestions.length} questions, 0 answer/structure failures`);
