import type { Metadata } from "next";

import { ContactSection } from "@/components/home/contact-section";
import { Hero } from "@/components/home/hero";
import { HowIThink } from "@/components/home/how-i-think";
import { Journey } from "@/components/home/journey";
import { SelectedWork } from "@/components/home/selected-work";
import { Writing } from "@/components/home/writing";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.hero.subtext,
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <SelectedWork />
      <HowIThink />
      <Journey />
      <Writing />
      <ContactSection />
    </>
  );
}
