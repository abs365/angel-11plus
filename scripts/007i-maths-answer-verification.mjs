import { readFileSync } from "node:fs";
const env = {}; for (const line of readFileSync(".env.local", "utf8").split("\n")) { const m = line.match(/^([A-Z0-9_]+)=(.*)$/); if (m) env[m[1]] = m[2].trim(); }
const KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const URL = "https://" + JSON.parse(Buffer.from(KEY.split(".")[1], "base64").toString()).ref + ".supabase.co";
async function rest(path) {
  const res = await fetch(`${URL}/rest/v1/${path}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  return res.json();
}

let pass = 0, fail = 0;
function check(id, label, ok, detail) {
  if (ok) { pass++; console.log(`PASS ${id}: ${label}`); }
  else { fail++; console.log(`FAIL ${id}: ${label} :: ${detail}`); }
}
const num = (s) => parseFloat(String(s).replace(/[£,°ms]|kg|km|cm|ml|kg|min/g, "").trim());

const rows = await rest("ali_question_bank?select=id,family_id,prompt&subject=eq.maths&eligibility_status=eq.provisional&order=family_id,id&limit=1000");
const byFamily = {};
for (const r of rows) { if (!r.family_id) continue; (byFamily[r.family_id] ||= []).push(r); }

// mr01-average-mean: mean of listed numbers
for (const r of byFamily["mr01-average-mean"] || []) {
  const q = r.prompt.question;
  const nums = [...q.matchAll(/[-+]?\d+(?:\.\d+)?/g)].map(Number);
  // last N numbers before the question mark are the data values (drop none: all numeric tokens in the list)
  const listMatch = q.match(/were ([\d.,£\s]+?)\.\s*What/) || q.match(/\(km\) over \w+ days were ([\d.,\s]+?)\.\s*What/);
  const values = listMatch ? listMatch[1].split(",").map((s) => parseFloat(s.replace(/[£\s]/g, ""))).filter((n) => !isNaN(n)) : nums.slice(0, -0);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const stored = num(r.prompt.answer);
  const prefix = /£/.test(r.prompt.answer) ? "£" : "";
  check(r.id, "mean recomputed from listed values", Math.abs(mean - stored) < 1e-9, `values=${JSON.stringify(values)} mean=${mean} stored=${stored}`);
}

// mr01-data-table: too varied for one formula -- verify by extracting the labelled table and applying the specific op asked
const DAY_ABBR = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun" };
const resolveKey = (table, name) => (name in table ? name : DAY_ABBR[name] && DAY_ABBR[name] in table ? DAY_ABBR[name] : name);
for (const r of byFamily["mr01-data-table"] || []) {
  const q = r.prompt.question;
  const pairs = [...q.matchAll(/(\w+):\s*(\d+)/g)].map((m) => [m[1], Number(m[2])]);
  const table = Object.fromEntries(pairs);
  const stored = num(r.prompt.answer);
  let computed = null, desc = "";
  const totalByMatch = q.match(/total .*? by (\w+) and (\w+)/);
  const totalFromMatch = q.match(/total number sold from (\w+) to (\w+)/i);
  const moreMatch = q.match(/how many more were sold on (\w+) than on (\w+)/i);
  const fewerMatch = q.match(/how many fewer did (\w+) read than (\w+)/i);
  const rangeMatch = /range/i.test(q);
  if (rangeMatch) {
    const vals = Object.values(table);
    computed = Math.max(...vals) - Math.min(...vals);
    desc = "range(max-min)";
  } else if (moreMatch) {
    computed = table[resolveKey(table, moreMatch[1])] - table[resolveKey(table, moreMatch[2])];
    desc = `${moreMatch[1]}-${moreMatch[2]}`;
  } else if (fewerMatch) {
    computed = table[resolveKey(table, fewerMatch[2])] - table[resolveKey(table, fewerMatch[1])];
    desc = `${fewerMatch[2]}-${fewerMatch[1]}`;
  } else if (totalByMatch) {
    // "total ... by X and Y" -- just those two named entries, not a range
    computed = table[resolveKey(table, totalByMatch[1])] + table[resolveKey(table, totalByMatch[2])];
    desc = `${totalByMatch[1]}+${totalByMatch[2]}`;
  } else if (totalFromMatch) {
    // "total ... from X to Y" -- inclusive range in the table's listed order
    const keys = pairs.map((p) => p[0]);
    const k1 = resolveKey(table, totalFromMatch[1]), k2 = resolveKey(table, totalFromMatch[2]);
    const i1 = keys.indexOf(k1), i2 = keys.indexOf(k2);
    if (i1 !== -1 && i2 !== -1) {
      computed = keys.slice(Math.min(i1, i2), Math.max(i1, i2) + 1).reduce((a, k) => a + table[k], 0);
      desc = `sum(${keys.slice(Math.min(i1, i2), Math.max(i1, i2) + 1).join("+")})`;
    }
  }
  check(r.id, `data-table op recomputed (${desc})`, computed !== null && computed === stored, `table=${JSON.stringify(table)} computed=${computed} stored=${stored}`);
}

// mr01-measurement-conversion: parse two measurements (different units), convert to the target unit, sum
for (const r of byFamily["mr01-measurement-conversion"] || []) {
  const q = r.prompt.question;
  const m = q.match(/is ([\d.]+)(m|kg|l)\..*?is ([\d.]+)(cm|g|ml)\./s);
  const targetUnit = r.prompt.answer.match(/[a-z]+$/)[0];
  const [_, v1, u1, v2, u2] = m;
  const toBase = { m: 1, cm: 0.01, kg: 1, g: 0.001, l: 1, ml: 0.001 };
  const total = parseFloat(v1) * toBase[u1] + parseFloat(v2) * toBase[u2];
  const stored = num(r.prompt.answer);
  check(r.id, "unit conversion + sum recomputed", Math.abs(total - stored) < 1e-9, `${v1}${u1}+${v2}${u2}=${total}${targetUnit} stored=${stored}${targetUnit}`);
}

// mr01-missing-operand: solve the box equation
for (const r of byFamily["mr01-missing-operand"] || []) {
  const q = r.prompt.question;
  const stored = num(r.prompt.answer);
  let computed = null, desc = "";
  let m;
  if ((m = q.match(/▢\s*×\s*(\d+)\s*=\s*(\d+)/))) { computed = Number(m[2]) / Number(m[1]); desc = `${m[2]}/${m[1]}`; }
  else if ((m = q.match(/(\d+)\s*÷\s*▢\s*=\s*(\d+)/))) { computed = Number(m[1]) / Number(m[2]); desc = `${m[1]}/${m[2]}`; }
  else if ((m = q.match(/▢\s*−\s*(\d+)\s*=\s*(\d+)/))) { computed = Number(m[2]) + Number(m[1]); desc = `${m[2]}+${m[1]}`; }
  else if ((m = q.match(/▢\s*\+\s*(\d+)\s*=\s*(\d+)/))) { computed = Number(m[2]) - Number(m[1]); desc = `${m[2]}-${m[1]}`; }
  check(r.id, `box equation solved (${desc})`, computed === stored, `computed=${computed} stored=${stored}`);
}

// mr02-far-ratio-context: "X has N times as much as Y. Together they have T. If Y then spends/gives S, how much does Y have left?"
for (const r of byFamily["mr02-far-ratio-context"] || []) {
  const q = r.prompt.question;
  const m = q.match(/has (\w+|\d+) times as (?:much money|many stickers) as \w+.*?[Tt]ogether they have £?(\d+).*?(?:then )?(?:spends|gives away|(?:is )?then cut from the shorter piece) £?(\d+)/s) ||
            q.match(/is (\w+) times the length of the shorter piece\. Together they measure (\d+)cm\. If (\d+)cm is then cut/s);
  let multiplierWord = null, total, subtract;
  if (q.includes("cut into two pieces")) {
    const mm = q.match(/is ([\w\s]+?) times the length of the shorter piece\. Together they measure (\d+)cm\. If (\d+)cm/);
    multiplierWord = mm[1]; total = Number(mm[2]); subtract = Number(mm[3]);
  } else {
    const mm = q.match(/(twice|three times|four times) as (?:much money|many stickers) as \w+\. Between them they have £?(\d+) ?\w*\. If \w+ then (?:spends|gives away) £?(\d+)/);
    multiplierWord = mm[1]; total = Number(mm[2]); subtract = Number(mm[3]);
  }
  const wordToNum = { twice: 2, three: 3, four: 4, "three times": 3, "four times": 4 };
  const mult = wordToNum[multiplierWord.trim()];
  const smallerShare = total / (mult + 1);
  const computed = smallerShare - subtract;
  const stored = num(r.prompt.answer);
  check(r.id, "far-transfer ratio-share recomputed", Math.abs(computed - stored) < 1e-9, `mult=${mult} total=${total} smallerShare=${smallerShare} -${subtract}=${computed} stored=${stored}`);
}

// mr02-nth-term: arithmetic sequence
for (const r of byFamily["mr02-nth-term"] || []) {
  const q = r.prompt.question;
  const m = q.match(/begins ([-\d]+), ([-\d]+), ([-\d]+), \.\.\..*?(\d+)(?:st|nd|rd|th) term/);
  const [a1, a2, a3, nStr] = m.slice(1).map(Number);
  const d = a2 - a1;
  const n = nStr;
  const computed = a1 + (n - 1) * d;
  const stored = num(r.prompt.answer);
  const consistentDiff = (a3 - a2) === d;
  check(r.id, "arithmetic progression is genuinely arithmetic (constant difference)", consistentDiff, `${a1},${a2},${a3} diffs=${a2 - a1},${a3 - a2}`);
  check(r.id, `nth term recomputed (n=${n})`, computed === stored, `a1=${a1} d=${d} computed=${computed} stored=${stored}`);
}

// mr02-sum-difference: "X has £D more than Y. Together they have £T. How much does Y have?"
for (const r of byFamily["mr02-sum-difference"] || []) {
  const q = r.prompt.question;
  const m = q.match(/has £(\d+) more than \w+ in [\w\s]+\. Together they have £(\d+)\./);
  const [diff, total] = m.slice(1).map(Number);
  const smaller = (total - diff) / 2;
  const stored = num(r.prompt.answer);
  check(r.id, "sum-and-difference algebra recomputed", Math.abs(smaller - stored) < 1e-9, `diff=${diff} total=${total} smaller=${smaller} stored=${stored}`);
}

// mr03-angle-ratio: angles on a line (180) or around a point (360), find largest
for (const r of byFamily["mr03-angle-ratio"] || []) {
  const q = r.prompt.question;
  const total = /around a point/.test(q) ? 360 : 180;
  const ratioMatch = q.match(/ratio (\d+):(\d+)(?::(\d+))?/);
  const parts = ratioMatch.slice(1).filter(Boolean).map(Number);
  const sumParts = parts.reduce((a, b) => a + b, 0);
  const share = total / sumParts;
  const largest = Math.max(...parts) * share;
  const stored = num(r.prompt.answer);
  check(r.id, `angle-ratio largest angle recomputed (base=${total})`, Math.abs(largest - stored) < 1e-9, `parts=${parts} share=${share} largest=${largest} stored=${stored}`);
}

// mr03-coordinate: reflection / translation
for (const r of byFamily["mr03-coordinate"] || []) {
  const q = r.prompt.question;
  const start = q.match(/at \(([-\d]+),\s*([-\d]+)\)/);
  let [x, y] = start.slice(1, 3).map(Number);
  if (/reflected in the x-axis/.test(q)) y = -y;
  else if (/reflected in the y-axis/.test(q)) x = -x;
  else {
    const t = q.match(/translated (\d+) units? (right|left) and (\d+) units? (up|down)/);
    if (t) {
      const [rx, dirx, ry, diry] = t.slice(1);
      x += (dirx === "right" ? 1 : -1) * Number(rx);
      y += (diry === "up" ? 1 : -1) * Number(ry);
    }
  }
  const stored = r.prompt.answer.match(/\(([-\d]+),\s*([-\d]+)\)/).slice(1, 3).map(Number);
  check(r.id, "coordinate transform recomputed", x === stored[0] && y === stored[1], `computed=(${x},${y}) stored=(${stored[0]},${stored[1]})`);
}

// mr03-mixed-perimeter: area + one side -> perimeter
for (const r of byFamily["mr03-mixed-perimeter"] || []) {
  const q = r.prompt.question;
  const m = q.match(/area of (\d+) ?m.*?one side is (\d+)m/);
  const [area, side] = m.slice(1).map(Number);
  const otherSide = area / side;
  const perimeter = 2 * (side + otherSide);
  const stored = num(r.prompt.answer);
  check(r.id, "area+side -> perimeter recomputed", Math.abs(perimeter - stored) < 1e-9, `area=${area} side=${side} other=${otherSide} perimeter=${perimeter} stored=${stored}`);
}

// mr04-best-value: unit price comparison
for (const r of byFamily["mr04-best-value"] || []) {
  const q = r.prompt.question;
  const m = q.match(/Option A is (\d+) for £([\d.]+)\. Option B is (\d+) for £([\d.]+)/);
  const [qa, pa, qb, pb] = m.slice(1).map(parseFloat);
  const unitA = pa / qa, unitB = pb / qb;
  const computed = unitA < unitB ? "A" : unitB < unitA ? "B" : "TIE";
  check(r.id, "unit-price comparison recomputed", computed === r.prompt.answer, `unitA=${unitA.toFixed(4)} unitB=${unitB.toFixed(4)} computed=${computed} stored=${r.prompt.answer}`);
}

// mr04-compound-percentage: successive % change
for (const r of byFamily["mr04-compound-percentage"] || []) {
  const q = r.prompt.question;
  const m = q.match(/costs £([\d.]+)\. The price is increased by (\d+)%, then later decreased by (\d+)%/);
  const [start, incPct, decPct] = m.slice(1).map(Number);
  const afterInc = start * (1 + incPct / 100);
  const afterDec = afterInc * (1 - decPct / 100);
  const stored = num(r.prompt.answer);
  check(r.id, "compound percentage change recomputed", Math.abs(afterDec - stored) < 0.005, `start=${start} +${incPct}%=${afterInc} -${decPct}%=${afterDec.toFixed(2)} stored=${stored}`);
}

// mr04-elapsed-time: sum durations onto a start time
function parseTime(s) { const [h, m] = s.split(":").map(Number); return h * 60 + m; }
function fmtTime(mins) { mins = ((mins % 1440) + 1440) % 1440; const h = Math.floor(mins / 60), m = mins % 60; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`; }
for (const r of byFamily["mr04-elapsed-time"] || []) {
  const q = r.prompt.question;
  const startMatch = q.match(/starts at (\d{2}:\d{2})/);
  const durations = [...q.matchAll(/(\d+)\s*hour[s]?\s*(\d+)?\s*minutes?|(\d+)\s*minutes?/g)].map((m) => {
    if (m[1]) return Number(m[1]) * 60 + (Number(m[2]) || 0);
    return Number(m[3]);
  });
  const totalMins = parseTime(startMatch[1]) + durations.reduce((a, b) => a + b, 0);
  const computed = fmtTime(totalMins);
  check(r.id, "elapsed-time sum recomputed", computed === r.prompt.answer, `start=${startMatch[1]} durations=${JSON.stringify(durations)} computed=${computed} stored=${r.prompt.answer}`);
}

// mr04-far-recipe: proportional scaling
for (const r of byFamily["mr04-far-recipe"] || []) {
  const q = r.prompt.question;
  const m = q.match(/for (\d+) people uses (\d+)g of \w+.*?for (\d+) people/s);
  const [basePeople, baseAmount, targetPeople] = m.slice(1).map(Number);
  const computed = (baseAmount / basePeople) * targetPeople;
  const stored = num(r.prompt.answer);
  check(r.id, "recipe proportional scaling recomputed", Math.abs(computed - stored) < 1e-9, `${baseAmount}/${basePeople}*${targetPeople}=${computed} stored=${stored}`);
}

// mr05-constrained-multiple: smallest/largest common multiple beyond a bound
function lcm(a, b) { const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y)); return (a * b) / gcd(a, b); }
for (const r of byFamily["mr05-constrained-multiple"] || []) {
  const q = r.prompt.question;
  const m = q.match(/(smallest|largest) multiple of both (\d+) and (\d+) that is (greater than|less than) (\d+)/);
  const [which, a, b, dir, bound] = [m[1], Number(m[2]), Number(m[3]), m[4], Number(m[5])];
  const l = lcm(a, b);
  let computed;
  if (which === "smallest" && dir === "greater than") {
    computed = l;
    while (computed <= bound) computed += l;
  } else if (which === "largest" && dir === "less than") {
    computed = Math.floor((bound - 1) / l) * l;
  }
  const stored = num(r.prompt.answer);
  check(r.id, "constrained-multiple recomputed", computed === stored, `lcm(${a},${b})=${l} ${which} ${dir} ${bound} => computed=${computed} stored=${stored}`);
}

// mr05-factors-primes: factor count or primality
function factorCount(n) { let c = 0; for (let i = 1; i <= n; i++) if (n % i === 0) c++; return c; }
function isPrime(n) { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; }
for (const r of byFamily["mr05-factors-primes"] || []) {
  const q = r.prompt.question;
  let m;
  if ((m = q.match(/How many factors does (\d+) have/))) {
    const n = Number(m[1]);
    const computed = factorCount(n);
    check(r.id, `factor count recomputed for ${n}`, computed === num(r.prompt.answer), `computed=${computed} stored=${r.prompt.answer}`);
  } else if ((m = q.match(/Is (\d+) a prime number/))) {
    const n = Number(m[1]);
    const computed = isPrime(n) ? "True" : "False";
    check(r.id, `primality recomputed for ${n}`, computed === r.prompt.answer, `computed=${computed} stored=${r.prompt.answer}`);
  }
}

console.log(`\n=== TOTAL: ${pass} PASS, ${fail} FAIL (${pass + fail} checks across ${Object.keys(byFamily).length} families, 67 questions) ===`);
