# Updated Founder Test Instructions — Mathematics Reference Vertical (Post-Remediation)

**Prepared:** 2026-08-11
**Start here:** `https://angel-11plus.vercel.app/learning-intelligence/learn/mathematics/arithmetic`

No account setup, internal routes, or database knowledge needed — just click "Start the lesson."

## One remaining step before this is fully testable at the data level

Migration `supabase/migrations/024_evidence_provenance_and_support_tier.sql` has not yet been applied to the live database (confirmed by direct query). It adds two new, additive, optional columns — nothing destructive, nothing that touches existing data. To apply it: Supabase Dashboard → SQL Editor → New query → paste the file's contents → Run.

**This step is not required for you to test the experience itself** — the guided-support ladder, the borrowing-across-zero content, and the underlying mastery-accounting fix (a supported answer no longer counts as independent evidence) all already work correctly on production right now, confirmed by direct testing this session. The migration only adds two columns used for deeper database-level auditability of *why* an answer was supported vs independent — not needed for the experience itself to behave correctly.

## What changed since the last test instructions

1. **Getting the Guided Attempt wrong is no longer a dead end.** Try answering `652 + 279` incorrectly — you'll get a targeted hint (not the answer) and a real second try. Get it wrong again, and you'll see the full worked method, then one more supported try. However you resolve it, you'll then move to "Now try one alone."
2. **The borrowing-across-zero explanation is much deeper.** Scroll to the `1000 − 473` worked example — it now explains why borrowing is needed, why zero can't lend directly, where the extra value comes from, with a before/after place-value table and a way to check the answer yourself.
3. **Wrong-answer feedback is more specific when Angel can genuinely tell what happened.** If you deliberately answer `821` on the Guided Attempt (a very common "forgot to carry" mistake) or `565` on the Independent Check (the classic across-zero borrowing mistake), you'll see feedback that names the specific pattern — any other wrong answer gets an honest, general nudge instead.

## Suggested test sequence

1. Try the Guided Attempt with `821` first (see the targeted feedback), then `940` (a generic wrong answer — see the full worked method appear), then `931` (the real answer, as a supported recovery).
2. On the Independent Check, try `565` (see the specific across-zero feedback), then use "Let's go through this again" to reset and try the whole lesson once more, answering both correctly on the first try this time — notice it moves straight through with no extra friction.
3. Check the Parent Dashboard afterwards (`/learning-intelligence/parent`) — the "What needs attention?" card should reflect real progress in plain language.

## What's still marked "needs independent review," not "done"

Per the Remediation Gate: engineering can confirm the guided ladder and the borrowing-across-zero content now cover everything asked of them structurally — it cannot certify that they are genuinely *understandable* to a real struggling child. That judgement is yours, and subsequently independent educational review's, not this session's.
