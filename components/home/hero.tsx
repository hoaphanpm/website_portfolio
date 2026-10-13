import Image from "next/image";

import { HighIntentLink } from "@/components/analytics/high-intent-link";
import { LinkedInIcon, MailIcon, SubstackIcon } from "@/components/icons";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

import heroPortrait from "./hero-portrait.png";

// Milestone 11 Phase B follow-up: sized to body-text level (not caption
// text) and brighter than the previously-used muted-foreground, with a
// hover accent sampled directly from the HP logo mark (app/icon.png) — a
// restrained tie to the existing brand identity rather than the reference
// site's green. Focus is still a shape (ring), not color alone.
const socialLinkClassName =
  "inline-flex items-center gap-2 text-base text-foreground/70 transition-colors hover:text-[#49a8da] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm";

export function Hero({ trackingAllowed }: { trackingAllowed: boolean }) {
  const { linkedinUrl, substackUrl, email } = siteConfig.social;

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
        {/* Square container reserves the exact rendered footprint before
            the image loads (no CLS); rounded-full + overflow-hidden does
            the circular clip, object-cover fills it without stretching.
            No border/ring/background here — see the portrait's own
            comment below for why. */}
        <div className="relative h-[176px] w-[176px] shrink-0 overflow-hidden rounded-full sm:h-[224px] sm:w-[224px]">
          <Image
            src={heroPortrait}
            alt="Hoa Phan — Product Manager"
            fill
            sizes="(min-width: 640px) 224px, 176px"
            priority
            // The source has a few px of near-white margin around its own
            // circular crop (both axes), which showed through the CSS
            // circle as a thin white ring. A small controlled scale (not
            // a border/background) zooms just past that margin so only
            // photo content reaches the clipped edge, per the approved
            // fix — no source-file edit needed.
            className="scale-[1.08] object-cover"
          />
        </div>

        <div>
          {/* Milestone 11 Phase B follow-up: the name is now the Hero's
              primary, most immediately recognizable content — the single
              h1 on the page. The positioning statement (previously the
              h1) drops to h2, secondary to the name but still a real
              heading, preserving a clean semantic outline. */}
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            {siteConfig.name}
          </h1>
          <h2 className="mt-3 max-w-2xl text-xl font-medium text-foreground/80 sm:text-2xl">
            {siteConfig.hero.headline}
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            {siteConfig.hero.subtext}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
            <HighIntentLink
              href={linkedinUrl}
              action="linkedin_click"
              location="homepage_hero"
              trackingAllowed={trackingAllowed}
              target="_blank"
              rel="noopener noreferrer"
              className={socialLinkClassName}
            >
              <LinkedInIcon className="h-5 w-5" />
              LinkedIn
            </HighIntentLink>
            <a
              href={substackUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={socialLinkClassName}
            >
              <SubstackIcon className="h-5 w-5" />
              Substack
            </a>
            <HighIntentLink
              href={`mailto:${email}`}
              action="email_click"
              location="homepage_hero"
              trackingAllowed={trackingAllowed}
              className={socialLinkClassName}
            >
              <MailIcon className="h-5 w-5" />
              Email
            </HighIntentLink>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#case-studies" className={cn(buttonVariants({}))}>
              View case studies ↓
            </a>
            {siteConfig.cvUrl ? (
              <HighIntentLink
                href={siteConfig.cvUrl}
                action="download_cv"
                location="homepage_hero"
                trackingAllowed={trackingAllowed}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Download CV
              </HighIntentLink>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
