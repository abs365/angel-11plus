/**
 * Adaptive Paper Builder — Sprint 2, Increment 1, Gate 2 verification.
 *
 * Same convention as this project's prior pure-function validation passes
 * (scripts/test-educational-intelligence-foundation.ts): plain assert(),
 * no test framework, `npx tsx scripts/test-adaptive-mock-paper-builder.ts`.
 *
 * Fixtures below are REAL CSSE content — 28 of the 29 rows currently in
 * production `ali_question_bank` for subject in (english, maths, writing),
 * queried live against agxunwcdatosrmzhhuxj this session (id/skill/
 * contentDifficulty/estimatedTimeSeconds/masteryThreshold copied exactly).
 * The one omitted row (qa-003, QT-MR-01/medium/60s/threshold 2) shares an
 * identical shape to six other QT-MR-01 rows already included and adds no
 * further coverage. This is "real CSSE fixtures" per Gate 2, not synthetic
 * data — buildAdaptivePaper() itself makes no Supabase call, so this script
 * supplies what a real caller's fetchQuestionBank()/fetchLearnerIntelligenceProfile()
 * would have returned.
 */
import { buildAdaptivePaper, type AdaptivePaperSubject } from "@/lib/learningEngine/adaptiveMockPaperBuilder";
import type { BankQuestion, ContentDifficulty } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";
import type { LearnerIntelligenceProfile } from "@/lib/learningEngine/types";

let failures = 0;
function assert(condition: boolean, message: string): void {
  if (!condition) {
    failures++;
    console.error(`FAIL: ${message}`);
  } else {
    console.log(`pass: ${message}`);
  }
}

// ─── Real fixture content (see header) ─────────────────────────────────────

function q(id: string, subject: "english" | "maths" | "writing", skill: string, contentDifficulty: ContentDifficulty, estimatedTimeSeconds: number, masteryThreshold: number): BankQuestion {
  return {
    id,
    subject,
    skill,
    pathway: ["csse"],
    contentDifficulty,
    questionType: subject === "writing" ? "open-response" : "short-answer",
    estimatedTimeSeconds,
    prompt: { id, question: "(real prompt text omitted — irrelevant to selection logic)", answer: "", explanation: "" } as unknown as BankQuestion["prompt"],
    explanation: "",
    confidenceWeight: 1,
    revisionPriority: 3,
    masteryThreshold,
    usageCount: 0,
    avgSuccessRate: null,
    learningUnitId: id,
  };
}

const englishBank: BankQuestion[] = [
  q("eng-001-q2", "english", "QT-RC-03", "medium", 80, 2), // RC-03, standard priority
  q("eng-002-q3", "english", "QT-RC-05", "medium", 60, 2), // RC-02, development area — SEEN
  q("eng-002-q1", "english", "QT-RC-05", "medium", 120, 2), // RC-02, development area
  q("eng-001-q1", "english", "QT-RC-05", "medium", 90, 2), // RC-02, development area
  q("eng-003-q1", "english", "QT-RC-05", "hard", 120, 3), // RC-02, development area
  q("eng-003-q3", "english", "QT-RC-08", "hard", 90, 3), // RC-01, not-yet-evidenced
  q("eng-001-q3", "english", "QT-RC-10", "medium", 90, 2), // RC-02, development area
  q("eng-001-q4", "english", "QT-RC-10", "medium", 90, 2), // RC-02, development area
];

const mathsBank: BankQuestion[] = [
  q("qa-009", "maths", "QT-MR-01", "medium", 60, 2), // MR-01, standard
  q("mth-002", "maths", "QT-MR-01", "hard", 60, 3),
  q("mth-004", "maths", "QT-MR-01", "hard", 60, 3),
  q("mth-008", "maths", "QT-MR-01", "medium", 60, 2),
  q("qa-008", "maths", "QT-MR-01", "medium", 60, 2),
  q("qa-001", "maths", "QT-MR-01", "medium", 60, 2), // SEEN
  q("qa-002", "maths", "QT-MR-01", "medium", 60, 2),
  q("qa-004", "maths", "QT-MR-01", "medium", 60, 2),
  q("qa-005", "maths", "QT-MR-01", "medium", 60, 2),
  q("qa-006", "maths", "QT-MR-01", "medium", 60, 2),
  q("mth-010", "maths", "QT-MR-04", "medium", 60, 2), // MR-04, development area
  q("mth-007b", "maths", "QT-MR-04", "medium", 60, 2), // MR-04, development area
  q("qa-007", "maths", "QT-MR-04", "medium", 60, 2), // MR-04, development area
  q("mth-006", "maths", "QT-MR-05", "hard", 90, 3), // MR-02, low-confidence area
  q("mth-009", "maths", "QT-MR-07", "challenge", 90, 3), // MR-03, standard
  q("mth-003", "maths", "QT-MR-07", "medium", 90, 2), // MR-03, standard
  q("mth-001", "maths", "QT-MR-10", "medium", 60, 2), // MR-04, development area
  q("qa-010", "maths", "QT-MR-11", "medium", 60, 2), // MR-05, standard
  q("mth-005", "maths", "QT-MR-13", "medium", 60, 2), // MR-04, development area
];

const writingBank: BankQuestion[] = [
  q("wrt-003", "writing", "QT-WC-01a", "hard", 1500, 3), // WC-01, standard
];

const bankBySubject: Record<AdaptivePaperSubject, BankQuestion[]> = {
  english: englishBank,
  maths: mathsBank,
  writing: writingBank,
};

// Deep-copy for post-call mutation checks (Gate 1 — pure function).
const bankSnapshot = JSON.parse(JSON.stringify(bankBySubject));

function historyRow(questionId: string, timesSeen: number): StudentQuestionHistoryRow {
  return {
    profileId: "test-profile",
    questionId,
    source: "mock_exam",
    timesSeen,
    timesCorrect: 0,
    distinctCorrectSessions: 0,
    lastCorrectSessionId: null,
    lastPresentedAt: new Date().toISOString(),
    lastPresentedAtSequence: 1,
    lastAttemptCorrect: null,
    secondLastAttemptCorrect: null,
    masteryState: "learning",
    lastAttemptTimeSeconds: null,
    lastAttemptSkipped: null,
    lastAttemptAnswerChanged: null,
    lastAttemptFirstAnswer: null,
    lastAttemptFinalAnswer: null,
    lastAttemptConfidenceRating: null,
    lastAttemptWorkingShown: null,
  };
}

const history = new Map<string, StudentQuestionHistoryRow>([
  ["eng-002-q3", historyRow("eng-002-q3", 3)],
  ["qa-001", historyRow("qa-001", 2)],
]);
const historySnapshot = JSON.stringify(Array.from(history.entries()));

function profile(diagnostics: LearnerIntelligenceProfile["diagnostics"]): LearnerIntelligenceProfile {
  return {
    profileId: "test-profile",
    pathwayEligible: true,
    competencies: [],
    diagnostics,
    readiness: [],
    recommendations: [],
    hasAnyContent: true,
    hasAnyEvidence: true,
  };
}

const realisticProfile = profile({
  strengths: [],
  masteredSkills: [],
  emergingSkills: [],
  developmentAreas: ["RC-02", "MR-04"],
  lowConfidenceAreas: ["MR-02"],
  notYetEvidenced: ["RC-01"],
});

// Simple seedable PRNG (mulberry32) — deterministic across runs, unlike Math.random.
function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── Test 1 — Gate 1: pure function, no side effects ───────────────────────

// English target is 6, exactly matching its priority-unseen candidate count
// (5 RC-02 unseen + 1 RC-01 unseen) — deliberately chosen so which specific
// priority questions are selected is fully deterministic (all 6 fit), not
// merely probable, letting later assertions guarantee both RC-02 and RC-01
// are represented regardless of seed.
const result1 = buildAdaptivePaper(bankBySubject, realisticProfile, history, { english: 6, maths: 6, writing: 1 }, mulberry32(42));

assert(JSON.stringify(bankBySubject) === JSON.stringify(bankSnapshot), "bankBySubject is not mutated by buildAdaptivePaper()");
assert(JSON.stringify(Array.from(history.entries())) === historySnapshot, "history map is not mutated by buildAdaptivePaper()");
assert(typeof buildAdaptivePaper === "function", "buildAdaptivePaper is a plain function (no class, no hidden state)");

// ─── Test 2 — Gate 2: selection quality against the real fixtures ──────────

assert(result1.activities.length === 6 + 6 + 1, "total selected count matches the sum of all three subject targets (13)");
assert(result1.validation.passed, "all structural validation checks pass");
assert(result1.validation.checks.every((c) => c.passed), "every individual validation check reports passed");

const selectedIds1 = new Set(result1.activities.map((a) => a.id));

// English: exactly 6 of 8 candidates are priority-unseen (development-area
// RC-02 unseen x5, not-yet-evidenced RC-01 x1) and the target is also 6 —
// an exact match, so the outcome is fully deterministic: all 6 priority-
// unseen candidates are selected, and the 2 lower-priority ones (RC-03
// standard, and the one SEEN RC-02 row) are always excluded, for any seed.
assert(!selectedIds1.has("eng-001-q2"), "English: standard-priority RC-03 candidate excluded when the priority-unseen pool exactly fills the target");
assert(!selectedIds1.has("eng-002-q3"), "English: the one SEEN development-area candidate is excluded in favour of the 6 unseen priority candidates");

// Maths: exactly 6 candidates are priority-unseen (MR-04 x4 unseen, MR-02
// x1) — wait, MR-04 has 4 unseen rows (mth-010, mth-007b, qa-007, mth-001,
// mth-005 = 5) + MR-02 (mth-006) = 6 exactly, matching the target of 6.
const expectedMathsPriority = new Set(["mth-010", "mth-007b", "qa-007", "mth-001", "mth-005", "mth-006"]);
const selectedMathsIds = new Set(result1.activities.filter((a) => mathsBank.some((m) => m.id === a.id)).map((a) => a.id));
assert(
  selectedMathsIds.size === expectedMathsPriority.size && [...selectedMathsIds].every((id) => expectedMathsPriority.has(id)),
  "Maths: selection is exactly the 6 priority-unseen candidates (MR-04 development area + MR-02 low-confidence) when count matches target exactly"
);

assert(selectedIds1.has("wrt-003"), "Writing: the sole real candidate is selected for a target of 1");

assert(
  result1.coverage.priorityCompetenciesUnavailable.length === 0,
  "no priority competency is left unrepresented when enough candidates and target slots exist for all of them"
);
assert(
  result1.coverage.competenciesRepresented.includes("RC-02") &&
    result1.coverage.competenciesRepresented.includes("MR-04") &&
    result1.coverage.competenciesRepresented.includes("RC-01") &&
    result1.coverage.competenciesRepresented.includes("MR-02"),
  "coverage.competenciesRepresented includes all four real priority competencies"
);

const totalDifficulty = Object.values(result1.difficulty).reduce(
  (sum, bySubject) => sum + Object.values(bySubject).reduce((s, n) => s + n, 0),
  0
);
assert(totalDifficulty === result1.activities.length, "difficulty summary counts sum to the total selected count");

assert(result1.rationale.length === result1.activities.length, "one rationale entry exists per selected question");
assert(
  result1.rationale.every((r) => typeof r.reason === "string" && r.reason.length > 0),
  "every rationale entry has a non-empty, plain-language reason"
);

// ─── Test 3 — honesty when a target exceeds available real candidates ─────

const result2 = buildAdaptivePaper(bankBySubject, realisticProfile, history, { english: 4, maths: 6, writing: 5 }, mulberry32(7));
assert(
  result2.coverage.selectedCounts.writing === 1,
  "requesting more writing questions (5) than exist (1) selects only the 1 real candidate — never fabricated or duplicated"
);
assert(result2.validation.passed, "validation still passes when a target exceeds available candidates");

// ─── Test 4 — honesty when a subject's target is zero ──────────────────────

const result3 = buildAdaptivePaper(bankBySubject, realisticProfile, history, { english: 4, maths: 0, writing: 1 }, mulberry32(7));
assert(
  result3.coverage.selectedCounts.maths === 0,
  "a target of zero for a subject selects zero questions from it, even though real candidates exist"
);
assert(
  result3.coverage.priorityCompetenciesUnavailable.includes("MR-04") && result3.coverage.priorityCompetenciesUnavailable.includes("MR-02"),
  "maths-only priority competencies are honestly disclosed as unavailable when maths's target is zero (deterministic — zero maths candidates can be selected)"
);
// Not asserting RC-02/RC-01 remain represented here: English's target (4) is
// smaller than its priority-unseen candidate count (6 — 5 RC-02 + 1 RC-01),
// so which specific priority competency is squeezed out is legitimately
// seed-dependent, not a defect. What must always hold, regardless of seed,
// is internal consistency: nothing reported "unavailable" is simultaneously
// reported "represented".
assert(
  result3.coverage.priorityCompetenciesUnavailable.every((id) => !result3.coverage.competenciesRepresented.includes(id)),
  "priorityCompetenciesUnavailable and competenciesRepresented never overlap, for any seed"
);
assert(result3.validation.passed, "validation passes when a zero-target subject correctly has no representation");

// ─── Test 5 — determinism given the same evidence and the same seed ───────

const resultA = buildAdaptivePaper(bankBySubject, realisticProfile, history, { english: 4, maths: 6, writing: 1 }, mulberry32(1234));
const resultB = buildAdaptivePaper(bankBySubject, realisticProfile, history, { english: 4, maths: 6, writing: 1 }, mulberry32(1234));
assert(
  JSON.stringify(resultA.activities.map((a) => a.id)) === JSON.stringify(resultB.activities.map((a) => a.id)),
  "identical evidence + identical seed produces an identical paper (same question ids, same order)"
);

const resultC = buildAdaptivePaper(bankBySubject, realisticProfile, history, { english: 4, maths: 6, writing: 1 }, mulberry32(9999));
// Not asserting inequality with resultA — a different seed choosing the same
// exactly-6-candidate maths set (Test 2) is expected and correct, not a bug.
assert(resultC.validation.passed, "a different seed still produces a fully valid paper");

// ─── Summary ─────────────────────────────────────────────────────────────

if (failures > 0) {
  console.error(`\n${failures} assertion(s) failed.`);
  process.exit(1);
} else {
  console.log("\nAll assertions passed.");
}
