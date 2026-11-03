import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { AdminPageHeader, Panel, RequireModule } from "@/components/admin/ui";
import { FieldInput, validate, type FieldDef } from "@/components/admin/ResourceManager";
import { orgSettingsQuery } from "@/hooks/use-org-settings";
import type { TablesUpdate } from "@/integrations/supabase/types";

export const Route = createFileRoute("/_authenticated/admin/settings")({ component: Page });

const CONTACT: FieldDef[] = [
  { name: "contact_email", label: "Public contact email", type: "email" },
  { name: "contact_phone", label: "Public phone number", type: "tel" },
  { name: "office_address", label: "Office address", type: "textarea", rows: 2 },
];
const SOCIAL: FieldDef[] = [
  { name: "facebook_url", label: "Facebook", type: "url" },
  { name: "instagram_url", label: "Instagram", type: "url" },
  { name: "x_url", label: "X (Twitter)", type: "url" },
  { name: "tiktok_url", label: "TikTok", type: "url" },
  { name: "youtube_url", label: "YouTube", type: "url" },
  { name: "whatsapp_url", label: "WhatsApp link", type: "url", hint: "e.g. https://wa.me/233…" },
  { name: "linkedin_url", label: "LinkedIn", type: "url" },
];
const ALL = [...CONTACT, ...SOCIAL];

function Page() {
  return (
    <RequireModule module="settings">
      <Settings />
    </RequireModule>
  );
}

function Settings() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery(orgSettingsQuery);
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) setValues(Object.fromEntries(ALL.map((f) => [f.name, (data as Record<string, unknown>)[f.name] ?? ""])));
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const patch = Object.fromEntries(
        ALL.map((f) => [f.name, String(values[f.name] ?? "").trim() || null]),
      ) as TablesUpdate<"organization_settings">;
      const { error } = await supabase.from("organization_settings").update(patch).eq("id", data!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Settings saved. The website now shows the new details.");
      qc.invalidateQueries({ queryKey: orgSettingsQuery.queryKey });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function submit(e: FormEvent) {
    e.preventDefault();
    const errs = validate(ALL, values);
    setErrors(errs);
    if (Object.keys(errs).length === 0) save.mutate();
  }

  if (isLoading) return <p className="flex items-center text-muted-foreground"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading…</p>;
  if (!data) return <p className="text-sm text-destructive">Settings record not found.</p>;

  const set = (n: string, v: unknown) => setValues((x) => ({ ...x, [n]: v }));

  return (
    <form onSubmit={submit} noValidate>
      <AdminPageHeader
        title="Organisation settings"
        description="Contact details and social links shown in the website footer and Contact page. Leave a field blank to show “To be announced”."
        actions={
          <Button type="submit" disabled={save.isPending}>
            {save.isPending && <Loader2 className="animate-spin" />} Save settings
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Contact details">
          <div className="grid gap-4">
            {CONTACT.map((f) => (
              <FieldInput key={f.name} field={f} value={values[f.name]} error={errors[f.name]} onChange={(v) => set(f.name, v)} />
            ))}
          </div>
        </Panel>
        <Panel title="Social media">
          <div className="grid gap-4">
            {SOCIAL.map((f) => (
              <FieldInput key={f.name} field={f} value={values[f.name]} error={errors[f.name]} onChange={(v) => set(f.name, v)} />
            ))}
          </div>
        </Panel>
      </div>
    </form>
  );
}
