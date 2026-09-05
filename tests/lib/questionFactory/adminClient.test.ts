import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Question Factory Wave 2, Section 4 — the client-side wrapper around
 * migration 230's RPCs. Structural assertions proving this layer adds no
 * write path of its own beyond the three narrow RPCs, and never exposes a
 * bulk-decision API -- matching the Founder's explicit "do not allow bulk
 * approve everything" instruction at every layer, not only the database.
 */

const CLIENT_SOURCE = readFileSync("lib/questionFactory/adminClient.ts", "utf8");
const PAGE_RAW = readFileSync("app/admin-beta/question-factory/page.tsx", "utf8");
// Doc comments legitimately explain what this page does NOT do (e.g. "no
// approve all control") -- stripped before asserting on executable JSX/TS,
// matching this repository's own established convention elsewhere.
const PAGE_SOURCE = PAGE_RAW.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");

test("adminClient.ts never writes directly to ali_question_candidate or ali_question_bank -- every mutation is an RPC call", () => {
  assert.doesNotMatch(CLIENT_SOURCE, /\.from\("ali_question_candidate"\)\.(insert|update|upsert|delete)/);
  assert.doesNotMatch(CLIENT_SOURCE, /\.from\("ali_question_bank"\)/);
});

test("reviewQuestionFactoryCandidate's own signature takes exactly one candidateId (string), never an array -- no bulk-decision entry point exists", () => {
  const fnMatch = CLIENT_SOURCE.match(/export async function reviewQuestionFactoryCandidate\(([\s\S]*?)\): Promise<ReviewDecisionResult>/);
  assert.ok(fnMatch, "expected to find reviewQuestionFactoryCandidate's signature");
  assert.doesNotMatch(fnMatch![1], /candidateIds|:\s*string\[\]/);
  assert.match(fnMatch![1], /candidateId: string/);
});

test("publishQuestionFactoryCandidate's own signature takes exactly one candidateId, never an array", () => {
  const fnMatch = CLIENT_SOURCE.match(/export async function publishQuestionFactoryCandidate\(([\s\S]*?)\): Promise<PublishResult>/);
  assert.ok(fnMatch, "expected to find publishQuestionFactoryCandidate's signature");
  assert.doesNotMatch(fnMatch![1], /candidateIds|:\s*string\[\]/);
});

test("the review RPC call forwards exactly the caller-supplied decision/reason -- never defaults a missing reason to a placeholder string that would satisfy the server-side NOT NULL check without a genuine reason", () => {
  const rpcCall = CLIENT_SOURCE.match(/supabase\.rpc\("review_question_candidate", \{[\s\S]*?\}\);/)?.[0] ?? "";
  assert.match(rpcCall, /p_rejection_reason: rejectionReason \?\? null/);
  assert.doesNotMatch(rpcCall, /p_rejection_reason: rejectionReason \?\? ['"][\w\s]+['"]/, "must never substitute a fabricated default reason string");
});

test("the admin review page never presents a bulk/'approve all' control -- no control iterates the full candidate list to approve more than one at once", () => {
  assert.doesNotMatch(PAGE_SOURCE, /approve\s*all/i);
  assert.doesNotMatch(PAGE_SOURCE, /candidates\.map\([^)]*=>[^)]*handleApprove/i);
  assert.doesNotMatch(PAGE_SOURCE, /candidates\.forEach/i);
});

test("the admin review page's approve/reject/publish buttons each act on exactly one candidate's own id, sourced from the CandidateCard's own props", () => {
  assert.match(PAGE_SOURCE, /reviewQuestionFactoryCandidate\(supabase, candidate\.candidateId, "approved"\)/);
  assert.match(PAGE_SOURCE, /publishQuestionFactoryCandidate\(supabase, candidate\.candidateId\)/);
});

test("rejection/needs-correction requires the reviewer to type a reason before the action can be confirmed -- the confirm button is disabled without one", () => {
  assert.match(PAGE_SOURCE, /disabled=\{busy \|\| !rejectionReason\.trim\(\)\}/);
});

test("the page uses the SAME admin-gating pattern as the existing app/admin-beta/review/page.tsx -- checkIsAdmin() from lib/feedback.ts, not a new authorisation mechanism", () => {
  assert.match(PAGE_SOURCE, /import \{ checkIsAdmin \} from "@\/lib\/feedback";/);
  assert.match(PAGE_SOURCE, /checkIsAdmin\(\)\.then\(\(isAdmin\) => setAccess\(isAdmin \? "admin" : "not-admin"\)\);/);
});

test("published questions are shown with their real published_question_id, never fabricated or hidden", () => {
  assert.match(PAGE_SOURCE, /Published as \{candidate\.publishedQuestionId\}/);
});
