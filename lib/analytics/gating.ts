import {
  decideTracking,
  isTrackingEnvironmentAllowed,
  type TrackingEnv,
} from "@/lib/analytics/environment";
import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

/**
 * The values the gate reads. NEXT_PUBLIC_* are referenced literally so Next
 * inlines them at build time, matching what the client bundle actually
 * contains (e.g. the token); the VERCEL_* values are read at runtime on the
 * server.
 */
function readTrackingEnv(): TrackingEnv {
  return {
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF,
    NEXT_PUBLIC_MIXPANEL_QA_PREVIEW: process.env.NEXT_PUBLIC_MIXPANEL_QA_PREVIEW,
    NEXT_PUBLIC_MIXPANEL_TOKEN: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
  };
}

/**
 * The env+admin two-thirds of the gate, on its own. Exists because the
 * shared <Footer> (mounted once in app/(public)/layout.tsx, wrapping both
 * "/" and "/work/[case_id]") has no ?preview= query param of its own to
 * read — layouts don't receive searchParams — so it combines this with its
 * own client-side ?preview=true re-check (components/site/footer.tsx)
 * instead of computeTrackingAllowed() below.
 *
 * VERCEL_ENV is always undefined in local dev, so this is always false
 * locally by design. On Vercel it is allowed in Production, and on Preview
 * only for the explicit QA opt-in in lib/analytics/environment.ts (the QA
 * branch, NEXT_PUBLIC_MIXPANEL_QA_PREVIEW=true and a token); all other
 * Preview deployments stay off.
 */
export async function computeTrackingAllowedBase(): Promise<boolean> {
  const env = readTrackingEnv();
  if (!isTrackingEnvironmentAllowed(env)) {
    return false;
  }

  const supabase = await createClient();
  const isAdmin = await requireAdmin(supabase);
  return decideTracking(env, { isAdmin, previewQuery: false });
}

/**
 * The full three-layer server-side tracking gate for a page render —
 * docs/architecture.md's Milestone 8 row: "No Mixpanel network calls
 * locally, on preview deployments, with an admin session, or with
 * ?preview=true."
 *
 * All three layers are computed here, server-side, because this is the
 * only place that can authoritatively know: (1) VERCEL_ENV, which is
 * platform-provided and never present in the browser bundle unless
 * NEXT_PUBLIC_-prefixed (it deliberately isn't, so it can't be spoofed
 * client-side); (2) the caller's real admin status via requireAdmin(),
 * the same re-verification used everywhere else in the app; (3) preview
 * mode, already computed by the caller from the ?preview= query param.
 */
export async function computeTrackingAllowed(
  isPreview: boolean,
): Promise<boolean> {
  if (isPreview) {
    return false;
  }
  return computeTrackingAllowedBase();
}
