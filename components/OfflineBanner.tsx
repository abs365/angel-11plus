"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // Initialise from current state (avoid SSR mismatch by reading inside effect).
    setOffline(!navigator.onLine);

    const goOnline  = () => setOffline(false);
    const goOffline = () => setOffline(true);

    window.addEventListener("online",  goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online",  goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 flex items-center gap-2.5 bg-amber-500 text-white px-4 py-2.5 text-sm font-medium shadow-md"
    >
      <WifiOff size={15} className="shrink-0" aria-hidden="true" />
      <span>You&apos;re offline — learning continues with saved lessons.</span>
    </div>
  );
}
