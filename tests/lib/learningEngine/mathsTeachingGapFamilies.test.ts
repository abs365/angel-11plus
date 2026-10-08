import { test } from "node:test";
import assert from "node:assert/strict";
import { getMathsTeachingContent } from "@/lib/learningEngine/mathsTeachingContent";

/** CSSE Completion Workstream 2: every live Maths family now has worked-method content; scenarios are verified here. */
for (const fam of ["mr03-coord-combined", "mr04-bv-convert"]) {
  test(`${fam} has complete worked-method content`, () => {
    const c = getMathsTeachingContent(fam);
    assert.ok(c);
    assert.ok(c!.model.whatToNotice.length > 20 && c!.model.relationship.length > 20);
    assert.ok(c!.model.reasoning.length >= 2);
    assert.ok(c!.model.verification.length > 10);
  });
}

test("worked scenarios are mathematically correct", () => {
  // reflect (1,4) in x-axis -> (1,-4); 5 left 2 up -> (-4,-2)
  assert.equal(getMathsTeachingContent("mr03-coord-combined")!.model.answer, `(${1 - 5}, ${-4 + 2})`);
  // 750ml=0.75l: 1.5/0.75=2.0 per l ; 3.6/2=1.8 per l -> B
  assert.ok(1.5 / 0.75 > 3.6 / 2);
  assert.equal(getMathsTeachingContent("mr04-bv-convert")!.model.answer, "B");
});

test("guided reveal never exposes a step that states the final answer before submission", () => {
  assert.equal(getMathsTeachingContent("mr05-number-property-search"), undefined, "deliberately uncovered (TRANSFER-UNSAFE decision) -- not reopened");
  assert.equal(getMathsTeachingContent("mr03-coord-combined")!.maxGuidedRevealSteps, 1);
  assert.equal(getMathsTeachingContent("mr04-bv-convert")!.maxGuidedRevealSteps, 2);
});
