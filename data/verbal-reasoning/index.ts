import { verbalReasoningBase } from "./base";
import { verbalAnalogyQuestions } from "./analogies";
import { verbalCodeQuestions } from "./codes";
import { verbalVocabularyQuestions } from "./vocabulary";
import { verbalHiddenWordQuestions } from "./hidden-words";
import { verbalSequenceQuestions } from "./sequences";
import type { ReasoningQuestion } from "@/types/reasoning";

export const verbalReasoningQuestions: ReasoningQuestion[] = [
  ...verbalReasoningBase,
  ...verbalAnalogyQuestions,
  ...verbalCodeQuestions,
  ...verbalVocabularyQuestions,
  ...verbalHiddenWordQuestions,
  ...verbalSequenceQuestions,
];
