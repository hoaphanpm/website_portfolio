"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { createClient } from "@/lib/supabase/server";

import type { PublishState } from "./types";

type ValidationFailure = { code: string; message: string };

/**
 * Publishes a case. Calls the existing validate_case() DB function first
 * and shows every failure at once (docs/architecture.md §4 step 6) —
 * nothing is written unless it returns zero rows. If it passes, the actual
 * UPDATE still goes through cases_guard_publish_integrity, which re-checks
 * internally and sets first_published_at only if it was null — that trigger
 * remains the authoritative backstop; this pre-check only makes the common
 * case fast and the errors readable.
 */
export async function publishCase(
  _prevState: PublishState,
  formData: FormData,
): Promise<PublishState> {
  const caseRowId = String(formData.get("case_row_id") ?? "");

  if (!caseRowId) {
    return { error: "Missing case reference.", checklist: [], success: false };
  }

  const supabase = await createClient();

  if (!(await requireAdmin(supabase))) {
    return { error: "Not authorized.", checklist: [], success: false };
  }

  const { data: caseRow, error: loadError } = await supabase
    .from("cases")
    .select(
      "id, case_id, case_name, headline, summary, hero_image_id, completion_section",
    )
    .eq("id", caseRowId)
    .maybeSingle();

  if (loadError || !caseRow) {
    return { error: "Case not found.", checklist: [], success: false };
  }

  const { data: failures, error: validateError } = await supabase.rpc(
    "validate_case",
    { p_case: caseRow },
  );

  if (validateError) {
    return {
      error: "Could not validate the case. Please try again.",
      checklist: [],
      success: false,
    };
  }

  if (failures && failures.length > 0) {
    return {
      error: null,
      checklist: (failures as ValidationFailure[]).map((f) => f.message),
      success: false,
    };
  }

  const { error: publishError } = await supabase
    .from("cases")
    .update({ status: "published" })
    .eq("id", caseRowId);

  if (publishError) {
    return {
      error: "Could not publish the case. Please try again.",
      checklist: [],
      success: false,
    };
  }

  revalidatePath(`/admin/cases/${caseRowId}`);
  revalidatePath("/admin");
  return { error: null, checklist: [], success: true };
}

/**
 * Unpublishes a case: only `status` changes. first_published_at is never
 * included in this update, so the existing immutability trigger has
 * nothing to reject — it stays exactly what it already was, permanently.
 */
export async function unpublishCase(
  _prevState: PublishState,
  formData: FormData,
): Promise<PublishState> {
  const caseRowId = String(formData.get("case_row_id") ?? "");

  if (!caseRowId) {
    return { error: "Missing case reference.", checklist: [], success: false };
  }

  const supabase = await createClient();

  if (!(await requireAdmin(supabase))) {
    return { error: "Not authorized.", checklist: [], success: false };
  }

  const { error } = await supabase
    .from("cases")
    .update({ status: "draft" })
    .eq("id", caseRowId);

  if (error) {
    return {
      error: "Could not unpublish the case. Please try again.",
      checklist: [],
      success: false,
    };
  }

  revalidatePath(`/admin/cases/${caseRowId}`);
  revalidatePath("/admin");
  return { error: null, checklist: [], success: true };
}
