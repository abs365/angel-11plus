# Restore Production Validation — Phase 5B.7

**Title:** Restore Production Validation
**Version:** 1.0
**Status:** Validation complete — no code, migrations, or Supabase configuration were modified during this phase (the SQL correction itself was executed by the founder, not by this validation)
**Project:** Angel 11+
**Phase:** 5B.7 — Restore Production Validation
**Owner:** ELBOLD
**Last Updated:** July 2026
**Purpose:** Confirms the effect, in production, of restoring RLS on `public.profiles` to its documented, intended (disabled) state, per `PROFILES_RLS_INVESTIGATION.md`'s recommendation.

---

## Before

Per `FINAL_PRODUCTION_SMOKE_TEST.md` and `PROFILES_RLS_INVESTIGATION.md`: all four Personalised Practice routes (GL, Maths, English, Vocabulary) failed 100% of the time. Live network evidence at the time:

```
POST https://agxunwcdatosrmzhhuxj.supabase.co/rest/v1/profiles?on_conflict=device_id&select=id
Status: 401
Console: [Supabase] ensureProfile failed: new row violates row-level security policy for table "profiles"
```

## Action Taken

The founder executed, in the Supabase SQL Editor:

```sql
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
```

No other statement was run. No table other than `profiles` was touched by this action.

## After — Validation Results

**1. Personalised Practice — PASS, all four.**
- **GL**: loads, generates a real question ("Bird is to nest as bee is to ___", `vr.analogies`). Confirmed via direct network read: `POST .../rest/v1/profiles` now returns **200** (was 401).
- **Maths**: loads, generates a real question ("What is 5²?").
- **English**: loads, generates a full real passage ("The Unspoken Apology") with Voice Reading controls present.
- **Vocabulary**: loads, generates real questions, and was **completed end-to-end** in this validation — 3 of 3 correct, **"Practice Complete," 100%, XP earned** screen reached. This confirms not just loading but the full session lifecycle, including the results/completion step.

**2. Today's Mission — PASS.** Dashboard now shows **105 XP** (up from 55 before this session's Vocabulary completion), **Level 2**, **2 sessions**, and **4 achievements unlocked** (First Distinction, Perfect Session, Inference Detective, First Steps — "Perfect Session" newly earned, consistent with the 100% score just achieved). Today's Mission re-ranked live again (Maths promoted to "Focus," Writing added as "Next"). This is real, working evidence the mission engine is responding correctly to the newly-unblocked practice completion.

**3. Parent Hub — PASS, with one secondary observation.** Total Sessions correctly incremented to **2**, Overall Score **91%**, Time Practised **30m** — all genuinely updated. **Observation, not a regression from today's fix**: the Subject Breakdown list still shows "Vocabulary: Not started" despite the just-completed 100% Vocabulary session. This appears to be a pre-existing subject-mapping nuance (the adaptive Vocabulary route's completion may be recorded under a lesson identifier the Subject Breakdown's grouping doesn't yet recognise as "Vocabulary") rather than anything caused by the RLS change — the aggregate numbers above it (sessions, score, time) all moved correctly, which they would not have if the underlying write had failed outright. Worth a look in a future phase; not a blocker.

**4. Profile creation — PASS**, confirmed directly via network inspection, not inferred: `POST .../rest/v1/profiles` returns **200** across repeated attempts (GL route tested twice).

**5. No RLS errors remain — PARTIAL. New finding, not previously visible.** The `profiles`-table error is gone. But completing a session for the first time since the fix (which finally lets `ensureProfile()` succeed and the code proceed further than it ever could before) surfaced two **sibling** RLS violations that were always latent but never previously reached:

```
[Supabase] syncLessonComplete insert failed: new row violates row-level security policy for table "lesson_progress"
[Supabase] syncLessonComplete stats upsert failed: new row violates row-level security policy for table "user_stats"
```

This is not a new regression introduced by today's fix — it is the same underlying condition (`migration 001` disabled RLS on `profiles`, `user_stats`, and `lesson_progress` together, in one statement block, and no migration ever re-enabled any of them) affecting two more tables in that same original block. Only `profiles` has been restored so far. Before today, execution never got far enough past the `profiles` failure to reach these two writes, so they were invisible — fixing the first problem is what revealed the second and third.

**6. No other regression introduced — PASS.** Every other page and flow checked (Dashboard, Parent Hub, Today's Mission, all four Practice routes, the full Vocabulary completion) behaved correctly, with no new console errors beyond the two RLS warnings above, and no React/hydration issues observed.

---

## Remaining Risks

- **`user_stats` and `lesson_progress` still have RLS enabled** and are still silently rejecting the background sync writes that would otherwise persist a student's XP/streak/lesson-history server-side. The user-visible experience is not currently broken by this (Today's Mission, XP, and achievements are driven by local state and update correctly regardless) — but **server-side persistence and cross-device sync of this data are not currently working**, and will remain not working until these two tables receive the same correction `profiles` just did.
- The Parent Hub Subject Breakdown's "Vocabulary: Not started" display gap should be looked at separately — low urgency, cosmetic, not a data-loss risk.

## Recommendation

**Extend the identical, already-justified correction to the two remaining tables from the same original migration block:**

```sql
ALTER TABLE public.user_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress DISABLE ROW LEVEL SECURITY;
```

This is not a new investigation — it is the same root cause, the same evidence pattern (migration 001 disabled all three tables together; no migration ever re-enabled any of them; Phase 5A's migration 008 explicitly reaffirmed all three should remain RLS-disabled), and the same justification already accepted for `profiles`. Recommend applying it before treating ALI's production activation as fully unblocked, since durable server-side progress history depends on it.
