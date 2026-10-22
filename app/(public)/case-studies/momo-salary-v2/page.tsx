import type { Metadata } from "next";

import { AnalyticsInit } from "@/components/analytics/analytics-init";
import { MomoCaseStudy } from "@/components/case-study/momo/momo-case-study";
import { computeTrackingAllowed } from "@/lib/analytics/gating";
import { SITE_NAME } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ preview?: string }>;
};

const TITLE = "Unlock Financial-Services Revenue Growth from MoMo's Existing Users";
const DESCRIPTION =
  "A nine-week pilot proposal to turn MoMo's payday cash-out behavior into a first savings habit. Proposed strategy — not tested.";
const PATH = "/case-studies/momo-salary-v2";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PATH,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
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
