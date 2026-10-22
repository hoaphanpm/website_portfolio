"use client";

import { useCallback, useRef, type ReactNode } from "react";

import { EVENT_NAMES } from "@/lib/analytics/constants";
import {
  DEDUP_KEYS,
  hasTrackedOnce,
  markTrackedOnce,
} from "@/lib/analytics/dedup";
import { attemptTrackedEvent } from "@/lib/analytics/service";
import { useSectionViewTracking } from "@/lib/analytics/use-section-view";
import { cn } from "@/lib/utils";

import type { MomoSectionId } from "./momo-config";

type MomoSectionProps = {
  sectionId: MomoSectionId;
  /** 1-based, from the fixed SECTION_IDS order. */
  sectionIndex: number;
  title: string;
  blurb: string;
  caseId: string;
  completionSectionId: string;
  trackingAllowed: boolean;
  /** trackingAllowed && MOMO_V2_EVENTS_ENABLED (computed by the caller). */
  eventsEnabled: boolean;
  /** Full-width module: heading above, content below, at every width. */
  wide?: boolean;
  children: ReactNode;
};

/**
 * One <section id> per fixed section id, with the same section-view
 * qualification and completion chain as components/case-study/case-section.tsx
 * (same hook, same dedup keys, same three existing event names and
 * properties — nothing new is sent). Duplicated rather than extracted so the
 * CMS component stays untouched. Left column: number, title, blurb; right
 * column: the section's visual module.
 */
export function MomoSection({
  sectionId,
  sectionIndex,
  title,
  blurb,
  caseId,
  completionSectionId,
  trackingAllowed,
  eventsEnabled,
  wide = false,
  children,
}: MomoSectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const dedupKey = DEDUP_KEYS.caseSectionViewed(caseId, sectionId);

  const handleQualify = useCallback(() => {
    if (hasTrackedOnce(dedupKey)) return;

    const sent = attemptTrackedEvent(
      trackingAllowed,
      EVENT_NAMES.CASE_SECTION_VIEWED,
      { case_id: caseId, section_id: sectionId, section_index: sectionIndex },
    );
    if (!sent) return;
    markTrackedOnce(dedupKey);

    if (sectionId === completionSectionId) {
      attemptTrackedEvent(trackingAllowed, EVENT_NAMES.CASE_STUDY_COMPLETED, {
        case_id: caseId,
      });
    }
  }, [caseId, completionSectionId, dedupKey, sectionId, sectionIndex, trackingAllowed]);

  const enabled = eventsEnabled && !hasTrackedOnce(dedupKey);
  useSectionViewTracking(ref, { enabled, onQualify: handleQualify });

  return (
    <section
      ref={ref}
      id={sectionId}
      aria-labelledby={`${sectionId}-title`}
      className={cn(
        "scroll-mt-20 border-t border-white/10 py-8",
        !wide && "lg:grid lg:grid-cols-[15rem_1fr] lg:gap-8",
      )}
    >
      <div
        className={cn(
          "mb-5 flex items-start gap-3",
          !wide && "lg:mb-0 lg:block",
        )}
      >
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e6007e]/20 text-sm font-bold text-[#ff4fa8]">
          {String(sectionIndex).padStart(2, "0")}
        </span>
        <div className={cn(!wide && "lg:mt-3", wide && "max-w-3xl")}>
          <h2 id={`${sectionId}-title`} className="text-xl font-bold text-[#ebe7ef]">
            {title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-white/62">{blurb}</p>
        </div>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}
