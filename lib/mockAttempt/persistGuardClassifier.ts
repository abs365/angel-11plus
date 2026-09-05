/**
 * Increment 025 (Founder-approved, bounded observability only) — matches
 * a caught `mock_persist_reading_scoring()` (migration 219) PostgresError
 * message against that function's own fixed, developer-authored RAISE
 * EXCEPTION templates, returning ONLY a safe, allow-listed identifier —
 * never the message itself, and never any interpolated value it carries
 * (an attempt id, question id, or count). Pure string matching, no
 * database access, no secrets — kept separate from
 * lib/server/mockScoringAuthority.ts for the same reason
 * readingScoringOrchestration.ts already is: real node:test coverage of
 * genuine logic, mirroring this codebase's own established "pull logic
 * out into pure functions" discipline. No `server-only` guard, matching
 * that same sibling file's own reasoning — this module touches nothing
 * server-only either.
 *
 * Every pattern below corresponds to exactly one `raise exception` call
 * inside `mock_persist_reading_scoring()` as it exists in
 * supabase/migrations/219_mock_reading_scoring_authority.sql (a
 * historical, immutable migration; do not edit that file to keep this
 * list in sync). If a future migration adds a new persist-side
 * `raise exception`, this file must be extended additively.
 */

type PersistGuardSuffix =
  | "attempt_not_found"
  | "attempt_not_submitted"
  | "wrong_attempt_form"
  | "outcomes_not_array"
  | "outcome_count_mismatch"
  | "question_not_in_manifest"
  | "duplicate_outcome"
  | "question_bank_row_missing"
  | "marks_out_of_bounds"
  | "report_row_missing";

export type PersistGuardId = `persist_guard:${PersistGuardSuffix}` | "persist_guard:unknown";

interface PersistGuardPattern {
  suffix: PersistGuardSuffix;
  /** Fixed literal text from the migration's own RAISE template, with `.+` standing in for every `%` interpolation. Anchored start-to-end so a partial/coincidental match never fires. */
  pattern: RegExp;
}

const PERSIST_GUARD_PATTERNS: readonly PersistGuardPattern[] = [
  // migration 219 line 224
  { suffix: "attempt_not_found", pattern: /^Attempt .+ not found$/ },
  // migration 219 line 227
  { suffix: "attempt_not_submitted", pattern: /^Attempt .+ is not submitted \(status=.+\) -- only a locked, submitted attempt may be scored$/ },
  // migration 219 line 230
  { suffix: "wrong_attempt_form", pattern: /^Attempt .+ is not a Reading Comprehension Mock 1 attempt \(attempt_type=.+, form_id=.+\)$/ },
  // migration 219 line 242
  { suffix: "outcomes_not_array", pattern: /^p_outcomes must be a JSON array$/ },
  // migration 219 line 245
  { suffix: "outcome_count_mismatch", pattern: /^Outcome count \(.+\) does not match assigned question count \(.+\)$/ },
  // migration 219 line 253
  { suffix: "question_not_in_manifest", pattern: /^Question .+ is not part of attempt .+'s assigned manifest$/ },
  // migration 219 line 256
  { suffix: "duplicate_outcome", pattern: /^Duplicate outcome supplied for question .+$/ },
  // migration 219 line 262
  { suffix: "question_bank_row_missing", pattern: /^Question .+ no longer resolves to a bank row$/ },
  // migration 219 line 289
  { suffix: "marks_out_of_bounds", pattern: /^Question .+ supplied marksAwarded .+ outside canonical bound \[0,.+\]$/ },
  // migration 219 line 346
  { suffix: "report_row_missing", pattern: /^No report row exists for attempt .+ -- the migration 072 report-init trigger should have created one on submission$/ },
];

/**
 * Classifies a caught error's message against the fixed guard templates
 * above. Reads `message` only to compare it against these patterns —
 * the message itself, and any interpolated value it carries, is never
 * returned, logged, or otherwise retained by this function's own output.
 * Never throws; a non-Postgres message, or no message at all, safely
 * falls through to `persist_guard:unknown`.
 */
export function classifyPersistGuard(message: string | undefined | null): PersistGuardId {
  if (message) {
    for (const { suffix, pattern } of PERSIST_GUARD_PATTERNS) {
      if (pattern.test(message)) return `persist_guard:${suffix}`;
    }
  }
  return "persist_guard:unknown";
}
