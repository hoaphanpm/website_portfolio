import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export function ContactSection() {
  const { heading, subtext, email, linkedinUrl } = siteConfig.contact;

  return (
    <section id="contact" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="rounded-lg border border-border p-8">
        <h2 className="text-2xl font-semibold">{heading}</h2>
        <p className="mt-2 text-muted-foreground">{subtext}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {email ? (
            <a href={`mailto:${email}`} className={cn(buttonVariants({}))}>
              Email me
            </a>
          ) : null}
          {linkedinUrl ? (
            <a
              href={linkedinUrl}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              LinkedIn
            </a>
          ) : null}
          {siteConfig.cvUrl ? (
            <a
              href={siteConfig.cvUrl}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Download CV
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
