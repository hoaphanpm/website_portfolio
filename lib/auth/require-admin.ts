import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

/**
 * Re-verifies the caller is signed in and present in public.admins, for use
 * at the top of every mutating Server Action added in this milestone —
 * defense in depth alongside RLS, mirroring the same check already done at
 * the page level in app/admin/(protected)/layout.tsx (Milestone 2,
 * untouched here).
 */
export async function requireAdmin(
  supabase: SupabaseServerClient,
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  return !error && Boolean(isAdmin);
}
