import { createFileRoute } from "@tanstack/react-router";
import { Check, Minus } from "lucide-react";
import { AdminPageHeader, RequireModule } from "@/components/admin/ui";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { MODULE_ACCESS, ROLES, type AppRole } from "@/lib/admin/roles";

export const Route = createFileRoute("/_authenticated/admin/roles")({ component: Page });

function Page() {
  const items = ADMIN_NAV.flatMap((g) => g.items);
  return (
    <RequireModule module="roles">
      <AdminPageHeader
        title="Roles & permissions"
        description="What each role can manage. These rules are enforced by the database itself, not just by hiding menu items. Assign roles on the Staff accounts page."
      />
      <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ROLES.map((r) => (
          <div key={r.value} className="rounded-2xl border bg-card p-4 shadow-soft">
            <p className="font-bold text-primary">{r.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">{r.summary}</p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/60 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th scope="col" className="px-4 py-3 text-left font-semibold">Section</th>
              {ROLES.map((r) => (
                <th key={r.value} scope="col" className="px-3 py-3 text-center font-semibold">
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {items.map((i) => {
              const allowed: readonly AppRole[] = MODULE_ACCESS[i.module];
              return (
                <tr key={i.to}>
                  <th scope="row" className="px-4 py-2.5 text-left font-medium">{i.label}</th>
                  {ROLES.map((r) => (
                    <td key={r.value} className="px-3 py-2.5 text-center">
                      {allowed.includes(r.value) ? (
                        <Check className="mx-auto h-4 w-4 text-success" aria-label="Allowed" />
                      ) : (
                        <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" aria-label="Not allowed" />
                      )}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Only the Super Admin can create staff accounts, change roles or deactivate accounts. At least one Super Admin must always remain.
      </p>
    </RequireModule>
  );
}
