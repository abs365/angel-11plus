import { numericalReasoningBase } from "./base";
import { nrSequenceQuestions } from "./sequences";
import { nrArithmeticQuestions } from "./arithmetic";
import { nrDataQuestions } from "./data";
import type { ReasoningQuestion } from "@/types/reasoning";

export const numericalReasoningQuestions: ReasoningQuestion[] = [
  ...numericalReasoningBase,
  ...nrSequenceQuestions,
  ...nrArithmeticQuestions,
  ...nrDataQuestions,
];
