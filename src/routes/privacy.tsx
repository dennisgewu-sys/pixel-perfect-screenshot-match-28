import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/blocks";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice — Arise Ashaiman Foundation" },
      { name: "description", content: "How Arise Ashaiman Foundation collects, uses and protects personal information." },
      { property: "og:title", content: "Privacy Notice — Arise Ashaiman Foundation" },
      { property: "og:description", content: "How we handle the information you share with us." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

const SECTIONS = [
  {
    h: "What we collect",
    p: "We only collect the information needed for the purpose of each form — for example your name, contact details and community when you apply for membership, volunteer, register for a programme, send an enquiry or submit community feedback. Name and contact details on the community feedback form are optional.",
  },
  {
    h: "How we use it",
    p: "We use your information to process your application or enquiry, contact you about the programme or concern you raised, and organise Foundation activities. We do not sell your information, and we never use it for partisan political purposes.",
  },
  {
    h: "Who can see it",
    p: "Submissions are stored securely and are only accessible to authorised Foundation staff whose role requires it. Community feedback is confidential and is never published with your personal details.",
  },
  {
    h: "Payments",
    p: "This website does not process payments and will never ask for mobile money PINs, passwords or banking credentials.",
  },
  {
    h: "Your choices",
    p: "You may ask us to correct or delete your personal information at any time by contacting us through the Contact page. This notice is aligned with the principles of Ghana's Data Protection Act, 2012 (Act 843).",
  },
];

function Privacy() {
  return (
    <>
      <PageHero eyebrow="Privacy" title="Privacy notice" intro="How we handle the information you share with us." />
      <section className="container-page max-w-3xl space-y-8 py-16">
        {SECTIONS.map((s) => (
          <div key={s.h}>
            <h2 className="text-xl font-extrabold text-primary">{s.h}</h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">{s.p}</p>
          </div>
        ))}
      </section>
    </>
  );
}
