/**
 * SUPERSEDED by migration 260 (multi-learner household model): a child's
 * first name / nickname now lives on the learner's own database record
 * (profiles.learner_name) and is read through the learner context. This
 * module remains ONLY to read the pre-260, browser-local name once so
 * lib/learnerActivation.ts can adopt it onto the learner (a parent never
 * has to retype it). The rest of this comment describes the pre-260 state.
 *
 * Child display name -- Family #1 onboarding correction.
 *
 * Verified architecture (see the Family #1 onboarding report): one
 * authenticated account owns exactly ONE learner profile
 * (profiles.auth_user_id is UNIQUE, migration 002), and the child's display
 * name has only ever been a local-only, optional label held in this
 * browser's localStorage (LR-01 data minimisation -- it is never sent to
 * Supabase and no server-side code reads it). This module keeps that
 * privacy position exactly: it adds no cloud storage and no new PII.
 *
 * What it fixes: the label used to live under ONE device-wide key, so a
 * second account signing in on the same device would silently inherit the
 * first account's child name -- the wrong child's name over the wrong
 * child's evidence. The name is now scoped to the signed-in account.
 *
 * Migration of genuine Family #1 data: the legacy device-wide key is never
 * deleted or rewritten. The FIRST permanent (non-anonymous) account to read
 * it claims it (copied into that account's scoped key, claim recorded), so
 * an existing name keeps showing for the parent who entered it and is never
 * shown to a different account afterwards. Anonymous sessions never claim
 * it, so a name entered before sign-in is still there for the parent.
 *
 * Pure with an injected Storage so the decisions are directly testable
 * (this repository's suite has no DOM harness).
 */

export const LEGACY_CHILD_NAME_KEY = "angel_child_name";
const SCOPED_PREFIX = "angel_child_name:";
const LEGACY_CLAIM_KEY = "angel_child_name_legacy_claimed_by";
export const CHILD_NAME_MAX_LENGTH = 40;

export interface ChildNameOwner {
  /** Signed-in account id, or null when no auth identity exists at all. */
  id: string | null;
  /** True only for a real (non-anonymous) account. */
  isPermanent: boolean;
}

type NameStorage = Pick<Storage, "getItem" | "setItem">;

export function normaliseChildName(raw: string): string | null {
  const cleaned = raw.replace(/\s+/g, " ").trim().slice(0, CHILD_NAME_MAX_LENGTH).trim();
  return cleaned ? cleaned : null;
}

function scopedKey(owner: ChildNameOwner): string {
  return owner.id ? `${SCOPED_PREFIX}${owner.id}` : LEGACY_CHILD_NAME_KEY;
}

export function readChildName(storage: NameStorage, owner: ChildNameOwner): string | null {
  try {
    const key = scopedKey(owner);
    const scoped = storage.getItem(key);
    if (scoped) return scoped;
    // No auth identity at all: the legacy key IS this device's only name.
    if (!owner.id) return null;

    if (!owner.isPermanent) return null;
    const legacy = storage.getItem(LEGACY_CHILD_NAME_KEY);
    if (!legacy) return null;
    const claimedBy = storage.getItem(LEGACY_CLAIM_KEY);
    if (claimedBy && claimedBy !== owner.id) return null;

    storage.setItem(key, legacy);
    storage.setItem(LEGACY_CLAIM_KEY, owner.id);
    return legacy;
  } catch {
    return null;
  }
}

/** Returns the saved (normalised) name, or null if nothing valid was saved. */
export function saveChildName(storage: NameStorage, owner: ChildNameOwner, raw: string): string | null {
  const name = normaliseChildName(raw);
  if (!name) return null;
  try {
    storage.setItem(scopedKey(owner), name);
    return name;
  } catch {
    return null;
  }
}
