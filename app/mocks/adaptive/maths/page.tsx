"use client";

import { useRouter } from "next/navigation";

/**
 * Gate 3 Closure Wave, Defect D (2026-09-02) — this route is RETIRED.
 *
 * Root cause: this page hardcoded `pathway = "gl"` when fetching eligible
 * content (`fetchMockEligibleQuestionBank(supabase, "maths", "gl")`),
 * regardless of the learner's actual selected pathway. For a CSSE learner
 * (Profile B, the Gate 3 regression account) that query returned zero
 * eligible rows, and the page silently fell back to a local-only synthetic
 * fixture (`mathsSyntheticFixture`) — while still fully grading and
 * displaying results as genuine personalised Practice. Because
 * `usingSyntheticFixture` was true, `recordPresentation`/`recordOutcome`
 * were both skipped by design (the Mock Content Firewall's own existing
 * rule), so the whole session bypassed the Educational Intelligence
 * evidence pipeline entirely, in violation of the standing rule that no
 * feature may bypass that engine.
 *
 * `/learning-intelligence/practice/mathematics` (Capability 3, Wave 2's
 * Practice Experience session runner) is the correct, CSSE-scoped
 * successor: it resolves the learner's real evidence via
 * `generatePersonalisedSession`, always uses the canonical
 * `recordPresentation`/`recordOutcome` evidence path (tagged
 * `source: "practice_experience"`), and is what the Dashboard's own
 * "Today's Admission Mission" already links to. Retiring this page rather
 * than patching its pathway resolution avoids maintaining two competing
 * Mathematics practice engines side by side.
 *
 * app/reasoning/page.tsx's "Mathematics Practice" card now links directly
 * to the canonical route; this redirect exists for any other way this URL
 * might still be reached (a bookmark, a stale link, direct entry).
 */
export default function RetiredAdaptiveMathsMockPage() {
  const router = useRouter();
  router.replace("/learning-intelligence/practice/mathematics");
  return null;
}
