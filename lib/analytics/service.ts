import mixpanel from "mixpanel-browser";
import { getDeviceType } from "@/lib/analytics/device";
import { captureLandingUtm } from "@/lib/analytics/utm";
import type { EventName } from "@/lib/analytics/constants";

/**
 * Low-level analytics service — portfolio-tracking-spec.md §3 ("central
 * trackEvent wrapper") and §8 (session UTM as super properties, first-touch
 * UTM via people.set_once). This is the ONLY module in the app allowed to
 * call mixpanel.init/track/register/people.set_once — nothing else may
 * import "mixpanel-browser" directly.
 *
 * No event is wired to any user action yet — that's Milestone 9. This
 * module only provides initAnalytics() (called once, from the gated
 * <AnalyticsInit> bootstrap) and trackEvent() (unused until Milestone 9
 * wires it to real interactions).
 */

let initialized = false;

export function initAnalytics(): void {
  if (initialized) return;

  const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
  if (!token) {
    // No token configured — analytics stays disabled. Never throw, never
    // warn loudly; a missing public env var must never break the site.
    return;
  }

  try {
    mixpanel.init(token, {
      autocapture: false,
      persistence: "localStorage",
    });
  } catch {
    // A blocked script, ad-blocker, or malformed token must never crash
    // the page. Leave `initialized` false so trackEvent() stays a no-op.
    return;
  }

  initialized = true;

  const utm = captureLandingUtm();

  // Session-scoped: attached to every event for the rest of this browser
  // session via Mixpanel's own super-property persistence.
  if (Object.keys(utm).length > 0) {
    try {
      mixpanel.register(utm);
    } catch {
      // Non-fatal — events will simply lack UTM super properties.
    }

    // Anonymous first-touch UTA — set_once() never overwrites a value
    // already recorded for this distinct_id on an earlier visit. No PII,
    // no mixpanel.identify() call anywhere in this app.
    try {
      mixpanel.people.set_once(utm);
    } catch {
      // Non-fatal.
    }
  }
}

export function trackEvent(
  eventName: EventName,
  properties: Record<string, unknown> = {},
): void {
  if (!initialized) {
    return;
  }

  const payload = {
    ...properties,
    device_type: getDeviceType(),
  };

  try {
    mixpanel.track(eventName, payload);
  } catch {
    // Never let a tracking failure affect the page.
  }

  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", eventName, payload);
  }
}
