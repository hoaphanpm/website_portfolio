import { SectionItem } from "./section-item";
import type { SectionImageRow } from "./section-image-card";

type SectionRow = {
  id: string;
  section_id: string;
  section_index: number;
  content: Record<string, unknown> | null;
};

export function SectionList({
  caseId,
  sections,
  sectionImages,
}: {
  caseId: string;
  sections: SectionRow[];
  sectionImages: (SectionImageRow & { section_id: string | null })[];
}) {
  if (sections.length === 0) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">No sections yet.</p>
    );
  }

  return (
    <ul className="mt-3 space-y-4">
      {sections.map((section) => (
        <SectionItem
          key={section.id}
          caseId={caseId}
          section={section}
          images={sectionImages.filter((img) => img.section_id === section.id)}
        />
      ))}
    </ul>
  );
}
