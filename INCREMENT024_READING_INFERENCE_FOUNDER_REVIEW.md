# Increment 024 — English Reading's Second Full Teaching Lesson (RC-02, Inference) — Founder Educational Review

Behavioural/educational review only. No new question-bank content was authored (zero new rows, zero new migration) — this document exists so you can judge the lesson itself before it goes live.

## Founder Decision Record (additive — original review below is preserved unchanged)

**Original decision: APPROVED WITH AMENDMENT** (preserved as the historical decision — never rewritten to plain APPROVED).

**Amendment 1** (GUIDED evidence integrity) **and Amendment 2** (explicit Persona A–F tests): **IMPLEMENTED + FOUNDER VERIFIED.**

**Production release: DEPLOYED + VERIFIED.** Release commit `4267f6c`, pushed to `origin/main` (fast-forward from `34ac354`), deployed to Vercel production (`dpl_8RVAkmHGaRVoBtNjGWdHTZbH8PGL`, status Ready), independently cross-verified via GitHub's own commit-status API (`state: success` for the exact release SHA). 7/7 production routes returned HTTP 200 (home, dashboard, Reading Practice, both Reading lessons, a Mathematics lesson, Mathematics Practice). Visual/authenticated journey verification remains DEFERRED (Chrome browser automation unavailable this session, one attempt made, not retried) — this is a disclosed evidence gap, not a claimed pass, and is not treated as grounds to reopen the educational implementation absent an actual discovered defect.

**Reading full teaching coverage: 2/4**, live in production.

**Reusable educational-integrity finding, worth preserving for future Angel teaching-lesson work:** a learner's own self-assessment of an explanation Angel cannot automatically grade (the real `TIER3_QUOTATION_PLUS_EXPLANATION` architecture's own limitation) must be recorded with `verified: false`, not just `supportTier: "supported"`. The two are separate protections at separate layers — `supportTier` protects **mastery** (`lib/ali/mastery.ts`); `verified` protects **confidence/evidence-state** (`lib/ali/confidence.ts`'s own `anyEvidence` check, which reads `verified !== false` and is indifferent to `supportTier`). A lesson (or any future flow) that reuses self-assessment must set both explicitly — passing only `supportTier: "supported"` and leaving `verified` at its default (`true`) is not sufficient, and was the exact real defect this increment's own Amendment 1 found and fixed (`recordOutcome`'s 9th argument). The live Practice page already got this right for its own Tier 3/5 self-assessment (`recordAndAdvance(..., false)`, "Stage 2 Educational Integrity Correction") — this lesson's own standalone `recordOutcome` call had simply not carried that same fix over, confirming the lesson worth recording: **a shared protection pattern must be re-verified explicitly at every new call site that reuses it, never assumed to apply just because the pattern exists elsewhere in the codebase.**

---

## SELECTED SKILL

**RC-02 — Inference and Justified Interpretation.** Learner-facing title: **"What the Text Doesn't Quite Say."**

## WHY THIS SKILL, AND WHY NOW

Selected via the bounded programme-completion review that also recorded Increment 023's independent-review hold: RC-02 is the largest teaching-coverage gap that requires **zero new content authoring** — the one category of work genuinely unaffected by the newly-discovered fact that Angel's only established independent reviewer is the Founder identity itself. It also has the richest existing reactive-support base of any untaught Reading competency (four families already carrying hint/worked-example scaffolds) and the second-largest real content footprint in Reading (47 practice-eligible rows across 22 passages).

**A real, elevated risk, disclosed rather than assumed away:** inference is inherently more prone than RC-01's literal retrieval to degrading into "spot this wording, pick this answer" pattern-teaching. This lesson was designed against that risk specifically — see the FACT/INFERENCE/GUESS section below.

## THE REASONING MODEL TAUGHT

1. What does the text actually say, directly?
2. What can I reasonably work out from that, even though it isn't stated outright?
3. What exact words or details support my idea?
4. Am I claiming more than the passage actually allows?

This is explicitly threaded through EXPLAIN, MODEL, and COMMON MISTAKES as a three-way distinction: **FACT** (stated directly) vs **REASONABLE INFERENCE** (worked out, evidence-supported) vs **UNSUPPORTED GUESS** (plausible in real life, but not backed by this passage).

## MODEL — "The Late Homework" (original, teaching-only, never a live question)

> Priya's teacher, Mr Adeyemi, always collected homework books first thing on Monday morning... [full text in-app]

Question: *"What can we reasonably infer about how Mr Adeyemi feels about Priya not handing in her homework?"*

Angel's modelled reasoning walks FACT ("bring it in tomorrow, no note needed," then straight back to the register) → INFERENCE (he isn't worried) → evidence-check (Priya's own established diligence throughout the passage makes this a credible one-off) → justified conclusion. It then explicitly **models and rejects a tempting but unsupported guess** — "Mr Adeyemi doesn't care about homework" — showing precisely why it overclaims: the passage's own opening line ("always collected homework books first thing") already disproves general indifference; the evidence only supports calm about this one specific case.

## GUIDED — "The Last Bus" (`w1-lastbus-05`, real, practice-eligible)

*"Find two quotations that show the narrator's anxiety as she runs, and explain what each one shows."* This is a genuine quotation-plus-explanation task — Angel can verify the child found the right evidence (`checkQuotationPresent`, the same real function the live Practice page already uses for this exact validation tier) but cannot auto-grade free-text explanation, so the child compares their own reasoning against Angel's modelled explanation and self-assesses. **This reuses the real, existing TIER3 self-assessment architecture already live in Practice — no new scoring mechanism was invented for this lesson.**

## INDEPENDENT — "The New Girl" (`w1-newgirl-09`, real, practice-eligible)

Deliberately a **different real family** than GUIDED (motive-inference — "why does X do Y" — rather than quotation-plus-explanation), on a **different passage**, cleanly auto-gradable. This tests whether the reasoning process transfers to a genuinely different question shape, not whether the child remembers GUIDED's specific procedure.

**Fresh retry (remediation):** "A Letter to Nana" (`w1-letter-09`) — a third distinct passage, same auto-gradable family.

## STRETCH (optional, secure-first-attempt-only) — "The Empty Classroom" (`w3-rc10-am-02`)

*"Why might the writer choose to end the passage with Maya 'listening to nothing at all' just before she turns the envelope over?"* A genuinely harder reasoning task (narrative-pacing/suspense effect, not obscure vocabulary), a fourth distinct passage. Offered only after correct first-attempt independent success; never required; a single ungated attempt; never claims mastery.

## FIVE DISTINCT PASSAGES, ZERO OVERLAP

Last Bus / New Girl / Letter to Nana / Empty Classroom, plus the original "Late Homework" — five genuinely different passages, confirmed pairwise distinct, and confirmed to share **zero overlap with RC-01's own three lesson passages** (New Trainers, Baker's Apprentice, Storm at the Harbour), test-verified.

## THE FAILURE-CASE TEST (explicitly run, per instruction)

*Would memorising every MODEL and GUIDED answer alone let a child pass INDEPENDENT and STRETCH?* No — INDEPENDENT and STRETCH use entirely different passages, a different question family, and different specific facts from MODEL/GUIDED. Passing them requires applying the reasoning process to new evidence, not recalling anything from earlier in the lesson.

## COMMON MISTAKES TAUGHT

Choosing something plausible in real life but unsupported by the passage; fixating on one word while ignoring context; confusing what happened with why; turning "probably" into "definitely"; picking a sophisticated-sounding but evidence-free answer; importing outside knowledge the text doesn't support. All child-facing, all genuine inference-error classes, none of them a keyword-matching shortcut.

## PREPARATION HORIZON

`RC-02` added to `fullLessonRegistry.ts`. The existing cross-subject/same-subject routing guard (Increment 022) required **no changes** — it is fully generic and already handles any competency, confirmed by test.

## VERIFICATION

49 targeted tests (22 new for this lesson, 5 updated registry tests, 22 regression tests for RC-01/Increment 022/Increment 021 — one genuinely stale RC-02-specific assumption in Increment 022's own test file was found and corrected to RC-03, since RC-02 now has a real lesson). Full suite 3584/3584. Typecheck clean. Scoped lint clean (one genuine unescaped-quote error found and fixed during verification). Copy Quality Guard clean (0/287). Migration SQL Guard clean (unaffected — no migration created). Production build clean, new route present.

**Visual/authenticated verification: DEFERRED**, consistent with every prior increment this session — Chrome browser automation remains unavailable.

## Status

**FOUNDER EDUCATIONAL REVIEW: AWAITING FOUNDER.** No deployment, push, or database change has occurred. This lesson exists only in the local working tree pending your review. Zero dependency on Increment 023 or its held content.
