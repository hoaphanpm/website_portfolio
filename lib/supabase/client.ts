import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client. Only ever constructed with the public URL +
 * publishable key (safe to ship to the client; RLS is the real boundary —
 * see docs/architecture.md §1 and §3). Not used by the Milestone 2 login
 * flow (that runs server-side via Server Actions); kept available for
 * later milestones that need client-side calls (e.g. direct-to-Storage
 * image uploads).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
