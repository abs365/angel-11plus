# Angel V4 — Connected Learning Journey

**Title:** Angel V4 — Connected Learning Journey
**Version:** 1.0
**Status:** Approved
**Project:** Angel 11+
**Phase:** Foundation Version 1
**Owner:** ELBOLD
**Last Updated:** July 2026
**Purpose:** Defines how every experience in Angel — registration, lessons, practice, mocks, results, parent reports — should connect into one continuous learning journey.

---

**Date:** 2026-07-03
**Status:** Strategy only. No implementation, no code, no commits. This document defines the next generation of Angel's experience design — it builds directly on `ANGEL_EXPERIENCE_MANIFESTO.md` (permanent philosophy) and `ANGEL_PRODUCT_PHILOSOPHY_UPDATE.md` (trusted vocabulary, three-pillar direction) rather than replacing either.

---

## Objective

Angel today is a collection of excellent individual experiences — a good lesson, a good practice session, a good mock exam, a good Parent Hub. Each one, reviewed on its own, holds up. What's missing is the thread between them. Right now, when a child finishes almost anything in Angel, the product goes quiet. It answers "how did I do?" well. It almost never answers "what now?"

The objective of this document is to design that thread — a **continuous learning journey** where every ending is also a beginning, so that a child using Angel never has to stop, think, and independently decide what to do next. The destination, at every single moment, should already be obvious.

## Review — Mapping the Complete Journey

Registration → First Session → Daily Practice → Lessons → Practice → Mock Exam → Results → Tomorrow.

Walking this exact chain against the real product (not the intended one) surfaces a consistent, systemic pattern — not scattered bugs, one repeated design gap:

**Registration → First Session.** A parent or child signs in (magic-link) and is sent directly to `/dashboard`. There is no pathway-selection prompt, no first-session framing, no "here's what to expect." **Broken transition:** the journey doesn't have a beginning — it has a login screen and then, immediately, the middle of the product, with no bridge between them.

**First Session → Daily Practice.** A brand-new dashboard shows Today's Mission with a single "Start Today's Mission" button, which opens the first mission item. This part works — it's a real, working forward pointer.

**Daily Practice → Lessons.** This is where the thread breaks for the first time, and it breaks the same way everywhere after this point: Today's Mission is a *ranked list* of 2+ items shown once, on the dashboard. Clicking "Start Today's Mission" opens only the first item. **Broken transition:** nothing carries a child from finishing item 1 to item 2 — they have to independently remember there was a second item and navigate back to the dashboard themselves to find it.

**Lessons → Practice.** Confirmed directly in the codebase: every subject's lesson-completion screen — English (`app/english/[id]/page.tsx`), Maths (`app/maths/page.tsx`), Vocabulary (`app/vocabulary/page.tsx`) — ends with exactly one button: **"Back to [Subject]."** Never "next lesson," never "continue your mission," never a pointer toward Practice or a Mock. **This is the single most consistent broken transition in the entire product** — a child who just did something well is handed, as their only next step, a door back to a list they came from.

**Practice → Mock Exam.** The four personalised practice routes end with a results screen and a "Try Again"/"Back to Mocks" choice. No transition toward a Mock Exam is offered even when performance would reasonably suggest one — a child who has just done very well at Quick Practice is never invited to try a real Mock, and one who's struggling is never gently redirected back toward more Practice instead of straight into a Mock they're not ready for.

**Mock Exam → Results.** Works well — this is the strongest transition in the current product, reviewed in full in `ANGEL_PRODUCT_PHILOSOPHY_UPDATE.md`.

**Results → Tomorrow.** The gap already identified as the single most valuable finding in the Philosophy Update: results screens show a score and a retry/back choice, never a forward pointer. The story stops exactly at the moment of highest engagement.

**The pattern, stated once instead of six times:** Angel is excellent at *arriving* somewhere and excellent at *scoring* what happened there. It has no habit of *departing* toward the next thing. Every broken transition above is the same missing habit, not six different problems.

## The Learning Loop

Extending the Manifesto's five-beat story (Beginning/Journey/Success/Reflection/Tomorrow) with one addition made explicit here: **Challenge**, placed between Journey and Success, because a story with no rising difficulty isn't actually a story — it's a flat sequence of tasks. This isn't a change to the Manifesto's doctrine; it's naming a beat the Manifesto's "Journey" always implicitly contained (personalised difficulty is already how ALI's selection logic works) and giving it its own place in the loop so every feature can be checked against it directly.

- **Beginning** — Today's Mission, a lesson intro, a practice intro screen: one clear sentence, one clear next action. *Already works well.*
- **Journey** — the actual questions, passages, or words. This is ALI's real, invisible work: each item is meant to feel personally chosen, not randomly assigned.
- **Challenge** — the moment difficulty rises because the child is ready for it (ALI's tier progression, already real and working). This should be *felt* subtly, never announced — a session that never gets a little harder doesn't feel like progress, it feels like standing still.
- **Success** — a specific, nameable win at the end, not just a percentage. Already the design intent behind results screens; inconsistently delivered (see Storytelling, below).
- **Reflection** — a brief, honest look back: what was hard, what's improving. Currently lives almost entirely in Parent Hub, rarely in the moment the child themselves just finished something.
- **Tomorrow** — the beat that's currently missing almost everywhere. Every loop must end pointing forward, by name, to something specific — not "come back tomorrow," but "tomorrow, we'll look at X."

Every existing feature maps to exactly one beat today: Today's Mission = Beginning, ALI selection = Journey, ALI's tier/mastery model = Challenge, results screens = Success (partially), Parent Hub = Reflection (parent-only, not child-facing), and almost nothing currently owns Tomorrow. **A connected journey is, concretely, the product finally giving Tomorrow an owner.**

## Mock Journey — Extended Timeline

Building on the mock-completion gap already identified, extended across a longer arc:

- **Before:** works well today — clear intro, clear time commitment, honest "before you start" framing. ALI's quiet influence here: which questions populate this specific mock, invisibly.
- **During:** works well — timed sections, steady progress indication. ALI's quiet influence: nothing changes mid-mock by design (between-mock adaptivity only, a deliberate architectural decision made early in ALI's build, not a gap).
- **Immediately after:** the identified gap — score and breakdown shown, no forward pointer. ALI already knows what this result changes about tomorrow's plan; the product doesn't say so yet.
- **The next day:** Today's Mission should visibly, specifically reflect what the mock revealed — not as a coincidence the child has to notice themselves, but named: "because of yesterday's mock, today includes some extra Non-Verbal Reasoning." ALI's influence here is real (Daily Mission's urgency scoring already responds to this) — the gap is entirely in the *telling*, not the *computing*.
- **The following week:** currently nothing bridges a mock to the week after it. This is the natural home for the Assessment-pillar's proposed Exam Readiness signal to update *visibly*, in the student's own experience, not only in Parent Hub — "your readiness moved a little since your last mock" is a once-a-week moment worth having, using the same plain competency language Parent Hub already uses.

**The throughline for ALI across this whole timeline:** it should influence every single stage listed above, and be *named* in none of them. The child's felt experience should simply be that Angel keeps track of things across time in a way that feels considerate, not that Angel is running an algorithm on their mock results.

## Parent Journey — Building Confidence Over Time

**After one session:** a parent should see one clear, human sentence — what their child did today, in plain language, not a dashboard of numbers. This already broadly works via existing Parent Hub framing; the opportunity is making it feel *timely* (today's session, described today) rather than something a parent has to go looking for.

**After one week:** the first honest pattern — where strength is building, where attention is still needed — described by subject and skill, never by score or code. Already the intent of Parent Hub's competency summaries; the connected-journey opportunity is surfacing a *week-shaped* view specifically, rather than only an always-current snapshot, so a parent's sense of "this week" has its own natural checkpoint.

**After one mock:** this is where the Reflection/Tomorrow gap matters most for parent trust specifically — a parent who sees their child's mock result and, separately, sees Parent Hub calmly explain what it means and what's next, experiences exactly the "Angel always seems to know what my child needs next" feeling this whole philosophy has been building toward. Today, a parent can find this information; it doesn't yet arrive for them at the moment it would matter most.

**After one month:** a parent should have enough to make a real decision — confidence the pace is right, or a specific, honest signal that more focus is needed somewhere. The connected-journey version of this isn't new data; it's the same data finally telling a *story with a shape* — a beginning-of-month baseline, a middle, and a clear "here's where things stand now," rather than an always-identical live snapshot with no sense of arc.

**How confidence should compound:** each of these four moments should feel like it's building on the last one, not repeating it. A parent who has seen Angel accurately describe one session, one week, one mock, and one month — each time in plain language, each time turning out to be right — arrives at "I trust this" not because any single moment convinced them, but because the pattern never let them down.

## Storytelling — Story-First, Not Data-First

Every one of these five concepts should be explained as a *story*, never as a number first:

- **Progress:** not "you've completed 12 lessons" — "you've built a real habit this month, and it's showing in how quickly you're solving these now."
- **Confidence:** not a percentage — "you're getting steadier at these," said only when the evidence genuinely supports it, never as empty encouragement.
- **Readiness:** not a raw score — "you're on track for your [pathway] exam, and here's the one area worth a bit more attention before then."
- **Improvement:** not "+8% this week" — "this was hard for you a month ago. Look at it now."
- **Recommendations:** never "the system recommends" — "let's spend a bit more time on [named skill] this week" — always framed as Angel's next suggestion in the story, never as an algorithm's output.

The test for every piece of copy in the product, going forward: if the sentence would sound strange said out loud by a supportive tutor sitting next to the child, it's still data-first. If it sounds like something a good tutor would actually say, it's ready.

## Connected Experiences — One Journey, Not Seven Modules

Lessons, Practice, Daily Missions, Mock Exams, Parent Reports, Progress, and Recommendations are, today, seven separate systems that happen to share a login. A connected version of Angel treats them as **one continuous record of a single child's evolving understanding**, viewed from seven different angles:

- A **Lesson** is where a competency is first introduced.
- **Practice** is where it's reinforced, chosen by ALI based on the same evidence everything else uses.
- A **Daily Mission** is today's specific plan, drawn from that same evidence, not a separate scheduling system.
- A **Mock Exam** is where that evidence gets tested under real conditions, and where new evidence is generated.
- A **Parent Report** is that same evidence, translated into plain language, for the one audience who needs the story rather than the mechanism.
- **Progress** is that evidence viewed across time.
- A **Recommendation** is that evidence pointing forward.

None of these are different systems today at the architecture level — `lib/ali/*` already treats them this way internally, which is exactly why UX V3's proof (four subjects, zero shared-code changes) worked. What's missing is the *experience* agreeing with the architecture: right now, a child moving from a Lesson to Practice to a Mission to a Mock feels like moving between different apps that happen to share a colour scheme, because each one ends by sending them back to where they started rather than forward through the same underlying story. Closing the broken transitions identified above is not seven separate fixes — it's the one fix (give every ending a "tomorrow," named specifically) applied in seven places.

## Future Opportunities — Motivation, Not Entertainment

Everything below is deliberately unscoped and unapproved — named as a direction worth exploring later, never as a commitment:

- **Gentle milestone moments** tied to real evidence, not arbitrary counters — a first-time mastery of a competency, a first full mock attempted, a genuine month of consistency. The test for any future milestone: would a proud parent, not a marketing team, choose to celebrate this moment?
- **Streaks, kept exactly as calm as they are today** — a quiet number, not a countdown with loss-aversion pressure attached. The manifesto's existing rule (never manufacture tomorrow's motivation through fear of losing today's streak) should govern any future evolution of this mechanic, not be quietly relaxed for engagement's sake.
- **Seasonal or calendar-aware framing**, used sparingly — half-term check-ins, a pre-exam final stretch — genuinely useful because they connect to a family's real calendar, not because a seasonal theme is inherently exciting.
- **Celebration moments scaled to the size of the achievement** — a small acknowledgement for a good session, a bigger one for a real milestone. The failure mode to avoid explicitly: celebrating everything equally teaches a child that nothing in particular matters, which is the opposite of the intended effect.

The single test for all future gamification, stated once so it governs every idea above and every idea not yet had: **does this make the child want to learn more, or does it make them want to play the game more?** The moment those two things diverge, the feature has drifted from Angel's mission, regardless of how well it performs.
