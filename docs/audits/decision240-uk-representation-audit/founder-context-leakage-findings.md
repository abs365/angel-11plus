# DECISION 240 — Founder-Context Leakage Investigation

Per directive Section 7: distinguish evidence from inference; do not claim a technical cause unless repository evidence supports it.

## What was searched

- `scripts/*.mjs` — every content-authoring/generator script (`grep -il "names\s*=|nameList|namePool|character.*name|generate.*prompt|authoring.*prompt"` across `scripts/`)
- `docs/` — every file mentioning diversity/representation/cultural/ethnic/Yoruba/Nigerian/African (19 files matched; all but two are false-positive matches on unrelated uses of "represent"/"represented", or this audit's own new files)
- `QUESTION_AUTHORING_STANDARD.md` — the repository's own existing content-authoring standard
- Repository root for any seed/fixture/name-list files

## SOURCE-READ EVIDENCE

1. **No name-selection generator, name pool, or randomisation mechanism exists anywhere in the repository.** The two scripts matching a name-related grep (`scripts/generate-english-wave1.mjs`, `scripts/generate-007t-english-rc10.mjs`) are **hand-authored content files** — the character names (e.g. "Maya", "Mr Fenwick", "Priya" in `generate-007t-english-rc10.mjs`) are typed directly into the passage `text:` template literal as final content, not selected from any list, template, or generation prompt at runtime. There is no code path anywhere that picks a name algorithmically or from a data structure.

2. **`QUESTION_AUTHORING_STANDARD.md` line 38 already contains a general cultural-neutrality principle**: *"Cultural neutrality. Avoid assuming a specific religious, regional (beyond general UK), or family-structure background. Animals, everyday objects, school life, and nature are the safest, most-used domains in the existing bank for good reason."* This is evidence that SOME cultural-neutrality awareness already exists in the authoring standard — but it is scoped to Verbal Reasoning analogy content (`vr.*` domain) and to avoiding assumed religious/regional/family-structure background, not to personal-name selection or distribution across English/Maths narrative content specifically. **No dedicated naming/representation policy exists anywhere in the repository.** This is a confirmed absence, not an inference.

3. **No mechanism was found by which the Founder's own identity, background, or personal conversation context could enter a content-generation prompt.** There is no prompt-template file, no `.env`-driven persona/bio injection, and no reference to the Founder's name, background, or personal details anywhere in the content-authoring scripts or migration files searched. This audit found **no evidence supporting a literal "Founder-context leakage" mechanism** as originally hypothesised in the directive's framing.

## REASONED-PROOF EVIDENCE (labelled as inference, not fact)

The repeated/clustered naming pattern found in `cultural-distribution-analysis.md` (specifically: "Ade" independently reused as three unrelated characters across two separate migrations authored in different sessions; "Okafor" reused as a surname for two unrelated characters) is better explained by a different, evidence-consistent mechanism than personal Founder-context leakage:

- This content estate has been authored incrementally over ~163 migrations, across many separate authoring sessions (including sessions conducted by an AI assistant, evidenced by this session's own governance log and the `generate-*.mjs` scripts' own header comments describing themselves as AI-assisted authoring outputs).
- **No "names already used across the estate" ledger, check, or cross-migration lookup exists anywhere in the authoring tooling.** Each migration's content was authored with visibility only into its own immediate context, not the full prior name inventory this audit had to reconstruct from scratch via `_extract.mjs`/`_digest.mjs`.
- It is a well-documented characteristic of LLM-assisted text generation (independent of any project-specific personal data) that repeated independent generations, absent an explicit instruction or shared state to avoid repetition, will tend to reconverge on a narrower set of "typical" names for a given implied cultural context than a truly uniform-random human population would — this is a general property of language-model output distributions, not evidence of THIS project's Founder identity specifically leaking in.
- **This is inference, not proven root cause** — the repository contains no logging of the actual authoring prompts used in past sessions, so this cannot be confirmed to certainty. It is offered as the most evidence-consistent explanation, clearly distinguished from the "Founder identity leaked into a prompt" hypothesis, which this audit found no supporting evidence for at all.

## Conclusion for Section 7

- Founder identity/background entering generation prompts: **no evidence found.**
- Previously-authored names repeatedly reused: **evidenced** (Ade-root ×3, Okafor-root ×2) — mechanism is absence of a cross-session name ledger, not Founder-context leakage specifically.
- Examples seeding later generation: **plausible per the reasoning above, not directly provable** from repository evidence alone (no prompt logs exist).
- Cultural distribution is uncontrolled: **confirmed** — no distribution check, quota, or review step exists anywhere in the authoring or review pipeline.
- No diversity/naming policy currently exists: **confirmed** — beyond the general cultural-neutrality line in `QUESTION_AUTHORING_STANDARD.md` line 38, no dedicated policy exists.
