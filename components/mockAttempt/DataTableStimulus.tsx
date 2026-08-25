import type { MockTableStimulus } from "@/lib/mockAttempt/types";

/**
 * Structured Assessment Stimulus (Decision 170) — the smallest generic,
 * reusable renderer for a shared data table attached to a numbered
 * question. Deliberately not a page-builder and not specific to any one
 * family's content — every value (caption/headers/rows) comes from the
 * `stimulus` prop, nothing is hard-coded here. Real semantic markup
 * (<table>/<thead>/<th scope="col">/<tbody>) rather than the earlier
 * whitespace-pre-line newline-list workaround, so the table has an
 * accessible name and structure regardless of viewport or font.
 *
 * Callers MUST validate with isValidTableStimulus() (lib/mockAttempt/
 * workspace.ts) before rendering this component — it trusts its prop's
 * shape and does not re-validate, matching every other presentational
 * component in this codebase (e.g. QuestionPalette trusts PaletteEntry).
 */
export function DataTableStimulus({ stimulus }: { stimulus: MockTableStimulus }) {
  const captionId = `${stimulus.headers.join("-")}-caption`.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="my-4 rounded-xl border border-gray-200 dark:border-gray-700 overflow-x-auto">
      <table className="w-full text-sm border-collapse" aria-describedby={stimulus.caption ? captionId : undefined}>
        <caption
          id={captionId}
          className={stimulus.caption ? "text-left px-3 pt-3 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-400" : "sr-only"}
        >
          {stimulus.caption ?? "Data table"}
        </caption>
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            {stimulus.headers.map((header, index) => (
              <th
                key={index}
                scope="col"
                className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stimulus.rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 1 ? "bg-gray-50 dark:bg-gray-800/40" : undefined}
            >
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-3 py-2 text-sm text-gray-800 dark:text-gray-200 tabular-nums whitespace-pre-line">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
