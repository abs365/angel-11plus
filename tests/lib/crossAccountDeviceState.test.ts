import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  clearLearnerContext,
  createLearnerAwareFetch,
  ensureLearnerContext,
  learnerScopedKey,
  setActiveLearner,
  getLearnerContextSnapshot,
} from "@/lib/learnerContext";
import { getProgress, saveProgress } from "@/lib/progress";
import { claimLegacyLocalState, learnerOwnsThisDevice, reconcileSetup } from "@/lib/learnerActivation";

/**
 * Production finding (Founder, real journey): a NEW email account opened on
 * a browser previously used with Angel 11+ immediately showed "5 sessions so
 * far", "Solid progress", "Building Confidence", CSSE and an English mission
 * BEFORE any setup. Root cause on production (pre-migration-260 client): the
 * whole learner-progress blob lives under ONE device-wide localStorage key
 * and nothing about it knows which account is signed in.
 *
 * These tests pin the multi-learner branch's answer, step by step:
 *   A signs out -> B signs in / creates an account on the SAME device
 *   -> B does NOT inherit A's state; A still has it.
 */

const UA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"; // Parent A (previous user of this browser)
const UB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb"; // Parent B (NEW email, same browser)
const LA = "a1a1a1a1-0000-4000-8000-000000000001";
const LA2 = "a2a2a2a2-0000-4000-8000-000000000002"; // Parent A's second child
const LB = "b1b1b1b1-0000-4000-8000-000000000001";
const DEVICE = "device-D";
const REST = "https://x.supabase.co/rest/v1";

class FakeStorage {
  private m = new Map<string, string>();
  get length() { return this.m.size; }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
}
const jwt = (sub: string) => {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${b64({ alg: "HS256" })}.${b64({ sub, role: "authenticated" })}.sig`;
};
function backend() {
  const learners: Record<string, { id: string }[]> = { [UA]: [{ id: LA }, { id: LA2 }], [UB]: [{ id: LB }] };
  const baseFetch: typeof fetch = async (input) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (url.includes("/profiles?")) {
      const uid = decodeURIComponent(/auth_user_id=eq\.([^&]+)/.exec(url)![1]);
      return new Response(JSON.stringify((learners[uid] ?? []).map((l, i) => ({ id: l.id, learner_name: null, selected_pathway_id: null, created_at: `2026-01-0${i + 1}T00:00:00Z` }))), { status: 200 });
    }
    return new Response("{}", { status: 200 });
  };
  return baseFetch;
}

const g = globalThis as unknown as Record<string, unknown>;
let ls: FakeStorage;
let savedEnv: { url?: string; key?: string };

beforeEach(() => {
  savedEnv = { url: process.env.NEXT_PUBLIC_SUPABASE_URL, key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY };
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "k";
  ls = new FakeStorage();
  g.window = { localStorage: ls, sessionStorage: new FakeStorage() };
  g.localStorage = ls;
  clearLearnerContext();
  createLearnerAwareFetch({ restBase: REST, anonKey: "anon", baseFetch: backend() });
});
afterEach(() => {
  clearLearnerContext();
  delete g.window;
  delete g.localStorage;
  if (savedEnv.url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL; else process.env.NEXT_PUBLIC_SUPABASE_URL = savedEnv.url;
  if (savedEnv.key === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = savedEnv.key;
});

/** What Parent A's browser holds today (production, pre-260): one device-wide blob. */
function seedLegacyDeviceWideState() {
  ls.setItem("angel11plus_progress", JSON.stringify({
    xp: 257, streak: 1, lastActivity: "2026-09-08T15:36:24.205Z", scores: { l1: 60 },
    completedLessons: ["eng-1", "eng-2", "maths-1", "vocab-1", "vocab-2"], selectedPathwayId: "csse",
  }));
  ls.setItem("angel11plus_migrated_v1", "1");
}
async function signInAs(uid: string) {
  clearLearnerContext(); // sign-out of whoever was there
  await ensureLearnerContext(uid, jwt(uid));
}

test("the device-ownership rule: only the profile created on THIS device may claim its legacy state", () => {
  assert.equal(learnerOwnsThisDevice(DEVICE, DEVICE), true);
  assert.equal(learnerOwnsThisDevice("some-other-device", DEVICE), false); // a same-device newcomer is issued a fresh id
  assert.equal(learnerOwnsThisDevice(null, DEVICE), false);
  assert.equal(learnerOwnsThisDevice(DEVICE, ""), false);
});

test("PERMANENT A -> sign out -> PERMANENT B (NEW email, SAME browser): B does not inherit A's state", async () => {
  seedLegacyDeviceWideState();

  // B signs in first after the update. B's profile was created with a fresh device id (device ids are unique).
  await signInAs(UB);
  assert.equal(learnerOwnsThisDevice("fresh-device-for-B", DEVICE), false);
  // (activation for B therefore makes no claim)
  const bBefore = getProgress();
  assert.equal(bBefore.completedLessons.length, 0, "B must not see A's 5 sessions");
  assert.equal(bBefore.selectedPathwayId, undefined, "B must not inherit A's CSSE pathway");
  assert.equal(bBefore.xp, 0);

  // A signs back in: A's profile was created on this device, so A (and only A) claims the legacy state.
  await signInAs(UA);
  assert.equal(learnerOwnsThisDevice(DEVICE, DEVICE), true);
  assert.equal(claimLegacyLocalState(ls, LA), true);
  assert.equal(getProgress().completedLessons.length, 5, "A keeps their own state");
  assert.equal(getProgress().selectedPathwayId, "csse");

  // ...and B, on the very same browser, is still clean.
  await signInAs(UB);
  assert.equal(getProgress().completedLessons.length, 0);
  assert.equal(getProgress().selectedPathwayId, undefined);
});

test("order does not matter: A claims first, then B on the same device still gets nothing", async () => {
  seedLegacyDeviceWideState();
  await signInAs(UA);
  claimLegacyLocalState(ls, LA);
  await signInAs(UB);
  assert.equal(getProgress().completedLessons.length, 0);
  // Even a (hypothetical) later claim attempt cannot take what A already claimed.
  assert.equal(claimLegacyLocalState(ls, LB), false);
  assert.equal(ls.getItem(learnerScopedKey("angel11plus_progress", LB)), null);
});

test("B's own progress written on the shared browser never leaks back into A, and vice versa", async () => {
  seedLegacyDeviceWideState();
  await signInAs(UA);
  claimLegacyLocalState(ls, LA);
  await signInAs(UB);
  saveProgress({ ...getProgress(), xp: 10, completedLessons: ["maths-9"], selectedPathwayId: "gl" });
  assert.equal(getProgress().completedLessons.length, 1);
  await signInAs(UA);
  assert.equal(getProgress().completedLessons.length, 5);
  assert.equal(getProgress().selectedPathwayId, "csse");
});

test("what a NEW account's dashboard is derived from is its OWN learner state: fresh, seeded only from its own server row", async () => {
  seedLegacyDeviceWideState();
  await signInAs(UB);
  const fresh = getProgress();
  // Reconciliation for B uses B's own database row only (empty for a new account): nothing appears from A.
  const r = reconcileSetup(
    { xp: fresh.xp, streak: fresh.streak, completedLessons: fresh.completedLessons, lastActivity: fresh.lastActivity },
    { selected_pathway_id: null, target_exam_date: null, target_exam_date_provenance: null, school_year: null }
  );
  assert.equal(r.changedLocal, false);
  assert.equal(r.push, null);
  assert.equal(r.local.completedLessons.length, 0);
});

test("ANONYMOUS learner -> a NEW permanent account is a different auth identity: the anonymous profile's device state is NOT handed to it", async () => {
  // Current architecture (verified): signInWithOtp creates a NEW auth user; the anonymous user (and the profile it
  // owns) is left as it was. The permanent account's profile is created with a fresh device id, so it cannot claim
  // the anonymous learner's browser state either. The anonymous evidence is preserved -- under the anonymous
  // identity -- and is simply not reachable from the new account. (A deliberate link-on-create flow would be a
  // separate design decision; see the report.)
  seedLegacyDeviceWideState();
  const ANON_LEARNER = "c1c1c1c1-0000-4000-8000-000000000001";
  assert.equal(learnerOwnsThisDevice(DEVICE, DEVICE), true, "the anonymous learner's profile owns this device");
  assert.equal(learnerOwnsThisDevice("fresh-device-for-permanent", DEVICE), false);
  await signInAs(UB);
  assert.equal(getProgress().completedLessons.length, 0);
  assert.notEqual(ANON_LEARNER, LB);
  void setActiveLearner;
});

// ---------------------------------------------------------------------------------------------------------------
// The EXACT production case (Founder's real journey, confirmed by the read-only provenance check):
//   the browser's previous owner was an ANONYMOUS learner (own server evidence: 1 lesson_progress row, 69 XP);
//   a NEW permanent account was created on the SAME browser; the new learner owns ZERO server evidence, yet
//   production showed "5 sessions so far", "Solid progress", "Building Confidence", CSSE and a daily mission.
// ---------------------------------------------------------------------------------------------------------------

import { computeAnalytics } from "@/lib/analytics";
import { computeAdaptiveState } from "@/lib/adaptiveEngine";
import { computeGamification } from "@/lib/gamification";
import { computeParentReport, READINESS_CONFIG } from "@/lib/parentInsights";
import { getInProgressMockAttempt, startMockAttempt } from "@/lib/mockProgress";

function dashboardView() {
  const p = getProgress();
  const r = computeAnalytics(p);
  const adaptive = computeAdaptiveState(p, r);
  const parent = computeParentReport(p, r, computeGamification(p));
  return {
    sessions: p.completedLessons.length,
    solidProgressMessage: p.completedLessons.length >= 5,
    xp: p.xp,
    pathway: p.selectedPathwayId,
    confidenceChip: READINESS_CONFIG[parent.examReadiness].label,
    missionLabels: adaptive.dailyMission.items.map((i: { label?: string; title?: string }) => i.label ?? i.title),
    hasExamDate: Boolean(p.targetExamDate),
    hasSkillEvidence: Object.keys(p.skillScores ?? {}).length > 0 || Object.keys(p.aliCompetencySignal ?? {}).length > 0,
  };
}

test("EXACT PRODUCTION CASE: anonymous learner A's device state -> NEW permanent account B on the SAME browser: B gets a clean learner", async () => {
  // Anonymous A accumulated local state (sessions, XP, pathway, scores, an unfinished Mock).
  seedLegacyDeviceWideState();
  ls.setItem("angel11plus_mock_attempt_in_progress", JSON.stringify({ id: "csse-1", pathway: "csse", pathwayName: "CSSE", startedAt: "2026-09-08T15:00:00Z" }));
  const aRaw = ls.getItem("angel11plus_progress");
  const aMockRaw = ls.getItem("angel11plus_mock_attempt_in_progress");

  // The anonymous session is replaced when B signs in via the email link; B is a different auth identity whose
  // profile was created with a fresh device id (the anonymous profile owns this device's id).
  await signInAs(UB);
  assert.equal(learnerOwnsThisDevice("fresh-device-for-B", DEVICE), false);

  const b = dashboardView();
  assert.equal(b.sessions, 0, "B must not show A's completed sessions");
  assert.equal(b.solidProgressMessage, false, "B must not get 'Solid progress'");
  assert.equal(b.xp, 0, "B must not show A's XP");
  assert.equal(b.pathway, undefined, "B must not inherit A's CSSE pathway");
  assert.equal(b.hasExamDate, false);
  assert.equal(b.hasSkillEvidence, false, "B must not show A's preparation/skill state");
  assert.equal(b.confidenceChip, READINESS_CONFIG["not-ready"].label, "B must not show A's confidence state");
  assert.equal(await getInProgressMockAttempt(), null, "B must not see A's unfinished Mock");
  // A brand-new account still gets the generic default mission; what matters is that it is EXACTLY the mission of a
  // virgin learner (default progress), i.e. not one built from A's scores.
  const virgin = computeAdaptiveState(
    { xp: 0, streak: 1, completedLessons: [], scores: {}, lastActivity: getProgress().lastActivity },
    computeAnalytics({ xp: 0, streak: 1, completedLessons: [], scores: {}, lastActivity: getProgress().lastActivity })
  ).dailyMission.items.map((i: { label?: string; title?: string }) => i.label ?? i.title);
  assert.deepEqual(b.missionLabels, virgin, "B's daily mission must equal a virgin learner's, not one derived from A's scores");

  // B starts a Mock of their own on the shared browser; it is B's only.
  startMockAttempt("csse", "CSSE");
  assert.notEqual(await getInProgressMockAttempt(), null);

  // A's browser state is completely untouched: never read-and-rewritten, never deleted.
  assert.equal(ls.getItem("angel11plus_progress"), aRaw);
  assert.equal(ls.getItem("angel11plus_mock_attempt_in_progress"), aMockRaw);
});

test("the SAME inputs on the current production code (device-wide key) would have shown B all of A's state -- the defect this branch removes", () => {
  // Characterisation of what production did: with no learner context, there is only the legacy key and
  // the branch refuses to read it (learnerStorageKey() is null until a learner is known).
  seedLegacyDeviceWideState();
  clearLearnerContext();
  const beforeAnyLearnerIsKnown = getProgress();
  assert.equal(beforeAnyLearnerIsKnown.completedLessons.length, 0, "the legacy device-wide blob is never read as anyone's state");
});

// ---------------------------------------------------------------------------------------------------------------
// Release acceptance points 11 and 13.
// ---------------------------------------------------------------------------------------------------------------

test("LOGOUT / LOGIN (same account): the parent returns to the child they last used, with that child's state, and the sibling is intact", async () => {
  await signInAs(UA); // default: oldest child
  saveProgress({ ...getProgress(), xp: 11, completedLessons: ["eng-1"], selectedPathwayId: "csse" });
  assert.equal(setActiveLearner(LA2), true);
  saveProgress({ ...getProgress(), xp: 77, completedLessons: ["maths-1", "maths-2"], selectedPathwayId: "gl" });

  clearLearnerContext(); // logout: in-memory context dropped, the account-keyed pointer is kept
  await ensureLearnerContext(UA, jwt(UA)); // login again
  assert.equal(getProgress().xp, 77, "returns to the child last used (Child 2)");
  assert.equal(getProgress().selectedPathwayId, "gl");

  assert.equal(setActiveLearner(LA), true); // switch back to Child 1
  assert.equal(getProgress().xp, 11, "Child 1's state is intact");
  assert.equal(getProgress().selectedPathwayId, "csse");
});

test("LOGOUT then a DIFFERENT parent logs in on the same browser: they get their own child, never Parent A's last-used child", async () => {
  await signInAs(UA);
  setActiveLearner(LA2);
  saveProgress({ ...getProgress(), xp: 77 });
  clearLearnerContext();
  await ensureLearnerContext(UB, jwt(UB));
  assert.equal(getProgress().xp, 0);
  assert.equal(getLearnerContextSnapshot().learnerId, LB);
});

test("EXISTING single-child families are not forced through setup or migration: the setup card only appears while a name or pathway is genuinely missing", async () => {
  const fs = await import("node:fs");
  const dash = fs.readFileSync("app/dashboard/page.tsx", "utf8");
  assert.match(dash, /progress && childNameReady && \(!childName \|\| !pathway\) && \(/, "setup card is conditional on missing setup");
  // A returning family whose learner already has a pathway needs no server-side migration step: reconciliation is idempotent.
  const r = reconcileSetup(
    { xp: 5, streak: 2, completedLessons: ["l1"], lastActivity: "2026-09-01T00:00:00Z", selectedPathwayId: "csse", schoolYear: "Year 5" },
    { selected_pathway_id: "csse", target_exam_date: null, target_exam_date_provenance: null, school_year: "Year 5" }
  );
  assert.equal(r.changedLocal, false);
  assert.equal(r.push, null);
  // The switcher is a header control, not a gate: nothing routes a single-child parent to /add-child.
  const routes = fs.readFileSync("components/LearnerSwitcher.tsx", "utf8");
  assert.match(routes, /href="\/add-child"/);
  assert.doesNotMatch(dash, /router\.(push|replace)\("\/add-child"\)/);
});
