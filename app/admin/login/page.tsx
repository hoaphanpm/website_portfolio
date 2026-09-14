import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { LoginForm } from "./login-form";

const ERROR_MESSAGES: Record<string, string> = {
  not_authorized: "This account is not authorized for admin access.",
  session_revoked: "Your session is no longer valid. Please sign in again.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Decision (approved): an already-authenticated, authorized admin
    // visiting /admin/login is sent straight to /admin.
    const { data: isAdmin } = await supabase.rpc("is_admin");
    if (isAdmin) {
      redirect("/admin");
    }
    // Logged in but not admin and landed here directly (rare) — clear the
    // session so the form below starts clean rather than looping.
    await supabase.auth.signOut();
  }

  const { error } = await searchParams;
  const errorMessage = error ? ERROR_MESSAGES[error] : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Admin sign in</CardTitle>
          <CardDescription>Portfolio admin access only.</CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage ? (
            <p className="mb-4 text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          ) : null}
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
