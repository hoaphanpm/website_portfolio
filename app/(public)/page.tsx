import type { Metadata } from "next";

import { AnalyticsInit } from "@/components/analytics/analytics-init";
import { PortfolioViewedTracker } from "@/components/analytics/portfolio-viewed-tracker";
import { ContactSection } from "@/components/home/contact-section";
import { Hero } from "@/components/home/hero";
import { HowIThink } from "@/components/home/how-i-think";
import { Journey } from "@/components/home/journey";
import { SelectedWork } from "@/components/home/selected-work";
import { Writing } from "@/components/home/writing";
import { computeTrackingAllowed } from "@/lib/analytics/gating";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.hero.subtext,
};

type HomePageProps = {
  searchParams: Promise<{ preview?: string }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { preview } = await searchParams;
  const isPreview = preview === "true";
  const trackingAllowed = await computeTrackingAllowed(isPreview);

  return (
    <>
      <AnalyticsInit trackingAllowed={trackingAllowed} />
      <PortfolioViewedTracker trackingAllowed={trackingAllowed} />
      <Hero trackingAllowed={trackingAllowed} />
      <SelectedWork />
      <HowIThink />
      <Journey />
      <Writing />
      <ContactSection trackingAllowed={trackingAllowed} />
    </>
  );
}
