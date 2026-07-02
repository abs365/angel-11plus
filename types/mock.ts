export type MockPathwayId = "gl" | "cem" | "csse" | "iseb";

export interface MockSectionResult {
  sectionId: string;
  sectionName: string;
  bank: string;
  correct: number;
  total: number;
  score: number;
}

export interface MockResult {
  id: string;
  pathway: MockPathwayId;
  pathwayName: string;
  date: string;
  totalScore: number;
  sectionResults: MockSectionResult[];
  durationMinutes: number;
}

/**
 * Result of an Angel Learning Intelligence (ALI) adaptive mock — separate
 * from MockResult so a future change to one never silently affects the
 * other's consumers (getMockResults(), getBestMockScoreForPathway(), etc.
 * in lib/mockProgress.ts continue to read only MockResult).
 * See ADAPTIVE_ASSESSMENT_ENGINE_IMPLEMENTATION_PLAN.md §5.
 */
export interface AdaptiveMockSectionResult extends MockSectionResult {
  adaptive: boolean; // true for sections built via ALI, false for sections still using the static slice
}

export interface AdaptiveMockResult {
  id: string;
  pathway: MockPathwayId;
  pathwayName: string;
  date: string;
  totalScore: number;
  sectionResults: AdaptiveMockSectionResult[];
  durationMinutes: number;
}
