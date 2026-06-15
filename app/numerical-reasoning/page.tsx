"use client";

import { Hash } from "lucide-react";
import ReasoningSession from "@/components/ReasoningSession";
import { numericalReasoningQuestions } from "@/data/numerical-reasoning";

export default function NumericalReasoningPage() {
  return (
    <ReasoningSession
      subjectKey="numerical-reasoning"
      subjectName="Numerical Reasoning"
      description="Number sequences · Data interpretation · Ratio · Function machines · Averages"
      skillType="numerical-reasoning"
      themeColor="rose"
      icon={Hash}
      questions={numericalReasoningQuestions}
      skills={["Number Sequences", "Number Analogies", "Percentages", "Ratio & Proportion", "Function Machines", "Missing Numbers", "Mean & Average", "Data Interpretation"]}
      examBoards="CEM · GL Assessment · ISEB"
    />
  );
}
