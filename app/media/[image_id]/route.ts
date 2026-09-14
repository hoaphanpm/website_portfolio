import { createClient } from "@/lib/supabase/server";

/**
 * Authorized image delivery — docs/architecture.md §3, decision D2.
 *
 * Deliberately outside proxy.ts's /admin/:path* matcher: this route must
 * also work for a future anon visitor on a published case, not just the
 * admin. Its own two RLS-backed checks (table, then Storage) are the
 * complete authorization model — nothing here bypasses RLS.
 *
 * 1. Look up the case_images row with the caller's own cookie-bound
 *    client — table RLS applies (anon: only if the parent case is
 *    published; admin: any).
 * 2. Download the object with that same client — Storage RLS checks
 *    again, independently.
 * 3. Anything the caller can't see returns 404 — a draft image and a
 *    nonexistent id are indistinguishable, matching Milestone 1's
 *    verified storage.objects SELECT behavior.
 *
 * This is the only way any image is ever served — never a raw Storage
 * URL (the bucket is private; no such URL is public anyway).
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ image_id: string }> },
) {
  const { image_id: imageId } = await params;
  const supabase = await createClient();

  const { data: imageRow, error } = await supabase
    .from("case_images")
    .select("storage_path, mime_type")
    .eq("id", imageId)
    .maybeSingle();

  if (error || !imageRow) {
    return new Response("Not found", { status: 404 });
  }

  const { data: fileBlob, error: downloadError } = await supabase.storage
    .from("case-images")
    .download(imageRow.storage_path);

  if (downloadError || !fileBlob) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(fileBlob, {
    status: 200,
    headers: {
      "Content-Type": imageRow.mime_type ?? "application/octet-stream",
      // No CDN or shared cache — permission can change (unpublish, delete).
      "Cache-Control": "private, no-store",
    },
  });
}
