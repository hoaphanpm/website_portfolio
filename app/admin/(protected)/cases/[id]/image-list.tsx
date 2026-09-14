import { ImageItem } from "./image-item";

type ImageRow = {
  id: string;
  alt_text: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
};

export function ImageList({
  caseId,
  images,
  heroImageId,
}: {
  caseId: string;
  images: ImageRow[];
  heroImageId: string | null;
}) {
  if (images.length === 0) {
    return (
      <p className="mt-2 text-sm text-muted-foreground">No images yet.</p>
    );
  }

  return (
    <ul className="mt-3 space-y-4">
      {images.map((image) => (
        <ImageItem
          key={image.id}
          caseId={caseId}
          image={image}
          isHero={image.id === heroImageId}
        />
      ))}
    </ul>
  );
}
