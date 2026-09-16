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
    <div>
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
        <Link
          href="/#case-studies"
          className="text-sm text-muted-foreground underline-offset-2 hover:underline"
        >
          ← Back to homepage
        </Link>
      </div>

      <CaseHero caseDetail={caseDetail} />
      <CaseStudyOpenedTracker
        caseId={caseDetail.case_id}
        caseName={caseDetail.case_name}
        displayPosition={caseDetail.display_position}
        trackingAllowed={trackingAllowed}
        eventsEnabled={eventsEnabled}
      />
      <SectionNav sections={caseDetail.sections} />

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

      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-10 sm:px-6">
        <Link
          href="/#case-studies"
          className="text-sm text-muted-foreground underline-offset-2 hover:underline"
        >
          ← Back to homepage
        </Link>
        {nextCase ? <NextCaseLink caseId={nextCase.case_id} /> : null}
      </div>
    </div>
  );
}
