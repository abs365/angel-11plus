# CSSE MATHEMATICAL REPRESENTATION GAP (2026-10-08)

Question asked: "No table or chart renderer exists in Practice" is not an acceptable end state. What exists, can it be reused, and what is the smallest extension?
Method: code inspection (`components/`, `lib/mockAttempt/`, `types/`) and live read-only bank queries. Nothing was rebuilt.

## 1. Inventory: what Angel 11+ already has

| Capability | Where | Used by | Reusable? |
|---|---|---|---|
| **Structured stimulus on a question** (`prompt.stimulus`, a discriminated union) | `lib/mockAttempt/types.ts` (`MockStimulus`) + fail-closed validators in `lib/mockAttempt/workspace.ts` | Mock | **Yes, this is the shared architecture** |
| **Data table** | `components/mockAttempt/DataTableStimulus.tsx`, validator `isValidTableStimulus` | Mock (QT-MR-09 6 items, QT-MR-10 4, QT-MR-13 3) and the admin review page | Yes. Was **not** rendered in Practice |
| **Image stimulus** | `components/mockAttempt/ImageStimulus.tsx`, `isValidImageStimulus` | Mock Writing; Practice Writing renders its own image block | Yes |
| **Compound-shape diagram** (rectilinear SVG from coordinates, "not to scale" notice) | `components/practice/CompoundShapeDiagram.tsx` (+ `Group`), `MathsQuestion.diagram/diagrams` | Practice and the compound-shapes lesson: **47 of 90** practice QT-MR-07 items carry a diagram | Yes, for rectilinear shapes only |
| Group shared stem for subparts | `resolveGroupSharedStem` (`workspace.ts`) | Mock grouped questions | Yes |
| Coordinate grid / angle figure / number line / bar model / clock face / ruler | **none** | | |
| Charts of any kind | **none before this increment** | | |

Conclusion: no second system is needed. The governed `stimulus` union plus one renderer per kind **is** the architecture. Gaps are renderer kinds and content, not plumbing.

## 2. Gap by Maths competency

| Competency (question type) | Representation that is educationally necessary | Supported? | Reusable renderer | Content available (practice) | Educational gap |
|---|---|---|---|---|---|
| MR-01 data handling (QT-MR-09) | table, bar chart | Table: Mock only. Chart: none | Table renderer existed; **bar chart now built** | 6 prose items; **48 table/chart candidates prepared** | The skill of reading a table or chart could not be practised at all in Practice: **closed by this increment (pending publication)** |
| MR-01 averages (QT-MR-12) | table / chart of values | Now possible | table + bar chart | 63 prose items | Mean from a chart is covered by one new blueprint; mean from a table is a cheap next blueprint |
| MR-01 measurement (QT-MR-03) | ruler / scale reading, conversion tables | None | none | 5 prose items | Measurement is thin in count and has no visual; lower priority than the rows below |
| MR-02 sequences (QT-MR-05) | input-output table; matchstick / tile pattern pictures | Table now possible; pictures none | table renderer; pattern pictures need an SVG kind | 55 prose items | Input-output (n, term) tables are a cheap next blueprint; pattern pictures need a small SVG renderer |
| MR-03 geometry (QT-MR-07) | compound shapes; **angle figures**; shape classification pictures | Compound shapes **yes** (47 items). Angles: **none** | CompoundShapeDiagram (rectilinear only) | 27 angle-sum + 5 angle-ratio + 3 classify items, all prose | Angle questions ("a straight line", "around a point", "a triangle with an exterior angle") are normally a figure; a labelled angle figure is the **largest geometry gap** |
| MR-03 coordinates (QT-MR-08) | **coordinate grid** with plotted points, reflections and translations | None | none | 42 items, all prose ("Point A is at (2, 5) ...") | The skill is spatial. A grid is the **largest single representation gap**: the child never sees a plane |
| MR-04 word problems / time (QT-MR-10, 13) | timetables, price tables, clock face | Tables now possible in Practice | table renderer | 34 + 11 prose items; Mock already uses tables | Timetable and price-list blueprints reuse the table at almost no cost; a clock face is optional |
| MR-04 percentages / ratio | bar model, percentage grid | None | none | 84 prose items | Valuable in teaching; not essential for marking. Later |
| MR-05 number properties (QT-MR-11) | factor tree, number grid | None | none | 61 prose items | Teaching aid more than question stimulus; later |
| MR-06 precision (QT-MR-14) | place-value table, number line for rounding | Table possible; number line none | table renderer | 12 prose items | Number line is the natural rounding representation; thin competency overall |

## 3. Decision

1. **Reuse the existing `prompt.stimulus` architecture.** No parallel system.
2. **Built now (smallest extension that closes the largest *cheap* gap):**
   - Practice Maths now renders any valid stimulus through one shared entry point, `components/mockAttempt/StructuredStimulus.tsx` (table, bar chart, image; invalid shapes render nothing). Mock pages keep their own renderers, unchanged.
   - One new stimulus kind, `bar-chart`, added to the same union with a fail-closed validator and one SVG renderer (`BarChartStimulus.tsx`): blue bars, labelled scale, **no value labels on the bars** (reading the scale is the skill), a text equivalent for assistive technology, no gradients, readable at phone width.
   - The factory can now attach a stimulus to a candidate (`deriveStimulus`), the duplicate check treats the stimulus as part of a question's identity (otherwise identical wording over different data was wrongly rejected), and `publish_question_candidate` already copies `question_content` whole, so a stimulus reaches `prompt.stimulus` with no migration.
   - Four data-handling blueprints for `mr01-data-table` / QT-MR-09: **table read and combine; compare two column totals; bar-chart difference with scale reading (bars between gridlines, five different scales); bar-chart mean**. 48 candidates prepared, **not submitted**. The question text never restates the data, so the representation is necessary, not decoration.
3. **Next smallest extensions, in value order** (each is one renderer kind in the same union, not a new system): (a) **coordinate grid** (42 items waiting, spatial skill currently invisible); (b) **angle figure** (about 35 items); (c) **number line** (rounding, negatives, fractions); (d) bar model / pattern pictures. I recommend (a) next; I did not build it in the same increment because each kind needs its own correctness tests and visual check, and a half-tested renderer is worse than none.

## 4. Safeguards that apply to every representation

- Fail closed: an invalid stimulus renders nothing rather than a wrong picture.
- The question must not restate the data; tests assert the numbers appear only in the stimulus.
- The answer is re-derived **from the stimulus object itself** in tests, by a different route from the blueprint formula.
- Accessibility: text equivalent for charts; real `<table>` markup for tables.
- A diagram that would give away an unknown (a measurable length) must be marked "not to scale" (existing rule in `CompoundShapeDiagram`); the same rule applies to any future figure.
- Mock surfaces are unaffected; a representation in Mock is a separate, governed decision.
