"use client";

import { useEffect } from "react";
import { ensureAnalyticsReady } from "@/lib/analytics/service";

type AnalyticsInitProps = {
  /**
   * The server-computed three-layer gate result (VERCEL_ENV === production,
   * not an admin session, not a preview request) — see lib/analytics/gating.ts.
   * This is authoritative; ensureAnalyticsReady()'s own client-side
   * hostname/preview re-check is defense-in-depth only.
   */
  trackingAllowed: boolean;
};

/**
 * Mounted on the homepage and case-study pages (Milestone 8 decision #1).
 * Renders nothing. Milestone 9: every other tracking component also calls
 * ensureAnalyticsReady() itself before firing, so none of them actually
 * depend on this component having already mounted/run — this is here for
 * architectural clarity (one visible, obvious bootstrap point), not as a
 * hidden prerequisite for the others.
 */
export function AnalyticsInit({ trackingAllowed }: AnalyticsInitProps) {
  useEffect(() => {
    ensureAnalyticsReady(trackingAllowed);
  }, [trackingAllowed]);

  return null;
}
