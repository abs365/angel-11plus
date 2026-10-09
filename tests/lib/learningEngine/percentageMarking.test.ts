import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { checkMathsAnswer } from "../../../lib/learningEngine/practiceContent";

/**
 * Narrow percentage normalisation (mth-010: "What percentage of 340 is 85?", stored "25%"). A stored answer that is exactly an UNSIGNED
 * number plus "%" accepts the equivalent bare number. Signed answers (the sign IS the answer), answers with words (direction matters),
 * units and every other format keep their previous behaviour.
 */
test("bare 25 is accepted for a stored 25%, as are 25%, 25 % and 25.0", () => {
  for (const a of ["25", "25%", "25 %", " 25 ", "25.0", "25.00%"]) assert.equal(checkMathsAnswer(a, "25%"), true, a);
});

test("25% vs 25%: unchanged", () => assert.equal(checkMathsAnswer("25%", "25%"), true));

test("a wrong percentage is rejected, with or without the % sign", () => {
  for (const a of ["26", "24%", "2.5", "250", "0", "-25", "-25%"]) assert.equal(checkMathsAnswer(a, "25%"), false, a);
});

test("decimal percentages compare numerically", () => {
  assert.equal(checkMathsAnswer("12.5", "12.5%"), true);
  assert.equal(checkMathsAnswer("12.5%", "12.5%"), true);
  assert.equal(checkMathsAnswer("12.6", "12.5%"), false);
});

test("signed compound-percentage answers keep their meaning: the sign is required, a bare number is NOT accepted", () => {
  assert.equal(checkMathsAnswer("+18.37%", "+18.37%"), true);
  assert.equal(checkMathsAnswer("18.37", "+18.37%"), false);
  assert.equal(checkMathsAnswer("18.37%", "+18.37%"), false);
  assert.equal(checkMathsAnswer("-30.97%", "-30.97%"), true);
  assert.equal(checkMathsAnswer("30.97", "-30.97%"), false);
  assert.equal(checkMathsAnswer("+30.97%", "-30.97%"), false);
  assert.equal(checkMathsAnswer("-37.46", "-37.46%"), false, "the % is kept for a signed stored answer (unchanged behaviour)");
});

test("answers that carry words keep the exact-text path (the direction matters)", () => {
  assert.equal(checkMathsAnswer("45% increase", "45% increase"), true);
  assert.equal(checkMathsAnswer("45", "45% increase"), false);
  assert.equal(checkMathsAnswer("45% decrease", "45% increase"), false);
});

test("existing units and symbols are unaffected: m, kg, £, degrees, fractions, coordinates", () => {
  assert.equal(checkMathsAnswer("8", "8m"), true);
  assert.equal(checkMathsAnswer("8m", "8m"), true);
  assert.equal(checkMathsAnswer("8cm", "8m"), false);
  assert.equal(checkMathsAnswer("2.55", "£2.55"), true);
  assert.equal(checkMathsAnswer("95", "95°"), true);
  assert.equal(checkMathsAnswer("20/7", "2 6/7"), true);
  assert.equal(checkMathsAnswer("(-3,4)", "(-3, 4)"), true);
  assert.equal(checkMathsAnswer("25", "25"), true);
  assert.equal(checkMathsAnswer("26", "25"), false);
});

test("malformed responses are rejected", () => {
  for (const a of ["", "   ", "%", "25%%", "%25", "25 percent", "abc", "2 5", "25%;", "25,5%", "twenty five", "25%x"]) assert.equal(checkMathsAnswer(a, "25%"), false, JSON.stringify(a));
});

test("semicolon alternates: the rule reads only the first alternative, later ones keep their pre-existing (whole-string / first-alternative) behaviour", () => {
  assert.equal(checkMathsAnswer("25", "25%;one quarter"), true);
  assert.equal(checkMathsAnswer("25%", "25%;one quarter"), true);
  assert.equal(checkMathsAnswer("one quarter", "25%;one quarter"), false, "unchanged from before this increment");
  assert.equal(checkMathsAnswer("25%;one quarter", "25%;one quarter"), true);
});

test("Mock is untouched: the change is in practiceContent.ts only; the Mock Maths scorer is the SQL function and no Mock file imports it", () => {
  const mockFiles = ["app/learning-intelligence/mock", "lib/mockAttempt"].flatMap(walk);
  for (const f of mockFiles) assert.doesNotMatch(fs.readFileSync(f, "utf8"), /checkMathsAnswer/, f);
});
function walk(d: string): string[] {
  if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(`${d}/${e.name}`) : /\.(ts|tsx)$/.test(e.name) ? [`${d}/${e.name}`] : []));
}
