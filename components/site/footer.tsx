"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { HighIntentLink } from "@/components/analytics/high-intent-link";
import { siteConfig } from "@/lib/site-config";

/**
 * Milestone 9: this shared Footer (mounted once in app/(public)/layout.tsx
 * for both "/" and "/work/[case_id]") sends location = "homepage_footer" on
 * the homepage and "case_footer" (+ case_id) on a case page
 * (docs/architecture.md §6 central "location" list) — derived from the
 * live URL via usePathname()/useSearchParams() rather than a prop, since a
 * shared layout component has no page-specific searchParams of its own.
 *
 * trackingAllowedBase (env + admin only, computed server-side in the
 * layout) is combined here with a client-side ?preview=true re-check —
 * the layout has no searchParams to compute that part itself.
 */
export function Footer({
  trackingAllowedBase,
}: {
  trackingAllowedBase: boolean;
}) {
  const { email, linkedinUrl } = siteConfig.contact;
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isPreview = searchParams.get("preview") === "true";
  const trackingAllowed = trackingAllowedBase && !isPreview;

  const workMatch = pathname?.match(/^\/work\/([^/]+)/);
  const location = workMatch ? "case_footer" : "homepage_footer";
  const caseId = workMatch ? workMatch[1] : undefined;

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-medium text-foreground">{siteConfig.name}</p>
          <p>{siteConfig.footer.tagline}</p>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {linkedinUrl ? (
            <HighIntentLink
              href={linkedinUrl}
              action="linkedin_click"
              location={location}
              caseId={caseId}
              trackingAllowed={trackingAllowed}
              className="rounded-sm hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              LinkedIn
            </HighIntentLink>
          ) : null}
          {email ? (
            <HighIntentLink
              href={`mailto:${email}`}
              action="email_click"
              location={location}
              caseId={caseId}
              trackingAllowed={trackingAllowed}
              className="rounded-sm hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Email
            </HighIntentLink>
          ) : null}
          <span>© {siteConfig.name}</span>
        </div>
      </div>
    </footer>
  );
}
