/**
 * Service-worker registration and update detection.
 *
 * Design:
 *  - The SW always calls self.skipWaiting() in its install handler, so it
 *    activates immediately with no "waiting" gap.
 *  - We capture whether a controller existed BEFORE registration.
 *    · First install  → hadController is false → controllerchange is silent.
 *    · Update deploy  → hadController is true  → controllerchange fires the
 *                        sw-update-available event, prompting the user to reload.
 *
 * This avoids the statechange/updatefound race that previously left the SW
 * stuck in "waiting" on Android PWA cold-starts.
 */
export function registerSW(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', async () => {
    try {
      // Snapshot before registration so we can distinguish install vs update.
      const hadController = !!navigator.serviceWorker.controller;
      console.log('[PWA] Registering SW. Had controller:', hadController);

      const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      console.log('[PWA] SW registered. State:', reg.active?.state ?? 'none active yet');

      // controllerchange fires when a new SW takes control of this client.
      // With skipWaiting-in-install, this fires shortly after every new deploy.
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[PWA] Controller changed. Had controller:', hadController);
        if (hadController) {
          // An update just silently activated. Invite the user to reload.
          window.dispatchEvent(
            new CustomEvent('sw-update-available', { detail: reg })
          );
        }
        // First install (hadController=false): SW is now active. No toast needed.
      });

      // Edge case: a waiting worker exists on page load (e.g., user returned
      // to a backgrounded tab after a deploy where skipWaiting was NOT yet in
      // place — old SW build).  Show the toast so they can still update.
      if (reg.waiting && hadController) {
        console.log('[PWA] Found waiting SW on load — dispatching update event.');
        window.dispatchEvent(
          new CustomEvent('sw-update-available', { detail: reg })
        );
      }

    } catch (err) {
      // SW failure is non-fatal — app continues to work without offline support.
      console.warn('[PWA] Service worker registration failed:', err);
    }
  });
}
