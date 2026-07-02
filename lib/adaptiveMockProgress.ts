"use client";

import type { AdaptiveMockResult } from "@/types/mock";

// Deliberately a separate storage key from lib/mockProgress.ts's
// "angel11plus_progress" mockResults array — AdaptiveMockResult is a
// distinct type (types/mock.ts) so neither can silently affect the other's
// consumers. See ADAPTIVE_ASSESSMENT_ENGINE_IMPLEMENTATION_PLAN.md §5.
const KEY = "angel11plus_adaptive_mock_results";

export function getAdaptiveMockResults(): AdaptiveMockResult[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(KEY);
    if (!stored) return [];
    return JSON.parse(stored) as AdaptiveMockResult[];
  } catch {
    return [];
  }
}

export function saveAdaptiveMockResult(result: AdaptiveMockResult): void {
  if (typeof window === "undefined") return;
  const existing = getAdaptiveMockResults();
  localStorage.setItem(KEY, JSON.stringify([...existing, result]));
}
