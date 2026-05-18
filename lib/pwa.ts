/**
 * Registers the service worker and handles the update lifecycle.
 *
 * First install:  SW enters "installed" state with no previous controller →
 *                 we send SKIP_WAITING so it activates immediately.
 *
 * Update:         SW enters "installed" while an existing controller is active →
 *                 we dispatch "sw-update-available" so the UpdateToast can prompt
 *                 the user before reloading.
 */
export function registerSW(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });

      reg.addEventListener('updatefound', () => {
        const worker = reg.installing;
        if (!worker) return;

        worker.addEventListener('statechange', () => {
          if (worker.state !== 'installed') return;

          if (navigator.serviceWorker.controller) {
            // A new version is waiting while the old one is still running.
            window.dispatchEvent(
              new CustomEvent('sw-update-available', { detail: reg })
            );
          } else {
            // No previous controller — first install. Activate immediately.
            worker.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });

      // Handle the case where the user reloads the tab while a new SW is already
      // waiting (e.g., tab was in the background during a deploy).
      if (reg.waiting && navigator.serviceWorker.controller) {
        window.dispatchEvent(
          new CustomEvent('sw-update-available', { detail: reg })
        );
      }
    } catch (err) {
      // SW failure is non-fatal — the app continues to work without it.
      console.warn('[PWA] Service worker registration failed:', err);
    }
  });
}
