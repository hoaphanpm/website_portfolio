"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PUBLIC_SECTION_LABELS } from "@/lib/cases/public-labels";
import type { PublicCaseSection } from "@/lib/cases/public-queries";
import { cn } from "@/lib/utils";

/**
 * Case-study visual redesign: one component, one shared active-section
 * IntersectionObserver, rendering TWO layouts from the same `sections` +
 * `activeId` state — a sticky vertical rail on the left at desktop/large-
 * tablet widths (design-reference.png's numbered-list structure, adapted
 * to the site's dark palette), and the previous compact sticky horizontal
 * scrollable row below `lg`. Only one is ever visible at a time (CSS
 * `hidden`/`lg:hidden`/`lg:flex`) — there is deliberately only ONE
 * IntersectionObserver instance backing both, never two competing ones.
 *
 * Built dynamically from `sections` (already only the sections this case
 * actually has, in stored section_index order) — never a hard-coded 9,
 * never a fabricated entry.
 *
 * Global header (components/site/navbar.tsx) is not itself sticky, so
 * neither layout below ever overlaps it — both only begin sticking once
 * the header has already scrolled out of view. The rail's sticky
 * containing block is this component's own position in the two-column
 * row (see case-renderer.tsx), which ends exactly where the main content
 * column ends — before the page footer — so it can never cover the
 * footer or the bottom nav either.
 *
 * Smooth scrolling + prefers-reduced-motion is handled with plain CSS
 * (`scroll-behavior` in app/globals.css), not JS here. Anchor targets use
 * `scroll-mt-24` (case-section.tsx) to clear the mobile sticky bar.
 */
export function SectionNav({ sections }: { sections: PublicCaseSection[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (sections.length === 0) return;

    const elements = sections
      .map((s) => document.getElementById(s.section_id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (visible.length === 0) return;
        const topmost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b,
        );
        setActiveId(topmost.target.id);
      },
      // "Upper-middle reading area" band: a section counts as active once
      // it's past the top 15% of the viewport and before it's 70% of the
      // way scrolled through — a normal scroll-spy band, not tied to the
      // 50%/2s analytics qualification rule (a separate, untouched
      // concern in use-section-view.ts).
      { rootMargin: "-15% 0px -70% 0px", threshold: [0, 1] },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  const backLink = (
    <Link
      href="/#case-studies"
      className="text-sm text-muted-foreground underline-offset-2 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      ← Back to homepage
    </Link>
  );

  return (
    <>
      {/* Mobile / narrow tablet (< lg): compact sticky horizontal
          scrollable row, unchanged in kind from the previous milestone,
          now showing each item's public section name alongside its
          number (not just the bare number). overflow-x-auto is scoped to
          the <ul> itself, never the page, so it can't cause page-level
          horizontal overflow; no flex-wrap, so it never breaks into
          multiple rows. */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <div className="shrink-0">{backLink}</div>

          {sections.length > 0 ? (
            <nav aria-label="Case sections" className="min-w-0">
              <ul className="flex gap-2 overflow-x-auto py-0.5">
                {sections.map((section) => {
                  const isActive = section.section_id === activeId;
                  const number = String(section.section_index).padStart(2, "0");
                  const label = PUBLIC_SECTION_LABELS[section.section_id];
                  return (
                    <li key={section.section_id} className="shrink-0">
                      <a
                        href={`#${section.section_id}`}
                        aria-current={isActive ? "true" : undefined}
                        aria-label={`Go to section ${number}: ${label}`}
                        className={cn(
                          "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isActive
                            ? "border-foreground/60 bg-secondary font-semibold text-foreground"
                            : "border-border font-medium text-muted-foreground hover:border-muted-foreground hover:text-foreground",
                        )}
                      >
                        <span className="text-muted-foreground">{number}</span>
                        <span>{label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          ) : null}
        </div>
      </div>

      {/* Desktop / large tablet (>= lg): sticky vertical rail, connected
          by a subtle vertical line (the <ol>'s left border), with each
          item's own left-border segment brightening when active —
          exactly one item can be active at a time, and that state is
          never color-only: it also carries a bolder font weight and a
          brighter border segment (two extra cues alongside color). */}
      <nav
        aria-label="Case sections"
        className="sticky top-6 hidden self-start pb-6 lg:block"
      >
        <div className="pl-4 sm:pl-6">{backLink}</div>

        {sections.length > 0 ? (
          <ol className="mt-6 space-y-0.5 border-l border-border pl-4 sm:pl-6">
            {sections.map((section) => {
              const isActive = section.section_id === activeId;
              const number = String(section.section_index).padStart(2, "0");
              const label = PUBLIC_SECTION_LABELS[section.section_id];
              return (
                <li key={section.section_id} className="-ml-px">
                  <a
                    href={`#${section.section_id}`}
                    aria-current={isActive ? "true" : undefined}
                    aria-label={`Go to section ${number}: ${label}`}
                    className={cn(
                      "flex items-baseline gap-2 border-l-2 py-1.5 pl-3 pr-2 text-sm leading-snug transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive
                        ? "border-foreground font-semibold text-foreground"
                        : "border-transparent font-medium text-muted-foreground hover:border-muted-foreground/60 hover:text-foreground",
                    )}
                  >
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {number}
                    </span>
                    <span>{label}</span>
                  </a>
                </li>
              );
            })}
          </ol>
        ) : null}
      </nav>
    </>
  );
}
