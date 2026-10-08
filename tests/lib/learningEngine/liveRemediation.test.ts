import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  consecutiveFamilyFailures,
  deriveFamilyCapabilities,
  planInSessionSupport,
  reorderRemainingAfterFailure,
  type SessionOutcome,
} from "@/lib/learningEngine/liveRemediation";
import type { BankQuestion } from "@/types/ali/questionBank";

const o = (familyId: string, correct: boolean, supportTier: "independent" | "supported" = "independent"): SessionOutcome => ({
  questionId: `${familyId}-${Math.random()}`, familyId, competencyId: "MR-01", correct, supportTier,
});

test("consecutive failures count only the trailing run in THIS family; other families neither extend nor break it", () => {
  assert.equal(consecutiveFamilyFailures([o("a", false), o("b", true), o("a", false)], "a"), 2);
  assert.equal(consecutiveFamilyFailures([o("a", false), o("a", true), o("a", false)], "a"), 1);
  assert.equal(consecutiveFamilyFailures([o("a", true)], "a"), 0);
  assert.equal(consecutiveFamilyFailures([o("a", false)], undefined), 0);
  assert.equal(consecutiveFamilyFailures([], "a"), 0);
});

test("support ladder: no failure -> none; first -> strategic hint; second -> worked reasoning; third -> re-teach only if a lesson exists", () => {
  const base = { hasWorkedContent: true, hasFullLesson: true };
  assert.equal(planInSessionSupport({ ...base, consecutiveFailures: 0 }).step, "none");
  assert.equal(planInSessionSupport({ ...base, consecutiveFailures: 1 }).step, "strategic_hint");
  assert.equal(planInSessionSupport({ ...base, consecutiveFailures: 2 }).step, "worked_reasoning");
  assert.equal(planInSessionSupport({ ...base, consecutiveFailures: 3 }).step, "explicit_reteach");
  assert.equal(planInSessionSupport({ hasWorkedContent: true, hasFullLesson: false, consecutiveFailures: 3 }).step, "worked_reasoning");
});

test("with no worked content the ladder never invents one", () => {
  assert.equal(planInSessionSupport({ hasWorkedContent: false, hasFullLesson: false, consecutiveFailures: 2 }).step, "strategic_hint");
  assert.equal(planInSessionSupport({ hasWorkedContent: false, hasFullLesson: false, consecutiveFailures: 5 }).step, "strategic_hint");
});

test("the plan records the existing remediation policy's own action for the same evidence (policy reused, not replaced)", () => {
  assert.equal(planInSessionSupport({ hasWorkedContent: true, hasFullLesson: true, consecutiveFailures: 2 }).policyAction, "re_teaching");
  assert.equal(planInSessionSupport({ hasWorkedContent: true, hasFullLesson: false, consecutiveFailures: 2 }).policyAction, "worked_example");
  assert.equal(
    planInSessionSupport({ hasWorkedContent: true, hasFullLesson: false, consecutiveFailures: 1, capabilities: { hasMisconceptionTargeted: true, hasAlternativeRepresentation: false, hasMultipleBlueprints: false } }).policyAction,
    "misconception_targeted_blueprint"
  );
});

test("reorder: a failed family is not re-served next when another family remains; same competency preferred; nothing added or dropped", () => {
  const q = (id: string, familyId: string, competencyId: string) => ({ id, familyId, competencyId });
  const rest = [q("1", "a", "MR-01"), q("2", "a", "MR-01"), q("3", "z", "MR-04"), q("4", "b", "MR-01")];
  const out = reorderRemainingAfterFailure(rest, { familyId: "a", competencyId: "MR-01" });
  assert.deepEqual(out.map((x) => x.id), ["4", "1", "2", "3"]);
  assert.equal(out.length, rest.length);
});

test("reorder is a no-op when the next item is already a different family, or nothing else exists", () => {
  const q = (id: string, familyId: string) => ({ id, familyId });
  assert.deepEqual(reorderRemainingAfterFailure([q("1", "b"), q("2", "a")], { familyId: "a" }).map((x) => x.id), ["1", "2"]);
  assert.deepEqual(reorderRemainingAfterFailure([q("1", "a"), q("2", "a")], { familyId: "a" }).map((x) => x.id), ["1", "2"]);
  assert.deepEqual(reorderRemainingAfterFailure([q("1", "a")], { familyId: "a" }).map((x) => x.id), ["1"]);
});

test("family capabilities come from the real bank: blueprint count, context/representation count, authored misconception text", () => {
  const bq = (id: string, familyId: string, prompt: Record<string, unknown>, addressesMisconception?: string) =>
    ({ id, familyId, prompt, addressesMisconception } as unknown as BankQuestion);
  const caps = deriveFamilyCapabilities([
    bq("1", "f1", { blueprintId: "x", contextTag: "money" }, "uses wrong operation"),
    bq("2", "f1", { blueprintId: "y", contextTag: "time" }),
    bq("3", "f2", { blueprintId: "x", contextTag: "money" }),
    bq("4", "f2", { blueprintId: "x", contextTag: "money" }),
  ]);
  assert.deepEqual(caps.get("f1"), { hasMultipleBlueprints: true, hasAlternativeRepresentation: true, hasMisconceptionTargeted: true });
  assert.deepEqual(caps.get("f2"), { hasMultipleBlueprints: false, hasAlternativeRepresentation: false, hasMisconceptionTargeted: false });
});

test("Mock and Writing are untouched: no Mock surface imports the live remediation module", () => {
  const files = ["app/learning-intelligence/mock-exam/page.tsx", "app/mock-test", "app/mocks"];
  const walk = (p: string): string[] => (fs.statSync(p).isDirectory() ? fs.readdirSync(p).flatMap((f) => walk(`${p}/${f}`)) : [p]);
  for (const f of files.filter((x) => fs.existsSync(x)).flatMap(walk).filter((x) => /\.(ts|tsx)$/.test(x))) {
    assert.doesNotMatch(fs.readFileSync(f, "utf8"), /liveRemediation|InSessionSupport/, f);
  }
  const page = fs.readFileSync("app/learning-intelligence/practice/[area]/page.tsx", "utf8");
  assert.match(page, /!isCorrect && area!\.id !== "continuous-writing"/);
  assert.match(page, /lastCorrect === false && area!\.id !== "continuous-writing"/);
});

test("the support panel shows only after submission of a wrong answer and demonstrates a separate scenario, not the live answer", () => {
  const page = fs.readFileSync("app/learning-intelligence/practice/[area]/page.tsx", "utf8");
  assert.match(page, /submitted && lastCorrect === false && supportPlan && \(/);
  const comp = fs.readFileSync("components/learningEngine/InSessionSupport.tsx", "utf8");
  assert.match(comp, /getWorkedExample\(familyId\)/);
  assert.match(comp, /getMathsTeachingContent\(familyId\)/);
  assert.doesNotMatch(comp, /prompt\.answer|\.acceptedAnswers|workingSteps/);
});
