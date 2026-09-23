/**
 * PRIVATE LEARNER SPACE -- Parent Mode / Learner Mode. A client-side
 * concept only (there is no "mode" row in the database -- see
 * ANGEL_11PLUS_PRIVATE_LEARNER_SPACE_DECISION_RECORD.md for why real
 * sibling-to-sibling data isolation cannot live here alone, and what does
 * enforce it: RegisteredAccountGate's parent-only route check, every
 * Learner Mode surface simply never fetching or linking to sibling data,
 * and -- Part 2 -- the learner-PIN session token below, which IS enforced
 * server-side by current_learner_id() (migration 263), not merely a
 * client-side gate).
 *
 * Storage mirrors lib/learnerContext.ts's own active-learner pointer
 * exactly: session (per-tab) then local (per-device) storage, both scoped
 * to the signed-in account so the mode can never be inherited by a
 * different account signing in on the same shared device. Default is
 * always PARENT MODE -- nothing changes for any existing family until a
 * parent deliberately enters a learner's space.
 *
 * The learner-PIN session token is stored SEPARATELY and SESSION-ONLY
 * (never localStorage): closing the tab always requires the learner's PIN
 * again next time, even though the MODE pointer itself may still say
 * "learner" in a freshly opened tab on the same device -- a real security
 * property (a tab left open is one thing; a token surviving a full browser
 * restart on a shared family device is another), and it is also the
 * SERVER's own enforcement boundary (an expired/absent token is refused by
 * current_learner_id(), not merely hidden by the UI).
 */

export type HouseholdMode = "parent" | "learner";

const MODE_POINTER_KEY = "angel_household_mode_v1";
const TOKEN_POINTER_KEY = "angel_learner_pin_token_v1";

export interface HouseholdModeState {
  uid: string | null;
  mode: HouseholdMode;
  /** The current learner-PIN session token, if any -- see the file header. Only meaningful when mode === "learner". */
  learnerToken: string | null;
}

interface ModePointer {
  u: string;
  m: HouseholdMode;
}

interface TokenPointer {
  u: string;
  t: string;
}

type PointerStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function parseModePointer(raw: string | null): ModePointer | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Partial<ModePointer>;
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
      const p = parseModePointer(store?.getItem(MODE_POINTER_KEY) ?? null);
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
      store?.setItem(MODE_POINTER_KEY, value);
    } catch {
      /* storage blocked */
    }
  }
}

export function clearModePointer(session: PointerStorage | null, local: PointerStorage | null): void {
  for (const store of [session, local]) {
    try {
      store?.removeItem(MODE_POINTER_KEY);
    } catch {
      /* storage blocked */
    }
  }
}

function parseTokenPointer(raw: string | null): TokenPointer | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Partial<TokenPointer>;
    return typeof p.u === "string" && typeof p.t === "string" && p.t ? { u: p.u, t: p.t } : null;
  } catch {
    return null;
  }
}

/** Session-only (per-tab). See the file header for why this never touches localStorage. */
export function readTokenPointer(session: PointerStorage | null, uid: string | null): string | null {
  if (!uid) return null;
  try {
    const p = parseTokenPointer(session?.getItem(TOKEN_POINTER_KEY) ?? null);
    return p && p.u === uid ? p.t : null;
  } catch {
    return null;
  }
}

export function writeTokenPointer(session: PointerStorage | null, uid: string, token: string): void {
  try {
    session?.setItem(TOKEN_POINTER_KEY, JSON.stringify({ u: uid, t: token }));
  } catch {
    /* storage blocked */
  }
}

export function clearTokenPointer(session: PointerStorage | null): void {
  try {
    session?.removeItem(TOKEN_POINTER_KEY);
  } catch {
    /* storage blocked */
  }
}

// ---------------------------------------------------------------------
// Module state (same shape/pattern as lib/learnerContext.ts)
// ---------------------------------------------------------------------

let state: HouseholdModeState = { uid: null, mode: "parent", learnerToken: null };
const listeners = new Set<() => void>();

export const SERVER_HOUSEHOLD_MODE: HouseholdModeState = { uid: null, mode: "parent", learnerToken: null };

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

/** Loads the mode (and, if present, the learner-PIN token) for `uid` from storage into module state. Idempotent -- safe to call on every render/mount. */
export function ensureHouseholdMode(uid: string): HouseholdModeState {
  if (state.uid === uid) return state;
  const { session, local } = browserStores();
  const mode = readModePointer(session, local, uid);
  const learnerToken = mode === "learner" ? readTokenPointer(session, uid) : null;
  setState({ uid, mode, learnerToken });
  return state;
}

/**
 * Enter Learner Mode for a specific learner, with the session token minted
 * by a successful verify_learner_pin() call. Deliberately does NOT itself
 * navigate or switch the active learner -- callers (the "Enter learner
 * space" action) do that via the existing, unmodified setActiveLearner()
 * from lib/learnerContext.ts, then call this, then perform one full
 * navigation, matching the existing learner-switch pattern exactly (a full
 * reload so no in-memory state from Parent Mode can linger).
 */
export function enterLearnerMode(uid: string, learnerToken: string): void {
  const { session, local } = browserStores();
  writeModePointer(session, local, uid, "learner");
  writeTokenPointer(session, uid, learnerToken);
  setState({ uid, mode: "learner", learnerToken });
}

/**
 * Return to Parent Mode. The caller (ParentPinModal, mode "verify") is
 * solely responsible for having already verified the household PIN via the
 * server-side verify_household_pin() RPC before calling this -- this
 * function itself performs no verification, matching lib/learnerContext.ts's
 * own separation of concerns (state store, not policy). Always clears the
 * learner-PIN token: leaving a learner's space ends that verified session.
 */
export function returnToParentMode(uid: string): void {
  const { session, local } = browserStores();
  writeModePointer(session, local, uid, "parent");
  clearTokenPointer(session);
  setState({ uid, mode: "parent", learnerToken: null });
}

/** Sign-out: always resets to the safe default (Parent Mode) for whoever signs in next on this device/tab. */
export function clearHouseholdMode(): void {
  const { session, local } = browserStores();
  clearModePointer(session, local);
  clearTokenPointer(session);
  setState({ uid: null, mode: "parent", learnerToken: null });
}
