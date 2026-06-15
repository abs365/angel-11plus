export type PathwayId =
  | "gl"
  | "cem"
  | "csse"
  | "iseb"
  | "independent"
  | "core-foundation"
  | "not-sure";

export interface Pathway {
  id: PathwayId;
  name: string;
  shortName: string;
  description: string;
  subjects: string[];
  recommendedYears: string;
  examFormatNotes: string;
  badge: string;
  accentColor: "blue" | "indigo" | "purple" | "emerald" | "amber" | "teal" | "gray";
}
