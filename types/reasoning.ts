import type { SkillType } from "./index";

export interface ReasoningQuestion {
  id: string;
  question: string;
  answer: string;
  alternatives?: string[];
  explanation: string;
  hint?: string;
  skill: SkillType;
  category: string;
  marks: number;
}
