import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EMBLEM_URL } from "@/components/site/Logo";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Staff sign in — Arise Ashaiman Foundation" },
      { name: "description", content: "Secure sign-in for authorised Arise Ashaiman Foundation staff." },
      { property: "og:title", content: "Staff sign in — Arise Ashaiman Foundation" },
      { property: "og:description", content: "Secure sign-in for authorised Foundation staff." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "forgot">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
  }, [navigate]);

  async function onSignIn(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) {
      setError(
        error.message.toLowerCase().includes("invalid")
          ? "That email and password don't match a staff account."
          : error.message,
      );
      return;
    }
    navigate({ to: "/admin", replace: true });
  }

  async function onForgot(e: FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
    toast.success("If that email belongs to a staff account, a reset link is on its way.");
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-navy-gradient text-on-dark lg:block">
        <div className="pattern-dots absolute inset-0" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-on-dark-muted hover:text-on-dark">
            <ArrowLeft className="h-4 w-4" /> Back to website
          </Link>
          <div>
            <img src={EMBLEM_URL} alt="" className="mb-8 h-24 w-24 object-contain" />
            <h1 className="font-display text-5xl font-extrabold leading-tight">
              Staff <span className="text-gold">workspace</span>
            </h1>
            <p className="mt-4 max-w-md text-on-dark-muted">
              Manage members, programmes, events, finances and community feedback for Arise Ashaiman Foundation.
            </p>
          </div>
          <p className="font-display text-2xl font-bold text-gold">We Dey Together!</p>
        </div>
      </aside>

      <main className="flex items-center justify-center bg-background px-5 py-12">
        <div className="w-full max-w-sm">
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary lg:hidden">
            <ArrowLeft className="h-4 w-4" /> Back to website
          </Link>
          <div className="mb-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-soft text-teal">
              <Lock className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-extrabold text-primary">
              {mode === "signin" ? "Staff sign in" : "Reset your password"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {mode === "signin"
                ? "Accounts are created by the Foundation's Super Admin. There is no public sign-up."
                : "Enter your staff email and we'll send you a link to set a new password."}
            </p>
          </div>

          {mode === "signin" ? (
            <form onSubmit={onSignIn} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button type="button" className="text-xs font-semibold text-teal hover:underline" onClick={() => { setMode("forgot"); setError(null); }}>
                    Forgot password?
                  </button>
                </div>
                <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className="h-11" />
              </div>
              {error && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={loading || !email || !password}>
                {loading && <Loader2 className="animate-spin" />} Sign in
              </Button>
            </form>
          ) : (
            <form onSubmit={onForgot} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="reset-email">Email</Label>
                <Input id="reset-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
              </div>
              {error && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
              {sent && <p className="rounded-md bg-teal-soft px-3 py-2 text-sm text-accent-foreground">Check your inbox for the reset link.</p>}
              <Button type="submit" size="lg" className="w-full" disabled={loading || !email}>
                {loading && <Loader2 className="animate-spin" />} Send reset link
              </Button>
              <button type="button" className="w-full text-sm font-semibold text-muted-foreground hover:text-primary" onClick={() => { setMode("signin"); setError(null); setSent(false); }}>
                Back to sign in
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
