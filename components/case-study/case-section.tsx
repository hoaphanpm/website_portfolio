"use client";

import { useCallback, useRef } from "react";
import { EVENT_NAMES } from "@/lib/analytics/constants";
import { DEDUP_KEYS, hasTrackedOnce, markTrackedOnce } from "@/lib/analytics/dedup";
import { attemptTrackedEvent } from "@/lib/analytics/service";
import { useSectionViewTracking } from "@/lib/analytics/use-section-view";
import { PUBLIC_SECTION_LABELS } from "@/lib/cases/public-labels";
import type { PublicCaseSection } from "@/lib/cases/public-queries";
import { cn } from "@/lib/utils";

import { SectionMedia } from "./section-media";
import {
  CASE_BODY_SIZE_CLASS,
  CASE_BODY_TEXT_CLASS,
  CASE_CONTAINER_CLASS,
} from "./typography";

type CaseSectionProps = {
  section: PublicCaseSection;
  caseId: string;
  completionSectionId: string | null;
  trackingAllowed: boolean;
  /** trackingAllowed && case status === "published" (checked by the caller). */
  eventsEnabled: boolean;
};

/**
 * Renders exactly what the admin captured per section — a public title,
 * the admin's own content.heading, content.body, and (case-study redesign
 * milestone) this section's ordered images via the shared SectionMedia
 * renderer. No richer per-type layout (stat grids, option cards, step
 * flows) is fabricated; that structured data was never collected, only
 * heading/body/images. Every section card shares one identical base
 * background/border/hover treatment — no section type (Decision, Insight,
 * or any other) gets a permanently different card background; only
 * Insight's body copy keeps its own distinct blockquote/callout styling.
 *
 * Visual-layout correction milestone: fixed DOM/visual order for every
 * section — number -> heading (public label + the admin's own
 * content.heading, both "heading" content) -> image(s) -> body. The
 * previous side-by-side (text-left, small-image-right) treatment is gone;
 * a section's images always sit between its heading and its body text,
 * never beside it, and never smaller than the media renderer's own
 * prominent sizing. Experience keeps its image-dominant treatment (short
 * body, no repeated Solution copy) but follows the same fixed order.
 * Sections with zero images render heading -> body with no gallery
 * wrapper at all (SectionMedia already returns null for an empty array).
 *
 * Milestone 9 analytics — UNCHANGED: still hosts the section-view
 * IntersectionObserver via useSectionViewTracking, one instance per
 * rendered section, keyed on this exact section.section_id /
 * section.section_index. The Case Hero is a separate component and is
 * never wrapped by this hook.
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

  const isInsight = section.section_id === "insight";
  const isExperience = section.section_id === "experience";
  const isReflection = section.section_id === "reflection";
  const images = section.images;

  return (
    <section
      ref={ref}
      id={section.section_id}
      // Same outer width for every section (with or without images) and
      // the hero; body copy keeps its readable column inside the card.
      className={cn(CASE_CONTAINER_CLASS, "scroll-mt-24 py-6")}
    >
      {/* Root-cause fix: no section type gets a permanently different
          background any more (this is what made Product Decision look
          "stuck" brighter than every other section — a hard-coded
          isDecision/isInsight background ternary, unconditional). Every
          card now shares the exact same base treatment (bg-card,
          border-border) and the exact same restrained hover/focus-within
          brightening — never tied to section type, only to the reader's
          own mouse/keyboard interaction with THAT card. */}
      <div className="rounded-lg border border-border bg-card p-6 transition-colors duration-150 hover:border-muted-foreground/50 hover:bg-secondary/60 focus-within:border-muted-foreground/50 focus-within:bg-secondary/60">
        {/* 1. + 2. one inline heading row: "01. At a Glance" — the number
            stays visually secondary (smaller, muted) but is part of the
            same <h2>, so the section name is never rendered a second time
            elsewhere and heading semantics stay correct (one h2 per
            section, same as before). */}
        <h2 className="flex flex-wrap items-baseline gap-x-2 text-xl font-bold text-foreground sm:text-2xl lg:text-3xl">
          {/* Same size/weight as the title (same baseline); only the color
              is lower-emphasis. */}
          <span className="text-muted-foreground">
            {String(section.section_index).padStart(2, "0")}.
          </span>
          <span>{PUBLIC_SECTION_LABELS[section.section_id]}</span>
        </h2>
        {heading ? (
          // Same size/line-height/family as the body copy; only weight
          // (and full-strength color) distinguish it. h2 is unchanged.
          <h3
            className={`mt-3 font-semibold text-foreground ${CASE_BODY_SIZE_CLASS}`}
          >
            {heading}
          </h3>
        ) : null}

        {/* 3. image(s) — always between the heading and the body, never
            beside either. SectionMedia renders nothing (no wrapper) when
            this section has no images. */}
        <SectionMedia images={images} variant={isExperience ? "experience" : "default"} />

        {/* 4. body — never before or beside the media. Every section's
            plain-paragraph body (Experience included) shares the exact
            same BODY_TEXT_CLASS — same size/line-height/weight/color,
            same justified alignment. Insight's blockquote is an
            intentionally-styled italic callout (justified like the rest, kept
            at its own narrower measure). */}
        {body ? (
          isInsight ? (
            <blockquote
              className={`mt-4 max-w-prose whitespace-pre-line text-justify [text-justify:inter-word] [overflow-wrap:anywhere] italic text-body-foreground ${CASE_BODY_SIZE_CLASS}`}
            >
              &ldquo;{body}&rdquo;
            </blockquote>
          ) : (
            <p
              className={cn(
                "mt-4",
                CASE_BODY_TEXT_CLASS,
                // Keyed on the stable section_id, not the visible number
                // or heading text.
                isReflection && "italic",
              )}
            >
              {body}
            </p>
          )
        ) : null}
      </div>
    </section>
  );
}
