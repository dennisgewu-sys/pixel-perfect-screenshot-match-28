import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ExternalLink, Loader2, LogOut, Menu, ShieldAlert, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { EMBLEM_URL } from "@/components/site/Logo";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { canAccess, roleLabel } from "@/lib/admin/roles";
import { StaffProvider, staffSessionQuery, type StaffSession } from "@/lib/admin/staff-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Arise Ashaiman Foundation" },
      { name: "description", content: "Staff administration dashboard for Arise Ashaiman Foundation." },
      { property: "og:title", content: "Admin — Arise Ashaiman Foundation" },
      { property: "og:description", content: "Staff administration dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminLayout,
});

function useSignOut() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };
}

function AdminLayout() {
  const { data: staff, isLoading, error } = useQuery(staffSessionQuery);
  const signOut = useSignOut();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading your workspace…
      </div>
    );
  }
  if (error || !staff) {
    return (
      <Gate title="We couldn't load your account" onSignOut={signOut}>
        {error instanceof Error ? error.message : "Please sign in again."}
      </Gate>
    );
  }
  if (!staff.isActive) {
    return (
      <Gate title="Account deactivated" onSignOut={signOut}>
        This staff account has been deactivated. Contact the Foundation's Super Admin if this is a mistake.
      </Gate>
    );
  }
  if (staff.roles.length === 0) {
    return <NoRole staff={staff} onSignOut={signOut} />;
  }
  return (
    <StaffProvider value={staff}>
      <Shell staff={staff} onSignOut={signOut} />
    </StaffProvider>
  );
}

function Gate({ title, children, onSignOut, action }: { title: string; children: React.ReactNode; onSignOut: () => void; action?: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary px-5">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 text-center shadow-soft">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold-soft text-gold-foreground">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-primary">{title}</h1>
        <div className="mt-3 text-sm text-muted-foreground">{children}</div>
        <div className="mt-6 flex flex-col gap-2">
          {action}
          <Button variant="outline" onClick={onSignOut}>
            <LogOut /> Sign out
          </Button>
        </div>
      </div>
    </div>
  );
}

function NoRole({ staff, onSignOut }: { staff: StaffSession; onSignOut: () => void }) {
  const queryClient = useQueryClient();
  const [claiming, setClaiming] = useState(false);

  async function claim() {
    setClaiming(true);
    const { error } = await supabase.rpc("claim_initial_super_admin");
    setClaiming(false);
    if (error) return toast.error(error.message);
    toast.success("You are now the Super Admin.");
    queryClient.invalidateQueries({ queryKey: ["staff-session"] });
  }

  if (!staff.superAdminExists) {
    return (
      <Gate
        title="Set up the Super Admin"
        onSignOut={onSignOut}
        action={
          <Button onClick={claim} disabled={claiming}>
            {claiming && <Loader2 className="animate-spin" />} Make me the Super Admin
          </Button>
        }
      >
        No Super Admin exists yet. As the first person to sign in ({staff.email}), you can claim full access.
        After that, only you can create staff accounts and give out roles.
      </Gate>
    );
  }
  return (
    <Gate title="Waiting for access" onSignOut={onSignOut}>
      You're signed in as {staff.email}, but no role has been assigned to you yet. Ask the Foundation's Super Admin to
      give you a role.
    </Gate>
  );
}

function Shell({ staff, onSignOut }: { staff: StaffSession; onSignOut: () => void }) {
  const [open, setOpen] = useState(false);
  const groups = ADMIN_NAV.map((g) => ({ ...g, items: g.items.filter((i) => canAccess(i.module, staff.roles)) })).filter(
    (g) => g.items.length > 0,
  );

  const nav = (
    <nav aria-label="Admin" className="space-y-6">
      {groups.map((g) => (
        <div key={g.group}>
          <p className="mb-2 px-3 text-[0.65rem] font-bold uppercase tracking-[0.18em] text-sidebar-foreground/50">{g.group}</p>
          <ul className="space-y-0.5">
            {g.items.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: item.to === "/admin" }}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground" }}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );

  const footer = (
    <div className="border-t border-sidebar-border p-4">
      <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">{staff.fullName || staff.email}</p>
      <p className="truncate text-xs text-sidebar-foreground/60">{staff.roles.map(roleLabel).join(", ")}</p>
      <div className="mt-3 flex gap-2">
        <Button asChild size="sm" variant="ghost" className="flex-1 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <Link to="/">
            <ExternalLink /> Website
          </Link>
        </Button>
        <Button size="sm" variant="ghost" onClick={onSignOut} className="flex-1 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
          <LogOut /> Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary/60 lg:flex">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar lg:flex">
        <Brand />
        <div className="flex-1 overflow-y-auto px-3 py-4">{nav}</div>
        {footer}
      </aside>

      <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-sidebar px-4 lg:hidden">
        <Brand compact />
        <Button
          size="icon"
          variant="ghost"
          className="text-sidebar-foreground hover:bg-sidebar-accent"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          {open ? <X /> : <Menu />}
        </Button>
      </header>
      {open && (
        <div className="fixed inset-x-0 bottom-0 top-14 z-40 flex flex-col overflow-y-auto bg-sidebar lg:hidden">
          <div className="flex-1 px-3 py-4">{nav}</div>
          {footer}
        </div>
      )}

      <main id="main" className="min-w-0 flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  return (
    <Link to="/admin" className={cn("flex items-center gap-2.5", compact ? "" : "px-5 py-5")}>
      <img src={EMBLEM_URL} alt="" className="h-9 w-9 object-contain" />
      <span className="leading-none">
        <span className="block font-display text-sm font-extrabold text-sidebar-accent-foreground">ARISE ASHAIMAN</span>
        <span className="mt-1 block text-[0.6rem] font-semibold tracking-[0.28em] text-sidebar-primary">STAFF</span>
      </span>
    </Link>
  );
}
