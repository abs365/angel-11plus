/**
 * Programme Increment 008C — post-application verification for migration
 * 069 (Mock Sealed Content RLS). Run this AFTER the Founder has manually
 * applied migration 069 in the Supabase SQL Editor.
 *
 * This script performs only bounded, non-destructive SELECT queries using
 * the public anon key (exactly what an ordinary browser/client could do)
 * — never a write, never a destructive query.
 *
 * Usage: node scripts/verify-mock-firewall.mjs
 */

import { readFileSync } from "node:fs";

function loadAnonKey() {
  const envRaw = readFileSync(".env.local", "utf8");
  for (const line of envRaw.split("\n")) {
    const m = line.match(/^NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)$/);
    if (m) return m[1].trim();
  }
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local");
}

const ANON_KEY = loadAnonKey();
const SUPABASE_URL = "https://" + JSON.parse(Buffer.from(ANON_KEY.split(".")[1], "base64").toString("utf8")).ref + ".supabase.co";
const HEADERS = { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` };

async function main() {
  let anyFailed = false;

  // 1. Anon query for mock_eligible rows must return zero rows (whether
  // or not any exist) -- proves the row-level policy is active, not just
  // "nothing exists yet."
  const r1 = await fetch(`${SUPABASE_URL}/rest/v1/ali_question_bank?select=id,prompt&eligibility_status=eq.mock_eligible`, { headers: HEADERS });
  const rows1 = await r1.json();
  const pass1 = Array.isArray(rows1) && rows1.length === 0;
  console.log(`${pass1 ? "PASS" : "FAIL"}: anon query for mock_eligible rows returns 0 rows (status ${r1.status}, ${Array.isArray(rows1) ? rows1.length : "error"} rows)`);
  if (!pass1) anyFailed = true;

  // 2. Practice content (practice_eligible) must remain fully readable --
  // proves this migration did not regress ordinary Practice.
  const r2 = await fetch(`${SUPABASE_URL}/rest/v1/ali_question_bank?select=id,prompt&eligibility_status=eq.practice_eligible&limit=1`, { headers: HEADERS });
  const rows2 = await r2.json();
  const pass2 = Array.isArray(rows2) && rows2.length === 1 && rows2[0].prompt && "question" in rows2[0].prompt;
  console.log(`${pass2 ? "PASS" : "FAIL"}: anon can still read a practice_eligible row's full prompt (status ${r2.status})`);
  if (!pass2) anyFailed = true;

  // 3. Provisional content must remain readable (unchanged pre-existing
  // behaviour, out of this migration's scope to alter).
  const r3 = await fetch(`${SUPABASE_URL}/rest/v1/ali_question_bank?select=id&eligibility_status=eq.provisional&limit=1`, { headers: HEADERS });
  const rows3 = await r3.json();
  const pass3 = r3.status === 200;
  console.log(`${pass3 ? "PASS" : "FAIL"}: anon can still query provisional rows without an RLS error (status ${r3.status}, ${Array.isArray(rows3) ? rows3.length : "?"} rows)`);
  if (!pass3) anyFailed = true;

  console.log("");
  console.log(anyFailed ? "OVERALL: FAIL -- investigate before treating the Mock security fix as live." : "OVERALL: PASS");
  process.exit(anyFailed ? 1 : 0);
}

main();
