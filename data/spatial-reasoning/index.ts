import { spatialReasoningBase } from "./base";
import { srFoldingQuestions } from "./folding";
import { srNavigationQuestions } from "./navigation";
import { srShapeQuestions } from "./shapes";
import type { ReasoningQuestion } from "@/types/reasoning";

export const spatialReasoningQuestions: ReasoningQuestion[] = [
  ...spatialReasoningBase,
  ...srFoldingQuestions,
  ...srNavigationQuestions,
  ...srShapeQuestions,
];
