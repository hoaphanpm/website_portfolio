import type { Metadata } from "next";

import { AnalyticsInit } from "@/components/analytics/analytics-init";
import { VpbankCaseStudy } from "@/components/case-study/vpbank/vpbank-case-study";
import { computeTrackingAllowed } from "@/lib/analytics/gating";

type PageProps = {
  searchParams: Promise<{ preview?: string }>;
};

// Unlisted during development: never indexed.
export const metadata: Metadata = {
  title: "VPBank - AI-Assisted Debt Management",
  description:
    "A two-phase product strategy to help multi-loan customers first control repayment risk, then prevent it earlier.",
  robots: { index: false, follow: false },
};

/**
 * Static VPBank case study, coexisting with the CMS-driven /work/[case_id]
 * route (unchanged). Same three-layer tracking gate as the MoMo page.
 */
export default async function VpbankAiDebtManagementV2Page({ searchParams }: PageProps) {
  const { preview } = await searchParams;
  const trackingAllowed = await computeTrackingAllowed(preview === "true");

  return (
    <>
      <AnalyticsInit trackingAllowed={trackingAllowed} />
      <VpbankCaseStudy trackingAllowed={trackingAllowed} />
    </>
  );
}
