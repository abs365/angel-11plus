import type { UserProgress, SkillType } from "@/types";
import type { AnalyticsReport } from "@/types/analytics";
import type { ReplayItem } from "@/types/adaptiveDifficulty";

// ─── Skill → subject/href maps ────────────────────────────────────────────────

const SKILL_SUBJECT: Partial<Record<SkillType, ReplayItem["subject"]>> = {
  inference:     "english",
  evidence:      "english",
  explanation:   "english",
  atmosphere:    "english",
  character:     "english",
  structure:     "english",
  vocabulary:    "vocabulary",
  arithmetic:    "maths",
  reasoning:     "maths",
  "word-problem": "maths",
  pattern:       "maths",
  fractions:     "maths",
  writing:       "writing",
  "verbal-reasoning":     "verbal-reasoning",
  "non-verbal-reasoning": "non-verbal-reasoning",
  "spatial-reasoning":    "spatial-reasoning",
  "numerical-reasoning":  "numerical-reasoning",
};

const SKILL_HREF: Partial<Record<SkillType, string>> = {
  inference:     "/english",
  evidence:      "/english",
  explanation:   "/english",
  atmosphere:    "/english",
  character:     "/english",
  structure:     "/english",
  vocabulary:    "/vocabulary",
  arithmetic:    "/maths",
  reasoning:     "/maths",
  "word-problem": "/maths",
  pattern:       "/maths",
  fractions:     "/maths",
  writing:       "/writing",
  "verbal-reasoning":     "/verbal-reasoning",
  "non-verbal-reasoning": "/non-verbal-reasoning",
  "spatial-reasoning":    "/spatial-reasoning",
  "numerical-reasoning":  "/numerical-reasoning",
};

const REPLAY_REASONS: Partial<Record<SkillType, string>> = {
  inference:      "Inference questions require direct text evidence for every point — revisit to practise quoting precisely.",
  evidence:       "Evidence retrieval is below target — keep quotes short (3–5 words) and exactly as written.",
  explanation:    "Explanation answers need clearer connectives — use 'because', 'therefore' and 'this shows' to build structure.",
  atmosphere:     "Atmosphere questions need at least two named techniques per answer — revisit to practise identifying them.",
  character:      "Character analysis is weak — link what characters do to what they feel or want.",
  structure:      "Structure answers should explain WHY an author uses each feature, not just name it.",
  vocabulary:     "Vocabulary gaps are showing — a focused flashcard session will recover marks quickly.",
  arithmetic:     "Arithmetic accuracy needs work — use column methods consistently to reduce place-value errors.",
  reasoning:      "Maths reasoning is below target — write every working step before reaching a final answer.",
  "word-problem": "Word problems need attention — underline the question first, then choose your operation.",
  pattern:        "Sequences are weak — write each term out explicitly before looking for the rule.",
  fractions:      "Fractions accuracy is low — find a common denominator as the very first step, every time.",
  writing:        "Writing feedback shows room to improve — use the checklist actively while writing, not after.",
  "verbal-reasoning":     "Verbal Reasoning needs work — focus on identifying word patterns and letter codes before answering.",
  "non-verbal-reasoning": "Non-Verbal Reasoning is below target — look for rotation, reflection and counting rules in each pattern.",
  "spatial-reasoning":    "Spatial Reasoning needs attention — practise folding and rotation mentally before attempting each question.",
  "numerical-reasoning":  "Numerical Reasoning needs focus — read each question twice and identify the mathematical relationship first.",
};

// ─── Public API ───────────────────────────────────────────────────────────────

export function buildReplayQueue(
  p: UserProgress,
  report: AnalyticsReport
): ReplayItem[] {
  const items: ReplayItem[] = [];
  let counter = 0;

  // 1. Weak skills from detailed skill-score tracking
  for (const skill of report.skills) {
    if (skill.status !== "weak") continue;
    const subject = SKILL_SUBJECT[skill.skill];
    const href = SKILL_HREF[skill.skill];
    if (!subject || !href) continue;

    const rec = p.skillScores?.[skill.skill];
    const missCount = rec ? rec.attempted - rec.correct : 0;
    // Higher miss count and lower accuracy = higher urgency
    const urgency = Math.min(100, Math.round(100 - skill.estimatedAccuracy + missCount * 4));

    items.push({
      id: `replay-skill-${counter++}`,
      subject,
      skillLabel: skill.label,
      href,
      urgency,
      reason: REPLAY_REASONS[skill.skill] ??
        `Your ${skill.label.toLowerCase()} accuracy is ${skill.estimatedAccuracy}% — focused practice will close this gap.`,
    });
  }

  // 2. Weak subjects without detailed skill data (e.g. vocabulary, writing)
  for (const subj of report.subjects) {
    if (subj.status !== "weak" || subj.attempts === 0) continue;
    if (subj.subject === "mock-test") continue;
    // Skip if already covered by skill-level items
    if (items.some((i) => i.subject === subj.subject)) continue;

    const urgency = Math.min(100, Math.round(100 - subj.avgScore));
    items.push({
      id: `replay-subject-${counter++}`,
      subject: subj.subject as ReplayItem["subject"],
      skillLabel: subj.label,
      href: `/${subj.subject}`,
      urgency,
      reason: `Your ${subj.label.toLowerCase()} score is ${subj.avgScore}% — a revision session will rebuild confidence here.`,
    });
  }

  return items.sort((a, b) => b.urgency - a.urgency).slice(0, 5);
}

export function getTopReplayItem(
  p: UserProgress,
  report: AnalyticsReport
): ReplayItem | null {
  const queue = buildReplayQueue(p, report);
  return queue.length > 0 ? queue[0] : null;
}
