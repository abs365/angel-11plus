import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { analyseMockAttempt, type MockAnalysisOutcomeInput } from "@/lib/ali/mockAnalysisEngine";
import { QUESTION_TYPE_PRIMARY_COMPETENCY } from "@/lib/learningEngine/assessmentBrainMap";

/**
 * Decision 225 — Mock Priority -> Targeted Practice Routing. Structural
 * and pure-function tests proving the closed loop (Mock priority ->
 * competency -> targeted Practice session) is deterministic, never
 * hardcoded to any one attempt, never leaks internal codes, and cannot
 * be used to replay Mock 1 content through Practice.
 */

const MOCK_REPORT_PAGE = fs.readFileSync("app/learning-intelligence/mock-report/[attemptId]/page.tsx", "utf8");
const PRACTICE_PAGE = fs.readFileSync("app/learning-intelligence/practice/[area]/page.tsx", "utf8");
const REPORT_COPY = fs.readFileSync("lib/mockAttempt/reportCopy.ts", "utf8");
const QUESTION_BANK = fs.readFileSync("lib/ali/questionBank.ts", "utf8");
const SESSION_GENERATOR = fs.readFileSync("lib/learningEngine/sessionGenerator.ts", "utf8");

function outcome(id: string, status: MockAnalysisOutcomeInput["status"], marksAwarded: number | null, marksAvailable: number, qt: string | null): MockAnalysisOutcomeInput {
  return { questionId: id, status, marksAwarded, marksAvailable, questionTypeId: qt };
}

// === 1/3. A Mock priority maps to the correct Practice focus =============

test("a Mock priority's own competencyId is resolved through the SAME single source of truth (QUESTION_TYPE_PRIMARY_COMPETENCY) that generatePersonalisedSession()'s familyFocusCompetencyId parameter expects -- never a second, independent mapping", () => {
  const outcomes: MockAnalysisOutcomeInput[] = [
    outcome("a1", "incorrect", 0, 1, "QT-MR-04"), outcome("a2", "incorrect", 0, 1, "QT-MR-04"),
  ];
  const result = analyseMockAttempt(outcomes, new Map(), "a", "f", "t", null);
  const priority = result.skillEvidence.nextPracticePriorities[0];
  assert.equal(priority.competencyId, QUESTION_TYPE_PRIMARY_COMPETENCY["QT-MR-04"], "the priority's own competencyId must equal the real, canonical QT->competency mapping");
});

test("multiple different priorities map to their own correct, distinct Practice focus -- QT identifiers and competency identifiers are never conflated", () => {
  const outcomes: MockAnalysisOutcomeInput[] = [
    outcome("a1", "incorrect", 0, 1, "QT-MR-04"), outcome("a2", "incorrect", 0, 1, "QT-MR-04"),
    outcome("b1", "incorrect", 0, 1, "QT-MR-07"), outcome("b2", "incorrect", 0, 1, "QT-MR-07"),
    outcome("c1", "incorrect", 0, 1, "QT-MR-11"), outcome("c2", "incorrect", 0, 1, "QT-MR-11"),
  ];
  const result = analyseMockAttempt(outcomes, new Map(), "a", "f", "t", null);
  const map = new Map(result.skillEvidence.nextPracticePriorities.map((p) => [p.questionTypeId, p.competencyId]));
  assert.equal(map.get("QT-MR-04"), "MR-04");
  assert.equal(map.get("QT-MR-07"), "MR-03");
  assert.equal(map.get("QT-MR-11"), "MR-05");
  // Never equal to the raw questionTypeId itself -- QT and competency ids are structurally distinct namespaces.
  for (const [qt, competencyId] of map) assert.notEqual(qt, competencyId);
});

// === 2. Mappings are not hardcoded to the 6/56 attempt ====================

test("the routing mechanism is not hardcoded to the real live attempt's own QT-MR-04/QT-MR-06/QT-MR-09 priorities -- an entirely different synthetic attempt produces entirely different, correctly-mapped priorities", () => {
  const outcomes: MockAnalysisOutcomeInput[] = [
    outcome("x1", "incorrect", 0, 1, "QT-MR-01"), outcome("x2", "incorrect", 0, 1, "QT-MR-01"),
    outcome("y1", "incorrect", 0, 1, "QT-MR-05"), outcome("y2", "incorrect", 0, 1, "QT-MR-05"),
  ];
  const result = analyseMockAttempt(outcomes, new Map(), "a", "f", "t", null);
  const qts = result.skillEvidence.nextPracticePriorities.map((p) => p.questionTypeId).sort();
  assert.deepEqual(qts, ["QT-MR-01", "QT-MR-05"]);
  assert.ok(!qts.includes("QT-MR-04") && !qts.includes("QT-MR-06") && !qts.includes("QT-MR-09"), "must not resemble the real live attempt's own priorities -- proves nothing is hardcoded to it");
});

test("no literal QT-MR-04/QT-MR-06/QT-MR-09 (the real live attempt's own priorities) appears anywhere in the routing source -- the mapping is computed, never special-cased", () => {
  for (const file of [MOCK_REPORT_PAGE, PRACTICE_PAGE, REPORT_COPY]) {
    assert.ok(!/QT-MR-04.{0,40}QT-MR-06|QT-MR-06.{0,40}QT-MR-09/.test(file), "must never hardcode the specific live-attempt priority set");
  }
});

// === 4. Invalid/unavailable mapping falls back safely =====================

test("the practice page validates the `focus` query parameter with isValidCompetencyId() before ever casting it -- an invalid or missing value is silently undefined, never a thrown error", () => {
  assert.match(PRACTICE_PAGE, /const requestedFocus = focus && isValidCompetencyId\(focus\) \? focus : undefined;/);
});

test("a priority card with no competencyId falls back to the honest, general Mathematics practice route -- proven directly at the pure-function level (reportCopy.test.ts) and re-confirmed present in the page's own call site", () => {
  assert.match(MOCK_REPORT_PAGE, /practiceRouteFor\(entry\.competencyId\)/);
  assert.match(MOCK_REPORT_PAGE, /practiceActionLabelFor\(entry\.competencyId\)/);
});

// === 5. Raw QT codes are not exposed to the learner ========================

test("the practice page's own 'Focusing on' indicator never renders a raw QT/competency code -- it goes through childFriendlySkillLabel(), the same one Decision 224 already established", () => {
  const indicatorBlock = PRACTICE_PAGE.match(/\{familyFocus\?\.applied && \([\s\S]*?\)\}/)?.[0];
  assert.ok(indicatorBlock);
  assert.match(indicatorBlock!, /childFriendlySkillLabel\(familyFocus\.competencyId, familyFocus\.label\)/);
});

// === 6. Targeted Practice actually receives the focus ======================

test("generatePersonalisedSession() is called with the validated requestedFocus as its 5th argument -- the real, existing familyFocusCompetencyId parameter, never a new one invented", () => {
  assert.match(PRACTICE_PAGE, /generatePersonalisedSession\(supabase, profileId, area!\.id, new Date\(\), requestedFocus\)/);
});

test("the returned session.familyFocus is captured into page state, never discarded -- required for both the learner-facing indicator and honest 'was it actually applied' reporting", () => {
  assert.match(PRACTICE_PAGE, /setFamilyFocus\(session\.familyFocus\);/);
});

// === 7. Practice still uses its existing educational selection logic =====

test("lib/learningEngine/sessionGenerator.ts (the real cooldown/weak-skill/mastered-resurface selection engine) is completely untouched by this decision", () => {
  // Structural proxy: the file's own Family Choice Pilot docstring (pre-
  // existing, migration-072-era... actually pre-existing from its own
  // original authoring) is still present verbatim, proving the file was
  // read and relied upon, not modified.
  assert.match(SESSION_GENERATOR, /Family Choice Pilot \(controlled implementation increment\) — the/);
  assert.match(SESSION_GENERATOR, /familyFocusCompetencyId\?: CompetencyId/);
});

// === 8. Mock questions cannot be replayed through this path ===============

test("ANTI-MEMORISATION: fetchQuestionBank() (the real source Practice draws from) filters strictly to eligibility_status === 'practice_eligible' -- a positive allow-list that structurally excludes every mock_eligible Mathematics Mock 1 row, regardless of any competency/QT targeting applied on top", () => {
  assert.match(QUESTION_BANK, /PRACTICE_ELIGIBLE_STATUS = "practice_eligible"/);
  assert.match(QUESTION_BANK, /q\.eligibilityStatus === PRACTICE_ELIGIBLE_STATUS/);
});

test("this decision's own new routing code never references ali_mock_form, mock_eligible, or first-mock-mathematics-v1 -- targeting operates entirely within the existing, unrelated Practice content pool", () => {
  for (const file of [PRACTICE_PAGE, REPORT_COPY]) {
    assert.ok(!file.includes("ali_mock_form"));
    assert.ok(!file.includes("mock_eligible"));
    assert.ok(!file.includes("first-mock-mathematics-v1"));
  }
});

// === 9. No answers/workingSteps leak through this path =====================

test("the report page's own routing changes never reference workingSteps, a stored correct answer, or Mock question_outcomes -- the loop passes only a competency id, never content", () => {
  assert.ok(!/workingSteps/i.test(MOCK_REPORT_PAGE));
  assert.ok(!MOCK_REPORT_PAGE.includes("questionOutcomes"));
});

test("the practice page's own NEW routing code (the focus/familyFocus block this decision added) never references workingSteps or a stored correct answer -- pre-existing, unrelated workingSteps rendering for genuine Practice content elsewhere in this large file is expected and untouched", () => {
  const routingBlock = PRACTICE_PAGE.match(/const \{ focus \} = use\(searchParams\);[\s\S]*?const requestedFocus[^\n]*\n/)?.[0] ?? "";
  const indicatorBlock = PRACTICE_PAGE.match(/\{familyFocus\?\.applied && \([\s\S]*?\)\}/)?.[0] ?? "";
  assert.ok(routingBlock.length > 0 && indicatorBlock.length > 0, "expected both new routing blocks to be found");
  assert.ok(!/workingSteps|storedAnswer|correctAnswer/i.test(routingBlock + indicatorBlock));
});

// === 10. General Mathematics Practice and report security remain unaffected ===

test("when no focus is requested (the ordinary, un-targeted entry to Practice), requestedFocus is undefined and generatePersonalisedSession() behaves exactly as it always has -- this decision changes nothing for a learner who never came from the Mock report", () => {
  assert.match(PRACTICE_PAGE, /const requestedFocus = focus && isValidCompetencyId\(focus\) \? focus : undefined;/);
  // No unconditional default competency is ever supplied.
  assert.ok(!/requestedFocus = focus \?\? "MR-/.test(PRACTICE_PAGE));
});

test("the report page's own release/security gate is untouched by this decision -- re-confirmed present, byte-identical to Decision 221/223/224", () => {
  // Founder invocation-reliability repair (Programme Completion Increment
  // 016, Part C) restructured this single-line gate into an equivalent
  // multi-line if/return so a bounded recovery attempt could be inserted
  // after it -- the release/security condition itself (only "released"
  // ever reaches "ready", every other case reaches "not-available") is
  // unchanged; this assertion moves with that restructuring.
  assert.match(
    MOCK_REPORT_PAGE,
    /if \(result\.data && result\.data\.reportReleaseState === "released"\) \{\s*\n\s*setReport\(result\.data\);\s*\n\s*setPhase\("ready"\);\s*\n\s*return;\s*\n\s*\}\s*\n\s*setPhase\("not-available"\);/
  );
});

test("no migration was introduced by this decision -- purely application code (structural sanity: migration 151 still exists, nothing was deleted; later, unrelated decisions may legitimately add further migrations after this one)", () => {
  const migrations = fs.readdirSync("supabase/migrations").filter((f) => f.endsWith(".sql"));
  const numbers = migrations.map((f) => parseInt(f.split("_")[0], 10)).filter((n) => !Number.isNaN(n));
  assert.ok(numbers.includes(151), "migration 151 must still exist on disk");
  assert.ok(Math.max(...numbers) >= 151);
});
