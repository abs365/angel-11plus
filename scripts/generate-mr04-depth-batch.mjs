// ============================================================
// Stage 3, Increment 003 — Mathematics Content Depth and Variation
// Foundation. Targets the MR-04 concentration Decision 115 identified
// (QT-MR-04, QT-MR-10, QT-MR-13 -- all single-valued at "medium",
// confirmed via a live production query before this script was written).
//
// Direct inspection of every existing question for these three skills
// (not counts alone, per this increment's own instruction) found:
//   - QT-MR-04 (17 rows): two real structures already present (compound
//     percentage change; proportional scaling from a given ratio) --
//     genuinely no reverse/missing-value structure at any difficulty.
//   - QT-MR-10 (6 rows): the one named family (mr04-elapsed-time, 5
//     siblings) is CONFIRMED structurally identical across every sibling
//     -- "start + stage + break + stage = finish", numbers/context
//     substituted only. No reverse-direction structure exists.
//   - QT-MR-13 (9 rows): two genuine structures already present
//     (unit-price comparison; divisibility/remainder constraint search)
//     -- no structure requiring a unit-conversion step first.
//
// Each new family below adds exactly ONE genuinely new reasoning
// structure (never present before for that skill), at "hard" difficulty
// (the missing tier), closing both the structural-variation gap and the
// difficulty-depth gap for that skill in one well-motivated addition --
// never "hard" merely via larger numbers. Family size (3-4 siblings)
// matches this content bank's own established convention throughout
// (e.g. mr04-compound-percentage: 5 siblings, all one structure,
// surface-varied by item/number) -- one genuine structure per family,
// with legitimate surface variation (context/items/numbers) across
// siblings, disclosed here as exactly that, not fabricated depth.
//
// Every answer independently recomputed at generation time (verify()
// below, RECOMPUTE map), never merely asserted. All rows inserted as
// eligibility_status = 'provisional' -- NOT made practice-eligible by
// this script or the migration it emits; that requires a separate,
// future, genuinely-reviewed activation migration per this project's
// own standing review discipline (ANGEL_EDUCATIONAL_REVIEW_OPERATING_
// MODEL_V1.md), not bypassed merely because this increment is
// Founder-authorised.
// ============================================================

export const FAMILY_IDS = new Set(["mr04-reverse-percentage", "mr04-time-reverse", "mr04-bv-convert"]);

export const mathsQuestions = [
  // --- mr04-reverse-percentage (QT-MR-04) — reverse/missing-value
  // percentage reasoning: given the result of a known percentage change,
  // find the original value. Genuinely new: the existing QT-MR-04 content
  // (compound-percentage, far-percent, far-recipe) always gives the
  // ORIGINAL and asks for the result; this inverts the direction, the
  // exact kind of reverse-reasoning difficulty driver named in Part 2A.
  // Two sub-variants (increase-reversal, decrease-reversal) are the only
  // two structurally valid directions for this operation; 2 surface-
  // varied siblings per variant, matching this bank's own established
  // per-family convention.
  {
    id: "mr04-revpct-01", family_id: "mr04-reverse-percentage", skill: "QT-MR-04",
    difficulty: "hard", question: "A shop increases every price by 20%. After the increase, a jacket costs £96. What was the price before the increase?", answer: "£80",
    workingSteps: ["The new price, £96, represents 120% of the original price (100% + 20% increase)", "£96 ÷ 1.20 = £80"],
    misconception: "applying-the-percentage-to-the-new-value-instead-of-dividing-to-undo-it",
    marks: 2, estSeconds: 90, transferClass: "FAR_TRANSFER",
  },
  {
    id: "mr04-revpct-02", family_id: "mr04-reverse-percentage", skill: "QT-MR-04",
    difficulty: "hard", question: "A company decreases every salary by 15%. After the decrease, an employee earns £680 per month. What was the salary before the decrease?", answer: "£800",
    workingSteps: ["The new salary, £680, represents 85% of the original salary (100% − 15% decrease)", "£680 ÷ 0.85 = £800"],
    misconception: "applying-the-percentage-to-the-new-value-instead-of-dividing-to-undo-it",
    marks: 2, estSeconds: 90, transferClass: "FAR_TRANSFER",
  },
  {
    id: "mr04-revpct-03", family_id: "mr04-reverse-percentage", skill: "QT-MR-04",
    difficulty: "hard", question: "A shop increases every price by 8%. After the increase, a laptop costs £540. What was the price before the increase?", answer: "£500",
    workingSteps: ["The new price, £540, represents 108% of the original price (100% + 8% increase)", "£540 ÷ 1.08 = £500"],
    misconception: "applying-the-percentage-to-the-new-value-instead-of-dividing-to-undo-it",
    marks: 2, estSeconds: 90, transferClass: "FAR_TRANSFER",
  },
  {
    id: "mr04-revpct-04", family_id: "mr04-reverse-percentage", skill: "QT-MR-04",
    difficulty: "hard", question: "A charity's donations decreased by 20% this year compared to last year. This year they received £720. How much did they receive last year?", answer: "£900",
    workingSteps: ["This year's total, £720, represents 80% of last year's total (100% − 20% decrease)", "£720 ÷ 0.80 = £900"],
    misconception: "applying-the-percentage-to-the-new-value-instead-of-dividing-to-undo-it",
    marks: 2, estSeconds: 90, transferClass: "FAR_TRANSFER",
  },

  // --- mr04-time-reverse (QT-MR-10) — reverse elapsed time: given the
  // finish time and each stage's duration, find the start time. The
  // existing mr04-elapsed-time family only ever gives the start time and
  // asks for the finish; this requires subtracting backward through the
  // same multi-stage structure instead of adding forward -- reverse
  // reasoning, not bigger numbers.
  {
    id: "mr04-timerev-01", family_id: "mr04-time-reverse", skill: "QT-MR-10",
    difficulty: "hard", question: "A workshop finishes at 13:15. It consisted of a 40 minute session, a 15 minute break, and a 35 minute session, in that order. What time did the workshop start?", answer: "11:45",
    workingSteps: ["Total time from start to finish: 40 + 15 + 35 = 90 minutes = 1 hour 30 minutes", "Subtract this from the finish time: 13:15 − 1:30 = 11:45"],
    misconception: "subtracting-the-total-elapsed-time-incorrectly-or-adding-instead-of-subtracting",
    marks: 2, estSeconds: 90, transferClass: "FAR_TRANSFER",
  },
  {
    id: "mr04-timerev-02", family_id: "mr04-time-reverse", skill: "QT-MR-10",
    difficulty: "hard", question: "A cinema screening finishes at 21:10. It consisted of 20 minutes of adverts, a 10 minute break, and a 90 minute film, in that order. What time did the screening start?", answer: "19:10",
    workingSteps: ["Total time from start to finish: 20 + 10 + 90 = 120 minutes = 2 hours", "Subtract this from the finish time: 21:10 − 2:00 = 19:10"],
    misconception: "subtracting-the-total-elapsed-time-incorrectly-or-adding-instead-of-subtracting",
    marks: 2, estSeconds: 90, transferClass: "FAR_TRANSFER",
  },
  {
    id: "mr04-timerev-03", family_id: "mr04-time-reverse", skill: "QT-MR-10",
    difficulty: "hard", question: "An exam session finishes at 15:50. It consisted of a 5 minute instructions period, a 90 minute paper, and a 15 minute review period, in that order. What time did the session start?", answer: "14:00",
    workingSteps: ["Total time from start to finish: 5 + 90 + 15 = 110 minutes = 1 hour 50 minutes", "Subtract this from the finish time: 15:50 − 1:50 = 14:00"],
    misconception: "subtracting-the-total-elapsed-time-incorrectly-or-adding-instead-of-subtracting",
    marks: 2, estSeconds: 90, transferClass: "FAR_TRANSFER",
  },
  {
    id: "mr04-timerev-04", family_id: "mr04-time-reverse", skill: "QT-MR-10",
    difficulty: "hard", question: "A train arrives at 09:05. Its journey consisted of a 1 hour 45 minute first leg, a 10 minute stop, and a 50 minute second leg, in that order. What time did the train depart?", answer: "06:20",
    workingSteps: ["Total time from start to finish: 105 + 10 + 50 = 165 minutes = 2 hours 45 minutes", "Subtract this from the arrival time: 09:05 − 2:45 = 06:20"],
    misconception: "subtracting-the-total-elapsed-time-incorrectly-or-adding-instead-of-subtracting",
    marks: 2, estSeconds: 90, transferClass: "FAR_TRANSFER",
  },

  // --- mr04-bv-convert (QT-MR-13) — best value requiring a unit
  // conversion before comparison. The existing mr04-best-value family
  // always states both options in the same unit; this adds the genuine
  // extra reasoning step of converting to a common unit first, the
  // "distractor complexity" / "combination of previously learned
  // operations" difficulty drivers named in Part 2A. Answers deliberately
  // mixed (A, B, A), not all one letter, so position alone cannot predict
  // the answer (Part 2D anti-memorisation).
  {
    id: "mr04-bvconv-01", family_id: "mr04-bv-convert", skill: "QT-MR-13",
    difficulty: "hard", question: "Rice: Option A is 500g for £1.00. Option B is 1.5kg for £3.30. Which option is better value, A or B?", answer: "A",
    workingSteps: ["Convert both to the same unit (price per kg)", "Option A: £1.00 ÷ 0.5kg = £2.00 per kg", "Option B: £3.30 ÷ 1.5kg = £2.20 per kg", "The lower price per kg is better value: Option A"],
    misconception: "comparing-prices-without-converting-to-the-same-unit-first",
    marks: 2, estSeconds: 90, transferClass: "FAR_TRANSFER",
  },
  {
    id: "mr04-bvconv-02", family_id: "mr04-bv-convert", skill: "QT-MR-13",
    difficulty: "hard", question: "Cheese: Option A is 250g for £2.00. Option B is 1kg for £7.60. Which option is better value, A or B?", answer: "B",
    workingSteps: ["Convert both to the same unit (price per kg)", "Option A: £2.00 ÷ 0.25kg = £8.00 per kg", "Option B: £7.60 ÷ 1kg = £7.60 per kg", "The lower price per kg is better value: Option B"],
    misconception: "comparing-prices-without-converting-to-the-same-unit-first",
    marks: 2, estSeconds: 90, transferClass: "FAR_TRANSFER",
  },
  {
    id: "mr04-bvconv-03", family_id: "mr04-bv-convert", skill: "QT-MR-13",
    difficulty: "hard", question: "Pasta: Option A is 500g for £0.75. Option B is 1.2kg for £2.16. Which option is better value, A or B?", answer: "A",
    workingSteps: ["Convert both to the same unit (price per kg)", "Option A: £0.75 ÷ 0.5kg = £1.50 per kg", "Option B: £2.16 ÷ 1.2kg = £1.80 per kg", "The lower price per kg is better value: Option A"],
    misconception: "comparing-prices-without-converting-to-the-same-unit-first",
    marks: 2, estSeconds: 90, transferClass: "FAR_TRANSFER",
  },
];

const RECOMPUTE = {
  "mr04-revpct-01": () => `£${Math.round(96 / 1.2)}`,
  "mr04-revpct-02": () => `£${Math.round(680 / 0.85)}`,
  "mr04-revpct-03": () => `£${Math.round(540 / 1.08)}`,
  "mr04-revpct-04": () => `£${Math.round(720 / 0.8)}`,
  "mr04-timerev-01": () => {
    const finish = 13 * 60 + 15, total = 40 + 15 + 35, start = finish - total;
    return `${String(Math.floor(start / 60)).padStart(2, "0")}:${String(start % 60).padStart(2, "0")}`;
  },
  "mr04-timerev-02": () => {
    const finish = 21 * 60 + 10, total = 20 + 10 + 90, start = finish - total;
    return `${String(Math.floor(start / 60)).padStart(2, "0")}:${String(start % 60).padStart(2, "0")}`;
  },
  "mr04-timerev-03": () => {
    const finish = 15 * 60 + 50, total = 5 + 90 + 15, start = finish - total;
    return `${String(Math.floor(start / 60)).padStart(2, "0")}:${String(start % 60).padStart(2, "0")}`;
  },
  "mr04-timerev-04": () => {
    const finish = 9 * 60 + 5, total = 105 + 10 + 50, start = finish - total;
    return `${String(Math.floor(start / 60)).padStart(2, "0")}:${String(start % 60).padStart(2, "0")}`;
  },
  "mr04-bvconv-01": () => (1.0 / 0.5 < 3.3 / 1.5 ? "A" : "B"),
  "mr04-bvconv-02": () => (2.0 / 0.25 < 7.6 / 1 ? "A" : "B"),
  "mr04-bvconv-03": () => (0.75 / 0.5 < 2.16 / 1.2 ? "A" : "B"),
};

export function verify() {
  const problems = [];
  const seenIds = new Set();
  for (const q of mathsQuestions) {
    if (seenIds.has(q.id)) problems.push(`DUPLICATE ID: ${q.id}`);
    seenIds.add(q.id);
    if (!FAMILY_IDS.has(q.family_id)) problems.push(`UNKNOWN FAMILY: ${q.id} -> ${q.family_id}`);
    if (!["easy", "medium", "hard", "challenge"].includes(q.difficulty)) problems.push(`INVALID DIFFICULTY: ${q.id}`);
    const recompute = RECOMPUTE[q.id];
    if (!recompute) { problems.push(`NO RECOMPUTATION DEFINED: ${q.id}`); continue; }
    const computed = String(recompute());
    if (computed !== q.answer) problems.push(`ANSWER MISMATCH: ${q.id} authored="${q.answer}" recomputed="${computed}"`);
    if (/[—–]/.test(q.question) || /[—–]/.test(q.workingSteps.join(" "))) problems.push(`DASH PUNCTUATION: ${q.id}`);
  }
  // Structural-similarity guard, same convention as generate-007x-mathematics-batch.mjs:
  // within each family, no two siblings' question text may be identical after
  // stripping digits -- catches a "same template, numbers only" clone.
  const byFamily = {};
  for (const q of mathsQuestions) (byFamily[q.family_id] ??= []).push(q);
  for (const [fam, qs] of Object.entries(byFamily)) {
    const shapes = new Set();
    for (const q of qs) {
      const shape = q.question.replace(/[\d.:]+/g, "#");
      if (shapes.has(shape)) problems.push(`STRUCTURAL NEAR-DUPLICATE within ${fam}: "${shape}"`);
      shapes.add(shape);
    }
  }
  // Cross-family duplicate-answer-letter sanity check for mr04-bv-convert
  // specifically (Part 2D anti-memorisation): the answer must not be the
  // same letter for every sibling in that one family.
  const bvAnswers = mathsQuestions.filter((q) => q.family_id === "mr04-bv-convert").map((q) => q.answer);
  if (new Set(bvAnswers).size < 2) problems.push("mr04-bv-convert: every sibling has the same answer letter -- position alone would predict it");

  return problems;
}

const problems = verify();
if (problems.length > 0) {
  console.error(`MR-04 depth batch: FAIL (${problems.length} problems)`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`MR-04 depth batch: PASS, ${mathsQuestions.length} questions, 0 answer/structure failures`);
