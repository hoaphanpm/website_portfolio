import { HighIntentLink } from "@/components/analytics/high-intent-link";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function ContactSection({
  trackingAllowed,
}: {
  trackingAllowed: boolean;
}) {
  const { heading, subtext, email, linkedinUrl } = siteConfig.contact;

  return (
    <section id="contact" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="rounded-lg border border-border p-8">
        <h2 className="text-2xl font-semibold">{heading}</h2>
        <p className="mt-2 text-muted-foreground">{subtext}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {email ? (
            <HighIntentLink
              href={`mailto:${email}`}
              action="email_click"
              location="homepage_contact"
              trackingAllowed={trackingAllowed}
              className={cn(buttonVariants({}))}
            >
              Email me
            </HighIntentLink>
          ) : null}
          {linkedinUrl ? (
            <HighIntentLink
              href={linkedinUrl}
              action="linkedin_click"
              location="homepage_contact"
              trackingAllowed={trackingAllowed}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              LinkedIn
            </HighIntentLink>
          ) : null}
          {siteConfig.cvUrl ? (
            <HighIntentLink
              href={siteConfig.cvUrl}
              action="download_cv"
              location="homepage_contact"
              trackingAllowed={trackingAllowed}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Download CV
            </HighIntentLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}
