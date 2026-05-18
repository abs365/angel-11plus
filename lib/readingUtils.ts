// ─── Text normalisation ───────────────────────────────────────────────────────

function normalizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

// ─── Longest common subsequence (word-level) ─────────────────────────────────
// Passages are ≤ 400 words so O(n²) is fast enough for UI use.

function lcs(a: string[], b: string[]): number {
  const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1] + 1
          : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

// ─── Public API ───────────────────────────────────────────────────────────────

export interface ReadResult {
  accuracy: number;     // 0–100 %
  wordsMatched: number;
  wordsTotal: number;
  wpm: number;          // words per minute (spoken words / time)
}

export function compareTranscript(
  original: string,
  spoken: string,
  seconds: number
): ReadResult {
  const origWords = normalizeWords(original);
  const spokenWords = normalizeWords(spoken);

  const matched = lcs(origWords, spokenWords);
  const accuracy =
    origWords.length > 0
      ? Math.min(100, Math.round((matched / origWords.length) * 100))
      : 0;

  // WPM is based on spoken words (what the student actually said), capped at a
  // realistic maximum to guard against recognition bunching errors.
  const wpm =
    seconds > 5
      ? Math.min(260, Math.round((spokenWords.length / seconds) * 60))
      : 0;

  return { accuracy, wordsMatched: matched, wordsTotal: origWords.length, wpm };
}
