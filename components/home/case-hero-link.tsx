"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { markEntrySource } from "@/lib/analytics/entry-source";

/**
 * Makes a finalized case-study Hero a single clickable homepage entry.
 *
 * The Hero is rendered exactly as it is on its own page, but inside an
 * `inert` wrapper: its inner controls (e.g. the enlarge button) cannot be
 * focused or clicked here, so the one overlay <Link> is the only interactive
 * element — no nested interactive elements, and one tab stop per case study.
 * The Hero's visible text is hidden from assistive tech inside the wrapper
 * and the link carries the accessible name instead.
 *
 * Entry-source tracking is unchanged: the click only writes the one-time
 * sessionStorage marker; `case_study_opened` fires from the destination page.
 */
export function CaseHeroLink({
  href,
  caseId,
  label,
  children,
}: {
  href: string;
  caseId: string;
  /** Accessible name for the link (the case-study title). */
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="group relative">
      <div inert aria-hidden="true">
        {children}
        <p className="mt-3 text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
          Explore case →
        </p>
      </div>
      <Link
        href={href}
        aria-label={`${label} — read the case study`}
        onClick={() => markEntrySource("homepage", caseId)}
        className="absolute inset-0 rounded-3xl ring-1 ring-transparent transition group-hover:ring-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
    </div>
  );
}
