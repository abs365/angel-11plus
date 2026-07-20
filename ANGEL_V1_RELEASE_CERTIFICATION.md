# Angel Version 1.0 — Release Certification

**RP-001 — Production Readiness Release Certification**

**Status:** Verification-only, per this mission's explicit rule ("No feature development. No redesign. No educational changes."). No code was changed to fix anything found below — this is a certification of current state, not a remediation pass.

**Recommendation: NO GO.** See Section 8.

---

## 1. Production Infrastructure

Fresh live tests against `https://agxunwcdatosrmzhhuxj.supabase.co`, run at the time of writing this certification (not reused from an earlier session):

| Check | Result |
|---|---|
| `profiles` — anonymous SELECT | `200`, empty array — reads work |
| `profiles` — anonymous INSERT | **`401`** — `42501` RLS violation |
| `user_stats` — anonymous INSERT | **`401`** — `42501` RLS violation |
| `lesson_progress` — anonymous INSERT | **`401`** — `42501` RLS violation |
| `ali_question_bank` | **Table does not exist** (`PGRST205`) |
| `ali_student_question_history` | **Table does not exist** (`PGRST205`) |
| Supabase Auth endpoint (`/auth/v1/otp`) health check | `200` — auth infrastructure itself is healthy |

**Anonymous learner:** confirmed broken end-to-end — `ensureProfile()` is the first call every learner-facing flow makes, and it fails before anything else can happen.

**Authenticated learner:** not directly tested with a real logged-in session (no email inbox access in this environment, consistent with every prior verification this programme has run). Reasoned inference, not a direct test: migrations 012 and 014 (written, not yet applied) both grant `to anon, authenticated` identically, and no migration in this repository's history has ever added *any* INSERT policy for either role on these three tables — meaning an authenticated session would almost certainly hit the identical `42501` error today, since Postgres RLS with zero matching policies denies every role, not just `anon`. This is a reasoned inference from directly-observed evidence, not a claim of having tested it.

**Conclusion: Production Infrastructure — FAIL.** Unchanged from every prior Wave's finding. Migrations 004 through 014 are written and reasoned but not applied (this account has no database write access to this project — confirmed again this session via `supabase projects list`, which still only shows `bold-party-production`/`master-growth-os`).

## 2. End-to-End Learner Journey

Performed as **one continuous browser session** (not isolated page loads) with a stateful mocked backend, since production cannot be used (Section 1). This is the strongest verification method available without real database access, and it is stronger than testing each page in isolation: it proves state genuinely carries across the whole journey, not just that each page independently renders.

**Journey walked, in order, exactly as specified:**

1. **Home (`/`)** → redirects to `/dashboard` correctly.
2. **Dashboard** → loads clean.
3. **Learner Dashboard (`/learning-intelligence`)** → loads clean, "Practice now" CTA present.
4. **Practice** → area selector loads; opened Reading Comprehension; answered `eng-001-q2` correctly; reached the results screen showing the freshly-updated profile.
5. **Mock Examination (`/learning-intelligence/mock-exam`)** → timed exam started; answered all three tagged activities (English, Maths, Writing) with no per-question feedback shown (a real exam condition, confirmed by inspection, not just claimed); submitted; **3 of 3 correct**.
6. **Learning Engine (implicit, verified via its outputs)** → the same competency (RC-03, "Word/Phrase Meaning-in-Context Explanation") was touched in *both* the Practice session (step 4) and the Mock Exam (step 5) — the returned-to Learner Dashboard correctly showed it at **"Established"** (the highest tier), and Recent Learning Activity correctly showed **2 attempts total** — direct, positive proof that evidence genuinely accumulates *across* different features hitting the same underlying tables, not just within one feature in isolation.
7. **Learner Dashboard (revisited)** → Competency Profile, Evidence Profile, Diagnostic Overview, Readiness, Recommendations, and Recent Learning Activity all correctly reflected both prior steps combined.
8. **Parent Dashboard (`/learning-intelligence/parent`)** → independently confirmed the same aggregate state in plain language, zero raw codes, "Word/Phrase Meaning-in-Context Explanation — 2 attempts total — just now" — matching the learner dashboard's own numbers exactly.
9. **Founder Dashboard (`/admin-beta`)** → correctly shows the real magic-link sign-in gate (`Beta Admin — Founder-only access — sign in required`), not the dashboard content — confirming the auth boundary holds even under direct navigation with no session. The full Founder Dashboard content itself (including this Wave's new Learning Engine Coverage panel) could not be reached without a real authenticated admin session, which this environment cannot obtain (no email inbox access) — an honest, disclosed limit, not a skipped check.

**Console errors across the entire 9-step journey: two, both already-understood and expected** — `syncLessonComplete`'s fire-and-forget background sync to the (unmocked, real, currently-RLS-blocked) `lesson_progress`/`user_stats` tables, exactly matching Section 1's own finding. This is the *legacy bridge failing exactly as predicted*, not a new defect, and it did not block or disrupt the learner-facing journey at any point — confirmed by the fact that the journey completed successfully regardless.

**One test-harness artifact found and corrected, not misreported as a real bug:** an initial run showed "NaNd ago" timestamps in Recent Learning Activity. Investigated before concluding anything — traced to the mock harness not simulating Postgres's `updated_at` column default (migration 006: `not null default now()`, trigger-maintained), which real production always populates. Fixed the mock, re-ran, confirmed "just now" displays correctly. Recorded here because getting this distinction right — real bug vs. test-harness gap — matters more than the specific finding.

**Conclusion: End-to-End Learner Journey — PASS** (within the constraint that step 9's authenticated content could not be reached). The application logic is sound and genuinely integrated across every feature Waves 1-4 built.

## 3. Product Experience (against Product Experience Standard V1)

Re-confirmed live, via the same journey's screenshots:

- **Gradients**: zero remaining anywhere, including the Dashboard Hero card (now flat purple) and the Vocabulary "Word of the Day" card (now flat emerald) — re-confirmed by repo-wide grep (only the standard document's own changelog text contains the string).
- **XP/Level/Streak UI**: zero remaining on Dashboard, Progress, Parent Hub — re-confirmed visually; Dashboard's Hero card now shows only "0 sessions", no Level/XP/streak line.
- **One primary CTA per page**: Dashboard now correctly shows exactly one solid-purple CTA ("Start Today's Mission"); "Continue" in the Continue Learning row is correctly secondary-styled, confirming the Wave 4 fix holds.
- **Named-feature headers stay Title Case, body/buttons use sentence case**: confirmed on the pages this Wave and Wave 4 touched.

**Conclusion: Product Experience — PASS for the scope this programme actually touched.** Not re-verified against every one of the app's ~40 routes (an honest, already-disclosed limitation from Wave 4, unchanged — see Section 6).

## 4. Educational Integrity (against Assessment Brain V1 / Learning Engine V1)

**Direct, conclusive evidence, not re-derived reasoning:** `git log` against every core educational-logic file (`lib/learningEngine/{types,assessmentBrainMap,rollup,diagnostics,readiness,recommendations}.ts` and both frozen docs, `docs/intelligence/ASSESSMENT_BRAIN_V1.md`/`LEARNING_ENGINE_V1.md`) shows **each file's entire history is exactly the single commit that introduced it** (Capability 1.1 / Capability 2 / Wave 1) — zero modifications across Waves 2, 3, 4, or this certification. The read/write plumbing built in later waves (`practiceContent.ts`, `activity.ts`, `profile.ts`, `evidence.ts`) is likewise unmodified since its own introduction.

This is reinforced, not just asserted: Section 2's live journey exercised this exact code path and produced hand-verifiable-correct output (RC-03 reaching "Established" after evidence from two different features, exactly matching the tier-progression rules `LEARNING_ENGINE_V1.md` §3.3 defines).

**Conclusion: Educational Integrity — PASS.** No drift of any kind since Capability 1.1's freeze.

## 5. Operational Quality

| Check | Result |
|---|---|
| TypeScript | Clean (`npx tsc --noEmit`, zero output) |
| Build | Clean (`npm run build`, all routes generate) |
| Runtime | Confirmed via Section 2's 9-step live journey, zero unexpected errors |
| Performance | Local dev-server timing only (no production-build/CDN measurement possible): 5 key pages loaded in 330-430ms wall-clock each — a directional signal, not a production performance certification |
| Accessibility | Spot-check only (unchanged from Wave 4): 25-element keyboard tab sequence on one page showed a logical order and a visible focus outline on every element. **Not a product-wide audit** — `AXT-003` itself already names visible-focus/keyboard-nav verification as a standing, unclosed gap; this session did not close it |
| Regression | Repo-wide lint: **60 problems (49 errors, 11 warnings) — identical to Wave 4's end state, zero drift** |
| Security | See below |

**Security review, performed this session:** no `dangerouslySetInnerHTML` anywhere in any file this programme added (`app/learning-intelligence/**`, `components/learningEngine/**`, `app/admin-beta/page.tsx`'s new addition) — zero XSS surface introduced. All three new/extended migrations (012, 013, 014) are static SQL with no runtime string interpolation from user input — no injection surface. The new `LearningEngineCoverage` admin panel is confirmed properly gated behind the existing real auth check (`access === "admin"`, itself gated by Supabase magic-link + server-side `is_current_user_admin()`) — it is not reachable pre-authentication. Its underlying data source (`ali_question_bank`) has RLS disabled by original design (migration 005: "content, not user data") — this predates and is unrelated to this Wave's work, not a new exposure. The permissive `WITH CHECK (true)` policies in migrations 012/014 are a **known, previously-reasoned tradeoff** (PR-001), not a new finding — restated here for completeness: they match this table set's already-existing SELECT/UPDATE permissiveness rather than inventing a new, inoperable restriction. `is_current_user_admin()` (migration 008) itself was not independently re-audited this session — it is pre-existing, previously-reviewed infrastructure this session relied on rather than re-derived.

**Conclusion: Operational Quality — PASS**, with the accessibility caveat carried forward honestly rather than claimed closed.

## 6. Remaining Risks

1. **Production is fully non-functional for real learners today** — every table this platform's data layer depends on is either RLS-blocked or does not exist. This is the dominant, launch-blocking risk, unchanged in category since Wave 1, now fully catalogued.
2. **RLS has reverted once already** (`profiles`, per the 2026-07-03 Phase 5B.7 history) after a prior fix was validated working — whatever fix is chosen this time should account for why the first one didn't persist, not just repeat it.
3. **Product Experience Standard V1 compliance is verified on the surfaces this programme touched, not audited product-wide.**
4. **Keyboard/accessibility verification remains a spot-check, not a product-wide audit** — a pre-existing, self-acknowledged gap (`AXT-003`), not newly discovered or newly closed.
5. **Performance figures are local-dev-only** — no real production build, network, or device-class measurement exists.
6. **Authenticated-learner and full Founder Dashboard content paths could not be directly tested** — reasoned by inference from strong, direct evidence (Section 1), not observed first-hand.
7. **The Achievement/Badge system's streak-named and XP-valued badges remain untouched** (Wave 4 finding, unchanged).

## 7. Founder Actions

1. **Apply migrations 004 → 014 in order**, via the Supabase Dashboard SQL Editor — the single highest-leverage action available; nothing else on this list matters until this happens.
2. **Resolve the RLS approach as one decision** for all three tables (`profiles`/`user_stats`/`lesson_progress`) — and specifically investigate *why* the 2026-07-03 fix reverted, so whichever approach is chosen this time is durable, not just repeated.
3. **Re-run this certification's Section 1 and Section 2 checks against live production** once migrations are applied — this account can do this again immediately on request.
4. **Commission a real product-wide accessibility audit** before treating that bar as met.
5. **Decide on the Achievement/Badge rework question** (Wave 4, unresolved).
6. **Decide whether a full ~40-route Product Experience Standard V1 audit happens before or after this launch.**

## 8. Launch Recommendation

**NO GO.**

Not because the engineering is weak — Sections 2, 3, 4, and 5 all genuinely pass, and Section 2 in particular demonstrates real, deep, cross-feature integration working correctly end-to-end. The recommendation is NO GO because **Section 1 is an unconditional, unambiguous fail**: a production launch where no anonymous learner can create a profile, and where the entire Learning Engine has no tables to read or write, is not a partial launch — it is a launch of a product that cannot function for its primary audience. This is not a new conclusion; it is the same finding this programme has surfaced and re-confirmed at every single Wave since Wave 1, now given its final, formal certification.

**This is a database-state problem, not a code-readiness problem.** Once Founder Action 1 is complete, this account can re-verify Sections 1 and 2 immediately, and — barring a new finding — the recommendation would very plausibly change to **GO WITH CONDITIONS** (conditions being: Section 6's remaining audit/accessibility items, addressed before or shortly after launch per the Founder's own risk tolerance). Recommend the Founder read this certification as "apply the migrations, then ask for one more pass," not as a broad rejection of the work.

Per the mission: committed locally, pushed to GitHub, **not deployed** — awaiting independent release review.
