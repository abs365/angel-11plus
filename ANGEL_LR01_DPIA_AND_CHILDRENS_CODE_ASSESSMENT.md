# Angel 11+ — LR-01: Data Protection Impact Assessment & Children's Code Assessment

**Status: EVIDENCE-BASED DRAFT — REQUIRES FOUNDER REVIEW before external beta families are invited.**
Not a claim of legal compliance, not a substitute for formal legal advice. Produced 2026-09-18
against the actual production codebase/schema (`c856396`/`d8b83cf` on `origin/main`) and the
[ICO's Children's Code guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/)
(fetched live this session, not from training-data memory). Owner: Founder. This document does not
itself constitute a DPIA sign-off — it is the evidence pack a DPIA sign-off should be made from.

**Scope**: the FREE, Founder-invited Controlled Beta (~10–25 families), not public commercial
launch. Where a finding is only acceptable *because* the beta is closed and Founder-invited, this
is stated explicitly — do not carry that reasoning forward to public launch without re-assessing.

---

## 1. Processing activities, purposes, and lawful basis (by purpose, not a blanket "under-13" rule)

| Activity | Purpose | Data involved | Likely lawful basis (not legal advice) |
|---|---|---|---|
| Account creation (magic-link email) | Let a family save progress across devices | Email (in Supabase `auth.users`, not this app's own schema) | Contract / legitimate interest in providing the requested service |
| Anonymous practice (no account) | Let anyone try Angel without a barrier | `device_id` (random UUID), no email | Legitimate interest — no identifying data collected |
| Practice attempts, mock attempts, mastery tracking | Adaptive personalisation — the core product | Answers given, timing, confidence, competency-level mastery state (see §2) | Necessary to perform the service the parent asked for |
| Writing AI feedback | Give the child feedback on their writing | The writing text itself + prompt metadata, sent to OpenAI | Necessary to perform the service; see §5 for the third-party detail |
| Beta family application / testimonials / feedback forms | Recruit and support beta families | Parent name, email, child's year group, pathway, free-text feedback | Consent (a form the parent actively chooses to submit) |

No field in the schema is gated on "child under 13 = always needs consent for everything" — each
purpose above was individually necessary to the parent-requested service. **Determination**: no
lawful-basis gap was found for the core learning/practice/personalisation purposes, given the
parent-led account model (§7 flags the one real gap in how that model is currently *enforced*).

## 2. Verified data inventory (schema-level, not live values)

Source: `types/supabase.ts` (generated from live production schema) + direct `information_schema`-
equivalent checks. **No table anywhere in this schema holds**: a child's date of birth, home
address, phone number, photograph, precise geolocation, school name (only a generic exam
*pathway* like "CSSE (Essex)", not the child's actual school), or an advertising identifier.

| Table | What it holds | Child-data sensitivity |
|---|---|---|
| `profiles` | `id`, `device_id`, `name` (**always the literal default `"Angel"` in the database — never a real child's name**, see LR-02/AN-102), `auth_user_id`, `is_admin`, `selected_pathway_id` | Low — no real name, no DOB |
| `user_stats` | XP, streak, last activity | Low |
| `lesson_progress` | per-lesson completion, score, XP | Low-medium (performance data) |
| `ali_student_question_history` | times seen/correct, last given answer (first + final), confidence rating, time taken, support tier, "working shown" | Medium — this is genuine learning-evidence profiling (§4) |
| `ali_durable_mastery` / `ali_mastery_defaults` / `ali_student_adaptive_state` | computed per-competency mastery state | Medium — derived profile, not raw PII |
| `ali_family_focus_selection` | which competency the family chose to focus on | Low |
| `ali_mock_attempt` / `ali_mock_attempt_report` / `ali_mock_attempt_answer` | full mock lifecycle; `response` (the learner's actual submitted answer/essay text); `parent_explanation` (a parent-facing summary field) | Medium — includes the child's own written work |
| `beta_family_applications` / `testimonials` | `parent_name`, `email`, child's `year_group`, `pathway`, free-text | Medium — real contact PII, but of the *parent*, entered voluntarily |
| Supabase `auth.users` (Supabase-managed, not this app's own table) | email, hashed credentials, auth session metadata | Standard auth PII, protected by Supabase's own access controls |

**Frontend/browser storage** (`localStorage`, no cookies used for auth — see §9):
`sb-<ref>-auth-token` (session, essential), `angel_device_id` (essential, anonymous), local practice
progress mirror, `selectedPathwayId`, `angel_child_name` (optional, **local-only, never reaches the
database** — see §8), `angel11plus_beta_events` (local-only usage counters, never transmitted
anywhere — not third-party analytics in any regulatory sense).

## 3. Data minimisation findings

No unnecessary child data collected. Specifically checked and **absent**: precise geolocation,
phone number, photographs, social-profile linking, advertising profile, real school name,
unnecessary date of birth. The one optional demographic field (`year_group`, e.g. "Year 5") is
proportionate — it exists to pace preparation appropriately and is explicitly marked "(optional)"
on `/pathways`. **No finding requiring a field to be removed.**

## 4. Educational Intelligence / profiling assessment

Verified in code (`lib/learningEngine/`, `lib/ali/`) — **no external AI model drives the adaptive
recommendation engine**. It is deterministic/rule-based: performance evidence (correct/incorrect,
timing, confidence, regression signals) feeds a rules engine (`buildPreparationDecision`,
`selectQuestions`, mastery-state transitions) that selects what to recommend next. This is
profiling under the Children's Code (it uses a child's own performance data to shape what content
they see), but it is not AI-driven decision-making, and Angel does not claim "AI" anywhere in
family-facing copy for this (consistent with `.claude/skills/angel-educational-quality`'s own
messaging rule, never "AI").

**The one place a genuine third-party AI model is used**: OpenAI (`app/api/writing-feedback/
route.ts`), scoring a child's Continuous Writing response. Verified: the request body
(`WritingFeedbackRequest`) sends only `promptTitle`, `promptType`, `promptText`, `writingText`,
`checkedItems` — **no name, email, profile ID, or other identifier accompanies the writing text**.
Residual risk (inherent to any open-text AI writing tool, not fixable by architecture alone): a
child could incidentally write personal information *within* their essay text (e.g. "My name is
X and I live in..."). Not currently mitigated by a filter — see §12.

**"Angel recommends, family chooses" — checked, not merely assumed**: the recommendation engine
never gates access. Every Practice area (`/learning-intelligence/practice/mathematics`,
`/continuous-writing`, etc.) remains directly reachable regardless of what's currently
recommended — confirmed this session and in LR-02. The Children's Code's profiling standard
requires profiling to be switched off by default *unless* there's a compelling reason tied to the
child's best interests; adaptive personalisation is the literal, transparently-stated core service
a parent signs up for here (not engagement/ad-driven), which is the strongest form of that
justification — but the **transparency** half of that standard (family/child understanding *how*
it works) is only partially met today (§8).

## 5. Processor / data-flow inventory (verified from actual dependencies and env vars, not assumed)

Checked `package.json` and `.env.local`'s variable *names* (never values) for every commonly-used
processor category named in this task. **Result: a genuinely minimal footprint.**

| Processor | Purpose | Data categories | Evidence |
|---|---|---|---|
| **Supabase** | Database, authentication | Everything in §2 | `@supabase/supabase-js` dependency; every table above |
| **Vercel** | Hosting/deployment | Standard request/hosting metadata | Live at `angel-11plus.vercel.app`, `vercel.app` deployment |
| **OpenAI** | Writing AI feedback (§4) | Prompt text + the child's own writing text; no identifiers | `OPENAI_API_KEY` present in `.env.local`; `app/api/writing-feedback/route.ts`, `app/api/mock-writing-assessment/route.ts` |

**Confirmed absent** (checked, not assumed): Sentry, Upstash, Stripe, Google Analytics, PostHog,
Amplitude, Mixpanel, Segment, Resend, any advertising/tracking SDK. No error-monitoring or
analytics processor is wired into this codebase at all — `lib/betaTracking.ts` is a **local-only**,
device-scoped event counter (never transmitted to any server, own comment: "localStorage now,
Supabase-ready later"); it is not third-party tracking in the ePrivacy/GDPR sense.

**Outstanding, not verifiable from code**: whether the Founder's OpenAI account is configured on a
plan/setting with zero-retention or "not used for model training" for API traffic. This is an
account/contract-level setting on OpenAI's own platform, not something this codebase can confirm —
**Founder action required**, see §16.

## 6. RLS / ownership / security findings

Verified empirically against live production (not assumed from policy text alone):

- Unauthenticated anon-key requests (no session at all) return **zero rows** from `profiles`,
  `ali_student_question_history`, `user_stats`, `lesson_progress`, `ali_mock_attempt`,
  `ali_mock_attempt_answer`, `beta_family_applications`, `ali_family_focus_selection` — confirmed
  live, HTTP 200 with empty arrays, not a leak.
- The Founder's own authenticated session sees exactly **1 row** in `profiles` and `user_stats`
  (its own), not other families' rows — confirmed live.
- No `information_schema`/OpenAPI introspection is exposed via the anon key (returns an empty
  schema) — reduces reconnaissance surface.
- No account/profile-deletion RPC exists in the schema (`types/supabase.ts`'s RPC list has no
  `delete_*`/`remove_account` function) — deletion is currently a fully manual, Founder-operated
  process (matches the Privacy Policy's own "email us" wording, §7) rather than self-service. Not
  a security gap; a retention/deletion process gap (§10).
- **No P0/P1 exposure found.** Did not attempt destructive testing, per instruction.

## 7. Parent transparency status — what's genuinely accurate, and one genuine discrepancy

A real Privacy Policy (`/privacy`) and Terms (`/terms`) already exist, both explicitly labelled
"Beta version." Cross-checked their factual claims against actual code behaviour:

**Accurate, verified claims** (do not need correcting): "We do not require children to create
accounts to use the platform" (true — anonymous-first, confirmed in LR-02); "We do not collect
children's names, photos or personal identifiers" (true — `profiles.name` never captures a real
name, confirmed in §2/AN-102); the Third-Party Services list (Supabase, OpenAI, Vercel) matches
§5 exactly; "We do not use Google Analytics, Facebook Pixel, or any advertising trackers" (true,
confirmed in §5).

**One genuine discrepancy, not corrected by this session** (a legal-text change is a Founder
decision, not mine to make unilaterally): both `/privacy` ("Parent or guardian consent is required
before account creation") and `/terms` ("Children must have parental permission to use the
platform") **state a safeguard that has no corresponding technical gate in the product** — `/login`
(read in full this session) has no consent checkbox, no age-confirmation step, no "I am the
parent" affirmation anywhere in the sign-up flow. For this specific closed, Founder-invited beta,
the *Founder personally inviting each known parent* is the real mechanism that makes this true in
practice — but the policy text currently implies a technical/product mechanism that doesn't exist.
See §12 for the exact decision this raises.

**Minor, lower-severity inaccuracy**: `/privacy` §8 says "essential session cookies for
authentication" — the actual mechanism is `localStorage` (`sb-<ref>-auth-token`), not a cookie.
Practically immaterial to a reader's understanding, but not literally accurate.

## 8. Child-accessible transparency status

**Gap, not previously assessed.** No child-facing (Year 4/5/6-readable) explanation of "why Angel
suggests what it suggests" currently exists anywhere in the product — the closest thing is the
`stagePrinciple()` text (LR-02's own fix), which is family-appropriate in tone but explains the
*preparation stage*, not that Angel is using the child's own answers to decide what to show next.
A conventional adult Privacy Policy (§7) is not, and cannot be, sufficient evidence of
child-accessible transparency on its own, exactly as this task's own instruction states.

## 9. Cookies / analytics / local-storage findings

**No cookies are set by this application for authentication or session purposes** — Supabase's
browser client is configured to use `localStorage`, confirmed directly (`sb-<ref>-auth-token` key,
verified live). No cookie-consent banner exists; given the verified absence of any tracking/
advertising cookie or third-party analytics script (§5), the current legal need for one is limited,
but this has not been independently confirmed by anyone outside this engineering session — see
§16. `localStorage` usage inventory is exhaustive per §2; none of it is shared with a third party
or used to build an advertising profile.

## 10. Retention / deletion findings

**What Angel currently does** (not aspirational): cloud-synced data persists indefinitely while an
account exists — no automatic expiry/TTL job was found in the migration history. Deletion is a
**manual, Founder-operated process** (no self-service deletion RPC exists in the schema, §6),
consistent with the Privacy Policy's own "contact us" wording — not a defect, but worth the
Founder confirming this is genuinely operationally reliable at beta scale (10–25 families, tiny
enough for this to be realistic without automation).

## 11. Children's Code — standard-by-standard assessment (evidence-based, current 15 standards)

Source: [ICO — Age appropriate design: a code of practice for online services](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/),
fetched live 2026-09-18.

| # | Standard | Assessment |
|---|---|---|
| 1 | Best interests of the child | The product's own stated architecture ("Angel recommends, family chooses," §4) and the absence of advertising/engagement-optimisation design are consistent with this; not independently certified. |
| 2 | DPIA | This document is the evidence pack; formal DPIA sign-off is a Founder action (§16). |
| 3 | Age-appropriate application | Angel targets a known age band (Year 4–6, ~8–11) via the parent-led setup flow; no separate "child self-declares age" gate exists to differentiate treatment within that band — not currently material given the narrow target age range. |
| 4 | Transparency | Parent-facing: mostly adequate, with the one discrepancy in §7. Child-facing: a real gap (§8). |
| 5 | Detrimental use of data | No advertising, no engagement-maximising dark patterns found; data used only for the stated educational purpose. |
| 6 | Policies and community standards | N/A — no user-generated public content, no social features. |
| 7 | Default settings | No optional data-sharing toggles exist to default correctly or incorrectly — nothing to switch off, by design (minimal collection, §3). |
| 8 | Data minimisation | See §3 — no finding. |
| 9 | Data sharing | No third-party data sale confirmed anywhere in code; processors are limited to §5, each necessary to the service. |
| 10 | Geolocation | Not collected anywhere in the schema — confirmed absent. |
| 11 | Parental controls | Architecturally parent-led (one account, parent sets it up) but §7's discrepancy means this isn't a *verified* technical control yet. |
| 12 | Profiling | See §4 — profiling exists, is purpose-limited and transparent to the parent in principle, genuinely not fully transparent to the child yet (§8). |
| 13 | Nudge techniques | No dark patterns, urgency countdowns, or manipulative prompts found in the reviewed journey (LR-02) or this session's code review. |
| 14 | Connected toys and devices | N/A — not applicable to this product. |
| 15 | Online tools | N/A — no embedded third-party interactive tools found beyond OpenAI's API (server-side only, not embedded in the child's browser). |

**Regulatory context, current as of this session** (per live ICO search): the ICO's 2026
enforcement posture has visibly hardened specifically around **age assurance** — self-declaration
alone has been found insufficient in recent enforcement actions against open, publicly-discoverable
platforms. This is directly relevant to §12 below, and to any future public-launch decision, but
its practical weight for *this* closed, Founder-invited beta is materially lower than for an
open consumer platform, precisely because there is no self-service, publicly-discoverable signup
funnel a stranger's child could walk into unsupervised.

## 12. Risks to children, identified this session

1. **The production URL has no login wall.** `/login`'s own "Continue without signing in" option
   means anyone reaching the public URL — not just Founder-invited families — can start an
   anonymous session immediately. For a closed beta where the Founder controls who receives the
   URL and doesn't publicise it, this is a low-probability, low-severity residual risk, not a
   blocker — but it is real, and would need re-assessing before any public/discoverable launch.
2. **Policy-vs-product gap on parental consent** (§7) — the clearest, most concrete finding this
   session. Two choices exist and only the Founder should choose: (a) correct the policy text to
   accurately describe the Founder-invitation model as the current consent mechanism for this
   phase, or (b) add a real, lightweight consent affirmation step to the sign-up flow. Neither was
   implemented this session — both are legal/product decisions, not unilateral engineering fixes.
3. **A child could incidentally disclose personal information inside AI-scored writing text**
   (§4) — inherent to the feature, not currently mitigated by any filter.

## 13. Safeguards already in place (verified, not assumed)

No advertising anywhere in the codebase or dependencies. No third-party analytics/tracking beyond
the three processors in §5, each necessary to the stated service. RLS empirically confirmed to
isolate each family's data (§6). No unnecessary child PII collected anywhere in the schema (§3).
Writing content sent to OpenAI carries no identifiers (§4). "Family chooses" is architecturally
real, not merely stated (§4).

## 14. Residual risks (after the above safeguards, before any correction from §16)

The two items in §12 (consent-claim/product gap; no login wall on a still-technically-public URL)
remain open, proportionate residual risks for a closed, Founder-invited beta of this size —
neither is assessed as requiring the beta to be delayed, both need a Founder decision recorded.

## 15. Outstanding decisions / actions — owner and status

| # | Item | Owner | Status |
|---|---|---|---|
| 1 | Choose how to close the parental-consent policy-vs-product gap (§7/§12.2) | Founder | Open |
| 2 | Confirm OpenAI API account is on a zero-retention / non-training-use setting (§5) | Founder | Open |
| 3 | Confirm the beta-family deletion process is operationally reliable at 10–25-family scale (§10) | Founder | Open |
| 4 | Decide whether a short child-facing "how Angel decides what to suggest" explanation is needed before beta, or can follow shortly after (§8) | Founder | Open |
| 5 | Correct `/privacy`'s "session cookies" wording to "local device storage" (§7, minor) | Founder (or delegate to next engineering session) | Open |
| 6 | Formal legal review of this DPIA/Children's Code assessment | Founder / legal advisor | Not started — this document is the evidence pack, not the sign-off |

---

*This assessment does not constitute legal advice or a formal compliance certification. It records
what was directly verified in the live production codebase, database schema, and ICO guidance on
2026-09-18, and distinguishes that from open questions requiring Founder or legal judgement.*
