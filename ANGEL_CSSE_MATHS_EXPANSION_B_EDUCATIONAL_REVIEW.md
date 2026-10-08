# CSSE Maths candidates, expansion B (144 pending): educational review summary

Prepared for Founder review. **Nothing has been submitted, approved or published.** Covers the 48 data-handling candidates (tables and bar charts) and the 96 breadth candidates (precision, measurement, time, rules, averages, missing numbers). Numbers are computed from the real blueprints; 'structural difference' and 'transfer value' are my judgements for you to confirm or reject.

Questions to ask of each blueprint: (1) is the demand different from what the child already meets; (2) would an 11+ child recognise it as exam-style; (3) is the working correct and teachable; (4) is repetition acceptable.

## At a glance

| Blueprint | Competency | Family | Prepared | Difficulty mix | Representation | Repetition (distinct texts incl. stimulus) |
|---|---|---|---|---|---|---|
| mr01-bp-table-read-and-combine | MR-01 | mr01-data-table | 12 | medium 7, easy 5 | table | LOW (4000 distinct / 4000) |
| mr01-bp-table-compare-column-totals | MR-01 | mr01-data-table | 12 | medium 4, hard 8 | table | LOW (4000 distinct / 4000) |
| mr01-bp-bar-chart-read-difference | MR-01 | mr01-data-table | 12 | medium 5, hard 7 | bar_chart | LOW (4000 distinct / 4000) |
| mr01-bp-bar-chart-mean | MR-01 | mr01-data-table | 12 | hard 12 | bar_chart | LOW (3998 distinct / 4000) |
| mr01-bp-think-of-a-number-two-step | MR-01 | mr01-missing-operand | 8 | medium 4, hard 4 | prose | LOW (3845 distinct / 4000) |
| mr01-bp-consecutive-numbers-from-sum | MR-01 | mr01-missing-operand | 8 | medium 4, hard 4 | prose | MODERATE (1001 distinct / 4000) |
| mr06-bp-round-decimal-places | MR-06 | precision-dec | 8 | medium 3, easy 3, hard 2 | prose | LOW (3945 distinct / 4000) |
| mr06-bp-round-nearest-in-context | MR-06 | precision-dec | 8 | hard 3, easy 3, medium 2 | prose | LOW (3821 distinct / 4000) |
| mr01-bp-compare-different-units | MR-01 | mr01-measurement-conversion | 8 | hard 4, medium 4 | prose | LOW (3704 distinct / 4000) |
| mr01-bp-convert-then-divide | MR-01 | mr01-measurement-conversion | 8 | hard 4, medium 4 | prose | MODERATE (1660 distinct / 4000) |
| mr04-bp-timetable-journey-time | MR-04 | mr04-elapsed-time | 8 | hard 4, medium 4 | table | LOW (4000 distinct / 4000) |
| mr04-bp-timetable-wait-for-next | MR-04 | mr04-elapsed-time | 8 | hard 4, medium 4 | table | LOW (4000 distinct / 4000) |
| mr02-bp-function-table-rule | MR-02 | mr02-sequence-rule | 8 | medium 4, hard 4 | table | MODERATE (2463 distinct / 4000) |
| mr02-bp-function-table-reverse | MR-02 | mr02-sequence-rule | 8 | medium 4, hard 4 | table | MODERATE (2463 distinct / 4000) |
| mr01-bp-mean-from-table | MR-01 | mr01-average-mean | 8 | hard 4, medium 4 | table | LOW (4000 distinct / 4000) |
| mr01-bp-mean-missing-value-table | MR-01 | mr01-average-mean | 8 | hard 8 | table | LOW (4000 distinct / 4000) |

## Cross-cutting points

- **Every family gets two structurally different blueprints.** The diversity gate rates a single-blueprint batch CRITICAL, so no family is fed from one structure. At two blueprints the gate still rates a family batch HIGH (its own rule: depth of 2 or fewer). That is a reason to keep these volumes small (8 per breadth blueprint, 12 per data-handling blueprint) and to add a third structure per family before scaling, not a reason to hide it.
- **Difficulty is mostly medium and hard** (breadth set: medium 41, hard 49, easy 6). Easy items for these competencies already exist in the bank or are not the gap; the easy tier is thin here.
- **Representation:** 10 of the 16 blueprints carry a table or bar chart that the question needs; the other 6 are prose by nature (rounding, missing numbers, unit conversion).
- **Not Mock:** every blueprint is `mockEligible: false`.
- **Volume if everything is approved:** 901 + 140 (context set) + 144 (this set) = 1,185 practice-eligible. That is short of the 1,200 milestone and is a direction, not a target to hit by adding permutations.

## Blueprint detail

### mr01-bp-table-read-and-combine

- **Competency / family / skill:** MR-01 / `mr01-data-table` / QT-MR-09
- **Purpose:** Find the right two rows in a table and add their values, ignoring the other rows.
- **Misconception targeted:** adding every value in the table, or the wrong two rows, instead of only the rows the question names
- **Example question:** The table shows the kilograms of each fruit sold at a market stall. How many kilograms of Grapes and Apples were sold altogether?
- **Stimulus shown with it:** table {"headers":["Fruit","Kilograms sold"],"rows":[["Apples","95"],["Pears","82"],["Plums","46"],["Cherries","44"],["Grapes","91"]]}
- **Answer and derivation:** answer **186**. Read the two rows needed: Grapes = 91 and Apples = 95. Add them: 91 + 95 = 186.  _(deterministic; re-derived in tests by an independent method from the text/stimulus the child sees.)_
- **Structural difference from existing material:** Existing data items list values in a sentence ('Amy: 7, Ben: 4 ...'). Here the data is only in a table and the child must pick the two rows named. Reading a table is the skill; the arithmetic is deliberately easy.
- **Context variation:** 3 context tag(s) in the prepared set: data_fruit_stall, data_library_loans, data_sports_choice
- **Difficulty (of 12 prepared):** medium 7, easy 5. Basis: sum_magnitude, selective_reading.
- **Transfer value:** Medium. Table reading is a standard exam skill that could not be practised at all before.
- **Repetition risk:** Three situations; five distinct values per table so the space is large.

### mr01-bp-table-compare-column-totals

- **Competency / family / skill:** MR-01 / `mr01-data-table` / QT-MR-09
- **Purpose:** Total two columns of a table and find how much greater one total is -- a multi-step read across the whole table.
- **Misconception targeted:** comparing only one row (or one pair of rows) instead of totalling each whole column before subtracting
- **Example question:** The table shows the number of pupils attending four sports at a club in each of two weeks. How many more pupils attended in Week 2 than in Week 1 altogether?
- **Stimulus shown with it:** table {"headers":["Sport","Week 1","Week 2"],"rows":[["Football","35","26"],["Swimming","37","41"],["Tennis","43","11"],["Cricket","14","58"]]}
- **Answer and derivation:** answer **7**. Week 1 total: 35 + 37 + 43 + 14 = 129. Week 2 total: 26 + 41 + 11 + 58 = 136. Difference: 136 − 129 = 7.  _(deterministic; re-derived in tests by an independent method from the text/stimulus the child sees.)_
- **Structural difference from existing material:** A two-column table where the child totals each column and subtracts. Adds multi-step reading across the whole table, not two cells.
- **Context variation:** 3 context tag(s) in the prepared set: data_sports_choice_two_weeks, data_fruit_stall_two_weeks, data_library_loans_two_weeks
- **Difficulty (of 12 prepared):** medium 4, hard 8. Basis: two_column_totals, difference_of_totals.
- **Transfer value:** Medium-high. Comparing weeks or periods is the typical data question.
- **Repetition risk:** Three situations; eight values constrained so the difference is 5 to 60.

### mr01-bp-bar-chart-read-difference

- **Competency / family / skill:** MR-01 / `mr01-data-table` / QT-MR-09
- **Purpose:** Read two bar heights from a scale (including bars that end between gridlines) and find how many more one is than the other.
- **Misconception targeted:** reading the vertical scale as going up in ones, or reading a bar that ends between gridlines as the lower gridline
- **Example question:** The bar chart shows the number of pupils attending each sport at a club. How many more pupils attended Football than Tennis? Read the values carefully from the scale.
- **Stimulus shown with it:** bar chart {"categories":["Football","Swimming","Tennis","Cricket","Gymnastics"],"values":[8,12,4,10,6],"scaleStep":2}
- **Answer and derivation:** answer **4**. Check the scale first: the gridlines go up in steps of 2. Football = 8 and Tennis = 4. Difference: 8 − 4 = 4.  _(deterministic; re-derived in tests by an independent method from the text/stimulus the child sees.)_
- **Structural difference from existing material:** A bar chart with a scale that varies (steps of 2, 4, 5, 10, 20) and bars that often end between gridlines. The skill is reading the scale, which prose cannot test.
- **Context variation:** 3 context tag(s) in the prepared set: data_sports_choice_bar_chart, data_library_loans_bar_chart, data_fruit_stall_bar_chart
- **Difficulty (of 12 prepared):** medium 5, hard 7. Basis: scale_reading, between_gridline_values.
- **Transfer value:** High. Scale reading is the most common chart error. In tests, over 40% of items have a between-gridline bar and over 20% would be answered wrongly by reading the lower gridline.
- **Repetition risk:** Five scales x three situations x bar heights: large space.

### mr01-bp-bar-chart-mean

- **Competency / family / skill:** MR-01 / `mr01-data-table` / QT-MR-09
- **Purpose:** Read all five bars from a scale, total them and divide by the number of bars to find the mean -- averages applied to a chart, not a list.
- **Misconception targeted:** dividing the total by the largest bar, or by the scale step, instead of by the number of bars
- **Example question:** The bar chart shows the number of books borrowed from a school library each day. What is the mean number of books borrowed per day? Read the values carefully from the scale.
- **Stimulus shown with it:** bar chart {"categories":["Monday","Tuesday","Wednesday","Thursday","Friday"],"values":[200,200,90,180,80],"scaleStep":20}
- **Answer and derivation:** answer **150**. Check the scale first: the gridlines go up in steps of 20. Read all five bars: 200, 200, 90, 180, 80. Their total is 750. Mean = 750 ÷ 5 = 150.  _(deterministic; re-derived in tests by an independent method from the text/stimulus the child sees.)_
- **Structural difference from existing material:** Read five bars, total, divide by five. Connects averages to a chart (existing mean items use lists).
- **Context variation:** 3 context tag(s) in the prepared set: data_library_loans_bar_chart_mean, data_fruit_stall_bar_chart_mean, data_sports_choice_bar_chart_mean
- **Difficulty (of 12 prepared):** hard 12. Basis: read_five_values, total_then_divide.
- **Transfer value:** High for Final preparation; hard by design.
- **Repetition risk:** Same space as the difference chart; every item is hard.

### mr01-bp-think-of-a-number-two-step

- **Competency / family / skill:** MR-01 / `mr01-missing-operand` / QT-MR-02
- **Purpose:** Undo a two-step process: reverse the LAST operation first, then the first.
- **Misconception targeted:** dividing by the multiplier before removing the added (or subtracted) amount, undoing the steps in the order they were done
- **Example question:** Priya picks a number, multiplies it by 9, then adds 27. She gets 54. What was her number?
- **Answer and derivation:** answer **3**. Work backwards. The last step was to add 27, so subtract 27 first: 54 − 27 = 27. The first step was to multiply by 9, so divide: 27 ÷ 9 = 3.  _(deterministic; re-derived in tests by an independent method from the text/stimulus the child sees.)_
- **Structural difference from existing material:** Undo a two-step process. Existing missing-operand items are one operation (box x 7 = 84). Reversing two steps in the right order is new.
- **Context variation:** 3 context tag(s) in the prepared set: think_of_a_number_named, think_of_a_number, number_machine
- **Difficulty (of 8 prepared):** medium 4, hard 4. Basis: operation_order_reversal.
- **Transfer value:** High. 'I think of a number' is a classic exam shape and a direct gateway to algebraic thinking.
- **Repetition risk:** Three wordings (including a machine); numbers vary widely. Mostly medium difficulty.

### mr01-bp-consecutive-numbers-from-sum

- **Competency / family / skill:** MR-01 / `mr01-missing-operand` / QT-MR-02
- **Purpose:** Use the symmetry of consecutive numbers (their mean is the middle number) to find an end number from the total.
- **Misconception targeted:** giving the total divided by the count (the middle number) as the smallest or largest, forgetting to move to the end of the run
- **Example question:** Three consecutive page numbers in a book add up to 252. What is the last of these pages?
- **Answer and derivation:** answer **85**. The middle number is the mean: 252 ÷ 3 = 84. The numbers are 83, 84, 85, so the largest is 85.  _(deterministic; re-derived in tests by an independent method from the text/stimulus the child sees.)_
- **Structural difference from existing material:** Uses the symmetry of consecutive numbers (the mean is the middle). Structurally unlike any existing missing-number item; the trap answer (total / count) is never the answer, enforced by tests.
- **Context variation:** 3 context tag(s) in the prepared set: consecutive_pages, consecutive_numbers, consecutive_house_numbers
- **Difficulty (of 8 prepared):** medium 4, hard 4. Basis: count_of_numbers.
- **Transfer value:** Medium-high. Strong reasoning item; also exercises house-number and page-number contexts.
- **Repetition risk:** Three wordings, 3 or 5 numbers, smallest or largest asked. A fairly small structure; do not scale beyond about 10.

### mr06-bp-round-decimal-places

- **Competency / family / skill:** MR-06 / `precision-dec` / QT-MR-14
- **Purpose:** Round a three-decimal-place number to 1 or 2 decimal places, including the cases that carry (…96 to …1) and exact halves.
- **Misconception targeted:** cutting the digits off (truncating) instead of rounding, or forgetting to carry when the kept digit is a 9
- **Example question:** A piece of wood is 5.527 metres long. Write its length to 2 decimal places.
- **Answer and derivation:** answer **5.53**. Look at the digit after the second decimal place: it is 7. 7 is 5 or more, so round the last kept digit UP (carry if it is a 9). 5.527 to 2 decimal places = 5.53.  _(deterministic; re-derived in tests by an independent method from the text/stimulus the child sees.)_
- **Structural difference from existing material:** Existing precision items are division to 2 d.p. This isolates the rounding decision itself, with a bias toward the instructive cases: a 5 after the cut, and a carry through a 9.
- **Context variation:** 2 context tag(s) in the prepared set: round_decimal_length, round_decimal_bare
- **Difficulty (of 8 prepared):** medium 3, easy 3, hard 2. Basis: rounding_digit_edge_cases.
- **Transfer value:** High for precision under exact-match marking. Tests verify truncating gives a wrong answer wherever rounding up is needed.
- **Repetition risk:** Large numeric space; three wordings.

### mr06-bp-round-nearest-in-context

- **Competency / family / skill:** MR-06 / `precision-dec` / QT-MR-14
- **Purpose:** Round a large whole number to the nearest 10, 100 or 1,000, including exact midpoints (which round up) and carries across a place.
- **Misconception targeted:** rounding an exact midpoint down, or rounding down whenever the next digit is not 'big enough' without checking against half the unit
- **Example question:** A football stadium had 43,500 people at a match. Round this to the nearest 1000.
- **Answer and derivation:** answer **44000**. Look at the part below 1000: 500. Half of 1000 is 500. 500 is 500 or more, so round UP to 44000.  _(deterministic; re-derived in tests by an independent method from the text/stimulus the child sees.)_
- **Structural difference from existing material:** Rounding whole numbers to the nearest 10, 100 or 1,000 in a sentence, including exact midpoints (which round up).
- **Context variation:** 3 context tag(s) in the prepared set: round_nearest_stadium, round_nearest_library, round_nearest_town
- **Difficulty (of 8 prepared):** hard 3, easy 3, medium 2. Basis: midpoint_and_carry_cases, rounding_unit.
- **Transfer value:** Medium. Foundational for estimation; exam wording is often exactly this.
- **Repetition risk:** Three situations x three units; midpoints deliberately over-represented.

### mr01-bp-compare-different-units

- **Competency / family / skill:** MR-01 / `mr01-measurement-conversion` / QT-MR-03
- **Purpose:** Convert so two quantities are in the same unit, then find the difference -- the conversion is necessary before any comparison.
- **Misconception targeted:** subtracting the two numbers as they are written, without converting to the same unit first
- **Example question:** One bag of flour is 1.8 kilograms. Another bag of flour is 1510 grams. How many grams heavier is the first bag of flour than the second?
- **Answer and derivation:** answer **290**. Change 1.8 kilograms into grams: 1.8 × 1000 = 1800 grams. Now both are in grams: 1800 − 1510 = 290.  _(deterministic; re-derived in tests by an independent method from the text/stimulus the child sees.)_
- **Structural difference from existing material:** Existing measurement items add mixed units and report in the larger unit. This asks for a difference in the smaller unit, so conversion must happen before any comparison; tests confirm subtracting the written numbers gives a different answer.
- **Context variation:** 3 context tag(s) in the prepared set: units_mass, units_length, units_capacity
- **Difficulty (of 8 prepared):** hard 4, medium 4. Basis: conversion_factor, convert_before_compare.
- **Transfer value:** High. Converting before comparing is the core measurement skill.
- **Repetition risk:** Three unit families x three items; a modest space; keep volume low.

### mr01-bp-convert-then-divide

- **Competency / family / skill:** MR-01 / `mr01-measurement-conversion` / QT-MR-03
- **Purpose:** Convert the large quantity into the small unit, then divide by the portion size to count how many portions.
- **Misconception targeted:** dividing the numbers as written (2.4 by 30) without converting, or converting the portion instead of the whole and slipping on the factor
- **Example question:** A parcel holds 2.4 kilograms. It is shared into portions of 160 grams each. How many portions are there?
- **Answer and derivation:** answer **15**. Change 2.4 kilograms into grams: 2.4 × 1000 = 2400 grams. Divide by the portion size: 2400 ÷ 160 = 15.  _(deterministic; re-derived in tests by an independent method from the text/stimulus the child sees.)_
- **Structural difference from existing material:** Convert, then divide into equal portions (how many cups from 2.4 litres). Division by a converted quantity is new here.
- **Context variation:** 3 context tag(s) in the prepared set: portions_mass, portions_length, portions_capacity
- **Difficulty (of 8 prepared):** hard 4, medium 4. Basis: conversion_factor, convert_before_divide.
- **Transfer value:** Medium-high. A very common exam shape.
- **Repetition risk:** Three unit families; constrained to exact division, so the space is smaller than it looks; keep volume low.

### mr04-bp-timetable-journey-time

- **Competency / family / skill:** MR-04 / `mr04-elapsed-time` / QT-MR-10
- **Purpose:** Read two times from a timetable and find the journey time in minutes, including journeys that cross an hour boundary.
- **Misconception targeted:** subtracting the minutes digits only, or treating the times as decimals, when the journey crosses the hour
- **Example question:** The timetable shows the time a bus is at each stop. How many minutes does the journey from Library to Park take?
- **Stimulus shown with it:** table {"headers":["Stop","Time"],"rows":[["Market Square","15:50"],["Library","16:38"],["School","16:50"],["Park","17:12"]]}
- **Answer and derivation:** answer **34**. Read the two times: Library at 16:38 and Park at 17:12. From 16:38 to 17:12 is 34 minutes (count on to the next hour, then add the rest).  _(deterministic; re-derived in tests by an independent method from the text/stimulus the child sees.)_
- **Structural difference from existing material:** Existing time items are prose ('starts at 14:00 ... lasts 45 minutes'). Here the times are in a timetable, and the journey crosses an hour boundary for roughly a third of items.
- **Context variation:** 3 context tag(s) in the prepared set: timetable_bus, timetable_coach, timetable_train
- **Difficulty (of 8 prepared):** hard 4, medium 4. Basis: crossing_the_hour, stops_between.
- **Transfer value:** High. Timetable reading is core Year 5-6 time work.
- **Repetition risk:** Three routes; start time and gaps vary widely.

### mr04-bp-timetable-wait-for-next

- **Competency / family / skill:** MR-04 / `mr04-elapsed-time` / QT-MR-10
- **Purpose:** Find the first departure AFTER a stated arrival time in a list of departures, then work out the wait in minutes.
- **Misconception targeted:** using the departure BEFORE the arrival time, or the nearest departure, instead of the next one after arriving
- **Example question:** The timetable shows when each train leaves. Sam gets to the station at 06:23. How many minutes must he wait for the next train?
- **Stimulus shown with it:** table {"headers":["Service","Leaves at"],"rows":[["Train 1","06:20"],["Train 2","07:05"],["Train 3","07:57"],["Train 4","08:15"],["Train 5","08:45"]]}
- **Answer and derivation:** answer **42**. Sam arrives at 06:23. Look for the first train AFTER that time: 07:05. Wait = 07:05 − 06:23 = 42 minutes.  _(deterministic; re-derived in tests by an independent method from the text/stimulus the child sees.)_
- **Structural difference from existing material:** A different timetable skill: find the first departure AFTER a stated time. Tests check an earlier departure exists that must not be used (the usual error).
- **Context variation:** 3 context tag(s) in the prepared set: timetable_wait_train, timetable_wait_ferry, timetable_wait_bus
- **Difficulty (of 8 prepared):** hard 4, medium 4. Basis: next_departure_after_arrival, crossing_the_hour.
- **Transfer value:** High. Closer to real life and a distinct error pattern from journey time.
- **Repetition risk:** Three services; large space.

### mr02-bp-function-table-rule

- **Competency / family / skill:** MR-02 / `mr02-sequence-rule` / QT-MR-05
- **Purpose:** Work out the rule 'multiply by a then add b' from the first rows of an input-output table, then use it on an input far beyond the table.
- **Misconception targeted:** using only the 'adds a each time' pattern (a counting-on rule) and multiplying the input by the step without the starting offset
- **Example question:** The table shows how the numbers are linked. What is the output when the input is 16?
- **Stimulus shown with it:** table {"headers":["Input","Output"],"rows":[["1","10"],["2","14"],["3","18"],["4","22"]]}
- **Answer and derivation:** answer **70**. Look at how the second column changes: it goes up by 4 each time, so the rule starts with × 4. Check the first row: 4 × 1 = 4, and the table shows 10, so the rule also adds 6. Rule: × 4 then + 6. For 16: 4 × 16 + 6 = 70.  _(deterministic; re-derived in tests by an independent method from the text/stimulus the child sees.)_
- **Structural difference from existing material:** Infer 'multiply then add' from the first rows of an input-output table and apply it far beyond the table. Existing sequence items give a list or a rule in words.
- **Context variation:** 3 context tag(s) in the prepared set: function_table_machine, function_table_pattern, function_table_savings
- **Difficulty (of 8 prepared):** medium 4, hard 4. Basis: rule_with_two_operations, extrapolation_distance.
- **Transfer value:** High. Function tables are the natural bridge to algebra.
- **Repetition risk:** Three captions (machine, counters, savings); a, b and the target vary independently.

### mr02-bp-function-table-reverse

- **Competency / family / skill:** MR-02 / `mr02-sequence-rule` / QT-MR-05
- **Purpose:** Work out the rule from a table, then run it backwards: given an output far beyond the table, find the input.
- **Misconception targeted:** dividing the output by the multiplier without first removing the added amount (undoing the steps in the wrong order)
- **Example question:** The table shows how the numbers are linked. A pattern has 109 counters. What is its pattern number?
- **Stimulus shown with it:** table {"headers":["Pattern number","Counters"],"rows":[["1","9"],["2","14"],["3","19"],["4","24"]]}
- **Answer and derivation:** answer **21**. From the table the rule is × 5 then + 4 (the second column goes up by 5, and the first row is 5 + 4). Work backwards from 109: first subtract 4 to get 105, then divide by 5 to get 21.  _(deterministic; re-derived in tests by an independent method from the text/stimulus the child sees.)_
- **Structural difference from existing material:** Same table, run backwards from an output. The trap (dividing by the multiplier before removing the added amount) is the target misconception.
- **Context variation:** 3 context tag(s) in the prepared set: function_table_pattern_reverse, function_table_savings_reverse, function_table_machine_reverse
- **Difficulty (of 8 prepared):** medium 4, hard 4. Basis: rule_reversal, extrapolation_distance.
- **Transfer value:** High. Reversing a rule is harder than applying it; strong mastery check.
- **Repetition risk:** Same space as the forward version; use with it, not instead of it.

### mr01-bp-mean-from-table

- **Competency / family / skill:** MR-01 / `mr01-average-mean` / QT-MR-12
- **Purpose:** Read five values from a table, total them and divide by five to find the mean (a whole number).
- **Misconception targeted:** dividing the total by the largest value, or by the number of columns in the table instead of the number of values
- **Example question:** The table shows spelling test scores. What is the mean score?
- **Stimulus shown with it:** table {"headers":["Pupil","Score"],"rows":[["Asha","37"],["Ben","14"],["Chloe","45"],["Dev","56"],["Ella","8"]]}
- **Answer and derivation:** answer **32**. Total of the five values: 37 + 14 + 45 + 56 + 8 = 160. Mean = 160 ÷ 5 = 32.  _(deterministic; re-derived in tests by an independent method from the text/stimulus the child sees.)_
- **Structural difference from existing material:** Mean from a table of five named values (existing mean items give lists inside a sentence).
- **Context variation:** 3 context tag(s) in the prepared set: mean_table_scores, mean_table_rainfall, mean_table_distance
- **Difficulty (of 8 prepared):** hard 4, medium 4. Basis: spread_of_values.
- **Transfer value:** Medium. Same mean, now from a table.
- **Repetition risk:** Three captions; five values with a divisible total.

### mr01-bp-mean-missing-value-table

- **Competency / family / skill:** MR-01 / `mr01-average-mean` / QT-MR-12
- **Purpose:** Use a stated mean to find a missing value in a table: total needed = mean × 5, minus the values already known.
- **Misconception targeted:** treating the stated mean as the missing value, or subtracting the known values from the mean instead of from the total
- **Example question:** The table shows distance cycled each day, but the last value is missing. The mean of all five values is 27. What is the missing value?
- **Stimulus shown with it:** table {"headers":["Day","Distance (km)"],"rows":[["Saturday","10"],["Sunday","5"],["Monday","5"],["Tuesday","40"],["Wednesday","?"]]}
- **Answer and derivation:** answer **75**. Total for five values = mean × 5 = 27 × 5 = 135. Known four add to 60, so the missing value is 135 − 60 = 75.  _(deterministic; re-derived in tests by an independent method from the text/stimulus the child sees.)_
- **Structural difference from existing material:** Reverse mean in a table: total needed = mean x 5, minus the known values. A reverse-mean family already exists (prose); this adds the table form with the unknown shown as '?'.
- **Context variation:** 3 context tag(s) in the prepared set: mean_table_distance_missing, mean_table_scores_missing, mean_table_rainfall_missing
- **Difficulty (of 8 prepared):** hard 8. Basis: reverse_mean, table_reading.
- **Transfer value:** High for Final preparation; a classic hard exam item.
- **Repetition risk:** Three captions; four values and the mean vary; every item is hard.
