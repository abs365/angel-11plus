import type { ManifestValidationReport } from "./mockComposition";

/**
 * Mathematics First Mock — Freeze Manifest Shaping (Decision 210 Part
 * 9/12, Decision 212). Pure data-shaping only — no Supabase client, no
 * `INSERT`, no side effect of any kind. Produces exactly the row shape a
 * future, SEPARATELY Founder-authorised migration or admin action would
 * write into `ali_mock_form` (`supabase/migrations/070_mock_attempt_
 * engine.sql`'s own table, `subject` column added by migration 085) —
 * this module never performs that write itself, per the governing
 * directive's own explicit "do not insert the First Mock" boundary.
 *
 * `question_manifest`'s own shape — `[{ question_id, section }, ...]` —
 * is read verbatim by `mock_create_attempt()`/`mock_create_cycle_
 * attempt()` (`jsonb_array_elements(question_manifest)->>'question_id'`)
 * and by `scripts/verify-mock-attempt-engine.mjs`'s own real fixture;
 * this module reproduces that exact shape, not a new one.
 */

export interface MockFormQuestionManifestEntry {
  question_id: string;
  section: string;
}

export function buildQuestionManifestJson(questionIds: readonly string[], section: string): MockFormQuestionManifestEntry[] {
  return questionIds.map((question_id) => ({ question_id, section }));
}

/**
 * Additive provenance captured alongside the manifest — NOT part of
 * `question_manifest` itself (that array is read as a flat list of
 * `{question_id, section}` objects by every existing consumer; inserting
 * a summary object into it would break that reader). Intended for a new,
 * nullable `ali_mock_form.composition_provenance jsonb` column (see
 * migration 145) so a frozen form's own approved shape is auditable
 * without re-deriving it from `ali_question_bank` after the fact — the
 * pool can keep changing (further authoring, further promotions) after a
 * form is frozen; this snapshot is what was actually reviewed and
 * approved, not a live recomputation.
 */
export interface MockCompositionProvenance {
  source: string;
  generatorVersion: string;
  composedAt: string;
  targetExperienceCount: number;
  numberedQuestionCount: number;
  totalMarks: number;
  rawRowCount: number;
  difficultyDistribution: ManifestValidationReport["difficultyDistribution"];
  skillDistribution: ManifestValidationReport["skillDistribution"];
  familyIds: string[];
}

export function buildCompositionProvenance(
  report: ManifestValidationReport,
  targetExperienceCount: number,
  composedAt: string,
  source = "mathematics_first_mock_candidate"
): MockCompositionProvenance {
  return {
    source,
    generatorVersion: "mockComposition-v1",
    composedAt,
    targetExperienceCount,
    numberedQuestionCount: report.numberedQuestionCount,
    totalMarks: report.totalMarks,
    rawRowCount: report.rawRowCount,
    difficultyDistribution: report.difficultyDistribution,
    skillDistribution: report.skillDistribution,
    familyIds: report.familyIds,
  };
}

export interface MockFormInsertPayload {
  id: string;
  subject: "mathematics" | "english";
  specification_version: number;
  attempt_type: "full_mock" | "timed_section" | "diagnostic_mock";
  question_manifest: MockFormQuestionManifestEntry[];
  /**
   * Deliberately `false` here — this module never proposes an
   * immediately-active form. `active` (migration 070's own existing
   * column) is reused as the freeze/activation gate: a form only becomes
   * usable once `mock_create_attempt()`/`mock_create_cycle_attempt()`
   * find it `active = true` (both already `WHERE ... AND active = true`,
   * unchanged). Flipping it to `true` is a separate, later,
   * Founder-authorised step — never performed by composing a candidate.
   */
  active: false;
  composition_provenance: MockCompositionProvenance;
}

/**
 * Given a VALID composition report (caller must check `report.valid`
 * first — this function does not re-validate and will happily shape an
 * invalid report's own data if asked, since re-validating is the
 * caller's own `validateManifest()` responsibility, not this shaping
 * function's), builds the exact row a future authorised action would
 * insert into `ali_mock_form`. Never calls Supabase, never mutates
 * anything — pure data transformation only.
 */
export function buildMockFormInsertPayload(
  formId: string,
  report: ManifestValidationReport,
  targetExperienceCount: number,
  composedAt: string,
  options?: { specificationVersion?: number; section?: string }
): MockFormInsertPayload {
  const specification_version = options?.specificationVersion ?? 1;
  const section = options?.section ?? "mathematics";
  return {
    id: formId,
    subject: "mathematics",
    specification_version,
    attempt_type: "full_mock",
    question_manifest: buildQuestionManifestJson(report.questionIds, section),
    active: false,
    composition_provenance: buildCompositionProvenance(report, targetExperienceCount, composedAt),
  };
}
