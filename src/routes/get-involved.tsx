import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Handshake, HeartHandshake } from "lucide-react";
import { PageHero } from "@/components/site/blocks";
import { ContactForm, MembershipForm, VolunteerForm } from "@/components/forms/PublicForms";
import hero from "@/assets/hero-community.jpg";

export const Route = createFileRoute("/get-involved")({
  head: () => ({
    meta: [
      { title: "Get Involved — Arise Ashaiman Foundation" },
      { name: "description", content: "Become a member, volunteer your skills or partner with Arise Ashaiman Foundation." },
      { property: "og:title", content: "Get Involved — Arise Ashaiman Foundation" },
      { property: "og:description", content: "Join us as a member, volunteer or partner. We Dey Together!" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GetInvolved,
});

const SECTIONS = [
  {
    id: "member",
    icon: BadgeCheck,
    title: "Become a Member",
    intro: "Join the Foundation and take part in shaping Ashaiman's development. Applications are reviewed by our team.",
    form: <MembershipForm />,
  },
  {
    id: "volunteer",
    icon: HeartHandshake,
    title: "Become a Volunteer",
    intro: "Give your time and skills — media, mentorship, mobilisation, research and more.",
    form: <VolunteerForm />,
  },
  {
    id: "partner",
    icon: Handshake,
    title: "Partner With Us",
    intro:
      "Organisations, institutions and individuals who share our mission can support programmes, projects and community initiatives.",
    form: <ContactForm type="partnership" />,
  },
];

function GetInvolved() {
  return (
    <>
      <PageHero eyebrow="Get involved" title="Arise with us — We Dey Together!" intro="Three ways to support Ashaiman's development." image={hero}>
        <nav aria-label="Sections" className="flex flex-wrap gap-2">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="rounded-full border border-on-dark/30 bg-on-dark/10 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-on-dark/20">
              {s.title}
            </a>
          ))}
        </nav>
      </PageHero>
      {SECTIONS.map((s, i) => (
        <section key={s.id} id={s.id} className={`scroll-mt-20 py-20 ${i % 2 ? "bg-secondary" : ""}`}>
          <div className="container-page grid gap-10 lg:grid-cols-[1fr_1.6fr]">
            <div>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-gradient text-teal-foreground">
                <s.icon className="h-7 w-7" />
              </div>
              <h2 className="text-3xl font-extrabold text-primary">{s.title}</h2>
              <p className="mt-3 text-muted-foreground">{s.intro}</p>
            </div>
            <div className="rounded-3xl border bg-card p-6 shadow-soft md:p-10">{s.form}</div>
          </div>
        </section>
      ))}
    </>
  );
}
