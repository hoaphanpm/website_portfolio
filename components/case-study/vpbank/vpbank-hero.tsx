import Image from "next/image";

import { heroImage, vpbankContent } from "./vpbank-content";

/**
 * Hero: text left, approved final composite image right (used as-is).
 * Page-level content: never observed for section_viewed.
 */
export function VpbankHero() {
  const { eyebrow, headline, summary, tags } = vpbankContent.hero;

  return (
    <header className="my-6 grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] md:items-start lg:my-8">
      <div>
        <p className="text-xs font-medium text-white/55">{eyebrow}</p>
        <h1 className="mt-3 text-balance text-3xl font-bold leading-[1.1] tracking-tight text-white sm:text-4xl lg:text-[2.7rem]">
          {headline}
        </h1>
        <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#a7b0c0]">{summary}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {tags.map((t) => (
            <li
              key={t}
              className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1 text-xs text-white/80"
            >
              {t}
            </li>
          ))}
        </ul>
      </div>

      <figure className="min-w-0">
        <Image
          src={heroImage.src}
          width={heroImage.width}
          height={heroImage.height}
          alt={heroImage.alt}
          priority
          unoptimized
          sizes="(min-width: 1440px) 700px, (min-width: 768px) 55vw, 100vw"
          className="h-auto w-full"
        />
      </figure>
    </header>
  );
}
