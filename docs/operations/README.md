# Angel Operations — Investigations, Validation & Activation History

This folder contains Angel 11+'s operational reports — real investigations into production incidents, the evidence gathered, the fixes applied, and the validations that confirmed they worked. Unlike `docs/strategy/`, these are not permanent philosophy documents; they are a dated, factual record of what actually happened in production, kept so the reasoning and evidence behind each fix is never lost or re-litigated from memory.

## Contents, in the order events actually happened

1. **`PRACTICE_EXPERIENCE_REVIEW.md`** — Phase 5B.2. Diagnosed why the four Personalised Practice routes could hang on "Preparing your practice session…" forever: no timeout on any Supabase call, no `try`/`catch` around the loading logic.
2. **`PRACTICE_NAVIGATION_RECOMMENDATION.md`** — Phase 5B.2. Reviewed the "Assessment" navigation against how UK parents actually talk about exam preparation, and recommended splitting it into separately-visible "Practice" and "Mock Exams" entries.
3. **`PRODUCTION_AUTH_VERIFICATION.md`** — Phase 5B.3. Determined that the "Failed to fetch" errors seen while validating the fix above were a genuine Supabase-side outage (a 503 on the auth preflight, identical on every production URL tested), not a Vercel deployment or CORS configuration problem.
4. **`PROFILES_RLS_INVESTIGATION.md`** — Phase 5B.6. Root-caused a second, different failure (a 401 with an explicit RLS-violation message on the `profiles` table) by comparing live production behaviour against every committed migration — establishing that RLS had been enabled out-of-band, contradicting the entire migration history's documented intent.
5. **`RESTORE_PRODUCTION_VALIDATION.md`** — Phase 5B.7. Validated the `profiles` fix in production, and surfaced a further, related finding: `user_stats` and `lesson_progress` had the identical problem, only reachable once `profiles` started working.
6. **`FINAL_PRODUCTION_SMOKE_TEST.md`** — Phase 5B.5. A full, dated, end-to-end walkthrough of production as a beta parent and child would experience it — login, both journeys, every subject, every practice and mock route — with an explicit PASS/FAIL verdict per area.
7. **`ALI_OPERATIONAL_VALIDATION.md`** — Phase 5B.8. The final validation, confirming with direct network and database-level evidence that all three tables' intended RLS state had been restored, and delivering the overall "Ready" verdict.

## How to use this folder

Read newest-to-understand-current-state, oldest-to-understand-how-we-got-here. If a future incident looks similar to anything described above, check here first — the exact evidence, root cause, and fix for each of these is already documented, so it doesn't need to be re-discovered.
