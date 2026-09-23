/**
 * PRIVATE LEARNER SPACE -- Parent Mode / Learner Mode. A client-side
 * concept only (there is no "mode" row in the database -- see
 * ANGEL_11PLUS_PRIVATE_LEARNER_SPACE_DECISION_RECORD.md for why real
 * sibling-to-sibling data isolation cannot live here alone, and what does
 * enforce it: RegisteredAccountGate's parent-only route check, plus every
 * Learner Mode surface simply never fetching or linking to sibling data).
 *
 * Storage mirrors lib/learnerContext.ts's own active-learner pointer
 * exactly: session (per-tab) then local (per-device) storage, both scoped
 * to the signed-in account so the mode can never be inherited by a
 * different account signing in on the same shared device. Default is
 * always PARENT MODE -- nothing changes for any existing family until a
 * parent deliberately enters a learner's space.
 */

export type HouseholdMode = "parent" | "learner";

const POINTER_KEY = "angel_household_mode_v1";

export interface HouseholdModeState {
  uid: string | null;
  mode: HouseholdMode;
}

interface Pointer {
  u: string;
  m: HouseholdMode;
}

type PointerStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function parsePointer(raw: string | null): Pointer | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Partial<Pointer>;
    return typeof p.u === "string" && (p.m === "parent" || p.m === "learner") ? { u: p.u, m: p.m } : null;
  } catch {
    return null;
  }
}

/** Stored mode for `uid`. A pointer belonging to a different account is ignored -- never inherited. */
export function readModePointer(session: PointerStorage | null, local: PointerStorage | null, uid: string | null): HouseholdMode {
  if (!uid) return "parent";
  for (const store of [session, local]) {
    try {
      const p = parsePointer(store?.getItem(POINTER_KEY) ?? null);
      if (p && p.u === uid) return p.m;
    } catch {
      /* storage blocked */
    }
  }
  return "parent";
}

export function writeModePointer(session: PointerStorage | null, local: PointerStorage | null, uid: string, mode: HouseholdMode): void {
  const value = JSON.stringify({ u: uid, m: mode });
  for (const store of [session, local]) {
    try {
      store?.setItem(POINTER_KEY, value);
    } catch {
      /* storage blocked */
    }
  }
}

export function clearModePointer(session: PointerStorage | null, local: PointerStorage | null): void {
  for (const store of [session, local]) {
    try {
      store?.removeItem(POINTER_KEY);
    } catch {
      /* storage blocked */
    }
  }
}

// ---------------------------------------------------------------------
// Module state (same shape/pattern as lib/learnerContext.ts)
// ---------------------------------------------------------------------

let state: HouseholdModeState = { uid: null, mode: "parent" };
const listeners = new Set<() => void>();

export const SERVER_HOUSEHOLD_MODE: HouseholdModeState = { uid: null, mode: "parent" };

function setState(next: HouseholdModeState) {
  state = next;
  listeners.forEach((l) => l());
}

export function subscribeHouseholdMode(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getHouseholdModeSnapshot(): HouseholdModeState {
  return state;
}

function browserStores(): { session: Storage | null; local: Storage | null } {
  if (typeof window === "undefined") return { session: null, local: null };
  let session: Storage | null = null;
  let local: Storage | null = null;
  try { session = window.sessionStorage; } catch { /* blocked */ }
  try { local = window.localStorage; } catch { /* blocked */ }
  return { session, local };
}

/** Loads the mode for `uid` from storage into module state. Idempotent -- safe to call on every render/mount. */
export function ensureHouseholdMode(uid: string): HouseholdModeState {
  if (state.uid === uid) return state;
  const { session, local } = browserStores();
  const mode = readModePointer(session, local, uid);
  setState({ uid, mode });
  return state;
}

/**
 * Enter Learner Mode for a specific learner. Deliberately does NOT itself
 * navigate or switch the active learner -- callers (the "Enter learner
 * space" action) do that via the existing, unmodified setActiveLearner()
 * from lib/learnerContext.ts, then call this, then perform one full
 * navigation, matching the existing learner-switch pattern exactly (a full
 * reload so no in-memory state from Parent Mode can linger).
 */
export function enterLearnerMode(uid: string): void {
  const { session, local } = browserStores();
  writeModePointer(session, local, uid, "learner");
  setState({ uid, mode: "learner" });
}

/**
 * Return to Parent Mode. The caller (ParentModeGate) is solely responsible
 * for having already verified the household PIN via the server-side
 * verify_household_pin() RPC before calling this -- this function itself
 * performs no verification, matching lib/learnerContext.ts's own
 * separation of concerns (state store, not policy).
 */
export function returnToParentMode(uid: string): void {
  const { session, local } = browserStores();
  writeModePointer(session, local, uid, "parent");
  setState({ uid, mode: "parent" });
}

/** Sign-out: always resets to the safe default (Parent Mode) for whoever signs in next on this device/tab. */
export function clearHouseholdMode(): void {
  const { session, local } = browserStores();
  clearModePointer(session, local);
  setState({ uid: null, mode: "parent" });
}
