# ANGEL 11+ — COMPLETE CSSE TWO-PAPER MOCK FINAL PRODUCTION ACCEPTANCE REPORT

Date: 2026-09-09. Base commit: `357c56e`. Migrations 245/246/247: still **NOT APPLIED**. `english-full-mock-v1` still **inactive**. No production activation has occurred as a result of this report.

**This report covers Section A (Q2 educational review) in full, executed directly. Sections B onward are BLOCKED by a genuine, hard technical constraint disclosed in full below — not attempted, not simulated, not fabricated.**

---

## A. Q2 educational review

**Q2 EDUCATIONAL GATE = PASS.**

Method: read the actual raw SVG source in full (no `<text>` elements anywhere — confirmed no embedded/accidental text of any kind); read the actual current learner-facing task text (`lib/ali/questionFactory/englishQ2PictureNarrativeFamily.ts`); then independently re-rendered the **actual asset**, fresh, via a temporary local dev server and a live Chrome browser screenshot (not the metadata, not the tests, not a memory of the earlier check) — full-frame and two close-zoom passes on the shed/door/window/vine detail and the ground/path area.

Findings against each required criterion:

- **Embedded answers / inappropriate clues / accidental text:** none — verified twice, once by reading the raw XML (zero `<text>`/`<tspan>` elements exist in the file) and once by visual inspection at full zoom.
- **Visual defects:** none found on close zoom of the shed structure (plank lines, window cross-bars, door skew, vine dots) — clean edges, no artefacts, no z-order glitches, no colour-banding.
- **Copyright/originality:** flat, hand-authored vector shapes (gradients, paths, polygons) only — no photographic or stock-derived content of any kind, confirmed by direct source read.
- **Age-appropriateness:** a calm, empty garden scene (shed, tree, birds, grass, sky) — no people, no violence, no distressing content, no scary or ambiguous-in-a-bad-way imagery. Entirely suitable for a Year 5/6 child.
- **Narrative openness:** the door is genuinely ajar (a dark interior gap, neither fully open nor closed) with no person, animal, or object visible either inside or outside — the scene supports many legitimate stories (someone about to go in, someone who just came out, something living inside, a discovery, a memory) without prescribing any single correct one. This is a real strength, not merely an absence of defect.
- **Ambiguity:** appropriately open for a story prompt while remaining concrete and easy to describe in seconds (shed, door, tree, birds, path, garden) — not confusingly vague.
- **Accessibility:** `role="img"` with `aria-labelledby` correctly referencing a real `<title>` and `<desc>`, both present and descriptive; the separate `altText` field in the TypeScript task record was cross-checked against the actual rendered image and matches it accurately (not a stale or mismatched description).
- **Relationship between image and prompt:** the prompt text ("Write a story based on the picture below.") is generic and does not presuppose any specific narrative — a correct pairing with an intentionally open image.
- **Suitability for a timed task:** the scene is legible in seconds (one clear building, one tree, an open sky) — appropriate for a 25-minute allocation where planning time matters, not a complex multi-panel image requiring long study.

**One minor, purely cosmetic (P4) observation, not a gate failure:** the SVG's own "garden path" shape (a tan polygon) is drawn *before* the shed in element order, so it is entirely hidden behind the shed's opaque front wall in the final render — dead geometry with zero effect on what a learner actually sees (confirmed: the visible scene is unaffected; no path is meant to be a required narrative element). Worth a cheap cleanup in a future pass, not worth blocking this gate over.

**No P0/P1/P2 educational defect found.** Q2 passes independent review.

---

## B–V: BLOCKED — cannot apply migrations 245/246/247

**I do not have the technical capability to execute Section 2 (apply the migration sequence) in this environment, and every subsequent section (C onward) depends on that step having happened. I have not attempted, simulated, or fabricated any part of B–V — they are honestly unexecuted, not silently assumed to have passed.**

This is not a policy choice or caution on my part — it is a hard, previously and independently confirmed constraint of this specific deployment, documented across multiple prior, unrelated sessions in `ALI_DECISION_LOG.md` (e.g. its own entries on Decisions around migrations 070, 244, and the `ali_family_review` review-evidence lookup), and re-verified directly, again, just now:

- `.env.local` contains exactly two Supabase-related values: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (a real anon-role JWT) and, under the name `NEXT_PUBLIC_SUPABASE_URL`, a `sb_publishable_...`-shaped string that is **not actually a URL** — a pre-existing local misconfiguration, not something I introduced. No `SUPABASE_SERVICE_ROLE_KEY` or any other elevated credential exists anywhere in this repository or environment (confirmed by direct grep, again, this turn).
- No Supabase MCP tool, Supabase CLI session, or any other database-administration tool is available to me in this environment. The only database MCP tools available are for **Neon** (`mcp__Neon__*`) — a different Postgres provider entirely, unrelated to this project's actual database (Supabase project `agxunwcdatosrmzhhuxj`).
- Applying schema migrations (creating tables/functions, altering columns, granting privileges) requires database-owner or service-role privileges. The anon key — even if the URL above were corrected — grants only the `anon`/`authenticated` role's own PostgREST-exposed surface, which structurally cannot execute DDL under any circumstance. This is not a permissions setting I could work around; it is how Supabase's own security model is designed to work, and exactly why every migration in this entire project's history (070 through 247) has been generated as a SQL file for the Founder to apply manually via the Supabase Dashboard's own SQL Editor, never applied by an agent.

**What I could not therefore do, honestly:** apply migrations 245/246/247 (§2); verify their post-application structure against the real production schema (§3); run a pre-activation Q1/Q2 smoke test against live production data (§4); flip `english-full-mock-v1.active` (§5); or conduct any part of the real-learner acceptance (§6–§17), since all of it depends on the schema and the activated form actually existing in production first. Reporting a PASS, GO, or any specific structural/behavioural finding for these sections would mean fabricating evidence I do not have — I have not done that.

### What I can still do, and what I need from you

Once you (or someone with real Supabase Dashboard access) applies the three migrations **in the required order — 245, then 246, then 247** — I can resume and genuinely execute most of the remaining acceptance program:

- **Structural verification (§3)** and **read-only smoke checks (§4)**: I can now correctly derive this deployment's real Supabase URL from the anon key's own JWT payload (`ref: agxunwcdatosrmzhhuxj` → `https://agxunwcdatosrmzhhuxj.supabase.co`) — the prior local-script connection failure was caused by the malformed `.env.local` value, not a deeper problem — so I can run genuine, authenticated read verification of the new RPCs/tables via the same anon-key path a real learner uses, once they exist.
- **Real-learner acceptance (§6–§17)**: fully executable via Chrome browser automation against the actual deployed app (`https://angel-11plus.vercel.app`), using a real non-admin learner account and the real learner UI, exactly as your instructions require — but I need you to either confirm an existing test-learner account I should sign in as (this session has no currently-valid stored session), or tell me how you'd like that identity established. I will not use admin privileges to simulate learner behaviour.
- **Activation (§5)**: flipping `english-full-mock-v1.active = true` is itself a one-line SQL `UPDATE` with the same DDL/DML-privilege requirement as the migrations above — I can prepare the exact statement, but applying it has the same hard constraint as §2 and needs to happen through the same channel (Supabase Dashboard, run by you or someone with that access), unless you provision me a working service-role credential or Supabase MCP connection, which I'd flag for your explicit confirmation before using given the stakes even if it were available.

### Exact action needed from you now

1. Open Supabase Dashboard → SQL Editor for project `agxunwcdatosrmzhhuxj`.
2. Run `supabase/migrations/245_csse_english_full_paper_writing_assessment.sql` in full. Confirm it completes without error.
3. Run `supabase/migrations/246_csse_english_q2_picture_narrative_completion.sql` in full. Confirm it completes without error.
4. Run `supabase/migrations/247_writing_evidence_ingestion_claim.sql` in full. Confirm it completes without error.
5. Tell me it's done (and confirm which test-learner identity to use for §6 onward, if one already exists) — I will then continue directly from §3 (structural verification) through to the final GO/REVISE/NO-GO report, without needing to re-litigate anything above.

Do **not** flip `english-full-mock-v1.active` yourself yet — per your own §5, activation should happen only after §3/§4 verification passes, which I'll do as soon as I can reach the applied schema.

---

## Interim status

- **Q2 educational gate:** PASS.
- **Production state:** unchanged — migrations unapplied, English form inactive, nothing published.
- **Overall verdict:** **not GO, not REVISE, not NO-GO** — those verdicts describe the *educational/architectural* quality of the work, and nothing here found a defect in it. This is a **capability blocker**: I genuinely cannot execute the database-privileged steps this acceptance program requires from inside this environment, and I would rather stop and tell you that plainly than guess, simulate, or claim completion I can't actually stand behind.

**STOP. Awaiting migrations 245→246→247 applied by you, plus test-learner identity confirmation, before continuing.**
