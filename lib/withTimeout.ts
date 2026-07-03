/**
 * Races a promise against a fixed timeout so a stalled network request
 * (one that never resolves or rejects on its own — the root cause
 * documented in PRACTICE_EXPERIENCE_REVIEW.md) can never hang a loading
 * state forever. Rejects with a clear, catchable error if the timeout
 * fires first.
 */
export function withTimeout<T>(promise: Promise<T>, ms = 10000, label = "request"): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timed out waiting for ${label}`));
    }, ms);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}
