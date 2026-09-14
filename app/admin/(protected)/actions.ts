"use server";

import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/require-admin";
import { generateUniqueCaseId } from "@/lib/cases/slug";
import { createClient } from "@/lib/supabase/server";

import type { CreateCaseState } from "./types";

/**
 * Creates a new draft case: case_id is generated as a slug of the name
 * (docs/architecture.md §4 step 1), display_position is assigned by the
 * existing DB trigger. Redirects straight into the editor on success.
 */
export async function createCase(
  _prevState: CreateCaseState,
  formData: FormData,
): Promise<CreateCaseState> {
  const caseName = String(formData.get("case_name") ?? "").trim();

  if (!caseName) {
    return { error: "Case name is required." };
  }

  const supabase = await createClient();

  if (!(await requireAdmin(supabase))) {
    return { error: "Not authorized." };
  }

  let caseId: string;
  try {
    caseId = await generateUniqueCaseId(supabase, caseName);
  } catch {
    return {
      error: "Could not generate a case ID from that name. Try a different name.",
    };
  }

  const { data, error } = await supabase
    .from("cases")
    .insert({ case_id: caseId, case_name: caseName })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Could not create the case. Please try again." };
  }

  redirect(`/admin/cases/${data.id}`);
}
