import { SectionItem } from "./section-item";

type SectionRow = {
  id: string;
  section_id: string;
  section_index: number;
  content: Record<string, unknown> | null;
};

export function SectionList({
  caseId,
  sections,
}: {
  caseId: string;
  sections: SectionRow[];
}) {
  if (sections.length === 0) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">No sections yet.</p>
    );
  }

  return (
    <ul className="mt-3 space-y-4">
      {sections.map((section) => (
        <SectionItem key={section.id} caseId={caseId} section={section} />
      ))}
    </ul>
  );
}
