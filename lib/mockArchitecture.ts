/**
 * Future mock test architecture — types and config only.
 * Full mock implementations are Phase 2C.
 *
 * GL and CEM mocks require: Verbal Reasoning, Non-Verbal Reasoning, English, Maths.
 * CSSE mock requires: English Comprehension, Creative Writing, Maths.
 * ISEB mock requires: English, Maths, Verbal Reasoning, Non-Verbal Reasoning (adaptive).
 */

export type MockPathway = "gl" | "cem" | "csse" | "iseb";

export interface MockPaper {
  id: string;
  pathway: MockPathway;
  name: string;
  durationMinutes: number;
  sections: MockSection[];
}

export interface MockSection {
  id: string;
  name: string;
  subject: string;
  questionCount: number;
  durationMinutes: number;
}

// ─── Mock config (no live questions yet) ─────────────────────────────────────

export const MOCK_CONFIG: Record<MockPathway, Omit<MockPaper, "id">> = {
  gl: {
    pathway: "gl",
    name: "GL Assessment Practice Mock",
    durationMinutes: 50,
    sections: [
      { id: "gl-english", name: "English", subject: "english", questionCount: 20, durationMinutes: 15 },
      { id: "gl-maths", name: "Maths", subject: "maths", questionCount: 20, durationMinutes: 15 },
      { id: "gl-vr", name: "Verbal Reasoning", subject: "verbal-reasoning", questionCount: 20, durationMinutes: 10 },
      { id: "gl-nvr", name: "Non-Verbal Reasoning", subject: "non-verbal-reasoning", questionCount: 20, durationMinutes: 10 },
    ],
  },
  cem: {
    pathway: "cem",
    name: "CEM Practice Mock",
    durationMinutes: 55,
    sections: [
      { id: "cem-literacy", name: "English & Literacy", subject: "english", questionCount: 25, durationMinutes: 20 },
      { id: "cem-numerical", name: "Numerical Reasoning", subject: "numerical-reasoning", questionCount: 20, durationMinutes: 20 },
      { id: "cem-vr", name: "Verbal Reasoning", subject: "verbal-reasoning", questionCount: 15, durationMinutes: 15 },
    ],
  },
  csse: {
    pathway: "csse",
    name: "CSSE Essex Practice Mock",
    durationMinutes: 90,
    sections: [
      { id: "csse-comprehension", name: "Comprehension", subject: "english", questionCount: 10, durationMinutes: 30 },
      { id: "csse-writing", name: "Creative Writing", subject: "writing", questionCount: 1, durationMinutes: 30 },
      { id: "csse-maths", name: "Maths", subject: "maths", questionCount: 25, durationMinutes: 30 },
    ],
  },
  iseb: {
    pathway: "iseb",
    name: "ISEB Pre-Test Practice Mock",
    durationMinutes: 60,
    sections: [
      { id: "iseb-english", name: "English", subject: "english", questionCount: 20, durationMinutes: 15 },
      { id: "iseb-maths", name: "Maths", subject: "maths", questionCount: 20, durationMinutes: 15 },
      { id: "iseb-vr", name: "Verbal Reasoning", subject: "verbal-reasoning", questionCount: 20, durationMinutes: 15 },
      { id: "iseb-nvr", name: "Non-Verbal Reasoning", subject: "non-verbal-reasoning", questionCount: 20, durationMinutes: 15 },
    ],
  },
};

export function getMockConfigForPathway(pathway: MockPathway): Omit<MockPaper, "id"> {
  return MOCK_CONFIG[pathway];
}
