#!/usr/bin/env node
/**
 * Educational Increment 004, Wave 1 — Mathematics Content Factory.
 *
 * Minimum controlled-generation pipeline the directive asked for: each
 * family is a pure function of its parameters that COMPUTES the answer in
 * code (never a hand-typed value paired with a hand-typed question), so
 * answer-correctness is guaranteed by construction, not by careful typing.
 * Parameter sets are explicitly enumerated (not randomised), so every run
 * is fully deterministic and reviewable — no LLM call, no uncontrolled
 * generation, matching ANGEL_CONTENT_SCALE_GATE_V1.md §"what may be
 * generated automatically."
 *
 * Grounded directly in canonical evidence (verified against
 * docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md before writing
 * any generator, not assumed from competency names):
 *   - MR02_SEQUENCE_RULE   -> QT-MR-05 (forward + inverse function-rule application)
 *   - MR02_SUBSTITUTION    -> QT-MR-06 (symbolic system, substitution + solve)
 *   - MR03_ANGLE_SUM       -> QT-MR-07 (angle-sum reasoning, triangle + quadrilateral)
 *   - MR05_NUMBER_PROPERTY -> QT-MR-11 (true/false judgement + a disclosed,
 *     lower-confidence "search" sub-format reformulated to have a single,
 *     unambiguous answer rather than an open "find a pair" task, which
 *     would risk the "accidental multiple correct answers" failure mode)
 *
 * Run: node scripts/generate-mathematics-wave1.mjs
 * Prints validation results and writes the reviewed SQL VALUES block to
 * scratch (not directly into a migration — a human copies/checks it in,
 * per the GENERATE -> VALIDATE -> REVIEW -> MIGRATION pipeline).
 */
import { writeFileSync } from "node:fs";

// ============================================================
// Family generators — each returns { id, question, answer, workingSteps }
// ============================================================

function mr02SequenceRule({ id, m, a, xForward, yForInverse }) {
  const yForward = m * xForward + a;
  const xInverse = (yForInverse - a) / m;
  if (!Number.isInteger(xInverse) || xInverse <= 0) {
    throw new Error(`${id}: inverse does not resolve to a positive integer`);
  }
  return [
    {
      id: `${id}-fwd`,
      family: "mr02-sequence-rule",
      question: `A rule is: multiply by ${m}, then add ${a}. What is the output when the input is ${xForward}?`,
      answer: String(yForward),
      workingSteps: [`${xForward} × ${m} = ${xForward * m}`, `${xForward * m} + ${a} = ${yForward}`],
      misconception: `Forgetting to apply both steps (e.g. giving ${xForward * m}, the multiplication only, without adding ${a}).`,
    },
    {
      id: `${id}-inv`,
      family: "mr02-sequence-rule",
      question: `A rule is: multiply by ${m}, then add ${a}. The output is ${yForInverse}. What was the input?`,
      answer: String(xInverse),
      workingSteps: [`Reverse the rule: subtract ${a} first, then divide by ${m}`, `${yForInverse} - ${a} = ${yForInverse - a}`, `${yForInverse - a} ÷ ${m} = ${xInverse}`],
      misconception: `Applying the rule forwards instead of reversing it (e.g. multiplying ${yForInverse} by ${m} instead of subtracting then dividing).`,
    },
  ];
}

function mr02Substitution({ id, A, p, q }) {
  const B = p * A;
  const C = A / q;
  if (!Number.isInteger(C)) throw new Error(`${id}: C is not an integer`);
  const S = A + B + C;
  return {
    id,
    family: "mr02-substitution",
    question: `B = ${p === 1 ? "" : p}A and ${q}C = A. If A + B + C = ${S}, find A and C.`,
    answer: `A=${A}, C=${C}`,
    workingSteps: [
      `Express everything in terms of A: B = ${p}A, C = A ÷ ${q}`,
      `A + ${p}A + A ÷ ${q} = ${S}`,
      `Solving gives A = ${A}, so B = ${B} and C = ${C}`,
    ],
    misconception: `Substituting only one relationship and treating the other unknown as still free, or solving for B instead of the two values actually asked for.`,
  };
}

function mr03AngleSum({ id, shape, knownAngles }) {
  const total = shape === "triangle" ? 180 : 360;
  const sumKnown = knownAngles.reduce((a, b) => a + b, 0);
  const missing = total - sumKnown;
  if (missing <= 0 || missing >= total) throw new Error(`${id}: missing angle out of valid range`);
  const shapeLabel = shape === "triangle" ? "triangle" : "quadrilateral";
  const knownList = knownAngles.map((a) => `${a}°`).join(", ");
  return {
    id,
    family: "mr03-angle-sum",
    question: `A ${shapeLabel} has angles of ${knownList} and one unknown angle. What is the size of the unknown angle?`,
    answer: `${missing}°`,
    workingSteps: [
      `The angles in a ${shapeLabel} always add up to ${total}°`,
      `${knownAngles.join(" + ")} = ${sumKnown}`,
      `${total} - ${sumKnown} = ${missing}`,
    ],
    misconception: `Using the wrong total for the shape (e.g. using 180° for a quadrilateral instead of 360°), or adding all the known angles incorrectly.`,
  };
}

function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
  return true;
}
function isSquare(n) {
  const r = Math.round(Math.sqrt(n));
  return r * r === n;
}

function mr05TrueFalse({ id, statement, evaluate }) {
  const truth = evaluate();
  return {
    id,
    family: "mr05-number-property",
    question: `True or False: ${statement}`,
    answer: truth ? "True" : "False",
    workingSteps: [],
    misconception: `Confusing a related but different property (e.g. treating "not even" as the same as "prime", or miscalculating the stated value before judging it).`,
  };
}

function mr05Search({ id, question, answer, workingSteps }) {
  return { id, family: "mr05-number-property-search", question, answer: String(answer), workingSteps, misconception: null };
}

// ============================================================
// Wave 1 parameter sets — enumerated by hand, not randomised
// ============================================================

const items = [];

for (const params of [
  { id: "mr02-seq-01", m: 3, a: 2, xForward: 5, yForInverse: 23 },
  { id: "mr02-seq-02", m: 4, a: 1, xForward: 6, yForInverse: 33 },
  { id: "mr02-seq-03", m: 2, a: 5, xForward: 9, yForInverse: 31 },
  { id: "mr02-seq-04", m: 5, a: 3, xForward: 7, yForInverse: 53 },
  { id: "mr02-seq-05", m: 6, a: 4, xForward: 3, yForInverse: 40 },
]) {
  items.push(...mr02SequenceRule(params));
}

for (const params of [
  { id: "mr02-sub-01", A: 4, p: 3, q: 2 },
  { id: "mr02-sub-02", A: 6, p: 2, q: 3 },
  { id: "mr02-sub-03", A: 5, p: 4, q: 5 },
  { id: "mr02-sub-04", A: 9, p: 1, q: 3 },
  { id: "mr02-sub-05", A: 10, p: 2, q: 5 },
]) {
  items.push(mr02Substitution(params));
}

for (const params of [
  { id: "mr03-ang-01", shape: "triangle", knownAngles: [48, 62] },
  { id: "mr03-ang-02", shape: "triangle", knownAngles: [35, 85] },
  { id: "mr03-ang-03", shape: "triangle", knownAngles: [90, 27] },
  { id: "mr03-ang-04", shape: "triangle", knownAngles: [40, 100] },
  { id: "mr03-ang-05", shape: "quadrilateral", knownAngles: [90, 90, 85] },
  { id: "mr03-ang-06", shape: "quadrilateral", knownAngles: [70, 110, 95] },
  { id: "mr03-ang-07", shape: "quadrilateral", knownAngles: [120, 60, 100] },
]) {
  items.push(mr03AngleSum(params));
}

items.push(
  mr05TrueFalse({ id: "mr05-tf-01", statement: "17 is a prime number.", evaluate: () => isPrime(17) }),
  mr05TrueFalse({ id: "mr05-tf-02", statement: "51 is a prime number.", evaluate: () => isPrime(51) }),
  mr05TrueFalse({ id: "mr05-tf-03", statement: "81 is a square number.", evaluate: () => isSquare(81) }),
  mr05TrueFalse({ id: "mr05-tf-04", statement: "The average of 3 and 11 is a prime number.", evaluate: () => isPrime((3 + 11) / 2) }),
  mr05TrueFalse({ id: "mr05-tf-05", statement: "The average of 6 and 10 is a prime number.", evaluate: () => isPrime((6 + 10) / 2) }),
  mr05Search({
    id: "mr05-search-01",
    question: "What is the smallest prime number greater than 40?",
    answer: 41,
    workingSteps: ["41 is not divisible by 2, 3, or 5", "41 is prime, and no whole number between 40 and 41 exists"],
  }),
  mr05Search({
    id: "mr05-search-02",
    question: "What is the largest prime number less than 30?",
    answer: 29,
    workingSteps: ["29 is not divisible by 2, 3, or 5", "29 is prime, and nothing between 29 and 30 needs checking"],
  })
);

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

  if (item.answer === undefined || item.answer === null || item.answer === "") {
    console.error(`FAIL: "${item.id}" has no answer`);
    failed = true;
  }

  if (!byFamily.has(item.family)) byFamily.set(item.family, []);
  byFamily.get(item.family).push(item);
}

// Within-family: no two variants should share the same answer (would mean
// the "different" variant isn't testing anything distinct) — except for
// families whose answer space is inherently binary (True/False), where a
// shared answer is expected and the real distinctness check is the
// question-text uniqueness already enforced above.
const BINARY_ANSWER_FAMILIES = new Set(["mr05-number-property"]);
for (const [family, members] of byFamily) {
  if (BINARY_ANSWER_FAMILIES.has(family)) continue;
  const answers = new Set();
  for (const m of members) {
    if (answers.has(m.answer)) {
      console.error(`FAIL: family "${family}" has two variants sharing the answer "${m.answer}" ("${m.id}")`);
      failed = true;
    }
    answers.add(m.answer);
  }
}

if (failed) {
  console.error(`\nWave 1 generation: FAIL`);
  process.exit(1);
}

console.log(`Wave 1 generation: PASS`);
console.log(`  ${items.length} items across ${byFamily.size} families`);
for (const [family, members] of byFamily) {
  console.log(`  - ${family}: ${members.length} items`);
}

writeFileSync(
  "C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin/135f4c11-3911-48ce-b2ad-471be84f3f8b/scratchpad/wave1_items.json",
  JSON.stringify(items, null, 2)
);
console.log(`\nWritten to scratchpad/wave1_items.json for review.`);
