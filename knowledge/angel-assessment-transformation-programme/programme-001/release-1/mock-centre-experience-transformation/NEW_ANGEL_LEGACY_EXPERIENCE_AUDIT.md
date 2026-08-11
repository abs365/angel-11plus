# New Angel Legacy Experience Audit

**Programme:** Angel Assessment Transformation Execution Programme — Mandatory Pre-Implementation Gate, ahead of Mock Centre Experience Transformation
**Prepared:** 2026-08-11
**Method:** Direct source trace of every route reachable from the real production top navigation, every empty/fallback/first-run state, and every recommendation/next-action href generator — not a review of navigation labels alone. `EXISTING ≠ APPROVED` applied throughout: a route compiling and rendering was never treated as evidence it belongs in the new CSSE journey.

---

## Starting point: the prior inventory

`NEW_ANGEL_EXPERIENCE_INVENTORY.md` (New Learner Experience Migration, earlier this programme) already classified the primary navigation and the bulk of legacy Learn content. That classification is re-verified here, not repeated from memory: `Navigation.tsx`'s `primaryItemsFor()` was re-read directly and confirmed to still branch CSSE vs non-CSSE correctly for **Learn** (`/learning-intelligence/learn` vs `/learn`) and **Practise** (`/learning-intelligence/practice` vs `/reasoning`). Neither route branches to `/english`, `/maths`, or the old lesson pool for a CSSE learner via the top nav. This part of the prior audit holds.

**What the prior audit did not check, and this one does:** the **Mock** nav item (unconditionally `/mocks` for every pathway), first-run/zero-evidence empty states, and the Daily Mission bootstrap generator. All three turned out to matter.

---

## 1. Complete new learner journey trace

Traced live: Today (`/dashboard`) → Learn → Practise → Mock Centre → Progress → Parent Dashboard → School Intelligence, plus every "What's next?"/recommendation link found in this session's own prior work (Parent Dashboard, Revision Planner, Mock Readiness) and every completion-screen next-action.

**Real finding, Mock:** `Navigation.tsx`'s `{ href: "/mocks", label: "Mock", icon: Trophy }` is the **only** nav item with no CSSE/non-CSSE branch. A CSSE learner clicking "Mock" lands on the same `/mocks` page as every other pathway.

## 2. Learn audit

Grepped the full repository for `Lighthouse Mystery`, `Boy Who Collected Silence`, `Letters from the Trenches`, `eng-001`/`002`/`003`. Found in exactly three places:
- `data/lessons.ts` — the content itself (title: "The Lighthouse Mystery"), unchanged, still real content for the pathways it's approved for.
- `lib/adaptiveEngine.ts` — a code comment documenting the prior fix (already correctly severed the `/mock-test` recommendation edge).
- `app/progress/page.tsx` — a title lookup (`"eng-001": "The Lighthouse Mystery"`) used only to label a learner's own historical completed-lesson record on their Progress page, never to recommend or link to it. Legitimate.

`data/lessons.ts` is imported by exactly four runtime consumers: `app/english/page.tsx`, `app/english/[id]/page.tsx` (the old lesson hub and reader — legitimate, unchanged, non-CSSE-pathway experience per the prior audit), `app/mock-test/page.tsx` (orphaned — confirmed zero inbound links anywhere in the repository, per §4 below), and `app/progress/page.tsx` (title lookup only, as above).

**Real finding, Dashboard empty state:** `/dashboard`'s "Start your first session" fallback (shown when the Daily Mission has zero items) linked unconditionally to `/english`, with no pathway check — reachable by any brand-new CSSE learner before their first Daily Mission is generated. **Corrected** (§8).

**Real finding, Daily Mission bootstrap:** `lib/adaptiveEngine.ts`'s `buildDailyMission()`, in its `report.totalSessions === 0` branch (the literal first thing a brand-new user of any pathway sees), returned a hardcoded two-item mission pointing at `/english` and `/maths` — with reason text asserting *"Essex CSSE style passages"* for content that predates the Assessment Transformation and, per this same file's own existing header comment, generates **zero** Educational Intelligence evidence. This branch had no pathway parameter at all, unlike the rest of the function (which correctly calls `getEligibleSubjectKeys(p.selectedPathwayId)` for every subsequent, non-bootstrap recommendation). This is the single highest-reach finding in this audit: it is the first mission every brand-new CSSE family would see. **Corrected** (§8).

## 3. Practise audit

`app/learning-intelligence/practice/[area]/page.tsx` (the CSSE Practice runner) calls `generatePersonalisedSession()`, which calls `fetchQuestionBank(supabase, area.subject, "csse")` — hardcoded to `pathway: "csse"`, confirmed by direct source read. No code path in this runner can surface GL/CEM/ISEB-tagged content to a CSSE learner. Content provenance for everything reachable here was already established in the Mathematics Reference Vertical work (evidence-cited, hand-verified, traceable to `ali_question_bank` migrations).

Family Choice (`founder-validation/family-choice/page.tsx`) is a pilot, its own competency (MR-01) is real production CSSE content, and it is not linked from any general navigation — reachable only by direct URL, consistent with its Founder Validation status (unaffected by this audit).

## 4. Mock audit

- **Legacy per-pathway runner** (`app/mocks/[pathway]/page.tsx`) — GL/CEM/ISEB entries are real, current, unchanged, and remain each of those pathways' one active mock experience: correct, no action.
- **CSSE entry in the same file** — already marked `⚠ DEPRECATED LEGACY IMPLEMENTATION` in its own code comment, unlinked from every current CSSE surface (`MOCK_CARDS` on `/mocks` overrides the CSSE card's href to `/learning-intelligence/mock-exam`, confirmed by direct source read), but still directly reachable at `/mocks/csse` by URL. **Real finding:** this route calls `saveMockResult()` on the exact same shared store the real CSSE Mock, Mock History, and Mock Readiness all read from, with no distinguishing tag — a stray completion (an old bookmark, a shared link from before this migration) would silently count as real Assessment Transformation evidence. **Corrected** (§8).
- **Adaptive routes** (`/mocks/adaptive/{gl,maths,english,vocabulary}`) — all four call `fetchQuestionBank()` hardcoded to `pathway: "gl"` (confirmed by direct source read of each file), i.e. genuinely GL-only content, correctly never CSSE. **Real finding:** these four are linked from exactly one place in the entire repository — the "Personalised Practice" section of `/mocks` itself, the same page every pathway's "Mock" nav item reaches unconditionally. A CSSE family clicking "Mock" is shown GL-labelled practice cards with no pathway gate or explanation of why GL content is being offered to a CSSE family. This is the same architectural problem the Mock Centre mandate's own §3 independently identified (move Personalised Practice out of the primary Mock Centre flow) — resolved together as part of the Mock Centre implementation itself, not as a separate patch, since it is the same code region (§8, §10 of the implementation report).
- **Founder Validation** (`/learning-intelligence/founder-validation/csse`) — isolation already verified and fixed earlier this programme (`isFounderValidationResult()` in `lib/mockProgress.ts`); re-confirmed unchanged and still correctly excluding these results from `getMockResults()`.
- **`/mock-test`** — orphaned (zero inbound links repository-wide, confirmed by grep), hardcodes `data/lessons.ts` content including Lighthouse Mystery, was never approved to represent CSSE, and remains reachable only by direct URL entry. Left untouched (retiring the route itself is a larger decision than this audit's narrow-correction scope authorises) but flagged in the register.

## 5. Recommendation routing audit

Traced every href-generating recommendation source: `lib/learningEngine/mockReadiness.ts` (all four `nextAction.href` values point to new `/learning-intelligence/*` routes only), `app/learning-intelligence/parent/revision-planner/page.tsx` (`/learning-intelligence/practice/${item.practiceAreaId}` only), `components/learningEngine/parent/RecommendationExplanation.tsx` and `lib/ali/explainability.ts` (text-only, no hrefs generated at all). None of the CSSE-specific Educational Intelligence recommendation surfaces can route a learner to legacy content.

The one recommendation-adjacent system that could and did route to legacy content was the Daily Mission bootstrap (§2 above) — not a "recommendation" in the Educational Intelligence Engine sense, but a real next-action link shown to every brand-new user regardless of pathway. Corrected.

## 6. Existing ≠ approved, applied

Nothing in this audit was removed. `data/lessons.ts`, `app/english/*`, `app/maths`, `app/reasoning` and its four reasoning subject pages, `/mock-test`, and the legacy `/mocks/[pathway]` runner (including its CSSE entry) all remain exactly as they were — real, working, and correctly serving the pathways they were built for (or, for `/mock-test` and the CSSE entry, correctly already unlinked). The three corrections made (§8) are routing/tagging corrections only: which href a CSSE-pathway user's own first-run and empty-state UI points to, and which `source` tag a legacy mock result carries — never a deletion, never a rewrite of the underlying content or engines.

## 7. Platform intelligence — unaffected

Assessment Brain V1, Learning Engine V1, Educational Intelligence Engine V1, competency evidence, durable mastery, maintenance review, wellbeing protection, Family Choice, explainability, and parent evidence translation were not touched by this audit or its corrections. All three fixes are routing/tagging changes in `app/dashboard/page.tsx`, `lib/adaptiveEngine.ts`, `app/mocks/[pathway]/page.tsx`, `lib/mockProgress.ts`, and `types/mock.ts` — no engine, evidence table, or scoring logic was modified.

## 8. Corrections made (all narrow, all logged)

| # | File | Finding | Fix |
|---|---|---|---|
| 1 | `app/dashboard/page.tsx` | First-run empty state linked unconditionally to `/english` | Now branches on `getSelectedPathwayId() === "csse"` to `/learning-intelligence/learn`; non-CSSE unchanged |
| 2 | `lib/adaptiveEngine.ts` | Zero-session Daily Mission bootstrap hardcoded to `/english` + `/maths` for every pathway, with copy asserting CSSE authenticity for pre-Transformation content | CSSE pathway now gets a single, honest item pointing to `/learning-intelligence/learn`; every other pathway's bootstrap mission is byte-for-byte unchanged |
| 3 | `app/mocks/[pathway]/page.tsx`, `lib/mockProgress.ts`, `types/mock.ts` | The deprecated, unlinked-but-still-reachable `/mocks/csse` legacy mock wrote to the same shared result store as real evidence, with no distinguishing tag | Tagged `source: "legacy-csse-mock"` on completion (CSSE only); `getMockResults()` now excludes it, matching the existing Founder Validation isolation pattern exactly |

Fix 4 (the Personalised Practice / GL content pathway leak on `/mocks`) is resolved as part of the Mock Centre implementation itself — see `MOCK_CENTRE_IMPLEMENTATION_REPORT.md`.

---

See `NEW_ANGEL_LEGACY_EXPERIENCE_REGISTER.md` for the full per-route register this audit produced.
