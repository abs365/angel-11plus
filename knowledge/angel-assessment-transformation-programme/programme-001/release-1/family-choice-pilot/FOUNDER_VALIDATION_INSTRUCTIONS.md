# Founder Validation Instructions — Family Choice Pilot

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Family Choice Pilot
**Prepared:** 2026-08-11

---

## Step 1 — Apply migration 022 (required, one-time)

Open the Supabase Dashboard → SQL Editor → New query, paste the full contents of `supabase/migrations/022_family_focus_selection.sql`, and run it. This creates one new table (`ali_family_focus_selection`) and its RLS policies. It does not touch any existing table, row, or policy. This is the same step already performed for migration 021 earlier in this programme.

## Step 2 — Confirm the table exists

In the Table Editor, confirm `ali_family_focus_selection` appears with columns: `profile_id`, `competency_code`, `source`, `active`, `selected_at`, `removed_at`, `updated_at`.

## Step 3 — Test the pilot in the browser

1. Navigate to `/learning-intelligence/founder-validation/family-choice` (dev: `http://localhost:3000/...`).
2. Click "View my recommendation & choose a focus." Confirm Angel's real recommendation appears (evidence-based text, not placeholder copy).
3. Click "Focus on Arithmetic Calculation." Confirm the panel updates to show your chosen focus with a real timestamp.
4. **Reload the page** and repeat step 2 — confirm your focus is still shown as active. This is the one proof point that could not be completed before migration 022 was applied.
5. Click "Start Mathematics practice session," answer a few questions, and finish. On the results screen, confirm the composition line and the `familyFocus.applied`/`wellbeingPaused` debug line are shown.
6. Return to the choice screen and click "Remove focus." Confirm the panel returns to "No focus chosen." Reload and confirm this persists too.

## Step 4 — Optional: observe the wellbeing safeguard

If you want to see the wellbeing veto correctly override a family choice (already proven once this session with real data — see `WELLBEING_INTEGRATION_VERIFICATION.md`), deliberately answer several Mathematics questions incorrectly in the same session, then select MR-01 as your focus and start a new session. If ≥3 consecutive real incorrect attempts in MR-01 have been recorded, you should see: *"Your chosen focus (Arithmetic Calculation) is currently paused by wellbeing pacing."* This is expected, correct behaviour, not a bug.

## What NOT to expect from this pilot (Release Boundary, unchanged)

- Only one competency (MR-01) is selectable — this is the approved single-competency pilot scope, not a picker UI.
- No Continuous Writing personalisation.
- No change to the production Practice pages or the Mock Centre — this pilot lives entirely on its own isolated route.
- No resolution of Gate 3/AR-01.
- No commercial or pricing implication.

## Reporting back

Once Step 3 is complete, the one outstanding item in `FAMILY_CHOICE_PILOT_IMPLEMENTATION_REPORT.md` (§6, "Not yet verified") will be closed — no further engineering work is anticipated to be required for that step specifically.
