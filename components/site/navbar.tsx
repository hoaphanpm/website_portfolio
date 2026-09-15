import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * Milestone 6 decision #1: CSS-only responsive nav. Links wrap onto a new
 * line on narrow screens via flex-wrap — no hamburger menu, no client
 * component, no JS state.
 */
export function Navbar() {
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
        <a href="#top" className="font-semibold">
          {siteConfig.name}
        </a>

        <nav
          aria-label="Primary"
          className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"
        >
          {siteConfig.nav.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {link.label}
            </a>
          ))}
          <a href="#contact" className={cn(buttonVariants({ size: "sm" }))}>
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
