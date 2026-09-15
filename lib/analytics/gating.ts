import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

/**
 * The three-layer server-side tracking gate — docs/architecture.md's
 * Milestone 8 row: "No Mixpanel network calls locally, on preview
 * deployments, with an admin session, or with ?preview=true."
 *
 * All three layers are computed here, server-side, because this is the
 * only place that can authoritatively know: (1) VERCEL_ENV, which is
 * platform-provided and never present in the browser bundle unless
 * NEXT_PUBLIC_-prefixed (it deliberately isn't, so it can't be spoofed
 * client-side); (2) the caller's real admin status via requireAdmin(),
 * the same re-verification used everywhere else in the app; (3) preview
 * mode, already computed by the caller from the ?preview= query param.
 *
 * VERCEL_ENV is always undefined in local dev, so trackingAllowed is
 * always false locally by design — this whole path is inherently
 * unverifiable end-to-end outside of an actual production deployment.
 */
export async function computeTrackingAllowed(
  isPreview: boolean,
): Promise<boolean> {
  if (process.env.VERCEL_ENV !== "production") {
    return false;
  }
  if (isPreview) {
    return false;
  }

  const supabase = await createClient();
  const isAdmin = await requireAdmin(supabase);
  return !isAdmin;
}
