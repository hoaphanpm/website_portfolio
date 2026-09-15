import { siteConfig } from "@/lib/site-config";

export function Footer() {
  const { email, linkedinUrl } = siteConfig.contact;

  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-medium text-foreground">{siteConfig.name}</p>
          <p>{siteConfig.footer.tagline}</p>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1">
          {linkedinUrl ? (
            <a
              href={linkedinUrl}
              className="rounded-sm hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              LinkedIn
            </a>
          ) : null}
          {email ? (
            <a
              href={`mailto:${email}`}
              className="rounded-sm hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Email
            </a>
          ) : null}
          <span>© {siteConfig.name}</span>
        </div>
      </div>
    </footer>
  );
}
