import Link from "next/link";

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
}: {
  caseDetail: PublicCaseDetail;
}) {
  // Next case must always target another published case (approved decision
  // #9) — never computed, and never shown, while viewing a draft preview.
  const nextCase =
    caseDetail.status === "published"
      ? await getAdjacentPublishedCase(caseDetail.case_id)
      : null;

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
      <SectionNav sections={caseDetail.sections} />

      {caseDetail.sections.map((section) => (
        <CaseSection key={section.section_id} section={section} />
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
