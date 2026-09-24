import { test, before } from "node:test";
import assert from "node:assert/strict";
import type { PGlite } from "@electric-sql/pglite";
import { buildDatabase, readMigration, asUser } from "./support/pgliteHarness";

/**
 * Migration 266 -- Invalid Mock Attempt Governance, executed for real
 * against the PGlite harness (every migration through 265, then 266).
 *
 * Live-parity note: migration 266 patches LIVE function bodies pinned by
 * md5(prosrc). Production bodies carry CRLF line endings (applied from the
 * SQL Editor); the harness builds from LF files. The harness bodies are
 * proven identical to production once CR is stripped (the LIVE_LF_MD5
 * constants below were read from production via read-only MCP on
 * 2026-09-24), so the only test-time transform is swapping each pinned
 * CRLF fingerprint for the harness's own -- every other byte of the
 * migration runs exactly as written.
 */

const LIVE: Record<string, { rawMd5: string; lfMd5: string }> = {
  mock_release_report: { rawMd5: "505771fd51ab3b622b42350857f9a44c", lfMd5: "ff43ca8ccb046a14790dfa5c165286a1" },
  mock_claim_evidence_ingestion: { rawMd5: "771c152496f8a9ff45024a353dd181f7", lfMd5: "af8f7d7278913546e3501989a0582443" },
  mock_claim_writing_evidence_ingestion: { rawMd5: "ad316557ee01a4775bd9a6bcd58ed000", lfMd5: "3d3bbeb86e55a6afb1b030a3865c743d" },
  mock_apply_manual_mark: { rawMd5: "05a5816c5bcda0bff17813263e949ea7", lfMd5: "eeb45c9c8e58d509c855c82b55a756c3" },
  mock_create_cycle_attempt: { rawMd5: "6df9c89ed9f183ccc5136d57d82623f7", lfMd5: "62e5ed3ddde57c09e80f8436ba778edf" },
};

const PARENT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER_PARENT = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const ADMIN = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const LEARNER = "11111111-1111-4111-8111-111111111111";
const OTHER_LEARNER = "22222222-2222-4222-8222-222222222222";
const ADMIN_PROFILE = "33333333-3333-4333-8333-333333333333";
const ENGLISH_FORM = "english-full-mock-v1";

let db: PGlite;
let exposureViewBefore = "";
let migrationError: string | null = null;
let cycleId = "";
let incidentAttempt = ""; // stands in for 9ae70cee: a submitted English cycle attempt
let validAttempt = ""; // a genuine, never-voided attempt (J)
let firstQuestion = "";
let writingQuestion = "";

const asLearner = <T>(fn: Parameters<typeof asUser<T>>[2]) => asUser(db, { uid: PARENT, learnerHeader: LEARNER }, fn);
const asParent = <T>(fn: Parameters<typeof asUser<T>>[2]) => asUser(db, { uid: PARENT }, fn);
const asAdmin = <T>(fn: Parameters<typeof asUser<T>>[2]) => asUser(db, { uid: ADMIN, learnerHeader: ADMIN_PROFILE }, fn);

async function one<T = unknown>(sql: string, params?: unknown[]): Promise<T> {
  const r = await db.query<Record<string, unknown>>(sql, params);
  return Object.values(r.rows[0] ?? {})[0] as T;
}

before(async () => {
  ({ db } = await buildDatabase(265));

  // Harness == production (modulo CRLF) for every function 266 patches.
  const rows = await db.query<{ proname: string; raw: string; lf: string }>(
    `select proname, md5(prosrc) raw, md5(replace(prosrc, E'\\r', '')) lf from pg_proc
     where proname = any($1) and pronamespace = 'public'::regnamespace`,
    [Object.keys(LIVE)]
  );
  let sql = readMigration("266");
  for (const r of rows.rows) {
    assert.equal(r.lf, LIVE[r.proname].lfMd5, `harness body of ${r.proname} must equal production's (CR-stripped)`);
    sql = sql.split(LIVE[r.proname].rawMd5).join(r.raw);
  }
  assert.equal(rows.rows.length, 5);

  exposureViewBefore = await one<string>(`select pg_get_viewdef('public.ali_mock_exposed_question_ids'::regclass)`);

  // Seed (as owner): two accounts, one admin, one learner each.
  await db.exec(`
    insert into auth.users (id, email, is_anonymous) values
      ('${PARENT}', 'parent@example.test', false),
      ('${OTHER_PARENT}', 'other@example.test', false),
      ('${ADMIN}', 'admin@example.test', false);
    insert into public.profiles (id, device_id, learner_name, auth_user_id, selected_pathway_id) values
      ('${LEARNER}', 'dev-1', 'Learner', '${PARENT}', 'csse'),
      ('${OTHER_LEARNER}', 'dev-2', 'Other', '${OTHER_PARENT}', 'csse');
    insert into public.profiles (id, device_id, learner_name, auth_user_id, selected_pathway_id, is_admin) values
      ('${ADMIN_PROFILE}', 'dev-3', 'Admin', '${ADMIN}', 'csse', true);
    update public.ali_mock_form set active = true where id = '${ENGLISH_FORM}';
  `);
  firstQuestion = await one<string>(`select question_manifest->0->>'question_id' from public.ali_mock_form where id = $1`, [ENGLISH_FORM]);
  writingQuestion = await one<string>(
    `select e->>'question_id' from public.ali_mock_form f, jsonb_array_elements(f.question_manifest) e
     where f.id = $1 and e->>'section' like 'continuous_writing%' limit 1`,
    [ENGLISH_FORM]
  );

  try {
    await db.exec(sql);
  } catch (e) {
    migrationError = String((e as Error).message ?? e);
    try { await db.exec("rollback"); } catch { /* none */ }
  }

  // The incident shape: a real cycle, a real English attempt created and
  // submitted through the real learner RPCs.
  await asLearner(async (q) => {
    const c = await q("select public.mock_start_new_cycle() as id");
    assert.ok(!c.error, c.error?.message);
    cycleId = String(c.rows[0].id);
    const a = await q("select public.mock_create_cycle_attempt($1, $2) as id", [ENGLISH_FORM, cycleId]);
    assert.ok(!a.error, a.error?.message);
    incidentAttempt = String(a.rows[0].id);
    const s = await q("select * from public.mock_start_attempt($1, 70)", [incidentAttempt]);
    assert.ok(!s.error, s.error?.message);
  });
  // Evidence the void must preserve: an answer and a flag (inserted as owner).
  await db.query(`insert into public.ali_mock_attempt_answer (attempt_id, question_id, response) values ($1, $2, '{"value":"x"}')`, [incidentAttempt, firstQuestion]);
  await db.query(`insert into public.ali_mock_attempt_flag (attempt_id, question_id) values ($1, $2)`, [incidentAttempt, firstQuestion]);
  await asLearner(async (q) => {
    const s = await q("select * from public.mock_submit_attempt($1)", [incidentAttempt]);
    assert.ok(!s.error, s.error?.message);
  });

  // A genuine, never-voided attempt for J (other learner, no cycle).
  validAttempt = await one<string>(
    `insert into public.ali_mock_attempt (profile_id, form_id, attempt_type, status, assigned_question_ids, submitted_at)
     values ($1, 'reading-comprehension-mock-1', 'timed_section', 'submitted', array[]::text[], now()) returning id`,
    [OTHER_LEARNER]
  );
  await db.query(
    `insert into public.ali_mock_attempt_report (attempt_id, scoring_state, analysis_state) values ($1, 'scored', 'complete')
     on conflict (attempt_id) do update set scoring_state = 'scored', analysis_state = 'complete'`,
    [validAttempt]
  );
});

// --- migration applies, shape ---------------------------------------------

test("migration 266 applies cleanly against a production-parity schema (all preconditions, fingerprints, anchors and postconditions pass)", () => {
  assert.equal(migrationError, null, migrationError ?? "");
});

test("the learner assessment record gains ONLY the 'voided' status -- every governance field lives in the separate audit table", async () => {
  const check = await one<string>(`select pg_get_constraintdef(oid) from pg_constraint where conname = 'ali_mock_attempt_status_check'`);
  assert.match(check, /'voided'::text/);
  const attemptCols = await db.query(
    `select column_name from information_schema.columns where table_schema = 'public' and table_name = 'ali_mock_attempt'
     and column_name ~ '(void|reason|note|actor)'`
  );
  assert.equal(attemptCols.rows.length, 0, "no void metadata column on ali_mock_attempt");
  const auditCols = (await db.query<{ column_name: string }>(
    `select column_name from information_schema.columns where table_schema = 'public' and table_name = 'ali_mock_attempt_void_audit' order by ordinal_position`
  )).rows.map((r) => r.column_name);
  assert.deepEqual(auditCols, ["attempt_id", "status_before_void", "reason_code", "internal_note", "voided_at", "voided_by_profile_id", "voided_by_actor"]);
});

test("pairing: even the owner cannot void an attempt without its audit record, nor create an attempt already voided", async () => {
  await assert.rejects(db.query(`update public.ali_mock_attempt set status = 'voided' where id = $1`, [validAttempt]), /without its governance audit record/);
  await assert.rejects(
    db.query(
      `insert into public.ali_mock_attempt (profile_id, form_id, attempt_type, status, assigned_question_ids) values ($1, 'reading-comprehension-mock-1', 'timed_section', 'voided', array[]::text[])`,
      [OTHER_LEARNER]
    ),
    /cannot be created voided/
  );
  await assert.rejects(
    db.query(`insert into public.ali_mock_attempt_void_audit (attempt_id, status_before_void, reason_code, voided_by_actor) values ($1, 'submitted', 'because', 'x')`, [validAttempt]),
    /check constraint/,
    "reason codes are restricted"
  );
});

test("privacy: the void audit table has RLS on, no policies, and no privileges for any API role", async () => {
  assert.equal(await one(`select relrowsecurity from pg_class where oid = 'public.ali_mock_attempt_void_audit'::regclass`), true);
  assert.equal(await one<number>(`select count(*)::int from pg_policies where tablename = 'ali_mock_attempt_void_audit'`), 0);
  const grants = await one<number>(
    `select count(*)::int from information_schema.role_table_grants where table_name = 'ali_mock_attempt_void_audit' and grantee in ('anon','authenticated','service_role','PUBLIC')`
  );
  assert.equal(grants, 0);
});

test("every patched function carries its guard and is otherwise byte-identical to its pre-266 body", async () => {
  const guards: Record<string, string> = {
    mock_release_report: "the attempt is voided",
    mock_claim_evidence_ingestion: "refusing to derive evidence from a voided attempt",
    mock_claim_writing_evidence_ingestion: "refusing to derive Writing evidence from a voided attempt",
    mock_apply_manual_mark: "a voided attempt is never marked",
    mock_create_cycle_attempt: "and subject = v_form.subject and status <> 'voided'",
  };
  for (const [fn, marker] of Object.entries(guards)) {
    const src = await one<string>(`select prosrc from pg_proc where proname = $1 and pronamespace = 'public'::regnamespace`, [fn]);
    assert.ok(src.includes(marker), `${fn} must contain its guard`);
  }
});

// --- F, G: nobody but an admin can void ------------------------------------

test("F: a learner cannot void their own poor result -- not via the RPC, not via the core helper, not via a direct table write", async () => {
  await asLearner(async (q) => {
    const r = await q("select * from public.mock_void_attempt($1, 'admin_correction')", [incidentAttempt]);
    assert.match(r.error?.message ?? "", /Only an admin may void a Mock attempt/);
    const core = await q("select public.mock_void_attempt_core($1, 'admin_correction', null, null, 'x')", [incidentAttempt]);
    assert.match(core.error?.message ?? "", /permission denied/);
    const direct = await q("update public.ali_mock_attempt set status = 'expired' where id = $1 returning id", [incidentAttempt]);
    assert.equal(direct.rows.length, 0, "RLS has no UPDATE policy: a client write changes nothing");
  });
  assert.equal(await one(`select status from public.ali_mock_attempt where id = $1`, [incidentAttempt]), "submitted");
});

test("G: a parent (the account holder, in Parent Mode or for another family) cannot void an attempt", async () => {
  await asParent(async (q) => {
    const r = await q("select * from public.mock_void_attempt($1, 'platform_defect')", [incidentAttempt]);
    assert.match(r.error?.message ?? "", /Only an admin may void a Mock attempt/);
  });
  await asUser(db, { uid: OTHER_PARENT }, async (q) => {
    const r = await q("select * from public.mock_void_attempt($1, 'platform_defect')", [incidentAttempt]);
    assert.match(r.error?.message ?? "", /Only an admin may void a Mock attempt/);
  });
});

test("grants: mock_void_attempt is not executable by anon; the core helper and trigger function are owner-only", async () => {
  const acl = async (sig: string) => one<string>(`select coalesce(proacl::text, '') from pg_proc where oid = $1::regprocedure`, [sig]);
  const voidAcl = await acl("public.mock_void_attempt(uuid, text, text)");
  assert.doesNotMatch(voidAcl, /anon=/);
  assert.match(voidAcl, /authenticated=X/);
  for (const sig of ["public.mock_void_attempt_core(uuid, text, text, uuid, text)", "public.mock_attempt_void_is_terminal()", "public.mock_attempt_void_audit_append_only()"]) {
    assert.doesNotMatch(await acl(sig), /(anon|authenticated|service_role)=/, `${sig} must be owner-only`);
  }
});

// --- before voiding: the slot is genuinely occupied -------------------------

test("before voiding, the incident attempt occupies the English slot: a second English attempt in the same cycle is refused", async () => {
  await asLearner(async (q) => {
    const r = await q("select public.mock_create_cycle_attempt($1, $2) as id", [ENGLISH_FORM, cycleId]);
    assert.match(r.error?.message ?? "", /already has a english attempt/);
  });
});

// --- the void itself ---------------------------------------------------------

test("admin void refuses an unknown reason code and an unknown attempt", async () => {
  await asAdmin(async (q) => {
    assert.match((await q("select * from public.mock_void_attempt($1, 'because')", [incidentAttempt])).error?.message ?? "", /Invalid void reason code/);
    assert.match((await q("select * from public.mock_void_attempt($1, 'platform_defect')", ["99999999-9999-4999-8999-999999999999"])).error?.message ?? "", /not found/);
  });
});

test("admin voids the incident attempt: terminal status, full audit trail, actor derived from the session", async () => {
  const counts = async () => ({
    answers: await one<number>(`select count(*)::int from public.ali_mock_attempt_answer where attempt_id = $1`, [incidentAttempt]),
    flags: await one<number>(`select count(*)::int from public.ali_mock_attempt_flag where attempt_id = $1`, [incidentAttempt]),
    reports: await one<number>(`select count(*)::int from public.ali_mock_attempt_report where attempt_id = $1`, [incidentAttempt]),
  });
  const before = await counts();
  const reportBefore = await one<string>(`select md5(row(r.*)::text) from public.ali_mock_attempt_report r where attempt_id = $1`, [incidentAttempt]);

  await asAdmin(async (q) => {
    const r = await q("select * from public.mock_void_attempt($1, 'platform_defect', 'wrong paper served')", [incidentAttempt]);
    assert.ok(!r.error, r.error?.message);
    assert.equal(r.rows[0].status, "voided");
  });

  const row = (await db.query<Record<string, unknown>>(`select * from public.ali_mock_attempt where id = $1`, [incidentAttempt])).rows[0];
  assert.equal(row.status, "voided");
  const audit = (await db.query<Record<string, unknown>>(`select * from public.ali_mock_attempt_void_audit where attempt_id = $1`, [incidentAttempt])).rows[0];
  assert.equal(audit.status_before_void, "submitted");
  assert.equal(audit.reason_code, "platform_defect");
  assert.equal(audit.internal_note, "wrong paper served");
  assert.equal(audit.voided_by_profile_id, ADMIN_PROFILE);
  assert.equal(audit.voided_by_actor, `admin:${ADMIN_PROFILE}`);
  assert.ok(audit.voided_at);
  assert.equal(row.cycle_id, cycleId, "cycle relationship preserved");
  assert.equal(row.form_id, ENGLISH_FORM);
  assert.deepEqual(await counts(), before, "answers, flags and report row preserved");
  assert.equal(
    await one<string>(`select md5(row(r.*)::text) from public.ali_mock_attempt_report r where attempt_id = $1`, [incidentAttempt]),
    reportBefore,
    "the original report row is untouched"
  );
});

test("voided is terminal: a second void is refused, and even the owner cannot change a voided row", async () => {
  await asAdmin(async (q) => {
    assert.match((await q("select * from public.mock_void_attempt($1, 'platform_defect')", [incidentAttempt])).error?.message ?? "", /already voided/);
  });
  await assert.rejects(db.query(`update public.ali_mock_attempt set status = 'submitted' where id = $1`, [incidentAttempt]), /terminal/);
});

test("a governed migration (database owner) can void through the same core, recording a 'migration:NNN' actor and no profile", async () => {
  const target = await one<string>(
    `insert into public.ali_mock_attempt (profile_id, form_id, attempt_type, status, assigned_question_ids)
     values ($1, 'reading-comprehension-mock-1', 'timed_section', 'in_progress', array[]::text[]) returning id`,
    [OTHER_LEARNER]
  );
  await db.query(`select public.mock_void_attempt_core($1, 'acceptance_test', null, null, 'migration:test')`, [target]);
  assert.equal(await one(`select status from public.ali_mock_attempt where id = $1`, [target]), "voided");
  const audit = (await db.query<Record<string, unknown>>(`select * from public.ali_mock_attempt_void_audit where attempt_id = $1`, [target])).rows[0];
  assert.equal(audit.status_before_void, "in_progress");
  assert.equal(audit.reason_code, "acceptance_test");
  assert.equal(audit.voided_by_actor, "migration:test");
  assert.equal(audit.voided_by_profile_id, null);
});

test("the audit record is append-only: even the owner cannot update or delete it", async () => {
  await assert.rejects(db.query(`update public.ali_mock_attempt_void_audit set internal_note = 'x' where attempt_id = $1`, [incidentAttempt]), /append-only/);
  await assert.rejects(db.query(`delete from public.ali_mock_attempt_void_audit where attempt_id = $1`, [incidentAttempt]), /append-only/);
});

test("privacy: neither the learner nor the parent can read, write or delete the internal void audit record", async () => {
  for (const [who, run] of [["learner", asLearner], ["parent", asParent]] as const) {
    await run(async (q) => {
      const read = await q("select * from public.ali_mock_attempt_void_audit");
      assert.match(read.error?.message ?? "", /permission denied/, `${who} must not read the audit table`);
      const write = await q(
        "insert into public.ali_mock_attempt_void_audit (attempt_id, status_before_void, reason_code, voided_by_actor) values ($1, 'submitted', 'admin_correction', 'x')",
        [validAttempt]
      );
      assert.match(write.error?.message ?? "", /permission denied/, `${who} must not write the audit table`);
      const del = await q("delete from public.ali_mock_attempt_void_audit");
      assert.match(del.error?.message ?? "", /permission denied/, `${who} must not delete from the audit table`);
      // Their own attempt row reveals only the neutral terminal status.
      const own = await q("select * from public.ali_mock_attempt where id = $1", [incidentAttempt]);
      assert.equal(own.rows.length, 1);
      assert.equal(own.rows[0].status, "voided");
      for (const key of Object.keys(own.rows[0])) assert.doesNotMatch(key, /void|reason|note|actor/, `${who} row exposes ${key}`);
    });
  }
});

// --- A, B, C: never a result, never evidence --------------------------------

test("A: a voided attempt's report cannot be released, even when its report is scored and analysed", async () => {
  await db.query(`update public.ali_mock_attempt_report set scoring_state = 'scored', analysis_state = 'complete' where attempt_id = $1`, [incidentAttempt]);
  await asAdmin(async (q) => {
    assert.match((await q("select public.mock_release_report($1)", [incidentAttempt])).error?.message ?? "", /the attempt is voided/);
  });
  assert.equal(await one(`select report_release_state from public.ali_mock_attempt_report where attempt_id = $1`, [incidentAttempt]), "pending");
});

test("B: a voided attempt can never enter standard EI evidence -- even if its report were somehow released", async () => {
  await db.query(`update public.ali_mock_attempt_report set report_release_state = 'released', released_at = now() where attempt_id = $1`, [incidentAttempt]);
  await asLearner(async (q) => {
    assert.match((await q("select public.mock_claim_evidence_ingestion($1)", [incidentAttempt])).error?.message ?? "", /voided attempt/);
  });
  assert.equal(await one(`select ei_evidence_ingested_at from public.ali_mock_attempt_report where attempt_id = $1`, [incidentAttempt]), null);
  await db.query(`update public.ali_mock_attempt_report set report_release_state = 'pending', released_at = null where attempt_id = $1`, [incidentAttempt]);
});

test("C: a voided attempt's Writing assessment can never enter Writing EI evidence", async () => {
  await db.query(
    `insert into public.ali_writing_assessment (attempt_id, question_id, task_type, rubric_version, assessment_version, response_text, dimensions, overall_indicator, assessment_status, automated_model)
     values ($1, $2, 'Q1', 1, 1, 'text', '{}'::jsonb, 50, 'complete', 'test')`,
    [incidentAttempt, writingQuestion]
  );
  await asLearner(async (q) => {
    assert.match((await q("select public.mock_claim_writing_evidence_ingestion($1, $2)", [incidentAttempt, writingQuestion])).error?.message ?? "", /Writing evidence from a voided attempt/);
  });
  assert.equal(await one(`select ei_evidence_ingested_at from public.ali_writing_assessment where attempt_id = $1`, [incidentAttempt]), null);
});

test("a voided attempt is never manually marked", async () => {
  await asAdmin(async (q) => {
    assert.match((await q("select public.mock_apply_manual_mark($1, $2, 1)", [incidentAttempt, firstQuestion])).error?.message ?? "", /never marked/);
  });
});

test("a voided attempt is never offered for resume", async () => {
  await asLearner(async (q) => {
    const r = await q("select * from public.mock_get_resumable_attempt($1)", [ENGLISH_FORM]);
    assert.ok(!r.error, r.error?.message);
    assert.equal(r.rows.length, 0);
  });
});

// --- D, E: the slot is released for a legitimate sitting ---------------------

test("D + E: the voided attempt no longer occupies the English slot, and a legitimate replacement is created in the SAME cycle through the real learner RPC", async () => {
  let replacement = "";
  await asLearner(async (q) => {
    const r = await q("select public.mock_create_cycle_attempt($1, $2) as id", [ENGLISH_FORM, cycleId]);
    assert.ok(!r.error, r.error?.message);
    replacement = String(r.rows[0].id);
  });
  assert.notEqual(replacement, incidentAttempt);
  assert.equal(await one(`select cycle_id from public.ali_mock_attempt where id = $1`, [replacement]), cycleId);
  // ...and the (non-voided) replacement now holds the slot again: a third is refused.
  await asLearner(async (q) => {
    assert.match((await q("select public.mock_create_cycle_attempt($1, $2) as id", [ENGLISH_FORM, cycleId])).error?.message ?? "", /already has a english attempt/);
  });
  // Unique index agrees at the storage level.
  await assert.rejects(
    db.query(
      `insert into public.ali_mock_attempt (profile_id, form_id, attempt_type, status, assigned_question_ids, cycle_id, subject)
       values ($1, $2, 'full_mock', 'assigned', array[]::text[], $3, 'english')`,
      [LEARNER, ENGLISH_FORM, cycleId]
    ),
    /ali_mock_attempt_cycle_subject_unique/
  );
});

// --- H: exposure retained ------------------------------------------------------

test("H: question exposure is retained -- the exposure view is byte-identical and still counts the voided attempt's form", async () => {
  assert.equal(await one(`select pg_get_viewdef('public.ali_mock_exposed_question_ids'::regclass)`), exposureViewBefore);
  await db.query(`update public.ali_mock_form set active = false where id = $1`, [ENGLISH_FORM]);
  const n = await one<number>(`select count(*)::int from public.ali_mock_exposed_question_ids where form_id = $1`, [ENGLISH_FORM]);
  assert.ok(n > 0, "an inactive form with only attempts (including the voided one) remains exposed");
  await db.query(`update public.ali_mock_form set active = true where id = $1`, [ENGLISH_FORM]);
});

// --- refusals that protect already-real results ------------------------------

test("void refuses an attempt whose report is released, or whose standard or Writing evidence is already in EI", async () => {
  const mk = async () =>
    one<string>(
      `insert into public.ali_mock_attempt (profile_id, form_id, attempt_type, status, assigned_question_ids, submitted_at)
       values ($1, 'reading-comprehension-mock-1', 'timed_section', 'submitted', array[]::text[], now()) returning id`,
      [OTHER_LEARNER]
    );
  const released = await mk();
  await db.query(`insert into public.ali_mock_attempt_report (attempt_id, report_release_state) values ($1, 'released') on conflict (attempt_id) do update set report_release_state = 'released'`, [released]);
  const ingested = await mk();
  await db.query(`insert into public.ali_mock_attempt_report (attempt_id, ei_evidence_ingested_at) values ($1, now()) on conflict (attempt_id) do update set ei_evidence_ingested_at = now()`, [ingested]);
  const writingIngested = await mk();
  await db.query(
    `insert into public.ali_writing_assessment (attempt_id, question_id, task_type, rubric_version, assessment_version, response_text, dimensions, overall_indicator, assessment_status, automated_model, ei_evidence_ingested_at)
     values ($1, $2, 'Q1', 1, 1, 'text', '{}'::jsonb, 50, 'complete', 'test', now())`,
    [writingIngested, writingQuestion]
  );
  await asAdmin(async (q) => {
    assert.match((await q("select * from public.mock_void_attempt($1, 'admin_correction')", [released])).error?.message ?? "", /released report/);
    assert.match((await q("select * from public.mock_void_attempt($1, 'admin_correction')", [ingested])).error?.message ?? "", /already entered Educational Intelligence/);
    assert.match((await q("select * from public.mock_void_attempt($1, 'admin_correction')", [writingIngested])).error?.message ?? "", /Writing evidence already in Educational Intelligence/);
  });
  for (const id of [released, ingested, writingIngested]) {
    assert.equal(await one(`select status from public.ali_mock_attempt where id = $1`, [id]), "submitted");
  }
});

// --- J: valid attempts unchanged ---------------------------------------------

test("J: a genuine, never-voided attempt is unaffected -- its report still releases and its evidence can still be claimed", async () => {
  await asAdmin(async (q) => {
    const r = await q("select public.mock_release_report($1)", [validAttempt]);
    assert.ok(!r.error, r.error?.message);
  });
  await asUser(db, { uid: OTHER_PARENT, learnerHeader: OTHER_LEARNER }, async (q) => {
    const r = await q("select public.mock_claim_evidence_ingestion($1) as claimed", [validAttempt]);
    assert.ok(!r.error, r.error?.message);
    assert.equal(r.rows[0].claimed, true);
  });
  assert.equal(await one(`select status from public.ali_mock_attempt where id = $1`, [validAttempt]), "submitted");
  assert.equal(await one(`select count(*)::int from public.ali_mock_attempt where status = 'voided'`), 2, "only the two deliberately voided attempts (admin + migration path) are voided");
  assert.equal(
    await one<number>(
      `select count(*)::int from public.ali_mock_attempt a join public.ali_mock_attempt_void_audit au on au.attempt_id = a.id where a.status = 'voided'`
    ),
    await one<number>(`select count(*)::int from public.ali_mock_attempt_void_audit`),
    "every audit record belongs to a voided attempt, one each"
  );
});

// --- I: no DELETE ----------------------------------------------------------------

test("I: migration 266 contains no DELETE and never voids anything itself", () => {
  const code = readMigration("266")
    .split("\n")
    .filter((l) => !/^\s*--/.test(l))
    .join("\n");
  assert.doesNotMatch(code, /\bdelete\s+from\b/i);
  assert.doesNotMatch(code, /\btruncate\b/i);
  assert.doesNotMatch(code, /9ae70cee|0f98b4fd|cb04cc9f/, "266 must not reference any production attempt -- voiding is a separate, governed step (267)");
});
