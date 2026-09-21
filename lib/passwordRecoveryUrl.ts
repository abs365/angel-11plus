/**
 * Password-recovery link detection, moved verbatim out of
 * app/reset-password/page.tsx (a Next.js page file may only export the page;
 * extra exports fail route type validation under `next build --webpack`).
 * No logic changed.
 */

/**
 * Production defect found by real Founder acceptance testing: Supabase's
 * own auth-js client (installed version confirmed directly:
 * node_modules/@supabase/auth-js/dist/module/GoTrueClient.js) defers its
 * PASSWORD_RECOVERY notification inside a `setTimeout(...)` call, fired
 * from `_initialize()` -- which itself runs as a fire-and-forget promise
 * chain kicked off the moment the Supabase client is first constructed
 * (component/lib/supabase.ts's getSupabaseClient() singleton), NOT
 * synchronised with any particular React component's own effect. A
 * genuinely real recovery link click was verified in production landing
 * back on the plain "Reset your password" request form -- proving
 * AuthProvider's own onAuthStateChange listener can genuinely miss this
 * transient, one-time event depending on exactly when/where the shared
 * Supabase client singleton is first created relative to when this page's
 * own effects run. (Investigated and ruled out separately: Angel's
 * anonymous-session bootstrap, ensureLearnerSession()/signInAnonymously(),
 * cannot participate -- lib/learnerIdentity.ts's own header confirms
 * "Allow anonymous sign-ins" is OFF in production, so that call fails
 * harmlessly and fires no competing auth event.)
 *
 * Fix: recovery-link arrival is now detected durably, independent of any
 * event's timing, by reading the recovery link's own `type=recovery`
 * parameter directly from the URL (hash for Supabase's default implicit
 * flow, confirmed via the installed auth-js's own DEFAULT_OPTIONS) the
 * moment this page's very first render happens -- via a lazy useState
 * initializer, which React guarantees runs during this component's own
 * render phase, strictly before ANY effect (this page's own, or
 * AuthProvider's) can execute. `type` is a plain, non-secret mode flag,
 * never an access token or credential -- reading it is not "parsing an
 * access token" in the sense this project's security rules forbid.
 * AuthProvider's own isPasswordRecovery flag is kept and still honoured
 * (still correct on every occasion the event genuinely does arrive in
 * time) -- this is an additive, durable confirmation, not a replacement
 * auth mechanism.
 */
export function isPasswordRecoveryUrl(hash: string, search: string): boolean {
  const stripLeading = (raw: string, prefix: string) => (raw.startsWith(prefix) ? raw.slice(1) : raw);
  const hashParams = new URLSearchParams(stripLeading(hash, "#"));
  const searchParams = new URLSearchParams(stripLeading(search, "?"));
  return hashParams.get("type") === "recovery" || searchParams.get("type") === "recovery";
}
