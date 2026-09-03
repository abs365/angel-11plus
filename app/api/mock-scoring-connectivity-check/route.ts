import { NextRequest, NextResponse } from "next/server";
import postgres from "postgres";

/**
 * TEMPORARY, one-time diagnostic route. Proves the dedicated
 * mock_scoring_writer database boundary (migration 219) is genuinely live
 * in production, without ever touching a real Mock attempt, scoring
 * anything, or revealing the credential itself. Every check here is a
 * read-only metadata query (has_function_privilege, current_user) or a
 * deliberately-expected-to-fail direct table read -- no INSERT/UPDATE/
 * DELETE anywhere in this file, and no learner attempt id is ever
 * supplied to any function.
 *
 * Gated by a one-time token known only to the person who deployed this
 * file, so an opportunistic scan of a public URL cannot trigger it during
 * its short deployment window. This route is deleted in the same
 * increment immediately after its one real use.
 */
const DIAGNOSTIC_TOKEN = "3943422d-3788-471a-b445-ec02165b92d3";

export async function GET(request: NextRequest) {
  if (request.headers.get("x-diagnostic-token") !== DIAGNOSTIC_TOKEN) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const connectionString = process.env.MOCK_SCORING_DATABASE_URL;
  if (!connectionString) {
    return NextResponse.json({ connection: "unavailable", reason: "MOCK_SCORING_DATABASE_URL not set" }, { status: 200 });
  }

  const sql = postgres(connectionString, { ssl: "require", prepare: false });

  const result: Record<string, unknown> = {};

  try {
    const [{ current_user: currentUser }] = await sql<{ current_user: string }[]>`select current_user`;
    result.connection = "ok";
    result.currentUser = currentUser;
  } catch (err) {
    result.connection = "failed";
    result.connectionError = err instanceof Error ? err.message : String(err);
    await sql.end({ timeout: 5 }).catch(() => {});
    return NextResponse.json(result, { status: 200 });
  }

  try {
    await sql`select 1 from ali_mock_attempt limit 1`;
    result.directTableAccess = "unexpectedly_allowed";
  } catch (err) {
    result.directTableAccess = "denied";
    result.directTableAccessError = err instanceof Error ? err.message : String(err);
  }

  for (const role of ["public", "anon", "authenticated", "mock_scoring_writer"] as const) {
    try {
      const [claimRow] = await sql<{ has_function_privilege: boolean }[]>`
        select has_function_privilege(${role}, 'public.mock_claim_reading_scoring_work(uuid)', 'EXECUTE')
      `;
      const [persistRow] = await sql<{ has_function_privilege: boolean }[]>`
        select has_function_privilege(${role}, 'public.mock_persist_reading_scoring(uuid, jsonb)', 'EXECUTE')
      `;
      result[`claimExecute_${role}`] = claimRow?.has_function_privilege ?? null;
      result[`persistExecute_${role}`] = persistRow?.has_function_privilege ?? null;
    } catch (err) {
      result[`privilegeCheckError_${role}`] = err instanceof Error ? err.message : String(err);
    }
  }

  await sql.end({ timeout: 5 }).catch(() => {});
  return NextResponse.json(result, { status: 200 });
}
