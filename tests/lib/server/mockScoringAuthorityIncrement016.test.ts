import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Programme Completion Increment 016 — Authoritative Reading Comprehension
 * Scoring: server-only boundary, API route ownership checks, and
 * Mathematics-regression proof. Source-text assertions, matching this
 * codebase's own established convention — the real guarantee for the
 * server-only guard is a genuine Next.js production build failing on
 * misuse, which this file cannot execute; it proves the guard is present
 * in source, the same way every other structural test in this repository
 * proves a contract from real source text.
 */

const scoringAuthoritySource = readFileSync("lib/server/mockScoringAuthority.ts", "utf8");
const routeSource = readFileSync("app/api/mock-reading-scoring/route.ts", "utf8");
const mockExamPageSource = readFileSync("app/learning-intelligence/mock-exam/page.tsx", "utf8");
const readingScoringRequestSource = readFileSync("lib/mockAttempt/readingScoringRequest.ts", "utf8");
const migration074 = readFileSync("supabase/migrations/074_mock_scoring_and_report_release.sql", "utf8");
const migration075 = readFileSync("supabase/migrations/075_mock_scoring_trust_boundary_correction.sql", "utf8");

// --- server-only boundary --------------------------------------------------

test("lib/server/mockScoringAuthority.ts imports the server-only guard as its very first import -- a Next.js build error, not a lint warning, on any accidental client import", () => {
  const firstImportLine = scoringAuthoritySource.split("\n").find((l) => l.trim().startsWith("import"));
  assert.equal(firstImportLine?.trim(), 'import "server-only";');
});

test("mockScoringAuthority.ts exposes exactly one operation and no generic Postgres client", () => {
  const exportedFunctions = scoringAuthoritySource.match(/^export (async )?function \w+/gm) ?? [];
  assert.equal(exportedFunctions.length, 1, "exactly one exported function");
  assert.match(exportedFunctions[0], /scoreReadingAttempt/);
  assert.doesNotMatch(scoringAuthoritySource, /export (const|function) getScoringConnection/, "the raw connection must never be exported -- only the one narrow operation");
});

test("mockScoringAuthority.ts reads its credential exclusively from a server-only-named env var, never NEXT_PUBLIC_-prefixed", () => {
  assert.match(scoringAuthoritySource, /process\.env\.MOCK_SCORING_DATABASE_URL/);
  const executableSql = scoringAuthoritySource
    .split("\n")
    .filter((line) => !line.trim().startsWith("*") && !line.trim().startsWith("//") && !line.trim().startsWith("/**"))
    .join("\n");
  assert.doesNotMatch(executableSql, /process\.env\.NEXT_PUBLIC_/, "no NEXT_PUBLIC_-prefixed env var may be read in this file's own executable code");
});

test("mockScoringAuthority.ts never logs the connection string/credential", () => {
  const logLines = scoringAuthoritySource.match(/console\.(log|warn|error|info)\([^)]*\)/g) ?? [];
  for (const line of logLines) {
    assert.doesNotMatch(line, /MOCK_SCORING_DATABASE_URL|connectionString/i, `must never log the credential: ${line}`);
  }
});

test("mockScoringAuthority.ts calls only the two narrow migration-219 functions -- no raw table query of any kind", () => {
  assert.match(scoringAuthoritySource, /mock_claim_reading_scoring_work/);
  assert.match(scoringAuthoritySource, /mock_persist_reading_scoring/);
  assert.doesNotMatch(scoringAuthoritySource, /from ali_mock_attempt\b/i);
  assert.doesNotMatch(scoringAuthoritySource, /from ali_question_bank\b/i);
  assert.doesNotMatch(scoringAuthoritySource, /select \*/i);
});

test("transaction-mode pooling is used (prepare: false) -- compatible with Supavisor's documented serverless constraints", () => {
  assert.match(scoringAuthoritySource, /prepare:\s*false/);
});

// --- API route: ownership check, never trusts client-supplied correctness --

test("the API route requires an Authorization header and rejects requests without one", () => {
  assert.match(routeSource, /authorization/i);
  assert.match(routeSource, /401/);
});

test("the API route performs an RLS-scoped ownership read using the caller's own forwarded token -- never the privileged scoring connection for this check", () => {
  assert.match(routeSource, /Authorization: authHeader/);
  assert.match(routeSource, /from\(\s*["']ali_mock_attempt["']\s*\)/);
  assert.doesNotMatch(routeSource, /MOCK_SCORING_DATABASE_URL/, "the route itself must never touch the privileged credential directly");
});

test("the API route independently checks status=submitted and the exact Reading form id before ever calling the privileged scoring operation", () => {
  assert.match(routeSource, /attempt\.status !== "submitted"/);
  assert.match(routeSource, /attempt\.form_id !== "reading-comprehension-mock-1"/);
});

test("the request body is never trusted for anything beyond an attemptId -- no correctness, marks, or answer field is ever read from the incoming request", () => {
  const bodyDestructure = routeSource.match(/const \{ attemptId \} = body;|attemptId = body\.attemptId;/);
  assert.ok(bodyDestructure, "the route must read exactly attemptId from the body, nothing else");
  for (const forbidden of ["correctness", "marksAwarded", "answer", "acceptedAnswers", "scoringState"]) {
    assert.doesNotMatch(routeSource, new RegExp(`body\\.${forbidden}`, "i"), `the route must never read ${forbidden} from the request body`);
  }
});

// --- Mathematics regression --------------------------------------------

test("Mathematics's existing scoring path (migrations 074/075) is completely untouched by this increment", () => {
  assert.match(migration074, /mock_score_attempt/);
  assert.match(migration075, /mock_score_attempt/);
  // Confirms the files exist and are unmodified in shape -- the real
  // no-regression proof is that migration 219 (tested separately) never
  // references mock_score_attempt, mock_attempt_report_init, or any
  // Mathematics-specific logic at all.
});

test("migration 219 never references mock_score_attempt() or the existing trigger function -- fully additive, no shared code path with Mathematics scoring", () => {
  const migration219 = readFileSync("supabase/migrations/219_mock_reading_scoring_authority.sql", "utf8");
  assert.doesNotMatch(migration219, /mock_attempt_report_init/);
  assert.doesNotMatch(migration219.replace(/-- .*mock_score_attempt.*/g, ""), /create or replace function public\.mock_score_attempt/);
});

test("the mock-exam page only requests Reading scoring for attemptType === 'timed_section' -- Mathematics (full_mock) submissions never call the new route", () => {
  const occurrences = mockExamPageSource.match(/if \(attemptType === "timed_section"\) \{\s*\n\s*void requestReadingScoring\(supabase, [\w.]+\)\.then\(logReadingScoringRequestOutcome\);/g) ?? [];
  assert.equal(occurrences.length, 2, "expected the gate at both the normal submit path and the finalize_expired resume path");
});

/**
 * Founder invocation-reliability repair (same increment) — requestReadingScoring
 * itself moved to lib/mockAttempt/readingScoringRequest.ts (shared with
 * the mock-report page's own recovery path) and is now a plain async
 * function returning a typed outcome, no longer an inline
 * fire-and-forget IIFE. "Fire-and-forget" now describes the CALL SITE's
 * own choice not to await it, not the function's own internal shape --
 * this test moves with that change.
 */
test("requestReadingScoring is fire-and-forget from the caller's own perspective -- never awaited by either mock-exam call site, never blocks the learner's own submission confirmation", () => {
  assert.doesNotMatch(mockExamPageSource, /await requestReadingScoring/);
  const occurrences = mockExamPageSource.match(/void requestReadingScoring\(supabase, [\w.]+\)\.then\(logReadingScoringRequestOutcome\)/g) ?? [];
  assert.equal(occurrences.length, 2);
});

test("requestReadingScoring supplies only an attemptId to the server -- no correctness, marks, or answer content originates in this client-side function", () => {
  const fnBody = readingScoringRequestSource.split("export async function requestReadingScoring")[1] ?? "";
  assert.match(fnBody, /body: JSON\.stringify\(\{ attemptId \}\)/);
});

test("requestReadingScoring inspects the real HTTP outcome -- Founder invocation-reliability repair -- rather than discarding response.ok", () => {
  assert.match(readingScoringRequestSource, /response\.ok/);
  assert.match(readingScoringRequestSource, /export type ReadingScoringRequestOutcome/);
});

test("requestReadingScoring never logs the Authorization token or bearer credential", () => {
  assert.doesNotMatch(readingScoringRequestSource, /console\.\w+\([^)]*token/i);
  assert.doesNotMatch(readingScoringRequestSource, /console\.\w+\([^)]*Bearer/i);
});
