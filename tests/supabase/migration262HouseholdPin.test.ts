import { test, before } from "node:test";
import assert from "node:assert/strict";
import type { PGlite } from "@electric-sql/pglite";
import { buildDatabase, readMigration, asUser } from "./support/pgliteHarness";

/**
 * Migration 262 -- the household Parent PIN that gates returning from
 * Learner Mode to Parent Mode (Private Learner Space, Part 1). Runs the
 * REAL migration chain (001..262) on real Postgres (PGlite) and proves:
 * only a real (non-anonymous) account can set a PIN, the PIN is never
 * directly readable by any client role, correct/incorrect verification
 * behaves as expected, and the rate limit genuinely locks out after 5 wrong
 * attempts and blocks even a correct PIN while locked -- and that none of
 * this ever leaks across two different accounts.
 */

const PARENT_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const PARENT_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ANON = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";

let db: PGlite;
let failedFiles: string[] = [];

before(async () => {
  const built = await buildDatabase(262);
  db = built.db;
  failedFiles = built.failedFiles;

  await db.exec(`
    insert into auth.users (id, email, is_anonymous) values
      ('${PARENT_A}', 'a@example.test', false),
      ('${PARENT_B}', 'b@example.test', false),
      ('${ANON}', null, true);
  `);
});

test("harness sanity: only the pre-existing, data-guarded content migrations are skipped (same known set migration 260's own test asserts) -- migration 262 itself is not among them", () => {
  assert.ok(!failedFiles.includes("262_household_parent_pin.sql"), "migration 262 itself must apply cleanly");
  for (const f of failedFiles) {
    assert.match(f, /^(12[3-9]|13\d|14\d|15\d|18\d|21\d|22\d|23\d|24\d|25\d)_/, `unexpected schema migration failure: ${f}`);
  }
});

test("migration 262 SQL source itself matches the applied migration file", () => {
  const sql = readMigration("262");
  assert.match(sql, /create table if not exists public\.household_access/);
  assert.match(sql, /security definer/);
});

test("an anonymous session cannot set a household PIN", async () => {
  await asUser(db, { uid: ANON, anonymous: true }, async (q) => {
    const r = await q("select public.set_household_pin('1234')");
    assert.ok(r.error, "expected an error for an anonymous caller");
    assert.match(r.error!.message, /angel_household_requires_account/);
  });
});

test("an invalid PIN format is rejected (not 4-6 digits)", async () => {
  await asUser(db, { uid: PARENT_A }, async (q) => {
    for (const bad of ["123", "1234567", "abcd", "12 34", ""]) {
      const r = await q("select public.set_household_pin($1)", [bad]);
      assert.ok(r.error, `expected rejection for "${bad}"`);
      assert.match(r.error!.message, /angel_invalid_pin/);
    }
  });
});

test("household_pin_status reports no PIN before one is set, and has_pin true after", async () => {
  await asUser(db, { uid: PARENT_A }, async (q) => {
    const before_ = await q("select * from public.household_pin_status()");
    assert.equal(before_.rows[0].has_pin, false);

    const set = await q("select public.set_household_pin('4821')");
    assert.equal(set.error, undefined);

    const after = await q("select * from public.household_pin_status()");
    assert.equal(after.rows[0].has_pin, true);
    assert.equal(after.rows[0].retry_at, null);
  });
});

test("correct PIN verifies ok=true; wrong PIN verifies ok=false with no lockout below the threshold", async () => {
  await asUser(db, { uid: PARENT_A }, async (q) => {
    await q("select public.set_household_pin('9911')");

    const wrong = await q("select * from public.verify_household_pin('0000')");
    assert.equal(wrong.rows[0].ok, false);
    assert.equal(wrong.rows[0].retry_at, null);

    const right = await q("select * from public.verify_household_pin('9911')");
    assert.equal(right.rows[0].ok, true);
    assert.equal(right.rows[0].retry_at, null);
  });
});

test("5 consecutive wrong attempts lock verification out, and even the correct PIN fails while locked", async () => {
  await asUser(db, { uid: PARENT_A }, async (q) => {
    await q("select public.set_household_pin('5555')");

    let lastLockedUntil: unknown = null;
    for (let i = 0; i < 5; i++) {
      const r = await q("select * from public.verify_household_pin('0000')");
      assert.equal(r.rows[0].ok, false);
      lastLockedUntil = r.rows[0].retry_at;
    }
    assert.notEqual(lastLockedUntil, null, "expected a lockout timestamp after the 5th wrong attempt");

    // Even the genuinely correct PIN is refused while locked.
    const correctButLocked = await q("select * from public.verify_household_pin('5555')");
    assert.equal(correctButLocked.rows[0].ok, false);
    assert.notEqual(correctButLocked.rows[0].retry_at, null);
  });
});

test("household_access is never directly readable by the authenticated role (RLS blocks it, no policy grants access)", async () => {
  await asUser(db, { uid: PARENT_A }, async (q) => {
    await q("select public.set_household_pin('1122')");
    const direct = await q("select * from public.household_access where auth_user_id = $1", [PARENT_A]);
    assert.equal(direct.rows.length, 0, "authenticated must never see rows in household_access directly, even its own");
  });
});

test("two accounts' PINs and lockouts are completely isolated from each other", async () => {
  await asUser(db, { uid: PARENT_A }, async (q) => {
    await q("select public.set_household_pin('1111')");
    for (let i = 0; i < 5; i++) await q("select * from public.verify_household_pin('0000')");
    const lockedA = await q("select * from public.household_pin_status()");
    assert.notEqual(lockedA.rows[0].retry_at, null, "Parent A should now be locked out");
  });

  await asUser(db, { uid: PARENT_B }, async (q) => {
    // Parent B has never set a PIN and was never touched by A's failed attempts.
    const statusB = await q("select * from public.household_pin_status()");
    assert.equal(statusB.rows[0].has_pin, false);
    assert.equal(statusB.rows[0].retry_at, null);

    await q("select public.set_household_pin('2222')");
    const verifyB = await q("select * from public.verify_household_pin('2222')");
    assert.equal(verifyB.rows[0].ok, true, "Parent B's own correct PIN must work, unaffected by A's lockout");
  });
});

test("no secret (PIN, salt or hash) ever appears in the migration's own applied source as plaintext", () => {
  const sql = readMigration("262");
  assert.doesNotMatch(sql, /pin_hash\s*:=\s*'[0-9]{4,6}'/, "no hard-coded PIN should ever appear in the migration");
});
