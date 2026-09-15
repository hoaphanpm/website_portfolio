import Link from "next/link";
import { notFound } from "next/navigation";

import { SECTION_IDS } from "@/lib/cases/constants";
import { createClient } from "@/lib/supabase/server";

import { AddSectionForm } from "./add-section-form";
import { CaseFieldsForm } from "./case-fields-form";
import { ImageList } from "./image-list";
import { ImageUploadForm } from "./image-upload-form";
import { PreviewLink } from "./preview-link";
import { PublishPanel } from "./publish-panel";
import { SectionList } from "./section-list";

export default async function CaseEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: caseRow, error: caseError } = await supabase
    .from("cases")
    .select(
      "id, case_id, case_name, headline, summary, tags, completion_section, hero_image_id, status",
    )
    .eq("id", id)
    .maybeSingle();

  if (caseError || !caseRow) {
    notFound();
  }

  const { data: sections, error: sectionsError } = await supabase
    .from("case_sections")
    .select("id, section_id, section_index, content")
    .eq("case_id", id)
    .order("section_index", { ascending: true });

  const { data: images, error: imagesError } = await supabase
    .from("case_images")
    .select("id, alt_text, mime_type, size_bytes, width, height")
    .eq("case_id", id)
    .order("created_at", { ascending: true });

  const sectionList = sections ?? [];
  const imageList = images ?? [];
  const usedSectionIds = new Set(sectionList.map((s) => s.section_id));
  const availableSectionIds = SECTION_IDS.filter(
    (sectionId) => !usedSectionIds.has(sectionId),
  );

  return (
    <div className="space-y-10">
      <Link
        href="/admin"
        className="text-sm text-muted-foreground underline-offset-2 hover:underline"
      >
        ← Back to cases
      </Link>

      <section className="space-y-3">
        <PublishPanel caseId={caseRow.id} status={caseRow.status} />
        <PreviewLink caseSlug={caseRow.case_id} status={caseRow.status} />
      </section>

      <section>
        <h1 className="text-xl font-semibold">{caseRow.case_name}</h1>
        <div className="mt-4">
          <CaseFieldsForm caseRow={caseRow} sections={sectionList} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Images</h2>
        {imagesError ? (
          <p className="mt-2 text-sm text-destructive">
            Could not load images.
          </p>
        ) : (
          <ImageList
            caseId={caseRow.id}
            images={imageList}
            heroImageId={caseRow.hero_image_id}
          />
        )}
        <div className="mt-6">
          <ImageUploadForm caseId={caseRow.id} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold">Sections</h2>
        {sectionsError ? (
          <p className="mt-2 text-sm text-destructive">
            Could not load sections.
          </p>
        ) : (
          <SectionList caseId={caseRow.id} sections={sectionList} />
        )}
        {availableSectionIds.length > 0 ? (
          <div className="mt-6">
            <AddSectionForm
              caseId={caseRow.id}
              availableSectionIds={availableSectionIds}
            />
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">
            All 9 sections have been added.
          </p>
        )}
      </section>
    </div>
  );
}
