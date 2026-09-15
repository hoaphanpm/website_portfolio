"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/analytics/service";

type AnalyticsInitProps = {
  /**
   * The server-computed three-layer gate result (VERCEL_ENV === production,
   * not an admin session, not a preview request) — see lib/analytics/gating.ts.
   * This is authoritative; the check below is defense-in-depth only.
   */
  trackingAllowed: boolean;
};

/**
 * Mounted on the homepage and case-study pages (Milestone 8 decision #1).
 * Renders nothing. If the server-computed gate allows tracking, re-checks
 * two client-observable signals the server can't fully rule out on its own
 * — a non-localhost hostname, and no ?preview=true query param — before
 * calling initAnalytics(). This is belt-and-suspenders only: the server
 * gate in lib/analytics/gating.ts is the authoritative check.
 */
export function AnalyticsInit({ trackingAllowed }: AnalyticsInitProps) {
  useEffect(() => {
    if (!trackingAllowed) return;

    const { hostname } = window.location;
    if (hostname === "localhost" || hostname === "127.0.0.1") return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("preview") === "true") return;

    initAnalytics();
  }, [trackingAllowed]);

  return null;
}
