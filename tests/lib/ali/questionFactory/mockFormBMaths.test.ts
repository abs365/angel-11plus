import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { FORM_B_MATHS_ITEMS, FORM_B_MATHS_TOP_UP_TARGETS, FORM_B_QT_COUNTS, FB_L_SHAPE, lShapeSvg, FB_STRAIGHT_LINE, FB_REFLECTION } from "@/lib/ali/questionFactory/mockFormBMathsItems";
import { FORM_B_REVALIDATION } from "@/lib/ali/questionFactory/mockFormBRevalidation";
import { checkMathsAnswer } from "@/lib/learningEngine/practiceContent";
import { isValidAngleFigureStimulus, isValidCoordinateGridStimulus, isValidImageStimulus, isValidTableStimulus } from "@/lib/mockAttempt/workspace";

const items = FORM_B_MATHS_ITEMS;

test("24 sealed items: 6 easy, 8 medium, 10 hard, per-skill counts as planned, unique mock-fb ids", () => {
  assert.equal(items.length, FORM_B_MATHS_TOP_UP_TARGETS.total);
  for (const d of ["easy", "medium", "hard"] as const) assert.equal(items.filter((i) => i.difficulty === d).length, FORM_B_MATHS_TOP_UP_TARGETS[d], d);
  const byQt: Record<string, number> = {};
  for (const i of items) byQt[i.skill] = (byQt[i.skill] ?? 0) + 1;
  assert.deepEqual(byQt, FORM_B_QT_COUNTS);
  assert.equal(new Set(items.map((i) => i.id)).size, 24);
  for (const i of items) {
    assert.match(i.id, /^mock-fb-/);
    assert.match(i.family, /^mock-fb-/);
  }
});

test("every answer is re-derived by an independently written oracle, accepted by the real marker, and each tempting mistake is rejected", () => {
  for (const i of items) {
    assert.equal(i.oracle(), i.answer, `${i.id} oracle`);
    assert.equal(checkMathsAnswer(i.answer, i.answer), true, i.id);
    assert.ok(i.wrongAnswers.length >= 3, i.id);
    for (const w of i.wrongAnswers) assert.equal(checkMathsAnswer(w, i.answer), false, `${i.id} must reject ${w}`);
    assert.ok(!i.wrongAnswers.includes(i.answer));
    assert.ok(i.workingSteps.length >= 1 && i.misconception.length > 12);
  }
});

test("combined with the 32 revalidated items, Form B reaches 56 items and the planned per-skill targets, including MR-08, MR-12, MR-14", () => {
  const combined: Record<string, number> = {};
  for (const e of FORM_B_REVALIDATION) combined[e.qt] = (combined[e.qt] ?? 0) + 1;
  for (const i of items) combined[i.skill] = (combined[i.skill] ?? 0) + 1;
  const plan: Record<string, number> = { "QT-MR-01": 4, "QT-MR-02": 5, "QT-MR-03": 3, "QT-MR-04": 6, "QT-MR-05": 4, "QT-MR-06": 6, "QT-MR-07": 4, "QT-MR-08": 3, "QT-MR-09": 4, "QT-MR-10": 4, "QT-MR-11": 4, "QT-MR-12": 3, "QT-MR-13": 4, "QT-MR-14": 2 };
  assert.deepEqual(combined, plan);
  assert.equal(Object.values(combined).reduce((s, v) => s + v, 0), 56);
});

test("no item is a clone of a Form A skeleton shape the Founder named (rotation, sum/difference, age narrative, pyramid)", () => {
  for (const i of items) assert.doesNotMatch(i.question, /rotated|number pyramid|born in|sum of two numbers/i, i.id);
});

test("visuals are exact: figures validate, the answer is not printed in them, files exist and carry no gradients", () => {
  assert.ok(isValidAngleFigureStimulus(FB_STRAIGHT_LINE));
  assert.ok(isValidCoordinateGridStimulus(FB_REFLECTION));
  for (const i of items.filter((x) => x.figure)) {
    const path = `public/mock-assets/formb-maths/${i.figure!.file}`;
    const svg = fs.readFileSync(path, "utf8");
    assert.ok(!svg.includes("url(#") && !/gradient/i.test(svg), i.id);
    assert.ok(isValidImageStimulus({ type: "image", imageAssetUrl: `/mock-assets/formb-maths/${i.figure!.file}`, altText: i.figure!.altText }), i.id);
    assert.ok(!new RegExp(`>\\s*${i.answer.replace(/[()]/g, "\\$&")}\\s*<`).test(svg), `${i.id}: answer must not be drawn`);
  }
  const l = lShapeSvg();
  assert.ok(!l.includes(`>${FB_L_SHAPE.a} m<`) && !l.includes(`>${FB_L_SHAPE.b} m<`), "the missing corner's sides are not labelled");
  assert.ok(l.includes(">12 m<") && l.includes(">9 m<") && l.includes(">7 m<") && l.includes(">6 m<"));
  assert.ok(![FB_L_SHAPE.W, FB_L_SHAPE.H, FB_L_SHAPE.W - FB_L_SHAPE.a, FB_L_SHAPE.H - FB_L_SHAPE.b].some((v) => v === FB_L_SHAPE.a || v === FB_L_SHAPE.b), "no labelled side equals a hidden side, so no label can be mistaken for the missing corner");
  const t = items.find((x) => x.table)!.table!;
  assert.ok(isValidTableStimulus(t));
  assert.equal(items.filter((x) => x.figure).length, 3);
});

test("grid item: the answer is the labelled point read from the figure, reflected in the drawn mirror line", () => {
  const it = items.find((x) => x.id === "mock-fb-mr08-reflect-01")!;
  const p = FB_REFLECTION.points[0];
  assert.equal(FB_REFLECTION.mirrorLine, "y=x");
  assert.equal(it.answer, `(${p.y}, ${p.x})`);
  assert.doesNotMatch(it.question, /\(\s*-?\d+\s*,\s*-?\d+\s*\)/, "no coordinate in the question text");
  assert.equal(checkMathsAnswer("(7,-4)", it.answer), true, "the Practice marker tolerates spacing; the Mock scorer does NOT (exact text), see ANGEL_CSSE_GATE_CLOSURE_VERIFICATION.md");
  assert.equal(checkMathsAnswer("7, -4", it.answer), false, "brackets are required, and the question says so");
  assert.match(it.question, /form \(x, y\)/);
});

test("revalidation record: 32 distinct existing items, every re-derived answer equals the stored one", () => {
  assert.equal(FORM_B_REVALIDATION.length, 32);
  assert.equal(new Set(FORM_B_REVALIDATION.map((e) => e.id)).size, 32);
  for (const e of FORM_B_REVALIDATION) assert.equal(e.derive(), e.storedAnswer, e.id);
});

test("revalidation found one real marking defect: the instructed bracketed form is marked wrong; the repair fixes it", () => {
  const defects = FORM_B_REVALIDATION.filter((e) => e.defect);
  assert.deepEqual(defects.map((e) => e.id), ["mock-mr05-numberpyramid-02"]);
  const d = defects[0];
  assert.equal(checkMathsAnswer("(9, 5)", d.storedAnswer), false, "as stored, a child who follows the instruction is marked wrong");
  assert.equal(checkMathsAnswer("(9, 5)", d.defect!.repairedAnswer!), true);
  assert.equal(checkMathsAnswer("(9,5)", d.defect!.repairedAnswer!), true);
});

test("migration 272 record: applied and do-not-rerun, one insert of 24 sealed candidates, one marking repair, nothing promoted", () => {
  const sql = fs.readFileSync("supabase/migrations/272_maths_form_b_completion_APPLIED_DO_NOT_RERUN.sql", "utf8");
  assert.match(sql, /APPLIED to production by the Founder[\s\S]*DO NOT RERUN/);
  assert.equal((sql.match(/insert into public\.ali_question_bank/g) ?? []).length, 1);
  assert.equal(new Set(sql.match(/mock-fb-[a-z0-9-]+/g)).size >= 24, true);
  for (const i of items) assert.ok(sql.includes(i.id), i.id);
  const code = sql.split(/\r?\n/).filter((l) => !l.trim().startsWith("--")).join(" ");
  assert.doesNotMatch(code, /practice_eligible|mock_eligible|independently_validated|activate/i);
  assert.match(code, /eligibility_status|'authentic_assessment_candidate'/);
  assert.equal((code.match(/update public\.ali_question_bank/g) ?? []).length, 1);
  assert.match(code, /mock-mr05-numberpyramid-02/);
});
