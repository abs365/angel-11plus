import type { MockImageStimulus } from "@/lib/mockAttempt/types";

/**
 * CSSE Two-Paper Mock, pre-activation completion pass — the Q2
 * (picture-narrative) stimulus renderer, matching DataTableStimulus's
 * own established convention exactly. Callers must validate with
 * isValidImageStimulus() (lib/mockAttempt/workspace.ts) before rendering
 * this component, and must never render it when `imageAssetUrl` is null
 * — an unauthored image must never reach a learner (see
 * MockImageStimulus's own doc comment, migration 245).
 */
export function ImageStimulus({ stimulus }: { stimulus: MockImageStimulus & { imageAssetUrl: string } }) {
  return (
    <div className="my-4 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* eslint-disable-next-line @next/next/no-img-element -- a static, locally-hosted Mock asset, not an optimisable remote image */}
      <img src={stimulus.imageAssetUrl} alt={stimulus.altText} className="w-full h-auto block" />
      {stimulus.caption && (
        <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">{stimulus.caption}</p>
      )}
    </div>
  );
}
