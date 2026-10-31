import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/blocks";
import { PILLARS } from "@/lib/content";

export const Route = createFileRoute("/pillars")({
  head: () => ({
    meta: [
      { title: "Our Five Core Pillars — Arise Ashaiman Foundation" },
      {
        name: "description",
        content:
          "Community engagement, strategic communication, mentorship, community development and advocacy — the five pillars of Arise Ashaiman.",
      },
      { property: "og:title", content: "Our Five Core Pillars — Arise Ashaiman" },
      { property: "og:description", content: "The five pillars guiding Arise Ashaiman Foundation's work for Ashaiman's development." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pillars,
});

function Pillars() {
  return (
    <>
      <PageHero
        eyebrow="Our pillars"
        title="Five pillars. One Ashaiman."
        intro="Each pillar supports the others — together they shape how we contribute to Ashaiman's development."
      />
      <section className="container-page space-y-6 py-20">
        {PILLARS.map((p, i) => (
          <article
            key={p.number}
            className="grid gap-6 rounded-3xl border bg-card p-8 shadow-soft md:grid-cols-[auto_1fr_1fr] md:items-start md:p-10"
          >
            <div className="flex items-center gap-4 md:flex-col md:items-start">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${i % 2 ? "bg-teal text-teal-foreground" : "bg-primary text-gold"}`}>
                <p.icon className="h-8 w-8" />
              </div>
              <span className="font-display text-5xl font-extrabold text-border">0{p.number}</span>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-primary">{p.title}</h2>
              <p className="mt-2 text-muted-foreground">{p.short}</p>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="eyebrow mb-1">Purpose</h3>
                <p className="text-[0.95rem]">{p.purpose}</p>
              </div>
              <div>
                <h3 className="eyebrow mb-1">Contribution to Ashaiman</h3>
                <p className="text-[0.95rem]">{p.contribution}</p>
              </div>
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
