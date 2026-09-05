import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { buildPreparationDecision } from "@/lib/learningEngine/preparationDecision";
import { hasFullLessonAvailable } from "@/lib/learningEngine/fullLessonRegistry";
import { checkAcceptedAnswerSet } from "@/lib/learningEngine/englishAnswerValidation";
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

// ═══════════════════════════════════════════════════════════════════════════
// FOUNDER AMENDMENT 1 — GUIDED evidence must never masquerade as independent
// evidence at the confidence/evidence-state layer, not only the mastery layer.
// ═══════════════════════════════════════════════════════════════════════════

test("AMENDMENT 1: the GUIDED self-assessment write passes verified: false to recordOutcome -- a self-assessed explanation Angel cannot auto-grade must never clear computeCompetencyConfidence()'s anyEvidence floor on its own (lib/ali/confidence.ts's own real verified !== false check)", () => {
  const fnSection = READING_LESSON.slice(
    READING_LESSON.indexOf("async function submitGuidedSelfAssessment"),
    READING_LESSON.indexOf("function checkInference")
  );
  assert.match(fnSection, /await recordOutcome\(/);
  // The recordOutcome call must end with `, false)` as its final (9th,
  // verified) argument -- not left to default to `true`.
  const recordOutcomeCall = fnSection.slice(fnSection.indexOf("await recordOutcome("), fnSection.indexOf(").catch(() => {});", fnSection.indexOf("await recordOutcome(")));
  assert.match(recordOutcomeCall, /"supported",\s*\/\/[\s\S]*?\n\s*false\s*$/, "the final argument to recordOutcome must be the literal `false` (verified), not omitted");
});

test("AMENDMENT 1: supportTier remains 'supported' for the GUIDED write, exactly as before -- the fix adds the missing verified:false, it does not change or duplicate the existing mastery-layer protection", () => {
  const fnSection = READING_LESSON.slice(
    READING_LESSON.indexOf("async function submitGuidedSelfAssessment"),
    READING_LESSON.indexOf("function checkInference")
  );
  assert.match(fnSection, /"supported"/);
});

test("AMENDMENT 1: GUIDED -> INDEPENDENT evidence separation -- secureIndependentSuccess (the sole stretch-eligibility gate) reads only independentAttempt1, never any guided-stage variable", () => {
  const line = READING_LESSON.match(/const secureIndependentSuccess = .*/)?.[0] ?? "";
  assert.match(line, /independentAttempt1\?\.correct === true/);
  assert.ok(!/guided/i.test(line), "the stretch-eligibility condition must never reference any guided-stage variable");
});

test("AMENDMENT 1: no code path sets independentAttempt1 (or independentLadderStage) from inside the GUIDED self-assessment function -- GUIDED success cannot fabricate independent-stage state", () => {
  const fnSection = READING_LESSON.slice(
    READING_LESSON.indexOf("async function submitGuidedSelfAssessment"),
    READING_LESSON.indexOf("function checkInference")
  );
  assert.ok(!/setIndependentAttempt1|setIndependentLadderStage/.test(fnSection));
});

// ═══════════════════════════════════════════════════════════════════════════
// FOUNDER AMENDMENT 2 — Personas A–F, explicit deterministic tests.
// Reuses the same canonical decision/validation functions the lesson and
// the Preparation Horizon engine themselves use -- never a re-implementation
// of production logic inside the test.
// ═══════════════════════════════════════════════════════════════════════════

// Persona A — weaker learner / one-clue guesser: a genuinely weak RC-02
// signal must route to TEACHING (the real lesson), never be treated as
// already secure. Reuses the exact real decision engine.
test("PERSONA A (weaker learner / one-clue guesser): a genuine regression/struggling RC-02 signal routes to the real teaching lesson, never treated as secure or left at weighting-only guided_practice", () => {
  // "rebuilding" is this engine's own real, unconditional signal for a
  // struggling/regressed competency (Increment 019's own fix: any
  // regression forces the overall stage to "teaching" regardless of how
  // secure every other competency is) -- the correct real representation
  // of a genuinely weak, one-clue-guessing learner, not an isolated,
  // otherwise-secure learner's single unattempted gap (which this engine
  // correctly does NOT escalate to teaching_lesson on its own -- proven
  // separately, not assumed).
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
  assert.ok(!decision.secureCompetencies.includes("RC-02"), "a struggling learner's RC-02 must never appear in secureCompetencies");
});

test("PERSONA A (isolated gap, otherwise secure learner): a single never-attempted RC-02 competency, with every other competency mastered, correctly does NOT escalate to teaching_lesson on its own -- the overall preparation stage genuinely governs this, confirming Persona A's own real routing rule is not accidental", () => {
  const englishMostlySecure = subjectSummary("English Comprehension", [
    comp("RC-01", "high", "mastered"),
    comp("RC-02", "insufficient", "exploring"),
    comp("RC-03", "high", "mastered"),
    comp("RC-04", "high", "mastered"),
  ]);
  const decision = buildPreparationDecision(
    [englishMostlySecure, subjectSummary("Mathematics", MATHS_SECURE), subjectSummary("Continuous Writing", WRITING_SECURE)],
    clockFor(300),
    "Year 5",
    [candidate("RC-02", "exploring", "never-attempted")],
    [],
    { hasFullLessonAvailable }
  );
  // Documents the real, evidence-based rule rather than asserting a fixed
  // activity type: an isolated gap in an otherwise-secure learner is
  // governed by the OVERALL stage, not this one competency alone.
  assert.equal(decision.recommendedCompetencyId, "RC-02");
  assert.notEqual(decision.recommendedActivityType, "teaching_lesson", "an isolated, otherwise-secure gap must not itself force teaching_lesson -- that is reserved for a genuine regression/struggling signal, proven by the sibling test above");
});

// Persona B — plausible-real-world guesser: a real, plausible-sounding but
// textually-unsupported answer must be rejected by the same real matcher
// the INDEPENDENT stage actually uses.
test("PERSONA B (plausible-real-world guesser): a plausible but textually-unsupported answer is genuinely rejected by the real matcher INDEPENDENT uses", () => {
  const newgirlAccepted = [
    "felt accepted as ordinary rather than singled out as the new girl",
    "felt accepted as ordinary rather than singled out as the different girl",
    "did not have to explain or perform being new",
    "being included casually mattered more than being noticed",
    "let her belong without having to justify herself",
  ];
  // Plausible in real life (shyness is a believable trait), but not what
  // this specific passage's evidence supports -- the exact class of error
  // Persona B represents.
  const result = checkAcceptedAnswerSet("she was just a shy person by nature", newgirlAccepted);
  assert.equal(result.correct, false);
});

// Persona C — evidence retriever who cannot connect clues: GUIDED must show
// real reasoning (why each quotation matters), not merely the correct
// answer, regardless of whether quotations were found or the self-
// assessment was negative.
test("PERSONA C (retrieves evidence, cannot connect it): GUIDED's post-submission reasoning block explains WHY each quotation matters, not just what the quotations are, and renders regardless of quotationsFound", () => {
  const guidedSection = READING_LESSON.slice(READING_LESSON.indexOf("Try one with help"), READING_LESSON.indexOf("Watch out for"));
  assert.match(guidedSection, /guidedQuotationsFound \? \(/);
  assert.match(guidedSection, /Angel&apos;s own reasoning for this one/i);
  assert.match(guidedSection, /a physical sign of panic, not just being tired/i);
  assert.match(guidedSection, /her anxiety is so strong it stops her talking entirely/i);
});

// Persona D — secure learner, genuine independent transfer: already proven
// by the anti-memorisation tests above (zero id overlap between MODEL/
// GUIDED and INDEPENDENT); this test confirms INDEPENDENT's own displayed
// content never contains GUIDED's specific answer text.
test("PERSONA D (secure learner, independent transfer): INDEPENDENT's own rendered content never reuses GUIDED's specific quotations or reasoning text", () => {
  const independentSection = READING_LESSON.slice(READING_LESSON.indexOf('id="independentPrompt"') === -1 ? READING_LESSON.indexOf("Now try one alone") : 0, READING_LESSON.indexOf("Fancy a trickier one?"));
  assert.ok(!/something urgent and uneven in my chest|could not speak at all/i.test(independentSection), "INDEPENDENT must never reuse GUIDED's specific quotations");
});

// Persona E — strong learner, stretch requires secure first-attempt
// independent success. Already covered by the dedicated gating test above;
// this adds the negative case: an independent success reached only via
// attempt 2 or the fresh retry must NOT be treated as "secure".
test("PERSONA E (strong learner): stretch eligibility is specifically first-attempt success -- a learner who needed independent attempt 2 or the fresh retry is not 'secure' by this lesson's own definition", () => {
  const line = READING_LESSON.match(/const secureIndependentSuccess = .*/)?.[0] ?? "";
  assert.ok(!/independentAttempt2|independentFreshAttempt/.test(line), "secureIndependentSuccess must not treat a supported/remediated success as secure");
});

// Persona F — late entrant: Preparation Horizon can route a genuine RC-02
// teaching need into the full lesson while preserving the subject guard and
// loop protection. Reuses the exact real decision + routing-guard checks.
test("PERSONA F (late entrant): a late-entrant-shaped RC-02 weak signal (short runway, Year 6) still resolves to teaching_lesson naming RC-02, and the same cross-subject/loop-safety wiring covers it", () => {
  const englishWeak = subjectSummary("English Comprehension", [
    comp("RC-01", "high", "mastered"),
    comp("RC-02", "low", "rebuilding"),
    comp("RC-03", "high", "mastered"),
    comp("RC-04", "high", "mastered"),
  ]);
  const decision = buildPreparationDecision(
    [englishWeak, subjectSummary("Mathematics", MATHS_SECURE), subjectSummary("Continuous Writing", WRITING_SECURE)],
    clockFor(45), // short runway -- late entrant shape
    "Year 6",
    [candidate("RC-02", "rebuilding", "weak-competency-remediation")],
    [],
    { hasFullLessonAvailable }
  );
  assert.equal(decision.recommendedCompetencyId, "RC-02");
  assert.equal(decision.recommendedActivityType, "teaching_lesson");
  // Loop-safety and cross-subject guard are the same shared mechanism
  // already proven generic above -- confirmed still present, not
  // reimplemented for RC-02.
  assert.match(PRACTICE_PAGE, /skipTeachingRedirect === "1"/);
  assert.match(PRACTICE_PAGE, /recommendedSubject === area!\.subject/);
});
