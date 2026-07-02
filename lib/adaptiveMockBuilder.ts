import type { AdaptiveTier } from "@/types/adaptive";
import type { BankQuestion, ContentDifficulty } from "@/types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "@/types/ali/history";
import type { MockGenerationTrace } from "@/types/ali/observability";
import { selectQuestions } from "./ali/selection";
import { deriveWeakCompetencies } from "./ali/weakness";

/**
 * Tier -> difficulty distribution (ADAPTIVE_ASSESSMENT_ENGINE_IMPLEMENTATION_
 * PLAN.md §4.2). First slice applies one tier to the whole subject
 * (ALI_DECISION_LOG.md Decision 15 — subject-level difficulty, not
 * competency-level, to prove the architecture before extending it).
 */
const TIER_DISTRIBUTION: Record<AdaptiveTier, Record<ContentDifficulty, number>> = {
  foundation: { easy: 0.5, medium: 0.35, hard: 0.15, challenge: 0 },
  developing: { easy: 0.2, medium: 0.5, hard: 0.25, challenge: 0.05 },
  advanced: { easy: 0.05, medium: 0.3, hard: 0.5, challenge: 0.15 },
  challenge: { easy: 0, medium: 0.15, hard: 0.45, challenge: 0.4 },
};

const DIFFICULTIES: ContentDifficulty[] = ["easy", "medium", "hard", "challenge"];

function distributionCounts(tier: AdaptiveTier, count: number): Record<ContentDifficulty, number> {
  const pct = TIER_DISTRIBUTION[tier];
  const raw = DIFFICULTIES.map((d) => pct[d] * count);
  const floors = raw.map(Math.floor);
  const remainder = count - floors.reduce((a, b) => a + b, 0);

  const fractional = raw
    .map((v, i) => ({ i, frac: v - floors[i] }))
    .sort((a, b) => b.frac - a.frac);
  for (let k = 0; k < remainder; k++) {
    floors[fractional[k % floors.length].i] += 1;
  }

  const result = {} as Record<ContentDifficulty, number>;
  DIFFICULTIES.forEach((d, i) => {
    result[d] = floors[i];
  });
  return result;
}

export interface AdaptiveSectionResult {
  questions: BankQuestion[];
  trace: MockGenerationTrace;
}

/**
 * Assembles one adaptive mock section — the sole consumer of lib/ali/*
 * (ALI_DECISION_LOG.md Decision 8/12: mock assembly is one consumer of
 * Angel Learning Intelligence, not the whole system). Pure function given
 * pre-fetched bank/history; all Supabase I/O happens in the caller
 * (lib/ali/questionBank.ts, lib/ali/history.ts).
 *
 * Also returns a MockGenerationTrace (Phase ALI 1.1 observability) —
 * internal/debugging only, see lib/ali/observability.ts's logSelectionTrace().
 */
export function buildAdaptiveSection(
  bank: BankQuestion[],
  history: Map<string, StudentQuestionHistoryRow>,
  currentSequence: number,
  tier: AdaptiveTier,
  count: number,
  sectionId: string = "adaptive-section",
  random: () => number = Math.random
): AdaptiveSectionResult {
  const weakSkills = deriveWeakCompetencies(bank, history);
  const targetCounts = distributionCounts(tier, count);

  const selected: BankQuestion[] = [];
  const usedIds = new Set<string>();
  const traceEntries: MockGenerationTrace["entries"] = [];

  for (const difficulty of DIFFICULTIES) {
    const target = targetCounts[difficulty];
    if (target === 0) continue;
    const candidates = bank.filter((q) => q.contentDifficulty === difficulty && !usedIds.has(q.id));
    const { questions: picked, trace } = selectQuestions(candidates, history, currentSequence, weakSkills, target, random);
    for (const q of picked) usedIds.add(q.id);
    selected.push(...picked);
    traceEntries.push(...trace);
  }

  // Top-up if a sparse bank (e.g. the Slice 1 synthetic fixture, or an
  // early-stage real bank) couldn't fill every difficulty bucket exactly —
  // never a steady-state concern once the bank grows (architecture §7).
  if (selected.length < count) {
    const remainingCandidates = bank.filter((q) => !usedIds.has(q.id));
    const { questions: topUp, trace } = selectQuestions(
      remainingCandidates,
      history,
      currentSequence,
      weakSkills,
      count - selected.length,
      random
    );
    selected.push(...topUp);
    traceEntries.push(...trace);
  }

  return {
    questions: selected,
    trace: {
      generatedAt: new Date().toISOString(),
      sectionId,
      confidenceInfluence: { tier, targetDistribution: targetCounts },
      entries: traceEntries,
    },
  };
}
