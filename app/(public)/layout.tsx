import { Suspense } from "react";
import { Footer } from "@/components/site/footer";
import { Navbar } from "@/components/site/navbar";
import { computeTrackingAllowedBase } from "@/lib/analytics/gating";

// Scoped to this route group only — /admin/** and /media/[image_id] render
// under the root layout directly and are unaffected. Wraps both "/" and
// "/work/[case_id]", reusing this chrome (Milestone 7).
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Milestone 9: the env+admin part of the gate, computed once here since
  // <Footer> is shared across pages and has no searchParams of its own —
  // see lib/analytics/gating.ts and components/site/footer.tsx.
  const trackingAllowedBase = await computeTrackingAllowedBase();

  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      {/* Footer uses useSearchParams() (Milestone 9) — Next.js requires that
          be wrapped in Suspense. The page is fully dynamic (server-rendered
          per request, D6), so this fallback is structural, not a real
          runtime flash. */}
      <Suspense fallback={null}>
        <Footer trackingAllowedBase={trackingAllowedBase} />
      </Suspense>
    </div>
  );
}
