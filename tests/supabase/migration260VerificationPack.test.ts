import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { buildDatabase, readMigration, splitStatements } from "./support/pgliteHarness";

/**
 * The Founder runs ANGEL_MULTI_LEARNER_MIGRATION_VERIFICATION_PACK.sql in the
 * Supabase SQL Editor before and after migration 260. This proves, on real
 * Postgres, that the pack is (a) valid SQL, (b) strictly read-only, and (c)
 * reports the expected before/after values.
 */

const PACK = fs.readFileSync("ANGEL_MULTI_LEARNER_MIGRATION_VERIFICATION_PACK.sql", "utf8");
const statements = splitStatements(PACK).filter((s) => /^\s*(--[^\n]*\n\s*)*select/i.test(s) || /^select/i.test(s.replace(/^(\s|--[^\n]*\n)+/g, "")));

test("the pack is read-only: no statement other than SELECT", () => {
  const all = splitStatements(PACK).map((s) => s.replace(/^(\s|--[^\n]*\n)+/g, ""));
  for (const s of all) assert.match(s, /^select/i, `non-SELECT statement in the pack: ${s.slice(0, 60)}`);
  assert.ok(all.length >= 8);
  // Strip comments and string literals (e.g. 'UPDATE' inside has_column_privilege) before scanning for write verbs.
  const code = PACK.replace(/--[^\n]*/g, "").replace(/'[^']*'/g, "''");
  assert.doesNotMatch(code, /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke)\b/i);
});

test("every pack statement runs on real Postgres, before and after migration 260, with the documented values", async () => {
  const { db } = await buildDatabase(259);
  await db.exec(`
    insert into auth.users (id, email) values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'a@example.test');
    insert into public.profiles (id, device_id, auth_user_id, selected_pathway_id)
      values ('a1a1a1a1-0000-4000-8000-000000000001', 'dev-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'csse');
  `);

  const runAll = async () => {
    const out: Record<string, unknown>[][] = [];
    for (const s of statements) out.push((await db.query<Record<string, unknown>>(s)).rows);
    return out;
  };

  const before = await runAll();
  assert.equal(before.length, statements.length);
  assert.equal(before[0][0].accounts_with_more_than_one_profile, 0);
  assert.equal(before[4][0].is_admin_updatable_by_clients, true, "the gap is visible BEFORE");
  assert.equal(before[6][0].profiles_auth_user_id_key_exists, true);
  assert.equal(before[6][0].ownership_guard_trigger, false);

  await db.exec(readMigration("260"));
  const after = await runAll();
  assert.deepEqual(after[1], before[1], "profile identity checksum unchanged");
  assert.deepEqual(after[2], before[2], "every learner-keyed table row count unchanged");
  assert.deepEqual(after[3], before[3], "per-account evidence unchanged");
  assert.equal(after[4][0].is_admin_updatable_by_clients, false);
  assert.equal(after[4][0].owner_updatable_by_clients, false);
  assert.equal(after[4][0].pathway_updatable_by_clients_expected_true, true);
  assert.equal(after[5][0].functions_still_resolving_learner_by_account, 0);
  assert.ok(Number(after[5][0].functions_using_active_learner_resolution) >= 20);
  assert.equal(after[6][0].profiles_auth_user_id_key_exists, false);
  assert.equal(after[6][0].ownership_guard_trigger, true);
  assert.equal(after[6][0].create_learner_present, true);
  assert.equal(Number(after[6][0].new_columns_present_expect_4_after), 4);
});
