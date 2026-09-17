---
name: angel-privacy-launch-readiness
description: Use when a task touches child data handling, privacy, consent, safeguarding, or any claim about Angel 11+'s launch/compliance readiness. Placeholder skill — the formal Children's Code/DPIA work is active and not yet independently verified. Do not fill this gap with an invented conclusion.
---

# Angel — Child Privacy / Launch Readiness (placeholder)

**This is a placeholder, not a completed policy.** Formal Children's Code (UK ICO Age Appropriate
Design Code) and DPIA (Data Protection Impact Assessment) work is **active and ongoing**, not
finished. Do not treat the existence of privacy-adjacent documentation elsewhere in the repo as
proof of compliance.

## What you may say

- Angel handles data for children aged 9–11 preparing for selective school entry; this makes
  Children's Code compliance a real, applicable requirement, not a nice-to-have.
- Formal DPIA / Children's Code work is part of the active launch-readiness track (see
  `ANGEL_PROJECT_STATE.md` → Launch context).
- Any specific technical safeguard you can directly verify in code (e.g. "no child's name is
  logged to console X", "RLS restricts row Y to its own auth_user_id") — state only what you
  directly checked, and how.

## What you must not do

- **Do not declare Angel "compliant," "GDPR-ready," "Children's-Code-compliant," or similar**,
  even provisionally, even if asked directly. That is a legal/formal determination outside what a
  code-level review can establish.
- **Do not invent a compliance conclusion** to fill a gap in this skill or in the state doc.
  If asked for a compliance status, say plainly that formal DPIA/Children's Code review is active
  and not yet concluded, and that this is a question for whoever owns that workstream, not for an
  engineering session to resolve informally.
- Do not treat privacy/safeguarding as "just another technical imperfection" to wave through — if
  a change touches child data in a new way, flag it explicitly rather than proceeding silently.

## Bounded, safe practice regardless of the formal policy's state

- Never expose a child/family's PII in logs, error messages, or committed content.
- Never cross-reference or expose one learner's data while investigating another's account issue.
- Treat any production learner account (even a known test/acceptance account) with the same care
  as a real child's data, because for launch purposes it may become one.
