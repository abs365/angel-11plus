"use client";

import type { MockResult, MockPathwayId, MockAttemptInProgress } from "@/types/mock";
import { getProgress, saveProgress } from "./progress";

// Phase 4 Sprint 1, Increment 2 — a single in-progress-attempt slot, kept
// deliberately separate from mockResults[] (see MockAttemptInProgress's own
// doc comment in types/mock.ts). Only one attempt can be "in progress" at a
// time by design — starting a new one overwrites any prior slot, which is
// correct: a prior slot still present at that point was never completed,
// i.e. genuinely abandoned, and its absence of a matching MockResult is
// itself the durable record of that (no data is lost — mockResults[] is
// untouched either way).
const IN_PROGRESS_KEY = "angel11plus_mock_attempt_in_progress";

export function startMockAttempt(pathway: MockPathwayId, pathwayName: string): string {
  const id = `${pathway}-${Date.now()}`;
  if (typeof window !== "undefined") {
    const attempt: MockAttemptInProgress = { id, pathway, pathwayName, startedAt: new Date().toISOString() };
    localStorage.setItem(IN_PROGRESS_KEY, JSON.stringify(attempt));
  }
  return id;
}

// Phase 4 Sprint 1, Increment 4 — read APIs return a Promise
// (MOCK_ATTEMPT_LEDGER_SPECIFICATION_V1.md §8): every consumer already
// reads this data inside a useEffect+useState, the same pattern
// fetchQuestionBank() callers use elsewhere, so this is a signature change
// only — the storage underneath is still localStorage (via getProgress()),
// no behaviour change. This is what lets a future backend swap (Blueprint
// B2.1) happen behind these same signatures, with zero further caller
// changes.
export async function getInProgressMockAttempt(): Promise<MockAttemptInProgress | null> {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(IN_PROGRESS_KEY);
    return stored ? (JSON.parse(stored) as MockAttemptInProgress) : null;
  } catch {
    return null;
  }
}

async function clearInProgressMockAttempt(id: string): Promise<void> {
  if (typeof window === "undefined") return;
  const current = await getInProgressMockAttempt();
  // Only clear if it's the same attempt — a stale slot from an earlier,
  // already-abandoned attempt must not be silently cleared by a later,
  // unrelated attempt's completion.
  if (current?.id === id) {
    localStorage.removeItem(IN_PROGRESS_KEY);
  }
}

export async function abandonMockAttempt(id: string): Promise<void> {
  await clearInProgressMockAttempt(id);
}

/** Completes the lifecycle: clears the in-progress slot (if it matches) and appends the finished result — same storage write saveMockResult() already made, now lifecycle-aware. */
export async function completeMockAttempt(result: MockResult): Promise<void> {
  await clearInProgressMockAttempt(result.id);
  saveMockResult(result);
}

export function saveMockResult(result: MockResult): void {
  const p = getProgress();
  const existing = p.mockResults ?? [];
  saveProgress({ ...p, mockResults: [...existing, result] });
}

/**
 * Founder Validation Isolation — checks both the real, current field
 * (`source`) and, for records saved before this field existed, the
 * consistent `founder-validation-` id prefix every Founder Validation
 * attempt has always used. This is a read-time reclassification, not a
 * data migration: no stored record is rewritten or deleted, so existing
 * evidence is preserved exactly, per the governing instruction's "do not
 * delete legitimate historical evidence without analysis." No real
 * learner mock attempt has ever produced an id with this prefix, so this
 * cannot misclassify a genuine attempt.
 */
export function isFounderValidationResult(result: MockResult): boolean {
  return result.source === "founder-validation" || result.id.startsWith("founder-validation-");
}

/**
 * The single shared read path every mock-history/best-score/readiness
 * consumer already goes through — filtering Founder Validation attempts
 * out here (rather than at each of the ~4 separate call sites that
 * display or aggregate MockResult[]) is the smallest correct isolation
 * mechanism: every existing and future consumer is protected with zero
 * additional filtering logic of its own.
 */
export async function getMockResults(): Promise<MockResult[]> {
  const all = getProgress().mockResults ?? [];
  return all.filter((r) => !isFounderValidationResult(r));
}

export async function getLastMockResult(): Promise<MockResult | null> {
  const results = await getMockResults();
  return results.length > 0 ? results[results.length - 1] : null;
}

/**
 * Pure, synchronous — shared by getBestMockScoreForPathway() below and by
 * any caller that already holds a fetched MockResult[] (e.g. a page needing
 * scores for several pathways, or both count and best for one, from a
 * single getMockResults() read rather than one redundant read per value).
 */
export function bestScoreForPathway(results: MockResult[], pathway: MockPathwayId): number | null {
  const filtered = results.filter((r) => r.pathway === pathway);
  return filtered.length > 0 ? Math.max(...filtered.map((r) => r.totalScore)) : null;
}

/** Pure, synchronous — see bestScoreForPathway() above. */
export function countForPathway(results: MockResult[], pathway: MockPathwayId): number {
  return results.filter((r) => r.pathway === pathway).length;
}

export async function getBestMockScoreForPathway(pathway: MockPathwayId): Promise<number | null> {
  return bestScoreForPathway(await getMockResults(), pathway);
}

export async function getMockCountForPathway(pathway: MockPathwayId): Promise<number> {
  return countForPathway(await getMockResults(), pathway);
}
