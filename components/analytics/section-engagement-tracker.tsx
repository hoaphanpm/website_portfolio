"use client";

import { useEffect } from "react";

import {
  EVENT_NAMES,
  SECTION_ENGAGEMENT_IDLE_MS,
  SECTION_ENGAGEMENT_INTERACTION_THROTTLE_MS,
  SECTION_ENGAGEMENT_MIN_SEND_MS,
  SECTION_VIEW_VISIBILITY_RATIO,
} from "@/lib/analytics/constants";
import {
  SectionEngagement,
  type EngagementPayload,
} from "@/lib/analytics/section-engagement";
import { attemptTrackedEvent } from "@/lib/analytics/service";

type SectionEngagementTrackerProps = {
  caseId: string;
  /** Canonical section ids in page order; index = position + 1. */
  sectionIds: readonly string[];
  trackingAllowed: boolean;
  /** trackingAllowed && the page's events flag (computed by the caller). */
  eventsEnabled: boolean;
};

const THRESHOLDS = Array.from({ length: 21 }, (_, i) => i / 20);
const INTERACTION_EVENTS = [
  "scroll",
  "wheel",
  "keydown",
  "pointerdown",
  "pointermove",
  "touchstart",
] as const;

/**
 * Renders nothing. Measures active reading time per section of one case
 * page and sends case_section_engaged (see lib/analytics/section-engagement.ts
 * for the rules). Uses the sections' existing DOM ids; the section
 * components themselves are untouched.
 */
export function SectionEngagementTracker({
  caseId,
  sectionIds,
  trackingAllowed,
  eventsEnabled,
}: SectionEngagementTrackerProps) {
  useEffect(() => {
    if (!eventsEnabled) return;

    const elements = new Map<string, HTMLElement>();
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) elements.set(id, el);
    });
    if (elements.size === 0) return;

    const engagement = new SectionEngagement({
      idleMs: SECTION_ENGAGEMENT_IDLE_MS,
      minSendMs: SECTION_ENGAGEMENT_MIN_SEND_MS,
      sections: sectionIds.map((id, i) => ({ id, index: i + 1 })),
      now: Date.now(),
    });
    if (document.hidden) engagement.setPageVisible(false, Date.now());

    function send(payloads: EngagementPayload[], unloading = false) {
      for (const payload of payloads) {
        attemptTrackedEvent(
          trackingAllowed,
          EVENT_NAMES.CASE_SECTION_ENGAGED,
          { case_id: caseId, ...payload },
          { unloading },
        );
      }
    }

    const intersecting = new Set<string>();

    function report(id: string, el: HTMLElement) {
      const rect = el.getBoundingClientRect();
      const viewport = window.innerHeight;
      const visible = Math.max(
        0,
        Math.min(rect.bottom, viewport) - Math.max(rect.top, 0),
      );
      // Same 50%-of-section / 50%-of-viewport rule as section views.
      const eligible =
        rect.height > 0 &&
        viewport > 0 &&
        (visible / rect.height >= SECTION_VIEW_VISIBILITY_RATIO ||
          visible / viewport >= SECTION_VIEW_VISIBILITY_RATIO);
      send(engagement.setVisibility(id, visible, eligible, Date.now()));
    }

    function recompute() {
      elements.forEach((el, id) => {
        if (intersecting.has(id)) report(id, el);
      });
    }

    let rafId: number | null = null;
    function scheduleRecompute() {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        recompute();
      });
    }

    const idByElement = new Map<Element, string>();
    elements.forEach((el, id) => idByElement.set(el, id));
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = idByElement.get(entry.target);
          if (!id) continue;
          if (entry.isIntersecting) {
            intersecting.add(id);
            report(id, entry.target as HTMLElement);
          } else {
            intersecting.delete(id);
            send(engagement.setVisibility(id, 0, false, Date.now()));
          }
        }
      },
      { threshold: THRESHOLDS },
    );
    elements.forEach((el) => observer.observe(el));

    let lastInteractionAt = 0;
    function onInteraction() {
      const now = Date.now();
      if (now - lastInteractionAt < SECTION_ENGAGEMENT_INTERACTION_THROTTLE_MS) {
        return;
      }
      lastInteractionAt = now;
      engagement.interaction(now);
    }

    function onScroll() {
      onInteraction();
      scheduleRecompute();
    }

    function onVisibility() {
      if (document.hidden) {
        send(engagement.setPageVisible(false, Date.now()), true);
      } else {
        engagement.setPageVisible(true, Date.now());
        recompute();
      }
    }

    function onPageHide() {
      send(engagement.flushAll(Date.now()), true);
    }

    function onPageShow(event: PageTransitionEvent) {
      // Restored from the back/forward cache.
      if (event.persisted && !document.hidden) {
        engagement.setPageVisible(true, Date.now());
        recompute();
      }
    }

    INTERACTION_EVENTS.forEach((name) =>
      window.addEventListener(
        name,
        name === "scroll" ? onScroll : onInteraction,
        { passive: true },
      ),
    );
    window.addEventListener("resize", scheduleRecompute);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("pageshow", onPageShow);

    return () => {
      INTERACTION_EVENTS.forEach((name) =>
        window.removeEventListener(
          name,
          name === "scroll" ? onScroll : onInteraction,
        ),
      );
      window.removeEventListener("resize", scheduleRecompute);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("pageshow", onPageShow);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      observer.disconnect();
      // Leaving the case study (client navigation / unmount).
      send(engagement.flushAll(Date.now()));
    };
  }, [caseId, sectionIds, trackingAllowed, eventsEnabled]);

  return null;
}
