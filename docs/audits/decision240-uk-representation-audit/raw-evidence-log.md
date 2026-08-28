# DECISION 240 — Raw Evidence Log (reproducibility record)

Read-only audit, run against a working tree at the repository's `main` branch. No migration, content, or educational data was mutated. All commands below can be re-run to reproduce the underlying data; only NEW files were written (this directory).

## Extraction pipeline (run in order)

```
node docs/audits/decision240-uk-representation-audit/_extract.mjs
  -> Files with $json$ blocks: 35
  -> Total $json$ blocks parsed: 469
  -> Blocks that failed JSON.parse: 0
  -> Written: docs/audits/decision240-uk-representation-audit/_raw-json-corpus.json

node docs/audits/decision240-uk-representation-audit/_digest.mjs
  -> Total unique passages: 38
  -> Total question/answer/hint/other text entries: 1375
  -> Digest size: 274022 chars
  -> Written: docs/audits/decision240-uk-representation-audit/_text-digest.md

node docs/audits/decision240-uk-representation-audit/_name_candidates.mjs
  -> Distinct candidate tokens (title/narrative-verb/possessive heuristic): 65
  -> Written: docs/audits/decision240-uk-representation-audit/_name-candidates.json

node docs/audits/decision240-uk-representation-audit/_name_candidates_pass2.mjs
  -> Distinct pass-2 candidate tokens (all capitalized words in question/answer fields): 151
  -> Written: docs/audits/decision240-uk-representation-audit/_name-candidates-pass2.json

node docs/audits/decision240-uk-representation-audit/_merge_names.mjs
  -> Total distinct confirmed character names: 56
  -> Names appearing in 2+ separate migration files: 25
  -> Written: docs/audits/decision240-uk-representation-audit/_merged-name-table.json
```

## Discovery greps

```
grep -l "passageText|modelAnswer" supabase/migrations/*.sql   -> 17 files
grep -l "\$json\$" supabase/migrations/*.sql                   -> 35 files
grep -il "names\s*=|nameList|namePool|character.*name|generate.*prompt|authoring.*prompt" scripts/*
  -> scripts/generate-007t-english-rc10.mjs, scripts/generate-english-wave1.mjs (both hand-authored content, no name-pool logic)
grep -il "divers|represent|cultural|ethnic|name.*variety|Yoruba|Nigerian|African" docs/**/*.md
  -> 19 files, only QUESTION_AUTHORING_STANDARD.md line 38 (cultural neutrality) directly relevant; rest false-positive on "represent(ed)"
find . -iname "QUESTION_AUTHORING_STANDARD*"  -> ./QUESTION_AUTHORING_STANDARD.md
```

## Files confirmed to contain NO detected named human character (candidate-extraction found zero hits)

```
023_mathematics_learn_arithmetic_content.sql
025_mathematics_independent_check_retry_item.sql
029_mathematics_percentages_lesson_content.sql
030_mr06_precision_pilot_and_content_lifecycle_fields.sql
098_mock_writing_content_foundation.sql
153_english_content_foundation_increment001_writing.sql
```

## Manually read in full for direct source verification (not just regex-matched)

- Migration 044 (all 6 passage openings) — English Wave 1
- Migration 049 (all 8 passage openings) — English Wave 2
- Migration 063 (all 5 passage openings) — QT-MR01/QT-RC10 batch
- Migration 097 (passage opening) — Mock English Passage Content Foundation
- Migration 152 (passage titles + Karl von Frisch context) — English Content Foundation Increment 001
- Migration 161/163 (already fully read in this session prior to this audit, from Decisions 237-239)
- Context samples for all ambiguous/borderline candidate tokens (Baker, Ellis, War, Ashford, Western, Coal, Juice, Rice, Whatever, I've, School, Ocean, Sailors, Earth, Grandad, Mum, Dad, Dara, Cara, Mia, Ava, Dan, Thomas, Karl, Bennett, Milltown, Riverside, Hillview, Oakford, Oakwood, Coventry, Kestrel)

## Tooling files retained in this directory (reproducibility artifacts, read-only research code, not educational content)

- `_extract.mjs`, `_digest.mjs`, `_name_candidates.mjs`, `_name_candidates_pass2.mjs`, `_merge_names.mjs` — the extraction/analysis scripts themselves
- `_raw-json-corpus.json`, `_text-digest.md`, `_name-candidates.json`, `_name-candidates-pass2.json`, `_merged-name-table.json` — intermediate data products
- `character-name-inventory.md`, `cultural-distribution-analysis.md`, `founder-context-leakage-findings.md`, `raw-evidence-log.md` (this file) — the audit's readable findings

## Limitations explicitly acknowledged

1. **No NER/NLP library is available in this environment.** Name detection used two complementary regex heuristics (title-prefix, narrative-verb/possessive-suffix patterns; broad capitalized-word scan on question/answer fields) cross-checked by manual reading of every resulting candidate's source context. This is not a formal named-entity-recognition pass and may have missed names that appear in neither pattern (e.g. a name used only as a direct object with no possessive or narrative-verb marker, and only within a field this script did not scan, such as an `explanation` SQL parameter sitting outside the JSON blob).
2. **Mock Mathematics structural-capacity batches (migrations 088, 091, 095, 109, 113, 119, 122, 125, 131, 134, 137, 140 — roughly 200+ additional `$json$` blocks) were scanned by the same automated heuristics but not individually re-read block-by-block in full** the way the English passages and the smaller Maths algebra batch were. The automated scan found zero human-name candidates in these files; this is reported as the scan result, not independently hand-verified for every block.
3. **`explanation` text is a separate SQL string parameter in most migrations, not inside the parsed JSON `prompt` blob**, so it was not included in this text corpus. It is possible (not confirmed) that a small number of additional names appear only in explanation text.
4. **Cultural-association classifications are analytical signals, explicitly not claims of fictional-character ethnicity**, and were made by the auditing model's own general onomastic knowledge, not a verified external database — several names (e.g. "Mira", "Nia", "Dara") are genuinely used across multiple, unrelated cultural traditions and were deliberately left in the "ambiguous/cross-cultural" bucket rather than force-classified.
5. **This audit covers the migrations directory only** (the database-truth content layer). It did not separately re-audit `app/`, `lib/`, or any UI-layer copy for character names, per the directive's own scope (Section 3 lists specific content categories; general application UI strings were treated as out of scope, consistent with "documentation examples unrelated to educational content" being excluded).
