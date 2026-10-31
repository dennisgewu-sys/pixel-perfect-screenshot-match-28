import { createFileRoute } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { PageHero } from "@/components/site/blocks";
import { EmergencyNotice, FeedbackForm } from "@/components/forms/PublicForms";
import dialogue from "@/assets/community-dialogue.jpg";

export const Route = createFileRoute("/feedback")({
  head: () => ({
    meta: [
      { title: "Community Feedback — Your Voice Matters | Arise Ashaiman" },
      {
        name: "description",
        content: "Raise community concerns about roads, sanitation, education, health, youth, jobs and public services in Ashaiman.",
      },
      { property: "og:title", content: "Your Voice Matters. Help Us Build a Better Ashaiman." },
      { property: "og:description", content: "Share community concerns privately with Arise Ashaiman Foundation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Feedback,
});

function Feedback() {
  return (
    <>
      <PageHero
        eyebrow="Community feedback"
        title="Your Voice Matters. Help Us Build a Better Ashaiman."
        intro="Tell us about concerns in your community. We review every submission and engage relevant authorities constructively."
        image={dialogue}
      />
      <section className="container-page grid gap-10 py-16 lg:grid-cols-[1fr_1.7fr]">
        <aside className="space-y-5">
          <EmergencyNotice />
          <div className="rounded-xl border bg-card p-5 text-sm">
            <Lock className="mb-2 h-5 w-5 text-teal" />
            <h2 className="font-bold text-primary">Private and confidential</h2>
            <p className="mt-1 text-muted-foreground">
              Your submission is only visible to authorised Foundation staff. Your name and contact details are optional —
              you can submit anonymously.
            </p>
          </div>
        </aside>
        <div className="rounded-3xl border bg-card p-6 shadow-soft md:p-10">
          <FeedbackForm />
        </div>
      </section>
    </>
  );
}
