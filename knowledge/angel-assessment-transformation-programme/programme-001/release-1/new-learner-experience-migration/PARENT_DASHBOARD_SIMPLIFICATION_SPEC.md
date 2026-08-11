# Parent Dashboard Simplification Spec

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, New Learner Experience Migration
**Prepared:** 2026-08-11
**Scope:** `components/parent/CssePathwayParentContent.tsx` only (CSSE pathway). `components/parent/LegacyPathwayParentContent.tsx` (611 lines, GL/CEM/ISEB) is explicitly out of scope this release — see §4.

---

## 1. Current state (verified)

`CssePathwayParentContent.tsx` renders 10 sections in sequence, all at once, no progressive disclosure: primary action row, At-a-Glance panel, Child Progress, This Week, What's Next, Skills Summary, Readiness Summary, Evidence Growth, Development Areas, Recent Activity. `MockHistorySection` is appended below it by the parent shell. This is real, correct data — the problem is presentation density, not accuracy.

## 2. New first-screen structure

Per governing instruction §12, four questions, answered in this order, understandable within ~10 seconds:

1. **CHILD STATUS** — a short plain-English summary. Reuses the existing `AtAGlancePanel`'s "improving?" answer text directly — no new computation.
2. **CURRENT FOCUS** — "Angel recommends: [area]" (reuses `RecommendationExplanation`'s top candidate) and, separately, "Family focus: [area]" only if one is active (reuses the Family Choice Pilot's `fetchFamilyFocusSelection()`, MR-01-only today per that pilot's scope).
3. **NEXT ACTION** — one clear action (reuses the existing primary CTA button logic already in `CssePathwayParentContent`, e.g. "See This Week's Revision Plan").
4. **MOCK READINESS** — state + short explanation (reuses `assessMockReadiness()`, unchanged this release — see `MOCK_READINESS_MODEL_V1.md` for the future extended version; this release surfaces the existing 3-verdict system as-is).

## 3. Progressive disclosure — everything currently shown stays reachable

Nothing is deleted. The existing 10 sections (Skills Summary, Readiness Summary, Evidence Growth, Development Areas, Recent Activity, plus the explainer cards) move behind explicit secondary links from the new first screen:

- "View detailed progress" → reveals Skills Summary / Readiness Summary / Evidence Growth / Development Areas / Recent Activity (the current dense middle of the page, now opt-in rather than always-rendered)
- "Weekly report" → existing `/learning-intelligence/parent/weekly-report`
- "School/admissions readiness" → existing `/learning-intelligence/parent/admissions-readiness`
- "Learning history" → existing `/learning-intelligence/parent/journey` or `/learning-intelligence/parent/readiness-timeline`
- "Why Angel recommends this" → existing `RecommendationExplanation` detail, already real text

`MockHistorySection` remains below the fold (or behind "View detailed progress"), not on the first screen, since Mock Readiness (item 4 above) already answers the parent's immediate mock question.

## 4. Why `LegacyPathwayParentContent.tsx` is out of scope this release

At 611 lines and ~15 sections (several with per-subject repetition across up to 9 subjects), it is the denser of the two branches and would benefit from the same treatment — but:
- It has no equivalent to `AtAGlancePanel`'s single-paragraph summary reuse path in the same shape (it has its own separate `AtAGlancePanel` usage plus a completely different card structure beneath it), so this isn't a drop-in reuse of the CSSE design.
- The governing instruction's named examples (Founder screenshots) are drawn from the CSSE experience. Touching the Legacy branch is a separate, real design exercise, not a mechanical extension of this one.
- Consistent with `LEGACY_CONTENT_RETIREMENT_REGISTER.md` §4's broader decision to leave the non-CSSE pathway experience untouched this release pending explicit separate direction.

## 5. What is explicitly not changing

No new data computation. No change to `AtAGlancePanel`, `RecommendationExplanation`, `CompetencySummary`, `ReadinessSummary`, `EvidenceComposition`, `RecentActivity`, or any Parent sub-page — all reused exactly as they compute today, only re-ordered/re-disclosed.
