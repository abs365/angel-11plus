# ARCH-001 — Learner Identity Modernisation

**Status:** Backlog item only. No design, no migration, no code. Raised as a standing architectural limitation surfaced during ED-001's investigation — kept deliberately separate from ED-001 itself, which is a specific, scoped defect, not this broader question.

---

## The limitation

Angel 11+'s anonymous learner identity is a client-generated UUID (`device_id`, stored in `localStorage`), upserted into `public.profiles` with no cryptographic verification tying a request to the device it claims to represent. Confirmed during ED-001 (2026-07-23):

- Postgres RLS has no way to verify a request's claimed `device_id` — unlike `auth.uid()`, which is derived from a signed JWT issued by real Supabase Auth on sign-in, `device_id` is ordinary request data a client could set to any value.
- The "textbook" restrictive RLS design once sketched for this table (`device_id = current_setting('app.device_id')`, `supabase/migrations/002_add_auth_user_id.sql`) would not actually provide real security even if implemented — it requires the client to set a Postgres session variable, and nothing stops a malicious client from setting someone else's `device_id` there instead of its own.
- Consequently, today: any anonymous caller can read every row of `profiles` unrestricted (confirmed live, `PR001_PLATFORM_READINESS_REPORT.md`), and the UPDATE policy (`USING (true)`) permits updating any row, not just the caller's own. There is no real per-learner ownership boundary at the database layer for anonymous users.

## Why this hasn't mattered yet

`profiles` today holds only `device_id`, `name`, `auth_user_id`, `created_at` — no sensitive data. The practical exposure of the current permissive posture is low. This is why prior work (PR-001) correctly scoped its fix to match this existing permissiveness rather than invent a partial, non-functional restriction.

## Why it will matter

Every Educational Intelligence table this session's work builds on (`ali_student_question_history`, `ali_educational_audit`, competency evidence, readiness history) is keyed off `profiles.id`. As real evidence accumulates per learner, and especially once real parent/family accounts or any authenticated flow are introduced, the lack of genuine row ownership becomes a real data-isolation gap, not just a theoretical one.

## What a real fix would require

Not a policy tweak. A genuine correction needs:
1. Real Supabase Auth wired to an actual sign-in flow (this app currently has no page exercising authenticated sign-in for the routes tested this session).
2. RLS policies on `profiles` (and, by extension, every table that joins to it) rewritten around `auth.uid()` rather than `device_id`.
3. A migration path for existing anonymous `device_id`-only profiles to link to a real authenticated identity without losing their accumulated evidence history.
4. Decisions about what happens to fully-anonymous, never-authenticated learners going forward (permanently second-class/read-only? forced to authenticate eventually? some other model?).

This is a substantial product and engineering decision, not a bug fix — explicitly not attempted as part of ED-001 or any work this session.

## Recommendation

Scope as its own future work package once there is a reason to prioritise it (e.g. a real authenticated parent/family account feature is planned). Not urgent today given the table's low sensitivity, but should not be forgotten — flagged here so it isn't rediscovered from scratch later.
