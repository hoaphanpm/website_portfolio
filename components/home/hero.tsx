import { HighIntentLink } from "@/components/analytics/high-intent-link";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function Hero({ trackingAllowed }: { trackingAllowed: boolean }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-sm font-medium text-muted-foreground">
        {siteConfig.hero.eyebrow}
      </p>
      <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
        {siteConfig.hero.headline}
      </h1>
      <p className="mt-4 max-w-xl text-muted-foreground">
        {siteConfig.hero.subtext}
      </p>
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
    </section>
  );
}
