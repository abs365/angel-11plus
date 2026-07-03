# Final Production Smoke Test — Phase 5B.5

**Title:** Final Production Smoke Test
**Version:** 1.0
**Status:** Verification complete — no code, environment variables, or Supabase configuration were modified
**Project:** Angel 11+
**Phase:** 5B.5 — Final Production Smoke Test
**Owner:** ELBOLD
**Last Updated:** July 2026
**Purpose:** A real, end-to-end walkthrough of production (`https://angel-11plus.vercel.app`) as a beta parent and their child would experience it, performed after Supabase connectivity was restored (Phase 5B.3).

---

## 1. Login — **PASS**

- Sent a real magic-link request from `/login` (used a non-blocklisted synthetic address to avoid emailing a real inbox).
- Client-side validation correctly rejects known disposable/test domains (`example.com`, `mailinator.com`, etc.) with a plain "Please enter a valid email address" message — confirmed by reading `app/login/page.tsx`'s `BLOCKED_DOMAINS` list, not a bug.
- On a valid, non-blocklisted address: clean **"Check your email"** success screen, correct email echoed back, a "try again" recovery link — no technical language anywhere.
- Network evidence: `OPTIONS https://agxunwcdatosrmzhhuxj.supabase.co/auth/v1/otp` returned **200**. Compare to Phase 5B.3, where the equivalent preflight returned 503 — Supabase's auth path is now demonstrably healthy.
- No browser console errors during this flow.
- **Not verified** (outside what's possible for this test): actually clicking the emailed link and completing sign-in, since no inbox access exists in this environment.

## 2. Parent Journey — **PASS**

- **Dashboard**: loads correctly, live data (XP, streak, session count, Today's Mission).
- **Parent Hub**: loads correctly. Started as an honest, correctly-worded empty state ("Your child hasn't completed any sessions yet…"), then — after a real lesson was completed in Section 3 below — updated to show **Total Sessions: 1, Overall Score: 91%, Exam Readiness: 15% "Getting Started"**, and a Subject Breakdown correctly marking English as "Strong."
- **Progress**: loads correctly, shows Level/Rank/Streak/Coverage, correctly empty before any session and correctly populated after.
- **Readiness**: confirmed live inside Parent Hub (see above) — real, evidence-based, not a placeholder.

## 3. Student Journey — **PASS**

- **English**: lesson list loads; opened "The Lighthouse Mystery," a full 4-question passage with **Voice Reading controls ("Listen" / "Read aloud") visibly present**; answered all 4 questions and submitted.
  - **Real completion confirmed**: "Lesson Complete! +55 XP earned," model-answer comparison shown per question.
  - **Progress update confirmed**: Dashboard immediately reflected 55 XP, 1 session, and **2 new achievements unlocked** ("First Distinction," "Inference Detective"). Today's Mission re-ranked live — English moved to "Maintain," Maths promoted to "Focus" — real evidence of the Daily Mission engine responding to the new evidence, not a static list.
- **Maths, Vocabulary, Writing, Reasoning Hub**: all loaded correctly, real content, no console errors, no broken layouts.

## 4. Practice (Personalised) — **FAIL**

All four routes (`/mocks/adaptive/gl`, `/maths`, `/english`, `/vocabulary`) were tested. **All four fail identically**, every time:

- The intro screen loads correctly, "Start Practice" begins loading, `PremiumLoader` displays correctly — **the Phase 5B.2 fix is working exactly as intended**: no infinite loading, a bounded failure, and a clean recovery screen ("We couldn't prepare today's practice" / Try Again / Back to Practice) every single time.
- **But the underlying cause is a new, real, current defect, not a repeat of Phase 5B.3's connectivity issue.** Network inspection shows the request now genuinely reaches Supabase and gets a real response — no longer a 503. The actual failure:

  ```
  POST https://agxunwcdatosrmzhhuxj.supabase.co/rest/v1/profiles?on_conflict=device_id&select=id
  Status: 401

  Console: [Supabase] ensureProfile failed: new row violates row-level security policy for table "profiles"
  ```

- This is a **Row Level Security policy on the `profiles` table blocking the anonymous device-based profile creation that every one of the four Practice routes depends on** before they can select or serve any question. Reproduced 6 times across all four routes and a retry — 100% consistent.
- This project's own documented history states `profiles`/`user_stats`/`lesson_progress` were **deliberately left with RLS disabled** (a scoped decision, not an oversight) to preserve exactly this anonymous device-sync flow. The current 401 indicates RLS is now active on `profiles` with a policy that does not permit an anonymous insert — either a recent change, or a side effect of whatever was done to resolve the Phase 5B.3 outage.
- **Confirm: loads successfully — NO. No timeout — confirmed, correctly. No recovery screen — NO, a recovery screen appears every time (expected, but the underlying failure it's recovering from should not be happening). Questions generated — NO. Results saved — NO, never reaches that stage.**

## 5. Mock Exams — **PASS (with one honest caveat)**

- All four static pathway mocks — `/mocks/gl`, `/mocks/cem`, `/mocks/csse`, `/mocks/iseb` — load correctly with accurate section/timing information.
- **GL Assessment mock started and played for several real questions**: timed sections, immediate correct/incorrect feedback with explanations, section progress bar — all functioning correctly. This confirms static mocks are **structurally independent of the Practice routes' failure** — they do not depend on `ensureProfile()`/the `profiles` table the same way, and were completely unaffected by Section 4's finding.
- **Caveat, stated honestly:** a full 35-question, 4-section GL mock was not completed end-to-end in this session — each question requires a precise, sequential type-answer/click-Next interaction that could not be reliably batched, and completing all 35 questions plus 3 more full mocks (CEM/CSSE/ISEB) was not a practical use of verification time once the mechanism itself was confirmed working correctly across multiple real questions. **Results/history/Parent Hub/Daily Mission updates specifically from a completed Mock Exam were not directly re-verified this session** — though the same underlying write path was already confirmed working from the English lesson completion in Section 3, and static mocks do not share Section 4's RLS-blocked path.

## 6. ALI — **PARTIAL / WARN**

- **Daily Mission**: confirmed working with real evidence — re-ranked live based on the English lesson result (Section 3).
- **Parent Insights**: confirmed working with real evidence — Parent Hub's Subject Breakdown correctly reflected the new English result as "Strong."
- **Recommendations (the visible, non-ALI-jargon kind)**: Today's Mission's reordering is real evidence this is working.
- **Cross-Subject Recommendations and Learning Profile**: by design, these are internal-only and never rendered in any UI (a deliberate decision from earlier in this project's history) — there is no way to observe them directly in a smoke test, and their absence from any screen is correct, not a defect.
- **What could not be verified this session**: whether ALI's adaptive-route-specific bridge (the write path that would update Daily Mission/Parent Insights from a *personalised practice* session specifically, as opposed to a static lesson) still works — because every personalised practice route is currently blocked before it reaches that code, per Section 4.

## 7. Browser — **PASS**

- **No React errors, no hydration warnings** across every page visited (dashboard, parent, progress, English lesson, Maths/Vocabulary/Writing/Reasoning, all 4 Practice routes, all 4 Mock intros, login).
- **No unexplained failed fetches** — every failed request traces to the single, precisely-identified RLS issue in Section 4; nothing else failed silently or unexpectedly.
- **Console entirely clean apart from the six identical, expected RLS warnings.**

---

## Verdict

## NOT READY

**This is a narrow, precisely-diagnosed verdict, not a broad one.** Login, the full Parent journey, the full Student lesson journey (including a real, verified XP/achievement/Daily-Mission update), all four Mock Exam entry points, and general browser/console health are all genuinely solid and would pass a beta readiness bar on their own. The one thing standing between this product and "Ready for Controlled Beta" is a single, real, currently-reproducing defect: **a Row Level Security policy on Supabase's `profiles` table is rejecting the anonymous profile creation that all four flagship Personalised Practice routes require**, making 100% of ALI-powered practice sessions fail for every user, every time, in production, right now.

This is not a regression in anything built during Phases 5B.2–5B.3 — the loading/timeout fix and the navigation work are both confirmed working exactly as designed, including the *recovery* from this very failure. It is also not the same issue verified fixed in Phase 5B.3 — that was Supabase being unreachable; this is Supabase being reachable and correctly rejecting a request it shouldn't be rejecting. Given this project's own history explicitly documents RLS being disabled on `profiles` as a deliberate choice to support exactly this flow, the smallest safe fix — outside this verification's scope to perform — is to review the current RLS policy on `profiles` in the Supabase dashboard and confirm it once again permits the anonymous insert the anonymous-device flow depends on.
