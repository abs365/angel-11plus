/**
 * Deterministic, complete retrieval from a PostgREST-backed table.
 *
 * Why this exists: Supabase/PostgREST truncates every response to its configured `max_rows` (1,000 on this project, proven
 * against production: a request for rows 0-1999 of a 1,275-row readable table returned exactly 1,000). A plain
 * `.select()` therefore silently returns only the first 1,000 rows, in an unspecified order, once a table (or a filtered view of
 * it) grows past that. The question bank crossed that boundary for the all-skills lookups (1,264 CSSE Practice rows) and will cross
 * it for the per-subject Maths pool as the 2,000 and 3,000+ question strategy proceeds.
 *
 * Contract:
 *   - Pages are fetched with an explicit, deterministic order (the caller's `build` must `.order(...)` on a unique column) and an
 *     explicit `.range(from, to)`.
 *   - The first page also asks for an exact total (`count: "exact"`). Fetching continues until that total has been collected, so
 *     the loop is correct even if the server's own cap is smaller than `pageSize`. If no total is available it continues until a page
 *     comes back empty.
 *   - Rows are de-duplicated by `key` (default: `row.id`) so an insert between pages can never produce a duplicate.
 *   - Any page error returns `{ data: null, error }` (never a silently partial result), matching the `error || !data` check every
 *     existing caller already makes.
 *   - `maxPages` bounds the loop defensively.
 */
export interface PageResult<T> {
  data: T[] | null;
  error: { message: string } | null;
  count?: number | null;
}

/** Builds ONE page: `from`/`to` are the inclusive range; `first` is true for the first page (ask for the exact count there). */
export type PageBuilder<T> = (from: number, to: number, first: boolean) => PromiseLike<PageResult<T>>;

export const DEFAULT_PAGE_SIZE = 1000;
export const DEFAULT_MAX_PAGES = 200;

export async function fetchAllRows<T>(
  build: PageBuilder<T>,
  options: { pageSize?: number; maxPages?: number; key?: (row: T) => string } = {}
): Promise<{ data: T[] | null; error: { message: string } | null }> {
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;
  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES;
  const keyOf = options.key ?? ((row: T) => String((row as { id?: unknown }).id));
  const seen = new Set<string>();
  const rows: T[] = [];
  let total: number | null = null;

  let offset = 0;
  for (let page = 0; page < maxPages; page++) {
    const result = await build(offset, offset + pageSize - 1, page === 0);
    if (result.error || !result.data) return { data: null, error: result.error ?? { message: "no data returned" } };
    if (page === 0 && typeof result.count === "number") total = result.count;
    for (const row of result.data) {
      const k = keyOf(row);
      if (seen.has(k)) continue;
      seen.add(k);
      rows.push(row);
    }
    // The next page starts after the rows the server actually returned (not after `pageSize`), so a server cap smaller than
    // `pageSize` can never make the loop skip rows.
    offset += result.data.length;
    if (result.data.length === 0) break;
    if (total !== null && offset >= total) break;
    // Without a total, a short page is the only stop signal.
    if (total === null && result.data.length < pageSize) break;
  }
  return { data: rows, error: null };
}
