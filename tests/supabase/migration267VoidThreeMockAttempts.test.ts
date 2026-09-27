import { test, before } from "node:test";
import assert from "node:assert/strict";
import type { PGlite } from "@electric-sql/pglite";
import { buildDatabase, readMigration, asUser } from "./support/pgliteHarness";

/**
 * Migration 267 -- governed void of exactly three Mock attempts, executed
 * for real against the PGlite harness: every migration through 265, then
 * 266 (with the same CRLF live-fingerprint swap the 266 suite documents),
 * then production-shaped seed data for the three approved targets, then 267.
 */

const LIVE: Record<string, { rawMd5: string }> = {
  mock_release_report: { rawMd5: "505771fd51ab3b622b42350857f9a44c" },
  mock_claim_evidence_ingestion: { rawMd5: "771c152496f8a9ff45024a353dd181f7" },
  mock_claim_writing_evidence_ingestion: { rawMd5: "ad316557ee01a4775bd9a6bcd58ed000" },
  mock_apply_manual_mark: { rawMd5: "05a5816c5bcda0bff17813263e949ea7" },
  mock_create_cycle_attempt: { rawMd5: "6df9c89ed9f183ccc5136d57d82623f7" },
};

// The three approved targets, exactly as in production (2026-09-27).
const DEFECT = "9ae70cee-3cde-47da-96e0-c0eecfcddda3";
const MATH = "0f98b4fd-a247-4ffc-a49f-df5581d65f95";
const READING = "cb04cc9f-b311-485a-9b3e-1e1ba93077b7";
const TARGETS = [DEFECT, MATH, READING];

const DEFECT_PROFILE = "86b9841c-edac-4648-b590-f567fdbc09ce";
const FOUNDER_PROFILE = "7e9cd8d1-d4c6-4652-8df1-018d0299e7f1";
const BYSTANDER_PROFILE = "44444444-4444-4444-8444-444444444444";
const DEFECT_CYCLE = "4e6bfadc-399c-4470-91b0-911f39f62fb4";
const FOUNDER_CYCLE = "61520859-c2da-468a-bd9d-f8e9e2472861";
const BYSTANDER_CYCLE = "55555555-5555-4555-8555-555555555555";
const DEFECT_AUTH = "d1111111-1111-4111-8111-111111111111";
const FOUNDER_AUTH = "f2222222-2222-4222-8222-222222222222";
const BYSTANDER_AUTH = "b3333333-3333-4333-8333-333333333333";

const BYSTANDER_SUBMITTED = "66666666-6666-4666-8666-666666666666"; // genuine, released, EI-ingested
const BYSTANDER_INPROGRESS = "77777777-7777-4777-8777-777777777777"; // an unrelated open attempt

interface World {
  db: PGlite;
  question: string;
}

async function buildWorld(apply266: boolean): Promise<World> {
  const { db } = await buildDatabase(265);
  if (apply266) {
    let sql = readMigration("266");
    const rows = await db.query<{ proname: string; raw: string }>(
      `select proname, md5(prosrc) raw from pg_proc where proname = any($1) and pronamespace = 'public'::regnamespace`,
      [Object.keys(LIVE)]
    );
    assert.equal(rows.rows.length, 5);
    for (const r of rows.rows) sql = sql.split(LIVE[r.proname].rawMd5).join(r.raw);
    await db.exec(sql);
  }
  await db.exec(`
    insert into auth.users (id, email, is_anonymous) values
      ('${DEFECT_AUTH}', 'd@example.test', false), ('${FOUNDER_AUTH}', 'f@example.test', false), ('${BYSTANDER_AUTH}', 'b@example.test', false);
    insert into public.profiles (id, device_id, learner_name, auth_user_id, selected_pathway_id) values
      ('${DEFECT_PROFILE}', 'dev-d', 'Defect Learner', '${DEFECT_AUTH}', 'csse'),
      ('${FOUNDER_PROFILE}', 'dev-f', 'Founder Test', '${FOUNDER_AUTH}', 'csse'),
      ('${BYSTANDER_PROFILE}', 'dev-b', 'Bystander', '${BYSTANDER_AUTH}', 'csse');
    -- The Mathematics form is inserted by a data migration the harness skips; clone a minimal one.
    insert into public.ali_mock_form
      select (jsonb_populate_record(null::public.ali_mock_form, to_jsonb(f) || '{"id":"first-mock-mathematics-v1","subject":"mathematics","question_manifest":[]}'::jsonb)).*
      from public.ali_mock_form f where f.id = 'reading-comprehension-mock-1';
    update public.ali_mock_form set active = true where id in ('english-full-mock-v1', 'first-mock-mathematics-v1', 'reading-comprehension-mock-1');
    insert into public.ali_mock_cycle (id, profile_id) values
      ('${DEFECT_CYCLE}', '${DEFECT_PROFILE}'), ('${FOUNDER_CYCLE}', '${FOUNDER_PROFILE}'), ('${BYSTANDER_CYCLE}', '${BYSTANDER_PROFILE}');
  `);
  const question = String((await db.query<{ q: string }>(`select question_manifest->0->>'question_id' q from public.ali_mock_form where id = 'reading-comprehension-mock-1'`)).rows[0].q);

  // Defect attempt: English, submitted, 0 answers, report pending + scored.
  await db.query(
    `insert into public.ali_mock_attempt (id, profile_id, form_id, attempt_type, status, assigned_question_ids, cycle_id, subject, started_at, expires_at)
     values ($1, $2, 'english-full-mock-v1', 'full_mock', 'in_progress', array[]::text[], $3, 'english', now(), now() + interval '1 hour')`,
    [DEFECT, DEFECT_PROFILE, DEFECT_CYCLE]
  );
  await db.query(`update public.ali_mock_attempt set status = 'submitted', submitted_at = now() where id = $1`, [DEFECT]);
  await db.query(`update public.ali_mock_attempt_report set scoring_state = 'scored' where attempt_id = $1`, [DEFECT]);

  // Founder acceptance tests: in progress, one with an answer and a flag to preserve.
  await db.query(
    `insert into public.ali_mock_attempt (id, profile_id, form_id, attempt_type, status, assigned_question_ids, cycle_id, subject, started_at, expires_at)
     values ($1, $2, 'first-mock-mathematics-v1', 'full_mock', 'in_progress', array[]::text[], $3, 'mathematics', now(), now() + interval '1 hour')`,
    [MATH, FOUNDER_PROFILE, FOUNDER_CYCLE]
  );
  await db.query(
    `insert into public.ali_mock_attempt (id, profile_id, form_id, attempt_type, status, assigned_question_ids, started_at, expires_at)
     values ($1, $2, 'reading-comprehension-mock-1', 'timed_section', 'in_progress', array[]::text[], now(), now() + interval '1 hour')`,
    [READING, FOUNDER_PROFILE]
  );
  await db.query(`insert into public.ali_mock_attempt_answer (attempt_id, question_id, response) values ($1, $2, '{"value":"x"}')`, [MATH, question]);
  await db.query(`insert into public.ali_mock_attempt_flag (attempt_id, question_id) values ($1, $2)`, [MATH, question]);

  // Bystanders that must never change: a genuine released + ingested attempt, and an unrelated open one.
  await db.query(
    `insert into public.ali_mock_attempt (id, profile_id, form_id, attempt_type, status, assigned_question_ids, cycle_id, subject, started_at, expires_at)
     values ($1, $2, 'english-full-mock-v1', 'full_mock', 'in_progress', array[]::text[], $3, 'english', now(), now() + interval '1 hour')`,
    [BYSTANDER_SUBMITTED, BYSTANDER_PROFILE, BYSTANDER_CYCLE]
  );
  await db.query(`update public.ali_mock_attempt set status = 'submitted', submitted_at = now() where id = $1`, [BYSTANDER_SUBMITTED]);
  await db.query(
    `update public.ali_mock_attempt_report set scoring_state = 'scored', analysis_state = 'complete', report_release_state = 'released', ei_evidence_ingested_at = now() where attempt_id = $1`,
    [BYSTANDER_SUBMITTED]
  );
  await db.query(
    `insert into public.ali_mock_attempt (id, profile_id, form_id, attempt_type, status, assigned_question_ids, started_at, expires_at)
     values ($1, $2, 'reading-comprehension-mock-1', 'timed_section', 'in_progress', array[]::text[], now(), now() + interval '1 hour')`,
    [BYSTANDER_INPROGRESS, BYSTANDER_PROFILE]
  );
  return { db, question };
}

async function apply267(db: PGlite): Promise<string | null> {
  try {
    await db.exec(readMigration("267"));
    return null;
  } catch (e) {
    try { await db.exec("rollback"); } catch { /* none */ }
    return String((e as Error).message ?? e);
  }
}

async function snapshot(db: PGlite): Promise<string> {
  const r = await db.query<{ s: string }>(
    `select md5(concat_ws('|',
       (select coalesce(string_agg(to_jsonb(t)::text, '|' order by to_jsonb(t)::text), '') from public.ali_mock_attempt t),
       (select coalesce(string_agg(to_jsonb(t)::text, '|' order by to_jsonb(t)::text), '') from public.ali_mock_attempt_report t),
       (select coalesce(string_agg(to_jsonb(t)::text, '|' order by to_jsonb(t)::text), '') from public.ali_mock_attempt_answer t),
       (select coalesce(string_agg(to_jsonb(t)::text, '|' order by to_jsonb(t)::text), '') from public.ali_mock_attempt_flag t),
       (select coalesce(string_agg(to_jsonb(t)::text, '|' order by to_jsonb(t)::text), '') from public.ali_mock_attempt_void_audit t))) s`
  );
  return r.rows[0].s;
}

const one = async <T = unknown>(db: PGlite, sql: string, params?: unknown[]): Promise<T> =>
  Object.values((await db.query<Record<string, unknown>>(sql, params)).rows[0] ?? {})[0] as T;

let ok: World; // 267 applied successfully
let pre: World; // clean 266 world, 267 not applied (used for abort scenarios)
let okError: string | null;
let bystanderBefore = "";
let targetsBefore = "";
let exposureBefore = "";
let resumableBefore: unknown[] = [];

const asFounder = <T>(db: PGlite, fn: Parameters<typeof asUser<T>>[2]) => asUser(db, { uid: FOUNDER_AUTH, learnerHeader: FOUNDER_PROFILE }, fn);
const asDefectLearner = <T>(db: PGlite, fn: Parameters<typeof asUser<T>>[2]) => asUser(db, { uid: DEFECT_AUTH, learnerHeader: DEFECT_PROFILE }, fn);

before(async () => {
  ok = await buildWorld(true);
  pre = await buildWorld(true);

  bystanderBefore = await one(
    ok.db,
    `select md5(coalesce(string_agg(to_jsonb(t)::text, '|' order by to_jsonb(t)::text), '')) from (
       select a.* from public.ali_mock_attempt a where a.id not in ('${DEFECT}', '${MATH}', '${READING}')) t`
  );
  const extra = await one(
    ok.db,
    `select md5(coalesce(string_agg(to_jsonb(r)::text, '|' order by to_jsonb(r)::text), '')) from public.ali_mock_attempt_report r where r.attempt_id not in ('${DEFECT}', '${MATH}', '${READING}')`
  );
  bystanderBefore += String(extra);
  targetsBefore = await one(
    ok.db,
    `select md5(string_agg((to_jsonb(a) - 'status')::text, '|' order by a.id::text)) from public.ali_mock_attempt a where a.id in ('${DEFECT}', '${MATH}', '${READING}')`
  );
  exposureBefore = await one(ok.db, `select pg_get_viewdef('public.ali_mock_exposed_question_ids'::regclass)`);

  // Before 267 the Founder's reading acceptance test is a resumable attempt.
  await asFounder(pre.db, async (q) => {
    const r = await q("select * from public.mock_get_resumable_attempt('reading-comprehension-mock-1')");
    assert.ok(!r.error, r.error?.message);
    resumableBefore = r.rows;
  });

  okError = await apply267(ok.db);
});

// --- success path ----------------------------------------------------------

test("seed is production-shaped: three targets in their reviewed states, plus untouched bystanders", async () => {
  assert.equal(await one(pre.db, `select count(*)::int from public.ali_mock_attempt`), 5);
  assert.equal(await one(pre.db, `select status from public.ali_mock_attempt where id = $1`, [DEFECT]), "submitted");
  assert.equal(await one(pre.db, `select report_release_state from public.ali_mock_attempt_report where attempt_id = $1`, [DEFECT]), "pending");
  assert.equal(resumableBefore.length, 1, "before 267 the reading acceptance test is offered for resume");
});

test("migration 267 applies cleanly (all preconditions, in-transaction proofs and postconditions pass)", () => {
  assert.equal(okError, null, okError ?? "");
});

test("exactly the three approved attempts are voided, and no others", async () => {
  const rows = (await ok.db.query<{ id: string }>(`select id from public.ali_mock_attempt where status = 'voided' order by id`)).rows.map((r) => r.id);
  assert.deepEqual(rows, [...TARGETS].sort());
  assert.equal(await one(ok.db, `select status from public.ali_mock_attempt where id = $1`, [BYSTANDER_SUBMITTED]), "submitted");
  assert.equal(await one(ok.db, `select status from public.ali_mock_attempt where id = $1`, [BYSTANDER_INPROGRESS]), "in_progress");
});

test("each target has exactly one protected audit record with the approved reason, prior status and governed actor", async () => {
  const rows = (
    await ok.db.query<{ id: string; reason_code: string; status_before_void: string; voided_by_actor: string; voided_by_profile_id: string | null; internal_note: string | null }>(
      `select attempt_id id, reason_code, status_before_void, voided_by_actor, voided_by_profile_id, internal_note from public.ali_mock_attempt_void_audit order by attempt_id`
    )
  ).rows;
  assert.equal(rows.length, 3);
  const by = Object.fromEntries(rows.map((r) => [r.id, r]));
  assert.equal(by[DEFECT].reason_code, "platform_defect");
  assert.equal(by[DEFECT].status_before_void, "submitted");
  assert.equal(by[MATH].reason_code, "acceptance_test");
  assert.equal(by[MATH].status_before_void, "in_progress");
  assert.equal(by[READING].reason_code, "acceptance_test");
  assert.equal(by[READING].status_before_void, "in_progress");
  for (const r of rows) {
    assert.equal(r.voided_by_actor, "migration:267");
    assert.equal(r.voided_by_profile_id, null);
    assert.ok(r.internal_note && r.internal_note.length > 20);
  }
});

test("preservation: target rows are unchanged except status; answers, flags and reports remain with their attempts", async () => {
  const after = await one(
    ok.db,
    `select md5(string_agg((to_jsonb(a) - 'status')::text, '|' order by a.id::text)) from public.ali_mock_attempt a where a.id in ('${DEFECT}', '${MATH}', '${READING}')`
  );
  assert.equal(after, targetsBefore);
  assert.equal(await one(ok.db, `select count(*)::int from public.ali_mock_attempt_answer where attempt_id = $1`, [MATH]), 1);
  assert.equal(await one(ok.db, `select count(*)::int from public.ali_mock_attempt_flag where attempt_id = $1`, [MATH]), 1);
  assert.equal(await one(ok.db, `select report_release_state from public.ali_mock_attempt_report where attempt_id = $1`, [DEFECT]), "pending");
  assert.equal(await one(ok.db, `select count(*)::int from public.ali_mock_attempt`), 5, "no row was created or deleted");
});

test("no unrelated attempt or report was changed", async () => {
  const bystanders = await one(
    ok.db,
    `select md5(coalesce(string_agg(to_jsonb(t)::text, '|' order by to_jsonb(t)::text), '')) from (
       select a.* from public.ali_mock_attempt a where a.id not in ('${DEFECT}', '${MATH}', '${READING}')) t`
  );
  const reports = await one(
    ok.db,
    `select md5(coalesce(string_agg(to_jsonb(r)::text, '|' order by to_jsonb(r)::text), '')) from public.ali_mock_attempt_report r where r.attempt_id not in ('${DEFECT}', '${MATH}', '${READING}')`
  );
  assert.equal(bystanders + String(reports), bystanderBefore);
  assert.equal(await one(ok.db, `select report_release_state from public.ali_mock_attempt_report where attempt_id = $1`, [BYSTANDER_SUBMITTED]), "released");
});

test("question exposure is retained: the exposure view is unchanged", async () => {
  assert.equal(await one(ok.db, `select pg_get_viewdef('public.ali_mock_exposed_question_ids'::regclass)`), exposureBefore);
});

test("slots are released: the defect learner can create a legitimate English replacement in the SAME cycle", async () => {
  await asDefectLearner(ok.db, async (q) => {
    const r = await q("select public.mock_create_cycle_attempt('english-full-mock-v1', $1) as id", [DEFECT_CYCLE]);
    assert.ok(!r.error, r.error?.message);
    assert.notEqual(String(r.rows[0].id), DEFECT);
  });
  assert.equal(
    await one(ok.db, `select count(*)::int from public.ali_mock_attempt where cycle_id = $1 and subject = 'english' and status <> 'voided'`, [DEFECT_CYCLE]),
    1
  );
  assert.equal(await one(ok.db, `select status from public.ali_mock_attempt where id = $1`, [DEFECT]), "voided", "the original stays voided and preserved");
});

test("the voided Founder acceptance test is no longer offered for resume, and cannot be advanced or submitted", async () => {
  await asFounder(ok.db, async (q) => {
    const r = await q("select * from public.mock_get_resumable_attempt('reading-comprehension-mock-1')");
    assert.ok(!r.error, r.error?.message);
    assert.equal(r.rows.length, 0);
    const s = await q("select * from public.mock_submit_attempt($1)", [READING]);
    assert.ok(s.error || s.rows.length === 0, "a voided attempt cannot be submitted");
    const a = await q("select public.mock_submit_answer($1, $2, '{\"value\":\"y\"}'::jsonb)", [MATH, ok.question]);
    assert.match(a.error?.message ?? "", /not in progress/);
  });
  assert.equal(await one(ok.db, `select status from public.ali_mock_attempt where id = $1`, [READING]), "voided");
});

test("privacy: the family sees only 'voided'; the internal audit record is unreadable to a learner or parent", async () => {
  await asFounder(ok.db, async (q) => {
    const own = await q("select id, status from public.ali_mock_attempt where id = $1", [MATH]);
    assert.equal(own.rows[0].status, "voided");
    const audit = await q("select * from public.ali_mock_attempt_void_audit");
    assert.match(audit.error?.message ?? "", /permission denied/);
  });
});

test("the migration cannot be run twice: a second run aborts and changes nothing", async () => {
  const before = await snapshot(ok.db);
  const err = await apply267(ok.db);
  assert.match(err ?? "", /already exists|must run once/);
  assert.equal(await snapshot(ok.db), before);
});

// --- abort paths: each leaves the database exactly as it was ----------------

async function expectAbort(world: World, pattern: RegExp) {
  const before = await snapshot(world.db);
  const err = await apply267(world.db);
  assert.match(err ?? "NO ERROR", pattern);
  assert.equal(await snapshot(world.db), before, "an aborted 267 changes nothing");
  assert.equal(await one(world.db, `select count(*)::int from public.ali_mock_attempt where status = 'voided'`), 0);
  assert.equal(await one(world.db, `select count(*)::int from public.ali_mock_attempt_void_audit`), 0);
}

test("abort: a target that has since expired is no longer in its reviewed state", async () => {
  await pre.db.query(`update public.ali_mock_attempt set status = 'expired' where id = $1`, [MATH]);
  await expectAbort(pre, /not in the reviewed state/);
  await pre.db.query(`update public.ali_mock_attempt set status = 'in_progress' where id = $1`, [MATH]);
});

test("abort: the in-progress Reading acceptance test has since been submitted", async () => {
  await pre.db.query(`update public.ali_mock_attempt set status = 'submitted', submitted_at = now() where id = $1`, [READING]);
  await expectAbort(pre, /not in the reviewed state/);
  await pre.db.exec(`delete from public.ali_mock_attempt_report where attempt_id = '${READING}'`);
  await pre.db.query(`update public.ali_mock_attempt set status = 'in_progress', submitted_at = null where id = $1`, [READING]);
});

test("abort: a target belongs to a different learner or cycle than reviewed", async () => {
  await pre.db.query(`update public.ali_mock_attempt set profile_id = $2 where id = $1`, [DEFECT, BYSTANDER_PROFILE]);
  await expectAbort(pre, /not in the reviewed state/);
  await pre.db.query(`update public.ali_mock_attempt set profile_id = $2 where id = $1`, [DEFECT, DEFECT_PROFILE]);
  await pre.db.query(`update public.ali_mock_attempt set cycle_id = $2 where id = $1`, [MATH, BYSTANDER_CYCLE]);
  await expectAbort(pre, /not in the reviewed state/);
  await pre.db.query(`update public.ali_mock_attempt set cycle_id = $2 where id = $1`, [MATH, FOUNDER_CYCLE]);
});

test("abort: a target's report has been released, or its evidence has entered EI", async () => {
  await pre.db.query(`update public.ali_mock_attempt_report set report_release_state = 'released' where attempt_id = $1`, [DEFECT]);
  await expectAbort(pre, /released report or standard EI evidence/);
  await pre.db.query(`update public.ali_mock_attempt_report set report_release_state = 'pending', ei_evidence_ingested_at = now() where attempt_id = $1`, [DEFECT]);
  await expectAbort(pre, /released report or standard EI evidence/);
  await pre.db.query(`update public.ali_mock_attempt_report set ei_evidence_ingested_at = null where attempt_id = $1`, [DEFECT]);
});

test("abort: a target is missing", async () => {
  await pre.db.exec(`delete from public.ali_mock_attempt_answer where attempt_id = '${MATH}'; delete from public.ali_mock_attempt_flag where attempt_id = '${MATH}';`);
  await pre.db.exec(`alter table public.ali_mock_attempt disable trigger mock_attempt_void_is_terminal_trigger`);
  await pre.db.query(`update public.ali_mock_attempt set id = '88888888-8888-4888-8888-888888888888' where id = $1`, [MATH]);
  await expectAbort(pre, /does not exist/);
  await pre.db.query(`update public.ali_mock_attempt set id = $1 where id = '88888888-8888-4888-8888-888888888888'`, [MATH]);
  await pre.db.exec(`alter table public.ali_mock_attempt enable trigger mock_attempt_void_is_terminal_trigger`);
});

test("abort: an attempt was already voided (nothing may be pre-voided)", async () => {
  await pre.db.query(`select public.mock_void_attempt_core($1, 'admin_correction', 'pre-existing', null, 'migration:test')`, [BYSTANDER_INPROGRESS]);
  const err = await apply267(pre.db);
  assert.match(err ?? "NO ERROR", /already exists|must run once/);
  assert.equal(await one(pre.db, `select status from public.ali_mock_attempt where id = $1`, [DEFECT]), "submitted");
  assert.equal(await one(pre.db, `select status from public.ali_mock_attempt where id = $1`, [MATH]), "in_progress");
});

test("abort: Migration 266 is not applied", async () => {
  const bare = await buildWorld(false);
  const err = await apply267(bare.db);
  assert.match(err ?? "NO ERROR", /Migration 266 is not applied/);
  assert.equal(await one(bare.db, `select count(*)::int from public.ali_mock_attempt where status = 'submitted'`), 2);
});

test("safety net: if anything unrelated moved during the void, the in-transaction digest aborts the whole migration", async () => {
  const w = await buildWorld(true);
  await w.db.exec(`
    create function public.tmp_sabotage() returns trigger language plpgsql as $$
    begin
      update public.ali_mock_attempt set submitted_at = now() + interval '1 day' where id = '${BYSTANDER_SUBMITTED}';
      return new;
    end; $$;
    create trigger tmp_sabotage_trigger after insert on public.ali_mock_attempt_void_audit for each row execute function public.tmp_sabotage();
  `);
  await expectAbort(w, /non-target attempt or a row linked to one changed/);
});

// --- static guarantees -----------------------------------------------------

test("267 uses no DELETE/TRUNCATE/DROP TABLE, names exactly the three approved attempts, and calls only the governed core", () => {
  const sql = readMigration("267")
    .split("\n")
    .filter((l) => !l.trim().startsWith("--"))
    .join("\n");
  assert.doesNotMatch(sql, /\bdelete\s+from\b/i);
  assert.doesNotMatch(sql, /\btruncate\b/i);
  assert.doesNotMatch(sql, /\bdrop\s+table\b/i);
  assert.doesNotMatch(sql, /\binsert\s+into\b/i, "audit rows are written only by the governed core");
  assert.doesNotMatch(sql, /update\s+public\./i, "no direct UPDATE: status changes only through the governed core");
  const uuids = new Set(sql.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g) ?? []);
  for (const t of TARGETS) assert.ok(uuids.has(t));
  assert.equal(
    (sql.match(/perform public\.mock_void_attempt_core\(/g) ?? []).length,
    3
  );
  assert.equal((sql.match(/'platform_defect'/g) ?? []).length >= 1, true);
  const reviewedIds = new Set([...TARGETS, DEFECT_PROFILE, FOUNDER_PROFILE, DEFECT_CYCLE, FOUNDER_CYCLE]);
  for (const u of uuids) assert.ok(reviewedIds.has(u), `unexpected id in migration: ${u}`);
});
