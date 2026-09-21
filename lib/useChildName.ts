"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { readChildName, saveChildName, type ChildNameOwner } from "@/lib/childProfile";

const CHANGED_EVENT = "angel-child-name-changed";

/**
 * The signed-in account's child display name (local-only, see
 * lib/childProfile.ts). `ready` is false until auth has settled, so a
 * surface never flashes a name that belongs to a different account.
 * Every consumer on the page re-reads when any one of them saves.
 */
export function useChildName() {
  const { user, loading } = useAuth();
  const [name, setName] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const id = user?.id ?? null;
  const isPermanent = Boolean(user) && !user!.is_anonymous;

  useEffect(() => {
    if (loading) return;
    const owner: ChildNameOwner = { id, isPermanent };
    const sync = () => {
      setName(readChildName(localStorage, owner));
      setReady(true);
    };
    Promise.resolve().then(sync);
    window.addEventListener(CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [loading, id, isPermanent]);

  const save = useCallback(
    (raw: string): string | null => {
      const saved = saveChildName(localStorage, { id, isPermanent }, raw);
      if (saved) window.dispatchEvent(new Event(CHANGED_EVENT));
      return saved;
    },
    [id, isPermanent]
  );

  return { name, ready, save };
}
