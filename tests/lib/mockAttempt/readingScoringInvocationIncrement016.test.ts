import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Programme Completion Increment 016 — Defect B correction (migration
 * 220). D: proves the application layer's Reading scoring invocation is
 * untouched by the migration 220 trigger repair -- the client still
 * requests /api/mock-reading-scoring for a timed_section submission, and
 * that route still hands off to scoreReadingAttempt() (migration 219's
 * own authority), never a second/duplicate scoring implementation.
 * Source-text assertions, matching this repository's own established
 * convention for proving a wiring contract without a full render harness.
 */

const MOCK_EXAM = fs.readFileSync("app/learning-intelligence/mock-exam/page.tsx", "utf8");
const ROUTE = fs.readFileSync("app/api/mock-reading-scoring/route.ts", "utf8");
const AUTHORITY = fs.readFileSync("lib/server/mockScoringAuthority.ts", "utf8");

test("D — a timed_section submission still fires requestReadingScoring, which POSTs to /api/mock-reading-scoring", () => {
  assert.match(MOCK_EXAM, /if \(attemptType === "timed_section"\) requestReadingScoring\(supabase, attemptId\);/);
  assert.match(MOCK_EXAM, /await fetch\("\/api\/mock-reading-scoring", \{/);
});

test("D — the request is fire-and-forget (never awaited by the submit handler) so a scoring-request failure cannot block the learner's own submission confirmation", () => {
  const handler = MOCK_EXAM.match(/if \(attemptType === "timed_section"\) requestReadingScoring\(supabase, attemptId\);\s*\n\s*setPhase\("submitted"\);/);
  assert.ok(handler, "requestReadingScoring must be called synchronously (not awaited) immediately before setPhase(\"submitted\")");
});

test("D — the API route hands off to scoreReadingAttempt, the one exported operation of the dedicated scoring authority module", () => {
  assert.match(ROUTE, /import \{ scoreReadingAttempt \} from "@\/lib\/server\/mockScoringAuthority";/);
  assert.match(ROUTE, /const result = await scoreReadingAttempt\(attemptId\);/);
});

test("D — the route authorizes via the caller's own forwarded session (ordinary RLS), never a privileged/service_role client", () => {
  assert.doesNotMatch(ROUTE, /service_role/i);
  assert.match(ROUTE, /Authorization: authHeader/);
});

test("no second Reading scoring implementation exists -- mockScoringAuthority.ts exports exactly one operation", () => {
  const exportedFunctions = [...AUTHORITY.matchAll(/^export (?:async )?function (\w+)/gm)].map((m) => m[1]);
  assert.deepEqual(exportedFunctions, ["scoreReadingAttempt"]);
});
