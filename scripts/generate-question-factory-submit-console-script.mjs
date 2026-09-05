#!/usr/bin/env node
/**
 * Question Factory Wave 2, Section 4 -- generates a ready-to-paste browser
 * console script that submits the exact, already-generated-and-validated
 * batch (scripts/output/question-factory-wave2-first-batch.json, 30
 * candidates from Wave 2's own bounded first-batch run) into production
 * via the admin-gated submit_question_candidate() RPC.
 *
 * WHY A CONSOLE SCRIPT, NOT A DIRECT CALL FROM HERE
 *   This environment holds no production admin/service credentials --
 *   submit_question_candidate() is admin-gated (is_current_user_admin()),
 *   so it can only be legitimately invoked from a real, authenticated
 *   admin browser session. This mirrors the exact pattern already used
 *   earlier in this engagement for mock_release_report() -- generate the
 *   call, hand it to the Founder's own authenticated session to execute,
 *   never simulate or fabricate the result.
 *
 * WHAT THE GENERATED SCRIPT DOES
 *   Reads the caller's own real session token from localStorage (the
 *   same one the live Angel app already uses -- nothing is requested or
 *   typed), then POSTs each of the 30 real candidate payloads to
 *   Supabase's REST RPC endpoint for submit_question_candidate(). It
 *   submits only -- review_status stays 'pending_review',
 *   publication_status stays 'unpublished'. It never approves or
 *   publishes anything.
 *
 * Run: node scripts/generate-question-factory-submit-console-script.mjs
 * Output: scripts/output/question-factory-wave2-submit-console-script.js
 */
import fs from "node:fs";

const data = JSON.parse(fs.readFileSync("scripts/output/question-factory-wave2-first-batch.json", "utf8"));
const payloads = data.submissionPayload.map((p) => p.args);

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("="))
    .map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; })
);
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const jwtPayload = JSON.parse(Buffer.from(anonKey.split(".")[1], "base64url").toString("utf8"));
const supabaseUrl = `https://${jwtPayload.ref}.supabase.co`;

const script = `// Angel 11+ -- Question Factory Wave 2, Section 4
// Loads the exact 30 Wave 2 candidates (generated + validated last turn,
// never approved or published) into the production ali_question_candidate
// table via the admin-gated submit_question_candidate() RPC.
//
// HOW TO RUN: sign in to the live Angel app as the ADMIN account in your
// browser, open DevTools (F12) -> Console tab, on ANY page of the app
// (e.g. /dashboard), paste this whole script, press Enter. It uses your
// own real, already-authenticated session -- no credentials are typed,
// requested, or exposed by this script itself.
//
// This submits candidates only (review_status = 'pending_review',
// publication_status = 'unpublished'). It does NOT approve or publish
// anything. Review them afterward at /admin-beta/question-factory.
(async () => {
  const SUPABASE_URL = "${supabaseUrl}";
  const ANON_KEY = "${anonKey}";

  const tokenKey = Object.keys(localStorage).find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
  if (!tokenKey) { console.error("No Supabase auth token found in localStorage -- are you signed in on this tab?"); return; }
  const session = JSON.parse(localStorage.getItem(tokenKey));
  const accessToken = session?.access_token;
  if (!accessToken) { console.error("Found a token key but no access_token inside it."); return; }

  const candidates = ${JSON.stringify(payloads, null, 2)};

  console.log("Submitting", candidates.length, "candidates...");
  const results = [];
  for (const args of candidates) {
    const res = await fetch(SUPABASE_URL + "/rest/v1/rpc/submit_question_candidate", {
      method: "POST",
      headers: {
        apikey: ANON_KEY,
        Authorization: "Bearer " + accessToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(args),
    });
    const body = await res.json().catch(() => null);
    results.push({ candidateId: args.p_candidate_id, status: res.status, ok: res.ok, body });
    console.log(res.ok ? "OK  " : "FAIL", args.p_candidate_id, res.status, body);
  }
  const succeeded = results.filter((r) => r.ok).length;
  console.log("Done: " + succeeded + "/" + candidates.length + " submitted successfully.");
  console.log("Full results:", results);
})();
`;

fs.writeFileSync("scripts/output/question-factory-wave2-submit-console-script.js", script);
console.log("written, length:", script.length, "candidates embedded:", payloads.length);
