import { test, before } from "node:test";
import assert from "node:assert/strict";
import type { PGlite } from "@electric-sql/pglite";
import { buildDatabase, readMigration, asUser } from "./support/pgliteHarness";

/**
 * Migration 263 -- the learner-specific PIN that binds Learner Mode to the
 * authorised learner (Private Learner Space, Part 2). Runs the REAL
 * migration chain (001..263) on real Postgres (PGlite) and proves: only the
 * owning parent account can set/verify a learner's PIN, a learner with no
 * PIN configured is unaffected (opt-in), current_learner_id() requires a
 * MATCHING session token once a PIN is configured, a token minted for one
 * learner never satisfies a request naming a different sibling (the exact
 * cross-learner scenario the governing production finding named), rate
 * limiting is per-learner (one sibling's lockout never affects another's
 * own attempts), and resetting a PIN invalidates every existing session.
 */

const PARENT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER_PARENT = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

const PLANTEST1 = "11111111-1111-4111-8111-111111111111";
let PLANTEST2 = "";
const OTHER_PARENT_LEARNER = "33333333-3333-4333-8333-333333333333";

let db: PGlite;
let failedFiles: string[] = [];

before(async () => {
  const built = await buildDatabase(263);
  db = built.db;
  failedFiles = built.failedFiles;

  await db.exec(`
    insert into auth.users (id, email, is_anonymous) values
      ('${PARENT}', 'parent@example.test', false),
      ('${OTHER_PARENT}', 'other@example.test', false);
    insert into public.profiles (id, device_id, learner_name, auth_user_id, selected_pathway_id) values
      ('${PLANTEST1}', 'dev-1', 'Plantest1', '${PARENT}', 'csse'),
      ('${OTHER_PARENT_LEARNER}', 'dev-3', 'Other', '${OTHER_PARENT}', 'gl');
  `);

  // A second learner under PARENT must go through the governed create_learner()
  // RPC (migration 260) -- a raw second INSERT for the same account is refused
  // by profiles_guard_learner_ownership(), exactly as production requires.
  await asUser(db, { uid: PARENT }, async (q) => {
    const r = await q("select public.create_learner('Plantest2', 'csse') as id");
    PLANTEST2 = String(r.rows[0].id);
  });
});

test("harness sanity: only the pre-existing, data-guarded content migrations are skipped -- migration 263 itself is not among them", () => {
  assert.ok(!failedFiles.includes("263_learner_pin.sql"), "migration 263 itself must apply cleanly");
  for (const f of failedFiles) {
    assert.match(f, /^(12[3-9]|13\d|14\d|15\d|18\d|21\d|22\d|23\d|24\d|25\d)_/, `unexpected schema migration failure: ${f}`);
  }
});

test("a learner with no PIN configured is unaffected -- current_learner_id() still resolves them with just the account-ownership header, no token required", async () => {
  await asUser(db, { uid: PARENT, learnerHeader: PLANTEST1 }, async (q) => {
    const r = await q("select public.current_learner_id() as id");
    assert.equal(r.rows[0].id, PLANTEST1);
  });
});

test("only the owning parent account can set a learner's PIN", async () => {
  await asUser(db, { uid: OTHER_PARENT }, async (q) => {
    const r = await q("select public.set_learner_pin($1, '1234')", [PLANTEST1]);
    assert.ok(r.error);
    assert.match(r.error!.message, /angel_learner_not_owned/);
  });
});

test("invalid PIN format is rejected", async () => {
  await asUser(db, { uid: PARENT }, async (q) => {
    for (const bad of ["123", "1234567", "abcd", ""]) {
      const r = await q("select public.set_learner_pin($1, $2)", [PLANTEST1, bad]);
      assert.ok(r.error, `expected rejection for "${bad}"`);
      assert.match(r.error!.message, /angel_invalid_pin/);
    }
  });
});

test("once Plantest1 has a PIN configured, current_learner_id() refuses the plain header alone -- angel_learner_pin_required, fail closed", async () => {
  await asUser(db, { uid: PARENT }, async (q) => {
    await q("select public.set_learner_pin($1, '4821')", [PLANTEST1]);
  });
  await asUser(db, { uid: PARENT, learnerHeader: PLANTEST1 }, async (q) => {
    const r = await q("select public.current_learner_id() as id");
    assert.ok(r.error);
    assert.match(r.error!.message, /angel_learner_pin_required/);
  });
});

test("verifying Plantest1's own PIN mints a token that current_learner_id() then accepts for Plantest1", async () => {
  let token = "";
  await asUser(db, { uid: PARENT }, async (q) => {
    const v = await q("select * from public.verify_learner_pin($1, '4821')", [PLANTEST1]);
    assert.equal(v.rows[0].ok, true);
    token = v.rows[0].session_token as string;
    assert.ok(token);
  });
  await asUser(db, { uid: PARENT, learnerHeader: PLANTEST1, learnerToken: token }, async (q) => {
    const r = await q("select public.current_learner_id() as id");
    assert.equal(r.rows[0].id, PLANTEST1);
  });
});

test("THE EXACT PRODUCTION FINDING, proven fixed: a token verified for Plantest1 does NOT satisfy a request naming Plantest2 -- fails closed even though the account owns both", async () => {
  let plantest1Token = "";
  await asUser(db, { uid: PARENT }, async (q) => {
    const v = await q("select * from public.verify_learner_pin($1, '4821')", [PLANTEST1]);
    plantest1Token = v.rows[0].session_token as string;
  });
  await asUser(db, { uid: PARENT, learnerHeader: PLANTEST2, learnerToken: plantest1Token }, async (q) => {
    // Plantest2 has no PIN configured yet in this test's fresh state at this point in the
    // suite -- so first prove the account-ownership path alone would otherwise succeed...
    const before_ = await q("select public.current_learner_id() as id");
    assert.equal(before_.rows[0].id, PLANTEST2, "sanity: Plantest2 has no PIN yet, so ownership alone resolves them");
  });

  // Now configure Plantest2's own PIN and prove Plantest1's token still cannot reach them.
  await asUser(db, { uid: PARENT }, async (q) => {
    await q("select public.set_learner_pin($1, '9911')", [PLANTEST2]);
  });
  await asUser(db, { uid: PARENT, learnerHeader: PLANTEST2, learnerToken: plantest1Token }, async (q) => {
    const r = await q("select public.current_learner_id() as id");
    assert.ok(r.error, "Plantest1's session token must never satisfy a request naming Plantest2");
    assert.match(r.error!.message, /angel_learner_pin_required/);
  });
});

test("Plantest2's own PIN verifies Plantest2 and only Plantest2; Plantest1 PIN against Plantest2 = MUST FAIL; Plantest2 PIN against Plantest1 = MUST FAIL", async () => {
  let plantest1Token = "";
  let plantest2Token = "";
  await asUser(db, { uid: PARENT }, async (q) => {
    const v1 = await q("select * from public.verify_learner_pin($1, '4821')", [PLANTEST1]);
    plantest1Token = v1.rows[0].session_token as string;
    const v2 = await q("select * from public.verify_learner_pin($1, '9911')", [PLANTEST2]);
    assert.equal(v2.rows[0].ok, true);
    plantest2Token = v2.rows[0].session_token as string;
  });

  await asUser(db, { uid: PARENT, learnerHeader: PLANTEST1, learnerToken: plantest1Token }, async (q) => {
    assert.equal((await q("select public.current_learner_id() as id")).rows[0].id, PLANTEST1);
  });
  await asUser(db, { uid: PARENT, learnerHeader: PLANTEST2, learnerToken: plantest2Token }, async (q) => {
    assert.equal((await q("select public.current_learner_id() as id")).rows[0].id, PLANTEST2);
  });
  // Cross the tokens.
  await asUser(db, { uid: PARENT, learnerHeader: PLANTEST2, learnerToken: plantest1Token }, async (q) => {
    const r = await q("select public.current_learner_id() as id");
    assert.ok(r.error, "Plantest1's token against Plantest2 must fail");
  });
  await asUser(db, { uid: PARENT, learnerHeader: PLANTEST1, learnerToken: plantest2Token }, async (q) => {
    const r = await q("select public.current_learner_id() as id");
    assert.ok(r.error, "Plantest2's token against Plantest1 must fail");
  });
});

test("a random/garbage token satisfies neither learner", async () => {
  await asUser(db, { uid: PARENT, learnerHeader: PLANTEST1, learnerToken: "00000000-0000-4000-8000-000000000000" }, async (q) => {
    const r = await q("select public.current_learner_id() as id");
    assert.ok(r.error);
    assert.match(r.error!.message, /angel_learner_pin_required/);
  });
});

test("5 consecutive wrong PIN attempts lock verification out for that learner, and even the correct PIN then fails while locked", async () => {
  await asUser(db, { uid: PARENT }, async (q) => {
    let lastRetryAt: unknown = null;
    for (let i = 0; i < 5; i++) {
      const r = await q("select * from public.verify_learner_pin($1, '0000')", [PLANTEST1]);
      assert.equal(r.rows[0].ok, false);
      lastRetryAt = r.rows[0].retry_at;
    }
    assert.notEqual(lastRetryAt, null, "expected a lockout timestamp after the 5th wrong attempt");

    const correctButLocked = await q("select * from public.verify_learner_pin($1, '4821')", [PLANTEST1]);
    assert.equal(correctButLocked.rows[0].ok, false);
    assert.notEqual(correctButLocked.rows[0].retry_at, null);
  });
});

test("Plantest1's lockout never affects Plantest2's own PIN attempts (rate limiting is per learner, not per account)", async () => {
  await asUser(db, { uid: PARENT }, async (q) => {
    // Plantest1 is locked out from the previous test.
    const locked = await q("select * from public.verify_learner_pin($1, '4821')", [PLANTEST1]);
    assert.equal(locked.rows[0].ok, false);

    const p2 = await q("select * from public.verify_learner_pin($1, '9911')", [PLANTEST2]);
    assert.equal(p2.rows[0].ok, true, "Plantest2's own correct PIN must still work, unaffected by Plantest1's lockout");
  });
});

test("resetting a learner's PIN invalidates every existing session for that learner", async () => {
  let token = "";
  await asUser(db, { uid: PARENT }, async (q) => {
    const v = await q("select * from public.verify_learner_pin($1, '9911')", [PLANTEST2]);
    token = v.rows[0].session_token as string;
  });
  await asUser(db, { uid: PARENT, learnerHeader: PLANTEST2, learnerToken: token }, async (q) => {
    assert.equal((await q("select public.current_learner_id() as id")).rows[0].id, PLANTEST2);
  });

  await asUser(db, { uid: PARENT }, async (q) => {
    await q("select public.set_learner_pin($1, '5555')", [PLANTEST2]);
  });

  await asUser(db, { uid: PARENT, learnerHeader: PLANTEST2, learnerToken: token }, async (q) => {
    const r = await q("select public.current_learner_id() as id");
    assert.ok(r.error, "the old token must be invalidated by the PIN reset");
  });
});

test("learner_access and learner_pin_sessions are never directly readable by the authenticated role", async () => {
  await asUser(db, { uid: PARENT, learnerHeader: PLANTEST1, learnerToken: "irrelevant" }, async (q) => {
    const direct1 = await q("select * from public.learner_access");
    assert.equal(direct1.rows.length, 0);
    const direct2 = await q("select * from public.learner_pin_sessions");
    assert.equal(direct2.rows.length, 0);
  });
});

test("learner_pin_status is parent-only and never exposes the hash/salt", async () => {
  await asUser(db, { uid: PARENT }, async (q) => {
    const r = await q("select * from public.learner_pin_status($1)", [PLANTEST1]);
    assert.equal(r.rows[0].has_pin, true);
    assert.ok(!("pin_hash" in r.rows[0]));
    assert.ok(!("pin_salt" in r.rows[0]));
  });
  await asUser(db, { uid: OTHER_PARENT }, async (q) => {
    const r = await q("select * from public.learner_pin_status($1)", [PLANTEST1]);
    assert.equal(r.rows[0].has_pin, false, "a different account must never learn whether someone else's learner has a PIN");
  });
});

test("a learner belonging to a completely different account is fully isolated from this account's PIN state", async () => {
  await asUser(db, { uid: OTHER_PARENT }, async (q) => {
    const v = await q("select public.set_learner_pin($1, '6060')", [OTHER_PARENT_LEARNER]);
    assert.equal(v.error, undefined);
  });
  await asUser(db, { uid: PARENT, learnerHeader: OTHER_PARENT_LEARNER }, async (q) => {
    const r = await q("select public.current_learner_id() as id");
    assert.ok(r.error, "a different account can never resolve a learner it does not own, PIN or not");
    assert.match(r.error!.message, /angel_learner_not_owned/);
  });
});

test("no secret (PIN, salt or hash) ever appears in the migration's own applied source as plaintext", () => {
  const sql = readMigration("263");
  assert.doesNotMatch(sql, /pin_hash\s*:=\s*'[0-9]{4,6}'/, "no hard-coded PIN should ever appear in the migration");
});
