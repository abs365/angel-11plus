# Mock Centre Information Architecture

**Programme:** Angel Assessment Transformation Execution Programme — Mock Centre Experience Transformation
**Prepared:** 2026-08-11

---

## Page hierarchy (top to bottom, CSSE learner with an evidence profile)

1. Header (h1 + one sentence)
2. Your Mock Readiness — one prominent card, one of three real states
3. Recommended Next Step — one line, one primary action
4. Your Exam — one primary card (Full CSSE Mock) + a compact "coming later" list + a collapsed "Explore another pathway" disclosure
5. Mock History — up to 3 recent results, simplified
6. About these mocks — trimmed disclaimer

## Page hierarchy (GL/CEM/ISEB learner)

1. Header
2. *(no readiness card — no evidence model exists for these pathways)*
3. Your Exam — one primary card (the learner's own pathway) + a collapsed "Explore another pathway" disclosure
4. Mock History
5. About these mocks

## Page hierarchy (no pathway selected)

1. Header
2. Your Exam — all four pathway cards, equal weight (unchanged from today — the one case where this is honest)
3. Mock History
4. About these mocks

## What moved

**Personalised Practice (4 cards)** — removed from this page entirely, added to `/reasoning` (the real, existing home for GL-pathway Practise, per `Navigation.tsx`'s own routing). Not duplicated, not deleted — a genuine relocation. CSSE Practise (`/learning-intelligence/practice`) already has its own, separate, complete Practise experience and needs nothing added.

## What is hidden, not deleted

- GL/CEM/ISEB cards, for a CSSE learner: hidden from the primary flow, reachable via "Explore another pathway" — one click away, never removed.
- The reverse (CSSE card, for a GL/CEM/ISEB learner): same treatment.
- Mathematics Mock/English Mock/Continuous Writing/Focused Assessment: named, visibly present as "Coming later," not hidden — but not clickable, since nothing exists behind them yet.

## Progressive disclosure, not scroll reduction by shrinking type

The page is shortened by removing an entire misplaced section (Personalised Practice) and collapsing the 3-of-4 non-primary pathway cards behind one disclosure, not by reducing typography (Product Experience Standard V1's typography tokens are unchanged) or by hiding genuinely useful information.
