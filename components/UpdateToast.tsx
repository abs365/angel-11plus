"use client";

import { useEffect, useState } from "react";
import { RefreshCw, X } from "lucide-react";

export default function UpdateToast() {
  const [visible, setVisible] = useState(false);
  const [reg, setReg] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ServiceWorkerRegistration>).detail;
      setReg(detail);
      setVisible(true);
    };
    window.addEventListener("sw-update-available", handler);
    return () => window.removeEventListener("sw-update-available", handler);
  }, []);

  function handleRefresh() {
    if (reg?.waiting) {
      // Tell the waiting SW to take over, then reload once it does.
      navigator.serviceWorker.addEventListener(
        "controllerchange",
        () => window.location.reload(),
        { once: true }
      );
      reg.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-24 md:bottom-5 left-4 right-4 md:left-auto md:right-5 md:w-80 z-50 bg-gray-900 text-white rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-2xl"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-snug">
          New version of Angel 11+ available
        </p>
        <p className="text-xs text-gray-400 mt-0.5">Refresh to get the latest content.</p>
      </div>

      <button
        onClick={handleRefresh}
        className="flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0"
      >
        <RefreshCw size={12} aria-hidden="true" />
        Refresh
      </button>

      <button
        onClick={() => setVisible(false)}
        className="text-gray-400 hover:text-white transition-colors shrink-0 -mr-1"
        aria-label="Dismiss update notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
