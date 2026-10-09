import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

/**
 * In-memory Supabase stand-in for deterministic tests of code that reads
 * learner-owned tables. STRICT: any read or write on a learner-keyed table
 * that is not constrained to a learner id (`profile_id` / `learner_id`
 * equality) throws, so a test passing proves the code under test can never
 * issue an unscoped, cross-learner query -- not merely that it happened to
 * return the right rows for the data in the fixture.
 */

export const LEARNER_KEYED_TABLES: Record<string, string> = {
  ali_student_question_history: "profile_id",
  ali_durable_mastery: "profile_id",
  ali_student_adaptive_state: "profile_id",
  ali_educational_audit: "learner_id",
  ali_operational_events: "learner_id",
  ali_family_focus_selection: "profile_id",
  user_stats: "profile_id",
  lesson_progress: "profile_id",
  ali_mock_attempt: "profile_id",
};

type Row = Record<string, unknown>;

/** PostgREST max_rows on this project (proven against production: a 0-1999 request returns exactly 1,000). */
export const SERVER_MAX_ROWS = 1000;

class Builder implements PromiseLike<{ data: unknown; error: null; count: number | null }> {
  private filters: Array<(r: Row) => boolean> = [];
  private learnerFilterValues: unknown[] = [];
  private orderCol: string | null = null;
  private ascending = true;
  private limitN: number | null = null;
  private single: "maybe" | "one" | null = null;
  private wantCount = false;
  private rangeFrom: number | null = null;
  private rangeTo: number | null = null;

  constructor(
    private readonly table: string,
    private readonly rows: Row[],
    private readonly log: string[]
  ) {}

  select(_cols?: string, opts?: { count?: string }) { this.wantCount = opts?.count === "exact"; return this; }
  /** Mirrors PostgREST: inclusive range, and the server never returns more than MAX_ROWS in one response. */
  range(from: number, to: number) { this.rangeFrom = from; this.rangeTo = to; return this; }
  eq(col: string, val: unknown) {
    if (col === LEARNER_KEYED_TABLES[this.table]) this.learnerFilterValues.push(val);
    this.filters.push((r) => r[col] === val);
    return this;
  }
  in(col: string, vals: unknown[]) { this.filters.push((r) => vals.includes(r[col])); return this; }
  neq(col: string, val: unknown) { this.filters.push((r) => r[col] !== val); return this; }
  gt(col: string, val: number | string) { this.filters.push((r) => (r[col] as number | string) > val); return this; }
  gte(col: string, val: number | string) { this.filters.push((r) => (r[col] as number | string) >= val); return this; }
  lt(col: string, val: number | string) { this.filters.push((r) => (r[col] as number | string) < val); return this; }
  lte(col: string, val: number | string) { this.filters.push((r) => (r[col] as number | string) <= val); return this; }
  is(col: string, val: unknown) { this.filters.push((r) => (r[col] ?? null) === val); return this; }
  order(col: string, opts?: { ascending?: boolean }) { this.orderCol = col; this.ascending = opts?.ascending !== false; return this; }
  limit(n: number) { this.limitN = n; return this; }
  maybeSingle() { this.single = "maybe"; return this; }
  // Learner-keyed tables must always be constrained to a learner.
  private assertScoped() {
    const key = LEARNER_KEYED_TABLES[this.table];
    if (key && this.learnerFilterValues.length === 0) {
      throw new Error(`UNSCOPED read of learner-keyed table ${this.table} (no ${key} filter)`);
    }
    this.log.push(`${this.table}:${this.learnerFilterValues.join(",")}`);
  }

  then<T1, T2>(
    onfulfilled?: ((v: { data: unknown; error: null; count: number | null }) => T1 | PromiseLike<T1>) | null,
    onrejected?: ((e: unknown) => T2 | PromiseLike<T2>) | null
  ): PromiseLike<T1 | T2> {
    try {
      this.assertScoped();
      let out = this.rows.filter((r) => this.filters.every((f) => f(r)));
      if (this.orderCol) {
        const c = this.orderCol;
        out = [...out].sort((a, b) => ((a[c] as number) > (b[c] as number) ? 1 : -1) * (this.ascending ? 1 : -1));
      }
      if (this.limitN !== null) out = out.slice(0, this.limitN);
      const total = out.length;
      if (this.rangeFrom !== null && this.rangeTo !== null) out = out.slice(this.rangeFrom, Math.min(this.rangeTo + 1, this.rangeFrom + SERVER_MAX_ROWS));
      else out = out.slice(0, SERVER_MAX_ROWS);
      const data = this.single ? out[0] ?? null : out;
      return Promise.resolve({ data, error: null as null, count: this.wantCount ? total : null }).then(onfulfilled, onrejected);
    } catch (e) {
      return Promise.reject(e).then(onfulfilled, onrejected);
    }
  }
}

export function makeStrictFake(tables: Record<string, Row[]>): {
  client: SupabaseClient<Database>;
  reads: string[];
} {
  const reads: string[] = [];
  const client = {
    from: (table: string) => new Builder(table, tables[table] ?? [], reads),
  } as unknown as SupabaseClient<Database>;
  return { client, reads };
}
