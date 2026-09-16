"use client";

import { useEffect } from "react";
import { EVENT_NAMES } from "@/lib/analytics/constants";
import { DEDUP_KEYS, hasTrackedOnce, markTrackedOnce } from "@/lib/analytics/dedup";
import { attemptTrackedEvent } from "@/lib/analytics/service";

/**
 * Mounted once on the homepage (app/(public)/page.tsx). Fires
 * portfolio_viewed with no manual properties — device_type is auto-attached
 * by trackEvent(), and session UTM (if any) is already registered as
 * Mixpanel super properties by initAnalytics(), so it's automatically
 * merged into this event too. Renders nothing.
 */
export function PortfolioViewedTracker({
  trackingAllowed,
}: {
  trackingAllowed: boolean;
}) {
  useEffect(() => {
    const key = DEDUP_KEYS.portfolioViewed();
    if (hasTrackedOnce(key)) return;

    const sent = attemptTrackedEvent(
      trackingAllowed,
      EVENT_NAMES.PORTFOLIO_VIEWED,
      {},
    );
    if (sent) markTrackedOnce(key);
  }, [trackingAllowed]);

  return null;
}
