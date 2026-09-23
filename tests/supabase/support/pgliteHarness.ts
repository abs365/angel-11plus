import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";
import path from "node:path";

/**
 * Real-Postgres (PGlite = Postgres compiled to WASM) test harness for
 * migrations and RLS. Supersedes the "no Postgres engine is available"
 * limitation recorded in scripts/migration-sql-guard.mjs for the
 * behaviours it can prove: replays the real supabase/migrations chain on
 * top of minimal Supabase stubs (auth.users, auth.uid(), auth.role(),
 * auth.jwt(), the anon/authenticated/service_role roles) so RLS,
 * SECURITY DEFINER functions and triggers execute for real.
 *
 * Content migrations that deliberately refuse to run unless specific
 * production data rows exist (e.g. "expected exactly 313 affected rows")
 * cannot succeed against an empty database by design. Their DDL-only
 * statements (functions, tables, policies, grants) are applied leniently,
 * statement by statement, so learner-scoped functions those files define
 * still exist for the tests; their data statements (INSERT/UPDATE/DELETE/DO)
 * are skipped.
 */

const MIGRATIONS_DIR = path.resolve(process.cwd(), "supabase", "migrations");

const BOOTSTRAP = `
create schema if not exists auth;
create schema if not exists extensions;
create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  is_anonymous boolean not null default false,
  raw_user_meta_data jsonb default '{}'::jsonb
);
do $$ begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if;
end $$;
create or replace function auth.uid() returns uuid language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create or replace function auth.role() returns text language sql stable as
  $$ select nullif(current_setting('request.jwt.claim.role', true), '') $$;
create or replace function auth.jwt() returns jsonb language sql stable as
  $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
grant usage on schema public, auth to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
`;

/** Splits SQL into top-level statements (respects quotes, $tag$ bodies, comments). */
export function splitStatements(sql: string): string[] {
  const out: string[] = [];
  let cur = "";
  let i = 0;
  while (i < sql.length) {
    const c = sql[i];
    const two = sql.slice(i, i + 2);
    if (two === "--") {
      const end = sql.indexOf("\n", i);
      const stop = end === -1 ? sql.length : end;
      cur += sql.slice(i, stop);
      i = stop;
    } else if (two === "/*") {
      const end = sql.indexOf("*/", i + 2);
      const stop = end === -1 ? sql.length : end + 2;
      cur += sql.slice(i, stop);
      i = stop;
    } else if (c === "'") {
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === "'" && sql[j + 1] === "'") j += 2;
        else if (sql[j] === "'") break;
        else j++;
      }
      cur += sql.slice(i, j + 1);
      i = j + 1;
    } else if (c === "$") {
      const m = /^\$[A-Za-z_]*\$/.exec(sql.slice(i));
      if (m) {
        const tag = m[0];
        const end = sql.indexOf(tag, i + tag.length);
        const stop = end === -1 ? sql.length : end + tag.length;
        cur += sql.slice(i, stop);
        i = stop;
      } else {
        cur += c;
        i++;
      }
    } else if (c === ";") {
      if (cur.trim()) out.push(cur.trim());
      cur = "";
      i++;
    } else {
      cur += c;
      i++;
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function firstKeyword(stmt: string): string {
  const stripped = stmt.replace(/^(\s|--[^\n]*\n|\/\*[\s\S]*?\*\/)+/g, "");
  return (stripped.match(/^[A-Za-z]+/)?.[0] ?? "").toLowerCase();
}

const DDL_KEYWORDS = new Set(["create", "alter", "grant", "revoke", "comment"]);

export interface Harness {
  db: PGlite;
  failedFiles: string[];
}

/** Replays migrations 001..stopAfter (inclusive) on a fresh database. */
export async function buildDatabase(stopAfter: number): Promise<Harness> {
  const db = new PGlite();
  await db.exec(BOOTSTRAP);
  const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
  const failedFiles: string[] = [];
  for (const f of files) {
    if (Number(f.split("_")[0]) > stopAfter) break;
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, f), "utf8");
    try {
      await db.exec(sql);
    } catch {
      try { await db.exec("rollback"); } catch { /* not in a transaction */ }
      failedFiles.push(f);
      for (const stmt of splitStatements(sql)) {
        if (!DDL_KEYWORDS.has(firstKeyword(stmt))) continue;
        try { await db.exec(stmt); } catch { /* dependent on skipped data */ }
      }
    }
  }
  return { db, failedFiles };
}

export function readMigration(n: string): string {
  const f = fs.readdirSync(MIGRATIONS_DIR).find((x) => x.startsWith(`${n}_`));
  if (!f) throw new Error(`migration ${n} not found`);
  return fs.readFileSync(path.join(MIGRATIONS_DIR, f), "utf8");
}

export interface Caller {
  uid: string;
  anonymous?: boolean;
  /** Value of the x-angel-learner-id request header, if the client sent one. */
  learnerHeader?: string | null;
  /** PRIVATE LEARNER SPACE (migration 263): value of the x-angel-learner-token request header, if the client sent one. */
  learnerToken?: string | null;
}

export interface QueryResult {
  rows: Record<string, unknown>[];
  error?: { message: string; code?: string };
}

/**
 * Runs `fn` as a PostgREST-like authenticated caller: `set role
 * authenticated` (RLS applies), JWT claims and request.headers set the
 * way Supabase does. Always restores the superuser session afterwards.
 */
export async function asUser<T>(
  db: PGlite,
  caller: Caller,
  fn: (q: (sql: string, params?: unknown[]) => Promise<QueryResult>) => Promise<T>
): Promise<T> {
  const claims = JSON.stringify({ sub: caller.uid, role: "authenticated", is_anonymous: Boolean(caller.anonymous) });
  const headerObj: Record<string, string> = {};
  if (caller.learnerHeader) headerObj["x-angel-learner-id"] = caller.learnerHeader;
  if (caller.learnerToken) headerObj["x-angel-learner-token"] = caller.learnerToken;
  const headers = JSON.stringify(headerObj);
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [caller.uid]);
  await db.query("select set_config('request.jwt.claim.role', 'authenticated', false)");
  await db.query("select set_config('request.jwt.claims', $1, false)", [claims]);
  await db.query("select set_config('request.headers', $1, false)", [headers]);
  await db.exec("set role authenticated");
  const q = async (sql: string, params?: unknown[]): Promise<QueryResult> => {
    // A failed statement inside a savepoint must not poison later queries.
    await db.exec("savepoint _q");
    try {
      const r = await db.query<Record<string, unknown>>(sql, params);
      await db.exec("release savepoint _q");
      return { rows: r.rows };
    } catch (e) {
      await db.exec("rollback to savepoint _q");
      await db.exec("release savepoint _q");
      const err = e as { message?: string; code?: string };
      return { rows: [], error: { message: String(err.message ?? e), code: err.code } };
    }
  };
  try {
    await db.exec("begin");
    return await fn(q);
  } finally {
    try { await db.exec("commit"); } catch { try { await db.exec("rollback"); } catch { /* ignore */ } }
    await db.exec("reset role");
    for (const k of ["request.jwt.claim.sub", "request.jwt.claim.role", "request.jwt.claims", "request.headers"]) {
      await db.query("select set_config($1, '', false)", [k]);
    }
  }
}
