/**
 * Governed revalidation record for the 32 existing protected Maths items proposed for Form B (read from production on
 * 2026-10-08, read-only). For each item: the stored answer, and the answer re-derived here from the question text by a
 * separately written route (`derive`). This is a pre-review record, NOT the independent human validation: nothing is marked
 * independently_validated or mock_eligible by it. The record exists so a human verifier starts from re-derived answers and a
 * short list of wording and marking observations rather than from nothing.
 */
export interface RevalidationEntry {
  id: string;
  qt: string;
  storedAnswer: string;
  derive: () => string;
  /** Marking-contract or wording observation for the human verifier, if any. */
  observation?: string;
  /** A defect that must be repaired before use (changes the stored answer or the wording). */
  defect?: { description: string; repairedAnswer?: string };
}

const n = (v: number) => String(v);
const ageYear = (pred: (p: number, t: number) => boolean) => { for (let y = 2009; y < 2200; y++) if (pred(y - 1985, y - 2009)) return n(y); return "none"; };
const hhmm = (mins: number) => `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
const T = (h: number, m: number) => h * 60 + m;
const isPrime = (x: number) => { if (x < 2) return false; for (let d = 2; d * d <= x; d++) if (x % d === 0) return false; return true; };

export const FORM_B_REVALIDATION: RevalidationEntry[] = [
  { id: "mock-mr03mr07-perimeterarea-01a", qt: "QT-MR-03", storedAnswer: "12.2", derive: () => n(2 * (3.6 + 250 / 100)) },
  { id: "mock-mr03mr07-perimeterarea-01b", qt: "QT-MR-07", storedAnswer: "9", derive: () => n(Math.round(3.6 * 2.5 * 100) / 100) },
  { id: "mock-mr03mr07-perimeterarea-02a", qt: "QT-MR-03", storedAnswer: "270", derive: () => n(2 * (90 + 450 / 10)) },
  { id: "mock-mr03mr07-perimeterarea-02b", qt: "QT-MR-07", storedAnswer: "4050", derive: () => n(90 * 45) },
  { id: "mock-mr05-numberpyramid-01", qt: "QT-MR-05", storedAnswer: "7", derive: () => {
      // solve downwards from the known top: row 1 = 72; row 2 = 36, ?; row 3 = 19, ?, 19; row 4 = 11, 8, ?, ?; row 5 = ?, 6, 2, A, 3
      const row2 = [36, 72 - 36];
      const row3 = [19, row2[0] - 19, 19];
      const row4 = [11, 8, row3[1] - 8, row3[2] - (row3[1] - 8)];
      return n(row4[2] - 2); // row 5: 2 + A = row4[2]
    }, observation: "The whole pyramid is consistent (bottom row 5, 6, 2, 7, 3)." },
  { id: "mock-mr05-numberpyramid-02", qt: "QT-MR-05", storedAnswer: "9, 5", derive: () => {
      let best: [number, number] | null = null;
      for (let rows = 1; rows <= 8; rows++) { const f = 2 ** (rows - 1); if (144 % f === 0) { const v = 144 / f; if (!best || v < best[0]) best = [v, rows]; } }
      return `${best![0]}, ${best![1]}`;
    },
    defect: { description: "The question asks for the answer \"in the form (smallest bottom-row value, number of rows)\", so a child writes \"(9, 5)\", but the stored answer is \"9, 5\" and the marker requires matching brackets, so the instructed form is marked wrong.", repairedAnswer: "(9, 5)" },
    observation: "The number of rows is deduced, not given." },
  { id: "mock-mr05-numberpyramid-03", qt: "QT-MR-05", storedAnswer: "B", derive: () => {
      // In a product pyramid every bottom brick appears in the top product with exponent >= 1, so the top is 0 exactly when some bottom brick is 0.
      const top = (row: number[]) => (row.some((v) => v === 0) ? 0 : 1);
      const rows: number[][] = [];
      for (let a = -2; a <= 3; a++) for (let b = -2; b <= 3; b++) for (let c = -2; c <= 3; c++) rows.push([a, b, c]);
      const all = (pre: (r: number[]) => boolean) => rows.filter(pre).every((r) => top(r) === 0);
      const truth = { A: all((r) => r.some((v) => v < 0)), B: all((r) => r.some((v) => v === 0)), C: all((r) => r[0] === r[1] && r[1] === r[2]) };
      return (Object.keys(truth) as (keyof typeof truth)[]).filter((k) => truth[k]).join("");
    }, observation: "Opens with \"the top brick's value is 0\", but the statements are conditionals independent of that premise; may confuse. Not a correctness error." },
  { id: "mock-mr06-agenarrative-01", qt: "QT-MR-06", storedAnswer: "2033", derive: () => ageYear((p, t) => t > 0 && 2 * t === p) },
  { id: "mock-mr06-agenarrative-02", qt: "QT-MR-06", storedAnswer: "2047", derive: () => ageYear((p, t) => p + t === 100) },
  { id: "mock-mr06-agenarrative-03", qt: "QT-MR-06", storedAnswer: "2010", derive: () => ageYear((p, t) => t > 0 && Number.isInteger(Math.sqrt(p)) && Number.isInteger(Math.sqrt(t))) },
  { id: "mock-mr06-sumdiff-01", qt: "QT-MR-06", storedAnswer: "35", derive: () => n((58 + 12) / 2) },
  { id: "mock-mr06-sumdiff-02", qt: "QT-MR-06", storedAnswer: "28", derive: () => n((74 - 18) / 2) },
  { id: "mock-mr08-rotation-01", qt: "QT-MR-08", storedAnswer: "(5, -3)", derive: () => { const [x, y] = [3, 5]; return `(${y}, ${-x})`; } },
  { id: "mock-mr08-rotation-02", qt: "QT-MR-08", storedAnswer: "(2, -6)", derive: () => { const [x, y] = [-2, 6]; return `(${-x}, ${-y})`; } },
  { id: "mock-mr09-data-01", qt: "QT-MR-09", storedAnswer: "13", derive: () => n(Math.max(24, 31, 18, 27) - Math.min(24, 31, 18, 27)) },
  { id: "mock-mr09-data-02", qt: "QT-MR-09", storedAnswer: "14", derive: () => n([14, 19, 11, 17, 9].reduce((a, b) => a + b, 0) / 5) },
  { id: "mock-mr09-data-03", qt: "QT-MR-09", storedAnswer: "628", derive: () => n(45 * 8 + 32 * 5 + 18 * 6) },
  { id: "mock-mr10-fairprep-01", qt: "QT-MR-10", storedAnswer: "15:50", derive: () => hhmm(T(13, 15) + T(1, 55) + 40) },
  { id: "mock-mr10-fairprep-02", qt: "QT-MR-10", storedAnswer: "13:35", derive: () => hhmm(T(16, 30) - 20 - 40 - T(1, 55)) },
  { id: "mock-mr10-reverseschedule-01", qt: "QT-MR-10", storedAnswer: "14:00", derive: () => hhmm(T(18, 5) - T(2, 10) - 20 - T(1, 35)) },
  { id: "mock-mr10-reverseschedule-02", qt: "QT-MR-10", storedAnswer: "14:30", derive: () => hhmm(T(16, 40) - 45 - 15 - T(1, 10)) },
  { id: "mock-mr11-propertysearch-01", qt: "QT-MR-11", storedAnswer: "37", derive: () => { const hits: number[] = []; for (let s = 1; s * s + 1 < 50; s++) { const v = s * s + 1; if (v > 20 && isPrime(v)) hits.push(v); } return hits.length === 1 ? n(hits[0]) : `ambiguous:${hits}`; }, observation: "Unique answer in range (checked)." },
  { id: "mock-mr11-propertysearch-02", qt: "QT-MR-11", storedAnswer: "81", derive: () => { const hits: number[] = []; for (let s = 1; s * s < 100; s++) { const v = s * s; if (v > 50 && v % 2 === 1) hits.push(v); } return hits.length === 1 ? n(hits[0]) : `ambiguous:${hits}`; }, observation: "Unique answer in range (checked)." },
  { id: "mock-mr11-truefalsejudgement-01", qt: "QT-MR-11", storedAnswer: "true", derive: () => { for (let a = 1; a < 99; a += 2) for (let b = 1; b < 99; b += 2) if ((a + b) % 2 !== 0) return "false"; return "true"; } },
  { id: "mock-mr11-truefalsejudgement-02", qt: "QT-MR-11", storedAnswer: "false", derive: () => { for (const p of [2, 3, 5, 7]) for (const q of [2, 3, 5, 7]) if ((p * q) % 2 !== 1) return "false"; return "true"; } },
  { id: "mock-mr12-reversemean-01", qt: "QT-MR-12", storedAnswer: "84", derive: () => n(74 * 6 - 72 * 5) },
  { id: "mock-mr12-reversemean-02", qt: "QT-MR-12", storedAnswer: "43", derive: () => n(55 * 5 - 58 * 4) },
  { id: "mock-mr12-weightedmean-01", qt: "QT-MR-12", storedAnswer: "9", derive: () => n((4 * 6 + 6 * 11) / 10) },
  { id: "mock-mr13-bestvalue-01", qt: "QT-MR-13", storedAnswer: "2.10", derive: () => (Math.min(1.8 / 0.75, 4.2 / 2)).toFixed(2) },
  { id: "mock-mr13-bestvalue-02", qt: "QT-MR-13", storedAnswer: "1.50", derive: () => (Math.min(3.2 / 2, 7.5 / 5)).toFixed(2) },
  { id: "mock-mr13-toppingcombos-01", qt: "QT-MR-13", storedAnswer: "10", derive: () => n(2 * 5) },
  { id: "mock-mr13-toppingcombos-02", qt: "QT-MR-13", storedAnswer: "20", derive: () => n(2 * ((5 * 4) / 2)) },
];
