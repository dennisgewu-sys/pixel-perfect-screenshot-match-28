import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { humanize } from "@/lib/format";

export function PageHero({
  eyebrow,
  title,
  intro,
  image,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  image?: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden bg-navy-gradient text-on-dark">
      {image && (
        <img src={image} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      )}
      <div className={cn("absolute inset-0 -z-10", image ? "bg-hero-overlay" : "pattern-dots")} />
      <div className="container-page py-16 md:py-24">
        <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-gold animate-rise">{eyebrow}</p>
        <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.05] md:text-6xl animate-rise">{title}</h1>
        {intro && (
          <p className="mt-5 max-w-2xl text-lg text-on-dark-muted animate-rise [animation-delay:120ms]">{intro}</p>
        )}
        {children && <div className="mt-8 animate-rise [animation-delay:200ms]">{children}</div>}
      </div>
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("mb-10 max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="text-3xl font-extrabold text-primary md:text-4xl">{title}</h2>
      {intro && <p className="mt-4 text-base text-muted-foreground md:text-lg">{intro}</p>}
    </div>
  );
}

const STATUS_TONES: Record<string, string> = {
  planned: "bg-gold-soft text-gold-foreground border-gold/40",
  coming_soon: "bg-gold-soft text-gold-foreground border-gold/40",
  pending_review: "bg-gold-soft text-gold-foreground border-gold/40",
  new: "bg-teal-soft text-accent-foreground border-teal/30",
  draft: "bg-muted text-muted-foreground border-border",
  open: "bg-success/15 text-success border-success/30",
  active: "bg-success/15 text-success border-success/30",
  ongoing: "bg-teal-soft text-accent-foreground border-teal/30",
  published: "bg-success/15 text-success border-success/30",
  approved: "bg-success/15 text-success border-success/30",
  accepted: "bg-success/15 text-success border-success/30",
  resolved: "bg-success/15 text-success border-success/30",
  completed: "bg-primary/10 text-primary border-primary/20",
  confirmed: "bg-success/15 text-success border-success/30",
  closed: "bg-muted text-muted-foreground border-border",
  archived: "bg-muted text-muted-foreground border-border",
  on_hold: "bg-warning/20 text-warning-foreground border-warning/40",
  paused: "bg-warning/20 text-warning-foreground border-warning/40",
  postponed: "bg-warning/20 text-warning-foreground border-warning/40",
  info_requested: "bg-warning/20 text-warning-foreground border-warning/40",
  under_review: "bg-teal-soft text-accent-foreground border-teal/30",
  in_progress: "bg-teal-soft text-accent-foreground border-teal/30",
  referred: "bg-primary/10 text-primary border-primary/20",
  shortlisted: "bg-primary/10 text-primary border-primary/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
  declined: "bg-destructive/10 text-destructive border-destructive/30",
  cancelled: "bg-destructive/10 text-destructive border-destructive/30",
  to_be_appointed: "bg-gold-soft text-gold-foreground border-gold/40",
};

export function StatusBadge({ status, label, className }: { status: string; label?: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider",
        STATUS_TONES[status] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      {label ?? humanize(status)}
    </span>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  children,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-dashed bg-card px-6 py-14 text-center", className)}>
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-soft text-teal">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-bold text-primary">{title}</h3>
      {children && <div className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}
