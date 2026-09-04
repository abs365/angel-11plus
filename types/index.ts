export type Difficulty = "year4-foundation" | "advanced-year4" | "year5-core" | "year5-advanced" | "year6-exam";

export type SkillType =
  | "inference"
  | "evidence"
  | "vocabulary"
  | "explanation"
  | "atmosphere"
  | "character"
  | "structure"
  | "arithmetic"
  | "reasoning"
  | "word-problem"
  | "pattern"
  | "fractions"
  | "writing"
  | "verbal-reasoning"
  | "non-verbal-reasoning"
  | "spatial-reasoning"
  | "numerical-reasoning";

export interface Question {
  id: string;
  question: string;
  skill: SkillType;
  marks: number;
  hint?: string;
  modelAnswer?: string;
}

export interface Lesson {
  id: string;
  title: string;
  subject: "english" | "maths" | "vocabulary" | "writing";
  difficulty: Difficulty;
  estimatedMinutes: number;
  passage?: string;
  questions: Question[];
}

export interface VocabWord {
  id: string;
  word: string;
  definition: string;
  synonyms: string[];
  antonyms: string[];
  exampleSentence: string;
  difficulty: Difficulty;
  category: "tier2" | "tier3" | "literary";
}

export interface WritingPrompt {
  id: string;
  title: string;
  prompt: string;
  type: "narrative" | "descriptive" | "persuasive";
  difficulty: Difficulty;
  checklist: string[];
  timeMinutes: number;
}

/**
 * Programme Increment 020, Part 11 — the smallest additive shape for an
 * optional deterministic, renderable geometry diagram attached to a
 * question's own `prompt` jsonb (as `prompt.diagram`). NOT a new database
 * column, same precedent as `MockTableStimulus` (lib/mockAttempt/types.ts):
 * `prompt` is already jsonb, so an absent `diagram` key is
 * indistinguishable from "no diagram," and every existing row (which never
 * sets this key) behaves exactly as before. Deliberately scoped to
 * rectilinear (right-angled) compound shapes only — the genuine gap this
 * increment's own audit found ("zero diagrams, images, or charts anywhere
 * in Mathematics content") — not a general-purpose geometry engine.
 * Rendered by components/practice/CompoundShapeDiagram.tsx as plain
 * inline SVG from these coordinates; never a stock image or upload.
 */
export interface CompoundRectilinearDiagram {
  type: "compound_rectilinear";
  /** Ordered polygon vertices tracing the shape's outline (a simple, non-self-intersecting rectilinear polygon), in arbitrary proportion-only grid units -- the renderer scales these to fit, they are not to physical scale. */
  vertices: { x: number; y: number }[];
  /** One label per shown edge, keyed by the index of the edge running from vertices[edgeIndex] to vertices[(edgeIndex+1) % vertices.length]. A known length (e.g. "8 m") or "?" for the side the learner must find -- never every edge, since a rectilinear shape's remaining edges are always inferable from the ones given. */
  edgeLabels: { edgeIndex: number; label: string }[];
}

export interface MathsQuestion {
  id: string;
  question: string;
  answer: number | string;
  skill: SkillType;
  difficulty: Difficulty;
  workingSteps?: string[];
  marks: number;
  /** Optional deterministic geometry diagram -- see CompoundRectilinearDiagram's own docstring. Absent for every question outside this increment's new compound-shape family. */
  diagram?: CompoundRectilinearDiagram;
}

export interface SkillRecord {
  correct: number;
  attempted: number;
}

export interface UserProgress {
  xp: number;
  streak: number;
  completedLessons: string[];
  scores: Record<string, number>;
  lastActivity: string;
  skillScores?: Partial<Record<SkillType, SkillRecord>>;
  earnedBadgeIds?: string[];
  weeklyStats?: { weekStart: string; sessions: number };
  selectedPathwayId?: string;
  /**
   * Work Package WP-09 — target exam date (EAW-004 §2.1, Defect Correction
   * EAW-D001). Parent/guardian-supplied, optional, never asked of the
   * child. Powers Recommendation Orchestration's Tier 3 exam-proximity
   * reweighting (lib/ali/recommendationOrchestration.ts) — absent by
   * default, and Tier 3 simply does not activate when it's absent, per
   * EAW-004 §2.1's explicit "behaviour when absent" specification.
   */
  targetExamDate?: string;
  /**
   * Programme Increment 008B (Exam Intelligence + Preparation Clock
   * Product Integration) — provenance for targetExamDate above. Every
   * date this codebase has ever stored here has, in fact, always been
   * "parent_supplied" (WP-09's own docstring: "a family's own stated date
   * is direct evidence"); this field makes that honest rather than
   * implicit, and gives the product a place to represent an eventual
   * OFFICIAL (CSSE-published) date differently, without ever silently
   * upgrading a parent's guess into a claimed official fact. Absent
   * (undefined) is treated as "unknown provenance," never inferred as
   * official.
   */
  targetExamDateProvenance?: "official" | "parent_supplied" | "estimated" | "unknown";
  /**
   * Programme Increment 008B — parent-supplied school year, reusing
   * lib/learningEngine/preparationStage.ts's own existing SchoolYear type
   * (no new type invented). Optional, never asked of the child. Feeds
   * derivePreparationStage()'s schoolYear parameter, which until this
   * increment was never populated by any real caller (a disclosed 007W
   * gap) — its own documented convention already treats undefined as
   * "developmentally eligible for late-stage work," the safe default,
   * so leaving this unset changes nothing about existing behaviour.
   */
  schoolYear?: import("../lib/learningEngine/preparationStage").SchoolYear;
  mockResults?: import("./mock").MockResult[];
  // ALI competency bridge (Phase ALI 1.3) — additive only, does not touch
  // `scores`/the Math.max ratchet. Keyed by ALI subject.
  aliCompetencySignal?: Partial<Record<string, import("./ali/missionSignal").AliCompetencySignal>>;
  // ALI Learning Gain (Phase ALI 1.4) — internal only, not read by any UI
  // in this phase. Keyed by ALI subject.
  aliLearningGain?: Partial<Record<string, import("./ali/learningGain").LearningGainSnapshot>>;
  // ALI Learning Profile (Foundation Completion, Part 3) — derived
  // interpretation of the two signals above, not a new source of truth.
  // Internal only, not read by any UI yet. Not subject-keyed (it's a
  // cross-subject summary of the whole student, unlike the two above).
  aliLearningProfile?: import("./ali/learningProfile").LearningProfile;
}
