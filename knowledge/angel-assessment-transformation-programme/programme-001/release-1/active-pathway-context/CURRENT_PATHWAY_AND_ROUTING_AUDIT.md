# Current Pathway and Routing Audit

Fresh reconnaissance performed this increment (Section 3), not reused from any prior audit.

## Pathway persistence today

- `lib/progress.ts` `getSelectedPathwayId()` / `setSelectedPathway()` — reads/writes `selectedPathwayId` inside the single `angel11plus_progress` localStorage blob. No server-side row exists anywhere (confirmed by direct inspection of every migration and every `lib/ali/persistence/*`/`lib/supabaseProgress.ts` write path — see `PATHWAY_EVIDENCE_INTEGRITY_ASSESSMENT.md`).
- `lib/pathways.ts` — `PATHWAYS` array, 7 entries: `gl`, `cem`, `csse`, `iseb`, `independent`, `core-foundation`, `not-sure`. `core-foundation` and `not-sure` are not examination pathways (see architecture doc §2).

## Navigation (`components/Navigation.tsx`)

- `useCssePathway()` reads `getSelectedPathwayId() === "csse"` and returns a boolean. This is the only pathway-awareness in navigation today — it distinguishes CSSE vs. everything else, not each of the five real pathways individually. GL/CEM/ISEB/Independent are treated as one undifferentiated bucket, consistent with the fact that they share identical routes (`/learn`, `/reasoning`, `/mocks/[pathway]`) differentiated only by pathway metadata (badge, colour, description), not by separate content.
- `primaryItemsFor(isCsse)`: Learn → `/learning-intelligence/learn` (CSSE) or `/learn` (everyone else). Practise → `/learning-intelligence/practice` (CSSE) or `/reasoning` (everyone else). Mock → `/mocks` (shared, all pathways). Progress → `/progress` (shared).
- Parent Dashboard → `/learning-intelligence/parent` (single unified route for every pathway; branches internally, see below).

## Onboarding / pathway selection (`app/pathways/page.tsx`, "School Intelligence")

- `handleSelect(id)` calls `setSelectedPathway(id)` then immediately `router.push("/dashboard")` — **no confirmation of any kind today**, for either a first-time choice or a change from an existing pathway. This is the exact "accidental single click" risk Section 6 names.
- Renders the full `PATHWAYS.map()` card grid (all 7 entries, including Core Foundation and Not Sure) unconditionally, every time the page is visited — for a returning CSSE user this is the six/seven-card catalogue Section 5 says must not be the everyday experience. A "Target School Overview" panel was added above it in an earlier sprint but the full catalogue below was never removed.

## Daily Mission (`lib/adaptiveEngine.ts`)

- `buildDailyMission()`'s bootstrap branch (`totalSessions === 0`) already branches correctly: CSSE gets `/learning-intelligence/learn`, every other pathway gets the unchanged `/english` + `/maths` starter (fixed in an earlier round of this program).
- The general branch (`totalSessions > 0`) calls `getEligibleSubjectKeys(p.selectedPathwayId)` to filter *which subjects* are candidates — this part is already pathway-aware and correct.
- `buildItem()`, which builds the actual `MissionItem.href`, is **not** pathway-aware: `href: \`/${subject.subject}\`` unconditionally. A CSSE learner with real session history whose most urgent subject is "maths" or "english" receives a Daily Mission item pointing at the legacy `/maths` / `/english` pages, not the CSSE learning-intelligence surfaces. **Confirmed defect, fixed this increment.**
- Found during implementation, same root cause: the "Revise: X" replay item's `href` came straight from `lib/replayEngine.ts`'s `SKILL_HREF` map (also all hardcoded legacy routes) rather than through pathway-aware resolution, even though the replay *queue itself* is already correctly filtered by `eligibleSubjectKeys`. **Fixed** — now resolved via the same shared `resolveSubjectHref()`.

## Parent Dashboard (`lib/parentInsights.ts`, `app/learning-intelligence/parent/*`)

- `/learning-intelligence/parent` is a single shell that branches internally: `CssePathwayParentContent.tsx` for CSSE, `LegacyPathwayParentContent.tsx` for everything else. This branch point is correct and unchanged.
- Within the shared, pathway-agnostic parts of the report (`computeParentReport()` → `buildFocusAreas()`), `SUBJECT_ADVICE`'s hrefs are hardcoded legacy routes (`/english`, `/maths`, `/vocabulary`, `/writing`, ...) with **no pathway branch and no eligibility filter** — unlike `buildDailyMission()`, this function never calls `getEligibleSubjectKeys()` at all. **Confirmed defect, fixed this increment**, both the href resolution and the missing eligibility filter.

## Dashboard quick actions (`app/dashboard/page.tsx`)

- Line 520 (Today section's primary CTA) already branches correctly: `getSelectedPathwayId() === "csse" ? "/learning-intelligence/learn" : "/english"`.
- The "Continue Learning" row (line ~661-680) does not: `Learn` → hardcoded `/learn`, `Practise` → hardcoded `/reasoning`, regardless of pathway. **Confirmed defect, fixed this increment.** (`Continue` uses `topMissionItem?.href`, which is fixed automatically once `buildItem()` is fixed; `Take a mock` already correctly points at the shared `/mocks`.)

## Angel Plus (`app/angel-plus/page.tsx`)

- `JOURNEY_LINKS` (`Learning Hub` → `/learn`, `Practice` → `/reasoning`) is a static array with no pathway branch. **Confirmed defect, fixed this increment.**

## Mock Centre (`app/mocks/*`)

- `/mocks` is the shared, pathway-neutral hub (transformed in an earlier round of this programme) and correctly serves every pathway without leaking legacy content.
- `/mocks/[pathway]` is the shared runner used by every pathway including CSSE's own "Explore another pathway" disclosure. Confirmed unaffected by this increment; no change needed.

## Legacy content reachability for a CSSE learner (Section 4)

Checked directly, not assumed:

- **The Lighthouse Mystery** (`eng-001`) — only appears as a historical-lesson-name lookup (`app/progress/page.tsx`'s `lessonNames` map), used solely to label a *past* completed lesson honestly if one exists in a learner's history. It is not linked from any live recommendation, mission, or navigation path today. No change made — this is honest historical labelling, not active content, and Section 4 explicitly says not to delete history to hide it.
- **`/mock-test`** — already retired from the recommendation engine's reachability graph in an earlier round (`adaptiveEngine.ts`'s own comment at the retired nudge's former location); the route file itself still exists but nothing links to it from the CSSE journey.
- **`recommendedEnglishLesson` / `recommendedMathsMode`** (`computeAdaptiveState()`'s other two fields) are only read internally by `/english` and `/maths` themselves (to decide which lesson tab to highlight once already on that page) — never surfaced as a mission link elsewhere. Once the four defects above are fixed, a CSSE learner is never linked to `/english`/`/maths` in the first place, so this is inert for them.
- After the four fixes in this increment, the only ways a CSSE learner could reach `/english`, `/maths`, `/vocabulary`, `/writing`, `/learn`, or `/reasoning` are: typing the URL directly, or the app's own generic legal footer/disclaimer text (which names exam boards, not routes). Both are outside "unintentional reach via a link," which is what Section 4 asks to be prevented.
