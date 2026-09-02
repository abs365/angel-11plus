"use client";

import { useRouter } from "next/navigation";

/**
 * Gate 3 Closure Wave, Defect D (2026-09-02) — this route is RETIRED.
 *
 * Same root cause and fix rationale as app/mocks/adaptive/maths/page.tsx
 * (see that file's doc comment for the full explanation): this page
 * hardcoded `pathway = "gl"` when fetching eligible content
 * (`fetchMockEligibleQuestionBank(supabase, "english", "gl")`), so a CSSE
 * learner silently fell back to a local-only synthetic fixture
 * (`englishSyntheticFixture`) that bypasses the Educational Intelligence
 * evidence pipeline entirely, while its scoring used only a first-pass
 * keyword-overlap heuristic (documented in this file's own removed header
 * comment as "an intentional first-pass simplification") rather than the
 * newer 007A Answer Validation Architecture's multi-tier scoring.
 *
 * `/learning-intelligence/practice/reading-comprehension` is the correct,
 * CSSE-scoped successor: same subject (English Reading Comprehension), the
 * canonical `recordPresentation`/`recordOutcome` evidence path, and the
 * newer answer-validation architecture. Retiring this page rather than
 * patching its pathway resolution avoids maintaining two competing Reading
 * Comprehension practice engines side by side.
 *
 * app/reasoning/page.tsx's "Reading Practice" card now links directly to
 * the canonical route; this redirect exists for any other way this URL
 * might still be reached (a bookmark, a stale link, direct entry).
 */
export default function RetiredAdaptiveEnglishMockPage() {
  const router = useRouter();
  router.replace("/learning-intelligence/practice/reading-comprehension");
  return null;
}
