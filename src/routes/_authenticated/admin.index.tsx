import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarDays,
  ClipboardList,
  FolderKanban,
  HandCoins,
  HandHeart,
  Megaphone,
  MessageSquareWarning,
  Users,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader, Panel, StatCard } from "@/components/admin/ui";
import { canAccess, type AdminModule } from "@/lib/admin/roles";
import { useStaff } from "@/lib/admin/staff-context";
import { formatDate, formatGHS, humanize } from "@/lib/format";
import type { AdminNavItem } from "@/lib/admin/nav";

export const Route = createFileRoute("/_authenticated/admin/")({ component: Dashboard });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as unknown as { from: (t: string) => any };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function count(table: string, apply?: (q: any) => any): Promise<number> {
  let q = db.from(table).select("id", { count: "exact", head: true });
  if (apply) q = apply(q);
  const { count: c, error } = await q;
  if (error) throw error;
  return c ?? 0;
}

function Dashboard() {
  const staff = useStaff();
  const can = (m: AdminModule) => canAccess(m, staff.roles);
  const now = new Date().toISOString();

  const stats = useQuery({
    queryKey: ["admin-dashboard", staff.roles.join(",")],
    queryFn: async () => {
      const out: Record<string, number | null> = {};
      const jobs: Promise<void>[] = [];
      const add = (k: string, m: AdminModule, fn: () => Promise<number>) => {
        if (!can(m)) return;
        jobs.push(fn().then((v) => void (out[k] = v)));
      };
      add("members", "members", () => count("members", (q) => q.neq("status", "archived")));
      add("membersPending", "members", () => count("members", (q) => q.eq("status", "pending_review")));
      add("volunteers", "volunteers", () => count("volunteer_applications", (q) => q.neq("status", "archived")));
      add("volunteersNew", "volunteers", () => count("volunteer_applications", (q) => q.eq("status", "new")));
      add("programmes", "programmes", () => count("programmes", (q) => q.eq("is_archived", false).eq("status", "active")));
      add("applicationsNew", "applications", () => count("programme_applications", (q) => q.eq("status", "new")));
      add("projects", "projects", () => count("projects", (q) => q.eq("is_archived", false)));
      add("events", "events", () => count("events", (q) => q.eq("is_archived", false).gte("start_at", now)));
      add("news", "dashboard", () => count("news_posts", (q) => q.eq("status", "published")));
      add("feedback", "feedback", () => count("community_feedback", (q) => q.in("status", ["new", "under_review"])));
      add("enquiriesNew", "enquiries", () => count("contact_enquiries", (q) => q.eq("status", "new")));
      if (can("donations")) {
        jobs.push(
          (async () => {
            const { data, error } = await supabase.from("donations").select("amount").eq("is_archived", false);
            if (error) throw error;
            out["donations"] = (data ?? []).reduce((s, d) => s + Number(d.amount), 0);
          })(),
        );
      }
      await Promise.all(jobs);
      return out;
    },
  });

  const upcoming = useQuery({
    queryKey: ["admin-dashboard", "upcoming"],
    enabled: can("events"),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id,title,start_at,location,registration_status")
        .eq("is_archived", false)
        .gte("start_at", now)
        .order("start_at")
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const activity = useQuery({
    queryKey: ["admin-dashboard", "activity"],
    enabled: can("audit"),
    queryFn: async () => {
      const { data, error } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(8);
      if (error) throw error;
      return data;
    },
  });

  const s = stats.data ?? {};
  const v = (k: string) => (stats.isLoading ? "…" : (s[k] ?? 0).toLocaleString("en-GB"));

  const cards: { k: string; m: AdminModule; label: string; icon: typeof Users; tone?: "primary" | "teal" | "gold"; value?: string }[] = [
    { k: "members", m: "members", label: "Total members", icon: Users },
    { k: "volunteers", m: "volunteers", label: "Total volunteers", icon: HandHeart, tone: "teal" },
    { k: "programmes", m: "programmes", label: "Active programmes", icon: ClipboardList, tone: "gold" },
    { k: "projects", m: "projects", label: "Total projects", icon: FolderKanban },
    { k: "events", m: "events", label: "Upcoming events", icon: CalendarDays, tone: "teal" },
    { k: "news", m: "dashboard", label: "Published news", icon: Megaphone, tone: "gold" },
    { k: "feedback", m: "feedback", label: "Pending feedback", icon: MessageSquareWarning },
    {
      k: "donations",
      m: "donations",
      label: "Donations received",
      icon: HandCoins,
      tone: "teal",
      value: stats.isLoading ? "…" : formatGHS(s["donations"] ?? 0),
    },
  ];

  const todo: { k: string; m: AdminModule; label: string; to: AdminNavItem["to"] }[] = [
    { k: "membersPending", m: "members", label: "Membership applications pending review", to: "/admin/members" },
    { k: "volunteersNew", m: "volunteers", label: "New volunteer applications", to: "/admin/volunteers" },
    { k: "applicationsNew", m: "applications", label: "New programme applications", to: "/admin/applications" },
    { k: "feedback", m: "feedback", label: "Community feedback awaiting action", to: "/admin/feedback" },
    { k: "enquiriesNew", m: "enquiries", label: "New contact enquiries", to: "/admin/enquiries" },
  ];
  const visibleTodo = todo.filter((t) => can(t.m));

  return (
    <div>
      <AdminPageHeader
        title={`Akwaaba${staff.fullName ? `, ${staff.fullName.split(" ")[0]}` : ""}`}
        description="Live figures from the Foundation's records. Figures show zero until records are added."
      />
      {stats.error && <p className="mb-4 text-sm text-destructive">Couldn't load some figures: {(stats.error as Error).message}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards
          .filter((c) => can(c.m))
          .map((c) => (
            <StatCard key={c.k} label={c.label} value={c.value ?? v(c.k)} icon={c.icon} tone={c.tone ?? "primary"} />
          ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {visibleTodo.length > 0 && (
          <Panel title="Needs attention">
            <ul className="divide-y">
              {visibleTodo.map((t) => (
                <li key={t.k}>
                  <Link to={t.to} className="flex items-center justify-between gap-3 py-3 text-sm hover:text-primary">
                    <span>{t.label}</span>
                    <span className="min-w-8 rounded-full bg-gold-soft px-2.5 py-0.5 text-center text-xs font-bold text-gold-foreground">
                      {v(t.k)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        {can("events") && (
          <Panel title="Upcoming events" actions={<Link to="/admin/events" className="text-xs font-semibold text-teal hover:underline">Manage</Link>}>
            {upcoming.data?.length ? (
              <ul className="divide-y">
                {upcoming.data.map((e) => (
                  <li key={e.id} className="py-3 text-sm">
                    <p className="font-semibold text-primary">{e.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(e.start_at, true)}
                      {e.location ? ` · ${e.location}` : ""} · Registration {humanize(e.registration_status).toLowerCase()}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No upcoming events scheduled.</p>
            )}
          </Panel>
        )}

        {can("audit") && (
          <Panel title="Recent staff activity" actions={<Link to="/admin/audit" className="text-xs font-semibold text-teal hover:underline">Full log</Link>}>
            {activity.data?.length ? (
              <ul className="divide-y">
                {activity.data.map((a) => (
                  <li key={a.id} className="py-2.5 text-sm">
                    <span className="font-medium">{a.actor_email ?? "System"}</span>{" "}
                    <span className="text-muted-foreground">
                      {a.action === "insert" ? "added" : a.action === "update" ? "updated" : "removed"} a {humanize(a.entity_type).toLowerCase()} record
                    </span>
                    <span className="block text-xs text-muted-foreground">{formatDate(a.created_at, true)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-6 text-center text-sm text-muted-foreground">No staff activity recorded yet.</p>
            )}
          </Panel>
        )}
      </div>
    </div>
  );
}
