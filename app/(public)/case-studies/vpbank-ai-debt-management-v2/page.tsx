import type { Metadata } from "next";

import { AnalyticsInit } from "@/components/analytics/analytics-init";
import { VpbankCaseStudy } from "@/components/case-study/vpbank/vpbank-case-study";
import { heroImage } from "@/components/case-study/vpbank/vpbank-content";
import { computeTrackingAllowed } from "@/lib/analytics/gating";
import { SITE_NAME } from "@/lib/seo";

type PageProps = {
  searchParams: Promise<{ preview?: string }>;
};

const TITLE = "Protect Loan Portfolio Quality by Preventing Missed Payments";
const DESCRIPTION =
  "To reduce repayment risk and protect loan portfolio quality, I proposed a two-phase product strategy to help multi-loan customers first manage repayment risks, then prevent future missed payments.";
const PATH = "/case-studies/vpbank-ai-debt-management-v2";

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
    images: [
      {
        url: heroImage.src,
        width: heroImage.width,
        height: heroImage.height,
        alt: heroImage.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [heroImage.src],
  },
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
