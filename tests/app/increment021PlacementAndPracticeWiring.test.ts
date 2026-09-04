import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Programme Increment 021, Parts 3/6/9/10 — structural proofs against the
 * real page source, matching this codebase's established convention
 * (tests/lib/mockAttempt/mockPriorityTargetedPracticeRouting.test.ts's own
 * precedent): source-level regex assertions, since this repo has no
 * @testing-library/React-rendering infrastructure (confirmed precedent,
 * tests/components/mockAttempt/DataTableStimulus.test.ts's own header).
 */

const PLACEMENT_PAGE = fs.readFileSync("app/learning-intelligence/placement/page.tsx", "utf8");
const PRACTICE_PAGE = fs.readFileSync("app/learning-intelligence/practice/[area]/page.tsx", "utf8");

// ─── Placement page: content source / firewall ─────────────────────────────

test("placement draws content ONLY through fetchQuestionBank() -- the real, existing Practice-eligible gate -- never a Mock-specific fetch/table/form", () => {
  assert.match(PLACEMENT_PAGE, /fetchQuestionBank/);
  assert.ok(!/ali_mock_form|mock_get_question|MockAttempt|getResumableMockAttempt/i.test(PLACEMENT_PAGE), "placement must never reference any Mock-specific fetch mechanism or table");
});

test("placement reuses the existing placementDiagnostic.ts foundation (buildPlacementSession) rather than inventing a second sampling mechanism", () => {
  assert.match(PLACEMENT_PAGE, /buildPlacementSession/);
  assert.match(PLACEMENT_PAGE, /from "@\/lib\/learningEngine\/placementDiagnostic"/);
});

test("placement records real evidence through the existing recordPresentation/recordOutcome path -- no new persistence, no new table", () => {
  assert.match(PLACEMENT_PAGE, /recordPresentation/);
  assert.match(PLACEMENT_PAGE, /recordOutcome/);
});

test("placement never claims comprehensive/definitive assessment -- 'starting point' framing only, no numeric ability score shown to the learner", () => {
  assert.match(PLACEMENT_PAGE, /starting point/i);
  assert.ok(!/\bscore\b|\bability rating\b|\bpercentile\b/i.test(PLACEMENT_PAGE), "placement must never present a numeric ability classification");
});

test("placement never exposes internal architecture terminology to the learner (child-readable UX only)", () => {
  const learnerFacingSection = PLACEMENT_PAGE.slice(PLACEMENT_PAGE.indexOf("return ("));
  assert.ok(!/Preparation Horizon|inventory class|measurement inventory|selection weighting|placementRequired/i.test(learnerFacingSection), "internal terminology must never leak into the rendered learner-facing JSX");
});

test("placement completion routes forward (never loops back into another placement round automatically)", () => {
  assert.match(PLACEMENT_PAGE, /router\.replace\(`\/learning-intelligence\/practice\//);
  assert.ok(!/router\.(replace|push)\(.*\/learning-intelligence\/placement/.test(PLACEMENT_PAGE.slice(PLACEMENT_PAGE.indexOf("async function finish"))), "the completion routine must never redirect back into placement itself");
});

// ─── Practice page: Preparation Horizon wiring ─────────────────────────────

test("the practice page computes the real, canonical decision contract (computePreparationDecision) -- never a second decision engine", () => {
  assert.match(PRACTICE_PAGE, /computePreparationDecision/);
  assert.match(PRACTICE_PAGE, /from "@\/lib\/learningEngine\/preparationDecision"/);
});

test("placementRequired routes to the real placement page, distinct from ordinary session loading", () => {
  assert.match(PRACTICE_PAGE, /decision\.placementRequired/);
  assert.match(PRACTICE_PAGE, /router\.replace\(`\/learning-intelligence\/placement/);
});

test("the decision-contract read fails OPEN -- a caught error must never block the ordinary, unbiased Practice session from loading", () => {
  const wiringBlock = PRACTICE_PAGE.slice(PRACTICE_PAGE.indexOf("Programme Increment 021"), PRACTICE_PAGE.indexOf("const session = await withTimeout"));
  assert.match(wiringBlock, /catch\s*\{/, "the preparation-context computation must be wrapped in its own try/catch, separate from the session load itself");
});

test("recommendedDifficultyLean/recommendedActivityType are threaded into generatePersonalisedSession() as a real preparationContext argument, not merely computed and discarded", () => {
  assert.match(PRACTICE_PAGE, /recommendedDifficultyLean:\s*decision\.recommendedDifficultyLean/);
  assert.match(PRACTICE_PAGE, /recommendedActivityType:\s*decision\.recommendedActivityType/);
  assert.match(PRACTICE_PAGE, /generatePersonalisedSession\(supabase, profileId, area!\.id, new Date\(\), requestedFocus, preparationContext\)/);
});

test("the practice page's own wiring never references SEALED/mock_eligible content directly -- it only ever reads the decision contract's own already-governed fields", () => {
  const wiringBlock = PRACTICE_PAGE.slice(PRACTICE_PAGE.indexOf("Programme Increment 021"), PRACTICE_PAGE.indexOf("const session = await withTimeout"));
  assert.ok(!/mock_eligible|SEALED|ali_mock_exposed/i.test(wiringBlock));
});

// ─── Founder Amendment record: placement scope/language boundary ──────────

test("placement is explicitly, structurally Mathematics-only -- it samples only MR-series competencies, never RC/WC", () => {
  assert.match(PLACEMENT_PAGE, /MATHEMATICS_COMPETENCY_IDS.*=.*\[.*"MR-01".*"MR-02".*"MR-03".*"MR-04".*"MR-05".*"MR-06".*\]/);
  assert.ok(!/"RC-0[1-4]"|"WC-0[12]"/.test(PLACEMENT_PAGE), "placement must never sample a Reading or Writing competency in this increment");
  assert.match(PLACEMENT_PAGE, /fetchQuestionBank\(supabase, "maths"/, "placement must only ever fetch Mathematics content");
});

test("placement never claims whole-programme (English + Mathematics) ability, and never claims a specific ability/level classification from this short check", () => {
  assert.ok(!/your (ability|11\+) level|predicted (11\+ )?level|you have mastered|overall (level|ability)/i.test(PLACEMENT_PAGE), "placement must never assert a definitive ability/level classification");
});
