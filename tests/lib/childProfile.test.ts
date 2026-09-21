import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  LEGACY_CHILD_NAME_KEY,
  normaliseChildName,
  readChildName,
  saveChildName,
  type ChildNameOwner,
} from "@/lib/childProfile";
import { resolveLoginTab } from "@/app/login/page";

/**
 * Family #1 onboarding correction. Verified architecture: one account owns
 * one learner profile (profiles.auth_user_id UNIQUE) and the child's name
 * is a local-only label (LR-01). These tests pin: the name is scoped to
 * the signed-in account (a second account on a shared device never sees
 * it), the genuine legacy device-wide name is preserved for the parent who
 * entered it, and nothing is ever deleted.
 */

class FakeStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  keys() { return [...this.m.keys()]; }
}

const parentA: ChildNameOwner = { id: "user-a", isPermanent: true };
const parentB: ChildNameOwner = { id: "user-b", isPermanent: true };
const anonymous: ChildNameOwner = { id: "anon-1", isPermanent: false };

test("normaliseChildName trims, collapses whitespace, caps at 40 and rejects blank", () => {
  assert.equal(normaliseChildName("  Priya   Sharma "), "Priya Sharma");
  assert.equal(normaliseChildName("   "), null);
  assert.equal(normaliseChildName("x".repeat(60))?.length, 40);
});

test("a saved name reads back for the same account and is not visible to a different account", () => {
  const s = new FakeStorage();
  assert.equal(saveChildName(s, parentA, "Sam"), "Sam");
  assert.equal(readChildName(s, parentA), "Sam");
  assert.equal(readChildName(s, parentB), null);
});

test("blank input saves nothing", () => {
  const s = new FakeStorage();
  assert.equal(saveChildName(s, parentA, "   "), null);
  assert.deepEqual(s.keys(), []);
});

test("genuine legacy device-wide name is claimed by the first permanent account and preserved", () => {
  const s = new FakeStorage();
  s.setItem(LEGACY_CHILD_NAME_KEY, "Existing");
  assert.equal(readChildName(s, parentA), "Existing");
  // Legacy value is never deleted or rewritten.
  assert.equal(s.getItem(LEGACY_CHILD_NAME_KEY), "Existing");
  // A different account signing in on the same device must NOT inherit it.
  assert.equal(readChildName(s, parentB), null);
  // The claimant keeps seeing it on later reads.
  assert.equal(readChildName(s, parentA), "Existing");
});

test("an anonymous session never claims the legacy name, so it is still there for the parent", () => {
  const s = new FakeStorage();
  s.setItem(LEGACY_CHILD_NAME_KEY, "Existing");
  assert.equal(readChildName(s, anonymous), null);
  assert.equal(readChildName(s, parentA), "Existing");
});

test("editing after a claim writes only the account's own key; legacy stays untouched", () => {
  const s = new FakeStorage();
  s.setItem(LEGACY_CHILD_NAME_KEY, "Existing");
  readChildName(s, parentA);
  saveChildName(s, parentA, "Renamed");
  assert.equal(readChildName(s, parentA), "Renamed");
  assert.equal(s.getItem(LEGACY_CHILD_NAME_KEY), "Existing");
});

test("with no auth identity at all (Supabase unconfigured) the legacy key is the device's only name", () => {
  const s = new FakeStorage();
  const none: ChildNameOwner = { id: null, isPermanent: false };
  saveChildName(s, none, "Solo");
  assert.equal(s.getItem(LEGACY_CHILD_NAME_KEY), "Solo");
  assert.equal(readChildName(s, none), "Solo");
});

test("a storage that throws never breaks a page: read/save fail soft", () => {
  const broken = {
    getItem() { throw new Error("blocked"); },
    setItem() { throw new Error("blocked"); },
  };
  assert.equal(readChildName(broken, parentA), null);
  assert.equal(saveChildName(broken, parentA, "Sam"), null);
});

test("the child's name is never sent anywhere: lib/childProfile.ts has no network or Supabase reference", () => {
  const src = fs.readFileSync("lib/childProfile.ts", "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
  assert.doesNotMatch(src, /supabase|fetch\(|XMLHttpRequest|sendBeacon/i);
});

test("resolveLoginTab: Sign in links land on the sign-in tab; a bare /login (beta invitation) lands on Create account", () => {
  assert.equal(resolveLoginTab("signin"), "signin");
  assert.equal(resolveLoginTab(null), "create");
  assert.equal(resolveLoginTab(undefined), "create");
  assert.equal(resolveLoginTab("anything-else"), "create");
});

test("every 'Sign in' link in the shell targets the sign-in tab", () => {
  for (const f of ["components/Header.tsx", "components/Navigation.tsx", "components/ui/UserMenu.tsx", "app/reset-password/page.tsx"]) {
    const src = fs.readFileSync(f, "utf8");
    assert.doesNotMatch(src, /href="\/login"/, `${f} should link to /login?mode=signin`);
    assert.match(src, /href="\/login\?mode=signin"/);
  }
});

test("the Parent Dashboard is the family overview: it names whose progress is shown, switches child through the ONE learner context, and offers Add another child (multi-child is real since migration 260)", () => {
  const page = fs.readFileSync("app/learning-intelligence/parent/page.tsx", "utf8");
  assert.match(page, /<LearnerIdentityBanner \/>/);
  const banner = fs.readFileSync("components/parent/LearnerIdentityBanner.tsx", "utf8");
  assert.match(banner, /progress/);
  assert.match(banner, /useLearners\(\)/);
  assert.match(banner, /switchLearner\(l\.id\)/);
  assert.match(banner, /Add another child/);
  assert.match(banner, /href="\/add-child"/);
  // Children are never merged into an aggregate score, and ids are never shown.
  assert.doesNotMatch(banner.replace(/\/\*[\s\S]*?\*\//g, ""), /total|average|combined/i);
  assert.doesNotMatch(banner, /currently supports one child per account/);
});
