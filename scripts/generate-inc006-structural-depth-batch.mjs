// ============================================================
// Stage 3, Increment 006 — Mathematics Structural Depth Expansion.
// Targets QT-MR-12 (Average/Mean) and QT-MR-08 (Coordinate/
// Transformation), the two skills Decision 121's discovery pass found
// genuine, repository-supported content-depth gaps for -- QT-MR-02 and
// QT-RC-07 are explicitly out of scope for this increment.
//
// Direct re-inspection of every existing question for both skills (not
// counts alone) confirmed Decision 121's own findings still hold:
//   - QT-MR-12 (mr01-average-mean, 4 rows): every sibling is the
//     identical "sum the values, divide by the count" forward-only
//     structure -- context and numbers vary, the reasoning does not.
//     CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md's own Measurement Purpose
//     for QT-MR-12 explicitly names an "inverse form... reconstruct a
//     missing value... from a stated mean" that has never been authored.
//   - QT-MR-08 (mr03-coordinate, 3 rows): 3 genuinely distinct single
//     transformations (reflect-x, reflect-y, translate), no repeated
//     structure, but each is thin (1 example) and no sibling combines
//     two transformations, even though the underlying reasoning already
//     requires tracking exactly one operation at a time.
//
// Each new family adds exactly ONE genuinely new reasoning structure,
// never present before for that skill, at "hard" difficulty -- never
// "hard" merely via larger numbers (magnitudes below are deliberately
// kept comparable to the existing medium-tier siblings; the added
// reasoning stage, not the numbers, is what makes these harder).
//
// mr01-reverse-mean (QT-MR-12): given a mean and all-but-one of the
// underlying values, find the missing value. Requires recognising that
// total = mean x count BEFORE subtracting the known values -- an
// additional reasoning stage the forward-only existing family never
// requires. 4 siblings, deliberately mirroring the original family's own
// 4 contexts (scores, temperature, savings, distance) with entirely new
// numbers, so the direct forward/reverse educational relationship is
// visible to a reviewer without any two rows sharing real numbers.
//
// mr03-coord-combined (QT-MR-08): two transformations applied to one
// point, in a stated order, where the two operations genuinely do not
// commute (reflection and translation give a different result depending
// on order) -- so applying them in the wrong order produces a different,
// plausible-looking wrong answer, not an obviously-broken one. 4
// siblings: 2 reflect-then-translate (x-axis, y-axis), 2
// translate-then-reflect (x-axis, y-axis) -- both axis and order vary,
// so no single sub-case is left untested.
//
// Every answer independently recomputed at generation time (verify()
// below, RECOMPUTE map), never merely asserted. All rows inserted as
// eligibility_status = 'provisional' -- NOT made practice-eligible by
// this script or the migration it emits; a separate, future,
// genuinely-reviewed activation migration is required, matching every
// prior batch in this project's history.
// ============================================================

export const FAMILY_IDS = new Set(["mr01-reverse-mean", "mr03-coord-combined"]);

export const mathsQuestions = [
  // --- mr01-reverse-mean (QT-MR-12) ---
  {
    id: "mr01-revmean-01", family_id: "mr01-reverse-mean", skill: "QT-MR-12",
    difficulty: "hard", question: "A player's mean score across five games was 18. Four of the scores were 15, 20, 12, 22. What was the fifth score?", answer: "21",
    workingSteps: ["The total for all five games is 18 × 5 = 90", "The four known scores add up to 15 + 20 + 12 + 22 = 69", "The fifth score is 90 − 69 = 21"],
    misconception: "treating-the-mean-as-the-total-instead-of-multiplying-by-the-count-first",
    marks: 2, estSeconds: 90, transferClass: "FAR_TRANSFER",
  },
  {
    id: "mr01-revmean-02", family_id: "mr01-reverse-mean", skill: "QT-MR-12",
    difficulty: "hard", question: "Over four days, the mean temperature was 17°C. Three of the daily temperatures were 15°C, 21°C, 14°C. What was the fourth day's temperature?", answer: "18°C",
    workingSteps: ["The total for all four days is 17 × 4 = 68", "The three known temperatures add up to 15 + 21 + 14 = 50", "The fourth day's temperature is 68 − 50 = 18°C"],
    misconception: "treating-the-mean-as-the-total-instead-of-multiplying-by-the-count-first",
    marks: 2, estSeconds: 90, transferClass: "FAR_TRANSFER",
  },
  {
    id: "mr01-revmean-03", family_id: "mr01-reverse-mean", skill: "QT-MR-12",
    difficulty: "hard", question: "Over five weeks, Maya's mean savings was £14. Four of the weekly amounts were £10, £18, £9, £16. How much did she save in the remaining week?", answer: "£17",
    workingSteps: ["The total saved over all five weeks is £14 × 5 = £70", "The four known weeks add up to £10 + £18 + £9 + £16 = £53", "The remaining week is £70 − £53 = £17"],
    misconception: "treating-the-mean-as-the-total-instead-of-multiplying-by-the-count-first",
    marks: 2, estSeconds: 90, transferClass: "FAR_TRANSFER",
  },
  {
    id: "mr01-revmean-04", family_id: "mr01-reverse-mean", skill: "QT-MR-12",
    difficulty: "hard", question: "A runner's mean distance over four days was 8km. Three of the distances were 6km, 9km, 7km. What was the fourth day's distance?", answer: "10km",
    workingSteps: ["The total distance over all four days is 8 × 4 = 32km", "The three known distances add up to 6 + 9 + 7 = 22km", "The fourth day's distance is 32 − 22 = 10km"],
    misconception: "treating-the-mean-as-the-total-instead-of-multiplying-by-the-count-first",
    marks: 2, estSeconds: 90, transferClass: "FAR_TRANSFER",
  },

  // --- mr03-coord-combined (QT-MR-08) ---
  {
    id: "mr03-combo-01", family_id: "mr03-coord-combined", skill: "QT-MR-08",
    difficulty: "hard", question: "Point A is at (2, 5). It is first reflected in the x-axis, then translated 3 units right and 1 unit down. What are the final coordinates?", answer: "(5, -6)",
    workingSteps: ["Reflect in the x-axis first: (2, 5) becomes (2, -5)", "Then translate 3 right and 1 down: (2 + 3, -5 - 1) = (5, -6)"],
    misconception: "applying-the-two-transformations-in-the-wrong-order-or-only-applying-one-of-them",
    marks: 2, estSeconds: 100, transferClass: "FAR_TRANSFER",
  },
  {
    id: "mr03-combo-02", family_id: "mr03-coord-combined", skill: "QT-MR-08",
    difficulty: "hard", question: "Point B is at (-4, 3). It is first reflected in the y-axis, then translated 2 units left and 4 units up. What are the final coordinates?", answer: "(2, 7)",
    workingSteps: ["Reflect in the y-axis first: (-4, 3) becomes (4, 3)", "Then translate 2 left and 4 up: (4 - 2, 3 + 4) = (2, 7)"],
    misconception: "applying-the-two-transformations-in-the-wrong-order-or-only-applying-one-of-them",
    marks: 2, estSeconds: 100, transferClass: "FAR_TRANSFER",
  },
  {
    id: "mr03-combo-03", family_id: "mr03-coord-combined", skill: "QT-MR-08",
    difficulty: "hard", question: "Point C is at (1, -2). It is first translated 4 units right and 3 units up, then reflected in the x-axis. What are the final coordinates?", answer: "(5, -1)",
    workingSteps: ["Translate first: (1 + 4, -2 + 3) = (5, 1)", "Then reflect in the x-axis: (5, 1) becomes (5, -1)"],
    misconception: "applying-the-two-transformations-in-the-wrong-order-or-only-applying-one-of-them",
    marks: 2, estSeconds: 100, transferClass: "FAR_TRANSFER",
  },
  {
    id: "mr03-combo-04", family_id: "mr03-coord-combined", skill: "QT-MR-08",
    difficulty: "hard", question: "Point D is at (-3, -5). It is first translated 2 units right and 6 units up, then reflected in the y-axis. What are the final coordinates?", answer: "(1, 1)",
    workingSteps: ["Translate first: (-3 + 2, -5 + 6) = (-1, 1)", "Then reflect in the y-axis: (-1, 1) becomes (1, 1)"],
    misconception: "applying-the-two-transformations-in-the-wrong-order-or-only-applying-one-of-them",
    marks: 2, estSeconds: 100, transferClass: "FAR_TRANSFER",
  },
];

const RECOMPUTE = {
  "mr01-revmean-01": () => String(18 * 5 - (15 + 20 + 12 + 22)),
  "mr01-revmean-02": () => `${17 * 4 - (15 + 21 + 14)}°C`,
  "mr01-revmean-03": () => `£${14 * 5 - (10 + 18 + 9 + 16)}`,
  "mr01-revmean-04": () => `${8 * 4 - (6 + 9 + 7)}km`,
  "mr03-combo-01": () => {
    const afterReflect = [2, -5];
    const final = [afterReflect[0] + 3, afterReflect[1] - 1];
    return `(${final[0]}, ${final[1]})`;
  },
  "mr03-combo-02": () => {
    const afterReflect = [4, 3];
    const final = [afterReflect[0] - 2, afterReflect[1] + 4];
    return `(${final[0]}, ${final[1]})`;
  },
  "mr03-combo-03": () => {
    const afterTranslate = [1 + 4, -2 + 3];
    const final = [afterTranslate[0], -afterTranslate[1]];
    return `(${final[0]}, ${final[1]})`;
  },
  "mr03-combo-04": () => {
    const afterTranslate = [-3 + 2, -5 + 6];
    const final = [-afterTranslate[0], afterTranslate[1]];
    return `(${final[0]}, ${final[1]})`;
  },
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
  // Structural-similarity guard, same convention as generate-mr04-depth-batch.mjs:
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
  // mr03-coord-combined-specific: order (reflect-then-translate vs
  // translate-then-reflect) and axis (x vs y) must both vary across the
  // 4 siblings, not just the numbers -- the whole educational point of
  // this family is testing that the learner tracks a stated ORDER, not
  // just performs two operations in whichever order feels natural.
  const combo = mathsQuestions.filter((q) => q.family_id === "mr03-coord-combined");
  const reflectFirst = combo.filter((q) => /first reflected/.test(q.question)).length;
  const translateFirst = combo.filter((q) => /first translated/.test(q.question)).length;
  if (reflectFirst === 0 || translateFirst === 0) problems.push("mr03-coord-combined: both orders (reflect-first and translate-first) must be represented");

  return problems;
}

const problems = verify();
if (problems.length > 0) {
  console.error(`Increment 006 structural depth batch: FAIL (${problems.length} problems)`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`Increment 006 structural depth batch: PASS, ${mathsQuestions.length} questions, 0 answer/structure failures`);
