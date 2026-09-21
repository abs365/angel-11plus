"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import {
  SERVER_LEARNER_CONTEXT,
  getLearnerContextSnapshot,
  refreshLearnerContext,
  setActiveLearner,
  subscribeLearnerContext,
  updateLearnerLocally,
  type LearnerSummary,
} from "@/lib/learnerContext";
import { normaliseChildName } from "@/lib/childProfile";

/** Where to land after a switch. The Parent Dashboard is learner-agnostic in its URL, so it stays put. */
export function switchDestination(pathname: string): { reload: boolean; href: string } {
  return pathname === "/learning-intelligence/parent"
    ? { reload: true, href: pathname }
    : { reload: false, href: "/dashboard" };
}

/** Plain-language messages for the database's governed errors (never raw SQL text). */
export function friendlyLearnerError(message: string): string {
  if (/angel_add_learner_requires_account/.test(message)) return "Please create an account or sign in before adding another child.";
  if (/angel_learner_limit/.test(message)) return "You can add up to 8 children to one account.";
  if (/angel_invalid_learner_name/.test(message)) return "Please enter a first name or nickname (up to 40 characters).";
  if (/angel_invalid_pathway/.test(message)) return "Please choose one of the listed pathways.";
  return "Sorry, we couldn't add your child just now. Please try again.";
}

function navigateAfterSwitch(): void {
  const { reload, href } = switchDestination(window.location.pathname);
  if (reload) window.location.reload();
  else window.location.assign(href);
}

/**
 * The one hook every surface uses to know "which child". Nothing else
 * stores or chooses a learner.
 */
export function useLearners() {
  const s = useSyncExternalStore(subscribeLearnerContext, getLearnerContextSnapshot, () => SERVER_LEARNER_CONTEXT);
  const active: LearnerSummary | null = s.learners.find((l) => l.id === s.learnerId) ?? null;
  const ready = s.status === "ready";

  const switchLearner = useCallback((id: string) => {
    if (id === getLearnerContextSnapshot().learnerId) return;
    // Full navigation, not a soft update: every page reads learner-scoped
    // browser state at mount, and a reload guarantees nothing from the
    // previous child can linger in memory.
    if (setActiveLearner(id)) navigateAfterSwitch();
  }, []);

  const renameLearner = useCallback((id: string, raw: string): string | null => {
    const name = normaliseChildName(raw);
    if (!name) return null;
    updateLearnerLocally(id, { name });
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase
        .from("profiles")
        .update({ learner_name: name })
        .eq("id", id)
        .then(async ({ error }) => {
          if (error) {
            console.warn("[Learner] rename failed:", error.message);
            const ctx = getLearnerContextSnapshot();
            const { data } = await supabase.auth.getSession();
            if (ctx.uid && data.session?.access_token) await refreshLearnerContext(ctx.uid, data.session.access_token);
          }
        });
    }
    return name;
  }, []);

  const addLearner = useCallback(
    async (rawName: string, pathwayId: string | null): Promise<{ ok: true } | { ok: false; error: string }> => {
      const name = normaliseChildName(rawName);
      if (!name) return { ok: false, error: friendlyLearnerError("angel_invalid_learner_name") };
      const supabase = getSupabaseClient();
      if (!supabase) return { ok: false, error: friendlyLearnerError("") };
      const { data: id, error } = await supabase.rpc("create_learner", {
        p_learner_name: name,
        p_pathway_id: pathwayId,
      });
      if (error || !id) return { ok: false, error: friendlyLearnerError(error?.message ?? "") };
      const ctx = getLearnerContextSnapshot();
      const { data } = await supabase.auth.getSession();
      if (ctx.uid && data.session?.access_token) await refreshLearnerContext(ctx.uid, data.session.access_token);
      if (setActiveLearner(id)) window.location.assign("/dashboard");
      return { ok: true };
    },
    []
  );

  return { learners: s.learners, active, ready, switchLearner, renameLearner, addLearner };
}
