import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, CalendarDays, Eye, HandHeart, Megaphone, Target, UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionHeading, StatusBadge, EmptyState } from "@/components/site/blocks";
import { CLINIC_MODULES, MISSION, ORG, PILLARS, ROADMAP, VISION } from "@/lib/content";
import { newsListQuery } from "@/lib/public-queries";
import { formatDate } from "@/lib/format";
import hero from "@/assets/hero-community.jpg";
import mentorship from "@/assets/mentorship.jpg";
import dialogue from "@/assets/community-dialogue.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Arise Ashaiman Foundation — Together, We Can Build a Better Ashaiman" },
      {
        name: "description",
        content:
          "A youth-driven community development, advocacy, mentorship and civic engagement foundation in Ashaiman, Greater Accra. We Dey Together!",
      },
      { property: "og:title", content: "Arise Ashaiman Foundation — We Dey Together!" },
      {
        property: "og:description",
        content: "Arise for Development, Arise for Ashaiman. Mentorship, advocacy and community development.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <>
      <Hero />
      <VisionMission />
      <PillarsPreview />
      <FlagshipProgramme />
      <AdvocacySection />
      <RoadmapPreview />
      <LatestNews />
      <GetInvolvedCta />
    </>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden text-on-dark">
      <img
        src={hero}
        alt="Young people in conversation on a busy Greater Accra street"
        width={1920}
        height={1088}
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-hero-overlay" />
      <div className="container-page flex min-h-[86vh] flex-col justify-center py-24">
        <p className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-on-dark/25 bg-on-dark/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-gold backdrop-blur animate-rise">
          {ORG.motto}
        </p>
        <h1 className="max-w-4xl text-5xl font-extrabold leading-[1.02] md:text-7xl animate-rise">
          Together, We Can Build a <span className="text-gold">Better Ashaiman.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-on-dark-muted md:text-xl animate-rise [animation-delay:120ms]">
          Arise Ashaiman Foundation is a youth-driven social, advocacy, mentorship and community development
          organisation committed to improving the lives of people in Ashaiman.
        </p>
        <div className="mt-10 flex flex-wrap gap-3 animate-rise [animation-delay:220ms]">
          <Button asChild variant="gold" size="xl">
            <Link to="/about">
              Learn About Us <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline-light" size="xl">
            <Link to="/get-involved" hash="volunteer">
              <UserPlus /> Become a Volunteer
            </Link>
          </Button>
          <Button asChild variant="outline-light" size="xl">
            <Link to="/get-involved" hash="partner">
              <HandHeart /> Support Our Mission
            </Link>
          </Button>
        </div>
        <p className="mt-12 text-sm font-semibold text-on-dark-muted">{ORG.slogan}</p>
      </div>
    </section>
  );
}

function VisionMission() {
  return (
    <section className="container-page -mt-16 relative z-10 grid gap-5 md:grid-cols-2">
      {[
        { icon: Eye, label: "Our Vision", text: VISION, tone: "bg-card" },
        { icon: Target, label: "Our Mission", text: MISSION, tone: "bg-card" },
      ].map(({ icon: Icon, label, text, tone }) => (
        <article key={label} className={`${tone} rounded-2xl border p-8 shadow-lift`}>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-gradient text-teal-foreground">
            <Icon className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-extrabold text-primary">{label}</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{text}</p>
        </article>
      ))}
    </section>
  );
}

function PillarsPreview() {
  return (
    <section className="container-page py-24">
      <SectionHeading
        eyebrow="What guides us"
        title="Our Five Core Pillars"
        intro="Everything we do is anchored in five pillars that work together for Ashaiman's development."
        align="center"
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {PILLARS.map((p) => (
          <article
            key={p.number}
            className="group rounded-2xl border bg-card p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-teal/40 hover:shadow-lift"
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-gold transition-colors group-hover:bg-teal group-hover:text-teal-foreground">
                <p.icon className="h-6 w-6" />
              </div>
              <span className="font-display text-3xl font-extrabold text-border">0{p.number}</span>
            </div>
            <h3 className="text-base font-bold leading-snug text-primary">{p.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.short}</p>
          </article>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Button asChild variant="outline">
          <Link to="/pillars">
            Explore our pillars <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}

function FlagshipProgramme() {
  return (
    <section className="bg-secondary py-24">
      <div className="container-page grid items-center gap-12 lg:grid-cols-2">
        <div className="relative">
          <img
            src={mentorship}
            alt="A young woman speaking to students in a classroom"
            loading="lazy"
            width={1280}
            height={960}
            className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lift"
          />
          <div className="absolute -bottom-6 -right-4 hidden rounded-2xl bg-gold p-5 text-gold-foreground shadow-lift md:block">
            <p className="font-display text-3xl font-extrabold">7</p>
            <p className="text-xs font-bold uppercase tracking-wider">Training modules</p>
          </div>
        </div>
        <div>
          <div className="mb-4 flex items-center gap-3">
            <p className="eyebrow">Flagship programme</p>
            <StatusBadge status="planned" />
          </div>
          <h2 className="text-3xl font-extrabold text-primary md:text-4xl">
            Arise Ashaiman Mentorship & Communication Clinic
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Quarterly clinics and one major annual mentorship workshop — free for young people — building
            confidence, communication and civic leadership.
          </p>
          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {CLINIC_MODULES.slice(0, 6).map((m) => (
              <li key={m} className="flex gap-2 text-sm">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-teal" />
                {m}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/programmes/mentorship-clinic">
                About the clinic <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/programmes/mentorship-clinic" hash="register">
                Register interest
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function AdvocacySection() {
  return (
    <section className="container-page grid items-center gap-12 py-24 lg:grid-cols-2">
      <div className="order-2 lg:order-1">
        <p className="eyebrow mb-3">Community development & advocacy</p>
        <h2 className="text-3xl font-extrabold text-primary md:text-4xl">A platform for every voice in Ashaiman</h2>
        <p className="mt-4 text-lg text-muted-foreground">
          We promote accountability, highlight development challenges and help residents engage relevant
          authorities constructively — through facts, research and responsible communication.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link to="/feedback" className="group rounded-2xl border bg-card p-5 shadow-soft transition hover:border-teal/50">
            <Megaphone className="mb-3 h-6 w-6 text-teal" />
            <h3 className="font-bold text-primary">Raise a concern</h3>
            <p className="mt-1 text-sm text-muted-foreground">Share community issues privately with our team.</p>
          </Link>
          <Link to="/projects" className="group rounded-2xl border bg-card p-5 shadow-soft transition hover:border-teal/50">
            <Users className="mb-3 h-6 w-6 text-teal" />
            <h3 className="font-bold text-primary">Projects & impact</h3>
            <p className="mt-1 text-sm text-muted-foreground">Follow community projects as they take shape.</p>
          </Link>
        </div>
      </div>
      <img
        src={dialogue}
        alt="Community members of different ages talking under a shade tree"
        loading="lazy"
        width={1280}
        height={960}
        className="order-1 aspect-[4/3] w-full rounded-3xl object-cover shadow-lift lg:order-2"
      />
    </section>
  );
}

function RoadmapPreview() {
  return (
    <section className="bg-navy-gradient py-24 text-on-dark">
      <div className="container-page">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-gold">Roadmap</p>
            <h2 className="text-3xl font-extrabold md:text-4xl">Where we're headed</h2>
            <p className="mt-3 text-on-dark-muted">Our organisational plans in four phases. These are goals, not completed achievements.</p>
          </div>
          <Button asChild variant="outline-light">
            <Link to="/roadmap">
              Full roadmap <ArrowRight />
            </Link>
          </Button>
        </div>
        <ol className="grid gap-4 md:grid-cols-4">
          {ROADMAP.map((p) => (
            <li key={p.phase} className="relative rounded-2xl border border-on-dark/15 bg-on-dark/5 p-6 backdrop-blur">
              <p className="font-display text-sm font-bold text-gold">Phase {p.phase}</p>
              <h3 className="mt-1 text-lg font-bold">{p.title}</h3>
              <p className="text-sm text-on-dark-muted">{p.period}</p>
              <p className="mt-3 text-sm text-on-dark-muted">{p.items[0]}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function LatestNews() {
  const { data, isLoading } = useQuery(newsListQuery(3));
  return (
    <section className="container-page py-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <SectionHeading eyebrow="Latest" title="News & Announcements" className="mb-0" />
        <Button asChild variant="outline">
          <Link to="/news">
            All news <ArrowRight />
          </Link>
        </Button>
      </div>
      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <div className="grid gap-5 md:grid-cols-3">
          {data.map((n) => (
            <Link
              key={n.id}
              to="/news/$slug"
              params={{ slug: n.slug }}
              className="group overflow-hidden rounded-2xl border bg-card shadow-soft transition hover:shadow-lift"
            >
              {n.featured_image_url ? (
                <img src={n.featured_image_url} alt="" loading="lazy" className="aspect-video w-full object-cover" />
              ) : (
                <div className="aspect-video bg-teal-gradient" />
              )}
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-teal">{n.category}</p>
                <h3 className="mt-2 font-bold leading-snug text-primary group-hover:underline">{n.title}</h3>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" /> {formatDate(n.published_at)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState icon={Megaphone} title="No announcements yet">
          Official news and announcements from the Foundation will appear here once published.
        </EmptyState>
      )}
    </section>
  );
}

function GetInvolvedCta() {
  return (
    <section className="container-page pb-24">
      <div className="relative overflow-hidden rounded-3xl bg-teal-gradient p-10 text-teal-foreground md:p-16">
        <div className="absolute inset-0 pattern-dots" />
        <div className="relative grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-extrabold md:text-5xl">Arise with us.</h2>
            <p className="mt-4 max-w-xl text-lg opacity-90">
              Join as a member, volunteer your skills, or partner with us to support Ashaiman's development.
            </p>
          </div>
          <div className="grid gap-3">
            {(
              [
                ["member", "Become a Member"],
                ["volunteer", "Become a Volunteer"],
                ["partner", "Partner With Us"],
              ] as const
            ).map(([hash, label]) => (
              <Link
                key={hash}
                to="/get-involved"
                hash={hash}
                className="flex items-center justify-between rounded-xl bg-on-dark/15 px-5 py-4 font-semibold backdrop-blur transition hover:bg-on-dark/25"
              >
                {label} <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
