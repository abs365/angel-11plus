/**
 * Programme Increment 008D — post-application, end-to-end live
 * verification for migration 070 (Mock Attempt Engine). Run this AFTER
 * the Founder has manually applied migration 070.
 *
 * This script creates its own throwaway anonymous Supabase Auth identity
 * (via signInAnonymously(), exactly the mechanism lib/learnerIdentity.ts
 * already uses for every real learner) and its own throwaway profile —
 * it does NOT use or affect any real learner account, and never touches
 * ali_question_bank.eligibility_status.
 *
 * It requires ONE test fixture form to exist first (ali_mock_form has an
 * admin-only write policy, migration 070's own design — a script running
 * with only the anon key cannot create one itself). Run this SQL as the
 * Founder, once, in the Supabase SQL Editor, referencing real
 * practice_eligible Mathematics questions as safe fixture stand-ins
 * (never real Mock content, never a mock_eligible row):
 *
 *   insert into public.ali_mock_form (id, specification_version, attempt_type, question_manifest, active)
 *   values (
 *     '008d-test-fixture-form',
 *     1,
 *     'diagnostic_mock',
 *     '[{"question_id":"mr01-wholenum-01","section":"maths"},{"question_id":"mr01-wholenum-02","section":"maths"}]'::jsonb,
 *     true
 *   )
 *   on conflict (id) do nothing;
 *
 * Usage: node scripts/verify-mock-attempt-engine.mjs
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  // NEXT_PUBLIC_SUPABASE_URL in .env.local is not a usable URL in this
  // environment — every other script in this project's history derives
  // the real project URL from the anon key's own JWT payload (`ref`
  // claim) instead, and this script follows the same established pattern.
  const envRaw = readFileSync(".env.local", "utf8");
  const key = envRaw.match(/^NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)$/m)?.[1]?.trim();
  if (!key) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local");
  const ref = JSON.parse(Buffer.from(key.split(".")[1], "base64").toString("utf8")).ref;
  return { url: `https://${ref}.supabase.co`, key };
}

const TEST_FORM_ID = "008d-test-fixture-form";
const KNOWN_MATHS_QUESTION_IDS = ["mr01-wholenum-01", "mr01-wholenum-02"];

async function main() {
  const { url, key } = loadEnv();
  const supabase = createClient(url, key);
  let anyFailed = false;
  function report(pass, label) {
    console.log(`${pass ? "PASS" : "FAIL"}: ${label}`);
    if (!pass) anyFailed = true;
  }

  const { data: signIn, error: signInError } = await supabase.auth.signInAnonymously();
  report(!signInError && !!signIn.user, "anonymous sign-in succeeds (real auth.uid())");
  if (signInError) { console.error(signInError.message); process.exit(1); }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .insert({ auth_user_id: signIn.user.id, device_id: crypto.randomUUID(), name: "008D verification (throwaway)" })
    .select("id")
    .single();
  report(!profileError && !!profile, "throwaway profile created");
  if (profileError) { console.error(profileError.message); process.exit(1); }

  // 1. Anon (a DIFFERENT, non-signed-in client) still cannot enumerate the sealed pool directly.
  const anonClient = createClient(url, key);
  const { data: directRead } = await anonClient.from("ali_question_bank").select("id").eq("eligibility_status", "mock_eligible");
  report(Array.isArray(directRead) && directRead.length === 0, "a separate anon client still cannot read mock_eligible rows directly (unchanged from migration 069)");

  // 2. Create an attempt.
  const { data: attemptId, error: createError } = await supabase.rpc("mock_create_attempt", {
    p_form_id: TEST_FORM_ID,
    p_attempt_type: "diagnostic_mock",
  });
  report(!createError && !!attemptId, `mock_create_attempt succeeds (attempt ${attemptId ?? "?"})`);
  if (createError) {
    console.error(createError.message);
    console.error("\nHas the test fixture form been inserted? See this script's own header comment for the exact SQL.");
    process.exit(1);
  }

  // 3. A DIFFERENT learner cannot start THIS attempt.
  const { error: otherSignInError, data: otherSignIn } = await anonClient.auth.signInAnonymously();
  if (!otherSignInError) {
    const { error: otherStartError } = await anonClient.rpc("mock_start_attempt", { p_attempt_id: attemptId });
    report(!!otherStartError, "a different learner cannot start another learner's attempt");
  }

  // 4. The real owner starts the attempt.
  const { data: started, error: startError } = await supabase.rpc("mock_start_attempt", { p_attempt_id: attemptId, p_duration_minutes: 60 });
  const startedRow = Array.isArray(started) ? started[0] : started;
  report(!startError && startedRow?.status === "in_progress", "mock_start_attempt transitions to in_progress with a real expires_at");

  // 5. Fetch a question -- must be redacted.
  const { data: question, error: questionError } = await supabase.rpc("mock_get_question", {
    p_attempt_id: attemptId,
    p_question_id: KNOWN_MATHS_QUESTION_IDS[0],
  });
  const protectedFields = ["answer", "workingSteps", "addressesMisconception", "provenance"];
  const leaked = question ? protectedFields.filter((f) => f in question) : [];
  report(!questionError && !!question && leaked.length === 0, "mock_get_question returns a payload with zero protected fields");

  // 6. A question NOT in the manifest is rejected.
  const { error: outsideError } = await supabase.rpc("mock_get_question", { p_attempt_id: attemptId, p_question_id: "mr01-wholenum-05" });
  report(!!outsideError, "a question outside the attempt's assigned manifest is rejected");

  // 7. Submit an answer -- must not reveal correctness.
  const { data: submitAnswerResult, error: answerError } = await supabase.rpc("mock_submit_answer", {
    p_attempt_id: attemptId,
    p_question_id: KNOWN_MATHS_QUESTION_IDS[0],
    p_response: { value: "282" },
  });
  report(!answerError && submitAnswerResult === null, "mock_submit_answer succeeds and returns no correctness signal");

  // 8. Submit the attempt -- locks it.
  const { data: submitted, error: submitError } = await supabase.rpc("mock_submit_attempt", { p_attempt_id: attemptId });
  const submittedRow = Array.isArray(submitted) ? submitted[0] : submitted;
  report(!submitError && submittedRow?.status === "submitted", "mock_submit_attempt locks the attempt");

  // 9. Post-submission, further question access is refused.
  const { error: postSubmitError } = await supabase.rpc("mock_get_question", { p_attempt_id: attemptId, p_question_id: KNOWN_MATHS_QUESTION_IDS[0] });
  report(!!postSubmitError, "a submitted attempt refuses further question access");

  // 10. Practice regression -- unaffected.
  const { data: practiceRow, error: practiceError } = await anonClient
    .from("ali_question_bank")
    .select("id,prompt")
    .eq("eligibility_status", "practice_eligible")
    .eq("subject", "maths")
    .limit(1);
  report(!practiceError && practiceRow?.[0]?.prompt?.answer !== undefined, "Practice content remains fully readable (unaffected by this migration)");

  console.log("");
  console.log(anyFailed ? "OVERALL: FAIL -- investigate before treating the attempt engine as live." : "OVERALL: PASS");
  process.exit(anyFailed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
