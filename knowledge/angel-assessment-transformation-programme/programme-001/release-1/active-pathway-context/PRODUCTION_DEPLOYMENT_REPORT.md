# Production Deployment Report

**Commit:** `16b31e5` ("Add Active Pathway Context: top-bar target switcher, pathway-aware routing fix")
**Production deployment:** `dpl_9Kf6Mk9dZRMrsMQXR2BnbsX1sACs`, aliased to `https://angel-11plus.vercel.app`

## Verification performed against the actual production URL (not localhost)

Service worker and cache-storage cleared first on every fresh check (`navigator.serviceWorker.getRegistrations()` + `caches.keys()`), per the strengthened Copy Quality Rule's verification requirement (`PRODUCT_EXPERIENCE_STANDARD_V1.md` §9.1) applied consistently here too.

1. `/dashboard`, CSSE active — top-bar switcher correctly showed "CSSE"; Continue Learning row's Learn/Practise links correctly resolved to `/learning-intelligence/learn` and `/learning-intelligence/practice`.
2. Switcher opened, listed exactly the 5 real pathways (GL Assessment, CEM (Durham University), CSSE (Essex), ISEB Pre-Test, Independent / Bespoke) — no Core Foundation, no Not Sure Yet.
3. Selected ISEB while CSSE was active: confirmation dialog appeared with the exact copy "Switch preparation pathway? You are currently preparing for CSSE (Essex). If you switch to ISEB Pre-Test, Angel will focus your learning, practice and mock preparation on ISEB Pre-Test. Your existing CSSE (Essex) progress will be kept." — confirmed dash-free.
4. Confirmed the switch: `selectedPathwayId` became `iseb`, seeded `scores`/`xp` unchanged, landed back on `/dashboard`, switcher updated to "ISEB".
5. `/beta`, existing ISEB user: compact "Preparing for: ISEB Pre-Test" view shown, no six-card catalogue.
6. `/angel-plus`, CSSE active: "Learning Hub" card correctly resolved to `/learning-intelligence/learn`.

## Disclosed observation

`document.querySelectorAll('main').length` returned 2 on `/dashboard` in production, consistently: one visible (943px wide, fully interactive, confirmed correct by the tests above) and one with `offsetParent: null` and zero width. Investigated at length during implementation (see `IMPLEMENTATION_REPORT.md`); could not produce a fully deterministic root cause, but every direct interactive test against the visible tree was correct, and no functional or visual defect was ever observed by a real interaction. Recommend the Founder personally confirm the deployed experience looks and behaves correctly on their own device as an extra check, given this was not fully root-caused.

## Not deployed

`supabase/migrations/026_active_pathway_context.sql` — prepared, requires Founder action (Supabase SQL Editor or CLI with owner/service-role privileges) to apply. The application does not depend on it; pathway persistence works today via localStorage exactly as before.
