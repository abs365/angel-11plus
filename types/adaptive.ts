export type AdaptiveTier = "foundation" | "developing" | "advanced" | "challenge";

export interface MissionItem {
  id: string;
  subject: "english" | "maths" | "vocabulary" | "writing" | "mock-test";
  label: string;
  href: string;
  reason: string;
  tier: AdaptiveTier;
  priority: "primary" | "secondary" | "review";
  estimatedMinutes: number;
}

export interface DailyMission {
  items: MissionItem[];
  totalMinutes: number;
  focusArea: string;
  tagline: string;
}

export interface AdaptiveState {
  englishTier: AdaptiveTier;
  mathsTier: AdaptiveTier;
  recommendedEnglishLesson: string;
  recommendedMathsMode: "reasoning" | "arithmetic";
  dailyMission: DailyMission;
}
