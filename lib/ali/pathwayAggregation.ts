/**
 * Question Factory Wave 2 — pure-function mirror of migration 231's SQL
 * aggregation logic (flatten every member row's pathway array via
 * `unnest()`, then `array_agg(distinct ... order by ...)`), kept here as
 * an independent correctness oracle for the algorithm the SQL implements.
 * This function is not called by any migration or runtime code path —
 * `ali_question_family.pathways` is computed server-side, in SQL, by
 * migration 231 itself. Its only purpose is testability: proving the
 * INTENDED aggregation semantics (flatten, deduplicate, sort) are
 * correct, independent of the SQL migration's own structural tests
 * (which prove the SQL statement SHAPE avoids the multi-dimensional-
 * array indexing defect migration 228 had — see
 * ANGEL_QUESTION_FACTORY_WAVE2_MIGRATION_SAFETY_GATE.md).
 */
export function computeFlattenedPathways(pathwayArraysAcrossFamilyRows: readonly (readonly string[] | null | undefined)[]): string[] {
  const flat = pathwayArraysAcrossFamilyRows.flatMap((row) => row ?? []);
  return [...new Set(flat)].sort();
}
