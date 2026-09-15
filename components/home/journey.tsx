import { siteConfig } from "@/lib/site-config";

export function Journey() {
  return (
    <section id="journey" className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <h2 className="text-2xl font-semibold">{siteConfig.journey.heading}</h2>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {siteConfig.journey.milestones.map((milestone) => (
          <div
            key={milestone.period}
            className="rounded-lg border border-border p-4"
          >
            <p className="text-sm font-medium text-muted-foreground">
              {milestone.period}
            </p>
            <h3 className="mt-1 font-semibold">{milestone.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {milestone.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
