import type { ReactNode } from "react";
import { ShieldX } from "lucide-react";
import { canAccess, type AdminModule } from "@/lib/admin/roles";
import { useStaff } from "@/lib/admin/staff-context";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

/** Hides a section from staff whose role can't use it. The database rules block the data regardless. */
export function RequireModule({ module, children }: { module: AdminModule; children: ReactNode }) {
  const staff = useStaff();
  if (!canAccess(module, staff.roles)) {
    return (
      <div className="rounded-2xl border border-dashed bg-card px-6 py-16 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
          <ShieldX className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-bold text-primary">You don't have access to this section</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          Your role doesn't include this area. Ask the Super Admin if you need access.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "primary" | "teal" | "gold";
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-muted-foreground">{label}</p>
        {Icon && (
          <span
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg",
              tone === "primary" && "bg-secondary text-primary",
              tone === "teal" && "bg-teal-soft text-teal",
              tone === "gold" && "bg-gold-soft text-gold-foreground",
            )}
          >
            <Icon className="h-4 w-4" />
          </span>
        )}
      </div>
      <p className="mt-2 font-display text-3xl font-extrabold text-primary">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function Panel({ title, actions, children, className }: { title?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border bg-card shadow-soft", className)}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b px-5 py-3.5">
          <h2 className="text-base font-bold text-primary">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export const selectClass =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
