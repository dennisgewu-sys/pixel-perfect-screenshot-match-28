import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a new password — Arise Ashaiman Foundation" },
      { name: "description", content: "Choose a new password for your Arise Ashaiman Foundation staff account." },
      { property: "og:title", content: "Set a new password — Arise Ashaiman Foundation" },
      { property: "og:description", content: "Choose a new password for your staff account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isRecovery = window.location.hash.includes("type=recovery");
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data: s }) => {
      if (s.session && isRecovery) setReady(true);
      else if (s.session) setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    toast.success("Password updated.");
    navigate({ to: "/admin", replace: true });
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary px-5">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-extrabold text-primary">Set a new password</h1>
        {!ready ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Open this page from the link in your password reset email. If the link has expired,{" "}
            <Link to="/auth" className="font-semibold text-teal hover:underline">request a new one</Link>.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="pw">New password</Label>
              <Input id="pw" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw2">Confirm new password</Label>
              <Input id="pw2" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-11" />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading && <Loader2 className="animate-spin" />} Save password
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}
