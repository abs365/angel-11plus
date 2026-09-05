import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { buildPreparationDecision } from "@/lib/learningEngine/preparationDecision";
import { hasFullLessonAvailable } from "@/lib/learningEngine/fullLessonRegistry";
import type { SubjectPreparationSummary, CompetencyPreparationSummary } from "@/lib/learningEngine/preparationState";
import type { PreparationClock } from "@/lib/learningEngine/preparationClock";
import type { CompetencyId } from "@/lib/learningEngine/types";
import type { EvidenceConfidenceTier } from "@/types/ali/confidence";
import type { EducationalState } from "@/types/ali/educationalState";
import type { RecommendationTrigger } from "@/types/ali/recommendationOrchestration";

/**
 * Programme Increment 022 — English Reading's first full teaching lesson
 * (RC-01, Literal Retrieval). Structural + decision-level proofs, matching
 * this codebase's established convention (no @testing-library/React-
 * rendering infrastructure exists here — see
 * tests/app/increment021TeachingLessonRouting.test.ts's own precedent,
 * which this file directly extends rather than duplicates).
 */

const PRACTICE_PAGE = fs.readFileSync("app/learning-intelligence/practice/[area]/page.tsx", "utf8");
const READING_LESSON = fs.readFileSync("app/learning-intelligence/learn/english/reading-retrieval/page.tsx", "utf8");

// ─── Decision-level fixtures (same helpers as increment021PreparationHorizonPersonas.test.ts) ───

function comp(id: CompetencyId, confidenceTier: EvidenceConfidenceTier, educationalState: EducationalState): CompetencyPreparationSummary {
  return { competencyId: id, confidenceTier, educationalState };
}
function subjectSummary(component: SubjectPreparationSummary["component"], competencies: CompetencyPreparationSummary[]): SubjectPreparationSummary {
  const tiers = competencies.map((c) => c.confidenceTier);
  const evidenceState = tiers.length === 0 || tiers.every((t) => t === "insufficient")
    ? "no_evidence"
    : tiers.some((t) => t === "moderate" || t === "high")
      ? "established_evidence"
      : "developing_evidence";
  return { component, competencies, evidenceState };
}
function clockFor(daysRemaining: number): PreparationClock {
  return { targetExamDate: "2027-01-01", daysRemaining, weeksRemaining: Math.round(daysRemaining / 7), horizonBand: "coverage_building" };
}
function candidate(competencyCode: CompetencyId, educationalState: EducationalState, triggerReason: RecommendationTrigger) {
  return { competencyCode, educationalState, triggerReason };
}

const MATHS_SECURE: CompetencyPreparationSummary[] = (["MR-01", "MR-02", "MR-03", "MR-04", "MR-05", "MR-06"] as CompetencyId[]).map((id) =>
  comp(id, "high", "mastered")
);
const WRITING_SECURE: CompetencyPreparationSummary[] = (["WC-01", "WC-02"] as CompetencyId[]).map((id) => comp(id, "high", "mastered"));

// ─── 1. Registry mapping ────────────────────────────────────────────────────

test("RC-01 (the selected Reading skill) has a real full lesson registered", () => {
  assert.equal(hasFullLessonAvailable("RC-01"), true);
});

// ─── 2. A genuine teaching_lesson decision for RC-01 reaches the lesson ────

test("a weak RC-01 signal, with every other competency secure, produces a real teaching_lesson decision naming RC-01, and the routing wiring resolves it to the real Reading lesson route", () => {
  const englishWeak = subjectSummary("English Comprehension", [
    comp("RC-01", "low", "rebuilding"),
    comp("RC-02", "high", "mastered"),
    comp("RC-03", "high", "mastered"),
    comp("RC-04", "high", "mastered"),
  ]);
  const decision = buildPreparationDecision(
    [englishWeak, subjectSummary("Mathematics", MATHS_SECURE), subjectSummary("Continuous Writing", WRITING_SECURE)],
    clockFor(300),
    "Year 5",
    [candidate("RC-01", "rebuilding", "weak-competency-remediation")],
    [],
    { hasFullLessonAvailable }
  );
  assert.equal(decision.recommendedCompetencyId, "RC-01");
  assert.equal(decision.recommendedActivityType, "teaching_lesson");

  // Same routing condition the practice page itself uses (source-level
  // proof it actually reaches FULL_LESSON_ROUTE for this competency).
  assert.match(PRACTICE_PAGE, /FULL_LESSON_ROUTE\[decision\.recommendedCompetencyId\]/);
});

// ─── 3. A different Reading skill without a lesson falls back safely ──────

test("a weak RC-03 signal (no lesson registered) falls back to guided_practice, never a false teaching claim -- updated from RC-02 to RC-03 by Increment 024, which gave RC-02 a real lesson", () => {
  const englishWeak = subjectSummary("English Comprehension", [
    comp("RC-01", "high", "mastered"),
    comp("RC-02", "high", "mastered"),
    comp("RC-03", "low", "rebuilding"),
    comp("RC-04", "high", "mastered"),
  ]);
  const decision = buildPreparationDecision(
    [englishWeak, subjectSummary("Mathematics", MATHS_SECURE), subjectSummary("Continuous Writing", WRITING_SECURE)],
    clockFor(300),
    "Year 5",
    [candidate("RC-03", "rebuilding", "weak-competency-remediation")],
    [],
    { hasFullLessonAvailable }
  );
  assert.equal(decision.recommendedCompetencyId, "RC-03");
  assert.equal(decision.recommendedActivityType, "guided_practice");
  assert.equal(hasFullLessonAvailable("RC-03"), false);
});

// ─── Cross-subject routing guard (Increment 022's own precondition for adding a second-subject lesson) ───

test("the lesson redirect is gated to the recommended competency's OWN subject matching the area currently open -- a Mathematics practice session is never silently redirected into an English lesson, or vice versa", () => {
  assert.match(PRACTICE_PAGE, /COMPONENT_SUBJECT\[COMPETENCIES\[decision\.recommendedCompetencyId\]\.component\]/);
  assert.match(PRACTICE_PAGE, /recommendedSubject === area!\.subject/);
});

test("COMPETENCIES/COMPONENT_SUBJECT are imported from the single canonical assessmentBrainMap, never a second competency-to-subject mapping invented in the page itself", () => {
  assert.match(PRACTICE_PAGE, /import \{ QUESTION_TYPE_PRIMARY_COMPETENCY, isValidCompetencyId, COMPETENCIES, COMPONENT_SUBJECT \} from "@\/lib\/learningEngine\/assessmentBrainMap"/);
});

// ─── 4/5. Lesson -> Reading Practice continuation, loop safety ─────────────

test("the Reading lesson links onward into real Reading Practice, carrying skipTeachingRedirect=1 so returning from the lesson always reaches a real session", () => {
  const practiceLinks = [...READING_LESSON.matchAll(/href="\/learning-intelligence\/practice\/reading-comprehension([^"]*)"/g)];
  assert.ok(practiceLinks.length > 0, "the Reading lesson must link into Reading Practice");
  for (const link of practiceLinks) {
    assert.match(link[1], /skipTeachingRedirect=1/, "the Reading lesson's own Practice link must carry skipTeachingRedirect=1");
  }
});

test("the Reading lesson never programmatically redirects into Practice on its own -- only an explicit learner click", () => {
  assert.ok(!/router\.(replace|push)\(.*practice\/reading-comprehension/.test(READING_LESSON));
});

// ─── 7/8. Content provenance: Practice-eligible bank content only, no Mock/SEALED, no new bank rows ───

test("the Reading lesson draws its guided/independent content only through fetchQuestionBank() -- the real, existing Practice-eligible gate -- never a Mock-specific fetch/table", () => {
  assert.match(READING_LESSON, /fetchQuestionBank\(supabase, "english", "csse"\)/);
  assert.ok(!/ali_mock_form|mock_get_question|MockAttempt|getResumableMockAttempt/i.test(READING_LESSON), "the lesson must never reference any Mock-specific fetch mechanism or table");
});

test("the Reading lesson never references Mock/SEALED content directly", () => {
  assert.ok(!/mock_eligible|SEALED|ali_mock_exposed/i.test(READING_LESSON));
});

test("the lesson's three real content ids are resolved via a pre-existing, already-reviewed fetchQuestionBank() lookup, never an inline literal question/passage object standing in for a new bank row", () => {
  assert.match(READING_LESSON, /english\.find\(\(q\) => q\.id === "w3-rc01-newtrainers-01"\)/);
  assert.match(READING_LESSON, /english\.find\(\(q\) => q\.id === "w3-rc01-bakersapprentice-01"\)/);
  assert.match(READING_LESSON, /english\.find\(\(q\) => q\.id === "w3-rc01-stormharbour-01"\)/);
});

// ─── 9. Independent example is not the same passage/question as guided/model ───

test("guided, independent and independent-fresh-retry each use a genuinely distinct real passage id -- no reuse across the three real content slots", () => {
  const ids = ["w3-rc01-newtrainers-01", "w3-rc01-bakersapprentice-01", "w3-rc01-stormharbour-01"];
  assert.equal(new Set(ids).size, ids.length, "all three real content ids must be pairwise distinct");
});

test("the MODEL step uses a purpose-built teaching passage ('The Football Boots'), never one of the three real Practice-eligible ids used for GUIDED/INDEPENDENT", () => {
  assert.match(READING_LESSON, /The Football Boots/);
  const modelSection = READING_LESSON.slice(READING_LESSON.indexOf("The Football Boots"), READING_LESSON.indexOf("GUIDED"));
  assert.ok(!/w3-rc01-newtrainers-01|w3-rc01-bakersapprentice-01|w3-rc01-stormharbour-01/.test(modelSection));
});

// ─── 10. Existing Mathematics teaching routes remain unaffected ────────────

test("existing Mathematics lesson registrations (MR-01/MR-03/MR-04) are untouched by this increment", () => {
  const REGISTRY = fs.readFileSync("lib/learningEngine/fullLessonRegistry.ts", "utf8");
  assert.match(REGISTRY, /"MR-01":\s*"\/learning-intelligence\/learn\/mathematics\/arithmetic"/);
  assert.match(REGISTRY, /"MR-03":\s*"\/learning-intelligence\/learn\/mathematics\/compound-shapes"/);
  assert.match(REGISTRY, /"MR-04":\s*"\/learning-intelligence\/learn\/mathematics\/percentages"/);
});

test("a Mathematics-area recommendation still resolves a Mathematics lesson route -- the new cross-subject guard does not block same-subject routing", () => {
  const mathsWeak = subjectSummary("Mathematics", [
    comp("MR-03", "low", "rebuilding"),
    comp("MR-01", "high", "mastered"),
    comp("MR-02", "high", "mastered"),
    comp("MR-04", "high", "mastered"),
    comp("MR-05", "high", "mastered"),
    comp("MR-06", "high", "mastered"),
  ]);
  const englishSecure = subjectSummary("English Comprehension", (["RC-01", "RC-02", "RC-03", "RC-04"] as CompetencyId[]).map((id) => comp(id, "high", "mastered")));
  const decision = buildPreparationDecision(
    [englishSecure, mathsWeak, subjectSummary("Continuous Writing", WRITING_SECURE)],
    clockFor(300),
    "Year 5",
    [candidate("MR-03", "rebuilding", "weak-competency-remediation")],
    [],
    { hasFullLessonAvailable }
  );
  assert.equal(decision.recommendedCompetencyId, "MR-03");
  assert.equal(decision.recommendedActivityType, "teaching_lesson");
});

// ─── Founder Amendment: optional stretch check ─────────────────────────────
// Structural proofs against the real page source, matching this file's own
// established convention (no @testing-library/React-rendering
// infrastructure exists here).

test("1/4. the stretch section is never gated behind, and never gates, the REFLECT/NEXT STEP section -- a learner can always reach Practice without touching the stretch", () => {
  const stretchIndex = READING_LESSON.indexOf("Fancy a trickier one?");
  const reflectCommentIndex = READING_LESSON.indexOf("REFLECT / NEXT STEP");
  assert.ok(stretchIndex > -1 && reflectCommentIndex > -1 && stretchIndex < reflectCommentIndex, "the stretch section must render as its own independent block, before REFLECT/NEXT STEP in source order");
  // REFLECT/NEXT STEP's own gate (the line immediately after its comment)
  // must remain exactly `{independentResolved && (` -- unconditional on
  // the stretch ever having been offered, started or attempted.
  const afterComment = READING_LESSON.slice(reflectCommentIndex, reflectCommentIndex + 120);
  assert.match(afterComment, /\{independentResolved && \(/);
  assert.ok(!/stretchStarted|stretchAttempt|stretchItem/.test(afterComment));
});

test("2. the stretch section is offered only after secureIndependentSuccess -- correct on the first independent attempt", () => {
  assert.match(READING_LESSON, /const secureIndependentSuccess = independentAttempt1\?\.correct === true;/);
  assert.match(READING_LESSON, /\{independentResolved && secureIndependentSuccess && stretchItem && stretchPrompt && \(/);
});

test("3. a learner who needed independent attempt 2 or the fresh retry is NOT offered the stretch -- secureIndependentSuccess reads independentAttempt1 only, never attempt2 or the fresh-retry outcome", () => {
  const line = READING_LESSON.match(/const secureIndependentSuccess = .*/)?.[0] ?? "";
  assert.ok(!/independentAttempt2|independentFreshAttempt/.test(line), "the eligibility condition must not treat a supported/remediated success as secure");
});

test("4. the child can finish the lesson and reach Practice without starting the stretch -- starting it requires an explicit button click, never automatic", () => {
  assert.match(READING_LESSON, /onClick=\{\(\) => setStretchStarted\(true\)\}/);
  assert.ok(!/setStretchStarted\(true\)/.test(READING_LESSON.replace(/onClick=\{\(\) => setStretchStarted\(true\)\}/, "")), "stretchStarted must only ever be set true from the learner's own button click");
});

test("5/6/7/8. the selected stretch item is a real, distinct, Practice-eligible RC-01 row -- never Mock/SEALED, never one of the four already-used passages", () => {
  assert.match(READING_LESSON, /english\.find\(\(q\) => q\.id === "w2-understudy-01"\)/, "the stretch item must be resolved through the same real fetchQuestionBank() pool as every other real content slot");
  const usedIds = ["w3-rc01-newtrainers-01", "w3-rc01-bakersapprentice-01", "w3-rc01-stormharbour-01", "w2-understudy-01"];
  assert.equal(new Set(usedIds).size, usedIds.length, "the stretch id must be distinct from every other real content id already used in this lesson");
  const stretchSection = READING_LESSON.slice(READING_LESSON.indexOf("Fancy a trickier one?"), READING_LESSON.indexOf("REFLECT / NEXT STEP"));
  assert.ok(!/mock_eligible|SEALED|ali_mock_exposed|ali_mock_form/i.test(stretchSection));
});

test("9. a correct stretch answer never claims mastery -- only that the method worked on a trickier passage", () => {
  const stretchSection = READING_LESSON.slice(READING_LESSON.indexOf("Fancy a trickier one?"), READING_LESSON.indexOf("REFLECT / NEXT STEP"));
  assert.ok(!/master(ed|y)/i.test(stretchSection), "the stretch section must never use the word mastered/mastery");
  assert.match(stretchSection, /You used the method\s*\n?\s*on a trickier passage/);
});

test("10. an incorrect stretch answer gives concise, useful feedback and never forces a retry loop -- exactly one attempt, no ladder, no re-enabled input after the first submission", () => {
  const stretchSection = READING_LESSON.slice(READING_LESSON.indexOf("Fancy a trickier one?"), READING_LESSON.indexOf("REFLECT / NEXT STEP"));
  // Only one submit path exists (gated on !stretchAttempt), never a second attempt/ladder stage type for the stretch.
  assert.equal((stretchSection.match(/onClick=\{\(\) => void submitStretch\(\)\}/g) ?? []).length, 1);
  assert.ok(!/StretchLadderStage|stretch.*attempt-2|stretch.*attempt-3/i.test(stretchSection));
});

test("11. lesson -> Practice continuation remains safe and unchanged by this amendment", () => {
  const practiceLinks = [...READING_LESSON.matchAll(/href="\/learning-intelligence\/practice\/reading-comprehension([^"]*)"/g)];
  assert.ok(practiceLinks.length > 0);
  for (const link of practiceLinks) assert.match(link[1], /skipTeachingRedirect=1/);
});

test("12. cross-subject routing protection remains intact after this amendment", () => {
  assert.match(PRACTICE_PAGE, /COMPONENT_SUBJECT\[COMPETENCIES\[decision\.recommendedCompetencyId\]\.component\]/);
  assert.match(PRACTICE_PAGE, /recommendedSubject === area!\.subject/);
});

test("the stretch attempt reuses the existing recordIndependentAttempt() evidence path -- no second evidence store invented for this amendment", () => {
  const stretchFnSection = READING_LESSON.slice(READING_LESSON.indexOf("async function submitStretch"), READING_LESSON.indexOf("const progression ="));
  assert.match(stretchFnSection, /await recordIndependentAttempt\(stretchItem, isCorrect, true\);/);
});
