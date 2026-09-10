import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * CSSE Two-Paper Mock P1 Repair (P1-B) — migration 251: the smallest
 * legitimate scoring-completion path for the English Full Mock, plus the
 * one narrowly-scoped Mathematics recovery function. Structural/logic
 * assertions against migration 251's real, live SQL source text, matching
 * this repository's own established convention for a NOT APPLIED
 * migration.
 */

const MIGRATION = readFileSync("supabase/migrations/251_english_full_mock_scoring_completion.sql", "utf8");

function extractFunctionBody(source: string, name: string): string {
  const match = source.match(new RegExp(`create or replace function public\\.${name}\\([\\s\\S]*?\\n\\$\\$;`));
  if (!match) throw new Error(`function ${name} not found`);
  return match[0];
}

function stripComments(body: string): string {
  return body
    .split("\n")
    .filter((l) => !l.trimStart().startsWith("--"))
    .join("\n");
}

const claimBody = extractFunctionBody(MIGRATION, "mock_claim_reading_scoring_work");
const persistReadingBody = extractFunctionBody(MIGRATION, "mock_persist_reading_scoring");
const persistWritingBody = extractFunctionBody(MIGRATION, "mock_persist_writing_assessment");
const completionBody = extractFunctionBody(MIGRATION, "mock_check_and_complete_scoring");
const backfillBody = extractFunctionBody(MIGRATION, "mock_backfill_named_mathematics_acceptance_analysis");

test("migration 251 is wrapped in a single begin/commit transaction and discloses NOT APPLIED", () => {
  assert.match(MIGRATION, /^begin;/m);
  assert.match(MIGRATION, /^commit;/m);
  assert.match(MIGRATION, /NOT APPLIED/);
});

// --- Reading authority widened, additively -------------------------------

test("mock_claim_reading_scoring_work and mock_persist_reading_scoring both widen eligibility to the exact same two named (attempt_type, form_id) pairs", () => {
  for (const body of [claimBody, persistReadingBody]) {
    assert.match(body, /attempt_type = 'timed_section' and v_attempt\.form_id = 'reading-comprehension-mock-1'/);
    assert.match(body, /attempt_type = 'full_mock' and v_attempt\.form_id = 'english-full-mock-v1'/);
  }
});

test("Reading Comprehension Mock 1's own eligibility is preserved -- the widening is additive (OR), never a replacement of the original condition", () => {
  for (const body of [claimBody, persistReadingBody]) {
    assert.match(body, /\(\s*\(v_attempt\.attempt_type = 'timed_section' and v_attempt\.form_id = 'reading-comprehension-mock-1'\)\s*\n\s*or \(v_attempt\.attempt_type = 'full_mock' and v_attempt\.form_id = 'english-full-mock-v1'\)\s*\)/);
  }
});

// --- Writing content never becomes a binary scalar mark ------------------

test("Writing content is hard-forced to requires_manual_marking inside mock_persist_reading_scoring, regardless of caller input -- never scored as a Reading-style scalar mark", () => {
  assert.match(persistReadingBody, /if v_bank_row\.subject = 'writing' then/);
  const writingBranch = persistReadingBody.split("if v_bank_row.subject = 'writing' then")[1].split("elsif")[0];
  assert.match(writingBranch, /v_status := 'requires_manual_marking';/);
  assert.match(writingBranch, /v_marks_awarded := null;/);
});

test("the Writing override is checked BEFORE the TIER3/TIER5 check -- a Writing question (no validationTier) can never fall through to the scalar-marking branch", () => {
  const writingIdx = persistReadingBody.indexOf("if v_bank_row.subject = 'writing' then");
  const tierIdx = persistReadingBody.indexOf("validationTier') in (");
  assert.ok(writingIdx !== -1 && tierIdx !== -1 && writingIdx < tierIdx);
});

test("mock_persist_writing_assessment's own approved contract is completely unchanged: assessment_status stays constrained to complete/review_required, dimensions/overall_indicator are inserted verbatim from the caller's computed values, never re-derived here", () => {
  assert.match(persistWritingBody, /p_assessment_status not in \('complete', 'review_required'\)/);
  assert.match(persistWritingBody, /response_text, p_dimensions, p_overall_indicator, p_assessment_status,/);
});

test("mock_persist_writing_assessment reads the original response server-side, never as a caller parameter -- unchanged from migration 245", () => {
  assert.doesNotMatch(persistWritingBody, /p_response_text/);
  assert.match(persistWritingBody, /select response ->> 'value' into v_response_text/);
});

// --- English completion contract ------------------------------------------

test("mock_check_and_complete_scoring only ever acts on scoring_state='scoring' -- a no-op for not_started/scored/failed", () => {
  assert.match(completionBody, /if v_report\.scoring_state <> 'scoring' then\s*\n\s*return;\s*\n\s*end if;/);
});

test("a still-manual Writing item without a persisted ali_writing_assessment row blocks completion -- English stays at 'scoring' while assessment is incomplete", () => {
  assert.match(completionBody, /if found and v_bank_row\.subject = 'writing' then/);
  const writingBranch = completionBody.split("if found and v_bank_row.subject = 'writing' then")[1].split("else")[0];
  assert.match(writingBranch, /not exists \(\s*\n\s*select 1 from public\.ali_writing_assessment/);
  assert.match(writingBranch, /v_all_resolved := false;/);
});

test("a still-manual NON-writing item (e.g. an unresolved TIER3/TIER5 Reading question) also blocks completion -- fails closed, never silently dropped", () => {
  const elseBranch = completionBody.split("if found and v_bank_row.subject = 'writing' then")[1].split(/\belse\b/)[1].split("end if;")[0];
  assert.match(elseBranch, /v_all_resolved := false;/);
});

test("completion transitions scoring_state to 'scored' and invokes the real, unmodified mock_analyse_attempt -- never a second analysis engine", () => {
  assert.match(completionBody, /if v_all_resolved then/);
  const resolvedBranch = completionBody.split("if v_all_resolved then")[1];
  assert.match(resolvedBranch, /set scoring_state = 'scored', updated_at = now\(\)/);
  assert.match(resolvedBranch, /perform public\.mock_analyse_attempt\(p_attempt_id\);/);
});

test("mock_check_and_complete_scoring is internal-only -- no grant to any role", () => {
  assert.match(MIGRATION, /revoke all on function public\.mock_check_and_complete_scoring\(uuid\) from public;/);
  assert.doesNotMatch(MIGRATION, /grant execute on function public\.mock_check_and_complete_scoring/);
});

test("both mock_persist_reading_scoring and mock_persist_writing_assessment call the completion check exactly once each, as their own final step", () => {
  assert.match(persistReadingBody, /perform public\.mock_check_and_complete_scoring\(p_attempt_id\);/);
  assert.match(persistWritingBody, /perform public\.mock_check_and_complete_scoring\(p_attempt_id\);/);
  // In mock_persist_writing_assessment, the call must precede the return.
  const callIdx = persistWritingBody.indexOf("perform public.mock_check_and_complete_scoring");
  const returnIdx = persistWritingBody.indexOf("return v_row_count > 0;");
  assert.ok(callIdx !== -1 && returnIdx !== -1 && callIdx < returnIdx);
});

test("neither writer function assigns analysis_state directly -- only mock_check_and_complete_scoring -> mock_analyse_attempt() ever does, preserving migration 219's own separation", () => {
  for (const body of [persistReadingBody, persistWritingBody]) {
    assert.doesNotMatch(body, /\banalysis_state\s*[=:]/);
  }
});

// --- Mathematics recovery: named, bounded, no parameter --------------------

test("the Mathematics backfill takes NO parameter -- the exact acceptance attempt id is a hardcoded literal inside the function body, not caller-supplied", () => {
  assert.match(MIGRATION, /create or replace function public\.mock_backfill_named_mathematics_acceptance_analysis\(\)/);
  assert.match(backfillBody, /v_attempt_id constant uuid := 'ed253ddf-ba91-4a49-b256-e83083780f3a';/);
});

test("the Mathematics backfill is admin-gated, matching mock_release_report's own established gate exactly", () => {
  assert.match(backfillBody, /if not public\.is_current_user_admin\(\) then/);
  assert.match(backfillBody, /raise exception 'Only an admin may run this named backfill';/);
});

test("the Mathematics backfill calls the real mock_analyse_attempt() -- never writes analysis_state/skill_evidence/strengths/weaknesses directly itself", () => {
  const executable = stripComments(backfillBody);
  assert.match(executable, /perform public\.mock_analyse_attempt\(v_attempt_id\);/);
  assert.doesNotMatch(executable, /\banalysis_state\s*[=:]/);
  assert.doesNotMatch(executable, /\bskill_evidence\s*[=:]/);
});

test("the Mathematics backfill is granted only to authenticated (so the real admin browser session can call it), never anon", () => {
  assert.match(MIGRATION, /grant execute on function public\.mock_backfill_named_mathematics_acceptance_analysis\(\) to authenticated;/);
  assert.doesNotMatch(MIGRATION, /grant execute on function public\.mock_backfill_named_mathematics_acceptance_analysis\(\) to anon;/);
});

// --- Untouched surfaces -----------------------------------------------------

test("this migration never touches mock_release_report, mock_apply_manual_mark, mock_attempt_report_init, or RLS policies", () => {
  assert.doesNotMatch(MIGRATION, /create or replace function public\.mock_release_report/);
  assert.doesNotMatch(MIGRATION, /create or replace function public\.mock_apply_manual_mark/);
  assert.doesNotMatch(MIGRATION, /create or replace function public\.mock_attempt_report_init/);
  assert.doesNotMatch(MIGRATION, /create policy|drop policy|alter table .* enable row level security/i);
});

test("this migration never touches the Writing evidence ingestion path (migration 247) or the binary Mock evidence bridge (migration 244)", () => {
  assert.doesNotMatch(MIGRATION, /mock_claim_writing_evidence_ingestion/);
  assert.doesNotMatch(MIGRATION, /mock_claim_evidence_ingestion/);
});
