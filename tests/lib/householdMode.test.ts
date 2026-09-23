import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  SERVER_HOUSEHOLD_MODE,
  clearHouseholdMode,
  clearModePointer,
  ensureHouseholdMode,
  enterLearnerMode,
  getHouseholdModeSnapshot,
  readModePointer,
  returnToParentMode,
  writeModePointer,
} from "@/lib/householdMode";

/**
 * PRIVATE LEARNER SPACE -- Parent Mode / Learner Mode client state. No DOM
 * harness exists in this repository (see tests/lib/learnerContext.test.ts's
 * own note), so browser storage is a minimal fake, matching that file's
 * established pattern exactly.
 */

const U1 = "11111111-1111-4111-8111-111111111111";
const U2 = "22222222-2222-4222-8222-222222222222";

class FakeStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, v); }
  removeItem(k: string) { this.m.delete(k); }
}

beforeEach(() => {
  clearHouseholdMode();
});

test("default mode is always parent, for an unknown account and with no stored pointer", () => {
  const session = new FakeStorage();
  const local = new FakeStorage();
  assert.equal(readModePointer(session, local, U1), "parent");
  assert.equal(readModePointer(null, null, U1), "parent");
  assert.equal(readModePointer(session, local, null), "parent");
});

test("writeModePointer then readModePointer round-trips for the same account", () => {
  const session = new FakeStorage();
  const local = new FakeStorage();
  writeModePointer(session, local, U1, "learner");
  assert.equal(readModePointer(session, local, U1), "learner");
});

test("a mode pointer belonging to a different account is never inherited -- reads back as parent (the safe default)", () => {
  const session = new FakeStorage();
  const local = new FakeStorage();
  writeModePointer(session, local, U1, "learner");
  // A different account signs in on the same shared device/tab.
  assert.equal(readModePointer(session, local, U2), "parent");
});

test("session (per-tab) pointer takes precedence over local (per-device) when both are set for the same account", () => {
  const session = new FakeStorage();
  const local = new FakeStorage();
  writeModePointer(null, local, U1, "learner");
  assert.equal(readModePointer(session, local, U1), "learner", "local alone should still resolve");
  writeModePointer(session, null, U1, "parent");
  assert.equal(readModePointer(session, local, U1), "parent", "session pointer must win over a stale local one");
});

test("clearModePointer removes the pointer from both stores", () => {
  const session = new FakeStorage();
  const local = new FakeStorage();
  writeModePointer(session, local, U1, "learner");
  clearModePointer(session, local);
  assert.equal(readModePointer(session, local, U1), "parent");
});

test("a malformed stored pointer is ignored, not thrown", () => {
  const session = new FakeStorage();
  session.setItem("angel_household_mode_v1", "{not json");
  assert.equal(readModePointer(session, null, U1), "parent");

  const local2 = new FakeStorage();
  local2.setItem("angel_household_mode_v1", JSON.stringify({ u: U1, m: "not-a-real-mode" }));
  assert.equal(readModePointer(null, local2, U1), "parent");
});

test("module state: ensureHouseholdMode/enterLearnerMode/returnToParentMode/clearHouseholdMode drive getHouseholdModeSnapshot()", () => {
  assert.deepEqual(getHouseholdModeSnapshot(), SERVER_HOUSEHOLD_MODE);

  ensureHouseholdMode(U1);
  assert.equal(getHouseholdModeSnapshot().mode, "parent");
  assert.equal(getHouseholdModeSnapshot().uid, U1);

  enterLearnerMode(U1);
  assert.equal(getHouseholdModeSnapshot().mode, "learner");

  returnToParentMode(U1);
  assert.equal(getHouseholdModeSnapshot().mode, "parent");

  clearHouseholdMode();
  assert.equal(getHouseholdModeSnapshot().uid, null);
  assert.equal(getHouseholdModeSnapshot().mode, "parent");
});
