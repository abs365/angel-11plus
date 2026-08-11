# Founder Validation Assessment (CSSE) — Test Instructions

**Prepared:** 2026-08-10

---

## Before You Start — One Required Step

This route's content cannot be loaded until `supabase/migrations/021_founder_validation_csse_assessment.sql` is applied to the database. This session has no Supabase Dashboard access and no service-role key, so this step must be done by you (or someone with Dashboard access), the same way every migration in this project has always been applied:

1. Open the Supabase Dashboard for this project → SQL Editor → New query.
2. Paste the full contents of `supabase/migrations/021_founder_validation_csse_assessment.sql` and run it.
3. Confirm it ran without error. It only adds 11 new rows (all ids start with `fv-`) — it does not touch any existing row.

## Where to Go

Run the app locally (`npm run dev` from the project root — a dev server was already running in this session at `http://localhost:3000`, but start your own if that one is no longer active), then visit:

**`http://localhost:3000/learning-intelligence/founder-validation/csse`**

This route is not linked from any menu or navigation — you must go to it directly by URL. It has not been committed, pushed, or deployed anywhere; it exists only in this local working tree until you decide otherwise.

## What to Test

1. **Read the intro screen fully**, including the "What this is and isn't" list — it discloses the timing approximation, the difficulty-judgement basis, the Applied Reasoning exclusion, and that this writes real evidence-pipeline/Mock Attempt Ledger data.
2. **Sit the whole assessment** — 5 English questions on one original passage ("The Orchard"), then 6 Mathematics questions. Answer genuinely, as if judging the questions themselves, not just clicking through.
3. **Watch the timer** and notice whether the pacing feels reasonable for the reasoning demand of each question — remember this is a scaled estimate for an 11-item slice, not the real 30/60-minute section timing.
4. **Submit and read the results screen**, including the **Founder Evidence View** beneath your score — every item shows its Question Type, competency, evidence source (real CSSE paper/question references), originality declaration, difficulty basis, correct answer, and your actual answer.

## What NOT to Assume

- **This is not the real CSSE Mock** — it is separate, smaller, and not connected to it.
- **A high or low score here is not a readiness measurement** — there is no calibrated pass/fail line, and the item count is too small to be statistically meaningful.
- **The timing is not exam-equivalent** — do not judge real exam pressure from this slice's pacing.
- **Nothing here has been independently reviewed yet** — every item is at "Authentic Assessment Candidate" status (self-certified traceability), not "Independently Validated."
- **Completing this will write to your real profile's evidence history and Mock Attempt Ledger** — if you'd rather not mix test data with a real learner profile's data, consider which profile/browser session you use.

## What to Record

For each item, or for the assessment as a whole, note:

- Does the question genuinely feel like the kind of thing a child would face in the real CSSE exam — not just correctly tagged, but *recognisable* as that kind of demand?
- Does the passage ("The Orchard") read as a credible, age-appropriate, CSSE-style extract?
- Do the Mathematics questions feel like real reasoning, not disguised arithmetic drills?
- Is the Founder Evidence View's traceability actually convincing, or does any item feel like its evidence citation is a stretch?
- Does the overall shape (question mixture, progression, timing pressure) feel like the start of something you'd trust to prepare your own child — or does it still feel like a demo?

## How to Report Back

State plainly: does this feel genuinely suitable as the foundation for serious CSSE preparation, or not yet — and if not yet, name the specific thing that's missing or wrong, not just a general impression. This determines whether the next increment scales this method or fixes something first.
