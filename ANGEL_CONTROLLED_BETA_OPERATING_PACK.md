# Angel 11+ — Controlled Beta Operating Pack

**One concise, usable operating document for the Founder during the 10–25-family Free Controlled
Beta.** Not an essay, not a new system — every mechanism below is either something Angel already
has (reused, not duplicated) or the Founder's own direct action (Supabase Dashboard, email). Built
2026-09-18 on top of LR-01 (`ANGEL_LR01_DPIA_AND_CHILDRENS_CODE_ASSESSMENT.md`, GO) and LR-02
(GO). Status: **ready to use for Family #1.**

---

## 1. Objective

Invite real families in a controlled, low-risk way; know whether Angel is actually working for
them educationally; catch and triage problems correctly (technical vs educational); protect
learner evidence and privacy; decide when to invite the next cohort. This is a free educational
beta — there is no commercial conversion target.

## 2. Cohort definition and ramp

Do not invite all 10–25 at once.

| Wave | Size | Purpose | Gate to next wave |
|---|---|---|---|
| Wave 0 | 1 family | Prove the whole loop works end-to-end with a real, unfamiliar (non-Founder) household | No unresolved P0/P1 (§9); activation reached (§4); Founder completed one full cadence pass (§10) |
| Wave 1 | 2–5 families | Confirm Wave 0 wasn't a fluke; first real variation in device/year-group/subject mix | No unresolved P0/P1; scorecard (§6) shows a genuine signal, not just one data point |
| Wave 2 | remaining, up to 25 | Fill out the cohort | Same — reviewed at the Founder's own pace, not on a fixed calendar |

Each family within a wave is **not** its own formal acceptance gate — only P0/P1 issues or a
material scorecard shift should pause the ramp.

## 3. Existing capabilities inventory — reused, not duplicated

| Need | Existing mechanism | Notes |
|---|---|---|
| Beta application / inbound interest | `/beta-family` (`beta_family_applications` table) | For organic word-of-mouth interest, not needed for a Founder-selected Family #1 |
| Authentication / account creation | `/login` (magic link or password) | Parent-led, corrected wording live (LR-01) |
| Parent onboarding, pathway setup | `/pathways` | Confirmed good UX in LR-02 |
| Learner setup, first activity | Dashboard "Start Today's Mission" | Confirmed working in LR-02 |
| Progress visibility | Parent Dashboard (`/learning-intelligence/parent`) | Confirmed working in LR-02 |
| General feedback | `/feedback` (`feedback_submissions`) | Reused for parent feedback, §7 |
| Bug reports | `/report-bug` (`bug_reports`) | Reused for technical issues, §8 |
| Feature requests | `/feature-request` (`feature_requests`) | Reused |
| Testimonials | `/testimonial` (`testimonials`) | Reused, optional, later in the journey |
| Support hub | `/contact` | Already links all of the above plus direct email |
| Privacy/child-data transparency | `/privacy`, dashboard popover (LR-01) | Reused |
| **Admin visibility into all of the above** | **Supabase Dashboard → Table Editor** | See §3a — no new in-app admin page was built; this is intentional |

### 3a. Why no new admin/beta-management page was built

Every table above (`beta_family_applications`, `bug_reports`, `feedback_submissions`,
`feature_requests`, `testimonials`, plus `profiles`/`ali_student_question_history`/
`ali_mock_attempt*` for activation evidence) is directly browsable today in the **Supabase
Dashboard → Table Editor** — the same tool the Founder already uses for every migration in this
project. At 10–25 rows per table, this is a genuinely adequate, zero-engineering "admin view."
Building an in-app admin page for this would be exactly the beta-management platform this task
explicitly said not to build. Revisit only if family count materially exceeds what Table Editor
can comfortably show at a glance (a public-launch-scale consideration, not a beta one).

## 4. Family #1 invitation process

1. **Founder selects a family** they know personally (Wave 0 — deliberately not a stranger).
2. **Founder sends a direct message** (email or WhatsApp — no new tooling needed) containing:
   the production URL (`https://angel-11plus.vercel.app`), one sentence on what Angel is
   ("an 11+ preparation platform your child can start using right away, no set-up needed from
   you first"), and an invitation to use "Email me a secure sign-in link" on `/login` to create
   their own account when ready (or to let their child explore anonymously first — both are
   real, working paths per LR-02).
3. **Parent expectation, stated plainly in the same message**: sign-in is optional to start; the
   child can begin practising immediately; the parent can look at `/learning-intelligence/parent`
   whenever they want to see progress; nothing needs to be "set up" beyond picking a pathway
   (optional, changeable any time) on first use.
4. **What the child should do first**: click "Start Today's Mission" on the dashboard — this
   already routes to a real, working, evidence-based first activity (LR-02).
5. **What the Founder should not need to explain manually**: the pathway choice (the `/pathways`
   cards already explain each option in plain language); why Angel picked a topic first (the new
   dashboard popover, LR-01, explains this to the child directly); what "Building Confidence"
   etc. means (already explained inline, LR-02).

No invitation-code system, no separate onboarding flow, no new engineering — this process is
adequate for 10–25 families by design.

## 5. Activation definition — evidence-based, not "account created"

**A family is ACTIVATED when the learner's preparation stage has moved out of
`insufficient_evidence`** (`derivePreparationStage()`, `lib/learningEngine/preparationStage.ts`)
— i.e. at least one tracked competency has accumulated enough real attempts to earn a
non-"insufficient" confidence tier, and `preparationDecision.placementRequired` is `false`.

This is not invented telemetry — it is the exact, already-computed signal that flips the
dashboard's "Angel recommends next" card from the generic *"Not enough practice yet to judge
where to focus. A short first session in each area will help build a real picture"* to a real,
specific recommendation (e.g. *"Practise Algebraic / Symbolic Problem-Solving with support"*).

**How the Founder checks it, without a new tool**: ask the parent what the "Angel recommends
next" card currently says (fastest — the parent can just describe or screenshot it), or, with the
family's `profile_id` (from `profiles` in Supabase Table Editor), check whether any row exists yet
in `ali_student_question_history` for that profile with a non-`"insufficient"` implied mastery
signal — in practice, "has the family's dashboard stopped saying 'not enough practice yet'" is
sufficient and is what most parents will report unprompted anyway.

## 6. Beta scorecard — 5–8 measures, no vanity metrics

Each measure is marked **INITIAL OPERATING SIGNAL** (meaningful at n=1–5) or **VALIDATED
BENCHMARK** (only meaningful once the fuller cohort is in) — do not pretend statistical
significance at beta scale.

| # | Category | Measure | Evidence source | Type |
|---|---|---|---|---|
| A | Access | Did the invited family successfully sign in / start using Angel? | Direct parent report, or a `profiles` row with real activity | INITIAL SIGNAL |
| B | Activation | Did the learner reach activation (§5)? | `ali_student_question_history` / dashboard card | INITIAL SIGNAL |
| C | Return | Did the family come back for a second genuine session within ~1 week of activation? | `last_presented_at` spread across ≥2 distinct days in `ali_student_question_history` | INITIAL SIGNAL, becomes a real pattern by Wave 1 |
| D | Educational function | Is `ali_durable_mastery`/the recommendation actually changing as the learner answers more questions (not static)? | Compare `preparationDecision.recommendedCompetencyId` across two check-ins | INITIAL SIGNAL |
| E | Parent understanding | Can the parent describe, in their own words, what Angel is currently recommending and roughly why? | Asked directly in the feedback check-in (§7) | INITIAL SIGNAL |
| F | Reliability | Any P1/P2 learner-facing defect reported for this family? | `bug_reports` + Founder's own observation | Tracked per-family, cohort view is a VALIDATED BENCHMARK |
| G | Support burden | How many support contacts did this family need, and were they resolved without a code change? | `feedback_submissions`/`bug_reports` count | VALIDATED BENCHMARK by Wave 1 |
| H | Safety/privacy | Any privacy/deletion request, and did the documented process (§11) work end-to-end? | Founder's own log (§11) | Tracked per-instance, not a rate at this scale |

## 7. Feedback — parent and learner, short, reusing existing capability

**Parent** — reuse `/feedback` (already live, adult-appropriate tone). The Founder sends these 6
questions directly (email/WhatsApp) once the family has activated, rather than adding new form
fields to `/feedback` for a handful of families:

1. Was getting set up clear?
2. Did you understand what Angel recommended your child do first, and why?
3. Did the progress information on your Parent Dashboard make sense?
4. Was anything confusing?
5. What would stop you or your child wanting to keep using Angel?
6. What was most useful so far?

**Learner** — deliberately **not** a new written form (avoids collecting a child's own written
text into a new database table just for this, and avoids a "long research questionnaire"). The
Founder (or the parent, on the Founder's behalf) asks these conversationally, in child-appropriate
language, during or shortly after the first session:

1. Did you know what to do when you started?
2. When something was tricky, did Angel help?
3. Was anything confusing?
4. Was anything too easy, or too hard?
5. What did you like?
6. Would you want to use Angel again?

If a family prefers to write it down, `/feedback` remains available and is fine to reuse for that
too — no separate child-mode form is being built for this beta size.

## 8. Support / issue reporting — reused, with a triage note

`/contact` → `/feedback` (general) / `/report-bug` (technical) / direct email already gives a
family an obvious way to say something is wrong or confusing. Mapping onto the categories this
pack needs the Founder to distinguish:

| Category | Where it lands today | Founder action |
|---|---|---|
| TECHNICAL | `/report-bug` (`bug_reports`) — already has a page + issue-type selector | Reproduce, fix, or log as known issue |
| EDUCATIONAL CONTENT (a specific question/explanation is wrong) | `/report-bug` ("Wrong answer accepted"/"Correct answer rejected") or `/feedback` free text | See §10 — never a same-day content rewrite |
| EDUCATIONAL RECOMMENDATION (what Angel suggested seems wrong) | `/feedback` free text (no dedicated category exists yet) | See §10 |
| ACCOUNT/ACCESS | `/feedback` or direct email | Check `profiles`/`auth.users` in Supabase |
| PRIVACY/DATA | `/privacy` → `/contact`, or direct email | See §11 |
| OTHER | `/feedback` | Founder judgement |

**Genuine, bounded gap, not fixed this session** (BETA IMPORTANT, not a blocker): `/feedback` and
`/report-bug` don't yet have a dedicated "the recommendation seems wrong" or "privacy question"
category — at 10–25 families the Founder reading each free-text submission personally is adequate
triage; a dedicated category becomes worth adding only once volume makes that impractical.

## 9. Incident severity — small, operational

| Severity | Definition | Founder action |
|---|---|---|
| **P0** | Child-data exposure, security, or safety issue | Stop, secure immediately (smallest safe fix), inform affected family directly, do not wait for the next cadence check-in |
| **P1** | A family cannot access Angel, or the learner cannot reach meaningful activity | Fix or work around within the same day where possible; message the family so they're not left wondering |
| **P2** | A material educational/content/recommendation defect exists, but a workaround exists (e.g. a different topic still works) | Log, review via §10, fix through normal governed content process — not urgent enough to interrupt the cadence |
| **P3** | Minor UX/copy/cosmetic issue | Log, batch into normal engineering work, no separate beta process needed |

## 10. Educational incident procedure — protects evidence integrity

A learner/parent report like *"this question is wrong,"* *"I don't understand this explanation,"*
*"Angel keeps giving me the same thing,"* or *"this is much too easy"* is an **educational
question, not automatically a software bug**. Route:

1. **Preserve the evidence first** — note the exact question/family/competency and, if possible,
   the `profile_id` and approximate time, from `ali_student_question_history`/`ali_mock_attempt*`
   (Supabase Table Editor). Never edit or delete a learner's own historical attempt row to "fix"
   how it looks — that evidence is real and must stay real.
2. **Classify**: content defect (the question/answer/explanation is factually wrong) vs marking
   defect (a correct answer was scored wrong, or vice versa) vs teaching gap (no explanation
   exists yet for this family) vs recommendation issue (the *selection* logic, not the content
   itself, seems off) vs genuinely correct-but-hard (not a defect at all).
3. **Review through this repo's existing governed content mechanisms** — the same
   Question Factory / `/admin-beta/review` independent-review process already used throughout
   Educational Depth Phase 1 Waves 1–2, never a same-session silent edit to live content.
4. **Correct only through that governance** if a genuine defect is confirmed — a new migration,
   reviewed and Founder-applied, exactly as every content change in this repo already works.
5. **Never rewrite a learner's historical evidence** to make a past attempt "look right" after a
   content fix — the fix applies going forward; the record of what actually happened stays intact.

## 11. Privacy / deletion — operational procedure (LR-01's multi-table sequence, made usable)

1. **A parent requests deletion** — by email, per `/privacy`'s existing "contact us" route. No
   child should ever need to make this request directly; if one does, treat it as a signal to
   contact the parent, not to act on the child's instruction alone.
2. **Founder identifies the account** — via the parent's email in Supabase Dashboard → Auth →
   Users, then the matching row in `profiles` (`auth_user_id`).
3. **Founder executes the documented sequence** (full detail:
   `ANGEL_LR01_DPIA_AND_CHILDRENS_CODE_ASSESSMENT.md` §10) — in order: delete rows in
   `ali_mock_attempt`/`ali_mock_attempt_answer`/`ali_mock_attempt_report` and
   `ali_student_question_history` for that `profile_id` first (no cascade exists for these), then
   delete or anonymise the matching `beta_family_applications`/`testimonials`/
   `feedback_submissions`/`bug_reports`/`feature_requests` rows (these `set null` rather than
   cascade, so the parent's name/email survive unless handled explicitly), then delete the
   `profiles` row itself (this cascades `user_stats`, `lesson_progress`, `ali_durable_mastery`,
   `ali_student_adaptive_state`, `ali_family_focus_selection` automatically), then delete the
   `auth.users` entry via Supabase Dashboard → Auth.
4. **Founder verifies completion** — re-query each table above by the same `profile_id`/email;
   confirm zero rows remain (or zero non-anonymised PII, for the `set null` tables).
5. **Founder informs the family** that deletion is complete, by the same channel the request
   arrived on.

**Recommended, not yet done**: the Founder should execute this once end-to-end on a genuinely
appropriate test/volunteer account early in the beta (not manufactured merely for this document)
to confirm the sequence works exactly as written before it's ever needed for real.

## 12. OpenAI retention — unresolved Founder check, does not block LR-03

Preserved from LR-01, not re-litigated: **OPENAI RETENTION CONFIGURATION — FOUNDER VERIFICATION
REQUIRED.** Check `platform.openai.com` → Settings → Organization → Data controls → Data
Retention. Does not block inviting Family #1.

## 13. Founder operating cadence — light, not continuous monitoring

| When | Action |
|---|---|
| Before inviting a family | Confirm production is `Ready` (`vercel ls`/`vercel inspect`, or just load the site) and there's no open, unresolved P0/P1 |
| Right after sending an invitation | Nothing — do not chase; let the family arrive in their own time |
| After the family's first real use | Check activation (§5) via the quickest available signal (ask the parent, or a 30-second Table Editor look) |
| Weekly-ish during the beta (not daily) | Skim `bug_reports`/`feedback_submissions`/`feature_requests` in Table Editor; note anything P0/P1 |
| At the natural feedback point (family has used Angel meaningfully for ~1–2 weeks) | Send the 6 parent questions (§7); have the short conversation with the learner |
| Before moving to the next cohort wave | Review the scorecard (§6) and confirm no open P0/P1 |

## 14. Known limitations, carried forward from LR-01/LR-02 (not re-opened)

Child display name is local-storage-only, not cross-device (AN-102, accepted). One approved
picture-led Writing prompt exists (Wave 2), not yet mature content depth. `/feedback`/`/report-bug`
don't yet have dedicated recommendation/privacy categories (§8, BETA IMPORTANT, not a blocker).
Manual, multi-table deletion process (§11, accepted for this scale). OpenAI account-level
retention setting not yet Founder-verified (§12).

## 15. Public-launch items explicitly excluded from this beta

Real age-assurance beyond parent-selected year group; closing the no-login-wall residual risk once
the URL is publicly discoverable; self-service/single-RPC data deletion; a dedicated in-app admin
console (§3a); formal legal DPIA sign-off; any commercial/payment flow.

---

*This pack is operational, not a new formal gate. Update it in place as the beta runs — do not
create a second version. See `ANGEL_PROJECT_STATE.md` for the current closure status of LR-01/LR-02
and every Educational Depth milestone this pack builds on.*
