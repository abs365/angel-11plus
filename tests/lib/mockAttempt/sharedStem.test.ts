import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveGroupSharedStem } from "@/lib/mockAttempt/workspace";

/**
 * Shared-Scenario Presentation Correction (Decision 180) — pure-function
 * tests for resolveGroupSharedStem(), the single fail-safe gate every
 * render site (admin review, learner Mock) must use before rendering a
 * grouped question's shared stem once. Fixtures mirror the real,
 * authored mock-mr06-linkedvalues family (migration 119/121) and the
 * real, pre-existing costumeschedule/fairprep families (which must
 * NEVER get a shared-stem-collapsed rendering, since they were never
 * authored with a genuine identical-prefix `sharedStem` contract).
 */

const STEM = "A collector has three bags of marbles: red, blue and green. The blue bag has 6 more marbles than the red bag. The green bag has 3 times as many marbles as the blue bag. Altogether, the three bags contain 64 marbles.";

const REAL_LINKEDVALUES = [
  { question: `${STEM} How many marbles are in the red bag?`, sharedStem: STEM },
  { question: `${STEM} How many marbles are in the green bag?`, sharedStem: STEM },
  { question: `${STEM} How many more marbles are in the green bag than in the red and blue bags combined?`, sharedStem: STEM },
];

test("resolves the real mock-mr06-linkedvalues shape: stem once, three non-empty distinguishing tails, in order", () => {
  const result = resolveGroupSharedStem(REAL_LINKEDVALUES);
  assert.ok(result);
  assert.equal(result!.stem, STEM);
  assert.deepEqual(result!.tails, [
    "How many marbles are in the red bag?",
    "How many marbles are in the green bag?",
    "How many more marbles are in the green bag than in the red and blue bags combined?",
  ]);
});

test("a single standalone item (no group) never resolves a stem", () => {
  assert.equal(resolveGroupSharedStem([{ question: "just one", sharedStem: null }]), null);
});

test("fails safe when sharedStem is null/undefined on any item -- the pre-existing costumeschedule/fairprep/perimeterarea/runningclub shape, which never sets this field", () => {
  const noStem = [
    { question: "A tailor starts making a costume at 14:20...", sharedStem: null },
    { question: "Each costume uses 2.5 metres of fabric...", sharedStem: undefined },
  ];
  assert.equal(resolveGroupSharedStem(noStem), null);
});

test("fails safe when sharedStem is present but empty string", () => {
  assert.equal(resolveGroupSharedStem([
    { question: "a", sharedStem: "" },
    { question: "b", sharedStem: "" },
  ]), null);
});

test("fails safe when items disagree on sharedStem (a mismatch is refused, never averaged or first-wins)", () => {
  assert.equal(resolveGroupSharedStem([
    { question: `${STEM} tail one`, sharedStem: STEM },
    { question: `${STEM} tail two`, sharedStem: "a different stem" },
  ]), null);
});

test("fails safe when a declared stem is NOT actually a prefix of one item's own question text (drift/mismatch defence in depth)", () => {
  assert.equal(resolveGroupSharedStem([
    { question: `${STEM} tail one`, sharedStem: STEM },
    { question: "a completely different sentence entirely", sharedStem: STEM },
  ]), null);
});

test("fails safe when removing the stem would leave an empty tail on any item", () => {
  assert.equal(resolveGroupSharedStem([
    { question: STEM, sharedStem: STEM },
    { question: `${STEM} a real tail`, sharedStem: STEM },
  ]), null);
});

test("ordinary grouped families with genuinely DIFFERENT non-shared-stem text (no sharedStem field at all) are never affected -- fairprep/runningclub/perimeterarea/costumeschedule real shapes all resolve to null", () => {
  const fairprep = [
    { question: "A group of students is setting up a robotics display for the school science fair. Assembling the display takes 1 hour 55 minutes, and testing the robots afterwards takes a further 40 minutes. If the students start assembling at 13:15, what time do they finish testing? Give your answer in 24-hour time.", sharedStem: null },
    { question: "A group of students is setting up a robotics display for the school science fair. Assembling the display takes 1 hour 55 minutes, and testing the robots afterwards takes a further 40 minutes. The science fair opens to visitors at 16:30, and the students want to finish at least 20 minutes before it opens. What is the latest time they can start assembling? Give your answer in 24-hour time.", sharedStem: null },
  ];
  assert.equal(resolveGroupSharedStem(fairprep), null);

  const costumeschedule = [
    { question: "A tailor starts making a costume at 14:20. Sewing takes 1 hour 50 minutes, and finishing touches take a further 25 minutes. What time is the costume finished? Give your answer in 24-hour time.", sharedStem: null },
    { question: "Each costume uses 2.5 metres of fabric costing £4.80 per metre. What is the cost of fabric for one costume?", sharedStem: null },
  ];
  assert.equal(resolveGroupSharedStem(costumeschedule), null);
});
