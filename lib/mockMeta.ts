import type { MockPathwayId } from "@/types/mock";

/**
 * Sprint 6 (Mock Centre Experience) — presentation-only per-pathway copy for
 * the Mock Centre Home and Pre-Exam Experience. Same convention as
 * lib/subjectMeta.ts: display text only, never a calculation, and never
 * touches mock scoring/section config in app/mocks/[pathway]/page.tsx.
 */
export const MOCK_SUGGESTED_PREPARATION: Record<MockPathwayId, string> = {
  gl: "Find a quiet 35-minute block, have rough paper ready, and treat each section's timer as final — just like exam day.",
  cem: "CEM papers move quickly between question types — stay calm if a question feels unfamiliar and keep pace with the clock.",
  csse: "Have rough paper ready for the Mathematics section and read each English passage carefully before answering.",
  iseb: "Four back-to-back sections — pace yourself evenly rather than rushing the first one.",
};

export const MOCK_ADMISSION_RELEVANCE: Record<MockPathwayId, string> = {
  gl: "Mirrors the real GL Assessment format and timing — the closest rehearsal for exam-day pacing.",
  cem: "Builds the fast, adaptive-style thinking CEM papers are known for.",
  csse: "Practises switching between English and Mathematics under time pressure, as CSSE papers require.",
  iseb: "Builds stamina across four consecutive reasoning sections, matching the real Pre-Test structure.",
};
