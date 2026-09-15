import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Milestone 7 correction #7. Only ever rendered inside the admin-protected
 * case editor (app/admin/(protected)/**, already gated by proxy.ts +
 * layout.tsx's is_admin() check — untouched here), so this is never
 * reachable by a non-admin; it is not exposed anywhere on the public
 * homepage. Draft cases link with ?preview=true (the only thing that
 * unlocks draft visibility on the public route — see
 * app/(public)/work/[case_id]/page.tsx); a published case links to the
 * plain public URL, since it's already visible there regardless.
 */
export function PreviewLink({
  caseSlug,
  status,
}: {
  // The public route's slug (cases.case_id) — not the internal cases.id
  // uuid PublishPanel/other admin actions use.
  caseSlug: string;
  status: string;
}) {
  const href =
    status === "published"
      ? `/work/${caseSlug}`
      : `/work/${caseSlug}?preview=true`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
    >
      Preview ↗
    </a>
  );
}
