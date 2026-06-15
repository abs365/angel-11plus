"use client";

import { Puzzle } from "lucide-react";
import ReasoningSession from "@/components/ReasoningSession";
import { verbalReasoningQuestions } from "@/data/verbal-reasoning";

export default function VerbalReasoningPage() {
  return (
    <ReasoningSession
      subjectKey="verbal-reasoning"
      subjectName="Verbal Reasoning"
      description="Word analogies · Letter codes · Hidden words · Sequences · Vocabulary"
      skillType="verbal-reasoning"
      themeColor="violet"
      icon={Puzzle}
      questions={verbalReasoningQuestions}
      skills={["Word Analogies", "Letter Codes", "Hidden Words", "Odd One Out", "Compound Words", "Antonyms & Synonyms", "Letter Sequences"]}
      examBoards="GL Assessment · CEM · ISEB"
    />
  );
}
