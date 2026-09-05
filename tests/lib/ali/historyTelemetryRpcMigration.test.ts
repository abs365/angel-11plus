import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Question Factory Wave 2, Section 1/2 — recordOutcome()'s bank-telemetry
 * write was migrated from a raw client-side fetch-then-update (silently
 * blocked by RLS since migration 084, and a real if low-volume
 * read-modify-write race) to a single call into the new, narrow,
 * server-authorised RPC (migration 229, corrected). Structural assertion
 * against the real source, matching this repository's own established
 * convention for verifying a change with no live-Postgres test harness.
 */

const SOURCE = readFileSync("lib/ali/history.ts", "utf8");

test("recordOutcome's bank telemetry write is now a single supabase.rpc('record_question_bank_telemetry', ...) call", () => {
  assert.match(SOURCE, /supabase\.rpc\("record_question_bank_telemetry", \{\s*\n\s*p_question_id: questionId,\s*\n\s*p_is_correct: isCorrect,\s*\n\s*\}\);/);
});

test("the old raw client-side fetch-then-update pattern against ali_question_bank's usage_count/avg_success_rate is gone", () => {
  assert.doesNotMatch(SOURCE, /\.select\("usage_count, avg_success_rate"\)/);
  assert.doesNotMatch(SOURCE, /update\(\{ usage_count: newUsageCount/);
});

test("the RPC call passes only questionId and isCorrect -- never a raw numeric usage_count/avg_success_rate value from client-side computation", () => {
  const rpcCallBlock = SOURCE.match(/supabase\.rpc\("record_question_bank_telemetry", \{[\s\S]*?\}\);/)?.[0] ?? "";
  assert.ok(rpcCallBlock.length > 0, "expected to find the RPC call");
  assert.doesNotMatch(rpcCallBlock, /newUsageCount|newAvg|prevAvg/);
});

test("a failure from the RPC is handled as best-effort (warn, never throw) -- identical failure behaviour to every other best-effort write in this function", () => {
  const rpcBlock = SOURCE.match(/const \{ error: bankTelemetryError \} = await supabase\.rpc\("record_question_bank_telemetry"[\s\S]*?\n  \}\n\}/)?.[0] ?? "";
  assert.match(rpcBlock, /console\.warn\("\[ALI\] recordOutcome bank telemetry RPC failed:", bankTelemetryError\.message\);/);
});

test("recordOutcome remains a fire-and-forget best-effort function overall -- it does not throw or return a status derived from the telemetry RPC", () => {
  const fnMatch = SOURCE.match(/export async function recordOutcome\([\s\S]*?\n\): Promise<void> \{/);
  assert.ok(fnMatch, "expected recordOutcome to still return Promise<void>");
});
