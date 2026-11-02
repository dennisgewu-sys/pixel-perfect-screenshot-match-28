import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Download, Loader2, Search, UserPlus, XCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminPageHeader, Panel, RequireModule, StatCard, selectClass } from "@/components/admin/ui";
import { eventOptionsQuery } from "@/lib/admin/queries";
import { downloadCsv } from "@/lib/admin/csv";
import { formatDate, humanize } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/registrations")({ component: Page });

const REG_STATUSES = ["registered", "confirmed", "waitlisted", "cancelled"] as const;

function Page() {
  return (
    <RequireModule module="registrations">
      <Registrations />
    </RequireModule>
  );
}

function Registrations() {
  const qc = useQueryClient();
  const { data: events = [], isLoading: eventsLoading } = useQuery(eventOptionsQuery);
  const [eventId, setEventId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [walkIn, setWalkIn] = useState("");
  const selected = eventId || events[0]?.id || "";
  const event = events.find((e) => e.id === selected);

  const regs = useQuery({
    queryKey: ["admin", "event_registrations", selected],
    enabled: !!selected,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_registrations")
        .select("*")
        .eq("event_id", selected)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });
  const att = useQuery({
    queryKey: ["admin", "attendance", selected],
    enabled: !!selected,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("event_id", selected)
        .eq("is_archived", false)
        .order("created_at");
      if (error) throw error;
      return data;
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "event_registrations", selected] });
    qc.invalidateQueries({ queryKey: ["admin", "attendance", selected] });
    qc.invalidateQueries({ queryKey: ["admin-dashboard"] });
  };

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("event_registrations").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Registration updated.");
      refresh();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const checkIn = useMutation({
    mutationFn: async (input: { name: string; registrationId?: string; existingId?: string; attended: boolean }) => {
      if (input.existingId) {
        const { error } = await supabase
          .from("attendance")
          .update({ attended: input.attended, checked_in_at: input.attended ? new Date().toISOString() : null })
          .eq("id", input.existingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("attendance").insert({
          event_id: selected,
          attendee_name: input.name,
          registration_id: input.registrationId ?? null,
          attended: input.attended,
          checked_in_at: input.attended ? new Date().toISOString() : null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => refresh(),
    onError: (e: Error) => toast.error(e.message),
  });

  const attByReg = useMemo(() => new Map((att.data ?? []).filter((a) => a.registration_id).map((a) => [a.registration_id!, a])), [att.data]);
  const walkIns = (att.data ?? []).filter((a) => !a.registration_id);
  const q = search.trim().toLowerCase();
  const list = (regs.data ?? []).filter(
    (r) => !q || r.full_name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || (r.phone ?? "").includes(q),
  );
  const active = (regs.data ?? []).filter((r) => r.status !== "cancelled").length;
  const present = (att.data ?? []).filter((a) => a.attended).length;

  function addWalkIn(e: FormEvent) {
    e.preventDefault();
    const name = walkIn.trim();
    if (name.length < 2) return;
    checkIn.mutate({ name, attended: true }, { onSuccess: () => { setWalkIn(""); toast.success(`${name} checked in.`); } });
  }

  function exportCsv() {
    downloadCsv(`registrations-${event?.title ?? "event"}`, regs.data ?? [], [
      { label: "Name", value: (r) => r.full_name },
      { label: "Email", value: (r) => r.email },
      { label: "Phone", value: (r) => r.phone },
      { label: "Status", value: (r) => r.status },
      { label: "Attended", value: (r) => (attByReg.get(r.id)?.attended ? "Yes" : "No") },
      { label: "Registered", value: (r) => r.created_at },
    ]);
  }

  return (
    <div>
      <AdminPageHeader
        title="Registrations & attendance"
        description="See who registered for each event, confirm places, and check people in on the day."
        actions={
          <Button variant="outline" onClick={exportCsv} disabled={!regs.data?.length}>
            <Download /> Export CSV
          </Button>
        }
      />

      {eventsLoading ? (
        <p className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading events…</p>
      ) : events.length === 0 ? (
        <Panel>
          <p className="py-8 text-center text-sm text-muted-foreground">No events yet. Create one under Events first.</p>
        </Panel>
      ) : (
        <>
          <div className="mb-5">
            <label htmlFor="event-pick" className="mb-1.5 block text-sm font-semibold">Event</label>
            <select id="event-pick" className={cn(selectClass, "max-w-xl")} value={selected} onChange={(e) => setEventId(e.target.value)}>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} — {formatDate(ev.start_at)}{ev.is_archived ? " (archived)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <StatCard label="Registered" value={active} hint={event?.capacity ? `Capacity ${event.capacity}` : "No capacity limit"} />
            <StatCard label="Checked in" value={present} tone="teal" />
            <StatCard label="Walk-ins" value={walkIns.length} tone="gold" />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <Panel title="Registrations" className="xl:col-span-2">
              <div className="relative mb-4">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input aria-label="Search registrations" placeholder="Search name, email or phone…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
              </div>
              {regs.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading…</p>
              ) : list.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">No registrations for this event yet.</p>
              ) : (
                <ul className="divide-y">
                  {list.map((r) => {
                    const a = attByReg.get(r.id);
                    return (
                      <li key={r.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="font-semibold text-primary">{r.full_name}</p>
                          <p className="truncate text-xs text-muted-foreground">{r.email}{r.phone ? ` · ${r.phone}` : ""}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            aria-label={`Status for ${r.full_name}`}
                            className={cn(selectClass, "h-8 w-36 text-xs")}
                            value={r.status}
                            onChange={(e) => setStatus.mutate({ id: r.id, status: e.target.value })}
                          >
                            {REG_STATUSES.map((s) => (
                              <option key={s} value={s}>{humanize(s)}</option>
                            ))}
                          </select>
                          <Button
                            size="sm"
                            variant={a?.attended ? "teal" : "outline"}
                            disabled={checkIn.isPending || r.status === "cancelled"}
                            onClick={() => checkIn.mutate({ name: r.full_name, registrationId: r.id, existingId: a?.id, attended: !a?.attended })}
                          >
                            {a?.attended ? <CheckCircle2 /> : <XCircle />} {a?.attended ? "Present" : "Check in"}
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>

            <Panel title="Walk-in attendees">
              <form onSubmit={addWalkIn} className="mb-4 flex gap-2">
                <Input aria-label="Walk-in name" placeholder="Full name" value={walkIn} onChange={(e) => setWalkIn(e.target.value)} />
                <Button type="submit" disabled={walkIn.trim().length < 2 || checkIn.isPending}>
                  <UserPlus /> Add
                </Button>
              </form>
              {walkIns.length === 0 ? (
                <p className="text-sm text-muted-foreground">People who attend without registering can be added here.</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {walkIns.map((w) => (
                    <li key={w.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                      <span className="font-medium">{w.attendee_name}</span>
                      <span className="text-xs text-muted-foreground">{w.checked_in_at ? formatDate(w.checked_in_at, true) : ""}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
