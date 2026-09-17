<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:angel-constitution-v1 -->
# Angel Claude Operating System v1.0 — The Angel Constitution

This is the permanent operating context for any Claude session working on Angel 11+.
Read this before acting. It is deliberately short — for detail, see `ANGEL_PROJECT_STATE.md`
(current state) and the specific `ANGEL_*.md` report for whatever you're touching, not this file.

## Mission

Angel 11+ is an **evidence-based selective-school preparation platform, not a question bank.**
CSSE is the first deeply validated pathway; the architecture remains capable of supporting others,
but do not assume other pathways are production-ready without checking.

## The educational loop

```
Diagnose → Prioritise → Teach → Practise → Assess → Review → Maintain Mastery → Rebalance
```

Every capability you add or change should be locatable on this loop. "More questions" is rarely
the answer if the gap is elsewhere on it (see the Wave 1 remediation-silence finding for a real
example: the platform had teaching content that a rendering gate silently discarded).

## Core educational rules

- **Year is a preparation horizon, not fixed ability.** A strong younger learner may receive
  advanced work; an older learner with a genuine gap may receive foundation teaching.
- **Evidence determines support/difficulty** — not assumption, not year group alone.
- **Supported success is not independent mastery.** Guided-mode correctness must never be recorded
  or treated as equivalent to independent mastery.
- **Practice teaches. Mock measures.** Do not blur this boundary — Mock content stays sealed from
  Practice, and Practice's teaching scaffolds must never leak into Mock.
- **Angel recommends; the family chooses.** Recommendations are never silently enforced as the
  only path.
- **Mastery requires varied structures and transfer**, not repeated surface variants of the same
  skeleton. Detect and avoid manufacturing near-duplicate questions.
- **Familiar exam. Familiar skills. Unfamiliar problems.** New questions should exercise the same
  evidenced skills through genuinely different structures, not just new numbers/names.
- **Do not optimise for raw question count.** A smaller bank with real structural diversity beats
  a larger one of shallow permutations. (Current long-term direction: 3,000+ validated questions
  with real depth — not a target to rush toward.)
- **Original preparation content only**, unless rights are explicitly confirmed otherwise.
- **Never invent CSSE rules, scoring, or marking structures.** If a real exam-board specification
  isn't confirmed, say so — don't fabricate authority.

## Core engineering rules

- **Investigate before building.** Read the real, live production evidence (data, not old reports)
  before proposing or building anything. Prior-report numbers go stale fast — verify.
- **Reuse existing engines before creating new ones.** The Question Factory, ALI (Angel Learning
  Intelligence) selection engine, and Educational Intelligence Engine already exist — extend them,
  don't build parallel systems.
- **Production evidence outranks implementation assumptions and outranks prior reports.**
- **Distinguish product defects from environment/test/account-fixture failures** before reporting
  either as the other. A broken local `.env.local`, a stale test baseline, or a guest-mode browser
  session are not Angel defects — verify against a clean baseline before claiming a regression.
- **No direct unsafe production mutation.** Use governed RPC/admin mechanisms
  (`submit_question_candidate`, `publish_question_candidate`, etc.) — never raw writes to publish
  or approve content. An anon-authenticated session cannot publish (`is_current_user_admin()` is
  false for anon) — that is a scope boundary, not a bug to route around.
- **Never expose, request, store, or manipulate passwords, tokens, service-role credentials, or
  secrets** — including partial/redacted display, and including a real production learner's
  credentials. If a real learner login is needed for verification, stop at the exact login point
  and hand it to the Founder.
- **Do not reopen closed milestones** (see `ANGEL_PROJECT_STATE.md`) **without genuinely new
  material evidence** discovered during normal use — not routine re-auditing.
- **Do not let every technical imperfection become a new project gate.** Distinguish a material
  defect from a cosmetic or already-disclosed limitation.

## Where to look first

| Question | Look here |
|---|---|
| What's the current state, what's closed, what's next? | `ANGEL_PROJECT_STATE.md` |
| Deploy/environment setup | `DEPLOYMENT.md` |
| ALI engine capabilities (dated — verify against live production first) | `ALI_VERSION.md`, `ALI_OPERATIONS_MANUAL.md` |
| Product/architecture overview | `PROJECT_CONTEXT.md` |
| Specific programme/wave history | The matching `ANGEL_*.md` report by name |
<!-- END:angel-constitution-v1 -->
