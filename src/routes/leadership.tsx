import { createFileRoute } from "@tanstack/react-router";
import { Crown, UserRound } from "lucide-react";
import { PageHero, SectionHeading, StatusBadge } from "@/components/site/blocks";
import { EXECUTIVE_COUNCIL, OPERATIONAL_WINGS, ORG } from "@/lib/content";
import { EMBLEM_URL } from "@/components/site/Logo";

export const Route = createFileRoute("/leadership")({
  head: () => ({
    meta: [
      { title: "Leadership & Organisational Structure — Arise Ashaiman Foundation" },
      {
        name: "description",
        content: "Founder Dennis Enyonam Gewu, the Executive Council and the operational wings of Arise Ashaiman Foundation.",
      },
      { property: "og:title", content: "Leadership — Arise Ashaiman Foundation" },
      { property: "og:description", content: "Meet our founder and explore the Foundation's organisational structure." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Leadership,
});

function Leadership() {
  return (
    <>
      <PageHero eyebrow="Leadership" title="Leadership & organisational structure" intro="How the Foundation is organised to serve Ashaiman." />

      <section className="container-page py-20">
        <div className="mx-auto max-w-3xl rounded-3xl bg-navy-gradient p-10 text-center text-on-dark shadow-lift">
          <img src={EMBLEM_URL} alt="" width={80} height={80} className="mx-auto mb-5 h-20 w-20" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">{ORG.founderTitle}</p>
          <h2 className="mt-2 text-4xl font-extrabold">{ORG.founder}</h2>
        </div>

        <div className="mx-auto mt-6 grid max-w-3xl gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border bg-card p-6 text-center shadow-soft">
            <Crown className="mx-auto mb-2 h-6 w-6 text-gold" />
            <h3 className="font-bold text-primary">Patron</h3>
            <StatusBadge status="to_be_appointed" label="To Be Appointed" className="mt-2" />
          </div>
          <div className="rounded-2xl border bg-card p-6 text-center shadow-soft">
            <UserRound className="mx-auto mb-2 h-6 w-6 text-gold" />
            <h3 className="font-bold text-primary">Board of Advisors</h3>
            <StatusBadge status="to_be_appointed" label="To Be Constituted" className="mt-2" />
          </div>
        </div>
      </section>

      <section className="bg-secondary py-20">
        <div className="container-page">
          <SectionHeading eyebrow="Executive Council" title="Directors & officers" align="center" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {EXECUTIVE_COUNCIL.map((role) => {
              const [title, dept] = role.split(" — ");
              return (
                <article key={role} className="rounded-2xl border bg-card p-6 shadow-soft">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <UserRound className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-teal">{title}</p>
                  <h3 className="mt-1 font-bold leading-snug text-primary">{dept}</h3>
                  <StatusBadge status="to_be_appointed" label="To Be Appointed" className="mt-4" />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <SectionHeading eyebrow="Operational wings" title="How we reach the community" align="center" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {OPERATIONAL_WINGS.map((w) => (
            <article key={w.name} className="rounded-2xl border bg-card p-6 shadow-soft">
              <StatusBadge status="planned" />
              <h3 className="mt-3 font-bold text-primary">{w.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{w.note}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
