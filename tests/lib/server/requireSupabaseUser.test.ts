import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { requireSupabaseUser, type VerifyToken } from "@/lib/server/requireSupabaseUser";

/**
 * Access-control investigation 2026-09-21: /api/writing-feedback (a route that spends money on a third-party model)
 * accepted requests with NO authentication. It now demands a real Supabase session, verified against Supabase Auth,
 * and fails closed. The Mock routes already did this; nothing about them changes.
 */

const accept: VerifyToken = async (token) => ({ user: { id: `user-for-${token}`, is_anonymous: token === "anon" }, error: null });
const reject: VerifyToken = async () => ({ user: null, error: { message: "invalid JWT" } });
const explode: VerifyToken = async () => { throw new Error("network down"); };

test("no Authorization header, an empty one, or a non-Bearer one is refused with 401 and never reaches verification", async () => {
  let called = 0;
  const spy: VerifyToken = async (t) => { called++; return accept(t); };
  for (const h of [null, undefined, "", "   ", "Basic abc", "Bearer", "Bearer ", "token-without-scheme"]) {
    const r = await requireSupabaseUser(h as string | null | undefined, spy);
    assert.deepEqual(r, { ok: false, status: 401, error: "unauthenticated" }, `header: ${String(h)}`);
  }
  assert.equal(called, 0);
});

test("a token Supabase rejects (forged, expired, or the public anon KEY used as a bearer) is refused with 401", async () => {
  assert.deepEqual(await requireSupabaseUser("Bearer forged.jwt.token", reject), { ok: false, status: 401, error: "unauthenticated" });
  assert.deepEqual(await requireSupabaseUser("Bearer eyJhbGciOi.public-anon-key.sig", reject), { ok: false, status: 401, error: "unauthenticated" });
});

test("a verification failure of any kind fails CLOSED (401), never open", async () => {
  assert.deepEqual(await requireSupabaseUser("Bearer abc", explode), { ok: false, status: 401, error: "unauthenticated" });
  const noUser: VerifyToken = async () => ({ user: null, error: null });
  assert.deepEqual(await requireSupabaseUser("Bearer abc", noUser), { ok: false, status: 401, error: "unauthenticated" });
});

test("missing server configuration fails closed with 503, never open", async () => {
  assert.deepEqual(await requireSupabaseUser("Bearer abc", null), {
    ok: false, status: 503, error: "Smart feedback is temporarily unavailable.",
  });
});

test("a real session (permanent OR the anonymous session every visitor holds) is accepted, and identified", async () => {
  assert.deepEqual(await requireSupabaseUser("Bearer realtoken", accept), { ok: true, userId: "user-for-realtoken", isAnonymous: false });
  assert.deepEqual(await requireSupabaseUser("bearer  anon ", accept), { ok: true, userId: "user-for-anon", isAnonymous: true });
});

test("the verifier never echoes or stores the token in its result", async () => {
  const fixedUser: VerifyToken = async () => ({ user: { id: "user-1", is_anonymous: false }, error: null });
  const r = await requireSupabaseUser("Bearer super-secret-token-value", fixedUser);
  assert.doesNotMatch(JSON.stringify(r), /super-secret-token-value/);
});

test("the writing-feedback route checks access FIRST: before the API-key check, body parsing, and any call to the model", () => {
  const src = fs.readFileSync("app/api/writing-feedback/route.ts", "utf8");
  const gate = src.indexOf("requireSupabaseUser(request.headers.get(\"authorization\"))");
  assert.ok(gate > -1, "route must call requireSupabaseUser");
  assert.ok(gate < src.indexOf("process.env.OPENAI_API_KEY"), "auth before reading the model key");
  assert.ok(gate < src.indexOf("await request.json()"), "auth before parsing the body");
  assert.ok(gate < src.indexOf("https://api.openai.com"), "auth before any model call");
  assert.match(src, /if \(!caller\.ok\) return NextResponse\.json\(\{ error: caller\.error \}, \{ status: caller\.status \}\);/);
});

test("the one client caller sends the session token and turns a 401 into a friendly message", () => {
  const page = fs.readFileSync("app/learning-intelligence/practice/[area]/page.tsx", "utf8");
  assert.match(page, /\(await sessionClient\.auth\.getSession\(\)\)\.data\.session\?\.access_token/);
  assert.match(page, /Authorization: `Bearer \$\{accessToken\}`/);
  assert.match(page, /res\.status === 401\s*\n\s*\? "Please refresh the page and try again\."/);
});

test("the four Mock routes still demand an Authorization header (unchanged, already correct)", () => {
  for (const r of ["mock-manual-mark", "mock-reading-scoring", "mock-release-report", "mock-writing-assessment"]) {
    assert.match(fs.readFileSync(`app/api/${r}/route.ts`, "utf8"), /request\.headers\.get\("authorization"\)/, r);
  }
});
