/** Formats a duration in seconds as `m:ss`, e.g. 90 -> "1:30". */
export function formatTime(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
