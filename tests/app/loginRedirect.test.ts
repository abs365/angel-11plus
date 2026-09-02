import { test } from "node:test";
import assert from "node:assert/strict";
import { isPermanentlyAuthenticated } from "@/app/login/page";

/**
 * Gate 3 production defect (this session): /login redirected away from
 * its own email magic-link sign-in form whenever ANY Supabase session
 * existed, including the anonymous session Angel automatically
 * bootstraps on every page load with none yet — making the sign-in form
 * unreachable for exactly the learner it exists for (someone who has
 * been using Angel anonymously and now wants to create a permanent
 * account). isPermanentlyAuthenticated() is the extracted, corrected
 * decision: only a genuinely non-anonymous session should redirect away.
 */

test("no session at all: login form must remain available", () => {
  assert.equal(isPermanentlyAuthenticated(null), false);
  assert.equal(isPermanentlyAuthenticated(undefined), false);
});

test("Gate 3 fix: an anonymous session must NOT redirect away — the sign-in form must remain reachable", () => {
  assert.equal(isPermanentlyAuthenticated({ is_anonymous: true }), false);
});

test("a genuinely permanent (non-anonymous) session redirects to the dashboard", () => {
  assert.equal(isPermanentlyAuthenticated({ is_anonymous: false }), true);
});

test("a Supabase user object with is_anonymous omitted (older/edge-case shape) is treated as permanent, matching Supabase's own convention that a real account never sets is_anonymous: true", () => {
  assert.equal(isPermanentlyAuthenticated({}), true);
});

test("anonymous learning/bootstrap behaviour is unaffected: this predicate only decides /login's own redirect, never blocks or alters session creation itself", () => {
  // isPermanentlyAuthenticated is a pure read of an already-established
  // user object — it has no side effects and cannot itself prevent or
  // alter ensureLearnerSession()'s anonymous bootstrap (lib/learnerIdentity.ts,
  // separately regression-tested in tests/lib/learnerIdentity.test.ts).
  // Asserted here only to make the boundary explicit: an anonymous
  // session that has NOT visited /login continues to exist and function
  // exactly as before this fix.
  const anonymousUser = { is_anonymous: true };
  assert.equal(isPermanentlyAuthenticated(anonymousUser), false, "still not redirected");
  assert.equal(anonymousUser.is_anonymous, true, "the session object itself is untouched by this check");
});
