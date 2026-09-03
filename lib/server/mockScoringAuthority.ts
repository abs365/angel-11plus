import "server-only";
import postgres from "postgres";
import { computeReadingScoringOutcomes, type ReadingScoringWorkItem } from "@/lib/mockAttempt/readingScoringOrchestration";

/**
 * Programme Completion Increment 016 — Authoritative Reading Comprehension
 * Scoring, the ONE file in this codebase permitted to hold the dedicated
 * `mock_scoring_writer` Postgres credential (migration 219's own header
 * has the full threat model and architecture rationale). The `server-only`
 * import above makes any accidental import from a "use client" file a
 * Next.js BUILD ERROR, not merely a lint warning — see
 * tests/lib/server/mockScoringAuthorityIncrement016.test.ts for the
 * corresponding regression test (a real production build, not a static
 * assertion, is the actual guarantee here; the test asserts the guard
 * import is present, matching this codebase's own "prove the contract in
 * source" convention for things a plain unit test cannot fully verify).
 *
 * This module exports exactly ONE operation — scoreReadingAttempt() — and
 * no generic Postgres client of any kind. The connection uses
 * MOCK_SCORING_DATABASE_URL (a Vercel server-only env var, the
 * mock_scoring_writer role's own dedicated credential — never
 * NEXT_PUBLIC_-prefixed, never logged, never returned to any caller).
 *
 * Both database calls this module makes are to the two narrow SECURITY
 * DEFINER functions migration 219 creates
 * (mock_claim_reading_scoring_work/mock_persist_reading_scoring) — this
 * role has no other grant anywhere in the database, so this module
 * structurally cannot do anything beyond what those two functions permit,
 * regardless of what this file's own code does.
 */

let _sql: ReturnType<typeof postgres> | null = null;

function getScoringConnection(): ReturnType<typeof postgres> | null {
  const connectionString = process.env.MOCK_SCORING_DATABASE_URL;
  if (!connectionString) return null;
  if (!_sql) {
    // Transaction-mode pooler (Supavisor, port 6543) — no prepared
    // statements, no session-level state across calls; each of this
    // module's two calls is a single, independent statement, which is
    // exactly what transaction mode supports safely.
    _sql = postgres(connectionString, { ssl: "require", prepare: false });
  }
  return _sql;
}

export type ScoreReadingAttemptResult =
  | { status: "scored" | "already_scored"; scoringState?: "scored" | "scoring" }
  | { status: "ineligible"; reason: string }
  | { status: "unavailable" };

/**
 * The one operation this module exposes. Deliberately takes only an
 * attempt id — never a computed result, never a marks/correctness claim —
 * so nothing about "what is correct" ever needs to travel as an argument
 * from outside this file. Safe to call repeatedly for the same attempt
 * (mock_persist_reading_scoring()'s own marking_version-gated idempotency,
 * migration 219) and safe to call for any submitted Reading attempt this
 * process is asked about — the database's own independent invariants,
 * not caller trust, are what make every call safe.
 */
export async function scoreReadingAttempt(attemptId: string): Promise<ScoreReadingAttemptResult> {
  const sql = getScoringConnection();
  if (!sql) return { status: "unavailable" };

  const [claimRow] = await sql<{ mock_claim_reading_scoring_work: { eligible: boolean; reason?: string; questions?: ReadingScoringWorkItem[] } }[]>`
    select mock_claim_reading_scoring_work(${attemptId}::uuid)
  `;
  const claim = claimRow?.mock_claim_reading_scoring_work;
  if (!claim || !claim.eligible) {
    return { status: "ineligible", reason: claim?.reason ?? "unknown" };
  }

  const outcomes = computeReadingScoringOutcomes(claim.questions ?? []);

  const [persistRow] = await sql<{ mock_persist_reading_scoring: { status: "scored" | "already_scored"; scoringState?: "scored" | "scoring" } }[]>`
    select mock_persist_reading_scoring(${attemptId}::uuid, ${JSON.stringify(outcomes)}::jsonb)
  `;
  const persisted = persistRow?.mock_persist_reading_scoring;
  return persisted ?? { status: "unavailable" };
}
