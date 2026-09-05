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
 * Programme Increment 024 — English Reading's second full teaching lesson
 * (RC-02, Inference and Justified Interpretation). Structural + decision-
 * level proofs, matching this codebase's established convention (no
 * @testing-library/React-rendering infrastructure exists here) and
 * directly extending tests/app/increment022EnglishReadingTeachingLesson.test.ts's
 * own pattern for RC-01, rather than duplicating it.
 */

const PRACTICE_PAGE = fs.readFileSync("app/learning-intelligence/practice/[area]/page.tsx", "utf8");
const READING_LESSON = fs.readFileSync("app/learning-intelligence/learn/english/reading-inference/page.tsx", "utf8");

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

test("RC-02 (the selected second Reading skill) has a real full lesson registered", () => {
  assert.equal(hasFullLessonAvailable("RC-02"), true);
});

// ─── 2. A genuine teaching_lesson decision for RC-02 reaches the lesson ────

test("a weak RC-02 signal, with every other competency secure, produces a real teaching_lesson decision naming RC-02, and the routing wiring resolves it to the real Reading inference lesson route", () => {
  const englishWeak = subjectSummary("English Comprehension", [
    comp("RC-01", "high", "mastered"),
    comp("RC-02", "low", "rebuilding"),
    comp("RC-03", "high", "mastered"),
    comp("RC-04", "high", "mastered"),
  ]);
  const decision = buildPreparationDecision(
    [englishWeak, subjectSummary("Mathematics", MATHS_SECURE), subjectSummary("Continuous Writing", WRITING_SECURE)],
    clockFor(300),
    "Year 5",
    [candidate("RC-02", "rebuilding", "weak-competency-remediation")],
    [],
    { hasFullLessonAvailable }
  );
  assert.equal(decision.recommendedCompetencyId, "RC-02");
  assert.equal(decision.recommendedActivityType, "teaching_lesson");
  assert.match(PRACTICE_PAGE, /FULL_LESSON_ROUTE\[decision\.recommendedCompetencyId\]/);
});

// ─── 3. RC-03/RC-04 (no lesson) fall back safely ───────────────────────────

test("a weak RC-03 signal (no lesson registered) falls back to guided_practice, never a false teaching claim", () => {
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

// ─── 4. RC-01's own existing routing remains intact ────────────────────────

test("RC-01's own teaching_lesson decision still resolves correctly -- adding RC-02 did not disturb the existing entry", () => {
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
});

// ─── Cross-subject / same-subject routing guard still holds ────────────────

test("a Mathematics-area recommendation still resolves a Mathematics lesson route -- the pre-existing cross-subject guard is unaffected by adding a second Reading lesson", () => {
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

test("the practice page's existing cross-subject guard code (COMPONENT_SUBJECT/COMPETENCIES) needed no change to support a second Reading lesson", () => {
  assert.match(PRACTICE_PAGE, /COMPONENT_SUBJECT\[COMPETENCIES\[decision\.recommendedCompetencyId\]\.component\]/);
  assert.match(PRACTICE_PAGE, /recommendedSubject === area!\.subject/);
});

// ─── 5/6. Lesson -> Reading Practice continuation, loop safety ─────────────

test("the Reading inference lesson links onward into real Reading Practice, carrying skipTeachingRedirect=1", () => {
  const practiceLinks = [...READING_LESSON.matchAll(/href="\/learning-intelligence\/practice\/reading-comprehension([^"]*)"/g)];
  assert.ok(practiceLinks.length > 0, "the lesson must link into Reading Practice");
  for (const link of practiceLinks) {
    assert.match(link[1], /skipTeachingRedirect=1/, "the lesson's own Practice link must carry skipTeachingRedirect=1");
  }
});

test("the Reading inference lesson never programmatically redirects into Practice on its own", () => {
  assert.ok(!/router\.(replace|push)\(.*practice\/reading-comprehension/.test(READING_LESSON));
});

// ─── 7/8. Content provenance: Practice-eligible bank content only, no Mock/SEALED, no new bank rows ───

test("the lesson draws its guided/independent/stretch content only through fetchQuestionBank() -- never a Mock-specific fetch/table", () => {
  assert.match(READING_LESSON, /fetchQuestionBank\(supabase, "english", "csse"\)/);
  assert.ok(!/ali_mock_form|mock_get_question|MockAttempt|getResumableMockAttempt/i.test(READING_LESSON));
});

test("the lesson never references Mock/SEALED content directly", () => {
  assert.ok(!/mock_eligible|SEALED|ali_mock_exposed/i.test(READING_LESSON));
});

test("all real content ids are resolved via pre-existing, already-reviewed fetchQuestionBank() lookups, never an inline literal object standing in for a new bank row", () => {
  assert.match(READING_LESSON, /english\.find\(\(q\) => q\.id === "w1-lastbus-05"\)/);
  assert.match(READING_LESSON, /english\.find\(\(q\) => q\.id === "w1-newgirl-09"\)/);
  assert.match(READING_LESSON, /english\.find\(\(q\) => q\.id === "w1-letter-09"\)/);
  assert.match(READING_LESSON, /english\.find\(\(q\) => q\.id === "w3-rc10-am-02"\)/);
});

// ─── 9. Anti-memorisation: 5 distinct passages, no overlap with RC-01's own three ───

test("guided, independent, fresh-retry and stretch each use a genuinely distinct real passage id -- no reuse across the four real content slots", () => {
  const ids = ["w1-lastbus-05", "w1-newgirl-09", "w1-letter-09", "w3-rc10-am-02"];
  assert.equal(new Set(ids).size, ids.length, "all four real content ids must be pairwise distinct");
});

test("this lesson's real content ids never overlap with RC-01's own lesson content ids -- genuinely fresh passages across the two lessons", () => {
  const rc02Ids = ["w1-lastbus-05", "w1-newgirl-09", "w1-letter-09", "w3-rc10-am-02"];
  const rc01Ids = ["w3-rc01-newtrainers-01", "w3-rc01-bakersapprentice-01", "w3-rc01-stormharbour-01", "w2-understudy-01"];
  for (const id of rc02Ids) assert.ok(!rc01Ids.includes(id), `${id} must not be one of RC-01's own lesson content ids`);
});

test("the MODEL step uses a purpose-built teaching passage ('The Late Homework'), never one of the real Practice-eligible ids used for GUIDED/INDEPENDENT/STRETCH", () => {
  assert.match(READING_LESSON, /The Late Homework/);
  const modelSection = READING_LESSON.slice(READING_LESSON.indexOf("The Late Homework"), READING_LESSON.indexOf("Try one with help"));
  assert.ok(modelSection.length > 0, "the MODEL section must be a real, non-empty slice");
  assert.ok(!/w1-lastbus-05|w1-newgirl-09|w1-letter-09|w3-rc10-am-02/.test(modelSection));
});

// ─── FACT / INFERENCE / UNSUPPORTED GUESS distinction, anti-pattern-teaching ───

test("the lesson explicitly teaches the FACT vs REASONABLE INFERENCE vs UNSUPPORTED GUESS distinction, not a keyword-matching shortcut", () => {
  assert.match(READING_LESSON, /What does the text actually say/i);
  assert.match(READING_LESSON, /reasonably work out/i);
  assert.match(READING_LESSON, /unsupported guess/i);
  assert.match(READING_LESSON, /tempting but unsupported guess/i);
});

test("the MODEL step explicitly models and rejects a tempting-but-unsupported conclusion, not only a correct one", () => {
  const modelSection = READING_LESSON.slice(READING_LESSON.indexOf("The Late Homework"), READING_LESSON.indexOf("Try one with help"));
  assert.match(modelSection, /tempting but unsupported guess/i);
  assert.match(modelSection, /claims more than the text allows/i);
});

test("COMMON MISTAKES names genuine inference errors, never a 'find this word, pick that answer' heuristic", () => {
  const mistakesSection = READING_LESSON.slice(READING_LESSON.indexOf("Watch out for"), READING_LESSON.indexOf("Now try one alone"));
  assert.match(mistakesSection, /plausible in real life/i);
  assert.match(mistakesSection, /one word/i);
  assert.match(mistakesSection, /what happened.*why it happened/i);
  assert.ok(!/find (this|the) word|when you see this wording/i.test(mistakesSection), "must never teach a keyword-spotting shortcut as the method");
});

// ─── GUIDED reuses the real TIER3 architecture, not a fabricated auto-grade ───

test("GUIDED reuses the real checkQuotationPresent architecture for evidence-finding and a genuine learner self-assessment for the explanation half -- never a fabricated auto-grade of free-text reasoning", () => {
  assert.match(READING_LESSON, /import \{ checkAcceptedAnswerSet, checkQuotationPresent \} from "@\/lib\/learningEngine\/englishAnswerValidation"/);
  assert.match(READING_LESSON, /checkQuotationPresent\(guidedAnswer, quote\)\.quotationFound/);
  assert.match(READING_LESSON, /submitGuidedSelfAssessment/);
  assert.match(READING_LESSON, /supportTier: "supported"|"supported"/);
});

// ─── Stretch: evidence-triggered, single ungated attempt, no mastery claim ───

test("the optional stretch is gated on secure first-attempt independent success, exactly matching RC-01's own established amendment pattern", () => {
  assert.match(READING_LESSON, /const secureIndependentSuccess = independentAttempt1\?\.correct === true;/);
  assert.match(READING_LESSON, /\{independentResolved && secureIndependentSuccess && stretchItem && stretchPrompt && \(/);
});

test("a correct stretch answer never claims mastery", () => {
  const stretchSection = READING_LESSON.slice(READING_LESSON.indexOf("Fancy a trickier one?"), READING_LESSON.indexOf("REFLECT / NEXT STEP"));
  assert.ok(!/master(ed|y)/i.test(stretchSection));
});

test("the stretch stage has exactly one submit path -- no ladder, no re-enabled input after the first submission", () => {
  const stretchSection = READING_LESSON.slice(READING_LESSON.indexOf("Fancy a trickier one?"), READING_LESSON.indexOf("REFLECT / NEXT STEP"));
  assert.equal((stretchSection.match(/onClick=\{\(\) => void submitStretch\(\)\}/g) ?? []).length, 1);
});

// ─── 10. Existing Mathematics + RC-01 registrations remain unaffected ──────

test("existing Mathematics and RC-01 lesson registrations are untouched by this increment", () => {
  const REGISTRY = fs.readFileSync("lib/learningEngine/fullLessonRegistry.ts", "utf8");
  assert.match(REGISTRY, /"MR-01":\s*"\/learning-intelligence\/learn\/mathematics\/arithmetic"/);
  assert.match(REGISTRY, /"MR-03":\s*"\/learning-intelligence\/learn\/mathematics\/compound-shapes"/);
  assert.match(REGISTRY, /"MR-04":\s*"\/learning-intelligence\/learn\/mathematics\/percentages"/);
  assert.match(REGISTRY, /"RC-01":\s*"\/learning-intelligence\/learn\/english\/reading-retrieval"/);
});
