"use client";

import { useCallback, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import { EVENT_NAMES } from "@/lib/analytics/constants";
import { DEDUP_KEYS, hasTrackedOnce, markTrackedOnce } from "@/lib/analytics/dedup";
import { attemptTrackedEvent } from "@/lib/analytics/service";
import { useSectionViewTracking } from "@/lib/analytics/use-section-view";

type VpbankSectionProps = {
  sectionId: string;
  /** 1-based, from the fixed nine-section order. */
  sectionIndex: number;
  /** Visible section name (page-local). */
  label: string;
  /** Approved short body text for the introduction column. */
  intro: string;
  caseId: string;
  completionSectionId: string;
  trackingAllowed: boolean;
  /** trackingAllowed && VPBANK_EVENTS_ENABLED (computed by the caller). */
  eventsEnabled: boolean;
  children: ReactNode;
};

/**
 * One <section id> per fixed section id with the same section-view
 * qualification and completion chain as the CMS CaseSection (same hook,
 * dedup keys and existing event names/properties — nothing new is sent).
 * Left gutter: number + section name; right: heading, lede, module.
 */
export function VpbankSection({
  sectionId,
  sectionIndex,
  label,
  intro,
  caseId,
  completionSectionId,
  trackingAllowed,
  eventsEnabled,
  children,
}: VpbankSectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const dedupKey = DEDUP_KEYS.caseSectionViewed(caseId, sectionId);

  const handleQualify = useCallback(() => {
    if (hasTrackedOnce(dedupKey)) return;

    const sent = attemptTrackedEvent(trackingAllowed, EVENT_NAMES.CASE_SECTION_VIEWED, {
      case_id: caseId,
      section_id: sectionId,
      section_index: sectionIndex,
    });
    if (!sent) return;
    markTrackedOnce(dedupKey);

    if (sectionId === completionSectionId) {
      attemptTrackedEvent(trackingAllowed, EVENT_NAMES.CASE_STUDY_COMPLETED, { case_id: caseId });
    }
  }, [caseId, completionSectionId, dedupKey, sectionId, sectionIndex, trackingAllowed]);

  const enabled = eventsEnabled && !hasTrackedOnce(dedupKey);
  useSectionViewTracking(ref, { enabled, onQualify: handleQualify });

  return (
    <section
      ref={ref}
      id={sectionId}
      aria-labelledby={`${sectionId}-title`}
      className="scroll-mt-20 border-t border-white/10 py-8 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-8"
    >
      <div className="mb-5 flex items-start gap-3 lg:mb-0 lg:block">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-sm font-bold text-[#f3f5f8]">
          {String(sectionIndex).padStart(2, "0")}
        </span>
        <div className="lg:mt-3">
          <h2 id={`${sectionId}-title`} className="text-xl font-bold text-[#f3f5f8]">
            {label}
          </h2>
          {intro ? <p className={cn("mt-2 text-sm leading-relaxed text-white/62", sectionId === "reflection" && "italic")}>{intro}</p> : null}
        </div>
      </div>
      <div className="@container min-w-0">{children}</div>
    </section>
  );
}
