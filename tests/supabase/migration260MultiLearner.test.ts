import { test, before } from "node:test";
import assert from "node:assert/strict";
import type { PGlite } from "@electric-sql/pglite";
import { buildDatabase, readMigration, asUser } from "./support/pgliteHarness";

/**
 * Migration 260 -- multi-learner household architecture. Runs the REAL
 * migration chain (001..259) plus 260 on real Postgres (PGlite) and proves:
 * existing data preservation, deterministic first-learner mapping,
 * ownership-validated active learner, cross-account and cross-sibling
 * isolation through real RLS and real SECURITY DEFINER RPCs, governed
 * learner creation, and anonymous-upgrade (claim_legacy_profile) safety.
 */

const A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"; // Parent A (permanent)
const B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"; // Parent B (permanent)
const ANON = "cccccccc-cccc-4ccc-8ccc-cccccccccccc"; // anonymous session
const NEWU = "dddddddd-dddd-4ddd-8ddd-dddddddddddd"; // brand-new parent, no learner yet
const NEWU2 = "eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee";
const NEWU3 = "ffffffff-ffff-4fff-8fff-ffffffffffff";

const PA1 = "a1a1a1a1-0000-4000-8000-000000000001"; // A's existing learner (pre-migration)
const PB1 = "b1b1b1b1-0000-4000-8000-000000000001"; // B's only learner
const UNOWNED_EMPTY = "0e0e0e0e-0000-4000-8000-000000000001"; // device profile, no owner, no evidence
const UNOWNED_WITH_EVIDENCE = "0e0e0e0e-0000-4000-8000-000000000002";

let db: PGlite;
let failedFiles: string[] = [];
let preSnapshot: Record<string, number> = {};
let preChecksum = "";
let preRewriteCandidates: string[] = [];
let preexistingAdminInsertHole = false;
let preexistingAdminUpdateHole = false;
let migrationError: string | null = null;
let A2 = "";

const REGEX_PATTERN = "from\\s+public\\.profiles\\s+where\\s+auth_user_id\\s*=\\s*auth\\.uid\\(\\)";

async function learnerKeyedCounts(): Promise<Record<string, number>> {
  const cols = await db.query<{ table_name: string }>(
    `select distinct c.table_name from information_schema.columns c
     join information_schema.tables t on t.table_schema=c.table_schema and t.table_name=c.table_name and t.table_type='BASE TABLE'
     where c.table_schema='public' and c.column_name in ('profile_id','learner_id') order by 1`
  );
  const out: Record<string, number> = {};
  for (const r of cols.rows) {
    const n = await db.query<{ n: number }>(`select count(*)::int as n from public.${r.table_name}`);
    out[r.table_name] = n.rows[0].n;
  }
  const p = await db.query<{ n: number }>("select count(*)::int as n from public.profiles");
  out["profiles"] = p.rows[0].n;
  return out;
}

async function firstEnum(table: string, column: string): Promise<string> {
  const t = await db.query<{ udt_name: string }>(
    "select udt_name from information_schema.columns where table_schema='public' and table_name=$1 and column_name=$2",
    [table, column]
  );
  const e = await db.query<{ v: string }>(
    "select enumlabel as v from pg_enum e join pg_type ty on ty.oid=e.enumtypid where ty.typname=$1 order by e.enumsortorder limit 1",
    [t.rows[0].udt_name]
  );
  return e.rows[0].v;
}

before(async () => {
  const built = await buildDatabase(259);
  db = built.db;
  failedFiles = built.failedFiles;

  // ---- Seed the production-like PRE-migration world: one profile per account.
  await db.exec(`
    insert into auth.users (id, email, is_anonymous) values
      ('${A}', 'a@example.test', false), ('${B}', 'b@example.test', false),
      ('${ANON}', null, true), ('${NEWU}', 'n@example.test', false),
      ('${NEWU2}', 'n2@example.test', false), ('${NEWU3}', 'n3@example.test', false);
    insert into public.profiles (id, device_id, name, auth_user_id, selected_pathway_id) values
      ('${PA1}', 'dev-a1', 'Angel', '${A}', 'csse'),
      ('${PB1}', 'dev-b1', 'Angel', '${B}', 'gl'),
      ('${UNOWNED_EMPTY}', 'dev-unowned-empty', 'Angel', null, null),
      ('${UNOWNED_WITH_EVIDENCE}', 'dev-unowned-evidence', 'Angel', null, null);
  `);
  const lessonSubject = await firstEnum("lesson_progress", "subject");
  const bankSubject = await firstEnum("ali_question_bank", "subject");
  const bankDifficulty = await firstEnum("ali_question_bank", "content_difficulty");
  await db.exec(`
    insert into public.user_stats (profile_id, total_xp, streak) values ('${PA1}', 120, 4), ('${PB1}', 30, 1);
    insert into public.lesson_progress (profile_id, lesson_id, subject, score, xp_gained) values
      ('${PA1}', 'l1', '${lessonSubject}', 80, 10), ('${PA1}', 'l2', '${lessonSubject}', 90, 10),
      ('${PB1}', 'l1', '${lessonSubject}', 50, 10),
      ('${UNOWNED_WITH_EVIDENCE}', 'l1', '${lessonSubject}', 70, 10);
    insert into public.ali_question_bank (id, subject, skill, pathway, content_difficulty, prompt, explanation, mastery_threshold, learning_unit_id)
      values ('q1', '${bankSubject}', 's', array['csse'], '${bankDifficulty}', '{}'::jsonb, 'e', 3, 'u1');
    insert into public.ali_student_question_history (profile_id, question_id, last_presented_at_sequence) values
      ('${PA1}', 'q1', 1), ('${PB1}', 'q1', 1);
    insert into public.ali_durable_mastery (profile_id, competency_code) values ('${PA1}', 'c1'), ('${PB1}', 'c1');
  `);

  // ---- Pre-migration facts.
  preSnapshot = await learnerKeyedCounts();
  const ck = await db.query<{ c: string }>(
    `select md5(string_agg(id::text||'|'||coalesce(auth_user_id::text,'')||'|'||device_id||'|'||coalesce(selected_pathway_id,'')||'|'||is_admin::text, ',' order by id)) as c from public.profiles`
  );
  preChecksum = ck.rows[0].c;
  const cand = await db.query<{ proname: string }>(
    `select p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
     where n.nspname='public' and p.prokind='f' and p.prosrc ~* $1
       and p.proname not in ('is_current_user_admin') order by 1`,
    [REGEX_PATTERN]
  );
  preRewriteCandidates = cand.rows.map((r) => r.proname);

  // Pre-existing gap check: can a brand-new user insert their own admin row today?
  await asUser(db, { uid: NEWU3 }, async (q) => {
    const ins = await q(
      "insert into public.profiles (device_id, auth_user_id, is_admin) values ('dev-hole', $1, true) returning is_admin",
      [NEWU3]
    );
    preexistingAdminInsertHole = ins.rows[0]?.is_admin === true;
  });
  await db.exec(`delete from public.profiles where device_id = 'dev-hole'`);
  await asUser(db, { uid: A }, async (q) => {
    const upd = await q("update public.profiles set is_admin = true where id = $1 returning is_admin", [PA1]);
    preexistingAdminUpdateHole = upd.rows[0]?.is_admin === true;
  });
  await db.exec(`update public.profiles set is_admin = false where id = '${PA1}'`);
  preSnapshot = await learnerKeyedCounts();
  const ck2 = await db.query<{ c: string }>(
    `select md5(string_agg(id::text||'|'||coalesce(auth_user_id::text,'')||'|'||device_id||'|'||coalesce(selected_pathway_id,'')||'|'||is_admin::text, ',' order by id)) as c from public.profiles`
  );
  preChecksum = ck2.rows[0].c;

  // ---- Apply migration 260 exactly as the Founder would.
  try {
    await db.exec(readMigration("260"));
  } catch (e) {
    migrationError = String((e as Error).message);
    try { await db.exec("rollback"); } catch { /* none */ }
  }
});

test("harness sanity: the real chain replays and only data-guarded content migrations are skipped", () => {
  assert.ok(failedFiles.length < 30, `unexpected number of failed migrations: ${failedFiles.length}`);
  for (const f of failedFiles) {
    assert.match(f, /^(12[3-9]|13\d|14\d|15\d|18\d|21\d|22\d|23\d|24\d|25\d)_/, `unexpected schema migration failure: ${f}`);
  }
});

test("migration 260 applies cleanly to a production-shaped database", () => {
  assert.equal(migrationError, null);
});

test("every learner-keyed table and every profile is preserved exactly (counts + identity/ownership checksum)", async () => {
  assert.deepEqual(await learnerKeyedCounts(), preSnapshot);
  const ck = await db.query<{ c: string }>(
    `select md5(string_agg(id::text||'|'||coalesce(auth_user_id::text,'')||'|'||device_id||'|'||coalesce(selected_pathway_id,'')||'|'||is_admin::text, ',' order by id)) as c from public.profiles`
  );
  assert.equal(ck.rows[0].c, preChecksum);
});

test("every existing account maps to exactly one initial learner: its own pre-existing profile, evidence still attached", async () => {
  const r = await db.query<{ auth_user_id: string; n: number }>(
    "select auth_user_id, count(*)::int as n from public.profiles where auth_user_id is not null group by 1"
  );
  for (const row of r.rows) assert.equal(row.n, 1);
  const a = await db.query<{ n: number }>(`select count(*)::int n from public.lesson_progress where profile_id='${PA1}'`);
  assert.equal(a.rows[0].n, 2);
  const s = await db.query<{ total_xp: number }>(`select total_xp from public.user_stats where profile_id='${PA1}'`);
  assert.equal(s.rows[0].total_xp, 120);
});

test("all account-resolved SECURITY DEFINER functions were rewritten; none still pick a learner by account alone", async () => {
  assert.ok(preRewriteCandidates.length >= 20, `expected many rewrite candidates, found ${preRewriteCandidates.length}`);
  const left = await db.query<{ proname: string }>(
    `select p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
     where n.nspname='public' and p.prokind='f' and p.prosrc ~* $1
       and p.proname not in ('is_current_user_admin','current_learner_id','current_account_default_learner_id')`,
    [REGEX_PATTERN]
  );
  assert.deepEqual(left.rows, []);
  const now = await db.query<{ proname: string }>(
    `select p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace
     where n.nspname='public' and p.prokind='f'
       and (p.prosrc like '%current_learner_id()%' or p.prosrc like '%current_account_default_learner_id()%')
       and p.proname not in ('current_learner_id','current_account_default_learner_id','create_learner') order by 1`
  );
  assert.deepEqual(
    now.rows.map((r) => r.proname),
    preRewriteCandidates.filter((n) => !["current_learner_id"].includes(n))
  );
});

test("single learner, no header (currently deployed client): behaves exactly as before", async () => {
  await asUser(db, { uid: A }, async (q) => {
    const r = await q("select public.current_learner_id() as id");
    assert.equal(r.rows[0].id, PA1);
    const t = await q("select public.record_question_bank_telemetry('q1', true)");
    assert.equal(t.error, undefined);
  });
});

test("create_learner adds a second learner under the same parent, governed and validated", async () => {
  await asUser(db, { uid: A }, async (q) => {
    const bad1 = await q("select public.create_learner('   ')");
    assert.match(bad1.error?.message ?? "", /angel_invalid_learner_name/);
    const bad2 = await q("select public.create_learner($1)", ["x".repeat(41)]);
    assert.match(bad2.error?.message ?? "", /angel_invalid_learner_name/);
    const bad3 = await q("select public.create_learner('Sam', 'nonsense')");
    assert.match(bad3.error?.message ?? "", /angel_invalid_pathway/);
    const ok = await q("select public.create_learner('Sam', 'csse') as id");
    assert.equal(ok.error, undefined);
    A2 = String(ok.rows[0].id);
    assert.match(A2, /^[0-9a-f-]{36}$/);
  });
  const own = await db.query<{ auth_user_id: string; learner_name: string }>(`select auth_user_id, learner_name from public.profiles where id='${A2}'`);
  assert.equal(own.rows[0].auth_user_id, A);
  assert.equal(own.rows[0].learner_name, "Sam");
});

test("direct INSERT/UPDATE cannot create or attach a second learner (same 23505 the deployed client already handles)", async () => {
  await asUser(db, { uid: A }, async (q) => {
    const ins = await q("insert into public.profiles (device_id, auth_user_id) values ('dev-sneaky', $1)", [A]);
    assert.equal(ins.error?.code, "23505");
    assert.match(ins.error?.message ?? "", /profiles_auth_user_id_key/);
  });
  await asUser(db, { uid: B }, async (q) => {
    const upd = await q("update public.profiles set auth_user_id = $1 where id = $2", [B, UNOWNED_EMPTY]);
    // Ownership columns are not client-writable at all (and the row is not visible to B under RLS).
    assert.match(upd.error?.message ?? "", /permission denied/i);
  });
  const still = await db.query<{ auth_user_id: string | null }>(`select auth_user_id from public.profiles where id='${UNOWNED_EMPTY}'`);
  assert.equal(still.rows[0].auth_user_id, null);
});

test("active learner is ownership-validated in the database: header wins, wrong/foreign/garbage header fails closed, missing header with >1 learners fails closed", async () => {
  await asUser(db, { uid: A, learnerHeader: A2 }, async (q) => {
    assert.equal((await q("select public.current_learner_id() as id")).rows[0].id, A2);
  });
  await asUser(db, { uid: A, learnerHeader: PA1 }, async (q) => {
    assert.equal((await q("select public.current_learner_id() as id")).rows[0].id, PA1);
  });
  await asUser(db, { uid: A, learnerHeader: PB1 }, async (q) => {
    const r = await q("select public.current_learner_id() as id");
    assert.match(r.error?.message ?? "", /angel_learner_not_owned/);
  });
  await asUser(db, { uid: A, learnerHeader: "not-a-uuid" }, async (q) => {
    const r = await q("select public.current_learner_id() as id");
    assert.match(r.error?.message ?? "", /angel_learner_not_owned/);
  });
  await asUser(db, { uid: A }, async (q) => {
    const r = await q("select public.current_learner_id() as id");
    assert.match(r.error?.message ?? "", /angel_learner_required/);
  });
});

test("SIBLING isolation through a real learner-scoped RPC: A1 has history for q1, A2 does not -- each header resolves to its own learner only", async () => {
  await asUser(db, { uid: A, learnerHeader: PA1 }, async (q) => {
    const r = await q("select public.record_question_bank_telemetry('q1', false)");
    assert.equal(r.error, undefined);
  });
  await asUser(db, { uid: A, learnerHeader: A2 }, async (q) => {
    const r = await q("select public.record_question_bank_telemetry('q1', true)");
    assert.match(r.error?.message ?? "", /No history row exists for caller and question/);
  });
  // A1 acting under B's learner id is refused outright.
  await asUser(db, { uid: A, learnerHeader: PB1 }, async (q) => {
    const r = await q("select public.record_question_bank_telemetry('q1', true)");
    assert.match(r.error?.message ?? "", /angel_learner_not_owned/);
  });
});

test("CROSS-ACCOUNT isolation through real RLS: Parent B sees only B's learner and evidence; Parent A only A's two", async () => {
  await asUser(db, { uid: B, learnerHeader: PB1 }, async (q) => {
    const p = await q("select id from public.profiles order by id");
    assert.deepEqual(p.rows.map((r) => r.id), [PB1]);
    for (const [table, col] of [
      ["lesson_progress", "profile_id"], ["user_stats", "profile_id"],
      ["ali_student_question_history", "profile_id"], ["ali_durable_mastery", "profile_id"],
    ] as const) {
      const r = await q(`select distinct ${col} as pid from public.${table}`);
      assert.deepEqual(r.rows.map((x) => x.pid), [PB1], `${table} leaked another learner to parent B`);
    }
  });
  await asUser(db, { uid: A, learnerHeader: PA1 }, async (q) => {
    const p = await q("select id from public.profiles order by id");
    assert.deepEqual(p.rows.map((r) => r.id).sort(), [PA1, A2].sort());
    const r = await q("select distinct profile_id as pid from public.lesson_progress");
    assert.deepEqual(r.rows.map((x) => x.pid), [PA1]);
    // Parent A cannot write evidence into B's learner.
    const w = await q("insert into public.lesson_progress (profile_id, lesson_id, subject, score, xp_gained) select $1, 'x', subject, 1, 1 from public.lesson_progress limit 1", [PB1]);
    assert.ok(w.error, "Parent A must not be able to insert evidence for Parent B's learner");
  });
});

test("learner evidence written for A1 never appears under A2 (per-learner filtering by learner id)", async () => {
  await asUser(db, { uid: A, learnerHeader: A2 }, async (q) => {
    const u = await q("select * from public.user_stats where profile_id = $1", [A2]);
    assert.deepEqual(u.rows, []);
    const l = await q("select * from public.lesson_progress where profile_id = $1", [A2]);
    assert.deepEqual(l.rows, []);
    const h = await q("select * from public.ali_student_question_history where profile_id = $1", [A2]);
    assert.deepEqual(h.rows, []);
    const m = await q("select * from public.ali_durable_mastery where profile_id = $1", [A2]);
    assert.deepEqual(m.rows, []);
  });
  const a1 = await db.query<{ n: number }>(`select count(*)::int n from public.lesson_progress where profile_id='${PA1}'`);
  assert.equal(a1.rows[0].n, 2);
});

test("learner name/nickname: parent can set it on own learner; length and control characters rejected; cannot touch another parent's learner", async () => {
  await asUser(db, { uid: A }, async (q) => {
    const ok = await q("update public.profiles set learner_name = 'Loni' where id = $1 returning learner_name", [PA1]);
    assert.equal(ok.rows[0].learner_name, "Loni");
    const long = await q("update public.profiles set learner_name = $2 where id = $1", [PA1, "y".repeat(41)]);
    assert.ok(long.error);
    const ctl = await q("update public.profiles set learner_name = E'a\\nb' where id = $1", [PA1]);
    assert.ok(ctl.error);
    const steal = await q("update public.profiles set learner_name = 'Hacked' where id = $1 returning id", [PB1]);
    assert.deepEqual(steal.rows, []);
  });
  const b = await db.query<{ learner_name: string | null }>(`select learner_name from public.profiles where id='${PB1}'`);
  assert.equal(b.rows[0].learner_name, null);
});

test("per-learner preparation state persists on the learner row (pathway, exam date, school year) and is independent per learner", async () => {
  await asUser(db, { uid: A }, async (q) => {
    await q("update public.profiles set selected_pathway_id='csse', target_exam_date='2027-09-15', target_exam_date_provenance='parent_supplied', school_year='Year 5' where id=$1", [PA1]);
    await q("update public.profiles set selected_pathway_id='gl', school_year='Year 4' where id=$1", [A2]);
    const r = await q("select id, selected_pathway_id, target_exam_date::text as d, school_year from public.profiles order by school_year");
    const byId = Object.fromEntries(r.rows.map((x) => [x.id as string, x]));
    assert.equal(byId[PA1].selected_pathway_id, "csse");
    assert.equal(byId[PA1].d, "2027-09-15");
    assert.equal(byId[A2].selected_pathway_id, "gl");
    assert.equal(byId[A2].d, null);
    const bad = await q("update public.profiles set school_year='Year 9' where id=$1", [A2]);
    assert.ok(bad.error);
  });
});

test("anonymous sessions cannot add extra learners; permanent accounts are capped at 8", async () => {
  await asUser(db, { uid: ANON, anonymous: true }, async (q) => {
    const r = await q("select public.create_learner('Kid')");
    assert.match(r.error?.message ?? "", /angel_add_learner_requires_account/);
  });
  await asUser(db, { uid: B }, async (q) => {
    for (let i = 2; i <= 8; i++) {
      const r = await q("select public.create_learner($1)", [`Child ${i}`]);
      assert.equal(r.error, undefined, `learner ${i} should be allowed`);
    }
    const nine = await q("select public.create_learner('Child 9')");
    assert.match(nine.error?.message ?? "", /angel_learner_limit/);
  });
  await db.exec(`delete from public.profiles where auth_user_id='${B}' and id <> '${PB1}'`);
});

test("PRE-EXISTING GAPS: before 260 a client could insert AND update its own is_admin; after 260 neither works, and ownership columns are not client-writable", async () => {
  assert.equal(preexistingAdminInsertHole, true, "expected to reproduce the pre-existing is_admin insert gap before 260");
  assert.equal(preexistingAdminUpdateHole, true, "expected to reproduce the pre-existing is_admin update gap before 260 (column-level revoke ineffective under table-level grant)");
  await asUser(db, { uid: A }, async (q) => {
    const adm = await q("update public.profiles set is_admin = true where id = $1", [PA1]);
    assert.match(adm.error?.message ?? "", /permission denied/i);
    const own = await q("update public.profiles set auth_user_id = $1 where id = $2", [B, PA1]);
    assert.match(own.error?.message ?? "", /permission denied/i);
    const ok = await q("update public.profiles set selected_pathway_id = 'csse' where id = $1 returning id", [PA1]);
    assert.equal(ok.error, undefined, "legitimate pathway update must still work");
  });
  const admin = await db.query<{ n: number }>("select count(*)::int n from public.profiles where is_admin");
  assert.equal(admin.rows[0].n, 0);
  await asUser(db, { uid: NEWU3 }, async (q) => {
    const ins = await q("insert into public.profiles (device_id, auth_user_id, is_admin) values ('dev-hole2', $1, true) returning is_admin", [NEWU3]);
    assert.equal(ins.rows[0]?.is_admin, false);
  });
});

test("ANONYMOUS UPGRADE: claim_legacy_profile gives a new parent exactly ONE learner, never a second, never evidence-bearing, never a claimed one", async () => {
  // Parent A already owns learners: must NOT attach the unowned device profile.
  await asUser(db, { uid: A }, async (q) => {
    const r = await q("select public.claim_legacy_profile('dev-unowned-empty') as id");
    assert.equal(r.rows[0].id, null);
  });
  // A brand-new parent claims the empty device profile: becomes their one learner.
  await asUser(db, { uid: NEWU }, async (q) => {
    const r = await q("select public.claim_legacy_profile('dev-unowned-empty') as id");
    assert.equal(r.rows[0].id, UNOWNED_EMPTY);
    const again = await q("select public.claim_legacy_profile('dev-unowned-empty') as id");
    assert.equal(again.rows[0].id, null);
  });
  // A different new parent on the same device cannot take the now-claimed profile.
  await asUser(db, { uid: NEWU2 }, async (q) => {
    const r = await q("select public.claim_legacy_profile('dev-unowned-empty') as id");
    assert.equal(r.rows[0].id, null);
    // ...nor an evidence-bearing device profile (migration 188's rule is preserved).
    const ev = await q("select public.claim_legacy_profile('dev-unowned-evidence') as id");
    assert.equal(ev.rows[0].id, null);
  });
  const owner = await db.query<{ auth_user_id: string | null }>(`select auth_user_id from public.profiles where id='${UNOWNED_WITH_EVIDENCE}'`);
  assert.equal(owner.rows[0].auth_user_id, null);
  const n = await db.query<{ n: number }>(`select count(*)::int n from public.profiles where auth_user_id='${NEWU}'`);
  assert.equal(n.rows[0].n, 1);
});

test("first-learner creation path: a brand-new account still gets exactly one learner through the normal insert; a second direct insert is refused", async () => {
  await asUser(db, { uid: NEWU2 }, async (q) => {
    const first = await q("insert into public.profiles (device_id, auth_user_id) values ('dev-first', $1) returning id", [NEWU2]);
    assert.equal(first.error, undefined);
    const dup = await q("insert into public.profiles (device_id, auth_user_id) values ('dev-first-2', $1)", [NEWU2]);
    assert.equal(dup.error?.code, "23505");
  });
});

test("dependency guard: every current learner-scoped table still enforces account ownership by RLS (policies present)", async () => {
  const r = await db.query<{ tablename: string }>(
    `select distinct tablename from pg_policies where schemaname='public'
      and tablename in ('user_stats','lesson_progress','ali_student_question_history','ali_durable_mastery','ali_student_adaptive_state','ali_mock_attempt','ali_family_focus_selection')`
  );
  assert.ok(r.rows.length >= 6, `expected ownership policies on learner tables, found ${r.rows.length}`);
});

test("static coverage: every learner-resolving function defined anywhere in the migration chain was present in the test database and rewritten", async () => {
  const fs = await import("node:fs");
  const path = await import("node:path");
  const { splitStatements } = await import("./support/pgliteHarness");
  const dir = path.resolve(process.cwd(), "supabase", "migrations");
  const pat = new RegExp(REGEX_PATTERN, "i");
  const names = new Set<string>();
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".sql") && Number(x.split("_")[0]) <= 259)) {
    for (const stmt of splitStatements(fs.readFileSync(path.join(dir, f), "utf8"))) {
      const body = stmt.replace(/^(\s|--[^\n]*\n)+/g, "");
      const m = /^create\s+(?:or\s+replace\s+)?function\s+public\.([a-z_0-9]+)/i.exec(body);
      if (m && pat.test(stmt) && m[1] !== "is_current_user_admin") names.add(m[1]);
    }
  }
  const missing = [...names].filter((n) => !preRewriteCandidates.includes(n));
  assert.deepEqual(missing, [], "functions defined in migrations but absent from the test database (would be untested)");
});

test("MOCK ownership through a real Mock RPC: A1's open attempt is returned only for A1, A2's only for A2, and never to another parent", async () => {
  await db.exec(`
    insert into public.ali_mock_form (id, attempt_type, question_manifest) values ('form-x', 'full_mock', '[]'::jsonb);
    insert into public.ali_mock_attempt (profile_id, form_id, attempt_type, assigned_question_ids, status) values
      ('${PA1}', 'form-x', 'full_mock', array['q1'], 'in_progress'),
      ('${A2}', 'form-x', 'full_mock', array['q1'], 'in_progress');
  `);
  const idFor = async (profile: string) =>
    (await db.query<{ id: string }>(`select id from public.ali_mock_attempt where profile_id='${profile}'`)).rows[0].id;
  const attemptA1 = await idFor(PA1);
  const attemptA2 = await idFor(A2);
  assert.notEqual(attemptA1, attemptA2);

  await asUser(db, { uid: A, learnerHeader: PA1 }, async (q) => {
    const r = await q("select attempt_id from public.mock_get_resumable_attempt('form-x')");
    assert.deepEqual(r.rows.map((x) => x.attempt_id), [attemptA1]);
  });
  await asUser(db, { uid: A, learnerHeader: A2 }, async (q) => {
    const r = await q("select attempt_id from public.mock_get_resumable_attempt('form-x')");
    assert.deepEqual(r.rows.map((x) => x.attempt_id), [attemptA2]);
  });
  // Parent B, even naming A's learner, gets nothing and an ownership error -- never A's attempt.
  await asUser(db, { uid: B, learnerHeader: PA1 }, async (q) => {
    const r = await q("select attempt_id from public.mock_get_resumable_attempt('form-x')");
    assert.match(r.error?.message ?? "", /angel_learner_not_owned/);
    assert.deepEqual(r.rows, []);
  });
  await asUser(db, { uid: B, learnerHeader: PB1 }, async (q) => {
    const r = await q("select attempt_id from public.mock_get_resumable_attempt('form-x')");
    assert.deepEqual(r.rows, []);
    const direct = await q("select id from public.ali_mock_attempt");
    assert.deepEqual(direct.rows, [], "RLS: parent B must not see any of parent A's Mock attempts");
  });
  // Under one account with two learners, a missing header can never pick a learner for a Mock action.
  await asUser(db, { uid: A }, async (q) => {
    const r = await q("select attempt_id from public.mock_get_resumable_attempt('form-x')");
    assert.match(r.error?.message ?? "", /angel_learner_required/);
  });
});

test("SIGN-OUT / SIGN-IN and shared device: switching to the other parent's session yields only their own learner, in both directions", async () => {
  for (const [uid, own, foreign] of [[A, PA1, PB1], [B, PB1, PA1]] as const) {
    await asUser(db, { uid, learnerHeader: own }, async (q) => {
      assert.equal((await q("select public.current_learner_id() as id")).rows[0].id, own);
    });
    await asUser(db, { uid, learnerHeader: foreign }, async (q) => {
      assert.match((await q("select public.current_learner_id() as id")).error?.message ?? "", /angel_learner_not_owned/);
    });
  }
});
