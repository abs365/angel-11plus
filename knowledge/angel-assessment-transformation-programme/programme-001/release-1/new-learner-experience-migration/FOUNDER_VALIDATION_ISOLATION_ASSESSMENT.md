# Founder Validation Isolation Assessment

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, New Learner Experience Migration
**Prepared:** 2026-08-11
**Method:** Direct code investigation with exact line-quoted evidence. Two related but distinct defects are covered: contamination (§1-3) and the React duplicate-key symptom (§4-5), since the concrete symptom reported (`founder-validation-csse-1786398627505` appearing twice) is actually caused by the second defect, not the first.

---

## 1. Contamination — root cause

`MockResult` (`types/mock.ts`) has no field distinguishing a Founder Validation attempt from a real mock attempt:

```ts
export interface MockResult {
  id: string;
  pathway: MockPathwayId;       // "gl" | "cem" | "csse" | "iseb" — closed enum, no Founder-Validation variant
  pathwayName: string;          // free text, informal
  date: string;
  totalScore: number;
  sectionResults: MockSectionResult[];
  durationMinutes: number;
}
```

`app/learning-intelligence/founder-validation/csse/page.tsx` saves its result with `pathway: "csse"` hardcoded (the same value every real CSSE mock uses), distinguished only by the free-text `pathwayName: "CSSE Founder Validation Assessment"`:

```tsx
const mockResult: MockResult = {
  id: sessionIdRef.current || `founder-validation-csse-${Date.now()}`,
  pathway: "csse",
  pathwayName: "CSSE Founder Validation Assessment",
  ...
};
saveMockResult(mockResult);
```

Every read path that could exclude it has nothing to filter on:
- `app/mocks/page.tsx`'s "Recent Results": `results.slice(-3).reverse()` — **no filter at all**.
- `bestScoreForPathway()` (`lib/mockProgress.ts`): filters only by `r.pathway === pathway` — Founder Validation's `pathway: "csse"` passes this filter identically to a real mock.
- `components/parent/MockHistorySection.tsx`'s "Best score": `Math.max(...mockResults.map(r => r.totalScore))` — **not even pathway-filtered**, mixes every pathway together (a separate, pre-existing accuracy issue, noted here since the fix touches the same line, but not itself Founder-Validation-specific).

## 2. Contamination — fix design (smallest correct isolation mechanism)

Add one new, optional field to `MockResult`:

```ts
export interface MockResult {
  ...
  source?: "learner" | "founder-validation";  // optional, additive — absent = "learner" (backward compatible)
}
```

- `founder-validation/csse/page.tsx` sets `source: "founder-validation"` on save.
- `mock-exam/page.tsx` and `mocks/[pathway]/page.tsx` are unchanged (their records simply have no `source` field, correctly defaulting to "learner" everywhere it's read).
- Every read path that currently has no way to exclude Founder Validation attempts gets a one-line filter: `results.filter(r => r.source !== "founder-validation")`, applied before `.slice(-3)`, before `bestScoreForPathway()`'s max, and before `MockHistorySection`'s max/list.

This is additive and backward-compatible: no existing stored record (none of which have a `source` field) changes meaning; they all correctly remain "learner" attempts.

## 3. Existing contaminated records — treatment

`mockResults` is stored client-side only (`localStorage` key `"angel11plus_progress"`, confirmed via investigation — no Supabase table involved for this record type). There is no central database to migrate; each browser's local data is independent. Per the governing instruction ("do not delete legitimate historical evidence without analysis"):

- **Do not delete** any existing record.
- **Recommended treatment:** a one-time, client-side reclassification on read — any existing stored record whose `id` starts with `"founder-validation-"` (the literal, consistent prefix `founder-validation/csse/page.tsx` has always used) is treated as `source: "founder-validation"` for filtering purposes, without rewriting the stored record itself. This is a read-time correction, not a data migration — it self-heals for any returning user the moment this fix ships, with zero risk of misclassifying a real mock attempt (no real mock ever produces an id with this prefix).

## 4. Duplicate-key symptom — actual root cause (not contamination)

The specific symptom quoted by the Founder — two children with the identical key `founder-validation-csse-1786398627505` — is **not** a contamination collision (a Founder Validation id colliding with a real mock id). It is the *same* Founder Validation attempt being saved twice, producing two `MockResult` objects with byte-for-byte identical `id`.

Cause: `submitExam()` in `founder-validation/csse/page.tsx` (and, identically, in `mock-exam/page.tsx`) has no re-entrancy guard, and is wired to fire from two independent triggers:

```tsx
// Trigger 1 — countdown timer's setState updater
timerRef.current = setInterval(() => {
  setTimeLeftSeconds((t) => {
    if (t <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      submitExam();   // <- side effect inside a setState updater
      return 0;
    }
    return t - 1;
  });
}, 1000);
```
```tsx
// Trigger 2 — manual submit button
<button onClick={submitExam}>Submit assessment</button>
```

React Strict Mode (on by default in dev; `next.config.ts` has no override) intentionally double-invokes function-form `setState` updaters to surface exactly this class of impurity — calling the timer's updater twice at `t <= 1` runs `submitExam()` twice, with `sessionIdRef.current` unchanged between calls, producing two identical-`id` `MockResult` objects both appended via `saveMockResult()`.

**Confirmed NOT vulnerable:** `app/mocks/[pathway]/page.tsx` already has the correct guard pattern — a `saved` state flag checked before its save effect runs (`if (mode === "results" && !saved && sectionResults.length > 0) { ...; setSaved(true); }`).

**Confirmed equally vulnerable:** `app/learning-intelligence/mock-exam/page.tsx` (the real CSSE Mock) has the identical unguarded pattern — this is a live, real defect on the production Mock, not just the Founder Validation route.

## 5. Duplicate-key symptom — fix design

Apply the same guard pattern `/mocks/[pathway]/page.tsx` already uses correctly, to both `founder-validation/csse/page.tsx` and `mock-exam/page.tsx`: an idempotency check at the top of `submitExam()` (e.g. a `submittedRef` ref, checked and set before any save logic runs) so a second invocation — from either trigger — is a no-op. This fixes the underlying identity problem (an attempt is saved at most once, so its `id` is never duplicated) rather than suppressing React's warning by changing the key expression alone.

## 6. What this does not touch

No change to the real evidence pipeline (`recordPresentation`/`recordOutcome`/`processEvidenceForCompetency`) — those already write once per question-answer, unrelated to this per-exam-submission bug. No change to `ali_question_bank` or any Supabase table — this defect and its fix are entirely within the client-side `MockResult`/`localStorage` layer.

---

## FOUNDER VALIDATION ISOLATION STATUS: ROOT CAUSE VERIFIED, FIX DESIGNED, NOT YET IMPLEMENTED

Implementation (the `source` field, the three read-path filters, the read-time id-prefix reclassification, and the `submittedRef` guard on both `founder-validation/csse/page.tsx` and `mock-exam/page.tsx`) proceeds as part of this release's authorised low-risk implementation phase.
