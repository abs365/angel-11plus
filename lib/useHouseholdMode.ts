"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  SERVER_HOUSEHOLD_MODE,
  ensureHouseholdMode,
  getHouseholdModeSnapshot,
  subscribeHouseholdMode,
  enterLearnerMode,
  returnToParentMode,
} from "@/lib/householdMode";
import { setActiveLearner } from "@/lib/learnerContext";

/**
 * The one hook every surface uses to know "Parent Mode or Learner Mode".
 * See lib/householdMode.ts for the storage model and
 * ANGEL_11PLUS_PRIVATE_LEARNER_SPACE_DECISION_RECORD.md for why this is a
 * client-side concept paired with server-side enforcement -- the parent-
 * only route gate (RegisteredAccountGate) and, since Part 2, the learner-
 * PIN session token current_learner_id() itself validates (migration 263).
 */
export function useHouseholdMode() {
  const { user } = useAuth();
  const uid = user && !user.is_anonymous ? user.id : null;
  const s = useSyncExternalStore(subscribeHouseholdMode, getHouseholdModeSnapshot, () => SERVER_HOUSEHOLD_MODE);

  useEffect(() => {
    if (uid) ensureHouseholdMode(uid);
  }, [uid]);

  const isLearnerMode = Boolean(uid) && s.uid === uid && s.mode === "learner";
  // True once a learner's PIN has genuinely been verified this tab session
  // (see lib/householdMode.ts's own header for why this is session-only).
  // A false value while isLearnerMode is true means the mode pointer says
  // "learner" (e.g. a freshly opened tab on the same device) but no token
  // has been verified here yet -- callers should prompt for the learner's
  // PIN again rather than assume access, matching how the server itself
  // (current_learner_id()) would refuse the same request.
  const hasLearnerToken = isLearnerMode && Boolean(s.learnerToken);

  /**
   * Enter a specific learner's space. The caller (Header's account menu or
   * the Parent Dashboard's "Enter learner space" action) is responsible for
   * having already obtained a valid session token from a successful
   * verify_learner_pin() call -- this function stores it, it does not
   * verify anything itself.
   */
  function enterLearnerSpace(learnerId: string, learnerToken: string) {
    if (!uid) return;
    setActiveLearner(learnerId);
    enterLearnerMode(uid, learnerToken);
    window.location.assign("/dashboard");
  }

  /**
   * Return to Parent Mode. The caller (ParentPinModal, in "verify" mode) is
   * solely responsible for having already received ok:true from the
   * verify_household_pin() RPC before calling this.
   */
  function exitToParentMode() {
    if (!uid) return;
    returnToParentMode(uid);
    window.location.assign("/learning-intelligence/parent");
  }

  return { isLearnerMode, hasLearnerToken, enterLearnerSpace, exitToParentMode, uid };
}
