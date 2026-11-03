import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Download, Loader2, Printer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminPageHeader, Panel, RequireModule, StatCard } from "@/components/admin/ui";
import { canAccess } from "@/lib/admin/roles";
import { useStaff } from "@/lib/admin/staff-context";
import { byGroup, byMonth, countBy, sumAmounts } from "@/lib/admin/reports";
import { downloadCsv } from "@/lib/admin/csv";
import { FEEDBACK_CATEGORIES } from "@/lib/content";
import { formatGHS, humanize } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/admin/reports")({ component: Page });

function Page() {
  return (
    <RequireModule module="reports">
      <Reports />
    </RequireModule>
  );
}

const monthName = (m: string) => new Date(`${m}-01T00:00:00`).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

function Reports() {
  const staff = useStaff();
  const year = new Date().getFullYear();
  const [from, setFrom] = useState(`${year}-01-01`);
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const showFinance = canAccess("donations", staff.roles);
  const showOrg = canAccess("feedback", staff.roles);

  return (
    <div>
      <AdminPageHeader
        title="Reports"
        description="Summaries calculated from live records for the period you choose."
        actions={
          <Button variant="outline" onClick={() => window.print()}>
            <Printer /> Print
          </Button>
        }
      />
      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-2xl border bg-card p-4 shadow-soft">
        <div className="space-y-1.5">
          <Label htmlFor="r-from">From</Label>
          <Input id="r-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="r-to">To</Label>
          <Input id="r-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </div>
      <div className="space-y-8">
        {showFinance && <FinanceReport from={from} to={to} />}
        {showOrg && <OrgReport from={from} to={to} />}
      </div>
    </div>
  );
}

function FinanceReport({ from, to }: { from: string; to: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "report", "finance", from, to],
    queryFn: async () => {
      const [d, e] = await Promise.all([
        supabase
          .from("donations")
          .select("amount,donation_date,payment_method,purpose,donor_name,is_anonymous,reference")
          .eq("is_archived", false)
          .gte("donation_date", from)
          .lte("donation_date", to),
        supabase
          .from("expenses")
          .select("amount,expense_date,category,payment_method,description,payee,reference")
          .eq("is_archived", false)
          .gte("expense_date", from)
          .lte("expense_date", to),
      ]);
      if (d.error) throw d.error;
      if (e.error) throw e.error;
      return { donations: d.data, expenses: e.data };
    },
  });

  if (isLoading) return <p className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculating…</p>;
  if (error || !data) return <p className="text-sm text-destructive">{(error as Error)?.message}</p>;

  const income = sumAmounts(data.donations);
  const spend = sumAmounts(data.expenses);
  const dm = byMonth(data.donations.map((x) => ({ amount: x.amount, date: x.donation_date })));
  const em = byMonth(data.expenses.map((x) => ({ amount: x.amount, date: x.expense_date })));
  const months = Array.from(new Set([...dm.map((x) => x.month), ...em.map((x) => x.month)])).sort();
  const byMethod = byGroup(data.donations.map((x) => ({ amount: x.amount, date: x.donation_date, group: humanize(x.payment_method) })));
  const byPurpose = byGroup(data.donations.map((x) => ({ amount: x.amount, date: x.donation_date, group: x.purpose })));
  const byCategory = byGroup(data.expenses.map((x) => ({ amount: x.amount, date: x.expense_date, group: x.category })));

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-extrabold text-primary">Financial summary</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            downloadCsv("financial-report", [
              ...data.donations.map((d) => ({ type: "Donation", date: d.donation_date, amount: d.amount, who: d.is_anonymous ? "Anonymous" : d.donor_name, what: d.purpose, method: d.payment_method, ref: d.reference })),
              ...data.expenses.map((x) => ({ type: "Expense", date: x.expense_date, amount: x.amount, who: x.payee, what: x.description, method: x.payment_method, ref: x.reference })),
            ], [
              { label: "Type", value: (r) => r.type },
              { label: "Date", value: (r) => r.date },
              { label: "Amount (GHS)", value: (r) => r.amount },
              { label: "Donor / payee", value: (r) => r.who },
              { label: "Purpose / description", value: (r) => r.what },
              { label: "Method", value: (r) => r.method },
              { label: "Reference", value: (r) => r.ref },
            ])
          }
        >
          <Download /> Export CSV
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Donations received" value={formatGHS(income)} hint={`${data.donations.length} records`} tone="teal" />
        <StatCard label="Expenses" value={formatGHS(spend)} hint={`${data.expenses.length} records`} tone="gold" />
        <StatCard label="Balance for period" value={formatGHS(income - spend)} />
      </div>
      <Panel title="By month">
        {months.length === 0 ? (
          <p className="text-sm text-muted-foreground">No financial records in this period.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="py-2">Month</th><th className="py-2 text-right">Donations</th><th className="py-2 text-right">Expenses</th><th className="py-2 text-right">Balance</th></tr>
            </thead>
            <tbody className="divide-y tabular-nums">
              {months.map((m) => {
                const a = dm.find((x) => x.month === m)?.total ?? 0;
                const b = em.find((x) => x.month === m)?.total ?? 0;
                return (
                  <tr key={m}>
                    <td className="py-2">{monthName(m)}</td>
                    <td className="py-2 text-right">{formatGHS(a)}</td>
                    <td className="py-2 text-right">{formatGHS(b)}</td>
                    <td className="py-2 text-right font-semibold">{formatGHS(a - b)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Panel>
      <div className="grid gap-4 lg:grid-cols-3">
        <GroupPanel title="Donations by method" rows={byMethod} />
        <GroupPanel title="Donations by purpose" rows={byPurpose} />
        <GroupPanel title="Expenses by category" rows={byCategory} />
      </div>
    </section>
  );
}

function GroupPanel({ title, rows }: { title: string; rows: { group: string; total: number; count: number }[] }) {
  return (
    <Panel title={title}>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No records.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {rows.map((r) => (
            <li key={r.group} className="flex justify-between gap-3">
              <span>{r.group} <span className="text-xs text-muted-foreground">({r.count})</span></span>
              <span className="font-semibold tabular-nums">{formatGHS(r.total)}</span>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function OrgReport({ from, to }: { from: string; to: string }) {
  const end = `${to}T23:59:59`;
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin", "report", "org", from, to],
    queryFn: async () => {
      const [m, v, f, a, p, r, att] = await Promise.all([
        supabase.from("members").select("status,community").gte("created_at", from).lte("created_at", end),
        supabase.from("volunteer_applications").select("status,areas_of_interest").gte("created_at", from).lte("created_at", end),
        supabase.from("community_feedback").select("status,category").gte("created_at", from).lte("created_at", end),
        supabase.from("programme_applications").select("status,programme_id").gte("created_at", from).lte("created_at", end),
        supabase.from("programmes").select("id,title"),
        supabase.from("event_registrations").select("status").gte("created_at", from).lte("created_at", end),
        supabase.from("attendance").select("attended").eq("is_archived", false).gte("created_at", from).lte("created_at", end),
      ]);
      for (const x of [m, v, f, a, p, r, att]) if (x.error) throw x.error;
      return { members: m.data!, volunteers: v.data!, feedback: f.data!, apps: a.data!, programmes: p.data!, regs: r.data!, attendance: att.data! };
    },
  });

  if (isLoading) return <p className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculating…</p>;
  if (error || !data) return <p className="text-sm text-destructive">{(error as Error)?.message}</p>;

  const cat = (v: string) => FEEDBACK_CATEGORIES.find((c) => c.value === v)?.label ?? v;
  const prog = (id: string | null) => data.programmes.find((p) => p.id === id)?.title ?? "General interest";
  const areas = countBy(data.volunteers.flatMap((v) => v.areas_of_interest ?? []), (x) => x);

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-extrabold text-primary">Organisational summary</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New member applications" value={data.members.length} />
        <StatCard label="Volunteer applications" value={data.volunteers.length} tone="teal" />
        <StatCard label="Community feedback received" value={data.feedback.length} tone="gold" />
        <StatCard label="Event check-ins" value={data.attendance.filter((x) => x.attended).length} hint={`${data.regs.length} registrations`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <CountPanel title="Members by status" rows={countBy(data.members, (x) => humanize(x.status))} />
        <CountPanel title="Members by community" rows={countBy(data.members, (x) => x.community)} />
        <CountPanel title="Volunteer areas of interest" rows={areas} />
        <CountPanel title="Feedback by category" rows={countBy(data.feedback, (x) => cat(x.category))} />
        <CountPanel title="Feedback by status" rows={countBy(data.feedback, (x) => humanize(x.status))} />
        <CountPanel title="Applications by programme" rows={countBy(data.apps, (x) => prog(x.programme_id))} />
      </div>
    </section>
  );
}

function CountPanel({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <Panel title={title}>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No records in this period.</p>
      ) : (
        <ul className="space-y-2.5 text-sm">
          {rows.slice(0, 10).map((r) => (
            <li key={r.label}>
              <div className="flex justify-between gap-3">
                <span className="truncate">{r.label}</span>
                <span className="font-semibold tabular-nums">{r.count}</span>
              </div>
              <div className="mt-1 h-1.5 rounded-full bg-muted">
                <div className="h-1.5 rounded-full bg-teal" style={{ width: `${(r.count / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
