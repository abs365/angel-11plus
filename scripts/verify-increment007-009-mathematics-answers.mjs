// Angel Digital 11+ — independent, code-based (brute-force / formula)
// re-verification of every answer authored in migrations 170, 174, 176
// (Authoring Increments 007-009, Founder Completion and Readiness
// Programme, 2026-09-01). Pure static check against the LOCAL unapplied
// migration files -- no database, no network, no .env.local required.
// This is a THIRD independent check (beyond each row's own two
// hand-derived methods disclosed in the migration headers), run by code
// rather than by hand, specifically to catch any arithmetic slip the
// hand verification missed. Safe review-preparation work: reads local
// files only, applies nothing, activates nothing.
//
// Run: node scripts/verify-increment007-009-mathematics-answers.mjs

import { readFileSync } from "node:fs";

let pass = 0, fail = 0;
function check(id, label, ok, detail) {
  if (ok) { pass++; console.log(`PASS ${id}: ${label}`); }
  else { fail++; console.log(`FAIL ${id}: ${label} :: ${detail}`); }
}

function loadRows(path) {
  const text = readFileSync(path, "utf8");
  const blocks = [...text.matchAll(/\$json\$(\{.*?\})\$json\$/gs)].map((m) => JSON.parse(m[1]));
  return Object.fromEntries(blocks.map((b) => [b.id, b]));
}

const r170 = loadRows("supabase/migrations/170_mock_mathematics_structural_capacity_increment007_impossibletotal.sql");
const r174 = loadRows("supabase/migrations/174_mock_mathematics_structural_capacity_increment008_pyramid_combinatorics_agenarrative.sql");
const r176 = loadRows("supabase/migrations/176_mock_mathematics_structural_capacity_increment009_weightedmean.sql");

// ---- mock-mr11-impossibletotal (bags of 5 / bags of 8) ----
function reachable5and8(n) {
  for (let a = 0; a * 5 <= n; a++) {
    if ((n - a * 5) % 8 === 0) return true;
  }
  return false;
}
{
  const id = "mock-mr11-impossibletotal-01";
  let next = 10;
  while (reachable5and8(next)) next++;
  check(id, "next impossible total after 9", String(next) === r170[id].answer, `computed=${next} stored=${r170[id].answer}`);
}
{
  const id = "mock-mr11-impossibletotal-02";
  let smallestDuplicate = null;
  for (let n = 1; n < 200 && smallestDuplicate === null; n++) {
    let combos = 0;
    for (let a = 0; a * 5 <= n; a++) if ((n - a * 5) % 8 === 0) combos++;
    if (combos >= 2) smallestDuplicate = n;
  }
  check(id, "smallest total with 2 combinations", String(smallestDuplicate) === r170[id].answer, `computed=${smallestDuplicate} stored=${r170[id].answer}`);
}
{
  const id = "mock-mr11-impossibletotal-03";
  const [a, b] = r170[id].answer.split(",").map((s) => parseInt(s.trim(), 10));
  const total = a * 5 + b * 8;
  const isMixed = a > 0 && b > 0;
  const isNewCombo = !(a === 16 && b === 0) && !(a === 0 && b === 10);
  check(id, "answer sums to 80, uses both bag sizes, differs from the two given pure combos", total === 80 && isMixed && isNewCombo, `a=${a} b=${b} total=${total}`);
}

// ---- mock-mr05-numberpyramid ----
{
  const id = "mock-mr05-numberpyramid-01";
  // Reconstruct forward from the fresh bottom row used to author this row (5,6,2,A,3), solve for A via the pyramid rule, then confirm every GIVEN value in the question text matches.
  // Forward from the AUTHOR's own construction (A=7) to prove the given clues are internally consistent, then re-derive A independently from the clues alone (not assuming 7).
  const authored = [5, 6, 2, 7, 3];
  const row4 = [authored[0] + authored[1], authored[1] + authored[2], authored[2] + authored[3], authored[3] + authored[4]];
  const row3 = [row4[0] + row4[1], row4[1] + row4[2], row4[2] + row4[3]];
  const row2 = [row3[0] + row3[1], row3[1] + row3[2]];
  const row1 = row2[0] + row2[1];
  const givenMatch = row4[0] === 11 && row4[1] === 8 && row3[0] === 19 && row3[2] === 19 && row2[0] === 36 && row1 === 72;
  // Independent re-derivation from ONLY the clues stated in the question (not the authored bottom row), mirroring the learner's own solve path in code:
  const c1 = 11, c2 = 8; // given
  const d1 = c1 + c2; // = 19, must match given d1
  const d3 = 19; // given
  const e1 = 36; // given
  const d2 = e1 - d1;
  const c3 = d2 - c2;
  const c4 = d3 - c3;
  const A = c4 - 3; // b5 = 3, given
  check(id, "pyramid internally consistent AND independently re-derived A matches stored answer", givenMatch && d1 === 19 && String(A) === r174[id].answer, `d1=${d1} A_derived=${A} stored=${r174[id].answer}`);
}
{
  const id = "mock-mr05-numberpyramid-02";
  const [x, rows] = r174[id].answer.split(",").map((s) => parseInt(s.trim(), 10));
  const top = x * Math.pow(2, rows - 1);
  const nextRowsInvalid = 144 % Math.pow(2, rows) !== 0 || !Number.isInteger(144 / Math.pow(2, rows));
  check(id, "x * 2^(rows-1) = 144, and one more row would not give a whole number", top === 144 && nextRowsInvalid, `x=${x} rows=${rows} top=${top}`);
}
{
  const id = "mock-mr05-numberpyramid-03";
  // Logical/conceptual item -- brute-force check across small sample pyramids that B holds and A/C fail as stated.
  const mult = (bottom) => { let row = bottom; while (row.length > 1) { const next = []; for (let i = 0; i < row.length - 1; i++) next.push(row[i] * row[i + 1]); row = next; } return row[0]; };
  const bWithZero = mult([2, 0, 3, -4]) === 0; // B: zero anywhere -> top always 0
  const aCounterExample = mult([-2, 3, 5]) !== 0; // A: negative present, top NOT guaranteed 0
  const cCounterExample = mult([2, 2, 2]) !== 0; // C: all equal (non-zero), top NOT guaranteed 0
  check(id, "B holds (zero anywhere -> 0), A and C have counter-examples", bWithZero && aCounterExample && cCounterExample && r174[id].answer === "B", `bWithZero=${bWithZero} aCounter=${aCounterExample} cCounter=${cCounterExample}`);
}

// ---- mock-mr13-toppingcombos ----
function choose(n, k) { let r = 1; for (let i = 0; i < k; i++) r = (r * (n - i)) / (i + 1); return Math.round(r); }
{
  const id = "mock-mr13-toppingcombos-01";
  const computed = 2 * 5;
  check(id, "2 bases x 5 toppings", String(computed) === r174[id].answer, `computed=${computed} stored=${r174[id].answer}`);
}
{
  const id = "mock-mr13-toppingcombos-02";
  const computed = 2 * choose(5, 2);
  check(id, "2 bases x C(5,2)", String(computed) === r174[id].answer, `computed=${computed} stored=${r174[id].answer}`);
}

// ---- mock-mr06-agenarrative (Priya b.1985, Tom b.2009, gap 24) ----
{
  const id = "mock-mr06-agenarrative-01";
  const Y = parseInt(r174[id].answer, 10);
  const priya = Y - 1985, tom = Y - 2009;
  check(id, "Tom's age = half Priya's age", tom * 2 === priya, `year=${Y} priya=${priya} tom=${tom}`);
}
{
  const id = "mock-mr06-agenarrative-02";
  const Y = parseInt(r174[id].answer, 10);
  const priya = Y - 1985, tom = Y - 2009;
  check(id, "ages sum to 100", priya + tom === 100, `year=${Y} priya=${priya} tom=${tom}`);
}
{
  const id = "mock-mr06-agenarrative-03";
  const Y = parseInt(r174[id].answer, 10);
  const priya = Y - 1985, tom = Y - 2009;
  const isSquare = (n) => n >= 0 && Number.isInteger(Math.sqrt(n));
  // also confirm it is the EARLIEST such year by scanning forward from 2009
  let earliest = null;
  for (let y = 2009; y <= 2100 && earliest === null; y++) {
    const p = y - 1985, t = y - 2009;
    if (isSquare(p) && isSquare(t)) earliest = y;
  }
  check(id, "both ages square numbers AND is the earliest such year", isSquare(priya) && isSquare(tom) && earliest === Y, `year=${Y} priya=${priya} tom=${tom} earliestFound=${earliest}`);
}

// ---- mock-mr12-weightedmean ----
{
  const id = "mock-mr12-weightedmean-01";
  const computed = (4 * 6 + 6 * 11) / (4 + 6);
  check(id, "weighted mean of two groups", String(computed) === r176[id].answer, `computed=${computed} stored=${r176[id].answer}`);
}
{
  const id = "mock-mr12-weightedmean-02";
  const g = parseInt(r176[id].answer, 10);
  const combinedMean = (3 * 8 + 12 * g) / (3 + g);
  check(id, "reverse weighted mean solves back to combined mean 10", Math.abs(combinedMean - 10) < 1e-9, `g=${g} combinedMean=${combinedMean}`);
}

console.log(`\nTOTAL: ${pass} PASS, ${fail} FAIL, ${pass + fail} checks across 13 rows (migrations 170, 174, 176).`);
if (fail > 0) process.exitCode = 1;
