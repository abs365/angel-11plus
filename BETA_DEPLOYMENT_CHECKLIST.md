# Angel 11+ Beta Deployment Checklist

**Purpose:** Run through this checklist before inviting each cohort of beta families.
Complete every section. Do not skip items marked ⚠️.

---

## Section 1 — Technical Pre-Flight

### 1.1 Build

- [ ] `npm run build` passes with zero TypeScript errors
- [ ] Zero warnings about unknown CSS classes or missing Tailwind variants
- [ ] All 31 routes appear in build output as `○` (static) or `ƒ` (dynamic)
- [ ] No routes show as `⨯` (error)

### 1.2 Routes — Core Learning

Test each in browser (Chrome + Safari):

- [ ] `/` → redirects to `/dashboard`
- [ ] `/dashboard` loads, shows daily missions and subject cards
- [ ] `/english` loads lesson list, filter buttons work
- [ ] `/english/[any-lesson-id]` loads passage and questions
- [ ] `/maths` loads, session starts and answers submit
- [ ] `/vocabulary` loads, flashcard and quiz modes work
- [ ] `/writing` loads, prompt renders, textarea accepts input
- [ ] `/verbal-reasoning` loads, questions appear, answers submit
- [ ] `/non-verbal-reasoning` loads correctly
- [ ] `/spatial-reasoning` loads correctly
- [ ] `/numerical-reasoning` loads correctly
- [ ] `/mocks` shows all 4 pathway cards
- [ ] `/mocks/gl` intro loads, mock starts, sections progress, results save
- [ ] `/pathways` shows pathway cards, selection saves to progress
- [ ] `/progress` shows stats for completed sessions
- [ ] `/parent` shows data (or empty state if no sessions)

### 1.3 Routes — Beta & Support

- [ ] `/beta` loads — hero, features, pathways, CTAs all visible
- [ ] `/getting-started` loads — 5 steps, tips, contact links
- [ ] `/feedback` form submits — check localStorage key `angel11plus_feedback`
- [ ] `/report-bug` form submits — check `angel11plus_bugs`
- [ ] `/feature-request` form submits — check `angel11plus_features`
- [ ] `/testimonial` form submits — check `angel11plus_testimonials`
- [ ] `/beta-family` form submits — check `angel11plus_beta_families`
- [ ] `/contact` shows email address and quick links
- [ ] `/privacy` loads — full policy text visible
- [ ] `/terms` loads — full terms text visible

### 1.4 Admin

- [ ] `/admin-beta` shows PIN gate
- [ ] Correct PIN (`angel2026`) unlocks dashboard
- [ ] Wrong PIN shows error message
- [ ] After unlock: all stat cards visible
- [ ] Refresh button reloads data from localStorage
- [ ] After submitting a test beta-family registration: count increments
- [ ] Clear events button shows confirm dialog and clears events

### 1.5 Forms — Save Correctly

Open browser DevTools → Application → Local Storage and verify after each submission:

- [ ] `angel11plus_feedback` — entry with `type`, `subject`, `message`, `submittedAt`
- [ ] `angel11plus_bugs` — entry with `page`, `issueType`, `description`, `submittedAt`
- [ ] `angel11plus_features` — entry with `feature`, `why`, `submittedAt`
- [ ] `angel11plus_testimonials` — entry with `parentName`, `yearGroup`, `feedback`, `publishPermission`
- [ ] `angel11plus_beta_families` — entry with all 5 fields + `contactPermission`
- [ ] `angel11plus_beta_events` — event entries for each submission above
- [ ] `angel11plus_beta_events` — `mock_started` event fires when mock begins
- [ ] `angel11plus_beta_events` — `mock_completed` event with pathway + score fires when results save

---

## Section 2 — PWA & Offline

### 2.1 Install Prompt

- [ ] On Chrome (Android/desktop): install prompt appears after first visit
- [ ] On Safari (iPhone/iPad): "Add to Home Screen" works from share menu
- [ ] Installed PWA opens in standalone mode (no browser chrome)
- [ ] Installed PWA shows correct icon (not generic browser icon)
- [ ] Installed PWA shows `Angel 11+` as app name
- [ ] Splash screen shows purple theme colour `#7c3aed`

### 2.2 Offline Support

- [ ] Load `/dashboard` online, then go offline
- [ ] Offline banner (`You're offline — learning continues`) appears at top
- [ ] Previously visited pages still load from cache
- [ ] `/offline.html` fallback shows correctly for unvisited pages
- [ ] Reconnecting online dismisses the offline banner

### 2.3 Service Worker

- [ ] Open DevTools → Application → Service Workers
- [ ] SW shows as `angel-static-v3` / `angel-pages-v3` in Cache Storage
- [ ] SW status shows `activated and running`
- [ ] Update toast appears when a new deployment is detected
- [ ] Tapping Refresh in the update toast reloads with new content

### 2.4 iPad Specific

- [ ] Navigation sidebar shows correctly in landscape and portrait
- [ ] Bottom mobile nav does not appear on iPad (768px+ hides it via `md:hidden`)
- [ ] All tap targets are ≥ 44×44px
- [ ] Text is readable without zoom
- [ ] Session forms (textarea inputs) are comfortable to type in

---

## Section 3 — Dark Mode

Test with OS-level dark mode enabled on each device:

- [ ] `/dashboard` — dark background, no white flash on load
- [ ] `/english` — lesson cards dark
- [ ] `/maths` — active session, correct/incorrect feedback dark
- [ ] `/vocabulary` — word card dark
- [ ] `/writing` — prompt box and textarea dark
- [ ] `/mocks/[pathway]` — all 4 screens (intro/section/between/results) dark
- [ ] `/parent` — all sections dark
- [ ] `/progress` — all cards dark
- [ ] `/beta` — hero and feature cards dark
- [ ] `/getting-started` — step cards dark
- [ ] `/feedback`, `/report-bug`, `/feature-request`, `/testimonial`, `/beta-family` — forms dark
- [ ] Navigation sidebar — dark background, active state visible
- [ ] SupportFooter — subtle dark text on dark background

---

## Section 4 — Mobile (375px viewport)

- [ ] All pages scroll without horizontal overflow
- [ ] Navigation: mobile bottom bar has 5 correct items
- [ ] Bottom nav does not obscure page content (pb-nav-safe applied)
- [ ] All CTA buttons have comfortable tap area
- [ ] Mock exam input field triggers numeric/text keyboard correctly
- [ ] Pathways page scrolls through all 7 cards
- [ ] Parent dashboard all sections visible and readable

---

## Section 5 — Environment & Hosting

### 5.1 Environment Variables

Check Vercel (or hosting provider) dashboard has these set:

- [ ] `NEXT_PUBLIC_APP_URL` — set to production domain (e.g. `https://angel11plus.co.uk`)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` — set if Supabase sync is active
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` — set if Supabase sync is active
- [ ] `OPENAI_API_KEY` — set for `/api/writing-feedback` to function
- [ ] No `.env.local` committed to git

### 5.2 Domain & SSL

- [ ] Custom domain resolves correctly
- [ ] HTTPS is active (SSL certificate valid)
- [ ] `http://` redirects to `https://`
- [ ] `www.` subdomain redirects to apex (or vice versa)
- [ ] `manifest.json` is accessible at `https://[domain]/manifest.json`
- [ ] `sw.js` is accessible at `https://[domain]/sw.js`
- [ ] Icon files accessible: `/icon-192.png`, `/icon-512.png`

### 5.3 Performance

- [ ] Lighthouse PWA score ≥ 90 on production URL
- [ ] Lighthouse Performance ≥ 70 on mobile
- [ ] First Contentful Paint < 2s on 4G
- [ ] Dashboard loads in < 1s on repeat visits (SW cache)

---

## Section 6 — Content Audit

- [ ] All lesson content loads (no 404s on English lessons)
- [ ] Vocabulary words load in quiz and flashcard modes
- [ ] Writing prompts load for all 3 types (narrative, descriptive, persuasive)
- [ ] Reasoning questions load for all 4 types
- [ ] Mock exam questions appear (GL, CEM, CSSE, ISEB)
- [ ] `/api/writing-feedback` returns feedback for writing submissions
- [ ] All pathway descriptions are accurate (no placeholder text)
- [ ] Contact email `hello@angel11plus.co.uk` is correct and monitored
- [ ] Privacy policy date is current (June 2026)
- [ ] Terms date is current (June 2026)

---

## Section 7 — Pre-Recruitment Checks

Complete before sharing the link with any family:

- [ ] Support email inbox is monitored — aim to reply within 48 hours
- [ ] `/admin-beta` PIN has been changed from default if sharing device with others
- [ ] Beta success criteria document reviewed — `BETA_SUCCESS_CRITERIA.md`
- [ ] Beta testing guide reviewed — `BETA_TESTING_GUIDE.md`
- [ ] Onboarding flow tested end-to-end as a new user in incognito mode
- [ ] Getting Started guide (`/getting-started`) reviewed for clarity
- [ ] Beta welcome page (`/beta`) reviewed — all CTAs work

---

## Section 8 — Recruitment Checklist

For each family recruited:

- [ ] Family has been sent the app URL
- [ ] Family has been directed to `/beta` as their entry point
- [ ] Family has been asked to register at `/beta-family`
- [ ] Day 7 check-in scheduled in calendar
- [ ] Day 14 check-in scheduled in calendar
- [ ] Family pathway noted in own tracking

---

## Section 9 — Observation During Beta

After each family starts:

### Week 1

- [ ] Check `/admin-beta` — has beta family registration appeared?
- [ ] Check `angel11plus_beta_events` in admin — any events firing?
- [ ] Any support email received? Reply within 24 hours.
- [ ] Day 7 check-in email sent — use questions from `BETA_TESTING_GUIDE.md`

### Week 2

- [ ] Day 14 check-in email sent
- [ ] Check if family has completed a mock exam
- [ ] Check if parent has visited the Parent Dashboard
- [ ] Request testimonial: send `/testimonial` link

### Ongoing

- [ ] Weekly review of `/admin-beta` data
- [ ] Feature requests reviewed weekly — top patterns identified
- [ ] Bug reports triaged within 48 hours
- [ ] Critical bugs fixed before recruiting next cohort

---

## Section 10 — Feedback Review Process

### Weekly review (30 minutes every Monday)

1. Open `/admin-beta` and review:
   - New beta family registrations
   - Feedback entries — note sentiment distribution
   - Bug reports — triage and fix critical ones
   - Feature requests — group similar requests

2. Update `BETA_SUCCESS_CRITERIA.md`:
   - Mark completed criteria
   - Note current engagement metrics

3. Identify one thing to fix or improve before next week

### Monthly review

1. Answer the question: "Can a family use Angel 11+ without founder help?"
2. Review all testimonials — are they positive? What themes emerge?
3. Evaluate if Stage 1 criteria are met before recruiting more families
4. Decide: fix product OR expand to 25 families

---

## Sign-off

Before inviting First 10 Families:

- [ ] Sections 1–6 complete with no blocking issues
- [ ] Section 7 (pre-recruitment) complete
- [ ] At least one full end-to-end test done in incognito + dark mode on mobile

**Deployment authorised by:** _________________________ **Date:** _____________

---

*This checklist should be re-run before each cohort expansion (10 → 25 → 50 families).*
*Update it based on issues discovered during beta.*
