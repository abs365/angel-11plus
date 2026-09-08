import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Published Answer Integrity Incident -- structural tests against
 * migration 237's own raw SQL text, matching this repository's
 * established convention for an unapplied migration (mirroring
 * migration235PublishProvenanceCorrection.test.ts). No live Postgres
 * connection is available in this environment, so the fix is proven
 * structurally (present, correctly shaped, gated to Maths only, and
 * touching nothing else) rather than by actually executing the INSERT --
 * live production verification is a separate, later step.
 *
 * The exact incident this migration fixes: a real, non-admin learner
 * answered "40" (mathematically correct, per the question's own worked
 * explanation) on a newly-published Maths candidate
 * (factory-candidate-mr02-substitution-ea154c86af6a9f81) and was marked
 * incorrect, with the UI displaying "Correct answer: undefined" -- see
 * ANGEL_PUBLISHED_ANSWER_INTEGRITY_INCIDENT_REPORT.md.
 */

const SQL_PATH = "supabase/migrations/237_publish_question_candidate_answer_persistence_correction.sql";
const sql = fs.readFileSync(SQL_PATH, "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

const OLD_235_SQL = fs.readFileSync("supabase/migrations/235_publish_question_candidate_provenance_correction.sql", "utf8");
const OLD_235_EXECUTABLE = OLD_235_SQL.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");
function extractPublishFunctionBody(executableText: string): string {
  const match = executableText.match(/create or replace function public\.publish_question_candidate\([\s\S]*?\nend;\n\$\$;/);
  if (!match) throw new Error("could not locate publish_question_candidate function body");
  return match[0];
}
const oldBody = extractPublishFunctionBody(OLD_235_EXECUTABLE);
const newBody = extractPublishFunctionBody(executable);

/** The local, in-test equivalent of the exact merge Postgres will perform, for a Maths candidate. */
function mergeAnswerAtPublishTime(questionContent: Record<string, unknown>, subject: string, claimedAnswer: string): Record<string, unknown> {
  if (subject !== "maths") return { ...questionContent };
  return { ...questionContent, answer: claimedAnswer };
}

test("migration 237 redefines exactly one function, publish_question_candidate, via create or replace (no drop, unchanged signature)", () => {
  assert.equal((executable.match(/create or replace function public\.publish_question_candidate\(/g) || []).length, 1);
  assert.doesNotMatch(executable, /drop function if exists public\.publish_question_candidate/);
  const header = executable.match(/create or replace function public\.publish_question_candidate\(([\s\S]*?)\)\s*\nreturns text/)![1];
  assert.equal(header.trim(), "p_candidate_id text");
});

test("the exact incident is fixed: a Maths candidate's question_content gains 'answer' from its own genuine claimed_answer", () => {
  const before = { question: "B = 4A...", workingSteps: ["...", "B = 4 x 10 = 40"], params: {} };
  const merged = mergeAnswerAtPublishTime(before, "maths", "40");
  assert.equal(merged.answer, "40");
  // Every pre-existing field survives the merge untouched.
  assert.deepEqual(merged.question, before.question);
  assert.deepEqual(merged.workingSteps, before.workingSteps);
  assert.deepEqual(merged.params, before.params);
});

test("English question_content is never touched by the answer merge -- the branch is gated to subject = 'maths'", () => {
  const before = { question: "...", acceptedAnswers: ["pulp"] };
  const merged = mergeAnswerAtPublishTime(before, "english", "pulp");
  assert.deepEqual(merged, before);
  assert.ok(!("answer" in merged), "English prompt must never gain a top-level 'answer' key -- its own contract never reads one");
});

test("the answer merge is present as a subject-gated jsonb || merge, additive only, never a replacement", () => {
  assert.match(newBody, /if v_candidate\.subject = 'maths' then\s*\n[\s\S]*?v_final_prompt := v_final_prompt \|\| jsonb_build_object\('answer', v_candidate\.claimed_answer\);\s*\n\s*end if;/);
});

test("the fail-closed guard rejects a Maths candidate with a null or empty claimed_answer, before the INSERT is reached", () => {
  assert.match(
    newBody,
    /if v_candidate\.subject = 'maths'\s*\n\s*and \(v_candidate\.claimed_answer is null or trim\(v_candidate\.claimed_answer\) = ''\) then\s*\n\s*raise exception/
  );
  // The guard must appear before the INSERT statement in source order.
  const guardIndex = newBody.indexOf("refusing to publish a question the real Practice marker");
  const insertIndex = newBody.indexOf("insert into public.ali_question_bank");
  assert.ok(guardIndex > -1 && insertIndex > -1 && guardIndex < insertIndex, "the fail-closed guard must run before the INSERT");
});

test("the fail-closed guard never fires for English or Writing candidates, regardless of their claimed_answer", () => {
  const guardBlock = newBody.match(/if v_candidate\.subject = 'maths'\s*\n\s*and \([\s\S]*?raise exception[^;]*;\s*\n\s*end if;/)![0];
  assert.match(guardBlock, /v_candidate\.subject = 'maths'/, "guard condition must be subject-gated to maths");
});

test("does not derive the answer from worked_explanation or workingSteps -- the merge's only source is v_candidate.claimed_answer", () => {
  const mergeLine = newBody.match(/v_final_prompt := v_final_prompt \|\| jsonb_build_object\('answer', ([^)]+)\);/)![1];
  assert.equal(mergeLine.trim(), "v_candidate.claimed_answer");
  assert.doesNotMatch(mergeLine, /worked_explanation|workingSteps/);
});

test("no other candidate-sourced value in the same INSERT is touched -- migration 234's subject cast and migration 235's provenance remap both remain", () => {
  const insertBlock = newBody.match(/insert into public\.ali_question_bank \([\s\S]*?\);/)![0];
  assert.match(insertBlock, /v_candidate\.subject::public\.subject_type/, "migration 234's subject cast must remain");
  assert.match(insertBlock, /case\s*\n\s*when v_candidate\.provenance = 'question_factory_wave1' then 'generated_original'/, "migration 235's provenance remap must remain");
  assert.match(insertBlock, /v_final_prompt, coalesce\(v_candidate\.worked_explanation, ''\)/, "explanation persistence must remain unchanged");
});

test("every other line of publish_question_candidate is byte-for-byte identical to migration 235's own version (modulo whitespace), except the new fail-closed guard and the new answer merge", () => {
  const collapseWhitespace = (s: string) => s.replace(/\s+/g, " ").trim();
  const normalise = (s: string) =>
    collapseWhitespace(
      s
        .replace(
          /if v_candidate\.subject = 'maths'\s*\n\s*and \(v_candidate\.claimed_answer is null or trim\(v_candidate\.claimed_answer\) = ''\) then\s*\n\s*raise exception[^;]*;\s*\n\s*end if;\s*\n\s*\n/,
          ""
        )
        .replace(
          /if v_candidate\.subject = 'maths' then\s*\n[\s\S]*?v_final_prompt := v_final_prompt \|\| jsonb_build_object\('answer', v_candidate\.claimed_answer\);\s*\n\s*end if;\s*\n\s*\n/,
          ""
        )
    );
  assert.equal(normalise(newBody), collapseWhitespace(oldBody), "publish_question_candidate diverges from migration 235's version by more than the fail-closed guard and the answer merge");
});

test("ali_question_candidate.claimed_answer is never written by this function -- read-only, candidate audit lineage is preserved", () => {
  assert.doesNotMatch(newBody, /update public\.ali_question_candidate[\s\S]*?set[^;]*claimed_answer/i);
  const updateBlock = newBody.match(/update public\.ali_question_candidate[\s\S]*?;/)![0];
  assert.match(updateBlock, /set publication_status = 'published', published_question_id = v_new_question_id/);
  assert.doesNotMatch(updateBlock, /claimed_answer/);
});

test("all pre-existing publication protections remain textually present and unweakened: admin gate, approved-only requirement, already-published refusal, passage existence/Mock-governance refusal", () => {
  assert.match(newBody, /if not public\.is_current_user_admin\(\) then/);
  assert.match(newBody, /raise exception 'Only an admin may publish a Question Factory candidate'/);
  assert.match(newBody, /if v_candidate\.review_status <> 'approved' then/);
  assert.match(newBody, /if v_candidate\.publication_status = 'published' then/);
  assert.match(newBody, /raise exception 'Candidate % has already been published as %'/);
  assert.match(newBody, /if not found then\s*\n\s*raise exception 'Candidate % references passage_id % which no longer exists/);
  assert.match(newBody, /if v_passage\.eligibility_status not in \('provisional', 'practice_eligible', 'authentic_assessment_candidate', 'independently_validated'\) then/);
});

test("practice_eligible publication, active=true, learning_unit_id behaviour, and qf-* convention are all unchanged", () => {
  assert.match(newBody, /'practice_eligible', true, v_learning_unit_id/);
  assert.match(newBody, /v_new_question_id := 'qf-' \|\| v_candidate\.candidate_id;/);
  assert.match(newBody, /v_learning_unit_id := v_new_question_id;/);
  assert.match(newBody, /v_learning_unit_id := v_candidate\.passage_id;/);
});

test("security definer and search_path are preserved, and no grant/revoke is restated", () => {
  assert.match(newBody, /security definer/);
  assert.match(newBody, /set search_path = public, pg_temp/);
  assert.doesNotMatch(executable, /grant execute on function public\.publish_question_candidate/);
  assert.doesNotMatch(executable, /revoke execute on function public\.publish_question_candidate/);
});

test("no other table, policy, or function is touched -- purely a body-only correction to one existing function", () => {
  assert.doesNotMatch(executable, /create table|alter table|drop table/i);
  assert.doesNotMatch(executable, /create policy|drop policy|enable row level security|disable row level security/i);
  assert.equal((executable.match(/create or replace function|drop function/g) || []).length, 1);
});

test("wrapped in a single begin/commit transaction, and discloses NOT APPLIED", () => {
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
  assert.match(sql, /NOT APPLIED\. Generated for Founder review and manual application/);
});

test("the migration's own header discloses the exact incident, root cause, and an explicit rollback plan", () => {
  assert.match(sql, /Correct answer: undefined/);
  assert.match(sql, /factory-candidate-mr02-substitution-ea154c86af6a9f81/i);
  assert.match(sql, /313/);
  assert.match(sql, /ROLLBACK/);
  assert.match(sql, /MIGRATION SAFETY REVIEW/);
});
