import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  LEARNER_TOP_LEVEL_ROUTES,
  PARENT_ONLY_PATH_PREFIXES,
  PUBLIC_TOP_LEVEL_ROUTES,
  decideAccess,
  hasRegisteredParentAccount,
  isLearnerSurface,
  isParentOnlyRoute,
} from "@/lib/registeredAccess";

/**
 * Controlled-beta policy 2026-09-21: a registered parent account is required for the persistent learner
 * experience. A Supabase ANONYMOUS technical session is not a registered parent and must never be presented as
 * one ("Viewing: Child 1", account menu, "Sign out").
 */

const read = (p: string) => fs.readFileSync(p, "utf8").replace(/\r\n/g, "\n");
const ANON = { is_anonymous: true };
const PARENT = { is_anonymous: false };
const PARENT_NO_FLAG = {}; // a permanent user object with no flag at all

test("only a permanent (non-anonymous) Supabase user is a registered parent", () => {
  assert.equal(hasRegisteredParentAccount(null), false);
  assert.equal(hasRegisteredParentAccount(undefined), false);
  assert.equal(hasRegisteredParentAccount(ANON), false);
  assert.equal(hasRegisteredParentAccount(PARENT), true);
  assert.equal(hasRegisteredParentAccount(PARENT_NO_FLAG), true);
});

test("public information and sign-in pages stay public for everyone", () => {
  for (const p of ["/", "/login", "/login?mode=signin", "/reset-password", "/getting-started", "/privacy", "/terms", "/contact", "/feedback", "/feature-request", "/report-bug", "/testimonial", "/beta", "/beta-family", "/angel-plus", "/admin-beta/review"]) {
    assert.equal(isLearnerSurface(p), false, p);
    for (const user of [null, ANON, PARENT]) assert.equal(decideAccess({ pathname: p, loading: false, user }), "allow", p);
    assert.equal(decideAccess({ pathname: p, loading: true, user: null }), "allow", `${p} while loading`);
  }
});

test("every learner, practice, Mock, progress and Parent Dashboard surface requires a registered parent", () => {
  const routes = [
    "/dashboard", "/learn", "/english", "/maths", "/vocabulary", "/verbal-reasoning", "/non-verbal-reasoning", "/numerical-reasoning",
    "/spatial-reasoning", "/reasoning", "/writing", "/mocks", "/mocks/csse", "/mocks/adaptive/maths", "/mock-test", "/progress", "/pathways",
    "/learning-intelligence", "/learning-intelligence/practice/mathematics", "/learning-intelligence/mock-exam?type=full_mock&subject=english",
    "/learning-intelligence/mock-report/abc", "/learning-intelligence/parent", "/learning-intelligence/parent/readiness-timeline", "/add-child",
  ];
  for (const p of routes) {
    assert.equal(isLearnerSurface(p), true, p);
    assert.equal(decideAccess({ pathname: p, loading: false, user: null }), "require-account", `${p} no session`);
    assert.equal(decideAccess({ pathname: p, loading: false, user: ANON }), "require-account", `${p} anonymous`);
    assert.equal(decideAccess({ pathname: p, loading: false, user: PARENT }), "allow", `${p} registered`);
  }
});

test("while the session is still resolving a learner surface is NOT mounted (no early reads or writes)", () => {
  assert.equal(decideAccess({ pathname: "/dashboard", loading: true, user: null }), "pending");
  assert.equal(decideAccess({ pathname: "/dashboard", loading: true, user: PARENT }), "pending");
});

test("fail-closed: an unlisted or future route is treated as a learner surface", () => {
  assert.equal(isLearnerSurface("/some-future-learner-page"), true);
  assert.equal(decideAccess({ pathname: "/some-future-learner-page", loading: false, user: ANON }), "require-account");
});

test("every top-level route in app/ is deliberately classified as public or learner (no route slips in unclassified)", () => {
  const appDir = path.join(process.cwd(), "app");
  const hasPage = (dir: string): boolean =>
    fs.readdirSync(dir, { withFileTypes: true }).some((e) => (e.isFile() && /^(page|route)\.tsx?$/.test(e.name)) || (e.isDirectory() && hasPage(path.join(dir, e.name))));
  const segments = fs.readdirSync(appDir, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name !== "api" && !e.name.startsWith("_") && !e.name.startsWith("("))
    .filter((e) => hasPage(path.join(appDir, e.name)))
    .map((e) => e.name);
  assert.ok(segments.length > 20);
  const classified = new Set([...PUBLIC_TOP_LEVEL_ROUTES, ...LEARNER_TOP_LEVEL_ROUTES]);
  const unclassified = segments.filter((s) => !classified.has(s));
  assert.deepEqual(unclassified, [], `classify these routes in lib/registeredAccess.ts: ${unclassified.join(", ")}`);
  const overlap = PUBLIC_TOP_LEVEL_ROUTES.filter((r) => LEARNER_TOP_LEVEL_ROUTES.includes(r));
  assert.deepEqual(overlap, []);
  for (const r of LEARNER_TOP_LEVEL_ROUTES) assert.equal(isLearnerSurface(`/${r}`), true, r);
});

test("the root layout wraps every page in the account gate, inside the AuthProvider", () => {
  const layout = read("app/layout.tsx");
  assert.match(layout, /<AuthProvider>\s*<RegisteredAccountGate>\{children\}<\/RegisteredAccountGate>\s*<\/AuthProvider>/);
});

test("the gate never mounts a learner surface for an anonymous visitor and offers Create account + Sign in", () => {
  const gate = read("components/RegisteredAccountGate.tsx");
  assert.match(gate, /decideAccess\(\{ pathname, loading, user \}\)/);
  assert.match(gate, /if \(decision === "allow"\) return <>\{children\}<\/>;/);
  // children are returned ONLY in the allow branch
  assert.equal((gate.match(/\{children\}/g) ?? []).length, 1);
  assert.match(gate, /href="\/login"[\s\S]*Create account/);
  assert.match(gate, /href="\/login\?mode=signin"[\s\S]*Sign in/);
  assert.doesNotMatch(gate, /Viewing:|Sign out|LearnerSwitcher/);
});

test("Header and Navigation treat an anonymous session as signed OUT: no 'Viewing:' switcher, no account menu / Sign out", () => {
  for (const f of ["components/Header.tsx", "components/Navigation.tsx"]) {
    const src = read(f);
    assert.match(src, /hasRegisteredParentAccount\(sessionUser\) \? sessionUser : null/, f);
    assert.doesNotMatch(src, /const \{ user, signOut, loading \} = useAuth\(\)/, `${f} must not use the raw session user`);
  }
  const header = read("components/Header.tsx");
  // `user` is now registered-only; PRIVATE LEARNER SPACE also hides the sibling switcher in Learner Mode.
  assert.match(header, /\{!loading && user && !isLearnerMode && <LearnerSwitcher \/>\}/);
  assert.match(header, /href="\/login\?mode=signin"[\s\S]*?Sign in[\s\S]*?href="\/login"[\s\S]*?Create account/);
});

test("AuthProvider no longer creates, activates or claims a learner profile for an anonymous technical session", () => {
  const src = read("components/providers/AuthProvider.tsx");
  assert.match(src, /if \(hasRegisteredParentAccount\(data\.session\.user\)\) \{\s*\n\s*ensureProfile\(\)\.then\(activateLearner\)/);
  assert.match(src, /if \(newSession\?\.user && hasRegisteredParentAccount\(newSession\.user\)\) \{\s*\n\s*ensureProfile\(\)\.then\(activateLearner\)/);
  // the anonymous session itself is still bootstrapped (internal technical identity) -- only the learner side effects stopped
  assert.match(src, /ensureLearnerSession\(\)\.catch/);
});

// ---------------------------------------------------------------------
// PRIVATE LEARNER SPACE -- parent-only routes (household management,
// pathway configuration) that must never render their real content while
// a household is in Learner Mode, regardless of how they're reached.
// ---------------------------------------------------------------------

test("isParentOnlyRoute matches exactly the household-management and pathway-configuration routes, by full path prefix", () => {
  for (const p of ["/add-child", "/add-child/", "/pathways", "/pathways/anything", "/learning-intelligence/parent", "/learning-intelligence/parent/weekly-report"]) {
    assert.equal(isParentOnlyRoute(p), true, p);
  }
});

test("isParentOnlyRoute does NOT match the CSSE learner's own /learning-intelligence routes -- a shared top-level segment must not over-match", () => {
  for (const p of ["/learning-intelligence", "/learning-intelligence/learn", "/learning-intelligence/practice", "/learning-intelligence/timeline"]) {
    assert.equal(isParentOnlyRoute(p), false, p);
  }
});

test("isParentOnlyRoute does not match ordinary learner surfaces or public routes", () => {
  for (const p of ["/dashboard", "/mocks", "/progress", "/", "/login", "/getting-started"]) {
    assert.equal(isParentOnlyRoute(p), false, p);
  }
});

test("every entry in PARENT_ONLY_PATH_PREFIXES is itself a learner surface (never a public route) -- the two checks must never contradict each other", () => {
  for (const prefix of PARENT_ONLY_PATH_PREFIXES) {
    assert.equal(isLearnerSurface(prefix), true, prefix);
  }
});

test("RegisteredAccountGate blocks parent-only routes in Learner Mode BEFORE the ordinary allow branch, with its own real route back", () => {
  const gate = read("components/RegisteredAccountGate.tsx");
  assert.match(gate, /isLearnerMode && isParentOnlyRoute\(pathname\)/);
  assert.match(gate, /data-testid="parent-mode-required"/);
  assert.match(gate, /href="\/dashboard"/);
  // The new branch must be checked before the plain "allow" branch, or it would never be reached.
  const parentOnlyIndex = gate.indexOf("isParentOnlyRoute(pathname)");
  const allowIndex = gate.indexOf('if (decision === "allow") return');
  assert.ok(parentOnlyIndex > -1 && allowIndex > -1 && parentOnlyIndex < allowIndex);
});

test("RegisteredAccountGate also re-prompts for the learner's own PIN when the mode pointer says Learner Mode but no session token is present (e.g. a freshly opened tab) -- BEFORE the plain allow branch, so a page can never silently render with sibling-tainted or unauthorised state", () => {
  const gate = read("components/RegisteredAccountGate.tsx");
  assert.match(gate, /isLearnerMode && !hasLearnerToken && learnersReady && activeLearner/);
  assert.match(gate, /data-testid="learner-pin-required"/);
  assert.match(gate, /mode="verify"/);
  const pinRequiredIndex = gate.indexOf("!hasLearnerToken");
  const allowIndex = gate.indexOf('if (decision === "allow") return');
  assert.ok(pinRequiredIndex > -1 && allowIndex > -1 && pinRequiredIndex < allowIndex);
});

test("Enter learner space is reachable from Header's account menu -- visible on every page, not only the separate Parent Dashboard page", () => {
  const header = read("components/Header.tsx");
  assert.match(header, /Enter \{active\.name .*\}&rsquo;s space/);
  assert.match(header, /!isLearnerMode && learnersReady && active/);
  // PRIVATE LEARNER SPACE, Part 2: gated by THIS learner's own PIN
  // (learner_pin_status/LearnerPinModal), never the household Parent PIN --
  // entering and returning are different credentials.
  assert.match(header, /getLearnerPinStatus\(active\.id\)/);
  assert.match(header, /setLearnerPinModal\(hasLearnerPin === false \? "set" : "verify"\)/);
  assert.match(header, /enterLearnerSpace\(active\.id, sessionToken\)/);
});
