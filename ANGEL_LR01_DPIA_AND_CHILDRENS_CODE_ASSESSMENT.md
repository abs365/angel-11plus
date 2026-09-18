# Angel 11+ — LR-01: Data Protection Impact Assessment & Children's Code Assessment

**Status: EVIDENCE-BASED, CLOSED FOR CONTROLLED BETA — formal legal sign-off still recommended, not
yet obtained.** Not a claim of legal compliance, not a substitute for formal legal advice. Produced
2026-09-18, updated 2026-09-18 (closure pass), against the actual production codebase/schema and
live-fetched [ICO Children's Code guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/)
and [ICO lawful-basis guidance](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/children-and-the-uk-gdpr/how-do-the-lawful-bases-apply-to-children-s-personal-information)
(not from training-data memory). Owner: Founder. This document does not itself constitute a DPIA
sign-off — it is the evidence pack a DPIA sign-off should be made from.

**Scope**: the FREE, Founder-invited Controlled Beta (~10–25 families), not public commercial
launch. Where a finding is only acceptable *because* the beta is closed and Founder-invited, this
is stated explicitly — do not carry that reasoning forward to public launch without re-assessing.

---

## 1. Processing purposes and lawful basis — corrected, evidence-based matrix

**The blanket claim previously on `/privacy`/`/terms` ("parental consent is required before account
creation") has been corrected** (§7) — it conflated "Angel is a parent-led service" (true, and
architecturally real) with "Article 8 UK GDPR consent is the lawful basis relied on" (not
established, and not necessarily the right characterisation — see below).

**What Article 8 actually governs, per live ICO guidance**: Article 8 applies specifically where an
organisation offers an Information Society Service (ISS) **directly to a child** and relies on
**consent** (UK GDPR Art. 6(1)(a)) as the lawful basis for that service. Where a different lawful
basis is relied on (contract, legitimate interests), or where the service is not offered directly
to a child, Article 8's specific age-verification/parental-consent-verification mechanics do not
apply in the same way — though the Children's Code's broader "best interests of the child"
standards apply regardless of lawful basis (§11, unaffected by this correction).

Angel's actual sign-up mechanics (verified in code, `app/login/page.tsx`): there is no
child-specific sign-up path; the account is created against whatever email address is entered, and
in practice that email belongs to the parent/carer who is setting the account up and who receives
all account communication. This is architecturally closer to "a service a parent obtains for their
child's benefit" than "an ISS offered directly to a child" — but **the ICO source material
consulted this session does not explicitly confirm this characterisation for a product shaped like
Angel's**, and this session is not qualified to make that legal determination. Marked accordingly
below.

| # | Purpose | Data involved | Basis (best-evidenced characterisation) | Confidence |
|---|---|---|---|---|
| 1 | Account/authentication | Email (Supabase `auth.users`) | **Contract** — necessary to provide the account the parent/carer requested by entering their own email and starting sign-in | FOUNDER/LEGAL REVIEW REQUIRED — whether Art. 8 applies at all to this account-creation mechanic is not settled by the guidance consulted this session |
| 2 | Core educational service delivery (Practice/Mock content, teaching) | No PII beyond `profile_id` | **Contract** — necessary to perform the service requested | Well-supported |
| 3 | Learner attempts/results (`ali_student_question_history`, `ali_mock_attempt*`) | Answers given, timing, confidence, mastery state | **Contract / legitimate interests** — necessary to provide the adaptive service itself, not a separable add-on | Well-supported |
| 4 | Educational Intelligence / personalised recommendations | Derived mastery/competency state, never raw answer text | **Legitimate interests**, with Children's Code Standard 12 (profiling) safeguards applied regardless of basis (§4, §11) | Well-supported |
| 5 | Writing feedback via the OpenAI API | Prompt text + the child's writing text; no identifiers sent (§4/§5) | **Contract / legitimate interests** — same basis as #2/#3, this is one delivery mechanism for the requested educational service, not a distinct purpose | Well-supported |
| 6 | Beta application / testimonial / feedback forms | `parent_name`, `email`, child's `year_group`, free text | **Consent** — the parent actively chooses to submit a form; this is the parent's own consent for their own contact details, not Article 8 child-consent | Well-supported |

**Determination**: no lawful-basis gap was found for the core learning/practice/personalisation
purposes (#2–#5) — contract/legitimate-interests is a defensible, evidence-supported basis for each,
independent of the Article 8 question. **The one genuinely open legal question is narrower than the
original policy wording implied**: not "do we need parental consent for everything," but "does
Article 8's specific consent-and-verification mechanism apply to purpose #1 (account creation)
given Angel's parent-initiated sign-up mechanics." **FOUNDER/LEGAL REVIEW REQUIRED** on that single
point; the corrected policy wording (§7) does not depend on resolving it, since it now describes
the actual mechanism rather than asserting a specific legal basis.

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
justification — the **transparency** half of that standard is now materially better met than at
the previous LR-01 pass (§8: a child-accessible, just-in-time explanation is now live).

### 4a. OpenAI data retention/training — verified against OpenAI's own published policy, account setting not independently confirmed

**Verified (OpenAI's own current platform documentation, fetched live this session, not
assumed)**: for standard API accounts, data sent via the API is **not used to train or improve
OpenAI's models by default** (a customer must explicitly opt in to share data for training — the
opposite of the ChatGPT consumer product's own default). Separately, and this is a **different
claim, correctly not conflated here**: API inputs/outputs are retained for up to **30 days for
abuse-monitoring purposes** by default, unless the account has been granted **Zero Data Retention
(ZDR)** — a separate, opt-in tier requiring "prior approval by OpenAI and acceptance of additional
requirements," not available by default to a standard account.

**Not verified, and not claimed**: whether the specific OpenAI account/project Angel's
`OPENAI_API_KEY` belongs to has Zero Data Retention or Modified Abuse Monitoring enabled. This is
an account-dashboard setting, not something inspectable from this codebase, and this session did
not attempt to inspect it (no API key was exposed, no test child writing was sent purely to probe
retention behaviour, per instruction).

**OPENAI RETENTION CONFIGURATION — FOUNDER VERIFICATION REQUIRED.** Exact location: OpenAI
platform → **Settings → Organization → Data controls → Data Retention tab**
(`platform.openai.com`). If that tab shows the standard (non-ZDR) tier, the accurate position to
record is: *"Writing text is not used to train OpenAI's models. It is retained by OpenAI for up to
30 days for abuse-monitoring purposes, then deleted, unless a longer period is legally required."*
That position, on its own, is not assessed as a reason to delay the controlled beta — no identifier
accompanies the writing text (§4), the DPIA now records the processor and the residual risk
explicitly, and no contradictory claim exists anywhere in the product now that §7's correction is
live. It would become a materially different, larger risk only if the Founder discovers the account
predates March 2023 defaults or has been explicitly opted into model-training sharing — check the
same Data Retention tab to rule this out.

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

OpenAI's specific retention/training configuration for this account: see §4a.

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

## 7. Parent transparency status — CORRECTED, live in production

A real Privacy Policy (`/privacy`) and Terms (`/terms`) already exist, both explicitly labelled
"Beta version." Cross-checked their factual claims against actual code behaviour:

**Accurate, verified claims** (unchanged): "We do not require children to create accounts to use
the platform" (true — anonymous-first, confirmed in LR-02); "We do not collect children's names,
photos or personal identifiers" (true — `profiles.name` never captures a real name, confirmed in
§2/AN-102); the Third-Party Services list (Supabase, OpenAI, Vercel) matches §5 exactly; "We do
not use Google Analytics, Facebook Pixel, or any advertising trackers" (true, confirmed in §5).

**The blanket consent claim — corrected, not merely flagged.** `/privacy` previously said "Parent
or guardian consent is required before account creation"; `/terms` previously said "Children must
have parental permission to use the platform." Neither had a corresponding technical gate in the
product (`/login`, read in full, has no consent checkbox or age/parent-affirmation step) — and,
per §1, "consent" was also not established as the actual lawful basis being relied on for account
creation, so the wording risked being wrong on two independent counts, not just one. **Both are now
corrected** to describe the real, verified mechanism instead of asserting a specific legal
safeguard: `/privacy` now reads *"A parent or carer sets up and controls any Angel 11+ account,
using their own email address — Angel 11+ is not a service a child signs up for independently"*;
`/terms` §3 now reads *"A parent or guardian sets up and controls any Angel 11+ account, using
their own email address"* / *"A child does not sign up for Angel 11+ independently."* Neither
document now makes a legal claim this session isn't qualified to make; both accurately describe
the architecture. The parent-led model itself is **not weakened** — if anything it is now stated
more precisely (the parent is the account holder, not merely a consent-giver on the side).

**Minor, lower-severity inaccuracy — also corrected**: `/privacy` §8 said "essential session
cookies for authentication" — the actual mechanism is `localStorage` (`sb-<ref>-auth-token`), not
a cookie. Now reads "local storage (not a cookie)."

## 8. Child-accessible transparency status — IMPLEMENTED, live

**A short, layered, child-facing explanation is now live** at the one point the product actually
acts on a child's own performance evidence: the dashboard's "Angel recommends next" card
(`app/dashboard/page.tsx`). A small info icon opens a dismissible popover (reuses the existing,
dependency-free `components/ui/Popover.tsx` — no new onboarding step, no privacy dashboard, no
redesign), written for a Year 4–6 reader, covering exactly the points required and nothing beyond
them:

> Angel remembers how you're getting on with each topic you practise. Your answers and results
> help Angel suggest useful practice for next time. Your parent or carer can see your learning
> progress. If you write something for feedback, a computer program helps check it and give you
> tips. Angel doesn't need things like your address, a photo, or your location to work. Not sure
> about something? Ask your parent or carer — they're in charge of your Angel account. You, or
> your parent or carer, can always ask us for help with your information.

Followed by a link: "Read our full Privacy Notice →" (to `/privacy`) — the required layered
transparency (short explanation + a clear route to the full notice), not a duplicate policy. No
internal terminology (Educational Intelligence, profiling engine, competency remediation,
algorithmic decision pipeline, OpenAI, API) appears anywhere in it. It does not claim data "never
leaves Angel" — it accurately, plainly discloses that writing feedback involves an external
process, without naming OpenAI or using "AI," consistent with this codebase's own established
messaging rule.

## 9. Cookies / analytics / local-storage findings

**No cookies are set by this application for authentication or session purposes** — Supabase's
browser client is configured to use `localStorage`, confirmed directly (`sb-<ref>-auth-token` key,
verified live). No cookie-consent banner exists; given the verified absence of any tracking/
advertising cookie or third-party analytics script (§5), the current legal need for one is limited,
but this has not been independently confirmed by anyone outside this engineering session — see
§15. `localStorage` usage inventory is exhaustive per §2; none of it is shared with a third party
or used to build an advertising profile.

## 10. Retention / deletion — accepted beta position (not self-service, by design at this scale)

**What Angel currently does** (not aspirational): cloud-synced data persists indefinitely while an
account exists — no automatic expiry/TTL job was found in the migration history. Deletion is a
**manual, Founder-operated process** (no self-service deletion RPC exists in the schema, §6),
consistent with the Privacy Policy's own "contact us" wording. **Accepted as the beta position**, per instruction not to build a self-service deletion portal for
a 10–25-family controlled beta — documented here as: **process** — a family emails the contact
address in `/privacy`/`/terms` requesting deletion; **owner** — the Founder, as the only account
with Supabase Dashboard access (confirmed in this and prior sessions — no other admin/service-role
credential exists in this project); **executable, but not as simple as "delete the profiles
row"** — verified directly against every `references public.profiles(id)` foreign key declared
across the migration history (`grep`, not assumed):
  - `user_stats`, `lesson_progress`, `ali_durable_mastery`, `ali_student_adaptive_state`,
    `ali_family_focus_selection` — all declared `on delete cascade`: deleting the `profiles` row
    removes these automatically.
  - `beta_family_applications`, `testimonials`, `feedback_submissions`, `bug_reports`,
    `feature_requests` — declared `on delete set null`: deleting the `profiles` row leaves these
    rows **in place** with `profile_id` nulled, not deleted. Since these tables hold the real
    `parent_name`/`email` PII (§2), **a genuine deletion request must explicitly also delete or
    anonymise these rows** — profile deletion alone does not remove a parent's name/email from a
    beta application or testimonial they submitted.
  - `ali_mock_attempt` (and the later mock-cycle tables) — declared with **no** `on delete`
    clause at all, Postgres's default (`NO ACTION`/effectively `RESTRICT`): if any mock attempt
    rows exist for a profile, **deleting `profiles` directly would fail with a foreign-key
    violation** until those rows are deleted first.
  - `ali_student_question_history` — **no foreign-key constraint is declared at all** (confirmed:
    `types/supabase.ts` lists `Relationships: []` for it); Postgres will not block deletion, but
    rows would become orphaned (a `profile_id` pointing to a deleted profile) unless manually
    deleted alongside it.

  **Practical implication for the Founder**: a real deletion request needs to touch `profiles` and
  every one of `user_stats`/`lesson_progress`/`ali_durable_mastery`/`ali_student_adaptive_state`/
  `ali_family_focus_selection`/`ali_mock_attempt*`/`ali_student_question_history`/
  `beta_family_applications`/`testimonials`/`feedback_submissions` in the right order (mock-attempt
  and question-history rows before `profiles`, given the RESTRICT/no-FK behaviour above) — not a
  single click. At 10–25 families this is a manageable manual SQL/Dashboard task, but it is a real
  multi-table operation, not the one-row deletion the Privacy Policy's "email us" wording might
  suggest to a reader. **Public-launch consideration** (not required for beta): a proper
  self-service or single-RPC deletion path, once family count exceeds what a manual multi-table
  process can reliably execute correctly every time.

## 11. Children's Code — standard-by-standard assessment (evidence-based, current 15 standards)

Source: [ICO — Age appropriate design: a code of practice for online services](https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/),
fetched live 2026-09-18.

| # | Standard | Assessment |
|---|---|---|
| 1 | Best interests of the child | The product's own stated architecture ("Angel recommends, family chooses," §4) and the absence of advertising/engagement-optimisation design are consistent with this; not independently certified. |
| 2 | DPIA | This document is the evidence pack; formal DPIA sign-off is a Founder action (§15). |
| 3 | Age-appropriate application | Angel targets a known age band (Year 4–6, ~8–11) via the parent-led setup flow; no separate "child self-declares age" gate exists to differentiate treatment within that band — not currently material given the narrow target age range. |
| 4 | Transparency | Parent-facing: the one discrepancy in §7 is now corrected and live. Child-facing: the gap in §8 is now closed with a live, layered, plain-language explanation. |
| 5 | Detrimental use of data | No advertising, no engagement-maximising dark patterns found; data used only for the stated educational purpose. |
| 6 | Policies and community standards | N/A — no user-generated public content, no social features. |
| 7 | Default settings | No optional data-sharing toggles exist to default correctly or incorrectly — nothing to switch off, by design (minimal collection, §3). |
| 8 | Data minimisation | See §3 — no finding. |
| 9 | Data sharing | No third-party data sale confirmed anywhere in code; processors are limited to §5, each necessary to the service. |
| 10 | Geolocation | Not collected anywhere in the schema — confirmed absent. |
| 11 | Parental controls | Architecturally parent-led (one account, parent sets it up), and the parent-facing wording now accurately describes this (§7) rather than overstating a consent mechanism that didn't exist. |
| 12 | Profiling | See §4 — profiling exists, is purpose-limited, and is now genuinely transparent to both parent and child (§7, §8). |
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

## 12. Risks to children — status this closure pass

1. **The production URL has no login wall.** `/login`'s own "Continue without signing in" option
   means anyone reaching the public URL — not just Founder-invited families — can start an
   anonymous session immediately. For a closed beta where the Founder controls who receives the
   URL and doesn't publicise it, this remains a low-probability, low-severity residual risk, not a
   blocker — genuine PUBLIC-LAUNCH work, not resolved and not attempted this session (would require
   an actual age-assurance/access-gating product decision, out of LR-01's bounded scope).
2. **Policy-vs-product gap on parental consent — RESOLVED this session** (§1, §7): the wording no
   longer claims a technical consent mechanism that doesn't exist; it now accurately describes the
   parent-led account architecture. The narrower question of whether Article 8 formally applies to
   this account-creation mechanic remains FOUNDER/LEGAL REVIEW REQUIRED (§1), but the corrected
   wording does not depend on resolving it.
3. **A child could incidentally disclose personal information inside AI-scored writing text**
   (§4) — inherent to the feature, not mitigated by a filter. Remains an accepted residual risk at
   beta scale; the new child-facing explanation (§8) at least makes the child-visible part of this
   ("a computer program helps check it") honest rather than hidden.

## 13. Safeguards already in place (verified, not assumed)

No advertising anywhere in the codebase or dependencies. No third-party analytics/tracking beyond
the three processors in §5, each necessary to the stated service. RLS empirically confirmed to
isolate each family's data (§6). No unnecessary child PII collected anywhere in the schema (§3).
Writing content sent to OpenAI carries no identifiers (§4). "Family chooses" is architecturally
real, not merely stated (§4).

## 14. Residual risks (after the above safeguards and this closure pass's corrections)

Two proportionate, documented residual risks remain for a closed, Founder-invited beta of this
size — neither is assessed as requiring the beta to be delayed: (1) the still-technically-public
URL with no login wall (§12.1, PUBLIC-LAUNCH scope); (2) a child incidentally disclosing personal
information inside AI-scored writing text (§12.3, inherent to the feature). Everything else raised
in the original evidence pass (parental-consent wording, child-facing transparency, OpenAI
retention documentation, deletion-process clarity) has been corrected, implemented, or accurately
documented this session — see §15.

## 15. Outstanding decisions / actions — owner and status

| # | Item | Owner | Status |
|---|---|---|---|
| 1 | Parental-consent wording corrected on `/privacy` and `/terms` | Engineering (this session) | **Closed** — live in production |
| 2 | Whether Article 8 formally applies to Angel's account-creation mechanic (§1) | Founder / legal advisor | Open — FOUNDER/LEGAL REVIEW REQUIRED, does not block beta (§1) |
| 3 | Child-facing "why Angel suggests this" explanation | Engineering (this session) | **Closed** — live in production (§8) |
| 4 | Verify OpenAI account's Data Retention tab (ZDR vs standard 30-day abuse-monitoring) | Founder | Open — exact location given in §4a; does not block beta unless it reveals a contradictory position |
| 5 | Execute a real beta deletion request end-to-end at least once, following §10's actual multi-table sequence, to confirm the documented process really works | Founder | Open — recommended before or during early beta, not a blocker |
| 6 | `/privacy`'s "session cookies" wording | Engineering (this session) | **Closed** — corrected to "local storage" |
| 7 | Formal legal review of this DPIA/Children's Code assessment | Founder / legal advisor | Not started — this document is the evidence pack, not the sign-off; recommended in parallel with beta, not required to start it |

**PUBLIC-LAUNCH requirements** (explicitly preserved, not required for controlled beta): a real
age-assurance mechanism beyond parent-selected year group, given 2026 ICO enforcement trends on
self-declaration (§11); closing the no-login-wall residual risk once the URL becomes discoverable
beyond direct invitation; a self-service or single-RPC deletion path once manual multi-table
deletion (§10) no longer scales; formal legal sign-off of this evidence pack.

---

*This assessment does not constitute legal advice or a formal compliance certification. It records
what was directly verified in the live production codebase, database schema, and live ICO guidance,
and distinguishes that from open questions requiring Founder or legal judgement. Two items above
remain genuinely open (Article 8 characterisation; OpenAI account-level retention setting) and are
explicitly marked FOUNDER/LEGAL REVIEW REQUIRED / FOUNDER VERIFICATION REQUIRED rather than
resolved by assumption.*
