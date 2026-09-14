import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase session cookie on every /admin/** request and
 * redirects unauthenticated visitors to /admin/login.
 *
 * This is deliberately only the "are you logged in at all?" check, and the
 * fast path — it's the mechanism that keeps the session cookie alive across
 * requests (Server Components can't write cookies themselves). The
 * authoritative "are you the admin?" check (is_admin() via RPC, per
 * docs/architecture.md §3) happens in app/admin/(protected)/layout.tsx, not
 * here, to avoid a second network round-trip on every request when
 * proxy.ts's own answer is already "not logged in."
 *
 * Named for Next.js 16's proxy.ts convention (renamed from middleware.ts —
 * see the root proxy.ts file that calls this).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // getUser() revalidates against the Auth server rather than trusting a
  // possibly-stale/tampered cookie (Supabase's documented recommendation
  // for exactly this middleware/proxy position).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}
