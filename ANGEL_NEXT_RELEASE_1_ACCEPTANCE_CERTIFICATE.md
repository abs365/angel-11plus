# Angel Next Release 1 — Acceptance Certificate

## Release Name
**Angel Next Release 1 — Navigation, Dashboard, Learning Hub, Practice & Visual Identity**

## Release Date
2026-07-22

## Commit Hashes
| Commit | Hash | Scope |
|---|---|---|
| 1 | `7e93936` | `feat(accessibility): complete Practice heading compliance` — Practice active-session heading fix only (`components/ReasoningSession.tsx`, 9 insertions) |
| 2 | `631353c` | `feat(angel): Angel Next Release 1 experience transformation` — AN-101, AN-102, AN-103, AN-105, AN-107, AN-108, and Mock Centre visual alignment (23 files, 1158 insertions / 461 deletions) |

Both commits pushed to `origin/main` (`github.com/abs365/angel-11plus`), fast-forwarding from `785f897` to `631353c`.

## Deployment Reference
- **Platform:** Vercel (project `angel-11plus`, `prj_86jYMAZfWR3GLllLgsmrD4sWOxrp`)
- **Deployment ID:** `dpl_4vorJ7GqhV5S9792BCAh12FoSDJy`
- **Target:** Production
- **Status:** ● Ready
- **Build duration:** 39s
- **Production URL:** https://angel-11plus.vercel.app (aliased; also `angel-11plus-abs365s-projects.vercel.app`, `angel-11plus-git-main-abs365s-projects.vercel.app`)
- **Trigger:** automatic, via Vercel's GitHub integration on push to `main` (no manual deploy step exists or was needed)

## Scope Delivered
- **AN-101** — Learning Navigation (sidebar/mobile-nav rebuild, IA)
- **AN-102** — Premium Dashboard (Hero, Today's Mission, Progress Snapshot)
- **AN-103** — Premium Learning Hub
- **AN-105** — Subject Experiences (English/Maths/Vocabulary/Writing accessibility & consistency)
- **AN-107** — Practice Experience (shared Reasoning engine: contrast, XP-message replacement, ARIA progress)
- **AN-108** — Visual Identity Refinement (forest-green primary / muted-indigo accent / restrained-plum focus / warm-stone background system, replacing dominant saturated purple)
- **ARC-001A Action 2** — Mock Centre visual alignment (badges, exam-header shades, focus ring), extending the AN-108 system to the fourth primary nav destination
- **ARC-001A Action 1 / this release's Commit 1** — Practice active-session accessibility heading

## Engineering Certification
- `tsc --noEmit`: clean, zero errors — verified pre-commit, post-commit, and this document reflects the final state pushed to production.
- `eslint`: 63 problems (54 errors, 9 warnings) — the identical, independently-reproduced baseline verified across every package this release (AN-101 through this certificate), with every issue in a touched file traced line-by-line to a pre-existing `react-hooks/set-state-in-effect` or React-Compiler-memoization pattern unrelated to this release's changes.
- `next build`: clean, 48/48 routes, zero warnings in the full build log — verified against the actual production build (`next build && next start`), not dev mode.
- Dependency integrity: `package.json`/lockfile diff empty throughout — no dependency was added or changed at any point in this release.
- File-change integrity: exactly 23 files in the full release scope, matching the certified ARC-001/ARC-001A scope precisely; zero unexpected files.

## Educational Certification
- Zero files under `lib/` were touched except `lib/subjectMeta.ts` (+30 lines, entirely additive display-copy string constants — read in full, contains no logic).
- `components/ReasoningSession.tsx`'s scoring/assessment functions (`isAnswerCorrect`, `checkAnswer`, `finishSession`'s XP formula, `completeLesson`, `recordSkillResult`) are byte-identical to the pre-release state — confirmed via diff inspection.
- `app/mocks/[pathway]/page.tsx`'s exam timing, section-progression, and scoring logic are untouched — every change in that file is a colour class or comment, confirmed via diff.
- **Live proof, on real production, with real user data**: completed a genuine 52-question Verbal Reasoning session on `https://angel-11plus.vercel.app` (an account with pre-existing real progress — 3 sessions, 4 earned achievements). The session scored correctly, persisted via `completeLesson`, and the Dashboard's recommendation engine updated to *"Your Verbal Reasoning score is 0% — work on letter codes and word analogies before moving on"* — the exact live, specific, data-driven behaviour verified at every certification stage this release, now reconfirmed on the actual production deployment.

## Accessibility Certification
- Practice active-session state: `heading "Verbal Reasoning Practice"` confirmed present via a live accessibility-tree read on production (was confirmed absent before this release, at ARC-001).
- Practice menu state: `heading "Verbal Reasoning"` — correct, unaffected.
- Practice completion state: `heading "Session Complete!"` — correct, unaffected, confirmed after a full real production session.
- Contrast: every colour changed across AN-107/AN-108/ARC-001A was calculated via sRGB relative luminance (not estimated), all clear AA, several clear AAA — see individual package reports for exact figures.
- Focus: the app's `:focus-visible` restrained-plum outline (`#8b5a7c`) is global; the one input that suppresses it (the mock-exam answer field) now has a matching manual ring in the same colour rather than a generic leftover blue.
- Reduced motion: `motion-reduce:transition-none` present on every animated element touched across this release.
- Touch targets: the global 44×44px minimum (`globals.css`) is unmodified and in effect.

## Browser Verification
Performed live against the real production URL (not a local server), in a fresh browser tab:
- Zero console errors at every stage: Dashboard, Learning Hub, Practice menu, a complete 52-question Practice session, Practice completion, Dashboard return, Mock Centre.
- Zero hydration warnings — checked via `read_console_messages` immediately after each navigation.
- No broken navigation — every link and button used resolved correctly.
- Service worker registered and activated cleanly (`[PWA] SW registered. State: activated`) with no errors, on the real production domain.

## Mobile Verification
Captured with Playwright (chromium), real 390×844 viewport, against `https://angel-11plus.vercel.app` directly:
- Dashboard: Hero, pills, and bottom tab bar all render correctly at real mobile width.
- Mock Centre: "Today" breadcrumb and softened "Personalised" badges confirmed live on mobile production.
- Evidence: `REL-001_production_evidence/prod_mobile_dashboard.png`, `prod_mobile_mocks.png`.

## Dark Mode Verification
Captured with Playwright, real `--color-scheme dark` emulation, against `https://angel-11plus.vercel.app` directly:
- Dashboard: green Hero retains full legibility on the warm near-black background; indigo accents correct.
- Mock Centre: soft-tinted badges render their correct dark-mode variant, not the old solid fill.
- Evidence: `REL-001_production_evidence/prod_dark_dashboard.png`, `prod_dark_mocks.png`.

## Founder Approval
- ARC-001: CERTIFIED WITH MINOR ACTIONS
- ARC-001A: all three actions closed, verdict READY TO COMMIT
- This release: explicitly authorized push-and-deploy by the Founder in this session, after being informed that pushing to `main` would trigger an automatic, un-gated production deployment via the linked Vercel project.

## Known Deferred Items
- The broader AN-110 heading programme (headings across other subject/page states beyond Practice's active session) remains deferred — explicitly out of scope for this release, per ARC-001A's own scope control.
- No automated test suite or CI/CD pipeline exists for this repository — every certification in this release arc, including this one, was a manual, point-in-time verification pass, not a continuously enforced guarantee.
- No formal Lighthouse or bundle-size audit has been run against this release.
- No real screen-reader (VoiceOver/NVDA) pass has been performed; all accessibility verification in this release used direct accessibility-tree inspection as a strong proxy.
- Per-subject/per-exam-board identity colours (English=purple, Verbal Reasoning=violet, GL=blue, CSSE=purple, etc.) were deliberately preserved as intentional differentiation rather than folded into the new chrome palette — documented as a conscious system, not an oversight, in AN-108's and ARC-001A's own reports.

## Production Verification
| Check | Result |
|---|---|
| Home / Dashboard | ✅ Live, correct, zero errors, real recommendation-engine response confirmed |
| Learning Hub | ✅ Live, correct |
| English / Maths / Vocabulary / Writing | ✅ Routes verified 200; English subject page walked live in ARC-001 pass, unchanged since |
| Practice (menu / active session / completion) | ✅ Live, full 52-question session completed on production, heading fix confirmed live |
| Mock Centre | ✅ Live, visual alignment confirmed live, zero errors |
| Navigation | ✅ All primary/secondary nav links functional throughout |
| Recommendation Engine | ✅ Confirmed live — real score → correct, specific mission reprioritisation |
| Accessibility | ✅ Heading fix confirmed live via accessibility tree |
| Browser Console | ✅ Zero errors across the entire verified journey |
| Hydration | ✅ Zero warnings |
| Mobile | ✅ Real 390×844 screenshots captured directly against production |
| Dark Mode | ✅ Real dark-mode screenshots captured directly against production |

## Final Release Status

# CERTIFIED
# READY FOR PRODUCTION

This document is the permanent Angel Next Release 1 baseline.
