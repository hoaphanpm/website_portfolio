import type { Metadata } from "next";

import { AnalyticsInit } from "@/components/analytics/analytics-init";
import { MomoCaseStudy } from "@/components/case-study/momo/momo-case-study";
import { computeTrackingAllowed } from "@/lib/analytics/gating";

type PageProps = {
  searchParams: Promise<{ preview?: string }>;
};

// Unlisted until approved for publication: never indexed.
export const metadata: Metadata = {
  title: "Turning Payday Cash-Out Into a First Savings Habit",
  description:
    "A nine-week pilot proposal to turn MoMo's payday cash-out behavior into a first savings habit. Proposed strategy — not tested.",
  robots: { index: false, follow: false },
};

/**
 * Custom-coded MoMo case study, coexisting with the CMS-driven
 * /work/[case_id] route (unchanged). Uses the same three-layer tracking
 * gate (production env, no admin session, no ?preview=true).
 */
export default async function MomoSalaryV2Page({ searchParams }: PageProps) {
  const { preview } = await searchParams;
  const trackingAllowed = await computeTrackingAllowed(preview === "true");

  return (
    <>
      <AnalyticsInit trackingAllowed={trackingAllowed} />
      <MomoCaseStudy trackingAllowed={trackingAllowed} />
    </>
  );
}
