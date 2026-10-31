import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone, Share2 } from "lucide-react";
import { PageHero } from "@/components/site/blocks";
import { ContactForm } from "@/components/forms/PublicForms";
import { SOCIAL_KEYS, useOrgSettings } from "@/hooks/use-org-settings";
import { ORG } from "@/lib/content";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Arise Ashaiman Foundation" },
      { name: "description", content: "Get in touch with Arise Ashaiman Foundation in Ashaiman, Greater Accra, Ghana." },
      { property: "og:title", content: "Contact Arise Ashaiman Foundation" },
      { property: "og:description", content: "Send us a message — we'd love to hear from you." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const { data: s, isLoading } = useOrgSettings();
  const socials = SOCIAL_KEYS.filter((k) => s?.[k.key]);
  const pending = <span className="text-muted-foreground italic">To be announced</span>;

  return (
    <>
      <PageHero eyebrow="Contact us" title="Let's talk" intro="Questions, ideas or media enquiries — send us a message." />
      <section className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_1.6fr]">
        <aside className="space-y-4">
          {[
            { icon: Mail, label: "Email", value: s?.contact_email ? <a className="hover:underline" href={`mailto:${s.contact_email}`}>{s.contact_email}</a> : pending },
            { icon: Phone, label: "Phone", value: s?.contact_phone ? <a className="hover:underline" href={`tel:${s.contact_phone}`}>{s.contact_phone}</a> : pending },
            { icon: MapPin, label: "Office", value: s?.office_address || ORG.location },
          ].map((c) => (
            <div key={c.label} className="flex gap-4 rounded-2xl border bg-card p-5 shadow-soft">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-soft text-teal">
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-teal">{c.label}</h2>
                <p className="mt-0.5 font-semibold text-primary">{isLoading ? "…" : c.value}</p>
              </div>
            </div>
          ))}
          <div className="rounded-2xl border bg-card p-5 shadow-soft">
            <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal">
              <Share2 className="h-4 w-4" /> Social media
            </h2>
            {socials.length ? (
              <div className="flex flex-wrap gap-2">
                {socials.map((k) => (
                  <a key={k.key} href={s![k.key]!} target="_blank" rel="noreferrer" className="rounded-full border px-3 py-1.5 text-sm font-medium hover:border-teal">
                    {k.label}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Official handles will be listed here soon.</p>
            )}
            <p className="mt-3 text-sm font-semibold text-primary">{ORG.hashtags.join("  ")}</p>
          </div>
        </aside>
        <div className="rounded-3xl border bg-card p-6 shadow-soft md:p-10">
          <ContactForm />
        </div>
      </section>
    </>
  );
}
