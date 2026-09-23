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
 * client-side concept paired with server-side route gating
 * (RegisteredAccountGate), not a claim of database-level sibling isolation.
 */
export function useHouseholdMode() {
  const { user } = useAuth();
  const uid = user && !user.is_anonymous ? user.id : null;
  const s = useSyncExternalStore(subscribeHouseholdMode, getHouseholdModeSnapshot, () => SERVER_HOUSEHOLD_MODE);

  useEffect(() => {
    if (uid) ensureHouseholdMode(uid);
  }, [uid]);

  const isLearnerMode = Boolean(uid) && s.uid === uid && s.mode === "learner";

  /**
   * Enter a specific learner's space. The caller (the Parent Dashboard's
   * "Enter learner space" action) is responsible for having already
   * confirmed a household PIN exists (household_pin_status()) before
   * offering this -- Learner Mode must never be reachable without a
   * working return gate already in place.
   */
  function enterLearnerSpace(learnerId: string) {
    if (!uid) return;
    setActiveLearner(learnerId);
    enterLearnerMode(uid);
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

  return { isLearnerMode, enterLearnerSpace, exitToParentMode, uid };
}
