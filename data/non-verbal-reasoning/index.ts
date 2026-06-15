import { nonVerbalReasoningBase } from "./base";
import { nvrPatternQuestions } from "./patterns";
import { nvrGeometryQuestions } from "./geometry";
import type { ReasoningQuestion } from "@/types/reasoning";

export const nonVerbalReasoningQuestions: ReasoningQuestion[] = [
  ...nonVerbalReasoningBase,
  ...nvrPatternQuestions,
  ...nvrGeometryQuestions,
];
