# ANGEL 11+ — Programme Increment 008V
## Mock Visual and Product Experience Standard, V1

**Status:** Founder-authorised. **Mode:** Research + benchmarking + product experience architecture only. **No implementation in this increment.** No code, migration, or test file was written or changed to produce this document.

**Evidence tags used throughout:**
- **[OFFICIAL EVIDENCE]** — sourced from an authoritative primary document/site, cited with a specific location.
- **[COMPETITOR OBSERVATION]** — sourced from a competitor's own published material (marketing copy, feature descriptions). Never a claim of having seen a live screenshot unless stated.
- **[PRODUCT INFERENCE]** — a reasoned judgement drawn from the evidence, not itself a fact.
- **[FOUNDER REQUIREMENT]** — a boundary or principle stated directly in the 008V directive, restated for traceability, not invented here.
- **[ANGEL 11+ DESIGN DECISION]** — this document's own recommendation.

---

## PART 1 — Current Angel 11+ Mock Experience (Codebase Reconstruction)

*[PRODUCT INFERENCE / direct code citation — reconstructed by tracing the actual repository, not assumed]*

**Architecture finding, load-bearing for the gap analysis in Part 22: two parallel, disconnected Mock systems exist today.**

1. **The secured 008D engine** — `lib/mockAttempt/client.ts:27,37,57,70,79`, wrapping the 5 proven SECURITY DEFINER RPCs. Called from exactly one place in the app: `app/learning-intelligence/mock-attempt-preview/page.tsx`, whose own header states it is deliberately unlinked from every navigation surface and must not be reachable by a real learner. It hardcodes a fixture form ID (`008d-test-fixture-form`) — this is the verification harness from Decisions 90/91, not a product surface.

2. **The live, reachable "Full CSSE Mock"** — the destination the Mock Centre's own "Start mock" button actually links to (`app/mocks/page.tsx` → `/learning-intelligence/mock-exam`) — is `app/learning-intelligence/mock-exam/page.tsx`. It never imports the secure client. It calls `fetchMockEligibleQuestionBank()` (`lib/ali/questionBank.ts:112-131`), a raw `.select("*")` against `ali_question_bank` with no field projection, then grades client-side. `app/mocks/adaptive/english/page.tsx` shares the same pattern.

   **This is not currently a security defect.** Decision 87's RLS predicate on `ali_question_bank_select_all` (`eligibility_status IS DISTINCT FROM 'mock_eligible' OR is_current_user_admin()`) means a non-admin query for `mock_eligible` rows returns nothing regardless of what this page does — Layer 1 backstops it, and Mock Eligible is 0 today. Per the directive's own stop condition, this does not trigger the "security defect → document and STOP" clause.

   **It is, however, a structural product dead-end.** The moment real Mock content exists, this route's own query will still return zero rows for any real learner — RLS will simply make the product's primary "Start mock" entry point silently empty. It is disconnected from the one engine actually designed to serve real Mock content. This is carried into Part 22 as a CRITICAL gap.

**Classification (KEEP / IMPROVE / MERGE / RETIRE / NOT YET BUILT):**

| Element | Location | Classification | Reason |
|---|---|---|---|
| 008D secure RPC engine | `lib/mockAttempt/client.ts:27-79` | **KEEP** | Proven secure (Decisions 87–91), server-authoritative; needs a real UI, not rework |
| 008D preview shell | `app/learning-intelligence/mock-attempt-preview/page.tsx` | **IMPROVE** | Correct data flow, zero product design — the right foundation |
| "Full CSSE Mock" live runner | `app/learning-intelligence/mock-exam/page.tsx` | **RETIRE** | Disconnected from the secure engine; client-side grading; dead-ends once real content exists |
| `fetchMockEligibleQuestionBank` direct-select pattern | `lib/ali/questionBank.ts:112-131` | **RETIRE** (for Mock use) | Bypasses field-level redaction entirely; safe today only because RLS backstops it |
| Mock Centre hub | `app/mocks/page.tsx` | **IMPROVE** | Good honest "coming later" labeling, uses the real design-system components; destinations need repointing |
| `mock-test` runner | `app/mock-test/page.tsx` | **RETIRE** | Oldest generation, hardcoded 6-question local content, no design-system usage |
| `mocks/[pathway]` runner (GL/CEM/ISEB) | `app/mocks/[pathway]/page.tsx` | **MERGE** | Real content and an honest available/coming-soon pattern worth preserving conceptually, but three parallel runners should become one on the secure engine |
| `mocks/adaptive/*` runners | `app/mocks/adaptive/{english,gl,maths,vocabulary}/page.tsx` | **MERGE** | These are adaptive practice, not formal Mocks — the naming collision with "Mock" is itself the Part 13 taxonomy problem |
| Mock Readiness parent page | `app/learning-intelligence/parent/mock-readiness/page.tsx` | **KEEP** | Best-designed piece of the surface — restrained, evidence-based, correctly scoped |
| Shared `components/ui/*` primitives | `components/ui/*.tsx` | **KEEP** | A real design-system foundation already exists; legacy pages should move onto it |
| Timer (3+ independent client-side implementations) | multiple | **RETIRE** (all but 008D's) | No shared component; only the 008D preview's server-`expiresAt` pattern is trustworthy for a formal Mock |
| Question/passage renderers (4+ independent implementations) | multiple | **RETIRE** (all) | Must be built once, against the secure engine's payload shape |
| Review/flag/question-palette UI | — | **NOT YET BUILT** | No implementation anywhere, despite the RPC layer already supporting the locked/submitted states it would consume |
| Multiple-choice answer control | — | **NOT YET BUILT** | Only free-text inputs exist in any runner, despite the real CSSE paper mixing formats |
| Mobile-specific Mock treatment | — | **NOT YET BUILT** | No responsive breakpoint handling found in any Mock runner |
| Accessibility (focus/keyboard/ARIA) beyond one live-region | — | **NOT YET BUILT** | 3 total ARIA occurrences across the entire Mock surface |

---

## PART 2 — CSSE Exam Authenticity

*[OFFICIAL EVIDENCE — read directly from csse.org.uk and the full 16-page "11+ Selective Test Information Guide, 2027 Entry" PDF, not summarized secondhand]*

**OFFICIAL EXAM FACT:**
- Two papers only: English and Mathematics. No third paper, no VR/NVR component — the guide consistently refers to "two separate tests" throughout the checklist, background, and FAQ sections; no VR/NVR is mentioned anywhere in its 16 pages.
- English: 60 minutes + 10 minutes additional reading time. Mathematics: 60 minutes.
- Each paper is standardised and weighted, worth 50% of the overall standardised score. Results are age-adjusted by date of birth where the analysis requires it.
- Content is based on Key Stage 2 of the National Curriculum, and the guide explicitly warns that commercially available practice books are "not of the same format as the 11+ papers."
- Permitted equipment: pen, pencil, ruler, eraser only. Not permitted: calculators, highlighter pens, dictionaries, smartwatches, mobile phones.
- No re-marking policy — CSSE schools have a joint policy not to re-mark papers.
- Results are emailed to all candidates after close of business on the results date; the email contains raw subject scores and the overall standardised score. Minimum standardised score for any offer: **303** (2027 entry cycle) — successful appeals and special-consideration places sit outside this threshold.
- CSSE is its own bespoke exam board — it writes, sets, and marks its own papers (not GL Assessment or CEM).
- 2027-entry cycle dates: registration opens 12 May 2026, closes 19 June 2026; special-adjustment deadline 26 June 2026; test day Saturday 19 September 2026 (Tuesday 29 September 2026 alternate for religious/illness/exceptional circumstances only, evidence required); results 12 October 2026; National Offer Day 1 March 2027.
- **Load-bearing recent change:** effective September 2024 (2025 entry onward), the CSSE English paper **no longer contains Applied Reasoning questions** — confirmed directly from the CSSE homepage. Any CSSE-aligned English Mock content or format description must reflect this; Applied Reasoning was previously part of the paper and has been formally removed.
- Continuous Writing is confirmed as a genuine CSSE-set component — an official "English Continuous Writing" sample mark scheme is published on csse.org.uk/examination/ — not a school-invented add-on.

**COULD NOT CONFIRM (genuinely open, not a research shortfall — the official Information Guide does not publish this level of paper-structure detail, confirmed by reading all 16 pages directly):**
- The exact timed placement of Continuous Writing within, or alongside, the 60-minute English paper.
- A detailed Mathematics topic/section breakdown beyond "Key Stage 2 National Curriculum."
- Whether the English paper includes any multiple-choice component or is fully open/written-answer (secondary tuition-industry sources claim a mixed format; this is not confirmed against any official CSSE source).
- Precise SEND/access-arrangement mechanics beyond the existence of a notification form and the 26 June 2026 deadline.

**Implication for design:** every Part 6–8 recommendation below that touches exact paper mechanics (Continuous Writing timing, question-type mix) must be built as a **configurable, clearly-labelled assumption**, not hardcoded as CSSE fact, until a human confirms it directly with CSSE or a candidate's own test-centre experience. This is the single most important open item feeding Part 22.

---

## PART 3 — 11+ Competitor Benchmark

*[COMPETITOR OBSERVATION — sourced from each product's own published marketing/feature copy via web research, not live screenshots or demos; one tier below direct product inspection]*

| Product | Strongest observed pattern | Weakest observed pattern |
|---|---|---|
| **Atom Learning** | Deepest reporting found: standardised age score + raw score + per-question timing + topic-level breakdown + cohort benchmarking against thousands of applicants to the same schools | No evidence found on passage handling, accessibility, or mobile — a real evidence gap, not a claimed absence |
| **BOFA (Planet BOFA)** | Explicitly forbids pause/retake on its own Mock instrument while allowing adaptive difficulty in ordinary practice — **independently validates the Founder's own sealed-vs-adaptive boundary** stated in this directive | Space/rocket theming and medal/trophy rewards read young and game-like; no evidence this tone is suppressed during the sealed Mock itself |
| **Bond 11+ (OUP)** | High practice-paper volume (8 mocks/month, 20,000+ questions) | Unmechanised "AI personalisation" marketing claim with no disclosed mechanism; user reviews report login/account-access reliability problems |
| **PiAcademy** | Timed, break-structured, format-mirroring mocks with instant marking and step-by-step post-test solutions | No evidence found on question-screen layout, passage UX, or accessibility |
| **11 Plus Swot** | "Answer Genie" — a named, specific explain-on-demand mechanism at review stage, rather than a blanket answer reveal | Legacy player (since 2004); no modern-UI signal found in any material reviewed |
| **11 Plus Exam Papers** | Per-question "% of students who solved this correctly" — a comparative-difficulty signal not seen elsewhere in this set | Primarily a papers/video product; no evidence of a distinct on-screen mock-taking interface |
| **CGP 11+ Online** | Clear two-mode split (full mock vs. quick 10-question topic test) mirroring this directive's own Part 13 taxonomy concern | Leans gamified/"light-hearted" throughout its own marketing, with no evidence the tone changes for a timed mock specifically |
| **Exam Papers Plus** | Very high satisfaction signal (18,493 reviews, 4.94/5) on content authenticity | Content/video product, not an interface benchmark |

**Adopt-worthy patterns:** the sealed/adaptive split BOFA already implements in production is the strongest external validation of this directive's own Part 14 boundary. Multi-dimensional reporting (score + timing + cohort + per-question difficulty) consistently outperforms a single score across every competitor that goes beyond the basics. Explanation-on-demand is a specific, nameable, better-than-blanket-reveal pattern.

**Avoid:** persistent gamification bleeding into assessment mode (BOFA, CGP); undisclosed "AI-powered" claims (Bond) — directly the vague claim this directive already instructs against; reliability complaints (Bond) show brand strength does not substitute for engineering trust, which belongs in Part 19 as a real differentiation axis, not just visual polish.

---

## PART 4 — Broader Digital Assessment Benchmark

*[COMPETITOR OBSERVATION / PRODUCT INFERENCE — synthesized from professional CBT systems and adaptive-learning products outside 11+ prep]*

| Principle | Source | Adopt? |
|---|---|---|
| Persistent question-status palette (numbered grid: unattempted / attempted / flagged), clickable | Pearson VUE / Prometric candidate interfaces | **Adopt directly** — this is the concrete implementation for the "which questions have I missed/flagged" requirement already in Part 5 |
| Mandatory end-of-section review screen before final submit | Same Prometric/Pearson VUE pattern | **Adopt directly** — natural basis for the unanswered-warning and final-confirmation steps |
| Real-time item-difficulty adaptation | Duolingo English Test | **Reject inside the sealed Mock** — directly the mechanic this directive's Founding Principle already forbids in a formal Mock; confirms the boundary is correct, not merely cautious |
| Short orientation/equipment-check before a high-stakes test begins | Duolingo English Test pre-test flow | **Adopt with modification** — no ID/camera verification needed for an 11-year-old, but a brief "how this screen works" step before the timer starts reduces first-question confusion at no cost to validity |
| Accessibility failures cluster around embedded non-text elements (calculators, images, icons), not base text | Peer-reviewed CBT accessibility study | **Adopt as a build constraint** — Angel's Maths diagrams/tables/geometry figures need explicit accessible equivalents; this is the concrete risk area, more than colour contrast alone |
| Short-session, reward-animation, playful framing | Khan Academy Kids | **Reject inside the sealed Mock; adopt for surrounding practice** — reward animation and playful tone undercut exam authenticity for a child old enough to sit a real selective-school paper; correct for practice, wrong for the formal instrument |
| Lightweight, corner-anchored, always-reachable accessibility control (text size/contrast) rather than a full settings page | Pearson VUE preferences panel | **Adopt with modification** — matches "accessibility must not undermine examination authenticity"; small and non-competing with the question itself |

**Evidence gap, stated honestly:** GL Assessment's own digital Mock delivery interface could not be found publicly documented in this research pass — a genuine benchmark gap, not a claim it doesn't exist.

---

## PART 5 — The Angel 11+ Mock Journey

*[ANGEL 11+ DESIGN DECISION, built directly against Part 1's real architecture and Parts 2–4's evidence]*

**PRE-MOCK**
1. **Mock recommendation** — surfaced from Preparation Stage + evidence confidence + exam proximity, not from a raw content trigger; recommendation logic lives outside the sealed Mock entirely (Part 14 boundary).
2. **Why this Mock is appropriate** — one or two plain-language sentences citing the specific evidence gap or Preparation Stage milestone that triggered the recommendation — never a bare "you're ready" claim without a stated reason.
3. **Preparation-stage context** — shown, not decided by, the child; framed as "where you are," never as a pass/fail gate to starting.
4. **What the child will practise/test** — subject(s), paper count, approximate duration, stated plainly before commitment.
5. **Exam information** — the OFFICIAL EXAM FACT items from Part 2 relevant to this Mock type, never the UNCONFIRMED items presented as settled.
6. **Equipment/environment guidance** — pen, pencil, ruler, eraser; quiet space; no phone nearby — mirrors the real CSSE day exactly (Part 2), building authentic habit before it matters.
7. **Readiness to begin** — an explicit, unhurried "I'm ready" step, never an auto-start on page load.
8. **Instructions** — restated once, plainly, immediately before the timer, not buried earlier in the flow.
9. **Confidence-building orientation** — Part 4's DET-derived "how this screen works" step: a short, skippable walkthrough of the workspace controls (not the content), so the first real question isn't also the child's first exposure to the interface.

**START**
10. **Clear start boundary** — a single, deliberate action separates orientation from the timed instrument; no ambiguity about when the clock starts.
11. **Timer commencement** — server-authoritative from the moment of this action (per the already-proven `mock_start_attempt` `expires_at` pattern — Part 1).
12. **Examination-condition transition** — a brief, calm visual/tonal shift (not a loading spinner) signalling "this is now the real thing," distinct from ordinary practice screens.

**DURING MOCK**
13–15. **Question / English passage / Mathematics workspace** — one shared question-renderer component (Part 1 found four+ independent, non-shared implementations today — this must become one), with subject-specific presentation rules from Parts 7–8.
16. **Answer entry** — free-text and multiple-choice controls both first-class (Part 1 found only free-text exists today, despite the real paper mixing formats per Part 2's unconfirmed-but-plausible format mix).
17. **Navigation** — forward/back between questions within the attempt's manifest only (Part 1's Layer 2 finding: manifest access itself is sealed — navigation must work only inside an already-authorised attempt, never by direct form/question enumeration).
18–19. **Answered / unanswered state** — visually distinct, colour-independent (Part 11), reflected in the question palette (Part 4's Prometric-derived pattern).
20. **Review/flag state** — a genuinely new build (Part 1: not yet built anywhere) — a flag control per question, surfaced in the palette, carried into the review screen.
21. **Progress** — palette-based, not just "Question X of Y" text (Part 1 found only plain text today).
22. **Timer** — Part 12 standard applies; visible, calm, never the dominant visual element.
23. **Autosave** — every answer write goes through `mock_submit_answer` immediately (already the correct RPC-level design — Part 1); no local-only draft state that could be lost.
24. **Interruption/recovery** — a refresh or connectivity drop must resume the same attempt at the same server-authoritative expiry, never reset it (extends the already-proven `expires_at` pattern).
25. **Accessibility** — Part 11 standard; a persistent but unobtrusive control, not a settings detour.
26. **Accidental-exit protection** — a browser-level "are you sure" on navigation away during an in-progress attempt.

**REVIEW AND SUBMISSION**
27. **Question overview** — the palette itself, now framed as a review screen (Part 4's mandatory-review-checkpoint pattern).
28. **Unanswered warning** — explicit count and list, not just a colour cue.
29. **Flagged-question review** — same overview, filterable to flagged-only.
30. **Time remaining** — restated clearly on this screen, since it's the last natural checkpoint before a hard stop.
31. **Final submission confirmation** — one deliberate, named action ("Submit my English Mock"), never a bare "Submit" that could be mis-tapped (Part 1 found today's submit button fires immediately with no confirmation step — a genuine gap).
32. **Timeout behaviour** — server-side `mock_submit_attempt` fires automatically at expiry (already the correct design — Part 1's proven RPC layer); the child sees a calm "time's up, your answers are saved" state, not an error.
33. **Server-authoritative submission** — no client-side grading in the submission path itself (Part 1's RETIRE finding on today's live runner: it grades client-side mid-submission, including a live network call during the submit flow — this pattern must not carry forward).

**POST-MOCK**
34. **Neutral completion** — acknowledges the attempt is done and safely recorded, without prematurely implying a result is ready.
35. **Delayed-results state where appropriate** — for any Mock type where marking genuinely can't be instant (e.g., Continuous Writing requiring more than automated scoring — see 008D's own quarantine of AI writing-scores from mastery evidence), say so plainly rather than showing a spinner indefinitely.
36. **Child results experience** — Part 15.
37. **Parent results experience** — Part 15, building on the already-strong `mock-readiness` page (Part 1: KEEP).
38. **Competency interpretation** — evidence-tagged, never a bare number (mirrors this project's own Angel Evidence Hierarchy discipline).
39. **Strengths** — specific, skill-coded, not generic praise.
40. **Weaknesses** — specific, actionable, paired with a next step — never just a red flag with no path forward.
41. **Confidence/evidence boundaries** — explicit "this is based on N data points" framing, consistent with this project's own evidence-confidence language elsewhere in the platform.
42. **Next recommended preparation** — one clear recommendation, not a menu (mirrors the MGOS governance principle of "always ONE recommendation" already established elsewhere in this Founder's other programmes).
43. **Revision implications** — tie back into the existing Preparation Clock/Stage, not a parallel system.
44. **Future Mock recommendation** — timed and evidence-gated, never simply "take another one soon."

---

## PART 6 — Exam Workspace Standard

*[ANGEL 11+ DESIGN DECISION]*

A child under timed conditions must answer, at a glance: **Where am I? What am I answering? How much time is left? Have I answered this? How do I move? Which have I missed or flagged? Is my answer saved?**

Layout, top to bottom: a slim header (examination identity, section identity, question number, marks — no branding decoration competing for attention) → timer, right-aligned, calm by default (Part 12) → the question/passage workspace itself, the largest region on screen → a persistent-but-minimal footer bar: previous/next navigation, flag control, question palette trigger, save-state indicator. Help/instructions live behind a clearly-labelled but non-intrusive control, never inline with the question. Exit protection (Part 5, item 26) is a browser-level guard, not a UI element competing for space. This directly supersedes the "3 independent timer implementations, 4+ independent renderers, no shared palette" state found in Part 1 — one shared workspace shell for every Mock subject, not per-runner reinvention.

---

## PART 7 — English Experience

*[ANGEL 11+ DESIGN DECISION]*

**Recommended standard: persistent, collapsible split-screen — passage on one side, question on the other, both scrollable independently, with passage-scroll-position memory across questions on the same passage.** Justification: Part 1 found today's implementation renders passage and question in one inline card with a fixed scroll region — workable for a short extract, but the split-screen pattern removes the memory burden of scrolling past a long passage to re-find a question, without hiding the text (as a fully collapsed passage would). Typography: generous line length (not full-width on desktop — readability degrades past ~75 characters per line), comfortable paragraph spacing, no decorative serif affectation — clarity over character. No highlighting tool inside the sealed Mock (Part 2's own English-format detail is still partly unconfirmed, and an unearned highlighting feature risks implying exam-authenticity this document cannot yet certify); revisit only once Part 2's open items are resolved. Switching between passage and question must never surface an answer cue (no auto-scroll-to-answer-adjacent-text).

---

## PART 8 — Mathematics Experience

*[ANGEL 11+ DESIGN DECISION]*

Numeric input gets a purpose-built control (not a bare text box) with explicit unit handling where the question requires it. Diagrams, tables, and geometry figures need real semantic/alt-text equivalents, not decorative-only images — directly responding to Part 4's finding that embedded non-text elements, not body text, are where real CBT accessibility failures concentrate. Working space is visually implied but not enforced (marks are for the answer per Part 2's own facts; working space is a confidence aid, not a scored field, unless official evidence later says otherwise). Multiple-choice controls must exist as a first-class component (Part 1: currently absent everywhere) since Part 2's own unconfirmed-but-plausible format mix makes this a real gap, not a hypothetical one. Mathematical notation renders through a real typesetting approach (not plain-text fraction hacks), legible at the same zoom levels Part 11 requires.

---

## PART 9 — Visual Design Standard

*[ANGEL 11+ DESIGN DECISION]*

**Target feel:** calm, premium, trustworthy, child-appropriate, serious, clear. **Explicitly not:** babyish, game-like during a formal Mock, cluttered, generic SaaS, cheap, over-animated, anxiety-inducing — restating the Founder's own stated boundary directly, because it is precise and correct as written.

Typography: one confident type family, a small number of weights, real hierarchy (question text always the largest readable element on screen, never competing with chrome). Spacing/density: generous, exam-paper-calm rather than dashboard-dense. Colour: a restrained, purposeful palette — state communication (answered/unanswered/flagged/warning/success) must never rely on colour alone (Part 11). Motion: minimal, purposeful only (a state transition, never a celebratory animation, inside the sealed Mock — directly excluding the BOFA/CGP/Khan-Academy-Kids pattern flagged as wrong-for-formal-mode in Parts 3–4). Iconography: functional, not decorative. This standard governs the Mock workspace specifically; gamification is explicitly sanctioned in the surrounding *preparation* experience (Part 13), never inside a sealed attempt.

Build note: Part 1 found no dedicated design-token file in the repo, but a real shared component library at `components/ui/*` already exists and is used by the newer pages. The correct implementation path is extending that system with Mock-specific tokens/components, not inventing a parallel one — direct continuity with the KEEP classification in Part 1's table.

---

## PART 10 — Device Standard

*[ANGEL 11+ DESIGN DECISION]*

**Desktop/laptop:** the reference implementation — full workspace, full palette, split-screen English.
**Tablet:** fully supported as a formal-Mock-capable device (this is genuinely how many children practise and, per Part 2, is close in scale to the real test-centre desk); split-screen English adapts to a stacked-but-still-persistent layout on portrait orientation, side-by-side on landscape.
**Mobile phone:** **a formal, timed, full Mock should not be offered on a phone-sized screen.** A phone cannot host a real split-screen passage view without destroying readability, cannot comfortably host a question palette alongside the question itself, and the real CSSE exam is sat at a desk under supervision — a phone-based "formal Mock" would be the least exam-authentic surface Angel could offer, undermining the platform's own stated founding principle of authentic examination preparation. Recommend: mobile retains full access to preparation/practice content, results, parent reports, and Mock *scheduling/recommendation* — but a formal timed Mock attempt on a phone viewport should show a clear, respectful redirect ("this Mock needs a bigger screen") rather than a degraded attempt at the real thing. This is a deliberate product boundary, not an oversight, and directly closes Part 1's "no mobile-specific treatment found in any runner" gap with an explicit decision rather than silent neglect.

---

## PART 11 — Accessibility and Child Safety

*[ANGEL 11+ DESIGN DECISION]*

WCAG-aligned contrast throughout; full keyboard navigation with a visible focus state (Part 1 found effectively none today — 3 ARIA occurrences total, one keyboard binding); screen-reader semantics on every interactive control, including the diagrams/tables risk area Part 4 flagged; pinch/OS-level zoom must not break layout; touch targets sized for a child's hand on tablet; state communication never colour-only (answered/flagged/warning states all need a shape or text cue too); reduced-motion respected via the OS preference; timer accessibility (a screen-reader-announced periodic update, not just a visual countdown); accidental-submission protection (Part 5, item 31); interruption recovery (Part 5, item 24, itself an accessibility and equity issue — a lost connection should never cost a child their attempt); cognitive load kept low by design (Part 6); age-appropriate instruction language throughout, reviewed against this project's own existing Copy Quality Guard discipline.

**Accessibility must not undermine examination authenticity unnecessarily** — restating the Founder's own boundary: a lightweight, corner-anchored text-size/contrast control (Part 4's Pearson-VUE-derived pattern) satisfies this without competing with the exam workspace for attention. Formal reasonable-adjustment modes (extended time, alternative formats) for children with a genuine access need are a **separate product policy question**, not designed here — flagged for explicit Founder decision before any implementation (Part 40).

---

## PART 12 — Timer and Exam Pressure

*[ANGEL 11+ DESIGN DECISION]*

Normal state: quiet, legible, right-aligned, no colour urgency. Approaching-end state: a single, restrained colour shift (not flashing, not sound) at a sensible threshold (e.g. last 10 minutes) — informative, not alarming. Final-warning state: a clear but calm visual cue in the last minute; no countdown-second ticking animation, which manufactures urgency rather than informing it. No sound cues inside a formal Mock — a shared test environment (siblings, home distractions) makes audio alerts an unreliable and potentially disruptive signal. Warnings are not user-configurable inside a sealed Mock (configurability would itself be a form of personalisation the Founder's own boundary excludes — Part 14). Server-authoritative throughout (already proven — Part 1's `expires_at` pattern); a browser refresh must show the same true remaining time, never reset it; a temporary connectivity loss must resume correctly on reconnect; a genuine timeout triggers the already-proven automatic `mock_submit_attempt` lock (Part 1), with a calm, non-alarming completion state (Part 5, item 32). This directly answers Part 4's own warning against manufactured visual urgency, and the Founder's own instruction to avoid constant visual urgency.

---

## PART 13 — Mock Types

*[ANGEL 11+ DESIGN DECISION]*

| Type | Exam-authentic? | Personalisation allowed? |
|---|---|---|
| **Diagnostic assessment** | No | Yes — adaptive, used to establish a starting evidence baseline |
| **Subject assessment** (single-subject, shorter) | Partially — timed, fixed content, but not the full paper structure | No adaptation during the attempt; may be recommended adaptively |
| **Mini Mock** (subset of a full paper) | Partially | No adaptation during the attempt; scope/timing selection may be personalised |
| **Timed practice** | No — explicitly instructional | Yes — this is where gamification (Part 9) belongs |
| **Full CSSE Mock** | Yes — the sealed, comparable instrument | No — Part 14's boundary applies in full |
| **Future pathway-specific Mock** (GL/CEM/ISEB) | Yes, once each pathway's own official structure is confirmed to the Part 2 standard | No, once formal |

This directly resolves Part 1's finding that "mock" is currently used as a single overloaded label across at least four structurally different experiences (`mock-test`, `mocks/[pathway]`, `mocks/adaptive/*`, `mock-exam`) — the taxonomy above is the naming and behavioural contract every future increment must build against, so "Mock" stops being ambiguous in both code and copy.

---

## PART 14 — Personalisation Boundary

*[FOUNDER REQUIREMENT, restated for traceability + ANGEL 11+ DESIGN DECISION on implementation]*

**May personalise** (using year group, Preparation Stage, Preparation Clock, demonstrated competency, evidence confidence, recent learning, previous Mock history, exam proximity): which Mock is recommended and when; which Mock *type* (Part 13) is appropriate; content and focus of preparation before a Mock; interpretation and remediation after a Mock; parent guidance; future preparation and Mock-timing decisions.

**Must never adapt during a sealed Full CSSE Mock:** question selection, question order, question difficulty, time allowed, or any other in-attempt variable, regardless of the child's profile. **[PRODUCT INFERENCE, independently corroborated]** — this is not merely a cautious internal rule; Part 3 found BOFA, a direct competitor, enforces the identical boundary in its own shipped product (adaptive difficulty in practice, explicitly no pause/retake/adaptation on its sealed Mock instrument) and Part 4 found the opposite pattern (Duolingo English Test's real-time adaptive scoring) is a *placement*-test mechanic, not a comparable-instrument one — reinforcing that a formal, comparable Mock and adaptive difficulty are two different product categories, never one.

This boundary is architecturally already enforced at the data layer: the sealed manifest (Layer 2) and attempt-scoped RPCs (Layer 3) proven in 008D mean a form's question set is fixed at attempt-creation time and cannot be altered mid-attempt by any client-side signal — the security architecture and the product boundary are the same boundary, not two separate concerns to keep in sync by convention.

---

## PART 15 — Results Experience

*[ANGEL 11+ DESIGN DECISION]*

**Child:** a clear result stated plainly; specific, skill-coded strengths; specific, actionable areas to improve; encouraging but truthful language with no false certainty ("here's what this shows so far," never "you will pass"); one clear next action, not a menu. Part 3's "Answer Genie" pattern (explanation-on-demand at review, not a blanket answer reveal) is worth adopting here specifically — it respects a child's pace without dumping every answer at once.

**Parent:** performance, competency evidence, evidence-confidence level, time-behaviour data where genuinely valid (not fabricated to look sophisticated), question/skill-level patterns, progress over time, a plain readiness interpretation, prioritised preparation guidance, and one next-Mock recommendation. **Do not reduce this to a score dashboard** — restating the Founder's own instruction directly, because Part 3 found this is exactly where the strongest competitor (Atom Learning: SAS + per-question timing + topic breakdown + cohort benchmarking) and the platform's own existing `mock-readiness` page (Part 1: KEEP, "help decide whether another mock is worthwhile," deliberately not "recommend more mocks") already agree — build outward from what's already working here, not around it.

---

## PART 16 — Exam Intelligence Integration

*[ANGEL 11+ DESIGN DECISION]*

Target examination, exam date, days/weeks remaining, current Preparation Stage, official exam information, evidence confidence, and preparation implications belong in the pre-Mock and post-Mock surfaces and the parent dashboard — never inside the timed workspace itself (Part 6's own "no decoration competing for attention" standard applies with particular force here: a countdown-to-exam-day widget on the same screen as a countdown-to-time-up timer would be actively confusing, not just cluttered). This connects 008B's existing Exam Intelligence concept to the Mock journey at exactly two points: pre-Mock context (Part 5, items 4–5) and post-Mock revision implications (Part 5, item 43) — not as a persistent in-Mock presence.

---

## PART 17 — Exam Update Standard

*[ANGEL 11+ DESIGN DECISION]*

Authoritative source hierarchy: the exam board's own current published material (as directly verified in Part 2) outranks any secondary/tuition-industry source, always. Every fact used in product copy needs a captured source URL and access date — exactly the discipline this document already applies to its own Part 2 findings. When a change is identified (this document's own live example: CSSE's removal of Applied Reasoning from the English paper, effective 2025 entry), record: effective date, affected pathway, affected exam cycle, affected Mock specification(s), a review requirement before any Mock content referencing the old format ships again, a parent-notification decision, and a plain statement of child-facing impact if any Mock content is already live. **A future official change must never silently leave an old Mock specification looking current** — restating the Founder's own instruction directly, because Part 2's own findings (a real, dated, verifiable format change already exists in the official record) prove this is not a hypothetical risk to design against.

---

## PART 18 — Anti-Memorisation and Repeat Use

*[ANGEL 11+ DESIGN DECISION]*

Multiple forms per Mock type, with content-exposure tracking per learner (which question IDs a child has already seen, across every Mock and practice context — this must be one unified exposure ledger, not per-feature silos, given Part 1's own finding of parallel, disconnected content systems). Repeat-attempt policy: a minimum spacing between attempts of the *same* Mock type for the *same* learner, enforced server-side (extending the already-proven server-authoritative pattern from the RPC layer, not left to client trust). Structural variation and equivalent difficulty across forms so repeated Mocks measure the same thing without repeating the same items — form comparability is itself a measurement-validity requirement, not just an anti-memorisation one. Post-Mock review should surface explanations (Part 15) without simply re-exposing the sealed form's full content in a way a sibling or the same child could later memorise ahead of a real retake. This connects directly to the project's own already-stated concern that children need enough high-quality work for weeks and months, not a small pattern they can learn to recognise — the same principle 008C/008D already applied to Practice content, now extended to Mock.

---

## PART 19 — Premium Differentiation

*[ANGEL 11+ DESIGN DECISION, grounded in Part 3's competitor weaknesses]*

Why Angel 11+ over printed papers, tuition-centre mocks, generic question banks, or another online platform — stated as observable value, never a vague "AI-powered" claim (the Founder's own instruction, and directly the exact claim Part 3 found undermines trust in a real competitor's marketing):

1. **A genuinely secure, purpose-built Mock architecture** — four independently proven security layers (Decisions 87–91), not a claim, a verified fact this platform can actually stand behind if asked.
2. **Evidence-based, not score-only, reporting** — building on the already-existing `mock-readiness` restraint (Part 1) plus the multi-dimensional reporting pattern Part 3 found only the strongest competitor (Atom Learning) offers.
3. **Engineering reliability as a stated value**, not an assumption — Part 3 found a major competitor's own users report login/access problems; a platform that treats uptime and data integrity as part of its premium promise (this project's own testing discipline — 566/566 tests, TypeScript clean, before any closure — is real substantiating evidence, not marketing) has something concrete to say here.
4. **An explicit sealed-vs-adaptive boundary, stated openly to parents** — most competitors don't articulate this distinction at all; naming it (Part 14) is itself a trust signal, not just an internal engineering rule.
5. **Anti-memorisation by design** (Part 18), stated plainly as "you won't just be memorising a small fixed bank" — a genuine differentiator against any competitor relying on a static paper set.

---

## PART 20 — Visual Concept (Textual)

*[ANGEL 11+ DESIGN DECISION — no implementation, no production components]*

The recommended Mock workspace: a single-column, generously-spaced page. A slim top bar (12–16% of viewport height on desktop) holds exam/section identity on the left, question number and marks centred, timer right-aligned in its calm default state. Below it, the workspace itself — for English, a two-pane split (passage left, ~45%; question right, ~55%, both independently scrollable, divider draggable on desktop / stacked with a sticky passage-collapse toggle on tablet portrait); for Maths, a single centred column with generous whitespace around any diagram, answer control directly beneath the question, never squeezed into a sidebar. A slim, persistent bottom bar: previous/next, flag toggle, "Questions" button opening the palette as an overlay (not a permanent sidebar competing for width), and a small save-state indicator (a checkmark or equivalent, never a spinner during normal operation, since every answer autosaves already — Part 5, item 23).

From Part 1's own findings: `components/ui/{Card, Button, Progress, Typography, StatusIndicator}.tsx` already exist and are used by the newer, better pages — the workspace above should extend these (new Mock-specific components: `QuestionPalette`, `ExamTimer`, `SplitPassageView`, `FlagControl`, `ReviewScreen`) rather than introduce a parallel visual system. This paragraph is a description for future implementation to follow — no component was built to produce it.

---

## PART 21 — Experience Acceptance Standard

*[ANGEL 11+ DESIGN DECISION — testable criteria, not subjective]*

| Criterion | Testable pass condition |
|---|---|
| Exam authenticity | Every claimed format detail traces to a Part 2 OFFICIAL EXAM FACT, tagged in-code or in copy; no UNCONFIRMED item is presented to a parent/child as settled |
| Child comprehension | A child in the target age range can state, unprompted, their current question number, time remaining, and whether their current answer is saved, within 5 seconds of being asked, during a moderated test session |
| Navigation clarity | Every question is reachable from the palette in ≤2 actions; back/forward never loses an already-entered answer |
| Timer clarity | Automated test asserts: displayed time matches server `expires_at` within 1 second after a simulated refresh |
| Answer-state clarity | Automated test asserts: answered/unanswered/flagged states are distinguishable by a non-colour signal (shape/text), not colour alone |
| Passage usability | English split-screen: passage scroll position persists across question navigation within the same passage (automated + manual test) |
| Mathematical readability | Every Maths diagram/table has a passing automated accessible-name/alt-text check |
| Accessibility | Automated axe-core (or equivalent) pass with zero critical/serious violations on every Mock screen; full keyboard-only completion of a sample attempt, manually verified |
| Responsive behaviour | Manual verification on desktop, tablet-portrait, tablet-landscape; automated test confirms mobile viewport shows the Part 10 redirect, not a degraded attempt |
| Submission safety | Automated test: submit requires the named confirmation action; an in-progress attempt survives a simulated network drop and reconnect with state intact |
| Interruption recovery | Automated test: a page refresh mid-attempt resumes the same attempt at the correct server-derived remaining time |
| Security compatibility | Full existing security test suite (566+ tests, Part 1's proven layers) still passes unmodified; no new client-side grading or direct-table-read pattern introduced |
| Performance | Question transition renders in under a stated budget (e.g. 200ms) on a mid-range device — measured, not assumed |
| Parent value | Parent report includes at minimum: evidence-confidence statement, one prioritised recommendation, and never a bare score with no interpretation — checked against the existing `mock-readiness` page as the reference bar |
| Visual quality | Independent reviewer (not the builder) confirms the "calm/premium/trustworthy" vs. "babyish/game-like/cluttered" boundary from Part 9 is met, using the explicit exclusion list as a checklist, not a vibe check |

---

## PART 22 — Prioritised Gap Analysis

*[ANGEL 11+ DESIGN DECISION, built directly from Part 1's evidence]*

**CRITICAL**
- The live "Start mock" entry point (`mock-exam/page.tsx`) is structurally disconnected from the only secure, correctly-architected engine (`lib/mockAttempt/client.ts`). It is not a security defect today (RLS backstops it, Mock Eligible = 0), but it is a product dead-end: it can never serve real Mock content once any exists. **Must be replaced, not extended**, before any real Mock content is ever created.
- No review/flag/question-palette UI exists anywhere, despite the RPC layer already supporting the locked/submitted states such a UI would consume — this is core to Part 5's REVIEW AND SUBMISSION phase and cannot be retrofitted onto the legacy runners.
- No submission confirmation step exists on the one live runner today — a real risk of accidental submission with no safety net, directly contradicting Part 5, item 31.

**HIGH**
- Accessibility is almost entirely unbuilt (3 ARIA occurrences total across the whole Mock surface) — a real gap against Part 11, not a polish item.
- No mobile decision has been made or implemented — Part 10 closes this with an explicit boundary, but nothing enforces it today.
- Four+ independent question/passage renderers and three+ independent timers exist with no shared component — every future content or security change currently has to be made in multiple places, a maintainability and correctness risk, not just a design-debt one.
- Part 2's open items (Continuous Writing timing, English format mix) must be resolved with CSSE directly before any exam-authentic English Mock workspace is finalised — building Part 7 in detail against an unconfirmed structure risks a real authenticity defect later.

**MEDIUM**
- The "Mock" naming collision across four structurally different experiences (Part 13) creates real product confusion today, independent of any visual redesign.
- No shared design-token file exists, though the underlying component library is sound — worth formalising before Mock-specific components multiply.
- No anti-memorisation/exposure-tracking system exists yet (Part 18) — not urgent while Mock Eligible remains 0, but must land before real content does.

**LOW**
- The `mocks/[pathway]` runner's honest available/coming-soon typed pattern is worth preserving conceptually even though the runner itself is scheduled to merge away.
- No dedicated timer/palette/passage components exist yet to extend — expected at this stage, not a defect.

**Recommendation for 008E scope:** 008E should **not** resume the previously-imagined path of building directly on `mock-exam/page.tsx`. It should instead: (1) build the shared Mock workspace shell (Part 6/20) directly on the proven 008D engine, replacing the disconnected live runner; (2) build the review/flag/palette/submission-confirmation flow (Part 5's REVIEW AND SUBMISSION phase) as the first real UI increment, since it's both a CRITICAL gap and the highest-leverage piece to validate the security layer against; (3) resolve Part 2's open CSSE items with a direct human inquiry before finalising the English workspace in detail. This is a recommendation for the Founder's approval, not a scope commitment made here.

---

## PART 23 — Governance

This document and its underlying research are recorded append-only in `ALI_DECISION_LOG.md` as Decision 92, per this project's established governance practice. No historical finding is rewritten. Evidence throughout this document is tagged per the legend at the top: **OFFICIAL EVIDENCE**, **COMPETITOR OBSERVATION**, **PRODUCT INFERENCE**, **FOUNDER REQUIREMENT**, **ANGEL 11+ DESIGN DECISION** — every claim traces to one of these five categories, and none is presented as a category it does not belong to.

**No implementation was performed to produce this document.** No code, migration, or test file was written or changed. No Mock content was created. No question was marked `mock_eligible`. Forms A/B/C were not created. The secure 008D delivery architecture was not modified.

---

*Document version: V1. Date: 2026-08-18. Author: research/synthesis by Claude Sonnet 5, across four parallel research passes plus direct inspection of the live repository and the official CSSE Information Guide 2027 Entry PDF. Returned to the Founder for review and approval before any implementation.*
