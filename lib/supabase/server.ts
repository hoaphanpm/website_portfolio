import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for Server Components, Server Actions, and
 * Route Handlers. Bound to the request's cookies so it reads/writes the
 * same session the browser holds.
 *
 * Only ever constructed with the public URL + publishable key — never a
 * service-role/secret key. See docs/architecture.md §1: "No service-role
 * key anywhere in the app. Authorization comes from RLS plus the caller's
 * own identity."
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Called from a Server Component, which can't set cookies.
            // Harmless as long as proxy.ts is refreshing the session on
            // every request to /admin/** — see lib/supabase/proxy.ts.
          }
        },
      },
    },
  );
}
