/**
 * Educational Intelligence Foundation — Phase 2A/2B focused tests.
 *
 * Same convention as this project's prior ALI validation passes
 * (ALI_VALIDATION_PROTOCOL.md): a pure-function / in-memory-fixture
 * simulation via `npx tsx`, standing in for Supabase, since this sandbox
 * has no outbound network access to the real project database. No test
 * framework dependency added — a plain script with assert(), matching how
 * this codebase has always verified lib/ali/* logic before real deploy.
 *
 * Run: npx tsx scripts/test-educational-intelligence-foundation.ts
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import {
  computeWhatChanged,
  recordReadinessSnapshot,
  fetchReadinessHistory,
  fetchAdmissionsIntelligenceContext,
} from "@/lib/learningEngine/learningHistory";
import { buildEvidenceUpdateColumns } from "@/lib/ali/history";
import type { ComponentReadiness } from "@/lib/learningEngine/types";
import {
  CSSE_ADMISSIONS_CONTEXT_FACT,
  CSSE_ADMISSIONS_CONTEXT_RELEVANCE,
  CSSE_ADMISSIONS_CONTEXT_DISCLAIMER,
} from "@/lib/learningEngine/admissionsContext";
import { resolveBankEvidenceContext } from "@/lib/learningEngine/legacyPracticeEvidence";

type AuditRow = Database["public"]["Tables"]["ali_educational_audit"]["Row"];

let failures = 0;
function assert(condition: boolean, message: string): void {
  if (!condition) {
    failures++;
    console.error(`FAIL: ${message}`);
  } else {
    console.log(`pass: ${message}`);
  }
}

// ─── Minimal in-memory fake for ali_educational_audit ──────────────────────
// Purpose-built for exactly the call shapes lib/ali/persistence/auditStore.ts
// uses (verified by reading that file in full) — not a general Supabase mock.

interface Filter {
  col: string;
  op: "eq" | "is" | "gte";
  val: unknown;
}

let fakeIdCounter = 0;

function makeAuditQueryBuilder(rows: AuditRow[]) {
  let mode: "select" | "insert" | "update" = "select";
  let insertPayload: Partial<AuditRow> | null = null;
  let updatePayload: Partial<AuditRow> | null = null;
  const filters: Filter[] = [];
  let orderCol: string | null = null;
  let orderAsc = true;
  let limitN: number | null = null;

  function applyFilters(list: AuditRow[]): AuditRow[] {
    return list.filter((r) =>
      filters.every((f) => {
        const rv = (r as unknown as Record<string, unknown>)[f.col];
        if (f.op === "eq" || f.op === "is") return rv === f.val;
        if (f.op === "gte") return (rv as string) >= (f.val as string);
        return true;
      })
    );
  }

  function execSelect(): AuditRow[] {
    let result = applyFilters(rows);
    if (orderCol) {
      const col = orderCol;
      result = [...result].sort((a, b) => {
        const av = (a as unknown as Record<string, unknown>)[col] as string;
        const bv = (b as unknown as Record<string, unknown>)[col] as string;
        if (av === bv) return 0;
        const cmp = av > bv ? 1 : -1;
        return orderAsc ? cmp : -cmp;
      });
    }
    if (limitN !== null) result = result.slice(0, limitN);
    return result;
  }

  const builder = {
    select() {
      if (mode !== "insert") mode = "select";
      return builder;
    },
    insert(payload: Partial<AuditRow>) {
      mode = "insert";
      insertPayload = payload;
      return builder;
    },
    update(payload: Partial<AuditRow>) {
      mode = "update";
      updatePayload = payload;
      return builder;
    },
    eq(col: string, val: unknown) {
      filters.push({ col, op: "eq", val });
      return builder;
    },
    is(col: string, val: unknown) {
      filters.push({ col, op: "is", val });
      return builder;
    },
    gte(col: string, val: unknown) {
      filters.push({ col, op: "gte", val });
      return builder;
    },
    order(col: string, opts?: { ascending?: boolean }) {
      orderCol = col;
      orderAsc = opts?.ascending ?? true;
      return builder;
    },
    limit(n: number) {
      limitN = n;
      return builder;
    },
    async maybeSingle() {
      if (mode === "insert") {
        const row = {
          superseded_by: null,
          supersede_reason: null,
          conclusion_value: null,
          ...insertPayload,
          id: insertPayload?.id ?? `fake-${++fakeIdCounter}`,
        } as AuditRow;
        rows.push(row);
        return { data: row, error: null };
      }
      const result = execSelect();
      return { data: result[0] ?? null, error: null };
    },
    async single() {
      if (mode === "insert") {
        const row = {
          superseded_by: null,
          supersede_reason: null,
          conclusion_value: null,
          ...insertPayload,
          id: insertPayload?.id ?? `fake-${++fakeIdCounter}`,
        } as AuditRow;
        rows.push(row);
        return { data: row, error: null };
      }
      const result = execSelect();
      return { data: result[0], error: result[0] ? null : { message: "not found" } };
    },
    then(resolve: (v: { data: unknown; error: unknown }) => void, reject: (e: unknown) => void) {
      (async () => {
        try {
          if (mode === "update") {
            const targets = applyFilters(rows);
            for (const t of targets) Object.assign(t, updatePayload);
            resolve({ data: null, error: null });
            return;
          }
          resolve({ data: execSelect(), error: null });
        } catch (e) {
          reject(e);
        }
      })();
    },
  };
  return builder;
}

function makeFakeSupabase(rows: AuditRow[]): SupabaseClient<Database> {
  return {
    from(table: string) {
      if (table !== "ali_educational_audit") throw new Error(`Fake supabase: unsupported table "${table}" in this test`);
      return makeAuditQueryBuilder(rows);
    },
  } as unknown as SupabaseClient<Database>;
}

async function run() {
  // ─── computeWhatChanged ───────────────────────────────────────────────
  {
    const first = computeWhatChanged(null, "Not Yet Evidenced");
    assert(first.changed === false, "computeWhatChanged: no prior record => changed=false");
    assert(/first time/i.test(first.message), "computeWhatChanged: no prior record => 'first time' message");

    const unchanged = computeWhatChanged("Well Evidenced", "Well Evidenced");
    assert(unchanged.changed === false, "computeWhatChanged: same band => changed=false");
    assert(/no change/i.test(unchanged.message), "computeWhatChanged: same band => 'no change' message");

    const improved = computeWhatChanged("Not Yet Evidenced", "Partially Evidenced");
    assert(improved.changed === true, "computeWhatChanged: band improved => changed=true");
    assert(
      improved.message.includes("Not Yet Evidenced") && improved.message.includes("Partially Evidenced"),
      "computeWhatChanged: improved message names both bands"
    );

    const regressed = computeWhatChanged("Well Evidenced", "Partially Evidenced");
    assert(regressed.changed === true, "computeWhatChanged: band regressed => changed=true");
    const unsafeWords = /worse|regressed|declin|fail|drop/i;
    assert(!unsafeWords.test(regressed.message), "computeWhatChanged: regression phrased neutrally (Educational Safety Principle)");
  }

  // ─── buildEvidenceUpdateColumns ───────────────────────────────────────
  {
    assert(Object.keys(buildEvidenceUpdateColumns(undefined)).length === 0, "buildEvidenceUpdateColumns: undefined facts => no columns");
    assert(Object.keys(buildEvidenceUpdateColumns({})).length === 0, "buildEvidenceUpdateColumns: empty facts => no columns");

    const partial = buildEvidenceUpdateColumns({ timeTakenSeconds: 42 });
    assert(
      Object.keys(partial).length === 1 && partial.last_attempt_time_seconds === 42,
      "buildEvidenceUpdateColumns: only the supplied fact is included"
    );

    // Falsy-but-real values (0, false) must NOT be treated as omitted.
    const falsy = buildEvidenceUpdateColumns({ timeTakenSeconds: 0, skipped: false });
    assert(
      falsy.last_attempt_time_seconds === 0 && falsy.last_attempt_skipped === false,
      "buildEvidenceUpdateColumns: falsy-but-supplied facts (0, false) are preserved, not dropped"
    );

    const full = buildEvidenceUpdateColumns({
      timeTakenSeconds: 12,
      skipped: false,
      answerChanged: true,
      firstAnswer: "A",
      finalAnswer: "B",
      confidenceRating: 4,
      workingShown: true,
    });
    assert(Object.keys(full).length === 7, "buildEvidenceUpdateColumns: all 7 facts map to exactly 7 columns");
  }

  // ─── recordReadinessSnapshot + fetchReadinessHistory ──────────────────
  {
    const rows: AuditRow[] = [];
    const supabase = makeFakeSupabase(rows);
    const profileId = "profile-1";

    const readinessV1: ComponentReadiness[] = [
      { component: "Mathematics", band: "Not Yet Evidenced", competencyIds: [], strengths: [], developmentAreas: [], notYetEvidenced: [] },
    ];
    await recordReadinessSnapshot(supabase, profileId, readinessV1, new Date("2026-01-01T00:00:00Z"));
    assert(rows.length === 1, "recordReadinessSnapshot: first snapshot inserts exactly one record");
    assert(rows[0].conclusion_value === "Not Yet Evidenced", "recordReadinessSnapshot: conclusion_value matches the real band computed");
    assert(rows[0].conclusion_type === "readiness-dimension", "recordReadinessSnapshot: conclusion_type is readiness-dimension");

    // Same band again — must not create a duplicate record.
    await recordReadinessSnapshot(supabase, profileId, readinessV1, new Date("2026-01-08T00:00:00Z"));
    assert(rows.length === 1, "recordReadinessSnapshot: unchanged band does not insert a duplicate");

    // Band genuinely changes — must supersede the old record and insert a new one.
    const readinessV2: ComponentReadiness[] = [
      { component: "Mathematics", band: "Partially Evidenced", competencyIds: [], strengths: [], developmentAreas: [], notYetEvidenced: [] },
    ];
    await recordReadinessSnapshot(supabase, profileId, readinessV2, new Date("2026-02-01T00:00:00Z"));
    assert(rows.length === 2, "recordReadinessSnapshot: real band change inserts a new record");
    assert(rows[0].superseded_by === rows[1].id, "recordReadinessSnapshot: prior record is superseded by the new one");
    assert(rows[1].conclusion_value === "Partially Evidenced", "recordReadinessSnapshot: new record's conclusion_value is the new band");

    // Seed a non-readiness conclusion type to confirm fetchReadinessHistory excludes it.
    rows.push({
      id: "mastery-row-1",
      conclusion_type: "mastery",
      learner_id: profileId,
      competency_or_dimension: "MR-04",
      confidence_tier_at_time: "high",
      concluded_at: "2026-01-15T00:00:00Z",
      superseded_by: null,
      supersede_reason: null,
      conclusion_value: null,
    });

    const history = await fetchReadinessHistory(supabase, profileId, "Mathematics");
    assert(history.length === 2, "fetchReadinessHistory: returns only the readiness-dimension records for the requested component");
    assert(
      history.every((h) => h.conclusionType === "readiness-dimension"),
      "fetchReadinessHistory: excludes non-readiness conclusion types (e.g. mastery)"
    );
    assert(
      new Date(history[0].concludedAt).getTime() < new Date(history[1].concludedAt).getTime(),
      "fetchReadinessHistory: oldest-to-newest order"
    );
  }

  // ─── fetchAdmissionsIntelligenceContext ───────────────────────────────
  {
    const rows: AuditRow[] = [];
    const supabase = makeFakeSupabase(rows);
    const readiness: ComponentReadiness[] = [
      { component: "Mathematics", band: "Well Evidenced", competencyIds: ["MR-01"], strengths: ["MR-01"], developmentAreas: [], notYetEvidenced: [] },
    ];
    const context = await fetchAdmissionsIntelligenceContext(supabase, "profile-1", readiness);

    assert(context.componentReadiness === readiness, "fetchAdmissionsIntelligenceContext: readiness evidence passed through unmodified");
    assert(context.admissionsFact.fact === CSSE_ADMISSIONS_CONTEXT_FACT, "fetchAdmissionsIntelligenceContext: admissions fact matches the real sourced constant");
    assert(context.admissionsFact.relevance === CSSE_ADMISSIONS_CONTEXT_RELEVANCE, "fetchAdmissionsIntelligenceContext: relevance kept as its own separate field");
    assert(context.admissionsFact.disclaimer === CSSE_ADMISSIONS_CONTEXT_DISCLAIMER, "fetchAdmissionsIntelligenceContext: disclaimer kept as its own separate field");
    assert(
      !JSON.stringify(context.componentReadiness).includes("303") && context.admissionsFact.fact.includes("303"),
      "fetchAdmissionsIntelligenceContext: the 303 fact stays inside admissionsFact, never blended into readiness evidence"
    );
  }

  // ─── resolveBankEvidenceContext (Step 2, legacy practice evidence) ────
  {
    const untagged = resolveBankEvidenceContext(null);
    assert(untagged.found === false, "resolveBankEvidenceContext: null bank row => not found (untagged question)");

    const undefinedRow = resolveBankEvidenceContext(undefined);
    assert(undefinedRow.found === false, "resolveBankEvidenceContext: undefined bank row => not found");

    // A real, mapped Question Type (e.g. from migration 013's tagged content).
    const mapped = resolveBankEvidenceContext({ skill: "QT-MR-01", mastery_threshold: 2 });
    assert(mapped.found === true, "resolveBankEvidenceContext: real bank row => found");
    if (mapped.found) {
      assert(mapped.masteryThreshold === 2, "resolveBankEvidenceContext: masteryThreshold comes from the real bank row, not a default");
      assert(mapped.competencyId !== undefined, "resolveBankEvidenceContext: a real Question Type resolves to a real competency");
    }

    // A skill code with no Assessment Brain mapping (e.g. non-CSSE content)
    // must never invent a competency — undefined is the honest answer.
    const unmapped = resolveBankEvidenceContext({ skill: "vr.analogies", mastery_threshold: 2 });
    assert(unmapped.found === true, "resolveBankEvidenceContext: unmapped skill is still a real bank row => found");
    if (unmapped.found) {
      assert(unmapped.competencyId === undefined, "resolveBankEvidenceContext: unmapped skill => competencyId undefined, never invented");
    }
  }

  console.log(`\n${failures === 0 ? "ALL TESTS PASSED" : `${failures} TEST(S) FAILED`}`);
  process.exit(failures === 0 ? 0 : 1);
}

run();
