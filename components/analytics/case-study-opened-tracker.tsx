"use client";

import { useEffect } from "react";
import { EVENT_NAMES } from "@/lib/analytics/constants";
import { DEDUP_KEYS, hasTrackedOnce, markTrackedOnce } from "@/lib/analytics/dedup";
import { consumeEntrySource } from "@/lib/analytics/entry-source";
import { attemptTrackedEvent } from "@/lib/analytics/service";

type CaseStudyOpenedTrackerProps = {
  caseId: string;
  caseName: string;
  displayPosition: number;
  trackingAllowed: boolean;
  /** trackingAllowed && case status === "published" (checked by the caller). */
  eventsEnabled: boolean;
};

/**
 * Mounted once per case-page load (components/case-study/case-renderer.tsx).
 * Renders nothing. Always consumes the entry_source marker on mount, even
 * when the event below ends up deduplicated, so a stale marker can never
 * leak into a later, unrelated case open (architecture.md §5 point 4).
 */
export function CaseStudyOpenedTracker({
  caseId,
  caseName,
  displayPosition,
  trackingAllowed,
  eventsEnabled,
}: CaseStudyOpenedTrackerProps) {
  useEffect(() => {
    const entrySource = consumeEntrySource(caseId);

    if (!eventsEnabled) return;

    const key = DEDUP_KEYS.caseStudyOpened(caseId);
    if (hasTrackedOnce(key)) return;

    const sent = attemptTrackedEvent(
      trackingAllowed,
      EVENT_NAMES.CASE_STUDY_OPENED,
      {
        case_id: caseId,
        case_name: caseName,
        entry_source: entrySource,
        display_position: displayPosition,
      },
    );
    if (sent) markTrackedOnce(key);
  }, [caseId, caseName, displayPosition, trackingAllowed, eventsEnabled]);

  return null;
}
