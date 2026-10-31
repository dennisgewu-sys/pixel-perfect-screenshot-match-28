import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Check, MapPin, Mic, Repeat, UsersRound } from "lucide-react";
import { PageHero, SectionHeading, StatusBadge, EmptyState } from "@/components/site/blocks";
import { ProgrammeInterestForm, EventRegistrationForm } from "@/components/forms/PublicForms";
import { CLINIC_BENEFITS, CLINIC_FACILITATORS, CLINIC_MODULES, CLINIC_PARTICIPANTS } from "@/lib/content";
import { programmesQuery, upcomingEventsQuery } from "@/lib/public-queries";
import { formatDate } from "@/lib/format";
import mentorship from "@/assets/mentorship.jpg";

export const Route = createFileRoute("/programmes/mentorship-clinic")({
  head: () => ({
    meta: [
      { title: "Mentorship & Communication Clinic — Arise Ashaiman Foundation" },
      {
        name: "description",
        content:
          "Free quarterly clinics and an annual workshop on public speaking, media, fact-checking, leadership, civic education and entrepreneurship.",
      },
      { property: "og:title", content: "Arise Ashaiman Mentorship & Communication Clinic" },
      { property: "og:description", content: "Seven training modules for young people in Ashaiman. Register your interest." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Clinic,
});

const REG_LABEL: Record<string, string> = { open: "Open", closed: "Closed", coming_soon: "Coming Soon" };

function Clinic() {
  const { data: programmes } = useQuery(programmesQuery);
  const { data: events, isLoading: eventsLoading } = useQuery(upcomingEventsQuery);
  const programme = programmes?.find((p) => p.slug === "mentorship-communication-clinic");
  const regStatus = programme?.registration_status ?? "coming_soon";
  const clinicEvents = (events ?? []).filter((e) => programme && e.programme_id === programme.id);

  return (
    <>
      <PageHero
        eyebrow="Flagship programme"
        title="Arise Ashaiman Mentorship & Communication Clinic"
        intro="Building a generation of confident communicators, responsible leaders and active citizens."
        image={mentorship}
      >
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={programme?.status ?? "planned"} />
          <StatusBadge status={regStatus} label={`Registration: ${REG_LABEL[regStatus]}`} />
        </div>
      </PageHero>

      <section className="container-page grid gap-6 py-16 md:grid-cols-3">
        {[
          { icon: Repeat, title: "Frequency", text: "Quarterly clinics and one major annual mentorship workshop." },
          { icon: Mic, title: "Facilitators", text: CLINIC_FACILITATORS },
          { icon: UsersRound, title: "Cost", text: "Free for all selected participants." },
        ].map((c) => (
          <div key={c.title} className="rounded-2xl border bg-card p-6 shadow-soft">
            <c.icon className="mb-3 h-6 w-6 text-teal" />
            <h2 className="text-lg font-bold text-primary">{c.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{c.text}</p>
          </div>
        ))}
      </section>

      <section className="bg-secondary py-20">
        <div className="container-page grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Curriculum" title="Seven training modules" />
            <ol className="space-y-3">
              {CLINIC_MODULES.map((m, i) => (
                <li key={m} className="flex items-center gap-4 rounded-xl bg-card p-4 shadow-soft">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary font-display font-extrabold text-gold">
                    {i + 1}
                  </span>
                  <span className="font-semibold">{m}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="space-y-12">
            <div>
              <SectionHeading eyebrow="Who it's for" title="Target participants" className="mb-6" />
              <div className="flex flex-wrap gap-2">
                {CLINIC_PARTICIPANTS.map((p) => (
                  <span key={p} className="rounded-full border bg-card px-4 py-2 text-sm font-medium">
                    {p}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <SectionHeading eyebrow="Benefits" title="What you'll gain" className="mb-6" />
              <ul className="grid gap-3 sm:grid-cols-2">
                {CLINIC_BENEFITS.map((b) => (
                  <li key={b} className="flex gap-2 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" /> {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-20">
        <SectionHeading eyebrow="Dates" title="Upcoming programme dates" intro="Dates are announced by the programme team. Check back for updates." />
        {eventsLoading ? (
          <div className="h-32 animate-pulse rounded-2xl bg-muted" />
        ) : clinicEvents.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No dates announced yet">
            Upcoming clinic dates will be published here. Register your interest below to be notified.
          </EmptyState>
        ) : (
          <div className="space-y-4">
            {clinicEvents.map((ev) => (
              <article key={ev.id} className="rounded-2xl border bg-card p-6 shadow-soft">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-primary">{ev.title}</h3>
                    <p className="mt-1 flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" /> {formatDate(ev.start_at, true)}
                      </span>
                      {ev.location && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-4 w-4" /> {ev.location}
                        </span>
                      )}
                    </p>
                  </div>
                  <StatusBadge status={ev.registration_status} label={`Registration: ${REG_LABEL[ev.registration_status]}`} />
                </div>
                {ev.description && <p className="mt-3 text-sm text-muted-foreground">{ev.description}</p>}
                {ev.registration_status === "open" && (
                  <div className="mt-5 border-t pt-5">
                    <EventRegistrationForm eventId={ev.id} />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <section id="register" className="scroll-mt-24 bg-secondary py-20">
        <div className="container-page max-w-3xl">
          <SectionHeading
            eyebrow={regStatus === "open" ? "Applications open" : "Register interest"}
            title={regStatus === "open" ? "Apply for the clinic" : "Be the first to know"}
            intro={
              regStatus === "closed"
                ? "Registration is currently closed. You can still register interest for future clinics."
                : regStatus === "open"
                  ? "Complete the form below to apply."
                  : "Registration is coming soon. Leave your details and we'll contact you when it opens."
            }
          />
          <div className="rounded-3xl border bg-card p-6 shadow-soft md:p-10">
            <ProgrammeInterestForm programmeId={programme?.id ?? null} registrationStatus={regStatus} />
          </div>
        </div>
      </section>
    </>
  );
}
