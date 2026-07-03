# Angel Navigation Architecture — V3

**Status:** Approved, implemented in `components/Navigation.tsx`.

---

## 1. What was actually wrong

The existing sidebar (`components/Navigation.tsx`, pre-V3) was **not** literally "one long scrolling menu" — it was already grouped into Learning (6 items) / Reasoning (4 items) / Exams (2 items) / Parent Area (1 item) / Support (4 items), 17 links total. The real problem, precisely: **Reasoning's four items are peers of English/Maths/Vocabulary/Writing in visual weight, but they aren't peers in the student's mental model** — a child doesn't think "I want to do Non-Verbal Reasoning today," they think "I want to do some reasoning practice." Four equally-weighted, separately-labelled entries for what is functionally one activity area is what actually reads as clutter, not the total item count.

## 2. New Information Architecture

```
Learning
  Home
  English
  Maths
  Vocabulary
  Writing
  Progress

Reasoning
  Reasoning Hub          ← was 4 separate entries, now 1

Assessment
  Practice               ← was "Mock Tests" — see §3 on renaming
  Exam Pathways

Family                   ← was "Parent Area"
  Parent Hub

Support
  Getting Started
  Feedback
  Share Experience
  Contact
```

**Reasoning Hub** (`app/reasoning/page.tsx`, new) is a single landing page presenting all four reasoning disciplines as subject cards, using each discipline's already-canonical colour/icon (`ANGEL_DESIGN_LANGUAGE.md` §2). The four underlying routes (`/verbal-reasoning`, `/non-verbal-reasoning`, `/spatial-reasoning`, `/numerical-reasoning`) are **completely unchanged** — this is a new entry point in front of them, not a replacement for them. A student who already has one bookmarked, or arrives via a direct link from a mock, is unaffected.

**Why a hub page rather than a dropdown/flyout:** a hub page is simpler to build correctly for touch (no hover-dependent flyout on iPad), matches the "Reasoning Hub" pattern the brief itself suggested, and gives the four disciplines room to explain themselves (each with a one-line description of what it covers and which exam boards test it) — which a cramped nav flyout couldn't do as well. This is the one place in this phase where a genuinely new route was added, and it exists specifically to reduce navigation weight elsewhere, not to add a feature.

## 3. Renaming, not just regrouping

- **"Mock Tests" → "Practice"** in the nav label. The underlying `/mocks` hub page is renamed in its own heading too (see §4) — "Mock" carries exam-anxiety connotation for a 9–11 year old audience; "Practice" is the calmer, more accurate word for what actually happens on that page (a mix of full timed mocks and the ALI-powered adaptive practice modes, unified under one heading).
- **"Parent Area" → "Family"** — a small wording change, but "Parent Area" reads like a permissions boundary; "Family" reads like where the family-facing content lives, which is the more accurate and warmer framing for the same destination.
- **Parent Hub stays exactly where it already was — separated at the bottom of the sidebar, below a divider, never mixed with the Learning/Reasoning/Assessment groups.** This was already correct in the pre-V3 nav (confirmed: it was already structurally isolated, not interleaved with student learning items) — V3 keeps this placement and makes the *section label* around it warmer, per above. Administrative features (`/admin-beta`) remain deliberately absent from any visible navigation (Phase 5A's security model — a founder-only route reached by direct URL, never a public nav link) and are unaffected by this phase.

## 4. Mocks / Practice Hub

`app/mocks/page.tsx`'s "NEW: ADAPTIVE PRACTICE" section is renamed **"Recommended Practice"** and its four cards drop "Adaptive" and the "Beta" chip from their titles/badges entirely (`ANGEL_UX_V3_STRATEGY.md` §3's ALI-invisible rule) — e.g. "GL Adaptive Practice" becomes "Verbal Reasoning Practice," "Adaptive Maths Practice" becomes "Maths Practice." The underlying routes (`/mocks/adaptive/*`) and everything ALI does to select and grade content are completely unchanged — only the label a student reads changes.

## 5. Mobile Navigation

The mobile bottom nav (5 slots + Parent/Login) was already lean and was not the source of the "too long" complaint — kept structurally as-is, with its "Exams" label renamed to match the desktop rename.

## 6. What this achieves against the stated principles

- **Grouped into logical sections** — unchanged structurally where it was already right (Learning), fixed where it wasn't (Reasoning collapsed to one entry).
- **Reduced visual clutter** — 17 sidebar links become 14, and the 4 that remain most visually "loud" (Reasoning) become 1.
- **Parent features never interrupt the student journey** — confirmed already true, kept true, warmed in wording.
- **Administrative features never appear alongside learning** — confirmed already true (Phase 5A), unaffected.
