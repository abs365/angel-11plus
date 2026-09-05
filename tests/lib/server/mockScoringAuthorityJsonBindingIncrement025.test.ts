import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import postgres from "postgres";

/**
 * Increment 025 (Founder-approved correction) — the persist call's manual
 * `JSON.stringify(outcomes)::jsonb` boundary was replaced with postgres.js's
 * own explicit JSONB parameter mechanism, `sql.json()`. This was NOT a
 * proven root-cause fix (static/local reproduction proved the prior form
 * did not double-encode) — it removes an unnecessary manual serialization
 * step at the exact boundary production evidence named, using the
 * driver's own supported mechanism.
 *
 * `scoreReadingAttempt()` itself still cannot be exercised end-to-end
 * without a real Postgres connection (this codebase's own established
 * convention for this file — see mockScoringAuthorityIncrement016.test.ts's
 * own docstring). What CAN be tested for real, without any connection,
 * is `sql.json()`'s own actual behaviour: constructing a `postgres()`
 * client is lazy (no network I/O until a query is sent, verified by this
 * session's own diagnostic — creating and immediately discarding a client
 * against an unreachable address does not hang or throw), so its `.json()`
 * helper can be invoked and inspected directly for real, not merely
 * asserted present via source-text regex.
 */

const AUTHORITY = readFileSync("lib/server/mockScoringAuthority.ts", "utf8");

test("sql.json(outcomes) binds the array directly -- the resulting Parameter carries the real array (not a stringified copy) tagged with the jsonb OID (3802)", async () => {
  const sql = postgres("postgres://user:pass@127.0.0.1:1/unreachable", { max: 0 });
  try {
    const outcomes = [
      { questionId: "synthetic-q1", marksAwarded: 1 },
      { questionId: "synthetic-q2", marksAwarded: 0 },
    ];
    const param = sql.json(outcomes);
    assert.equal(param.type, 3802, "sql.json() must tag the parameter with the jsonb type OID");
    assert.ok(Array.isArray(param.value), "the bound value must remain a real array -- not a JSON string");
    assert.deepEqual(param.value, outcomes, "the bound value must be exactly the outcomes array, unmodified");
    assert.notEqual(typeof param.value, "string", "no double encoding: the parameter must never be a stringified copy of the array");
  } finally {
    await sql.end({ timeout: 0 });
  }
});

test("sql.json() does not double-encode -- contrasted directly against what double encoding would look like", async () => {
  const sql = postgres("postgres://user:pass@127.0.0.1:1/unreachable", { max: 0 });
  try {
    const outcomes = [{ questionId: "synthetic-q1", marksAwarded: 1 }];
    const param = sql.json(outcomes);
    const doubleEncodedShape = JSON.stringify(JSON.stringify(outcomes));
    assert.notEqual(JSON.stringify(param.value), doubleEncodedShape, "sql.json()'s bound value must not match what a double-encoded string would look like");
    assert.equal(JSON.stringify(param.value), JSON.stringify(outcomes), "sql.json()'s bound value must serialize identically to the original outcomes array");
  } finally {
    await sql.end({ timeout: 0 });
  }
});

test("the persist call now uses sql.json(outcomes) -- the manual JSON.stringify(outcomes)::jsonb boundary is fully removed from the actual query, not merely supplemented", () => {
  const persistCallLine = AUTHORITY.match(/^.*select mock_persist_reading_scoring\(.*$/m);
  assert.ok(persistCallLine, "expected the persist call line");
  assert.match(persistCallLine![0], /\$\{attemptId\}::uuid, \$\{sql\.json\(outcomes as unknown as postgres\.JSONValue\)\}/);
  assert.doesNotMatch(persistCallLine![0], /JSON\.stringify/, "the old manual serialization of outcomes must be fully removed from the query itself (explanatory comments elsewhere may still name it for context)");
});

test("the application fails closed with a fixed, content-free error if outcomes is somehow not an array immediately before persistence", () => {
  assert.match(AUTHORITY, /if \(!Array\.isArray\(outcomes\)\) \{/);
  const guardBlock = AUTHORITY.match(/if \(!Array\.isArray\(outcomes\)\) \{([\s\S]*?)\n {4}\}/);
  assert.ok(guardBlock, "expected the array-invariant guard block");
  const body = guardBlock![1];
  assert.match(body, /throw new Error\(/, "must fail closed by throwing, never silently repairing or defaulting the value");
  assert.doesNotMatch(body, /outcomes\)/, "must never interpolate the outcomes payload itself into the thrown error");
  assert.doesNotMatch(body, /console\./, "must not log anything -- this is a thrown invariant, not a new observability point");
});

test("the array-invariant check runs strictly before the persist call, on the same outcomes value computeReadingScoringOutcomes produced -- no repair, no re-assignment of outcomes anywhere in between", () => {
  const computeIndex = AUTHORITY.indexOf("const outcomes = computeReadingScoringOutcomes(");
  const guardIndex = AUTHORITY.indexOf("if (!Array.isArray(outcomes)) {");
  const persistCallIndex = AUTHORITY.indexOf("select mock_persist_reading_scoring(");
  assert.ok(computeIndex !== -1 && guardIndex !== -1 && persistCallIndex !== -1);
  assert.ok(computeIndex < guardIndex && guardIndex < persistCallIndex, "expected order: compute -> array guard -> persist call");
  const between = AUTHORITY.slice(computeIndex, persistCallIndex);
  const assignments = between.match(/\boutcomes\s*=[^=]/g) ?? [];
  assert.equal(assignments.length, 1, "expected exactly one assignment to outcomes in this stretch -- its own initial declaration -- and no reassignment before persistence");
  assert.equal(between.indexOf("outcomes ="), 6, "the one assignment must be the original 'const outcomes = ...' declaration at the very start of this stretch, not a later reassignment");
});

test("mockScoringAuthority.ts still calls only the two narrow migration-219 functions -- the binding change did not introduce a new database call", () => {
  const rpcCalls = AUTHORITY.match(/select mock_\w+\(/g) ?? [];
  assert.equal(rpcCalls.length, 2, "expected exactly the claim call and the persist call, no more");
});
