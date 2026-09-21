import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";

/**
 * Migration 261 (2026-09-21): the four derived learner analytics views from migration 003 were readable with the
 * PUBLIC anon key. The fix must stay bounded: only those four views, only narrowing changes.
 */
const FILE = "supabase/migrations/261_revoke_public_access_to_learner_analytics_views.sql";
const sql = fs.readFileSync(FILE, "utf8").replace(/\r\n/g, "\n");
const code = sql.replace(/--.*$/gm, "");
const VIEWS = ["profile_summary", "recent_activity", "lesson_analytics", "subject_analytics"];
const statements = code.split(";").map((s) => s.replace(/\s+/g, " ").trim()).filter(Boolean);

test("261 revokes every client privilege on exactly the four views", () => {
  const revoke = statements.find((s) => /^revoke all on /i.test(s));
  assert.ok(revoke, "must revoke");
  for (const v of VIEWS) assert.ok(revoke!.includes(`public.${v}`), v);
  assert.match(revoke!, /from public, anon, authenticated$/i);
});

test("261 makes each of the four views run with the caller's rights", () => {
  for (const v of VIEWS) {
    assert.ok(statements.includes(`alter view public.${v} set (security_invoker = true)`), v);
  }
});

test("261 contains nothing else: five statements, all narrowing, no grant/policy/table/function/data change", () => {
  assert.equal(statements.length, 5);
  assert.doesNotMatch(code, /\b(grant|create|drop|insert|update|delete|truncate|policy|function|trigger)\b/i);
});

test("261 names only the four views (no other relation is touched)", () => {
  const named = [...code.matchAll(/public\.([a-z_]+)/gi)].map((m) => m[1]);
  assert.deepEqual([...new Set(named)].sort(), [...VIEWS].sort());
});

test("migration 260 is byte-for-byte unchanged", () => {
  const buf = fs.readFileSync("supabase/migrations/260_multi_learner_household_architecture.sql");
  assert.equal(buf.length, 24340);
  assert.equal(crypto.createHash("sha256").update(buf).digest("hex").toUpperCase(), "2E76C5F454E69D217FA3FA947F138C399359AA310CCB4BB30BFC08224FB8FD58");
});
