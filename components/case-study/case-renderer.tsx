import Link from "next/link";

import { CaseStudyOpenedTracker } from "@/components/analytics/case-study-opened-tracker";
import {
  getAdjacentPublishedCase,
  type PublicCaseDetail,
} from "@/lib/cases/public-queries";

import { CaseHero } from "./case-hero";
import { CaseSection } from "./case-section";
import { NextCaseLink } from "./next-case-link";
import { SectionNav } from "./section-nav";

/**
 * The one reusable case-study renderer (product-requirements.md PUBLIC
 * WEBSITE: "Use one reusable dynamic case-study route and renderer. Do not
 * create a separate page component for every case.") — used for both a
 * normal published view and an admin draft preview.
 *
 * Case-study visual redesign: global header (rendered by the parent route
 * group's layout, unchanged) -> [sticky vertical nav rail | main content
 * column] two-column row at desktop, with the main content column holding
 * case hero -> sections -> bottom nav, in that order -> global footer
 * (also unchanged, from the layout). Below `lg`, SectionNav renders its
 * own full-width compact sticky horizontal bar instead (see
 * section-nav.tsx) and the outer wrapper below is a plain block container
 * (the `lg:grid` below only takes effect at `lg` and up), so the mobile
 * page structure is unchanged in kind from the previous milestone.
 *
 * max-w-[1680px] here is deliberate: the rail's 14rem column + gap-8 are
 * extra space, and the remaining content column (up to 1424px) lets a
 * section card that contains images grow to ~1400px (see case-section.tsx)
 * so case-study visuals are larger than the body-text column. The hero,
 * every section card and the bottom row share one width
 * (typography.ts CASE_CONTAINER_CLASS). CaseHero/CaseSection/the bottom-nav row below all keep
 * their own independent `mx-auto max-w-5xl px-4 sm:px-6`, untouched.
 */
export async function CaseRenderer({
  caseDetail,
  trackingAllowed,
}: {
  caseDetail: PublicCaseDetail;
  trackingAllowed: boolean;
}) {
  // Next case must always target another published case (approved decision
  // #9) — never computed, and never shown, while viewing a draft preview.
  const nextCase =
    caseDetail.status === "published"
      ? await getAdjacentPublishedCase(caseDetail.case_id)
      : null;

  // portfolio-tracking-spec.md §2: case_study_opened, case_section_viewed
  // and case_study_completed only ever fire for a published case, on top
  // of (not instead of) the trackingAllowed gate itself.
  const eventsEnabled = trackingAllowed && caseDetail.status === "published";

  return (
    <div className="mx-auto max-w-[1680px] lg:grid lg:grid-cols-[14rem_1fr] lg:items-start lg:gap-8">
      {/* Renders both the mobile sticky horizontal bar and the desktop
          sticky vertical rail (see section-nav.tsx) — only one is ever
          visible per viewport. At `lg`+, its rail half becomes this
          grid's first (14rem) column; its mobile-bar half has `lg:hidden`
          and so is excluded from grid placement entirely at that width. */}
      <SectionNav sections={caseDetail.sections} />

      <div className="min-w-0">
        <CaseHero caseDetail={caseDetail} />
        <CaseStudyOpenedTracker
          caseId={caseDetail.case_id}
          caseName={caseDetail.case_name}
          displayPosition={caseDetail.display_position}
          trackingAllowed={trackingAllowed}
          eventsEnabled={eventsEnabled}
        />

        {caseDetail.sections.map((section) => (
          <CaseSection
            key={section.section_id}
            section={section}
            caseId={caseDetail.case_id}
            completionSectionId={caseDetail.completion_section}
            trackingAllowed={trackingAllowed}
            eventsEnabled={eventsEnabled}
          />
        ))}

        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-10 sm:px-6">
          <Link
            href="/#case-studies"
            className="text-sm text-muted-foreground underline-offset-2 hover:underline"
          >
            ← Back to homepage
          </Link>
          {nextCase ? <NextCaseLink caseId={nextCase.case_id} /> : null}
        </div>
      </div>
    </div>
  );
}
