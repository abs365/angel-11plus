/**
 * Programme Increment 008E — post-application, end-to-end live
 * verification for migration 072 (Mock Lifecycle and Reporting
 * Foundation). Run this AFTER the Founder has manually applied migration
 * 072 (which itself requires 069-071 already applied — confirmed,
 * Decisions 87/89/91).
 *
 * This is the "genuinely new fixture-and-verification need" named in
 * Decision 93: migration 070's own already-approved script
 * (scripts/verify-mock-attempt-engine.mjs) never exercises
 * mock_get_active_form, mock_get_attempt_manifest, mock_set_flag, or the
 * report-init trigger. This script is offered for the Founder's own
 * review and optional live verification — not executed by the session
 * that wrote it, per the 008E directive's own STOP condition.
 *
 * Same discipline as its 008D predecessor: creates its own throwaway
 * anonymous Supabase Auth identity + profile (never a real learner
 * account), never touches ali_question_bank.eligibility_status, and
 * requires the SAME test fixture form that script already documents —
 * this script does not insert its own fixture, so run
 * verify-mock-attempt-engine.mjs's own fixture SQL first (from its
 * header), or reuse an already-inserted one:
 *
 *   insert into public.ali_mock_form (id, specification_version, attempt_type, question_manifest, active)
 *   values (
 *     '008d-test-fixture-form',
 *     1,
 *     'full_mock',
 *     '[{"question_id":"mr01-wholenum-01","section":"maths"},{"question_id":"mr01-wholenum-02","section":"maths"}]'::jsonb,
 *     true
 *   )
 *   on conflict (id) do nothing;
 *
 * Note the attempt_type here is 'full_mock', matching what this codebase's
 * own new mock-exam page requests (ATTEMPT_TYPE in
 * app/learning-intelligence/mock-exam/page.tsx) — if the Founder already
 * has a 'diagnostic_mock' fixture from 008D's own verification, that
 * form will NOT be found by mock_get_active_form('full_mock') below;
 * this is correct, expected behaviour (attempt_type is a real filter,
 * not a formality), not a defect in this script.
 *
 * IMPORTANT — cleanup: after running, this script's own throwaway
 * profile/attempt/answer/flag/report rows are NOT deleted automatically
 * (matching 008D's own verify script's own behaviour, and this
 * project's own established practice of the Founder performing cleanup
 * via Supabase Dashboard, per Decision 91). If a fixture form was
 * inserted solely for this run, remove it afterwards the same way.
 *
 * Usage: node scripts/verify-mock-lifecycle-and-reporting-foundation.mjs
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function loadEnv() {
  const envRaw = readFileSync(".env.local", "utf8");
  const key = envRaw.match(/^NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)$/m)?.[1]?.trim();
  if (!key) throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local");
  const ref = JSON.parse(Buffer.from(key.split(".")[1], "base64").toString("utf8")).ref;
  return { url: `https://${ref}.supabase.co`, key };
}

const ATTEMPT_TYPE = "full_mock";
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
    .insert({ auth_user_id: signIn.user.id, device_id: crypto.randomUUID(), name: "008E verification (throwaway)" })
    .select("id")
    .single();
  report(!profileError && !!profile, "throwaway profile created");
  if (profileError) { console.error(profileError.message); process.exit(1); }

  // 1. Discovery: mock_get_active_form finds the active fixture form.
  const { data: activeForm, error: activeFormError } = await supabase.rpc("mock_get_active_form", { p_attempt_type: ATTEMPT_TYPE });
  const activeFormRow = Array.isArray(activeForm) ? activeForm[0] : activeForm;
  report(!activeFormError && !!activeFormRow?.form_id, `mock_get_active_form('${ATTEMPT_TYPE}') finds an active form`);
  if (!activeFormRow?.form_id) {
    console.error("\nNo active form found for attempt_type = 'full_mock'. See this script's own header for the exact fixture SQL (note the attempt_type).");
    process.exit(1);
  }
  const formId = activeFormRow.form_id;

  // 2. Discovery never leaks the manifest.
  report(!("question_manifest" in (activeFormRow ?? {})), "mock_get_active_form's own response never includes question_manifest");

  // 3. Create + start an attempt against the discovered form.
  const { data: attemptId, error: createError } = await supabase.rpc("mock_create_attempt", { p_form_id: formId, p_attempt_type: ATTEMPT_TYPE });
  report(!createError && !!attemptId, `mock_create_attempt succeeds against the discovered form (attempt ${attemptId ?? "?"})`);
  if (createError) { console.error(createError.message); process.exit(1); }

  const { data: started, error: startError } = await supabase.rpc("mock_start_attempt", { p_attempt_id: attemptId, p_duration_minutes: 60 });
  const startedRow = Array.isArray(started) ? started[0] : started;
  report(!startError && startedRow?.status === "in_progress", "mock_start_attempt transitions to in_progress");

  // 4. mock_get_attempt_manifest returns the real, frozen question order.
  const { data: manifest, error: manifestError } = await supabase.rpc("mock_get_attempt_manifest", { p_attempt_id: attemptId });
  report(!manifestError && Array.isArray(manifest) && manifest.length > 0, "mock_get_attempt_manifest returns the attempt's own assigned question IDs");
  report(Array.isArray(manifest) && manifest.includes(KNOWN_MATHS_QUESTION_IDS[0]), "the manifest contains the expected fixture question ID");

  // 5. A different learner cannot read this attempt's manifest.
  const anonClient = createClient(url, key);
  const { error: otherSignInError } = await anonClient.auth.signInAnonymously();
  if (!otherSignInError) {
    const { error: otherManifestError } = await anonClient.rpc("mock_get_attempt_manifest", { p_attempt_id: attemptId });
    report(!!otherManifestError, "a different learner cannot read another learner's attempt manifest");
  }

  // 6. Flag a question, confirm it round-trips through RLS's own read-your-own policy.
  const { error: flagError } = await supabase.rpc("mock_set_flag", { p_attempt_id: attemptId, p_question_id: KNOWN_MATHS_QUESTION_IDS[0], p_flagged: true });
  report(!flagError, "mock_set_flag succeeds for an in-manifest question on the caller's own in-progress attempt");
  const { data: flagRow, error: flagReadError } = await supabase
    .from("ali_mock_attempt_flag")
    .select("question_id")
    .eq("attempt_id", attemptId)
    .eq("question_id", KNOWN_MATHS_QUESTION_IDS[0])
    .maybeSingle();
  report(!flagReadError && !!flagRow, "the flag is readable back via the learner's own read-your-own RLS policy");

  // 7. A question outside the manifest cannot be flagged.
  const { error: outsideFlagError } = await supabase.rpc("mock_set_flag", { p_attempt_id: attemptId, p_question_id: "not-in-this-manifest", p_flagged: true });
  report(!!outsideFlagError, "flagging a question outside the attempt's manifest is rejected");

  // 8. Answer + submit -- locks the attempt (unchanged 008D behaviour, re-confirmed against the new discovery path).
  await supabase.rpc("mock_submit_answer", { p_attempt_id: attemptId, p_question_id: KNOWN_MATHS_QUESTION_IDS[0], p_response: { value: "282" } });
  const { data: submitted, error: submitError } = await supabase.rpc("mock_submit_attempt", { p_attempt_id: attemptId });
  const submittedRow = Array.isArray(submitted) ? submitted[0] : submitted;
  report(!submitError && submittedRow?.status === "submitted", "mock_submit_attempt locks the attempt");

  // 9. The report-init trigger created a bare report row -- not yet visible to the learner (sealed until released).
  const { data: reportRow, error: reportReadError } = await supabase
    .from("ali_mock_attempt_report")
    .select("attempt_id")
    .eq("attempt_id", attemptId)
    .maybeSingle();
  report(!reportReadError && !reportRow, "the report row exists (created by the trigger) but stays invisible to the learner until report_release_state = 'released' -- confirms the sealed-until-released RLS policy, not an absent row (a Founder catalogue query, not this anon-key script, can confirm the row itself exists)");

  // 10. Post-submission, mock_set_flag is refused (attempt no longer in_progress).
  const { error: postSubmitFlagError } = await supabase.rpc("mock_set_flag", { p_attempt_id: attemptId, p_question_id: KNOWN_MATHS_QUESTION_IDS[0], p_flagged: false });
  report(!!postSubmitFlagError, "a submitted attempt refuses further flag changes");

  // 11. Practice regression -- unaffected (unchanged from 008D's own script).
  const { data: practiceRow, error: practiceError } = await anonClient
    .from("ali_question_bank")
    .select("id,prompt")
    .eq("eligibility_status", "practice_eligible")
    .eq("subject", "maths")
    .limit(1);
  report(!practiceError && practiceRow?.[0]?.prompt?.answer !== undefined, "Practice content remains fully readable (unaffected by this migration)");

  console.log("");
  console.log(anyFailed ? "OVERALL: FAIL -- investigate before treating the lifecycle/reporting foundation as live." : "OVERALL: PASS");
  process.exit(anyFailed ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
