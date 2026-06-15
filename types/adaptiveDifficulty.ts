import type { AdaptiveTier } from "./adaptive";

export interface SubjectConfidence {
  subject: string;
  score: number;        // 0–100, overall confidence
  accuracy: number;     // 0–100, score-based component
  consistency: number;  // 0–100, attempt+streak-based component
  tier: AdaptiveTier;
}

export interface ReplayItem {
  id: string;
  subject: "english" | "maths" | "vocabulary" | "writing" | "mock-test"
    | "verbal-reasoning" | "non-verbal-reasoning" | "spatial-reasoning" | "numerical-reasoning";
  skillLabel: string;
  href: string;
  urgency: number;   // 0–100, higher = more urgent to revisit
  reason: string;
}

export interface AdaptiveProfile {
  subjectConfidence: SubjectConfidence[];
  overallConfidence: number;
  replayQueue: ReplayItem[];
}
