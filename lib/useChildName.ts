"use client";

import { useCallback } from "react";
import { useLearners } from "@/lib/useLearners";
import { normaliseChildName } from "@/lib/childProfile";

/**
 * The ACTIVE learner's first name / nickname (multi-learner, migration
 * 260: it lives on the learner's own database row, so it follows the
 * learner across devices and can never be shown against another child).
 * Kept as a thin adapter so existing surfaces keep their `{ name, ready,
 * save }` shape; the source of truth is the single learner context.
 */
export function useChildName() {
  const { active, ready, renameLearner } = useLearners();

  const save = useCallback(
    (raw: string): string | null => {
      if (!active || !normaliseChildName(raw)) return null;
      return renameLearner(active.id, raw);
    },
    [active, renameLearner]
  );

  return { name: active?.name ?? null, ready, save };
}
