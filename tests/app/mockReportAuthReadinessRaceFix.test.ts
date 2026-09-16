import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * CSSE Two-Paper Mock P1 Repair, recovery-path race condition — production
 * evidence (live browser test: a fresh authenticated reload dispatched and
 * succeeded on both POST /api/mock-reading-scoring and POST /api/mock-
 * writing-assessment; a prior Founder reload dispatched neither, with zero
 * server-side trace) proved this page's recovery effect could run BEFORE
 * the Supabase client's own session restoration completed.
 * requestReadingScoring()/requestMockWritingAssessment() both silently
 * return a "no_session" outcome and never call fetch when no session is
 * yet resolved -- no console warning, no network trace. Every other
 * authenticated page in this app already gates on AuthProvider's own
 * `loading` flag before doing anything RLS-scoped (see app/admin-beta/
 * mock-report-release/page.tsx) -- this page never did. Structural
 * source-text assertions, matching this repository's own established
 * convention for this file.
 */

const SOURCE = fs.readFileSync("app/learning-intelligence/mock-report/[attemptId]/page.tsx", "utf8");

test("useAuth is imported from the existing AuthProvider -- no new auth mechanism introduced", () => {
  assert.match(SOURCE, /import \{ useAuth \} from "@\/components\/providers\/AuthProvider";/);
});

test("the page reads AuthProvider's own loading flag", () => {
  assert.match(SOURCE, /const \{ loading: authLoading \} = useAuth\(\);/);
});

test("the recovery/report-loading effect bails out early while auth is still resolving, before any Supabase read is attempted", () => {
  const effectStart = SOURCE.indexOf("useEffect(() => {");
  const firstSupabaseRead = SOURCE.indexOf("getMockAttemptReport(supabase, params.attemptId)");
  const authGuardIdx = SOURCE.indexOf("if (authLoading) return;");
  assert.ok(effectStart !== -1 && firstSupabaseRead !== -1 && authGuardIdx !== -1);
  assert.ok(effectStart < authGuardIdx && authGuardIdx < firstSupabaseRead, "the authLoading guard must run before any RLS-scoped read");
});

test("authLoading is a dependency of the effect, so it re-runs once the session genuinely resolves", () => {
  assert.match(SOURCE, /\}, \[params\.attemptId, authLoading\]\);/);
});

test("every existing recovery/report call site is completely unchanged by this fix -- only the entry guard was added", () => {
  assert.match(SOURCE, /isReadingScoringRecoveryEligible\(summary\.data\)/);
  assert.match(SOURCE, /isWritingAssessmentRecoveryEligible\(summary\.data\)/);
  assert.match(SOURCE, /void requestReadingScoring\(supabase, params\.attemptId\)\.then\(logReadingScoringRequestOutcome\);/);
  assert.match(SOURCE, /void requestMockWritingAssessment\(supabase, params\.attemptId\)\.then\(logWritingAssessmentRequestOutcome\);/);
});
