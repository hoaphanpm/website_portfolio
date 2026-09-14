"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/require-admin";
import { isSectionId } from "@/lib/cases/constants";
import { isValidSlug } from "@/lib/cases/slug";
import { parseTags } from "@/lib/cases/validation";
import { createClient } from "@/lib/supabase/server";

import type { CaseFieldsState, SectionFormState } from "./types";

/**
 * Updates case-level fields. Validates on the server (friendly errors)
 * before ever reaching the database, which remains the authoritative
 * enforcement (cases_case_id_slug_check, cases_case_id_key,
 * lock_case_id_and_first_published_at trigger).
 */
export async function updateCaseFields(
  _prevState: CaseFieldsState,
  formData: FormData,
): Promise<CaseFieldsState> {
  const caseRowId = String(formData.get("case_row_id") ?? "");
  const caseName = String(formData.get("case_name") ?? "").trim();
  const caseId = String(formData.get("case_id") ?? "").trim();
  const headline = String(formData.get("headline") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const tagsInput = String(formData.get("tags") ?? "");
  const completionSectionRaw = String(formData.get("completion_section") ?? "");

  if (!caseRowId) {
    return { error: "Missing case reference.", success: false };
  }
  if (!caseName) {
    return { error: "Case name is required.", success: false };
  }
  if (!caseId) {
    return { error: "Case ID is required.", success: false };
  }
  if (!isValidSlug(caseId)) {
    return {
      error:
        "Case ID must be lowercase letters, numbers and single hyphens (e.g. my-case-name).",
      success: false,
    };
  }

  const completionSection =
    completionSectionRaw === "" ? null : completionSectionRaw;
  if (completionSection !== null && !isSectionId(completionSection)) {
    return { error: "Invalid completion section.", success: false };
  }

  const supabase = await createClient();

  if (!(await requireAdmin(supabase))) {
    return { error: "Not authorized.", success: false };
  }

  const { data: current, error: loadError } = await supabase
    .from("cases")
    .select("case_id, first_published_at, status, hero_image_id")
    .eq("id", caseRowId)
    .maybeSingle();

  if (loadError || !current) {
    return { error: "Case not found.", success: false };
  }

  if (caseId !== current.case_id) {
    if (current.first_published_at) {
      // Always false in Milestone 3 (nothing can publish yet), kept for
      // correctness once Milestone 5 ships publishing.
      return {
        error: "Case ID can no longer be changed after the first publish.",
        success: false,
      };
    }

    const { data: conflict, error: conflictError } = await supabase
      .from("cases")
      .select("id")
      .eq("case_id", caseId)
      .neq("id", caseRowId)
      .maybeSingle();

    if (conflictError) {
      return {
        error: "Could not verify case ID availability.",
        success: false,
      };
    }
    if (conflict) {
      return { error: "That case ID is already in use.", success: false };
    }
  }

  // Clarification: completion_section may only be one of this case's own
  // current sections, or unset.
  if (completionSection !== null) {
    const { data: sectionRow } = await supabase
      .from("case_sections")
      .select("id")
      .eq("case_id", caseRowId)
      .eq("section_id", completionSection)
      .maybeSingle();

    if (!sectionRow) {
      return {
        error: "Completion section must be one of this case's current sections.",
        success: false,
      };
    }
  }

  // Approved decision (Milestone 5 #5): friendly pre-check so an edit that
  // would break a published case's validity is rejected with the specific
  // reason, instead of the generic error the cases_guard_publish_integrity
  // trigger's raw exception would otherwise produce. The trigger itself is
  // untouched and remains the authoritative backstop either way.
  if (current.status === "published") {
    const { data: failures, error: validateError } = await supabase.rpc(
      "validate_case",
      {
        p_case: {
          id: caseRowId,
          case_id: caseId,
          case_name: caseName,
          headline: headline || null,
          summary: summary || null,
          hero_image_id: current.hero_image_id,
          completion_section: completionSection,
        },
      },
    );

    if (validateError) {
      return {
        error: "Could not verify these changes. Please try again.",
        success: false,
      };
    }

    if (failures && failures.length > 0) {
      const messages = (failures as { message: string }[]).map(
        (f) => f.message,
      );
      return {
        error: `This case is published, so: ${messages.join(" ")}`,
        success: false,
      };
    }
  }

  const { error: updateError } = await supabase
    .from("cases")
    .update({
      case_name: caseName,
      case_id: caseId,
      headline: headline || null,
      summary: summary || null,
      tags: parseTags(tagsInput),
      completion_section: completionSection,
    })
    .eq("id", caseRowId);

  if (updateError) {
    return { error: "Could not save changes. Please try again.", success: false };
  }

  revalidatePath(`/admin/cases/${caseRowId}`);
  revalidatePath("/admin");
  return { error: null, success: true };
}

/**
 * Adds a section from the fixed 9-value list. section_index is entirely
 * system-assigned by the existing DB trigger; never sent here.
 */
export async function addSection(
  _prevState: SectionFormState,
  formData: FormData,
): Promise<SectionFormState> {
  const caseRowId = String(formData.get("case_row_id") ?? "");
  const sectionId = String(formData.get("section_id") ?? "");
  const heading = String(formData.get("heading") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!caseRowId) {
    return { error: "Missing case reference.", success: false };
  }
  if (!isSectionId(sectionId)) {
    return { error: "Choose a valid section type.", success: false };
  }

  const supabase = await createClient();

  if (!(await requireAdmin(supabase))) {
    return { error: "Not authorized.", success: false };
  }

  const { data: existing } = await supabase
    .from("case_sections")
    .select("id")
    .eq("case_id", caseRowId)
    .eq("section_id", sectionId)
    .maybeSingle();

  if (existing) {
    return {
      error: "This section has already been added to this case.",
      success: false,
    };
  }

  const { error } = await supabase.from("case_sections").insert({
    case_id: caseRowId,
    section_id: sectionId,
    content: { heading, body },
  });

  if (error) {
    return { error: "Could not add the section. Please try again.", success: false };
  }

  revalidatePath(`/admin/cases/${caseRowId}`);
  revalidatePath("/admin");
  return { error: null, success: true };
}

/**
 * Updates one section's content. Reads the existing content first and
 * shallow-merges heading/body into it, so any other keys a later milestone
 * adds (e.g. image references) are preserved rather than overwritten.
 */
export async function updateSectionContent(
  _prevState: SectionFormState,
  formData: FormData,
): Promise<SectionFormState> {
  const caseRowId = String(formData.get("case_row_id") ?? "");
  const sectionRowId = String(formData.get("section_row_id") ?? "");
  const heading = String(formData.get("heading") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();

  if (!caseRowId || !sectionRowId) {
    return { error: "Missing section reference.", success: false };
  }

  const supabase = await createClient();

  if (!(await requireAdmin(supabase))) {
    return { error: "Not authorized.", success: false };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("case_sections")
    .select("content")
    .eq("id", sectionRowId)
    .maybeSingle();

  if (fetchError || !existing) {
    return { error: "Section not found.", success: false };
  }

  const existingContent =
    typeof existing.content === "object" && existing.content !== null
      ? (existing.content as Record<string, unknown>)
      : {};

  const mergedContent = { ...existingContent, heading, body };

  const { error } = await supabase
    .from("case_sections")
    .update({ content: mergedContent })
    .eq("id", sectionRowId);

  if (error) {
    return { error: "Could not save the section. Please try again.", success: false };
  }

  revalidatePath(`/admin/cases/${caseRowId}`);
  return { error: null, success: true };
}

/**
 * Deletes a section. Allowed unconditionally in draft. Once a case is
 * published, removing its decision section or its completion_section is
 * rejected with a friendly, specific reason (Milestone 5 approved decision
 * #5) — mirroring exactly what the existing case_sections_guard_before_delete
 * trigger already enforces, which remains the authoritative backstop.
 * Otherwise, if the deleted section was the case's completion_section,
 * that field is cleared so it never points at a section that no longer
 * exists.
 */
export async function deleteSection(
  _prevState: SectionFormState,
  formData: FormData,
): Promise<SectionFormState> {
  const caseRowId = String(formData.get("case_row_id") ?? "");
  const sectionRowId = String(formData.get("section_row_id") ?? "");
  const sectionId = String(formData.get("section_id") ?? "");

  if (!caseRowId || !sectionRowId) {
    return { error: "Missing section reference.", success: false };
  }

  const supabase = await createClient();

  if (!(await requireAdmin(supabase))) {
    return { error: "Not authorized.", success: false };
  }

  const { data: caseRow, error: caseLoadError } = await supabase
    .from("cases")
    .select("status, completion_section")
    .eq("id", caseRowId)
    .maybeSingle();

  if (caseLoadError || !caseRow) {
    return { error: "Case not found.", success: false };
  }

  if (caseRow.status === "published") {
    if (sectionId === "decision") {
      return {
        error:
          "Cannot remove the decision section while this case is published. Unpublish it first.",
        success: false,
      };
    }
    if (sectionId === caseRow.completion_section) {
      return {
        error:
          "Cannot remove this case's completion section while it's published. Choose a different completion section or unpublish the case first.",
        success: false,
      };
    }
  }

  const { error: deleteError } = await supabase
    .from("case_sections")
    .delete()
    .eq("id", sectionRowId);

  if (deleteError) {
    return {
      error: "Could not delete the section. Please try again.",
      success: false,
    };
  }

  if (caseRow.completion_section === sectionId) {
    await supabase
      .from("cases")
      .update({ completion_section: null })
      .eq("id", caseRowId);
  }

  revalidatePath(`/admin/cases/${caseRowId}`);
  revalidatePath("/admin");
  return { error: null, success: true };
}
