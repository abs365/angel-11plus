"use client";

import { Compass } from "lucide-react";
import ReasoningSession from "@/components/ReasoningSession";
import { spatialReasoningQuestions } from "@/data/spatial-reasoning";

export default function SpatialReasoningPage() {
  return (
    <ReasoningSession
      subjectKey="spatial-reasoning"
      subjectName="Spatial Reasoning"
      description="Paper folding · 3D shapes · Symmetry · Rotation · Grid navigation"
      skillType="spatial-reasoning"
      themeColor="teal"
      icon={Compass}
      questions={spatialReasoningQuestions}
      skills={["Paper Folding", "3D Visualisation", "Symmetry", "Compass Directions", "Rotation", "Shape Properties", "Grid Navigation"]}
      examBoards="Independent Schools · ISEB"
    />
  );
}
