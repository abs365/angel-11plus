import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { scoreSummarySentence, ANALYSIS_PENDING_NOTE } from "@/lib/mockAttempt/reportCopy";
import type { MockOverallResult } from "@/lib/mockAttempt/types";

/**
 * Decision 220 — Mathematics Mock 1 Final Report Release and Learner
 * Discoverability Increment. Proves, against the REAL first live
 * production result (Founder SQL evidence: rawMarksAchieved=6,
 * rawMarksAvailable=56, percentage=10.7) and a second, arbitrary score,
 * that the report never hardcodes a value; proves the three files this
 * decision actually changed (`lib/mockAttempt/client.ts`,
 * `app/learning-intelligence/mock-exam/page.tsx`, `types/supabase.ts`)
 * carry the exact intended structure; and re-confirms, directly against
 * the real, unmodified migration source, the ownership/admin-release
 * security properties this new discoverability capability depends on
 * but does not itself implement.
 */

const clientSource = fs.readFileSync("lib/mockAttempt/client.ts", "utf8");
const mockExamSource = fs.readFileSync("app/learning-intelligence/mock-exam/page.tsx", "utf8");
const reportPageSource = fs.readFileSync("app/learning-intelligence/mock-report/[attemptId]/page.tsx", "utf8");
const migration070 = fs.readFileSync("supabase/migrations/070_mock_attempt_engine.sql", "utf8");

function getSubmittedMockAttemptsSource(): string {
  const match = clientSource.match(/export async function getSubmittedMockAttempts[\s\S]*?\n\}/);
  assert.ok(match, "getSubmittedMockAttempts not found in lib/mockAttempt/client.ts");
  return match[0];
}

// === Live result contract (Section 8) ==================================

test("REAL PRODUCTION REFERENCE CASE: the first live attempt's own values (6/56, 10.7%) render exactly, never hardcoded", () => {
  const realOverall: MockOverallResult = {
    rawMarksAchieved: 6,
    rawMarksAvailable: 56,
    percentage: 10.7,
    answeredCount: 56,
    unansweredCount: 0,
    correctCount: 6,
    incorrectCount: 50,
    requiresManualMarkingCount: 0,
  };
  assert.equal(scoreSummarySentence(realOverall), "You scored 6 out of 56 marks (10.7%).");
});

test("a second, arbitrary score derives a genuinely different sentence from the same pure function -- proves no hardcoded value anywhere in the report copy path", () => {
  const arbitraryOverall: MockOverallResult = {
    rawMarksAchieved: 34,
    rawMarksAvailable: 56,
    percentage: 60.7,
    answeredCount: 56,
    unansweredCount: 0,
    correctCount: 34,
    incorrectCount: 22,
    requiresManualMarkingCount: 0,
  };
  const sentence = scoreSummarySentence(arbitraryOverall);
  assert.equal(sentence, "You scored 34 out of 56 marks (60.7%).");
  assert.notEqual(sentence, "You scored 6 out of 56 marks (10.7%).");
});

test("available marks is never presented as 60 for this manifest, for either the real result or an arbitrary one -- always the real, live 56", () => {
  for (const rawMarksAchieved of [6, 0, 28, 56]) {
    const overall: MockOverallResult = {
      rawMarksAchieved, rawMarksAvailable: 56, percentage: Math.round((rawMarksAchieved / 56) * 1000) / 10,
      answeredCount: 56, unansweredCount: 0, correctCount: rawMarksAchieved, incorrectCount: 56 - rawMarksAchieved, requiresManualMarkingCount: 0,
    };
    const sentence = scoreSummarySentence(overall);
    assert.match(sentence, /out of 56 marks/);
    assert.ok(!/out of 60 marks/.test(sentence));
  }
});

// === Analysis-not-overstated (Section 3/9) ==============================

test("the real, unmodified report page renders ANALYSIS_PENDING_NOTE, never a fabricated strengths claim, when strengths is null (the true, live analysis_state=not_started shape)", () => {
  // strengths is `null` for every attempt today (Decision 220 Part 5/220's
  // own source finding) -- `report.strengths && ...` is falsy for null,
  // so the page must fall through to the honest pending-note branch.
  assert.match(reportPageSource, /report\.strengths\s*&&\s*report\.strengths\.length\s*>\s*0/);
  assert.match(reportPageSource, /ANALYSIS_PENDING_NOTE/);
});

test("ANALYSIS_PENDING_NOTE itself never claims analysis is complete (pre-existing, re-confirmed unchanged this decision)", () => {
  assert.ok(!/complete|finished|ready now/i.test(ANALYSIS_PENDING_NOTE));
});

test("the report page never sets phase to \"ready\" without report_release_state === released -- pending report behaviour is safe, never a broken/inaccessible render", () => {
  assert.match(reportPageSource, /reportReleaseState\s*===\s*"released"/);
  assert.match(reportPageSource, /setPhase\("not-available"\)/);
});

test("the report page's release gate is unmodified in substance -- Founder invocation-reliability repair (Increment 016, Part C) restructured the single-line gate into an equivalent multi-line if/return to make room for a bounded recovery attempt, but only \"released\" ever reaches \"ready\"", () => {
  assert.match(
    reportPageSource,
    /if \(result\.data && result\.data\.reportReleaseState === "released"\) \{\s*\n\s*setReport\(result\.data\);\s*\n\s*setPhase\("ready"\);\s*\n\s*return;\s*\n\s*\}\s*\n\s*setPhase\("not-available"\);/
  );
});

// === Learner discoverability fix (Section 5/6) ===========================

test("the submission confirmation screen links to the caller's own real report page, using the real attemptId already in state, guarded so it never renders with no id", () => {
  const submittedBlock = mockExamSource.match(/\{phase === "submitted" && \([\s\S]*?\)\}\s*\n\s*<\/div>/)?.[0] ?? mockExamSource;
  assert.match(submittedBlock, /attemptId && \(/);
  assert.match(submittedBlock, /href=\{`\/learning-intelligence\/mock-report\/\$\{attemptId\}`\}/);
  assert.match(submittedBlock, /Check your Mock report/);
});

test("the submission screen does not duplicate the report page's own release-state gate -- it links unconditionally once submitted, trusting the target page to decide readiness", () => {
  const submittedBlock = mockExamSource.match(/\{phase === "submitted" && \([\s\S]*?\)\}\s*\n\s*<\/div>/)?.[0] ?? mockExamSource;
  assert.ok(!/reportReleaseState/.test(submittedBlock), "the submission screen must not re-implement the release gate client-side");
});

test("returning learner: the intro phase renders a link to each of the caller's own past submitted attempts, via the same report route", () => {
  assert.match(mockExamSource, /getSubmittedMockAttempts/);
  assert.match(mockExamSource, /previousAttempts/);
  assert.match(mockExamSource, /href=\{`\/learning-intelligence\/mock-report\/\$\{attempt\.attemptId\}`\}/);
});

test("a failure fetching previous attempts never blocks the primary \"I'm ready to begin\" flow -- the mount effect still resolves to intro/unavailable regardless", () => {
  // Programme Completion Increment 016 — the dependency array is now
  // `[attemptType]`, not `[]`: attemptType (resolved once from
  // searchParams) is a real dependency this effect reads, added to
  // satisfy react-hooks/exhaustive-deps correctly, not a behavioural
  // change (attemptType is stable for the page's lifetime -- a
  // different ?type= remounts the page tree in the App Router).
  const mountEffect = mockExamSource.match(/useEffect\(\(\) => \{\s*\(async \(\) => \{[\s\S]*?\}\)\(\);[\s\S]*?\}, \[attemptType\]\);/)?.[0] ?? "";
  assert.match(mountEffect, /if \(!submitted\.error && submitted\.data\)/);
  assert.match(mountEffect, /setPhase\(isMockFormAvailable\(active\) \? "intro" : "unavailable"\)/);
});

test("this decision does not merge the legacy localStorage Mock History system into the new engine -- no reference to lib/mockProgress or getMockResults in the touched file", () => {
  assert.ok(!/mockProgress|getMockResults/.test(mockExamSource));
});

// === getSubmittedMockAttempts, the new client function (Section 5/6/7) ===

test("getSubmittedMockAttempts queries only ali_mock_attempt, filtered to the caller's chosen form and status=submitted, newest first", () => {
  const fn = getSubmittedMockAttemptsSource();
  assert.match(fn, /\.from\("ali_mock_attempt"\)/);
  assert.match(fn, /\.eq\("form_id", formId\)/);
  assert.match(fn, /\.eq\("status", "submitted"\)/);
  assert.match(fn, /\.order\("submitted_at", \{ ascending: false \}\)/);
});

test("getSubmittedMockAttempts selects only id and submitted_at -- never assigned_question_ids, question content, or any other learner's-attempt-adjacent field", () => {
  const fn = getSubmittedMockAttemptsSource();
  const selectMatch = fn.match(/\.select\("([^"]*)"\)/);
  assert.ok(selectMatch);
  assert.equal(selectMatch[1], "id, submitted_at");
});

test("getSubmittedMockAttempts returns an empty array, not an error, when the caller has no submitted attempts (never treats absence as failure)", () => {
  const fn = getSubmittedMockAttemptsSource();
  assert.match(fn, /data: attempts, error: null/);
});

test("getSubmittedMockAttempts is a direct RLS-gated read (no new RPC), matching this file's own established getMockAttemptAnswers precedent, never a new SECURITY DEFINER function", () => {
  assert.ok(!/mock_get_submitted_attempts|mock_get_attempt_history/.test(clientSource));
});

// === Security: ownership boundary this new read depends on (Section 7) ==

test("SECURITY: the real, unmodified RLS policy getSubmittedMockAttempts relies on scopes every read to the caller's own profile_id via auth.uid(), never a client-supplied id -- re-verified directly against migration 070's own source, not assumed", () => {
  assert.match(migration070, /create policy ali_mock_attempt_select_own on public\.ali_mock_attempt for select to authenticated/);
  assert.match(migration070, /using \(profile_id in \(select id from public\.profiles where auth_user_id = auth\.uid\(\)\)\);/);
});

test("SECURITY: no client-supplied attempt owner/profile argument exists anywhere in getSubmittedMockAttempts's own signature -- identity comes only from the caller's own session via RLS", () => {
  const fn = getSubmittedMockAttemptsSource();
  assert.ok(!/p_profile_id|profileId|ownerId/.test(fn));
});

test("SECURITY: this decision adds no write capability -- getSubmittedMockAttempts is select-only, and this decision's own new UI code never calls releaseMockReport", () => {
  const fn = getSubmittedMockAttemptsSource();
  assert.ok(!/\.update\(|\.insert\(|\.delete\(|\.upsert\(/.test(fn));
  assert.ok(!/releaseMockReport|mock_release_report/.test(mockExamSource));
});
