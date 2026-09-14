"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SignInState } from "./types";

/**
 * Sign-in Server Action. Rejects both wrong credentials and valid
 * credentials for a user not in public.admins, in the same request — a
 * valid-but-non-admin login never reaches /admin even once.
 */
export async function signIn(
  _prevState: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    // Deliberately generic — never reveal whether the email exists.
    return { error: "Invalid email or password." };
  }

  // Verify the authenticated user's UUID exists in public.admins via the
  // is_admin() RPC (docs/architecture.md §3) — the admins table itself has
  // no RLS policies, so this SECURITY DEFINER function is the only way to
  // check membership.
  const { data: isAdmin, error: rpcError } = await supabase.rpc("is_admin");

  if (rpcError || !isAdmin) {
    // Reject: sign out immediately so no unauthorized session persists.
    await supabase.auth.signOut();
    return { error: "This account is not authorized for admin access." };
  }

  redirect("/admin");
}
