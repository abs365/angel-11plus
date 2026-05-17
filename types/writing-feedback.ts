export interface SuggestedUpgrade {
  original: string;
  improved: string;
  explanation: string;
}

export interface WritingFeedback {
  strengths: [string, string];
  areasToImprove: string[];
  suggestedUpgrade: SuggestedUpgrade;
  tutorTip: string;
  overallScore: number;
}

export interface WritingFeedbackRequest {
  promptTitle: string;
  promptType: string;
  promptText: string;
  writingText: string;
  checkedItems: string[];
}
