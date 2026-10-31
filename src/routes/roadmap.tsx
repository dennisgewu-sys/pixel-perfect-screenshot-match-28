import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/blocks";
import { ROADMAP } from "@/lib/content";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/roadmap")({
  head: () => ({
    meta: [
      { title: "Roadmap & Future Plans — Arise Ashaiman Foundation" },
      {
        name: "description",
        content: "Our four-phase plan from 2025 onward: Foundation, Empowerment, Community Impact, and Sustainability & Community Transformation.",
      },
      { property: "og:title", content: "Roadmap — Arise Ashaiman Foundation" },
      { property: "og:description", content: "Four phases of planned work for Ashaiman's development." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Roadmap,
});

const TONES = ["bg-primary text-gold", "bg-teal text-teal-foreground", "bg-gold text-gold-foreground", "bg-primary-deep text-on-dark"];

function Roadmap() {
  return (
    <>
      <PageHero
        eyebrow="Roadmap"
        title="Our plans for the years ahead"
        intro="These are organisational plans and targets — not completed achievements. We'll report progress as each goal is reached."
      />
      <section className="container-page py-20">
        <ol className="relative mx-auto max-w-4xl">
          <span aria-hidden className="absolute left-7 top-0 h-full w-0.5 bg-border md:left-1/2" />
          {ROADMAP.map((p, i) => (
            <li key={p.phase} className={cn("relative mb-12 pl-20 md:w-1/2 md:pl-0", i % 2 ? "md:ml-auto md:pl-14" : "md:pr-14")}>
              <span
                className={cn(
                  "absolute left-0 top-0 flex h-14 w-14 items-center justify-center rounded-2xl font-display text-xl font-extrabold shadow-lift md:top-2",
                  TONES[i],
                  i % 2 ? "md:-left-7" : "md:left-auto md:-right-7",
                )}
              >
                {p.phase}
              </span>
              <article className="rounded-2xl border bg-card p-7 shadow-soft">
                <p className="eyebrow">Phase {p.phase} · {p.period}</p>
                <h2 className="mt-1 text-2xl font-extrabold text-primary">{p.title}</h2>
                <ul className="mt-4 space-y-2">
                  {p.items.map((it) => (
                    <li key={it} className="flex gap-2 text-sm">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                      <span className="text-muted-foreground">{it}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 inline-block rounded-full bg-gold-soft px-3 py-1 text-[0.7rem] font-bold uppercase tracking-wider text-gold-foreground">
                  Planned
                </p>
              </article>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
