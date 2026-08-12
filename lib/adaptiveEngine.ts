import type { UserProgress } from "@/types";
import type { AnalyticsReport, SubjectAnalytics } from "@/types/analytics";
import type { AdaptiveState, AdaptiveTier, DailyMission, MissionItem } from "@/types/adaptive";
import type { AliCompetencySignal } from "@/types/ali/missionSignal";
import { buildReplayQueue } from "./replayEngine";
import { competencyLabel } from "./ali/labels";
import { getEligibleSubjectKeys, resolveSubjectHref } from "./ali/pathwayEligibility";

/**
 * Known, undocumented-until-now parallel-system finding (Educational
 * Intelligence Foundation, Phase 2A gap review, 2026-07-23): this module
 * already filters WHICH subjects it recommends by pathway
 * (getEligibleSubjectKeys, ./ali/pathwayEligibility.ts) — a CSSE learner is
 * correctly never pointed at Verbal/Non-Verbal/Spatial Reasoning here.
 * What it does NOT do is share any EVIDENCE with the newer, CSSE-specific
 * Educational Intelligence Engine (lib/learningEngine/*, lib/ali/*): this
 * module reads/writes `lib/progress.ts`'s localStorage-backed
 * UserProgress/AnalyticsReport (synced to the separate `user_stats`/
 * `lesson_progress` tables), never `ali_student_question_history`. A CSSE
 * learner practising via the /english, /maths, /vocabulary, /writing,
 * /reasoning pages (this module's real callers) generates real practice
 * activity that the Educational Intelligence Engine never sees — no
 * competency evidence, no Readiness change, no Recommendation update.
 * Only /learning-intelligence/* and /mocks/[pathway] currently feed the
 * Engine (`lib/ali/history.ts`'s recordOutcome()). Not fixed here: closing
 * this gap means either rewiring these legacy pages' completion handlers
 * to also write real competency evidence, or a navigation change routing
 * CSSE learners to the newer surfaces instead — both are page/interface
 * changes outside this Foundation-only work package's approved scope.
 * Flagged for a separate, explicit decision rather than silently patched.
 */

// ─── Tier determination ───────────────────────────────────────────────────────

function tierFromSubject(subject: SubjectAnalytics): AdaptiveTier {
  if (subject.attempts === 0) return "foundation";
  if (subject.avgScore < 55) return "foundation";
  if (subject.avgScore < 75) return "developing";
  if (subject.avgScore < 90) return "advanced";
  return "challenge";
}

// ─── English lesson recommendation ───────────────────────────────────────────

function pickEnglishLesson(tier: AdaptiveTier, completedLessons: string[]): string {
  const done = (id: string) => completedLessons.includes(id);

  switch (tier) {
    case "foundation":
      if (!done("eng-001")) return "eng-001";
      if (!done("eng-002")) return "eng-002";
      return "eng-001"; // revisit easiest

    case "developing":
      if (!done("eng-001")) return "eng-001";
      if (!done("eng-002")) return "eng-002";
      if (!done("eng-003")) return "eng-003";
      return "eng-002"; // revisit core level

    case "advanced":
      if (!done("eng-002")) return "eng-002";
      if (!done("eng-003")) return "eng-003";
      return "eng-003"; // revisit hardest

    case "challenge":
      if (!done("eng-003")) return "eng-003";
      return "eng-003"; // push for perfection
  }
}

// ─── Maths mode recommendation ────────────────────────────────────────────────

function pickMathsMode(
  report: AnalyticsReport,
  completedLessons: string[]
): "reasoning" | "arithmetic" {
  const reasoningDone = completedLessons.includes("maths-reasoning");
  const arithmeticDone = completedLessons.includes("maths-arithmetic");

  if (!reasoningDone) return "reasoning";
  if (!arithmeticDone) return "arithmetic";

  // Both done — recommend whichever is weaker
  const arithmeticSkill = report.skills.find((s) => s.skill === "arithmetic");
  if (arithmeticSkill && arithmeticSkill.status === "weak") return "arithmetic";

  const reasoningSkills = report.skills.filter((s) =>
    ["reasoning", "word-problem", "fractions", "pattern"].includes(s.skill)
  );
  const weakReasoning = reasoningSkills.some((s) => s.status === "weak");
  if (weakReasoning) return "reasoning";

  // Default: reasoning is more comprehensive
  return "reasoning";
}

// ─── Mission item builders ────────────────────────────────────────────────────

const SUBJECT_LABELS: Record<string, string> = {
  english: "English Comprehension",
  maths: "Maths Reasoning",
  vocabulary: "Vocabulary Builder",
  writing: "Creative Writing",
  "mock-test": "Mock Test",
  "verbal-reasoning": "Verbal Reasoning",
  "non-verbal-reasoning": "Non-Verbal Reasoning",
  "spatial-reasoning": "Spatial Reasoning",
  "numerical-reasoning": "Numerical Reasoning",
};

const SUBJECT_MINUTES: Record<string, number> = {
  english: 20,
  maths: 20,
  vocabulary: 10,
  writing: 30,
  "mock-test": 45,
  "verbal-reasoning": 15,
  "non-verbal-reasoning": 15,
  "spatial-reasoning": 15,
  "numerical-reasoning": 15,
};

function reasonText(
  subject: SubjectAnalytics,
  priority: "primary" | "secondary" | "review",
  weakSkillLabel?: string
): string {
  if (priority === "review") {
    return `You're strong here. A quick session keeps your ${subject.label.toLowerCase()} score exam-ready.`;
  }

  if (subject.status === "not-started") {
    const copy: Record<string, string> = {
      english: "Comprehension is tested in every 11+ pathway. Start building your reading technique.",
      maths: "Maths reasoning accounts for a large share of 11+ marks, so don't leave it untouched.",
      vocabulary: "Strong vocabulary lifts both your English and Writing scores at once.",
      writing: "Creative writing is a scored 11+ component. Start with a structured prompt.",
      "mock-test": "Timed practice reveals timing gaps that topic work alone cannot show.",
      "verbal-reasoning": "Verbal Reasoning appears in GL, CEM and ISEB. Start building your word pattern technique.",
      "non-verbal-reasoning": "Non-Verbal Reasoning is tested in GL and ISEB. Practice pattern recognition now.",
      "spatial-reasoning": "Spatial Reasoning tests 3D thinking and symmetry. Build this skill with focused practice.",
      "numerical-reasoning": "Numerical Reasoning combines number patterns and data, an essential CEM skill.",
    };
    return copy[subject.subject] ?? "You haven't tried this section yet. Now is a good time.";
  }

  if (subject.status === "weak") {
    const copy: Record<string, string> = {
      english: `Your English average is ${subject.avgScore}%. Quote evidence more precisely and answer each mark point directly.`,
      maths: `Your Maths average is ${subject.avgScore}%. Write out your working step-by-step to find where marks are lost.`,
      vocabulary: `Your vocabulary score is ${subject.avgScore}%. Revisit the words you marked as uncertain each session.`,
      writing: `Your writing average is ${subject.avgScore}%. Use the checklist actively as you write, not afterwards.`,
      "mock-test": `Your mock average is ${subject.avgScore}%. Identify which section cost you most marks and focus there.`,
      "verbal-reasoning": `Your Verbal Reasoning score is ${subject.avgScore}%. Work on letter codes and word analogies before moving on.`,
      "non-verbal-reasoning": `Your Non-Verbal Reasoning score is ${subject.avgScore}%. Slow down and identify the rule before answering.`,
      "spatial-reasoning": `Your Spatial Reasoning score is ${subject.avgScore}%. Practise folding and rotation on paper before attempting digital questions.`,
      "numerical-reasoning": `Your Numerical Reasoning score is ${subject.avgScore}%. Identify the mathematical relationship in each question before calculating.`,
    };
    const base = copy[subject.subject] ?? `Your ${subject.label.toLowerCase()} score (${subject.avgScore}%) has room to grow. Focused practice here pays off.`;
    return weakSkillLabel
      ? `${base} Weakest skill: ${weakSkillLabel.toLowerCase()}.`
      : base;
  }

  // developing
  const copy: Record<string, string> = {
    english: `You're averaging ${subject.avgScore}% in English. More precise evidence and technique will push this above 75%.`,
    maths: `You're averaging ${subject.avgScore}% in Maths. Stronger method-writing will push you into exam-ready territory.`,
    vocabulary: `Your vocabulary score is ${subject.avgScore}%. Consistent daily review closes this gap quickly.`,
    writing: `Your writing is at ${subject.avgScore}%. Vary your sentence openers and technique use to improve further.`,
    "mock-test": `You scored ${subject.avgScore}% on your mock. Identify the weaker section and focus there next sitting.`,
    "verbal-reasoning": `You're at ${subject.avgScore}% in Verbal Reasoning. More practice with letter codes will push this above 75%.`,
    "non-verbal-reasoning": `Your Non-Verbal Reasoning is at ${subject.avgScore}%. Consistency with pattern rules will lift this quickly.`,
    "spatial-reasoning": `Your Spatial Reasoning is at ${subject.avgScore}%. Visualise each fold or rotation before answering.`,
    "numerical-reasoning": `Your Numerical Reasoning is at ${subject.avgScore}%. Writing out each step clearly will improve your accuracy.`,
  };
  return copy[subject.subject] ?? `You're at ${subject.avgScore}%. Consistency will bring this above 75%.`;
}

/**
 * ALI-native reason text (Phase ALI 1.3) — used instead of reasonText()'s
 * legacy copy templates when ALI has flagged real weak competencies for
 * this subject. Deliberately a separate code path, not a branch inside
 * reasonText() itself: reasonText() gates on the legacy `status` field
 * (e.g. "weak"), which inherits the Math.max ratchet (Decision 24) and can
 * read "strong" even while ALI knows specific competencies are weak. Only
 * fires for subjects with a non-empty `weakCompetencies` list, so it never
 * touches reasonText()'s output for any subject without real ALI data —
 * preserving it byte-for-byte for every other subject (validated in
 * scripts/_ali_mission_validation.ts, deleted before commit).
 */
function aliReasonText(subjectLabel: string, signal: AliCompetencySignal): string {
  const names = signal.weakCompetencies.map(competencyLabel);
  const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return `${list} need${names.length === 1 ? "s" : ""} reinforcement in ${subjectLabel}. Focused practice here will lift the whole subject fastest.`;
}

function buildItem(
  subject: SubjectAnalytics,
  tier: AdaptiveTier,
  priority: "primary" | "secondary" | "review",
  index: number,
  pathwayId: string | undefined,
  weakSkillLabel?: string,
  aliSignal?: AliCompetencySignal
): MissionItem {
  const minutes = Math.round(
    SUBJECT_MINUTES[subject.subject] * (priority === "review" ? 0.5 : 1)
  );
  const reason =
    priority !== "review" && aliSignal && aliSignal.weakCompetencies.length > 0
      ? aliReasonText(SUBJECT_LABELS[subject.subject], aliSignal)
      : reasonText(subject, priority, weakSkillLabel);
  return {
    id: `mission-${index}`,
    subject: subject.subject,
    label:
      priority === "review"
        ? `Review ${SUBJECT_LABELS[subject.subject]}`
        : SUBJECT_LABELS[subject.subject],
    href: resolveSubjectHref(subject.subject, pathwayId),
    reason,
    tier,
    priority,
    estimatedMinutes: Math.max(10, minutes),
  };
}

// ─── Urgency ordering ─────────────────────────────────────────────────────────

/**
 * Mission urgency per subject (Phase ALI 1.3 — ALI_LEARNING_MODEL.md §4,
 * scoped down per this phase's explicit instruction: only subjects with
 * real ALI competency data branch to new logic; every other subject —
 * including an ALI-covered subject that simply hasn't been attempted yet —
 * falls through to the byte-for-byte original formula).
 *
 * For subjects with attempted ALI competency data (currently Verbal
 * Reasoning, once a student has done at least one adaptive mock): urgency
 * is driven by ALI's native weak-competency flag directly, bypassing the
 * legacy `avgScore`/`status` fields — those inherit the Math.max ratchet
 * (ALI_DECISION_LOG.md Decision 24), which this phase is explicitly
 * instructed NOT to modify. Reading around it here, for ALI-covered
 * subjects only, achieves the fix without touching the score storage model.
 */
function urgency(s: SubjectAnalytics, aliSignal: AliCompetencySignal | undefined): number {
  if (s.subject === "mock-test") return -1;

  if (aliSignal && aliSignal.attemptedCompetencies.length > 0) {
    if (aliSignal.weakCompetencies.length > 0) {
      // Always outranks the legacy "not-started" branch below (item 3:
      // never-attempted subjects "cannot indefinitely outrank known
      // weaknesses"). Capped so a large weak count doesn't run away.
      return 140 + Math.min(aliSignal.weakCompetencies.length * 5, 40);
    }
    // No weak competencies right now — priority reduces as mastery coverage
    // grows (item 2: "recently mastered competencies gradually reduce in
    // priority"). Banded on mastery ratio rather than a raw event/time decay
    // — deliberately simple, no new stored history needed beyond what
    // ali_student_question_history already tracks.
    const masteryRatio = aliSignal.masteredCompetencies.length / aliSignal.attemptedCompetencies.length;
    if (masteryRatio >= 0.8) return 5; // maintain-only, lowest priority band
    if (masteryRatio >= 0.5) return 30; // developing, moderate
    return 60; // still building, below "not-started" (80) but above "strong" (0)
  }

  // Legacy branch — byte-for-byte unchanged. Used for every non-ALI subject,
  // and for an ALI-covered subject before it has any attempted competency
  // data (item: "preserve existing behaviour" applies uniformly here).
  if (s.status === "weak") return 100 + (100 - s.avgScore);
  if (s.status === "not-started") return 80;
  if (s.status === "developing") return 50 + (75 - s.avgScore);
  return 0;
}

// ─── Daily mission builder ────────────────────────────────────────────────────

function buildDailyMission(
  report: AnalyticsReport,
  englishTier: AdaptiveTier,
  mathsTier: AdaptiveTier,
  p: UserProgress
): DailyMission {
  // Brand-new user — fixed starter mission.
  //
  // New Angel Legacy Experience Audit finding: this branch was previously
  // unconditional, pointing every brand-new user — including a CSSE-pathway
  // family, on their very first visit — at the old, superseded /english
  // (Lighthouse Mystery-era passages) and /maths pages, with reason text
  // that misleadingly asserted "Essex CSSE style passages" for content that
  // predates the Assessment Transformation and generates zero Educational
  // Intelligence evidence (see this file's own header comment). Corrected
  // to route a CSSE learner's first mission to the real, new
  // /learning-intelligence/learn destination instead. Every other pathway's
  // starter mission is byte-for-byte unchanged.
  if (report.totalSessions === 0) {
    if (p.selectedPathwayId === "csse") {
      return {
        items: [
          {
            id: "mission-0",
            subject: "maths",
            label: "Start your first lesson",
            href: "/learning-intelligence/learn",
            reason: "A real, evidence-led CSSE lesson. The best place to begin.",
            tier: "foundation",
            priority: "primary",
            estimatedMinutes: 15,
          },
        ],
        totalMinutes: 15,
        focusArea: "Getting started",
        tagline: "Complete your first lesson to generate your personalised analysis.",
      };
    }
    return {
      items: [
        {
          id: "mission-0",
          subject: "english",
          label: "English Comprehension",
          href: "/english",
          reason:
            "Start here — inference and close reading are at the heart of 11+. Essex CSSE style passages.",
          tier: "foundation",
          priority: "primary",
          estimatedMinutes: 20,
        },
        {
          id: "mission-1",
          subject: "maths",
          label: "Maths Reasoning",
          href: "/maths",
          reason:
            "Maths reasoning is half the exam. Work through each problem with full step-by-step solutions.",
          tier: "foundation",
          priority: "secondary",
          estimatedMinutes: 20,
        },
      ],
      totalMinutes: 40,
      focusArea: "Getting started",
      tagline: "Complete two subjects to generate your personalised analysis.",
    };
  }

  // ─── Pathway Eligibility Filter (WP-04, Stage 0 — EAW-002 §4) ───────────────
  // Runs before every candidate is generated, per the mandatory Stage 0
  // sequencing correction (EAW-D002): a subject the learner's selected
  // pathway does not test is excluded here, structurally, before urgency
  // ranking, review-subject selection, or replay-item generation ever see
  // it — never merely de-prioritised afterward. `eligibleReport` is what
  // every downstream candidate source in this function reads from `report.
  // subjects` — `report` itself (totalSessions, the mock-test nudge) is
  // untouched, since those are pathway-independent facts, not subject
  // recommendations.
  const eligibleSubjectKeys = getEligibleSubjectKeys(p.selectedPathwayId);
  const eligibleReport: AnalyticsReport = {
    ...report,
    subjects: report.subjects.filter(
      (s) => s.subject === "mock-test" || eligibleSubjectKeys.has(s.subject)
    ),
  };

  // Find the weakest skill per subject for richer reason text
  const weakSkillBySubject = new Map<string, string>();
  for (const skill of report.skills) {
    if (skill.status === "weak" && !weakSkillBySubject.has(skill.group)) {
      weakSkillBySubject.set(skill.group, skill.label);
    }
  }
  // ALI competency names take precedence where available — strictly more
  // specific than the legacy skill-group label above (Phase ALI 1.3).
  for (const [subject, signal] of Object.entries(p.aliCompetencySignal ?? {})) {
    if (signal && signal.weakCompetencies.length > 0) {
      weakSkillBySubject.set(subject, signal.weakCompetencies.map(competencyLabel).join(" and "));
    }
  }

  const nonMock = eligibleReport.subjects.filter((s) => s.subject !== "mock-test");
  const sorted = [...nonMock].sort(
    (a, b) => urgency(b, p.aliCompetencySignal?.[b.subject]) - urgency(a, p.aliCompetencySignal?.[a.subject])
  );

  const items: MissionItem[] = [];

  // Primary — most urgent
  const primary = sorted[0];
  if (primary) {
    const tier =
      primary.subject === "english"
        ? englishTier
        : primary.subject === "maths"
        ? mathsTier
        : tierFromSubject(primary);
    items.push(buildItem(primary, tier, "primary", 0, p.selectedPathwayId, weakSkillBySubject.get(primary.subject), p.aliCompetencySignal?.[primary.subject]));
  }

  // Secondary — second-most urgent (only if meaningfully urgent)
  const secondary = sorted.find((s, i) => i > 0 && urgency(s, p.aliCompetencySignal?.[s.subject]) > 20);
  if (secondary) {
    const tier =
      secondary.subject === "english"
        ? englishTier
        : secondary.subject === "maths"
        ? mathsTier
        : tierFromSubject(secondary);
    items.push(buildItem(secondary, tier, "secondary", 1, p.selectedPathwayId, weakSkillBySubject.get(secondary.subject), p.aliCompetencySignal?.[secondary.subject]));
  }

  // Review — a strong subject to maintain (different from primary + secondary)
  const reviewSubject = eligibleReport.subjects.find(
    (s) =>
      s.status === "strong" &&
      s.subject !== "mock-test" &&
      s.subject !== primary?.subject &&
      s.subject !== secondary?.subject
  );
  if (reviewSubject) {
    const tier =
      reviewSubject.subject === "english"
        ? englishTier
        : reviewSubject.subject === "maths"
        ? mathsTier
        : tierFromSubject(reviewSubject);
    items.push(buildItem(reviewSubject, tier, "review", 2, p.selectedPathwayId));
  }

  // Replay item — surface the most urgent weak skill if it targets a new subject.
  // Built directly from buildReplayQueue() (not getTopReplayItem(), which
  // returns the single top item unfiltered) so the Pathway Eligibility
  // Filter can be applied to the full queue before the top item is chosen —
  // report.skills (unlike report.subjects) has its own separate subject
  // mapping inside replayEngine.ts's SKILL_SUBJECT table, so filtering
  // eligibleReport.subjects alone would not have gated this candidate source.
  const eligibleReplayQueue = buildReplayQueue(p, report).filter((item) =>
    eligibleSubjectKeys.has(item.subject)
  );
  const topReplay = eligibleReplayQueue.length > 0 ? eligibleReplayQueue[0] : null;
  if (topReplay && items.length < 3) {
    const alreadyCovered = items.some((i) => i.subject === topReplay.subject);
    if (!alreadyCovered) {
      items.push({
        id: "mission-replay",
        subject: topReplay.subject,
        label: `Revise: ${topReplay.skillLabel}`,
        href: resolveSubjectHref(topReplay.subject, p.selectedPathwayId),
        reason: topReplay.reason,
        tier: "foundation",
        priority: "secondary",
        estimatedMinutes: 15,
      });
    }
  }

  // New Learner Experience Migration — the "/mock-test" nudge previously
  // recommended here has been retired (LEGACY_CONTENT_RETIREMENT_REGISTER.md
  // §5): that route hardcodes "The Lighthouse Mystery", explicitly named by
  // the Founder as content that must not be reintroduced into the active
  // learner journey. The /mock-test route itself is left un-deleted; this
  // was its only recommendation-engine reachability path. Real, evidence-led
  // mock recommendations are already handled separately by
  // lib/learningEngine/mockReadiness.ts for the CSSE pathway.

  const totalMinutes = items.reduce((sum, item) => sum + item.estimatedMinutes, 0);

  // Focus area + tagline
  let focusArea = "Balanced practice";
  let tagline = "Work across subjects consistently to build full 11+ readiness.";

  if (primary) {
    if (primary.status === "weak") {
      focusArea = `Fix your ${primary.label.toLowerCase()}`;
      tagline =
        "Targeted work on your weakest area. This is where exam marks are won or lost.";
    } else if (primary.status === "not-started") {
      focusArea = `Explore ${primary.label.toLowerCase()}`;
      tagline =
        "Broaden your practice. 11+ tests every subject, and gaps cost marks on the day.";
    } else if (primary.status === "developing") {
      focusArea = `Lift your ${primary.label.toLowerCase()}`;
      tagline =
        "You're close to the target. Focused practice now will push you into exam-ready territory.";
    } else {
      focusArea = "Maintain your standard";
      tagline = "Keep your strongest areas sharp while building the others.";
    }
  }

  return { items, totalMinutes, focusArea, tagline };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function computeAdaptiveState(
  progress: UserProgress,
  report: AnalyticsReport
): AdaptiveState {
  const engSubject = report.subjects.find((s) => s.subject === "english")!;
  const mathSubject = report.subjects.find((s) => s.subject === "maths")!;

  const englishTier = tierFromSubject(engSubject);
  const mathsTier = tierFromSubject(mathSubject);

  return {
    englishTier,
    mathsTier,
    recommendedEnglishLesson: pickEnglishLesson(englishTier, progress.completedLessons),
    recommendedMathsMode: pickMathsMode(report, progress.completedLessons),
    dailyMission: buildDailyMission(report, englishTier, mathsTier, progress),
  };
}
