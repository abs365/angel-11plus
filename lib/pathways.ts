import type { Pathway, PathwayId } from "@/types/pathway";

export const PATHWAYS: Pathway[] = [
  {
    id: "gl",
    name: "GL Assessment",
    shortName: "GL",
    description:
      "The most widely used 11+ format in England, used by grammar schools across many counties including Hertfordshire, Bucks, Kent and Lincolnshire.",
    subjects: ["English", "Maths", "Verbal Reasoning", "Non-Verbal Reasoning"],
    recommendedYears: "Year 5–6",
    examFormatNotes:
      "Multiple-choice format. Two to four papers typically sat in Year 6 Autumn term.",
    badge: "Most Popular",
    accentColor: "blue",
  },
  {
    id: "cem",
    name: "CEM (Durham University)",
    shortName: "CEM",
    description:
      "Used by grammar schools in Birmingham, Kent, Bucks and others. Focuses more on literacy and comprehension than pure reasoning.",
    subjects: ["English & Literacy", "Maths & Numerical Reasoning", "Verbal Reasoning"],
    recommendedYears: "Year 5–6",
    examFormatNotes:
      "Adaptive-style papers. Fewer pure non-verbal questions. Harder to specifically 'drill' due to variety.",
    badge: "Grammar Schools",
    accentColor: "indigo",
  },
  {
    id: "csse",
    name: "CSSE (Essex)",
    shortName: "CSSE",
    description:
      "Used by selective grammar schools in Essex. Extended written responses required alongside comprehension and maths.",
    subjects: ["English Comprehension", "Creative Writing", "Maths", "Vocabulary"],
    recommendedYears: "Year 5–6",
    examFormatNotes:
      "Two papers: English (comprehension + writing) and Maths. No separate reasoning paper.",
    badge: "Essex",
    accentColor: "purple",
  },
  {
    id: "iseb",
    name: "ISEB Pre-Test",
    shortName: "ISEB",
    description:
      "Common Pre-Test used by many independent senior schools including Eton, Harrow, Wycombe Abbey and others.",
    subjects: ["English", "Maths", "Verbal Reasoning", "Non-Verbal Reasoning"],
    recommendedYears: "Year 6–7",
    examFormatNotes:
      "Online adaptive test. Typically sat in Year 7 entry cycle. Adaptive difficulty adjusts to each student.",
    badge: "Independent Schools",
    accentColor: "emerald",
  },
  {
    id: "independent",
    name: "Independent / Bespoke",
    shortName: "Independent",
    description:
      "For independent schools that set their own entrance papers. Format, subjects and style vary significantly by school.",
    subjects: ["English", "Maths", "Writing", "Comprehension"],
    recommendedYears: "Year 5–7",
    examFormatNotes:
      "Varies by school. Many include a written component and interview. Check your target school directly.",
    badge: "Bespoke",
    accentColor: "amber",
  },
  {
    id: "core-foundation",
    name: "Core 11+ Foundation",
    shortName: "Core",
    description:
      "Build a strong base across all 11+ skills before specialising. The best starting point for children in Year 4 or early Year 5.",
    subjects: ["English", "Maths", "Vocabulary", "Writing", "Reasoning"],
    recommendedYears: "Year 4–5",
    examFormatNotes:
      "Not exam-board specific. Covers all key skills to build confidence before a pathway is chosen.",
    badge: "Start Here",
    accentColor: "teal",
  },
  {
    id: "not-sure",
    name: "Not Sure Yet",
    shortName: "Exploring",
    description:
      "Not sure which pathway applies? No problem. We cover all key 11+ skills and you can update your pathway at any time.",
    subjects: ["English", "Maths", "Vocabulary", "Writing"],
    recommendedYears: "Any year group",
    examFormatNotes:
      "We recommend checking with your target school to confirm which exam board they use.",
    badge: "Flexible",
    accentColor: "gray",
  },
];

export function getPathwayById(id: PathwayId | string): Pathway | undefined {
  return PATHWAYS.find((p) => p.id === id);
}
