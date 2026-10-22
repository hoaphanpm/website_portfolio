/**
 * Pure decision helpers for the analytics tracking gate. No imports, so they
 * can be unit-tested directly (lib/analytics/environment.test.mjs) and are
 * shared by the server gate (gating.ts) and the client check (service.ts).
 *
 * Rules:
 *  - Production (VERCEL_ENV === "production"): unchanged. No QA flag, branch
 *    or token is consulted, and the QA flag can never alter it.
 *  - Preview: tracking is OFF unless the explicit QA opt-in below is fully
 *    satisfied. Anything missing or invalid fails closed.
 *  - Everything else (local dev, unknown/missing environment): OFF.
 */

/** The only Preview branch that may opt in to QA tracking. */
export const QA_PREVIEW_BRANCH = "integration/hardcoded-case-studies";

/**
 * The environment values the gate reads. VERCEL_ENV and VERCEL_GIT_COMMIT_REF
 * are platform-provided and exist only on the server (never in the browser
 * bundle), so they cannot be spoofed client-side.
 */
export type TrackingEnv = {
  VERCEL_ENV?: string;
  VERCEL_GIT_COMMIT_REF?: string;
  NEXT_PUBLIC_MIXPANEL_QA_PREVIEW?: string;
  NEXT_PUBLIC_MIXPANEL_TOKEN?: string;
};

/**
 * Preview QA opt-in: a Vercel Preview deployment of QA_PREVIEW_BRANCH, with
 * the flag set to exactly "true" and a Mixpanel token present.
 */
export function isQaPreviewEnvironment(env: TrackingEnv): boolean {
  const token = env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  return (
    env.VERCEL_ENV === "preview" &&
    env.VERCEL_GIT_COMMIT_REF === QA_PREVIEW_BRANCH &&
    env.NEXT_PUBLIC_MIXPANEL_QA_PREVIEW === "true" &&
    typeof token === "string" &&
    token.trim() !== ""
  );
}

/** Environment layer of the gate (before the admin and preview-query layers). */
export function isTrackingEnvironmentAllowed(env: TrackingEnv): boolean {
  return env.VERCEL_ENV === "production" || isQaPreviewEnvironment(env);
}

/** Full server-side decision: environment, then admin session, then ?preview=true. */
export function decideTracking(
  env: TrackingEnv,
  context: { isAdmin: boolean; previewQuery: boolean },
): boolean {
  if (context.previewQuery) return false;
  if (!isTrackingEnvironmentAllowed(env)) return false;
  return !context.isAdmin;
}

/** Client layer: never on localhost / 127.0.0.1, never with ?preview=true. */
export function isClientHostAllowed(hostname: string, search: string): boolean {
  if (hostname === "localhost" || hostname === "127.0.0.1") return false;
  if (new URLSearchParams(search).get("preview") === "true") return false;
  return true;
}
