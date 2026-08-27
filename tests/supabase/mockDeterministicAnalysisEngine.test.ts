import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { QUESTION_TYPE_PRIMARY_COMPETENCY } from "../../lib/learningEngine/assessmentBrainMap";

/**
 * Mathematics Mock 1 — Deterministic Mock Analysis Engine (Decision 223).
 * Structural tests against migration 151's own SQL text.
 */

const sql = fs.readFileSync("supabase/migrations/151_mock_deterministic_analysis_engine.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

test("adds exactly three new, additive, nullable columns to ali_mock_attempt_report", () => {
  assert.match(executable, /add column if not exists skill_evidence jsonb/);
  assert.match(executable, /add column if not exists analysis_version integer/);
  assert.match(executable, /add column if not exists analysed_at timestamptz/);
});

test("mock_analyse_attempt: SECURITY DEFINER, re-derives identity from auth.uid(), never a passed-in profile id", () => {
  const fn = executable.match(/create or replace function public\.mock_analyse_attempt[\s\S]*?\n\$\$;/)![0];
  assert.match(fn, /security definer/);
  assert.match(fn, /select id into v_profile_id from public\.profiles where auth_user_id = auth\.uid\(\)/);
  assert.ok(!/p_profile_id|p_owner_id/.test(fn));
});

test("mock_analyse_attempt: ownership check via the caller's own attempt, refuses if not found", () => {
  const fn = executable.match(/create or replace function public\.mock_analyse_attempt[\s\S]*?\n\$\$;/)![0];
  assert.match(fn, /where id = p_attempt_id and profile_id = v_profile_id/);
  assert.match(fn, /raise exception 'Attempt % not found for caller'/);
});

test("mock_analyse_attempt: refuses to analyse an attempt whose report is not scoring_state='scored' -- never a manual-marking-pending attempt", () => {
  const fn = executable.match(/create or replace function public\.mock_analyse_attempt[\s\S]*?\n\$\$;/)![0];
  assert.match(fn, /if v_report\.scoring_state <> 'scored' then/);
});

test("mock_analyse_attempt: idempotent per analysis_version, mirroring mock_score_attempt()'s own established pattern", () => {
  const fn = executable.match(/create or replace function public\.mock_analyse_attempt[\s\S]*?\n\$\$;/)![0];
  assert.match(fn, /if v_report\.analysis_state = 'complete' and v_report\.analysis_version = v_current_analysis_version then/);
  assert.match(fn, /return;/);
});

test("mock_analyse_attempt is granted to NO role at all -- never authenticated, never anon, from the start", () => {
  assert.match(executable, /revoke all on function public\.mock_analyse_attempt\(uuid\) from public;/);
  assert.ok(!/grant execute on function public\.mock_analyse_attempt/.test(executable));
});

test("mock_question_type_competency helper is also granted to no role", () => {
  assert.match(executable, /revoke all on function public\.mock_question_type_competency\(text\) from public;/);
  assert.ok(!/grant execute on function public\.mock_question_type_competency/.test(executable));
});

test("mock_question_type_competency reproduces QUESTION_TYPE_PRIMARY_COMPETENCY (lib/learningEngine/assessmentBrainMap.ts) exactly -- no drift between the TypeScript source of truth and this SQL duplication", () => {
  const fn = executable.match(/create or replace function public\.mock_question_type_competency[\s\S]*?\n\$\$;/)![0];
  for (const [qt, competencyId] of Object.entries(QUESTION_TYPE_PRIMARY_COMPETENCY)) {
    const re = new RegExp(`when '${qt}' then '${competencyId}'`);
    assert.match(fn, re, `mismatch or missing entry for ${qt} -> ${competencyId}`);
  }
  // And no extra entries beyond the real map.
  const whenCount = (fn.match(/when '[^']+' then '[^']+'/g) || []).length;
  assert.equal(whenCount, Object.keys(QUESTION_TYPE_PRIMARY_COMPETENCY).length);
});

test("EVIDENCE CONTRACT: a skill needs 2+ observed subparts before demonstrated_securely/not_yet_demonstrated/developing can apply -- fewer than 2 is always insufficient_evidence", () => {
  const fn = executable.match(/create or replace function public\.mock_analyse_attempt[\s\S]*?\n\$\$;/)![0];
  assert.match(fn, /if v_skill_subparts < 2 then/);
  assert.match(fn, /v_evidence_level := 'insufficient_evidence';/);
});

test("MISCONCEPTION SAFETY: misconception notes are attached only from a non-correct outcome row, never from a correct one", () => {
  const fn = executable.match(/create or replace function public\.mock_analyse_attempt[\s\S]*?\n\$\$;/)![0];
  assert.match(fn, /if found and v_status <> 'correct' and v_bank_row\.addresses_misconception is not null then/);
});

test("QUESTION REVIEW BOUNDARY: this migration never READS prompt.workingSteps, the stored answer field, or the learner's own response text anywhere in its executable SQL (the word may appear only inside a documentation string literal, e.g. a column comment, never as a functional accessor)", () => {
  assert.ok(!/->>?'workingSteps'|->>?'working_steps'/.test(executable), "must never accessor-read workingSteps from prompt jsonb");
  assert.ok(!/prompt->>'answer'/.test(executable));
  assert.ok(!/\.response\b/.test(executable), "must never read ali_mock_attempt_answer.response");
  assert.ok(!executable.includes("ali_mock_attempt_answer"), "must never touch ali_mock_attempt_answer at all");
});

test("COMPETENCY ROLLUP (Pass 2b): strengths/weaknesses are built from a competency-level aggregation, not directly from the QT-level bySkill loop -- avoids duplicate competency labels", () => {
  assert.match(executable, /with competency_rollup as \(/);
  assert.match(executable, /group by public\.mock_question_type_competency\(e->>'questionTypeId'\)/);
  assert.match(executable, /into v_strengths, v_weaknesses/);
});

test("next-practice priorities: deterministic ORDER BY inside jsonb_agg itself, not relying on implicit subquery row order", () => {
  assert.match(executable, /jsonb_agg\(\s*\n?\s*jsonb_build_object\('competencyId', public\.mock_question_type_competency\(s\.qt\), 'questionTypeId', s\.qt\)\s*\n?\s*order by s\.rank_key, s\.marks_lost desc, s\.qt asc/);
});

test("does not redefine mock_score_attempt, mock_submit_attempt, mock_release_report, or mock_start_attempt -- scoring/release/timer capability is untouched", () => {
  assert.ok(!/create or replace function public\.mock_score_attempt/.test(executable));
  assert.ok(!/create or replace function public\.mock_submit_attempt/.test(executable));
  assert.ok(!/create or replace function public\.mock_release_report/.test(executable));
  assert.ok(!/create or replace function public\.mock_start_attempt/.test(executable));
});

test("trigger redefinition: mock_attempt_report_init() gains a SECOND, independent nested exception block for analysis, calling mock_analyse_attempt only when scoring_state re-reads as 'scored'", () => {
  const trigger = executable.match(/create or replace function public\.mock_attempt_report_init\(\)[\s\S]*?\n\$\$;/)![0];
  assert.match(trigger, /perform public\.mock_score_attempt\(new\.id\);/);
  assert.match(trigger, /perform public\.mock_analyse_attempt\(new\.id\);/);
  // Two independent begin/exception/end blocks inside the same IF body --
  // each real nested block has exactly one "exception when others then".
  const exceptionHandlers = (trigger.match(/exception when others then/g) || []).length;
  assert.equal(exceptionHandlers, 2);
});

test("trigger's analysis block only fires the SCORING_STATE check freshly, and its own exception handler touches analysis_state only, never scoring_state/question_outcomes/overall", () => {
  const trigger = executable.match(/create or replace function public\.mock_attempt_report_init\(\)[\s\S]*?\n\$\$;/)![0];
  const analysisBlock = trigger.split("if (select scoring_state from public.ali_mock_attempt_report where attempt_id = new.id) = 'scored' then")[1];
  assert.match(analysisBlock, /perform public\.mock_analyse_attempt\(new\.id\);/);
  assert.match(analysisBlock, /set analysis_state = 'failed', updated_at = now\(\)/);
  assert.ok(!/set scoring_state/.test(analysisBlock));
  assert.ok(!/set question_outcomes/.test(analysisBlock));
  assert.ok(!/set overall/.test(analysisBlock));
});

test("no trigger DDL is created or dropped -- mock_attempt_report_init_trigger (migration 072) is not referenced here at all, matching migration 075's own established precedent", () => {
  assert.ok(!/create trigger|drop trigger/i.test(executable));
});

test("does not create ali_mock_attempt, does not call mock_create_attempt/mock_create_cycle_attempt -- no attempt is ever created by this migration", () => {
  assert.ok(!/insert into public\.ali_mock_attempt\b/.test(executable));
  assert.ok(!/mock_create_attempt|mock_create_cycle_attempt/.test(executable));
});

test("does not touch ali_student_question_history, processEvidenceForCompetency, or any Educational Intelligence table -- migration 074's own provenance-isolation wall is preserved", () => {
  assert.ok(!executable.includes("ali_student_question_history"));
  assert.ok(!executable.includes("ali_durable_mastery"));
  assert.ok(!executable.includes("ali_educational_audit"));
});

test("does not touch Mathematics Mock 1's own composition/activation: no reference to first-mock-mathematics-v1, no active = true, no question_manifest write", () => {
  assert.ok(!executable.includes("first-mock-mathematics-v1"));
  assert.ok(!/active\s*=\s*true/.test(executable));
  assert.ok(!/set[\s\S]{0,60}question_manifest/.test(executable));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present, documents dependency on migrations 070-150", () => {
  assert.match(sql, /NOT APPLIED\. Generated for Founder review/);
  assert.match(sql, /after migrations 070-150/);
});

test("every RAISE with a % placeholder supplies exactly one matching argument", () => {
  const raiseStatements = [...executable.matchAll(/raise (?:exception|notice)\s+'([^']*(?:''[^']*)*)'((?:\s*,\s*[\w.]+)*)\s*;/g)];
  assert.ok(raiseStatements.length > 0);
  for (const [, message, args] of raiseStatements) {
    const placeholders = (message.match(/%/g) || []).length;
    const argCount = args ? (args.match(/[\w.]+/g) || []).length : 0;
    assert.equal(placeholders, argCount, `RAISE message "${message}" has ${placeholders} placeholders but ${argCount} arguments`);
  }
});
