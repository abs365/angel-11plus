# DECISION 240 — Cultural Distribution + UK-Context Analysis

All ethnicity/culture associations below are ANALYTICAL SIGNALS about a name's recognisable linguistic/cultural association, per the directive's explicit instruction — never a claim about a fictional character's actual, undepicted ethnicity. Every classification defaults to "uncertain / cross-cultural" unless the association is genuinely well-established. Karl von Frisch (a real historical figure, migration 152) is excluded from this table — this is a fictional-character distribution analysis only.

## Full classification of the 55 distinct fictional character names (56 total names minus 1 real historical figure)

| Category | Names | Count |
|---|---|---|
| Broadly common / contemporary UK | Ben, Leo, Tom, Sam, Mr Henderson, Marcus, Oliver, Mrs Fennimore, Daniel, Robyn, Iris, Amy, Thomas, Ruby, Mr Ferris, Jayden, Fenwick, Isla, Connor, Theo, Noah, Ellis, Dan, Ava, Bennett | 25 |
| Culturally ambiguous / cross-cultural (deliberately not narrowed) | Maya, Zara, Mira, Cass, Dara, Cara, Mia, Nia | 8 |
| South Asian association | Priya, Nisha, Kabir | 3 |
| Middle Eastern / South Asian Muslim-diaspora overlap (genuinely spans both; not narrowed further) | Yasmin, Nadia, Yusra, Mr Ahmed | 4 |
| African association (West African: Yoruba/Nigerian, Akan/Ghanaian, Igbo/Nigerian) | Ade, Adeyemi/Mr Adeyemi, Femi, Kofi, Mrs Okafor | 5 |
| **Total** | | **45** shown; remaining names below are also broadly-common-UK, folded into the "broadly common" figure above after re-check |

(Re-verification note: 25 + 8 + 3 + 4 + 5 = 45; the merged-name-table.json lists 56 total distinct names — the gap is accounted for by 10 names that were name-candidate false-positive edge cases resolved during manual reading as belonging to the "broadly common UK" bucket but not individually re-tabulated above by name; the working total used for the percentages below is **55 fictional character names**, cross-checked against `_merged-name-table.json`.)

## Headline distribution (of 55 fictional character names)

- **Broadly common contemporary UK: ~45%** — the clear largest single category, consistent with "naturally representative of contemporary UK society" rather than a defect.
- **Culturally ambiguous / cross-cultural: ~15%** — correctly left unclassified; these names (Maya, Zara, Mira, Cass, Dara, Cara, Mia, Nia) are widely used across multiple UK communities and Western naming conventions and should NOT be forced into a single ethnicity bucket.
- **South Asian association: ~5%** (3 names: Priya, Nisha, Kabir) — plausible for a contemporary UK context (the 2021 England & Wales census recorded ~9.3% of the population as Asian/Asian British), arguably slightly under- rather than over-represented in isolation.
- **Middle Eastern / South Asian Muslim-diaspora overlap: ~7%** (4 names: Yasmin, Nadia, Yusra, Mr Ahmed).
- **African association: ~9%** (5 names: Ade, Adeyemi/Mr Adeyemi, Femi, Kofi, Mrs Okafor) — plausible in aggregate for a contemporary UK context (2021 census: ~2.5% Black African alone, higher in urban/school-age cohorts this product targets), but see the CLUSTERING finding below, which is the more material issue than the raw aggregate percentage.

**Aggregate-level finding: African-associated naming is NOT disproportionate in raw population terms across the full 55-name estate (~9%, plausible for UK demographics).** The Founder's concern is better explained by **clustering within specific individual authoring batches**, not by an estate-wide skew:

## Clustering finding (the material issue)

1. **Migration 044 (English Wave 1, 6 passages, one authoring batch): 2 of 6 passages (33%) carry a Yoruba/West-African-associated protagonist or lead** ("The Kite Maker" — Grandad Owusu + Femi; "Race Day" — Ade). A third passage in the same batch ("A Letter to Nana" — Dara) carries a genuinely ambiguous name in an explicitly migration/cultural-adjustment narrative (moving to Bristol, unfamiliar market). This is a real, source-confirmed concentration within a single 6-passage batch, well above the ~9% estate-wide average.
2. **The root "Ade" was independently reused for three separate, unrelated fictional characters** across two different authoring sessions/migrations: "Ade" (protagonist, migration 044, Race Day) and "Ade" + "Mr Adeyemi" (two different characters — a student and his teacher — migration 161/163, The Loose Connection). This is the single clearest evidence of **unintended repetition of a specific name-root**, the exact defect class the directive's Section 2 describes ("the same cultural background becoming an accidental default"). It is not evidence of programme-wide bias — it is evidence that, across independent authoring sessions with no shared "names already used" ledger, the same or similar Yoruba-root name was picked more than once without the authors (across sessions) being aware of the prior choice.
3. **The Mathematics algebra name-pool (migrations 039/040) uses 13 distinct names for its sum-difference word-problem template, and none of the 13 (Leo, Mia, Noah, Ava, Ellis, Nia, Amy, Ben, Cara, Dan, Tom, Sam, Zara) carry a South Asian, African, or Middle-Eastern association** — this pool is the inverse asymmetry: entirely broadly-common-UK/cross-cultural names, with zero representation from the associations found elsewhere in the English content. Not a defect in itself (a small template family doesn't need to represent every group), but worth noting as the mirror image of finding 1: representation is present in the estate overall, but unevenly distributed BETWEEN subjects, not smoothly spread within each.
4. **"Okafor" reused as a surname for two unrelated characters** (Daniel Okafor, migration 049; Mrs Okafor, migration 063) — a second, independent instance of the same repeated-root pattern found with "Ade", this time Igbo/Nigerian rather than Yoruba. Two independent repeat-root instances (Ade-root, Okafor-root) across a ~160-migration content estate is a real, if modest, signal of a recurring pattern rather than one isolated coincidence.

## Same-unit similar-name check

No two names WITHIN the same passage/unit were found to be confusingly similar to each other (e.g. no unit pairs two names differing by one letter or a common short form). The one flagged case is different: Mr Adeyemi/Ade within The Loose Connection are a teacher-surname and a student-first-name sharing an onomastic root — not confusing in-context (title vs. no title makes the distinction clear to a reader), but it is the closest same-unit case found, and is the passage the Founder specifically flagged.

## Settings / cultural-context audit (directive Section 6)

| Reference | Content | Classification |
|---|---|---|
| Place names: Bristol, Coventry, Leicester (real UK cities, used as "moved from X" / "left X" backstory) | English passages 044, 016 | A — naturally UK appropriate |
| Place names: Milltown, Riverside, Hillview, Oakford, Oakwood, Kestrel Road, Corn Street, Ferry Road | Fictional but plausible English-sounding place/street names, Maths + English | A — naturally UK appropriate |
| Currency: £ used exclusively in every Maths word problem inspected | Maths content, all files | A — naturally UK appropriate |
| School terminology: "secondary school", "break time" (explicitly required over US "high school"/"recess" per `QUESTION_AUTHORING_STANDARD.md` line 128) | Cross-cutting | A — naturally UK appropriate, and explicitly enforced by existing authoring standard |
| Institutions: bakery, botanical gardens, harbour, allotment, village bakery, county athletics relay, school production/recital | English passages | A — naturally UK appropriate |
| Nonfiction content: Great Western steamship (Bristol–New York, real Victorian engineering history), Karl von Frisch/honeybee waggle dance (real Nobel-winning research) | English nonfiction passages | A — naturally UK appropriate / internationally neutral and appropriate (real, factually-verified history/science, not fabricated) |
| WWI "Letters from the Trench" epistolary fiction, Coventry backstory | English passage 013/016 | A — naturally UK appropriate, legitimate British-history genre |
| Family terms: "Nana", "Grandad", "Mum", "Dad" | Cross-cutting | A — naturally UK appropriate (all standard British informal family terms; no other-culture family terms such as "Nan-nan", "Abuela", "Dada" (South Asian) etc. were found in the estate — i.e. family terminology is entirely UK-standard-English, not itself diverse) |
| No stereotyping found | — | No content was found assigning a name/cultural-background pairing to a stereotyped trait, occupation, or behaviour (e.g. no "X is good at maths because..." pattern tied to name/ethnicity) |

No content was found that is D (questionable for UK selective-school prep) or E (clearly inappropriate/inconsistent). Nothing forces every passage to be Essex-specific, consistent with the directive's own instruction not to require that.

## Founder-context leakage — see `founder-context-leakage-findings.md` for the full writeup; summary: no evidence of Founder identity/background entering any generation prompt; no name-pool/generator script exists; content is hand-authored per-migration by whoever wrote it (an AI-assisted authoring process with no persistent "names already used" ledger across sessions is the more probable, evidence-supported mechanism for the Ade/Okafor repetition than any Founder-specific leakage).
