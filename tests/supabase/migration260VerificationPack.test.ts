import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { buildDatabase, readMigration, splitStatements } from "./support/pgliteHarness";

/**
 * The Founder runs ANGEL_MULTI_LEARNER_MIGRATION_VERIFICATION_PACK.sql in the Supabase SQL Editor BEFORE and AFTER
 * migration 260. It must be ONE statement returning ONE copyable JSON cell, strictly read-only, free of personal
 * data, and its PASS/WARN/FAIL logic must be right in both phases. Proven here on real Postgres.
 */

const PACK = fs.readFileSync("ANGEL_MULTI_LEARNER_MIGRATION_VERIFICATION_PACK.sql", "utf8");
const statements = splitStatements(PACK).map((s) => s.replace(/^(\s|--[^\n]*\n)+/g, "")).filter(Boolean);

interface Result {
  overall: string;
  phase: string;
  checks: { check: string; status: string; detail: string }[];
  account_counts: Record<string, number>;
  invariants_compare_BEFORE_vs_AFTER: { profile_identity_checksum: string; evidence_rows_total: number; evidence_fingerprint: string };
  evidence_rows_per_table: Record<string, number>;
  rls_by_table: Record<string, boolean>;
  legacy_resolver_functions: string[];
  column_privileges_for_authenticated: Record<string, boolean>;
}

test("the preflight is ONE read-only statement with no placeholders and no personal-data columns", () => {
  assert.equal(statements.length, 1, "the SQL Editor only shows the last result of a multi-statement script");
  assert.match(statements[0], /^with\b/i);
  const code = PACK.replace(/--[^\n]*/g, "").replace(/'[^']*'/g, "''");
  assert.doesNotMatch(code, /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke)\b/i);
  assert.doesNotMatch(PACK, /PASTE_|REPLACE|<[A-Z_]+>/, "nothing for the Founder to fill in");
  assert.doesNotMatch(code, /\bemail\b|\bu\.name\b|raw_user_meta_data|encrypted_password|access_token/i, "no email/name/secret columns");
});

test("BEFORE and AFTER migration 260 on real Postgres: correct phase, PASS/WARN/FAIL, and identical invariants", async () => {
  const { db } = await buildDatabase(259);
  await db.exec(`
    insert into auth.users (id, email, is_anonymous) values
      ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', null, true), ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'b@example.test', false);
    insert into public.profiles (id, device_id, auth_user_id, selected_pathway_id) values
      ('a1a1a1a1-0000-4000-8000-000000000001', 'dev-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'csse'),
      ('b1b1b1b1-0000-4000-8000-000000000001', 'dev-b', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', null);
    insert into public.user_stats (profile_id, total_xp, streak) values ('a1a1a1a1-0000-4000-8000-000000000001', 69, 1);
  `);
  const run = async (): Promise<Result> => JSON.parse((await db.query<{ preflight_result: string }>(statements[0])).rows[0].preflight_result);
  const status = (r: Result, name: string) => r.checks.find((c) => c.check === name)?.status;

  const before = await run();
  assert.equal(before.phase, "BEFORE");
  assert.notEqual(before.overall, "FAIL", JSON.stringify(before.checks.filter((c) => c.status === "FAIL")));
  assert.equal(status(before, "required_tables_present"), "PASS");
  assert.equal(status(before, "one_learner_per_account_before"), "PASS");
  assert.equal(status(before, "legacy_learner_resolvers"), "PASS");
  assert.ok(before.legacy_resolver_functions.length >= 20, "the resolvers migration 260 will rewrite are listed by name");
  assert.equal(status(before, "is_admin_and_owner_not_client_writable"), "WARN", "the known pre-existing gap is flagged BEFORE");
  assert.equal(before.column_privileges_for_authenticated.is_admin_update, true);
  assert.equal(before.account_counts.anonymous_owned, 1);
  assert.equal(before.account_counts.permanent_owned, 1);
  assert.equal(before.account_counts.accounts_with_multiple_learners, 0);
  assert.equal(before.rls_by_table.profiles, true);

  await db.exec(readMigration("260"));
  const after = await run();
  assert.equal(after.phase, "AFTER");
  assert.notEqual(after.overall, "FAIL", JSON.stringify(after.checks.filter((c) => c.status === "FAIL")));
  assert.equal(status(after, "legacy_learner_resolvers"), "PASS");
  assert.equal(status(after, "is_admin_and_owner_not_client_writable"), "PASS");
  assert.equal(status(after, "new_columns_and_functions"), "PASS");
  assert.equal(after.legacy_resolver_functions.length, 0);
  assert.equal(after.column_privileges_for_authenticated.is_admin_update, false);
  assert.equal(after.column_privileges_for_authenticated.auth_user_id_update, false);
  assert.equal(after.column_privileges_for_authenticated.selected_pathway_id_update, true);
  // The invariants the Founder compares.
  assert.equal(after.invariants_compare_BEFORE_vs_AFTER.profile_identity_checksum, before.invariants_compare_BEFORE_vs_AFTER.profile_identity_checksum);
  assert.equal(after.invariants_compare_BEFORE_vs_AFTER.evidence_fingerprint, before.invariants_compare_BEFORE_vs_AFTER.evidence_fingerprint);
  assert.deepEqual(after.evidence_rows_per_table, before.evidence_rows_per_table);

  // A regression the pack must catch: client UPDATE on is_admin restored after the migration -> FAIL.
  await db.exec("grant update on public.profiles to authenticated");
  const regressed = await run();
  assert.equal(regressed.overall, "FAIL");
  assert.equal(status(regressed, "is_admin_and_owner_not_client_writable"), "FAIL");
  await db.exec("revoke update on public.profiles from authenticated");

  // And a half-applied migration (uniqueness dropped but no guard) -> FAIL.
  await db.exec("drop trigger profiles_guard_learner_ownership on public.profiles");
  const partial = await run();
  assert.equal(partial.overall, "FAIL");
  assert.equal(status(partial, "not_partially_applied"), "FAIL");
});
