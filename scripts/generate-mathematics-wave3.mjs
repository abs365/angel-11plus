#!/usr/bin/env node
/**
 * Educational Increment 006 — Mathematics Wave 3 Content Factory.
 * Same discipline as Waves 1-2: every answer computed in code, enumerated
 * parameter sets, validated before authoring. Six NEW families, broadening
 * coverage beyond Wave 1/2's MR-02/MR-03/MR-04/MR-05 single structures:
 *
 *   mr01-missing-operand  (QT-MR-02, MR-01, REVERSE REASONING, ROUTINE)
 *     Solve for an unknown operand in an otherwise-complete arithmetic
 *     statement. QT-MR-02's own evidenced Measurement Purpose: "tests
 *     inverse-operation reasoning rather than forward calculation alone."
 *
 *   mr03-coordinate       (QT-MR-08, MR-03, ROUTINE, new representation)
 *     Coordinate reflection/translation — genuinely new representation
 *     (a coordinate grid) distinct from Wave 1/2's angle-based geometry.
 *
 *   mr05-constrained-multiple (QT-MR-11, MR-05, CONSTRAINT SATISFACTION,
 *     ROUTINE) Smallest/largest common multiple satisfying a bound —
 *     genuine LCM reasoning, distinct from Wave 1's true/false judgement
 *     and Wave 2's prime search.
 *
 *   mr02-far-ratio-context (QT-MR-06, primary MR-02, FAR_TRANSFER)
 *     A ratio-of-two-quantities relationship embedded in prose with no
 *     algebra notation and no instruction to "solve" or "set up an
 *     equation" — the second, deliberately DIFFERENT far-transfer
 *     representation this programme now has (Wave 2's was proportional
 *     shop pricing; this is a part-whole ratio split).
 *
 *   mr03-mixed-perimeter  (QT-MR-07, primary MR-03 + supporting MR-01,
 *     MIXED_TRANSFER) Area and one side given; perimeter asked. Genuinely
 *     requires MR-03's area/perimeter relationship AND MR-01 arithmetic
 *     to resolve — not incidental.
 *
 *   mr04-far-recipe        (QT-MR-04, primary MR-04 + supporting MR-01,
 *     FAR_TRANSFER) Unitary-method scaling (recipe quantities) — a
 *     second, genuinely different far-transfer context from Wave 2's
 *     before/after price ratio, addressing that wave's own disclosed
 *     single-context limitation.
 *
 * Run: node scripts/generate-mathematics-wave3.mjs
 */
import { writeFileSync } from "node:fs";

const items = [];

// ============================================================
// mr01-missing-operand
// ============================================================
function mr01MissingOperand({ id, expression, answer }) {
  return {
    id,
    family: "mr01-missing-operand",
    structure: "REVERSE REASONING",
    transferClass: "ROUTINE",
    primaryCompetency: "MR-01",
    supportingCompetencies: [],
    question: `${expression}. What number replaces the box?`,
    answer: String(answer),
    workingSteps: [`Rearrange to find the missing number: ${answer}`],
    misconception: "Applying the stated operation directly to the two visible numbers instead of using its inverse to find the missing one.",
  };
}
{
  const p = [
    { id: "mr01-mop-01", expression: "▢ × 7 = 84", answer: 12 },
    { id: "mr01-mop-02", expression: "56 ÷ ▢ = 8", answer: 7 },
    { id: "mr01-mop-03", expression: "▢ − 15 = 23", answer: 38 },
    { id: "mr01-mop-04", expression: "▢ + 27 = 50", answer: 23 },
  ];
  for (const x of p) items.push(mr01MissingOperand(x));
}

// ============================================================
// mr03-coordinate
// ============================================================
function mr03Coordinate({ id, question, answer, workingSteps }) {
  return {
    id,
    family: "mr03-coordinate",
    structure: "UNUSUAL REPRESENTATION",
    transferClass: "ROUTINE",
    primaryCompetency: "MR-03",
    supportingCompetencies: [],
    question,
    answer,
    workingSteps,
    misconception: "Reflecting in the wrong axis (negating the wrong coordinate), or applying a translation in the wrong direction.",
  };
}
items.push(
  mr03Coordinate({
    id: "mr03-coord-01",
    question: "Point A is at (3, 5). It is reflected in the x-axis. What are the new coordinates?",
    answer: "(3, -5)",
    workingSteps: ["Reflecting in the x-axis keeps x the same and reverses the sign of y", "(3, 5) becomes (3, -5)"],
  })
);
items.push(
  mr03Coordinate({
    id: "mr03-coord-02",
    question: "Point B is at (4, -2). It is reflected in the y-axis. What are the new coordinates?",
    answer: "(-4, -2)",
    workingSteps: ["Reflecting in the y-axis keeps y the same and reverses the sign of x", "(4, -2) becomes (-4, -2)"],
  })
);
items.push(
  mr03Coordinate({
    id: "mr03-coord-03",
    question: "Point C is at (-3, 6). It is translated 5 units right and 2 units down. What are the new coordinates?",
    answer: "(2, 4)",
    workingSteps: ["Right increases x, down decreases y", "(-3 + 5, 6 - 2) = (2, 4)"],
  })
);

// ============================================================
// mr05-constrained-multiple
// ============================================================
function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}
function mr05ConstrainedMultiple({ id, a, b, bound, direction }) {
  const lcm = (a * b) / gcd(a, b);
  let answer;
  if (direction === "smallest-above") {
    answer = Math.ceil((bound + 1) / lcm) * lcm;
    if (answer <= bound) answer += lcm;
  } else {
    answer = Math.floor((bound - 1) / lcm) * lcm;
  }
  return {
    id,
    family: "mr05-constrained-multiple",
    structure: "CONSTRAINT SATISFACTION",
    transferClass: "ROUTINE",
    primaryCompetency: "MR-05",
    supportingCompetencies: [],
    question: `What is the ${direction === "smallest-above" ? "smallest" : "largest"} multiple of both ${a} and ${b} that is ${
      direction === "smallest-above" ? `greater than ${bound}` : `less than ${bound}`
    }?`,
    answer: String(answer),
    workingSteps: [`The lowest common multiple of ${a} and ${b} is ${lcm}`, `The ${direction === "smallest-above" ? "smallest" : "largest"} multiple of ${lcm} ${direction === "smallest-above" ? `above ${bound}` : `below ${bound}`} is ${answer}`],
    misconception: "Finding a multiple of only one of the two numbers, or finding the lowest common multiple itself without then checking it against the stated bound.",
  };
}
items.push(mr05ConstrainedMultiple({ id: "mr05-mult-01", a: 4, b: 9, bound: 30, direction: "smallest-above" }));
items.push(mr05ConstrainedMultiple({ id: "mr05-mult-02", a: 6, b: 8, bound: 40, direction: "smallest-above" }));
items.push(mr05ConstrainedMultiple({ id: "mr05-mult-03", a: 3, b: 5, bound: 50, direction: "largest-below" }));

// ============================================================
// mr02-far-ratio-context
// ============================================================
function mr02FarRatioContext({ id, multiplier, total, actionAmount, question, subjectLabel }) {
  const partB = total / (1 + multiplier);
  if (!Number.isInteger(partB)) throw new Error(`${id}: partB not integer`);
  const answer = partB - actionAmount;
  if (answer < 0) throw new Error(`${id}: negative result`);
  return {
    id,
    family: "mr02-far-ratio-context",
    structure: "CONTEXTUAL PROBLEM SOLVING",
    transferClass: "FAR_TRANSFER",
    primaryCompetency: "MR-02",
    supportingCompetencies: ["MR-01"],
    question,
    answer: String(answer),
    workingSteps: [
      `${subjectLabel}'s share plus ${multiplier} times ${subjectLabel}'s share equals ${total}`,
      `${subjectLabel}'s share is ${total} ÷ ${1 + multiplier} = ${partB}`,
      `${partB} - ${actionAmount} = ${answer}`,
    ],
    misconception: `Splitting the total evenly instead of using the stated ${multiplier}:1 relationship.`,
  };
}
items.push(
  mr02FarRatioContext({
    id: "mr02-far-01",
    multiplier: 2,
    total: 36,
    actionAmount: 4,
    subjectLabel: "Tom",
    question: "Sam has twice as much money as Tom. Between them they have £36. If Tom then spends £4, how much does Tom have left?",
  })
);
items.push(
  mr02FarRatioContext({
    id: "mr02-far-02",
    multiplier: 3,
    total: 48,
    actionAmount: 5,
    subjectLabel: "Ben",
    question: "Amy has three times as many stickers as Ben. Between them they have 48 stickers. If Ben then gives away 5 stickers, how many does Ben have left?",
  })
);
items.push(
  mr02FarRatioContext({
    id: "mr02-far-03",
    multiplier: 4,
    total: 60,
    actionAmount: 3,
    subjectLabel: "the shorter piece",
    question: "A rope is cut into two pieces. The longer piece is four times the length of the shorter piece. Together they measure 60cm. If 3cm is then cut from the shorter piece, how long is it now?",
  })
);

// ============================================================
// mr03-mixed-perimeter
// ============================================================
function mr03MixedPerimeter({ id, context, area, side }) {
  const otherSide = area / side;
  if (!Number.isInteger(otherSide)) throw new Error(`${id}: otherSide not integer`);
  const perimeter = 2 * (side + otherSide);
  return {
    id,
    family: "mr03-mixed-perimeter",
    structure: "MULTI-STEP APPLICATION",
    transferClass: "MIXED_TRANSFER",
    primaryCompetency: "MR-03",
    supportingCompetencies: ["MR-01"],
    question: `A rectangular ${context} has an area of ${area} m² and one side is ${side}m. What is the perimeter?`,
    answer: `${perimeter}m`,
    workingSteps: [`The other side is ${area} ÷ ${side} = ${otherSide}m`, `Perimeter = 2 × (${side} + ${otherSide}) = ${perimeter}m`],
    misconception: "Using the area value directly as part of the perimeter calculation, or forgetting to double the sum of both sides.",
  };
}
items.push(mr03MixedPerimeter({ id: "mr03-mix-01", context: "garden", area: 48, side: 6 }));
items.push(mr03MixedPerimeter({ id: "mr03-mix-02", context: "field", area: 72, side: 9 }));
items.push(mr03MixedPerimeter({ id: "mr03-mix-03", context: "lawn", area: 45, side: 15 }));

// ============================================================
// mr04-far-recipe
// ============================================================
function mr04FarRecipe({ id, ingredient, servesA, amountA, servesB }) {
  const perServing = amountA / servesA;
  const amountB = perServing * servesB;
  if (!Number.isInteger(amountB)) throw new Error(`${id}: amountB not integer`);
  return {
    id,
    family: "mr04-far-recipe",
    structure: "CONTEXTUAL PROBLEM SOLVING",
    transferClass: "FAR_TRANSFER",
    primaryCompetency: "MR-04",
    supportingCompetencies: ["MR-01"],
    question: `A recipe for ${servesA} people uses ${amountA}g of ${ingredient}. Using the same recipe, how much ${ingredient} is needed for ${servesB} people?`,
    answer: `${amountB}g`,
    workingSteps: [`${amountA}g ÷ ${servesA} people = ${perServing}g per person`, `${perServing}g × ${servesB} people = ${amountB}g`],
    misconception: `Adding or subtracting a fixed amount for the difference in people instead of scaling the whole recipe proportionally.`,
  };
}
items.push(mr04FarRecipe({ id: "mr04-far-04", ingredient: "flour", servesA: 8, amountA: 200, servesB: 12 }));
items.push(mr04FarRecipe({ id: "mr04-far-05", ingredient: "sugar", servesA: 6, amountA: 180, servesB: 9 }));
items.push(mr04FarRecipe({ id: "mr04-far-06", ingredient: "butter", servesA: 5, amountA: 100, servesB: 8 }));

// ============================================================
// Validation
// ============================================================

let failed = false;
const seenIds = new Set();
const seenQuestions = new Set();
const byFamily = new Map();

for (const item of items) {
  if (seenIds.has(item.id)) {
    console.error(`FAIL: duplicate id "${item.id}"`);
    failed = true;
  }
  seenIds.add(item.id);
  if (seenQuestions.has(item.question)) {
    console.error(`FAIL: duplicate question text for "${item.id}"`);
    failed = true;
  }
  seenQuestions.add(item.question);
  if (!item.answer) {
    console.error(`FAIL: "${item.id}" has no answer`);
    failed = true;
  }
  if (!byFamily.has(item.family)) byFamily.set(item.family, []);
  byFamily.get(item.family).push(item);
}

for (const [family, members] of byFamily) {
  const answers = new Set();
  for (const m of members) {
    if (answers.has(m.answer)) {
      console.error(`FAIL: family "${family}" has two variants sharing the answer "${m.answer}" ("${m.id}")`);
      failed = true;
    }
    answers.add(m.answer);
  }
}

// Global dash check
for (const item of items) {
  if (/[—–]/.test(JSON.stringify(item))) {
    console.error(`FAIL: em/en dash found in "${item.id}"`);
    failed = true;
  }
}

if (failed) {
  console.error(`\nWave 3 generation: FAIL`);
  process.exit(1);
}

console.log(`Wave 3 generation: PASS`);
console.log(`  ${items.length} items across ${byFamily.size} families`);
for (const [family, members] of byFamily) {
  console.log(`  - ${family} (${members[0].structure}, ${members[0].transferClass}): ${members.length} items`);
}

writeFileSync(
  "C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin/135f4c11-3911-48ce-b2ad-471be84f3f8b/scratchpad/wave3_items.json",
  JSON.stringify(items, null, 2)
);
console.log(`\nWritten to scratchpad/wave3_items.json for review.`);
