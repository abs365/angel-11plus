import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  LEARNER_HEADER,
  chooseActiveLearner,
  clearLearnerContext,
  createLearnerAwareFetch,
  ensureLearnerContext,
  findPersistedSessionUserId,
  getLearnerContextSnapshot,
  jwtSubject,
  learnerRequestHeaders,
  learnerScopedKey,
  learnerStorageKey,
  readActivePointer,
  setActiveLearner,
  writeActivePointer,
} from "@/lib/learnerContext";
import { getProgress, saveProgress } from "@/lib/progress";
import { claimLegacyLocalState, reconcileSetup, type LocalSetup } from "@/lib/learnerActivation";
import { forwardedLearnerHeaders } from "@/lib/learnerRequestForwarding";
import { switchDestination, friendlyLearnerError } from "@/lib/useLearners";
import { learnerDisplayName } from "@/lib/learnerDisplay";

/**
 * Wave 0 multi-learner architecture (client side): the single active-
 * learner context, its transport, per-learner browser state, legacy-state
 * claim, setup reconciliation, and shared-device / sign-out / sign-in
 * behaviour. No DOM harness exists in this repository, so the browser
 * globals these modules read are provided as minimal fakes.
 */

const U1 = "11111111-1111-4111-8111-111111111111"; // Parent A
const U2 = "22222222-2222-4222-8222-222222222222"; // Parent B (same device)
const L1 = "a1a1a1a1-0000-4000-8000-000000000001";
const L2 = "a2a2a2a2-0000-4000-8000-000000000002";
const LB = "b1b1b1b1-0000-4000-8000-000000000001";
const REST = "https://x.supabase.co/rest/v1";

function jwt(sub?: string): string {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${b64({ alg: "HS256" })}.${b64(sub ? { sub, role: "authenticated" } : { role: "anon" })}.sig`;
}

class FakeStorage {
  private m = new Map<string, string>();
  get length() { return this.m.size; }
  key(i: number) { return [...this.m.keys()][i] ?? null; }
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
}

interface Call { url: string; headers: Headers }

function fakeBackend(learnersByUid: Record<string, { id: string; name: string | null }[]>) {
  const calls: Call[] = [];
  const baseFetch: typeof fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const headers = new Headers(init?.headers ?? (typeof input === "object" && "headers" in input ? input.headers : undefined));
    calls.push({ url, headers });
    if (url.includes("/profiles?")) {
      const uid = decodeURIComponent(/auth_user_id=eq\.([^&]+)/.exec(url)![1]);
      const rows = (learnersByUid[uid] ?? []).map((l, i) => ({
        id: l.id, learner_name: l.name, selected_pathway_id: null, created_at: `2026-01-0${i + 1}T00:00:00Z`,
      }));
      return new Response(JSON.stringify(rows), { status: 200 });
    }
    return new Response("{}", { status: 200 });
  };
  return { calls, baseFetch };
}

const g = globalThis as unknown as Record<string, unknown>;
let savedEnv: { url?: string; key?: string };

beforeEach(() => {
  clearLearnerContext();
  savedEnv = { url: process.env.NEXT_PUBLIC_SUPABASE_URL, key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY };
});
afterEach(() => {
  clearLearnerContext();
  process.env.NEXT_PUBLIC_SUPABASE_URL = savedEnv.url;
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = savedEnv.key;
  if (savedEnv.url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (savedEnv.key === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete g.window;
  delete g.localStorage;
});

// ---------------------------------------------------------------- pure helpers

test("jwtSubject reads the account id from a Bearer token and ignores non-account tokens", () => {
  assert.equal(jwtSubject(`Bearer ${jwt(U1)}`), U1);
  assert.equal(jwtSubject(`Bearer ${jwt()}`), null); // anon key has no sub
  assert.equal(jwtSubject("Bearer garbage"), null);
  assert.equal(jwtSubject(null), null);
});

test("chooseActiveLearner: stored choice if still owned, else the account's oldest learner, else null", () => {
  const list = [{ id: L1 }, { id: L2 }];
  assert.equal(chooseActiveLearner(list, L2), L2);
  assert.equal(chooseActiveLearner(list, "not-mine"), L1);
  assert.equal(chooseActiveLearner(list, null), L1);
  assert.equal(chooseActiveLearner([], L1), null);
});

test("the stored active-learner pointer belongs to its account: another account on a shared device never inherits it", () => {
  const session = new FakeStorage();
  const local = new FakeStorage();
  writeActivePointer(session, local, U1, L2);
  assert.equal(readActivePointer(session, local, U1), L2);
  assert.equal(readActivePointer(session, local, U2), null);
  assert.equal(readActivePointer(session, local, null), null);
  // Per-tab choice wins over the device's last choice.
  writeActivePointer(session, null, U1, L1);
  assert.equal(readActivePointer(session, local, U1), L1);
});

test("findPersistedSessionUserId reads the signed-in account from supabase-js's stored session", () => {
  const local = new FakeStorage();
  local.setItem("sb-abc123-auth-token", JSON.stringify({ user: { id: U1 } }));
  assert.equal(findPersistedSessionUserId(local), U1);
  assert.equal(findPersistedSessionUserId(new FakeStorage()), null);
});

test("customer-facing labels never expose ids: unnamed learners are 'Child N'", () => {
  assert.equal(learnerDisplayName({ name: "Loni" }, 0), "Loni");
  assert.equal(learnerDisplayName({ name: null }, 1), "Child 2");
  assert.equal(learnerDisplayName({ name: "  " }, 0), "Child 1");
});

test("governed database errors become plain-language messages (never raw SQL text)", () => {
  assert.match(friendlyLearnerError("angel_learner_limit"), /up to 8/);
  assert.match(friendlyLearnerError("angel_add_learner_requires_account"), /account/);
  assert.doesNotMatch(friendlyLearnerError("PGRST301 something internal"), /PGRST|internal/);
});

test("switching child: Parent Dashboard stays put; every other page returns to Today (so no page keeps the other child's URL)", () => {
  assert.deepEqual(switchDestination("/learning-intelligence/parent"), { reload: true, href: "/learning-intelligence/parent" });
  assert.deepEqual(switchDestination("/learning-intelligence/mock-exam/sitting"), { reload: false, href: "/dashboard" });
});

// ---------------------------------------------------------------- transport

test("every REST/RPC request made with an account JWT carries that account's ACTIVE learner (default: oldest)", async () => {
  const { calls, baseFetch } = fakeBackend({ [U1]: [{ id: L1, name: "Loni" }, { id: L2, name: "Sam" }] });
  const f = createLearnerAwareFetch({ restBase: REST, anonKey: "anon", baseFetch });
  await f(`${REST}/rpc/mock_start_attempt`, { method: "POST", headers: { authorization: `Bearer ${jwt(U1)}` } });
  const call = calls.find((c) => c.url.endsWith("/rpc/mock_start_attempt"))!;
  assert.equal(call.headers.get(LEARNER_HEADER), L1);
});

test("switching the active learner changes the header on the very next request (one authoritative context)", async () => {
  const { calls, baseFetch } = fakeBackend({ [U1]: [{ id: L1, name: "Loni" }, { id: L2, name: "Sam" }] });
  const f = createLearnerAwareFetch({ restBase: REST, anonKey: "anon", baseFetch });
  await f(`${REST}/rpc/a`, { headers: { authorization: `Bearer ${jwt(U1)}` } });
  assert.equal(setActiveLearner(L2), true);
  await f(`${REST}/rpc/b`, { headers: { authorization: `Bearer ${jwt(U1)}` } });
  assert.equal(calls.find((c) => c.url.endsWith("/rpc/a"))!.headers.get(LEARNER_HEADER), L1);
  assert.equal(calls.find((c) => c.url.endsWith("/rpc/b"))!.headers.get(LEARNER_HEADER), L2);
  assert.deepEqual(learnerRequestHeaders(), { [LEARNER_HEADER]: L2 });
});

test("a learner id the account does not own can never be activated", async () => {
  const { baseFetch } = fakeBackend({ [U1]: [{ id: L1, name: null }] });
  createLearnerAwareFetch({ restBase: REST, anonKey: "anon", baseFetch });
  await ensureLearnerContext(U1, jwt(U1));
  assert.equal(setActiveLearner(LB), false);
  assert.equal(getLearnerContextSnapshot().learnerId, L1);
});

test("sign out then sign in as a DIFFERENT account on the same device: the second account gets only its own learner, never the first's", async () => {
  const { calls, baseFetch } = fakeBackend({
    [U1]: [{ id: L1, name: "Loni" }, { id: L2, name: "Sam" }],
    [U2]: [{ id: LB, name: "Ada" }],
  });
  const f = createLearnerAwareFetch({ restBase: REST, anonKey: "anon", baseFetch });
  await f(`${REST}/rpc/one`, { headers: { authorization: `Bearer ${jwt(U1)}` } });
  setActiveLearner(L2);
  clearLearnerContext(); // sign-out
  await f(`${REST}/rpc/two`, { headers: { authorization: `Bearer ${jwt(U2)}` } });
  assert.equal(calls.find((c) => c.url.endsWith("/rpc/two"))!.headers.get(LEARNER_HEADER), LB);
  assert.equal(getLearnerContextSnapshot().uid, U2);
});

test("requests with no account JWT (anon key) and requests to other hosts are left untouched", async () => {
  const { calls, baseFetch } = fakeBackend({ [U1]: [{ id: L1, name: null }] });
  const f = createLearnerAwareFetch({ restBase: REST, anonKey: "anon", baseFetch });
  await f(`${REST}/questions`, { headers: { authorization: `Bearer ${jwt()}` } });
  await f("https://elsewhere.example/api", { headers: { authorization: `Bearer ${jwt(U1)}` } });
  for (const c of calls) assert.equal(c.headers.get(LEARNER_HEADER), null);
  assert.equal(calls.some((c) => c.url.includes("/profiles?")), false, "no learner list should be fetched for untouched requests");
});

test("a failed learner-list load is not cached and never guesses a learner (no header; the database fails closed)", async () => {
  let failing = true;
  const calls: string[] = [];
  const baseFetch: typeof fetch = async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    calls.push(url);
    if (url.includes("/profiles?")) return failing ? new Response("boom", { status: 500 }) : new Response(JSON.stringify([{ id: L1, learner_name: null, selected_pathway_id: null, created_at: "2026-01-01T00:00:00Z" }]), { status: 200 });
    return new Response("{}", { status: 200 });
  };
  const f = createLearnerAwareFetch({ restBase: REST, anonKey: "anon", baseFetch });
  await f(`${REST}/rpc/x`, { headers: { authorization: `Bearer ${jwt(U1)}` } });
  assert.equal(getLearnerContextSnapshot().learnerId, null);
  failing = false;
  await f(`${REST}/rpc/y`, { headers: { authorization: `Bearer ${jwt(U1)}` } });
  assert.equal(getLearnerContextSnapshot().learnerId, L1, "recovers on the next request");
});

// ---------------------------------------------------------------- per-learner browser state

test("learner-specific browser state is scoped per learner: no learner known -> no key (never the legacy device-wide key)", async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "k";
  assert.equal(learnerStorageKey("angel11plus_progress"), null);
  const { baseFetch } = fakeBackend({ [U1]: [{ id: L1, name: null }, { id: L2, name: null }] });
  createLearnerAwareFetch({ restBase: REST, anonKey: "anon", baseFetch });
  await ensureLearnerContext(U1, jwt(U1));
  assert.equal(learnerStorageKey("angel11plus_progress"), learnerScopedKey("angel11plus_progress", L1));
  setActiveLearner(L2);
  assert.equal(learnerStorageKey("angel11plus_progress"), learnerScopedKey("angel11plus_progress", L2));
});

test("without Supabase configured (local anonymous-only development) the plain key is used", () => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  assert.equal(learnerStorageKey("angel11plus_progress"), "angel11plus_progress");
});

test("SIBLING isolation in the browser: A1's XP/pathway/exam date never appear for A2, and switching back restores A1 exactly", async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "k";
  const ls = new FakeStorage();
  g.window = { localStorage: ls, sessionStorage: new FakeStorage() };
  g.localStorage = ls;
  const { baseFetch } = fakeBackend({ [U1]: [{ id: L1, name: "Loni" }, { id: L2, name: "Sam" }] });
  createLearnerAwareFetch({ restBase: REST, anonKey: "anon", baseFetch });
  await ensureLearnerContext(U1, jwt(U1));

  saveProgress({ ...getProgress(), xp: 250, streak: 6, selectedPathwayId: "csse", targetExamDate: "2027-09-15", schoolYear: "Year 5" });
  const a1 = getProgress();
  assert.equal(a1.xp, 250);

  setActiveLearner(L2);
  const a2 = getProgress();
  assert.equal(a2.xp, 0);
  assert.equal(a2.selectedPathwayId, undefined);
  assert.equal(a2.targetExamDate, undefined);
  saveProgress({ ...a2, xp: 10, selectedPathwayId: "gl" });

  setActiveLearner(L1);
  assert.deepEqual(getProgress(), a1);
  setActiveLearner(L2);
  assert.equal(getProgress().selectedPathwayId, "gl");
});

test("writes before the learner is known are skipped, never landing in another learner's or the legacy key", () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "k";
  const ls = new FakeStorage();
  g.window = { localStorage: ls, sessionStorage: new FakeStorage() };
  g.localStorage = ls;
  saveProgress({ ...getProgress(), xp: 999 });
  assert.equal(ls.length, 0);
});

// ---------------------------------------------------------------- legacy claim + reconcile

test("legacy device-wide state is CLAIMED (copied, never moved or deleted) by exactly one learner; a second learner never inherits it", () => {
  const s = new FakeStorage();
  s.setItem("angel11plus_progress", JSON.stringify({ xp: 99, completedLessons: ["l1"] }));
  s.setItem("angel11plus_migrated_v1", "1");
  s.setItem("angel11plus_mock_attempt_in_progress", JSON.stringify({ id: "m1" }));

  assert.equal(claimLegacyLocalState(s, L1), true);
  assert.equal(s.getItem(learnerScopedKey("angel11plus_progress", L1)), JSON.stringify({ xp: 99, completedLessons: ["l1"] }));
  // The "already pushed to the database" flag travels with the blob -> no duplicated lesson_progress rows.
  assert.equal(s.getItem(learnerScopedKey("angel11plus_migrated_v1", L1)), "1");
  assert.ok(s.getItem(learnerScopedKey("angel11plus_mock_attempt_in_progress", L1)));
  // Legacy keys untouched (reversible).
  assert.ok(s.getItem("angel11plus_progress"));

  assert.equal(claimLegacyLocalState(s, L2), false);
  assert.equal(s.getItem(learnerScopedKey("angel11plus_progress", L2)), null);
});

test("nothing to claim: no marker is set (a later real legacy blob is still claimable)", () => {
  const s = new FakeStorage();
  assert.equal(claimLegacyLocalState(s, L1), false);
  assert.equal(s.getItem("angel11plus_legacy_state_claimed_by"), null);
});

const freshLocal = (): LocalSetup => ({ xp: 0, streak: 1, completedLessons: [], lastActivity: "2026-01-01T00:00:00Z" });
const emptyServer = { selected_pathway_id: null, target_exam_date: null, target_exam_date_provenance: null, school_year: null } as const;

test("setup reconciliation: the database is authoritative for pathway, exam date and school year; local-only values are pushed up, not lost", () => {
  const local: LocalSetup = { ...freshLocal(), selectedPathwayId: "gl", targetExamDate: "2027-01-01", schoolYear: "Year 4" };
  const r = reconcileSetup(local, {
    selected_pathway_id: "csse", target_exam_date: null, target_exam_date_provenance: null, school_year: "Year 5",
  });
  assert.equal(r.local.selectedPathwayId, "csse");
  assert.equal(r.local.schoolYear, "Year 5");
  assert.deepEqual(r.push, { target_exam_date: "2027-01-01", target_exam_date_provenance: "unknown" });
  assert.equal(r.changedLocal, true);
});

test("setup reconciliation: a fresh device is seeded from the database XP/streak; a device with local progress is not overwritten", () => {
  const seeded = reconcileSetup(freshLocal(), { ...emptyServer, total_xp: 300, streak: 5, last_activity: "2026-09-01T00:00:00Z" });
  assert.equal(seeded.local.xp, 300);
  assert.equal(seeded.local.streak, 5);
  const kept = reconcileSetup({ ...freshLocal(), xp: 40, completedLessons: ["l1"] }, { ...emptyServer, total_xp: 300, streak: 5 });
  assert.equal(kept.local.xp, 40);
  assert.equal(kept.changedLocal, false);
});

test("setup reconciliation is idempotent: agreeing state changes nothing and pushes nothing", () => {
  const r = reconcileSetup(
    { ...freshLocal(), selectedPathwayId: "csse", schoolYear: "Year 5" },
    { selected_pathway_id: "csse", target_exam_date: null, target_exam_date_provenance: null, school_year: "Year 5" }
  );
  assert.equal(r.changedLocal, false);
  assert.equal(r.push, null);
});

// ---------------------------------------------------------------- server route forwarding

test("server routes forward the caller's active learner as a shape-checked hint; junk is dropped (the database still validates ownership)", () => {
  const req = (v: string | null) => ({ headers: { get: (n: string) => (n === LEARNER_HEADER ? v : null) } });
  assert.deepEqual(forwardedLearnerHeaders(req(L2)), { [LEARNER_HEADER]: L2 });
  assert.deepEqual(forwardedLearnerHeaders(req("'; drop table profiles;--")), {});
  assert.deepEqual(forwardedLearnerHeaders(req(null)), {});
});

test("every server route that forwards the caller's JWT also forwards the learner header, and every client caller sends it", async () => {
  const fs = await import("node:fs");
  for (const r of ["mock-manual-mark", "mock-reading-scoring", "mock-release-report", "mock-writing-assessment"]) {
    const src = fs.readFileSync(`app/api/${r}/route.ts`, "utf8");
    assert.match(src, /forwardedLearnerHeaders\(request\)/, `${r} must forward the learner header`);
  }
  for (const f of ["manualMarkRequest", "readingScoringRequest", "writingAssessmentRequest"]) {
    assert.match(fs.readFileSync(`lib/mockAttempt/${f}.ts`, "utf8"), /learnerRequestHeaders\(\)/, `${f} must send the learner header`);
  }
});
