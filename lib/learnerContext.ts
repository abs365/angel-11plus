/**
 * ONE authoritative active-learner context (Wave 0 multi-learner
 * architecture, migration 260). One parent/family account owns N learners
 * (`profiles` rows). Every surface -- Today, Learn, Practice, Mock,
 * Progress, Placement, Recommended Focus, Parent Dashboard, Writing --
 * resolves "which child" through THIS module only; no page keeps its own
 * child selector.
 *
 * How the choice reaches the database: every Supabase REST/RPC request
 * from the browser carries the header `x-angel-learner-id`. The database
 * (public.current_learner_id()) VALIDATES that the id belongs to the
 * authenticated account and raises otherwise -- the browser is never
 * trusted, and a bad/foreign id never falls back to a different learner.
 *
 * Where the choice is remembered (device/UI preference only -- learner
 * identity itself lives in the database):
 *   - sessionStorage: per-TAB, so two tabs can show two children without
 *     flipping each other;
 *   - localStorage: the last child used on this device, used for new tabs.
 * The pointer records the account it belongs to and is ignored unless the
 * signed-in account matches, so signing out/in as someone else on a shared
 * device can never inherit another account's learner.
 *
 * Learner-specific browser state (progress, in-progress Mock) is stored
 * under keys scoped by learner id (learnerStorageKey), never one
 * device-wide key.
 */

import { getHouseholdModeSnapshot } from "@/lib/householdMode";

export const LEARNER_HEADER = "x-angel-learner-id";
/** PRIVATE LEARNER SPACE, Part 2 (migration 263): the learner-PIN session token, when one is active for the current Learner Mode session (lib/householdMode.ts). */
export const LEARNER_TOKEN_HEADER = "x-angel-learner-token";
const POINTER_KEY = "angel_active_learner_v2";

export interface LearnerSummary {
  id: string;
  name: string | null;
  pathway: string | null;
  createdAt: string;
}

export interface LearnerContextState {
  /** Account the context was loaded for. */
  uid: string | null;
  learnerId: string | null;
  learners: LearnerSummary[];
  status: "idle" | "loading" | "ready";
}

// ---------------------------------------------------------------------
// Pure helpers (directly unit-tested)
// ---------------------------------------------------------------------

/** `sub` claim of a Bearer JWT, or null. Never validates -- routing only; the database validates. */
export function jwtSubject(authorization: string | null | undefined): string | null {
  if (!authorization) return null;
  const token = authorization.replace(/^Bearer\s+/i, "");
  const part = token.split(".")[1];
  if (!part) return null;
  try {
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "="));
    const sub = (JSON.parse(json) as { sub?: unknown }).sub;
    return typeof sub === "string" && sub ? sub : null;
  } catch {
    return null;
  }
}

/** The stored choice if that learner still belongs to the account; otherwise the account's oldest learner. */
export function chooseActiveLearner(learners: readonly { id: string }[], storedId: string | null): string | null {
  if (learners.length === 0) return null;
  if (storedId && learners.some((l) => l.id === storedId)) return storedId;
  return learners[0].id;
}

export function learnerScopedKey(base: string, learnerId: string): string {
  return `${base}:${learnerId}`;
}

type PointerStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

interface Pointer {
  u: string;
  l: string;
}

function parsePointer(raw: string | null): Pointer | null {
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as Partial<Pointer>;
    return typeof p.u === "string" && typeof p.l === "string" ? { u: p.u, l: p.l } : null;
  } catch {
    return null;
  }
}

/**
 * Stored active learner for `uid`. Tab (session) choice first, then the
 * device's last choice. A pointer that belongs to a different account is
 * ignored -- never inherited.
 */
export function readActivePointer(
  session: PointerStorage | null,
  local: PointerStorage | null,
  uid: string | null
): string | null {
  if (!uid) return null;
  for (const store of [session, local]) {
    try {
      const p = parsePointer(store?.getItem(POINTER_KEY) ?? null);
      if (p && p.u === uid) return p.l;
    } catch {
      /* storage blocked */
    }
  }
  return null;
}

export function writeActivePointer(
  session: PointerStorage | null,
  local: PointerStorage | null,
  uid: string,
  learnerId: string
): void {
  const value = JSON.stringify({ u: uid, l: learnerId });
  for (const store of [session, local]) {
    try {
      store?.setItem(POINTER_KEY, value);
    } catch {
      /* storage blocked */
    }
  }
}

export function clearActivePointer(session: PointerStorage | null, local: PointerStorage | null): void {
  for (const store of [session, local]) {
    try {
      store?.removeItem(POINTER_KEY);
    } catch {
      /* storage blocked */
    }
  }
}

/** Synchronous best-effort account id from supabase-js's persisted session (`sb-*-auth-token`). */
export function findPersistedSessionUserId(local: (Pick<Storage, "getItem" | "key"> & { length: number }) | null): string | null {
  if (!local) return null;
  try {
    for (let i = 0; i < local.length; i++) {
      const k = local.key(i);
      if (k && /^sb-.+-auth-token$/.test(k)) {
        const parsed = JSON.parse(local.getItem(k) ?? "null") as { user?: { id?: unknown } } | null;
        const id = parsed?.user?.id;
        if (typeof id === "string" && id) return id;
      }
    }
  } catch {
    /* unreadable */
  }
  return null;
}

// ---------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------

const initialState: LearnerContextState = { uid: null, learnerId: null, learners: [], status: "idle" };
let state: LearnerContextState = initialState;
const listeners = new Set<() => void>();
const pending = new Map<string, Promise<LearnerContextState>>();

function setState(next: LearnerContextState) {
  state = next;
  listeners.forEach((l) => l());
}

export function subscribeLearnerContext(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getLearnerContextSnapshot(): LearnerContextState {
  return state;
}

export const SERVER_LEARNER_CONTEXT: LearnerContextState = initialState;

function browserStores(): { session: Storage | null; local: Storage | null } {
  if (typeof window === "undefined") return { session: null, local: null };
  let session: Storage | null = null;
  let local: Storage | null = null;
  try { session = window.sessionStorage; } catch { /* blocked */ }
  try { local = window.localStorage; } catch { /* blocked */ }
  return { session, local };
}

function supabaseEnvConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

/**
 * Synchronously known active learner id, or null. Used by storage-key
 * scoping (progress, Mock in-progress), which must resolve at first paint.
 */
export function getActiveLearnerIdSync(): string | null {
  if (state.uid && state.learnerId) return state.learnerId;
  const { session, local } = browserStores();
  return readActivePointer(session, local, findPersistedSessionUserId(local as never));
}

/**
 * Storage key for learner-specific browser state. When Supabase is not
 * configured at all (local anonymous-only development) there are no
 * learners and the plain key is used. When configured but the learner is
 * not yet known, returns null: callers must read defaults / skip writes
 * rather than touch another learner's (or the legacy device-wide) data.
 */
export function learnerStorageKey(base: string): string | null {
  if (!supabaseEnvConfigured()) return base;
  const id = getActiveLearnerIdSync();
  return id ? learnerScopedKey(base, id) : null;
}

// ---------------------------------------------------------------------
// Loading the learner list (never through the header-adding transport)
// ---------------------------------------------------------------------

export interface LearnerTransportConfig {
  restBase: string; // https://<ref>.supabase.co/rest/v1
  anonKey: string;
  baseFetch: typeof fetch;
}

let transport: LearnerTransportConfig | null = null;

export function configureLearnerTransport(config: LearnerTransportConfig): void {
  transport = config;
}

interface ProfileRow {
  id: string;
  learner_name: string | null;
  selected_pathway_id: string | null;
  created_at: string;
}

/**
 * PRIVATE LEARNER SPACE -- `restrictToId` narrows the query to exactly one
 * learner row. Used only while a household is in Learner Mode (see
 * ensureLearnerContext below): without it, every request that needs the
 * active-learner header re-fetches EVERY sibling's id and name, regardless
 * of mode -- the switcher UI is hidden in Learner Mode, but the underlying
 * network response was not, until this. Reduces what a Learner Mode
 * session's own network traffic ever contains; it does not and cannot
 * change what the account's own JWT is entitled to request directly (see
 * ANGEL_11PLUS_PRIVATE_LEARNER_SPACE_DECISION_RECORD.md's disclosed
 * boundary) -- this is a real reduction in exposure through the product's
 * own code, not a claim of new database-level enforcement.
 */
async function fetchLearners(uid: string, accessToken: string, restrictToId?: string | null): Promise<LearnerSummary[]> {
  if (!transport) return [];
  let url =
    `${transport.restBase}/profiles?select=id,learner_name,selected_pathway_id,created_at` +
    `&auth_user_id=eq.${encodeURIComponent(uid)}&order=created_at.asc,id.asc`;
  if (restrictToId) url += `&id=eq.${encodeURIComponent(restrictToId)}`;
  const res = await transport.baseFetch(url, {
    headers: { apikey: transport.anonKey, Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`learner list failed: ${res.status}`);
  const rows = (await res.json()) as ProfileRow[];
  return rows.map((r) => ({ id: r.id, name: r.learner_name, pathway: r.selected_pathway_id, createdAt: r.created_at }));
}

/**
 * Ensures the context is loaded for this account and returns it.
 * Concurrent callers share one load. A failed load is not cached.
 */
export function ensureLearnerContext(uid: string, accessToken: string): Promise<LearnerContextState> {
  if (state.uid === uid && state.status === "ready") return Promise.resolve(state);
  const inflight = pending.get(uid);
  if (inflight) return inflight;

  if (state.uid !== uid) setState({ uid, learnerId: null, learners: [], status: "loading" });

  const p = (async () => {
    try {
      const { session, local } = browserStores();
      // PRIVATE LEARNER SPACE: while locked into a specific learner's space,
      // only that learner's own row is ever requested -- see fetchLearners()'s
      // own comment for exactly what this does and does not guarantee.
      const householdMode = getHouseholdModeSnapshot();
      const pinnedLearnerId =
        householdMode.uid === uid && householdMode.mode === "learner" ? readActivePointer(session, local, uid) : null;
      const learners = await fetchLearners(uid, accessToken, pinnedLearnerId);
      const chosen = chooseActiveLearner(learners, readActivePointer(session, local, uid));
      if (chosen) writeActivePointer(session, local, uid, chosen);
      setState({ uid, learnerId: chosen, learners, status: "ready" });
    } catch {
      // Not cached: the next request retries. With no header the database
      // fails closed for multi-learner accounts, never guessing a learner.
      setState({ uid, learnerId: null, learners: [], status: "idle" });
    } finally {
      pending.delete(uid);
    }
    return state;
  })();
  pending.set(uid, p);
  return p;
}

/** Reload the list (after adding/renaming a learner). */
export function refreshLearnerContext(uid: string, accessToken: string): Promise<LearnerContextState> {
  pending.delete(uid);
  if (state.uid === uid && state.status === "ready") setState({ ...state, status: "idle" });
  return ensureLearnerContext(uid, accessToken);
}

/** Switch the active learner. Ownership is re-validated by the database on every request. */
export function setActiveLearner(learnerId: string): boolean {
  if (!state.uid || !state.learners.some((l) => l.id === learnerId)) return false;
  const { session, local } = browserStores();
  writeActivePointer(session, local, state.uid, learnerId);
  setState({ ...state, learnerId });
  return true;
}

/** Optimistic in-memory update (the database write follows); every consumer re-renders. */
export function updateLearnerLocally(learnerId: string, patch: Partial<Pick<LearnerSummary, "name" | "pathway">>): void {
  if (!state.learners.some((l) => l.id === learnerId)) return;
  setState({ ...state, learners: state.learners.map((l) => (l.id === learnerId ? { ...l, ...patch } : l)) });
}

/**
 * Sign-out: drop the in-memory context. The stored pointer is deliberately
 * kept -- it names its account and is ignored for anyone else, so it can
 * never be inherited, and it lets a parent return to the child they last used.
 */
export function clearLearnerContext(): void {
  pending.clear();
  setState(initialState);
}

/** Headers a same-origin API call must forward so server routes act for the same learner. */
export function learnerRequestHeaders(): Record<string, string> {
  const id = state.uid && state.learnerId ? state.learnerId : getActiveLearnerIdSync();
  if (!id) return {};
  const headers: Record<string, string> = { [LEARNER_HEADER]: id };
  const hh = getHouseholdModeSnapshot();
  if (hh.uid && hh.mode === "learner" && hh.learnerToken) headers[LEARNER_TOKEN_HEADER] = hh.learnerToken;
  return headers;
}

/**
 * Wraps fetch for the Supabase client: REST/RPC requests made with an
 * account JWT are sent with the validated active-learner header, after the
 * learner context has loaded for that account.
 */
export function createLearnerAwareFetch(config: LearnerTransportConfig): typeof fetch {
  configureLearnerTransport(config);
  return async (input, init) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (!url.startsWith(config.restBase)) return config.baseFetch(input, init);

    const headers = new Headers(init?.headers ?? (typeof input === "object" && "headers" in input ? input.headers : undefined));
    const authorization = headers.get("authorization");
    const uid = jwtSubject(authorization);
    if (!uid || !authorization) return config.baseFetch(input, init);

    const ctx = await ensureLearnerContext(uid, authorization.replace(/^Bearer\s+/i, ""));
    if (ctx.uid === uid && ctx.learnerId) {
      headers.set(LEARNER_HEADER, ctx.learnerId);
      const hh = getHouseholdModeSnapshot();
      if (hh.uid === uid && hh.mode === "learner" && hh.learnerToken) headers.set(LEARNER_TOKEN_HEADER, hh.learnerToken);
    }
    if (typeof input === "object" && !(input instanceof URL)) {
      return config.baseFetch(new Request(input, { ...init, headers }));
    }
    return config.baseFetch(input, { ...init, headers });
  };
}
