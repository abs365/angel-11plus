# Legacy Reachability Audit (CSSE pathway)

Checked against every item Section 4 named, after the four routing fixes in this increment. "Reachable" means reachable via a link/redirect the app itself presents to a CSSE learner; direct URL entry is out of scope (not "unintentional").

| Legacy surface | Reachable by a CSSE learner via any in-app link, before this increment | After this increment |
|---|---|---|
| The Lighthouse Mystery (`eng-001`) | No — only a historical label for past completions, never a live link | No change (already safe) |
| Old English learning (`/english`) | Yes — via Daily Mission (`buildItem()`), Continue Learning row, Angel Plus Journey Links | No — all three fixed to route to `/learning-intelligence/practice/reading-comprehension` |
| Old Mathematics learning (`/maths`) | Yes — via Daily Mission, Continue Learning row, Angel Plus Journey Links | No — routes to `/learning-intelligence/practice/mathematics` |
| Legacy generic practice (`/reasoning`) | Yes — via Navigation "Practise" was already correctly branched, but Continue Learning row and Angel Plus Journey Links still pointed here | No — all fixed to `/learning-intelligence/practice` |
| Obsolete mock experiences (`/mock-test`) | No — already retired from the recommendation graph in an earlier round | No change (already safe) |
| Pre-transformation Daily Missions | Only the `href` field was defective (see above); the mission's selection logic (which subject, why) was already CSSE-evidence-aware and unchanged | Fixed |
| Stale recommendation links | `lib/parentInsights.ts`'s `buildFocusAreas()` had no pathway branch and no eligibility filter | Fixed: eligibility filter added, hrefs resolved via the same shared function as Daily Mission |
| Old parent advice links | Same `SUBJECT_ADVICE` defect as above | Fixed |
| Old dashboard CTAs | "Continue Learning" row (Learn/Practise buttons) | Fixed |
| Old onboarding links | `/pathways` itself does not route a CSSE-onboarded learner anywhere legacy — it lands on `/dashboard`, which is pathway-safe after the above fixes | No defect found here |
| Old progress links | `/progress` was already clean — it consumes `computeParentReport()`'s output, so it inherits the `parentInsights.ts` fix automatically | Fixed via the shared fix |

## Not changed, and why

- `app/reasoning/page.tsx`, `app/learn/page.tsx`, `app/english/page.tsx`, `app/english/[id]/page.tsx`, `app/maths/page.tsx`, `app/vocabulary/page.tsx`, `app/writing/page.tsx`, `app/mocks/adaptive/*` — these remain the correct, live destinations for GL/CEM/ISEB/Independent pathways, which have no separate rebuilt experience yet. Nothing in this increment touches their content or their own internal navigation. They are simply no longer *linked to* from a CSSE context.
- `components/LegacyPathwayParentContent.tsx`, `components/ReasoningSession.tsx`, `components/SessionInfoBar.tsx`, `components/SubjectBreakdown.tsx`, `components/PassagePlayer.tsx` — confirmed (again, this increment) to be reachable only through the above non-CSSE routes. Unchanged.
