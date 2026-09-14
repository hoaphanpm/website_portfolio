"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import {
  MAX_IMAGE_SIZE_BYTES,
  isAllowedImageMimeType,
} from "@/lib/cases/images";
import { createClient } from "@/lib/supabase/server";

import type { ImageActionState } from "./types";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const BUCKET = "case-images";

/** Best-effort cleanup only — never lets a Storage error mask the real one. */
async function deleteStorageObjectSafely(
  supabase: SupabaseServerClient,
  path: string,
) {
  try {
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // A file without a case_images row can never be read publicly
    // (docs/architecture.md §3), so a failed cleanup here is a storage
    // hygiene issue only, not a correctness or security one.
  }
}

/**
 * Records metadata for a file the browser has already uploaded directly to
 * Storage (docs/architecture.md §3 Uploads: file bytes go straight to
 * Storage to avoid a Server Action body-size limit; only this small
 * metadata call goes through the server). Called as a plain function from
 * the upload form's client-side flow, not via useActionState.
 *
 * Re-derives size_bytes/mime_type from Storage itself rather than trusting
 * the client-supplied values (approved decision #2) — width/height are
 * accepted as-is from the client since they are display metadata only,
 * never a security boundary (approved decision #1).
 */
export async function recordUploadedImage(input: {
  caseId: string;
  imageId: string;
  storagePath: string;
  altText: string;
  width: number | null;
  height: number | null;
}): Promise<{ error: string | null }> {
  const altText = input.altText.trim();
  const supabase = await createClient();

  if (!(await requireAdmin(supabase))) {
    return { error: "Not authorized." };
  }

  if (!altText) {
    await deleteStorageObjectSafely(supabase, input.storagePath);
    return { error: "Alt text is required." };
  }

  const filename = input.storagePath.slice(input.caseId.length + 1);
  const { data: listing, error: listError } = await supabase.storage
    .from(BUCKET)
    .list(input.caseId);

  const objectInfo = listing?.find((entry) => entry.name === filename);

  if (listError || !objectInfo?.metadata) {
    await deleteStorageObjectSafely(supabase, input.storagePath);
    return { error: "Could not verify the uploaded file. Please try again." };
  }

  const actualMimeType = String(objectInfo.metadata.mimetype ?? "");
  const actualSize = Number(objectInfo.metadata.size ?? NaN);

  if (!isAllowedImageMimeType(actualMimeType)) {
    await deleteStorageObjectSafely(supabase, input.storagePath);
    return { error: "That file type is not allowed." };
  }
  if (!Number.isFinite(actualSize) || actualSize > MAX_IMAGE_SIZE_BYTES) {
    await deleteStorageObjectSafely(supabase, input.storagePath);
    return { error: "That file is too large." };
  }

  const { error: insertError } = await supabase.from("case_images").insert({
    id: input.imageId,
    case_id: input.caseId,
    storage_path: input.storagePath,
    alt_text: altText,
    mime_type: actualMimeType,
    size_bytes: actualSize,
    width: input.width,
    height: input.height,
  });

  if (insertError) {
    await deleteStorageObjectSafely(supabase, input.storagePath);
    return { error: "Could not save the image. Please try again." };
  }

  revalidatePath(`/admin/cases/${input.caseId}`);
  return { error: null };
}

/** Sets the case's hero image. The composite FK guarantees the chosen
 * image belongs to this same case; this pre-check just makes the error
 * friendly instead of a raw constraint violation. */
export async function setHeroImage(
  _prevState: ImageActionState,
  formData: FormData,
): Promise<ImageActionState> {
  const caseRowId = String(formData.get("case_row_id") ?? "");
  const imageId = String(formData.get("image_id") ?? "");

  if (!caseRowId || !imageId) {
    return { error: "Missing reference.", success: false };
  }

  const supabase = await createClient();
  if (!(await requireAdmin(supabase))) {
    return { error: "Not authorized.", success: false };
  }

  const { data: imageRow } = await supabase
    .from("case_images")
    .select("id")
    .eq("id", imageId)
    .eq("case_id", caseRowId)
    .maybeSingle();

  if (!imageRow) {
    return {
      error: "That image does not belong to this case.",
      success: false,
    };
  }

  const { error } = await supabase
    .from("cases")
    .update({ hero_image_id: imageId })
    .eq("id", caseRowId);

  if (error) {
    return {
      error: "Could not set the hero image. Please try again.",
      success: false,
    };
  }

  revalidatePath(`/admin/cases/${caseRowId}`);
  return { error: null, success: true };
}

export async function clearHeroImage(
  _prevState: ImageActionState,
  formData: FormData,
): Promise<ImageActionState> {
  const caseRowId = String(formData.get("case_row_id") ?? "");

  if (!caseRowId) {
    return { error: "Missing reference.", success: false };
  }

  const supabase = await createClient();
  if (!(await requireAdmin(supabase))) {
    return { error: "Not authorized.", success: false };
  }

  // Milestone 5 approved decision #5: a published case requires a hero
  // image (validate_case), so clearing it would break cases_guard_publish_
  // integrity's re-check on this same UPDATE. Friendly pre-check; that
  // trigger remains the authoritative backstop.
  const { data: caseRow } = await supabase
    .from("cases")
    .select("status")
    .eq("id", caseRowId)
    .maybeSingle();

  if (caseRow?.status === "published") {
    return {
      error:
        "Cannot clear the hero image while this case is published. Set a different hero image, or unpublish the case first.",
      success: false,
    };
  }

  const { error } = await supabase
    .from("cases")
    .update({ hero_image_id: null })
    .eq("id", caseRowId);

  if (error) {
    return {
      error: "Could not clear the hero image. Please try again.",
      success: false,
    };
  }

  revalidatePath(`/admin/cases/${caseRowId}`);
  return { error: null, success: true };
}

/**
 * Deletes an image: blocked up front if it's the case's current hero
 * (clarification: require clearing/changing the hero before deleting it),
 * backstopped by the DB's own ON DELETE RESTRICT on that FK. The DB row is
 * removed before the Storage object, so a failure partway through leaves,
 * at worst, an orphaned-but-unreachable file rather than a dangling row.
 */
export async function deleteImage(
  _prevState: ImageActionState,
  formData: FormData,
): Promise<ImageActionState> {
  const caseRowId = String(formData.get("case_row_id") ?? "");
  const imageId = String(formData.get("image_id") ?? "");

  if (!caseRowId || !imageId) {
    return { error: "Missing reference.", success: false };
  }

  const supabase = await createClient();
  if (!(await requireAdmin(supabase))) {
    return { error: "Not authorized.", success: false };
  }

  const { data: caseRow } = await supabase
    .from("cases")
    .select("hero_image_id")
    .eq("id", caseRowId)
    .maybeSingle();

  if (caseRow?.hero_image_id === imageId) {
    return {
      error:
        "This image is the hero image. Clear or change the hero image before deleting it.",
      success: false,
    };
  }

  const { data: imageRow, error: loadError } = await supabase
    .from("case_images")
    .select("storage_path")
    .eq("id", imageId)
    .eq("case_id", caseRowId)
    .maybeSingle();

  if (loadError || !imageRow) {
    return { error: "Image not found.", success: false };
  }

  const { error: deleteError } = await supabase
    .from("case_images")
    .delete()
    .eq("id", imageId);

  if (deleteError) {
    return {
      error: "Could not delete the image. Please try again.",
      success: false,
    };
  }

  await deleteStorageObjectSafely(supabase, imageRow.storage_path);

  revalidatePath(`/admin/cases/${caseRowId}`);
  return { error: null, success: true };
}
