import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Eye, Target } from "lucide-react";
import { PageHero, SectionHeading } from "@/components/site/blocks";
import { Button } from "@/components/ui/button";
import { AIMS, BACKGROUND, MISSION, OBJECTIVES, ORG, VISION } from "@/lib/content";
import { EMBLEM_URL } from "@/components/site/Logo";
import dialogue from "@/assets/community-dialogue.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — Arise Ashaiman Foundation" },
      {
        name: "description",
        content: "Our background, vision, mission, aims and objectives — and the founder behind Arise Ashaiman Foundation.",
      },
      { property: "og:title", content: "About Arise Ashaiman Foundation" },
      { property: "og:description", content: "A youth-driven community development organisation born from a grassroots initiative in Ashaiman." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});

function About() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Born from the grassroots. Built for Ashaiman."
        intro="A youth-driven social, advocacy, mentorship and community development organisation."
        image={dialogue}
      />

      <section className="container-page grid gap-12 py-20 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionHeading eyebrow="Background" title="Our story" />
          <div className="space-y-5 text-lg leading-relaxed text-muted-foreground">
            {BACKGROUND.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
          </div>
        </div>
        <aside className="space-y-5">
          <div className="rounded-2xl border bg-card p-7 shadow-soft">
            <Eye className="mb-3 h-7 w-7 text-teal" />
            <h3 className="text-lg font-extrabold text-primary">Vision</h3>
            <p className="mt-2 text-muted-foreground">{VISION}</p>
          </div>
          <div className="rounded-2xl border bg-card p-7 shadow-soft">
            <Target className="mb-3 h-7 w-7 text-teal" />
            <h3 className="text-lg font-extrabold text-primary">Mission</h3>
            <p className="mt-2 text-muted-foreground">{MISSION}</p>
          </div>
        </aside>
      </section>

      <section className="bg-secondary py-20">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Aims" title="What we aim to achieve" />
            <ol className="space-y-3">
              {AIMS.map((a, i) => (
                <li key={a} className="flex gap-4 rounded-xl bg-card p-4 shadow-soft">
                  <span className="font-display text-xl font-extrabold text-teal">{String(i + 1).padStart(2, "0")}</span>
                  <span>{a}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <SectionHeading eyebrow="Objectives" title="How we get there" />
            <ol className="space-y-2.5">
              {OBJECTIVES.map((o, i) => (
                <li key={o} className="flex gap-3 text-[0.95rem]">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <span className="text-muted-foreground">{o}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="container-page grid items-center gap-12 py-20 lg:grid-cols-2">
        <div>
          <SectionHeading eyebrow="Organisational identity" title="Who we are" />
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              ["Organisation", ORG.name],
              ["Motto", ORG.motto],
              ["Slogan", ORG.slogan],
              ["Base", ORG.location],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border bg-card p-4">
                <dt className="text-xs font-bold uppercase tracking-wider text-teal">{k}</dt>
                <dd className="mt-1 font-semibold text-primary">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            {ORG.hashtags.map((h) => (
              <span key={h} className="rounded-full bg-teal-soft px-3 py-1 text-sm font-semibold text-accent-foreground">
                {h}
              </span>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Arise Ashaiman Foundation is non-partisan. We engage constructively with all stakeholders in the interest of
            Ashaiman's development.
          </p>
        </div>
        <div className="rounded-3xl bg-navy-gradient p-10 text-on-dark shadow-lift">
          <img src={EMBLEM_URL} alt="" width={72} height={72} className="mb-6 h-18 w-18" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{ORG.founderTitle}</p>
          <h3 className="mt-2 text-3xl font-extrabold">{ORG.founder}</h3>
          <p className="mt-4 text-on-dark-muted">
            Dennis Enyonam Gewu founded Arise Ashaiman Foundation to grow a grassroots initiative for community
            participation into a lasting platform for communication, advocacy, mentorship and sustainable development
            in Ashaiman.
          </p>
          <Button asChild variant="gold" className="mt-8">
            <Link to="/leadership">
              Leadership & structure <ArrowRight />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
