"use client";

import { useCallback, useRef } from "react";
import { EVENT_NAMES } from "@/lib/analytics/constants";
import { DEDUP_KEYS, hasTrackedOnce, markTrackedOnce } from "@/lib/analytics/dedup";
import { attemptTrackedEvent } from "@/lib/analytics/service";
import { useSectionViewTracking } from "@/lib/analytics/use-section-view";
import { PUBLIC_SECTION_LABELS } from "@/lib/cases/public-labels";
import type { PublicCaseSection } from "@/lib/cases/public-queries";
import { cn } from "@/lib/utils";

type CaseSectionProps = {
  section: PublicCaseSection;
  caseId: string;
  completionSectionId: string | null;
  trackingAllowed: boolean;
  /** trackingAllowed && case status === "published" (checked by the caller). */
  eventsEnabled: boolean;
};

/**
 * Renders exactly what Milestone 3 captures per section — a public title,
 * the admin's own content.heading, and content.body. No richer per-type
 * layout (stat grids, option cards, step flows) is fabricated; that data
 * was never collected. Decision and Insight get subtle CSS-only accents
 * (approved decision #3); every other section is visually uniform.
 *
 * Milestone 9: also hosts the section-view IntersectionObserver via
 * useSectionViewTracking — one instance per rendered section. The Case
 * Hero (case-hero.tsx) is a separate component and is never wrapped by
 * this hook, matching the spec's "Case Hero isn't observed at all".
 */
export function CaseSection({
  section,
  caseId,
  completionSectionId,
  trackingAllowed,
  eventsEnabled,
}: CaseSectionProps) {
  const ref = useRef<HTMLElement | null>(null);
  const dedupKey = DEDUP_KEYS.caseSectionViewed(caseId, section.section_id);

  const handleQualify = useCallback(() => {
    // Final, right-before-fire re-check (spec §5 step 3), in addition to
    // the `enabled` computation below that decided whether to even observe.
    if (hasTrackedOnce(dedupKey)) return;

    const sent = attemptTrackedEvent(
      trackingAllowed,
      EVENT_NAMES.CASE_SECTION_VIEWED,
      {
        case_id: caseId,
        section_id: section.section_id,
        section_index: section.section_index,
      },
    );
    if (!sent) return;
    markTrackedOnce(dedupKey);

    // case_study_completed fires only immediately after the qualifying
    // completion_section successfully triggers case_section_viewed — never
    // on its own, never deduplicated separately (spec §6 / §2).
    if (completionSectionId && section.section_id === completionSectionId) {
      attemptTrackedEvent(trackingAllowed, EVENT_NAMES.CASE_STUDY_COMPLETED, {
        case_id: caseId,
      });
    }
  }, [
    caseId,
    completionSectionId,
    dedupKey,
    section.section_id,
    section.section_index,
    trackingAllowed,
  ]);

  const enabled = eventsEnabled && !hasTrackedOnce(dedupKey);
  useSectionViewTracking(ref, { enabled, onQualify: handleQualify });

  const heading =
    typeof section.content.heading === "string" ? section.content.heading : "";
  const body =
    typeof section.content.body === "string" ? section.content.body : "";

  const isDecision = section.section_id === "decision";
  const isInsight = section.section_id === "insight";

  return (
    <section
      ref={ref}
      id={section.section_id}
      className="mx-auto max-w-5xl scroll-mt-20 px-4 py-6 sm:px-6"
    >
      <div
        className={cn(
          "rounded-lg border p-6",
          isDecision
            ? "border-primary/40 bg-secondary/40"
            : isInsight
              ? "border-border bg-secondary/20"
              : "border-border",
        )}
      >
        <p className="text-sm font-medium text-muted-foreground">
          {String(section.section_index).padStart(2, "0")}
        </p>
        <h2 className="mt-1 text-xl font-semibold">
          {PUBLIC_SECTION_LABELS[section.section_id]}
        </h2>
        {heading ? <h3 className="mt-3 font-medium">{heading}</h3> : null}
        {body ? (
          isInsight ? (
            <blockquote className="mt-3 whitespace-pre-line italic text-muted-foreground">
              &ldquo;{body}&rdquo;
            </blockquote>
          ) : (
            <p className="mt-3 whitespace-pre-line text-muted-foreground">
              {body}
            </p>
          )
        ) : null}
      </div>
    </section>
  );
}
