// Authored educational judgements (structural difference, transfer value, repetition note) per blueprint.
// Shared by the review summaries and the approval pack. These are what the Founder is asked to confirm or reject.
export const JUDGEMENT_CONTEXT = {
  "mr05-bp-hcf-equal-groups": {
    structure: "Existing HCF items ask 'What is the HCF of a and b?' with no situation. Here the child must first recognise that 'identical groups, nothing left over, as many as possible' means HCF. The computation is the same; the recognition step is new.",
    transfer: "High. It is the standard exam form of HCF. A child who only knows the bare procedure cannot answer it unprompted.",
    risk: "Wording rotates over three situations only; the numbers are always g×m and g×n with coprime m, n, so the HCF is always the intended g (3 to 12).",
  },
  "mr05-bp-lcm-repeating-events": {
    structure: "Existing LCM items are bare 'LCM of a and b'. Here the situation (two repeating events) must be read as 'next time they coincide'. Pairs are chosen so neither interval divides the other, so the answer is never just the larger number.",
    transfer: "High. Recognising 'next time together' as LCM is the usual exam context.",
    risk: "Three situations only. Small number range (3 to 20) means a modest set of distinct pairs.",
  },
  "mr05-bp-smallest-common-multiple-above": {
    structure: "Adds a boundary condition on top of LCM: the answer is the first common multiple above k, so stopping at the LCM is wrong (enforced: k is at least the LCM).",
    transfer: "Medium-high. Teaches that a common multiple is a family of numbers, not one value.",
    risk: "One wording only (no context rotation); variation comes from a, b and k alone.",
  },
  "mr05-bp-identify-the-prime": {
    structure: "Existing prime items are True/False on one number. Here the child must test four numbers and select the single prime; the three composites are drawn from a pool of look-alike primes (51, 57, 91, 119 ...), and the prime's position varies.",
    transfer: "Medium. Builds the habit of testing for factors rather than recognising 'prime-looking' numbers.",
    risk: "Composites come from a fixed pool of 18 numbers and primes from 15, so the space is large (combinations) but the vocabulary of numbers is small; a determined learner could memorise the pool over many sessions.",
  },
  "mr02-bp-pattern-in-context": {
    structure: "Existing nth-term items present the sequence as a list of terms. Here a physical pattern (matchsticks, tiles, chairs) grows, and the child must see that pattern 1 already exists, so n-1 steps are added.",
    transfer: "Medium. The same rule in a concrete setting; an on-ramp from physical patterns to the abstract rule. Structurally close to the direct nth-term blueprint, so its main value is context, not a new demand.",
    risk: "Closest to existing material of the ten; context-only variation. Reviewer may judge it adds limited structural depth.",
  },
  "mr02-bp-first-term-exceeding": {
    structure: "A threshold question: 'first term greater than t'. Existing blueprints find term n, find n, or test membership; none asks for the first term past a boundary. The target is never itself a term.",
    transfer: "Medium-high. Connects sequences to inequalities and to 'when does it first exceed'.",
    risk: "One wording; variation from a, d, t alone. Difficulty skews hard (distance to target is often large).",
  },
  "mr02-bp-whole-periods-to-target": {
    structure: "Whole periods to reach a target where the division is not exact and the answer must round UP. Existing sequence items never involve rounding.",
    transfer: "High. Savings/reading/growth targets are classic exam word problems; rounding up is a well-documented error.",
    risk: "Three situations. The 'pages read' wording reuses the page total as both the book length and the target, so check the sentence reads naturally.",
  },
  "mr01-bp-containers-needed": {
    structure: "Division followed by interpreting the remainder (a part-filled container is still needed). Existing division blueprints report the remainder or the exact quotient; none asks what the remainder means in a situation.",
    transfer: "High. 'How many buses are needed' is the standard remainder-interpretation question.",
    risk: "Three situations; numbers 40 to 400 and container sizes 6 to 24.",
  },
  "mr01-bp-change-from-note": {
    structure: "Multiply to find a total, then subtract it from the note. A two-step order set by the situation; existing arithmetic blueprints are single-operation or add-then-multiply on bare numbers.",
    transfer: "Medium. Foundation-level money context; useful for Year 4/5 learners and as a quick confidence builder.",
    risk: "Easiest of the ten and the smallest parameter space (two note values); four buyer/item rotations.",
  },
  "mr01-bp-spend-then-share": {
    structure: "Subtract what was spent, then share the remainder equally. The order matters: dividing the whole amount first is the target misconception. Existing blueprints do not chain subtract then divide in a situation.",
    transfer: "Medium-high. Multi-step money/sharing is a common exam shape.",
    risk: "Three situations. The amounts are constrained to divide exactly, so only some (total, spend, k) combinations qualify.",
  },
};

export const JUDGEMENT_B = {
  "mr01-bp-table-read-and-combine": { s: "Existing data items list values in a sentence ('Amy: 7, Ben: 4 ...'). Here the data is only in a table and the child must pick the two rows named. Reading a table is the skill; the arithmetic is deliberately easy.", t: "Medium. Table reading is a standard exam skill that could not be practised at all before.", r: "Three situations; five distinct values per table so the space is large." },
  "mr01-bp-table-compare-column-totals": { s: "A two-column table where the child totals each column and subtracts. Adds multi-step reading across the whole table, not two cells.", t: "Medium-high. Comparing weeks or periods is the typical data question.", r: "Three situations; eight values constrained so the difference is 5 to 60." },
  "mr01-bp-bar-chart-read-difference": { s: "A bar chart with a scale that varies (steps of 2, 4, 5, 10, 20) and bars that often end between gridlines. The skill is reading the scale, which prose cannot test.", t: "High. Scale reading is the most common chart error. In tests, over 40% of items have a between-gridline bar and over 20% would be answered wrongly by reading the lower gridline.", r: "Five scales x three situations x bar heights: large space." },
  "mr01-bp-bar-chart-mean": { s: "Read five bars, total, divide by five. Connects averages to a chart (existing mean items use lists).", t: "High for Final preparation; hard by design.", r: "Same space as the difference chart; every item is hard." },
  "mr01-bp-think-of-a-number-two-step": { s: "Undo a two-step process. Existing missing-operand items are one operation (box x 7 = 84). Reversing two steps in the right order is new.", t: "High. 'I think of a number' is a classic exam shape and a direct gateway to algebraic thinking.", r: "Three wordings (including a machine); numbers vary widely. Mostly medium difficulty." },
  "mr01-bp-consecutive-numbers-from-sum": { s: "Uses the symmetry of consecutive numbers (the mean is the middle). Structurally unlike any existing missing-number item; the trap answer (total / count) is never the answer, enforced by tests.", t: "Medium-high. Strong reasoning item; also exercises house-number and page-number contexts.", r: "Three wordings, 3 or 5 numbers, smallest or largest asked. A fairly small structure; do not scale beyond about 10." },
  "mr06-bp-round-decimal-places": { s: "Existing precision items are division to 2 d.p. This isolates the rounding decision itself, with a bias toward the instructive cases: a 5 after the cut, and a carry through a 9.", t: "High for precision under exact-match marking. Tests verify truncating gives a wrong answer wherever rounding up is needed.", r: "Large numeric space; three wordings." },
  "mr06-bp-round-nearest-in-context": { s: "Rounding whole numbers to the nearest 10, 100 or 1,000 in a sentence, including exact midpoints (which round up).", t: "Medium. Foundational for estimation; exam wording is often exactly this.", r: "Three situations x three units; midpoints deliberately over-represented." },
  "mr01-bp-compare-different-units": { s: "Existing measurement items add mixed units and report in the larger unit. This asks for a difference in the smaller unit, so conversion must happen before any comparison; tests confirm subtracting the written numbers gives a different answer.", t: "High. Converting before comparing is the core measurement skill.", r: "Three unit families x three items; a modest space; keep volume low." },
  "mr01-bp-convert-then-divide": { s: "Convert, then divide into equal portions (how many cups from 2.4 litres). Division by a converted quantity is new here.", t: "Medium-high. A very common exam shape.", r: "Three unit families; constrained to exact division, so the space is smaller than it looks; keep volume low." },
  "mr04-bp-timetable-journey-time": { s: "Existing time items are prose ('starts at 14:00 ... lasts 45 minutes'). Here the times are in a timetable, and the journey crosses an hour boundary for roughly a third of items.", t: "High. Timetable reading is core Year 5-6 time work.", r: "Three routes; start time and gaps vary widely." },
  "mr04-bp-timetable-wait-for-next": { s: "A different timetable skill: find the first departure AFTER a stated time. Tests check an earlier departure exists that must not be used (the usual error).", t: "High. Closer to real life and a distinct error pattern from journey time.", r: "Three services; large space." },
  "mr02-bp-function-table-rule": { s: "Infer 'multiply then add' from the first rows of an input-output table and apply it far beyond the table. Existing sequence items give a list or a rule in words.", t: "High. Function tables are the natural bridge to algebra.", r: "Three captions (machine, counters, savings); a, b and the target vary independently." },
  "mr02-bp-function-table-reverse": { s: "Same table, run backwards from an output. The trap (dividing by the multiplier before removing the added amount) is the target misconception.", t: "High. Reversing a rule is harder than applying it; strong mastery check.", r: "Same space as the forward version; use with it, not instead of it." },
  "mr01-bp-mean-from-table": { s: "Mean from a table of five named values (existing mean items give lists inside a sentence).", t: "Medium. Same mean, now from a table.", r: "Three captions; five values with a divisible total." },
  "mr01-bp-mean-missing-value-table": { s: "Reverse mean in a table: total needed = mean x 5, minus the known values. A reverse-mean family already exists (prose); this adds the table form with the unknown shown as '?'.", t: "High for Final preparation; a classic hard exam item.", r: "Three captions; four values and the mean vary; every item is hard." },
};


export const JUDGEMENT_GRID = {
  "mr03-bp-grid-read-point": { s: "Existing coordinate items are prose; the child never sees a plane. Here the point is only on the grid, so reading the position (x first, then y, with negatives) is the skill. No point has x equal to y, so a swapped answer is always detectable.", t: "High. Reading a plotted position is the foundation of every coordinate question.", r: "Large space: three points, target and grid size all vary." },
  "mr03-bp-grid-reflect-in-mirror-line": { s: "Reflection in a DRAWN mirror line (x-axis, y-axis or the line y = x). Existing items name the axis in words. The line y = x is the hard case: coordinates swap rather than change sign. |x| differs from |y| so the tempting wrong answers are all different from the right one.", t: "High. Reflection is a core transformation and the y = x case is a common exam stretch.", r: "Large space; three mirror lines." },
  "mr03-bp-grid-translate-point": { s: "Read a drawn point, apply a described movement that may cross an axis, give the new coordinates. Existing translation items give the start in the text; here the start must be read from the grid.", t: "High. Translation with a read start combines two skills in one step.", r: "Large space; movement and start vary independently." },
  "mr03-bp-grid-fourth-vertex": { s: "Complete a drawn rectangle or slanted parallelogram from three corners, using the shape's properties. Different from every existing coordinate item. Tests confirm a 'parallelogram' question is never secretly a rectangle.", t: "High. Classic exam shape; builds on both coordinates and properties of quadrilaterals.", r: "Large space; the shape and its corners vary." },
  "mr03-bp-grid-midpoint-of-segment": { s: "Midpoint of a drawn segment with ends read from the grid. The segment is neither horizontal nor vertical, so both coordinates need working out.", t: "Medium-high. A standard coordinate skill, now with the ends read rather than given.", r: "Moderate space: both ends and the grid size vary, with a whole-number-midpoint constraint." },
};

export const JUDGEMENT_ANGLE = {
  "mr03-bp-fig-triangle-find-x": { s: "Existing angle-sum items are prose; here the triangle is drawn and the question carries no numbers, so the figure is necessary. x moves between the three vertices. Labelled 'not drawn accurately' so the child calculates rather than measures.", t: "High. Angle sum in a drawn triangle is the standard exam form.", r: "Large space: two angles and the position of x vary." },
  "mr03-bp-fig-straight-line-find-x": { s: "Angles on a straight line with one to three angles shown. New to the bank: no existing item uses a straight-line figure.", t: "High. A core angle fact, previously absent as a figure.", r: "Large space: number of angles, sizes and position of x vary." },
  "mr03-bp-fig-around-point-find-x": { s: "Angles around a point (360 degrees), two to four angles shown, including a reflex x. Previously absent from the bank.", t: "High. The third standard angle fact, with a reflex stretch case.", r: "Large space." },
  "mr03-bp-fig-isosceles-find-base": { s: "Isosceles triangle drawn with two equal angles both marked x. The forgot-to-halve answer is always a different number from the right one (tested).", t: "Medium-high. Combines the angle sum with equality of angles.", r: "Moderate space: one angle (even, 20-140, not 60) and its vertex." },
};
