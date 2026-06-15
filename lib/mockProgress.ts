"use client";

import type { MockResult, MockPathwayId } from "@/types/mock";
import { getProgress, saveProgress } from "./progress";

export function saveMockResult(result: MockResult): void {
  const p = getProgress();
  const existing = p.mockResults ?? [];
  saveProgress({ ...p, mockResults: [...existing, result] });
}

export function getMockResults(): MockResult[] {
  return getProgress().mockResults ?? [];
}

export function getLastMockResult(): MockResult | null {
  const results = getMockResults();
  return results.length > 0 ? results[results.length - 1] : null;
}

export function getBestMockScoreForPathway(pathway: MockPathwayId): number | null {
  const results = getMockResults().filter((r) => r.pathway === pathway);
  if (results.length === 0) return null;
  return Math.max(...results.map((r) => r.totalScore));
}

export function getMockCountForPathway(pathway: MockPathwayId): number {
  return getMockResults().filter((r) => r.pathway === pathway).length;
}
