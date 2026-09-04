import type { BankQuestion, ContentDifficulty } from "@/types/ali/questionBank";
import type { CompetencyId, QuestionTypeId } from "@/lib/learningEngine/types";
import { QUESTION_TYPE_PRIMARY_COMPETENCY } from "@/lib/learningEngine/assessmentBrainMap";
import type { InventoryClassification } from "./inventoryClass";

/**
 * Programme Increment 019, Part 7 — Question Family Registry Foundation.
 *
 * Mathematics already has 73 real `family_id` values (migration 030,
 * confirmed live in production — Increment 018's own reconciliation). This
 * module does NOT replace them: `deriveFamilyRecordFromQuestions()` below
 * is a pure function over the SAME `family_id`-grouped rows already in
 * `ali_question_bank`, formalising what can be derived from trustworthy
 * existing metadata into one canonical shape, and marking everything else
 * `"unclassified"` explicitly rather than fabricated — per this
 * increment's own instruction: "Do not populate fabricated metadata
 * merely to make fields non-null."
 *
 * Every field below traces to a real, cited source, or is honestly
 * unclassified:
 *   - subject/competencyId/answerType/difficultyRange/generationMode ->
 *     derived from real ali_question_bank columns this session verified
 *     (subject, skill via QUESTION_TYPE_PRIMARY_COMPETENCY, question_type,
 *     content_difficulty) — see Increment 016-018's own schema audits.
 *   - inventoryClass -> delegated to lib/ali/inventoryClass.ts, itself
 *     honest about what it cannot classify.
 *   - subskill/conceptualObjective/misconceptionTarget/representationType/
 *     reasoningDepth/contextFamily/reviewState/variationStrategy ->
 *     "unclassified" today. No trustworthy existing source populates any
 *     of these for the 73 live Mathematics families (confirmed: no
 *     misconception-taxonomy table, no context-tagging column, no
 *     reasoning-depth field exists anywhere in the schema this programme
 *     has audited across Increments 017-018). Populating them here would
 *     be exactly the fabrication this instruction forbids.
 */

export type GenerationMode = "hand_authored" | "parametric_generated" | "unclassified";

/**
 * Content Quality Constitution vocabulary (Part 11) — see
 * docs/intelligence/CONTENT_SCALE_FOUNDATION_V1.md for the full
 * definition of each value and what evidence it provides. Kept here, not
 * duplicated, since a family's own registry record is where this
 * classification is actually consumed.
 */
export type VariationStrategy =
  | "parametric_variant"
  | "context_variant"
  | "representation_variant"
  | "difficulty_variant"
  | "reasoning_variant"
  | "genuinely_distinct_family"
  | "unclassified";

export interface QuestionFamilyRecord {
  familyId: string;
  subject: "maths" | "english" | "writing";
  /** The competency every row in this family resolves to, IF they all agree — null when the family spans more than one competency (a real possibility this function detects rather than silently picking one). */
  competencyId: CompetencyId | null;
  subskill: string | "unclassified";
  conceptualObjective: string | "unclassified";
  misconceptionTarget: string | "unclassified";
  representationType: string | "unclassified";
  /** The real `question_type` values present across this family's rows. */
  answerTypes: string[];
  reasoningDepth: string | "unclassified";
  difficultyRange: ContentDifficulty[];
  variationStrategy: VariationStrategy;
  contextFamily: string | "unclassified";
  inventoryClass: InventoryClassification;
  reviewState: string | "unclassified";
  generationMode: GenerationMode;
  /** Structural, non-semantic hint only (lib/ali/structuralSignature.ts's own established scope) — never claims semantic originality. Populated only when a caller supplies it. */
  similaritySignature?: string;
  rowCount: number;
  rowIds: string[];
}

/**
 * Derives one family's registry record from its real, already-grouped
 * `family_id` rows. `inventoryClass` is passed in per-row by the caller
 * (this module has no database access of its own — see
 * lib/ali/inventoryClass.ts's own docstring on why) and rolled up
 * conservatively: a family containing even one SEALED row is reported
 * SEALED as a whole family, matching the same "stricter protection wins"
 * rule inventoryClass.ts itself enforces at the row level — a family is
 * only as open as its most protected member.
 */
export function deriveFamilyRecordFromQuestions(
  familyId: string,
  rows: readonly BankQuestion[],
  inventoryClassByQuestionId: ReadonlyMap<string, InventoryClassification>
): QuestionFamilyRecord {
  if (rows.length === 0) {
    throw new Error(`deriveFamilyRecordFromQuestions: no rows supplied for family "${familyId}"`);
  }

  const subject = rows[0].subject as "maths" | "english" | "writing";

  const competencyIds = new Set(
    rows.map((r) => QUESTION_TYPE_PRIMARY_COMPETENCY[r.skill as QuestionTypeId]).filter((c): c is CompetencyId => Boolean(c))
  );
  const competencyId = competencyIds.size === 1 ? [...competencyIds][0] : null;

  const answerTypes = [...new Set(rows.map((r) => r.questionType))];
  const difficultyRange = [...new Set(rows.map((r) => r.contentDifficulty))] as ContentDifficulty[];

  const classes = rows.map((r) => inventoryClassByQuestionId.get(r.id) ?? "unclassified");
  const inventoryClass: InventoryClassification = classes.includes("sealed")
    ? "sealed"
    : classes.every((c) => c === classes[0])
      ? classes[0]
      : "unclassified";

  // No procedural/template generation mechanism exists anywhere in this
  // codebase (Increment 017's own confirmed finding, `ALI_DECISION_LOG.md`
  // line ~2011) -- every real family today is hand-authored variants.
  const generationMode: GenerationMode = "hand_authored";

  // Multiple rows sharing one family_id, hand-authored, is itself the
  // real (if thin) evidence of SOME deliberate variation -- but WHICH kind
  // (parametric vs context vs representation vs difficulty vs reasoning)
  // is not recoverable from existing metadata alone, for a single-row
  // family or a multi-row one alike.
  const variationStrategy: VariationStrategy = "unclassified";

  return {
    familyId,
    subject,
    competencyId,
    subskill: "unclassified",
    conceptualObjective: "unclassified",
    misconceptionTarget: "unclassified",
    representationType: "unclassified",
    answerTypes,
    reasoningDepth: "unclassified",
    difficultyRange,
    variationStrategy,
    contextFamily: "unclassified",
    inventoryClass,
    reviewState: "unclassified",
    generationMode,
    rowCount: rows.length,
    rowIds: rows.map((r) => r.id),
  };
}

/**
 * Groups a real question pool by `family_id`, skipping rows with no
 * family_id (17/293 live Mathematics rows, per Increment 018's own
 * reconciliation) — those are represented as singleton families keyed by
 * their own question id, matching this codebase's own established
 * convention elsewhere (a Learning Unit of exactly one question,
 * `learningUnitId` on atomic subjects) rather than silently dropped.
 */
export function buildFamilyRegistry(
  rows: readonly BankQuestion[],
  inventoryClassByQuestionId: ReadonlyMap<string, InventoryClassification>
): QuestionFamilyRecord[] {
  const byFamily = new Map<string, BankQuestion[]>();
  for (const row of rows) {
    const key = row.familyId ?? `__no_family__:${row.id}`;
    const existing = byFamily.get(key);
    if (existing) existing.push(row);
    else byFamily.set(key, [row]);
  }
  return [...byFamily.entries()].map(([familyId, familyRows]) =>
    deriveFamilyRecordFromQuestions(familyId, familyRows, inventoryClassByQuestionId)
  );
}

/** Rows-per-family bucket, the same bucketing Increment 018's production reconciliation reported for Mathematics (2 families at 1 row, 51 at 2-4, 18 at 5-9, 2 at 10+) -- kept here so this bucketing rule has one real, tested implementation. */
export type FamilySizeBucket = "1_row" | "2_to_4_rows" | "5_to_9_rows" | "10_plus_rows";

export function classifyFamilySizeBucket(rowCount: number): FamilySizeBucket {
  if (rowCount <= 1) return "1_row";
  if (rowCount <= 4) return "2_to_4_rows";
  if (rowCount <= 9) return "5_to_9_rows";
  return "10_plus_rows";
}
