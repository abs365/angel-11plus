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
