import { siteConfig } from "@/lib/site-config";

export function HowIThink() {
  return (
    <section
      id="how-i-think"
      className="mx-auto max-w-5xl px-4 py-16 sm:px-6"
    >
      <h2 className="text-2xl font-semibold">{siteConfig.howIThink.heading}</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        {siteConfig.howIThink.items.map((item, index) => (
          <div
            key={item.title}
            className="rounded-lg border border-border p-4"
          >
            <p className="text-sm font-medium text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-2 font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
