import { redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";

/**
 * Authoritative auth + authorization gate for everything under /admin
 * except /admin/login (which lives outside this route group).
 *
 * proxy.ts already redirects requests with no session at all; this layout
 * re-verifies (defense in depth) and additionally checks the admins
 * allowlist via is_admin() — the check proxy.ts deliberately skips to
 * avoid a second network round-trip on every request.
 */
export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: isAdmin, error } = await supabase.rpc("is_admin");

  if (error || !isAdmin) {
    // A valid Supabase session exists, but this user is not in
    // public.admins (or the check failed). Reject: sign out rather than
    // leaving an unauthorized-but-valid session sitting in the browser.
    await supabase.auth.signOut();
    redirect("/admin/login?error=not_authorized");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <span className="font-medium">Portfolio Admin</span>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{user.email}</span>
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Log out
            </Button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
