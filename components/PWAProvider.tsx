"use client";

import { useEffect } from "react";
import { registerSW } from "@/lib/pwa";
import OfflineBanner from "./OfflineBanner";
import UpdateToast from "./UpdateToast";

/**
 * Mounts once in the root layout.
 * Registers the service worker and renders the offline banner + update toast.
 */
export default function PWAProvider() {
  useEffect(() => {
    registerSW();
  }, []);

  return (
    <>
      <OfflineBanner />
      <UpdateToast />
    </>
  );
}
