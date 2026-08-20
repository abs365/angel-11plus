import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveGateAccess } from "../../lib/accessControl";

/**
 * Gate 001 / Decision 130 LR-3 — Founder-Validation Route Protection.
 *
 * Proves the exact boundary FounderOnlyGate enforces on
 * app/learning-intelligence/founder-validation/csse and /family-choice:
 * an ordinary (including anonymous/guest) family must never resolve to
 * "admin", only a signed-in account for which is_current_user_admin()
 * (migration 008) returns true may.
 */

test("resolveGateAccess: auth still loading -> checking, regardless of user/isAdmin", () => {
  assert.equal(resolveGateAccess(true, null, null), "checking");
  assert.equal(resolveGateAccess(true, { id: "u1" }, true), "checking");
});

test("resolveGateAccess: no user (including a guest with no session yet) -> not-signed-in", () => {
  assert.equal(resolveGateAccess(false, null, null), "not-signed-in");
});

test("resolveGateAccess: signed-in (or anonymous-bootstrapped) user, admin check pending -> checking", () => {
  assert.equal(resolveGateAccess(false, { id: "u1" }, null), "checking");
});

test("resolveGateAccess: signed-in user, is_current_user_admin() false -> not-admin (ordinary family blocked)", () => {
  assert.equal(resolveGateAccess(false, { id: "u1" }, false), "not-admin");
});

test("resolveGateAccess: signed-in user, is_current_user_admin() true -> admin (only founder reaches route content)", () => {
  assert.equal(resolveGateAccess(false, { id: "u1" }, true), "admin");
});
