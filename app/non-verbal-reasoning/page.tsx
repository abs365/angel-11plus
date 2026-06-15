"use client";

import { Shapes } from "lucide-react";
import ReasoningSession from "@/components/ReasoningSession";
import { nonVerbalReasoningQuestions } from "@/data/non-verbal-reasoning";

export default function NonVerbalReasoningPage() {
  return (
    <ReasoningSession
      subjectKey="non-verbal-reasoning"
      subjectName="Non-Verbal Reasoning"
      description="Pattern grids · Rotation · Reflection · Shape properties · Symbol codes"
      skillType="non-verbal-reasoning"
      themeColor="cyan"
      icon={Shapes}
      questions={nonVerbalReasoningQuestions}
      skills={["Pattern Grids", "Symbol Sequences", "Rotation", "Reflection", "3D Shapes & Nets", "Shape Counting", "Pattern Rules"]}
      examBoards="GL Assessment · ISEB"
    />
  );
}
