import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { buildDatabase, splitStatements } from "./support/pgliteHarness";

/**
 * The Founder runs ANGEL_ACCOUNT_ISOLATION_PROVENANCE_CHECK.sql in the Supabase SQL Editor. Prove on real Postgres
 * that it is valid, strictly read-only, returns only redacted identifiers/counts, and answers the questions it claims to.
 */
const PACK = fs.readFileSync("ANGEL_ACCOUNT_ISOLATION_PROVENANCE_CHECK.sql", "utf8");
const statements = splitStatements(PACK).map((s) => s.replace(/^(\s|--[^\n]*\n)+/g, "")).filter(Boolean);

test("the provenance pack is read-only and exposes no email/name column in its output", () => {
  assert.equal(statements.length, 4);
  for (const s of statements) assert.match(s, /^select/i);
  const code = PACK.replace(/--[^\n]*/g, "").replace(/'[^']*'/g, "''");
  assert.doesNotMatch(code, /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke)\b/i);
  for (const s of statements) {
    const selectList = s.slice(0, s.search(/\bfrom\b/i));
    assert.doesNotMatch(selectList, /u\.email\s+as|,\s*u\.email\b|\bname\b/i, "must not select email/name");
  }
});

test("every statement runs on real Postgres and distinguishes an anonymous previous owner from a permanent one", async () => {
  const { db } = await buildDatabase(259);
  // auth.users in the test harness is a minimal stub; add the real columns the pack reads.
  await db.exec(`
    alter table auth.users add column if not exists encrypted_password text;
    alter table auth.users add column if not exists recovery_sent_at timestamptz;
    alter table auth.users add column if not exists last_sign_in_at timestamptz;
    alter table auth.users add column if not exists created_at timestamptz default now();
    insert into auth.users (id, email, is_anonymous, encrypted_password) values
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', null, true, ''),                          -- previous owner of the browser: anonymous
      ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'new.parent@example.test', false, ''),   -- the NEW passwordless parent
      ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'pw.parent@example.test', false, 'hash'); -- a parent who set a password
    insert into public.profiles (id, device_id, auth_user_id) values
      ('a1a1a1a1-0000-4000-8000-000000000001', 'dev-browser-1', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'),
      ('b1b1b1b1-0000-4000-8000-000000000001', 'fresh-device-b', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');
  `);
  const sub = (s: string) => s.replace(/<NEW_ACCOUNT_EMAIL>/g, "new.parent@example.test").replace(/<DEVICE_ID>/g, "dev-browser-1");
  const [q1, q2, q3, q4] = await Promise.all(statements.map(async (s) => (await db.query<Record<string, unknown>>(sub(s))).rows));

  assert.equal(q1[0].is_anonymous, false);
  assert.equal(q1[0].has_stored_password_value, false); // stub account with an empty hash; real email-link accounts store a random temporary hash
  assert.equal(q2[0].lesson_progress_rows, 0);
  assert.notEqual(q2[0].device_prefix, "dev-brow", "new account was issued a different device id");
  assert.equal(q3[0].owner_is_anonymous, true, "the pack identifies the previous owner of the browser as anonymous");
  assert.equal(q3[0].owner_has_email, false);
  assert.equal(Number(q4[0].permanent_with_stored_password_value), 1);
  assert.equal(Number(q4[0].permanent_without_stored_password_value), 1);
  assert.equal(Number(q4[0].anonymous), 1);
});
