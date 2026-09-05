import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Increment (post-025) — Reading Mock Manual Marking -> Analysis ->
 * Report Release. Structural/logic assertions against migration 227's
 * own SQL text, matching this repository's own established convention
 * for a NOT APPLIED migration (see tests/supabase/
 * mockReadingScoringAuthorityIncrement016.test.ts's own docstring for
 * why: no live Postgres in this test runner, so the real guarantee is a
 * genuine Founder application via Supabase Dashboard, and these tests
 * prove the contract in source).
 */

const MIGRATION = readFileSync("supabase/migrations/227_reading_mock_manual_marking_and_release_governance.sql", "utf8");
const MIGRATION_215 = readFileSync("supabase/migrations/215_mock_analyse_attempt_subject_breakdown_correction.sql", "utf8");
const MIGRATION_151 = readFileSync("supabase/migrations/151_mock_deterministic_analysis_engine.sql", "utf8");

// Matches this repository's own established convention (see
// tests/supabase/mockScoringAndReportRelease.test.ts): comment lines
// (this migration's own extensive header prose) are stripped before
// asserting anything about what the EXECUTABLE SQL does or doesn't do.
const EXECUTABLE = MIGRATION.split("\n")
  .filter((l) => !l.trimStart().startsWith("--"))
  .join("\n");

function stripComments(body: string): string {
  return body
    .split("\n")
    .filter((l) => !l.trimStart().startsWith("--"))
    .join("\n");
}

function extractFunctionBody(source: string, name: string): string {
  const match = source.match(new RegExp(`create or replace function public\\.${name}\\([\\s\\S]*?\\n\\$\\$;`));
  if (!match) throw new Error(`function ${name} not found`);
  return match[0];
}

const applyManualMark = extractFunctionBody(MIGRATION, "mock_apply_manual_mark");
const analyseAttempt227 = extractFunctionBody(MIGRATION, "mock_analyse_attempt");
const analyseAttempt215 = extractFunctionBody(MIGRATION_215, "mock_analyse_attempt");
const releaseReport = extractFunctionBody(MIGRATION, "mock_release_report");

// --- table -------------------------------------------------------------

test("ali_mock_manual_mark_audit is created additively, RLS-enabled, with no grant to anon/authenticated", () => {
  assert.match(MIGRATION, /create table if not exists public\.ali_mock_manual_mark_audit/);
  assert.match(MIGRATION, /alter table public\.ali_mock_manual_mark_audit enable row level security;/);
  assert.match(MIGRATION, /revoke all on table public\.ali_mock_manual_mark_audit from public, anon, authenticated;/);
  assert.doesNotMatch(MIGRATION, /grant .* on table public\.ali_mock_manual_mark_audit/i, "no grant of any kind must be issued on the audit table");
});

test("the audit table has no UPDATE or DELETE statement anywhere in this migration -- append-only, retained regardless of later question_outcomes mutation (N)", () => {
  assert.doesNotMatch(MIGRATION, /update public\.ali_mock_manual_mark_audit/i);
  assert.doesNotMatch(MIGRATION, /delete from public\.ali_mock_manual_mark_audit/i);
  assert.match(MIGRATION, /insert into public\.ali_mock_manual_mark_audit/);
});

test("marker identity is a NOT NULL foreign key to profiles, never a free-text column (M)", () => {
  assert.match(MIGRATION, /marked_by_profile_id\s+uuid not null references public\.profiles\(id\)/);
});

// --- mock_apply_manual_mark: authority (A, B, C, M) --------------------

test("the admin check is the first executable statement -- an unauthorised learner or parent is rejected before any state is read or mutated (A, B)", () => {
  const bodyStart = applyManualMark.indexOf("begin");
  const adminCheckIndex = applyManualMark.indexOf("if not public.is_current_user_admin() then");
  const firstMutationIndex = Math.min(
    ...["select * into v_attempt", "update public.ali_mock_attempt_report", "insert into public.ali_mock_manual_mark_audit"]
      .map((needle) => applyManualMark.indexOf(needle))
      .filter((i) => i !== -1)
  );
  assert.ok(bodyStart !== -1 && adminCheckIndex !== -1);
  assert.ok(bodyStart < adminCheckIndex && adminCheckIndex < firstMutationIndex, "admin check must precede every read/write");
  assert.match(applyManualMark, /raise exception 'Only an admin may apply a manual Mock mark';/);
});

test("marker identity is derived from auth.uid() via the caller's own profiles row -- never a function parameter (M)", () => {
  const signature = MIGRATION.match(/create or replace function public\.mock_apply_manual_mark\(([\s\S]*?)\)\nreturns/)![1];
  assert.doesNotMatch(signature, /marker|identity|profile/i, "the function signature must not accept a caller-supplied marker identity of any kind");
  assert.match(applyManualMark, /select id into v_marker_profile_id from public\.profiles where auth_user_id = auth\.uid\(\);/);
});

test("an authorised admin proceeds past the admin check into real attempt/question/mark logic (C)", () => {
  assert.match(applyManualMark, /select \* into v_attempt from public\.ali_mock_attempt where id = p_attempt_id;/);
});

// --- attempt/question validation (D, E, F, G) ---------------------------

test("unknown attempt is rejected (D)", () => {
  assert.match(applyManualMark, /if not found then\s*\n\s*raise exception 'Attempt % not found', p_attempt_id;/);
});

test("wrong form/attempt-type is rejected -- only Reading Comprehension Mock 1 timed_section attempts are accepted (E)", () => {
  assert.match(applyManualMark, /if v_attempt\.attempt_type <> 'timed_section' or v_attempt\.form_id <> 'reading-comprehension-mock-1' then/);
});

test("a question outside the assigned manifest is rejected (F)", () => {
  assert.match(applyManualMark, /if not \(p_question_id = any\(v_attempt\.assigned_question_ids\)\) then/);
});

test("a non-manual (already resolved) outcome is rejected -- including a duplicate attempt to mark the same question again (G, O)", () => {
  assert.match(applyManualMark, /if v_current_status <> 'requires_manual_marking' then\s*\n\s*raise exception 'Question % is not awaiting manual marking/);
});

// --- mark bounds and status derivation (H, I, J, K, L) ------------------

test("a negative mark is rejected (H)", () => {
  assert.match(applyManualMark, /p_marks_awarded < 0/);
});

test("a mark above the canonical maximum is rejected, and the canonical maximum authority is the LIVE ali_question_bank row -- never the caller, and never the persisted outcome's own marksAvailable (I)", () => {
  assert.match(applyManualMark, /p_marks_awarded > v_canonical_marks/);
  // Authority order proven by source position: the bank row is resolved
  // and v_canonical_marks is derived FROM IT first; the persisted
  // outcome's own marksAvailable is read only afterwards, purely as a
  // cross-check, never as the value assigned to v_canonical_marks.
  const bankLookupIndex = applyManualMark.indexOf("select * into v_bank_row from public.ali_question_bank where id = p_question_id;");
  const canonicalAssignIndex = applyManualMark.indexOf("v_canonical_marks := coalesce((v_bank_row.prompt->>'marks')::numeric, 1);");
  const crossCheckIndex = applyManualMark.indexOf("if (v_outcome ->> 'marksAvailable')::numeric is distinct from v_canonical_marks then");
  assert.ok(bankLookupIndex !== -1 && canonicalAssignIndex !== -1 && crossCheckIndex !== -1);
  assert.ok(bankLookupIndex < canonicalAssignIndex, "the bank row must be resolved before v_canonical_marks is derived");
  assert.ok(canonicalAssignIndex < crossCheckIndex, "v_canonical_marks must already be bank-derived before the persisted outcome value is even compared against it");
  assert.doesNotMatch(applyManualMark, /v_canonical_marks := \(v_outcome ->> 'marksAvailable'\)::numeric;/, "v_canonical_marks must never be assigned from the persisted outcome JSON -- only from the live bank row");
});

test("a mismatch between the persisted outcome's marksAvailable and the canonical bank value fails closed -- it is never silently repaired or trusted from either side (I)", () => {
  assert.match(applyManualMark, /raise exception 'Question %''s persisted marksAvailable \(%\) no longer matches the canonical bank value \(%\) -- refusing to guess'/);
});

test("status is derived from the bounded mark, never accepted as a caller claim: 0 -> incorrect, max -> correct, between -> partially_correct (J, K, L)", () => {
  const signature = MIGRATION.match(/create or replace function public\.mock_apply_manual_mark\(([\s\S]*?)\)\nreturns/)![1];
  assert.doesNotMatch(signature, /status/i, "the function must never accept a caller-supplied status parameter");
  assert.match(applyManualMark, /if p_marks_awarded = 0 then\s*\n\s*v_new_status := 'incorrect';/);
  assert.match(applyManualMark, /elsif p_marks_awarded = v_canonical_marks then\s*\n\s*v_new_status := 'correct';/);
  assert.match(applyManualMark, /else\s*\n\s*v_new_status := 'partially_correct';/);
});

// --- concurrency / idempotency (P) --------------------------------------

test("the report row is locked (SELECT ... FOR UPDATE) for the duration of the transaction -- concurrent calls for the same attempt cannot race (P)", () => {
  assert.match(applyManualMark, /select \* into v_report from public\.ali_mock_attempt_report where attempt_id = p_attempt_id for update;/);
});

// --- recomputation and finalisation (Q, R, S, T, U, V, W) ---------------

test("only the one matched outcome is replaced by array index -- every other outcome, including every other manual-marking one, is untouched (AF)", () => {
  assert.match(applyManualMark, /v_new_outcomes := jsonb_set\(\s*\n\s*v_outcomes, array\[v_found_index::text\],/);
});

test("aggregates are recomputed from the complete, authoritative outcomes array on every call -- never incremented, so retries/order cannot corrupt totals (T, U)", () => {
  assert.match(applyManualMark, /for v_idx in 0 \.\. jsonb_array_length\(v_new_outcomes\) - 1 loop/);
  // No blind increment of any counter against its own prior report-level value.
  assert.doesNotMatch(applyManualMark, /v_report\.overall/);
});

test("while any manual item remains, scoring_state stays 'scoring' and percentage is null -- analysis is never invoked in this branch (Q, R)", () => {
  assert.match(applyManualMark, /if v_manual_count > 0 then\s*\n\s*v_percentage := null;\s*\n\s*v_final_scoring_state := 'scoring';/);
  const analysisCallIndex = applyManualMark.indexOf("perform public.mock_analyse_attempt(p_attempt_id);");
  const scoredBranchIndex = applyManualMark.indexOf("if v_final_scoring_state = 'scored' then");
  assert.ok(scoredBranchIndex !== -1 && analysisCallIndex > scoredBranchIndex, "the analyse call must be inside the scored-only branch");
});

test("the final manual item transitions scoring_state to 'scored' with a correctly computed final percentage (S, V)", () => {
  assert.match(applyManualMark, /else\s*\n\s*v_percentage := round\(\(v_raw_achieved \/ nullif\(v_raw_available, 0\)\) \* 100, 1\);\s*\n\s*v_final_scoring_state := 'scored';/);
});

test("the final manual mark invokes the EXISTING mock_analyse_attempt() -- no second analysis engine is defined anywhere in this migration (W)", () => {
  assert.match(applyManualMark, /perform public\.mock_analyse_attempt\(p_attempt_id\);/);
  const analysisFunctionDefinitions = MIGRATION.match(/create (or replace )?function public\.\w*analy\w*/gi) ?? [];
  assert.equal(analysisFunctionDefinitions.length, 1, "expected exactly one analysis-related function definition (the widened mock_analyse_attempt), no new engine");
});

test("the audit row is inserted after the report update, in the same function/transaction, and is never conditional on analysis succeeding", () => {
  const updateIndex = applyManualMark.indexOf("update public.ali_mock_attempt_report");
  const auditInsertIndex = applyManualMark.indexOf("insert into public.ali_mock_manual_mark_audit");
  const analysisCallIndex = applyManualMark.indexOf("perform public.mock_analyse_attempt(p_attempt_id);");
  assert.ok(updateIndex < auditInsertIndex && auditInsertIndex < analysisCallIndex, "expected order: update outcome -> record audit -> (conditionally) invoke analysis");
});

// --- transaction atomicity: a final-mark analysis failure must not leave
// the report in a misleading partially-finalised state -------------------

test("the mock_analyse_attempt() call is NOT wrapped in its own exception-handling sub-block -- an exception there propagates and aborts the WHOLE mock_apply_manual_mark() invocation, atomically rolling back the outcome update and audit insert together with it", () => {
  // Postgres fact this proves, not assumes: a PL/pgSQL function body has
  // no implicit sub-transaction boundary of its own -- only an explicit
  // `begin ... exception when others ... end` block creates one (via an
  // internal savepoint). mock_apply_manual_mark() has exactly ONE begin
  // (the function's own top-level block, matched by `applyManualMark`
  // itself) and contains no nested exception block anywhere -- so a raised
  // exception from mock_analyse_attempt() is never caught locally; it
  // propagates out of mock_apply_manual_mark() entirely, which Postgres
  // then rolls back as a single unit: the scoring_state='scored' update,
  // the question_outcomes rewrite, and the audit INSERT that already ran
  // earlier in the SAME function invocation are all undone together. The
  // caller sees the exception and the report remains exactly as it was
  // before the call (the marked question still requires_manual_marking) --
  // never "scored with analysis failed and an ambiguous mark".
  const nestedExceptionBlocks = applyManualMark.match(/\bexception\s+when\s+others\b/gi) ?? [];
  assert.equal(nestedExceptionBlocks.length, 0, "mock_apply_manual_mark must not swallow an analysis failure in a nested exception block -- doing so would let scoring_state reach 'scored' even if analysis never completed");
  const beginCount = (applyManualMark.match(/\bbegin\b/gi) ?? []).length;
  assert.equal(beginCount, 1, "exactly one begin (the function's own top-level block) -- no inner sub-transaction exists for analysis to fail into safely, so its failure aborts the whole call");
});

test("by contrast, the ORIGINAL submission trigger (migration 151, unmodified by this migration) deliberately DOES wrap its own analysis call in a nested exception block -- a different, correct choice for a different context (scoring must survive an analysis failure at submission time), confirming this is a deliberate design difference, not an oversight", () => {
  assert.match(MIGRATION_151, /begin\s*\n\s*if \(select scoring_state from public\.ali_mock_attempt_report where attempt_id = new\.id\) = 'scored' then\s*\n\s*perform public\.mock_analyse_attempt\(new\.id\);\s*\n\s*end if;\s*\n\s*exception when others then/);
});

// --- audit table: canonical marks source, immutability, retention -------

test("the audit row's marks_available is the canonical bank-derived value (v_canonical_marks), never the pre-existing persisted JSON outcome value", () => {
  const auditInsertBlock = applyManualMark.match(/insert into public\.ali_mock_manual_mark_audit \([\s\S]*?\);/)![0];
  assert.match(auditInsertBlock, /p_attempt_id, p_question_id, p_marks_awarded, v_canonical_marks,\s*\n\s*v_marker_profile_id, v_current_marking_version/);
});

test("marked_at is database-generated (default now()), never supplied by the caller or the function body", () => {
  assert.match(MIGRATION, /marked_at\s+timestamptz not null default now\(\)/);
  const auditInsertBlock = applyManualMark.match(/insert into public\.ali_mock_manual_mark_audit \([\s\S]*?\);/)![0];
  assert.doesNotMatch(auditInsertBlock, /marked_at/, "marked_at must never be explicitly supplied in the INSERT -- it must come from the column's own default");
});

// --- learner response / manifest immutability (AD, AE) ------------------

test("mock_apply_manual_mark never reads or writes the learner's own response table -- the response itself is never touched (AD)", () => {
  assert.doesNotMatch(applyManualMark, /ali_mock_attempt_answer/);
});

test("mock_apply_manual_mark never writes assigned_question_ids -- the manifest is read-only here (AE)", () => {
  assert.doesNotMatch(applyManualMark, /assigned_question_ids\s*=/, "assigned_question_ids must never be assigned to");
});

// --- mock_apply_manual_mark grants ---------------------------------------

test("mock_apply_manual_mark is granted to authenticated only, never anon -- authorization is enforced inside the function body, matching mock_release_report's own established pattern", () => {
  assert.match(MIGRATION, /revoke all on function public\.mock_apply_manual_mark\(uuid, text, numeric\) from public;/);
  assert.match(MIGRATION, /grant execute on function public\.mock_apply_manual_mark\(uuid, text, numeric\) to authenticated;/);
  assert.match(MIGRATION, /revoke execute on function public\.mock_apply_manual_mark\(uuid, text, numeric\) from anon;/);
});

// --- mock_analyse_attempt: widened ownership check, everything else byte-identical to migration 215 (X) ---

test("mock_analyse_attempt's ownership check is widened to accept an admin caller -- the existing learner-owned predicate is preserved, only OR'd with is_current_user_admin()", () => {
  assert.match(analyseAttempt227, /where id = p_attempt_id\s*\n\s*and \(profile_id = v_profile_id or public\.is_current_user_admin\(\)\)/);
});

test("every other line of mock_analyse_attempt is byte-for-byte identical (comments aside) to migration 215's own live definition -- only the ownership predicate differs", () => {
  const OWNERSHIP_215 = "    where id = p_attempt_id and profile_id = v_profile_id;";
  const OWNERSHIP_227 = "    where id = p_attempt_id\n      and (profile_id = v_profile_id or public.is_current_user_admin());";
  const strippedBody215 = stripComments(analyseAttempt215);
  const strippedBody227 = stripComments(analyseAttempt227);
  assert.ok(strippedBody215.includes(OWNERSHIP_215), "expected migration 215's exact original ownership predicate");
  assert.ok(strippedBody227.includes(OWNERSHIP_227), "expected migration 227's exact widened ownership predicate");
  const normalised215 = strippedBody215.replace(OWNERSHIP_215, "OWNERSHIP_CHECK");
  const normalised227 = strippedBody227.replace(OWNERSHIP_227, "OWNERSHIP_CHECK");
  assert.equal(normalised227, normalised215, "mock_analyse_attempt's executable logic must differ from migration 215's version in exactly the ownership predicate, nothing else");
});

test("mock_analyse_attempt's execute grant remains revoked from everyone -- callable only from inside another SECURITY DEFINER function's own owner context", () => {
  assert.match(MIGRATION, /revoke all on function public\.mock_analyse_attempt\(uuid\) from public;/);
  assert.doesNotMatch(MIGRATION, /grant execute on function public\.mock_analyse_attempt/);
});

// --- mock_release_report: hardened release gate (Y, Z, AA, AB, AC) -------

test("mock_release_report still requires scoring_state = 'scored' -- release before scoring completes is rejected (Y)", () => {
  assert.match(releaseReport, /where attempt_id = p_attempt_id\s*\n\s*and scoring_state = 'scored'\s*\n\s*and analysis_state = 'complete';/);
});

test("mock_release_report now ALSO requires analysis_state = 'complete' -- the confirmed governance defect is closed (Z)", () => {
  assert.match(releaseReport, /and analysis_state = 'complete';/);
});

test("mock_release_report remains admin-gated -- a learner or parent (any non-admin) is rejected before either release condition is even evaluated (AA, AB, AC)", () => {
  const adminCheckIndex = releaseReport.indexOf("if not public.is_current_user_admin() then");
  const updateIndex = releaseReport.indexOf("update public.ali_mock_attempt_report");
  assert.ok(adminCheckIndex !== -1 && adminCheckIndex < updateIndex);
  assert.match(releaseReport, /raise exception 'Only an admin may release a Mock report';/);
});

test("an authorised admin CAN release a report that is both scored and analysed -- the two conditions are additive (AND), never mutually exclusive (AA)", () => {
  const whereClause = releaseReport.match(/where attempt_id = p_attempt_id[\s\S]*?;/)![0];
  assert.doesNotMatch(whereClause, /\bor\b/i, "the release WHERE clause must join its conditions with AND only, never OR, to avoid weakening the existing scoring_state guard");
  assert.match(whereClause, /and scoring_state = 'scored'/);
  assert.match(whereClause, /and analysis_state = 'complete'/);
});

// --- blast-radius / scope discipline -------------------------------------

test("this migration never touches the shared submission trigger -- mock_attempt_report_init is not redefined here", () => {
  assert.doesNotMatch(MIGRATION, /create (or replace )?function public\.mock_attempt_report_init/);
});

test("this migration never touches mock_score_attempt, mock_persist_reading_scoring, or mock_claim_reading_scoring_work -- Mathematics/Writing scoring and Increment 025's own scorer are completely untouched", () => {
  for (const fn of ["mock_score_attempt", "mock_persist_reading_scoring", "mock_claim_reading_scoring_work"]) {
    assert.doesNotMatch(MIGRATION, new RegExp(`create (or replace )?function public\\.${fn}`));
  }
});

test("this migration's EXECUTABLE SQL never references ali_student_question_history or processEvidenceForCompetency -- the existing provenance-isolation wall is untouched (the header's own prose discloses this by name, which is expected and fine)", () => {
  assert.doesNotMatch(EXECUTABLE, /ali_student_question_history/);
  assert.doesNotMatch(EXECUTABLE, /processEvidenceForCompetency/);
});

test("no admin UI route or component is created by this migration -- database-only, per explicit Founder instruction for this increment", () => {
  // Structural sanity check on this SQL file's executable content alone:
  // it contains no reference to a .tsx file or an app/admin route.
  assert.doesNotMatch(EXECUTABLE, /\.tsx|app\/admin/);
});

test("the migration discloses NOT APPLIED, matching this repository's own convention for every Founder-applied migration", () => {
  assert.match(MIGRATION, /NOT APPLIED\. Generated for Founder review and manual application/);
});

test("the migration is wrapped in a single begin/commit transaction", () => {
  const beginCount = (MIGRATION.match(/^begin;$/gm) ?? []).length;
  const commitCount = (MIGRATION.match(/^commit;$/gm) ?? []).length;
  assert.equal(beginCount, 1);
  assert.equal(commitCount, 1);
});
